import { useMemo, useState } from 'react';
import { GitBranch, Database, Globe, Clock, Cpu } from 'lucide-react';
import { Insight, Opportunity, Source, SourceType } from '../../types';

interface SourceTraceProps {
  insights: Insight[];
  opportunities: Opportunity[];
}

interface SourceEntry {
  source: Source;
  referencedBy: { type: 'insight' | 'opportunity'; id: string; title: string }[];
}

function typeIcon(type: SourceType) {
  const cls = 'shrink-0';
  switch (type) {
    case 'vault': return <Database size={15} className={`text-indigo-400 ${cls}`} />;
    case 'web': return <Globe size={15} className={`text-sky-400 ${cls}`} />;
    case 'history': return <Clock size={15} className={`text-violet-400 ${cls}`} />;
    case 'derived': return <Cpu size={15} className={`text-zinc-400 ${cls}`} />;
  }
}

function typeStyle(type: SourceType): string {
  const map: Record<SourceType, string> = {
    vault: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    web: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    history: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    derived: 'bg-zinc-700 text-zinc-400 border-zinc-600',
  };
  return map[type];
}

function typeLabel(type: SourceType): string {
  const map: Record<SourceType, string> = {
    vault: 'Vault',
    web: 'Web',
    history: 'History',
    derived: 'Derived',
  };
  return map[type];
}

const ALL_TYPES: SourceType[] = ['vault', 'web', 'history', 'derived'];

export function SourceTrace({ insights, opportunities }: SourceTraceProps) {
  const [activeType, setActiveType] = useState<SourceType | 'all'>('all');

  const sourceMap = useMemo((): Record<SourceType, SourceEntry[]> => {
    const entries: Record<string, SourceEntry> = {};

    const addSource = (source: Source, ref: SourceEntry['referencedBy'][0]) => {
      const key = `${source.type}::${source.label}`;
      if (!entries[key]) {
        entries[key] = { source, referencedBy: [] };
      }
      entries[key].referencedBy.push(ref);
    };

    insights.forEach(i => {
      i.sources.forEach(s => addSource(s, { type: 'insight', id: i.id, title: i.title }));
    });
    opportunities.forEach(o => {
      o.sources.forEach(s => addSource(s, { type: 'opportunity', id: o.id, title: o.problem }));
    });

    const result: Record<SourceType, SourceEntry[]> = { vault: [], web: [], history: [], derived: [] };
    Object.values(entries).forEach(entry => {
      result[entry.source.type].push(entry);
    });
    return result;
  }, [insights, opportunities]);

  const typeCounts = useMemo(() => {
    const counts: Record<SourceType, number> = { vault: 0, web: 0, history: 0, derived: 0 };
    ALL_TYPES.forEach(t => { counts[t] = sourceMap[t].length; });
    return counts;
  }, [sourceMap]);

  const visibleTypes = activeType === 'all' ? ALL_TYPES : [activeType];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Source Trace</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          All evidence sources grouped by type, with back-references to insights and opportunities
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveType('all')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeType === 'all' ? 'bg-zinc-600 text-zinc-100' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All
        </button>
        {ALL_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              activeType === t ? typeStyle(t) : 'border-transparent bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {typeIcon(t)}
            {typeLabel(t)}
            <span className="text-xs opacity-70">({typeCounts[t]})</span>
          </button>
        ))}
      </div>

      {visibleTypes.every(t => sourceMap[t].length === 0) ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
          <GitBranch size={28} className="text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">No sources of this type found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleTypes.map(t => {
            const entries = sourceMap[t];
            if (entries.length === 0) return null;
            return (
              <div key={t}>
                <div className={`flex items-center gap-2 mb-3 text-sm font-semibold border-b border-zinc-700 pb-2`}>
                  {typeIcon(t)}
                  <span className={typeStyle(t).split(' ')[1]}>{typeLabel(t)}</span>
                  <span className="text-zinc-600 font-normal text-xs">{entries.length} sources</span>
                </div>
                <div className="space-y-2">
                  {entries.map((entry, i) => (
                    <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          {typeIcon(t)}
                          <div>
                            <p className="text-sm text-zinc-200">{entry.source.label}</p>
                            {entry.source.date && (
                              <p className="text-xs text-zinc-500 mt-0.5">{entry.source.date}</p>
                            )}
                            {entry.source.url && (
                              <p className="text-xs text-zinc-600 font-mono mt-0.5 truncate max-w-sm">
                                {entry.source.url}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {entry.referencedBy.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.referencedBy.map((ref, j) => (
                            <span key={j} className={`text-xs px-2 py-0.5 rounded border ${
                              ref.type === 'insight'
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {ref.type === 'insight' ? '💡' : '🎯'} {ref.id}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
