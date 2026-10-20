import { useTranslation } from "@/lib/i18n";
import { useIntelligenceCopy } from "@/lib/intelligenceCopy";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";
import { toast } from "sonner";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import useProducts from "@/services/products/useProducts";
import {
  deleteProduct,
  updateProduct,
} from "@/services/products/productServices";
import { ProductCard } from "@/components";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/configs/permissions";
import { getFamilies } from "@/services/products/familyServices";

const PAGE_SIZE = 24;
const GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-5";
const CONTROL_CLASS =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

function FilterSelect({ id, label, value, onChange, disabled, children }) {
  return (
    <div className="min-w-0 flex-1">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold text-slate-600"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`${CONTROL_CLASS} appearance-none pe-10`}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute end-3.5 top-3.5 h-4 w-4 text-slate-400"
        />
      </div>
    </div>
  );
}

function ProductSkeletons() {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-slate-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-slate-100" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-8 w-10 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyCatalog({ filtered, canManage, onReset, onCreate, tx, t }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center sm:px-8">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        {filtered ? (
          <Search className="h-6 w-6" />
        ) : (
          <Package className="h-6 w-6" />
        )}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {filtered ? tx("No matching products") : tx("Your catalog is empty")}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {filtered
          ? tx("Try a different search, or clear the active filters.")
          : tx("Add your first product to start building your catalog.")}
      </p>
      {filtered ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <X className="h-4 w-4" />
          {tx("Clear filters")}
        </button>
      ) : canManage ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Plus className="h-4 w-4" />
          {t("admin.products.add_product")}
        </button>
      ) : null}
    </div>
  );
}

function DeleteProductDialog({ product, busy, onCancel, onConfirm, t }) {
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    cancelRef.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === "Escape" && !busy) {
      event.preventDefault();
      onCancel();
    }
    if (event.key !== "Tab") return;

    const first = cancelRef.current;
    const last = confirmRef.current;
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-product-title"
      aria-describedby="delete-product-description"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-7">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2
          id="delete-product-title"
          className="text-lg font-semibold tracking-tight text-slate-950"
        >
          {t("admin.products.delete_product")}
        </h2>
        <p
          id="delete-product-description"
          className="mt-2 text-sm leading-6 text-slate-600"
        >
          {t("admin.products.delete_confirmation", {
            product: product.name || product.productId || product.serialNumber,
          })}
        </p>
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {t("admin.products.cancel")}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-wait disabled:opacity-60"
          >
            {busy && <RefreshCw className="h-4 w-4 animate-spin" />}
            {t("admin.products.delete_permanently")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const tx = useIntelligenceCopy();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);
  const canSeeAnalytics = can(PERMISSIONS.ANALYTICS.PRODUCTS);
  const { products, loading, refetch, totalPages, totalCount } = useProducts();

  const [isEcommerce, setIsEcommerce] = useState(false);
  const [families, setFamilies] = useState([]);
  const [family, setFamily] = useState("");
  const [subFamily, setSubFamily] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const resultsRef = useRef(null);

  // Keep the existing hook/API contract without requiring refetch to be memoized.
  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  const requestProducts = () =>
    refetchRef.current({
      isAdmin: true,
      isEcommerce,
      family,
      subFamily,
      search,
      page,
      limit: PAGE_SIZE,
    });

  useEffect(() => {
    requestProducts();
    // This request changes only when filter/page values change. The latest
    // refetch function is read from the ref to prevent accidental loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEcommerce, family, subFamily, search, page]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let mounted = true;
    getFamilies({ isAdmin: true })
      .then((response) => {
        if (mounted) setFamilies(response?.data?.families || []);
      })
      .catch((error) =>
        console.error("Could not load product families:", error),
      );
    return () => {
      mounted = false;
    };
  }, []);

  const subFamilies = useMemo(
    () => families.find((item) => item.slug === family)?.subFamilies || [],
    [families, family],
  );
  const displayedProducts = Array.isArray(products) ? products : [];
  const resultCount = Number.isFinite(Number(totalCount))
    ? Number(totalCount)
    : 0;
  const pageCount = Math.max(1, Number(totalPages) || 1);
  const activeFilters =
    Number(Boolean(searchInput.trim())) +
    Number(Boolean(family)) +
    Number(Boolean(subFamily)) +
    Number(isEcommerce);
  const hasFilters = activeFilters > 0;

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setFamily("");
    setSubFamily("");
    setIsEcommerce(false);
    setPage(1);
  }

  function changeFamily(value) {
    setFamily(value);
    setSubFamily(""); // Subfamily options depend on the selected family.
    setPage(1);
  }

  function changePage(nextPage) {
    if (nextPage < 1 || nextPage > pageCount || loading) return;
    setPage(nextPage);
    resultsRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  async function handleDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteProduct(pendingDelete.serialNumber);
      toast.success(t("admin.products.product_deleted_successfully"));
      setPendingDelete(null);
      // If the deleted product was the only item on this page, move back.
      if (displayedProducts.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        requestProducts();
      }
    } catch (error) {
      console.error(error);
      toast.error(t("admin.products.failed_to_delete_product"));
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(serialNumber, isActive) {
    try {
      await updateProduct(serialNumber, { isActive });
      toast.success(
        isActive
          ? t("admin.products.product_is_now_visible")
          : t("admin.products.product_is_now_hidden"),
      );
      requestProducts();
    } catch (error) {
      console.error(error);
      toast.error(t("admin.products.failed_to_update_product_visibility"));
    }
  }

  return (
    <section className="min-w-0 px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pt-7">
      <div className="mx-auto w-full max-w-[1680px]">
        {/* 1. Page identity and primary actions */}
        <header className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Package className="h-4 w-4" aria-hidden="true" />
              <span>{t("admin.products.catalog")}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[30px]">
              {t("admin.products.products")}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              {t(
                "admin.products.manage_your_product_catalog_visibility_and_ecommerce_availability",
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:shrink-0">
            {canManage && (
              <Link
                to={SANWATERGROUPROUTES.products.shipping.fullPath}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:flex-none"
              >
                <Truck className="h-4 w-4" aria-hidden="true" />
                {tx("Edit Shipping Prices")}
              </Link>
            )}
            <button
              type="button"
              onClick={requestProducts}
              disabled={loading}
              title={t("admin.products.refresh_products")}
              aria-label={t("admin.products.refresh_products")}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => navigate("create")}
              disabled={!canManage}
              title={
                canManage
                  ? t("admin.products.add_product")
                  : t("admin.common.permission_denied")
              }
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("admin.products.add_product")}
            </button>
          </div>
        </header>

        {/* 2. Search, catalog scope, and category filters */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.025] sm:p-5">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[510px] lg:flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute start-3.5 top-3.5 h-4 w-4 text-slate-400"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("admin.families.search_by_name_id_or_serial")}
                aria-label={t("admin.common.search")}
                className={`${CONTROL_CLASS} ps-10 pe-11`}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label={tx("Clear search")}
                  className="absolute end-2 top-1.5 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div
              className="inline-flex w-full items-center gap-1 rounded-xl bg-slate-100 p-1 sm:w-fit"
              role="group"
              aria-label={tx("Catalog scope")}
            >
              <button
                type="button"
                aria-pressed={!isEcommerce}
                onClick={() => {
                  setIsEcommerce(false);
                  setPage(1);
                }}
                className={`inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-all sm:flex-none sm:px-4 ${
                  !isEcommerce
                    ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/70"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                {tx("All products")}
              </button>
              <button
                type="button"
                aria-pressed={isEcommerce}
                onClick={() => {
                  setIsEcommerce(true);
                  setPage(1);
                }}
                className={`inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-all sm:flex-none sm:px-4 ${
                  isEcommerce
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/70"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                {t("admin.products.online_store")}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-stretch gap-3 md:flex-row md:items-end">
            <div className="hidden h-11 shrink-0 items-center gap-2 pb-0.5 text-sm font-semibold text-slate-500 lg:flex">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {tx("Filters")}
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-[650px]">
              <FilterSelect
                id="catalog-family-filter"
                label={t("admin.products.filter_by_family")}
                value={family}
                onChange={changeFamily}
              >
                <option value="">{t("admin.products.all_families")}</option>
                {families.map((item) => (
                  <option key={item._id || item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect
                id="catalog-subfamily-filter"
                label={t("admin.products.filter_by_sub_family")}
                value={subFamily}
                onChange={(value) => {
                  setSubFamily(value);
                  setPage(1);
                }}
                disabled={!family}
              >
                <option value="">{t("admin.products.all_sub_families")}</option>
                {subFamilies.map((item) => (
                  <option key={item._id || item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </FilterSelect>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:ms-auto"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                {tx("Clear filters")}
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs tabular-nums text-slate-500">
                  {activeFilters}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Catalog results */}
        <div ref={resultsRef} className="mt-6 scroll-mt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-slate-900">
                {tx("Product list")}
              </h2>
              <span
                role="status"
                aria-live="polite"
                className="inline-flex min-w-8 items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600"
              >
                {loading ? "…" : resultCount}
              </span>
            </div>
            {isEcommerce && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                {t("admin.products.ecommerce")}
              </span>
            )}
          </div>

          <div aria-busy={loading}>
            {loading ? (
              <ProductSkeletons />
            ) : displayedProducts.length > 0 ? (
              <div className={GRID_CLASS}>
                {displayedProducts.map((product) => (
                  <div key={product.serialNumber} className="min-w-0">
                    <ProductCard
                      product={product}
                      onDelete={() => setPendingDelete(product)}
                      onToggleActive={handleToggleActive}
                      canManage={canManage}
                    />
                    {canSeeAnalytics && product._id && (
                      <Link
                        to={`${SANWATERGROUPROUTES.subjects.fullPath}/product/${product._id}`}
                        className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {tx("Performance & activity")}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyCatalog
                filtered={hasFilters}
                canManage={canManage}
                onReset={resetFilters}
                onCreate={() => navigate("create")}
                tx={tx}
                t={t}
              />
            )}
          </div>

          {!loading && pageCount > 1 && (
            <nav
              aria-label={tx("Product pages")}
              className="mt-7 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row"
            >
              <span className="text-xs font-medium tabular-nums text-slate-500">
                {t("admin.common.page_of", { page, total: pageCount })}
              </span>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  <ChevronLeft
                    className="h-4 w-4 rtl:rotate-180"
                    aria-hidden="true"
                  />
                  {t("admin.products.previous")}
                </button>
                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => changePage(page + 1)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  {t("admin.products.next")}
                  <ChevronRight
                    className="h-4 w-4 rtl:rotate-180"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>

      {pendingDelete && (
        <DeleteProductDialog
          product={pendingDelete}
          busy={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
          t={t}
        />
      )}
    </section>
  );
}
