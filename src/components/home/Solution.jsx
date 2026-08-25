import React from "react";

const FLOW = ["Borrower data", "UnderwriteOS", "Normalize", "Risk signals", "Policy", "Decision"];

export default function Solution() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> The solution
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            One API for the underwriting layer.
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {FLOW.map((f, i) => (
            <React.Fragment key={f}>
              <span
                className={`shrink-0 rounded-lg border px-3.5 py-2 font-mono text-xs ${
                  f === "UnderwriteOS"
                    ? "border-[#1f3a36] bg-[#0c1715] text-[#00e6b8]"
                    : "border-[#2a2f3a] bg-[#13161f] text-white"
                }`}
              >
                {f}
              </span>
              {i < FLOW.length - 1 && <span className="shrink-0 text-[#5b6472]">→</span>}
            </React.Fragment>
          ))}
        </div>

        <p className="mt-8 text-lg text-[#a0a5b0] leading-relaxed max-w-2xl">
          Your application stays yours. UnderwriteOS handles the underwriting infrastructure.
        </p>
      </div>
    </section>
  );
}