import React, { useState } from "react";
import { Check, X, AlertTriangle, Brain, ShieldCheck, GitBranch, Loader2, ArrowDown } from "lucide-react";

const DECISION_STYLES = {
  APPROVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: Check, label: "APPROVE" },
  REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertTriangle, label: "REVIEW" },
  DECLINE: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: X, label: "DECLINE" },
};

export default function DecisionSection({ decision, recommendation, evidence, onOverride, overriding }) {
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  if (!decision) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No decision yet.</p>
        <p className="text-[12px] text-slate-400 mt-1">Run analysis to generate an underwriting decision.</p>
      </div>
    );
  }

  const style = DECISION_STYLES[decision.decision] || DECISION_STYLES.REVIEW;
  const DIcon = style.icon;
  const needsReview = decision.decision === "REVIEW" || decision.human_review_required;

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
            <div className="text-[11px] uppercase tracking-wider opacity-70">Underwriting decision</div>
            <div className="text-2xl font-bold">{decision.decision}</div>
            <div className="text-[12px] opacity-70 mt-0.5">Decided by {decision.decision_source?.replace(/_/g, " ")}</div>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <div>
              <div className="text-[11px] uppercase tracking-wider opacity-70">Risk score</div>
              <div className="text-lg font-semibold">{decision.risk_score?.toFixed(1) || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider opacity-70">Probability of default</div>
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
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Policy evaluation</span>
          </div>
          <div className={`text-lg font-bold ${decision.decision === "APPROVE" ? "text-emerald-700" : decision.decision === "DECLINE" ? "text-rose-700" : "text-amber-700"}`}>
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

      {/* Reasons */}
      {decision.reasons?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Why this decision?</h3>
          <ul className="space-y-1.5">
            {decision.reasons.slice(0, 5).map((r, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2">
                <span className="text-slate-300 mt-0.5">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Human review */}
      {needsReview && !overrideMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">Human review required</h3>
          <p className="text-[13px] text-amber-700 mb-3">
            {decision.policy_outcome?.triggered_rules?.[0]?.reason || "Policy returned REVIEW. An underwriter must approve, decline, or request more information."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("APPROVE"); }} className="text-sm font-medium text-white bg-emerald-600 px-3.5 py-2 rounded-lg hover:bg-emerald-700">Approve</button>
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("DECLINE"); }} className="text-sm font-medium text-white bg-rose-600 px-3.5 py-2 rounded-lg hover:bg-rose-700">Decline</button>
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("REVIEW"); }} className="text-sm font-medium text-amber-700 bg-amber-100 border border-amber-300 px-3.5 py-2 rounded-lg hover:bg-amber-200">Keep in review</button>
          </div>
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
                    {d}
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

      {/* Evidence lineage */}
      {evidence?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Decision evidence</h3>
          <p className="text-[12px] text-slate-400 mb-3">Every number in this decision is traceable to its source.</p>
          <div className="space-y-1">
            {evidence.slice(0, 10).map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] py-1.5 border-b border-slate-50 last:border-0">
                <ArrowDown className="w-3 h-3 text-slate-300" />
                <span className="text-slate-700 font-medium">{e.signal}</span>
                <span className="font-mono text-slate-500">{String(e.value)}</span>
                <span className="text-slate-400 ml-auto">{e.source_type}{e.source_location ? ` · ${e.source_location}` : ""}</span>
              </div>
            ))}
            {evidence.length > 10 && <div className="text-[12px] text-teal-600 pt-1">+{evidence.length - 10} more evidence records</div>}
          </div>
        </div>
      )}
    </div>
  );
}