import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import { Loader2, Search, ShieldCheck, FileText, AlertCircle, CheckCircle2, Clock, ArrowRight, Lock } from "lucide-react";

const DECISION_STYLES = {
  APPROVE: { label: "Approved", icon: CheckCircle2, tint: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  REVIEW: { label: "In review", icon: Clock, tint: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  DECLINE: { label: "Declined", icon: AlertCircle, tint: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
};

function fmtMoney(n, c) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);
  } catch {
    return String(n || 0);
  }
}

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function BorrowerStatus() {
  const { applicationNumber } = useParams();
  const [appNo, setAppNo] = useState(applicationNumber || "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const lookup = async (e) => {
    e?.preventDefault();
    if (!appNo.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await base44.functions.invoke("apiBorrowerStatus", {
        action: "lookup",
        application_number: appNo.trim(),
        email: email.trim(),
      });
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || "We couldn't find your application. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationNumber) {
      // Pre-filled from a deep link — focus email
      const el = document.getElementById("portal-email");
      if (el) el.focus();
    }
  }, [applicationNumber]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/"><Logo size={26} /></Link>
          <Link to="/" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Back to home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-10">
        {!data && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Check your application status</h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Enter your application number and the email you applied with to see where things stand.
              </p>
            </div>

            <form onSubmit={lookup} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label htmlFor="portal-appno" className="block text-[12px] font-medium text-slate-700 mb-1.5">Application number</label>
                  <input
                    id="portal-appno"
                    type="text"
                    value={appNo}
                    onChange={(e) => setAppNo(e.target.value)}
                    placeholder="APP-XXXXXX"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="portal-email" className="block text-[12px] font-medium text-slate-700 mb-1.5">Email address</label>
                  <input
                    id="portal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !appNo.trim() || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2.5 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {loading ? "Checking…" : "Check status"}
                </button>
              </div>
              {error && (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-rose-700">{error}</p>
                </div>
              )}
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3 h-3" /> Your details are used only to verify your identity.
              </p>
            </form>
          </div>
        )}

        {data && (
          <div className="space-y-5">
            {/* Status header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] text-slate-400">Application</p>
                  <p className="font-mono text-sm text-slate-900">{data.application.application_number}</p>
                  <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                    Hi {data.borrower.first_name},
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Your application is currently <span className="font-medium text-slate-900">{data.application.status_label}</span>.
                  </p>
                </div>
                {data.decision && (
                  (() => {
                    const s = DECISION_STYLES[data.decision.decision] || DECISION_STYLES.REVIEW;
                    const Icon = s.icon;
                    return (
                      <div className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium ${s.bg} ${s.border} ${s.tint}`}>
                        <Icon className="w-3.5 h-3.5" /> {s.label}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Loan summary */}
              <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-slate-100">
                <div>
                  <p className="text-[11px] text-slate-400">Loan amount</p>
                  <p className="text-sm font-semibold text-slate-900">{fmtMoney(data.application.loan_amount, data.application.loan_currency)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Term</p>
                  <p className="text-sm font-semibold text-slate-900">{data.application.loan_term_months} months</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Submitted</p>
                  <p className="text-sm font-semibold text-slate-900">{timeAgo(data.application.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Adverse action notice link for declines */}
            {data.decision?.decision === "DECLINE" && data.notice_token && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 flex items-start gap-3">
                <FileText className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-rose-900">Your adverse-action notice is ready</p>
                  <p className="text-[13px] text-rose-700 mt-0.5">This explains the reasons for the decision, as required by regulation.</p>
                </div>
                <Link to={`/notice/${data.notice_token}`} className="shrink-0 inline-flex items-center gap-1 text-[13px] font-medium text-rose-700 hover:text-rose-900">
                  View notice <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-5">Progress</h2>
              <ol className="relative">
                {data.timeline.map((t, i) => (
                  <li key={i} className="flex gap-3 pb-6 last:pb-0 relative">
                    {i < data.timeline.length - 1 && (
                      <span className={`absolute left-[11px] top-6 bottom-0 w-px ${t.done ? "bg-teal-300" : "bg-slate-200"}`} />
                    )}
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${t.done ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {t.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-current" />}
                    </span>
                    <div className="pt-0.5">
                      <p className={`text-sm ${t.done ? "font-medium text-slate-900" : "text-slate-400"}`}>{t.step}</p>
                      {t.at && <p className="text-[11px] text-slate-400 mt-0.5">{new Date(t.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Information requests */}
            {data.open_information_requests.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> We need a little more from you
                </h2>
                <p className="text-[13px] text-slate-500 mb-4">Your lender has requested the following to continue your application.</p>
                <ul className="space-y-2">
                  {data.open_information_requests.map((r, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-white border border-amber-100 px-3.5 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{r.item}</p>
                        {r.note && <p className="text-[12px] text-slate-500 mt-0.5">{r.note}</p>}
                      </div>
                      <span className="shrink-0 text-[11px] text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">{r.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documents */}
            {data.documents.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Your documents</h2>
                <ul className="divide-y divide-slate-100">
                  {data.documents.map((d, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-900 truncate">{d.label}</p>
                          {d.file_name && <p className="text-[11px] text-slate-400 truncate">{d.file_name}</p>}
                        </div>
                      </div>
                      <span className={`shrink-0 text-[11px] font-medium rounded-full px-2 py-0.5 ${
                        d.status === "Verified" ? "bg-emerald-50 text-emerald-700" :
                        d.status === "Received" || d.status === "Processing" ? "bg-blue-50 text-blue-700" :
                        d.status === "Needs review" || d.status === "Issue" ? "bg-amber-50 text-amber-700" :
                        "bg-slate-50 text-slate-600"
                      }`}>{d.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => { setData(null); setError(null); }}
                className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
              >
                Check another application
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-3xl mx-auto px-5 sm:px-6 py-8 text-center">
        <p className="text-[11px] text-slate-400">Powered by CreditDecide</p>
      </footer>
    </div>
  );
}