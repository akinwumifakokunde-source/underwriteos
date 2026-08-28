import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STAGES = [
  { id: "overview", label: "Overview", desc: "Application snapshot — borrower, loan terms, and underwriting readiness at a glance." },
  { id: "documents", label: "Documents", desc: "Connect data sources or upload files — credit reports, bank statements, identity, income." },
  { id: "financial", label: "Financial Profile", desc: "Canonical income, expenses, assets and liabilities normalized from any provider." },
  { id: "affordability", label: "Affordability", desc: "Debt-to-income, disposable income and repayment capacity computed live." },
  { id: "reconciliation", label: "Reconciliation", desc: "Declared data cross-checked against source documents for consistency." },
  { id: "risk", label: "Risk", desc: "Structured risk signals across credit, cashflow, affordability and fraud." },
  { id: "ai", label: "AI Underwriter", desc: "Evidence-referenced memo with a recommendation, risk score and confidence." },
  { id: "policy", label: "Policy", desc: "Deterministic policy engine evaluates every signal against lender rules." },
  { id: "decision", label: "Decision", desc: "Final lender decision — approve, review, or decline — with a full audit trail." },
  { id: "evidence", label: "Evidence", desc: "Every signal traces back to its source document for complete provenance." },
  { id: "activity", label: "Activity", desc: "Immutable audit log of every action across the application lifecycle." },
];

const STEP_MS = 1800;

export default function PipelineFlow() {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef(null);
  const tabRefs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % STAGES.length);
    }, STEP_MS);
    return () => clearInterval(t);
  }, []);

  // Keep the active tab in view on mobile (horizontal scroller)
  useEffect(() => {
    const el = tabRefs.current[active];
    if (el && scrollerRef.current) {
      const sc = scrollerRef.current;
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      sc.scrollTo({ left: elLeft - (sc.clientWidth - elWidth) / 2, behavior: "smooth" });
    }
  }, [active]);

  const stage = STAGES[active];

  return (
    <section className="py-16 pb-20 sm:py-24 sm:pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0d9488] bg-[#0d9488]/10 rounded-full px-3 py-1">
            End-to-end flow
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12]">
            One workspace, the full underwriting journey
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto px-2">
            Every application moves through the same auditable pipeline — from intake to final decision.
          </p>
        </div>

        {/* Tab bar */}
        <div className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-2.5 sm:p-4 shadow-sm">
          <div ref={scrollerRef} className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {STAGES.map((s, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <div
                  key={s.id}
                  ref={(el) => (tabRefs.current[i] = el)}
                  className="relative shrink-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="pipeline-pill"
                      className="absolute inset-0 rounded-lg bg-[#0c1120]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <div
                    className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium whitespace-nowrap transition-colors duration-300 ${
                      isActive ? "text-white" : isDone ? "text-[#344054]" : "text-[#344054]/70"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors duration-300 ${
                        isActive ? "bg-white/20 text-white" : isDone ? "bg-[#0d9488]/15 text-[#0d9488]" : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress rail */}
        <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full bg-[#0d9488]"
            animate={{ width: `${((active + 1) / STAGES.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {/* Stage description */}
        <div className="mt-6 min-h-[64px]">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0c1120] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{active + 1}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0a0c12]">{stage.label}</div>
              <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">{stage.desc}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}