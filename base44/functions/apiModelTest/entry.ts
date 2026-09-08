import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiSuccess, apiError, readBody, resolveOrganization } from "../../shared/utils.ts";
import { buildModelFeatures, routeModel, getProvider, runRiskModel } from "../../shared/modelRegistry.ts";
import { generateRiskSignals } from "../../shared/riskEngine.ts";
import { getPolicy, evaluatePolicy } from "../../shared/policyEngine.ts";
import { buildRecommendation, finalizeDecision } from "../../shared/decisionEngine.ts";

// POST /v1/model-test — end-to-end acceptance test for the credit risk model
// integration. Runs the full ASSESS -> REASON -> GOVERN pipeline on a realistic
// sample application (or a provided application_id) and verifies the 10
// acceptance criteria from the model integration spec.
//
// The test never selects a model manually — the automatic router does. It
// verifies that PD comes from the model provider, critical calculations are
// deterministic, policy remains authoritative, evidence traces the decision,
// human overrides are audited, and no production score is fabricated when no
// validated model is available.

const SAMPLE = {
  borrower: { first_name: "Ada", last_name: "Okafor", employment_status: "employed", employer_name: "Acme Ltd", annual_income: 60000 },
  application: { loan_amount: 15000, loan_term_months: 48, loan_currency: "GBP", loan_purpose: "debt_consolidation", market: "GB", product_type: "personal_loan", borrower_type: "salaried", policy_id: "consumer-v1" },
  credit: { provider: "experian", credit_score: 720, active_accounts: 5, closed_accounts: 3, delinquent_accounts: 0, defaults: 0, outstanding_balance: 2000, credit_utilisation: 0.25, recent_enquiries: 1, repayment_history: 95 },
  financial: {
    currency: "GBP",
    income: { monthly: 5000, annual: 60000, stability: 0.85, sources: 1 },
    expenses: { monthly: 3000, volatility: 0.2, recurring: 800, categories: {} },
    cashflow: { monthly_net: 2000, average_balance: 2400, disposable_income: 2000 },
    debt: { total: 12000, monthly_payments: 1000, to_income: 0.2 },
    affordability: { debt_to_income: 0.2, income_to_loan: 4, repayment_capacity: 1200, affordability_ratio: 0.67 },
    financial_behaviour: { income_stability: 0.85, expense_volatility: 0.2, savings_pattern: "consistent_saver", recurring_obligations: 800 },
    employment: { status: "employed", employer: "Acme Ltd", annual_income: 60000 }
  }
};

function check(name, pass, detail) {
  return { check: name, pass: !!pass, detail: detail ?? "" };
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const application_id = body.application_id;

    // ---- Pure pipeline on the realistic sample (no DB needed) ----
    const fv = buildModelFeatures(SAMPLE.financial, SAMPLE.credit, SAMPLE.application, SAMPLE.borrower);
    const routing = routeModel({
      market: SAMPLE.application.market,
      product_type: SAMPLE.application.product_type,
      borrower_type: SAMPLE.application.borrower_type,
      features: fv.features
    });

    const provider = routing.selected ? getProvider(routing.selected.name) : null;
    const prediction = provider ? provider.predict(fv) : null;

    // Production routing: must NOT select a mock. With no real validated model
    // registered, production returns no eligible model (MODEL_UNAVAILABLE).
    const prodRouting = routeModel({
      market: SAMPLE.application.market,
      product_type: SAMPLE.application.product_type,
      borrower_type: SAMPLE.application.borrower_type,
      features: fv.features
    }, "production");

    const { items } = generateRiskSignals({
      credit: SAMPLE.credit, financial: SAMPLE.financial, application: SAMPLE.application,
      credit_report_id: "cr_sample", bank_statement_id: "bs_sample"
    });
    const signals = items.map(p => p.signal);
    const evidence = items.map(p => p.evidence);

    const policy = getPolicy(SAMPLE.application.policy_id, [], SAMPLE.application.market);
    const policyOutcome = evaluatePolicy(policy, signals);

    const ai = { confidence: 0.8, positive_signals: ["strong_repayment_history"], risk_factors: [] };
    const recommendation = buildRecommendation({ application: SAMPLE.application, signals, policyOutcome, ai, modelPrediction: prediction });

    const finalDecision = finalizeDecision({
      application: SAMPLE.application, policyOutcome, recommendation,
      actor: "system", decisionSource: "policy_engine"
    });

    // Human override pass (must be audited)
    const overrideDecision = finalizeDecision({
      application: SAMPLE.application, policyOutcome, recommendation,
      actor: "underwriter@acme", decisionSource: "human_underwriter",
      overrideDecision: "APPROVE", overrideReason: "Borrower provided additional income documentation."
    });

    // No-validated-model scenario: empty features -> no eligible model
    const emptyFv = buildModelFeatures(null, {}, SAMPLE.application, {});
    const emptyRouting = routeModel({
      market: SAMPLE.application.market, product_type: SAMPLE.application.product_type,
      borrower_type: SAMPLE.application.borrower_type, features: emptyFv.features
    }, "sandbox");

    const checks = [
      check("1. No user selects a model", !body.model_name && !body.selected_model && routing.selected !== null,
        "Router selected a model without any manual model_name input."),
      check("2. Sandbox selects a DEMO/MOCK model when no real validated model exists",
        !!routing.selected && routing.selected.is_mock === true,
        `Selected: ${routing.selected?.name} (is_mock=${routing.selected?.is_mock}) — DEMO/MOCK, not a real validated production model.`),
      check("3. Production returns MODEL_UNAVAILABLE (no real validated production model)",
        prodRouting.selected === null,
        `Production routing selected=${prodRouting.selected}; reason=${prodRouting.selection_reason}`),
      check("4. System never claims a mock is a validated production model",
        !!routing.selected && routing.selected.validation_status === "DRAFT" && routing.selected.production_status === "DRAFT",
        `Selected validation_status=${routing.selected?.validation_status}, production_status=${routing.selected?.production_status} (not VALIDATED/PRODUCTION).`),
      check("5. Model/version/routing decision recorded",
        !!prediction && !!prediction.model_name && !!prediction.model_version && routing.ranked.length > 0,
        `${prediction?.model_name} v${prediction?.model_version}; ranked: ${routing.ranked.map(r => `${r.model_name}(${r.role})`).join(", ")}`),
      check("6. PD comes from the (demo) provider",
        !!prediction && provider && prediction.probability_of_default === provider.predictPD(fv),
        `PD=${prediction?.probability_of_default} (DEMO RISK RESULT)`),
      check("7. Critical calculations are deterministic (not GPT)",
        fv.features.disposable_income === SAMPLE.financial.cashflow.disposable_income &&
        fv.features.debt_to_income === SAMPLE.financial.affordability.debt_to_income,
        `disposable_income=${fv.features.disposable_income} (formula: income_minus_expenses), dti=${fv.features.debt_to_income}`),
      check("8. GPT does not invent scores or financial metrics",
        !!prediction && recommendation.risk_score === prediction.credit_risk_score &&
        recommendation.probability_of_default === prediction.probability_of_default,
        `Recommendation risk_score=${recommendation.risk_score} matches model output, not AI.`),
      check("9. Policy remains authoritative",
        finalDecision.decision === policyOutcome.decision && finalDecision.decision_source === "policy_engine",
        `Policy=${policyOutcome.decision}, final=${finalDecision.decision} (no override)`),
      check("10. Evidence traces the decision back to source",
        items.length > 0 && evidence.every(e => e.source_type && e.calculation_method),
        `${items.length} signal/evidence pairs, each with source_type + calculation_method`),
      check("11. Human overrides are audited",
        overrideDecision.decision === "APPROVE" && overrideDecision.decision_source === "human_underwriter" && !!overrideDecision.override_reason,
        `Override to APPROVE recorded with reason: "${overrideDecision.override_reason}"`),
      check("12. No fabricated performance metrics shown as real",
        !!routing.selected && routing.selected.performance.auc === null && routing.selected.calibration.brier === null,
        `Selected performance.auc=${routing.selected?.performance.auc}, calibration.brier=${routing.selected?.calibration.brier} (null = not presented as real validation).`),
      check("13. No production score fabricated when no model has complete features",
        emptyRouting.selected === null,
        `Empty-feature sandbox routing selected=${emptyRouting.selected} (no demo model eligible without features).`)
    ];

    const allPass = checks.every(c => c.pass);

    let liveResult = null;
    if (application_id) {
      // Optionally run against a real persisted application to verify the wired path.
      try {
        const ctx = await resolveOrganization(base44, body);
        const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id: ctx.organization_id }, "-created_date", 1);
        if (apps.length > 0) {
          const app = apps[0];
          const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id, organization_id: ctx.organization_id }, "-created_date", 1);
          const creditProfiles = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id: ctx.organization_id }, "-created_date", 1);
          const financialProfiles = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id, organization_id: ctx.organization_id }, "-created_date", 1);
          liveResult = await runRiskModel(base44, {
            organization_id: ctx.organization_id, application_id, environment: ctx.environment,
            application: app, borrower: borrowers[0] || {}, financial: financialProfiles[0] || null, credit: creditProfiles[0] || null
          });
        }
      } catch (e) {
        liveResult = { available: false, reason: `live-run-error: ${e.message || e}` };
      }
    }

    return apiSuccess({
      status: allPass ? "PASS" : "FAIL",
      all_pass: allPass,
      checks,
      selected_model: routing.selected?.name || null,
      prediction: prediction ? {
        model_name: prediction.model_name,
        model_version: prediction.model_version,
        probability_of_default: prediction.probability_of_default,
        credit_risk_score: prediction.credit_risk_score,
        risk_band: prediction.risk_band,
        is_mock: prediction.is_mock,
        top_contributions: prediction.feature_contributions.slice(0, 5)
      } : null,
      routing: { selected: routing.selected?.name, is_mock: routing.selected?.is_mock ?? false, eligible: routing.eligible.map(m => m.name), fallback_chain: routing.fallback_chain, selection_reason: routing.selection_reason },
      production_routing: { selected: prodRouting.selected?.name || null, selection_reason: prodRouting.selection_reason },
      policy_outcome: { decision: policyOutcome.decision, triggered: policyOutcome.triggered_rules.map(r => r.rule_id) },
      final_decision: { decision: finalDecision.decision, decision_source: finalDecision.decision_source },
      live_result: liveResult
    }, 200);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}