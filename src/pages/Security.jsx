import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Lock, KeyRound, FileSearch, Boxes, GitBranch, ClipboardCheck } from "lucide-react";
import HomeNav from "@/components/layout/HomeNav.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";
import ResponsibleAIGovernance from "@/components/security/ResponsibleAIGovernance.jsx";

const PILLARS = [
  { icon: Boxes, title: "Tenant isolation", desc: "Every record is scoped to an organization. Row-Level Security enforces isolation at the data layer — one tenant can never read or mutate another's data." },
  { icon: KeyRound, title: "Credential vaulting", desc: "Provider credentials (Experian, TrueLayer) are stored per-organization and used only for outbound calls. Secrets are never returned in full by the API." },
  { icon: Lock, title: "API key security", desc: "API keys are SHA-256 hashed at rest; the full key is shown once at creation. Keys are environment-scoped (sandbox vs production) with granular scopes." },
  { icon: FileSearch, title: "Audit trail", desc: "Every request carries a request_id and is logged with actor, endpoint, and outcome — giving lenders a defensible record of who decided what, and why." },
  { icon: GitBranch, title: "Environment isolation", desc: "Sandbox and production data never mix. Test with synthetic data, then promote to live with a production key and your own provider credentials." },
  { icon: ShieldCheck, title: "Explainable decisions", desc: "Each recommendation is backed by an evidence graph — every risk signal traces to its source document and confidence score. No black-box overrides." },
];

const ROADMAP = [
  { label: "Encryption at rest & in transit", status: "Implemented" },
  { label: "RBAC & organization-level access controls", status: "Shipped" },
  { label: "API key hashing & credential protection", status: "Shipped" },
  { label: "Audit trail & immutable decision history", status: "Shipped" },
  { label: "Tenant isolation & RLS", status: "Shipped" },
  { label: "Sandbox / production isolation", status: "Shipped" },
  { label: "Data retention & deletion controls", status: "Implemented" },
  { label: "GDPR controls & DPA", status: "Implemented" },
  { label: "Data residency / cross-border data controls", status: "Roadmap" },
  { label: "SOC 2 Type I", status: "In progress" },
  { label: "SOC 2 Type II", status: "Roadmap" },
  { label: "ISO 27001", status: "Future roadmap" },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-14">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d9488] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Security & trust
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-[#0a0c12]">
            Built for regulated lending.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            CreditDecide handles sensitive financial data. Security, isolation, and auditability are designed in from
            the data layer up — not bolted on.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#eceef1] rounded-2xl overflow-hidden border border-[#e5e7eb]">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-white p-6">
              <div className="w-9 h-9 rounded-lg bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-center mb-3.5">
                <p.icon className="w-4 h-4 text-[#0d9488]" />
              </div>
              <h3 className="font-medium text-[#0a0c12] mb-1">{p.title}</h3>
              <p className="text-sm text-[#525965] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ResponsibleAIGovernance />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#eceef1] bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck className="w-4 h-4 text-[#0d9488]" />
              <h2 className="text-sm font-medium uppercase tracking-wider text-[#525965]">Security &amp; compliance roadmap</h2>
            </div>
            <div className="divide-y divide-[#eceef1]">
              {ROADMAP.map((r) => (
                <div key={r.label} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[#3a3f4a]">{r.label}</span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      r.status === "Shipped" || r.status === "Implemented"
                        ? "text-[#0d9488] bg-[#e6f7f3]"
                        : r.status === "In progress"
                        ? "text-amber-700 bg-amber-50"
                        : "text-[#8a909c] bg-[#f2f3f5]"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#eceef1] bg-white p-6 flex flex-col">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#525965] mb-4">Need a security review?</h2>
            <p className="text-sm text-[#525965] leading-relaxed">
              We work with lenders and fintechs on data processing agreements, penetration testing, and onboarding
              reviews. Start building in the sandbox, then request a security package when you're ready for production.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/onboarding" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors">
                Start building <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/architecture" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] border border-[#e5e7eb] px-4 py-2.5 rounded-lg hover:bg-[#f2f3f5] transition-colors">
                View architecture
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}