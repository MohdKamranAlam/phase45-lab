import axios from "axios";

let resolvedBaseUrl =
  import.meta.env.VITE_API_BASE ??
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8080";

// HOTFIX: Force CloudFront URL if we see the insecure Elastic Beanstalk URL
// This overrides Amplify environment variables that might still be pointing to HTTP
if (resolvedBaseUrl.includes("elasticbeanstalk.com") && resolvedBaseUrl.startsWith("http:")) {
  resolvedBaseUrl = "https://d2czd7bg7uzarm.cloudfront.net";
}

let resolvedUploadBaseUrl =
  import.meta.env.VITE_UPLOAD_BASE ??
  resolvedBaseUrl;

if (resolvedUploadBaseUrl.includes("elasticbeanstalk.com") && resolvedUploadBaseUrl.startsWith("http:")) {
  resolvedUploadBaseUrl = "https://d2czd7bg7uzarm.cloudfront.net";
}

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
// Force S3 uploads if we are on CloudFront (production) or if explicitly enabled
const s3UploadsEnabled = true; // Always enable S3 uploads for reliability with large files

// ---- Predict (multiple files) ----
export async function predict(domain, files, onUploadProgress) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);           // field name: "files"
  
  // FORCE S3 for EVERYTHING to bypass Nginx 1MB limit
  // The server seems to have a strict 1MB limit that isn't updating.
  // S3 upload bypasses this limit completely.
  const BIG = 0; 
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
