import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { startTestServer, getBaseUrl } from "./helpers";
import type { Server } from "bun";

let server: Server;
let baseUrl: string;

beforeAll(() => {
  server = startTestServer();
  baseUrl = getBaseUrl(server);
});

afterAll(() => {
  server.stop();
});

describe("GET /api/metrics/overview", () => {
  it("returns headline SaaS metrics with 8 months of data", async () => {
    const res = await fetch(`${baseUrl}/api/metrics/overview`);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.mrr).toBe(28450);
    expect(body.mrr_growth).toBe(12.3);
    expect(body.active_users).toBe(1247);
    expect(body.churn_rate).toBe(2.1);
    expect(body.arpu).toBe(22.8);

    expect(body.monthly_revenue).toHaveLength(8);
    expect(body.monthly_revenue[0]).toEqual({ month: "Jan", revenue: 22000 });
    expect(body.monthly_revenue[7]).toEqual({ month: "Aug", revenue: 28450 });

    expect(body.user_growth).toHaveLength(8);
    expect(body.user_growth[0]).toEqual({ month: "Jan", users: 800 });
    expect(body.user_growth[7]).toEqual({ month: "Aug", users: 1247 });
  });
});

describe("GET /api/users", () => {
  it("returns paginated users with defaults", async () => {
    const res = await fetch(`${baseUrl}/api/users`);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.users).toHaveLength(20); // default limit
    expect(body.total).toBe(30);
    expect(body.page).toBe(1);
    expect(body.totalPages).toBe(2);
    expect(body.users[0]).toMatchObject({
      id: "usr_001",
      name: "Jane Cooper",
      plan: "Pro",
      status: "active",
      mrr: 99,
    });
  });

  it("supports page parameter", async () => {
    const res = await fetch(`${baseUrl}/api/users?page=2`);
    const body = await res.json();
    expect(body.users).toHaveLength(10);
    expect(body.page).toBe(2);
    expect(body.users[0].id).toBe("usr_021");
  });

  it("searches by name and email (case-insensitive)", async () => {
    const byName = await (await fetch(`${baseUrl}/api/users?search=jane`)).json();
    expect(byName.total).toBeGreaterThanOrEqual(1);
    expect(byName.users.every((u: { name: string; email: string }) => u.name.toLowerCase().includes("jane") || u.email.toLowerCase().includes("jane"))).toBe(true);

    const byEmail = await (await fetch(`${baseUrl}/api/users?search=ACME`)).json();
    expect(byEmail.users.every((u: { email: string }) => u.email.includes("acme"))).toBe(true);
  });

  it("filters by plan and status", async () => {
    const pro = await (await fetch(`${baseUrl}/api/users?plan=pro`)).json();
    expect(pro.users.every((u: { plan: string }) => u.plan === "Pro")).toBe(true);

    const churned = await (await fetch(`${baseUrl}/api/users?status=churned`)).json();
    expect(churned.users.every((u: { status: string }) => u.status === "churned")).toBe(true);
    expect(churned.total).toBe(4);
  });

  it("combines filters with search", async () => {
    const res = await fetch(`${baseUrl}/api/users?plan=starter&status=active`);
    const body = await res.json();
    expect(body.users.every((u: { plan: string; status: string }) => u.plan === "Starter" && u.status === "active")).toBe(true);
  });
});

describe("GET /api/settings", () => {
  it("returns default settings", async () => {
    const res = await fetch(`${baseUrl}/api/settings`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      company_name: "Acme Corp",
      email: "admin@acme.com",
      plan: "Pro",
      notifications_enabled: true,
    });
  });
});

describe("PUT /api/settings", () => {
  it("updates settings (partial) and persists", async () => {
    const res = await fetch(`${baseUrl}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name: "Retro Engineering", notifications_enabled: false }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.company_name).toBe("Retro Engineering");
    expect(body.notifications_enabled).toBe(false);
    expect(body.email).toBe("admin@acme.com"); // untouched field preserved
  });

  it("rejects invalid plan", async () => {
    const res = await fetch(`${baseUrl}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "Free" }),
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeString();
  });

  it("rejects invalid body types", async () => {
    const res = await fetch(`${baseUrl}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications_enabled: "yes" }),
    });
    expect(res.status).toBe(400);
  });
});
