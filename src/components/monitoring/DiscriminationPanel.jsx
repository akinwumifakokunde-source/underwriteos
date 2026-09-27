import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, CartesianGrid } from "recharts";

function fmt(n, d = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(d);
}

export default function DiscriminationPanel({ data }) {
  if (!data || data.auc == null) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 text-center text-[13px] text-slate-400">
        Discrimination needs both good and bad observed outcomes. Record defaults and repays to compute AUC.
      </div>
    );
  }

  const { auc, gini, deciles, goods, bads } = data;
  const quality = auc >= 0.8 ? "Strong" : auc >= 0.7 ? "Good" : auc >= 0.6 ? "Fair" : "Weak";
  const qualityTint = auc >= 0.7 ? "text-emerald-600" : auc >= 0.6 ? "text-amber-600" : "text-rose-600";

  const chartData = deciles.map((d) => ({
    decile: `D${d.decile}`,
    bad_rate: +(d.bad_rate * 100).toFixed(1),
    avg_pd: +(d.avg_pd * 100).toFixed(1),
  }));

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-[11px] text-slate-500">AUC</div>
          <div className={`mt-0.5 text-xl font-semibold tracking-tight ${qualityTint}`}>{fmt(auc, 3)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-[11px] text-slate-500">Gini</div>
          <div className={`mt-0.5 text-xl font-semibold tracking-tight ${qualityTint}`}>{fmt(gini, 3)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-[11px] text-slate-500">Discrimination</div>
          <div className={`mt-0.5 text-xl font-semibold tracking-tight ${qualityTint}`}>{quality}</div>
        </div>
      </div>

      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-[13px] font-semibold text-slate-900">Decile bad rate</h3>
        <span className="text-[11px] text-slate-400">goods {goods} · bads {bads}</span>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        A well-ranking model shows bad rate rising from the lowest-risk decile (D1) to the highest (D10).
      </p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="decile" tick={{ fontSize: 11, fill: "#8a909c" }} axisLine={{ stroke: "#eceef1" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8a909c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eceef1" }} formatter={(v) => `${v}%`} />
            <Bar dataKey="bad_rate" name="Actual bad rate" fill="#0d9488" radius={[3, 3, 0, 0]} />
            <Line type="monotone" dataKey="avg_pd" name="Avg predicted PD" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}