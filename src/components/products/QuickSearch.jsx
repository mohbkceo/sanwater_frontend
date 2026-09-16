import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ImageOff } from "lucide-react";
import { getProducts } from "@/services/products/productServices";
import { PRODUCTS, PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { MATERIALIZE_VARIANTS, SCRIM_VARIANTS, SPRING_SNAPPY, REDUCED_MOTION_TRANSITION } from "@/lib/springs";

// Navbar quick-search: debounced, top few results as suggestions, with a
// link to the full filtered listing for everything else. Products only
// (broader site-wide content search is outside this component).
export default function QuickSearch({ onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const spring = prefersReducedMotion ? REDUCED_MOTION_TRANSITION : SPRING_SNAPPY;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getProducts({ search: query.trim(), max: 6 });
        setResults(res?.data?.products || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const goToFullResults = () => {
    if (!query.trim()) return;
    navigate(`${PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <Motion.div
      variants={SCRIM_VARIANTS}
      initial="initial" animate="animate" exit="exit"
      transition={spring}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-24"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <Motion.div
        variants={MATERIALIZE_VARIANTS}
        initial="initial" animate="animate" exit="exit"
        transition={spring}
        className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goToFullResults()}
            placeholder={t("nav.search_placeholder")}
            className="flex-1 outline-none text-sm"
          />
          <Motion.button whileTap={{ scale: 0.85 }} onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 shrink-0">
            <X size={20} />
          </Motion.button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-sm text-gray-400">…</div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">{t("products.no_products_found_title")}</div>
          )}

          {results.map((product) => (
            <Motion.button
              key={product._id}
              whileTap={{ scale: 0.98, backgroundColor: "rgba(0,0,0,0.03)" }}
              onClick={() => {
                navigate(PRODUCTVIEWDETAIL.replace(":serialNumber", product.serialNumber));
                onClose();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
            >
              <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                {product.gallery?.[0] ? (
                  <img src={product.gallery[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageOff size={16} className="text-gray-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
                <div className="text-xs text-gray-500 truncate">{product.family}</div>
              </div>
              {product.prices?.productPrice > 0 && (
                <div className="text-sm font-bold text-[#0050A4] shrink-0">{formatPrice(product.prices.productPrice)} DA</div>
              )}
            </Motion.button>
          ))}

          {results.length > 0 && (
            <Motion.button
              whileTap={{ scale: 0.98 }}
              onClick={goToFullResults}
              className="w-full px-4 py-3 text-sm font-semibold text-[#0050A4] hover:bg-gray-50 text-center"
            >
              {t("products.view_details")} →
            </Motion.button>
          )}
        </div>
      </Motion.div>
    </Motion.div>
  );
}
