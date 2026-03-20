# CLAUDE.md — Rules for this repository

This file governs how Claude (and contributors) should work on this codebase.
Read it before making any changes.

## Project purpose

A local-first, single-user cockpit for microentrepreneurship opportunity management.
It is a **thinking tool**, not a task manager or CRM.

## Philosophy

- **Simplicity over completeness.** One file that works is better than five abstractions that might.
- **Readable data.** JSON exports must be human-readable. Markdown exports must be valid Obsidian notes.
- **No backend unless explicitly requested.** All state lives in `localStorage`. Period.
- **Single-user assumptions everywhere.** No auth, no multi-tenancy, no permissions.

## Architecture

```
src/
  types/index.ts       — All data types. Single source of truth.
  lib/
    scoring.ts         — Pure functions. No side effects. Testable.
    storage.ts         — localStorage read/write. Thin wrapper only.
    export.ts          — JSON and Markdown export. Must produce valid output.
  data/seed.ts         — Seed data. Must be coherent (IDs cross-reference correctly).
  hooks/useStore.ts    — All state management. useReducer + localStorage sync.
  components/          — One folder per section. Keep components focused.
  App.tsx              — Layout + routing only. No business logic here.
```

## Data flow

```
localStorage → useStore (useReducer) → components (props only)
                    ↑
              seed data (fallback)
```

Components receive data and callbacks as props. They do not call `useStore` directly (except top-level App.tsx).

## Rules

### Types
- Never use `any`. Use `unknown` and narrow it.
- If you add a field to a type, update seed data AND export functions.
- `AppState` is the canonical shape for import/export. Never break it.

### Scoring
- The five-dimension scoring model is intentional. Do not simplify it.
- `computeScore()` is a pure function — keep it that way.
- Changing weights must recompute ALL opportunity scores — this is handled in the reducer.
- Score display: always show the total prominently, dimensions on expand.

### Storage
- The storage key is `microentr_cockpit_v1`. If you change the data schema in a breaking way, bump to `v2` and write a migration.
- Never call `localStorage` directly outside `lib/storage.ts`.

### Export
- JSON export must include the full `AppState` with `lastUpdated`.
- Markdown export must use YAML frontmatter compatible with Obsidian.
- Frontmatter fields: `id`, `type`, `title` (or `problem`), `status`, `created`, `tags`.
- Never add HTML or JSX to exported Markdown.

### Discovery Mode
- Discovery Mode uses rule-based logic only in v1. No API calls.
- Rules live in `DiscoveryMode.tsx` in the `generateHypotheses()` function.
- Each rule type has a stable `type` key used for display and styling.
- New rules should follow the existing pattern: filter → map → push to results array.

### Components
- Each section component receives only the props it needs (no full store pass-through).
- Forms are inline (not separate files) unless they exceed ~100 lines.
- Use `useMemo` for derived data (tag stats, blind spot analysis, etc.).
- Never fetch data from the network in components.

### Styling
- Dark theme: zinc-950 background, zinc-900 surfaces, zinc-800 cards.
- Indigo for primary actions, emerald for high scores/success, amber for medium, red for low/error.
- Source type colors: indigo (vault), sky (web), violet (history), zinc (derived).
- No custom CSS — Tailwind utilities only. Exception: `src/index.css` for base resets.

## Obsidian integration (planned)

When implementing Obsidian integration:
1. Do NOT read vault files directly from the browser (security model prevents this).
2. Use a Node.js script (`scripts/obsidian-sync.js`) that reads vault files and produces a JSON file.
3. The cockpit imports that JSON via the existing `importFromJSON` action.
4. Map Obsidian frontmatter to cockpit types — document the mapping in the script.

## Adding a new section

1. Add section ID to `SectionId` type in `Sidebar.tsx`
2. Add nav item to `navItems` array in `Sidebar.tsx`
3. Create `src/components/<section>/` folder with component file
4. Add route case in `App.tsx`
5. Pass only the data the section needs as props

## Testing

- No test framework is set up yet. When adding tests, use Vitest (it's included with Vite ecosystem).
- Priority order: scoring functions first, then storage, then export.
- Components are secondary — test logic, not rendering.

## What NOT to do

- Do not add a backend, database, or cloud service without explicit user request.
- Do not add authentication.
- Do not use `any` in TypeScript.
- Do not break the `AppState` type in a way that invalidates existing exports.
- Do not add global state managers (Redux, Zustand, etc.) — `useReducer` is sufficient.
- Do not add routing libraries — single-page section switching is intentional.
- Do not add animation libraries — Tailwind transitions are sufficient.
- Do not commit `.env` files or any secrets.
