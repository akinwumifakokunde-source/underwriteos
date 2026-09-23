import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, BrainCircuit, FileSearch } from "lucide-react";

const VALUE_PROPS = [
  { title: "No-code policies", desc: "Lender-controlled rules", icon: ShieldCheck, grad: "from-teal-400 to-emerald-500" },
  { title: "AI-assisted analysis", desc: "Evidence-backed insights", icon: BrainCircuit, grad: "from-violet-400 to-indigo-500" },
  { title: "Evidence-linked decisions", desc: "Reviewable and traceable", icon: FileSearch, grad: "from-amber-400 to-orange-500" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-950">
      {/* Colorful mesh backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 w-[34rem] h-[34rem] rounded-full bg-[#0d9488]/10 dark:bg-teal-500/10 blur-[120px]" />
        <div className="absolute top-10 right-[-10rem] w-[30rem] h-[30rem] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px]" />
        <div className="absolute bottom-[-12rem] left-1/3 w-[28rem] h-[28rem] rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:22px_22px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* Tag */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 text-[11px] font-medium text-[#00695c] dark:text-teal-300 mb-6 bg-white/70 dark:bg-teal-500/10 backdrop-blur border border-[#00695c]/15 dark:border-teal-500/20 rounded-full pl-1.5 pr-3 py-1 shadow-sm"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow">
            <Sparkles className="w-3 h-3" />
          </span>
          Credit infrastructure for consumer lenders
        </motion.div>

        {/* Headlines */}
        <motion.h1
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="show"
          className="text-[2.1rem] sm:text-[3.4rem] font-semibold tracking-tight text-black dark:text-slate-50 leading-[1.1] sm:leading-[1.05]"
        >
          Explainable credit decisions.
          <br />
          <span className="bg-gradient-to-r from-[#00796b] via-teal-500 to-emerald-500 dark:from-teal-300 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
            From application to collections.
          </span>
        </motion.h1>

        {/* Body */}
        <motion.p
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="show"
          className="mt-5 sm:mt-6 text-base sm:text-lg text-[#455a64] dark:text-slate-300 leading-relaxed max-w-2xl"
        >
          Automate borrower intake, assess income and affordability, and apply your own lending policies —
          with evidence-backed recommendations and decisions your team can review and control.
        </motion.p>

        {/* Feature cards */}
        <motion.div
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl"
        >
          {VALUE_PROPS.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 py-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30"
              >
                <span className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${v.grad} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${v.grad} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-black dark:text-slate-50 leading-tight">{v.title}</div>
                    <div className="text-[12px] text-[#78909c] dark:text-slate-400 mt-0.5 leading-snug">{v.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          custom={4}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        >
          <Link
            to="/onboarding"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-br from-[#0f172a] to-[#1e293b] dark:from-white dark:to-slate-200 dark:text-slate-900 px-5 py-3 rounded-full hover:shadow-[0_12px_30px_-8px_rgba(13,148,136,0.5)] transition-all hover:-translate-y-0.5"
          >
            Start building <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/features"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#101828] dark:text-slate-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-full hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:-translate-y-0.5"
          >
            See how it works <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Meta row */}
        <motion.div
          variants={fadeUp}
          custom={5}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-mono uppercase tracking-wider text-[#78909c] dark:text-slate-500"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Consumer credit first
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Instalment &amp; POS
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Evidence-led decisions
          </span>
        </motion.div>
      </div>
    </section>
  );
}