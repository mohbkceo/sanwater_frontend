import { useTranslation } from "@/lib/i18n";
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
const CUSTOMER_TYPE_KEYS = {
  consumer: "admin.quotations.customer_consumer",
  contractor: "admin.quotations.customer_contractor",
  architect: "admin.quotations.customer_architect",
  designer: "admin.quotations.customer_designer",
  dealer: "admin.quotations.customer_dealer",
  distributor: "admin.quotations.customer_distributor",
  business: "admin.quotations.customer_business",
};

const STATUS_META = {
  submitted: { labelKey: "admin.quotations.status_submitted", icon: Send, pill: "bg-blue-50 text-blue-700 border-blue-200" },
  under_review: { labelKey: "admin.quotations.status_under_review", icon: Clock3, pill: "bg-amber-50 text-amber-700 border-amber-200" },
  quoted: { labelKey: "admin.quotations.status_quoted", icon: FileText, pill: "bg-violet-50 text-violet-700 border-violet-200" },
  negotiation: { labelKey: "admin.quotations.status_negotiation", icon: Handshake, pill: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  approved: { labelKey: "admin.quotations.status_approved", icon: CheckCircle2, pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { labelKey: "admin.quotations.status_rejected", icon: XCircle, pill: "bg-rose-50 text-rose-700 border-rose-200" },
  closed: { labelKey: "admin.quotations.status_closed", icon: Archive, pill: "bg-slate-100 text-slate-600 border-slate-200" },
};

const initialFilters = {
  search: "",
  status: "all",
  sort: "newest",
};

export default function QuotationsManagementPage() {
  const { t } = useTranslation();
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
      setError(err?.response?.data?.message || t("admin.quotations.failed_to_load_quotations"));
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
      setSuccess(t("admin.quotations.quotation_status_updated"));
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.quotations.could_not_update_status"));
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">{t("admin.quotations.admin_dashboard")}</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">{t("admin.quotations.quotation_requests")}</h1>
            <p className="mt-2 text-sm text-slate-500">{t("admin.quotations.review_b2b_b2c_quote_requests_and_move_them_through")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => load(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {t("admin.quotations.refresh")}
            </button>
            <div className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
              {t("admin.quotations.total_requests", { count: stats.total })}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title={t("admin.quotations.total")} value={stats.total} icon={ClipboardList} />
          <StatCard title={t("admin.quotations.new_submitted")} value={stats.submitted} icon={Send} />
          <StatCard title={t("admin.quotations.under_review")} value={stats.underReview} icon={Clock3} />
          <StatCard title={t("admin.quotations.approved")} value={stats.approved} icon={CheckCircle2} />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6 relative">
                <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder={t("admin.quotations.search_by_name_phone_email_company_product")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 ps-11 pe-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="lg:col-span-4 relative">
                <Filter className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 ps-11 pe-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="all">{t("admin.quotations.all_statuses")}</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {t(STATUS_META[status].labelKey)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="lg:col-span-2 text-end text-sm text-slate-500 font-medium">
                {t("admin.quotations.shown", { count: filtered.length })}
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
                  <div className="col-span-3">{t("admin.quotations.requester")}</div>
                  <div className="col-span-3">{t("admin.quotations.items")}</div>
                  <div className="col-span-2">{t("admin.quotations.submitted_status")}</div>
                  <div className="col-span-4">{t("admin.quotations.status")}</div>
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
                    <h3 className="mt-4 text-lg font-bold">{t("admin.quotations.no_quotation_requests_found")}</h3>
                    <p className="mt-2 text-sm text-slate-500">{t("admin.quotations.try_another_search_term_or_clear_the_filters")}</p>
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
                  <h3 className="mt-4 text-lg font-bold">{t("admin.quotations.quotation_details")}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {t("admin.quotations.select_a_request_to_see_the_full_item_list")}
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
  const { t } = useTranslation();
  const meta = STATUS_META[quotation.status] || STATUS_META.submitted;
  const StatusIcon = meta.icon;
  const itemsLabel = (quotation.items || []).map((i) => `${i.productName} x${i.quantity}`).join(", ");

  return (
    <div className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-slate-50 transition">
      <div className="col-span-3">
        <button onClick={onSelect} className="text-start group">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition truncate">
                {quotation.requester?.fullName || t("admin.quotations.unknown")}
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
        <button onClick={onSelect} className="text-start w-full">
          <div className="text-sm text-slate-700 truncate" title={itemsLabel}>{itemsLabel || "—"}</div>
          <div className="mt-1 text-xs text-slate-400">{(quotation.items || []).length} {t("admin.quotations.item_s")}</div>
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
          title={!canManage ? t("admin.common.permission_denied") : undefined}
          className={`w-full appearance-none rounded-2xl border px-3 py-2.5 text-sm font-semibold outline-none ${meta.pill} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status} className="text-slate-900 bg-white">
              {t(STATUS_META[status].labelKey)}
            </option>
          ))}
        </select>
        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.pill}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {t(meta.labelKey)}
        </div>
      </div>
    </div>
  );
}

function QuotationDetailsCard({ quotation, onClose, onStatusChange, actionLoading, canManage }) {
  const { t } = useTranslation();
  const meta = STATUS_META[quotation.status] || STATUS_META.submitted;
  const StatusIcon = meta.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">{t("admin.quotations.quotation_details")}</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight">{quotation.requester?.fullName}</h2>
        </div>
        <button onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          {t("admin.quotations.close")}
        </button>
      </div>

      <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${meta.pill}`}>
        <StatusIcon className="h-4 w-4" />
        {t(meta.labelKey)}
      </div>

      <div className="mt-5 space-y-4">
        <InfoBlock label={t("admin.quotations.phone")} value={quotation.requester?.phone} icon={Phone} />
        {quotation.requester?.email && <InfoBlock label={t("admin.quotations.email")} value={quotation.requester.email} icon={Mail} />}
        {quotation.requester?.company && <InfoBlock label={t("admin.quotations.company")} value={quotation.requester.company} icon={Building2} />}
        <InfoBlock label={t("admin.quotations.customer_type")} value={CUSTOMER_TYPE_KEYS[quotation.requester?.customerType] ? t(CUSTOMER_TYPE_KEYS[quotation.requester.customerType]) : quotation.requester?.customerType} />
        {quotation.requester?.address && <InfoBlock label={t("admin.quotations.address")} value={quotation.requester.address} />}
        {quotation.requester?.notes && <InfoBlock label={t("admin.quotations.notes")} value={quotation.requester.notes} />}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t("admin.quotations.items")}</div>
          <div className="space-y-2">
            {(quotation.items || []).map((item, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-semibold text-slate-800">{item.productName} × {item.quantity}</div>
                {item.productSerialNumber && <div className="text-xs text-slate-500">{t("admin.quotations.sn")} {item.productSerialNumber}</div>}
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
          {t("admin.quotations.mark_under_review")}
        </button>
        <button
          onClick={() => onStatusChange("quoted")}
          disabled={actionLoading || !canManage}
          className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {t("admin.quotations.mark_quoted")}
        </button>
        <button
          onClick={() => onStatusChange("approved")}
          disabled={actionLoading || !canManage}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {t("admin.quotations.approve")}
        </button>
        <button
          onClick={() => onStatusChange("rejected")}
          disabled={actionLoading || !canManage}
          className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
        >
          {t("admin.quotations.reject")}
        </button>
      </div>

      <button
        onClick={() => onStatusChange("closed")}
        disabled={actionLoading || !canManage}
        title={!canManage ? t("admin.common.permission_denied") : t("admin.quotations.close_request")}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Archive className="h-4 w-4" />
        {t("admin.quotations.close_request")}
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
