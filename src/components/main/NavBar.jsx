import React, { useEffect, useRef, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Check,
  ChevronDown,
  CircleArrowRight,
  Globe,
  GitCompareArrows,
  Heart,
  Menu,
  Search,
  X,
} from "lucide-react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "../../lib/utils";
import { Button } from "..";

import {
  ABOUT,
  COMPARE,
  FAVORITES,
  NEWS,
  PRODUCTS,
} from "@/configs/routes/routesConfig";

import { useTranslation } from "../../lib/i18n.jsx";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import QuickSearch from "@/components/products/QuickSearch";

import { REDUCED_MOTION_TRANSITION, SPRING_DEFAULT } from "@/lib/springs";

const getLinks = (t) => [
  {
    id: "products",
    label: t("nav.products"),
    href: PRODUCTS,
  },
  {
    id: "about",
    label: t("nav.about"),
    href: ABOUT,
  },
  {
    id: "news",
    label: t("nav.news"),
    href: NEWS,
  },
  {
    id: "hiring",
    label: t("nav.hiring"),
    href: "/hiring",
  },
];

const getCtaBtn = (t) => ({
  label: t("nav.contact"),
  href: "/contact_sales",
});

const languages = [
  {
    code: "en",
    label: "English",
  },
  {
    code: "fr",
    label: "Français",
  },
  {
    code: "ar",
    label: "العربية",
  },
];

function IconButton({
  onClick,
  title,
  badge,
  badgeClass = "bg-blue-600",
  active = false,
  children,
  className,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      whileTap={{ scale: 0.92 }}
      transition={SPRING_DEFAULT}
      className={cn(
        [
          "relative flex h-10 w-10 shrink-0 items-center justify-center",
          "rounded-full",
          "border border-white/70",
          "bg-white/55",
          "backdrop-blur-2xl backdrop-saturate-150",
          "transition-colors duration-200",
          "focus:outline-none",
          "focus-visible:ring-2 focus-visible:ring-blue-500/40",
        ].join(" "),
        active
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-white/85 hover:text-blue-600",
        className,
      )}
    >
      {children}

      {badge > 0 && (
        <motion.span
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={SPRING_DEFAULT}
          className={cn(
            [
              "absolute -top-0.5 -right-0.5",
              "flex min-h-[17px] min-w-[17px]",
              "items-center justify-center",
              "rounded-full",
              "border-2 border-white",
              "px-1",
              "text-[9px] font-bold leading-none text-white",
            ].join(" "),
            badgeClass,
          )}
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}

function LanguageSelector({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const prefersReducedMotion = useReducedMotion();

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  const isRTL = lang === "ar";

  const currentLanguage =
    languages.find((item) => item.code === lang) || languages[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-999" dir="ltr">
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        transition={spring}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={[
          "flex  h-10 items-center gap-2",
          "rounded-full",
          "border border-white/70",
          "bg-white/55",
          "px-3",
          "text-slate-600",
          "backdrop-blur-2xl backdrop-saturate-150",
          "transition-colors",
          "hover:bg-white/85 hover:text-blue-600",
        ].join(" ")}
      >
        <Globe size={16} />

        <span className="text-[11px] font-bold uppercase tracking-wide">
          {currentLanguage.code}
        </span>

        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.97,
            }}
            transition={spring}
            className={[
              "absolute top-[calc(100%+8px)] z-[120]",
              isRTL ? "left-0" : "right-0",
              "w-44 overflow-visible",
              "rounded-[22px]",
              "border border-white/75",
              "bg-white/80",
              "p-1.5",
              "backdrop-blur-2xl backdrop-saturate-150",
              "shadow-xs",
            ].join(" ")}
            role="menu"
          >
            {languages.map((option) => {
              const selected = option.code === lang;

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    setLang(option.code);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between",
                    "rounded-[16px]",
                    "px-3.5 py-3",
                    "text-sm",
                    "transition-colors",
                    selected
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-white",
                  ].join(" ")}
                >
                  <span className={selected ? "font-semibold" : "font-medium"}>
                    {option.label}
                  </span>

                  {selected ? (
                    <Check size={15} className="text-blue-500" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {option.code}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({ link, active }) {
  return (
    <Link
      to={link.href}
      className={[
        "relative rounded-full",
        "px-3 py-2",
        "text-sm font-semibold",
        "transition-colors duration-200",
        active ? "text-blue-600" : "text-slate-600 hover:text-slate-950",
      ].join(" ")}
    >
      {link.label}

      {active && (
        <motion.span
          layoutId="navbar-active-indicator"
          className="absolute inset-0 -z-10 rounded-full bg-blue-50"
          transition={SPRING_DEFAULT}
        />
      )}
    </Link>
  );
}

function NavBar({ className, ...props }) {
  const [isOpen, setIsOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const { lang, setLang, t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const { count: favoritesCount } = useFavorites();

  const { count: compareCount } = useCompare();

  const prefersReducedMotion = useReducedMotion();

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  const links = getLinks(t);
  const ctaBtn = getCtaBtn(t);

  const isRTL = lang === "ar";

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    );
  };

  useEffect(() => {
    // Closing the mobile drawer is an intentional response to navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <nav
      {...props}
      id="navbar"
      dir="ltr"
      className={cn("fixed inset-x-0 top-0 z-999 px-3 pt-3 sm:px-4", className)}
    >
      <div className="mx-auto max-w-6xl">
        <div
          className={[
            "flex min-h-[64px] items-center",
            "rounded-full",
            "border border-white/80",
            "bg-white/60",
            "px-2.5 py-2",
            "backdrop-blur-2xl",
            "backdrop-saturate-150",
            "shadow-xs",
          ].join(" ")}
        >
          {/* Brand */}
          <Link
            to="/"
            className="flex h-11 w-[68px] shrink-0 items-center justify-center rounded-full px-2 hover:bg-white/50"
          >
            <motion.img
              src="./logo.svg"
              alt="San Water"
              whileTap={{ scale: 0.94 }}
              transition={spring}
              className="w-full"
            />
          </Link>

          {/* =================================================
              Desktop navigation
          ================================================= */}
          <div
            className={[
              "hidden md:flex items-center gap-1",
              isRTL ? "mr-5" : "ml-5",
            ].join(" ")}
          >
            {links.map((link) => (
              <NavLink key={link.id} link={link} active={isActive(link.href)} />
            ))}
          </div>

          {/* =================================================
              Desktop actions
          ================================================= */}
          <div
            className={["hidden md:flex items-center gap-1.5", "ms-auto"].join(
              " ",
            )}
            dir="ltr"
          >
            <IconButton
              onClick={() => setSearchOpen(true)}
              title={t("nav.search_placeholder")}
            >
              <Search size={17} />
            </IconButton>

            <IconButton
              onClick={() => navigate(FAVORITES)}
              title={t("nav.favorites")}
              badge={favoritesCount}
              badgeClass="bg-blue-500"
            >
              <Heart size={17} />
            </IconButton>

            <IconButton
              onClick={() => navigate(COMPARE)}
              title={t("nav.compare")}
              badge={compareCount}
              badgeClass="bg-blue-600"
              active={isActive(COMPARE)}
            >
              <GitCompareArrows size={17} />
            </IconButton>

            <LanguageSelector lang={lang} setLang={setLang} compact />

            <motion.div
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="ms-1"
            >
              <Button
                className="h-10 rounded-full bg-blue-600 px-4 text-white shadow-xs hover:bg-blue-700"
                asChild
              >
                <Link to={ctaBtn.href} className="flex items-center gap-2">
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {ctaBtn.label}
                  </span>

                  <CircleArrowRight size={16} />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* =================================================
              Mobile actions
          ================================================= */}
          <div className="ms-auto flex items-center gap-1 md:hidden" dir="ltr">
            <IconButton
              onClick={() => setSearchOpen(true)}
              title={t("nav.search_placeholder")}
            >
              <Search size={17} />
            </IconButton>

            <IconButton
              onClick={() => navigate(FAVORITES)}
              title={t("nav.favorites")}
              badge={favoritesCount}
              badgeClass="bg-blue-500"
            >
              <Heart size={17} />
            </IconButton>

            <motion.button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              whileTap={{ scale: 0.92 }}
              transition={spring}
              aria-expanded={isOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/55 text-slate-700 backdrop-blur-2xl hover:bg-white/85 hover:text-blue-600"
            >
              {isOpen ? <X size={19} /> : <Menu size={19} />}
            </motion.button>
          </div>
        </div>

        {/* =====================================================
            Search
        ===================================================== */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -6,
                scale: 0.98,
              }}
              transition={spring}
              className="mt-2"
            >
              <QuickSearch onClose={() => setSearchOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================================================
            Mobile menu
        ===================================================== */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -6,
                scale: 0.98,
              }}
              transition={spring}
              className={[
                "mt-2 overflow-visible",
                "rounded-[28px]",
                "border border-white/80",
                "bg-white/80",
                "p-2",
                "backdrop-blur-3xl",
                "backdrop-saturate-150",
                "shadow-xs",
                "md:hidden",
              ].join(" ")}
            >
              <div className="space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.id}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={[
                      "flex min-h-12 items-center",
                      "rounded-2xl px-4",
                      "text-sm font-semibold",
                      isActive(link.href)
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-700 hover:bg-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-2 border-t border-slate-200/70 pt-2">
                <div className="flex items-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => navigate(COMPARE)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/70 text-sm font-semibold text-slate-700"
                  >
                    <GitCompareArrows size={17} />

                    <span>{t("nav.compare")}</span>

                    {compareCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                        {compareCount}
                      </span>
                    )}
                  </button>

                  <LanguageSelector lang={lang} setLang={setLang} />
                </div>

                <Button
                  className="mt-1 h-12 w-full rounded-2xl bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                  asChild
                >
                  <Link
                    to={ctaBtn.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2"
                  >
                    {ctaBtn.label}

                    <CircleArrowRight size={17} />
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
