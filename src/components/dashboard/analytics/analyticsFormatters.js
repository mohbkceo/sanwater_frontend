export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(Number(value));
}

export function formatDZD(value) {
  const formatted = formatNumber(value);
  return formatted === "—" ? formatted : `${formatted} DA`;
}

export function formatRate(value, digits = 1) {
  return value == null || Number.isNaN(Number(value)) ? "—" : `${Number(value).toFixed(digits)}%`;
}

export function formatChange(metric, t) {
  if (!metric || metric.changeState === "unavailable") return t("admin.analytics.change_unavailable");
  if (metric.changeState === "new") return t("admin.analytics.change_new");
  if (metric.percentageChange == null) return t("admin.analytics.no_previous_data");
  const value = Number(metric.percentageChange);
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function changeTone(metric) {
  const value = metric?.percentageChange;
  if (value == null || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}
