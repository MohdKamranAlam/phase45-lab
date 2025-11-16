import { useMemo } from "react";
import { useRunStore } from "../store/useRunStore.js";

const checklist = [
  { key: "files", label: "Files staged" },
  { key: "analyzed", label: "KPIs updated" },
  { key: "spectrogram", label: "Spectrogram saved" },
  { key: "inspector", label: "Inspector opened" },
];

export default function AnalyzeCard() {
  const {
    stagedFiles,
    rows,
    spec,
    analyzing,
    analyzeProgress,
    spectroPending,
    analyze,
    spectrogram,
    exportCsv,
    drawerOpen,
    lastError,
  } = useRunStore();

  const status = useMemo(() => {
    const hasRows = rows.length > 0;
    return {
      files: stagedFiles.length > 0,
      analyzed: hasRows,
      spectrogram: Boolean(spec),
      inspector: hasRows && drawerOpen,
    };
  }, [stagedFiles, rows, spec, drawerOpen]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
        Analyze
      </p>
      <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Run collapse predictions</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Predict ct and update KPIs for the staged files.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={analyze}
          disabled={!stagedFiles.length || analyzing}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-panel transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {analyzing ? "Analyzing…" : "Analyze now"}
        </button>
        <button
          onClick={spectrogram}
          disabled={!stagedFiles.length || spectroPending}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
        >
          {spectroPending ? "Rendering…" : "Spectrogram"}
        </button>
        <button
          onClick={exportCsv}
          disabled={!rows.length}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
        >
          Export CSV
        </button>
      </div>

      {analyzing && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{analyzeProgress > 0 ? "Uploading files…" : "Starting upload…"}</span>
            {analyzeProgress > 0 && <span>{analyzeProgress}%</span>}
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.max(analyzeProgress || (analyzing ? 10 : 0), 3)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-2">
        {checklist.map((item) => {
          const ready = status[item.key];
          return (
            <div
              key={item.key}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                ready
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <span>{item.label}</span>
              <span className="text-xs font-semibold uppercase tracking-wide">{ready ? "Ready" : "Pending"}</span>
            </div>
          );
        })}
      </div>

      {lastError && (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
          {lastError}
        </p>
      )}
    </div>
  );
}
