import React from "react";
import { CheckCircle2, Loader2, Circle, AlertTriangle, Clock } from "lucide-react";

const STATUS = {
  not_started: { icon: Circle, cls: "text-slate-300" },
  running: { icon: Loader2, cls: "text-slate-500 animate-spin" },
  completed: { icon: CheckCircle2, cls: "text-emerald-500" },
  failed: { icon: AlertTriangle, cls: "text-rose-500" },
};

export default function SandboxFlow({ steps, selected, onSelect, ctxId }) {
  return (
    <div className="space-y-1.5">
      {steps.map((step, i) => {
        const st = step.state;
        const s = STATUS[st.status];
        const Icon = s.icon;
        const active = selected === step.id;
        const failed = st.status === "failed";
        return (
          <button
            key={step.id}
            onClick={() => onSelect(step.id)}
            className={`w-full text-left rounded-xl border p-3.5 transition-all ${active ? "border-slate-900 bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"} ${failed ? "border-rose-200 bg-rose-50/40" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 shrink-0 ${s.cls}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-medium text-slate-800">{step.label}</span>
                </div>
                <code className="text-[11px] font-mono text-slate-400 block truncate">
                  {step.method} {step.path.replace("{id}", ctxId || ":id")}
                </code>
              </div>
              {st.status === "completed" && (
                <div className="text-right shrink-0">
                  <div className={`text-[10px] font-mono font-semibold ${st.statusCode >= 400 ? "text-rose-600" : "text-emerald-600"}`}>
                    {st.statusCode || step.status}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5 justify-end">
                    <Clock className="w-2.5 h-2.5" /> {st.durationMs || 0} ms
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}