import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import { GoBackButton } from "@/components";
import { getPageContent } from "@/services/contents/pageContent";
import LeadCaptureForm from "@/components/leads/LeadCaptureForm";

const SLUG = "sales-contact";

const FALLBACK_PAGE = {
  slug: SLUG,
  mainTitle: "Contactez notre équipe",
  subTitle:
    "Nos bureaux et équipes commerciales sont disponibles pour vous accompagner rapidement.",
  logo: "./logo.svg",
  contactSections: [],
  salesData: [],
};

const normalizePhoneLink = (phone = "") =>
  `tel:${String(phone).replace(/[^\d+]/g, "")}`;

const normalizePage = (data) => ({
  ...FALLBACK_PAGE,
  ...(data || {}),
  contactSections: Array.isArray(data?.contactSections)
    ? data.contactSections
    : [],
  salesData: Array.isArray(data?.salesData) ? data.salesData : [],
});

const SectionEyebrow = ({ icon, children }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/65 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 backdrop-blur-xl shadow-xs">
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
      {icon}
    </span>

    <span>{children}</span>
  </div>
);

const IconTile = ({ children, className = "" }) => (
  <div
    className={[
      "flex h-11 w-11 shrink-0 items-center justify-center",
      "rounded-[16px]",
      "border border-blue-100/80",
      "bg-blue-50/80",
      "text-blue-600",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

/* =========================================================
   Office Card
========================================================= */

const ContactCard = ({ item, index }) => {
  const companies = Array.isArray(item.companies) ? item.companies : [];
  const phones = Array.isArray(item.phones) ? item.phones : [];

  return (
    <article
      className="
        group relative flex h-full flex-col overflow-hidden
        rounded-[30px]
        border border-slate-200/80
        bg-white
        transition-all duration-300
        hover:-translate-y-1
        hover:border-blue-200
      "
    >
      {/* Soft brand glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-blue-100/70 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4 p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div
            className="
              flex h-14 w-14 items-center justify-center
              rounded-[20px]
              border border-white
              bg-gradient-to-br from-blue-600 to-blue-500
              text-white
              shadow-xs
            "
          >
            <Building2 className="h-6 w-6" />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
              Bureau
            </p>

            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {item.region || `Région ${index + 1}`}
            </h3>
          </div>
        </div>

        <span
          className="
            rounded-full
            border border-blue-100
            bg-blue-50
            px-3 py-1.5
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-blue-700
          "
        >
          {companies.length
            ? `${companies.length} entreprise${companies.length > 1 ? "s" : ""}`
            : "Contact"}
        </span>
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col px-6 pb-6 sm:px-7 sm:pb-7">
        {/* Companies */}
        {companies.length > 0 && (
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Entreprises
            </p>

            <div className="flex flex-wrap gap-2">
              {companies.map((company, companyIndex) => (
                <span
                  key={`${company}-${companyIndex}`}
                  className="
                    rounded-full
                    border border-slate-200
                    bg-slate-50
                    px-3 py-1.5
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="my-6 h-px bg-slate-100" />

        {/* Phones */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Contact direct
            </p>

            <Phone className="h-4 w-4 text-blue-500" />
          </div>

          <div className="space-y-2">
            {phones.length > 0 ? (
              phones.map((phone, phoneIndex) => (
                <a
                  key={`${phone.number || phone}-${phoneIndex}`}
                  href={normalizePhoneLink(phone.number || phone)}
                  className="
                    group/phone
                    flex items-center justify-between
                    rounded-[18px]
                    border border-slate-200/80
                    bg-slate-50/70
                    px-3 py-3
                    transition-all duration-200
                    hover:border-blue-200
                    hover:bg-blue-50/70
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <IconTile>
                      <Phone className="h-4 w-4" />
                    </IconTile>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        {phone.label || "Téléphone"}
                      </p>

                      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                        {phone.number || phone}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    className="
                      h-4 w-4 shrink-0
                      text-blue-500
                      transition-transform duration-200
                      group-hover/phone:-translate-y-0.5
                      group-hover/phone:translate-x-0.5
                    "
                  />
                </a>
              ))
            ) : (
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                Aucun numéro disponible.
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="mt-auto pt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Adresse
          </p>

          {item.maps ? (
            <a
              href={item.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group/maps
                relative flex items-start gap-3
                overflow-hidden
                rounded-[20px]
                border border-blue-100
                bg-blue-50/60
                p-4
                transition-all duration-200
                hover:border-blue-200
                hover:bg-blue-50
              "
            >
              <IconTile className="bg-white">
                <MapPin className="h-4 w-4" />
              </IconTile>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-6 text-slate-700">
                  {item.address || "Adresse non définie"}
                </p>

                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  Ouvrir dans Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          ) : (
            <div className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <IconTile>
                <MapPin className="h-4 w-4" />
              </IconTile>

              <p className="text-sm leading-6 text-slate-600">
                {item.address || "Adresse non définie"}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const SalesCard = ({ item }) => {
  const phones = Array.isArray(item.phones) ? item.phones : [];

  return (
    <article
      className="
        group relative overflow-hidden
        rounded-[30px]
        border border-slate-200/80
        bg-white
        p-6
        transition-all duration-300
        hover:-translate-y-1
        hover:border-blue-200
        sm:p-7
      "
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-blue-100/70 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className="
              flex h-14 w-14 items-center justify-center
              rounded-[20px]
              bg-blue-600
              text-white
              shadow-xs
            "
          >
            <Phone className="h-6 w-6" />
          </div>

          <div
            className="
              flex h-9 w-9 items-center justify-center
              rounded-full
              border border-slate-200
              bg-white
              text-blue-500
              transition-colors
              group-hover:border-blue-200
              group-hover:bg-blue-50
            "
          >
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
            Équipe commerciale
          </p>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {item.title || "Contact commercial"}
          </h3>
        </div>

        <div className="mt-6 space-y-2">
          {phones.length > 0 ? (
            phones.map((phone, index) => (
              <a
                key={`${phone}-${index}`}
                href={normalizePhoneLink(phone)}
                className="
                  group/phone
                  flex items-center justify-between
                  rounded-[20px]
                  border border-slate-200
                  bg-slate-50/80
                  px-4 py-3.5
                  transition-all duration-200
                  hover:border-blue-200
                  hover:bg-blue-50/70
                "
              >
                <div className="flex items-center gap-3">
                  <IconTile>
                    <Phone className="h-4 w-4" />
                  </IconTile>

                  <span className="text-sm font-semibold tracking-wide text-slate-800">
                    {phone}
                  </span>
                </div>

                <ArrowUpRight
                  className="
                    h-4 w-4 text-blue-500
                    transition-transform duration-200
                    group-hover/phone:-translate-y-0.5
                    group-hover/phone:translate-x-0.5
                  "
                />
              </a>
            ))
          ) : (
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
              Aucun numéro disponible.
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const LoadingCard = ({ className = "" }) => (
  <div
    className={`
      animate-pulse
      rounded-[30px]
      border border-slate-200
      bg-white
      p-7
      ${className}
    `}
  >
    <div className="h-14 w-14 rounded-[20px] bg-slate-100" />

    <div className="mt-6 h-4 w-24 rounded-full bg-slate-100" />
    <div className="mt-3 h-7 w-52 rounded-xl bg-slate-100" />

    <div className="mt-7 h-14 rounded-[20px] bg-slate-100" />
    <div className="mt-2 h-14 rounded-[20px] bg-slate-100" />
  </div>
);

/* =========================================================
   Empty State
========================================================= */

const EmptyState = ({ children, className = "" }) => (
  <div
    className={`
      flex min-h-[180px] items-center justify-center
      rounded-[30px]
      border border-dashed border-slate-200
      bg-slate-50/70
      px-6
      text-center
      text-sm
      text-slate-400
      ${className}
    `}
  >
    {children}
  </div>
);

/* =========================================================
   Main Page
========================================================= */

const ContactSalesPage = () => {
  const [pageData, setPageData] = useState(FALLBACK_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logoSrc = FALLBACK_PAGE.logo || "./logo.svg";

  useEffect(() => {
    let mounted = true;

    const fetchPage = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getPageContent(SLUG);

        if (!mounted) return;

        setPageData(normalizePage(data));
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load page content.",
        );

        setPageData(FALLBACK_PAGE);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MainLayout bg="bg-[#F5F8FC]">
      <main className="relative rounded-3xl min-h-screen overflow-hidden font-mainFont text-slate-950">
        {/* =====================================================
            Background
        ====================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-16 h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-sky-200/25 blur-3xl" />

          <div className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-blue-100/30 blur-3xl" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.06),transparent_32%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          {/* ===================================================
              Navigation
          ==================================================== */}

          <div className="flex items-center justify-between">
            <GoBackButton
              className="
                rounded-full
                border border-white/70
                bg-white/60
                px-4
                py-2.5
                text-slate-700
                text-start
                backdrop-blur-xl
                shadow-xs
                hover:bg-white/80
              "
              text="Retour"
            />
          </div>

          {/* ===================================================
              Hero
          ==================================================== */}

          <section className="mx-auto max-w-4xl pb-16 pt-16 text-center sm:pb-20 sm:pt-20 lg:pt-24">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/80  p-2 shadow-xs">
              <img
                src={logoSrc}
                alt="San Water"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <h1 className="text-4xl font-mainFont font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              {loading ? "Chargement..." : pageData.mainTitle}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
              {loading ? "Récupération des informations..." : pageData.subTitle}
            </p>

            {/* Quick jump */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <a
                href="#offices"
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-white/80
                  bg-white/65
                  px-4 py-2.5
                  text-sm font-medium text-slate-700
                  backdrop-blur-xl
                  shadow-xs
                  transition
                  hover:border-blue-200
                  hover:bg-blue-50/70
                "
              >
                <Building2 className="h-4 w-4 text-blue-500" />
                Nos bureaux
              </a>

              <a
                href="#sales"
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-blue-600
                  px-4 py-2.5
                  text-sm font-semibold text-white
                  shadow-xs
                  transition
                  hover:bg-blue-700
                "
              >
                <Phone className="h-4 w-4" />
                Équipe commerciale
              </a>
            </div>
          </section>

          {error && (
            <div
              className="
                mb-10
                flex items-start gap-3
                rounded-[22px]
                border border-amber-200
                bg-amber-50
                px-5 py-4
                text-sm text-amber-800
              "
            >
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />

              <span>{error}</span>
            </div>
          )}

          <section id="inquiry" className="scroll-mt-10 pb-20">
            <div className="mx-auto max-w-4xl">
              <LeadCaptureForm />
            </div>
          </section>

          <section id="offices" className="scroll-mt-10 pb-20">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionEyebrow icon={<Building2 className="h-3 w-3" />}>
                  Présence
                </SectionEyebrow>

                <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                  Nos bureaux
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Retrouvez les coordonnées de nos équipes et l’adresse de
                  chaque bureau.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </div>
            ) : pageData.contactSections.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {pageData.contactSections.map((item, index) => (
                  <ContactCard
                    key={`${item.region || "section"}-${index}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState>Aucun bureau disponible.</EmptyState>
            )}
          </section>

          {/* ===================================================
              Sales
          ==================================================== */}

          <section
            id="sales"
            className="scroll-mt-10 border-t border-slate-200/70 pt-20"
          >
            <div className="mb-8">
              <SectionEyebrow icon={<Phone className="h-3 w-3" />}>
                Vente
              </SectionEyebrow>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Équipe commerciale
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Contactez directement nos équipes pour toute demande
                commerciale, distribution ou partenariat.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <LoadingCard />
                <LoadingCard />
              </div>
            ) : pageData.salesData.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {pageData.salesData.map((item, index) => (
                  <SalesCard
                    key={`${item.title || "sales"}-${index}`}
                    item={item}
                  />
                ))}
              </div>
            ) : (
              <EmptyState>
                Aucune information commerciale disponible.
              </EmptyState>
            )}
          </section>

          {/* ===================================================
              Bottom CTA
          ==================================================== */}

          <section className="pb-8 pt-20">
            <div
              className="
                relative overflow-hidden
                rounded-[34px]
                bg-blue-600
                px-6 py-10
                text-center
                text-white
                sm:px-10
                sm:py-14
              "
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

              <div className="relative mx-auto max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100">
                  Besoin d'aide ?
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Parlons de votre projet.
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Notre équipe est disponible pour vous orienter vers le bon
                  interlocuteur.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </MainLayout>
  );
};

export default ContactSalesPage;
