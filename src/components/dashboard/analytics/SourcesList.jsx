import React from "react";

function SourcesList({ sources = [] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Sources</h3>
          <p className="text-sm text-slate-500">Traffic origin breakdown</p>
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
              No sources found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SourcesList; 