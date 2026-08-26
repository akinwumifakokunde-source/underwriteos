import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { n: "01", title: "Create an account", desc: "Get a sandbox automatically." },
  { n: "02", title: "Get your API key", desc: "Copy a test key and make your first request." },
  { n: "03", title: "Run underwriting", desc: "Send synthetic borrower data and receive a decision." },
];

export default function DeveloperFlow() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Get started
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">
            From zero to a decision in minutes.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-mono text-xs text-[#8a909c]">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold text-[#0a0c12]">{s.title}</h3>
              <p className="mt-1.5 text-[15px] text-[#525965] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors"
          >
            Start building <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}