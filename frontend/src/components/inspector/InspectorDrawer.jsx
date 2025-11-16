import { useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { useRunStore } from "../../store/useRunStore.js";
import { buildInspectorSummary, classifyRow } from "../../utils/fileInsights.js";

export default function InspectorDrawer() {
  const { drawerOpen, selected, closeDrawer, rows } = useRunStore();

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      const onKey = (event) => {
        if (event.key === "Escape") closeDrawer();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
    return undefined;
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen || !selected) return null;

  const summary = buildInspectorSummary(selected, rows || []);
  const classification = classifyRow(selected, rows || []);

  const radar = {
    radar: {
      indicator: [
        { name: "γ", max: 3 },
        { name: "A₀", max: 1.5 },
        { name: "noise", max: 1 },
        { name: "β", max: 1 },
        { name: "λ", max: 2 },
      ],
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [
              Number(selected.gamma) || 0,
              Number(selected.energy) || 0,
              Number(selected.noise) || 0,
              Number(selected.beta) || 0,
              Number(selected.lam) || 0,
            ],
          },
        ],
      },
    ],
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={closeDrawer} />
      <aside className="fixed right-0 top-0 z-50 h-full w-[360px] border-l border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Inspector</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{selected.name || "file"}</h3>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${
              classification.label === "error"
                ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-200"
                : classification.label === "outlier"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                : classification.label === "noisy"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-200"
                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
            }`}
          >
            {classification.label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div>ct (pred)</div>
          <div className="font-semibold">{Number(selected.ct_pred ?? selected.kitab_ct ?? selected.ct_proxy)?.toFixed(3) ?? "—"} s</div>
          <div>ct (proxy)</div>
          <div>{Number(selected.ct_proxy)?.toFixed(3) ?? "—"} s</div>
          <div>fs</div>
          <div>{selected.fs ? `${selected.fs} Hz` : "—"}</div>
          <div>CI 95%</div>
          <div>
            {(selected.kitab_lo ?? selected.ci_lo ?? "—")} – {(selected.kitab_hi ?? selected.ci_hi ?? "—")}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
          <ReactECharts option={radar} style={{ height: 200 }} />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            {summary.title}
          </p>
          <ul className="mt-2 space-y-1">
            {summary.lines.map((line, idx) => (
              <li key={idx}>• {line}</li>
            ))}
          </ul>
        </div>

        <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <summary className="cursor-pointer font-semibold">Raw JSON & snippets</summary>
          <pre className="mt-2 max-h-56 overflow-auto text-[11px]">{JSON.stringify(selected, null, 2)}</pre>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const snippet = `# Analyze this capture via Phase-45R4\nimport requests\n\nfiles = {\"files\": open(\"${selected.name || "file"}\", \"rb\")}\nresp = requests.post(\"http://127.0.0.1:8080/api/predict/${(selected.domain || "audio").toLowerCase()}\", files=files)\nprint(resp.json())\n`;
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(snippet);
              }}
              className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
            >
              Copy Python snippet
            </button>
            <button
              type="button"
              onClick={() => {
                const curl = `curl -X POST \"http://127.0.0.1:8080/api/predict/${(selected.domain || "audio").toLowerCase()}\" \\\n  -F \"files=@${selected.name || "file"}\"`;
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(curl);
              }}
              className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
            >
              Copy cURL command
            </button>
          </div>
        </details>

        {selected.error && (
          <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
            {selected.error_message || "Backend could not analyze this file. Check FastAPI logs for details."}
          </p>
        )}

        <button
          onClick={closeDrawer}
          className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
        >
          Close (Esc)
        </button>
      </aside>
    </>
  );
}
