// OpenAPI 3.0 spec generator for the UnderwriteOS public API surface.
// All schemas are stable and versioned. Internal database implementation
// details are not exposed.

export function buildOpenApiSpec(apiBase: string): any {
  return {
    openapi: "3.0.3",
    info: {
      title: "UnderwriteOS API",
      version: "1.0.0",
      description: "API-first B2B underwriting infrastructure. Pipeline: Ingestion -> Normalization -> Intelligence -> Evidence -> Policy -> Underwriting Recommendation -> Decision Workflow. All resources are scoped to an organization. Credit reports and bank statements can be pulled automatically via bureau / open-banking providers (no manual upload), or submitted directly. Bureau and open-banking providers are mock/test abstractions — no external bureau or bank is connected.",
      contact: { name: "UnderwriteOS", url: "https://underwriteos.dev" }
    },
    servers: [{ url: `${apiBase}/v1` }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "Authorization", description: "Bearer <api_key>. API keys resolve to a single organization." }
      },
      schemas: {
        Error: { type: "object", properties: { error: { type: "object", properties: { code: { type: "string" }, message: { type: "string" } } } } },
        Borrower: borrowerSchema(),
        Application: applicationSchema(),
        FinancialProfile: financialProfileSchema(),
        CreditProfile: creditProfileSchema(),
        RiskSignal: riskSignalSchema(),
        Evidence: evidenceSchema(),
        UnderwritingRecommendation: recommendationSchema(),
        FinalDecision: decisionSchema(),
        Job: jobSchema()
      }
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
      "/borrowers": { post: op("Create borrower", "Borrower", "Borrower", 201) },
      "/applications": { post: op("Create application", "Application", "Application", 201) },
      "/applications/{application_id}": { get: opGet("Retrieve application", "Application") },
      "/applications/{application_id}/documents": { post: op("Upload document", null, null, 201) },
      "/applications/{application_id}/credit-report": { post: op("Pull credit report (automated bureau pull, or submit raw_data)", null, "CreditProfile", 201) },
      "/applications/{application_id}/bank-statement": { post: op("Pull bank statement (open banking, or submit transactions)", null, "FinancialProfile", 201) },
      "/applications/{application_id}/analyze": { post: op("Start analysis (async)", "Job", "Job", 202) },
      "/applications/{application_id}/underwrite": { post: op("Run underwriting evaluation", null, "UnderwritingRecommendation", 200) },
      "/applications/{application_id}/financial-profile": { get: opGet("Retrieve canonical financial profile", "FinancialProfile") },
      "/applications/{application_id}/credit-profile": { get: opGet("Retrieve normalized credit profile", "CreditProfile") },
      "/applications/{application_id}/risk": { get: opGet("Retrieve risk signals", "RiskSignal") },
      "/applications/{application_id}/evidence": { get: opGet("Retrieve evidence graph", "Evidence") },
      "/applications/{application_id}/recommendation": { get: opGet("Retrieve underwriting recommendation", "UnderwritingRecommendation") },
      "/applications/{application_id}/decision": { get: opGet("Retrieve final decision", "FinalDecision") },
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

function borrowerSchema() {
  return { type: "object", properties: { first_name: { type: "string" }, last_name: { type: "string" }, email: { type: "string" }, annual_income: { type: "number" }, employment_status: { type: "string" } }, required: ["first_name", "last_name"] };
}
function applicationSchema() {
  return { type: "object", properties: { borrower_id: { type: "string" }, loan_amount: { type: "number" }, loan_purpose: { type: "string" }, loan_term_months: { type: "number" }, policy_id: { type: "string" } }, required: ["borrower_id", "loan_amount"] };
}
function financialProfileSchema() {
  return {
    type: "object", description: "Canonical, provider-independent financial profile.",
    properties: {
      currency: { type: "string" },
      income: { type: "object", properties: { monthly: { type: "number" }, annual: { type: "number" }, stability: { type: "number" }, sources: { type: "number" } } },
      expenses: { type: "object", properties: { monthly: { type: "number" }, volatility: { type: "number" }, recurring: { type: "number" } } },
      assets: { type: "object", properties: { total: { type: "number" }, liquid: { type: "number" } } },
      liabilities: { type: "object", properties: { total: { type: "number" }, monthly_servicing: { type: "number" } } },
      debt: { type: "object", properties: { total: { type: "number" }, monthly_payments: { type: "number" }, to_income: { type: "number" } } },
      cashflow: { type: "object", properties: { monthly_net: { type: "number" }, average_balance: { type: "number" }, disposable_income: { type: "number" } } },
      credit: { type: "object", properties: { utilisation: { type: "number" }, outstanding_balance: { type: "number" } } },
      affordability: { type: "object", properties: { debt_to_income: { type: "number" }, income_to_loan: { type: "number" }, repayment_capacity: { type: "number" }, affordability_ratio: { type: "number" } } },
      employment: { type: "object", properties: { status: { type: "string" }, employer: { type: "string" }, annual_income: { type: "number" } } },
      financial_behaviour: { type: "object", properties: { income_stability: { type: "number" }, expense_volatility: { type: "number" }, savings_pattern: { type: "string" }, recurring_obligations: { type: "number" } } }
    }
  };
}
function creditProfileSchema() {
  return {
    type: "object", description: "Normalized credit profile. All fields nullable.",
    properties: {
      provider: { type: "string" }, credit_score: { type: "number", nullable: true }, score_band: { type: "string", nullable: true },
      active_accounts: { type: "number", nullable: true }, closed_accounts: { type: "number", nullable: true },
      delinquent_accounts: { type: "number", nullable: true }, defaults: { type: "number", nullable: true },
      outstanding_balance: { type: "number", nullable: true }, credit_utilisation: { type: "number", nullable: true },
      recent_enquiries: { type: "number", nullable: true }, repayment_history: { type: "number", nullable: true }
    }
  };
}
function riskSignalSchema() {
  return { type: "object", properties: { category: { type: "string" }, signal: { type: "string" }, value: {}, confidence: { type: "number" }, source: { type: "string" }, evidence_id: { type: "string" }, flag: { type: "string" } } };
}
function evidenceSchema() {
  return { type: "object", description: "Evidence graph node: Decision -> Reason -> RiskSignal -> Evidence -> Source.", properties: { signal: { type: "string" }, value: {}, source_type: { type: "string" }, source_id: { type: "string" }, document_id: { type: "string" }, source_location: { type: "string" }, calculation_method: { type: "string" }, confidence: { type: "number" } } };
}
function recommendationSchema() {
  return { type: "object", description: "AI-generated recommendation. Advisory only — never overrides lender policy.", properties: { recommendation: { type: "string", enum: ["APPROVE", "REVIEW", "DECLINE"] }, confidence: { type: "number" }, risk_score: { type: "number" }, probability_of_default: { type: "number" }, reasons: { type: "array", items: { type: "string" } }, positive_signals: { type: "array", items: { type: "string" } }, risk_factors: { type: "array", items: { type: "string" } }, policy_results: { type: "object" }, ai_memo: { type: "string" }, human_review_required: { type: "boolean" }, generated_at: { type: "string", format: "date-time" } }, required: ["recommendation"] };
}
function decisionSchema() {
  return { type: "object", description: "Final lender decision. Authoritative.", properties: { decision: { type: "string", enum: ["APPROVE", "REVIEW", "DECLINE"] }, decided_by: { type: "string" }, decision_source: { type: "string", enum: ["policy_engine", "human_underwriter", "automated_workflow"] }, policy_id: { type: "string" }, policy_version: { type: "string" }, decision_timestamp: { type: "string", format: "date-time" }, override_reason: { type: "string" }, risk_score: { type: "number" }, probability_of_default: { type: "number" }, confidence: { type: "number" }, human_review_required: { type: "boolean" }, reasons: { type: "array", items: { type: "string" } } }, required: ["decision", "decision_source"] };
}
function jobSchema() {
  return { type: "object", properties: { job_id: { type: "string" }, status: { type: "string", enum: ["processing", "completed", "failed"] } } };
}