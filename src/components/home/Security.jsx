import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const ITEMS = [
  "Sandbox / production isolation",
  "Organization-scoped access",
  "API key management",
  "Idempotency",
  "Audit logs",
  "Provider credential isolation",
];

export default function Security() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">Built for financial data.</h2>
            <div className="mt-8">
              <Link
                to="/security"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors"
              >
                Security <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {ITEMS.map((it) => (
              <div key={it} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
                <span className="text-[15px] text-[#3a3f4a]">{it}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}