import { useState, useEffect, useRef, useCallback } from 'react';
import type { MetricPoint } from '../types';

const MAX_POINTS = 30;

export function useWebSocket(token: string | null) {
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const backoffRef = useRef(1000);

  const connect = useCallback(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      backoffRef.current = 1000;
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'metrics' && msg.data) {
          setMetrics((prev) => {
            const next = [...prev, msg.data as MetricPoint];
            if (next.length > MAX_POINTS) return next.slice(next.length - MAX_POINTS);
            return next;
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      const delay = backoffRef.current;
      backoffRef.current = Math.min(delay * 2, 30_000);
      reconnectTimeout.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { metrics, connected };
}
