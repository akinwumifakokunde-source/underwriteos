import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";
import { generateRiskSignals } from "../../shared/riskEngine.ts";

// POST /v1/applications/{id}/analyze — runs the normalization -> risk signal ->
// evidence pipeline. Produces structured RiskSignals each linked to traceable Evidence.
// Architecture supports async jobs; this implementation runs synchronously and
// wraps the result in a Job envelope for forward compatibility.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    requireScope(ctx, "applications:write");
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

    // Load normalized inputs + source references for evidence traceability
    const creditProfiles = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id }, "-created_date", 1);
    const financialProfiles = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id, organization_id }, "-created_date", 1);
    const bankStatements = await base44.asServiceRole.entities.BankStatement.filter({ application_id, organization_id }, "-created_date", 1);
    const credit = creditProfiles[0] || defaultCredit(app.loan_currency);
    const financial = financialProfiles[0] || defaultFinancial(app.loan_currency);

    const { items } = generateRiskSignals({
      credit,
      financial,
      application: app,
      credit_report_id: credit.credit_report_id || (creditProfiles[0]?.id),
      bank_statement_id: bankStatements[0]?.id
    });

    // Clear previous signals/evidence for this application
    const prevSignals = await base44.asServiceRole.entities.RiskSignal.filter({ application_id, organization_id }, "-created_date", 500);
    if (prevSignals.length) await base44.asServiceRole.entities.RiskSignal.deleteMany({ application_id, organization_id });
    const prevEvidence = await base44.asServiceRole.entities.Evidence.filter({ application_id, organization_id }, "-created_date", 500);
    if (prevEvidence.length) await base44.asServiceRole.entities.Evidence.deleteMany({ application_id, organization_id });

    // 1. Create signals (without evidence_id yet)
    let signalCount = 0;
    let evidenceCount = 0;
    if (items.length) {
      const createdSignals = await base44.asServiceRole.entities.RiskSignal.bulkCreate(items.map(({ signal: s }) => ({
        organization_id, application_id,
        category: s.category, signal: s.signal,
        value: s.value, value_type: s.value_type,
        currency: s.currency || null, confidence: s.confidence,
        source: s.source, source_reference: s.source_reference || null, flag: s.flag,
        severity: s.severity, direction: s.direction,
        threshold: s.threshold ?? null, explanation: s.explanation || null
      })));
      signalCount = createdSignals.length;

      // 2. Create evidence linked to each signal
      const evidenceRecords = items.map(({ signal: s, evidence: ev }, i) => ({
        organization_id, application_id,
        signal_id: createdSignals[i]?.id || null,
        signal: ev.signal,
        value: ev.value, value_type: ev.value_type,
        currency: ev.currency || null,
        source_type: ev.source_type,
        source_provider: ev.source_provider || null,
        source_id: ev.source_id || null,
        document_id: ev.document_id || null,
        source_location: ev.source_location || null,
        field: ev.field || null,
        calculation_method: ev.calculation_method,
        confidence: ev.confidence
      }));
      const createdEvidence = await base44.asServiceRole.entities.Evidence.bulkCreate(evidenceRecords);
      evidenceCount = createdEvidence.length;

      // 3. Link signals back to their evidence
      const signalUpdates = createdSignals.map((s, i) => ({
        id: s.id,
        evidence_id: createdEvidence[i]?.id || null
      })).filter(u => u.evidence_id);
      if (signalUpdates.length) await base44.asServiceRole.entities.RiskSignal.bulkUpdate(signalUpdates);
    }

    await base44.asServiceRole.entities.Job.update(job.id, {
      status: "completed",
      result: { signal_count: signalCount, evidence_count: evidenceCount }
    });

    await audit(base44, organization_id, "application.analyzed", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/analyze", credits: 30, details: { job_id: job.id, signal_count: signalCount, evidence_count: evidenceCount } });

    return apiSuccess({ job_id: job.id, status: "completed", signal_count: signalCount, evidence_count: evidenceCount }, 202);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

function defaultCredit(currency: string) {
  return { credit_score: 650, score_band: "good", active_accounts: 3, closed_accounts: 1, delinquent_accounts: 0, defaults: 0, outstanding_balance: 1500, credit_utilisation: 0.3, recent_enquiries: 1, repayment_history: 90, currency };
}
function defaultFinancial(currency: string) {
  return {
    currency,
    income: { monthly: 3000, annual: 36000, stability: 0.7, sources: 1 },
    expenses: { monthly: 2000, volatility: 0.3, recurring: 800, categories: {} },
    assets: { total: 1200, liquid: 1200 },
    liabilities: { total: 3600, monthly_servicing: 1100 },
    debt: { total: 3600, monthly_payments: 300, to_income: 0.1 },
    cashflow: { monthly_net: 1000, average_balance: 1200, disposable_income: 1000 },
    credit: { utilisation: null, outstanding_balance: null },
    affordability: { debt_to_income: 0.1, income_to_loan: 0.5, repayment_capacity: 600, affordability_ratio: 0.5 },
    employment: { status: null, employer: null, annual_income: null },
    financial_behaviour: { income_stability: 0.7, expense_volatility: 0.3, savings_pattern: "consistent_saver", recurring_obligations: 800 }
  };
}