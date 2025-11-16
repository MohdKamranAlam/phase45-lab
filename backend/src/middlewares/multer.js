import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import { env } from "../config/index.js";

const uploadRoot = process.env.UPLOAD_TMP_DIR || path.join(os.tmpdir(), "phase45_uploads");

// Ensure temp directory exists
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "file", ext);
    const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || "file";
    const stamp = Date.now().toString(36);
    cb(null, `${safeBase}_${stamp}${ext}`);
  },
});

export const uploadMany = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_MB * 1024 * 1024 },
}).array("files");

export const uploadOne = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_MB * 1024 * 1024 },
}).single("file");
