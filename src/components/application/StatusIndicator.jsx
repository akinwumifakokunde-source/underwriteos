import React from "react";
import { CheckCircle2, Loader2, AlertTriangle, Info } from "lucide-react";

const STATUSES = {
  up_to_date: { icon: CheckCircle2, label: "Up to date", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  analyzing: { icon: Loader2, label: "Analyzing…", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", spin: true },
  review: { icon: AlertTriangle, label: "Review required", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  needs_info: { icon: Info, label: "Needs information", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

export default function StatusIndicator({ status, lastUpdated, onRerun }) {
  const s = STATUSES[status] || STATUSES.needs_info;
  const Icon = s.icon;
  return (
    <div className="flex items-center gap-3">
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1.5 ${s.bg} ${s.color} ${s.border}`}>
        <Icon className={`w-3.5 h-3.5 ${s.spin ? "animate-spin" : ""}`} />
        {s.label}
      </div>
      {lastUpdated && <span className="text-[11px] text-slate-400 hidden sm:inline">Updated {lastUpdated}</span>}
      {onRerun && (
        <button onClick={onRerun} className="text-[11px] font-medium text-slate-500 hover:text-slate-900">
          Re-run
        </button>
      )}
    </div>
  );
}