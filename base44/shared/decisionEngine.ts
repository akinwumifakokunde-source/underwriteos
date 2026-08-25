// Decision engine. Combines risk score, policy outcome, and AI memo into a
// final underwriting decision. Separation of concerns is enforced:
// the AI analysis never overrides lender policy.

import { computeRiskScore } from "./riskEngine.ts";

export interface DecisionInput {
  application: any;
  signals: any[];
  policyOutcome: any;
  ai: any;
}

export interface DecisionResult {
  decision: "APPROVE" | "REVIEW" | "DECLINE";
  risk_score: number;
  probability_of_default: number;
  confidence: number;
  human_review_required: boolean;
  reasons: string[];
}

export function finalizeDecision(input: DecisionInput): DecisionResult {
  const riskScore = computeRiskScore(input.signals);
  const policyDecision = input.policyOutcome.decision;

  // Probability of default derived from risk score (sigmoid-ish mapping).
  const pd = Math.round((0.02 + riskScore * 0.25) * 1000) / 1000;

  // The final decision is the policy decision. AI confidence influences
  // whether human review is required, but never overrides policy.
  const confidence = Math.round(((input.ai.confidence || 0.7) + (1 - Math.abs(riskScore - 0.5))) / 2 * 100) / 100;

  const humanReviewRequired =
    policyDecision === "REVIEW" ||
    confidence < 0.7 ||
    input.signals.some(s => s.category === "fraud" && s.flag === "critical");

  const reasons = [...(input.policyOutcome.reasons || [])];
  if (input.ai.risk_factors?.length) reasons.push(...input.ai.risk_factors.slice(0, 3));
  if (input.ai.positive_signals?.length) reasons.push(...input.ai.positive_signals.slice(0, 2));

  return {
    decision: policyDecision,
    risk_score: riskScore,
    probability_of_default: pd,
    confidence,
    human_review_required: humanReviewRequired,
    reasons
  };
}