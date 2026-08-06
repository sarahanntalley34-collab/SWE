import { Hono } from "hono";
import { getHealthSnapshot } from "../realtime";

const healthDashboardRouter = new Hono();

healthDashboardRouter.get("/", (c) => c.json(getHealthSnapshot()));

export default healthDashboardRouter;
