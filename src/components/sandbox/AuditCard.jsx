import React from "react";
import { History } from "lucide-react";

export default function AuditCard({ events }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-900">Audit trail ({events?.length || 0})</h3>
      </div>
      {!events?.length ? (
        <p className="text-sm text-slate-400">No audit events recorded.</p>
      ) : (
        <div className="space-y-1">
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-3 text-xs border-b border-slate-50 py-1.5">
              <span className="font-mono text-slate-700 w-48 truncate">{e.event}</span>
              <span className="text-slate-400">{e.actor_type}</span>
              {e.endpoint && <code className="text-slate-400 font-mono text-[10px] truncate hidden sm:block">{e.endpoint}</code>}
              <span className="text-slate-400 ml-auto font-mono whitespace-nowrap">{new Date(e.created_date).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}