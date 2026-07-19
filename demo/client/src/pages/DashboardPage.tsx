import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { MetricsChart } from '../components/MetricsChart';
import { ActivityFeed } from '../components/ActivityFeed';
import type { LiveMetrics } from '../types';

export function DashboardPage() {
  const { user, token } = useAuth();
  const { metrics, latest, isConnected } = useWebSocket({ token });
  const isAdmin = user?.role === 'admin';

  // Determine which metric cards to show
  const metricCards = useMemo(() => {
    const cards: Array<{
      key: keyof LiveMetrics;
      label: string;
      unit: string;
      icon: string;
      thresholds?: { warning: number; critical: number };
    }> = [
      {
        key: 'cpu',
        label: 'CPU',
        unit: '%',
        icon: '🖥️',
        thresholds: { warning: 70, critical: 90 },
      },
      {
        key: 'memory',
        label: 'Memory',
        unit: '%',
        icon: '🧠',
        thresholds: { warning: 80, critical: 95 },
      },
    ];

    if (isAdmin) {
      cards.push(
        {
          key: 'requests_per_sec' as keyof LiveMetrics,
          label: 'Requests/sec',
          unit: 'rps',
          icon: '⚡',
        },
        {
          key: 'active_users' as keyof LiveMetrics,
          label: 'Active Users',
          unit: 'users',
          icon: '👥',
        }
      );
    }

    return cards;
  }, [isAdmin]);

  // Chart series for admin vs viewer
  const cpuMemSeries = useMemo(
    () => [
      { key: 'cpu' as keyof LiveMetrics, name: 'CPU %', color: '#818cf8', unit: '%' },
      { key: 'memory' as keyof LiveMetrics, name: 'Memory %', color: '#34d399', unit: '%' },
    ],
    []
  );

  const reqUsersSeries = useMemo(
    () => [
      {
        key: 'requests_per_sec' as keyof LiveMetrics,
        name: 'Requests/sec',
        color: '#fbbf24',
        unit: 'rps',
      },
      {
        key: 'active_users' as keyof LiveMetrics,
        name: 'Active Users',
        color: '#f472b6',
        unit: 'users',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Header isConnected={isConnected} />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Metric Cards */}
        {latest ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((card) => (
              <MetricCard
                key={card.key}
                label={card.label}
                value={(latest[card.key] as number) ?? 0}
                unit={card.unit}
                thresholds={card.thresholds}
                icon={card.icon}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((card) => (
              <div
                key={card.key}
                className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 animate-pulse"
              >
                <div className="h-3 bg-gray-800 rounded w-16 mb-3" />
                <div className="h-7 bg-gray-800 rounded w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className={isAdmin ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'grid grid-cols-1 gap-6'}>
          {/* Main charts area */}
          <div className={isAdmin ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
            <MetricsChart
              data={metrics}
              series={cpuMemSeries}
              title="CPU & Memory Usage"
            />
            {isAdmin && (
              <MetricsChart
                data={metrics}
                series={reqUsersSeries}
                title="Requests & Active Users"
              />
            )}
          </div>

          {/* Activity Feed sidebar — admin only */}
          {isAdmin && (
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
          )}
        </div>

        {/* Viewer: show activity section at bottom instead */}
        {!isAdmin && (
          <ActivityFeed />
        )}
      </main>
    </div>
  );
}
