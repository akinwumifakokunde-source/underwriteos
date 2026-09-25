import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, ScanLine, Scale, Check, X } from "lucide-react";

const FOREST = "#0B3D21";
const OFFWHITE = "#F8F9F7";

const MODULES = [
  {
    icon: MessageSquare,
    title: "AI Credit Officer",
    sub: "Chases borrowers on SMS, email and chat.",
    badge: "Against your eligibility rules",
    footer: "A COMPLETE FILE",
    graphic: "chat",
  },
  {
    icon: ScanLine,
    title: "CreditDecide Capture",
    sub: "Extracts credit signal cited to the source.",
    badge: "Flags inconsistencies",
    footer: "CITED CREDIT DATA",
    graphic: "doc",
  },
  {
    icon: Scale,
    title: "AI Underwriting Assistant",
    sub: "Spreads the financials and drafts the memo.",
    badge: "Against your credit policy",
    footer: "FILLS IN A SCORECARD",
    graphic: "score",
  },
];

function ModuleGraphic({ kind }) {
  if (kind === "chat") {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-[#0B3D21] flex items-center justify-center shrink-0">
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-600 w-fit">
              Can you send your latest payslip?
            </div>
            <div className="rounded-lg bg-[#0B3D21] px-2.5 py-1.5 text-[11px] text-white w-fit ml-auto">
              Sure — uploading now ✓
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (kind === "doc") {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-slate-400">P.2</span>
          <span className="text-[10px] font-mono text-[#0B3D21]">cited</span>
        </div>
        <div className="space-y-1.5 mb-2.5">
          <div className="h-1.5 rounded-full bg-slate-100 w-full" />
          <div className="h-1.5 rounded-full bg-slate-100 w-5/6" />
          <div className="h-1.5 rounded-full bg-slate-100 w-4/6" />
        </div>
        <div className="h-1.5 rounded-full bg-[#0B3D21] w-2/3" />
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-mono text-slate-400">SCORECARD</span>
        <span className="text-[10px] font-mono text-[#0B3D21]">72 / 100</span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-[72%] bg-[#0B3D21] rounded-full" />
        <div className="absolute top-1/2 -translate-y-1/2 left-[72%] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0B3D21] shadow" />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px]">
        <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="w-3 h-3" /> Approve</span>
        <span className="inline-flex items-center gap-1 text-slate-400"><X className="w-3 h-3" /> Decline</span>
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Hero({ onStart }) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-10 text-center">
        <motion.h1
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="show"
          className="text-[2rem] sm:text-[3.1rem] font-semibold tracking-tight text-black dark:text-slate-50 leading-[1.08]"
        >
          CreditDecide's AI credit assessment stack,
          <br />
          from origination to decision.
        </motion.h1>

        <motion.div
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="show"
          className="mt-7 flex justify-center"
        >
          {onStart ? (
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-full shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ backgroundColor: FOREST }}
            >
              Start as the lender
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <Link
              to="/applications"
              className="group inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-full shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ backgroundColor: FOREST }}
            >
              Start as the lender
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </motion.div>

        <motion.p
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="show"
          className="mt-4 text-[11px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-slate-500"
        >
          No sign-up · 4 minutes
        </motion.p>
      </div>

      {/* Underwriter workspace panel */}
      <motion.div
        variants={fadeUp}
        custom={3}
        initial="hidden"
        animate="show"
        className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-20"
      >
        <div className="rounded-2xl p-6 sm:p-10" style={{ backgroundColor: OFFWHITE }}>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-black dark:text-slate-50">The underwriter workspace</h2>
            <p className="mt-2 text-sm text-[#6B7280] dark:text-slate-400 max-w-xl mx-auto">
              Three API-ready modules. Use one or all three, fed by CreditDecide's application or your own intake.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            {/* Left label */}
            <div className="hidden lg:flex flex-col items-center justify-center px-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9ca3af] [writing-mode:vertical-rl] rotate-180">Loan files in</span>
            </div>

            {MODULES.map((m, i) => {
              const Icon = m.icon;
              return (
                <React.Fragment key={m.title}>
                  <div className="group relative flex-1 rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(11,61,33,0.25)]">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0B3D21" }}>
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-black dark:text-slate-50">{m.title}</h3>
                    </div>
                    <p className="text-[13px] text-[#6B7280] dark:text-slate-400 leading-relaxed">{m.sub}</p>
                    <span className="mt-3 inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "#E8F5E9", color: "#1B5E20" }}>
                      {m.badge}
                    </span>
                    <ModuleGraphic kind={m.graphic} />
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9ca3af]">{m.footer}</span>
                    </div>
                  </div>
                  {i < MODULES.length - 1 && (
                    <div className="flex items-center justify-center text-[#0B3D21]">
                      <ArrowRight className="w-5 h-5 hidden lg:block" />
                      <ArrowRight className="w-5 h-5 lg:hidden rotate-90" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Right label */}
            <div className="hidden lg:flex flex-col items-center justify-center px-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9ca3af] [writing-mode:vertical-rl] rotate-180">Your decision</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono uppercase tracking-[0.18em] text-[#9ca3af] lg:hidden">
            <span>Loan files in</span>
            <span>→</span>
            <span>Your decision</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}