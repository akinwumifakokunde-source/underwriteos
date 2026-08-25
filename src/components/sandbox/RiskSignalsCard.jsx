import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const FLAG_TONE = {
  positive: "text-emerald-600 bg-emerald-50",
  neutral: "text-slate-600 bg-slate-100",
  negative: "text-amber-600 bg-amber-50",
  critical: "text-rose-600 bg-rose-50",
};

export default function RiskSignalsCard({ signals }) {
  const [open, setOpen] = useState({});
  if (!signals?.length) return <p className="text-sm text-slate-400">No risk signals.</p>;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Risk signals ({signals.length})</h3>
      <div className="space-y-1.5">
        {signals.map((s) => {
          const isOpen = open[s.id];
          return (
            <div key={s.id} className="rounded-lg border border-slate-100">
              <button onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))} className="w-full flex items-center gap-2 px-3 py-2 text-left">
                {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-sm text-slate-700 flex-1">{s.signal}</span>
                <span className="text-xs font-mono text-slate-600">{formatValue(s)}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${FLAG_TONE[s.flag] || FLAG_TONE.neutral}`}>{s.flag}</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t border-slate-50 pt-2 mt-1">
                  <Cell label="Category" value={s.category} />
                  <Cell label="Source" value={s.source} />
                  <Cell label="Confidence" value={`${Math.round((s.confidence || 0) * 100)}%`} />
                  <Cell label="Evidence" value={s.evidence_id ? s.evidence_id.slice(-8) : "—"} />
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
      <div className="font-mono text-slate-700">{value}</div>
    </div>
  );
}

function formatValue(s) {
  if (s.value_type === "number") return s.value?.toLocaleString();
  if (s.value_type === "boolean") return s.value ? "Yes" : "No";
  return String(s.value ?? "—");
}