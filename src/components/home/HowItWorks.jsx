import React from "react";
import { Upload, ScanSearch, Gavel } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Ingest",
    desc: "Submit borrower data, or auto-pull credit reports from Experian and bank statements via TrueLayer. Provider differences disappear at the edge.",
    tag: "POST /v1/applications",
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "Analyze",
    desc: "The risk engine derives credit, cashflow, affordability, and fraud signals — each one traceable to its source and confidence score.",
    tag: "POST /v1/applications/{id}/analyze",
  },
  {
    icon: Gavel,
    step: "03",
    title: "Decide",
    desc: "Versioned lender policy produces the authoritative decision. The AI recommends; your policy decides. Full audit trail included.",
    tag: "POST /v1/applications/{id}/underwrite",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
      <div className="max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> How it works
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          From raw data to defensible decision in three calls.
        </h2>
        <p className="mt-4 text-[#a0a5b0] leading-relaxed">
          A single, opinionated pipeline. Ingest any provider's data, let the engine derive structured signals, and
          let your policy return the final call.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1c2029] rounded-2xl overflow-hidden border border-[#2a2f3a]">
        {STEPS.map((s) => (
          <div key={s.step} className="bg-[#13161f] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#0a0c12] border border-[#2a2f3a] flex items-center justify-center">
                <s.icon className="w-5 h-5 text-[#00e6b8]" />
              </div>
              <span className="text-xs font-mono text-[#5b6472]">{s.step}</span>
            </div>
            <h3 className="font-medium text-white mb-1.5">{s.title}</h3>
            <p className="text-sm text-[#a0a5b0] leading-relaxed flex-1">{s.desc}</p>
            <code className="mt-4 text-[11px] font-mono text-[#00e6b8] bg-[#0a0c12] border border-[#2a2f3a] rounded px-2.5 py-1.5 inline-block w-fit">
              {s.tag}
            </code>
          </div>
        ))}
      </div>
    </section>
  );
}