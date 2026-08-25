import React from "react";
import { Download, ShieldCheck, Landmark } from "lucide-react";

const PROVIDERS = [
  { icon: ShieldCheck, name: "Experian", kind: "Credit bureau", note: "Auto-pull credit reports" },
  { icon: Landmark, name: "TrueLayer", kind: "Open banking", note: "Auto-pull bank statements" },
];

export default function ProviderStrip() {
  return (
    <section className="border-b border-[#1c2029] bg-[#0a0c12]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="lg:max-w-xs shrink-0">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-2">
              <Download className="w-3.5 h-3.5 text-[#00e6b8]" /> Automated data collection
            </div>
            <p className="text-sm text-[#c7ccd6] leading-relaxed">
              No more manual uploads. Pull credit and financial data directly from connected providers — normalized into one canonical profile.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {PROVIDERS.map((p) => (
              <div key={p.name} className="rounded-xl border border-[#2a2f3a] bg-[#13161f] p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#0a0c12] border border-[#2a2f3a] flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5 text-[#00e6b8]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{p.name}</span>
                    <span className="text-[10px] font-mono text-[#5b6472] border border-[#2a2f3a] rounded px-1.5 py-0.5">{p.kind}</span>
                  </div>
                  <p className="text-xs text-[#a0a5b0] mt-0.5">{p.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}