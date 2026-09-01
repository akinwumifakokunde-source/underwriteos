import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FEATURES } from "@/lib/features";
import SiteFooter from "@/components/home/SiteFooter";
import HomeNav from "@/components/home/HomeNav";

export default function Features() {
  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Product capabilities
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            The CreditDecide underwriting operating system
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            CreditDecide covers the whole underwriting pipeline — from borrower intake to explainable decision.
            Explore each capability in detail.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <Link
              key={f.slug}
              to={`/features/${f.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-1.5">{f.title}</h2>
              <p className="text-sm text-slate-500 mb-4">{f.tagline}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600">
                Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}