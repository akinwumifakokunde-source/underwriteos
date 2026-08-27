import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { id: "application", num: "01", label: "Application" },
  { id: "documents", num: "02", label: "Documents & Data" },
  { id: "analysis", num: "03", label: "AI Analysis" },
  { id: "policy", num: "04", label: "Policy" },
  { id: "decision", num: "05", label: "Decision" },
];

export default function WorkspaceStepper({ active, completed, onNavigate }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
      {STEPS.map((s, i) => {
        const isActive = active === s.id;
        const isDone = completed.includes(s.id);
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => onNavigate(s.id)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-slate-900 text-white"
                  : isDone
                  ? "text-slate-700 hover:bg-slate-100"
                  : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? "bg-white/20 text-white" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : s.num}
              </span>
              <span className="font-medium hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`h-px w-4 sm:w-8 shrink-0 ${isDone ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}