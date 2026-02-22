import { CtaButton } from "@/components";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";


const whyChooseUsContent = {
  header: {
    title: "Spécialistes des solutions modernes pour salles de bains",
    description:
      "Fournir des accessoires sanitaires de qualité avec précision, innovation et valeur compétitive depuis 2011.",
    primaryButton: {
      label: "Explorer les produits",
      href: "/products",
    },
    secondaryButton: {
      label: "Contacter le service commercial",
      href: "/contact",
    },
  },

  largeCard: {
    icon: ShieldCheck,
    title: "Qualité Premium & Fabrication Précise",
    description:
      "Nos produits proviennent de fournisseurs rigoureusement sélectionnés, garantissant durabilité, finitions soignées et fiabilité à long terme.",
    button: {
      label: "Voir le catalogue",
      href: "#catalog",
    },
    image:
      "https://images.unsplash.com/photo-1584622781564-1d987f7333c1",
  },

  smallCards: [
    {
      icon: BadgeCheck,
      bgColor: "bg-indigo-600",
      title: "Expertise Spécialisée",
      description:
        "Focalisés exclusivement sur les accessoires sanitaires depuis 2011, maîtrisant le domaine pour servir nos clients avec confiance.",
      button: {
        label: "En savoir plus",
        href: "/about",
      },
    },
    {
      icon: Sparkles,
      bgColor: "bg-violet-600",
      title: "Designs Modernes",
      description:
        "Une large variété de couleurs et modèles inspirés des tendances internationales, adaptés à tous les styles et besoins de projets.",
      button: {
        label: "Voir la collection",
        href: "/products",
      },
    },
    {
      icon: TrendingUp,
      bgColor: "bg-emerald-600",
      title: "Valeur Compétitive",
      description:
        "Des solutions sanitaires de haute qualité à des prix accessibles, offrant une valeur maximale sans compromis.",
      button: {
        label: "Obtenir un devis",
        href: "/contact_sales",
      },
      isLast: true
    },
  ],
};


export default function WhyChooseUs() {
  const { header, largeCard, smallCards } = whyChooseUsContent;

  const LargeIcon = largeCard.icon;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
        <div className="mb-14 flex flex-col gap-2 w-full  text-center  max-sm:text-start ">
          <h2 className="text-6xl md:text-4xl bg-linear-to-b from-zinc-950 to-zinc-800 bg-clip-text text-transparent font-bold  leading-tight">
            {header.title}
          </h2>

         

          <div className="flex flex-col w-full mt-3 justify-center md:flex-row gap-5 max-w-lg mx-auto md:max-w-2xl lg:max-w-full">
            <CtaButton
              href={header.primaryButton.href}
              className="w-full bg-indigo-600"
              label={header.primaryButton.label}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-lg mx-auto md:max-w-2xl lg:max-w-full">

          <div className="relative w-full h-auto md:col-span-2">
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
          </div>

          {smallCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className={cn("relative w-full h-auto", card?.isLast && 'lg:col-span-4')}>
                <div
                  className={`${card.bgColor} rounded-2xl p-6 xl:p-8 h-full text-white`}
                >
                  <Icon size={30} className="mb-4" />

                  <h3 className="py-5 text-lg font-bold tracking-wider xl:text-xl">
                    {card.title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-8">{card.description}</p>

                  <a
                    href={card.button.href}
                    className="py-2 px-5 border border-white/40 rounded-full text-xs font-semibold flex items-center justify-between gap-2 transition-all duration-300 hover:bg-white/10"
                  >
                    {card.button.label}
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}