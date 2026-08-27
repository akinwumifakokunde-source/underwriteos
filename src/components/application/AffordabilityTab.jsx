import React, { useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from "lucide-react";

function computePayment(principal, termMonths, annualRatePct) {
  if (!principal || !termMonths) return 0;
  if (!annualRatePct) return principal / termMonths;
  const r = annualRatePct / 12 / 100;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

const STRESS_SCENARIOS = [
  { id: "income_down_10", label: "Income decreases 10%", desc: "Tests resilience to income shock" },
  { id: "income_down_20", label: "Income decreases 20%", desc: "Severe income reduction" },
  { id: "expenses_up_10", label: "Expenses increase 10%", desc: "Cost of living pressure" },
  { id: "rate_up_2", label: "Interest rate +2%", desc: "Rate stress on repayment" },
  { id: "variable_excluded", label: "Variable income excluded", desc: "Only stable income counted" },
];

function applyStress(fp, payment, scenarioId) {
  const income = fp?.income?.monthly || 0;
  const expenses = fp?.expenses?.monthly || 0;
  const debt = fp?.debt?.monthly_payments || 0;

  switch (scenarioId) {
    case "income_down_10": return { income: income * 0.9, expenses, debt, payment };
    case "income_down_20": return { income: income * 0.8, expenses, debt, payment };
    case "expenses_up_10": return { income, expenses: expenses * 1.1, debt, payment };
    case "rate_up_2": return { income, expenses, debt, payment: payment * 1.15 };
    case "variable_excluded": return { income: income * 0.85, expenses, debt, payment };
    default: return { income, expenses, debt, payment };
  }
}

export default function AffordabilityTab({ fp, app, fmtMoney }) {
  const [activeStress, setActiveStress] = useState(null);

  const currency = app?.loan_currency || "GBP";
  const payment = computePayment(app?.loan_amount, app?.loan_term_months, app?.interest_rate);
  const income = fp?.income?.monthly || 0;
  const expenses = fp?.expenses?.monthly || 0;
  const debt = fp?.debt?.monthly_payments || 0;
  const disposableBefore = income - expenses - debt;
  const disposableAfter = disposableBefore - payment;
  const dti = fp?.affordability?.debt_to_income;
  const pti = income > 0 ? (payment / income) : null;
  const dsr = income > 0 ? ((debt + payment) / income) : null;

  if (!fp) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">Affordability not calculated yet</p>
        <p className="text-[12px] text-slate-400 mt-1">Upload bank statements to calculate income, expenses, and disposable income. UnderwriteOS will calculate affordability automatically.</p>
      </div>
    );
  }

  const baseMetrics = [
    { label: "Net monthly income", value: fmtMoney(income, currency) },
    { label: "Essential expenditure", value: fmtMoney(expenses, currency) },
    { label: "Existing debt obligations", value: fmtMoney(debt, currency) },
    { label: "Proposed loan repayment", value: payment > 0 ? fmtMoney(payment, currency) : "—" },
    { label: "Disposable income before loan", value: fmtMoney(disposableBefore, currency), highlight: disposableBefore > 0 ? "positive" : "negative" },
    { label: "Disposable income after loan", value: fmtMoney(disposableAfter, currency), highlight: disposableAfter > 0 ? "positive" : "negative" },
    { label: "Debt-to-income", value: dti != null ? `${(dti * 100).toFixed(1)}%` : "—" },
    { label: "Payment-to-income", value: pti != null ? `${(pti * 100).toFixed(1)}%` : "—" },
    { label: "Debt-service ratio", value: dsr != null ? `${(dsr * 100).toFixed(1)}%` : "—" },
    { label: "Income stability", value: fp?.income?.stability != null ? `${Math.round(fp.income.stability * 100)}%` : "—" },
    { label: "Expense volatility", value: fp?.expenses?.volatility != null ? `${Math.round(fp.expenses.volatility * 100)}%` : "—" },
  ];

  const stressResult = activeStress ? applyStress(fp, payment, activeStress) : null;
  const stressDisposable = stressResult ? stressResult.income - stressResult.expenses - stressResult.debt - stressResult.payment : 0;
  const stressVerdict = stressDisposable > 300 ? "PASS" : stressDisposable > 0 ? "REVIEW" : "FAIL";

  return (
    <div className="space-y-5">
      {/* Base affordability */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Affordability assessment</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {baseMetrics.map((m, i) => (
            <div key={i} className="rounded-lg border border-slate-100 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{m.label}</div>
              <div className={`text-sm font-semibold mt-0.5 ${m.highlight === "positive" ? "text-emerald-700" : m.highlight === "negative" ? "text-rose-700" : "text-slate-900"}`}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stress testing */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#0d9488]" />
          <h3 className="text-sm font-semibold text-slate-900">Affordability stress testing</h3>
        </div>
        <p className="text-[12px] text-slate-400 mb-3">Test how the borrower's affordability holds up under financial stress scenarios. Thresholds come from the selected lender policy.</p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          {STRESS_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStress(activeStress === s.id ? null : s.id)}
              className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${activeStress === s.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {activeStress && stressResult ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Base case</div>
              <div className="space-y-1 text-[13px]">
                <Row label="Income" value={fmtMoney(income, currency)} />
                <Row label="Expenses" value={fmtMoney(expenses, currency)} />
                <Row label="Debt" value={fmtMoney(debt, currency)} />
                <Row label="Payment" value={fmtMoney(payment, currency)} />
                <div className="pt-1.5 mt-1.5 border-t border-slate-100">
                  <Row label="Disposable income" value={fmtMoney(disposableBefore, currency)} bold />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Stress case: {STRESS_SCENARIOS.find((s) => s.id === activeStress)?.label}
              </div>
              <div className="space-y-1 text-[13px]">
                <Row label="Income" value={fmtMoney(stressResult.income, currency)} />
                <Row label="Expenses" value={fmtMoney(stressResult.expenses, currency)} />
                <Row label="Debt" value={fmtMoney(stressResult.debt, currency)} />
                <Row label="Payment" value={fmtMoney(stressResult.payment, currency)} />
                <div className="pt-1.5 mt-1.5 border-t border-slate-100">
                  <Row label="Disposable income" value={fmtMoney(stressDisposable, currency)} bold />
                </div>
              </div>
              <div className={`mt-3 rounded-lg border px-3 py-2 text-sm font-semibold text-center ${
                stressVerdict === "PASS" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                stressVerdict === "REVIEW" ? "bg-amber-50 border-amber-200 text-amber-700" :
                "bg-rose-50 border-rose-200 text-rose-700"
              }`}>
                Affordability: {stressVerdict}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-slate-400 text-center py-4">Select a stress scenario to test affordability resilience.</div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono ${bold ? "font-bold text-slate-900" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}