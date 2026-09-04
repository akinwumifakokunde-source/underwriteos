import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, GripVertical } from "lucide-react";

const RULES = [
  { field: "Annual income", op: "≥", value: "£40,000", outcome: "APPROVE", pass: true },
  { field: "Debt-to-income", op: "≤", value: "45%", outcome: "REVIEW", pass: false },
  { field: "Credit score", op: "≥", value: "650", outcome: "APPROVE", pass: true },
  { field: "Recent delinquency", op: "=", value: "0", outcome: "APPROVE", pass: true },
];

export default function PolicyBuilderShowcase() {
  return (
    <section className="border-b border-[#eceef1] bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">Policy builder</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] mb-4">
              Configure your lending policy visually
            </h2>
            <p className="text-[#525965] leading-relaxed mb-6">
              Add rules, set thresholds, and define outcomes — all without writing code.
              Your policy is the authoritative decision engine. The AI assists, but your rules decide.
            </p>
            <ul className="space-y-2.5 text-sm text-[#525965]">
              {[
                "Add, edit, reorder, and delete rules visually",
                "AND / OR conditions with field selection",
                "Define APPROVE, REVIEW, or DECLINE outcomes",
                "Versioned policies — never overwrite an active version",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] mt-2 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <Link to="/policies" className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
              Explore the policy builder <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="group rounded-2xl border border-[#e8eaee] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_12px_40px_-12px_rgba(10,12,18,0.12)] transition-all duration-500 hover:shadow-[0_24px_70px_-24px_rgba(13,148,136,0.3)] hover:-translate-y-1">
            <div className="px-5 py-4 border-b border-[#eceef1] flex items-center justify-between bg-gradient-to-r from-teal-50 via-white to-indigo-50">
              <div>
                <div className="text-sm font-semibold text-[#0a0c12]">Consumer Lending v1</div>
                <div className="text-[11px] text-[#8a909c]">Active · 4 rules · v1.0</div>
              </div>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">ACTIVE</span>
            </div>
            <div className="p-4 space-y-2.5">
              {RULES.map((r, i) => (
                <div key={i} className="group flex flex-wrap items-center gap-2.5 rounded-xl border border-[#eceef1] bg-[#fafbfc] px-3.5 py-3 transition-all duration-200 hover:bg-white hover:border-[#0d9488]/40 hover:shadow-sm hover:translate-x-0.5">
                  <GripVertical className="w-3.5 h-3.5 text-[#b0b5be] shrink-0" />
                  <div className="flex-1 min-w-0 flex items-center gap-2 text-[12px] flex-wrap">
                    <span className="font-medium text-[#0a0c12]">{r.field}</span>
                    <span className="text-[#8a909c] font-mono">{r.op}</span>
                    <span className="font-mono text-[#0a0c12]">{r.value}</span>
                  </div>
                  <span className={`text-[10px] font-medium rounded-full px-2.5 py-0.5 ${r.outcome === "APPROVE" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-amber-700 bg-amber-50 border border-amber-200"}`}>
                    {r.outcome}
                  </span>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-1.5 text-[12px] text-[#8a909c] hover:text-[#0a0c12] rounded-xl border border-dashed border-[#d0d3d8] py-2.5 hover:bg-[#fafbfc] transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add rule
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}