import React from "react";
import { Activity } from "lucide-react";

export default function Diagnostics({ requestId, applicationId, jobId, totalMs, apiCalls, status }) {
  const rows = [
    { label: "Request ID", value: requestId },
    { label: "Application", value: applicationId },
    { label: "Job ID", value: jobId },
    { label: "Execution", value: totalMs != null ? `${totalMs} ms` : "—" },
    { label: "API calls", value: apiCalls },
    { label: "Status", value: status },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-900">Diagnostics</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{r.label}</div>
            <div className="text-xs font-mono text-slate-700 truncate" title={r.value}>{r.value || "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}