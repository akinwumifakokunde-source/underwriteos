import React from "react";
import { Link } from "react-router-dom";
import { Layers, ShieldCheck, FileCode2, Boxes, Webhook, KeyRound, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import HomeNav from "@/components/layout/HomeNav.jsx";
import AudienceStrip from "@/components/home/AudienceStrip.jsx";
import ProviderStrip from "@/components/home/ProviderStrip.jsx";
import HowItWorks from "@/components/home/HowItWorks.jsx";
import CodePreview from "@/components/home/CodePreview.jsx";
import DemoVideo from "@/components/home/DemoVideo.jsx";
import Metrics from "@/components/home/Metrics.jsx";
import FinalCta from "@/components/home/FinalCta.jsx";
import WhyNow from "@/components/home/WhyNow.jsx";

const PILLARS = [
  { icon: Layers, title: "Risk signals", desc: "Credit, cashflow, affordability & fraud signals — structured and traceable." },
  { icon: ShieldCheck, title: "Policy engine", desc: "Versioned lender policy. The AI never overrides the final decision." },
  { icon: FileCode2, title: "Evidence model", desc: "Every signal is traceable to its source document and confidence score." },
  { icon: Boxes, title: "Automated data collection", desc: "Auto-pull credit reports from Experian and bank statements via TrueLayer open banking — or upload your own." },
  { icon: Webhook, title: "Webhooks & async jobs", desc: "application.analyzed, underwriting.completed, decision.created." },
  { icon: KeyRound, title: "API keys & multi-tenancy", desc: "Organization isolation, idempotency keys, audit logging." },
];

const ANSWERS = [
  "What it is",
  "Who it's for",
  "What data to send",
  "What the API returns",
  "How underwriting works",
  "Test it now",
  "How to integrate",
  "Evidence behind the recommendation",
];

const btnPrimary =
  "inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white px-5 py-2.5 rounded-lg hover:bg-[#e8eaee] transition-colors";
const btnOutline =
  "inline-flex items-center gap-1.5 text-sm font-medium text-white border border-[#2a2f3a] px-5 py-2.5 rounded-lg hover:bg-[#13161f] transition-colors";
const btnDark =
  "inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] border border-[#2a2f3a] px-4 py-2 rounded-lg hover:bg-[#1c2029] transition-colors";
const btnGhost =
  "inline-flex items-center gap-1.5 text-sm font-medium text-[#c7ccd6] border border-[#2a2f3a] px-4 py-2 rounded-lg hover:bg-[#1c2029] hover:text-white transition-colors";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      <HomeNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> API-first underwriting infrastructure
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-white">
              Underwriting intelligence,
              <br />
              delivered as an API.
            </h1>
            <p className="mt-6 text-lg text-[#a0a5b0] leading-relaxed max-w-2xl">
              Send borrower data and financial documents. Receive structured risk signals, traceable evidence, policy
              evaluation, and a defensible underwriting decision — all programmatically. Your client owns the customer
              experience; UnderwriteOS provides the intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/onboarding" className={btnPrimary}>
                Start building <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className={btnOutline}>
                Create account
              </Link>
              <Link to="/api-reference" className={btnOutline}>
                <FileCode2 className="w-4 h-4" /> API reference
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#2a2f3a] bg-[#13161f] p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="w-4 h-4 text-[#00e6b8]" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0]">
                  A developer can answer in 60 seconds
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {ANSWERS.map((a) => (
                  <div key={a} className="flex items-start gap-2 text-sm text-[#c7ccd6]">
                    <CheckCircle2 className="w-4 h-4 text-[#00e6b8] shrink-0 mt-0.5" />
                    {a}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link to="/sandbox" className={btnDark}>
                  Try the sandbox
                </Link>
                <Link to="/architecture" className={btnGhost}>
                  View architecture
                </Link>
                <Link to="/docs" className={btnGhost}>
                  Read the quickstart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AudienceStrip />
      <ProviderStrip />

      {/* Feature grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
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

      <HowItWorks />
      <DemoVideo />
      <CodePreview />
      <Metrics />
      <WhyNow />
      <FinalCta />

      {/* Footer */}
      <footer className="border-t border-[#1c2029]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[#5b6472]">
            <Layers className="w-4 h-4" /> UnderwriteOS — infrastructure for lenders, fintechs & credit providers.
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#5b6472] font-mono">
            POST /v1/applications → decision
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" />
          </div>
        </div>
      </footer>
    </div>
  );
}