import React from "react";

const FLOW = ["AI recommendation", "Policy engine", "Final decision"];

export default function AiPolicy() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            AI assists. Your policy decides.
          </h2>
          <p className="mt-4 text-lg text-[#a0a5b0] leading-relaxed">
            UnderwriteOS can generate an AI underwriting recommendation, but the lender's versioned policy remains
            authoritative.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {FLOW.map((f, i) => (
            <React.Fragment key={f}>
              <span
                className={`shrink-0 rounded-lg border px-3.5 py-2 font-mono text-xs ${
                  f === "Policy engine"
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
      </div>
    </section>
  );
}