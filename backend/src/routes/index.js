import { Router } from "express";
import healthRoutes from "./health.routes.js";
import predictRoutes from "./predict.routes.js";
import surfaceRoutes from "./surface.routes.js";
import spectroRoutes from "./spectro.routes.js";   // <-- NEW
import uploadsRoutes from "./uploads.routes.js";

const r = Router();
r.use("/health", healthRoutes);
r.use("/predict", predictRoutes);
r.use("/surface", surfaceRoutes);
r.use("/spectrogram_json", spectroRoutes);        // <-- NEW
r.use("/uploads", uploadsRoutes);

export default r;
