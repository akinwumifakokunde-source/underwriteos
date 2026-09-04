import React from "react";

const FLOW = ["Live data / docs", "Normalize", "Risk dimensions", "Policy", "Decision", "Evidence + export"];

const PROPS = [
  {
    title: "Bring your own data",
    body: "Use the credit bureau, banking and financial-data providers you already work with.",
  },
  {
    title: "Your policy decides",
    body: "AI can recommend. Your versioned policy remains authoritative.",
  },
  {
    title: "Every decision is traceable",
    body: "Every decision can be linked back to the policy, risk signal, evidence and source data behind it.",
    prominent: true,
  },
];

export default function Solution() {
  return (
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">The solution</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          One workspace for the entire underwriting layer.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          Connect live credit and bank data or upload documents — anywhere in the world. CreditDecide turns
          fragmented financial data into structured risk signals, reconciles it across sources, evaluates
          your policy and returns an explainable, exportable underwriting decision.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3">
          {FLOW.map((f, i) => (
            <React.Fragment key={f}>
              <span className="text-sm font-medium text-[#0a0c12] px-3 py-2 rounded-md border border-[#eceef1] bg-white">{f}</span>
              {i < FLOW.length - 1 && <span className="text-[#8a909c] text-sm">→</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {PROPS.map((p) => (
            <div
              key={p.title}
              className={`rounded-lg border p-6 ${p.prominent ? "border-[#0d9488]/30 bg-[#f0fbf8]" : "border-[#eceef1] bg-white"}`}
            >
              <h3 className="text-base font-semibold text-[#0a0c12] uppercase tracking-wide">{p.title}</h3>
              <p className="mt-2 text-sm text-[#525965] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}