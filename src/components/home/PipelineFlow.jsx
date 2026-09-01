import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, FileText, Wallet, Calculator, GitCompare, ShieldAlert,
  Brain, Scale, CheckCircle2, GitBranch, History, Check,
} from "lucide-react";

const STAGES = [
  {
    id: "overview", label: "Overview", icon: Eye,
    desc: "A single snapshot of the application — borrower, loan terms and underwriting readiness — so you always know exactly where a case stands.",
    points: ["Borrower identity, loan terms & product type", "Underwriting readiness checklist", "Live status across the entire pipeline"],
  },
  {
    id: "documents", label: "Documents", icon: FileText,
    desc: "Connect live data sources or upload files — credit reports, bank statements, identity and income proof — with automatic classification and quality checks.",
    points: ["Credit reports, bank statements & payslips", "Identity, address & employment proof", "Auto-classification & quality checks", "Upload or pull live via data sources"],
  },
  {
    id: "financial", label: "Financial Profile", icon: Wallet,
    desc: "Canonical income, expenses, assets and liabilities normalized from any provider into one comparable, currency-aware profile per market.",
    points: ["Income, expenses, assets & liabilities", "Provider-independent canonical model", "Monthly & annual figures normalized", "Currency-aware per market"],
  },
  {
    id: "affordability", label: "Affordability", icon: Calculator,
    desc: "Debt-to-income, disposable income and repayment capacity computed live from the normalized profile — the core of every lending decision.",
    points: ["Debt-to-income ratio", "Disposable income & repayment capacity", "Income-to-loan coverage", "Computed live from the profile"],
  },
  {
    id: "reconciliation", label: "Reconciliation", icon: GitCompare,
    desc: "Declared borrower data is cross-checked against source documents for consistency, surfacing discrepancies before they ever reach the decision.",
    points: ["Declared vs. source document cross-check", "Income & employment verification", "Inconsistency flags raised", "Confidence scoring per field"],
  },
  {
    id: "risk", label: "Risk", icon: ShieldAlert,
    desc: "Structured risk signals across credit, cashflow, affordability and fraud — each with severity, direction and a plain-English explanation.",
    points: ["Credit, cashflow, affordability & fraud", "Severity & direction per signal", "Policy thresholds attached", "Human-readable explanations"],
  },
  {
    id: "ai", label: "AI Underwriter", icon: Brain,
    desc: "An evidence-referenced memo with a recommendation, risk score and confidence — advisory only, never overriding lender policy.",
    points: ["Evidence-referenced reasoning memo", "Recommendation, risk score & confidence", "Probability of default estimate", "Positive signals and risk factors"],
  },
  {
    id: "policy", label: "Policy", icon: Scale,
    desc: "The deterministic policy engine evaluates every signal against your lender rules — the authoritative source of the final outcome.",
    points: ["Deterministic rule evaluation", "Versioned, never-overwrite policies", "Threshold-based outcomes", "Simulation before going live"],
  },
  {
    id: "decision", label: "Decision", icon: CheckCircle2,
    desc: "The final lender decision — approve, review or decline — with reasons, a full audit trail, and one-click export.",
    points: ["APPROVE / REVIEW / DECLINE", "Full audit trail & reasons", "Human review when required", "Export as PDF, CSV & Word"],
  },
  {
    id: "evidence", label: "Evidence", icon: GitBranch,
    desc: "Every risk signal traces back to its source document, field and page — complete provenance for regulators and auditors.",
    points: ["Every signal traces to its source", "Document, field & page level", "Calculation method recorded", "Full provenance for regulators"],
  },
  {
    id: "activity", label: "Activity", icon: History,
    desc: "An immutable audit log of every action across the application lifecycle — who did what, when, and through which interface.",
    points: ["Immutable audit log", "Every action timestamped", "Actor & endpoint tracked", "Full application lifecycle"],
  },
];

const STEP_MS = 2600;

export default function PipelineFlow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollerRef = useRef(null);
  const tabRefs = useRef([]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % STAGES.length);
    }, STEP_MS);
    return () => clearInterval(t);
  }, [paused]);

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
  const Icon = stage.icon;

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
        <div
          className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-2.5 sm:p-4 shadow-sm"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
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

        {/* Stage detail */}
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-12px_rgba(10,12,18,0.12)]"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#0c1120] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">Step {active + 1} of {STAGES.length}</span>
              </div>
              <h3 className="text-lg font-semibold text-[#0a0c12] mt-0.5">{stage.label}</h3>
              <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">{stage.desc}</p>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {stage.points.map((p) => (
                <div key={p} className="flex items-start gap-2">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-[#0d9488]/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#0d9488]" strokeWidth={3} />
                  </span>
                  <span className="text-[13px] text-[#3f4651] leading-snug">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}