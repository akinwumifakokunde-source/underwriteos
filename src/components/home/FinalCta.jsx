import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">Build your underwriting layer.</h2>
          <p className="mt-4 text-lg text-[#525965] leading-relaxed">
            Start with synthetic data. Move to your own providers when you're ready.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors"
            >
              Start building <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/sandbox"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] border border-[#e5e7eb] px-5 py-2.5 rounded-lg hover:bg-[#f2f3f5] transition-colors"
            >
              Try the sandbox
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}