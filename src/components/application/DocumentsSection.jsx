import React from "react";
import { CheckCircle2, AlertTriangle, Upload, FileText } from "lucide-react";
import DocumentUploader from "./DocumentUploader";
import DocumentCard from "./DocumentCard";
import ExtractedField from "./ExtractedField";
import { POLICY_REQUIRED_DOCS } from "./ApplicationFormSection";

export default function DocumentsSection({
  documents, policyId, onUpload, uploading, onReprocess, onDelete, onView, processingDocId
}) {
  const required = POLICY_REQUIRED_DOCS[policyId] || POLICY_REQUIRED_DOCS["consumer-v1"];
  const docTypesPresent = new Set(documents.map((d) => d.document_type));
  const requiredMet = required.filter((r) => r.required && docTypesPresent.has(r.type)).length;
  const requiredTotal = required.filter((r) => r.required).length;
  const completeness = requiredTotal > 0 ? Math.round((requiredMet / requiredTotal) * 100) : 0;

  const allExtracted = [];
  documents.forEach((d) => {
    if (d.extracted_data?.fields) {
      d.extracted_data.fields.forEach((f) => allExtracted.push({ ...f, docName: d.file_name }));
    }
  });

  return (
    <div className="space-y-5">
      {/* Completeness */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Application completeness</h3>
          <span className={`text-2xl font-bold ${completeness === 100 ? "text-emerald-600" : completeness >= 66 ? "text-amber-600" : "text-slate-400"}`}>{completeness}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all ${completeness === 100 ? "bg-emerald-500" : "bg-teal-500"}`} style={{ width: `${completeness}%` }} />
        </div>
        <div className="space-y-1.5">
          {required.map((r) => {
            const present = docTypesPresent.has(r.type);
            return (
              <div key={r.type} className="flex items-center gap-2 text-sm">
                {present ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : r.required ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                )}
                <span className={present ? "text-slate-700" : r.required ? "text-amber-700" : "text-slate-400"}>
                  {r.label}{r.required ? "" : " (optional)"}
                </span>
                {!present && r.required && (
                  <span className="text-[11px] text-slate-400 ml-auto">Required by {policyId}</span>
                )}
              </div>
            );
          })}
        </div>
        {documents.length > 0 && (
          <p className="text-[12px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            UnderwriteOS found {documents.length} document{documents.length !== 1 ? "s" : ""} and extracted {allExtracted.length} financial field{allExtracted.length !== 1 ? "s" : ""}.
          </p>
        )}
      </div>

      {/* Upload */}
      <DocumentUploader onUpload={onUpload} uploading={uploading} />

      {/* Document cards */}
      {documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard
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

      {/* Extracted fields */}
      {allExtracted.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Extracted information</h3>
          <p className="text-[12px] text-slate-400 mb-3">Every field is linked to its source document. Click "View evidence" to trace any value.</p>
          <div>
            {allExtracted.map((f, i) => (
              <ExtractedField key={i} field={f} />
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && !uploading && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No documents uploaded yet.</p>
          <p className="text-[12px] text-slate-400 mt-1">Upload bank statements, payslips, or credit reports to get started.</p>
        </div>
      )}
    </div>
  );
}