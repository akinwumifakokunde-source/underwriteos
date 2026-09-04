import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ScrollText, FileSpreadsheet, FileJson, ShieldCheck } from "lucide-react";

const JURISDICTIONS = [
  { code: "US", label: "United States", framework: "ECOA · FCRA §615" },
  { code: "GB", label: "United Kingdom", framework: "CONC 11" },
  { code: "NG", label: "Nigeria", framework: "CBN Consumer Protection" },
  { code: "ZA", label: "South Africa", framework: "NCA §62" },
  { code: "KE", label: "Kenya", framework: "CBK Prudential" },
  { code: "GH", label: "Ghana", framework: "BoG Consumer Credit" },
];

const OUTPUTS = [
  {
    icon: ScrollText,
    title: "Adverse-action notices",
    desc: "Market-specific letters addressed to the borrower, naming the credit bureau consulted and stating the applicant's rights.",
    tag: "PDF",
    grad: "from-teal-400 to-emerald-500",
  },
  {
    icon: FileSpreadsheet,
    title: "Reason codes",
    desc: "FCRA-style reason codes mapped from the negative and critical risk signals that drove the decision — capped to the four key factors.",
    tag: "CSV",
    grad: "from-sky-400 to-indigo-500",
  },
  {
    icon: FileJson,
    title: "Audit exports",
    desc: "The full decision with every risk signal and its evidence record, so an examiner can trace each figure to its source document.",
    tag: "JSON",
    grad: "from-amber-400 to-orange-500",
  },
];

export default function RegulatoryOutputs() {
  return (
    <section className="border-b border-[#eceef1] bg-gradient-to-b from-[#fcfcfd] to-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Compliance, automated</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Regulatory outputs, <span className="text-[#0d9488]">straight from the evidence graph.</span>
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          Every decline or review automatically generates the disclosures and audit trail your regulators
          expect — derived from the same evidence that informed the decision, not bolted on afterwards.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {OUTPUTS.map((o) => (
            <div key={o.title} className="group rounded-2xl border border-[#eceef1] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${o.grad} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <o.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] border border-[#eceef1] rounded px-1.5 py-0.5">{o.tag}</span>
              </div>
              <h3 className="text-base font-semibold text-[#0a0c12]">{o.title}</h3>
              <p className="mt-2 text-sm text-[#525965] leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#eceef1] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c]">Supported frameworks</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {JURISDICTIONS.map((j) => (
              <div key={j.code} className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-white bg-[#0a0c12] rounded px-1.5 py-0.5">{j.code}</span>
                <div>
                  <div className="text-sm font-medium text-[#0a0c12]">{j.label}</div>
                  <div className="text-[11px] text-[#8a909c]">{j.framework}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Link to="/applications" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            See it in a decision <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}