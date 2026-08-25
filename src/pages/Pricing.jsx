import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Zap, Wallet, RefreshCw } from "lucide-react";
import HomeNav from "@/components/layout/HomeNav.jsx";

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
    <div className="min-h-screen bg-[#0a0c12] text-white">
      <HomeNav />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
            Pay for what you underwrite.
          </h1>
          <p className="mt-6 text-lg text-[#a0a5b0] leading-relaxed">
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
              className={`relative rounded-2xl border p-6 flex flex-col ${p.popular ? "border-[#00e6b8]/60 bg-[#13161f]" : "border-[#2a2f3a] bg-[#13161f]"}`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-6 text-[10px] font-medium uppercase tracking-wider text-[#0a0c12] bg-[#00e6b8] rounded px-2 py-0.5">
                  Best value
                </span>
              )}
              <div className="text-sm text-[#a0a5b0]">{p.name}</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight">{fmt(p.amount)}</div>
              <div className="mt-1 text-sm text-[#a0a5b0]">{p.credits.toLocaleString()} credits</div>
              <div className="mt-4 text-xs text-[#5b6472] font-mono">${p.per_k.toFixed(2)} / 1k credits</div>
              <div className="mt-6 space-y-2.5">
                {[
                  `${p.credits.toLocaleString()} API credits`,
                  "Sandbox access included",
                  "All providers & endpoints",
                  "No expiry on credits",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-[#c7ccd6]">
                    <CheckCircle2 className="w-4 h-4 text-[#00e6b8] shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
              <Link
                to="/onboarding"
                className={`mt-7 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${p.popular ? "text-[#0a0c12] bg-[#00e6b8] hover:bg-[#00c9a0]" : "text-white border border-[#2a2f3a] hover:bg-[#1c2029]"}`}
              >
                Start building <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#5b6472]">
          Volume pricing and annual plans available for production workloads — contact us after onboarding.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#a0a5b0] mb-6">How billing works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1c2029] rounded-2xl overflow-hidden border border-[#2a2f3a]">
          {STEPS.map((s) => (
            <div key={s.title} className="bg-[#13161f] p-6">
              <div className="w-9 h-9 rounded-lg bg-[#0a0c12] border border-[#2a2f3a] flex items-center justify-center mb-3.5">
                <s.icon className="w-4 h-4 text-[#00e6b8]" />
              </div>
              <h3 className="font-medium text-white mb-1">{s.title}</h3>
              <p className="text-sm text-[#a0a5b0] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#a0a5b0] mb-6">FAQ</h2>
        <div className="divide-y divide-[#1c2029] border border-[#2a2f3a] rounded-2xl bg-[#13161f]">
          {FAQ.map((f) => (
            <div key={f.q} className="p-5">
              <div className="text-sm font-medium text-white">{f.q}</div>
              <p className="mt-1.5 text-sm text-[#a0a5b0] leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#1c2029]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 text-sm text-[#5b6472]">
          UnderwriteOS — usage-based underwriting infrastructure.
        </div>
      </footer>
    </div>
  );
}