import React from "react";
import { useTranslation } from "@/lib/i18n";

function isoDate(date) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return copy.toISOString().slice(0, 10);
}

function DateFilter({ filters, setFilters }) {
  const { t } = useTranslation();
  const applyPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    setFilters({ from: isoDate(from), to: isoDate(to) });
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{t("admin.analytics.quick_range")}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => applyPreset(1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">{t("admin.analytics.today")}</button>
          <button type="button" onClick={() => applyPreset(7)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">{t("admin.analytics.last_7_days")}</button>
          <button type="button" onClick={() => applyPreset(30)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">{t("admin.analytics.last_30_days")}</button>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          {t("admin.analytics.from")}
        </label>
        <input
          type="date"
          value={filters.from || ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, from: e.target.value }))
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div className="flex-1">
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          {t("admin.analytics.to")}
        </label>
        <input
          type="date"
          value={filters.to || ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, to: e.target.value }))
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>
      </div>
    </div>
  );
}

export default DateFilter;
