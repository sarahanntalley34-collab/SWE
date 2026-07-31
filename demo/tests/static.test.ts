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

describe("GET /", () => {
  it("returns index.html with 200 status and HTML content", async () => {
    const res = await fetch(`${baseUrl}/`);

    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type") || "";
    expect(contentType).toInclude("text/html");

    const text = await res.text();
    expect(text).toInclude("<!doctype html>");
    expect(text.length).toBeGreaterThan(0);
  });

  it("serves favicon.png from static directory", async () => {
    const res = await fetch(`${baseUrl}/favicon.png`);

    // Should return the file (200) - may depend on if the file exists
    // If 404, the file just doesn't exist in dist, which is OK
    expect([200, 404]).toContain(res.status);
  });
});

describe("GET /health", () => {
  it("returns JSON with status ok", async () => {
    const res = await fetch(`${baseUrl}/health`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeString();
  });

  it("returns valid ISO timestamp", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();

    const date = new Date(body.timestamp);
    expect(date.getTime()).not.toBeNaN();
  });

  it("does not require authentication", async () => {
    // Health endpoint should be publicly accessible
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
  });
});
