import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchDomain } from '@/services/analytics/analytics';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';
import { useAnalyticsRange, useReport } from '@/components/dashboard/intelligence/useReport';
import { DataQuality, DateRange, EmptyState, ErrorState, KpiGrid, LoadingState, Panel, SimpleTable } from '@/components/dashboard/intelligence/ui';
import { domainNames } from '@/components/dashboard/intelligence/labels';
import DomainChart from '@/components/dashboard/intelligence/DomainChart';
import { subjectRoute } from '@/components/dashboard/intelligence/routing';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';

const number = value => value == null ? '—' : new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value);
const columns = {
  products: [{ key: 'product', label: 'Product' }, { key: 'uniqueViews', label: 'Viewers' }, { key: 'salesIntent', label: 'Sales intent' }, { key: 'qualifiedLeads', label: 'Qualified' }, { key: 'orders', label: 'Won deals' }, { key: 'orderConversionRate', label: 'Conversion %', render: r => number(r.orderConversionRate) }, { key: 'revenue', label: 'Revenue', render: r => number(r.revenue) }, { key: 'trend', label: 'Revenue trend', render: r => r.trend.percentageChange == null ? 'New / unavailable' : `${number(r.trend.percentageChange)}%` }, { key: 'classification', label: 'Classification' }],
  marketing: [{ key: 'channel', label: 'Channel' }, { key: 'source', label: 'Source' }, { key: 'campaign', label: 'Campaign' }, { key: 'creative', label: 'Creative' }, { key: 'landingPage', label: 'Landing' }, { key: 'device', label: 'Device' }, { key: 'visitors', label: 'Visitors' }],
  hiring: [{ key: 'title', label: 'Position' }, { key: 'views', label: 'Views' }, { key: 'applyClicks', label: 'Apply clicks' }, { key: 'applications', label: 'Applications' }, { key: 'applyRate', label: 'Application rate %', render: r => number(r.applyRate) }],
  content: [{ key: 'title', label: 'Article' }, { key: 'readers', label: 'Readers' }, { key: 'readingProgress', label: 'Reading progress %', render: r => number(r.readingProgress) }, { key: 'productClicks', label: 'Product clicks' }, { key: 'productCtr', label: 'Product CTR %', render: r => number(r.productCtr) }, { key: 'contactClicks', label: 'Contact clicks' }, { key: 'classification', label: 'Classification' }],
  sales: [{ key: 'reason', label: 'Loss reason' }, { key: 'count', label: 'Leads' }],
  operations: [{ key: 'status', label: 'Quotation status' }, { key: 'count', label: 'Count' }],
};
export default function IntelligenceDomain() {
  const tx = useIntelligenceCopy();
  const { domain } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { from, to, setRange } = useAnalyticsRange();
  const report = useReport(() => fetchDomain(domain, { from, to }), `${domain}:${from}:${to}`);
  const data = report.data;
  const rows = domain === 'marketing' ? data?.campaigns : domain === 'sales' ? data?.lossReasons : domain === 'operations' ? data?.quoteStatuses : data?.rows;
  const onRow = ['products', 'hiring', 'content'].includes(domain) ? row => {
    const type = { products: 'product', hiring: 'hiring_position', content: 'article' }[domain];
    navigate(subjectRoute(SANWATERGROUPROUTES.subjects.fullPath, type, row.productId || row.id, search));
  } : null;
  return <main className="min-w-0 space-y-5 p-4 sm:p-6"><header><p className="text-xs font-semibold uppercase text-blue-700">{tx('Domain analytics')}</p><h1 className="text-3xl font-semibold text-slate-950">{tx(domainNames[domain] || domain)}</h1><p className="mt-2 text-sm text-slate-500">{tx('UTC reporting · immediately preceding equivalent period for comparisons')}</p></header>
    <DateRange from={from} to={to} setRange={setRange} />
    {report.loading && !data ? <LoadingState /> : report.error && !data ? <ErrorState retry={report.retry} /> : data && <><KpiGrid data={data.kpis} />
      <Panel title={tx('Performance chart')}><DomainChart domain={domain} report={data} /></Panel>
      {domain === 'marketing' && <Panel title={tx('Commercial funnel')}>{data.funnel?.stages?.length ? <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{data.funnel.stages.map(stage => <li key={stage.key} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{tx(stage.name)}</p><p className="mt-1 text-xl font-semibold">{number(stage.current)}</p><p className="text-xs text-slate-500">{stage.conversionRate == null ? tx('Unavailable') : `${number(stage.conversionRate)}% ${tx('from prior stage')}`}</p></li>)}</ol> : <EmptyState />}{data.funnel?.biggestLeak && <p className="mt-3 text-xs text-amber-800">{tx('Largest observed stage drop:')} {tx(data.funnel.biggestLeak.from)} → {tx(data.funnel.biggestLeak.to)} ({data.funnel.biggestLeak.lostEntities} {tx('entities). This is descriptive, not a causal finding.')}</p>}</Panel>}
      {domain === 'hiring' && <Panel title={tx('Hiring progression')}><KpiGrid data={data.rates} /></Panel>}
      <Panel title={tx(({ products: 'Product performance', marketing: 'Campaigns', hiring: 'Position performance', content: 'Article performance', sales: 'Loss reasons', operations: 'Quotation status' }[domain] || 'Details'))}><SimpleTable columns={columns[domain] || []} rows={rows} onRow={onRow} /></Panel>
      {domain === 'marketing' && <Panel title={tx('Source quality')}><SimpleTable columns={[{ key: 'source', label: 'Source' }, { key: 'visitors', label: 'Visitors' }, { key: 'qualifiedLeads', label: 'Qualified leads' }, { key: 'wonDeals', label: 'Won deals' }, { key: 'revenue', label: 'Revenue', render: r => number(r.revenue) }, { key: 'visitorToQualifiedRate', label: 'Qualified leads / visitors', render: r => r.available ? `${number(r.visitorToQualifiedRate)}%` : tx('Insufficient data') }]} rows={data.sourceQuality} /></Panel>}
      <DataQuality data={data.dataQuality} />
    </>}
  </main>;
}
