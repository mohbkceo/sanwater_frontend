import React from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '@/services/analytics/analytics';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';
import { useAnalyticsRange, useReport } from '@/components/dashboard/intelligence/useReport';
import { ActivityTimeline, DateRange, EmptyState, ErrorState, InsightList, KpiGrid, LoadingState, Panel } from '@/components/dashboard/intelligence/ui';
import { domainNames } from '@/components/dashboard/intelligence/labels';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';

export default function Analytics() {
  const tx = useIntelligenceCopy();
  const { from, to, setRange } = useAnalyticsRange();
  const report = useReport(() => fetchDashboard({ from, to }), `${from}:${to}`);
  const data = report.data;
  const filters = new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) });
  const filterSearch = filters.size ? `?${filters}` : '';
  return <main className="min-w-0 space-y-5 p-4 sm:p-6">
    <header><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">{tx('Decision intelligence')}</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">{tx('My dashboard')}</h1><p className="mt-2 text-sm text-slate-500">{tx('Business performance and work needing attention · UTC reporting')}</p></header>
    <DateRange from={from} to={to} setRange={setRange} />
    {report.loading && !data ? <LoadingState /> : report.error && !data ? <ErrorState retry={report.retry} /> : data && <>
      <Panel title={tx('Needs attention')} action={<Link className="text-sm font-semibold text-blue-700" to={`${SANWATERGROUPROUTES.attention.fullPath}${filterSearch}`}>{tx('View all')}</Link>}><InsightList insights={data.attention} /></Panel>
      {data.visibleDomains?.length ? data.visibleDomains.map(domain => <Panel key={domain} title={tx(domainNames[domain] || domain)} action={<Link className="text-sm font-semibold text-blue-700" to={`${SANWATERGROUPROUTES.analytics.fullPath}/${domain}${filterSearch}`}>{tx('Open report')}</Link>}>
        {data.sections[domain]?.available === false ? <EmptyState>{data.sections[domain].reason}</EmptyState> : <KpiGrid data={data.sections[domain]?.kpis} />}
      </Panel>) : <EmptyState>{tx('No analytics domains are assigned to this account.')}</EmptyState>}
      {data.importantChanges?.length > 0 && <Panel title={tx('Important changes')}><ActivityTimeline rows={data.importantChanges} /></Panel>}
    </>}
  </main>;
}
