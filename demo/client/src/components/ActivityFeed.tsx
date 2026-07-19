import { useEffect, useState, useCallback } from 'react';
import type { EventItem } from '../types';
import { getEvents } from '../api/client';

function timeAgo(ts: string): string {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function eventIcon(type: string): string {
  switch (type) {
    case 'deployment':
      return '🚀';
    case 'alert':
      return '⚠️';
    case 'scaling':
      return '📈';
    case 'incident':
      return '🔴';
    case 'info':
      return 'ℹ️';
    default:
      return '📋';
  }
}

export function ActivityFeed() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await getEvents(20);
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    // Poll every 30s
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Activity Feed</h3>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-6 h-6 rounded bg-gray-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-800 rounded w-3/4" />
                <div className="h-2.5 bg-gray-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Activity Feed</h3>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Activity Feed</h3>
        <p className="text-sm text-gray-500">No recent events</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Activity Feed</h3>
      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <span className="text-lg mt-0.5 flex-shrink-0">
              {eventIcon(event.type)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-200 truncate">{event.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">{timeAgo(event.timestamp)}</p>
            </div>
            <span className="text-xs text-gray-600 uppercase font-medium flex-shrink-0 mt-1">
              {event.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
