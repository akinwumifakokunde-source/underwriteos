import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import QuickLinks from "@/components/dashboard/QuickLinks.jsx";
import { Loader2, AlertTriangle, Activity, KeyRound, CheckCircle2, XCircle, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DECISION_STYLES = {
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  DECLINE: "bg-rose-50 text-rose-700 border-rose-200"
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

  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase() }).format(n || 0);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Your underwriting API at a glance.</p>
        </div>

        <div className="mb-4">
          <QuickLinks />
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
          <div className="space-y-4">
            {/* Five questions row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-emerald-600" /></div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">API status</div>
                </div>
                <div className="text-lg font-semibold text-emerald-700">Operational</div>
                <div className="text-xs text-slate-400 mt-0.5 capitalize">{data.environment} environment</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center"><KeyRound className="w-4 h-4 text-slate-600" /></div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active key</div>
                </div>
                {data.active_keys.length === 0 ? (
                  <div className="text-sm text-slate-400">No active keys</div>
                ) : (
                  <div className="text-sm font-mono text-slate-900">{data.active_keys[0].prefix}••••</div>
                )}
                <div className="text-xs text-slate-400 mt-0.5">{data.active_keys.length} active key{data.active_keys.length === 1 ? "" : "s"}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center"><Activity className="w-4 h-4 text-sky-600" /></div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Requests (30d)</div>
                </div>
                <div className="text-lg font-semibold tabular-nums">{data.requests.last_30_days.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-0.5">{data.requests.total.toLocaleString()} all-time</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center"><Zap className="w-4 h-4 text-violet-600" /></div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Decisions</div>
                </div>
                <div className="text-lg font-semibold tabular-nums">{data.decisions.total.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-0.5">{data.applications.completed} runs completed</div>
              </div>
            </div>

            {/* Requests chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Requests per day</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.requests.daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(d) => d.slice(5)} interval={4} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#dashGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent underwriting runs */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Recent underwriting runs</h3>
                  <Link to="/sandbox" className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">Run new <ArrowRight className="w-3 h-3" /></Link>
                </div>
                {data.applications.recent.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">No applications yet. Run the sandbox to see your first underwriting.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.applications.recent.map((a) => (
                      <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{a.application_number || a.id.slice(-8)}</div>
                          <div className="text-[11px] text-slate-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ""} · {fmtMoney(a.loan_amount, a.loan_currency)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{a.status}</span>
                          {a.decision && a.decision !== "null" && (
                            <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DECISION_STYLES[a.decision] || ""}`}>{a.decision}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent decisions */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Recent decisions</h3>
                  <Link to="/usage" className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">View logs <ArrowRight className="w-3 h-3" /></Link>
                </div>
                {data.decisions.recent.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">No decisions yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.decisions.recent.map((d) => (
                      <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{d.decision}</div>
                          <div className="text-[11px] text-slate-400">{d.policy_id} v{d.policy_version} · {d.decision_timestamp ? new Date(d.decision_timestamp).toLocaleString() : ""}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {typeof d.risk_score === "number" && <span className="text-xs font-medium tabular-nums text-slate-600">risk {d.risk_score}</span>}
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{d.decision_source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Decision breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Decision breakdown</h3>
              <div className="grid grid-cols-3 gap-3">
                {["APPROVE", "REVIEW", "DECLINE"].map((d) => (
                  <div key={d} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      {d === "APPROVE" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : d === "DECLINE" ? <XCircle className="w-4 h-4 text-rose-600" /> : <Activity className="w-4 h-4 text-amber-600" />}
                      <span className="text-xs font-medium text-slate-500">{d}</span>
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">{data.decisions[d].toLocaleString()}</div>
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