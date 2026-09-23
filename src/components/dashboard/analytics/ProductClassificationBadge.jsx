import { useTranslation } from "@/lib/i18n";
const STYLES = {
  winner: "bg-emerald-100 text-emerald-800",
  hidden_opportunity: "bg-blue-100 text-blue-800",
  conversion_problem: "bg-rose-100 text-rose-800",
  low_priority: "bg-slate-100 text-slate-700",
  insufficient_data: "bg-amber-100 text-amber-800",
};
const LABEL_KEYS = {
  winner: "admin.analytics.classification_winner",
  hidden_opportunity: "admin.analytics.classification_hidden_opportunity",
  conversion_problem: "admin.analytics.classification_conversion_problem",
  low_priority: "admin.analytics.classification_low_priority",
  insufficient_data: "admin.analytics.classification_insufficient_data",
};

export default function ProductClassificationBadge({ value }) {
  const { t } = useTranslation();
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STYLES[value] || STYLES.insufficient_data}`}>{LABEL_KEYS[value] ? t(LABEL_KEYS[value]) : value || t(LABEL_KEYS.insufficient_data)}</span>;
}
