import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";

const TONE = {
  APPROVE: { icon: ShieldCheck, ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
  REVIEW: { icon: AlertTriangle, ring: "ring-amber-200", bg: "bg-amber-50", text: "text-amber-700" },
  DECLINE: { icon: AlertOctagon, ring: "ring-rose-200", bg: "bg-rose-50", text: "text-rose-700" },
};

export default function ResultSummary({ decision }) {
  if (!decision) return null;
  const t = TONE[decision.decision] || TONE.REVIEW;
  const Icon = t.icon;
  return (
    <div className={`rounded-xl ring-1 ${t.ring} ${t.bg} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Icon className={`w-6 h-6 ${t.text}`} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Underwriting complete</div>
            <div className={`text-2xl font-bold ${t.text}`}>{decision.decision}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Decision source</div>
          <div className="text-sm font-mono text-slate-700">{decision.decision_source}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Risk score" value={decision.risk_score != null ? `${Math.round(decision.risk_score * 100)} / 100` : "—"} />
        <Metric label="Prob. of default" value={decision.probability_of_default != null ? `${(decision.probability_of_default * 100).toFixed(1)}%` : "—"} />
        <Metric label="Confidence" value={decision.confidence != null ? `${Math.round(decision.confidence * 100)}%` : "—"} />
        <Metric label="Human review" value={decision.human_review_required ? "Required" : "Not required"} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-white/70 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="text-lg font-semibold text-slate-800 font-mono">{value}</div>
    </div>
  );
}