"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface Skill { id: string; name: string; category: string; transferability: number }
interface Occupation {
  id: string; title: string; category: string; sector: string;
  median_salary: number; automation_risk: number; growth_outlook: number;
  workers_estimate: number; skills: string[];
}
interface PathResult {
  from_id: string; from_title: string; to_id: string; to_title: string;
  salary_current: number; salary_target: number; salary_uplift: number;
  salary_uplift_pct: number; training_months: number; training_cost: number;
  success_rate: number; credential: string; shared_skills: string[];
  new_skills: string[]; automation_risk_reduction: number;
  growth_outlook_target: number; roi_score: number;
}
interface BridgeExample {
  label: string; monthly_income_loss: number; training_months: number;
  training_cost: number; total_gap: number; savings_coverage_months: number;
  unemployment_benefit: number; civic_dividend_monthly: number;
  civic_dividend_total: number; out_of_pocket: number;
  post_transition_salary: number; payback_months: number; net_10yr_gain: number;
}
interface YearState {
  year: number; poverty_rate: number; median_reskill_months: number;
  placement_rate: number; stipend_utilization: number;
  household_liquidity: number; employment_rate: number;
  emissions_intensity: number; charter_audit_coverage: number;
}
interface ScenarioResult { scenario: string; years: number[]; trajectory: YearState[]; final: YearState }
interface SeedData {
  graph: { skills: Skill[]; occupations: Occupation[] };
  paths: Record<string, PathResult[]>;
  bridges: BridgeExample[];
  cohort: ScenarioResult[];
}

type Tab = "overview" | "explorer" | "paths" | "bridge" | "cohort" | "phases";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

const fmt = (n: number) => n.toLocaleString("en-US");
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : fmt(n);
const fmtUSD = (n: number) => `$${fmtK(n)}`;
const pct = (n: number) => `${n.toFixed(1)}%`;
const RISK_COLOR = (r: number) => r > 0.7 ? "#fb7185" : r > 0.4 ? "#fbbf24" : "#34d399";

const SC_LABELS: Record<string, string> = {
  baseline: "Baseline (no intervention)",
  transition_os: "Transition OS only",
  full_stack: "Full Stack (OS + Dividends + VPP)",
};
const SC_COLORS: Record<string, string> = { baseline: "#64748b", transition_os: "#38bdf8", full_stack: "#34d399" };
const SC_ICONS: Record<string, string> = { baseline: "\u{1F6A8}", transition_os: "\u{1F6E0}\uFE0F", full_stack: "\u{1F31F}" };
const SC_DESCS: Record<string, string> = {
  baseline: "No new programs. Current market dynamics continue. Automation displaces workers without coordinated reskilling or income support.",
  transition_os: "Reskilling pathways, job matching, and credential programs deployed. Workers gain tools but no income bridge during transition.",
  full_stack: "Full deployment: Transition OS + Civic Dividends + Virtual Power Plants. Both the skills gap and the income gap are addressed simultaneously.",
};

const METRIC_META: Record<string, { label: string; unit: string; color: string; better: string }> = {
  poverty_rate:           { label: "Poverty Rate",         unit: "%",       color: "#fb7185", better: "lower" },
  median_reskill_months:  { label: "Median Reskill Time",  unit: " mo",     color: "#fbbf24", better: "lower" },
  placement_rate:         { label: "Placement Rate",       unit: "%",       color: "#34d399", better: "higher" },
  stipend_utilization:    { label: "Stipend Utilization",  unit: "%",       color: "#a78bfa", better: "higher" },
  household_liquidity:    { label: "Household Liquidity",  unit: "",        color: "#38bdf8", better: "higher" },
  employment_rate:        { label: "Employment Rate",      unit: "%",       color: "#2dd4bf", better: "higher" },
  emissions_intensity:    { label: "Emissions Intensity",  unit: " kg/kWh", color: "#94a3b8", better: "lower" },
  charter_audit_coverage: { label: "Charter Audit Coverage",unit: "%",      color: "#c084fc", better: "higher" },
};

const PHASES = [
  { id: 0, title: "Map what exists",             dur: "60 days",   icon: "\u{1F5FA}\uFE0F", color: "var(--sky)",     desc: "Stand up a discovery sprint producing a State-of-the-System atlas across five lenses: AI safety, income cushion, climate readiness, capital channels, and data commons." },
  { id: 1, title: "Launch civic pilots",          dur: "Year 1\u20132",icon: "\u{1F680}", color: "var(--emerald)", desc: "Choose two anchor municipalities. Lock in $150M+ over 24 months. Launch Transition OS in sandbox mode, then open public enrollment with biweekly stipends." },
  { id: 2, title: "Co-design guardrails",         dur: "Year 1\u20132",icon: "\u{1F3DB}\uFE0F", color: "var(--violet)",  desc: "Recruit citizen assemblies. Produce AI Charter addenda, climate compacts, and escalation protocols." },
  { id: 3, title: "Federate software + data",     dur: "Year 2\u20133",icon: "\u{1F517}", color: "var(--amber)",   desc: "Deploy shared lakehouse with automated pipelines. Harden Governance OS with SOC 2 controls." },
  { id: 4, title: "Scale capital alignment",       dur: "Year 3\u20134",icon: "\u{1F4B0}", color: "var(--sky)",     desc: "Formalize Mission Investment Syndicate. Build shared data room fed by Measurement Stack." },
  { id: 5, title: "Institutionalize accountability",dur: "Year 4\u20135",icon: "\u{1F4CA}", color: "var(--rose)",    desc: "Pipe all program logs into unified Measurement Stack. Establish quarterly hearings." },
  { id: 6, title: "Export & iterate",              dur: "Year 5+",   icon: "\u{1F30D}", color: "var(--emerald)", desc: "Open-source code, schemas, and legal templates. Launch fellowship exchanges." },
];

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function Heading({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
      <p className="text-2xl font-bold" style={{ color: color || "var(--accent)", fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs" style={{ minWidth: 160 }}>
      <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{SC_LABELS[p.dataKey] || p.name}</span>
          <span className="font-mono" style={{ color: "var(--text)" }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Main page                                                          */
/* ================================================================== */

export default function Home() {
  const [data, setData] = useState<SeedData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedOcc, setSelectedOcc] = useState<string | null>(null);
  const [cohortMetric, setCohortMetric] = useState("poverty_rate");
  const [cohortYear, setCohortYear] = useState(2035);
  const [occFilter, setOccFilter] = useState("all");
  const [activeScenario, setActiveScenario] = useState("full_stack");

  useEffect(() => {
    fetch("/data/transition.json").then(r => r.json()).then(setData).catch(console.error);
  }, []);

  const occupations = useMemo(() => data?.graph.occupations ?? [], [data]);
  const filteredOccs = useMemo(() => occFilter === "all" ? occupations : occupations.filter(o => o.category === occFilter), [occupations, occFilter]);
  const selectedPaths = useMemo(() => (selectedOcc && data) ? (data.paths[selectedOcc] ?? []) : [], [selectedOcc, data]);
  const totalWorkers = useMemo(() => occupations.reduce((s, o) => s + o.workers_estimate, 0), [occupations]);
  const atRiskCount = useMemo(() => occupations.filter(o => o.category === "At-Risk").length, [occupations]);
  const growthCount = useMemo(() => occupations.filter(o => o.category === "Growth").length, [occupations]);
  const avgRisk = useMemo(() => occupations.length ? occupations.reduce((s, o) => s + o.automation_risk, 0) / occupations.length : 0, [occupations]);

  const cohortData = useMemo(() => {
    if (!data) return [];
    const years = data.cohort[0]?.years ?? [];
    return years.map((yr, i) => {
      const row: any = { year: yr };
      for (const sc of data.cohort) row[sc.scenario] = (sc.trajectory[i] as any)?.[cohortMetric] ?? 0;
      return row;
    });
  }, [data, cohortMetric]);

  const cohortSnapshot = useMemo(() => {
    if (!data) return null;
    const idx = cohortYear - 2026;
    return Object.fromEntries(data.cohort.map(sc => [sc.scenario, sc.trajectory[idx] ?? sc.trajectory[sc.trajectory.length - 1]]));
  }, [data, cohortYear]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-pulse">{"\u26A1"}</div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading TransitionOS data&hellip;</p>
        </div>
      </main>
    );
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "\u{1F4CA}" },
    { id: "explorer", label: "Occupations", icon: "\u{1F50D}" },
    { id: "paths",    label: "Path Planner", icon: "\u{1F9ED}" },
    { id: "bridge",   label: "Income Bridge", icon: "\u{1F4B0}" },
    { id: "cohort",   label: "Cohort Projections", icon: "\u{1F4C8}" },
    { id: "phases",   label: "Phases", icon: "\u{1F5FA}\uFE0F" },
  ];

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="pt-10 pb-8 px-4" style={{ background: "linear-gradient(180deg, rgba(14,165,233,0.06) 0%, transparent 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.4em] mb-2" style={{ color: "var(--sky)" }}>TransitionOS</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Workforce Transition Dashboard</h1>
          <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
            Explore career transitions, reskilling paths, and income bridges across {occupations.length} occupations.
            Compare three policy scenarios over a 10-year horizon.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <a href="https://github.com/reillyclawcode/transitionOS" target="_blank" rel="noopener" className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(56,189,248,0.12)", color: "var(--sky)", border: "1px solid rgba(56,189,248,0.3)" }}>{"\u{1F4BB}"} GitHub</a>
            <a href="/research" className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>{"\u{1F4DC}"} Research Paper</a>
            <a href="/simulation" className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>{"\u{1F52C}"} Simulation</a>
            <a href="/civilization" className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>{"\u{1F30D}"} CivilizationOS</a>
            <a href="/governance" className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>{"\u{1F3DB}\uFE0F"} GovernanceOS</a>
            <a href="/climate" className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(20,184,166,0.12)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.3)" }}>{"\u{1F331}"} ClimateOS</a>
            <a href="/strategy" className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>{"\u2699\uFE0F"} StrategyOS</a>
            <a href="/blog" className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>{"\u{1F4DD}"} Blog</a>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--card-border)" }}>
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn whitespace-nowrap ${tab === t.id ? "tab-btn-active" : ""}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8">

        {/* ═══ OVERVIEW ═══ */}
        {tab === "overview" && (() => {
          const sc = data.cohort.find(c => c.scenario === activeScenario) || data.cohort[0];
          const scColor = SC_COLORS[activeScenario] || "#64748b";

          const transScores = [
            { domain: "Employment", score: 58, trend: "stable" as const, icon: "\u{1F4BC}", color: "#38bdf8", note: `${occupations.length} occupations tracked, ${atRiskCount} at risk` },
            { domain: "Reskilling", score: 35, trend: "improving" as const, icon: "\u{1F393}", color: "#a78bfa", note: "Avg risk " + pct(avgRisk * 100) + ", pathways insufficient" },
            { domain: "Income Security", score: 42, trend: "declining" as const, icon: "\u{1F4B0}", color: "#10b981", note: `${fmtK(totalWorkers)} workers, safety nets strained` },
            { domain: "Equity", score: 38, trend: "declining" as const, icon: "\u2696\uFE0F", color: "#f59e0b", note: "Automation hitting lower-income jobs hardest" },
          ];
          const overallScore = Math.round(transScores.reduce((a, c) => a + c.score, 0) / transScores.length);
          const letterGrade = (s: number) => s >= 93 ? "A" : s >= 85 ? "A-" : s >= 80 ? "B+" : s >= 73 ? "B" : s >= 68 ? "B-" : s >= 63 ? "C+" : s >= 58 ? "C" : s >= 53 ? "C-" : s >= 48 ? "D+" : s >= 43 ? "D" : s >= 38 ? "D-" : "F";
          const gColor = (s: number) => s >= 73 ? "#10b981" : s >= 53 ? "#f59e0b" : s >= 38 ? "#fb923c" : "#f43f5e";
          const trendArrow = (t: string) => t === "improving" ? "\u2191" : t === "stable" ? "\u2192" : "\u2193";
          const trendColor = (t: string) => t === "improving" ? "#10b981" : t === "stable" ? "#f59e0b" : "#f43f5e";

          const povertyDesc: Record<string, string> = {
            baseline: "Without intervention, poverty continues its current trajectory. Automation displaces workers faster than the market absorbs them. By 2035, the poverty rate remains elevated as displaced workers exhaust savings and cycle through low-quality gig work. There is no safety net designed for this scale of disruption.",
            transition_os: "Transition OS alone bends the curve significantly. Reskilling pathways, job matching, and credential support reduce the time workers spend unemployed. Poverty falls as placement rates climb. However, without income bridging, workers still face painful gaps during retraining that can push vulnerable households below the line.",
            full_stack: "The Full Stack approach \u2014 Transition OS + Civic Dividends + Virtual Power Plants \u2014 delivers the steepest decline. Dividends cover the income gap during reskilling. VPP revenue supplements household income. Poverty approaches the target rate by 2035, and the trajectory is still improving. This is the only scenario that addresses both the skills gap and the income gap simultaneously.",
          };
          const employmentDesc: Record<string, string> = {
            baseline: "Employment holds relatively steady but masks a hollowing out: full-time secure positions shrink while gig and precarious work expands. The headline rate conceals declining job quality, stagnant wages, and a growing underemployment problem.",
            transition_os: "Transition OS pushes employment up by matching displaced workers to growth occupations faster. The placement rate climbs, and the quality of matches improves. Workers spend less time idle and more time in upward-mobility paths. The rate converges toward full employment.",
            full_stack: "Full Stack employment is the strongest. Income bridging means workers can afford longer, more effective retraining rather than grabbing the first available job. This leads to better matches, higher retention, and a compounding effect as well-placed workers contribute more to the tax base that funds the system.",
          };
          const overviewSummary: Record<string, string> = {
            baseline: "Under the no-intervention baseline, the workforce transition unfolds chaotically. Automation displaces millions while reskilling infrastructure remains inadequate. Poverty stays elevated, placement is slow, and the human cost of an unmanaged transition is measured in shattered livelihoods, broken communities, and deepening inequality. This is the default future unless we choose differently.",
            transition_os: "Transition OS alone is transformative but incomplete. Reskilling pathways, credential programs, and intelligent job matching dramatically reduce the time and friction of career transitions. Poverty falls, employment improves, and workers gain agency. But without income support during the gap, the most vulnerable still struggle. It\u2019s a powerful engine missing its fuel.",
            full_stack: "The Full Stack scenario demonstrates what a coordinated response looks like. Transition OS provides the infrastructure. Civic Dividends provide the safety net. VPP revenue provides the sustainability. Together, they create a virtuous cycle: workers can afford to retrain properly, better training leads to better placements, better placements generate tax revenue that funds the next cohort. Poverty approaches its floor. Employment reaches its ceiling. This is achievable with current technology and realistic funding levels.",
          };

          return (
          <section>
            <Heading icon={"\u{1F4CA}"} title="Dashboard Overview" sub="Workforce transition scores, scenario projections, and key metrics" />

            {/* ── Transition Score ── */}
            <div className="glass-card p-6 mb-8" style={{ borderTop: `3px solid ${gColor(overallScore)}` }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-5">
                <div className="relative w-24 h-24 flex-shrink-0 mx-auto sm:mx-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={gColor(overallScore)} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${overallScore * 2.64} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold" style={{ color: gColor(overallScore), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(overallScore)}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{overallScore}/100</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Today&apos;s Transition Score</h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Workforce readiness for the AI automation wave. Employment quality, reskilling capacity, income security, and equity measured against what&apos;s needed.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {transScores.map(ts => (
                  <div key={ts.domain} className="glass-card p-3 text-center">
                    <span className="text-lg">{ts.icon}</span>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: "var(--text)" }}>{ts.domain}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-lg font-bold" style={{ color: gColor(ts.score), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(ts.score)}</span>
                      <span className="text-sm font-bold" style={{ color: trendColor(ts.trend) }}>{trendArrow(ts.trend)}</span>
                    </div>
                    <p className="text-[9px] mt-1 leading-tight" style={{ color: "var(--text-muted)" }}>{ts.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {data.cohort.map(c => (
                <button key={c.scenario} onClick={() => setActiveScenario(c.scenario)} className={`glass-card p-5 text-left w-full transition-all hover:border-white/20 ${activeScenario === c.scenario ? "ring-2" : ""}`} style={activeScenario === c.scenario ? { borderColor: `${SC_COLORS[c.scenario]}55`, boxShadow: `0 0 20px ${SC_COLORS[c.scenario]}11` } : {}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{SC_ICONS[c.scenario]}</span>
                    <h4 className="text-sm font-semibold" style={{ color: SC_COLORS[c.scenario] }}>{SC_LABELS[c.scenario]}</h4>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{SC_DESCS[c.scenario]}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div><span style={{ color: "var(--text-faint)" }}>Poverty:</span> <span className="font-mono">{c.final.poverty_rate}%</span></div>
                    <div><span style={{ color: "var(--text-faint)" }}>Placement:</span> <span className="font-mono">{c.final.placement_rate}%</span></div>
                    <div><span style={{ color: "var(--text-faint)" }}>Employment:</span> <span className="font-mono">{c.final.employment_rate}%</span></div>
                    <div><span style={{ color: "var(--text-faint)" }}>Reskill:</span> <span className="font-mono">{c.final.median_reskill_months} mo</span></div>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Stat label="Occupations" value={`${occupations.length}`} color="var(--sky)" />
              <Stat label="Workers covered" value={fmtK(totalWorkers)} sub="across all occupations" color="var(--emerald)" />
              <Stat label="At-risk" value={`${atRiskCount}`} sub={`${growthCount} growth targets`} color="var(--rose)" />
              <Stat label="Avg automation risk" value={pct(avgRisk * 100)} color="var(--amber)" />
            </div>

            {/* Poverty trajectory with scenario-aware description */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Poverty Rate Trajectory</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Three scenarios, 2026\u20132035 &mdash; highlighting <strong style={{ color: scColor }}>{SC_LABELS[activeScenario]}</strong></p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={(() => { const yrs = data.cohort[0]?.years ?? []; return yrs.map((yr, i) => { const row: any = { year: yr }; for (const c of data.cohort) row[c.scenario] = c.trajectory[i]?.poverty_rate ?? 0; return row; }); })()}>
                  <defs>
                    {Object.entries(SC_COLORS).map(([k, c]) => (<linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={activeScenario === k ? 0.3 : 0.1} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 20]} />
                  <Tooltip content={<ChartTip />} />
                  {Object.entries(SC_COLORS).map(([k, c]) => (<Area key={k} type="monotone" dataKey={k} stroke={c} fill={`url(#g-${k})`} strokeWidth={activeScenario === k ? 3 : 1.5} strokeOpacity={activeScenario === k ? 1 : 0.4} name={SC_LABELS[k]} />))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{povertyDesc[activeScenario]}</p>
            </div>

            {/* Employment trajectory */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Employment Rate Trajectory</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Three scenarios, 2026\u20132035</p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={(() => { const yrs = data.cohort[0]?.years ?? []; return yrs.map((yr, i) => { const row: any = { year: yr }; for (const c of data.cohort) row[c.scenario] = c.trajectory[i]?.employment_rate ?? 0; return row; }); })()}>
                  <defs>
                    {Object.entries(SC_COLORS).map(([k, c]) => (<linearGradient key={k} id={`ge-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={activeScenario === k ? 0.3 : 0.1} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip content={<ChartTip />} />
                  {Object.entries(SC_COLORS).map(([k, c]) => (<Area key={k} type="monotone" dataKey={k} stroke={c} fill={`url(#ge-${k})`} strokeWidth={activeScenario === k ? 3 : 1.5} strokeOpacity={activeScenario === k ? 1 : 0.4} name={SC_LABELS[k]} />))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{employmentDesc[activeScenario]}</p>
            </div>

            {/* Overview summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${scColor}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: scColor, fontFamily: "'Space Grotesk',sans-serif" }}>
                The Workforce in 2035: {SC_LABELS[activeScenario]}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{overviewSummary[activeScenario]}</p>
            </div>
          </section>
          );
        })()}

        {/* ═══ OCCUPATION EXPLORER ═══ */}
        {tab === "explorer" && (
          <section>
            <Heading icon={"\u{1F50D}"} title="Occupation Explorer" sub="Browse occupations by automation risk, salary, and growth outlook" />
            <div className="flex gap-2 mb-6 flex-wrap">
              {["all", "At-Risk", "Transitioning", "Growth"].map(f => (
                <button key={f} onClick={() => setOccFilter(f)} className={`tab-btn ${occFilter === f ? "tab-btn-active" : ""}`}>
                  {f === "all" ? "All" : f} ({f === "all" ? occupations.length : occupations.filter(o => o.category === f).length})
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOccs.map(occ => {
                const badge = occ.category === "At-Risk" ? "badge-at-risk" : occ.category === "Transitioning" ? "badge-transitioning" : "badge-growth";
                return (
                  <button key={occ.id} onClick={() => { setSelectedOcc(occ.id); setTab("paths"); }} className={`glass-card glass-card-interactive p-4 text-left w-full ${selectedOcc === occ.id ? "ring-2 ring-sky-400/50" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{occ.title}</h4>
                      <span className={`${badge} text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap`}>{occ.category}</span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{occ.sector} &middot; {fmtK(occ.workers_estimate)} workers</p>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span style={{ color: "var(--text-muted)" }}>Automation risk</span>
                      <span style={{ color: RISK_COLOR(occ.automation_risk) }}>{(occ.automation_risk * 100).toFixed(0)}%</span>
                    </div>
                    <div className="risk-bar-track"><div className="risk-bar-fill" style={{ width: `${occ.automation_risk * 100}%`, background: RISK_COLOR(occ.automation_risk) }} /></div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span style={{ color: "var(--emerald)" }}>{fmtUSD(occ.median_salary)}/yr</span>
                      <span style={{ color: occ.growth_outlook >= 0 ? "var(--emerald)" : "var(--rose)" }}>{occ.growth_outlook > 0 ? "+" : ""}{occ.growth_outlook}% outlook</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ PATH PLANNER ═══ */}
        {tab === "paths" && (
          <section>
            <Heading icon={"\u{1F9ED}"} title="Reskilling Path Planner" sub="Select a source occupation to see ranked transition paths" />
            <div className="mb-6">
              <label className="text-xs block mb-2" style={{ color: "var(--text-muted)" }}>Current occupation ({occupations.length} available)</label>
              <select
                value={selectedOcc ?? ""}
                onChange={e => setSelectedOcc(e.target.value || null)}
                className="w-full sm:w-96 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "#0f172a", border: "1px solid var(--card-border)", color: "var(--text)" }}
              >
                <option value="">Choose an occupation&hellip;</option>
                <optgroup label={`At-Risk (${occupations.filter(o => o.category === "At-Risk").length})`}>
                  {occupations.filter(o => o.category === "At-Risk").map(o => (<option key={o.id} value={o.id}>{o.title} &mdash; {(o.automation_risk * 100).toFixed(0)}% risk</option>))}
                </optgroup>
                <optgroup label={`Transitioning (${occupations.filter(o => o.category === "Transitioning").length})`}>
                  {occupations.filter(o => o.category === "Transitioning").map(o => (<option key={o.id} value={o.id}>{o.title} &mdash; {(o.automation_risk * 100).toFixed(0)}% risk</option>))}
                </optgroup>
                <optgroup label={`Growth (${occupations.filter(o => o.category === "Growth").length})`}>
                  {occupations.filter(o => o.category === "Growth").map(o => (<option key={o.id} value={o.id}>{o.title} &mdash; {(o.automation_risk * 100).toFixed(0)}% risk</option>))}
                </optgroup>
              </select>
            </div>

            {selectedOcc && selectedPaths.length > 0 && (
              <>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>{selectedPaths.length} transition paths found, ranked by composite ROI score</p>
                <div className="glass-card p-5 mb-6">
                  <h4 className="text-xs font-semibold mb-3" style={{ color: "var(--text)" }}>Salary Comparison</h4>
                  <ResponsiveContainer width="100%" height={Math.max(180, selectedPaths.length * 40)}>
                    <BarChart data={selectedPaths.map(p => ({ name: p.to_title.length > 20 ? p.to_title.slice(0, 18) + "\u2026" : p.to_title, current: p.salary_current, target: p.salary_target }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="current" fill="#64748b" name="Current salary" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="target" fill="#34d399" name="Target salary" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {selectedPaths.map(p => (
                    <div key={p.to_id} className="glass-card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{p.to_title}</h4>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{p.credential}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: "var(--emerald)", fontFamily: "'Space Grotesk', sans-serif" }}>{p.roi_score.toFixed(0)}</p>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>ROI</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div><p className="text-[10px] uppercase" style={{ color: "var(--text-faint)" }}>Salary uplift</p><p className="text-sm font-semibold" style={{ color: p.salary_uplift >= 0 ? "var(--emerald)" : "var(--rose)" }}>{p.salary_uplift >= 0 ? "+" : ""}{fmtUSD(p.salary_uplift)}</p></div>
                        <div><p className="text-[10px] uppercase" style={{ color: "var(--text-faint)" }}>Training</p><p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{p.training_months} mo / {fmtUSD(p.training_cost)}</p></div>
                        <div><p className="text-[10px] uppercase" style={{ color: "var(--text-faint)" }}>Success</p><p className="text-sm font-semibold" style={{ color: "var(--sky)" }}>{(p.success_rate * 100).toFixed(0)}%</p></div>
                        <div><p className="text-[10px] uppercase" style={{ color: "var(--text-faint)" }}>Risk reduction</p><p className="text-sm font-semibold" style={{ color: "var(--emerald)" }}>-{(p.automation_risk_reduction * 100).toFixed(0)}pp</p></div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.shared_skills.map(s => (<span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(56,189,248,0.12)", color: "var(--sky)" }}>{s}</span>))}
                        {p.new_skills.map(s => (<span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "var(--amber)" }}>+ {s}</span>))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedOcc && selectedPaths.length === 0 && (<div className="glass-card p-8 text-center"><p className="text-sm" style={{ color: "var(--text-muted)" }}>No transition paths defined for this occupation yet.</p></div>)}
            {!selectedOcc && (<div className="glass-card p-8 text-center"><p className="text-3xl mb-3">{"\u{1F9ED}"}</p><p className="text-sm" style={{ color: "var(--text-muted)" }}>Select an occupation above to explore reskilling paths.</p></div>)}
          </section>
        )}

        {/* ═══ INCOME BRIDGE ═══ */}
        {tab === "bridge" && (
          <section>
            <Heading icon={"\u{1F4B0}"} title="Income Bridge Calculator" sub="How Civic Dividends cover the income gap during reskilling" />
            <div className="glass-card p-5 mb-6" style={{ borderLeft: "3px solid var(--emerald)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--emerald)" }}>How it works:</strong> When a worker enters reskilling, the Civic Dividend bridges the gap between expenses and unemployment benefits so no household falls into poverty.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.bridges.map(b => (
                <div key={b.label} className="glass-card p-5">
                  <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>{b.label}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div><p style={{ color: "var(--text-faint)" }}>Training cost</p><p className="font-semibold" style={{ color: "var(--amber)" }}>{fmtUSD(b.training_cost)}</p></div>
                    <div><p style={{ color: "var(--text-faint)" }}>Total gap</p><p className="font-semibold" style={{ color: "var(--rose)" }}>{fmtUSD(b.total_gap)}</p></div>
                    <div><p style={{ color: "var(--text-faint)" }}>Civic dividend/mo</p><p className="font-semibold" style={{ color: "var(--emerald)" }}>{fmtUSD(b.civic_dividend_monthly)}</p></div>
                    <div><p style={{ color: "var(--text-faint)" }}>Out of pocket</p><p className="font-semibold" style={{ color: b.out_of_pocket > 0 ? "var(--rose)" : "var(--emerald)" }}>{b.out_of_pocket > 0 ? fmtUSD(b.out_of_pocket) : "$0"}</p></div>
                    <div><p style={{ color: "var(--text-faint)" }}>Payback</p><p className="font-semibold" style={{ color: "var(--sky)" }}>{b.payback_months > 0 ? `${b.payback_months} mo` : "N/A"}</p></div>
                    <div><p style={{ color: "var(--text-faint)" }}>Post salary</p><p className="font-semibold" style={{ color: "var(--emerald)" }}>{fmtUSD(b.post_transition_salary)}/yr</p></div>
                  </div>
                  <div className="mt-3 pt-3 flex justify-between text-xs" style={{ borderTop: "1px solid var(--card-border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Net 10-year gain</span>
                    <span className="font-bold text-sm" style={{ color: "var(--emerald)" }}>+{fmtUSD(b.net_10yr_gain)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ COHORT PROJECTIONS ═══ */}
        {tab === "cohort" && (() => {
          const scColor = SC_COLORS[activeScenario] || "#64748b";

          const metricDesc: Record<string, Record<string, string>> = {
            poverty_rate: {
              baseline: "Without intervention, poverty holds at structurally elevated levels. Automation displaces low-wage workers faster than the market re-absorbs them. By 2035, displaced households have cycled through savings, gig work, and public assistance without a durable path out. The rate barely moves because nothing in the system is designed to move it.",
              transition_os: "Transition OS bends the poverty curve meaningfully. Workers displaced by automation are matched to growth occupations faster, reducing the duration of income loss. Credential support and reskilling pathways cut the time between job loss and re-employment. However, without income bridging, the most vulnerable households still dip below the poverty line during retraining.",
              full_stack: "The Full Stack scenario delivers the steepest poverty decline. Civic Dividends cover the income gap during reskilling, preventing the downward spiral that poverty creates. VPP revenue supplements household income. By 2035, poverty approaches its structural floor and the trajectory is still improving. This is the only scenario that breaks the link between job displacement and destitution.",
            },
            median_reskill_months: {
              baseline: "Reskilling time stays long and painful. Without coordinated pathways, displaced workers spend months navigating fragmented training options, outdated curricula, and opaque credentialing. Many give up and accept lower-quality work. The median masks a long tail of workers trapped in multi-year transitions or permanent downgrading.",
              transition_os: "Transition OS compresses reskilling dramatically. AI-powered skill gap analysis, curated learning paths, and employer-aligned credentials cut the median from months of wandering to a structured sprint. Workers know exactly what to learn, where to learn it, and what credential employers will recognize. Time-to-placement drops sharply.",
              full_stack: "Full Stack reskilling is the fastest and most effective. Income bridging means workers can commit to longer, higher-quality programs without financial panic forcing them into the first available option. Better matches lead to higher retention, which feeds positive data back into the matching algorithm. The system improves itself with every cohort.",
            },
            placement_rate: {
              baseline: "Placement stays disappointing. Without a matching system, displaced workers apply broadly, get rejected frequently, and settle for mismatched roles. Employers struggle to identify qualified career-changers. The placement rate reflects a market where supply and demand exist but can not find each other efficiently.",
              transition_os: "Transition OS transforms placement. The matching engine connects displaced workers to specific openings based on transferable skills, training completion, and employer needs. Success rates climb as the algorithm learns from each cohort. Employers gain confidence in non-traditional candidates because credentials are verified and skill gaps are closed.",
              full_stack: "Full Stack placement is the strongest. Workers who complete reskilling with income support are less stressed, better trained, and more selective \u2014 leading to better matches and higher retention. Employers see lower turnover, which reinforces their willingness to hire through the system. The placement rate compounds upward as the flywheel spins.",
            },
            stipend_utilization: {
              baseline: "Stipend infrastructure does not exist in the baseline. Workers rely on unemployment insurance (if eligible), personal savings, and informal support networks. Most displaced workers face a funding gap between job loss and re-employment that no existing program is designed to fill.",
              transition_os: "Transition OS introduces targeted stipends for reskilling participants, but utilization depends on awareness, eligibility, and administrative friction. Take-up grows as the program matures and word-of-mouth spreads. However, stipend levels may not fully cover living costs, leaving some workers unable to complete training.",
              full_stack: "Full Stack stipend utilization is near-universal. Civic Dividends provide a baseline income floor that every transitioning worker can access. Combined with reskilling stipends, the system eliminates the financial barrier to participation. Workers who might have dropped out due to rent or childcare costs can now complete their programs.",
            },
            household_liquidity: {
              baseline: "Household liquidity erodes steadily. Without income support during transitions, families burn through savings and take on debt. By 2035, displaced households have materially less financial buffer than they started with. One unexpected expense \u2014 a medical bill, a car repair \u2014 can trigger a cascade into poverty.",
              transition_os: "Liquidity stabilizes for those who successfully reskill. Faster placement means shorter periods of income loss, preserving more household savings. However, the transition period itself still drains liquidity for many, particularly those in longer retraining programs or with dependents.",
              full_stack: "Full Stack households maintain and grow liquidity. Civic Dividends prevent savings drawdown during transitions. VPP income adds a supplementary revenue stream. Post-transition salaries are higher due to better matching. By 2035, the average transitioning household has more financial resilience than when they started \u2014 a genuinely transformative outcome.",
            },
            employment_rate: {
              baseline: "The headline employment rate holds relatively steady, but masks a hollowing out. Full-time positions with benefits shrink while gig work, part-time roles, and precarious contracts expand. Underemployment rises even as official unemployment stays moderate. The rate is a misleading indicator of workforce health.",
              transition_os: "Transition OS pushes quality employment up. Workers displaced from automatable roles are matched to growth occupations \u2014 not just any job, but occupations with higher stability, better pay, and lower automation risk. The employment rate converges toward full employment and the quality of that employment improves measurably.",
              full_stack: "Full Stack employment is the strongest and highest quality. Income bridging means workers can afford to wait for good matches rather than grabbing the first available position. This leads to higher retention, higher satisfaction, and a compounding effect as well-placed workers contribute more productively to the economy that funds the next cohort.",
            },
            emissions_intensity: {
              baseline: "Emissions intensity declines slowly along its current trajectory, driven by market forces and existing regulation. Progress is insufficient to meet climate targets. Without coordinated workforce transition, clean energy deployment is bottlenecked by skilled labor shortages.",
              transition_os: "Transition OS accelerates emissions reduction indirectly. By reskilling workers into clean energy, energy efficiency, and climate tech roles, it removes the labor bottleneck on decarbonization. The emissions intensity curve bends faster as the workforce catches up with the technology.",
              full_stack: "Full Stack emissions intensity falls the fastest. Virtual Power Plants directly reduce grid emissions while creating revenue. The trained workforce deploys clean infrastructure faster. The Civic Dividend system incentivizes participation in climate-positive work. This scenario achieves meaningful decarbonization as a side effect of solving the workforce crisis.",
            },
            charter_audit_coverage: {
              baseline: "Audit coverage remains minimal. Without dedicated governance infrastructure, AI deployment proceeds with limited oversight. Algorithmic decisions affecting employment, benefits, and opportunity go unexamined. Public trust erodes as opaque systems make consequential choices.",
              transition_os: "Transition OS includes basic audit mechanisms for its own algorithmic decisions \u2014 matching, credentialing, stipend allocation. This creates a template for broader coverage, but audit infrastructure remains limited to program participants and does not extend to private-sector AI deployment.",
              full_stack: "Full Stack audit coverage is comprehensive. Dedicated governance funding supports expanding charter audits beyond the program to cover AI systems affecting employment, lending, and public services. By 2035, a significant share of consequential algorithmic decisions are subject to regular, independent audit \u2014 a governance achievement with spillover benefits across society.",
            },
          };

          const cohortSummary: Record<string, string> = {
            baseline: "The baseline cohort projection reveals what happens when automation accelerates without a coordinated workforce response. Every metric either stagnates or deteriorates. Poverty holds, reskilling is slow and painful, placement is inefficient, and household liquidity erodes. The numbers are not catastrophic in any single year \u2014 the damage is cumulative, compounding quietly until communities realize they have been hollowed out. This is not a crisis that announces itself; it is a slow erosion of economic security for millions of working families.",
            transition_os: "Transition OS alone bends every curve in the right direction. Reskilling is faster, placement is better, and poverty falls. The system works. But it is incomplete \u2014 workers still face a painful income gap during transition, and the most vulnerable households cannot afford to participate fully. It is a powerful engine missing its fuel. The projections show clear improvement over baseline but leave significant human cost on the table.",
            full_stack: "The Full Stack cohort projection demonstrates what a coordinated, comprehensive response achieves. Every metric improves dramatically. Poverty approaches its structural floor. Reskilling is fast and effective. Placement rates are high and improving. Household liquidity grows. Emissions fall. Audit coverage expands. The system creates a virtuous cycle: income support enables better training, better training enables better placement, better placement generates the tax revenue that funds the next cohort. This is not utopian \u2014 it is achievable with current technology, realistic funding, and political will. The only question is whether we choose it.",
          };

          return (
          <section>
            <Heading icon={"\u{1F4C8}"} title="Cohort Projections" sub="10-year KPI trajectories across three policy scenarios" />

            {/* Scenario selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {data.cohort.map(c => (
                <button key={c.scenario} onClick={() => setActiveScenario(c.scenario)} className={`glass-card p-5 text-left w-full transition-all hover:border-white/20 ${activeScenario === c.scenario ? "ring-2" : ""}`} style={activeScenario === c.scenario ? { borderColor: `${SC_COLORS[c.scenario]}55`, boxShadow: `0 0 20px ${SC_COLORS[c.scenario]}11` } : {}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{SC_ICONS[c.scenario]}</span>
                    <h4 className="text-sm font-semibold" style={{ color: SC_COLORS[c.scenario] }}>{SC_LABELS[c.scenario]}</h4>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{SC_DESCS[c.scenario]}</p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(METRIC_META).map(([k, m]) => (
                <button key={k} onClick={() => setCohortMetric(k)} className={`tab-btn ${cohortMetric === k ? "tab-btn-active" : ""}`}>{m.label}</button>
              ))}
            </div>
            <div className="glass-card p-6 mb-6">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{METRIC_META[cohortMetric]?.label}</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>{METRIC_META[cohortMetric]?.better === "lower" ? "Lower is better" : "Higher is better"} &mdash; highlighting <strong style={{ color: scColor }}>{SC_LABELS[activeScenario]}</strong></p>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={cohortData}>
                  <defs>{Object.entries(SC_COLORS).map(([k, c]) => (<linearGradient key={k} id={`cg-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={activeScenario === k ? 0.3 : 0.08} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>))}</defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                  {Object.entries(SC_COLORS).map(([k, c]) => (<Area key={k} type="monotone" dataKey={k} stroke={c} fill={`url(#cg-${k})`} strokeWidth={activeScenario === k ? 3 : 1.5} strokeOpacity={activeScenario === k ? 1 : 0.35} name={SC_LABELS[k]} />))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{metricDesc[cohortMetric]?.[activeScenario]}</p>
            </div>
            <div className="glass-card p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold" style={{ color: "var(--text)" }}>Year Scrubber</h4>
                <span className="text-lg font-bold" style={{ color: "var(--accent)", fontFamily: "'Space Grotesk', sans-serif" }}>{cohortYear}</span>
              </div>
              <input type="range" min={2026} max={2035} value={cohortYear} onChange={e => setCohortYear(Number(e.target.value))} className="timeline-slider" />
            </div>
            {cohortSnapshot && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {Object.entries(cohortSnapshot).map(([scenario, state]) => (
                  <div key={scenario} className={`glass-card p-4 transition-all ${activeScenario === scenario ? "ring-2" : ""}`} style={{ borderTop: `3px solid ${SC_COLORS[scenario]}`, ...(activeScenario === scenario ? { boxShadow: `0 0 20px ${SC_COLORS[scenario]}11` } : {}) }}>
                    <p className="text-xs font-medium mb-3" style={{ color: SC_COLORS[scenario] }}>{SC_LABELS[scenario]} &mdash; {cohortYear}</p>
                    <div className="space-y-1.5 text-xs">
                      {Object.entries(METRIC_META).map(([k, m]) => (
                        <div key={k} className="flex justify-between">
                          <span style={{ color: "var(--text-muted)" }}>{m.label}</span>
                          <span className="font-mono" style={{ color: m.color }}>{k === "household_liquidity" ? `$${fmt((state as any)[k])}` : `${(state as any)[k]}${m.unit}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comprehensive summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${scColor}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: scColor, fontFamily: "'Space Grotesk',sans-serif" }}>
                Cohort Outlook 2035: {SC_LABELS[activeScenario]}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{cohortSummary[activeScenario]}</p>
            </div>
          </section>
          );
        })()}

        {/* ═══ PHASES ═══ */}
        {tab === "phases" && (
          <section>
            <Heading icon={"\u{1F5FA}\uFE0F"} title="Implementation Phases" sub="Seven-phase roadmap from discovery to global export" />
            <div className="space-y-4">
              {PHASES.map(p => (
                <div key={p.id} className="glass-card p-5 flex gap-4" style={{ borderLeft: `3px solid ${p.color}` }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: `${p.color}22` }}>{p.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${p.color}22`, color: p.color }}>Phase {p.id}</span>
                      <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{p.title}</h4>
                      <span className="text-[10px] ml-auto" style={{ color: "var(--text-faint)" }}>{p.dur}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-card p-6 mt-8">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Funding Stack</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Civic Dividend Pool", value: "$500M\u2013$3B/yr", sub: "1\u20136.5% regional GDP", color: "var(--emerald)" },
                  { label: "Transition OS Build", value: "$60M CAPEX", sub: "+ $40M/yr OPEX", color: "var(--sky)" },
                  { label: "Climate Portfolio", value: "$250M/yr", sub: "Blended mission capital", color: "var(--amber)" },
                  { label: "Governance & Audit", value: "$25M/yr", sub: "Data commons + oversight", color: "var(--violet)" },
                ].map(f => (
                  <div key={f.label} className="glass-card p-4">
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>{f.label}</p>
                    <p className="text-lg font-bold" style={{ color: f.color, fontFamily: "'Space Grotesk', sans-serif" }}>{f.value}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-xs" style={{ color: "var(--text-faint)", borderTop: "1px solid var(--card-border)" }}>
        <p>TransitionOS &middot; Clawcode Research &middot; 2026</p>
        <p className="mt-1">
          <a href="/blog" className="underline" style={{ color: "var(--text-muted)" }}>Blog</a>
          {" \u00B7 "}
          <a href="https://github.com/reillyclawcode/transitionOS" target="_blank" rel="noopener" className="underline" style={{ color: "var(--text-muted)" }}>GitHub</a>
          {" \u00B7 "}
          <a href="/simulation" className="underline" style={{ color: "var(--text-muted)" }}>Simulation</a>
          {" \u00B7 "}
          <a href="/civilization" className="underline" style={{ color: "var(--text-muted)" }}>CivilizationOS</a>
          {" \u00B7 "}
          <a href="/governance" className="underline" style={{ color: "var(--text-muted)" }}>GovernanceOS</a>
          {" \u00B7 "}
          <a href="/climate" className="underline" style={{ color: "var(--text-muted)" }}>ClimateOS</a>{" \u00B7 "}
          <a href="/strategy" className="underline" style={{ color: "var(--text-muted)" }}>StrategyOS</a>
        </p>
      </footer>
    </main>
  );
}
