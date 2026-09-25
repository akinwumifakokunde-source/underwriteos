import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plug, Terminal, MessageSquareText, FileSearch, Workflow, Shield } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";

const TOOLS = [
  { icon: Workflow, title: "Run underwriting", body: "Execute the full pipeline — policy, AI memo and the authoritative decision." },
  { icon: FileSearch, title: "Analyze risk", body: "Generate structured risk signals, each linked to traceable evidence." },
  { icon: Terminal, title: "Retrieve anything", body: "Pull the summary, financial profile, signals, evidence, decision or audit trail." },
  { icon: MessageSquareText, title: "Ask the assistant", body: "Question an application's outcome and get an evidence-grounded answer." },
  { icon: Plug, title: "Manage applications", body: "Create, list and update loan applications from your assistant." },
  { icon: Shield, title: "Governed by default", body: "OAuth-secured, scoped to your organization — your policies stay in control." },
];

export default function Mcp() {
  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(55% 45% at 15% 0%, rgba(13,148,136,0.08), transparent 70%), radial-gradient(45% 45% at 95% 10%, rgba(99,102,241,0.05), transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <Plug className="w-3.5 h-3.5" /> Model Context Protocol
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            Drive underwriting from the AI assistant you already use.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            CreditDecide speaks MCP — the open standard that lets AI clients like ChatGPT and Claude call
            your underwriting tools directly. Connect once and your assistant can create applications,
            analyze risk, run decisions, retrieve evidence and ask the underwriting assistant — all from
            the same conversation, with every action traceable to source.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link to="/api-reference" className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all shadow-sm">
              Read the API & MCP docs <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/demo" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-5 py-3 rounded-full hover:bg-[#f7f8fa] transition-all">
              See it live <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <h2 className="text-2xl font-semibold text-[#0a0c12] mb-2">Tools your assistant can call</h2>
        <p className="text-sm text-[#525965] mb-8 max-w-xl">
          Each tool maps to a CreditDecide backend function, scoped to your organization and governed by
          your policies. Nothing runs without an authenticated, authorized session.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0d9488]/10 mb-3">
                  <Icon className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div className="text-sm font-semibold text-[#0a0c12]">{t.title}</div>
                <p className="mt-1 text-[13px] text-[#525965] leading-relaxed">{t.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#fbfcfc] border-y border-[#eceef1]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <h2 className="text-2xl font-semibold text-[#0a0c12] mb-6">How it connects</h2>
          <ol className="space-y-5">
            {[
              { n: "01", t: "Connect your assistant", b: "Point your MCP-compatible client at the CreditDecide MCP server URL and authorize with OAuth — once." },
              { n: "02", t: "Discover the tools", b: "Your assistant loads the available underwriting tools: run underwriting, analyze, retrieve, ask, and manage applications." },
              { n: "03", t: "Decide in conversation", b: "Ask your assistant to create, analyze or decide on an application. Every action is traceable to source evidence." },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="text-[11px] font-mono text-[#0d9488] pt-1">{s.n}</span>
                <div>
                  <div className="text-sm font-semibold text-[#0a0c12]">{s.t}</div>
                  <p className="mt-0.5 text-sm text-[#525965] leading-relaxed">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Link to="/connect" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9488] hover:text-[#0a2e2a] transition-colors">
              Connect your AI client <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}