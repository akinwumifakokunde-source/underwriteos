import React from "react";
import { Globe2, Timer, ShieldCheck } from "lucide-react";

const STATS = [
  {
    icon: Globe2,
    value: "Any market",
    label: "Works across every country you lend in",
  },
  {
    icon: Timer,
    value: "< 3 min",
    label: "From upload to decision, on average",
  },
  {
    icon: ShieldCheck,
    value: "100% explainable",
    label: "Every signal traced to its source",
  },
];

export default function HeroStats() {
  return (
    <div className="mt-7 grid grid-cols-3 gap-3 max-w-lg">
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.value}
            className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-3 flex flex-col gap-1.5"
          >
            <Icon className="w-4 h-4 text-emerald-400" strokeWidth={2} />
            <div className="text-sm font-semibold text-white leading-tight">
              {s.value}
            </div>
            <div className="text-[11px] text-[#8f9f97] leading-snug">
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}