import React from 'react';
import { fetchAttention } from '@/services/analytics/analytics';
import { useAnalyticsRange, useReport } from '@/components/dashboard/intelligence/useReport';
import { DateRange, ErrorState, InsightList, LoadingState } from '@/components/dashboard/intelligence/ui';
import { useIntelligenceCopy } from '@/lib/intelligenceCopy';
export default function AttentionCenter() {
  const tx = useIntelligenceCopy();
  const { from, to, setRange } = useAnalyticsRange();
  const report = useReport(() => fetchAttention({ from, to }), `${from}:${to}`);
  return <main className="space-y-5 p-4 sm:p-6"><header><p className="text-xs font-semibold uppercase text-blue-700">{tx('Decision support')}</p><h1 className="text-3xl font-semibold">{tx('Attention center')}</h1><p className="mt-2 text-sm text-slate-500">{tx('Findings use explicit thresholds and include their evidence.')}</p></header><DateRange from={from} to={to} setRange={setRange} />{report.loading && !report.data ? <LoadingState /> : report.error && !report.data ? <ErrorState retry={report.retry} /> : <InsightList insights={report.data?.insights} />}</main>;
}
