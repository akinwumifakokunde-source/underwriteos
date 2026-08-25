import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CALLS = [
  { n: "01", method: "POST", path: "/v1/applications", desc: "Create application" },
  { n: "02", method: "POST", path: "/v1/applications/{id}/analyze", desc: "Analyze risk" },
  { n: "03", method: "POST", path: "/v1/applications/{id}/underwrite", desc: "Return decision" },
];

export default function ApiCalls() {
  return (
    <section className="border-t border-[#1c2029]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Built for developers
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            From integration to decision in a few API calls.
          </h2>
        </div>

        <div className="rounded-2xl border border-[#2a2f3a] bg-[#0a0c12] divide-y divide-[#1c2029] overflow-hidden">
          {CALLS.map((c) => (
            <div key={c.n} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 sm:px-6 py-4">
              <span className="font-mono text-xs text-[#5b6472] w-8 shrink-0">{c.n}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#00e6b8] w-12 shrink-0">{c.method}</span>
              <code className="font-mono text-[13px] sm:text-[14px] text-white break-all">{c.path}</code>
              <span className="sm:ml-auto text-sm text-[#a0a5b0]">{c.desc}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link to="/api-reference" className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-[#00e6b8] transition-colors">
            View API reference <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}