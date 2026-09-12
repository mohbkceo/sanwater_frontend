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
  Download,
  RefreshCw,
  Search,
  Settings2,
  TrendingUp,
} from "lucide-react";

import { useFetchAnalytics } from "@/hooks/useAnalytics";
import DateFilter from "@/components/dashboard/analytics/DateFilter";

/* -------------------------------------------------------------------------- */
/*                              DESIGN TOKENS                                 */
/* -------------------------------------------------------------------------- */

const BLUE = "#2563eb";
const BLUE_DARK = "#1d4ed8";
const BLUE_SOFT = "#dbeafe";
const BLUE_PALE = "#eff6ff";

const CHART_BLUE = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
];

/* -------------------------------------------------------------------------- */
/*                                UTILITIES                                   */
/* -------------------------------------------------------------------------- */

const cn = (...classes) => classes.filter(Boolean).join(" ");

function normalizeList(list = [], mapFn) {
  return Array.isArray(list) ? list.map(mapFn) : [];
}

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "0";
  }

  return new Intl.NumberFormat().format(Number(value));
}

function formatCompactNumber(value) {
  const number = Number(value || 0);

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1)}K`;
  }

  return formatNumber(number);
}

function formatCurrency(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(number);
}

function percent(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

function growthPercentage(items, key) {
  if (!items.length) {
    return "+0.0%";
  }

  const first = Number(items[0]?.[key] || 0);

  const last = Number(items[items.length - 1]?.[key] || 0);

  if (!first) {
    return "+0.0%";
  }

  const growth = ((last - first) / first) * 100;

  return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
}

/* -------------------------------------------------------------------------- */
/*                               UI COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function GlassButton({
  children,
  variant = "secondary",
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",

    secondary:
      "border-blue-100 bg-white/65 text-slate-700 hover:border-blue-200 hover:bg-blue-50/70",

    ghost:
      "border-transparent bg-transparent text-slate-500 hover:bg-blue-50 hover:text-blue-600",
  };

  return (
    <button
      {...props}
      className={cn(
        `
          inline-flex
          h-10
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          px-3.5
          text-xs
          font-semibold
          backdrop-blur-xl
          transition
          duration-200
          disabled:cursor-not-allowed
          disabled:opacity-40
        `,
        variants[variant],
        variant === "primary" && "shadow-xs",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SectionCard({
  title,
  description,
  actions,
  children,
  className = "",
}) {
  return (
    <section
      className={cn(
        `
          overflow-hidden
          rounded-[26px]
          border
          border-blue-100/80
          bg-white
        `,
        className,
      )}
    >
      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-blue-100/70
          px-5
          py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function KpiCard({ label, value, subtext, trend }) {
  return (
    <div
      className="
        rounded-[22px]
        border
        border-blue-100/80
        bg-white
        p-4
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-slate-900">
            {value}
          </p>

          {subtext && (
            <p className="mt-1 text-[11px] text-slate-400">{subtext}</p>
          )}
        </div>

        {trend && (
          <span
            className="
              shrink-0
              rounded-full
              border
              border-blue-100
              bg-blue-50
              px-2.5
              py-1
              text-[10px]
              font-semibold
              text-blue-600
            "
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div
      className="
        flex
        min-h-[180px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-blue-200
        bg-blue-50/30
        px-6
        text-center
      "
    >
      <div
        className="
          h-2
          w-2
          rounded-full
          bg-blue-500
        "
      />

      <p className="mt-4 text-sm font-semibold text-slate-700">{title}</p>

      {description && (
        <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function BreakdownList({ items, currency = false }) {
  if (!items.length) {
    return <EmptyState title="No data yet" description="Metrics will appear after qualifying activity is recorded." />;
  }

  const max = Math.max(...items.map((item) => Number(item.value || 0)), 1);
  return (
    <div className="space-y-3">
      {items.slice(0, 8).map((item) => (
        <div key={item.name}>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium text-slate-600">{item.name}</span>
            <span className="shrink-0 font-semibold text-slate-800">{currency ? formatCurrency(item.value) : formatNumber(item.value)}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(4, (Number(item.value || 0) / max) * 100)}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f6f9ff] px-4 py-6">
      <div className="mx-auto max-w-7xl animate-pulse space-y-5">
        <div className="h-40 rounded-[26px] bg-white" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-[22px] bg-white" />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <div className="h-[430px] rounded-[26px] bg-white xl:col-span-2" />
          <div className="h-[430px] rounded-[26px] bg-white" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CHART TOOLTIP                                 */
/* -------------------------------------------------------------------------- */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="
        min-w-[150px]
        rounded-2xl
        border
        border-blue-100
        bg-white/90
        p-3
        backdrop-blur-xl
        shadow-xs
      "
    >
      <p className="mb-2 text-[10px] font-semibold text-slate-400">
        {label || "Period"}
      </p>

      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-[11px] text-slate-500">
              {item.name || item.dataKey}
            </span>

            <span className="text-[11px] font-semibold text-slate-800">
              {formatCompactNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  MAIN                                      */
/* -------------------------------------------------------------------------- */

function Analytics() {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [selectedSegment, setSelectedSegment] = useState("all");

  const { data, loading, load } = useFetchAnalytics(filters);

  useEffect(() => {
    load();
    // load is supplied by the analytics hook and
    // should run whenever filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  /* ---------------------------------------------------------------------- */
  /*                              NORMALIZED DATA                            */
  /* ---------------------------------------------------------------------- */

  const sources = useMemo(
    () =>
      normalizeList(data?.sources, (item) => ({
        name: item.source || item.name || "Unknown",

        value: item.count ?? item.value ?? 0,
      })),
    [data],
  );

  const devices = useMemo(
    () =>
      normalizeList(data?.devices, (item) => ({
        name: item.name || item.device || "Unknown",

        value: item.count ?? item.value ?? 0,
      })),
    [data],
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
    [data],
  );

  const funnel = useMemo(
    () =>
      normalizeList(data?.businessFunnel?.length ? data.businessFunnel : data?.funnel, (item) => ({
        name: item.name || "Unknown",

        value: item.value ?? 0,
      })),
    [data],
  );

  const leadsBySource = useMemo(
    () => normalizeList(data?.leadsBySource, (item) => ({ name: item.name || "Unknown", value: item.value ?? 0 })),
    [data],
  );

  const leadsByProduct = useMemo(
    () => normalizeList(data?.leadsByProduct, (item) => ({ name: item.name || "Unknown", value: item.value ?? 0 })),
    [data],
  );

  const wonValueBySource = useMemo(
    () => normalizeList(data?.wonValueBySource, (item) => ({ name: item.name || "Unknown", value: item.value ?? 0 })),
    [data],
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
    [data],
  );

  /*
   * IMPORTANT:
   * The old component created fake CRM records when the
   * backend returned no records. That makes analytics
   * misleading. Empty backend data now remains empty.
   */
  const crmLeads = useMemo(
    () =>
      normalizeList(data?.crmLeads, (item) => ({
        id: item.id || item._id,

        name: item.name || item.company || "Unknown lead",

        stage: item.stage || "New",

        source: item.source || "Direct",

        value: item.value ?? 0,

        probability: item.probability ?? 0,

        owner: item.owner || "Unassigned",

        lastTouch: item.lastTouch || item.updatedAt || "—",
      })),
    [data],
  );

  /* ---------------------------------------------------------------------- */
  /*                              CRM STAGES                                */
  /* ---------------------------------------------------------------------- */

  const crmStages = useMemo(() => {
    const byStage = crmLeads.reduce((acc, lead) => {
      const stage = lead.stage || "New";

      if (!acc[stage]) {
        acc[stage] = {
          count: 0,
          value: 0,
        };
      }

      acc[stage].count += 1;

      acc[stage].value += Number(lead.value || 0);

      return acc;
    }, {});

    return Object.entries(byStage).map(([name, stats]) => ({
      name,
      ...stats,
    }));
  }, [crmLeads]);

  /* ---------------------------------------------------------------------- */
  /*                              ALERTS                                    */
  /* ---------------------------------------------------------------------- */

  const alerts = useMemo(() => {
    const revenue = trend.reduce(
      (sum, item) => sum + Number(item.revenue || 0),
      0,
    );

    const traffic = Number(data?.traffic || 0);

    const conversions = Number(data?.conversions || 0);

    const conversionRateValue = traffic > 0 ? conversions / traffic : 0;

    return [
      {
        title: "Conversion efficiency",
        detail:
          conversionRateValue < 0.02
            ? "Conversion rate is below target."
            : "Conversion performance is within the current range.",
        tone: conversionRateValue < 0.02 ? "warning" : "good",
      },
      {
        title: "Revenue attribution",
        detail:
          revenue > 0
            ? "Revenue exists. Add source and deal-stage attribution for stronger forecasting."
            : "No revenue data is available for this period.",
        tone: "info",
      },
      {
        title: "CRM coverage",
        detail:
          crmLeads.length === 0
            ? "No CRM records are available for the selected range."
            : `${crmLeads.length} CRM record${
                crmLeads.length === 1 ? "" : "s"
              } available for analysis.`,
        tone: crmLeads.length === 0 ? "warning" : "good",
      },
    ];
  }, [crmLeads, data, trend]);

  /* ---------------------------------------------------------------------- */
  /*                             FILTERED LEADS                             */
  /* ---------------------------------------------------------------------- */

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return crmLeads.filter((lead) => {
      const matchesSearch =
        !query ||
        [lead.name, lead.stage, lead.source, lead.owner]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesSegment =
        selectedSegment === "all" ||
        lead.stage.toLowerCase() === selectedSegment.toLowerCase();

      return matchesSearch && matchesSegment;
    });
  }, [crmLeads, search, selectedSegment]);

  /* ---------------------------------------------------------------------- */
  /*                                KPIS                                    */
  /* ---------------------------------------------------------------------- */

  const conversionRate = useMemo(
    () => percent(data?.conversionRate || 0),
    [data],
  );

  const trafficGrowth = useMemo(
    () => growthPercentage(trend, "traffic"),
    [trend],
  );

  const revenueTrend = useMemo(
    () => growthPercentage(trend, "revenue"),
    [trend],
  );

  const kpiSummary = useMemo(() => {
    const revenue = trend.reduce(
      (sum, item) => sum + Number(item.revenue || 0),
      0,
    );

    const qualified = trend.reduce(
      (sum, item) => sum + Number(item.qualifiedLeads || 0),
      0,
    );

    const pipelineValue = crmLeads.reduce(
      (sum, lead) => sum + Number(lead.value || 0),
      0,
    );

    const avgDeal = crmLeads.length ? pipelineValue / crmLeads.length : 0;

    return {
      revenue,
      qualified,
      pipelineValue,
      avgDeal,
    };
  }, [crmLeads, trend]);

  /* ---------------------------------------------------------------------- */
  /*                             CSV EXPORT                                 */
  /* ---------------------------------------------------------------------- */

  const exportCsv = () => {
    const rows = [
      [
        "Name",
        "Stage",
        "Source",
        "Value",
        "Probability",
        "Owner",
        "Last Touch",
      ],
      ...filteredLeads.map((lead) => [
        lead.name,
        lead.stage,
        lead.source,
        lead.value,
        `${lead.probability}%`,
        lead.owner,
        lead.lastTouch,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "analytics-crm.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  /* ---------------------------------------------------------------------- */
  /*                               LOADING                                  */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return <LoadingState />;
  }

  /* ---------------------------------------------------------------------- */
  /*                              EMPTY DATA                                */
  /* ---------------------------------------------------------------------- */

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f9ff] px-4">
        <div
          className="
            w-full
            max-w-md
            rounded-[26px]
            border
            border-blue-100
            bg-white
            p-7
            text-center
          "
        >
          <div className="mx-auto h-2 w-2 rounded-full bg-blue-500" />

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            No analytics data
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Try adjusting the selected date range or refreshing the analytics
            data.
          </p>

          <div className="mt-5">
            <GlassButton type="button" onClick={load} variant="primary">
              <RefreshCw size={14} />
              Refresh
            </GlassButton>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                               RENDER                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="
        min-h-screen
        bg-[#f6f9ff]
        text-slate-900
      "
    >
      {/* Soft background only. No visual content in the background layer. */}
      <div
        className="
          pointer-events-none
          fixed
          -left-32
          -top-32
          h-80
          w-80
          rounded-full
          bg-blue-200/15
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          -bottom-40
          -right-32
          h-96
          w-96
          rounded-full
          bg-sky-200/10
          blur-3xl
        "
      />

      <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER / FUNCTIONAL GLASS LAYER                                 */}
        {/* ---------------------------------------------------------------- */}

        <header
          className="
            sticky
            top-4
            z-30
            mb-5
            rounded-[28px]
            border
            border-blue-100/80
            bg-white/70
            p-4
            backdrop-blur-2xl
            shadow-xs
          "
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Analytics
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                Command Center
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
                Traffic, conversion, revenue, pipeline, and operational
                visibility in one workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={exportCsv}
                disabled={!filteredLeads.length}
              >
                <Download size={14} />
                Export
              </GlassButton>

              <GlassButton type="button" variant="secondary" onClick={load}>
                <RefreshCw size={14} />
                Refresh
              </GlassButton>
            </div>
          </div>

          {/* KPI ribbon */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Traffic growth"
              value={trafficGrowth}
              subtext="First → latest period"
            />

            <KpiCard
              label="Revenue trend"
              value={revenueTrend}
              subtext="First → latest period"
            />

            <KpiCard
              label="Qualified leads"
              value={formatCompactNumber(kpiSummary.qualified)}
              subtext="Across selected period"
            />

            <KpiCard
              label="Pipeline value"
              value={formatCurrency(kpiSummary.pipelineValue)}
              subtext="Current CRM records"
            />
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* FILTER BAR                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            mb-5
            rounded-[22px]
            border
            border-blue-100/80
            bg-white/65
            p-2
            backdrop-blur-xl
            shadow-xs
          "
        >
          <DateFilter filters={filters} setFilters={setFilters} />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* NAVIGATION                                                       */}
        {/* ---------------------------------------------------------------- */}

        <nav
          className="
            mb-5
            flex
            overflow-x-auto
            rounded-[22px]
            border
            border-blue-100/80
            bg-white/65
            p-1.5
            backdrop-blur-xl
            shadow-xs
          "
        >
          {[
            {
              id: "overview",
              label: "Overview",
            },
            {
              id: "crm",
              label: "CRM",
            },
            {
              id: "insights",
              label: "Insights",
            },
            {
              id: "operations",
              label: "Operations",
            },
          ].map((tab) => {
            const active = activeView === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={cn(
                  `
                    min-w-fit
                    rounded-xl
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    transition
                    duration-200
                  `,
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-600",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ================================================================= */}
        {/* OVERVIEW                                                          */}
        {/* ================================================================= */}

        {activeView === "overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Traffic"
                value={formatNumber(data.traffic || 0)}
                subtext="Page views"
              />

              <KpiCard
                label="Conversions"
                value={formatNumber(data.conversions || 0)}
                subtext="Completed actions"
              />

              <KpiCard
                label="Unique sessions"
                value={formatNumber(data.uniqueSessions || 0)}
                subtext="Distinct sessions"
              />

              <KpiCard
                label="Conversion rate"
                value={conversionRate}
                subtext="Conversions / traffic"
              />
            </div>

            {/* Traffic */}
            <div className="mt-5">
              <SectionCard
                title="Performance trend"
                description="Traffic, conversions and revenue over the selected period."
              >
                {trend.length ? (
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trend}
                        margin={{
                          top: 8,
                          right: 8,
                          left: -15,
                          bottom: 0,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="trafficFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={BLUE}
                              stopOpacity={0.22}
                            />

                            <stop
                              offset="100%"
                              stopColor={BLUE}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke="#e5edfa"
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <Tooltip content={<ChartTooltip />} />

                        <Area
                          type="monotone"
                          dataKey="traffic"
                          name="Traffic"
                          stroke={BLUE}
                          strokeWidth={2.5}
                          fill="url(#trafficFill)"
                          fillOpacity={1}
                        />

                        <Area
                          type="monotone"
                          dataKey="conversions"
                          name="Conversions"
                          stroke={BLUE_DARK}
                          strokeWidth={1.8}
                          fillOpacity={0}
                        />

                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#60a5fa"
                          strokeWidth={1.8}
                          fillOpacity={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    title="No trend data"
                    description="There is no time-series data for the selected period."
                  />
                )}
              </SectionCard>
            </div>

            {/* Source / Device */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <SectionCard
                title="Traffic sources"
                description="Where your visitors come from."
                className="lg:col-span-1"
              >
                {sources.length ? (
                  <div className="h-[290px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sources}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={68}
                          outerRadius={98}
                          paddingAngle={3}
                        >
                          {sources.map((_, index) => (
                            <Cell
                              key={index}
                              fill={CHART_BLUE[index % CHART_BLUE.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    title="No source data"
                    description="Source attribution is empty for this period."
                  />
                )}
              </SectionCard>

              <SectionCard
                title="Source volume"
                description="Highest contributing channels."
              >
                {sources.length ? (
                  <div className="h-[290px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sources}
                        layout="vertical"
                        margin={{
                          left: 4,
                          right: 8,
                        }}
                      >
                        <CartesianGrid
                          stroke="#e5edfa"
                          strokeDasharray="3 3"
                          horizontal={false}
                        />

                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          type="category"
                          dataKey="name"
                          width={85}
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#64748b",
                          }}
                        />

                        <Tooltip content={<ChartTooltip />} />

                        <Bar
                          dataKey="value"
                          fill={BLUE}
                          radius={[0, 8, 8, 0]}
                          barSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    title="No source data"
                    description="Nothing to visualize yet."
                  />
                )}
              </SectionCard>

              <SectionCard
                title="Devices"
                description="Audience distribution by device."
              >
                {devices.length ? (
                  <div className="h-[290px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={devices}
                        margin={{
                          top: 8,
                          right: 8,
                          left: -15,
                        }}
                      >
                        <CartesianGrid
                          stroke="#e5edfa"
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#64748b",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <Tooltip content={<ChartTooltip />} />

                        <Bar
                          dataKey="value"
                          fill="#60a5fa"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    title="No device data"
                    description="Device distribution isn't available yet."
                  />
                )}
              </SectionCard>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <SectionCard title="Leads by source" description="Original acquisition source."><BreakdownList items={leadsBySource} /></SectionCard>
              <SectionCard title="Leads by product" description="Products generating sales interest."><BreakdownList items={leadsByProduct} /></SectionCard>
              <SectionCard title="Won value by source" description="Closed revenue attributed to acquisition source."><BreakdownList items={wonValueBySource} currency /></SectionCard>
            </div>
          </>
        )}

        {/* ================================================================= */}
        {/* CRM                                                                */}
        {/* ================================================================= */}

        {activeView === "crm" && (
          <>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
              <SectionCard
                title="Pipeline health"
                description="Lead distribution and pipeline value."
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="
                        h-10
                        rounded-xl
                        border
                        border-blue-100
                        bg-white/65
                        px-3
                      "
                    >
                      <select
                        value={selectedSegment}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="
                          h-full
                          bg-transparent
                          text-xs
                          font-semibold
                          text-slate-700
                          outline-none
                        "
                      >
                        <option value="all">All stages</option>

                        {[...new Set(crmLeads.map((lead) => lead.stage))].map(
                          (stage) => (
                            <option key={stage} value={stage.toLowerCase()}>
                              {stage}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="relative">
                      <Search
                        size={14}
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                        className="
                          h-10
                          w-full
                          rounded-xl
                          border
                          border-blue-100
                          bg-white/65
                          pl-9
                          pr-3
                          text-xs
                          font-medium
                          text-slate-700
                          outline-none
                          placeholder:text-slate-300
                          focus:border-blue-300
                          focus:ring-4
                          focus:ring-blue-500/10
                          sm:w-48
                        "
                      />
                    </div>
                  </div>
                }
              >
                {crmStages.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {crmStages.map((stage) => (
                      <div
                        key={stage.name}
                        className="
                            rounded-2xl
                            border
                            border-blue-100/70
                            bg-blue-50/25
                            p-4
                          "
                      >
                        <p className="text-xs font-medium text-slate-400">
                          {stage.name}
                        </p>

                        <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                          {formatNumber(stage.count)}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Value{" "}
                          <span className="font-semibold text-slate-600">
                            {formatCurrency(stage.value)}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No CRM records"
                    description="The backend returned no CRM leads for the selected filters."
                  />
                )}
              </SectionCard>

              <SectionCard
                title="CRM summary"
                description="Current pipeline snapshot."
              >
                <div className="space-y-2">
                  <KpiCard
                    label="Average deal"
                    value={formatCurrency(kpiSummary.avgDeal)}
                  />

                  <KpiCard
                    label="Pipeline"
                    value={formatCurrency(kpiSummary.pipelineValue)}
                  />

                  <KpiCard
                    label="Qualified"
                    value={formatNumber(kpiSummary.qualified)}
                  />
                </div>
              </SectionCard>
            </div>

            <div className="mt-5">
              <SectionCard
                title="Lead board"
                description={`${filteredLeads.length} record${
                  filteredLeads.length === 1 ? "" : "s"
                } matching the current filters.`}
                actions={
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={exportCsv}
                    disabled={!filteredLeads.length}
                  >
                    <Download size={14} />
                    Export CSV
                  </GlassButton>
                }
              >
                {filteredLeads.length ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {filteredLeads.map((lead) => (
                      <article
                        key={lead.id}
                        className="
                            rounded-2xl
                            border
                            border-blue-100/70
                            bg-white
                            p-4
                          "
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {lead.name}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {lead.source}
                              {" · "}
                              {lead.owner}
                            </p>
                          </div>

                          <span
                            className="
                                shrink-0
                                rounded-full
                                border
                                border-blue-100
                                bg-blue-50
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                text-blue-600
                              "
                          >
                            {lead.stage}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] text-slate-400">Value</p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                              {formatCurrency(lead.value)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] text-slate-400">
                              Probability
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-700">
                              {lead.probability}%
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] text-slate-400">
                              Last touch
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                              {lead.lastTouch}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No matching leads"
                    description="Try changing the search or stage filter."
                  />
                )}
              </SectionCard>
            </div>
          </>
        )}

        {/* ================================================================= */}
        {/* INSIGHTS                                                           */}
        {/* ================================================================= */}

        {activeView === "insights" && (
          <>
            <div className="grid gap-5 xl:grid-cols-3">
              <SectionCard
                title="Conversion funnel"
                description="Current funnel snapshot."
              >
                {funnel.length ? (
                  <div className="space-y-3">
                    {funnel.map((step, index) => {
                      const maxValue = Math.max(
                        ...funnel.map((item) => Number(item.value || 0)),
                        1,
                      );

                      const width = Math.max(
                        4,
                        (Number(step.value || 0) / maxValue) * 100,
                      );

                      return (
                        <div
                          key={`${step.name}-${index}`}
                          className="
                              rounded-2xl
                              border
                              border-blue-100/70
                              bg-blue-50/25
                              p-4
                            "
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium text-slate-500">
                              {step.name}
                            </p>

                            <span className="text-xs font-semibold text-slate-700">
                              {formatNumber(step.value)}
                            </span>
                          </div>

                          <div className="mt-3 h-1.5 rounded-full bg-blue-100">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{
                                width: `${width}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No funnel data"
                    description="The selected period doesn't contain funnel events."
                  />
                )}
              </SectionCard>

              <SectionCard
                title="Pattern detection"
                description="Useful signals from the current dataset."
              >
                <div className="space-y-3">
                  <div className="rounded-2xl bg-blue-50/45 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Peak window
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      Track the most active hours and days to place campaigns
                      more efficiently.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50/45 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Channel quality
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      Compare sources by conversion, revenue, and lead quality
                      instead of traffic alone.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50/45 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Page efficiency
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      Rank pages by visit-to-action ratio rather than page views
                      only.
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Revenue trend"
                description="Revenue over the selected period."
              >
                {trend.length ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trend}
                        margin={{
                          left: -15,
                          right: 8,
                          top: 8,
                        }}
                      >
                        <CartesianGrid
                          stroke="#e5edfa"
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <Tooltip content={<ChartTooltip />} />

                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke={BLUE}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    title="No revenue trend"
                    description="Revenue time-series data isn't available."
                  />
                )}
              </SectionCard>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <SectionCard
                title="Executive snapshot"
                description="Core numbers for a quick read."
              >
                <div className="grid gap-2">
                  <KpiCard
                    label="Traffic"
                    value={formatNumber(data.traffic || 0)}
                  />

                  <KpiCard
                    label="Conversions"
                    value={formatNumber(data.conversions || 0)}
                  />

                  <KpiCard label="Conversion rate" value={conversionRate} />
                </div>
              </SectionCard>

              <SectionCard
                title="Recommended actions"
                description="Low-friction improvements for the dashboard."
              >
                <div className="space-y-2">
                  {[
                    "Add UTM parsing for campaign attribution.",
                    "Create saved views for sales, marketing, and executive users.",
                    "Add annotation markers for campaigns and launches.",
                    "Add anomaly thresholds for traffic and conversion drops.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        rounded-2xl
                        border
                        border-blue-100/70
                        bg-blue-50/25
                        p-3.5
                        text-[11px]
                        leading-5
                        text-slate-600
                      "
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Risk signals"
                description="Early warnings from the current dataset."
              >
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.title}
                      className={cn(
                        "rounded-2xl border p-4",
                        alert.tone === "warning"
                          ? "border-blue-200 bg-blue-50/60"
                          : "border-blue-100 bg-blue-50/25",
                      )}
                    >
                      <p className="text-xs font-semibold text-slate-800">
                        {alert.title}
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        {alert.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </>
        )}

        {/* ================================================================= */}
        {/* OPERATIONS                                                         */}
        {/* ================================================================= */}

        {activeView === "operations" && (
          <>
            <div className="grid gap-5 xl:grid-cols-3">
              <SectionCard
                title="Operational snapshot"
                description="Support and workflow visibility."
              >
                <div className="grid gap-2">
                  <KpiCard
                    label="Inbound leads"
                    value={formatNumber(data.inboundLeads ?? crmLeads.length)}
                  />

                  <KpiCard label="SLA health" value="92%" />

                  <KpiCard label="Open tasks" value="14" />
                </div>
              </SectionCard>

              <SectionCard
                title="Customer journey"
                description="Frontend-ready journey structure."
              >
                <div className="space-y-2">
                  {[
                    {
                      label: "Landing page view",
                      value: 100,
                    },
                    {
                      label: "CTA click",
                      value: 72,
                    },
                    {
                      label: "Form start",
                      value: 50,
                    },
                    {
                      label: "Qualified lead",
                      value: 28,
                    },
                    {
                      label: "Won deal",
                      value: 12,
                    },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className="
                        rounded-2xl
                        bg-blue-50/30
                        p-3.5
                      "
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500">
                          {step.label}
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          {step.value}
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${step.value}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="System notes"
                description="Implementation guidance."
              >
                <div className="space-y-2">
                  {[
                    "Use this page as a shared analytics surface for marketing, sales, and admin.",
                    "Keep chart schemas stable so backend changes don't require UI refactoring.",
                    "Add role-based visibility for owner, manager, admin, and analyst.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        rounded-2xl
                        border
                        border-blue-100/70
                        bg-blue-50/25
                        p-3.5
                        text-[11px]
                        leading-5
                        text-slate-600
                      "
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <SectionCard
                title="Recent activity"
                description="Latest events available from analytics."
              >
                {recentEvents.length ? (
                  <div className="space-y-2">
                    {recentEvents.map((event, index) => (
                      <div
                        key={event.id || index}
                        className="
                            rounded-2xl
                            border
                            border-blue-100/70
                            bg-white
                            p-3.5
                          "
                      >
                        <p className="text-xs font-semibold text-slate-800">
                          {event.type || "Unknown event"}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-slate-400">
                          {event.path ||
                            event.conversion_name ||
                            "Unknown action"}
                        </p>

                        <p className="mt-1 text-[10px] text-blue-500">
                          {event.source || "Direct"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recent events"
                    description="No analytics events were returned for this period."
                  />
                )}
              </SectionCard>

              <SectionCard
                title="Core counters"
                description="Current overview values."
              >
                <div className="space-y-2">
                  <KpiCard
                    label="Traffic"
                    value={formatNumber(data.traffic || 0)}
                  />

                  <KpiCard
                    label="Conversions"
                    value={formatNumber(data.conversions || 0)}
                  />

                  <KpiCard
                    label="Unique sessions"
                    value={formatNumber(data.uniqueSessions || 0)}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Implementation checklist"
                description="Potential next iterations."
              >
                <div className="space-y-2">
                  {[
                    "Connect CRM fields to server-side lead objects.",
                    "Add saved filters and personal dashboards.",
                    "Track userId, sessionId, source, and campaign.",
                    "Add anomaly alerts for traffic and lost leads.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        rounded-2xl
                        border
                        border-blue-100/70
                        bg-blue-50/25
                        p-3.5
                        text-[11px]
                        leading-5
                        text-slate-600
                      "
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Analytics;
