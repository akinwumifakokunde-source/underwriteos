// Decision engine. Enforces separation of concerns:
//   AI Analysis -> Risk Signals -> Evidence -> Policy Engine -> Recommendation -> Final Decision
//
// The AI recommendation NEVER overrides lender policy. The final decision is
// authoritative and is derived from the policy engine (or a human/automated
// override that must record its reason).

import { computeRiskScore, GeneratedSignal } from "./riskEngine.ts";

export interface RecommendationInput {
  application: any;
  signals: GeneratedSignal[];
  policyOutcome: any;
  ai: any;
}

export interface RecommendationResult {
  recommendation: "APPROVE" | "REVIEW" | "DECLINE";
  confidence: number;
  risk_score: number;
  probability_of_default: number;
  reasons: string[];
  human_review_required: boolean;
}

// Build the AI-informed recommendation. This is advisory only.
export function buildRecommendation(input: RecommendationInput): RecommendationResult {
  const riskScore = computeRiskScore(input.signals);
  const pd = Math.round((0.02 + riskScore * 0.25) * 1000) / 1000;
  const confidence = Math.round(((input.ai.confidence || 0.7) + (1 - Math.abs(riskScore - 0.5))) / 2 * 100) / 100;

  // The recommendation is the AI's suggested action based on risk score.
  let recommendation: "APPROVE" | "REVIEW" | "DECLINE" = "APPROVE";
  if (riskScore >= 0.7 || input.signals.some(s => s.category === "fraud" && s.flag === "critical")) recommendation = "DECLINE";
  else if (riskScore >= 0.45) recommendation = "REVIEW";

  const humanReviewRequired =
    recommendation === "REVIEW" ||
    confidence < 0.7 ||
    input.signals.some(s => s.category === "fraud" && s.flag === "critical");

  const reasons = [...(input.ai.positive_signals || []).slice(0, 2), ...(input.ai.risk_factors || []).slice(0, 3)];
  if (input.policyOutcome?.reasons?.length) reasons.push(...input.policyOutcome.reasons.slice(0, 2));

  return { recommendation, confidence, risk_score: riskScore, probability_of_default: pd, reasons, human_review_required: humanReviewRequired };
}

export interface FinalDecisionInput {
  application: any;
  policyOutcome: any;
  recommendation: RecommendationResult;
  actor?: string;
  decisionSource?: "policy_engine" | "human_underwriter" | "automated_workflow";
  overrideReason?: string;
}

export interface FinalDecisionResult {
  decision: "APPROVE" | "REVIEW" | "DECLINE";
  decided_by: string;
  decision_source: "policy_engine" | "human_underwriter" | "automated_workflow";
  policy_version: string;
  risk_score: number;
  probability_of_default: number;
  confidence: number;
  human_review_required: boolean;
  reasons: string[];
  override_reason?: string;
}

// The final decision is authoritative and follows lender policy.
// The AI recommendation informs but never overrides.
export function finalizeDecision(input: FinalDecisionInput): FinalDecisionResult {
  const policyDecision = input.policyOutcome.decision as "APPROVE" | "REVIEW" | "DECLINE";
  const decisionSource = input.decisionSource || "policy_engine";

  // If an actor overrides the policy decision, a reason must be recorded.
  let overrideReason = input.overrideReason;
  if (decisionSource !== "policy_engine" && policyDecision !== input.recommendation.recommendation && !overrideReason) {
    overrideReason = "Decision overrides policy engine outcome based on underwriter judgement.";
  }

  return {
    decision: policyDecision,
    decided_by: input.actor || "system",
    decision_source: decisionSource,
    policy_version: input.policyOutcome.policy_version,
    risk_score: input.recommendation.risk_score,
    probability_of_default: input.recommendation.probability_of_default,
    confidence: input.recommendation.confidence,
    human_review_required: input.recommendation.human_review_required,
    reasons: [...(input.policyOutcome.reasons || []), ...(input.recommendation.reasons || [])],
    override_reason: overrideReason
  };
}