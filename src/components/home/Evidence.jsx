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
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Explainable by design
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">
            Every decision comes with evidence.
          </h2>
          <p className="mt-4 text-lg text-[#525965] leading-relaxed">
            UnderwriteOS links risk signals to the data that produced them. Your team can see which policy rules fired,
            why the recommendation was made and where the underlying evidence came from.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5e7eb] bg-[#f7f8fa] p-6 sm:p-8">
          <div className="border-l border-[#eceef1] pl-5 space-y-0">
            {TRACE.map((t, i) => (
              <div key={t.label} className="relative">
                <span className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-[#c7ccd6]" />
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#8a909c]">{t.label}</div>
                <div className={`mt-1 text-lg ${i === 0 ? "text-[#0a0c12] font-medium" : "text-[#3a3f4a]"}`}>{t.value}</div>
                {i < TRACE.length - 1 && <div className="py-4 text-[#eceef1]">│</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-[#8a909c]">
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