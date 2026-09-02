import React from "react";
import { Brain, ShieldCheck, FileSearch, UserCheck, GitBranch, ClipboardCheck, LineChart } from "lucide-react";

const FLOW = [
  { icon: ShieldCheck, label: "Policy-first decisions", desc: "Lender policy is evaluated before any AI recommendation — the AI never silently overrides policy." },
  { icon: FileSearch, label: "Evidence provenance", desc: "Every risk signal traces back to its source document, field, and confidence score through the evidence graph." },
  { icon: Brain, label: "Explainable recommendations", desc: "Recommendations ship with a referenced memo — positive signals, risk factors, and the policy outcome that informed them." },
  { icon: UserCheck, label: "Human review", desc: "Signals that breach policy thresholds route to a human underwriter for review before a final decision is made." },
  { icon: GitBranch, label: "Override reasons", desc: "When a final decision differs from the recommendation or policy, an override reason is required and recorded." },
  { icon: ClipboardCheck, label: "Audit trail", desc: "Every decision — automated or human — is logged with actor, timestamp, policy version, and outcome." },
  { icon: LineChart, label: "Outcome monitoring", desc: "Post-decision outcomes feed back into calibration, so policies and models improve against real repayment behaviour." },
];

export default function ResponsibleAIGovernance() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
      <div className="rounded-2xl border border-[#eceef1] bg-gradient-to-b from-[#fcfcfd] to-white p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d9488] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Responsible AI &amp; underwriting governance
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          AI that shows its work — not just its answer.
        </h2>
        <p className="mt-4 text-base text-[#525965] leading-relaxed max-w-2xl">
          Because CreditDecide supports credit decisions, every recommendation is policy-first, evidence-referenced,
          and fully auditable. No black-box overrides.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FLOW.map((f, i) => (
            <div key={f.label} className="relative rounded-xl border border-[#eceef1] bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-lg bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-center shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-[#0d9488]" />
                </span>
                <span className="text-[10px] font-mono text-[#8a909c]">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="text-sm font-medium text-[#0a0c12]">{f.label}</h3>
              <p className="mt-1 text-xs text-[#525965] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <figure className="mt-8 rounded-xl border-l-2 border-[#0d9488] bg-[#f7faf9] px-5 py-4">
          <blockquote className="text-base sm:text-lg text-[#0a0c12] leading-relaxed font-medium">
            “AI shouldn't just make a decision. It should show why the decision was made, what evidence supported it,
            which policy was applied, and who ultimately approved or overrode it.”
          </blockquote>
          <figcaption className="mt-2 text-xs text-[#8a909c]">CreditDecide · Responsible underwriting principle</figcaption>
        </figure>
      </div>
    </section>
  );
}