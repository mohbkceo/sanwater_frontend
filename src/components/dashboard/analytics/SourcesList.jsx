import React from "react";
import { useTranslation } from "@/lib/i18n";

function SourcesList({ sources = [] }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{t("admin.analytics.sources")}</h3>
          <p className="text-sm text-slate-500">{t("admin.analytics.traffic_breakdown")}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="divide-y divide-slate-200">
          {sources.length > 0 ? (
            sources.map((s) => (
              <div
                key={s.source}
                className="flex items-center justify-between px-4 py-3 transition hover:bg-slate-50"
              >
                <span className="font-medium text-slate-700">{s.source}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
                  {s.count}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-slate-500">
              {t("admin.analytics.no_sources")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SourcesList;
