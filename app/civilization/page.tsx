"use client";
import { useEffect, useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* Types */
interface Journey { id:string; title:string; icon:string; desc:string; steps:string[]; touchpoints:string[]; avgDays:number; completionRate:number; satisfactionScore:number }
interface FundingSource { source:string; pctOfPool:number; annual_m:number; desc:string }
interface DividendModel { fundingSources:FundingSource[]; poolSize_m:number; populationServed:number; biweeklyPerResident:number; annualPerResident:number; povertyReduction:{baseline:number;target:number;timelineYears:number}; escrowMonths:number; disbursementMethod:string }
interface KPI { id:string; label:string; unit:string; baseline:number; target:number; current:number; year:number; color:string; better:string; trajectory:number[] }
interface Milestone { year:number|string; title:string; items:string[] }
interface Benefit { id:string; title:string; desc:string; amount:string; icon:string; status:string; recipients:number }
interface ServiceProvider { name:string; type:string; capacity:number; coverage:string }
interface SeedData { journeys:Journey[]; dividendModel:DividendModel; kpis:KPI[]; milestones:Milestone[]; benefits:Benefit[]; serviceProviders:ServiceProvider[] }

type Tab = "overview" | "journeys" | "dividend" | "benefits" | "kpis" | "milestones";

const fmtK = (n:number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : n.toString();

function Heading({ icon, title, sub }: { icon:string; title:string; sub?:string }) {
  return (<div className="mb-6"><h2 className="text-xl font-semibold flex items-center gap-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}><span className="text-2xl">{icon}</span> {title}</h2>{sub && <p className="text-sm mt-1" style={{color:"var(--text-muted)"}}>{sub}</p>}</div>);
}
function Stat({ label, value, sub, color }: { label:string; value:string; sub?:string; color?:string }) {
  return (<div className="glass-card p-4"><p className="text-xs uppercase tracking-wider mb-1" style={{color:"var(--text-faint)"}}>{label}</p><p className="text-2xl font-bold" style={{color:color||"var(--amber)",fontFamily:"'Space Grotesk',sans-serif"}}>{value}</p>{sub && <p className="text-xs mt-1" style={{color:"var(--text-muted)"}}>{sub}</p>}</div>);
}

type CivScenario = "aggressive" | "moderate" | "bau" | "worst";
const CIV_SCENARIOS: { id: CivScenario; name: string; icon: string; color: string; desc: string }[] = [
  { id: "aggressive", name: "Aggressive Action", icon: "\u{1F31F}", color: "#10b981", desc: "Full deployment of civic infrastructure, dividends, AI governance, climate action, and workforce transition programs." },
  { id: "moderate", name: "Moderate Reform", icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", desc: "Partial adoption of civic programs. Dividends in pilot regions, selective governance reforms, gradual climate response." },
  { id: "bau", name: "Business as Usual", icon: "\u{1F4C9}", color: "#f59e0b", desc: "Current trajectory continues. No new civic infrastructure, minimal coordination, piecemeal responses to systemic crises." },
  { id: "worst", name: "Worst Case", icon: "\u{1F6A8}", color: "#f43f5e", desc: "Institutional failure, democratic backsliding, civic disengagement, unchecked AI, and compounding social crises." },
];

export default function Home() {
  const [data, setData] = useState<SeedData|null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedJourney, setSelectedJourney] = useState<string|null>(null);
  const [activeScenario, setActiveScenario] = useState<CivScenario>("aggressive");

  useEffect(() => { fetch("/data/civilization.json").then(r=>r.json()).then(setData).catch(console.error); }, []);

  const kpiChartData = useMemo(() => {
    if (!data) return [];
    const years = Array.from({length:10}, (_,i) => 2026+i);
    return years.map((yr,i) => {
      const row: any = { year: yr };
      for (const k of data.kpis) row[k.id] = k.trajectory[i];
      return row;
    });
  }, [data]);

  if (!data) return (<main className="min-h-screen flex items-center justify-center"><div className="text-center space-y-3"><div className="text-4xl animate-pulse">{"\u{1F30D}"}</div><p className="text-sm" style={{color:"var(--text-muted)"}}>Loading CivilizationOS&hellip;</p></div></main>);

  const TABS: {id:Tab;label:string;icon:string}[] = [
    {id:"overview",label:"Overview",icon:"\u{1F4CA}"},{id:"journeys",label:"Journey Map",icon:"\u{1F5FA}\uFE0F"},
    {id:"dividend",label:"Civic Dividend",icon:"\u{1F4B0}"},{id:"benefits",label:"Benefits & Support",icon:"\u{1F91D}"},
    {id:"kpis",label:"KPI Dashboard",icon:"\u{1F4C8}"},{id:"milestones",label:"Milestones",icon:"\u{1F3AF}"},
  ];

  const activeJourney = data.journeys.find(j=>j.id===selectedJourney);

  return (
    <main className="min-h-screen pb-20">
      <header className="pt-10 pb-8 px-4" style={{background:"linear-gradient(180deg,rgba(245,158,11,0.06) 0%,transparent 100%)"}}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.4em] mb-2" style={{color:"var(--amber)"}}>CivilizationOS</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Resident Experience Dashboard</h1>
          <p className="text-sm max-w-2xl" style={{color:"var(--text-muted)"}}>Explore civic journeys, dividend modeling, benefits, and 10-year KPI projections. The resident-facing layer of the AI Civilization framework.</p>
        </div>
      </header>
      <nav className="site-nav">
        <div className="header-links">
          <a href="/" className="header-link header-link--gray">Home</a>
          <a href="/climate" className="header-link header-link--teal">{"\u{1F331}"} ClimateOS</a>
          <a href="/simulation" className="header-link header-link--sky">{"\u{1F52C}"} Simulation</a>
          <a href="/transition" className="header-link header-link--sky">{"\u{1F6E0}\uFE0F"} TransitionOS</a>
          <a href="/civilization" className="header-link header-link--amber active">{"\u{1F30D}"} CivilizationOS</a>
          <a href="/governance" className="header-link header-link--violet">{"\u{1F3DB}\uFE0F"} GovernanceOS</a>
          <a href="/strategy" className="header-link header-link--amber">{"\u2699\uFE0F"} StrategyOS</a>
          <a href="/research" className="header-link header-link--violet">{"\u{1F4DC}"} Research</a>
          <a href="/blog" className="header-link header-link--gray">{"\u{1F4DD}"} Blog</a>
        </div>
      </nav>

      <nav className="sticky z-50 px-4 py-3" style={{top:"33px",background:"rgba(3,7,18,0.85)",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--card-border)"}}>
        <div className="flex gap-2 overflow-x-auto justify-center">
          {TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} className={`tab-btn whitespace-nowrap ${tab===t.id?"tab-btn-active":""}`}>{t.icon} {t.label}</button>))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8">

        {/* OVERVIEW */}
        {tab==="overview" && (() => {
          const s = CIV_SCENARIOS.find(sc => sc.id === activeScenario)!;
          const letterGrade = (sc: number) => sc >= 93 ? "A" : sc >= 85 ? "A-" : sc >= 80 ? "B+" : sc >= 73 ? "B" : sc >= 68 ? "B-" : sc >= 63 ? "C+" : sc >= 58 ? "C" : sc >= 53 ? "C-" : sc >= 48 ? "D+" : sc >= 43 ? "D" : sc >= 38 ? "D-" : "F";
          const gColor = (sc: number) => sc >= 73 ? "#10b981" : sc >= 53 ? "#f59e0b" : sc >= 38 ? "#fb923c" : "#f43f5e";
          const trendIcon = (t: string) => t === "improving" ? "\u2191" : t === "declining" ? "\u2193" : "\u2192";
          const trendClr = (t: string) => t === "improving" ? "#10b981" : t === "declining" ? "#f43f5e" : "#f59e0b";

          const domainScores: Record<string, { score: number; trend: string; note: string }[]> = {
            aggressive: [
              { score: 88, trend: "improving", note: "+1.2\u00b0C stabilized, 99% renewables, forests expanding" },
              { score: 85, trend: "improving", note: "100% AI audited, 95% participation, charter enforced" },
              { score: 82, trend: "improving", note: "Full reskilling + dividends, 2% poverty, full employment" },
              { score: 75, trend: "improving", note: "GINI declining, universal benefits, housing secured" },
              { score: 80, trend: "improving", note: "AI governed, open-weight, civic oversight strong" },
              { score: 78, trend: "improving", note: "Satisfaction 4.6/5, trust restored, services excellent" },
            ],
            moderate: [
              { score: 62, trend: "mixed", note: "+1.8\u00b0C, 88% renewables, biodiversity stabilizing" },
              { score: 65, trend: "improving", note: "80% AI audited, 76% participation, partial charter" },
              { score: 63, trend: "improving", note: "Reskilling working, 5% poverty, moderate placement" },
              { score: 55, trend: "stable", note: "GINI stable, partial benefits, some housing pressure" },
              { score: 62, trend: "mixed", note: "AI governance building, gaps in emerging tech" },
              { score: 58, trend: "stable", note: "Satisfaction 3.8/5, trust rebuilding slowly" },
            ],
            bau: [
              { score: 28, trend: "declining", note: "+3\u00b0C, 64% renewables, biodiversity halved" },
              { score: 30, trend: "declining", note: "40% AI audited, 42% participation, weak enforcement" },
              { score: 35, trend: "declining", note: "Automation outpacing reskilling, 12% poverty" },
              { score: 22, trend: "declining", note: "GINI rising, safety nets collapsing, housing crisis" },
              { score: 40, trend: "declining", note: "AI unchecked, proprietary, minimal oversight" },
              { score: 25, trend: "declining", note: "Satisfaction 2.3/5, trust eroded, services failing" },
            ],
            worst: [
              { score: 12, trend: "declining", note: "+4.6\u00b0C, 42% renewables, ecosystem collapse" },
              { score: 10, trend: "declining", note: "1% AI audited, 15% participation, no enforcement" },
              { score: 15, trend: "declining", note: "Mass unemployment, 30% poverty, no safety net" },
              { score: 8, trend: "declining", note: "Extreme inequality, no benefits, displacement crisis" },
              { score: 20, trend: "declining", note: "AI concentration, surveillance, no civic override" },
              { score: 10, trend: "declining", note: "Satisfaction 1.2/5, trust collapsed, services absent" },
            ],
          };
          const domainMeta = [
            { name: "Climate & Environment", icon: "\u{1F30D}", color: "#10b981", app: "ClimateOS", url: "/climate" },
            { name: "Governance & Institutions", icon: "\u{1F3DB}\uFE0F", color: "#8b5cf6", app: "GovernanceOS", url: "/governance" },
            { name: "Workforce & Economy", icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", app: "TransitionOS", url: "/transition" },
            { name: "Social Equity", icon: "\u{1F91D}", color: "#f59e0b", app: "CivilizationOS", url: "#" },
            { name: "Technology & AI", icon: "\u{1F916}", color: "#06b6d4", app: "Simulation", url: "/simulation" },
            { name: "Civic Wellbeing", icon: "\u{2764}\uFE0F", color: "#f43f5e", app: "CivilizationOS", url: "#" },
          ];
          const todayScores = [
            { score: 42, trend: "declining", note: "+1.3\u00b0C and rising, 30% renewables, biodiversity declining" },
            { score: 40, trend: "declining", note: "12% AI audited, 38% participation, charter incomplete" },
            { score: 43, trend: "declining", note: "Automation accelerating, reskilling underfunded, 8% poverty" },
            { score: 38, trend: "declining", note: "GINI rising, benefits fragmented, housing under pressure" },
            { score: 55, trend: "stable", note: "AI advancing rapidly, governance lagging behind deployment" },
            { score: 45, trend: "stable", note: "Satisfaction 3.1/5, trust eroding, services strained" },
          ];
          const todayOverall = Math.round(todayScores.reduce((a, c) => a + c.score, 0) / todayScores.length);
          const scores = domainScores[activeScenario];
          const overall = Math.round(scores.reduce((a, c) => a + c.score, 0) / scores.length);

          const civSummary: Record<string, string> = {
            aggressive: "Under Aggressive Action, civilization in 2035 is on a recovery trajectory across every domain. Climate is stabilizing at +1.2\u00b0C. Governance institutions are strong, with 100% AI audit coverage and 95% civic participation. The workforce transition is complete \u2014 dividends bridge income gaps, reskilling pathways are universal, and poverty approaches its floor. Social equity is improving as universal benefits and housing programs take effect. AI is governed through open-weight systems with civic oversight. Resident satisfaction reaches 4.6/5. This requires unprecedented coordination but is achievable with current technology and realistic funding.",
            moderate: "Moderate Reform delivers a functional but stressed civilization by 2035. Climate approaches +1.8\u00b0C \u2014 manageable but tight. Governance is partially deployed, with 80% AI audit coverage. The workforce transition is working but unevenly \u2014 reskilling helps most workers but income gaps persist for the most vulnerable. Social equity is stable but not improving. AI governance is building but gaps in emerging technology domains create risk. This is the \u201cgood enough\u201d scenario \u2014 it avoids catastrophe but doesn\u2019t build the resilience needed for the shocks still coming.",
            bau: "Business as Usual produces compounding crises by 2035. Climate at +3\u00b0C triggers cascading failures. Only 40% of AI systems are audited. Automation outpaces reskilling, pushing 12% into poverty. Social safety nets strain under the weight of displacement. AI concentration without oversight deepens inequality. Resident satisfaction drops to 2.3/5 as services deteriorate. Every metric is declining and accelerating \u2014 the cost of action in 2035 is orders of magnitude higher than it would have been in 2026.",
            worst: "The Worst Case is civilizational crisis across every domain. Climate at +4.6\u00b0C with ecosystem collapse. 1% AI audit coverage means technology operates without any democratic check. 30% poverty with no safety net. Extreme inequality with displacement-driven migration. Civic trust has collapsed, satisfaction at 1.2/5. Every system that holds society together \u2014 food, water, governance, economy, technology \u2014 is under existential stress simultaneously. This is what we risk if coordination fails.",
          };

          return (
          <section>
            <Heading icon={"\u{1F4CA}"} title="Dashboard Overview" sub="Civilization health index, scenario projections, and resident metrics" />

            {/* ── Today's Civilization Health Index ── */}
            <div className="glass-card p-6 mb-8" style={{ borderTop: `3px solid ${gColor(todayOverall)}` }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                <div className="relative w-28 h-28 flex-shrink-0 mx-auto sm:mx-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={gColor(todayOverall)} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${todayOverall * 2.64} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: gColor(todayOverall), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(todayOverall)}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{todayOverall}/100</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Today&apos;s Civilization Score</h3>
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                    Current state of civilization across 6 domains: climate, governance, economy, equity, technology, and civic wellbeing. Use the scenario selector below to see projected futures.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {domainMeta.map((d, i) => {
                  const ds = todayScores[i];
                  return (
                    <a key={d.name} href={d.url} target={d.url.startsWith("/") || d.url === "#" ? undefined : "_blank"} rel={d.url.startsWith("/") || d.url === "#" ? undefined : "noopener"} className="glass-card p-3 text-center transition-all hover:border-white/20 block">
                      <span className="text-lg">{d.icon}</span>
                      <p className="text-[10px] font-semibold mt-1" style={{ color: "var(--text)" }}>{d.name}</p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className="text-lg font-bold" style={{ color: gColor(ds.score), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(ds.score)}</span>
                        <span className="text-sm font-bold" style={{ color: trendClr(ds.trend) }}>{trendIcon(ds.trend)}</span>
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>{ds.score}/100</p>
                      <p className="text-[9px] mt-1 leading-tight" style={{ color: "var(--text-muted)" }}>{ds.note}</p>
                      {d.url !== "#" && <p className="text-[8px] mt-1" style={{ color: d.color }}>{d.app} &rarr;</p>}
                    </a>
                  );
                })}
              </div>
            </div>

            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Current State (today)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Stat label="Residents served" value={fmtK(data.dividendModel.populationServed)} color="var(--amber)" />
              <Stat label="Biweekly dividend" value={`$${data.dividendModel.biweeklyPerResident}`} sub="per resident" color="var(--emerald)" />
              <Stat label="Civic journeys" value={`${data.journeys.length}`} color="var(--sky)" />
              <Stat label="Benefits active" value={`${data.benefits.filter(b=>b.status==="active").length}`} sub={`of ${data.benefits.length} total`} color="var(--violet)" />
            </div>

            {/* Scenario selector */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a civilization scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to see how it changes every chart and projection below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CIV_SCENARIOS.map(sc => (
                  <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sc.icon}</span><span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.name}</span></div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>{sc.desc}</p>
                    {activeScenario === sc.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>10-Year KPI Trajectories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.kpis.map(k => (
                  <div key={k.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{k.label}</p>
                      <span className="inline-block h-2 w-2 rounded-full" style={{backgroundColor:k.color}} />
                    </div>
                    <div className="flex items-end gap-3 mb-2">
                      <p className="text-2xl font-bold" style={{color:k.color,fontFamily:"'Space Grotesk',sans-serif"}}>{k.current}{k.unit}</p>
                      <p className="text-[10px] mb-1" style={{color:"var(--text-faint)"}}>Target: {k.target}{k.unit}</p>
                    </div>
                    <div className="h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={k.trajectory.map((v,i)=>({year:2026+i,value:v}))} margin={{top:2,right:2,bottom:0,left:-20}}>
                          <defs><linearGradient id={`og-${k.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity={0.3}/><stop offset="100%" stopColor={k.color} stopOpacity={0}/></linearGradient></defs>
                          <Area type="monotone" dataKey="value" stroke={k.color} fill={`url(#og-${k.id})`} strokeWidth={2} dot={false} />
                          <XAxis dataKey="year" tick={{fill:"#64748b",fontSize:8}} axisLine={false} tickLine={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-3" style={{color:"var(--text)"}}>Funding Pool Breakdown</h3>
              <p className="text-xs mb-4" style={{color:"var(--text-faint)"}}>Total pool: ${fmtK(data.dividendModel.poolSize_m * 1_000_000)}/year</p>
              <div className="space-y-3">
                {data.dividendModel.fundingSources.map(fs => (
                  <div key={fs.source} className="flex items-center gap-4">
                    <div className="w-20 text-right text-xs font-bold" style={{color:"var(--amber)"}}>{fs.pctOfPool}%</div>
                    <div className="flex-1"><div className="h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}><div className="h-full rounded-full" style={{width:`${fs.pctOfPool}%`,background:"var(--amber)",opacity:0.7}} /></div></div>
                    <div className="flex-1"><p className="text-xs font-semibold" style={{color:"var(--text)"}}>{fs.source}</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>${fmtK(fs.annual_m * 1_000_000)}/yr</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${s.color}` }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                <span className="text-lg">{s.icon}</span> Civilization in 2035: {s.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{civSummary[activeScenario]}</p>
            </div>
          </section>
          );
        })()}

        {/* JOURNEYS */}
        {tab==="journeys" && (<section>
          <Heading icon={"\u{1F5FA}\uFE0F"} title="Resident Journey Map" sub="Five core civic journeys from onboarding to graduation" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.journeys.map(j => (
              <button key={j.id} onClick={()=>setSelectedJourney(j.id===selectedJourney?null:j.id)} className={`glass-card p-5 text-left w-full transition-all ${selectedJourney===j.id?"ring-2 ring-amber-400/50 border-amber-400/30":""} hover:border-white/20`}>
                <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{j.icon}</span><h4 className="text-sm font-semibold" style={{color:"var(--text)"}}>{j.title}</h4></div>
                <p className="text-xs mb-3" style={{color:"var(--text-muted)"}}>{j.desc}</p>
                <div className="flex gap-4 text-[10px]">
                  <span style={{color:"var(--emerald)"}}>{(j.completionRate*100).toFixed(0)}% completion</span>
                  <span style={{color:"var(--amber)"}}>{j.avgDays} days avg</span>
                  <span style={{color:"var(--sky)"}}>{j.satisfactionScore}/5 sat.</span>
                </div>
              </button>
            ))}
          </div>
          {activeJourney && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4"><span className="text-3xl">{activeJourney.icon}</span><div><h3 className="text-lg font-semibold" style={{color:"var(--text)"}}>{activeJourney.title} Journey</h3><p className="text-xs" style={{color:"var(--text-muted)"}}>{activeJourney.desc}</p></div></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"var(--amber)"}}>Steps</p>
                  <div className="space-y-2">
                    {activeJourney.steps.map((s,i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{background:"rgba(245,158,11,0.15)",color:"var(--amber)"}}>{i+1}</span>
                        <p className="text-xs leading-relaxed" style={{color:"var(--text-muted)"}}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"var(--sky)"}}>Touchpoints</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {activeJourney.touchpoints.map(tp => (<span key={tp} className="text-[10px] px-3 py-1 rounded-full" style={{background:"rgba(14,165,233,0.12)",color:"var(--sky)"}}>{tp}</span>))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{color:"var(--emerald)"}}>{(activeJourney.completionRate*100).toFixed(0)}%</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Completion</p></div>
                    <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{color:"var(--amber)"}}>{activeJourney.avgDays}d</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Avg duration</p></div>
                    <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{color:"var(--sky)"}}>{activeJourney.satisfactionScore}</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Satisfaction</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!activeJourney && <div className="glass-card p-8 text-center"><p className="text-3xl mb-3">{"\u{1F5FA}\uFE0F"}</p><p className="text-sm" style={{color:"var(--text-muted)"}}>Select a journey above to explore its steps and touchpoints.</p></div>}
        </section>)}

        {/* CIVIC DIVIDEND */}
        {tab==="dividend" && (<section>
          <Heading icon={"\u{1F4B0}"} title="Civic Dividend Model" sub="Locally controlled dividend funded by AI compute rents, green tariffs, and data commons licensing. Modeled after Alaska's Permanent Fund." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Stat label="Pool size" value={`$${(data.dividendModel.poolSize_m/1000).toFixed(1)}B/yr`} color="var(--amber)" />
            <Stat label="Per resident" value={`$${data.dividendModel.annualPerResident}/yr`} sub={`$${data.dividendModel.biweeklyPerResident} biweekly`} color="var(--emerald)" />
            <Stat label="Escrow reserve" value={`${data.dividendModel.escrowMonths} months`} sub="stability buffer" color="var(--sky)" />
            <Stat label="Poverty target" value={`<${data.dividendModel.povertyReduction.target}%`} sub={`from ${data.dividendModel.povertyReduction.baseline}%`} color="var(--rose)" />
          </div>
          <div className="glass-card p-6 mb-6" style={{borderLeft:"3px solid var(--emerald)"}}>
            <p className="text-xs" style={{color:"var(--text-muted)"}}><strong style={{color:"var(--emerald)"}}>How it works:</strong> 1&ndash;6.5% of regional GDP flows into the dividend pool. Every enrolled resident receives biweekly payments via digital wallet (ACH fallback). Escrow covers 24 months of payouts as a stability reserve.</p>
          </div>
          <div className="glass-card p-6 mb-6">
            <h3 className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Funding Sources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.dividendModel.fundingSources.map(s => (
                <div key={s.source} className="glass-card p-4" style={{borderTop:`3px solid var(--amber)`}}>
                  <p className="text-lg font-bold" style={{color:"var(--amber)",fontFamily:"'Space Grotesk',sans-serif"}}>{s.pctOfPool}%</p>
                  <p className="text-sm font-semibold mt-1" style={{color:"var(--text)"}}>{s.source}</p>
                  <p className="text-xs mt-1" style={{color:"var(--text-muted)"}}>{s.desc}</p>
                  <p className="text-xs mt-2 font-mono" style={{color:"var(--text-faint)"}}>${fmtK(s.annual_m * 1_000_000)}/year</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-1" style={{color:"var(--text)"}}>Poverty Reduction Trajectory</h3>
            <p className="text-xs mb-4" style={{color:"var(--text-faint)"}}>10-year projection from {data.dividendModel.povertyReduction.baseline}% to &lt;{data.dividendModel.povertyReduction.target}%</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.kpis.find(k=>k.id==="poverty")?.trajectory.map((v,i)=>({year:2026+i,rate:v})) ?? []}>
                <defs><linearGradient id="pov-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{fill:"#94a3b8",fontSize:11}} /><YAxis domain={[0,15]} tick={{fill:"#94a3b8",fontSize:11}} />
                <Tooltip contentStyle={{background:"rgba(15,23,42,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#e2e8f0",fontSize:"11px"}} />
                <Area type="monotone" dataKey="rate" stroke="#f43f5e" fill="url(#pov-g)" strokeWidth={2} name="Poverty rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>)}

        {/* BENEFITS */}
        {tab==="benefits" && (<section>
          <Heading icon={"\u{1F91D}"} title="Benefits & Support Services" sub="Comprehensive resident support: dividends, healthcare, housing, childcare, transit, digital access, legal aid, and credentials" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {data.benefits.map(b => (
              <div key={b.id} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{b.icon}</span><div><h4 className="text-sm font-semibold" style={{color:"var(--text)"}}>{b.title}</h4><span className={`text-[10px] px-2 py-0.5 rounded-full ${b.status==="active"?"bg-emerald-500/15 text-emerald-400 border border-emerald-500/30":"bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>{b.status}</span></div></div>
                <p className="text-xs mb-3" style={{color:"var(--text-muted)"}}>{b.desc}</p>
                <div className="flex items-center justify-between text-xs"><span className="font-semibold" style={{color:"var(--emerald)"}}>{b.amount}</span><span style={{color:"var(--text-faint)"}}>{fmtK(b.recipients)} recipients</span></div>
              </div>
            ))}
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Service Provider Network</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.serviceProviders.map(sp => (
                <div key={sp.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{color:"var(--sky)"}}>{sp.type}</p>
                  <p className="text-sm font-semibold" style={{color:"var(--text)"}}>{sp.name}</p>
                  <p className="text-xs mt-1" style={{color:"var(--text-muted)"}}>{sp.coverage}</p>
                  <p className="text-xs mt-1" style={{color:"var(--text-faint)"}}>Capacity: {fmtK(sp.capacity)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>)}

        {/* KPIs */}
        {tab==="kpis" && (<section>
          <Heading icon={"\u{1F4C8}"} title="KPI Dashboard" sub="Five key indicators from 2026 baseline to 2035 target" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {data.kpis.map(k => {
              const progress = k.better==="lower" ? (k.baseline-k.current)/(k.baseline-k.target)*100 : (k.current-k.baseline)/(k.target-k.baseline)*100;
              return (
                <div key={k.id} className="glass-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"var(--text-muted)"}}>{k.label}</p>
                  <div className="flex items-end justify-between mb-2">
                    <p className="text-3xl font-bold" style={{color:k.color,fontFamily:"'Space Grotesk',sans-serif"}}>{k.current}{k.unit}</p>
                    <div className="text-right"><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Base: {k.baseline}{k.unit}</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Target: {k.target}{k.unit}</p></div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}><div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,Math.max(0,progress))}%`,background:k.color,opacity:0.7}} /></div>
                  <p className="text-[10px] mt-1 text-right" style={{color:"var(--text-faint)"}}>{Math.round(progress)}% to target</p>
                  <div className="mt-3 h-24"><ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={k.trajectory.map((v,i)=>({year:2026+i,value:v}))} margin={{top:2,right:2,bottom:0,left:-20}}>
                      <defs><linearGradient id={`kpi-${k.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity={0.3}/><stop offset="100%" stopColor={k.color} stopOpacity={0}/></linearGradient></defs>
                      <Area type="monotone" dataKey="value" stroke={k.color} fill={`url(#kpi-${k.id})`} strokeWidth={2} dot={false} />
                      <XAxis dataKey="year" tick={{fill:"#64748b",fontSize:8}} axisLine={false} tickLine={false} />
                    </AreaChart>
                  </ResponsiveContainer></div>
                </div>
              );
            })}
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-1" style={{color:"var(--text)"}}>Combined Trajectory</h3>
            <p className="text-xs mb-4" style={{color:"var(--text-faint)"}}>All five KPIs normalized to show directional progress</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={kpiChartData}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{fill:"#94a3b8",fontSize:11}} /><YAxis tick={{fill:"#94a3b8",fontSize:11}} />
                <Tooltip contentStyle={{background:"rgba(15,23,42,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#e2e8f0",fontSize:"11px"}} />
                {data.kpis.map(k => (<Area key={k.id} type="monotone" dataKey={k.id} stroke={k.color} fill="none" strokeWidth={2} name={k.label} />))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>)}

        {/* MILESTONES */}
        {tab==="milestones" && (<section>
          <Heading icon={"\u{1F3AF}"} title="10-Year Milestones" sub="From discovery sprint to global export (2026\u20132035)" />
          <div className="space-y-4">
            {data.milestones.map((m,i) => {
              const colors = ["var(--sky)","var(--emerald)","var(--violet)","var(--amber)","var(--rose)","var(--emerald)"];
              const c = colors[i % colors.length];
              return (
                <div key={i} className="glass-card p-5 flex gap-4" style={{borderLeft:`3px solid ${c}`}}>
                  <div className="flex-shrink-0 w-16 text-center"><p className="text-lg font-bold" style={{color:c,fontFamily:"'Space Grotesk',sans-serif"}}>{m.year}</p></div>
                  <div className="flex-1"><h4 className="text-sm font-semibold mb-2" style={{color:"var(--text)"}}>{m.title}</h4><ul className="space-y-1">{m.items.map((item,j)=>(<li key={j} className="text-xs flex items-start gap-2" style={{color:"var(--text-muted)"}}><span style={{color:c}}>{"\u2022"}</span>{item}</li>))}</ul></div>
                </div>
              );
            })}
          </div>
          <div className="glass-card p-6 mt-8" style={{borderLeft:"3px solid var(--emerald)"}}>
            <p className="text-xs" style={{color:"var(--text-muted)"}}><strong style={{color:"var(--emerald)"}}>Success criteria:</strong> Poverty &lt;5%, reskill &lt;6 months, 100% high-risk AI audited, 75% corridors monitored, export packages adopted by 12+ cities/countries.</p>
          </div>
        </section>)}
      </div>

      <footer className="mt-20 py-8 text-center text-xs" style={{color:"var(--text-faint)",borderTop:"1px solid var(--card-border)"}}>
        <p>CivilizationOS &middot; Clawcode Research &middot; 2026</p>
        <p className="mt-1">
          <a href="/blog" className="underline" style={{color:"var(--text-muted)"}}>Blog</a>{" \u00B7 "}
          <a href="https://github.com/reillyclawcode/CivilizationOS" target="_blank" rel="noopener" className="underline" style={{color:"var(--text-muted)"}}>GitHub</a>{" \u00B7 "}
          <a href="/simulation" className="underline" style={{color:"var(--text-muted)"}}>Simulation</a>{" \u00B7 "}
          <a href="/transition" className="underline" style={{color:"var(--text-muted)"}}>TransitionOS</a>{" \u00B7 "}
          <a href="/governance" className="underline" style={{color:"var(--text-muted)"}}>GovernanceOS</a>{" \u00B7 "}
          <a href="/climate" className="underline" style={{color:"var(--text-muted)"}}>ClimateOS</a>{" \u00B7 "}
          <a href="/strategy" className="underline" style={{color:"var(--text-muted)"}}>StrategyOS</a>
        </p>
      </footer>
    </main>
  );
}
