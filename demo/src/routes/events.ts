import { Hono } from "hono";
import { db } from "../db";
import { events } from "../db/schema";
import { desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const eventsRouter = new Hono();

// GET /api/events — recent events, paginated (?limit=, ?offset=)
eventsRouter.get("/", authMiddleware, async (c) => {
  const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "20"), 1), 100);
  const offset = Math.max(parseInt(c.req.query("offset") || "0"), 0);

  const rows = await db
    .select()
    .from(events)
    .orderBy(desc(events.timestamp))
    .limit(limit)
    .offset(offset);

  return c.json({ events: rows, limit, offset });
});

export default eventsRouter;
