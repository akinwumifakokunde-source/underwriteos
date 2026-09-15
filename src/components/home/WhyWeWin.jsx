import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Database, Workflow, Globe } from "lucide-react";

const PILLARS = [
  {
    icon: Brain,
    title: "Deep domain expertise",
    grad: "from-teal-400 to-emerald-500",
    blurb:
      "Not a prompt — a multi-jurisdiction underwriting engine. Five risk dimensions, market-specific KYC, and regulatory outputs across the UK, US, Nigeria, South Africa, Kenya, Ghana and beyond.",
    points: ["6 markets + Others", "5 risk dimensions", "Regulatory outputs built in"],
  },
  {
    icon: Database,
    title: "Proprietary data",
    grad: "from-sky-400 to-indigo-500",
    blurb:
      "Every decision builds an evidence graph and a normalized profile — and every observed loan outcome closes the loop between predicted and actual default. That feedback is ours, not the model's.",
    points: ["Evidence graph lineage", "Normalized credit & financial profiles", "Predicted-vs-actual feedback loop"],
  },
  {
    icon: Workflow,
    title: "Workflow & integrations",
    grad: "from-violet-400 to-purple-500",
    blurb:
      "White-label intake forms, live credit bureau and open-banking sources, a versioned policy engine, webhooks and a sandboxed REST API. The workflow is the product — not the model call.",
    points: ["White-label /apply/:slug forms", "Live data-source connections", "Versioned policy engine + webhooks"],
  },
  {
    icon: Globe,
    title: "Distribution & GTM",
    grad: "from-amber-400 to-orange-500",
    blurb:
      "Purpose-built for lenders across the US, UK and Africa — with local-currency pricing, market-aware KYC and public intake forms that turn a link into a verified, underwrite-ready application.",
    points: ["Local-currency pricing", "Market-aware KYC", "Link-to-application intake"],
  },
];

export default function WhyWeWin() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
      <div className="absolute top-0 left-1/3 w-[420px] h-[420px] bg-[#0d9488]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[340px] h-[340px] bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2.5s" }} />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Why a better model makes us stronger</p>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12]">
            Not a wrapper. The <span className="bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text text-transparent">underwriting operating system.</span>
          </h2>
          <p className="mt-4 text-[#525965] leading-relaxed">
            A thin layer of UI on someone else's model disappears the moment the frontier labs ship an upgrade. CreditDecide is built the other way —
            when models get better, our customers get better decisions, and our moat gets deeper. Here's what a model can't replicate.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="group relative rounded-2xl border border-[#eceef1] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-24px_rgba(13,148,136,0.28)] hover:border-[#0d9488]/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-mono text-[#b0b4bd]">0{i + 1}</span>
                    <h3 className="text-base font-semibold text-[#0a0c12]">{p.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-[#525965] leading-relaxed mb-4">{p.blurb}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {p.points.map((pt) => (
                    <li key={pt} className="text-[11px] font-medium text-[#0a0c12] bg-[#f3f5f7] border border-[#eceef1] rounded-full px-2.5 py-1 transition-colors duration-300 group-hover:bg-[#0d9488]/10 group-hover:border-[#0d9488]/20 group-hover:text-[#0d9488]">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link to="/architecture" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            See the architecture <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <span className="hidden sm:inline text-[#d4d7dd]">·</span>
          <p className="text-xs text-[#8a909c] max-w-md">
            CreditDecide doesn't sell "AI." It sells underwriting expertise, owned data, and the workflow lenders run on.
          </p>
        </div>
      </div>
    </section>
  );
}