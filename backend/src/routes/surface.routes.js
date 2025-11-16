import { Router } from "express";
import axios from "axios";
const r = Router();

r.get("/psi-surface", async (req, res, next) => {
  try {
    const base = process.env.FASTAPI_BASE || "http://127.0.0.1:8001";
    const url = new URL(`${base}/api/v1/psi-surface`);
    for (const k of ["gmin","gmax","n"]) if (req.query[k]) url.searchParams.set(k, req.query[k]);
    const { data } = await axios.get(url.toString());
    res.json(data);
  } catch (e) { next(e); }
});

export default r;
