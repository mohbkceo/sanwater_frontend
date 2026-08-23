import { BlurIn, CtaButton } from "@/components";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n.jsx";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SPRING_DEFAULT } from "@/lib/springs";

export default function WhyChooseUs() {
  const { t } = useTranslation();

  const whyChooseUsContent = {
    header: {
      title: t("why_choose_us.title"),
      description: t("why_choose_us.description"),
      primaryButton: {
        label: t("why_choose_us.explore_products"),
        href: "/products",
      },
      secondaryButton: {
        label: t("why_choose_us.contact_sales"),
        href: "/contact_sales",
      },
    },

    largeCard: {
      icon: ShieldCheck,
      title: t("why_choose_us.premium_quality_title"),
      description: t("why_choose_us.premium_quality_description"),
      button: {
        label: t("why_choose_us.view_catalog"),
        href: "/products",
      },
      image:
        "./system/img.webp",
    },

    smallCards: [
      {
        icon: BadgeCheck,
        bgColor: "bg-indigo-600",
        title: t("why_choose_us.specialized_expertise_title"),
        description: t("why_choose_us.specialized_expertise_description"),
        button: {
          label: t("why_choose_us.learn_more"),
          href: "/about",
        },
      },
      {
        icon: Sparkles,
        bgColor: "bg-violet-600",
        title: t("why_choose_us.modern_designs_title"),
        description: t("why_choose_us.modern_designs_description"),
        button: {
          label: t("why_choose_us.view_collection"),
          href: "/products",
        },
      },
      {
        icon: TrendingUp,
        bgColor: "bg-emerald-600",
        title: t("why_choose_us.competitive_value_title"),
        description: t("why_choose_us.competitive_value_description"),
        button: {
          label: t("why_choose_us.get_a_quote"),
          href: "/contact_sales",
        },
        isLast: true
      },
    ],
  };

  const { header, largeCard, smallCards } = whyChooseUsContent;

  const LargeIcon = largeCard.icon;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
        <div className="mb-14 flex flex-col gap-2 w-full  text-center  max-sm:text-start ">
          
           <BlurIn className="text-display text-4xl md:text-6xl bg-linear-to-b from-zinc-950 to-zinc-800 bg-clip-text text-transparent font-bold">{header.title}</BlurIn>
          
         

          <div className="flex flex-col w-full mt-3 justify-center md:flex-row gap-5 max-w-lg mx-auto md:max-w-2xl lg:max-w-full">
            <CtaButton
              href={header.primaryButton.href}
              className="w-full bg-indigo-600"
              label={header.primaryButton.label}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-lg mx-auto md:max-w-2xl lg:max-w-full">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={SPRING_DEFAULT}
            className="relative w-full h-auto md:col-span-2"
          >
            <div className="bg-gray-900 rounded-2xl flex justify-between flex-row flex-wrap overflow-hidden">
              <div className=" px-6 py-8 w-full md:w-1/2">
                <LargeIcon className="text-white mb-4" size={30} />

                <h3 className="text-lg font-bold xl:text-xl text-white py-5 xl:w-64">
                  {largeCard.title}
                </h3>

                <p className="text-sm font-normal text-gray-300 mb-8 xl:w-64">
                  {largeCard.description}
                </p>

                <CtaButton
                  href={largeCard.button.href}
                  variant="outline"
                  className="py-2 px-5 border border-gray-500 rounded-full text-xs text-white bg-white/10 font-semibold flex items-center gap-2 transition-all duration-300 hover:bg-white/5"
                  label={largeCard.button.label}
                  icon={<ArrowRight size={14} />}
                 />
                  
                  
                
              </div>

              <div className="relative hidden md:block md:w-1/2">
                <img
                  src={largeCard.image}
                  alt={largeCard.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {smallCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ ...SPRING_DEFAULT, delay: index * 0.05 }}
                className={cn("relative w-full h-auto", card?.isLast && (
                  index === smallCards.length - 1 ? "lg:col-span-4" : ""
                ))}
              >
                <div
                  className={`${card.bgColor} rounded-2xl p-6 xl:p-8 h-full text-white`}
                >
                  <Icon size={30} className="mb-4" />

                  <h3 className="py-5 text-lg font-bold tracking-wider xl:text-xl">
                    {card.title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-8">{card.description}</p>

                  <motion.div whileTap={{ scale: 0.96 }} transition={SPRING_DEFAULT}>
                    <Link
                      to={card.button.href}
                      className="py-2 px-5 border border-white/40 rounded-full text-xs font-semibold flex items-center justify-between gap-2 transition-colors duration-300 hover:bg-white/10"
                    >
                      {card.button.label}
                      <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
