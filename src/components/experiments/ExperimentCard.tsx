import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Experiment, ExperimentStatus } from '../../types';
import { Badge } from '../ui/Badge';

interface ExperimentCardProps {
  experiment: Experiment;
  opportunityProblem?: string;
  onUpdate: (exp: Experiment) => void;
}

const statusFlow: ExperimentStatus[] = ['hypothesis', 'running', 'validated', 'invalidated'];

function StatusIcon({ status }: { status: ExperimentStatus }) {
  switch (status) {
    case 'hypothesis':
      return <Clock size={14} className="text-violet-400" />;
    case 'running':
      return <Play size={14} className="text-sky-400" />;
    case 'validated':
      return <CheckCircle size={14} className="text-emerald-400" />;
    case 'invalidated':
      return <XCircle size={14} className="text-red-400" />;
  }
}

function StatusProgress({ status }: { status: ExperimentStatus }) {
  const steps: ExperimentStatus[] = ['hypothesis', 'running', 'validated'];
  const currentIdx = status === 'invalidated' ? 2 : steps.indexOf(status);

  return (
    <div className="flex items-center gap-1 mt-2">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div
            className={`h-1 flex-1 rounded-full transition-colors ${
              status === 'invalidated' && idx === 2
                ? 'bg-red-400'
                : idx <= currentIdx
                ? step === 'validated'
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400'
                : 'bg-zinc-700'
            }`}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function deadlineStatus(deadline: string): { label: string; className: string } {
  if (!deadline) return { label: 'No deadline', className: 'text-zinc-500' };
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, className: 'text-red-400' };
  if (days === 0) return { label: 'Due today', className: 'text-amber-400' };
  if (days <= 7) return { label: `${days}d left`, className: 'text-amber-400' };
  return { label: `${days}d left`, className: 'text-zinc-400' };
}

export function ExperimentCard({ experiment, opportunityProblem, onUpdate }: ExperimentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingResult, setEditingResult] = useState(false);
  const [result, setResult] = useState(experiment.result ?? '');

  const dl = deadlineStatus(experiment.deadline);

  const advanceStatus = () => {
    const idx = statusFlow.indexOf(experiment.status);
    if (idx < statusFlow.length - 2) {
      // Move to next (hypothesis → running → validated, not invalidated from here)
      const next = statusFlow[idx + 1] as ExperimentStatus;
      if (next !== 'invalidated') {
        onUpdate({ ...experiment, status: next, updatedAt: new Date().toISOString() });
      }
    }
  };

  const markInvalidated = () => {
    onUpdate({ ...experiment, status: 'invalidated', updatedAt: new Date().toISOString() });
  };

  const saveResult = () => {
    onUpdate({ ...experiment, result: result.trim(), updatedAt: new Date().toISOString() });
    setEditingResult(false);
  };

  return (
    <div
      className={`bg-zinc-800 border border-zinc-700 rounded-xl p-4 ${
        experiment.status === 'invalidated' ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <StatusIcon status={experiment.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={experiment.status}>{experiment.status}</Badge>
            {opportunityProblem && (
              <span className="text-xs text-zinc-500 truncate max-w-32">
                {opportunityProblem.slice(0, 30)}…
              </span>
            )}
            <span className={`text-xs ${dl.className}`}>{dl.label}</span>
          </div>
          <p className="text-sm font-medium text-zinc-100 mt-1.5 leading-snug line-clamp-3">
            {experiment.hypotheses}
          </p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Progress bar */}
      <StatusProgress status={experiment.status} />

      {/* Expanded */}
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-zinc-700 pt-3">
          <div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Success Metric
            </span>
            <p className="text-xs text-zinc-300 mt-1">{experiment.successMetric}</p>
          </div>
          {experiment.notes && (
            <div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Notes</span>
              <p className="text-xs text-zinc-300 mt-1">{experiment.notes}</p>
            </div>
          )}
          {/* Result */}
          <div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Result</span>
            {editingResult ? (
              <div className="mt-1 space-y-2">
                <textarea
                  rows={2}
                  value={result}
                  onChange={e => setResult(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveResult}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingResult(false)}
                    className="px-3 py-1 text-zinc-400 hover:text-zinc-100 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 mt-1">
                <p className="text-xs text-zinc-400 flex-1">
                  {experiment.result || 'No result recorded yet.'}
                </p>
                <button
                  onClick={() => setEditingResult(true)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {(experiment.status === 'hypothesis' || experiment.status === 'running') && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-700">
          {experiment.status === 'hypothesis' && (
            <button
              onClick={advanceStatus}
              className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Play size={13} />
              Start Running
            </button>
          )}
          {experiment.status === 'running' && (
            <button
              onClick={advanceStatus}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <CheckCircle size={13} />
              Mark Validated
            </button>
          )}
          <button
            onClick={markInvalidated}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors ml-auto"
          >
            <XCircle size={13} />
            Invalidate
          </button>
        </div>
      )}
    </div>
  );
}
