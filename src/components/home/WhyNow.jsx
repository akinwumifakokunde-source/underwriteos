import React from "react";
import { TrendingUp, Scale, BrainCircuit, Building2 } from "lucide-react";

const REASONS = [
  {
    icon: TrendingUp,
    title: "Open banking is now infrastructure",
    desc: "PSD2 and open-banking adoption turned bank data into an API. Lenders can pull live cashflow programmatically — but most decisioning stacks still can't consume it.",
  },
  {
    icon: BrainCircuit,
    title: "AI underwriting needs guardrails",
    desc: "Everyone wants AI in the loop, but regulators and credit committees demand explainable, auditable decisions. Black boxes don't pass review — evidence graphs do.",
  },
  {
    icon: Scale,
    title: "Regulation demands defensible decisions",
    desc: "FCA Consumer Duty and fair-lending scrutiny require lenders to show why a decision was made. Traceable evidence and policy versions are now a requirement, not a nice-to-have.",
  },
  {
    icon: Building2,
    title: "Legacy decision engines don't speak API",
    desc: "Incumbent credit platforms are on-prem, slow, and built for batch — not developer-first integration. There's an open lane for API-native underwriting infrastructure.",
  },
];

export default function WhyNow() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
      <div className="max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Why now
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          The pieces for API-native underwriting just fell into place.
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1c2029] rounded-2xl overflow-hidden border border-[#2a2f3a]">
        {REASONS.map((r) => (
          <div key={r.title} className="bg-[#13161f] p-6">
            <div className="w-9 h-9 rounded-lg bg-[#0a0c12] border border-[#2a2f3a] flex items-center justify-center mb-3.5">
              <r.icon className="w-4 h-4 text-[#00e6b8]" />
            </div>
            <h3 className="font-medium text-white mb-1.5">{r.title}</h3>
            <p className="text-sm text-[#a0a5b0] leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}