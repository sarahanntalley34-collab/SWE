import type {
  LoginResponse,
  Event,
  MetricsOverview,
  UsersResponse,
  Settings,
  Plan,
  UserStatus,
} from '../types';
// The SPA is served at /demo/ through the site's reverse proxy, so API calls
// must include the /demo prefix to reach the demo backend.
const BASE = '/demo/api';
function getToken(): string | null {
  return localStorage.getItem('token');
}
async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error || body?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}
export async function getMe(): Promise<{ user: LoginResponse['user'] }> {
  const token = getToken();
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}
export async function getEvents(): Promise<{ events: Event[] }> {
  const token = getToken();
  const res = await fetch(`${BASE}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}
// ── SaaS metrics dashboard ─────────────────────────────────────────────────────
export async function getMetricsOverview(): Promise<MetricsOverview> {
  const res = await fetch(`${BASE}/metrics/overview`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
export interface UsersQuery {
  search?: string;
  plan?: Plan | '';
  status?: UserStatus | '';
  page?: number;
  limit?: number;
}
export async function getUsers(query: UsersQuery): Promise<UsersResponse> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.plan) params.set('plan', query.plan);
  if (query.status) params.set('status', query.status);
  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 20));
  const res = await fetch(`${BASE}/users?${params.toString()}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
export async function getSettings(): Promise<Settings> {
  const res = await fetch(`${BASE}/settings`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
export async function updateSettings(
  patch: Partial<Settings>,
): Promise<Settings> {
  const res = await fetch(`${BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
