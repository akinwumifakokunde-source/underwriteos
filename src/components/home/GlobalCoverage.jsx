import React from "react";
import { Globe, FileText, DollarSign, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <section className="border-b border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Global coverage</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 max-w-2xl">
          Designed for multiple markets.
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
                className="group rounded-xl border border-[#eceef1] dark:border-slate-800 bg-gradient-to-br from-[#f7f8fa] to-white dark:from-slate-900 dark:to-slate-900 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30"
              >
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

        <div className="mt-6">
          <Link
            to="/pricing"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] dark:text-slate-50 hover:text-[#0d9488] transition-colors"
          >
            See pricing
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}