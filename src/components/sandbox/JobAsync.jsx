import React from "react";
import { Clock } from "lucide-react";
import JsonView from "./JsonView.jsx";

export default function JobAsync({ analyzeStep, jobId }) {
  const res = analyzeStep?.state?.response;
  if (!res) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-900">Async job</h3>
        <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">202 Accepted</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        The <code className="font-mono">/analyze</code> endpoint returns a job immediately. Poll <code className="font-mono">GET /v1/jobs/{"{id}"}</code> until complete.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">POST response</div>
          <JsonView data={{ job_id: res.job_id, status: "processing" }} maxHeight="120px" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">GET /v1/jobs/{"{id}"} → 200</div>
          <JsonView data={{ job_id: res.job_id, status: res.status, signal_count: res.signal_count, evidence_count: res.evidence_count }} maxHeight="120px" />
        </div>
      </div>
    </div>
  );
}