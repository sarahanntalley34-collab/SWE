export type HealthSnapshot = {
  status: 'healthy';
  uptime_seconds: number;
  active_websockets: number;
  avg_response_ms: number;
  memory_mb: number;
  cpu_percent: number;
};

export type SimulatedError = {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  service: string;
};
