import asyncHandler from "../utils/asyncHandler.js";
import { psiSurface } from "../services/fastapi.service.js";

export const psiSurfaceCtrl = asyncHandler(async (req, res) => {
  const data = await psiSurface(req.body || {});
  res.json(data);
});



// hey this is surface controller backend node