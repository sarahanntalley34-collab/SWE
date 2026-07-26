import type { ServerWebSocket } from "bun";
import { verifyToken, type JwtPayload } from "../middleware/auth";

interface LiveMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  requests_per_sec: number;
  active_users: number;
  errors: number;
}

// Baselines for simulated metrics
const BASELINES = {
  cpu: 48.0,
  memory: 68.0,
  requests_per_sec: 150,
  active_users: 820,
  errors: 2,
};

// Fluctuation ranges
const FLUCTUATIONS = {
  cpu: 15,
  memory: 10,
  requests_per_sec: 40,
  active_users: 60,
  errors: 5,
};

/**
 * Generate realistic-ish random metric values that fluctuate around baselines.
 */
function generateMetrics(): LiveMetrics {
  const fluctuate = (base: number, range: number): number => {
    const change = (Math.random() - 0.5) * 2 * range;
    const raw = base + change;
    return Math.round(raw * 10) / 10; // 1 decimal place
  };

  return {
    timestamp: new Date().toISOString(),
    cpu: fluctuate(BASELINES.cpu, FLUCTUATIONS.cpu),
    memory: fluctuate(BASELINES.memory, FLUCTUATIONS.memory),
    requests_per_sec: Math.round(fluctuate(BASELINES.requests_per_sec, FLUCTUATIONS.requests_per_sec)),
    active_users: Math.round(fluctuate(BASELINES.active_users, FLUCTUATIONS.active_users)),
    errors: Math.max(0, Math.round(fluctuate(BASELINES.errors, FLUCTUATIONS.errors))),
  };
}

/**
 * Admin gets all fields; viewers get a reduced set (cpu, memory only).
 */
function filterMetrics(metrics: LiveMetrics, role: "admin" | "viewer") {
  if (role === "admin") return metrics;
  return {
    timestamp: metrics.timestamp,
    cpu: metrics.cpu,
    memory: metrics.memory,
  };
}

// Track per-connection intervals so we can clear on disconnect
const intervals = new WeakMap<ServerWebSocket<string>, ReturnType<typeof setInterval>>();

/**
 * Handle a new WebSocket connection. Verifies the JWT from the ?token= query param.
 * Returns the user payload if authenticated, or null if auth failed (caller should close).
 */
export function handleWebSocketOpen(ws: ServerWebSocket<string>): JwtPayload | null {
  // Token was passed via server.upgrade() data during the upgrade
  const token = ws.data;

  if (!token) {
    ws.send(JSON.stringify({ error: "Missing token query parameter" }));
    ws.close(4001, "Missing token");
    return null;
  }

  const user = verifyToken(token);
  if (!user) {
    ws.send(JSON.stringify({ error: "Invalid or expired token" }));
    ws.close(4002, "Invalid token");
    return null;
  }

  console.log(`WebSocket connected: ${user.email} (${user.role})`);

  // Send an initial metrics payload immediately
  const initial = generateMetrics();
  ws.send(JSON.stringify({ type: "metrics", data: filterMetrics(initial, user.role) }));

  // Then every 3-5 seconds
  const intervalId = setInterval(() => {
    const metrics = generateMetrics();
    ws.send(JSON.stringify({ type: "metrics", data: filterMetrics(metrics, user.role) }));
  }, 3000 + Math.random() * 2000);

  intervals.set(ws, intervalId);

  return user;
}

/**
 * Clean up when a WebSocket connection closes.
 */
export function handleWebSocketClose(ws: ServerWebSocket<string>) {
  const intervalId = intervals.get(ws);
  if (intervalId) {
    clearInterval(intervalId);
    intervals.delete(ws);
  }
}
