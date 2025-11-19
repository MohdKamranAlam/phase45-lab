import dotenv from "dotenv";
dotenv.config();

const normalize = (value = "") => value.trim().replace(/\/+$/, "");
const prefixPath = (value = "") => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `/${trimmed.replace(/^\/+/, "")}`;
};

const rawUrl = process.env.FASTAPI_URL && process.env.FASTAPI_URL.trim();
const rawBase =
  process.env.FASTAPI_BASE && process.env.FASTAPI_BASE.trim();
const rawPrefix =
  process.env.FASTAPI_PREFIX !== undefined ? process.env.FASTAPI_PREFIX : "/api/v1";

const normalizedPrefix = prefixPath(rawPrefix);

const baseFromUrl = rawUrl ? normalize(rawUrl) : "";
const needsPrefix =
  Boolean(baseFromUrl) &&
  Boolean(normalizedPrefix) &&
  !baseFromUrl.endsWith(normalizedPrefix);
const fastapiUrl = baseFromUrl
  ? needsPrefix
    ? `${baseFromUrl}${normalizedPrefix}`
    : baseFromUrl
  : normalize(rawBase || "http://127.0.0.1:8001") + normalizedPrefix;

export const env = {
  PORT: Number(process.env.PORT || 8080),
  FASTAPI_URL: fastapiUrl,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
  MAX_FILE_MB: Number(process.env.MAX_FILE_MB || 1024),
};
