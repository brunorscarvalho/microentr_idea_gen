import { useReducer, useEffect, useCallback } from 'react';
import {
  AppState,
  Insight,
  Opportunity,
  Experiment,
  DecisionLogEntry,
  ScoringWeights,
  OpportunityScore,
} from '../types';
import { loadState, saveState } from '../lib/storage';
import { SEED_DATA } from '../data/seed';
import { computeScore, DEFAULT_WEIGHTS } from '../lib/scoring';

// ── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_INSIGHT'; payload: Insight }
  | { type: 'UPDATE_INSIGHT'; payload: Insight }
  | { type: 'DELETE_INSIGHT'; id: string }
  | { type: 'PROMOTE_INSIGHT'; insightId: string; opportunity: Opportunity }
  | { type: 'ADD_OPPORTUNITY'; payload: Opportunity }
  | { type: 'UPDATE_OPPORTUNITY'; payload: Opportunity }
  | { type: 'DELETE_OPPORTUNITY'; id: string }
  | { type: 'REJECT_OPPORTUNITY'; id: string }
  | { type: 'ADD_EXPERIMENT'; payload: Experiment }
  | { type: 'UPDATE_EXPERIMENT'; payload: Experiment }
  | { type: 'ADD_DECISION'; payload: DecisionLogEntry }
  | { type: 'UPDATE_SCORING_WEIGHTS'; payload: ScoringWeights }
  | { type: 'IMPORT_JSON'; payload: AppState }
  | { type: 'RESET_TO_SEED' };

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'ADD_INSIGHT':
      return {
        ...state,
        insights: [action.payload, ...state.insights],
        lastUpdated: now,
      };

    case 'UPDATE_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(i =>
          i.id === action.payload.id ? { ...action.payload, updatedAt: now } : i
        ),
        lastUpdated: now,
      };

    case 'DELETE_INSIGHT':
      return {
        ...state,
        insights: state.insights.filter(i => i.id !== action.id),
        lastUpdated: now,
      };

    case 'PROMOTE_INSIGHT': {
      const updatedInsights = state.insights.map(i =>
        i.id === action.insightId
          ? { ...i, status: 'active' as const, promotedTo: action.opportunity.id, updatedAt: now }
          : i
      );
      return {
        ...state,
        insights: updatedInsights,
        opportunities: [action.opportunity, ...state.opportunities],
        lastUpdated: now,
      };
    }

    case 'ADD_OPPORTUNITY':
      return {
        ...state,
        opportunities: [action.payload, ...state.opportunities],
        lastUpdated: now,
      };

    case 'UPDATE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.map(o =>
          o.id === action.payload.id ? { ...action.payload, updatedAt: now } : o
        ),
        lastUpdated: now,
      };

    case 'DELETE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.filter(o => o.id !== action.id),
        lastUpdated: now,
      };

    case 'REJECT_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.map(o =>
          o.id === action.id ? { ...o, status: 'rejected' as const, updatedAt: now } : o
        ),
        lastUpdated: now,
      };

    case 'ADD_EXPERIMENT':
      return {
        ...state,
        experiments: [action.payload, ...state.experiments],
        opportunities: action.payload.opportunityId
          ? state.opportunities.map(o =>
              o.id === action.payload.opportunityId
                ? { ...o, experiments: [...o.experiments, action.payload.id], updatedAt: now }
                : o
            )
          : state.opportunities,
        lastUpdated: now,
      };

    case 'UPDATE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.map(e =>
          e.id === action.payload.id ? { ...action.payload, updatedAt: now } : e
        ),
        lastUpdated: now,
      };

    case 'ADD_DECISION':
      return {
        ...state,
        decisionLog: [action.payload, ...state.decisionLog],
        lastUpdated: now,
      };

    case 'UPDATE_SCORING_WEIGHTS': {
      // Recompute all opportunity scores with new weights
      const updatedOpportunities = state.opportunities.map(o => {
        const raw: Omit<OpportunityScore, 'total'> = {
          marketSize: o.score.marketSize,
          feasibility: o.score.feasibility,
          differentiation: o.score.differentiation,
          urgency: o.score.urgency,
          alignment: o.score.alignment,
        };
        const newScore = computeScore(raw, action.payload);
        return { ...o, score: newScore, updatedAt: now };
      });
      return {
        ...state,
        scoringWeights: action.payload,
        opportunities: updatedOpportunities,
        lastUpdated: now,
      };
    }

    case 'IMPORT_JSON':
      return { ...action.payload, lastUpdated: now };

    case 'RESET_TO_SEED':
      return { ...SEED_DATA, lastUpdated: now };

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useStore() {
  const [state, dispatch] = useReducer(reducer, null, () => {
    return loadState() ?? SEED_DATA;
  });

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Insight actions ──────────────────────────────────────────────────────

  const addInsight = useCallback(
    (data: Omit<Insight, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = `ins-${Date.now()}`;
      const now = new Date().toISOString();
      dispatch({
        type: 'ADD_INSIGHT',
        payload: { ...data, id, createdAt: now, updatedAt: now },
      });
    },
    []
  );

  const updateInsight = useCallback((insight: Insight) => {
    dispatch({ type: 'UPDATE_INSIGHT', payload: insight });
  }, []);

  const deleteInsight = useCallback((id: string) => {
    dispatch({ type: 'DELETE_INSIGHT', id });
  }, []);

  const promoteInsightToOpportunity = useCallback(
    (insightId: string, oppData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'experiments'>) => {
      const id = `opp-${Date.now()}`;
      const now = new Date().toISOString();
      const opportunity: Opportunity = {
        ...oppData,
        id,
        createdAt: now,
        updatedAt: now,
        experiments: [],
        insightId,
      };
      dispatch({ type: 'PROMOTE_INSIGHT', insightId, opportunity });
    },
    []
  );

  // ── Opportunity actions ──────────────────────────────────────────────────

  const addOpportunity = useCallback(
    (data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'experiments'>) => {
      const id = `opp-${Date.now()}`;
      const now = new Date().toISOString();
      dispatch({
        type: 'ADD_OPPORTUNITY',
        payload: { ...data, id, createdAt: now, updatedAt: now, experiments: [] },
      });
    },
    []
  );

  const updateOpportunity = useCallback((opp: Opportunity) => {
    dispatch({ type: 'UPDATE_OPPORTUNITY', payload: opp });
  }, []);

  const deleteOpportunity = useCallback((id: string) => {
    dispatch({ type: 'DELETE_OPPORTUNITY', id });
  }, []);

  const rejectOpportunity = useCallback((id: string) => {
    dispatch({ type: 'REJECT_OPPORTUNITY', id });
  }, []);

  // ── Experiment actions ───────────────────────────────────────────────────

  const addExperiment = useCallback(
    (data: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = `exp-${Date.now()}`;
      const now = new Date().toISOString();
      dispatch({
        type: 'ADD_EXPERIMENT',
        payload: { ...data, id, createdAt: now, updatedAt: now },
      });
    },
    []
  );

  const updateExperiment = useCallback((experiment: Experiment) => {
    dispatch({ type: 'UPDATE_EXPERIMENT', payload: experiment });
  }, []);

  // ── Decision Log actions ─────────────────────────────────────────────────

  const addDecisionEntry = useCallback(
    (data: Omit<DecisionLogEntry, 'id'>) => {
      const id = `dec-${Date.now()}`;
      dispatch({ type: 'ADD_DECISION', payload: { ...data, id } });
    },
    []
  );

  // ── Scoring weights ──────────────────────────────────────────────────────

  const updateScoringWeights = useCallback((weights: ScoringWeights) => {
    dispatch({ type: 'UPDATE_SCORING_WEIGHTS', payload: weights });
  }, []);

  // ── Import ───────────────────────────────────────────────────────────────

  const importFromJSON = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr) as AppState;
      dispatch({ type: 'IMPORT_JSON', payload: parsed });
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetToSeed = useCallback(() => {
    dispatch({ type: 'RESET_TO_SEED' });
  }, []);

  return {
    // State
    insights: state.insights,
    opportunities: state.opportunities,
    experiments: state.experiments,
    decisionLog: state.decisionLog,
    scoringWeights: state.scoringWeights,
    lastUpdated: state.lastUpdated,
    fullState: state,

    // Actions
    addInsight,
    updateInsight,
    deleteInsight,
    promoteInsightToOpportunity,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    rejectOpportunity,
    addExperiment,
    updateExperiment,
    addDecisionEntry,
    updateScoringWeights,
    importFromJSON,
    resetToSeed,
  };
}

export const DEFAULT_SCORING_WEIGHTS = DEFAULT_WEIGHTS;
