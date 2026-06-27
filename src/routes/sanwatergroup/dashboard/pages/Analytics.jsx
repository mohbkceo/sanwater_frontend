import React, { useMemo, useState } from "react";
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
} from "recharts";
import { useFetchAnalytics } from "@/hooks/useAnalytics";
import DateFilter from "@/components/dashboard/analytics/DateFilter";
import { useEffect } from "react";

function StatCard({ label, value, subtext }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>
      {subtext ? <p className="mt-2 text-sm text-slate-500">{subtext}</p> : null}
    </div>
  );
}

function SectionCard({ title, description, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function normalizeList(list = [], mapFn) {
  return Array.isArray(list) ? list.map(mapFn) : [];
}




function Analytics() {
  const [filters, setFilters] = useState({});
  const { data, loading, load } = useFetchAnalytics(filters);


  useEffect(() =>{
    load();
  }, [filters])

  const conversionRate = useMemo(() => {
    if (!data) return "0.00%";
    return `${((data.conversionRate || 0) * 100).toFixed(2)}%`;
  }, [data]);

  const sources = useMemo(() => {
    return normalizeList(data?.sources, (item) => ({
      name: item.source || item.name || "unknown",
      value: item.count ?? item.value ?? 0,
    }));
  }, [data]);

  const topPages = useMemo(() => {
    return normalizeList(data?.topPages, (item) => ({
      path: item.path || "/",
      value: item.count ?? item.value ?? 0,
    }));
  }, [data]);

  const devices = useMemo(() => {
    return normalizeList(data?.devices, (item) => ({
      name: item.name || item.device || "unknown",
      value: item.count ?? item.value ?? 0,
    }));
  }, [data]);

  const trend = useMemo(() => {
    return normalizeList(data?.trend, (item) => ({
      date: item.date,
      traffic: item.traffic ?? 0,
      conversions: item.conversions ?? 0,
    }));
  }, [data]);

  const funnel = useMemo(() => {
    return normalizeList(data?.funnel, (item) => ({
      name: item.name,
      value: item.value ?? 0,
    }));
  }, [data]);

  const recentEvents = useMemo(() => {
    return normalizeList(data?.recentEvents, (item) => ({
      id: item._id || item.id,
      type: item.type,
      path: item.path,
      conversion_name: item.conversion_name,
      source: item.source,
      ts: item.ts,
    }));
  }, [data]);

  const sourceColors = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

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
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting the selected date range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Monitor traffic, conversions, audience segments, and behavioral flow.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <DateFilter filters={filters} setFilters={setFilters} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Traffic" value={data.traffic || 0} subtext="Page views" />
          <StatCard label="Conversions" value={data.conversions || 0} subtext="Completed actions" />
          <StatCard label="Unique Sessions" value={data.uniqueSessions || 0} subtext="Distinct sessions" />
          <StatCard label="Conversion Rate" value={conversionRate} subtext="Conversions / traffic" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Traffic Trend"
            description="Page views and conversions over time."
            className="xl:col-span-2"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="traffic"
                    stroke="#0f172a"
                    fillOpacity={0.14}
                    fill="#0f172a"
                  />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    stroke="#475569"
                    fillOpacity={0.08}
                    fill="#475569"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Source Mix"
            description="Traffic origin distribution."
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sources}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                  >
                    {sources.map((_, index) => (
                      <Cell
                        key={index}
                        fill={sourceColors[index % sourceColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <SectionCard title="Top Sources">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sources} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={90} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f172a" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Top Pages">
            <div className="space-y-3">
              {topPages.length ? (
                topPages.map((item) => (
                  <div
                    key={item.path}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <span className="truncate text-sm font-medium text-slate-700">
                      {item.path}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No page data.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Device Breakdown">
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

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <SectionCard title="Recent Activity">
            <div className="space-y-3">
              {recentEvents.length ? (
                recentEvents.map((event, index) => (
                  <div key={event.id || index} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-medium text-slate-900">
                      {event.type}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {event.path || event.conversion_name || "Unknown action"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {event.source || "direct"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No recent events.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Funnel">
            <div className="grid gap-4">
              {funnel.map((step) => (
                <div key={step.name} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{step.name}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {step.value}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Summary">
            <div className="grid gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Traffic</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {data.traffic || 0}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Conversions</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {data.conversions || 0}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Unique Sessions</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {data.uniqueSessions || 0}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default Analytics;