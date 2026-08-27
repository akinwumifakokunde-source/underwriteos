import React, { useState } from "react";
import { ChevronDown, ChevronRight, Brain, ArrowRight } from "lucide-react";
import NeedsAttentionPanel from "./NeedsAttentionPanel";
import UnderwritingReadiness from "./UnderwritingReadiness";
import UnderwritingSnapshot from "./UnderwritingSnapshot";
import ApplicationFormSection from "./ApplicationFormSection";

export default function OverviewTab({ borrower, app, fp, cp, decision, recommendation, riskSignals, documents, fmtMoney, form, setForm, allExtracted, onSave, saving, onNavigate }) {
  const [showForm, setShowForm] = useState(false);

  const topSignals = (riskSignals || []).slice(0, 5);

  return (
    <div className="space-y-5">
      <UnderwritingReadiness documents={documents} app={app} fp={fp} cp={cp} decision={decision} onNavigate={onNavigate} />

      <NeedsAttentionPanel documents={documents} app={app} decision={decision} onNavigate={onNavigate} />

      <UnderwritingSnapshot borrower={borrower} app={app} fp={fp} cp={cp} decision={decision} recommendation={recommendation} fmtMoney={fmtMoney} />

      {/* Key risk signals summary */}
      {topSignals.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Key risk signals</h3>
            <button onClick={() => onNavigate?.("Risk")} className="inline-flex items-center gap-1 text-[12px] font-medium text-teal-600 hover:text-teal-700">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {topSignals.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px]">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.flag === "positive" ? "bg-emerald-500" : s.flag === "negative" || s.flag === "critical" ? "bg-rose-500" : "bg-slate-300"}`} />
                <span className="text-slate-700 flex-1 capitalize">{s.signal.replace(/_/g, " ")}</span>
                <span className="font-mono text-slate-500">{typeof s.value === "number" ? s.value : String(s.value || "—")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI underwriter summary */}
      {recommendation && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">AI underwriter summary</h3>
            <span className="text-[10px] text-slate-400 ml-auto">Advisory only</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Recommendation</div>
              <div className="text-lg font-bold text-slate-900">{recommendation.recommendation}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Confidence</div>
              <div className="text-lg font-bold text-slate-900">{recommendation.confidence != null ? `${Math.round(recommendation.confidence * 100)}%` : "—"}</div>
            </div>
            <button onClick={() => onNavigate?.("AI Underwriter")} className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-violet-600 hover:text-violet-700">
              Full assessment <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recommendation.ai_summary && <p className="text-[13px] text-slate-600 leading-relaxed">{recommendation.ai_summary}</p>}
        </div>
      )}

      {/* Borrower & loan details (collapsible) */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <h3 className="text-sm font-semibold text-slate-900">Borrower & loan details</h3>
          {showForm ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>
        {showForm && form && (
          <div className="px-5 pb-5">
            <ApplicationFormSection
              borrower={borrower} app={app} form={form} setForm={setForm}
              extractedFields={allExtracted} onSave={onSave} saving={saving}
            />
          </div>
        )}
      </div>
    </div>
  );
}