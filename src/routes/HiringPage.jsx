import React, { useEffect, useMemo, useState } from 'react';
import { contentAPI } from '@/services/baseAPIs';
import MainLayout from '@/layouts/MainLayout';
import {
  Search,
  MapPin,
  Briefcase,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Filter,
  Loader2,
  Star,
  Building2,
  BadgeCheck,
  Mail,
  Clock3,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

function getStatusMeta(t) {
  return {
    published: {
      label: t('hiring.open'),
      className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    },
    draft: {
      label: t('hiring.draft'),
      className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    },
    closed: {
      label: t('hiring.closed'),
      className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    },
  };
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function HiringPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const statusMeta = useMemo(() => getStatusMeta(t), [t]);

  const fetchJobs = async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      const response = await contentAPI.get('/hiring?status=published');
      setJobs(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const stats = useMemo(() => {
    const total = jobs.length;
    const locations = new Set(jobs.map((job) => job.location).filter(Boolean)).size;
    const types = new Set(jobs.map((job) => job.type).filter(Boolean)).size;
    const latest = jobs[0]?.publishDate || null;
    return { total, locations, types, latest };
  }, [jobs]);

  const locationOptions = useMemo(
    () => ['all', ...Array.from(new Set(jobs.map((job) => job.location).filter(Boolean)))],
    [jobs]
  );

  const typeOptions = useMemo(
    () => ['all', ...Array.from(new Set(jobs.map((job) => job.type).filter(Boolean)))],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    let data = jobs.filter((job) => {
      const matchesSearch =
        !term ||
        [job.title, job.location, job.type, job.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      const matchesLocation = locationFilter === 'all' ? true : job.location === locationFilter;
      const matchesType = typeFilter === 'all' ? true : job.type === typeFilter;
      return matchesSearch && matchesLocation && matchesType;
    });

    data = [...data].sort((a, b) => {
      if (sortBy === 'title') return String(a.title || '').localeCompare(String(b.title || ''));
      if (sortBy === 'location') return String(a.location || '').localeCompare(String(b.location || ''));
      if (sortBy === 'type') return String(a.type || '').localeCompare(String(b.type || ''));
      return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
    });

    return data;
  }, [jobs, search, locationFilter, typeFilter, sortBy]);

  const rolesCountText =
    filteredJobs.length === 1
      ? t('hiring.role_available', { count: filteredJobs.length })
      : t('hiring.roles_available', { count: filteredJobs.length });

  return (
    <MainLayout>
      <div className="relative font-mainFont overflow-hidden rounded-3xl bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.18),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_28%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <Sparkles size={16} /> {t('hiring.careers_at_sanwater')}
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t('hiring.hero_title')}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                {t('hiring.hero_description')}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#open-roles"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  {t('hiring.view_open_roles')} <ArrowRight size={16} />
                </a>

                <a
                  href="mailto:careers@sanwater.com"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Mail size={16} /> {t('hiring.contact_hiring_team')}
                </a>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <MetricCard title={t('hiring.open_roles')} value={stats.total} icon={<Briefcase size={18} />} />
                <MetricCard title={t('hiring.locations')} value={stats.locations} icon={<Building2 size={18} />} />
                <MetricCard title={t('hiring.role_types')} value={stats.types} icon={<BadgeCheck size={18} />} />
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-sm text-white/60">{t('hiring.next_step')}</p>
                    <p className="mt-1 text-xl font-semibold">{t('hiring.find_your_fit')}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-sm text-white/75">
                  <InfoRow
                    icon={<Search size={16} />}
                    label={t('hiring.search_label')}
                    text={t('hiring.search_text')}
                  />
                  <InfoRow
                    icon={<Filter size={16} />}
                    label={t('hiring.refine_label')}
                    text={t('hiring.refine_text')}
                  />
                  <InfoRow
                    icon={<Clock3 size={16} />}
                    label={t('hiring.updated_label')}
                    text={t('hiring.latest_post', { date: formatDate(stats.latest) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.6fr] xl:items-center">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('hiring.search_placeholder')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="all">{t('hiring.all_locations')}</option>
              {locationOptions.filter((item) => item !== 'all').map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>

            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">{t('hiring.all_types')}</option>
              {typeOptions.filter((item) => item !== 'all').map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>

            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">{t('hiring.newest')}</option>
              <option value="title">{t('hiring.title_az')}</option>
              <option value="location">{t('hiring.location_az')}</option>
              <option value="type">{t('hiring.type_az')}</option>
            </Select>

            <button
              type="button"
              onClick={() => fetchJobs(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Loader2 size={16} className={refreshing ? 'animate-spin' : ''} /> {t('hiring.refresh')}
            </button>
          </div>
        </div>

        <div id="open-roles" className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('hiring.open_positions')}</h2>
            <p className="mt-1 text-sm text-slate-600">{rolesCountText}</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
            <Star size={14} /> {t('hiring.new_roles_appear')}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600">
              <Loader2 size={18} className="animate-spin" /> {t('hiring.loading_opportunities')}
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState hasFilters={Boolean(search || locationFilter !== 'all' || typeFilter !== 'all')} t={t} />
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job, index) => {
              const meta = statusMeta[job.status] || statusMeta.published;

              return (
                <article
                  key={job._id}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                          {meta.label}
                        </span>

                        {index === 0 ? (
                          <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                            {t('hiring.featured')}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                        {job.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2"><MapPin size={15} /> {job.location}</span>
                        <span className="inline-flex items-center gap-2"><Briefcase size={15} /> {job.type}</span>
                        <span className="inline-flex items-center gap-2"><CalendarDays size={15} /> {formatDate(job.publishDate)}</span>
                      </div>

                      <p className="mt-5 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 lg:min-w-[220px] lg:items-end">
                      <a target='_blank' href="https://forms.gle/4X5SmWTqAqhQCWRH6">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          {t('hiring.apply_now')} <ArrowRight size={16} />
                        </button>
                      </a>
                      <p className="text-xs text-slate-500">{t('hiring.fast_response')}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 text-white/80">{icon}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mt-0.5 text-white/80">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-sm leading-6 text-white/65">{text}</p>
      </div>
    </div>
  );
}

function Select({ className = '', ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white ${className}`}
    />
  );
}

function EmptyState({ hasFilters, t }) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="rounded-full bg-slate-100 p-4 text-slate-700">
        <Briefcase size={28} />
      </div>

      <h3 className="mt-5 text-2xl font-bold text-slate-900">
        {hasFilters ? t('hiring.no_roles_match_search') : t('hiring.no_open_positions')}
      </h3>

      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
        {hasFilters
          ? t('hiring.no_roles_match_search_text')
          : t('hiring.no_open_positions_text')}
      </p>

      <a
        href="mailto:careers@sanwater.com"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Mail size={16} /> {t('hiring.send_cv_anyway')}
      </a>
    </div>
  );
}

export default HiringPage;