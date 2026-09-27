import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, audit } from "../../shared/utils.ts";
import { processDocument } from "../../shared/documentProcessing.ts";
import { runAnalyze } from "../../shared/analyzePipeline.ts";
import { runUnderwrite } from "../../shared/underwritePipeline.ts";

// Public borrower self-service portal. No auth — the borrower proves ownership
// by providing their application number AND the email they applied with. Only
// borrower-facing fields are returned; internal risk scores, PD, evidence and
// lender-only reasons are never exposed. Declined applications link to the
// regulator-compliant adverse-action notice (if one was delivered).
//
// lookup — verify application_number + email, return status, decision, timeline,
//          open information requests and document checklist.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const action = body.action || "lookup";

    const applicationNumber = (body.application_number || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    if (!applicationNumber) return apiError("VALIDATION_ERROR", "Application number is required.", 400);
    if (!email) return apiError("VALIDATION_ERROR", "Email is required.", 400);

    const apps = await base44.asServiceRole.entities.Application.filter({ application_number: applicationNumber }, "-created_date", 5);
    if (apps.length === 0) return apiError("NOT_FOUND", "We couldn't find an application with that number. Please check and try again.", 404);
    const app = apps[0];

    const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id }, "-created_date", 1);
    const borrower = borrowers[0];
    if (!borrower || !borrower.email || borrower.email.toLowerCase() !== email) {
      return apiError("NOT_FOUND", "We couldn't find an application matching those details. Please check and try again.", 404);
    }

    // Borrower uploads a document from the portal. The file is uploaded client-side
    // (UploadPublicFile) and only the resulting URL is sent here; we create the
    // Document record and, when tied to an information request, mark it received.
    if (action === "submit_document") {
      const documentType = (body.document_type || "").trim();
      const fileUrl = (body.file_url || "").trim();
      const fileName = (body.file_name || "").trim();
      const informationRequestId = body.information_request_id || null;
      const ALLOWED_TYPES = ["credit_report","bank_statement","payslip","identity","employment","tax","financial_statement","proof_of_address","other_financial","other"];
      if (!documentType || !ALLOWED_TYPES.includes(documentType)) return apiError("VALIDATION_ERROR", "Unsupported document type.", 400);
      if (!fileUrl) return apiError("VALIDATION_ERROR", "File is required.", 400);

      let infoRequest = null;
      if (informationRequestId) {
        const reqs = await base44.asServiceRole.entities.InformationRequest.filter({ id: informationRequestId, application_id: app.id }, "-created_date", 1);
        infoRequest = reqs[0] || null;
        if (!infoRequest) return apiError("NOT_FOUND", "Information request not found for this application.", 404);
      }

      const doc = await base44.asServiceRole.entities.Document.create({
        organization_id: app.organization_id,
        application_id: app.id,
        document_type: documentType,
        file_url: fileUrl,
        file_name: fileName || null,
        file_format: inferFormat(fileName || fileUrl),
        status: "uploaded",
      });

      if (infoRequest) {
        await base44.asServiceRole.entities.InformationRequest.update(informationRequestId, { status: "received" });
      }

      await audit(base44, app.organization_id, "borrower.document_uploaded", {
        application_id: app.id,
        actor: "borrower",
        actor_type: "user",
        endpoint: "POST /status",
        details: { document_id: doc.id, document_type: documentType, information_request_id: informationRequestId }
      });

      // Process the uploaded document (extraction + profiles + evidence), then
      // re-run the analysis + underwriting pipeline so the decision reflects the
      // new information. Best-effort: the upload succeeds regardless; failures
      // here just mean the lender can reprocess from the workspace.
      let processed = false;
      let decisionRerun = false;
      try {
        await processDocument(base44, doc, app.organization_id, "borrower", "user");
        processed = true;
        await runAnalyze(base44, app.id, app.organization_id, "borrower", "user");
        await runUnderwrite(base44, app.id, app.organization_id, "borrower", "user", { policy_id: app.policy_id });
        decisionRerun = true;
      } catch (e) {
        // non-fatal — the document is still recorded for the lender
      }

      // Notify the lender that the borrower responded. On by default: when no
      // alerts email is configured on the organization, fall back to the org's
      // admin users so borrower responses never go unnoticed.
      let lenderNotified = false;
      try {
        const orgs = await base44.asServiceRole.entities.Organization.filter({ id: app.organization_id }, "-created_date", 1);
        const alertsEmail = orgs[0]?.settings?.alerts_email;
        let recipients: string[] = [];
        if (alertsEmail) {
          recipients = [alertsEmail];
        } else {
          const admins = await base44.asServiceRole.entities.User.filter({ organization_id: app.organization_id, role: "admin" }, "-created_date", 20);
          recipients = admins.map((u: any) => u.email).filter((e: any) => !!e);
        }
        if (recipients.length > 0) {
          const proto = req.headers.get("x-forwarded-proto") || "https";
          const host = req.headers.get("host");
          const origin = host ? `${proto}://${host}` : "https://oldme.base44.app";
          const appLink = `${origin}/applications/${app.id}`;
          const text = [
            `A borrower has uploaded a document for application ${app.application_number}.`,
            ``,
            `Document: ${fileName || documentType}`,
            infoRequest ? `In response to request: ${infoRequest.item}` : null,
            ``,
            processed ? "The document has been processed and the decision re-evaluated." : "The document was received and will be processed shortly.",
            decisionRerun ? "Log in to review the updated decision." : null,
            ``,
            `Open application: ${appLink}`,
          ].filter((x: any) => x !== null).join("\n");
          for (const to of recipients) {
            try {
              await base44.asServiceRole.integrations.Core.SendEmail({ to, subject: `Borrower responded — ${app.application_number}`, text });
            } catch {}
          }
          lenderNotified = true;
        }
      } catch (e) {
        // non-fatal
      }

      return apiSuccess({ document_id: doc.id, information_request_updated: !!infoRequest, processed, decision_rerun: decisionRerun, lender_notified: lenderNotified }, 201);
    }

    if (action !== "lookup") return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use lookup or submit_document.`, 400);

    // Parallel loads for the portal view
    const [decisions, infoRequests, documents] = await Promise.all([
      base44.asServiceRole.entities.UnderwritingDecision.filter({ application_id: app.id }, "-decision_timestamp", 1),
      base44.asServiceRole.entities.InformationRequest.filter({ application_id: app.id }, "-created_date", 50),
      base44.asServiceRole.entities.Document.filter({ application_id: app.id }, "-created_date", 50),
    ]);
    const decision = decisions[0] || null;

    const DOC_LABELS: Record<string, string> = {
      credit_report: "Credit report",
      bank_statement: "Bank statement",
      payslip: "Payslip",
      identity: "Identity document",
      employment: "Employment proof",
      tax: "Tax document",
      financial_statement: "Financial statement",
      proof_of_address: "Proof of address",
      other_financial: "Financial document",
      other: "Document",
    };
    const DOC_STATUS: Record<string, string> = {
      uploaded: "Received",
      processing: "Processing",
      processed: "Verified",
      verified: "Verified",
      needs_review: "Needs review",
      failed: "Issue",
    };
    const INFO_STATUS: Record<string, string> = {
      requested: "Requested",
      sent: "Sent",
      viewed: "Awaiting your response",
      received: "Received",
      verified: "Verified",
      resolved: "Resolved",
    };

    const STATUS_LABEL: Record<string, string> = {
      draft: "Started",
      data_collection: "Information & documents",
      analyzing: "Under review",
      underwriting: "Under review",
      completed: "Completed",
      failed: "Action needed",
    };

    const openInfoRequests = infoRequests
      .filter((r) => r.status !== "resolved" && r.status !== "verified")
      .map((r) => ({ id: r.id, item: r.item, note: r.note || null, status: INFO_STATUS[r.status] || r.status, requested_at: r.created_date }));

    const docChecklist = documents.map((d) => ({
      type: d.document_type,
      label: DOC_LABELS[d.document_type] || d.document_type,
      status: DOC_STATUS[d.status] || d.status,
      file_name: d.file_name || null,
      uploaded_at: d.created_date,
    }));

    // Timeline
    const timeline = [
      { step: "Application submitted", at: app.created_date, done: true },
      { step: "Information & documents", at: null, done: ["data_collection", "analyzing", "underwriting", "completed"].includes(app.status) },
      { step: "Under review", at: null, done: ["analyzing", "underwriting", "completed"].includes(app.status) },
      { step: "Decision", at: decision?.decision_timestamp || null, done: !!decision },
    ];

    const noticeToken = decision?.adverse_action_delivery?.share_token || null;

    return apiSuccess({
      application: {
        application_number: app.application_number,
        status: app.status,
        status_label: STATUS_LABEL[app.status] || app.status,
        loan_amount: app.loan_amount,
        loan_currency: app.loan_currency,
        loan_purpose: app.loan_purpose,
        loan_term_months: app.loan_term_months,
        market: app.market,
        created_at: app.created_date,
      },
      borrower: { first_name: borrower.first_name, last_name: borrower.last_name },
      decision: decision ? {
        decision: decision.decision,
        decided_at: decision.decision_timestamp,
        human_review_required: decision.human_review_required,
      } : null,
      notice_token: noticeToken,
      open_information_requests: openInfoRequests,
      documents: docChecklist,
      timeline,
    }, 200);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

function inferFormat(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".csv")) return "csv";
  if (n.endsWith(".json")) return "json";
  if (/\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(n)) return "image";
  return "other";
}