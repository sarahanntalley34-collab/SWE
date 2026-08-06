import { Hono } from "hono";
import { getErrors } from "../realtime";

const errorLogRouter = new Hono();

errorLogRouter.get("/", (c) => {
  const page = Math.max(1, Number.parseInt(c.req.query("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(c.req.query("limit") || "10", 10) || 10));
  return c.json(getErrors(page, limit));
});

export default errorLogRouter;
