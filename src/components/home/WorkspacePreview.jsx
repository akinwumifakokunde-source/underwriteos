import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ShieldAlert, Brain, CheckCircle2, Check, AlertTriangle,
  TrendingUp, TrendingDown, Download,
} from "lucide-react";

// Richer, kita.ai-style hero preview: a tabbed "live workspace" card that
// auto-advances through detailed views with a slide animation. Purely
// presentational — no business logic.

const TABS = [
  { id: "application", label: "Application", icon: FileText },
  { id: "risk", label: "Risk Signals", icon: ShieldAlert },
  { id: "ai", label: "AI Underwriter", icon: Brain },
  { id: "decision", label: "Decision", icon: CheckCircle2 },
];

const DOCS = [
  { ok: true, name: "Loan Application", file: "app-form.pdf", field: "Requested", value: "£25,000" },
  { ok: true, name: "Bank Statements", file: "statements.pdf", field: "Avg balance", value: "£3,420" },
  { ok: true, name: "Payslip", file: "payslip-may.pdf", field: "Annual income", value: "£48,000" },
  { ok: false, name: "Credit Report", file: "experian.pdf", field: "Score", value: "712",
    note: "1 missed payment in the last 6 months flagged for review." },
];

const RISKS = [
  { label: "Credit risk", value: "712", state: "good" },
  { label: "Affordability", value: "DTI 48.2%", state: "warn" },
  { label: "Fraud", value: "Clear", state: "good" },
  { label: "Data quality", value: "Verified", state: "good" },
];

const RULES = [
  { rule: "Annual income ≥ £40,000", result: "PASS" },
  { rule: "DTI ≤ 45%", result: "FAIL" },
  { rule: "Credit score ≥ 650", result: "PASS" },
];

const POSITIVES = ["Stable employment (2+ yrs)", "Verified income £48,000", "Clean fraud profile"];
const FACTORS = ["DTI 48.2% above 45% threshold", "1 recent missed payment"];

const DWELL_MS = 4800;

function Dot({ state }) {
  if (state === "good") {
    return (
      <span className="w-4 h-4 rounded-full flex items-center justify-center bg-emerald-50 shrink-0">
        <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="w-4 h-4 rounded-full flex items-center justify-center bg-amber-50 shrink-0">
      <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
    </span>
  );
}

function Badge({ children, tone = "amber" }) {
  const tones = {
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    green: "text-emerald-700 bg-emerald-50 border-emerald-200",
  };
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[8px] font-mono uppercase tracking-wider text-[#8a909c]">{label}</div>
      <div className="text-[11px] font-medium text-[#0a0c12] mt-0.5">{value}</div>
    </div>
  );
}

function ApplicationTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-[#0a0c12]">John Smith</div>
          <div className="text-[11px] text-[#8a909c] mt-0.5">Personal Loan · United Kingdom</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-base font-semibold text-[#0a0c12]">£25,000</div>
          <div className="mt-1 flex justify-end"><Badge>Needs review</Badge></div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-1.5">
          <span className="text-[#0a0c12] border-b-2 border-[#0d9488] pb-0.5">Application materials</span>
          <span className="text-[#8a909c]">3 accepted · 1 review</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-[#0d9488] rounded-full" style={{ width: "75%" }} />
        </div>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-2">Document checklist · 3 of 4</div>
        <div className="space-y-1.5">
          {DOCS.map((d) => (
            <div
              key={d.name}
              className={`rounded-lg border p-2 ${d.ok ? "border-[#eceef1] bg-white" : "border-amber-200 bg-amber-50/60"}`}
            >
              <div className="flex items-center gap-2">
                <Dot state={d.ok ? "good" : "warn"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-[#0a0c12] truncate">{d.name}</span>
                    <Badge tone={d.ok ? "green" : "amber"}>{d.ok ? "Accepted" : "Review"}</Badge>
                  </div>
                  <div className="text-[9px] text-[#8a909c] mt-0.5 truncate">{d.file} · {d.field}: {d.value}</div>
                  {d.note ? <p className="text-[9px] text-amber-700 mt-1 leading-snug">{d.note}</p> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskTab() {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#0a0c12]">Risk Signals</div>
          <div className="text-[11px] text-[#8a909c] mt-0.5">4 dimensions · 1 needs attention</div>
        </div>
        <ShieldAlert className="w-4 h-4 text-[#0d9488]" />
      </div>

      <div className="space-y-2">
        {RISKS.map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-xl border border-[#eceef1] bg-white px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <Dot state={r.state} />
              <span className="text-[12px] font-medium text-[#0a0c12]">{r.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#525965]">{r.value}</span>
              <Badge tone={r.state === "good" ? "green" : "amber"}>{r.state === "good" ? "Pass" : "Review"}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5 flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-700 leading-snug">1 signal exceeds policy threshold — triggers human review before decisioning.</p>
      </div>
    </div>
  );
}

function AiTab() {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#0a0c12]">AI Underwriting Memo</div>
          <div className="text-[11px] text-[#8a909c] mt-0.5">Evidence-referenced · advisory only</div>
        </div>
        <Brain className="w-4 h-4 text-[#0d9488]" />
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">Recommendation</div>
          <div className="text-lg font-semibold text-emerald-700 mt-0.5">APPROVE</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">Confidence</div>
          <div className="text-lg font-semibold text-[#0a0c12] mt-0.5">86%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-[#eceef1] bg-white px-2.5 py-2 text-center">
          <div className="text-[8px] font-mono uppercase tracking-wider text-[#8a909c]">Risk score</div>
          <div className="text-sm font-semibold text-[#0a0c12] mt-0.5">72<span className="text-[10px] text-[#8a909c]">/100</span></div>
        </div>
        <div className="rounded-lg border border-[#eceef1] bg-white px-2.5 py-2 text-center">
          <div className="text-[8px] font-mono uppercase tracking-wider text-[#8a909c]">Prob. default</div>
          <div className="text-sm font-semibold text-[#0a0c12] mt-0.5">4.8%</div>
        </div>
        <div className="rounded-lg border border-[#eceef1] bg-white px-2.5 py-2 text-center">
          <div className="text-[8px] font-mono uppercase tracking-wider text-[#8a909c]">Confidence</div>
          <div className="text-sm font-semibold text-[#0a0c12] mt-0.5">86%</div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-1.5 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-600" /> Positive signals
        </div>
        <div className="space-y-1">
          {POSITIVES.map((p) => (
            <div key={p} className="flex items-center gap-2 text-[11px] text-[#3f4651]">
              <Check className="w-3 h-3 text-emerald-600 shrink-0" strokeWidth={3} /> {p}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-1.5 flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-amber-600" /> Risk factors
        </div>
        <div className="space-y-1">
          {FACTORS.map((f) => (
            <div key={f} className="flex items-center gap-2 text-[11px] text-[#3f4651]">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" /> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DecisionTab() {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#0a0c12]">Decision</div>
          <div className="text-[11px] text-[#8a909c] mt-0.5">Policy: Consumer Lending v1</div>
        </div>
        <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-2">Policy evaluation</div>
        <div className="space-y-1.5">
          {RULES.map((r, i) => (
            <motion.div
              key={r.rule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 300, damping: 24 }}
              className="flex items-center justify-between text-[11px] rounded-lg border border-[#eceef1] bg-white px-3 py-2"
            >
              <span className="text-[#525965]">{r.rule}</span>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.08, type: "spring", stiffness: 420, damping: 16 }}
                className={`font-mono font-semibold ${r.result === "PASS" ? "text-emerald-600" : "text-rose-600"}`}
              >
                {r.result}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: "AI advisory", value: "APPROVE", cls: "border-[#eceef1] bg-white", vcls: "text-emerald-700", bold: false },
          { label: "Policy", value: "REVIEW", cls: "border-amber-200 bg-amber-50/60", vcls: "text-amber-700", bold: false },
          { label: "Final", value: "REVIEW", cls: "border-2 border-amber-300 bg-amber-50", vcls: "text-amber-700", bold: true, active: true },
        ].map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
            className={`relative rounded-xl border ${b.cls} px-2.5 py-2.5 text-center`}
          >
            <div className="text-[8px] font-mono uppercase tracking-wider text-[#8a909c]">{b.label}</div>
            <div className={`text-[13px] ${b.bold ? "font-bold" : "font-semibold"} ${b.vcls} mt-1`}>{b.value}</div>
            {b.active && (
              <motion.div
                className="absolute -inset-px rounded-xl border-2 border-amber-300 pointer-events-none"
                animate={{ opacity: [0.9, 0.25, 0.9], scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8a909c] pt-1">
        <Download className="w-3 h-3" /> Export as PDF · CSV · Word
      </div>
    </div>
  );
}

const TAB_CONTENT = {
  application: ApplicationTab,
  risk: RiskTab,
  ai: AiTab,
  decision: DecisionTab,
};

export default function WorkspacePreview() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % TABS.length), DWELL_MS);
    return () => clearInterval(t);
  }, [paused]);

  const ActiveContent = TAB_CONTENT[TABS[active].id];

  return (
    <div className="w-full max-w-[560px]">
      <div
        className="rounded-2xl border border-[#e8eaee] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_24px_60px_-24px_rgba(10,12,18,0.18)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
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
        <div className="flex items-center gap-1 px-3 pt-3 border-b border-[#eceef1] overflow-x-auto no-scrollbar">
          {TABS.map((t, i) => {
            const Icon = t.icon;
            const isActive = i === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={`relative shrink-0 flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-t-md transition-colors ${
                  isActive ? "text-[#0a0c12] font-medium" : "text-[#8a909c] hover:text-[#525965]"
                }`}
              >
                <Icon className="w-3 h-3" />
                {t.label}
                {isActive && (
                  <motion.div
                    layoutId="hero-tab-underline"
                    className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#0d9488] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Sliding content */}
        <div className="p-4 bg-gradient-to-b from-white to-[#fcfcfd] min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <ActiveContent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(i)}
              aria-label={t.label}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-[#0d9488]" : "w-1.5 bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#8a909c]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
        Live workspace preview
      </div>
    </div>
  );
}