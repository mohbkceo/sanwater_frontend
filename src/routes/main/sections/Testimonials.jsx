import React from "react";
import { useTranslation } from "@/lib/i18n.jsx";
import { House } from "lucide-react";

const testimonials = [
  {
    name: "Karim B.",
    role: "Propriétaire",
    avatar: "https://pagedone.io/asset/uploads/1696229994.png",
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

export default function Testimonials() {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative bg-zinc-50/10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          
          <div className="lg:col-span-5 max-w-xl">
            <span className="text-sm flex items-center gap-2 text-zinc-500 font-medium mb-4  tracking-wider uppercase">
            <House size={20}/>
              {t("why_choose_us.testimonial_badge")}
            </span>

            <h2 className="text-4xl font-mainFont pb-2 sm:text-5xl bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent font-bold leading-tight">
              {t("why_choose_us.testimonial_heading")}
            </h2>
          </div>

          
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            <div className="space-y-6 md:mt-12">
              {testimonials
                .filter((_, idx) => idx % 2 === 0)
                .map((testimonial, idx) => (
                  <TestimonialCard key={idx} testimonial={testimonial} />
                ))}
            </div>

            
            <div className="space-y-6">
              {testimonials
                .filter((_, idx) => idx % 2 !== 0)
                .map((testimonial, idx) => (
                  <TestimonialCard key={idx} testimonial={testimonial} />
                ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* Extracted Card Structure matching the new layout positioning */
function TestimonialCard({ testimonial }) {
  return (
    <div className="group relative bg-white/50 font-semibold backdrop-blur-md border border-blue-200 rounded-3xl p-8 transition-all duration-500 hover:border-indigo-200 hover:shadow-[0_20px_60px_rgba(79,70,229,0.12)] flex flex-col justify-between min-h-[220px]">
      
      
      <div className="text-indigo-200 group-hover:text-indigo-400 transition-colors duration-500 mb-4 self-start">
        <svg width="36" height="26" viewBox="0 0 40 30" fill="currentColor">
          <path d="M12.3 0H0V12.3H7.4C7.4 16.4 4.1 19.7 0 19.7V29.6C8.1 29.6 14.8 22.9 14.8 14.8V2.5C14.8 1.1 13.7 0 12.3 0ZM37.5 0H25.2V12.3H32.6C32.6 16.4 29.3 19.7 25.2 19.7V29.6C33.3 29.6 40 22.9 40 14.8V2.5C40 1.1 38.9 0 37.5 0Z" />
        </svg>
      </div>

      {/* Main Feedback Content */}
      <p className="text-zinc-600 leading-relaxed text-base group-hover:text-zinc-900 transition-colors duration-500 mb-6 flex-grow">
        "{testimonial.feedback}"
      </p>

      {/* Author Info Block & Star Ratings arranged cleanly at the base */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-100/80">
        <div className="flex items-center gap-3">
          <img
            className="rounded-full h-11 w-11 object-cover border-2 border-white shadow-sm transition-transform duration-500 group-hover:scale-105"
            src={testimonial.avatar}
            alt={testimonial.name}
          />
          <div className="flex flex-col">
            <h5 className="text-zinc-900 font-semibold text-sm tracking-tight">
              {testimonial.name}
            </h5>
            <span className="text-xs font-medium text-indigo-600/90">
              {testimonial.role}
            </span>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-0.5 shrink-0">
          {[...Array(testimonial.rating)].map((_, i) => (
            <StarIcon key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.10326 1.31699C8.47008 0.57374 9.52992 0.57374 9.89674 1.31699L11.7063 4.98347C11.8519 5.27862 12.1335 5.48319 12.4592 5.53051L16.5054 6.11846C17.3256 6.23765 17.6531 7.24562 17.0596 7.82416L14.1318 10.6781C13.8961 10.9079 13.7885 11.2389 13.8442 11.5632L14.5353 15.5931C14.6754 16.41 13.818 17.033 13.0844 16.6473L9.46534 14.7446C9.17402 14.5915 8.82598 14.5915 8.53466 14.7446L4.91562 16.6473C4.18199 17.033 3.32456 16.41 3.46467 15.5931L4.15585 11.5632C4.21148 11.2389 4.10393 10.9079 3.86825 10.6781L0.940384 7.82416C0.346867 7.24562 0.674378 6.23765 1.4946 6.11846L5.54081 5.53051C5.86652 5.48319 6.14808 5.27862 6.29374 4.98347L8.10326 1.31699Z"
      fill="currentColor"
    />
  </svg>
);