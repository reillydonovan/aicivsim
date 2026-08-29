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

## Agency layer and site epistemics — state as of 2026-08-19

**Read this section first if you are returning to this project.** It covers the
most recent body of work, the one idea that must not be lost, and every open
item that has not had a human pass yet.

### Why it exists

The site diagnosed business-as-usual well and did nothing to mobilize against
it. A visitor who is not a legislator had no path from "this is bad" to "here is
what I do," so the page produced despair, and despair demobilizes. The agency
layer is the response: it tags every action in `STRATEGY_CATALOG` with a scope
tier, declares how lower tiers relate to higher ones, and closes the homepage on
a specific ask instead of a number.

### The load-bearing idea: constitutive, not causal

**This is the part that must survive you forgetting everything else.**

The composite score is not a function of the action catalog. `simScore()` in
`js/shared.js` reads hardcoded per-scenario arrays — the five "policy levers"
are *labels on pre-authored worlds*, not inputs to a computation. It follows
that **no action at any tier moves the composite score**, and the site says so
in plain language on `strategy.html` and `index.html`.

What a tier-4 action *can* honestly claim is that it is part of what
distinguishes one scenario from another — **constitutive of a world, not causal
upon it**. A national action that maps to a model lever is part of what makes
that future *that* future. It does not push a number.

If you ever find yourself writing "this action improves the score by X," the
model does not support the claim. The interface is deliberately built so that
sentence cannot be written by accident: the only per-scenario numbers on an
action card are the lever's values read live from `SIM_ENGINE.scenarios`, and
they always appear alongside the sentence saying they do not move the score.

An earlier framing — "tier 1–2 actions feed tier 4, which moves the model" — was
itself a fabrication risk and was rejected for this reason. Do not reintroduce
it.

### Scope tiers

Four tiers, three of them populated:

| Tier | Scope | Count |
|---|---|---|
| 1 | Individual & household | 8 |
| 2 | Organization | 6 |
| 3 | Municipal & regional | **0 — disclosed, not offered** |
| 4 | National & international | 6 |

Tier 3 is empty. It is **not** a selectable filter that would return nothing;
instead a `.tier-gap` block at the end of the catalog states the gap and
explains that several tier-1 actions are blocked at exactly that level. See the
open item below on its framing.

The tier filter is an affordance, never pre-applied. The default option is
`All · reachable first`, which **orders** by reachability rather than hiding
tier 4 — hiding the only tier with a real model connection would optimize the
honest content out of view.

Tier is a separate axis from `stratStatusRank()`. Nothing reads one from the
other; do not conflate them.

### Dependency edges — 13 set, 7 null

Each action declares `feeds`, and the 7 nulls are load-bearing content, not
missing data:

- **Tier 1/2 → tier 4 (11 edges):** renewable switch, community organizing and
  renewable procurement → carbon pricing · home retrofit →
  housing-as-infrastructure · civic participation and living wage → civic
  dividend pilot · ethical investing and supply chain audit → green finance
  regulation · AI governance framework and open data pledge → AI audit mandate.
- **Tier 4 → model lever (2 edges):** universal reskilling → `reskill`, AI audit
  mandate → `charter`.
- **`feeds: null` (7):** plant-based diet, public transit/cycling, reduce air
  travel, remote work policy (all blocked at the uncovered municipal tier);
  carbon pricing, housing-as-infrastructure, green finance regulation (no model
  lever exists). These render as a plain-language admission. **The admission is
  a feature — do not force an edge to remove it.**

### The three epistemic classes

The site previously stated two classes and, as of this work, had an
undocumented third. There are now three, stated everywhere the split is
explained (`about.html`, `design-system.html` §Provenance):

| Class | Meaning | Visual register |
|---|---|---|
| **Measured** | Someone counted it — live feeds (NOAA, OWID, World Bank) | Solid rule, semantic green |
| **Modeled** | The engine produced it — composite, indices, projections | Double rule, ink |
| **Authored** | A person decided it — tiers, edges, narrative prose | **Dashed** rule, mono tag, no fill, no scenario colour |

The registers differ **in kind** (solid / double / dashed), never in shade, so a
reader never has to compare two greys to tell a measurement from a judgement
call. `.authored-tag` is deliberately unstyled — it marks an absence of
evidence, not a category of thing.

### The homepage closing section and its admission

`index.html` ends on `#ask` — "What this page is actually asking." Previously the
page ended on three cards routing back into more model exploration, which is the
despair loop rather than a way out of it.

The entire section is **derived from `STRATEGY_CATALOG`**, so editing the
catalog edits the section and the two cannot drift. It computes:

- **Two routes** the catalog can trace end to end (a tier-4 action that both
  carries a model lever *and* has something lower feeding it).
- **Three admissions** — the three ways that tracing fails: a lever with no
  feeder (universal reskilling); feeders whose target has no lever (carbon
  pricing, housing, green finance); and levers with no catalog action at all
  (climate capex, institutional transparency).
- **The ask**, with all counts derived rather than typed.

The headline finding is an admission: **only 4 of the 14 reachable actions have
a traced route to a lever the model represents.** The actions most people can
actually take build toward three levers the model does not contain. This is
deliberate, it is computed rather than asserted, and it will update itself if
the catalog changes. It reads as an indictment of the catalog's coverage, which
is correct. **Do not soften it.**

### Where the code lives

- `js/shared.js` — `STRATEGY_CATALOG` (the only copy; `v3-data.js` has zero
  references to it). Holds `tier`, `feeds`, `scopes`, `scopeGap`, and `levers`
  (labels only — values are read live from `SIM_ENGINE.scenarios` so they cannot
  drift), plus the AGENCY LAYER header comment stating the honesty rules.
- `strategy.html` — tier grouping, the filter, and `depLine()`, which renders
  the four dependency shapes.
- `index.html` — `renderAsk()`, the derived closing section.
- `css/v3.css` — the `AGENCY LAYER`, `THE CLOSING ASK`, and
  `THE THREE EPISTEMIC CLASSES` blocks.

Verified after the data change: `pathways.html` action-diff counts are
**identical** across all 12 scenario pairs (20 everywhere except bau↔worst at
19). Re-verify this if you touch `STRATEGY_CATALOG`.

---

## Open items — none of these have had a human pass

### UNVERIFIED: the `?a=<slug>` deep link on strategy.html

`index.html`'s route links point at `strategy.html?a=<slug>`. A query param is
used rather than a hash because **the hash belongs to the scenario store**
(`V3.scenario.set` calls `history.replaceState` with `#<scenario>`). The handler
sits at the bottom of `strategy.html`'s inline script, bound to `window.load`
plus 120ms, because Chrome cancels a smooth programmatic scroll started while
the document is still loading and `html { scroll-behavior: smooth }` applies.

**What was confirmed:** the handler executes (the `.flash` class lands on the
target at ~420ms), the target element resolves, and the computed offset is sane
(6549px for a card at 7039px in a 1342px viewport).

**What could not be confirmed:** whether the viewport actually moves.
Programmatic scroll is inert under Chrome automation — `window.scrollTo` leaves
`scrollY === 0` from *both* the isolated world and page context (tested by
injecting a `<script>` tag so the call ran in page context), while real
mouse-wheel input scrolls the same page fine. Working code and broken code are
indistinguishable in that environment.

**Manual reproduction — 60 seconds, needs a normal browser window:**

1. `cd public/layoutUpdate && python -m http.server 8080`
2. Open `http://localhost:8080/strategy.html?a=civic-dividend-pilot`
3. **Expected:** the page paints at the top, then within ~200ms jumps so the
   "Civic dividend pilot" card is vertically centred, with a 1.5s accent ring
   flash on the card.
4. Also test the real entry point: open `index.html`, scroll to "What this page
   is actually asking," and click any route step (e.g. "Civic participation").
5. **If it does not scroll:** check the console; confirm `location.search`
   parses; confirm `document.getElementById('civic-dividend-pilot')` resolves.
   The likeliest culprit is the 120ms delay being too short on a slow load —
   raise it, or switch to a `requestAnimationFrame` double-tick.

### OPEN: tier-3 gap block framing — your decision

Only **one** version exists in the repo, the one currently shipping in
`STRATEGY_CATALOG.scopeGap.note`:

> "No municipal-tier actions exist in this catalog yet. Several lower-tier
> actions (public transit, air-travel alternatives) are blocked at exactly this
> level, which is why their dependency reads as unmapped."

That text reads as **option A — a deliberate pointer**: it explains the gap as
information the reader can use. No **option B — a public to-do** draft was ever
written to a file, so there is nothing to compare it against. If you want the B
framing (an explicit "this is unbuilt work, here is the plan"), it still needs
drafting. **The choice is yours; the shipped text is A by default, not by
decision.**

### OPEN: editorial review of all authored content

**None of the following has had your pass.** All of it carries the AUTHORED tag
in the UI, but the tag marks it as a judgement call — it does not make the
judgement a good one:

- All 20 tier assignments
- All 13 `feeds` edges
- The two action→lever mappings (deciding that "universal reskilling" *is* the
  `reskill` lever is a judgement; only the values are modeled)
- The four dependency claim sentences in `depLine()`
- The three scope blurbs and the tier-3 gap note
- The `index.html` closing prose, including "Doing the first two does not raise
  the lever. It is what makes a government pulling it politically survivable."
- The three epistemic-class definitions on `about.html` and `design-system.html`

**Review this one first.** The highest-weight, least-supported claim on the site
is the dependency sentence shown on every tier-1/2 action card that has an edge:

> "Not because it reduces emissions at scale — because it builds the
> constituency, precedent or demand that makes that lever politically
> reachable."

That is an argument about political mechanism, not a finding, and nothing on the
site or in the model supports it. It appears on 11 cards. It is the load-bearing
justification for the entire tier-1→tier-4 relationship, so if it is wrong the
agency layer's premise is wrong. It needs your attention before anything else in
this list.

### OPEN: public-epistemics review list

Authored on the `public-epistemics` branch, none of it reviewed. Entries are
written to be checkable without re-reading the page. **F** marks a
characterisation of an outside field rather than a claim about this site —
those are the ones where being wrong is most embarrassing and least visible.

**Read these two hardest**, per your own note:

1. **F · The taint-tracking distinction** (`epistemics.html`). Claims: taint
   tracking is binary and security-motivated with the goal of *stopping* a
   value reaching a sink; this system is graded with five levels and the goal
   is the opposite — the value should reach the reader carrying its standing.
   Concludes that taint labels can be invisible whereas these are useless
   unless rendered. If that characterisation of taint analysis is wrong, the
   paragraph an implementer is most likely to remember is the wrong one.
2. **F · "When this pattern will not help you"** (`epistemics.html`). Three
   limits, all mine: (a) a system with no mix of claim types gets one class and
   the lattice does nothing; (b) propagation is defined over arithmetic, so
   prose gets labelling without propagation; (c) no-override presumes you
   control your own release gate. Each is stated as fact and none is tested.

**The rest, by page:**

3. **F · Prior art attributions** (`epistemics.html`). Denning 1976 as
   structurally the same mechanism; W3C PROV as more expressive than five
   ordered labels; datasheets/model cards as artefact-level rather than
   value-level; database provenance as "the closest true relative" carrying a
   full derivation expression where we carry one ordered label. Four
   characterisations, none verified beyond general knowledge.
4. **The ordering rationale** (`epistemics.html`, `shared.js`). That
   `deliberated` sits one step above the floor because it is the only class
   with published measured evidence of a failure mode; that `authored`
   outranks it because it is attributable to a person; that `modeled` outranks
   `authored` because it is reproducible. Also the junior-analyst
   counterexample, which argues our own ordering is wrong for some adopters.
5. **The Solopova scope limit** (`epistemics.html`). Citation verified real
   and accurately characterised. The judgement that it is "strong support in
   coalition and crisis modelling, weaker support for a universal claim" is
   mine. **Carried over: ENGINE_SPEC v0.3 §7.3 and §5 lean on the same paper
   to justify the ordering without bounding it to the paper's domain — the
   same overclaim, in `aicivsim-engine`, deliberately not fixed here.**
6. **The status note** (`epistemics.html`). "Specified and machine-enforceable,
   not battle-tested," plus the specific claim that the validator is a
   specification with fixtures rather than a component with a year of runs.
7. **Class definitions and registers** (`shared.js` `EPISTEMIC_CLASSES`). Every
   `short`, `who`, `standing` and `onsite` line, and the assignment of solid /
   double / dashed / dotted / gapped to the five classes.
8. **The adoption checklist** (`epistemics.html`). Six steps, including "you
   probably need fewer than five classes" and the test for merging two.
9. **Methodology framing** (`methodology.html`). The six "what this site does
   not do" entries, "then what is it for," and the claim that a reader taking
   the number 28 as an estimate "has taken the one thing here that carries no
   information." Hedge scan clean; one recovery clause was cut.
10. **Changelog entries** (`shared.js` `CHANGELOG`). Six entries — the wording
    of each, the kind assigned, and the editorial rule that corrections render
    at the same weight as additions.
11. **`about.html` "Who made it"** — the self-description, and the three cards.
    **No email is published.** The site has never carried one, so contact
    routes through the existing GitHub link. Publishing an address is yours to
    decide.

### OPEN: structural finding — the `ai` series is decorative

Not editorial. `SIM_ENGINE.scenarios[*].ai` is stored, interpolated and charted,
and `simScore()` never reads it. On a site about AI's civilizational trajectory,
the headline subject contributes nothing to any number. It is now disclosed
beside the chart on `simulation.html`, on the stat tile, on `methodology.html`,
and as a `corrected` changelog entry.

**Wiring it into the score was deliberately not attempted** — that is a model
change. The disclosure is driven by `SIM_ENGINE.metrics[].inScore`, so if the
series is ever wired in, flipping one boolean removes every disclosure at once.

### Engine work lives in a sibling repo

The provenance-layer engine — `ENGINE_SPEC.md`, `ARTIFACT_CONTRACT.md`, the run
artifact validator — lives in **`aicivsim-engine`**, a separate repository
alongside this one. It is deliberately not part of this project's lifespan: the
site ships regardless of whether the engine survives its Phase 0 ablation, and
the two do not share a history. Nothing in this repo depends on it.

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

**Current token: `v=20260829a`** — 74 references across 24 HTML files plus
`js/shared.js` (whose chat-widget injector carries one). They are always all
identical; a mismatch is a bug.

> **The failure mode this prevents, so you recognise it cold.** Change
> `shared.js` without bumping the token and the browser serves the cached
> copy, so any newly added global throws `ReferenceError: X is not defined`
> — e.g. `EPISTEMIC_CLASSES is not defined`. The page looks broken, the code
> looks correct, and the fix is a token bump, not a debugging session.

Every HTML file references CSS and JS with a `?v=` query parameter, e.g.:

```html
<link rel="stylesheet" href="css/v3.css?v=20260819a">
<script src="js/v3.js?v=20260819a"></script>
```

Check the current value and confirm there is exactly one:

```bash
cd public/layoutUpdate
grep -rho 'v=[0-9]\{8\}[a-z]' *.html js/shared.js | sort | uniq -c
# exactly one distinct version must appear
```

Then find-and-replace across **all HTML files AND `js/shared.js`** — forgetting
`shared.js` is the classic miss, because it injects `chat-widget.js` with its
own copy of the token:

```bash
OLD=v=20260819a NEW=v=$(date +%Y%m%d)a
sed -i "s/$OLD/$NEW/g" *.html js/shared.js
```

The new value is today's date as `YYYYMMDD` plus a letter suffix — `a` for the
first deploy of the day, then `b`, `c`, … for same-day redeploys. This forces
every browser and the Hostinger edge cache to fetch fresh copies.

The `bump-cache-version` skill in `.claude/skills/` automates this.

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
