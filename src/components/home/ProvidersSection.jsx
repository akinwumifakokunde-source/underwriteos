import React from "react";

const BADGE = {
  available: "text-[#0d9488] border-[#99e6d8] bg-[#e6f7f3]",
  sandbox: "text-[#0a0c12] border-[#e5e7eb] bg-white",
  coming: "text-[#8a909c] border-[#eceef1] bg-[#f7f8fa]",
};
const BADGE_LABEL = { available: "Available", sandbox: "Sandbox", coming: "Coming soon" };

const CATEGORIES = [
  {
    title: "Credit bureaus",
    items: [
      { name: "Experian", status: "available" },
      { name: "Equifax", status: "available" },
      { name: "TransUnion", status: "available" },
      { name: "CRC", status: "available" },
      { name: "FirstCentral", status: "available" },
      { name: "CreditRegistry", status: "available" },
      { name: "XDS Data", status: "available" },
      { name: "CRB Africa", status: "available" },
      { name: "I-Score", status: "available" },
    ],
  },
  {
    title: "Open banking",
    items: [
      { name: "TrueLayer", status: "available" },
      { name: "Yapily", status: "available" },
      { name: "Plaid", status: "available" },
      { name: "Okra", status: "available" },
      { name: "Mono", status: "available" },
      { name: "Stitch", status: "available" },
    ],
  },
  {
    title: "Financial documents",
    items: [{ name: "PDF, CSV, JSON, images", status: "available" }],
  },
];

const MARKETS = [
  { name: "United Kingdom", status: "available" },
  { name: "United States", status: "available" },
  { name: "Nigeria", status: "available" },
  { name: "Ghana", status: "available" },
  { name: "Kenya", status: "available" },
  { name: "South Africa", status: "available" },
];

export default function ProvidersSection() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">
            Bring your data. We normalize the rest.
          </h2>
          <p className="mt-4 text-lg text-[#525965] leading-relaxed">
            Use your existing credit and financial-data providers. UnderwriteOS maps provider-specific data into a
            consistent underwriting model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#0a0c12] mb-4">{cat.title}</h3>
              <div className="space-y-2.5">
                {cat.items.map((it) => (
                  <div key={it.name} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#3a3f4a]">{it.name}</span>
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
          <p className="font-mono text-xs uppercase tracking-wider text-[#8a909c] mb-4">Designed for regional data providers</p>
          <div className="flex flex-wrap gap-2">
            {MARKETS.map((m) => (
              <div key={m.name} className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2">
                <span className="text-sm text-[#0a0c12]">{m.name}</span>
                <span className={`text-[10px] font-mono uppercase tracking-wider ${m.status === "available" ? "text-[#0d9488]" : "text-[#8a909c]"}`}>
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