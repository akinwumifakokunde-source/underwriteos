// Risk-based pricing engine. Calculates an interest rate (APR) for approved
// applications based on the risk score and the lender's policy. Higher-risk
// borrowers pay a higher rate; declines and reviews receive no offer.
//
// Each policy carries a tiered pricing schedule. The risk score (0..1 from the
// decision engine) maps to the first tier whose max_risk_score bound it falls
// within. Rates are market-appropriate APRs grounded in typical consumer-credit
// pricing for each jurisdiction.

export interface PricingTier {
  max_risk_score: number; // upper bound (0..1) for this tier
  rate: number; // APR (e.g. 0.12 = 12%)
}

export interface PricingConfig {
  base_rate: number;
  tiers: PricingTier[];
}

// Rates are APR percentages (e.g. 11.9 = 11.9% APR), matching the
// interest_rate field convention used by the affordability/payment calculators.
export const PRICING_CONFIG: Record<string, PricingConfig> = {
  "consumer-v1": {
    base_rate: 12,
    tiers: [
      { max_risk_score: 0.2, rate: 7.9 },
      { max_risk_score: 0.4, rate: 11.9 },
      { max_risk_score: 0.6, rate: 18.9 },
      { max_risk_score: 0.8, rate: 24.9 },
      { max_risk_score: 1.0, rate: 29.9 },
    ],
  },
  "us-consumer-v2": {
    base_rate: 15,
    tiers: [
      { max_risk_score: 0.2, rate: 8.9 },
      { max_risk_score: 0.4, rate: 14.9 },
      { max_risk_score: 0.6, rate: 22.9 },
      { max_risk_score: 0.8, rate: 29.9 },
      { max_risk_score: 1.0, rate: 35.9 },
    ],
  },
  "ng-consumer-v1": {
    base_rate: 25,
    tiers: [
      { max_risk_score: 0.2, rate: 18 },
      { max_risk_score: 0.4, rate: 24 },
      { max_risk_score: 0.6, rate: 32 },
      { max_risk_score: 0.8, rate: 40 },
      { max_risk_score: 1.0, rate: 45 },
    ],
  },
  "za-consumer-v1": {
    base_rate: 22,
    tiers: [
      { max_risk_score: 0.2, rate: 15 },
      { max_risk_score: 0.4, rate: 21 },
      { max_risk_score: 0.6, rate: 29 },
      { max_risk_score: 0.8, rate: 36 },
      { max_risk_score: 1.0, rate: 40 },
    ],
  },
  "ke-consumer-v1": {
    base_rate: 20,
    tiers: [
      { max_risk_score: 0.2, rate: 14 },
      { max_risk_score: 0.4, rate: 19 },
      { max_risk_score: 0.6, rate: 27 },
      { max_risk_score: 0.8, rate: 34 },
      { max_risk_score: 1.0, rate: 38 },
    ],
  },
  "gh-consumer-v1": {
    base_rate: 25,
    tiers: [
      { max_risk_score: 0.2, rate: 18 },
      { max_risk_score: 0.4, rate: 24 },
      { max_risk_score: 0.6, rate: 32 },
      { max_risk_score: 0.8, rate: 40 },
      { max_risk_score: 1.0, rate: 45 },
    ],
  },
  "mortgage-v1": {
    base_rate: 6,
    tiers: [
      { max_risk_score: 0.2, rate: 3.9 },
      { max_risk_score: 0.4, rate: 5.4 },
      { max_risk_score: 0.6, rate: 6.9 },
      { max_risk_score: 0.8, rate: 8.4 },
      { max_risk_score: 1.0, rate: 9.9 },
    ],
  },
  "business-v1": {
    base_rate: 10,
    tiers: [
      { max_risk_score: 0.2, rate: 6.9 },
      { max_risk_score: 0.4, rate: 9.9 },
      { max_risk_score: 0.6, rate: 13.9 },
      { max_risk_score: 0.8, rate: 16.9 },
      { max_risk_score: 1.0, rate: 19.9 },
    ],
  },
};

// Calculate the risk-based interest rate (APR) for a decision.
// Returns null for non-approve decisions (no offer) or unknown policies.
export function calculateRate(policyId: string, riskScore: number, decision: string): number | null {
  if (decision !== "APPROVE") return null;
  const config = PRICING_CONFIG[policyId];
  if (!config) return null;
  const clamped = Math.max(0, Math.min(1, riskScore));
  for (const tier of config.tiers) {
    if (clamped <= tier.max_risk_score) return tier.rate;
  }
  return config.tiers[config.tiers.length - 1].rate;
}