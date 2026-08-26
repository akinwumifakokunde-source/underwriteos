import React from "react";

const FLOW = ["AI recommendation", "Policy engine", "Final decision"];

export default function AiPolicy() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">
            AI assists. Your policy decides.
          </h2>
          <p className="mt-4 text-lg text-[#525965] leading-relaxed">
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
                    ? "border-[#99e6d8] bg-[#e6f7f3] text-[#0d9488]"
                    : "border-[#e5e7eb] bg-white text-[#0a0c12]"
                }`}
              >
                {f}
              </span>
              {i < FLOW.length - 1 && <span className="shrink-0 text-[#8a909c]">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}