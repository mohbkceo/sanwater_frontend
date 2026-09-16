import React, { useEffect, useState } from "react";

import { ArrowRight, ImageOff } from "lucide-react";

import { Link } from "react-router-dom";

import { motion, useReducedMotion } from "framer-motion";

import { productAPI } from "@/services/baseAPIs";

import { useTranslation } from "@/lib/i18n.jsx";

import { PRODUCTS, PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";


import { REDUCED_MOTION_TRANSITION, SPRING_DEFAULT } from "@/lib/springs";

function ProductCard({ product, index, t }) {
  const prefersReducedMotion = useReducedMotion();

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  const image = product.gallery?.[0];

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-60px",
      }}
      transition={{
        ...spring,
        delay: prefersReducedMotion ? 0 : (index % 3) * 0.05,
      }}
      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white transition-colors duration-300 hover:border-blue-200"
    >
      {/* Image */}
      <Link
        to={PRODUCTVIEWDETAIL.replace(
          ":serialNumber",
          product.slug || product.serialNumber,
        )}
        className="block"
      >
        <div className="relative aspect-[1.05/1] overflow-hidden bg-slate-100">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={27} />

              <span className="text-xs">{t("products.no_image")}</span>
            </div>
          )}

          {/* Family */}
          {product.family && (
            <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 backdrop-blur-2xl backdrop-saturate-150 shadow-xs">
              {product.family}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-[-0.025em] text-slate-950 transition-colors group-hover:text-blue-600">
              {product.name}
            </h3>

            <ArrowRight
              size={18}
              className="mt-1 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-500"
            />
          </div>

          <p className="mt-3 font-mono text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {t("products.serial")} {product.serialNumber}
          </p>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <span className="text-sm font-semibold text-slate-600 transition-colors group-hover:text-blue-600">
              {t("products.view_details")}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function DynamicProductSection() {
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      try {
        const response = await productAPI.get("/");

        if (!mounted) return;

        setProducts(response?.data?.data?.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
              >
                <div className="aspect-square animate-pulse bg-slate-100" />

                <div className="space-y-3 p-6">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-blue-50" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section id="products" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                San Water Collection
              </div>

              <h2 className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                {t("products.title")}
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
                {t("products.description")}
              </p>
            </div>

            <Link
              to={PRODUCTS}
              className="group inline-flex items-center gap-2 self-start rounded-full px-1 py-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 sm:self-auto"
            >
              {t("products.view_details")}

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Product grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                t={t}
              />
            ))}
          </div>

          {/* Bottom action */}
          <div className="mt-10 flex justify-center">
            <Link
              to={PRODUCTS}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-blue-200 bg-white px-6 text-sm font-semibold text-blue-600 shadow-xs transition-colors hover:bg-blue-50"
            >
              {t("products.view_details")}

              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DynamicProductSection;
