import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import PortalUploader from "@/components/borrower/PortalUploader";
import PortalAssistant from "@/components/borrower/PortalAssistant";
import PortalEndToEndExplainer from "@/components/borrower/PortalEndToEndExplainer";
import {
  Loader2, Search, ShieldCheck, FileText, AlertCircle, CheckCircle2, Clock,
  ArrowRight, Lock, UploadCloud, X, MessageSquare,
} from "lucide-react";

const DECISION_STYLES = {
  APPROVE: { label: "Approved", icon: CheckCircle2, tint: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  REVIEW: { label: "In review", icon: Clock, tint: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  DECLINE: { label: "Declined", icon: AlertCircle, tint: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
};

const DOC_TYPE_OPTIONS = [
  { value: "bank_statement", label: "Bank statement" },
  { value: "payslip", label: "Payslip" },
  { value: "identity", label: "Identity document" },
  { value: "proof_of_address", label: "Proof of address" },
  { value: "credit_report", label: "Credit report" },
  { value: "tax", label: "Tax document" },
  { value: "employment", label: "Employment proof" },
  { value: "other", label: "Other document" },
];

function inferDocType(item) {
  const s = (item || "").toLowerCase();
  if (s.includes("credit")) return "credit_report";
  if (s.includes("bank")) return "bank_statement";
  if (s.includes("payslip") || s.includes("pay slip") || s.includes("salary")) return "payslip";
  if (s.includes("identity") || s.includes("passport") || s.includes("licence") || s.includes("license") || s.includes(" id")) return "identity";
  if (s.includes("address")) return "proof_of_address";
  if (s.includes("tax")) return "tax";
  if (s.includes("employ")) return "employment";
  return "other";
}

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

export default function BorrowerPortal() {
  const { applicationNumber } = useParams();
  const [appNo, setAppNo] = useState(applicationNumber || "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [generalType, setGeneralType] = useState("bank_statement");
  const [uploadNotice, setUploadNotice] = useState(null);

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

  const refresh = async () => {
    try {
      const res = await base44.functions.invoke("apiBorrowerStatus", {
        action: "lookup",
        application_number: appNo.trim(),
        email: email.trim(),
      });
      setData(res.data);
    } catch {}
  };

  const handleUpload = async (file, documentType, informationRequestId, key) => {
    setUploadingKey(key);
    setUploadError(null);
    setUploadNotice(null);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const res = await base44.functions.invoke("apiBorrowerStatus", {
        action: "submit_document",
        application_number: appNo.trim(),
        email: email.trim(),
        document_type: documentType,
        file_url: file_uri,
        file_name: file.name,
        information_request_id: informationRequestId || null,
      });
      const d = res.data || {};
      let msg = "Your document has been received";
      if (d.decision_rerun) msg += " — we've re-evaluated your application";
      else if (d.processed) msg += " and processed";
      msg += d.lender_notified ? ", and your lender has been notified." : ".";
      setUploadNotice(msg);
      await refresh();
    } catch (e) {
      setUploadError(e?.response?.data?.error?.message || e.message || "Upload failed. Please try again.");
    } finally {
      setUploadingKey(null);
    }
  };

  useEffect(() => {
    if (applicationNumber) {
      const el = document.getElementById("portal-email");
      if (el) el.focus();
    }
  }, [applicationNumber]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminApps, setAdminApps] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const me = await base44.auth.me();
          if (me?.role === "admin") {
            setIsAdmin(true);
            setAdminLoading(true);
            const apps = await base44.entities.Application.list("-created_date", 50);
            setAdminApps(apps);
            setAdminLoading(false);
            if (applicationNumber) {
              setLoading(true);
              try {
                const res = await base44.functions.invoke("apiBorrowerStatus", { action: "admin_lookup", application_number: applicationNumber });
                setData(res.data);
              } catch (e) {
                setError(e?.response?.data?.error?.message || e.message);
              } finally {
                setLoading(false);
              }
            }
          }
        }
      } catch {
        // not authenticated — borrower flow
      } finally {
        setAuthChecked(true);
      }
    })();
  }, [applicationNumber]);

  const openAsAdmin = async (appId, number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBorrowerStatus", { action: "admin_lookup", application_id: appId });
      setData(res.data);
      setAppNo(number);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Couldn't open this application.");
    } finally {
      setLoading(false);
    }
  };

  const backToAdminList = () => {
    setData(null);
    setError(null);
    setUploadError(null);
    setUploadNotice(null);
  };

  // ----- Auth check -----
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  // ----- Admin list -----
  if (isAdmin && !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
            <Link to="/"><Logo size={26} /></Link>
            <Link to="/applications" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Back to workspace</Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-5 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Borrower portals</h1>
            <p className="mt-1 text-sm text-slate-500">Open any application to see exactly what your borrower sees.</p>
          </div>
          {adminLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>
          ) : adminApps.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-sm text-slate-500">No applications yet. Once borrowers apply, their portals appear here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {adminApps.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => openAsAdmin(a.id, a.application_number)}
                    className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3.5 hover:border-teal-300 hover:shadow-sm transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] text-slate-900">{a.application_number || "—"}</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">
                        {a.loan_currency ? fmtMoney(a.loan_amount, a.loan_currency) : "—"} · {a.status}
                      </p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-[13px] font-medium text-teal-700">
                      Open portal <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[13px] text-rose-700">{error}</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ----- Lookup gate -----
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
            <Link to="/"><Logo size={26} /></Link>
            <Link to="/" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Back to home</Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-5 sm:px-6 py-10">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Your loan portal</h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Enter your application number and the email you applied with to see your progress, finish any next steps, and message your team.
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
                  {loading ? "Checking…" : "Open my portal"}
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
        </main>
      </div>
    );
  }

  // ----- Portal view -----
  const decisionStyle = data.decision ? (DECISION_STYLES[data.decision.decision] || DECISION_STYLES.REVIEW) : null;
  const DecisionIcon = decisionStyle?.icon;
  const openTodos = data.open_information_requests || [];
  const todoCount = openTodos.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/"><Logo size={26} /></Link>
          <button
            onClick={isAdmin ? backToAdminList : () => { setData(null); setError(null); setUploadError(null); }}
            className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
          >
            {isAdmin ? "Back to list" : "Check another application"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: status + to-dos + documents (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Greeting + status header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] text-slate-400">Application</p>
                  <p className="font-mono text-sm text-slate-900">{data.application.application_number}</p>
                  <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                    Hi {data.borrower.first_name}, here's where things stand.
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Your application is currently <span className="font-medium text-slate-900">{data.application.status_label}</span>.
                  </p>
                </div>
                {decisionStyle && DecisionIcon && (
                  <div className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium ${decisionStyle.bg} ${decisionStyle.border} ${decisionStyle.tint}`}>
                    <DecisionIcon className="w-3.5 h-3.5" /> {decisionStyle.label}
                  </div>
                )}
              </div>
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

            {uploadNotice && (
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-teal-900 flex-1">{uploadNotice}</p>
                <button onClick={() => setUploadNotice(null)} className="text-teal-600 hover:text-teal-800 shrink-0"><X className="w-4 h-4" /></button>
              </div>
            )}

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

            {/* Stages timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-5">Your progress</h2>
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

            {/* To-dos */}
            {todoCount > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> What to do next
                  <span className="ml-1 text-[12px] font-normal text-amber-700">{todoCount} {todoCount === 1 ? "thing" : "things"} left</span>
                </h2>
                <p className="text-[13px] text-slate-500 mb-4">Your lender needs the following to continue your application. Upload a file against each item.</p>
                <ul className="space-y-3">
                  {openTodos.map((r, i) => (
                    <li key={r.id || i} className="rounded-lg bg-white border border-amber-100 px-3.5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{r.item}</p>
                          {r.note && <p className="text-[12px] text-slate-500 mt-0.5">{r.note}</p>}
                        </div>
                        <span className="shrink-0 text-[11px] text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">{r.status}</span>
                      </div>
                      {!isAdmin && (
                        <div className="mt-2.5">
                          <PortalUploader
                            uploading={uploadingKey === `ir-${r.id || i}`}
                            onUpload={(f) => handleUpload(f, inferDocType(r.item), r.id, `ir-${r.id || i}`)}
                          />
                        </div>
                      )}
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

            {/* General upload */}
            {data.application.status !== "completed" && !isAdmin && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-teal-600" /> Upload a document
                </h2>
                <p className="text-[13px] text-slate-500 mb-4">Add any supporting document for your application.</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <select
                    value={generalType}
                    onChange={(e) => setGeneralType(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 sm:w-auto"
                  >
                    {DOC_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <PortalUploader
                    uploading={uploadingKey === "general"}
                    onUpload={(f) => handleUpload(f, generalType, null, "general")}
                    label="Choose file"
                  />
                </div>
              </div>
            )}

            {uploadError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[13px] text-rose-700">{uploadError}</p>
              </div>
            )}
          </div>

          {/* Right: assistant (1 col, sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                <MessageSquare className="w-3.5 h-3.5" /> Message your team
              </div>
              <div className="h-[560px]">
                {isAdmin ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 h-full flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Borrower chat preview</p>
                    <p className="text-[12px] text-slate-500 mt-1 max-w-[220px]">Your borrower sees a 24/7 assistant here that answers status questions and flags anything that needs you.</p>
                  </div>
                ) : (
                  <PortalAssistant applicationNumber={appNo.trim()} email={email.trim()} />
                )}
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6">
            <PortalEndToEndExplainer />
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[11px] text-slate-400">Powered by CreditDecide — the borrower-facing mirror of your underwriting workspace.</p>
        {isAdmin ? (
          <Link to="/applications" className="text-[11px] font-medium text-teal-700 hover:text-teal-900">Open lender workspace →</Link>
        ) : (
          <Link to="/" className="text-[11px] text-slate-400 hover:text-slate-600">Back to home</Link>
        )}
      </footer>
    </div>
  );
}