# CLAUDE.md — AI Civilization Simulator (aicivsim)

Guidance for Claude Code when working in this repository.

## What this repo is

Two sites live side by side in one repo:

1. **`public/layoutUpdate/` — the LIVE site** (aicivsim.com, Hostinger shared hosting).
   Vanilla HTML/CSS/JS, no build step. Runs on the **v3 design system**
   (see below); motion.dev and three.js load from CDN. Editorial dark
   design. This is where almost all active work happens.
2. **`app/` — the original Next.js 14 app** (App Router, static export via
   `output:"export"`). Kept for the blog/research pipeline and history. It does
   NOT link to or share code with layoutUpdate.

Branches: `main` = Next.js original · `layoutUpdate-v2` = current live site ·
`dynamic` = Node server experiment. Live deploys are manual uploads to Hostinger
`public_html/` (see README "Deploying to Hostinger").

## Golden rules

- **Bump the cache version on every deploy-bound change.** Every HTML file
  references `css/v3.css?v=YYYYMMDDx`, `js/v3.js`, `js/shared.js` (and where
  used `js/v3-data.js`, `css/v3-bridge.css`, `css/v3-instrument.css`), and
  `shared.js` injects `js/chat-widget.js?v=YYYYMMDDx`. Find/replace the version
  string across ALL HTML files in `public/layoutUpdate/` AND in `js/shared.js`
  before deploy. Use the `bump-cache-version` skill.
- **The site runs on the v3 design system.** `css/v3.css` + `js/v3.js`,
  with `css/v3-bridge.css` (old-vocabulary documents like `paper.html`)
  and `css/v3-instrument.css` (the 3D HUDs). `css/style.css` is retired —
  nothing loads it. **`design-system.html` is the living spec**; read it
  in a browser before designing anything, and see the `design-system`
  skill for the rules that are easy to break (one scenario control per
  page; one menu open ever — never via CSS `:focus-within`; the scenario
  control *is* the chart legend; BAU default persisted sitewide).
- **`js/shared.js` is still the data source of truth** — scenarios and colors
  (`SCENARIOS`), the command palette (`CMD_ITEMS`), cross-system weights
  (`CROSS_SYSTEM`), per-system timeseries (`VIZ_METRICS`), the simulation engine
  (`SIM_ENGINE`, `simWorldState`), the action catalog (`STRATEGY_CATALOG` —
  20 actions across personal/organization/policy, `stratStatusRank()`; shared
  by `strategy.html` and `pathways.html`), chart renderers (`scenarioChart`,
  `timelineSVG`), footer, command palette, and theme. Add data/pages there, not
  in per-page copies.
- **Nav, chrome, and page shells come from `js/v3.js`** (`V3.boot`,
  `V3.nav/deck/footer`, `V3.systemPage`) — not from `shared.js`'s
  `renderSiteNav`/`renderFooter`, which now serve only legacy pages.
- **`js/v3-data.js` is machine-extracted** from the original pages' inline
  scripts (climate/AI/governance/transition/civilization data). Regenerate it
  with the extractor rather than hand-editing.
- **Two features are intentionally switched off**, both one-line reversible:
  the **Advisor** (`ADVISOR_ENABLED` at the bottom of `shared.js`, plus its nav
  entry in `v3.js`) and the **Globe / Knowledge Explorer** links (the
  "In development" block on `visualizer.html` and the palette entries in
  `shared.js`). The pages and engines are intact.
- **Known duplication:** `viz.html` and `xr.html` each carry a copy of
  `SYS`/`SC_META`/`SUB_NODE_DATA`/`SUB_SUB_NODE_DATA` ("mirrors viz.html").
  If you change scores/projections, change BOTH files (or better, promote the
  block into shared.js).
- **No frameworks in layoutUpdate.** three.js 0.160 loads from jsdelivr via an
  importmap inside the three 3D pages only. Everything else is hand-rolled.

## Architecture of a layoutUpdate page

- Content pages (index, ai, climate, …): classic pattern —
  masthead → `#site-nav-mount` → sticky `.control-bar` with tabs +
  scenario buttons → sections of `.grid`/`.cell` → `#page-footer`.
  At the bottom: `renderSiteNav()/initSiteNav()/renderFooter()` from shared.js,
  page-local `render(scenario)` re-renders everything on scenario switch via
  `initScenarioSelector` (hash `#aggressive|moderate|bau|worst` + localStorage
  `aicivsim-scenario`).
- Fullscreen 3D apps (`viz.html`, `explorer.html`, `xr.html`): own canvas UI,
  no site nav/footer. shared.js loads first (classic script), then an
  importmap + `<script type="module">`. They read shared.js globals via
  `window.*`. Each has a boot watchdog overlay that reports CDN/module
  failures. The chat widget is deliberately NOT injected on these three pages
  (see the injector at the bottom of shared.js).
- Scenario persistence: 3D pages read `getScenarioFromHash()` on boot and call
  `setScenarioHash()` on switch — keep this when adding pages.
- **Live data layer** (`js/live-data.js` + `data.html`): fetches current
  real-world baselines client-side (NOAA/global-warming.org, OWID grapher CSV,
  World Bank v2) with sessionStorage caching and graceful fallback to the
  static baked-in values. See "Live data" below.

## Scenario system (applies everywhere)

Four scenarios with fixed ids and colors — never rename:
`aggressive` #4ecdc4 · `moderate` #5da5da · `bau` #e8a838 · `worst` #d4622a.
Scores are 0–100; `scAt(today, proj, year)` lerps 2026→2050. Grades via
`grade()`; note shared.js `grade()` uses different thresholds than the local
copies in viz/xr — don't mix them within one panel.

## Design system

`css/style.css` + `public/layoutUpdate/styleguide.md` (Feltron reference).
Typography: Space Grotesk (display), Inter (body), JetBrains Mono (numerals).
Tokens: `--bg:#111`, text tiers `--text-primary/secondary/muted/faint`,
accent `--accent:#d4622a`. Type classes `t1…t4`, `num-*`, `score-*`.
Layout: `.page` (1080px), `.grid grid-N`, `.cell`, `.section`,
`.chapter-divider`. Dark is default; light mode = `body.light` overrides.
New pages must support both themes and the print stylesheet.

## Claude Code skills

`.claude/skills/` — see [SKILLS.md](SKILLS.md) for the index. `bump-cache-version`
handles the sitewide `?v=` token bump; `verify` documents how to serve and
drive `layoutUpdate` in a real browser (no build step, no test suite — a
static HTML/JS site is verified by opening it), including two things that
look like bugs but aren't: the chat widget's OPTIONS probe 501s under
`python -m http.server` (PHP-only, works on Hostinger), and the sitewide
scroll-reveal keeps newly-shown tab content at `opacity:0` for ~1s.

## Local development

```bash
cd public/layoutUpdate
python -m http.server 8080     # static site — no install, no build
# Next.js app (rarely needed):
npm install && npm run dev
```

The AI Advisor / Knowledge Explorer LLM features need `api/chat.php` (PHP,
works on Hostinger, not on python http.server) OR a user-supplied API key in
localStorage. Without either they degrade gracefully.

## Live data (js/live-data.js)

Key-free, CORS-open sources verified for client-side fetch:
- `https://global-warming.org/api/co2-api` (also temperature/methane/arctic) — JSON, ACAO:*
- OWID grapher: any `https://ourworldindata.org/grapher/{slug}.csv` (+`?csvType=filtered&tab=chart&country=~OWID_WRL` for World-only) — ACAO:*
- `https://api.worldbank.org/v2/country/WLD/indicator/{code}?format=json&mrv=1` — ACAO:*
  (envelope is `[meta, data]`; data may be null; prefer `mrv=1` over `mrnev=1`)
Fallback rule: every consumer must render fine with the static baseline if the
fetch fails — never block rendering on the network.

## Gotchas

- PowerShell is the default shell on this machine; Bash tool uses Git Bash.
- HTML files are large single-file apps (viz ≈2.1k lines, xr ≈1.9k). Prefer
  targeted edits; read the section map in git history/audits first.
- `simEra(elapsedYears)` takes YEARS SINCE 2026 and returns a string.
  `simWorldState(sc, year)` takes a calendar year (min 2027).
- Raycaster hit-spheres are invisible meshes; selection guards check
  `node.expanded > 0.3` — keep that when adding interactions.
- Footer text and hero say "2026"; blog posts are dated Feb 2026.
- `scenarioChart(opts)`'s `activeKey` renders solid/filled/boldest — the
  "main" line. `opts.secondaryKey` (added for `pathways.html`) renders at
  near-full strength too, but **dashed**, so a second highlighted scenario
  reads as clearly emphasized rather than merely "slightly less faint."
  Every other consumer of `scenarioChart` binds `activeKey` to the
  **sitewide** active scenario (the top scenario bar); `pathways.html`
  deliberately binds `activeKey` to its page-local TO scenario and
  `secondaryKey` to the sitewide FROM scenario — the inverse of every other
  page's convention. If you add another multi-scenario comparison page,
  decide explicitly which scenario owns the bold line; don't assume the
  scenario bar always gets it.
