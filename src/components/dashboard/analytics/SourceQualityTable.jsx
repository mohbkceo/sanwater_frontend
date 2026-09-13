import { formatDZD, formatNumber, formatRate } from "./analyticsFormatters";

export default function SourceQualityTable({ sources = [] }) {
  if (!sources.length) return <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No attributed acquisition data for this period.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-[720px] w-full text-left text-xs">
        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="p-4">Source</th><th className="p-4">Visitors</th><th className="p-4">Qualified leads</th><th className="p-4">Orders</th><th className="p-4">Revenue</th><th className="p-4">Visitor → Lead</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{sources.map((source) => <tr key={source.source}><td className="p-4 font-bold capitalize text-slate-900">{source.source}</td><td className="p-4">{formatNumber(source.visitors)}</td><td className="p-4">{formatNumber(source.qualifiedLeads)}</td><td className="p-4">{formatNumber(source.orders)}</td><td className="p-4 font-semibold">{formatDZD(source.revenue)}</td><td className="p-4 font-semibold text-blue-700">{formatRate(source.visitorToLeadRate)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
