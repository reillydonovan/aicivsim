# AI Civilization Simulator

**Live at [aicivsim.com](https://aicivsim.com)** — *AI Civilization Simulator*

Use AI to simulate, measure, and navigate civilization-scale challenges. Seven interconnected dashboards model AI alignment, climate, governance, workforce transition, civilization health, and strategy across 50 years of branching futures — a planning tool for sustainable civilization that tells the story of possible worlds.

---

## Branches

| Branch | Purpose | Stack | Hosting |
|--------|---------|-------|---------|
| `main` | Original Next.js static export | Next.js, React, Tailwind, Recharts | Any web host |
| `static` | Previous static deployment | Next.js static export | Hostinger |
| `layoutUpdate-v2` | **Current live site** — Feltron-style redesign | Vanilla HTML/CSS/JS (no framework) | Hostinger at [aicivsim.com](https://aicivsim.com) |
| `dynamic` | Full Node.js server with AI report generation | Next.js + API routes | Requires Node.js hosting |

---

## Layout Update v2 (current live site)

A complete redesign built as vanilla HTML/CSS/JS with no framework dependencies. Inspired by Nicholas Felton's annual reports — dense, editorial, narrative data design. See [`styleguide.md`](public/layoutUpdate/styleguide.md) for the full design reference.

### Architecture

```
public/layoutUpdate/
├── index.html             # Landing page — project overview, scenario guide, 7-system map
├── ai.html                # AI — alignment, transparency, safety, compute governance, autonomy risk, public trust
├── climate.html           # Climate — 7 tabs, 9 planetary metrics (incl. ocean pH), tipping points
├── simulation.html        # Simulation — 5 policy levers, 50-year timeline, narrative reports
├── transition.html        # Transition — workforce reskilling, income bridge calculator
├── civilization.html      # Civilization — composite health index, KPI trajectories, funding
├── governance.html        # Governance — charter status, assemblies, audit coverage
├── strategy.html          # Strategy — 20 actions with scenario-aware status/adoption, Today's Score + projected
├── timeline.html          # Timeline — 200K-year arc of civilization, AI as inflection point, scenario-aware futures
├── visualizer.html        # Visualizer landing page — describes the 3D experience before entering
├── viz.html               # 3D network visualization — Three.js interactive systems graph
├── research.html          # Research paper — 19 sections, TOC, print-friendly CSS for PDF export
├── about.html             # About page
├── css/style.css          # All styles — Feltron typography, responsive grid, dark theme, print styles, skeleton loading
├── js/shared.js           # Shared utilities — renderSiteNav, renderScenarioButtons, scenarioChart, chartHeader, sparkSVG, comparisonSVG, VIZ_METRICS (per-system timeseries incl. AI), SIM_ENGINE (simulation data + narrative), simWorldState, CROSS_SYSTEM (7-system feedback weights), dark/light mode, localStorage persistence, CSV export, comparison mode, animated transitions, ARIA, renderFooter
└── styleguide.md          # Feltron design guide used to build the site
```

### Key features

- **Zero dependencies** — No npm, no build step, no framework. Plain HTML/CSS/JS served as static files.
- **AI dashboard** — Dedicated `ai.html` page tracking 6 AI-specific domains: Alignment Index, Model Transparency, Safety Protocol Coverage, Compute Governance, Autonomy Safety, and Public Trust in AI. Includes 6 tabs (Overview with policy levers and 6 projection charts, Scenarios comparison grid, Safety sub-domain, Compute sub-domain, Risks with 5 threshold cards and scenario-specific notes, Milestones with 5-phase development timeline), plus always-visible cross-system impact and a 4-scenario summary panel at the bottom. Follows the same Feltron editorial pattern as every other page.
- **Visualizer landing page** — `visualizer.html` introduces the 3D experience with four editorial sections (What It Is, What You Can Do, How It Works, Controls Reference) before a prominent "Enter the Visualizer" CTA. The main nav links here; `viz.html` is the actual 3D app. A back-link in `viz.html` returns to the landing page.
- **Today's Score + Projected Score on every page** — Each dashboard and sub-tab opens with a prominent "Today's Score" (static baseline, color-coded by grade) followed by the scenario-projected score with letter grade, delta comparison, and trend. Climate sub-tabs (Biodiversity, Energy & Emissions, Resources) each display their own today/projected pair. The index page shows all seven systems with today + projected scores that update with scenario selection.
- **Standardized 4-scenario system** — All pages now use the same four scenarios (Aggressive, Moderate, BAU, Worst) with consistent colors (#4ecdc4, #5da5da, #e8a838, #d4622a). Transition was migrated from its original 3-scenario system (Baseline/Transition/Full Stack) to match.
- **Standardized chart headers** — Every graph uses a consistent `chartHeader()` function (defined in `shared.js`) that renders a Feltron domain-card style header: uppercase `t3` metric label, large `num-lg` projected value colored to the active scenario, trend arrow (green/red based on direction preference), end-year target, and baseline reference.
- **Multi-scenario comparison charts** — Every graph displays all four scenarios simultaneously. The active scenario is highlighted with a bold line and filled area; inactive scenarios are dimmed. Implemented via a unified `scenarioChart()` function in `shared.js`.
- **Narrative simulation reports** — Simulation generates natural-language dispatches from the future that evolve across four era phases (Dawn, Divergence, Maturity, Legacy). The narrative tells a human story — not a metrics readout — covering people & livelihoods, climate & energy, trust & governance, AI & the future, and the road ahead. Letter grades update dynamically.
- **Dynamic scenario-aware data** — Switching scenarios updates every chart, score, description, domain card, and narrative paragraph on every page. No static content remains when scenarios change. This includes:
  - **Governance assemblies and modules** — All 5 assemblies and 5 modules persist across scenarios with per-scenario values, grades, and status labels (Active/Limited/Dissolved/Not deployed).
  - **Governance overview metric cards** — Civic Participation, Charter Adoption, Institutional Trust, and Audit Coverage update dynamically.
  - **Transition metric cards** — Poverty Rate, Reskill Time, Placement Rate, and Employment update with scenario-specific values and descriptions.
  - **Civilization timeline** — Each milestone has per-scenario scores, grades, goal comparison, status tags, and narrative notes.
  - **Climate tipping points** — Risk levels (low/moderate/high/critical) calculated dynamically from projected temperature vs. threshold, with BREACHED indicators, margin display, and scenario-specific notes.
  - **Strategy** — Full scenario awareness with per-action status tags, adoption rates, and scenario-specific impact narratives.
  - **Index page** — Seven Systems cards (including AI) show today + projected scores, hero projected score, and scenario descriptions all update dynamically. A dedicated CTA section links to the Visualizer landing page.
- **9 climate metrics** — Temperature Rise, Sea Level Rise, CO₂ Concentration, Biodiversity Index, Renewable Share, Crop Yield Index, Water Stress, Forest Cover, and Ocean pH. Each with 4-scenario data (25 data points, 2026–2050) and scenario-specific narrative descriptions.
- **Scenario persistence (hash + localStorage)** — Active scenario is stored in the URL hash (e.g. `#aggressive`) AND in `localStorage`. Sharing a link preserves the selected scenario; navigating between pages automatically maintains the selected scenario via localStorage fallback.
- **Prev/Next page navigation** — Footer includes contextual navigation links to the previous and next page in the site order.
- **Print styles** — `@media print` CSS in `style.css` provides clean PDF export for all dashboard pages (hides nav/scenario bars, white background, proper contrast).
- **Accessibility** — ARIA `role="tablist"` / `role="tab"` / `aria-selected` on section tabs, `aria-pressed` and `aria-label` on scenario buttons, `role="img"` on chart SVGs.
- **Skeleton loading styles** — CSS shimmer animation classes (`.skeleton`, `.skeleton-chart`, `.skeleton-score`) for use during JS initialization.
- **Civilizational Timeline** — A narrative editorial page (`timeline.html`) tracing 200,000 years of human inflection points — fire, agriculture, writing, printing press, industrial revolution, computing, internet — culminating in AI as the current inflection. Three tabs: "The Arc" (visual alternating timeline with population/time-to-next-leap stats), "The Inflection" (why this decade is different, with convergence of climate/labor/democracy/inequality), and "Possible Futures" (scenario-aware era-by-era projections through 2050 with grades and verdicts).
- **3D network visualization** — `viz.html` renders all seven systems as an interactive Three.js node graph orbiting a central "Civilization" aggregate node. The perimeter nodes are Climate, Simulation, Transition, AI, Governance, and Strategy. Every node connects to every other node AND to the center, forming a full hub-and-spoke + mesh network. Features include:
  - **Scenario-aware connections** — Lines between all node pairs AND from each node to the center are colored (green positive / red negative) and opacity-scaled by cross-system influence weights from `shared.js` CROSS_SYSTEM data. Center connections use system health to scale opacity (0.06–0.36), making the hub-spoke topology clearly visible.
  - **Directional particles** — Flow along connections in the direction of stronger influence; scatter under low aggregate health.
  - **Camera fly-to** — Clicking a node smoothly animates the camera to center on it; clicking the same node again flies back to the overview. Escape also returns to overview. Dragging to orbit preserves your camera position — the view never resets on accidental clicks.
  - **Hover tooltips** — Cursor-following tooltip shows system name, score, grade, and interaction hints on all nodes including the center aggregate.
  - **Connection tooltips** — Hovering highlighted connections (when a node is selected) shows bidirectional impact percentages and effect descriptions. Center connections show the system's health score, grade, and contribution narrative to the aggregate.
  - **Node detail panel** — Clicking any node (including the center aggregate) opens a detail card showing current score, grade, projected 2050 score for the active scenario, description, and navigation hint. The projected score updates live when switching scenarios.
  - **Tipping point shockwaves** — Predefined tipping points (Arctic ice-free, governance collapse, etc.) fire red shockwave animations and text overlays when the timeline passes their threshold year.
  - **Timeline playback** — Year slider (2026–2050) with play/pause; scores, node sizes, and connection weights interpolate over time.
  - **Timeline trail** — Small spheres mark the central node's position each year during playback, color-coded by health.
  - **Scenario comparison panel** — "Compare" toggle opens a right-side data panel showing all 6 system scores + aggregate for two scenarios side-by-side with color-coded deltas. Updates live with the year slider.
  - **Globe mode** — *(Currently disabled; listed in roadmap for revisit.)* Toggle switches from hexagonal network to positions on a wireframe icosphere with great-circle arc connections. JS infrastructure remains in place.
  - **Health-driven node behavior (per-system)** — Each node independently responds to its scenario score: wireframe spin speed scales with health (fast when healthy, near-stop when critical); bob amplitude and frequency shift from gentle to erratic with high-frequency jitter below 35%; individual alarm pulse rings appear below 55% health, pulsing faster and shifting from system color to alarm orange as severity increases; glow aura scales from large/bright to small/dim; color desaturates toward gray as health drops; opacity fades on sick nodes.
  - **Collective atmosphere** — Aggregate health drives global scene state: orbit auto-rotate slows from 0.6 to 0.1; bloom dims from 1.25 to 0.25; fog thickens; ground grid shifts from cool blue to warning red; central pulse ring accelerates and reddens; center node shrinks and fades.
  - **Cosmic symphony audio** — Each of the 6 perimeter systems is a voice in a Cmaj9 chord (C3, E3, G3, B3, D4, A3). When all systems are healthy, the voices form a consonant, slowly-breathing harmonic unity — a quiet shimmer pad with each voice pulsing in sync. As individual systems deteriorate, their pitch drifts toward dissonant microtonal intervals (semitone rubs, tritones), vibrato widens and speeds up, their rhythmic pulse desyncs from the collective, and a lowpass filter muffles them. Each voice also has a quiet fifth-above shimmer that fades with health. The result: at Aggressive Action the visualization hums with a warm, unified chord; at Worst Case the chord fractures into an uneasy, beating polytonal texture — subtle enough to be ambient, expressive enough to feel the difference.
  - **Collective atmosphere audio** — Sub-bass drone sinks in pitch as aggregate health drops. Upper shimmer pad (3 partials) detunes toward minor intervals. A sub-bass alarm throb emerges gently below 35% aggregate health. Filtered noise hiss fades in below 45%. Master volume kept deliberately low (0.3) for non-intrusive ambience. Sound defaults to on, auto-initializing on the first user gesture.
  - **Smooth scenario transitions** — Switching scenarios or scrubbing the year slider never causes instant visual jumps. A per-frame lerp system (`lerpScenario`) smoothly interpolates all node sizes, colors, opacities, connection weights, bloom, fog, grid color, and auto-rotate speed toward their target values using exponential easing (~80% in 0.35s). Audio follows the same smooth path since `updateAudio()` runs every frame and reads the continuously-lerping health values.
  - **Timeline-aware sparkline charts** — When a system node is selected, the detail panel shows multi-scenario sparkline charts (via `timelineSVG()` from `shared.js`) for 2–3 headline metrics — e.g., Temperature Rise, Renewable Share, CO₂ for Climate. The chart distinguishes past from projected future: solid line up to the current year, dashed line for the remainder, with a vertical year marker and a dot on the active scenario at the current position. All four scenarios are visible; the active line is highlighted. When the center aggregate is selected, a summary sparkline per system is shown instead.
  - **Floating chart overlays** — "Charts" toggle projects mini sparkline cards onto each 3D node in screen-space, tracking node positions as the camera orbits. Each card uses the same timeline-aware chart with solid past / dashed future split, updating live with scenario and year changes.
  - **`timelineSVG()` in shared.js** — A new SVG chart function that extends `comparisonSVG` with year-index awareness: splits each scenario line into solid (past) and dashed (future) segments, draws a vertical year marker, places a dot at the current position on the active line, and fills only the past area. Used by `viz.html` for all sparkline displays.
  - **Drag-safe click handling** — Pointer-down position is tracked and compared to click position; movements greater than 6px are treated as orbit drags and ignored by the selection logic, preventing accidental node selection/deselection while rotating the scene.
  - **Centralized VIZ_METRICS data** — A `VIZ_METRICS` object in `shared.js` provides 25-point (2026–2050) timeseries for 2–3 headline metrics per system (including AI: Alignment Index + Model Transparency) across all 4 scenarios. This single data source is referenced by `viz.html` and available to all dashboard pages for cross-referencing.
  - **World State panel** — "World State" toggle opens a scrollable left-side panel showing a condensed Simulation-style narrative for the current year and scenario. Includes simulation score with grade, era label (Dawn/Divergence/Maturity/Legacy), era feel text, and five narrative sections (People & Livelihoods, Climate & Energy, Trust & Governance, AI & the Future, The Road Ahead) with a compact "by the numbers" grid showing GINI, Trust, Emissions, Resilience, and AI Influence vs baselines. Updates live as you scrub the year slider or switch scenarios. Data and narrative logic are sourced from `SIM_ENGINE` in `shared.js` — the same canonical data that powers `simulation.html` — so edits to the simulation page propagate automatically.
  - **SIM_ENGINE in shared.js** — The simulation's 44-point timeseries (2027–2070) for GINI, Trust, Emissions, Resilience, and AI Influence across all 4 scenarios, plus narrative generation functions (`simWorldState`, `simScore`, `simEra`, `simInterp`), now live in `shared.js` as a single source of truth. `simulation.html` references this instead of a local copy.
  - **Compact mode bar** — Compare, Charts, World, and Sound toggles styled as an inline button group matching the scenario bar pattern. Globe hidden pending redesign.
  - **Keyboard shortcuts** — 1–4 switch scenarios, Space toggles play, Left/Right step years, Escape deselects and returns to overview.
  - **Double-click navigation** — Double-clicking an unselected system node opens its dashboard page. Guarded against accidental triggers during deselect.
- **Responsive mobile design** — Collapsing hamburger navigation, stacked scenario selectors, single-column chart grids on small screens.
- **Research paper** — Full 19-section civic roadmap converted to Feltron style with table of contents, per-row hover states, all tables and phase cards, 16 references, and built-in `@media print` CSS for one-click PDF export via browser print.
- **JS-templated navigation** — Site nav bar, mobile hamburger toggle, and scenario buttons are generated from `shared.js` via `renderSiteNav()` and `renderScenarioButtons()`. Adding a new page or link requires editing only `PAGE_ORDER` in `shared.js`.
- **Dark / light mode** — Theme toggle in the nav bar switches between dark (default) and light mode. Preference persists in localStorage. Light mode overrides CSS custom properties for backgrounds, text, borders, and chart elements.
- **Data export (CSV)** — Every chart includes a "CSV" download button. Click to export all scenario data for that metric as a CSV file. Powered by `registerChartExport()` + `downloadCSV()` in `shared.js`.
- **Cross-system feedback loops (scenario-aware)** — Each dashboard page includes a "Cross-System Impact" panel showing how its metrics influence all other operating systems (42 total cross-system relationships across 7 systems). Weights, effect descriptions, and visual impact bars all update dynamically when the user switches scenarios — e.g., Climate's workforce displacement impact ranges from −5% under Aggressive Action to −35% under Worst Case, each with a unique narrative explanation. Every impact carries four distinct scenario texts describing how the relationship plays out under each policy configuration.
- **Interactive policy levers** — Simulation has 5 sliders; Climate (carbon tax, renewable investment, conservation target), Transition (civic dividend, reskill budget, automation pace), and Governance (charter enforcement, assembly frequency, audit coverage) each have 3 additional lever controls that adjust projected scores in real time.
- **Animated transitions** — CSS transitions on `.bar-fill`, `.num-lg`, `.score-projected`, `.tag`, `.cell`, and `.scenario-chart` elements provide smooth visual feedback when switching scenarios. `fadeSwitch()` and `animateValue()` utilities available in `shared.js`.
- **Standardized footer** — All pages use `renderFooter()` from `shared.js` with consistent branding and prev/next navigation.
- **Responsive control bar** — Tabs and scenario buttons stack into separate rows at 1200px to prevent overflow on pages with many sub-tabs (e.g., Climate with 6 tabs). Horizontal scroll on both rows at narrower widths.
- **Cache-busting** — All CSS/JS references include `?v=` query parameters (currently `20260216b`) to prevent stale browser caches after deployment. **You must bump this version on every deploy** — see [Deploying to Hostinger](#deploying-to-hostinger).

### Scenario system

Four scenarios model diverging futures across all dashboards:

| Scenario | ID | Policy configuration |
|----------|-----|---------------------|
| **Aggressive Action** | `aggressive` | 10% civic dividends, enforced AI charter, 25% climate capex, 20% reskilling, 80% transparency |
| **Moderate Reform** | `moderate` | 5% dividends, active charter, 15% capex, 10% reskilling, 50% transparency |
| **Business as Usual** | `bau` | 0% dividends, no charter, 5% capex, 3% reskilling, 20% transparency |
| **Worst Case** | `worst` | 0% dividends, no charter, 2% capex, 1% reskilling, 10% transparency |

Simulation has 5 interactive policy levers (sliders for dividend rate, climate capex, reskilling investment, governance transparency; toggle for AI charter) that dynamically resolve to the nearest scenario. Climate, Transition, and Governance each add 3 page-specific policy levers that adjust projected scores in real time.

### Simulation report system

The `generateNarrative()` function in `simulation.html` produces era-phased narrative reports for every year (2027–2070) × scenario combination:

| Era | Years | Tone |
|-----|-------|------|
| **Dawn** | 0–3 years | Cautious hope or skepticism. Reforms are new. The old systems still dominate daily life. |
| **Divergence** | 4–12 years | Paths split. People feel the difference in paychecks, air quality, public life — or they don't. |
| **Maturity** | 13–30 years | Patterns lock in. A generation grows up in a different world, or communities are left behind permanently. |
| **Legacy** | 31+ years | Long-run verdicts. A world that chose to act and lives with the rewards, or one that failed gradually. |

Each report includes sections on People & Livelihoods, Climate & Energy, Trust & Governance, AI & the Future, and The Road Ahead — written as dispatches from possible futures, not metric summaries.

### Chart system

All charts are rendered via two shared functions in `shared.js`:

**`chartHeader(opts)`** — Renders the header above each chart:
- Uppercase `t3` metric label (e.g., `TEMPERATURE RISE`)
- Large `num-lg` projected end value colored to the active scenario
- Trend arrow (↑/↓/→) with green (improving) or red (worsening) based on metric direction
- End-year label and baseline reference value
- Graceful fallback if value is undefined or NaN

**`scenarioChart(opts)`** — Renders the SVG chart:
- SVG-based with 900×340 viewBox, responsive scaling via `aspect-ratio`
- Y-axis grid lines, labeled ticks, baseline marker
- All four scenarios drawn; active scenario highlighted with bold stroke + filled area
- End-point value labels for each scenario
- Scenario legend with color-coded line samples
- Optional `notes` object for scenario-specific descriptive text below each chart
- Optional `markerYear` for timeline scrubber position indicator

### Styling

Feltron-inspired dark editorial design defined in `css/style.css`:

- **Typography** — Space Grotesk (display), Inter (body), JetBrains Mono (data). Strict typographic scale from 72px hero scores down to 9px micro labels.
- **Color** — Near-black background (`#111`), white text hierarchy (primary/secondary/muted/faint), scenario-coded accent colors (teal/blue/amber/orange).
- **Grid** — 12-column editorial layout, responsive breakpoints at 900px, 768px, 600px. Charts use `grid-2` with full-width span for odd-count last items.
- **Components** — `.cell` cards, `.tag` badges, `.score-hero`/`.score-projected`/`.score-sub` for score hierarchy, `.scenario-btn` for scenario selection, `.control-bar` sticky navigation.

### Local development

```bash
cd public/layoutUpdate
python -m http.server 8080    # http://localhost:8080
```

No install, no build. Open any HTML file directly or serve with any static file server.

### Roadmap / TODO

- [x] ~~Refactor shared components into `shared.js`~~ — Nav bar, scenario buttons, mobile toggle, and footer now generated from JS templates. `PAGE_ORDER` is the single source of truth for site structure.
- [x] ~~Cross-system feedback loops~~ — Each dashboard shows a "Cross-System Impact" panel with directional influence weights, scenario-specific descriptions, and visual impact bars that update dynamically with the active scenario.
- [x] ~~Data export~~ — CSV download buttons on every chart.
- [x] ~~Dark/light mode toggle~~ — Theme switcher with localStorage persistence.
- [ ] **Scenario comparison mode** — Side-by-side scoring panel comparing two scenarios on all dashboard pages. (Infrastructure built in `shared.js` via `initComparisonMode()`, currently disabled.)
- [x] ~~Animated transitions~~ — CSS transitions + `fadeSwitch()` / `animateValue()` utilities.
- [x] ~~Scenario persistence across pages~~ — localStorage fallback added to URL hash persistence.
- [x] ~~Interactive policy levers on more pages~~ — Climate, Transition, and Governance each have 3 interactive sliders.
- [ ] **Consider PHP includes or a static site generator** — For deeper componentization (layouts, mastheads, head tags), evaluate PHP includes (Hostinger supports natively) or a lightweight SSG like 11ty/Hugo.
- [ ] **Real-time cross-system feedback** — Cross-system panels now reflect the active scenario, but adjusting a policy lever on one page does not yet propagate score changes to other pages in real time.
- [ ] **Multiplayer scenario mode** — Allow multiple users to collaboratively adjust policy levers and compare outcomes in real time.
- [ ] **Data source integration** — Connect to real-world data APIs (World Bank, NOAA, ILO) to ground baseline values in actual measurements.
- [ ] **Scenario builder** — Allow users to create custom scenarios beyond the four presets by defining their own policy lever configurations.
- [ ] **Globe view (viz.html)** — Revisit the globe mode that remaps the network onto a wireframe icosphere. Currently hidden; JS infrastructure remains in place for re-enabling.
- [ ] **Accessibility audit** — Full WCAG 2.1 AA compliance review, focus management, screen reader testing.
- [ ] **Operating System (OS) branding** — Each dashboard currently presents metrics and projections. A future iteration may introduce interactive "operating system" functionality (live policy levers, real-time feedback propagation, API-driven data) that would warrant the "OS" suffix (e.g., ClimateOS, GovernanceOS). Until that infrastructure is built, systems use plain names (Climate, Governance, etc.).

### Deploying to Hostinger

> **Important — cache-busting is required on every deploy.** Browsers and CDN edge caches aggressively cache `shared.js` and `style.css`. If you deploy updated files without bumping the version string, visitors (including you) will see stale content — menus, data, and styles will not update.

#### Step 1 — Bump the cache version

Every HTML file references CSS and JS with a `?v=` query parameter, e.g.:

```html
<link rel="stylesheet" href="css/style.css?v=20260216b">
<script src="js/shared.js?v=20260216b"></script>
```

Before deploying, do a **find-and-replace across all 13 HTML files** in `public/layoutUpdate/`:

- Find: `v=20260216b` (or whatever the current value is)
- Replace: `v=YYYYMMDD` + a letter suffix, e.g. `v=20260217a`

This forces every browser to fetch fresh copies. Increment the letter (`a`, `b`, `c`…) for same-day deploys.

#### Step 2 — Upload

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Open **File Manager** → navigate to `public_html/`
3. Upload the contents of `public/layoutUpdate/` (13 HTML files + `css/` + `js/` folders) into `public_html/`

#### Step 3 — Verify

Hard-refresh the site (`Ctrl+Shift+R` / `Cmd+Shift+R`) and confirm the new version string appears in the page source.

---

## Original Next.js version (main branch)

The original site was built with Next.js 14, React 18, Tailwind CSS 3, and Recharts. It includes a blog (9 MDX posts) and research paper not present in the layoutUpdate version.

### Dashboards

| Route | Dashboard | What it models |
|-------|-----------|----------------|
| `/climate` | **Climate** | Temperature, emissions, biodiversity, energy mix, resources, tipping points with 2050 projections |
| `/simulation` | **Simulation** | 50-year horizon, 3 policy levers, year-by-year metrics with auto-generated narrative reports |
| `/transition` | **Transition** | Workforce reskilling, automation risk scores, income bridge modeling |
| `/civilization` | **Civilization** | Unified health index across 6 domains, resident journeys, civic dividend modeling |
| `/governance` | **Governance** | Charter frameworks, citizen assemblies, AI audit coverage, participation KPIs |
| `/strategy` | **Strategy** | 50+ policy actions scored by cost, difficulty, and impact |
| `/blog` | **Blog** | 9 posts on build decisions, scenario design, scoring methodology |
| `/research` | **Research Paper** | Full theory and policy framework |

### Build

```bash
npm install
npm run build    # Static export to out/
```

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (static export), React 18, TypeScript 5.6 |
| Styling | Tailwind CSS 3, custom CSS variables + glassmorphism |
| Charts | Recharts 2.12 |
| Blog | gray-matter, remark + remark-html, next-mdx-remote |
| Reports | Era-phased template generation (4 eras × 4 scenarios × 8 sections) |
| Node | >=18.0.0 |

---

## License

Open source. All data, dashboards, and code available for inspection, forking, and contribution.
