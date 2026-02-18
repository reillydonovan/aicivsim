# AI Civilization Simulator (Static)

**Live at [aicivsim.com](https://aicivsim.com)**

**Branch**: `static` — static export currently deployed to production.

Use AI to simulate, measure, and navigate civilization-scale challenges. Six interconnected dashboards model climate, governance, workforce transition, civilization health, and strategy across 50 years of branching futures — a planning tool for sustainable civilization that lets the numbers tell the story.

## Branches

| Branch | Purpose | Hosting |
|--------|---------|---------|
| `static` | Static export, currently live at [aicivsim.com](https://aicivsim.com) | Any web host (HTML/CSS/JS) |
| `dynamic` | Full Node.js server with AI report generation | Requires Node.js hosting |

## Dashboards

| Route | Dashboard | Description |
|-------|-----------|-------------|
| `/climate` | ClimateOS | Four climate scenarios across 8 metrics |
| `/simulation` | SimulationOS | 12 branching 50-year futures with policy levers and structural metrics |
| `/transition` | TransitionOS | Workforce reskilling paths, automation risk scores, income bridge calculator |
| `/civilization` | CivilizationOS | Unified health index, resident journeys, civic dividend modeling |
| `/governance` | GovernanceOS | Charter frameworks, citizen assemblies, governance modules, audit tracking |
| `/strategy` | StrategyOS | 50+ actions scored by cost, difficulty, and impact |
| `/blog` | Blog | 9 posts on build decisions, scenario design, and scoring methodology |
| `/research` | Research Paper | Full theory and policy framework |

## Deployment

To rebuild and deploy the static site:

```bash
npm install
npm run build
```

Upload the contents of `out/` to your web server's `public_html` (or equivalent document root). The build uses `trailingSlash: true` so every route generates as `folder/index.html`, ensuring links work on standard shared hosting without server-side rewrites.

## Local development

```bash
npm install
npm run dev    # http://localhost:3000
```

For AI-generated reports, switch to the `dynamic` branch which includes the full `/api/summarize` route.

## Stack

- **Framework**: Next.js 14 (static export), React 18, TypeScript 5.6
- **Styling**: Tailwind CSS 3
- **Charts**: Recharts 2.12
- **Blog**: remark + remark-html + gray-matter (MDX content)
- **Hosting**: Static files on Hostinger

## License

Open source. All data, dashboards, and code available for inspection, forking, and contribution.
