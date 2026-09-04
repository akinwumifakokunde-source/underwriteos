import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const ITEMS = [
  "Multi-jurisdiction policies (6 markets + Others)",
  "Organization-scoped access",
  "Live data source connections",
  "Immutable audit logging",
  "Versioned policies",
  "Cross-document reconciliation",
  "Provider credential isolation",
  "Human-in-the-loop overrides",
];

const GRADS = [
  "from-teal-400 to-emerald-500",
  "from-sky-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-fuchsia-400 to-purple-500",
  "from-lime-400 to-emerald-500",
];

export default function Security() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
      <div className="absolute top-10 right-0 w-[360px] h-[360px] bg-[#0d9488]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Built for financial data</p>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Built for financial <span className="text-[#0d9488]">decisioning.</span>
        </h2>

        <div className="mt-10 grid sm:grid-cols-2 gap-3 max-w-3xl">
          {ITEMS.map((it, i) => (
            <div key={it} className="group flex items-center gap-3 rounded-xl border border-[#eceef1] bg-white px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#0d9488]/30">
              <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${GRADS[i % GRADS.length]} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-sm font-medium text-[#0a0c12]">{it}</span>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link to="/security" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            Security overview <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}