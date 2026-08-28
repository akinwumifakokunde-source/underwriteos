import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const PILLARS = [
  "Document intelligence", "Policy engine", "AI underwriter", "Affordability",
  "Risk signals", "Decision lineage", "Multi-market", "Post-decision monitoring",
];

function ProductPreview() {
  return (
    <div className="w-full max-w-[480px]">
      <div className="rounded-2xl border border-[#e8eaee] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_20px_50px_-20px_rgba(10,12,18,0.15)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
          </div>
          <span className="text-[11px] font-mono text-[#8a909c] ml-2">Application #APP-10482</span>
          <span className="ml-auto text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">UNDER REVIEW</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#eceef1] overflow-x-auto no-scrollbar">
          {["Overview", "Financial Profile", "Risk Signals", "Evidence", "Audit Trail"].map((t, i) => (
            <button key={t} className={`shrink-0 text-[11px] px-2.5 py-1.5 rounded-t-md transition-colors ${i === 2 ? "text-[#0a0c12] font-medium border-b-2 border-[#0d9488]" : "text-[#8a909c] hover:text-[#525965]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 bg-gradient-to-b from-white to-[#fcfcfd]">
          {/* Borrower row */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#8a909c]">Borrower</span>
            <span className="font-medium text-[#0a0c12]">John Smith</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#8a909c]">Market</span>
            <span className="font-medium text-[#0a0c12]">United Kingdom · £25,000</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#8a909c]">Data sources</span>
            <span className="font-medium text-[#0d9488] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Experian · TrueLayer connected
            </span>
          </div>

          {/* Risk dimensions */}
          <div className="pt-3 border-t border-[#eceef1]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-2.5">Risk dimensions</p>
            <div className="space-y-2">
              {[
                { label: "Credit risk", flag: "pass", value: "712" },
                { label: "Affordability", flag: "fail", value: "DTI 48.2%" },
                { label: "Fraud", flag: "pass", value: "Clear" },
                { label: "Data quality", flag: "pass", value: "Verified" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center ${s.flag === "pass" ? "bg-emerald-50" : "bg-rose-50"}`}>
                      {s.flag === "pass" ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <span className="text-rose-600 text-[10px] font-bold">!</span>}
                    </span>
                    <span className="text-[#0a0c12]">{s.label}</span>
                  </div>
                  <span className="font-mono text-[#8a909c]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy evaluation */}
          <div className="pt-3 border-t border-[#eceef1]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-2.5">Policy: Consumer Lending v1</p>
            <div className="space-y-1.5">
              {[
                { rule: "Annual income ≥ £40,000", result: "PASS" },
                { rule: "DTI ≤ 45%", result: "FAIL" },
                { rule: "Credit score ≥ 650", result: "PASS" },
              ].map((r) => (
                <div key={r.rule} className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8a909c]">{r.rule}</span>
                  <span className={`font-mono font-medium ${r.result === "PASS" ? "text-emerald-600" : "text-rose-600"}`}>{r.result}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#eceef1]">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#8a909c]">AI advisory</div>
              <div className="text-[13px] font-medium text-emerald-700">APPROVE</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#8a909c]">Policy</div>
              <div className="text-[13px] font-medium text-amber-700">REVIEW</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#8a909c]">Final</div>
              <div className="text-[13px] font-bold text-amber-700">REVIEW</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#8a909c]">
        <Sparkles className="w-3 h-3 text-[#0d9488]" />
        Live workspace preview
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1]">
      {/* Mint gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#0d9488]/[0.06] rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
              No-code underwriting platform
            </div>
            <h1 className="text-[2.25rem] sm:text-[3.5rem] font-semibold tracking-tight text-[#0a0c12] leading-[1.04]">
              Underwrite borrowers anywhere, in <span className="text-[#0d9488]">minutes.</span>
            </h1>
            <p className="mt-6 text-lg text-[#525965] leading-relaxed max-w-md">
              AI-native credit assessment built for lending globally. Turn messy borrower documents
              and financial data into decision-ready files — with your policy in control.
            </p>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {PILLARS.map((p) => (
                <span key={p} className="text-[11px] font-medium text-[#525965] bg-white border border-[#eceef1] rounded-full px-2.5 py-1 shadow-sm">{p}</span>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                to="/onboarding"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all shadow-sm hover:shadow-md"
              >
                Start underwriting <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-5 py-3 rounded-full hover:bg-[#f7f8fa] hover:border-[#d0d3d8] transition-all"
              >
                View pricing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-[11px] font-mono uppercase tracking-wider text-[#8a909c]">
              <span>6 markets supported</span>
              <span className="hidden sm:inline text-[#d0d3d8]">·</span>
              <span>5 risk dimensions</span>
              <span className="hidden sm:inline text-[#d0d3d8]">·</span>
              <span>Full evidence lineage</span>
            </div>
          </div>

          <div className="flex md:justify-end">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}