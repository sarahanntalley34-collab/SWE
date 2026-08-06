import { useEffect, useState } from 'react';
import type { SimulatedError } from '../types/realtime';

const colors = { error: 'bg-red-500/15 text-red-400', warn: 'bg-yellow-500/15 text-yellow-300', info: 'bg-blue-500/15 text-blue-400' };
export function ErrorLog() {
  const [items, setItems] = useState<SimulatedError[]>([]);
  useEffect(() => {
    fetch('/demo/api/error-log?limit=5').then((r) => r.json()).then((data: { errors: SimulatedError[] }) => setItems(data.errors)).catch(() => {});
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/demo/ws/errors`);
    ws.onmessage = (event) => { try { const item = JSON.parse(event.data) as SimulatedError; setItems((prev) => [item, ...prev].slice(0, 5)); } catch { /* ignore malformed feed */ } };
    return () => ws.close();
  }, []);
  return <section className="rounded-xl border border-gray-800 bg-gray-900 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Error Log</h2><span className="text-xs text-gray-500">Live</span></div><div className="space-y-3">{items.map((item) => <div key={item.id} className="flex items-start gap-3 border-b border-gray-800 pb-3 last:border-0 last:pb-0"><span className={`mt-0.5 rounded px-2 py-0.5 text-xs font-medium ${colors[item.level]}`}>{item.level}</span><div className="min-w-0 flex-1"><p className="truncate text-sm text-gray-200">{item.message}</p><p className="mt-1 text-xs text-gray-500">{item.service} · {new Date(item.timestamp).toLocaleTimeString()}</p></div></div>)}</div></section>;
}
