# AI Civilization Simulator

**Live at [aicivsim.com](https://aicivsim.com)**

Use AI to simulate, measure, and navigate civilization-scale challenges. Six interconnected dashboards model climate, governance, workforce transition, civilization health, and strategy across 50 years of branching futures — a planning tool for sustainable civilization that lets the numbers tell the story.

## Dashboards

| Route | Dashboard | Description |
|-------|-----------|-------------|
| `/climate` | ClimateOS | Four climate scenarios across 8 metrics: temperature, emissions, biodiversity, sea level, energy mix, agriculture, water stress, resources |
| `/simulation` | SimulationOS | 12 branching 50-year futures with policy levers and structural metrics |
| `/transition` | TransitionOS | Workforce reskilling paths, automation risk scores, income bridge calculator, 10-year projections |
| `/civilization` | CivilizationOS | Unified health index aggregating all domains, resident journeys, civic dividend modeling |
| `/governance` | GovernanceOS | Charter frameworks, citizen assemblies, composable governance modules, audit tracking |
| `/strategy` | StrategyOS | 50+ actions across personal, org, and policy levels scored by cost, difficulty, and impact |
| `/blog` | Blog | 9 posts covering build decisions, scenario design, scoring methodology, and research framework |
| `/research` | Research Paper | Full theory: AI alignment, income stability, climate repair, mission capital, and transition phases |

## How it works

Each dashboard scores its domain using current data, shows trend direction, and projects outcomes under different levels of coordinated action. When you toggle a scenario in one dashboard, the numbers shift everywhere — because the domains are modeled as interconnected systems, not independent silos.

The Civilization Health Index on the landing page aggregates all six domains into a single baseline score and shows the gap between current trajectory and coordinated intervention. The simulation engine branches across 12 policy configurations over 50 years.

## Deployment

The production site is a static export hosted on [aicivsim.com](https://aicivsim.com). To rebuild and deploy:

```bash
npm install
npm run build
```

This generates a static site in the `out/` directory. Upload the contents of `out/` to your web server's `public_html` (or equivalent document root).

## Local development

For local development with the AI report generator enabled:

```bash
npm install
cp .env.example .env.local   # then add your OpenAI key
```

Restore the API routes and set `output: "export"` back to server mode in `next.config.js`, then:

```bash
npm run dev                   # http://localhost:3000
```

### Environment variables (local dev only)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For AI summaries | OpenAI API key for the simulation report generator |
| `OPENAI_MODEL` | No | Model to use (defaults to `gpt-4o-mini`) |

## Stack

- **Framework**: Next.js 14, React 18, TypeScript 5.6
- **Styling**: Tailwind CSS 3
- **Charts**: Recharts 2.12
- **Blog**: remark + remark-html + gray-matter (MDX content)
- **Hosting**: Static export on Hostinger

## License

Open source. All data, dashboards, and code available for inspection, forking, and contribution.
