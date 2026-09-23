import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import WorkspacePreview from "@/components/home/WorkspacePreview";

const VALUE_PROPS = [
  { title: "Intake to collections", desc: "The full credit lifecycle" },
  { title: "Explainable AI", desc: "Evidence-backed decisions" },
  { title: "Any market", desc: "Multi-currency, global reach" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800">
      {/* Calm gradient backdrop with slow drifting light */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f3f8f6] via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
      <motion.div
        aria-hidden
        className="absolute -top-24 left-[8%] w-[460px] h-[460px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(13,148,136,0.16), transparent 65%)" }}
        animate={{ x: [0, 30, 0], y: [0, 18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute top-16 right-[2%] w-[400px] h-[400px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 65%)" }}
        animate={{ x: [0, -24, 0], y: [0, 22, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.35), transparent)" }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <motion.div
              variants={fadeUp}
              custom={0}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] dark:text-teal-300 mb-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur border border-[#0d9488]/20 dark:border-teal-500/20 rounded-full pl-1.5 pr-3 py-1 shadow-sm"
            >
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0d9488]/15">
                <Sparkles className="w-2.5 h-2.5 text-[#0d9488]" />
              </span>
              Credit infrastructure for consumer lenders
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="show"
              className="text-[2.1rem] sm:text-[3.4rem] font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 leading-[1.1] sm:leading-[1.05]"
            >
              Explainable underwriting,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#0d9488] to-[#0ea5b7] bg-clip-text text-transparent">decided your way.</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#0d9488]/30 to-transparent" />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="show"
              className="mt-5 sm:mt-6 text-base sm:text-lg text-[#525965] dark:text-slate-300 leading-relaxed max-w-xl"
            >
              Automate intake and KYC, assess income and affordability, and return evidence-backed APPROVE / REVIEW / DECLINE
              decisions under your own policies — then track collections and calibrate the loop. No code.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate="show"
              className="mt-7 grid grid-cols-3 gap-3 max-w-md"
            >
              {VALUE_PROPS.map((v) => (
                <div key={v.title} className="rounded-xl border border-[#eceef1] dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur px-3 py-2.5">
                  <div className="text-[12px] font-semibold text-[#0a0c12] dark:text-slate-50">{v.title}</div>
                  <div className="text-[11px] text-[#8a909c] dark:text-slate-400 mt-0.5 leading-snug">{v.desc}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <Link
                to="/onboarding"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] dark:bg-white dark:text-slate-900 px-5 py-3 rounded-full hover:bg-[#1c1f26] dark:hover:bg-slate-100 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Start underwriting <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/features"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] dark:text-slate-50 bg-white dark:bg-slate-900 border border-[#e6e8eb] dark:border-slate-700 px-5 py-3 rounded-full hover:bg-[#f7f8fa] dark:hover:bg-slate-800 hover:border-[#d0d3d8] dark:hover:border-slate-600 transition-all"
              >
                See how it works <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={5}
              initial="hidden"
              animate="show"
              className="mt-10 sm:mt-8 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500"
            >
              <span>Consumer credit first</span>
              <span className="text-[#d0d3d8] dark:text-slate-700">·</span>
              <span>Instalment &amp; POS</span>
              <span className="text-[#d0d3d8] dark:text-slate-700">·</span>
              <span>Full evidence lineage</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center md:justify-end"
          >
            <WorkspacePreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}