export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MetricPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  requests_per_sec?: number;
  active_users?: number;
  errors?: number;
}

export interface Event {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}
