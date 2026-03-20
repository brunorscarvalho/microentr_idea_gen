import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Insight, Opportunity, DecisionLogEntry } from '../../types';

interface BlindSpot {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  suggestedAction: string;
  relatedId?: string;
}

interface BlindSpotsProps {
  insights: Insight[];
  opportunities: Opportunity[];
  decisionLog: DecisionLogEntry[];
}

function severityColor(s: 'high' | 'medium' | 'low'): string {
  return s === 'high' ? 'text-red-400 border-red-500/20 bg-red-500/5'
    : s === 'medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
    : 'text-zinc-400 border-zinc-600 bg-zinc-800';
}

function severityBadge(s: 'high' | 'medium' | 'low'): string {
  return s === 'high' ? 'bg-red-500/10 text-red-400'
    : s === 'medium' ? 'bg-amber-500/10 text-amber-400'
    : 'bg-zinc-700 text-zinc-400';
}

function analyzeBlindSpots(
  insights: Insight[],
  opportunities: Opportunity[],
  decisionLog: DecisionLogEntry[]
): BlindSpot[] {
  const spots: BlindSpot[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Insights with no next step defined
  const noNextStep = insights.filter(i => i.status === 'active' && !i.nextStep.trim());
  noNextStep.forEach(ins => {
    spots.push({
      id: `bs-nonext-${ins.id}`,
      title: `Insight without next step: "${ins.title.slice(0, 50)}"`,
      description: 'An insight without a defined next step will stagnate. Without action, signals decay.',
      severity: 'medium',
      suggestedAction: 'Open this insight and define a concrete next step.',
      relatedId: ins.id,
    });
  });

  // 2. High-score opportunities (>6) with no experiments
  const highScoreNoExp = opportunities.filter(
    o => o.status === 'active' && o.score.total > 6 && o.experiments.length === 0
  );
  highScoreNoExp.forEach(opp => {
    spots.push({
      id: `bs-noexp-${opp.id}`,
      title: `High-score opportunity with no experiment: "${opp.problem.slice(0, 50)}"`,
      description: `Score ${opp.score.total}/10 — this opportunity has strong signal but no validation experiment. Without testing, high scores are just opinions.`,
      severity: 'high',
      suggestedAction: 'Design and launch a minimum viable experiment to validate the core assumption.',
      relatedId: opp.id,
    });
  });

  // 3. Tags appearing only in insights (never formalized into opportunities)
  const oppTags = new Set(opportunities.flatMap(o => o.tags));
  const insightOnlyTagMap: Record<string, string[]> = {};
  insights.forEach(i => {
    i.tags.forEach(t => {
      if (!oppTags.has(t)) {
        insightOnlyTagMap[t] = insightOnlyTagMap[t] ? [...insightOnlyTagMap[t], i.id] : [i.id];
      }
    });
  });
  const insightOnlyTags = Object.entries(insightOnlyTagMap).filter(([, ids]) => ids.length >= 2);
  if (insightOnlyTags.length > 0) {
    const [tag, ids] = insightOnlyTags[0];
    spots.push({
      id: `bs-tags-${tag}`,
      title: `Theme "${tag}" has ${ids.length} insights but no opportunity`,
      description: 'Multiple insights share this theme but it was never formalized into an opportunity. This could indicate a blind spot in your opportunity radar.',
      severity: 'medium',
      suggestedAction: `Review insights tagged "${tag}" and assess if there's a viable opportunity worth defining.`,
    });
  }

  // 4. Old decisions with no outcome recorded
  const staleDecisions = decisionLog.filter(d => {
    const decDate = new Date(d.date);
    return decDate < thirtyDaysAgo && !d.outcome;
  });
  staleDecisions.forEach(dec => {
    spots.push({
      id: `bs-dec-${dec.id}`,
      title: `Decision from ${dec.date} has no recorded outcome`,
      description: `"${dec.decision.slice(0, 80)}" — it's been 30+ days. Documenting outcomes closes the feedback loop and improves future decisions.`,
      severity: 'low',
      suggestedAction: 'Open this decision log entry and record what happened.',
      relatedId: dec.id,
    });
  });

  // 5. Active opportunities with no recent update (> 14 days)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const stalOpps = opportunities.filter(o => {
    const updated = new Date(o.updatedAt);
    return o.status === 'active' && updated < fourteenDaysAgo;
  });
  stalOpps.forEach(opp => {
    spots.push({
      id: `bs-stale-opp-${opp.id}`,
      title: `Opportunity not updated in 14+ days: "${opp.problem.slice(0, 50)}"`,
      description: `Last updated ${opp.updatedAt.split('T')[0]}. Active opportunities that don't progress tend to quietly die. Check if it's still relevant.`,
      severity: 'low',
      suggestedAction: 'Review this opportunity: advance it, pause it, or mark it as rejected.',
      relatedId: opp.id,
    });
  });

  return spots.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function BlindSpots({ insights, opportunities, decisionLog }: BlindSpotsProps) {
  const spots = useMemo(
    () => analyzeBlindSpots(insights, opportunities, decisionLog),
    [insights, opportunities, decisionLog]
  );

  const high = spots.filter(s => s.severity === 'high').length;
  const medium = spots.filter(s => s.severity === 'medium').length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Blind Spots</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Systematic analysis of gaps, stale items, and unvalidated assumptions
        </p>
      </div>

      {spots.length === 0 ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
          <AlertTriangle size={28} className="text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">No blind spots detected.</p>
          <p className="text-zinc-600 text-xs mt-1">Your pipeline looks clean.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            {high > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="text-red-400 font-medium">{high} high</span>
              </div>
            )}
            {medium > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-amber-400 font-medium">{medium} medium</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 bg-zinc-500 rounded-full" />
              <span className="text-zinc-500">{spots.length - high - medium} low</span>
            </div>
          </div>

          <div className="space-y-3">
            {spots.map(spot => (
              <div key={spot.id} className={`border rounded-lg p-4 space-y-2 ${severityColor(spot.severity)}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-100 leading-snug">{spot.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${severityBadge(spot.severity)}`}>
                    {spot.severity}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{spot.description}</p>
                <div className="flex items-start gap-2 pt-1">
                  <span className="text-xs text-zinc-500 uppercase tracking-wide shrink-0 mt-0.5">Action:</span>
                  <p className="text-sm text-zinc-300">{spot.suggestedAction}</p>
                </div>
                {spot.relatedId && (
                  <span className="inline-block text-xs bg-zinc-700/60 text-zinc-400 px-2 py-0.5 rounded font-mono">
                    {spot.relatedId}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
