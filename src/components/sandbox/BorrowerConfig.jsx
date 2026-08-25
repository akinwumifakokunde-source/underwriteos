import React from "react";
import { Info } from "lucide-react";

const FIELDS = [
  { key: "first_name", label: "First name", type: "text" },
  { key: "last_name", label: "Last name", type: "text" },
  { key: "annual_income", label: "Annual income (£)", type: "number" },
  { key: "monthly_expenses", label: "Monthly expenses (£)", type: "number" },
  { key: "existing_debt", label: "Existing debt (£)", type: "number" },
  { key: "loan_amount", label: "Requested loan (£)", type: "number" },
  { key: "loan_term_months", label: "Loan term (months)", type: "number" },
  { key: "credit_score", label: "Credit score", type: "number" },
  { key: "active_accounts", label: "Active accounts", type: "number" },
  { key: "credit_utilisation", label: "Credit utilisation (0–1)", type: "number", step: 0.01 },
  { key: "recent_enquiries", label: "Recent enquiries", type: "number" },
  { key: "repayment_history", label: "Repayment history (0–100)", type: "number" },
];

export default function BorrowerConfig({ config, onChange, disabled }) {
  const set = (k, v) => onChange({ ...config, [k]: v });
  const monthlyIncome = Math.round(config.annual_income / 12);
  const debtMonthly = Math.round(config.existing_debt / config.loan_term_months);
  const dti = Math.round((debtMonthly / monthlyIncome) * 100);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Test configuration</h3>
          <p className="text-xs text-slate-500">Edit the synthetic borrower profile sent to the API.</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-1">
          <Info className="w-3 h-3" /> Synthetic test data
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-[11px] font-medium text-slate-500">{f.label}</span>
            <input
              type={f.type}
              step={f.step || "1"}
              value={config[f.key]}
              disabled={disabled}
              onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
        <span>£{monthlyIncome.toLocaleString()}/mo income</span>
        <span>·</span>
        <span>£{debtMonthly.toLocaleString()}/mo debt</span>
        <span>·</span>
        <span>DTI {dti}%</span>
      </div>
    </div>
  );
}