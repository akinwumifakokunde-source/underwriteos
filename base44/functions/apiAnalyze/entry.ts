import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";
import { generateRiskSignals } from "../../shared/riskEngine.ts";

// POST /v1/applications/{id}/analyze — starts financial/risk analysis.
// Architecture supports async jobs; this implementation runs synchronously
// and wraps the result in a Job envelope for forward compatibility.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const { organization_id, actor, actor_type } = await resolveOrganization(base44);
    const { application_id } = body;

    if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
    const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
    if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);
    const app = apps[0];

    const job = await base44.asServiceRole.entities.Job.create({
      organization_id,
      job_reference: genId("JOB"),
      application_id,
      type: "analyze",
      status: "processing"
    });

    await base44.asServiceRole.entities.Application.update(app.id, { status: "analyzing" });

    // Load normalized inputs
    const creditProfiles = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id }, "-created_date", 1);
    const financialProfiles = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id, organization_id }, "-created_date", 1);
    const credit = creditProfiles[0] || defaultCredit(app.loan_currency);
    const financial = financialProfiles[0] || defaultFinancial(app.loan_currency);

    const { signals, evidence } = generateRiskSignals({ credit, financial, application: app });

    // Clear previous signals/evidence for this application
    const prevSignals = await base44.asServiceRole.entities.RiskSignal.filter({ application_id, organization_id }, "-created_date", 500);
    if (prevSignals.length) await base44.asServiceRole.entities.RiskSignal.deleteMany({ application_id, organization_id });
    const prevEvidence = await base44.asServiceRole.entities.Evidence.filter({ application_id, organization_id }, "-created_date", 500);
    if (prevEvidence.length) await base44.asServiceRole.entities.Evidence.deleteMany({ application_id, organization_id });

    if (signals.length) {
      await base44.asServiceRole.entities.RiskSignal.bulkCreate(signals.map(s => ({
        organization_id, application_id,
        category: s.category, signal: s.signal,
        value: s.value, value_type: s.value_type,
        currency: s.currency || null, confidence: s.confidence,
        source: s.source, source_reference: s.source_reference || null, flag: s.flag
      })));
    }
    if (evidence.length) {
      await base44.asServiceRole.entities.Evidence.bulkCreate(evidence.map(e => ({
        organization_id, application_id,
        signal: e.signal, value: e.value, value_type: e.value_type,
        currency: e.currency || null, source: e.source,
        source_reference: e.source_reference || null, confidence: e.confidence
      })));
    }

    await base44.asServiceRole.entities.Job.update(job.id, {
      status: "completed",
      result: { signal_count: signals.length, evidence_count: evidence.length }
    });

    await audit(base44, organization_id, "application.analyzed", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/analyze", details: { job_id: job.id, signal_count: signals.length } });

    return apiSuccess({ job_id: job.id, status: "completed", signal_count: signals.length, evidence_count: evidence.length }, 202);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

function defaultCredit(currency: string) {
  return { credit_score: 650, score_band: "good", active_accounts: 3, delinquent_accounts: 0, defaults: 0, outstanding_balance: 1500, credit_utilisation: 0.3, credit_enquiries: 1, repayment_history_score: 90, currency };
}
function defaultFinancial(currency: string) {
  return { monthly_income: 3000, monthly_expenses: 2000, disposable_income: 1000, income_stability: 0.7, expense_volatility: 0.3, average_balance: 1200, debt_payments: 300, recurring_obligations: 800, debt_to_income: 0.1, income_to_loan: 0.5, repayment_capacity: 600, affordability_ratio: 0.5, currency };
}