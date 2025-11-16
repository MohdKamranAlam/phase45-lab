import ExplorerTable from "../components/explorer/ExplorerTable.jsx";
import InspectorDrawer from "../components/inspector/InspectorDrawer.jsx";
import { useRunStore } from "../store/useRunStore.js";

export default function Explorer() {
  const rows = useRunStore((state) => state.rows || []);
  const domain = useRunStore((state) => state.domain);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Explorer</p>
        <h1 className="mt-1 text-2xl font-semibold">Results Explorer</h1>
        <p className="mt-2 text-sm text-slate-500">
          {rows.length
            ? `${rows.length} file(s) loaded for ${domain?.toUpperCase() || "workspace"}. Click any row → Inspector drawer.`
            : "Upload + Analyze on the Dashboard to populate this table."}
        </p>
      </section>

      <ExplorerTable />
      <InspectorDrawer />
    </div>
  );
}
