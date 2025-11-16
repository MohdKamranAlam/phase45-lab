import ReactECharts from "echarts-for-react";
import { pickCt, classifyRow } from "../../utils/fileInsights.js";

export default function CtBar({ rows = [], domain, hasErrors = false }) {
  if (!rows.length) {
    return (
      <div className="chart-empty">
        {domain ? `No valid ${domain.toUpperCase()} files yet.` : "No valid files yet."}
      </div>
    );
  }

  const classified = rows.map((row) => classifyRow(row, rows));

  const option = {
    title: { text: "Predicted I^-collapse (ct) by file", left: "center" },
    grid: { left: 60, right: 20, bottom: 80, top: 40 },
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const row = rows[p.dataIndex] || {};
        const ct = pickCt(row);
        const proxy = row.ct_proxy ?? 0;
        const kit = row.kitab_ct ?? ct;
        const domainLabel = row.domain ? row.domain.toUpperCase() : "-";
        return `<strong>${row.name || "file"}</strong><br/>Domain: ${domainLabel}<br/>ct: ${ct.toFixed(
          3
        )} s<br/>ct_proxy: ${Number(proxy).toFixed(3)} s<br/>kitab_ct: ${Number(kit).toFixed(3)} s`;
      },
    },
    xAxis: {
      type: "category",
      data: rows.map((r) => r.name || r.label || "file"),
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: "value", name: "ct (s)" },
    series: [
      {
        type: "bar",
        data: rows.map((row, idx) => {
          const ct = pickCt(row) ?? 0;
          const label = classified[idx]?.label;
          let color = "#2563eb"; // default brand blue
          if (label === "stable") color = "#16a34a"; // green for stable
          else if (label === "noisy") color = "#60a5fa"; // lighter blue
          else if (label === "outlier") color = "#1d4ed8"; // deeper blue
          else if (label === "error") color = "#ef4444"; // red for errors
          return {
            value: ct,
            itemStyle: {
              color,
              borderRadius: [6, 6, 0, 0],
            },
          };
        }),
        label: { show: true, position: "top" },
      },
    ],
  };

  return (
    <>
      <ReactECharts option={option} style={{ height: 320 }} />
      {hasErrors && <div className="chart-note">Error files were excluded from this view.</div>}
    </>
  );
}
