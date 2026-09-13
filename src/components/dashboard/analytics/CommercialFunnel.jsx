import { formatChange, formatNumber, formatRate } from "./analyticsFormatters";

export default function CommercialFunnel({ funnel, selectedStage, onSelectStage }) {
  const stages = funnel?.stages || [];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-5">
        {stages.map((stage, index) => (
          <button key={stage.key} type="button" onClick={() => onSelectStage?.(stage.key)} className={`rounded-2xl border p-4 text-left transition ${selectedStage === stage.key ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10" : "border-slate-200 bg-white hover:border-blue-300"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">{stage.name}</span>
              <span className="text-[10px] font-semibold text-slate-400">{formatChange(stage.comparison)}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{formatNumber(stage.current)}</p>
            <p className="mt-2 text-xs text-slate-500">
              {index === 0 ? "Unique visitor identities" : `${formatRate(stage.conversionRate)} from prior stage`}
            </p>
            {index > 0 && <p className="mt-1 text-[11px] text-slate-400">{formatRate(stage.dropOffRate)} drop-off</p>}
          </button>
        ))}
      </div>
      {funnel?.biggestLeak && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700">Biggest conversion leak</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-lg font-bold text-slate-950">{funnel.biggestLeak.from} → {funnel.biggestLeak.to}</p>
              <p className="mt-1 text-xs text-slate-600">{formatNumber(funnel.biggestLeak.lostEntities)} entities lost · minimum input safeguard {formatNumber(funnel.biggestLeak.minimumVolume)}</p>
            </div>
            <p className="text-sm font-bold text-rose-700">{formatRate(funnel.biggestLeak.currentConversion)} now · {formatRate(funnel.biggestLeak.previousConversion)} previous</p>
          </div>
        </div>
      )}
    </div>
  );
}
