export const domainChartConfig = {
  products: { rows: 'rows', label: 'product', metrics: { uniqueViews: 'Viewers', salesIntent: 'Sales intent', orders: 'Won deals', revenue: 'Revenue (DZD)' } },
  marketing: { rows: 'sourceQuality', label: 'source', metrics: { visitors: 'Visitors', qualifiedLeads: 'Qualified leads', wonDeals: 'Won deals' } },
  sales: { rows: 'lossReasons', label: 'reason', metrics: { count: 'Leads' } },
  hiring: { rows: 'rows', label: 'title', metrics: { views: 'Views', applyClicks: 'Apply clicks', applications: 'Applications' } },
  content: { rows: 'rows', label: 'title', metrics: { readers: 'Readers', productClicks: 'Product clicks', contactClicks: 'Contact clicks' } },
  operations: { rows: 'quoteStatuses', label: 'status', metrics: { count: 'Count' } },
};

export function chartDataForDomain(domain, report, metric, limit = 8) {
  const config = domainChartConfig[domain];
  if (!config || !config.metrics[metric]) return [];
  return (report?.[config.rows] || [])
    .map((row) => ({ label: String(row[config.label] || '—'), value: Number(row[metric]) }))
    .filter((row) => Number.isFinite(row.value) && row.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);
}
