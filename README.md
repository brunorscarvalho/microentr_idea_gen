# Microentr Cockpit

A local-first strategic cockpit for microentrepreneurship opportunity management.

## What it is

A single-page decision tool to capture insights, score opportunities, design experiments, and log decisions. Built for a single user, runs entirely in the browser — no backend, no cloud, no accounts.

Think of it as a thinking environment, not a task manager.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS (dark theme)
- localStorage for persistence
- No backend, no database, no auth

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Sections

| Section | Purpose |
|---|---|
| Overview | Dashboard with stats and top opportunities |
| Insights | Capture and manage signals from research |
| Opportunities | Scored opportunity cards with full rationale |
| Experiments | Hypothesis → validation pipeline |
| Discovery Mode | Rule-based analysis of gaps and combinations |
| Patterns | Tag frequency and co-occurrence analysis |
| Blind Spots | Automated detection of stale/unvalidated items |
| Decision Log | Chronological record of decisions with rationale |
| Source Trace | All evidence sources grouped by type |

## Data model

Every item tracks its sources with four types:
- **Vault** — from your Obsidian notes
- **Web** — from web research
- **History** — from conversations and personal experience
- **Derived** — inferred or calculated

## Persistence

Data is stored in `localStorage` under the key `microentr_cockpit_v1`. It survives browser restarts but is local to the device and browser.

## Export / Import

**Export JSON** — top-right button exports the full state as a timestamped `.json` file. Use this for backups or to transfer between devices.

**Import JSON** — top-right button accepts a previously exported `.json` file and replaces the current state.

**Export to Markdown** — individual insights and opportunities can be exported as Obsidian-compatible `.md` files from their cards (Export button).

## Scoring system

Opportunities are scored on five dimensions (each 1–10):

| Dimension | Default weight |
|---|---|
| Market Size | 25% |
| Feasibility | 20% |
| Differentiation | 25% |
| Urgency | 15% |
| Alignment | 15% |

Weights are adjustable in the Opportunities section. Changing weights recomputes all scores live.

## Roadmap

### Obsidian integration (next)
1. Create a folder watcher script that monitors your vault for tagged notes
2. Map Obsidian frontmatter fields to cockpit data types
3. Import via JSON intermediary: vault → export JSON → cockpit import

### GitHub workflow
- Commit your `localStorage` exports to a git repo on a schedule
- Or: use the JSON export as a versioned snapshot in your vault

### Future
- Filtering and search across all sections
- Multi-device sync via a simple self-hosted JSON endpoint
- Webhook integration to push Obsidian changes into the cockpit
