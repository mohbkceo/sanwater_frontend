import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "..";
import { Menu, X, CircleArrowRight, Globe, Search, Heart, GitCompareArrows } from "lucide-react";
import { ABOUT, NEWS, PRODUCTS, FAVORITES, COMPARE } from "@/configs/routes/routesConfig";
import { useTranslation } from "../../lib/i18n.jsx";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import QuickSearch from "@/components/products/QuickSearch";

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
        <div className="
          flex items-center justify-between
          px-6 py-3
          rounded-2xl
          backdrop-blur-xl
          bg-white/60
          border border-white/30
          shadow-sm
        ">
          
          <a href="/" className="font-semibold text-lg w-[4.1rem] flex justify-center items-center tracking-tight">
            <img src="./logo.svg" className="w-full cursor-pointer" alt="logo_sun_water" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="
                  text-sm font-medium
                  text-gray-700
                  hover:text-black
                  transition-colors
                "
              >
                {link.label}
              </a>
            ))}
          </div>
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                title={t("nav.search_placeholder")}
                className="flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-[#0050A4] transition-colors"
              >
                <Search size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate(FAVORITES)}
                title={t("nav.favorites")}
                className="relative flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-rose-500 transition-colors"
              >
                <Heart size={16} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(COMPARE)}
                title={t("nav.compare")}
                className="relative flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-[#0050A4] transition-colors"
              >
                <GitCompareArrows size={16} />
                {compareCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0050A4] px-1 text-[10px] font-bold text-white">
                    {compareCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-gray-600 hover:text-turquoise-600 transition-colors px-3 py-2 rounded-full border border-gray-200 bg-white shadow-sm"
                >
                  <Globe size={18} />
                  <span className="uppercase font-bold text-xs">
                    {lang === "fr" ? "FR" : lang === "ar" ? "AR" : "EN"}
                  </span>
                  <ChevronDown size={14} className="opacity-70" />
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setLang("en");
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                        lang === "en" ? "font-semibold text-turquoise-600" : "text-gray-700"
                      }`}
                    >
                      <span>English</span>
                      <span className="uppercase text-xs">EN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLang("fr");
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                        lang === "fr" ? "font-semibold text-turquoise-600" : "text-gray-700"
                      }`}
                    >
                      <span>Français</span>
                      <span className="uppercase text-xs">FR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLang("ar");
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                        lang === "ar" ? "font-semibold text-turquoise-600" : "text-gray-700"
                      }`}
                    >
                      <span>العربية</span>
                      <span className="uppercase text-xs">AR</span>
                    </button>
                  </div>
                )}
              </div>

              <Button className="rounded-full px-5 shadow-sm">
                <a href={ctaBtn.href} className="flex items-center gap-2">
                  {ctaBtn.label}
                  <CircleArrowRight size={16} />
                </a>
              </Button>
            </div>
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-black/5 transition"
              title={t("nav.search_placeholder")}
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => navigate(FAVORITES)}
              className="relative p-2 rounded-lg hover:bg-black/5 transition"
              title={t("nav.favorites")}
            >
              <Heart size={18} />
              {favoritesCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate(COMPARE)}
              className="relative p-2 rounded-lg hover:bg-black/5 transition"
              title={t("nav.compare")}
            >
              <GitCompareArrows size={18} />
              {compareCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0050A4] px-1 text-[9px] font-bold text-white">
                  {compareCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-black/5 transition"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && <QuickSearch onClose={() => setSearchOpen(false)} />}

        <div
          className={cn(
            "md:hidden mt-3 overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="
            backdrop-blur-xl
            bg-white/70
            border border-white/30
            rounded-2xl
            p-6
            flex flex-col gap-6
            shadow-sm
          ">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="text-gray-700 font-medium"
              >
                {link.label}
              </a>
            ))}

            <Button  className="rounded-full w-full">
              <a
                href={ctaBtn.href}
                className="flex items-center justify-center gap-2"
              >
                {ctaBtn.label}
                <CircleArrowRight size={16} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;