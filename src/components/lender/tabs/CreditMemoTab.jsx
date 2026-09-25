import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import {
  GREEN, BORROWER, MEMO_SECTIONS, STRENGTHS, WEAKNESSES,
  BUREAU_DATA, POLICY_RESULTS, SCORECARD, COMPETITIVE,
} from "../data";

function Citation({ n }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium rounded bg-slate-100 text-slate-600 align-middle ml-1">
      {n}
    </span>
  );
}

export default function CreditMemoTab({ step = 5 }) {
  const sectionsDone = step >= 7 ? 9 : step >= 6 ? 5 : 2;
  const progressPct = Math.round((sectionsDone / 9) * 100);

  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Reading the file...</h3>
          <span className="text-[12px] text-slate-400">{sectionsDone} of 9 sections</span>
        </div>
        <p className="text-[12px] text-slate-400 mt-0.5">Each step is recorded as it completes. You can leave this page.</p>
        <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: GREEN }} />
        </div>
      </div>

      {/* Prepare + Sections */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3">Prepare</h4>
          <ol className="space-y-4 relative">
            <span className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-200" />
            <li className="flex gap-3 relative">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: GREEN }} /></span>
              <div><div className="text-[13px] font-medium text-slate-800">Evidence indexed</div><div className="text-[12px] text-slate-400">11 documents, 47 signals extracted.</div></div>
            </li>
            <li className="flex gap-3 relative">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: GREEN }} /></span>
              <div><div className="text-[13px] font-medium text-slate-800">Underwriting inputs assembled</div><div className="text-[12px] text-slate-400">Financials spread, DSCR computed.</div></div>
            </li>
          </ol>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Sections</h4>
            <span className="text-[12px] text-slate-400">{BORROWER.name}</span>
          </div>
          <ul className="space-y-1.5">
            {MEMO_SECTIONS.map((s, i) => {
              const done = s.status === "DONE";
              const writing = s.status === "WRITING";
              return (
                <li key={i} className="flex items-center justify-between rounded-lg px-2.5 py-2">
                  <div className="flex items-center gap-2.5">
                    {done ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                      : writing ? <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: GREEN }} />
                      : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                    <span className={`text-[13px] ${done || writing ? "text-slate-800" : "text-slate-400"}`}>{s.name}</span>
                  </div>
                  {writing
                    ? <span className="text-[10px] font-mono uppercase text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: GREEN }}>{s.status}</span>
                    : <span className={`text-[10px] font-mono uppercase ${done ? "text-emerald-600" : "text-slate-400"}`}>{s.status}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">3 Strengths, Weaknesses & Mitigants</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-[12px] font-mono uppercase tracking-wider mb-3" style={{ color: GREEN }}>Strengths</h4>
            <ul className="space-y-2.5">
              {STRENGTHS.map((s, i) => (
                <li key={i} className="text-[13px] text-slate-700 leading-relaxed">{s}<Citation n={1} /></li>
              ))}
            </ul>
          </div>
          <div className="md:border-l md:border-slate-100 md:pl-6">
            <h4 className="text-[12px] font-mono uppercase tracking-wider mb-3" style={{ color: "#B39257" }}>Weaknesses & Mitigants</h4>
            <ul className="space-y-3">
              {WEAKNESSES.map((w, i) => (
                <li key={i}>
                  <div className="text-[13px] text-slate-700 leading-relaxed">{w.text}<Citation n={1} /></div>
                  <div className="text-[12px] text-slate-400 mt-0.5"><span className="font-medium">Mitigant:</span> {w.mitigant}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Competitive analysis */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Competitive Analysis</h3>
        <ul className="space-y-2">
          {COMPETITIVE.map((c, i) => (
            <li key={i} className="text-[13px]"><span className="font-medium text-slate-700">{c.label}:</span> <span className="text-slate-600">{c.text}</span></li>
          ))}
        </ul>
      </div>

      {/* Bureau + external data */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Credit Bureau + External Data Integrations</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {BUREAU_DATA.map((b, i) => (
            <div key={i} className="rounded-lg border border-slate-100 p-3.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{b.provider}</div>
              <div className="text-[13px] font-semibold text-slate-800 mt-0.5">{b.product}</div>
              <div className="text-[12px] text-slate-400">{b.detail}</div>
              <div className="text-[15px] font-semibold mt-1.5" style={{ color: GREEN }}>{b.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy results */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Policy Results</h3>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Evaluated Sep 16, 7:18 PM · engine v1.0.0</span>
            <button className="text-[11px] font-medium px-2.5 py-1 rounded border border-slate-300 text-slate-600">OVERRIDE</button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-[12px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2 font-medium">Rule</th>
                <th className="px-3 py-2 font-medium">Expected</th>
                <th className="px-3 py-2 font-medium">Actual</th>
                <th className="px-3 py-2 font-medium">Outcome</th>
                <th className="px-3 py-2 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {POLICY_RESULTS.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2.5 text-slate-700">{r.rule}</td>
                  <td className="px-3 py-2.5 text-slate-500">{r.expected}</td>
                  <td className="px-3 py-2.5 text-slate-500">{r.actual}</td>
                  <td className="px-3 py-2.5 text-slate-500">{r.outcome}</td>
                  <td className="px-3 py-2.5"><span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700">{r.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">9 Recommendation</h3>
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "#FFFBE6", border: "1px solid #f5e9b8" }}>
          <p className="text-[13px] text-slate-800 font-medium">Recommended disposition: advance with pre-funding conditions.</p>
          <p className="text-[12px] text-slate-600 mt-1.5 leading-relaxed">Brightleaf's 2.32x coverage and $32,400 interim earnings support the request once the Bank of America retention condition and entity-name reconciliation are cleared. Pre-funding conditions apply.</p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">Lender review</span>
            <span className="text-[11px] text-slate-500">Scores 94 of 100 against the Small Business Term Loan scorecard.</span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-[12px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2 font-medium">Metric</th>
                <th className="px-3 py-2 font-medium">Value</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SCORECARD.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2.5 text-slate-700">{r.metric}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{r.value}</td>
                  <td className="px-3 py-2.5"><span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{r.status}</span></td>
                  <td className="px-3 py-2.5 text-slate-600">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-2xl font-semibold text-slate-900">94<span className="text-base text-slate-400">/100</span></span>
            <p className="text-[11px] text-slate-400">Small Business Term Loan template · review below 75 of 100</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Your decision</p>
          <div className="flex items-center gap-2">
            <button className="text-sm font-medium text-white px-4 py-2 rounded-lg" style={{ backgroundColor: GREEN }}>Approve</button>
            <button className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 text-slate-600 bg-white">Decline</button>
            <button className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 text-slate-600 bg-white">Escalate</button>
          </div>
        </div>
      </div>
    </div>
  );
}