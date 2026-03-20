import React, { useState, useMemo } from 'react';
import { Plus, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Opportunity,
  Experiment,
  ScoringWeights,
  Status,
} from '../../types';
import { OpportunityCard } from './OpportunityCard';
import { Modal } from '../ui/Modal';
import { computeScore } from '../../lib/scoring';

interface OpportunityListProps {
  opportunities: Opportunity[];
  experiments?: Experiment[];
  scoringWeights: ScoringWeights;
  onAdd: (data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'experiments'>) => void;
  onUpdate: (opp: Opportunity) => void;
  onReject: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddExperiment: (data: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateWeights: (weights: ScoringWeights) => void;
}

interface NewOppFormData {
  problem: string;
  audience: string;
  offer: string;
  channel: string;
  rationale: string;
  tradeoffs: string;
  nextAction: string;
  tags: string;
  marketSize: number;
  feasibility: number;
  differentiation: number;
  urgency: number;
  alignment: number;
}

const emptyForm: NewOppFormData = {
  problem: '',
  audience: '',
  offer: '',
  channel: '',
  rationale: '',
  tradeoffs: '',
  nextAction: '',
  tags: '',
  marketSize: 5,
  feasibility: 5,
  differentiation: 5,
  urgency: 5,
  alignment: 5,
};

export function OpportunityList({
  opportunities,
  experiments = [],
  scoringWeights,
  onAdd,
  onUpdate,
  onReject,
  onAddExperiment,
  onUpdateWeights,
}: OpportunityListProps) {
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('active');
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewOppFormData>(emptyForm);
  const [localWeights, setLocalWeights] = useState<ScoringWeights>(scoringWeights);

  const filtered = useMemo(() => {
    let result = [...opportunities];
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }
    return result.sort((a, b) => b.score.total - a.score.total);
  }, [opportunities, filterStatus]);

  const handleWeightChange = (key: keyof ScoringWeights, value: number) => {
    const updated = { ...localWeights, [key]: value };
    setLocalWeights(updated);
  };

  const handleApplyWeights = () => {
    onUpdateWeights(localWeights);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.problem.trim()) return;
    const rawScore = {
      marketSize: form.marketSize,
      feasibility: form.feasibility,
      differentiation: form.differentiation,
      urgency: form.urgency,
      alignment: form.alignment,
    };
    const score = computeScore(rawScore, scoringWeights);
    onAdd({
      problem: form.problem.trim(),
      audience: form.audience.trim(),
      offer: form.offer.trim(),
      channel: form.channel.trim(),
      score,
      rationale: form.rationale.trim(),
      tradeoffs: form.tradeoffs.trim(),
      nextAction: form.nextAction.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      sources: [],
      status: 'active',
    });
    setModalOpen(false);
    setForm(emptyForm);
  };

  const weightKeys: Array<[keyof ScoringWeights, string]> = [
    ['marketSize', 'Market Size'],
    ['feasibility', 'Feasibility'],
    ['differentiation', 'Differentiation'],
    ['urgency', 'Urgency'],
    ['alignment', 'Alignment'],
  ];

  const totalWeight = Object.values(localWeights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as Status | 'all')}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>

        <button
          onClick={() => setWeightsOpen(w => !w)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${
            weightsOpen
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <SlidersHorizontal size={14} />
          Scoring Weights
          {weightsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        <button
          onClick={() => setModalOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          New Opportunity
        </button>
      </div>

      {/* Scoring weights editor */}
      {weightsOpen && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100">Scoring Weights</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                Math.abs(totalWeight - 1) < 0.01
                  ? 'bg-emerald-400/10 text-emerald-400'
                  : 'bg-red-400/10 text-red-400'
              }`}
            >
              Total: {(totalWeight * 100).toFixed(0)}%
              {Math.abs(totalWeight - 1) > 0.01 && ' (should be 100%)'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {weightKeys.map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {label}: {(localWeights[key] * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={localWeights[key]}
                  onChange={e => handleWeightChange(key, parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleApplyWeights}
            className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Apply & Recompute Scores
          </button>
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-zinc-500">
        {filtered.length} opportunit{filtered.length !== 1 ? 'ies' : 'y'} · sorted by score
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(opp => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            experiments={experiments}
            onUpdate={onUpdate}
            onReject={onReject}
            onAddExperiment={onAddExperiment}
            scoringWeights={scoringWeights}
          />
        ))}
        {filtered.length === 0 && (
          <div className="lg:col-span-2 text-center py-12 text-zinc-500 text-sm">
            No opportunities match your filter.
          </div>
        )}
      </div>

      {/* New Opportunity Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Opportunity" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Problem Statement *
            </label>
            <textarea
              required
              rows={2}
              value={form.problem}
              onChange={e => setForm(f => ({ ...f, problem: e.target.value }))}
              placeholder="What problem are you solving?"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Target Audience *
              </label>
              <input
                required
                type="text"
                value={form.audience}
                onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Offer *</label>
              <input
                required
                type="text"
                value={form.offer}
                onChange={e => setForm(f => ({ ...f, offer: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Channel</label>
              <input
                type="text"
                value={form.channel}
                onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Next Action</label>
              <input
                type="text"
                value={form.nextAction}
                onChange={e => setForm(f => ({ ...f, nextAction: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Rationale</label>
              <textarea
                rows={2}
                value={form.rationale}
                onChange={e => setForm(f => ({ ...f, rationale: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Trade-offs</label>
              <textarea
                rows={2}
                value={form.tradeoffs}
                onChange={e => setForm(f => ({ ...f, tradeoffs: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
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
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Scoring */}
          <div className="border-t border-zinc-700 pt-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Scores (1-10)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(
                [
                  ['marketSize', 'Market Size'],
                  ['feasibility', 'Feasibility'],
                  ['differentiation', 'Differentiation'],
                  ['urgency', 'Urgency'],
                  ['alignment', 'Personal Alignment'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs text-zinc-400 mb-1">
                    {label}: {form[key]}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form[key]}
                    onChange={e =>
                      setForm(f => ({ ...f, [key]: parseInt(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Computed total:{' '}
              <span className="text-indigo-400 font-semibold">
                {computeScore(
                  {
                    marketSize: form.marketSize,
                    feasibility: form.feasibility,
                    differentiation: form.differentiation,
                    urgency: form.urgency,
                    alignment: form.alignment,
                  },
                  scoringWeights
                ).total.toFixed(1)}
                /10
              </span>
            </p>
          </div>

          <div className="flex justify-end gap-2">
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
              Save Opportunity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
