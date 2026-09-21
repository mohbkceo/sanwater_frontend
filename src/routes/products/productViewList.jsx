import React, { useEffect, useMemo, useRef, useState } from "react";

import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";

import MainLayout from "@/layouts/MainLayout";
import useProducts from "@/services/products/useProducts";
import ProductCard from "./sections/ProductItem";

import { Button, Header } from "@/components";

import ProductNotFound from "@/components/products/ProductNotFound";

import { useTranslation } from "@/lib/i18n";

import { getFamilies } from "@/services/products/familyServices";

import {
  REDUCED_MOTION_TRANSITION,
  SCRIM_VARIANTS,
  SPRING_DEFAULT,
  SPRING_DRAWER,
} from "@/lib/springs";

const DEFAULT_FILTERS = {
  search: "",
  family: "",
  subFamily: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

function GlassIconButton({
  children,
  onClick,
  active = false,
  danger = false,
  title,
}) {
  return (
    <Motion.button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={SPRING_DEFAULT}
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full",
        "border border-white/70",
        "backdrop-blur-2xl backdrop-saturate-150",
        "transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        active
          ? "bg-blue-600 text-white"
          : danger
            ? "bg-white/60 text-red-500 hover:bg-red-50"
            : "bg-white/60 text-slate-700 hover:bg-white hover:text-blue-600",
      ].join(" ")}
    >
      {children}
    </Motion.button>
  );
}

function FilterField({ label, children, description }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-[12px] font-semibold text-slate-700">
          {label}
        </label>

        {description && (
          <p className="mt-0.5 text-[11px] text-slate-400">{description}</p>
        )}
      </div>

      {children}
    </div>
  );
}

function FilterSelect({ value, onChange, children, disabled = false }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          "h-11 w-full appearance-none rounded-xl",
          "border border-slate-200 bg-white",
          "px-3.5 pr-10 text-sm text-slate-800",
          "outline-none transition-colors",
          "focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        ].join(" ")}
      >
        {children}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function FilterInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={[
        "h-11 w-full rounded-xl",
        "border border-slate-200 bg-white",
        "px-3.5 text-sm text-slate-800",
        "placeholder:text-slate-400",
        "outline-none transition-colors",
        "focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
      ].join(" ")}
    />
  );
}

function FilterContent({ filters, families, subFamilies, updateFilter, t }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <FilterField label={t("products.family")}>
        <FilterSelect
          value={filters.family}
          onChange={(event) => updateFilter("family", event.target.value)}
        >
          <option value="">{t("products.all_families")}</option>

          {families.map((family) => (
            <option key={family._id} value={family.slug}>
              {family.name}
            </option>
          ))}
        </FilterSelect>
      </FilterField>

      <FilterField label={t("products.sub_family")}>
        <FilterSelect
          value={filters.subFamily}
          onChange={(event) => updateFilter("subFamily", event.target.value)}
          disabled={!filters.family}
        >
          <option value="">{t("products.all_sub_families")}</option>

          {subFamilies.map((subFamily) => (
            <option key={subFamily._id} value={subFamily.slug}>
              {subFamily.name}
            </option>
          ))}
        </FilterSelect>
      </FilterField>

      <FilterField label={t("products.min_price")}>
        <FilterInput
          type="number"
          value={filters.minPrice}
          placeholder="0"
          onChange={(event) => updateFilter("minPrice", event.target.value)}
        />
      </FilterField>

      <FilterField label={t("products.max_price")}>
        <FilterInput
          type="number"
          value={filters.maxPrice}
          placeholder="10000"
          onChange={(event) => updateFilter("maxPrice", event.target.value)}
        />
      </FilterField>

      <FilterField label={t("products.sort_by")}>
        <FilterSelect
          value={filters.sortBy}
          onChange={(event) => updateFilter("sortBy", event.target.value)}
        >
          <option value="createdAt">{t("products.date")}</option>

          <option value="price">{t("products.price")}</option>

          <option value="name">{t("products.name")}</option>
        </FilterSelect>
      </FilterField>

      <FilterField label={t("products.order")}>
        <FilterSelect
          value={filters.sortOrder}
          onChange={(event) => updateFilter("sortOrder", event.target.value)}
        >
          <option value="desc">{t("products.descending")}</option>

          <option value="asc">{t("products.ascending")}</option>
        </FilterSelect>
      </FilterField>
    </div>
  );
}

function FilterSheet({
  open,
  onClose,
  filters,
  families,
  subFamilies,
  updateFilter,
  clearFilters,
  t,
  prefersReducedMotion,
}) {
  const handleDragEnd = (_, info) => {
    if (info.offset.y > 110 || info.velocity.y > 600) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          variants={SCRIM_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[80] flex items-end lg:hidden"
          onClick={onClose}
        >
          <Motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={
              prefersReducedMotion ? REDUCED_MOTION_TRANSITION : SPRING_DRAWER
            }
            drag={prefersReducedMotion ? false : "y"}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.45,
            }}
            onDragEnd={handleDragEnd}
            onClick={(event) => event.stopPropagation()}
            className={[
              "w-full max-h-[88vh] overflow-y-auto",
              "rounded-t-[30px]",
              "border-t border-white/70",
              "bg-white/90",
              "backdrop-blur-3xl",
              "pb-8 pt-3",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label={t("products.filters")}
          >
            <div
              aria-hidden="true"
              className="mx-auto mb-5 h-1.5 w-11 rounded-full bg-slate-300"
            />

            <div className="flex items-center justify-between px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
                  Catalogue
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                  {t("products.filters")}
                </h2>
              </div>

              <GlassIconButton title="Fermer" onClick={onClose}>
                <X size={18} />
              </GlassIconButton>
            </div>

            <div className="px-5 pt-6">
              <FilterContent
                filters={filters}
                families={families}
                subFamilies={subFamilies}
                updateFilter={updateFilter}
                t={t}
              />
            </div>

            <div className="mt-7 flex gap-3 border-t border-slate-100 px-5 pt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={clearFilters}
                className="h-12 flex-1 rounded-full border border-slate-200 bg-white text-slate-700"
              >
                {t("products.clear_filters")}
              </Button>

              <Button
                type="button"
                onClick={onClose}
                className="h-12 flex-1 rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {t("products.apply_filters")}
              </Button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProductViewList() {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const { products, refetch, loading, hasMore, nextLastId } = useProducts();

  const prefersReducedMotion = useReducedMotion();

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...Object.fromEntries(
      Object.keys(DEFAULT_FILTERS)
        .filter((key) => searchParams.has(key))
        .map((key) => [key, searchParams.get(key)]),
    ),
  }));

  const [searchInput, setSearchInput] = useState(filters.search);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [showDesktopFilters, setShowDesktopFilters] = useState(false);

  const [families, setFamilies] = useState([]);

  useEffect(() => {
    getFamilies()
      .then((response) => {
        setFamilies(response?.data?.families || []);
      })
      .catch(() => {});
  }, []);

  const subFamilies = useMemo(
    () =>
      families.find((family) => family.slug === filters.family)?.subFamilies || [],
    [families, filters.family],
  );

  const searchDebounce = useRef(null);

  useEffect(() => {
    if (searchDebounce.current) {
      clearTimeout(searchDebounce.current);
    }

    searchDebounce.current = setTimeout(() => {
      setFilters((previous) =>
        previous.search === searchInput
          ? previous
          : {
              ...previous,
              search: searchInput,
            },
      );
    }, 400);

    return () => {
      if (searchDebounce.current) {
        clearTimeout(searchDebounce.current);
      }
    };
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

  useEffect(() => {
    const next = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) {
        next.set(key, value);
      }
    });

    setSearchParams(next, {
      replace: true,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    refetch(queryParams, false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const updateFilter = (key, value) => {
    setFilters((previous) => {
      if (key === "family") {
        const availableSubFamilies =
          families.find((family) => family.slug === value)?.subFamilies || [];
        const keepsSubFamily = availableSubFamilies.some(
          (subFamily) => subFamily.slug === previous.subFamily,
        );

        return {
          ...previous,
          family: value,
          subFamily: keepsSubFamily ? previous.subFamily : "",
        };
      }

      return { ...previous, [key]: value };
    });
  };

  const clearFilters = () => {
    setFilters({
      ...DEFAULT_FILTERS,
    });

    setSearchInput("");
  };

  const handleLoadMore = async () => {
    if (!nextLastId || loading) return;

    await refetch(
      {
        ...queryParams,
        lastId: nextLastId,
      },
      true,
    );
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== DEFAULT_FILTERS[key],
  ).length;

  const hasActiveFilters = activeFilterCount > 0;

  const resultText = !loading
    ? `${products.length}${hasMore ? "+" : ""} ${t("products.results_label")}`
    : "";

  return (
    <MainLayout bg="bg-[#F5F8FC]">
      <div className="min-h-screen">
        {/* Ambient blue background */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="absolute -right-24 top-[30%] h-96 w-96 rounded-full bg-sky-200/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          {/* =====================================================
              Page header
          ===================================================== */}
          <div className="mx-auto max-w-7xl">
            <Header
              title={t("products.title")}
              discription={t("products.description")}
            />
          </div>

          {/* =====================================================
              Floating catalog toolbar
          ===================================================== */}
          <div className="sticky top-4 z-50 mx-auto mt-7 max-w-7xl">
            <div
              className={[
                "rounded-[24px]",
                "border border-white/80",
                "bg-white/65",
                "backdrop-blur-2xl",
                "backdrop-saturate-150",
                "px-3 py-3",
                "shadow-xs",
              ].join(" ")}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                {/* Search */}
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={18}
                    className={[
                      "pointer-events-none absolute left-4",
                      "top-1/2 -translate-y-1/2",
                      "text-slate-400",
                    ].join(" ")}
                  />

                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={t("products.search_placeholder")}
                    className={[
                      "h-12 w-full rounded-2xl",
                      "border border-slate-200/80",
                      "bg-white/80",
                      "pl-11 pr-11",
                      "text-sm text-slate-900",
                      "placeholder:text-slate-400",
                      "outline-none",
                      "transition-all",
                      "focus:border-blue-400",
                      "focus:ring-4",
                      "focus:ring-blue-500/10",
                    ].join(" ")}
                  />

                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        updateFilter("search", "");
                      }}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Effacer la recherche"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    transition={SPRING_DEFAULT}
                    onClick={() => setShowDesktopFilters((value) => !value)}
                    className={[
                      "hidden h-12 items-center gap-2",
                      "rounded-full border",
                      "px-4 text-sm font-semibold",
                      "transition-colors lg:flex",
                      showDesktopFilters || hasActiveFilters
                        ? "border-blue-200 bg-blue-50 text-blue-600"
                        : "border-slate-200 bg-white/80 text-slate-700 hover:border-blue-200 hover:text-blue-600",
                    ].join(" ")}
                  >
                    <SlidersHorizontal size={17} />

                    <span>{t("products.filters")}</span>

                    {activeFilterCount > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Motion.button>

                  <Motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    transition={SPRING_DEFAULT}
                    onClick={() => setShowFilterDrawer(true)}
                    className={[
                      "flex h-12 flex-1 items-center justify-center gap-2",
                      "rounded-full border",
                      "px-4 text-sm font-semibold",
                      "lg:hidden",
                      hasActiveFilters
                        ? "border-blue-200 bg-blue-50 text-blue-600"
                        : "border-slate-200 bg-white/80 text-slate-700",
                    ].join(" ")}
                  >
                    <SlidersHorizontal size={17} />

                    <span>{t("products.filters")}</span>

                    {activeFilterCount > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Motion.button>

                  <GlassIconButton
                    title={t("products.reset")}
                    onClick={clearFilters}
                    danger={hasActiveFilters}
                  >
                    <X size={17} />
                  </GlassIconButton>
                </div>
              </div>

              {/* Desktop filter panel */}
              <AnimatePresence initial={false}>
                {showDesktopFilters && (
                  <Motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    transition={
                      prefersReducedMotion
                        ? REDUCED_MOTION_TRANSITION
                        : SPRING_DEFAULT
                    }
                    className="overflow-hidden"
                  >
                    <div className="mt-3 border-t border-slate-100 pt-5">
                      <FilterContent
                        filters={filters}
                        families={families}
                        subFamilies={subFamilies}
                        updateFilter={updateFilter}
                        t={t}
                      />
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* =====================================================
              Results toolbar
          ===================================================== */}
          <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {resultText}
              </div>

              {hasActiveFilters && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-600">
                  <Check size={13} />
                  Filtres actifs
                </div>
              )}
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span>Trier par</span>

              <span className="font-semibold text-slate-700">
                {filters.sortBy === "createdAt"
                  ? t("products.date")
                  : filters.sortBy === "price"
                    ? t("products.price")
                    : t("products.name")}
              </span>

              <ChevronDown size={14} />
            </div>
          </div>

          {/* =====================================================
              Product grid
          ===================================================== */}
          <div
            className={[
              "mx-auto mt-4 grid max-w-7xl",
              "grid-cols-1 gap-4",
              "sm:grid-cols-2",
              "lg:grid-cols-3",
              "xl:grid-cols-4",
              loading && products.length === 0 ? "opacity-70" : "",
            ].join(" ")}
          >
            {loading && products.length === 0
              ? Array.from({
                  length: 8,
                }).map((_, index) => <ProductSkeleton key={index} />)
              : products.map((product, index) => (
                  <Motion.div
                    key={product._id}
                    initial={{
                      opacity: 0,
                      y: prefersReducedMotion ? 0 : 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      ...SPRING_DEFAULT,
                      delay: prefersReducedMotion
                        ? 0
                        : Math.min(index, 10) * 0.035,
                    }}
                  >
                    <ProductCard product={product} />
                  </Motion.div>
                ))}
          </div>

          {/* =====================================================
              Empty state
          ===================================================== */}
          {!loading && products.length === 0 && (
            <div className="mx-auto mt-10 max-w-7xl rounded-[28px] border border-slate-200 bg-white px-6 py-12">
              <ProductNotFound
                description={t("products.no_products_found_description")}
                mainTitle={t("products.no_products_found_title")}
              />

              {hasActiveFilters && (
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700"
                  >
                    {t("products.clear_filters")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              Load more
          ===================================================== */}
          {products.length > 0 && (
            <div className="mx-auto mt-12 max-w-7xl">
              <Motion.div
                whileTap={{ scale: 0.985 }}
                transition={SPRING_DEFAULT}
              >
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!hasMore || loading}
                  onClick={handleLoadMore}
                  className={[
                    "h-12 w-full rounded-full",
                    "border border-slate-200",
                    "bg-white",
                    "text-sm font-semibold",
                    "text-slate-700",
                    "shadow-xs",
                    "hover:border-blue-200",
                    "hover:bg-blue-50",
                    "hover:text-blue-600",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-40",
                  ].join(" ")}
                >
                  {loading
                    ? t("products.loading_products")
                    : hasMore
                      ? t("products.load_more")
                      : t("products.no_more_products")}
                </Button>
              </Motion.div>
            </div>
          )}
        </div>

        <FilterSheet
          open={showFilterDrawer}
          onClose={() => setShowFilterDrawer(false)}
          filters={filters}
          families={families}
          subFamilies={subFamilies}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          t={t}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </MainLayout>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />

      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-100" />
        <div className="h-5 w-1/3 animate-pulse rounded-md bg-blue-50" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
