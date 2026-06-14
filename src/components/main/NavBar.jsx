import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "..";
import { Menu, X, CircleArrowRight, Globe } from "lucide-react";
import { ABOUT, NEWS, PRODUCTS } from "@/configs/routes/routesConfig";
import { useTranslation } from "../../lib/i18n.jsx";
import { ChevronDown } from "lucide-react";

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
  const { lang, setLang, t } = useTranslation();
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
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-black/5 transition"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

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