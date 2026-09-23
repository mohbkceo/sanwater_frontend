import { useTranslation } from "@/lib/i18n";
import { Copy, Check, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "..";
import { useNavigate } from "react-router-dom";

export default function ProductCard({
  product,
  onDelete,
  onToggleActive,
  canManage = true,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const imageUrl = product.gallery?.[0] || "/api/placeholder/400/320";

  const productUrl = `https://sanwater-dz.com/products/landing_product/${product?.serialNumber}`;

  const isActive = Boolean(product.isActive);

  const handleToggle = (event) => {
    event.stopPropagation();

    onToggleActive?.(product.serialNumber, !isActive);
  };

  const handleDelete = (event) => {
    event.stopPropagation();

    setMenuOpen(false);

    onDelete?.(product.serialNumber);
  };

  const handleCopyLink = async (event) => {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(productUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  const handleOpen = () => {
    navigate(`edit?serialNumber=${product.serialNumber}`);
  };

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[26px]
        border
        border-slate-200/70
        bg-white
        transition
        duration-200
        hover:border-blue-200
      "
    >
      {/* =====================================================
          IMAGE / PRIMARY CONTENT
      ===================================================== */}

      <button
        type="button"
        onClick={handleOpen}
        className="
          relative
          block
          w-full
          overflow-hidden
          bg-slate-100
          text-start
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-blue-500/40
          focus-visible:ring-inset
        "
        aria-label={t("admin.products.edit_named_product", { name: product.name || t("admin.products.product") })}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name || t("admin.products.product")}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.025]
            "
          />

          {/* Very restrained image overlay */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-24
              bg-gradient-to-t
              from-black/35
              to-transparent
            "
          />

          {/* Family */}
          {product.family && (
            <span
              className="
                absolute
                start-3.5
                top-3.5
                max-w-[60%]
                truncate
                rounded-full
                border
                border-white/60
                bg-white/70
                px-2.5
                py-1.5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-slate-700
                backdrop-blur-xl
              "
            >
              {product.family.name}
            </span>
          )}

          {/* Status */}
          <span
            className={`
              absolute
              end-3.5
              top-3.5
              rounded-full
              border
              px-2.5
              py-1.5
              text-[9px]
              font-semibold
              tracking-wide
              backdrop-blur-xl
              ${
                isActive
                  ? `
                    border-blue-200/70
                    bg-blue-50/85
                    text-blue-700
                  `
                  : `
                    border-white/60
                    bg-white/75
                    text-slate-500
                  `
              }
            `}
          >
            {isActive ? t("admin.products.visible") : t("admin.products.hidden")}
          </span>

          {/* Product name */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5">
            <h2
              className="
                truncate
                text-lg
                font-semibold
                tracking-tight
                text-white
              "
            >
              {product.name || t("admin.products.unnamed_product")}
            </h2>

            {product.productId && (
              <p className="mt-0.5 truncate text-[11px] text-white/75">
                {product.productId}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* =====================================================
          INFORMATION
      ===================================================== */}

      <div className="px-4 pb-4 pt-4">
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70 bg-slate-50/50">
          <div className="flex items-center justify-between gap-4 px-3.5 py-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
              {t("admin.products.product_id")}
            </span>

            <span className="max-w-[55%] truncate font-mono text-xs font-medium text-slate-700">
              {product.productId || "—"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-3.5 py-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
              {t("admin.products.serial")}
            </span>

            <span className="max-w-[55%] truncate font-mono text-xs font-medium text-slate-700">
              {product.serialNumber || "—"}
            </span>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
          {/* Visibility */}
          <Button
            type="button"
            onClick={handleToggle}
            disabled={!canManage}
            title={
              !canManage
                ? t("admin.common.permission_denied")
                : isActive
                  ? t("admin.products.hide_product")
                  : t("admin.products.show_product")
            }
            className={`
              h-10
              rounded-xl
              border
              px-3
              text-xs
              font-semibold
              transition
              disabled:cursor-not-allowed
              disabled:opacity-40
              ${
                isActive
                  ? `
                    border-blue-100
                    bg-blue-50
                    text-blue-700
                    hover:bg-blue-100
                  `
                  : `
                    border-slate-200
                    bg-white
                    text-slate-500
                    hover:border-blue-100
                    hover:bg-blue-50
                    hover:text-blue-700
                  `
              }
            `}
          >
            {isActive ? t("admin.products.hide_product") : t("admin.products.show_product")}
          </Button>

          {/* Copy */}
          <Button
            type="button"
            onClick={handleCopyLink}
            title={t("admin.products.copy_product_link")}
            aria-label={t("admin.products.copy_product_link")}
            className="
              grid
              h-10
              w-10
              place-items-center
              rounded-xl
              border
              border-slate-200
              bg-white
              p-0
              text-slate-500
              transition
              hover:border-blue-100
              hover:bg-blue-50
              hover:text-blue-600
            "
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>

          {/* Menu */}
          <div className="relative">
            <Button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label={t("admin.products.more_product_actions")}
              aria-expanded={menuOpen}
              className="
                grid
                h-10
                w-10
                place-items-center
                rounded-xl
                border
                border-slate-200
                bg-white
                p-0
                text-slate-500
                transition
                hover:border-blue-100
                hover:bg-blue-50
                hover:text-blue-600
              "
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label={t("admin.products.close_menu")}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />

                <div
                  className="
                    absolute
                    bottom-12
                    end-0
                    z-20
                    w-36
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/80
                    bg-white/90
                    p-1
                    backdrop-blur-2xl
                    shadow-xs
                  "
                >
                  <button
                    type="button"
                    onClick={handleOpen}
                    className="
                      flex
                      w-full
                      items-center
                      rounded-xl
                      px-3
                      py-2.5
                      text-start
                      text-xs
                      font-medium
                      text-slate-700
                      transition
                      hover:bg-blue-50
                      hover:text-blue-700
                    "
                  >
                    {t("admin.products.edit_product")}
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canManage}
                    className="
                      flex
                      w-full
                      items-center
                      rounded-xl
                      px-3
                      py-2.5
                      text-start
                      text-xs
                      font-medium
                      text-red-600
                      transition
                      hover:bg-red-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    {t("admin.products.delete_product_action")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
          {t("admin.products.select_product_to_edit")}
        </p>
      </div>
    </article>
  );
}
