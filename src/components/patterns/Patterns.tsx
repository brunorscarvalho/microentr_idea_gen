import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Insight, Opportunity } from '../../types';

interface PatternsProps {
  insights: Insight[];
  opportunities: Opportunity[];
}

interface TagStat {
  tag: string;
  insightCount: number;
  opportunityCount: number;
  total: number;
}

export function Patterns({ insights, opportunities }: PatternsProps) {
  const tagStats = useMemo((): TagStat[] => {
    const map: Record<string, TagStat> = {};
    insights.forEach(i => {
      i.tags.forEach(t => {
        if (!map[t]) map[t] = { tag: t, insightCount: 0, opportunityCount: 0, total: 0 };
        map[t].insightCount++;
        map[t].total++;
      });
    });
    opportunities.forEach(o => {
      o.tags.forEach(t => {
        if (!map[t]) map[t] = { tag: t, insightCount: 0, opportunityCount: 0, total: 0 };
        map[t].opportunityCount++;
        map[t].total++;
      });
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [insights, opportunities]);

  const maxTotal = tagStats[0]?.total ?? 1;

  const coOccurrence = useMemo(() => {
    const pairs: Record<string, number> = {};
    [...insights, ...opportunities].forEach(item => {
      const tags = item.tags;
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const key = [tags[i], tags[j]].sort().join(' · ');
          pairs[key] = (pairs[key] ?? 0) + 1;
        }
      }
    });
    return Object.entries(pairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [insights, opportunities]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Patterns</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Tag frequency and co-occurrence across insights and opportunities</p>
      </div>

      {tagStats.length === 0 ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
          <TrendingUp size={28} className="text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">No tags to analyze yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Tag frequency</h3>
            <div className="space-y-2.5">
              {tagStats.map(stat => (
                <div key={stat.tag} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{stat.tag}</span>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      {stat.insightCount > 0 && (
                        <span className="text-indigo-400">{stat.insightCount} insights</span>
                      )}
                      {stat.opportunityCount > 0 && (
                        <span className="text-amber-400">{stat.opportunityCount} opps</span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden flex">
                    {stat.insightCount > 0 && (
                      <div
                        className="h-full bg-indigo-500/60 rounded-l-full"
                        style={{ width: `${(stat.insightCount / maxTotal) * 100}%` }}
                      />
                    )}
                    {stat.opportunityCount > 0 && (
                      <div
                        className="h-full bg-amber-500/60"
                        style={{ width: `${(stat.opportunityCount / maxTotal) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-indigo-500/60 inline-block" />Insights</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-500/60 inline-block" />Opportunities</span>
            </div>
          </div>

          {coOccurrence.length > 0 && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Tag co-occurrence</h3>
              <div className="space-y-2">
                {coOccurrence.map(([pair, count]) => (
                  <div key={pair} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400 font-mono text-xs">{pair}</span>
                    <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded">{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
