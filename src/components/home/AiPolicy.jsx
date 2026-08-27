import React from "react";

const FLOW = ["Borrower data", "Risk analysis", "AI recommendation", "Policy engine", "Final decision"];

export default function AiPolicy() {
  return (
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">AI with guardrails</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          AI assists. Your policy decides.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          UnderwriteOS can generate an AI underwriting recommendation with risk factors, positive
          signals and reasoning. Your versioned policy remains authoritative.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3">
          {FLOW.map((f, i) => (
            <React.Fragment key={f}>
              <span
                className={`text-sm font-medium px-3 py-2 rounded-md border ${
                  f === "AI recommendation"
                    ? "text-[#0d9488] border-[#0d9488]/30 bg-[#e6f7f3]"
                    : f === "Policy engine"
                    ? "text-[#0a0c12] border-[#0a0c12]/20 bg-white"
                    : "text-[#0a0c12] border-[#eceef1] bg-white"
                }`}
              >
                {f}
              </span>
              {i < FLOW.length - 1 && <span className="text-[#8a909c] text-sm">→</span>}
            </React.Fragment>
          ))}
        </div>

        <p className="mt-6 text-sm text-[#8a909c] max-w-2xl">
          The AI recommendation is advisory. The authoritative decision is produced by the configured
          underwriting policy.
        </p>
      </div>
    </section>
  );
}