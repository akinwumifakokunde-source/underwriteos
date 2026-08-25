import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";

export default function PolicyEngineCard({ decision }) {
  const outcome = decision?.policy_outcome;
  const [open, setOpen] = useState({});
  if (!outcome) return null;
  const rules = Array.isArray(outcome.evaluated_rules) && outcome.evaluated_rules.length > 0
    ? outcome.evaluated_rules
    : (outcome.triggered_rules || []).map((r) => ({ ...r, result: "FAIL" }));
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Policy evaluation</h3>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Policy</div>
          <div className="text-xs font-mono text-slate-600">{decision.policy_id} v{decision.policy_version}</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {rules.map((r) => {
          const pass = r.result === "PASS";
          const isOpen = open[r.rule_id];
          return (
            <div key={r.rule_id} className="rounded-lg border border-slate-100">
              <button onClick={() => toggle(r.rule_id)} className="w-full flex items-center gap-2 px-3 py-2 text-left">
                {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                {pass ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-amber-500" />}
                <span className="text-sm text-slate-700 flex-1">{r.rule_id}</span>
                <span className={`text-xs font-semibold ${pass ? "text-emerald-600" : r.decision === "DECLINE" ? "text-rose-600" : "text-amber-600"}`}>
                  {pass ? "PASS" : r.decision}
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-t border-slate-50 pt-2 mt-1">
                  <Cell label="Field" value={r.field} />
                  <Cell label="Operator" value={r.operator} />
                  <Cell label="Input" value={r.input != null ? String(r.input) : "—"} />
                  <Cell label="Threshold" value={String(r.threshold)} />
                  <div className="col-span-2 sm:col-span-4"><Cell label="Reason" value={r.reason || "—"} /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Final policy result</span>
        <span className={`text-sm font-bold ${outcome.decision === "APPROVE" ? "text-emerald-600" : outcome.decision === "REVIEW" ? "text-amber-600" : "text-rose-600"}`}>
          {outcome.decision}
        </span>
      </div>
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="font-mono text-slate-700 break-all">{value}</div>
    </div>
  );
}