import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, FileText, ChevronDown, ChevronRight, Loader2, FileWarning, Trash2, Eye } from "lucide-react";
import DocumentUploader from "./DocumentUploader";
import { getDocumentRequirements } from "@/lib/jurisdictions";

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
  uploaded: { label: "Uploaded", cls: "text-slate-500 bg-slate-50 border-slate-200", icon: FileText },
  processing: { label: "Processing", cls: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: Loader2, spin: true },
  processed: { label: "Processed", cls: "text-slate-600 bg-slate-50 border-slate-200", icon: CheckCircle2 },
  verified: { label: "Verified", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  needs_review: { label: "Needs review", cls: "text-amber-700 bg-amber-50 border-amber-200", icon: FileWarning },
  failed: { label: "Rejected", cls: "text-rose-700 bg-rose-50 border-rose-200", icon: AlertTriangle },
};

export default function DocumentsSection({
  documents, policyId, onUpload, uploading, onReprocess, onDelete, onView, processingDocId, market, borrowerType, autoIngested
}) {
  const required = getDocumentRequirements(market, policyId, borrowerType);
  const docsByType = {};
  documents.forEach((d) => {
    if (!docsByType[d.document_type]) docsByType[d.document_type] = [];
    docsByType[d.document_type].push(d);
  });

  const requiredMet = required.filter((r) => r.required && (docsByType[r.type] || []).some((d) => d.status === "verified" || d.status === "processed")).length;
  const requiredTotal = required.filter((r) => r.required).length;
  const completeness = requiredTotal > 0 ? Math.round((requiredMet / requiredTotal) * 100) : 0;

  // When data was auto-ingested (sample application / data source pull) and no
  // documents have been uploaded, show a clean "data collected automatically"
  // state instead of the Missing checklist + upload prompt.
  if (autoIngested && documents.length === 0) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">Data collected automatically</h3>
              <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                Credit report and bank transactions were ingested via data sources — no document uploads required for
                this application. Underwriting analysis runs on the ingested data.
              </p>
            </div>
          </div>
        </div>

        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="text-sm font-medium text-slate-700 cursor-pointer list-none flex items-center gap-1.5">
            <ChevronRight className="w-4 h-4 text-slate-400" /> Add a document manually (optional)
          </summary>
          <div className="mt-3">
            <DocumentUploader onUpload={onUpload} uploading={uploading} />
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* File completeness */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">File completeness</h3>
          <span className={`text-2xl font-bold ${completeness === 100 ? "text-emerald-600" : "text-slate-900"}`}>{completeness}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full transition-all ${completeness === 100 ? "bg-emerald-500" : "bg-teal-500"}`} style={{ width: `${completeness}%` }} />
        </div>
        <p className="text-[12px] text-slate-500">
          {completeness === 100
            ? "All required documents received. Underwriting analysis is complete."
            : `${requiredMet} of ${requiredTotal} required documents. CreditDecide can begin analysis with the available information.`}
        </p>
      </div>

      {/* Required documents checklist */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Required documents</h3>
        <div className="space-y-1">
          {required.map((r) => {
            const docs = docsByType[r.type] || [];
            const bestDoc = docs.find((d) => d.status === "verified") || docs[0];
            return <RequiredDocRow key={r.type} req={r} doc={bestDoc} docCount={docs.length} />;
          })}
        </div>
      </div>

      {/* Upload */}
      <DocumentUploader onUpload={onUpload} uploading={uploading} />

      {/* Uploaded documents */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Uploaded documents ({documents.length})</h3>
          {documents.map((doc) => (
            <DocumentChecklistCard
              key={doc.id}
              doc={doc}
              processing={processingDocId === doc.id}
              onView={onView}
              onReprocess={onReprocess}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {documents.length === 0 && !uploading && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">No documents uploaded yet</p>
          <p className="text-[12px] text-slate-400 mt-1">Upload bank statements, payslips, or credit reports. CreditDecide will extract the data and build the credit file automatically.</p>
        </div>
      )}
    </div>
  );
}

function RequiredDocRow({ req, doc, docCount }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      {doc ? (
        doc.status === "verified" || doc.status === "processed" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> :
        doc.status === "processing" ? <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" /> :
        doc.status === "needs_review" ? <FileWarning className="w-4 h-4 text-amber-500 shrink-0" /> :
        doc.status === "failed" ? <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> :
        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
      ) : req.required ? (
        <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-dashed border-slate-200 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800">{req.label}{!req.required && <span className="text-slate-400 font-normal"> (optional)</span>}</div>
        <div className="text-[11px] text-slate-400">{req.detail || "Required document"}</div>
      </div>
      <div className="shrink-0 text-right">
        {doc ? (
          <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${STATUS_CONFIG[doc.status]?.cls || ""}`}>
            {STATUS_CONFIG[doc.status]?.label || doc.status}{docCount > 1 ? ` · ${docCount}` : ""}
          </span>
        ) : req.required ? (
          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Missing</span>
        ) : (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">Optional</span>
        )}
      </div>
    </div>
  );
}

function DocumentChecklistCard({ doc, processing, onView, onReprocess, onDelete }) {
  const [showExtracted, setShowExtracted] = useState(false);
  const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.uploaded;
  const SIcon = status.icon;
  const isProcessing = processing || doc.status === "processing";
  const extracted = doc.extracted_data?.fields || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-medium text-slate-900 truncate">{doc.file_name || "Untitled"}</h4>
            <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 inline-flex items-center gap-1 ${status.cls}`}>
              <SIcon className={`w-3 h-3 ${status.spin ? "animate-spin" : ""}`} />
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
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>
          )}
          <button onClick={() => onDelete?.(doc)} disabled={isProcessing} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Extraction summary */}
      {doc.status === "verified" && !isProcessing && (
        <div className="mt-3 flex items-center gap-4 text-[12px] flex-wrap">
          {doc.confidence != null && (
            <span className="text-slate-500">Confidence: <span className={`font-medium ${doc.confidence >= 0.85 ? "text-emerald-600" : "text-amber-600"}`}>{Math.round(doc.confidence * 100)}%</span></span>
          )}
          {doc.extracted_fields_count > 0 && (
            <span className="text-slate-500">{doc.extracted_fields_count} fields extracted</span>
          )}
          {doc.issues?.length > 0 && (
            <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {doc.issues.length} issue{doc.issues.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {/* Issues */}
      {doc.issues?.length > 0 && !isProcessing && doc.status !== "verified" && (
        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[12px] text-amber-700 space-y-1">
          {doc.issues.map((issue, i) => <div key={i}>{issue}</div>)}
        </div>
      )}

      {/* Failed */}
      {doc.status === "failed" && !isProcessing && (
        <div className="mt-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-[12px] text-rose-700">
          {doc.issues?.[0] || "Processing failed. Try re-uploading the document."}
        </div>
      )}

      {/* Extracted data */}
      {extracted.length > 0 && !isProcessing && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button onClick={() => setShowExtracted(!showExtracted)} className="flex items-center gap-1.5 text-[12px] font-medium text-teal-600 hover:text-teal-700">
            {showExtracted ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            View extracted data ({extracted.length})
          </button>
          {showExtracted && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {extracted.map((f, i) => (
                <div key={i} className="text-[12px]">
                  <span className="text-slate-400">{f.label}:</span>{" "}
                  <span className="font-medium text-slate-700">{formatValue(f.value)}</span>
                  {f.confidence != null && <span className="text-teal-600 ml-1">{Math.round(f.confidence * 100)}%</span>}
                </div>
              ))}
            </div>
          )}
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