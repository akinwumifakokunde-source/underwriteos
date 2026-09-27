import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, X, Play, Inbox, FileText } from "lucide-react";
import FormCreatePanel from "@/components/applications/FormCreatePanel";

export default function NewApplicationModal({ open, onClose, apps, borrowers }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [runningId, setRunningId] = useState(null);
  const [error, setError] = useState(null);

  const pending = useMemo(
    () => apps.filter((a) => (a.status === "draft" || a.status === "data_collection") && (!a.decision || a.decision === "null")),
    [apps]
  );

  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);

  // Readiness gate: documents must be received, classified and extracted
  // (or a financial/credit profile must already exist from a data-source pull)
  // before the end-to-end underwriting pipeline is allowed to run. Incomplete
  // applications open on the Documents tab so the underwriter can see pending
  // files and chase the borrower for follow-up.
  const runUnderwriting = async (a) => {
    setRunningId(a.id);
    setError(null);
    try {
      const [docRes, sumRes] = await Promise.all([
        base44.functions.invoke("apiDocuments", { action: "list", application_id: a.id }),
        base44.functions.invoke("apiRetrieve", { action: "summary", application_id: a.id }),
      ]);
      const docs = docRes.data?.documents || [];
      const s = sumRes.data || {};
      const hasDocs = docs.length > 0;
      const allProcessed = hasDocs && docs.every((d) => ["processed", "verified"].includes(d.status));
      const allExtracted = hasDocs && docs.every((d) => d.extracted_data?.fields?.length > 0);
      const hasProfiles = !!(s.financial_profile || s.credit_profile);
      const ready = (hasDocs && allProcessed && allExtracted) || hasProfiles;

      if (!ready) {
        onClose();
        navigate(`/applications/${a.id}?tab=Documents`);
        return;
      }

      await base44.functions.invoke("apiAnalyze", { application_id: a.id });
      await base44.functions.invoke("apiUnderwrite", { application_id: a.id, policy_id: a.policy_id || "consumer-v1" });
      onClose();
      navigate(`/applications/${a.id}`);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Underwriting failed.");
      setRunningId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mt-8 mb-8 rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">New application</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Underwrite a pending application, or create an intake form that feeds pending applications.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4">
          <button
            onClick={() => { setTab("pending"); setError(null); }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === "pending" ? "bg-[#0a0c12] text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Play className="w-3.5 h-3.5" /> Pending ({pending.length})
          </button>
          <button
            onClick={() => { setTab("form"); setError(null); }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === "form" ? "bg-[#0a0c12] text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <FileText className="w-3.5 h-3.5" /> Create form
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Pending list */}
        {tab === "pending" && (
          <div className="px-6 py-4">
            {pending.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900">No pending applications</h3>
                <p className="mt-1 text-[13px] text-slate-500 max-w-sm mx-auto">
                  All applications have been underwritten. Switch to "Create form" to set up an intake form for new borrowers.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
                {pending.map((a) => {
                  const b = borrowers[a.borrower_id];
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {b ? `${b.first_name} ${b.last_name}` : "Unknown borrower"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{a.application_number || a.id.slice(-8)}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-slate-700 tabular-nums">{fmtMoney(a.loan_amount, a.loan_currency)}</div>
                        <div className="text-[11px] text-slate-400">{a.market}</div>
                      </div>
                      <button
                        onClick={() => runUnderwriting(a)}
                        disabled={runningId === a.id}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white bg-[#0a0c12] px-3 py-2 rounded-md hover:bg-[#1c1f26] disabled:opacity-60 transition-colors shrink-0"
                      >
                        {runningId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        Run underwriting
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create intake form — submissions become pending applications */}
        {tab === "form" && <FormCreatePanel onClose={onClose} />}
      </div>
    </div>
  );
}