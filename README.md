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

A complete redesign built as vanilla HTML/CSS/JS with no framework dependencies.
The **v3 design system** governs every page — see
[`design-system.html`](public/layoutUpdate/design-system.html), which is the
canonical living spec and renders through the same CSS/JS as the product, so it
cannot drift. (`styleguide.md` documents the original Feltron reference the
design grew out of.)

### Design system

| File | Role |
|------|------|
| `css/v3.css` | Tokens + every component. The system. |
| `css/v3-bridge.css` | Translates the original design's class vocabulary (`.page`, `.cell`, `.t1`–`.t4`, `--text-*`) onto v3 tokens — for long-form documents like the paper. |
| `css/v3-instrument.css` | HUD skin for the full-screen 3D instruments. |
| `js/v3.js` | Chrome (nav/deck/footer), scenario store, motion, chart kit, `V3.systemPage()`. |
| `js/v3-data.js` | Page data machine-extracted from the original pages. **Regenerate, never hand-edit.** |

Every page is exactly one of three tiers: **native** (`v3.css` + `v3.js`),
**bridged** (adds `v3-bridge.css`, for old-vocabulary documents), or
**instrument** (own canvas UI + `v3-instrument.css`). `css/style.css` is
retired — nothing loads it.

Core rules (full list in the `design-system` skill): one scenario control per
page · one nav menu open ever · the scenario control *is* the chart legend ·
Business as Usual is always the default, persisted sitewide · every metric
carries its own context copy.

Motion is powered by [motion.dev](https://motion.dev) (pinned UMD from jsDelivr,
loaded before `v3.js`), with a hand-rolled spring integrator for number counting
and as the fallback when the CDN is unreachable.

### Architecture

```
public/layoutUpdate/
├── index.html             # Landing — today's score (measured) vs a chosen future (modeled), composite trajectory + story, systems ledger
├── ai.html                # AI — 6 metrics, 5 risk thresholds, 5 governance milestones
├── climate.html           # Climate — 9 planetary metrics, 6 tipping points, 3 sub-scores
├── governance.html        # Governance — charter, pillars, participation, funding stack, assemblies, modules, audit program
├── transition.html        # Transition — 4 labor vitals + the income-bridge calculator (job economics vs policy)
├── civilization.html      # Civilization — the composite: KPIs, 6 domains, funding architecture, 8 milestones
├── strategy.html          # Strategy — the 20-action catalog with adoption meters and per-scenario status
├── simulation.html        # Simulation — 5 policy levers, year scrubber + play, generated world report, 3D CTA
├── pathways.html          # Pathways — one route instrument (From ⇄ To), slopes, lever deltas, action diff
├── timeline.html          # Timeline — the 200K-year spine + scenario-reactive future chapters
├── data.html              # Live Data — 8 real-world indicators vs the model's 2026 baseline
├── visualizer.html        # 3D experiences hub (Globe + Knowledge Explorer withheld while they're built out)
├── viz.html               # 3D network — Three.js systems graph (instrument tier)
├── xr.html                # WebXR — immersive VR/AR network (instrument tier)
├── globe.html             # Globe — in development, links withheld (instrument tier)
├── explorer.html          # Knowledge Explorer — in development, links withheld (instrument tier)
├── research.html          # Research landing — what the paper argues
├── paper.html             # The full 19-section paper (bridged tier, print-friendly)
├── design-system.html     # The living design-system spec
├── about.html             # About — scope, method, colophon
├── chat.html              # Advisor — disabled pending a v3 pass (engine intact, see ADVISOR_ENABLED)
├── 404.html               # Branded 404 (wired via .htaccess ErrorDocument)
├── favicon.svg · robots.txt · sitemap.xml · .htaccess
├── api/                   # chat.php streaming proxy + config template (unchanged)
├── css/                   # v3.css · v3-bridge.css · v3-instrument.css · style.css (retired)
├── js/                    # shared.js (data + palette) · v3.js · v3-data.js · live-data.js · chat-widget.js
└── styleguide.md          # The original Feltron design reference
```

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
- [x] ~~AI Advisor chat widget~~ — Persistent floating LLM chat across all pages with page awareness, navigation tracking, and internal page linking.
- [x] ~~AI Advisor — server-side API proxy~~ — PHP streaming proxy with config above web root, .htaccess protection, per-IP rate limiting, and CORS origin locking.
- [x] ~~AI Advisor — 3D Explorer mode~~ — `explorer.html` — Three.js knowledge graph where questions spawn interactive nodes with topic satellites, curved connections, streaming LLM responses, and camera fly-to.
- [x] ~~WebXR visualization~~ — `xr.html` — Immersive VR/AR experience rendering the 7-system network with dual XR modes, controller interaction, scenario switching, and desktop fallback.
- [x] ~~3D Experiences hub~~ — `visualizer.html` consolidated into a hub for all three 3D modes (Visualizer, Explorer β, WebXR β) with `NAV_PARENTS` child-page highlighting and "Back to Visualizer" footer links. Explorer and WebXR removed from top-level nav to reduce menu clutter.
- [x] ~~Command palette~~ — Ctrl+K / Cmd+K global search overlay with fuzzy matching across pages, scenarios, and actions.
- [x] ~~Reading progress bar~~ — Thin accent-colored progress indicator fixed to top of viewport.
- [x] ~~Scroll-triggered animations~~ — IntersectionObserver-based entrance animations for cells, pullquotes, chapter dividers, and section numbers.
- [x] ~~Back-to-top button~~ — Floating scroll-to-top button with visibility threshold and accent hover state.
- [x] ~~Enhanced cell hover states~~ — Left-border accent indicator on grid cell hover.
- [ ] **Consider PHP includes or a static site generator** — For deeper componentization (layouts, mastheads, head tags), evaluate PHP includes (Hostinger supports natively) or a lightweight SSG like 11ty/Hugo.
- [ ] **Real-time cross-system feedback** — Cross-system panels now reflect the active scenario, but adjusting a policy lever on one page does not yet propagate score changes to other pages in real time.
- [ ] **Multiplayer scenario mode** — Allow multiple users to collaboratively adjust policy levers and compare outcomes in real time.
- [x] ~~Data source integration~~ — `js/live-data.js` + `data.html` fetch current real-world values client-side (CO₂/methane/Arctic ice from NOAA via global-warming.org, temperature anomaly/renewable share/CO₂ emissions from Our World in Data, poverty/unemployment from the World Bank). Key-free, CORS-open, cached in sessionStorage for 6h, with graceful fallback to the static baselines when offline. The homepage shows a compact live-signal strip; `data.html` compares every live value against the model's 2026 baseline.
- [x] ~~Scenario-to-scenario transition page~~ — `pathways.html` computes the gap between any FROM and TO scenario: score/grade delta, policy-lever deltas, an action-status diff over the (now shared) `STRATEGY_CATALOG`, and trajectory divergence charts. Direction-aware copy — "what we'd have to change" when climbing, "what would have to break" when falling.
- [ ] **Scenario builder** — Allow users to create custom scenarios beyond the four presets by defining their own policy lever configurations.
- [ ] **Globe view (viz.html)** — Revisit the globe mode that remaps the network onto a wireframe icosphere. Currently hidden; JS infrastructure remains in place for re-enabling.
- [ ] **Accessibility audit** — Full WCAG 2.1 AA compliance review, focus management, screen reader testing.
- [ ] **Operating System (OS) branding** — Each dashboard currently presents metrics and projections. A future iteration may introduce interactive "operating system" functionality (live policy levers, real-time feedback propagation, API-driven data) that would warrant the "OS" suffix (e.g., ClimateOS, GovernanceOS). Until that infrastructure is built, systems use plain names (Climate, Governance, etc.).

### Deploying to Hostinger

> **Important — cache-busting is required on every deploy.** Browsers and CDN edge caches aggressively cache `shared.js` and `style.css`. If you deploy updated files without bumping the version string, visitors (including you) will see stale content — menus, data, and styles will not update.

#### Step 1 — Bump the cache version

Every HTML file references CSS and JS with a `?v=` query parameter, e.g.:

```html
<link rel="stylesheet" href="css/v3.css?v=20260816h">
<script src="js/v3.js?v=20260816h"></script>
```

Before deploying, do a **find-and-replace across all HTML files** in `public/layoutUpdate/` (19 as of this writing — always all identical, see `grep -oh 'v=[0-9]\{8\}[a-z]' public/layoutUpdate/index.html | head -1` to check the current value):

- Find: `v=20260816h` (or whatever the current value is)
- Replace: `v=YYYYMMDD` + a letter suffix, e.g. `v=20260712a`

This forces every browser to fetch fresh copies. Increment the letter (`a`, `b`, `c`…) for same-day deploys.

#### Step 2 — Upload site files

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Open **File Manager** → navigate to `public_html/`
3. Upload the contents of `public/layoutUpdate/` into `public_html/`, preserving structure:
   - **all 23 root `.html` files**
   - **`css/`** — `v3.css`, `v3-bridge.css`, `v3-instrument.css`, `style.css`
   - **`js/`** — `v3.js`, `v3-data.js`, `shared.js`, `live-data.js`, `chat-widget.js`
   - **`favicon.svg`, `robots.txt`, `sitemap.xml`, `.htaccess`**
   - `api/` only if it changed (it holds the chat proxy; unchanged in most deploys)

   Uploading the whole folder and overwriting is the simplest correct move.
   Note that `js/v3.js`, `js/v3-data.js`, `css/v3.css`, `css/v3-bridge.css`,
   and `css/v3-instrument.css` are **new files** — a deploy that only replaces
   previously-existing files will leave the site unstyled.

#### Step 3 — Set up AI Advisor API proxy

1. In File Manager, navigate to `/home/<username>/` (one level **above** `public_html/`)
2. Upload `aicivsim_config.php` with your API key filled in — this file is completely unreachable from the web
3. Verify `public_html/api/` contains `chat.php`, `config.example.php`, and `.htaccess`

The proxy auto-detects the config above the web root. If not found, it falls back to `api/config.php` (protected by `.htaccess`). The widget auto-detects the proxy and shows "Server API" — no key needed from visitors.

#### Step 4 — Verify

Hard-refresh the site (`Ctrl+Shift+R` / `Cmd+Shift+R`) and confirm the new version string appears in the page source. Open the chat widget and verify "Server API" appears in the settings bar.

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
