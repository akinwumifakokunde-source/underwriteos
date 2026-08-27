import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { POLICY_REQUIRED_DOCS } from "./ApplicationFormSection";

export default function NeedsAttentionPanel({ documents, policyId, decision }) {
  const items = [];

  // Missing required documents
  const required = (POLICY_REQUIRED_DOCS[policyId] || POLICY_REQUIRED_DOCS["consumer-v1"]).filter((r) => r.required);
  const present = new Set(documents.map((d) => d.document_type));
  required.forEach((r) => {
    if (!present.has(r.type)) items.push({ type: "warning", text: `${r.label} missing` });
  });

  // Policy failures
  const triggered = decision?.policy_outcome?.triggered_rules || [];
  triggered.forEach((r) => items.push({ type: "warning", text: r.reason }));

  // Document processing issues
  documents.forEach((d) => {
    if (d.issues?.length) d.issues.forEach((i) => items.push({ type: "warning", text: i }));
    if (d.status === "needs_review") items.push({ type: "warning", text: `${d.file_name || d.document_type} needs review` });
  });

  // Positive confirmations
  documents.filter((d) => d.status === "verified").forEach((d) => {
    items.push({ type: "success", text: `${d.file_name || d.document_type} verified` });
  });

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Needs your attention</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {item.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span className={item.type === "warning" ? "text-amber-700" : "text-emerald-700"}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}