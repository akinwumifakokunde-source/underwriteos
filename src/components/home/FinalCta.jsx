import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="border-b border-[#eceef1] bg-[#0a0c12]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Run your first underwriting decision.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#a0a5b0] leading-relaxed max-w-xl mx-auto">
          Start with synthetic borrower data. Connect your own providers when you're ready.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white px-4 py-2.5 rounded-md hover:bg-[#e8eaee] transition-colors"
          >
            Start building <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/api-reference"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white border border-white/20 px-4 py-2.5 rounded-md hover:bg-white/5 transition-colors"
          >
            View API reference <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}