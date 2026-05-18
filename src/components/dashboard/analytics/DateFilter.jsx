import React from "react";

function DateFilter({ filters, setFilters }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          From
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
        <label className="mb-2 block text-sm font-medium text-slate-700">
          To
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
  );
}

export default DateFilter;