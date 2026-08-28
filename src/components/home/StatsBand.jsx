import React from "react";

const STATS = [
  { value: "6", label: "Markets supported", sub: "GB · US · NG · ZA · KE · GH" },
  { value: "5", label: "Risk dimensions", sub: "Credit · affordability · fraud · data · policy" },
  { value: "11", label: "Pipeline stages", sub: "Intake to decision, fully auditable" },
  { value: "1,000", label: "Free credits", sub: "Granted on signup — no card required" },
];

export default function StatsBand() {
  return (
    <section className="border-b border-[#eceef1] bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`text-center sm:text-left ${i > 0 ? "lg:border-l lg:border-[#eceef1] lg:pl-6" : ""}`}
            >
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] tabular-nums">
                {s.value}
              </div>
              <div className="mt-1.5 text-sm font-medium text-[#0a0c12]">{s.label}</div>
              <div className="mt-0.5 text-[11px] text-[#8a909c] leading-snug">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}