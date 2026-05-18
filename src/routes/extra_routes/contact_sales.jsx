import React from 'react';
import {
  ExternalLink,
  MapPin,
  Phone,
  Building2,
  ArrowUpRight,
} from 'lucide-react';

import MainLayout from '@/layouts/MainLayout';
import { GoBackButton } from '@/components';
import EmailSubscribe from '@/components/shared_uis/emailsubscribe';

const CONTACT_SECTIONS = [
  {
    id: 1,
    region: 'Algiers (Central)',
    companies: ['DECORAX', 'SAN DECO'],
    phones: [
      { label: 'DECORAX', number: '0791 57 27 04' },
      { label: 'DECORAX', number: '0551 28 02 75' },
      { label: 'SAN DECO', number: '0777 32 94 02' },
    ],
    address: 'Cité Freri 02 El - Hamiz D.E.B, Algiers',
    maps: 'https://maps.google.com/?q=Cité+Freri+02+El+Hamiz+D.E.B+Algiers',
    gradient: 'from-cyan-500/20 to-blue-600/20',
  },

  {
    id: 2,
    region: 'Oran (West)',
    companies: ['DECOUR - OUEST'],
    phones: [{ label: 'DECOUR - OUEST', number: '0556 87 94 31' }],
    address: 'Cité Khiat Salah 102 Mediouni, Oran',
    maps: 'https://maps.google.com/?q=Cité+Khiat+Salah+102+Mediouni+Oran',
    gradient: 'from-indigo-500/20 to-violet-600/20',
  },

  {
    id: 3,
    region: 'Sétif (East)',
    companies: ['SAN WATER - EAST'],
    phones: [
      { label: 'SAN WATER - EAST', number: '0658 10 50 46' },
      { label: 'SAN WATER - EAST', number: '0559 00 62 70' },
    ],
    address: 'Rue Bachir Guessad El Eulma, Setif',
    maps: 'https://maps.google.com/?q=Rue+Bachir+Guessad+El+Eulma+Setif',
    gradient: 'from-sky-500/20 to-cyan-500/20',
  },
];

const SALES_DATA = [
  {
    id: 4,
    title: 'Commercialisation en gros',
    phones: ['+213 561 628 246', '+213 557 431 992'],
  },

  {
    id: 5,
    title: 'Commercialisation en détail',
    phones: ['+213 791 572 704', '+213 551 280 275'],
  },
];

const formatPhoneLink = (phone) =>
  `tel:${phone.replace(/[^\d+]/g, '')}`;

const ContactCard = ({ item }) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-300/30 hover:shadow-[0_10px_40px_rgba(0,174,239,0.18)]`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-70`}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />

      <div className="relative z-10 flex h-full flex-col p-7">
        <div className="mb-7 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg backdrop-blur-md">
            <Building2 className="h-6 w-6 text-white" />
          </div>

          <div className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-cyan-100 uppercase">
            {item.region}
          </div>
        </div>

        <div className="mb-7">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gray-300">
            Companies
          </p>

          <div className="flex flex-wrap gap-2">
            {item.companies.map((company) => (
              <span
                key={company}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white"
              >
                {company}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-7">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gray-300">
            Quick Contact
          </p>

          <div className="space-y-3">
            {item.phones.map((phone, index) => (
              <a
                key={`${phone.number}-${index}`}
                href={formatPhoneLink(phone.number)}
                className="group/phone flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-all duration-300 hover:border-cyan-300/30 hover:bg-cyan-400/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/20">
                    <Phone className="h-4 w-4 text-cyan-100" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-300">{phone.label}</p>
                    <p className="font-semibold tracking-wide text-white">
                      {phone.number}
                    </p>
                  </div>
                </div>

                <ArrowUpRight className="h-4 w-4 text-cyan-100 opacity-70 transition-transform duration-300 group-hover/phone:translate-x-1 group-hover/phone:-translate-y-1" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gray-300">
            Address
          </p>

          <a
            href={item.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="group/maps flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:border-cyan-300/30 hover:bg-cyan-400/10"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <MapPin className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1">
              <p className="mb-1 text-sm font-medium leading-relaxed text-white">
                {item.address}
              </p>

              <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-cyan-100">
                Open in Google Maps
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

const SalesCard = ({ item }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent" />

      <div className="relative z-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-cyan-400/15">
          <Phone className="h-6 w-6 text-cyan-100" />
        </div>

        <h3 className="mb-6 text-2xl font-semibold tracking-tight text-white">
          {item.title}
        </h3>

        <div className="space-y-3">
          {item.phones.map((phone) => (
            <a
              key={phone}
              href={formatPhoneLink(phone)}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition-all duration-300 hover:border-cyan-300/30 hover:bg-cyan-400/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/20">
                  <Phone className="h-4 w-4 text-cyan-100" />
                </div>

                <span className="font-semibold tracking-wide text-white">
                  {phone}
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-cyan-100 opacity-70 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContactSalesPage = () => {
  const mainTitle = 'Contactez notre équipe';
  const subTitle =
    'Nos bureaux et équipes commerciales sont disponibles pour vous accompagner rapidement.';

  return (
    <MainLayout bg="bg-[#03131C]">
      <section className="relative min-h-screen overflow-hidden px-6 py-10 font-mainFont sm:px-8 lg:px-12">
        <div className="absolute inset-0 " />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <GoBackButton
            variant="link"
            className="mb-10 w-fit border-none px-0 text-white"
            text="Retour"
          />

          <div className="mb-20 text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative w-40">
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl" />
                <img
                  src="/logo-white.svg"
                  alt="San Water"
                  className="relative z-10"
                />
              </div>
            </div>

            <div className="mx-auto max-w-3xl">
              <h1 className="mb-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                {mainTitle}
              </h1>

              <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                {subTitle}
              </p>
            </div>
          </div>

          <div className="mb-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">
                  Nos bureaux
                </h2>

                <p className="mt-2 text-gray-400">
                  Cliquez sur un numéro pour appeler rapidement ou ouvrez
                  l’adresse directement dans Google Maps.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
              {CONTACT_SECTIONS.map((item) => (
                <ContactCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="mb-14">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-white">
                Commercialisation
              </h2>

              <p className="mt-2 text-gray-400">
                Contact direct avec nos équipes de vente en gros et en détail.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
              {SALES_DATA.map((item) => (
                <SalesCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactSalesPage;