import React, { useState, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Insight, Opportunity, ScoringWeights, ConfidenceLevel, Status } from '../../types';
import { InsightCard } from './InsightCard';
import { Modal } from '../ui/Modal';

interface InsightListProps {
  insights: Insight[];
  scoringWeights: ScoringWeights;
  onAdd: (data: Omit<Insight, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (insight: Insight) => void;
  onDelete: (id: string) => void;
  onPromote: (
    insightId: string,
    data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'experiments'>
  ) => void;
}

interface NewInsightFormData {
  title: string;
  description: string;
  origin: string;
  evidence: string;
  confidence: ConfidenceLevel;
  impact: number;
  nextStep: string;
  tags: string;
}

const emptyForm: NewInsightFormData = {
  title: '',
  description: '',
  origin: '',
  evidence: '',
  confidence: 'medium',
  impact: 7,
  nextStep: '',
  tags: '',
};

export function InsightList({
  insights,
  scoringWeights,
  onAdd,
  onUpdate,
  onDelete,
  onPromote,
}: InsightListProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterConfidence, setFilterConfidence] = useState<ConfidenceLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'date'>('date');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewInsightFormData>(emptyForm);

  const filtered = useMemo(() => {
    let result = [...insights];

    if (filterStatus !== 'all') {
      result = result.filter(i => i.status === filterStatus);
    }
    if (filterConfidence !== 'all') {
      result = result.filter(i => i.confidence === filterConfidence);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'impact') return b.impact - a.impact;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [insights, search, filterStatus, filterConfidence, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({
      title: form.title.trim(),
      description: form.description.trim(),
      origin: form.origin.trim(),
      evidence: form.evidence.trim(),
      confidence: form.confidence,
      impact: form.impact,
      nextStep: form.nextStep.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      sources: [],
      status: 'active',
    });
    setModalOpen(false);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search insights…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${
            filtersOpen
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          New Insight
        </button>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as Status | 'all')}
              className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Confidence</label>
            <select
              value={filterConfidence}
              onChange={e => setFilterConfidence(e.target.value as ConfidenceLevel | 'all')}
              className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'impact' | 'date')}
              className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="date">Most recent</option>
              <option value="impact">Highest impact</option>
            </select>
          </div>
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-zinc-500">
        {filtered.length} insight{filtered.length !== 1 ? 's' : ''} shown
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(insight => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onPromote={onPromote}
            scoringWeights={scoringWeights}
          />
        ))}
        {filtered.length === 0 && (
          <div className="lg:col-span-2 text-center py-12 text-zinc-500 text-sm">
            No insights match your filters.
          </div>
        )}
      </div>

      {/* New Insight Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Insight" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What did you observe or learn?"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Explain in detail what you observed..."
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Origin</label>
              <input
                type="text"
                value={form.origin}
                onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
                placeholder="Where did this come from?"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Next Step</label>
              <input
                type="text"
                value={form.nextStep}
                onChange={e => setForm(f => ({ ...f, nextStep: e.target.value }))}
                placeholder="Immediate next action"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Evidence</label>
            <textarea
              rows={2}
              value={form.evidence}
              onChange={e => setForm(f => ({ ...f, evidence: e.target.value }))}
              placeholder="What data or signals support this?"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confidence</label>
              <select
                value={form.confidence}
                onChange={e =>
                  setForm(f => ({ ...f, confidence: e.target.value as ConfidenceLevel }))
                }
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Impact (1-10): {form.impact}
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={form.impact}
                onChange={e => setForm(f => ({ ...f, impact: parseInt(e.target.value) }))}
                className="w-full mt-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="automação, PME, B2B"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save Insight
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
