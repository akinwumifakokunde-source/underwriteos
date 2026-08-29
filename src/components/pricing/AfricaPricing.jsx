import React, { useState } from "react";
import { CheckCircle2, Globe2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// Purchasing-power-adjusted monthly pricing for African markets.
// Rates are set well below the USD list price to make the platform
// affordable for lenders operating in local currencies.
const AFRICA_PRICING = {
  NG: {
    label: "Nigeria",
    currency: "NGN",
    symbol: "₦",
    tiers: [
      { name: "Starter", price: "25,000", credits: "20,000 credits / mo" },
      { name: "Growth", price: "95,000", credits: "100,000 credits / mo", highlight: true },
      { name: "Scale", price: "220,000", credits: "300,000 credits / mo" },
    ],
    packs: [
      { name: "Starter pack", credits: "10,000", price: "₦6,000" },
      { name: "Growth pack", credits: "50,000", price: "₦22,000" },
      { name: "Scale pack", credits: "100,000", price: "₦38,000" },
    ],
  },
  GH: {
    label: "Ghana",
    currency: "GHS",
    symbol: "GH₵",
    tiers: [
      { name: "Starter", price: "250", credits: "20,000 credits / mo" },
      { name: "Growth", price: "950", credits: "100,000 credits / mo", highlight: true },
      { name: "Scale", price: "2,200", credits: "300,000 credits / mo" },
    ],
    packs: [
      { name: "Starter pack", credits: "10,000", price: "GH₵60" },
      { name: "Growth pack", credits: "50,000", price: "GH₵220" },
      { name: "Scale pack", credits: "100,000", price: "GH₵380" },
    ],
  },
  KE: {
    label: "Kenya",
    currency: "KES",
    symbol: "KSh",
    tiers: [
      { name: "Starter", price: "4,500", credits: "20,000 credits / mo" },
      { name: "Growth", price: "17,000", credits: "100,000 credits / mo", highlight: true },
      { name: "Scale", price: "42,000", credits: "300,000 credits / mo" },
    ],
    packs: [
      { name: "Starter pack", credits: "10,000", price: "KSh 1,100" },
      { name: "Growth pack", credits: "50,000", price: "KSh 4,000" },
      { name: "Scale pack", credits: "100,000", price: "KSh 7,000" },
    ],
  },
  ZA: {
    label: "South Africa",
    currency: "ZAR",
    symbol: "R",
    tiers: [
      { name: "Starter", price: "499", credits: "20,000 credits / mo" },
      { name: "Growth", price: "1,899", credits: "100,000 credits / mo", highlight: true },
      { name: "Scale", price: "4,499", credits: "300,000 credits / mo" },
    ],
    packs: [
      { name: "Starter pack", credits: "10,000", price: "R 120" },
      { name: "Growth pack", credits: "50,000", price: "R 450" },
      { name: "Scale pack", credits: "100,000", price: "R 750" },
    ],
  },
};

const ORDER = ["NG", "GH", "KE", "ZA"];

export default function AfricaPricing() {
  const [market, setMarket] = useState("NG");
  const cfg = AFRICA_PRICING[market];

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
      <div className="max-w-2xl mb-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#0d9488] mb-3">
          <Globe2 className="w-3.5 h-3.5" /> Africa market pricing
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#0a0c12]">
          Local-currency pricing for African lenders
        </h2>
        <p className="mt-3 text-base text-[#525965] leading-relaxed">
          We offer purchasing-power-adjusted pricing in local currency for lenders in Nigeria, Ghana, Kenya, and
          South Africa — the same platform, credits, and markets, at rates built for local economics. No FX surprises;
          you're billed in your market currency.
        </p>
      </div>

      {/* Market selector */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {ORDER.map((code) => (
          <button
            key={code}
            onClick={() => setMarket(code)}
            className={`text-sm px-3.5 py-1.5 rounded-lg border transition-colors ${
              market === code
                ? "border-[#0a0c12] bg-[#0a0c12] text-white"
                : "border-[#e5e7eb] bg-white text-[#525965] hover:bg-[#f2f3f5]"
            }`}
          >
            {AFRICA_PRICING[code].label}
          </button>
        ))}
      </div>

      {/* Tiers in local currency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {cfg.tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl border p-6 flex flex-col ${
              t.highlight ? "border-[#0d9488] bg-white shadow-sm" : "border-[#e5e7eb] bg-white"
            }`}
          >
            {t.highlight && (
              <span className="absolute -top-2.5 left-6 text-[10px] font-medium uppercase tracking-wider text-white bg-[#0d9488] rounded px-2 py-0.5">
                Most popular
              </span>
            )}
            <div className="text-sm font-medium text-[#0a0c12]">{t.name}</div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-[#0a0c12]">{cfg.symbol}</span>
              <span className="text-4xl font-semibold tracking-tight text-[#0a0c12]">{t.price}</span>
              <span className="text-sm text-[#525965]">/ month</span>
            </div>
            <div className="mt-1 text-xs text-[#525965] font-medium">{t.credits}</div>
            <div className="mt-5 space-y-2.5">
              {["All 6 markets & data sources", "Live credit + bank data pulls", "AI analysis & policy decisions", "Evidence lineage & audit trail", "PDF / CSV / Word exports"].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-[#3a3f4a]">
                  <CheckCircle2 className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
            <Link
              to="/onboarding"
              className={`mt-7 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${
                t.highlight ? "text-white bg-[#0a0c12] hover:bg-[#1c1f26]" : "text-[#0a0c12] border border-[#e5e7eb] hover:bg-[#f2f3f5]"
              }`}
            >
              Start building
            </Link>
          </div>
        ))}
      </div>

      {/* Local-currency credit packs */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cfg.packs.map((p) => (
          <div key={p.name} className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
            <div className="text-sm font-medium text-[#0a0c12]">{p.name}</div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-[#0a0c12]">{p.credits}</span>
              <span className="text-sm text-[#525965]">credits</span>
            </div>
            <div className="mt-1 text-sm font-medium text-[#0a0c12]">{p.price}</div>
            <div className="text-xs text-[#8a909c]">one-time · never expires</div>
          </div>
        ))}
      </div>

      <div className="mt-5 inline-flex items-start gap-2.5 rounded-xl border border-[#0d9488]/30 bg-[#0d9488]/5 px-4 py-3 max-w-2xl">
        <Sparkles className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
        <p className="text-sm text-[#0a0c12] leading-relaxed">
          <span className="font-semibold">1,000 free credits</span> on signup — no card required. African-market
          pricing is applied automatically when your workspace is set to {cfg.label}. Contact us for volume or
          micro-lender rates.
        </p>
      </div>
    </section>
  );
}