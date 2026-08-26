import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SandboxCta() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Try the sandbox
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">
            See a decision before you write an integration.
          </h2>
          <p className="mt-4 text-lg text-[#525965] leading-relaxed">
            Use synthetic borrower data to run the complete underwriting pipeline.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/sandbox"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors"
            >
              Try the sandbox <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] border border-[#e5e7eb] px-5 py-2.5 rounded-lg hover:bg-[#f2f3f5] transition-colors"
            >
              Read the quickstart
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}