import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

export default function DefaultTrend({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 text-center text-[13px] text-slate-400">
        No observed outcomes yet. The default-rate trend appears as you record loan outcomes over time.
      </div>
    );
  }

  const chartData = data.map((m) => ({
    label: m.label,
    default_rate: +(m.default_rate * 100).toFixed(1),
    count: m.count,
  }));
  const avg = chartData.length > 0 ? chartData.reduce((s, d) => s + d.default_rate, 0) / chartData.length : 0;

  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8a909c" }} axisLine={{ stroke: "#eceef1" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8a909c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eceef1" }}
              formatter={(v, n) => n === "default_rate" ? [`${v}%`, "Default rate"] : [v, "Outcomes"]}
            />
            <ReferenceLine y={avg} stroke="#cbd5e1" strokeDasharray="4 4" label={{ value: "avg", fontSize: 10, fill: "#8a909c", position: "right" }} />
            <Line type="monotone" dataKey="default_rate" stroke="#dc2626" strokeWidth={2} dot={{ r: 3, fill: "#dc2626" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
        Monthly observed default rate across all recorded outcomes. The dashed line is the period average —
        a rising trend signals portfolio deterioration worth investigating.
      </p>
    </div>
  );
}