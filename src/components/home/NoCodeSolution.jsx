import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Plug, MessageSquare, FileDown } from "lucide-react";

const PROBLEMS = [
  { num: "01", title: "Data stays trapped in documents", desc: "Raw figures and risk signals sit locked inside messy documents legacy tools can't read." },
  { num: "02", title: "Files stay incomplete", desc: "Wrong documents, missing pages, round after round of messaging the borrower to chase what's missing." },
  { num: "03", title: "Underwriting stays manual", desc: "Reconciliation and memos written by hand. Hours per file before a single decision." },
];

const SOLUTION_POINTS = [
  { icon: Plug, title: "Live data sources", desc: "Connect credit bureaus and open banking per market — or upload documents. Either way works.", grad: "from-teal-400 to-emerald-500" },
  { icon: Shield, title: "Continuous assessment", desc: "Five risk dimensions — credit, affordability, fraud, data quality, policy — assessed as data arrives, not in batches.", grad: "from-sky-400 to-indigo-500" },
  { icon: MessageSquare, title: "AI underwriter + chat", desc: "Advisory AI recommendations and an in-context assistant. Your policy stays authoritative.", grad: "from-violet-400 to-purple-500" },
  { icon: FileDown, title: "Exports & audit trail", desc: "Download decisions as PDF, CSV, or Word. Every step is traceable to its source evidence.", grad: "from-amber-400 to-orange-500" },
];

export default function NoCodeSolution() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
        {/* Problem — numbered cards */}
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The problem</p>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12]">
            Legacy underwriting breaks in <span className="text-[#0d9488]">three places.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-12 sm:mb-20">
          {PROBLEMS.map((p) => (
            <div key={p.num} className="rounded-2xl border border-[#eceef1] bg-gradient-to-b from-white to-[#fcfcfd] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(10,12,18,0.14)]">
              <div className="text-2xl font-bold mb-3 bg-gradient-to-br from-[#0d9488] to-indigo-500 bg-clip-text text-transparent">{p.num}</div>
              <h3 className="text-base font-semibold text-[#0a0c12] mb-2">{p.title}</h3>
              <p className="text-[13px] text-[#525965] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Solution */}
        <div className="text-center mb-10">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The solution</p>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12]">
            One platform. <span className="text-[#0d9488]">End-to-end underwriting.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOLUTION_POINTS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="group rounded-2xl border border-[#eceef1] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5 text-white" />
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