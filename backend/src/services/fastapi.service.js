import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { env } from "../config/index.js";

const api = axios.create({
  baseURL: env.FASTAPI_URL,
  timeout: 120000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

const toFormPart = (file) => {
  if (!file) return null;
  const filename = file.originalname || "file";
  const contentType = file.mimetype || "application/octet-stream";

  if (file.buffer) {
    return { value: file.buffer, options: { filename, contentType } };
  }
  if (file.path) {
    return { value: fs.createReadStream(file.path), options: { filename, contentType } };
  }
  return null;
};

// helperssdjkasnjdnasjkdnask
export async function predictJSON(domain, files) {
  const fd = new FormData();
  fd.append("domain", domain);
  for (const f of files || []) {
    const part = toFormPart(f);
    if (part) fd.append("files", part.value, part.options);
  }
  const { data } = await api.post("/predict", fd, { headers: fd.getHeaders() });
  return data;
}

export function predictCSV(domain, files) {
  const fd = new FormData();
  fd.append("domain", domain);
  for (const f of files || []) {
    const part = toFormPart(f);
    if (part) fd.append("files", part.value, part.options);
  }
  return api.post("/predict/csv", fd, { headers: fd.getHeaders(), responseType: "stream" });
}

export function spectrogramPNG(domain, file) {
  const fd = new FormData();
  fd.append("domain", domain);
  const part = toFormPart(file);
  if (part) fd.append("file", part.value, part.options);
  return api.post("/predict/spectrogram", fd, { headers: fd.getHeaders(), responseType: "stream" });
}

export async function spectrogramJSON(domain, file) {
  const fd = new FormData();
  fd.append("domain", domain);
  const part = toFormPart(file);
  if (part) fd.append("file", part.value, part.options);
  const { data } = await api.post("/spectrogram_json", fd, { headers: fd.getHeaders() });
  return data;
}

export async function psiSurface(body) {
  const { data } = await api.post("/psi_surface_json", body);
  return data;
}

export async function healthFastAPI() {
  const { data } = await api.get("/health");
  return data;
}

// --- S3 helpers ---
export async function presignUpload(name, contentType) {
  const { data } = await api.post("/uploads/presign", { name, content_type: contentType });
  return data;
}

export async function predictFromS3(domain, keys) {
  const { data } = await api.post("/predict_from_s3", { domain, keys });
  return data;
}
