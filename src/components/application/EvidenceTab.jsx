import React from "react";
import { FileSearch } from "lucide-react";

export default function EvidenceTab({ evidence }) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <FileSearch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">No evidence records yet</p>
        <p className="text-[12px] text-slate-400 mt-1">Evidence is created automatically as documents are processed and risk signals are generated. Upload documents to begin.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Evidence ({evidence.length})</h3>
      <p className="text-[12px] text-slate-400 mb-3">Every risk signal is traceable to its source through these evidence records.</p>
      <div className="space-y-1">
        {evidence.map((e, i) => (
          <div key={i} className="text-[12px] text-slate-600 flex gap-2 py-1.5 border-b border-slate-100 last:border-0">
            <span className="text-slate-300">{i + 1}.</span>
            <span className="flex-1">
              <span className="font-medium text-slate-700">{e.signal}</span>: {String(e.value)}
              <span className="text-slate-400 ml-1">[{e.source_type?.replace(/_/g, " ")}{e.source_location ? ` · ${e.source_location}` : ""}{e.field ? ` · ${e.field}` : ""}]</span>
              {e.confidence != null && <span className="text-teal-600 ml-1">{Math.round(e.confidence * 100)}%</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}