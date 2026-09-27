import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { apiError, apiSuccess, readBody } from "../../shared/utils.ts";

// Public borrower portal assistant. No auth — the borrower proves ownership
// with application_number + email (same as apiBorrowerStatus). Answers questions
// about their application status, outstanding to-dos and decision, and flags
// when a question must be handed to the lender's loan officer. Input is bounded
// to limit abuse.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const applicationNumber = (body.application_number || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const message = (body.message || "").toString().trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!applicationNumber) return apiError("VALIDATION_ERROR", "Application number is required.", 400);
    if (!email) return apiError("VALIDATION_ERROR", "Email is required.", 400);
    if (!message || message.length > 1000) return apiError("VALIDATION_ERROR", "A message (max 1000 chars) is required.", 400);

    // Verify ownership (same lookup as the status portal)
    const apps = await base44.asServiceRole.entities.Application.filter({ application_number: applicationNumber }, "-created_date", 5);
    if (apps.length === 0) return apiError("NOT_FOUND", "We couldn't find an application with that number.", 404);
    const app = apps[0];
    const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id }, "-created_date", 1);
    const borrower = borrowers[0];
    if (!borrower || !borrower.email || borrower.email.toLowerCase() !== email) {
      return apiError("NOT_FOUND", "We couldn't find an application matching those details.", 404);
    }

    // Load context the assistant is allowed to reference
    const [decisions, infoRequests, documents] = await Promise.all([
      base44.asServiceRole.entities.UnderwritingDecision.filter({ application_id: app.id }, "-decision_timestamp", 1),
      base44.asServiceRole.entities.InformationRequest.filter({ application_id: app.id }, "-created_date", 50),
      base44.asServiceRole.entities.Document.filter({ application_id: app.id }, "-created_date", 50),
    ]);
    const decision = decisions[0] || null;
    const openTodos = infoRequests
      .filter((r) => r.status !== "resolved" && r.status !== "verified")
      .map((r) => `- ${r.item}${r.note ? ` (${r.note})` : ""}`)
      .slice(0, 10);

    const STATUS_LABEL: Record<string, string> = {
      draft: "Started",
      data_collection: "Information & documents",
      analyzing: "Under review",
      underwriting: "Under review",
      completed: "Completed",
      failed: "Action needed",
    };

    const context = {
      application_number: app.application_number,
      status: STATUS_LABEL[app.status] || app.status,
      loan_amount: app.loan_amount,
      loan_currency: app.loan_currency,
      loan_term_months: app.loan_term_months,
      loan_purpose: app.loan_purpose,
      submitted_at: app.created_date,
      decision: decision ? decision.decision : "none yet",
      human_review_required: decision ? decision.human_review_required : false,
      open_todos: openTodos,
      documents_on_file: documents.map((d) => d.document_type).filter(Boolean),
    };

    const convo = history.slice(-8)
      .map((h) => `${h.role === "assistant" ? "Assistant" : "Borrower"}: ${h.content}`)
      .join("\n");

    const prompt = `You are the CreditDecide Assistant inside a borrower's loan portal. The borrower has already submitted their application and is checking on progress. Be warm, concise and honest. Answer only from the application context below — never invent status, decisions, dates or reasons. If the borrower asks something you cannot answer from context (changing the loan amount, negotiating terms, explaining a decline reason in detail, anything requiring the lender's judgement), say you will pass it to their loan officer and set handoff=true.

Application context (JSON):
${JSON.stringify(context)}

Conversation so far:
${convo}

Borrower says: "${message}"

Respond with a friendly reply (under 120 words) in the borrower's own language. Set handoff=true only when the question genuinely needs the loan officer.`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          reply: { type: "string", description: "Friendly reply to the borrower" },
          handoff: { type: "boolean", description: "True when this question must be answered by the loan officer" },
        },
        required: ["reply", "handoff"],
      },
    });

    const result = typeof llmResponse === "string" ? JSON.parse(llmResponse) : llmResponse;
    return apiSuccess({
      reply: result.reply || "Thanks for your message. I'll get back to you shortly.",
      handoff: !!result.handoff,
    }, 200);
  } catch (error) {
    return apiError("INTERNAL_ERROR", error.message, 500);
  }
}