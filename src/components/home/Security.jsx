import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const ITEMS = [
  "Sandbox / production isolation",
  "Organization-scoped access",
  "API key management",
  "Audit logging",
  "Versioned policies",
  "Idempotent requests",
  "Provider credential isolation",
  "Human decision overrides",
];

export default function Security() {
  return (
    <section className="border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Built for financial data</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Built for financial decisioning.
        </h2>

        <div className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
          {ITEMS.map((it) => (
            <div key={it} className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0d9488] shrink-0" />
              <span className="text-sm text-[#0a0c12]">{it}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link to="/security" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            Security overview <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}