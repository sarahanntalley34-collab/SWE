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
// ── SaaS metrics dashboard types ───────────────────────────────────────────────
export type Plan = 'Starter' | 'Pro' | 'Enterprise';
export type UserStatus = 'active' | 'trialing' | 'churned';

export interface RevenuePoint {
  month: string;
  revenue: number;
}
export interface UserGrowthPoint {
  month: string;
  users: number;
}
export interface MetricsOverview {
  mrr: number;
  mrr_growth: number;
  active_users: number;
  churn_rate: number;
  arpu: number;
  monthly_revenue: RevenuePoint[];
  user_growth: UserGrowthPoint[];
}
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  status: UserStatus;
  joined: string; // ISO date (YYYY-MM-DD)
  mrr: number;
}
export interface UsersResponse {
  users: DashboardUser[];
  total: number;
  page: number;
  totalPages: number;
}
export interface Settings {
  company_name: string;
  email: string;
  plan: Plan;
  notifications_enabled: boolean;
}
