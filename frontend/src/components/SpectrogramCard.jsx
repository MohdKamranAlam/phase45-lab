import { useRunStore } from "../store/useRunStore.js";
import { useNavigate } from "react-router-dom";

export default function SpectrogramCard() {
  const { spec, spectrogram, stagedFiles } = useRunStore();
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
            Spectrogram
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {spec ? spec?.meta?.file || "Latest capture" : "Awaiting spectrogram"}
          </h3>
        </div>
        <button
          onClick={() => navigate("/lab/explorer#spectrogram")}
          className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-500"
        >
          Open full view →
        </button>
      </div>
      <div className="mt-4 h-40 rounded-xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        {spec ? (
          <div className="flex h-full flex-col items-center justify-center text-xs text-slate-500 dark:text-slate-400">
            <span>
              {spec.f?.length || 0} freq bins · {spec.t?.length || 0} time slices
            </span>
            <span>ct ≈ {spec.ct?.toFixed?.(3) ?? "—"} s</span>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-slate-400">
            <p className="max-w-xs text-center">
              No spectrogram yet. Run a spectrogram on a staged file to inspect its collapse frequency bands.
            </p>
            <button
              type="button"
              onClick={() => spectrogram()}
              disabled={!stagedFiles?.length}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Run spectrogram on first staged file
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
