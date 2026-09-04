import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] bg-[#0a0c12]">
      {/* Colorful animated aurora */}
      <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-[#0d9488]/25 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[380px] h-[380px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#0d9488] mb-6 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
          Get started
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight bg-gradient-to-r from-white via-teal-100 to-indigo-200 bg-clip-text text-transparent">
          Run your first underwriting<br className="hidden sm:block" /> decision.
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#a0a5b0] leading-relaxed max-w-xl mx-auto">
          Connect live credit and bank data, or upload your own documents. CreditDecide handles the rest —
          anywhere in the world, with full evidence lineage.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/onboarding"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white px-5 py-3 rounded-lg hover:bg-[#e8eaee] transition-all shadow-lg"
          >
            Start building <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white border border-white/20 px-5 py-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            View pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}