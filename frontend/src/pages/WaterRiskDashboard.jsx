import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const format = (value, digits = 1) => {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
};

function useWaterRiskFromQuery() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const country = params.get("country") || "India";
  const state = params.get("state") || "Uttar Pradesh";
  const district = params.get("district") || "Fatehpur";

  // For now, return deterministic dummy data based on district length
  const base = Math.min(90, 40 + (district.length % 30) * 2);
  const trendDelta = ((district.length % 6) - 3) * 1.5;
  const rising = trendDelta >= 0;

  const score = base;
  const status = score >= 75 ? "Very high" : score >= 55 ? "High" : score >= 35 ? "Moderate" : "Low";
  const confidence = score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";

  const history = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    score: Math.max(0, Math.min(100, score + (i - 11) * (trendDelta / 6))),
  }));

  return {
    regionName: `${district}, ${state}, ${country}`,
    score,
    status,
    trendLabel: rising ? "Rising" : "Falling",
    trendDelta,
    confidence,
    history,
  };
}

export default function WaterRiskDashboard() {
  const navigate = useNavigate();
  const risk = useWaterRiskFromQuery();

  const insightLines = useMemo(() => {
    const lines = [];
    if (risk.status === "Very high") {
      lines.push("Water stress is very high for this region. Short-term interventions are recommended.");
    } else if (risk.status === "High") {
      lines.push("Water stress is elevated. Track this score regularly and plan mitigation.");
    } else if (risk.status === "Moderate") {
      lines.push("Water stress is moderate and currently manageable.");
    } else {
      lines.push("Water stress is relatively low for this region.");
    }
    if (risk.trendDelta > 0) {
      lines.push("Trend indicates stress has been rising in recent months.");
    } else if (risk.trendDelta < 0) {
      lines.push("Trend indicates stress has been easing recently.");
    }
    if (risk.confidence === "Low") {
      lines.push("Confidence is low; treat this score as indicative, not definitive.");
    }
    return lines;
  }, [risk]);

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-panel" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-slate-900">Signal Forge</p>
              <p className="text-xs text-slate-500">Water Risk Explorer</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600"
            >
              Change region
            </button>
            <button
              type="button"
              onClick={() => navigate("/lab")}
              className="rounded-full bg-[#2563EB] px-3 py-1.5 font-semibold text-xs text-white shadow-sm hover:bg-[#1D4ED8]"
            >
              Open Phase-45R4 Lab
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Region · Water stress overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{risk.regionName}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Simple water risk view powered by GRACE‑like gravity data and ψ‑collapse modelling — designed for quick
            interpretation, not raw signals.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Water Risk Score</p>
              <p className="mt-2 text-3xl font-semibold text-blue-700">
                {format(risk.score, 0)}
                <span className="text-base text-slate-400"> / 100</span>
              </p>
              <p className="text-sm text-slate-600">Status: {risk.status}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Trend</p>
              <p className="mt-2 text-2xl font-semibold text-blue-700">
                {risk.trendLabel}{" "}
                <span className="text-base text-slate-500">
                  ({risk.trendDelta >= 0 ? "+" : ""}
                  {format(risk.trendDelta, 1)} pts)
                </span>
              </p>
              <p className="text-sm text-slate-600">Last 12‑month change in composite stress score.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Model confidence</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">{risk.confidence}</p>
              <p className="text-sm text-slate-600">
                Based on signal quality and coverage for this region.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Stress timeline</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Water stress over the last year</h2>
            <div className="mt-4 h-40 rounded-xl bg-gradient-to-br from-[#EFF6FF] via-white to-[#E0F2FE] p-4">
              <p className="text-xs text-slate-500">
                Simple placeholder timeline. Integrate your preferred charting library and use{" "}
                <code>risk.history</code> to render a proper line chart.
              </p>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              {insightLines.map((line, idx) => (
                <li key={idx}>• {line}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">What this means</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Interpreting this score</h2>
            <p className="mt-2 text-xs text-slate-600">
              Scores above 70 indicate sustained stress and increased sensitivity to dry seasons. Scores between 40–70
              are moderate; below 40 suggests relatively comfortable conditions, though local realities may differ.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Next steps</p>
            <ul className="mt-1 space-y-1 text-xs text-slate-600">
              <li>• Share this summary with local teams to calibrate expectations.</li>
              <li>• Use alerts to track when the score crosses thresholds that matter to you.</li>
              <li>• Open the Phase‑45R4 lab to inspect raw signals and collapse‑time distributions.</li>
            </ul>
            <button
              type="button"
              className="mt-3 w-full rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
            >
              Download PDF report (coming soon)
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Advanced · ψ‑Field lab
              </p>
              <p className="mt-1">
                Curious about the underlying signals? Open the Phase‑45R4 lab to upload GRACE/LIGO/EEG/AUDIO captures
                and inspect collapse‑time features directly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/lab")}
              className="rounded-full bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
            >
              Go to lab
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

