"use client";
import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import NavBar from "../components/NavBar";

/* ── Types ── */
interface Journey { id:string; title:string; icon:string; desc:string; steps:string[]; touchpoints:string[]; avgDays:number; completionRate:number; satisfactionScore:number }
interface FundingSource { source:string; pctOfPool:number; annual_m:number; desc:string }
interface DividendModel { fundingSources:FundingSource[]; poolSize_m:number; populationServed:number; biweeklyPerResident:number; annualPerResident:number; povertyReduction:{baseline:number;target:number;timelineYears:number}; escrowMonths:number; disbursementMethod:string }
interface KPI { id:string; label:string; unit:string; baseline:number; target:number; current:number; year:number; color:string; better:string; trajectory:number[] }
interface Milestone { year:number|string; title:string; items:string[] }
interface Benefit { id:string; title:string; desc:string; amount:string; icon:string; status:string; recipients:number }
interface ServiceProvider { name:string; type:string; capacity:number; coverage:string }
interface SeedData { journeys:Journey[]; dividendModel:DividendModel; kpis:KPI[]; milestones:Milestone[]; benefits:Benefit[]; serviceProviders:ServiceProvider[] }

type Section = "overview" | "journeys" | "funding" | "services" | "trajectories" | "timeline";

/* ── Scenarios ── */
type CivScenario = "aggressive" | "moderate" | "bau" | "worst";
const SCENARIOS: { id: CivScenario; name: string; color: string; tag: string }[] = [
  { id: "aggressive", name: "Aggressive Action", color: "#10b981", tag: "Full deployment" },
  { id: "moderate", name: "Moderate Reform", color: "#38bdf8", tag: "Partial adoption" },
  { id: "bau", name: "Business as Usual", color: "#f59e0b", tag: "Current trajectory" },
  { id: "worst", name: "Worst Case", color: "#f43f5e", tag: "Institutional failure" },
];

/* ── Trajectory data per scenario ── */
const TRAJ: Record<string, Record<CivScenario, { t: number[]; cur: number; tgt: number }>> = {
  poverty: {
    aggressive: { t:[13,12.4,11.5,10.2,9.2,8.1,7.0,6.1,5.4,5.0], cur:9.2, tgt:5 },
    moderate:   { t:[13,12.8,12.3,11.6,10.8,10.1,9.5,9.0,8.6,8.2], cur:10.8, tgt:8 },
    bau:        { t:[13,13.2,13.5,13.9,14.4,15.0,15.8,16.5,17.2,18.0], cur:14.4, tgt:18 },
    worst:      { t:[13,14.0,15.5,17.5,19.8,22.0,24.5,27.0,29.5,32.0], cur:19.8, tgt:32 },
  },
  reskill: {
    aggressive: { t:[18,16.5,14.8,12.8,11.0,9.5,8.2,7.2,6.5,6.0], cur:11, tgt:6 },
    moderate:   { t:[18,17.2,16.5,15.5,14.5,13.6,12.8,12.0,11.2,10.5], cur:14.5, tgt:10 },
    bau:        { t:[18,18.2,18.5,19.0,19.5,20.0,20.8,21.5,22.2,23.0], cur:19.5, tgt:23 },
    worst:      { t:[18,19.5,21.0,23.0,25.0,27.5,30.0,32.5,35.0,38.0], cur:25.0, tgt:38 },
  },
  emissions: {
    aggressive: { t:[0.65,0.60,0.55,0.50,0.48,0.42,0.37,0.32,0.28,0.25], cur:0.48, tgt:0.25 },
    moderate:   { t:[0.65,0.63,0.60,0.57,0.54,0.51,0.48,0.45,0.42,0.40], cur:0.54, tgt:0.40 },
    bau:        { t:[0.65,0.65,0.66,0.67,0.68,0.69,0.70,0.71,0.72,0.73], cur:0.68, tgt:0.73 },
    worst:      { t:[0.65,0.68,0.72,0.76,0.80,0.84,0.88,0.92,0.96,1.00], cur:0.80, tgt:1.00 },
  },
  biodiversity: {
    aggressive: { t:[22,26,30,34,38,45,52,60,68,75], cur:38, tgt:75 },
    moderate:   { t:[22,24,27,30,33,36,39,42,45,48], cur:33, tgt:48 },
    bau:        { t:[22,21,20,19,18,17,16,15,14,13], cur:18, tgt:13 },
    worst:      { t:[22,20,18,15,12,10,8,6,5,4], cur:12, tgt:4 },
  },
  charter: {
    aggressive: { t:[10,18,28,36,45,58,72,84,93,100], cur:45, tgt:100 },
    moderate:   { t:[10,14,19,25,31,37,43,50,57,65], cur:31, tgt:65 },
    bau:        { t:[10,11,12,13,14,15,15,16,16,16], cur:14, tgt:16 },
    worst:      { t:[10,9,8,6,5,4,3,3,2,2], cur:5, tgt:2 },
  },
};

const FUND: Record<CivScenario, { pool: number; bw: number; yr: number; pop: number; esc: number; m: number[] }> = {
  aggressive: { pool:2500, bw:192, yr:4992, pop:10_000_000, esc:24, m:[1,1,1,1,1] },
  moderate:   { pool:1500, bw:115, yr:2990, pop:6_500_000,  esc:24, m:[.6,.6,.6,.6,.6] },
  bau:        { pool:400,  bw:31,  yr:806,  pop:1_200_000,  esc:6,  m:[.16,.16,.16,.16,.16] },
  worst:      { pool:80,   bw:6,   yr:156,  pop:300_000,    esc:0,  m:[.03,.03,.03,.03,.03] },
};

/* ── Domain data ── */
const DOMAINS = [
  { key: "climate", label: "Climate", color: "#10b981" },
  { key: "governance", label: "Governance", color: "#8b5cf6" },
  { key: "workforce", label: "Workforce", color: "#38bdf8" },
  { key: "equity", label: "Equity", color: "#f59e0b" },
  { key: "technology", label: "Technology", color: "#06b6d4" },
  { key: "wellbeing", label: "Wellbeing", color: "#f43f5e" },
];

const D_SCORES: Record<CivScenario, number[]> = {
  aggressive: [88,85,82,75,80,78],
  moderate:   [62,65,63,55,62,58],
  bau:        [28,30,35,22,40,25],
  worst:      [12,10,15,8,20,10],
};
const D_TODAY = [42,40,43,38,55,45];

const NARRATIVE: Record<CivScenario, { pullquote: string; body: string }> = {
  aggressive: {
    pullquote: "Climate is stabilizing at +1.2\u00b0C. Governance institutions are strong. The workforce transition is complete.",
    body: "Under Aggressive Action, civilization in 2035 is on a recovery trajectory across every domain. 100% AI audit coverage with 95% civic participation. Dividends bridge income gaps, reskilling pathways are universal, poverty approaches its floor. Social equity is improving as universal benefits and housing programs take effect. AI is governed through open-weight systems with civic oversight. Resident satisfaction reaches 4.6/5. This requires unprecedented coordination but is achievable with current technology and realistic funding.",
  },
  moderate: {
    pullquote: "Climate approaches +1.8\u00b0C \u2014 manageable but tight. This is the \u201cgood enough\u201d scenario.",
    body: "Moderate Reform delivers a functional but stressed civilization by 2035. Governance is partially deployed with 80% AI audit coverage. The workforce transition is working but unevenly \u2014 reskilling helps most workers but income gaps persist for the most vulnerable. Social equity is stable but not improving. AI governance is building but gaps in emerging technology domains create risk. It avoids catastrophe but doesn\u2019t build the resilience needed for the shocks still coming.",
  },
  bau: {
    pullquote: "Every metric is declining and accelerating \u2014 the cost of action in 2035 is orders of magnitude higher than 2026.",
    body: "Business as Usual produces compounding crises by 2035. Climate at +3\u00b0C triggers cascading failures. Only 40% of AI systems are audited. Automation outpaces reskilling, pushing 12% into poverty. Social safety nets strain under the weight of displacement. AI concentration without oversight deepens inequality. Resident satisfaction drops to 2.3/5 as services deteriorate.",
  },
  worst: {
    pullquote: "Every system that holds society together is under existential stress simultaneously.",
    body: "The Worst Case is civilizational crisis across every domain. Climate at +4.6\u00b0C with ecosystem collapse. 1% AI audit coverage means technology operates without any democratic check. 30% poverty with no safety net. Extreme inequality with displacement-driven migration. Civic trust has collapsed, satisfaction at 1.2/5.",
  },
};

/* ── Helpers ── */
const fmtK = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n);
const grade = (s: number) => s >= 93 ? "A" : s >= 85 ? "A\u2212" : s >= 80 ? "B+" : s >= 73 ? "B" : s >= 68 ? "B\u2212" : s >= 63 ? "C+" : s >= 58 ? "C" : s >= 53 ? "C\u2212" : s >= 48 ? "D+" : s >= 43 ? "D" : s >= 38 ? "D\u2212" : "F";
const gClr = (s: number) => s >= 73 ? "#10b981" : s >= 53 ? "#f59e0b" : s >= 38 ? "#fb923c" : "#f43f5e";

const TT: React.CSSProperties = { background: "#050a14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, color: "rgba(255,255,255,0.7)", fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", padding: "8px 12px" };
const AX = { fill: "rgba(255,255,255,0.18)", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" };

/* ════════════════════════════════════════════════════════════════════ */
export default function CivilizationPage() {
  const [data, setData] = useState<SeedData | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [scenario, setScenario] = useState<CivScenario>("aggressive");
  const [journey, setJourney] = useState<string | null>(null);

  useEffect(() => { fetch("/data/civilization.json").then(r => r.json()).then(setData).catch(console.error); }, []);

  const cmpData = useMemo(() => {
    if (!data) return {} as Record<string, any[]>;
    const out: Record<string, any[]> = {};
    for (const k of data.kpis) {
      out[k.id] = Array.from({ length: 10 }, (_, i) => {
        const row: any = { year: 2026 + i };
        for (const s of SCENARIOS) row[s.id] = TRAJ[k.id]?.[s.id]?.t[i] ?? k.trajectory[i];
        return row;
      });
    }
    return out;
  }, [data]);

  if (!data) return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="f-label" style={{ letterSpacing: "0.4em", animationName: "pulse", animationDuration: "2s", animationIterationCount: "infinite" }}>CivilizationOS</p>
    </main>
  );

  const sc = SCENARIOS.find(x => x.id === scenario)!;
  const todayAvg = Math.round(D_TODAY.reduce((a, b) => a + b, 0) / D_TODAY.length);
  const projAvg = Math.round(D_SCORES[scenario].reduce((a, b) => a + b, 0) / D_SCORES[scenario].length);
  const sf = FUND[scenario];
  const activeJ = data.journeys.find(j => j.id === journey);
  const SECTS: { id: Section; label: string }[] = [
    { id: "overview", label: "Overview" }, { id: "trajectories", label: "Trajectories" },
    { id: "funding", label: "Funding" }, { id: "journeys", label: "Journeys" },
    { id: "services", label: "Services" }, { id: "timeline", label: "Timeline" },
  ];

  /* ── Render helpers ── */
  const Dot = ({ color, active }: { color: string; active: boolean }) => (
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? color : "rgba(255,255,255,0.1)", display: "inline-block", flexShrink: 0, transition: "background 0.2s" }} />
  );

  const Legend = () => (
    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4">
      {SCENARIOS.map(s => (
        <button key={s.id} onClick={() => setScenario(s.id)} className="flex items-center gap-1.5" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <span style={{ width: 12, height: 1.5, background: s.color, opacity: s.id === scenario ? 1 : 0.25, display: "inline-block" }} />
          <span style={{ fontSize: "0.52rem", fontWeight: 600, letterSpacing: "0.06em", color: s.id === scenario ? s.color : "rgba(255,255,255,0.2)", fontFamily: "'Inter',sans-serif" }}>{s.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen">

      {/* ── Masthead ── */}
      <div style={{ background: "#030712", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <header className="f-page" style={{ paddingTop: "3.5rem", paddingBottom: "2rem" }}>
          <p className="f-label" style={{ color: "rgba(245,158,11,0.6)", marginBottom: "1rem" }}>CivilizationOS &mdash; 2026</p>
          <h1 className="f-heading f-heading-xl" style={{ maxWidth: 480 }}>
            Resident Experience<br />Dashboard
          </h1>
          <hr className="f-rule" />
          <p className="f-body" style={{ maxWidth: 440 }}>
            Civic journeys, dividend modeling, and 10-year projections.
            Six domains. Four scenarios. One framework.
          </p>
        </header>
      </div>

      <NavBar />

      {/* ── Section Index + Scenario bar ── */}
      <div style={{ position: "sticky", top: 33, zIndex: 40, background: "rgba(3,7,18,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="f-page">
          <div className="flex items-stretch" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="f-index flex-1" style={{ borderBottom: "none" }}>
              {SECTS.map(s => (
                <button key={s.id} onClick={() => setSection(s.id)} className={`f-index-item ${section === s.id ? "f-index-item--active" : ""}`}>{s.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-0 flex-shrink-0 pl-4" style={{ borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
              {SCENARIOS.map(s => (
                <button key={s.id} onClick={() => setScenario(s.id)} className="f-scenario-pill" style={{ color: scenario === s.id ? s.color : "rgba(255,255,255,0.18)" }}>
                  <Dot color={s.color} active={scenario === s.id} />
                  <span className="hidden sm:inline">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="f-page">

        {/* ═══ OVERVIEW ═══ */}
        {section === "overview" && (<>

          {/* Hero score block */}
          <section className="f-section" style={{ paddingTop: "3.5rem", paddingBottom: "3rem" }}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0 items-end">
              <div>
                <span className="f-section-num">01</span>
                <p className="f-label" style={{ marginBottom: "1.5rem" }}>Civilization Health Index &mdash; Today</p>
                <div className="flex items-end gap-3">
                  <span className="f-metric f-metric-hero" style={{ color: gClr(todayAvg) }}>{todayAvg}</span>
                  <div style={{ paddingBottom: "0.6rem" }}>
                    <span className="f-metric f-metric-xl" style={{ color: gClr(todayAvg), opacity: 0.6 }}>{grade(todayAvg)}</span>
                    <p className="f-annotation mt-1">/100 &middot; 6 domains</p>
                  </div>
                </div>
                <p className="f-annotation" style={{ marginTop: "1rem" }}>Aggregate score across climate, governance, workforce, equity, technology, and civic wellbeing. All domains declining or stagnant.</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", width: 1, alignSelf: "stretch" }} className="hidden md:block" />
              <div className="pt-8 md:pt-0 md:pl-10">
                <p className="f-label" style={{ marginBottom: "1.5rem" }}>Projected 2035 &mdash; <span style={{ color: sc.color }}>{sc.name}</span></p>
                <div className="flex items-end gap-3">
                  <span className="f-metric f-metric-hero" style={{ color: gClr(projAvg) }}>{projAvg}</span>
                  <div style={{ paddingBottom: "0.6rem" }}>
                    <span className="f-metric f-metric-xl" style={{ color: gClr(projAvg), opacity: 0.6 }}>{grade(projAvg)}</span>
                    <span className={`f-delta ml-3 ${projAvg >= todayAvg ? "f-delta--up" : "f-delta--down"}`}>
                      {projAvg >= todayAvg ? "+" : ""}{projAvg - todayAvg}
                    </span>
                  </div>
                </div>
                <p className="f-annotation" style={{ marginTop: "1rem" }}>{sc.tag}. {projAvg > 70 ? "Recovery trajectory." : projAvg > 50 ? "Partial improvement." : projAvg > 35 ? "Compounding decline." : "Systemic crisis."}</p>
              </div>
            </div>
          </section>

          {/* Domain matrix: today vs projected */}
          <section className="f-section" style={{ paddingTop: "1rem" }}>
            <span className="f-section-num">02</span>
            <p className="f-label" style={{ marginBottom: "1.25rem" }}>Domain Scores &mdash; Today vs. <span style={{ color: sc.color }}>2035 {sc.name}</span></p>
            <div className="f-grid" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
              {DOMAINS.map((d, i) => {
                const today = D_TODAY[i];
                const proj = D_SCORES[scenario][i];
                const delta = proj - today;
                return (
                  <div key={d.key} className="f-cell" style={{ padding: "1.25rem 1rem" }}>
                    <p className="f-label" style={{ color: d.color, fontSize: "0.5rem", marginBottom: "0.75rem" }}>{d.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="f-metric f-metric-lg" style={{ color: gClr(proj) }}>{proj}</span>
                      <span className={`f-delta ${delta > 0 ? "f-delta--up" : delta < 0 ? "f-delta--down" : "f-delta--flat"}`}>
                        {delta > 0 ? "+" : ""}{delta}
                      </span>
                    </div>
                    <p className="f-annotation" style={{ marginTop: "0.35rem", fontSize: "0.58rem" }}>today: {today}</p>
                    <div className="mt-2" style={{ height: 2, background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ height: "100%", width: `${proj}%`, background: gClr(proj), opacity: 0.5, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* KPI sparkline matrix */}
          <section className="f-section">
            <span className="f-section-num">03</span>
            <p className="f-label" style={{ marginBottom: "1.25rem" }}>10-Year Trajectories &mdash; <span style={{ color: sc.color }}>{sc.name}</span></p>
            <div className="f-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
              {data.kpis.map(k => {
                const st = TRAJ[k.id]?.[scenario];
                const t = st ? st.t : k.trajectory;
                const cur = st ? st.cur : k.current;
                const tgt = st ? st.tgt : k.target;
                const up = k.better === "lower" ? t[9] < t[0] : t[9] > t[0];
                const clr = up ? sc.color : "#f43f5e";
                return (
                  <div key={k.id} className="f-cell" style={{ padding: "1.25rem 1rem" }}>
                    <p className="f-label" style={{ fontSize: "0.48rem", marginBottom: "0.6rem" }}>{k.label}</p>
                    <p className="f-metric f-metric-md" style={{ color: clr }}>{cur}<span className="f-annotation ml-1" style={{ fontWeight: 400, letterSpacing: 0 }}>{k.unit.trim()}</span></p>
                    <p className="f-annotation" style={{ fontSize: "0.52rem", marginTop: "0.15rem" }}>tgt {tgt}{k.unit} &middot; end {t[9]}{k.unit}</p>
                    <div style={{ height: 40, marginTop: 10 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={t.map((v, i) => ({ y: 2026+i, v }))} margin={{ top: 1, right: 0, bottom: 0, left: 0 }}>
                          <defs><linearGradient id={`sp-${k.id}-${scenario}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={clr} stopOpacity={0.15} /><stop offset="100%" stopColor={clr} stopOpacity={0} /></linearGradient></defs>
                          <Area type="monotone" dataKey="v" stroke={clr} fill={`url(#sp-${k.id}-${scenario})`} strokeWidth={1.2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Infrastructure stats */}
          <section className="f-section" style={{ paddingTop: "1rem" }}>
            <span className="f-section-num">04</span>
            <p className="f-label" style={{ marginBottom: "1.25rem" }}>Civic Infrastructure &mdash; <span style={{ color: sc.color }}>{sc.name}</span></p>
            <div className="f-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { label: "Pool Size", value: `$${(sf.pool/1000).toFixed(1)}B`, sub: "/year" },
                { label: "Per Resident", value: `$${sf.yr.toLocaleString()}`, sub: `$${sf.bw} biweekly` },
                { label: "Enrolled", value: fmtK(sf.pop), sub: "residents" },
                { label: "Escrow", value: `${sf.esc}`, sub: "months reserve" },
              ].map(s => (
                <div key={s.label} className="f-cell">
                  <p className="f-label" style={{ fontSize: "0.5rem", marginBottom: "0.5rem" }}>{s.label}</p>
                  <p className="f-metric f-metric-lg" style={{ color: sc.color }}>{s.value}</p>
                  <p className="f-annotation" style={{ marginTop: "0.25rem" }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Funding breakdown */}
          <section className="f-section">
            <span className="f-section-num">05</span>
            <div className="flex items-baseline gap-4 mb-5">
              <p className="f-label" style={{ marginBottom: 0 }}>Funding Allocation</p>
              <span className="f-metric f-metric-md" style={{ color: sc.color }}>${(sf.pool/1000).toFixed(1)}B</span>
              <span className="f-annotation">/year</span>
            </div>
            {data.dividendModel.fundingSources.map((fs, i) => {
              const scaled = Math.round(fs.annual_m * (sf.m[i] ?? 1));
              return (
                <div key={fs.source} className="flex items-center gap-0 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span className="f-metric f-metric-xs w-12 text-right flex-shrink-0" style={{ color: sc.color }}>{fs.pctOfPool}%</span>
                  <div className="flex-1 mx-4">
                    <div className="f-bar-track" style={{ maxWidth: 200 }}>
                      <div className="f-bar-fill" style={{ width: `${fs.pctOfPool * 2}%`, background: sc.color, opacity: 0.4 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, flex: "1 1 auto" }}>{fs.source}</span>
                  <span className="f-metric f-metric-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>${fmtK(scaled * 1e6)}/yr</span>
                </div>
              );
            })}
          </section>

          {/* Narrative */}
          <section className="f-section" style={{ paddingBottom: "3.5rem" }}>
            <span className="f-section-num">06</span>
            <p className="f-label" style={{ marginBottom: "1.5rem" }}>Assessment &mdash; <span style={{ color: sc.color }}>{sc.name}</span></p>
            <blockquote className="f-pullquote mb-6">{NARRATIVE[scenario].pullquote}</blockquote>
            <p className="f-body">{NARRATIVE[scenario].body}</p>
          </section>

        </>)}

        {/* ═══ TRAJECTORIES ═══ */}
        {section === "trajectories" && (<>

          <section className="f-section">
            <span className="f-section-num">01</span>
            <p className="f-label mb-1">Scenario Comparison</p>
            <p className="f-annotation mb-6">Five indicators across four scenarios. Active scenario emphasized.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {data.kpis.map((k, idx) => (
                <div key={k.id} className="f-module" style={{ padding: "1.5rem", borderTop: idx >= 2 ? "none" : undefined, borderLeft: idx % 2 !== 0 ? "none" : undefined }}>
                  <div className="flex items-baseline justify-between mb-4">
                    <p className="f-label" style={{ marginBottom: 0, fontSize: "0.52rem" }}>{k.label}</p>
                    <span className="f-annotation">{k.unit.trim()}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={cmpData[k.id] || []} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
                      <XAxis dataKey="year" tick={AX} axisLine={false} tickLine={false} />
                      <YAxis tick={AX} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TT} />
                      {SCENARIOS.map(s => (
                        <Line key={s.id} type="monotone" dataKey={s.id} stroke={s.color} strokeWidth={s.id === scenario ? 2 : 0.7} strokeOpacity={s.id === scenario ? 1 : 0.22} dot={false} name={s.name} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
              {data.kpis.length % 2 !== 0 && <div className="f-module" style={{ borderTop: "none", borderLeft: "none" }} />}
            </div>
            <Legend />
          </section>

          <section className="f-section">
            <span className="f-section-num">02</span>
            <p className="f-label mb-5">Detailed Metrics &mdash; <span style={{ color: sc.color }}>{sc.name}</span></p>
            <div className="hidden sm:flex items-center gap-0 pb-2 mb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="f-annotation w-36">Indicator</span>
              <span className="f-annotation w-24">Current</span>
              <span className="f-annotation flex-1">Trajectory</span>
              <span className="f-annotation w-20 text-right">2035</span>
              <span className="f-annotation w-16 text-right">Target</span>
            </div>
            {data.kpis.map(k => {
              const st = TRAJ[k.id]?.[scenario];
              const t = st ? st.t : k.trajectory;
              const cur = st ? st.cur : k.current;
              const tgt = st ? st.tgt : k.target;
              const up = k.better === "lower" ? t[9] < t[0] : t[9] > t[0];
              return (
                <div key={k.id} className="flex items-center gap-0 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span className="w-36 text-xs" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{k.label}</span>
                  <span className="f-metric f-metric-xs w-24" style={{ color: up ? sc.color : "#f43f5e" }}>{cur}{k.unit}</span>
                  <div className="flex-1" style={{ height: 28 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={t.map((v, i) => ({ y: 2026+i, v }))} margin={{ top: 2, right: 4, bottom: 2, left: 4 }}>
                        <Line type="monotone" dataKey="v" stroke={up ? sc.color : "#f43f5e"} strokeWidth={1.2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="f-metric f-metric-xs w-20 text-right" style={{ color: "rgba(255,255,255,0.4)" }}>{t[9]}{k.unit}</span>
                  <span className="f-annotation w-16 text-right">{tgt}</span>
                </div>
              );
            })}
          </section>
        </>)}

        {/* ═══ FUNDING ═══ */}
        {section === "funding" && (<>
          <section className="f-section">
            <span className="f-section-num">01</span>
            <p className="f-label mb-1">Civic Dividend Model</p>
            <p className="f-annotation mb-2">Locally controlled dividend. Modeled after Alaska&apos;s Permanent Fund.</p>
            <hr className="f-rule" />
            <div className="f-grid mt-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { l: "Pool", v: `$${(sf.pool/1000).toFixed(1)}B`, s: "/year" },
                { l: "Annual", v: `$${sf.yr.toLocaleString()}`, s: `$${sf.bw} biweekly` },
                { l: "Enrolled", v: fmtK(sf.pop), s: "residents" },
                { l: "Escrow", v: `${sf.esc}`, s: "mo reserve" },
              ].map(x => (
                <div key={x.l} className="f-cell">
                  <p className="f-label" style={{ fontSize: "0.5rem", marginBottom: "0.5rem" }}>{x.l}</p>
                  <p className="f-metric f-metric-lg" style={{ color: sc.color }}>{x.v}</p>
                  <p className="f-annotation mt-1">{x.s}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="f-section" style={{ paddingTop: "1rem" }}>
            <span className="f-section-num">02</span>
            <p className="f-label mb-5">Sources &amp; Allocation</p>
            {data.dividendModel.fundingSources.map((fs, i) => {
              const scaled = Math.round(fs.annual_m * (sf.m[i] ?? 1));
              return (
                <div key={fs.source} className="py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div className="flex items-baseline gap-4 mb-1.5">
                    <span className="f-metric f-metric-sm" style={{ color: sc.color, width: 40, textAlign: "right" as const }}>{fs.pctOfPool}%</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{fs.source}</span>
                    <span className="f-metric f-metric-xs ml-auto" style={{ color: "rgba(255,255,255,0.35)" }}>${fmtK(scaled * 1e6)}/yr</span>
                  </div>
                  <div className="ml-14">
                    <div className="f-bar-track mb-1.5" style={{ maxWidth: 280 }}>
                      <div className="f-bar-fill" style={{ width: `${fs.pctOfPool * 2.5}%`, background: sc.color, opacity: 0.35 }} />
                    </div>
                    <p className="f-annotation">{fs.desc}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="f-section">
            <span className="f-section-num">03</span>
            <p className="f-label mb-1">Poverty Trajectory</p>
            <p className="f-annotation mb-4">All four scenarios &mdash; 2026 to 2035</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={cmpData.poverty || []} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                <XAxis dataKey="year" tick={AX} axisLine={false} tickLine={false} />
                <YAxis tick={AX} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} />
                {SCENARIOS.map(s => (
                  <Line key={s.id} type="monotone" dataKey={s.id} stroke={s.color} strokeWidth={s.id === scenario ? 2 : 0.7} strokeOpacity={s.id === scenario ? 1 : 0.22} dot={false} name={s.name} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <Legend />
          </section>
        </>)}

        {/* ═══ JOURNEYS ═══ */}
        {section === "journeys" && (<>
          <section className="f-section">
            <span className="f-section-num">01</span>
            <p className="f-label mb-1">Resident Journey Map</p>
            <p className="f-annotation mb-6">Five core civic journeys from onboarding to graduation.</p>
            <div className="f-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {data.journeys.map(j => (
                <button key={j.id} onClick={() => setJourney(j.id === journey ? null : j.id)} className="f-cell text-left" style={{ cursor: "pointer", background: journey === j.id ? "rgba(255,255,255,0.025)" : "#030712", border: "none", padding: "1.5rem 1.25rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>{j.icon}</span>
                  <p className="f-heading f-heading-md mt-2">{j.title}</p>
                  <p className="f-annotation mt-1 mb-3">{j.desc}</p>
                  <div className="flex gap-3 items-baseline">
                    <span className="f-metric f-metric-sm" style={{ color: "#10b981" }}>{(j.completionRate*100).toFixed(0)}%</span>
                    <span className="f-metric f-metric-sm">{j.avgDays}d</span>
                    <span className="f-metric f-metric-sm" style={{ color: "#38bdf8" }}>{j.satisfactionScore}</span>
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="f-annotation" style={{ fontSize: "0.5rem" }}>completion</span>
                    <span className="f-annotation" style={{ fontSize: "0.5rem" }}>duration</span>
                    <span className="f-annotation" style={{ fontSize: "0.5rem" }}>satisfaction</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {activeJ && (
            <section className="f-section">
              <span className="f-section-num">02</span>
              <div className="flex items-center gap-3 mb-5">
                <span style={{ fontSize: "1.3rem" }}>{activeJ.icon}</span>
                <div>
                  <p className="f-heading f-heading-lg">{activeJ.title} Journey</p>
                  <p className="f-annotation">{activeJ.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-0">
                <div className="pr-6">
                  <p className="f-label mb-3">Steps</p>
                  {activeJ.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span className="f-metric f-metric-xs" style={{ color: "rgba(255,255,255,0.15)", width: 14, textAlign: "right" as const, flexShrink: 0 }}>{i+1}</span>
                      <p className="f-annotation" style={{ color: "rgba(255,255,255,0.5)" }}>{s}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", width: 1 }} className="hidden lg:block" />
                <div className="pl-0 lg:pl-6 pt-6 lg:pt-0">
                  <p className="f-label mb-3">Touchpoints</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {activeJ.touchpoints.map(tp => <span key={tp} className="f-tag">{tp}</span>)}
                  </div>
                  <div className="f-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <div className="f-cell text-center">
                      <p className="f-metric f-metric-md" style={{ color: "#10b981" }}>{(activeJ.completionRate*100).toFixed(0)}%</p>
                      <p className="f-annotation mt-1">completion</p>
                    </div>
                    <div className="f-cell text-center">
                      <p className="f-metric f-metric-md">{activeJ.avgDays}d</p>
                      <p className="f-annotation mt-1">duration</p>
                    </div>
                    <div className="f-cell text-center">
                      <p className="f-metric f-metric-md" style={{ color: "#38bdf8" }}>{activeJ.satisfactionScore}/5</p>
                      <p className="f-annotation mt-1">satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>)}

        {/* ═══ SERVICES ═══ */}
        {section === "services" && (<>
          <section className="f-section">
            <span className="f-section-num">01</span>
            <p className="f-label mb-1">Benefits &amp; Support</p>
            <p className="f-annotation mb-6">Comprehensive resident support infrastructure.</p>
            {data.benefits.map(b => (
              <div key={b.id} className="flex items-start gap-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ fontSize: "1.15rem", width: 28, textAlign: "center" as const, flexShrink: 0, marginTop: 2 }}>{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.78)" }}>{b.title}</span>
                    <span className="f-tag" style={{ borderColor: b.status === "active" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)", color: b.status === "active" ? "#10b981" : "#f59e0b" }}>{b.status}</span>
                  </div>
                  <p className="f-annotation mt-1">{b.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="f-metric f-metric-xs" style={{ color: "#10b981" }}>{b.amount}</p>
                  <p className="f-annotation">{fmtK(b.recipients)}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="f-section">
            <span className="f-section-num">02</span>
            <p className="f-label mb-5">Provider Network</p>
            <div className="f-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {data.serviceProviders.map(sp => (
                <div key={sp.name} className="f-cell">
                  <p className="f-label" style={{ color: "#38bdf8", fontSize: "0.48rem", marginBottom: "0.4rem" }}>{sp.type}</p>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.72)" }}>{sp.name}</p>
                  <p className="f-annotation mt-1">{sp.coverage}</p>
                  <p className="f-metric f-metric-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>{fmtK(sp.capacity)} capacity</p>
                </div>
              ))}
            </div>
          </section>
        </>)}

        {/* ═══ TIMELINE ═══ */}
        {section === "timeline" && (<>
          <section className="f-section">
            <span className="f-section-num">01</span>
            <p className="f-label mb-1">10-Year Milestones</p>
            <p className="f-annotation mb-6">Discovery sprint to global export &mdash; 2026&ndash;2035</p>
            {data.milestones.map((m, i) => {
              const last = i === data.milestones.length - 1;
              return (
                <div key={i} className="flex gap-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div className="w-20 flex-shrink-0 text-right">
                    <p className="f-metric f-metric-md" style={{ color: last ? "#10b981" : "rgba(255,255,255,0.35)" }}>{m.year}</p>
                  </div>
                  <div className="flex-1">
                    <p className="f-heading f-heading-md" style={{ marginBottom: "0.6rem" }}>{m.title}</p>
                    {m.items.map((item, j) => (
                      <p key={j} className="f-annotation py-0.5" style={{ color: "rgba(255,255,255,0.4)", paddingLeft: "1rem", textIndent: "-1rem" }}>
                        <span style={{ color: last ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)" }}>&mdash;&ensp;</span>{item}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </>)}

      </div>

      {/* ── Footer ── */}
      <footer className="f-page mt-20 py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="f-annotation text-center">CivilizationOS &middot; Clawcode Research &middot; 2026</p>
        <div className="flex justify-center gap-4 mt-3 flex-wrap">
          {[
            { href: "/climate", label: "ClimateOS" },
            { href: "/simulation", label: "Simulation" },
            { href: "/transition", label: "TransitionOS" },
            { href: "/governance", label: "GovernanceOS" },
            { href: "/strategy", label: "StrategyOS" },
            { href: "/blog", label: "Blog" },
          ].map(l => (
            <a key={l.href} href={l.href} className="f-annotation" style={{ color: "rgba(255,255,255,0.22)", transition: "color 0.15s" }}>{l.label}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}
