import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MousePointerClick, Shield, GitBranch, FileSearch } from "lucide-react";

const PROBLEM_POINTS = [
  "Building underwriting logic from scratch takes months",
  "Connecting credit bureaus and bank data requires engineering resources",
  "Risk teams can't adjust policies without developer help",
  "Decisions are hard to explain and audit",
];

const SOLUTION_POINTS = [
  { icon: MousePointerClick, title: "No-code policy builder", desc: "Create lending rules visually — no programming required." },
  { icon: FileSearch, title: "Document intelligence", desc: "Upload bank statements and credit reports. Data is extracted automatically." },
  { icon: Shield, title: "AI-assisted analysis", desc: "AI identifies risk factors and recommends a decision. Your policy decides." },
  { icon: GitBranch, title: "Full traceability", desc: "Every decision traces back to the source data through evidence." },
];

export default function NoCodeSolution() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The problem</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#0a0c12]">Underwriting shouldn't require an engineering team</h2>
          <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {PROBLEM_POINTS.map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm text-[#525965] text-left rounded-lg border border-[#eceef1] bg-[#fafbfc] px-3 py-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-10">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The solution</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#0a0c12]">A complete underwriting platform, no code needed</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOLUTION_POINTS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-xl border border-[#eceef1] bg-white p-5">
                <div className="w-9 h-9 rounded-lg bg-[#f7f8fa] border border-[#eceef1] flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5 text-[#0d9488]" />
                </div>
                <h3 className="text-sm font-semibold text-[#0a0c12] mb-1">{s.title}</h3>
                <p className="text-[13px] text-[#525965] leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/onboarding" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            See how it works <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}