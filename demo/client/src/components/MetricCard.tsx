import { useRef, useEffect, useState } from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  thresholds?: {
    warning: number;
    critical: number;
  };
  icon?: string;
}

function getStatusColor(
  value: number,
  thresholds?: { warning: number; critical: number }
): string {
  if (!thresholds) return 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30';
  if (value >= thresholds.critical)
    return 'from-red-500/20 to-red-600/10 border-red-500/30';
  if (value >= thresholds.warning)
    return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
  return 'from-green-500/20 to-green-600/10 border-green-500/30';
}

function getValueColor(
  value: number,
  thresholds?: { warning: number; critical: number }
): string {
  if (!thresholds) return 'text-white';
  if (value >= thresholds.critical) return 'text-red-400';
  if (value >= thresholds.warning) return 'text-yellow-400';
  return 'text-green-400';
}

export function MetricCard({ label, value, unit, thresholds, icon }: MetricCardProps) {
  const [animating, setAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setAnimating(true);
      prevValue.current = value;
      const timer = setTimeout(() => setAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-4 transition-all ${getStatusColor(
        value,
        thresholds
      )}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-bold tabular-nums transition-colors ${getValueColor(
            value,
            thresholds
          )} ${animating ? 'animate-value' : ''}`}
        >
          {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
}
