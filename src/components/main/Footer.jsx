import { ArrowUpRight, Facebook, Instagram, Mail } from "lucide-react";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { CONTACTSALES, NEWS, PRODUCTS } from "@/configs/routes/routesConfig";

import { SPRING_DEFAULT } from "@/lib/springs";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    {
      label: "Produits",
      href: PRODUCTS,
    },
    {
      label: "Nouvelles",
      href: NEWS,
    },
    {
      label: "Contact ventes",
      href: CONTACTSALES,
    },
  ];

  const socialLinks = [
    {
      label: "X",
      href: "#",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M17.5667 14.7386L24.072 7.33936H22.5305L16.8819 13.764L12.3704 7.33936H7.16699L13.9892 17.0546L7.16699 24.8139H8.70862L14.6736 18.0292L19.4381 24.8139H24.6415L17.5663 14.7386H17.5667ZM15.4552 17.1402L14.764 16.1728L9.2641 8.47491L11.632 8.47491L16.0704 14.6873L16.7617 15.6548L22.5312 23.73H20.1633L15.4552 17.1406V17.1402Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      icon: <Instagram size={18} />,
    },
    {
      label: "Facebook",
      href: "#",
      icon: <Facebook size={18} />,
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#0B1220] text-white">
      {/* =========================================================
          Ambient blue atmosphere
      ========================================================= */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute right-[-150px] bottom-[-180px] h-[440px] w-[440px] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 pb-7 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          {/* =====================================================
              Main footer content
          ===================================================== */}
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            {/* Brand */}
            <div className="max-w-md">
              <Link to="/" className="inline-flex">
                <motion.img
                  whileTap={{ scale: 0.94 }}
                  transition={SPRING_DEFAULT}
                  src="./logo-white.svg"
                  alt="San Water"
                  className="w-36 sm:w-40"
                />
              </Link>

              <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
                Solutions modernes et fiables pour vos espaces avec une
                sélection de produits conçus pour durer.
              </p>

              {/* Floating contact CTA */}
              <Link
                to={CONTACTSALES}
                className={[
                  "group mt-7 inline-flex items-center gap-3",
                  "rounded-full",
                  "border border-white/15",
                  "bg-white/[0.07]",
                  "px-4 py-2.5",
                  "backdrop-blur-xl",
                  "transition-colors duration-200",
                  "hover:border-blue-400/30",
                  "hover:bg-blue-500/10",
                ].join(" ")}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Mail size={14} />
                </span>

                <span className="text-sm font-semibold text-slate-200">
                  Contactez-nous
                </span>

                <ArrowUpRight
                  size={15}
                  className="text-slate-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-400"
                />
              </Link>
            </div>

            {/* Navigation */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">
                Navigation
              </p>

              <nav className="mt-5">
                <ul className="space-y-3">
                  {navLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                      >
                        <span>{link.label}</span>

                        <ArrowUpRight
                          size={13}
                          className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-400 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Social */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">
                Social
              </p>

              <div className="mt-5 flex items-center gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ y: -2 }}
                    whileTap={{
                      scale: 0.9,
                    }}
                    transition={SPRING_DEFAULT}
                    className={[
                      "flex h-10 w-10 items-center justify-center",
                      "rounded-full",
                      "border border-white/10",
                      "bg-white/[0.04]",
                      "text-slate-400",
                      "transition-colors",
                      "hover:border-blue-400/30",
                      "hover:bg-blue-500/10",
                      "hover:text-blue-400",
                      "focus:outline-none",
                      "focus-visible:ring-2",
                      "focus-visible:ring-blue-400/50",
                    ].join(" ")}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* =====================================================
              Bottom divider
          ===================================================== */}
          <div className="mt-14 border-t border-white/10" />

          {/* =====================================================
              Bottom row
          ===================================================== */}
          <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              © {currentYear}{" "}
              <Link
                to="/"
                className="text-slate-400 transition-colors hover:text-white"
              >
                San Water
              </Link>
              . Tous droits réservés.
            </p>

            <div className="flex items-center gap-5 text-xs font-medium text-slate-500">
              <Link to="/" className="transition-colors hover:text-slate-300">
                Politique de confidentialité
              </Link>

              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-slate-700"
              />

              <span>Algeria</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
