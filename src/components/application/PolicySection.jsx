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
        <p className="text-sm text-slate-400">Waiting for borrower information.</p>
        <p className="text-[12px] text-slate-400 mt-1">The policy evaluates automatically once documents are processed.</p>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                <th className="text-left py-2 pr-3">Rule</th>
                <th className="text-right py-2 px-3">Observed</th>
                <th className="text-right py-2 px-3">Threshold</th>
                <th className="text-center py-2 px-3">Result</th>
                <th className="text-center py-2 px-3">Action</th>
                <th className="text-left py-2 pl-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {outcome.evaluated_rules?.map((r, i) => {
                const passed = r.result !== "FAIL";
                return (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-3 text-slate-800 font-medium whitespace-nowrap">{r.field.replace(/_/g, " ")} {r.operator}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{String(r.input ?? "—")}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{String(r.threshold)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${passed ? "text-emerald-600" : "text-rose-600"}`}>
                        {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {r.result}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${r.decision === "APPROVE" ? "bg-emerald-50 text-emerald-700" : r.decision === "DECLINE" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{r.decision}</span>
                    </td>
                    <td className="py-2.5 pl-3 text-[12px] text-slate-500">{r.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[12px] text-slate-500">
        The policy evaluation is authoritative. The AI recommendation is advisory and cannot override this result.
      </div>
    </div>
  );
}