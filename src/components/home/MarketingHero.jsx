import React from "react";
import { Link } from "react-router-dom";
import GlobeGraphic from "@/components/home/GlobeGraphic.jsx";
import DecisionCard from "@/components/home/DecisionCard.jsx";

// Kita-inspired forest-green hero: global underwriting headline on the left,
// a dotted globe with a flight path on the right, and a floating decision card.
export default function MarketingHero() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "#0d1a12" }}>
      {/* radial gradient backdrop — glowing center fading to deep forest edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 70% at 62% 38%, #1c382a 0%, #0f2219 55%, #0d1a12 100%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
          {/* Left — copy */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 bg-white/5 border border-white/10">
              <span className="w-4 h-4 rounded-sm bg-[#ff5d00] flex items-center justify-center text-white text-[10px] font-bold">
                C
              </span>
              <span className="text-[12px] font-medium text-emerald-100/80">
                AI-native underwriting infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight leading-[1.05] text-white">
              Underwrite borrowers anywhere in the world, in minutes.
            </h1>

            {/* Body */}
            <p className="mt-6 max-w-xl text-base sm:text-lg text-emerald-100/60 leading-relaxed">
              CreditDecide turns messy borrower applications into decision-ready
              credit files, in any market you lend in. Your team makes every final
              call.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/demo"
                className="group inline-flex items-center gap-2 text-sm font-medium text-[#0e261a] bg-white pl-4 pr-5 py-2.5 rounded-full hover:bg-emerald-50 transition-all shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-[#2E7D32] group-hover:scale-110 transition-transform" />
                Book a demo
              </Link>
              <Link
                to="/start/borrower"
                className="text-sm font-medium text-white hover:text-emerald-300 transition-colors"
              >
                Try CreditDecide →
              </Link>
            </div>

            {/* Footer metrics */}
            <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">
              <span>Underwriting OS</span>
              <span className="text-white/20">·</span>
              <span>Live in UK · US · Africa</span>
            </div>
          </div>

          {/* Right — globe + floating decision card */}
          <div className="relative h-[340px] sm:h-[440px] lg:h-[500px]">
            <GlobeGraphic />
            <DecisionCard />
          </div>
        </div>
      </div>
    </section>
  );
}