import React from 'react';
import { CtaButton, RotateWords } from '@/components';
import { CircleArrowRight, PlayCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const getHeroContent = (t) => ({
  badge: "Collection 2026",
  mainTitle: t('hero.title'),
  subTitles: [t('hero.subtitle')],
  description: t('hero.subtitle'),
});

const getButtons = (t) => ({
  primary: {
    label: t('nav.contact'),
    href: "/contact_sales",
    icon: <CircleArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
  },
  secondary: {
    label: t('hero.cta'),
    href: "/products",
    icon: <PlayCircle className="ml-2 h-5 w-5" />
  }
});



function Hero() {
  const { t } = useTranslation();
  const HERO_CONTENT = getHeroContent(t);
  const BUTTONS = getButtons(t);

  return (
    <main className='overflow-hidden select-none'>
    
    <div 
      className="lg:hidden"
    >
      <img className='absolute lg:left-200 md:left-140 left-48 blur-[2px] md:w-[60%] sm:w-[60%]' src="./products/p1.webp" alt="" />
    </div> 
   
    <div 
      className="lg:block md:hidden"
    >
      <img className='absolute w-[68%] -top-72 blur-[1px] left-116' src="./products/p2.webp" alt="" />
    </div> 

    <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
      

      <div className="container relative z-10 mx-auto lg:px-20 px-4 py-20">
        <div 
          className="max-w-3xl flex flex-col items-start text-left"> 
          <span 
            className="inline-flex items-center px-4 py-1.5 mb-8 text-[11px]  font-bold tracking-[0.2em] uppercase text-slate-600 bg-white/50 border border-slate-200/50 rounded-full backdrop-blur-md">
            {HERO_CONTENT.badge}
          </span>

             <RotateWords wordsClassName={`block bg-linear-to-t from-zinc-950 to-zinc-700 bg-clip-text font- text-transparent italic font-medium`} className={`text-6xl lg:text-8xl font-bold tracking-tight text-slate-900`} words={HERO_CONTENT.subTitles} text= {HERO_CONTENT.mainTitle} />
          <p 
            className="mt-6 text-lg text-slate-600 font-medium max-w-lg leading-relaxed">
            {HERO_CONTENT.description}
          </p>

          <div 
          
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
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