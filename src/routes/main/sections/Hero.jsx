import React from "react";
import { CtaButton, RotateWords } from "@/components";
import {
  ArrowUpRight,
  CircleArrowRight,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n.jsx";

const getHeroContent = (t) => ({
  badge: t("hero.badge"),
  mainTitle: t("hero.title"),
  subTitle: t("hero.subtitle"),
});

const getButtons = (t) => ({
  primary: {
    label: t("nav.contact"),
    href: "/contact_sales",
    icon: (
      <CircleArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
    ),
  },
  secondary: {
    label: t("hero.cta"),
    href: "/products",
    icon: <PlayCircle className="ml-2 h-5 w-5" />,
  },
});

function Hero() {
  const { t } = useTranslation();

  const HERO_CONTENT = getHeroContent(t);
  const BUTTONS = getButtons(t);

  return (
    <main className="relative rounded-3xl isolate overflow-hidden bg-white text-slate-950 selection:bg-blue-100 selection:text-blue-900">
      {/* -------------------------------------------------
          Ambient background
      -------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute right-[-10rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-sky-200/30 blur-3xl" />

        <div className="absolute bottom-[-12rem] left-[35%] h-[28rem] w-[28rem] rounded-full bg-blue-100/50 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.06),transparent_35%)]" />
      </div>

      {/* -------------------------------------------------
          Hero
      -------------------------------------------------- */}
      <section className="relative min-h-[780px] overflow-hidden lg:min-h-[820px]">
        <div className="mx-auto flex min-h-[780px] w-full max-w-[1500px] items-center px-5 py-24 sm:px-8 lg:min-h-[820px] lg:px-12 xl:px-16">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 xl:gap-16">
            {/* -------------------------------------------------
                Content
            -------------------------------------------------- */}
            <div className="relative z-20 max-w-2xl">
              {/* Glass badge */}
              <div
                className="
                  mb-7 inline-flex items-center gap-2.5
                  rounded-full
                  border border-blue-200/70
                  bg-white/55
                  px-3.5 py-2
                  text-[11px] font-semibold uppercase
                  tracking-[0.18em] text-blue-700
                  backdrop-blur-xl
                  shadow-xs
                "
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Sparkles className="h-3 w-3" />
                </span>

                <span>{HERO_CONTENT.badge}</span>
              </div>

              <div className="max-w-3xl text-start">
                <RotateWords
                  words={HERO_CONTENT.subTitle}
                  text={HERO_CONTENT.mainTitle}
                  className="
                    text-[3.5rem]
                    font-bold
                    
                    leading-[0.95]
                    tracking-[-0.045em]
                    text-slate-950
                    sm:text-6xl
                    lg:text-7xl
                    xl:text-[5.9rem]
                  "
                  wordsClassName="
                    block
                    bg-gradient-to-br
                    from-blue-700
                    via-blue-600
                    to-sky-500
                    bg-clip-text
                    italic
                    font-semibold
                    text-transparent
                  "
                />
              </div>

              {/* Actions */}
              <div className="mt-9 flex flex-col gap-1 sm:flex-row">
                <CtaButton
                  label={BUTTONS.primary.label}
                  href={BUTTONS.primary.href}
                  icon={BUTTONS.primary.icon}
                  className="
                    group
                    w-full
                    rounded-full
                    border border-blue-600
                    bg-blue-600
                    px-7
                    py-5.5
                    text-base
                    font-semibold
                    text-white
                    shadow-xs
                    transition-all
                    duration-300
                    hover:bg-blue-700
                    
                  "
                />

                <CtaButton
                  variant="outline"
                  label={BUTTONS.secondary.label}
                  href={BUTTONS.secondary.href}
                  icon={BUTTONS.secondary.icon}
                  className="
                    group
                    w-full
                    rounded-full
                    border border-white/80
                    bg-white/50
                    px-7
                    py-5.5
                    text-base
                    font-semibold
                    text-slate-800
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:border-blue-200
                    hover:bg-white/80
                    sm:w-auto
                  "
                />
              </div>
            </div>

            <div className="relative min-h-[430px] sm:min-h-[540px] lg:min-h-[620px]">
              {/* Blue glow */}
              <div className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl" />

              {/* Large product image */}
              <div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  w-[88%]
                  -translate-x-1/2
                  -translate-y-1/2
                  sm:w-[82%]
                  lg:w-[92%]
                  xl:w-[88%]
                "
              >
                <img
                  src="./products/p1.webp"
                  alt=""
                  aria-hidden="true"
                  className="
                    relative
                    z-10
                    h-auto
                    w-full
                    object-contain
                    drop-shadow-[0_24px_45px_rgba(37,99,235,0.10)]
                  "
                />
              </div>

              {/* Floating glass card */}
              <div
                className="
                  absolute
                  bottom-5
                  left-3
                  z-30
                  hidden
                  max-w-[220px]
                  rounded-[24px]
                  border border-white/70
                  bg-white/50
                  p-4
                  backdrop-blur-2xl
                  shadow-xs
                  sm:block
                  lg:left-0
                  lg:bottom-14
                "
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                    {HERO_CONTENT.badge}
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-600">
                  {HERO_CONTENT.subTitle}
                </p>
              </div>

              {/* Floating visual accent */}
              <div
                className="
                  absolute
                  right-2
                  top-10
                  z-30
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-[22px]
                  border
                  border-white/70
                  bg-white/55
                  text-blue-600
                  backdrop-blur-2xl
                  shadow-xs
                  sm:right-6
                  sm:top-16
                  sm:h-20
                  sm:w-20
                  lg:right-2
                "
              >
                <CircleArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-100/70" />

                <div className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-100/40" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Hero;
