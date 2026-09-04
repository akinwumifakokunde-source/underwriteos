import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const FIELDS = [
  { label: "First name", value: "John" },
  { label: "Last name", value: "Smith" },
  { label: "Loan amount", value: "£25,000" },
];

export default function FormsFeature() {
  return (
    <section className="border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">Borrower intake</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] mb-4">
              Collect applications with white-label forms
            </h2>
            <p className="text-[#525965] leading-relaxed mb-6">
              Publish a branded intake form at /apply/:slug for any market. Borrowers submit their details
              plus market-specific KYC — NI, SSN, BVN + NIN and more. Each submission creates a verified
              borrower and a ready-to-underwrite application in your workspace. No API calls, no re-keying.
            </p>
            <ul className="space-y-2.5 text-sm text-[#525965]">
              {[
                "White-label branding, accent colour and logo",
                "Mandatory market-specific KYC on every form",
                "Submissions flow straight into your pipeline",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] mt-2 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <Link to="/forms" className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
              Explore forms <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="group rounded-2xl border border-[#e8eaee] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_12px_40px_-12px_rgba(10,12,18,0.12)] transition-all duration-500 hover:shadow-[0_24px_70px_-24px_rgba(13,148,136,0.3)] hover:-translate-y-1">
            <div className="px-4 py-3 border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
              </div>
              <span className="text-[11px] font-mono text-[#8a909c] ml-2">acme-lending.com/apply/frm-7f2a</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#0d9488] to-[#0b7d72] flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="text-sm font-semibold text-[#0a0c12]">Acme Lending — Apply</div>
              </div>
              <div className="space-y-2.5">
                {FIELDS.map((f) => (
                  <div key={f.label} className="rounded-xl border border-[#eceef1] bg-[#fafbfc] px-3.5 py-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">{f.label}</div>
                    <div className="text-[12px] font-medium text-[#0a0c12]">{f.value}</div>
                  </div>
                ))}
                <div className="rounded-xl border border-[#0d9488]/30 bg-gradient-to-b from-[#e6f7f3] to-[#d9f2ec] px-3.5 py-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#0d9488]">KYC · National Insurance Number</div>
                      <div className="text-[12px] font-medium text-[#0a0c12]">QQ 12 34 56 C</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
                <div className="w-full text-center text-[12px] font-medium text-white bg-gradient-to-b from-[#0d9488] to-[#0b7d72] rounded-xl py-2.5 mt-1 shadow-sm">
                  Submit application
                </div>
              </div>
              <p className="mt-4 text-center text-[10px] text-[#8a909c]">
                Creates a borrower + application in your workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}