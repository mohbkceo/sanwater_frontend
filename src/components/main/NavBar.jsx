import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "..";
import { Menu, X, CircleArrowRight, Globe, Search, Heart, GitCompareArrows, ChevronDown } from "lucide-react";
import { ABOUT, NEWS, PRODUCTS, FAVORITES, COMPARE } from "@/configs/routes/routesConfig";
import { useTranslation } from "../../lib/i18n.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import QuickSearch from "@/components/products/QuickSearch";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SPRING_DEFAULT, REDUCED_MOTION_TRANSITION } from "@/lib/springs";

const getLinks = (t) => [
  { id: "products", label: t("nav.products"), href: PRODUCTS },
  { id: "about", label: t("nav.about"), href: ABOUT },
  { id: "news", label: t("nav.news"), href: NEWS },
  { id: "hiring", label: t("nav.hiring"), href: "/hiring" },
];

const getCtaBtn = (t) => ({
  id: "nav_cta",
  label: t("nav.contact"),
  href: "/contact_sales",
  icon: CircleArrowRight
});

// Small icon-button used repeatedly in the chrome — press feedback lives
// on pointer-down via whileTap, never waits for release (apple-design-skill §1).
function IconButton({ onClick, title, badge, badgeClass, children, className }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      whileTap={{ scale: 0.88 }}
      transition={SPRING_DEFAULT}
      className={cn(
        "relative flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors",
        className
      )}
    >
      {children}
      {badge > 0 && (
        <motion.span
          key={badge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={SPRING_DEFAULT}
          className={cn("absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white", badgeClass)}
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}

function NavBar({ className, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();
  const navigate = useNavigate();
  const { count: favoritesCount } = useFavorites();
  const { count: compareCount } = useCompare();
  const links = getLinks(t);
  const ctaBtn = getCtaBtn(t);
  const prefersReducedMotion = useReducedMotion();
  const springOrFade = prefersReducedMotion ? REDUCED_MOTION_TRANSITION : SPRING_DEFAULT;

  return (
    <nav
      id="navbar"
      {...props}
      className={cn(
        "fixed top-0 left-0 w-full z-50",
        className
      )}
    >
      <div className="mx-auto w-[92%] max-w-6xl mt-4">
        <div className="material-surface flex items-center justify-between px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/30 shadow-sm" style={{ "--material-solid-fallback": "rgba(255,255,255,0.96)" }}>

          <Link to="/" className="font-semibold text-lg w-[4.1rem] flex justify-center items-center tracking-tight">
            <motion.img whileTap={{ scale: 0.92 }} transition={springOrFade} src="./logo.svg" className="w-full cursor-pointer" alt="logo_sun_water" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.id}
                to={link.href}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
            <div className="hidden md:flex items-center gap-4">
              <IconButton onClick={() => setSearchOpen(true)} title={t("nav.search_placeholder")} className="hover:text-[#0050A4]">
                <Search size={16} />
              </IconButton>

              <IconButton onClick={() => navigate(FAVORITES)} title={t("nav.favorites")} className="hover:text-rose-500" badge={favoritesCount} badgeClass="bg-rose-500">
                <Heart size={16} />
              </IconButton>

              <IconButton onClick={() => navigate(COMPARE)} title={t("nav.compare")} className="hover:text-[#0050A4]" badge={compareCount} badgeClass="bg-[#0050A4]">
                <GitCompareArrows size={16} />
              </IconButton>

              <div className="relative">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  transition={springOrFade}
                  onClick={() => setLangMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-gray-600 hover:text-turquoise-600 transition-colors px-3 py-2 rounded-full border border-gray-200 bg-white shadow-sm"
                >
                  <Globe size={18} />
                  <span className="uppercase font-bold text-xs">
                    {lang === "fr" ? "FR" : lang === "ar" ? "AR" : "EN"}
                  </span>
                  <motion.span animate={{ rotate: langMenuOpen ? 180 : 0 }} transition={springOrFade}>
                    <ChevronDown size={14} className="opacity-70" />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.94, filter: "blur(4px)" }}
                      transition={springOrFade}
                      style={{ transformOrigin: "top right" }}
                      className="absolute right-0 mt-2 w-36 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
                    >
                      {[
                        { code: "en", label: "English" },
                        { code: "fr", label: "Français" },
                        { code: "ar", label: "العربية" },
                      ].map((option) => (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => {
                            setLang(option.code);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${
                            lang === option.code ? "font-semibold text-turquoise-600" : "text-gray-700"
                          }`}
                        >
                          <span>{option.label}</span>
                          <span className="uppercase text-xs">{option.code}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div whileTap={{ scale: 0.96 }} transition={springOrFade}>
                <Button className="rounded-full px-5 shadow-sm" asChild>
                  <Link to={ctaBtn.href} className="flex items-center gap-2">
                    {ctaBtn.label}
                    <CircleArrowRight size={16} />
                  </Link>
                </Button>
              </motion.div>
            </div>
          <div className="flex items-center gap-1 md:hidden">
            <motion.button whileTap={{ scale: 0.88 }} transition={springOrFade} onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-black/5 transition-colors" title={t("nav.search_placeholder")}>
              <Search size={18} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }} transition={springOrFade} onClick={() => navigate(FAVORITES)} className="relative p-2 rounded-lg hover:bg-black/5 transition-colors" title={t("nav.favorites")}>
              <Heart size={18} />
              {favoritesCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {favoritesCount}
                </span>
              )}
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }} transition={springOrFade} onClick={() => navigate(COMPARE)} className="relative p-2 rounded-lg hover:bg-black/5 transition-colors" title={t("nav.compare")}>
              <GitCompareArrows size={18} />
              {compareCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0050A4] px-1 text-[9px] font-bold text-white">
                  {compareCount}
                </span>
              )}
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }} transition={springOrFade} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && <QuickSearch onClose={() => setSearchOpen(false)} />}
        </AnimatePresence>

        {/* Anchored to the navbar it opens from — same origin as the pill above (§7) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -6 }}
              transition={springOrFade}
              style={{ transformOrigin: "top" }}
              className="md:hidden mt-3 overflow-hidden"
            >
              <div className="material-surface backdrop-blur-xl bg-white/70 border border-white/30 rounded-2xl p-6 flex flex-col gap-6 shadow-sm" style={{ "--material-solid-fallback": "rgba(255,255,255,0.98)" }}>
                {links.map((link) => (
                  <Link
                    key={link.id}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-700 font-medium"
                  >
                    {link.label}
                  </Link>
                ))}

                <Button className="rounded-full w-full" asChild>
                  <Link
                    to={ctaBtn.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2"
                  >
                    {ctaBtn.label}
                    <CircleArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default NavBar;
