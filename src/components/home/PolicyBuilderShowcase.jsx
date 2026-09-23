import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, GripVertical } from "lucide-react";
import SectionBackdrop from "@/components/home/SectionBackdrop";

const RULES = [
  { field: "Annual income", op: "≥", value: "£40,000", outcome: "APPROVE", pass: true },
  { field: "Debt-to-income", op: "≤", value: "45%", outcome: "REVIEW", pass: false },
  { field: "Credit score", op: "≥", value: "650", outcome: "APPROVE", pass: true },
  { field: "Recent delinquency", op: "=", value: "0", outcome: "APPROVE", pass: true },
];

export default function PolicyBuilderShowcase() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-950">
      <SectionBackdrop />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-3">
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
                Policy builder
              </span>
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 mb-4">
              Configure your consumer lending policy{" "}
              <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                visually
              </span>
            </h2>
            <p className="text-[#525965] dark:text-slate-300 leading-relaxed mb-6">
              Add rules, set thresholds, and define outcomes — all without writing code.
              Your policy is the authoritative decision engine. The AI assists, but your rules decide.
            </p>
            <ul className="space-y-2.5 text-sm text-[#525965] dark:text-slate-300">
              {[
                "Add, edit, reorder, and delete rules visually",
                "AND / OR conditions with field selection",
                "Define APPROVE, REVIEW, or DECLINE outcomes",
                "Versioned policies — never overwrite an active version",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 mt-2 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <Link to="/policies" className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] dark:text-slate-50 hover:text-[#0d9488] transition-colors">
              Explore the policy builder <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="group relative rounded-2xl border border-[#e8eaee] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_12px_40px_-12px_rgba(10,12,18,0.12)] transition-all duration-500 hover:shadow-[0_24px_70px_-24px_rgba(13,148,136,0.3)] hover:-translate-y-1">
            <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-teal-400 via-indigo-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="px-5 py-4 border-b border-[#eceef1] dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50 via-white to-indigo-50 dark:from-teal-500/10 dark:via-slate-900 dark:to-indigo-500/10">
              <div>
                <div className="text-sm font-semibold text-[#0a0c12] dark:text-slate-50">Consumer Lending v1</div>
                <div className="text-[11px] text-[#8a909c] dark:text-slate-500">Active · 4 rules · v1.0</div>
              </div>
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5">ACTIVE</span>
            </div>
            <div className="p-4 space-y-2.5">
              {RULES.map((r, i) => (
                <div key={i} className="group flex flex-wrap items-center gap-2.5 rounded-xl border border-[#eceef1] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-800 px-3.5 py-3 transition-all duration-200 hover:bg-white dark:hover:bg-slate-700 hover:border-[#0d9488]/40 hover:shadow-sm hover:translate-x-0.5">
                  <GripVertical className="w-3.5 h-3.5 text-[#b0b5be] dark:text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0 flex items-center gap-2 text-[12px] flex-wrap">
                    <span className="font-medium text-[#0a0c12] dark:text-slate-50">{r.field}</span>
                    <span className="text-[#8a909c] dark:text-slate-500 font-mono">{r.op}</span>
                    <span className="font-mono text-[#0a0c12] dark:text-slate-50">{r.value}</span>
                  </div>
                  <span className={`text-[10px] font-medium rounded-full px-2.5 py-0.5 ${r.outcome === "APPROVE" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30" : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30"}`}>
                    {r.outcome}
                  </span>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-1.5 text-[12px] text-[#8a909c] dark:text-slate-400 hover:text-[#0a0c12] dark:hover:text-slate-50 rounded-xl border border-dashed border-[#d0d3d8] dark:border-slate-700 py-2.5 hover:bg-[#fafbfc] dark:hover:bg-slate-800 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add rule
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}