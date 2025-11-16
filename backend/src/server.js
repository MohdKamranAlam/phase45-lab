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
app.use(express.json());

// ✅ no template literals, no wildcards, no curly braces:
app.use("/api", router);

app.get("/", (_req, res) => res.json({ ok: true, service: "phase45-gateway" }));

// error handler (so CORS headers still go out)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok:false, error: err.message || "internal" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Node gateway -> http://127.0.0.1:${PORT}`);
  console.log(`CORS allowed origins: ${ALLOWED.length ? ALLOWED.join(", ") : "(none -> default)"}`);
});
