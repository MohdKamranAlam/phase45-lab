export default function KPI({ label, value, hint, status }) {
  let valueColor =
    "text-slate-900 dark:text-white";
  if (label === "Files") {
    valueColor = "text-blue-600 dark:text-blue-300";
  } else if (label.toLowerCase().includes("ct")) {
    valueColor = "text-blue-700 dark:text-blue-300";
  } else if (label === "R²") {
    valueColor = "text-emerald-600 dark:text-emerald-300";
  } else if (label === "MAE") {
    valueColor = "text-blue-700 dark:text-blue-300";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel transition dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">{label}</p>
      <div className={`mt-2 text-2xl font-semibold ${valueColor}`}>{value ?? "—"}</div>
      {hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      {status && (
        <p className={`mt-1 text-xs font-semibold ${status === "warn" ? "text-blue-600" : "text-emerald-600"}`}>
          {status === "warn" ? "Needs attention" : "Updated"}
        </p>
      )}
    </div>
  );
}
