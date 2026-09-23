import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionBackdrop from "@/components/home/SectionBackdrop";

const LINEAGE = ["Decision", "Policy evaluation", "Risk signal", "Evidence", "Source field"];
const NODE_GRADS = [
  "from-teal-400 to-emerald-500",
  "from-sky-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
];

export default function Evidence() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-950">
      <SectionBackdrop />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-mono uppercase tracking-wider mb-4">
          <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
            Explainable by design
          </span>
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 max-w-2xl">
          Every decision has a{" "}
          <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            traceable reason.
          </span>
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] dark:text-slate-300 leading-relaxed max-w-2xl">
          Every underwriting decision is linked to the policy, risk signals, evidence and source data
          behind it — and cross-document reconciliation flags inconsistencies automatically.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="group relative rounded-2xl border border-[#eceef1] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.2)]">
            <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-teal-400 via-indigo-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500 mb-5">Decision lineage</p>
            <div className="space-y-2">
              {LINEAGE.map((l, i) => (
                <React.Fragment key={l}>
                  <div className={`text-sm font-medium text-white px-3.5 py-2.5 rounded-lg bg-gradient-to-r ${NODE_GRADS[i]} shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-md`}>{l}</div>
                  {i < LINEAGE.length - 1 && <div className="text-[#0d9488] text-xs pl-3.5">↓</div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="group relative rounded-2xl border border-[#eceef1] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.2)]">
            <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-amber-400 via-teal-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500 mb-5">Example</p>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965] dark:text-slate-300">Decision</span>
                <span className="text-sm font-mono font-semibold text-[#b45309] dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-full px-2.5 py-0.5">REVIEW</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965] dark:text-slate-300">Risk signal</span>
                <span className="text-sm text-[#0a0c12] dark:text-slate-50">High debt-to-income</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965] dark:text-slate-300">Metric</span>
                <span className="text-sm font-mono text-[#0a0c12] dark:text-slate-50">DTI 48.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965] dark:text-slate-300">Source</span>
                <span className="text-sm text-[#0a0c12] dark:text-slate-50">Bank statement</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965] dark:text-slate-300">Evidence</span>
                <span className="text-sm font-mono text-[#0a0c12] dark:text-slate-50">Transactions · May 1 – Jul 31</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link to="/evidence" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] dark:text-slate-50 hover:text-[#0d9488] transition-colors">
            Open evidence explorer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}