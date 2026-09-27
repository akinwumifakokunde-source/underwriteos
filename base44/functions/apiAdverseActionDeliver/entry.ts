import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit, genId } from "../../shared/utils.ts";

// POST — Deliver the adverse-action notice to the borrower.
// Actions:
//   send_email       — Email the notice to the borrower's email address.
//   create_share_link — Generate a public shareable link token for the notice.
//   get_notice       — Public (no auth) lookup by share_token, returns the notice content.

function buildNoticeHtml(notice: any, borrowerName: string): string {
  const linesHtml = (notice.lines || []).map((ln: any) => {
    if (ln.kind === "sp") return "";
    if (ln.kind === "h") return `<h2 style="font-size:18px;font-weight:600;color:#0f172a;margin:0 0 8px;">${ln.text}</h2>`;
    if (ln.kind === "li") return `<li style="margin-bottom:4px;color:#475569;">${ln.text}</li>`;
    if (ln.kind === "m") return `<p style="font-size:12px;color:#94a3b8;margin:2px 0;">${ln.text}</p>`;
    return `<p style="font-size:13px;color:#475569;line-height:1.6;margin:8px 0;">${ln.text}</p>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="background:#0f172a;padding:20px 24px;border-radius:12px 12px 0 0;">
      <div style="color:#fff;font-size:15px;font-weight:600;">CreditDecide</div>
      <div style="color:#94a3b8;font-size:11px;margin-top:2px;">Regulatory Notice — Evidence-Backed</div>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px;">
      <p style="font-size:11px;color:#64748b;font-style:italic;margin:0 0 16px;">${notice.framework || ""}</p>
      ${linesHtml}
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">This notice was generated automatically by CreditDecide and is retained in the decision audit trail.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const { action } = body;

    // Public action: get_notice — no auth required, looks up by share_token.
    if (action === "get_notice") {
      const { share_token } = body;
      if (!share_token) return apiError("VALIDATION_ERROR", "share_token is required.", 400);

      const decisions = await base44.asServiceRole.entities.UnderwritingDecision.filter(
        { "adverse_action_delivery.share_token": share_token },
        "-created_date",
        1
      );
      if (decisions.length === 0) return apiError("NOT_FOUND", "Notice not found or link expired.", 404);
      const dec = decisions[0];
      if (!dec.adverse_action_notice) return apiError("NOT_FOUND", "No adverse-action notice on this decision.", 404);

      // Load borrower + application for display context.
      const apps = await base44.asServiceRole.entities.Application.filter({ id: dec.application_id }, "-created_date", 1);
      const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: apps[0]?.borrower_id }, "-created_date", 1);

      // Record view timestamp (fire-and-forget).
      try {
        const existing = dec.adverse_action_delivery || {};
        await base44.asServiceRole.entities.UnderwritingDecision.update(dec.id, {
          adverse_action_delivery: { ...existing, share_token_viewed_at: new Date().toISOString() }
        });
      } catch {}

      return apiSuccess({
        notice: dec.adverse_action_notice,
        decision: { decision: dec.decision, decision_timestamp: dec.decision_timestamp },
        application: apps[0] ? {
          application_number: apps[0].application_number,
          loan_amount: apps[0].loan_amount,
          loan_currency: apps[0].loan_currency,
          market: apps[0].market,
          product_type: apps[0].product_type
        } : null,
        borrower: borrowers[0] ? {
          first_name: borrowers[0].first_name,
          last_name: borrowers[0].last_name
        } : null
      }, 200);
    }

    // Authenticated actions below.
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    requireScope(ctx, "applications:write");

    const { decision_id } = body;
    if (!decision_id) return apiError("VALIDATION_ERROR", "decision_id is required.", 400);

    const decisions = await base44.asServiceRole.entities.UnderwritingDecision.filter(
      { id: decision_id, organization_id },
      "-created_date",
      1
    );
    if (decisions.length === 0) return apiError("DECISION_NOT_FOUND", "Decision not found.", 404);
    const dec = decisions[0];

    if (!dec.adverse_action_notice) {
      return apiError("NO_NOTICE", "This decision has no adverse-action notice (approved decisions don't require one).", 400);
    }

    // Load borrower for email address.
    const apps = await base44.asServiceRole.entities.Application.filter({ id: dec.application_id, organization_id }, "-created_date", 1);
    const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: apps[0]?.borrower_id, organization_id }, "-created_date", 1);
    const borrower = borrowers[0];
    const borrowerEmail = borrower?.email;
    const borrowerName = borrower ? `${borrower.first_name || ""} ${borrower.last_name || ""}`.trim() || "Applicant" : "Applicant";

    if (action === "send_email") {
      if (!borrowerEmail) return apiError("NO_EMAIL", "Borrower has no email address on file.", 400);

      const notice = dec.adverse_action_notice;
      const html = buildNoticeHtml(notice, borrowerName);
      const subject = `Important: Notice of Adverse Action — ${apps[0]?.application_number || dec.application_id.slice(-8)}`;

      let emailStatus: string = "sent";
      let emailError: string | null = null;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: borrowerEmail,
          subject,
          body: notice.text,
          html,
          from_name: "CreditDecide"
        });
      } catch (e: any) {
        emailStatus = "failed";
        emailError = e.message || "Email delivery failed";
      }

      const existing = dec.adverse_action_delivery || {};
      await base44.asServiceRole.entities.UnderwritingDecision.update(dec.id, {
        adverse_action_delivery: {
          ...existing,
          email_status: emailStatus,
          email_sent_at: new Date().toISOString(),
          email_error: emailError,
          email_sent_to: borrowerEmail
        }
      });

      await audit(base44, organization_id, "adverse_action.email_sent", {
        actor, actor_type, endpoint: "POST /v1/adverse-action-deliver",
        details: { decision_id: dec.id, application_id: dec.application_id, email_status: emailStatus, sent_to: borrowerEmail }
      });

      if (emailStatus === "failed") {
        return apiError("EMAIL_FAILED", `Failed to send email: ${emailError}`, 500);
      }

      return apiSuccess({ email_status: "sent", email_sent_to: borrowerEmail, email_sent_at: new Date().toISOString() }, 200);
    }

    if (action === "create_share_link") {
      const token = genId("ntc", 24);
      const existing = dec.adverse_action_delivery || {};
      await base44.asServiceRole.entities.UnderwritingDecision.update(dec.id, {
        adverse_action_delivery: {
          ...existing,
          share_token: token,
          share_token_created_at: new Date().toISOString()
        }
      });

      await audit(base44, organization_id, "adverse_action.share_link_created", {
        actor, actor_type, endpoint: "POST /v1/adverse-action-deliver",
        details: { decision_id: dec.id, application_id: dec.application_id }
      });

      return apiSuccess({ share_token: token, share_url: `/notice/${token}` }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Unknown action: ${action}`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}