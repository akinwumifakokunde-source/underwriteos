import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import { JURISDICTIONS } from "@/lib/jurisdictions";

const FLAGS = { GB: "🇬🇧", US: "🇺🇸", NG: "🇳🇬", ZA: "🇿🇦", KE: "🇰🇪", GH: "🇬🇭", OT: "🌐" };

const ORDER = ["GB", "US", "NG", "ZA", "KE", "GH", "OT"];

const SOURCES = {
  GB: { bureau: "Experian", open: "TrueLayer" },
  US: { bureau: "Experian", open: "Plaid" },
  NG: { bureau: "CRC", open: "Okra" },
  ZA: { bureau: "XDS", open: "Stitch" },
  KE: { bureau: "CRB Africa", open: "Okra" },
  GH: { bureau: "XDS Ghana", open: "Mono" },
  OT: { bureau: "Licensed bureau", open: "Open banking provider" },
};

export default function Markets() {
  const markets = ORDER.map((code) => ({
    code,
    ...JURISDICTIONS[code],
    flag: FLAGS[code],
    src: SOURCES[code],
  }));

  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Markets
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            One platform, every market
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            CreditDecide is built for consumer lenders worldwide. Policies, KYC, currencies and data
            sources adapt per market — any country, any currency — with live credit bureau and open
            banking connections or document upload.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid sm:grid-cols-2 gap-4">
          {markets.map((m) => (
            <Link
              key={m.code}
              to={`/markets/${m.code}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl leading-none">{m.flag}</span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{m.name}</h2>
                  <p className="text-xs text-slate-500">{m.regulatoryProfile}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[11px] font-medium text-[#0a2e2a] bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-2.5 py-0.5">
                  {m.currency}
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
                  Credit: {m.src.bureau}
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
                  Open banking: {m.src.open}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600">
                Explore market <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}