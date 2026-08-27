import React from "react";
import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { POLICY_REQUIRED_DOCS } from "./ApplicationFormSection";

export default function NeedsAttentionPanel({ documents, policyId, decision, onNavigate }) {
  const items = [];

  // Missing required documents
  const required = (POLICY_REQUIRED_DOCS[policyId] || POLICY_REQUIRED_DOCS["consumer-v1"]).filter((r) => r.required);
  const present = new Set(documents.map((d) => d.document_type));
  required.forEach((r) => {
    if (!present.has(r.type)) items.push({ type: "warning", text: `${r.label} missing`, target: "Documents" });
  });

  // Policy failures
  const triggered = decision?.policy_outcome?.triggered_rules || [];
  triggered.forEach((r) => items.push({ type: "warning", text: r.reason, target: "Policy" }));

  // Document processing issues
  documents.forEach((d) => {
    if (d.issues?.length) d.issues.forEach((i) => items.push({ type: "warning", text: i, target: "Documents" }));
    if (d.status === "needs_review") items.push({ type: "warning", text: `${d.file_name || d.document_type} needs review`, target: "Documents" });
  });

  // Positive confirmations
  documents.filter((d) => d.status === "verified").forEach((d) => {
    items.push({ type: "success", text: `${d.file_name || d.document_type} verified`, target: "Documents" });
  });

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Needs your attention</h3>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onNavigate?.(item.target)}
            className="w-full flex items-center gap-2 text-sm text-left rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors"
          >
            {item.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span className={`flex-1 ${item.type === "warning" ? "text-amber-700" : "text-emerald-700"}`}>{item.text}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}