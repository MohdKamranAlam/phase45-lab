import axios from "axios";

const resolvedBaseUrl =
  import.meta.env.VITE_API_BASE ??
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8080";

const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 120000
});

// ---- Predict (multiple files) ----
export async function predict(domain, files, onUploadProgress) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);           // field name: "files"
  const { data } = await api.post(`/api/predict/${encodeURIComponent(domain)}`, fd, {
    onUploadProgress
  });
  return data; // { results: [...], r2?, mae? ... }
}

// ---- Spectrogram JSON (single file) ----
export async function spectrogramJSON(domain, file) {
  const fd = new FormData();
  fd.append("file", file);                                 // field name: "file"
  const { data } = await api.post(`/api/spectrogram_json/${encodeURIComponent(domain)}`, fd);
  return data; // { t, f, sxx_db, ct, meta }
}

// ---- CSV (stream) ----
export async function downloadCSV(domain, files) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  const res = await api.post(`/api/predict/${encodeURIComponent(domain)}/csv`, fd, {
    responseType: "blob"
  });
  return res.data; // Blob
}

// ---- ψ-surface (GET with params) ----
export async function psiSurface(params) {
  // params: { gmin:0, gmax:3, n:60 } etc.
  const { data } = await api.get("/api/surface/psi-surface", { params });
  return data; // { gamma[], energy[], ct[][] }  (example)
}

export default api;
