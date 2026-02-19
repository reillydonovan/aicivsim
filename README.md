# AI Civilization Simulator

**Live at [aicivsim.com](https://aicivsim.com)** — *AI Civilization Simulator*

Use AI to simulate, measure, and navigate civilization-scale challenges. Six interconnected dashboards model climate, governance, workforce transition, civilization health, and strategy across 50 years of branching futures — a planning tool for sustainable civilization that tells the story of possible worlds.

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
├── index.html             # Landing page — project overview, scenario guide, system map
├── climate.html           # ClimateOS — 7 tabs, 9 planetary metrics (incl. ocean pH), tipping points
├── simulation.html        # SimulationOS — 5 policy levers, 50-year timeline, narrative reports
├── transition.html        # TransitionOS — workforce reskilling, income bridge calculator
├── civilization.html      # CivilizationOS — composite health index, KPI trajectories, funding
├── governance.html        # GovernanceOS — charter status, assemblies, audit coverage
├── strategy.html          # StrategyOS — 20 actions with scenario-aware status/adoption, Today's Score + projected
├── timeline.html          # Timeline — 200K-year arc of civilization, AI as inflection point, scenario-aware futures
├── research.html          # Research paper — 19 sections, TOC, print-friendly CSS for PDF export
├── about.html             # About page
├── css/style.css          # All styles — Feltron typography, responsive grid, dark theme, print styles, skeleton loading
├── js/shared.js           # Shared utilities — renderSiteNav, renderScenarioButtons, scenarioChart, chartHeader, dark/light mode, localStorage persistence, CSV export, cross-system feedback, comparison mode, animated transitions, ARIA, renderFooter
└── styleguide.md          # Feltron design guide used to build the site
```

### Key features

- **Zero dependencies** — No npm, no build step, no framework. Plain HTML/CSS/JS served as static files.
- **Today's Score + Projected Score on every page** — Each dashboard and sub-tab opens with a prominent "Today's Score" (static baseline, color-coded by grade) followed by the scenario-projected score with letter grade, delta comparison, and trend. Climate sub-tabs (Biodiversity, Energy & Emissions, Resources) each display their own today/projected pair. The index page shows all six systems with today + projected scores that update with scenario selection.
- **Standardized 4-scenario system** — All pages now use the same four scenarios (Aggressive, Moderate, BAU, Worst) with consistent colors (#4ecdc4, #5da5da, #e8a838, #d4622a). TransitionOS was migrated from its original 3-scenario system (Baseline/TransitionOS/Full Stack) to match.
- **Standardized chart headers** — Every graph uses a consistent `chartHeader()` function (defined in `shared.js`) that renders a Feltron domain-card style header: uppercase `t3` metric label, large `num-lg` projected value colored to the active scenario, trend arrow (green/red based on direction preference), end-year target, and baseline reference.
- **Multi-scenario comparison charts** — Every graph displays all four scenarios simultaneously. The active scenario is highlighted with a bold line and filled area; inactive scenarios are dimmed. Implemented via a unified `scenarioChart()` function in `shared.js`.
- **Narrative simulation reports** — SimulationOS generates natural-language dispatches from the future that evolve across four era phases (Dawn, Divergence, Maturity, Legacy). The narrative tells a human story — not a metrics readout — covering people & livelihoods, climate & energy, trust & governance, AI & the future, and the road ahead. Letter grades update dynamically.
- **Dynamic scenario-aware data** — Switching scenarios updates every chart, score, description, domain card, and narrative paragraph on every page. No static content remains when scenarios change. This includes:
  - **GovernanceOS assemblies and modules** — All 5 assemblies and 5 modules persist across scenarios with per-scenario values, grades, and status labels (Active/Limited/Dissolved/Not deployed).
  - **GovernanceOS overview metric cards** — Civic Participation, Charter Adoption, Institutional Trust, and Audit Coverage update dynamically.
  - **TransitionOS metric cards** — Poverty Rate, Reskill Time, Placement Rate, and Employment update with scenario-specific values and descriptions.
  - **CivilizationOS timeline** — Each milestone has per-scenario scores, grades, goal comparison, status tags, and narrative notes.
  - **Climate tipping points** — Risk levels (low/moderate/high/critical) calculated dynamically from projected temperature vs. threshold, with BREACHED indicators, margin display, and scenario-specific notes.
  - **StrategyOS** — Full scenario awareness with per-action status tags, adoption rates, and scenario-specific impact narratives.
  - **Index page** — Six Systems cards show today + projected scores, hero projected score, and scenario descriptions all update dynamically.
- **9 climate metrics** — Temperature Rise, Sea Level Rise, CO₂ Concentration, Biodiversity Index, Renewable Share, Crop Yield Index, Water Stress, Forest Cover, and Ocean pH. Each with 4-scenario data (25 data points, 2026–2050) and scenario-specific narrative descriptions.
- **Scenario persistence (hash + localStorage)** — Active scenario is stored in the URL hash (e.g. `#aggressive`) AND in `localStorage`. Sharing a link preserves the selected scenario; navigating between pages automatically maintains the selected scenario via localStorage fallback.
- **Prev/Next page navigation** — Footer includes contextual navigation links to the previous and next page in the site order.
- **Print styles** — `@media print` CSS in `style.css` provides clean PDF export for all dashboard pages (hides nav/scenario bars, white background, proper contrast).
- **Accessibility** — ARIA `role="tablist"` / `role="tab"` / `aria-selected` on section tabs, `aria-pressed` and `aria-label` on scenario buttons, `role="img"` on chart SVGs.
- **Skeleton loading styles** — CSS shimmer animation classes (`.skeleton`, `.skeleton-chart`, `.skeleton-score`) for use during JS initialization.
- **Civilizational Timeline** — A narrative editorial page (`timeline.html`) tracing 200,000 years of human inflection points — fire, agriculture, writing, printing press, industrial revolution, computing, internet — culminating in AI as the current inflection. Three tabs: "The Arc" (visual alternating timeline with population/time-to-next-leap stats), "The Inflection" (why this decade is different, with convergence of climate/labor/democracy/inequality), and "Possible Futures" (scenario-aware era-by-era projections through 2050 with grades and verdicts).
- **Responsive mobile design** — Collapsing hamburger navigation, stacked scenario selectors, single-column chart grids on small screens.
- **Research paper** — Full 19-section civic roadmap converted to Feltron style with table of contents, per-row hover states, all tables and phase cards, 16 references, and built-in `@media print` CSS for one-click PDF export via browser print.
- **JS-templated navigation** — Site nav bar, mobile hamburger toggle, and scenario buttons are generated from `shared.js` via `renderSiteNav()` and `renderScenarioButtons()`. Adding a new page or link requires editing only `PAGE_ORDER` in `shared.js`.
- **Dark / light mode** — Theme toggle in the nav bar switches between dark (default) and light mode. Preference persists in localStorage. Light mode overrides CSS custom properties for backgrounds, text, borders, and chart elements.
- **Data export (CSV)** — Every chart includes a "CSV" download button. Click to export all scenario data for that metric as a CSV file. Powered by `registerChartExport()` + `downloadCSV()` in `shared.js`.
- **Cross-system feedback loops (scenario-aware)** — Each dashboard page includes a "Cross-System Impact" panel showing how its metrics influence other operating systems. Weights, effect descriptions, and visual impact bars all update dynamically when the user switches scenarios — e.g., ClimateOS's workforce displacement impact ranges from −5% under Aggressive Action to −35% under Worst Case, each with a unique narrative explanation.
- **Interactive policy levers** — SimulationOS has 5 sliders; ClimateOS (carbon tax, renewable investment, conservation target), TransitionOS (civic dividend, reskill budget, automation pace), and GovernanceOS (charter enforcement, assembly frequency, audit coverage) each have 3 additional lever controls that adjust projected scores in real time.
- **Animated transitions** — CSS transitions on `.bar-fill`, `.num-lg`, `.score-projected`, `.tag`, `.cell`, and `.scenario-chart` elements provide smooth visual feedback when switching scenarios. `fadeSwitch()` and `animateValue()` utilities available in `shared.js`.
- **Standardized footer** — All pages use `renderFooter()` from `shared.js` with consistent branding and prev/next navigation.
- **Responsive control bar** — Tabs and scenario buttons stack into separate rows at 1200px to prevent overflow on pages with many sub-tabs (e.g., ClimateOS with 6 tabs). Horizontal scroll on both rows at narrower widths.
- **Cache-busting** — All CSS/JS references include `?v=` query parameters (currently `20260220f`) to prevent stale browser caches after deployment.

### Scenario system

Four scenarios model diverging futures across all dashboards:

| Scenario | ID | Policy configuration |
|----------|-----|---------------------|
| **Aggressive Action** | `aggressive` | 10% civic dividends, enforced AI charter, 25% climate capex, 20% reskilling, 80% transparency |
| **Moderate Reform** | `moderate` | 5% dividends, active charter, 15% capex, 10% reskilling, 50% transparency |
| **Business as Usual** | `bau` | 0% dividends, no charter, 5% capex, 3% reskilling, 20% transparency |
| **Worst Case** | `worst` | 0% dividends, no charter, 2% capex, 1% reskilling, 10% transparency |

SimulationOS has 5 interactive policy levers (sliders for dividend rate, climate capex, reskilling investment, governance transparency; toggle for AI charter) that dynamically resolve to the nearest scenario. ClimateOS, TransitionOS, and GovernanceOS each add 3 page-specific policy levers that adjust projected scores in real time.

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
- [x] ~~Interactive policy levers on more pages~~ — ClimateOS, TransitionOS, and GovernanceOS each have 3 interactive sliders.
- [ ] **Consider PHP includes or a static site generator** — For deeper componentization (layouts, mastheads, head tags), evaluate PHP includes (Hostinger supports natively) or a lightweight SSG like 11ty/Hugo.
- [ ] **Real-time cross-system feedback** — Cross-system panels now reflect the active scenario, but adjusting a policy lever on one page does not yet propagate score changes to other pages in real time.
- [ ] **Multiplayer scenario mode** — Allow multiple users to collaboratively adjust policy levers and compare outcomes in real time.
- [ ] **Data source integration** — Connect to real-world data APIs (World Bank, NOAA, ILO) to ground baseline values in actual measurements.
- [ ] **Scenario builder** — Allow users to create custom scenarios beyond the four presets by defining their own policy lever configurations.
- [ ] **Accessibility audit** — Full WCAG 2.1 AA compliance review, focus management, screen reader testing.

### Deploying to Hostinger

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Open **File Manager** → navigate to `public_html/`
3. Upload the contents of `public/layoutUpdate/` (10 HTML files + `css/` + `js/` folders) into `public_html/`
4. If updating: bump the `?v=` query string in each HTML file's CSS/JS references to bust browser caches

---

## Original Next.js version (main branch)

The original site was built with Next.js 14, React 18, Tailwind CSS 3, and Recharts. It includes a blog (9 MDX posts) and research paper not present in the layoutUpdate version.

### Dashboards

| Route | Dashboard | What it models |
|-------|-----------|----------------|
| `/climate` | **ClimateOS** | Temperature, emissions, biodiversity, energy mix, resources, tipping points with 2050 projections |
| `/simulation` | **SimulationOS** | 50-year horizon, 3 policy levers, year-by-year metrics with auto-generated narrative reports |
| `/transition` | **TransitionOS** | Workforce reskilling, automation risk scores, income bridge modeling |
| `/civilization` | **CivilizationOS** | Unified health index across 6 domains, resident journeys, civic dividend modeling |
| `/governance` | **GovernanceOS** | Charter frameworks, citizen assemblies, AI audit coverage, participation KPIs |
| `/strategy` | **StrategyOS** | 50+ policy actions scored by cost, difficulty, and impact |
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
