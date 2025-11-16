import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (state) params.set("state", state);
    if (district) params.set("district", district);
    navigate(`/app?${params.toString()}`);
  };

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
          <button
            type="button"
            onClick={() => navigate("/lab")}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
          >
            Open Phase-45R4 Lab
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row">
        <section className="flex-1 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Water risk</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            See your region&apos;s <span className="text-blue-600">water stress</span> in one view.
          </h1>
          <p className="text-sm text-slate-600">
            Combine satellite gravity (GRACE) with collapse-time modelling to get an intuitive risk score, trend, and
            guidance for any district.
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>• Simple score from 0–100 with rising / falling trend.</li>
            <li>• Plain‑language explanation of what the number means.</li>
            <li>• Optional deep‑dive into Phase‑45R4 lab when you&apos;re ready.</li>
          </ul>
        </section>

        <section className="flex-1">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel space-y-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Start here</p>
            <h2 className="text-lg font-semibold text-slate-900">Choose a region</h2>
            <p className="text-xs text-slate-500">
              We&apos;ll calculate a water risk score and short summary for this location.
            </p>

            <label className="block text-xs font-semibold text-slate-600">
              Country
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-600">
              State / Province
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-600">
              District / City
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Fatehpur"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500"
              />
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex items-center rounded-full bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
            >
              See my water risk
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

