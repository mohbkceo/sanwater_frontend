import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Clock3,
  Gauge,
  MousePointer2,
  RefreshCw,
  Route,
  Users,
  Workflow,
} from 'lucide-react';
import { useFetchAnalytics } from '@/hooks/useAnalytics';
import DateFilter from '@/components/dashboard/analytics/DateFilter';

const COLORS = ['#0f766e', '#0369a1', '#7c3aed', '#c2410c', '#be123c', '#64748b'];

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

function formatDuration(milliseconds) {
  const seconds = Math.round(Number(milliseconds || 0) / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function percent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function StatCard({ label, value, description, icon: StatIcon, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 bg-slate-50 text-slate-900',
    teal: 'border-teal-200 bg-teal-50 text-teal-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-70">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-sm opacity-70">{description}</p>
        </div>
        <div className="rounded-xl bg-white/75 p-3 shadow-sm">{StatIcon ? <StatIcon className="h-5 w-5" /> : null}</div>
      </div>
    </article>
  );
}

function Section({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <p className="py-8 text-center text-sm text-slate-500">{children}</p>;
}

function Analytics() {
  const [filters, setFilters] = useState({});
  const { data, loading, load } = useFetchAnalytics(filters);

  const trend = useMemo(() => (data?.trend || []).map((item) => ({
    date: item.date,
    pageViews: item.pageViews || 0,
    sessions: item.sessions || 0,
    errors: item.errors || 0,
  })), [data]);
  const sources = data?.sources || [];
  const funnels = data?.funnels || [];
  const productFunnel = funnels.find((funnel) => funnel.name === 'Product discovery');
  const insights = data?.insights || [];
  const anomalies = data?.anomalies || [];

  return (
    <main className="min-h-full bg-slate-50 p-4 md:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-100 p-2.5 text-teal-700"><Activity className="h-6 w-6" /></div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Behavior analytics</h1>
                <p className="mt-1 text-sm text-slate-500">Product usage, journey completion, engagement, and technical reliability.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <DateFilter filters={filters} setFilters={setFilters} />
            <button
              type="button"
              onClick={load}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Unique visitors" value={formatNumber(data?.uniqueVisitors)} description="Anonymous and identified people" icon={Users} tone="teal" />
          <StatCard label="Sessions" value={formatNumber(data?.uniqueSessions)} description={`${formatNumber(data?.traffic)} total page views`} icon={Route} tone="sky" />
          <StatCard label="Engagement" value={formatDuration(data?.engagement?.averageSessionDurationMs)} description={`${Number(data?.engagement?.averagePagesPerSession || 0).toFixed(2)} pages per session`} icon={Clock3} tone="slate" />
          <StatCard label="Behavioral health" value={`${data?.engagement?.averageBehavioralHealthScore || 0}/100`} description={`${percent(data?.engagement?.bounceRate)} single-page sessions`} icon={Gauge} tone="amber" />
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <Section title="Traffic and reliability trend" description="Page views, sessions, and client/API errors by day." className="xl:col-span-3">
            {trend.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pageViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} /><stop offset="95%" stopColor="#0f766e" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="pageViews" name="Page views" stroke="#0f766e" fill="url(#pageViews)" strokeWidth={2} />
                    <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#0369a1" fill="transparent" strokeWidth={2} />
                    <Area type="monotone" dataKey="errors" name="Errors" stroke="#be123c" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty>No events in the selected period yet.</Empty>}
          </Section>

          <Section title="Acquisition attribution" description="Last-touch source, medium, and campaign context." className="xl:col-span-2">
            {sources.length ? (
              <div className="space-y-3">
                {sources.slice(0, 7).map((source) => (
                  <div key={`${source.source}-${source.medium}-${source.campaign}`} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{source.source || 'direct'}</p><p className="truncate text-xs text-slate-500">{[source.medium, source.campaign].filter(Boolean).join(' · ') || 'Unattributed'}</p></div>
                    <strong className="text-sm text-slate-900">{formatNumber(source.count)}</strong>
                  </div>
                ))}
              </div>
            ) : <Empty>Attribution will appear after tracked visits.</Empty>}
          </Section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Section title="Product discovery funnel" description="Real progression from landing views to contact submissions." className="xl:col-span-2">
            {productFunnel?.steps?.length ? (
              <div className="space-y-4">
                {productFunnel.steps.map((step, index) => (
                  <div key={step.event}>
                    <div className="mb-1.5 flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-800">{index + 1}. {step.label}</span><span className="text-slate-500">{formatNumber(step.count)} people {index ? `· ${percent(step.conversionRate)} continuation` : ''}</span></div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.min(100, productFunnel.steps[0].count ? (step.count / productFunnel.steps[0].count) * 100 : 0)}%` }} /></div>
                    {index ? <p className="mt-1 text-xs text-slate-500">{formatNumber(step.abandonment)} did not continue from the prior step.</p> : null}
                  </div>
                ))}
              </div>
            ) : <Empty>Funnel data will populate from product and contact workflows.</Empty>}
          </Section>

          <Section title="Feature adoption" description="Features opened and actions completed across the application.">
            {data?.featureUsage?.length ? (
              <div className="space-y-3">
                {data.featureUsage.slice(0, 7).map((feature) => <div key={feature.feature} className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{feature.feature}</p><p className="text-xs text-slate-500">{formatNumber(feature.events)} events</p></div><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">{formatNumber(feature.uniqueVisitors)} users</span></div>)}
              </div>
            ) : <Empty>Feature usage will appear after tracked interactions.</Empty>}
          </Section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Section title="Retention cohorts" description="Visitors grouped by their first observed activity date." className="xl:col-span-2">
            {data?.cohorts?.length ? (
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">First activity</th><th className="px-3 py-3">Visitors</th><th className="px-3 py-3">Returned after day 1</th><th className="px-3 py-3">Returned after day 7</th><th className="px-3 py-3">Returned after day 30</th></tr></thead><tbody>{data.cohorts.map((cohort) => <tr key={cohort.cohort} className="border-b border-slate-100"><td className="px-3 py-3 font-medium text-slate-800">{cohort.cohort}</td><td className="px-3 py-3">{formatNumber(cohort.users)}</td><td className="px-3 py-3">{percent(cohort.day1Rate)}</td><td className="px-3 py-3">{percent(cohort.day7Rate)}</td><td className="px-3 py-3">{percent(cohort.day30Rate)}</td></tr>)}</tbody></table></div>
            ) : <Empty>Retention requires activity across multiple dates.</Empty>}
          </Section>
          <Section title="Technical performance" description="Client-observed route timing and web-vital distributions.">
            <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">P50</p><p className="mt-1 font-semibold">{formatDuration(data?.performance?.routeTiming?.p50)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">P75</p><p className="mt-1 font-semibold">{formatDuration(data?.performance?.routeTiming?.p75)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">P95</p><p className="mt-1 font-semibold">{formatDuration(data?.performance?.routeTiming?.p95)}</p></div></div>
            <div className="mt-4 space-y-2">{(data?.performance?.webVitals || []).map((vital) => <div key={vital.metric} className="flex justify-between text-sm"><span className="text-slate-600">{vital.metric} ({vital.samples})</span><strong>{Math.round(vital.p95)}</strong></div>)}</div>
            <p className="mt-4 text-sm text-slate-500">{formatNumber(data?.engagement?.errorCount)} errors captured in the selected period.</p>
          </Section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Section title="Data-backed insights" description="Automatically generated from collected behavioral observations.">
            {insights.length ? <div className="space-y-3">{insights.map((insight, index) => <div key={`${insight.type}-${index}`} className="flex gap-3 rounded-xl border border-slate-200 p-3"><MousePointer2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" /><p className="text-sm leading-6 text-slate-700">{insight.message}</p></div>)}</div> : <Empty>Insights will appear once sufficient activity has been collected.</Empty>}
          </Section>
          <Section title="Anomaly detection" description="Unusual daily movement against the recent baseline.">
            {anomalies.length ? <div className="space-y-3">{anomalies.map((anomaly) => <div key={`${anomaly.metric}-${anomaly.date}`} className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-3"><div className="flex gap-3"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" /><div><p className="text-sm font-medium text-amber-950">{anomaly.metric}: {anomaly.direction}</p><p className="text-xs text-amber-800">{anomaly.date} · observed {formatNumber(anomaly.observed)} vs baseline {formatNumber(anomaly.baseline)}</p></div></div><span className="text-xs font-semibold uppercase text-amber-800">{anomaly.severity}</span></div>)}</div> : <Empty>No statistically unusual activity detected.</Empty>}
          </Section>
        </div>
      </div>
    </main>
  );
}

export default Analytics;
