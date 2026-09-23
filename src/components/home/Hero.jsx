import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const VALUE_PROPS = [
  { title: "No-code policies", desc: "Lender-controlled rules" },
  { title: "AI-assisted analysis", desc: "Evidence-backed insights" },
  { title: "Evidence-linked decisions", desc: "Reviewable and traceable" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-950">
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* Tag */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 text-[11px] font-medium text-[#00695c] dark:text-teal-300 mb-6 bg-[#e0f2f1] dark:bg-teal-500/10 border border-[#00695c]/15 dark:border-teal-500/20 rounded-full pl-1.5 pr-3 py-1"
        >
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#00695c]/10 dark:bg-teal-500/15">
            <Sparkles className="w-2.5 h-2.5 text-[#00695c] dark:text-teal-300" />
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
          <span className="text-[#00796b] dark:text-teal-400">From application to collections.</span>
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
          className="mt-8 grid grid-cols-3 gap-3 max-w-2xl"
        >
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3.5">
              <div className="text-sm font-semibold text-black dark:text-slate-50">{v.title}</div>
              <div className="text-[12px] text-[#78909c] dark:text-slate-400 mt-1 leading-snug">{v.desc}</div>
            </div>
          ))}
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
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#101828] dark:bg-white dark:text-slate-900 px-5 py-3 rounded-lg hover:bg-[#1c2536] dark:hover:bg-slate-100 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Start building <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/features"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#101828] dark:text-slate-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
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
          <span>Consumer credit first</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>Instalment &amp; POS</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>Evidence-led decisions</span>
        </motion.div>
      </div>
    </section>
  );
}