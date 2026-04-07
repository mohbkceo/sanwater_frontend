import React from 'react';
import { Mail, MessageCircle, MapPin, Phone } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import { GoBackButton } from '@/components';
import EmailSubscribe from '@/components/shared_uis/emailsubscribe';

const CONTACT_DATA = [
  {
    id: 1,
    title: 'ACCESSOIRES DOUCHE',
    description: 'Parlez à notre équipe sympathique.',
    contact: 'accesoir_douch@sanwater-dz.com',
    link: 'mailto:accesoir_douch@sanwater-dz.com',
    icon: <Mail className="w-5 h-5 text-white" />,
  },
  {
    id: 2,
    title: 'SALLE DE BAINS',
    description: 'Nous sommes là pour vous aider.',
    contact: 'sale_de_bens@sanwater-dz.com',
    link: 'mailto:sale_de_bens@sanwater-dz.com',
    icon: <Mail className="w-5 h-5 text-white" />,
  },
  {
    id: 3,
    title: 'CUISINE',
    description: 'Du lundi au vendredi, de 8h à 17h.',
    contact: '+213 552 52 52 52',
    link: 'tel:+15550000000',
    icon: <Mail className="w-5 h-5 text-white" />,
  },
  {
    id: 4,
    title: 'VISITEZ-NOUS',
    description: 'Visitez notre siège social.',
    contact: 'Voir sur Google Maps',
    link: 'https://maps.google.com',
    icon: <MapPin className="w-5 h-5 text-white" />,
  },
];

const ContactCard = ({ item }) => (

  
  <div className="flex flex-col p-6 cursor-pointer bg-black/20 border border-gray-100/20 rounded-2xl transition-all duration-300 hover:shadow-md h-full">
    <div className="flex  items-center justify-center w-10 h-10 mb-16 border border-gray-100/20 rounded-lg shadow-sm">
      {item.icon}
    </div>
   
    <div className="mt-auto">
      <h3 className="text-lg font-mono font-semibold text-white mb-1">{item.title}</h3>
      <p className="text-gray-200 text-sm mb-4 leading-relaxed">{item.description}</p>
      <a 
        href={item.link} 
        className="text-sm font-semibold text-gray-100 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors"
      >
        {item.contact}
      </a>
    </div>
  </div>
);

const ContactSalesPage = () => {

  const mainTitle = 'Contactez notre équipe accueillante';
  const subTitle = 'Dites-nous comment nous pouvons vous aider.';
  return (
    <MainLayout>
    <GoBackButton variant="link" className={`w-1/2 border-none px-0`} text="Retour"/>
    <section className="relative font-mainFont min-h-screen  py-20 px-6 sm:px-8 lg:px-12 font-sans overflow-hidden">
     
      <div className="absolute inset-0 z-0 opacity-[0.2] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
      </div>

      

      <div className="relative z-10 max-w-7xl mx-auto">
       
        <div className="text-center mb-16 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-2 w-36 text-black">
              <img src="/logo-white.svg" alt="" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-mainFont tracking-tight text-gray-100">
            {mainTitle}
          </h1>
          <p className="text-lg font-mainFont tracking-wider leading-relaxed text-gray-100/80">
            {subTitle}
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONTACT_DATA.map((item) => (
            <ContactCard key={item.id} item={item} />
          ))}
        </div>

      </div>

      <div className="my-4 mx-auto w-full">
          <EmailSubscribe />
      </div>
    </section>
    </MainLayout>
  );
};

export default ContactSalesPage;