import React from "react";

// "Built by a team from" — universities and top fintech / financial firms.
const LOGOS = [
  { name: "WashU", weight: "font-semibold" },
  { name: "Oxford", weight: "font-semibold" },
  { name: "Stripe", weight: "font-bold" },
  { name: "Plaid", weight: "font-semibold" },
  { name: "Bloomberg", weight: "font-bold" },
  { name: "Goldman Sachs", weight: "font-semibold" },
  { name: "JPMorgan", weight: "font-semibold" },
  { name: "Visa", weight: "font-bold italic" },
];

export default function TeamBar() {
  return (
    <section className="border-y border-[#eceef1] bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a909c] mb-6">
          Built by a team from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10">
          {LOGOS.map((l) => (
            <span
              key={l.name}
              className={`text-lg sm:text-xl ${l.weight} tracking-tight text-[#9ca3af] hover:text-[#0a0c12] transition-colors select-none`}
            >
              {l.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}