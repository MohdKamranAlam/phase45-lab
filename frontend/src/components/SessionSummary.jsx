import { useMemo } from "react";
import { useRunStore } from "../store/useRunStore.js";
import { computeSessionStats } from "../utils/fileInsights.js";

const format = (value, digits = 3) => {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
};

export default function SessionSummary() {
  const { rows, domain, phase, r2, mae, runs } = useRunStore();

  const stats = useMemo(() => {
    const ready = (rows || []).filter((row) => !row?.error);
    const scoped = domain ? ready.filter((row) => row.domain === domain) : ready;
    return computeSessionStats(scoped, domain || null);
  }, [rows, domain]);

  const lastRun = runs?.[0];

  if (!stats.count && !lastRun) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 shadow-panel dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
        Session summary · {domain ? domain.toUpperCase() : "ALL"} · Phase-{phase}
      </p>
      <div className="mt-2 flex flex-wrap gap-4">
        <span>
          {stats.count || (lastRun && lastRun.files) || 0} files analyzed
          {typeof r2 === "number" && (
            <>
              {" "}
              · R²: <span className="font-semibold">{format(r2)}</span>
            </>
          )}
          {typeof mae === "number" && (
            <>
              {" "}
              · MAE: <span className="font-semibold">{format(mae)}</span>
            </>
          )}
        </span>
        {stats.count > 0 && (
          <span>
            Mean ct: <span className="font-semibold">{format(stats.meanCt)} s</span>
            {stats.outlierNames.length > 0 && (
              <>
                {" "}
                · Outliers: <span className="font-semibold">{stats.outlierNames.length}</span>
              </>
            )}
            {stats.noisyCount > 0 && (
              <>
                {" "}
                · Noisy files: <span className="font-semibold">{stats.noisyCount}</span>
              </>
            )}
          </span>
        )}
        {lastRun && (
          <span>
            Last run: <span className="font-semibold">{new Date(lastRun.at).toLocaleString()}</span> · Model:{" "}
            <span className="font-semibold">ψ-Collapse v{phase}</span>
          </span>
        )}
      </div>
    </section>
  );
}

