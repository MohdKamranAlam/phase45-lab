import { Router } from "express";
import { predict, predictCsv, predictFromS3Ctl } from "../controllers/predict.controller.js";
import { uploadMany } from "../middlewares/multer.js";

const r = Router();

const injectDomain = (req) => {
  if (!req.body) req.body = {};
  if (req.params?.domain) req.body.domain = String(req.params.domain).toLowerCase();
  if (req.body?.domain) req.body.domain = String(req.body.domain).toLowerCase();
};

// POST /api/predict/:domain -> forward to controller
r.post("/:domain", uploadMany, (req, res, next) => {
  injectDomain(req);
  return predict(req, res, next);
});

// POST /api/predict/:domain/csv -> controller
r.post("/:domain/csv", uploadMany, (req, res, next) => {
  injectDomain(req);
  return predictCsv(req, res, next);
});

// POST /api/predict/:domain/from-s3 -> process S3 keys
r.post("/:domain/from-s3", (req, res, next) => predictFromS3Ctl(req, res, next));

// Legacy alias supporting body/query domain
r.post("/", uploadMany, (req, res, next) => {
  injectDomain(req);
  if (!req.body.domain) {
    return res.status(400).json({
      ok: false,
      error: "domain missing",
      hint: "Use POST /api/predict/:domain (audio|eeg|ligo|grace)",
    });
  }
  return predict(req, res, next);
});

export default r;
