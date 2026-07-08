# CLAUDE.md

## What this is

**aicivsim** ("AI Civilization Simulator", live at aicivsim.com) is a **static Next.js content/dashboard site**, not a running simulation engine. It presents a set of hand-authored narrative scenarios — climate futures, a 50-year policy-branch trajectory, workforce transition projections, a civic governance framework, a "strategy" action catalog, and a research essay — through six themed dashboards. The framing language ("simulate," "branching futures," "12 branching 50-year futures") describes the *content*, not a computation that happens in this codebase. There is no code in this repo that runs a simulation, evolves agent state over time, or generates the numbers shown — every number is pre-baked into a static JSON file or a hardcoded object literal in a page component.

## Architecture

- **Next.js 14 App Router, static export** (`next.config.js`: `output: "export"`). No server, no API routes exist in the current tree (`app/api` is absent). The README notes an OpenAI-backed "AI report generator" existed for local dev but its routes are not present in this checkout — `openai` is a listed dependency but unused in current code (no `grep` hits outside `package.json`).
- **Pages** (`app/*/page.tsx`): one route per dashboard — `climate`, `simulation`, `transition`, `civilization`, `governance`, `strategy`, `blog`, `research`. Each is a client component (`"use client"`) that reads a static JSON file or a hardcoded const, and renders it via Recharts + Tailwind.
- **Data** (`public/data/*.json`): `civilization.json`, `climate.json`, `governance.json`, `simulation.json` (15,796 lines — by far the largest), `transition.json`. These are fetched/imported at build or render time and are the only "state" in the app. There is no script in the repo that produces them — they were generated or written externally and checked in as final artifacts.
- **Blog** (`content/posts/*.mdx`, `lib/blog.ts`): remark/gray-matter MDX loader for 9 blog posts describing build decisions and scenario design.
- **Research essay** (`content/research-paper.mdx`, `app/research/`): an 839-line MDX policy essay ("Reclaiming the Future: AI Alignment, Societal Resilience, and Civilization Trajectories") rendered as a long-form doc with a table of contents. This is prose, not executable content.

## The core "dynamics" (what's actually there)

There are no agents and no update rules anywhere in the codebase. What exists instead:

1. **`simulation.json`** — a single scenario (`"baseline-vs-civic-dividend"`) with **12 runs**. Each run is one fixed combination of three policy parameters (`civic_dividend_rate` ∈ {0.02, 0.05, 0.1}, `ai_charter` ∈ {false, true}, `climate_capex_share` ∈ {0.15, 0.25}) and a **single 50-year trajectory** (2027–2076) of one global aggregate state: `population`, `economy` (gdp, gini, civic_trust, ai_influence), `climate` (emissions, resilience), `governance`. This is one civilization, not several — the "12 futures" are 12 independent alternate timelines for the *same* single entity, not 12 entities coexisting or interacting. `app/simulation/page.tsx` lets a user pick which of the 12 precomputed runs to view and chart; it does not compute new ones.
2. **`climate.json`** — four named scenarios (`aggressive`, …), each a set of hand-specified year-by-year arrays (temp rise, sea level, CO₂ ppm, biodiversity, renewable share, crop yield). Pure lookup data, selected via UI tabs.
3. **`strategy/page.tsx`** — `strategyScores`, `aggregateProjection`, and `POLICY_ACTIONS`/`SIM_ACTIONS` are hardcoded object literals keyed by scenario name or action id (cost/difficulty/impact are authored numbers, not computed). The one piece of live client-side arithmetic in the entire app is the "Impact Simulator": selecting a subset of static actions sums their `co2_kg_yr` fields (`POLICY_ACTIONS.reduce((a,c) => a + c.co2_kg_yr, 0)`) — a linear sum over a static table, nothing more.
4. **`civilization.json` / `governance.json`** — UX journey maps, charter/pillar descriptions, citizen-assembly and audit-trail *narrative* content (steps, touchpoints, completion rates as flavor stats), not simulated processes.

`NOTABLE_RUNS` and `BLOG_INSIGHTS` in `app/simulation/page.tsx` reference "Run 218," "Run 103," "millions of branches" — these are narrative flavor text; the actual data file contains exactly 12 runs. Treat any in-app copy about branch counts or emergent dynamics as marketing language, not a description of executing code.

## Entities and what they "control"

- **The only modeled entity is a single global civilization** (Earth-scale aggregate), per branch, in `simulation.json`. There are no sub-national, sub-population, or multi-agent entities anywhere with independent state.
- **The user (site visitor)** is the only actor with agency in this codebase: they select which precomputed scenario/branch/tab to view. No entity in the code makes a decision, takes an action that changes another entity's situation, or reasons about anything.

## Working in this repo

- To change what a dashboard shows, edit the corresponding `public/data/*.json` (data) or the hardcoded consts in the matching `app/*/page.tsx` (presentation-layer scores/copy) — there is no generator to run.
- `npm run build` produces a static export to `out/`; that's what's deployed to aicivsim.com. There is no `dev`-only server behavior beyond the (currently absent) AI report generator mentioned in the README.
