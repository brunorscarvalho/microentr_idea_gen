import { useMemo, useState } from 'react';
import { Compass, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Insight, Opportunity, Experiment } from '../../types';

interface DiscoveryHypothesis {
  id: string;
  title: string;
  reasoning: string;
  type: 'untested-combination' | 'market-gap' | 'low-effort-high-confidence' | 'stale-insight' | 'missing-experiment';
  suggestedNextStep: string;
  confidence: 'low' | 'medium' | 'high';
  relatedIds: string[];
}

function typeLabel(type: DiscoveryHypothesis['type']): string {
  const map: Record<DiscoveryHypothesis['type'], string> = {
    'untested-combination': 'Untested Combination',
    'market-gap': 'Market Gap',
    'low-effort-high-confidence': 'High Confidence · Low Effort',
    'stale-insight': 'Stale Insight',
    'missing-experiment': 'No Experiment Yet',
  };
  return map[type];
}

function typeColor(type: DiscoveryHypothesis['type']): string {
  const map: Record<DiscoveryHypothesis['type'], string> = {
    'untested-combination': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'market-gap': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'low-effort-high-confidence': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'stale-insight': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'missing-experiment': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  };
  return map[type];
}

function confidenceDot(c: 'low' | 'medium' | 'high'): string {
  return c === 'high' ? 'bg-emerald-400' : c === 'medium' ? 'bg-amber-400' : 'bg-zinc-500';
}

function generateHypotheses(
  insights: Insight[],
  opportunities: Opportunity[],
  _experiments: Experiment[]
): DiscoveryHypothesis[] {
  const results: DiscoveryHypothesis[] = [];

  // 1. High-confidence insights not yet promoted to opportunity
  const unpromoted = insights.filter(i => i.status === 'active' && !i.promotedTo && i.confidence === 'high');
  unpromoted.forEach(ins => {
    results.push({
      id: `disc-unpromoted-${ins.id}`,
      title: `"${ins.title}" — ready to become an opportunity`,
      reasoning: `This insight has high confidence and impact ${ins.impact}/10, but hasn't been promoted to an opportunity yet. Strong signal that warrants a formal opportunity definition.`,
      type: 'low-effort-high-confidence',
      suggestedNextStep: `Define problem, audience, and offer for "${ins.title}", then promote to Opportunity`,
      confidence: 'high',
      relatedIds: [ins.id],
    });
  });

  // 2. Opportunities with score > 6 but no experiments
  const noExperiments = opportunities.filter(o => o.status === 'active' && o.score.total > 6 && o.experiments.length === 0);
  noExperiments.forEach(opp => {
    results.push({
      id: `disc-noexp-${opp.id}`,
      title: `"${opp.problem.slice(0, 60)}..." — no experiment designed yet`,
      reasoning: `Score ${opp.score.total}/10 suggests this is a serious opportunity, but there's no experiment to validate it. Every high-score opportunity without an experiment is a decision deferred.`,
      type: 'missing-experiment',
      suggestedNextStep: `Design a minimum viable experiment to validate the core assumption for ${opp.id}`,
      confidence: 'high',
      relatedIds: [opp.id],
    });
  });

  // 3. Tag cross-pollination — tags in insights that don't appear in any opportunity
  const oppTags = new Set(opportunities.flatMap(o => o.tags));
  const insightOnlyTags = new Set(
    insights.flatMap(i => i.tags).filter(t => !oppTags.has(t))
  );
  if (insightOnlyTags.size > 0) {
    const tags = [...insightOnlyTags].slice(0, 3);
    const relatedInsights = insights.filter(i => i.tags.some(t => insightOnlyTags.has(t)));
    results.push({
      id: `disc-tags-${tags.join('-')}`,
      title: `Tags [${tags.join(', ')}] exist in insights but not in opportunities`,
      reasoning: `These themes appear in your research but have never been formalized into an opportunity. Possible market gap or area of underexploration.`,
      type: 'market-gap',
      suggestedNextStep: `Review insights tagged with [${tags.join(', ')}] and assess if there's an opportunity worth defining`,
      confidence: 'medium',
      relatedIds: relatedInsights.map(i => i.id).slice(0, 3),
    });
  }

  // 4. Stale insights — created > 30 days ago with no nextStep action taken (still active, no promotedTo)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const stale = insights.filter(i => {
    const created = new Date(i.createdAt);
    return i.status === 'active' && !i.promotedTo && created < thirtyDaysAgo;
  });
  stale.forEach(ins => {
    results.push({
      id: `disc-stale-${ins.id}`,
      title: `"${ins.title}" — stale for 30+ days`,
      reasoning: `This insight was created on ${ins.createdAt.split('T')[0]} and hasn't progressed. Either act on the suggested next step, promote it to an opportunity, or mark it as inactive.`,
      type: 'stale-insight',
      suggestedNextStep: ins.nextStep || 'Review and decide: promote, act, or archive',
      confidence: 'medium',
      relatedIds: [ins.id],
    });
  });

  // 5. Cross-opportunity combination — look for insights with overlapping tags across separate opportunities
  const tagToOpps: Record<string, string[]> = {};
  opportunities.forEach(o => {
    o.tags.forEach(t => {
      tagToOpps[t] = tagToOpps[t] ? [...tagToOpps[t], o.id] : [o.id];
    });
  });
  const sharedTags = Object.entries(tagToOpps).filter(([, opps]) => opps.length >= 2);
  if (sharedTags.length > 0) {
    const [tag, oppIds] = sharedTags[0];
    const relatedOpps = opportunities.filter(o => oppIds.includes(o.id));
    results.push({
      id: `disc-combo-${tag}`,
      title: `Opportunities [${oppIds.slice(0, 2).join(', ')}] share the theme "${tag}" — combination possible?`,
      reasoning: `"${relatedOpps[0]?.problem.slice(0, 50)}" and "${relatedOpps[1]?.problem.slice(0, 50)}" both address "${tag}". A bundled offer or shared channel strategy could multiply impact.`,
      type: 'untested-combination',
      suggestedNextStep: `Explore if ${oppIds[0]} and ${oppIds[1]} can share distribution, audience, or be bundled`,
      confidence: 'low',
      relatedIds: oppIds.slice(0, 2),
    });
  }

  return results;
}

function HypothesisCard({ h }: { h: DiscoveryHypothesis }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-zinc-800 border rounded-lg p-4 space-y-3 border-zinc-700`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeColor(h.type)}`}>
              {typeLabel(h.type)}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${confidenceDot(h.confidence)}`} />
              {h.confidence} confidence
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-100 leading-snug">{h.title}</p>
        </div>
      </div>

      {open && (
        <div className="space-y-3 pt-1 border-t border-zinc-700/60">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Reasoning</p>
            <p className="text-sm text-zinc-300">{h.reasoning}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Suggested next step</p>
            <div className="flex items-start gap-2">
              <ArrowRight size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-sm text-indigo-300">{h.suggestedNextStep}</p>
            </div>
          </div>
          {h.relatedIds.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {h.relatedIds.map(id => (
                <span key={id} className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded font-mono">
                  {id}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <button onClick={() => setOpen(v => !v)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        {open ? 'Hide reasoning' : 'Show reasoning →'}
      </button>
    </div>
  );
}

interface DiscoveryModeProps {
  insights: Insight[];
  opportunities: Opportunity[];
  experiments: Experiment[];
}

export function DiscoveryMode({ insights, opportunities, experiments }: DiscoveryModeProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const hypotheses = useMemo(
    () => generateHypotheses(insights, opportunities, experiments),
    [insights, opportunities, experiments, refreshKey]
  );

  const byType: Record<string, DiscoveryHypothesis[]> = {};
  hypotheses.forEach(h => {
    byType[h.type] = byType[h.type] ? [...byType[h.type], h] : [h];
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Discovery Mode</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Rule-based analysis of gaps, combinations, and untested assumptions
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded font-medium transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {hypotheses.length === 0 ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
          <Compass size={28} className="text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">No hypotheses generated yet.</p>
          <p className="text-zinc-600 text-xs mt-1">
            Add more insights and opportunities to enable discovery analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 pb-1">
            <AlertCircle size={13} />
            {hypotheses.length} hypotheses generated from {insights.length} insights · {opportunities.length} opportunities · {experiments.length} experiments
          </div>
          {hypotheses.map(h => (
            <HypothesisCard key={h.id} h={h} />
          ))}
        </div>
      )}
    </div>
  );
}
