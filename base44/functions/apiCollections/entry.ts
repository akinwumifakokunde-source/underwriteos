import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";

// Collections workflow — turns the post-disbursement book into an active
// recovery operation. Segments delinquent loans by days-past-due stage, logs
// outreach actions, sends borrower reminders, and tracks recovery.
//
// overview      — segment the delinquent book + recovery stats
// list_actions  — list collection actions (optionally for one outcome)
// log_action    — record a manual outreach / recovery action
// send_reminder — email a borrower and log the action in one step
// update_action — patch an action's result / amount recovered
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "overview";

    if (action === "overview") requireScope(ctx, "outcomes:read");
    if (["list_actions", "log_action", "send_reminder", "update_action"].includes(action)) {
      requireScope(ctx, "outcomes:write");
    }

    const STAGE_OF = (dpd: number) =>
      dpd >= 90 ? "critical" : dpd >= 60 ? "late" : dpd >= 30 ? "early" : "pre_delinquent";

    if (action === "overview") {
      const [outcomes, actions] = await Promise.all([
        base44.asServiceRole.entities.LoanOutcome.filter({ organization_id }, "-observed_at", 500),
        base44.asServiceRole.entities.CollectionAction.filter({ organization_id }, "-created_date", 500),
      ]);

      const stages = ["pre_delinquent", "early", "late", "critical"];
      const stageLabels = { pre_delinquent: "Pre-delinquent (1–29)", early: "Early (30–59)", late: "Late (60–89)", critical: "Critical (90+)" };
      const delinquent = outcomes.filter((o: any) => o.status === "late" || o.status === "defaulted");
      const segments = stages.map((stage) => {
        const inStage = delinquent.filter((o: any) => STAGE_OF(o.days_past_due || 0) === stage);
        const exposure = inStage.reduce((s: number, o: any) => s + (o.loan_amount || 0), 0);
        return { stage, label: stageLabels[stage], count: inStage.length, exposure };
      });

      const totalRecovered = actions.reduce((s: number, a: any) => s + (a.amount_recovered || 0), 0);
      const currency = outcomes[0]?.loan_currency || "GBP";
      const actionsByType: Record<string, number> = {};
      for (const a of actions) actionsByType[a.action_type] = (actionsByType[a.action_type] || 0) + 1;

      const resolved = delinquent.filter((o: any) => o.status === "defaulted").length;
      const summary = {
        total_outcomes: outcomes.length,
        performing: outcomes.filter((o: any) => o.status === "active").length,
        delinquent: delinquent.length,
        defaulted: outcomes.filter((o: any) => o.status === "defaulted").length,
        repaid: outcomes.filter((o: any) => o.status === "repaid").length,
        exposure_at_risk: delinquent.reduce((s: number, o: any) => s + (o.loan_amount || 0), 0),
        total_recovered: totalRecovered,
        recovery_rate: delinquent.length > 0 ? totalRecovered / (delinquent.reduce((s: number, o: any) => s + (o.loan_amount || 0), 0) || 1) : 0,
        currency,
        total_actions: actions.length,
        actions_by_type: actionsByType,
      };

      return apiSuccess({ summary, segments }, 200);
    }

    if (action === "list_actions") {
      const filter: any = { organization_id };
      if (body.outcome_id) filter.outcome_id = body.outcome_id;
      if (body.application_id) filter.application_id = body.application_id;
      const actions = await base44.asServiceRole.entities.CollectionAction.filter(filter, "-created_date", 200);
      return apiSuccess({ actions }, 200);
    }

    if (action === "log_action") {
      const { application_id, borrower_id, outcome_id, action_type, channel, subject, body: actionBody, result, amount_recovered, days_past_due, note } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const validTypes = ["reminder_email", "sms", "phone_call", "letter", "settlement_offer", "payment_plan", "write_off", "manual_note"];
      if (!validTypes.includes(action_type)) return apiError("VALIDATION_ERROR", `action_type must be one of ${validTypes.join(", ")}.`, 400);

      const stage = STAGE_OF(Number(days_past_due) || 0);
      const created = await base44.asServiceRole.entities.CollectionAction.create({
        organization_id,
        application_id,
        borrower_id: borrower_id || null,
        outcome_id: outcome_id || null,
        action_type,
        stage,
        channel: channel || (action_type === "reminder_email" ? "email" : action_type === "sms" ? "sms" : action_type === "phone_call" ? "phone" : action_type === "letter" ? "letter" : "internal"),
        status: "completed",
        subject: subject || null,
        body: actionBody || note || null,
        result: result || "pending",
        amount_recovered: Number(amount_recovered) || 0,
        performed_by: actor,
        performed_at: new Date().toISOString(),
      });

      await audit(base44, organization_id, "collection.action_logged", { application_id, actor, actor_type, details: { action_type, stage, result } });
      return apiSuccess({ action: created }, 201);
    }

    if (action === "send_reminder") {
      const { application_id, outcome_id, borrower_id, subject, body: emailBody, days_past_due } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);

      // Resolve borrower + email
      let borrower: any = null;
      if (borrower_id) {
        const bs = await base44.asServiceRole.entities.Borrower.filter({ id: borrower_id, organization_id }, "-created_date", 1);
        borrower = bs[0] || null;
      }
      if (!borrower || !borrower.email) return apiError("VALIDATION_ERROR", "Borrower has no email address on file.", 400);

      const stage = STAGE_OF(Number(days_past_due) || 0);
      const finalSubject = subject || "Payment reminder from your lender";
      const finalBody = emailBody || `Dear ${borrower.first_name},\n\nOur records show your loan account is past due. Please contact us to arrange payment or discuss options.\n\nKind regards,\nCollections team`;

      let sendStatus = "sent";
      let sendError: string | null = null;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: borrower.email,
          subject: finalSubject,
          text: finalBody,
        });
      } catch (e) {
        sendStatus = "failed";
        sendError = e?.message || "Email send failed";
      }

      const created = await base44.asServiceRole.entities.CollectionAction.create({
        organization_id,
        application_id,
        borrower_id: borrower_id || borrower?.id || null,
        outcome_id: outcome_id || null,
        action_type: "reminder_email",
        stage,
        channel: "email",
        status: sendStatus,
        subject: finalSubject,
        body: finalBody,
        result: "pending",
        amount_recovered: 0,
        performed_by: actor,
        performed_at: new Date().toISOString(),
      });

      await audit(base44, organization_id, "collection.reminder_sent", { application_id, actor, actor_type, details: { stage, status: sendStatus, borrower_email: borrower.email } });
      if (sendStatus === "failed") return apiError("EMAIL_FAILED", sendError || "Failed to send reminder email.", 502, { action: created });
      return apiSuccess({ action: created }, 201);
    }

    if (action === "update_action") {
      const { action_id, result, amount_recovered, status } = body;
      if (!action_id) return apiError("VALIDATION_ERROR", "action_id is required.", 400);
      const existing = await base44.asServiceRole.entities.CollectionAction.filter({ id: action_id, organization_id }, "-created_date", 1);
      if (existing.length === 0) return apiError("NOT_FOUND", "Collection action not found.", 404);
      const update: any = {};
      if (result) update.result = result;
      if (amount_recovered != null) update.amount_recovered = Number(amount_recovered) || 0;
      if (status) update.status = status;
      const updated = await base44.asServiceRole.entities.CollectionAction.update(action_id, update);
      await audit(base44, organization_id, "collection.action_updated", { action_id, actor, actor_type, details: update });
      return apiSuccess({ action: updated }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use overview|list_actions|log_action|send_reminder|update_action.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}