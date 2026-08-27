import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { apiError, apiSuccess, readBody, resolveOrganization } from "../../shared/utils.ts";

// POST — AI underwriting assistant chat.
// Receives a user message + application_id, fetches full application context,
// calls InvokeLLM with that context, and returns the reply.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id } = ctx;

    const { application_id, message, history } = body;
    if (!application_id || !message) {
      return apiError("VALIDATION_ERROR", "application_id and message are required.", 400);
    }

    // Fetch application context
    const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
    if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", "Application not found.", 404);
    const app = apps[0];

    const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id, organization_id }, "-created_date", 1);
    const borrower = borrowers[0] || {};

    const docs = await base44.asServiceRole.entities.Document.filter({ application_id, organization_id }, "-created_date", 50);

    const fpList = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id, organization_id }, "-created_date", 1);
    const fp = fpList[0];

    const cpList = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id }, "-created_date", 1);
    const cp = cpList[0];

    const signals = await base44.asServiceRole.entities.RiskSignal.filter({ application_id, organization_id }, "-created_date", 50);

    const recs = await base44.asServiceRole.entities.UnderwritingRecommendation.filter({ application_id, organization_id }, "-created_date", 1);
    const recommendation = recs[0];

    const decisions = await base44.asServiceRole.entities.UnderwritingDecision.filter({ application_id, organization_id }, "-created_date", 1);
    const decision = decisions[0];

    const context = buildContext(app, borrower, docs, fp, cp, signals, recommendation, decision);

    const conversationHistory = (history || []).slice(-10).map((h) => ({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content,
    }));

    const prompt = `You are an AI underwriting assistant for UnderwriteOS. You help underwriters analyse loan applications by answering questions about the borrower's financial profile, risk signals, credit assessment, and policy outcomes.

Be clear, concise, and professional. Use specific numbers from the context when relevant. If data is missing, say so rather than guessing. Keep responses under 200 words unless the user asks for more detail.

${conversationHistory.length > 0 ? "PREVIOUS CONVERSATION:\n" + conversationHistory.map((h) => `${h.role}: ${h.content}`).join("\n") + "\n" : ""}

APPLICATION CONTEXT:
${context}

The user asks: "${message}"

Answer based on the application context above:`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
    });

    return apiSuccess({ reply: typeof llmResponse === "string" ? llmResponse : JSON.stringify(llmResponse) }, 200);
  } catch (error) {
    return apiError("INTERNAL_ERROR", error.message, 500);
  }
}

function buildContext(app, borrower, docs, fp, cp, signals, recommendation, decision) {
  const lines = [];
  const cur = app.loan_currency || "GBP";

  lines.push(`Application: ${app.application_number || app.id}`);
  lines.push(`Market: ${app.market}, Product: ${app.product_type}`);
  lines.push(`Loan: ${app.loan_amount} ${cur} over ${app.loan_term_months} months`);
  lines.push(`Status: ${app.status}`);

  if (borrower && borrower.first_name) {
    lines.push(`\nBorrower: ${borrower.first_name} ${borrower.last_name}`);
    lines.push(`Employment: ${borrower.employment_status || "unknown"}`);
    if (borrower.employer_name) lines.push(`Employer: ${borrower.employer_name}`);
    if (borrower.annual_income) lines.push(`Annual income: ${borrower.annual_income} ${borrower.income_currency || cur}`);
  }

  lines.push(`\nDocuments (${docs.length} uploaded):`);
  docs.forEach((d) => {
    lines.push(`  - ${d.document_type}: ${d.status} (${d.file_name || "unnamed"})`);
  });

  if (fp) {
    lines.push(`\nFinancial Profile:`);
    if (fp.income?.monthly != null) lines.push(`  Monthly income: ${fp.income.monthly} ${fp.currency || cur}`);
    if (fp.income?.stability != null) lines.push(`  Income stability: ${(fp.income.stability * 100).toFixed(0)}%`);
    if (fp.expenses?.monthly != null) lines.push(`  Monthly expenses: ${fp.expenses.monthly} ${fp.currency || cur}`);
    if (fp.debt?.to_income != null) lines.push(`  Debt-to-income: ${(fp.debt.to_income * 100).toFixed(1)}%`);
    if (fp.cashflow?.monthly_net != null) lines.push(`  Monthly net cashflow: ${fp.cashflow.monthly_net} ${fp.currency || cur}`);
    if (fp.cashflow?.disposable_income != null) lines.push(`  Disposable income: ${fp.cashflow.disposable_income} ${fp.currency || cur}`);
  }

  if (cp) {
    lines.push(`\nCredit Profile:`);
    if (cp.credit_score != null) lines.push(`  Credit score: ${cp.credit_score}`);
    if (cp.credit_utilisation != null) lines.push(`  Credit utilisation: ${(cp.credit_utilisation * 100).toFixed(0)}%`);
    if (cp.active_accounts != null) lines.push(`  Active accounts: ${cp.active_accounts}`);
    if (cp.delinquent_accounts != null) lines.push(`  Delinquent accounts: ${cp.delinquent_accounts}`);
    if (cp.defaults != null) lines.push(`  Defaults: ${cp.defaults}`);
    if (cp.recent_enquiries != null) lines.push(`  Recent enquiries: ${cp.recent_enquiries}`);
  }

  if (signals.length > 0) {
    lines.push(`\nRisk Signals (${signals.length}):`);
    signals.forEach((s) => {
      lines.push(`  - [${s.category}] ${s.signal}: ${s.value} (${s.flag})`);
      if (s.explanation) lines.push(`    ${s.explanation}`);
    });
  }

  if (recommendation) {
    lines.push(`\nAI Recommendation: ${recommendation.recommendation}`);
    lines.push(`  Confidence: ${recommendation.confidence != null ? (recommendation.confidence * 100).toFixed(0) + "%" : "—"}`);
    lines.push(`  Risk score: ${recommendation.risk_score || "—"}`);
    if (recommendation.risk_factors?.length > 0) lines.push(`  Risk factors: ${recommendation.risk_factors.join("; ")}`);
    if (recommendation.positive_signals?.length > 0) lines.push(`  Positive signals: ${recommendation.positive_signals.join("; ")}`);
  }

  if (decision) {
    lines.push(`\nDecision: ${decision.decision} (by ${decision.decision_source})`);
    if (decision.reasons?.length > 0) lines.push(`  Reasons: ${decision.reasons.join("; ")}`);
  }

  return lines.join("\n");
}