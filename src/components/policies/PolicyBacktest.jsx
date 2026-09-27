import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, FlaskConical, X, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

const DECISION_STYLE = {
  APPROVE: "text-emerald-700 bg-emerald-50 border-emerald-200",
  REVIEW: "text-amber-700 bg-amber-50 border-amber-200",
  DECLINE: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function PolicyBacktest({ policy, onClose }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("apiPolicyBacktest", {
        rules: policy.rules,
        policy_id: policy.policy_id,
        version: policy.version,
        limit: 200
      });
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Backtest failed.");
    } finally {
      setRunning(false);
    }
  };

  const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;
  const fmtMoney = (v, c) => v != null ? `${(v).toLocaleString()} ${c || ""}` : "—";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#0d9488]" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Backtest policy</h3>
              <p className="text-[11px] text-slate-400">{policy.name} · v{policy.version} · {policy.rules?.length || 0} rules</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Re-evaluates your past <span className="font-medium text-slate-800">completed applications</span> against this candidate policy
              and compares each result to the original decision. See how many decisions would flip before you publish.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-rose-700">{error}</p>
            </div>
          )}

          {!result && !running && (
            <button onClick={run} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2.5 rounded-lg hover:bg-slate-800">
              <FlaskConical className="w-4 h-4" /> Run backtest
            </button>
          )}

          {running && (
            <div className="flex items-center gap-2 py-6 justify-center">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              <span className="text-sm text-slate-500">Re-evaluating past applications…</span>
            </div>
          )}

          {result && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard label="Applications" value={result.summary.total} icon={<Minus className="w-3.5 h-3.5" />} cls="text-slate-700 bg-slate-50 border-slate-200" />
                <SummaryCard label="Same decision" value={result.summary.same} icon={<Minus className="w-3.5 h-3.5" />} cls="text-slate-600 bg-slate-50 border-slate-200" />
                <SummaryCard label="Flipped" value={result.summary.flipped} icon={result.summary.flipped > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />} cls={result.summary.flipped > 0 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200"} />
                <SummaryCard label="Flip rate" value={fmtPct(result.summary.flip_rate)} icon={<TrendingUp className="w-3.5 h-3.5" />} cls="text-slate-700 bg-slate-50 border-slate-200" />
              </div>

              {/* Approval/decline rate comparison */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3">Approval rate impact</div>
                <div className="grid grid-cols-2 gap-4">
                  <RateBar label="Approval rate" original={result.summary.approval_rate_original} candidate={result.summary.approval_rate_candidate} fmt={fmtPct} positiveColor="emerald" />
                  <RateBar label="Decline rate" original={result.summary.decline_rate_original} candidate={result.summary.decline_rate_candidate} fmt={fmtPct} positiveColor="rose" />
                </div>
              </div>

              {/* Flip matrix */}
              {Object.keys(result.summary.flip_matrix).length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Decision flips</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.summary.flip_matrix).map(([key, count]) => {
                      const [from, to] = key.split("→");
                      const isNegative = to === "DECLINE" && from !== "DECLINE";
                      const isPositive = to === "APPROVE" && from !== "APPROVE";
                      return (
                        <div key={key} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium ${isNegative ? "text-rose-700 bg-rose-50 border-rose-200" : isPositive ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${DECISION_STYLE[from]}`}>{from}</span>
                          <ArrowRight className="w-3 h-3 opacity-60" />
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${DECISION_STYLE[to]}`}>{to}</span>
                          <span className="tabular-nums ml-1 font-semibold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Per-app results */}
              {result.results.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Flipped applications ({result.results.filter(r => r.flipped).length} shown)
                  </div>
                  <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {result.results.filter(r => r.flipped).slice(0, 30).map((r) => (
                      <div key={r.application_id} className="flex items-center gap-2 px-3 py-2 text-[12px]">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${DECISION_STYLE[r.original_decision]}`}>{r.original_decision}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${DECISION_STYLE[r.candidate_decision]}`}>{r.candidate_decision}</span>
                        <span className="font-mono text-slate-400 text-[10px] truncate">{r.application_number || r.application_id.slice(-8)}</span>
                        <span className="text-slate-400 ml-auto text-[10px]">{r.market} · {fmtMoney(r.loan_amount, r.loan_currency)}</span>
                      </div>
                    ))}
                    {result.results.filter(r => r.flipped).length === 0 && (
                      <div className="px-3 py-4 text-center text-[12px] text-slate-400">No decisions flipped — this policy produces identical outcomes.</div>
                    )}
                  </div>
                </div>
              )}

              <button onClick={run} disabled={running} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-slate-900">
                <Loader2 className={`w-3.5 h-3.5 ${running ? "animate-spin" : ""}`} /> Re-run
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, cls }) {
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold opacity-70 mb-1">{icon} {label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function RateBar({ label, original, candidate, fmt, positiveColor }) {
  const delta = candidate - original;
  const isUp = delta > 0;
  const isDown = delta < 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-slate-500 font-medium">{label}</span>
        <span className={`text-[11px] font-mono tabular-nums ${isUp ? "text-emerald-600" : isDown ? "text-rose-600" : "text-slate-400"}`}>
          {isUp ? "▲" : isDown ? "▼" : "—"} {fmt(Math.abs(delta))}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[12px]">
        <span className="text-slate-400 font-mono">{fmt(original)}</span>
        <ArrowRight className="w-3 h-3 text-slate-300" />
        <span className="font-mono font-semibold text-slate-700">{fmt(candidate)}</span>
      </div>
    </div>
  );
}