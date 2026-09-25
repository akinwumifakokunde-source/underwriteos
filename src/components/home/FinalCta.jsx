import React from "react";
import CtaPair from "@/components/home/CtaPair.jsx";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] bg-[#0a0c12]">
      {/* Static colorful aurora */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-[#0d9488]/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[380px] h-[380px] bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-400/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider mb-6 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500" />
          <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">Get started</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight bg-gradient-to-r from-white via-teal-100 to-indigo-200 bg-clip-text text-transparent">
          Run your first underwriting<br className="hidden sm:block" /> decision.
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#a0a5b0] leading-relaxed max-w-xl mx-auto">
          Connect live credit and bank data, or upload your own documents. CreditDecide handles the rest —
          for personal loans, instalment and point-of-sale, with full evidence lineage.
        </p>

        <CtaPair dark className="mt-10" />
      </div>
    </section>
  );
}