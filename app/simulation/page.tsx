"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SnapshotState {
  year: number;
  economy: { gini: number; civic_trust: number; ai_influence: number };
  climate: { annual_emissions: number; resilience_score: number };
}

interface ScenarioData {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  branch: Record<string, any>;
  trajectory: SnapshotState[];
}

interface SeedData {
  scenarios: ScenarioData[];
}

interface LabNote {
  id: string;
  title: string;
  annotation: string;
  timestamp: string;
  scenarioId: string;
  scenarioName: string;
  yearIndex: number;
  year: number;
  metrics: {
    gini: number;
    civic_trust: number;
    annual_emissions: number;
    resilience_score: number;
    ai_influence: number;
  };
  compositeScore: number;
  rating: string;
  summary: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BLOG_INSIGHTS = [
  { title: "Agency beats prediction", body: "Perfect foresight doesn\u2019t help if we don\u2019t act on it. The sim becomes a mirror reminding us the present is the only place we can exert force.", icon: "\u2693" },
  { title: "Small civic wins ripple", body: "Adding participatory audits, open ledgers, or shared compute co-ops slightly tweaks millions of branches, often tipping them toward shared benefit.", icon: "\u2728" },
  { title: "Stubborn problems reappear", body: "No matter how far we roll the dice, unresolved energy, housing, and labor transitions resurface. Fix root causes or keep reliving variants of the same bottleneck.", icon: "\u267B" },
  { title: "Early constraints dominate", body: "The first inputs we set\u2009\u2014\u2009resource distribution, governance norms, who has veto power\u2009\u2014\u2009show up in nearly every outcome, even as the trees fan outward.", icon: "\u{1F331}" },
  { title: "Values before arithmetic", body: "If we don\u2019t specify what \u201cseeking\u201d means\u2009\u2014\u2009justice? abundance? stability?\u2009\u2014\u2009we just drown in branching arithmetic.", icon: "\u{1F9ED}" },
];

const THREE_THROUGH_LINES = [
  { title: "Cultural + ecological care", body: "Art, meaning, biodiversity restoration. Without them, even technically \u201csuccessful\u201d simulations feel hollow, and social cohesion collapses.", accent: "from-emerald-500/20 to-emerald-500/0", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  { title: "Shared upside", body: "Dividends, co-ops, portable benefits. When people feel the gains, they participate more, lowering tail risks.", accent: "from-sky-500/20 to-sky-500/0", border: "border-sky-500/30", dot: "bg-sky-400" },
  { title: "Transparent governance", body: "Open weights, audit trails, and citizens with real override powers over powerful systems.", accent: "from-violet-500/20 to-violet-500/0", border: "border-violet-500/30", dot: "bg-violet-400" },
];

const THREE_DARK_LINES = [
  { title: "Unchecked concentration", body: "Wealth, compute, and decision-making power consolidate into fewer hands. When no one has override capability, the system optimizes for the wrong objective function.", accent: "from-red-500/20 to-red-500/0", border: "border-red-500/30", dot: "bg-red-400" },
  { title: "Erosion of shared truth", body: "Misinformation, deep fakes, and tribal epistemology fracture public consensus. Without shared facts, cooperation becomes impossible and trust free-falls.", accent: "from-orange-500/20 to-orange-500/0", border: "border-orange-500/30", dot: "bg-orange-400" },
  { title: "Ecological neglect", body: "Biodiversity loss, soil depletion, and resource extraction continue unchecked. The biosphere\u2019s buffering capacity shrinks until small shocks cascade into systemic failures.", accent: "from-amber-500/20 to-amber-500/0", border: "border-amber-500/30", dot: "bg-amber-400" },
];

const NOTABLE_RUNS = [
  { run: "Run 218", desc: "Civic dividends + participatory AI charters + \u201cpublic luxuries\u201d baseline", result: "After two decades, inequality curves flatten and cultural investments explode." },
  { run: "Run 103", desc: "Climate VPPs scale but governance lags", result: "Grid stability improves, yet trust erodes, limiting adoption." },
  { run: "Run 47", desc: "Open standards + Transition OS funding", result: "Slower short-term growth, but resilience metrics outpace every other branch after year five." },
  { run: "Run 12", desc: "Frontier AI is proprietary, dividends aren\u2019t shared", result: "Polarization spikes." },
];

const METRIC_COLORS: Record<string, string> = { gini: "#f59e0b", civic_trust: "#10b981", annual_emissions: "#f43f5e", resilience_score: "#06b6d4", ai_influence: "#8b5cf6" };
const METRIC_LABELS: Record<string, string> = { gini: "GINI Index", civic_trust: "Civic Trust", annual_emissions: "Emissions (Gt)", resilience_score: "Resilience", ai_influence: "AI Influence" };
const METRIC_DESCRIPTIONS: Record<string, string> = { gini: "Lower values mean income is more evenly distributed.", civic_trust: "Proxy for willingness to collaborate and accept shared rules.", annual_emissions: "Gigatons of CO\u2082-equivalent released this year.", resilience_score: "System robustness against shocks and disruptions.", ai_influence: "How deeply automation and AI copilots shape daily life." };
const METRIC_GOOD_DIR: Record<string, "up" | "down" | "stable"> = { gini: "down", civic_trust: "up", annual_emissions: "down", resilience_score: "up", ai_influence: "stable" };

/* ------------------------------------------------------------------ */
/*  Utility functions                                                  */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

interface ScoreBreakdown {
  total: number;
  components: { label: string; score: number; explanation: string; color: string }[];
  rating: string;
  ratingColor: string;
}

function computeCompositeScore(current?: SnapshotState, baseline?: SnapshotState | null): ScoreBreakdown | null {
  if (!current || !baseline) return null;
  const g = clamp01(1 - current.economy.gini);
  const t = clamp01(current.economy.civic_trust);
  const r = clamp01(current.climate.resilience_score);
  const e = clamp01(1 - current.climate.annual_emissions / Math.max(1, baseline.climate.annual_emissions));
  const govReadiness = clamp01(current.economy.civic_trust / 0.65);
  const govGap = Math.max(0, current.economy.ai_influence - current.economy.civic_trust - 0.1);
  const a = clamp01(govReadiness - govGap * 2.5);
  const total = Math.round(((g + t + r + e + a) / 5) * 100);
  const rating = total >= 80 ? "Thriving" : total >= 65 ? "Promising" : total >= 50 ? "Mixed signals" : total >= 35 ? "Under stress" : "Critical";
  const ratingColor = total >= 80 ? "text-emerald-400" : total >= 65 ? "text-sky-400" : total >= 50 ? "text-amber-400" : total >= 35 ? "text-orange-400" : "text-red-400";
  return {
    total, rating, ratingColor,
    components: [
      { label: "Equality", score: Math.round(g * 100), explanation: `GINI is ${current.economy.gini.toFixed(3)} \u2014 ${g > 0.7 ? "income is well distributed" : g > 0.5 ? "moderate inequality remains" : "significant inequality persists"}`, color: METRIC_COLORS.gini },
      { label: "Civic trust", score: Math.round(t * 100), explanation: `Trust at ${current.economy.civic_trust.toFixed(3)} \u2014 ${t > 0.7 ? "strong social cohesion" : t > 0.4 ? "cooperation is possible but fragile" : "low willingness to collaborate"}`, color: METRIC_COLORS.civic_trust },
      { label: "Resilience", score: Math.round(r * 100), explanation: `Score ${current.climate.resilience_score.toFixed(3)} \u2014 ${r > 0.7 ? "systems absorb shocks well" : r > 0.4 ? "some buffering capacity" : "vulnerable to disruption"}`, color: METRIC_COLORS.resilience_score },
      { label: "Decarbonization", score: Math.round(e * 100), explanation: `Emissions ${current.climate.annual_emissions.toFixed(2)} Gt vs ${baseline.climate.annual_emissions.toFixed(2)} Gt baseline \u2014 ${e > 0.7 ? "major progress" : e > 0.4 ? "some reduction" : "still tracking high"}`, color: METRIC_COLORS.annual_emissions },
      { label: "AI governance", score: Math.round(a * 100), explanation: `AI at ${current.economy.ai_influence.toFixed(3)}, trust at ${current.economy.civic_trust.toFixed(3)} \u2014 ${a > 0.7 ? "governance institutions are strong and keeping pace" : a > 0.4 ? "governance readiness is building but gaps are emerging" : "institutional trust lags dangerously behind AI adoption"}`, color: METRIC_COLORS.ai_influence },
    ],
  };
}

function getMetricValue(snap: SnapshotState, key: string): number {
  if (key === "gini") return snap.economy.gini;
  if (key === "civic_trust") return snap.economy.civic_trust;
  if (key === "annual_emissions") return snap.climate.annual_emissions;
  if (key === "resilience_score") return snap.climate.resilience_score;
  if (key === "ai_influence") return snap.economy.ai_influence;
  return 0;
}

/* ---- Report generator (replaces OpenAI API calls) ---- */
function generateReport(scenario: ScenarioData, snap: SnapshotState, baseline: SnapshotState, worstSnap?: SnapshotState): string {
  const yr = snap.year;
  const elapsed = yr - baseline.year;
  const b = scenario.branch;
  const sid = scenario.id;
  const giniDelta = snap.economy.gini - baseline.economy.gini;
  const trustDelta = snap.economy.civic_trust - baseline.economy.civic_trust;
  const emDelta = snap.climate.annual_emissions - baseline.climate.annual_emissions;
  const resDelta = snap.climate.resilience_score - baseline.climate.resilience_score;
  const aiDelta = snap.economy.ai_influence - baseline.economy.ai_influence;
  const pctEmChange = baseline.climate.annual_emissions > 0 ? Math.round(((snap.climate.annual_emissions - baseline.climate.annual_emissions) / baseline.climate.annual_emissions) * 100) : 0;
  const score = computeCompositeScore(snap, baseline);
  const scoreLabel = score ? `${score.total}/100 (${score.rating})` : "N/A";

  const charterStatus = b.ai_charter ? "enforced" : "absent";
  const divPct = (b.civic_dividend_rate * 100).toFixed(0);
  const climPct = (b.climate_capex_share * 100).toFixed(0);
  const aiGap = snap.economy.ai_influence - snap.economy.civic_trust;

  // Era phases drive narrative arc
  const era: "dawn" | "diverge" | "mature" | "legacy" =
    elapsed <= 5 ? "dawn" : elapsed <= 15 ? "diverge" : elapsed <= 30 ? "mature" : "legacy";
  const decade = Math.floor(yr / 10) * 10;

  // ── SUMMARY ──
  const summaryMap: Record<string, Record<typeof era, string>> = {
    aggressive: {
      dawn: `It\u2019s ${yr} \u2014 ${elapsed} year${elapsed === 1 ? "" : "s"} since the simulation began. The Aggressive Action reforms are being rolled out, but structural inertia means results are modest so far. The trajectory score is ${scoreLabel}. Dividends at ${divPct}% have started reaching residents, the AI charter is being enforced across the first wave of high-risk systems, and ${climPct}% climate capex is flowing into grid modernization. The system is being rewired, but the old economy is still dominant. Early signals matter more than early scores.`,
      diverge: `By ${yr}, ${elapsed} years in, the Aggressive Action scenario is entering its inflection phase. The trajectory score has reached ${scoreLabel}. The compounding effects of ${divPct}% civic dividends, an enforced AI charter, and ${climPct}% climate capex are starting to separate this path from the alternatives. Emissions are at ${snap.climate.annual_emissions.toFixed(1)} Gt (from ${baseline.climate.annual_emissions.toFixed(1)}), trust is at ${snap.economy.civic_trust.toFixed(3)}, and the GINI index has shifted to ${snap.economy.gini.toFixed(3)}. The question is no longer whether the interventions work, but whether they can compound fast enough.`,
      mature: `${yr}. The Aggressive Action scenario is ${elapsed} years old and now producing second-generation effects. The trajectory score stands at ${scoreLabel}. Children who grew up with civic dividends are entering the workforce. The AI charter, once controversial, is settled law. Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt reflect decades of sustained ${climPct}% climate capex. Institutions have been reshaped \u2014 the question is no longer whether this model works but whether it can adapt to the challenges it wasn\u2019t designed for.`,
      legacy: `${yr} \u2014 half a century from baseline. The Aggressive Action scenario has produced a civilization measurably different from its starting point. The trajectory score is ${scoreLabel}. Two full generations have lived under ${divPct}% civic dividends. The AI charter has been amended three times as technology evolved. Climate capex at ${climPct}% has transformed the energy grid entirely. Emissions stand at ${snap.climate.annual_emissions.toFixed(1)} Gt, trust at ${snap.economy.civic_trust.toFixed(3)}, GINI at ${snap.economy.gini.toFixed(3)}. This is the long arc of structural reform made visible.`,
    },
    moderate: {
      dawn: `It\u2019s ${yr}, ${elapsed} year${elapsed === 1 ? "" : "s"} into the Moderate Reform scenario. The trajectory score is ${scoreLabel}. Reforms are being introduced cautiously: ${divPct}% dividends, AI charter adopted, ${climPct}% climate capex. Early results are indistinguishable from the other scenarios \u2014 the data hasn\u2019t had time to diverge. The political coalition supporting these reforms is still holding, but hasn\u2019t been tested by a real crisis.`,
      diverge: `By ${yr}, the Moderate Reform path is ${elapsed} years old and starting to show its character. The score is ${scoreLabel}. Progress is real but uneven \u2014 ${divPct}% dividends are providing a floor without closing the gap, the AI charter is being enforced selectively, and ${climPct}% climate spending is driving transition in some sectors while others lag. Emissions are at ${snap.climate.annual_emissions.toFixed(1)} Gt, resilience at ${snap.climate.resilience_score.toFixed(3)}. This is the scenario of half-measures and their consequences.`,
      mature: `${yr}. ${elapsed} years of Moderate Reform have produced a society that is better than the alternatives but short of its potential. The score is ${scoreLabel}. Dividends at ${divPct}% alleviated poverty without eliminating it. The AI charter prevented the worst abuses without catalyzing the best outcomes. Climate capex at ${climPct}% bent the emissions curve but didn\u2019t break it. At ${snap.climate.annual_emissions.toFixed(1)} Gt and GINI ${snap.economy.gini.toFixed(3)}, this is a world of managed decline in some dimensions and genuine progress in others.`,
      legacy: `${yr} \u2014 ${elapsed} years on. Moderate Reform produced a livable future, but one haunted by what-ifs. The trajectory score is ${scoreLabel}. Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt are lower than the worst case but higher than what was possible. GINI at ${snap.economy.gini.toFixed(3)} reflects a society that reduced the sharpest inequalities without confronting their structural roots. Trust at ${snap.economy.civic_trust.toFixed(3)} is functional but has plateaued. The moderate path protected millions but didn\u2019t transform the system.`,
    },
    bau: {
      dawn: `It\u2019s ${yr}, ${elapsed} year${elapsed === 1 ? "" : "s"} into the Business as Usual scenario. The trajectory score is ${scoreLabel}. Existing policies are rolling forward without significant structural change: ${divPct}% dividends (modest), no AI charter, ${climPct}% climate capex. At this early stage, the metrics barely differ from other scenarios. The window for intervention is still wide open, but no one is walking through it.`,
      diverge: `By ${yr}, the Business as Usual scenario is ${elapsed} years old and the cost of inaction is becoming measurable. The score is ${scoreLabel}. Without an AI charter, governance is failing to keep pace with automation (AI at ${snap.economy.ai_influence.toFixed(3)}, trust at ${snap.economy.civic_trust.toFixed(3)}). Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt reflect ${climPct}% climate capex that was never enough. The compounding nature of these deficits is becoming clear \u2014 each year of delay makes the next year\u2019s correction harder.`,
      mature: `${yr}. ${elapsed} years of Business as Usual, and the accumulated cost of deferred action is now structural. The score is ${scoreLabel}. GINI has reached ${snap.economy.gini.toFixed(3)} as automation concentrated wealth without adequate redistribution. Trust at ${snap.economy.civic_trust.toFixed(3)} reflects a public that has been promised change and received incrementalism. Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt mean the climate budget is being consumed without a transition plan. The system is not collapsing \u2014 it\u2019s slowly degrading.`,
      legacy: `${yr} \u2014 ${elapsed} years of drift. Business as Usual delivered exactly what the name implies: a slow, grinding deterioration of every metric. The trajectory score is ${scoreLabel}. Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt have locked in warming that the next generation cannot reverse. GINI at ${snap.economy.gini.toFixed(3)} means the AI productivity boom went almost entirely to capital owners. Trust at ${snap.economy.civic_trust.toFixed(3)} has corroded to the point where collective action on any remaining challenge is nearly impossible. This is not a catastrophe \u2014 it\u2019s the quiet failure of choosing not to choose.`,
    },
    worst: {
      dawn: `It\u2019s ${yr}, ${elapsed} year${elapsed === 1 ? "" : "s"} into the Worst Case scenario. The trajectory score is ${scoreLabel}. With dividends at just ${divPct}%, no AI governance charter, and ${climPct}% climate capex, the structural foundations are weaker than any other path. The metrics are only marginally worse than other scenarios right now \u2014 but the absence of protective mechanisms means every emerging shock will hit harder.`,
      diverge: `By ${yr}, the Worst Case scenario is ${elapsed} years old and accelerating in the wrong direction. The score is ${scoreLabel}. The absence of an AI charter means algorithmic systems are shaping markets, information, and governance with no democratic check. Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt reflect ${climPct}% climate capex that barely maintains existing infrastructure. Trust at ${snap.economy.civic_trust.toFixed(3)} is entering a vicious cycle: low trust blocks reform, blocked reform erodes trust further.`,
      mature: `${yr}. ${elapsed} years into the Worst Case and the damage is now self-reinforcing. The score is ${scoreLabel}. GINI at ${snap.economy.gini.toFixed(3)} represents a society where automation\u2019s productivity gains were captured almost entirely by the top decile. Trust at ${snap.economy.civic_trust.toFixed(3)} has fallen to levels where democratic institutions are losing legitimacy. Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt have baked in dangerous warming. Resilience at ${snap.climate.resilience_score.toFixed(3)} means the system cannot absorb the shocks that are now inevitable.`,
      legacy: `${yr} \u2014 ${elapsed} years, and the Worst Case scenario has played out in full. The trajectory score is ${scoreLabel}. This is what happens when a civilization faces transformative technology and ecological crisis with ${divPct}% dividends, no governance charter, and ${climPct}% climate capex. GINI at ${snap.economy.gini.toFixed(3)}, trust at ${snap.economy.civic_trust.toFixed(3)}, emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt, resilience at ${snap.climate.resilience_score.toFixed(3)}. Every metric tells the same story: the costs of structural neglect compound across generations. The damage is not equally distributed \u2014 it never is.`,
    },
  };
  const summaryTone = summaryMap[sid]?.[era] ?? summaryMap.bau[era];

  // ── STATUS QUO COMPARISON ──
  let worstComparison = "";
  if (worstSnap) {
    const wGini = worstSnap.economy.gini;
    const wTrust = worstSnap.economy.civic_trust;
    const wEm = worstSnap.climate.annual_emissions;
    const giniGap = snap.economy.gini - wGini;
    const trustGap = snap.economy.civic_trust - wTrust;
    const emGap = snap.climate.annual_emissions - wEm;
    const statusQuoNarrative: Record<typeof era, string> = {
      dawn: `- The gap between this scenario and worst case is still narrow \u2014 GINI differs by only ${Math.abs(giniGap).toFixed(3)} points, trust by ${Math.abs(trustGap).toFixed(3)}, emissions by ${Math.abs(emGap).toFixed(1)} Gt\n- At this early stage, the interventions haven\u2019t had time to compound \u2014 the paths look similar but their trajectories are diverging beneath the surface\n- The real divergence will become visible over the next decade as structural differences accumulate`,
      diverge: `- The divergence from worst case is now measurable: GINI is ${Math.abs(giniGap).toFixed(3)} points ${giniGap < 0 ? "lower (more equal)" : "higher (less equal)"}, trust is ${Math.abs(trustGap).toFixed(3)} points ${trustGap > 0 ? "higher" : "lower"}, emissions differ by ${Math.abs(emGap).toFixed(1)} Gt\n- Worst-case trust has fallen to ${wTrust.toFixed(3)} while this scenario sits at ${snap.economy.civic_trust.toFixed(3)} \u2014 the governance capacity gap is widening each year\n- These aren\u2019t marginal differences anymore \u2014 they represent fundamentally different institutional trajectories`,
      mature: `- After ${elapsed} years the paths are worlds apart: this scenario\u2019s GINI of ${snap.economy.gini.toFixed(3)} vs worst case ${wGini.toFixed(3)}, trust ${snap.economy.civic_trust.toFixed(3)} vs ${wTrust.toFixed(3)}, emissions ${snap.climate.annual_emissions.toFixed(1)} vs ${wEm.toFixed(1)} Gt\n- The worst-case path is now experiencing compound institutional decay that cannot be easily reversed \u2014 the window for course correction has largely closed\n- This scenario\u2019s accumulated structural investments are paying generational dividends that the worst case can never recover`,
      legacy: `- Fifty years have produced dramatically different civilizations: GINI ${snap.economy.gini.toFixed(3)} vs ${wGini.toFixed(3)}, trust ${snap.economy.civic_trust.toFixed(3)} vs ${wTrust.toFixed(3)}, emissions ${snap.climate.annual_emissions.toFixed(1)} vs ${wEm.toFixed(1)} Gt\n- The worst case is now a cautionary archive \u2014 its institutions, infrastructure, and social fabric reflect half a century of compounded neglect\n- The gap between these outcomes was built year by year, policy by policy \u2014 the simulation\u2019s core lesson is that structural choices in the ${decade - 40}s determined which world people live in now`,
    };
    worstComparison = `\n\n## Status Quo Projection\n${statusQuoNarrative[era]}`;
  }

  // ── BASELINE COMPARISON ──
  const baselineNarrative: Record<typeof era, string> = {
    dawn: `- GINI shifted from ${baseline.economy.gini.toFixed(3)} to ${snap.economy.gini.toFixed(3)} (${giniDelta > 0 ? "+" : ""}${giniDelta.toFixed(3)}) \u2014 too early for structural redistribution to show, mostly noise\n- Civic trust moved from ${baseline.economy.civic_trust.toFixed(3)} to ${snap.economy.civic_trust.toFixed(3)} \u2014 ${Math.abs(trustDelta) < 0.02 ? "unchanged within measurement error" : trustDelta > 0 ? "a fragile early uptick as new institutions take shape" : "already dipping as disruption outpaces reform"}\n- Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt (${pctEmChange > 0 ? "+" : ""}${pctEmChange}% from baseline) \u2014 energy transitions take years to show in aggregate numbers\n- Resilience at ${snap.climate.resilience_score.toFixed(3)} (${resDelta > 0 ? "+" : ""}${resDelta.toFixed(3)}) \u2014 infrastructure investments are underway but haven\u2019t hardened the system yet\n- AI influence has grown to ${snap.economy.ai_influence.toFixed(3)} from ${baseline.economy.ai_influence.toFixed(3)} \u2014 the automation wave is just beginning`,
    diverge: `- GINI has moved from ${baseline.economy.gini.toFixed(3)} to ${snap.economy.gini.toFixed(3)} (${giniDelta > 0 ? "+" : ""}${giniDelta.toFixed(3)}) over ${elapsed} years \u2014 ${Math.abs(giniDelta) > 0.03 ? "a structural shift that reflects compounding policy effects" : "the redistribution mechanisms are working but haven\u2019t overcome market concentration forces"}\n- Trust has ${trustDelta > 0.05 ? "strengthened to " + snap.economy.civic_trust.toFixed(3) + " \u2014 institutional legitimacy is building momentum" : trustDelta < -0.03 ? "declined to " + snap.economy.civic_trust.toFixed(3) + " \u2014 public confidence is eroding faster than reform can restore it" : "settled at " + snap.economy.civic_trust.toFixed(3) + " \u2014 neither gaining ground nor losing it"}\n- Emissions have ${emDelta < -5 ? "dropped sharply" : emDelta < -1 ? "declined" : emDelta > 2 ? "continued rising" : "plateaued"} to ${snap.climate.annual_emissions.toFixed(1)} Gt (${pctEmChange > 0 ? "+" : ""}${pctEmChange}%) \u2014 ${Math.abs(pctEmChange) > 20 ? "the energy transition is showing in aggregate data" : "grid-level changes haven\u2019t yet scaled to move the national numbers"}\n- Resilience at ${snap.climate.resilience_score.toFixed(3)} (${resDelta > 0 ? "+" : ""}${resDelta.toFixed(3)}) \u2014 ${resDelta > 0.05 ? "adaptation infrastructure is coming online" : "the system remains fragile against compound shocks"}\n- AI influence at ${snap.economy.ai_influence.toFixed(3)} is now a defining force in the economy \u2014 ${aiGap > 0.15 ? "significantly outpacing governance capacity" : "being absorbed at a manageable pace"}`,
    mature: `- Over ${elapsed} years, GINI has moved from ${baseline.economy.gini.toFixed(3)} to ${snap.economy.gini.toFixed(3)} \u2014 ${giniDelta < -0.03 ? "representing a generational redistribution of economic gains" : giniDelta > 0.05 ? "an entrenchment of inequality that is now self-reinforcing" : "a stalemate between redistributive policy and concentrating market forces"}\n- Trust at ${snap.economy.civic_trust.toFixed(3)} (from ${baseline.economy.civic_trust.toFixed(3)}) \u2014 ${snap.economy.civic_trust > 0.6 ? "institutions have earned legitimacy through decades of performance" : snap.economy.civic_trust > 0.45 ? "a functional but uninspired level of public engagement" : "institutional authority is thin and vulnerable to populist challenge"}\n- Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt (${pctEmChange > 0 ? "+" : ""}${pctEmChange}% from baseline) \u2014 ${snap.climate.annual_emissions < 10 ? "the decarbonization trajectory is clearly established" : snap.climate.annual_emissions < 20 ? "progress is real but the remaining sectors are the hardest to transition" : "decades of inadequate investment have locked in high-emission infrastructure"}\n- Resilience at ${snap.climate.resilience_score.toFixed(3)} now reflects decades of accumulated infrastructure investment or neglect\n- AI at ${snap.economy.ai_influence.toFixed(3)} is deeply embedded in economic and civic life \u2014 governance must now manage a permanent feature, not a transition`,
    legacy: `- The 50-year arc: GINI from ${baseline.economy.gini.toFixed(3)} to ${snap.economy.gini.toFixed(3)} \u2014 ${giniDelta < -0.03 ? "a successful structural redistribution visible across two generations" : giniDelta > 0.05 ? "a half-century of widening inequality that reshaped the social contract" : "a society that held the line without fundamentally changing its structure"}\n- Trust\u2019s journey from ${baseline.economy.civic_trust.toFixed(3)} to ${snap.economy.civic_trust.toFixed(3)} \u2014 ${trustDelta > 0.15 ? "one of the most important outcomes: institutions that people believe in" : trustDelta > 0 ? "modest institutional progress that kept democracy functional" : "a generational erosion of the civic fabric"}\n- Emissions: ${baseline.climate.annual_emissions.toFixed(1)} Gt \u2192 ${snap.climate.annual_emissions.toFixed(1)} Gt (${pctEmChange}%) \u2014 ${snap.climate.annual_emissions < 8 ? "a successful energy transformation" : snap.climate.annual_emissions < 15 ? "significant but incomplete decarbonization" : "a climate trajectory that future generations will inherit as locked-in warming"}\n- Resilience at ${snap.climate.resilience_score.toFixed(3)} (from ${baseline.climate.resilience_score.toFixed(3)}) \u2014 the accumulated result of every infrastructure decision over 50 years\n- AI at ${snap.economy.ai_influence.toFixed(3)} is civilization\u2019s co-pilot \u2014 ${aiGap > 0.2 ? "and the governance gap means it\u2019s flying partially ungoverned" : "and governance has largely kept pace"}`,
  };

  // ── ACTIONS ──
  const actionsNarrative: Record<typeof era, string> = {
    dawn: `- Civic dividends at ${divPct}% of public revenue are being distributed to the first cohort of residents \u2014 administrative systems are still scaling\n- AI governance charter: ${b.ai_charter ? "newly enforced \u2014 the first participatory audits are underway, with open-weight mandates phasing in across high-risk sectors" : "not adopted \u2014 AI deployment is proceeding under existing, inadequate regulatory frameworks"}\n- Climate capex at ${climPct}% is being allocated \u2014 early investments target grid modernization and renewable procurement`,
    diverge: `- ${divPct}% civic dividends are now a ${Number(divPct) >= 5 ? "significant economic force \u2014 millions of residents depend on them for baseline security, reskilling, and entrepreneurship" : "modest but established program \u2014 recipients notice it but it hasn\u2019t changed structural dynamics"}\n- AI charter: ${b.ai_charter ? "maturing through its second revision \u2014 audit coverage has expanded, citizen override mechanisms have been tested in real disputes, and enforcement precedents are being set" : "still absent \u2014 industry self-regulation has produced uneven results and several high-profile failures have eroded public confidence"}\n- ${climPct}% climate capex has built ${Number(climPct) >= 20 ? "a pipeline of renewable projects, storage installations, and grid upgrades that are now delivering measurable emissions reductions" : "some new capacity but not at the pace needed \u2014 fossil infrastructure continues to receive maintenance investment by default"}`,
    mature: `- ${divPct}% dividends have been flowing for ${elapsed} years \u2014 ${Number(divPct) >= 5 ? "they\u2019re now woven into the social fabric, funding reskilling, childcare, elder care, and community investment. A generation has grown up with this floor" : "they remain a supplement rather than a transformation \u2014 helpful but not system-changing"}\n- AI charter: ${b.ai_charter ? "is now settled governance infrastructure, amended twice to address frontier capabilities. Participatory audits are routine. The charter has survived three legal challenges and emerged stronger" : "remains absent. The governance gap has been partially filled by industry standards and litigation, but democratic oversight of AI remains ad hoc"}\n- ${climPct}% climate capex over ${elapsed} years has ${Number(climPct) >= 20 ? "fundamentally rebuilt the energy system \u2014 the last coal plants closed a decade ago, and grid storage exceeds peak demand" : "maintained aging infrastructure while adding some renewable capacity \u2014 the grid is transitioning but slowly"}`,
    legacy: `- ${divPct}% dividends for 50 years: ${Number(divPct) >= 5 ? "one of the defining policy choices of the era. Two generations have been shaped by universal income supplementation. Economic mobility, risk-taking, and civic participation all bear its fingerprint" : "a consistent but modest intervention that softened the sharpest edges of automation-driven disruption without transforming the economy"}\n- AI charter: ${b.ai_charter ? "a foundational document of 21st-century governance. Amended four times, it evolved alongside the technology it governs. Its core principles \u2014 transparency, participation, override authority \u2014 are now constitutional norms in many jurisdictions" : "never enacted. AI governance developed through market forces, litigation, and crisis response. The result is a patchwork that works in some sectors and fails in others"}\n- ${climPct}% climate capex over half a century: ${Number(climPct) >= 20 ? "the cumulative investment reshaped civilization\u2019s energy foundation. The grid is clean, distributed, and resilient" : "cumulative underinvestment that left the energy transition half-finished and locked in avoidable warming"}`,
  };

  // ── EMPLOYMENT ──
  const employMap: Record<typeof era, string> = {
    dawn: `- GINI at ${snap.economy.gini.toFixed(3)} (baseline ${baseline.economy.gini.toFixed(3)}) \u2014 labor markets haven\u2019t restructured yet; most workers are in their pre-automation roles\n- AI influence at ${snap.economy.ai_influence.toFixed(3)} is beginning to affect routine cognitive work \u2014 customer service, data entry, basic analysis jobs are seeing early displacement\n- ${divPct}% dividends are ${Number(divPct) >= 5 ? "providing a cushion for early-displaced workers as reskilling programs spin up" : "too small to meaningfully support workers in transition"}`,
    diverge: `- GINI at ${snap.economy.gini.toFixed(3)} \u2014 ${giniDelta < -0.02 ? "redistributive policies are bending the curve; mid-skill jobs are being replaced but dividends and reskilling are absorbing the shock" : giniDelta > 0.03 ? "automation is concentrating gains faster than redistribution can spread them; the middle class is being hollowed out" : "a tense equilibrium between automation-driven concentration and policy-driven redistribution"}\n- AI at ${snap.economy.ai_influence.toFixed(3)} has reshaped entire industries \u2014 ${snap.economy.ai_influence > 0.4 ? "logistics, professional services, healthcare administration, and creative work have all been transformed" : "the early wave of automation has peaked and the economy is adapting"}\n- The workforce is bifurcating: ${snap.economy.gini < 0.42 ? "but dividend-funded reskilling is keeping the transition manageable" : "those who can work alongside AI thrive, while displaced workers face a narrowing set of options"}`,
    mature: `- GINI at ${snap.economy.gini.toFixed(3)} after ${elapsed} years \u2014 ${snap.economy.gini < 0.38 ? "one of the great achievements of this path: structural inequality has been reversed through sustained redistribution and universal access to AI-augmented work" : snap.economy.gini < 0.42 ? "inequality has been managed but not eliminated; a stable working class exists alongside a growing AI-augmented elite" : "the economy is deeply stratified; AI-owners and AI-workers occupy different worlds with different life trajectories"}\n- AI at ${snap.economy.ai_influence.toFixed(3)} is now the primary engine of production \u2014 human labor has shifted toward care, creativity, governance, and the interpersonal work machines cannot do\n- ${Number(divPct) >= 5 ? "Civic dividends have become the backbone of economic security \u2014 for many, they fund the transition to post-traditional employment" : "Without meaningful redistribution, the AI productivity boom has become an inequality accelerator"}`,
    legacy: `- GINI at ${snap.economy.gini.toFixed(3)} represents the 50-year verdict on whether this civilization shared the gains from automation \u2014 ${snap.economy.gini < 0.37 ? "it did, and the result is a broader prosperity than any previous generation knew" : snap.economy.gini < 0.43 ? "partially, producing a functional but unequal society" : "it did not, producing a neo-feudal economy where AI capital generates wealth that human labor cannot access"}\n- The concept of \u201cemployment\u201d has been redefined \u2014 AI at ${snap.economy.ai_influence.toFixed(3)} handles most production; human work is now about meaning, connection, governance, and care\n- ${Number(divPct) >= 5 ? "Dividends made this transition survivable \u2014 without them, the automation wave would have been a social catastrophe" : "The absence of meaningful redistribution means the transition was survived by the wealthy and endured by everyone else"}`,
  };

  // ── ENERGY ──
  const energyMap: Record<typeof era, string> = {
    dawn: `- Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt (${pctEmChange > 0 ? "+" : ""}${pctEmChange}% vs baseline) \u2014 energy infrastructure has multi-decade momentum; early capex decisions are being made but haven\u2019t hit aggregate numbers yet\n- ${climPct}% climate capex is ${Number(climPct) >= 20 ? "funding the first major wave of grid-scale solar, wind, and storage projects" : "maintaining existing infrastructure with modest additions"}\n- Resilience at ${snap.climate.resilience_score.toFixed(3)} \u2014 the grid is essentially unchanged from baseline; adaptation is a future project`,
    diverge: `- Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt (${pctEmChange > 0 ? "+" : ""}${pctEmChange}%) \u2014 ${snap.climate.annual_emissions < 25 ? "the investments from the first decade are now delivering measurable reductions; renewable capacity is displacing fossil baseload" : "despite some investment, emissions remain stubbornly high as demand growth offsets efficiency gains"}\n- ${climPct}% climate capex over ${elapsed} years has ${Number(climPct) >= 20 ? "built significant renewable capacity and begun the grid storage buildout" : "been insufficient to replace retiring fossil plants at the pace needed"}\n- Resilience at ${snap.climate.resilience_score.toFixed(3)} \u2014 ${resDelta > 0.05 ? "distributed energy, early-warning systems, and hardened infrastructure are reducing vulnerability" : "the grid remains fragile against extreme weather events, which are increasing in frequency"}`,
    mature: `- Emissions at ${snap.climate.annual_emissions.toFixed(1)} Gt (${pctEmChange > 0 ? "+" : ""}${pctEmChange}% from baseline) \u2014 ${snap.climate.annual_emissions < 10 ? "deep decarbonization is underway; the remaining emissions come from hard-to-abate sectors like heavy industry, aviation, and agriculture" : snap.climate.annual_emissions < 20 ? "the first wave of the transition is complete but a long tail of emissions remains" : "decades of underinvestment have left a fossil-dependent grid that is now extremely expensive to replace"}\n- ${climPct}% capex over ${elapsed} years: ${Number(climPct) >= 20 ? "cumulative investment has fundamentally changed the energy landscape \u2014 battery storage exceeds 1 TWh, solar provides 40%+ of generation" : "the grid has improved incrementally but structural dependence on fossil fuels persists"}\n- Resilience at ${snap.climate.resilience_score.toFixed(3)} now reflects real-world performance against ${elapsed} years of increasing climate stress`,
    legacy: `- Emissions\u2019 50-year arc: ${baseline.climate.annual_emissions.toFixed(1)} Gt \u2192 ${snap.climate.annual_emissions.toFixed(1)} Gt (${pctEmChange}%) \u2014 ${snap.climate.annual_emissions < 8 ? "a civilizational achievement. The energy transition is functionally complete" : snap.climate.annual_emissions < 15 ? "substantial progress, but the remaining emissions represent locked-in warming that will affect the next century" : "a generational failure. The window for a managed transition closed decades ago"}\n- ${climPct}% capex compounded across 50 years: ${Number(climPct) >= 20 ? "among the most consequential investment decisions of the century. Clean energy now powers virtually everything" : "a case study in chronic underinvestment. Every decade of delay doubled the transition cost"}\n- Resilience at ${snap.climate.resilience_score.toFixed(3)} \u2014 ${snap.climate.resilience_score > 0.45 ? "the grid, infrastructure, and communities have been hardened against the climate that was locked in" : "infrastructure fragility is now a permanent condition, requiring perpetual emergency spending"}`,
  };

  // ── POLITICAL ──
  const politicalMap: Record<typeof era, string> = {
    dawn: `- Trust at ${snap.economy.civic_trust.toFixed(3)} (from ${baseline.economy.civic_trust.toFixed(3)}) \u2014 early policy announcements are generating ${trustDelta > 0.01 ? "cautious optimism; the public is watching to see if promises become programs" : "skepticism; rhetoric hasn\u2019t translated to visible change in most people\u2019s lives"}\n- ${b.ai_charter ? "The AI charter\u2019s passage was politically contentious but its enforcement has begun building credibility with early adopters and civil society" : "Without an AI charter, governance is reactive \u2014 regulating by crisis rather than by design"}\n- Political coalitions are still forming around the new policy landscape; the ${elapsed <= 3 ? "first elections under these policies haven\u2019t happened yet" : "early electoral feedback is shaping which reforms survive"}`,
    diverge: `- Trust at ${snap.economy.civic_trust.toFixed(3)} after ${elapsed} years \u2014 ${snap.economy.civic_trust > 0.55 ? "rising. The combination of tangible economic benefits and institutional transparency is generating a positive feedback loop" : snap.economy.civic_trust > 0.45 ? "stable but shallow. People cooperate out of necessity more than conviction" : "declining. Reform fatigue, unmet expectations, and information asymmetry are corroding public confidence"}\n- ${b.ai_charter ? "The charter has survived its first major political test and is being cited as model governance by international observers" : "Attempts to pass AI regulation have been blocked three times. Industry lobbying and political fragmentation prevent consensus"}\n- Polarization is ${snap.economy.civic_trust > 0.5 ? "being contained by shared economic infrastructure \u2014 dividends and public services create common stakes" : "intensifying as economic and informational divides deepen \u2014 different populations live in different factual universes"}`,
    mature: `- Trust at ${snap.economy.civic_trust.toFixed(3)} reflects ${elapsed} years of institutional performance \u2014 ${snap.economy.civic_trust > 0.6 ? "a mature democratic society where citizens engage because they\u2019ve seen their input matter" : snap.economy.civic_trust > 0.45 ? "functional governance that most people tolerate without enthusiasm" : "a legitimacy crisis decades in the making \u2014 low trust is now self-perpetuating as the most capable citizens disengage"}\n- ${b.ai_charter ? "The charter has become foundational law \u2014 as embedded as constitutional rights, shaping a generation\u2019s expectations of technology governance" : "The governance gap has been partially filled by corporate self-regulation and judicial intervention, but democratic control of AI remains absent"}\n- The political landscape is ${snap.economy.civic_trust > 0.55 ? "stable enough to tackle long-horizon challenges \u2014 climate adaptation, interplanetary governance, AI rights" : "consumed by short-term crises and unable to address structural challenges that require multi-decade coordination"}`,
    legacy: `- Trust\u2019s 50-year trajectory from ${baseline.economy.civic_trust.toFixed(3)} to ${snap.economy.civic_trust.toFixed(3)} is ${trustDelta > 0.15 ? "the defining success story of this path \u2014 proof that institutions can earn legitimacy through sustained performance and genuine participation" : trustDelta > 0 ? "a modest but vital accomplishment \u2014 democratic governance survived the automation age" : "a warning: half a century of institutional neglect has produced a society that can no longer coordinate on shared challenges"}\n- ${b.ai_charter ? "The AI charter, now 50 years old, is studied as one of the most important governance innovations of the century" : "The absence of structured AI governance is now cited as one of the great institutional failures of the era"}\n- The political system\u2019s capacity to handle the challenges of the 2080s depends entirely on the trust reserves built (or depleted) over these 50 years`,
  };

  // ── AI INFLUENCE ──
  const aiMap: Record<typeof era, string> = {
    dawn: `- AI influence at ${snap.economy.ai_influence.toFixed(3)} (from ${baseline.economy.ai_influence.toFixed(3)}) \u2014 generative AI and automation are disrupting their first sectors; the full impact is years away\n- ${b.ai_charter ? "The charter is establishing governance norms before AI reaches critical mass \u2014 a rare case of proactive regulation" : "No governance framework is in place; AI deployment is being driven entirely by market incentives"}\n- The governance gap (AI ${snap.economy.ai_influence.toFixed(3)} vs trust ${snap.economy.civic_trust.toFixed(3)}) is ${aiGap > 0.1 ? "already visible \u2014 automation is moving faster than institutions" : "manageable at current AI levels, but will widen as adoption accelerates"}`,
    diverge: `- AI at ${snap.economy.ai_influence.toFixed(3)} is now deeply integrated into ${snap.economy.ai_influence > 0.5 ? "healthcare, legal systems, infrastructure management, creative industries, and military applications" : "commercial operations, content generation, and logistics \u2014 the next wave will hit professional services and governance"}\n- ${b.ai_charter ? "Charter enforcement is being tested by frontier capabilities. The auditing regime is adapting, but each generation of AI requires updated oversight. The participatory model is holding" : "Without a charter, each new AI capability creates a governance vacuum that is filled by whoever deploys first. Bias, opacity, and unaccountable decision-making are becoming normalized"}\n- The AI\u2013trust gap at ${aiGap.toFixed(3)} ${aiGap > 0.2 ? "is the single most dangerous structural metric in this scenario \u2014 democratic institutions are losing their ability to oversee the systems that shape daily life" : aiGap > 0.1 ? "is widening and needs policy attention before it becomes self-reinforcing" : "is being managed \u2014 governance is evolving roughly in pace with deployment"}`,
    mature: `- AI at ${snap.economy.ai_influence.toFixed(3)} is no longer a \u201ctechnology sector\u201d \u2014 it is the substrate of the economy, governance, healthcare, education, and communication\n- ${b.ai_charter ? "The charter framework has proven its value across ${elapsed} years of escalating capability. Its most important feature wasn\u2019t any specific rule but the participatory culture it created \u2014 citizens expect to have oversight of systems that affect them" : "Decades without structured governance have produced a fragmented landscape. Some companies self-regulate well; others don\u2019t. There is no public recourse when AI-driven decisions cause harm at scale"}\n- The governance gap (${aiGap.toFixed(3)}) ${aiGap > 0.25 ? "has become a permanent feature of this society \u2014 AI effectively governs aspects of life that democratic institutions cannot reach" : aiGap > 0.1 ? "remains a structural tension that each generation of AI re-opens" : "has been kept narrow enough for democratic governance to function alongside ubiquitous AI"}`,
    legacy: `- AI\u2019s 50-year arc: from ${baseline.economy.ai_influence.toFixed(3)} to ${snap.economy.ai_influence.toFixed(3)}. It went from a tool to a co-architect of civilization. Every institution, market, and relationship has been reshaped by it\n- ${b.ai_charter ? "The charter\u2019s greatest legacy is cultural: a society that treats AI governance as a civic right, not a technical concern. The auditing, participation, and override norms it established are now instinctive" : "The absence of a charter produced a society where AI is powerful, ubiquitous, and democratically unaccountable. It works well for those it was optimized for. For everyone else, it is an opaque force"}\n- The final AI\u2013trust gap of ${aiGap.toFixed(3)} ${aiGap > 0.2 ? "is the single metric that most defines this civilization\u2019s failure mode \u2014 immense capability without commensurate accountability" : "reflects a civilization that managed to govern its most powerful technology \u2014 imperfectly, but well enough to retain democratic agency"}`,
  };

  // ── NEXT STEPS ──
  const nextMap: Record<typeof era, string> = {
    dawn: sid === "aggressive" || sid === "moderate"
      ? `- Stay the course through the initial lag period \u2014 structural reforms take 5\u201310 years to show in aggregate metrics\n- Invest in public communication: citizens need to understand why scores are low early and why the trajectory matters more than the snapshot\n- Begin building the institutional capacity (auditors, reskilling infrastructure, grid operators) that will be needed when the reforms start compounding\n- ${!b.ai_charter ? "The single highest-leverage intervention not yet taken: adopt an AI governance charter before deployment scales further" : "Expand charter coverage to the next tier of AI systems while the framework is still new and adaptable"}`
      : `- The window for foundational reform is still open \u2014 every year of delay narrows it\n- ${!b.ai_charter ? "Adopt an AI governance charter immediately \u2014 each year without one allows ungoverned deployment to become the norm" : "Expand charter enforcement aggressively while political will exists"}\n- ${Number(divPct) < 5 ? "Increase civic dividends to at least 5% \u2014 the current level is too low to be felt by recipients and too low to change behavior" : "Maintain dividend levels and improve distribution infrastructure"}\n- ${Number(climPct) < 20 ? "Raise climate capex before infrastructure lock-in makes the transition dramatically more expensive" : "Accelerate renewable procurement to capitalize on early cost curves"}`,
    diverge: sid === "aggressive" || sid === "moderate"
      ? `- The reforms are working but the compounding phase is fragile \u2014 maintain political commitment through the next electoral cycle\n- Address emerging second-order effects: housing pressure from dividend-driven demand, skilled labor shortages in transition sectors, AI capability jumps that outpace audit frameworks\n- Begin international coordination \u2014 this scenario\u2019s domestic gains are vulnerable to global emissions, migration pressure, and regulatory arbitrage\n- ${score && score.total < 60 ? "The score reflects structural drag from pre-reform infrastructure \u2014 the trajectory is more important than the current number" : "The compounding is visible \u2014 document and publicize what\u2019s working to build political resilience for the next decade"}`
      : `- The cost of further delay is now quantifiable \u2014 every year without structural reform widens the gap with the aggressive scenario\n- ${!b.ai_charter ? "The governance gap is becoming self-reinforcing. An AI charter adopted now will be harder to enforce than one adopted at the start, but still far more effective than continued inaction" : "Push charter enforcement into the sectors where AI is causing the most displacement and opacity"}\n- ${snap.climate.annual_emissions > 20 ? "Emissions trajectory is approaching the point where 1.5\u00b0C is mathematically unreachable \u2014 climate capex must increase now or accept locked-in warming" : "Continue the emissions reduction trajectory but prepare for the hard-to-abate sectors that will dominate the next phase"}\n- Rebuild trust through visible, rapid-feedback mechanisms: participatory budgeting, public dashboards, civic lotteries`,
    mature: sid === "aggressive"
      ? `- The system is working \u2014 the challenge now is preventing complacency and adapting to challenges the original reforms weren\u2019t designed for\n- Prepare for the next frontier: AI sentience and rights questions, post-scarcity economics, interplanetary governance, and the social effects of radical life extension\n- Export the model \u2014 other regions and nations are watching this path and need technical assistance to replicate it\n- Invest in cultural and artistic infrastructure \u2014 material conditions are strong but meaning, purpose, and community need active cultivation`
      : sid === "moderate"
      ? `- The moderate path has proven viable but is now bumping against its structural limits \u2014 the question is whether to intensify reform or accept the plateau\n- The hardest challenges remain: finishing the energy transition, closing the AI governance gap, and building trust beyond functional levels\n- Consider whether the political capital exists to move from moderate to aggressive on specific levers (dividends, charter scope, climate capex)\n- Invest in the social infrastructure (mental health, community, purpose) that economic metrics don\u2019t capture but that citizens feel acutely`
      : `- At this stage, the structural damage is partially irreversible \u2014 but \u201cpartially\u201d still means action matters\n- ${!b.ai_charter ? "An AI charter adopted now will govern the next 20 years of deployment \u2014 late is far better than never" : "Charter enforcement must be dramatically strengthened to address the accumulated governance debt"}\n- Focus on adaptation alongside mitigation: the emissions already locked in will produce climate impacts that require resilient infrastructure\n- Rebuild institutional trust from the local level up \u2014 national-scale trust won\u2019t return without demonstrated competence at community scale`,
    legacy: sid === "aggressive"
      ? `- This path has produced a measurably better civilization \u2014 but the work never ends. The challenges of the 2080s will be different from those of the 2020s\n- Preserve and strengthen the institutions (charter, dividends, participatory governance) that made this trajectory possible \u2014 they are not self-sustaining\n- The greatest risk now is complacency: assuming that the systems that solved the last century\u2019s problems will automatically solve the next century\u2019s\n- Pass the toolbox forward: document, open-source, and teach the governance, economic, and technical approaches that worked`
      : sid === "moderate"
      ? `- Moderate Reform produced a decent future \u2014 better than inaction, short of the possible. The question for the next generation is whether to finish what this one started\n- The institutions are functional but uninspired \u2014 they need revitalization to handle the challenges ahead\n- The unfinished energy transition and residual inequality are debts this generation is passing forward \u2014 acknowledge them honestly\n- The path was viable. Whether it was enough is a question only the next 50 years will answer`
      : `- It is ${yr}. The damage from 50 years of inadequate structural reform is now the baseline that the next generation inherits\n- The metrics cannot be reversed quickly: trust, inequality, and emissions have momentum that takes decades to redirect\n- If reform begins now \u2014 with the urgency that should have been applied 50 years ago \u2014 the 2126 report could tell a different story\n- The simulation\u2019s most important lesson: the cost of delay is not linear. Every decade of inaction doubled the difficulty and halved the options`,
  };

  return `## Summary\n${summaryTone}${worstComparison}\n\n## Baseline Comparison\n${baselineNarrative[era]}\n\n## Actions\n${actionsNarrative[era]}\n\n## Employment, Economy & The Wealth Gap\n${employMap[era]}\n\n## Energy Sources & Data Infrastructure\n${energyMap[era]}\n\n## The Political Climate\n${politicalMap[era]}\n\n## AI Influence\n${aiMap[era]}\n\n## Next Steps\n${nextMap[era]}`;
}

/* ---- Lab notes localStorage helpers ---- */
const LAB_NOTES_KEY = "simulation-lab-notes-v2";

function loadLabNotes(): LabNote[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LAB_NOTES_KEY) || "[]"); } catch { return []; }
}

function saveLabNotes(notes: LabNote[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAB_NOTES_KEY, JSON.stringify(notes));
}

function exportSnapshotMarkdown(note: LabNote): string {
  return `# Lab Note: ${note.title}

> ${note.annotation || "No annotation."}

**Date saved:** ${new Date(note.timestamp).toLocaleString()}
**Scenario:** ${note.scenarioName}
**Year:** ${note.year}
**Trajectory score:** ${note.compositeScore}/100 (${note.rating})

## Metrics

| Metric | Value |
|--------|-------|
| GINI Index | ${note.metrics.gini.toFixed(3)} |
| Civic Trust | ${note.metrics.civic_trust.toFixed(3)} |
| Annual Emissions | ${note.metrics.annual_emissions.toFixed(2)} Gt |
| Resilience | ${note.metrics.resilience_score.toFixed(3)} |
| AI Influence | ${note.metrics.ai_influence.toFixed(3)} |

## Report

${note.summary || "*No report for this snapshot.*"}
`;
}

function downloadFile(filename: string, content: string, type = "text/markdown") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [data, setData] = useState<SeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState("aggressive");
  const [yearIndex, setYearIndex] = useState(0);
  const sliderRef = useRef<HTMLInputElement>(null);

  const [labNotes, setLabNotes] = useState<LabNote[]>([]);
  const [labNotesOpen, setLabNotesOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteAnnotation, setNoteAnnotation] = useState("");
  const [compareBranch, setCompareBranch] = useState<string | null>(null);

  useEffect(() => { setLabNotes(loadLabNotes()); }, []);

  useEffect(() => {
    fetch("/data/simulation.json")
      .then((r) => r.json())
      .then((d: SeedData) => setData(d))
      .catch(() => setError("Failed to load simulation data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const block = (e: WheelEvent) => { e.preventDefault(); el.blur(); };
    el.addEventListener("wheel", block, { passive: false });
    return () => el.removeEventListener("wheel", block);
  }, []);

  useEffect(() => {
    if (!data) return;
    const sc = data.scenarios.find(s => s.id === activeScenario);
    if (sc) setYearIndex(prev => Math.min(prev, Math.max(0, sc.trajectory.length - 1)));
  }, [activeScenario, data]);

  const scenario = useMemo(() => data?.scenarios.find(s => s.id === activeScenario) ?? null, [data, activeScenario]);
  const trajectory = scenario?.trajectory ?? [];
  const selectedState = trajectory[yearIndex] as SnapshotState | undefined;
  const baselineState = useMemo(() => data?.scenarios[0]?.trajectory?.[0] ?? null, [data]);
  const worstScenario = useMemo(() => data?.scenarios.find(s => s.id === "worst") ?? null, [data]);

  const compositeScore = useMemo(() => computeCompositeScore(selectedState, baselineState), [selectedState, baselineState]);

  const timelineData = useMemo(() => {
    return trajectory.map((snap: SnapshotState) => ({
      year: snap.year, gini: snap.economy.gini, civic_trust: snap.economy.civic_trust,
      annual_emissions: snap.climate.annual_emissions, resilience_score: snap.climate.resilience_score,
      ai_influence: snap.economy.ai_influence,
    }));
  }, [trajectory]);

  const summary = useMemo(() => {
    if (!scenario || !selectedState || !baselineState) return "";
    const worstSnap = worstScenario && activeScenario !== "worst" ? worstScenario.trajectory[yearIndex] : undefined;
    return generateReport(scenario, selectedState, baselineState as SnapshotState, worstSnap);
  }, [scenario, selectedState, baselineState, worstScenario, yearIndex, activeScenario]);

  const deltaCards = useMemo(() => {
    if (!selectedState || !baselineState) return [];
    const metrics = ["gini", "civic_trust", "annual_emissions", "resilience_score", "ai_influence"] as const;
    return metrics.map((key) => {
      const current = getMetricValue(selectedState, key);
      const baseline = getMetricValue(baselineState as SnapshotState, key);
      const delta = current - baseline;
      const dir = METRIC_GOOD_DIR[key];
      const good = dir === "up" ? delta >= 0 : dir === "down" ? delta <= 0 : Math.abs(delta) < 0.05;
      return { key, label: METRIC_LABELS[key], current, baseline, delta, good, color: METRIC_COLORS[key] };
    });
  }, [selectedState, baselineState]);

  const overlayData = useMemo(() => {
    if (!compareBranch || !scenario || !data) return null;
    const runB = data.scenarios.find(s => s.id === compareBranch);
    if (!runB) return null;
    const maxLen = Math.max(scenario.trajectory.length, runB.trajectory.length);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      const a = scenario.trajectory[i];
      const b = runB.trajectory[i];
      result.push({
        year: a?.year ?? b?.year ?? 2027 + i,
        a_gini: a?.economy.gini, b_gini: b?.economy.gini,
        a_trust: a?.economy.civic_trust, b_trust: b?.economy.civic_trust,
        a_emissions: a?.climate.annual_emissions, b_emissions: b?.climate.annual_emissions,
        a_resilience: a?.climate.resilience_score, b_resilience: b?.climate.resilience_score,
        a_ai: a?.economy.ai_influence, b_ai: b?.economy.ai_influence,
      });
    }
    return result;
  }, [compareBranch, scenario, data]);

  const handleYearChange = (value: number) => {
    setYearIndex(Math.max(0, Math.min(Math.max(0, trajectory.length - 1), value)));
  };

  const handleSaveNote = useCallback(() => {
    if (!selectedState || !compositeScore || !scenario) return;
    const note: LabNote = {
      id: crypto.randomUUID(),
      title: noteTitle || `${scenario.name} \u2014 Year ${selectedState.year}`,
      annotation: noteAnnotation,
      timestamp: new Date().toISOString(),
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      yearIndex,
      year: selectedState.year,
      metrics: {
        gini: selectedState.economy.gini, civic_trust: selectedState.economy.civic_trust,
        annual_emissions: selectedState.climate.annual_emissions, resilience_score: selectedState.climate.resilience_score,
        ai_influence: selectedState.economy.ai_influence,
      },
      compositeScore: compositeScore.total,
      rating: compositeScore.rating,
      summary,
    };
    const updated = [note, ...labNotes];
    setLabNotes(updated);
    saveLabNotes(updated);
    setSaveDialogOpen(false);
    setNoteTitle("");
    setNoteAnnotation("");
  }, [selectedState, compositeScore, scenario, yearIndex, summary, noteTitle, noteAnnotation, labNotes]);

  const handleDeleteNote = useCallback((id: string) => {
    const updated = labNotes.filter((n) => n.id !== id);
    setLabNotes(updated);
    saveLabNotes(updated);
  }, [labNotes]);

  const handleRestoreNote = useCallback((note: LabNote) => {
    if (data?.scenarios.find(s => s.id === note.scenarioId)) {
      setActiveScenario(note.scenarioId);
      setTimeout(() => setYearIndex(note.yearIndex), 50);
    }
    setLabNotesOpen(false);
  }, [data]);

  const handleExport = useCallback(() => {
    if (!selectedState || !compositeScore || !scenario) return;
    const note: LabNote = {
      id: "", title: `${scenario.name} \u2014 Year ${selectedState.year}`,
      annotation: "", timestamp: new Date().toISOString(), scenarioId: scenario.id,
      scenarioName: scenario.name, yearIndex, year: selectedState.year,
      metrics: { gini: selectedState.economy.gini, civic_trust: selectedState.economy.civic_trust, annual_emissions: selectedState.climate.annual_emissions, resilience_score: selectedState.climate.resilience_score, ai_influence: selectedState.economy.ai_influence },
      compositeScore: compositeScore.total, rating: compositeScore.rating, summary,
    };
    downloadFile(`snapshot-${scenario.id}-year${selectedState.year}.md`, exportSnapshotMarkdown(note));
  }, [selectedState, compositeScore, scenario, yearIndex, summary]);

  const s = scenario;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[40%] left-1/2 h-[80vw] w-[80vw] -translate-x-1/2 rounded-full bg-sky-500/[0.04] blur-[120px]" />
        <div className="absolute -bottom-[30%] right-0 h-[60vw] w-[60vw] rounded-full bg-violet-500/[0.03] blur-[100px]" />
      </div>

      {/* ---- Lab notes slide-over panel ---- */}
      {labNotesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setLabNotesOpen(false)} />
          <div className="relative w-full max-w-md overflow-y-auto bg-slate-900 border-l border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Saved Lab Notes</h2>
              <button onClick={() => setLabNotesOpen(false)} className="text-slate-400 hover:text-white text-xl">&times;</button>
            </div>
            {labNotes.length === 0 && <p className="text-sm text-slate-500">No saved notes yet. Use &ldquo;Save to lab notes&rdquo; from the timeline scrubber.</p>}
            <div className="space-y-3">
              {labNotes.map((note) => (
                <div key={note.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{note.title}</p>
                      <p className="text-xs text-slate-500">{note.scenarioName} &middot; {note.year}</p>
                      <p className="text-xs text-slate-500">{new Date(note.timestamp).toLocaleDateString()}</p>
                      {note.annotation && <p className="mt-1 text-xs text-slate-400 italic">{note.annotation}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-white">{note.compositeScore}</p>
                      <p className="text-[10px] text-slate-500">{note.rating}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleRestoreNote(note)} className="rounded-lg bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20">Restore</button>
                    <button onClick={() => { const md = exportSnapshotMarkdown(note); downloadFile(`note-${note.id.slice(0, 8)}.md`, md); }} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10">Export .md</button>
                    <button onClick={() => handleDeleteNote(note.id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- Save note dialog ---- */}
      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSaveDialogOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h3 className="text-base font-bold text-white">Save Lab Note</h3>
            <p className="mt-1 text-xs text-slate-500">{scenario?.name} &middot; Year {selectedState?.year}</p>
            <input type="text" placeholder="Title (optional)" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none" />
            <textarea placeholder="Annotation / observations (optional)" value={noteAnnotation} onChange={(e) => setNoteAnnotation(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none resize-none" />
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setSaveDialogOpen(false)} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">Cancel</button>
              <button onClick={handleSaveNote} className="rounded-lg bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 ring-1 ring-sky-500/20 hover:bg-sky-500/20">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="pt-10 pb-8 px-4" style={{ background: "linear-gradient(180deg,rgba(56,189,248,0.06) 0%,transparent 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.4em] mb-2" style={{ color: "var(--sky)" }}>Simulation</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Future Simulation Toolkit</h1>
          <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
            Four scenarios across a 50-year horizon. Each varies policy levers &mdash; civic dividends, governance charters, climate investment &mdash;
            and tracks five structural metrics to reveal which choices matter most.
          </p>
        </div>
      </header>
      <nav className="site-nav">
        <div className="header-links">
          <a href="/" className="header-link header-link--gray">Home</a>
          <a href="/climate" className="header-link header-link--teal">{"\u{1F331}"} ClimateOS</a>
          <a href="/simulation" className="header-link header-link--sky active">{"\u{1F52C}"} Simulation</a>
          <a href="/transition" className="header-link header-link--sky">{"\u{1F6E0}\uFE0F"} TransitionOS</a>
          <a href="/civilization" className="header-link header-link--amber">{"\u{1F30D}"} CivilizationOS</a>
          <a href="/governance" className="header-link header-link--violet">{"\u{1F3DB}\uFE0F"} GovernanceOS</a>
          <a href="/strategy" className="header-link header-link--amber">{"\u2699\uFE0F"} StrategyOS</a>
          <a href="/research" className="header-link header-link--violet">{"\u{1F4DC}"} Research</a>
          <a href="/blog" className="header-link header-link--gray">{"\u{1F4DD}"} Blog</a>
          <button onClick={() => setLabNotesOpen(true)} className="header-link header-link--sky" style={{ cursor: "pointer" }}>{"\u{1F4DD}"} Lab Notes{labNotes.length > 0 ? ` (${labNotes.length})` : ""}</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8">

        {/* ── TODAY'S CIVILIZATION SCORE ── */}
        {data && (() => {
          const bl = data.scenarios[0]?.trajectory?.[0];
          if (!bl) return null;
          const baselineScore = computeCompositeScore(bl, bl);
          const bestFinal = data.scenarios.find(sc => sc.id === "aggressive")?.trajectory.slice(-1)[0];
          const worstFinal = data.scenarios.find(sc => sc.id === "worst")?.trajectory.slice(-1)[0];
          const bestScore = bestFinal ? computeCompositeScore(bestFinal, bl) : null;
          const worstScore = worstFinal ? computeCompositeScore(worstFinal, bl) : null;
          const letterGrade = (sc: number) => sc >= 93 ? "A" : sc >= 85 ? "A-" : sc >= 80 ? "B+" : sc >= 73 ? "B" : sc >= 68 ? "B-" : sc >= 63 ? "C+" : sc >= 58 ? "C" : sc >= 53 ? "C-" : sc >= 48 ? "D+" : sc >= 43 ? "D" : sc >= 38 ? "D-" : "F";
          const gColor = (sc: number) => sc >= 73 ? "#10b981" : sc >= 53 ? "#f59e0b" : sc >= 38 ? "#fb923c" : "#f43f5e";
          if (!baselineScore) return null;
          return (
            <section className="mt-12">
              <SectionHeading badge="Baseline" title="Today's Civilization Score" subtitle="Where we stand at the start of the simulation (2026 baseline). This is the starting point every scenario inherits." />
              <div className="mt-6 glass-card rounded-2xl p-6" style={{ borderTop: `3px solid ${gColor(baselineScore.total)}` }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                  <div className="relative w-28 h-28 flex-shrink-0 mx-auto sm:mx-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={gColor(baselineScore.total)} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${baselineScore.total * 2.64} 264`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold" style={{ color: gColor(baselineScore.total), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(baselineScore.total)}</span>
                      <span className="text-[10px] text-slate-500">{baselineScore.total}/100</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-white mb-1">{baselineScore.rating}</p>
                    <p className="text-xs text-slate-400 mb-3">Composite score across equality, civic trust, resilience, decarbonization, and AI governance. This is the inherited starting position for all four scenarios.</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {bestScore && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${gColor(bestScore.total)}22`, color: gColor(bestScore.total), border: `1px solid ${gColor(bestScore.total)}44` }}>Aggressive 2076: {letterGrade(bestScore.total)} ({bestScore.total}/100)</span>}
                      {worstScore && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${gColor(worstScore.total)}22`, color: gColor(worstScore.total), border: `1px solid ${gColor(worstScore.total)}44` }}>Worst case 2076: {letterGrade(worstScore.total)} ({worstScore.total}/100)</span>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {baselineScore.components.map(c => (
                    <div key={c.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                      <p className="text-xs font-semibold text-white">{c.label}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: c.color, fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(c.score)}</p>
                      <p className="text-[10px] text-slate-500">{c.score}/100</p>
                      <p className="text-[9px] mt-1 text-slate-500 leading-tight">{c.explanation.split(" \u2014 ")[1] || c.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* INSIGHTS */}
        <section className="mt-16">
          <SectionHeading badge="Insights" title="What the simulations teach immediately" subtitle="Five patterns that emerge across every run, no matter how the dice land." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_INSIGHTS.map((insight) => (
              <article key={insight.title} className="glass-card group rounded-2xl p-5 transition-all hover:border-white/20 hover:bg-white/[0.07]">
                <span className="text-2xl">{insight.icon}</span>
                <h3 className="mt-3 text-sm font-semibold text-white">{insight.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{insight.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* THREE THROUGH-LINES */}
        <section className="mt-16">
          <SectionHeading badge="Through-lines" title="Three things that never leave the best futures" subtitle="After looping through enough runs, these ingredients consistently show up in every future we'd actually want to inhabit." />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {THREE_THROUGH_LINES.map((line) => (
              <article key={line.title} className={`relative overflow-hidden rounded-2xl border ${line.border} bg-gradient-to-b ${line.accent} p-6`}>
                <div className={`mb-4 h-2 w-2 rounded-full ${line.dot}`} />
                <h3 className="text-base font-semibold text-white">{line.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{line.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* THREE DARK LINES */}
        <section className="mt-10">
          <SectionHeading badge="Warnings" title="Three things that never leave the worst futures" subtitle="The same runs that reveal the best ingredients also expose what poisons every timeline they touch." />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {THREE_DARK_LINES.map((line) => (
              <article key={line.title} className={`relative overflow-hidden rounded-2xl border ${line.border} bg-gradient-to-b ${line.accent} p-6`}>
                <div className={`mb-4 h-2 w-2 rounded-full ${line.dot}`} />
                <h3 className="text-base font-semibold text-white">{line.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{line.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* NOTABLE RUNS */}
        <section className="mt-16">
          <SectionHeading badge="Lab notes" title="Running it again (and again)" subtitle="Each replay becomes a lab note. The point isn't to pick the 'best' sim \u2014 it's to observe which ingredients consistently show up." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {NOTABLE_RUNS.map((run) => (
              <article key={run.run} className="glass-card rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-sky-400">{run.run}</p>
                <p className="mt-2 text-sm text-slate-300">{run.desc}</p>
                <p className="mt-2 text-sm font-medium text-white">{run.result}</p>
              </article>
            ))}
          </div>
        </section>

        {/* LOADING / ERROR */}
        {loading && <div className="mt-16 flex items-center gap-3 text-slate-400"><div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />Loading simulation data&hellip;</div>}
        {error && <p className="mt-16 text-red-400">{error}</p>}

        {/* ============================================================ */}
        {/*  SCENARIO EXPLORER                                            */}
        {/* ============================================================ */}
        {!loading && data && data.scenarios.length > 0 && (
          <>
            <section className="mt-16">
              <SectionHeading badge="Explorer" title="Interactive scenario timeline" subtitle="Each scenario represents a different policy mix. Select one, then scrub through 50 years to see how the metrics evolve. Reports are generated automatically for every year." />

              {/* Scenario selector */}
              <div className="mt-8 mb-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a simulation scenario</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to update all charts, metrics, and reports below.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.scenarios.map(sc => (
                    <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                      <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sc.icon}</span><span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.name}</span></div>
                      <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>{sc.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        <span>Div {(sc.branch.civic_dividend_rate * 100).toFixed(0)}%</span>
                        <span>Charter {sc.branch.ai_charter ? "ON" : "OFF"}</span>
                        <span>Climate {(sc.branch.climate_capex_share * 100).toFixed(0)}%</span>
                      </div>
                      {activeScenario === sc.id && <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline charts */}
              {timelineData.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">Metric trajectories over 50 years</h3>
                    <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: s?.color ?? "#38bdf8" }} />Year {selectedState?.year ?? ""}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {([
                      { key: "gini", label: "GINI Index", desc: "Lower is more equal" },
                      { key: "civic_trust", label: "Civic Trust", desc: "Higher is better" },
                      { key: "annual_emissions", label: "Emissions (Gt CO\u2082)", desc: "Lower is better" },
                      { key: "resilience_score", label: "Resilience", desc: "Higher is better" },
                      { key: "ai_influence", label: "AI Influence", desc: "Stability matters" },
                    ] as const).map((metric) => (
                      <TimelineMiniChart key={metric.key} data={timelineData} dataKey={metric.key} label={metric.label} description={metric.desc} color={METRIC_COLORS[metric.key]} currentYear={selectedState?.year} />
                    ))}
                  </div>
                </div>
              )}

              {/* Year scrubber */}
              <div className="mt-6 glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Scrub timeline</span>
                  <span className="font-mono text-lg font-semibold text-white">{selectedState?.year ?? "\u2014"}</span>
                </div>
                <input ref={sliderRef} type="range" min={0} max={Math.max(0, trajectory.length - 1)} value={yearIndex} onChange={(e) => handleYearChange(Number(e.target.value))} className="timeline-slider mt-3 w-full" />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{trajectory[0]?.year ?? ""}</span>
                  <span>{trajectory[trajectory.length - 1]?.year ?? ""}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
                  <button onClick={() => setSaveDialogOpen(true)} disabled={!selectedState || !compositeScore} className="rounded-full bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/20 transition hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    Save to lab notes
                  </button>
                  <button onClick={handleExport} disabled={!selectedState || !compositeScore} className="rounded-full bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                    Export .md
                  </button>
                </div>
              </div>

              {/* Report */}
              {summary && s && (
                <div className="mt-6 glass-card rounded-2xl p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-xs font-bold text-white">{s.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full ring-1" style={{ color: s.color, background: `${s.color}15`, borderColor: `${s.color}33` }}>
                      Div {(s.branch.civic_dividend_rate * 100).toFixed(0)}% &middot; Charter {s.branch.ai_charter ? "ON" : "OFF"} &middot; Climate {(s.branch.climate_capex_share * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto">Year {selectedState?.year ?? "\u2014"}</span>
                  </div>
                  <SummaryBlock text={summary} />
                </div>
              )}

              {/* Metric snapshot cards */}
              {selectedState && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {deltaCards.map((d) => <MetricCard key={d.key} label={d.label} value={d.key === "annual_emissions" ? d.current.toFixed(2) : d.current.toFixed(3)} delta={d.delta} good={d.good} color={d.color} description={METRIC_DESCRIPTIONS[d.key]} />)}
                </div>
              )}

              {/* Composite score */}
              {compositeScore !== null && selectedState && baselineState && (
                <div className="mt-6 glass-card rounded-2xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.4em]" style={{ color: s?.color ?? "#38bdf8" }}>Trajectory score</p>
                      <p className={`mt-1 text-lg font-semibold ${compositeScore.ratingColor}`}>{compositeScore.rating}</p>
                      <p className="mt-1 text-sm text-slate-400">Weighted average of 5 dimensions vs. {(baselineState as SnapshotState).year} baseline. Each metric is normalized to 0&ndash;100 and averaged equally.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-bold text-white">{compositeScore.total}</p>
                      <p className="text-xs uppercase tracking-widest text-slate-500">out of 100</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${compositeScore.total}%`, background: `linear-gradient(90deg, ${compositeScore.total > 60 ? "#10b981" : compositeScore.total > 40 ? "#f59e0b" : "#f43f5e"}, ${compositeScore.total > 60 ? "#06b6d4" : compositeScore.total > 40 ? "#f59e0b" : "#f43f5e"})` }} />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {compositeScore.components.map((c) => (
                      <div key={c.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{c.label}</p>
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                        </div>
                        <p className="mt-1 text-xl font-bold text-white">{c.score}</p>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${c.score}%`, backgroundColor: c.color, opacity: 0.7 }} /></div>
                        <p className="mt-2 text-[11px] leading-snug text-slate-500">{c.explanation}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-500">
                    <span><span className="text-red-400">0&ndash;34</span> Critical</span>
                    <span><span className="text-orange-400">35&ndash;49</span> Under stress</span>
                    <span><span className="text-amber-400">50&ndash;64</span> Mixed signals</span>
                    <span><span className="text-sky-400">65&ndash;79</span> Promising</span>
                    <span><span className="text-emerald-400">80&ndash;100</span> Thriving</span>
                  </div>
                </div>
              )}
            </section>

            {/* ============================================================ */}
            {/*  SCENARIO COMPARISON OVERLAY                                   */}
            {/* ============================================================ */}
            <section className="mt-16">
              <SectionHeading badge="Overlay" title="Compare any two scenarios" subtitle="Select a second scenario to overlay its trajectories against the current selection." />
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <label className="text-sm text-slate-400">Compare against:</label>
                <select className="rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-sm text-white transition focus:border-sky-500/50 focus:outline-none" value={compareBranch ?? ""} onChange={(e) => setCompareBranch(e.target.value || null)}>
                  <option value="" className="bg-slate-900">None</option>
                  {data.scenarios.filter(sc => sc.id !== activeScenario).map(sc => <option key={sc.id} value={sc.id} className="bg-slate-900">{sc.icon} {sc.name}</option>)}
                </select>
                {compareBranch && <button onClick={() => setCompareBranch(null)} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>}
              </div>
              {overlayData && compareBranch && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {([
                    { a: "a_gini", b: "b_gini", label: "GINI Index", color: METRIC_COLORS.gini },
                    { a: "a_trust", b: "b_trust", label: "Civic Trust", color: METRIC_COLORS.civic_trust },
                    { a: "a_emissions", b: "b_emissions", label: "Emissions", color: METRIC_COLORS.annual_emissions },
                    { a: "a_resilience", b: "b_resilience", label: "Resilience", color: METRIC_COLORS.resilience_score },
                    { a: "a_ai", b: "b_ai", label: "AI Influence", color: METRIC_COLORS.ai_influence },
                  ] as const).map((cfg) => {
                    const compSc = data.scenarios.find(sc => sc.id === compareBranch);
                    return <ComparisonMiniChart key={cfg.label} data={overlayData} actionKey={cfg.a} inactionKey={cfg.b} label={cfg.label} color={cfg.color} currentYear={selectedState?.year} selectedLabel={s?.name ?? ""} contrastLabel={compSc?.name ?? ""} />;
                  })}
                  {selectedState && compareBranch && (() => {
                    const compSc = data.scenarios.find(sc => sc.id === compareBranch);
                    const compSnap = compSc?.trajectory[yearIndex];
                    if (!compSnap) return null;
                    return <DivergenceSummary selectedState={selectedState} inactionState={compSnap} year={selectedState.year} contrastLabel={compSc?.name ?? "comparison"} />;
                  })()}
                </div>
              )}
            </section>

            {/* CLOSING CONTEXT */}
            <section className="mt-16 glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white">Bringing it back to now</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">The simulation is just a story unless we translate it into the present. Treat every real-world deployment as another iteration, with better logging and shorter feedback loops. Build the tooling that keeps branching paths legible&mdash;Transition OS, civic ledgers, public VPP dashboards. Document the playbooks so others can fork them.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">We don&rsquo;t need infinite compute to reveal the future. We just need to notice the patterns that survive across every simulation, then act on them before the next branch begins.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a href="/transition" className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition hover:bg-emerald-500/10">
                  <span className="text-2xl">{"\u{1F6E0}\uFE0F"}</span>
                  <div><p className="text-sm font-semibold text-emerald-300">TransitionOS Dashboard</p><p className="text-xs text-slate-400">Workforce transitions, reskilling paths, and income bridge calculator</p></div>
                </a>
                <a href="/civilization" className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition hover:bg-amber-500/10">
                  <span className="text-2xl">{"\u{1F30D}"}</span>
                  <div><p className="text-sm font-semibold text-amber-300">CivilizationOS Dashboard</p><p className="text-xs text-slate-400">Resident journeys, civic dividends, benefits, and KPI projections</p></div>
                </a>
                <a href="/governance" className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 transition hover:bg-violet-500/10">
                  <span className="text-2xl">{"\u{1F3DB}\uFE0F"}</span>
                  <div><p className="text-sm font-semibold text-violet-300">GovernanceOS Dashboard</p><p className="text-xs text-slate-400">Charter frameworks, citizen assemblies, audit tracking, and participation</p></div>
                </a>
                <a href="/climate" className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 transition hover:bg-teal-500/10">
                  <span className="text-2xl">{"\u{1F331}"}</span>
                  <div><p className="text-sm font-semibold text-teal-300">ClimateOS Dashboard</p><p className="text-xs text-slate-400">Climate scenarios, biodiversity, emissions, and resource projections</p></div>
                </a>
                <a href="/research" className="flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 transition hover:bg-sky-500/10">
                  <span className="text-2xl">{"\u{1F4DC}"}</span>
                  <div><p className="text-sm font-semibold text-sky-300">AI Civilization Research Paper</p><p className="text-xs text-slate-400">The full theory, implementation roadmap, and policy framework</p></div>
                </a>
              </div>
            </section>
          </>
        )}

        <footer className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-slate-600">
          &copy; 2026 Simulation Toolkit &middot; <a href="/blog/2026-02-15-future-simulation" className="text-slate-500 hover:text-slate-300">Blog post</a> &middot; <a href="https://github.com/reillydonovan/aicivsim" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">GitHub</a> &middot; <a href="/transition" className="text-slate-500 hover:text-slate-300">TransitionOS</a> &middot; <a href="/civilization" className="text-slate-500 hover:text-slate-300">CivilizationOS</a> &middot; <a href="/governance" className="text-slate-500 hover:text-slate-300">GovernanceOS</a> &middot; <a href="/climate" className="text-slate-500 hover:text-slate-300">ClimateOS</a> &middot; <a href="/strategy" className="text-slate-500 hover:text-slate-300">StrategyOS</a> &middot; <a href="/research" className="text-slate-500 hover:text-slate-300">Research Paper</a> &middot; <a href="/blog" className="text-slate-500 hover:text-slate-300">Blog</a>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionHeading({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.4em] text-sky-400">{badge}</p>
      <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{subtitle}</p>
    </div>
  );
}

function MetricCard({ label, value, delta, good, color, description }: { label: string; value: string; delta: number; good: boolean; color: string; description: string }) {
  const arrow = delta === 0 ? "\u2192" : delta > 0 ? "\u2191" : "\u2193";
  return (
    <div className="glass-card rounded-xl p-4 transition-all hover:border-white/20">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <div className="mt-1 flex items-center gap-2"><span className={`text-xs font-medium ${good ? "text-emerald-400" : "text-amber-400"}`}>{arrow} {Math.abs(delta).toFixed(3)} vs baseline</span></div>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function TimelineMiniChart({ data, dataKey, label, description, color, currentYear }: { data: any[]; dataKey: string; label: string; description: string; color: string; currentYear?: number }) {
  const values = data.map((d) => d[dataKey] as number).filter((v) => v != null);
  const min = Math.min(...values); const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 0.05;
  const startVal = values[0]; const endVal = values[values.length - 1]; const delta = endVal - startVal;
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p><p className="mt-0.5 text-[10px] text-slate-500">{description}</p></div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{dataKey === "annual_emissions" ? endVal?.toFixed(1) : endVal?.toFixed(3)}</p>
          <p className="text-[10px] font-medium text-slate-400">{delta > 0 ? "\u2191" : delta < 0 ? "\u2193" : "\u2192"} {Math.abs(delta).toFixed(3)} over 50y</p>
        </div>
      </div>
      <div className="mt-3 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs><linearGradient id={`tl-grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.25} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis domain={[min - padding, max + padding]} tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "11px" }} formatter={(value: number) => [dataKey === "annual_emissions" ? value.toFixed(2) + " Gt" : value.toFixed(4), label]} />
            {currentYear && <ReferenceLine x={currentYear} stroke="#38bdf8" strokeDasharray="3 3" strokeWidth={1} />}
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#tl-grad-${dataKey})`} strokeWidth={2} dot={false} name={label} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ComparisonMiniChart({ data, actionKey, inactionKey, label, color, currentYear, selectedLabel = "Selected", contrastLabel = "Comparison" }: { data: any[]; actionKey: string; inactionKey: string; label: string; color: string; currentYear?: number; selectedLabel?: string; contrastLabel?: string }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs><linearGradient id={`grad-${label}-${selectedLabel}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.2} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "11px" }} />
            {currentYear && <ReferenceLine x={currentYear} stroke="#38bdf8" strokeDasharray="3 3" strokeWidth={1} />}
            <Area type="monotone" dataKey={actionKey} stroke={color} fill={`url(#grad-${label}-${selectedLabel})`} strokeWidth={2} dot={false} name={selectedLabel} />
            <Area type="monotone" dataKey={inactionKey} stroke="#475569" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name={contrastLabel} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full" style={{ backgroundColor: color }} />{selectedLabel}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0 w-3 border-t border-dashed border-slate-500" />{contrastLabel}</span>
      </div>
    </div>
  );
}

function DivergenceSummary({ selectedState, inactionState, year, contrastLabel = "comparison" }: { selectedState: SnapshotState; inactionState?: SnapshotState; year: number; contrastLabel?: string }) {
  if (!inactionState) return null;
  const diffs: { label: string; val: number; goodDir: "up" | "down" }[] = [
    { label: "GINI", val: selectedState.economy.gini - inactionState.economy.gini, goodDir: "down" },
    { label: "Trust", val: selectedState.economy.civic_trust - inactionState.economy.civic_trust, goodDir: "up" },
    { label: "Emissions", val: selectedState.climate.annual_emissions - inactionState.climate.annual_emissions, goodDir: "down" },
    { label: "Resilience", val: selectedState.climate.resilience_score - inactionState.climate.resilience_score, goodDir: "up" },
  ];
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Divergence at {year}</p>
      <p className="mt-1 text-xs text-slate-500">Selected scenario vs {contrastLabel.toLowerCase()}</p>
      <div className="mt-4 space-y-3">
        {diffs.map((d) => {
          const good = d.goodDir === "up" ? d.val > 0 : d.goodDir === "down" ? d.val < 0 : Math.abs(d.val) < 0.05;
          return <div key={d.label} className="flex items-center justify-between text-sm"><span className="text-slate-400">{d.label}</span><span className={`font-mono font-semibold ${good ? "text-emerald-400" : "text-amber-400"}`}>{d.val > 0 ? "+" : ""}{d.val.toFixed(3)}</span></div>;
        })}
      </div>
    </div>
  );
}

function SummaryBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  type SectionKey = "summary" | "baseline" | "statusquo" | "actions" | "impact" | "ai" | "food" | "health" | "materials" | "quantum" | "civic" | "employment" | "energy" | "political" | "space" | "next" | null;
  const summaryParagraphs: string[] = [];
  const bullets: Record<Exclude<SectionKey, "summary" | null>, string[]> = { baseline: [], statusquo: [], actions: [], impact: [], ai: [], food: [], health: [], materials: [], quantum: [], civic: [], employment: [], energy: [], political: [], space: [], next: [] };
  const headingMap: Record<string, SectionKey> = { summary: "summary", "baseline comparison": "baseline", "status quo projection": "statusquo", "if we don't act": "statusquo", "without action": "statusquo", actions: "actions", impact: "impact", "ai influence": "ai", "food & biosystems": "food", "medicine & healthspan": "health", "materials & infrastructure": "materials", "quantum & compute": "quantum", "civic life & culture": "civic", "employment, economy & the wealth gap": "employment", "employment & economy": "employment", "energy sources & data infrastructure": "energy", "energy & data infrastructure": "energy", "energy & compute": "energy", "the political climate": "political", "political climate": "political", "governance": "political", "space colonies": "space", "space colonies: moon, mars & beyond": "space", "off-world": "space", "next steps": "next" };
  let section: SectionKey = null; let buf: string[] = [];
  const flush = () => { if (buf.length) { summaryParagraphs.push(buf.join(" ").trim()); buf = []; } };
  for (const raw of lines) {
    const trimmed = raw.trim();
    const h = trimmed.match(/^##\s+(.+)/i);
    if (h) { flush(); section = headingMap[h[1].trim().toLowerCase()] ?? null; continue; }
    if (!trimmed) { if (section === "summary") flush(); continue; }
    if (section === "summary") { buf.push(trimmed); continue; }
    if (section) { const arr = bullets[section]; if (trimmed.startsWith("- ")) arr.push(trimmed.replace(/^-\s*/, "")); else if (arr.length) arr[arr.length - 1] += " " + trimmed; }
  }
  flush();
  const sectionMeta: { key: Exclude<SectionKey, "summary" | null>; label: string; accent: string }[] = [
    { key: "baseline", label: "Baseline comparison", accent: "border-white/5" },
    { key: "statusquo", label: "Status quo projection \u2014 if we don\u2019t act", accent: "border-red-500/20" },
    { key: "actions", label: "Actions taken", accent: "border-sky-500/20" },
    { key: "impact", label: "Impact", accent: "border-emerald-500/20" },
    { key: "employment", label: "Employment, economy & the wealth gap", accent: "border-amber-400/20" },
    { key: "energy", label: "Energy sources & data infrastructure", accent: "border-sky-400/20" },
    { key: "political", label: "The political climate", accent: "border-violet-400/20" },
    { key: "space", label: "Space colonies: Moon, Mars & beyond", accent: "border-emerald-400/20" },
    { key: "ai", label: "AI influence", accent: "border-violet-500/20" },
    { key: "food", label: "Food & biosystems", accent: "border-lime-400/20" },
    { key: "health", label: "Medicine & healthspan", accent: "border-rose-400/20" },
    { key: "materials", label: "Materials & infrastructure", accent: "border-cyan-400/20" },
    { key: "quantum", label: "Quantum & compute", accent: "border-indigo-400/20" },
    { key: "civic", label: "Civic life & culture", accent: "border-amber-400/20" },
    { key: "next", label: "Next steps", accent: "border-sky-500/20" },
  ];
  return (
    <div className="space-y-5">
      {summaryParagraphs.length > 0 && <div className="space-y-3">{summaryParagraphs.map((p, i) => <p key={i} className="text-sm leading-relaxed text-slate-200">{p}</p>)}</div>}
      {sectionMeta.map(({ key, label, accent }) => { const items = bullets[key]; if (!items.length) return null; return (
        <div key={key} className={`rounded-xl border ${accent} bg-white/[0.02] p-4`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">{items.map((line, i) => <li key={i}>{line}</li>)}</ul>
        </div>
      ); })}
    </div>
  );
}
