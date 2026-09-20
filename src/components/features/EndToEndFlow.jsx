import React from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  FileScan,
  Workflow,
  ShieldAlert,
  SlidersHorizontal,
  Gavel,
  Activity,
  ArrowRight,
} from "lucide-react";

const STAGES = [
  {
    icon: ClipboardList,
    title: "Borrower Intake",
    detail: "White-label forms & API create applications in seconds.",
    to: "/features/lending-policies",
  },
  {
    icon: FileScan,
    title: "Document Intelligence",
    detail: "Classify, extract and verify borrower documents.",
    to: "/features/document-intelligence",
  },
  {
    icon: Workflow,
    title: "Data Normalization",
    detail: "Canonical financial & credit profiles, provider-independent.",
    to: "/features/ai-underwriting",
  },
  {
    icon: ShieldAlert,
    title: "Risk Assessment",
    detail: "Five dimensions of structured, explainable signals.",
    to: "/features/risk-assessment",
  },
  {
    icon: SlidersHorizontal,
    title: "Policy Evaluation",
    detail: "Your versioned rules, simulated before activation.",
    to: "/features/lending-policies",
  },
  {
    icon: Gavel,
    title: "Decision",
    detail: "APPROVE / REVIEW / DECLINE with full evidence lineage.",
    to: "/features/credit-decisioning",
  },
  {
    icon: Activity,
    title: "Monitoring",
    detail: "Track outcomes against predicted default over time.",
    to: "/features/explainable-decisions",
  },
];

export default function EndToEndFlow() {
  return (
    <section className="relative overflow-hidden border-y border-[#eceef1] bg-gradient-to-b from-[#f6fbf9] via-white to-white">
      <div className="absolute top-0 left-1/3 w-[420px] h-[420px] bg-[#0d9488]/10 rounded-full blur-3xl" />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-4 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> End-to-end flow
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] leading-tight">
            One pipeline, from intake to decision
          </h2>
          <p className="mt-4 text-base text-[#525965] leading-relaxed">
            CreditDecide carries every application through the same governed path — each step traceable to the
            next, every decision explainable back to its source.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="relative">
                <Link
                  to={s.to}
                  className="group h-full flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-[#0d9488]/10 text-[#0d9488] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-mono text-[#9aa3af]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#0a0c12]">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] text-[#525965] leading-relaxed">{s.detail}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-teal-600">
                    Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}