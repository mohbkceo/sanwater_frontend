import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { getNewsArticles } from "@/services/newsServices";
import { useTranslation } from "@/lib/i18n";

import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/SEO";

import { REDUCED_MOTION_TRANSITION, SPRING_DEFAULT } from "@/lib/springs";

const LIMIT = 10;

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function GlassButton({
  children,
  onClick,
  active = false,
  danger = false,
  title,
  className = "",
}) {
  return (
    <motion.button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={SPRING_DEFAULT}
      className={[
        "inline-flex h-11 items-center justify-center gap-2",
        "rounded-full border border-white/75",
        "backdrop-blur-2xl backdrop-saturate-150",
        "transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        active
          ? "bg-blue-600 text-white"
          : danger
            ? "bg-white/60 text-red-500 hover:bg-red-50"
            : "bg-white/65 text-slate-700 hover:bg-white hover:text-blue-600",
        className,
      ].join(" ")}
    >
      {children}
    </motion.button>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />

      <div className="space-y-3 p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function ArticleCard({ article, featured = false, t }) {
  const prefersReducedMotion = useReducedMotion();

  const publishedAt = article.publishedAt || article.createdAt;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : 12,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-60px",
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={SPRING_DEFAULT}
    >
      <Link
        to={`/news/${article.slug}`}
        className={[
          "group block overflow-hidden",
          "rounded-[26px]",
          "border border-slate-200",
          "bg-white",
          "transition-colors duration-200",
          "hover:border-blue-200",
          featured ? "lg:grid lg:grid-cols-[1.45fr_1fr]" : "",
        ].join(" ")}
      >
        {/* Image */}
        <div
          className={[
            "relative overflow-hidden bg-slate-100",
            featured
              ? "aspect-[16/10] lg:aspect-auto lg:min-h-[360px]"
              : "aspect-[16/10]",
          ].join(" ")}
        >
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              loading="lazy"
              className={[
                "h-full w-full object-cover",
                "transition-transform duration-700 ease-out",
                "group-hover:scale-[1.025]",
              ].join(" ")}
            />
          ) : (
            <div className="flex h-full min-h-[230px] items-center justify-center text-sm text-slate-400">
              {t("news.no_image") || "No image"}
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            {article.isFeatured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-black/20 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-xl">
                <Sparkles size={12} />
                {t("news.featured") || "Featured"}
              </span>
            ) : (
              <span />
            )}

            {article.category && (
              <span className="max-w-[48%] truncate rounded-full border border-white/60 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-xl">
                {article.category}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          className={[
            "flex flex-col p-5 sm:p-6",
            featured ? "justify-center lg:p-8 xl:p-10" : "",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">
            <Clock3 size={13} />

            <span>{formatShortDate(publishedAt)}</span>
          </div>

          <h2
            className={[
              "mt-3 font-bold tracking-tight text-slate-950",
              "transition-colors group-hover:text-blue-600",
              featured
                ? "text-2xl leading-tight sm:text-3xl lg:text-4xl"
                : "line-clamp-2 text-lg leading-snug",
            ].join(" ")}
          >
            {article.title}
          </h2>

          {article.excerpt && (
            <p
              className={[
                "mt-3 leading-6 text-slate-500",
                featured ? "line-clamp-4 text-[15px]" : "line-clamp-2 text-sm",
              ].join(" ")}
            >
              {article.excerpt}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            {article.author ? (
              <span className="max-w-[65%] truncate text-xs font-medium text-slate-400">
                {t("news.by") || "By"} {article.author}
              </span>
            ) : (
              <span />
            )}

            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
              {t("news.read_more") || "Read article"}

              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function NewsListingPage() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [category, setCategory] = useState("");
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, featured]);

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      try {
        setLoading(true);

        const params = {
          page: currentPage,
          limit: LIMIT,
          ...(searchTerm && {
            search: searchTerm,
          }),
          ...(category && {
            category,
          }),
          ...(featured && {
            featured: "true",
          }),
        };

        const response = await getNewsArticles(params);

        if (cancelled) return;

        setNews(response?.data?.news || []);

        setTotalPages(response?.data?.totalPages || 1);

        setError(null);
      } catch (err) {
        if (cancelled) return;

        setError(t("news.load_error") || "Failed to load news articles");

        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      cancelled = true;
    };
  }, [currentPage, searchTerm, category, featured, t]);

  const categories = useMemo(() => {
    const unique = new Set();

    news.forEach((article) => {
      if (article.category) {
        unique.add(article.category);
      }
    });

    return Array.from(unique);
  }, [news]);

  const featuredArticle = useMemo(
    () => news.find((article) => article.isFeatured),
    [news],
  );

  const regularArticles = useMemo(
    () =>
      featuredArticle
        ? news.filter((article) => article._id !== featuredArticle._id)
        : news,
    [news, featuredArticle],
  );

  const hasFilters = Boolean(searchInput) || Boolean(category) || featured;

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setCategory("");
    setFeatured(false);
    setCurrentPage(1);
  };

  return (
    <MainLayout bg="bg-[#F5F8FC]">
      <SEO
        title={t("news.seo_title") || "Latest News"}
        description={
          t("news.seo_description") ||
          "Stay updated with the latest news from SanWater"
        }
        url={window.location.href}
      />

      <div className="relative min-h-screen overflow-hidden">
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-40 top-16 h-80 w-80 rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute -right-40 top-[32%] h-96 w-96 rounded-full bg-sky-200/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* =====================================================
                Header
            ===================================================== */}
            <header className="max-w-3xl">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                SanWater Journal
              </div>

              <h1 className="text-4xl font-bold tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl">
                {t("news.title") || "Latest News"}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                {t("news.description") ||
                  "Stay updated with our latest news and announcements"}
              </p>
            </header>

            {/* =====================================================
                Floating search / filter toolbar
            ===================================================== */}
            <div className="sticky top-4 z-50 mt-8">
              <div className="rounded-[24px] border border-white/80 bg-white/65 p-2.5 shadow-xs backdrop-blur-2xl backdrop-saturate-150">
                <div className="flex flex-col gap-2 lg:flex-row">
                  {/* Search */}
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      setCurrentPage(1);
                      setSearchTerm(searchInput);
                    }}
                    className="relative min-w-0 flex-1"
                  >
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder={
                        t("news.search_placeholder") || "Search news..."
                      }
                      className={[
                        "h-12 w-full rounded-2xl",
                        "border border-slate-200",
                        "bg-white/85",
                        "pl-11 pr-11",
                        "text-sm text-slate-900",
                        "placeholder:text-slate-400",
                        "outline-none",
                        "transition-colors",
                        "focus:border-blue-400",
                        "focus:ring-4 focus:ring-blue-500/10",
                      ].join(" ")}
                    />

                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput("");
                          setSearchTerm("");
                        }}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </form>

                  {/* Filters */}
                  <div className="flex gap-2">
                    {categories.length > 0 && (
                      <div className="relative min-w-0 flex-1 lg:min-w-[170px] lg:flex-none">
                        <select
                          value={category}
                          onChange={(event) => setCategory(event.target.value)}
                          className={[
                            "h-12 w-full appearance-none",
                            "rounded-full",
                            "border border-slate-200",
                            "bg-white/80",
                            "px-4 pr-10",
                            "text-sm font-medium text-slate-700",
                            "outline-none",
                            "focus:border-blue-400",
                            "focus:ring-4 focus:ring-blue-500/10",
                          ].join(" ")}
                        >
                          <option value="">
                            {t("news.all_categories") || "All categories"}
                          </option>

                          {categories.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>

                        <ChevronRight
                          size={15}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                        />
                      </div>
                    )}

                    <GlassButton
                      active={featured}
                      onClick={() => setFeatured((value) => !value)}
                      title={t("news.featured") || "Featured"}
                      className="flex-1 px-4 lg:flex-none"
                    >
                      <Sparkles size={16} />

                      <span className="text-sm font-semibold">
                        {t("news.featured") || "Featured"}
                      </span>
                    </GlassButton>

                    {hasFilters && (
                      <GlassButton
                        danger
                        onClick={clearFilters}
                        title="Clear filters"
                        className="w-11 px-0"
                      >
                        <X size={17} />
                      </GlassButton>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                Result meta
            ===================================================== */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                {loading
                  ? "..."
                  : `${news.length} ${t("news.results") || "articles"}`}
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {t("news.clear_filters") || "Clear filters"}
                </button>
              )}
            </div>

            {/* =====================================================
                Error
            ===================================================== */}
            {error && !loading && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* =====================================================
                Loading
            ===================================================== */}
            {loading ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : news.length > 0 ? (
              <>
                {/* Featured */}
                {featuredArticle && (
                  <section className="mt-5">
                    <ArticleCard article={featuredArticle} featured t={t} />
                  </section>
                )}

                {/* Regular articles */}
                {regularArticles.length > 0 && (
                  <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {regularArticles.map((article) => (
                      <ArticleCard key={article._id} article={article} t={t} />
                    ))}
                  </section>
                )}
              </>
            ) : (
              /* ==================================================
                 Empty state
              ================================================== */
              <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <Search size={23} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-950">
                  {t("news.no_articles") || "No news articles found"}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {t("news.no_articles_description") ||
                    "Try changing your search or filters to find another article."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 inline-flex h-11 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    {t("news.clear_filters") || "Clear filters"}
                  </button>
                )}
              </div>
            )}

            {/* =====================================================
                Pagination
            ===================================================== */}
            {!loading && totalPages > 1 && (
              <nav
                className="mt-12 flex items-center justify-center gap-2"
                aria-label="News pagination"
              >
                <GlassButton
                  title={t("news.previous") || "Previous"}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="w-11 px-0"
                >
                  <ChevronLeft size={18} />
                </GlassButton>

                <div className="flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-xs">
                  <span className="text-blue-600">{currentPage}</span>

                  <span className="mx-2 text-slate-300">/</span>

                  <span>{totalPages}</span>
                </div>

                <GlassButton
                  title={t("news.next") || "Next"}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  className="w-11 px-0"
                >
                  <ChevronRight size={18} />
                </GlassButton>
              </nav>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
