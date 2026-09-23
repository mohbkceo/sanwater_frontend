import { useTranslation } from "@/lib/i18n";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Filter,
  Loader2,
  Mail,
  MessageSquarePlus,
  Package,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addLeadNote,
  assignLead,
  getLead,
  getLeadOptions,
  getLeads,
  updateLead,
  updateLeadStatus,
} from "@/services/leads/leadServices";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/configs/permissions";
import { SAN_WATER_GROUP_NAME } from "@/configs/brand";

const STATUSES = [
  "new",
  "contacted",
  "qualified",
  "quote_sent",
  "won",
  "lost",
  "archived",
];
const STATUS_LABELS = {
  new: "admin.leads.status_new",
  contacted: "admin.leads.status_contacted",
  qualified: "admin.leads.status_qualified",
  quote_sent: "admin.leads.status_quote_sent",
  won: "admin.leads.status_won",
  lost: "admin.leads.status_lost",
  archived: "admin.leads.status_archived",
};
const LOST_REASONS = {
  price: "admin.leads.loss_price",
  no_response: "admin.leads.loss_no_response",
  competitor: "admin.leads.loss_competitor",
  not_interested: "admin.leads.loss_not_interested",
  invalid_lead: "admin.leads.loss_invalid_lead",
  other: "admin.leads.loss_other",
};
const EMPTY_FILTERS = {
  search: "",
  status: "",
  assignedTo: "",
  product: "",
  source: "",
  from: "",
  to: "",
};

const money = (value, lang) =>
  new Intl.NumberFormat(lang, {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const dateTime = (value, lang) =>
  value
    ? new Intl.DateTimeFormat(lang, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export default function LeadsManagementPage() {
  const { lang, t } = useTranslation();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.LEADS.MANAGE);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    leads: [],
    summary: {},
    totalPages: 1,
    totalItems: 0,
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sources, setSources] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(filters.search.trim()), 350);
    return () => clearTimeout(timer);
  }, [filters.search]);
  useEffect(() => {
    setPage(1);
  }, [
    search,
    filters.status,
    filters.assignedTo,
    filters.product,
    filters.source,
    filters.from,
    filters.to,
  ]);
  // load is intentionally keyed to the server-side query fields below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [
    page,
    search,
    filters.status,
    filters.assignedTo,
    filters.product,
    filters.source,
    filters.from,
    filters.to,
  ]);
  useEffect(() => {
    getLeadOptions()
      .then((result) => {
        setUsers(result?.data?.users || []);
        setProducts(result?.data?.products || []);
        setSources(result?.data?.sources || []);
      })
      .catch(() => {});
  }, []);

  async function load(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError("");
      const response = await getLeads({
        page,
        limit: 20,
        search: search || undefined,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([key, value]) => key !== "search" && value,
          ),
        ),
      });
      setData(
        response?.data || {
          leads: [],
          summary: {},
          totalPages: 1,
          totalItems: 0,
        },
      );
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.leads.failed_to_load_leads"));
    } finally {
      setLoading(false);
    }
  }

  async function openLead(id) {
    try {
      setDetailLoading(true);
      setSelected((await getLead(id))?.data || null);
    } catch {
      toast.error(t("admin.leads.could_not_load_lead_details"));
    } finally {
      setDetailLoading(false);
    }
  }

  const stats = data.summary || {};
  const cards = [
    [t("admin.leads.total_leads"), stats.total],
    [t("admin.leads.status_new"), stats.new],
    [t("admin.leads.status_contacted"), stats.contacted],
    [t("admin.leads.status_qualified"), stats.qualified],
    [t("admin.leads.status_quote_sent"), stats.quote_sent],
    [t("admin.leads.status_won"), stats.won],
    [t("admin.leads.status_lost"), stats.lost],
    [t("admin.leads.pipeline_value"), money(stats.estimatedPipelineValue, lang)],
  ];

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/80 px-4 py-5 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">
              {SAN_WATER_GROUP_NAME}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {t("admin.leads.sales_leads")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("admin.leads.manage_inquiry_follow_up_qualification_quote_and_outcome")}
            </p>
          </div>
          <button
            onClick={() => load(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            {t("admin.leads.refresh")}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <SummaryCard key={label} label={label} value={value || 0} />
          ))}
        </div>
        <section className="mt-6 overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterField icon={Search}>
              <input
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                placeholder={t("admin.leads.name_phone_email_company_product")}
              />
            </FilterField>
            <FilterField icon={Filter}>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">{t("admin.leads.all_statuses")}</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(STATUS_LABELS[status])}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField icon={UserRound}>
              <select
                value={filters.assignedTo}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, assignedTo: e.target.value }))
                }
              >
                <option value="">{t("admin.leads.all_assignees")}</option>
                <option value="unassigned">{t("admin.leads.unassigned")}</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField icon={Package}>
              <select
                value={filters.product}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, product: e.target.value }))
                }
              >
                <option value="">{t("admin.leads.all_products")}</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name || product.productId}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField>
              <select
                value={filters.source}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, source: e.target.value }))
                }
              >
                <option value="">{t("admin.leads.all_sources")}</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField>
              <input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, from: e.target.value }))
                }
              />
            </FilterField>
            <FilterField>
              <input
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, to: e.target.value }))
                }
              />
            </FilterField>
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
            >
              {t("admin.leads.clear_filters")}
            </button>
          </div>
          {error && (
            <div className="m-4 flex gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-start text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">{t("admin.leads.customer")}</th>
                  <th className="px-5 py-3">{t("admin.leads.interest")}</th>
                  <th className="px-5 py-3">{t("admin.leads.status")}</th>
                  <th className="px-5 py-3">{t("admin.leads.assigned")}</th>
                  <th className="px-5 py-3">{t("admin.leads.follow_up")}</th>
                  <th className="px-5 py-3">{t("admin.leads.value")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="6" className="p-3">
                        <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : data.leads?.length ? (
                  data.leads.map((lead) => (
                    <LeadRow
                      key={lead._id}
                      lead={lead}
                      onClick={() => openLead(lead._id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <Search className="mx-auto h-8 w-8 text-slate-300" />
                      <h3 className="mt-3 font-bold">{t("admin.leads.no_leads_found")}</h3>
                      <p className="mt-1 text-slate-500">
                        {t("admin.leads.try_clearing_or_changing_the_filters")}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
            <span>{t("admin.leads.lead_count", { count: data.totalItems || 0 })}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                {t("admin.common.page_of", { page, total: data.totalPages || 1 })}
              </span>
              <button
                disabled={page >= (data.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
      {(selected || detailLoading) && (
        <LeadDrawer
          lead={selected}
          loading={detailLoading}
          users={users}
          canManage={canManage}
          onClose={() => setSelected(null)}
          onChanged={async () => {
            if (selected) await openLead(selected._id);
            await load(true);
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
function FilterField({ icon: Icon, children }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <div
        className={`[&>*]:w-full [&>*]:rounded-2xl [&>*]:border [&>*]:border-slate-200 [&>*]:bg-slate-50 [&>*]:py-3 [&>*]:pe-3 [&>*]:text-sm [&>*]:outline-none ${Icon ? "[&>*]:ps-11" : "[&>*]:ps-4"}`}
      >
        {children}
      </div>
    </div>
  );
}

function followUpMeta(value) {
  if (!value) return null;
  const due = new Date(value);
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  if (dueDay < start)
    return { labelKey: "admin.leads.follow_up_overdue", className: "bg-rose-50 text-rose-700" };
  if (+dueDay === +start)
    return { labelKey: "admin.leads.follow_up_due_today", className: "bg-amber-50 text-amber-700" };
  return { labelKey: "admin.leads.follow_up_upcoming", className: "bg-blue-50 text-blue-700" };
}

function LeadRow({ lead, onClick }) {
  const { lang, t } = useTranslation();
  const follow = followUpMeta(lead.nextFollowUpAt);
  return (
    <tr onClick={onClick} className="cursor-pointer hover:bg-blue-50/40">
      <td className="px-5 py-4">
        <p className="font-semibold">{lead.fullName}</p>
        <p className="mt-1 text-xs text-slate-500">
          {lead.phone}
          {lead.company ? ` · ${lead.company}` : ""}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium">{lead.productName}</p>
        <p className="text-xs text-slate-500">
          {t("admin.leads.quantity_source", { quantity: lead.quantity, source: lead.source || t("admin.leads.unknown") })}
        </p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={lead.status} />
      </td>
      <td className="px-5 py-4">{lead.assignedTo?.fullName || t("admin.leads.unassigned")}</td>
      <td className="px-5 py-4">
        {follow ? (
          <>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold ${follow.className}`}
            >
              {t(follow.labelKey)}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              {dateTime(lead.nextFollowUpAt, lang)}
            </p>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="px-5 py-4 font-semibold">{money(lead.estimatedValue, lang)}</td>
    </tr>
  );
}
function StatusBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
      {STATUS_LABELS[status] ? t(STATUS_LABELS[status]) : status}
    </span>
  );
}

function LeadDrawer({ lead, loading, users, canManage, onClose, onChanged }) {
  const { lang, t } = useTranslation();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [lostExplanation, setLostExplanation] = useState("");
  const timeline = useMemo(() => {
    if (!lead) return [];
    return [
      {
        at: lead.createdAt,
        label: t("admin.leads.lead_created"),
        detail: lead.source || t("admin.leads.unknown_source"),
      },
      ...(lead.statusHistory || [])
        .filter((item) => item.previousStatus)
        .map((item) => ({
          at: item.changedAt,
          label: t("admin.leads.status_transition", { from: STATUS_LABELS[item.previousStatus] ? t(STATUS_LABELS[item.previousStatus]) : item.previousStatus, to: STATUS_LABELS[item.newStatus] ? t(STATUS_LABELS[item.newStatus]) : item.newStatus }),
          detail: item.changedBy?.fullName || t("admin.leads.system"),
        })),
      ...(lead.assignmentHistory || []).map((item) => ({
        at: item.changedAt,
        label: t("admin.leads.assignment_changed"),
        detail: item.newAssignee?.fullName || t("admin.leads.unassigned"),
      })),
      ...(lead.notes || []).map((item) => ({
        at: item.createdAt,
        label: t("admin.leads.internal_note"),
        detail: t("admin.leads.note_by_author", { author: item.author?.fullName || t("admin.shell.admin"), content: item.content }),
      })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [lead, t]);

  async function act(callback, message) {
    try {
      setSaving(true);
      await callback();
      toast.success(message);
      await onChanged();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("admin.leads.update_failed"));
    } finally {
      setSaving(false);
    }
  }
  if (loading || !lead)
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <aside
        className="ms-auto h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">
              {t("admin.leads.lead_details")}
            </p>
            <h2 className="mt-1 text-2xl font-bold">{lead.fullName}</h2>
            <div className="mt-2">
              <StatusBadge status={lead.status} />
            </div>
          </div>
          <button onClick={onClose} className="rounded-full border p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Section title={t("admin.leads.customer")}>
          <Info icon={Phone} label={t("admin.leads.phone")} value={lead.phone} />
          <Info icon={Mail} label={t("admin.leads.email")} value={lead.email} />
          <Info label={t("admin.leads.company")} value={lead.company} />
          <Info label={t("admin.leads.wilaya")} value={lead.wilaya} />
        </Section>
        <Section title={t("admin.leads.interest")}>
          <Info
            icon={Package}
            label={t("admin.leads.product")}
            value={`${lead.productName} × ${lead.quantity}`}
          />
          <Info
            icon={CircleDollarSign}
            label={t("admin.leads.estimated_value")}
            value={money(lead.estimatedValue, lang)}
          />
        </Section>
        <Section title={t("admin.leads.attribution")}>
          <Info
            label={t("admin.leads.source_medium")}
            value={
              [lead.source, lead.medium].filter(Boolean).join(" / ") ||
              t("admin.leads.unknown_source")
            }
          />
          <Info label={t("admin.leads.campaign")} value={lead.campaign} />
          <Info label={t("admin.leads.referrer")} value={lead.referrer} />
          <Info label={t("admin.leads.landing_page")} value={lead.landingPage} />
        </Section>
        <Section title={t("admin.leads.management")}>
          <label className="text-xs font-bold uppercase text-slate-400">
            {t("admin.leads.assigned_employee")}
          </label>
          <select
            disabled={!canManage || saving}
            value={lead.assignedTo?._id || ""}
            onChange={(e) =>
              act(
                () => assignLead(lead._id, e.target.value || null),
                t("admin.leads.lead_assigned"),
              )
            }
            className="mt-2 w-full rounded-2xl border p-3"
          >
            <option value="">{t("admin.leads.unassigned")}</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullName}
              </option>
            ))}
          </select>
          <label className="mt-4 block text-xs font-bold uppercase text-slate-400">
            {t("admin.leads.next_follow_up")}
          </label>
          <input
            disabled={!canManage || saving}
            type="datetime-local"
            defaultValue={
              lead.nextFollowUpAt
                ? new Date(
                    new Date(lead.nextFollowUpAt).getTime() -
                      new Date().getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
            onBlur={(e) =>
              act(
                () =>
                  updateLead(lead._id, {
                    nextFollowUpAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  }),
                t("admin.leads.follow_up_updated"),
              )
            }
            className="mt-2 w-full rounded-2xl border p-3"
          />
          <label className="mt-4 block text-xs font-bold uppercase text-slate-400">
            {t("admin.leads.status")}
          </label>
          <select
            disabled={!canManage || saving}
            value={status || lead.status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 w-full rounded-2xl border p-3"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(STATUS_LABELS[item])}
              </option>
            ))}
          </select>
          {status === "won" && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                min="0"
                value={finalValue}
                onChange={(e) => setFinalValue(e.target.value)}
                placeholder={t("admin.leads.final_value")}
                className="rounded-2xl border p-3"
              />
              <input
                value={orderReference}
                onChange={(e) => setOrderReference(e.target.value)}
                placeholder={t("admin.leads.order_reference")}
                className="rounded-2xl border p-3"
              />
            </div>
          )}
          {status === "lost" && (
            <div className="mt-3 space-y-3">
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full rounded-2xl border p-3"
              >
                <option value="">{t("admin.leads.select_loss_reason")}</option>
                {Object.entries(LOST_REASONS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {t(value)}
                  </option>
                ))}
              </select>
              <textarea
                value={lostExplanation}
                onChange={(e) => setLostExplanation(e.target.value)}
                placeholder={t("admin.leads.optional_explanation")}
                className="w-full rounded-2xl border p-3"
              />
            </div>
          )}
          {status && status !== lead.status && (
            <button
              disabled={
                saving ||
                (status === "won" && finalValue === "") ||
                (status === "lost" && !lostReason)
              }
              onClick={() =>
                act(
                  () =>
                    updateLeadStatus(lead._id, {
                      status,
                      ...(status === "won"
                        ? { finalValue: Number(finalValue), orderReference }
                        : {}),
                      ...(status === "lost"
                        ? { lostReason, lostExplanation }
                        : {}),
                    }),
                  t("admin.leads.status_updated"),
                )
              }
              className="mt-3 w-full rounded-2xl bg-blue-600 p-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t("admin.leads.save_status_change")}
            </button>
          )}
        </Section>
        <Section title={t("admin.leads.internal_notes")}>
          <div className="flex gap-2">
            <textarea
              disabled={!canManage}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("admin.leads.add_an_internal_note")}
              className="min-h-20 flex-1 rounded-2xl border p-3 text-sm"
            />
            <button
              disabled={!canManage || saving || !note.trim()}
              onClick={() =>
                act(async () => {
                  await addLeadNote(lead._id, note.trim());
                  setNote("");
                }, t("admin.leads.note_added"))
              }
              className="self-end rounded-2xl bg-slate-900 p-3 text-white"
            >
              <MessageSquarePlus className="h-5 w-5" />
            </button>
          </div>
        </Section>
        <Section title={t("admin.leads.timeline")}>
          <div className="space-y-3">
            {timeline.map((item, index) => (
              <div
                key={`${item.at}-${index}`}
                className="border-s-2 border-blue-200 ps-4"
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {dateTime(item.at, lang)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </aside>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
      <h3 className="mb-4 font-bold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}
