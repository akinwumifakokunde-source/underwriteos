import React, { useState } from "react";
import Nav from "@/components/layout/Nav.jsx";
import { ChevronDown } from "lucide-react";

const PIPELINE = [
  { id: "client", label: "Client", desc: "Your application — a lender, fintech, or credit provider — sends borrower data and financial documents to the CreditDecide API. You own the customer experience; CreditDecide provides the intelligence." },
  { id: "api", label: "CreditDecide API", desc: "Versioned REST API under /v1. Authenticated with organization-scoped API keys. Idempotent writes, async jobs, and stable response schemas." },
  { id: "ingestion", label: "Ingestion", desc: "Raw credit reports and bank statements are accepted in provider-specific formats and validated on entry." },
  { id: "normalization", label: "Normalization", desc: "A canonical layer transforms raw data into provider-independent FinancialProfile and CreditProfile models. No provider-specific fields reach the engine." },
  { id: "financial", label: "Financial profile", desc: "Derived income, expenses, cashflow, affordability, debt-to-income, and financial behaviour metrics from normalized transactions." },
  { id: "risk", label: "Risk intelligence", desc: "Structured risk signals across credit, cashflow, affordability, and fraud categories — each with a confidence score and flag." },
  { id: "evidence", label: "Evidence", desc: "Every signal is traceable to its source document, calculation method, and confidence. The evidence graph is the core differentiator." },
  { id: "policy", label: "Policy engine", desc: "Versioned lender policy is evaluated against the risk signals. The policy outcome is authoritative — the AI never overrides it." },
  { id: "ai", label: "AI recommendation", desc: "An evidence-referenced underwriting memo and advisory recommendation. The AI cannot invent facts or approve/decline a borrower." },
  { id: "decision", label: "Decision workflow", desc: "The final decision combines the AI recommendation and the policy outcome. Overrides require a documented reason and human review." },
  { id: "webhook", label: "Webhook / API response", desc: "Results are returned synchronously and delivered via webhooks (application.analyzed, underwriting.completed, decision.created). The full audit trail is retained." },
];

export default function Architecture() {
  const [active, setActive] = useState("client");
  const current = PIPELINE.find((p) => p.id === active) || PIPELINE[0];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">Architecture</h1>
          <p className="text-sm text-slate-500 mt-1">The underwriting pipeline, end to end. Click any component to learn what it does.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="space-y-1.5">
            {PIPELINE.map((p, i) => (
              <div key={p.id}>
                <button
                  onClick={() => setActive(p.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${active === p.id ? "border-slate-900 bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`text-sm font-medium ${active === p.id ? "text-slate-900" : "text-slate-700"}`}>{p.label}</span>
                  </div>
                </button>
                {i < PIPELINE.length - 1 && <div className="text-center text-slate-300 text-xs py-0.5">↓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">{PIPELINE.findIndex((p) => p.id === active) + 1} / {PIPELINE.length}</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">{current.label}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{current.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}