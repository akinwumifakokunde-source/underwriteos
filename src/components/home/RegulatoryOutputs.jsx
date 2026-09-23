import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ScrollText, FileSpreadsheet, FileJson, ShieldCheck } from "lucide-react";
import SectionBackdrop from "@/components/home/SectionBackdrop";

const OUTPUTS = [
  {
    icon: ScrollText,
    title: "Adverse-action notices",
    desc: "Market-specific letters addressed to the borrower, naming the credit bureau consulted and stating the applicant's rights.",
    tag: "PDF",
    grad: "from-teal-400 to-emerald-500",
  },
  {
    icon: FileSpreadsheet,
    title: "Reason codes",
    desc: "FCRA-style reason codes mapped from the negative and critical risk signals that drove the decision — capped to the four key factors.",
    tag: "CSV",
    grad: "from-sky-400 to-indigo-500",
  },
  {
    icon: FileJson,
    title: "Audit exports",
    desc: "The full decision with every risk signal and its evidence record, so an examiner can trace each figure to its source document.",
    tag: "JSON",
    grad: "from-amber-400 to-orange-500",
  },
];

export default function RegulatoryOutputs() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-950">
      <SectionBackdrop />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-mono uppercase tracking-wider mb-4">
          <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
            Compliance, automated
          </span>
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 max-w-2xl">
          Decision records, reason codes &amp;{" "}
          <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            configurable disclosures.
          </span>
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] dark:text-slate-300 leading-relaxed max-w-2xl">
          Generate decision records, reason codes, and configurable disclosures from the evidence behind each
          assessment — derived from the same data that informed the decision, not bolted on afterwards.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {OUTPUTS.map((o) => (
            <div key={o.title} className="group relative rounded-2xl border border-[#eceef1] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30">
              <span className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${o.grad} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${o.grad} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <o.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500 border border-[#eceef1] dark:border-slate-800 rounded px-1.5 py-0.5">{o.tag}</span>
              </div>
              <h3 className="text-base font-semibold text-[#0a0c12] dark:text-slate-50">{o.title}</h3>
              <p className="mt-2 text-sm text-[#525965] dark:text-slate-300 leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 group relative rounded-2xl border border-[#eceef1] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.2)]">
          <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-teal-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500">Built for any jurisdiction</p>
          </div>
          <p className="text-sm text-[#525965] dark:text-slate-300 leading-relaxed">
            Adverse-action notices, reason codes and audit exports are generated from the evidence graph —
            configurable to whatever consumer-credit framework your regulators require, in any country.
          </p>
        </div>

        <div className="mt-10">
          <Link to="/applications" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] dark:text-slate-50 hover:text-[#0d9488] transition-colors">
            See it in a decision <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}