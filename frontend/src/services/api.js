import axios from "axios";

const resolvedBaseUrl =
  import.meta.env.VITE_API_BASE ??
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8080";
const resolvedUploadBaseUrl =
  import.meta.env.VITE_UPLOAD_BASE ??
  resolvedBaseUrl;
const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 120000,
});
const s3Flag = (import.meta.env.VITE_S3_UPLOADS ?? "auto").toString().toLowerCase();
let uploadHostname = "";
try {
  uploadHostname = new URL(resolvedUploadBaseUrl).hostname;
} catch (error) {
  uploadHostname = "";
}
const looksLikeCloudFront = /cloudfront\.net$/i.test(uploadHostname);
const s3UploadsEnabled = s3Flag === "1" || (s3Flag === "auto" && looksLikeCloudFront);

// ---- Predict (multiple files) ----
export async function predict(domain, files, onUploadProgress) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);           // field name: "files"
  const BIG = 28 * 1024 * 1024;
  const useS3 = s3UploadsEnabled && Array.from(files || []).some((f) => (f?.size || 0) > BIG);

  if (!useS3) {
    const { data } = await api.post(`/api/predict/${encodeURIComponent(domain)}`, fd, {
      onUploadProgress,
    });
    return data; // { results: [...], r2?, mae? ... }
  }

  const keys = [];
  for (const file of files) {
    const { data: pre } = await api.post(
      "/api/uploads/presign",
      {
        name: file.name,
        content_type: file.type || "application/octet-stream",
      },
      { baseURL: resolvedUploadBaseUrl }
    );
    await axios.put(pre.url, file, {
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });
    keys.push(pre.key);
  }
  const { data } = await api.post(
    `/api/predict/${encodeURIComponent(domain)}/from-s3`,
    { keys },
    { baseURL: resolvedUploadBaseUrl }
  );
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
