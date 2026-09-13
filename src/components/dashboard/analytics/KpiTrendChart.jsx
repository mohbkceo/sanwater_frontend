import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDZD, formatNumber, formatRate } from "./analyticsFormatters";

const METRICS = {
  revenue: { label: "Revenue", format: formatDZD },
  orders: { label: "Orders", format: formatNumber },
  qualifiedLeads: { label: "Qualified Leads", format: formatNumber },
  visitorToLeadRate: { label: "Visitor → Lead", format: formatRate },
  leadToOrderRate: { label: "Lead → Order", format: formatRate },
};

function TrendTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const definition = METRICS[metric];
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-xl">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{definition.format(payload[0]?.value)}</p>
    </div>
  );
}

export default function KpiTrendChart({ data = [] }) {
  const [metric, setMetric] = useState("revenue");
  return (
    <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Business KPI trend</h2>
          <p className="mt-1 text-xs text-slate-500">One commercial signal at a time, aggregated on the server.</p>
        </div>
        <select value={metric} onChange={(event) => setMetric(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400">
          {Object.entries(METRICS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>
      </div>
      {data.length ? (
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} minTickGap={28} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip content={<TrendTooltip metric={metric} />} />
              <Line type="monotone" dataKey={metric} name={METRICS[metric].label} stroke="#2563eb" strokeWidth={3} dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">Not enough data for a trend yet.</p>}
    </section>
  );
}
