import React, { useEffect, useState } from "react";
import { Globe2, CheckCircle2, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AFRICA_PRICING } from "@/lib/africaPricing";
import { detectAfricaMarket } from "@/lib/geoPricing";

// Compact Africa-market pricing panel for the billing/settings area.
// Auto-detects the visitor's location and shows local-currency pricing.
export default function AfricaPricingPanel() {
  const [market, setMarket] = useState(null);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    let mounted = true;
    detectAfricaMarket()
      .then((code) => mounted && setMarket(code))
      .finally(() => mounted && setDetecting(false));
    return () => { mounted = false; };
  }, []);

  if (detecting) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-2.5">
        <Loader2 className="w-4 h-4 animate-spin text-[#0d9488]" />
        <span className="text-sm text-slate-500">Detecting your location for local pricing…</span>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="rounded-xl border border-[#0d9488]/30 bg-[#0d9488]/[0.03] p-5">
        <div className="flex items-center gap-2 mb-1">
          <Globe2 className="w-4 h-4 text-[#0d9488]" />
          <h3 className="text-sm font-semibold text-slate-900">Africa market pricing</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          USD pricing shown above applies to your location. We offer local-currency rates for lenders in Nigeria,
          Ghana, Kenya, and South Africa.{" "}
          <Link to="/contact" className="text-[#0d9488] font-medium hover:underline">Contact us</Link> to enable it.
        </p>
      </div>
    );
  }

  const cfg = AFRICA_PRICING[market];

  return (
    <div className="rounded-xl border border-[#0d9488]/30 bg-[#0d9488]/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-4 h-4 text-[#0d9488]" />
        <h3 className="text-sm font-semibold text-slate-900">Pricing for your location · {cfg.label}</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        We've detected you're in {cfg.label}. Subscription and credit packs are billed in {cfg.currency} at
        purchasing-power-adjusted rates.
      </p>

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
          {cfg.label} rates apply automatically based on your location. Need volume or micro-lender rates?{" "}
          <Link to="/contact" className="text-[#0d9488] font-medium hover:underline">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}