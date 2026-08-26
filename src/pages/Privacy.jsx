import React from "react";
import HomeNav from "@/components/layout/HomeNav.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";

const SECTIONS = [
  {
    title: "Data we process",
    body: "UnderwriteOS processes borrower financial data you submit or pull through connected providers — credit reports, bank transactions, and borrower declarations — solely to produce normalized profiles, risk signals, and underwriting decisions for your organization.",
  },
  {
    title: "Data isolation",
    body: "Every record is scoped to your organization and enforced by Row-Level Security at the data layer. No other tenant can read, query, or mutate your data. Sandbox and production environments are fully isolated and never share records or credentials.",
  },
  {
    title: "Credential storage",
    body: "Provider credentials (credit bureaus, open banking) you store are encrypted at rest, scoped to your organization, and used only for outbound provider calls. Client secrets are never returned in full by the API and are masked in the dashboard.",
  },
  {
    title: "API keys",
    body: "API keys are SHA-256 hashed at rest. The full key is shown once at creation or rotation and cannot be recovered. Keys are environment-scoped (sandbox uw_test_ or production uw_live_) and carry granular scopes that limit what each key can do.",
  },
  {
    title: "Retention",
    body: "You can delete applications, borrowers, and associated data at any time via the API or dashboard. Deleted records are removed from active query results. Audit events are retained to maintain a defensible decision history as required by regulated lending.",
  },
  {
    title: "Sub-processors",
    body: "We rely on infrastructure and AI providers to run the platform. Data is processed to deliver underwriting intelligence and is not sold or shared for marketing. A current list of sub-processors is available on request.",
  },
  {
    title: "Your rights",
    body: "You control the data in your organization. You may export, correct, or delete records at any time. For data subject requests concerning individual borrowers, coordinate through your organization as the data controller.",
  },
  {
    title: "Contact",
    body: "Questions about this policy or a data request? Contact us at akinfaks@yahoo.com.",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-[#0a0c12]">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-[#8a909c]">Last updated: August 2026</p>
        <p className="mt-6 text-lg text-[#525965] leading-relaxed">
          UnderwriteOS is underwriting infrastructure. This policy explains what data we process on your behalf, how it
          is isolated and protected, and the controls available to you.
        </p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s, i) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-[#0a0c12]">
                <span className="font-mono text-xs text-[#8a909c] mr-2">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <p className="mt-2 text-[15px] text-[#525965] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}