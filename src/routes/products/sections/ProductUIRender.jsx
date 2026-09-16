import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion as Motion,
  useReducedMotion,
} from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  GitCompareArrows,
  Heart,
  ImageOff,
  Info,
  Maximize2,
  Share2,
  X,
} from "lucide-react";

import "swiper/css";
import "swiper/css/thumbs";

import { CtaButton } from "@/components";
import { CONTACTSALES, PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";

import RequestQuoteModal from "@/components/products/RequestQuoteModal";
import WhatsAppButton from "@/components/shared_uis/WhatsAppButton";

import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { useTranslation } from "@/lib/i18n";

import { formatPrice } from "@/lib/utils";
import { deriveSubFamily } from "@/utils/catalogFamilies";
import {
  REDUCED_MOTION_TRANSITION,
  SCRIM_VARIANTS,
  SPRING_DEFAULT,
  SPRING_SNAPPY,
} from "@/lib/springs";

import { toast } from "sonner";
import {
  getAttributionContext,
  trackCustomEvent,
} from "@/services/analytics/analytics";

const BLUE = "#007AFF";

function GlassButton({
  children,
  active = false,
  danger = false,
  title,
  onClick,
  className = "",
}) {
  return (
    <Motion.button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className={[
        "inline-flex h-11 w-11 shrink-0 items-center justify-center",
        "rounded-full border",
        "backdrop-blur-2xl backdrop-saturate-150",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        active
          ? "border-blue-400/70 bg-blue-500 text-white"
          : danger
            ? "border-red-200/70 bg-white/60 text-red-500 hover:bg-red-50"
            : "border-white/70 bg-white/55 text-slate-700 hover:bg-white/80 hover:text-blue-600",
        className,
      ].join(" ")}
    >
      {children}
    </Motion.button>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500">
          {eyebrow}
        </div>
      )}

      <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>

      {description && (
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function ProductUIRender({ product }) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  const snappySpring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_SNAPPY;

  const images = Array.isArray(product?.gallery) ? product.gallery : [];

  const favorited = isFavorite(product?.serialNumber);
  const inCompare = isInCompare(product?.serialNumber);

  const keyDetails = useMemo(
    () =>
      [
        {
          label: t("products.material"),
          value: product?.material,
        },
        {
          label: t("products.dimensions"),
          value: product?.dimensions,
        },
        {
          label: t("products.installation"),
          value: product?.installation,
        },
        {
          label: t("products.finishes"),
          value: product?.finishes?.length ? product.finishes.join(", ") : null,
        },
      ].filter((item) => item.value),
    [product, t],
  );

  const showPrev = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || images.length === 0) return current;
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || images.length === 0) return current;
      return (current + 1) % images.length;
    });
  }, [images.length]);

  const handleCompareClick = () => {
    const success = toggleCompare(product?.serialNumber);

    if (!success) {
      toast.error(t("products.compare_full"));
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url,
        });
      } catch {
        // User cancelled.
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("products.link_copied"));
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      }

      if (event.key === "ArrowLeft") {
        showPrev();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, showNext, showPrev]);

  return (
    <section className="relative overflow-hidden">
      {/* ---------------------------------------------------------
          Background atmosphere
      --------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
      >
        <div className="absolute left-[8%] top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute right-[8%] top-28 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pt-8">
        {/* ---------------------------------------------------------
            Floating top navigation
        --------------------------------------------------------- */}
        <div className="sticky top-4 z-40 mb-7">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/60 px-2 py-2 backdrop-blur-2xl backdrop-saturate-150">
            <Link
              to="/products"
              className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              <span className="hidden sm:inline">{t("products.title")}</span>
              <span className="sm:hidden">Retour</span>
            </Link>

            <div className="hidden min-w-0 items-center gap-2 px-3 text-xs text-slate-500 md:flex">
              <span>{t("products.breadcrumb_home")}</span>
              <ChevronRight size={13} />
              <span>{t("products.title")}</span>

              {product?.family && (
                <>
                  <ChevronRight size={13} />
                  <span className="truncate">{product.family}</span>
                </>
              )}

              <ChevronRight size={13} />

              <span className="max-w-[220px] truncate font-semibold text-slate-800">
                {product?.name}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <GlassButton
                title={
                  favorited
                    ? t("products.remove_from_favorites")
                    : t("products.add_to_favorites")
                }
                active={favorited}
                onClick={() => toggleFavorite(product?.serialNumber)}
              >
                <Motion.span
                  animate={favorited ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={spring}
                >
                  <Heart
                    size={18}
                    className={favorited ? "fill-current" : ""}
                  />
                </Motion.span>
              </GlassButton>

              <GlassButton
                title={
                  inCompare
                    ? t("products.remove_from_compare")
                    : t("products.add_to_compare")
                }
                active={inCompare}
                onClick={handleCompareClick}
              >
                <GitCompareArrows size={18} />
              </GlassButton>

              <GlassButton title={t("products.share")} onClick={handleShare}>
                <Share2 size={18} />
              </GlassButton>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------
            Main product area
        --------------------------------------------------------- */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-12">
          {/* =====================================================
              Gallery
          ===================================================== */}
          <div className="min-w-0">
            {images.length > 0 ? (
              <>
                <div className="relative overflow-hidden rounded-[30px] bg-white">
                  <Swiper
                    modules={[Thumbs]}
                    thumbs={{
                      swiper:
                        thumbsSwiper && !thumbsSwiper.destroyed
                          ? thumbsSwiper
                          : null,
                    }}
                    className="product-gallery-swiper"
                  >
                    {images.map((image, index) => (
                      <SwiperSlide key={`${image}-${index}`}>
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(index)}
                          className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[30px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <img
                            src={image}
                            alt={`${product?.name || "Product"} ${index + 1}`}
                            className="aspect-[1.08/1] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                          />

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/30 via-black/0 to-transparent p-5">
                            <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
                              {index + 1} / {images.length}
                            </span>

                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-xl">
                              <Maximize2 size={15} />
                            </span>
                          </div>
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {images.length > 1 && (
                  <div className="mt-3">
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={Math.min(images.length, 6)}
                      watchSlidesProgress
                      breakpoints={{
                        640: {
                          slidesPerView: Math.min(images.length, 6),
                        },
                        1024: {
                          slidesPerView: Math.min(images.length, 7),
                        },
                      }}
                      className="product-thumbs-swiper"
                    >
                      {images.map((image, index) => (
                        <SwiperSlide key={`thumb-${image}-${index}`}>
                          <button
                            type="button"
                            className="block w-full overflow-hidden rounded-2xl border border-transparent opacity-65 transition-all duration-200 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&.swiper-slide-thumb-active]:border-blue-500 [&.swiper-slide-thumb-active]:opacity-100"
                          >
                            <img
                              src={image}
                              alt=""
                              className="aspect-square w-full object-cover"
                            />
                          </button>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[30px] bg-white px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <ImageOff size={28} />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                  {t("products.no_image")}
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Les images de ce produit ne sont actuellement pas disponibles.
                </p>
              </div>
            )}
          </div>

          {/* =====================================================
              Product information
          ===================================================== */}
          <Motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="flex min-w-0 flex-col"
          >
            <div className="pt-2 lg:pt-5">
              {/* Derived catalog placement */}
              {product?.family && (
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                  <span>{product.family}</span>
                  {deriveSubFamily(product.productId).length === 2 && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">
                        {deriveSubFamily(product.productId)}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[46px] lg:leading-[1.03]">
                {product?.name}
              </h1>

              {/* Serial */}
              {product?.serialNumber && (
                <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-[11px] font-medium tracking-wide text-slate-500">
                  SN {product.serialNumber}
                </div>
              )}

              {/* Description */}
              {product?.shortDescription && (
                <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-600">
                  {product.shortDescription}
                </p>
              )}

              {/* Tags */}
              {product?.tags?.filter(Boolean)?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.tags.filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Primary actions */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CtaButton
                  className="min-h-14 w-full rounded-full bg-blue-600 px-6 text-white shadow-xs transition-colors hover:bg-blue-700"
                  label="Contacter les ventes"
                  icon={<ChevronRight size={18} />}
                  href={`${CONTACTSALES}?product=${encodeURIComponent(product.serialNumber)}`}
                  onClick={() =>
                    trackCustomEvent("product_inquiry_started", {
                      product_id: product._id,
                      product_serial: product.serialNumber,
                      page: window.location.pathname,
                      source: getAttributionContext().source || undefined,
                    })
                  }
                />

                <Motion.button
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setQuoteModalOpen(true)}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-6 text-sm font-semibold text-blue-600 shadow-xs transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <FileText size={18} />
                  Demander un devis
                </Motion.button>
              </div>
            </div>

            {/* =================================================
                Product highlights
            ================================================= */}
            {keyDetails.length > 0 && (
              <div className="mt-9">
                <div className="mb-4 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Informations produit
                  </h2>
                </div>

                <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  {keyDetails.map((detail) => (
                    <div
                      key={detail.label}
                      className="grid grid-cols-[130px_1fr] gap-5 px-5 py-4"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {detail.label}
                      </span>

                      <span className="text-sm font-semibold leading-6 text-slate-800">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                Specifications
            ================================================= */}
            {product?.specifications?.length > 0 && (
              <div className="mt-8">
                <SectionTitle
                  title={t("products.specifications")}
                  description="Détails techniques et caractéristiques du produit."
                />

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <div className="divide-y divide-slate-100">
                    {product.specifications.map((spec, index) => (
                      <div
                        key={`${spec.label}-${index}`}
                        className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[1fr_1.2fr] sm:gap-6"
                      >
                        <span className="text-sm text-slate-500">
                          {spec.label}
                        </span>

                        <span className="text-sm font-semibold text-slate-900 sm:text-right">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                Documents
            ================================================= */}
            {product?.documents?.length > 0 && (
              <div className="mt-8">
                <SectionTitle
                  title={t("products.downloads")}
                  description="Catalogues, fiches techniques et documents associés."
                />

                <div className="space-y-2">
                  {product.documents.map((document, index) => (
                    <Motion.a
                      key={`${document.url}-${index}`}
                      whileTap={{ scale: 0.985 }}
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Download size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {document.title}
                        </span>

                        <span className="mt-0.5 block text-xs text-slate-400">
                          Document
                        </span>
                      </span>

                      <ExternalLink
                        size={16}
                        className="shrink-0 text-slate-300 transition-colors group-hover:text-blue-500"
                      />
                    </Motion.a>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                Technical meta
            ================================================= */}
            <div className="mt-8 border-t border-slate-200 pt-5">
              <div className="grid gap-1.5 font-mono text-[11px] leading-5 text-slate-400">
                {product?.productId && (
                  <p>
                    <span className="text-slate-500">Product ID:</span>{" "}
                    {product.productId}
                  </p>
                )}

                {product?.serialNumber && (
                  <p>
                    <span className="text-slate-500">Serial:</span>{" "}
                    {product.serialNumber}
                  </p>
                )}

                {deriveSubFamily(product?.productId).length === 2 && (
                  <p>
                    <span className="text-slate-500">Sub Family:</span>{" "}
                    {deriveSubFamily(product.productId)}
                  </p>
                )}
              </div>
            </div>
          </Motion.div>
        </div>

        {/* =========================================================
            Related Products
        ========================================================= */}
        {product?.relatedProducts?.length > 0 && (
          <Motion.section
            initial={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : 20,
            }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={spring}
            className="mx-auto mt-24 max-w-7xl"
          >
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500">
                  Découvrez plus
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {t("products.related_products")}
                </h2>
              </div>

              <Link
                to="/products"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 sm:inline-flex"
              >
                Voir tous les produits →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {product.relatedProducts.map((relatedProduct, index) => (
                <Motion.div
                  key={relatedProduct._id || relatedProduct.productId || index}
                  initial={{
                    opacity: 0,
                    y: prefersReducedMotion ? 0 : 12,
                  }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    ...spring,
                    delay: prefersReducedMotion ? 0 : index * 0.035,
                  }}
                >
                  <Link
                    to={PRODUCTVIEWDETAIL.replace(
                      ":serialNumber",
                      relatedProduct.slug || relatedProduct.productId,
                    )}
                    className="group block overflow-hidden rounded-[24px] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {relatedProduct.gallery?.[0] ? (
                        <img
                          src={relatedProduct.gallery[0]}
                          alt={relatedProduct.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <ImageOff size={24} />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-600">
                        {relatedProduct.name}
                      </h3>

                      {relatedProduct.prices?.productPrice > 0 && (
                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {formatPrice(relatedProduct.prices.productPrice)} DA
                        </p>
                      )}
                    </div>
                  </Link>
                </Motion.div>
              ))}
            </div>
          </Motion.section>
        )}

        {/* =========================================================
            Floating WhatsApp
        ========================================================= */}
        <WhatsAppButton
          message={`Bonjour, je suis intéressé par ce produit: ${product?.name} (${product?.serialNumber})`}
        />
      </div>

      {/* ===========================================================
          Quote Modal
      =========================================================== */}
      <AnimatePresence>
        {quoteModalOpen && (
          <RequestQuoteModal
            product={product}
            onClose={() => setQuoteModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ===========================================================
          Liquid Glass Lightbox
      =========================================================== */}
      <AnimatePresence>
        {lightboxIndex !== null && images.length > 0 && (
          <Motion.div
            variants={SCRIM_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={snappySpring}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top glass control */}
            <div
              className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 backdrop-blur-2xl backdrop-saturate-150"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="px-3 text-xs font-medium text-white/80">
                {lightboxIndex + 1} / {images.length}
              </span>

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Previous */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-2xl transition-colors hover:bg-white/20 sm:left-7"
                aria-label="Image précédente"
              >
                <ChevronLeft size={23} />
              </button>
            )}

            {/* Image */}
            <Motion.img
              key={lightboxIndex}
              initial={{
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={snappySpring}
              drag={prefersReducedMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80 || info.velocity.x < -400) {
                  showNext();
                } else if (info.offset.x > 80 || info.velocity.x > 400) {
                  showPrev();
                }
              }}
              src={images[lightboxIndex]}
              alt={product?.name || "Product"}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[88vh] max-w-[92vw] touch-none select-none rounded-2xl object-contain"
            />

            {/* Next */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-2xl transition-colors hover:bg-white/20 sm:right-7"
                aria-label="Image suivante"
              >
                <ChevronRight size={23} />
              </button>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default ProductUIRender;
