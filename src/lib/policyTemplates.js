// Frontend source of truth for policy templates shown in the Policies page and
// workspace. Mirrors the backend built-in baselines (base44/shared/policyEngine.ts)
// so lenders see jurisdiction-appropriate starting rules per market + product type.

import { JURISDICTIONS, getJurisdiction } from "./jurisdictions";

// Market-specific consumer lending baselines (thresholds tuned per market).
const CONSUMER_BASELINES = {
  GB: {
    policy_id: "consumer-v1", name: "UK Consumer Lending v1",
    description: "Baseline UK consumer credit policy (Experian / Equifax / TransUnion).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 500, decision: "DECLINE", reason: "Credit score below minimum (500)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.45, decision: "REVIEW", reason: "DTI exceeds policy threshold (45%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.4, decision: "REVIEW", reason: "Credit utilisation above review threshold (40%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 3, decision: "REVIEW", reason: "High recent credit enquiries (>3)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 80, decision: "REVIEW", reason: "Repayment history below review threshold (80)" },
    ],
  },
  US: {
    policy_id: "us-consumer-v2", name: "US Consumer Lending v2",
    description: "Baseline US consumer lending policy (FICO — Experian / Equifax / TransUnion).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 580, decision: "DECLINE", reason: "FICO score below minimum (580)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.43, decision: "REVIEW", reason: "DTI exceeds US guideline (43%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "Credit utilisation above review threshold (50%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 4, decision: "REVIEW", reason: "High recent credit enquiries (>4)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 75, decision: "REVIEW", reason: "Repayment history below review threshold (75)" },
    ],
  },
  NG: {
    policy_id: "ng-consumer-v1", name: "Nigeria Consumer Lending v1",
    description: "Baseline Nigeria consumer lending policy (CRC / Credit Registry / FirstCentral).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 540, decision: "DECLINE", reason: "Credit score below minimum (540)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "DTI exceeds policy threshold (50%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.6, decision: "REVIEW", reason: "Credit utilisation above review threshold (60%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 5, decision: "REVIEW", reason: "High recent credit enquiries (>5)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 70, decision: "REVIEW", reason: "Repayment history below review threshold (70)" },
    ],
  },
  ZA: {
    policy_id: "za-consumer-v1", name: "South Africa Consumer Lending v1",
    description: "Baseline South Africa consumer credit policy (NCA / FICA — Experian / TransUnion / XDS).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 560, decision: "DECLINE", reason: "Credit score below minimum (560)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.45, decision: "REVIEW", reason: "DTI exceeds NCA affordability threshold (45%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "Credit utilisation above review threshold (50%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 4, decision: "REVIEW", reason: "High recent credit enquiries (>4)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 75, decision: "REVIEW", reason: "Repayment history below review threshold (75)" },
    ],
  },
  KE: {
    policy_id: "ke-consumer-v1", name: "Kenya Consumer Lending v1",
    description: "Baseline Kenya consumer lending policy (CRB Africa / TransUnion / Metropol).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 540, decision: "DECLINE", reason: "Credit score below minimum (540)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "DTI exceeds policy threshold (50%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.6, decision: "REVIEW", reason: "Credit utilisation above review threshold (60%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 5, decision: "REVIEW", reason: "High recent credit enquiries (>5)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 70, decision: "REVIEW", reason: "Repayment history below review threshold (70)" },
    ],
  },
  GH: {
    policy_id: "gh-consumer-v1", name: "Ghana Consumer Lending v1",
    description: "Baseline Ghana consumer lending policy (XDS Ghana / Dun & Bradstreet).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 540, decision: "DECLINE", reason: "Credit score below minimum (540)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "DTI exceeds policy threshold (50%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.6, decision: "REVIEW", reason: "Credit utilisation above review threshold (60%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 5, decision: "REVIEW", reason: "High recent credit enquiries (>5)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 70, decision: "REVIEW", reason: "Repayment history below review threshold (70)" },
    ],
  },
};

const SME_TEMPLATE = {
  policy_id: "sme-v1", name: "SME Lending v1",
  description: "Small business lending policy.",
  rules: [
    { rule_id: "AF-INC", field: "annual_income", operator: "<", threshold: 30000, decision: "DECLINE", reason: "Annual revenue below minimum" },
    { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "Debt-to-income exceeds 50%" },
    { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
    { rule_id: "INC-STAB", field: "income_stability", operator: "<", threshold: 0.5, decision: "REVIEW", reason: "Income stability below threshold" },
  ],
};

const MORTGAGE_TEMPLATE = {
  policy_id: "mortgage-v1", name: "Mortgage Lending v1",
  description: "Baseline mortgage policy — stricter affordability and credit thresholds.",
  rules: [
    { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 620, decision: "DECLINE", reason: "Credit score below mortgage minimum (620)" },
    { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.36, decision: "REVIEW", reason: "Debt-to-income exceeds mortgage threshold (36%)" },
    { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
    { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
    { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.3, decision: "REVIEW", reason: "Credit utilisation above mortgage threshold (30%)" },
    { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 90, decision: "REVIEW", reason: "Repayment history below mortgage threshold (90%)" },
    { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 3, decision: "REVIEW", reason: "High recent credit enquiries (>3)" },
  ],
};

const BUSINESS_TEMPLATE = {
  policy_id: "business-v1", name: "Business Loan v1",
  description: "Baseline business loan policy — revenue, cashflow and credit checks.",
  rules: [
    { rule_id: "AF-INC", field: "annual_income", operator: "<", threshold: 50000, decision: "DECLINE", reason: "Annual revenue below business minimum" },
    { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "Debt-to-income exceeds 50%" },
    { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
    { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
    { rule_id: "INC-STAB", field: "income_stability", operator: "<", threshold: 0.5, decision: "REVIEW", reason: "Income stability below threshold" },
    { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.6, decision: "REVIEW", reason: "Credit utilisation above review threshold (60%)" },
  ],
};

export const TEMPLATE_TYPES = [
  { key: "consumer", label: "Consumer Lending", description: "Retail credit — personal loans, credit cards" },
  { key: "mortgage", label: "Mortgage", description: "Home loans — stricter affordability" },
  { key: "business", label: "Business Loan", description: "SME / commercial lending" },
  { key: "sme", label: "SME Lending", description: "Small business lending" },
];

// Returns a market-aware template { policy_id, name, description, rules } for the
// given market + template type. Consumer templates are jurisdiction-specific;
// mortgage/business/sme are market-agnostic baselines.
export function getPolicyTemplate(market, type) {
  const jur = getJurisdiction(market || "GB");
  if (type === "consumer") {
    return CONSUMER_BASELINES[jur.code] || CONSUMER_BASELINES.GB;
  }
  if (type === "mortgage") return MORTGAGE_TEMPLATE;
  if (type === "business") return BUSINESS_TEMPLATE;
  if (type === "sme") return SME_TEMPLATE;
  return CONSUMER_BASELINES[jur.code] || CONSUMER_BASELINES.GB;
}

// Suggest a policy id from a product type + market (used to auto-select policy
// when the lender picks a loan product).
export function suggestPolicyForProduct(market, productType) {
  const jur = getJurisdiction(market || "GB");
  if (productType === "mortgage" && jur.policies.some((p) => p.id === "mortgage-v1")) return "mortgage-v1";
  if (productType === "business_loan" && jur.policies.some((p) => p.id === "business-v1")) return "business-v1";
  return jur.policies[0]?.id || "consumer-v1";
}