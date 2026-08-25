import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Activity, Loader2, AlertTriangle, BarChart3, List } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Usage() {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, lg] = await Promise.all([
        base44.functions.invoke("apiUsage", { action: "overview" }),
        base44.functions.invoke("apiUsage", { action: "logs", limit: 100 })
      ]);
      setOverview(ov.data);
      setLogs(lg.data?.logs || []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load usage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
          <p className="text-sm text-slate-500 mt-1">API activity for your organization over the last 30 days.</p>
        </div>

        <div className="mb-5 inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "logs", label: "Logs", icon: List }
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
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
            <span className="text-sm text-slate-500">Loading usage…</span>
          </div>
        ) : tab === "overview" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total requests</div>
                <div className="text-2xl font-semibold mt-1">{overview?.total ?? 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Last 30 days</div>
                <div className="text-2xl font-semibold mt-1">{(overview?.daily || []).reduce((a, b) => a + b.count, 0)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Distinct endpoints</div>
                <div className="text-2xl font-semibold mt-1">{(overview?.by_endpoint || []).length}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Requests per day</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview?.daily || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(d) => d.slice(5)} interval={4} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#usageGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Top endpoints</h3>
                {(overview?.by_endpoint || []).length === 0 ? (
                  <p className="text-xs text-slate-400">No data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {overview.by_endpoint.map((e) => (
                      <div key={e.endpoint} className="flex items-center justify-between text-sm">
                        <code className="font-mono text-xs text-slate-600 truncate">{e.endpoint}</code>
                        <span className="text-xs font-medium text-slate-900 ml-3">{e.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Top events</h3>
                {(overview?.by_event || []).length === 0 ? (
                  <p className="text-xs text-slate-400">No data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {overview.by_event.map((e) => (
                      <div key={e.event} className="flex items-center justify-between text-sm">
                        <code className="font-mono text-xs text-slate-600 truncate">{e.event}</code>
                        <span className="text-xs font-medium text-slate-900 ml-3">{e.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-10 text-center">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">No activity yet.</p>
                <p className="text-xs text-slate-400 mt-1">API requests will appear here as you use the platform.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-2.5 font-semibold">Time</th>
                      <th className="px-4 py-2.5 font-semibold">Event</th>
                      <th className="px-4 py-2.5 font-semibold">Endpoint</th>
                      <th className="px-4 py-2.5 font-semibold">Actor</th>
                      <th className="px-4 py-2.5 font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{l.created_at ? new Date(l.created_at).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2.5"><code className="font-mono text-xs text-slate-700">{l.event}</code></td>
                        <td className="px-4 py-2.5"><code className="font-mono text-xs text-slate-500">{l.endpoint || "—"}</code></td>
                        <td className="px-4 py-2.5 text-xs text-slate-600">{l.actor || "—"}</td>
                        <td className="px-4 py-2.5"><span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{l.actor_type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}