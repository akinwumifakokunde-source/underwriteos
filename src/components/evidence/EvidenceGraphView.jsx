import React, { useMemo, useState } from "react";
import {
  ShieldCheck, AlertTriangle, Brain, Scale, Activity, FileSearch,
  Link2, ChevronRight, X, CircleDot, Globe2,
} from "lucide-react";

const SOURCE_LABEL = {
  credit_report: "Credit report",
  bank_statement: "Bank statement",
  document: "Document",
  borrower_declaration: "Borrower declaration",
  derived: "Derived calculation",
  ai_analysis: "AI analysis",
};

const CATEGORY_META = {
  credit: { label: "Credit", color: "text-violet-700 bg-violet-50 border-violet-200" },
  cashflow: { label: "Cashflow", color: "text-sky-700 bg-sky-50 border-sky-200" },
  affordability: { label: "Affordability", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  fraud: { label: "Fraud", color: "text-rose-700 bg-rose-50 border-rose-200" },
};

const FLAG_META = {
  positive: { label: "Positive", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  neutral: { label: "Neutral", cls: "text-slate-600 bg-slate-50 border-slate-200" },
  negative: { label: "Negative", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  critical: { label: "Critical", cls: "text-rose-700 bg-rose-50 border-rose-200" },
};

const DECISION_META = {
  APPROVE: { cls: "text-emerald-700 bg-emerald-50 border-emerald-200", Icon: ShieldCheck },
  REVIEW: { cls: "text-amber-700 bg-amber-50 border-amber-200", Icon: AlertTriangle },
  DECLINE: { cls: "text-rose-700 bg-rose-50 border-rose-200", Icon: AlertTriangle },
};

function fmt(v, type) {
  if (v == null) return "—";
  if (type === "number") return Number(v).toLocaleString();
  if (type === "boolean") return v ? "Yes" : "No";
  return String(v);
}

export default function EvidenceGraphView({ data }) {
  const { application, decision, recommendation, policy, risk_signals = [], evidence = [], credit_reports = [] } = data;
  const [selectedSignal, setSelectedSignal] = useState(null);

  const evidenceBySignal = useMemo(() => {
    const m = {};
    for (const e of evidence) (m[e.signal_id] ||= []).push(e);
    return m;
  }, [evidence]);

  // Portable CreditReports: id -> attestation provenance, so evidence that
  // traces to a ported credit report can be badged as cross-border.
  const portableByReport = useMemo(() => {
    const m = {};
    for (const r of credit_reports) {
      if (r.raw_data?.portable) {
        m[r.id] = {
          origin_application_id: r.raw_data.origin_application_id,
          origin_provider: r.raw_data.origin_provider,
          attestation_hash: r.raw_data.attestation_hash,
        };
      }
    }
    return m;
  }, [credit_reports]);

  const signalsByCategory = useMemo(() => {
    const m = {};
    for (const s of risk_signals) (m[s.category] ||= []).push(s);
    return m;
  }, [risk_signals]);

  const selectedEvidence = selectedSignal ? (evidenceBySignal[selectedSignal.id] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Lineage column */}
      <div className="lg:col-span-7 space-y-5">
        <LineagePath decision={decision} recommendation={recommendation} signal={selectedSignal} evidenceCount={selectedEvidence.length} />

        <Layer label="Decision" icon={Scale}>
          {decision ? <DecisionCard decision={decision} /> : <Empty msg="No decision recorded yet. Run underwriting to produce one." />}
        </Layer>

        <Connector />

        <Layer label="AI recommendation" icon={Brain} hint="Advisory only — never overrides policy">
          {recommendation ? <RecommendationCard recommendation={recommendation} /> : <Empty msg="No AI recommendation generated." />}
        </Layer>

        <Connector />

        <Layer label="Policy evaluation" icon={Scale}>
          {policy?.policy ? <PolicyCard policy={policy.policy} outcome={decision?.policy_outcome} /> : <Empty msg="No policy outcome attached." />}
        </Layer>

        <Connector />

        <Layer label="Risk signals" icon={Activity} hint={`${risk_signals.length} signal${risk_signals.length === 1 ? "" : "s"} · click to trace evidence`}>
          {risk_signals.length === 0 ? (
            <Empty msg="No risk signals. Run analysis first." />
          ) : (
            <div className="space-y-4">
              {Object.entries(signalsByCategory).map(([cat, sigs]) => {
                const meta = CATEGORY_META[cat] || { label: cat, color: "text-slate-700 bg-slate-50 border-slate-200" };
                return (
                  <div key={cat}>
                    <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border ${meta.color} mb-2`}>
                      {meta.label} · {sigs.length}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sigs.map((s) => (
                        <SignalChip
                          key={s.id}
                          signal={s}
                          active={selectedSignal?.id === s.id}
                          onClick={() => setSelectedSignal(selectedSignal?.id === s.id ? null : s)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Layer>
      </div>

      {/* Evidence rail */}
      <div className="lg:col-span-5">
        <div className="sticky top-20 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">Evidence chain</h3>
            </div>
            {selectedSignal && (
              <button onClick={() => setSelectedSignal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!selectedSignal ? (
            <div className="p-6 text-sm text-slate-500">
              Select a risk signal to trace it back to the source record and field it was derived from. Every decision in UnderwriteOS is auditable to its evidence.
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900">{selectedSignal.signal}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${FLAG_META[selectedSignal.flag]?.cls}`}>
                    {FLAG_META[selectedSignal.flag]?.label || selectedSignal.flag}
                  </span>
                </div>
                {selectedSignal.explanation && (
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{selectedSignal.explanation}</p>
                )}
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <Stat label="Value" value={fmt(selectedSignal.value, selectedSignal.value_type)} />
                  <Stat label="Severity" value={selectedSignal.severity || "—"} />
                  <Stat label="Direction" value={selectedSignal.direction || "—"} />
                  <Stat label="Threshold" value={fmt(selectedSignal.threshold, selectedSignal.value_type)} />
                  <Stat label="Confidence" value={`${Math.round((selectedSignal.confidence || 0) * 100)}%`} />
                  <Stat label="Source" value={SOURCE_LABEL[selectedSignal.source] || selectedSignal.source || "—"} />
                </div>
              </div>

              {selectedEvidence.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No evidence records linked to this signal.</div>
              ) : (
                selectedEvidence.map((e, i) => (
                  <EvidenceCard key={i} ev={e} portable={portableByReport[e.source_id]} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LineagePath({ decision, recommendation, signal, evidenceCount }) {
  const steps = [
    { label: "Decision", on: !!decision },
    { label: "Recommendation", on: !!recommendation },
    { label: "Signal", on: !!signal },
    { label: "Evidence", on: evidenceCount > 0 },
    { label: "Source", on: evidenceCount > 0 },
  ];
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <span className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border ${s.on ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-400"}`}>
            <CircleDot className="w-3 h-3" />
            {s.label}
          </span>
          {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Layer({ label, icon: Icon, hint, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h3>
        {hint && <span className="text-[11px] text-slate-400">· {hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Connector() {
  return <div className="ml-3 w-px h-4 bg-slate-200" />;
}

function DecisionCard({ decision }) {
  const meta = DECISION_META[decision.decision] || DECISION_META.REVIEW;
  const Icon = meta.Icon;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-lg border ${meta.cls}`}>
            <Icon className="w-4 h-4" />
            {decision.decision}
          </span>
          <span className="text-xs text-slate-500">via {decision.decision_source?.replace(/_/g, " ")}</span>
        </div>
        {decision.human_review_required && (
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Human review</span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="Risk score" value={decision.risk_score != null ? Number(decision.risk_score).toFixed(2) : "—"} />
        <Stat label="PD" value={decision.probability_of_default != null ? `${(decision.probability_of_default * 100).toFixed(1)}%` : "—"} />
        <Stat label="Confidence" value={decision.confidence != null ? `${Math.round(decision.confidence * 100)}%` : "—"} />
      </div>
      {decision.override_reason && (
        <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          <span className="font-medium">Override reason: </span>{decision.override_reason}
        </div>
      )}
      {decision.reasons?.length > 0 && (
        <ul className="mt-3 space-y-1">
          {decision.reasons.map((r, i) => (
            <li key={i} className="text-xs text-slate-600 flex gap-1.5"><span className="text-slate-300">•</span>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">{recommendation.recommendation}</span>
        <span className="text-[11px] text-slate-500">conf {Math.round((recommendation.confidence || 0) * 100)}%</span>
      </div>
      {recommendation.ai_memo && (
        <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-4">{recommendation.ai_memo}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
        {recommendation.positive_signals?.slice(0, 3).map((p, i) => (
          <span key={`p${i}`} className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">+ {p}</span>
        ))}
        {recommendation.risk_factors?.slice(0, 3).map((p, i) => (
          <span key={`r${i}`} className="text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">− {p}</span>
        ))}
      </div>
    </div>
  );
}

function PolicyCard({ policy, outcome }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">{policy.name}</span>
        <span className="text-[11px] font-mono text-slate-500">{policy.policy_id} · v{policy.version}</span>
      </div>
      <div className="mt-2 text-[11px] text-slate-500">{policy.rules?.length || 0} rules</div>
      {outcome && (
        <pre className="mt-2 text-[11px] font-mono text-slate-600 bg-slate-50 border border-slate-100 rounded p-2 overflow-x-auto max-h-32">{JSON.stringify(outcome, null, 2)}</pre>
      )}
    </div>
  );
}

function SignalChip({ signal, active, onClick }) {
  const flag = FLAG_META[signal.flag] || FLAG_META.neutral;
  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-lg border p-2.5 transition-colors ${active ? "border-teal-400 bg-teal-50 ring-1 ring-teal-200" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-800 truncate">{signal.signal}</span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${flag.cls}`}>{flag.label}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-mono">{fmt(signal.value, signal.value_type)}</span>
        <span>sev {signal.severity || "—"}</span>
      </div>
    </button>
  );
}

function EvidenceCard({ ev, portable }) {
  return (
    <div className={`rounded-lg border bg-white p-3 ${portable ? "border-teal-300 ring-1 ring-teal-100" : "border-slate-200"}`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Link2 className="w-3.5 h-3.5 text-teal-600" />
        <span className="text-xs font-semibold text-slate-800">{SOURCE_LABEL[ev.source_type] || ev.source_type}</span>
        {ev.source_provider && <span className="text-[10px] font-mono text-slate-400">{ev.source_provider}</span>}
        {portable && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
            <Globe2 className="w-3 h-3" /> Portable · attested
          </span>
        )}
      </div>
      {portable && (
        <div className="mb-2 text-[11px] text-teal-700 bg-teal-50/60 border border-teal-100 rounded px-2 py-1.5">
          Ported from <span className="font-mono">{String(portable.origin_application_id).slice(-8)}</span> · provider {portable.origin_provider}
          <div className="font-mono text-[10px] text-teal-600 mt-0.5 break-all">attestation {portable.attestation_hash?.slice(0, 16)}…</div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <Stat label="Field" value={ev.field || "—"} />
        <Stat label="Calculation" value={ev.calculation_method || "—"} />
        <Stat label="Value" value={fmt(ev.value, ev.value_type)} />
        <Stat label="Confidence" value={`${Math.round((ev.confidence || 0) * 100)}%`} />
        {ev.source_location && <Stat label="Location" value={ev.source_location} />}
        {ev.source_id && <Stat label="Source ref" value={String(ev.source_id).slice(-10)} />}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="font-mono text-slate-700 break-all">{value}</div>
    </div>
  );
}

function Empty({ msg }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-400">{msg}</div>;
}