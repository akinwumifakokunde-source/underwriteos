import React, { useEffect, useMemo, useState } from "react";
import { ScrollText, ShieldCheck, FileJson, FileSpreadsheet, Loader2, ChevronDown, ChevronUp, CheckCircle2, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  buildReasonCodes,
  buildAdverseActionLetter,
  detectCreditBureau,
  downloadAdverseActionPdf,
  downloadReasonCodesCsv,
  downloadAuditExportJson,
} from "@/lib/regulatoryOutputs";

export default function RegulatoryOutputs({ decision, recommendation, borrower, app, riskSignals, evidence, creditProfile, financialProfile }) {
  const [lenderName, setLenderName] = useState(null);
  const [showLetter, setShowLetter] = useState(false);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    base44.functions.invoke("apiSettings", { action: "get" })
      .then((res) => setLenderName(res.data?.organization?.name || "the Lender"))
      .catch(() => setLenderName("the Lender"));
  }, []);

  const market = app?.market || "GB";
  const isAdverse = decision?.decision === "DECLINE" || decision?.decision === "REVIEW";

  const reasonCodes = useMemo(
    () => (decision ? buildReasonCodes({ decision, recommendation, riskSignals }) : []),
    [decision, recommendation, riskSignals]
  );
  const bureau = useMemo(() => (decision ? detectCreditBureau({ evidence, creditProfile }) : null), [decision, evidence, creditProfile]);
  const letter = useMemo(
    () => (decision && lenderName
      ? buildAdverseActionLetter({ decision, recommendation, borrower, app, riskSignals, evidence, creditProfile, market, lenderName })
      : null),
    [decision, recommendation, borrower, app, riskSignals, evidence, creditProfile, market, lenderName]
  );

  if (!decision) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
        <ScrollText className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
        <p className="text-sm text-slate-500 font-medium">Regulatory outputs available once a decision is made</p>
        <p className="text-[12px] text-slate-400 mt-0.5">Adverse-action notices, reason codes and an evidence-backed audit export are generated automatically.</p>
      </div>
    );
  }

  const run = (key, fn) => {
    setBusy(key);
    try { fn(); } finally { setBusy(null); }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">Regulatory outputs</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Evidence-backed adverse-action notice, reason codes and audit export — every figure traceable to its source record.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 font-medium">{letter?.framework || "—"}</span>
        {bureau && <span className="rounded-md bg-sky-50 text-sky-700 px-2 py-0.5">Bureau: {bureau}</span>}
        {isAdverse
          ? <span className="rounded-md bg-rose-50 text-rose-700 px-2 py-0.5">Adverse action required</span>
          : <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> No adverse action</span>}
      </div>

      {/* Reason codes */}
      {reasonCodes.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Key adverse-action factors</div>
          <div className="space-y-1">
            {reasonCodes.map((c) => (
              <div key={c.code} className="flex items-start gap-2 text-[12px] py-1 border-b border-slate-50 last:border-0">
                <span className="font-mono text-teal-700 font-semibold shrink-0">{c.code}</span>
                <span className="text-slate-600">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adverse action letter preview */}
      {isAdverse && letter && (
        <div className="mt-4">
          <button
            onClick={() => setShowLetter((v) => !v)}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-700 hover:text-slate-900"
          >
            {showLetter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Preview adverse-action notice
          </button>
          {showLetter && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/60 p-4 max-h-72 overflow-y-auto">
              <p className="text-sm font-semibold text-slate-900 mb-1">Notice of Adverse Action</p>
              {letter.lines.map((ln, i) => {
                if (ln.kind === "sp") return <div key={i} className="h-2" />;
                if (ln.kind === "li") return <p key={i} className="text-[12px] text-slate-600 pl-3">• {ln.text}</p>;
                if (ln.kind === "m") return <p key={i} className="text-[11px] text-slate-400">{ln.text}</p>;
                return <p key={i} className="text-[12px] text-slate-600 leading-relaxed">{ln.text}</p>;
              })}
            </div>
          )}
        </div>
      )}

      {/* Download buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {isAdverse && (
          <button
            onClick={() => run("letter", () => downloadAdverseActionPdf(letter, app?.id))}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60"
          >
            {busy === "letter" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScrollText className="w-4 h-4" />} Adverse-action PDF
          </button>
        )}
        <button
          onClick={() => run("codes", () => downloadReasonCodesCsv(reasonCodes, app?.id))}
          disabled={busy || reasonCodes.length === 0}
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === "codes" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Reason codes (CSV)
        </button>
        <button
          onClick={() => run("audit", () => downloadAuditExportJson({ decision, recommendation, riskSignals, evidence, app, borrower, creditProfile, financialProfile, market, reasonCodes, bureau }))}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === "audit" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />} Audit export (JSON)
        </button>
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-400">
        <Info className="w-3 h-3 shrink-0 mt-0.5" />
        <span>The audit export contains every risk signal and its evidence record, so an examiner can trace each figure in the decision to its source document.</span>
      </div>
    </div>
  );
}