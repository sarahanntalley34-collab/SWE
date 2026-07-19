import { useEffect, useRef, useState, useCallback } from 'react';
import type { LiveMetrics, WsMessage } from '../types';

interface UseWebSocketOptions {
  token: string | null;
  maxPoints?: number;
}

interface UseWebSocketReturn {
  metrics: LiveMetrics[];
  latest: LiveMetrics | null;
  isConnected: boolean;
}

export function useWebSocket({ token, maxPoints = 30 }: UseWebSocketOptions): UseWebSocketReturn {
  const [metrics, setMetrics] = useState<LiveMetrics[]>([]);
  const [latest, setLatest] = useState<LiveMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const attemptRef = useRef(0);

  const connect = useCallback(() => {
    if (!token) return;

    // Determine WebSocket URL: use current host for prod, localhost:3001 for dev proxy
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      attemptRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        if (msg.type === 'metrics' && msg.data) {
          setLatest(msg.data);
          setMetrics((prev) => {
            const next = [...prev, msg.data];
            if (next.length > maxPoints) {
              return next.slice(next.length - maxPoints);
            }
            return next;
          });
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(1000 * Math.pow(2, attemptRef.current), 30000);
      attemptRef.current += 1;

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };

    ws.onerror = () => {
      // onclose will fire after this, triggering reconnect
    };
  }, [token, maxPoints]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { metrics, latest, isConnected };
}
