import React from "react";
import ReactECharts from "echarts-for-react";

export default function SpectrogramHeatmap({ t, f, Z, ct, title = "I^-energy spectrogram", domain, height = 420 }) {
  if (!t || !f || !Z) return null;
  if (!t.length || !f.length || !Z.length || !(Z[0] && Z[0].length)) return null;
  const data = [];
  for (let i = 0; i < f.length; i++) for (let j = 0; j < t.length; j++) data.push([j, i, Z[i][j]]);

  // dynamic color scale from data (with padding)
  let zmin = Infinity, zmax = -Infinity;
  for (let i = 0; i < f.length; i++) {
    for (let j = 0; j < t.length; j++) {
      const v = Z[i][j];
      if (Number.isFinite(v)) { if (v < zmin) zmin = v; if (v > zmax) zmax = v; }
    }
  }
  if (!Number.isFinite(zmin) || !Number.isFinite(zmax)) { zmin = -120; zmax = -20; }
  if (zmax - zmin < 1e-6) { zmin -= 1; zmax += 1; }

  const option = {
    title: { text: title, left: "center" },
    tooltip: { formatter: (p) => `t=${t[p.data[0]].toFixed(3)}s<br/>f=${f[p.data[1]].toFixed(0)}Hz<br/>${p.data[2].toFixed(1)} dB` },
    grid: { left: 60, right: 20, top: 40, bottom: 50 },
    xAxis: { type: "category", data: t.map((v) => v.toFixed(2)), name: "Time (s)", nameLocation: "middle", nameGap: 30,
      axisLabel: { interval: Math.ceil(t.length / 12) } },
    yAxis: { type: "category", data: f.map((v) => v.toFixed(0)), name: "Hz", nameLocation: "middle", nameGap: 40,
      axisLabel: { interval: Math.ceil(f.length / 12) }, max: domain === "eeg" ? (f.length ? f.findIndex(v=>v>60) || f.length-1 : undefined) : undefined },
    visualMap: { min: zmin, max: zmax, calculable: true, orient: "vertical", right: 10, top: "middle" },
    series: [{ type: "heatmap", data, animation: false }],
  };
  return <ReactECharts option={option} style={{ height }} />;
}
