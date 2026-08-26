import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Create",
    body: "Create an account and get a sandbox automatically.",
  },
  {
    n: "02",
    title: "Connect",
    body: "Generate an API key and send synthetic borrower data.",
  },
  {
    n: "03",
    title: "Decide",
    body: "Receive a decision with risk signals, policy evaluation and evidence.",
  },
];

export default function Onboarding() {
  return (
    <section className="border-b border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">Get started</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12]">
          Run your first underwriting decision in minutes.
        </h2>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg border border-[#eceef1] bg-white p-6">
              <span className="text-xs font-mono text-[#8a909c]">{s.n}</span>
              <h3 className="mt-2 text-base font-semibold text-[#0a0c12] uppercase tracking-wide">{s.title}</h3>
              <p className="mt-2 text-sm text-[#525965] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-md hover:bg-[#1c1f26] transition-colors"
          >
            Start building <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/sandbox"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-4 py-2.5 rounded-md hover:bg-[#f7f8fa] transition-colors"
          >
            Try the sandbox <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}