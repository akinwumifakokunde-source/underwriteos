import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Zap, Wallet, RefreshCw, Building2, Sparkles } from "lucide-react";
import HomeNav from "@/components/home/HomeNav.jsx";

const TIERS = [
  {
    id: "starter",
    name: "Pay-as-you-go",
    tagline: "Start free. Pay only when you underwrite.",
    price: "$0",
    unit: "platform fee",
    sub: "$2.00 per 1k credits",
    cta: "Start building",
    ctaTo: "/onboarding",
    highlight: false,
    features: [
      "No platform fee, no minimums",
      "Buy credits — consume per transaction",
      "All 6 markets & data sources",
      "Live credit + bank data pulls",
      "AI analysis & policy decisions",
      "PDF / CSV / Word exports",
      "Credits never expire",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For lenders in production.",
    price: "$499",
    unit: "/ month",
    sub: "500 decisions included · $1.50 overage",
    cta: "Start building",
    ctaTo: "/onboarding",
    highlight: true,
    features: [
      "500 underwriting decisions / mo",
      "$1.50 per additional decision",
      "All 6 markets & data sources",
      "Cross-document reconciliation",
      "Evidence lineage & audit trail",
      "3 team members included",
      "Priority email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "High-volume, multi-team production.",
    price: "Custom",
    unit: "",
    sub: "from $0.80 per 1k credits",
    cta: "Contact us",
    ctaTo: "/contact",
    highlight: false,
    features: [
      "Volume credit pricing",
      "Dedicated support & SLA",
      "Custom policies & jurisdictions",
      "Unlimited team members",
      "SSO & advanced roles",
      "On-prem data source connectors",
      "Solution architect onboarding",
    ],
  },
];

const TRANSACTIONS = [
  { action: "Credit report pull", credits: 50, note: "Per bureau report (Experian, Equifax, CRC, XDS…)" },
  { action: "Bank statement pull", credits: 40, note: "Open banking fetch (TrueLayer, Plaid, Okra, Mono…)" },
  { action: "Document processing", credits: 15, note: "Per uploaded document — AI extraction & classification" },
  { action: "AI analysis", credits: 30, note: "Financial profile, risk signals, reconciliation" },
  { action: "Underwriting decision", credits: 20, note: "Policy evaluation + AI recommendation + audit record" },
  { action: "Report export", credits: 5, note: "Per PDF, CSV, or Word export" },
  { action: "Reads (retrieve)", credits: 0, note: "Listing / retrieving applications & decisions — always free" },
];

const STEPS = [
  { icon: Wallet, title: "Pick a plan", desc: "Start pay-as-you-go with no platform fee, or subscribe to Growth for included monthly decisions." },
  { icon: Zap, title: "Underwrite per transaction", desc: "Every billable action — data pull, analysis, decision — consumes a fixed number of credits." },
  { icon: RefreshCw, title: "Scale on demand", desc: "Top up credits anytime, or move to Scale for volume pricing and an SLA." },
];

const FAQ = [
  { q: "Is there a platform fee?", a: "Pay-as-you-go has no platform fee — you only buy and consume credits. Growth is $499/month and includes 500 decisions; Scale is custom-priced for high volume." },
  { q: "What counts as a billable transaction?", a: "Data pulls, document processing, AI analysis, underwriting decisions, and exports. Retrieving (reading) applications and decisions is always free." },
  { q: "How is a full application priced?", a: "A complete decision — credit pull, bank pull, document processing, analysis, and the underwriting decision — is roughly 160 credits. On Growth that's about $0.32 per decision, well below the cost of pulling the raw data separately." },
  { q: "Do credits expire?", a: "No. Your credit balance carries over until consumed." },
  { q: "Are data source costs included?", a: "Yes. Credit bureau and open banking pulls are billed as credits — no separate pass-through invoices. You can also upload documents manually at a lower credit cost." },
  { q: "Can I switch plans?", a: "Anytime. Move between pay-as-you-go and Growth from your workspace, or talk to us about Scale when you reach production volume." },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-[#0a0c12]">
            Pay per decision. Not per seat.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            Usage-based credits with optional subscription. Every data pull, analysis, and decision is priced
            transparently per transaction — your client owns the customer experience, we provide the intelligence.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={`relative rounded-2xl border p-6 flex flex-col ${t.highlight ? "border-[#0d9488] bg-white shadow-sm" : "border-[#e5e7eb] bg-white"}`}
            >
              {t.highlight && (
                <span className="absolute -top-2.5 left-6 text-[10px] font-medium uppercase tracking-wider text-white bg-[#0d9488] rounded px-2 py-0.5">
                  Most popular
                </span>
              )}
              <div className="flex items-center gap-2">
                {t.id === "scale" ? <Building2 className="w-4 h-4 text-[#0d9488]" /> : t.highlight ? <Sparkles className="w-4 h-4 text-[#0d9488]" /> : <Zap className="w-4 h-4 text-[#0d9488]" />}
                <div className="text-sm font-medium text-[#0a0c12]">{t.name}</div>
              </div>
              <p className="mt-1.5 text-[13px] text-[#8a909c]">{t.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-[#0a0c12]">{t.price}</span>
                <span className="text-sm text-[#525965]">{t.unit}</span>
              </div>
              <div className="mt-1 text-xs text-[#525965] font-medium">{t.sub}</div>

              <div className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-[#3a3f4a]">
                    <CheckCircle2 className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
              <Link
                to={t.ctaTo}
                className={`mt-7 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${t.highlight ? "text-white bg-[#0a0c12] hover:bg-[#1c1f26]" : "text-[#0a0c12] border border-[#e5e7eb] hover:bg-[#f2f3f5]"}`}
              >
                {t.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#8a909c]">
          All plans include access to all six markets (GB, US, NG, ZA, KE, GH). Annual billing available — contact us after onboarding.
        </p>
      </section>

      {/* Per-transaction price list */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="max-w-2xl mb-6">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#525965]">Per-transaction pricing</h2>
          <p className="mt-2 text-base text-[#525965] leading-relaxed">
            Every billable action has a fixed credit cost. A full underwriting decision is roughly 160 credits —
            transparent and predictable, with no hidden pass-through fees.
          </p>
        </div>
        <div className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f8fa] border-b border-[#e5e7eb]">
              <tr>
                <th className="text-left font-medium text-[#525965] px-5 py-3">Action</th>
                <th className="text-left font-medium text-[#525965] px-5 py-3 hidden sm:table-cell">What it covers</th>
                <th className="text-right font-medium text-[#525965] px-5 py-3 w-28">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef1]">
              {TRANSACTIONS.map((row) => (
                <tr key={row.action} className="hover:bg-[#fafbfc]">
                  <td className="px-5 py-3 font-medium text-[#0a0c12]">{row.action}</td>
                  <td className="px-5 py-3 text-[#8a909c] hidden sm:table-cell">{row.note}</td>
                  <td className="px-5 py-3 text-right font-mono text-[#0a0c12]">
                    {row.credits === 0 ? <span className="text-[#0d9488]">Free</span> : row.credits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[#8a909c]">
          Example: a full decision (credit pull + bank pull + doc processing + analysis + decision + export) ≈ 160 credits.
          On Growth that's about $0.32/decision — far below pulling the same data directly from bureaus and open-banking providers.
        </p>
      </section>

      {/* How billing works */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#525965] mb-6">How billing works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#eceef1] rounded-2xl overflow-hidden border border-[#e5e7eb]">
          {STEPS.map((s) => (
            <div key={s.title} className="bg-white p-6">
              <div className="w-9 h-9 rounded-lg bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-center mb-3.5">
                <s.icon className="w-4 h-4 text-[#0d9488]" />
              </div>
              <h3 className="font-medium text-[#0a0c12] mb-1">{s.title}</h3>
              <p className="text-sm text-[#525965] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#525965] mb-6">FAQ</h2>
        <div className="divide-y divide-[#eceef1] border border-[#e5e7eb] rounded-2xl bg-white">
          {FAQ.map((f) => (
            <div key={f.q} className="p-5">
              <div className="text-sm font-medium text-[#0a0c12]">{f.q}</div>
              <p className="mt-1.5 text-sm text-[#525965] leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#eceef1]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 text-sm text-[#8a909c]">
          UnderwriteOS — pay-per-decision underwriting infrastructure.
        </div>
      </footer>
    </div>
  );
}