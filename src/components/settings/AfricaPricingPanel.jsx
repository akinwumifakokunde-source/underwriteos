import React, { useState } from "react";
import { Globe2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AFRICA_PRICING, AFRICA_MARKET_ORDER } from "@/lib/africaPricing";

// Compact Africa-market pricing panel for the billing/settings area.
export default function AfricaPricingPanel() {
  const [market, setMarket] = useState("NG");
  const cfg = AFRICA_PRICING[market];

  return (
    <div className="rounded-xl border border-[#0d9488]/30 bg-[#0d9488]/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Globe2 className="w-4 h-4 text-[#0d9488]" />
        <h3 className="text-sm font-semibold text-slate-900">Africa market pricing</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Purchasing-power-adjusted local-currency rates for lenders in Nigeria, Ghana, Kenya, and South Africa — the
        same credits and features, billed in your market currency.
      </p>

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {AFRICA_MARKET_ORDER.map((code) => (
          <button
            key={code}
            onClick={() => setMarket(code)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              market === code
                ? "border-[#0a0c12] bg-[#0a0c12] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {AFRICA_PRICING[code].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {cfg.tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-lg border p-3 flex flex-col ${
              t.highlight ? "border-[#0d9488] bg-white" : "border-slate-200 bg-white"
            }`}
          >
            <div className="text-xs font-medium text-slate-700">{t.name}</div>
            <div className="mt-1.5 flex items-baseline gap-0.5">
              <span className="text-sm font-semibold text-slate-900">{cfg.symbol}</span>
              <span className="text-xl font-semibold tracking-tight text-slate-900">{t.price}</span>
              <span className="text-[11px] text-slate-400">/mo</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{t.credits}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {cfg.packs.map((p) => (
          <div key={p.name} className="rounded-lg border border-slate-200 bg-white p-2.5">
            <div className="text-[11px] font-medium text-slate-600">{p.name}</div>
            <div className="text-[11px] text-slate-400">{p.credits} credits</div>
            <div className="text-xs font-medium text-slate-900 mt-0.5">{p.price}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          African-market rates apply automatically when your workspace is set to {cfg.label}. Need volume or
          micro-lender rates? <Link to="/contact" className="text-[#0d9488] font-medium hover:underline">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}