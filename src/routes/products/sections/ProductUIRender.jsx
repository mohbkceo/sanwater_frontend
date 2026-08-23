import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/thumbs";
import { CtaButton } from "@/components";
import { CONTACTSALES, PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";
import {
  ChevronRight,
  FileText,
  Heart,
  GitCompareArrows,
  Share2,
  Download,
  ImageOff,
  X,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import RequestQuoteModal from "@/components/products/RequestQuoteModal";
import WhatsAppButton from "@/components/shared_uis/WhatsAppButton";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function ProductUIRender({ product }) {
  const { t } = useTranslation();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();

  const images = product?.gallery?.length ? product.gallery : [];
  const favorited = isFavorite(product?.serialNumber);
  const inCompare = isInCompare(product?.serialNumber);

  const keyDetails = [
    { label: t("products.material"), value: product?.material },
    { label: t("products.dimensions"), value: product?.dimensions },
    { label: t("products.installation"), value: product?.installation },
    { label: t("products.finishes"), value: product?.finishes?.length ? product.finishes.join(", ") : null },
  ].filter((d) => d.value);

  const handleCompareClick = () => {
    const ok = toggleCompare(product?.serialNumber);
    if (!ok) toast.error(t("products.compare_full"));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, url }); } catch { /* user cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("products.link_copied"));
    } catch { /* clipboard unavailable */ }
  };

  return (
    <section className="py-16">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto mb-6 text-sm text-gray-600 flex items-center gap-2 flex-wrap" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#0050A4]">{t("products.breadcrumb_home")}</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-[#0050A4]">{t("products.title")}</Link>
        {product?.category?.name && (
          <>
            <ChevronRight size={14} />
            <span>{product.category.name}</span>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product?.name}</span>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          {images.length > 0 ? (
            <>
              <Swiper
                modules={[Thumbs]}
                thumbs={{ swiper: thumbsSwiper }}
                className="mb-4 shadow-sm rounded-2xl"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="block w-full cursor-zoom-in"
                    >
                      <img
                        src={img}
                        alt={`${product?.name || "product"} ${i + 1}`}
                        className="w-full border-2 border-blue-300/20 rounded-2xl object-cover"
                      />
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>

              {images.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  className="w-18"
                  slidesPerView={Math.min(images.length, 5)}
                >
                  {images.map((img, i) => (
                    <SwiperSlide className="w-5" key={i}>
                      <img
                        src={img}
                        alt="thumb"
                        className="cursor-pointer w-full rounded-xl border-2 border-blue-200/40 hover:border-blue-500 transition"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-80 rounded-2xl bg-gray-100 text-gray-400 border-2 border-blue-300/20">
              <ImageOff size={40} />
              <span>{t("products.no_image")}</span>
            </div>
          )}
        </div>

        <div className="flex bg-gray-300/80 rounded-3xl p-4 items-center">
          <div className="w-full space-y-5">
            <div className="flex justify-between gap-5 items-start">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold font-mainFont text-[#1F2933]">
                  {product?.name}
                </h1>
                <p className="text-[#1D4ED8] font-mono text-sm mt-1">{product?.family}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFavorite(product?.serialNumber)}
                  title={favorited ? t("products.remove_from_favorites") : t("products.add_to_favorites")}
                  className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition ${
                    favorited ? "bg-rose-500 text-white" : "bg-white/80 text-gray-600 hover:text-rose-500"
                  }`}
                >
                  <Heart size={18} className={favorited ? "fill-current" : ""} />
                </button>
                <button
                  type="button"
                  onClick={handleCompareClick}
                  title={inCompare ? t("products.remove_from_compare") : t("products.add_to_compare")}
                  className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition ${
                    inCompare ? "bg-[#0050A4] text-white" : "bg-white/80 text-gray-600 hover:text-[#0050A4]"
                  }`}
                >
                  <GitCompareArrows size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  title={t("products.share")}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-sm hover:text-[#0050A4] transition"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {product?.prices?.productPrice > 0 && (
              <div className="text-3xl font-mainFont font-extrabold text-[#0050A4]">
                {formatPrice(product.prices.productPrice)} DA
              </div>
            )}

            {product?.shortDescription && (
              <p className="text-[#1F2933]/80 leading-relaxed">{product.shortDescription}</p>
            )}

            {keyDetails.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {keyDetails.map((d) => (
                  <div key={d.label} className="rounded-xl bg-white/50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500">{d.label}</div>
                    <div className="text-sm font-semibold text-[#1F2933]">{d.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {product?.tags?.filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm text-gray-900 font-mainFont bg-blue-500/10 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3">
              <CtaButton className="w-full" label="Contactez ventes pour ce produit" icon={<ChevronRight size={18} />} href={CONTACTSALES} />
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1D4ED8] bg-white px-5 py-3 text-sm font-semibold text-[#1D4ED8] hover:bg-[#1D4ED8]/5 transition"
              >
                <FileText size={18} />
                Demander un devis
              </button>
            </div>

            {quoteModalOpen && (
              <RequestQuoteModal product={product} onClose={() => setQuoteModalOpen(false)} />
            )}

            {product?.specifications?.length > 0 && (
              <div className="pt-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#1F2933] mb-2">
                  {t("products.specifications")}
                </h2>
                <div className="rounded-xl bg-white/50 divide-y divide-gray-200/60 overflow-hidden">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                      <span className="text-gray-600">{spec.label}</span>
                      <span className="font-medium text-[#1F2933] text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product?.documents?.length > 0 && (
              <div className="pt-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#1F2933] mb-2">
                  {t("products.downloads")}
                </h2>
                <div className="flex flex-col gap-2">
                  {product.documents.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-white/50 px-4 py-3 text-sm font-medium text-[#1F2933] hover:bg-white/80 transition"
                    >
                      <Download size={16} className="text-[#0050A4] shrink-0" />
                      <span className="flex-1 truncate">{doc.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm font-mono text-[#1D4ED8] space-y-1 pt-2">
              <p><strong>Product ID:</strong> {product?.productId}</p>
              <p><strong>Serial:</strong> {product?.serialNumber}</p>
              {product?.collectionRef?.name && <p><strong>{t("products.collection")}:</strong> {product.collectionRef.name}</p>}
            </div>
          </div>
        </div>
      </div>

      {product?.relatedProducts?.length > 0 && (
        <div className="max-w-7xl mx-auto mt-16">
          <h2 className="text-2xl font-bold font-mainFont text-[#1F2933] mb-6">
            {t("products.related_products")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rp) => (
              <Link
                key={rp._id}
                to={PRODUCTVIEWDETAIL.replace(":serialNumber", rp.slug || rp.productId)}
                className="group rounded-2xl overflow-hidden bg-white/60 border border-gray-200/60 hover:shadow-md transition"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {rp.gallery?.[0] ? (
                    <img src={rp.gallery[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300"><ImageOff size={24} /></div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-[#1F2933] truncate">{rp.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <WhatsAppButton message={`Bonjour, je suis intéressé par ce produit: ${product?.name} (${product?.serialNumber})`} />

      {lightboxIndex !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
              className="absolute left-4 text-white/80 hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeftIcon size={32} />
            </button>
          )}
          <img
            src={images[lightboxIndex]}
            alt={product?.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full object-contain rounded-lg"
          />
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
              className="absolute right-4 text-white/80 hover:text-white"
              aria-label="Next"
            >
              <ChevronRightIcon size={32} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default ProductUIRender;
