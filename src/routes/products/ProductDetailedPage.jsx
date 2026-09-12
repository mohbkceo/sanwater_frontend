import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import { getProduct } from "@/services/products/productServices";
import ProductUIRender from "./sections/ProductUIRender";
import ProductNotFound from "@/components/products/ProductNotFound";
import LoadingPage from "@/components/shared_uis/LoadingPage";
import { PRODUCTS } from "@/configs/routes/routesConfig";
import { useTranslation } from "@/lib/i18n";
import { trackCustomEvent } from "@/services/analytics/analytics";

function ProductDetailedPage() {
  const { serialNumber } = useParams();
  const { t } = useTranslation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProduct() {
      setLoading(true);
      setProduct(null);

      try {
        const response = await getProduct(serialNumber);

        if (mounted) {
          const resolvedProduct = response?.data ?? null;
          setProduct(resolvedProduct);
          if (resolvedProduct) trackCustomEvent("product_view", { product_id: resolvedProduct._id, product_serial: resolvedProduct.serialNumber, page: window.location.pathname });
        }
      } catch {
        if (mounted) {
          setProduct(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [serialNumber]);

  if (loading) {
    return (
      <MainLayout bg="bg-[#F5F7FA]">
        <LoadingPage />
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout bg="bg-[#F5F7FA]">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-5 py-16 sm:px-6">
          <ProductNotFound
            mainTitle={t("products.no_products_found_title")}
            description={t("products.no_products_found_description")}
          />

          <Link
            to={PRODUCTS}
            className="mx-auto mt-8 inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            ← {t("products.title")}
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout bg="bg-[#F5F7FA]">
      <ProductUIRender product={product} />
    </MainLayout>
  );
}

export default ProductDetailedPage;
