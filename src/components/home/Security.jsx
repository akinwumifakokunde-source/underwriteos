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

export default function Security() {
  return (
    <section className="border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Built for financial data</p>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Built for financial <span className="text-[#0d9488]">decisioning.</span>
        </h2>

        <div className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-4 max-w-2xl">
          {ITEMS.map((it) => (
            <div key={it} className="group flex items-center gap-3 transition-transform duration-200 hover:translate-x-1">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </span>
              <span className="text-sm text-[#0a0c12]">{it}</span>
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