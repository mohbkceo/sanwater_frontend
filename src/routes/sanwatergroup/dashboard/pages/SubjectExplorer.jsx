import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchExplorer } from '@/services/analytics/analytics';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';
import { useReport } from '@/components/dashboard/intelligence/useReport';
import { ErrorState, LoadingState, Panel, SimpleTable } from '@/components/dashboard/intelligence/ui';
import { subjectRoute } from '@/components/dashboard/intelligence/routing';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';
const types = ['product', 'product_family', 'lead', 'quotation', 'hiring_position', 'application', 'article', 'campaign', 'admin_user'];
export default function SubjectExplorer() {
  const tx = useIntelligenceCopy();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const type = params.get('type') || 'product'; const search = params.get('search') || ''; const page = Number(params.get('page') || 1);
  const set = (key, value) => setParams(current => { const next = new URLSearchParams(current); value ? next.set(key, value) : next.delete(key); if (key !== 'page') next.delete('page'); return next; });
  const report = useReport(() => fetchExplorer({ type, search, page }), `${type}:${search}:${page}`);
  const rows = report.data?.rows?.map(row => ({ ...row, label: row.name || row.fullName || row.candidate?.fullName || row.title || row.productName || row._id, state: row.status || row.stage || '—' }));
  const resultTitle = [tx('Results'), report.data?.total || 0].join(' · ');
  return <main className="space-y-5 p-4 sm:p-6"><h1 className="text-3xl font-semibold">{tx('Subject explorer')}</h1><Panel title={tx('Search')}><div className="flex flex-wrap gap-3"><label className="text-xs">{tx('Type')}<select value={type} onChange={e => set('type', e.target.value)} className="ms-2 rounded-lg border p-2">{types.map(item => <option key={item} value={item}>{tx(item.replace(/_/g, ' '))}</option>)}</select></label><label className="text-xs">{tx('Search')}<input value={search} onChange={e => set('search', e.target.value)} className="ms-2 rounded-lg border p-2" /></label></div></Panel>{report.loading && !report.data ? <LoadingState /> : report.error && !report.data ? <ErrorState retry={report.retry} /> : <Panel title={resultTitle}><SimpleTable columns={[{ key: 'label', label: 'Subject' }, { key: 'state', label: 'Status' }]} rows={rows} onRow={row => navigate(subjectRoute(SANWATERGROUPROUTES.subjects.fullPath, type, row._id))} /><div className="mt-3 flex gap-2"><button type="button" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>{tx('Previous')}</button><span>{tx('Page')} {page}</span><button type="button" disabled={page * 20 >= (report.data?.total || 0)} onClick={() => set('page', String(page + 1))}>{tx('Next')}</button></div></Panel>}</main>;
}
