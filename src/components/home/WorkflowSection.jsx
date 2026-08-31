import React from "react";
import { ArrowRight, Database, FileSearch, Brain, Shield, GitBranch, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: Database, label: "Data sources", desc: "Connect live credit & bank data, or upload documents" },
  { icon: FileSearch, label: "Normalization", desc: "Canonical financial profile per market" },
  { icon: Brain, label: "5 risk dimensions", desc: "Credit · Affordability · Fraud · Data quality · Policy" },
  { icon: Shield, label: "Policy evaluation", desc: "Your rules produce the authoritative decision" },
  { icon: GitBranch, label: "Decision + export", desc: "APPROVE / REVIEW / DECLINE — export as PDF, CSV, Word" },
];

export default function WorkflowSection() {
  return (
    <section className="border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The continuous underwriting loop</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12]">
            From live data to decision — in one continuous workspace
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.label}>
                <div className="flex-1 rounded-2xl border border-[#eceef1] bg-white p-5 text-center shadow-sm transition-all hover:shadow-[0_4px_24px_-8px_rgba(10,12,18,0.1)] hover:border-[#d0d3d8]">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#f7f8fa] to-[#f0f1f4] border border-[#eceef1] flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-[#0d9488]" />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-1">Step {i + 1}</div>
                  <div className="text-sm font-semibold text-[#0a0c12] mb-1">{s.label}</div>
                  <div className="text-[11px] text-[#8a909c] leading-snug">{s.desc}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center text-[#b0b5be] shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[#525965]">
          <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
          Every step is auditable and traceable to source data
        </div>
      </div>
    </section>
  );
}