import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { MetricsChart } from '../components/MetricsChart';
import { ActivityFeed } from '../components/ActivityFeed';

export function DashboardPage() {
  const { user, token } = useAuth();
  const { metrics, connected } = useWebSocket(token);
  const isAdmin = user?.role === 'admin';
  const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  if (!latest) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header connected={connected} />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: isAdmin ? 4 : 2 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
            {isAdmin && <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header connected={connected} />

      <main className="p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="CPU" value={latest.cpu} unit="%" />
          <MetricCard title="Memory" value={latest.memory} unit="%" />
          {isAdmin && (
            <>
              <MetricCard title="Requests/s" value={latest.requests_per_sec ?? 0} unit="req" />
              <MetricCard title="Active Users" value={latest.active_users ?? 0} />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricsChart
            data={metrics}
            lines={[
              { key: 'cpu', color: '#34d399', label: 'CPU %' },
              { key: 'memory', color: '#60a5fa', label: 'Memory %' },
            ]}
          />
          {isAdmin && (
            <MetricsChart
              data={metrics}
              lines={[
                { key: 'requests_per_sec' as const, color: '#f59e0b', label: 'Requests/s' },
                { key: 'active_users' as const, color: '#a78bfa', label: 'Active Users' },
              ]}
            />
          )}
        </div>

        {/* Activity Feed — admin only */}
        {isAdmin && <ActivityFeed />}
      </main>
    </div>
  );
}
