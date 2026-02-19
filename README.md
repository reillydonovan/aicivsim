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
├── climate.html           # ClimateOS — 6 tabs, 8 planetary metrics, tipping points
├── simulation.html        # SimulationOS — 5 policy levers, 50-year timeline, narrative reports
├── transition.html        # TransitionOS — workforce reskilling, income bridge calculator
├── civilization.html      # CivilizationOS — composite health index, KPI trajectories, funding
├── governance.html        # GovernanceOS — charter status, assemblies, audit coverage
├── strategy.html          # StrategyOS — policy action catalog scored by cost/difficulty/impact
├── research.html          # Research paper — 19 sections, TOC, print-friendly CSS for PDF export
├── about.html             # About page
├── css/style.css          # All styles — Feltron typography, responsive grid, dark theme
├── js/shared.js           # Shared utilities — scenarioChart, nav, scenario selectors
└── styleguide.md          # Feltron design guide used to build the site
```

### Key features

- **Zero dependencies** — No npm, no build step, no framework. Plain HTML/CSS/JS served as static files.
- **Today's Score on every page** — Each dashboard opens with a prominent composite score (120px hero) with letter grade, trend, and supporting metric breakdown.
- **Multi-scenario comparison charts** — Every graph displays all four scenarios simultaneously. The active scenario is highlighted with a bold line and filled area; inactive scenarios are dimmed. Implemented via a unified `scenarioChart()` function in `shared.js`.
- **Narrative simulation reports** — SimulationOS generates natural-language dispatches from the future that evolve across four era phases (Dawn, Divergence, Maturity, Legacy). The narrative tells a human story — not a metrics readout — covering people & livelihoods, climate & energy, trust & governance, AI & the future, and the road ahead. Letter grades update dynamically.
- **Dynamic scenario-aware data** — Switching scenarios updates every chart, score, description, domain card, and narrative paragraph on every page. No static content remains when scenarios change.
- **Responsive mobile design** — Collapsing hamburger navigation, stacked scenario selectors, single-column chart grids on small screens.
- **Research paper** — Full 19-section civic roadmap converted to Feltron style with table of contents, per-row hover states, all tables and phase cards, 16 references, and built-in `@media print` CSS for one-click PDF export via browser print.
- **Cache-busting** — All CSS/JS references include `?v=` query parameters to prevent stale browser caches after deployment.

### Scenario system

Four scenarios model diverging futures across all dashboards:

| Scenario | ID | Policy configuration |
|----------|-----|---------------------|
| **Aggressive Action** | `aggressive` | 10% civic dividends, enforced AI charter, 25% climate capex, 20% reskilling, 80% transparency |
| **Moderate Reform** | `moderate` | 5% dividends, active charter, 15% capex, 10% reskilling, 50% transparency |
| **Business as Usual** | `bau` | 0% dividends, no charter, 5% capex, 3% reskilling, 20% transparency |
| **Worst Case** | `worst` | 0% dividends, no charter, 2% capex, 1% reskilling, 10% transparency |

SimulationOS adds interactive policy levers (sliders for dividend rate, climate capex, reskilling investment, governance transparency; toggle for AI charter) that dynamically resolve to the nearest scenario.

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

All charts are rendered via a single `scenarioChart(opts)` function in `shared.js`:

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

- [ ] **Refactor shared components into `shared.js`** — Move navigation bar, scenario selector bar, page shell (head/meta/CSS), and footer into JavaScript templates rendered from `shared.js`. Currently these are duplicated across all 9 HTML files, requiring manual edits to each page for global changes (e.g., adding a nav link). A single-source-of-truth pattern in `shared.js` would let one edit propagate everywhere automatically.
- [ ] **Consider PHP includes or a static site generator** — For deeper componentization (layouts, partials), evaluate migrating to PHP includes (Hostinger supports PHP natively) or a lightweight SSG like 11ty/Hugo with a build step.

### Deploying to Hostinger

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Open **File Manager** → navigate to `public_html/`
3. Upload the contents of `public/layoutUpdate/` (8 HTML files + `css/` + `js/` folders) into `public_html/`
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
