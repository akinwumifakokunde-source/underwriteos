import React from "react";

const SOURCES = ["Credit bureaus", "Bank data", "Financial documents"];
const PIPELINE = ["Normalization", "Risk analysis", "Policy", "Decision"];

export default function Problem() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">The problem</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Lenders keep rebuilding the same underwriting stack.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          Credit reports, bank transactions and financial documents arrive in different formats.
          Teams spend months integrating providers, normalizing data, building risk logic and
          maintaining decisioning infrastructure.
        </p>

        <div className="mt-8 rounded-lg border border-[#eceef1] bg-[#fafbfc] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {SOURCES.map((s, i) => (
              <React.Fragment key={s}>
                <span className="text-sm font-medium text-[#0a0c12] px-3 py-2 rounded-md border border-[#eceef1] bg-white">{s}</span>
                {i < SOURCES.length - 1 && <span className="text-[#8a909c] text-center">+</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="my-5 text-center text-[#8a909c] text-sm">↓</div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {PIPELINE.map((p, i) => (
              <React.Fragment key={p}>
                <span className="text-sm font-mono text-[#525965] px-3 py-2 rounded-md bg-[#f1f3f5]">{p}</span>
                {i < PIPELINE.length - 1 && <span className="text-[#8a909c] text-center text-sm">↓</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <p className="mt-6 text-lg font-medium text-[#0a0c12]">
          UnderwriteOS provides the layer in between.
        </p>
      </div>
    </section>
  );
}