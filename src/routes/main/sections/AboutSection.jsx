import React from 'react';
import { ArrowRight } from 'lucide-react'; // Optional: using lucide-react for the button icon
import { CtaButton } from '@/components';
import { CircleArrowRight } from 'lucide-react';


const Buttons = {
 primary : {
    label: "Contact ventes",
    href: "/contact_sales",
    icon: <CircleArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
  },
}

const AboutSection = () => {
  const sectionData = {
    badge: "QUI SOMMES-NOUS?",
    title: "Solutions sanitaires de qualité depuis 2011",
    description: "SANWATER, fondée en 2011 à Dar El Beida (Alger), est spécialisée dans les accessoires sanitaires et les solutions pour salle de bains. La marque propose des produits de qualité à prix compétitifs, avec une large gamme de modèles, en suivant les tendances internationales.",
    images: [
      {
        url: "./system/des1.jpg",
        alt: "Sifting flour over cake",
        className: "h-[400px] w-1/3 object-cover rounded-full"
      },
      {
        url: "./system/des2.jpg",
        alt: "Gourmet Sandwich",
        className: "h-[190px] w-full object-cover rounded-r-full rounded-t-full"
      },
      {
        url: "./system/des3.jpg",
        alt: "Berry Pancakes",
        className: "h-[190px] w-full object-cover  rounded-r-full rounded-b-full"
      }
    ],

    backgroundBlurred : "./system/blur_desc_section.png",
    stats: [
      { label: "EXPÉRIENCE", value: "15+" },
      { label: "Freshness & Quality", value: "94%" },
    ]
  };

  

  return (
    <section className="max-w-7xl relative bg-slate-50/20 rounded-3xl border border-white/20 mx-auto px-6 py-16 font-sans">
        {/* <div className='absolute z-0 opacity-15 overflow-hidden rounded-3xl inset-0'>
            <img className='h-full' src={sectionData.backgroundBlurred} alt="blurred_background" />
        </div> */}
      <div className="grid relative grid-cols-1 z-10 lg:grid-cols-2 gap-12 items-center">
        
        
        <div className=" flex gap-3">
          
             <img 
              src={sectionData.images[0].url} 
              alt={sectionData.images[0].alt}
              className={sectionData.images[0].className}
            />
          <div className="col-span-1 flex flex-col gap-4">
            <img 
              src={sectionData.images[1].url} 
              alt={sectionData.images[1].alt}
              className={sectionData.images[1].className}
            />
            <img 
              src={sectionData.images[2].url} 
              alt={sectionData.images[2].alt}
              className={sectionData.images[2].className}
            />
          </div>
        </div>

        
        <div className="space-y-6 ">
          <h4 className="text-indigo-100/80 font-light tracking-wide uppercase text-sm">
            {sectionData.badge}
          </h4>
          <h2 className="text-5xl md:text-4xl bg-linear-to-b from-zinc-950 to-zinc-800 bg-clip-text text-transparent font-bold  leading-tight">
            {sectionData.title}
          </h2>
          <p className="text-zinc-600 font-semibold leading-relaxed max-w-xl">
            {sectionData.description}
          </p>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {sectionData.stats.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center px-4 py-2 border border-gray-200/20 rounded-2xl bg-gray-50/20 "
              >
                <span className="text-zinc-950  font-bold text-xl mr-3">
                  {item.value}
                </span>
                <span className="text-zinc-950 text-sm font-bold">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

         <CtaButton label={Buttons.primary.label} href={Buttons.primary.href} icon={Buttons.primary.icon}/>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;