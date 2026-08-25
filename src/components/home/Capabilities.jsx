import React from "react";

const CAPS = [
  {
    n: "01",
    title: "Normalize",
    desc: "Turn credit, bank and document data into a consistent financial and credit profile.",
    ref: "POST /v1/applications/{id}/credit-report",
  },
  {
    n: "02",
    title: "Analyze",
    desc: "Generate structured risk signals across credit, cashflow and affordability.",
    ref: "POST /v1/applications/{id}/analyze",
  },
  {
    n: "03",
    title: "Decide",
    desc: "Apply your policy and return an explainable decision with evidence.",
    ref: "POST /v1/applications/{id}/underwrite",
  },
];

export default function Capabilities() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1c2029] rounded-2xl overflow-hidden border border-[#2a2f3a]">
          {CAPS.map((c) => (
            <div key={c.n} className="bg-[#0a0c12] p-6 sm:p-8 flex flex-col">
              <span className="font-mono text-xs text-[#5b6472]">{c.n}</span>
              <h3 className="mt-3 text-xl font-semibold text-white">{c.title}</h3>
              <p className="mt-2 text-[15px] text-[#a0a5b0] leading-relaxed flex-1">{c.desc}</p>
              <code className="mt-5 text-[12px] font-mono text-[#00e6b8] bg-[#0c1715] border border-[#1f3a36] rounded px-2.5 py-1.5 inline-block w-fit">
                {c.ref}
              </code>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}