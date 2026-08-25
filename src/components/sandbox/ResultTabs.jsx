import React, { useState } from "react";
import ResultSummary from "./ResultSummary.jsx";
import FinancialProfileCard from "./FinancialProfileCard.jsx";
import CreditProfileCard from "./CreditProfileCard.jsx";
import RiskSignalsCard from "./RiskSignalsCard.jsx";
import EvidenceExplorer from "./EvidenceExplorer.jsx";
import PolicyEngineCard from "./PolicyEngineCard.jsx";
import RecommendationDecision from "./RecommendationDecision.jsx";
import AuditCard from "./AuditCard.jsx";
import WebhookSimulator from "./WebhookSimulator.jsx";
import Diagnostics from "./Diagnostics.jsx";
import SandboxFlow from "./SandboxFlow.jsx";
import StepPanel from "./StepPanel.jsx";
import JsonView from "./JsonView.jsx";

const TABS = ["Overview", "Financial Profile", "Credit Profile", "Risk Signals", "Evidence", "Policy", "Recommendation", "Decision", "API", "Audit", "Webhooks"];

export default function ResultTabs({ results, steps, selectedStep, selected, onSelectStep, ctxId, diagnostics, webhook }) {
  const [tab, setTab] = useState("Overview");
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap gap-1.5 mb-5 border-b border-slate-100 pb-3">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {tab === "Overview" && (
          <>
            <ResultSummary decision={results.decision} />
            <Diagnostics {...diagnostics} />
            <RecommendationDecision recommendation={results.recommendation} decision={results.decision} />
          </>
        )}
        {tab === "Financial Profile" && <FinancialProfileCard profile={results.financialProfile} />}
        {tab === "Credit Profile" && <CreditProfileCard profile={results.creditProfile} />}
        {tab === "Risk Signals" && <RiskSignalsCard signals={results.riskSignals} />}
        {tab === "Evidence" && <EvidenceExplorer signals={results.riskSignals} evidence={results.evidence} />}
        {tab === "Policy" && <PolicyEngineCard decision={results.decision} />}
        {tab === "Recommendation" && <RecommendationDecision recommendation={results.recommendation} decision={results.decision} />}
        {tab === "Decision" && <DecisionDetail decision={results.decision} />}
        {tab === "API" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <SandboxFlow steps={steps} selected={selected} onSelect={onSelectStep} ctxId={ctxId} />
            </div>
            <div className="lg:col-span-7">
              <StepPanel step={selectedStep} ctxId={ctxId} />
            </div>
          </div>
        )}
        {tab === "Audit" && <AuditCard events={results.audit} />}
        {tab === "Webhooks" && <WebhookSimulator event={webhook} />}
      </div>
    </div>
  );
}

function DecisionDetail({ decision }) {
  if (!decision) return null;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Final decision</h3>
        <div className="grid grid-cols-2 gap-x-4">
          <Row label="Decision" value={decision.decision} />
          <Row label="Decision source" value={decision.decision_source} />
          <Row label="Decided by" value={decision.decided_by ? String(decision.decided_by).slice(-8) : "—"} />
          <Row label="Policy" value={`${decision.policy_id} v${decision.policy_version}`} />
          <Row label="Risk score" value={decision.risk_score != null ? decision.risk_score.toFixed(2) : "—"} />
          <Row label="Probability of default" value={decision.probability_of_default != null ? decision.probability_of_default.toFixed(3) : "—"} />
          <Row label="Confidence" value={decision.confidence != null ? decision.confidence.toFixed(2) : "—"} />
          <Row label="Human review" value={decision.human_review_required ? "Required" : "Not required"} />
        </div>
        {decision.override_reason && <p className="mt-3 text-xs text-amber-600">Override: {decision.override_reason}</p>}
      </div>
      {decision.policy_outcome && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Policy outcome</div>
          <JsonView data={decision.policy_outcome} maxHeight="280px" />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-mono font-medium text-slate-800">{value ?? "—"}</span>
    </div>
  );
}