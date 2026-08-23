import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import useProducts from "@/services/products/useProducts";
import ProductCard from "./sections/ProductItem";
import { Button, Header } from "@/components";
import ProductNotFound from "@/components/products/ProductNotFound";
import { useTranslation } from "@/lib/i18n";
import { getCategories } from "@/services/products/categoryServices";
import { getCollections } from "@/services/products/collectionServices";

const DEFAULT_FILTERS = {
  search: "",
  family: "",
  category: "",
  collection: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

// Flattens the nested category tree (see server categoryController.getCategories)
// into a flat list of {slug, label} for a simple <select>, indenting
// subcategories so the hierarchy is still visible.
function flattenCategories(categories, depth = 0, acc = []) {
  for (const cat of categories) {
    acc.push({ slug: cat.slug, label: `${"— ".repeat(depth)}${cat.name}` });
    if (cat.subcategories?.length) flattenCategories(cat.subcategories, depth + 1, acc);
  }
  return acc;
}

export default function ProductViewList() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, refetch, loading, hasMore, nextLastId } = useProducts();

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...Object.fromEntries(
      Object.keys(DEFAULT_FILTERS)
        .filter((key) => searchParams.has(key))
        .map((key) => [key, searchParams.get(key)])
    ),
  }));
  const [searchInput, setSearchInput] = useState(filters.search);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  // Load the real category/collection lists for the filter dropdowns. Both
  // are dynamic/admin-managed — if none exist yet the dropdowns just show
  // only the "all" option, which is correct (nothing fabricated).
  useEffect(() => {
    getCategories().then((res) => setCategories(flattenCategories(res?.data?.categories || []))).catch(() => {});
    getCollections().then((res) => setCollections(res?.data?.collections || [])).catch(() => {});
  }, []);

  // Debounce the free-text search box so we don't fire a request per
  // keystroke — everything else updates the filters immediately.
  const searchDebounce = useRef(null);
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
    }, 400);
    return () => clearTimeout(searchDebounce.current);
  }, [searchInput]);

  const queryParams = useMemo(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }
    });
    params.max = 15;
    return params;
  }, [filters]);

  // Keep the URL in sync with the active filters (minus pagination), so the
  // filtered view is shareable/bookmarkable and back/forward works.
  useEffect(() => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) next.set(key, value);
    });
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    refetch(queryParams, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleLoadMore = async () => {
    if (!nextLastId || loading) return;
    await refetch({ ...queryParams, lastId: nextLastId }, true);
  };

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== DEFAULT_FILTERS[key]
  ).length;

  const filterPanel = (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <label className="mb-2 block text-sm font-medium opacity-80">{t("products.category")}</label>
        <select
          value={filters.category}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
        >
          <option value="">{t("products.all_categories")}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium opacity-80">{t("products.collection")}</label>
        <select
          value={filters.collection}
          onChange={(e) => updateFilter("collection", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
        >
          <option value="">{t("products.all_collections")}</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium opacity-80">{t("products.family")}</label>
        <input
          type="text"
          placeholder="Ex: Bottle, Filter..."
          value={filters.family}
          onChange={(e) => updateFilter("family", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-2 block text-sm font-medium opacity-80">{t("products.min_price")}</label>
          <input
            type="number" min="0" placeholder="0"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium opacity-80">{t("products.max_price")}</label>
          <input
            type="number" min="0" placeholder="10000"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium opacity-80">{t("products.sort_by")}</label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter("sortBy", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
        >
          <option value="createdAt">{t("products.date")}</option>
          <option value="price">{t("products.price")}</option>
          <option value="name">{t("products.name")}</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium opacity-80">{t("products.order")}</label>
        <select
          value={filters.sortOrder}
          onChange={(e) => updateFilter("sortOrder", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
        >
          <option value="desc">{t("products.descending")}</option>
          <option value="asc">{t("products.ascending")}</option>
        </select>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Header title={t("products.title")} discription={t("products.description")} />

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-md">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <input
                type="text"
                placeholder={t("products.search_placeholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 pl-11 outline-none transition focus:border-white/30"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 opacity-70" />
            </div>

            <div className="flex gap-2">
              <Button
                type="button" variant="secondary"
                className="border border-white/20 bg-white/20 hover:bg-white/30 relative"
                onClick={() => setShowFilterDrawer(true)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t("products.filters")}
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0050A4] px-1 text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <Button
                type="button" variant="secondary"
                className="border border-white/20 bg-white/20 hover:bg-white/30"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                {t("products.reset")}
              </Button>
            </div>
          </div>

          {/* Desktop: inline panel. Mobile: drawer (toggled below). */}
          <div className="mt-4 hidden lg:block">{filterPanel}</div>
        </div>

        {/* Mobile filter drawer */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilterDrawer(false)} />
            <div className="relative ml-auto h-full w-full max-w-sm overflow-y-auto bg-[#eaf6fc] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal size={18} /> {t("products.filters")}
                </h2>
                <button onClick={() => setShowFilterDrawer(false)} aria-label="Close" className="text-gray-500">
                  <X size={22} />
                </button>
              </div>
              {filterPanel}
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={clearFilters}>
                  {t("products.clear_filters")}
                </Button>
                <Button className="flex-1" onClick={() => setShowFilterDrawer(false)}>
                  {t("products.apply_filters")}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm opacity-70">
          {!loading && `${products.length}${hasMore ? "+" : ""} ${t("products.results_label")}`}
        </div>

        <div
          className={`mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 ${
            loading && products.length === 0 ? "opacity-40" : ""
          }`}
        >
          {loading && products.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-3xl bg-white/20" />
              ))
            : products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>

        {!loading && products.length === 0 && (
          <ProductNotFound
            className="bg-white/20"
            description={t("products.no_products_found_description")}
            mainTitle={t("products.no_products_found_title")}
          />
        )}

        {products.length > 0 && (
          <div className="mt-12 w-full">
            <Button
              variant="secondary"
              disabled={!hasMore || loading}
              onClick={handleLoadMore}
              className="w-full border border-white/20 bg-white/20 text-black hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? t("products.loading_products") : hasMore ? t("products.load_more") : t("products.no_more_products")}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
