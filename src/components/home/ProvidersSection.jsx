import React from "react";

const BADGE = {
  available: "text-[#00e6b8] border-[#1f3a36] bg-[#0c1715]",
  sandbox: "text-white border-[#2a2f3a] bg-[#13161f]",
  coming: "text-[#5b6472] border-[#1c2029] bg-[#0a0c12]",
};
const BADGE_LABEL = { available: "Available", sandbox: "Sandbox", coming: "Coming soon" };

const CATEGORIES = [
  {
    title: "Credit bureaus",
    items: [
      { name: "Experian", status: "sandbox" },
      { name: "Equifax", status: "coming" },
      { name: "TransUnion", status: "coming" },
      { name: "CRC", status: "coming" },
      { name: "FirstCentral", status: "coming" },
      { name: "CreditRegistry", status: "coming" },
      { name: "XDS Data", status: "coming" },
      { name: "CRB Africa", status: "coming" },
      { name: "I-Score", status: "coming" },
    ],
  },
  {
    title: "Open banking",
    items: [
      { name: "TrueLayer", status: "sandbox" },
      { name: "Yapily", status: "coming" },
      { name: "Plaid", status: "coming" },
      { name: "Okra", status: "coming" },
      { name: "Mono", status: "coming" },
      { name: "Stitch", status: "coming" },
    ],
  },
  {
    title: "Financial documents",
    items: [{ name: "PDF, CSV, JSON, images", status: "available" }],
  },
];

const MARKETS = [
  { name: "United Kingdom", status: "sandbox" },
  { name: "United States", status: "sandbox" },
  { name: "Nigeria", status: "coming" },
  { name: "Ghana", status: "coming" },
  { name: "Kenya", status: "coming" },
  { name: "South Africa", status: "coming" },
];

export default function ProvidersSection() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            Bring your data. We normalize the rest.
          </h2>
          <p className="mt-4 text-lg text-[#a0a5b0] leading-relaxed">
            Use your existing credit and financial-data providers. UnderwriteOS maps provider-specific data into a
            consistent underwriting model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="rounded-2xl border border-[#2a2f3a] bg-[#0a0c12] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">{cat.title}</h3>
              <div className="space-y-2.5">
                {cat.items.map((it) => (
                  <div key={it.name} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#c7ccd6]">{it.name}</span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider rounded border px-1.5 py-0.5 ${BADGE[it.status]}`}>
                      {BADGE_LABEL[it.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="font-mono text-xs uppercase tracking-wider text-[#5b6472] mb-4">Designed for regional data providers</p>
          <div className="flex flex-wrap gap-2">
            {MARKETS.map((m) => (
              <div key={m.name} className="inline-flex items-center gap-2 rounded-lg border border-[#2a2f3a] bg-[#13161f] px-3 py-2">
                <span className="text-sm text-white">{m.name}</span>
                <span className={`text-[10px] font-mono uppercase tracking-wider ${m.status === "sandbox" ? "text-[#00e6b8]" : "text-[#5b6472]"}`}>
                  {BADGE_LABEL[m.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}