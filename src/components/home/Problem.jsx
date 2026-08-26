import React from "react";

const SOURCES = ["Credit bureau", "Bank data", "Financial documents"];
const STEPS = ["Different formats", "Custom integrations", "Custom risk logic", "Custom decisioning"];

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2 font-mono text-xs text-[#0a0c12]">
      {children}
    </span>
  );
}

export default function Problem() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> The problem
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">Lending data is fragmented.</h2>
          <p className="mt-4 text-lg text-[#525965] leading-relaxed">
            Credit bureaus, bank transactions and financial documents all arrive in different formats. Lenders end up
            rebuilding the same normalization, risk and decisioning infrastructure for every product.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5e7eb] bg-[#f7f8fa] p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
          <div className="mt-5 space-y-0">
            {STEPS.map((s) => (
              <div key={s}>
                <div className="py-3 text-[#8a909c] font-mono text-sm">↓</div>
                <span className="inline-flex items-center rounded-lg border border-[#eceef1] bg-white px-3.5 py-2 font-mono text-xs text-[#525965]">
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-lg text-[#0a0c12]">UnderwriteOS provides the layer in between.</p>
      </div>
    </section>
  );
}