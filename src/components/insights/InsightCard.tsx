import React, { useState } from 'react';
import {
  ArrowUpRight,
  FileDown,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { Insight, Opportunity, ScoringWeights } from '../../types';
import { Badge } from '../ui/Badge';
import { exportInsightMarkdown } from '../../lib/export';
import { computeScore } from '../../lib/scoring';
import { Modal } from '../ui/Modal';

interface InsightCardProps {
  insight: Insight;
  onUpdate: (insight: Insight) => void;
  onDelete: (id: string) => void;
  onPromote: (
    insightId: string,
    data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'experiments'>
  ) => void;
  scoringWeights: ScoringWeights;
}

interface PromoteFormData {
  problem: string;
  audience: string;
  offer: string;
  channel: string;
  rationale: string;
  tradeoffs: string;
  nextAction: string;
  marketSize: number;
  feasibility: number;
  differentiation: number;
  urgency: number;
  alignment: number;
}

export function InsightCard({ insight, onUpdate, onDelete: _onDelete, onPromote, scoringWeights }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteForm, setPromoteForm] = useState<PromoteFormData>({
    problem: insight.title,
    audience: '',
    offer: '',
    channel: '',
    rationale: '',
    tradeoffs: '',
    nextAction: insight.nextStep,
    marketSize: 5,
    feasibility: 5,
    differentiation: 5,
    urgency: 5,
    alignment: 5,
  });

  const handleReject = () => {
    onUpdate({ ...insight, status: 'rejected', updatedAt: new Date().toISOString() });
  };

  const handleReactivate = () => {
    onUpdate({ ...insight, status: 'active', updatedAt: new Date().toISOString() });
  };

  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawScore = {
      marketSize: promoteForm.marketSize,
      feasibility: promoteForm.feasibility,
      differentiation: promoteForm.differentiation,
      urgency: promoteForm.urgency,
      alignment: promoteForm.alignment,
    };
    const score = computeScore(rawScore, scoringWeights);
    onPromote(insight.id, {
      problem: promoteForm.problem,
      audience: promoteForm.audience,
      offer: promoteForm.offer,
      channel: promoteForm.channel,
      score,
      rationale: promoteForm.rationale,
      tradeoffs: promoteForm.tradeoffs,
      nextAction: promoteForm.nextAction,
      tags: insight.tags,
      sources: insight.sources,
      status: 'active',
      insightId: insight.id,
    });
    setPromoteOpen(false);
  };

  const confidenceColors: Record<string, string> = {
    high: 'border-l-emerald-400',
    medium: 'border-l-amber-400',
    low: 'border-l-red-400',
  };

  return (
    <>
      <div
        className={`bg-zinc-800 border border-zinc-700 border-l-2 ${confidenceColors[insight.confidence]} rounded-xl p-4 transition-colors ${insight.status === 'rejected' ? 'opacity-50' : ''}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={insight.confidence}>{insight.confidence} confidence</Badge>
              <Badge variant={insight.status}>{insight.status}</Badge>
              {insight.promotedTo && (
                <Badge variant="indigo">promoted</Badge>
              )}
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Zap size={10} className="text-amber-400" />
                impact {insight.impact}/10
              </span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mt-2 leading-snug">
              {insight.title}
            </h3>
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Description preview */}
        <p className={`text-xs text-zinc-400 mt-2 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {insight.description}
        </p>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 space-y-3 border-t border-zinc-700 pt-3">
            {insight.origin && (
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Origin</span>
                <p className="text-xs text-zinc-300 mt-1">{insight.origin}</p>
              </div>
            )}
            {insight.evidence && (
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Evidence</span>
                <p className="text-xs text-zinc-300 mt-1">{insight.evidence}</p>
              </div>
            )}
            {insight.nextStep && (
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Next Step</span>
                <p className="text-xs text-zinc-300 mt-1">{insight.nextStep}</p>
              </div>
            )}
            {insight.sources.length > 0 && (
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Sources</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {insight.sources.map((src, i) => (
                    <Badge key={i} variant={src.type}>
                      {src.type}: {src.label.slice(0, 30)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {insight.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {insight.tags.map(tag => (
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
          {insight.status !== 'rejected' && !insight.promotedTo && (
            <button
              onClick={() => setPromoteOpen(true)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowUpRight size={13} />
              Promote
            </button>
          )}
          <button
            onClick={() => exportInsightMarkdown(insight)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <FileDown size={13} />
            Export
          </button>
          {insight.status !== 'rejected' ? (
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

      {/* Promote Modal */}
      <Modal
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        title="Promote to Opportunity"
        size="xl"
      >
        <form onSubmit={handlePromoteSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Problem Statement *</label>
              <textarea
                required
                rows={2}
                value={promoteForm.problem}
                onChange={e => setPromoteForm(f => ({ ...f, problem: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Target Audience *</label>
              <input
                required
                type="text"
                value={promoteForm.audience}
                onChange={e => setPromoteForm(f => ({ ...f, audience: e.target.value }))}
                placeholder="Who has this problem?"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Offer *</label>
              <input
                required
                type="text"
                value={promoteForm.offer}
                onChange={e => setPromoteForm(f => ({ ...f, offer: e.target.value }))}
                placeholder="What solution will you offer?"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Channel</label>
              <input
                type="text"
                value={promoteForm.channel}
                onChange={e => setPromoteForm(f => ({ ...f, channel: e.target.value }))}
                placeholder="How will you reach them?"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Next Action</label>
              <input
                type="text"
                value={promoteForm.nextAction}
                onChange={e => setPromoteForm(f => ({ ...f, nextAction: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Rationale</label>
              <textarea
                rows={2}
                value={promoteForm.rationale}
                onChange={e => setPromoteForm(f => ({ ...f, rationale: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Trade-offs</label>
              <textarea
                rows={2}
                value={promoteForm.tradeoffs}
                onChange={e => setPromoteForm(f => ({ ...f, tradeoffs: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Scoring sliders */}
          <div className="border-t border-zinc-700 pt-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Initial Scores (1-10)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    {label}: {promoteForm[key]}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={promoteForm[key]}
                    onChange={e =>
                      setPromoteForm(f => ({ ...f, [key]: parseInt(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-zinc-900 rounded-lg">
              <span className="text-xs text-zinc-400">Computed Total: </span>
              <span className="text-sm font-bold text-indigo-400">
                {computeScore(
                  {
                    marketSize: promoteForm.marketSize,
                    feasibility: promoteForm.feasibility,
                    differentiation: promoteForm.differentiation,
                    urgency: promoteForm.urgency,
                    alignment: promoteForm.alignment,
                  },
                  scoringWeights
                ).total.toFixed(1)}
                /10
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPromoteOpen(false)}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Opportunity
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
