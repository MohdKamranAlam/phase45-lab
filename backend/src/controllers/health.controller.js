import { healthFastAPI } from "../services/fastapi.service.js";

export const health = async (_req, res) => {
  const fastapi = await healthFastAPI();
  res.json({ node: "ok", fastapi });
};
