import React, { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import useProducts from "@/services/products/useProducts";
import ProductCard from "./sections/ProductItem";
import { Button, Header } from "@/components";
import ProductNotFound from "@/components/products/ProductNotFound";

const Title = "SanWater Produits";

export default function ProductViewList() {
  const {
  products,
  refetch,
  loading,
  hasMore,
  nextLastId,
} = useProducts();

    const handleLoadMore = async () => {
      if (!nextLastId || loading) return;

      await refetch(
        {
          ...queryParams,
          lastId: nextLastId,
        },
        true
      );
    };

  const [filters, setFilters] = useState({
    search: "",
    family: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

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
    refetch(queryParams, false);
  }, [queryParams]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      family: "",
      minPrice: "",
      maxPrice: "",
      inStock: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Header
          title={Title}
          discription={"Découvrez notre collection complète de produits SanWater."}
        />

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-md">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, famille ou ID produit..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 pl-11 outline-none transition focus:border-white/30"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 opacity-70" />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="border border-white/20 bg-white/20 hover:bg-white/30"
                onClick={() => setShowAdvanced((s) => !s)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtres avancés
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="border border-white/20 bg-white/20 hover:bg-white/30"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium opacity-80">
                  Famille
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bottle, Filter..."
                  value={filters.family}
                  onChange={(e) => updateFilter("family", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium opacity-80">
                  Prix minimum
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium opacity-80">
                  Prix maximum
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium opacity-80">
                  Disponibilité
                </label>
                <select
                  value={filters.inStock}
                  onChange={(e) => updateFilter("inStock", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
                >
                  <option value="">Tous</option>
                  <option value="true">En stock</option>
                  <option value="false">Rupture de stock</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium opacity-80">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter("sortBy", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
                >
                  <option value="createdAt">Date</option>
                  <option value="price">Prix</option>
                  <option value="name">Nom</option>
                  <option value="_id">ID</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium opacity-80">
                  Ordre
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => updateFilter("sortOrder", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/20 px-4 py-3 outline-none focus:border-white/30"
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div
          className={`mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 ${
            loading ? "opacity-40" : ""
          }`}
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {!loading && products.length === 0 && (
          <ProductNotFound
            className="bg-white/20"
            description="Les produits que vous recherchez sont introuvables."
            mainTitle="Aucun produit trouvé"
          />
        )}

        <div className="mt-12 w-full">
  <Button
    variant="secondary"
    disabled={!hasMore || loading}
    onClick={handleLoadMore}
    className={`
      w-full border border-white/20
      bg-white/20 text-black
      hover:bg-white/30
      disabled:opacity-40
      disabled:cursor-not-allowed
    `}
  >
    {loading
      ? "Chargement..."
      : hasMore
      ? "Charger plus"
      : "Aucun autre produit"}
  </Button>
</div>
      </div>
    </MainLayout>
  );
}