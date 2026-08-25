import React from "react";

const METRICS = [
  { value: "<200ms", label: "p95 decision latency" },
  { value: "6", label: "risk signal categories" },
  { value: "100%", label: "evidence-traceable signals" },
  { value: "12+", label: "bureau & data providers" },
];

export default function Metrics() {
  return (
    <section className="border-y border-[#1c2029] bg-[#0c0f17]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {METRICS.map((m) => (
            <div key={m.label}>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                {m.value}
              </div>
              <div className="mt-1.5 text-sm text-[#a0a5b0]">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}