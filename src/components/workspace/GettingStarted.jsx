import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, FileText, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: Sparkles,
    title: "Try a sample application",
    desc: "See the full underwriting pipeline run end-to-end with synthetic data — no setup required.",
    cta: "Run demo",
    to: "/applications/new?choice=sample&market=GB",
    accent: "violet",
  },
  {
    n: 2,
    icon: ShieldCheck,
    title: "Review your policy",
    desc: "Every decision is scored against an underwriting policy. Start from a template and tweak the rules.",
    cta: "Open policies",
    to: "/policies",
    accent: "teal",
  },
  {
    n: 3,
    icon: BarChart3,
    title: "Watch decisions come in",
    desc: "Applications are analysed, scored and decided automatically. Track them from the Applications list.",
    cta: "View applications",
    to: "/applications",
    accent: "slate",
  },
];

const ACCENTS = {
  violet: { ring: "ring-violet-200", bg: "bg-violet-50", text: "text-violet-700", icon: "bg-violet-600", dot: "bg-violet-500" },
  teal: { ring: "ring-teal-200", bg: "bg-teal-50", text: "text-teal-700", icon: "bg-teal-600", dot: "bg-teal-500" },
  slate: { ring: "ring-slate-200", bg: "bg-slate-50", text: "text-slate-700", icon: "bg-slate-700", dot: "bg-slate-400" },
};

export default function GettingStarted() {
  return (
    <section className="max-w-3xl mx-auto px-5 sm:px-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Getting started</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STEPS.map((s) => {
          const a = ACCENTS[s.accent];
          return (
            <Link
              key={s.n}
              to={s.to}
              className="group relative rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm hover:border-slate-300 transition-all flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${a.icon} text-white flex items-center justify-center`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-mono font-semibold ${a.text} ${a.bg} rounded-full px-2 py-0.5`}>
                  Step {s.n}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed flex-1">{s.desc}</p>
              <div className={`mt-3 inline-flex items-center gap-1 text-[12px] font-medium ${a.text} group-hover:gap-2 transition-all`}>
                {s.cta} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}