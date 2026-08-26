import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MousePointerClick, Code2 } from "lucide-react";

const MODES = [
  {
    icon: MousePointerClick,
    label: "No code",
    title: "Underwrite without writing a single line.",
    desc: "Enter borrower and loan details in a guided wizard, pull data from connected providers or type it in, and get a decision — risk signals, evidence and recommendation included.",
    points: ["Guided 3-step wizard", "Auto-pull or manual entry", "Full decision trace, zero integration"],
    cta: { to: "/underwrite", label: "Open the wizard" },
  },
  {
    icon: Code2,
    label: "API integration",
    title: "Ship underwriting into your product.",
    desc: "Authenticate with a sandbox key, create borrowers and applications, ingest data from bureaus and open banking, and retrieve an explainable decision over REST.",
    points: ["Versioned REST API", "Environment-scoped keys", "Webhooks, providers & usage billing"],
    cta: { to: "/api-reference", label: "View the API" },
  },
];

export default function TwoWays() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Two ways to use it
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            No code, or full API. Same engine.
          </h2>
          <p className="mt-4 text-lg text-[#a0a5b0] leading-relaxed">
            Run a decision in a guided wizard, or integrate the underwriting layer directly into your product.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="rounded-2xl border border-[#2a2f3a] bg-[#0a0c12] p-7 flex flex-col">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-lg border border-[#2a2f3a] bg-[#13161f] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#00e6b8]" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#5b6472]">{m.label}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-white">{m.title}</h3>
                <p className="mt-3 text-[15px] text-[#a0a5b0] leading-relaxed">{m.desc}</p>
                <ul className="mt-5 space-y-2">
                  {m.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-[#c7ccd6]">
                      <span className="w-1 h-1 rounded-full bg-[#00e6b8]" /> {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to={m.cta.to}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white border border-[#2a2f3a] px-4 py-2 rounded-lg hover:bg-[#13161f] transition-colors w-fit"
                >
                  {m.cta.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}