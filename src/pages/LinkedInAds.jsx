import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, ExternalLink, Target, Wallet, BarChart3, FileText, Megaphone } from "lucide-react";

const SPONSORED_ADS = [
  {
    id: "ad-1",
    angle: "No-code underwriting",
    intro: "Underwriting shouldn't take a quarter to deploy — or explain nothing when it's done.",
    headline: "Underwrite borrowers in minutes, not quarters",
    description: "CreditDecide is the AI-native underwriting OS. Build policies visually, connect live credit & bank data, and ship explainable APPROVE / REVIEW / DECLINE decisions across 6 markets — no code.",
  },
  {
    id: "ad-2",
    angle: "Explainable AI",
    intro: "Every decision your AI makes should be traceable back to the source field that produced it.",
    headline: "Decisions your auditors can actually trace",
    description: "Every risk signal links to its source through an evidence graph. Export decisions as PDF, CSV, or Word. Built for lenders who need to explain why — not just what.",
  },
  {
    id: "ad-3",
    angle: "Multi-market",
    intro: "One platform, six markets — UK, US, Nigeria, South Africa, Kenya, Ghana.",
    headline: "Lend across borders without rebuilding your stack",
    description: "Market-specific policies, KYC, and data sources out of the box. Go live in a new jurisdiction in hours, not quarters. Sandbox and production fully isolated.",
  },
  {
    id: "ad-4",
    angle: "Speed to deploy",
    intro: "Legacy decision engines take quarters. Point tools each solve one step. CreditDecide covers the whole pipeline.",
    headline: "From signup to first decision in hours",
    description: "Visual policy builder, white-label borrower forms, live data sources, AI underwriter, and evidence lineage — one operating system. Free sandbox with 1,000 trial credits.",
  },
];

const CONVERSATION_ADS = [
  {
    id: "ca-1",
    opener: "What's slowing your underwriting team down right now?",
    cta1: "Manual document review takes too long → See how AI extraction + risk signals cut it to minutes",
    cta2: "Decisions aren't explainable → Explore full evidence lineage to source fields",
    cta3: "We can't expand to new markets → See multi-jurisdiction policies in action",
  },
  {
    id: "ca-2",
    opener: "Pick the underwriting bottleneck that hurts most:",
    cta1: "Policy changes take weeks → Try the visual rule builder",
    cta2: "No audit trail → See evidence-graph decisions exported as PDF",
    cta3: "Too many point tools → See the all-in-one pipeline",
  },
];

const TEXT_ADS = [
  { id: "ta-1", headline: "AI underwriting, no code required", description: "Build policies visually. Decide in minutes. Explain every decision.", cta: "Start free" },
  { id: "ta-2", headline: "Explainable credit decisions", description: "Every signal traces to its source. Export as PDF, CSV, Word.", cta: "See it work" },
  { id: "ta-3", headline: "Lend across 6 markets", description: "UK, US, NG, ZA, KE, GH — live in hours, not quarters.", cta: "View pricing" },
];

const AUDIENCE = {
  geos: ["United Kingdom", "United States", "Nigeria", "South Africa", "Kenya", "Ghana"],
  job_functions: ["Finance", "Banking", "Lending", "Risk & Compliance", "Operations", "Engineering", "Product"],
  seniority: ["CXO", "VP", "Director", "Manager", "Senior"],
  job_titles: [
    "Chief Risk Officer", "Head of Credit", "Head of Underwriting", "Credit Manager",
    "Underwriting Manager", "Head of Lending", "VP Lending", "Director of Credit Risk",
    "Chief Technology Officer", "VP Engineering", "Head of Product", "Chief Operating Officer",
    "Risk Manager", "Portfolio Manager", "Fintech Founder", "CEO",
  ],
  industries: ["Financial Services", "Banking", "Credit & Lending", "Fintech", "Consumer Finance", "Microfinance", "Insurance"],
  company_sizes: ["11-50", "51-200", "201-500", "501-1000", "1001-5000"],
  exclude: ["Recruiting", "Consulting (non-fintech)", "Marketing Agencies"],
};

const LANDING_PAGES = [
  { label: "Primary — Homepage", url: "https://creditdecide.com/", use: "Brand / general awareness" },
  { label: "Conversion — Pricing", url: "https://creditdecide.com/pricing", use: "Bottom-funnel, ready-to-buy" },
  { label: "Technical — Architecture", url: "https://creditdecide.com/architecture", use: "Technical buyers, CTO/Eng" },
  { label: "Trial — Onboarding", url: "https://creditdecide.com/onboarding", use: "Free sandbox signup" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function AdCard({ ad }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600 bg-teal-50 rounded-full px-2 py-0.5">{ad.angle}</span>
        <CopyButton text={`${ad.intro}\n\n${ad.headline}\n${ad.description}\n\n→ https://creditdecide.com/onboarding`} />
      </div>
      <p className="text-sm text-slate-500 italic mb-3">{ad.intro}</p>
      <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">{ad.headline}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{ad.description}</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-[#0a0c12] px-3 py-1.5 rounded-full">Start underwriting →</span>
        <span className="text-[11px] text-slate-400">creditdecide.com</span>
      </div>
    </div>
  );
}

export default function LinkedInAds() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-teal-600 mb-3">
            <Megaphone className="w-3.5 h-3.5" /> Marketing Playbook
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">LinkedIn Ads — CreditDecide</h1>
          <p className="mt-3 text-[15px] text-slate-600 leading-relaxed max-w-2xl">
            Ready-to-use campaign assets. Copy the creatives, set the targeting, and launch in LinkedIn Campaign Manager.
            Base44 doesn't run LinkedIn Ads directly — you'll paste these into your own LinkedIn ad account.
          </p>
          <a
            href="https://www.linkedin.com/campaignmanager"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a76b1] px-5 py-2.5 rounded-full hover:bg-[#0a5c8a] transition-colors"
          >
            Open LinkedIn Campaign Manager <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Campaign setup */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Campaign setup</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Objective</h3>
              <p className="text-sm text-slate-600">Use <strong>Website conversions</strong> for trial signups, or <strong>Website visits</strong> for top-funnel awareness. For retargeting warm traffic, use <strong>Lead generation</strong> with a form.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Ad formats</h3>
              <p className="text-sm text-slate-600"><strong>Sponsored Single-Image</strong> (feed) for reach. <strong>Conversation Ads</strong> for engagement. <strong>Text Ads</strong> for cheap retargeting coverage. Run all three.</p>
            </div>
          </div>
        </section>

        {/* Audience */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Audience targeting</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Geographies</h3>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE.geos.map((g) => <span key={g} className="text-xs font-medium text-slate-700 bg-slate-100 rounded-full px-2.5 py-1">{g}</span>)}
              </div>
            </div>
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Job titles (exact)</h3>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE.job_titles.map((t) => <span key={t} className="text-xs font-medium text-slate-700 bg-slate-100 rounded-full px-2.5 py-1">{t}</span>)}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Seniority</h3>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE.seniority.map((s) => <span key={s} className="text-xs font-medium text-slate-700 bg-slate-100 rounded-full px-2.5 py-1">{s}</span>)}
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Company size</h3>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE.company_sizes.map((s) => <span key={s} className="text-xs font-medium text-slate-700 bg-slate-100 rounded-full px-2.5 py-1">{s}</span>)}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE.industries.map((i) => <span key={i} className="text-xs font-medium text-slate-700 bg-slate-100 rounded-full px-2.5 py-1">{i}</span>)}
              </div>
            </div>
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Exclude</h3>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE.exclude.map((e) => <span key={e} className="text-xs font-medium text-red-600 bg-red-50 rounded-full px-2.5 py-1">{e}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* Sponsored content */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Sponsored content (single image)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">4 ad creatives — rotate for A/B testing. Pair each with a 1200×627 image.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SPONSORED_ADS.map((ad) => <AdCard key={ad.id} ad={ad} />)}
          </div>
        </section>

        {/* Conversation ads */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Conversation ads</h2>
          </div>
          <div className="space-y-4">
            {CONVERSATION_ADS.map((ca) => (
              <div key={ca.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-900">{ca.opener}</p>
                  <CopyButton text={`${ca.opener}\n\n1. ${ca.cta1}\n2. ${ca.cta2}\n3. ${ca.cta3}`} />
                </div>
                <ul className="text-sm text-slate-600 space-y-1.5 mt-3">
                  <li className="flex gap-2"><span className="text-teal-600 font-mono">→</span> {ca.cta1}</li>
                  <li className="flex gap-2"><span className="text-teal-600 font-mono">→</span> {ca.cta2}</li>
                  <li className="flex gap-2"><span className="text-teal-600 font-mono">→</span> {ca.cta3}</li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Text ads */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Text ads (retargeting)</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {TEXT_ADS.map((ta) => (
              <div key={ta.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-900">{ta.headline}</h3>
                  <CopyButton text={`${ta.headline}\n${ta.description}\nCTA: ${ta.cta}`} />
                </div>
                <p className="text-xs text-slate-600 mb-3">{ta.description}</p>
                <span className="text-[11px] font-medium text-teal-600">CTA: {ta.cta}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Budget */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Budget & bidding</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Test budget</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">$50–80<span className="text-sm text-slate-400 font-normal">/day</span></p>
                <p className="text-xs text-slate-500 mt-1">First 2 weeks, learn what converts</p>
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Scale budget</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">$150–300<span className="text-sm text-slate-400 font-normal">/day</span></p>
                <p className="text-xs text-slate-500 mt-1">Once CPA stabilizes</p>
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Bid strategy</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">Max delivery</p>
                <p className="text-xs text-slate-500 mt-1">Let LinkedIn optimize early</p>
              </div>
            </div>
          </div>
        </section>

        {/* Landing pages */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Landing pages & tracking</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="space-y-3 mb-5">
              {LANDING_PAGES.map((lp) => (
                <div key={lp.url} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-900 sm:w-56">{lp.label}</span>
                  <a href={lp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline font-mono truncate flex-1">{lp.url}</a>
                  <span className="text-xs text-slate-500 sm:text-right sm:w-48">{lp.use}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="text-xs font-semibold text-slate-700 mb-2">UTM template (append to every landing URL)</h3>
              <code className="text-[11px] text-slate-600 font-mono break-all">
                ?utm_source=linkedin&utm_medium=paid&utm_campaign={"{campaign_name}"}&utm_content={"{ad_name}"}
              </code>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="rounded-2xl bg-[#0a0c12] text-white p-6 sm:p-8">
          <h3 className="text-base font-semibold mb-2">Prefer automated paid ads?</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Base44 has a built-in Google Ads runner (Marketing → Google Ads) that can launch and fund real campaigns for creditdecide.com
            directly — no manual setup. LinkedIn Ads must be run manually in Campaign Manager.
          </p>
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-teal-600 px-4 py-2 rounded-full hover:bg-teal-700 transition-colors">
            View pricing <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}