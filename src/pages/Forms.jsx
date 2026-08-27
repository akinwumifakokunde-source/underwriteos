import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Plus, Link2, Copy, Check, Pencil, Pause, Play, Trash2, FileText, Inbox } from "lucide-react";

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("apiForms", { action: "list" });
      setForms(res.data?.forms || []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load forms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyLink = (slug) => {
    const url = `${window.location.origin}/apply/${slug}`;
    navigator.clipboard?.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleStatus = async (form) => {
    const next = form.status === "active" ? "paused" : "active";
    try {
      await base44.functions.invoke("apiForms", { action: "update", form_id: form.id, status: next });
      setForms((prev) => prev.map((f) => (f.id === form.id ? { ...f, status: next } : f)));
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message);
    }
  };

  const remove = async (form) => {
    if (!confirm(`Delete "${form.name}"? This removes the form and its share link.`)) return;
    try {
      await base44.functions.invoke("apiForms", { action: "delete", form_id: form.id });
      setForms((prev) => prev.filter((f) => f.id !== form.id));
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Application Forms</h1>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Create white-label application forms and share a link with borrowers. Each submission creates an
              application in <span className="font-medium text-slate-700">data collection</span> status, ready for underwriting.
            </p>
          </div>
          <Link
            to="/forms/new"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> New form
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading forms…</span>
          </div>
        ) : forms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900">No forms yet</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Create your first borrower application form, configure the fields you want to collect, then share the link.
            </p>
            <Link to="/forms/new" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
              <Plus className="w-4 h-4" /> Create form
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {forms.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/forms/${f.id}/edit`} className="text-sm font-semibold text-slate-900 hover:underline truncate">
                      {f.name}
                    </Link>
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                    <span>{f.submissions_count || 0} submission{(f.submissions_count || 0) === 1 ? "" : "s"}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono truncate">{window.location.origin}/apply/{f.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyLink(f.slug)}
                    title="Copy share link"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {copied === f.slug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === f.slug ? "Copied" : "Copy link"}
                  </button>
                  <Link
                    to={`/forms/${f.id}/submissions`}
                    title="View submissions"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    Submissions
                  </Link>
                  <Link to={`/forms/${f.id}/edit`} title="Edit" className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button onClick={() => toggleStatus(f)} title={f.status === "active" ? "Pause" : "Activate"} className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100 transition-colors">
                    {f.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(f)} title="Delete" className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paused: "bg-amber-50 text-amber-700 border-amber-200",
    archived: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const label = status === "active" ? "Live" : status === "paused" ? "Paused" : "Archived";
  return <span className={`text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded border ${map[status] || map.archived}`}>{label}</span>;
}