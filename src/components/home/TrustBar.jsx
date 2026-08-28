import React from "react";

const MARKETS = ["GB", "US", "NG", "ZA", "KE", "GH"];

export default function TrustBar() {
  return (
    <section className="border-b border-[#eceef1] bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <p className="text-center text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-6">
          Built for lenders across six markets
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {MARKETS.map((m) => (
            <div key={m} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0d9488]" />
              <span className="text-sm font-semibold text-[#0a0c12] tracking-tight">{m}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[12px] font-mono text-[#8a909c]">
          <span>5 RISK DIMENSIONS</span>
          <span className="hidden sm:inline text-[#d0d3d8]">·</span>
          <span>EVIDENCE LINEAGE</span>
          <span className="hidden sm:inline text-[#d0d3d8]">·</span>
          <span>POLICY ENGINE</span>
          <span className="hidden sm:inline text-[#d0d3d8]">·</span>
          <span>AI UNDERWRITER</span>
        </div>
      </div>
    </section>
  );
}