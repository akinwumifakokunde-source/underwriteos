import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Plug, MessageSquare, FileDown } from "lucide-react";

const PROBLEM_POINTS = [
  "Building underwriting logic from scratch takes months",
  "Connecting credit bureaus and bank data requires engineering resources",
  "Risk teams can't adjust policies without developer help",
  "Decisions are hard to explain and audit",
];

const SOLUTION_POINTS = [
  { icon: Plug, title: "Live data sources", desc: "Connect credit bureaus and open banking per market — or upload documents. Either way works." },
  { icon: Shield, title: "Continuous assessment", desc: "Five risk dimensions — credit, affordability, fraud, data quality, policy — assessed as data arrives, not in batches." },
  { icon: MessageSquare, title: "AI underwriter + chat", desc: "Advisory AI recommendations and an in-context assistant. Your policy stays authoritative." },
  { icon: FileDown, title: "Exports & audit trail", desc: "Download decisions as PDF, CSV, or Word. Every step is traceable to its source evidence." },
];

export default function NoCodeSolution() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The problem</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12]">Underwriting shouldn't require an engineering team</h2>
          <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {PROBLEM_POINTS.map((p) => (
              <div key={p} className="flex items-center gap-2.5 text-sm text-[#525965] text-left rounded-xl border border-[#eceef1] bg-[#fafbfc] px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-10">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The solution</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12]">A complete underwriting platform, no code needed</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOLUTION_POINTS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="group rounded-2xl border border-[#eceef1] bg-white p-6 transition-all hover:shadow-[0_4px_24px_-8px_rgba(10,12,18,0.1)] hover:border-[#d0d3d8]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#f7f8fa] to-[#f0f1f4] border border-[#eceef1] flex items-center justify-center mb-4 group-hover:from-[#0d9488]/10 group-hover:to-[#0d9488]/5 group-hover:border-[#0d9488]/20 transition-colors">
                  <Icon className="w-5 h-5 text-[#0d9488]" />
                </div>
                <h3 className="text-sm font-semibold text-[#0a0c12] mb-1.5">{s.title}</h3>
                <p className="text-[13px] text-[#525965] leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link to="/onboarding" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            See how it works <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}