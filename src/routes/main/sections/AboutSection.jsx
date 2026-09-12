import React from "react";

import { ArrowRight, CircleArrowRight, Plus } from "lucide-react";

import { CounterAnimate, CtaButton } from "@/components";

import { useTranslation } from "@/lib/i18n.jsx";

import { motion, useReducedMotion } from "framer-motion";

import { REDUCED_MOTION_TRANSITION, SPRING_DEFAULT } from "@/lib/springs";

const AboutSection = () => {
  const { t } = useTranslation();

  const prefersReducedMotion = useReducedMotion();

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  const sectionData = {
    badge: t("about.badge"),
    title: t("about.title"),
    description: t("about.description"),

    images: [
      {
        url: "./system/des1.webp",
        alt: "SanWater",
      },
      {
        url: "./system/des2.webp",
        alt: "SanWater",
      },
      {
        url: "./system/des3.webp",
        alt: "SanWater",
      },
    ],

    stats: [
      {
        label: t("about.years_experience"),
        value: "15",
      },
      {
        label: t("about.quality_freshness"),
        value: "94",
      },
    ],
  };

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* =====================================================
          Ambient background
      ===================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-[8%] top-[20%] h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="absolute right-[-100px] bottom-0 h-96 w-96 rounded-full bg-sky-100/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            {/* =================================================
                Image composition
            ================================================= */}
            <motion.div
              initial={{
                opacity: 0,
                x: prefersReducedMotion ? 0 : -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                margin: "-70px",
              }}
              transition={spring}
              className="relative"
            >
              {/* Blue decorative frame */}
              <div
                aria-hidden="true"
                className="absolute -left-4 top-8 h-[82%] w-4 rounded-full bg-blue-500/10 lg:-left-6"
              />

              <div className="grid grid-cols-[1.1fr_0.9fr] gap-3">
                {/* Main image */}
                <div className="relative overflow-hidden rounded-[32px] bg-slate-100">
                  <img
                    src={sectionData.images[0].url}
                    alt={sectionData.images[0].alt}
                    className="h-[510px] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />

                  {/* Glass label */}
                  <div className="absolute bottom-5 left-5 rounded-full border border-white/70 bg-white/65 px-4 py-2.5 shadow-xs backdrop-blur-2xl backdrop-saturate-150">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                      SanWater
                    </span>
                  </div>
                </div>

                {/* Secondary images */}
                <div className="grid gap-3">
                  <div className="overflow-hidden rounded-[28px] bg-slate-100">
                    <img
                      src={sectionData.images[1].url}
                      alt={sectionData.images[1].alt}
                      className="h-full min-h-[248px] w-full object-cover transition-transform duration-700 hover:scale-[1.025]"
                    />
                  </div>

                  <div className="overflow-hidden rounded-[28px] bg-slate-100">
                    <img
                      src={sectionData.images[2].url}
                      alt={sectionData.images[2].alt}
                      className="h-full min-h-[248px] w-full object-cover transition-transform duration-700 hover:scale-[1.025]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* =================================================
                Content
            ================================================= */}
            <motion.div
              initial={{
                opacity: 0,
                x: prefersReducedMotion ? 0 : 20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                margin: "-70px",
              }}
              transition={{
                ...spring,
                delay: prefersReducedMotion ? 0 : 0.08,
              }}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                {sectionData.badge}
              </div>

              <h2 className="mt-4 max-w-xl text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                {sectionData.title}
              </h2>

              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-500 sm:text-lg">
                {sectionData.description}
              </p>

              {/* Stats */}
              <div className="mt-9 grid grid-cols-2 border-y border-slate-200">
                {sectionData.stats.map((item, index) => (
                  <div
                    key={item.label}
                    className={[
                      "py-6",
                      index === 0 ? "border-r border-slate-200 pr-5" : "pl-5",
                    ].join(" ")}
                  >
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                        <CounterAnimate from={0} to={Number(item.value)} />
                      </span>

                      <Plus
                        size={22}
                        strokeWidth={2.5}
                        className="ml-1 text-blue-500"
                      />
                    </div>

                    <p className="mt-2 max-w-[150px] text-xs font-semibold leading-5 text-slate-400">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <CtaButton
                  href="/contact_sales"
                  label={t("nav.contact")}
                  className="w-full rounded-full bg-blue-600 px-7 py-4 text-white shadow-xs transition-colors hover:bg-blue-700 sm:w-auto"
                  icon={
                    <CircleArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  }
                />
              </div>

              {/* Small supporting navigation */}
              <div className="mt-6">
                <a
                  href="/about"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
                >
                  En savoir plus sur SANWATER
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
