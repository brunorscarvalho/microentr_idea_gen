
interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  showValue?: boolean;
  className?: string;
}

function getBarColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.8) return 'bg-emerald-400';
  if (ratio >= 0.6) return 'bg-amber-400';
  if (ratio >= 0.4) return 'bg-orange-400';
  return 'bg-red-400';
}

export function ScoreBar({
  label,
  value,
  max = 10,
  showValue = true,
  className = '',
}: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = getBarColor(value, max);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-zinc-400 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs text-zinc-300 w-6 text-right shrink-0">{value}</span>
      )}
    </div>
  );
}

interface TotalScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TotalScoreDisplay({ score, size = 'md' }: TotalScoreDisplayProps) {
  let colorClass = 'text-red-400';
  if (score >= 8) colorClass = 'text-emerald-400';
  else if (score >= 6) colorClass = 'text-amber-400';
  else if (score >= 4) colorClass = 'text-orange-400';

  const sizeClass = {
    sm: 'text-xl font-bold',
    md: 'text-3xl font-bold',
    lg: 'text-4xl font-bold',
  }[size];

  return (
    <span className={`${sizeClass} ${colorClass} tabular-nums`}>
      {score.toFixed(1)}
    </span>
  );
}
