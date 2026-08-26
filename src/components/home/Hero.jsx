import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-5">
          API infrastructure for underwriting
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.05] max-w-3xl">
          Underwriting infrastructure,<br className="hidden sm:block" /> delivered as an API.
        </h1>
        <p className="mt-6 text-lg text-[#525965] leading-relaxed max-w-2xl">
          Connect borrower data from credit bureaus, bank accounts and financial documents.
          UnderwriteOS normalizes the data, analyzes risk, applies your policy and returns an
          explainable decision.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-md hover:bg-[#1c1f26] transition-colors"
          >
            Start building <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/sandbox"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-4 py-2.5 rounded-md hover:bg-[#f7f8fa] transition-colors"
          >
            Try the sandbox <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="mt-4 text-sm text-[#8a909c]">
          Create an account. Get a sandbox key. Run your first underwriting decision.
        </p>
      </div>
    </section>
  );
}