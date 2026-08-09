import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  /** Optional secondary line under the value (e.g. "vs. last month"). */
  sub?: string;
  /** Accent tone for the value. Defaults to white. */
  tone?: 'default' | 'positive' | 'negative' | 'accent';
  icon?: ReactNode;
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-white',
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  accent: 'text-indigo-400',
};

export function StatCard({ label, value, sub, tone = 'default', icon }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <span className={`text-3xl font-bold ${toneClasses[tone]}`}>{value}</span>
      {sub && <span className="text-sm text-gray-500">{sub}</span>}
    </div>
  );
}
