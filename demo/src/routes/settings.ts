import { Hono } from "hono";

export type SettingsPlan = "Starter" | "Pro" | "Enterprise";

export interface Settings {
  company_name: string;
  email: string;
  plan: SettingsPlan;
  notifications_enabled: boolean;
}

// In-memory store — starts with defaults, updates persist for the session.
const defaultSettings: Settings = {
  company_name: "Acme Corp",
  email: "admin@acme.com",
  plan: "Pro",
  notifications_enabled: true,
};

let settings: Settings = { ...defaultSettings };

const settingsRouter = new Hono();

// GET /api/settings — current settings
settingsRouter.get("/", (c) => c.json(settings));

// PUT /api/settings — update one or more settings (partial updates supported)
settingsRouter.put("/", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return c.json({ error: "Request body must be a JSON object" }, 400);
  }

  const updates = body as Record<string, unknown>;
  const next: Settings = { ...settings };

  if ("company_name" in updates) {
    if (typeof updates.company_name !== "string" || !updates.company_name.trim()) {
      return c.json({ error: "company_name must be a non-empty string" }, 400);
    }
    next.company_name = updates.company_name.trim();
  }

  if ("email" in updates) {
    if (typeof updates.email !== "string" || !updates.email.trim()) {
      return c.json({ error: "email must be a non-empty string" }, 400);
    }
    next.email = updates.email.trim();
  }

  if ("plan" in updates) {
    if (
      updates.plan !== "Starter" &&
      updates.plan !== "Pro" &&
      updates.plan !== "Enterprise"
    ) {
      return c.json(
        { error: "plan must be one of: Starter, Pro, Enterprise" },
        400
      );
    }
    next.plan = updates.plan;
  }

  if ("notifications_enabled" in updates) {
    if (typeof updates.notifications_enabled !== "boolean") {
      return c.json({ error: "notifications_enabled must be a boolean" }, 400);
    }
    next.notifications_enabled = updates.notifications_enabled;
  }

  settings = next;
  return c.json(settings);
});

export default settingsRouter;
