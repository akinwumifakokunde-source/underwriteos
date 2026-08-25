import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Layers, ShieldCheck, Webhook, KeyRound, FileCode2, Boxes, Lock } from "lucide-react";
import FlowRunner from "@/components/api/FlowRunner.jsx";
import EndpointReference from "@/components/api/EndpointReference.jsx";
import JsonBlock from "@/components/api/JsonBlock.jsx";

const PILLARS = [
  { icon: Layers, title: "Risk signals", desc: "Credit, cashflow, affordability & fraud signals — structured and traceable." },
  { icon: ShieldCheck, title: "Policy engine", desc: "Versioned lender policy. The AI never overrides the final decision." },
  { icon: FileCode2, title: "Evidence model", desc: "Every signal is traceable to its source document and confidence score." },
  { icon: Boxes, title: "Provider abstraction", desc: "Normalized CreditProfile across Experian, Equifax, TransUnion & more." },
  { icon: Webhook, title: "Webhooks & async jobs", desc: "application.analyzed, underwriting.completed, decision.created." },
  { icon: KeyRound, title: "API keys & multi-tenancy", desc: "Organization isolation, idempotency keys, audit logging." },
];

export default function Home() {
  const [openapi, setOpenApi] = useState(null);

  useEffect(() => {
    base44.functions.invoke("apiDocs", { action: "openapi" })
      .then((res) => setOpenApi(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">UnderwriteOS</span>
            <span className="text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">v1</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <a href="#flow" className="hover:text-slate-900 hidden sm:block">Console</a>
            <a href="#api" className="hover:text-slate-900 hidden sm:block">API</a>
            <a href="#architecture" className="hover:text-slate-900 hidden sm:block">Architecture</a>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
              <Lock className="w-3 h-3" /> sandbox
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> API-first underwriting infrastructure
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-slate-900">
            Underwriting intelligence,<br />
            <span className="text-slate-400">delivered as an API.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed max-w-2xl">
            Send borrower data and financial documents. Receive structured risk signals, traceable evidence,
            policy evaluation, and a defensible underwriting decision — all programmatically. Your client owns
            the customer experience; UnderwriteOS provides the intelligence.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#flow" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
              Try the live flow
            </a>
            <a href="#api" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <FileCode2 className="w-4 h-4" /> API reference
            </a>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="architecture" className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
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

      {/* Interactive flow */}
      <section id="flow" className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5 sm:p-7">
          <FlowRunner />
        </div>
      </section>

      {/* API reference + OpenAPI */}
      <section id="api" className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">API reference</h2>
            <p className="text-sm text-slate-500 mb-5">Versioned REST endpoints under <code className="font-mono text-slate-600">/v1</code>.</p>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <EndpointReference />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">OpenAPI specification</h2>
            <p className="text-sm text-slate-500 mb-5">Machine-readable schema for SDK generation.</p>
            {openapi ? <JsonBlock data={openapi} maxHeight="520px" /> : <div className="h-32 rounded-xl border border-dashed border-slate-200 animate-pulse" />}
          </div>
        </div>
      </section>

      {/* Footer */}
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