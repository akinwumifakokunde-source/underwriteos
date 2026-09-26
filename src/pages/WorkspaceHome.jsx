import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, ScanLine, Scale, Check, X, FileText, ShieldCheck } from "lucide-react";
import Nav from "@/components/layout/Nav.jsx";

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
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: FOREST }}>
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-600 w-fit">Can you send your latest payslip?</div>
            <div className="rounded-lg px-2.5 py-1.5 text-[11px] text-white w-fit ml-auto" style={{ backgroundColor: FOREST }}>Sure — uploading now ✓</div>
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
          <span className="text-[10px] font-mono" style={{ color: FOREST }}>cited</span>
        </div>
        <div className="space-y-1.5 mb-2.5">
          <div className="h-1.5 rounded-full bg-slate-100 w-full" />
          <div className="h-1.5 rounded-full bg-slate-100 w-5/6" />
          <div className="h-1.5 rounded-full bg-slate-100 w-4/6" />
        </div>
        <div className="h-1.5 rounded-full w-2/3" style={{ backgroundColor: FOREST }} />
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-mono text-slate-400">SCORECARD</span>
        <span className="text-[10px] font-mono" style={{ color: FOREST }}>72 / 100</span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-[72%] rounded-full" style={{ backgroundColor: FOREST }} />
        <div className="absolute top-1/2 -translate-y-1/2 left-[72%] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 shadow" style={{ borderColor: FOREST }} />
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

export default function WorkspaceHome() {
  const navigate = useNavigate();
  const startLender = () => navigate("/applications");
  const startBorrower = () => navigate("/start/borrower?mode=borrower");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
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

          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="mt-7 flex justify-center">
            <button
              onClick={startLender}
              className="group inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-full shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ backgroundColor: FOREST }}
            >
              Start as the lender
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="show"
            className="mt-4 text-[11px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-slate-500"
          >
            Your underwriting workspace
          </motion.p>
        </div>

        {/* Underwriter workspace panel */}
        <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-20">
          <div className="rounded-2xl p-6 sm:p-10" style={{ backgroundColor: OFFWHITE }}>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-black dark:text-slate-50">The underwriter workspace</h2>
              <p className="mt-2 text-sm text-[#6B7280] dark:text-slate-400 max-w-xl mx-auto">
                Three API-ready modules. Use one or all three, fed by CreditDecide's application or your own intake.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              <div className="hidden lg:flex flex-col items-center justify-center px-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9ca3af] [writing-mode:vertical-rl] rotate-180">Loan files in</span>
              </div>

              {MODULES.map((m, i) => {
                const Icon = m.icon;
                return (
                  <React.Fragment key={m.title}>
                    <button
                      onClick={startLender}
                      className="group relative flex-1 text-left rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(11,61,33,0.25)]"
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                          <Icon className="w-4 h-4 text-white" />
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
                    </button>
                    {i < MODULES.length - 1 && (
                      <div className="flex items-center justify-center" style={{ color: FOREST }}>
                        <ArrowRight className="w-5 h-5 hidden lg:block" />
                        <ArrowRight className="w-5 h-5 lg:hidden rotate-90" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

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

      {/* Borrower experience */}
      <section className="border-t border-[#eceef1] dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="rounded-2xl p-6 sm:p-10" style={{ backgroundColor: OFFWHITE }}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-slate-50">The borrower experience</h2>
                <p className="mt-3 text-sm text-[#6B7280] dark:text-slate-400 max-w-xl leading-relaxed">
                  Guided intake that keeps applicants moving and gathers credit context while they apply. Automated follow-ups pull more information and keep borrowers informed — so fewer drop off.
                </p>
              </div>
              <button
                onClick={startBorrower}
                className="group inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border bg-white hover:shadow-md transition-all self-start sm:self-auto"
                style={{ color: FOREST, borderColor: `${FOREST}4D` }}
              >
                Start as the borrower
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-black dark:text-slate-50">AI-assisted application</h3>
                </div>
                <p className="text-[13px] text-[#6B7280] dark:text-slate-400 leading-relaxed mb-4">
                  Walks applicants through step by step, asking follow-ups in their own words.
                </p>
                <div className="rounded-lg border border-slate-200 bg-white p-4 flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className={`w-3 h-3 rounded-full ${i < 3 ? "" : "border-2 border-slate-300 bg-white"}`} style={i < 3 ? { backgroundColor: FOREST } : undefined} />
                        {i < 3 && <span className="w-px h-4 bg-slate-200" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 space-y-3 pt-0.5">
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: FOREST }} />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 rounded bg-slate-100 w-full" />
                      <div className="h-2.5 rounded bg-slate-100 w-3/4" />
                      <div className="h-6 rounded border border-slate-200 bg-slate-50 w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-black dark:text-slate-50">Borrower portal</h3>
                </div>
                <p className="text-[13px] text-[#6B7280] dark:text-slate-400 leading-relaxed mb-4">
                  Shows what's still outstanding and keeps nudging. Applicants know where they stand.
                </p>
                <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                  {[{ done: true }, { done: true }, { done: false }].map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {r.done ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: FOREST }}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2 rounded bg-slate-100 w-3/4" />
                        <div className="h-2 rounded bg-slate-100 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}