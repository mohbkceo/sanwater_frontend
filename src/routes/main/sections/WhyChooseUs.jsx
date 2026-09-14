import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Link } from "react-router-dom";

import { motion, useReducedMotion } from "framer-motion";

import { BlurIn } from "@/components";

import { useTranslation } from "@/lib/i18n.jsx";

import { REDUCED_MOTION_TRANSITION, SPRING_DEFAULT } from "@/lib/springs";

function BenefitCard({ icon: Icon, title, description, href, button, index }) {
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
      transition={{
        ...spring,
        delay: prefersReducedMotion ? 0 : index * 0.05,
      }}
      className="group flex h-full flex-col rounded-[26px] border border-slate-200 bg-white p-6 transition-colors duration-300 hover:border-blue-200"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon size={21} />
      </div>

      <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <Link
        to={href}
        className="group/link mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
      >
        {button}

        <ArrowRight
          size={15}
          className="transition-transform group-hover/link:translate-x-1"
        />
      </Link>
    </motion.article>
  );
}

export default function WhyChooseUs() {
  const { t } = useTranslation();

  const prefersReducedMotion = useReducedMotion();

  const whyChooseUsContent = {
    title: t("why_choose_us.title"),
    description: t("why_choose_us.description"),

    primaryButton: {
      label: t("why_choose_us.explore_products"),
      href: "/products",
    },

    largeCard: {
      icon: ShieldCheck,
      title: t("why_choose_us.premium_quality_title"),
      description: t("why_choose_us.premium_quality_description"),
      button: t("why_choose_us.view_catalog"),
      href: "/products",
      image: "./system/img.webp",
    },

    cards: [
      {
        icon: BadgeCheck,
        title: t("why_choose_us.specialized_expertise_title"),
        description: t("why_choose_us.specialized_expertise_description"),
        button: t("why_choose_us.learn_more"),
        href: "/about",
      },
      {
        icon: Sparkles,
        title: t("why_choose_us.modern_designs_title"),
        description: t("why_choose_us.modern_designs_description"),
        button: t("why_choose_us.view_collection"),
        href: "/products",
      },
      {
        icon: TrendingUp,
        title: t("why_choose_us.competitive_value_title"),
        description: t("why_choose_us.competitive_value_description"),
        button: t("why_choose_us.get_a_quote"),
        href: "/contact_sales",
      },
    ],
  };

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* =====================================================
              Header
          ===================================================== */}
          <div className="mb-12 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                Why San Water
              </div>

              <BlurIn className="text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl lg:text-6xl">
                {whyChooseUsContent.title}
              </BlurIn>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                {whyChooseUsContent.description}
              </p>
            </div>

            <Link
              to={whyChooseUsContent.primaryButton.href}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-blue-200 bg-white px-5 text-sm font-semibold text-blue-600 shadow-xs transition-colors hover:bg-blue-50"
            >
              {whyChooseUsContent.primaryButton.label}

              <ArrowRight size={16} />
            </Link>
          </div>

          {/* =====================================================
              Main feature
          ===================================================== */}
          <motion.div
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
              margin: "-70px",
            }}
            transition={
              prefersReducedMotion ? REDUCED_MOTION_TRANSITION : SPRING_DEFAULT
            }
            className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950"
          >
            <div className="grid min-h-[430px] lg:grid-cols-2">
              {/* Content */}
              <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                    <ShieldCheck size={24} />
                  </div>

                  <h3 className="mt-7 max-w-md text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {whyChooseUsContent.largeCard.title}
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
                    {whyChooseUsContent.largeCard.description}
                  </p>
                </div>

                <Link
                  to={whyChooseUsContent.largeCard.href}
                  className="mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/15"
                >
                  {whyChooseUsContent.largeCard.button}

                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* Image */}
              <div className="relative min-h-[280px] overflow-hidden bg-slate-900">
                <img
                  src={whyChooseUsContent.largeCard.image}
                  alt={whyChooseUsContent.largeCard.title}
                  className="h-full w-full object-cover"
                />

                {/* Image glass label */}
                <div className="absolute bottom-5 left-5 rounded-full border border-white/30 bg-black/20 px-4 py-2 backdrop-blur-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/90">
                    San Water
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* =====================================================
              Supporting benefits
          ===================================================== */}
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {whyChooseUsContent.cards.map((card, index) => (
              <BenefitCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
                button={card.button}
                href={card.href}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
