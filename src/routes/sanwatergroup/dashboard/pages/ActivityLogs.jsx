import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { analyticsAPI } from '@/services/baseAPIs';
import { Header } from '@/components';
import { useTranslation } from '@/lib/i18n';

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'MOVE', 'LOGIN', 'SECURITY'];
const actionTone = {
  CREATE: 'bg-green-100 text-green-800', UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800', MOVE: 'bg-violet-100 text-violet-800',
  LOGIN: 'bg-amber-100 text-amber-800', SECURITY: 'bg-orange-100 text-orange-800',
};

function normalizeAction(action = '') {
  const value = String(action).toUpperCase();
  if (ACTIONS.includes(value)) return value;
  if (/MOVE|ASSIGN|REMOVE|TRANSFER/.test(value)) return 'MOVE';
  if (/LOGIN|SIGN.?IN|LOGOUT/.test(value)) return 'LOGIN';
  if (/SECURITY|PASSWORD|PERMISSION|AUTH/.test(value)) return 'SECURITY';
  if (/DELETE|ARCHIVE/.test(value)) return 'DELETE';
  return /CREATE/.test(value) ? 'CREATE' : 'UPDATE';
}

function displayValue(value, t) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? t('admin.common.yes') : t('admin.common.no');
  if (Array.isArray(value)) {
    if (value.length === 0) return t('admin.common.none');
    const strings = value.map((item) => typeof item === 'object' ? item.name || item.title || item.label || item._id || item.id || t('admin.common.item') : String(item));
    return strings.length > 4 ? t('admin.activity.values_more', { values: strings.slice(0, 4).join(', '), count: strings.length - 4 }) : strings.join(', ');
  }
  if (typeof value === 'object') {
    const name = value.name || value.title || value.fullName || value.email;
    if (name) return name;
    if (value._id || value.id) return String(value._id || value.id);
    return Object.entries(value).map(([key, item]) => t('admin.activity.field_value', { field: key, value: displayValue(item, t) })).join(', ');
  }
  return String(value);
}

function formatChange(change, t) {
  const field = String(change.field || '').toLowerCase();
  if (field.includes('gallery') && Array.isArray(change.before) && Array.isArray(change.after)) {
    const delta = change.after.length - change.before.length;
    return delta === 0 ? t('admin.activity.images_updated', { count: change.before.length }) : t(Math.abs(delta) === 1 ? 'admin.activity.image_change' : 'admin.activity.images_change', { count: delta > 0 ? `+${delta}` : delta });
  }
  return t('admin.activity.value_change', { before: displayValue(change.before, t), after: displayValue(change.after, t) });
}

function getChanges(log) {
  if (Array.isArray(log.details?.changes) && log.details.changes.length) return log.details.changes.filter((change) => !/password|token|secret|cookie|authkey|authorization/i.test(change.field || ''));
  const details = log.details || {};
  const excluded = new Set(['summary', 'entity', 'changedFields', 'changes', 'action', 'fields', 'updatedFields']);
  return Object.entries(details)
    .filter(([key, value]) => !excluded.has(key) && !/password|token|secret|cookie|authkey/i.test(key) && value !== undefined)
    .map(([field, after]) => ({ field, label: field.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()), before: undefined, after }));
}

function entityName(log) {
  const entity = log.details?.entity || {};
  return entity.name || entity.title || entity.fullName || entity.email || log.details?.name || log.details?.title || log.targetId || '—';
}

function ActivityLogs() {
  const { lang, t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [filters, setFilters] = useState({ userId: '', action: '', target: '', from: '', to: '', search: '' });

  const params = useMemo(() => Object.fromEntries(Object.entries({ page, limit: 20, ...filters }).filter(([, value]) => value !== '')), [page, filters]);
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await analyticsAPI.get('/logs', { params });
      const data = response.data.data;
      setLogs(data.logs || []);
      setPagination({ totalPages: data.totalPages || 1, totalItems: data.totalItems ?? data.logs?.length ?? 0 });
      if (data.admins) setAdmins(data.admins);
      if (data.resources) setResources(data.resources);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || t('admin.activity.empty'));
    } finally {
      setLoading(false);
    }
  }, [params, t]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  const updateFilter = (key, value) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };

  return (
    <div className="flex flex-col gap-6">
      <Header title={t('admin.activity.title')} />
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm" aria-label={t('admin.activity.title')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-medium text-gray-600">{t('admin.activity.admin')}
            <select value={filters.userId} onChange={(event) => updateFilter('userId', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <option value="">{t('admin.common.all_admins')}</option>{admins.map((admin) => <option key={admin._id} value={admin._id}>{admin.fullName || admin.email}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">{t('admin.activity.action')}
            <select value={filters.action} onChange={(event) => updateFilter('action', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <option value="">{t('admin.common.all_actions')}</option>{ACTIONS.map((action) => <option key={action}>{action}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">{t('admin.activity.target')}
            <select value={filters.target} onChange={(event) => updateFilter('target', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <option value="">{t('admin.common.all_resources')}</option>{resources.map((target) => <option key={target}>{target}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">{t('admin.analytics.from')}
            <input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-gray-600">{t('admin.analytics.to')}
            <input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="mt-3 block text-xs font-medium text-gray-600">{t('admin.common.search')}
          <input type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder={t('admin.activity.description')} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </label>
      </section>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {error && <div role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              {[t('admin.activity.admin'), t('admin.activity.action'), t('admin.activity.target'), t('admin.activity.activity'), t('admin.activity.changes'), t('admin.common.date'), t('admin.common.view')].map((heading) => <th key={heading} className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">{heading}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">{t('admin.activity.loading')}</td></tr>
                : logs.length === 0 ? <tr><td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">{t('admin.activity.empty')}</td></tr>
                  : logs.map((log) => {
                    const changes = getChanges(log);
                    return <tr key={log._id} onClick={() => setSelected(log)} className="cursor-pointer transition-colors hover:bg-gray-50" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') setSelected(log); }}>
                      <td className="px-4 py-3"><div className="font-medium text-gray-900">{log.userId?.fullName || log.details?.entity?.name || t('admin.activity.admin')}</div><div className="text-xs text-gray-500">{log.userId?.email || ''}</div></td>
                      <td className="whitespace-nowrap px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actionTone[normalizeAction(log.action)]}`}>{t(`admin.activity.action_${normalizeAction(log.action).toLowerCase()}`)}</span></td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{log.target || '—'}</td>
                      <td className="max-w-xs px-4 py-3 text-sm text-gray-700"><div className="truncate font-medium">{entityName(log)}</div><div className="truncate text-xs text-gray-500">{log.details?.summary || `${log.action} ${log.target}`}</div></td>
                      <td className="max-w-xs px-4 py-3 text-sm text-gray-600">{changes.length ? <span className="line-clamp-2">{changes.slice(0, 2).map((change) => `${t("admin.activity.field_value", { field: change.label || change.field, value: formatChange(change, t) })}`).join(' · ')}{changes.length > 2 ? t("admin.activity.more_changes", { count: changes.length - 2 }) : ''}</span> : '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString(lang) : '—'}</td>
                      <td className="px-4 py-3"><button type="button" onClick={(event) => { event.stopPropagation(); setSelected(log); }} className="text-sm font-semibold text-blue-700 hover:text-blue-900">{t('admin.common.view')}</button></td>
                    </tr>;
                  })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
          <span>{t('admin.activity.record_count', { count: pagination.totalItems })}</span>
          <div className="flex items-center gap-3"><span>{page} / {pagination.totalPages}</span>
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-40">{t('admin.common.previous')}</button>
            <button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-40">{t('admin.common.next')}</button>
          </div>
        </div>
      </div>

      {selected && <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <aside role="dialog" aria-modal="true" aria-labelledby="audit-detail-title" className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
          <div className="sticky top-0 flex items-start justify-between border-b bg-white px-6 py-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.activity.audit_record')}</p><h2 id="audit-detail-title" className="mt-1 text-xl font-semibold text-gray-900">{entityName(selected)}</h2></div><button type="button" aria-label={t('admin.activity.close_details')} onClick={() => setSelected(null)} className="rounded-lg px-3 py-1 text-2xl leading-none text-gray-500 hover:bg-gray-100">×</button></div>
          <div className="space-y-6 px-6 py-5">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">{t('admin.activity.admin')}</dt><dd className="mt-1 font-medium text-gray-900">{selected.userId?.fullName || t('admin.activity.admin')}<span className="block text-xs font-normal text-gray-500">{selected.userId?.email || '—'}</span></dd></div>
              <div><dt className="text-gray-500">{t('admin.activity.action')}</dt><dd className="mt-1"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actionTone[normalizeAction(selected.action)]}`}>{t(`admin.activity.action_${normalizeAction(selected.action).toLowerCase()}`)}</span></dd></div>
              <div><dt className="text-gray-500">{t('admin.activity.target')}</dt><dd className="mt-1 font-medium text-gray-900">{selected.target || '—'}</dd></div>
              <div><dt className="text-gray-500">{t('admin.activity.entity_id')}</dt><dd className="mt-1 break-all font-mono text-xs text-gray-800">{selected.targetId || selected.details?.entity?.id || '—'}</dd></div>
              <div className="col-span-2"><dt className="text-gray-500">{t('admin.activity.timestamp')}</dt><dd className="mt-1 text-gray-900">{selected.createdAt ? new Date(selected.createdAt).toLocaleString(lang) : '—'}</dd></div>
              <div><dt className="text-gray-500">{t('admin.activity.ip_address')}</dt><dd className="mt-1 text-gray-900">{selected.ip || '—'}</dd></div>
              <div><dt className="text-gray-500">{t('admin.activity.device')}</dt><dd className="mt-1 break-words text-gray-900">{selected.userAgent || '—'}</dd></div>
            </dl>
            <section><h3 className="text-sm font-semibold text-gray-900">{t('admin.activity.activity')}</h3><p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{selected.details?.summary || `${selected.action} ${selected.target}`}</p></section>
            <section><h3 className="text-sm font-semibold text-gray-900">{t('admin.activity.changes')}</h3>
              {getChanges(selected).length ? <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100">{getChanges(selected).map((change, index) => <li key={`${change.field}-${index}`} className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:justify-between"><span className="text-sm font-medium text-gray-800">{change.label || change.field}</span><span className="break-words text-sm text-gray-600 sm:max-w-[65%] sm:text-end">{formatChange(change, t)}</span></li>)}</ul> : <p className="mt-2 text-sm text-gray-500">{t('admin.activity.no_changes')}</p>}
            </section>
          </div>
        </aside>
      </div>}
    </div>
  );
}

export default ActivityLogs;

