import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Plus, ArrowRight, CheckCircle2, Clock, Activity, ClipboardCheck, FileText } from "lucide-react";
import { AppStatusBadge, DecisionBadge } from "@/components/application/StatusBadge";

const PRIORITY = { underwriting: 0, data_collection: 1, analyzing: 2, draft: 3, failed: 4, completed: 5 };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiDashboard", { action: "overview" });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);

  const a = data?.applications || {};
  const recentApps = data?.applications?.recent || [];
  const queue = [...recentApps].sort((x, y) => (PRIORITY[x.status] ?? 9) - (PRIORITY[y.status] ?? 9));

  const queues = [
    { label: "Needs attention", value: (a.draft || 0) + (a.failed || 0), icon: AlertTriangle, color: "rose", to: "/applications" },
    { label: "Ready for review", value: a.underwriting || 0, icon: ClipboardCheck, color: "violet", to: "/applications" },
    { label: "Waiting for information", value: a.data_collection || 0, icon: Clock, color: "sky", to: "/applications" },
    { label: "In analysis", value: a.analyzing || 0, icon: Activity, color: "indigo", to: "/applications" },
    { label: "Decided today", value: data?.decisions?.decided_today || 0, icon: CheckCircle2, color: "emerald", to: "/decisions" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Your underwriting work queue.</p>
          </div>
          <Link
            to="/applications/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors"
          >
            <Plus className="w-4 h-4" /> New Application
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading dashboard…</span>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Work queues */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {queues.map((q) => (
                <Link key={q.label} to={q.to} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${QUEUE_COLORS[q.color]}`}>
                      <q.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold tabular-nums">{q.value.toLocaleString()}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">{q.label}</div>
                </Link>
              ))}
            </div>

            {/* Application queue */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900">Application queue</h3>
                </div>
                <Link to="/applications" className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {queue.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No applications yet. <Link to="/applications/new" className="text-[#0d9488] font-medium">Create one</Link>.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {queue.map((app) => (
                    <Link key={app.id} to={`/applications/${app.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900">{app.application_number || app.id.slice(-8)}</div>
                        <div className="text-[11px] text-slate-400">{fmtMoney(app.loan_amount, app.loan_currency)} · {app.created_at ? new Date(app.created_at).toLocaleDateString() : ""}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <AppStatusBadge status={app.status} />
                        <DecisionBadge decision={app.decision} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent decisions */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Recent decisions</h3>
                <Link to="/decisions" className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {(data?.decisions?.recent || []).length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No decisions yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(data?.decisions?.recent || []).slice(0, 6).map((d) => (
                    <Link key={d.id} to={`/applications/${d.application_id}`} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <DecisionBadge decision={d.decision} />
                        <span className="text-[11px] text-slate-400">{d.policy_id} v{d.policy_version}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{d.decision_timestamp ? new Date(d.decision_timestamp).toLocaleDateString() : ""}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const QUEUE_COLORS = {
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100",
  sky: "bg-sky-50 text-sky-600 border-sky-100",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
};