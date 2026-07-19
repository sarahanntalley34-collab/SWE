import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { LiveMetrics } from '../types';

interface ChartSeries {
  key: keyof LiveMetrics;
  name: string;
  color: string;
  unit: string;
}

interface MetricsChartProps {
  data: LiveMetrics[];
  series: ChartSeries[];
  title: string;
  emptyMessage?: string;
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return ts;
  }
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label ? formatTimestamp(label) : ''}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-0.5 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-300">{entry.name}:</span>
          <span className="text-sm font-medium text-white tabular-nums">
            {entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MetricsChart({
  data,
  series,
  title,
  emptyMessage = 'Waiting for data...',
}: MetricsChartProps) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
          {emptyMessage}
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    time: d.timestamp,
  }));

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <h3 className="text-sm font-medium text-gray-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(55 65 81 / 0.4)" />
          <XAxis
            dataKey="time"
            tickFormatter={formatTimestamp}
            stroke="rgb(107 114 128)"
            tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="rgb(107 114 128)"
            tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'rgb(156 163 175)' }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key as string}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
