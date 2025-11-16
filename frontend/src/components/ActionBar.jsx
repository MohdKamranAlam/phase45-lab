import { useRunStore } from "../store/useRunStore.js";

export default function ActionBar() {
  const { stagedFiles, analyze, spectrogram, exportCsv, analyzing, spectroPending } = useRunStore();
  if (!stagedFiles.length) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[95vw] max-w-4xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_10px_50px_rgba(15,23,42,0.15)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-500/15 dark:text-blue-200">
          {stagedFiles.length} file{stagedFiles.length === 1 ? "" : "s"} staged
        </span>
        <span className="text-slate-400">·</span>
        <span>Ready to analyze collapse predictions</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={analyze}
            disabled={analyzing}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? "Analyzing…" : "Analyze now"}
          </button>
          <button
            onClick={spectrogram}
            disabled={spectroPending}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
          >
            {spectroPending ? "Rendering…" : "Spectrogram"}
          </button>
          <button
            onClick={exportCsv}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
