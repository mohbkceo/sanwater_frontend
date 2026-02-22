import React from 'react';
import { cn } from '@/lib/utils';
import { Button, CtaButton } from '@/components';
import { CircleArrowRight, PlayCircle } from 'lucide-react';

const HERO_CONTENT = {
  badge: "Collection 2026",
  mainTitle: "Experts en accessoires",
  subTitle: "bain & douche",
  description: "Élevez votre espace bien-être avec style et qualité.",
};

const BUTTONS = {
  primary: {
    label: "Contact ventes",
    href: "/contact_sales",
    icon: <CircleArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
  },
  secondary: {
    label: "Voir la Démo",
    href: "/demo",
    icon: <PlayCircle className="ml-2 h-5 w-5" />
  }
};

function Hero() {
  return (
    <main className='overflow-hidden select-none'>
    
    <div className="lg:hidden">
            <img className=' absolute  lg:left-[50rem] md:left-[35rem] left-[12rem] blur-[2px] md:w-[60%] sm:w-[60%]' src="./products/p1.webp" alt="" />
    </div> 
   
    <div className="lg:block md:hidden ">
            <img className=' absolute w-[68%] top-[-18rem] blur-[1px] left-[29rem]' src="./products/p2.webp" alt="" />
    </div> 

    <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden ">
      
      <div className="absolute inset-0 z-0 overflow-hidden rounded-4xl">
        <img 
          src="./hero.png" 
          alt="Luxury Bathroom" 
          className="w-full h-full blur-[2px] opacity-30 object-cover transition-scale duration-1000 hover:scale-105"
        />
        
      </div>

      <div className="container relative z-10 mx-auto lg:px-20 px-4 py-20">
        <div className="max-w-3xl flex flex-col items-start text-left">
          
          <span className="inline-flex items-center px-4 py-1.5 mb-8 text-[11px] font-bold tracking-[0.2em] uppercase text-slate-600 bg-white/50 border border-slate-200/50 rounded-full  backdrop-blur-md">
            {HERO_CONTENT.badge}
          </span>

          <h1 className="text-5xl lg:text-8xl font-bold tracking-tight text-slate-900 leading-[1.05]">
            {HERO_CONTENT.mainTitle} 
            <span className="block text-turquoise-600 italic font-medium">
              {HERO_CONTENT.subTitle}
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 font-medium max-w-lg leading-relaxed">
            {HERO_CONTENT.description}
          </p>

          <div className="mt-10  flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <CtaButton label={BUTTONS.primary.label} href={BUTTONS.primary.href} icon={BUTTONS.primary.icon}/>
            
            <CtaButton 
              variant="outline" 
              className="rounded-full px-8 py-6 text-base w-full sm:w-auto bg-white/50 backdrop-blur-sm border-slate-300 hover:bg-white"
              label={BUTTONS.secondary.label}
              href={BUTTONS.secondary.href}
              icon={BUTTONS.secondary.icon}
            />

          </div>
        </div>
      </div>
    </section>
    </main>
  );
}

export default Hero;