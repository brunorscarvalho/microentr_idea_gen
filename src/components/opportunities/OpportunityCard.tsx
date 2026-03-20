import React, { useState } from 'react';
import {
  FlaskConical,
  FileDown,
  XCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Opportunity, Experiment, ScoringWeights } from '../../types';
import { Badge } from '../ui/Badge';
import { ScoreBar, TotalScoreDisplay } from '../ui/ScoreBar';
import { scoreLabel } from '../../lib/scoring';
import { exportOpportunityMarkdown } from '../../lib/export';
import { Modal } from '../ui/Modal';

interface OpportunityCardProps {
  opportunity: Opportunity;
  experiments: Experiment[];
  onUpdate: (opp: Opportunity) => void;
  onReject: (id: string) => void;
  onAddExperiment: (data: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  scoringWeights: ScoringWeights;
}

interface ExperimentFormData {
  hypotheses: string;
  successMetric: string;
  deadline: string;
  notes: string;
}

export function OpportunityCard({
  opportunity,
  experiments,
  onUpdate,
  onReject,
  onAddExperiment,
  scoringWeights: _scoringWeights,
}: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showTradeoffs, setShowTradeoffs] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expForm, setExpForm] = useState<ExperimentFormData>({
    hypotheses: '',
    successMetric: '',
    deadline: '',
    notes: '',
  });

  const linkedExperiments = experiments.filter(e => opportunity.experiments.includes(e.id));

  const handleReject = () => {
    if (window.confirm(`Mark "${opportunity.problem.slice(0, 40)}…" as rejected?`)) {
      onReject(opportunity.id);
    }
  };

  const handleReactivate = () => {
    onUpdate({ ...opportunity, status: 'active', updatedAt: new Date().toISOString() });
  };

  const handleExpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.hypotheses.trim()) return;
    onAddExperiment({
      hypotheses: expForm.hypotheses.trim(),
      successMetric: expForm.successMetric.trim(),
      deadline: expForm.deadline,
      status: 'hypothesis',
      notes: expForm.notes.trim(),
      opportunityId: opportunity.id,
    });
    setExpModalOpen(false);
    setExpForm({ hypotheses: '', successMetric: '', deadline: '', notes: '' });
  };

  const scoreClass =
    opportunity.score.total >= 8
      ? 'border-l-emerald-400'
      : opportunity.score.total >= 6
      ? 'border-l-amber-400'
      : opportunity.score.total >= 4
      ? 'border-l-orange-400'
      : 'border-l-red-400';

  return (
    <>
      <div
        className={`bg-zinc-800 border border-zinc-700 border-l-2 ${scoreClass} rounded-xl p-4 transition-colors ${
          opportunity.status === 'rejected' ? 'opacity-50' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={opportunity.status}>{opportunity.status}</Badge>
              <span className="text-xs text-zinc-500">{opportunity.audience.slice(0, 40)}…</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mt-2 leading-snug">
              {opportunity.problem}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <TotalScoreDisplay score={opportunity.score.total} size="md" />
            <div className="text-xs text-zinc-500">{scoreLabel(opportunity.score.total)}</div>
          </div>
        </div>

        {/* Score bars */}
        <div className="mt-3 space-y-1.5">
          <ScoreBar label="Market Size" value={opportunity.score.marketSize} />
          <ScoreBar label="Feasibility" value={opportunity.score.feasibility} />
          <ScoreBar label="Differentiation" value={opportunity.score.differentiation} />
          <ScoreBar label="Urgency" value={opportunity.score.urgency} />
          <ScoreBar label="Alignment" value={opportunity.score.alignment} />
        </div>

        {/* Expand / collapse details */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mt-3 transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide details' : 'Show details'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-zinc-700 pt-3">
            <div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Offer</span>
              <p className="text-xs text-zinc-300 mt-1">{opportunity.offer}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Channel</span>
              <p className="text-xs text-zinc-300 mt-1">{opportunity.channel}</p>
            </div>
            {opportunity.rationale && (
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Rationale</span>
                <p className="text-xs text-zinc-300 mt-1">{opportunity.rationale}</p>
              </div>
            )}
            <div>
              <button
                onClick={() => setShowTradeoffs(t => !t)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Info size={12} />
                {showTradeoffs ? 'Hide trade-offs' : 'Show trade-offs'}
              </button>
              {showTradeoffs && opportunity.tradeoffs && (
                <p className="text-xs text-zinc-400 mt-2 pl-4 border-l border-amber-400/30">
                  {opportunity.tradeoffs}
                </p>
              )}
            </div>
            {opportunity.nextAction && (
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Next Action</span>
                <p className="text-xs text-zinc-300 mt-1">{opportunity.nextAction}</p>
              </div>
            )}

            {/* Linked experiments */}
            {linkedExperiments.length > 0 && (
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Experiments ({linkedExperiments.length})
                </span>
                <div className="mt-1.5 space-y-1">
                  {linkedExperiments.map(exp => (
                    <div
                      key={exp.id}
                      className="flex items-center gap-2 text-xs text-zinc-400"
                    >
                      <Badge variant={exp.status}>{exp.status}</Badge>
                      <span className="line-clamp-1">{exp.hypotheses.slice(0, 50)}…</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {opportunity.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-700">
          {opportunity.status !== 'rejected' && (
            <button
              onClick={() => setExpModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <FlaskConical size={13} />
              Experiment
            </button>
          )}
          <button
            onClick={() => exportOpportunityMarkdown(opportunity)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <FileDown size={13} />
            Export
          </button>
          {opportunity.status !== 'rejected' ? (
            <button
              onClick={handleReject}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors ml-auto"
            >
              <XCircle size={13} />
              Reject
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-400 transition-colors ml-auto"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>

      {/* New Experiment Modal */}
      <Modal
        open={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title="New Experiment"
        size="md"
      >
        <form onSubmit={handleExpSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Hypothesis *
            </label>
            <textarea
              required
              rows={3}
              value={expForm.hypotheses}
              onChange={e => setExpForm(f => ({ ...f, hypotheses: e.target.value }))}
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
              value={expForm.successMetric}
              onChange={e => setExpForm(f => ({ ...f, successMetric: e.target.value }))}
              placeholder="Measurable outcome that confirms the hypothesis"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Deadline</label>
            <input
              type="date"
              value={expForm.deadline}
              onChange={e => setExpForm(f => ({ ...f, deadline: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Notes</label>
            <textarea
              rows={2}
              value={expForm.notes}
              onChange={e => setExpForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Additional context, constraints, or ideas..."
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setExpModalOpen(false)}
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
    </>
  );
}
