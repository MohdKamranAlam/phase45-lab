import { Router } from "express";
import { presign } from "../controllers/predict.controller.js";

const r = Router();

r.post("/presign", (req, res, next) => presign(req, res, next));

export default r;