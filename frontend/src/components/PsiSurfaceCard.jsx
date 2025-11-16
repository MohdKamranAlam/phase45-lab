import { useNavigate } from "react-router-dom";
import { useRunStore } from "../store/useRunStore.js";

export default function PsiSurfaceCard() {
  const { psi } = useRunStore();
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
            ψ-Surface
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {psi ? "Latest mesh ready" : "Generate ct(γ, A₀)"}
          </h3>
        </div>
        <button
          onClick={() => navigate("/surface3d")}
          className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-500"
        >
          Go to 3D →
        </button>
      </div>
      <div className="mt-4 h-40 rounded-xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        {psi ? (
          <div className="flex h-full flex-col items-center justify-center text-xs text-slate-500 dark:text-slate-300">
            <span>γ points: {psi.gamma?.length || 0}</span>
            <span>A₀ points: {psi.energy?.length || 0}</span>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-slate-400">
            <p className="max-w-xs text-center">
              No 3D ψ-surface yet. Use the 3D view to sweep γ and A₀, then export meshes for notebooks or external tools.
            </p>
            <button
              type="button"
              onClick={() => navigate("/lab/surface3d")}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Open 3D ψ-Surface
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
