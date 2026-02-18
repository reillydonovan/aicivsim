"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import NavBar from "../components/NavBar";

/* ================================================================== */
/*  Types & Data                                                       */
/* ================================================================== */

type Scenario = "aggressive" | "moderate" | "status_quo" | "worst_case";
type Tab = "overview" | "personal" | "organization" | "policy" | "simulator";

const SCENARIOS: { id: Scenario; name: string; icon: string; color: string; desc: string }[] = [
  { id: "aggressive", name: "Aggressive Action", icon: "\u{1F31F}", color: "#10b981", desc: "Widespread adoption of best strategies across all levels. Policy, business, and individuals aligned toward maximum impact within this decade." },
  { id: "moderate", name: "Moderate Adoption", icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", desc: "Meaningful but uneven adoption. Leading nations and companies act decisively while others follow slowly. Gaps remain but the trajectory bends." },
  { id: "status_quo", name: "Business as Usual", icon: "\u{1F6A8}", color: "#f59e0b", desc: "Current pace of change continues. Pledges outpace action. Technology improves but deployment lags. The window for intervention narrows each year." },
  { id: "worst_case", name: "Active Regression", icon: "\u26A0\uFE0F", color: "#f43f5e", desc: "Rollback of environmental protections, defunding of transition programs, rising nationalism blocks cooperation. Short-term economics override long-term survival." },
];

const SC_COLORS: Record<string, string> = { aggressive: "#10b981", moderate: "#38bdf8", status_quo: "#f59e0b", worst_case: "#f43f5e" };
const SC_NAMES: Record<string, string> = { aggressive: "Aggressive Action", moderate: "Moderate Adoption", status_quo: "Business as Usual", worst_case: "Active Regression" };

/* ── Personal Actions ── */
interface Action {
  id: string; name: string; icon: string; category: string;
  co2_kg_yr: number; cost: "free" | "low" | "medium" | "high";
  difficulty: 1 | 2 | 3 | 4 | 5; impact_score: number;
  desc: string; ecosystem_link: string; moves_metrics: string[];
}

const PERSONAL_ACTIONS: Action[] = [
  /* ── Energy ── */
  { id: "p1", name: "Switch to Renewable Energy Provider", icon: "\u26A1", category: "Energy", co2_kg_yr: 1800, cost: "low", difficulty: 1, impact_score: 85,
    desc: "Switch your electricity provider to 100% renewable. In deregulated markets this takes 15 minutes online. In regulated markets, purchase renewable energy certificates or join a community solar program. This single action eliminates the largest share of most households' carbon footprint.", ecosystem_link: "ClimateOS", moves_metrics: ["Emissions intensity", "Energy transition score"] },
  { id: "p4", name: "Home Energy Efficiency", icon: "\u{1F3E0}", category: "Energy", co2_kg_yr: 1500, cost: "medium", difficulty: 3, impact_score: 78,
    desc: "Install a heat pump, add insulation, seal air leaks, and upgrade to LED lighting. A heat pump alone can cut heating/cooling energy by 50%. Many jurisdictions offer rebates that cover 30-60% of costs. These investments typically pay for themselves in 3-7 years and immediately reduce energy bills.", ecosystem_link: "ClimateOS", moves_metrics: ["Emissions intensity", "Household liquidity", "Energy transition score"] },
  { id: "p8", name: "Community Solar or VPP Participation", icon: "\u2600\uFE0F", category: "Energy", co2_kg_yr: 800, cost: "low", difficulty: 2, impact_score: 70,
    desc: "Join a community solar program or enroll your home battery/EV in a Virtual Power Plant. VPPs aggregate distributed energy resources to stabilize the grid and reduce peak emissions. You earn revenue while contributing to grid decarbonization. This is the infrastructure-level version of personal energy action.", ecosystem_link: "TransitionOS", moves_metrics: ["Grid decarbonization", "VPP capacity", "Household income"] },
  { id: "p11", name: "Smart Thermostat & Load Shifting", icon: "\u{1F321}\uFE0F", category: "Energy", co2_kg_yr: 600, cost: "low", difficulty: 1, impact_score: 62,
    desc: "Install a smart thermostat and shift energy-intensive tasks (laundry, dishwasher, EV charging) to off-peak hours when the grid is cleaner. This costs almost nothing, reduces bills by 10-15%, and lowers demand during peak fossil-fuel hours. Multiply by millions of households and it reshapes the grid load curve.", ecosystem_link: "ClimateOS", moves_metrics: ["Grid demand", "Emissions intensity", "Household liquidity"] },

  /* ── Food ── */
  { id: "p2", name: "Plant-Forward Diet", icon: "\u{1F955}", category: "Food", co2_kg_yr: 1100, cost: "free", difficulty: 2, impact_score: 72,
    desc: "Reduce meat consumption by 50-80%, shifting toward plant-based proteins, legumes, and whole grains. This isn't about going fully vegan \u2014 it's about making animal products the side dish rather than the centerpiece. The impact scales linearly: every meal shifted matters.", ecosystem_link: "ClimateOS", moves_metrics: ["Emissions intensity", "Biodiversity pressure", "Water usage"] },
  { id: "p12", name: "Reduce Food Waste", icon: "\u{1F372}", category: "Food", co2_kg_yr: 500, cost: "free", difficulty: 1, impact_score: 58,
    desc: "Plan meals, use leftovers, compost scraps. Roughly a third of all food produced is wasted, generating 8-10% of global emissions \u2014 more than the airline industry. Reducing household food waste by half saves money, reduces methane from landfills, and lowers the agricultural pressure driving deforestation.", ecosystem_link: "ClimateOS", moves_metrics: ["Emissions intensity", "Resource consumption", "Waste reduction"] },
  { id: "p13", name: "Buy Local & Seasonal", icon: "\u{1F33E}", category: "Food", co2_kg_yr: 350, cost: "low", difficulty: 2, impact_score: 48,
    desc: "Prioritize seasonal, locally grown food when possible. Transport accounts for ~6% of food emissions, but the real impact is supporting regional food systems that are more resilient, less reliant on industrial agriculture, and better for soil health. Farmers' markets, CSAs, and local co-ops build the food infrastructure we need.", ecosystem_link: "ClimateOS", moves_metrics: ["Supply chain emissions", "Community resilience", "Biodiversity"] },

  /* ── Transport ── */
  { id: "p3", name: "EV or Public Transit Switch", icon: "\u{1F68C}", category: "Transport", co2_kg_yr: 2400, cost: "high", difficulty: 3, impact_score: 90,
    desc: "Replace combustion-engine commuting with an EV, electric bike, or public transit. If an EV is unaffordable, a used hybrid or e-bike covers 80% of the benefit at 20% of the cost. For urban residents, a transit pass plus occasional ride-share often outperforms car ownership on both cost and carbon.", ecosystem_link: "ClimateOS", moves_metrics: ["Emissions intensity", "Air quality", "Energy transition score"] },
  { id: "p14", name: "Reduce Air Travel", icon: "\u2708\uFE0F", category: "Transport", co2_kg_yr: 1600, cost: "free", difficulty: 3, impact_score: 74,
    desc: "Cut flights by 50% or more. A single transatlantic round trip emits ~1.6 tonnes of CO\u2082 \u2014 more than many people in developing nations produce in an entire year. Substitute with trains where possible, consolidate trips, and use video conferencing. For unavoidable flights, offset with high-quality carbon credits.", ecosystem_link: "ClimateOS", moves_metrics: ["Emissions intensity", "Aviation emissions"] },
  { id: "p15", name: "Active Transport (Walk, Bike, E-Bike)", icon: "\u{1F6B2}", category: "Transport", co2_kg_yr: 800, cost: "low", difficulty: 2, impact_score: 65,
    desc: "Replace short car trips with walking, cycling, or e-biking. Half of all car trips are under 3 miles \u2014 perfect for active transport. E-bikes extend the range to 10+ miles comfortably. The health co-benefits (lower mortality, better mental health) make this one of the few climate actions that pays you back in years of life.", ecosystem_link: "ClimateOS", moves_metrics: ["Emissions intensity", "Air quality", "Health outcomes"] },

  /* ── Finance ── */
  { id: "p5", name: "Shift Investments to ESG/Impact Funds", icon: "\u{1F4B0}", category: "Finance", co2_kg_yr: 600, cost: "free", difficulty: 2, impact_score: 65,
    desc: "Move retirement accounts, savings, and investments into ESG-screened or impact-focused funds. The financial return is comparable to conventional funds (often identical), but the capital allocation signal matters. When enough capital moves, it changes what gets built. Divest from fossil fuels, reinvest in the future.", ecosystem_link: "TransitionOS", moves_metrics: ["Capital alignment", "Emissions financing"] },
  { id: "p16", name: "Bank with a Climate-Responsible Institution", icon: "\u{1F3E6}", category: "Finance", co2_kg_yr: 300, cost: "free", difficulty: 1, impact_score: 55,
    desc: "Move your deposits to a bank or credit union that doesn't finance fossil fuel expansion. The top 60 banks have poured $5.5 trillion into fossil fuels since the Paris Agreement. Your deposits are their lending base. Switching sends a market signal and directly reduces the capital available for carbon-intensive projects.", ecosystem_link: "TransitionOS", moves_metrics: ["Capital alignment", "Fossil fuel financing"] },
  { id: "p17", name: "Support Climate-Aligned Businesses", icon: "\u{1F6D2}", category: "Finance", co2_kg_yr: 200, cost: "low", difficulty: 1, impact_score: 50,
    desc: "Choose B-Corps, companies with SBTi targets, and businesses with transparent supply chains. Consumer spending is a signal. When enough people preferentially buy from companies that are actually doing the work, it creates competitive pressure for laggards. Check certifications, not just marketing.", ecosystem_link: "TransitionOS", moves_metrics: ["Consumer signal", "Corporate accountability"] },

  /* ── Waste ── */
  { id: "p6", name: "Reduce, Repair, Reuse", icon: "\u267B\uFE0F", category: "Waste", co2_kg_yr: 400, cost: "free", difficulty: 2, impact_score: 55,
    desc: "Buy less, repair what breaks, choose used over new, compost food waste. The manufacturing and shipping of consumer goods accounts for a significant share of global emissions. Every product not manufactured is emissions permanently avoided. This is the quiet lever that doesn't require technology \u2014 just intention.", ecosystem_link: "ClimateOS", moves_metrics: ["Resource consumption", "Waste reduction", "Emissions intensity"] },
  { id: "p18", name: "Composting & Zero-Waste Habits", icon: "\u{1F331}", category: "Waste", co2_kg_yr: 200, cost: "free", difficulty: 2, impact_score: 45,
    desc: "Compost food scraps, refuse single-use items, and aim for a low-waste lifestyle. Organic waste in landfills generates methane \u2014 80x more potent than CO\u2082 over 20 years. Home composting eliminates this while creating soil. Pair with refusing unnecessary packaging and carrying reusables for compounding impact.", ecosystem_link: "ClimateOS", moves_metrics: ["Methane emissions", "Waste reduction", "Soil health"] },
  { id: "p19", name: "Responsible Electronics Lifecycle", icon: "\u{1F4F1}", category: "Waste", co2_kg_yr: 150, cost: "free", difficulty: 2, impact_score: 42,
    desc: "Keep devices longer, buy refurbished, recycle e-waste properly. Manufacturing a single smartphone generates 70+ kg of CO\u2082. Extending a phone's life from 2 to 4 years cuts its per-year footprint in half. E-waste contains rare earth metals whose extraction devastates ecosystems. Responsible lifecycle management addresses both emissions and biodiversity.", ecosystem_link: "ClimateOS", moves_metrics: ["Resource consumption", "E-waste reduction", "Emissions intensity"] },

  /* ── Civic ── */
  { id: "p7", name: "Civic Engagement & Voting", icon: "\u{1F5F3}\uFE0F", category: "Civic", co2_kg_yr: 0, cost: "free", difficulty: 1, impact_score: 95,
    desc: "Vote for candidates with credible climate and governance plans. Attend town halls. Comment on proposed regulations. Join civic assemblies. Individual action matters, but policy is the multiplier. One well-designed regulation can achieve more than a million individual choices. Your vote is your highest-leverage action.", ecosystem_link: "GovernanceOS", moves_metrics: ["Democratic participation", "Policy alignment", "Charter audit coverage"] },
  { id: "p20", name: "Join or Start a Local Climate Group", icon: "\u{1F91D}", category: "Civic", co2_kg_yr: 0, cost: "free", difficulty: 2, impact_score: 75,
    desc: "Join a local climate action group, mutual aid network, or community resilience organization. Collective action is exponentially more powerful than individual action. Groups lobby local government, organize community solar programs, run tool libraries, and create the social infrastructure that makes systemic change possible.", ecosystem_link: "GovernanceOS", moves_metrics: ["Community resilience", "Civic participation", "Collective action"] },
  { id: "p21", name: "Engage with AI Governance", icon: "\u{1F916}", category: "Civic", co2_kg_yr: 0, cost: "free", difficulty: 3, impact_score: 68,
    desc: "Participate in public comment periods on AI regulation, support algorithmic transparency, and demand accountability for automated decision-making. AI systems are increasingly making decisions about employment, credit, and public services. Democratic oversight requires informed public participation. Your voice in governance processes shapes the rules.", ecosystem_link: "GovernanceOS", moves_metrics: ["AI oversight", "Democratic participation", "Charter audit coverage"] },

  /* ── Career ── */
  { id: "p9", name: "Climate-Conscious Career Shift", icon: "\u{1F393}", category: "Career", co2_kg_yr: 0, cost: "medium", difficulty: 4, impact_score: 88,
    desc: "Reskill into climate tech, clean energy, circular economy, or governance roles. The workforce transition needs millions of people moving into growth occupations. Your career is a decades-long lever. TransitionOS shows the pathways; this is about choosing to walk one. The salary uplift for many transitions is positive.", ecosystem_link: "TransitionOS", moves_metrics: ["Placement rate", "Reskilling capacity", "Employment quality"] },
  { id: "p22", name: "Green Your Current Job", icon: "\u{1F4BC}", category: "Career", co2_kg_yr: 0, cost: "free", difficulty: 2, impact_score: 62,
    desc: "Advocate for sustainability within your current organization. Propose energy audits, remote work policies, supply chain reviews, and ESG reporting. Internal change agents are often more effective than external pressure because they understand the organization's constraints and leverage points. You don't have to change careers to change your industry.", ecosystem_link: "TransitionOS", moves_metrics: ["Corporate emissions", "Organizational change", "Employee engagement"] },
  { id: "p23", name: "Mentor or Teach Climate Skills", icon: "\u{1F4DA}", category: "Career", co2_kg_yr: 0, cost: "free", difficulty: 2, impact_score: 58,
    desc: "Share climate, data, governance, or technical skills with others through mentoring, teaching, or open-source contributions. The transition workforce bottleneck isn't just about formal programs \u2014 peer learning and knowledge transfer accelerate the pipeline. Every person you upskill multiplies your impact.", ecosystem_link: "TransitionOS", moves_metrics: ["Reskilling capacity", "Knowledge transfer", "Workforce pipeline"] },

  /* ── Social ── */
  { id: "p10", name: "Talk About It", icon: "\u{1F4AC}", category: "Social", co2_kg_yr: 0, cost: "free", difficulty: 1, impact_score: 60,
    desc: "Discuss climate, governance, and transition strategies with friends, family, and colleagues. Social norms shift through conversation. Research shows that knowing someone who acts on climate makes you significantly more likely to act yourself. Silence is the biggest barrier to collective action. Break it.", ecosystem_link: "CivilizationOS", moves_metrics: ["Social norm shift", "Civic awareness", "Collective action readiness"] },
  { id: "p24", name: "Model the Behavior", icon: "\u{1F31F}", category: "Social", co2_kg_yr: 0, cost: "free", difficulty: 1, impact_score: 52,
    desc: "Let people see your choices \u2014 the solar panels, the bike commute, the meatless meals, the repair instead of replace. Visible behavior change is more persuasive than arguments. Social science consistently shows that descriptive norms (what people actually do) are more powerful than injunctive norms (what people say should be done).", ecosystem_link: "CivilizationOS", moves_metrics: ["Social norm shift", "Behavioral contagion"] },
  { id: "p25", name: "Support Climate Journalism & Education", icon: "\u{1F4F0}", category: "Social", co2_kg_yr: 0, cost: "low", difficulty: 1, impact_score: 48,
    desc: "Subscribe to, share, and financially support quality climate journalism and educational content. An informed public is the foundation of democratic climate action. Misinformation thrives in the absence of trusted reporting. Supporting journalists who cover climate, energy, and governance strengthens the information ecosystem that all other strategies depend on.", ecosystem_link: "CivilizationOS", moves_metrics: ["Public awareness", "Information quality", "Democratic foundation"] },
];

/* ── Organization Actions ── */
const ORG_ACTIONS: Action[] = [
  { id: "o1", name: "Science-Based Targets (SBTi)", icon: "\u{1F3AF}", category: "Emissions", co2_kg_yr: 50000, cost: "medium", difficulty: 3, impact_score: 92,
    desc: "Commit to Science Based Targets initiative. Set near-term and net-zero targets validated by SBTi. This forces internal accountability, aligns procurement, and sends a credible market signal. Companies with validated targets consistently outperform on decarbonization because the target becomes a management constraint, not a PR exercise.", ecosystem_link: "ClimateOS", moves_metrics: ["Corporate emissions", "Supply chain decarbonization", "Emissions intensity"] },
  { id: "o2", name: "Supply Chain Decarbonization", icon: "\u{1F69A}", category: "Emissions", co2_kg_yr: 120000, cost: "high", difficulty: 5, impact_score: 95,
    desc: "Map, measure, and reduce Scope 3 emissions across your supply chain. This is where 70-90% of most companies' emissions live. Require suppliers to report emissions, set reduction targets as procurement criteria, and invest in supplier capacity building. Painful but transformative — and increasingly required by regulation.", ecosystem_link: "ClimateOS", moves_metrics: ["Supply chain emissions", "Scope 3 reduction", "Emissions intensity"] },
  { id: "o3", name: "100% Renewable Energy Procurement", icon: "\u{1F50B}", category: "Energy", co2_kg_yr: 80000, cost: "medium", difficulty: 2, impact_score: 85,
    desc: "Procure 100% renewable electricity through PPAs, RECs, or on-site generation. Corporate renewable procurement is one of the fastest-growing drivers of new clean energy capacity. Long-term PPAs provide price certainty and directly finance new wind and solar projects. Many companies find renewables are now cheaper than fossil alternatives.", ecosystem_link: "ClimateOS", moves_metrics: ["Energy transition score", "Corporate emissions", "Grid decarbonization"] },
  { id: "o4", name: "Circular Economy Practices", icon: "\u{1F504}", category: "Resources", co2_kg_yr: 30000, cost: "medium", difficulty: 4, impact_score: 75,
    desc: "Design products for durability, repairability, and recyclability. Implement take-back programs. Shift from selling products to selling services. Circular economy practices reduce virgin resource extraction, cut waste, and often improve margins through material efficiency. The business case is strong; the implementation requires systemic thinking.", ecosystem_link: "ClimateOS", moves_metrics: ["Resource consumption", "Waste reduction", "Material efficiency"] },
  { id: "o5", name: "Remote/Hybrid Work Policy", icon: "\u{1F3E2}", category: "Operations", co2_kg_yr: 15000, cost: "free", difficulty: 2, impact_score: 60,
    desc: "Implement permanent remote or hybrid work options where roles allow. Commuting is a major source of urban emissions. Remote work eliminates commute emissions, reduces office energy use, and often improves employee satisfaction and retention. The emissions savings compound across every employee, every day.", ecosystem_link: "TransitionOS", moves_metrics: ["Commute emissions", "Employee satisfaction", "Office energy use"] },
  { id: "o6", name: "AI Governance & Ethics Framework", icon: "\u{1F916}", category: "Governance", co2_kg_yr: 0, cost: "medium", difficulty: 4, impact_score: 80,
    desc: "Establish an internal AI ethics board, implement algorithmic audit processes, and publish transparency reports. As AI systems make more consequential decisions, governance becomes both a moral imperative and a competitive advantage. Companies that get this right early will be trusted; those that don't will face regulatory and reputational costs.", ecosystem_link: "GovernanceOS", moves_metrics: ["Charter audit coverage", "AI oversight score", "Public trust"] },
  { id: "o7", name: "Just Transition Investment", icon: "\u{1F91D}", category: "Social", co2_kg_yr: 0, cost: "high", difficulty: 4, impact_score: 88,
    desc: "Fund reskilling programs for workers displaced by automation or decarbonization. Partner with community colleges, workforce development boards, and transition programs. This is not charity — it is infrastructure for your future workforce. Companies that invest in transition build loyalty, reduce disruption, and earn social license to operate.", ecosystem_link: "TransitionOS", moves_metrics: ["Reskilling capacity", "Placement rate", "Community resilience"] },
  { id: "o8", name: "Transparent ESG Reporting", icon: "\u{1F4CA}", category: "Governance", co2_kg_yr: 0, cost: "low", difficulty: 3, impact_score: 70,
    desc: "Publish comprehensive, verified ESG reports using TCFD, GRI, or ISSB frameworks. Go beyond compliance — include honest assessment of gaps and risks. Markets increasingly price ESG quality into valuations. Transparent reporting builds trust with investors, employees, and regulators. Opacity is the new risk.", ecosystem_link: "GovernanceOS", moves_metrics: ["Corporate transparency", "Investor confidence", "Regulatory readiness"] },
];

/* ── Policy Actions ── */
const POLICY_ACTIONS: Action[] = [
  /* ── Economic Instruments ── */
  { id: "g1", name: "Carbon Pricing (Tax or Cap-and-Trade)", icon: "\u{1F4B5}", category: "Economic Instruments", co2_kg_yr: 5000000000, cost: "free", difficulty: 5, impact_score: 98,
    desc: "Implement a carbon tax ($50\u2013150/ton) or cap-and-trade system with declining caps. This is the single most cost-effective policy intervention available. It corrects the market failure at the root of the climate crisis by making pollution expensive. Revenue can fund dividends, transition programs, or clean energy investment. Every serious analysis puts this at #1.", ecosystem_link: "ClimateOS", moves_metrics: ["Global emissions", "Carbon price signal", "Clean energy investment"] },
  { id: "g9", name: "Fossil Fuel Subsidy Reform", icon: "\u{1F6D1}", category: "Economic Instruments", co2_kg_yr: 2000000000, cost: "free", difficulty: 5, impact_score: 91,
    desc: "Eliminate $7 trillion/yr in fossil fuel subsidies (direct + implicit). Governments currently pay polluters to pollute. Redirecting even a fraction to clean energy and transition programs would transform the economics of decarbonization overnight. Politically difficult because incumbents fight to preserve rents, but the economic logic is overwhelming.", ecosystem_link: "ClimateOS", moves_metrics: ["Fossil fuel demand", "Clean energy competitiveness", "Public revenue"] },
  { id: "g10", name: "Green Public Procurement", icon: "\u{1F3E6}", category: "Economic Instruments", co2_kg_yr: 500000000, cost: "low", difficulty: 2, impact_score: 72,
    desc: "Require government purchasing to prioritize low-carbon materials, clean vehicles, renewable energy, and circular products. Governments are the largest buyers in most economies. When they shift procurement, they create guaranteed demand that de-risks private investment and pulls entire supply chains toward sustainability.", ecosystem_link: "TransitionOS", moves_metrics: ["Market signal", "Supply chain decarbonization", "Green industry growth"] },
  { id: "g11", name: "Climate-Aligned Financial Regulation", icon: "\u{1F4CA}", category: "Economic Instruments", co2_kg_yr: 800000000, cost: "low", difficulty: 4, impact_score: 84,
    desc: "Mandate climate risk disclosure (TCFD/ISSB), stress-test banks for climate exposure, and integrate carbon into capital requirements. Financial regulation shapes where trillions flow. When regulators treat climate as a systemic risk, capital shifts from stranded assets to the transition. This is the policy lever that moves money at scale.", ecosystem_link: "GovernanceOS", moves_metrics: ["Capital alignment", "Stranded asset risk", "Investor transparency"] },

  /* ── Energy Policy ── */
  { id: "g4", name: "Clean Electricity Standards", icon: "\u{1F329}\uFE0F", category: "Energy Policy", co2_kg_yr: 3000000000, cost: "medium", difficulty: 3, impact_score: 94,
    desc: "Require 80\u2013100% clean electricity by 2035. Establish renewable portfolio standards, streamline permitting, invest in transmission. Clean electricity is the foundation \u2014 transport electrification, building electrification, and industrial decarbonization all depend on a clean grid. This is the keystone policy.", ecosystem_link: "ClimateOS", moves_metrics: ["Grid emissions", "Renewable capacity", "Energy transition score"] },
  { id: "g12", name: "Grid Modernization & Storage Investment", icon: "\u{1F50B}", category: "Energy Policy", co2_kg_yr: 1200000000, cost: "high", difficulty: 3, impact_score: 86,
    desc: "Invest in grid-scale battery storage, long-distance transmission, and smart grid infrastructure. Renewables can produce the energy; the grid needs to deliver it reliably. Storage solves intermittency. Transmission connects wind-rich and sun-rich regions to demand centers. Without grid modernization, clean energy gets curtailed while fossil plants keep running.", ecosystem_link: "ClimateOS", moves_metrics: ["Grid reliability", "Renewable utilization", "Energy transition score"] },
  { id: "g13", name: "Nuclear Energy Policy", icon: "\u2622\uFE0F", category: "Energy Policy", co2_kg_yr: 800000000, cost: "high", difficulty: 5, impact_score: 75,
    desc: "Maintain existing nuclear fleet and support advanced reactor deployment. Nuclear provides ~10% of global electricity with near-zero emissions. Premature closures are replaced by fossil fuels. Advanced designs (SMRs, molten salt) address cost and safety concerns. Pragmatic climate policy includes every zero-carbon source available.", ecosystem_link: "ClimateOS", moves_metrics: ["Baseload clean power", "Grid stability", "Emissions intensity"] },
  { id: "g14", name: "Distributed Energy & Community Ownership", icon: "\u2600\uFE0F", category: "Energy Policy", co2_kg_yr: 400000000, cost: "low", difficulty: 2, impact_score: 68,
    desc: "Enable community solar, rooftop solar, and Virtual Power Plants through net metering, interconnection standards, and cooperative ownership models. Distributed energy democratizes the grid, builds resilience, and keeps revenue in communities. Regulatory barriers \u2014 not technology \u2014 are the primary obstacle.", ecosystem_link: "TransitionOS", moves_metrics: ["VPP capacity", "Community energy revenue", "Grid resilience"] },

  /* ── Transport & Infrastructure ── */
  { id: "g3", name: "Vehicle Electrification Mandates", icon: "\u{1F697}", category: "Transport & Infrastructure", co2_kg_yr: 2000000000, cost: "medium", difficulty: 4, impact_score: 90,
    desc: "Set binding targets for EV sales (100% by 2035), invest in charging infrastructure, and electrify public transit. Transport is ~25% of global emissions. Mandates provide manufacturing certainty, drive cost curves down, and ensure equitable access. Pair with grid decarbonization for maximum impact.", ecosystem_link: "ClimateOS", moves_metrics: ["Transport emissions", "Air quality", "Energy transition score"] },
  { id: "g15", name: "Public Transit & Rail Investment", icon: "\u{1F689}", category: "Transport & Infrastructure", co2_kg_yr: 600000000, cost: "high", difficulty: 4, impact_score: 78,
    desc: "Fund high-speed rail, urban transit expansion, and first/last-mile connections. Public transit produces 1/10th the emissions per passenger-mile of cars. Investment creates jobs, reduces congestion, improves air quality, and provides mobility for those who can't drive. The US spends billions on highways; redirect a fraction to transit.", ecosystem_link: "ClimateOS", moves_metrics: ["Transport emissions", "Congestion", "Equitable mobility"] },
  { id: "g16", name: "Urban Planning & 15-Minute Cities", icon: "\u{1F3D9}\uFE0F", category: "Transport & Infrastructure", co2_kg_yr: 400000000, cost: "medium", difficulty: 4, impact_score: 73,
    desc: "Reform zoning to allow mixed-use development, reduce parking minimums, build protected bike lanes, and create walkable neighborhoods. Land use determines transport needs. Sprawl locks in car dependency for decades. Compact, mixed-use development reduces VMT, improves health, builds community, and cuts infrastructure costs.", ecosystem_link: "ClimateOS", moves_metrics: ["Transport demand", "Urban emissions", "Quality of life"] },
  { id: "g17", name: "Freight & Shipping Decarbonization", icon: "\u{1F6A2}", category: "Transport & Infrastructure", co2_kg_yr: 900000000, cost: "high", difficulty: 5, impact_score: 80,
    desc: "Set emissions standards for shipping and heavy freight. Fund green hydrogen, ammonia, and electric truck corridors. Maritime and heavy-duty transport account for ~10% of global emissions and are among the hardest to decarbonize. International coordination (IMO, ICAO) is essential. First-mover ports and corridors create competitive advantage.", ecosystem_link: "ClimateOS", moves_metrics: ["Freight emissions", "Green hydrogen demand", "Supply chain decarbonization"] },

  /* ── Buildings & Land Use ── */
  { id: "g2", name: "Net-Zero Building Codes", icon: "\u{1F3D7}\uFE0F", category: "Buildings & Land Use", co2_kg_yr: 800000000, cost: "low", difficulty: 3, impact_score: 82,
    desc: "Mandate net-zero building codes for new construction and retrofit requirements for existing buildings. Buildings account for ~40% of energy-related emissions. Codes that require heat pumps, insulation, and electrification lock in decades of savings. The technology exists; the obstacle is purely regulatory.", ecosystem_link: "ClimateOS", moves_metrics: ["Building emissions", "Energy efficiency", "Grid demand"] },
  { id: "g18", name: "Appliance Efficiency Standards", icon: "\u{1F50C}", category: "Buildings & Land Use", co2_kg_yr: 300000000, cost: "free", difficulty: 2, impact_score: 70,
    desc: "Set and regularly tighten minimum energy efficiency standards for appliances, HVAC, and industrial equipment. Standards work invisibly \u2014 consumers buy efficient products without needing to think about it. The US DOE estimates existing standards have saved consumers $2.3 trillion. Tightening them further is one of the easiest policy wins available.", ecosystem_link: "ClimateOS", moves_metrics: ["Energy demand", "Consumer savings", "Emissions intensity"] },
  { id: "g19", name: "Deforestation Prevention & Land Protection", icon: "\u{1F332}", category: "Buildings & Land Use", co2_kg_yr: 1500000000, cost: "medium", difficulty: 4, impact_score: 85,
    desc: "Ban commodity-driven deforestation imports, expand protected areas to 30% by 2030, and fund Indigenous land rights. Deforestation accounts for ~10% of global emissions. Intact forests are irreplaceable carbon sinks. Indigenous-managed lands have lower deforestation rates than government-managed protected areas. Rights-based approaches work.", ecosystem_link: "ClimateOS", moves_metrics: ["Land use emissions", "Carbon sequestration", "Biodiversity"] },

  /* ── Emissions Regulation ── */
  { id: "g5", name: "Methane Regulation", icon: "\u{1F4A8}", category: "Emissions Regulation", co2_kg_yr: 1500000000, cost: "low", difficulty: 2, impact_score: 85,
    desc: "Regulate methane leaks from oil & gas, agriculture, and waste. Methane is 80x more potent than CO\u2082 over 20 years. Plugging leaks is cheap, fast, and delivers immediate climate benefit. This is the lowest-hanging fruit in climate policy \u2014 high impact, low cost, existing technology.", ecosystem_link: "ClimateOS", moves_metrics: ["Methane emissions", "Near-term warming", "Air quality"] },
  { id: "g20", name: "Industrial Emissions Standards", icon: "\u{1F3ED}", category: "Emissions Regulation", co2_kg_yr: 1000000000, cost: "medium", difficulty: 4, impact_score: 79,
    desc: "Set declining emissions caps for cement, steel, chemicals, and other heavy industry. Industry accounts for ~21% of emissions and is the hardest sector to decarbonize. Standards drive innovation in green hydrogen, CCUS, and electrification. Border carbon adjustments prevent leakage to unregulated jurisdictions.", ecosystem_link: "ClimateOS", moves_metrics: ["Industrial emissions", "Green industry innovation", "Carbon leakage prevention"] },
  { id: "g21", name: "F-Gas & Short-Lived Climate Pollutant Phase-Down", icon: "\u2744\uFE0F", category: "Emissions Regulation", co2_kg_yr: 500000000, cost: "low", difficulty: 2, impact_score: 71,
    desc: "Accelerate the Kigali Amendment phase-down of HFCs and regulate black carbon. F-gases are thousands of times more potent than CO\u2082. Alternatives exist for nearly all uses. The Montreal Protocol proves international pollutant phase-downs work. Extending this model to all short-lived climate pollutants delivers fast warming reduction.", ecosystem_link: "ClimateOS", moves_metrics: ["Near-term warming", "Ozone recovery", "Air quality"] },

  /* ── Biodiversity & Nature ── */
  { id: "g6", name: "Nature-Based Solutions Funding", icon: "\u{1F333}", category: "Biodiversity & Nature", co2_kg_yr: 1000000000, cost: "medium", difficulty: 3, impact_score: 78,
    desc: "Fund large-scale reforestation, wetland restoration, mangrove protection, and soil carbon programs. Nature-based solutions provide ~30% of the mitigation needed to stay below 1.5\u00b0C. They also deliver biodiversity, water security, and flood protection co-benefits. Current funding is less than 5% of what's needed.", ecosystem_link: "ClimateOS", moves_metrics: ["Carbon sequestration", "Biodiversity score", "Ecosystem health"] },
  { id: "g22", name: "Ocean Protection & Blue Carbon", icon: "\u{1F30A}", category: "Biodiversity & Nature", co2_kg_yr: 300000000, cost: "medium", difficulty: 3, impact_score: 70,
    desc: "Protect 30% of oceans by 2030, end destructive fishing subsidies, and invest in blue carbon ecosystems (mangroves, seagrass, salt marshes). Oceans absorb 25% of CO\u2082 and 90% of excess heat. Marine ecosystems are collapsing under warming, acidification, and overfishing. Protection buys time for the entire climate system.", ecosystem_link: "ClimateOS", moves_metrics: ["Ocean health", "Blue carbon", "Marine biodiversity"] },
  { id: "g23", name: "Regenerative Agriculture Incentives", icon: "\u{1F33E}", category: "Biodiversity & Nature", co2_kg_yr: 600000000, cost: "medium", difficulty: 3, impact_score: 74,
    desc: "Shift agricultural subsidies from intensive monoculture to regenerative practices: cover cropping, reduced tillage, agroforestry, rotational grazing. Agriculture is ~12% of emissions but holds immense sequestration potential. Regenerative farms build soil carbon, reduce input costs, improve water retention, and increase resilience to climate extremes.", ecosystem_link: "ClimateOS", moves_metrics: ["Soil carbon", "Agricultural emissions", "Food system resilience"] },
  { id: "g24", name: "Pollution & Plastics Treaty", icon: "\u267B\uFE0F", category: "Biodiversity & Nature", co2_kg_yr: 200000000, cost: "low", difficulty: 4, impact_score: 65,
    desc: "Implement binding global plastics treaty (currently under UN negotiation), regulate chemical pollutants, and enforce clean water standards. Plastic production accounts for 3.4% of global emissions and is projected to triple by 2060. Upstream regulation (production caps, material standards) is far more effective than downstream cleanup.", ecosystem_link: "ClimateOS", moves_metrics: ["Plastic emissions", "Ocean pollution", "Ecosystem health"] },

  /* ── Workforce & Social ── */
  { id: "g7", name: "Universal Transition Programs", icon: "\u{1F393}", category: "Workforce & Social", co2_kg_yr: 0, cost: "high", difficulty: 5, impact_score: 92,
    desc: "Fund universal reskilling, income bridging, and job placement programs for workers displaced by automation and decarbonization. Without transition support, displaced workers become political opponents of climate action. Just transition programs are not just morally necessary \u2014 they are strategically essential for maintaining the political coalition needed for decarbonization.", ecosystem_link: "TransitionOS", moves_metrics: ["Poverty rate", "Placement rate", "Political support for transition"] },
  { id: "g25", name: "Climate Education in Schools", icon: "\u{1F4DA}", category: "Workforce & Social", co2_kg_yr: 0, cost: "low", difficulty: 2, impact_score: 68,
    desc: "Mandate climate and systems literacy in K\u201312 curricula. The generation entering the workforce needs to understand Earth systems, energy, governance, and complex adaptive systems. Climate education isn't just about awareness \u2014 it's about building the cognitive infrastructure for a population that will face compounding challenges for decades.", ecosystem_link: "CivilizationOS", moves_metrics: ["Public literacy", "Workforce pipeline", "Long-term civic capacity"] },
  { id: "g26", name: "Universal Basic Services for Climate Resilience", icon: "\u{1F3E5}", category: "Workforce & Social", co2_kg_yr: 0, cost: "high", difficulty: 5, impact_score: 82,
    desc: "Guarantee access to clean water, healthcare, public transit, broadband, and basic housing as a foundation for climate resilience. People who are struggling to survive cannot plan for the future. Universal basic services create the security floor that enables participation in the transition and reduces vulnerability to climate shocks.", ecosystem_link: "TransitionOS", moves_metrics: ["Resilience", "Equity index", "Civic participation"] },
  { id: "g27", name: "Climate Migration & Displacement Planning", icon: "\u{1F30D}", category: "Workforce & Social", co2_kg_yr: 0, cost: "medium", difficulty: 4, impact_score: 76,
    desc: "Develop legal frameworks, resettlement programs, and regional cooperation agreements for climate-displaced populations. By 2050, 200+ million people may be displaced by sea level rise, drought, and extreme heat. Managed migration prevents humanitarian crises. Proactive planning is orders of magnitude cheaper than emergency response.", ecosystem_link: "CivilizationOS", moves_metrics: ["Displacement readiness", "Regional cooperation", "Humanitarian cost"] },

  /* ── Governance & Institutions ── */
  { id: "g8", name: "AI Governance Frameworks", icon: "\u{1F3DB}\uFE0F", category: "Governance & Institutions", co2_kg_yr: 0, cost: "low", difficulty: 4, impact_score: 86,
    desc: "Establish mandatory algorithmic audit requirements, AI transparency standards, and citizen oversight mechanisms. AI systems are making increasingly consequential decisions about employment, credit, benefits, and justice. Without governance, these systems amplify existing biases and concentrate power. Democratic legitimacy requires democratic oversight.", ecosystem_link: "GovernanceOS", moves_metrics: ["Charter audit coverage", "AI oversight score", "Democratic health"] },
  { id: "g28", name: "Anti-Corruption & Lobbying Reform", icon: "\u{1F50D}", category: "Governance & Institutions", co2_kg_yr: 0, cost: "free", difficulty: 5, impact_score: 88,
    desc: "Limit fossil fuel lobbying, require disclosure of all political spending, and strengthen anti-corruption enforcement. The #1 obstacle to climate policy is not technology or economics \u2014 it's political capture by incumbent industries. Fossil fuel companies spend billions lobbying against regulations that would save trillions. Governance reform unlocks every other policy on this list.", ecosystem_link: "GovernanceOS", moves_metrics: ["Policy integrity", "Democratic health", "Regulatory independence"] },
  { id: "g29", name: "Citizen Assemblies & Participatory Democracy", icon: "\u{1F5F3}\uFE0F", category: "Governance & Institutions", co2_kg_yr: 0, cost: "low", difficulty: 3, impact_score: 77,
    desc: "Establish citizen assemblies for climate and technology policy. Random selection, expert briefings, and deliberation produce informed, legitimate recommendations. Ireland, France, and the UK have used assemblies to break political gridlock on contentious issues. They work because they give citizens the information and time that elected officials lack.", ecosystem_link: "GovernanceOS", moves_metrics: ["Democratic participation", "Policy legitimacy", "Public trust"] },
  { id: "g30", name: "International Climate Cooperation & Finance", icon: "\u{1F91D}", category: "Governance & Institutions", co2_kg_yr: 1500000000, cost: "high", difficulty: 5, impact_score: 90,
    desc: "Deliver on $100B/yr climate finance commitments to developing nations, reform multilateral development banks, and create loss-and-damage funding. Global emissions can't be halved without the Global South. Rich nations caused the problem and have the capital; developing nations have the growth trajectory and the vulnerability. Cooperation isn't charity \u2014 it's self-interest.", ecosystem_link: "CivilizationOS", moves_metrics: ["Global emissions", "Climate equity", "International cooperation"] },

  /* ── Technology & Innovation ── */
  { id: "g31", name: "Clean Energy R&D Investment", icon: "\u{1F52C}", category: "Technology & Innovation", co2_kg_yr: 500000000, cost: "medium", difficulty: 2, impact_score: 83,
    desc: "Triple public investment in clean energy R&D \u2014 advanced batteries, green hydrogen, direct air capture, fusion, next-gen solar. The technologies that will matter most in 2040 need public R&D funding now. Private capital follows public de-risking. The Department of Energy's ARPA-E model has produced multiple commercial successes per dollar invested.", ecosystem_link: "ClimateOS", moves_metrics: ["Innovation pipeline", "Technology readiness", "Future emissions potential"] },
  { id: "g32", name: "Carbon Removal Procurement", icon: "\u{1F4A8}", category: "Technology & Innovation", co2_kg_yr: 200000000, cost: "high", difficulty: 4, impact_score: 73,
    desc: "Create government advance market commitments for durable carbon removal (DAC, enhanced weathering, biochar). Even with aggressive emissions cuts, we'll likely need to remove 5\u201310 Gt CO\u2082/yr by mid-century. Current capacity is <0.01 Gt. Government procurement guarantees provide the demand certainty that drives cost curves down \u2014 the same model that scaled solar.", ecosystem_link: "ClimateOS", moves_metrics: ["Carbon removal capacity", "Technology cost curves", "Net-zero feasibility"] },
  { id: "g33", name: "Open Data & Climate Intelligence Commons", icon: "\u{1F4BB}", category: "Technology & Innovation", co2_kg_yr: 0, cost: "low", difficulty: 2, impact_score: 67,
    desc: "Fund open climate data infrastructure, satellite monitoring, and shared analytics platforms. Good policy requires good data. Open emissions monitoring (satellite-verified), shared climate models, and accessible impact databases enable accountability, inform investment, and democratize the information needed for effective action at every level.", ecosystem_link: "GovernanceOS", moves_metrics: ["Data quality", "Transparency", "Evidence-based policy"] },

  /* ── Food & Agriculture ── */
  { id: "g34", name: "Agricultural Subsidy Reform", icon: "\u{1F33D}", category: "Food & Agriculture", co2_kg_yr: 700000000, cost: "free", difficulty: 5, impact_score: 81,
    desc: "Redirect $540B/yr in agricultural subsidies from industrial monoculture and livestock to sustainable farming, plant-based protein, and food system resilience. Current subsidies incentivize overproduction, soil degradation, water pollution, and deforestation. Redirecting them is budget-neutral but transformative \u2014 it changes what farmers grow and how they grow it.", ecosystem_link: "ClimateOS", moves_metrics: ["Agricultural emissions", "Land use", "Food system health"] },
  { id: "g35", name: "Food Waste Regulation", icon: "\u{1F34E}", category: "Food & Agriculture", co2_kg_yr: 400000000, cost: "low", difficulty: 2, impact_score: 69,
    desc: "Mandate food waste reporting for large producers, standardize date labeling, and fund redistribution infrastructure. A third of all food is wasted, generating 8\u201310% of global emissions. France's food waste law (banning supermarket food disposal) reduced waste 30% in its first year. Simple regulations with enormous impact.", ecosystem_link: "ClimateOS", moves_metrics: ["Food waste emissions", "Methane from landfills", "Food security"] },
  { id: "g36", name: "Sustainable Protein Transition Support", icon: "\u{1F331}", category: "Food & Agriculture", co2_kg_yr: 500000000, cost: "medium", difficulty: 3, impact_score: 72,
    desc: "Fund alternative protein R&D, remove regulatory barriers for cultivated meat, and shift dietary guidelines. Animal agriculture is ~14.5% of global emissions. Plant-based and cultivated proteins can match nutritional quality at a fraction of the land, water, and emissions. The transition needs public R&D investment, regulatory clarity, and honest dietary guidance.", ecosystem_link: "ClimateOS", moves_metrics: ["Agricultural emissions", "Land use", "Water consumption"] },

  /* ── Health & Environment ── */
  { id: "g37", name: "Air Quality Standards & Enforcement", icon: "\u{1F4A8}", category: "Health & Environment", co2_kg_yr: 300000000, cost: "low", difficulty: 3, impact_score: 76,
    desc: "Tighten PM2.5 and NO\u2082 standards to WHO guidelines and enforce compliance. Air pollution kills 7 million people annually \u2014 more than HIV, malaria, and tuberculosis combined. Stricter standards force coal plant closures, vehicle emissions reductions, and industrial cleanup. The health co-benefits alone justify the cost many times over.", ecosystem_link: "ClimateOS", moves_metrics: ["Air quality", "Public health", "Fossil fuel phase-out"] },
  { id: "g38", name: "Climate-Health Integration", icon: "\u{1F3E5}", category: "Health & Environment", co2_kg_yr: 0, cost: "medium", difficulty: 3, impact_score: 66,
    desc: "Integrate climate projections into public health planning: heat action plans, vector-borne disease surveillance, food safety systems, and mental health support for climate-affected communities. Health systems are on the front line of climate impacts but are rarely included in climate planning. Proactive integration saves lives and reduces crisis costs.", ecosystem_link: "CivilizationOS", moves_metrics: ["Climate resilience", "Public health preparedness", "Adaptation readiness"] },
  { id: "g39", name: "Environmental Justice Protections", icon: "\u2696\uFE0F", category: "Health & Environment", co2_kg_yr: 0, cost: "low", difficulty: 3, impact_score: 74,
    desc: "Mandate environmental impact assessments for frontline communities, require cumulative pollution caps in overburdened areas, and ensure equitable distribution of climate investments. Pollution and climate impacts disproportionately affect low-income communities and communities of color. Justice isn't an add-on \u2014 it's a prerequisite for durable policy.", ecosystem_link: "GovernanceOS", moves_metrics: ["Environmental equity", "Community health", "Policy durability"] },
];

/* ── Aggregate Impact Projections ── */
const IMPACT_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

const aggregateProjection: Record<string, { emissions: number[]; temp: number[]; biodiversity: number[]; equity: number[] }> = {
  aggressive: {
    emissions: [52, 49, 45, 40, 35, 30, 25, 21, 17, 14],
    temp:      [1.2, 1.22, 1.23, 1.24, 1.24, 1.23, 1.22, 1.20, 1.18, 1.15],
    biodiversity: [32, 33, 35, 38, 42, 47, 52, 57, 62, 68],
    equity:    [42, 45, 49, 54, 59, 64, 69, 73, 77, 82],
  },
  moderate: {
    emissions: [52, 50, 48, 46, 43, 40, 38, 35, 33, 30],
    temp:      [1.2, 1.23, 1.26, 1.29, 1.31, 1.33, 1.34, 1.35, 1.35, 1.35],
    biodiversity: [32, 32, 33, 34, 36, 38, 40, 42, 44, 47],
    equity:    [42, 43, 45, 47, 50, 52, 55, 57, 60, 63],
  },
  status_quo: {
    emissions: [52, 52, 53, 53, 54, 54, 55, 55, 55, 55],
    temp:      [1.2, 1.24, 1.28, 1.33, 1.38, 1.43, 1.48, 1.53, 1.58, 1.63],
    biodiversity: [32, 31, 30, 29, 28, 27, 26, 25, 24, 23],
    equity:    [42, 41, 40, 39, 38, 37, 36, 35, 34, 33],
  },
  worst_case: {
    emissions: [52, 53, 55, 57, 59, 61, 63, 65, 67, 70],
    temp:      [1.2, 1.25, 1.31, 1.38, 1.46, 1.55, 1.64, 1.74, 1.85, 1.97],
    biodiversity: [32, 30, 27, 24, 21, 18, 15, 13, 11, 9],
    equity:    [42, 40, 37, 34, 30, 27, 24, 21, 18, 15],
  },
};

/* ── Scores per scenario ── */
const strategyScores: Record<Scenario, { domain: string; score: number; trend: "improving" | "stable" | "declining"; icon: string; color: string; note: string }[]> = {
  aggressive: [
    { domain: "Climate Action", score: 78, trend: "improving", icon: "\u{1F30D}", color: "#10b981", note: "Rapid emissions decline, clean energy at scale, nature restoration funded" },
    { domain: "Economic Transition", score: 72, trend: "improving", icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", note: "Full transition programs, reskilling universal, income gaps bridged" },
    { domain: "Governance Quality", score: 68, trend: "improving", icon: "\u{1F3DB}\uFE0F", color: "#8b5cf6", note: "AI governance active, audits expanding, democratic participation rising" },
    { domain: "Social Equity", score: 65, trend: "improving", icon: "\u2696\uFE0F", color: "#f59e0b", note: "Just transition funded, poverty declining, opportunity gap narrowing" },
    { domain: "Individual Agency", score: 80, trend: "improving", icon: "\u{1F464}", color: "#06b6d4", note: "High civic engagement, norm shift accelerating, personal action widespread" },
    { domain: "Systemic Readiness", score: 74, trend: "improving", icon: "\u2699\uFE0F", color: "#a78bfa", note: "Infrastructure built, institutions adapted, feedback loops functioning" },
  ],
  moderate: [
    { domain: "Climate Action", score: 55, trend: "improving", icon: "\u{1F30D}", color: "#10b981", note: "Emissions bending but insufficient for 1.5°C, clean energy growing" },
    { domain: "Economic Transition", score: 50, trend: "stable", icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", note: "Partial reskilling, income gaps persist for vulnerable workers" },
    { domain: "Governance Quality", score: 48, trend: "stable", icon: "\u{1F3DB}\uFE0F", color: "#8b5cf6", note: "Some AI oversight, audit coverage growing slowly, participation uneven" },
    { domain: "Social Equity", score: 45, trend: "stable", icon: "\u2696\uFE0F", color: "#f59e0b", note: "Transition benefits accrue unevenly, equity gains stall in some regions" },
    { domain: "Individual Agency", score: 58, trend: "improving", icon: "\u{1F464}", color: "#06b6d4", note: "Growing awareness, moderate behavior change, civic engagement rising" },
    { domain: "Systemic Readiness", score: 52, trend: "stable", icon: "\u2699\uFE0F", color: "#a78bfa", note: "Some infrastructure built but critical gaps remain in key systems" },
  ],
  status_quo: [
    { domain: "Climate Action", score: 35, trend: "declining", icon: "\u{1F30D}", color: "#10b981", note: "Emissions flat to rising, tipping points approaching, insufficient action" },
    { domain: "Economic Transition", score: 32, trend: "declining", icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", note: "Workers displaced without support, reskilling fragmented and underfunded" },
    { domain: "Governance Quality", score: 30, trend: "declining", icon: "\u{1F3DB}\uFE0F", color: "#8b5cf6", note: "Minimal AI oversight, corporate capture increasing, trust eroding" },
    { domain: "Social Equity", score: 28, trend: "declining", icon: "\u2696\uFE0F", color: "#f59e0b", note: "Inequality widening, automation benefits concentrated at the top" },
    { domain: "Individual Agency", score: 38, trend: "stable", icon: "\u{1F464}", color: "#06b6d4", note: "Awareness exists but fatigue growing, action feels futile without systemic change" },
    { domain: "Systemic Readiness", score: 30, trend: "declining", icon: "\u2699\uFE0F", color: "#a78bfa", note: "Institutions failing to adapt, infrastructure aging, resilience declining" },
  ],
  worst_case: [
    { domain: "Climate Action", score: 15, trend: "declining", icon: "\u{1F30D}", color: "#10b981", note: "Emissions accelerating, protections rolled back, tipping points crossed" },
    { domain: "Economic Transition", score: 12, trend: "declining", icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", note: "Transition programs defunded, mass displacement, no safety net" },
    { domain: "Governance Quality", score: 10, trend: "declining", icon: "\u{1F3DB}\uFE0F", color: "#8b5cf6", note: "AI unregulated, institutional capture complete, democratic backsliding" },
    { domain: "Social Equity", score: 8, trend: "declining", icon: "\u2696\uFE0F", color: "#f59e0b", note: "Extreme inequality, social fracture, vulnerable populations abandoned" },
    { domain: "Individual Agency", score: 20, trend: "declining", icon: "\u{1F464}", color: "#06b6d4", note: "Civic space shrinking, misinformation rampant, helplessness normalized" },
    { domain: "Systemic Readiness", score: 10, trend: "declining", icon: "\u2699\uFE0F", color: "#a78bfa", note: "Systems in collapse, no coordination, cascading failures accelerating" },
  ],
};

const overviewSummary: Record<Scenario, string> = {
  aggressive: "Under aggressive action, the strategy ecosystem is fully activated. Personal actions are widespread, organizational transformation is underway, and policy frameworks are in place. Every lever is being pulled simultaneously — and the compound effect is dramatic. Emissions fall sharply, transition programs scale, governance adapts, and equity improves. This is not utopian; it is what happens when the strategies that already exist are actually deployed at the scale the crisis demands. The window is still open. The playbook is written. The question is execution.",
  moderate: "Moderate adoption bends the curves but doesn't break them. Leading nations and companies act, but gaps remain. Personal action is growing but hasn't reached critical mass. Policy exists but enforcement lags. The result is a world that is measurably better than inaction but still falls short of what the science requires. This scenario buys time but doesn't solve the problem. It is the most likely near-term outcome — and the most dangerous, because it feels like progress while the underlying dynamics continue to deteriorate.",
  status_quo: "Business as usual means the current trajectory continues. Pledges exceed action. Technology improves but deployment lags. Workers are displaced without support. Governance fails to keep pace with AI. The numbers don't collapse dramatically in any single year — the damage is cumulative and slow, like a tide rising around foundations everyone assumed were permanent. By 2035, the window for many interventions has narrowed to the point where aggressive action becomes the only remaining option, but at much higher cost and lower probability of success.",
  worst_case: "Active regression is not hypothetical — it has precedent. Environmental protections get rolled back. Transition programs are defunded. Nationalism blocks international cooperation. Short-term economic interests override long-term survival. In this scenario, every metric declines. Emissions accelerate. Equity collapses. Governance degrades. The compounding effects create a doom loop: climate damage increases migration, migration increases nationalism, nationalism blocks cooperation, lack of cooperation worsens climate damage. Breaking this cycle requires intervention before it becomes self-sustaining.",
};

/* ── Simulator data ── */
const SIM_ACTIONS = [
  { id: "s_renewable", name: "Everyone switches to renewable energy", co2_gt: 4.2, icon: "\u26A1", cat: "personal" },
  { id: "s_diet", name: "Global shift to plant-forward diets", co2_gt: 3.1, icon: "\u{1F955}", cat: "personal" },
  { id: "s_ev", name: "Universal EV/transit adoption", co2_gt: 5.8, icon: "\u{1F68C}", cat: "personal" },
  { id: "s_buildings", name: "All buildings meet efficiency codes", co2_gt: 4.5, icon: "\u{1F3D7}\uFE0F", cat: "policy" },
  { id: "s_carbon_price", name: "Global carbon price ($100/ton)", co2_gt: 8.0, icon: "\u{1F4B5}", cat: "policy" },
  { id: "s_methane", name: "Full methane regulation", co2_gt: 2.5, icon: "\u{1F4A8}", cat: "policy" },
  { id: "s_nature", name: "Nature-based solutions at scale", co2_gt: 3.0, icon: "\u{1F333}", cat: "policy" },
  { id: "s_supply_chain", name: "Corporate supply chain decarbonization", co2_gt: 6.5, icon: "\u{1F69A}", cat: "org" },
  { id: "s_renewables_grid", name: "100% clean electricity by 2035", co2_gt: 7.0, icon: "\u{1F329}\uFE0F", cat: "policy" },
  { id: "s_transition", name: "Universal transition programs", co2_gt: 0.5, icon: "\u{1F393}", cat: "policy" },
];

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

const letterGrade = (s: number) => s >= 93 ? "A" : s >= 85 ? "A-" : s >= 80 ? "B+" : s >= 73 ? "B" : s >= 68 ? "B-" : s >= 63 ? "C+" : s >= 58 ? "C" : s >= 53 ? "C-" : s >= 48 ? "D+" : s >= 43 ? "D" : s >= 38 ? "D-" : "F";
const gColor = (s: number) => s >= 73 ? "#10b981" : s >= 53 ? "#f59e0b" : s >= 38 ? "#fb923c" : "#f43f5e";
const trendArrow = (t: string) => t === "improving" ? "\u2191" : t === "stable" ? "\u2192" : "\u2193";
const trendColor = (t: string) => t === "improving" ? "#10b981" : t === "stable" ? "#f59e0b" : "#f43f5e";
const costLabel = (c: string) => c === "free" ? "Free" : c === "low" ? "$" : c === "medium" ? "$$" : "$$$";
const costColor = (c: string) => c === "free" ? "#10b981" : c === "low" ? "#38bdf8" : c === "medium" ? "#f59e0b" : "#f43f5e";
const difficultyLabel = (d: number) => d <= 1 ? "Easy" : d <= 2 ? "Moderate" : d <= 3 ? "Involved" : d <= 4 ? "Challenging" : "Systemic";
const fmtCO2 = (kg: number) => kg >= 1e9 ? `${(kg / 1e9).toFixed(1)} Gt` : kg >= 1e6 ? `${(kg / 1e6).toFixed(0)} Mt` : kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${kg} kg`;

function Heading({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <span className="text-2xl">{icon}</span> {title}
      </h2>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{sub}</p>}
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs" style={{ border: "1px solid var(--card-border)" }}>
      <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" && p.value < 10 ? p.value.toFixed(2) : p.value}</strong></p>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function StrategyOSDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [activeScenario, setActiveScenario] = useState<Scenario>("aggressive");
  const [personalFilter, setPersonalFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [policyFilter, setPolicyFilter] = useState<string>("all");
  const [simSelected, setSimSelected] = useState<Set<string>>(new Set());

  const scColor = SC_COLORS[activeScenario];
  const scores = strategyScores[activeScenario];
  const overallScore = Math.round(scores.reduce((a, c) => a + c.score, 0) / scores.length);

  const todayScores = [
    { domain: "Climate Action", score: 35, trend: "declining" as const, icon: "\u{1F30D}", color: "#10b981", note: "Emissions flat to rising, clean energy growing but insufficient pace" },
    { domain: "Economic Transition", score: 32, trend: "declining" as const, icon: "\u{1F6E0}\uFE0F", color: "#38bdf8", note: "Reskilling fragmented, automation displacing faster than support arrives" },
    { domain: "Governance Quality", score: 30, trend: "declining" as const, icon: "\u{1F3DB}\uFE0F", color: "#8b5cf6", note: "Minimal AI oversight, institutional trust eroding, corporate capture" },
    { domain: "Social Equity", score: 28, trend: "declining" as const, icon: "\u2696\uFE0F", color: "#f59e0b", note: "Inequality widening, automation benefits concentrated, safety nets strained" },
    { domain: "Individual Agency", score: 40, trend: "stable" as const, icon: "\u{1F464}", color: "#06b6d4", note: "Awareness growing but action feels futile without systemic support" },
    { domain: "Systemic Readiness", score: 30, trend: "declining" as const, icon: "\u2699\uFE0F", color: "#a78bfa", note: "Institutions slow to adapt, infrastructure aging, resilience declining" },
  ];
  const todayOverall = Math.round(todayScores.reduce((a, c) => a + c.score, 0) / todayScores.length);

  const personalCategories = useMemo(() => ["all", ...Array.from(new Set(PERSONAL_ACTIONS.map(a => a.category)))], []);
  const orgCategories = useMemo(() => ["all", ...Array.from(new Set(ORG_ACTIONS.map(a => a.category)))], []);
  const policyCategories = useMemo(() => ["all", ...Array.from(new Set(POLICY_ACTIONS.map(a => a.category)))], []);

  const filteredPersonal = personalFilter === "all" ? PERSONAL_ACTIONS : PERSONAL_ACTIONS.filter(a => a.category === personalFilter);
  const filteredOrg = orgFilter === "all" ? ORG_ACTIONS : ORG_ACTIONS.filter(a => a.category === orgFilter);
  const filteredPolicy = policyFilter === "all" ? POLICY_ACTIONS : POLICY_ACTIONS.filter(a => a.category === policyFilter);

  const simTotal = useMemo(() => {
    let total = 0;
    SIM_ACTIONS.forEach(a => { if (simSelected.has(a.id)) total += a.co2_gt; });
    return total;
  }, [simSelected]);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "\u{1F4CA}" },
    { id: "personal", label: "Personal Actions", icon: "\u{1F464}" },
    { id: "organization", label: "Organization", icon: "\u{1F3E2}" },
    { id: "policy", label: "Policy", icon: "\u{1F3DB}\uFE0F" },
    { id: "simulator", label: "Impact Simulator", icon: "\u{1F9EA}" },
  ];

  return (
    <main className="min-h-screen pb-20">
      {/* ═══ HEADER ═══ */}
      <header className="relative overflow-hidden pt-10 pb-8 px-4" style={{ background: "linear-gradient(180deg,rgba(245,158,11,0.06) 0%,transparent 100%)" }}>
        <img src="/images/strategy/hero.webp" alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.4em] mb-2" style={{ color: "var(--amber)" }}>StrategyOS</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Actionable Strategies Dashboard</h1>
          <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
            What can we actually do? Personal, organizational, and policy strategies — ranked by real-world impact,
            connected to the metrics they move across the ecosystem.
          </p>
        </div>
      </header>
      <NavBar />

      {/* ═══ NAV ═══ */}
      <nav className="sticky z-50 px-4 py-3" style={{ top: "33px", background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--card-border)" }}>
        <div className="flex gap-2 overflow-x-auto justify-center">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn whitespace-nowrap ${tab === t.id ? "tab-btn-active" : ""}`}>{t.icon} {t.label}</button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8">

        {/* ═══ OVERVIEW ═══ */}
        {tab === "overview" && (
          <section>
            <img src={`/images/strategy/overview-${activeScenario}.webp`} alt="" className="w-full h-40 object-cover rounded-xl mb-6 opacity-60" />
            <Heading icon={"\u{1F4CA}"} title="Strategy Dashboard" sub="Actionable strategy scores across all levels — personal, organizational, and systemic" />

            {/* Strategy Score */}
            <div className="glass-card p-6 mb-8" style={{ borderTop: `3px solid ${gColor(todayOverall)}` }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-5">
                <div className="relative w-24 h-24 flex-shrink-0 mx-auto sm:mx-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={gColor(todayOverall)} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${todayOverall * 2.64} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold" style={{ color: gColor(todayOverall), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(todayOverall)}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{todayOverall}/100</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Today&apos;s Strategy Readiness Score</h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>How prepared are we to execute the strategies that matter? Measured across climate action, economic transition, governance, equity, individual agency, and systemic readiness. Use the scenario selector below to see projected futures.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {todayScores.map(s => (
                  <div key={s.domain} className="glass-card p-3 text-center">
                    <span className="text-lg">{s.icon}</span>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: "var(--text)" }}>{s.domain}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-lg font-bold" style={{ color: gColor(s.score), fontFamily: "'Space Grotesk',sans-serif" }}>{letterGrade(s.score)}</span>
                      <span className="text-sm font-bold" style={{ color: trendColor(s.trend) }}>{trendArrow(s.trend)}</span>
                    </div>
                    <p className="text-[9px] mt-1 leading-tight" style={{ color: "var(--text-muted)" }}>{s.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario Selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Select a strategy scenario</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose a scenario to see how it changes every chart, score, and projection below. The selected scenario is highlighted.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SCENARIOS.map(sc => (
                  <button key={sc.id} onClick={() => setActiveScenario(sc.id)} className={`glass-card overflow-hidden text-left w-full transition-all hover:border-white/20 ${activeScenario === sc.id ? "ring-2" : ""}`} style={activeScenario === sc.id ? { borderColor: `${sc.color}55`, boxShadow: `0 0 20px ${sc.color}11` } : {}}>
                    <img src={`/images/strategy/scenario-${sc.id}.webp`} alt="" className="w-full h-20 object-cover opacity-50" />
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{sc.icon}</span>
                        <h4 className="text-sm font-semibold" style={{ color: sc.color }}>{sc.name}</h4>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sc.desc}</p>
                      {activeScenario === sc.id && <div className="mt-3 text-[9px] font-semibold uppercase tracking-widest" style={{ color: sc.color }}>Active</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aggregate Impact Charts */}
            {(() => {
              const emissionsDesc: Record<string, string> = {
                aggressive: "Aggressive adoption of all strategies drives emissions from 52 Gt to 14 Gt by 2035 \u2014 a 73% reduction. Carbon pricing, clean grid standards, and supply chain decarbonization account for the bulk, while personal and organizational action accelerates the curve. This trajectory is consistent with limiting warming to 1.5\u00b0C.",
                moderate: "Moderate adoption bends the emissions curve meaningfully but insufficiently. Emissions fall to 30 Gt by 2035 \u2014 a 42% reduction. Leading nations and companies deliver, but gaps in policy enforcement and uneven adoption prevent the steep decline the science requires. Buys time, doesn't solve the problem.",
                status_quo: "Under business as usual, emissions remain flat around 52\u201355 Gt through 2035. Efficiency gains are offset by continued growth. The world overshoots every carbon budget consistent with 1.5\u00b0C and locks in infrastructure that commits decades of future emissions. Each year of delay narrows the remaining window.",
                worst_case: "Active regression pushes emissions to 70 Gt by 2035. Rollback of protections, expansion of fossil infrastructure, and defunding of clean energy programs reverse a decade of progress. This trajectory makes 2\u00b0C warming virtually unavoidable and puts 3\u201c4\u00b0C into view by century's end.",
              };
              const tempDesc: Record<string, string> = {
                aggressive: "Aggressive action holds near-term warming near 1.2\u00b0C and bends the trajectory toward 1.15\u00b0C by 2035. The aerosol unmasking effect means warming doesn't drop immediately even with steep emissions cuts, but the long-term trajectory shifts decisively. This is the only scenario where peak warming stays below 1.5\u00b0C.",
                moderate: "Warming reaches 1.35\u00b0C by 2035 under moderate adoption and is still rising, though slowly. The temperature response lags emissions reductions by decades, so even moderate action now prevents significant future warming. But the trajectory hasn't peaked \u2014 we're still heading upward, just more slowly.",
                status_quo: "Business as usual pushes warming to 1.63\u00b0C by 2035 with strong upward momentum. Each tenth of a degree triggers disproportionate impacts: more extreme weather, accelerating ice loss, ecosystem stress. At this rate, 2\u00b0C is crossed in the 2040s and dangerous tipping points enter the probability space.",
                worst_case: "Regression drives warming to nearly 2\u00b0C by 2035 \u2014 a full decade earlier than most projections assumed. The acceleration comes from both rising emissions and weakened carbon sinks (deforestation, ocean saturation). Multiple tipping points become likely, creating feedback loops that drive further warming regardless of future human action.",
              };
              const bioDesc: Record<string, string> = {
                aggressive: "The biodiversity index climbs from 32 to 68 by 2035 under aggressive action. Nature-based solutions, protected area expansion, pollution reduction, and agricultural reform allow ecosystems to begin recovering. Coral reefs stabilize, reforestation programs mature, and species extinction rates decline. Recovery is slow but real.",
                moderate: "Biodiversity edges up from 32 to 47 \u2014 a meaningful but fragile improvement. Protection of new areas slows habitat loss, and some degraded ecosystems begin partial recovery. But funding gaps, enforcement weakness, and continued agricultural expansion limit the gains. The index improves but remains far below a healthy baseline.",
                status_quo: "Biodiversity continues its long decline, falling from 32 to 23 by 2035. Habitat destruction outpaces protection. Climate stress compounds with pollution, invasive species, and overharvesting. The sixth mass extinction accelerates quietly. Ecosystem services that billions depend on \u2014 pollination, water filtration, soil health \u2014 degrade.",
                worst_case: "Biodiversity collapses to 9 by 2035. Deforestation protection is rolled back. Ocean acidification crosses critical thresholds for shellfish and coral. Multiple keystone species enter terminal decline. The cascading effects threaten food systems, freshwater supplies, and coastal protection. Some losses become irreversible within this decade.",
              };
              const equityDesc: Record<string, string> = {
                aggressive: "The equity index rises from 42 to 82 by 2035. Universal transition programs ensure automation's benefits are shared. Income bridging prevents poverty spirals. Climate action creates millions of quality jobs in communities that need them most. Just transition funding prevents the political backlash that derails climate policy in other scenarios.",
                moderate: "Equity improves modestly to 63 by 2035. Some transition programs exist but coverage is uneven. Wealthier nations and communities benefit disproportionately from clean energy and reskilling investments. The gap between those who can adapt and those who cannot narrows but doesn't close. Progress is real but insufficient.",
                status_quo: "Equity declines to 33 by 2035. Automation displaces workers without support. Climate impacts hit vulnerable communities hardest. The wealth generated by AI and clean energy concentrates among those who already have capital. Rising inequality fuels political instability, which in turn blocks the cooperative action needed to reverse the trend.",
                worst_case: "Equity collapses to 15 by 2035. Transition programs are defunded. Climate adaptation is privatized. Automation benefits accrue entirely to capital owners. A generation of displaced workers faces permanent downward mobility. Social fracture deepens along every axis \u2014 income, geography, age, race. The social contract frays beyond repair.",
              };
              return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Emissions */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Global Emissions (Gt CO{"\u2082"}e/yr)</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Projected 2026{"\u2013"}2035 {"\u2014"} highlighting <strong style={{ color: scColor }}>{SC_NAMES[activeScenario]}</strong></p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={IMPACT_YEARS.map((yr, i) => {
                    const row: any = { year: yr };
                    for (const sc of Object.keys(aggregateProjection)) row[sc] = aggregateProjection[sc].emissions[i];
                    return row;
                  })}>
                    <defs>
                      {Object.entries(SC_COLORS).map(([k, c]) => (<linearGradient key={k} id={`em-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={activeScenario === k ? 0.3 : 0.08} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<ChartTip />} />
                    {Object.entries(SC_COLORS).map(([k, c]) => (<Area key={k} type="monotone" dataKey={k} stroke={c} fill={`url(#em-${k})`} strokeWidth={activeScenario === k ? 3 : 1.5} strokeOpacity={activeScenario === k ? 1 : 0.35} name={SC_NAMES[k]} />))}
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{emissionsDesc[activeScenario]}</p>
              </div>

              {/* Temperature */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Temperature Trajectory ({"\u00b0"}C above pre-industrial)</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Near-term warming path under each strategy adoption level</p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={IMPACT_YEARS.map((yr, i) => {
                    const row: any = { year: yr };
                    for (const sc of Object.keys(aggregateProjection)) row[sc] = aggregateProjection[sc].temp[i];
                    return row;
                  })}>
                    <defs>
                      {Object.entries(SC_COLORS).map(([k, c]) => (<linearGradient key={k} id={`tp-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={activeScenario === k ? 0.3 : 0.08} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis domain={[1.0, 2.2]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<ChartTip />} />
                    {Object.entries(SC_COLORS).map(([k, c]) => (<Area key={k} type="monotone" dataKey={k} stroke={c} fill={`url(#tp-${k})`} strokeWidth={activeScenario === k ? 3 : 1.5} strokeOpacity={activeScenario === k ? 1 : 0.35} name={SC_NAMES[k]} />))}
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{tempDesc[activeScenario]}</p>
              </div>

              {/* Biodiversity */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Biodiversity Health Index (0{"\u2013"}100)</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Ecosystem restoration and protection trajectory</p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={IMPACT_YEARS.map((yr, i) => {
                    const row: any = { year: yr };
                    for (const sc of Object.keys(aggregateProjection)) row[sc] = aggregateProjection[sc].biodiversity[i];
                    return row;
                  })}>
                    <defs>
                      {Object.entries(SC_COLORS).map(([k, c]) => (<linearGradient key={k} id={`bd-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={activeScenario === k ? 0.3 : 0.08} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<ChartTip />} />
                    {Object.entries(SC_COLORS).map(([k, c]) => (<Area key={k} type="monotone" dataKey={k} stroke={c} fill={`url(#bd-${k})`} strokeWidth={activeScenario === k ? 3 : 1.5} strokeOpacity={activeScenario === k ? 1 : 0.35} name={SC_NAMES[k]} />))}
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{bioDesc[activeScenario]}</p>
              </div>

              {/* Equity */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Social Equity Index (0{"\u2013"}100)</h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>Just transition, opportunity distribution, and vulnerability reduction</p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={IMPACT_YEARS.map((yr, i) => {
                    const row: any = { year: yr };
                    for (const sc of Object.keys(aggregateProjection)) row[sc] = aggregateProjection[sc].equity[i];
                    return row;
                  })}>
                    <defs>
                      {Object.entries(SC_COLORS).map(([k, c]) => (<linearGradient key={k} id={`eq-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={activeScenario === k ? 0.3 : 0.08} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<ChartTip />} />
                    {Object.entries(SC_COLORS).map(([k, c]) => (<Area key={k} type="monotone" dataKey={k} stroke={c} fill={`url(#eq-${k})`} strokeWidth={activeScenario === k ? 3 : 1.5} strokeOpacity={activeScenario === k ? 1 : 0.35} name={SC_NAMES[k]} />))}
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-muted)" }}>{equityDesc[activeScenario]}</p>
              </div>
            </div>
              );
            })()}

            {/* Radar */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Strategy Domain Radar — {SC_NAMES[activeScenario]}</h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={scores.map(s => ({ domain: s.domain, score: s.score }))}>
                  <PolarGrid stroke="rgba(51,65,85,0.3)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke={scColor} fill={scColor} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${scColor}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: scColor, fontFamily: "'Space Grotesk',sans-serif" }}>
                The Strategy Outlook: {SC_NAMES[activeScenario]}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{overviewSummary[activeScenario]}</p>
            </div>
          </section>
        )}

        {/* ═══ PERSONAL ACTIONS ═══ */}
        {tab === "personal" && (
          <section>
            <Heading icon={"\u{1F464}"} title="Personal Actions" sub="Strategies individuals can execute now — ranked by impact, with CO₂ savings estimates" />

            <div className="glass-card p-5 mb-6" style={{ borderLeft: "3px solid var(--amber)" }}>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)" }}>The most impactful personal actions are not the ones you hear about most.</strong> Skipping a plastic straw saves 1.5g of CO₂. Switching your energy provider saves 1,800 kg. Voting for candidates with credible climate plans can move gigatons. The actions below are ranked by actual impact — not by how virtuous they feel. Start with the highest-impact actions you haven&apos;t done yet.
              </p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {personalCategories.map(c => (
                <button key={c} onClick={() => setPersonalFilter(c)} className={`tab-btn ${personalFilter === c ? "tab-btn-active" : ""}`}>
                  {c === "all" ? `All (${PERSONAL_ACTIONS.length})` : `${c} (${PERSONAL_ACTIONS.filter(a => a.category === c).length})`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPersonal.sort((a, b) => b.impact_score - a.impact_score).map(action => (
                <div key={action.id} className="glass-card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{action.name}</h4>
                        <span className="text-lg font-bold" style={{ color: gColor(action.impact_score), fontFamily: "'Space Grotesk',sans-serif" }}>{action.impact_score}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "var(--amber)" }}>{action.category}</span>
                        <span style={{ color: costColor(action.cost) }}>Cost: {costLabel(action.cost)}</span>
                        <span style={{ color: "var(--text-faint)" }}>Difficulty: {difficultyLabel(action.difficulty)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{action.desc}</p>
                  <div className="flex items-center justify-between text-[10px] pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
                    <div className="flex items-center gap-3">
                      {action.co2_kg_yr > 0 && <span style={{ color: "var(--emerald)" }}>🌿 {fmtCO2(action.co2_kg_yr)}/yr saved</span>}
                      <span style={{ color: "var(--text-faint)" }}>Links to: <strong style={{ color: "var(--sky)" }}>{action.ecosystem_link}</strong></span>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {action.moves_metrics.slice(0, 2).map(m => (
                        <span key={m} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-faint)" }}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Personal Impact Summary */}
            <div className="glass-card p-6 mt-6" style={{ borderTop: "3px solid var(--emerald)" }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Total Personal Impact Potential</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>If you implemented every personal action above:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: "var(--emerald)", fontFamily: "'Space Grotesk',sans-serif" }}>{fmtCO2(PERSONAL_ACTIONS.reduce((a, c) => a + c.co2_kg_yr, 0))}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>CO₂ saved per year</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: "var(--amber)", fontFamily: "'Space Grotesk',sans-serif" }}>{PERSONAL_ACTIONS.length}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Actionable strategies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: "var(--sky)", fontFamily: "'Space Grotesk',sans-serif" }}>{PERSONAL_ACTIONS.filter(a => a.cost === "free").length}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Free to implement</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: "var(--violet)", fontFamily: "'Space Grotesk',sans-serif" }}>{Math.round(PERSONAL_ACTIONS.reduce((a, c) => a + c.impact_score, 0) / PERSONAL_ACTIONS.length)}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Avg impact score</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══ ORGANIZATION ACTIONS ═══ */}
        {tab === "organization" && (
          <section>
            <Heading icon={"\u{1F3E2}"} title="Organization Strategies" sub="What businesses, institutions, and organizations can do now — with system-level impact" />

            <div className="glass-card p-5 mb-6" style={{ borderLeft: "3px solid var(--sky)" }}>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)" }}>Organizations are where personal intention meets systemic scale.</strong> A single company setting science-based targets moves more carbon than a thousand individuals changing light bulbs. Supply chain decarbonization alone can address 70-90% of most companies&apos; total emissions. These strategies are ranked by the leverage they create — not just within the organization, but across the systems they touch.
              </p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {orgCategories.map(c => (
                <button key={c} onClick={() => setOrgFilter(c)} className={`tab-btn ${orgFilter === c ? "tab-btn-active" : ""}`}>
                  {c === "all" ? `All (${ORG_ACTIONS.length})` : `${c} (${ORG_ACTIONS.filter(a => a.category === c).length})`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrg.sort((a, b) => b.impact_score - a.impact_score).map(action => (
                <div key={action.id} className="glass-card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{action.name}</h4>
                        <span className="text-lg font-bold" style={{ color: gColor(action.impact_score), fontFamily: "'Space Grotesk',sans-serif" }}>{action.impact_score}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(56,189,248,0.1)", color: "var(--sky)" }}>{action.category}</span>
                        <span style={{ color: costColor(action.cost) }}>Cost: {costLabel(action.cost)}</span>
                        <span style={{ color: "var(--text-faint)" }}>Difficulty: {difficultyLabel(action.difficulty)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{action.desc}</p>
                  <div className="flex items-center justify-between text-[10px] pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
                    <div className="flex items-center gap-3">
                      {action.co2_kg_yr > 0 && <span style={{ color: "var(--emerald)" }}>🌿 {fmtCO2(action.co2_kg_yr)}/yr saved</span>}
                      <span style={{ color: "var(--text-faint)" }}>Links to: <strong style={{ color: "var(--sky)" }}>{action.ecosystem_link}</strong></span>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {action.moves_metrics.slice(0, 2).map(m => (
                        <span key={m} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-faint)" }}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Org Impact Bar Chart */}
            <div className="glass-card p-6 mt-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Organization Strategies — Impact vs CO₂ Reduction</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ORG_ACTIONS.sort((a, b) => b.co2_kg_yr - a.co2_kg_yr).map(a => ({ name: a.name.length > 25 ? a.name.slice(0, 25) + "…" : a.name, impact: a.impact_score, co2: Math.round(a.co2_kg_yr / 1000) }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="co2" name="CO₂ saved (tonnes/yr)" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ═══ POLICY ACTIONS ═══ */}
        {tab === "policy" && (
          <section>
            <Heading icon={"\u{1F3DB}\uFE0F"} title="Policy Interventions" sub="Government and institutional levers — ranked by cost-effectiveness and systemic impact" />

            <div className="glass-card p-5 mb-6" style={{ borderLeft: "3px solid var(--violet)" }}>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)" }}>Policy is the multiplier.</strong> Individual actions matter, but one well-designed regulation can achieve what a million individual choices cannot. Carbon pricing alone can redirect trillions in capital allocation. Building codes lock in decades of energy savings. Transport mandates provide manufacturing certainty. These interventions are ranked by the evidence on cost-effectiveness and systemic leverage. Advocacy for these policies is itself one of the highest-impact personal actions available.
              </p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {policyCategories.map(c => (
                <button key={c} onClick={() => setPolicyFilter(c)} className={`tab-btn ${policyFilter === c ? "tab-btn-active" : ""}`}>
                  {c === "all" ? `All (${POLICY_ACTIONS.length})` : `${c} (${POLICY_ACTIONS.filter(a => a.category === c).length})`}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredPolicy.sort((a, b) => b.impact_score - a.impact_score).map((action, i) => (
                <div key={action.id} className="glass-card p-5" style={{ borderLeft: `3px solid ${gColor(action.impact_score)}` }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: `${gColor(action.impact_score)}22` }}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${gColor(action.impact_score)}22`, color: gColor(action.impact_score) }}>#{i + 1}</span>
                          <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{action.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold" style={{ color: gColor(action.impact_score), fontFamily: "'Space Grotesk',sans-serif" }}>{action.impact_score}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "var(--violet)" }}>{action.category}</span>
                        <span style={{ color: costColor(action.cost) }}>Cost: {costLabel(action.cost)}</span>
                        <span style={{ color: "var(--text-faint)" }}>Difficulty: {difficultyLabel(action.difficulty)}</span>
                        {action.co2_kg_yr > 0 && <span style={{ color: "var(--emerald)" }}>🌿 {fmtCO2(action.co2_kg_yr)}/yr</span>}
                      </div>
                      <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>{action.desc}</p>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span style={{ color: "var(--text-faint)" }}>Links to: <strong style={{ color: "var(--sky)" }}>{action.ecosystem_link}</strong></span>
                        <div className="flex gap-1 flex-wrap">
                          {action.moves_metrics.map(m => (
                            <span key={m} className="px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-faint)" }}>{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Policy Impact Summary */}
            <div className="glass-card p-6 mt-6" style={{ borderTop: "3px solid var(--violet)" }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Combined Policy Impact</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                If every policy intervention above were implemented at scale, the combined reduction potential exceeds <strong style={{ color: "var(--emerald)" }}>{fmtCO2(POLICY_ACTIONS.reduce((a, c) => a + c.co2_kg_yr, 0))}/yr</strong> — roughly half of current global emissions. No single policy is sufficient, but the combined effect of carbon pricing, clean energy standards, building codes, transport electrification, methane regulation, and nature-based solutions creates a mutually reinforcing system where each policy amplifies the others. The evidence is clear. The strategies exist. The obstacle is political will.
              </p>
            </div>
          </section>
        )}

        {/* ═══ IMPACT SIMULATOR ═══ */}
        {tab === "simulator" && (
          <section>
            <Heading icon={"\u{1F9EA}"} title="Impact Simulator" sub="What if everyone did this? Select strategies and see the aggregate effect on global emissions." />

            <div className="glass-card p-6 mb-6" style={{ borderTop: `3px solid ${simTotal >= 20 ? "#10b981" : simTotal >= 10 ? "#f59e0b" : "#f43f5e"}` }}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={simTotal >= 20 ? "#10b981" : simTotal >= 10 ? "#f59e0b" : "#f43f5e"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.min(simTotal / 52 * 264, 264)} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: simTotal >= 20 ? "#10b981" : simTotal >= 10 ? "#f59e0b" : "#f43f5e", fontFamily: "'Space Grotesk',sans-serif" }}>{simTotal.toFixed(1)}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>Gt CO₂/yr cut</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Aggregate Emissions Reduction</h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Current global emissions: ~52 Gt CO₂e/yr. Select strategies below to see how much they collectively reduce.
                    {simTotal > 0 && <> Your selection cuts <strong style={{ color: "var(--emerald)" }}>{Math.round(simTotal / 52 * 100)}%</strong> of global emissions.</>}
                  </p>
                  <div className="flex gap-4 mt-3 text-[10px] justify-center sm:justify-start">
                    <span style={{ color: "var(--text-faint)" }}>{simSelected.size} of {SIM_ACTIONS.length} selected</span>
                    {simSelected.size > 0 && <button onClick={() => setSimSelected(new Set())} className="underline" style={{ color: "var(--rose)" }}>Clear all</button>}
                    {simSelected.size < SIM_ACTIONS.length && <button onClick={() => setSimSelected(new Set(SIM_ACTIONS.map(a => a.id)))} className="underline" style={{ color: "var(--emerald)" }}>Select all</button>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {SIM_ACTIONS.map(action => {
                const selected = simSelected.has(action.id);
                const catColor = action.cat === "personal" ? "#f59e0b" : action.cat === "org" ? "#38bdf8" : "#8b5cf6";
                return (
                  <button key={action.id} onClick={() => {
                    const next = new Set(simSelected);
                    if (selected) next.delete(action.id); else next.add(action.id);
                    setSimSelected(next);
                  }} className={`glass-card p-4 text-left w-full transition-all hover:border-white/20 ${selected ? "ring-2" : ""}`} style={selected ? { borderColor: `${catColor}55`, boxShadow: `0 0 20px ${catColor}11` } : {}}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: selected ? catColor : "var(--text)" }}>{action.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded-full" style={{ background: `${catColor}15`, color: catColor }}>{action.cat}</span>
                          <span style={{ color: "var(--emerald)" }}>−{action.co2_gt} Gt/yr</span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ background: selected ? catColor : "rgba(255,255,255,0.05)", color: selected ? "#fff" : "var(--text-faint)" }}>
                        {selected ? "✓" : "+"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulator bar chart */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Selected Strategies — Reduction Breakdown</h3>
              {simSelected.size === 0 ? (
                <p className="text-xs text-center py-8" style={{ color: "var(--text-faint)" }}>Select strategies above to see the impact breakdown.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, simSelected.size * 45)}>
                  <BarChart data={SIM_ACTIONS.filter(a => simSelected.has(a.id)).sort((a, b) => b.co2_gt - a.co2_gt).map(a => ({ name: a.name.length > 30 ? a.name.slice(0, 30) + "…" : a.name, reduction: a.co2_gt }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} unit=" Gt" />
                    <YAxis type="category" dataKey="name" width={200} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="reduction" name="CO₂ reduction (Gt/yr)" radius={[0, 4, 4, 0]}>
                      {SIM_ACTIONS.filter(a => simSelected.has(a.id)).sort((a, b) => b.co2_gt - a.co2_gt).map((a) => (
                        <Cell key={a.id} fill={a.cat === "personal" ? "#f59e0b" : a.cat === "org" ? "#38bdf8" : "#8b5cf6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Simulator narrative */}
            <div className="glass-card p-6" style={{ borderLeft: `3px solid ${simTotal >= 20 ? "#10b981" : simTotal >= 10 ? "#f59e0b" : "#f43f5e"}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: simTotal >= 20 ? "#10b981" : simTotal >= 10 ? "#f59e0b" : "#f43f5e", fontFamily: "'Space Grotesk',sans-serif" }}>
                {simTotal >= 30 ? "Transformative Impact" : simTotal >= 20 ? "Major Progress" : simTotal >= 10 ? "Meaningful But Insufficient" : simTotal > 0 ? "A Start — But More Is Needed" : "No Strategies Selected"}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {simTotal === 0 && "Select strategies above to see what collective action could achieve."}
                {simTotal > 0 && simTotal < 10 && `Your selected strategies would reduce global emissions by ${simTotal.toFixed(1)} Gt/yr — about ${Math.round(simTotal / 52 * 100)}% of the total. This is a meaningful contribution but falls well short of what's needed to stay below 1.5°C. The gap between current emissions (52 Gt) and a safe trajectory (~25 Gt by 2035) requires stacking multiple interventions across all levels — personal, organizational, and policy.`}
                {simTotal >= 10 && simTotal < 20 && `A reduction of ${simTotal.toFixed(1)} Gt/yr (${Math.round(simTotal / 52 * 100)}% of global emissions) is significant but not yet sufficient. The strategies you've selected would visibly bend the emissions curve. To reach the ~25 Gt target by 2035, you'd need to roughly double this impact — achievable by combining the remaining policy levers with widespread organizational action.`}
                {simTotal >= 20 && simTotal < 30 && `At ${simTotal.toFixed(1)} Gt/yr reduction (${Math.round(simTotal / 52 * 100)}% of emissions), you're in the range of what the science requires. This combination of strategies, if implemented at scale, would put the world on a trajectory consistent with limiting warming to well below 2°C. The compound effects — where each strategy amplifies the others — mean the real impact may be even larger.`}
                {simTotal >= 30 && `A ${simTotal.toFixed(1)} Gt/yr reduction would cut global emissions by ${Math.round(simTotal / 52 * 100)}%. This is transformative. It would put the world firmly on a path to below 1.5°C warming by century's end. Every major emissions source is addressed. The remaining challenge is implementation speed and political coordination — not knowledge or technology. The strategies exist. The question is whether we deploy them.`}
              </p>
            </div>
          </section>
        )}

      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="mt-16 px-4 py-8 text-center text-xs" style={{ borderTop: "1px solid var(--card-border)", color: "var(--text-faint)" }}>
        <p className="mb-3">StrategyOS {"\u2014"} Part of the Civilization Futures Ecosystem</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/climate" style={{ color: "#10b981" }}>{"\u{1F30D}"} ClimateOS</a>
          <a href="/transition" style={{ color: "#38bdf8" }}>{"\u{1F6E0}\uFE0F"} TransitionOS</a>
          <a href="/governance" style={{ color: "#8b5cf6" }}>{"\u{1F3DB}\uFE0F"} GovernanceOS</a>
          <a href="/civilization" style={{ color: "#06b6d4" }}>{"\u{1F30D}"} CivilizationOS</a>
          <a href="/simulation" style={{ color: "#f43f5e" }}>{"\u{1F52C}"} Simulation</a>
          <a href="https://github.com/reillyclawcode/strategyOS" target="_blank" rel="noopener" style={{ color: "var(--text-faint)" }}>{"\u{1F4BB}"} GitHub</a>
        </div>
      </footer>
    </main>
  );
}
