import dayjs from "dayjs";
import { useRunStore } from "../store/useRunStore.js";

export default function Runs() {
  const runs = useRunStore((state) => state.runs || []);
  const restoreRun = useRunStore((state) => state.restoreRun);
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Runs</p>
        <h1 className="mt-1 text-2xl font-semibold">Run history</h1>
        <p className="mt-2 text-sm text-slate-500">
          Every batch with status, duration, and metrics — click to restore context back into Dashboard and Explorer.
        </p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Runs</h2>
        <p className="mt-1 text-xs text-slate-500">
          Filter by domain and status — click a run to reload its KPIs, Explorer table, and Inspector selection.
        </p>
        <div className="mt-4 space-y-3">
          {runs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No runs yet. Upload files on Dashboard to start building history.
            </div>
          )}
          {runs.map((run) => (
            <article
              key={run.id}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-panel transition hover:border-blue-300 hover:shadow-md"
              onClick={() => restoreRun(run)}
            >
              <div className="flex flex-wrap items-center gap-3 text-slate-500">
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  {run.domain?.toUpperCase() || "DOMAIN"}
                </span>
                <span>{dayjs(run.at).format("MMM D, HH:mm:ss")}</span>
                <span className="text-slate-300">·</span>
                <span>
                  {run.files} file{run.files === 1 ? "" : "s"}
                </span>
                {run.status && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className={run.status === "error" ? "text-red-500" : "text-emerald-500"}>
                      {run.status}
                    </span>
                  </>
                )}
              </div>
              {run.notes && <p className="mt-2 text-sm text-slate-600">{run.notes}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {run.r2 != null && <span>R² {run.r2.toFixed?.(3) ?? run.r2}</span>}
                {run.mae != null && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>MAE {run.mae.toFixed?.(3) ?? run.mae}</span>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
