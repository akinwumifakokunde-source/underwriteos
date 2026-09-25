import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GlobeGraphic from "@/components/home/GlobeGraphic.jsx";
import DecisionCard from "@/components/home/DecisionCard.jsx";

// Markets in rolling order (longitude descending so the globe rolls forward
// smoothly). GB sits at index 4 — the cycle starts there, the brand's home
// market, then rolls through the US and back across Africa.
const MARKETS = [
  { code: "KE", flag: "🇰🇪", name: "Kenya", lat: -1, lon: 38, timer: "1m 47s", files: 8, formats: 4, desc: "M-Pesa statements, payslips, KRA PIN, proof of address", decision: "APPROVE", amount: "KES 18M", dscr: "1.38x", status: "PASS" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa", lat: -29, lon: 24, timer: "2m 12s", files: 11, formats: 5, desc: "Bank statements, payslips, SARS IT3, proof of address", decision: "APPROVE", amount: "ZAR 6.5M", dscr: "1.30x", status: "PASS" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria", lat: 9, lon: 7, timer: "1m 58s", files: 9, formats: 4, desc: "Bank statements, BVN, payslips, proof of address", decision: "APPROVE", amount: "NGN 320M", dscr: "1.42x", status: "PASS" },
  { code: "GH", flag: "🇬🇭", name: "Ghana", lat: 7, lon: -1, timer: "2m 04s", files: 10, formats: 5, desc: "Bank statements, payslips, Ghana Card, proof of address", decision: "REVIEW", amount: "GHS 1.1M", dscr: "1.12x", status: "WATCH" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", lat: 54, lon: -2, timer: "2m 31s", files: 12, formats: 5, desc: "Bank statements, payslips, credit report, proof of address", decision: "APPROVE", amount: "GBP 1.2M", dscr: "1.35x", status: "PASS" },
  { code: "US", flag: "🇺🇸", name: "United States", lat: 40, lon: -98, timer: "3m 41s", files: 16, formats: 6, desc: "Form 1120, Schedule C, K-1, 1065, commercial bank statements", decision: "APPROVE", amount: "USD 750K", dscr: "1.27x", status: "PASS" },
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
              <span className="w-4 h-4 rounded-sm bg-[#ff5d00] flex items-center justify-center text-white text-[10px] font-bold">
                C
              </span>
              <span className="text-[12px] font-medium text-emerald-100/80">
                AI-native credit underwriting infrastructure
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold tracking-tight leading-[1.03] text-white">
              Decide any borrower in minutes, across every market you lend in.
            </h1>

            <p className="mt-7 max-w-xl text-base sm:text-lg text-[#a0b2a9] leading-relaxed">
              CreditDecide reads messy documents, normalizes the data, scores the
              risk, and writes an explainable credit memo — every signal traced to
              its source. Your policies set the rules. Your team makes the call.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Link
                to="/demo"
                className="group inline-flex items-center gap-2 text-sm font-medium text-black bg-white pl-4 pr-5 py-2.5 rounded-full hover:bg-emerald-50 transition-all shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-[#2E7D32] group-hover:scale-110 transition-transform" />
                Book a demo
              </Link>
              <Link
                to="/start/borrower"
                className="text-sm font-medium text-white/90 hover:text-emerald-300 transition-colors"
              >
                Try CreditDecide →
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#8f9f97]">
              <span>Underwriting OS</span>
              <span className="text-white/20">·</span>
              <span>Live in UK · US · Africa</span>
            </div>
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