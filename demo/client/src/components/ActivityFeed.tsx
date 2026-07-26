import { useState, useEffect } from 'react';
import type { Event } from '../types';
import { getEvents } from '../api/client';

export function ActivityFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = () => {
      getEvents()
        .then(({ events: fetched }) => {
          setEvents(fetched);
          setError(null);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load events');
        })
        .finally(() => setLoading(false));
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Activity Feed</h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-3 w-16 bg-gray-800 rounded" />
              <div className="h-3 flex-1 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Activity Feed</h3>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Activity Feed</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">No events yet.</p>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="flex items-start gap-3 text-sm border-b border-gray-800 pb-2 last:border-0">
              <span className="text-xs text-gray-500 font-mono whitespace-nowrap mt-0.5">
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                {evt.type}
              </span>
              <span className="text-gray-400">{evt.description}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
