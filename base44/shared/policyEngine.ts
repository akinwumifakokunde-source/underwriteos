// Policy engine. Evaluates a versioned policy against a set of risk signals
// and produces a structured policy outcome. The AI never overrides this.

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
}

// Built-in default policy. Organizations can override via the Policy entity.
export const DEFAULT_POLICY = {
  policy_id: "consumer-v1",
  version: "1",
  name: "Consumer Lending v1",
  description: "Baseline consumer credit policy.",
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

export function getPolicy(policyId: string, orgPolicies: any[]): any {
  const match = orgPolicies.find(p => p.policy_id === policyId && p.status === "active");
  return match ? { policy_id: match.policy_id, version: match.version, name: match.name, description: match.description, rules: match.rules } : DEFAULT_POLICY;
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
      triggered.push({ rule_id: rule.rule_id, field: rule.field, operator: rule.operator, actual, threshold: rule.threshold, decision: rule.decision, reason: rule.reason });
      reasons.push(rule.reason);
      if (rank[rule.decision] > rank[decision]) decision = rule.decision;
    }
  }

  return {
    policy_id: policy.policy_id,
    policy_version: policy.version,
    evaluated_rules: evaluated,
    triggered_rules: triggered,
    decision,
    reasons
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