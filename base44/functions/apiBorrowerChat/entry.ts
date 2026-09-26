import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { apiError, apiSuccess, readBody } from "../../shared/utils.ts";

// POST — public borrower application assistant.
// Converses with a borrower to help fill their loan application, and extracts
// structured fields from the conversation to auto-fill the form. No auth — the
// borrower apply page is public. Input is bounded to limit abuse.
const FIELDS = ["first_name", "last_name", "email", "phone", "loan_amount", "loan_purpose", "loan_term_months", "employment_status", "employer_name", "annual_income", "product_type", "market", "borrower_type"];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const { message, history, values } = body;

    if (!message || typeof message !== "string" || message.length > 1000) {
      return apiError("VALIDATION_ERROR", "A message (max 1000 chars) is required.", 400);
    }

    const convo = (Array.isArray(history) ? history : []).slice(-8)
      .map((h) => `${h.role === "assistant" ? "Assistant" : "Borrower"}: ${h.content}`)
      .join("\n");

    const currentValues = JSON.stringify(values || {});

    const prompt = `You are the CreditDecide Assistant, helping a borrower fill in a loan application through conversation. Be warm, concise and practical. Ask one or two follow-up questions at a time to gather what's still missing. When the borrower shares details, confirm what you captured.

Current form values: ${currentValues}

Conversation so far:
${convo}

Borrower says: "${message}"

Respond with a friendly reply (under 120 words) and extract any fields the borrower has now provided. Only include a field if it is clearly stated in the conversation. Use these field names only: ${FIELDS.join(", ")}. For employment_status use one of: employed, self_employed, business. For market use an ISO country code (GB, US, NG, ZA, KE, GH). For product_type use: personal_loan, instalment, pos, auto_loan. Numbers should be numeric (no commas or currency symbols).`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          reply: { type: "string", description: "Friendly reply to the borrower" },
          extracted_fields: {
            type: "object",
            description: "Fields that can be auto-filled from the conversation",
            properties: FIELDS.reduce((acc, f) => { acc[f] = { type: "string" }; return acc; }, {}),
          },
        },
        required: ["reply", "extracted_fields"],
      },
    });

    const result = typeof llmResponse === "string" ? JSON.parse(llmResponse) : llmResponse;
    const raw = result.extracted_fields || {};
    // Drop placeholder/null/empty values the model sometimes emits
    const extracted = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v == null || v === "" || String(v).toLowerCase() === "null") continue;
      extracted[k] = v;
    }
    // Coerce numeric fields
    for (const k of ["loan_amount", "loan_term_months", "annual_income"]) {
      if (extracted[k] != null) extracted[k] = Number(extracted[k]);
      if (Number.isNaN(extracted[k])) delete extracted[k];
    }

    return apiSuccess({ reply: result.reply || "Thanks! Tell me a bit more about your application.", extracted_fields: extracted }, 200);
  } catch (error) {
    return apiError("INTERNAL_ERROR", error.message, 500);
  }
}