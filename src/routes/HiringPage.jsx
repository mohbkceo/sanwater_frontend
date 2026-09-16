import React, { useEffect, useMemo, useState } from "react";
import { contentAPI } from "@/services/baseAPIs";
import MainLayout from "@/layouts/MainLayout";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";

import { useTranslation } from "@/lib/i18n";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SPRING_DEFAULT, REDUCED_MOTION_TRANSITION } from "@/lib/springs";

function getStatusMeta(t) {
  return {
    published: {
      label: t("hiring.open"),
      className: "border-emerald-200/70 bg-emerald-50/80 text-emerald-700",
    },

    draft: {
      label: t("hiring.draft"),
      className: "border-amber-200/70 bg-amber-50/80 text-amber-700",
    },

    closed: {
      label: t("hiring.closed"),
      className: "border-black/[0.06] bg-black/[0.035] text-zinc-600",
    },
  };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function HiringPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [refreshing, setRefreshing] = useState(false);

  const [expandedJobs, setExpandedJobs] = useState(() => new Set());

  const { t } = useTranslation();

  const prefersReducedMotion = useReducedMotion();

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  const statusMeta = useMemo(() => getStatusMeta(t), [t]);

  const fetchJobs = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await contentAPI.get("/hiring?status=published");

      setJobs(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const locationOptions = useMemo(
    () => [
      "all",
      ...Array.from(new Set(jobs.map((job) => job.location).filter(Boolean))),
    ],
    [jobs],
  );

  const typeOptions = useMemo(
    () => [
      "all",
      ...Array.from(new Set(jobs.map((job) => job.type).filter(Boolean))),
    ],
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    let data = jobs.filter((job) => {
      const matchesSearch =
        !term ||
        [job.title, job.location, job.type, job.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesLocation =
        locationFilter === "all" || job.location === locationFilter;

      const matchesType = typeFilter === "all" || job.type === typeFilter;

      return matchesSearch && matchesLocation && matchesType;
    });

    data = [...data].sort((a, b) => {
      if (sortBy === "title") {
        return String(a.title || "").localeCompare(String(b.title || ""));
      }

      if (sortBy === "location") {
        return String(a.location || "").localeCompare(String(b.location || ""));
      }

      if (sortBy === "type") {
        return String(a.type || "").localeCompare(String(b.type || ""));
      }

      return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
    });

    return data;
  }, [jobs, search, locationFilter, typeFilter, sortBy]);

  const rolesCountText = t(
    filteredJobs.length === 1
      ? "hiring.role_available"
      : "hiring.roles_available",
    {
      count: filteredJobs.length,
    },
  );

  const toggleExpanded = (id) => {
    setExpandedJobs((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return (
    <MainLayout>
      <div
        className="
          relative
          overflow-hidden
          
          font-mainFont
          text-zinc-950
        "
      >
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              -left-[18%]
              -top-[10%]
              h-[520px]
              w-[520px]
              rounded-full
              
              blur-[140px]
            "
          />

          <div
            className="
              absolute
              -right-[16%]
              top-[5%]
              h-[480px]
              w-[480px]
              rounded-full
              bg-violet-200/15
              blur-[150px]
            "
          />
        </div>

        {/* ============================================================ */}
        {/* HERO                                                         */}
        {/* ============================================================ */}

        <section
          className="
            relative
            mx-auto
            max-w-7xl
            px-5
            pb-10
            pt-12

            sm:px-6
            sm:pt-16

            lg:px-8
            lg:pb-14
            lg:pt-20
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[32px]
              border
              border-black/[0.07]
              bg-white/68
              px-6
              py-9
              shadow-xs
              backdrop-blur-[28px]
              backdrop-saturate-150
              ring-1
              ring-inset
              ring-white/75

              sm:px-9
              sm:py-11

              lg:px-12
              lg:py-14
            "
          >
            {/* Glass highlight */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-12
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-white
                to-transparent
              "
            />

            <div className="relative max-w-3xl">
              <div
                className="
                  inline-flex
                  h-8
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-black/[0.06]
                  bg-white/65
                  px-3
                  text-[12px]
                  font-medium
                  text-zinc-500
                "
              >
                <Briefcase size={13} strokeWidth={1.8} />

                {t("hiring.careers_at_sanwater")}
              </div>

              <h1
                className="
                  mt-5
                  max-w-3xl
                  text-[36px]
                  font-semibold
                  leading-[1.05]
                  tracking-[-0.04em]
                  text-zinc-950

                  sm:text-[44px]

                  lg:text-[52px]
                "
              >
                {t("hiring.hero_title")}
              </h1>

              <p
                className="
                  mt-4
                  max-w-2xl
                  text-[15px]
                  leading-7
                  text-zinc-500

                  sm:text-[16px]
                "
              >
                {t("hiring.hero_description")}
              </p>

              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <a
                  href="#open-roles"
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-zinc-950
                    px-4
                    text-[13px]
                    font-semibold
                    text-white
                    shadow-xs
                    transition
                    duration-200

                    hover:bg-zinc-800

                    active:scale-[0.99]
                  "
                >
                  {t("hiring.view_open_roles")}

                  <ArrowRight size={14} strokeWidth={1.8} />
                </a>

                <a
                  href="mailto:hr@sanwater-dz.com"
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-black/[0.08]
                    bg-white/70
                    px-4
                    text-[13px]
                    font-medium
                    text-zinc-700
                    shadow-xs
                    transition

                    hover:bg-white
                    hover:text-zinc-950
                  "
                >
                  <Mail size={14} strokeWidth={1.8} />

                  {t("hiring.contact_hiring_team")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* ROLES                                                        */}
        {/* ============================================================ */}

        <section
          className="
            relative
            mx-auto
            max-w-7xl
            px-5
            pb-20

            sm:px-6

            lg:px-8
          "
        >
          {/* Filters */}
          <div
            className="
              mb-8
              rounded-[24px]
              border
              border-black/[0.07]
              bg-white/65
              p-3
              shadow-xs
              backdrop-blur-[24px]
              ring-1
              ring-inset
              ring-white/70

              sm:p-4
            "
          >
            <div
              className="
                grid
                gap-2.5

                md:grid-cols-2

                xl:grid-cols-[minmax(260px,1.5fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_44px]
              "
            >
              {/* Search */}
              <div className="relative">
                <Search
                  size={15}
                  strokeWidth={1.8}
                  className="
                    pointer-events-none
                    absolute
                    start-4
                    top-1/2
                    -translate-y-1/2
                    text-zinc-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("hiring.search_placeholder")}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-black/[0.08]
                    bg-white/75
                    pe-4
                    ps-10
                    text-[13px]
                    text-zinc-950
                    outline-none
                    transition-[border-color,background-color,box-shadow]
                    placeholder:text-zinc-400

                    hover:border-black/[0.13]
                    hover:bg-white

                    focus:border-black/20
                    focus:bg-white
                    focus:ring-4
                    focus:ring-black/[0.035]
                  "
                />
              </div>

              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="all">{t("hiring.all_locations")}</option>

                {locationOptions
                  .filter((item) => item !== "all")
                  .map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
              </Select>

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">{t("hiring.all_types")}</option>

                {typeOptions
                  .filter((item) => item !== "all")
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </Select>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">{t("hiring.newest")}</option>

                <option value="title">{t("hiring.title_az")}</option>

                <option value="location">{t("hiring.location_az")}</option>

                <option value="type">{t("hiring.type_az")}</option>
              </Select>

              {/* Refresh */}
              <button
                type="button"
                onClick={() => fetchJobs(true)}
                aria-label={t("hiring.refresh")}
                title={t("hiring.refresh")}
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-black/[0.08]
                  bg-white/75
                  text-zinc-500
                  shadow-xs
                  transition

                  hover:bg-white
                  hover:text-zinc-950

                  md:w-11
                "
              >
                <RefreshCw
                  size={15}
                  strokeWidth={1.8}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Section header */}
          <div
            id="open-roles"
            className="
              mb-5
              flex
              items-end
              justify-between
              gap-4
              px-1
            "
          >
            <div>
              <h2
                className="
                  text-[24px]
                  font-semibold
                  tracking-[-0.025em]
                  text-zinc-950
                "
              >
                {t("hiring.open_positions")}
              </h2>

              <p
                className="
                  mt-1
                  text-[13px]
                  text-zinc-500
                "
              >
                {rolesCountText}
              </p>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingState t={t} />
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              hasFilters={Boolean(
                search || locationFilter !== "all" || typeFilter !== "all",
              )}
              t={t}
            />
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job, index) => {
                const meta = statusMeta[job.status] || statusMeta.published;

                return (
                  <JobCard
                    key={job._id}
                    job={job}
                    meta={meta}
                    index={index}
                    expanded={expandedJobs.has(job._id)}
                    onToggle={() => toggleExpanded(job._id)}
                    t={t}
                    spring={spring}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

/* ========================================================================== */
/* JOB CARD                                                                   */
/* ========================================================================== */

function JobCard({
  job,
  meta,
  index,
  expanded,
  onToggle,
  t,
  spring,
  prefersReducedMotion,
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        ...spring,
        delay: prefersReducedMotion ? 0 : Math.min(index, 5) * 0.04,
      }}
      className="
        relative
        overflow-hidden
        rounded-[24px]
        border
        border-black/[0.07]
        bg-white/68
        shadow-xs
        backdrop-blur-xl
        transition
        duration-200

        hover:border-black/[0.10]
        hover:bg-white/80
      "
    >
      <div
        className="
          p-4

          sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5

            md:flex-row
            md:items-start
            md:justify-between
          "
        >
          <div className="min-w-0 flex-1">
            {/* Status + date */}
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <span
                className={`
                  inline-flex
                  items-center
                  rounded-lg
                  border
                  px-2.5
                  py-1
                  text-[11px]
                  font-medium

                  ${meta.className}
                `}
              >
                {meta.label}
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-[11px]
                  text-zinc-400
                "
              >
                <CalendarDays size={12} strokeWidth={1.7} />

                {formatDate(job.publishDate)}
              </span>
            </div>

            {/* Title */}
            <h3
              className="
                mt-3
                text-[20px]
                font-semibold
                leading-tight
                tracking-[-0.02em]
                text-zinc-950

                sm:text-[22px]
              "
            >
              {job.title}
            </h3>

            {/* Primary metadata */}
            <div
              className="
                mt-2.5
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-2
                text-[12px]
                text-zinc-500
              "
            >
              {job.location && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >
                  <MapPin size={13} strokeWidth={1.7} />

                  {job.location}
                </span>
              )}

              {job.type && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >
                  <Briefcase size={13} strokeWidth={1.7} />

                  {job.type}
                </span>
              )}
            </div>

            {/* Short preview only */}
            {job.description && (
              <p
                className={`
                  mt-3
                  whitespace-pre-line
                  text-[13px]
                  leading-6
                  text-zinc-500

                  ${expanded ? "hidden" : "line-clamp-2"}
                `}
              >
                {job.description}
              </p>
            )}

            {/* Expand */}
            {job.description && (
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className="
                  mt-3
                  inline-flex
                  h-8
                  items-center
                  gap-1.5
                  rounded-lg
                  px-2
                  text-[12px]
                  font-medium
                  text-zinc-500
                  transition

                  hover:bg-black/[0.035]
                  hover:text-zinc-950

                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-black/[0.04]
                "
              >
                {expanded ? (
                  <>
                    <ChevronUp size={13} />

                    {t("hiring.hide_details")}
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} />

                    {t("hiring.view_details")}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Apply */}
          <div
            className="
              shrink-0

              md:pt-1
            "
          >
            <a
              target="_blank"
              rel="noreferrer"
              href="https://forms.gle/4X5SmWTqAqhQCWRH6"
              className="
                inline-flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-zinc-950
                px-4
                text-[12px]
                font-semibold
                text-white
                shadow-xs
                transition
                duration-200

                hover:bg-zinc-800

                active:scale-[0.99]

                md:w-auto
              "
            >
              {t("hiring.apply_now")}

              <ArrowRight size={13} strokeWidth={1.8} />
            </a>
          </div>
        </div>

        {/* Full details */}
        <AnimatePresence initial={false}>
          {expanded && job.description && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.2,
              }}
              className="overflow-hidden"
            >
              <div
                className="
                    mt-4
                    border-t
                    border-black/[0.055]
                    pt-4
                  "
              >
                <div
                  className="
                      rounded-[18px]
                      border
                      border-black/[0.055]
                      bg-black/[0.025]
                      px-4
                      py-4
                    "
                >
                  <p
                    className="
                        whitespace-pre-wrap
                        text-[13px]
                        leading-7
                        text-zinc-600
                      "
                  >
                    {job.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

/* ========================================================================== */
/* SELECT                                                                     */
/* ========================================================================== */

function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={`
        h-11
        w-full
        rounded-xl
        border
        border-black/[0.08]
        bg-white/75
        px-3.5
        text-[13px]
        font-medium
        text-zinc-700
        outline-none
        transition-[border-color,background-color,box-shadow]

        hover:border-black/[0.13]
        hover:bg-white

        focus:border-black/20
        focus:bg-white
        focus:ring-4
        focus:ring-black/[0.035]

        ${className}
      `}
    />
  );
}

/* ========================================================================== */
/* LOADING                                                                    */
/* ========================================================================== */

function LoadingState({ t }) {
  return (
    <div
      className="
        flex
        min-h-[260px]
        items-center
        justify-center
        rounded-[24px]
        border
        border-black/[0.07]
        bg-white/60
        shadow-xs
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          items-center
          gap-2.5
          text-[13px]
          text-zinc-500
        "
      >
        <Loader2 size={16} className="animate-spin" />

        {t("hiring.loading_opportunities")}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* EMPTY STATE                                                                */
/* ========================================================================== */

function EmptyState({ hasFilters, t }) {
  return (
    <div
      className="
        flex
        min-h-[300px]
        flex-col
        items-center
        justify-center
        rounded-[26px]
        border
        border-black/[0.07]
        bg-white/65
        px-6
        py-12
        text-center
        shadow-xs
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-[16px]
          border
          border-black/[0.06]
          bg-black/[0.025]
          text-zinc-500
        "
      >
        <Briefcase size={20} strokeWidth={1.7} />
      </div>

      <h3
        className="
          mt-4
          text-[19px]
          font-semibold
          tracking-[-0.02em]
          text-zinc-950
        "
      >
        {hasFilters
          ? t("hiring.no_roles_match_search")
          : t("hiring.no_open_positions")}
      </h3>

      <p
        className="
          mt-2
          max-w-md
          text-[13px]
          leading-6
          text-zinc-500
        "
      >
        {hasFilters
          ? t("hiring.no_roles_match_search_text")
          : t("hiring.no_open_positions_text")}
      </p>

      <a
        href="mailto:hr@sanwater-dz.com"
        className="
          mt-5
          inline-flex
          h-10
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-zinc-950
          px-4
          text-[12px]
          font-semibold
          text-white
          shadow-xs
          transition

          hover:bg-zinc-800
        "
      >
        <Mail size={13} strokeWidth={1.8} />

        {t("hiring.send_cv_anyway")}
      </a>
    </div>
  );
}

export default HiringPage;
