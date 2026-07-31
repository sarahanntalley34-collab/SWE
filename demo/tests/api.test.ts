import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { startTestServer, getBaseUrl, login, authHeader } from "./helpers";
import type { Server } from "bun";

let server: Server;
let baseUrl: string;
let adminToken: string;

beforeAll(async () => {
  server = startTestServer();
  baseUrl = getBaseUrl(server);
  const result = await login(baseUrl, "admin@demo.com", "password123");
  adminToken = result.token;
});

afterAll(() => {
  server.stop();
});

describe("GET /api/metrics", () => {
  it("returns metrics array with valid token", async () => {
    const res = await fetch(`${baseUrl}/api/metrics`, {
      headers: authHeader(adminToken),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.metrics).toBeArray();
  });

  it("returns 401 without token", async () => {
    const res = await fetch(`${baseUrl}/api/metrics`);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeString();
  });

  it("returns 401 with invalid token", async () => {
    const res = await fetch(`${baseUrl}/api/metrics`, {
      headers: authHeader("not-a-valid-token"),
    });

    expect(res.status).toBe(401);
  });

  it("filters metrics by category query parameter", async () => {
    const res = await fetch(`${baseUrl}/api/metrics?category=cpu`, {
      headers: authHeader(adminToken),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.metrics).toBeArray();
    // All returned metrics should have category "cpu"
    for (const m of body.metrics) {
      expect(m.category).toBe("cpu");
    }
  });
});

describe("GET /api/metrics/live", () => {
  it("returns live metrics snapshot with valid token", async () => {
    const res = await fetch(`${baseUrl}/api/metrics/live`, {
      headers: authHeader(adminToken),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.metrics).toBeArray();
    expect(body.snapshot).toBeString();
  });

  it("returns 401 without token", async () => {
    const res = await fetch(`${baseUrl}/api/metrics/live`);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/events", () => {
  it("returns events array with valid token", async () => {
    const res = await fetch(`${baseUrl}/api/events`, {
      headers: authHeader(adminToken),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.events).toBeArray();
    expect(body.limit).toBeNumber();
    expect(body.offset).toBeNumber();
  });

  it("returns 401 without token", async () => {
    const res = await fetch(`${baseUrl}/api/events`);

    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await fetch(`${baseUrl}/api/events`, {
      headers: authHeader("bad-token"),
    });

    expect(res.status).toBe(401);
  });

  it("respects pagination query parameters", async () => {
    const res = await fetch(`${baseUrl}/api/events?limit=5&offset=0`, {
      headers: authHeader(adminToken),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.events).toBeArray();
    expect(body.limit).toBe(5);
    expect(body.offset).toBe(0);
    expect(body.events.length).toBeLessThanOrEqual(5);
  });

  it("clamps limit to 100 maximum", async () => {
    const res = await fetch(`${baseUrl}/api/events?limit=999`, {
      headers: authHeader(adminToken),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.limit).toBe(100);
  });
});
