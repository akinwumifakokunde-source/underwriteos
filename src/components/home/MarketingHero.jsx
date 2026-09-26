import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GlobeGraphic from "@/components/home/GlobeGraphic.jsx";
import DecisionCard from "@/components/home/DecisionCard.jsx";
import HeroLeadCapture from "@/components/home/HeroLeadCapture.jsx";

const STATS = [
  { value: "Any", label: "market, no limits" },
  { value: "< 3 min", label: "avg. decision" },
  { value: "100%", label: "explainable" },
];

// Markets in rolling order (longitude descending so the globe rolls forward
// smoothly). GB sits at index 4 — the cycle starts there, the brand's home
// market, then rolls through the US and back across Africa.
const MARKETS = [
  { code: "KE", flag: "🇰🇪", name: "Kenya", lat: -1, lon: 38, timer: "1m 47s", files: 8, formats: 4, desc: "M-Pesa statements, payslips, KRA PIN, proof of address", decision: "APPROVE", amount: "KES 850K", dscr: "1.38x", status: "PASS" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa", lat: -29, lon: 24, timer: "2m 12s", files: 11, formats: 5, desc: "Bank statements, payslips, SARS IT3, proof of address", decision: "APPROVE", amount: "ZAR 180K", dscr: "1.30x", status: "PASS" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria", lat: 9, lon: 7, timer: "1m 58s", files: 9, formats: 4, desc: "Bank statements, BVN, payslips, proof of address", decision: "APPROVE", amount: "NGN 3.5M", dscr: "1.42x", status: "PASS" },
  { code: "GH", flag: "🇬🇭", name: "Ghana", lat: 7, lon: -1, timer: "2m 04s", files: 10, formats: 5, desc: "Bank statements, payslips, Ghana Card, proof of address", decision: "REVIEW", amount: "GHS 45K", dscr: "1.12x", status: "WATCH" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", lat: 54, lon: -2, timer: "2m 31s", files: 12, formats: 5, desc: "Bank statements, payslips, credit report, proof of address", decision: "APPROVE", amount: "GBP 12K", dscr: "1.35x", status: "PASS" },
  { code: "US", flag: "🇺🇸", name: "United States", lat: 40, lon: -98, timer: "3m 41s", files: 16, formats: 6, desc: "Bank statements, payslips, W-2, proof of address", decision: "APPROVE", amount: "USD 18K", dscr: "1.27x", status: "PASS" },
];
const START = 4; // GB

export default function MarketingHero() {
  const [idx, setIdx] = useState(START);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % MARKETS.length), 4500);
    return () => clearInterval(id);
  }, []);

  const active = MARKETS[idx];

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "#0d1a12" }}>
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
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 bg-white/5 border border-white/10">
              <span className="w-4 h-4 rounded-sm bg-[#008e8b] flex items-center justify-center text-white text-[10px] font-bold">
                C
              </span>
              <span className="text-[12px] font-medium text-emerald-100/80">
                AI-native credit underwriting infrastructure
              </span>
            </div>

            <h1 className="max-w-[560px] text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-tight leading-[1.04] text-white">
              Decide any borrower in minutes, across every market you lend in.
            </h1>

            <p className="mt-7 max-w-xl text-base sm:text-lg text-[#a0b2a9] leading-relaxed">
              CreditDecide reads messy documents, normalizes the data, scores the
              risk, and writes an explainable credit memo — every signal traced to
              its source. Your policies set the rules. Your team makes the call.
            </p>

            <HeroLeadCapture />

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#8f9f97]">
              <span className="text-white font-medium">Any market</span>
              <span className="text-white/20">·</span>
              <span className="text-white font-medium">&lt; 3 min</span> decision
              <span className="text-white/20">·</span>
              <span className="text-white font-medium">100%</span> explainable
            </div>

            <Link
              to="/start/borrower"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-emerald-300 transition-colors"
            >
              Try it now →
            </Link>
          </div>

          {/* Right — rolling globe + cycling underwriting slip */}
          <div className="relative h-[380px] sm:h-[520px] lg:h-[600px] -mr-4 sm:-mr-10 lg:-mr-16">
            <GlobeGraphic market={active} />
            <DecisionCard market={active} />
          </div>
        </div>
      </div>
    </section>
  );
}