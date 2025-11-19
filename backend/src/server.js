import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import router from "./routes/index.js";

const app = express();

// CORS FIRST
const ALLOWED = (process.env.ALLOWED_ORIGINS || "http://127.0.0.1:5173,http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // tools/curl
    if (ALLOWED.includes("*")) return cb(null, true); // wildcard support via env
    if (ALLOWED.includes(origin)) return cb(null, true);
    return cb(new Error("CORS"));
  },
  credentials: true,
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","Accept"],
}));
app.options("*", cors());

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ no template literals, no wildcards, no curly braces:
app.use("/api", router);

app.get("/", (_req, res) => res.json({ ok: true, service: "phase45-gateway" }));

// error handler (so CORS headers still go out)
app.use((err, _req, res, _next) => {
  console.error("Global Error Handler:", err);
  const status = err.status || 500;
  const message = err.message || "internal server error";
  
  // Handle Axios errors from FastAPI service
  if (err.isAxiosError) {
    const upstreamStatus = err.response?.status || 502;
    const upstreamData = err.response?.data || "Upstream error";
    console.error("Upstream FastAPI Error:", upstreamData);
    return res.status(upstreamStatus).json({ 
      ok: false, 
      error: "FastAPI service error", 
      details: upstreamData 
    });
  }

  res.status(status).json({ ok:false, error: message });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Node gateway -> http://127.0.0.1:${PORT}`);
  console.log(`CORS allowed origins: ${ALLOWED.length ? ALLOWED.join(", ") : "(none -> default)"}`);
});
