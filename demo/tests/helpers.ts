import { join } from "node:path";
import { app, serveStatic } from "../src/index";
import type { Server } from "bun";

/**
 * Start a test server on a random port (port: 0) that handles:
 * - Static file serving for non-API/non-health paths
 * - Hono app routes (/health, /api/*)
 *
 * Returns the server instance so you can get its URL and stop it in afterAll.
 */
export function startTestServer(): Server {
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // Serve static files for GET requests outside API/health paths
      if (
        req.method === "GET" &&
        !pathname.startsWith("/api/") &&
        pathname !== "/health"
      ) {
        return serveStatic(pathname);
      }

      // Fall through to Hono for API, health, and other routes
      return app.fetch(req);
    },
  });

  return server;
}

/**
 * Get the base URL for a test server instance.
 */
export function getBaseUrl(server: Server): string {
  return `http://localhost:${server.port}`;
}

/**
 * Login helper: call POST /api/auth/login and return the response JSON.
 */
export async function login(
  baseUrl: string,
  email: string,
  password: string
): Promise<{ token: string; user: Record<string, unknown> }> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

/**
 * Create an Authorization header value for a given token.
 */
export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
