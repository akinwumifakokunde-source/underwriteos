import React from "react";
import { Clock } from "lucide-react";

// Floating "underwriting slip" for the active market. Amount-first layout,
// tinted to harmonize with the forest-green hero backdrop.
// Remounts (via key) on market change so the slipIn animation replays.
const DECISION_STYLES = {
  APPROVE: "bg-[#b7f0d6] text-[#103527]",
  REVIEW: "bg-[#fde68a] text-[#78350f]",
  DECLINE: "bg-[#fca5a5] text-[#7f1d1d]",
};

export default function DecisionCard({ market }) {
  const pass = market.status === "PASS";
  return (
    <div
      key={market.code}
      className="animate-slipIn absolute bottom-3 right-1 sm:right-5 w-[268px] rounded-[18px] p-[17px] border border-[#1e2825] bg-[#0f1715] text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
    >
      {/* top: country + timer */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{market.flag}</span>
          <span className="text-[13px] font-semibold tracking-tight text-white">{market.name}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8fd4b0] bg-[#16221b] border border-[#2a3a30] px-2 py-1 rounded-full whitespace-nowrap">
          <Clock className="w-3 h-3" /> {market.timer}
        </span>
      </div>

      {/* amount row — hero number + decision pill */}
      <div className="flex items-center justify-between gap-2 pb-[13px] border-b border-[#1e2825]">
        <div>
          <div className="mb-[3px] text-[9px] font-mono uppercase tracking-[0.17em] text-[#6b8576]">LOAN</div>
          <div className="text-[25px] leading-[1.15] font-bold tracking-[-0.055em] text-white">{market.amount}</div>
        </div>
        <span className={`px-2.5 py-1.5 rounded-full text-[9px] font-extrabold tracking-[0.07em] whitespace-nowrap ${DECISION_STYLES[market.decision] || DECISION_STYLES.REVIEW}`}>
          {market.decision}
        </span>
      </div>

      {/* quiet metrics row */}
      <div className="flex justify-between gap-2 pt-[11px] text-[10px] text-[#a0aaa7]">
        <span>DSCR <strong className="font-semibold text-white">{market.dscr}</strong></span>
        <span><strong className="font-semibold text-white">{market.files} FILES</strong></span>
        <span><strong className="font-semibold text-white">{market.formats} FORMATS</strong></span>
      </div>

      {/* description */}
      <p className="mt-2.5 text-[11px] leading-[1.5] text-[#a0aaa7]">{market.desc}</p>

      {/* status pill */}
      <div className="mt-3 flex items-center justify-end">
        <span
          className={
            pass
              ? "px-2.5 py-[5px] rounded-full bg-[#b7f0d6] text-[#103527] text-[10px] font-extrabold tracking-[0.06em]"
              : "px-2.5 py-[5px] rounded-full bg-[#fde68a] text-[#78350f] text-[10px] font-extrabold tracking-[0.06em]"
          }
        >
          {market.status}
        </span>
      </div>
    </div>
  );
}