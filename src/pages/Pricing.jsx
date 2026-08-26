import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Zap, Wallet, RefreshCw } from "lucide-react";
import HomeNav from "@/components/home/HomeNav.jsx";

const PACKS = [
  { id: "pack_starter", name: "Starter", credits: 10000, amount: 2000, per_k: 2.0 },
  { id: "pack_growth", name: "Growth", credits: 50000, amount: 7500, per_k: 1.5, popular: true },
  { id: "pack_scale", name: "Scale", credits: 100000, amount: 12000, per_k: 1.2 },
];

const STEPS = [
  { icon: Wallet, title: "Buy credits", desc: "Top up your balance anytime via Wix Payments. No platform fee, no minimums." },
  { icon: Zap, title: "Build on the API", desc: "Every billable API call consumes credits from your balance — only pay for what you use." },
  { icon: RefreshCw, title: "Top up on demand", desc: "Run low? Buy more credits instantly. Sandbox calls are free while you build." },
];

const FAQ = [
  { q: "Is there a monthly platform fee?", a: "No. You only pay for credits consumed by billable API calls. Sandbox usage is free." },
  { q: "What counts as a billable call?", a: "Billable endpoints include data ingestion, analysis, and underwriting. Reads (retrieving an application or decision) are free." },
  { q: "Do credits expire?", a: "No. Your credit balance carries over until consumed." },
  { q: "How is an underwriting application priced?", a: "A full application (borrower + credit + bank data + analysis + decision) typically costs a single-digit number of credits. See the API reference for per-endpoint detail." },
];

export default function Pricing() {
  const fmt = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-[#0a0c12]">
            Pay for what you underwrite.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            Usage-based credits. No platform fee, no seats, no minimums. Buy credits and consume them as you call the
            API — your client owns the customer experience, we provide the intelligence.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PACKS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 flex flex-col ${p.popular ? "border-[#0d9488] bg-white" : "border-[#e5e7eb] bg-white"}`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-6 text-[10px] font-medium uppercase tracking-wider text-white bg-[#0d9488] rounded px-2 py-0.5">
                  Best value
                </span>
              )}
              <div className="text-sm text-[#525965]">{p.name}</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight text-[#0a0c12]">{fmt(p.amount)}</div>
              <div className="mt-1 text-sm text-[#525965]">{p.credits.toLocaleString()} credits</div>
              <div className="mt-4 text-xs text-[#8a909c] font-mono">${p.per_k.toFixed(2)} / 1k credits</div>
              <div className="mt-6 space-y-2.5">
                {[
                  `${p.credits.toLocaleString()} API credits`,
                  "Sandbox access included",
                  "All providers & endpoints",
                  "No expiry on credits",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-[#3a3f4a]">
                    <CheckCircle2 className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
              <Link
                to="/onboarding"
                className={`mt-7 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${p.popular ? "text-white bg-[#0a0c12] hover:bg-[#1c1f26]" : "text-[#0a0c12] border border-[#e5e7eb] hover:bg-[#f2f3f5]"}`}
              >
                Start building <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#8a909c]">
          Volume pricing and annual plans available for production workloads — contact us after onboarding.
        </p>
      </section>

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
          UnderwriteOS — usage-based underwriting infrastructure.
        </div>
      </footer>
    </div>
  );
}