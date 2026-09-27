import { audit, findIdempotent } from "./utils.ts";
import { getPolicy, evaluatePolicy } from "./policyEngine.ts";
import { generateUnderwritingMemo } from "./aiUnderwriter.ts";
import { buildRecommendation, finalizeDecision } from "./decisionEngine.ts";
import { calculateRate } from "./pricingEngine.ts";
import { generateAdverseActionNotice } from "./adverseActionNotice.ts";
import { deliverDecisionWebhooks } from "./webhookDelivery.ts";

// Shared full underwriting evaluation: policy engine -> AI memo ->
// recommendation -> final decision -> adverse-action notice -> webhooks.
// Used by the authenticated underwrite endpoint and re-run automatically when
// a borrower uploads new documents via the portal. Throws { status, code,
// message } on failure (e.g. ANALYSIS_REQUIRED when no signals exist).
export async function runUnderwrite(
  base44: any,
  application_id: string,
  organization_id: string,
  actor: string,
  actor_type: string,
  options: { policy_id?: string; override?: any; decision_source?: string; override_reason?: string; idempotency_key?: string } = {}
) {
  const { policy_id, override, decision_source, override_reason, idempotency_key } = options;
  const overrideDecision = override?.decision;
  const overrideReason = override?.reason || override_reason;
  const overrideActor = override?.decided_by;

  const existing = await findIdempotent(base44, "UnderwritingDecision", organization_id, idempotency_key);
  if (existing) {
    const recs = await base44.asServiceRole.entities.UnderwritingRecommendation.filter({ application_id, organization_id }, "-created_date", 1);
    return { recommendation: recs[0] || null, decision: existing };
  }

  const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
  if (apps.length === 0) throw { status: 404, code: "APPLICATION_NOT_FOUND", message: `Application ${application_id} was not found.` };
  const app = apps[0];

  await base44.asServiceRole.entities.Application.update(app.id, { status: "underwriting" });

  const signals = await base44.asServiceRole.entities.RiskSignal.filter({ application_id, organization_id }, "-created_date", 200);
  const evidence = await base44.asServiceRole.entities.Evidence.filter({ application_id, organization_id }, "-created_date", 200);

  if (signals.length === 0) throw { status: 409, code: "ANALYSIS_REQUIRED", message: "Run POST /v1/applications/{id}/analyze before underwriting." };

  const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id, organization_id }, "-created_date", 1);
  const creditProfiles = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id }, "-created_date", 1);
  const financialProfiles = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id, organization_id }, "-created_date", 1);

  const orgPolicies = await base44.asServiceRole.entities.Policy.filter({ organization_id, status: "active" }, "-created_date", 50);
  const policy = getPolicy(policy_id || app.policy_id, orgPolicies, app.market);
  const policyOutcome = evaluatePolicy(policy, signals);

  const ai = await generateUnderwritingMemo(base44, {
    borrower: borrowers[0] || {},
    application: app,
    credit: creditProfiles[0] || {},
    financial: financialProfiles[0] || {},
    signals,
    evidence,
    policyOutcome
  });

  const recommendation = buildRecommendation({ application: app, signals, policyOutcome, ai });

  const recommendationRecord = await base44.asServiceRole.entities.UnderwritingRecommendation.create({
    organization_id,
    application_id,
    recommendation: recommendation.recommendation,
    confidence: recommendation.confidence,
    risk_score: recommendation.risk_score,
    probability_of_default: recommendation.probability_of_default,
    reasons: recommendation.reasons,
    positive_signals: ai.positive_signals,
    risk_factors: ai.risk_factors,
    risk_signal_ids: signals.map(s => s.id),
    evidence_ids: evidence.map(e => e.id),
    policy_results: policyOutcome,
    ai_summary: ai.summary,
    ai_memo: ai.memo,
    human_review_required: recommendation.human_review_required,
    adverse_action_codes: recommendation.adverse_action_codes || [],
    generated_at: new Date().toISOString()
  });

  const decision = finalizeDecision({
    application: app,
    policyOutcome,
    recommendation,
    actor: overrideActor || (actor_type === "api_key" ? `api_key:${actor}` : actor),
    decisionSource: overrideDecision ? (decision_source || "human_underwriter") : (decision_source || "policy_engine"),
    overrideReason,
    overrideDecision
  });

  let adverseActionNotice: any = null;
  if (decision.decision !== "APPROVE" && decision.adverse_action_codes?.length) {
    const bureauEv = evidence.find((e: any) => e.source_type === "credit_report" && e.source_provider);
    const creditBureau = bureauEv?.source_provider || creditProfiles[0]?.provider || null;
    let lenderName = "the Lender";
    try {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: organization_id }, "-created_date", 1);
      if (orgs[0]?.name) lenderName = orgs[0].name;
    } catch {}
    adverseActionNotice = generateAdverseActionNotice({
      decision: decision.decision,
      adverse_action_codes: decision.adverse_action_codes,
      market: app.market || "GB",
      borrower: borrowers[0] || null,
      application: app,
      lenderName,
      creditBureau,
      decisionTimestamp: new Date().toISOString()
    });
  }

  const decisionRecord = await base44.asServiceRole.entities.UnderwritingDecision.create({
    organization_id,
    application_id,
    recommendation_id: recommendationRecord.id,
    decision: decision.decision,
    decided_by: decision.decided_by,
    decision_source: decision.decision_source,
    policy_id: policy.policy_id,
    policy_version: policy.version,
    decision_timestamp: new Date().toISOString(),
    override_reason: decision.override_reason || null,
    risk_score: decision.risk_score,
    probability_of_default: decision.probability_of_default,
    confidence: decision.confidence,
    human_review_required: decision.human_review_required,
    policy_outcome: policyOutcome,
    reasons: decision.reasons,
    adverse_action_codes: decision.adverse_action_codes || [],
    adverse_action_notice: adverseActionNotice,
    idempotency_key: idempotency_key || null
  });

  const interestRate = calculateRate(policy.policy_id, decision.risk_score, decision.decision);

  await base44.asServiceRole.entities.Application.update(app.id, {
    status: "completed",
    decision: decision.decision,
    risk_score: decision.risk_score,
    probability_of_default: decision.probability_of_default,
    confidence: decision.confidence,
    human_review_required: decision.human_review_required,
    reasons: decision.reasons,
    interest_rate: interestRate
  });

  let webhookResult: any = null;
  try {
    webhookResult = await deliverDecisionWebhooks(base44, organization_id, decisionRecord, app, interestRate);
  } catch (e: any) {
    webhookResult = { delivered: 0, error: e.message };
  }

  await audit(base44, organization_id, "decision.created", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/underwrite", credits: 20, details: { decision: decision.decision, decision_source: decision.decision_source, recommendation: recommendation.recommendation, risk_score: decision.risk_score, interest_rate: interestRate, webhooks_delivered: webhookResult?.delivered || 0 } });

  return { recommendation: recommendationRecord, decision: decisionRecord, interest_rate: interestRate, webhooks: webhookResult };
}