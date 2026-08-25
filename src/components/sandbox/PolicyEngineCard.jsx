import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check, AlertTriangle, X } from "lucide-react";

export default function PolicyEngineCard({ decision }) {
  const outcome = decision?.policy_outcome;
  const [open, setOpen] = useState({});
  if (!outcome) return null;
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
        {outcome.triggered_rules.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
            <Check className="w-4 h-4 text-emerald-500" /> No policy rules triggered. All checks passed.
          </div>
        )}
        {outcome.triggered_rules.map((r) => (
          <RuleRow key={r.rule_id} rule={r} open={open[r.rule_id]} onToggle={() => toggle(r.rule_id)} />
        ))}
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

function RuleRow({ rule, open, onToggle }) {
  const tone = rule.decision === "APPROVE" ? "text-emerald-500" : rule.decision === "REVIEW" ? "text-amber-500" : "text-rose-500";
  const Icon = rule.decision === "APPROVE" ? Check : rule.decision === "REVIEW" ? AlertTriangle : X;
  return (
    <div className="rounded-lg border border-slate-100">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-3 py-2 text-left">
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        <Icon className={`w-4 h-4 ${tone}`} />
        <span className="text-sm text-slate-700 flex-1">{rule.rule_id}</span>
        <span className={`text-xs font-semibold ${tone}`}>{rule.decision}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 grid grid-cols-3 gap-2 text-xs">
          <Cell label="Field" value={rule.field} />
          <Cell label="Input" value={String(rule.actual)} />
          <Cell label="Threshold" value={String(rule.threshold)} />
        </div>
      )}
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