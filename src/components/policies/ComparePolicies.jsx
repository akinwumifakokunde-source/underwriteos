import React, { useState, useMemo } from "react";
import { X, GitCompare, ArrowRight } from "lucide-react";
import { evaluateRules, FIELD_DEFAULTS } from "./PolicySimulator";

const OUTCOME_STYLE = {
  APPROVE: "text-emerald-700 bg-emerald-50 border-emerald-200",
  REVIEW: "text-amber-700 bg-amber-50 border-amber-200",
  DECLINE: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function ComparePolicies({ policies, onClose }) {
  const [aId, setAId] = useState(policies[0]?.id || "");
  const [bId, setBId] = useState(policies[1]?.id || "");
  const [values, setValues] = useState(FIELD_DEFAULTS);

  const a = policies.find((p) => p.id === aId);
  const b = policies.find((p) => p.id === bId);

  const resA = useMemo(() => evaluateRules(a?.rules || [], values), [a, values]);
  const resB = useMemo(() => evaluateRules(b?.rules || [], values), [b, values]);

  const rulesA = a?.rules || [];
  const rulesB = b?.rules || [];
  const idsA = new Map(rulesA.map((r) => [r.rule_id, r]));
  const idsB = new Map(rulesB.map((r) => [r.rule_id, r]));
  const added = rulesB.filter((r) => !idsA.has(r.rule_id));
  const removed = rulesA.filter((r) => !idsB.has(r.rule_id));
  const modified = rulesB.filter((r) => {
    const o = idsA.get(r.rule_id);
    if (!o) return false;
    return o.field !== r.field || o.operator !== r.operator || String(o.threshold) !== String(r.threshold) || o.decision !== r.decision;
  });

  const fields = [...new Set([...rulesA, ...rulesB].map((r) => r.field))];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#0d9488]" />
            <h3 className="text-sm font-semibold text-slate-900">Compare policies</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
            <select value={aId} onChange={(e) => setAId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {policies.map((p) => <option key={p.id} value={p.id}>{p.name} v{p.version}</option>)}
            </select>
            <ArrowRight className="w-4 h-4 text-slate-300 mx-auto" />
            <select value={bId} onChange={(e) => setBId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {policies.map((p) => <option key={p.id} value={p.id}>{p.name} v{p.version}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <DiffCard label="Added" count={added.length} cls="text-emerald-700 bg-emerald-50 border-emerald-200" />
            <DiffCard label="Removed" count={removed.length} cls="text-rose-700 bg-rose-50 border-rose-200" />
            <DiffCard label="Modified" count={modified.length} cls="text-amber-700 bg-amber-50 border-amber-200" />
          </div>

          {(added.length > 0 || removed.length > 0 || modified.length > 0) && (
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
              {added.map((r) => <DiffRow key={"a" + r.rule_id} tag="Added" r={r} cls="text-emerald-700" />)}
              {removed.map((r) => <DiffRow key={"r" + r.rule_id} tag="Removed" r={r} cls="text-rose-700" />)}
              {modified.map((r) => <DiffRow key={"m" + r.rule_id} tag="Modified" r={r} cls="text-amber-700" />)}
            </div>
          )}

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Sample evaluation</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <OutcomeCard name={a?.name} outcome={resA.outcome} />
              <OutcomeCard name={b?.name} outcome={resB.outcome} />
            </div>
            <div className="rounded-lg border border-slate-200 p-3 space-y-2">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Adjust sample values</div>
              {fields.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <label className="text-[12px] text-slate-600 w-40 shrink-0 capitalize">{f.replace(/_/g, " ")}</label>
                  <input type="number" step="0.01" value={values[f] ?? 0} onChange={(e) => setValues({ ...values, [f]: parseFloat(e.target.value) || 0 })} className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[12px] font-mono" />
                </div>
              ))}
              {fields.length === 0 && <p className="text-[12px] text-slate-400">No rules in selected policies.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiffCard({ label, count, cls }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${cls}`}>
      <div className="text-2xl font-semibold tabular-nums">{count}</div>
      <div className="text-[10px] uppercase tracking-wider font-semibold opacity-70">{label}</div>
    </div>
  );
}

function DiffRow({ tag, r, cls }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-[12px]">
      <span className={`text-[10px] font-medium ${cls}`}>{tag}</span>
      <span className="font-mono text-slate-500">{r.rule_id}</span>
      <span className="text-slate-700 capitalize flex-1">{r.field.replace(/_/g, " ")} {r.operator} {r.threshold}</span>
      <span className={`font-medium ${cls}`}>{r.decision}</span>
    </div>
  );
}

function OutcomeCard({ name, outcome }) {
  return (
    <div className={`rounded-lg border p-3 ${OUTCOME_STYLE[outcome] || OUTCOME_STYLE.REVIEW}`}>
      <div className="text-[11px] uppercase tracking-wider opacity-70 truncate">{name}</div>
      <div className="text-xl font-bold">{outcome}</div>
    </div>
  );
}