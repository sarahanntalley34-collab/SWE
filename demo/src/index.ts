import { join } from "node:path";
import { existsSync } from "node:fs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as Sentry from "@sentry/bun";
import authRoutes from "./routes/auth";
import metricsRoutes from "./routes/metrics";
import eventsRoutes from "./routes/events";
import healthDashboardRoutes from "./routes/health-dashboard";
import errorLogRoutes from "./routes/error-log";
import usersRoutes from "./routes/users";
import settingsRoutes from "./routes/settings";
import { handleWebSocketOpen, handleWebSocketClose } from "./ws";
import { addRealtimeClient, removeRealtimeClient } from "./realtime";

// ── Sentry ─────────────────────────────────────────────────────────────────────

Sentry.init({
  dsn: "https://24908d5fb6f273b1f7a0aa7038387ce4@o4511724818464768.ingest.us.sentry.io/4511724822790144",
  environment: process.env.NODE_ENV === "production" ? "production" : "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  integrations: [Sentry.bunServerIntegration()],
});

const app = new Hono();

// Export for testing
export { app, serveStatic };

// ── CORS ──────────────────────────────────────────────────────────────────────

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
  })
);

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// ── Sentry test endpoint (non-production only) ─────────────────────────────────

if (process.env.NODE_ENV !== "production") {
  app.get("/api/test-sentry", () => {
    throw new Error("Sentry test error — verify this appears in the Sentry dashboard");
  });
}

// ── API routes ────────────────────────────────────────────────────────────────

app.route("/api/auth", authRoutes);
app.route("/api/metrics", metricsRoutes);
app.route("/api/events", eventsRoutes);
app.route("/api/health-dashboard", healthDashboardRoutes);
app.route("/api/error-log", errorLogRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/settings", settingsRoutes);

// ── Static file serving ──────────────────────────────────────────────────────

const distPath = join(import.meta.dir, "..", "client", "dist");

function serveStatic(pathname: string): Response {
  // Strip /demo prefix if present (for proxied requests)
  let filePath = pathname;
  if (filePath.startsWith("/demo/")) {
    filePath = filePath.slice(5); // remove "/demo" prefix, keep leading "/"
  } else if (filePath === "/demo") {
    filePath = "/";
  }

  // Resolve to a file path under dist/
  const resolved = filePath === "/" || filePath === ""
    ? join(distPath, "index.html")
    : join(distPath, filePath.replace(/^\//, ""));

  // SPA fallback: if file doesn't exist, serve index.html
  const indexPath = join(distPath, "index.html");
  if (existsSync(resolved)) {
    return new Response(Bun.file(resolved));
  }
  return new Response(Bun.file(indexPath));
}

// ── WebSocket server ──────────────────────────────────────────────────────────

// Only start the server when this module is the entry point (not when imported for testing)
if (import.meta.main) {
  const server = Bun.serve<string>({
    port: 3001,
    fetch(req, srv) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // Dedicated dashboard feeds are intentionally public demo streams.
      if (pathname === "/ws/health" || pathname === "/ws/errors") {
        const kind = pathname === "/ws/health" ? "health" : "errors";
        if (srv.upgrade(req, { data: kind })) return;
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      // Handle existing authenticated metrics upgrade.
      if (pathname === "/ws") {
        const token = url.searchParams.get("token") || "";
        if (srv.upgrade(req, { data: token })) return;
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      // Serve static files for GET requests outside API/health/ws paths
      if (
        req.method === "GET" &&
        !pathname.startsWith("/api/") &&
        pathname !== "/health" &&
        !pathname.startsWith("/ws")
      ) {
        return serveStatic(pathname);
      }

      // Fall through to Hono for API, health, and other routes
      return app.fetch(req);
    },
    websocket: {
      open(ws) {
        if (ws.data === "health" || ws.data === "errors") {
          addRealtimeClient(ws, ws.data);
          return;
        }
        handleWebSocketOpen(ws);
      },
      message(_ws, _message) {
        // No client-to-server messages needed for this demo
      },
      close(ws) {
        removeRealtimeClient(ws);
        handleWebSocketClose(ws);
      },
    },
  });

  console.log(`🚀 Retro Engineering API running on http://localhost:${server.port}`);
  console.log(`   WebSocket: ws://localhost:${server.port}/ws?token=<jwt>`);
  console.log(`   Health:    http://localhost:${server.port}/health`);
}
