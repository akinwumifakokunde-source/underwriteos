import React, { useState } from "react";
import { FileSpreadsheet, FileText, FileType, Loader2 } from "lucide-react";
import { buildDecisionSummary, downloadDecisionCsv, downloadDecisionPdf, downloadDecisionWord } from "@/lib/decisionExport";

export default function ExportControls({ results, ids }) {
  const [busy, setBusy] = useState(null);
  const summary = buildDecisionSummary(results, ids);

  const run = (key, fn) => {
    setBusy(key);
    try { fn(summary); } finally { setBusy(null); }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Export decision summary</h3>
        <span className="text-[11px] text-slate-400">Keep a master record</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => run("csv", downloadDecisionCsv)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === "csv" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} CSV (sheet)
        </button>
        <button
          onClick={() => run("pdf", downloadDecisionPdf)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF
        </button>
        <button
          onClick={() => run("doc", downloadDecisionWord)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === "doc" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileType className="w-4 h-4" />} Word
        </button>
      </div>
      <p className="text-[11px] text-slate-400 mt-2">
        CSV is a flat row you can paste into Excel or Google Sheets. PDF and Word produce a formatted summary document.
      </p>
    </div>
  );
}