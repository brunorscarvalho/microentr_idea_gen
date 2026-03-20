import { OpportunityScore, ScoringWeights } from '../types';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  marketSize: 0.25,
  feasibility: 0.20,
  differentiation: 0.25,
  urgency: 0.15,
  alignment: 0.15,
};

export function computeScore(raw: Omit<OpportunityScore, 'total'>, weights: ScoringWeights): OpportunityScore {
  const total =
    raw.marketSize * weights.marketSize +
    raw.feasibility * weights.feasibility +
    raw.differentiation * weights.differentiation +
    raw.urgency * weights.urgency +
    raw.alignment * weights.alignment;
  return { ...raw, total: Math.round(total * 10) / 10 };
}

export function scoreLabel(score: number): string {
  if (score >= 8) return 'Strong';
  if (score >= 6) return 'Promising';
  if (score >= 4) return 'Exploratory';
  return 'Weak';
}

export function scoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-400';
  if (score >= 6) return 'text-amber-400';
  if (score >= 4) return 'text-orange-400';
  return 'text-red-400';
}

export function scoreBgColor(score: number): string {
  if (score >= 8) return 'bg-emerald-400';
  if (score >= 6) return 'bg-amber-400';
  if (score >= 4) return 'bg-orange-400';
  return 'bg-red-400';
}
