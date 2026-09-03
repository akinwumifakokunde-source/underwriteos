import React from "react";
import {
  LayoutDashboard, FileText, Wallet, Scale, GitCompare,
  ShieldAlert, Brain, ScrollText, Gavel, Network, Activity as ActivityIcon,
} from "lucide-react";

const TAB_ICONS = {
  Overview: LayoutDashboard,
  Documents: FileText,
  "Financial Profile": Wallet,
  Affordability: Scale,
  Reconciliation: GitCompare,
  Risk: ShieldAlert,
  "AI Underwriter": Brain,
  Policy: ScrollText,
  Decision: Gavel,
  Evidence: Network,
  Activity: ActivityIcon,
};

export default function ApplicationTabBar({ tabs, active, onChange, documentsCount = 0 }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const Icon = TAB_ICONS[t] || LayoutDashboard;
          const isActive = active === t;
          const showCount = t === "Documents" && documentsCount > 0;
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              aria-current={isActive ? "page" : undefined}
              className={`group shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all duration-150 ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200 active:scale-[0.97]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span>{t}</span>
              {showCount && (
                <span className={`ml-0.5 text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}>
                  {documentsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}