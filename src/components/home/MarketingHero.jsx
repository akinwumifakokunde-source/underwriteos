import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, FileText, ArrowRight } from "lucide-react";

const TEAL = "#007f5f";

const FEATURES = [
  { icon: ShieldCheck, title: "No-code policies", sub: "Lender-controlled rules", color: TEAL },
  { icon: Sparkles, title: "AI-assisted analysis", sub: "Evidence-backed insights", color: "#7c3aed" },
  { icon: FileText, title: "Evidence-linked decisions", sub: "Reviewable and traceable", color: "#ea580c" },
];

const TRUST = [
  { label: "CONSUMER CREDIT FIRST", dot: TEAL },
  { label: "INSTALMENT & POS", dot: "#7c3aed" },
  { label: "EVIDENCE-LED DECISIONS", dot: "#ea580c" },
];

export default function MarketingHero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-[#eceef1] dark:border-slate-800">
      {/* faint gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 0%, rgba(13,148,136,0.10), transparent 70%), radial-gradient(40% 40% at 90% 10%, rgba(124,58,237,0.06), transparent 70%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 mb-6" style={{ backgroundColor: "rgba(0,127,95,0.10)" }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: TEAL }} />
          <span className="text-[12px] font-medium" style={{ color: TEAL }}>Credit infrastructure for consumer lenders</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-black dark:text-slate-50">
          Explainable credit decisions.
          <br />
          <span style={{ color: TEAL }}>From application to collections.</span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-[#4a4a4a] dark:text-slate-300 leading-relaxed">
          Automate borrower intake, assess income and affordability, and apply your own lending policies —
          with evidence-backed recommendations and decisions your team can review and control.
        </p>

        {/* Feature cards */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-xl border border-[#dcdcdc] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left shadow-[0_1px_2px_rgba(10,12,18,0.04),0_8px_24px_-12px_rgba(10,12,18,0.10)]">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${f.color}14` }}>
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-semibold text-black dark:text-slate-50">{f.title}</h3>
                <p className="text-[12px] text-[#777] dark:text-slate-400 mt-0.5">{f.sub}</p>
              </div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/onboarding"
            className="group inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-full shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: "#111111" }}
          >
            Start building
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/features"
            className="group inline-flex items-center gap-2 text-sm font-medium text-black dark:text-slate-50 px-6 py-3 rounded-full border border-[#dcdcdc] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            See how it works
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Trust bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#555] dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.dot }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}