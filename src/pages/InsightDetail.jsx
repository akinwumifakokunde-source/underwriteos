import React, { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "@/lib/markdown";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import { base44 } from "@/api/base44Client";
import { INSIGHTS, getInsight, AUTHOR, MARKET_NAMES, normalizeInsight } from "@/lib/insights";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function InsightDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Foundational articles live in the static module; market articles live in the entity.
    const staticArticle = getInsight(slug);
    if (staticArticle) {
      const norm = normalizeInsight(staticArticle, false);
      setArticle(norm);
      setRelated(INSIGHTS.filter((i) => i.slug !== slug).slice(0, 3).map((a) => normalizeInsight(a, false)));
      setLoading(false);
      return;
    }

    base44.entities.Insight.filter({ slug, status: "published" }, null, 1)
      .then(async (rows) => {
        if (cancelled) return;
        if (!rows || !rows.length) { setLoading(false); return; }
        const a = normalizeInsight(rows[0], true);
        setArticle(a);

        // Related: same market first, then fill with the latest published.
        let rel = [];
        try {
          const sameMarket = await base44.entities.Insight.filter(
            { market: rows[0].market, status: "published" }, "-published_at", 4
          );
          rel = (sameMarket || []).filter((r) => r.slug !== slug).slice(0, 3);
        } catch (_) {}
        if (rel.length < 3) {
          try {
            const latest = await base44.entities.Insight.filter({ status: "published" }, "-published_at", 10);
            const have = new Set(rel.map((r) => r.slug));
            for (const r of latest || []) {
              if (r.slug !== slug && !have.has(r.slug)) { rel.push(r); have.add(r.slug); }
              if (rel.length >= 3) break;
            }
          } catch (_) {}
        }
        if (!cancelled) setRelated(rel.map((r) => normalizeInsight(r, true)));
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (article) document.title = `${article.title} — CreditDecide Insights`;
    return () => { document.title = "CreditDecide — AI-native underwriting and credit decisioning for modern lenders"; };
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  if (!article) return <Navigate to="/insights" replace />;

  const marketInfo = MARKET_NAMES[article.market] || MARKET_NAMES.GLOBAL;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    articleBody: article.content,
    inLanguage: "en",
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    keywords: (article.seoKeywords || []).join(", "),
    author: { "@type": "Organization", name: article.authorName },
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
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> {article.category}
            </div>
            {article.market !== "GLOBAL" && marketInfo && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0a2e2a] bg-white border border-[#0d9488]/20 rounded-full px-3 py-1">
                <span className="leading-none">{marketInfo.flag}</span> {marketInfo.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] leading-[1.12]">
            {article.title}
          </h1>
          <p className="mt-5 text-lg text-[#525965] leading-relaxed">{article.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-xs text-[#8a909c]">
            <span className="font-medium text-[#525965]">{article.authorName}</span>
            <span className="text-[#d0d3d8]">·</span>
            <span>{article.authorRole}</span>
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
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ node, ...p }) => <h2 className="text-xl sm:text-2xl font-semibold text-[#0a0c12] mt-12 mb-4 tracking-tight" {...p} />,
              h3: ({ node, ...p }) => <h3 className="text-base sm:text-lg font-semibold text-[#0a0c12] mt-8 mb-3" {...p} />,
              p: ({ node, ...p }) => <p className="text-[15px] sm:text-[16px] text-[#3f4651] leading-[1.75] mb-5" {...p} />,
              ul: ({ node, ...p }) => <ul className="list-disc pl-5 space-y-2 mb-5 text-[15px] sm:text-[16px] text-[#3f4651] leading-[1.75]" {...p} />,
              ol: ({ node, ...p }) => <ol className="list-decimal pl-5 space-y-2 mb-5 text-[15px] sm:text-[16px] text-[#3f4651] leading-[1.75]" {...p} />,
              li: ({ node, ...p }) => <li {...p} />,
              strong: ({ node, ...p }) => <strong className="font-semibold text-[#0a0c12]" {...p} />,
              a: ({ node, ...p }) => <a className="text-[#0d9488] underline underline-offset-2 hover:text-[#0a2e2a]" target="_blank" rel="noopener noreferrer" {...p} />,
              blockquote: ({ node, ...p }) => <blockquote className="border-l-2 border-[#0d9488]/40 pl-4 italic text-[#525965] my-5" {...p} />,
              code: ({ node, ...p }) => <code className="font-mono text-[13px] bg-[#f3f5f4] text-[#0a2e2a] px-1.5 py-0.5 rounded" {...p} />,
              table: ({ node, ...p }) => <div className="overflow-x-auto my-8"><table className="w-full text-sm border-collapse" {...p} /></div>,
              thead: ({ node, ...p }) => <thead className="bg-[#f7f8fa]" {...p} />,
              th: ({ node, ...p }) => <th className="text-left font-semibold text-[#0a0c12] border border-[#e8eaee] px-4 py-2.5" {...p} />,
              td: ({ node, ...p }) => <td className="text-[#3f4651] border border-[#e8eaee] px-4 py-2.5 align-top" {...p} />,
            }}
          >
            {normalizeMarkdown(article.content)}
          </ReactMarkdown>
        </div>

        {/* SEO keywords */}
        {article.seoKeywords && article.seoKeywords.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.seoKeywords.map((k) => (
              <span key={k} className="text-[11px] font-mono text-[#8a909c] bg-[#f7f8fa] border border-[#eceef1] rounded-full px-2.5 py-1">{k}</span>
            ))}
          </div>
        )}

        {/* Author card */}
        <div className="mt-12 rounded-2xl bg-[#f0f7f4] border border-[#0d9488]/15 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0d9488] flex items-center justify-center text-white font-semibold text-sm shrink-0">
              CD
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0a0c12]">{article.authorName}</p>
              <p className="text-xs text-[#0d9488] font-medium mb-2">{article.authorRole}</p>
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
      {related.length > 0 && (
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
      )}

      <SiteFooter />
    </div>
  );
}