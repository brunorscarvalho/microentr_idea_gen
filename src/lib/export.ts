import { Insight, Opportunity, AppState } from '../types';

function insightToMarkdown(insight: Insight): string {
  return `---
id: ${insight.id}
type: insight
title: "${insight.title}"
confidence: ${insight.confidence}
impact: ${insight.impact}
status: ${insight.status}
created: ${insight.createdAt}
tags: [${insight.tags.join(', ')}]
---

# ${insight.title}

## Description
${insight.description}

## Origin
${insight.origin}

## Evidence
${insight.evidence}

## Next Step
${insight.nextStep}

## Sources
${insight.sources.map(s => `- [${s.type.toUpperCase()}] ${s.label}${s.url ? ` — ${s.url}` : ''}`).join('\n')}
`;
}

function opportunityToMarkdown(opp: Opportunity): string {
  return `---
id: ${opp.id}
type: opportunity
problem: "${opp.problem}"
score: ${opp.score.total}
status: ${opp.status}
created: ${opp.createdAt}
tags: [${opp.tags.join(', ')}]
---

# Opportunity: ${opp.problem}

## Audience
${opp.audience}

## Offer
${opp.offer}

## Channel
${opp.channel}

## Score
- Market Size: ${opp.score.marketSize}/10
- Feasibility: ${opp.score.feasibility}/10
- Differentiation: ${opp.score.differentiation}/10
- Urgency: ${opp.score.urgency}/10
- Alignment: ${opp.score.alignment}/10
- **Total: ${opp.score.total}/10**

## Rationale
${opp.rationale}

## Trade-offs
${opp.tradeoffs}

## Next Action
${opp.nextAction}
`;
}

export function exportToJSON(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `microentr-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportInsightMarkdown(insight: Insight): void {
  const blob = new Blob([insightToMarkdown(insight)], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `insight-${insight.id}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportOpportunityMarkdown(opp: Opportunity): void {
  const blob = new Blob([opportunityToMarkdown(opp)], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `opportunity-${opp.id}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
