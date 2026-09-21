import React, { useEffect, useState } from "react";
import { X, GitCompareArrows } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Header, Button } from "@/components";
import ProductNotFound from "@/components/products/ProductNotFound";
import { useCompare } from "@/hooks/useCompare";
import { getProduct } from "@/services/products/productServices";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { PRODUCTS, PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { SPRING_DEFAULT } from "@/lib/springs";

export default function ComparePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const results = await Promise.all(
        compareList.map(async (serialNumber) => {
          try {
            const res = await getProduct(serialNumber);
            return res?.data || null;
          } catch {
            removeFromCompare(serialNumber);
            return null;
          }
        }),
      );
      if (!cancelled) {
        setProducts(results.filter(Boolean));
        setLoading(false);
      }
    }

    if (compareList.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareList.length]);

  // Union of every distinct spec label across the compared products, so
  // each row is real data from at least one product — never fabricated.
  const specLabels = Array.from(
    new Set(
      products.flatMap((p) => (p.specifications || []).map((s) => s.label)),
    ),
  );

  const rows = [
    {
      key: "price",
      label: t("products.price"),
      render: (p) =>
        p.prices?.productPrice > 0
          ? `${formatPrice(p.prices.productPrice)} DA`
          : "—",
    },
    {
      key: "family",
      label: t("products.family"),
      render: (p) => p.family?.name || "—",
    },
    {
      key: "subFamily",
      label: t("products.sub_family"),
      render: (p) => p.subFamily?.name || "—",
    },
    {
      key: "material",
      label: t("products.material"),
      render: (p) => p.material || "—",
    },
    {
      key: "dimensions",
      label: t("products.dimensions"),
      render: (p) => p.dimensions || "—",
    },
    {
      key: "installation",
      label: t("products.installation"),
      render: (p) => p.installation || "—",
    },
    {
      key: "finishes",
      label: t("products.finishes"),
      render: (p) => (p.finishes?.length ? p.finishes.join(", ") : "—"),
    },
    ...specLabels.map((label) => ({
      key: `spec_${label}`,
      label,
      render: (p) =>
        p.specifications?.find((s) => s.label === label)?.value || "—",
    })),
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <Header title={t("compare_page.title")} discription="" />
          {products.length > 0 && (
            <Button
              variant="secondary"
              onClick={clearCompare}
              className="border border-white/20 bg-white/20 hover:bg-white/30"
            >
              {t("compare_page.clear_all")}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-3xl bg-white/40" />
        ) : products.length === 0 ? (
          <>
            <ProductNotFound
              className="bg-white/40"
              mainTitle={t("compare_page.empty_title")}
              description={t("compare_page.empty_description")}
            />
            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate(PRODUCTS)}>
                <GitCompareArrows size={16} className="mr-2" />{" "}
                {t("compare_page.browse_products")}
              </Button>
            </div>
          </>
        ) : (
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_DEFAULT}
            className="overflow-x-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md"
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white/60 backdrop-blur-md p-4 text-left font-bold min-w-[140px]">
                    {t("compare_page.attribute")}
                  </th>
                  <AnimatePresence mode="popLayout">
                    {products.map((p) => (
                      <Motion.th
                        key={p._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={SPRING_DEFAULT}
                        className="p-4 min-w-[220px] align-top"
                      >
                        <Motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => removeFromCompare(p.serialNumber)}
                          className="mb-2 ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-gray-500 hover:text-rose-600"
                          title={t("products.remove_from_compare")}
                        >
                          <X size={14} />
                        </Motion.button>
                        {p.gallery?.[0] && (
                          <img
                            src={p.gallery[0]}
                            alt={p.name}
                            className="w-full h-32 object-cover rounded-xl mb-2"
                          />
                        )}
                        <div
                          className="font-bold text-gray-900 cursor-pointer hover:text-[#0050A4]"
                          onClick={() =>
                            navigate(
                              PRODUCTVIEWDETAIL.replace(
                                ":serialNumber",
                                p.serialNumber,
                              ),
                            )
                          }
                        >
                          {p.name}
                        </div>
                      </Motion.th>
                    ))}
                  </AnimatePresence>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={row.key}
                    className={idx % 2 === 0 ? "bg-white/10" : ""}
                  >
                    <td className="sticky left-0 z-10 bg-white/60 backdrop-blur-md p-4 font-medium text-gray-700">
                      {row.label}
                    </td>
                    {products.map((p) => (
                      <td key={p._id} className="p-4 text-gray-800">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Motion.div>
        )}
      </div>
    </MainLayout>
  );
}
