import { useMemo, useRef } from "react";
import { useRunStore } from "../store/useRunStore.js";

const accept = ".wav,.edf,.h5,.hdf5,.nc";

export default function UploadCard() {
  const fileInputRef = useRef(null);
  const { domain, setDomain, stagedFiles, uploadFiles, clearQueue } = useRunStore();
  const DOMAIN_HELP = {
    audio: "ct ≈ how long the audio stays coherent before ψ-collapse. Compare microphones, rooms, or processing chains.",
    eeg: "ct ≈ duration over which the EEG envelope remains stable. Useful for spotting bursts or state changes.",
    ligo: "ct ≈ time scale of strain coherence. Compare different events or cleaning pipelines.",
    grace: "ct ≈ time scale over which gravity signal loses coherence. Compare GRACE solutions or corrections.",
  };

  const summary = useMemo(() => {
    if (!stagedFiles.length) return "Drop or select files (max 500MB each)";
    return `${stagedFiles.length} file${stagedFiles.length === 1 ? "" : "s"} staged`;
  }, [stagedFiles]);

  const helperText = stagedFiles.length
    ? "Staged files stay here until you run Analyze."
    : "Tip: start with 1–3 files for quicker runs.";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Upload captures</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drop WAV / EDF / H5 / NC to stage files for analysis.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700">
          WAV · EDF · H5 · NC
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
          <span className="inline-flex items-center gap-1">
            Domain
            <span
              className="cursor-help rounded-full border border-slate-300 px-1 text-[10px] font-semibold text-slate-500 dark:border-slate-600 dark:text-slate-400"
              title={DOMAIN_HELP[domain] || "Select which domain this capture belongs to so features and defaults match."}
            >
              ?
            </span>
          </span>
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm capitalize text-slate-900 outline-none transition hover:border-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {["ligo", "eeg", "audio", "grace"].map((option) => (
              <option key={option} value={option} className="capitalize">
                {option.toUpperCase()}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            Sets default feature windows + sample ranges.
          </span>
        </label>

        <div>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
            Data files
            <div
              className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-slate-500 transition hover:border-blue-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{summary}</span>
              <span className="text-xs text-slate-400">Click to browse or drag files here</span>
            </div>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            className="sr-only"
            onChange={(event) => {
              uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />
          {stagedFiles.length > 0 && (
            <div className="mt-3 rounded-xl border border-slate-100 bg-white text-sm shadow-inner dark:border-slate-800 dark:bg-slate-950">
              {stagedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between border-b border-slate-100 px-3 py-2 last:border-b-0 dark:border-slate-800"
                >
                  <div>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "data"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-500">staged</span>
                </div>
              ))}
              <button
                className="w-full rounded-b-xl border-t border-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800"
                onClick={clearQueue}
                disabled={!stagedFiles.length}
              >
                Clear queue
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        {helperText}
      </p>
    </div>
  );
}
