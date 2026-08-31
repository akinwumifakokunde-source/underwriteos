import React, { useState } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from "lucide-react";

export default function RiskSignalsTab({ signals, evidence, onViewEvidence }) {
  const [expanded, setExpanded] = useState(null);

  if (!signals || signals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <p className="text-sm text-slate-500 font-medium">Risk analysis will begin automatically when borrower information becomes available.</p>
        <p className="text-[12px] text-slate-400 mt-1">Upload documents or enter borrower details. CreditDecide will generate risk signals and evaluate them against your policy.</p>
      </div>
    );
  }

  const evBySignalId = {};
  (evidence || []).forEach((e) => { if (e.signal_id) evBySignalId[e.signal_id] = e; });

  const CATEGORIES = [
    { key: "affordability", label: "Affordability" },
    { key: "credit", label: "Credit" },
    { key: "cashflow", label: "Cash Flow" },
    { key: "income", label: "Income" },
    { key: "fraud", label: "Fraud & Identity" },
    { key: "identity", label: "Identity" },
    { key: "data_quality", label: "Data Quality" },
    { key: "policy", label: "Policy" },
  ];

  const groups = CATEGORIES.map((c) => ({
    ...c,
    items: signals.filter((s) => s.category === c.key),
  })).filter((g) => g.items.length > 0);

  // Also include any signals with uncategorized categories
  const categorized = new Set(groups.flatMap((g) => g.items.map((s) => s.id)));
  const uncategorized = signals.filter((s) => !categorized.has(s.id));
  if (uncategorized.length > 0) groups.push({ key: "other", label: "Other", items: uncategorized });

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.label} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">{g.label} <span className="text-slate-400 font-normal">({g.items.length})</span></h3>
          <div className="space-y-1">
            {g.items.map((s) => {
              const idx = signals.indexOf(s);
              const isOpen = expanded === idx;
              const ev = evBySignalId[s.id] || (evidence || []).find((e) => e.signal === s.signal);
              return (
                <div key={s.id} className="border-b border-slate-50 last:border-0">
                  <button onClick={() => setExpanded(isOpen ? null : idx)} className="w-full flex items-center gap-3 py-2.5 text-left">
                    <SignalIcon flag={s.flag} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{s.signal.replace(/_/g, " ")}</div>
                      {s.explanation && !isOpen && <div className="text-[11px] text-slate-400 truncate">{s.explanation}</div>}
                    </div>
                    <div className="text-sm font-mono text-slate-700 shrink-0">{formatSignalValue(s)}</div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="pl-9 pb-3 space-y-1.5 text-[12px]">
                      {s.threshold != null && (
                        <div className="flex gap-2"><span className="text-slate-400 w-28">Policy threshold:</span><span className="font-mono text-slate-700">{String(s.threshold)}</span></div>
                      )}
                      {s.category && <div className="flex gap-2"><span className="text-slate-400 w-28">Category:</span><span className="text-slate-700 capitalize">{s.category}</span></div>}
                      {ev && (
                        <>
                          <div className="flex gap-2"><span className="text-slate-400 w-28">Source:</span><span className="text-slate-700">{ev.source_type?.replace(/_/g, " ")}{ev.source_location ? ` · ${ev.source_location}` : ""}</span></div>
                          {ev.confidence != null && <div className="flex gap-2"><span className="text-slate-400 w-28">Confidence:</span><span className="text-teal-600">{Math.round(ev.confidence * 100)}%</span></div>}
                          <button onClick={() => onViewEvidence(ev)} className="text-teal-600 hover:text-teal-700 font-medium">View evidence</button>
                        </>
                      )}
                      {s.explanation && <div className="text-slate-500 pt-1">{s.explanation}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SignalIcon({ flag }) {
  if (flag === "positive") return <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><TrendingUp className="w-3.5 h-3.5 text-emerald-600" /></div>;
  if (flag === "negative") return <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><TrendingDown className="w-3.5 h-3.5 text-amber-600" /></div>;
  if (flag === "critical") return <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0"><TrendingDown className="w-3.5 h-3.5 text-rose-600" /></div>;
  return <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0"><Minus className="w-3.5 h-3.5 text-slate-400" /></div>;
}

function formatSignalValue(s) {
  if (s.value_type === "number") {
    if (s.currency) return new Intl.NumberFormat("en-US", { style: "currency", currency: s.currency, maximumFractionDigits: 0 }).format(s.value || 0);
    if (s.value < 1 && s.value > 0) return `${Math.round(s.value * 100)}%`;
    return String(s.value);
  }
  return String(s.value ?? "—");
}