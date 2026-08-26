import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SandboxCta() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Try the sandbox</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          See a decision before you write an integration.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          Run a complete underwriting flow with synthetic borrower data. Inspect the request, response,
          risk signals, policy evaluation and evidence.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            to="/sandbox"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-md hover:bg-[#1c1f26] transition-colors"
          >
            Try the sandbox <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-4 py-2.5 rounded-md hover:bg-[#f7f8fa] transition-colors"
          >
            Read the quickstart <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}