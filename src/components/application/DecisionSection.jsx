import React, { useState } from "react";
import { Check, X, AlertTriangle, Brain, ShieldCheck, GitBranch, Loader2, ArrowDown, FileText } from "lucide-react";
import { DIMENSION_STYLES } from "@/lib/riskDimensions";

const DECISION_STYLES = {
  APPROVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: Check },
  REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertTriangle },
  DECLINE: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: X },
};

export default function DecisionSection({ decision, recommendation, evidence, onOverride, overriding, dimensions }) {
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  if (!decision) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">No decision yet</p>
        <p className="text-[12px] text-slate-400 mt-1">A decision is generated automatically once documents are processed and the policy evaluates. Upload documents to begin.</p>
      </div>
    );
  }

  const style = DECISION_STYLES[decision.decision] || DECISION_STYLES.REVIEW;
  const DIcon = style.icon;

  const submitOverride = () => {
    if (!overrideDecision || !overrideReason.trim()) return;
    onOverride(overrideDecision, overrideReason);
    setOverrideMode(false);
    setOverrideDecision("");
    setOverrideReason("");
  };

  return (
    <div className="space-y-5">
      {/* Decision banner */}
      <div className={`rounded-xl border p-5 ${style.bg} ${style.border}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center shrink-0">
            <DIcon className={`w-6 h-6 ${style.text}`} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider opacity-70">Final decision</div>
            <div className="text-2xl font-bold">{decision.decision}</div>
            <div className="text-[12px] opacity-70 mt-0.5">Decided by {decision.decision_source?.replace(/_/g, " ")}</div>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <div>
              <div className="text-[11px] uppercase tracking-wider opacity-70">Risk score</div>
              <div className="text-lg font-semibold">{decision.risk_score?.toFixed(1) || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider opacity-70">Prob. of default</div>
              <div className="text-lg font-semibold">{decision.probability_of_default != null ? `${(decision.probability_of_default * 100).toFixed(1)}%` : "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI vs Policy vs Final */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">AI recommendation</span>
          </div>
          <div className={`text-lg font-bold ${recommendation?.recommendation === "APPROVE" ? "text-emerald-700" : recommendation?.recommendation === "DECLINE" ? "text-rose-700" : "text-amber-700"}`}>
            {recommendation?.recommendation || "—"}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Policy result</span>
          </div>
          <div className={`text-lg font-bold ${decision.policy_outcome?.decision === "APPROVE" ? "text-emerald-700" : decision.policy_outcome?.decision === "DECLINE" ? "text-rose-700" : "text-amber-700"}`}>
            {decision.policy_outcome?.decision || decision.decision}
          </div>
        </div>
        <div className="rounded-xl border-2 border-slate-900 bg-slate-50 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <GitBranch className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Final decision</span>
          </div>
          <div className={`text-lg font-bold ${decision.decision === "APPROVE" ? "text-emerald-700" : decision.decision === "DECLINE" ? "text-rose-700" : "text-amber-700"}`}>
            {decision.decision}
          </div>
        </div>
      </div>

      {/* Risk dimensions */}
      {dimensions && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Affordability", ...dimensions.affordability },
            { label: "Credit risk", ...dimensions.creditRisk },
            { label: "Fraud risk", ...dimensions.fraudRisk },
            { label: "Data quality", ...dimensions.dataQuality },
          ].map((d, i) => {
            const style = DIMENSION_STYLES[d.level] || DIMENSION_STYLES.Pending;
            return (
              <div key={i} className={`rounded-xl border p-3 ${style.cls}`}>
                <div className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">{d.label}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className="text-sm font-semibold">{d.level}</span>
                </div>
                <div className="text-[10px] opacity-70 mt-0.5">{d.detail}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision path */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Decision path</h3>
        <div className="flex items-center gap-2 text-[12px] text-slate-500 flex-wrap">
          <span className="rounded-lg bg-slate-900 text-white px-2.5 py-1">Decision</span>
          <ArrowDown className="w-3 h-3 -rotate-90" />
          <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">Policy evaluation</span>
          <ArrowDown className="w-3 h-3 -rotate-90" />
          <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">Risk signal</span>
          <ArrowDown className="w-3 h-3 -rotate-90" />
          <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">Financial metric</span>
          <ArrowDown className="w-3 h-3 -rotate-90" />
          <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">Evidence</span>
          <ArrowDown className="w-3 h-3 -rotate-90" />
          <span className="rounded-lg bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1">Source document</span>
        </div>
      </div>

      {/* Why */}
      {decision.reasons?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Why this decision?</h3>
          <ul className="space-y-1.5">
            {decision.reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2">
                <span className="text-slate-300 mt-0.5">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence */}
      {evidence?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Evidence</h3>
          <p className="text-[12px] text-slate-400 mb-3">Every number in this decision is traceable to its source.</p>
          <div className="space-y-1">
            {evidence.slice(0, 8).map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] py-1.5 border-b border-slate-50 last:border-0">
                <FileText className="w-3 h-3 text-slate-300 shrink-0" />
                <span className="text-slate-700 font-medium">{e.signal}</span>
                <span className="font-mono text-slate-500">{String(e.value)}</span>
                <span className="text-slate-400 ml-auto text-right">{e.source_type?.replace(/_/g, " ")}{e.source_location ? ` · ${e.source_location}` : ""}</span>
              </div>
            ))}
            {evidence.length > 8 && <div className="text-[12px] text-teal-600 pt-1">+{evidence.length - 8} more evidence records</div>}
          </div>
        </div>
      )}

      {/* Actions */}
      {!overrideMode && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Underwriter actions</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("APPROVE"); }} className="text-sm font-medium text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700">Approve</button>
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("REVIEW"); }} className="text-sm font-medium text-amber-700 bg-amber-100 border border-amber-300 px-4 py-2 rounded-lg hover:bg-amber-200">Request information</button>
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("DECLINE"); }} className="text-sm font-medium text-white bg-rose-600 px-4 py-2 rounded-lg hover:bg-rose-700">Decline</button>
          </div>
          {decision.decision_source === "human_underwriter" && decision.override_reason && (
            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
              Last override by {decision.decided_by}: "{decision.override_reason}"
            </p>
          )}
        </div>
      )}

      {/* Override form */}
      {overrideMode && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Override decision</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">New decision</label>
              <div className="flex gap-2 mt-1">
                {["APPROVE", "REVIEW", "DECLINE"].map((d) => (
                  <button key={d} onClick={() => setOverrideDecision(d)} className={`text-sm px-3 py-2 rounded-lg border ${overrideDecision === d ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {d === "REVIEW" ? "Request info" : d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Override reason (required)</label>
              <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} rows={3} placeholder="Explain why this decision is being overridden…" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={submitOverride} disabled={!overrideDecision || !overrideReason.trim() || overriding} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                {overriding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Submit override
              </button>
              <button onClick={() => { setOverrideMode(false); setOverrideDecision(""); setOverrideReason(""); }} className="text-sm text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100">Cancel</button>
            </div>
            <p className="text-[11px] text-slate-400">Override will be recorded in the audit trail with your name, timestamp, and reason.</p>
          </div>
        </div>
      )}
    </div>
  );
}