import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const REQUEST = `{
  "policy_id": "consumer-v1"
}`;

const RESPONSE = `{
  "decision": "APPROVE",
  "risk_score": 34,
  "probability_of_default": 0.061,
  "confidence": 0.88,
  "human_review_required": false
}`;

function CodeBlock({ label, children }) {
  return (
    <div className="rounded-lg border border-[#eceef1] bg-[#fafbfc] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#eceef1]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c]">{label}</span>
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-[13px] font-mono text-[#0a0c12] leading-relaxed">{children}</pre>
    </div>
  );
}

export default function ApiDemo() {
  return (
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12]">
          One API. From borrower data to decision.
        </h2>

        <p className="mt-6 text-[11px] font-mono uppercase tracking-wider text-[#8a909c]">Synthetic example</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#eceef1] bg-white px-3 py-1.5">
          <span className="text-[11px] font-mono font-semibold text-[#0d9488] bg-[#e6f7f3] rounded px-1.5 py-0.5">POST</span>
          <span className="text-[13px] font-mono text-[#0a0c12]">/v1/applications/{"{id}"}/underwrite</span>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <CodeBlock label="Request">{REQUEST}</CodeBlock>
          <CodeBlock label="Response">{RESPONSE}</CodeBlock>
        </div>

        <p className="mt-4 text-xs text-[#8a909c]">Example response using synthetic borrower data.</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/api-reference" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            View API reference <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link to="/evidence" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
            View evidence <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}