// Risk signal generation. Produces structured RiskSignal + Evidence pairs
// from a normalized CreditProfile and canonical FinancialProfile.
// Every signal is paired with traceable evidence (source type, source id,
// calculation method, confidence).

export interface SignalInput {
  credit: any;       // NormalizedCreditProfile
  financial: any;    // CanonicalFinancialProfile
  application: any;  // loan amount, term, etc.
  credit_report_id?: string;
  bank_statement_id?: string;
}

export type SourceType = "credit_report" | "bank_statement" | "document" | "borrower_declaration" | "derived" | "ai_analysis";

export interface GeneratedSignal {
  category: string;
  signal: string;
  value: number | string | boolean;
  value_type: "number" | "string" | "boolean";
  currency?: string;
  confidence: number;
  source: SourceType;
  source_reference?: string;
  flag: "positive" | "neutral" | "negative" | "critical";
}

export interface GeneratedEvidence {
  signal: string;
  value: number | string | boolean;
  value_type: "number" | "string" | "boolean";
  currency?: string;
  source_type: SourceType;
  source_id?: string;
  document_id?: string;
  source_location?: string;
  calculation_method: string;
  confidence: number;
}

export interface SignalEvidencePair {
  signal: GeneratedSignal;
  evidence: GeneratedEvidence;
}

// Helper to read nested canonical financial profile fields safely.
function f(fin: any) {
  return {
    monthlyIncome: fin?.income?.monthly ?? 0,
    monthlyExpenses: fin?.expenses?.monthly ?? 0,
    disposableIncome: fin?.cashflow?.disposable_income ?? 0,
    incomeStability: fin?.financial_behaviour?.income_stability ?? 0,
    expenseVolatility: fin?.financial_behaviour?.expense_volatility ?? 0,
    averageBalance: fin?.cashflow?.average_balance ?? 0,
    debtPayments: fin?.debt?.monthly_payments ?? 0,
    recurringObligations: fin?.financial_behaviour?.recurring_obligations ?? 0,
    debtToIncome: fin?.affordability?.debt_to_income ?? 0,
    incomeToLoan: fin?.affordability?.income_to_loan ?? 0,
    repaymentCapacity: fin?.affordability?.repayment_capacity ?? 0,
    affordabilityRatio: fin?.affordability?.affordability_ratio ?? 0,
    currency: fin?.currency || "GBP"
  };
}

export function generateRiskSignals(input: SignalInput): { items: SignalEvidencePair[] } {
  const { credit, financial, application } = input;
  const fin = f(financial);
  const currency = fin.currency || application?.loan_currency || "GBP";
  const items: SignalEvidencePair[] = [];

  const crId = input.credit_report_id;
  const bsId = input.bank_statement_id;

  const push = (
    s: Omit<GeneratedSignal, "source"> & { source: SourceType },
    ev: Omit<GeneratedEvidence, "signal" | "source_type" | "calculation_method"> & { source_type?: SourceType; calculation_method?: string }
  ) => {
    const evidence: GeneratedEvidence = {
      signal: s.signal,
      value: s.value,
      value_type: s.value_type,
      currency: s.currency,
      source_type: ev.source_type ?? s.source,
      source_id: ev.source_id ?? (s.source === "credit_report" ? crId : s.source === "bank_statement" ? bsId : undefined),
      document_id: ev.document_id,
      source_location: ev.source_location,
      calculation_method: ev.calculation_method ?? "direct_extract",
      confidence: s.confidence
    };
    items.push({ signal: s as GeneratedSignal, evidence });
  };

  // ---- Credit signals (source: credit_report) ----
  push({ category: "credit", signal: "credit_score", value: credit.credit_score, value_type: "number", confidence: 0.95, source: "credit_report", flag: (credit.credit_score ?? 0) >= 650 ? "positive" : (credit.credit_score ?? 0) >= 550 ? "neutral" : "negative" },
    { calculation_method: "direct_extract" });
  push({ category: "credit", signal: "active_accounts", value: credit.active_accounts, value_type: "number", confidence: 0.9, source: "credit_report", flag: "neutral" },
    { calculation_method: "direct_extract" });
  push({ category: "credit", signal: "closed_accounts", value: credit.closed_accounts, value_type: "number", confidence: 0.85, source: "credit_report", flag: "neutral" },
    { calculation_method: "direct_extract" });
  push({ category: "credit", signal: "delinquent_accounts", value: credit.delinquent_accounts, value_type: "number", confidence: 0.9, source: "credit_report", flag: (credit.delinquent_accounts ?? 0) > 0 ? "negative" : "positive" },
    { calculation_method: "direct_extract" });
  push({ category: "credit", signal: "defaults", value: credit.defaults, value_type: "number", confidence: 0.93, source: "credit_report", flag: (credit.defaults ?? 0) > 0 ? "critical" : "positive" },
    { calculation_method: "direct_extract" });
  push({ category: "credit", signal: "outstanding_balance", value: credit.outstanding_balance, value_type: "number", currency, confidence: 0.88, source: "credit_report", flag: (credit.outstanding_balance ?? 0) > 5000 ? "negative" : "neutral" },
    { calculation_method: "direct_extract" });
  push({ category: "credit", signal: "credit_utilisation", value: credit.credit_utilisation, value_type: "number", confidence: 0.9, source: "credit_report", flag: (credit.credit_utilisation ?? 0) > 0.7 ? "negative" : "positive" },
    { calculation_method: "direct_extract" });
  push({ category: "credit", signal: "recent_enquiries", value: credit.recent_enquiries, value_type: "number", confidence: 0.85, source: "credit_report", flag: (credit.recent_enquiries ?? 0) > 3 ? "negative" : "neutral" },
    { calculation_method: "direct_extract" });
  push({ category: "credit", signal: "repayment_history", value: credit.repayment_history, value_type: "number", confidence: 0.92, source: "credit_report", flag: (credit.repayment_history ?? 0) >= 90 ? "positive" : "negative" },
    { calculation_method: "direct_extract" });

  // ---- Cashflow signals (source: bank_statement / derived) ----
  push({ category: "cashflow", signal: "monthly_income", value: fin.monthlyIncome, value_type: "number", currency, confidence: 0.96, source: "bank_statement", flag: "positive" },
    { calculation_method: "sum_divided_by_months" });
  push({ category: "cashflow", signal: "monthly_expenses", value: fin.monthlyExpenses, value_type: "number", currency, confidence: 0.94, source: "bank_statement", flag: "neutral" },
    { calculation_method: "sum_divided_by_months" });
  push({ category: "cashflow", signal: "disposable_income", value: fin.disposableIncome, value_type: "number", currency, confidence: 0.93, source: "derived", flag: fin.disposableIncome > 0 ? "positive" : "negative" },
    { calculation_method: "income_minus_expenses" });
  push({ category: "cashflow", signal: "income_stability", value: fin.incomeStability, value_type: "number", confidence: 0.82, source: "derived", flag: fin.incomeStability >= 0.7 ? "positive" : "neutral" },
    { calculation_method: "one_minus_coefficient_of_variation" });
  push({ category: "cashflow", signal: "expense_volatility", value: fin.expenseVolatility, value_type: "number", confidence: 0.8, source: "derived", flag: fin.expenseVolatility > 0.5 ? "negative" : "positive" },
    { calculation_method: "coefficient_of_variation" });
  push({ category: "cashflow", signal: "average_balance", value: fin.averageBalance, value_type: "number", currency, confidence: 0.86, source: "bank_statement", flag: "neutral" },
    { calculation_method: "running_balance_proxy" });
  push({ category: "cashflow", signal: "debt_payments", value: fin.debtPayments, value_type: "number", currency, confidence: 0.9, source: "bank_statement", flag: "neutral" },
    { calculation_method: "category_sum_divided_by_months" });
  push({ category: "cashflow", signal: "recurring_obligations", value: fin.recurringObligations, value_type: "number", currency, confidence: 0.88, source: "bank_statement", flag: "neutral" },
    { calculation_method: "recurring_flag_sum_divided_by_months" });

  // ---- Affordability signals (source: derived) ----
  push({ category: "affordability", signal: "debt_to_income", value: fin.debtToIncome, value_type: "number", confidence: 0.9, source: "derived", flag: fin.debtToIncome > 0.45 ? "negative" : fin.debtToIncome > 0.36 ? "neutral" : "positive" },
    { calculation_method: "debt_payments_divided_by_income" });
  push({ category: "affordability", signal: "income_to_loan", value: fin.incomeToLoan, value_type: "number", confidence: 0.85, source: "derived", flag: fin.incomeToLoan >= 1 ? "positive" : "negative" },
    { calculation_method: "annual_income_divided_by_loan" });
  push({ category: "affordability", signal: "repayment_capacity", value: fin.repaymentCapacity, value_type: "number", currency, confidence: 0.83, source: "derived", flag: fin.repaymentCapacity > 0 ? "positive" : "negative" },
    { calculation_method: "disposable_income_times_0.6" });
  push({ category: "affordability", signal: "affordability_ratio", value: fin.affordabilityRatio, value_type: "number", confidence: 0.82, source: "derived", flag: fin.affordabilityRatio > 0.2 ? "positive" : "negative" },
    { calculation_method: "disposable_income_divided_by_expenses" });

  // ---- Fraud / anomaly signals (source: derived) ----
  const suspiciousTx = detectSuspicious(input);
  push({ category: "fraud", signal: "suspicious_transactions", value: suspiciousTx, value_type: "boolean", confidence: 0.6, source: "derived", flag: suspiciousTx ? "critical" : "positive" },
    { calculation_method: "negative_disposable_income_check" });
  const docInconsistent = (credit.defaults ?? 0) > 0 && fin.disposableIncome > fin.monthlyIncome;
  push({ category: "fraud", signal: "document_inconsistencies", value: docInconsistent, value_type: "boolean", confidence: 0.7, source: "derived", flag: docInconsistent ? "negative" : "positive" },
    { calculation_method: "cross_source_consistency_check" });
  const idInconsistent = false;
  push({ category: "fraud", signal: "identity_inconsistencies", value: idInconsistent, value_type: "boolean", confidence: 0.75, source: "derived", flag: idInconsistent ? "critical" : "positive" },
    { calculation_method: "identity_cross_check" });
  const unusual = fin.incomeStability < 0.3 || fin.expenseVolatility > 0.6;
  push({ category: "fraud", signal: "unusual_financial_behaviour", value: unusual, value_type: "boolean", confidence: 0.65, source: "derived", flag: unusual ? "negative" : "positive" },
    { calculation_method: "behavioural_threshold_check" });

  return { items };
}

function detectSuspicious(input: SignalInput): boolean {
  const fin = f(input.financial);
  return fin.disposableIncome < 0 && fin.monthlyIncome > 0;
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