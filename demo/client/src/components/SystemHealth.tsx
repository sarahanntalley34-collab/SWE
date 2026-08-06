import { useEffect, useState } from 'react';
import type { HealthSnapshot } from '../types/realtime';

export function SystemHealth() {
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/demo/ws/health`);
    ws.onmessage = (event) => { try { setHealth(JSON.parse(event.data) as HealthSnapshot); } catch { /* ignore malformed feed */ } };
    return () => ws.close();
  }, []);
  return <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
    <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">System Health</h2><span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">{health?.status ?? 'connecting'}</span></div>
    <div className="grid grid-cols-2 gap-4 text-sm"><Metric label="Uptime" value={`${health?.uptime_seconds ?? '—'}s`} /><Metric label="Active connections" value={health?.active_websockets ?? '—'} /><Metric label="Memory" value={`${health?.memory_mb ?? '—'} MB`} /><Metric label="Avg response" value={`${health?.avg_response_ms ?? '—'} ms`} /></div>
  </section>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div><p className="text-gray-500">{label}</p><p className="mt-1 text-xl font-semibold text-gray-100">{value}</p></div>; }
