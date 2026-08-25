import React from "react";

const SOURCES = ["Credit bureau", "Bank data", "Financial documents"];
const STEPS = ["Different formats", "Custom integrations", "Custom risk logic", "Custom decisioning"];

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-[#2a2f3a] bg-[#13161f] px-3.5 py-2 font-mono text-xs text-white">
      {children}
    </span>
  );
}

export default function Problem() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> The problem
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">Lending data is fragmented.</h2>
          <p className="mt-4 text-lg text-[#a0a5b0] leading-relaxed">
            Credit bureaus, bank transactions and financial documents all arrive in different formats. Lenders end up
            rebuilding the same normalization, risk and decisioning infrastructure for every product.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2a2f3a] bg-[#0a0c12] p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
          <div className="mt-5 space-y-0">
            {STEPS.map((s) => (
              <div key={s}>
                <div className="py-3 text-[#5b6472] font-mono text-sm">↓</div>
                <span className="inline-flex items-center rounded-lg border border-[#1c2029] bg-[#13161f] px-3.5 py-2 font-mono text-xs text-[#a0a5b0]">
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-lg text-white">UnderwriteOS provides the layer in between.</p>
      </div>
    </section>
  );
}