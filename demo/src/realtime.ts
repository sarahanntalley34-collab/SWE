import type { ServerWebSocket } from "bun";

export type HealthSnapshot = {
  status: "healthy";
  uptime_seconds: number;
  active_websockets: number;
  avg_response_ms: number;
  memory_mb: number;
  cpu_percent: number;
};

export type SimulatedError = {
  id: string;
  timestamp: string;
  level: "error" | "warn" | "info";
  message: string;
  service: string;
};

const startedAt = Date.now();
let health: HealthSnapshot = {
  status: "healthy",
  uptime_seconds: 0,
  active_websockets: 0,
  avg_response_ms: 42,
  memory_mb: 128,
  cpu_percent: 12,
};

const messages = [
  ["error", "Database connection timeout", "auth-api"],
  ["warn", "Elevated login latency detected", "auth-api"],
  ["info", "Payment reconciliation completed", "payment-service"],
  ["error", "Failed to process webhook", "payment-service"],
  ["warn", "User database connection pool near limit", "user-db"],
  ["info", "Cache refresh completed", "user-db"],
] as const;

export const errors: SimulatedError[] = Array.from({ length: 25 }, (_, index) => {
  const [level, message, service] = messages[index % messages.length];
  return { id: `err_${String(index + 1).padStart(3, "0")}`, timestamp: new Date(Date.now() - (24 - index) * 60 * 60 * 1000).toISOString(), level, message, service };
});

export function getHealthSnapshot(): HealthSnapshot {
  return { ...health };
}

export function getErrors(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { errors: errors.slice(offset, offset + limit), total: errors.length, page };
}

const healthClients = new Set<ServerWebSocket<string>>();
const errorClients = new Set<ServerWebSocket<string>>();

const randomError = (): SimulatedError => {
  const [level, message, service] = messages[Math.floor(Math.random() * messages.length)];
  return { id: `err_${String(errors.length + 1).padStart(3, "0")}`, timestamp: new Date().toISOString(), level, message, service };
};

export function addRealtimeClient(ws: ServerWebSocket<string>, kind: "health" | "errors") {
  const clients = kind === "health" ? healthClients : errorClients;
  clients.add(ws);
  if (kind === "health") ws.send(JSON.stringify(getHealthSnapshot()));
}

export function removeRealtimeClient(ws: ServerWebSocket<string>) {
  healthClients.delete(ws);
  errorClients.delete(ws);
}

setInterval(() => {
  health = {
    ...health,
    uptime_seconds: Math.floor((Date.now() - startedAt) / 1000),
    active_websockets: healthClients.size + errorClients.size,
    avg_response_ms: Math.max(15, Math.round(42 + (Math.random() - 0.5) * 12)),
    memory_mb: Math.round(128 + (Math.random() - 0.5) * 16),
    cpu_percent: Math.round(Math.max(1, 12 + (Math.random() - 0.5) * 14)),
  };
}, 1000);

setInterval(() => {
  const entry = randomError();
  errors.unshift(entry);
  for (const ws of errorClients) ws.send(JSON.stringify(entry));
}, 5000 + Math.random() * 5000);

setInterval(() => {
  const payload = JSON.stringify(getHealthSnapshot());
  for (const ws of healthClients) ws.send(payload);
}, 2000);
