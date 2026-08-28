import React from "react";
import HomeNav from "@/components/layout/HomeNav.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";

const SECTIONS = [
  {
    title: "Service",
    body: "GoUnderwriteOS provides API-first underwriting infrastructure: financial data normalization, risk signaling, policy evaluation, and decisioning intelligence. We provide intelligence and workflow infrastructure; we do not make lending decisions for you and do not disburse funds or process payments.",
  },
  {
    title: "Your responsibilities",
    body: "You are responsible for the accuracy of data you submit, for obtaining necessary consents from borrowers before pulling credit or bank data, and for the final lending decisions you make using our output. You must comply with applicable lending, credit reporting, and data protection laws in every market you operate.",
  },
  {
    title: "Acceptable use",
    body: "You may not use the service to process data you lack rights to, to evade legal restrictions, or to build a competing underwriting infrastructure for resale. Reverse engineering, scraping, or attempting to extract another tenant's data is prohibited.",
  },
  {
    title: "API keys & access",
    body: "You are responsible for safeguarding your API keys. Keys are environment-scoped and hashed at rest. Rotate or revoke keys if you suspect compromise. We may suspend access for keys or accounts involved in abuse, fraud, or repeated policy violations.",
  },
  {
    title: "Billing & usage",
    body: "The service is usage-based. You buy credits and consume them with billable API calls. Credits do not expire. Sandbox usage is free while you build. We may change credit pricing for future purchases with reasonable notice; existing balances are honored.",
  },
  {
    title: "Service availability",
    body: "We target high availability but do not guarantee uninterrupted service. Scheduled maintenance and incidents are communicated through the dashboard. Sandbox and production environments are maintained independently.",
  },
  {
    title: "Intellectual property",
    body: "We retain rights to the platform, including normalization models, the risk engine, and policy evaluation logic. You retain all rights to your borrower data, decisions, and derived outputs. Feedback you provide may be used to improve the service.",
  },
  {
    title: "Limitation of liability",
    body: "The service is provided as infrastructure. To the maximum extent permitted by law, GoUnderwriteOS is not liable for indirect, incidental, or consequential damages arising from use of the service, including lending decisions made on our output.",
  },
  {
    title: "Changes & termination",
    body: "We may update these terms with reasonable notice. You may stop using the service and export your data at any time. We may suspend or terminate accounts for non-payment or material breach, with prior notice where appropriate.",
  },
  {
    title: "Contact",
    body: "Questions about these terms? Contact us at akinfaks@yahoo.com.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-24">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d9488] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-[#0a0c12]">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-[#8a909c]">Last updated: August 2026</p>
        <p className="mt-6 text-lg text-[#525965] leading-relaxed">
          These terms govern your use of GoUnderwriteOS. By creating an organization or calling the API, you agree to them.
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