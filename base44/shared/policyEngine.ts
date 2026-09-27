// Policy engine. Evaluates a versioned policy against a set of risk signals
// and produces a structured policy outcome. The AI never overrides this.

import { getDefaultPolicyId } from "./markets.ts";

export interface PolicyRule {
  rule_id: string;
  field: string;
  operator: string;
  threshold: any;
  decision: "APPROVE" | "REVIEW" | "DECLINE";
  reason: string;
}

export interface PolicyOutcome {
  policy_id: string;
  policy_version: string;
  evaluated_rules: any[];
  triggered_rules: any[];
  decision: "APPROVE" | "REVIEW" | "DECLINE";
  reasons: string[];
  adverse_action_codes: AdverseActionCode[];
}

export interface AdverseActionCode {
  code: string;
  label: string;
  rule_id: string;
  reason: string;
}

// Standardized adverse-action reason codes. Mapped from policy rule_id so
// declines/reviews carry regulator-compliant reason codes (US ECOA/Reg B,
// UK Consumer Credit Act, and equivalent consumer-credit regimes) instead
// of free-text. Lenders can use these directly on adverse-action notices.
export const ADVERSE_ACTION_CODES: Record<string, { code: string; label: string }> = {
  "CR-SCORE": { code: "CREDIT_SCORE_LOW", label: "Credit score below minimum" },
  "CR-DEF": { code: "DEFAULTS_ON_FILE", label: "Active defaults on credit file" },
  "CR-UTIL": { code: "CREDIT_UTILISATION_HIGH", label: "Credit utilisation above threshold" },
  "CR-ENQ": { code: "EXCESSIVE_ENQUIRIES", label: "High number of recent credit enquiries" },
  "RP-HIST": { code: "POOR_REPAYMENT_HISTORY", label: "Repayment history below threshold" },
  "AF-DTI": { code: "DEBT_TO_INCOME_HIGH", label: "Debt obligations too high relative to income" },
  "AF-CAP": { code: "INSUFFICIENT_REPAYMENT_CAPACITY", label: "Insufficient disposable income to service the loan" },
  "AF-INC": { code: "INSUFFICIENT_INCOME", label: "Income below minimum for requested loan" },
  "INC-STAB": { code: "INCOME_INSTABILITY", label: "Income stability below threshold" },
  "FR-FLAG": { code: "FRAUD_INDICATOR", label: "Potential fraud signal detected" },
};

export function adverseActionForRule(ruleId: string): { code: string; label: string } | null {
  return ADVERSE_ACTION_CODES[ruleId] || null;
}

// Built-in default policies per market. Organizations can override any of these
// via the Policy entity (matched by policy_id + status active). These built-ins
// ensure every supported market has a real, jurisdiction-appropriate baseline
// policy out of the box instead of falling back to the UK consumer policy.
export const DEFAULT_POLICY = {
  policy_id: "consumer-v1",
  version: "1",
  name: "UK Consumer Lending v1",
  description: "Baseline UK consumer credit policy (Experian / Equifax / TransUnion).",
  rules: [
    { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 500, decision: "DECLINE", reason: "Credit score below minimum (500)" },
    { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.45, decision: "REVIEW", reason: "Existing debt exceeds policy threshold" },
    { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
    { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
    { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
    { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.4, decision: "REVIEW", reason: "Credit utilisation above review threshold (40%)" },
    { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 3, decision: "REVIEW", reason: "High recent credit enquiries (>3)" },
    { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 80, decision: "REVIEW", reason: "Repayment history below review threshold (80)" }
  ]
};

// Built-in baseline policies for every supported market. Keyed by policy_id so
// the engine resolves the correct jurisdictional baseline without an org override.
export const BUILTIN_POLICIES: Record<string, any> = {
  "consumer-v1": DEFAULT_POLICY,
  "us-consumer-v2": {
    policy_id: "us-consumer-v2", version: "2", name: "US Consumer Lending v2",
    description: "Baseline US consumer lending policy (FICO — Experian / Equifax / TransUnion).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 580, decision: "DECLINE", reason: "FICO score below minimum (580)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.43, decision: "REVIEW", reason: "DTI exceeds US guideline (43%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "Credit utilisation above review threshold (50%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 4, decision: "REVIEW", reason: "High recent credit enquiries (>4)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 75, decision: "REVIEW", reason: "Repayment history below review threshold (75)" }
    ]
  },
  "ng-consumer-v1": {
    policy_id: "ng-consumer-v1", version: "1", name: "Nigeria Consumer Lending v1",
    description: "Baseline Nigeria consumer lending policy (CRC / Credit Registry / FirstCentral).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 540, decision: "DECLINE", reason: "Credit score below minimum (540)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "DTI exceeds policy threshold (50%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.6, decision: "REVIEW", reason: "Credit utilisation above review threshold (60%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 5, decision: "REVIEW", reason: "High recent credit enquiries (>5)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 70, decision: "REVIEW", reason: "Repayment history below review threshold (70)" }
    ]
  },
  "za-consumer-v1": {
    policy_id: "za-consumer-v1", version: "1", name: "South Africa Consumer Lending v1",
    description: "Baseline South Africa consumer credit policy (NCA / FICA — Experian / TransUnion / XDS).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 560, decision: "DECLINE", reason: "Credit score below minimum (560)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.45, decision: "REVIEW", reason: "DTI exceeds NCA affordability threshold (45%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "Credit utilisation above review threshold (50%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 4, decision: "REVIEW", reason: "High recent credit enquiries (>4)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 75, decision: "REVIEW", reason: "Repayment history below review threshold (75)" }
    ]
  },
  "ke-consumer-v1": {
    policy_id: "ke-consumer-v1", version: "1", name: "Kenya Consumer Lending v1",
    description: "Baseline Kenya consumer lending policy (CRB Africa / TransUnion / Metropol).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 540, decision: "DECLINE", reason: "Credit score below minimum (540)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "DTI exceeds policy threshold (50%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.6, decision: "REVIEW", reason: "Credit utilisation above review threshold (60%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 5, decision: "REVIEW", reason: "High recent credit enquiries (>5)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 70, decision: "REVIEW", reason: "Repayment history below review threshold (70)" }
    ]
  },
  "gh-consumer-v1": {
    policy_id: "gh-consumer-v1", version: "1", name: "Ghana Consumer Lending v1",
    description: "Baseline Ghana consumer lending policy (XDS Ghana / Dun & Bradstreet).",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 540, decision: "DECLINE", reason: "Credit score below minimum (540)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "DTI exceeds policy threshold (50%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.6, decision: "REVIEW", reason: "Credit utilisation above review threshold (60%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 5, decision: "REVIEW", reason: "High recent credit enquiries (>5)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 70, decision: "REVIEW", reason: "Repayment history below review threshold (70)" }
    ]
  },
  "mortgage-v1": {
    policy_id: "mortgage-v1", version: "1", name: "Mortgage Lending v1",
    description: "Baseline mortgage policy — stricter affordability and credit thresholds.",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 620, decision: "DECLINE", reason: "Credit score below mortgage minimum (620)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.36, decision: "REVIEW", reason: "Debt-to-income exceeds mortgage threshold (36%)" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.3, decision: "REVIEW", reason: "Credit utilisation above mortgage threshold (30%)" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 3, decision: "REVIEW", reason: "High recent credit enquiries (>3)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 90, decision: "REVIEW", reason: "Repayment history below mortgage threshold (90%)" }
    ]
  },
  "business-v1": {
    policy_id: "business-v1", version: "1", name: "Business Loan v1",
    description: "Baseline business loan policy — revenue, cashflow and credit checks.",
    rules: [
      { rule_id: "AF-INC", field: "annual_income", operator: "<", threshold: 50000, decision: "DECLINE", reason: "Annual revenue below business minimum" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "Debt-to-income exceeds 50%" },
      { rule_id: "FR-FLAG", field: "suspicious_transactions", operator: "==", threshold: true, decision: "REVIEW", reason: "Potential fraud signal detected" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "AF-CAP", field: "repayment_capacity", operator: "<", threshold: 0, decision: "DECLINE", reason: "Insufficient repayment capacity" },
      { rule_id: "INC-STAB", field: "income_stability", operator: "<", threshold: 0.5, decision: "REVIEW", reason: "Income stability below threshold" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.6, decision: "REVIEW", reason: "Credit utilisation above review threshold (60%)" }
    ]
  }
};

// Resolve a policy for evaluation. Order: org override (active, by policy_id) →
// built-in baseline (by policy_id) → market default baseline → UK default.
export function getPolicy(policyId: string | undefined, orgPolicies: any[], market?: string): any {
  if (policyId) {
    const match = orgPolicies.find(p => p.policy_id === policyId && p.status === "active");
    if (match) return { policy_id: match.policy_id, version: match.version, name: match.name, description: match.description, rules: match.rules };
    if (BUILTIN_POLICIES[policyId]) return BUILTIN_POLICIES[policyId];
  }
  const marketDefaultId = market ? getDefaultPolicyId(market) : null;
  if (marketDefaultId && BUILTIN_POLICIES[marketDefaultId]) return BUILTIN_POLICIES[marketDefaultId];
  return DEFAULT_POLICY;
}

export function evaluatePolicy(policy: any, signals: any[]): PolicyOutcome {
  const signalMap: Record<string, any> = {};
  for (const s of signals) signalMap[s.signal] = s.value;

  const triggered: any[] = [];
  const evaluated: any[] = [];
  const reasons: string[] = [];
  let decision: "APPROVE" | "REVIEW" | "DECLINE" = "APPROVE";
  const rank = { APPROVE: 0, REVIEW: 1, DECLINE: 2 };

  for (const rule of policy.rules || []) {
    const actual = signalMap[rule.field];
    const isTriggered = actual !== undefined && matches(actual, rule.operator, rule.threshold);
    evaluated.push({
      rule_id: rule.rule_id,
      field: rule.field,
      operator: rule.operator,
      threshold: rule.threshold,
      input: actual ?? null,
      result: isTriggered ? "FAIL" : "PASS",
      decision: rule.decision,
      reason: rule.reason
    });
    if (isTriggered) {
      const aa = adverseActionForRule(rule.rule_id);
      triggered.push({ rule_id: rule.rule_id, field: rule.field, operator: rule.operator, actual, threshold: rule.threshold, decision: rule.decision, reason: rule.reason, adverse_action_code: aa?.code || null, adverse_action_label: aa?.label || null });
      reasons.push(rule.reason);
      if (rank[rule.decision] > rank[decision]) decision = rule.decision;
    }
  }

  // Collect standardized adverse-action codes for non-approve outcomes.
  const adverse_action_codes: AdverseActionCode[] = [];
  const seen = new Set<string>();
  for (const t of triggered) {
    if (!t.adverse_action_code || seen.has(t.adverse_action_code)) continue;
    seen.add(t.adverse_action_code);
    adverse_action_codes.push({ code: t.adverse_action_code, label: t.adverse_action_label || t.reason, rule_id: t.rule_id, reason: t.reason });
  }

  return {
    policy_id: policy.policy_id,
    policy_version: policy.version,
    evaluated_rules: evaluated,
    triggered_rules: triggered,
    decision,
    reasons,
    adverse_action_codes
  };
}

function matches(actual: any, operator: string, threshold: any): boolean {
  switch (operator) {
    case "<": return Number(actual) < Number(threshold);
    case "<=": return Number(actual) <= Number(threshold);
    case ">": return Number(actual) > Number(threshold);
    case ">=": return Number(actual) >= Number(threshold);
    case "==": return actual === threshold;
    case "!=": return actual !== threshold;
    case "between": return Number(actual) >= Number(threshold[0]) && Number(actual) <= Number(threshold[1]);
    default: return false;
  }
}