import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { startTestServer, getBaseUrl, login, authHeader } from "./helpers";
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

describe("POST /api/auth/login", () => {
  it("returns JWT token for valid admin credentials", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@demo.com", password: "password123" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeString();
    expect(body.token.length).toBeGreaterThan(0);
    expect(body.user).toBeObject();
    expect(body.user.email).toBe("admin@demo.com");
    expect(body.user.role).toBe("admin");
  });

  it("returns JWT token for valid viewer credentials", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "viewer@demo.com", password: "password123" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeString();
    expect(body.user.email).toBe("viewer@demo.com");
    expect(body.user.role).toBe("viewer");
  });

  it("returns 401 for invalid password", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@demo.com", password: "wrongpassword" }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeString();
  });

  it("returns 401 for nonexistent user", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent@demo.com", password: "password123" }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeString();
  });

  it("returns 400 when email is missing", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "password123" }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns user info with valid admin token", async () => {
    const { token } = await login(baseUrl, "admin@demo.com", "password123");
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeObject();
    expect(body.user.email).toBe("admin@demo.com");
    expect(body.user.role).toBe("admin");
  });

  it("returns user info with valid viewer token", async () => {
    const { token } = await login(baseUrl, "viewer@demo.com", "password123");
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe("viewer@demo.com");
    expect(body.user.role).toBe("viewer");
  });

  it("returns 401 with no token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeString();
  });

  it("returns 401 with invalid token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: authHeader("invalid-token-that-is-not-a-valid-jwt"),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeString();
  });

  it("returns 401 with expired token", async () => {
    // Create an already-expired JWT manually (signed with the same secret)
    const jwt = await import("jsonwebtoken");
    const expiredToken = jwt.default.sign(
      { userId: 1, email: "admin@demo.com", role: "admin" },
      process.env.JWT_SECRET || "retro-demo-secret-change-in-production",
      { expiresIn: "0s" }
    );

    // Wait a tiny bit to ensure it's expired
    await new Promise((r) => setTimeout(r, 50));

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: authHeader(expiredToken),
    });

    expect(res.status).toBe(401);
  });

  it("returns 401 with malformed Authorization header", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: "NotBearer something" },
    });

    expect(res.status).toBe(401);
  });
});
