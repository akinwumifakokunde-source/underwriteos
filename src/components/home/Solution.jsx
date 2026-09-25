import React from "react";
import { Plug, ShieldCheck, MessageSquare, FileOutput } from "lucide-react";

const TEAL = "#00A884";

const SOLUTIONS = [
  {
    icon: Plug,
    color: "#00C853",
    title: "Live data sources",
    body: "Connect credit bureaus and open banking per market — or upload documents. Either way works.",
  },
  {
    icon: ShieldCheck,
    color: "#2979FF",
    title: "Continuous assessment",
    body: "Five risk dimensions — credit, affordability, fraud, data quality, policy — assessed as data arrives, not in batches.",
  },
  {
    icon: MessageSquare,
    color: "#AA00FF",
    title: "AI underwriter + chat",
    body: "AI assists with analysis and explanations. Your policies govern outcomes, and authorised people handle exceptions.",
  },
  {
    icon: FileOutput,
    color: "#FF9100",
    title: "Exports & audit trail",
    body: "Download decisions as PDF, CSV, or Word. Every step is traceable to its source evidence.",
  },
];

export default function Solution() {
  return (
    <section className="relative bg-white dark:bg-slate-950 border-b border-[#eceef1] dark:border-slate-800">
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-mono uppercase tracking-[0.2em] mb-5" style={{ color: TEAL }}>
          The solution
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-[2.9rem] font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 max-w-3xl leading-[1.1]">
          One platform.{" "}
          <span style={{ color: TEAL }}>End-to-end underwriting.</span>
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#525965] dark:text-slate-400 leading-relaxed max-w-2xl">
          Connect live credit and bank data or upload documents — anywhere in the world.
          CreditDecide turns fragmented financial data into structured risk signals,
          reconciles it across sources, evaluates your policy and returns an explainable,
          exportable underwriting decision.
        </p>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {SOLUTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-[#eceef1] dark:border-slate-800 p-7 sm:p-8 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.18)] hover:-translate-y-1 hover:shadow-[0_22px_50px_-20px_rgba(15,23,42,0.22)] transition-all duration-300"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${s.color}1a` }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-[#0a0c12] dark:text-slate-50 tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-3 text-[14px] text-[#525965] dark:text-slate-400 leading-relaxed">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}