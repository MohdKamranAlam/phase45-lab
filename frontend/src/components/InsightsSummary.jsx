import { useMemo } from "react";
import { useRunStore } from "../store/useRunStore.js";
import { computeSessionStats, pickCt } from "../utils/fileInsights.js";

const format = (value, digits = 3) => {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
};

export default function InsightsSummary() {
  const { rows, domain } = useRunStore();
  const { stats, exampleOutlier } = useMemo(() => {
    const ready = (rows || []).filter((row) => !row?.error);
    const scoped = domain ? ready.filter((row) => row.domain === domain) : ready;
    const s = computeSessionStats(scoped, domain || null);
    let example = null;
    if (s.outlierNames.length) {
      const name = s.outlierNames[0];
      example = scoped.find((row) => row.name === name) || null;
    }
    return { stats: s, exampleOutlier: example };
  }, [rows, domain]);

  if (!stats.count) return null;

  const { meanCt, minCt, maxCt, noisyCount, outlierNames } = stats;
  const outlierName = exampleOutlier?.name || outlierNames[0];
  const outlierCt = exampleOutlier ? pickCt(exampleOutlier) : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-panel dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
        Quick summary
      </p>
      <div className="mt-2 flex flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Collapse window</p>
          <p>
            Average ct: <span className="font-semibold">{format(meanCt)} s</span> · Range:{" "}
            <span className="font-semibold">
              {format(minCt)} – {format(maxCt)} s
            </span>
          </p>
        </div>
        {outlierName && (
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Outliers</p>
            <p>
              {outlierNames.length} outlier{outlierNames.length === 1 ? "" : "s"} detected
              {outlierCt != null && (
                <>
                  : <span className="font-semibold">{outlierName}</span> (ct ≈{" "}
                  <span className="font-semibold">{format(outlierCt)} s</span>)
                </>
              )}
              .
            </p>
          </div>
        )}
        {noisyCount > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Noise</p>
            <p>
              <span className="font-semibold">{noisyCount}</span> file
              {noisyCount === 1 ? "" : "s"} above the recommended noise threshold.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

