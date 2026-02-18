# AI Civilization Simulator

**Live at [aicivsim.com](https://aicivsim.com)** — *AI Civilization Simulator*

Use AI to simulate, measure, and navigate civilization-scale challenges. Six interconnected dashboards model climate, governance, workforce transition, civilization health, and strategy across 50 years of branching futures — a planning tool for sustainable civilization that lets the numbers tell the story.

---

## Dashboards

| Route | Dashboard | What it models |
|-------|-----------|----------------|
| `/climate` | **ClimateOS** | Temperature, emissions, biodiversity, energy mix, resources, and tipping points across 4 scenarios (Aggressive Action → Worst Case) with 2050 projections |
| `/simulation` | **SimulationOS** | 12 branching 50-year futures generated from 3 policy levers (civic dividend rate, AI charter, climate capex share) with year-by-year GDP, emissions, trust, and governance trajectories |
| `/transition` | **TransitionOS** | Workforce reskilling paths, automation risk scores per occupation, income bridge modeling, and cohort projections under 3 transition scenarios |
| `/civilization` | **CivilizationOS** | Unified health index across 6 domains (climate, governance, economy, equity, technology, civic wellbeing), resident journey flows, civic dividend modeling |
| `/governance` | **GovernanceOS** | Charter frameworks, citizen assemblies, governance modules, AI audit coverage tracking, participation KPIs |
| `/strategy` | **StrategyOS** | 50+ policy actions scored by cost, difficulty, and impact with readiness assessment across 8 dimensions |
| `/blog` | **Blog** | 9 posts covering build decisions, scenario design, scoring methodology, and dashboard deep-dives |
| `/research` | **Research Paper** | Full theory and policy framework |

---

## Architecture

```
aicivsim/
├── app/                    # Next.js App Router — one folder per dashboard
│   ├── page.tsx            # Landing page
│   ├── climate/page.tsx    # ClimateOS (6 tabs, ~1400 lines)
│   ├── simulation/page.tsx # SimulationOS
│   ├── civilization/page.tsx
│   ├── governance/page.tsx
│   ├── transition/page.tsx
│   ├── strategy/page.tsx
│   ├── blog/               # Blog list + [slug] dynamic routes
│   ├── research/            # Research paper (client.tsx for interactivity)
│   ├── layout.tsx          # Root layout with metadata + fonts
│   └── globals.css         # All global styles, CSS variables, component classes
├── content/
│   ├── posts/              # 9 MDX blog posts with frontmatter
│   └── research-paper.mdx  # Full research paper
├── lib/
│   └── blog.ts             # Blog utilities (getAllPosts, getPostBySlug)
├── public/
│   ├── data/               # Static JSON datasets (see Data Model below)
│   └── assets/             # Images and media
├── next.config.js          # Static export config (output: "export")
├── tailwind.config.js
└── package.json
```

### Data flow

1. **Static JSON** — All dashboard data lives in `public/data/*.json`, served as static assets at build time
2. **Client-side fetch** — Each page loads its data with `useEffect` + `fetch("/data/{name}.json")` on mount
3. **Scenario state** — `useState` tracks the active scenario; switching it re-renders all charts and stat cards
4. **Chart transforms** — `useMemo` reshapes scenario arrays into Recharts-compatible series
5. **Blog pipeline** — `gray-matter` parses MDX frontmatter, `remark` + `remark-html` converts Markdown to HTML

### Scenario system

Most dashboards present 2050 projections under multiple scenarios. When a user selects a scenario, all stat cards, charts, descriptions, and projections update to reflect that future:

| Page | Scenarios | IDs |
|------|-----------|-----|
| ClimateOS | Aggressive Action, Moderate Transition, Business as Usual, Worst Case | `aggressive`, `moderate`, `bau`, `worst` |
| CivilizationOS | Aggressive Reform, Moderate Reform, Business as Usual, Worst Case | `aggressive`, `moderate`, `bau`, `worst` |
| GovernanceOS | Full Framework, Moderate Reform, Minimal Tech, Institutional Regression | `full_framework`, `moderate_reform`, `minimal_tech`, `regression` |
| TransitionOS | Baseline, Transition OS Only, Full Stack | `baseline`, `transition_os`, `full_stack` |
| SimulationOS | 12 branches (cartesian product of 3 binary policy levers) | Numeric indices `0`–`11` |
| StrategyOS | Aggressive Action, Moderate Reform, Minimal Effort, Worst Case | `aggressive`, `moderate`, `bau`, `worst` |

Each scenario defines projected values for stat cards (labeled "2050 Projection: {name}") plus time-series arrays that drive every chart. Static baseline stats are labeled "Current State (today)" or "2024 Baseline (today)" to distinguish them from projections.

---

## Data model

Five JSON files power the dashboards. Each is self-contained and loaded independently.

| File | Top-level keys | Size |
|------|---------------|------|
| `climate.json` | `scenarios[]`, `metrics`, `biodiversity`, `energy`, `resources`, `milestones[]`, `tippingPoints[]` | 4 scenarios × 8 time-series arrays (temperature, sea level, CO2, biodiversity index, renewable share, crop yield, water stress, forest cover) |
| `simulation.json` | `scenario`, `runs[]` | 12 runs, each with policy branch config + year-by-year trajectory (population, economy, climate, governance) |
| `governance.json` | `charter`, `assemblies[]`, `modules[]`, `auditTimeline[]`, `kpis[]` | Charter with pillars/enforcement, 6 assemblies, 5 modules, audit timeline, participation KPIs |
| `civilization.json` | `journeys[]`, `dividendModel`, `benefits[]`, `kpis[]` | 5 resident journeys, dividend funding model, civic benefits catalog |
| `transition.json` | `graph` (occupations + skills), `cohort[]` | Skills-based occupation graph with transferability scores, 3 scenario cohort projections |

---

## Styling

The UI uses a dark glassmorphism theme defined entirely in `app/globals.css`:

- **CSS variables** — `--bg`, `--card-bg`, `--card-border`, `--text`, `--text-muted`, `--text-faint`, `--accent`, plus named colors (`--rose`, `--sky`, `--emerald`, etc.)
- **Key classes** — `.glass-card` (translucent card with border and backdrop blur), `.site-nav` (sticky top navigation), `.tab-btn` / `.tab-btn-active` (dashboard tab buttons), `.header-link` / `.header-link.active` (global nav links)
- **Charts** — Recharts with consistent tooltip styling, active scenario at full opacity/thicker stroke, inactive scenarios dimmed

---

## Getting started

### Local development

```bash
npm install
npm run dev    # http://localhost:3000
```

### Build for production

```bash
npm install
npm run build
```

The static export lands in `out/`. Upload its contents to any web server's document root. The build uses `trailingSlash: true` so every route generates as `folder/index.html` — no server-side rewrites needed.

### Environment

Copy `.env.example` to `.env.local` and add your OpenAI API key if you want AI-generated report summaries (used on the Simulation page). The static dashboards work without it.

```
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o-mini
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (static export via `output: "export"`), React 18, TypeScript 5.6 |
| Styling | Tailwind CSS 3, custom CSS variables + glassmorphism |
| Charts | Recharts 2.12 |
| Blog | gray-matter (frontmatter), remark + remark-html (Markdown → HTML), next-mdx-remote |
| AI | OpenAI SDK (optional, for simulation report generation) |
| Hosting | Static files — currently on Hostinger at [aicivsim.com](https://aicivsim.com) |
| Node | >=18.0.0 |

## Branches

| Branch | Purpose | Hosting |
|--------|---------|---------|
| `main` | Static export, currently live at [aicivsim.com](https://aicivsim.com) | Any web host (HTML/CSS/JS) |
| `dynamic` | Full Node.js server with AI report generation | Requires Node.js hosting |

---

## License

Open source. All data, dashboards, and code available for inspection, forking, and contribution.
