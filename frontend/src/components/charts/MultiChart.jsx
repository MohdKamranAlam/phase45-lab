import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useRunStore } from "../../store/useRunStore.js";
const tabs = ["Bar", "Line", "Radar (advanced)"];

export default function MultiChart() {
  const rows = useRunStore((state) => state.rows || []);
  const [tab, setTab] = useState("Bar");

  const safeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  // Show one bar per non-error file; treat non-finite values as 0 so
  // every processed file still appears in the charts.
  const data = rows.filter((row) => !row?.error);
  const names = data.map((row) => (row.name || "file").slice(0, 28));
  const ct = data.map((row) => safeNumber(row?.ct_pred ?? row?.kitab_ct ?? row?.ct_proxy, 0));
  const ctProxy = data.map((row) => safeNumber(row?.ct_proxy, 0));
  const gamma = data.map((row) => safeNumber(row?.gamma, 0));
  const beta = data.map((row) => safeNumber(row?.beta, 0));
  const lam = data.map((row) => safeNumber(row?.lam, 0));
  const energy = data.map((row) => safeNumber(row?.energy, 0));
  const noise = data.map((row) => safeNumber(row?.noise, 0));

  const option = useMemo(() => {
    const activeTab = tab.startsWith("Radar") ? "Radar" : tab;
    if (activeTab === "Bar") {
      return {
        grid: { left: 36, right: 16, top: 24, bottom: 64 },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: names,
          axisLabel: { interval: 0, rotate: 30 },
        },
        yAxis: { type: "value", name: "ct (s)" },
        series: [
          {
            type: "bar",
            data: ct,
            itemStyle: { color: "#3B82F6", borderRadius: [10, 10, 0, 0] },
          },
        ],
      };
    }
    if (activeTab === "Line") {
      return {
        grid: { left: 36, right: 16, top: 24, bottom: 64 },
        legend: { data: ["ct", "ct_proxy", "γ"] },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: names, axisLabel: { interval: 0, rotate: 30 } },
        yAxis: { type: "value" },
        series: [
          { name: "ct", type: "line", smooth: true, data: ct },
          { name: "ct_proxy", type: "line", smooth: true, data: ctProxy },
          { name: "γ", type: "line", smooth: true, data: gamma },
        ],
      };
    }
    if (activeTab === "Radar") {
      const maxGamma = Math.max(0.5, ...gamma);
      const maxBeta = Math.max(0.2, ...beta);
      const maxLam = Math.max(0.5, ...lam);
      const maxEnergy = Math.max(1, ...energy);
      const maxNoise = Math.max(1, ...noise);
      return {
        tooltip: {},
        radar: {
          indicator: [
            { name: "γ", max: maxGamma },
            { name: "β", max: maxBeta },
            { name: "λ", max: maxLam },
            { name: "energy", max: maxEnergy },
            { name: "noise", max: maxNoise },
          ],
        },
        series: [
          {
            type: "radar",
            data: names.map((name, index) => ({
              name,
              value: [gamma[index], beta[index], lam[index], energy[index], noise[index]],
            })),
          },
        ],
      };
    }
    return null;
  }, [tab, names, ct, ctProxy, gamma, beta, lam, energy, noise]);

  const hasChartData = data.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-base font-semibold">Collapse time by file</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare predicted collapse time (ct) across captures.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                tab === item ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500"
              }`}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {hasChartData && option ? (
        <div className="h-[320px]">
          <ReactECharts option={option} style={{ height: 320 }} notMerge lazyUpdate />
        </div>
      ) : (
        <div className="flex h-[180px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          Upload files to render charts.
        </div>
      )}
    </div>
  );
}
