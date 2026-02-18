"use client";
import { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar,
} from "recharts";

/* ── Types ── */
interface Scenario {
  id: string; name: string; icon: string; desc: string; color: string;
  tempRise: number[]; seaLevel: number[]; co2ppm: number[]; biodiversity: number[];
  renewableShare: number[]; cropYield: number[]; waterStress: number[]; forestCover: number[];
}
interface Metrics {
  globalTemp2024: number; co2ppm2024: number; seaLevelBaseline: string;
  biodiversityIndex2024: number; arcticIceExtent_mkm2: number; glacierMassBalance_gt: number;
  oceanAcidity_ph: number; annualEmissions_gt: number; renewableCapacity_gw: number;
  forestCoverPct: number; waterStressPct: number; cropYieldIndex: number;
  extremeWeatherEvents2024: number; climateDisplaced_m: number; greenFinance_t: number;
}
interface KeyEcosystem { name: string; status: string; tippingPoint: string; current: string; icon: string; color: string }
interface RestorationProject { name: string; target: string; progress: number; investment_m: number }
interface Biodiversity {
  speciesThreatened: number; speciesAssessed: number; extinctionRate: string;
  protectedLandPct: number; protectedOceanPct: number; targetProtectedPct: number;
  coralReefHealth: number; insectDecline30yr: number; mammalsEndangered: number; birdsEndangered: number;
  keyEcosystems: KeyEcosystem[]; restorationProjects: RestorationProject[];
}
interface GridMix { source: string; pct: number; color: string }
interface EmissionsSector { sector: string; pct: number; gt: number; color: string }
interface EmissionsYear { year: number; gt: number }
interface Energy { gridMix2024: GridMix[]; emissionsBreakdown: EmissionsSector[]; annualEmissionsHistory: EmissionsYear[] }
interface CriticalMineral { mineral: string; demand2024_kt: number; demand2040_kt: number; reserves_mt: number; recyclingRate: number; color: string }
interface Resources {
  freshwaterAvailable_km3: number; freshwaterWithdrawn_km3: number; agricultureWaterUse_pct: number;
  arableLand_mha: number; arableLandLostPerYear_mha: number; foodWastePct: number;
  hungerAffected_m: number; phosphorusReserves_yr: number; topsoilLossRate: string;
  fishStocksOverfished_pct: number; criticalMinerals: CriticalMineral[];
}
interface Milestone { year: number | string; title: string; items: string[] }
interface TippingPoint { name: string; threshold: string; risk: string; impact: string; icon: string; color: string }
interface SeedData {
  scenarios: Scenario[]; metrics: Metrics; biodiversity: Biodiversity;
  energy: Energy; resources: Resources; milestones: Milestone[]; tippingPoints: TippingPoint[];
}

type Tab = "overview" | "scenarios" | "biodiversity" | "energy" | "resources" | "timeline";

const YEARS = Array.from({ length: 25 }, (_, i) => 2026 + i);
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : n.toString();

function Heading({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
        <span className="text-2xl">{icon}</span> {title}
      </h2>
      {sub && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}
function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: color || "var(--teal)", fontFamily: "'Space Grotesk',sans-serif" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

const TOOLTIP_STYLE = { background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "11px" };

export default function Home() {
  const [data, setData] = useState<SeedData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [activeScenario, setActiveScenario] = useState<string>("aggressive");

  useEffect(() => { fetch("/data/climate.json").then(r => r.json()).then(setData).catch(console.error); }, []);

  /* Build chart data from scenarios */
  const scenarioChartData = useMemo(() => {
    if (!data) return { temp: [], sea: [], co2: [], bio: [], renew: [], crop: [], water: [], forest: [] };
    const build = (key: keyof Scenario) =>
      YEARS.map((yr, i) => {
        const row: any = { year: yr };
        for (const s of data.scenarios) row[s.id] = (s[key] as number[])[i];
        return row;
      });
    return {
      temp: build("tempRise"), sea: build("seaLevel"), co2: build("co2ppm"),
      bio: build("biodiversity"), renew: build("renewableShare"), crop: build("cropYield"),
      water: build("waterStress"), forest: build("forestCover"),
    };
  }, [data]);

  if (!data) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-4xl animate-pulse">{"\u{1F30D}"}</div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading ClimateOS&hellip;</p>
      </div>
    </main>
  );

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "\u{1F4CA}" },
    { id: "scenarios", label: "Scenarios", icon: "\u{1F52E}" },
    { id: "biodiversity", label: "Biodiversity", icon: "\u{1F33F}" },
    { id: "energy", label: "Energy & Emissions", icon: "\u{26A1}" },
    { id: "resources", label: "Resources", icon: "\u{1F4A7}" },
    { id: "timeline", label: "Timeline", icon: "\u{1F3AF}" },
  ];

  const riskColor = (r: string) => r === "triggered" ? "#991b1b" : r === "critical" ? "#f43f5e" : r === "very high" ? "#ef4444" : r === "high" ? "#f59e0b" : r === "moderate" ? "#0ea5e9" : r === "low" ? "#10b981" : "#10b981";
  const statusColor = (s: string) =>
    s === "collapsed" ? "#991b1b" : s === "critical" ? "#f43f5e" : s === "severe" ? "#f59e0b" : s === "stressed" ? "#fb923c" : s === "declining" ? "#0ea5e9" : s === "stabilizing" ? "#38bdf8" : s === "recovering" ? "#10b981" : s === "thriving" ? "#22c55e" : "#94a3b8";

  return (
    <main className="min-h-screen pb-20">
      {/* ── HEADER ── */}
      <header className="pt-10 pb-8 px-4" style={{ background: "linear-gradient(180deg,rgba(20,184,166,0.06) 0%,transparent 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.4em] mb-2" style={{ color: "var(--teal)" }}>ClimateOS</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Climate Futures Dashboard</h1>
          <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
            Explore climate scenarios, biodiversity, emissions, sea level rise, agriculture, and resource projections across multiple possible futures.
            What we do now determines which branch of the future we inhabit.
          </p>
        </div>
      </header>
      <nav className="site-nav">
        <div className="header-links">
          <a href="/" className="header-link header-link--gray">Home</a>
          <a href="/climate" className="header-link header-link--teal active">{"\u{1F331}"} ClimateOS</a>
          <a href="/simulation" className="header-link header-link--sky">{"\u{1F52C}"} Simulation</a>
          <a href="/transition" className="header-link header-link--sky">{"\u{1F6E0}\uFE0F"} TransitionOS</a>
          <a href="/civilization" className="header-link header-link--amber">{"\u{1F30D}"} CivilizationOS</a>
          <a href="/governance" className="header-link header-link--violet">{"\u{1F3DB}\uFE0F"} GovernanceOS</a>
          <a href="/strategy" className="header-link header-link--amber">{"\u2699\uFE0F"} StrategyOS</a>
          <a href="/research" className="header-link header-link--violet">{"\u{1F4DC}"} Research</a>
          <a href="/blog" className="header-link header-link--gray">{"\u{1F4DD}"} Blog</a>
        </div>
      </nav>

      {/* ── NAV ── */}
      <nav className="sticky z-50 px-4 py-3" style={{ top: "33px", background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--card-border)" }}>
        <div className="flex gap-2 overflow-x-auto justify-center">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn whitespace-nowrap ${tab === t.id ? "tab-btn-active" : ""}`}>{t.icon} {t.label}</button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8">

        {/* ════════════════════ OVERVIEW ════════════════════ */}
        {tab === "overview" && (() => {
          const s = data.scenarios.find(sc => sc.id === activeScenario)!;

          /* ── Baseline Scorecard ── */
          const climateScores = [
            { domain: "Temperature Control", score: 58, trend: "declining" as const, icon: "\u{1F321}\uFE0F", color: "#f43f5e", note: `+${data.metrics.globalTemp2024}\u00b0C of 1.5\u00b0C budget used` },
            { domain: "Emissions", score: 32, trend: "stable" as const, icon: "\u{1F32B}\uFE0F", color: "#f59e0b", note: `${data.metrics.annualEmissions_gt} Gt/yr \u2014 need <25 Gt by 2030` },
            { domain: "Energy Transition", score: 45, trend: "improving" as const, icon: "\u26A1", color: "#38bdf8", note: `${fmtK(data.metrics.renewableCapacity_gw)} GW installed, ~30% of electricity` },
            { domain: "Biodiversity", score: 40, trend: "declining" as const, icon: "\u{1F33F}", color: "#10b981", note: `Index ${data.metrics.biodiversityIndex2024}, ${data.biodiversity.protectedLandPct}% land protected` },
            { domain: "Ocean Health", score: 35, trend: "declining" as const, icon: "\u{1F30A}", color: "#06b6d4", note: `pH ${data.metrics.oceanAcidity_ph}, ${data.biodiversity.coralReefHealth}% coral health` },
            { domain: "Resource Security", score: 42, trend: "declining" as const, icon: "\u{1F4A7}", color: "#a78bfa", note: `${data.metrics.waterStressPct}% water-stressed, ${data.resources.foodWastePct}% food waste` },
          ];
          const overallScore = Math.round(climateScores.reduce((a, c) => a + c.score, 0) / climateScores.length);
          const letterGrade = (sc: number) => sc >= 93 ? "A" : sc >= 85 ? "A-" : sc >= 80 ? "B+" : sc >= 73 ? "B" : sc >= 68 ? "B-" : sc >= 63 ? "C+" : sc >= 58 ? "C" : sc >= 53 ? "C-" : sc >= 48 ? "D+" : sc >= 43 ? "D" : sc >= 38 ? "D-" : "F";
          const gradeColor = (sc: number) => sc >= 73 ? "#10b981" : sc >= 53 ? "#f59e0b" : sc >= 38 ? "#fb923c" : "#f43f5e";
          const trendArrow = (t: "improving" | "stable" | "declining") => t === "improving" ? "\u2191" : t === "stable" ? "\u2192" : "\u2193";
          const trendColor = (t: "improving" | "stable" | "declining") => t === "improving" ? "#10b981" : t === "stable" ? "#f59e0b" : "#f43f5e";
          const projectedScores: Record<string, number> = { aggressive: 88, moderate: 65, bau: 28, worst: 12 };

          const overviewStats2050: Record<string, { temp: string; co2: string; emissions: string; renewPct: string; forest: string; water: string; displaced: string; finance: string }> = {
            aggressive: { temp: "+1.2", co2: "366", emissions: "3.4", renewPct: "99", forest: "42.3", water: "15", displaced: "5", finance: "5.2" },
            moderate: { temp: "+1.8", co2: "395", emissions: "17.8", renewPct: "88", forest: "35.3", water: "25", displaced: "35", finance: "3.5" },
            bau: { temp: "+3.0", co2: "551", emissions: "26.1", renewPct: "64", forest: "21.3", water: "56", displaced: "150", finance: "1.8" },
            worst: { temp: "+4.6", co2: "790", emissions: "40.0", renewPct: "42", forest: "8.5", water: "88", displaced: "500", finance: "0.6" },
          };
          const st = overviewStats2050[s.id];
          const tpScenario: Record<string, Record<string, { risk: string; outcome: string }>> = {
            "Amazon Dieback": {
              aggressive: { risk: "low", outcome: "Avoided. Deforestation halted and reversed. Forest stabilized at 12% cleared, well below threshold." },
              moderate: { risk: "moderate", outcome: "Narrowly avoided. Deforestation slowed to 18% but drought stress persists. Razor-thin margin." },
              bau: { risk: "very high", outcome: "Likely triggered by early 2040s. 22%+ cleared. Irreversible transition to savanna underway." },
              worst: { risk: "triggered", outcome: "Fully triggered. 40%+ deforested. Amazon transitioning to dry savanna. Releasing 100+ Gt CO\u2082." },
            },
            "Ice Sheet Collapse": {
              aggressive: { risk: "low", outcome: "Stabilized. Temperature at +1.2\u00b0C holds ice sheets. Greenland melt slows. Antarctica stable." },
              moderate: { risk: "moderate", outcome: "Greenland accelerating slowly. West Antarctica showing stress. Multi-century commitment to 1\u20132m rise." },
              bau: { risk: "high", outcome: "West Antarctic Ice Sheet dynamics accelerating. 3\u20135m eventual rise committed. Rate increasing." },
              worst: { risk: "triggered", outcome: "Partial WAIS collapse underway. 1m+ rise by 2050. 5\u201315m committed over centuries." },
            },
            "Permafrost Thaw": {
              aggressive: { risk: "low", outcome: "Limited to discontinuous permafrost zone. Methane release contained. +1.2\u00b0C limits deep thaw." },
              moderate: { risk: "moderate", outcome: "Continuous thaw in southern permafrost. 50\u2013100 Gt CO\u2082-equivalent released by 2050. Manageable." },
              bau: { risk: "high", outcome: "Widespread thaw across 40% of permafrost. 200+ Gt release by 2050. Self-reinforcing feedback loop active." },
              worst: { risk: "triggered", outcome: "Catastrophic thaw. Methane and CO\u2082 release rivals 10%+ of human emissions. Unstoppable." },
            },
            "Coral Reef Die-off": {
              aggressive: { risk: "low", outcome: "Partial recovery underway. Bleaching events declining. Assisted evolution showing results." },
              moderate: { risk: "high", outcome: "Tropical reefs in severe decline. Cooler-water reefs stabilizing. ~40% of reef range persists." },
              bau: { risk: "very high", outcome: "Functionally extinct in tropics by 2045. Only high-latitude refugia remain." },
              worst: { risk: "triggered", outcome: "Total reef collapse. 95%+ gone. Ocean acidification at 790 ppm dissolves remaining structures." },
            },
            "Atlantic Circulation Slowdown": {
              aggressive: { risk: "low", outcome: "AMOC weakens slightly but stabilizes. Temperature control prevents major freshwater influx." },
              moderate: { risk: "moderate", outcome: "AMOC slows 20\u201330%. European winters become more variable. Gulf Stream shifts detectable." },
              bau: { risk: "high", outcome: "AMOC slows 40\u201350%. Northern European cooling despite global warming. Disrupted weather patterns." },
              worst: { risk: "very high", outcome: "AMOC collapse possible by 2050. Dramatic regional climate shifts. European agriculture disrupted." },
            },
            "Monsoon Disruption": {
              aggressive: { risk: "low", outcome: "Monsoon patterns stabilize. Slight intensification managed through infrastructure. 2B people protected." },
              moderate: { risk: "moderate", outcome: "Monsoon becoming more erratic. Dry spells lengthen, wet periods intensify. Adaptation required." },
              bau: { risk: "high", outcome: "Monsoon destabilization affecting 2B+ people. Crop failures from timing shifts. Flood/drought cycles." },
              worst: { risk: "very high", outcome: "Fundamental monsoon disruption. South Asian agriculture in crisis. Mass displacement from floods and droughts." },
            },
          };
          const overviewDesc: Record<string, string> = {
            aggressive: "Under Aggressive Action, the planet in 2050 is on a recovery trajectory. Temperature has stabilized and is beginning to decline. CO\u2082 is falling. Forests are expanding. Biodiversity is recovering. The energy transition is complete. Every tipping point has been avoided. This future requires unprecedented coordination but is physically and economically achievable.",
            moderate: "The Moderate Transition delivers a planet under stress but stabilizing. Temperature approaches 2\u00b0C. CO\u2082 has peaked. Most tipping points are avoided, though narrowly. The energy transition is largely complete. Resources are strained but managed. This is the Paris Agreement scenario \u2014 achievable with sustained political will.",
            bau: "Business as Usual in 2050 is a world of compounding crises. At +3\u00b0C, multiple tipping points are triggered. Half of biodiversity is gone. A billion people face hunger. Water stress affects the majority. The climate system is in a state that will persist for millennia. This is the default trajectory of current policies.",
            worst: "The Worst Case is civilizational crisis. At +4.6\u00b0C, feedback loops have taken warming beyond human control. Every system \u2014 food, water, energy, ecosystems, governance \u2014 is under existential stress. This is not prediction but warning: this is what we risk if coordination fails and tipping points cascade.",
          };
          return (
          <section>
            <Heading icon={"\u{1F4CA}"} title="Climate Dashboard" sub="Planetary indicators, tipping points, and scenario projections \u2014 toggle to compare futures" />

            {/* ── Today's Climate Score ── */}
            <div className="glass-card p-6 mb-8" style={{ borderTop: `3px solid ${gradeColor(overallScore)}` }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                <div className="relative w-28 h-28 flex-shrink-0 mx-auto sm:mx-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={gradeColor(overallScore)} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${overallScore * 2.64} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: gradeColor(overallScore), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(overallScore)}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{overallScore}/100</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Today&apos;s Climate Score</h3>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    A composite assessment of Earth&apos;s climate health across 6 domains, graded on current data (2024 baseline). Overall trend: <strong style={{ color: "#f43f5e" }}>declining</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${gradeColor(projectedScores[s.id])}22`, color: gradeColor(projectedScores[s.id]), border: `1px solid ${gradeColor(projectedScores[s.id])}44` }}>
                      2050 under {s.name}: {letterGrade(projectedScores[s.id])} ({projectedScores[s.id]}/100)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.3)" }}>
                      If trends continue: F (28/100) by 2050
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {climateScores.map(cs => (
                  <div key={cs.domain} className="glass-card p-3 text-center">
                    <span className="text-lg">{cs.icon}</span>
                    <p className="text-xs font-semibold mt-1" style={{ color: "var(--text)" }}>{cs.domain}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className="text-lg font-bold" style={{ color: gradeColor(cs.score), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(cs.score)}</span>
                      <span className="text-sm font-bold" style={{ color: trendColor(cs.trend) }}>{trendArrow(cs.trend)}</span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>{cs.score}/100</p>
                    <p className="text-[9px] mt-1 leading-tight" style={{ color: "var(--text-muted)" }}>{cs.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2024 baseline stats */}
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>2024 Baseline (today)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Stat label="Global Temp Rise" value={`+${data.metrics.globalTemp2024}\u00b0C`} sub="vs pre-industrial" color="var(--rose)" />
              <Stat label="CO\u2082 Concentration" value={`${data.metrics.co2ppm2024} ppm`} sub="atmospheric" color="var(--amber)" />
              <Stat label="Annual Emissions" value={`${data.metrics.annualEmissions_gt} Gt`} sub="CO\u2082/year" color="var(--teal)" />
              <Stat label="Renewable Capacity" value={`${fmtK(data.metrics.renewableCapacity_gw)} GW`} sub="installed globally" color="var(--emerald)" />
            </div>

            {/* Scenario selector */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a climate scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to update the 2050 projections and all charts below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.scenarios.map(sc => (
                  <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sc.icon}</span><span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.name}</span></div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>{sc.desc}</p>
                    {activeScenario === sc.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* 2050 projected stats */}
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: s.color }}>2050 Projection: {s.name}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <Stat label="Global Temp Rise" value={`${st.temp}\u00b0C`} sub="by 2050" color="var(--rose)" />
              <Stat label="CO\u2082 Concentration" value={`${st.co2} ppm`} sub="by 2050" color="var(--amber)" />
              <Stat label="Annual Emissions" value={`${st.emissions} Gt`} sub="CO\u2082/year" color="var(--teal)" />
              <Stat label="Renewables" value={`${st.renewPct}%`} sub="of electricity" color="var(--emerald)" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Stat label="Forest Cover" value={`${st.forest}%`} sub="of land surface" color="var(--emerald)" />
              <Stat label="Water Stress" value={`${st.water}%`} sub="of population" color="var(--sky)" />
              <Stat label="Climate Displaced" value={`${st.displaced}M`} sub="people/year" color="var(--rose)" />
              <Stat label="Green Finance" value={`$${st.finance}T`} sub="annual flows" color="var(--teal)" />
            </div>

            {/* Temperature scenario preview */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Global Temperature Trajectories</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Four scenarios from 2026 to 2050 (\u00b0C above pre-industrial)</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={scenarioChartData.temp}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[1, 5]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Line key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} dot={false} name={sc.name} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tipping points — scenario-aware */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Climate Tipping Points</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Status under <strong style={{ color: s.color }}>{s.name}</strong> by 2050</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.tippingPoints.map(tp => {
                  const tpS = tpScenario[tp.name]?.[s.id] || { risk: tp.risk, outcome: "" };
                  return (
                    <div key={tp.name} className="glass-card p-4" style={{ borderLeft: `3px solid ${tp.color}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{tp.icon}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{tp.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${riskColor(tpS.risk)}22`, color: riskColor(tpS.risk), border: `1px solid ${riskColor(tpS.risk)}44` }}>{tpS.risk}</span>
                        </div>
                      </div>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}><strong style={{ color: "var(--text-faint)" }}>Threshold:</strong> {tp.threshold}</p>
                      {tpS.outcome ? (
                        <p className="text-[11px] leading-relaxed mt-2 pt-2" style={{ color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>{tpS.outcome}</p>
                      ) : (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}><strong style={{ color: "var(--text-faint)" }}>Impact:</strong> {tp.impact}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overview summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${s.color}` }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                <span className="text-lg">{s.icon}</span> The Planet in 2050: {s.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{overviewDesc[s.id]}</p>
            </div>
          </section>
          );
        })()}

        {/* ════════════════════ SCENARIOS ════════════════════ */}
        {tab === "scenarios" && (
          <section>
            <Heading icon={"\u{1F52E}"} title="Climate Scenarios" sub="Four divergent futures depending on our collective response. Every chart shows 2026\u20132050 projections." />

            {/* Scenario selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a climate scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to update all charts and projections below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.scenarios.map(s => (
                <button key={s.id} onClick={() => setActiveScenario(s.id)}
                  className={`glass-card p-5 text-left w-full transition-all hover:border-white/20 ${activeScenario === s.id ? "ring-2" : ""}`}
                  style={activeScenario === s.id ? { borderColor: `${s.color}55`, boxShadow: `0 0 20px ${s.color}11` } : {}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <h4 className="text-sm font-semibold" style={{ color: s.color }}>{s.name}</h4>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                  <div className="flex gap-3 mt-3 text-[10px]">
                    <span style={{ color: s.color }}>+{s.tempRise[24]}\u00b0C by 2050</span>
                    <span style={{ color: "var(--text-faint)" }}>{s.seaLevel[24]}mm rise</span>
                  </div>
                  {activeScenario === s.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: s.color }}>Active</div>}
                </button>
              ))}
              </div>
            </div>

            {/* Comparison charts with scenario-aware descriptions */}
            {(() => {
              const s = data.scenarios.find(sc => sc.id === activeScenario);
              if (!s) return null;

              const tempDesc: Record<string, string> = {
                aggressive: "Under aggressive action, global temperatures peak near +1.2\u00b0C around the mid-2030s before beginning a slow decline. Immediate emissions cuts, massive reforestation, and a fully decarbonized grid halt the warming trajectory. By 2050, temperatures have stabilized at +1.17\u00b0C \u2014 the only scenario that stays well within the 1.5\u00b0C Paris target and begins to reverse the trend.",
                moderate: "The moderate transition holds warming to roughly +1.8\u00b0C by 2050. A gradual fossil fuel phase-out and strong adaptation investment bend the curve, but not fast enough to avoid breaching 1.5\u00b0C in the early 2030s. The rate of warming slows considerably after 2035, but each decade still adds roughly 0.15\u00b0C, meaning the 2\u00b0C guardrail is within reach but not guaranteed.",
                bau: "Business as usual drives temperatures to nearly +3\u00b0C by 2050. Slow emissions decline and continued fossil dependence produce relentless, linear warming \u2014 about 0.08\u00b0C per year. Multiple tipping points are likely breached in the 2040s, and the trajectory shows no sign of flattening, suggesting 3.5\u201d4\u00b0C is locked in for the century.",
                worst: "The worst-case scenario sees temperatures rocket past +4.6\u00b0C by 2050, driven by cascading feedback loops: permafrost thaw releasing methane, Amazon dieback converting forest to savanna, and ice-albedo loss accelerating polar warming. The warming curve is exponential through the 2030s and only begins to slow as feedback loops saturate. This is a fundamentally different planet.",
              };

              const seaDesc: Record<string, string> = {
                aggressive: "Sea levels rise approximately 49mm by 2050 \u2014 about 2mm per year, consistent with thermal expansion from heat already absorbed by the oceans. The rate of rise decelerates after 2040 as ice sheet contributions stabilize. Coastal cities face manageable adaptation challenges, and no major population displacement is required.",
                moderate: "A 136mm rise by 2050 reflects steady contributions from Greenland and Antarctic ice melt alongside thermal expansion. The acceleration is modest but persistent \u2014 roughly 5\u20136mm/year by the 2040s. Low-lying island nations and delta cities face significant flooding risk, requiring substantial infrastructure investment.",
                bau: "332mm of sea level rise by 2050 signals accelerating ice sheet dynamics. The rate roughly doubles each decade, reaching 12\u201315mm/year by the late 2040s. Major coastal infrastructure \u2014 ports, airports, power plants, water treatment facilities \u2014 faces chronic inundation. Tens of millions of people are at displacement risk.",
                worst: "Over one meter of rise (1,072mm) by 2050 indicates partial West Antarctic Ice Sheet collapse has begun. The rate accelerates dramatically after 2035, exceeding 80mm/year by the late 2040s. Entire coastal cities become uninhabitable. This triggers the largest forced migration in human history and trillions in stranded assets.",
              };

              const co2Desc: Record<string, string> = {
                aggressive: "CO\u2082 concentration peaks at 422 ppm around 2028 and then declines steadily to 366 ppm by 2050 \u2014 the first sustained atmospheric drawdown in modern history. This requires not just net-zero emissions but net-negative: massive direct air capture, ocean alkalinity enhancement, and reforestation pulling 5\u201310 Gt/year from the atmosphere.",
                moderate: "CO\u2082 peaks around 435 ppm in the early 2030s before beginning a slow decline to 395 ppm by 2050. The drawdown is real but gradual \u2014 about 1.5 ppm/year \u2014 reflecting the time lag between emissions cuts and atmospheric concentration response. Pre-industrial levels (280 ppm) remain centuries away.",
                bau: "CO\u2082 climbs steadily to 551 ppm by 2050, more than double pre-industrial levels. There is no peak in sight \u2014 annual additions of 5\u20136 ppm continue unabated. At this concentration, the planet\u2019s carbon cycle feedbacks are under severe stress, and forests begin transitioning from carbon sinks to carbon sources.",
                worst: "CO\u2082 surges to 790 ppm by 2050, driven by both continued emissions and massive natural carbon releases from thawing permafrost and dying forests. The atmosphere is absorbing carbon faster than at any point in at least 55 million years. Ocean acidification at this level threatens the base of marine food chains.",
              };

              const bioDesc: Record<string, string> = {
                aggressive: "The biodiversity index rises to 125 by 2050 \u2014 a 25% recovery above the 2026 baseline. Aggressive habitat restoration, 30% protected land and ocean targets exceeded, rewilding corridors reconnecting fragmented ecosystems, and pollution controls allow species populations to rebound. Insect populations stabilize, coral reefs begin recovering, and extinction rates fall toward historical baselines.",
                moderate: "Biodiversity declines to 84 by the mid-2030s before beginning a slow recovery to 94 by 2050. The 30x30 targets are partially met, and key ecosystems stabilize, but recovery is uneven \u2014 tropical forests and coral reefs lag behind temperate ecosystems. The extinction rate slows but remains 100\u2013500x the natural baseline.",
                bau: "A steady, relentless decline to an index of 52 by 2050 \u2014 nearly half of 2026 levels lost. Habitat destruction, pollution, invasive species, and climate stress compound. The Amazon approaches its dieback tipping point. Coral reefs are functionally extinct in tropical waters. Insect populations crash further, threatening pollination of 75% of food crops.",
                worst: "Catastrophic biodiversity collapse to an index of 19 \u2014 an 81% loss from baseline. Multiple biomes undergo state changes: Amazon becomes savanna, boreal forests die back, coral reefs vanish entirely, wetlands dry out. The sixth mass extinction accelerates beyond anything in the geological record. Ecosystem services \u2014 pollination, water filtration, soil formation \u2014 fail at scale.",
              };

              const renewDesc: Record<string, string> = {
                aggressive: "Renewable energy reaches 99% of global electricity by 2050. Solar and wind dominate, supported by grid-scale storage exceeding 2 TWh globally. Nuclear provides baseload in regions with existing capacity. The last coal plant closes before 2035, and natural gas is relegated to emergency backup. The energy transition is the fastest industrial transformation in history.",
                moderate: "Renewables reach 88% by 2050 \u2014 a strong but incomplete transition. Solar and wind are the cheapest sources everywhere, but grid modernization in developing nations lags. Natural gas persists as a bridge fuel in heavy industry and some power grids. The transition creates 40+ million new jobs but leaves stranded fossil fuel communities needing support.",
                bau: "Renewables stall at 64% by 2050. Coal declines but natural gas fills the gap rather than clean sources. Utility-scale storage remains underfunded. Developing nations, unable to access green finance at scale, continue building fossil infrastructure. The grid is cleaner than 2026 but falls far short of what\u2019s needed to stabilize the climate.",
                worst: "Renewables barely reach 42% by 2050. Policy paralysis, fossil fuel lobbying, and geopolitical fragmentation prevent coordinated investment. Grid instability in regions dependent on intermittent renewables without storage leads to public backlash. New coal plants are still being built in 2040. The energy system locks in 3\u20134\u00b0C of warming.",
              };

              const cropDesc: Record<string, string> = {
                aggressive: "Crop yields increase 23% above the 2026 baseline by 2050. Cooler temperatures, restored pollinators, regenerative agriculture practices covering 40% of farmland, precision irrigation, and reduced food waste combine to make the food system more productive and resilient. Hunger falls below 300 million people for the first time.",
                moderate: "Crop yields fluctuate but return to roughly baseline (102) by 2050. Heat stress and water scarcity reduce yields in tropical regions, but gains in temperate zones, improved varieties, and adaptation investments offset losses. Food prices are volatile but manageable. Roughly 500 million people remain food-insecure.",
                bau: "Yields decline to 69% of baseline by 2050 \u2014 a 31% loss. Heat waves, droughts, soil degradation, and pollinator collapse hit tropical and subtropical agriculture hardest. Breadbasket regions (U.S. Midwest, North China Plain, Indo-Gangetic Plain) face chronic water stress. Food prices triple in real terms. Over one billion people face hunger.",
                worst: "A catastrophic 70% decline in crop yields by 2050. Multiple breadbasket failures occur simultaneously by the 2040s. Topsoil loss, aquifer depletion, extreme heat, and pollinator extinction create compounding failures. The global food system can no longer feed 9 billion people. Famine becomes a leading cause of death and the primary driver of mass migration.",
              };

              const waterDesc: Record<string, string> = {
                aggressive: "Water stress declines from 26% to 15% of the global population by 2050. Massive investment in desalination, water recycling, watershed restoration, and precision agriculture reduces demand while improving supply. Aquifers begin recharging in regions where extraction has been reduced. The water-energy-food nexus is actively managed.",
                moderate: "Water stress peaks around 30% in the mid-2030s before declining to 25% by 2050, roughly returning to today\u2019s levels. Adaptation measures help, but glacial melt in the Himalayas, Andes, and Alps reduces seasonal water availability for 2 billion people. Desalination scales but remains energy-intensive.",
                bau: "Water stress climbs relentlessly to 56% of the global population by 2050. Aquifer depletion, glacial loss, altered precipitation patterns, and growing demand create chronic shortages across South Asia, the Middle East, North Africa, and parts of the Americas. Water becomes a primary driver of conflict and migration.",
                worst: "88% of the global population faces water stress by 2050. Glaciers that feed major river systems (Ganges, Yangtze, Colorado, Nile) are largely gone. Groundwater reserves are critically depleted. Megacities face day-zero water crises annually. Agriculture competes directly with urban water needs, and both lose.",
              };

              const forestDesc: Record<string, string> = {
                aggressive: "Forest cover expands from 31% to 42.3% of land surface by 2050 \u2014 the most significant reforestation in centuries. The Trillion Tree Initiative, Great Green Wall, and rewilding programs restore 11 percentage points of forest. The Amazon stabilizes well below its tipping point. Forests return to being a net carbon sink, absorbing 7\u201310 Gt CO\u2082/year.",
                moderate: "Forest cover stabilizes around 31% through the 2030s and then begins recovering to 35.3% by 2050. Deforestation slows dramatically as commodity-driven clearing is curtailed, but restoration is slow \u2014 it takes decades for planted forests to reach full carbon sequestration capacity. The Amazon remains under pressure but avoids dieback.",
                bau: "Forest cover declines from 31% to 21.3% by 2050. Continued deforestation for agriculture, urban expansion, and timber, compounded by wildfire and drought stress, erases a third of remaining forests. The Amazon crosses its tipping point in the early 2040s. Forests flip from carbon sink to carbon source, accelerating warming.",
                worst: "Forest cover collapses to 8.5% by 2050. The Amazon, boreal forests, and Southeast Asian rainforests undergo catastrophic dieback. Wildfires become uncontrollable across multiple continents. The loss of 22.5 percentage points of forest cover releases hundreds of gigatonnes of stored carbon, creating a self-reinforcing warming spiral that no human intervention can reverse on decadal timescales.",
              };

              const charts = [
                { key: "temp" as const, title: "Global Temperature (\u00b0C)", domain: [1, 5] as [number, number], desc: tempDesc },
                { key: "sea" as const, title: "Sea Level Rise (mm)", domain: undefined, desc: seaDesc },
                { key: "co2" as const, title: "CO\u2082 Concentration (ppm)", domain: undefined, desc: co2Desc },
                { key: "bio" as const, title: "Biodiversity Index", domain: [0, 130] as [number, number], desc: bioDesc },
                { key: "renew" as const, title: "Renewable Energy Share (%)", domain: [0, 100] as [number, number], desc: renewDesc },
                { key: "crop" as const, title: "Crop Yield Index", domain: [0, 130] as [number, number], desc: cropDesc },
                { key: "water" as const, title: "Population Under Water Stress (%)", domain: [0, 100] as [number, number], desc: waterDesc },
                { key: "forest" as const, title: "Forest Cover (% of land)", domain: [0, 50] as [number, number], desc: forestDesc },
              ];

              const summaryDesc: Record<string, string> = {
                aggressive: `Under the Aggressive Action scenario, the world in 2050 is fundamentally different from the trajectory we\u2019re on today. Temperatures have stabilized at +1.2\u00b0C and are beginning to decline. CO\u2082 has dropped to 366 ppm \u2014 the first sustained atmospheric drawdown. Sea levels have risen a manageable 49mm. Renewables power 99% of the grid. Forests have expanded to 42% of land surface, biodiversity is 25% above 2026 levels, crop yields are up 23%, and water stress has been cut nearly in half. This is not a utopia \u2014 it requires the most ambitious global cooperation in human history, sustained over decades \u2014 but it is physically achievable. Every year of delay narrows the window.`,
                moderate: `The Moderate Transition delivers a livable but stressed world by 2050. Temperatures reach +1.8\u00b0C, just under the 2\u00b0C guardrail. CO\u2082 peaks and begins declining. Sea level rise of 136mm is significant but manageable with adaptation. Renewables reach 88% of the grid. Biodiversity has suffered but is recovering. Crop yields are roughly stable, and water stress returns to current levels. This scenario is roughly aligned with current Paris Agreement pledges \u2014 if they\u2019re actually implemented. The danger is complacency: the moderate path avoids catastrophe but leaves little margin for error, and many tipping points remain dangerously close.`,
                bau: `Business as Usual produces a world in deep and accelerating crisis by 2050. At +3\u00b0C, multiple tipping points have been crossed. CO\u2082 at 551 ppm is still climbing. Sea levels are up 332mm and accelerating. Renewables have only reached 64%. Half the world\u2019s biodiversity is gone, crop yields have fallen 31%, over half the population faces water stress, and a third of forests have been lost. This is not a distant future \u2014 it is the trajectory of current policies. Every metric shows acceleration, not stabilization. The compounding nature of these crises means that by 2050, the cost of action will be orders of magnitude higher than it would have been in 2026.`,
                worst: `The Worst Case scenario depicts civilizational crisis by 2050. At +4.6\u00b0C, the climate system has entered a state unprecedented in human history. CO\u2082 at 790 ppm has triggered runaway feedback loops. Over one meter of sea level rise has begun displacing hundreds of millions. Renewables at 42% reflect systemic failure to coordinate. Biodiversity has collapsed by 81%. Crop yields have fallen 70%, threatening global famine. 88% of humanity faces water stress. Forests have been reduced to 8.5% of land surface, releasing vast carbon stores. This scenario is not inevitable \u2014 it requires sustained policy failure and bad luck with tipping points \u2014 but it is within the range of possibility. It exists to show what we\u2019re actually risking.`,
              };

              return (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {charts.map(chart => (
                      <div key={chart.key} className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{chart.title}</h3>
                        <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>All four scenarios, 2026\u20132050</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={scenarioChartData[chart.key]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                            <YAxis domain={chart.domain} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            {data.scenarios.map(sc => (
                              <Line key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color}
                                strokeWidth={activeScenario === sc.id ? 3 : 1.5}
                                strokeOpacity={activeScenario === sc.id ? 1 : 0.4}
                                dot={false} name={sc.name} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{chart.desc[s.id]}</p>
                      </div>
                    ))}
                  </div>

                  {/* Scenario detail stats */}
                  <div className="glass-card p-6 mt-8" style={{ borderLeft: `3px solid ${s.color}` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{s.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: s.color }}>{s.name}</h3>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{ color: s.color }}>+{s.tempRise[24]}\u00b0C</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Temp by 2050</p></div>
                      <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{ color: s.color }}>{s.seaLevel[24]}mm</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Sea level rise</p></div>
                      <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{ color: s.color }}>{s.co2ppm[24]} ppm</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>CO\u2082 in 2050</p></div>
                      <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{ color: s.color }}>{s.renewableShare[24]}%</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Renewables 2050</p></div>
                    </div>
                  </div>

                  {/* Comprehensive summary */}
                  <div className="glass-card p-6 mt-6" style={{ borderLeft: `3px solid ${s.color}` }}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                      <span className="text-lg">{s.icon}</span> The World in 2050: {s.name}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{summaryDesc[s.id]}</p>
                  </div>
                </>
              );
            })()}
          </section>
        )}

        {/* ════════════════════ BIODIVERSITY ════════════════════ */}
        {tab === "biodiversity" && (() => {
          const s = data.scenarios.find(sc => sc.id === activeScenario)!;
          const bioIndexDesc: Record<string, string> = {
            aggressive: "Under aggressive action, the biodiversity index recovers to 125 by 2050 \u2014 a 25% gain above baseline. Habitat restoration at unprecedented scale, 30% protected land and ocean targets exceeded, rewilding corridors reconnecting fragmented ecosystems, and strict pollution controls allow species populations to rebound. Insect populations stabilize by the mid-2030s, and coral reefs begin showing signs of recovery. The extinction rate drops toward 10\u201350x the natural baseline \u2014 still elevated, but no longer accelerating.",
            moderate: "Biodiversity declines to 84 by the mid-2030s before a slow recovery to 94 by 2050. The 30x30 protected area targets are partially met. Key ecosystems stabilize but recovery is uneven \u2014 temperate forests and grasslands bounce back, while tropical forests and coral reefs lag behind. The extinction rate slows but remains 100\u2013500x the natural baseline. Pollinator populations partially recover, preventing the worst agricultural impacts.",
            bau: "A steady, grinding decline to an index of 52 \u2014 nearly half of all monitored biodiversity lost by 2050. Habitat destruction for agriculture and urban expansion continues. The Amazon approaches its dieback tipping point around 2040. Coral reefs are functionally extinct in tropical waters by 2045. Insect populations crash further, directly threatening pollination of 75% of food crops. Marine ecosystems collapse under acidification and overfishing pressure.",
            worst: "Catastrophic collapse to an index of 19 \u2014 an 81% loss from the 2026 baseline. Multiple biomes undergo irreversible state changes: Amazon becomes dry savanna, boreal forests die back and burn, coral reefs vanish entirely, wetlands dry out as water tables drop. The sixth mass extinction accelerates beyond anything in the geological record. Ecosystem services that humanity depends on \u2014 pollination, water filtration, soil formation, carbon sequestration \u2014 fail at civilizational scale.",
          };
          const forestBioDesc: Record<string, string> = {
            aggressive: "Forest cover expands from 31% to 42.3% of land surface \u2014 the greatest reforestation in centuries. The Trillion Tree Initiative reaches its goal. The Great Green Wall restores the Sahel. Rewilding programs reconnect habitat corridors across continents. The Amazon stabilizes well below its tipping threshold. Forests return to being a powerful net carbon sink, absorbing 7\u201310 Gt CO\u2082/year and providing habitat for the species recovery visible in the biodiversity index.",
            moderate: "Forest cover holds steady through the early 2030s, then begins recovering to 35.3% by 2050. Deforestation slows as commodity-driven clearing is curtailed, but restoration is gradual \u2014 planted forests take decades to develop full ecological function. The Amazon remains under pressure from drought and fragmentation but narrowly avoids its tipping point. Boreal forests face increasing wildfire but are largely intact.",
            bau: "Forest cover declines from 31% to 21.3% by 2050 \u2014 a loss of nearly one-third. Agricultural expansion, logging, and wildfire consume forests faster than any restoration effort can replace them. The Amazon crosses its dieback tipping point in the early 2040s, beginning an irreversible transition to savanna that releases tens of gigatonnes of stored carbon. Southeast Asian rainforests are reduced to fragmented islands.",
            worst: "A collapse to 8.5% forest cover \u2014 less than a third of today\u2019s levels. The Amazon, boreal forests, and Southeast Asian rainforests all undergo catastrophic dieback driven by heat stress, drought, and mega-fires. The loss of 22.5 percentage points of forest releases hundreds of gigatonnes of stored carbon into the atmosphere, creating a self-reinforcing warming spiral. Remaining forests are fragmented, fire-prone, and ecologically impoverished.",
          };
          const bioSummary: Record<string, string> = {
            aggressive: `In the Aggressive Action scenario, biodiversity in 2050 is on a genuine recovery trajectory. The index has climbed 25% above baseline as protected areas exceed 30% of land and ocean, habitat corridors reconnect ecosystems, and forest cover reaches 42%. Coral reefs are beginning to recover as ocean temperatures stabilize. Insect and pollinator populations have turned the corner. This recovery is not yet complete \u2014 extinction debt from past damage will continue for decades \u2014 but the direction has fundamentally reversed. The living systems that underpin human civilization are healing.`,
            moderate: `The Moderate Transition delivers a world where biodiversity has been battered but is stabilizing. The index sits at 94, down from 100 but no longer falling. Forest cover has recovered to 35%. Key ecosystems like the Amazon have survived their tipping points, though barely. Coral reefs remain in critical condition in tropical waters but are recovering in cooler regions. The rate of species loss has slowed significantly. This is a world that avoided catastrophe through sustained effort, but the margin was razor-thin, and full recovery will take the rest of the century.`,
            bau: `Business as Usual leaves the planet\u2019s living systems in crisis by 2050. Nearly half of monitored biodiversity is gone. Forests have shrunk to 21% of land surface with the Amazon in active dieback. Coral reefs are functionally extinct in the tropics. Pollinator collapse is directly reducing crop yields. Marine ecosystems are degrading under acidification, warming, and overfishing. The natural systems that filter water, build soil, pollinate crops, and regulate climate are failing. Ecological collapse is no longer a future risk \u2014 it is the present reality, and it is accelerating.`,
            worst: `The Worst Case is an extinction event. Biodiversity has collapsed by 81%. Forests cover just 8.5% of land surface. Every major biome has undergone irreversible state change. The Amazon is savanna. Boreal forests have burned. Coral reefs exist only in museum displays. The web of life that took billions of years to evolve has been shattered in a single human lifetime. Ecosystem services have failed at scale \u2014 pollination, water purification, soil regeneration, carbon cycling are all critically impaired. The biosphere can no longer support 9 billion humans at any standard of living. This is the scenario that makes all other crises irreversible.`,
          };
          return (
          <section>
            <Heading icon={"\u{1F33F}"} title="Biodiversity & Ecosystems" sub="Species under threat, ecosystem health, and restoration efforts \u2014 viewed through four possible futures" />

            {/* Scenario selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a climate scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to update all biodiversity charts and projections below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.scenarios.map(sc => (
                <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                  <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sc.icon}</span><span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.name}</span></div>
                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>{sc.desc}</p>
                  {activeScenario === sc.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                </button>
              ))}
              </div>
            </div>

            {(() => {
              const bioStats: Record<string, { threatened: number; extinctionRate: string; protectedLand: number; protectedOcean: number }> = {
                aggressive: { threatened: 28000, extinctionRate: "100x baseline", protectedLand: 37.5, protectedOcean: 32.0 },
                moderate:   { threatened: 38000, extinctionRate: "400x baseline", protectedLand: 26.0, protectedOcean: 18.0 },
                bau:        { threatened: 62000, extinctionRate: "2500x baseline", protectedLand: 14.0, protectedOcean: 7.5 },
                worst:      { threatened: 95000, extinctionRate: "10000x baseline", protectedLand: 8.0, protectedOcean: 4.0 },
              };
              const bs = bioStats[s.id];
              return (
              <>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: s.color }}>2050 Projection: {s.name}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <Stat label="Species Threatened" value={fmtK(bs.threatened)} sub={`of ${fmtK(data.biodiversity.speciesAssessed)} assessed`} color="var(--rose)" />
                  <Stat label="Extinction Rate" value={bs.extinctionRate} color="var(--amber)" />
                  <Stat label="Protected Land" value={`${bs.protectedLand}%`} sub={`target: ${data.biodiversity.targetProtectedPct}%`} color="var(--emerald)" />
                  <Stat label="Protected Ocean" value={`${bs.protectedOcean}%`} sub={`target: ${data.biodiversity.targetProtectedPct}%`} color="var(--sky)" />
                </div>
              </>
              );
            })()}

            {/* Key Ecosystems — scenario-aware */}
            {(() => {
              const ecoScenarioData: Record<string, Record<string, { status: string; current: string; outlook: string }>> = {
                "Amazon Rainforest": {
                  aggressive: { status: "recovering", current: "Deforestation halted; 12% reforested since 2026", outlook: "Stabilized well below the 20\u201325% dieback threshold. Indigenous land management and restoration corridors reconnect fragmented areas. The Amazon returns to being a net carbon sink by the late 2030s." },
                  moderate: { status: "stressed", current: "Deforestation slowed to 0.3%/yr; 18% cleared", outlook: "Narrowly avoids tipping point. Commodity-driven clearing curtailed but drought frequency rising. Ecosystem function intact but fragile \u2014 one severe drought season away from irreversible change." },
                  bau: { status: "critical", current: "22% deforested \u2014 approaching tipping point", outlook: "Crosses the 20\u201325% dieback threshold in the early 2040s. Begins irreversible transition from rainforest to savanna, releasing 30\u201350 Gt of stored carbon. Rainfall patterns shift across South America." },
                  worst: { status: "collapsed", current: "40%+ deforested \u2014 dieback underway", outlook: "Full dieback in progress. The Amazon is transitioning to dry savanna, releasing over 100 Gt of carbon. Regional rainfall has collapsed. This is irreversible on any human timescale." },
                },
                "Coral Reefs": {
                  aggressive: { status: "recovering", current: "Bleaching events declining; 35% recovery", outlook: "Ocean temperatures stabilizing at +1.2\u00b0C allows partial reef recovery. Assisted evolution and coral gardening programs show results. Full recovery will take decades, but the trajectory has reversed." },
                  moderate: { status: "severe", current: "60% bleached; tropical reefs declining", outlook: "At +1.8\u00b0C, tropical reefs continue to degrade but cooler-water reefs stabilize. Mass bleaching events become less frequent after 2040. Functional reef ecosystems persist in ~40% of current range." },
                  bau: { status: "critical", current: "80% bleached; functional extinction in tropics", outlook: "At +3\u00b0C, coral reefs are functionally extinct in tropical waters by 2045. Remaining reefs are limited to high-latitude refugia. Marine biodiversity collapses as reef ecosystems disappear." },
                  worst: { status: "collapsed", current: "95%+ bleached; reefs functionally extinct", outlook: "Total reef collapse. Ocean acidification at 790 ppm dissolves calcium carbonate structures. The entire reef ecosystem \u2014 supporting 25% of marine species \u2014 is gone. Irreversible." },
                },
                "Arctic Sea Ice": {
                  aggressive: { status: "stabilizing", current: "Summer minimum stabilized at 3.8M km\u00b2", outlook: "Temperature stabilization at +1.2\u00b0C prevents ice-free summers. Multi-year ice begins slow recovery. Arctic ecosystems face reduced pressure. The albedo feedback loop is contained." },
                  moderate: { status: "declining", current: "Summer minimum 2.5M km\u00b2; seasonal ice-free likely", outlook: "First ice-free September expected by late 2030s but winter refreezing continues. Arctic shipping routes open seasonally. Polar bear and seal populations decline but persist." },
                  bau: { status: "critical", current: "Ice-free summers by 2035; winter ice thinning", outlook: "Arctic is routinely ice-free in summer. Winter ice coverage shrinks to 60% of historical range. Albedo feedback accelerates warming by an additional 0.3\u00b0C. Arctic ecosystems undergo fundamental transformation." },
                  worst: { status: "collapsed", current: "Near year-round ice loss; permafrost thaw accelerating", outlook: "Arctic ice effectively gone in summer and severely diminished in winter. Massive permafrost thaw releases methane and CO\u2082 at scale. The Arctic amplifies global warming rather than moderating it." },
                },
                "Boreal Forests": {
                  aggressive: { status: "recovering", current: "Fire management effective; 15% stressed", outlook: "Reduced warming limits wildfire expansion. Permafrost stabilizes in most areas. Managed forestry and fire prevention allow boreal ecosystems to adapt. The boreal zone remains the world\u2019s largest terrestrial carbon sink." },
                  moderate: { status: "stressed", current: "30% stressed; wildfire seasons lengthening", outlook: "Wildfire area doubles from 2026 levels but active management prevents catastrophic loss. Permafrost thaw accelerates in discontinuous zone. Southern boreal boundary shifts northward by 100\u2013200 km." },
                  bau: { status: "critical", current: "50% stressed; mega-fires annual occurrence", outlook: "Boreal forests enter a fire-dominated regime. Permafrost thaw across 40% of the zone releases 50\u2013100 Gt of stored carbon by 2050. Southern boreal forests die back, replaced by grassland and shrub." },
                  worst: { status: "collapsed", current: "70%+ stressed; large-scale dieback", outlook: "Boreal forests in active collapse. Unprecedented mega-fires burn areas the size of countries annually. Permafrost thaw is self-reinforcing. The boreal zone flips from carbon sink to carbon source, accelerating warming by an additional 0.5\u00b0C+." },
                },
                "Wetlands": {
                  aggressive: { status: "recovering", current: "Restoration active; 13.5M km\u00b2", outlook: "Wetland restoration becomes a priority for carbon sequestration and water management. Protected area expansion covers 30% of remaining wetlands. Net wetland area increases for the first time in 50 years." },
                  moderate: { status: "declining", current: "12.1M km\u00b2; loss rate halved", outlook: "Wetland loss slows but doesn\u2019t stop. Agricultural drainage continues in developing nations. Water table management improves in developed nations. Peatlands remain under pressure from drainage and fire." },
                  bau: { status: "critical", current: "9.5M km\u00b2; 22% lost since 2026", outlook: "Continued drainage for agriculture, water table drops from groundwater overuse, and peatland fires destroy wetlands at accelerating pace. Peat decomposition releases 2\u20134 Gt CO\u2082/year." },
                  worst: { status: "collapsed", current: "6M km\u00b2; 50% lost since 2026", outlook: "Catastrophic wetland loss. Peatlands dry out and burn across Southeast Asia, Russia, and Africa. Freshwater filtration services fail. Migratory bird populations collapse. Wetland carbon stores released at scale." },
                },
                "Mangroves": {
                  aggressive: { status: "thriving", current: "50% restoration achieved; expanding", outlook: "Global Mangrove Alliance targets met. Coastal protection and blue carbon sequestration drive investment. Mangrove coverage exceeds 2000 levels. Coastal communities benefit from storm protection and fisheries recovery." },
                  moderate: { status: "recovering", current: "Restoration gaining pace; net stable", outlook: "Mangrove loss halted in most regions. Restoration programs show results in Southeast Asia and West Africa. Sea level rise at 136mm is manageable for most mangrove systems." },
                  bau: { status: "declining", current: "15% lost since 2026; coastal squeeze", outlook: "Sea level rise and coastal development squeeze mangroves from both sides. Aquaculture and urban expansion continue to destroy mangrove habitat in Southeast Asia. Coastal flooding risk increases for 100M+ people." },
                  worst: { status: "critical", current: "40% lost; sea level rise overwhelming", outlook: "Over 1 meter of sea level rise drowns mangrove systems faster than they can migrate inland. Coastal development blocks retreat. Mangrove ecosystems collapse across low-lying tropical coasts." },
                },
              };
              return (
              <div className="glass-card p-6 mb-8">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Key Ecosystem Status</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Projected 2050 state under <strong style={{ color: s.color }}>{s.name}</strong></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.biodiversity.keyEcosystems.map(eco => {
                    const sd = ecoScenarioData[eco.name]?.[s.id] || { status: eco.status, current: eco.current, outlook: "" };
                    return (
                      <div key={eco.name} className="glass-card p-4" style={{ borderLeft: `3px solid ${eco.color}` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{eco.icon}</span>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{eco.name}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${statusColor(sd.status)}22`, color: statusColor(sd.status), border: `1px solid ${statusColor(sd.status)}44` }}>{sd.status}</span>
                          </div>
                        </div>
                        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}><strong style={{ color: "var(--text-faint)" }}>Tipping point:</strong> {eco.tippingPoint}</p>
                        <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}><strong style={{ color: "var(--text-faint)" }}>State:</strong> {sd.current}</p>
                        {sd.outlook && <p className="text-[11px] leading-relaxed pt-2" style={{ color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>{sd.outlook}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })()}

            {/* Biodiversity index chart */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Biodiversity Index by Scenario</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>Indexed to 100 = 2026 baseline</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scenarioChartData.bio}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[0, 130]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Area key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} fill="none" strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} name={sc.name} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{bioIndexDesc[s.id]}</p>
            </div>

            {/* Forest cover chart */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Forest Cover (% of land)</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>Forests are the planet\u2019s largest terrestrial carbon sink and biodiversity reservoir</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scenarioChartData.forest}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[0, 50]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Area key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} fill="none" strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} name={sc.name} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{forestBioDesc[s.id]}</p>
            </div>

            {/* Restoration Projects — scenario-aware */}
            {(() => {
              const rpScenario: Record<string, Record<string, { progress: number; status: string; note: string }>> = {
                "Great Green Wall (Sahel)": {
                  aggressive: { progress: 95, status: "thriving", note: "8,000 km restored. Sahel greening accelerates. 20M livelihoods secured." },
                  moderate: { progress: 55, status: "recovering", note: "4,400 km restored. Progress steady but funding gaps in eastern sections." },
                  bau: { progress: 22, status: "stressed", note: "1,760 km restored. Desertification outpacing restoration in some regions." },
                  worst: { progress: 8, status: "collapsed", note: "640 km restored but drought reverses gains. Sahel desertification accelerates." },
                },
                "Trillion Tree Initiative": {
                  aggressive: { progress: 100, status: "thriving", note: "1 trillion trees planted and surviving. Net forest gain of 11% of land area." },
                  moderate: { progress: 60, status: "recovering", note: "600B trees. Strong in temperate zones. Tropical planting hampered by land pressure." },
                  bau: { progress: 25, status: "stressed", note: "250B trees. Planting continues but deforestation elsewhere erases 60% of gains." },
                  worst: { progress: 5, status: "collapsed", note: "50B trees. Mega-fires and drought kill planted forests faster than they grow." },
                },
                "Ocean Cleanup": {
                  aggressive: { progress: 75, status: "recovering", note: "75% of ocean plastic removed. Microplastic filtration at river mouths. Production bans." },
                  moderate: { progress: 35, status: "stressed", note: "35% removed. Great Pacific patch shrinking. New plastic still entering at 5M tons/yr." },
                  bau: { progress: 10, status: "critical", note: "10% removed. Cleanup can\u2019t keep pace with 11M tons/yr of new plastic entering oceans." },
                  worst: { progress: 3, status: "collapsed", note: "Negligible. Ocean plastic mass has tripled. Cleanup programs defunded." },
                },
                "Coral Reef Restoration": {
                  aggressive: { progress: 65, status: "recovering", note: "65% of target reef recovery. Assisted evolution + thermal tolerance breeding working." },
                  moderate: { progress: 25, status: "stressed", note: "25% recovery. Cooler-water reefs responding. Tropical reefs still declining." },
                  bau: { progress: 5, status: "critical", note: "5% recovery. Bleaching events overwhelm restoration. Tropical reefs functionally extinct." },
                  worst: { progress: 0, status: "collapsed", note: "Restoration abandoned. 95%+ reefs dead. Ocean acidification prevents regrowth." },
                },
                "Rewilding Europe": {
                  aggressive: { progress: 90, status: "thriving", note: "900K hectares rewilded. Wildlife corridors reconnect continent. Apex predators returning." },
                  moderate: { progress: 50, status: "recovering", note: "500K hectares. Western Europe strong. Eastern Europe progressing with EU funding." },
                  bau: { progress: 20, status: "stressed", note: "200K hectares. Agricultural pressure limits expansion. Fragmented corridors." },
                  worst: { progress: 5, status: "critical", note: "50K hectares. Drought and fire push rewilded areas back. Funding redirected to crisis." },
                },
                "Mangrove Alliance": {
                  aggressive: { progress: 85, status: "thriving", note: "85% of mangrove restoration target. Blue carbon sequestration exceeds projections." },
                  moderate: { progress: 40, status: "recovering", note: "40% restored. Southeast Asia and West Africa showing strong results." },
                  bau: { progress: 12, status: "declining", note: "12% restored but sea level rise and development destroying more than is restored." },
                  worst: { progress: 2, status: "collapsed", note: "Negligible. 1m sea level rise drowning mangroves faster than migration." },
                },
              };
              return (
              <div className="glass-card p-6 mb-8">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Global Restoration Projects</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>2050 progress under <strong style={{ color: s.color }}>{s.name}</strong></p>
                <div className="space-y-5">
                  {data.biodiversity.restorationProjects.map(rp => {
                    const rs = rpScenario[rp.name]?.[s.id] || { progress: rp.progress, status: "baseline", note: "" };
                    const barColor = rs.progress >= 60 ? "var(--emerald)" : rs.progress >= 30 ? "var(--amber)" : "var(--rose)";
                    return (
                      <div key={rp.name}>
                        <div className="flex items-center gap-4">
                          <div className="w-40 shrink-0">
                            <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{rp.name}</p>
                            <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>{rp.target}</p>
                          </div>
                          <div className="flex-1">
                            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rs.progress}%`, background: barColor, opacity: 0.7 }} />
                            </div>
                          </div>
                          <div className="w-12 text-right text-xs font-bold" style={{ color: barColor }}>{rs.progress}%</div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full w-20 text-center" style={{ background: `${statusColor(rs.status)}22`, color: statusColor(rs.status), border: `1px solid ${statusColor(rs.status)}44` }}>{rs.status}</span>
                        </div>
                        {rs.note && <p className="text-[11px] mt-1 ml-44 leading-relaxed" style={{ color: "var(--text-muted)" }}>{rs.note}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })()}

            {/* Summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${s.color}` }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                <span className="text-lg">{s.icon}</span> Biodiversity in 2050: {s.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{bioSummary[s.id]}</p>
            </div>
          </section>
          );
        })()}

        {/* ════════════════════ ENERGY & EMISSIONS ════════════════════ */}
        {tab === "energy" && (() => {
          const s = data.scenarios.find(sc => sc.id === activeScenario)!;
          const co2Desc: Record<string, string> = {
            aggressive: "CO\u2082 concentration peaks at 422 ppm around 2028 and declines to 366 ppm by 2050 \u2014 the first sustained atmospheric drawdown in modern history. This requires net-negative emissions: massive direct air capture, ocean alkalinity enhancement, and reforestation absorbing 5\u201310 Gt/year. The fossil fuel era effectively ends before 2035.",
            moderate: "CO\u2082 peaks near 435 ppm in the early 2030s before declining to 395 ppm by 2050. The drawdown is real but gradual \u2014 about 1.5 ppm/year \u2014 reflecting the lag between emissions cuts and atmospheric response. The fossil phase-out is largely complete by 2055\u201360, with natural gas the last to go.",
            bau: "CO\u2082 climbs steadily to 551 ppm by 2050, more than double pre-industrial levels. There is no peak in sight \u2014 annual additions of 5\u20136 ppm continue as fossil fuels remain dominant. At this concentration, Earth\u2019s carbon cycle feedbacks are under severe strain, and forests begin transitioning from carbon sinks to carbon sources.",
            worst: "CO\u2082 surges to 790 ppm by 2050, driven by continued emissions and massive natural carbon releases from thawing permafrost and dying forests. The atmosphere is absorbing carbon faster than at any point in 55 million years. Ocean acidification at this concentration threatens the base of marine food chains and dissolves the shells of calcifying organisms.",
          };
          const renewDesc: Record<string, string> = {
            aggressive: "Renewables reach 99% of global electricity by 2050. Solar and wind dominate, backed by grid-scale storage exceeding 2 TWh. Nuclear provides baseload where existing. The last coal plant closes before 2035 and natural gas is relegated to emergency backup. This is the fastest industrial transformation in human history, creating over 60 million clean energy jobs.",
            moderate: "Renewables reach 88% by 2050 \u2014 strong but incomplete. Solar and wind are cheapest everywhere, but grid modernization in developing nations lags behind. Natural gas persists in heavy industry. The transition creates 40+ million new jobs but leaves stranded fossil fuel communities needing transition support.",
            bau: "Renewables stall at 64% by 2050. Coal declines but natural gas fills the gap rather than clean sources. Grid-scale storage remains underfunded. Developing nations, unable to access green finance at scale, continue building fossil infrastructure locked in for 30\u201340 year lifespans. The grid is cleaner but falls far short of what\u2019s needed.",
            worst: "Renewables barely reach 42% by 2050. Policy paralysis, fossil fuel lobbying, and geopolitical fragmentation prevent coordinated investment. Grid instability in regions with intermittent renewables but no storage causes public backlash against the transition. New coal plants are still being commissioned in 2040.",
          };
          const tempEnergyDesc: Record<string, string> = {
            aggressive: "Global temperatures stabilize at +1.2\u00b0C and begin declining. The complete decarbonization of the energy sector \u2014 which accounts for 31% of emissions \u2014 is the single largest driver of this stabilization. Combined with transport electrification and industrial process changes, the energy transition alone removes over 20 Gt CO\u2082/year from the emissions trajectory.",
            moderate: "Temperatures reach +1.8\u00b0C by 2050, held in check by a substantial but incomplete energy transition. The remaining fossil fuel use in industry and developing-nation grids keeps emissions high enough to breach 1.5\u00b0C in the early 2030s. Each additional decade of fossil dependence adds roughly 0.15\u00b0C.",
            bau: "Temperatures climb to nearly +3\u00b0C by 2050 as the energy system fails to decarbonize at the required pace. Continued reliance on coal and gas for 36% of electricity means 15\u201320 Gt CO\u2082/year from energy alone. The warming trajectory is essentially linear with no inflection point visible.",
            worst: "Temperatures rocket past +4.6\u00b0C by 2050. The energy system remains carbon-intensive, and natural feedback loops amplify the warming far beyond what direct emissions alone would produce. Methane release from permafrost and ocean clathrates adds the equivalent of several billion tonnes of CO\u2082 annually.",
          };
          const energySummary: Record<string, string> = {
            aggressive: `The Aggressive Action scenario transforms the global energy system by 2050. Renewables supply 99% of electricity. CO\u2082 has dropped to 366 ppm and is still falling. Temperatures have stabilized at +1.2\u00b0C. The energy sector has gone from the world\u2019s largest source of emissions to a net contributor to carbon drawdown through electrification of transport, industry, and buildings. Over 60 million workers are employed in clean energy. Grid-scale storage, green hydrogen, and next-generation nuclear provide the reliability backbone. The fossil fuel era is history. This transformation required $4\u20135 trillion/year in clean energy investment \u2014 roughly 4% of global GDP \u2014 but the returns in avoided damages, health improvements, and energy security exceed the cost by 3\u20135x.`,
            moderate: `The Moderate Transition delivers a substantially cleaner but still imperfect energy system. Renewables at 88% are dominant but not complete. CO\u2082 has peaked and is falling, but at 395 ppm it remains far above safe levels. Temperatures at +1.8\u00b0C are approaching the 2\u00b0C guardrail. Natural gas remains in use for peak demand and industrial heat. The transition has created tens of millions of jobs but displaced fossil fuel communities still need support. Energy costs have fallen but investment in developing-nation grids hasn\u2019t kept pace. The trajectory is positive but fragile \u2014 any slowdown in deployment could push the world past 2\u00b0C.`,
            bau: `Business as Usual leaves the energy system stuck in a half-transition by 2050. At 64% renewables, clean energy is growing but not fast enough. CO\u2082 at 551 ppm is still rising with no peak in sight. Temperatures at +3\u00b0C are locking in severe climate impacts for centuries. Coal has declined but natural gas has expanded to fill the gap. Developing nations have built 30\u201340 year fossil infrastructure that cannot be retired early without massive financial support. Energy-related emissions alone exceed 20 Gt/year. The world has spent just enough on clean energy to create a veneer of progress, but not enough to change the outcome.`,
            worst: `The Worst Case energy system in 2050 is a monument to coordination failure. Renewables at 42% have grown, but nowhere near fast enough. CO\u2082 at 790 ppm reflects both continued fossil emissions and massive natural carbon releases. Temperatures at +4.6\u00b0C have triggered feedback loops that dwarf anything the energy transition can address. Geopolitical fragmentation has prevented the coordinated investment needed for a global transition. Many nations have returned to coal under energy security pressures. The opportunity to prevent catastrophic warming through energy transformation has been lost. Adaptation \u2014 not mitigation \u2014 is now the only option, and even that is overwhelmed at this temperature.`,
          };
          return (
          <section>
            <Heading icon={"\u{26A1}"} title="Energy & Emissions" sub="Grid mix, sectoral emissions, and future trajectories \u2014 viewed through four scenarios" />

            {/* Scenario selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a climate scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to update all energy and emissions projections below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.scenarios.map(sc => (
                  <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sc.icon}</span><span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.name}</span></div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>{sc.desc}</p>
                    {activeScenario === sc.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const energyStats: Record<string, { emissions: number; renewGW: number; arcticIce: number; oceanPH: number }> = {
                aggressive: { emissions: 3.4,  renewGW: 28000, arcticIce: 3.8, oceanPH: 8.10 },
                moderate:   { emissions: 17.8, renewGW: 18000, arcticIce: 2.9, oceanPH: 8.04 },
                bau:        { emissions: 26.1, renewGW: 9500,  arcticIce: 1.2, oceanPH: 7.95 },
                worst:      { emissions: 40.0, renewGW: 5200,  arcticIce: 0.0, oceanPH: 7.82 },
              };
              const es = energyStats[s.id];
              return (
              <>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: s.color }}>2050 Projection: {s.name}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <Stat label="Annual Emissions" value={`${es.emissions} Gt`} sub="CO\u2082/year by 2050" color="var(--rose)" />
                  <Stat label="Renewable Capacity" value={`${fmtK(es.renewGW)} GW`} sub="installed by 2050" color="var(--emerald)" />
                  <Stat label="Arctic Ice Extent" value={es.arcticIce > 0 ? `${es.arcticIce}M km\u00b2` : "Ice-free"} sub="summer minimum" color="var(--sky)" />
                  <Stat label="Ocean pH" value={`${es.oceanPH}`} sub={es.oceanPH >= 8.07 ? "recovering" : "acidifying"} color="var(--cyan)" />
                </div>
              </>
              );
            })()}

            {/* Grid Mix — scenario-aware */}
            {(() => {
              const gridMix2050: Record<string, { source: string; pct: number; color: string }[]> = {
                aggressive: [
                  { source: "Solar", pct: 42, color: "#f59e0b" }, { source: "Wind", pct: 32, color: "#06b6d4" }, { source: "Nuclear", pct: 12, color: "#8b5cf6" },
                  { source: "Hydro", pct: 10, color: "#0ea5e9" }, { source: "Other Renewables", pct: 3, color: "#10b981" }, { source: "Natural Gas", pct: 1, color: "#94a3b8" },
                  { source: "Coal", pct: 0, color: "#64748b" }, { source: "Oil", pct: 0, color: "#475569" },
                ],
                moderate: [
                  { source: "Solar", pct: 35, color: "#f59e0b" }, { source: "Wind", pct: 28, color: "#06b6d4" }, { source: "Hydro", pct: 12, color: "#0ea5e9" },
                  { source: "Nuclear", pct: 10, color: "#8b5cf6" }, { source: "Natural Gas", pct: 8, color: "#94a3b8" }, { source: "Other Renewables", pct: 5, color: "#10b981" },
                  { source: "Coal", pct: 2, color: "#64748b" }, { source: "Oil", pct: 0, color: "#475569" },
                ],
                bau: [
                  { source: "Natural Gas", pct: 26, color: "#94a3b8" }, { source: "Solar", pct: 22, color: "#f59e0b" }, { source: "Wind", pct: 16, color: "#06b6d4" },
                  { source: "Coal", pct: 12, color: "#64748b" }, { source: "Hydro", pct: 12, color: "#0ea5e9" }, { source: "Nuclear", pct: 8, color: "#8b5cf6" },
                  { source: "Other Renewables", pct: 3, color: "#10b981" }, { source: "Oil", pct: 1, color: "#475569" },
                ],
                worst: [
                  { source: "Coal", pct: 25, color: "#64748b" }, { source: "Natural Gas", pct: 24, color: "#94a3b8" }, { source: "Solar", pct: 15, color: "#f59e0b" },
                  { source: "Wind", pct: 11, color: "#06b6d4" }, { source: "Hydro", pct: 10, color: "#0ea5e9" }, { source: "Nuclear", pct: 6, color: "#8b5cf6" },
                  { source: "Oil", pct: 5, color: "#475569" }, { source: "Other Renewables", pct: 4, color: "#10b981" },
                ],
              };
              const mix = gridMix2050[s.id] || data.energy.gridMix2024;
              return (
              <div className="glass-card p-6 mb-8">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Projected Electricity Grid Mix (2050)</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Under <strong style={{ color: s.color }}>{s.name}</strong></p>
                <div className="space-y-3">
                  {mix.map(g => (
                    <div key={g.source} className="flex items-center gap-4">
                      <div className="w-28 text-right text-xs font-semibold" style={{ color: "var(--text)" }}>{g.source}</div>
                      <div className="flex-1"><div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${g.pct}%`, background: g.color, opacity: 0.8 }} /></div></div>
                      <div className="w-12 text-right text-xs font-bold" style={{ color: g.color }}>{g.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}

            {/* Emissions Breakdown — scenario-aware */}
            {(() => {
              const sectorData2050: Record<string, { sector: string; pct: number; gt: number; color: string; status: string; outlook: string }[]> = {
                aggressive: [
                  { sector: "Energy & Heat", pct: 0, gt: 0, color: "#f43f5e", status: "eliminated", outlook: "Fully decarbonized via renewables + storage + green hydrogen" },
                  { sector: "Transport", pct: 0, gt: 0, color: "#f59e0b", status: "eliminated", outlook: "100% EV fleet + electrified rail + sustainable aviation fuel" },
                  { sector: "Industry", pct: 15, gt: 0.5, color: "#64748b", status: "declining", outlook: "Green steel, cement CCS, circular manufacturing. Last sector to reach zero." },
                  { sector: "Buildings", pct: 0, gt: 0, color: "#8b5cf6", status: "eliminated", outlook: "Full electrification + deep retrofit + heat pumps globally" },
                  { sector: "Agriculture & Land Use", pct: 50, gt: 1.7, color: "#10b981", status: "declining", outlook: "Regenerative practices, reduced methane, reforestation offsets" },
                  { sector: "Waste & Other", pct: 35, gt: 1.2, color: "#06b6d4", status: "declining", outlook: "Circular economy mandates, methane capture at 90% of landfills" },
                ],
                moderate: [
                  { sector: "Energy & Heat", pct: 18, gt: 3.2, color: "#f43f5e", status: "declining", outlook: "88% renewables but gas peakers persist; developing nations lag" },
                  { sector: "Transport", pct: 12, gt: 2.1, color: "#f59e0b", status: "declining", outlook: "80% EV adoption in developed nations, 50% globally; aviation still fossil" },
                  { sector: "Industry", pct: 28, gt: 5.0, color: "#64748b", status: "stressed", outlook: "Some green steel, limited CCS. Heavy industry hardest to abate." },
                  { sector: "Buildings", pct: 5, gt: 0.9, color: "#8b5cf6", status: "declining", outlook: "New buildings net-zero; retrofit backlog in developing nations" },
                  { sector: "Agriculture & Land Use", pct: 22, gt: 3.9, color: "#10b981", status: "stressed", outlook: "Partial adoption of regenerative practices; deforestation slowed not stopped" },
                  { sector: "Waste & Other", pct: 15, gt: 2.7, color: "#06b6d4", status: "declining", outlook: "Improved waste management, 60% methane capture" },
                ],
                bau: [
                  { sector: "Energy & Heat", pct: 30, gt: 7.8, color: "#f43f5e", status: "critical", outlook: "36% fossil electricity. Coal declining but gas expanding as bridge fuel that never ends." },
                  { sector: "Transport", pct: 18, gt: 4.7, color: "#f59e0b", status: "stressed", outlook: "50% EV globally but ICE fleet persists in developing nations; aviation untouched" },
                  { sector: "Industry", pct: 23, gt: 6.0, color: "#64748b", status: "critical", outlook: "Minimal decarbonization. Steel, cement, chemicals still fossil-dependent." },
                  { sector: "Buildings", pct: 6, gt: 1.6, color: "#8b5cf6", status: "stressed", outlook: "Slow retrofit pace. Gas heating persists in cold climates." },
                  { sector: "Agriculture & Land Use", pct: 15, gt: 3.9, color: "#10b981", status: "critical", outlook: "Continued deforestation, rising methane, soil degradation worsening" },
                  { sector: "Waste & Other", pct: 8, gt: 2.1, color: "#06b6d4", status: "stressed", outlook: "Growing waste volumes outpace capture improvements" },
                ],
                worst: [
                  { sector: "Energy & Heat", pct: 32, gt: 12.8, color: "#f43f5e", status: "collapsed", outlook: "Return to coal under energy security pressures. New coal plants still commissioning." },
                  { sector: "Transport", pct: 16, gt: 6.4, color: "#f59e0b", status: "critical", outlook: "30% EV. Supply chain disruptions halt transition. Aviation and shipping untouched." },
                  { sector: "Industry", pct: 22, gt: 8.8, color: "#64748b", status: "collapsed", outlook: "No meaningful decarbonization. Industrial output rises with growing demand." },
                  { sector: "Buildings", pct: 7, gt: 2.8, color: "#8b5cf6", status: "critical", outlook: "Energy poverty drives fossil heating. No retrofit investment at scale." },
                  { sector: "Agriculture & Land Use", pct: 14, gt: 5.6, color: "#10b981", status: "collapsed", outlook: "Massive deforestation, peatland fires, soil collapse releasing stored carbon" },
                  { sector: "Waste & Other", pct: 9, gt: 3.6, color: "#06b6d4", status: "critical", outlook: "Infrastructure breakdown in developing nations. Unmanaged waste rises." },
                ],
              };
              const sectors = sectorData2050[s.id] || data.energy.emissionsBreakdown.map(e => ({ ...e, status: "baseline", outlook: "" }));
              const totalGt = sectors.reduce((sum, e) => sum + e.gt, 0);
              return (
              <div className="glass-card p-6 mb-8">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Emissions by Sector (2050 Projection)</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Under <strong style={{ color: s.color }}>{s.name}</strong> &mdash; total: <strong style={{ color: s.color }}>{totalGt.toFixed(1)} Gt CO\u2082/yr</strong> (vs 36.8 Gt baseline)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectors.map(e => (
                    <div key={e.sector} className="glass-card p-4" style={{ borderTop: `3px solid ${e.color}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-lg font-bold" style={{ color: e.color, fontFamily: "'Space Grotesk',sans-serif" }}>{e.gt} Gt</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${statusColor(e.status)}22`, color: statusColor(e.status), border: `1px solid ${statusColor(e.status)}44` }}>{e.status}</span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{e.sector}</p>
                      <p className="text-[11px] mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>{e.outlook}</p>
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}

            {/* Historical Emissions */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Historical Emissions (2015\u20132025)</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Global CO\u2082 emissions in gigatonnes \u2014 the starting point for all scenarios</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.energy.annualEmissionsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[30, 40]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="gt" fill="#14b8a6" name="Gt CO\u2082" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CO2 by scenario */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>CO\u2082 Concentration by Scenario (ppm)</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>Atmospheric CO\u2082, 2026\u20132050</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={scenarioChartData.co2}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Line key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} dot={false} name={sc.name} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{co2Desc[s.id]}</p>
            </div>

            {/* Renewable share by scenario */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Renewable Energy Share by Scenario (%)</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>% of global electricity from renewables, 2026\u20132050</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scenarioChartData.renew}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Area key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} fill="none" strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} name={sc.name} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{renewDesc[s.id]}</p>
            </div>

            {/* Temperature via energy */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Temperature Impact of Energy Choices (\u00b0C)</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>Global temperature rise driven primarily by energy and industrial emissions</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={scenarioChartData.temp}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[1, 5]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Line key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} dot={false} name={sc.name} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{tempEnergyDesc[s.id]}</p>
            </div>

            {/* Summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${s.color}` }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                <span className="text-lg">{s.icon}</span> Energy & Emissions in 2050: {s.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{energySummary[s.id]}</p>
            </div>
          </section>
          );
        })()}

        {/* ════════════════════ RESOURCES ════════════════════ */}
        {tab === "resources" && (() => {
          const s = data.scenarios.find(sc => sc.id === activeScenario)!;
          const cropDesc: Record<string, string> = {
            aggressive: "Crop yields increase 23% above baseline by 2050. Cooler temperatures, restored pollinators, regenerative agriculture on 40% of farmland, precision irrigation, and a 50% reduction in food waste combine to make the food system more productive and resilient than ever. Hunger falls below 300 million people \u2014 the lowest in modern history. Arable land loss is reversed through soil restoration programs.",
            moderate: "Crop yields fluctuate but return to roughly baseline (102) by 2050. Heat stress and water scarcity reduce yields in tropical regions, but gains in temperate zones, improved crop varieties, and adaptation investments offset losses. Food prices remain volatile but manageable. Approximately 500 million people remain food-insecure, concentrated in Sub-Saharan Africa and South Asia.",
            bau: "Yields decline to 69% of baseline \u2014 a 31% loss. Heat waves, droughts, soil degradation, and pollinator collapse hit tropical and subtropical agriculture hardest. Breadbasket regions face chronic water stress. Food prices triple in real terms, pushing over one billion people into hunger. Arable land continues shrinking at 12+ million hectares per year.",
            worst: "A catastrophic 70% decline in crop yields. Multiple breadbasket failures occur simultaneously by the 2040s as topsoil loss, aquifer depletion, extreme heat, and pollinator extinction create compounding failures. The global food system cannot feed 9 billion people. Famine becomes a leading cause of death and the primary driver of mass migration and conflict.",
          };
          const waterDesc: Record<string, string> = {
            aggressive: "Water stress declines from 26% to 15% of the global population. Massive investment in desalination, water recycling, watershed restoration, and precision agriculture reduces demand while improving supply. Aquifer recharge programs restore groundwater in critical regions. The water-energy-food nexus is actively managed as an integrated system for the first time.",
            moderate: "Water stress peaks near 30% in the mid-2030s before declining to 25% \u2014 roughly today\u2019s levels. Adaptation helps, but glacial melt in the Himalayas, Andes, and Alps reduces seasonal water availability for 2 billion people. Desalination scales significantly but remains energy-intensive. Major river basins face seasonal shortages requiring careful management.",
            bau: "Water stress climbs relentlessly to 56% of the population. Aquifer depletion, glacial loss, altered precipitation, and growing demand create chronic shortages across South Asia, the Middle East, North Africa, and parts of the Americas. Water becomes a primary driver of migration and geopolitical tension. Agriculture competes with cities for shrinking supplies.",
            worst: "88% of the global population faces water stress. Glaciers feeding the Ganges, Yangtze, Colorado, and Nile are largely gone. Groundwater reserves are critically depleted across every continent. Megacities face annual day-zero crises. Agriculture and urban water needs are in direct, irreconcilable competition. Water scarcity becomes the defining crisis of the era.",
          };
          const resSummary: Record<string, string> = {
            aggressive: `Under Aggressive Action, the resource picture in 2050 is one of recovery and abundance. Crop yields are up 23%, water stress has been nearly halved, food waste is down 50%, and regenerative agriculture is restoring topsoil faster than it erodes. The critical mineral supply chain has been secured through massive investment in recycling (reaching 30\u201350% for key minerals), circular economy mandates, and diversified sourcing. Hunger affects fewer than 300 million people. Fisheries are recovering under strict management. The material basis of civilization is not just sustained \u2014 it\u2019s being actively regenerated.`,
            moderate: `The Moderate Transition keeps resources under strain but avoids collapse. Crop yields are roughly stable, water stress returns to current levels after a mid-century peak, and food systems have adapted through improved varieties and precision agriculture. Critical mineral supply chains are tight but functional, with recycling rates climbing to 15\u201325%. Hunger remains at roughly 500 million. Fisheries are stabilizing under improved management. The picture is one of managed scarcity \u2014 livable, but with little margin for error and deep inequalities in access.`,
            bau: `Business as Usual delivers a world of deepening resource scarcity by 2050. Crop yields are down 31%, water stress affects 56% of humanity, and over one billion people face hunger. Arable land continues shrinking. Topsoil loss accelerates. Fish stocks are severely depleted. Critical minerals face supply crunches as demand outpaces extraction and recycling remains below 15% for most materials. Food prices have tripled, driving social instability across the Global South. The resource base that sustains civilization is being consumed faster than it regenerates \u2014 a trajectory that cannot continue.`,
            worst: `The Worst Case is resource collapse. Crop yields have fallen 70%. 88% of humanity faces water stress. Famine is widespread. Fisheries have collapsed. Topsoil, aquifers, and phosphorus reserves are critically depleted. Critical minerals are subject to resource wars and hoarding. The global food system cannot feed the population. Mass migration, conflict over water and arable land, and cascading supply chain failures have made the modern economy unrecognizable. This is not a resource crisis \u2014 it is the end of the resource abundance that made modern civilization possible.`,
          };
          return (
          <section>
            <Heading icon={"\u{1F4A7}"} title="Resources & Agriculture" sub="Water, food, minerals, and the material basis of civilization \u2014 viewed through four scenarios" />

            {/* Scenario selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a climate scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to update all resource and agriculture projections below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.scenarios.map(sc => (
                  <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sc.icon}</span><span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.name}</span></div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>{sc.desc}</p>
                    {activeScenario === sc.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const resStats: Record<string, { freshAvail: number; freshWith: number; agriPct: number; arable: number; arableLoss: number; fishOver: number; foodWaste: number; hunger: number; phosphorus: number; topsoil: string }> = {
                aggressive: { freshAvail: 42000, freshWith: 3200, agriPct: 45, arable: 1450, arableLoss: 0, fishOver: 15, foodWaste: 10, hunger: 280, phosphorus: 450, topsoil: "Net gain via restoration" },
                moderate:   { freshAvail: 39000, freshWith: 4200, agriPct: 58, arable: 1350, arableLoss: 5, fishOver: 25, foodWaste: 18, hunger: 500, phosphorus: 350, topsoil: "12B tonnes/year" },
                bau:        { freshAvail: 34000, freshWith: 5800, agriPct: 72, arable: 1100, arableLoss: 15, fishOver: 50, foodWaste: 32, hunger: 1100, phosphorus: 200, topsoil: "36B tonnes/year" },
                worst:      { freshAvail: 26000, freshWith: 7200, agriPct: 80, arable: 800, arableLoss: 25, fishOver: 70, foodWaste: 40, hunger: 2000, phosphorus: 120, topsoil: "50B+ tonnes/year" },
              };
              const rs = resStats[s.id];
              return (
              <>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: s.color }}>2050 Projection: {s.name}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <Stat label="Freshwater Available" value={`${fmtK(rs.freshAvail)} km\u00b3`} sub="total renewable" color="var(--sky)" />
                  <Stat label="Freshwater Withdrawn" value={`${fmtK(rs.freshWith)} km\u00b3`} sub={`${rs.agriPct}% for agriculture`} color="var(--teal)" />
                  <Stat label="Arable Land" value={`${fmtK(rs.arable)} Mha`} sub={rs.arableLoss === 0 ? "land restored" : `losing ${rs.arableLoss} Mha/yr`} color="var(--amber)" />
                  <Stat label="Fish Stocks Overfished" value={`${rs.fishOver}%`} color="var(--rose)" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <Stat label="Food Waste" value={`${rs.foodWaste}%`} sub="of production" color="var(--amber)" />
                  <Stat label="Hunger Affected" value={`${fmtK(rs.hunger)}M`} sub="people globally" color="var(--rose)" />
                  <Stat label="Phosphorus Reserves" value={`~${rs.phosphorus} yrs`} sub="at projected use" color="var(--violet)" />
                  <Stat label="Topsoil Loss" value={rs.topsoil} color="var(--amber)" />
                </div>
              </>
              );
            })()}

            {/* Crop Yield */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Crop Yield Index by Scenario</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>100 = 2026 baseline. Climate action protects food production.</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={scenarioChartData.crop}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[20, 130]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Line key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} dot={false} name={sc.name} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{cropDesc[s.id]}</p>
            </div>

            {/* Water Stress */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Population Under Water Stress by Scenario (%)</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>% of global population facing high water stress</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scenarioChartData.water}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Area key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} fill="none" strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} name={sc.name} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{waterDesc[s.id]}</p>
            </div>

            {/* Critical Minerals — scenario-aware */}
            {(() => {
              const mineralScenario: Record<string, Record<string, { demand2050: number; recycling2050: number; status: string; outlook: string }>> = {
                Lithium: {
                  aggressive: { demand2050: 4800, recycling2050: 45, status: "recovering", outlook: "Massive demand met through diversified mining, ocean extraction, and 45% recycling. Supply chains secured via international mineral agreements." },
                  moderate: { demand2050: 3500, recycling2050: 25, status: "stressed", outlook: "High demand, moderate recycling. Geopolitical tensions over Congo and Chile supplies. Sodium-ion alternatives absorb 20% of battery market." },
                  bau: { demand2050: 2200, recycling2050: 12, status: "critical", outlook: "Slower transition means lower demand, but recycling neglected. Supply concentrated in few nations. Price volatility disrupts deployment." },
                  worst: { demand2050: 1200, recycling2050: 5, status: "declining", outlook: "Stalled transition reduces demand. What mining exists is environmentally destructive. Recycling infrastructure never built at scale." },
                },
                Cobalt: {
                  aggressive: { demand2050: 800, recycling2050: 55, status: "recovering", outlook: "Cobalt-free battery chemistries reduce demand. What\u2019s needed is 55% recycled. Ethical mining standards enforced globally." },
                  moderate: { demand2050: 600, recycling2050: 30, status: "stressed", outlook: "Partial shift to cobalt-free batteries. DRC dependency reduced but not eliminated. Child labor concerns persist in artisanal mines." },
                  bau: { demand2050: 450, recycling2050: 15, status: "critical", outlook: "Cobalt remains bottleneck. DRC instability creates supply shocks. Recycling rates too low to matter at scale." },
                  worst: { demand2050: 250, recycling2050: 5, status: "declining", outlook: "Low transition demand. Mining continues under worst practices. Resource nationalism and conflict over deposits." },
                },
                Copper: {
                  aggressive: { demand2050: 55000, recycling2050: 50, status: "stressed", outlook: "The energy transition\u2019s biggest mineral bottleneck. 50% recycling essential. New deposits in deep sea and recycled urban mines. Demand highest of any scenario." },
                  moderate: { demand2050: 42000, recycling2050: 30, status: "stressed", outlook: "Significant demand growth. Recycling helps but new mines still needed. Chile, Peru, DRC face environmental pressure from expansion." },
                  bau: { demand2050: 32000, recycling2050: 18, status: "critical", outlook: "Lower renewable deployment means less copper demand, but also less recycling investment. Aging grid infrastructure degrades." },
                  worst: { demand2050: 25000, recycling2050: 10, status: "critical", outlook: "Stagnant demand reflects stalled transition. Copper theft and illegal mining rise as governance weakens. Infrastructure maintenance neglected." },
                },
                Nickel: {
                  aggressive: { demand2050: 12000, recycling2050: 40, status: "recovering", outlook: "Battery demand high but met through Indonesian expansion + 40% recycling. High-pressure acid leaching made cleaner. Supply sufficient." },
                  moderate: { demand2050: 8500, recycling2050: 22, status: "stressed", outlook: "Moderate demand. Indonesia dominates supply. Environmental damage from laterite processing a concern. Recycling growing but slow." },
                  bau: { demand2050: 5500, recycling2050: 12, status: "stressed", outlook: "Lower demand, lower recycling. Nickel used in stainless steel more than batteries. Indonesian deforestation for mining continues." },
                  worst: { demand2050: 3000, recycling2050: 5, status: "declining", outlook: "Minimal battery demand. Nickel mining concentrated in environmentally destructive laterite operations. Little incentive to recycle." },
                },
                "Rare Earths": {
                  aggressive: { demand2050: 950, recycling2050: 35, status: "recovering", outlook: "Wind turbine and EV motor demand peaks then stabilizes as recycling reaches 35%. Non-China sources developed: Australia, Canada, Greenland." },
                  moderate: { demand2050: 700, recycling2050: 18, status: "stressed", outlook: "China controls 60% of processing. Western alternatives developing but 5\u201310 years behind. Recycling from e-waste grows slowly." },
                  bau: { demand2050: 500, recycling2050: 8, status: "critical", outlook: "China dominance 80%+. Geopolitical weaponization of supply. Western nations scramble for alternatives too late." },
                  worst: { demand2050: 350, recycling2050: 3, status: "critical", outlook: "Supply chain fragmentation. Export bans and resource nationalism. Critical defense and technology applications disrupted." },
                },
                Silicon: {
                  aggressive: { demand2050: 25000, recycling2050: 40, status: "thriving", outlook: "Solar panel demand drives massive scaling. Recycling of end-of-life panels reaches 40%. Silicon abundant \u2014 manufacturing capacity is the bottleneck, not reserves." },
                  moderate: { demand2050: 18000, recycling2050: 20, status: "recovering", outlook: "Strong solar growth. First generation of panels reaching end-of-life creates recycling opportunity. Supply adequate." },
                  bau: { demand2050: 11000, recycling2050: 8, status: "stressed", outlook: "Moderate solar growth. Panel waste becomes environmental problem as recycling infrastructure lags. Landfill concerns." },
                  worst: { demand2050: 6000, recycling2050: 3, status: "declining", outlook: "Slow solar deployment. Manufacturing shifts driven by cost, not climate. Panel waste unmanaged." },
                },
              };
              return (
              <div className="glass-card p-6 mb-8">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Critical Minerals for the Energy Transition (2050)</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Projected under <strong style={{ color: s.color }}>{s.name}</strong> &mdash; demand, recycling rates, and supply chain outlook</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.resources.criticalMinerals.map(m => {
                    const ms = mineralScenario[m.mineral]?.[s.id];
                    if (!ms) {
                      const demandGrowth = Math.round((m.demand2040_kt / m.demand2024_kt - 1) * 100);
                      return (
                        <div key={m.mineral} className="glass-card p-4" style={{ borderTop: `3px solid ${m.color}` }}>
                          <p className="text-sm font-semibold" style={{ color: m.color }}>{m.mineral}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div><p style={{ color: "var(--text-faint)" }}>2024 demand</p><p className="font-bold" style={{ color: "var(--text)" }}>{fmtK(m.demand2024_kt)} kt</p></div>
                            <div><p style={{ color: "var(--text-faint)" }}>2040 demand</p><p className="font-bold" style={{ color: "var(--text)" }}>{fmtK(m.demand2040_kt)} kt</p></div>
                            <div><p style={{ color: "var(--text-faint)" }}>Growth</p><p className="font-bold" style={{ color: m.color }}>+{demandGrowth}%</p></div>
                            <div><p style={{ color: "var(--text-faint)" }}>Recycling</p><p className="font-bold" style={{ color: m.recyclingRate >= 20 ? "var(--emerald)" : "var(--amber)" }}>{m.recyclingRate}%</p></div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={m.mineral} className="glass-card p-4" style={{ borderTop: `3px solid ${m.color}` }}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold" style={{ color: m.color }}>{m.mineral}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${statusColor(ms.status)}22`, color: statusColor(ms.status), border: `1px solid ${statusColor(ms.status)}44` }}>{ms.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div><p style={{ color: "var(--text-faint)" }}>2024 demand</p><p className="font-bold" style={{ color: "var(--text)" }}>{fmtK(m.demand2024_kt)} kt</p></div>
                          <div><p style={{ color: "var(--text-faint)" }}>2050 demand</p><p className="font-bold" style={{ color: s.color }}>{fmtK(ms.demand2050)} kt</p></div>
                          <div><p style={{ color: "var(--text-faint)" }}>Recycling 2024</p><p className="font-bold" style={{ color: m.recyclingRate >= 20 ? "var(--emerald)" : "var(--amber)" }}>{m.recyclingRate}%</p></div>
                          <div><p style={{ color: "var(--text-faint)" }}>Recycling 2050</p><p className="font-bold" style={{ color: ms.recycling2050 >= 25 ? "var(--emerald)" : ms.recycling2050 >= 15 ? "var(--amber)" : "var(--rose)" }}>{ms.recycling2050}%</p></div>
                        </div>
                        <p className="text-[11px] mt-3 leading-relaxed pt-2" style={{ color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>{ms.outlook}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })()}

            {/* Summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${s.color}` }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                <span className="text-lg">{s.icon}</span> Resources & Agriculture in 2050: {s.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{resSummary[s.id]}</p>
            </div>
          </section>
          );
        })()}

        {/* ════════════════════ TIMELINE ════════════════════ */}
        {tab === "timeline" && (() => {
          const s = data.scenarios.find(sc => sc.id === activeScenario)!;
          const seaDesc: Record<string, string> = {
            aggressive: "Sea levels rise a manageable 49mm by 2050 \u2014 about 2mm per year from thermal expansion of heat already in the oceans. Ice sheet contributions stabilize after 2040. Coastal cities face adaptation challenges but no large-scale displacement. The rate of rise is decelerating, suggesting a peak within decades.",
            moderate: "136mm of rise by 2050 reflects steady ice melt alongside thermal expansion. Low-lying nations and delta cities face significant flooding requiring major infrastructure investment. The rate accelerates modestly to 5\u20136mm/year by the 2040s. Managed retreat begins in the most vulnerable areas.",
            bau: "332mm of sea level rise by mid-century signals accelerating ice dynamics. Major coastal infrastructure faces chronic inundation. The rate roughly doubles each decade. Tens of millions face displacement risk. Port cities, airports, and water treatment plants require billions in protection or relocation.",
            worst: "Over one meter of rise (1,072mm) by 2050 indicates partial West Antarctic Ice Sheet collapse. The rate exceeds 80mm/year by the late 2040s. Entire coastal cities become uninhabitable, triggering the largest forced migration in human history. Trillions in assets are stranded.",
          };
          const tempTimeDesc: Record<string, string> = {
            aggressive: "Temperatures stabilize at +1.2\u00b0C and begin declining \u2014 the only scenario that reverses the warming trend. Tipping points are avoided. The climate system begins returning toward equilibrium, though full stabilization takes centuries due to ocean heat inertia.",
            moderate: "Temperatures reach +1.8\u00b0C by 2050, approaching but not crossing the 2\u00b0C guardrail. The rate of warming slows significantly after 2035. Several tipping points remain dangerously close, and any slowdown in action could push past the threshold.",
            bau: "Nearly +3\u00b0C by 2050 with no sign of flattening. Multiple tipping points are breached in the 2040s. The warming trajectory is relentless and linear, locking in severe impacts for centuries even if emissions were cut to zero tomorrow.",
            worst: "Past +4.6\u00b0C by 2050, driven by cascading feedback loops. Permafrost thaw, Amazon dieback, and ice-albedo loss create self-reinforcing warming beyond human control. This is a temperature regime not seen in tens of millions of years.",
          };
          const forestTimeDesc: Record<string, string> = {
            aggressive: "Forest cover expands to 42.3% of land surface \u2014 the most significant reforestation in centuries. The Trillion Tree Initiative succeeds. Forests return to being a powerful net carbon sink, reinforcing the climate recovery visible in the temperature trajectory.",
            moderate: "Forest cover recovers to 35.3% after a period of stability. Deforestation slows dramatically but restoration takes time. The Amazon survives its tipping point, narrowly. Forests contribute modestly to carbon sequestration.",
            bau: "Forests decline to 21.3% as agricultural expansion, logging, and wildfire consume them faster than restoration can replace. The Amazon crosses its tipping point in the early 2040s. Forests flip from carbon sink to carbon source, accelerating the warming trend.",
            worst: "Forest cover collapses to 8.5%. Every major forest biome undergoes irreversible dieback. The release of hundreds of gigatonnes of stored carbon creates a self-reinforcing spiral that makes temperature stabilization impossible on human timescales.",
          };
          const timelineSummary: Record<string, string> = {
            aggressive: `The timeline under Aggressive Action tells a story of decisive, coordinated transformation. By 2030, emissions are 45% below peak, renewables cross 50%, and the 30x30 biodiversity target is met. By 2040, leading economies achieve net-zero, forests are expanding, and sea level rise is decelerating. By 2050, temperatures are stabilizing, CO\u2082 is falling, biodiversity is recovering, and the worst tipping points have been avoided. This timeline requires unprecedented political will, $4\u20135 trillion/year in investment, and genuine global cooperation \u2014 but it is physically and economically achievable. It is the timeline where the climate crisis becomes the climate recovery.`,
            moderate: `The Moderate Transition timeline shows steady progress that stays just ahead of catastrophe. The 2030 checkpoint is partially met. Renewables dominate by 2040 but fossil fuels linger. Sea levels rise significantly but manageably. Forests stabilize. Biodiversity stops declining around 2040. Temperatures approach 2\u00b0C but don\u2019t cross it. This timeline tracks roughly with current Paris Agreement pledges \u2014 if they\u2019re fully implemented. The danger is complacency: the moderate path avoids the worst outcomes but leaves almost no margin for error. Every delay, every weakened commitment, nudges the trajectory toward business as usual.`,
            bau: `The Business as Usual timeline is a chronicle of compounding crises. The 2030 targets are missed. Emissions decline slowly but not fast enough. By 2035, multiple tipping points are triggered. By 2040, the Amazon is dying, sea levels are accelerating, and crop failures are becoming routine. By 2050, the world is +3\u00b0C, half of monitored biodiversity is gone, over a billion people face hunger, and the climate system is in a state that will persist for millennia. This is not a scenario that requires bad luck \u2014 it is the default trajectory of current policies, extended forward.`,
            worst: `The Worst Case timeline is civilizational crisis. By 2030, feedback loops are visibly accelerating. By 2035, permafrost thaw and forest dieback have made natural carbon release rival human emissions. By 2040, multiple breadbaskets fail simultaneously, coastal megacities begin evacuation, and climate migration overwhelms international systems. By 2050, at +4.6\u00b0C, the planet is in a state unprecedented in human existence. Every system \u2014 food, water, energy, ecosystems, governance \u2014 is under existential stress simultaneously. This timeline exists not as a prediction, but as a warning: this is what\u2019s at stake if coordination fails and tipping points cascade.`,
          };
          return (
          <section>
            <Heading icon={"\u{1F3AF}"} title="Climate Action Timeline" sub="Critical milestones and long-term trajectories \u2014 what the future looks like under each scenario" />

            {/* Scenario selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a climate scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to see its milestones and long-term trajectory below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.scenarios.map(sc => (
                  <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sc.icon}</span><span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.name}</span></div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>{sc.desc}</p>
                    {activeScenario === sc.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Milestones — scenario-aware */}
            {(() => {
              const scenarioMilestones: Record<string, { year: number; title: string; items: string[] }[]> = {
                aggressive: [
                  { year: 2027, title: "Emergency Climate Mobilization", items: ["Global climate emergency declarations trigger wartime-scale investment", "Carbon border adjustments enacted by G20", "Fossil fuel subsidies eliminated in 40+ countries", "Trillion Tree Initiative passes 500B planted"] },
                  { year: 2030, title: "Emissions Peak Broken", items: ["Global emissions 45% below 2025 peak", "Renewables cross 50% of global electricity", "30x30 biodiversity target met", "Last coal plant closes in EU, Japan, South Korea"] },
                  { year: 2035, title: "Net-Zero Advanced Economies", items: ["US, EU, Japan, Australia reach net-zero electricity", "EV fleet passes 80% of new sales globally", "Direct air capture removes 5 Gt CO\u2082/year", "Amazon reforestation reaches 5% of lost area"] },
                  { year: 2040, title: "Global Net-Zero in Sight", items: ["Global emissions below 5 Gt CO\u2082/year", "Renewables at 90% of electricity", "Sea level rise decelerating", "Biodiversity index recovering above baseline"] },
                  { year: 2045, title: "Net-Negative Begins", items: ["Global emissions go net-negative", "Atmospheric CO\u2082 begins sustained decline", "Forest cover passes 40% of land surface", "Ocean acidification stabilizing"] },
                  { year: 2050, title: "Climate Recovery Trajectory", items: ["Temperature stabilized at +1.2\u00b0C, beginning to decline", "CO\u2082 at 366 ppm and falling", "Biodiversity index at 125% of 2026 baseline", "99% renewable electricity worldwide"] },
                ],
                moderate: [
                  { year: 2027, title: "Paris Pledges Strengthened", items: ["Updated NDCs with binding targets and penalties", "Green finance reaches $1T/year", "Coal phase-out accelerates in developed nations", "EV adoption crosses 30% of new car sales"] },
                  { year: 2030, title: "Partial Progress", items: ["Emissions 25% below peak \u2014 short of 45% target", "Renewables at 42% of global electricity", "Deforestation halved from 2020 levels", "30x30 biodiversity target 60% met"] },
                  { year: 2035, title: "Transition Accelerates", items: ["Developed nations reach 70% renewable electricity", "EV fleet reaches 60% of new sales", "Natural gas begins decline in power sector", "Water stress peaks and begins slow decline"] },
                  { year: 2040, title: "Mixed Results", items: ["Global emissions at 18 Gt/year \u2014 half of peak", "Temperature passes +1.5\u00b0C guardrail", "Amazon narrowly avoids tipping point", "Developing nations accelerate transition with international support"] },
                  { year: 2045, title: "Late-Stage Push", items: ["Renewables cross 80% globally", "Carbon capture scaling but behind schedule", "Sea level rise at 110mm and accelerating slowly", "Food systems adapting but vulnerable"] },
                  { year: 2050, title: "Stabilizing but Fragile", items: ["Temperature at +1.8\u00b0C \u2014 approaching 2\u00b0C limit", "CO\u2082 at 395 ppm and declining slowly", "Biodiversity index at 94 \u2014 stabilized", "88% renewable electricity"] },
                ],
                bau: [
                  { year: 2027, title: "Pledges Without Action", items: ["NDCs updated on paper but implementation lags", "Fossil fuel subsidies persist at $500B+/year", "Green investment grows but below required pace", "Coal phase-out stalls outside Europe"] },
                  { year: 2030, title: "Targets Missed", items: ["Emissions only 10% below peak", "Renewables at 35% \u2014 growing but too slowly", "Deforestation continues at 10M ha/year", "First major coral reef system declared functionally extinct"] },
                  { year: 2035, title: "Tipping Points Approached", items: ["Amazon deforestation passes 20% threshold", "Arctic ice-free summers become regular", "Extreme weather events double from 2020 frequency", "Climate migration reaches 50M displaced/year"] },
                  { year: 2040, title: "Cascading Impacts", items: ["Temperature passes +2.5\u00b0C", "Amazon dieback visibly underway", "Multiple breadbasket failures in single year", "Over 500M face food insecurity"] },
                  { year: 2045, title: "Adaptation Overwhelmed", items: ["Sea level rise at 250mm, accelerating", "Water stress affects 50% of population", "Fisheries collapse in tropical waters", "Climate refugee crisis strains international systems"] },
                  { year: 2050, title: "Locked-In Crisis", items: ["Temperature at +3\u00b0C with no flattening", "CO\u2082 at 551 ppm and still rising", "Biodiversity index at 52 \u2014 half of baseline gone", "1 billion+ people in hunger"] },
                ],
                worst: [
                  { year: 2027, title: "Coordination Collapse", items: ["Paris Agreement effectively abandoned by major emitters", "Fossil fuel expansion resumes under energy security pretext", "Climate finance pledges unfulfilled", "Deforestation accelerates in Amazon, Congo, Southeast Asia"] },
                  { year: 2030, title: "Feedback Loops Visible", items: ["Permafrost thaw releasing measurable methane", "Emissions still rising \u2014 no peak in sight", "Arctic ice loss accelerating albedo feedback", "Extreme weather becomes the new normal"] },
                  { year: 2035, title: "Tipping Points Breached", items: ["Amazon dieback irreversible \u2014 savannification begun", "Boreal forest mega-fires become annual", "Natural carbon release rivals 10% of human emissions", "Temperature passes +3\u00b0C"] },
                  { year: 2040, title: "Systems Failure", items: ["Multiple simultaneous breadbasket failures", "Coastal megacity evacuations begin \u2014 100M+ displaced", "Water wars in Middle East, Central Asia, North Africa", "Global food prices 5x 2020 levels"] },
                  { year: 2045, title: "Civilizational Stress", items: ["Temperature passes +4\u00b0C", "Sea level rise at 700mm+, accelerating rapidly", "Climate migration at 500M+ people", "International cooperation collapsed under resource competition"] },
                  { year: 2050, title: "The Reckoning", items: ["Temperature at +4.6\u00b0C \u2014 feedback loops self-reinforcing", "CO\u2082 at 790 ppm with no plateau", "81% of monitored biodiversity gone", "Famine, water crisis, and displacement define the era"] },
                ],
              };
              const milestones = scenarioMilestones[s.id] || data.milestones;
              return (
              <div className="space-y-4 mb-8">
                <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>Key milestones under <strong style={{ color: s.color }}>{s.name}</strong></p>
                {milestones.map((m, i) => {
                  const colors = ["var(--teal)", "var(--emerald)", "var(--sky)", "var(--violet)", "var(--amber)", "var(--rose)"];
                  const c = colors[i % colors.length];
                  return (
                    <div key={i} className="glass-card p-5 flex gap-4" style={{ borderLeft: `3px solid ${c}` }}>
                      <div className="flex-shrink-0 w-20 text-center">
                        <p className="text-lg font-bold" style={{ color: c, fontFamily: "'Space Grotesk',sans-serif" }}>{m.year}</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>{m.title}</h4>
                        <ul className="space-y-1">
                          {m.items.map((item, j) => (
                            <li key={j} className="text-xs flex items-start gap-2" style={{ color: "var(--text-muted)" }}>
                              <span style={{ color: c }}>{"\u2022"}</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
              );
            })()}

            {/* Temperature trajectory */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Temperature Trajectory (\u00b0C)</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>The defining metric \u2014 where temperature goes determines everything else</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={scenarioChartData.temp}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[1, 5]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Line key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} dot={false} name={sc.name} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{tempTimeDesc[s.id]}</p>
            </div>

            {/* Sea level trajectory */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Sea Level Rise (mm)</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>Cumulative rise from 2026 baseline</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scenarioChartData.sea}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Area key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} fill="none" strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} name={sc.name} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{seaDesc[s.id]}</p>
            </div>

            {/* Forest cover */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Forest Cover Trajectories (% of land)</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>Forests are both a measure of planetary health and a lever for carbon drawdown</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scenarioChartData.forest}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[0, 50]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {data.scenarios.map(sc => (
                    <Area key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} fill="none" strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.4} name={sc.name} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{forestTimeDesc[s.id]}</p>
            </div>

            {/* Summary */}
            <div className="glass-card p-6 mb-8" style={{ borderLeft: `3px solid ${s.color}` }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                <span className="text-lg">{s.icon}</span> The Road to 2050: {s.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{timelineSummary[s.id]}</p>
            </div>

            {/* Ecosystem cross-links */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>Part of the AI Civilization Ecosystem</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Climate is one dimension of the broader civilizational challenge. These tools work together.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="/simulation" className="flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 transition hover:bg-sky-500/10">
                  <span className="text-2xl">{"\u{1F52C}"}</span>
                  <div><p className="text-sm font-semibold text-sky-300">Simulation Dashboard</p><p className="text-xs text-slate-400">Branching futures, structural metrics, and 50-year projections</p></div>
                </a>
                <a href="/transition" className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition hover:bg-emerald-500/10">
                  <span className="text-2xl">{"\u{1F6E0}\uFE0F"}</span>
                  <div><p className="text-sm font-semibold text-emerald-300">TransitionOS Dashboard</p><p className="text-xs text-slate-400">Workforce transitions, reskilling paths, and income bridges</p></div>
                </a>
                <a href="/civilization" className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition hover:bg-amber-500/10">
                  <span className="text-2xl">{"\u{1F30D}"}</span>
                  <div><p className="text-sm font-semibold text-amber-300">CivilizationOS Dashboard</p><p className="text-xs text-slate-400">Resident journeys, civic dividends, benefits, and KPI projections</p></div>
                </a>
                <a href="/governance" className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 transition hover:bg-violet-500/10">
                  <span className="text-2xl">{"\u{1F3DB}\uFE0F"}</span>
                  <div><p className="text-sm font-semibold text-violet-300">GovernanceOS Dashboard</p><p className="text-xs text-slate-400">Charter frameworks, citizen assemblies, audit tracking, and participation</p></div>
                </a>
              </div>
            </div>
          </section>
          );
        })()}
      </div>

      {/* ── FOOTER ── */}
      <footer className="mt-20 py-8 text-center text-xs" style={{ color: "var(--text-faint)", borderTop: "1px solid var(--card-border)" }}>
        <p>ClimateOS &middot; Clawcode Research &middot; 2026</p>
        <p className="mt-1">
          <a href="/blog" className="underline" style={{ color: "var(--text-muted)" }}>Blog</a>{" \u00B7 "}
          <a href="https://github.com/reillyclawcode/ClimateOS" target="_blank" rel="noopener" className="underline" style={{ color: "var(--text-muted)" }}>GitHub</a>{" \u00B7 "}
          <a href="/simulation" className="underline" style={{ color: "var(--text-muted)" }}>Simulation</a>{" \u00B7 "}
          <a href="/transition" className="underline" style={{ color: "var(--text-muted)" }}>TransitionOS</a>{" \u00B7 "}
          <a href="/civilization" className="underline" style={{ color: "var(--text-muted)" }}>CivilizationOS</a>{" \u00B7 "}
          <a href="/governance" className="underline" style={{ color: "var(--text-muted)" }}>GovernanceOS</a>{" \u00B7 "}
          <a href="/strategy" className="underline" style={{ color: "var(--text-muted)" }}>StrategyOS</a>
        </p>
      </footer>
    </main>
  );
}
