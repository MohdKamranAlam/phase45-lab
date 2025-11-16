import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useRunStore } from "../store/useRunStore.js";
import ActionBar from "../components/ActionBar.jsx";

const navItems = [
  { label: "Dashboard", to: "/lab" },
  { label: "Explorer", to: "/lab/explorer" },
  { label: "3D ψ-Surface", to: "/lab/surface3d" },
  { label: "Runs", to: "/lab/runs" },
];

export default function AppShell() {
  const navigate = useNavigate();
  const { phase, domain, setDomain, rows } = useRunStore();
  const readyCount = useMemo(() => (rows || []).filter((row) => !row?.error).length, [rows]);
  const issueCount = useMemo(() => (rows || []).filter((row) => row?.error).length, [rows]);
  const [theme, setTheme] = useState(() => localStorage.getItem("phase45-theme") || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("phase45-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-panel" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">Signal Forge</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Phase-{phase}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <select
              value={phase}
              disabled
              className="rounded-xl border border-slate-200 bg-white/80 px-2 py-1 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
            >
              <option value={phase}>Phase-{phase}</option>
            </select>
            <select
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-1 text-sm capitalize text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            >
              {["audio", "eeg", "ligo", "grace"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <span>
                Files <strong className="text-slate-900 dark:text-slate-100">{readyCount}</strong>
              </span>
              <span>
                Alerts{" "}
                <strong className={issueCount ? "text-red-500" : "text-slate-900 dark:text-slate-100"}>{issueCount}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
            >
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
            <a
              href="https://signalforge.docs"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
            >
              Docs
            </a>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
            >
              Run history
            </button>
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="rounded-full border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-400 hover:text-blue-700 bg-white/80"
            >
              Water risk view
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-[92%] gap-8 px-6 py-6">
        <aside className="w-56 pt-2">
          <nav className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 text-sm font-semibold text-slate-500 shadow-panel dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "block rounded-full px-4 py-2 transition",
                    isActive
                      ? "bg-[#2563EB] text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-[#EFF6FF] hover:text-[#1D4ED8] dark:hover:bg-slate-800/80 dark:hover:text-slate-50",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 pb-24">
          <Outlet />
        </main>
      </div>
      <ActionBar />
    </div>
  );
}
