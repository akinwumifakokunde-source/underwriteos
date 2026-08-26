import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

function DecisionCard() {
  return (
    <div className="w-full max-w-[400px]">
      <p className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-2">Synthetic example</p>
      <div className="rounded-lg border border-[#eceef1] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04)]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#eceef1] bg-[#fafbfc]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c]">Underwriting decision</span>
          <span className="text-[11px] font-mono text-[#8a909c]">consumer-v1</span>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#0a0c12]">APPROVE</span>
            <span className="text-xs font-mono text-[#0d9488] bg-[#e6f7f3] rounded px-1.5 py-0.5">decision</span>
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#525965]">Risk score</span>
              <span className="font-mono text-[#0a0c12]">34</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#525965]">Probability of default</span>
              <span className="font-mono text-[#0a0c12]">6.1%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#525965]">Confidence</span>
              <span className="font-mono text-[#0a0c12]">88%</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#eceef1]">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-2">Risk signals</p>
            <ul className="space-y-1.5">
              {["Income verified", "DTI within policy", "No recent delinquency"].map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-[#0a0c12]">
                  <Check className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-[#eceef1] bg-[#fafbfc]">
          <p className="text-[11px] font-mono text-[#8a909c] mb-1.5">
            Policy: consumer-v1 · 3 rules passed · Evidence available
          </p>
          <Link to="/evidence" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            View evidence <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="mt-2 text-[10px] text-[#b0b5be]">Synthetic borrower data. No real borrower information.</p>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-5">
              API infrastructure for lenders & fintechs
            </p>
            <h1 className="text-[2rem] sm:text-[2.75rem] font-semibold tracking-tight text-[#0a0c12] leading-[1.06]">
              Underwriting infrastructure,<br className="hidden sm:block" /> delivered as an API.
            </h1>
            <p className="mt-6 text-lg text-[#525965] leading-relaxed">
              Connect financial data from credit bureaus, bank accounts and financial documents.
              UnderwriteOS normalizes the data, analyzes risk, applies your policy and returns an
              explainable decision.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#eceef1] bg-[#fafbfc] px-3 py-2">
              <span className="text-sm font-medium text-[#0a0c12]">Connect data. Apply policy. Make faster, explainable decisions.</span>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

          <div className="flex md:justify-end">
            <DecisionCard />
          </div>
        </div>
      </div>
    </section>
  );
}