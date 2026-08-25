import React from "react";
import { Download, Globe } from "lucide-react";

// Coverage across markets. bureau = credit bureau, banking = open banking.
const MARKETS = [
  {
    flag: "🇳🇬", name: "Nigeria",
    providers: [
      { name: "CRC", type: "bureau" }, { name: "FirstCentral", type: "bureau" }, { name: "CreditRegistry", type: "bureau" },
      { name: "Okra", type: "banking" }, { name: "Mono", type: "banking" },
    ],
  },
  {
    flag: "🇬🇭", name: "Ghana",
    providers: [{ name: "XDS Data", type: "bureau" }, { name: "Okra", type: "banking" }, { name: "Mono", type: "banking" }],
  },
  {
    flag: "🇰🇪", name: "Kenya",
    providers: [{ name: "CRB Africa", type: "bureau" }, { name: "TransUnion", type: "bureau" }, { name: "Okra", type: "banking" }, { name: "Mono", type: "banking" }],
  },
  {
    flag: "🇿🇦", name: "South Africa",
    providers: [{ name: "Experian", type: "bureau" }, { name: "TransUnion", type: "bureau" }, { name: "Stitch", type: "banking" }],
  },
  { flag: "🇪🇬", name: "Egypt", providers: [{ name: "I-Score", type: "bureau" }] },
  {
    flag: "🇬🇧", name: "United Kingdom",
    providers: [
      { name: "Experian", type: "bureau" }, { name: "Equifax", type: "bureau" }, { name: "TransUnion", type: "bureau" },
      { name: "TrueLayer", type: "banking" }, { name: "Yapily", type: "banking" },
    ],
  },
  {
    flag: "🇺🇸", name: "United States",
    providers: [{ name: "Experian", type: "bureau" }, { name: "Equifax", type: "bureau" }, { name: "TransUnion", type: "bureau" }, { name: "Plaid", type: "banking" }],
  },
];

const dotFor = (type) => (type === "banking" ? "bg-[#00e6b8]" : "bg-[#5b6472]");

export default function ProviderStrip() {
  return (
    <section className="border-b border-[#1c2029] bg-[#0a0c12]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-2">
              <Globe className="w-3.5 h-3.5 text-[#00e6b8]" /> Global coverage, local data
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Bring your own providers. We normalize the rest.
            </h2>
            <p className="mt-3 text-sm text-[#a0a5b0] leading-relaxed">
              Connect credit bureaus and open-banking providers across 7 markets. Provider differences disappear at the
              edge — every pull lands in one canonical profile.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#a0a5b0]">
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#5b6472]" /> Credit bureau</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00e6b8]" /> Open banking</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MARKETS.map((m) => (
            <div key={m.name} className="rounded-xl border border-[#2a2f3a] bg-[#13161f] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg leading-none">{m.flag}</span>
                <span className="font-medium text-white text-sm">{m.name}</span>
                <span className="ml-auto text-[10px] font-mono text-[#5b6472]">{m.providers.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {m.providers.map((p) => (
                  <span key={p.name} className="inline-flex items-center gap-1.5 text-xs text-[#c7ccd6] border border-[#2a2f3a] bg-[#0a0c12] rounded-md px-2 py-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotFor(p.type)}`} />
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-[#5b6472]">
          <Download className="w-3.5 h-3.5" />
          No providers yet? The sandbox uses deterministic mock data so you can explore the full flow.
        </div>
      </div>
    </section>
  );
}