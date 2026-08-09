import { Hono } from "hono";
import { db } from "../db";
import { metrics } from "../db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const metricsRouter = new Hono();

// ── SaaS metrics overview (static seed data, no database) ─────────────────────

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
}

export interface MetricsOverview {
  mrr: number;
  mrr_growth: number;
  active_users: number;
  churn_rate: number;
  arpu: number;
  monthly_revenue: RevenuePoint[];
  user_growth: UserGrowthPoint[];
}

// 8 months of realistic SaaS data (Jan through Aug 2026). Static seed data —
// latest month's revenue is intentionally consistent with `mrr`.
const overview: MetricsOverview = {
  mrr: 28450,
  mrr_growth: 12.3,
  active_users: 1247,
  churn_rate: 2.1,
  arpu: 22.8,
  monthly_revenue: [
    { month: "Jan", revenue: 22000 },
    { month: "Feb", revenue: 22850 },
    { month: "Mar", revenue: 23700 },
    { month: "Apr", revenue: 24500 },
    { month: "May", revenue: 25300 },
    { month: "Jun", revenue: 26150 },
    { month: "Jul", revenue: 27250 },
    { month: "Aug", revenue: 28450 },
  ],
  user_growth: [
    { month: "Jan", users: 800 },
    { month: "Feb", users: 865 },
    { month: "Mar", users: 925 },
    { month: "Apr", users: 990 },
    { month: "May", users: 1050 },
    { month: "Jun", users: 1115 },
    { month: "Jul", users: 1180 },
    { month: "Aug", users: 1247 },
  ],
};

// GET /api/metrics/overview — SaaS headline metrics (public demo feed)
metricsRouter.get("/overview", (c) => c.json(overview));

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
