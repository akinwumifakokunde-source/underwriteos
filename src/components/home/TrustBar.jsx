import React from "react";

// Curated top lenders & fintechs across the six markets CreditDecide serves:
// GB, US, NG, ZA, KE, GH — two notable names per market.
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
          Trusted by leading lenders &amp; fintechs across six markets
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
      </div>
    </section>
  );
}