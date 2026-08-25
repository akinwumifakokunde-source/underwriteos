import React from "react";

export default function FinancialProfileCard({ profile }) {
  if (!profile) return null;
  const fp = profile;
  const dti = fp.affordability?.debt_to_income;
  const aff = dti == null ? "—" : dti < 0.35 ? "PASS" : dti < 0.45 ? "REVIEW" : "FAIL";
  const affTone = aff === "PASS" ? "text-emerald-600" : aff === "REVIEW" ? "text-amber-600" : "text-rose-600";
  const stability = fp.financial_behaviour?.income_stability;
  const stabLabel = stability == null ? "—" : stability > 0.8 ? "HIGH" : stability > 0.5 ? "MEDIUM" : "LOW";
  const cfStab = fp.financial_behaviour?.expense_volatility > 0.5 ? "MEDIUM" : "HIGH";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Financial profile</h3>
      <div className="grid grid-cols-2 gap-x-4">
        <Row label="Income" value={`£${fp.income?.monthly?.toLocaleString()}/mo`} />
        <Row label="Expenses" value={`£${fp.expenses?.monthly?.toLocaleString()}/mo`} />
        <Row label="Disposable income" value={`£${fp.cashflow?.disposable_income?.toLocaleString()}/mo`} />
        <Row label="Existing debt" value={`£${fp.debt?.total?.toLocaleString()}`} />
        <Row label="Debt-to-income" value={dti != null ? `${(dti * 100).toFixed(0)}%` : "—"} />
        <Row label="Affordability" value={aff} tone={affTone} />
        <Row label="Income stability" value={stabLabel} />
        <Row label="Cashflow stability" value={cfStab} />
      </div>
    </div>
  );
}

function Row({ label, value, tone = "text-slate-800" }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-mono font-medium ${tone}`}>{value}</span>
    </div>
  );
}