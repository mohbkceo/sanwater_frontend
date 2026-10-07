import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';
import { chartDataForDomain, domainChartConfig } from './domainChartData';

export default function DomainChart({ domain, report, compact = false }) {
  const tx = useIntelligenceCopy();
  const config = domainChartConfig[domain];
  const [metric, setMetric] = useState(() => Object.keys(config?.metrics || {})[0] || '');
  if (!config) return null;
  const selectedMetric = config.metrics[metric] ? metric : Object.keys(config.metrics)[0];
  const rows = chartDataForDomain(domain, report, selectedMetric, compact ? 5 : 8);
  const height = Math.max(compact ? 180 : 240, rows.length * (compact ? 36 : 42) + 35);

  return <div className={compact ? 'mt-5 border-t border-slate-100 pt-4' : ''}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-slate-500">{tx('Selected period')} · {tx(config.metrics[selectedMetric])}</p>
      {Object.keys(config.metrics).length > 1 && <label className="text-xs text-slate-600">{tx('Metric')}
        <select aria-label={tx('Metric')} value={selectedMetric} onChange={(event) => setMetric(event.target.value)} className="ms-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800">
          {Object.entries(config.metrics).map(([key, label]) => <option key={key} value={key}>{tx(label)}</option>)}
        </select>
      </label>}
    </div>
    {rows.length ? <div role="img" aria-label={`${tx(config.metrics[selectedMetric])}: ${rows.map((row) => `${row.label} ${row.value}`).join(', ')}`} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={rows} margin={{ top: 4, right: 18, bottom: 4, left: 8 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={compact ? 95 : 145} tickFormatter={(value) => value.length > (compact ? 14 : 22) ? `${value.slice(0, compact ? 13 : 21)}…` : value} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => [new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value), tx(config.metrics[selectedMetric])]} labelFormatter={(label) => label} />
          <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div> : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">{tx('No data in this period.')}</p>}
  </div>;
}
