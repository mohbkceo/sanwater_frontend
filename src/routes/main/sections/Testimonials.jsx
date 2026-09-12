import React from "react";
import { ArrowRight, House, Quote, Star } from "lucide-react";

import { motion, useReducedMotion } from "framer-motion";

import { useTranslation } from "@/lib/i18n.jsx";

import { REDUCED_MOTION_TRANSITION, SPRING_DEFAULT } from "@/lib/springs";

const testimonials = [
  {
    name: "Karim B.",
    role: "Propriétaire",
    avatar:
      "https://images.unsplash.com/photo-1615109398623-88346a601842?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    rating: 5,
    feedback:
      "Très satisfait de la qualité des accessoires. Les finitions sont impeccables et l'installation s'est faite sans difficulté. Excellent rapport qualité-prix.",
  },
  {
    name: "Nadia A.",
    role: "Architecte d'intérieur",
    avatar: "https://pagedone.io/asset/uploads/1696229969.png",
    rating: 5,
    feedback:
      "SANWATER propose une gamme moderne qui suit les tendances actuelles. Je recommande régulièrement leurs produits à mes clients.",
  },
  {
    name: "Yacine M.",
    role: "Entrepreneur en bâtiment",
    avatar: "https://pagedone.io/asset/uploads/1696230027.png",
    rating: 5,
    feedback:
      "Nous équipons plusieurs projets avec SANWATER. Les produits sont fiables, bien finis et les délais sont toujours respectés.",
  },
  {
    name: "Ossama H.",
    role: "Cliente",
    avatar: "https://pagedone.io/asset/uploads/1696229994.png",
    rating: 5,
    feedback:
      "Le design est élégant et la qualité est au rendez-vous. Après plusieurs mois d'utilisation, les accessoires sont toujours comme neufs.",
  },
];

function Rating({ rating }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          strokeWidth={2}
          className={
            index < rating ? "fill-blue-500 text-blue-500" : "text-slate-200"
          }
        />
      ))}
    </div>
  );
}

function Customer({ testimonial, featured = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        loading="lazy"
        className={[
          "shrink-0 rounded-full object-cover",
          featured ? "h-12 w-12" : "h-10 w-10",
        ].join(" ")}
      />

      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-slate-950">
          {testimonial.name}
        </div>

        <div className="truncate text-xs font-medium text-slate-400">
          {testimonial.role}
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial, featured = false, index = 0 }) {
  const prefersReducedMotion = useReducedMotion();

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-60px",
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={{
        ...spring,
        delay: prefersReducedMotion ? 0 : index * 0.04,
      }}
      className={[
        "group flex flex-col",
        "rounded-[26px]",
        "border border-slate-200",
        "bg-white",
        "transition-colors duration-300",
        "hover:border-blue-200",
        featured ? "min-h-[390px] p-7 sm:p-9 lg:p-10" : "min-h-[240px] p-6",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={[
            "flex items-center justify-center rounded-2xl",
            featured ? "h-12 w-12" : "h-10 w-10",
            "bg-blue-50 text-blue-500",
          ].join(" ")}
        >
          <Quote size={featured ? 21 : 18} fill="currentColor" />
        </div>

        <Rating rating={testimonial.rating} />
      </div>

      <p
        className={[
          "flex-1 text-slate-600",
          "transition-colors duration-300",
          "group-hover:text-slate-800",
          featured
            ? "mt-8 text-xl font-medium leading-8 tracking-[-0.015em] sm:text-2xl"
            : "mt-6 text-sm font-medium leading-6",
        ].join(" ")}
      >
        “{testimonial.feedback}”
      </p>

      <div className="mt-7 border-t border-slate-100 pt-5">
        <Customer testimonial={testimonial} featured={featured} />
      </div>
    </motion.article>
  );
}

export default function Testimonials() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Ambient blue atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-[-120px] top-[20%] h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="absolute right-[-100px] bottom-[10%] h-80 w-80 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            {/* =================================================
                Intro
            ================================================= */}
            <div className="flex flex-col justify-center lg:sticky lg:top-32 lg:self-start">
              <div className="inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                <House size={15} />

                {t("why_choose_us.testimonial_badge")}
              </div>

              <h2 className="mt-4 max-w-xl text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                {t("why_choose_us.testimonial_heading")}
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-slate-500">
                Des clients qui choisissent SANWATER pour la qualité, le design
                et la fiabilité de leurs projets.
              </p>

              {/* Floating glass metric */}
              <div className="mt-8 w-fit rounded-full border border-white/80 bg-white/65 px-4 py-2.5 shadow-xs backdrop-blur-2xl backdrop-saturate-150">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {testimonials.slice(0, 3).map((item) => (
                      <img
                        key={item.name}
                        src={item.avatar}
                        alt=""
                        className="h-7 w-7 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-slate-600">
                    Clients SANWATER
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                Testimonials
            ================================================= */}
            <div className="grid gap-4">
              {testimonials[0] && (
                <TestimonialCard
                  testimonial={testimonials[0]}
                  featured
                  index={0}
                />
              )}

              <div className="grid gap-4 md:grid-cols-3">
                {testimonials.slice(1).map((testimonial, index) => (
                  <TestimonialCard
                    key={testimonial.name}
                    testimonial={testimonial}
                    index={index + 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
