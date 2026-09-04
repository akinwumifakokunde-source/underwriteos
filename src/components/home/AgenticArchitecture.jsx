import React from "react";
import {
  FileText, ShieldCheck, Network, Bot, CheckCircle2, FileBarChart2,
  Mail, Database, Cpu, Layers, Workflow, Brain, Lock,
} from "lucide-react";

const STAGES = [
  {
    n: 1,
    title: "Borrower Inputs",
    icon: FileText,
    items: ["Application form", "Identity documents", "Bank statements", "Transaction data", "Business documents", "Alternative data"],
  },
  {
    n: 2,
    title: "User Interface",
    icon: Layers,
    desc: "Web / API / Embedded — chat or form-based application that collects borrower data and starts the agentic workflow.",
  },
  {
    n: 3,
    title: "Authentication Agent",
    icon: ShieldCheck,
    items: ["KYC", "Document authentication", "AML & sanctions", "Device / behaviour checks"],
  },
  {
    n: 4,
    title: "Orchestrator Agent",
    icon: Network,
    desc: "Coordinates the workflow, delegates tasks to specialist agents, tracks progress, and ensures a final decision is produced.",
  },
];

const SPECIALISTS = [
  { name: "Document Agent", icon: FileText, tint: "bg-emerald-50 border-emerald-200 text-emerald-700", desc: "OCR, data extraction, validation" },
  { name: "Data Agent", icon: Database, tint: "bg-sky-50 border-sky-200 text-sky-700", desc: "Fetches & processes external data, normalization" },
  { name: "Risk Agent", icon: Brain, tint: "bg-amber-50 border-amber-200 text-amber-700", desc: "Risk scoring, fraud detection, behavioural & income analysis" },
  { name: "Policy Agent", icon: ShieldCheck, tint: "bg-rose-50 border-rose-200 text-rose-700", desc: "Lending policies, limits, regulatory compliance, explainability" },
  { name: "Analysis Agent", icon: FileBarChart2, tint: "bg-violet-50 border-violet-200 text-violet-700", desc: "Financial analysis, cash flow, scenario & sensitivity analysis" },
  { name: "Decision Agent", icon: CheckCircle2, tint: "bg-teal-50 border-teal-200 text-teal-700", desc: "Approve / Decline / Refer, confidence score, reason codes, human-in-the-loop" },
  { name: "Communication Agent", icon: Mail, tint: "bg-sky-50 border-sky-200 text-sky-700", desc: "Decision letters, next steps, agent notes, multi-channel" },
];

const OUTPUTS = [
  { label: "Credit Decision", icon: CheckCircle2 },
  { label: "Risk Report", icon: FileBarChart2 },
  { label: "Adverse Action Reasons", icon: FileText },
  { label: "Borrower Communication", icon: Mail },
  { label: "Audit Trail", icon: Database },
];

const FLOW_STEPS = [
  "Borrower submits inputs through web, API, or embedded form.",
  "Authentication agent verifies identity, KYC, and AML.",
  "Orchestrator delegates parallel tasks to specialist agents.",
  "Specialist agents analyse documents, data, risk, policy, and cash flow.",
  "Decision agent produces an explainable approve / decline / refer outcome.",
  "Communication agent sends the decision, reasons, and audit trail.",
];

const TECH = [
  { k: "LLMs", v: "OpenAI, Claude, Llama" },
  { k: "Agent Framework", v: "LangGraph, CrewAI, AutoGen" },
  { k: "Document Processing", v: "Azure, AWS, Google" },
  { k: "Data Integration", v: "APIs, ETL" },
  { k: "Machine Learning", v: "Risk scoring, credit models" },
  { k: "Vector Database", v: "Pinecone, Weaviate" },
  { k: "Workflow & Orchestration", v: "LangGraph, Temporal, Prefect" },
  { k: "Backend & APIs", v: "Python, Node.js, REST / GraphQL" },
  { k: "Frontend", v: "React, Next.js, SDKs" },
  { k: "Cloud & Infrastructure", v: "AWS, Azure, GCP" },
  { k: "Security & Compliance", v: "Encryption, audit logs, GDPR / CCPA" },
];

const WHY = [
  "End-to-end automation",
  "Higher accuracy",
  "Faster decisions",
  "Explainable and compliant",
  "Flexible — consumer, SME, enterprise",
  "Human-in-the-loop",
];

export default function AgenticArchitecture() {
  return (
    <section className="bg-[#f7f8fa] py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#1c4a8f] mb-2">
              <Bot className="w-3.5 h-3.5" /> Agentic architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              From data to decisions — with AI agents
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Multiple AI agents working together to turn borrower data into an accurate, explainable credit decision.
            </p>
          </div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">CreditDecide · AI-native underwriting</p>
        </div>

        {/* Stages 1–4 flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STAGES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-7 h-7 rounded-full bg-[#1c4a8f] text-white text-[13px] font-semibold flex items-center justify-center shrink-0">{s.n}</span>
                  <Icon className="w-4 h-4 text-[#1c4a8f]" />
                  <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
                </div>
                {s.desc && <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>}
                {s.items && (
                  <ul className="space-y-1.5">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-[13px] text-slate-600">
                        <span className="w-1 h-1 rounded-full bg-[#3498db]" /> {it}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* External tools strip */}
        <div className="rounded-xl border border-dashed border-[#3498db]/40 bg-[#eaf2f8]/60 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-600">
            <span className="font-semibold text-[#1c4a8f] mr-1">External tools &amp; data sources:</span>
            {["Credit bureaus", "Identity verification", "Fraud & AML", "Open banking / bank APIs", "Alternative data", "Regulatory lists"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-2.5 py-1">{t}</span>
            ))}
          </div>
        </div>

        {/* Stage 5: Specialist agents */}
        <div className="mb-2 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-[#1c4a8f] text-white text-[13px] font-semibold flex items-center justify-center">5</span>
          <h3 className="text-sm font-semibold text-slate-900">Specialist agents — working in parallel</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
          {SPECIALISTS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.name} className={`rounded-xl border p-3.5 ${a.tint}`}>
                <Icon className="w-5 h-5 mb-2" />
                <h4 className="text-[13px] font-semibold leading-tight">{a.name}</h4>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug">{a.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Stage 6: Outputs */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-7 h-7 rounded-full bg-[#1c4a8f] text-white text-[13px] font-semibold flex items-center justify-center">6</span>
            <h3 className="text-sm font-semibold text-slate-900">Outputs</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {OUTPUTS.map((o) => {
              const Icon = o.icon;
              return (
                <div key={o.label} className="flex items-center gap-2 rounded-lg bg-[#eaf2f8]/50 border border-[#3498db]/20 px-3 py-2.5">
                  <Icon className="w-4 h-4 text-[#1c4a8f] shrink-0" />
                  <span className="text-[12px] font-medium text-slate-700">{o.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom three columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
          {/* How the flow works */}
          <div className="rounded-xl bg-[#eaf2f8] border border-[#3498db]/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Workflow className="w-4 h-4 text-[#1c4a8f]" />
              <h4 className="text-sm font-semibold text-slate-900">How the flow works</h4>
            </div>
            <ol className="space-y-2">
              {FLOW_STEPS.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-slate-600 leading-snug">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-white border border-[#3498db]/30 text-[11px] font-semibold text-[#1c4a8f] flex items-center justify-center">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* Key technologies */}
          <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-semibold text-slate-900">Key technologies</h4>
            </div>
            <div className="space-y-1.5">
              {TECH.map((t) => (
                <div key={t.k} className="flex items-baseline justify-between gap-3 text-[12px]">
                  <span className="font-medium text-slate-700 shrink-0">{t.k}</span>
                  <span className="text-slate-500 text-right">{t.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why agentic */}
          <div className="rounded-xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-semibold text-slate-900">Why this agentic approach?</h4>
            </div>
            <ul className="space-y-2">
              {WHY.map((w) => (
                <li key={w} className="flex items-center gap-2 text-[13px] text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1c4a8f] shrink-0" /> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer tagline */}
        <p className="mt-10 text-center text-[13px] font-semibold uppercase tracking-wider text-[#1c4a8f]">
          Faster decisions. Fairer opportunities.
        </p>
      </div>
    </section>
  );
}