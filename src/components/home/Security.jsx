import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import SectionBackdrop from "@/components/home/SectionBackdrop";

const ITEMS = [
  "Multi-jurisdiction policies (6 markets + Others)",
  "Organization-scoped access",
  "Live data source connections",
  "Immutable audit logging",
  "Versioned policies",
  "Cross-document reconciliation",
  "Provider credential isolation",
  "Human-in-the-loop overrides",
];

const GRADS = [
  "from-teal-400 to-emerald-500",
  "from-sky-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-fuchsia-400 to-purple-500",
  "from-lime-400 to-emerald-500",
];

export default function Security() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-950">
      <SectionBackdrop />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <p className="text-xs font-mono uppercase tracking-wider mb-4">
          <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
            Built for financial data
          </span>
        </p>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 max-w-2xl">
          Built for financial{" "}
          <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            decisioning.
          </span>
        </h2>

        <div className="mt-10 grid sm:grid-cols-2 gap-3 max-w-3xl">
          {ITEMS.map((it, i) => (
            <div key={it} className="group relative flex items-center gap-3 rounded-xl border border-[#eceef1] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#0d9488]/30">
              <span className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${GRADS[i % GRADS.length]} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${GRADS[i % GRADS.length]} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-sm font-medium text-[#0a0c12] dark:text-slate-50">{it}</span>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link to="/security" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] dark:text-slate-50 hover:text-[#0d9488] transition-colors">
            Security overview <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}