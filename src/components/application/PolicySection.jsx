import React from "react";
import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";

export default function PolicySection({ decision, policyInfo }) {
  const outcome = decision?.policy_outcome;
  const policyName = policyInfo?.name || decision?.policy_id || "Consumer Lending v1";
  const policyVersion = decision?.policy_version || policyInfo?.version || "1";

  if (!outcome) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No policy evaluation yet.</p>
        <p className="text-[12px] text-slate-400 mt-1">Run analysis to see how the configured policy evaluates this borrower.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{policyName}</h3>
            <p className="text-[11px] text-slate-400 font-mono">Version {policyVersion}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${outcome.decision === "APPROVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : outcome.decision === "DECLINE" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
            {outcome.decision === "APPROVE" ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span className="text-sm font-semibold">{outcome.decision}</span>
          </div>
        </div>

        <div className="space-y-2">
          {outcome.evaluated_rules?.map((r, i) => {
            const passed = r.result !== "FAIL";
            return (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${passed ? "bg-emerald-100" : "bg-rose-100"}`}>
                  {passed ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">
                    {r.field.replace(/_/g, " ")} {r.operator} {String(r.threshold)}
                  </div>
                  <div className="text-[11px] text-slate-400">{r.reason}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[10px] font-bold ${passed ? "text-emerald-600" : "text-rose-600"}`}>{r.result}</div>
                  <div className="text-[12px] font-mono text-slate-500">Observed: {String(r.input ?? "—")}</div>
                </div>
              </div>
            );
          })}
        </div>

        {outcome.triggered_rules?.length > 0 && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="text-[11px] font-semibold text-amber-700 mb-1">Policy result: {outcome.decision}</div>
            <ul className="space-y-1">
              {outcome.triggered_rules.map((r, i) => (
                <li key={i} className="text-[12px] text-amber-700">• {r.reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[12px] text-slate-500">
        The policy evaluation is authoritative. The AI recommendation is advisory and cannot override this result.
      </div>
    </div>
  );
}