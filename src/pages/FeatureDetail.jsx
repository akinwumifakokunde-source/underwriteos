import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { FEATURES, getFeature } from "@/lib/features";
import { insightsForFeature } from "@/lib/insights";
import SiteFooter from "@/components/home/SiteFooter";
import HomeNav from "@/components/home/HomeNav";

export default function FeatureDetail() {
  const { slug } = useParams();
  const feature = getFeature(slug);

  if (!feature) return <Navigate to="/features" replace />;

  const related = feature.related.map(getFeature).filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <Link to="/features" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 mb-5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All capabilities
          </Link>
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-4 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> {feature.title}
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            {feature.h1}
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">{feature.intro}</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="space-y-10">
          {feature.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#0a0c12] mb-3">{s.heading}</h2>
              <p className="text-[15px] text-[#525965] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-[#f0f7f4] border border-[#0d9488]/15 p-6">
          <h3 className="text-sm font-semibold text-[#0a2e2a] mb-4">Key benefits</h3>
          <ul className="space-y-2.5">
            {feature.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {(() => {
          const relatedInsights = insightsForFeature(slug);
          if (relatedInsights.length === 0) return null;
          return (
            <div className="mt-12">
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-4">Related insights</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {relatedInsights.map((a) => (
                  <Link
                    key={a.slug}
                    to={`/insights/${a.slug}`}
                    className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600">{a.category}</span>
                    <p className="text-sm font-semibold text-slate-900 mt-1 group-hover:text-teal-700 transition-colors">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-4">Related capabilities</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/features/${r.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            to="/onboarding"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all"
          >
            Start underwriting <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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