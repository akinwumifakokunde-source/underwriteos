import React from "react";

const FLOW = ["Borrower data", "Normalize", "Risk signals", "Policy", "Decision", "Evidence"];

const PROPS = [
  {
    title: "Bring your own data",
    body: "Use your existing credit bureau, open-banking and financial-data providers.",
  },
  {
    title: "Your policy decides",
    body: "AI can recommend. Your versioned policy remains authoritative.",
  },
  {
    title: "Every decision is traceable",
    body: "Risk signals link back to the evidence that produced them.",
  },
];

export default function Solution() {
  return (
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">The solution</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          One API for the underwriting layer.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          Send borrower and application data. UnderwriteOS turns fragmented financial data into
          structured risk signals, evaluates your policy and returns an explainable underwriting result.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-2 sm:gap-3">
          {FLOW.map((f, i) => (
            <React.Fragment key={f}>
              <span className="text-sm font-medium text-[#0a0c12] px-3 py-2 rounded-md border border-[#eceef1] bg-white">{f}</span>
              {i < FLOW.length - 1 && <span className="text-[#8a909c] text-sm">→</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {PROPS.map((p) => (
            <div key={p.title} className="rounded-lg border border-[#eceef1] bg-white p-6">
              <h3 className="text-base font-semibold text-[#0a0c12]">{p.title}</h3>
              <p className="mt-2 text-sm text-[#525965] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}