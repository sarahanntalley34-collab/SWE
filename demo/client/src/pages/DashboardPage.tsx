import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { getMetricsOverview } from '../api/client';
import type { MetricsOverview } from '../types';

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US')}`;
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">{title}</h2>
      <div className="h-72">{children}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
        <div className="h-80 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [overview, setOverview] = useState<MetricsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setOverview(null);
    getMetricsOverview()
      .then(setOverview)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="bg-gray-900 border border-red-500/20 rounded-xl p-10 text-center space-y-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!overview) return <Skeleton />;

  return (
    <div className="space-y-6">
      {/* Headline metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="MRR" value={formatCurrency(overview.mrr)} sub={`$${overview.arpu.toFixed(2)} ARPU`} tone="accent" />
        <StatCard label="Active Users" value={overview.active_users.toLocaleString('en-US')} sub="All time growth" />
        <StatCard label="MRR Growth" value={`${overview.mrr_growth.toFixed(1)}%`} sub="Month over month" tone="positive" />
        <StatCard label="Churn Rate" value={`${overview.churn_rate.toFixed(1)}%`} sub="Monthly" tone="negative" />
      </div>

      {/* Revenue + user growth charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overview.monthly_revenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: 8,
                  color: '#f3f4f6',
                }}
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Growth">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overview.user_growth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: 8,
                  color: '#f3f4f6',
                }}
                formatter={(value) => [Number(value).toLocaleString('en-US'), 'Users']}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#818cf8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#818cf8', strokeWidth: 0 }}
                name="Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
