import express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import corsMw from "./middlewares/cors.js";
import errorMw from "./middlewares/error.js";

const app = express();
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(corsMw);

// api routes
app.use("/api", routes);

// health root
app.get("/", (_req, res) => res.json({ ok: true, service: "phase45-gateway" }));

// central error handler
app.use(errorMw);

export default app;
