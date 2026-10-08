import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';
import { exportShippingCsv, importShippingCsv } from '@/services/shipping/shippingCsv';
import { getAdminShipping, saveBulkShipping, saveWilaya } from '@/services/shipping/shippingServices';

const emptyWilaya = (code, name) => ({ code, name, homePrice: null, stopDeskPrice: null, homeEnabled: true, stopDeskEnabled: true, communes: [] });
const emptyCommune = (code, name) => ({ code, name, homePrice: null, stopDeskPrice: null, homeEnabled: true, stopDeskEnabled: true, offices: [] });
const numberValue = value => value === '' ? null : Number(value);
const inputClass = 'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400';
const buttonClass = 'rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 disabled:opacity-50';

function PriceInput({ label, value, onChange }) {
  return <label className="block text-xs font-medium text-slate-600">{label}<input className={`${inputClass} mt-1`} type="number" min="0" step="0.01" placeholder="—" value={value ?? ''} onChange={event => onChange(numberValue(event.target.value))} /></label>;
}
function Availability({ label, checked, onChange }) {
  return <label className="flex items-center gap-2 text-xs font-medium text-slate-600"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />{label}</label>;
}

export default function ShippingPricesPage() {
  const tx = useIntelligenceCopy();
  const [wilayas, setWilayas] = useState([]);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});
  const [newWilaya, setNewWilaya] = useState({ code: '', name: '' });
  const [newCommune, setNewCommune] = useState({ code: '', name: '' });
  const [newOffice, setNewOffice] = useState({ code: '', name: '', address: '' });
  const [csvPreview, setCsvPreview] = useState(null);

  async function reload() {
    setBusy(true); setError('');
    try {
      const data = await getAdminShipping();
      setWilayas(data.wilayas || []); setRevision(data.revision || 0);
      setDrafts({}); setCsvPreview(null);
    } catch (err) { setError(err.response?.data?.message || tx('Could not load shipping tariffs.')); }
    finally { setBusy(false); }
  }
  useEffect(() => { reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => wilayas.filter(item => `${item.code} ${item.name}`.toLowerCase().includes(search.toLowerCase())), [wilayas, search]);
  const current = drafts[selectedCode] || wilayas.find(item => item.code === selectedCode);
  function select(code) { setSelectedCode(code); setError(''); setMessage(''); }
  function edit(updater) { setDrafts(previous => ({ ...previous, [selectedCode]: updater(structuredClone(previous[selectedCode] || current)) })); setMessage(''); }
  function updateCommune(code, updater) { edit(w => ({ ...w, communes: w.communes.map(c => c.code === code ? updater(c) : c) })); }
  function addWilaya() {
    const code = newWilaya.code.trim(), name = newWilaya.name.trim();
    if (!code || !name || wilayas.some(item => item.code === code)) return setError(tx('Enter a unique wilaya code and name.'));
    const entry = emptyWilaya(code, name);
    setWilayas(previous => [...previous, entry]); setSelectedCode(code);
    setNewWilaya({ code: '', name: '' }); setError('');
  }
  function addCommune() {
    const code = newCommune.code.trim(), name = newCommune.name.trim();
    if (!code || !name || current.communes.some(item => item.code === code)) return setError(tx('Enter a unique commune code and name.'));
    edit(w => ({ ...w, communes: [...w.communes, emptyCommune(code, name)] }));
    setNewCommune({ code: '', name: '' }); setError('');
  }
  function addOffice(communeCode) {
    const code = newOffice.code.trim(), name = newOffice.name.trim();
    const commune = current.communes.find(item => item.code === communeCode);
    if (!code || !name || commune.offices.some(item => item.code === code)) return setError(tx('Enter a unique office code and name.'));
    updateCommune(communeCode, c => ({ ...c, offices: [...c.offices, { code, name, address: newOffice.address.trim(), enabled: true }] }));
    setNewOffice({ code: '', name: '', address: '' }); setError('');
  }
  async function saveOne() {
    if (!current) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const data = await saveWilaya(revision, current);
      setWilayas([...data.wilayas, ...wilayas.filter(item => !data.wilayas.some(saved => saved.code === item.code))]); setRevision(data.revision);
      setDrafts(previous => { const next = { ...previous }; delete next[current.code]; return next; });
      setMessage(tx('Shipping tariff saved.'));
    } catch (err) { setError(err.response?.data?.message || tx('Could not save shipping tariff.')); }
    finally { setBusy(false); }
  }
  async function saveAll() {
    if (!wilayas.length) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const updates = wilayas.map(item => drafts[item.code] || item);
      const data = await saveBulkShipping(revision, updates);
      setWilayas(data.wilayas); setRevision(data.revision); setDrafts({});
      setMessage(tx('All shipping tariffs saved.'));
    } catch (err) { setError(err.response?.data?.message || tx('Could not save shipping tariffs.')); }
    finally { setBusy(false); }
  }
  async function importFile(file) {
    if (!file) return;
    setError(''); setMessage(''); setCsvPreview(null);
    try {
      const parsed = importShippingCsv(await file.text());
      await saveBulkShipping(revision, parsed, true);
      setCsvPreview(parsed);
      setMessage(`${parsed.length} ${tx('wilayas validated. Review and apply the import.')}`);
    } catch (err) { setError(err.response?.data?.message || err.message); }
  }
  async function applyImport() {
    if (!csvPreview) return;
    setBusy(true); setError('');
    try {
      const data = await saveBulkShipping(revision, csvPreview);
      setWilayas(data.wilayas); setRevision(data.revision); setDrafts({}); setCsvPreview(null);
      setMessage(tx('CSV import applied.'));
    } catch (err) { setError(err.response?.data?.message || tx('Could not import CSV.')); }
    finally { setBusy(false); }
  }
  function exportCsv() {
    const blob = new Blob(['\uFEFF', exportShippingCsv(wilayas)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'noest-shipping-tariffs.csv'; link.click();
    URL.revokeObjectURL(url);
  }

  return <section className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1800px] space-y-5">
      <header className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-xs sm:p-6">
        <Link to={SANWATERGROUPROUTES.products.list.fullPath} className="text-sm text-blue-600">← {tx('Products')}</Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-2xl font-semibold text-slate-950">{tx('Edit Shipping Prices')}</h1><p className="mt-1 text-sm text-slate-500">{tx('Configure Noest rates by wilaya, commune, and delivery method. Blank prices are unavailable.')} </p><p className="mt-1 text-xs text-slate-500">{tx('Export CSV for the import template; use one row per commune and pickup office.')}</p></div>
          <div className="flex flex-wrap gap-2"><button className={buttonClass} onClick={reload} disabled={busy}>{tx('Reload')}</button><button className={buttonClass} onClick={exportCsv} disabled={busy}>{tx('Export CSV')}</button><label className={`${buttonClass} cursor-pointer`}>{tx('Import CSV')}<input type="file" accept=".csv,text/csv" className="sr-only" onChange={event => { importFile(event.target.files?.[0]); event.target.value = ''; }} /></label><button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={saveAll} disabled={busy || !wilayas.length}>{tx('Save all')}</button></div>
        </div>
        {csvPreview && <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{csvPreview.length} {tx('wilayas ready to import.')} <button className="ml-3 font-semibold underline" disabled={busy} onClick={applyImport}>{tx('Apply validated import')}</button><button className="ml-3 underline" onClick={() => setCsvPreview(null)}>{tx('Cancel')}</button></div>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      </header>
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4">
          <input className={inputClass} type="search" placeholder={tx('Search wilayas')} value={search} onChange={event => setSearch(event.target.value)} />
          <div className="mt-3 max-h-[55vh] space-y-1 overflow-y-auto">{filtered.map(item => <button key={item.code} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${selectedCode === item.code ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`} onClick={() => select(item.code)}>{item.code} — {item.name}</button>)}{!filtered.length && <p className="p-3 text-sm text-slate-500">{busy ? tx('Loading…') : tx('No wilayas configured.')}</p>}</div>
          <div className="mt-4 space-y-2 border-t pt-4"><p className="text-xs font-semibold text-slate-600">{tx('Add wilaya')}</p><input className={inputClass} placeholder={tx('Code')} value={newWilaya.code} onChange={event => setNewWilaya(v => ({ ...v, code: event.target.value }))} /><input className={inputClass} placeholder={tx('Name')} value={newWilaya.name} onChange={event => setNewWilaya(v => ({ ...v, name: event.target.value }))} /><button className={buttonClass} onClick={addWilaya} disabled={busy}>{tx('Add wilaya')}</button></div>
        </aside>
        <main className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
          {!current ? <p className="text-sm text-slate-500">{tx('Select a wilaya or import a CSV tariff list.')}</p> : <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">{current.code} — {current.name}</h2><button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={saveOne} disabled={busy}>{tx('Save wilaya')}</button></div>
            <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2"><PriceInput label={tx('Home price (DA)')} value={current.homePrice} onChange={value => edit(w => ({ ...w, homePrice: value }))} /><PriceInput label={tx('Stop Desk price (DA)')} value={current.stopDeskPrice} onChange={value => edit(w => ({ ...w, stopDeskPrice: value }))} /><Availability label={tx('Home available')} checked={current.homeEnabled} onChange={value => edit(w => ({ ...w, homeEnabled: value }))} /><Availability label={tx('Stop Desk available')} checked={current.stopDeskEnabled} onChange={value => edit(w => ({ ...w, stopDeskEnabled: value }))} /></div>
            <div><h3 className="mb-3 font-semibold text-slate-900">{tx('Communes and overrides')}</h3><div className="space-y-4">{current.communes.map(c => <div key={c.code} className="rounded-2xl border border-slate-200 p-4"><div className="font-medium text-slate-800">{c.code} — {c.name}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><PriceInput label={tx('Home override (DA)')} value={c.homePrice} onChange={value => updateCommune(c.code, item => ({ ...item, homePrice: value }))} /><PriceInput label={tx('Stop Desk override (DA)')} value={c.stopDeskPrice} onChange={value => updateCommune(c.code, item => ({ ...item, stopDeskPrice: value }))} /><Availability label={tx('Home available')} checked={c.homeEnabled} onChange={value => updateCommune(c.code, item => ({ ...item, homeEnabled: value }))} /><Availability label={tx('Stop Desk available')} checked={c.stopDeskEnabled} onChange={value => updateCommune(c.code, item => ({ ...item, stopDeskEnabled: value }))} /></div><div className="mt-4 border-t border-slate-100 pt-3"><p className="mb-2 text-xs font-semibold text-slate-600">{tx('Pickup offices')}</p>{c.offices.map(o => <div key={o.code} className="mb-2 grid gap-2 sm:grid-cols-[90px_1fr_1fr_auto_auto] sm:items-center"><span className="text-xs text-slate-600">{o.code}</span><input className={inputClass} aria-label={tx('Office name')} value={o.name} onChange={event => updateCommune(c.code, item => ({ ...item, offices: item.offices.map(entry => entry.code === o.code ? { ...entry, name: event.target.value } : entry) }))} /><input className={inputClass} aria-label={tx('Address')} value={o.address} onChange={event => updateCommune(c.code, item => ({ ...item, offices: item.offices.map(entry => entry.code === o.code ? { ...entry, address: event.target.value } : entry) }))} /><Availability label={tx('Available')} checked={o.enabled} onChange={value => updateCommune(c.code, item => ({ ...item, offices: item.offices.map(entry => entry.code === o.code ? { ...entry, enabled: value } : entry) }))} /><button className="text-xs text-red-600" onClick={() => updateCommune(c.code, item => ({ ...item, offices: item.offices.filter(entry => entry.code !== o.code) }))}>{tx('Remove')}</button></div>)}<div className="grid gap-2 sm:grid-cols-4"><input className={inputClass} placeholder={tx('Office code')} value={newOffice.code} onChange={event => setNewOffice(v => ({ ...v, code: event.target.value }))} /><input className={inputClass} placeholder={tx('Office name')} value={newOffice.name} onChange={event => setNewOffice(v => ({ ...v, name: event.target.value }))} /><input className={inputClass} placeholder={tx('Address')} value={newOffice.address} onChange={event => setNewOffice(v => ({ ...v, address: event.target.value }))} /><button className={buttonClass} onClick={() => addOffice(c.code)}>{tx('Add office')}</button></div></div></div>)}</div><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><input className={inputClass} placeholder={tx('Commune code')} value={newCommune.code} onChange={event => setNewCommune(v => ({ ...v, code: event.target.value }))} /><input className={inputClass} placeholder={tx('Commune name')} value={newCommune.name} onChange={event => setNewCommune(v => ({ ...v, name: event.target.value }))} /><button className={buttonClass} onClick={addCommune}>{tx('Add commune')}</button></div></div>
          </div>}
        </main>
      </div>
    </div>
  </section>;
}
