export default function JourneyRail({ steps = [] }) {
  return (
    <div className="flex flex-wrap gap-3 rounded-2xl bg-[#E5EDF9] px-4 py-3 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
      {steps.map((step, index) => {
        const state = step.status || "pending";
        const dotStyles =
          state === "done"
            ? "bg-emerald-500 text-white"
            : state === "active"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200";
        const labelStyles =
          state === "done"
            ? "text-emerald-700 dark:text-emerald-300"
            : state === "active"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400";

        return (
          <div key={step.key || index} className="flex items-center gap-3">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${dotStyles}`}
            >
              {index + 1}
            </span>
            <div className="flex flex-col">
              <p className={`text-[0.7rem] font-semibold uppercase tracking-wide ${labelStyles}`}>{step.step}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{step.label}</p>
              {state === "active" && step.desc && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
              )}
            </div>
            {step.badge && (
              <span className="ml-1 inline-flex rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-300">
                {step.badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
