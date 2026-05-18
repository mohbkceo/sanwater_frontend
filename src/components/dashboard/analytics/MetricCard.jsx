import React from "react";

function MetricCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </h2>
    </div>
  );
}

export default MetricCard;