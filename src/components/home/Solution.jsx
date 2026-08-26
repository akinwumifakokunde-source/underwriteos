import React from "react";

const FLOW = ["Borrower data", "UnderwriteOS", "Normalize", "Risk signals", "Policy", "Decision"];

const POINTS = [
  { title: "Bring your own data", body: "Use the credit bureaus and banks you already trust — or enter figures manually. We map it all into one model." },
  { title: "Decisions you can explain", body: "Every risk signal links back to the source record it came from, so a decline is never just a number." },
  { title: "Your policy, your call", body: "The AI advises; your rules decide. You can override a decision and the reason is recorded." },
  { title: "Live when you're ready", body: "Start on synthetic data in the sandbox, switch on real providers when your credentials are in place." },
];

export default function Solution() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> The solution
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">
            One API for the underwriting layer.
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {FLOW.map((f, i) => (
            <React.Fragment key={f}>
              <span
                className={`shrink-0 rounded-lg border px-3.5 py-2 font-mono text-xs ${
                  f === "UnderwriteOS"
                    ? "border-[#99e6d8] bg-[#e6f7f3] text-[#0d9488]"
                    : "border-[#e5e7eb] bg-white text-[#0a0c12]"
                }`}
              >
                {f}
              </span>
              {i < FLOW.length - 1 && <span className="shrink-0 text-[#8a909c]">→</span>}
            </React.Fragment>
          ))}
        </div>

        <p className="mt-8 text-lg text-[#525965] leading-relaxed max-w-2xl">
          Your application stays yours. UnderwriteOS handles the underwriting infrastructure.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7">
            <h3 className="text-2xl font-semibold tracking-tight text-[#0a0c12]">
              We built this because underwriting was stuck in the past.
            </h3>
            <p className="mt-4 text-[15px] text-[#525965] leading-relaxed">
              Lenders were stitching credit bureaus, bank feeds, and policy rules together by hand —
              each integration a separate project, every decision a black box. UnderwriteOS replaces
              that mess with one layer: you send a borrower and their data, we normalize it, surface
              the risk, run your policy, and hand back a decision you can trace back to the source.
            </p>
          </div>
          <div className="md:col-span-5">
            <ul className="space-y-4">
              {POINTS.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0d9488] shrink-0" />
                  <div>
                    <p className="text-[14px] font-medium text-[#0a0c12]">{p.title}</p>
                    <p className="text-[13px] text-[#525965] leading-relaxed">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}