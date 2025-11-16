import { Router } from "express";
import { spectroJson } from "../controllers/predict.controller.js";
import { uploadOne } from "../middlewares/multer.js";

const r = Router();

r.post("/:domain", uploadOne, (req, res, next) => {
  if (!req.file) return res.status(400).json({ ok: false, error: "file required" });
  if (req.params?.domain) req.body.domain = req.params.domain.toLowerCase();
  return spectroJson(req, res, next);
});

export default r;
