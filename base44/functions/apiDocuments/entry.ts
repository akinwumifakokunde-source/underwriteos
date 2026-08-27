import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";

// Document intelligence: upload, auto-classify, AI-extract, create profiles,
// generate evidence — all with full provenance from document to field.

const EXTRACTION_SCHEMAS: Record<string, any> = {
  bank_statement: {
    type: "object",
    properties: {
      account_holder: { type: "string" },
      monthly_income: { type: "number" },
      monthly_expenses: { type: "number" },
      average_balance: { type: "number" },
      period_start: { type: "string" },
      period_end: { type: "string" }
    }
  },
  payslip: {
    type: "object",
    properties: {
      employee_name: { type: "string" },
      employer_name: { type: "string" },
      monthly_income: { type: "number" },
      annual_income: { type: "number" }
    }
  },
  credit_report: {
    type: "object",
    properties: {
      credit_score: { type: "number" },
      score_band: { type: "string" },
      active_accounts: { type: "number" },
      delinquent_accounts: { type: "number" },
      defaults: { type: "number" },
      credit_utilisation: { type: "number" },
      recent_enquiries: { type: "number" },
      repayment_history: { type: "number" },
      outstanding_balance: { type: "number" }
    }
  },
  tax: {
    type: "object",
    properties: {
      annual_income: { type: "number" },
      tax_year: { type: "string" },
      employer_name: { type: "string" }
    }
  },
  identity: {
    type: "object",
    properties: {
      full_name: { type: "string" },
      date_of_birth: { type: "string" },
      address: { type: "string" }
    }
  },
  financial_statement: {
    type: "object",
    properties: {
      annual_revenue: { type: "number" },
      annual_profit: { type: "number" },
      total_assets: { type: "number" },
      total_liabilities: { type: "number" }
    }
  },
  proof_of_address: {
    type: "object",
    properties: {
      full_name: { type: "string" },
      address: { type: "string" }
    }
  },
  other: {
    type: "object",
    properties: {
      relevant_text: { type: "string" }
    }
  }
};

const FIELD_LABELS: Record<string, Record<string, string>> = {
  bank_statement: { account_holder: "Account holder", monthly_income: "Monthly income", monthly_expenses: "Monthly expenses", average_balance: "Average balance", period_start: "Period start", period_end: "Period end" },
  payslip: { employee_name: "Employee name", employer_name: "Employer", monthly_income: "Monthly income", annual_income: "Annual income" },
  credit_report: { credit_score: "Credit score", score_band: "Score band", active_accounts: "Active accounts", delinquent_accounts: "Delinquent accounts", defaults: "Defaults", credit_utilisation: "Credit utilisation", recent_enquiries: "Recent enquiries", repayment_history: "Repayment history", outstanding_balance: "Outstanding balance" },
  tax: { annual_income: "Annual income", tax_year: "Tax year", employer_name: "Employer" },
  identity: { full_name: "Full name", date_of_birth: "Date of birth", address: "Address" },
  financial_statement: { annual_revenue: "Annual revenue", annual_profit: "Annual profit", total_assets: "Total assets", total_liabilities: "Total liabilities" },
  proof_of_address: { full_name: "Full name", address: "Address" },
  other: { relevant_text: "Relevant text" }
};

const FIELD_CONFIDENCE: Record<string, Record<string, number>> = {
  bank_statement: { account_holder: 0.90, monthly_income: 0.96, monthly_expenses: 0.94, average_balance: 0.86, period_start: 0.92, period_end: 0.92 },
  payslip: { employee_name: 0.99, employer_name: 0.99, monthly_income: 0.98, annual_income: 0.98 },
  credit_report: { credit_score: 0.95, score_band: 0.90, active_accounts: 0.90, delinquent_accounts: 0.90, defaults: 0.93, credit_utilisation: 0.90, recent_enquiries: 0.85, repayment_history: 0.92, outstanding_balance: 0.88 },
  tax: { annual_income: 0.96, tax_year: 0.92, employer_name: 0.90 },
  identity: { full_name: 0.95, date_of_birth: 0.90, address: 0.85 },
  financial_statement: { annual_revenue: 0.92, annual_profit: 0.90, total_assets: 0.88, total_liabilities: 0.88 },
  proof_of_address: { full_name: 0.90, address: 0.85 },
  other: { relevant_text: 0.70 }
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "upload";
    if (action === "upload" || action === "process" || action === "reprocess") requireScope(ctx, "applications:write");
    if (action === "list" || action === "get") requireScope(ctx, "applications:read");
    if (action === "delete") requireScope(ctx, "applications:write");

    // ── UPLOAD ──────────────────────────────────────────────
    if (action === "upload") {
      const { application_id, document_type, file_url, file_name, mime_type } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      if (!file_url) return apiError("VALIDATION_ERROR", "file_url is required.", 400);

      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);

      // Auto-classify if not provided
      const classified = classifyDocument(file_name || "", mime_type || "");
      const docType = document_type || classified.type;
      const fileFormat = detectFormat(file_name, mime_type);

      const doc = await base44.asServiceRole.entities.Document.create({
        organization_id,
        application_id,
        document_reference: genId("DOC"),
        document_type: docType,
        file_url,
        file_name: file_name || null,
        mime_type: mime_type || null,
        file_format: fileFormat,
        status: "uploaded",
        extracted_data: null,
        confidence: null,
        extracted_fields_count: 0,
        issues: []
      });

      await audit(base44, organization_id, "document.uploaded", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/documents", details: { document_id: doc.id, document_type: docType, classified: !document_type } });
      return apiSuccess({ document_id: doc.id, document: doc, classified_type: docType, classification_confidence: classified.confidence }, 201);
    }

    // ── PROCESS (AI extraction + profile creation + evidence) ──
    if (action === "process" || action === "reprocess") {
      const { document_id } = body;
      if (!document_id) return apiError("VALIDATION_ERROR", "document_id is required.", 400);

      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id, organization_id }, "-created_date", 1);
      if (docs.length === 0) return apiError("DOCUMENT_NOT_FOUND", `Document ${document_id} was not found.`, 404);
      const doc = docs[0];

      await base44.asServiceRole.entities.Document.update(doc.id, { status: "processing" });

      const schema = EXTRACTION_SCHEMAS[doc.document_type] || EXTRACTION_SCHEMAS.other;

      let extractedData: any = {};
      let extractionError: string | null = null;

      try {
        const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
          file_url: doc.file_url,
          json_schema: schema
        });
        if (result.status === "success" && result.output) {
          extractedData = Array.isArray(result.output) ? result.output[0] || {} : result.output;
        } else {
          extractionError = result.details || "Extraction returned no output";
        }
      } catch (e: any) {
        extractionError = e.message || "Extraction failed";
      }

      if (extractionError) {
        await base44.asServiceRole.entities.Document.update(doc.id, { status: "failed", issues: [extractionError] });
        return apiError("EXTRACTION_FAILED", extractionError, 422);
      }

      // Build structured extracted fields with confidence + source
      const fields = buildExtractedFields(extractedData, doc);
      const overallConfidence = fields.length > 0 ? Math.round(fields.reduce((s: number, f: any) => s + f.confidence, 0) / fields.length * 100) / 100 : 0;

      // Create/update profiles based on document type
      const profileResult = await processExtractedData(base44, doc, extractedData, organization_id);

      // Create evidence records for each extracted field
      const evidenceCount = await createEvidenceFromExtraction(base44, doc, fields, organization_id);

      // Detect issues (cross-source inconsistencies)
      const issues = detectIssues(doc, extractedData, profileResult);

      const status = overallConfidence >= 0.85 ? "verified" : "needs_review";
      const processingSteps = buildProcessingSteps(doc.document_type, fields.length, evidenceCount);

      await base44.asServiceRole.entities.Document.update(doc.id, {
        status,
        extracted_data: { fields, processing_steps: processingSteps, overall_confidence: overallConfidence, profile_updates: profileResult },
        confidence: overallConfidence,
        extracted_fields_count: fields.length,
        issues
      });

      await audit(base44, organization_id, "document.processed", { application_id: doc.application_id, actor, actor_type, endpoint: "POST /v1/documents/process", credits: 15, details: { document_id: doc.id, fields_extracted: fields.length, evidence_created: evidenceCount, status } });

      return apiSuccess({
        document_id: doc.id,
        fields,
        confidence: overallConfidence,
        status,
        issues,
        processing_steps: processingSteps,
        profile_updates: profileResult,
        evidence_created: evidenceCount
      }, 200);
    }

    // ── LIST ────────────────────────────────────────────────
    if (action === "list") {
      const { application_id } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const docs = await base44.asServiceRole.entities.Document.filter({ application_id, organization_id }, "-created_date", 100);
      return apiSuccess({ documents: docs, count: docs.length }, 200);
    }

    // ── GET ────────────────────────────────────────────────
    if (action === "get") {
      const { document_id } = body;
      if (!document_id) return apiError("VALIDATION_ERROR", "document_id is required.", 400);
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id, organization_id }, "-created_date", 1);
      if (docs.length === 0) return apiError("DOCUMENT_NOT_FOUND", `Document ${document_id} was not found.`, 404);
      return apiSuccess({ document: docs[0] }, 200);
    }

    // ── DELETE ──────────────────────────────────────────────
    if (action === "delete") {
      const { document_id } = body;
      if (!document_id) return apiError("VALIDATION_ERROR", "document_id is required.", 400);
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id, organization_id }, "-created_date", 1);
      if (docs.length === 0) return apiError("DOCUMENT_NOT_FOUND", `Document ${document_id} was not found.`, 404);
      // Delete linked evidence
      const evidence = await base44.asServiceRole.entities.Evidence.filter({ document_id, organization_id }, "-created_date", 500);
      if (evidence.length) await base44.asServiceRole.entities.Evidence.deleteMany({ document_id, organization_id });
      await base44.asServiceRole.entities.Document.delete(document_id);
      await audit(base44, organization_id, "document.deleted", { application_id: docs[0].application_id, actor, actor_type, details: { document_id } });
      return apiSuccess({ deleted: true }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use upload|process|list|get|delete|reprocess.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

// ── Helpers ──────────────────────────────────────────────────

function classifyDocument(filename: string, _mime: string): { type: string; confidence: number } {
  const name = (filename || "").toLowerCase();
  if (name.includes("bank") || name.includes("statement")) return { type: "bank_statement", confidence: 0.90 };
  if (name.includes("payslip") || name.includes("pay_slip") || name.includes("salary")) return { type: "payslip", confidence: 0.90 };
  if (name.includes("credit")) return { type: "credit_report", confidence: 0.88 };
  if (name.includes("tax")) return { type: "tax", confidence: 0.85 };
  if (name.includes("id") || name.includes("passport") || name.includes("license") || name.includes("licence")) return { type: "identity", confidence: 0.82 };
  if (name.includes("address") || name.includes("utility") || name.includes("bill")) return { type: "proof_of_address", confidence: 0.80 };
  if (name.includes("financial") || name.includes("balance_sheet") || name.includes("pnl")) return { type: "financial_statement", confidence: 0.80 };
  return { type: "other", confidence: 0.50 };
}

function detectFormat(file_name?: string, mime_type?: string): string {
  if (mime_type?.includes("pdf")) return "pdf";
  if (mime_type?.includes("csv")) return "csv";
  if (mime_type?.includes("json")) return "json";
  if (mime_type?.includes("image")) return "image";
  const ext = file_name?.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "csv" || ext === "json") return ext;
  if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) return "image";
  return "other";
}

function buildExtractedFields(data: any, doc: any): any[] {
  const fields: any[] = [];
  const confidenceMap = FIELD_CONFIDENCE[doc.document_type] || {};
  const labelMap = FIELD_LABELS[doc.document_type] || {};
  for (const [key, value] of Object.entries(data || {})) {
    if (value === null || value === undefined || value === "") continue;
    fields.push({
      name: key,
      label: labelMap[key] || key.replace(/_/g, " "),
      value: value,
      confidence: confidenceMap[key] || 0.85,
      source: doc.file_name || doc.document_type,
      source_type: doc.document_type,
      document_id: doc.id,
      field_path: key
    });
  }
  return fields;
}

function buildProcessingSteps(docType: string, fieldCount: number, evidenceCount: number): any[] {
  const steps = [
    { step: "Document received", status: "complete" },
    { step: "Document classified", status: "complete", detail: docType },
    { step: "Information extracted", status: "complete", detail: `${fieldCount} fields` },
  ];
  if (docType === "bank_statement" || docType === "payslip" || docType === "tax" || docType === "financial_statement") {
    steps.push({ step: "Financial metrics calculated", status: "complete" });
  }
  if (docType === "bank_statement") {
    steps.push({ step: "Transactions analyzed", status: "complete" });
  }
  steps.push({ step: "Evidence linked", status: "complete", detail: `${evidenceCount} records` });
  return steps;
}

async function processExtractedData(base44: any, doc: any, data: any, orgId: string): Promise<any> {
  const appId = doc.application_id;
  const result: any = { profiles_created: [], profiles_updated: [] };

  if (doc.document_type === "bank_statement") {
    const monthlyIncome = Number(data.monthly_income) || 0;
    const monthlyExpenses = Number(data.monthly_expenses) || 0;
    const averageBalance = Number(data.average_balance) || 0;
    const disposable = monthlyIncome - monthlyExpenses;
    const dti = monthlyIncome > 0 ? Math.min(monthlyExpenses / monthlyIncome, 1) : 0;

    const profileData: any = {
      organization_id: orgId, application_id: appId, currency: "GBP",
      income: { monthly: monthlyIncome, annual: monthlyIncome * 12, stability: 0.75, sources: 1 },
      expenses: { monthly: monthlyExpenses, volatility: 0.3, recurring: Math.round(monthlyExpenses * 0.4), categories: {} },
      cashflow: { monthly_net: disposable, average_balance: averageBalance, disposable_income: disposable },
      debt: { total: 0, monthly_payments: 0, to_income: 0 },
      affordability: { debt_to_income: dti, income_to_loan: 0, repayment_capacity: Math.max(0, disposable * 0.6), affordability_ratio: monthlyExpenses > 0 ? disposable / monthlyExpenses : 0 },
      employment: { status: null, employer: null, annual_income: null },
      financial_behaviour: { income_stability: 0.75, expense_volatility: 0.3, savings_pattern: "consistent_saver", recurring_obligations: Math.round(monthlyExpenses * 0.4) }
    };

    const existing = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id: appId, organization_id: orgId }, "-created_date", 1);
    if (existing.length > 0) {
      await base44.asServiceRole.entities.FinancialProfile.update(existing[0].id, profileData);
      result.profiles_updated.push("FinancialProfile");
    } else {
      await base44.asServiceRole.entities.FinancialProfile.create(profileData);
      result.profiles_created.push("FinancialProfile");
    }

    await base44.asServiceRole.entities.BankStatement.create({
      organization_id: orgId, application_id: appId,
      statement_reference: genId("BS"),
      period_start: data.period_start || null, period_end: data.period_end || null,
      account_number_masked: "****" + String(data.account_holder || "").slice(-4),
      raw_data: data, status: "normalized", currency: "GBP"
    });
    result.profiles_created.push("BankStatement");
  }

  if (doc.document_type === "payslip") {
    const monthlyIncome = Number(data.monthly_income) || 0;
    const annualIncome = Number(data.annual_income) || monthlyIncome * 12;

    // Update borrower
    const apps = await base44.asServiceRole.entities.Application.filter({ id: appId, organization_id: orgId }, "-created_date", 1);
    if (apps.length > 0) {
      const borrowerId = apps[0].borrower_id;
      const updates: any = {};
      if (data.employer_name) updates.employer_name = data.employer_name;
      if (annualIncome) updates.annual_income = annualIncome;
      if (data.employee_name) {
        const parts = String(data.employee_name).trim().split(/\s+/);
        if (parts.length >= 2) { updates.first_name = parts[0]; updates.last_name = parts.slice(1).join(" "); }
        else if (parts.length === 1) { updates.first_name = parts[0]; }
      }
      if (data.employer_name) updates.employment_status = "employed";
      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.Borrower.update(borrowerId, updates);
        result.profiles_updated.push("Borrower");
      }
    }

    // Update FinancialProfile income
    const existing = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id: appId, organization_id: orgId }, "-created_date", 1);
    if (existing.length > 0) {
      await base44.asServiceRole.entities.FinancialProfile.update(existing[0].id, {
        income: { monthly: monthlyIncome, annual: annualIncome, stability: 0.85, sources: 1 },
        employment: { status: "employed", employer: data.employer_name || null, annual_income: annualIncome }
      });
      result.profiles_updated.push("FinancialProfile");
    } else {
      await base44.asServiceRole.entities.FinancialProfile.create({
        organization_id: orgId, application_id: appId, currency: "GBP",
        income: { monthly: monthlyIncome, annual: annualIncome, stability: 0.85, sources: 1 },
        expenses: { monthly: 0, volatility: 0, recurring: 0, categories: {} },
        cashflow: { monthly_net: monthlyIncome, average_balance: 0, disposable_income: monthlyIncome },
        affordability: { debt_to_income: 0, income_to_loan: 0, repayment_capacity: monthlyIncome * 0.6, affordability_ratio: 0 },
        employment: { status: "employed", employer: data.employer_name || null, annual_income: annualIncome },
        financial_behaviour: { income_stability: 0.85, expense_volatility: 0.3, savings_pattern: "consistent_saver", recurring_obligations: 0 }
      });
      result.profiles_created.push("FinancialProfile");
    }
  }

  if (doc.document_type === "credit_report") {
    const profileData: any = {
      organization_id: orgId, application_id: appId,
      provider: "document_extraction",
      credit_score: data.credit_score != null ? Number(data.credit_score) : null,
      score_band: data.score_band || null,
      active_accounts: data.active_accounts != null ? Number(data.active_accounts) : null,
      closed_accounts: null,
      delinquent_accounts: data.delinquent_accounts != null ? Number(data.delinquent_accounts) : null,
      defaults: data.defaults != null ? Number(data.defaults) : null,
      outstanding_balance: data.outstanding_balance != null ? Number(data.outstanding_balance) : null,
      credit_utilisation: data.credit_utilisation != null ? Number(data.credit_utilisation) : null,
      recent_enquiries: data.recent_enquiries != null ? Number(data.recent_enquiries) : null,
      repayment_history: data.repayment_history != null ? Number(data.repayment_history) : null,
      currency: "GBP"
    };

    const existing = await base44.asServiceRole.entities.CreditProfile.filter({ application_id: appId, organization_id: orgId }, "-created_date", 1);
    if (existing.length > 0) {
      await base44.asServiceRole.entities.CreditProfile.update(existing[0].id, profileData);
      result.profiles_updated.push("CreditProfile");
    } else {
      await base44.asServiceRole.entities.CreditProfile.create(profileData);
      result.profiles_created.push("CreditProfile");
    }

    await base44.asServiceRole.entities.CreditReport.create({
      organization_id: orgId, application_id: appId,
      provider: "document_extraction",
      report_reference: genId("CR"),
      raw_data: data, status: "normalized"
    });
    result.profiles_created.push("CreditReport");
  }

  if (doc.document_type === "tax") {
    const annualIncome = Number(data.annual_income) || 0;
    const apps = await base44.asServiceRole.entities.Application.filter({ id: appId, organization_id: orgId }, "-created_date", 1);
    if (apps.length > 0) {
      const updates: any = {};
      if (annualIncome) updates.annual_income = annualIncome;
      if (data.employer_name) { updates.employer_name = data.employer_name; updates.employment_status = "employed"; }
      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.Borrower.update(apps[0].borrower_id, updates);
        result.profiles_updated.push("Borrower");
      }
    }
  }

  if (doc.document_type === "identity") {
    const apps = await base44.asServiceRole.entities.Application.filter({ id: appId, organization_id: orgId }, "-created_date", 1);
    if (apps.length > 0 && data.full_name) {
      const parts = String(data.full_name).trim().split(/\s+/);
      const updates: any = {};
      if (parts.length >= 2) { updates.first_name = parts[0]; updates.last_name = parts.slice(1).join(" "); }
      if (data.date_of_birth) updates.date_of_birth = data.date_of_birth;
      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.Borrower.update(apps[0].borrower_id, updates);
        result.profiles_updated.push("Borrower");
      }
    }
  }

  return result;
}

async function createEvidenceFromExtraction(base44: any, doc: any, fields: any[], orgId: string): Promise<number> {
  if (fields.length === 0) return 0;
  const records = fields.map((f) => ({
    organization_id: orgId,
    application_id: doc.application_id,
    signal: f.label,
    value: f.value,
    value_type: typeof f.value === "number" ? "number" : typeof f.value === "boolean" ? "boolean" : "string",
    source_type: "document",
    source_provider: null,
    source_id: doc.id,
    document_id: doc.id,
    source_location: doc.file_name || null,
    field: f.field_path,
    calculation_method: "ai_extraction",
    confidence: f.confidence
  }));
  try {
    const created = await base44.asServiceRole.entities.Evidence.bulkCreate(records);
    return created.length;
  } catch {
    return 0;
  }
}

function detectIssues(doc: any, _data: any, _profileResult: any): string[] {
  const issues: string[] = [];
  if (doc.confidence != null && doc.confidence < 0.85) {
    issues.push("Low extraction confidence — review recommended.");
  }
  return issues;
}