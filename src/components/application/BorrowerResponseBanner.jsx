import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, CheckCircle2, FileText, Loader2, ChevronRight } from "lucide-react";

// Prominent banner shown on the application detail page when the borrower has
// responded to an information request via the portal (status "received") but
// the lender hasn't resolved it yet. Surfaces what was received and lets the
// lender jump to the documents or mark the request resolved.
export default function BorrowerResponseBanner({ applicationId, onReview, onResolved }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.InformationRequest.filter({ application_id: applicationId, status: "received" }, "-created_date", 50);
      setRequests(list);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (r) => {
    setResolving(r.id);
    try {
      await base44.entities.InformationRequest.update(r.id, { status: "resolved", resolved_at: new Date().toISOString() });
      await load();
      onResolved?.();
    } finally {
      setResolving(null);
    }
  };

  if (loading || requests.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0 ring-1 ring-teal-200">
          <Bell className="w-4 h-4 text-teal-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Borrower responded</h3>
            <span className="text-[10px] font-medium text-teal-700 bg-teal-100 border border-teal-200 rounded px-1.5 py-0.5">{requests.length} new</span>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">The borrower uploaded documents through the portal. Review them and resolve the request.</p>

          <div className="mt-2.5 space-y-1.5">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg border border-teal-100 bg-white/70 px-3 py-2">
                <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="text-[13px] font-medium text-slate-800 flex-1 truncate">{r.item}</span>
                <button
                  onClick={() => resolve(r)}
                  disabled={resolving === r.id}
                  className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 hover:bg-emerald-100 disabled:opacity-50"
                >
                  {resolving === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Resolve
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onReview}
            className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-teal-700 hover:text-teal-800"
          >
            Review documents <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}