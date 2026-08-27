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
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The continuous underwriting loop</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#0a0c12]">
            From live data to decision — in one continuous workspace
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.label}>
                <div className="flex-1 rounded-xl border border-[#eceef1] bg-white p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] border border-[#eceef1] flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-[#0d9488]" />
                  </div>
                  <div className="text-sm font-semibold text-[#0a0c12] mb-1">{s.label}</div>
                  <div className="text-[11px] text-[#8a909c] leading-snug">{s.desc}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex items-center justify-center text-[#b0b5be] shrink-0">
                    <ArrowRight className="w-4 h-4 hidden sm:block rotate-90 sm:rotate-0" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#525965]">
          <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
          Every step is auditable and traceable to source data
        </div>
      </div>
    </section>
  );
}