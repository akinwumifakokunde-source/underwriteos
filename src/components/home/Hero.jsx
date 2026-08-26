import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const btnPrimary = "inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors";
const btnOutline = "inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] border border-[#e5e7eb] px-5 py-2.5 rounded-lg hover:bg-[#f2f3f5] transition-colors";

const REQUEST = `POST /v1/applications/{id}/underwrite

{
  "policy_id": "consumer-v1"
}`;

const RESPONSE = `{
  "decision": "APPROVE",
  "risk_score": 34,
  "confidence": 0.88,
  "human_review_required": false
}`;

function CodeCard({ label, badge, code }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#f7f8fa] overflow-hidden">
      <div className="flex items-center justify-between px-4 h-9 border-b border-[#eceef1]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c]">{label}</span>
        {badge}
      </div>
      <pre className="px-4 py-4 font-mono text-[13px] sm:text-[14px] leading-relaxed text-[#3a3f4a] overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-20">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> API-first underwriting infrastructure
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-[#0a0c12]">
          Underwriting decisions,<br className="hidden sm:block" /> delivered as an API.
        </h1>
        <p className="mt-6 text-lg text-[#525965] leading-relaxed max-w-2xl">
          Connect borrower data from credit bureaus, bank accounts and financial documents. UnderwriteOS normalizes the
          data, applies your policy and returns an explainable decision.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/underwrite" className={btnPrimary}>
            Underwrite without code <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/api-reference" className={btnOutline}>
            View API <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeCard label="Request" code={REQUEST} />
        <CodeCard
          label="Response"
          badge={<span className="text-[10px] font-mono text-[#0d9488]">200 OK</span>}
          code={RESPONSE}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <Link to="/docs" className="inline-flex items-center gap-1 text-[#525965] hover:text-[#0a0c12] transition-colors">
          View evidence <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link to="/docs" className="inline-flex items-center gap-1 text-[#525965] hover:text-[#0a0c12] transition-colors">
          View policy evaluation <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <p className="mt-12 font-mono text-xs uppercase tracking-wider text-[#8a909c]">
        One API. Your data. Your policy. An explainable decision.
      </p>
    </section>
  );
}