import React from "react";

const STATS = [
  { value: "6+", label: "Markets supported", sub: "6 dedicated + Others (any country)", accent: "from-teal-400 to-emerald-500" },
  { value: "5", label: "Risk dimensions", sub: "Credit · affordability · fraud · data · policy", accent: "from-indigo-400 to-violet-500" },
  { value: "11", label: "Pipeline stages", sub: "Intake to decision, fully auditable", accent: "from-amber-400 to-orange-500" },
  { value: "1,000", label: "Free credits", sub: "Granted on signup — no card required", accent: "from-rose-400 to-pink-500" },
];

export default function StatsBand() {
  return (
    <section className="border-b border-[#eceef1] bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`text-center sm:text-left ${i > 0 ? "lg:border-l lg:border-[#eceef1] lg:pl-6" : ""}`}
            >
              <div className={`mx-auto sm:mx-0 mb-2 h-1 w-10 rounded-full bg-gradient-to-r ${s.accent}`} />
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums bg-gradient-to-br from-[#0a0c12] to-[#0d9488] bg-clip-text text-transparent">
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