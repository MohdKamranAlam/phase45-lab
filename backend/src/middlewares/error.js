import { env } from "../config/index.js";

const formatAxiosError = (err) => {
  if (!err || typeof err !== "object") return null;

  // Axios style error from calling FastAPI
  const status = err.response?.status;
  const data = err.response?.data;

  let message = null;
  if (data) {
    if (typeof data === "string") {
      message = data;
    } else if (typeof data === "object") {
      if (data.error && typeof data.error === "string") {
        message = data.error;
      } else if (data.detail) {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          message = data.detail[0].msg;
        }
      }
    }
  }

  if (!message && typeof err.message === "string") {
    message = err.message;
  }

  if (!message) return null;
  return { status, message };
};

const formatMulterError = (err) => {
  if (!err || typeof err !== "object") return null;
  if (err.code !== "LIMIT_FILE_SIZE") return null;
  const maxMb = env.MAX_FILE_MB || 0;
  const message =
    maxMb > 0
      ? `File too large. Maximum allowed size is ${maxMb} MB.`
      : "File too large.";
  return { status: 413, message };
};

export default (err, _req, res, _next) => {
  // Prefer detailed messages when we can detect specific error types
  const axiosInfo = formatAxiosError(err);
  const multerInfo = formatMulterError(err);

  const status =
    axiosInfo?.status ||
    multerInfo?.status ||
    (typeof err.status === "number" ? err.status : 500);

  const message =
    multerInfo?.message ||
    axiosInfo?.message ||
    (typeof err.message === "string" && err.message.trim()) ||
    "Server error";

  res.status(status).json({ error: message });
};
