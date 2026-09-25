import React from "react";
import { FileText, Clock } from "lucide-react";

// Floating glassmorphism "underwriting slip" for the active market. Remounts
// (via key) on market change so the slipIn animation replays each time.
export default function DecisionCard({ market }) {
  const pass = market.status === "PASS";
  return (
    <div
      key={market.code}
      className="animate-slipIn absolute bottom-3 right-1 sm:right-5 w-[248px] rounded-2xl p-4 backdrop-blur-md border border-emerald-400/20 bg-[#0e261a]/70 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-lg leading-none">{market.flag}</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" /> {market.timer}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex -space-x-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-7 h-9 rounded-md bg-emerald-900/60 border border-emerald-400/30 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-emerald-300/70" />
            </div>
          ))}
        </div>
        <div className="text-[10px] leading-tight">
          <div className="font-semibold text-white">{market.files} FILES</div>
          <div className="text-emerald-300/70">{market.formats} FORMATS</div>
        </div>
      </div>

      <p className="text-[11px] text-emerald-100/70 leading-relaxed mb-3">{market.desc}</p>

      <div className="flex items-end justify-between border-t border-emerald-400/15 pt-2.5">
        <div className="text-[10px] text-emerald-100/55 leading-snug">
          <div>{market.decision}</div>
          <div className="text-white font-bold text-sm tracking-tight">{market.amount}</div>
          <div>DSCR {market.dscr}</div>
        </div>
        <span
          className={
            pass
              ? "text-[10px] font-bold text-[#0e261a] bg-emerald-400 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              : "text-[10px] font-bold text-amber-900 bg-amber-300 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.5)]"
          }
        >
          {market.status}
        </span>
      </div>
    </div>
  );
}