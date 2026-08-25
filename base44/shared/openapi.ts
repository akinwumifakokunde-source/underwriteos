// OpenAPI 3.0 spec generator for the UnderwriteOS public API surface.

export function buildOpenApiSpec(apiBase: string): any {
  return {
    openapi: "3.0.3",
    info: {
      title: "UnderwriteOS API",
      version: "1.0.0",
      description: "API-first B2B underwriting infrastructure. Send borrower data and financial documents, receive structured underwriting intelligence, risk signals, evidence, and a policy-driven decision.",
      contact: { name: "UnderwriteOS", url: "https://underwriteos.dev" }
    },
    servers: [{ url: `${apiBase}/v1` }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "Authorization", description: "Bearer <api_key>" }
      },
      schemas: {
        Error: { type: "object", properties: { error: { type: "object", properties: { code: { type: "string" }, message: { type: "string" } } } } },
        Borrower: borrowerSchema(),
        Application: applicationSchema(),
        Decision: decisionSchema(),
        RiskSignal: riskSignalSchema(),
        Evidence: evidenceSchema(),
        Job: jobSchema()
      }
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
      "/borrowers": { post: op("Create borrower", "Borrower", "Borrower", 201) },
      "/applications": { post: op("Create application", "Application", "Application", 201) },
      "/applications/{application_id}": { get: opGet("Retrieve application", "Application") },
      "/applications/{application_id}/documents": { post: op("Upload document", null, null, 201) },
      "/applications/{application_id}/credit-report": { post: op("Submit credit report", null, "CreditReport", 201) },
      "/applications/{application_id}/bank-statement": { post: op("Submit bank statement", null, "BankStatement", 201) },
      "/applications/{application_id}/analyze": { post: op("Start analysis (async)", "Job", "Job", 202) },
      "/applications/{application_id}/underwrite": { post: op("Run underwriting evaluation", "Decision", "Decision", 200) },
      "/applications/{application_id}/risk": { get: opGet("Retrieve risk signals", "RiskSignal") },
      "/applications/{application_id}/evidence": { get: opGet("Retrieve evidence", "Evidence") },
      "/applications/{application_id}/decision": { get: opGet("Retrieve decision", "Decision") },
      "/applications/{application_id}/audit": { get: opGet("Retrieve audit trail", null) },
      "/jobs/{job_id}": { get: opGet("Retrieve job status", "Job") }
    }
  };
}

function op(summary: string, reqRef: string | null, resRef: string | null, status: number): any {
  return {
    summary,
    parameters: [{ name: "Idempotency-Key", in: "header", required: false, schema: { type: "string" } }],
    responses: {
      [status]: { description: "Success", content: resRef ? { "application/json": { schema: { $ref: `#/components/schemas/${resRef}` } } } : undefined },
      400: errorResponse(),
      401: errorResponse(),
      404: errorResponse()
    }
  };
}
function opGet(summary: string, resRef: string | null): any {
  return {
    summary,
    parameters: [{ name: "application_id", in: "path", required: true, schema: { type: "string" } }],
    responses: {
      200: { description: "Success", content: resRef ? { "application/json": { schema: { $ref: `#/components/schemas/${resRef}` } } } : undefined },
      404: errorResponse()
    }
  };
}
function errorResponse(): any {
  return { description: "Error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } };
}

function borrowerSchema() { return { type: "object", properties: { first_name: { type: "string" }, last_name: { type: "string" }, email: { type: "string" }, annual_income: { type: "number" }, employment_status: { type: "string" } }, required: ["first_name", "last_name"] }; }
function applicationSchema() { return { type: "object", properties: { borrower_id: { type: "string" }, loan_amount: { type: "number" }, loan_purpose: { type: "string" }, loan_term_months: { type: "number" }, policy_id: { type: "string" } }, required: ["borrower_id", "loan_amount"] }; }
function decisionSchema() { return { type: "object", properties: { application_id: { type: "string" }, status: { type: "string" }, decision: { type: "string", enum: ["APPROVE", "REVIEW", "DECLINE"] }, risk_score: { type: "number" }, probability_of_default: { type: "number" }, confidence: { type: "number" }, human_review_required: { type: "boolean" }, reasons: { type: "array", items: { type: "string" } } } }; }
function riskSignalSchema() { return { type: "object", properties: { category: { type: "string" }, signal: { type: "string" }, value: {}, confidence: { type: "number" }, source: { type: "string" }, flag: { type: "string" } } }; }
function evidenceSchema() { return { type: "object", properties: { signal: { type: "string" }, value: {}, source: { type: "string" }, source_reference: { type: "string" }, confidence: { type: "number" } } }; }
function jobSchema() { return { type: "object", properties: { job_id: { type: "string" }, status: { type: "string", enum: ["processing", "completed", "failed"] } } }; }