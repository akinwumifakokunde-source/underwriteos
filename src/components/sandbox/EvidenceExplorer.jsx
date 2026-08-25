import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const SOURCE_LABEL = {
  credit_report: "Credit report",
  bank_statement: "Bank statement",
  document: "Document",
  borrower_declaration: "Borrower declaration",
  derived: "Derived calculation",
  ai_analysis: "AI analysis",
};

const CHAIN = ["Decision", "Reason", "Risk signal", "Calculation", "Source", "Document"];

export default function EvidenceExplorer({ signals, evidence }) {
  const [open, setOpen] = useState({});
  if (!signals?.length) return null;
  const evBySignal = {};
  for (const e of evidence || []) (evBySignal[e.signal_id] ||= []).push(e);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Evidence ({evidence?.length || 0})</h3>
      <p className="text-xs text-slate-500 mb-3">Every risk signal is traceable to its source. Click a signal to expand the evidence chain.</p>
      <div className="space-y-1.5">
        {signals.map((s) => {
          const ev = evBySignal[s.id] || [];
          const isOpen = open[s.id];
          return (
            <div key={s.id} className="rounded-lg border border-slate-100">
              <button onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))} className="w-full flex items-center gap-2 px-3 py-2 text-left">
                {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-sm text-slate-700 flex-1">{s.signal}</span>
                <span className="text-xs font-mono text-slate-600">{formatValue(s)}</span>
                <span className="text-[10px] text-slate-400">conf {Math.round((s.confidence || 0) * 100)}%</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3">
                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400 mb-2">
                    {CHAIN.map((c, i) => (
                      <React.Fragment key={c}>
                        <span className="bg-slate-100 rounded px-1.5 py-0.5">{c}</span>
                        {i < CHAIN.length - 1 && <span>↓</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  {ev.map((e, i) => (
                    <div key={i} className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t border-slate-50 pt-2 mt-1">
                      <Cell label="Source" value={SOURCE_LABEL[e.source_type] || e.source_type} />
                      <Cell label="Source reference" value={e.source_id ? e.source_id.slice(-8) : "—"} />
                      <Cell label="Calculation" value={e.calculation_method || "—"} />
                      <Cell label="Confidence" value={`${Math.round((e.confidence || 0) * 100)}%`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="font-mono text-slate-700 break-all">{value}</div>
    </div>
  );
}

function formatValue(s) {
  if (s.value_type === "number") return s.value?.toLocaleString();
  if (s.value_type === "boolean") return s.value ? "Yes" : "No";
  return String(s.value ?? "—");
}