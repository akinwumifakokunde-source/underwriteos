import React, { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import { INSIGHTS, getInsight, AUTHOR } from "@/lib/insights";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function InsightDetail() {
  const { slug } = useParams();
  const article = getInsight(slug);

  useEffect(() => {
    if (article) document.title = `${article.title} — CreditDecide Insights`;
    return () => { document.title = "CreditDecide — AI-native underwriting and credit decisioning for modern lenders"; };
  }, [article]);

  if (!article) return <Navigate to="/insights" replace />;

  const related = INSIGHTS.filter((i) => i.slug !== article.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { "@type": "Organization", name: AUTHOR.name },
    publisher: {
      "@type": "Organization",
      name: "CreditDecide",
      logo: { "@type": "ImageObject", url: "https://creditdecide.com/favicon.svg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://creditdecide.com/insights/${article.slug}` },
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeNav />

      {/* Article header */}
      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-2xl mx-auto px-5 sm:px-8 py-14 sm:py-18">
          <Link to="/insights" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 mb-5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All insights
          </Link>
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-4 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> {article.category}
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] leading-[1.12]">
            {article.title}
          </h1>
          <p className="mt-5 text-lg text-[#525965] leading-relaxed">{article.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-xs text-[#8a909c]">
            <span className="font-medium text-[#525965]">{AUTHOR.name}</span>
            <span className="text-[#d0d3d8]">·</span>
            <span>{AUTHOR.role}</span>
            <span className="text-[#d0d3d8]">·</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="text-[#d0d3d8]">·</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readingTime} min read</span>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="prose-custom">
          <ReactMarkdown
            components={{
              h2: ({ node, ...p }) => <h2 className="text-xl sm:text-2xl font-semibold text-[#0a0c12] mt-10 mb-3" {...p} />,
              h3: ({ node, ...p }) => <h3 className="text-lg font-semibold text-[#0a0c12] mt-8 mb-2" {...p} />,
              p: ({ node, ...p }) => <p className="text-[15px] text-[#3f4651] leading-relaxed mb-4" {...p} />,
              ul: ({ node, ...p }) => <ul className="list-disc pl-5 space-y-1.5 mb-4 text-[15px] text-[#3f4651] leading-relaxed" {...p} />,
              ol: ({ node, ...p }) => <ol className="list-decimal pl-5 space-y-1.5 mb-4 text-[15px] text-[#3f4651] leading-relaxed" {...p} />,
              li: ({ node, ...p }) => <li {...p} />,
              strong: ({ node, ...p }) => <strong className="font-semibold text-[#0a0c12]" {...p} />,
              code: ({ node, ...p }) => <code className="font-mono text-[13px] bg-[#f3f5f4] text-[#0a2e2a] px-1.5 py-0.5 rounded" {...p} />,
              table: ({ node, ...p }) => <div className="overflow-x-auto my-6"><table className="w-full text-sm border border-[#eceef1] rounded-lg" {...p} /></div>,
              th: ({ node, ...p }) => <th className="text-left font-medium text-[#0a0c12] bg-[#f7f8fa] border-b border-[#eceef1] px-3 py-2" {...p} />,
              td: ({ node, ...p }) => <td className="text-[#3f4651] border-b border-[#f0f1f3] px-3 py-2" {...p} />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Author card */}
        <div className="mt-12 rounded-2xl bg-[#f0f7f4] border border-[#0d9488]/15 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0d9488] flex items-center justify-center text-white font-semibold text-sm shrink-0">
              CD
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0a0c12]">{AUTHOR.name}</p>
              <p className="text-xs text-[#0d9488] font-medium mb-2">{AUTHOR.role}</p>
              <p className="text-sm text-[#525965] leading-relaxed">{AUTHOR.bio}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-[#e8eaee] p-6 text-center">
          <p className="text-sm text-[#525965] mb-4">See these concepts in action — explore the CreditDecide platform.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/onboarding"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all"
            >
              Start underwriting <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-5 py-3 rounded-full hover:bg-[#f7f8fa] transition-all"
            >
              Explore capabilities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* Related articles */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-12 border-t border-[#eceef1]">
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-5">Keep reading</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {related.map((a) => (
            <Link
              key={a.slug}
              to={`/insights/${a.slug}`}
              className="group flex flex-col rounded-2xl border border-[#e8eaee] bg-white p-5 hover:border-[#d0d3d8] transition-colors"
            >
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#0d9488] mb-2">{a.category}</span>
              <h4 className="text-sm font-semibold text-[#0a0c12] leading-snug group-hover:text-[#0d9488] transition-colors">
                {a.title}
              </h4>
              <p className="mt-2 text-xs text-[#525965] leading-relaxed line-clamp-2 flex-1">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}