#!/usr/bin/env node
/**
 * obsidian-sync.js
 *
 * Converts a microentr cockpit JSON export into Obsidian-compatible Markdown notes.
 *
 * Usage:
 *   node scripts/obsidian-sync.js --input microentr-export-2026-03-20.json --vault ~/Documents/MyVault/microentr
 *
 * Output structure inside --vault:
 *   insights/        → one .md per insight
 *   opportunities/   → one .md per opportunity
 *   experiments/     → one .md per experiment
 *   decisions/       → one .md per decision log entry
 *   _index.md        → overview note with counts and links
 */

const fs = require('fs');
const path = require('path');

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const inputFile = getArg('--input');
const vaultDir  = getArg('--vault');

if (!inputFile || !vaultDir) {
  console.error('Usage: node scripts/obsidian-sync.js --input <file.json> --vault <vault-folder>');
  process.exit(1);
}

// ── Load JSON ─────────────────────────────────────────────────────────────────

const raw = fs.readFileSync(path.resolve(inputFile), 'utf8');
const state = JSON.parse(raw);

const { insights = [], opportunities = [], experiments = [], decisionLog = [] } = state;

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeNote(dir, filename, content) {
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function sourcesSection(sources) {
  if (!sources || sources.length === 0) return '';
  const lines = sources.map(s =>
    `- [${s.type.toUpperCase()}] ${s.label}${s.url ? ` — ${s.url}` : ''}${s.date ? ` (${s.date})` : ''}`
  );
  return `\n## Sources\n${lines.join('\n')}\n`;
}

// ── Insights ──────────────────────────────────────────────────────────────────

function insightToMd(insight) {
  const linkedOpp = insight.promotedTo
    ? `\n## Promoted To\n[[opportunities/opportunity-${insight.promotedTo}]]\n`
    : '';

  return `---
id: ${insight.id}
type: insight
title: "${insight.title.replace(/"/g, "'")}"
confidence: ${insight.confidence}
impact: ${insight.impact}
status: ${insight.status}
created: ${insight.createdAt}
updated: ${insight.updatedAt}
tags: [${insight.tags.map(t => `microentr, ${t}`).join(', ')}]
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
${sourcesSection(insight.sources)}${linkedOpp}`;
}

// ── Opportunities ─────────────────────────────────────────────────────────────

function opportunityToMd(opp) {
  const linkedInsight = opp.insightId
    ? `\n## Origin Insight\n[[insights/insight-${opp.insightId}]]\n`
    : '';

  const linkedExperiments = opp.experiments && opp.experiments.length > 0
    ? `\n## Experiments\n${opp.experiments.map(id => `- [[experiments/experiment-${id}]]`).join('\n')}\n`
    : '';

  return `---
id: ${opp.id}
type: opportunity
problem: "${opp.problem.replace(/"/g, "'")}"
score: ${opp.score.total}
status: ${opp.status}
created: ${opp.createdAt}
updated: ${opp.updatedAt}
tags: [${opp.tags.map(t => `microentr, ${t}`).join(', ')}]
---

# Opportunity: ${opp.problem}

## Audience
${opp.audience}

## Offer
${opp.offer}

## Channel
${opp.channel}

## Score
| Dimension | Score |
|---|---|
| Market Size | ${opp.score.marketSize}/10 |
| Feasibility | ${opp.score.feasibility}/10 |
| Differentiation | ${opp.score.differentiation}/10 |
| Urgency | ${opp.score.urgency}/10 |
| Alignment | ${opp.score.alignment}/10 |
| **Total** | **${opp.score.total}/10** |

## Rationale
${opp.rationale}

## Trade-offs
${opp.tradeoffs}

## Next Action
${opp.nextAction}
${sourcesSection(opp.sources)}${linkedInsight}${linkedExperiments}`;
}

// ── Experiments ───────────────────────────────────────────────────────────────

function experimentToMd(exp) {
  const linkedOpp = exp.opportunityId
    ? `\n## Linked Opportunity\n[[opportunities/opportunity-${exp.opportunityId}]]\n`
    : '';

  const result = exp.result ? `\n## Result\n${exp.result}\n` : '';

  return `---
id: ${exp.id}
type: experiment
status: ${exp.status}
deadline: ${exp.deadline}
created: ${exp.createdAt}
updated: ${exp.updatedAt}
tags: [microentr, experiment]
---

# Experiment

## Hypothesis
${exp.hypotheses}

## Success Metric
${exp.successMetric}

## Notes
${exp.notes || '_No notes yet._'}
${result}${linkedOpp}`;
}

// ── Decision Log ──────────────────────────────────────────────────────────────

function decisionToMd(entry) {
  const linkedTo = entry.linkedTo
    ? `\n## Linked To\n[[${entry.linkedTo.type}s/${entry.linkedTo.type}-${entry.linkedTo.id}]]\n`
    : '';

  const outcome = entry.outcome ? `\n## Outcome\n${entry.outcome}\n` : '';

  return `---
id: ${entry.id}
type: decision
date: ${entry.date}
tags: [microentr, decision]
---

# Decision — ${entry.date}

## Decision
${entry.decision}

## Context
${entry.context}

## Rationale
${entry.rationale}
${outcome}${sourcesSection(entry.sources)}${linkedTo}`;
}

// ── Index note ────────────────────────────────────────────────────────────────

function buildIndex() {
  const date = new Date().toISOString().split('T')[0];

  const insightLinks = insights
    .map(i => `- [[insights/insight-${i.id}|${i.title}]] — ${i.status}, impact ${i.impact}/10`)
    .join('\n') || '_None_';

  const oppLinks = opportunities
    .map(o => `- [[opportunities/opportunity-${o.id}|${o.problem}]] — ${o.status}, score ${o.score.total}/10`)
    .join('\n') || '_None_';

  const expLinks = experiments
    .map(e => `- [[experiments/experiment-${e.id}]] — ${e.status}`)
    .join('\n') || '_None_';

  const decLinks = decisionLog
    .map(d => `- [[decisions/decision-${d.id}|${d.date}: ${d.decision.slice(0, 60)}]]`)
    .join('\n') || '_None_';

  return `---
type: index
generated: ${date}
tags: [microentr]
---

# Microentr Cockpit — Index

> Generated from export on ${date}. Re-run \`obsidian-sync.js\` to update.

## Insights (${insights.length})
${insightLinks}

## Opportunities (${opportunities.length})
${oppLinks}

## Experiments (${experiments.length})
${expLinks}

## Decision Log (${decisionLog.length})
${decLinks}
`;
}

// ── Write all notes ───────────────────────────────────────────────────────────

const vault = path.resolve(vaultDir);
const dirs = {
  insights:      path.join(vault, 'insights'),
  opportunities: path.join(vault, 'opportunities'),
  experiments:   path.join(vault, 'experiments'),
  decisions:     path.join(vault, 'decisions'),
};

Object.values(dirs).forEach(ensureDir);

let count = 0;

for (const insight of insights) {
  writeNote(dirs.insights, `insight-${insight.id}.md`, insightToMd(insight));
  count++;
}

for (const opp of opportunities) {
  writeNote(dirs.opportunities, `opportunity-${opp.id}.md`, opportunityToMd(opp));
  count++;
}

for (const exp of experiments) {
  writeNote(dirs.experiments, `experiment-${exp.id}.md`, experimentToMd(exp));
  count++;
}

for (const entry of decisionLog) {
  writeNote(dirs.decisions, `decision-${entry.id}.md`, decisionToMd(entry));
  count++;
}

writeNote(vault, '_index.md', buildIndex());

console.log(`✓ Synced ${count} notes + _index.md → ${vault}`);
console.log(`  insights:      ${insights.length}`);
console.log(`  opportunities: ${opportunities.length}`);
console.log(`  experiments:   ${experiments.length}`);
console.log(`  decisions:     ${decisionLog.length}`);
