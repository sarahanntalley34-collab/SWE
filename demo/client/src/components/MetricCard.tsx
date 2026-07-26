interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
}

function colorClass(value: number): string {
  if (value < 60) return 'text-emerald-400';
  if (value <= 85) return 'text-yellow-400';
  return 'text-red-400';
}

export function MetricCard({ title, value, unit }: MetricCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</span>
      <span className={`text-3xl font-bold transition-colors duration-500 ${colorClass(value)}`}>
        {value.toFixed(1)}
        {unit && <span className="text-lg ml-1 text-gray-500">{unit}</span>}
      </span>
    </div>
  );
}
