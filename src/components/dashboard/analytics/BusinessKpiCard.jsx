import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { changeTone, formatChange } from "./analyticsFormatters";
import { useTranslation } from "@/lib/i18n";

export default function BusinessKpiCard({ label, metric, format, secondary = false }) {
  const { t } = useTranslation();
  const tone = changeTone(metric);
  const Icon = tone === "positive" ? ArrowUpRight : tone === "negative" ? ArrowDownRight : Minus;
  const current = metric?.current;
  const unavailable = current == null;

  return (
    <article className={`rounded-3xl border bg-white p-5 ${secondary ? "border-slate-200" : "border-blue-100 shadow-sm"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        {!unavailable && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone === "positive" ? "bg-emerald-50 text-emerald-700" : tone === "negative" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
            <Icon className="h-3.5 w-3.5" />
            {formatChange(metric)}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        {unavailable ? t("admin.analytics.tracking_required") : format(current)}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {unavailable
          ? t("admin.analytics.insufficient_attribution")
          : t("admin.analytics.previous_period", { value: format(metric.previous) })}
      </p>
    </article>
  );
}
