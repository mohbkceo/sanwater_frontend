import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Package, RefreshCw, ShoppingBag } from "lucide-react";
import useProducts from "@/services/products/useProducts";
import {
  deleteProduct,
  updateProduct,
} from "@/services/products/productServices";
import { Button, ProductCard } from "@/components";
import ProductNotFound from "@/components/products/ProductNotFound";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/configs/permissions";
import { getFamilies } from "@/services/products/familyServices";
export default function ProductsPage() {
  const { products, loading, refetch } = useProducts();
  const [isEcommerce, setIsEcommerce] = useState(false);
  const [families, setFamilies] = useState([]);
  const [family, setFamily] = useState("");
  const [subFamily, setSubFamily] = useState("");
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);
  const loadProducts = () => {
    refetch({ isAdmin: true, isEcommerce, family, subFamily });
  };
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEcommerce, family, subFamily]);

  useEffect(() => {
    getFamilies({ isAdmin: true })
      .then((response) => setFamilies(response?.data?.families || []))
      .catch((error) => console.error(error));
  }, []);

  const subFamilies = useMemo(
    () => families.find((entry) => entry.key === family)?.subFamilies || [],
    [families, family],
  );

  function handleFamilyChange(value) {
    setFamily(value);
    setSubFamily((current) =>
      (families.find((entry) => entry.key === value)?.subFamilies || []).some(
        (entry) => entry.key === current,
      )
        ? current
        : "",
    );
  }
  async function handleDelete(serialNumber) {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this product?",
      );
      if (!confirmed) return;
      await deleteProduct(serialNumber);
      toast.success("Product deleted successfully");
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  }
  async function handleToggleActive(serialNumber, isActive) {
    try {
      await updateProduct(serialNumber, { isActive });
      toast.success(
        isActive ? "Product is now visible" : "Product is now hidden",
      );
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product visibility");
    }
  }
  return (
    <section className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      {" "}
      <div className="mx-auto max-w-[1800px]">
        {" "}
        {/* ------------------------------------------------- HEADER ------------------------------------------------- */}{" "}
        <div className="mb-8">
          {" "}
          <div className=" flex flex-col gap-5 rounded-3xl border border-white/70 bg-white/65 p-5 backdrop-blur-2xl backdrop-saturate-150 shadow-xs sm:p-6 lg:flex-row lg:items-center lg:justify-between ">
            {" "}
            {/* Title */}{" "}
            <div className="min-w-0">
              {" "}
              <div className="mb-3 flex items-center gap-2">
                {" "}
                <div className=" grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 ">
                  {" "}
                  <Package className="h-4.5 w-4.5" />{" "}
                </div>{" "}
                <span className=" text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600 ">
                  {" "}
                  Catalog{" "}
                </span>{" "}
              </div>{" "}
              <h1 className=" text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl ">
                {" "}
                Products{" "}
              </h1>{" "}
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {" "}
                Manage your product catalog, visibility, and ecommerce
                availability.{" "}
              </p>{" "}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {" "}
                <div className=" inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 ">
                  {" "}
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{" "}
                  <span className="text-xs font-medium text-slate-600">
                    {" "}
                    {products.length}{" "}
                    {products.length === 1 ? "product" : "products"}{" "}
                  </span>{" "}
                </div>{" "}
                {isEcommerce && (
                  <div className=" inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1.5 ">
                    {" "}
                    <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />{" "}
                    <span className="text-xs font-medium text-blue-700">
                      {" "}
                      Ecommerce{" "}
                    </span>{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
            {/* Actions */}{" "}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {" "}
              <select
                value={family}
                onChange={(event) => handleFamilyChange(event.target.value)}
                aria-label="Filter by Family"
                className="h-10 rounded-xl border border-slate-200/70 bg-white/75 px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
              >
                <option value="">All Families</option>
                {families.map((entry) => (
                  <option key={entry.key} value={entry.key}>{entry.displayName}</option>
                ))}
              </select>
              <select
                value={subFamily}
                onChange={(event) => setSubFamily(event.target.value)}
                aria-label="Filter by Sub Family"
                disabled={!family}
                className="h-10 rounded-xl border border-slate-200/70 bg-white/75 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Sub Families</option>
                {subFamilies.map((entry) => (
                  <option key={entry.key} value={entry.key}>{entry.displayName}</option>
                ))}
              </select>
              {/* Ecommerce filter */}{" "}
              <button
                type="button"
                onClick={() => setIsEcommerce((current) => !current)}
                className={` group inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition ${isEcommerce ? ` border-blue-100 bg-blue-50 text-blue-700 ` : ` border-slate-200/70 bg-white/75 text-slate-600 hover:border-blue-100 hover:bg-blue-50/60 hover:text-blue-700 `} `}
              >
                {" "}
                <span
                  className={` relative h-4 w-7 rounded-full transition ${isEcommerce ? "bg-blue-600" : "bg-slate-300"} `}
                >
                  {" "}
                  <span
                    className={` absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${isEcommerce ? "-translate-x-3" : "translate-x-[0.8px]"} `}
                  />{" "}
                </span>{" "}
                <span>Online store</span>{" "}
              </button>{" "}
              {/* Refresh */}{" "}
              <Button
                variant="outline"
                type="button"
                onClick={loadProducts}
                disabled={loading}
                title="Refresh products"
                aria-label="Refresh products"
                className=" grid h-10 w-10 shrink-0 place-items-center rounded-xl border-slate-200/70 bg-white/75 p-0 text-slate-500 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 "
              >
                {" "}
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />{" "}
              </Button>{" "}
              {/* Add */}{" "}
              <Button
                type="button"
                onClick={() => navigate("create")}
                disabled={!canManage}
                title={
                  !canManage ? "You do not have permission" : "Add Product"
                }
                className=" inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40 "
              >
                {" "}
                <Plus className="h-4 w-4" /> <span>Add product</span>{" "}
              </Button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* ------------------------------------------------- CONTENT ------------------------------------------------- */}{" "}
        {loading ? (
          <div className=" grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {" "}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className=" h-[280px] animate-pulse rounded-2xl border border-slate-200/50 bg-white "
              />
            ))}{" "}
          </div>
        ) : products.length > 0 ? (
          <div className=" grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {" "}
            {products.map((product) => (
              <div
                key={product.serialNumber}
                className=" min-w-0 transition-opacity duration-200 "
              >
                {" "}
                <ProductCard
                  product={product}
                  onDelete={() => handleDelete(product.serialNumber)}
                  onToggleActive={handleToggleActive}
                  canManage={canManage}
                />{" "}
              </div>
            ))}{" "}
          </div>
        ) : (
          <div className=" rounded-3xl border border-white/70 bg-white/65 p-6 backdrop-blur-xl shadow-xs ">
            {" "}
            <ProductNotFound />{" "}
          </div>
        )}{" "}
      </div>{" "}
    </section>
  );
}
