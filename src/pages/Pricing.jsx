import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Zap, Wallet, RefreshCw, Building2, Sparkles } from "lucide-react";
import HomeNav from "@/components/home/HomeNav.jsx";
import AfricaPricing from "@/components/pricing/AfricaPricing.jsx";

const TIERS = [
  {
    id: "plan_starter",
    name: "Starter",
    tagline: "For small lenders getting started.",
    price: "$99",
    unit: "/ month",
    sub: "20,000 credits included / mo",
    cta: "Start building",
    ctaTo: "/onboarding",
    highlight: false,
    features: [
      "20,000 credits / month",
      "All 6 markets & data sources",
      "Live credit + bank data pulls",
      "AI analysis & policy decisions",
      "Evidence lineage & audit trail",
      "PDF / CSV / Word exports",
      "Credits refresh every cycle",
    ],
  },
  {
    id: "plan_growth",
    name: "Growth",
    tagline: "For growing lending teams.",
    price: "$399",
    unit: "/ month",
    sub: "100,000 credits included / mo",
    cta: "Start building",
    ctaTo: "/onboarding",
    highlight: true,
    features: [
      "100,000 credits / month",
      "All 6 markets & data sources",
      "Cross-document reconciliation",
      "Evidence lineage & audit trail",
      "3 team members included",
      "Priority email support",
      "Top-up packs anytime",
    ],
  },
  {
    id: "plan_scale",
    name: "Scale",
    tagline: "For high-volume lenders.",
    price: "$999",
    unit: "/ month",
    sub: "300,000 credits included / mo",
    cta: "Start building",
    ctaTo: "/onboarding",
    highlight: false,
    features: [
      "300,000 credits / month",
      "All 6 markets & data sources",
      "Custom policies & jurisdictions",
      "Unlimited team members",
      "SSO & advanced roles",
      "Dedicated support & SLA",
      "Solution architect onboarding",
    ],
  },
];

const PACKS = [
  { id: "pack_starter", name: "Starter pack", credits: "10,000", price: "$20", per: "$2.00 / 1k" },
  { id: "pack_growth", name: "Growth pack", credits: "50,000", price: "$75", per: "$1.50 / 1k" },
  { id: "pack_scale", name: "Scale pack", credits: "100,000", price: "$120", per: "$1.20 / 1k" },
];

const TRANSACTIONS = [
  { action: "Credit report pull", credits: 50, note: "UnderwriteOS orchestration & normalization — bureau fees billed to your own credentials" },
  { action: "Bank statement pull", credits: 40, note: "UnderwriteOS orchestration & normalization — open banking fees billed to your own credentials" },
  { action: "Document processing", credits: 15, note: "Per uploaded document — AI extraction & classification" },
  { action: "AI analysis", credits: 30, note: "Financial profile, risk signals, reconciliation" },
  { action: "Underwriting decision", credits: 20, note: "Policy evaluation + AI recommendation + audit record" },
  { action: "Report export", credits: 5, note: "Per PDF, CSV, or Word export" },
  { action: "Reads (retrieve)", credits: 0, note: "Listing / retrieving applications & decisions — always free" },
];

const STEPS = [
  { icon: Wallet, title: "Pick a plan", desc: "Subscribe to Starter, Growth, or Scale for a monthly credit allowance that refreshes each cycle." },
  { icon: Zap, title: "Underwrite per transaction", desc: "Every billable action — data pull, analysis, decision — consumes a fixed number of credits from your balance." },
  { icon: RefreshCw, title: "Top up anytime", desc: "Need more capacity? Buy one-time credit packs from your workspace — they never expire and stack on your subscription." },
];

const FAQ = [
  { q: "Do I get free credits to try it out?", a: "Yes — every new account gets 1,000 free credits on signup, no card required. That's enough to run roughly six full underwriting decisions end-to-end (credit pull, bank pull, document processing, AI analysis, decision, and export). Use them to explore the platform before subscribing." },
  { q: "What's included in a subscription?", a: "Each plan includes a monthly credit allowance — Starter (20,000), Growth (100,000), Scale (300,000) — that refreshes every billing cycle. All plans include access to all six markets, data sources, AI analysis, policy decisions, and exports." },
  { q: "What counts as a billable transaction?", a: "Credit report pull (50 credits), bank statement pull (40), document processing (15 per document), AI analysis (30), underwriting decision (20), and report exports (5 per PDF, CSV, or Word). Retrieving (reading) applications, profiles, and decisions is always free." },
  { q: "How is a full application priced?", a: "A complete decision — credit pull (50), bank pull (40), document processing (15), analysis (30), the underwriting decision (20), and a report export (5) — is 160 credits. On Growth that's about $0.64 per decision in GoUnderwriteOS credits, well below the cost of pulling the raw data separately." },
  { q: "Do credits expire?", a: "No. Both your subscription credits and any one-time pack credits carry over until consumed." },
  { q: "Are data source costs included?", a: "No. Credits cover GoUnderwriteOS orchestration — fetching, normalizing, and reconciling the data. The underlying bureau and open-banking provider fees are billed directly to your own API credentials, which you enter during setup. You can also upload documents manually at a lower credit cost." },
  { q: "Can I switch or cancel plans?", a: "Yes. Subscribe, switch, or cancel anytime from Settings → Billing & Subscription. Cancellation keeps your plan active until the end of the current billing period." },
  { q: "What if I run out of credits mid-cycle?", a: "Buy a one-time credit pack from your workspace to top up instantly — no need to wait for the next cycle or upgrade your plan." },
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
            Subscribe monthly. Top up anytime.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            Every plan includes a monthly credit allowance that refreshes each billing cycle. Need more? Buy one-time
            credit packs on demand. Credits cover GoUnderwriteOS orchestration — fetching, normalizing, and reconciling
            your data so you can underwrite with confidence.
          </p>
          <div className="mt-6 inline-flex items-center gap-2.5 rounded-xl border border-[#0d9488]/30 bg-[#0d9488]/5 px-4 py-3">
            <Sparkles className="w-4 h-4 text-[#0d9488] shrink-0" />
            <p className="text-sm text-[#0a0c12]">
              <span className="font-semibold">1,000 free credits</span> on signup — no card required. Run a full
              underwriting decision end-to-end before you ever pay.
            </p>
          </div>
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
          All plans include access to all six markets (GB, US, NG, ZA, KE, GH). Subscribe from Settings → Billing & Subscription. Cancel anytime — your plan stays active until the end of the current period.
        </p>
      </section>

      <AfricaPricing />

      {/* Credit packs */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="max-w-2xl mb-6">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#525965]">One-time credit packs</h2>
          <p className="mt-2 text-base text-[#525965] leading-relaxed">
            Need extra capacity beyond your monthly allowance? Buy credit packs anytime — they never expire and stack on top of your subscription.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0d9488]" />
                <div className="text-sm font-medium text-[#0a0c12]">{p.name}</div>
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-[#0a0c12]">{p.credits}</span>
                <span className="text-sm text-[#525965]">credits</span>
              </div>
              <div className="mt-1 text-sm font-medium text-[#0a0c12]">{p.price}</div>
              <div className="text-xs text-[#8a909c]">{p.per} credits</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#8a909c]">
          Packs are available from Settings → Billing & Subscription in your workspace.
        </p>
      </section>

      {/* Per-transaction price list */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="max-w-2xl mb-6">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#525965]">Per-transaction pricing</h2>
          <p className="mt-2 text-base text-[#525965] leading-relaxed">
            Every billable action has a fixed credit cost. A full underwriting decision is roughly 160 credits —
            transparent and predictable. Credits cover UnderwriteOS processing; your data provider fees are billed directly to your own credentials.
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
          On Growth that's about $0.64/decision in GoUnderwriteOS credits. Bureau and open-banking provider fees are billed separately to your own API credentials.
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
          GoUnderwriteOS — subscribe, top up, and underwrite at scale.
        </div>
      </footer>
    </div>
  );
}