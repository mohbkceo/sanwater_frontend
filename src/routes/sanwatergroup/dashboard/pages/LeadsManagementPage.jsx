import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign, Filter, Loader2, Mail, MessageSquarePlus, Package, Phone, RefreshCw, Search, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { addLeadNote, assignLead, getLead, getLeadOptions, getLeads, updateLead, updateLeadStatus } from "@/services/leads/leadServices";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/configs/permissions";

const STATUSES = ["new", "contacted", "qualified", "quote_sent", "won", "lost", "archived"];
const STATUS_LABELS = { new: "New", contacted: "Contacted", qualified: "Qualified", quote_sent: "Quote sent", won: "Won", lost: "Lost", archived: "Archived" };
const LOST_REASONS = { price: "Price", no_response: "No response", competitor: "Competitor", not_interested: "Not interested", invalid_lead: "Invalid lead", other: "Other" };
const EMPTY_FILTERS = { search: "", status: "", assignedTo: "", product: "", source: "", from: "", to: "" };

const money = (value) => new Intl.NumberFormat(undefined, { style: "currency", currency: "DZD", maximumFractionDigits: 0 }).format(Number(value || 0));
const dateTime = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export default function LeadsManagementPage() {
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.LEADS.MANAGE);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ leads: [], summary: {}, totalPages: 1, totalItems: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sources, setSources] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { const timer = setTimeout(() => setSearch(filters.search.trim()), 350); return () => clearTimeout(timer); }, [filters.search]);
  useEffect(() => { setPage(1); }, [search, filters.status, filters.assignedTo, filters.product, filters.source, filters.from, filters.to]);
  // load is intentionally keyed to the server-side query fields below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page, search, filters.status, filters.assignedTo, filters.product, filters.source, filters.from, filters.to]);
  useEffect(() => {
    getLeadOptions().then((result) => {
      setUsers(result?.data?.users || []); setProducts(result?.data?.products || []); setSources(result?.data?.sources || []);
    }).catch(() => {});
  }, []);

  async function load(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError("");
      const response = await getLeads({ page, limit: 20, search: search || undefined, ...Object.fromEntries(Object.entries(filters).filter(([key, value]) => key !== "search" && value)) });
      setData(response?.data || { leads: [], summary: {}, totalPages: 1, totalItems: 0 });
    } catch (err) { setError(err?.response?.data?.message || "Failed to load leads."); }
    finally { setLoading(false); }
  }

  async function openLead(id) {
    try { setDetailLoading(true); setSelected((await getLead(id))?.data || null); }
    catch { toast.error("Could not load lead details."); }
    finally { setDetailLoading(false); }
  }

  const stats = data.summary || {};
  const cards = [
    ["Total Leads", stats.total], ["New", stats.new], ["Contacted", stats.contacted], ["Qualified", stats.qualified],
    ["Quote Sent", stats.quote_sent], ["Won", stats.won], ["Lost", stats.lost], ["Pipeline Value", money(stats.estimatedPipelineValue)],
  ];

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/80 px-4 py-5 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">SanWater Group</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Sales Leads</h1><p className="mt-1 text-sm text-slate-500">Manage inquiry, follow-up, qualification, quote and outcome.</p></div>
          <button onClick={() => load(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw className="h-4 w-4" />Refresh</button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <SummaryCard key={label} label={label} value={value || 0} />)}</div>
        <section className="mt-6 overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterField icon={Search}><input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Name, phone, email, company, product" /></FilterField>
            <FilterField icon={Filter}><select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}><option value="">All statuses</option>{STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></FilterField>
            <FilterField icon={UserRound}><select value={filters.assignedTo} onChange={(e) => setFilters((f) => ({ ...f, assignedTo: e.target.value }))}><option value="">All assignees</option><option value="unassigned">Unassigned</option>{users.map((user) => <option key={user._id} value={user._id}>{user.fullName}</option>)}</select></FilterField>
            <FilterField icon={Package}><select value={filters.product} onChange={(e) => setFilters((f) => ({ ...f, product: e.target.value }))}><option value="">All products</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name || product.productId}</option>)}</select></FilterField>
            <FilterField><select value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}><option value="">All sources</option>{sources.map((source) => <option key={source} value={source}>{source}</option>)}</select></FilterField>
            <FilterField><input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} /></FilterField>
            <FilterField><input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} /></FilterField>
            <button onClick={() => setFilters(EMPTY_FILTERS)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">Clear filters</button>
          </div>
          {error && <div className="m-4 flex gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertTriangle className="h-4 w-4" />{error}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Interest</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Assigned</th><th className="px-5 py-3">Follow-up</th><th className="px-5 py-3">Value</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan="6" className="p-3"><div className="h-14 animate-pulse rounded-2xl bg-slate-100" /></td></tr>) : data.leads?.length ? data.leads.map((lead) => <LeadRow key={lead._id} lead={lead} onClick={() => openLead(lead._id)} />) : <tr><td colSpan="6" className="px-6 py-16 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-bold">No leads found</h3><p className="mt-1 text-slate-500">Try clearing or changing the filters.</p></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500"><span>{data.totalItems || 0} leads</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {data.totalPages || 1}</span><button disabled={page >= (data.totalPages || 1)} onClick={() => setPage((p) => p + 1)} className="rounded-xl border p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
        </section>
      </main>
      {(selected || detailLoading) && <LeadDrawer lead={selected} loading={detailLoading} users={users} canManage={canManage} onClose={() => setSelected(null)} onChanged={async () => { if (selected) await openLead(selected._id); await load(true); }} />}
    </div>
  );
}

function SummaryCard({ label, value }) { return <div className="rounded-3xl border border-blue-100 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p></div>; }
function FilterField({ icon: Icon, children }) { return <div className="relative">{Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}<div className={`[&>*]:w-full [&>*]:rounded-2xl [&>*]:border [&>*]:border-slate-200 [&>*]:bg-slate-50 [&>*]:py-3 [&>*]:pr-3 [&>*]:text-sm [&>*]:outline-none ${Icon ? "[&>*]:pl-11" : "[&>*]:pl-4"}`}>{children}</div></div>; }

function followUpMeta(value) {
  if (!value) return null;
  const due = new Date(value); const today = new Date(); const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()); const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  if (dueDay < start) return { label: "OVERDUE", className: "bg-rose-50 text-rose-700" };
  if (+dueDay === +start) return { label: "DUE TODAY", className: "bg-amber-50 text-amber-700" };
  return { label: "UPCOMING", className: "bg-blue-50 text-blue-700" };
}

function LeadRow({ lead, onClick }) {
  const follow = followUpMeta(lead.nextFollowUpAt);
  return <tr onClick={onClick} className="cursor-pointer hover:bg-blue-50/40"><td className="px-5 py-4"><p className="font-semibold">{lead.fullName}</p><p className="mt-1 text-xs text-slate-500">{lead.phone}{lead.company ? ` · ${lead.company}` : ""}</p></td><td className="px-5 py-4"><p className="font-medium">{lead.productName}</p><p className="text-xs text-slate-500">Qty {lead.quantity} · {lead.source || "unknown"}</p></td><td className="px-5 py-4"><StatusBadge status={lead.status} /></td><td className="px-5 py-4">{lead.assignedTo?.fullName || "Unassigned"}</td><td className="px-5 py-4">{follow ? <><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${follow.className}`}>{follow.label}</span><p className="mt-1 text-xs text-slate-500">{dateTime(lead.nextFollowUpAt)}</p></> : "—"}</td><td className="px-5 py-4 font-semibold">{money(lead.estimatedValue)}</td></tr>;
}
function StatusBadge({ status }) { return <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{STATUS_LABELS[status] || status}</span>; }

function LeadDrawer({ lead, loading, users, canManage, onClose, onChanged }) {
  const [note, setNote] = useState(""); const [saving, setSaving] = useState(false); const [status, setStatus] = useState(""); const [finalValue, setFinalValue] = useState(""); const [orderReference, setOrderReference] = useState(""); const [lostReason, setLostReason] = useState(""); const [lostExplanation, setLostExplanation] = useState("");
  const timeline = useMemo(() => {
    if (!lead) return [];
    return [
      { at: lead.createdAt, label: "Lead created", detail: lead.source || "unknown source" },
      ...(lead.statusHistory || []).filter((item) => item.previousStatus).map((item) => ({ at: item.changedAt, label: `${STATUS_LABELS[item.previousStatus]} → ${STATUS_LABELS[item.newStatus]}`, detail: item.changedBy?.fullName || "System" })),
      ...(lead.assignmentHistory || []).map((item) => ({ at: item.changedAt, label: "Assignment changed", detail: item.newAssignee?.fullName || "Unassigned" })),
      ...(lead.notes || []).map((item) => ({ at: item.createdAt, label: "Internal note", detail: `${item.author?.fullName || "Admin"}: ${item.content}` })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [lead]);

  async function act(callback, message) { try { setSaving(true); await callback(); toast.success(message); await onChanged(); } catch (error) { toast.error(error?.response?.data?.message || "Update failed."); } finally { setSaving(false); } }
  if (loading || !lead) return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  return <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm" onMouseDown={onClose}><aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7" onMouseDown={(e) => e.stopPropagation()}>
    <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Lead details</p><h2 className="mt-1 text-2xl font-bold">{lead.fullName}</h2><div className="mt-2"><StatusBadge status={lead.status} /></div></div><button onClick={onClose} className="rounded-full border p-2"><X className="h-4 w-4" /></button></div>
    <Section title="Customer"><Info icon={Phone} label="Phone" value={lead.phone} /><Info icon={Mail} label="Email" value={lead.email} /><Info label="Company" value={lead.company} /><Info label="Wilaya" value={lead.wilaya} /></Section>
    <Section title="Interest"><Info icon={Package} label="Product" value={`${lead.productName} × ${lead.quantity}`} /><Info icon={CircleDollarSign} label="Estimated value" value={money(lead.estimatedValue)} /></Section>
    <Section title="Attribution"><Info label="Source / medium" value={[lead.source, lead.medium].filter(Boolean).join(" / ") || "Unknown"} /><Info label="Campaign" value={lead.campaign} /><Info label="Referrer" value={lead.referrer} /><Info label="Landing page" value={lead.landingPage} /></Section>
    <Section title="Management">
      <label className="text-xs font-bold uppercase text-slate-400">Assigned employee</label><select disabled={!canManage || saving} value={lead.assignedTo?._id || ""} onChange={(e) => act(() => assignLead(lead._id, e.target.value || null), "Lead assigned.")} className="mt-2 w-full rounded-2xl border p-3"><option value="">Unassigned</option>{users.map((user) => <option key={user._id} value={user._id}>{user.fullName}</option>)}</select>
      <label className="mt-4 block text-xs font-bold uppercase text-slate-400">Next follow-up</label><input disabled={!canManage || saving} type="datetime-local" defaultValue={lead.nextFollowUpAt ? new Date(new Date(lead.nextFollowUpAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} onBlur={(e) => act(() => updateLead(lead._id, { nextFollowUpAt: e.target.value ? new Date(e.target.value).toISOString() : null }), "Follow-up updated.")} className="mt-2 w-full rounded-2xl border p-3" />
      <label className="mt-4 block text-xs font-bold uppercase text-slate-400">Status</label><select disabled={!canManage || saving} value={status || lead.status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border p-3">{STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABELS[item]}</option>)}</select>
      {status === "won" && <div className="mt-3 grid gap-3 sm:grid-cols-2"><input type="number" min="0" value={finalValue} onChange={(e) => setFinalValue(e.target.value)} placeholder="Final value *" className="rounded-2xl border p-3" /><input value={orderReference} onChange={(e) => setOrderReference(e.target.value)} placeholder="Order reference" className="rounded-2xl border p-3" /></div>}
      {status === "lost" && <div className="mt-3 space-y-3"><select value={lostReason} onChange={(e) => setLostReason(e.target.value)} className="w-full rounded-2xl border p-3"><option value="">Select loss reason *</option>{Object.entries(LOST_REASONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select><textarea value={lostExplanation} onChange={(e) => setLostExplanation(e.target.value)} placeholder="Optional explanation" className="w-full rounded-2xl border p-3" /></div>}
      {status && status !== lead.status && <button disabled={saving || (status === "won" && finalValue === "") || (status === "lost" && !lostReason)} onClick={() => act(() => updateLeadStatus(lead._id, { status, ...(status === "won" ? { finalValue: Number(finalValue), orderReference } : {}), ...(status === "lost" ? { lostReason, lostExplanation } : {}) }), "Status updated.")} className="mt-3 w-full rounded-2xl bg-blue-600 p-3 text-sm font-semibold text-white disabled:opacity-50">Save status change</button>}
    </Section>
    <Section title="Internal notes"><div className="flex gap-2"><textarea disabled={!canManage} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note" className="min-h-20 flex-1 rounded-2xl border p-3 text-sm" /><button disabled={!canManage || saving || !note.trim()} onClick={() => act(async () => { await addLeadNote(lead._id, note.trim()); setNote(""); }, "Note added.")} className="self-end rounded-2xl bg-slate-900 p-3 text-white"><MessageSquarePlus className="h-5 w-5" /></button></div></Section>
    <Section title="Timeline"><div className="space-y-3">{timeline.map((item, index) => <div key={`${item.at}-${index}`} className="border-l-2 border-blue-200 pl-4"><p className="text-sm font-semibold">{item.label}</p><p className="mt-1 text-xs text-slate-500">{item.detail}</p><p className="mt-1 text-[10px] text-slate-400">{dateTime(item.at)}</p></div>)}</div></Section>
  </aside></div>;
}

function Section({ title, children }) { return <section className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-5"><h3 className="mb-4 font-bold">{title}</h3><div className="space-y-3">{children}</div></section>; }
function Info({ icon: Icon, label, value }) { return <div className="rounded-2xl bg-white p-3"><p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{Icon && <Icon className="h-3 w-3" />}{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-800">{value || "—"}</p></div>; }
