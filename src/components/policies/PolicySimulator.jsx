import React, { useState, useMemo } from "react";
import { FlaskConical, Play, X } from "lucide-react";

export const FIELD_DEFAULTS = {
  credit_score: 680,
  debt_to_income: 0.35,
  credit_utilisation: 0.25,
  annual_income: 52000,
  monthly_income: 4333,
  defaults: 0,
  delinquent_accounts: 0,
  recent_enquiries: 1,
  repayment_history: 95,
  repayment_capacity: 0.3,
  income_stability: 0.7,
  expense_volatility: 0.2,
  active_accounts: 4,
  outstanding_balance: 3000,
  suspicious_transactions: 0,
};

export function evaluateRules(rules, values) {
  const results = rules.map((r) => {
    const val = values[r.field];
    let triggered = false;
    const threshold = Number(r.threshold);
    switch (r.operator) {
      case "<": triggered = val < threshold; break;
      case "<=": triggered = val <= threshold; break;
      case ">": triggered = val > threshold; break;
      case ">=": triggered = val >= threshold; break;
      case "==": triggered = val == threshold; break;
      case "!=": triggered = val != threshold; break;
      case "between": {
        const parts = String(r.threshold).split(",").map(Number);
        triggered = val >= parts[0] && val <= parts[1];
        break;
      }
      default: triggered = false;
    }
    return { ...r, observed: val, triggered };
  });
  const triggeredRules = results.filter((r) => r.triggered);
  let outcome = "APPROVE";
  if (triggeredRules.some((r) => r.decision === "DECLINE")) outcome = "DECLINE";
  else if (triggeredRules.some((r) => r.decision === "REVIEW")) outcome = "REVIEW";
  return { results, outcome, triggeredRules };
}

export default function PolicySimulator({ rules }) {
  const [values, setValues] = useState(FIELD_DEFAULTS);
  const [open, setOpen] = useState(false);

  const { results, outcome } = useMemo(() => evaluateRules(rules || [], values), [rules, values]);

  if (!open) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-[#0d9488]" />
          <h3 className="text-sm font-semibold text-slate-900">Test this policy</h3>
        </div>
        <p className="text-[13px] text-slate-500 mb-3">Enter sample borrower values and see how the policy evaluates — no code required.</p>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800">
          <Play className="w-4 h-4" /> Open simulator
        </button>
      </div>
    );
  }

  const fieldsInRules = [...new Set((rules || []).map((r) => r.field))];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#0d9488]" />
          <h3 className="text-sm font-semibold text-slate-900">Policy simulator</h3>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Sample borrower values</div>
          <div className="space-y-2">
            {fieldsInRules.length === 0 && <p className="text-[13px] text-slate-400">No rules in this policy yet.</p>}
            {fieldsInRules.map((field) => (
              <div key={field} className="flex items-center gap-2">
                <label className="text-[13px] text-slate-600 w-40 shrink-0 capitalize">{field.replace(/_/g, " ")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={values[field] ?? 0}
                  onChange={(e) => setValues({ ...values, [field]: parseFloat(e.target.value) || 0 })}
                  className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Policy evaluation</div>
          <div className={`rounded-lg border p-3 mb-3 ${outcome === "APPROVE" ? "bg-emerald-50 border-emerald-200" : outcome === "DECLINE" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="text-[11px] uppercase tracking-wider opacity-70">Final policy outcome</div>
            <div className={`text-xl font-bold ${outcome === "APPROVE" ? "text-emerald-700" : outcome === "DECLINE" ? "text-rose-700" : "text-amber-700"}`}>{outcome}</div>
          </div>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 text-[12px] rounded-lg border px-2.5 py-1.5 ${r.triggered ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-white opacity-50"}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.triggered ? (r.decision === "DECLINE" ? "bg-rose-500" : r.decision === "REVIEW" ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-300"}`} />
                <span className="text-slate-700 flex-1 capitalize">{r.field.replace(/_/g, " ")} {r.operator} {r.threshold}</span>
                <span className="font-mono text-slate-500">{r.observed}</span>
                <span className={`font-medium ${r.triggered ? (r.decision === "DECLINE" ? "text-rose-600" : r.decision === "REVIEW" ? "text-amber-600" : "text-emerald-600") : "text-slate-400"}`}>
                  {r.triggered ? r.decision : "pass"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}