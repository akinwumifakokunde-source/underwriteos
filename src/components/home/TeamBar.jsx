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
  { name: "McKinsey", weight: "font-semibold" },
  { name: "Mastercard", weight: "font-bold" },
  { name: "Amazon", weight: "font-bold" },
];

export default function TeamBar() {
  return (
    <section className="border-y border-[#eceef1] bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a909c] mb-6">
          Built by a team with experience from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10">
          {LOGOS.map((l) => (
            <span
              key={l.name}
              className={`text-lg sm:text-xl ${l.weight} tracking-tight text-[#9ca3af] transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-teal-500 hover:to-indigo-500 hover:bg-clip-text hover:text-transparent select-none`}
            >
              {l.name}
            </span>
          ))}
        </div>
        <p className="mt-5 text-center text-[10px] text-[#b0b4bd]">
          Brand names shown for illustrative marketing purposes only and do not imply endorsement or partnership.
        </p>
      </div>
    </section>
  );
}