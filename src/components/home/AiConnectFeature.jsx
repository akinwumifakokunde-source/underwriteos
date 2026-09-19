import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plug, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

const CLIENTS = [
  { name: "Claude", tint: "from-amber-400 to-orange-500" },
  { name: "ChatGPT", tint: "from-teal-400 to-emerald-500" },
  { name: "Cursor", tint: "from-sky-400 to-indigo-500" },
  { name: "Windsurf", tint: "from-cyan-400 to-blue-500" },
  { name: "Cline", tint: "from-violet-400 to-purple-500" },
  { name: "Zed", tint: "from-fuchsia-400 to-pink-500" },
];

const POINTS = [
  {
    icon: MessageSquare,
    title: "Ask in plain language",
    desc: "Your assistant underwrites, reads risk signals and evidence, and explains decisions — all through a secure MCP server.",
    grad: "from-teal-400 to-emerald-500",
  },
  {
    icon: ShieldCheck,
    title: "Scoped to your data",
    desc: "Each client connects as you and only ever sees your organization's applications, borrowers and decisions.",
    grad: "from-sky-400 to-indigo-500",
  },
  {
    icon: Sparkles,
    title: "Works with your stack",
    desc: "Point any MCP-compatible client at one URL. No SDK to install, no tokens to manage by hand.",
    grad: "from-violet-400 to-purple-500",
  },
];

export default function AiConnectFeature() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] bg-gradient-to-b from-white to-[#fafbfc]">
      <div className="absolute top-1/3 left-0 w-[320px] h-[320px] bg-[#0d9488]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[280px] h-[280px] bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">AI-native by design</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] mb-4">
              Bring your own AI assistant
            </h2>
            <p className="text-[#525965] leading-relaxed mb-6">
              CreditDecide speaks MCP. Point Claude, ChatGPT, Cursor, Windsurf, Cline, Zed or any compatible
              client at a single URL and your assistant becomes an underwriter — running decisions,
              interrogating risk signals and evidence, and managing loan applications on your behalf.
              OAuth-secured, scoped to your data.
            </p>
            <ul className="space-y-2.5 text-sm text-[#525965]">
              {[
                "One URL — no SDK, no manual token handling",
                "Runs underwriting, analysis and retrieval tools",
                "Sign in once per client; access stays scoped to your org",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] mt-2 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <Link to="/connect" className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
              See how to connect <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="group rounded-2xl border border-[#e8eaee] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_12px_40px_-12px_rgba(10,12,18,0.12)] transition-all duration-500 hover:shadow-[0_24px_70px_-24px_rgba(13,148,136,0.3)] hover:-translate-y-1">
            <div className="px-4 py-3 border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6]" />
              </div>
              <span className="text-[11px] font-mono text-[#8a909c] ml-2">MCP server · /api/mcp</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center shadow-sm">
                  <Plug className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-semibold text-[#0a0c12]">Connect your AI client</div>
              </div>

              <div className="rounded-xl border border-[#eceef1] bg-[#fafbfc] px-3.5 py-3 mb-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] mb-1">Server URL</div>
                <code className="text-[12px] text-teal-600 select-text">https://creditdecide.app/api/mcp</code>
              </div>

              <div className="space-y-2 mb-4">
                {CLIENTS.map((c) => (
                  <div key={c.name} className="flex items-center justify-between rounded-lg border border-[#eceef1] bg-white px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${c.tint} flex items-center justify-center`}>
                        <span className="text-white text-[10px] font-bold">{c.name[0]}</span>
                      </div>
                      <span className="text-[12px] font-medium text-[#0a0c12]">{c.name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      <ShieldCheck className="w-3 h-3" /> OAuth
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[#0d9488]/30 bg-gradient-to-b from-[#e6f7f3] to-[#d9f2ec] px-3.5 py-3">
                <div className="text-[11px] text-[#0a0c12] leading-relaxed">
                  <span className="font-medium">Assistant:</span> "Underwrite application #2041 and explain the decision."
                </div>
                <div className="text-[11px] text-[#525965] leading-relaxed mt-1.5">
                  <span className="font-medium text-[#0d9488]">CreditDecide:</span> Decision: APPROVE. 6 risk signals, 14 evidence records, DTI 0.31.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-3">
          {POINTS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="group rounded-xl border border-[#eceef1] bg-gradient-to-br from-[#f7f8fa] to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.grad} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#0a0c12]">{p.title}</h3>
                    <p className="mt-1 text-[13px] text-[#525965] leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}