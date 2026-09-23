import { useMemo, useState } from "react";
import ProductClassificationBadge from "./ProductClassificationBadge";
import { formatChange, formatDZD, formatNumber, formatRate } from "./analyticsFormatters";
import { useTranslation } from "@/lib/i18n";

const SORTERS = {
  revenue: (item) => item.revenue,
  views: (item) => item.uniqueViews,
  intent: (item) => item.salesIntentRate ?? -1,
  conversion: (item) => item.orderConversionRate ?? -1,
};

export default function ProductPerformanceTable({ products = [] }) {
  const { t } = useTranslation();
  const [sort, setSort] = useState("revenue");
  const [expanded, setExpanded] = useState(null);
  const rows = useMemo(() => [...products].sort((a, b) => SORTERS[sort](b) - SORTERS[sort](a)), [products, sort]);
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <label className="text-xs font-semibold text-slate-600">{t("admin.analytics.sort_by")}{" "}
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="ms-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
            <option value="revenue">{t("admin.analytics.revenue")}</option><option value="views">{t("admin.analytics.views")}</option><option value="intent">{t("admin.analytics.intent_rate")}</option><option value="conversion">{t("admin.analytics.conversion")}</option>
          </select>
        </label>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-[900px] w-full text-start text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="p-4">{t("admin.analytics.product")}</th><th className="p-4">{t("admin.analytics.unique_views")}</th><th className="p-4">{t("admin.analytics.intent_rate")}</th><th className="p-4">{t("admin.analytics.order_conversion")}</th><th className="p-4">{t("admin.analytics.revenue")}</th><th className="p-4">{t("admin.analytics.trend")}</th><th className="p-4">{t("admin.analytics.classification")}</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((product) => (
              <tr key={product.productId} className="align-top">
                <td className="p-4">
                  <button type="button" onClick={() => setExpanded(expanded === product.productId ? null : product.productId)} className="font-bold text-slate-900 hover:text-blue-700">{product.product}</button>
                  {expanded === product.productId && <div className="mt-3 max-w-sm rounded-xl bg-blue-50 p-3 text-[11px] leading-5 text-slate-600"><p>{product.reason}</p><p className="mt-1 font-semibold text-blue-800">{t("admin.analytics.recommended_action", { value: product.recommendedAction })}</p><p className="mt-1 text-slate-500">{t("admin.analytics.classification_evidence", { conversion: formatRate(product.classificationEvidence?.siteMedianConversion), views: formatNumber(product.classificationEvidence?.siteMedianViews), share: formatRate(product.classificationEvidence?.trafficShare) })}</p></div>}
                </td>
                <td className="p-4 font-semibold text-slate-700">{formatNumber(product.uniqueViews)}</td>
                <td className="p-4 font-semibold text-slate-700">{formatRate(product.salesIntentRate)}</td>
                <td className="p-4 font-semibold text-slate-700">{formatRate(product.orderConversionRate)}</td>
                <td className="p-4 font-semibold text-slate-900">{formatDZD(product.revenue)}</td>
                <td className="p-4 text-slate-600">{formatChange(product.trend)}</td>
                <td className="p-4"><ProductClassificationBadge value={product.classification} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">{t("admin.analytics.no_product_data")}</p>}
    </div>
  );
}
