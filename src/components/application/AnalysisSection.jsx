import React from "react";
import { Brain, TrendingUp, TrendingDown, Minus, Sparkles, Loader2, RefreshCw } from "lucide-react";

export default function AnalysisSection({ results, running, lastUpdated, onRerun }) {
  const { financialProfile, creditProfile, riskSignals, recommendation } = results || {};

  if (running) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">UnderwriteOS is analyzing the application.</h3>
        <p className="text-[13px] text-slate-500 mt-1">Extracting financial metrics, generating risk signals, and evaluating the policy.</p>
      </div>
    );
  }

  if (!results || (!financialProfile && !creditProfile)) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No analysis yet.</p>
        <p className="text-[12px] text-slate-400 mt-1">Upload documents and run analysis to see the AI-generated financial picture.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {lastUpdated && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-slate-400">Analysis updated {lastUpdated}</p>
          <button onClick={onRerun} className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-600 hover:text-slate-900">
            <RefreshCw className="w-3 h-3" /> Re-run
          </button>
        </div>
      )}

      {/* Financial summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Financial summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Metric label="Annual income" value={fmtMoney(financialProfile?.income?.annual)} />
          <Metric label="Monthly income" value={fmtMoney(financialProfile?.income?.monthly)} />
          <Metric label="Monthly debt" value={fmtMoney(financialProfile?.debt?.monthly_payments || financialProfile?.expenses?.monthly)} />
          <Metric label="Debt-to-income" value={financialProfile?.affordability?.debt_to_income != null ? `${(financialProfile.affordability.debt_to_income * 100).toFixed(1)}%` : "—"} />
          <Metric label="Credit score" value={creditProfile?.credit_score ?? "—"} />
          <Metric label="Credit utilization" value={creditProfile?.credit_utilisation != null ? `${Math.round(creditProfile.credit_utilisation * 100)}%` : "—"} />
          <Metric label="Repayment history" value={creditProfile?.repayment_history != null ? `${creditProfile.repayment_history}%` : "—"} />
          <Metric label="Disposable income" value={fmtMoney(financialProfile?.cashflow?.disposable_income)} />
          <Metric label="Average balance" value={fmtMoney(financialProfile?.cashflow?.average_balance)} />
        </div>
      </div>

      {/* Risk signals */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Risk signals</h3>
        {riskSignals?.length > 0 ? (
          <div className="space-y-1.5">
            {riskSignals.map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <SignalIcon flag={s.flag} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{s.signal.replace(/_/g, " ")}</div>
                  {s.explanation && <div className="text-[11px] text-slate-400">{s.explanation}</div>}
                </div>
                <div className="text-sm font-mono text-slate-600">{formatSignalValue(s)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No risk signals generated.</p>
        )}
      </div>

      {/* AI Underwriter */}
      {recommendation && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">AI Underwriter</h3>
              <p className="text-[11px] text-slate-400">Advisory only — your policy decides</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-lg font-bold text-slate-900">{recommendation.recommendation}</div>
              <div className="text-[11px] text-slate-400">Recommendation</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg bg-white border border-slate-200 p-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Confidence</div>
              <div className="text-lg font-semibold text-slate-900">{recommendation.confidence != null ? `${Math.round(recommendation.confidence * 100)}%` : "—"}</div>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Risk score</div>
              <div className="text-lg font-semibold text-slate-900">{recommendation.risk_score?.toFixed(2) || "—"}</div>
            </div>
          </div>

          {recommendation.positive_signals?.length > 0 && (
            <div className="mb-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Key positive factors</div>
              {recommendation.positive_signals.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] text-slate-700 py-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {s}
                </div>
              ))}
            </div>
          )}
          {recommendation.risk_factors?.length > 0 && (
            <div className="mb-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Key risk factors</div>
              {recommendation.risk_factors.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] text-slate-700 py-0.5">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> {s}
                </div>
              ))}
            </div>
          )}
          {recommendation.ai_memo && (
            <div className="mt-3 pt-3 border-t border-violet-200">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">AI reasoning</div>
              <p className="text-[13px] text-slate-600 leading-relaxed">{recommendation.ai_memo}</p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-violet-700 bg-violet-100/60 rounded-lg px-3 py-2">
            <Sparkles className="w-3 h-3" />
            AI assists. Your policy decides.
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="text-lg font-semibold text-slate-900 mt-0.5">{value ?? "—"}</div>
    </div>
  );
}

function SignalIcon({ flag }) {
  if (flag === "positive") return <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-emerald-600" /></div>;
  if (flag === "negative") return <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center"><TrendingDown className="w-3.5 h-3.5 text-amber-600" /></div>;
  if (flag === "critical") return <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center"><TrendingDown className="w-3.5 h-3.5 text-rose-600" /></div>;
  return <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><Minus className="w-3.5 h-3.5 text-slate-400" /></div>;
}

function fmtMoney(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

function formatSignalValue(s) {
  if (s.value_type === "number") {
    if (s.currency) return fmtMoney(s.value);
    if (s.value < 1 && s.value > 0) return `${Math.round(s.value * 100)}%`;
    return String(s.value);
  }
  return String(s.value ?? "—");
}