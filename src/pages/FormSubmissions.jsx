import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, ArrowLeft, Inbox, FileText, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/jurisdictions";

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-600",
  data_collection: "bg-blue-50 text-blue-700",
  analyzing: "bg-amber-50 text-amber-700",
  underwriting: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
};

const DECISION_STYLES = {
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  DECLINE: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function labelStatus(s) {
  return (s || "draft").replace(/_/g, " ");
}

export default function FormSubmissions() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("apiForms", { action: "submissions", form_id: formId });
      setForm(res.data?.form || null);
      setSubmissions(res.data?.submissions || []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/forms" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to forms
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {form ? form.name : "Submissions"}
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              {form ? (
                <>Every submission through this form creates an application in <span className="font-medium text-slate-700">data collection</span> status. Open any submission to continue underwriting.</>
              ) : "Loading form…"}
            </p>
          </div>
          {form && (
            <div className="shrink-0 text-right">
              <div className="text-2xl font-semibold tabular-nums">{submissions.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">submissions</div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading submissions…</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900">No submissions yet</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Share the form link with borrowers. Submissions will appear here and create applications automatically.
            </p>
            {form && (
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
                {window.location.origin}/apply/{form.slug}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f8fa] border-b border-slate-200">
                <tr>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Borrower</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3 hidden sm:table-cell">App #</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3 hidden md:table-cell">Market</th>
                  <th className="text-right font-medium text-slate-500 px-4 py-3">Loan</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Status</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3 hidden sm:table-cell">Submitted</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((s) => (
                  <tr key={s.application_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {s.borrower ? `${s.borrower.first_name} ${s.borrower.last_name}` : "Unknown borrower"}
                      </div>
                      {s.borrower?.email && (
                        <div className="text-[11px] text-slate-400 truncate">{s.borrower.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-slate-600 hidden sm:table-cell">{s.application_number}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{s.market}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatCurrency(s.loan_amount, s.loan_currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${STATUS_STYLES[s.status] || STATUS_STYLES.draft}`}>
                        {labelStatus(s.status)}
                      </span>
                      {s.decision && s.decision !== "null" && (
                        <span className={`ml-1 inline-block text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded border ${DECISION_STYLES[s.decision]}`}>
                          {s.decision}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-slate-500 hidden sm:table-cell">{formatDate(s.created_date)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/applications/${s.application_id}`} title="Open application" className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && form && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-3.5 h-3.5" />
            Submissions are stored as applications. Each row links to the full application workspace.
          </div>
        )}
      </div>
    </div>
  );
}