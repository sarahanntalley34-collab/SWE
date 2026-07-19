import { Hono } from "hono";
import { db } from "../db";
import { metrics } from "../db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const metricsRouter = new Hono();

// GET /api/metrics — recent metrics (last 24h), optionally filtered by ?category=
metricsRouter.get("/", authMiddleware, async (c) => {
  const category = c.req.query("category");

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  let query = db
    .select()
    .from(metrics)
    .where(sql`${metrics.timestamp} >= ${twentyFourHoursAgo.toISOString()}`)
    .orderBy(desc(metrics.timestamp));

  if (category) {
    query = db
      .select()
      .from(metrics)
      .where(
        sql`${metrics.timestamp} >= ${twentyFourHoursAgo.toISOString()} AND ${metrics.category} = ${category}`
      )
      .orderBy(desc(metrics.timestamp));
  }

  const rows = await query;
  return c.json({ metrics: rows });
});

// GET /api/metrics/live — latest metric snapshot
metricsRouter.get("/live", authMiddleware, async (c) => {
  // Get the most recent timestamp
  const [latest] = await db
    .select({ timestamp: metrics.timestamp })
    .from(metrics)
    .orderBy(desc(metrics.timestamp))
    .limit(1);

  if (!latest) {
    return c.json({ metrics: [] });
  }

  // Get all metrics with that latest timestamp
  const rows = await db
    .select()
    .from(metrics)
    .where(eq(metrics.timestamp, latest.timestamp))
    .orderBy(metrics.category);

  return c.json({ metrics: rows, snapshot: latest.timestamp });
});

export default metricsRouter;
