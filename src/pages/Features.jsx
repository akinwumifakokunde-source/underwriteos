import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FEATURES } from "@/lib/features";
import SiteFooter from "@/components/home/SiteFooter";
import HomeNav from "@/components/home/HomeNav";
import EndToEndFlow from "@/components/features/EndToEndFlow";

const bySlug = (slug) => FEATURES.find((f) => f.slug === slug);

const FOUR_WAYS = [
  "ai-underwriting",
  "ai-credit-officer",
  "risk-assessment",
  "document-intelligence",
];

const PLATFORM = [
  "intelligent-los",
  "ai-loan-application",
  "borrower-portal",
];

const CONTROLS = ["credit-decisioning", "lending-policies", "explainable-decisions", "connect-ai"];

function SolutionRow({ feature, index }) {
  return (
    <Link
      to={`/features/${feature.slug}`}
      className="group flex items-start gap-4 py-5 border-t border-[#eceef1] first:border-t-0 hover:bg-[#fbfcfc] transition-colors -mx-3 px-3 rounded-lg"
    >
      {index != null && (
        <span className="text-xs font-mono text-[#cccccc] pt-1 w-6 shrink-0">
          {String(index).padStart(2, "0")}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-[#111111] group-hover:text-[#0a2e2a] transition-colors">
          {feature.title}
        </h3>
        <p className="text-[13px] text-[#757575] mt-1 leading-relaxed">{feature.tagline}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-[#9ca3af] mt-1 shrink-0 group-hover:text-[#0d9488] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export default function Features() {
  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Overview
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            All solutions
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            The CreditDecide underwriting operating system — four ways in, and the whole platform behind them.
            Explore each capability in detail.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          {/* Four ways in */}
          <div>
            <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#4a6755] mb-2">
              Four ways in
            </h2>
            <div className="mt-4">
              {FOUR_WAYS.map((slug, i) => {
                const f = bySlug(slug);
                return f ? <SolutionRow key={slug} feature={f} index={i + 1} /> : null;
              })}
            </div>
          </div>

          {/* The whole platform */}
          <div>
            <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#4a6755] mb-2">
              The whole platform
            </h2>
            <div className="mt-4">
              {PLATFORM.map((slug) => {
                const f = bySlug(slug);
                return f ? <SolutionRow key={slug} feature={f} /> : null;
              })}
            </div>

            <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#4a6755] mt-8 mb-2">
              Platform controls
            </h2>
            <div className="mt-4">
              {CONTROLS.map((slug) => {
                const f = bySlug(slug);
                return f ? <SolutionRow key={slug} feature={f} /> : null;
              })}
            </div>
          </div>
        </div>
      </section>

      <EndToEndFlow />

      <SiteFooter />
    </div>
  );
}