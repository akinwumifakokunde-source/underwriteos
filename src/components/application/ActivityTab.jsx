import React from "react";
import { Activity } from "lucide-react";

export default function ActivityTab({ audit }) {
  if (!audit || audit.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No activity recorded yet.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Audit trail</h3>
      <div className="space-y-2">
        {audit.map((e, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
            <Activity className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-800">{e.event.replace(/[._]/g, " ")}</div>
              <div className="text-[11px] text-slate-400">{e.created_date ? new Date(e.created_date).toLocaleString() : ""} · {e.actor_type}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}