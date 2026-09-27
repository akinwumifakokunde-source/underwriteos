import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, ShieldAlert, Activity, DollarSign, Target, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, Legend, PieChart, Pie } from "recharts";

const MARKET_LABELS = { GB: "United Kingdom", US: "United States", NG: "Nigeria", ZA: "South Africa", KE: "Kenya", GH: "Ghana", OT: "Other" };
const DECISION_COLORS = { APPROVE: "#059669", REVIEW: "#d97706", DECLINE: "#dc2626" };

export default function PortfolioRisk() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiPortfolioRisk", { action: "overview" });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load portfolio risk data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const s = data?.summary || {};
  const fmtMoney = (v) => v != null ? `${(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—";
  const fmtPct = (v) => v != null ? `${(v * 100).toFixed(1)}%` : "—";

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio Risk</h1>
          <p className="text-sm text-slate-500 mt-1">Risk distribution, decision trends, default analysis, and concentration alerts across your lending portfolio.</p>
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
            <span className="text-sm text-slate-500">Loading portfolio risk…</span>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Concentration alerts */}
            {data.alerts.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-900">Concentration alerts ({data.alerts.length})</h3>
                </div>
                <div className="space-y-1.5">
                  {data.alerts.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-[13px]">
                      <AlertCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${a.level === "high" ? "text-rose-500" : "text-amber-500"}`} />
                      <span className="text-amber-800">{a.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Activity} label="Total decisions" value={s.total_decisions || 0} color="sky" />
              <StatCard icon={DollarSign} label="Total exposure" value={fmtMoney(s.total_exposure)} sub={`${s.total_approved || 0} approved`} color="emerald" />
              <StatCard icon={Target} label="Avg risk score" value={(s.avg_risk_score || 0).toFixed(2)} sub={`Avg PD: ${fmtPct(s.avg_pd)}`} color="amber" />
              <StatCard icon={s.observed_default_rate > (s.avg_pd || 0) ? TrendingDown : TrendingUp} label="Observed default rate" value={fmtPct(s.observed_default_rate)} sub={`${s.observed_outcomes || 0} outcomes`} color={s.observed_default_rate > (s.avg_pd || 0) ? "rose" : "emerald"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Risk score distribution */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Risk score distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.risk_distribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.risk_distribution.map((entry, i) => {
                          const colors = ["#059669", "#84cc16", "#d97706", "#ea580c", "#dc2626"];
                          return <Cell key={i} fill={colors[i]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Decision trend */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Decision trend (12 months)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.decision_trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={1} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="approve" stroke={DECISION_COLORS.APPROVE} strokeWidth={2} dot={false} name="Approve" />
                      <Line type="monotone" dataKey="review" stroke={DECISION_COLORS.REVIEW} strokeWidth={2} dot={false} name="Review" />
                      <Line type="monotone" dataKey="decline" stroke={DECISION_COLORS.DECLINE} strokeWidth={2} dot={false} name="Decline" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Default rate by segment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SegmentTable title="Default rate by market" data={data.default_by_segment.market} labelFn={(s) => MARKET_LABELS[s.segment] || s.segment} />
              <SegmentTable title="Default rate by borrower type" data={data.default_by_segment.borrower_type} labelFn={(s) => s.segment?.replace(/_/g, " ") || "—"} />
              <SegmentTable title="Default rate by risk band" data={data.default_by_segment.risk_band} labelFn={(s) => s.segment} />
            </div>

            {/* Concentration: exposure by market */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Exposure by market</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.concentration.exposure_by_market.map((m) => ({ ...m, name: MARKET_LABELS[m.market] || m.market }))} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={90} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => fmtMoney(v)} />
                      <Bar dataKey="exposure" radius={[0, 4, 4, 0]} fill="#0d9488" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top borrowers by exposure */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Top borrowers by exposure</h3>
                <div className="space-y-2">
                  {data.concentration.top_borrowers.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No approved loans yet.</p>
                  ) : data.concentration.top_borrowers.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 w-5 shrink-0">{i + 1}</span>
                      <span className="text-[13px] text-slate-700 flex-1 truncate">{b.name}</span>
                      <span className="text-[12px] font-mono text-slate-600 shrink-0">{fmtMoney(b.exposure)}</span>
                      <span className={`text-[11px] font-mono shrink-0 w-12 text-right ${b.pct_of_portfolio > 0.1 ? "text-rose-600 font-semibold" : "text-slate-400"}`}>
                        {fmtPct(b.pct_of_portfolio)}
                      </span>
                    </div>
                  ))}
                </div>
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
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function SegmentTable({ title, data, labelFn }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">No outcome data yet.</p>
      ) : (
        <div className="space-y-1.5">
          {data.map((row, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] py-1 border-b border-slate-50 last:border-0">
              <span className="text-slate-600 flex-1 capitalize truncate">{labelFn(row)}</span>
              <span className="text-slate-400 font-mono shrink-0">{row.defaults}/{row.total}</span>
              <span className={`font-mono font-semibold shrink-0 w-14 text-right ${row.default_rate > 0.1 ? "text-rose-600" : row.default_rate > 0.05 ? "text-amber-600" : "text-emerald-600"}`}>
                {(row.default_rate * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}