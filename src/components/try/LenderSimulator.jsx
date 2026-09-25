import React, { useState } from "react";
import { ArrowLeft, MessageSquare, ScanLine, Scale, Check, X, ShieldCheck, Sparkles } from "lucide-react";

const FOREST = "#0B3D21";

const CHAT = [
  { from: "officer", text: "Hi Maria — to finish your application I just need your latest payslip." },
  { from: "borrower", text: "Sure — uploading now ✓" },
  { from: "officer", text: "Got it. I also need 3 months of bank statements from your main account." },
  { from: "borrower", text: "On it — sending now." },
  { from: "officer", text: "Perfect, that's everything. I'll run the assessment now." },
];

const CAPTURED = [
  { field: "Credit score", value: "712", source: "Experian report", loc: "p.1", cited: true },
  { field: "Credit utilisation", value: "31%", source: "Experian report", loc: "p.2", cited: true },
  { field: "Monthly income", value: "$4,800", source: "Payslip", loc: "line 3", cited: true },
  { field: "Average balance", value: "$2,150", source: "Bank statement", loc: "p.3", cited: true },
  { field: "Active accounts", value: "6", source: "Experian report", loc: "p.1", cited: true },
  { field: "DTI ratio", value: "0.34", source: "Derived from income + statements", loc: "", cited: false },
];

const SCORECARD = [
  { label: "Credit history", score: 18, max: 25 },
  { label: "Affordability", score: 19, max: 25 },
  { label: "Income stability", score: 17, max: 25 },
  { label: "Cashflow & balances", score: 18, max: 25 },
];

const TABS = [
  { key: "officer", label: "AI Credit Officer", icon: MessageSquare },
  { key: "capture", label: "CreditDecide Capture", icon: ScanLine },
  { key: "underwrite", label: "Underwriting Assistant", icon: Scale },
];

export default function LenderSimulator({ onBack }) {
  const [tab, setTab] = useState("officer");
  const total = SCORECARD.reduce((s, r) => s + r.score, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to overview
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Lender workspace · demo</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Application #DEMO-2041</p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">Maria Delgado · $25,000 personal loan</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">United States · 36 months · salaried · Casa Verde Catering</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 self-start">
              <Check className="w-3.5 h-3.5" /> Complete file
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${active ? "border-[#0B3D21] text-slate-900 dark:text-slate-50" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {tab === "officer" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">AI Credit Officer</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">Chases borrowers on SMS, email and chat — against your eligibility rules.</p>
                </div>
              </div>
              <div className="space-y-3">
                {CHAT.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "borrower" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${m.from === "borrower" ? "text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"}`} style={m.from === "borrower" ? { backgroundColor: FOREST } : undefined}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5" /> All required documents collected — file ready for assessment.
              </div>
            </div>
          )}

          {tab === "capture" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                  <ScanLine className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">CreditDecide Capture</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">Extracts credit signal cited to the source — flags inconsistencies.</p>
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-2.5 font-medium">Field</th>
                      <th className="px-4 py-2.5 font-medium">Value</th>
                      <th className="px-4 py-2.5 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {CAPTURED.map((c) => (
                      <tr key={c.field} className="text-[13px]">
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.field}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{c.value}</td>
                        <td className="px-4 py-3">
                          {c.cited ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-700 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FOREST }} />
                              {c.source} {c.loc && <span className="text-slate-400">· {c.loc}</span>}
                            </span>
                          ) : (
                            <span className="text-[12px] text-slate-400">{c.source}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[12px] text-slate-500 dark:text-slate-400">Every value is traceable to the document and page it came from.</p>
            </div>
          )}

          {tab === "underwrite" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">AI Underwriting Assistant</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">Spreads the financials and drafts the memo — against your credit policy.</p>
                </div>
              </div>
              <div className="space-y-4">
                {SCORECARD.map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-[13px] mb-1.5">
                      <span className="text-slate-600 dark:text-slate-300">{r.label}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{r.score}/{r.max}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(r.score / r.max) * 100}%`, backgroundColor: FOREST }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total score</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{total}<span className="text-base text-slate-400">/100</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    <Check className="w-4 h-4" /> Approve
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full text-slate-400 border border-slate-200 dark:border-slate-800">
                    <X className="w-4 h-4" /> Decline
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl p-6" style={{ backgroundColor: "#F9F9F8" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Recommendation</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Approve · {total}/100 · low risk</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-md">
              Strong credit history, stable income and healthy cashflow. DTI within policy. No fraud signals detected.
            </p>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">Demo data — no real application was created and no decision was saved.</p>
        </div>
      </div>
    </div>
  );
}