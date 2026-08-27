import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck, FileText, Brain, GitBranch } from "lucide-react";

function ProductPreview() {
  return (
    <div className="w-full max-w-[480px]">
      <div className="rounded-xl border border-[#eceef1] bg-white overflow-hidden shadow-[0_2px_8px_rgba(10,12,18,0.06)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#eceef1] bg-[#fafbfc]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
          </div>
          <span className="text-[11px] font-mono text-[#8a909c] ml-2">Application #APP-10482</span>
          <span className="ml-auto text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">UNDER REVIEW</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#eceef1]">
          {["Overview", "Risk", "Policy", "Decision", "Evidence"].map((t, i) => (
            <button key={t} className={`text-[11px] px-2.5 py-1.5 rounded-t-md ${i === 1 ? "text-[#0a0c12] font-medium border-b-2 border-[#0d9488]" : "text-[#8a909c]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Borrower row */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#525965]">Borrower</span>
            <span className="font-medium text-[#0a0c12]">John Smith</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#525965]">Loan</span>
            <span className="font-medium text-[#0a0c12]">Personal Loan · £25,000</span>
          </div>

          {/* Risk signals */}
          <div className="pt-2 border-t border-[#eceef1]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-2">Risk signals</p>
            <div className="space-y-1.5">
              {[
                { label: "Income verified", flag: "pass", value: "£72,000/yr" },
                { label: "Debt-to-income", flag: "fail", value: "48.2%" },
                { label: "Credit score", flag: "pass", value: "712" },
                { label: "Recent delinquency", flag: "pass", value: "0" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center ${s.flag === "pass" ? "bg-emerald-50" : "bg-rose-50"}`}>
                      {s.flag === "pass" ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <span className="text-rose-600 text-[10px] font-bold">!</span>}
                    </span>
                    <span className="text-[#0a0c12]">{s.label}</span>
                  </div>
                  <span className="font-mono text-[#525965]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy evaluation */}
          <div className="pt-2 border-t border-[#eceef1]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-2">Policy: Consumer Lending v1</p>
            <div className="space-y-1">
              {[
                { rule: "Annual income ≥ £40,000", result: "PASS" },
                { rule: "DTI ≤ 45%", result: "FAIL" },
                { rule: "Credit score ≥ 650", result: "PASS" },
              ].map((r) => (
                <div key={r.rule} className="flex items-center justify-between text-[11px]">
                  <span className="text-[#525965]">{r.rule}</span>
                  <span className={`font-mono font-medium ${r.result === "PASS" ? "text-emerald-600" : "text-rose-600"}`}>{r.result}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision */}
          <div className="flex items-center justify-between pt-3 border-t border-[#eceef1]">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">AI recommendation</div>
              <div className="text-sm font-medium text-emerald-700">APPROVE</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">Policy decision</div>
              <div className="text-sm font-medium text-amber-700">REVIEW</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">Final</div>
              <div className="text-sm font-bold text-amber-700">REVIEW</div>
            </div>
          </div>
        </div>
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
              No-code underwriting platform
            </p>
            <h1 className="text-[2rem] sm:text-[2.75rem] font-semibold tracking-tight text-[#0a0c12] leading-[1.06]">
              Build your underwriting<br className="hidden sm:block" /> workflow without code.
            </h1>
            <p className="mt-6 text-lg text-[#525965] leading-relaxed">
              Connect borrower data, configure your lending policy, and make explainable
              credit decisions — without building an underwriting system from scratch.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#eceef1] bg-[#fafbfc] px-3 py-2">
              <span className="text-sm font-medium text-[#0a0c12]">Your data. Your policy. Your decision.</span>
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
              Create an account. Configure your policy. Run your first decision.
            </p>
          </div>

          <div className="flex md:justify-end">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}