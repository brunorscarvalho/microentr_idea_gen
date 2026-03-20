import React from 'react';
import {
  Lightbulb,
  Target,
  FlaskConical,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Insight, Opportunity, Experiment, DecisionLogEntry } from '../../types';
import { Badge } from '../ui/Badge';
import { TotalScoreDisplay, ScoreBar } from '../ui/ScoreBar';
import { scoreLabel } from '../../lib/scoring';
import { SectionId } from '../layout/Sidebar';

interface OverviewProps {
  insights: Insight[];
  opportunities: Opportunity[];
  experiments: Experiment[];
  decisionLog: DecisionLogEntry[];
  onNavigate: (section: SectionId) => void;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-left hover:border-zinc-600 transition-colors w-full"
    >
      <div className="flex items-start justify-between">
        <div className="p-2 bg-zinc-700 rounded-lg text-zinc-300">{icon}</div>
        <ArrowRight size={14} className="text-zinc-600 mt-1" />
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</div>
        <div className="text-sm font-medium text-zinc-300 mt-0.5">{label}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>
      </div>
    </button>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function Overview({
  insights,
  opportunities,
  experiments,
  decisionLog,
  onNavigate,
}: OverviewProps) {
  const activeInsights = insights.filter(i => i.status === 'active');
  const activeOpps = opportunities.filter(o => o.status === 'active');
  const runningExperiments = experiments.filter(e => e.status === 'running');

  const topOpps = [...opportunities]
    .filter(o => o.status === 'active')
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, 3);

  type ActivityItem = {
    type: 'insight' | 'experiment' | 'decision';
    label: string;
    date: string;
  };

  const activities: ActivityItem[] = [
    ...insights.slice(0, 3).map(i => ({
      type: 'insight' as const,
      label: i.title,
      date: i.updatedAt,
    })),
    ...experiments.slice(0, 2).map(e => ({
      type: 'experiment' as const,
      label: e.hypotheses.slice(0, 60) + '…',
      date: e.updatedAt,
    })),
    ...decisionLog.slice(0, 2).map(d => ({
      type: 'decision' as const,
      label: d.decision,
      date: d.date,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Lightbulb size={18} />}
          label="Insights"
          value={activeInsights.length}
          sub={`${insights.filter(i => i.status === 'active' && !i.promotedTo).length} not yet promoted`}
          onClick={() => onNavigate('insights')}
        />
        <StatCard
          icon={<Target size={18} />}
          label="Opportunities"
          value={activeOpps.length}
          sub={`${opportunities.filter(o => o.experiments.length === 0 && o.status === 'active').length} without experiments`}
          onClick={() => onNavigate('opportunities')}
        />
        <StatCard
          icon={<FlaskConical size={18} />}
          label="Experiments"
          value={runningExperiments.length}
          sub={`${experiments.filter(e => e.status === 'hypothesis').length} in hypothesis`}
          onClick={() => onNavigate('experiments')}
        />
        <StatCard
          icon={<BookOpen size={18} />}
          label="Decisions"
          value={decisionLog.length}
          sub={`${decisionLog.filter(d => !d.outcome).length} without outcome`}
          onClick={() => onNavigate('decision-log')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Top Opportunities</h2>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {topOpps.map((opp, idx) => (
              <div
                key={opp.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-zinc-900/60 border border-zinc-700/50"
              >
                <div className="w-6 h-6 rounded-md bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-zinc-400">#{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 line-clamp-2">{opp.problem}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={opp.status}>{opp.status}</Badge>
                    <span className="text-xs text-zinc-500">{opp.audience.slice(0, 40)}…</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <ScoreBar label="Market Size" value={opp.score.marketSize} />
                    <ScoreBar label="Feasibility" value={opp.score.feasibility} />
                    <ScoreBar label="Differentiation" value={opp.score.differentiation} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <TotalScoreDisplay score={opp.score.total} size="sm" />
                  <div className="text-xs text-zinc-500 mt-0.5">{scoreLabel(opp.score.total)}</div>
                </div>
              </div>
            ))}
            {topOpps.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-4">No active opportunities yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('insights')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/20 transition-colors"
              >
                <Plus size={16} />
                New Insight
              </button>
              <button
                onClick={() => onNavigate('opportunities')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-zinc-700/50 border border-zinc-600 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <Plus size={16} />
                New Opportunity
              </button>
              <button
                onClick={() => onNavigate('discovery')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-zinc-700/50 border border-zinc-600 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <TrendingUp size={16} />
                Run Discovery
              </button>
            </div>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Recent Activity</h2>
            </div>
            <div className="space-y-2.5">
              {activities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      item.type === 'insight'
                        ? 'bg-amber-400'
                        : item.type === 'experiment'
                        ? 'bg-emerald-400'
                        : 'bg-violet-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 line-clamp-2">{item.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{formatRelativeDate(item.date)}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-xs text-zinc-600">No activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
