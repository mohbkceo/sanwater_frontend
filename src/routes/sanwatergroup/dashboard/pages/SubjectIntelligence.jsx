import React from 'react';
import { useParams } from 'react-router-dom';
import { fetchSubject } from '@/services/analytics/analytics';
import { useAnalyticsRange, useReport } from '@/components/dashboard/intelligence/useReport';
import { ActivityTimeline, DataQuality, DateRange, EmptyState, ErrorState, KpiGrid, LoadingState, Panel, SimpleTable } from '@/components/dashboard/intelligence/ui';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';

function ProductPerformance({ performance }) {
  const tx = useIntelligenceCopy();
  const metrics = {
    uniqueViewers: { current: performance.uniqueViews, ...performance.viewTrend },
    inquiries: { current: performance.salesIntent },
    qualifiedLeads: { current: performance.qualifiedLeads },
    wonDeals: { current: performance.orders },
    revenue: { current: performance.revenue, ...performance.trend },
  };
  return <div className="space-y-4"><KpiGrid data={metrics} /><div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold">{tx('Classification')}: {tx(performance.classification)}</p>{performance.reason && <p className="mt-1 text-slate-600">{tx(performance.reason)}</p>}{performance.recommendedAction && <p className="mt-2 text-slate-700">{tx(performance.recommendedAction)}</p>}</div></div>;
}

export default function SubjectIntelligence() {
  const tx = useIntelligenceCopy();
  const { type, id } = useParams();
  const { from, to, setRange } = useAnalyticsRange();
  const report = useReport(() => fetchSubject(type, id, { from, to }), `${type}:${id}:${from}:${to}`);
  const data = report.data;
  return <main className="space-y-5 p-4 sm:p-6">
    <header><p className="text-xs font-semibold uppercase text-blue-700">{tx('Subject intelligence')}</p><h1 className="text-3xl font-semibold">{data?.performance?.product || data?.performance?.title || tx(type.replace(/_/g, ' '))}</h1><p className="mt-1 text-xs text-slate-500">{id}</p></header>
    <DateRange from={from} to={to} setRange={setRange} />
    {report.loading && !data ? <LoadingState /> : report.error && !data ? <ErrorState retry={report.retry} /> : data && <>
      <Panel title={tx('Performance')}>{data.performance ? type === 'product' ? <ProductPerformance performance={data.performance} /> : <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(data.performance).filter(([, value]) => ['string', 'number'].includes(typeof value)).map(([key, value]) => <div key={key}><dt className="text-xs text-slate-500">{tx(key.replace(/([A-Z])/g, ' $1'))}</dt><dd className="font-semibold">{value == null ? tx('Unavailable') : tx(value)}</dd></div>)}</dl> : <EmptyState>{tx('Performance metrics are unavailable for this subject type.')}</EmptyState>}</Panel>
      {data.funnel && <Panel title={tx('Observed stages')}><ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.funnel.map(stage => <li key={stage.name} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{tx(stage.name)}</p><p className="mt-2 text-xl font-semibold">{stage.count}</p></li>)}</ol><p className="mt-3 text-xs text-amber-800">{tx('These counts are not a verified person-level cohort.')}</p></Panel>}
      {data.acquisition && <Panel title={tx('Acquisition')}><SimpleTable columns={[{ key: 'channel', label: 'Channel' }, { key: 'source', label: 'Source' }, { key: 'campaign', label: 'Campaign' }, { key: 'landingPage', label: 'Landing' }, { key: 'device', label: 'Device' }, { key: 'visitors', label: 'Visitors' }]} rows={data.acquisition} /></Panel>}
      <Panel title={tx('Tracked journey')}>{data.journey?.length ? <ol className="mb-4 space-y-2 border-s-2 border-blue-100 ps-4 text-sm">{data.journey.map((row, index) => <li key={index}>{tx(row.name)} · {new Date(row.at).toLocaleString()}</li>)}</ol> : null}{data.events?.length ? <ul className="space-y-2 text-sm">{data.events.map(row => <li key={row.name} className="flex justify-between border-b py-2"><span>{tx(row.name.replace(/_/g, ' '))}</span><strong>{row.count}</strong></li>)}</ul> : <EmptyState>{tx('No tracked events in this period.')}</EmptyState>}</Panel>
      <Panel title={tx('Admin changes')}>{data.activityAvailable === false ? <EmptyState>{tx('Activity history requires the Activity Logs permission.')}</EmptyState> : <ActivityTimeline rows={data.activity} />}</Panel>
      <DataQuality data={data.dataQuality} />
    </>}
  </main>;
}
