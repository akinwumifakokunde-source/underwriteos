import React from "react";

// Curated top lenders & fintechs across the markets CreditDecide serves — two notable names per region.
const LOGOS = [
  { name: "Monzo", weight: "font-bold" },
  { name: "Zopa", weight: "font-semibold" },
  { name: "SoFi", weight: "font-bold" },
  { name: "Upstart", weight: "font-semibold" },
  { name: "FairMoney", weight: "font-bold" },
  { name: "Carbon", weight: "font-semibold" },
  { name: "Capitec", weight: "font-bold" },
  { name: "TymeBank", weight: "font-semibold" },
  { name: "Branch", weight: "font-bold" },
  { name: "Tala", weight: "font-semibold" },
  { name: "Fido", weight: "font-bold" },
  { name: "Paystack", weight: "font-semibold" },
];

export default function TrustBar() {
  return (
    <section className="border-b border-[#eceef1] bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a909c] mb-8">
          Designed for leading lenders &amp; fintechs worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-12">
          {LOGOS.map((l) => (
            <span
              key={l.name}
              className={`text-xl sm:text-2xl ${l.weight} tracking-tight text-[#9ca3af] hover:text-[#0a0c12] transition-colors select-none`}
            >
              {l.name}
            </span>
          ))}
        </div>
        <p className="mt-6 text-center text-[10px] text-[#b0b4bd]">
          Brand names shown for illustrative marketing purposes only and do not imply endorsement or partnership.
        </p>
      </div>
    </section>
  );
}