import React from "react";
import ReactECharts from "echarts-for-react";
import "echarts-gl";

export default function SpectrogramSurface3D({ t, f, Z, domain }){
  if (!t || !f || !Z) return null;
  if (!t.length || !f.length || !Z.length || !(Z[0] && Z[0].length)) return null;
  const pts=[];
  let zmin = Infinity, zmax = -Infinity;
  for (let i=0;i<f.length;i++) {
    for (let j=0;j<t.length;j++) {
      const v = Z[i][j];
      pts.push([t[j], f[i], v]);
      if (Number.isFinite(v)) { if (v<zmin) zmin=v; if (v>zmax) zmax=v; }
    }
  }
  if (!Number.isFinite(zmin) || !Number.isFinite(zmax)) { zmin = -120; zmax = -20; }
  if (zmax - zmin < 1e-6) { zmin -= 1; zmax += 1; }
  const option = {
    title: { text:"3D Spectrogram", left:"center" },
    tooltip: { formatter: p=>`t=${p.value[0].toFixed(3)}s<br/>f=${p.value[1].toFixed(0)}Hz<br/>${p.value[2].toFixed(1)} dB` },
    grid3D: { viewControl:{ alpha:20, beta:50, minAlpha:0, maxAlpha:90 } },
    xAxis3D: { type:"value", name:"Time (s)" },
    yAxis3D: { type:"value", name:"Hz", max: domain === "eeg" ? 60 : undefined },
    zAxis3D: { type:"value", name:"Power [dB]" },
    visualMap: { min:zmin, max:zmax, calculable:true, right:0, top:20 },
    series:[{ type:"surface", data:pts, dataShape:[t.length, f.length], shading:"realistic", wireframe:{ show:false } }]
  };
  return <ReactECharts option={option} style={{ height:520 }} />;
}
