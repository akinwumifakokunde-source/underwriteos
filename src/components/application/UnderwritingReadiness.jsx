import React from "react";
import { computeReadiness, READINESS_STYLES } from "@/lib/riskDimensions";
import { getDocumentRequirements } from "@/lib/jurisdictions";

export default function UnderwritingReadiness({ documents, app, fp, cp, decision, onNavigate, autoIngested }) {
  const readiness = computeReadiness({
    documents,
    policyId: app?.policy_id,
    fp, cp, decision,
    borrowerType: app?.borrower_type,
    market: app?.market,
    autoIngested,
  });

  const required = getDocumentRequirements(app?.market, app?.policy_id, app?.borrower_type);
  const missingDocs = autoIngested ? [] : required.filter((r) => r.required && !documents.some((d) => d.document_type === r.type && (d.status === "verified" || d.status === "processed")));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Underwriting readiness</h3>
        <span className={`text-2xl font-bold ${readiness.decisionReady ? "text-emerald-600" : "text-slate-900"}`}>{readiness.readiness}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div className={`h-full rounded-full transition-all ${readiness.decisionReady ? "bg-emerald-500" : "bg-teal-500"}`} style={{ width: `${readiness.readiness}%` }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {readiness.checks.map((c, i) => {
          const style = READINESS_STYLES[c.status] || READINESS_STYLES.pending;
          return (
            <div key={i} className="flex items-center gap-2 text-[13px]">
              <span className={style.cls}>{style.icon}</span>
              <span className="text-slate-600">{c.label}</span>
              <span className="text-slate-400 ml-auto text-[12px]">{c.detail}</span>
            </div>
          );
        })}
      </div>
      {!readiness.decisionReady && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[13px] text-amber-800">
          {missingDocs.length > 0 && (
            <div className="mb-1">
              <span className="font-medium">Required before final decision:</span>{" "}
              {missingDocs.map((d) => d.label).join(", ")}
            </div>
          )}
          {readiness.blockingItems.length > 0 && missingDocs.length === 0 && (
            <div>
              <span className="font-medium">Required before final decision:</span>{" "}
              {readiness.blockingItems.join(", ")}
            </div>
          )}
          {onNavigate && (
            <button onClick={() => onNavigate("Documents")} className="mt-1.5 text-[12px] font-medium text-amber-900 hover:underline">
              Upload documents →
            </button>
          )}
        </div>
      )}
      {readiness.decisionReady && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-[13px] text-emerald-800">
          <span className="font-medium">Ready for decision.</span> All required information has been received and assessed.
        </div>
      )}
    </div>
  );
}