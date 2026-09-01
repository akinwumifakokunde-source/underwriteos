import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, Paperclip, ArrowRight, FileText, Brain, ShieldCheck, Workflow } from "lucide-react";

// kita.ai-style hero preview: pill tabs + a two-pane "live workspace" —
// a conversational document-collection chat on the left and a borrower-file
// checklist sidebar with a completeness bar on the right. Presentational only.

const TABS = [
  { id: "documents", label: "Documents", icon: FileText },
  { id: "risk", label: "Risk Signals", icon: ShieldCheck },
  { id: "underwriter", label: "AI Underwriter", icon: Brain },
  { id: "decision", label: "Decision", icon: Workflow },
];

const CHAT = [
  { from: "borrower", text: "Here are my last 3 months of bank statements." },
  { from: "ai", text: "Got it — average monthly deposits £3,420 extracted. I flagged 1 missed payment on your credit file for review." },
  { from: "borrower", text: "Can you include my payslip too?" },
  { from: "ai", text: "Done — annual income verified at £48,000. Borrower file is 78% complete." },
];

const CHECKLIST = [
  { label: "borrower", done: true },
  { label: "channel", done: true },
  { label: "loan_request", done: true },
  { label: "documents", done: true },
  { label: "credit_report", done: true },
  { label: "affordability", done: false },
];

const DWELL_MS = 4200;

export default function WorkspacePreview() {
  const [active, setActive] = useState(0); // "Documents" — matches the collection chat content
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % TABS.length), DWELL_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="w-full max-w-[520px]">
      <div
        className="rounded-2xl border border-[#e8eaee] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_28px_64px_-28px_rgba(10,12,18,0.22)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Pill tabs */}
        <div className="flex items-center gap-1.5 px-3 pt-3 overflow-x-auto no-scrollbar">
          {TABS.map((t, i) => {
            const isActive = i === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className="relative shrink-0 text-[10px] font-medium px-2.5 py-1.5 rounded-full border transition-colors"
                style={isActive ? { borderColor: "#0c1120" } : { borderColor: "#e8eaee" }}
              >
                {isActive && (
                  <motion.span
                    layoutId="hero-pill"
                    className="absolute inset-0 rounded-full bg-[#0c1120]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-white" : "text-[#525965]"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Two-pane workspace */}
        <div className="grid grid-cols-5 border-t border-[#eceef1]">
          {/* Chat pane */}
          <div className="col-span-3 p-3.5 border-r border-[#eceef1] bg-gradient-to-b from-white to-[#fcfcfd]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[8px] font-mono uppercase tracking-wider text-[#0d9488] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" /> Live · Document collection
              </span>
              <span className="text-[8px] font-mono text-[#8a909c]">3m 12s</span>
            </div>

            <div className="space-y-2.5">
              {CHAT.map((m, i) => {
                const isBorrower = m.from === "borrower";
                return (
                  <div key={i} className={`flex items-start gap-2 ${isBorrower ? "" : "flex-row-reverse"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0 ${
                      isBorrower ? "bg-slate-100 text-slate-600" : "bg-[#0d9488] text-white"
                    }`}>
                      {isBorrower ? "JS" : "CD"}
                    </span>
                    <div className={`max-w-[78%] rounded-xl px-2.5 py-1.5 text-[11px] leading-snug ${
                      isBorrower ? "bg-white border border-[#eceef1] text-[#3f4651]" : "bg-[#0c1120] text-white"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attachment chip */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#eceef1] bg-white px-2 py-1.5">
              <Paperclip className="w-3 h-3 text-[#0d9488]" />
              <span className="text-[10px] font-medium text-[#0a0c12]">chase-statements.zip</span>
              <span className="text-[9px] text-[#8a909c]">· 3 files</span>
            </div>
          </div>

          {/* Checklist sidebar */}
          <div className="col-span-2 p-3.5 bg-[#fafbfc]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-mono uppercase tracking-wider text-[#8a909c]">File · APP-10482</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#0a0c12]">Borrower file</span>
              <span className="text-[10px] font-mono text-[#0d9488]">6 of 7</span>
            </div>

            <div className="space-y-1.5">
              {CHECKLIST.map((c) => (
                <div key={c.label} className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#525965]">{c.label}</span>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.done ? "bg-emerald-500" : "bg-slate-300"}`} />
                    {c.done ? (
                      <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-slate-300" />
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Completeness bar */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-mono uppercase tracking-wider text-[#8a909c]">File completeness</span>
                <span className="text-[9px] font-mono text-[#0a0c12]">78%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-[#0d9488] rounded-full" style={{ width: "78%" }} />
              </div>
            </div>

            {/* Footer status */}
            <div className="mt-3 space-y-1 text-[9px] text-[#525965]">
              <div className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} /> Identity verified</div>
              <div className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} /> 3 docs collected</div>
              <div className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> 1 pending</div>
            </div>

            {/* Hand-off link */}
            <div className="mt-3 pt-2.5 border-t border-[#eceef1] flex items-center justify-end gap-1 text-[10px] font-medium text-[#0d9488]">
              Hand off to AI Underwriter <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#8a909c]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
        Live workspace preview
      </div>
    </div>
  );
}