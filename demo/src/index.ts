import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth";
import metricsRoutes from "./routes/metrics";
import eventsRoutes from "./routes/events";
import { handleWebSocketOpen, handleWebSocketClose } from "./ws";

const app = new Hono();

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

// ── API routes ────────────────────────────────────────────────────────────────

app.route("/api/auth", authRoutes);
app.route("/api/metrics", metricsRoutes);
app.route("/api/events", eventsRoutes);

// ── WebSocket server ──────────────────────────────────────────────────────────

const server = Bun.serve<string>({
  port: 3001,
  fetch(req, srv) {
    // Handle WebSocket upgrade: extract token from URL and pass via data
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      const token = url.searchParams.get("token") || "";
      if (srv.upgrade(req, { data: token })) {
        return; // upgraded — response handled by Bun
      }
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    // Fall through to Hono for all other routes
    return app.fetch(req);
  },
  websocket: {
    open(ws) {
      handleWebSocketOpen(ws);
    },
    message(_ws, _message) {
      // No client-to-server messages needed for this demo
    },
    close(ws) {
      handleWebSocketClose(ws);
    },
  },
});

console.log(`🚀 Shipwright Metrics API running on http://localhost:${server.port}`);
console.log(`   WebSocket: ws://localhost:${server.port}/ws?token=<jwt>`);
console.log(`   Health:    http://localhost:${server.port}/health`);
