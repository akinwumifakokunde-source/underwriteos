import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Lock, KeyRound, FileSearch, Boxes, GitBranch, ClipboardCheck } from "lucide-react";
import HomeNav from "@/components/layout/HomeNav.jsx";

const PILLARS = [
  { icon: Boxes, title: "Tenant isolation", desc: "Every record is scoped to an organization. Row-Level Security enforces isolation at the data layer — one tenant can never read or mutate another's data." },
  { icon: KeyRound, title: "Credential vaulting", desc: "Provider credentials (Experian, TrueLayer) are stored per-organization and used only for outbound calls. Secrets are never returned in full by the API." },
  { icon: Lock, title: "API key security", desc: "API keys are SHA-256 hashed at rest; the full key is shown once at creation. Keys are environment-scoped (sandbox vs production) with granular scopes." },
  { icon: FileSearch, title: "Audit trail", desc: "Every request carries a request_id and is logged with actor, endpoint, and outcome — giving lenders a defensible record of who decided what, and why." },
  { icon: GitBranch, title: "Environment isolation", desc: "Sandbox and production data never mix. Test with synthetic data, then promote to live with a production key and your own provider credentials." },
  { icon: ShieldCheck, title: "Explainable decisions", desc: "Each recommendation is backed by an evidence graph — every risk signal traces to its source document and confidence score. No black-box overrides." },
];

const ROADMAP = [
  { label: "Tenant isolation & RLS", status: "Shipped" },
  { label: "Audit logging & request IDs", status: "Shipped" },
  { label: "Credential vaulting", status: "Shipped" },
  { label: "Sandbox / production isolation", status: "Shipped" },
  { label: "SOC 2 Type I", status: "In progress" },
  { label: "SOC 2 Type II", status: "Roadmap" },
  { label: "GDPR / DPA", status: "Roadmap" },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      <HomeNav />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Security & trust
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
            Built for regulated lending.
          </h1>
          <p className="mt-6 text-lg text-[#a0a5b0] leading-relaxed">
            UnderwriteOS handles sensitive financial data. Security, isolation, and auditability are designed in from
            the data layer up — not bolted on.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1c2029] rounded-2xl overflow-hidden border border-[#2a2f3a]">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-[#13161f] p-6">
              <div className="w-9 h-9 rounded-lg bg-[#0a0c12] border border-[#2a2f3a] flex items-center justify-center mb-3.5">
                <p.icon className="w-4 h-4 text-[#00e6b8]" />
              </div>
              <h3 className="font-medium text-white mb-1">{p.title}</h3>
              <p className="text-sm text-[#a0a5b0] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#13161f] p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck className="w-4 h-4 text-[#00e6b8]" />
              <h2 className="text-sm font-medium uppercase tracking-wider text-[#a0a5b0]">Compliance roadmap</h2>
            </div>
            <div className="divide-y divide-[#1c2029]">
              {ROADMAP.map((r) => (
                <div key={r.label} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[#c7ccd6]">{r.label}</span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${r.status === "Shipped" ? "text-[#00e6b8] bg-[#00e6b8]/10" : r.status === "In progress" ? "text-amber-300 bg-amber-300/10" : "text-[#a0a5b0] bg-white/5"}`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#13161f] p-6 flex flex-col">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">Need a security review?</h2>
            <p className="text-sm text-[#a0a5b0] leading-relaxed">
              We work with lenders and fintechs on data processing agreements, penetration testing, and onboarding
              reviews. Start building in the sandbox, then request a security package when you're ready for production.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/onboarding" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-[#00e6b8] px-4 py-2.5 rounded-lg hover:bg-[#00c9a0] transition-colors">
                Start building <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/architecture" className="inline-flex items-center gap-1.5 text-sm font-medium text-white border border-[#2a2f3a] px-4 py-2.5 rounded-lg hover:bg-[#1c2029] transition-colors">
                View architecture
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1c2029]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 text-sm text-[#5b6472]">
          UnderwriteOS — security by design.
        </div>
      </footer>
    </div>
  );
}