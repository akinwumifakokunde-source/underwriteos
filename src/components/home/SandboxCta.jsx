import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SandboxCta() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Try the sandbox
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            See a decision before you write an integration.
          </h2>
          <p className="mt-4 text-lg text-[#a0a5b0] leading-relaxed">
            Use synthetic borrower data to run the complete underwriting pipeline.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/sandbox"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white px-5 py-2.5 rounded-lg hover:bg-[#e8eaee] transition-colors"
            >
              Try the sandbox <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white border border-[#2a2f3a] px-5 py-2.5 rounded-lg hover:bg-[#13161f] transition-colors"
            >
              Read the quickstart
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}