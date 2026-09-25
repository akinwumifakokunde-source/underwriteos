import React from "react";
import { Check } from "lucide-react";
import CtaPair from "@/components/home/CtaPair.jsx";
import SectionBackdrop from "@/components/home/SectionBackdrop";

const FEATURES = [
  {
    title: "No-code policy builder",
    desc: "Add rules, set thresholds and define APPROVE / REVIEW / DECLINE outcomes visually — no engineering required.",
    grad: "from-teal-400 to-emerald-500",
  },
  {
    title: "AI-assisted risk analysis",
    desc: "An evidence-graph underwriter turns credit, banking and document data into structured, explainable risk signals.",
    grad: "from-sky-400 to-indigo-500",
  },
  {
    title: "Full evidence lineage",
    desc: "Every signal traces back to its source field, so any decision can be explained down to the document line.",
    grad: "from-violet-400 to-purple-500",
  },
  {
    title: "Automated adverse-action & reason codes",
    desc: "Declines and reviews generate the disclosures and reason codes your regulators expect, straight from the evidence.",
    grad: "from-amber-400 to-orange-500",
  },
  {
    title: "Closed-loop outcome calibration",
    desc: "Record loan outcomes and compare them against predicted default to keep your models honest over time.",
    grad: "from-rose-400 to-pink-500",
  },
  {
    title: "Batch / portfolio underwriting",
    desc: "Upload a CSV of applicants and underwrite the whole portfolio concurrently, with per-application results.",
    grad: "from-cyan-400 to-blue-500",
  },
  {
    title: "Multi-jurisdiction policies",
    desc: "Run different policies per product and market from one workspace, with versioning that never overwrites a live version.",
    grad: "from-fuchsia-400 to-purple-500",
  },
  {
    title: "White-label borrower forms",
    desc: "Publish branded intake forms that collect KYC and documents, and drop straight into your underwriting pipeline.",
    grad: "from-lime-400 to-emerald-500",
  },
  {
    title: "REST API + webhooks from day one",
    desc: "Embed underwriting into your own product with a clean API, or listen for decisions via webhooks as they happen.",
    grad: "from-emerald-400 to-teal-500",
  },
  {
    title: "Live in hours, not quarters",
    desc: "Connect your data, configure your policy and return decisions the same day — no lengthy implementation project.",
    grad: "from-indigo-400 to-blue-500",
  },
];

export default function CompetitiveComparison() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950">
      <SectionBackdrop />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500" />
            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Why CreditDecide
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              underwrite consumer credit
            </span>
          </h2>
          <p className="mt-3 text-[15px] text-[#525965] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            One evidence-native platform — no code, fully auditable, live in hours — for consumer lenders in any market, worldwide.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-teal-300 dark:hover:border-teal-500/40"
            >
              <span className={`absolute top-0 left-5 right-5 h-px bg-gradient-to-r ${f.grad} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${f.grad} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <h3 className="mt-3.5 text-sm font-semibold text-[#0a0c12] dark:text-slate-50">{f.title}</h3>
              <p className="mt-1.5 text-[13px] text-[#525965] dark:text-slate-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <CtaPair className="mt-8" />
      </div>
    </section>
  );
}