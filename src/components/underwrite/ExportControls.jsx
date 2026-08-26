import React, { useState } from "react";
import { FileDown, FileSpreadsheet, FileType, Loader2 } from "lucide-react";
import { buildDecisionSummary, downloadDecisionPdf, downloadDecisionCsv, downloadDecisionWord } from "@/lib/decisionExport";

export default function ExportControls({ results, ids }) {
  const [busy, setBusy] = useState(null);
  const summary = buildDecisionSummary(results, ids);

  const run = (key, fn) => {
    setBusy(key);
    try { fn(summary); } finally { setBusy(null); }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Export decision summary</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Download a professional PDF, a CSV sheet row, or a Word document.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => run("pdf", downloadDecisionPdf)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60"
          >
            {busy === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />} PDF
          </button>
          <button
            onClick={() => run("csv", downloadDecisionCsv)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm text-slate-700 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "csv" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} CSV
          </button>
          <button
            onClick={() => run("doc", downloadDecisionWord)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm text-slate-700 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "doc" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileType className="w-4 h-4" />} Word
          </button>
        </div>
      </div>
    </div>
  );
}