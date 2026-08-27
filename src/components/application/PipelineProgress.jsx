import React from "react";
import { Loader2, Check, ChevronRight } from "lucide-react";

export default function PipelineProgress({ documents, fp, cp, riskSignals, decision }) {
  const docs = documents || [];
  const hasDecision = !!decision && decision.decision && decision.decision !== "null";

  const stages = [
    { label: "Documents received", done: docs.length > 0 },
    { label: "Documents classified", done: docs.length > 0 && docs.every((d) => d.status && d.status !== "uploaded") },
    { label: "Data extracted", done: docs.some((d) => d.extracted_data || d.status === "processed" || d.status === "verified") },
    { label: "Financial profile created", done: fp?.income?.monthly != null },
    { label: "Credit profile created", done: cp?.credit_score != null },
    { label: "Risk signals generated", done: (riskSignals?.length || 0) > 0 },
    { label: "Policy evaluation", done: hasDecision },
    { label: "Decision", done: hasDecision },
  ];

  const firstPending = stages.findIndex((s) => !s.done);
  const inProgressIdx = firstPending === -1 ? -1 : firstPending;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Processing pipeline</h3>
        <span className="text-[11px] text-slate-400">
          {inProgressIdx === -1 ? "Complete" : `Step ${inProgressIdx + 1} of ${stages.length}`}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-y-2">
        {stages.map((s, i) => {
          const done = s.done;
          const inProgress = i === inProgressIdx;
          return (
            <React.Fragment key={s.label}>
              <div className="flex items-center gap-1.5 pr-2">
                {done ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                ) : inProgress ? (
                  <Loader2 className="w-4 h-4 text-teal-500 animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-200 bg-slate-50 shrink-0" />
                )}
                <span className={`text-[12px] ${done ? "text-slate-700 font-medium" : inProgress ? "text-teal-700 font-medium" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < stages.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-200 shrink-0 mr-1" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}