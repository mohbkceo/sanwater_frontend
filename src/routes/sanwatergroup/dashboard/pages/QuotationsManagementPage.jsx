import React, { useEffect, useMemo, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/configs/permissions";
import { getQuotations, updateQuotationStatus } from "@/services/quotations/quotationServices";
import {
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  FileText,
  Mail,
  Phone,
  Building2,
  User,
  CalendarDays,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Handshake,
  XCircle,
  Archive,
  Send,
} from "lucide-react";

const STATUS_OPTIONS = [
  "submitted",
  "under_review",
  "quoted",
  "negotiation",
  "approved",
  "rejected",
  "closed",
];

const STATUS_META = {
  submitted: { label: "Submitted", icon: Send, pill: "bg-blue-50 text-blue-700 border-blue-200" },
  under_review: { label: "Under review", icon: Clock3, pill: "bg-amber-50 text-amber-700 border-amber-200" },
  quoted: { label: "Quoted", icon: FileText, pill: "bg-violet-50 text-violet-700 border-violet-200" },
  negotiation: { label: "Negotiation", icon: Handshake, pill: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  approved: { label: "Approved", icon: CheckCircle2, pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", icon: XCircle, pill: "bg-rose-50 text-rose-700 border-rose-200" },
  closed: { label: "Closed", icon: Archive, pill: "bg-slate-100 text-slate-600 border-slate-200" },
};

const initialFilters = {
  search: "",
  status: "all",
  sort: "newest",
};

export default function QuotationsManagementPage() {
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.QUOTATIONS.MANAGE);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [selected, setSelected] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load(silent = false) {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");
      const res = await getQuotations({ limit: 200 });
      setQuotations(Array.isArray(res?.data?.quotations) ? res.data.quotations : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load quotations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const list = quotations.filter((q) => {
      const matchesStatus = filters.status === "all" ? true : q.status === filters.status;
      const matchesSearch = !search
        ? true
        : [
            q.requester?.fullName,
            q.requester?.phone,
            q.requester?.email,
            q.requester?.company,
            ...(q.items || []).map((i) => i.productName),
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));

      return matchesStatus && matchesSearch;
    });

    list.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return filters.sort === "oldest" ? aTime - bTime : bTime - aTime;
    });

    return list;
  }, [quotations, filters]);

  const stats = useMemo(() => {
    const total = quotations.length;
    const submitted = quotations.filter((q) => q.status === "submitted").length;
    const underReview = quotations.filter((q) => q.status === "under_review").length;
    const approved = quotations.filter((q) => q.status === "approved").length;

    return { total, submitted, underReview, approved };
  }, [quotations]);

  async function handleStatusChange(id, status) {
    try {
      setActionLoadingId(id);
      setError("");
      setSuccess("");

      const res = await updateQuotationStatus(id, status);
      const updated = res?.data;
      setQuotations((prev) => prev.map((q) => (q._id === id ? updated : q)));
      setSelected((prev) => (prev?._id === id ? updated : prev));
      setSuccess("Quotation status updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update status.");
    } finally {
      setActionLoadingId(null);
    }
  }

  const emptyState = !loading && filtered.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Admin dashboard</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">Quotation Requests</h1>
            <p className="mt-2 text-sm text-slate-500">Review B2B/B2C quote requests and move them through the pipeline.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => load(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
              {stats.total} total requests
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total requests" value={stats.total} icon={ClipboardList} />
          <StatCard title="New / submitted" value={stats.submitted} icon={Send} />
          <StatCard title="Under review" value={stats.underReview} icon={Clock3} />
          <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6 relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by name, phone, email, company, product..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="lg:col-span-4 relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_META[status].label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="lg:col-span-2 text-right text-sm text-slate-500 font-medium">
                {filtered.length} shown
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mx-4 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-[1.6fr_1fr]">
            <div className="overflow-x-auto border-b lg:border-b-0 lg:border-r border-slate-200">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <div className="col-span-3">Requester</div>
                  <div className="col-span-3">Items</div>
                  <div className="col-span-2">Submitted</div>
                  <div className="col-span-4">Status</div>
                </div>

                {loading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : emptyState ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">No quotation requests found</h3>
                    <p className="mt-2 text-sm text-slate-500">Try another search term or clear the filters.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filtered.map((q) => (
                      <QuotationRow
                        key={q._id}
                        quotation={q}
                        onSelect={() => setSelected(q)}
                        onStatusChange={(status) => handleStatusChange(q._id, status)}
                        actionLoading={actionLoadingId === q._id}
                        canManage={canManage}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="bg-slate-50/70 p-4 sm:p-5">
              {selected ? (
                <QuotationDetailsCard
                  quotation={selected}
                  onClose={() => setSelected(null)}
                  onStatusChange={(status) => handleStatusChange(selected._id, status)}
                  actionLoading={actionLoadingId === selected._id}
                  canManage={canManage}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">Quotation details</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Select a request to see the full item list, requester contact info, and update its status.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuotationRow({ quotation, onSelect, onStatusChange, actionLoading, canManage }) {
  const meta = STATUS_META[quotation.status] || STATUS_META.submitted;
  const StatusIcon = meta.icon;
  const itemsLabel = (quotation.items || []).map((i) => `${i.productName} x${i.quantity}`).join(", ");

  return (
    <div className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-slate-50 transition">
      <div className="col-span-3">
        <button onClick={onSelect} className="text-left group">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition truncate">
                {quotation.requester?.fullName || "Unknown"}
              </div>
              <div className="mt-1 text-xs text-slate-500 truncate flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {quotation.requester?.phone || "—"}
              </div>
              {quotation.requester?.company && (
                <div className="mt-1 text-xs text-slate-500 truncate flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {quotation.requester.company}
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      <div className="col-span-3">
        <button onClick={onSelect} className="text-left w-full">
          <div className="text-sm text-slate-700 truncate" title={itemsLabel}>{itemsLabel || "—"}</div>
          <div className="mt-1 text-xs text-slate-400">{(quotation.items || []).length} item(s)</div>
        </button>
      </div>

      <div className="col-span-2 text-sm text-slate-600">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          {formatDate(quotation.createdAt)}
        </div>
      </div>

      <div className="col-span-4">
        <select
          value={quotation.status}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={actionLoading || !canManage}
          title={!canManage ? "You do not have permission" : undefined}
          className={`w-full appearance-none rounded-2xl border px-3 py-2.5 text-sm font-semibold outline-none ${meta.pill} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status} className="text-slate-900 bg-white">
              {STATUS_META[status].label}
            </option>
          ))}
        </select>
        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.pill}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
      </div>
    </div>
  );
}

function QuotationDetailsCard({ quotation, onClose, onStatusChange, actionLoading, canManage }) {
  const meta = STATUS_META[quotation.status] || STATUS_META.submitted;
  const StatusIcon = meta.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Quotation details</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight">{quotation.requester?.fullName}</h2>
        </div>
        <button onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Close
        </button>
      </div>

      <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${meta.pill}`}>
        <StatusIcon className="h-4 w-4" />
        {meta.label}
      </div>

      <div className="mt-5 space-y-4">
        <InfoBlock label="Phone" value={quotation.requester?.phone} icon={Phone} />
        {quotation.requester?.email && <InfoBlock label="Email" value={quotation.requester.email} icon={Mail} />}
        {quotation.requester?.company && <InfoBlock label="Company" value={quotation.requester.company} icon={Building2} />}
        <InfoBlock label="Customer type" value={quotation.requester?.customerType} />
        {quotation.requester?.address && <InfoBlock label="Address" value={quotation.requester.address} />}
        {quotation.requester?.notes && <InfoBlock label="Notes" value={quotation.requester.notes} />}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Items</div>
          <div className="space-y-2">
            {(quotation.items || []).map((item, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-semibold text-slate-800">{item.productName} × {item.quantity}</div>
                {item.productSerialNumber && <div className="text-xs text-slate-500">SN: {item.productSerialNumber}</div>}
                {item.note && <div className="text-xs text-slate-500">{item.note}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onStatusChange("under_review")}
          disabled={actionLoading || !canManage}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Mark under review
        </button>
        <button
          onClick={() => onStatusChange("quoted")}
          disabled={actionLoading || !canManage}
          className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          Mark quoted
        </button>
        <button
          onClick={() => onStatusChange("approved")}
          disabled={actionLoading || !canManage}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Approve
        </button>
        <button
          onClick={() => onStatusChange("rejected")}
          disabled={actionLoading || !canManage}
          className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
        >
          Reject
        </button>
      </div>

      <button
        onClick={() => onStatusChange("closed")}
        disabled={actionLoading || !canManage}
        title={!canManage ? "You do not have permission" : "Close request"}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Archive className="h-4 w-4" />
        Close request
      </button>
    </div>
  );
}

function InfoBlock({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value || "—"}</div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  const StatIcon = icon;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <StatIcon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return "—";
  }
}
