import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

export default function DriftDetection({ data }) {
  if (!data || !data.buckets) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 text-center text-[13px] text-slate-400">
        Drift detection needs at least two periods of decisions. Underwrite across multiple months to populate it.
      </div>
    );
  }

  const psi = data.total_psi || 0;
  const status = psi < 0.1 ? "stable" : psi < 0.25 ? "watch" : "drift";
  const statusCfg = {
    stable: { icon: ShieldCheck, tint: "text-emerald-600", bg: "bg-emerald-50", label: "Stable — no significant drift" },
    watch: { icon: AlertTriangle, tint: "text-amber-600", bg: "bg-amber-50", label: "Watch — mild drift detected" },
    drift: { icon: ShieldAlert, tint: "text-rose-600", bg: "bg-rose-50", label: "Drift — population has shifted" },
  }[status];
  const Icon = statusCfg.icon;

  const chartData = data.buckets.map((b) => ({
    bucket: b.bucket,
    recent: +(b.recent_pct * 100).toFixed(1),
    baseline: +(b.baseline_pct * 100).toFixed(1),
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium ${statusCfg.bg} ${statusCfg.tint}`}>
          <Icon className="w-4 h-4" /> {statusCfg.label}
        </div>
        <div className="text-[12px] text-slate-500">
          PSI <span className="font-mono font-semibold text-slate-900">{psi.toFixed(3)}</span>
          <span className="mx-2 text-slate-300">·</span>
          Recent {data.recent_count} <span className="mx-1 text-slate-300">vs</span> Baseline {data.baseline_count}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#8a909c" }} axisLine={{ stroke: "#eceef1" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8a909c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eceef1" }}
              formatter={(v) => [`${v}%`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#eceef1" />
            <Bar dataKey="baseline" name="Baseline" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="recent" name="Recent (90d)" fill="#0d9488" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
        Population Stability Index compares the risk-score distribution of recent decisions against a baseline period.
        PSI &lt; 0.1 is stable, 0.1–0.25 warrants review, &gt; 0.25 indicates meaningful drift — re-tune or retrain.
      </p>
    </div>
  );
}