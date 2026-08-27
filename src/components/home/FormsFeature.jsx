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
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">Borrower intake</p>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0a0c12] mb-4">
              Collect applications with white-label forms
            </h2>
            <p className="text-[#525965] leading-relaxed mb-5">
              Publish a branded intake form at /apply/:slug for any market. Borrowers submit their details
              plus market-specific KYC — NI, SSN, BVN + NIN and more. Each submission creates a verified
              borrower and a ready-to-underwrite application in your workspace. No API calls, no re-keying.
            </p>
            <ul className="space-y-2 text-sm text-[#525965]">
              {[
                "White-label branding, accent colour and logo",
                "Mandatory market-specific KYC on every form",
                "Submissions flow straight into your pipeline",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] mt-2 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <Link to="/forms" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
              Explore forms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-xl border border-[#eceef1] bg-white overflow-hidden shadow-[0_1px_3px_rgba(10,12,18,0.05)]">
            <div className="px-4 py-2.5 border-b border-[#eceef1] bg-[#fafbfc] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
              </div>
              <span className="text-[11px] font-mono text-[#8a909c] ml-2">acme-lending.com/apply/frm-7f2a</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-[#0d9488] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="text-sm font-semibold text-[#0a0c12]">Acme Lending — Apply</div>
              </div>
              <div className="space-y-2">
                {FIELDS.map((f) => (
                  <div key={f.label} className="rounded-lg border border-[#eceef1] bg-[#fafbfc] px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">{f.label}</div>
                    <div className="text-[12px] font-medium text-[#0a0c12]">{f.value}</div>
                  </div>
                ))}
                <div className="rounded-lg border border-[#0d9488]/30 bg-[#e6f7f3] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#0d9488]">KYC · National Insurance Number</div>
                      <div className="text-[12px] font-medium text-[#0a0c12]">QQ 12 34 56 C</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
                <div className="w-full text-center text-[12px] font-medium text-white bg-[#0d9488] rounded-lg py-2.5 mt-1">
                  Submit application
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] text-[#8a909c]">
                Creates a borrower + application in your workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}