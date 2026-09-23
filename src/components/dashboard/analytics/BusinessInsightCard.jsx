import { ArrowRight, CircleAlert, Lightbulb } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const SEVERITY_LABEL_KEYS = {
  opportunity: "admin.analytics.severity_opportunity",
  warning: "admin.analytics.severity_warning",
  critical: "admin.analytics.severity_critical",
};

export default function BusinessInsightCard({ insight, onAction }) {
  const { t } = useTranslation();
  const opportunity = insight.severity === "opportunity";
  const Icon = opportunity ? Lightbulb : CircleAlert;
  return (
    <article className={`rounded-2xl border p-4 ${opportunity ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}>
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${opportunity ? "text-emerald-700" : "text-amber-700"}`} />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{SEVERITY_LABEL_KEYS[insight.severity] ? t(SEVERITY_LABEL_KEYS[insight.severity]) : insight.severity}</p>
          <h3 className="mt-1 text-sm font-bold text-slate-950">{insight.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">{insight.detail}</p>
          <button type="button" onClick={() => onAction?.(insight.target)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700">
            {insight.action}<ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
