import {
  ChevronRight,
  GitCompareArrows,
  Heart,
  ImageOff,
  Package,
  TableCellsSplit,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components";

import { PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";

import { cn } from "@/lib/utils";

import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";

import { useTranslation } from "@/lib/i18n";

import { toast } from "sonner";

import { REDUCED_MOTION_TRANSITION, SPRING_DEFAULT } from "@/lib/springs";

function GlassAction({ active, onClick, title, children }) {
  return (
    <motion.button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={SPRING_DEFAULT}
      className={cn(
        [
          "flex h-10 w-10 items-center justify-center rounded-full",
          "border border-white/70",
          "backdrop-blur-2xl backdrop-saturate-150",
          "transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        ],
        active
          ? "bg-blue-600 text-white"
          : "bg-white/75 text-slate-700 hover:bg-white hover:text-blue-600",
      )}
    >
      {children}
    </motion.button>
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { isFavorite, toggleFavorite } = useFavorites();

  const { isInCompare, toggleCompare } = useCompare();

  const prefersReducedMotion = useReducedMotion();

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  const { name, gallery, tags, family, productId, serialNumber } = product;

  const image = gallery?.[0];

  const favorited = isFavorite(serialNumber);

  const inCompare = isInCompare(serialNumber);

  const goToDetail = () => {
    navigate(PRODUCTVIEWDETAIL.replace(":serialNumber", serialNumber));
  };

  const handleFavorite = (event) => {
    event.stopPropagation();

    toggleFavorite(serialNumber);
  };

  const handleCompare = (event) => {
    event.stopPropagation();

    const success = toggleCompare(serialNumber);

    if (!success) {
      toast.error(t("products.compare_full"));
    }
  };

  return (
    <motion.article
      layout
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={spring}
      className={[
        "group overflow-hidden",
        "rounded-[26px]",
        "border border-slate-200",
        "bg-white",
        "transition-colors duration-200",
        "hover:border-blue-200",
      ].join(" ")}
    >
      {/* =======================================================
          Image
      ======================================================= */}
      <button
        type="button"
        onClick={goToDetail}
        className="relative block w-full overflow-hidden bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
      >
        <div className="aspect-square">
          {image ? (
            <img
              src={image}
              alt={name || ""}
              loading="lazy"
              className={[
                "h-full w-full object-cover",
                "transition-transform duration-700 ease-out",
                "group-hover:scale-[1.025]",
              ].join(" ")}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={28} />

              <span className="text-xs font-medium">
                {t("products.no_image")}
              </span>
            </div>
          )}
        </div>

        {/* Floating actions */}
        <div
          className="absolute right-3 top-3 flex flex-col gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <GlassAction
            active={favorited}
            title={
              favorited
                ? t("products.remove_from_favorites")
                : t("products.add_to_favorites")
            }
            onClick={handleFavorite}
          >
            <Heart size={17} className={favorited ? "fill-current" : ""} />
          </GlassAction>

          <GlassAction
            active={inCompare}
            title={
              inCompare
                ? t("products.remove_from_compare")
                : t("products.add_to_compare")
            }
            onClick={handleCompare}
          >
            <GitCompareArrows size={17} />
          </GlassAction>
        </div>
      </button>

      {/* =======================================================
          Content
      ======================================================= */}
      <div className="flex min-h-[220px] flex-col p-4">
        {/* Category / family */}
        <div className="flex min-w-0 items-center justify-between gap-3">
          {family ? (
            <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
              <TableCellsSplit size={13} className="shrink-0 text-blue-500" />

              <span className="truncate">{family}</span>
            </div>
          ) : (
            <span />
          )}

          {productId && (
            <div className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-medium text-slate-400">
              <Package size={12} />
              <span>{productId}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <button
          type="button"
          onClick={goToDetail}
          className="mt-2 text-left focus:outline-none"
        >
          <h2 className="line-clamp-2 text-[18px] font-bold leading-[1.2] tracking-[-0.02em] text-slate-950 transition-colors group-hover:text-blue-600">
            {name}
          </h2>
        </button>

        {/* Tags */}
        {tags?.filter(Boolean).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags
              .filter(Boolean)
              .slice(0, 3)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              goToDetail();
            }}
            className={[
              "flex h-10 w-full items-center justify-center gap-1.5",
              "rounded-full",
              "border border-slate-200",
              "bg-white",
              "text-sm font-semibold",
              "text-slate-700",
              "transition-colors",
              "hover:border-blue-200",
              "hover:bg-blue-50",
              "hover:text-blue-600",
            ].join(" ")}
          >
            <span>{t("products.read_more")}</span>

            <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
