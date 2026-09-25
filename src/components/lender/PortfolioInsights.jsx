import React from "react";
import { GREEN, PORTFOLIO_SUMMARY, DECISION_DRIVERS, OUTCOMES, BORROWER_MIX, MIX_COLORS } from "./data";

export default function PortfolioInsights() {
  const total = BORROWER_MIX.reduce((s, b) => s + b.value, 0);
  let acc = 0;
  const segs = BORROWER_MIX.map((b, i) => {
    const frac = total > 0 ? b.value / total : 0;
    const seg = { ...b, color: MIX_COLORS[i % MIX_COLORS.length], start: acc, frac };
    acc += frac;
    return seg;
  });
  const maxDriver = Math.max(
    ...DECISION_DRIVERS.approved.map((d) => d.count),
    ...DECISION_DRIVERS.declined.map((d) => d.count),
    1
  );
  const bars = [12, 18, 9, 22, 15, 27, 14, 20];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        {PORTFOLIO_SUMMARY.map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{s.status}</span>
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{s.files} files</div>
            <div className="text-[12px] text-slate-500">Value: {s.value}</div>
            <div className="text-[11px] text-slate-400">Avg in stage: {s.avg}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end -mt-2">
        <span className="text-[12px] text-slate-400 hover:text-slate-600 cursor-pointer">View all files →</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl bg-white p-5" style={{ border: `2px solid ${GREEN}` }}>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Decision Drivers</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3">Approved (19 recorded decisions)</p>
              <ul className="space-y-2.5">
                {DECISION_DRIVERS.approved.map((d, i) => (
                  <li key={i}>
                    <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-slate-600">{d.label}</span><span className="font-medium text-slate-800">{d.count}</span></div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(d.count / maxDriver) * 100}%`, backgroundColor: GREEN }} /></div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3">Declined (5 recorded decisions)</p>
              <ul className="space-y-2.5">
                {DECISION_DRIVERS.declined.map((d, i) => (
                  <li key={i}>
                    <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-slate-600">{d.label}</span><span className="font-medium text-slate-800">{d.count}</span></div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(d.count / maxDriver) * 100}%`, backgroundColor: "#B42318" }} /></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[12px] text-slate-400 hover:text-slate-600 cursor-pointer">View all decisions →</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Outcomes</h3>
          <ul className="space-y-3">
            {OUTCOMES.map((o, i) => (
              <li key={i} className="flex items-center justify-between">
                <div><div className="text-[13px] font-medium text-slate-800">{o.label}</div><div className="text-[11px] text-slate-400">{o.files} files</div></div>
                <div className="text-[13px] font-semibold text-slate-900">{o.value}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Borrower Mix</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                {segs.map((s, i) => {
                  if (s.frac === 0) return null;
                  const dash = s.frac * 100;
                  const offset = s.start * 100;
                  return <circle key={i} cx="21" cy="21" r="15.9155" fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={-offset} />;
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-900">{total} borrowers</div>
            </div>
            <ul className="space-y-1.5 flex-1">
              {BORROWER_MIX.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px]"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: MIX_COLORS[i % MIX_COLORS.length] }} /><span className="text-slate-600">{b.label}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Application Flow</h3>
            <div className="flex items-center gap-1 text-[11px]">{["Week", "Month", "Quarter"].map((p, i) => (<span key={p} className={`px-2 py-0.5 rounded ${i === 2 ? "bg-slate-900 text-white" : "text-slate-400"}`}>{p}</span>))}</div>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Last 90 days</p>
          <div className="flex items-end gap-2 h-32">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full rounded-t bg-slate-300" style={{ height: `${h * 1.4}px` }} />
                <div className="w-full" style={{ height: `${h * 1.0}px`, backgroundColor: GREEN }} />
                <div className="w-full rounded-b bg-rose-400" style={{ height: `${h * 0.5}px` }} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 flex-wrap">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-300" /> Received</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: GREEN }} /> Approved</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-400" /> Declined</span>
          </div>
        </div>
      </div>
    </div>
  );
}