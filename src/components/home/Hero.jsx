import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedProductPreview from "@/components/home/AnimatedProductPreview";

const PILLARS = [
  "Document intelligence", "Policy engine", "AI underwriter", "Affordability",
  "Risk signals", "Decision lineage", "Multi-market", "Post-decision monitoring",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1]">
      {/* Mint gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#0d9488]/[0.06] rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
              No-code underwriting platform
            </div>
            <h1 className="text-[2.25rem] sm:text-[3.5rem] font-semibold tracking-tight text-[#0a0c12] leading-[1.04]">
              Underwrite borrowers anywhere, in <span className="text-[#0d9488]">minutes.</span>
            </h1>
            <p className="mt-6 text-lg text-[#525965] leading-relaxed max-w-md">
              The AI-native underwriting platform for lenders and fintechs. Automate applications, configure
              policies, and make smarter, explainable decisions.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {PILLARS.map((p) => (
                <span key={p} className="text-[11px] font-medium text-[#525965] bg-white border border-[#eceef1] rounded-full px-2.5 py-1 shadow-sm">{p}</span>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                to="/onboarding"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all shadow-sm hover:shadow-md"
              >
                Start underwriting <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-5 py-3 rounded-full hover:bg-[#f7f8fa] hover:border-[#d0d3d8] transition-all"
              >
                View pricing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-[11px] font-mono uppercase tracking-wider text-[#8a909c]">
              <span>6 markets supported</span>
              <span className="hidden sm:inline text-[#d0d3d8]">·</span>
              <span>5 risk dimensions</span>
              <span className="hidden sm:inline text-[#d0d3d8]">·</span>
              <span>Full evidence lineage</span>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <AnimatedProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}