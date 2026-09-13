const STYLES = {
  winner: "bg-emerald-100 text-emerald-800",
  hidden_opportunity: "bg-blue-100 text-blue-800",
  conversion_problem: "bg-rose-100 text-rose-800",
  low_priority: "bg-slate-100 text-slate-700",
  insufficient_data: "bg-amber-100 text-amber-800",
};

export default function ProductClassificationBadge({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STYLES[value] || STYLES.insufficient_data}`}>{String(value || "insufficient_data").replaceAll("_", " ")}</span>;
}
