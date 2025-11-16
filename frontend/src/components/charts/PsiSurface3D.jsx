import React from "react";
import ReactECharts from "echarts-for-react";
import "echarts-gl";

export default function PsiSurface3D({ gamma, energy, ct }){
  if (!gamma || !energy || !ct) return null;
  const pts=[];
  for (let i=0;i<gamma.length;i++) for (let j=0;j<energy.length;j++) pts.push([gamma[i], energy[j], ct[i][j]]);
  const option = {
    title: { text:"ψ-surface: ct(γ, A0)", left:"center" },
    tooltip: { formatter: p=>`γ=${p.value[0].toFixed(3)}<br/>A0=${p.value[1].toFixed(3)}<br/>ct=${p.value[2].toFixed(3)}s` },
    grid3D: { viewControl:{ beta:70, alpha:30 } },
    xAxis3D: { type:"value", name:"γ" },
    yAxis3D: { type:"value", name:"Energy (A0)" },
    zAxis3D: { type:"value", name:"ct (s)" },
    visualMap: { min:0, max:10, calculable:true, right:0, top:20 },
    series:[{ type:"surface", data:pts, shading:"color", wireframe:{ show:true, lineStyle:{ width:0.5 } } }]
  };
  return <ReactECharts option={option} style={{ height:520 }} />;
}
