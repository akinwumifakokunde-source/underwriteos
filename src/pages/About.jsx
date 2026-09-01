import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Shield, Layers } from "lucide-react";
import SiteFooter from "@/components/home/SiteFooter";
import HomeNav from "@/components/home/HomeNav";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> About CreditDecide
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            CreditDecide is an AI-native underwriting and credit decisioning platform for modern lenders and fintechs.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            CreditDecide helps lending teams automate application intake, analyze borrower documents, apply
            configurable underwriting policies, assess credit risk, and produce explainable lending decisions —
            without writing code.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-semibold text-[#0a0c12] mb-3">What CreditDecide does</h2>
          <p className="text-[15px] text-[#525965] leading-relaxed mb-8">
            CreditDecide is an AI-native underwriting and credit decisioning platform. Lenders build policies
            visually in a no-code rule builder, collect borrower applications through white-label intake forms
            with market-specific KYC, connect live credit bureau and open banking data (or upload documents),
            and the platform normalizes the data, generates structured risk signals with evidence lineage,
            applies lender policy, and returns an explainable APPROVE, REVIEW, or DECLINE decision.
          </p>

          <h2 className="text-2xl font-semibold text-[#0a0c12] mb-3">Who CreditDecide is for</h2>
          <p className="text-[15px] text-[#525965] leading-relaxed mb-8">
            CreditDecide is built for lenders and fintechs — from consumer credit providers and digital banks
            to microfinance institutions and cross-border lenders — who need to underwrite borrowers faster,
            more consistently, and with decisions they can explain to auditors, regulators, and borrowers.
          </p>

          <h2 className="text-2xl font-semibold text-[#0a0c12] mb-3">Where CreditDecide operates</h2>
          <p className="text-[15px] text-[#525965] leading-relaxed mb-8">
            CreditDecide supports lenders across the United Kingdom, United States, Nigeria, South Africa,
            Kenya, and Ghana — with market-specific policies, KYC requirements, and data sources out of the box.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Globe className="w-5 h-5 text-teal-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Six markets</h3>
            <p className="text-xs text-slate-500">UK, US, NG, ZA, KE, GH — with local data sources and KYC.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Layers className="w-5 h-5 text-teal-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 mb-1">No-code platform</h3>
            <p className="text-xs text-slate-500">Visual policy builder, white-label forms, live data — no code.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Shield className="w-5 h-5 text-teal-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Explainable</h3>
            <p className="text-xs text-slate-500">Every decision traces to its source through an evidence graph.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            to="/features"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all"
          >
            Explore product capabilities <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-5 py-3 rounded-full hover:bg-[#f7f8fa] transition-all"
          >
            View pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}