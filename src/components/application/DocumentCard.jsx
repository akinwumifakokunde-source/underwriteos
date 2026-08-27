import React from "react";
import { CheckCircle2, AlertTriangle, Loader2, FileWarning, FileText, RotateCcw, Trash2, Eye } from "lucide-react";

const TYPE_LABELS = {
  bank_statement: "Bank Statement",
  payslip: "Payslip",
  credit_report: "Credit Report",
  tax: "Tax Document",
  identity: "Identity",
  employment: "Employment",
  financial_statement: "Financial Statement",
  proof_of_address: "Proof of Address",
  other_financial: "Financial Document",
  other: "Document",
};

const STATUS_CONFIG = {
  uploaded: { label: "Uploaded", icon: FileText, cls: "text-slate-500 bg-slate-50 border-slate-200" },
  processing: { label: "Processing", icon: Loader2, cls: "text-indigo-600 bg-indigo-50 border-indigo-200", spin: true },
  processed: { label: "Processed", icon: CheckCircle2, cls: "text-slate-600 bg-slate-50 border-slate-200" },
  verified: { label: "Verified", icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  needs_review: { label: "Needs Review", icon: FileWarning, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  failed: { label: "Failed", icon: AlertTriangle, cls: "text-rose-700 bg-rose-50 border-rose-200" },
};

export default function DocumentCard({ doc, onView, onReprocess, onDelete, processing }) {
  const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.uploaded;
  const SIcon = status.icon;
  const isProcessing = processing || doc.status === "processing";
  const extracted = doc.extracted_data?.fields || [];
  const steps = doc.extracted_data?.processing_steps || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-slate-900 truncate">{doc.file_name || "Untitled"}</h4>
            <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${status.cls}`}>
              <SIcon className={`w-3 h-3 inline mr-1 ${status.spin ? "animate-spin" : ""}`} />
              {status.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{TYPE_LABELS[doc.document_type] || doc.document_type}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {doc.file_url && (
            <button onClick={() => onView?.(doc)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" title="View">
              <Eye className="w-4 h-4" />
            </button>
          )}
          {doc.status === "verified" && (
            <button onClick={() => onReprocess?.(doc)} disabled={isProcessing} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40" title="Reprocess">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete?.(doc)} disabled={isProcessing} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Processing steps */}
      {isProcessing && steps.length > 0 && (
        <div className="mt-3 space-y-1">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-slate-600">{s.step}{s.detail ? ` · ${s.detail}` : ""}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[12px]">
            <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            <span className="text-slate-500">Processing…</span>
          </div>
        </div>
      )}

      {/* Completed processing info */}
      {doc.status === "verified" && !isProcessing && (
        <div className="mt-3 flex items-center gap-4 text-[12px]">
          {doc.confidence != null && (
            <span className="text-slate-500">
              Confidence: <span className={`font-medium ${doc.confidence >= 0.85 ? "text-emerald-600" : "text-amber-600"}`}>{Math.round(doc.confidence * 100)}%</span>
            </span>
          )}
          {doc.extracted_fields_count > 0 && (
            <span className="text-slate-500">{doc.extracted_fields_count} fields extracted</span>
          )}
          {doc.issues?.length > 0 && (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {doc.issues.length} issue{doc.issues.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Needs review */}
      {doc.status === "needs_review" && !isProcessing && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[12px] text-amber-700">
          {doc.issues?.[0] || "Low confidence extraction — review recommended."}
        </div>
      )}

      {/* Failed */}
      {doc.status === "failed" && !isProcessing && (
        <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-[12px] text-rose-700">
          {doc.issues?.[0] || "Processing failed."}
        </div>
      )}

      {/* Extracted fields preview */}
      {extracted.length > 0 && !isProcessing && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-1.5">
            {extracted.slice(0, 4).map((f, i) => (
              <div key={i} className="text-[12px]">
                <span className="text-slate-400">{f.label}:</span>{" "}
                <span className="font-medium text-slate-700">{formatValue(f.value)}</span>
              </div>
            ))}
            {extracted.length > 4 && (
              <div className="text-[12px] text-teal-600">+{extracted.length - 4} more</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatValue(v) {
  if (typeof v === "number") {
    if (v > 1000) return v.toLocaleString();
    if (v < 1 && v > 0) return `${Math.round(v * 100)}%`;
    return String(v);
  }
  return String(v);
}