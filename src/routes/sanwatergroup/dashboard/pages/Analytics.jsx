import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  
} from "recharts";
import {
  Activity,

  Building2,

  ChartColumnBig,
  CircleDollarSign,
  Clock3,
 
  Download,
  Filter,
  
  Gauge,
  LayoutGrid,
  LifeBuoy,

  Mail,
  RefreshCw,
  Search,
  Settings2,
  Target,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import { useFetchAnalytics } from "@/hooks/useAnalytics";
import DateFilter from "@/components/dashboard/analytics/DateFilter";

function StatCard({ label, value, subtext, icon: Icon, trend, tone = "slate" }) {
  const tones = {
    slate: "from-slate-50 to-white border-slate-200 text-slate-900",
    emerald: "from-emerald-50 to-white border-emerald-200 text-emerald-900",
    sky: "from-sky-50 to-white border-sky-200 text-sky-900",
    amber: "from-amber-50 to-white border-amber-200 text-amber-900",
    violet: "from-violet-50 to-white border-violet-200 text-violet-900",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-70">{label}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
          {subtext ? <p className="mt-2 text-sm opacity-70">{subtext}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl border border-black/5 bg-white/70 p-3 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {trend ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold shadow-sm">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </div>
      ) : null}
    </div>
  );
}

function SectionCard({ title, description, children, actions, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

function MetricPill({ label, value, icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-800 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    sky: "bg-sky-50 text-sky-800 border-sky-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    violet: "bg-violet-50 text-violet-800 border-violet-200",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
      </div>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function normalizeList(list = [], mapFn) {
  return Array.isArray(list) ? list.map(mapFn) : [];
}

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return "0";
  return new Intl.NumberFormat().format(Number(value));
}

function percent(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

function Analytics() {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const { data, loading, load } = useFetchAnalytics(filters);

  useEffect(() => {
    load();
  }, [filters]);

  const sourceColors = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

  const sources = useMemo(
    () =>
      normalizeList(data?.sources, (item) => ({
        name: item.source || item.name || "unknown",
        value: item.count ?? item.value ?? 0,
      })),
    [data]
  );

  const topPages = useMemo(
    () =>
      normalizeList(data?.topPages, (item) => ({
        path: item.path || "/",
        value: item.count ?? item.value ?? 0,
      })),
    [data]
  );

  const devices = useMemo(
    () =>
      normalizeList(data?.devices, (item) => ({
        name: item.name || item.device || "unknown",
        value: item.count ?? item.value ?? 0,
      })),
    [data]
  );

  const trend = useMemo(
    () =>
      normalizeList(data?.trend, (item) => ({
        date: item.date,
        traffic: item.traffic ?? 0,
        conversions: item.conversions ?? 0,
        revenue: item.revenue ?? 0,
        qualifiedLeads: item.qualifiedLeads ?? 0,
      })),
    [data]
  );

  const funnel = useMemo(
    () =>
      normalizeList(data?.funnel, (item) => ({
        name: item.name,
        value: item.value ?? 0,
      })),
    [data]
  );

  const recentEvents = useMemo(
    () =>
      normalizeList(data?.recentEvents, (item) => ({
        id: item._id || item.id,
        type: item.type,
        path: item.path,
        conversion_name: item.conversion_name,
        source: item.source,
        ts: item.ts,
      })),
    [data]
  );

  const crmLeads = useMemo(() => {
    const base = normalizeList(data?.crmLeads, (item) => ({
      id: item.id || item._id,
      name: item.name || item.company || "Unknown lead",
      stage: item.stage || "New",
      source: item.source || "Direct",
      value: item.value ?? 0,
      probability: item.probability ?? 0,
      owner: item.owner || "Unassigned",
      lastTouch: item.lastTouch || item.updatedAt || "—",
    }));

    if (base.length) return base;

    return [
      { id: "l1", name: "Beauty salon prospect", stage: "Qualified", source: "Instagram", value: 120000, probability: 68, owner: "Sales 01", lastTouch: "Today" },
      { id: "l2", name: "Clinic branch lead", stage: "Proposal", source: "WhatsApp", value: 230000, probability: 82, owner: "Sales 02", lastTouch: "Yesterday" },
      { id: "l3", name: "Restaurant chain", stage: "New", source: "Landing page", value: 95000, probability: 24, owner: "Unassigned", lastTouch: "2d ago" },
      { id: "l4", name: "Hotel group", stage: "Won", source: "Referral", value: 410000, probability: 100, owner: "Sales 01", lastTouch: "3d ago" },
    ];
  }, [data]);

  const crmStages = useMemo(() => {
    const byStage = crmLeads.reduce((acc, lead) => {
      acc[lead.stage] = acc[lead.stage] || { count: 0, value: 0 };
      acc[lead.stage].count += 1;
      acc[lead.stage].value += Number(lead.value || 0);
      return acc;
    }, {});

    return Object.entries(byStage).map(([name, stats]) => ({ name, ...stats }));
  }, [crmLeads]);

  const alerts = useMemo(() => {
    const revenue = trend.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
    const traffic = Number(data?.traffic || 0);
    const conversions = Number(data?.conversions || 0);
    const conversionRateValue = traffic > 0 ? conversions / traffic : 0;

    return [
      {
        title: "Conversion efficiency",
        detail:
          conversionRateValue < 0.02
            ? "Conversion rate is below target. Review top pages, CTA placement, and funnel friction."
            : "Conversion performance is within the acceptable range.",
        tone: conversionRateValue < 0.02 ? "amber" : "emerald",
      },
      {
        title: "Revenue concentration",
        detail:
          revenue > 0
            ? "Introduce lead source attribution and deal-stage revenue tracking for better forecasting."
            : "Revenue tracking is not available yet. Keep the section ready for backend binding.",
        tone: "sky",
      },
      {
        title: "CRM coverage",
        detail:
          crmLeads.length < 10
            ? "Add lead owner, next step, value, and follow-up date fields to make the CRM usable at scale."
            : "CRM contains enough structure for pipeline analysis.",
        tone: "violet",
      },
    ];
  }, [crmLeads, data, trend]);

  const filteredLeads = useMemo(() => {
    return crmLeads.filter((lead) => {
      const matchesSearch =
        !search ||
        [lead.name, lead.stage, lead.source, lead.owner]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesSegment = selectedSegment === "all" || lead.stage.toLowerCase() === selectedSegment.toLowerCase();
      return matchesSearch && matchesSegment;
    });
  }, [crmLeads, search, selectedSegment]);

  const conversionRate = useMemo(() => percent(data?.conversionRate || 0), [data]);

  const trafficGrowth = useMemo(() => {
    if (!trend.length) return "+0.0%";
    const first = Number(trend[0]?.traffic || 0);
    const last = Number(trend[trend.length - 1]?.traffic || 0);
    if (!first) return "+0.0%";
    const growth = ((last - first) / first) * 100;
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  }, [trend]);

  const revenueTrend = useMemo(() => {
    if (!trend.length) return "+0.0%";
    const first = trend[0]?.revenue || 0;
    const last = trend[trend.length - 1]?.revenue || 0;
    if (!first) return "+0.0%";
    const growth = ((last - first) / first) * 100;
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  }, [trend]);

  const kpiSummary = useMemo(() => {
    const revenue = trend.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
    const qualified = trend.reduce((sum, item) => sum + Number(item.qualifiedLeads || 0), 0);
    const pipelineValue = crmLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
    const avgDeal = crmLeads.length ? pipelineValue / crmLeads.length : 0;
    return { revenue, qualified, pipelineValue, avgDeal };
  }, [crmLeads, trend]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <p className="text-sm font-medium text-slate-700">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-900 font-semibold">No data available</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting the selected date range.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <Gauge className="h-3.5 w-3.5" />
                Advanced Analytics + CRM
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">Analytics Command Center</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                A unified view for traffic, conversions, pipeline health, customer behavior, and operational alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
                <Settings2 className="h-4 w-4" />
                Configure
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricPill label="Traffic growth" value={trafficGrowth} icon={TrendingUp} tone="emerald" />
            <MetricPill label="Revenue trend" value={revenueTrend} icon={CircleDollarSign} tone="sky" />
            <MetricPill label="Qualified leads" value={formatNumber(kpiSummary.qualified)} icon={Target} tone="amber" />
            <MetricPill label="Pipeline value" value={formatNumber(kpiSummary.pipelineValue)} icon={Building2} tone="violet" />
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <DateFilter filters={filters} setFilters={setFilters} />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "overview", label: "Overview", icon: LayoutGrid },
              { id: "crm", label: "CRM", icon: Workflow },
              { id: "insights", label: "Insights", icon: ChartColumnBig },
              { id: "operations", label: "Operations", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeView === "overview" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Traffic"
                value={formatNumber(data.traffic || 0)}
                subtext="Page views"
                icon={Activity}
                trend="Use source attribution to separate paid, organic, and referral traffic."
                tone="slate"
              />
              <StatCard
                label="Conversions"
                value={formatNumber(data.conversions || 0)}
                subtext="Completed actions"
                icon={Target}
                trend="Track conversion type, form length, and friction points."
                tone="emerald"
              />
              <StatCard
                label="Unique Sessions"
                value={formatNumber(data.uniqueSessions || 0)}
                subtext="Distinct sessions"
                icon={Users}
                trend="Deduplicate multi-device visits when backend is ready."
                tone="sky"
              />
              <StatCard
                label="Conversion Rate"
                value={conversionRate}
                subtext="Conversions / traffic"
                icon={TrendingUp}
                trend="Add target bands and alert thresholds."
                tone="amber"
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <SectionCard
                title="Traffic Trend"
                description="Views, conversions, revenue, and lead quality over time."
                className="xl:col-span-2"
                actions={<button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Drill down</button>}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="traffic" stroke="#0f172a" fillOpacity={0.12} fill="#0f172a" />
                      <Area type="monotone" dataKey="conversions" stroke="#475569" fillOpacity={0.08} fill="#475569" />
                      <Area type="monotone" dataKey="revenue" stroke="#0f766e" fillOpacity={0.08} fill="#0f766e" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="AI Readiness" description="What should exist before server integration.">
                <div className="grid gap-3">
                  {[
                    "Event tagging for CTA clicks, form starts, and form submits.",
                    "Lead scoring by source, page path, and engagement frequency.",
                    "Revenue attribution by campaign, owner, and deal stage.",
                    "Alert rules for drop in traffic, conversion rate, or pipeline value.",
                  ].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <SectionCard title="Source Mix" description="Traffic origin distribution.">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sources} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>
                        {sources.map((_, index) => (
                          <Cell key={index} fill={sourceColors[index % sourceColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Top Sources" description="Highest contributing channels.">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sources} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0f172a" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Device Breakdown" description="Audience device distribution.">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={devices}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#334155" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>
          </>
        ) : null}

        {activeView === "crm" ? (
          <>
            <div className="grid gap-6 xl:grid-cols-3">
              <SectionCard
                title="Pipeline Health"
                description="Lead distribution by stage and aggregated value."
                className="xl:col-span-2"
                actions={
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <select
                        value={selectedSegment}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="bg-transparent text-sm outline-none"
                      >
                        <option value="all">All stages</option>
                        {[...new Set(crmLeads.map((lead) => lead.stage))].map((stage) => (
                          <option key={stage} value={stage.toLowerCase()}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search leads"
                        className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {crmStages.length ? crmStages.map((stage) => (
                    <div key={stage.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-500">{stage.name}</p>
                      <p className="mt-2 text-3xl font-bold">{formatNumber(stage.count)}</p>
                      <p className="mt-2 text-sm text-slate-600">Value: {formatNumber(stage.value)}</p>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                      No CRM data yet. This area is ready for backend binding.
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="CRM Score" description="Ready for future lead scoring rules.">
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Average deal size</p>
                    <p className="mt-1 text-2xl font-bold">{formatNumber(kpiSummary.avgDeal)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Pipeline value</p>
                    <p className="mt-1 text-2xl font-bold">{formatNumber(kpiSummary.pipelineValue)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Qualified leads</p>
                    <p className="mt-1 text-2xl font-bold">{formatNumber(kpiSummary.qualified)}</p>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Lead Board</h2>
                  <p className="text-sm text-slate-500">Use this as the CRM layer before database wiring.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  <Filter className="h-4 w-4" />
                  {filteredLeads.length} leads
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{lead.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{lead.source} · Owner: {lead.owner}</p>
                      </div>
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {lead.stage}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Value</p>
                        <p className="mt-1 font-semibold">{formatNumber(lead.value)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Probability</p>
                        <p className="mt-1 font-semibold">{lead.probability}%</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Last touch</p>
                        <p className="mt-1 font-semibold">{lead.lastTouch}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        View deal
                      </button>
                      <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Log note
                      </button>
                      <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                        Schedule follow-up
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {activeView === "insights" ? (
          <>
            <div className="grid gap-6 xl:grid-cols-3">
              <SectionCard title="Funnel" description="A simple funnel snapshot from the backend data.">
                <div className="grid gap-4">
                  {funnel.length ? funnel.map((step) => (
                    <div key={step.name} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">{step.name}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                          {formatNumber(step.value)}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-slate-900"
                          style={{ width: `${Math.min(100, Number(step.value || 0))}%` }}
                        />
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                      Funnel data is empty.
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Pattern Detection" description="Useful even before server intelligence is connected.">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Peak window</p>
                    <p className="mt-1 text-sm text-slate-600">Track the most active hours and days to place campaigns more efficiently.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Channel quality</p>
                    <p className="mt-1 text-sm text-slate-600">Compare sources by conversion rate, revenue, and lead quality instead of traffic only.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Page efficiency</p>
                    <p className="mt-1 text-sm text-slate-600">Rank pages by visit-to-action ratio, not just views.</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Revenue Forecast" description="A frontend-ready placeholder for future forecasting.">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <SectionCard title="Insights Summary" description="Fast executive view.">
                <div className="grid gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Traffic</p>
                    <p className="mt-1 text-xl font-semibold">{formatNumber(data.traffic || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Conversions</p>
                    <p className="mt-1 text-xl font-semibold">{formatNumber(data.conversions || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Conversion rate</p>
                    <p className="mt-1 text-xl font-semibold">{conversionRate}</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Smart Actions" description="Recommended next steps for the dashboard.">
                <div className="grid gap-3">
                  {[
                    "Add UTM source parsing for better campaign reporting.",
                    "Create saved views for sales, marketing, and executive users.",
                    "Add export to CSV, PDF, and webhook snapshot later.",
                    "Add annotation markers for campaigns, offers, or launches.",
                  ].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Risk Signals" description="Minimal early warning system.">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.title} className={`rounded-2xl border p-4 ${alert.tone === "amber" ? "border-amber-200 bg-amber-50" : alert.tone === "emerald" ? "border-emerald-200 bg-emerald-50" : alert.tone === "sky" ? "border-sky-200 bg-sky-50" : "border-violet-200 bg-violet-50"}`}>
                      <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                      <p className="mt-1 text-sm text-slate-700">{alert.detail}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </>
        ) : null}

        {activeView === "operations" ? (
          <>
            <div className="grid gap-6 xl:grid-cols-3">
              <SectionCard title="Operational Dashboard" description="For support, follow-up, and admin visibility.">
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Mail className="h-4 w-4" /> Inbound leads</div>
                    <p className="mt-2 text-2xl font-bold">{formatNumber(data.inboundLeads || crmLeads.length)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Clock3 className="h-4 w-4" /> SLA health</div>
                    <p className="mt-2 text-2xl font-bold">92%</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><LifeBuoy className="h-4 w-4" /> Open tasks</div>
                    <p className="mt-2 text-2xl font-bold">14</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Customer Journey" description="Prebuilt structure for future event tracking.">
                <div className="space-y-3">
                  {[
                    { label: "Landing page view", value: 100 },
                    { label: "CTA click", value: 72 },
                    { label: "Form start", value: 50 },
                    { label: "Qualified lead", value: 28 },
                    { label: "Won deal", value: 12 },
                  ].map((step) => (
                    <div key={step.label} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">{step.label}</p>
                        <p className="text-sm font-semibold text-slate-900">{step.value}</p>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${step.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="System Notes" description="Frontend-only until backend is connected.">
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="rounded-2xl bg-slate-50 p-4">Use this page as a single source for marketing, sales, and admin dashboards.</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Keep chart schemas stable so backend data can be dropped in later without refactoring.</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Add role-based visibility later: owner, manager, admin, analyst.</div>
                </div>
              </SectionCard>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <SectionCard title="Recent Activity" description="Event stream preview.">
                <div className="space-y-3">
                  {recentEvents.length ? (
                    recentEvents.map((event, index) => (
                      <div key={event.id || index} className="rounded-xl border border-slate-200 p-3">
                        <p className="text-sm font-medium text-slate-900">{event.type}</p>
                        <p className="mt-1 text-xs text-slate-500">{event.path || event.conversion_name || "Unknown action"}</p>
                        <p className="mt-1 text-xs text-slate-400">{event.source || "direct"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No recent events.</p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Summary" description="Core counters.">
                <div className="grid gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Traffic</p>
                    <p className="mt-1 text-xl font-semibold">{formatNumber(data.traffic || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Conversions</p>
                    <p className="mt-1 text-xl font-semibold">{formatNumber(data.conversions || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Unique Sessions</p>
                    <p className="mt-1 text-xl font-semibold">{formatNumber(data.uniqueSessions || 0)}</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Implementation Checklist" description="Nice to add next.">
                <div className="space-y-3">
                  {[
                    "Connect CRM fields to server-side lead objects.",
                    "Add save filters, share views, and personal dashboards.",
                    "Track events with userId, sessionId, source, and campaign.",
                    "Add alerts for anomalies and lost leads.",
                  ].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default Analytics;
