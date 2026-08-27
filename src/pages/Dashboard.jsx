import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Plus, ArrowRight, CheckCircle2, XCircle, Clock, TrendingUp, Activity, Users, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const DECISION_STYLES = {
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  DECLINE: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_STYLES = {
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  data_collection: "bg-sky-50 text-sky-700 border-sky-200",
  analyzing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  underwriting: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABELS = {
  draft: "NEW",
  data_collection: "DATA COLLECTION",
  analyzing: "ANALYZING",
  underwriting: "UNDERWRITING",
  completed: "COMPLETED",
  failed: "FAILED",
};

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

  const totalApps = data?.applications?.total || 0;
  const completed = data?.applications?.completed || 0;
  const totalDecisions = data?.decisions?.total || 0;
  const approved = data?.decisions?.APPROVE || 0;
  const reviewCount = data?.decisions?.REVIEW || 0;
  const declined = data?.decisions?.DECLINE || 0;
  const approvalRate = totalDecisions > 0 ? Math.round((approved / totalDecisions) * 100) : 0;
  const reviewRate = totalDecisions > 0 ? Math.round((reviewCount / totalDecisions) * 100) : 0;

  const riskData = [
    { name: "Low", count: approved, fill: "#059669" },
    { name: "Medium", count: reviewCount, fill: "#d97706" },
    { name: "High", count: declined, fill: "#dc2626" },
  ];

  const recentApps = data?.applications?.recent || [];
  const reviewApps = recentApps.filter((a) => a.decision === "REVIEW" || a.status === "underwriting");

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Your underwriting pipeline at a glance.</p>
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
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={FileText} label="Applications received" value={totalApps} sub={`${completed} completed`} color="sky" />
              <StatCard icon={Clock} label="Awaiting review" value={reviewCount} sub={`${reviewRate}% review rate`} color="amber" />
              <StatCard icon={CheckCircle2} label="Approved" value={approved} sub={`${approvalRate}% approval rate`} color="emerald" />
              <StatCard icon={XCircle} label="Declined" value={declined} sub={`${totalDecisions > 0 ? Math.round((declined / totalDecisions) * 100) : 0}% decline rate`} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Risk distribution */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Risk distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Applications requiring attention */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Applications requiring your attention</h3>
                  </div>
                  <Link to="/applications" className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {reviewApps.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No applications need review right now.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reviewApps.slice(0, 5).map((a) => (
                      <Link key={a.id} to={`/applications/${a.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{a.application_number || a.id.slice(-8)}</div>
                          <div className="text-[11px] text-slate-400">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ""} · {fmtMoney(a.loan_amount, a.loan_currency)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${STATUS_STYLES[a.status] || STATUS_STYLES.draft}`}>{STATUS_LABELS[a.status] || a.status}</span>
                          {a.decision && a.decision !== "null" && (
                            <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DECISION_STYLES[a.decision] || ""}`}>{a.decision}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Recent applications</h3>
                  <Link to="/applications" className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {recentApps.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No applications yet. <Link to="/applications/new" className="text-[#0d9488] font-medium">Create one</Link>.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentApps.slice(0, 6).map((a) => (
                      <Link key={a.id} to={`/applications/${a.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{a.application_number || a.id.slice(-8)}</div>
                          <div className="text-[11px] text-slate-400">{fmtMoney(a.loan_amount, a.loan_currency)} · {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${STATUS_STYLES[a.status] || STATUS_STYLES.draft}`}>{STATUS_LABELS[a.status] || a.status}</span>
                          {a.decision && a.decision !== "null" && (
                            <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DECISION_STYLES[a.decision] || ""}`}>{a.decision}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

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
                        <div>
                          <div className="text-sm font-medium text-slate-900">{d.decision}</div>
                          <div className="text-[11px] text-slate-400">{d.policy_id} v{d.policy_version} · {d.decision_timestamp ? new Date(d.decision_timestamp).toLocaleDateString() : ""}</div>
                        </div>
                        {typeof d.risk_score === "number" && <span className="text-xs font-medium tabular-nums text-slate-600">risk {d.risk_score}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}