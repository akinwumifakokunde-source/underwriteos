import React, { useState } from "react";
import { Check, X, AlertTriangle, ShieldAlert, RotateCcw, TrendingUp, TrendingDown, FileDown, Loader2 } from "lucide-react";
import ExportControls from "@/components/underwrite/ExportControls.jsx";
import { buildDecisionSummary, downloadDecisionPdf } from "@/lib/decisionExport";

const DECISION = {
  APPROVE: { icon: Check, cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "APPROVE" },
  REVIEW: { icon: AlertTriangle, cls: "bg-amber-50 text-amber-700 border-amber-200", label: "REVIEW" },
  DECLINE: { icon: X, cls: "bg-rose-50 text-rose-700 border-rose-200", label: "DECLINE" },
};

const FLAG = {
  positive: "text-emerald-700 bg-emerald-50 border-emerald-200",
  neutral: "text-slate-600 bg-slate-50 border-slate-200",
  negative: "text-amber-700 bg-amber-50 border-amber-200",
  critical: "text-rose-700 bg-rose-50 border-rose-200",
};

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-0.5">{value ?? "—"}</div>
    </div>
  );
}

function num(n, dp = 0) {
  if (n == null || n === "" || isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: dp });
}

export default function UnderwriteResults({ results, ids, onReset }) {
  const { decision, recommendation, riskSignals, evidence, financialProfile, creditProfile } = results;
  const d = DECISION[decision?.decision] || DECISION.REVIEW;
  const DIcon = d.icon;
  const [pdfBusy, setPdfBusy] = useState(false);
  const handlePdf = () => {
    setPdfBusy(true);
    try { downloadDecisionPdf(buildDecisionSummary(results, ids)); } finally { setPdfBusy(false); }
  };

  return (
    <div className="space-y-5">
      {/* decision banner */}
      <div className={`rounded-xl border p-5 flex items-center gap-4 ${d.cls}`}>
        <div className="w-11 h-11 rounded-full bg-white/60 flex items-center justify-center shrink-0">
          <DIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider opacity-70">Underwriting decision</div>
          <div className="text-xl font-semibold">{d.label}</div>
          {decision?.decision_source && <div className="text-[12px] opacity-70 mt-0.5">Decided by {decision.decision_source.replace("_", " ")}</div>}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider opacity-70">Risk score</div>
            <div className="text-xl font-semibold">{num(decision?.risk_score ?? recommendation?.risk_score, 2)}</div>
          </div>
          <button
            onClick={handlePdf}
            disabled={pdfBusy}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-900 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-60 transition-colors"
          >
            {pdfBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} Download PDF
          </button>
        </div>
      </div>

      {/* recommendation + confidence */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Recommendation" value={recommendation?.recommendation || "—"} />
        <Stat label="Confidence" value={recommendation?.confidence != null ? `${Math.round(recommendation.confidence * 100)}%` : "—"} />
        <Stat label="PD" value={recommendation?.probability_of_default != null ? num(recommendation.probability_of_default, 2) : "—"} />
        <Stat label="Human review" value={recommendation?.human_review_required ? "Required" : "Not required"} />
      </div>

      {recommendation?.ai_memo && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">AI memo</div>
          <p className="text-sm text-slate-700 leading-relaxed">{recommendation.ai_memo}</p>
        </div>
      )}

      {(recommendation?.reasons?.length > 0 || decision?.reasons?.length > 0) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Reasons</div>
          <ul className="space-y-1">
            {(decision?.reasons || recommendation?.reasons || []).map((r, i) => (
              <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-300">•</span>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* risk signals */}
      {riskSignals.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Risk signals</h3>
          </div>
          <div className="space-y-2">
            {riskSignals.map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${FLAG[s.flag] || FLAG.neutral}`}>{(s.flag || "neutral").toUpperCase()}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{s.signal}</div>
                  {s.explanation && <div className="text-[12px] text-slate-500 truncate">{s.explanation}</div>}
                </div>
                <div className="text-sm font-mono text-slate-700">{String(s.value ?? "—")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {creditProfile && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Credit profile</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Score" value={num(creditProfile.credit_score)} />
              <Row label="Band" value={creditProfile.score_band} />
              <Row label="Utilisation" value={creditProfile.credit_utilisation != null ? `${Math.round(creditProfile.credit_utilisation * 100)}%` : "—"} />
              <Row label="Defaults" value={num(creditProfile.defaults)} />
              <Row label="Active accounts" value={num(creditProfile.active_accounts)} />
              <Row label="Provider" value={creditProfile.provider} />
            </div>
          </div>
        )}
        {financialProfile && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Financial profile</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Monthly income" value={"£" + num(financialProfile.income?.monthly)} />
              <Row label="Monthly net" value={"£" + num(financialProfile.cashflow?.monthly_net)} />
              <Row label="Debt-to-income" value={financialProfile.affordability?.debt_to_income != null ? num(financialProfile.affordability.debt_to_income, 2) : "—"} />
              <Row label="Disposable income" value={"£" + num(financialProfile.cashflow?.disposable_income)} />
            </div>
          </div>
        )}
      </div>

      {/* evidence */}
      {evidence.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Evidence ({evidence.length})</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {evidence.map((e, i) => (
              <div key={i} className="text-[12px] text-slate-600 font-mono flex gap-2">
                <span className="text-slate-300">{i + 1}.</span>
                <span className="truncate">{e.signal}: {String(e.value)} <span className="text-slate-400">[{e.source_type}{e.field ? ` · ${e.field}` : ""}]</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ExportControls results={results} ids={ids} />

      <div className="flex items-center justify-between pt-2">
        <div className="text-[11px] text-slate-400 font-mono">
          {ids.application_id && <span>Application {ids.application_id}</span>}
        </div>
        <button onClick={onReset} className="inline-flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-lg border border-slate-200 hover:bg-white">
          <RotateCcw className="w-4 h-4" /> New underwriting
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value ?? "—"}</span>
    </div>
  );
}