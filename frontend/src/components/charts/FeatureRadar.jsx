import ReactECharts from "echarts-for-react";

function clamp01(x){
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export default function FeatureRadar({ features }){
  if (!features) return null;
  const fs = Number(features.fs || 0) || 1;
  const nyq = fs / 2;

  const dom = clamp01((Number(features.dom)||0) / nyq);
  const cen = clamp01((Number(features.cen)||0) / nyq);
  const bw  = clamp01((Number(features.bw)||0)  / nyq);
  const lam = clamp01(Number(features.lam) || 0);
  const energy = clamp01(Number(features.energy) || 0);
  // Simple bounded mappings for noise/gamma/beta (unitless proxies)
  const noise = clamp01((Math.abs(Number(features.noise)||0)) / (1 + Math.abs(Number(features.noise)||0)));
  const gamma = clamp01((Number(features.gamma)||0) / (1 + Number(features.gamma)||0));
  const beta  = clamp01((Number(features.beta)||0)  / (1 + Number(features.beta)||0));

  const labels = ["dom","cen","bw","lam","energy","noise","gamma","beta"];
  const vals = [dom, cen, bw, lam, energy, noise, gamma, beta];

  const option = {
    title: { text:"Feature profile", left:"center" },
    radar: { indicator: labels.map(k=>({ name:k, max:1 })) },
    series: [{ type:"radar", data:[{ value: vals, name:"norm-features" }] }]
  };
  return <ReactECharts option={option} style={{ height:320 }} />;
}
