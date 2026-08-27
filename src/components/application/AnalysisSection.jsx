import React from "react";
import { Brain, TrendingUp, TrendingDown, Sparkles, RefreshCw, Loader2 } from "lucide-react";

export default function AnalysisSection({ recommendation, running, lastUpdated, onRerun }) {
  if (running) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">UnderwriteOS is analyzing the application.</h3>
        <p className="text-[13px] text-slate-500 mt-1">Extracting financial metrics, generating risk signals, and evaluating the policy.</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Waiting for borrower information.</p>
        <p className="text-[12px] text-slate-400 mt-1">The AI underwriter generates a recommendation automatically once documents are processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {lastUpdated && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-slate-400">Recommendation updated {lastUpdated}</p>
          <button onClick={onRerun} className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-600 hover:text-slate-900">
            <RefreshCw className="w-3 h-3" /> Re-run
          </button>
        </div>
      )}

      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Underwriter</h3>
            <p className="text-[11px] text-slate-400">Advisory only — your policy decides</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-slate-900">{recommendation.recommendation}</div>
            <div className="text-[11px] text-slate-400">Recommendation</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-white border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Confidence</div>
            <div className="text-lg font-semibold text-slate-900">{recommendation.confidence != null ? `${Math.round(recommendation.confidence * 100)}%` : "—"}</div>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Risk score</div>
            <div className="text-lg font-semibold text-slate-900">{recommendation.risk_score?.toFixed(2) || "—"}</div>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Prob. of default</div>
            <div className="text-lg font-semibold text-slate-900">{recommendation.probability_of_default != null ? `${(recommendation.probability_of_default * 100).toFixed(1)}%` : "—"}</div>
          </div>
        </div>

        {recommendation.positive_signals?.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Positive factors</div>
            {recommendation.positive_signals.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px] text-slate-700 py-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {s}
              </div>
            ))}
          </div>
        )}
        {recommendation.risk_factors?.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Risk factors</div>
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
          AI recommendation is advisory. Your policy remains authoritative.
        </div>
      </div>
    </div>
  );
}