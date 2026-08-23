import { Package, TableCellsSplit, ChevronRight, Heart, GitCompareArrows, ImageOff } from "lucide-react";
import { Button } from "@/components";
import { PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { formatPrice, cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { SPRING_DEFAULT, REDUCED_MOTION_TRANSITION } from "@/lib/springs";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();
  const { name, gallery, tags, family, productId, serialNumber, prices } = product;
  const prefersReducedMotion = useReducedMotion();
  const spring = prefersReducedMotion ? REDUCED_MOTION_TRANSITION : SPRING_DEFAULT;

  const image = gallery?.[0];
  const favorited = isFavorite(serialNumber);
  const inCompare = isInCompare(serialNumber);

  const goToDetail = () => navigate(PRODUCTVIEWDETAIL.replace(":serialNumber", serialNumber));

  const handleToggleCompare = (e) => {
    e.stopPropagation();
    const ok = toggleCompare(serialNumber);
    if (!ok) toast.error(t("products.compare_full"));
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(serialNumber);
  };

  return (
    <motion.div
      onClick={goToDetail}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4 }}
      transition={spring}
      className="group flex flex-col gap-3 bg-white/40 hover:bg-white/60 transition-colors px-4 py-4 rounded-3xl border border-white/30 cursor-pointer"
    >
      <div className="relative shrink-0 rounded-2xl overflow-hidden bg-gray-100 aspect-square">
        {image ? (
          <img
            src={image}
            alt={name || ""}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageOff size={28} />
            <span className="text-xs">{t("products.no_image")}</span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.8 }}
            transition={spring}
            onClick={handleToggleFavorite}
            title={favorited ? t("products.remove_from_favorites") : t("products.add_to_favorites")}
            aria-pressed={favorited}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors",
              favorited ? "bg-rose-500 text-white" : "bg-white/90 text-gray-600 hover:text-rose-500"
            )}
          >
            <motion.span animate={favorited ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={spring}>
              <Heart size={16} className={favorited ? "fill-current" : ""} />
            </motion.span>
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.8 }}
            transition={spring}
            onClick={handleToggleCompare}
            title={inCompare ? t("products.remove_from_compare") : t("products.add_to_compare")}
            aria-pressed={inCompare}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors",
              inCompare ? "bg-[#0050A4] text-white" : "bg-white/90 text-gray-600 hover:text-[#0050A4]"
            )}
          >
            <GitCompareArrows size={16} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <h2 className="text-xl font-mainFont font-bold leading-tight text-gray-900 line-clamp-2">{name}</h2>

        <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1 truncate">
            <TableCellsSplit size={14} /> {family}
          </span>
          <span className="flex items-center gap-1 truncate shrink-0">
            <Package size={14} /> {productId}
          </span>
        </div>

        {prices?.productPrice > 0 && (
          <div className="font-mainFont font-bold text-lg text-[#0050A4]">
            {formatPrice(prices.productPrice)} DA
          </div>
        )}

        {tags?.filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.filter(Boolean).slice(0, 3).map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-indigo-600/10 text-indigo-700 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <motion.div whileTap={{ scale: 0.97 }} transition={spring}>
        <Button
          onClick={(e) => { e.stopPropagation(); goToDetail(); }}
          variant="outline"
          className="flex items-center bg-white/40 hover:bg-white/60 border border-gray-900/20 w-full"
        >
          <span>{t("products.read_more")}</span> <ChevronRight size={15} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
