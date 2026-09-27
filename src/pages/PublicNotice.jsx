import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, ShieldCheck, FileText, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function PublicNotice() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    base44.functions.invoke("apiAdverseActionDeliver", { action: "get_notice", share_token: token })
      .then((res) => setData(res.data))
      .catch((e) => setError(e?.response?.data?.error?.message || e.message || "Failed to load notice."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-500">Loading your notice…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-xl border border-rose-200 bg-white p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-slate-900 mb-1">Notice unavailable</h1>
          <p className="text-sm text-slate-500">{error}</p>
          <p className="text-[12px] text-slate-400 mt-3">If you believe this is an error, please contact your lender directly.</p>
        </div>
      </div>
    );
  }

  const { notice, decision, application, borrower } = data;
  const borrowerName = borrower ? `${borrower.first_name || ""} ${borrower.last_name || ""}`.trim() : "Applicant";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0a0c12] border-b border-white/5">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Logo size={28} tone="dark" />
          <div className="text-[11px] text-[#a0a4ab]">Regulatory Notice</div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        {/* Meta */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 font-medium">{notice.framework}</span>
          {decision?.decision === "DECLINE" ? (
            <span className="rounded-md bg-rose-50 text-rose-700 px-2 py-0.5">Application declined</span>
          ) : (
            <span className="rounded-md bg-amber-50 text-amber-700 px-2 py-0.5">Approved with conditions</span>
          )}
        </div>

        {/* Notice body */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Notice of Adverse Action</h1>
              <p className="text-[12px] text-slate-400">Delivered via CreditDecide · Evidence-backed audit trail</p>
            </div>
          </div>

          <div className="space-y-1">
            {notice.lines.map((ln, i) => {
              if (ln.kind === "sp") return <div key={i} className="h-3" />;
              if (ln.kind === "h") return <h2 key={i} className="text-base font-semibold text-slate-900 mt-4 mb-2">{ln.text}</h2>;
              if (ln.kind === "li") return <p key={i} className="text-[13px] text-slate-600 pl-4 leading-relaxed">• {ln.text}</p>;
              if (ln.kind === "m") return <p key={i} className="text-[11px] text-slate-400">{ln.text}</p>;
              return <p key={i} className="text-[13px] text-slate-600 leading-relaxed">{ln.text}</p>;
            })}
          </div>

          {/* Application reference */}
          {application && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Application reference</div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div><span className="text-slate-400">Reference:</span> <span className="font-mono text-slate-700">{application.application_number || "—"}</span></div>
                <div><span className="text-slate-400">Market:</span> <span className="text-slate-700">{application.market}</span></div>
                {application.loan_amount != null && (
                  <div><span className="text-slate-400">Amount:</span> <span className="font-mono text-slate-700">{application.loan_currency} {Number(application.loan_amount).toLocaleString()}</span></div>
                )}
                <div><span className="text-slate-400">Product:</span> <span className="text-slate-700 capitalize">{(application.product_type || "credit").replace(/_/g, " ")}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-start gap-1.5 text-[11px] text-slate-400">
          <FileText className="w-3 h-3 shrink-0 mt-0.5" />
          <span>This notice was generated automatically by CreditDecide on {new Date(notice.generated_at || decision?.decision_timestamp).toLocaleString()} and is retained in the decision audit trail. The information in this notice is specific to the application referenced above.</span>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to CreditDecide
          </Link>
        </div>
      </div>
    </div>
  );
}