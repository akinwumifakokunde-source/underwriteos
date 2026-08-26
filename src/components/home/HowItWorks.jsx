import React from "react";

const STEPS = [
  {
    n: "01",
    title: "Ingest",
    body: "Create an application and provide borrower, credit, bank or document data.",
    endpoint: "POST /v1/applications",
  },
  {
    n: "02",
    title: "Analyze",
    body: "Normalize financial data and generate structured credit, cashflow, affordability and fraud signals.",
    endpoint: "POST /v1/applications/{id}/analyze",
  },
  {
    n: "03",
    title: "Decide",
    body: "Apply your versioned policy and return an explainable underwriting decision.",
    endpoint: "POST /v1/applications/{id}/underwrite",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">How it works</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12]">
          Three steps to a decision.
        </h2>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg border border-[#eceef1] bg-white p-6">
              <span className="text-xs font-mono text-[#8a909c]">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold text-[#0a0c12]">{s.title}</h3>
              <p className="mt-2 text-sm text-[#525965] leading-relaxed">{s.body}</p>
              <div className="mt-4 pt-4 border-t border-[#eceef1]">
                <code className="text-[12px] font-mono text-[#0d9488] break-all">{s.endpoint}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}