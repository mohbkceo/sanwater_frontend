import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '@/services/baseAPIs';
import { PERMISSIONS } from '@/configs/permissions';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';
import { usePermissions } from '@/hooks/usePermissions';
import { useReport } from '@/components/dashboard/intelligence/useReport';
import { EmptyState, ErrorState, LoadingState, Panel, SimpleTable } from '@/components/dashboard/intelligence/ui';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';

const stages = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];
const date = value => value ? new Date(value).toLocaleString() : '—';

function ApplicationDetail({ id, onUpdated }) {
  const tx = useIntelligenceCopy();
  const { can } = usePermissions();
  const editable = can(PERMISSIONS.HIRING.MANAGE);
  const canAnalyze = can(PERMISSIONS.ANALYTICS.HIRING);
  const [version, setVersion] = useState(0);
  const [draft, setDraft] = useState({ stage: '', assignedTo: undefined, note: '' });
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const report = useReport(async () => {
    const [detail, assignees] = await Promise.all([
      contentAPI.get(`/applications/${id}`),
      editable ? contentAPI.get('/applications/assignees') : Promise.resolve({ data: { data: [] } }),
    ]);
    return { row: detail.data.data, assignees: assignees.data.data };
  }, `${id}:${version}:${editable}`);
  const row = report.data?.row;
  const save = async event => {
    event.preventDefault();
    if (!row) return;
    const payload = {};
    if (draft.stage && draft.stage !== row.stage) payload.stage = draft.stage;
    if (draft.assignedTo !== undefined && draft.assignedTo !== (row.assignedTo?._id || '')) payload.assignedTo = draft.assignedTo || null;
    if (draft.note.trim()) payload.note = draft.note.trim();
    if (!Object.keys(payload).length) return;
    setSaving(true);
    setSaveError('');
    try {
      await contentAPI.patch(`/applications/${id}`, payload);
      setDraft({ stage: '', assignedTo: undefined, note: '' });
      setVersion(value => value + 1);
      onUpdated();
    } catch { setSaveError(tx('Could not save the application. Please retry.')); }
    finally { setSaving(false); }
  };
  return <Panel title={tx('Application detail')} action={canAnalyze && <Link className="text-sm font-semibold text-blue-700" to={`${SANWATERGROUPROUTES.subjects.fullPath}/application/${id}`}>{tx('View intelligence')}</Link>}>
    {report.loading && !row ? <LoadingState /> : report.error && !row ? <ErrorState retry={report.retry} /> : row && <div className="space-y-5 text-sm">
      <dl className="grid gap-3 sm:grid-cols-2"><div><dt className="text-slate-500">{tx('Candidate')}</dt><dd className="font-semibold">{row.candidate?.fullName}</dd></div><div><dt className="text-slate-500">{tx('Position')}</dt><dd>{row.hiringId?.title || tx('Position unavailable')}</dd></div><div><dt className="text-slate-500">{tx('Email')}</dt><dd className="break-all">{row.candidate?.email}</dd></div><div><dt className="text-slate-500">{tx('Phone')}</dt><dd>{row.candidate?.phone || '—'}</dd></div><div><dt className="text-slate-500">{tx('Submitted')}</dt><dd>{date(row.createdAt)}</dd></div><div><dt className="text-slate-500">{tx('Source')}</dt><dd>{row.source || tx('Unavailable')}</dd></div></dl>
      {row.message && <div><h3 className="font-semibold">{tx('Introduction')}</h3><p className="mt-1 whitespace-pre-wrap text-slate-700">{row.message}</p></div>}
      {editable && <form onSubmit={save} className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><label className="text-xs font-medium">{tx('Stage')}<select value={draft.stage || row.stage} onChange={event => setDraft(value => ({ ...value, stage: event.target.value }))} className="mt-1 w-full rounded-lg border bg-white p-2 text-sm">{stages.map(stage => <option key={stage} value={stage}>{tx(stage)}</option>)}</select></label><label className="text-xs font-medium">{tx('Assignee')}<select value={draft.assignedTo ?? (row.assignedTo?._id || '')} onChange={event => setDraft(value => ({ ...value, assignedTo: event.target.value }))} className="mt-1 w-full rounded-lg border bg-white p-2 text-sm"><option value="">{tx('Unassigned')}</option>{report.data.assignees.map(user => <option key={user._id} value={user._id}>{user.fullName}</option>)}</select></label><label className="text-xs font-medium sm:col-span-2">{tx('Add note')}<textarea value={draft.note} onChange={event => setDraft(value => ({ ...value, note: event.target.value }))} maxLength={4000} rows={3} className="mt-1 w-full rounded-lg border bg-white p-2 text-sm" /></label>{saveError && <p role="alert" className="text-rose-700 sm:col-span-2">{saveError}</p>}<button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? tx('Saving…') : tx('Save changes')}</button></form>}
      <div><h3 className="font-semibold">{tx('Stage history')}</h3>{row.stageHistory?.length ? <ol className="mt-2 space-y-2 border-s-2 border-blue-200 ps-4">{row.stageHistory.map((entry, index) => <li key={entry._id || index}>{tx(entry.stage)} · {date(entry.changedAt)}{entry.changedBy?.fullName ? ` · ${entry.changedBy.fullName}` : ''}</li>)}</ol> : <EmptyState>{tx('No stage history recorded.')}</EmptyState>}</div>
      <div><h3 className="font-semibold">{tx('Notes')}</h3>{row.notes?.length ? <ol className="mt-2 space-y-2">{row.notes.map((note, index) => <li key={note._id || index} className="rounded-lg bg-slate-50 p-3"><p className="whitespace-pre-wrap">{note.content}</p><p className="mt-1 text-xs text-slate-500">{note.author?.fullName || tx('Admin')} · {date(note.createdAt)}</p></li>)}</ol> : <EmptyState>{tx('No notes recorded.')}</EmptyState>}</div>
    </div>}
  </Panel>;
}

export default function ApplicationsPage() {
  const tx = useIntelligenceCopy();
  const [version, setVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [stage, setStage] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const report = useReport(async () => (await contentAPI.get('/applications', { params: { page, stage } })).data.data, `${version}:${page}:${stage}`);
  const rows = report.data?.rows?.map(row => ({ ...row, candidateName: row.candidate?.fullName, position: row.hiringId?.title || tx('Position unavailable') }));
  return <main className="space-y-5 p-4 sm:p-6"><header><h1 className="text-3xl font-semibold">{tx('Applications')}</h1><p className="mt-2 text-sm text-slate-500">{tx('Submitted candidates and hiring stages')}</p></header><div className="grid items-start gap-5 xl:grid-cols-2"><Panel title={tx('Pipeline')} action={<select aria-label={tx('Filter by stage')} value={stage} onChange={event => { setStage(event.target.value); setPage(1); }} className="rounded-lg border p-2 text-sm"><option value="">{tx('All stages')}</option>{stages.map(value => <option key={value} value={value}>{tx(value)}</option>)}</select>}>{report.loading && !report.data ? <LoadingState /> : report.error && !report.data ? <ErrorState retry={report.retry} /> : <><SimpleTable rows={rows} columns={[{ key: 'candidateName', label: 'Candidate' }, { key: 'position', label: 'Position' }, { key: 'createdAt', label: 'Applied', render: row => date(row.createdAt) }, { key: 'stage', label: 'Stage' }, { key: 'action', label: '', render: row => <button type="button" onClick={() => setSelectedId(row._id)} className="font-semibold text-blue-700 underline">{tx('Inspect')}</button> }]} /><div className="mt-3 flex gap-3 text-sm"><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{tx('Previous')}</button><span>{tx('Page')} {page}</span><button type="button" disabled={page * 20 >= (report.data?.total || 0)} onClick={() => setPage(value => value + 1)}>{tx('Next')}</button></div></>}</Panel>{selectedId && <ApplicationDetail key={selectedId} id={selectedId} onUpdated={() => setVersion(value => value + 1)} />}</div></main>;
}
