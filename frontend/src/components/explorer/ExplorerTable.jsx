import { useMemo, useState } from "react";
import { useRunStore } from "../../store/useRunStore.js";
import { classifyRow, pickCt } from "../../utils/fileInsights.js";

const format = (value, digits = 3) => {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
};

export default function ExplorerTable({ compact = false, mode = "advanced" }) {
  const rows = useRunStore((state) => state.rows || []);
  const openDrawer = useRunStore((state) => state.openDrawer);
  const [domainFilter, setDomainFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const isOverview = mode === "overview";

  const domains = useMemo(() => {
    const unique = new Set(rows.map((row) => row.domain).filter(Boolean));
    return ["all", ...unique];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (domainFilter !== "all" && row.domain !== domainFilter) return false;
      if (labelFilter === "all") return true;
      const info = classifyRow(row, rows);
      return info.label === labelFilter;
    });
  }, [rows, domainFilter, labelFilter]);

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900 ${
        compact ? "text-sm" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
            Explorer
          </p>
          <h3 className="text-lg font-semibold">Results table</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isOverview ? "Name, domain, and collapse time (ct) for each capture." : "Click a row for detailed metrics."}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-xs">
          <select
            value={domainFilter}
            onChange={(event) => setDomainFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-transparent px-3 py-1 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300"
          >
            {domains.map((dom) => (
              <option key={dom} value={dom} className="capitalize">
                {dom === "all" ? "All domains" : dom.toUpperCase()}
              </option>
            ))}
          </select>
          <div className="inline-flex rounded-full border border-slate-200 p-1 dark:border-slate-700">
            {["all", "stable", "noisy", "outlier", "error"].map((status) => (
              <button
                key={status}
                onClick={() => setLabelFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                  labelFilter === status
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Domain</th>
              <th className="pb-2 pr-4">ct (s)</th>
              {!isOverview && (
                <>
                  <th className="pb-2 pr-4">ct_proxy</th>
                  <th className="pb-2 pr-4">fs (Hz)</th>
                  <th className="pb-2 pr-4">γ</th>
                  <th className="pb-2 pr-4">β</th>
                  <th className="pb-2 pr-4">λ</th>
                  <th className="pb-2 pr-4">noise</th>
                </>
              )}
              <th className="pb-2 pr-4">Label</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-slate-500 dark:text-slate-400">
                  No rows yet. Upload files to populate the explorer.
                </td>
              </tr>
            )}
            {filtered.map((row, index) => (
              // Compute classification once per row for use below
              // eslint-disable-next-line react/no-array-index-key
              <tr
                key={row.name || row.id || `${row.domain || "row"}-${index}`}
                className="cursor-pointer border-t border-slate-100 text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
                onClick={() => openDrawer(row)}
              >
                <td className="py-2 pr-4 font-medium">{row.name}</td>
                <td className="py-2 pr-4 uppercase text-slate-500 dark:text-slate-400">{row.domain || "—"}</td>
                <td className="py-2 pr-4">
                  {row.error ? "—" : format(pickCt(row))}
                </td>
                {!isOverview && (
                  <>
                    <td className="py-2 pr-4">{row.error ? "—" : format(row.ct_proxy)}</td>
                    <td className="py-2 pr-4">{row.error ? "—" : format(row.fs, 1)}</td>
                    <td className="py-2 pr-4">{row.error ? "—" : format(row.gamma)}</td>
                    <td className="py-2 pr-4">{row.error ? "—" : format(row.beta, 4)}</td>
                    <td className="py-2 pr-4">{row.error ? "—" : format(row.lam)}</td>
                    <td className="py-2 pr-4">{row.error ? "—" : format(row.noise)}</td>
                  </>
                )}
                <td className="py-2 pr-4">
                  {(() => {
                    const info = classifyRow(row, rows);
                    const label = info.label;
                    let classes =
                      "rounded-full px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200";
                    if (label === "stable") {
                      classes =
                        "rounded-full px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200";
                    } else if (label === "noisy") {
                      classes =
                        "rounded-full px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-200";
                    } else if (label === "outlier") {
                      classes =
                        "rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200";
                    } else if (label === "error") {
                      classes =
                        "rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100";
                    }
                    return (
                      <span className={classes} title={info.reason}>
                        {label}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
