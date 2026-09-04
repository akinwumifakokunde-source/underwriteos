import React from "react";
import { Globe, MapPin, FileText, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const DEDICATED = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", grad: "from-blue-500/15 to-indigo-500/10" },
  { code: "US", name: "United States", flag: "🇺🇸", grad: "from-rose-500/15 to-blue-500/10" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", grad: "from-emerald-500/15 to-teal-500/10" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", grad: "from-amber-500/15 to-emerald-500/10" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", grad: "from-red-500/15 to-emerald-500/10" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", grad: "from-amber-500/15 to-rose-500/10" },
];

export default function GlobalCoverage() {
  return (
    <section className="border-b border-[#eceef1] bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Global coverage</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Built for six markets — flexible enough for any country.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          CreditDecide ships with dedicated configurations for six markets, each with its own currency
          defaults, regulatory profile, KYC requirements and built-in data providers. Outside those?
          Pick <span className="font-medium text-[#0a0c12]">Others</span> and the platform works for any
          country — upload documents in any format, set your own policy, and decide in USD.
        </p>

        {/* Dedicated markets */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#0d9488]" />
            <h3 className="text-sm font-semibold text-[#0a0c12] uppercase tracking-wide">Dedicated markets</h3>
            <span className="text-[11px] font-mono text-[#8a909c]">Local currency · KYC · policy templates</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {DEDICATED.map((m) => (
              <div
                key={m.code}
                className={`group rounded-lg border border-[#eceef1] bg-gradient-to-br ${m.grad} px-3 py-3 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-14px_rgba(13,148,136,0.35)] hover:border-[#0d9488]/40`}
              >
                <div className="text-xl leading-none mb-1.5 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">{m.flag}</div>
                <div className="text-[13px] font-semibold text-[#0a0c12]">{m.name}</div>
                <div className="text-[10px] font-mono text-[#8a909c]">{m.code}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Others / flexible */}
        <div className="mt-4 rounded-xl border border-[#0d9488]/30 bg-gradient-to-br from-[#f0fdfa] via-white to-[#eef2ff] p-5 shadow-[0_10px_40px_-12px_rgba(13,148,136,0.25)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0d9488]/10 text-[#0d9488] flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[#0a0c12]">Others — any country not listed above</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0d9488] bg-[#0d9488]/10 rounded px-1.5 py-0.5">Flexible</span>
              </div>
              <p className="mt-1.5 text-[13px] text-[#525965] leading-relaxed">
                No local bureau or open-banking provider? No problem. Upload borrower documents in any
                format, apply your own underwriting policy, and get the same structured risk signals,
                evidence lineage and explainable decision — priced in USD.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#525965]">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#8a909c]" /> Document upload in any format
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#8a909c]" /> Standard USD pricing
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8a909c]" /> Your own policy &amp; KYC
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/pricing"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors"
          >
            See pricing across markets
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}