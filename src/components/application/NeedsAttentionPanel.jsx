import React from "react";
import { AlertTriangle, ChevronRight, Upload, FileSearch, MessageSquare } from "lucide-react";
import { getDocumentRequirements } from "@/lib/jurisdictions";

export default function NeedsAttentionPanel({ documents, app, decision, onNavigate }) {
  const required = getDocumentRequirements(app?.market, app?.policy_id, app?.borrower_type);
  const docsByType = {};
  documents.forEach((d) => {
    if (!docsByType[d.document_type]) docsByType[d.document_type] = [];
    docsByType[d.document_type].push(d);
  });

  const blocking = [];
  const actionRequired = [];
  const optional = [];

  // Missing required documents → BLOCKING
  required.filter((r) => r.required).forEach((r) => {
    const docs = docsByType[r.type] || [];
    const verified = docs.some((d) => d.status === "verified" || d.status === "processed");
    if (!verified) {
      blocking.push({
        text: `${r.label} missing`,
        detail: docs.length > 0 ? "Uploaded but not yet verified" : "Required before final decision",
        action: "Upload",
        target: "Documents",
      });
    }
  });

  // Documents needing review → ACTION REQUIRED
  documents.forEach((d) => {
    if (d.status === "needs_review") {
      actionRequired.push({
        text: `${d.file_name || d.document_type} needs review`,
        detail: d.issues?.[0] || "Extraction issues detected",
        action: "Review",
        target: "Documents",
      });
    }
    if (d.status === "failed") {
      actionRequired.push({
        text: `${d.file_name || d.document_type} failed to process`,
        detail: d.issues?.[0] || "Try re-uploading",
        action: "Resolve",
        target: "Documents",
      });
    }
  });

  // Income not verified → ACTION REQUIRED
  const hasPayslip = docsByType["payslip"]?.length > 0;
  if (!hasPayslip) {
    actionRequired.push({
      text: "Income not verified",
      detail: "Upload payslip or connect banking data",
      action: "Upload",
      target: "Documents",
    });
  }

  // Policy failures → BLOCKING or ACTION REQUIRED
  const triggered = decision?.policy_outcome?.triggered_rules || [];
  triggered.forEach((r) => {
    if (r.decision === "DECLINE") {
      blocking.push({ text: r.reason || "Policy rule triggered", detail: "Decline rule", action: "Review", target: "Policy" });
    } else if (r.decision === "REVIEW") {
      actionRequired.push({ text: r.reason || "Policy review triggered", detail: "Requires manual review", action: "Review", target: "Decision" });
    }
  });

  // Optional documents
  required.filter((r) => !r.required).forEach((r) => {
    if (!docsByType[r.type]) {
      optional.push({
        text: r.label,
        detail: "Supporting information",
        action: "Upload",
        target: "Documents",
      });
    }
  });

  const groups = [
    { label: "BLOCKING", desc: "Required before final decision", items: blocking, cls: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
    { label: "ACTION REQUIRED", desc: "Materially improves assessment", items: actionRequired, cls: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "OPTIONAL", desc: "Supporting information", items: optional, cls: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
  ].filter((g) => g.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Needs your attention</h3>
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${g.cls}`}>{g.label}</span>
              <span className="text-[11px] text-slate-400">{g.desc}</span>
            </div>
            <div className="space-y-1.5">
              {g.items.map((item, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${g.bg} ${g.border}`}>
                  <AlertTriangle className={`w-4 h-4 ${g.cls} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${g.cls}`}>{item.text}</div>
                    {item.detail && <div className="text-[11px] text-slate-500">{item.detail}</div>}
                  </div>
                  <button
                    onClick={() => onNavigate?.(item.target)}
                    className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50"
                  >
                    {item.action}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}