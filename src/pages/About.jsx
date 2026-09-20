import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Layers, Shield, Sparkles, Gauge, Network } from "lucide-react";
import SiteFooter from "@/components/home/SiteFooter";
import HomeNav from "@/components/home/HomeNav";

const PILLARS = [
  {
    icon: Globe,
    title: "Built for every market",
    body: "Any country, any currency — local credit bureaus, open banking providers and KYC configured per market, out of the box.",
  },
  {
    icon: Layers,
    title: "No-code by design",
    body: "A visual policy builder, white-label intake forms and live data connections — powerful underwriting without writing a line of code.",
  },
  {
    icon: Shield,
    title: "Explainable to the core",
    body: "Every decision traces back to its source through a full evidence graph — defensible to auditors, regulators and borrowers.",
  },
  {
    icon: Sparkles,
    title: "AI-native, not bolted on",
    body: "An orchestrator of specialist agents reads, normalizes and reasons over your data — turning documents into decisions in minutes.",
  },
  {
    icon: Gauge,
    title: "Fast, consistent decisions",
    body: "Automate intake to decision in one flow — underwrite more borrowers, faster, with the same standard every time.",
  },
  {
    icon: Network,
    title: "One connected system",
    body: "Borrower intake, data sources, risk signals, policy and reporting live together — no stitching tools together, no blind spots.",
  },
];

const STATS = [
  { value: "6+", label: "Markets supported out of the box" },
  { value: "7", label: "Specialist AI agents per application" },
  { value: "100%", label: "Decisions traceable to source evidence" },
  { value: "0", label: "Lines of code to launch a policy" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(55% 45% at 15% 0%, rgba(13,148,136,0.08), transparent 70%), radial-gradient(45% 45% at 95% 10%, rgba(99,102,241,0.05), transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> About CreditDecide
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            The underwriting operating system for consumer lenders.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            CreditDecide is the AI-native platform that takes a borrower from application to explainable decision —
            visually built policies, market-aware KYC, live data, and decisions you can defend. Built to be the
            best way consumer lenders underwrite, anywhere in the world.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to="/features"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all shadow-sm hover:shadow-md"
            >
              Explore product capabilities <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-5 py-3 rounded-full hover:bg-[#f7f8fa] transition-all"
            >
              Talk to our team <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-[#eceef1] bg-[#fbfcfc]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <div className="text-3xl font-semibold text-[#0a0c12] tabular-nums">{s.value}</div>
              <div className="mt-1 text-xs text-[#525965] leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-semibold text-[#0a0c12] mb-3">What we do</h2>
          <p className="text-[15px] text-[#525965] leading-relaxed mb-8">
            CreditDecide is an AI-native underwriting and credit decisioning platform. Lenders build policies visually
            in a no-code rule builder, collect borrower applications through white-label intake forms with
            market-specific KYC, connect live credit bureau and open banking data — or upload documents — and the
            platform normalizes the data, generates structured risk signals with full evidence lineage, applies
            lender policy, and returns an explainable APPROVE, REVIEW or DECLINE. One connected flow, from intake
            to decision, with nothing lost in between.
          </p>

          <h2 className="text-2xl font-semibold text-[#0a0c12] mb-3">Who it's for</h2>
          <p className="text-[15px] text-[#525965] leading-relaxed mb-8">
            CreditDecide is built for consumer lenders — personal loan and instalment providers, point-of-sale and
            microfinance lenders — who need to underwrite borrowers faster and more consistently, with decisions
            they can stand behind in front of auditors, regulators and borrowers. Whether you're scaling a modern
            lending operation or replacing a patchwork of spreadsheets and legacy tools, CreditDecide is the system
            to run underwriting on.
          </p>

          <h2 className="text-2xl font-semibold text-[#0a0c12] mb-3">Where we operate</h2>
          <p className="text-[15px] text-[#525965] leading-relaxed mb-8">
            CreditDecide supports consumer lenders everywhere — with configurable policies, KYC requirements and
            data sources for any market worldwide, out of the box. From the UK and US to Nigeria, South Africa,
            Kenya and Ghana, and any market beyond, the platform adapts to your regulatory profile, currency and
            local data providers — so you can launch in one market and expand to many without rebuilding.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#0d9488]/30 transition-all"
              >
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0d9488]/10 mb-3">
                  <Icon className="w-5 h-5 text-[#0d9488]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{p.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </div>

        {/* Closing CTA */}
        <div className="mt-14 rounded-2xl border border-[#eceef1] bg-gradient-to-br from-[#f0f7f4] to-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0a0c12]">Underwrite with the best.</h3>
            <p className="text-sm text-[#525965] mt-1 max-w-md">
              See how CreditDecide turns application intake into explainable decisions — for any market, any product.
            </p>
          </div>
          <Link
            to="/features"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all shadow-sm shrink-0"
          >
            Explore capabilities <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}