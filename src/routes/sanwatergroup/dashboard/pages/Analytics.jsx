import { useMemo, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useBusinessAnalytics, useFetchAnalytics, useFunnelBreakdown } from "@/hooks/useAnalytics";
import DateFilter from "@/components/dashboard/analytics/DateFilter";
import BusinessKpiCard from "@/components/dashboard/analytics/BusinessKpiCard";
import KpiTrendChart from "@/components/dashboard/analytics/KpiTrendChart";
import BusinessInsightCard from "@/components/dashboard/analytics/BusinessInsightCard";
import CommercialFunnel from "@/components/dashboard/analytics/CommercialFunnel";
import ProductPerformanceTable from "@/components/dashboard/analytics/ProductPerformanceTable";
import SourceQualityTable from "@/components/dashboard/analytics/SourceQualityTable";
import { formatDZD, formatNumber, formatRate } from "@/components/dashboard/analytics/analyticsFormatters";

const TABS = [["overview", "Overview"], ["conversion", "Conversion"], ["products", "Products"], ["acquisition", "Acquisition"], ["behavior", "Website Behavior"], ["crm", "CRM"]];

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  const iso = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

function Section({ title, description, children, action }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-bold tracking-tight text-slate-950">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}</div>{action}</div><div className="mt-5">{children}</div></section>;
}

function ErrorPanel({ title, onRetry }) {
  return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6"><p className="font-bold text-rose-900">{title}</p><p className="mt-1 text-sm text-rose-700">Other analytics remain available. Retry this section when ready.</p><button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white">Retry</button></div>;
}

function SkeletonCards() {
  return <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-36 rounded-3xl bg-slate-200" />)}</div>;
}

function BehaviorChart({ data = [] }) {
  if (!data.length) return <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No behavioral trend data for this period.</p>;
  return <div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} /><Tooltip /><Area type="monotone" dataKey="traffic" name="Page views" stroke="#2563eb" fill="#dbeafe" strokeWidth={2.5} /><Area type="monotone" dataKey="conversions" name="Generic conversions" stroke="#0f766e" fill="transparent" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>;
}

function BreakdownBars({ items = [], labelKey = "name", valueKey = "value" }) {
  const normalized = items.map((item) => ({ name: item[labelKey] || "Unknown", value: Number(item[valueKey] || 0) })).slice(0, 10);
  if (!normalized.length) return <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">No data for this breakdown.</p>;
  return <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={normalized} layout="vertical" margin={{ left: 8, right: 8 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div>;
}

export default function Analytics() {
  const [filters, setFilters] = useState(defaultRange);
  const [activeView, setActiveView] = useState("overview");
  const [selectedStage, setSelectedStage] = useState("product_view");
  const [dimension, setDimension] = useState("source");
  const business = useBusinessAnalytics(filters);
  const diagnostics = useFetchAnalytics(filters);
  const breakdown = useFunnelBreakdown(filters, activeView === "conversion" ? selectedStage : null, dimension);
  const periodLabel = useMemo(() => {
    if (!business.data?.period) return "Last 30 days";
    const format = (value) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
    return `${format(business.data.period.from)} – ${format(business.data.period.to)}`;
  }, [business.data]);
  const refresh = () => Promise.allSettled([business.load(), diagnostics.load()]);
  const kpis = business.data?.kpis;

  return <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-5">
    <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-300"><Activity className="h-4 w-4" />Decision analytics</div><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Business Performance</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Revenue, commercial conversion, product opportunity, and acquisition quality first. Website diagnostics remain available when you need to explain why.</p><p className="mt-3 text-xs font-semibold text-blue-200">{periodLabel}</p></div><button type="button" onClick={refresh} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-slate-900 hover:bg-blue-50"><RefreshCw className="h-4 w-4" />Refresh all</button></div></header>
    <div className="rounded-3xl border border-slate-200 bg-white p-4"><DateFilter filters={filters} setFilters={setFilters} /></div>
    <nav className="flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5">{TABS.map(([id, label]) => <button key={id} type="button" onClick={() => setActiveView(id)} className={`min-w-fit rounded-xl px-4 py-2.5 text-xs font-bold transition ${activeView === id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}>{label}</button>)}</nav>

    {activeView === "overview" && <div className="space-y-5">{business.error && !business.data ? <ErrorPanel title="Business analytics unavailable" onRetry={business.load} /> : business.loading && !business.data ? <SkeletonCards /> : kpis && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><BusinessKpiCard label="Revenue" metric={kpis.revenue} format={formatDZD} /><BusinessKpiCard label="Orders" metric={kpis.orders} format={formatNumber} /><BusinessKpiCard label="Qualified Leads" metric={kpis.qualifiedLeads} format={formatNumber} /><BusinessKpiCard label="Visitor → Lead" metric={kpis.visitorToLead} format={formatRate} /><BusinessKpiCard label="Lead → Order" metric={kpis.leadToOrder} format={formatRate} /></div>
      <div className="max-w-sm"><BusinessKpiCard secondary label="Average Order Value" metric={kpis.averageOrderValue} format={formatDZD} /></div>
      <KpiTrendChart data={business.data.trend} />
      <Section title="What Needs Attention" description="Up to five material, high-confidence business signals. Minor diagnostic noise is suppressed.">{business.data.insights?.length ? <div className="grid gap-3 lg:grid-cols-2">{business.data.insights.map((insight) => <BusinessInsightCard key={insight.id} insight={insight} onAction={setActiveView} />)}</div> : <p className="rounded-2xl bg-emerald-50 p-6 text-sm text-emerald-800">No material business anomalies meet the current confidence and volume thresholds.</p>}</Section>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-900"><strong>Commercial definition:</strong> {business.data.definitions.orderDefinition}; revenue is {business.data.definitions.revenueDefinition.toLowerCase()}. {business.data.definitions.attribution}</div>
    </>}</div>}

    {activeView === "conversion" && <div className="space-y-5">{business.error && !business.data ? <ErrorPanel title="Conversion analytics unavailable" onRetry={business.load} /> : business.data && <><Section title="Commercial funnel" description="Unique visitors or commercial entities at every stage. Click a stage to inspect one segment at a time."><CommercialFunnel funnel={business.data.funnel} selectedStage={selectedStage} onSelectStage={setSelectedStage} /></Section><Section title="Stage diagnostics" description="Progressive breakdown for the selected funnel stage." action={<select value={dimension} onChange={(event) => setDimension(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><option value="product">Product</option><option value="device">Device</option><option value="source">Source</option><option value="campaign">Campaign</option><option value="landingPage">Landing page</option></select>}>{breakdown.loading ? <div className="h-72 animate-pulse rounded-2xl bg-slate-100" /> : breakdown.error ? <ErrorPanel title="Funnel breakdown unavailable" onRetry={() => setDimension((current) => current)} /> : breakdown.data?.available === false ? <p className="rounded-2xl bg-amber-50 p-6 text-sm text-amber-800">{breakdown.data.reason}</p> : <BreakdownBars items={breakdown.data?.rows} />}</Section></>}</div>}
    {activeView === "products" && <Section title="Product Performance" description="Demand uses unique viewers. Classifications compare eligible products with the current site distribution and suppress tiny samples.">{business.error && !business.data ? <ErrorPanel title="Product analytics unavailable" onRetry={business.load} /> : <ProductPerformanceTable products={business.data?.products} />}</Section>}
    {activeView === "acquisition" && <Section title="Source Quality" description="Sources are ranked by commercial quality and revenue, with traffic retained as context.">{business.error && !business.data ? <ErrorPanel title="Acquisition analytics unavailable" onRetry={business.load} /> : <SourceQualityTable sources={business.data?.acquisition?.sources} />}</Section>}
    {activeView === "behavior" && <div className="space-y-5">{diagnostics.error && !diagnostics.data ? <ErrorPanel title="Website behavior unavailable" onRetry={diagnostics.load} /> : diagnostics.loading && !diagnostics.data ? <SkeletonCards /> : diagnostics.data && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><BusinessKpiCard label="Page Views" metric={{ current: diagnostics.data.traffic, previous: 0 }} format={formatNumber} secondary /><BusinessKpiCard label="Sessions" metric={{ current: diagnostics.data.uniqueSessions, previous: 0 }} format={formatNumber} secondary /><BusinessKpiCard label="Generic conversions" metric={{ current: diagnostics.data.conversions, previous: 0 }} format={formatNumber} secondary /><BusinessKpiCard label="Event conversion rate" metric={{ current: Number(diagnostics.data.conversionRate || 0) * 100, previous: 0 }} format={formatRate} secondary /></div><Section title="Website activity" description="Behavioral diagnostics that help explain commercial movement."><BehaviorChart data={diagnostics.data.trend} /></Section><div className="grid gap-5 lg:grid-cols-3"><Section title="Traffic sources"><BreakdownBars items={diagnostics.data.sources} labelKey="source" valueKey="count" /></Section><Section title="Devices"><BreakdownBars items={diagnostics.data.devices} labelKey="name" valueKey="count" /></Section><Section title="Top pages"><BreakdownBars items={diagnostics.data.topPages} labelKey="path" valueKey="count" /></Section></div><Section title="Recent activity" description="Latest raw events for debugging tracking and legacy behavior analytics.">{diagnostics.data.recentEvents?.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{diagnostics.data.recentEvents.map((event) => <article key={event._id} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold text-slate-900">{event.type}</p><p className="mt-1 truncate text-[11px] text-slate-500">{event.path || event.conversion_name || "No path"}</p><p className="mt-2 text-[10px] font-semibold capitalize text-blue-700">{event.source || "direct"}</p></article>)}</div> : <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">No recent events in this period.</p>}</Section></>}</div>}
    {activeView === "crm" && <Section title="CRM Diagnostic" description="Existing lead records remain available for operational follow-up; they do not replace the executive KPIs.">{diagnostics.error && !diagnostics.data ? <ErrorPanel title="CRM analytics unavailable" onRetry={diagnostics.load} /> : diagnostics.data?.crmLeads?.length ? <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[700px] w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="p-4">Lead</th><th className="p-4">Stage</th><th className="p-4">Source</th><th className="p-4">Value</th><th className="p-4">Owner</th></tr></thead><tbody className="divide-y divide-slate-100">{diagnostics.data.crmLeads.map((lead) => <tr key={lead.id}><td className="p-4 font-bold text-slate-900">{lead.name}</td><td className="p-4 capitalize">{lead.stage}</td><td className="p-4 capitalize">{lead.source}</td><td className="p-4">{formatDZD(lead.value)}</td><td className="p-4">{lead.owner}</td></tr>)}</tbody></table></div> : <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No CRM records in this period.</p>}</Section>}
  </div></main>;
}
