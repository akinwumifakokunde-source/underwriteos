import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileCode2 } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
      <div className="rounded-3xl border border-[#2a2f3a] bg-gradient-to-b from-[#13161f] to-[#0c0f17] p-10 sm:p-16 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Start in minutes
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-[1.1]">
          Ship underwriting infrastructure without rebuilding it.
        </h2>
        <p className="mt-5 text-[#a0a5b0] leading-relaxed max-w-xl mx-auto">
          Provision a sandbox key, run a full application through the pipeline, and inspect every signal and decision.
          No sales call required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white px-5 py-2.5 rounded-lg hover:bg-[#e8eaee] transition-colors"
          >
            Start building <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/sandbox"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white border border-[#2a2f3a] px-5 py-2.5 rounded-lg hover:bg-[#13161f] transition-colors"
          >
            Try the sandbox
          </Link>
          <Link
            to="/api-reference"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c7ccd6] px-5 py-2.5 rounded-lg hover:text-white transition-colors"
          >
            <FileCode2 className="w-4 h-4" /> API reference
          </Link>
        </div>
      </div>
    </section>
  );
}