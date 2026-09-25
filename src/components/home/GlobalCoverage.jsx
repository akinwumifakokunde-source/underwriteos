import React from "react";
import { Globe, FileText, DollarSign, Shield } from "lucide-react";
import CtaPair from "@/components/home/CtaPair.jsx";
import SectionBackdrop from "@/components/home/SectionBackdrop";

const CAPABILITIES = [
  {
    icon: Globe,
    title: "Any country",
    desc: "Upload borrower documents in any format — no local bureau or open-banking provider required.",
    grad: "from-teal-400 to-emerald-500",
  },
  {
    icon: DollarSign,
    title: "Any currency",
    desc: "Decide in your local currency or USD. Set currency defaults per product and market.",
    grad: "from-sky-400 to-indigo-500",
  },
  {
    icon: Shield,
    title: "Your own policy & KYC",
    desc: "Configure underwriting rules and identity requirements to match each market you serve.",
    grad: "from-violet-400 to-purple-500",
  },
  {
    icon: FileText,
    title: "Bring your own data",
    desc: "Connect the credit bureaus and open-banking providers you already use, or upload documents.",
    grad: "from-amber-400 to-orange-500",
  },
];

export default function GlobalCoverage() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-950">
      <SectionBackdrop />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-mono uppercase tracking-wider mb-4">
          <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
            Global coverage
          </span>
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 max-w-2xl">
          Designed for{" "}
          <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            multiple markets.
          </span>
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] dark:text-slate-300 leading-relaxed max-w-2xl">
          Configure your own lending policies, identity requirements, currencies, and data providers — with
          the same structured risk signals, evidence lineage and explainable decision in every currency.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group relative rounded-xl border border-[#eceef1] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30"
              >
                <span className={`absolute top-0 left-5 right-5 h-px bg-gradient-to-r ${c.grad} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.grad} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#0a0c12] dark:text-slate-50">{c.title}</h3>
                    <p className="mt-1 text-[13px] text-[#525965] dark:text-slate-300 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <CtaPair className="mt-6" />
      </div>
    </section>
  );
}