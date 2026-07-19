export interface User {
  id: number;
  email: string;
  role: 'admin' | 'viewer';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LiveMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  requests_per_sec?: number;
  active_users?: number;
  errors?: number;
}

export interface WsMessage {
  type: 'metrics';
  data: LiveMetrics;
}

export interface EventItem {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}
