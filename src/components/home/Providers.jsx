import React from "react";

const CREDIT = ["Experian", "Equifax", "TransUnion", "CRC", "FirstCentral", "CreditRegistry", "XDS Data", "CRB Africa", "I-Score"];
const OPEN_BANKING = ["TrueLayer", "Yapily", "Plaid", "Okra", "Mono", "Stitch"];
const DOCUMENTS = ["PDF", "CSV", "JSON", "Images"];

function Category({ title, note, items }) {
  return (
    <div className="rounded-lg border border-[#eceef1] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#0a0c12]">{title}</h3>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] border border-[#eceef1] rounded px-2 py-0.5">{note}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((p) => (
          <span key={p} className="text-sm text-[#525965] px-2.5 py-1.5 rounded-md bg-[#f7f8fa] border border-[#eceef1]">{p}</span>
        ))}
      </div>
    </div>
  );
}

export default function Providers() {
  return (
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Bring your own data</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Bring your providers. We normalize the rest.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          Use the credit bureaus and financial-data providers you already work with. UnderwriteOS
          maps provider-specific data into a consistent underwriting model.
        </p>

        <div className="mt-10 space-y-5">
          <Category title="Credit" note="Bring your own credentials" items={CREDIT} />
          <Category title="Open banking" note="Bring your own credentials" items={OPEN_BANKING} />
          <Category title="Documents" note="Supported formats" items={DOCUMENTS} />
        </div>
      </div>
    </section>
  );
}