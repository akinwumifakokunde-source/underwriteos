import React from "react";

const TRACE = [
  { label: "Decision", value: "REVIEW" },
  { label: "Risk signal", value: "High debt-to-income" },
  { label: "Metric", value: "DTI: 48.2%" },
  { label: "Source", value: "Bank statement" },
  { label: "Evidence", value: "Transactions · May 1 – Jul 31" },
];

export default function Evidence() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Explainable by design
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            Every decision comes with evidence.
          </h2>
          <p className="mt-4 text-lg text-[#a0a5b0] leading-relaxed">
            UnderwriteOS links risk signals to the data that produced them. Your team can see which policy rules fired,
            why the recommendation was made and where the underlying evidence came from.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2a2f3a] bg-[#0a0c12] p-6 sm:p-8">
          <div className="border-l border-[#1c2029] pl-5 space-y-0">
            {TRACE.map((t, i) => (
              <div key={t.label} className="relative">
                <span className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-[#2a2f3a]" />
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5b6472]">{t.label}</div>
                <div className={`mt-1 text-lg ${i === 0 ? "text-white font-medium" : "text-[#c7ccd6]"}`}>{t.value}</div>
                {i < TRACE.length - 1 && <div className="py-4 text-[#1c2029]">│</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-[#5b6472]">
          <span>Evidence</span>
          <span>·</span>
          <span>Risk signals</span>
          <span>·</span>
          <span>Policy evaluation</span>
          <span>·</span>
          <span>Audit trail</span>
        </div>
      </div>
    </section>
  );
}