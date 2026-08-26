import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LINEAGE = ["Decision", "Policy evaluation", "Risk signal", "Evidence", "Source field"];

export default function Evidence() {
  return (
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Explainable by design</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Every decision has a traceable reason.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          Every underwriting decision is linked to the policy, risk signals, evidence and source data
          behind it.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-[#eceef1] bg-white p-6">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-4">Decision lineage</p>
            <div className="space-y-2">
              {LINEAGE.map((l, i) => (
                <React.Fragment key={l}>
                  <div className="text-sm font-medium text-[#0a0c12] px-3 py-2 rounded-md bg-[#f7f8fa] border border-[#eceef1]">{l}</div>
                  {i < LINEAGE.length - 1 && <div className="text-[#8a909c] text-xs pl-3">↓</div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#eceef1] bg-white p-6">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-4">Example</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965]">Decision</span>
                <span className="text-sm font-mono font-semibold text-[#b45309] bg-amber-50 border border-amber-200 rounded px-2 py-0.5">REVIEW</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965]">Risk signal</span>
                <span className="text-sm text-[#0a0c12]">High debt-to-income</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965]">Metric</span>
                <span className="text-sm font-mono text-[#0a0c12]">DTI 48.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965]">Source</span>
                <span className="text-sm text-[#0a0c12]">Bank statement</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525965]">Evidence</span>
                <span className="text-sm font-mono text-[#0a0c12]">Transactions · May 1 – Jul 31</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/evidence" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            Open evidence explorer <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}