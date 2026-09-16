/* eslint-disable react-hooks/set-state-in-effect */
import GoBacKButton from "@/components/shared_uis/gobackbutton";
import MainLayout from "@/layouts/MainLayout";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Building2,
  Droplets,
  Sparkles,
} from "lucide-react";

const metrics = [
  {
    value: "15+",
    label: "ANNÉES D'EXPÉRIENCE",
    desc: "Une décennie et demie de savoir-faire dans le sanitaire.",
    icon: Award,
  },
  {
    value: "94%",
    label: "QUALITÉ & FRAÎCHEUR",
    desc: "Une expérience pensée autour de la satisfaction client.",
    icon: BadgeCheck,
  },
];

function useCountUp(target, duration = 1600, isVisible, reduced = false) {
  const [display, setDisplay] = useState(reduced ? target : "0");

  useEffect(() => {
    if (!isVisible) return;

    if (reduced) {
      setDisplay(target);
      return;
    }

    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");

    if (Number.isNaN(numeric)) {
      setDisplay(target);
      return;
    }

    let start = null;
    let frameId;

    const step = (timestamp) => {
      if (!start) start = timestamp;

      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(`${Math.floor(eased * numeric)}${suffix}`);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [duration, isVisible, reduced, target]);

  return display;
}

function MetricCard({ value, label, desc, delay = 0, reduced, icon: Icon }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  const display = useCountUp(value, 1600, visible, reduced);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.25,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={
        reduced
          ? undefined
          : {
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 700ms ease ${delay}ms, transform 700ms ease ${delay}ms`,
            }
      }
      className="group"
    >
      <article
        className="
          relative
          h-full
          overflow-hidden
          rounded-[28px]
          border
          border-slate-200/80
          bg-white
          p-6
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-blue-200
          shadow-xs
        "
      >
        {/* Top accent */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[2px]
            bg-gradient-to-r
            from-blue-500
            via-sky-400
            to-blue-300
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />

        {/* Ambient blue */}
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-36
            w-36
            rounded-full
            bg-blue-100/60
            blur-3xl
          "
        />

        <div className="relative">
          {/* Icon / label */}
          <div className="flex items-start justify-between gap-4">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-[16px]
                bg-blue-50
                text-blue-600
              "
            >
              <Icon className="h-5 w-5" />
            </div>

            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-400
                transition-colors
                duration-300
                group-hover:border-blue-200
                group-hover:text-blue-500
              "
            >
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          {/* Value */}
          <div className="mt-8">
            <p
              className="
                font-mainFont
                text-[clamp(2.7rem,5vw,3.6rem)]
                font-semibold
                leading-none
                tracking-[-0.055em]
                text-slate-950
              "
            >
              {display}
            </p>

            <p
              className="
                mt-4
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-blue-600
              "
            >
              {label}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function About() {
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = heroRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeroVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const visible = reduced || heroVisible;

  return (
    <MainLayout
      style={{
        background:
          "linear-gradient(145deg, #f8fbff 0%, #f5f9fd 48%, #edf6ff 100%)",
      }}
      className="w-full bg-transparent"
    >
      <main className="relative min-h-screen overflow-hidden">
        {/* =====================================================
            BACKGROUND
        ====================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="
              absolute
              -left-40
              top-24
              h-96
              w-96
              rounded-full
              bg-blue-200/20
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -right-40
              top-0
              h-[32rem]
              w-[32rem]
              rounded-full
              bg-sky-200/25
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-[-12rem]
              left-1/3
              h-[28rem]
              w-[28rem]
              rounded-full
              bg-blue-100/30
              blur-3xl
            "
          />

          <div
            className="
              absolute
              inset-0
              opacity-[0.35]
              [background-image:radial-gradient(rgba(37,99,235,0.08)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          {/* =====================================================
              FLOATING NAV
          ====================================================== */}

          <div className="flex items-center justify-between pt-6 sm:pt-8">
            <div
              className="
                rounded-full
                border
                border-white/80
                bg-white/60
                px-3
                py-2
                backdrop-blur-xl
                shadow-xs
              "
            >
              <GoBacKButton
                variant="link"
                className="
                  border-none
                  px-2
                  py-0
                  text-sm
                  font-medium
                  text-slate-600
                  hover:text-blue-600
                "
                text="Retour"
              />
            </div>

            <div
              className="
                hidden
                items-center
                gap-2
                rounded-full
                border
                border-white/80
                bg-white/60
                px-3.5
                py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-slate-500
                backdrop-blur-xl
                shadow-xs
                sm:flex
              "
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              SAN WATER
            </div>
          </div>

          {/* =====================================================
              HERO
          ====================================================== */}

          <section
            ref={heroRef}
            className="
              relative
              mx-auto
              max-w-5xl
              px-2
              pb-20
              pt-20
              text-center
              sm:pb-24
              sm:pt-24
              lg:pb-28
              lg:pt-28
            "
          >
            {/* Eyebrow */}
            <div
              className="flex justify-center"
              style={
                reduced
                  ? undefined
                  : {
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(14px)",
                      transition: "opacity 600ms ease, transform 600ms ease",
                    }
              }
            >
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-blue-100
                  bg-white/65
                  px-3.5
                  py-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-blue-600
                  backdrop-blur-xl
                  shadow-xs
                "
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-600
                    text-white
                  "
                >
                  <Sparkles className="h-3 w-3" />
                </span>
                À propos de nous
              </div>
            </div>

            {/* Heading */}
            <h1
              className="
                mt-7
                font-mainFont
                text-[clamp(3rem,8vw,6.8rem)]
                font-bold
                leading-[0.9]
                tracking-[-0.065em]
                text-slate-950
              "
              style={
                reduced
                  ? undefined
                  : {
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(20px)",
                      transition:
                        "opacity 700ms ease 80ms, transform 700ms ease 80ms",
                    }
              }
            >
              QUI
              <br />
              <span
                className="
                  bg-gradient-to-br
                  from-blue-700
                  via-blue-600
                  to-sky-400
                  bg-clip-text
                  text-transparent
                "
              >
                SOMMES-NOUS ?
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="
                mx-auto
                mt-7
                max-w-2xl
                text-base
                font-medium
                leading-7
                text-slate-500
                sm:text-lg
              "
              style={
                reduced
                  ? undefined
                  : {
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(20px)",
                      transition:
                        "opacity 700ms ease 160ms, transform 700ms ease 160ms",
                    }
              }
            >
              Des solutions sanitaires modernes, fiables et accessibles depuis
              2011.
            </p>

            {/* Description glass card */}
            <div
              className="mx-auto mt-10 max-w-3xl"
              style={
                reduced
                  ? undefined
                  : {
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(20px)",
                      transition:
                        "opacity 700ms ease 240ms, transform 700ms ease 240ms",
                    }
              }
            >
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-white/80
                  bg-white/55
                  px-6
                  py-7
                  text-left
                  backdrop-blur-2xl
                  shadow-xs
                  sm:px-8
                  sm:py-8
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-40
                    w-40
                    rounded-full
                    bg-blue-100/70
                    blur-3xl
                  "
                />

                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-[14px]
                        bg-blue-50
                        text-blue-600
                      "
                    >
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                        Notre histoire
                      </p>

                      <p className="mt-0.5 text-sm font-medium text-slate-700">
                        Une expertise construite depuis 2011
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
                    <strong className="font-semibold text-slate-800">
                      SAN WATER
                    </strong>
                    , fondée en 2011 à Dar El Beida (Alger), est spécialisée
                    dans les accessoires sanitaires et les solutions pour salle
                    de bains. La marque propose des produits de qualité à prix
                    compétitifs, avec une large gamme de modèles, tout en
                    suivant les tendances internationales.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              DIVIDER
          ====================================================== */}

          <div className="mx-auto max-w-5xl border-t border-slate-200/70" />

          {/* =====================================================
              METRICS
          ====================================================== */}

          <section className="py-16 sm:py-20 lg:py-24">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                  En quelques chiffres
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  Une expérience qui compte.
                </h2>
              </div>

              <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                <Droplets className="h-4 w-4 text-blue-500" />
                Savoir-faire sanitaire
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {metrics.map((metric, index) => (
                <MetricCard
                  key={metric.label}
                  {...metric}
                  delay={index * 100}
                  reduced={reduced}
                />
              ))}
            </div>
          </section>

          {/* =====================================================
              BRAND STATEMENT
          ====================================================== */}

          <section className="pb-12 sm:pb-16">
            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                bg-blue-600
                px-6
                py-10
                sm:px-10
                sm:py-12
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-24
                  h-64
                  w-64
                  rounded-full
                  bg-white/10
                  blur-3xl
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-24
                  -left-20
                  h-64
                  w-64
                  rounded-full
                  bg-sky-300/20
                  blur-3xl
                "
              />

              <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100">
                    Notre engagement
                  </p>

                  <h3 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
                    Qualité, accessibilité et évolution.
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                    Nous faisons évoluer notre offre avec les besoins du marché
                    et les tendances internationales.
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-white/10
                    text-white
                    backdrop-blur-xl
                  "
                >
                  <ArrowUpRight className="h-6 w-6" />
                </div>
              </div>
            </div>
          </section>

          <div className="h-6" />
        </div>
      </main>
    </MainLayout>
  );
}
