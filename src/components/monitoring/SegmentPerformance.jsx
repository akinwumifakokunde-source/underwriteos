import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

function pct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function Row({ row }) {
  const gap = row.gap || 0;
  const overPredict = gap < -0.03; // actual lower than predicted
  const underPredict = gap > 0.03; // actual higher than predicted
  return (
    <tr className="border-b border-slate-50 last:border-0">
      <td className="py-2 pr-3 text-slate-900 font-medium">{row.segment}</td>
      <td className="py-2 pr-3 text-slate-500 text-right">{row.count}</td>
      <td className="py-2 pr-3 font-mono text-slate-600 text-right">{pct(row.avg_predicted_pd)}</td>
      <td className="py-2 pr-3 font-mono text-slate-900 text-right">{pct(row.actual_default_rate)}</td>
      <td className="py-2 text-right">
        <span className={`inline-flex items-center gap-1 font-mono text-[11px] ${underPredict ? "text-rose-600" : overPredict ? "text-amber-600" : "text-emerald-600"}`}>
          {underPredict ? <TrendingUp className="w-3 h-3" /> : overPredict ? <TrendingDown className="w-3 h-3" /> : null}
          {gap >= 0 ? "+" : ""}{(gap * 100).toFixed(1)}pp
        </span>
      </td>
    </tr>
  );
}

export default function SegmentPerformance({ data }) {
  if (!data) return null;
  const sections = [
    { title: "By market", rows: data.market },
    { title: "By borrower type", rows: data.borrower_type },
    { title: "By risk band", rows: data.risk_band },
  ];
  const hasData = sections.some((s) => s.rows.length > 0);

  if (!hasData) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 text-center text-[13px] text-slate-400">
        No outcomes recorded yet. Segment performance appears once you record loan outcomes.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {sections.map((sec) => (
        <div key={sec.title} className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-2">{sec.title}</h3>
          {sec.rows.length === 0 ? (
            <p className="text-[12px] text-slate-400 py-3">No data.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="font-medium py-1.5 pr-3">Segment</th>
                  <th className="font-medium py-1.5 pr-3 text-right">N</th>
                  <th className="font-medium py-1.5 pr-3 text-right">Pred PD</th>
                  <th className="font-medium py-1.5 pr-3 text-right">Actual</th>
                  <th className="font-medium py-1.5 text-right">Gap</th>
                </tr>
              </thead>
              <tbody>
                {sec.rows.map((r) => <Row key={r.segment} row={r} />)}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}