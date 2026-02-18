import Link from "next/link";

const DASHBOARDS = [
  {
    name: "ClimateOS",
    href: "/climate",
    icon: "\u{1F331}",
    tagline: "Four climate futures, one comparison engine",
    desc: "Models four climate scenarios from now to 2050 across eight interconnected metrics: temperature, emissions, biodiversity, sea level rise, energy mix, agriculture, water stress, and resource scarcity. Toggle between aggressive action and worst case to watch every metric shift in response. Each chart includes scenario-aware descriptions and a comprehensive summary synthesizing the full state of the planet under each future.",
    stats: [
      { value: "4", label: "scenarios" },
      { value: "8", label: "metrics" },
      { value: "D+", label: "today's score" },
    ],
    color: "#14b8a6",
    gradient: "from-teal-500/10 to-transparent",
  },
  {
    name: "SimulationOS",
    href: "/simulation",
    icon: "\u{1F52C}",
    tagline: "12 branching futures across 50 years",
    desc: "Each branch varies three policy levers \u2014 civic dividend rates, AI governance charters, and climate investment share \u2014 then tracks GINI inequality, civic trust, annual emissions, resilience, and AI influence over a 50-year horizon. An AI-powered report generator produces detailed narrative analysis for any branch at any year, covering employment, energy, politics, space colonization, and more.",
    stats: [
      { value: "12", label: "branches" },
      { value: "50", label: "year horizon" },
      { value: "5", label: "structural metrics" },
    ],
    color: "#38bdf8",
    gradient: "from-sky-500/10 to-transparent",
  },
  {
    name: "TransitionOS",
    href: "/transition",
    icon: "\u{1F6E0}\uFE0F",
    tagline: "Workforce reskilling for the automation wave",
    desc: "Explores career transitions across dozens of occupations with automation risk scores, salary comparisons, and reskilling path planners. An income bridge calculator shows how civic dividends cover the gap during retraining. Three policy scenarios \u2014 baseline, Transition OS only, and full stack (OS + dividends + VPP) \u2014 project poverty rates, placement rates, and employment over 10 years.",
    stats: [
      { value: "3", label: "scenarios" },
      { value: "10yr", label: "projection" },
      { value: "D+", label: "transition score" },
    ],
    color: "#0ea5e9",
    gradient: "from-sky-500/10 to-transparent",
  },
  {
    name: "CivilizationOS",
    href: "/civilization",
    icon: "\u{1F30D}",
    tagline: "The meta-scorecard for civilizational health",
    desc: "Aggregates scores from every other dashboard into a unified Civilization Health Index. Tracks resident journeys through civic dividend enrollment and benefit modeling. Four scenarios project how intervention levels change outcomes across climate, governance, workforce, equity, technology, and civic wellbeing. This is the hub that shows how all systems interconnect.",
    stats: [
      { value: "6", label: "domains scored" },
      { value: "D+", label: "aggregate score" },
      { value: "47/100", label: "health index" },
    ],
    color: "#f59e0b",
    gradient: "from-amber-500/10 to-transparent",
  },
  {
    name: "GovernanceOS",
    href: "/governance",
    icon: "\u{1F3DB}\uFE0F",
    tagline: "Democratic infrastructure for the age of AI",
    desc: "Models a civic governance framework with charter principles, citizen assemblies with stratified demographics, composable governance modules (quadratic voting, participatory budgeting, AI audit registries), and a 10-year audit coverage tracker. Four scenarios range from full citizen governance to institutional regression, projecting democratic health and AI oversight.",
    stats: [
      { value: "4", label: "scenarios" },
      { value: "6", label: "modules" },
      { value: "D", label: "governance score" },
    ],
    color: "#8b5cf6",
    gradient: "from-violet-500/10 to-transparent",
  },
  {
    name: "StrategyOS",
    href: "/strategy",
    icon: "\u2699\uFE0F",
    tagline: "What you can do right now",
    desc: "Catalogs actions across three levels: personal (diet, energy, finance, transport, civic engagement), organization (HR, operations, governance, supply chain), and policy (carbon pricing, housing, labor, technology, international). Each action is scored by cost, difficulty, CO\u2082 impact, and timeline. Scenario projections show aggregate impact of coordinated action.",
    stats: [
      { value: "3", label: "action levels" },
      { value: "50+", label: "strategies" },
      { value: "4", label: "scenarios" },
    ],
    color: "#f59e0b",
    gradient: "from-amber-500/10 to-transparent",
  },
];

const PILLARS = [
  {
    icon: "\u{1F3AF}",
    title: "AI with measurable goals",
    desc: "Every deployment tied to specific metrics: human capability, economic participation, ecological health. Civic charters and public dashboards make progress trackable.",
    color: "#38bdf8",
  },
  {
    icon: "\u{1F4B0}",
    title: "Economic stability",
    desc: "Civic dividends funded by AI and compute productivity, reskilling infrastructure, cooperative ownership models, and guaranteed transition pathways for displaced workers.",
    color: "#10b981",
  },
  {
    icon: "\u{1F30D}",
    title: "Climate and ecology",
    desc: "Virtual power plants, carbon removal, biodiversity credits, and blue-economy ventures \u2014 each with transparent measurement and community co-ownership built in.",
    color: "#14b8a6",
  },
  {
    icon: "\u{1F3DB}\uFE0F",
    title: "Adaptive governance",
    desc: "Citizen assemblies, AI audit registries, quadratic voting, and composable governance modules that any city or organization can adopt and adapt.",
    color: "#8b5cf6",
  },
  {
    icon: "\u{1F4CA}",
    title: "Aligned capital",
    desc: "Investment structures that reward sustainable outcomes: mission-driven syndicates, civic infrastructure ventures, and data commons with built-in accountability.",
    color: "#f59e0b",
  },
];

const SCORES = [
  { domain: "Climate & Environment", score: 42, grade: "D+", trend: "\u2193", source: "ClimateOS", color: "#14b8a6" },
  { domain: "Governance & Institutions", score: 40, grade: "D", trend: "\u2193", source: "GovernanceOS", color: "#8b5cf6" },
  { domain: "Workforce & Economy", score: 43, grade: "D+", trend: "\u2192", source: "TransitionOS", color: "#0ea5e9" },
  { domain: "Social Equity", score: 38, grade: "D-", trend: "\u2193", source: "CivilizationOS", color: "#f59e0b" },
  { domain: "Technology & AI", score: 55, grade: "C", trend: "\u2191", source: "SimulationOS", color: "#38bdf8" },
  { domain: "Civic Wellbeing", score: 45, grade: "C-", trend: "\u2192", source: "CivilizationOS", color: "#f59e0b" },
];

const gColor = (sc: number) => sc >= 73 ? "#10b981" : sc >= 53 ? "#f59e0b" : sc >= 38 ? "#fb923c" : "#f43f5e";
const letterGrade = (sc: number) => sc >= 93 ? "A" : sc >= 85 ? "A-" : sc >= 80 ? "B+" : sc >= 73 ? "B" : sc >= 68 ? "B-" : sc >= 63 ? "C+" : sc >= 58 ? "C" : sc >= 53 ? "C-" : sc >= 48 ? "D+" : sc >= 43 ? "D" : sc >= 38 ? "D-" : "F";

export default function HomePage() {
  const overallScore = Math.round(SCORES.reduce((a, c) => a + c.score, 0) / SCORES.length);

  return (
    <main className="min-h-screen">
      <nav className="site-nav">
        <div className="header-links">
          <Link href="/" className="header-link header-link--gray active">Home</Link>
          <Link href="/climate" className="header-link header-link--teal">{"\u{1F331}"} ClimateOS</Link>
          <Link href="/simulation" className="header-link header-link--sky">{"\u{1F52C}"} Simulation</Link>
          <Link href="/transition" className="header-link header-link--sky">{"\u{1F6E0}\uFE0F"} TransitionOS</Link>
          <Link href="/civilization" className="header-link header-link--amber">{"\u{1F30D}"} CivilizationOS</Link>
          <Link href="/governance" className="header-link header-link--violet">{"\u{1F3DB}\uFE0F"} GovernanceOS</Link>
          <Link href="/strategy" className="header-link header-link--amber">{"\u2699\uFE0F"} StrategyOS</Link>
          <Link href="/research" className="header-link header-link--violet">{"\u{1F4DC}"} Research</Link>
          <Link href="/blog" className="header-link header-link--gray">{"\u{1F4DD}"} Blog</Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  HERO                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <header
        className="relative pt-20 pb-16 px-4 overflow-hidden"
        style={{ background: "linear-gradient(180deg,rgba(56,189,248,0.07) 0%,rgba(139,92,246,0.04) 40%,transparent 100%)" }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.5em] mb-5" style={{ color: "var(--accent)" }}>
            <span className="font-semibold" style={{ letterSpacing: "0.15em" }}>aicivsim</span>{" "}&mdash;{" "}AI Civilization Simulator
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "'Space Grotesk',sans-serif", color: "var(--text)" }}
          >
            Use AI to{" "}
            <span style={{ color: "#38bdf8" }}>simulate</span>,{" "}
            <span style={{ color: "#10b981" }}>measure</span>, and{" "}
            <span style={{ color: "#a78bfa" }}>navigate</span> our future
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Six interconnected dashboards use AI-driven modeling to connect climate, governance, workforce,
            civilization health, and strategy into a single planning tool. Compare scenarios, read the numbers,
            and explore what coordinated action looks like across 50 years of branching futures.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/simulation"
              className="text-sm font-semibold px-6 py-3 rounded-full transition-all hover:scale-105"
              style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}
            >
              Explore the simulation &rarr;
            </Link>
            <Link
              href="/research"
              className="text-sm font-semibold px-6 py-3 rounded-full transition-all hover:scale-105"
              style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}
            >
              Read the research paper
            </Link>
            <Link
              href="/blog"
              className="text-sm font-semibold px-6 py-3 rounded-full transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              Browse the blog
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  THE IDEA                                                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="mt-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>
              The idea
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-4"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              AI is the first tool powerful enough to model entire civilizations. So we built one.
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <p>
                AI can process and connect data across domains that have always been modeled in isolation.
                Climate projections exist in one silo, workforce data in another, governance frameworks in a third.
                What if you could feed all of them into the same model and watch how they influence each other?
              </p>
              <p>
                That&apos;s what this project does. The AI Civilization Simulator links climate, employment,
                democratic participation, economic stability, and strategic planning into a single interactive system.
                When you toggle a scenario in one dashboard, the numbers shift everywhere &mdash; because in
                the real world, they do too. It&apos;s a strategy tool for sustainable civilization, powered by the same
                AI capabilities that are reshaping every other field.
              </p>
              <p>
                No editorializing. Each dashboard scores its domain, tracks trend direction, and projects outcomes
                under different levels of coordinated action. The data tells the story. You decide what to do with it.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  CIVILIZATION SCORECARD                                     */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="mt-20">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>
              Civilization health index
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              Baseline reading: {letterGrade(overallScore)}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Six domains scored 0&ndash;100 using current data. With coordinated intervention the model projects <strong style={{ color: "#10b981" }}>B+ (78/100)</strong>.
              Without changes: <strong style={{ color: "var(--text-faint)" }}>22/100</strong>. The gap between those two numbers is the opportunity space.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8" style={{ borderTop: `3px solid ${gColor(overallScore)}` }}>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={gColor(overallScore)} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${overallScore * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: gColor(overallScore), fontFamily: "'Space Grotesk',sans-serif" }}>
                    {letterGrade(overallScore)}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{overallScore}/100</span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold mb-1">Starting point for planning</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  This is where the numbers put us today. Technology and AI capacity are growing fast.
                  Climate, governance, and equity have the most room to improve &mdash; and the simulation
                  shows the largest gains come from coordinating across those three areas simultaneously.
                  Explore the dashboards to see the specific levers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SCORES.map((s) => (
                <div key={s.domain} className="glass-card rounded-xl p-3 text-center">
                  <p className="text-[10px] font-semibold leading-tight mb-1" style={{ color: "var(--text)" }}>{s.domain}</p>
                  <p className="text-xl font-bold" style={{ color: gColor(s.score), fontFamily: "'Space Grotesk',sans-serif" }}>{s.grade}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>{s.score}/100</p>
                  <p className="text-sm mt-0.5" style={{ color: s.trend === "\u2191" ? "#10b981" : s.trend === "\u2193" ? "#f43f5e" : "#f59e0b" }}>{s.trend}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  FIVE PILLARS                                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="mt-20">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>
              Framework
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              Five strategy pillars
            </h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
              The research paper identifies five areas where AI-guided coordination produces the highest leverage.
              Each dashboard models one or more of them, and the simulation tests how they interact over time.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="glass-card rounded-xl p-5"
                style={{ borderLeft: `3px solid ${p.color}` }}
              >
                <span className="text-2xl block mb-3">{p.icon}</span>
                <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif", color: p.color }}>
                  {p.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.desc}</p>
              </div>
            ))}
            <Link
              href="/research"
              className="glass-card glass-card-interactive rounded-xl p-5 flex flex-col justify-center items-center text-center"
            >
              <span className="text-2xl mb-2">{"\u{1F4DC}"}</span>
              <p className="text-sm font-semibold mb-1" style={{ color: "#a78bfa" }}>Read the full paper</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>19 sections, baseline metrics, funding stack, risk matrix, and 10-year milestones</p>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  DASHBOARDS                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="mt-20">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>
              Dashboards
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              Six systems, one interconnected model
            </h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Each dashboard scores today&apos;s reality, projects multiple futures, and links to every other system.
              Toggle scenarios to see how choices in one domain cascade across all the others.
            </p>
          </div>

          <div className="space-y-4">
            {DASHBOARDS.map((d) => (
              <Link
                key={d.name}
                href={d.href}
                className="glass-card glass-card-interactive rounded-2xl p-6 block"
                style={{ borderLeft: `3px solid ${d.color}` }}
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{d.icon}</span>
                      <h3
                        className="text-base font-semibold"
                        style={{ fontFamily: "'Space Grotesk',sans-serif", color: d.color }}
                      >
                        {d.name}
                      </h3>
                    </div>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--text)" }}>{d.tagline}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{d.desc}</p>
                    <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: d.color }}>
                      Open dashboard &rarr;
                    </span>
                  </div>
                  <div className="flex sm:flex-col gap-3 sm:gap-2 flex-shrink-0">
                    {d.stats.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-center"
                        style={{ minWidth: "80px" }}
                      >
                        <p className="text-lg font-bold" style={{ color: d.color, fontFamily: "'Space Grotesk',sans-serif" }}>{s.value}</p>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  HOW IT CONNECTS                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="mt-20">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>
              How the pieces connect
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              One system, many questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "How do you reskill a workforce during an energy transition?",
                  a: "ClimateOS models the energy shift. TransitionOS maps which occupations are affected and where workers can move. StrategyOS lists policy levers. The Simulation tests whether civic dividends keep household income stable during retraining windows.",
                },
                {
                  q: "How do you keep governance effective as AI scales?",
                  a: "GovernanceOS models citizen participation, AI audit coverage, and democratic tooling under four scenarios. The Simulation projects the relationship between AI influence and civic trust over 50 years. When those two metrics stay balanced, every other domain benefits.",
                },
                {
                  q: "What are the highest-leverage actions right now?",
                  a: "StrategyOS scores 50+ actions across personal, organizational, and policy levels by cost, difficulty, and projected impact. The blog documents the reasoning. The research paper provides the full framework and implementation roadmap.",
                },
                {
                  q: "Where does the data come from?",
                  a: "Scenario-modeled projections grounded in 2026 baselines: emissions levels, OECD trust indices, automation risk assessments, demographic data, and climate science. The Simulation uses a branching approach across 12 policy configurations. All data and code are open source.",
                },
              ].map((item) => (
                <div key={item.q} className="glass-card rounded-xl p-5">
                  <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>{item.q}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  KEY FINDINGS                                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="mt-20">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>
              Insights from the model
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              Patterns across 12 branches and 50 years
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "\u{1F4CA}", title: "Coordination multiplies impact", desc: "Acting on climate, workforce, and governance together produces non-linear gains. The model consistently shows higher scores when interventions are bundled rather than applied one at a time.", color: "border-sky-500/30", dot: "bg-sky-400" },
              { icon: "\u2728", title: "Small civic tools compound", desc: "Participatory audits, open ledgers, and shared compute co-ops have modest individual effects, but stacked together they shift outcomes across many branches toward broader benefit.", color: "border-emerald-500/30", dot: "bg-emerald-400" },
              { icon: "\u267B", title: "Root-cause problems recur", desc: "Energy infrastructure, housing, and labor transitions reappear as bottlenecks across most branches. The model suggests these are structural and benefit from early investment.", color: "border-amber-500/30", dot: "bg-amber-400" },
              { icon: "\u{1F331}", title: "Starting conditions matter most", desc: "Initial parameters \u2014 resource distribution, governance design, investment allocation \u2014 propagate through nearly every outcome. The model rewards getting the foundations right.", color: "border-teal-500/30", dot: "bg-teal-400" },
              { icon: "\u{1F9ED}", title: "Define the goal first", desc: "Branches diverge based on what we optimize for: equity, growth, resilience, or autonomy. The model works best when you choose your priorities before comparing scenarios.", color: "border-violet-500/30", dot: "bg-violet-400" },
              { icon: "\u{1F310}", title: "Distribution is the key variable", desc: "How resources, compute, and decision-making are distributed is the single variable most correlated with overall score. Broader distribution tracks with higher outcomes across all six domains.", color: "border-emerald-500/30", dot: "bg-emerald-400" },
            ].map((item) => (
              <div key={item.title} className={`glass-card rounded-xl p-5 border-l-2 ${item.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                  <span className="text-lg">{item.icon}</span>
                </div>
                <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{item.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  BLOG + RESEARCH + GITHUB                                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="mt-20">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: "var(--accent)" }}>
              Go deeper
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              Read, fork, contribute
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/blog"
              className="glass-card glass-card-interactive rounded-xl p-6 text-center"
            >
              <span className="text-3xl block mb-3">{"\u{1F4DD}"}</span>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "#94a3b8" }}>Blog</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                9 posts covering build decisions, scenario design, scoring methodology, and the research framework.
              </p>
            </Link>
            <Link
              href="/research"
              className="glass-card glass-card-interactive rounded-xl p-6 text-center"
            >
              <span className="text-3xl block mb-3">{"\u{1F4DC}"}</span>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "#a78bfa" }}>Research Paper</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Full theory: AI alignment, income stability, climate repair, mission capital, transition phases, and feasibility analysis.
              </p>
            </Link>
            <a
              href="https://github.com/reillyclawcode/aicivsim"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card glass-card-interactive rounded-xl p-6 text-center"
            >
              <span className="text-3xl block mb-3">{"\u{1F4BB}"}</span>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "#38bdf8" }}>GitHub</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Every dashboard, dataset, and line of code. Open for inspection, forking, and contribution.
              </p>
            </a>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  FOOTER                                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer
        className="mt-20 py-10 text-center text-xs"
        style={{ color: "var(--text-faint)", borderTop: "1px solid var(--card-border)" }}
      >
        <p className="mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          AI Civilization Simulator
        </p>
        <p>&copy; 2026 Clawcode Research. All data and code open source.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Link href="/climate" className="hover:underline" style={{ color: "var(--text-muted)" }}>ClimateOS</Link>
          <span style={{ color: "var(--text-faint)" }}>&middot;</span>
          <Link href="/simulation" className="hover:underline" style={{ color: "var(--text-muted)" }}>Simulation</Link>
          <span style={{ color: "var(--text-faint)" }}>&middot;</span>
          <Link href="/transition" className="hover:underline" style={{ color: "var(--text-muted)" }}>TransitionOS</Link>
          <span style={{ color: "var(--text-faint)" }}>&middot;</span>
          <Link href="/civilization" className="hover:underline" style={{ color: "var(--text-muted)" }}>CivilizationOS</Link>
          <span style={{ color: "var(--text-faint)" }}>&middot;</span>
          <Link href="/governance" className="hover:underline" style={{ color: "var(--text-muted)" }}>GovernanceOS</Link>
          <span style={{ color: "var(--text-faint)" }}>&middot;</span>
          <Link href="/strategy" className="hover:underline" style={{ color: "var(--text-muted)" }}>StrategyOS</Link>
          <span style={{ color: "var(--text-faint)" }}>&middot;</span>
          <Link href="/blog" className="hover:underline" style={{ color: "var(--text-muted)" }}>Blog</Link>
          <span style={{ color: "var(--text-faint)" }}>&middot;</span>
          <Link href="/research" className="hover:underline" style={{ color: "var(--text-muted)" }}>Research</Link>
          <span style={{ color: "var(--text-faint)" }}>&middot;</span>
          <a href="https://github.com/reillyclawcode/aicivsim" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--text-muted)" }}>GitHub</a>
        </div>
      </footer>
    </main>
  );
}
