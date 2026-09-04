import React from "react";
import { ArrowRight, Database, FileSearch, Brain, Shield, GitBranch, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: Database, label: "Data sources", desc: "Connect live credit & bank data, or upload documents", grad: "from-teal-400 to-emerald-500" },
  { icon: FileSearch, label: "Normalization", desc: "Canonical financial profile per market", grad: "from-sky-400 to-indigo-500" },
  { icon: Brain, label: "5 risk dimensions", desc: "Credit · Affordability · Fraud · Data quality · Policy", grad: "from-violet-400 to-purple-500" },
  { icon: Shield, label: "Policy evaluation", desc: "Your rules produce the authoritative decision", grad: "from-amber-400 to-orange-500" },
  { icon: GitBranch, label: "Decision + export", desc: "APPROVE / REVIEW / DECLINE — export as PDF, CSV, Word", grad: "from-rose-400 to-pink-500" },
];

export default function WorkflowSection() {
  return (
    <section className="border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
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
                <div className="group flex-1 rounded-2xl border border-[#eceef1] bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mx-auto mb-3 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-1">Step {i + 1}</div>
                  <div className="text-sm font-semibold text-[#0a0c12] mb-1">{s.label}</div>
                  <div className="text-[11px] text-[#8a909c] leading-snug">{s.desc}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center text-[#0d9488] shrink-0">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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