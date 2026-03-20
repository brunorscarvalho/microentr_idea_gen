import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Experiment, ExperimentStatus, Opportunity } from '../../types';
import { ExperimentCard } from './ExperimentCard';
import { Modal } from '../ui/Modal';

interface ExperimentListProps {
  experiments: Experiment[];
  opportunities: Opportunity[];
  onAdd: (data: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (exp: Experiment) => void;
}

interface NewExpFormData {
  hypotheses: string;
  successMetric: string;
  deadline: string;
  notes: string;
  opportunityId: string;
}

const emptyForm: NewExpFormData = {
  hypotheses: '',
  successMetric: '',
  deadline: '',
  notes: '',
  opportunityId: '',
};

export function ExperimentList({
  experiments,
  opportunities,
  onAdd,
  onUpdate,
}: ExperimentListProps) {
  const [filterStatus, setFilterStatus] = useState<ExperimentStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewExpFormData>(emptyForm);

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return experiments;
    return experiments.filter(e => e.status === filterStatus);
  }, [experiments, filterStatus]);

  const getOppProblem = (id: string | undefined) => {
    if (!id) return undefined;
    return opportunities.find(o => o.id === id)?.problem;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hypotheses.trim()) return;
    onAdd({
      hypotheses: form.hypotheses.trim(),
      successMetric: form.successMetric.trim(),
      deadline: form.deadline,
      status: 'hypothesis',
      notes: form.notes.trim(),
      opportunityId: form.opportunityId || undefined,
    });
    setModalOpen(false);
    setForm(emptyForm);
  };

  const statuses: Array<ExperimentStatus | 'all'> = ['all', 'hypothesis', 'running', 'validated', 'invalidated'];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 bg-zinc-800 border border-zinc-700 rounded-lg p-1">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          New Experiment
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-zinc-500">
        {filtered.length} experiment{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(exp => (
          <ExperimentCard
            key={exp.id}
            experiment={exp}
            opportunityProblem={getOppProblem(exp.opportunityId)}
            onUpdate={onUpdate}
          />
        ))}
        {filtered.length === 0 && (
          <div className="lg:col-span-2 text-center py-12 text-zinc-500 text-sm">
            No experiments in this status.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Experiment" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Hypothesis *
            </label>
            <textarea
              required
              rows={3}
              value={form.hypotheses}
              onChange={e => setForm(f => ({ ...f, hypotheses: e.target.value }))}
              placeholder="If I do X, then Y will happen because Z..."
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Success Metric *
            </label>
            <input
              required
              type="text"
              value={form.successMetric}
              onChange={e => setForm(f => ({ ...f, successMetric: e.target.value }))}
              placeholder="Measurable outcome"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Linked Opportunity
              </label>
              <select
                value={form.opportunityId}
                onChange={e => setForm(f => ({ ...f, opportunityId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">None</option>
                {opportunities
                  .filter(o => o.status === 'active')
                  .map(o => (
                    <option key={o.id} value={o.id}>
                      {o.problem.slice(0, 40)}…
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Experiment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
