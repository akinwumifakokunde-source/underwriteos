import React from "react";
import { Link } from "react-router-dom";
import { Layers, ShieldCheck, FileCode2, Boxes, Webhook, KeyRound, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import Nav from "@/components/layout/Nav.jsx";

const PILLARS = [
  { icon: Layers, title: "Risk signals", desc: "Credit, cashflow, affordability & fraud signals — structured and traceable." },
  { icon: ShieldCheck, title: "Policy engine", desc: "Versioned lender policy. The AI never overrides the final decision." },
  { icon: FileCode2, title: "Evidence model", desc: "Every signal is traceable to its source document and confidence score." },
  { icon: Boxes, title: "Provider abstraction", desc: "Normalized CreditProfile across Experian, Equifax, TransUnion & more." },
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

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Nav />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> API-first underwriting infrastructure
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-slate-900">
            Underwriting intelligence,
            <br />
            <span className="text-slate-400">delivered as an API.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed max-w-2xl">
            Send borrower data and financial documents. Receive structured risk signals, traceable evidence, policy
            evaluation, and a defensible underwriting decision — all programmatically. Your client owns the customer
            experience; UnderwriteOS provides the intelligence.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/sandbox" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
              Open Sandbox <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/api-reference" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <FileCode2 className="w-4 h-4" /> API reference
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-white p-6">
              <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-3.5">
                <p.icon className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">{p.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">A developer can answer in 60 seconds</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ANSWERS.map((a) => (
              <div key={a} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                {a}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/sandbox" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800">Try the sandbox</Link>
            <Link to="/architecture" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-white">View architecture</Link>
            <Link to="/docs" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-white">Read the quickstart</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Layers className="w-4 h-4" /> UnderwriteOS — infrastructure for lenders, fintechs & credit providers.
          </div>
          <div className="text-[11px] text-slate-400 font-mono">POST /v1/applications → decision</div>
        </div>
      </footer>
    </div>
  );
}