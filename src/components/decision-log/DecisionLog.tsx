import React, { useState } from 'react';
import { BookOpen, Plus, Link, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { DecisionLogEntry, Source, SourceType } from '../../types';

function SourceTypeBadge({ type }: { type: SourceType }) {
  const map: Record<SourceType, string> = {
    vault: 'bg-indigo-500/10 text-indigo-400',
    web: 'bg-sky-500/10 text-sky-400',
    history: 'bg-violet-500/10 text-violet-400',
    derived: 'bg-zinc-700 text-zinc-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium uppercase tracking-wide ${map[type]}`}>
      {type}
    </span>
  );
}

function EntryCard({ entry }: { entry: DecisionLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const linkedLabel = entry.linkedTo ? `${entry.linkedTo.type} · ${entry.linkedTo.id}` : null;

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={13} className="text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-500">{entry.date}</span>
            {linkedLabel && (
              <span className="flex items-center gap-1 text-xs text-indigo-400">
                <Link size={11} />
                {linkedLabel}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-zinc-100 leading-snug">{entry.decision}</p>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-zinc-500 hover:text-zinc-300 shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-zinc-700/60">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Context</p>
            <p className="text-sm text-zinc-300">{entry.context}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Rationale</p>
            <p className="text-sm text-zinc-300">{entry.rationale}</p>
          </div>
          {entry.outcome && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Outcome</p>
              <p className="text-sm text-zinc-300">{entry.outcome}</p>
            </div>
          )}
          {entry.sources.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.sources.map((s, i) => <SourceTypeBadge key={i} type={s.type} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewEntryForm({ onSave, onCancel }: { onSave: (data: Omit<DecisionLogEntry, 'id'>) => void; onCancel: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today, decision: '', context: '', rationale: '', outcome: '',
    linkedType: '' as '' | 'insight' | 'opportunity' | 'experiment',
    linkedId: '', sourceLabel: '', sourceType: 'derived' as SourceType,
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.decision.trim() || !form.context.trim() || !form.rationale.trim()) return;
    const sources: Source[] = form.sourceLabel.trim()
      ? [{ type: form.sourceType, label: form.sourceLabel.trim(), date: form.date }] : [];
    onSave({
      date: form.date, decision: form.decision.trim(), context: form.context.trim(),
      rationale: form.rationale.trim(), outcome: form.outcome.trim() || undefined,
      linkedTo: form.linkedType && form.linkedId.trim() ? { type: form.linkedType, id: form.linkedId.trim() } : undefined,
      sources,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-100">New Decision Entry</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Linked to (optional)</label>
          <div className="flex gap-1.5">
            <select value={form.linkedType} onChange={e => set('linkedType', e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
              <option value="">—</option>
              <option value="insight">Insight</option>
              <option value="opportunity">Opportunity</option>
              <option value="experiment">Experiment</option>
            </select>
            {form.linkedType && (
              <input type="text" placeholder="e.g. opp-001" value={form.linkedId} onChange={e => set('linkedId', e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
            )}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Decision *</label>
        <input type="text" value={form.decision} onChange={e => set('decision', e.target.value)} placeholder="What was decided?"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Context *</label>
        <textarea value={form.context} onChange={e => set('context', e.target.value)} rows={2}
          placeholder="What was the situation that led to this decision?"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none" />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Rationale *</label>
        <textarea value={form.rationale} onChange={e => set('rationale', e.target.value)} rows={2}
          placeholder="Why this decision? What were the alternatives?"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none" />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Outcome (optional)</label>
        <input type="text" value={form.outcome} onChange={e => set('outcome', e.target.value)} placeholder="What happened? (can fill later)"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-zinc-400 mb-1">Source (optional)</label>
          <input type="text" value={form.sourceLabel} onChange={e => set('sourceLabel', e.target.value)} placeholder="What informed this decision?"
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Source type</label>
          <select value={form.sourceType} onChange={e => set('sourceType', e.target.value as SourceType)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500">
            <option value="vault">Vault</option>
            <option value="web">Web</option>
            <option value="history">History</option>
            <option value="derived">Derived</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded font-medium transition-colors">
          Save Entry
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded font-medium transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function DecisionLog({ entries, onAddEntry }: { entries: DecisionLogEntry[]; onAddEntry: (data: Omit<DecisionLogEntry, 'id'>) => void }) {
  const [showForm, setShowForm] = useState(false);
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Decision Log</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Rationale trail for every significant choice</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded font-medium transition-colors">
            <Plus size={15} />New Entry
          </button>
        )}
      </div>
      {showForm && <NewEntryForm onSave={data => { onAddEntry(data); setShowForm(false); }} onCancel={() => setShowForm(false)} />}
      {sorted.length === 0 ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
          <BookOpen size={28} className="text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">No decisions logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(entry => <EntryCard key={entry.id} entry={entry} />)}
        </div>
      )}
    </div>
  );
}
