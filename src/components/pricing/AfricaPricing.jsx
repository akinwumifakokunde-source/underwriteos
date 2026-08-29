import React, { useEffect, useState } from "react";
import { CheckCircle2, Globe2, Sparkles, Loader2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { AFRICA_PRICING } from "@/lib/africaPricing";
import { detectAfricaMarket } from "@/lib/geoPricing";

export default function AfricaPricing() {
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
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="max-w-2xl mb-6">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#0d9488] mb-3">
            <Globe2 className="w-3.5 h-3.5" /> Africa market pricing
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#0a0c12]">
            Local-currency pricing for African lenders
          </h2>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-[#8a909c]">
          <Loader2 className="w-4 h-4 animate-spin text-[#0d9488]" />
          Detecting your location…
        </div>
      </section>
    );
  }

  // Non-African visitor: USD pricing (shown above) applies.
  if (!market) {
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
            South Africa. If you're based in one of these markets, your local-currency rates are applied automatically.
          </p>
        </div>
        <div className="inline-flex items-start gap-2.5 rounded-xl border border-[#0d9488]/30 bg-[#0d9488]/5 px-4 py-3 max-w-2xl">
          <MapPin className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
          <p className="text-sm text-[#0a0c12] leading-relaxed">
            <span className="font-semibold">USD pricing shown above</span> applies to your location. African-market
            local-currency pricing is available for Nigeria (₦), Ghana (GH₵), Kenya (KSh), and South Africa (R) —
            contact us to enable it for your workspace.
          </p>
        </div>
      </section>
    );
  }

  const cfg = AFRICA_PRICING[market];

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
      <div className="max-w-2xl mb-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#0d9488] mb-3">
          <MapPin className="w-3.5 h-3.5" /> Pricing for your location · {cfg.label}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#0a0c12]">
          Local-currency pricing for {cfg.label}
        </h2>
        <p className="mt-3 text-base text-[#525965] leading-relaxed">
          We've detected you're in {cfg.label}. Your subscription and credit packs are billed in {cfg.currency} at
          purchasing-power-adjusted rates — the same platform, credits, and markets, built for local economics.
        </p>
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
          <span className="font-semibold">1,000 free credits</span> on signup — no card required. {cfg.label} rates
          are applied automatically based on your location. Contact us for volume or micro-lender rates.
        </p>
      </div>
    </section>
  );
}