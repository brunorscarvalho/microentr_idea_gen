export type SourceType = 'vault' | 'web' | 'history' | 'derived';
export type Status = 'active' | 'paused' | 'rejected' | 'completed';
export type ExperimentStatus = 'hypothesis' | 'running' | 'validated' | 'invalidated';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface Source {
  type: SourceType;
  label: string;
  url?: string;
  date?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  origin: string;
  evidence: string;
  confidence: ConfidenceLevel;
  impact: number; // 1-10
  nextStep: string;
  tags: string[];
  sources: Source[];
  createdAt: string;
  updatedAt: string;
  status: Status;
  promotedTo?: string; // opportunity id
}

export interface ScoringWeights {
  marketSize: number;
  feasibility: number;
  differentiation: number;
  urgency: number;
  alignment: number;
}

export interface OpportunityScore {
  marketSize: number;
  feasibility: number;
  differentiation: number;
  urgency: number;
  alignment: number;
  total: number;
}

export interface Opportunity {
  id: string;
  problem: string;
  audience: string;
  offer: string;
  channel: string;
  score: OpportunityScore;
  rationale: string;
  tradeoffs: string;
  nextAction: string;
  tags: string[];
  sources: Source[];
  createdAt: string;
  updatedAt: string;
  status: Status;
  insightId?: string; // origin insight
  experiments: string[]; // experiment ids
}

export interface Experiment {
  id: string;
  hypotheses: string;
  successMetric: string;
  deadline: string;
  status: ExperimentStatus;
  notes: string;
  opportunityId?: string;
  createdAt: string;
  updatedAt: string;
  result?: string;
}

export interface DecisionLogEntry {
  id: string;
  date: string;
  decision: string;
  context: string;
  rationale: string;
  outcome?: string;
  linkedTo?: { type: 'insight' | 'opportunity' | 'experiment'; id: string };
  sources: Source[];
}

export interface AppState {
  insights: Insight[];
  opportunities: Opportunity[];
  experiments: Experiment[];
  decisionLog: DecisionLogEntry[];
  scoringWeights: ScoringWeights;
  lastUpdated: string;
}
