import React from "react";
import { CheckCircle2, AlertCircle, XCircle, Clock, FileText } from "lucide-react";

export default function ApplicationsStats({ apps }) {
  const total = apps.length;
  const approved = apps.filter((a) => a.decision === "APPROVE").length;
  const review = apps.filter((a) => a.decision === "REVIEW" || a.human_review_required).length;
  const declined = apps.filter((a) => a.decision === "DECLINE").length;
  const pending = total - approved - review - declined;

  const stats = [
    { label: "Total", value: total, icon: FileText, color: "text-slate-700", bg: "bg-slate-100" },
    { label: "Approved", value: approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In review", value: review, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Declined", value: declined, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Pending", value: pending, icon: Clock, color: "text-sky-600", bg: "bg-sky-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-6 h-6 rounded-md ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{s.label}</span>
          </div>
          <div className="text-xl font-semibold tabular-nums text-slate-900">{s.value}</div>
        </div>
      ))}
    </div>
  );
}