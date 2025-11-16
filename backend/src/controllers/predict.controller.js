import fs from "fs";
import asyncHandler from "../utils/asyncHandler.js";
import {
  predictJSON,
  predictCSV,
  spectrogramPNG,
  spectrogramJSON,
} from "../services/fastapi.service.js";

const cleanupFiles = (files) => {
  for (const f of files || []) {
    if (f?.path) {
      fs.unlink(f.path, () => {});
    }
  }
};

export const predict = asyncHandler(async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "domain is required" });
  if (!req.files?.length) return res.status(400).json({ error: "no files" });
  try {
    const data = await predictJSON(domain, req.files);
    res.json(data);
  } finally {
    cleanupFiles(req.files);
  }
});

export const predictCsv = asyncHandler(async (req, res) => {
  const { domain } = req.body;
  try {
    const resp = await predictCSV(domain, req.files || []);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="phase45_results.csv"');
    resp.data.pipe(res);
  } finally {
    cleanupFiles(req.files);
  }
});

export const spectroPng = asyncHandler(async (req, res) => {
  const { domain } = req.body;
  try {
    const resp = await spectrogramPNG(domain, req.file);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'inline; filename="spectrogram.png"');
    resp.data.pipe(res);
  } finally {
    cleanupFiles([req.file]);
  }
});

export const spectroJson = asyncHandler(async (req, res) => {
  const { domain } = req.body;
  try {
    const data = await spectrogramJSON(domain, req.file);
    res.json(data);
  } finally {
    cleanupFiles([req.file]);
  }
});
