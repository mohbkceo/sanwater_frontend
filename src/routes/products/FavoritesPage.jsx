import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Header, Button } from "@/components";
import ProductCard from "./sections/ProductItem";
import ProductNotFound from "@/components/products/ProductNotFound";
import { useFavorites } from "@/hooks/useFavorites";
import { getProduct } from "@/services/products/productServices";
import { useTranslation } from "@/lib/i18n";
import { PRODUCTS } from "@/configs/routes/routesConfig";
import { useNavigate } from "react-router-dom";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hadUnavailable, setHadUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const results = await Promise.all(
        favorites.map(async (serialNumber) => {
          try {
            const res = await getProduct(serialNumber);
            return res?.data || null;
          } catch {
            // Product was deleted/archived since being favorited — drop it
            // from the saved list instead of showing a broken entry.
            removeFavorite(serialNumber);
            return null;
          }
        })
      );

      if (cancelled) return;
      const found = results.filter(Boolean);
      setHadUnavailable(found.length < favorites.length);
      setProducts(found);
      setLoading(false);
    }

    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites.length]);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Header title={t("favorites_page.title")} discription="" />

        {hadUnavailable && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t("favorites_page.unavailable_notice")}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl bg-white/40" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <ProductNotFound
            className="bg-white/40"
            mainTitle={t("favorites_page.empty_title")}
            description={t("favorites_page.empty_description")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate(PRODUCTS)}>
              <Heart size={16} className="mr-2" /> {t("favorites_page.browse_products")}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
