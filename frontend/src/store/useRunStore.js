import { create } from "zustand";
import { predict, spectrogramJSON, downloadCSV } from "../services/api.js";

const extractErrorMessage = (error, fallback) => {
  if (!error) return fallback;

  const resp = error.response;
  const data = resp && resp.data;

  let message = null;

  if (data) {
    if (typeof data === "string") {
      message = data;
    } else if (typeof data === "object") {
      if (typeof data.error === "string" && data.error.trim()) {
        message = data.error.trim();
      } else if (typeof data.detail === "string" && data.detail.trim()) {
        message = data.detail.trim();
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = String(data.detail[0].msg).trim();
      }
    }
  }

  if (!message && typeof error.message === "string" && error.message.trim()) {
    message = error.message.trim();
  }

  if (message === "Network Error") {
    // Typical axios browser message when the API cannot be reached
    message =
      "Network error talking to the API gateway (http://127.0.0.1:8080). " +
      "Make sure the Node backend is running and not blocked by CORS or a proxy.";
  }

  return message || fallback;
};

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

export const useRunStore = create((set, get) => ({
  phase: "45R4",
  domain: "audio",
  rows: [],
  spec: null,
  psi: null,
  r2: null,
  mae: null,
  stagedFiles: [],
  analyzing: false,
  analyzeProgress: 0,
  spectroPending: false,
  drawerOpen: false,
  selected: null,
  runs: [],
  lastError: null,
  setPhase: (phase) => set({ phase }),
  setDomain: (domain) => set({ domain }),
  setRows: (rows) => set({ rows }),
  setSpec: (spec) => set({ spec }),
  setPsi: (psi) => set({ psi }),
  setMetrics: (r2, mae) => set({ r2, mae }),
  uploadFiles: (fileList) =>
    set((state) => {
      const incoming = Array.from(fileList || []).map((file) => ({
        id: makeId(),
        file,
        name: file.name,
        size: file.size,
        status: "ready",
        ready: true,
      }));
      if (!incoming.length) return {};
      return { stagedFiles: [...state.stagedFiles, ...incoming], lastError: null };
    }),
  clearQueue: () => set({ stagedFiles: [], lastError: null }),
  analyze: async () => {
    const { stagedFiles, domain } = get();
    if (!stagedFiles.length) return;
    set({ analyzing: true, lastError: null, analyzeProgress: 0 });
    const files = stagedFiles.map((entry) => entry.file);
    const stamp = new Date().toISOString();
    try {
      const res = await predict(domain, files, (event) => {
        if (!event.total) return;
        const pct = Math.round((event.loaded / event.total) * 100);
        set({ analyzeProgress: pct });
      });
      const nextRows = res.results || [];
      set({
        rows: nextRows,
        r2: res.r2 ?? null,
        mae: res.mae ?? null,
        drawerOpen: nextRows.length > 0,
        selected: nextRows[0] || null,
      });
      set((state) => ({
        runs: [
          {
            id: makeId(),
            at: stamp,
            files: stagedFiles.length,
            domain,
            status: "ready",
            data: nextRows,
            r2: res.r2 ?? null,
            mae: res.mae ?? null,
          },
          ...state.runs.slice(0, 49),
        ],
      }));
    } catch (error) {
      console.error("analyze failed", error);
      const message = extractErrorMessage(error, "Analysis failed");
      set({ lastError: message });
      set((state) => ({
        runs: [
          {
            id: makeId(),
            at: stamp,
            files: stagedFiles.length,
            domain,
            status: "error",
            notes: message,
          },
          ...state.runs.slice(0, 49),
        ],
      }));
    } finally {
      set({ analyzing: false, analyzeProgress: 0 });
    }
  },
  spectrogram: async () => {
    const { stagedFiles, domain } = get();
    if (!stagedFiles.length) return;
    set({ spectroPending: true, lastError: null });
    try {
      const data = await spectrogramJSON(domain, stagedFiles[0].file);
      set({ spec: data });
    } catch (error) {
      console.error("spectrogram failed", error);
      const message = extractErrorMessage(error, "Spectrogram failed");
      set({ lastError: message });
    } finally {
      set({ spectroPending: false });
    }
  },
  exportCsv: async () => {
    const { stagedFiles, domain } = get();
    if (!stagedFiles.length) return;
    try {
      const blob = await downloadCSV(domain, stagedFiles.map((entry) => entry.file));
      if (typeof document === "undefined" || typeof URL === "undefined") return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `phase45_${domain}_results.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("export csv failed", error);
      const message = extractErrorMessage(error, "CSV export failed");
      set({ lastError: message });
    }
  },
  openDrawer: (row) => set({ drawerOpen: true, selected: row }),
  closeDrawer: () => set({ drawerOpen: false, selected: null }),
  restoreRun: (run) => {
    if (!run?.data || !run.data.length) return;
    set({
      domain: run.domain || get().domain,
      rows: run.data,
      r2: run.r2 ?? null,
      mae: run.mae ?? null,
      drawerOpen: true,
      selected: run.data[0],
    });
  },
}));
