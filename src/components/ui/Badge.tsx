import React from 'react';
import { ConfidenceLevel, ExperimentStatus, SourceType, Status } from '../../types';

type BadgeVariant =
  | Status
  | ExperimentStatus
  | SourceType
  | ConfidenceLevel
  | 'default'
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'red'
  | 'sky'
  | 'violet'
  | 'orange';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  // Status
  active: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  paused: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
  rejected: 'bg-red-400/10 text-red-400 border border-red-400/20',
  completed: 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20',

  // Experiment status
  hypothesis: 'bg-violet-400/10 text-violet-400 border border-violet-400/20',
  running: 'bg-sky-400/10 text-sky-400 border border-sky-400/20',
  validated: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  invalidated: 'bg-red-400/10 text-red-400 border border-red-400/20',

  // Source type
  vault: 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20',
  web: 'bg-sky-400/10 text-sky-400 border border-sky-400/20',
  history: 'bg-violet-400/10 text-violet-400 border border-violet-400/20',
  derived: 'bg-zinc-400/10 text-zinc-400 border border-zinc-400/20',

  // Confidence
  high: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  medium: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
  low: 'bg-red-400/10 text-red-400 border border-red-400/20',

  // Generic
  default: 'bg-zinc-700 text-zinc-300 border border-zinc-600',
  indigo: 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20',
  emerald: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  amber: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
  red: 'bg-red-400/10 text-red-400 border border-red-400/20',
  sky: 'bg-sky-400/10 text-sky-400 border border-sky-400/20',
  violet: 'bg-violet-400/10 text-violet-400 border border-violet-400/20',
  orange: 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const classes = variantClasses[variant] ?? variantClasses.default;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes} ${className}`}
    >
      {children}
    </span>
  );
}
