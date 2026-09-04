import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import { base44 } from "@/api/base44Client";
import { INSIGHTS, AUTHOR, MARKET_NAMES, normalizeInsight } from "@/lib/insights";
import GooglePagination from "@/components/insights/GooglePagination";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function MarketBadge({ market }) {
  const m = MARKET_NAMES[market] || MARKET_NAMES.GLOBAL;
  if (market === "GLOBAL" || !m) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0a2e2a] bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-2 py-0.5">
      <span className="text-[11px] leading-none">{m.flag}</span> {m.name}
    </span>
  );
}

export default function Insights() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    base44.entities.Insight.filter({ status: "published" }, "-published_at", 50)
      .then((rows) => {
        const dyn = (rows || []).map((r) => normalizeInsight(r, true));
        const stat = INSIGHTS.map((a) => normalizeInsight(a, false));
        const merged = [...dyn, ...stat].sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        setArticles(merged);
      })
      .catch(() => {
        setArticles(INSIGHTS.map((a) => normalizeInsight(a, false)));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [articles.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  const [featured, ...rest] = articles;
  const pageCount = Math.ceil(rest.length / PAGE_SIZE);
  const paged = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0d9488]/[0.05] rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-4 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Insights
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            Lending intelligence from the team building CreditDecide
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed max-w-2xl">
            Practical, technical writing on AI underwriting, credit decisioning, document intelligence, and
            explainable risk — covering every market we serve, with new articles published every weekday.
          </p>
        </div>
      </section>

      {featured && (
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
          <Link
            to={`/insights/${featured.slug}`}
            className="group block rounded-2xl border border-[#e8eaee] bg-white hover:border-[#d0d3d8] transition-colors overflow-hidden"
          >
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-gradient-to-br from-[#f0f7f4] to-white p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#0d9488]">Featured · {featured.category}</span>
                  <MarketBadge market={featured.market} />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#0a0c12] leading-snug group-hover:text-[#0d9488] transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-[#525965] leading-relaxed line-clamp-3">{featured.excerpt}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12]">
                  Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <div className="md:col-span-3 p-8 bg-[#fcfcfd] flex flex-col justify-center border-l border-[#eceef1]">
                <div className="text-xs text-[#8a909c] flex items-center gap-3">
                  <span>{formatDate(featured.publishedAt)}</span>
                  <span className="text-[#d0d3d8]">·</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readingTime} min read</span>
                </div>
                <p className="mt-4 text-[15px] text-[#525965] leading-relaxed">{featured.excerpt}</p>
                <p className="mt-6 text-xs text-[#8a909c]">By {featured.authorName} · {featured.authorRole}</p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Article grid */}
      <section id="articles" className="max-w-5xl mx-auto px-5 sm:px-8 pb-16 scroll-mt-4">
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-5">All articles</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {paged.map((a) => (
            <Link
              key={a.slug}
              to={`/insights/${a.slug}`}
              className="group flex flex-col rounded-2xl border border-[#e8eaee] bg-white p-6 hover:border-[#d0d3d8] hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0d9488]">{a.category}</span>
                <MarketBadge market={a.market} />
              </div>
              <h4 className="text-base font-semibold text-[#0a0c12] leading-snug group-hover:text-[#0d9488] transition-colors">
                {a.title}
              </h4>
              <p className="mt-2.5 text-sm text-[#525965] leading-relaxed line-clamp-3 flex-1">{a.excerpt}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-[#8a909c]">
                <span>{formatDate(a.publishedAt)}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {a.readingTime} min</span>
              </div>
            </Link>
          ))}
        </div>

        <GooglePagination
          page={page}
          pageCount={pageCount}
          onChange={(p) => {
            setPage(p);
            document.getElementById("articles")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </section>

      <SiteFooter />
    </div>
  );
}