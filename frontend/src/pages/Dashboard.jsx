import { useMemo, useState } from "react";
import UploadCard from "../components/UploadCard.jsx";
import AnalyzeCard from "../components/AnalyzeCard.jsx";
import JourneyRail from "../components/JourneyRail.jsx";
import KPI from "../components/KPI.jsx";
import MultiChart from "../components/charts/MultiChart.jsx";
import ExplorerTable from "../components/explorer/ExplorerTable.jsx";
import SpectrogramCard from "../components/SpectrogramCard.jsx";
import PsiSurfaceCard from "../components/PsiSurfaceCard.jsx";
import InspectorDrawer from "../components/inspector/InspectorDrawer.jsx";
import SpectrogramHeatmap from "../components/charts/SpectrogramHeatmap.jsx";
import SpectrogramSurface3D from "../components/charts/SpectrogramSurface3D.jsx";
import { useRunStore } from "../store/useRunStore.js";
import InsightsSummary from "../components/InsightsSummary.jsx";
import SessionSummary from "../components/SessionSummary.jsx";

const format = (value, digits = 3) => {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
};

export default function Dashboard() {
  const { rows, spec, r2, mae, domain, phase, stagedFiles, drawerOpen, psi, analyze } = useRunStore();
  const readyRows = (rows || []).filter((row) => !row?.error);
  const issues = (rows || []).filter((row) => row?.error);
  const domainRows = domain ? readyRows.filter((row) => row.domain === domain) : readyRows;
  const [showMetricsDetails, setShowMetricsDetails] = useState(false);
  const [resultsMode, setResultsMode] = useState("overview");

  const statuses = {
    upload: stagedFiles.length > 0 || readyRows.length > 0,
    analyze: readyRows.length > 0,
    explore: readyRows.length > 0 && drawerOpen,
    surface: Boolean(psi),
  };

  const journey = [
    {
      key: "upload",
      step: "Upload",
      label: "Drop WAV / EDF / H5 / NC",
      desc: statuses.upload ? `${stagedFiles.length || readyRows.length} files ready` : "Drop captures to start a run",
      status: statuses.upload ? "done" : "active",
      badge: domain?.toUpperCase(),
    },
    {
      key: "analyze",
      step: "Analyze",
      label: "Predict ct + cadence",
      desc: statuses.analyze ? "KPIs + Explorer updated" : "Run collapse predictions on staged files",
      status: statuses.analyze ? "done" : statuses.upload ? "active" : "pending",
    },
    {
      key: "explore",
      step: "Explore",
      label: "Table + Inspector",
      desc: statuses.explore ? "Inspector open" : "Click a row to open Inspector drawer",
      status: statuses.explore ? "done" : statuses.analyze ? "active" : "pending",
    },
    {
      key: "surface",
      step: "ψ-Surface",
      label: "Render ct(γ, A₀)",
      desc: statuses.surface ? "Latest mesh saved" : "Go to 3D ψ-Surface to generate mesh",
      status: statuses.surface ? "done" : spec ? "active" : "pending",
    },
  ];

  const kpis = useMemo(() => {
    const count = domainRows.length;
    const ctValues = domainRows
      .map((row) => row?.ct_pred ?? row?.kitab_ct ?? row?.ct_proxy ?? null)
      .filter((value) => Number.isFinite(value));
    const avgCt = ctValues.length ? ctValues.reduce((sum, value) => sum + value, 0) / ctValues.length : null;
    const fsValues = domainRows.map((row) => Number(row.fs)).filter((value) => Number.isFinite(value));
    const medianFs = (() => {
      if (!fsValues.length) return null;
      const sorted = [...fsValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    })();
    return [
      { label: "Files", value: count || "—", hint: domain ? domain.toUpperCase() : "All domains" },
      { label: "Avg ct (s)", value: count ? format(avgCt) : "—", hint: "Predicted collapse time (ct)" },
      { label: "Median fs (Hz)", value: count ? format(medianFs, 1) : "—", hint: "Typical sampling rate" },
      { label: "R²", value: count && r2 != null ? format(r2) : "—", hint: "Model fit quality" },
      { label: "MAE", value: count && mae != null ? format(mae) : "—", hint: "Average prediction error" },
    ];
  }, [domainRows, domain, r2, mae]);

  const filesStaged = stagedFiles.length;
  const statusLine =
    filesStaged > 0
      ? `You have ${filesStaged} capture${filesStaged === 1 ? "" : "s"} staged for ${domain?.toUpperCase()}. Next step: run collapse predictions.`
      : "No captures staged yet. Start by uploading data for this workspace.";

  // Surface the most important KPIs (including R²) in the main row
  const primaryKpis = kpis.filter((kpi) => ["Files", "Avg ct (s)", "R²", "MAE"].includes(kpi.label));
  const secondaryKpis = kpis.filter((kpi) => !["Files", "Avg ct (s)", "R²", "MAE"].includes(kpi.label));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Phase-{phase}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-50">Workspace · {domain?.toUpperCase() || "ALL"}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload data, run collapse predictions, and then explore tables, spectrograms, and ψ-surfaces.
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{statusLine}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => analyze()}
            disabled={!stagedFiles.length}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-panel transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {stagedFiles.length ? `Run collapse predictions` : "Run collapse predictions"}
          </button>
          <a
            href="#upload-section"
            className="text-xs font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
          >
            Upload more data
          </a>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {primaryKpis.map((kpi) => (
            <KPI key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} />
          ))}
        </div>
        {secondaryKpis.length > 0 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowMetricsDetails((prev) => !prev)}
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-100"
            >
              {showMetricsDetails ? "Hide model details" : "Show model details"}
            </button>
            {showMetricsDetails && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                {secondaryKpis.map((kpi) => (
                  <KPI key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} />
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mt-6">
          <JourneyRail steps={journey} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2" id="upload-section">
        <UploadCard />
        <AnalyzeCard />
      </section>

      {readyRows.length > 0 && (
        <>
          <InsightsSummary />
          <MultiChart />
        </>
      )}

      {readyRows.length > 0 && (
        <section className="grid gap-6 lg:grid-cols-2">
          <SpectrogramCard />
          <PsiSurfaceCard />
        </section>
      )}

      {rows.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Results</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick a file in the table to update the Inspector drawer and spectrogram.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-slate-200 p-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300">
              {["overview", "advanced"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setResultsMode(mode)}
                  className={`rounded-full px-3 py-1 capitalize transition ${
                    resultsMode === mode
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-500 dark:text-slate-300"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <ExplorerTable compact mode={resultsMode} />
        </section>
      )}

      {spec && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Spectrogram heatmap</h3>
            <SpectrogramHeatmap t={spec.t} f={spec.f} Z={spec.sxx_db} ct={spec.ct} domain={domain} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Spectrogram surface</h3>
            <SpectrogramSurface3D t={spec.t} f={spec.f} Z={spec.sxx_db} domain={domain} />
          </div>
        </section>
      )}

      <SessionSummary />

      <InspectorDrawer />
    </div>
  );
}
