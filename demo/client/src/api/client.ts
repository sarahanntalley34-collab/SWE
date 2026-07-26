import type { LoginResponse, Event } from '../types';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
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
