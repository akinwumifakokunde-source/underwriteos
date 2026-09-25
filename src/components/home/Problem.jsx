import React from "react";

const FOREST = "#0B3D21";
const TEAL = "#00A884";
const BLUE = "#007BFF";

const PROBLEMS = [
  {
    n: "01",
    title: "Data stays trapped in documents",
    body: "Raw figures and hundreds of risk signals sit locked inside messy documents legacy tools can't read.",
  },
  {
    n: "02",
    title: "Files stay incomplete",
    body: "Wrong documents, missing pages, round after round of messaging the borrower to chase what's missing.",
  },
  {
    n: "03",
    title: "Underwriting stays manual",
    body: "Reconciliation and memos written by hand. Hours per file before a single decision.",
  },
];

export default function Problem() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-[#eceef1] dark:border-slate-800">
      {/* pale blue-teal radial glow, top-left */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 18% 8%, rgba(224,247,250,0.7), transparent 70%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-mono uppercase tracking-[0.2em] mb-5" style={{ color: TEAL }}>
          The problem
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-[2.9rem] font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 max-w-3xl leading-[1.1]">
          Legacy underwriting breaks in{" "}
          <span style={{ color: TEAL }}>three places.</span>
        </h2>

        <div className="mt-14 grid md:grid-cols-3 gap-6 lg:gap-8">
          {PROBLEMS.map((p) => (
            <div
              key={p.n}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-[#eceef1] dark:border-slate-800 p-7 sm:p-8 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.18)] hover:-translate-y-1 hover:shadow-[0_22px_50px_-20px_rgba(15,23,42,0.22)] transition-all duration-300"
            >
              <span className="text-2xl font-semibold" style={{ color: BLUE }}>
                {p.n}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-[#0a0c12] dark:text-slate-50 tracking-tight">
                {p.title}
              </h3>
              <p className="mt-3 text-[15px] text-[#525965] dark:text-slate-400 leading-relaxed">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}