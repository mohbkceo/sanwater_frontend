import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { metricNames } from './labels';
import { rangeForDays } from './routing';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';
function valueOf(metric) { return typeof metric === 'object' && metric !== null ? metric.current : metric; }
function insightTitle(insight, tx) {
  if (insight.id === 'sales-overdue-followups') return tx('Follow-ups are overdue');
  if (insight.domain === 'products') { const at = insight.title.lastIndexOf(': '); if (at > 0) return `${insight.title.slice(0, at)}: ${tx(insight.title.slice(at + 2))}`; }
  for (const suffix of ['has views but no applications', 'has readers but no tracked actions']) if (insight.title.endsWith(suffix)) return `${insight.title.slice(0, -suffix.length)}${tx(suffix)}`;
  return tx(insight.title);
}
export function Panel({ title, children, action }) { const tx = useIntelligenceCopy(); return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">{tx(title)}</h2>{action}</div>{children}</section>; }
export function EmptyState({ children }) { const tx = useIntelligenceCopy(); return <p className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">{children ? tx(children) : tx('No data in this period.')}</p>; }
export function LoadingState() { const tx = useIntelligenceCopy(); return <div aria-label={tx('Loading analytics')} className="grid animate-pulse gap-3 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-100" />)}</div>; }
export function ErrorState({ retry }) { const tx = useIntelligenceCopy(); return <div role="alert" className="rounded-xl bg-rose-50 p-5 text-sm text-rose-900">{tx('This section could not be loaded.')} <button type="button" onClick={retry} className="ms-2 font-semibold underline">{tx('Retry')}</button></div>; }
export function MetricCard({ name, metric }) {
  const tx = useIntelligenceCopy();
  const value = valueOf(metric);
  const unavailable = metric && typeof metric === 'object' && metric.available === false;
  const formatted = unavailable || value == null ? tx('Unavailable') : typeof value === 'number' ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value) : String(value);
  const change = metric && typeof metric === 'object' ? metric.percentageChange : null;
  return <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">{tx(metricNames[name] || name)}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{formatted}</p>{unavailable && metric.reason && <p className="mt-2 text-xs text-amber-700">{tx(metric.reason)}</p>}{change != null && <p className="mt-2 text-xs text-slate-500">{change > 0 ? '+' : ''}{change.toFixed(1)}% {tx('vs previous period')}</p>}</article>;
}
export function KpiGrid({ data }) { return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(data || {}).map(([name, metric]) => <MetricCard key={name} name={name} metric={metric} />)}</div>; }
export function DateRange({ from, to, setRange }) {
  const tx = useIntelligenceCopy();
  const preset = days => setRange(rangeForDays(days));
  return <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap gap-2">{[[1, 'Today'], [7, '7 days'], [30, '30 days'], [90, '90 days']].map(([days, label]) => <button key={days} type="button" onClick={() => preset(days)} className="rounded-lg border px-3 py-2 text-xs hover:bg-slate-50">{tx(label)}</button>)}</div><label className="text-xs text-slate-600">{tx('From')}<input type="date" value={from} onChange={e => setRange({ from: e.target.value, to })} className="ms-2 rounded-lg border p-2" /></label><label className="text-xs text-slate-600">{tx('To')}<input type="date" value={to} onChange={e => setRange({ from, to: e.target.value })} className="ms-2 rounded-lg border p-2" /></label></div>;
}
export function DataQuality({ data }) { const tx = useIntelligenceCopy(); return data && <Panel title={tx('Data quality')}><dl className="grid gap-2 text-xs sm:grid-cols-2">{Object.entries(data).map(([key, value]) => <div key={key}><dt className="font-semibold text-slate-700">{tx(key.replace(/([A-Z])/g, ' $1'))}</dt><dd className="text-slate-500">{value?.available === false ? tx(value.reason) : value == null ? tx('Unavailable') : tx(String(value))}</dd></div>)}</dl></Panel>; }
export function InsightCard({ insight }) {
  const tx = useIntelligenceCopy();
  const { search } = useLocation();
  const [open, setOpen] = useState(false);
  return <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-semibold uppercase text-amber-700">{tx(insight.domain)} · {tx(insight.severity)}</p><h3 className="mt-2 font-semibold text-slate-900">{insightTitle(insight, tx)}</h3><p className="mt-2 text-sm text-slate-700">{tx(insight.explanation)}</p><div className="mt-3 flex flex-wrap gap-3 text-xs"><button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} className="font-semibold text-blue-700 underline">{open ? tx('Hide evidence') : tx('Show evidence')}</button><Link className="font-semibold text-blue-700 underline" to={`${insight.targetRoute}${search}`}>{tx('Inspect')}</Link></div>{open && <div className="mt-3 border-t border-amber-200 pt-3 text-xs"><dl>{Object.entries(insight.evidence || {}).map(([key, value]) => <div key={key} className="flex justify-between gap-3 py-1"><dt>{tx(key.replace(/([A-Z])/g, ' $1'))}</dt><dd className="font-semibold">{value == null ? tx('Unavailable') : String(value)}</dd></div>)}</dl><p className="mt-2">{tx(insight.recommendedInspection)}</p></div>}</article>;
}
export function InsightList({ insights }) { const tx = useIntelligenceCopy(); return insights?.length ? <div className="grid gap-3 md:grid-cols-2">{insights.map(item => <InsightCard key={item.id} insight={item} />)}</div> : <EmptyState>{tx('No findings meet the current evidence thresholds.')}</EmptyState>; }
export function SimpleTable({ columns, rows, onRow }) { const tx = useIntelligenceCopy(); return rows?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-start text-sm"><thead><tr className="border-b bg-slate-50">{columns.map(c => <th key={c.key} className="p-3 text-start text-xs text-slate-600">{tx(c.label)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || row.productId || index} className="border-b">{columns.map((c, columnIndex) => { const raw = c.render ? c.render(row) : String(row[c.key] ?? '—'); const value = typeof raw === 'string' ? tx(raw) : raw; return <td key={c.key} className="p-3 text-slate-800">{onRow && columnIndex === 0 ? <button type="button" onClick={() => onRow(row)} className="text-start font-semibold text-blue-700 underline hover:text-blue-900">{value}</button> : value}</td>; })}</tr>)}</tbody></table></div> : <EmptyState />; }
export function ActivityTimeline({ rows }) { const tx = useIntelligenceCopy(); return rows?.length ? <ol className="space-y-3">{rows.map(row => <li key={row._id} className="border-s-2 border-blue-200 ps-4"><p className="text-xs text-slate-500">{new Date(row.createdAt).toLocaleString()}</p><p className="text-sm font-medium text-slate-800">{row.userId?.fullName || tx('Admin')} · {row.details?.summary || row.eventName || row.action}</p>{row.details?.changes?.map((change, i) => <p key={i} className="text-xs text-slate-600">{change.label || change.field}: {String(change.before ?? '—')} → {String(change.after ?? '—')}</p>)}</li>)}</ol> : <EmptyState>{tx('No recorded admin changes in this period.')}</EmptyState>; }
