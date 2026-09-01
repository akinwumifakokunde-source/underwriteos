import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

// End-to-end animated underwriting flow, shown as a looping sequence.
// Purely presentational — no business logic.
//
// To avoid layout "shaking" during the reveal, the full skeleton is always
// rendered (space reserved up front) and only each row's content fades in
// via opacity. No mount/unmount, no vertical translate — so the card height
// never changes during the animation.

const RISK_DIMENSIONS = [
  { label: "Credit risk", flag: "pass", value: "712" },
  { label: "Affordability", flag: "fail", value: "DTI 48.2%" },
  { label: "Fraud", flag: "pass", value: "Clear" },
  { label: "Data quality", flag: "pass", value: "Verified" },
];

const POLICY_RULES = [
  { rule: "Annual income ≥ £40,000", result: "PASS" },
  { rule: "DTI ≤ 45%", result: "FAIL" },
  { rule: "Credit score ≥ 650", result: "PASS" },
];

// Ordered reveal sequence. Each entry maps to a section of the preview.
const SEQUENCE = [
  "borrower", "market", "sources_connect", "sources_connected",
  "risk_0", "risk_1", "risk_2", "risk_3",
  "policy_header", "policy_0", "policy_1", "policy_2",
  "ai", "policy_decision", "final",
];

const STEP_MS = 520;
const HOLD_MS = 2600;

function StatusIcon({ flag }) {
  if (flag === "pass") {
    return (
      <span className="w-4 h-4 rounded-full flex items-center justify-center bg-emerald-50">
        <Check className="w-2.5 h-2.5 text-emerald-600" />
      </span>
    );
  }
  return (
    <span className="w-4 h-4 rounded-full flex items-center justify-center bg-rose-50">
      <span className="text-rose-600 text-[10px] font-bold">!</span>
    </span>
  );
}

// Always-mounted, opacity-only fade. Keeps layout stable (no reflow).
function Fade({ show, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedProductPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const total = SEQUENCE.length;
    let timer;
    if (step < total) {
      timer = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    } else {
      timer = setTimeout(() => setStep(0), HOLD_MS);
    }
    return () => clearTimeout(timer);
  }, [step]);

  const visible = new Set(SEQUENCE.slice(0, step));
  const sourcesConnected = visible.has("sources_connected");
  const showPolicyHeader = visible.has("policy_header");

  return (
    <div className="w-full max-w-[480px]">
      <div className="rounded-2xl border border-[#e8eaee] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_20px_50px_-20px_rgba(10,12,18,0.15)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
          </div>
          <span className="text-[11px] font-mono text-[#8a909c] ml-2">Application #APP-10482</span>
          <span className="ml-auto text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">UNDER REVIEW</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#eceef1] overflow-x-auto no-scrollbar">
          {["Overview", "Financial Profile", "Risk Signals", "Evidence", "Audit Trail"].map((t, i) => (
            <button key={t} className={`shrink-0 text-[11px] px-2.5 py-1.5 rounded-t-md transition-colors ${i === 2 ? "text-[#0a0c12] font-medium border-b-2 border-[#0d9488]" : "text-[#8a909c] hover:text-[#525965]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content — full skeleton always rendered so height stays stable */}
        <div className="p-4 space-y-3 bg-gradient-to-b from-white to-[#fcfcfd]">
          {/* Borrower row */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#8a909c]">Borrower</span>
            <Fade show={visible.has("borrower")}>
              <span className="font-medium text-[#0a0c12]">John Smith</span>
            </Fade>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#8a909c]">Market</span>
            <Fade show={visible.has("market")}>
              <span className="font-medium text-[#0a0c12]">United Kingdom · £25,000</span>
            </Fade>
          </div>

          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#8a909c]">Data sources</span>
            <Fade show={visible.has("sources_connect")}>
              <span className="font-medium text-[#0d9488] flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${sourcesConnected ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
                {sourcesConnected ? "Experian · TrueLayer connected" : "Connecting Experian · TrueLayer…"}
              </span>
            </Fade>
          </div>

          {/* Risk dimensions */}
          <div className="pt-3 border-t border-[#eceef1]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-2.5">Risk dimensions</p>
            <div className="space-y-2">
              {RISK_DIMENSIONS.map((s, i) => (
                <div key={s.label} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <Fade show={visible.has(`risk_${i}`)}>
                      <StatusIcon flag={s.flag} />
                    </Fade>
                    <span className="text-[#0a0c12]">{s.label}</span>
                  </div>
                  <Fade show={visible.has(`risk_${i}`)}>
                    <span className="font-mono text-[#8a909c]">{s.value}</span>
                  </Fade>
                </div>
              ))}
            </div>
          </div>

          {/* Policy evaluation */}
          <div className="pt-3 border-t border-[#eceef1]">
            <Fade show={showPolicyHeader}>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-2.5">Policy: Consumer Lending v1</p>
            </Fade>
            <div className="space-y-1.5">
              {POLICY_RULES.map((r, i) => (
                <div key={r.rule} className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8a909c]">{r.rule}</span>
                  <Fade show={visible.has(`policy_${i}`)}>
                    <span className={`font-mono font-medium ${r.result === "PASS" ? "text-emerald-600" : "text-rose-600"}`}>{r.result}</span>
                  </Fade>
                </div>
              ))}
            </div>
          </div>

          {/* Decision */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#eceef1]">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#8a909c]">AI advisory</div>
              <Fade show={visible.has("ai")}>
                <div className="text-[13px] font-medium text-emerald-700">APPROVE</div>
              </Fade>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#8a909c]">Policy</div>
              <Fade show={visible.has("policy_decision")}>
                <div className="text-[13px] font-medium text-amber-700">REVIEW</div>
              </Fade>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#8a909c]">Final</div>
              <Fade show={visible.has("final")}>
                <div className="text-[13px] font-bold text-amber-700">REVIEW</div>
              </Fade>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#8a909c]">
        <Sparkles className="w-3 h-3 text-[#0d9488]" />
        Live workspace preview
      </div>
    </div>
  );
}