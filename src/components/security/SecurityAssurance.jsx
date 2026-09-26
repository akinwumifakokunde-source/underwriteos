import React from "react";
import { ShieldCheck } from "lucide-react";

const ASSURANCE = [
  { label: "SOC 2 Type I", status: "In progress" },
  { label: "ISO/IEC 27001:2022", status: "Certification in progress" },
  { label: "SOC 2 Type II", status: "Planned" },
];

export default function SecurityAssurance() {
  return (
    <div className="rounded-2xl border border-[#eceef1] bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#525965]">
          Independent assurance
        </h2>
      </div>
      <p className="text-sm text-[#525965] leading-relaxed mb-5">
        CreditDecide is working towards ISO/IEC 27001:2022 certification and SOC 2 Type I.
        Our security programme covers the systems, infrastructure and processes supporting
        the CreditDecide platform.
      </p>
      <div className="divide-y divide-[#eceef1]">
        {ASSURANCE.map((a) => (
          <div key={a.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-[#3a3f4a]">{a.label}</span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                a.status === "Planned"
                  ? "text-[#8a909c] bg-[#f2f3f5]"
                  : "text-amber-700 bg-amber-50"
              }`}
            >
              {a.status}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-5 pt-4 border-t border-[#eceef1] text-[13px] text-[#525965] leading-relaxed">
        Customer data is protected through layered access controls, tenant isolation,
        encryption, auditability and controlled data handling across the underwriting workflow.
      </p>
    </div>
  );
}