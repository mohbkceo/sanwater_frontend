import React, { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  MapPin,
  Phone,
  Building2,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import MainLayout from '@/layouts/MainLayout';
import { GoBackButton } from '@/components';
import { getPageContent } from '@/services/contents/pageContent';

const SLUG = 'sales-contact';

const FALLBACK_PAGE = {
  slug: SLUG,
  mainTitle: 'Contactez notre équipe',
  subTitle:
    'Nos bureaux et équipes commerciales sont disponibles pour vous accompagner rapidement.',
  logo: '/logo-white.svg',
  contactSections: [],
  salesData: [],
};

const normalizePhoneLink = (phone = '') => `tel:${String(phone).replace(/[^\d+]/g, '')}`;

const normalizePage = (data) => ({
  ...FALLBACK_PAGE,
  ...(data || {}),
  contactSections: Array.isArray(data?.contactSections) ? data.contactSections : [],
  salesData: Array.isArray(data?.salesData) ? data.salesData : [],
});

const ContactCard = ({ item }) => {
  const companies = Array.isArray(item.companies) ? item.companies : [];
  const phones = Array.isArray(item.phones) ? item.phones : [];

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-300/30 hover:shadow-[0_10px_40px_rgba(0,174,239,0.18)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient || 'from-cyan-500/20 to-blue-600/20'} opacity-70`} />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />

      <div className="relative z-10 flex h-full flex-col p-7">
        <div className="mb-7 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg backdrop-blur-md">
            <Building2 className="h-6 w-6 text-white" />
          </div>

          <div className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            {item.region || 'Region'}
          </div>
        </div>

        <div className="mb-7">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gray-300">Companies</p>
          <div className="flex flex-wrap gap-2">
            {companies.map((company, index) => (
              <span
                key={`${company}-${index}`}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white"
              >
                {company}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-7">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gray-300">Quick Contact</p>
          <div className="space-y-3">
            {phones.map((phone, index) => (
              <a
                key={`${phone.number || phone}-${index}`}
                href={normalizePhoneLink(phone.number || phone)}
                className="group/phone flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-all duration-300 hover:border-cyan-300/30 hover:bg-cyan-400/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/20">
                    <Phone className="h-4 w-4 text-cyan-100" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-300">{phone.label || 'Phone'}</p>
                    <p className="font-semibold tracking-wide text-white">{phone.number || phone}</p>
                  </div>
                </div>

                <ArrowUpRight className="h-4 w-4 text-cyan-100 opacity-70 transition-transform duration-300 group-hover/phone:translate-x-1 group-hover/phone:-translate-y-1" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gray-300">Address</p>

          {item.maps ? (
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
                  {item.address || 'Address not set'}
                </p>

                <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-cyan-100">
                  Open in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </div>
            </a>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
              {item.address || 'Address not set'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SalesCard = ({ item }) => {
  const phones = Array.isArray(item.phones) ? item.phones : [];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent" />

      <div className="relative z-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-cyan-400/15">
          <Phone className="h-6 w-6 text-cyan-100" />
        </div>

        <h3 className="mb-6 text-2xl font-semibold tracking-tight text-white">
          {item.title || 'Sales contact'}
        </h3>

        <div className="space-y-3">
          {phones.map((phone, index) => (
            <a
              key={`${phone}-${index}`}
              href={normalizePhoneLink(phone)}
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
  const [pageData, setPageData] = useState(FALLBACK_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const logoSrc = useMemo(() => pageData.logo || '/logo-white.svg', [pageData.logo]);

  useEffect(() => {
    let mounted = true;

    const fetchPage = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPageContent(SLUG);
        if (!mounted) return;
        setPageData(normalizePage(data));
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load page content.');
        setPageData(FALLBACK_PAGE);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPage();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MainLayout bg="bg-[#03131C]">
      <section className="relative min-h-screen overflow-hidden px-6 py-10 font-mainFont sm:px-8 lg:px-12">
        <div className="absolute inset-0" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <GoBackButton
            variant="link"
            className="mb-10 w-fit border-none px-0 text-white"
            text="Retour"
          />

          {error ? (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="mb-20 text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative w-40">
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl" />
                {loading ? (
                  <div className="relative z-10 flex h-24 items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-cyan-100" />
                  </div>
                ) : (
                  <img src={logoSrc} alt="San Water" className="relative z-10" />
                )}
              </div>
            </div>

            <div className="mx-auto max-w-3xl">
              <h1 className="mb-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                {loading ? 'Loading...' : pageData.mainTitle}
              </h1>

              <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                {loading ? 'Fetching page content...' : pageData.subTitle}
              </p>
            </div>
          </div>

          <div className="mb-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">Nos bureaux</h2>
                <p className="mt-2 text-gray-400">
                  Cliquez sur un numéro pour appeler rapidement ou ouvrez l’adresse directement dans Google Maps.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
              {pageData.contactSections.length > 0 ? (
                pageData.contactSections.map((item, index) => (
                  <ContactCard key={`${item.region || 'section'}-${index}`} item={item} />
                ))
              ) : loading ? (
                <div className="xl:col-span-3 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-gray-300">
                  Loading office sections...
                </div>
              ) : (
                <div className="xl:col-span-3 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-gray-300">
                  No office sections available.
                </div>
              )}
            </div>
          </div>

          <div className="mb-14">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-white">Commercialisation</h2>
              <p className="mt-2 text-gray-400">
                Contact direct avec nos équipes de vente en gros et en détail.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
              {pageData.salesData.length > 0 ? (
                pageData.salesData.map((item, index) => (
                  <SalesCard key={`${item.title || 'sales'}-${index}`} item={item} />
                ))
              ) : loading ? (
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-gray-300">
                  Loading sales blocks...
                </div>
              ) : (
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-gray-300">
                  No sales blocks available.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactSalesPage;
