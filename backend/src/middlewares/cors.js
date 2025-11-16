import cors from "cors";
import { env } from "../config/index.js";

export default cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/postman
    if (env.ALLOWED_ORIGINS.length === 0) return cb(null, true); // dev: all
    return cb(null, env.ALLOWED_ORIGINS.includes(origin));
  },
  credentials: true
});
