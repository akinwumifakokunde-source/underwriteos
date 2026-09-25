import React from "react";
import { Info, CheckCircle2 } from "lucide-react";
import { GREEN, DOCUMENTS_ANALYZING, DOCUMENTS_ACCEPTED } from "../data";

export default function DocumentsTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Document Checklist</h3>
          <span className="text-[12px] text-slate-500">3 of 10 required materials accepted</span>
        </div>
        <p className="text-[12px] text-slate-400 mt-0.5">Analyzing documents...</p>
        <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: "30%", backgroundColor: GREEN }} />
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> complete</span>
          <span className="inline-flex items-center gap-1 text-emerald-600"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN }} /> 3 accepted</span>
          <span className="inline-flex items-center gap-1 text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> 1 analyzing</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Analyzing (8)</h4>
          <Info className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <ul className="space-y-2">
          {DOCUMENTS_ANALYZING.map((d, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
                <span className="text-[13px] text-slate-700">{d}</span>
              </div>
              <span className="text-[11px] text-slate-400">Waiting to process</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3">Accepted (3)</h4>
        <ul className="space-y-2">
          {DOCUMENTS_ACCEPTED.map((d, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: GREEN }} />
                <span className="text-[13px] text-slate-700">{d}</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-600">Accepted</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}