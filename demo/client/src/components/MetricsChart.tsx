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
import type { MetricPoint } from '../types';

interface LineConfig {
  key: keyof MetricPoint;
  color: string;
  label: string;
}

interface MetricsChartProps {
  data: MetricPoint[];
  lines: LineConfig[];
}

export function MetricsChart({ data, lines }: MetricsChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="timestamp"
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => {
              try {
                const d = new Date(v);
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              } catch {
                return v;
              }
            }}
          />
          <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: 8,
              color: '#f3f4f6',
            }}
            labelFormatter={(v) => {
              try {
                return new Date(String(v)).toLocaleTimeString();
              } catch {
                return String(v ?? '');
              }
            }}
          />
          <Legend />
          {lines.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              dot={false}
              name={label}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
