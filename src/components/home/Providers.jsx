import React from "react";

const CREDIT = ["Experian", "Equifax", "TransUnion", "CRC", "FirstCentral", "CreditRegistry", "XDS Data", "CRB Africa", "I-Score"];
const OPEN_BANKING = ["TrueLayer", "Yapily", "Plaid", "Okra", "Mono", "Stitch"];
const DOCUMENTS = ["PDF", "CSV", "JSON", "Images"];

function Category({ title, note, items, accent }) {
  return (
    <div className="group rounded-xl border border-[#eceef1] bg-white p-5 transition-all duration-300 hover:shadow-md hover:border-[#0d9488]/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#0a0c12] uppercase tracking-wide flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${accent}`} /> {title}
        </h3>
        <span className="text-[11px] font-mono text-[#8a909c]">{note}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((p) => (
          <span key={p} className="text-sm text-[#525965] px-2.5 py-1.5 rounded-md bg-[#f7f8fa] border border-[#eceef1] transition-all duration-200 hover:scale-105 hover:border-[#0d9488]/40 hover:text-[#0a0c12]">{p}</span>
        ))}
      </div>
    </div>
  );
}

export default function Providers() {
  return (
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Bring your own data</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Bring the financial data you already have.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          CreditDecide normalizes provider-specific credit, banking and financial data into a
          consistent underwriting model.
        </p>

        <p className="mt-8 text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-3">Example data sources</p>
        <div className="space-y-4">
          <Category title="Credit" note="Bring your own credentials" items={CREDIT} accent="from-teal-400 to-emerald-500" />
          <Category title="Open banking" note="Bring your own credentials" items={OPEN_BANKING} accent="from-sky-400 to-indigo-500" />
          <Category title="Documents" note="Supported formats" items={DOCUMENTS} accent="from-amber-400 to-orange-500" />
        </div>
      </div>
    </section>
  );
}