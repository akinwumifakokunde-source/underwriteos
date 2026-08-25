// Financial data normalization: turns raw bank-statement transactions into a
// normalized FinancialProfile and persisted Transaction records.

export interface NormalizedTransaction {
  date: string;
  description: string;
  amount: number; // positive = credit (income), negative = debit (expense)
  currency: string;
  category: string;
  recurring: boolean;
}

export interface NormalizedFinancialProfile {
  monthly_income: number;
  monthly_expenses: number;
  disposable_income: number;
  income_stability: number; // 0..1 (coefficient of variation based)
  expense_volatility: number; // 0..1
  average_balance: number;
  debt_payments: number;
  recurring_obligations: number;
  debt_to_income: number;
  income_to_loan: number;
  repayment_capacity: number;
  affordability_ratio: number;
  currency: string;
}

export function normalizeTransactions(raw: any, currency = "GBP"): NormalizedTransaction[] {
  const list = Array.isArray(raw) ? raw : raw?.transactions || raw?.data || [];
  return list.map((t: any, i: number) => {
    const amount = Number(t.amount ?? t.value ?? 0);
    const direction = t.direction || (amount >= 0 ? "credit" : "debit");
    return {
      date: t.date || t.transaction_date || new Date().toISOString().slice(0, 10),
      description: t.description || t.merchant || t.name || `Transaction ${i + 1}`,
      amount: Math.abs(amount) * (direction === "debit" ? -1 : 1),
      currency: t.currency || currency,
      category: categorize(t.description || t.category || t.merchant || ""),
      recurring: Boolean(t.recurring ?? detectRecurring(t.description || ""))
    };
  });
}

const RECURRING_KEYWORDS = ["salary", "payroll", "rent", "mortgage", "subscription", "netflix", "spotify", "gym", "insurance", "loan", "direct debit", "standing order", "dd ", "so "];

function detectRecurring(desc: string): boolean {
  const d = (desc || "").toLowerCase();
  return RECURRING_KEYWORDS.some(k => d.includes(k));
}

function categorize(desc: string): string {
  const d = (desc || "").toLowerCase();
  if (d.includes("salary") || d.includes("payroll") || d.includes("wages")) return "income";
  if (d.includes("rent") || d.includes("mortgage")) return "rent";
  if (d.includes("energy") || d.includes("electric") || d.includes("gas") || d.includes("water") || d.includes("broadband")) return "utilities";
  if (d.includes("grocery") || d.includes("tesco") || d.includes("sainsbury") || d.includes("aldi") || d.includes("lidl")) return "groceries";
  if (d.includes("transport") || d.includes("tfl") || d.includes("uber") || d.includes("fuel")) return "transport";
  if (d.includes("loan") || d.includes("repayment") || d.includes("credit card") || d.includes("finance")) return "debt_repayment";
  if (d.includes("subscription") || d.includes("netflix") || d.includes("spotify") || d.includes("gym")) return "subscriptions";
  if (d.includes("transfer")) return "transfers";
  if (d.includes("fee") || d.includes("charge")) return "fees";
  return "other";
}

export function buildFinancialProfile(transactions: NormalizedTransaction[], loanAmount: number, currency = "GBP"): NormalizedFinancialProfile {
  const credits = transactions.filter(t => t.amount > 0).map(t => t.amount);
  const debits = transactions.filter(t => t.amount < 0).map(t => Math.abs(t.amount));

  // Estimate monthly figures (assume ~3 months of data; normalize to monthly)
  const monthsCovered = Math.max(1, countMonths(transactions));
  const monthlyIncome = round(sum(credits) / monthsCovered);
  const monthlyExpenses = round(sum(debits) / monthsCovered);

  const debtPayments = round(sum(transactions.filter(t => t.category === "debt_repayment").map(t => Math.abs(t.amount))) / monthsCovered);
  const recurringObligations = round(sum(transactions.filter(t => t.recurring && t.amount < 0).map(t => Math.abs(t.amount))) / monthsCovered);

  const disposableIncome = round(monthlyIncome - monthlyExpenses);
  const averageBalance = round(disposableIncome * 1.2); // rough running balance proxy

  const incomeStability = round(clamp01(1 - coefficientOfVariation(credits)));
  const expenseVolatility = round(clamp01(coefficientOfVariation(debits)));

  const debtToIncome = monthlyIncome > 0 ? round(debtPayments / monthlyIncome) : 1;
  const incomeToLoan = loanAmount > 0 && monthlyIncome > 0 ? round(monthlyIncome * 12 / loanAmount) : 0;
  const repaymentCapacity = round(Math.max(0, disposableIncome * 0.6)); // assume 60% of disposable available
  const affordabilityRatio = monthlyExpenses > 0 ? round(disposableIncome / monthlyExpenses) : 0;

  return {
    monthly_income: monthlyIncome,
    monthly_expenses: monthlyExpenses,
    disposable_income: disposableIncome,
    income_stability: incomeStability,
    expense_volatility: expenseVolatility,
    average_balance: averageBalance,
    debt_payments: debtPayments,
    recurring_obligations: recurringObligations,
    debt_to_income: debtToIncome,
    income_to_loan: incomeToLoan,
    repayment_capacity: repaymentCapacity,
    affordability_ratio: affordabilityRatio,
    currency
  };
}

function sum(arr: number[]): number { return arr.reduce((a, b) => a + b, 0); }
function round(n: number): number { return Math.round(n * 100) / 100; }
function clamp01(n: number): number { return Math.max(0, Math.min(1, n)); }
function coefficientOfVariation(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = sum(arr) / arr.length;
  if (mean === 0) return 1;
  const variance = sum(arr.map(x => (x - mean) ** 2)) / arr.length;
  return Math.sqrt(variance) / mean;
}
function countMonths(transactions: NormalizedTransaction[]): number {
  if (transactions.length === 0) return 1;
  const dates = transactions.map(t => t.date).sort();
  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);
  const months = (last.getFullYear() - first.getFullYear()) * 12 + (last.getMonth() - first.getMonth()) + 1;
  return Math.max(1, months);
}