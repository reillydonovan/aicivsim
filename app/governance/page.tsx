"use client";
import { useEffect, useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

/* Types */
interface Pillar { id:string; title:string; icon:string; color:string; desc:string; principles:string[] }
interface Charter { title:string; purpose:string; pillars:Pillar[]; enforcement:string }
interface Demographics { age18_34:number; age35_54:number; age55plus:number; female:number; male:number; nonbinary:number }
interface Assembly { id:string; name:string; domain:string; members:number; demographics:Demographics; meetingsHeld:number; decisionsIssued:number; bindingRate:number; avgTurnout:number; stipendPerSession:number; nextSession:string }
interface ModuleMetrics { [key:string]: any }
interface GovModule { id:string; title:string; status:string; version:string; desc:string; features:string[]; techStack:string; metrics:ModuleMetrics }
interface AuditYear { year:number; audited:number; total:number; incidents:number; resolved:number }
interface DemographicEquity { [key:string]: number }
interface Participation { totalResidents:number; registered:number; activeVoters:number; assemblyParticipants:number; avgTurnoutRate:number; quadraticVotesLastQuarter:number; demographicEquity:DemographicEquity; satisfactionIndex:number; accessibilityScore:number }
interface FundingItem { label:string; value:string; sub:string; color:string }
interface SeedData { charter:Charter; assemblies:Assembly[]; modules:GovModule[]; auditTimeline:AuditYear[]; participation:Participation; fundingStack:FundingItem[] }

type Tab = "overview" | "charter" | "assemblies" | "modules" | "audits" | "participation";

const fmtK = (n:number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : n.toString();
const pct = (n:number) => `${(n*100).toFixed(0)}%`;

function Heading({ icon, title, sub }: { icon:string; title:string; sub?:string }) {
  return (<div className="mb-6"><h2 className="text-xl font-semibold flex items-center gap-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}><span className="text-2xl">{icon}</span> {title}</h2>{sub && <p className="text-sm mt-1" style={{color:"var(--text-muted)"}}>{sub}</p>}</div>);
}
function Stat({ label, value, sub, color }: { label:string; value:string; sub?:string; color?:string }) {
  return (<div className="glass-card p-4"><p className="text-xs uppercase tracking-wider mb-1" style={{color:"var(--text-faint)"}}>{label}</p><p className="text-2xl font-bold" style={{color:color||"var(--violet)",fontFamily:"'Space Grotesk',sans-serif"}}>{value}</p>{sub && <p className="text-xs mt-1" style={{color:"var(--text-muted)"}}>{sub}</p>}</div>);
}

type GovScenario = "full_framework" | "moderate_reform" | "minimal_tech" | "regression";
const GOV_SCENARIOS: { id: GovScenario; name: string; icon: string; color: string; desc: string }[] = [
  { id: "full_framework", name: "Full Citizen Governance", icon: "\u{1F3DB}\uFE0F", color: "#10b981", desc: "Full deployment of charter, assemblies, modules, and AI audit. Maximum civic participation." },
  { id: "moderate_reform", name: "Moderate Reform", icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", desc: "Partial framework adoption. Assemblies in some districts, selective module deployment." },
  { id: "minimal_tech", name: "Minimal Tech-Only", icon: "\u{1F4BB}", color: "#f59e0b", desc: "Technology deployed without civic infrastructure. Digital governance without human oversight." },
  { id: "regression", name: "Institutional Regression", icon: "\u{1F6A8}", color: "#f43f5e", desc: "Democratic backsliding. Reduced transparency, weakened oversight, declining participation." },
];

export default function Home() {
  const [data, setData] = useState<SeedData|null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedAssembly, setSelectedAssembly] = useState<string|null>(null);
  const [selectedModule, setSelectedModule] = useState<string|null>(null);
  const [activeScenario, setActiveScenario] = useState<GovScenario>("full_framework");

  useEffect(() => { fetch("/data/governance.json").then(r=>r.json()).then(setData).catch(console.error); }, []);

  if (!data) return (<main className="min-h-screen flex items-center justify-center"><div className="text-center space-y-3"><div className="text-4xl animate-pulse">{"\u{1F3DB}\uFE0F"}</div><p className="text-sm" style={{color:"var(--text-muted)"}}>Loading GovernanceOS&hellip;</p></div></main>);

  const TABS: {id:Tab;label:string;icon:string}[] = [
    {id:"overview",label:"Overview",icon:"\u{1F4CA}"},{id:"charter",label:"Charter",icon:"\u{1F4DC}"},
    {id:"assemblies",label:"Assemblies",icon:"\u{1F5F3}\uFE0F"},{id:"modules",label:"Modules",icon:"\u{1F9E9}"},
    {id:"audits",label:"Audit Tracker",icon:"\u{1F50D}"},{id:"participation",label:"Participation",icon:"\u{1F465}"},
  ];

  const activeAssembly = data.assemblies.find(a=>a.id===selectedAssembly);
  const activeModule = data.modules.find(m=>m.id===selectedModule);
  const totalDecisions = data.assemblies.reduce((s,a)=>s+a.decisionsIssued,0);
  const avgBinding = data.assemblies.reduce((s,a)=>s+a.bindingRate,0)/data.assemblies.length;
  const latestAudit = data.auditTimeline[data.auditTimeline.length-1];

  return (
    <main className="min-h-screen pb-20">
      <header className="pt-10 pb-8 px-4" style={{background:"linear-gradient(180deg,rgba(139,92,246,0.06) 0%,transparent 100%)"}}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.4em] mb-2" style={{color:"var(--violet)"}}>GovernanceOS</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Civic Governance Dashboard</h1>
          <p className="text-sm max-w-2xl" style={{color:"var(--text-muted)"}}>Charter frameworks, citizen assemblies, governance modules, audit tracking, and participatory tools. The institutional backbone of the AI Civilization framework.</p>
        </div>
      </header>
      <nav className="site-nav">
        <div className="header-links">
          <a href="/" className="header-link header-link--gray">Home</a>
          <a href="/climate" className="header-link header-link--teal">{"\u{1F331}"} ClimateOS</a>
          <a href="/simulation" className="header-link header-link--sky">{"\u{1F52C}"} Simulation</a>
          <a href="/transition" className="header-link header-link--sky">{"\u{1F6E0}\uFE0F"} TransitionOS</a>
          <a href="/civilization" className="header-link header-link--amber">{"\u{1F30D}"} CivilizationOS</a>
          <a href="/governance" className="header-link header-link--violet active">{"\u{1F3DB}\uFE0F"} GovernanceOS</a>
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
          const s = GOV_SCENARIOS.find(sc => sc.id === activeScenario)!;

          const govScores = [
            { domain: "Democratic Health", score: 45, trend: "declining" as const, icon: "\u{1F5F3}\uFE0F", color: "#8b5cf6", note: "72 countries backsliding, civic trust fragile" },
            { domain: "AI Oversight", score: 28, trend: "improving" as const, icon: "\u{1F916}", color: "#06b6d4", note: `${latestAudit?.audited ?? 10}% high-risk AI audited` },
            { domain: "Participation", score: 52, trend: "stable" as const, icon: "\u{1F465}", color: "#f59e0b", note: `${fmtK(data.participation.registered)} registered of ${fmtK(data.participation.totalResidents)}` },
            { domain: "Accountability", score: 35, trend: "declining" as const, icon: "\u{1F50D}", color: "#f43f5e", note: "Weak enforcement, limited transparency" },
          ];
          const overallScore = Math.round(govScores.reduce((a, c) => a + c.score, 0) / govScores.length);
          const letterGrade = (sc: number) => sc >= 93 ? "A" : sc >= 85 ? "A-" : sc >= 80 ? "B+" : sc >= 73 ? "B" : sc >= 68 ? "B-" : sc >= 63 ? "C+" : sc >= 58 ? "C" : sc >= 53 ? "C-" : sc >= 48 ? "D+" : sc >= 43 ? "D" : sc >= 38 ? "D-" : "F";
          const gColor = (sc: number) => sc >= 73 ? "#10b981" : sc >= 53 ? "#f59e0b" : sc >= 38 ? "#fb923c" : "#f43f5e";
          const trendArrow = (t: string) => t === "improving" ? "\u2191" : t === "stable" ? "\u2192" : "\u2193";
          const trendClr = (t: string) => t === "improving" ? "#10b981" : t === "stable" ? "#f59e0b" : "#f43f5e";

          const auditProjection: Record<string, number[]> = {
            full_framework: [10, 22, 38, 55, 70, 82, 90, 95, 98, 100],
            moderate_reform: [10, 16, 24, 33, 42, 52, 60, 68, 75, 80],
            minimal_tech: [10, 14, 18, 22, 26, 30, 33, 36, 38, 40],
            regression: [10, 8, 7, 5, 4, 3, 3, 2, 2, 1],
          };
          const auditData = Array.from({length:10}, (_,i) => ({
            year: 2026 + i,
            full_framework: auditProjection.full_framework[i],
            moderate_reform: auditProjection.moderate_reform[i],
            minimal_tech: auditProjection.minimal_tech[i],
            regression: auditProjection.regression[i],
          }));

          const auditDesc: Record<string, string> = {
            full_framework: "Full Citizen Governance achieves 100% AI audit coverage by 2035. Participatory safety reviews, citizen juries, and automated monitoring cover every high-risk AI system. Incidents are caught early, resolved transparently, and feed back into improved charter principles. This creates the trust foundation that makes AI deployment sustainable and publicly supported.",
            moderate_reform: "Moderate Reform reaches 80% coverage by 2035. Core AI systems are audited, but edge cases and emerging applications lag behind. The framework works where deployed but gaps create vulnerabilities. Resource constraints in smaller municipalities mean uneven protection, requiring continuous catch-up investment.",
            minimal_tech: "Tech-Only reaches just 40% coverage by 2035. Automated monitoring tools are deployed but without civic oversight, accountability is algorithmic \u2014 not democratic. Incidents are detected but resolution lacks public legitimacy. The gap between AI capability and human governance widens into a trust deficit.",
            regression: "Under Institutional Regression, audit coverage collapses to 1% by 2035. Oversight bodies are defunded, transparency requirements weakened, and AI deployment proceeds without democratic check. Incidents accumulate without resolution. Public trust in AI \u2014 and in governance itself \u2014 erodes to crisis levels.",
          };

          const participationProjection: Record<string, number[]> = {
            full_framework: [62, 68, 74, 79, 83, 86, 89, 91, 93, 95],
            moderate_reform: [62, 64, 66, 68, 70, 72, 73, 74, 75, 76],
            minimal_tech: [62, 60, 58, 55, 53, 50, 48, 46, 44, 42],
            regression: [62, 55, 48, 42, 36, 30, 25, 22, 18, 15],
          };
          const participationData = Array.from({length:10}, (_,i) => ({
            year: 2026 + i,
            full_framework: participationProjection.full_framework[i],
            moderate_reform: participationProjection.moderate_reform[i],
            minimal_tech: participationProjection.minimal_tech[i],
            regression: participationProjection.regression[i],
          }));

          const partDesc: Record<string, string> = {
            full_framework: "Participation reaches 95% of eligible residents by 2035. Stipends, childcare, transit, language access, and digital tools remove every barrier. Quadratic voting ensures minority voices are amplified. Assemblies become the primary locus of democratic legitimacy, outperforming traditional elections on representativeness and informed decision-making.",
            moderate_reform: "Participation grows modestly to 76% by 2035. Key barriers are addressed but not all \u2014 schedule conflicts and digital literacy gaps persist. Assemblies operate in major districts but smaller communities rely on traditional town halls. Improvement is real but uneven.",
            minimal_tech: "Participation declines to 42% by 2035. Digital-only tools exclude those without access or skills. Without stipends and physical accommodations, only the already-engaged participate. A technocratic veneer masks democratic hollowing. Decisions are made by a self-selecting minority.",
            regression: "Participation collapses to 15% by 2035. Assemblies are defunded, voting rights restricted, and civic infrastructure dismantled. Government operates through executive decree, not democratic deliberation. The civic muscle atrophies and rebuilding becomes a generational challenge.",
          };

          const govSummary: Record<string, string> = {
            full_framework: "Full Citizen Governance by 2035 creates the institutional backbone for a functional democracy in the age of AI. Every high-risk AI system is audited with citizen involvement. 95% of residents participate meaningfully in governance. Charter principles are enforced through binding assemblies. Modules provide composable, adoptable governance infrastructure that other cities can replicate. This is democracy upgraded \u2014 not replaced \u2014 by technology.",
            moderate_reform: "Moderate Reform produces a functional but incomplete governance framework. 80% AI audit coverage and 76% participation are significant achievements, but gaps remain in smaller communities and emerging technology domains. The system works where deployed but hasn\u2019t achieved the scale needed for comprehensive protection. Continued investment and expansion are essential.",
            minimal_tech: "The Tech-Only approach demonstrates that technology without democratic infrastructure creates a governance deficit. 40% audit coverage means most AI systems operate unchecked. 42% participation means decisions are made by a minority. The tools exist but the civic commitment doesn\u2019t. This is the uncanny valley of governance: it looks modern but lacks legitimacy.",
            regression: "Institutional Regression by 2035 is a governance crisis. 1% audit coverage means AI operates without oversight. 15% participation means democracy exists only on paper. Trust has collapsed. The cost of rebuilding exceeds the cost of prevention by orders of magnitude. This scenario demonstrates why governance is not optional infrastructure \u2014 it is the foundation everything else depends on.",
          };

          return (
          <section>
            <Heading icon={"\u{1F4CA}"} title="Governance Overview" sub="Institutional health, scenario projections, and key governance metrics" />

            {/* Governance Score */}
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
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Today&apos;s Governance Score</h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Democratic health, AI oversight, civic participation, and institutional accountability. Scored against what 21st-century governance requires.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {govScores.map(gs => (
                  <div key={gs.domain} className="glass-card p-3 text-center">
                    <span className="text-lg">{gs.icon}</span>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: "var(--text)" }}>{gs.domain}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-lg font-bold" style={{ color: gColor(gs.score), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(gs.score)}</span>
                      <span className="text-sm font-bold" style={{ color: trendClr(gs.trend) }}>{trendArrow(gs.trend)}</span>
                    </div>
                    <p className="text-[9px] mt-1 leading-tight" style={{ color: "var(--text-muted)" }}>{gs.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Stat label="Assemblies active" value={`${data.assemblies.length}`} color="var(--violet)" />
              <Stat label="Decisions issued" value={`${totalDecisions}`} sub={`${pct(avgBinding)} binding`} color="var(--emerald)" />
              <Stat label="Modules deployed" value={`${data.modules.filter(m=>m.status==="GA").length}`} sub={`of ${data.modules.length} total`} color="var(--sky)" />
              <Stat label="Registered voters" value={fmtK(data.participation.registered)} sub={`of ${fmtK(data.participation.totalResidents)}`} color="var(--amber)" />
            </div>

            {/* Scenario selector */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a governance scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to see how it changes every chart and projection below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {GOV_SCENARIOS.map(sc => (
                  <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sc.icon}</span><span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.name}</span></div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>{sc.desc}</p>
                    {activeScenario === sc.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Audit Coverage — scenario-aware */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-sm font-semibold mb-1" style={{color:"var(--text)"}}>AI Audit Coverage (10-Year Projection)</h3>
              <p className="text-xs mb-4" style={{color:"var(--text-faint)"}}>% of high-risk AI systems with participatory safety reviews &mdash; highlighting <strong style={{ color: s.color }}>{s.name}</strong></p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={auditData}>
                  <defs>{GOV_SCENARIOS.map(sc => (<linearGradient key={sc.id} id={`ag-${sc.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sc.color} stopOpacity={activeScenario === sc.id ? 0.3 : 0.08}/><stop offset="100%" stopColor={sc.color} stopOpacity={0}/></linearGradient>))}</defs>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{fill:"#94a3b8",fontSize:11}} /><YAxis domain={[0,100]} tick={{fill:"#94a3b8",fontSize:11}} />
                  <Tooltip contentStyle={{background:"rgba(15,23,42,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#e2e8f0",fontSize:"11px"}} />
                  {GOV_SCENARIOS.map(sc => (<Area key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} fill={`url(#ag-${sc.id})`} strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.35} name={sc.name} />))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{color:"var(--text-muted)"}}>{auditDesc[activeScenario]}</p>
            </div>

            {/* Civic Participation — scenario-aware */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-sm font-semibold mb-1" style={{color:"var(--text)"}}>Civic Participation Rate (10-Year Projection)</h3>
              <p className="text-xs mb-4" style={{color:"var(--text-faint)"}}>% of eligible residents meaningfully participating in governance</p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={participationData}>
                  <defs>{GOV_SCENARIOS.map(sc => (<linearGradient key={sc.id} id={`pg-${sc.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sc.color} stopOpacity={activeScenario === sc.id ? 0.3 : 0.08}/><stop offset="100%" stopColor={sc.color} stopOpacity={0}/></linearGradient>))}</defs>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{fill:"#94a3b8",fontSize:11}} /><YAxis domain={[0,100]} tick={{fill:"#94a3b8",fontSize:11}} />
                  <Tooltip contentStyle={{background:"rgba(15,23,42,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#e2e8f0",fontSize:"11px"}} />
                  {GOV_SCENARIOS.map(sc => (<Area key={sc.id} type="monotone" dataKey={sc.id} stroke={sc.color} fill={`url(#pg-${sc.id})`} strokeWidth={activeScenario === sc.id ? 3 : 1.5} strokeOpacity={activeScenario === sc.id ? 1 : 0.35} name={sc.name} />))}
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs leading-relaxed mt-4" style={{color:"var(--text-muted)"}}>{partDesc[activeScenario]}</p>
            </div>

            {/* Charter Pillars */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Charter Pillars</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.charter.pillars.map(p => (
                  <div key={p.id} className="glass-card p-4" style={{borderLeft:`3px solid ${p.color}`}}>
                    <div className="flex items-center gap-2 mb-2"><span className="text-xl">{p.icon}</span><p className="text-sm font-semibold" style={{color:p.color}}>{p.title}</p></div>
                    <p className="text-xs" style={{color:"var(--text-muted)"}}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding Stack */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Funding Stack</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.fundingStack.map(f => (
                  <div key={f.label} className="glass-card p-4">
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{color:"var(--text-faint)"}}>{f.label}</p>
                    <p className="text-lg font-bold" style={{color:f.color,fontFamily:"'Space Grotesk',sans-serif"}}>{f.value}</p>
                    <p className="text-xs" style={{color:"var(--text-muted)"}}>{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${s.color}` }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                <span className="text-lg">{s.icon}</span> Governance in 2035: {s.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{govSummary[activeScenario]}</p>
            </div>
          </section>
          );
        })()}

        {/* CHARTER */}
        {tab==="charter" && (<section>
          <Heading icon={"\u{1F4DC}"} title={data.charter.title} sub={data.charter.purpose} />
          <div className="space-y-6 mb-8">
            {data.charter.pillars.map(p => (
              <div key={p.id} className="glass-card p-6" style={{borderLeft:`3px solid ${p.color}`}}>
                <div className="flex items-center gap-3 mb-4"><span className="text-3xl">{p.icon}</span><div><h3 className="text-lg font-semibold" style={{color:p.color}}>{p.title}</h3><p className="text-xs" style={{color:"var(--text-muted)"}}>{p.desc}</p></div></div>
                <div className="space-y-2">
                  {p.principles.map((pr,i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{background:`${p.color}22`,color:p.color}}>{i+1}</span>
                      <p className="text-xs leading-relaxed" style={{color:"var(--text-muted)"}}>{pr}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="glass-card p-6" style={{borderLeft:"3px solid var(--emerald)"}}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"var(--emerald)"}}>Enforcement</p>
            <p className="text-sm leading-relaxed" style={{color:"var(--text-muted)"}}>{data.charter.enforcement}</p>
          </div>
        </section>)}

        {/* ASSEMBLIES */}
        {tab==="assemblies" && (<section>
          <Heading icon={"\u{1F5F3}\uFE0F"} title="Citizen Assemblies" sub="Randomly stratified assemblies mirroring local demographics. Stipends, childcare, transit passes, and language access remove participation barriers." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.assemblies.map(a => (
              <button key={a.id} onClick={()=>setSelectedAssembly(a.id===selectedAssembly?null:a.id)} className={`glass-card p-5 text-left w-full transition-all ${selectedAssembly===a.id?"ring-2 ring-violet-400/50 border-violet-400/30":""} hover:border-white/20`}>
                <h4 className="text-sm font-semibold mb-1" style={{color:"var(--text)"}}>{a.name}</h4>
                <p className="text-xs mb-3" style={{color:"var(--text-muted)"}}>{a.domain} &middot; {a.members} members</p>
                <div className="flex gap-3 text-[10px]">
                  <span style={{color:"var(--emerald)"}}>{a.decisionsIssued} decisions</span>
                  <span style={{color:"var(--violet)"}}>{pct(a.bindingRate)} binding</span>
                  <span style={{color:"var(--sky)"}}>{pct(a.avgTurnout)} turnout</span>
                </div>
              </button>
            ))}
          </div>
          {activeAssembly && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-1" style={{color:"var(--text)"}}>{activeAssembly.name}</h3>
              <p className="text-xs mb-4" style={{color:"var(--text-muted)"}}>{activeAssembly.domain} &middot; Next session: {activeAssembly.nextSession}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{color:"var(--violet)"}}>{activeAssembly.members}</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Members</p></div>
                <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{color:"var(--emerald)"}}>{activeAssembly.decisionsIssued}</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Decisions</p></div>
                <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{color:"var(--sky)"}}>{pct(activeAssembly.avgTurnout)}</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Turnout</p></div>
                <div className="glass-card p-3 text-center"><p className="text-lg font-bold" style={{color:"var(--amber)"}}>${activeAssembly.stipendPerSession}</p><p className="text-[10px]" style={{color:"var(--text-faint)"}}>Stipend/session</p></div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"var(--violet)"}}>Demographics</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[{label:"18\u201334",val:activeAssembly.demographics.age18_34},{label:"35\u201354",val:activeAssembly.demographics.age35_54},{label:"55+",val:activeAssembly.demographics.age55plus},{label:"Female",val:activeAssembly.demographics.female},{label:"Male",val:activeAssembly.demographics.male},{label:"Non-binary",val:activeAssembly.demographics.nonbinary}].map(d => (
                  <div key={d.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center">
                    <p className="text-sm font-bold" style={{color:"var(--text)"}}>{d.val}%</p>
                    <p className="text-[10px]" style={{color:"var(--text-faint)"}}>{d.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!activeAssembly && <div className="glass-card p-8 text-center"><p className="text-3xl mb-3">{"\u{1F5F3}\uFE0F"}</p><p className="text-sm" style={{color:"var(--text-muted)"}}>Select an assembly to explore its details and demographics.</p></div>}
        </section>)}

        {/* MODULES */}
        {tab==="modules" && (<section>
          <Heading icon={"\u{1F9E9}"} title="Governance Modules" sub="Composable building blocks: cities adopt independently via APIs" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.modules.map(m => (
              <button key={m.id} onClick={()=>setSelectedModule(m.id===selectedModule?null:m.id)} className={`glass-card p-5 text-left w-full transition-all ${selectedModule===m.id?"ring-2 ring-violet-400/50 border-violet-400/30":""} hover:border-white/20`}>
                <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-semibold" style={{color:"var(--text)"}}>{m.title}</h4><span className={`text-[10px] px-2 py-0.5 rounded-full ${m.status==="GA"?"bg-emerald-500/15 text-emerald-400 border border-emerald-500/30":"bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>{m.status} v{m.version}</span></div>
                <p className="text-xs" style={{color:"var(--text-muted)"}}>{m.desc.length > 100 ? m.desc.slice(0,100) + "\u2026" : m.desc}</p>
              </button>
            ))}
          </div>
          {activeModule && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4"><div><h3 className="text-lg font-semibold" style={{color:"var(--text)"}}>{activeModule.title}</h3><p className="text-xs" style={{color:"var(--text-muted)"}}>{activeModule.desc}</p></div><span className={`text-xs px-3 py-1 rounded-full ${activeModule.status==="GA"?"bg-emerald-500/15 text-emerald-400 border border-emerald-500/30":"bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>{activeModule.status} v{activeModule.version}</span></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"var(--violet)"}}>Features</p>
                  <div className="space-y-2">{activeModule.features.map((f,i)=>(<div key={i} className="flex items-start gap-2 text-xs" style={{color:"var(--text-muted)"}}><span style={{color:"var(--violet)"}}>{"\u2022"}</span>{f}</div>))}</div>
                  <p className="text-xs font-semibold uppercase tracking-widest mt-4 mb-2" style={{color:"var(--sky)"}}>Tech Stack</p>
                  <p className="text-xs" style={{color:"var(--text-muted)"}}>{activeModule.techStack}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"var(--emerald)"}}>Metrics</p>
                  <div className="space-y-2">{Object.entries(activeModule.metrics).map(([k,v])=>(<div key={k} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"><span className="text-xs" style={{color:"var(--text-muted)"}}>{k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</span><span className="text-sm font-bold" style={{color:"var(--text)"}}>{typeof v === "number" && v > 1000 ? fmtK(v) : String(v)}</span></div>))}</div>
                </div>
              </div>
            </div>
          )}
          {!activeModule && <div className="glass-card p-8 text-center"><p className="text-3xl mb-3">{"\u{1F9E9}"}</p><p className="text-sm" style={{color:"var(--text-muted)"}}>Select a module to explore its features, tech stack, and live metrics.</p></div>}
        </section>)}

        {/* AUDIT TRACKER */}
        {tab==="audits" && (<section>
          <Heading icon={"\u{1F50D}"} title="AI Audit Tracker" sub="Tracking coverage of high-risk AI systems from 10% (2026) to 100% (2035). Threshold breaches trigger automatic policy reviews." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Stat label="Current coverage" value={`${latestAudit?.audited ?? 0}%`} color="var(--violet)" />
            <Stat label="Systems tracked" value={`${latestAudit?.total ?? 0}`} color="var(--sky)" />
            <Stat label="Incidents (latest yr)" value={`${latestAudit?.incidents ?? 0}`} sub={`${latestAudit?.resolved ?? 0} resolved`} color="var(--rose)" />
            <Stat label="Resolution rate" value={latestAudit ? pct(latestAudit.resolved / Math.max(1, latestAudit.incidents)) : "N/A"} color="var(--emerald)" />
          </div>
          <div className="glass-card p-6 mb-6">
            <h3 className="text-sm font-semibold mb-1" style={{color:"var(--text)"}}>Audit Coverage Over Time</h3>
            <p className="text-xs mb-4" style={{color:"var(--text-faint)"}}>% of high-risk AI systems with participatory safety reviews</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.auditTimeline}>
                <defs><linearGradient id="at-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{fill:"#94a3b8",fontSize:11}} /><YAxis domain={[0,100]} tick={{fill:"#94a3b8",fontSize:11}} />
                <Tooltip contentStyle={{background:"rgba(15,23,42,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#e2e8f0",fontSize:"11px"}} />
                <Area type="monotone" dataKey="audited" stroke="#8b5cf6" fill="url(#at-g)" strokeWidth={2} name="% Audited" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Incident Timeline</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.auditTimeline}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{fill:"#94a3b8",fontSize:11}} /><YAxis tick={{fill:"#94a3b8",fontSize:11}} />
                <Tooltip contentStyle={{background:"rgba(15,23,42,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#e2e8f0",fontSize:"11px"}} />
                <Bar dataKey="incidents" fill="#f43f5e" name="Incidents" radius={[4,4,0,0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>)}

        {/* PARTICIPATION */}
        {tab==="participation" && (<section>
          <Heading icon={"\u{1F465}"} title="Participation & Equity" sub="Measuring who participates, demographic equity, accessibility, and satisfaction" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Stat label="Registered" value={fmtK(data.participation.registered)} sub={`of ${fmtK(data.participation.totalResidents)}`} color="var(--violet)" />
            <Stat label="Active voters" value={fmtK(data.participation.activeVoters)} color="var(--emerald)" />
            <Stat label="Avg turnout" value={pct(data.participation.avgTurnoutRate)} color="var(--sky)" />
            <Stat label="Quadratic votes (Q)" value={fmtK(data.participation.quadraticVotesLastQuarter)} color="var(--amber)" />
          </div>
          <div className="glass-card p-6 mb-6">
            <h3 className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Demographic Equity Index</h3>
            <p className="text-xs mb-4" style={{color:"var(--text-faint)"}}>1.0 = perfect parity between demographic group participation and population share</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(data.participation.demographicEquity).map(([k,v]) => {
                const color = v >= 0.95 ? "#10b981" : v >= 0.85 ? "#0ea5e9" : v >= 0.75 ? "#f59e0b" : "#f43f5e";
                return (
                  <div key={k} className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold" style={{color,fontFamily:"'Space Grotesk',sans-serif"}}>{v.toFixed(2)}</p>
                    <p className="text-xs mt-1" style={{color:"var(--text-muted)"}}>{k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</p>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}><div className="h-full rounded-full" style={{width:`${v*100}%`,background:color,opacity:0.7}} /></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"var(--violet)"}}>Satisfaction Index</p>
              <p className="text-4xl font-bold" style={{color:"var(--violet)",fontFamily:"'Space Grotesk',sans-serif"}}>{data.participation.satisfactionIndex}</p>
              <p className="text-xs mt-1" style={{color:"var(--text-muted)"}}>out of 5.0 &mdash; based on biannual resident surveys</p>
              <div className="mt-3 h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}><div className="h-full rounded-full" style={{width:`${data.participation.satisfactionIndex/5*100}%`,background:"var(--violet)",opacity:0.7}} /></div>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"var(--sky)"}}>Accessibility Score</p>
              <p className="text-4xl font-bold" style={{color:"var(--sky)",fontFamily:"'Space Grotesk',sans-serif"}}>{pct(data.participation.accessibilityScore)}</p>
              <p className="text-xs mt-1" style={{color:"var(--text-muted)"}}>Screen reader, multi-language, IVR, large print, offline support</p>
              <div className="mt-3 h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}><div className="h-full rounded-full" style={{width:`${data.participation.accessibilityScore*100}%`,background:"var(--sky)",opacity:0.7}} /></div>
            </div>
          </div>
          <div className="glass-card p-6 mt-6">
            <h3 className="text-sm font-semibold mb-4" style={{color:"var(--text)"}}>Assembly Participation Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.assemblies.map(a=>({name:a.name.replace(" Assembly",""),members:a.members,turnout:Math.round(a.avgTurnout*100)}))}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:9}} /><YAxis tick={{fill:"#94a3b8",fontSize:11}} />
                <Tooltip contentStyle={{background:"rgba(15,23,42,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#e2e8f0",fontSize:"11px"}} />
                <Bar dataKey="members" fill="#8b5cf6" name="Members" radius={[4,4,0,0]} />
                <Bar dataKey="turnout" fill="#10b981" name="Turnout %" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>)}
      </div>

      <footer className="mt-20 py-8 text-center text-xs" style={{color:"var(--text-faint)",borderTop:"1px solid var(--card-border)"}}>
        <p>GovernanceOS &middot; Clawcode Research &middot; 2026</p>
        <p className="mt-1">
          <a href="/blog" className="underline" style={{color:"var(--text-muted)"}}>Blog</a>{" \u00B7 "}
          <a href="https://github.com/reillyclawcode/GovernanceOS" target="_blank" rel="noopener" className="underline" style={{color:"var(--text-muted)"}}>GitHub</a>{" \u00B7 "}
          <a href="/simulation" className="underline" style={{color:"var(--text-muted)"}}>Simulation</a>{" \u00B7 "}
          <a href="/transition" className="underline" style={{color:"var(--text-muted)"}}>TransitionOS</a>{" \u00B7 "}
          <a href="/civilization" className="underline" style={{color:"var(--text-muted)"}}>CivilizationOS</a>{" \u00B7 "}
          <a href="/climate" className="underline" style={{color:"var(--text-muted)"}}>ClimateOS</a>{" \u00B7 "}
          <a href="/strategy" className="underline" style={{color:"var(--text-muted)"}}>StrategyOS</a>
        </p>
      </footer>
    </main>
  );
}
