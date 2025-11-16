import { useState } from "react";
import { psiSurface } from "../services/api.js";
import { useRunStore } from "../store/useRunStore.js";
import PsiSurfaceCanvas from "../components/psi/PsiSurfaceCanvas.jsx";
import InspectorDrawer from "../components/inspector/InspectorDrawer.jsx";

const fields = [
  { key: "gamma_min", label: "γ min", step: 0.1, min: 0 },
  { key: "gamma_max", label: "γ max", step: 0.1, min: 0.1 },
  { key: "steps_g", label: "γ steps", step: 1, min: 10, max: 180 },
  { key: "energy_min", label: "A₀ min", step: 0.01, min: 0, max: 1 },
  { key: "energy_max", label: "A₀ max", step: 0.01, min: 0, max: 1.5 },
  { key: "steps_e", label: "A₀ steps", step: 1, min: 10, max: 180 },
  { key: "beta", label: "β", step: 0.0005, min: 0 },
  { key: "lam", label: "λ", step: 0.05, min: 0 },
  { key: "noise", label: "Noise", step: 0.05, min: 0, max: 1 },
];

const presets = {
  ligo: {
    gamma_min: 0.1,
    gamma_max: 120,
    steps_g: 60,
    energy_min: 0.1,
    energy_max: 1.0,
    steps_e: 60,
    beta: 0.001,
    lam: 0.2,
    noise: 0.2,
  },
  eeg: {
    gamma_min: 5,
    gamma_max: 80,
    steps_g: 50,
    energy_min: 0.0,
    energy_max: 0.6,
    steps_e: 50,
    beta: 0.0005,
    lam: 0.15,
    noise: 0.35,
  },
  audio: {
    gamma_min: 0.5,
    gamma_max: 40,
    steps_g: 40,
    energy_min: 0.05,
    energy_max: 0.9,
    steps_e: 45,
    beta: 0.002,
    lam: 0.25,
    noise: 0.1,
  },
};

export default function Surface3D() {
  const { psi, setPsi } = useRunStore();
  const [params, setParams] = useState({
    gamma_min: 0.1,
    gamma_max: 200,
    steps_g: 50,
    energy_min: 0.0,
    energy_max: 1.0,
    steps_e: 50,
    beta: 0.001,
    lam: 0.2,
    noise: 0.2,
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    const parsed = Number(value);
    setParams((prev) => ({ ...prev, [key]: Number.isNaN(parsed) ? prev[key] : parsed }));
  };

  const run = async () => {
    setLoading(true);
    try {
      const data = await psiSurface(params);
      setPsi(data);
    } catch (error) {
      console.error("surface generation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    if (!preset) return;
    setParams(preset);
  };

  return (
    <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">ψ-surface</p>
          <h1 className="mt-1 text-2xl font-semibold">Generate 3D ψ-surface</h1>
          <p className="mt-2 text-sm text-slate-500">
            Pick ranges for γ, A₀, β, λ and noise. Generate ct(γ, A₀) and explore the mesh interactively.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.keys(presets).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                {key}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <label key={field.key} className="text-sm font-medium text-slate-600">
                {field.label}
                <input
                  type="number"
                  value={params[field.key]}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  onChange={(event) => update(field.key, event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                />
              </label>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={run}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-panel transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Generating…" : "Generate surface"}
            </button>
            <p className="text-xs text-slate-500">
              Mesh renders asynchronously so you can keep working elsewhere.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Viewer</p>
          <h2 className="mt-1 text-xl font-semibold">Interactive ψ-surface</h2>
          <p className="mt-1 text-sm text-slate-500">
            Orbit, zoom, or export the mesh once you like the topology.
          </p>
          <div className="mt-4 rounded-2xl bg-slate-950/80 p-2">
            <PsiSurfaceCanvas gamma={psi?.gamma} energy={psi?.energy} ct={psi?.ct} />
          </div>
        </section>
      <InspectorDrawer />
    </div>
  );
}
