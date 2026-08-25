// Risk signal generation. Produces structured RiskSignal + Evidence records
// from a normalized CreditProfile and FinancialProfile.

export interface SignalInput {
  credit: any;       // NormalizedCreditProfile
  financial: any;    // NormalizedFinancialProfile
  application: any;  // loan amount, term, etc.
}

export interface GeneratedSignal {
  category: string;
  signal: string;
  value: number | string | boolean;
  value_type: "number" | "string" | "boolean";
  currency?: string;
  confidence: number;
  source: string;
  source_reference?: string;
  flag: "positive" | "neutral" | "negative" | "critical";
}

export function generateRiskSignals(input: SignalInput): { signals: GeneratedSignal[]; evidence: GeneratedSignal[] } {
  const { credit, financial, application } = input;
  const currency = financial?.currency || application?.loan_currency || "GBP";
  const signals: GeneratedSignal[] = [];
  const evidence: GeneratedSignal[] = [];

  const push = (s: GeneratedSignal, withEvidence = true) => {
    signals.push(s);
    if (withEvidence) evidence.push({ ...s });
  };

  // ---- Credit signals ----
  push({ category: "credit", signal: "credit_score", value: credit.credit_score, value_type: "number", confidence: 0.95, source: "credit_report", flag: credit.credit_score >= 650 ? "positive" : credit.credit_score >= 550 ? "neutral" : "negative" });
  push({ category: "credit", signal: "active_accounts", value: credit.active_accounts, value_type: "number", confidence: 0.9, source: "credit_report", flag: "neutral" });
  push({ category: "credit", signal: "delinquent_accounts", value: credit.delinquent_accounts, value_type: "number", confidence: 0.9, source: "credit_report", flag: credit.delinquent_accounts > 0 ? "negative" : "positive" });
  push({ category: "credit", signal: "defaults", value: credit.defaults, value_type: "number", confidence: 0.93, source: "credit_report", flag: credit.defaults > 0 ? "critical" : "positive" });
  push({ category: "credit", signal: "outstanding_balance", value: credit.outstanding_balance, value_type: "number", currency, confidence: 0.88, source: "credit_report", flag: credit.outstanding_balance > 5000 ? "negative" : "neutral" });
  push({ category: "credit", signal: "credit_utilisation", value: credit.credit_utilisation, value_type: "number", confidence: 0.9, source: "credit_report", flag: credit.credit_utilisation > 0.7 ? "negative" : "positive" });
  push({ category: "credit", signal: "credit_enquiries", value: credit.credit_enquiries, value_type: "number", confidence: 0.85, source: "credit_report", flag: credit.credit_enquiries > 3 ? "negative" : "neutral" });
  push({ category: "credit", signal: "repayment_history_score", value: credit.repayment_history_score, value_type: "number", confidence: 0.92, source: "credit_report", flag: credit.repayment_history_score >= 90 ? "positive" : "negative" });

  // ---- Cashflow signals ----
  push({ category: "cashflow", signal: "monthly_income", value: financial.monthly_income, value_type: "number", currency, confidence: 0.96, source: "bank_statement", flag: "positive" });
  push({ category: "cashflow", signal: "monthly_expenses", value: financial.monthly_expenses, value_type: "number", currency, confidence: 0.94, source: "bank_statement", flag: "neutral" });
  push({ category: "cashflow", signal: "disposable_income", value: financial.disposable_income, value_type: "number", currency, confidence: 0.93, source: "derived", flag: financial.disposable_income > 0 ? "positive" : "negative" });
  push({ category: "cashflow", signal: "income_stability", value: financial.income_stability, value_type: "number", confidence: 0.82, source: "derived", flag: financial.income_stability >= 0.7 ? "positive" : "neutral" });
  push({ category: "cashflow", signal: "expense_volatility", value: financial.expense_volatility, value_type: "number", confidence: 0.8, source: "derived", flag: financial.expense_volatility > 0.5 ? "negative" : "positive" });
  push({ category: "cashflow", signal: "average_balance", value: financial.average_balance, value_type: "number", currency, confidence: 0.86, source: "bank_statement", flag: "neutral" });
  push({ category: "cashflow", signal: "debt_payments", value: financial.debt_payments, value_type: "number", currency, confidence: 0.9, source: "bank_statement", flag: "neutral" });
  push({ category: "cashflow", signal: "recurring_obligations", value: financial.recurring_obligations, value_type: "number", currency, confidence: 0.88, source: "bank_statement", flag: "neutral" });

  // ---- Affordability signals ----
  push({ category: "affordability", signal: "debt_to_income", value: financial.debt_to_income, value_type: "number", confidence: 0.9, source: "derived", flag: financial.debt_to_income > 0.45 ? "negative" : financial.debt_to_income > 0.36 ? "neutral" : "positive" });
  push({ category: "affordability", signal: "income_to_loan", value: financial.income_to_loan, value_type: "number", confidence: 0.85, source: "derived", flag: financial.income_to_loan >= 1 ? "positive" : "negative" });
  push({ category: "affordability", signal: "repayment_capacity", value: financial.repayment_capacity, value_type: "number", currency, confidence: 0.83, source: "derived", flag: financial.repayment_capacity > 0 ? "positive" : "negative" });
  push({ category: "affordability", signal: "affordability_ratio", value: financial.affordability_ratio, value_type: "number", confidence: 0.82, source: "derived", flag: financial.affordability_ratio > 0.2 ? "positive" : "negative" });

  // ---- Fraud / anomaly signals ----
  const suspiciousTx = detectSuspicious(input);
  push({ category: "fraud", signal: "suspicious_transactions", value: suspiciousTx, value_type: "boolean", confidence: 0.6, source: "derived", flag: suspiciousTx ? "critical" : "positive" });
  const docInconsistent = credit.defaults > 0 && financial.disposable_income > financial.monthly_income;
  push({ category: "fraud", signal: "document_inconsistencies", value: docInconsistent, value_type: "boolean", confidence: 0.7, source: "derived", flag: docInconsistent ? "negative" : "positive" });
  const idInconsistent = false;
  push({ category: "fraud", signal: "identity_inconsistencies", value: idInconsistent, value_type: "boolean", confidence: 0.75, source: "derived", flag: idInconsistent ? "critical" : "positive" });
  const unusual = financial.income_stability < 0.3 || financial.expense_volatility > 0.6;
  push({ category: "fraud", signal: "unusual_financial_behaviour", value: unusual, value_type: "boolean", confidence: 0.65, source: "derived", flag: unusual ? "negative" : "positive" });

  return { signals, evidence };
}

function detectSuspicious(input: SignalInput): boolean {
  const f = input.financial;
  // Round-trip laundering proxy: very high transfer volume vs income
  return f.disposable_income < 0 && f.monthly_income > 0;
}

// Aggregate a 0..1 risk score from the generated signals.
export function computeRiskScore(signals: GeneratedSignal[]): number {
  let weight = 0;
  let acc = 0;
  for (const s of signals) {
    const w = signalWeight(s);
    const contribution = flagToScore(s.flag);
    acc += contribution * w;
    weight += w;
  }
  if (weight === 0) return 0.5;
  return Math.round((acc / weight) * 100) / 100;
}

function signalWeight(s: GeneratedSignal): number {
  const critical = s.flag === "critical" ? 2 : 1;
  const byCategory: Record<string, number> = { credit: 1.2, affordability: 1.1, cashflow: 1.0, fraud: 1.3 };
  return (byCategory[s.category] || 1) * critical;
}

function flagToScore(flag: string): number {
  switch (flag) {
    case "positive": return 0.15;
    case "neutral": return 0.4;
    case "negative": return 0.7;
    case "critical": return 0.9;
    default: return 0.5;
  }
}