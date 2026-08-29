import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Download, TrendingUp, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line } from "recharts";
import MarketBreakdown from "@/components/reports/MarketBreakdown";

export default function Reports() {
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
      setError(e?.response?.data?.error?.message || e.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalDecisions = data?.decisions?.total || 0;
  const approved = data?.decisions?.APPROVE || 0;
  const reviewCount = data?.decisions?.REVIEW || 0;
  const declined = data?.decisions?.DECLINE || 0;
  const approvalRate = totalDecisions > 0 ? Math.round((approved / totalDecisions) * 100) : 0;
  const declineRate = totalDecisions > 0 ? Math.round((declined / totalDecisions) * 100) : 0;
  const reviewRate = totalDecisions > 0 ? Math.round((reviewCount / totalDecisions) * 100) : 0;

  const decisionData = [
    { name: "Approved", count: approved, fill: "#059669" },
    { name: "Review", count: reviewCount, fill: "#d97706" },
    { name: "Declined", count: declined, fill: "#dc2626" },
  ];

  const dailyData = (data?.requests?.daily || []).slice(-14);

  const exportCsv = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Applications received", data?.applications?.total || 0],
      ["Applications completed", data?.applications?.completed || 0],
      ["Total decisions", totalDecisions],
      ["Approved", approved],
      ["Review", reviewCount],
      ["Declined", declined],
      ["Approval rate", `${approvalRate}%`],
      ["Review rate", `${reviewRate}%`],
      ["Decline rate", `${declineRate}%`],
    ];
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `underwriteos-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Underwriting performance and decision analytics.</p>
          </div>
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
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
            <span className="text-sm text-slate-500">Loading reports…</span>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={FileText} label="Applications" value={data?.applications?.total || 0} sub={`${data?.applications?.completed || 0} completed`} color="sky" />
              <StatCard icon={CheckCircle2} label="Approval rate" value={`${approvalRate}%`} sub={`${approved} approved`} color="emerald" />
              <StatCard icon={Clock} label="Review rate" value={`${reviewRate}%`} sub={`${reviewCount} in review`} color="amber" />
              <StatCard icon={XCircle} label="Decline rate" value={`${declineRate}%`} sub={`${declined} declined`} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Decision breakdown */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Decision breakdown</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={decisionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {decisionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity trend */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity (last 14 days)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(d) => d.slice(5)} interval={2} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <MarketBreakdown />

            {/* Application status breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Application status breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "New", value: data?.applications?.draft || 0 },
                  { label: "Data collection", value: data?.applications?.data_collection || 0 },
                  { label: "Analyzing", value: data?.applications?.analyzing || 0 },
                  { label: "Underwriting", value: data?.applications?.underwriting || 0 },
                  { label: "Completed", value: data?.applications?.completed || 0 },
                  { label: "Failed", value: data?.applications?.failed || 0 },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-slate-200 p-3 text-center">
                    <div className="text-xl font-semibold tabular-nums">{s.value}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
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
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}