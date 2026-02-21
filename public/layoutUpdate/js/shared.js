/* ================================================================
   SHARED UTILITIES — Feltron Design System
   ================================================================ */

/* ── Grade helpers ── */
function grade(s){return s>=93?'A':s>=85?'A\u2212':s>=80?'B+':s>=73?'B':s>=68?'B\u2212':s>=63?'C+':s>=58?'C':s>=53?'C\u2212':s>=48?'D+':s>=43?'D':s>=38?'D\u2212':'F'}
function gClr(s){return s>=73?'#4ecdc4':s>=53?'#e8a838':s>=38?'#c48a3f':'#d4622a'}
function avg(arr){return Math.round(arr.reduce(function(a,b){return a+b},0)/arr.length)}
function fmtK(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':String(n)}
function fmtPct(n,d){d=d||1;return n.toFixed(d)+'%'}

/* ── Global constants ── */
var PAGE_ORDER=[
  {href:'index.html',label:'Home'},
  {href:'ai.html',label:'AI'},
  {href:'civilization.html',label:'Civilization'},
  {href:'simulation.html',label:'Simulation'},
  {href:'visualizer.html',label:'Visualizer'},
  {href:'climate.html',label:'Climate'},
  {href:'transition.html',label:'Transition'},
  {href:'governance.html',label:'Governance'},
  {href:'strategy.html',label:'Strategy'},
  {href:'timeline.html',label:'Timeline'},
  {href:'research.html',label:'Research'},
  {href:'chat.html',label:'Advisor'},
  {href:'about.html',label:'About'}
];

var SCENARIOS=[
  {id:'aggressive',name:'Aggressive',color:'#4ecdc4'},
  {id:'moderate',name:'Moderate',color:'#5da5da'},
  {id:'bau',name:'BAU',color:'#e8a838'},
  {id:'worst',name:'Worst',color:'#d4622a'}
];

/* ================================================================
   SITE NAV — JS Template
   ================================================================ */
function renderSiteNav(){
  var h='<nav class="site-nav"><div class="page">';
  h+='<button class="mobile-nav-toggle" aria-label="Toggle navigation"><span class="hamburger"><span></span><span></span><span></span></span></button>';
  h+='<div class="site-nav-inner">';
  PAGE_ORDER.forEach(function(p){ h+='<a href="'+p.href+'">'+p.label+'</a>'; });
  h+='<button class="theme-toggle" id="theme-toggle" aria-label="Toggle light/dark mode" title="Toggle theme">';
  h+='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  h+='</button>';
  h+='</div>';
  h+='</div></nav>';
  h+='<div class="mobile-nav-backdrop"></div>';
  return h;
}

function renderScenarioButtons(){
  var h='';
  SCENARIOS.forEach(function(s){
    h+='<button class="scenario-btn" data-sc="'+s.id+'"><span class="dot" style="background:'+s.color+'"></span>'+s.name+'</button>';
  });
  return h;
}

function initSiteNav(){
  var path=window.location.pathname;
  document.querySelectorAll('.site-nav a').forEach(function(a){
    var href=a.getAttribute('href');
    if(href && path.indexOf(href)!==-1 && href!=='index.html') a.classList.add('active');
    else if(href==='index.html' && (path.endsWith('/')||path.endsWith('/index.html'))) a.classList.add('active');
  });

  var toggle=document.querySelector('.mobile-nav-toggle');
  var links=document.querySelector('.site-nav-inner');
  var backdrop=document.querySelector('.mobile-nav-backdrop');
  if(!toggle||!links) return;

  function close(){links.classList.remove('open');if(backdrop)backdrop.classList.remove('open');toggle.querySelector('.hamburger').classList.remove('hamburger--open')}
  function open(){links.classList.add('open');if(backdrop)backdrop.classList.add('open');toggle.querySelector('.hamburger').classList.add('hamburger--open')}

  toggle.addEventListener('click',function(){links.classList.contains('open')?close():open()});
  if(backdrop) backdrop.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close)});

  initThemeToggle();
}

/* ================================================================
   DARK / LIGHT MODE
   ================================================================ */
function initThemeToggle(){
  var btn=document.getElementById('theme-toggle');
  if(!btn) return;
  var saved=null;
  try{saved=localStorage.getItem('aicivsim-theme')}catch(e){}
  if(saved==='light') document.body.classList.add('light');

  btn.addEventListener('click',function(){
    document.body.classList.toggle('light');
    var isLight=document.body.classList.contains('light');
    try{localStorage.setItem('aicivsim-theme',isLight?'light':'dark')}catch(e){}
    btn.setAttribute('aria-label',isLight?'Switch to dark mode':'Switch to light mode');
  });
}

/* ================================================================
   SCENARIO PERSISTENCE — hash + localStorage
   ================================================================ */
function getScenarioFromHash(){
  var h=window.location.hash.replace('#','');
  if(h&&/^(aggressive|moderate|bau|worst)$/.test(h)) return h;
  try{var ls=localStorage.getItem('aicivsim-scenario');if(ls&&/^(aggressive|moderate|bau|worst)$/.test(ls))return ls}catch(e){}
  return null;
}
function setScenarioHash(id){
  if(window.history&&window.history.replaceState) window.history.replaceState(null,'','#'+id);
  else window.location.hash=id;
  try{localStorage.setItem('aicivsim-scenario',id)}catch(e){}
}
function initScenarioSelector(barSelector,callback){
  var btns=document.querySelectorAll(barSelector+' .scenario-btn');
  btns.forEach(function(b){
    b.addEventListener('click',function(){
      setScenarioHash(b.dataset.sc);
      callback(b.dataset.sc);
    });
  });
  var fromHash=getScenarioFromHash();
  if(fromHash){
    setTimeout(function(){callback(fromHash)},0);
  }
}

function updateScenarioBar(barSelector,activeId,scenarios){
  var sc=scenarios||SCENARIOS;
  document.querySelectorAll(barSelector+' .scenario-btn').forEach(function(b){
    var sid=b.dataset.sc;
    var info=sc.find(function(s){return s.id===sid});
    if(!info) return;
    var isA=sid===activeId;
    b.style.color=isA?info.color:'var(--text-faint)';
    b.setAttribute('aria-pressed',isA?'true':'false');
    b.setAttribute('aria-label','Scenario: '+info.name+(isA?' (active)':''));
    var dot=b.querySelector('.dot');
    if(dot) dot.style.background=isA?info.color:'rgba(255,255,255,0.1)';
  });
}

/* ================================================================
   ANIMATED TRANSITIONS
   ================================================================ */
function fadeSwitch(el,newHTML,dur){
  dur=dur||250;
  el.style.transition='opacity '+dur+'ms ease';
  el.style.opacity='0.3';
  setTimeout(function(){
    el.innerHTML=newHTML;
    el.style.opacity='1';
  },dur);
}

function animateValue(el,end,opts){
  opts=opts||{};
  var duration=opts.duration||600;
  var prefix=opts.prefix||'';
  var suffix=opts.suffix||'';
  var dec=opts.dec||0;
  var raw=el.textContent.replace(/[^0-9.\-]/g,'');
  var start=parseFloat(raw)||0;
  if(Math.abs(start-end)<0.01){el.textContent=prefix+end.toFixed(dec)+suffix;return}
  var range=end-start;
  var startTime=null;
  function step(ts){
    if(!startTime)startTime=ts;
    var p=Math.min((ts-startTime)/duration,1);
    var eased=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
    el.textContent=prefix+(start+range*eased).toFixed(dec)+suffix;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ================================================================
   DATA EXPORT — CSV download
   ================================================================ */
function downloadCSV(filename,headers,rows){
  var csv=headers.join(',')+'\n';
  rows.forEach(function(r){csv+=r.join(',')+'\n'});
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportChartData(datasets,startYear,endYear,unit,prefix){
  prefix=prefix||'';unit=unit||'';
  var years=[];
  var nPts=0;
  for(var k in datasets){nPts=datasets[k].length;break}
  for(var i=0;i<nPts;i++) years.push(startYear+Math.round(i*(endYear-startYear)/(nPts-1)));
  var headers=['Year'];
  var keys=Object.keys(datasets);
  keys.forEach(function(k){
    var sc=SCENARIOS.find(function(s){return s.id===k});
    headers.push(sc?sc.name:k);
  });
  var rows=[];
  for(var yi=0;yi<nPts;yi++){
    var row=[years[yi]];
    keys.forEach(function(k){row.push(prefix+datasets[k][yi]+unit)});
    rows.push(row);
  }
  return {headers:headers,rows:rows};
}

/* ================================================================
   CROSS-SYSTEM FEEDBACK LOOPS — scenario-aware
   ================================================================ */
var CROSS_SYSTEM={
  climate:{
    label:'Climate',color:'var(--climate)',
    impacts:[
      {target:'transition',label:'Transition',
        aggressive:{weight:-0.05,effect:'Managed green transition creates short-term displacement but reskilling infrastructure absorbs it. Net workforce disruption minimal.'},
        moderate:{weight:-0.10,effect:'Moderate climate investment displaces some fossil-fuel workers. Reskilling programs exist but lag behind demand.'},
        bau:{weight:-0.22,effect:'Unmanaged climate shifts force rapid fossil-fuel exits. No reskilling infrastructure — mass displacement underway.'},
        worst:{weight:-0.35,effect:'Climate emergencies trigger industry collapse across multiple sectors. Workforce displacement is systemic and unaddressed.'}},
      {target:'governance',label:'Governance',
        aggressive:{weight:-0.03,effect:'Climate stability reduces emergency governance burden. Institutions focus on long-term planning rather than crisis response.'},
        moderate:{weight:-0.08,effect:'Periodic climate events strain governance capacity. Institutions cope but emergency protocols consume bandwidth.'},
        bau:{weight:-0.18,effect:'Frequent climate disasters erode institutional trust. Governance capacity diverted to perpetual crisis management.'},
        worst:{weight:-0.30,effect:'Cascading climate failures overwhelm institutions entirely. Public trust in governance collapses.'}},
      {target:'civilization',label:'Civilization',
        aggressive:{weight:-0.04,effect:'Environmental recovery improves quality of life. Biodiversity stabilizing. Air and water quality trending positive.'},
        moderate:{weight:-0.10,effect:'Mixed environmental outcomes. Some regions improve, others degrade. Inequality in environmental quality persists.'},
        bau:{weight:-0.20,effect:'Environmental degradation accelerates. Heat stress, water scarcity, and crop failure reduce wellbeing across populations.'},
        worst:{weight:-0.38,effect:'Multiple tipping points breached. Civilizational wellbeing in freefall as habitable zones shrink and resources collapse.'}},
      {target:'strategy',label:'Strategy',
        aggressive:{weight:0.10,effect:'Climate urgency galvanizes public action. Strategy adoption accelerates as citizens see tangible environmental progress.'},
        moderate:{weight:0.04,effect:'Moderate climate awareness drives some strategy adoption. Public engagement uneven across demographics.'},
        bau:{weight:-0.06,effect:'Climate fatigue sets in. Public disengages from strategy adoption as problems feel insurmountable.'},
        worst:{weight:-0.14,effect:'Climate despair paralyzes action. Strategy adoption collapses as populations shift to survival mode.'}},
      {target:'simulation',label:'Simulation',
        aggressive:{weight:0.08,effect:'Positive climate data validates simulation models. Public trust in projections increases, strengthening evidence-based policy.'},
        moderate:{weight:0.03,effect:'Mixed climate results create uncertainty in simulation accuracy. Model credibility holds but confidence is tepid.'},
        bau:{weight:-0.05,effect:'Worsening climate outcomes undermine confidence in simulation models. Policy-makers question projection value.'},
        worst:{weight:-0.12,effect:'Climate reality far exceeds worst projections. Simulation credibility collapses — models seen as dangerously optimistic.'}},
      {target:'ai',label:'AI',
        aggressive:{weight:0.12,effect:'Climate stability enables long-horizon AI research. Resources shift from crisis management to alignment work and safety infrastructure.'},
        moderate:{weight:0.05,effect:'Moderate climate pressure allows some AI safety investment but competes with adaptation spending.'},
        bau:{weight:-0.06,effect:'Climate emergencies redirect AI development toward short-term disaster response, crowding out alignment research.'},
        worst:{weight:-0.15,effect:'Climate collapse forces AI into triage mode. No bandwidth for alignment — all compute devoted to survival logistics.'}}
    ]
  },
  transition:{
    label:'Transition',color:'var(--workforce)',
    impacts:[
      {target:'governance',label:'Governance',
        aggressive:{weight:0.18,effect:'Near-full employment and civic dividends create an engaged, trusting citizenry. Institutional legitimacy at historic highs.'},
        moderate:{weight:0.10,effect:'Moderate workforce stability supports civic participation. Trust rebuilding, but gaps remain in underserved regions.'},
        bau:{weight:-0.05,effect:'Rising unemployment breeds frustration and disengagement. Civic participation declining as economic anxiety grows.'},
        worst:{weight:-0.20,effect:'Mass unemployment destroys social contract. Anti-institutional sentiment surges. Governance legitimacy in crisis.'}},
      {target:'civilization',label:'Civilization',
        aggressive:{weight:0.20,effect:'Universal reskilling and civic dividends dramatically reduce poverty and inequality. Workforce transition becomes a model for equity.'},
        moderate:{weight:0.12,effect:'Partial reskilling reduces poverty but inequality persists. Some communities left behind by automation wave.'},
        bau:{weight:-0.08,effect:'Poverty rising as automation displaces without replacement. Inequality widening. Middle class eroding.'},
        worst:{weight:-0.25,effect:'Permanent underclass forming. No pathway from displacement to employment. Inequality at levels not seen in a century.'}},
      {target:'climate',label:'Climate',
        aggressive:{weight:0.12,effect:'Reskilled workforce powers green energy buildout. Clean sector employment exceeds fossil-fuel legacy jobs.'},
        moderate:{weight:0.06,effect:'Some workers transition to green sectors but pace is slow. Net emissions benefit modest.'},
        bau:{weight:-0.02,effect:'No workforce pipeline for green sectors. Clean energy buildout bottlenecked by labor shortages.'},
        worst:{weight:-0.08,effect:'Economic collapse reduces emissions through degrowth — not by design but by failure. No green transition.'}},
      {target:'strategy',label:'Strategy',
        aggressive:{weight:0.15,effect:'Employed, secure populations invest in long-term strategies. Reskilling culture normalizes lifelong learning and civic action.'},
        moderate:{weight:0.07,effect:'Moderate economic security allows some strategic planning. Adoption concentrated among those with stable employment.'},
        bau:{weight:-0.04,effect:'Economic precarity leaves no bandwidth for strategic engagement. Survival overrides long-term planning.'},
        worst:{weight:-0.12,effect:'Mass unemployment eliminates capacity for strategy adoption. Populations focused entirely on immediate survival.'}},
      {target:'simulation',label:'Simulation',
        aggressive:{weight:0.10,effect:'Successful transition validates simulation projections. Public trust in modeling strengthens evidence-based governance.'},
        moderate:{weight:0.04,effect:'Partial transition results provide mixed validation of simulation models. Credibility holds in some sectors.'},
        bau:{weight:-0.03,effect:'Stalled transition outcomes cast doubt on simulation accuracy. Policy-makers question model assumptions.'},
        worst:{weight:-0.10,effect:'Catastrophic workforce outcomes discredit simulation models entirely. Projections seen as meaningless in crisis.'}},
      {target:'ai',label:'AI',
        aggressive:{weight:0.14,effect:'Reskilled workforce includes AI safety and alignment talent. Broad technical literacy supports informed governance of AI systems.'},
        moderate:{weight:0.06,effect:'Some reskilling pathways include AI skills. Technical literacy growing but unevenly distributed.'},
        bau:{weight:-0.04,effect:'No AI literacy in reskilling programs. Public unable to participate meaningfully in AI governance debates.'},
        worst:{weight:-0.12,effect:'Workforce collapse means no pipeline for AI safety talent. AI development concentrated in a shrinking, unaccountable elite.'}}
    ]
  },
  civilization:{
    label:'Civilization',color:'#e8a838',
    impacts:[
      {target:'governance',label:'Governance',
        aggressive:{weight:0.15,effect:'High wellbeing and equity produce an engaged citizenry. Democratic institutions strengthened by broad participation.'},
        moderate:{weight:0.08,effect:'Moderate wellbeing supports baseline civic engagement. Institutional trust slowly rebuilding.'},
        bau:{weight:-0.05,effect:'Declining wellbeing reduces civic participation. Apathy and distrust spreading through affected communities.'},
        worst:{weight:-0.18,effect:'Civilizational decline breeds extremism and institutional rejection. Democratic norms under direct threat.'}},
      {target:'transition',label:'Transition',
        aggressive:{weight:0.12,effect:'Civic dividends fund reskilling and reduce displacement friction. Transition costs shared equitably.'},
        moderate:{weight:0.06,effect:'Some dividend funding reaches displaced workers. Reskilling partially subsidized but unevenly distributed.'},
        bau:{weight:-0.04,effect:'No dividend system. Displaced workers bear full transition costs individually.'},
        worst:{weight:-0.15,effect:'Social safety net collapsed. No resources available for workforce transition of any kind.'}},
      {target:'strategy',label:'Strategy',
        aggressive:{weight:0.18,effect:'High public awareness and engagement drive rapid adoption of personal, organizational, and policy strategies.'},
        moderate:{weight:0.10,effect:'Moderate public engagement. Strategy adoption concentrated in already-active demographics.'},
        bau:{weight:0.02,effect:'Low engagement limits strategy adoption to early adopters. Systemic change stalls.'},
        worst:{weight:-0.08,effect:'Public disengagement and cynicism prevent any meaningful strategy adoption. Fatalism dominates.'}},
      {target:'climate',label:'Climate',
        aggressive:{weight:0.08,effect:'High wellbeing enables climate investment. Prosperous societies prioritize environmental stewardship and fund green infrastructure.'},
        moderate:{weight:0.03,effect:'Moderate wellbeing allows some environmental investment. Climate remains a priority but competes with other concerns.'},
        bau:{weight:-0.04,effect:'Declining wellbeing pushes climate down the priority list. Short-term economic survival overrides environmental goals.'},
        worst:{weight:-0.10,effect:'Civilizational crisis eliminates climate capacity. Survival needs consume all resources — environment abandoned.'}},
      {target:'simulation',label:'Simulation',
        aggressive:{weight:0.06,effect:'Strong civilizational outcomes validate simulation utility. Public demand for data-driven governance grows.'},
        moderate:{weight:0.02,effect:'Mixed civilizational outcomes produce moderate confidence in simulation models.'},
        bau:{weight:-0.03,effect:'Worsening conditions reduce public interest in simulation. Fatalism replaces evidence-based planning.'},
        worst:{weight:-0.08,effect:'Civilizational decline makes simulation feel irrelevant. Populations abandon data-driven approaches for reactive survival.'}},
      {target:'ai',label:'AI',
        aggressive:{weight:0.16,effect:'Thriving civilization demands responsible AI. Public engagement drives alignment mandates, safety audits, and transparent deployment at scale.'},
        moderate:{weight:0.08,effect:'Moderate civilizational health supports baseline AI governance. Safety norms emerging but enforcement is inconsistent.'},
        bau:{weight:-0.05,effect:'Declining wellbeing makes AI safety a luxury concern. Development prioritizes economic extraction over alignment.'},
        worst:{weight:-0.14,effect:'Civilizational collapse makes AI an instrument of control rather than a tool for flourishing. Alignment abandoned entirely.'}}
    ]
  },
  governance:{
    label:'Governance',color:'var(--governance)',
    impacts:[
      {target:'climate',label:'Climate',
        aggressive:{weight:0.22,effect:'Strong governance enforces carbon pricing, renewable mandates, and conservation targets. Climate policy fully funded and binding.'},
        moderate:{weight:0.12,effect:'Partial governance enables some climate policy. Carbon pricing exists but enforcement is inconsistent.'},
        bau:{weight:0.02,effect:'Weak governance produces voluntary commitments only. No binding climate legislation. Industry self-regulates.'},
        worst:{weight:-0.10,effect:'Governance capture by fossil-fuel interests actively blocks climate action. Regulatory rollback underway.'}},
      {target:'civilization',label:'Civilization',
        aggressive:{weight:0.18,effect:'Democratic institutions protect equity, distribute AI productivity gains, and ensure universal service access.'},
        moderate:{weight:0.10,effect:'Institutions provide partial safety net. Equity improving but concentrated benefits persist.'},
        bau:{weight:-0.05,effect:'Weak institutions unable to counter wealth concentration. AI gains flow to capital owners.'},
        worst:{weight:-0.20,effect:'Institutional failure enables authoritarian capture. Equity protections dismantled. Surveillance replaces democracy.'}},
      {target:'transition',label:'Transition',
        aggressive:{weight:0.15,effect:'Policy mandates fund universal reskilling, regulate automation pace, and guarantee transition support.'},
        moderate:{weight:0.08,effect:'Some policy support for workforce transition. Reskilling funded but not mandated.'},
        bau:{weight:-0.02,effect:'No policy framework for workforce transition. Market forces alone determine outcomes.'},
        worst:{weight:-0.12,effect:'Governance collapse means no labor protections. Workers face automation with zero institutional support.'}},
      {target:'strategy',label:'Strategy',
        aggressive:{weight:0.14,effect:'Strong institutional frameworks legitimize and amplify grassroots strategies. Policy creates fertile ground for civic action.'},
        moderate:{weight:0.06,effect:'Some institutional support for strategy adoption. Advocacy channels exist but compete for attention.'},
        bau:{weight:-0.02,effect:'Weak institutions provide no framework for organized strategy. Individual action remains disconnected.'},
        worst:{weight:-0.10,effect:'Institutional collapse delegitimizes organized strategy. Advocacy seen as futile against captured systems.'}},
      {target:'simulation',label:'Simulation',
        aggressive:{weight:0.12,effect:'Strong governance enables transparent simulation infrastructure. Public trust in modeling underpins policy decisions.'},
        moderate:{weight:0.06,effect:'Moderate governance supports simulation credibility. Some transparency gaps limit full public confidence.'},
        bau:{weight:-0.04,effect:'Weak governance undermines simulation independence. Models perceived as politically influenced.'},
        worst:{weight:-0.14,effect:'Governance failure makes simulation impossible. No institutional capacity to maintain or trust modeling infrastructure.'}},
      {target:'ai',label:'AI',
        aggressive:{weight:0.22,effect:'Binding AI charters, mandatory safety audits, and transparent deployment frameworks create the strongest foundation for aligned AI development.'},
        moderate:{weight:0.12,effect:'Partial governance frameworks cover major AI systems. Safety norms exist but enforcement varies by jurisdiction.'},
        bau:{weight:-0.04,effect:'No binding AI governance. Voluntary principles are widely ignored. Development outpaces any regulatory capacity.'},
        worst:{weight:-0.20,effect:'Governance capture by AI interests eliminates oversight entirely. AI development is unregulated and opaque.'}}
    ]
  },
  strategy:{
    label:'Strategy',color:'var(--equity)',
    impacts:[
      {target:'climate',label:'Climate',
        aggressive:{weight:0.10,effect:'Widespread individual and organizational action measurably reduces emissions. Consumer behavior shifts accelerate corporate change.'},
        moderate:{weight:0.05,effect:'Moderate adoption of green strategies. Some measurable emissions impact from early movers.'},
        bau:{weight:0.01,effect:'Minimal voluntary action. Individual strategies too scattered to produce systemic impact.'},
        worst:{weight:-0.03,effect:'Strategy adoption near zero. Public fatalism prevents even personal action.'}},
      {target:'governance',label:'Governance',
        aggressive:{weight:0.12,effect:'Organized advocacy and civic engagement strengthen democratic institutions and accelerate charter adoption.'},
        moderate:{weight:0.06,effect:'Moderate civic pressure supports governance reform. Charter awareness growing but adoption patchy.'},
        bau:{weight:0.01,effect:'No organized pressure for governance reform. Status quo entrenched.'},
        worst:{weight:-0.05,effect:'Anti-institutional movements undermine governance reform efforts. Advocacy groups defunded or suppressed.'}},
      {target:'transition',label:'Transition',
        aggressive:{weight:0.14,effect:'Proactive organizational reskilling and individual upskilling reduce displacement severity. Companies invest ahead of automation.'},
        moderate:{weight:0.08,effect:'Some organizations invest in reskilling. Individual upskilling growing but unevenly distributed.'},
        bau:{weight:0.02,effect:'Negligible proactive reskilling. Organizations automate first, address displacement later (if at all).'},
        worst:{weight:-0.04,effect:'No organizational investment in transition. Workers abandoned to market forces.'}},
      {target:'civilization',label:'Civilization',
        aggressive:{weight:0.10,effect:'Widespread strategy adoption improves quality of life. Communities organized around shared goals see measurable wellbeing gains.'},
        moderate:{weight:0.05,effect:'Moderate strategy adoption benefits engaged communities. Wellbeing improvements concentrated in organized populations.'},
        bau:{weight:0.01,effect:'Scattered strategy adoption produces negligible civilization-scale impact. Benefits limited to individuals.'},
        worst:{weight:-0.06,effect:'Strategy collapse removes last buffer against declining wellbeing. No grassroots resilience to offset systemic failures.'}},
      {target:'simulation',label:'Simulation',
        aggressive:{weight:0.08,effect:'High strategy adoption generates rich feedback data. Simulation models improve as real-world action validates projections.'},
        moderate:{weight:0.03,effect:'Some strategy data feeds back into simulation. Model accuracy improves incrementally.'},
        bau:{weight:0.00,effect:'Minimal strategy action provides no useful feedback data. Simulation models run without real-world validation.'},
        worst:{weight:-0.04,effect:'No strategy adoption means no feedback loop. Simulation operates in a vacuum, disconnected from reality.'}},
      {target:'ai',label:'AI',
        aggressive:{weight:0.10,effect:'Organized advocacy drives AI transparency mandates. Grassroots pressure creates accountability infrastructure for AI deployment.'},
        moderate:{weight:0.05,effect:'Some public advocacy for AI safety. Awareness growing but action concentrated among technical communities.'},
        bau:{weight:0.01,effect:'Minimal public attention to AI governance. Development proceeds without organized public input.'},
        worst:{weight:-0.06,effect:'Public disengagement from AI governance enables unchecked development. No grassroots accountability mechanism exists.'}}
    ]
  },
  simulation:{
    label:'Simulation',color:'var(--technology)',
    impacts:[
      {target:'climate',label:'Climate',
        aggressive:{weight:0.25,effect:'Maximum climate capex allocation directly funds renewable buildout, grid storage, and carbon capture at scale.'},
        moderate:{weight:0.15,effect:'Moderate climate investment produces measurable but incomplete decarbonization trajectory.'},
        bau:{weight:0.03,effect:'Minimal climate investment. Emissions reduction depends entirely on market-driven technology adoption.'},
        worst:{weight:-0.05,effect:'Climate investment actively defunded. Fossil-fuel subsidies restored. Emissions trajectory worsening.'}},
      {target:'transition',label:'Transition',
        aggressive:{weight:0.22,effect:'High civic dividends and reskilling investment create comprehensive workforce safety net.'},
        moderate:{weight:0.12,effect:'Moderate dividend and reskilling investment provides partial coverage. Gaps remain for hardest-hit sectors.'},
        bau:{weight:-0.05,effect:'No dividend system. Minimal reskilling. Automation proceeds without workforce support.'},
        worst:{weight:-0.18,effect:'Zero workforce investment. Automation maximized for profit extraction. Displacement is a feature, not a bug.'}},
      {target:'governance',label:'Governance',
        aggressive:{weight:0.18,effect:'Full transparency and binding AI charter create accountable, participatory governance infrastructure.'},
        moderate:{weight:0.10,effect:'Active charter and moderate transparency support governance but lack universal enforcement.'},
        bau:{weight:-0.03,effect:'No charter, minimal transparency. AI governance is voluntary and toothless.'},
        worst:{weight:-0.15,effect:'Governance deliberately weakened. AI systems deployed without oversight. Accountability mechanisms dismantled.'}},
      {target:'civilization',label:'Civilization',
        aggressive:{weight:0.16,effect:'Simulation-driven policy optimizes resource allocation. Civic dividends, healthcare, and education calibrated by predictive models.'},
        moderate:{weight:0.08,effect:'Partial simulation guidance improves some civilizational outcomes. Policy calibration better than guesswork but incomplete.'},
        bau:{weight:-0.04,effect:'No simulation guidance for policy. Civilizational outcomes determined by ad-hoc decisions and political convenience.'},
        worst:{weight:-0.12,effect:'Simulation misuse or collapse leaves civilization flying blind. No evidence base for critical resource decisions.'}},
      {target:'strategy',label:'Strategy',
        aggressive:{weight:0.14,effect:'Simulation clarity shows citizens exactly which strategies matter. Evidence-based action plans drive adoption at every level.'},
        moderate:{weight:0.06,effect:'Moderate simulation output informs some strategy choices. Public has partial visibility into what actions work.'},
        bau:{weight:-0.02,effect:'No simulation insight available to public. Strategy adoption based on intuition, marketing, and ideology.'},
        worst:{weight:-0.08,effect:'Simulation credibility destroyed. Citizens have no trusted information source for strategic decisions.'}},
      {target:'ai',label:'AI',
        aggressive:{weight:0.20,effect:'Simulation infrastructure directly powers AI safety testing. Scenario modeling validates alignment approaches before deployment at scale.'},
        moderate:{weight:0.10,effect:'Some simulation resources applied to AI evaluation. Safety testing exists but does not cover frontier models comprehensively.'},
        bau:{weight:-0.03,effect:'No simulation infrastructure for AI safety. Models deployed without scenario testing or impact projection.'},
        worst:{weight:-0.14,effect:'Simulation collapse eliminates the only tool capable of projecting AI risk at scale. Development proceeds without foresight.'}}
    ]
  },
  ai:{
    label:'AI',color:'#e8a838',
    impacts:[
      {target:'climate',label:'Climate',
        aggressive:{weight:0.18,effect:'Aligned AI optimizes energy grids, accelerates materials science for renewables, and models climate interventions with unprecedented accuracy.'},
        moderate:{weight:0.08,effect:'AI contributes to climate modeling and some optimization. Deployment is helpful but not transformative.'},
        bau:{weight:-0.06,effect:'AI compute demands increase energy consumption. No alignment mandate means AI optimizes for profit, not sustainability.'},
        worst:{weight:-0.18,effect:'Unaligned AI massively increases compute energy demand. AI-driven resource extraction accelerates environmental collapse.'}},
      {target:'simulation',label:'Simulation',
        aggressive:{weight:0.22,effect:'Aligned AI dramatically improves simulation fidelity. Predictive models achieve unprecedented accuracy through AI-augmented scenario analysis.'},
        moderate:{weight:0.10,effect:'AI moderately improves simulation capabilities. Some models benefit but integration is incomplete.'},
        bau:{weight:-0.04,effect:'AI development proceeds without simulation integration. Models remain static while AI capabilities outpace them.'},
        worst:{weight:-0.15,effect:'Unaligned AI produces adversarial outputs that actively corrupt simulation integrity. Model trust collapses.'}},
      {target:'transition',label:'Transition',
        aggressive:{weight:-0.08,effect:'Even aligned AI automates roles, but strong governance ensures reskilling keeps pace. Net displacement minimal with civic dividend buffers.'},
        moderate:{weight:-0.14,effect:'AI automation displaces workers faster than reskilling absorbs. Moderate support reduces but does not eliminate disruption.'},
        bau:{weight:-0.25,effect:'Rapid AI automation without workforce support creates mass displacement. No reskilling infrastructure to absorb the shock.'},
        worst:{weight:-0.35,effect:'Unregulated AI eliminates jobs at scale. No safety net, no reskilling, no transition pathway. Permanent structural unemployment.'}},
      {target:'civilization',label:'Civilization',
        aggressive:{weight:0.20,effect:'Aligned AI serves as a tool for human flourishing — optimizing healthcare, education, and resource distribution equitably.'},
        moderate:{weight:0.08,effect:'AI provides some civilizational benefits but gains are unevenly distributed. Equity gaps persist in access to AI services.'},
        bau:{weight:-0.08,effect:'AI concentrates wealth and power. Productivity gains flow to capital owners. Inequality accelerates.'},
        worst:{weight:-0.22,effect:'Unaligned AI becomes an instrument of surveillance and control. Civilizational wellbeing collapses as autonomy erodes.'}},
      {target:'governance',label:'Governance',
        aggressive:{weight:0.15,effect:'Transparent AI systems strengthen democratic institutions. Algorithmic audits, open models, and participatory AI governance become the norm.'},
        moderate:{weight:0.06,effect:'Some AI governance frameworks emerge. Transparency improving but regulatory capture remains a risk.'},
        bau:{weight:-0.08,effect:'AI outpaces governance capacity. Institutions cannot regulate what they do not understand. Democratic oversight erodes.'},
        worst:{weight:-0.22,effect:'AI actively undermines democratic governance through deepfakes, manipulation, and surveillance. Institutional legitimacy destroyed.'}},
      {target:'strategy',label:'Strategy',
        aggressive:{weight:0.14,effect:'AI-powered analysis helps citizens identify the highest-leverage strategies. Personalized action plans drive adoption at every level.'},
        moderate:{weight:0.06,effect:'Some AI tools available for strategy planning. Adoption aided by technology but limited by access inequality.'},
        bau:{weight:-0.03,effect:'AI tools exist but are proprietary and inaccessible. Strategy adoption gains no benefit from AI capabilities.'},
        worst:{weight:-0.10,effect:'AI-generated misinformation actively undermines strategy adoption. Citizens cannot distinguish real from synthetic guidance.'}}
    ]
  }
};

/* ================================================================
   VIZ_METRICS — summary timeseries for the 3D visualization and
   any page that needs a quick per-system metric overview.
   Each system has 2-3 headline metrics with 25-point (2026-2050)
   data arrays per scenario. Keep in sync with dashboard pages.
   ================================================================ */
var VIZ_METRICS={
  climate:[
    {id:'temp',label:'Temperature Rise',unit:'\u00b0C',prefix:'+',dir:'lower',
     data:{aggressive:[1.1,1.12,1.14,1.15,1.16,1.17,1.18,1.18,1.19,1.19,1.2,1.2,1.2,1.2,1.2,1.2,1.19,1.19,1.18,1.18,1.17,1.16,1.15,1.14,1.13],
           moderate:[1.1,1.13,1.16,1.2,1.24,1.28,1.33,1.37,1.42,1.46,1.5,1.54,1.57,1.6,1.63,1.66,1.69,1.71,1.73,1.74,1.75,1.76,1.77,1.78,1.79],
           bau:[1.1,1.18,1.28,1.4,1.53,1.67,1.82,1.97,2.12,2.27,2.4,2.5,2.58,2.65,2.7,2.74,2.78,2.81,2.84,2.87,2.89,2.91,2.92,2.94,2.95],
           worst:[1.1,1.24,1.42,1.64,1.89,2.16,2.44,2.71,2.97,3.2,3.4,3.55,3.68,3.79,3.89,3.98,4.08,4.17,4.27,4.36,4.43,4.49,4.53,4.57,4.6]}},
    {id:'renewable',label:'Renewable Share',unit:'%',dir:'higher',
     data:{aggressive:[30,33,37,41,46,51,56,61,66,71,75,79,82,85,87,89,91,93,94,95,96,97,97,98,99],
           moderate:[30,32,35,38,41,44,48,52,56,60,63,67,70,73,75,78,80,82,83,85,86,87,87,88,88],
           bau:[30,31,33,35,37,39,41,43,45,47,49,50,52,53,55,56,57,58,59,60,61,62,63,63,64],
           worst:[30,31,32,33,34,35,36,37,37,38,38,39,39,40,40,40,41,41,41,41,42,42,42,42,42]}},
    {id:'co2',label:'CO\u2082 Concentration',unit:'ppm',dir:'lower',
     data:{aggressive:[421,418,414,410,406,402,398,394,390,387,384,381,378,376,374,372,371,370,369,368,368,367,367,366,366],
           moderate:[421,420,419,418,417,416,414,413,411,409,408,406,404,403,402,401,400,399,398,397,397,396,396,395,395],
           bau:[421,424,428,433,439,446,454,462,470,479,487,495,503,510,517,523,529,534,538,542,545,547,549,550,551],
           worst:[421,428,438,450,464,480,498,518,539,560,581,601,621,639,656,672,687,701,714,727,740,753,766,779,790]}}
  ],
  simulation:[
    {id:'score',label:'Simulation Score',unit:'/100',dir:'higher',
     data:{aggressive:[50,52,54,57,60,63,66,69,72,74,76,78,80,82,83,84,86,87,88,88,89,89,89,90,90],
           moderate:[50,51,52,54,56,58,60,61,63,64,65,66,67,67,68,68,69,69,69,70,70,70,70,70,70],
           bau:[50,49,48,47,46,45,44,43,42,41,40,40,39,39,38,38,37,37,36,36,36,35,35,35,35],
           worst:[50,48,46,43,40,37,34,31,29,27,25,24,22,21,20,19,18,18,17,17,16,16,15,15,15]}}
  ],
  transition:[
    {id:'reskill',label:'Reskill Completion',unit:'%',dir:'higher',
     data:{aggressive:[8,12,17,23,29,36,42,49,55,61,66,70,74,77,79,81,83,84,86,87,88,89,89,90,90],
           moderate:[8,10,13,16,20,24,28,32,36,40,43,46,49,52,54,56,58,60,62,63,64,65,66,67,68],
           bau:[8,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,25,26,26,27,27,28],
           worst:[8,8,8,8,8,8,8,9,9,9,9,10,10,10,10,10,11,11,11,11,11,12,12,12,12]}},
    {id:'poverty',label:'Poverty Rate',unit:'%',dir:'lower',
     data:{aggressive:[11,10.5,10,9.4,8.8,8.2,7.6,7.0,6.5,6.0,5.5,5.1,4.7,4.3,4.0,3.7,3.4,3.2,3.0,2.8,2.6,2.5,2.4,2.3,2.2],
           moderate:[11,10.8,10.6,10.3,10.1,9.8,9.5,9.2,8.9,8.6,8.3,8.1,7.8,7.6,7.4,7.2,7.0,6.9,6.7,6.6,6.5,6.4,6.3,6.2,6.1],
           bau:[11,11.2,11.5,11.9,12.3,12.8,13.3,13.9,14.4,15.0,15.5,16.0,16.5,17.0,17.4,17.8,18.2,18.5,18.8,19.1,19.3,19.5,19.7,19.9,20],
           worst:[11,11.5,12.2,13.1,14.2,15.5,17.0,18.6,20.3,22.0,23.7,25.3,26.8,28.2,29.4,30.5,31.5,32.3,33.0,33.6,34.1,34.5,34.8,35.0,35.2]}}
  ],
  ai:[
    {id:'alignment',label:'Alignment Index',unit:'/100',dir:'higher',
     data:{aggressive:[48,52,56,60,64,68,72,75,78,80,82,84,86,87,88,89,90,90,91,91,91,92,92,92,92],
           moderate:[48,50,52,54,56,58,60,61,62,63,64,65,65,66,66,67,67,67,68,68,68,68,68,68,68],
           bau:[48,47,46,44,43,42,40,39,38,37,36,35,34,34,33,33,32,32,32,32,32,32,32,32,32],
           worst:[48,45,42,38,35,31,27,24,21,18,16,14,12,11,10,10,10,10,10,10,10,10,10,10,10]}},
    {id:'transparency',label:'Model Transparency',unit:'%',dir:'higher',
     data:{aggressive:[15,20,26,33,40,48,55,62,68,73,78,82,85,88,90,92,93,94,95,95,96,96,96,97,97],
           moderate:[15,18,21,24,28,32,36,39,42,45,48,50,52,54,55,56,57,58,59,59,60,60,60,61,61],
           bau:[15,15,14,14,14,13,13,13,13,13,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12],
           worst:[15,13,11,10,8,7,6,5,5,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3]}}
  ],
  civilization:[
    {id:'health',label:'Health Index',unit:'/100',dir:'higher',
     data:{aggressive:[44,46,49,52,55,58,61,64,66,68,70,72,74,75,76,77,78,79,79,80,80,80,81,81,81],
           moderate:[44,45,46,47,49,50,52,53,54,55,56,57,57,58,59,59,60,60,60,60,61,61,61,61,61],
           bau:[44,43,42,41,40,39,38,37,36,36,35,34,34,33,33,32,32,31,31,31,30,30,30,30,30],
           worst:[44,42,40,37,35,32,30,27,25,23,21,20,19,18,17,16,15,15,14,14,14,13,13,13,13]}},
    {id:'equity',label:'Equity Score',unit:'/100',dir:'higher',
     data:{aggressive:[38,40,43,46,49,52,55,58,61,63,66,68,70,72,73,75,76,77,78,79,79,80,80,81,81],
           moderate:[38,39,40,41,42,43,44,46,47,48,49,50,51,52,53,53,54,55,55,56,56,57,57,57,58],
           bau:[38,37,36,35,34,33,32,31,31,30,29,29,28,28,27,27,26,26,26,25,25,25,25,24,24],
           worst:[38,36,34,31,29,26,24,22,20,18,17,15,14,13,12,12,11,11,10,10,10,9,9,9,9]}}
  ],
  governance:[
    {id:'participation',label:'Civic Participation',unit:'%',dir:'higher',
     data:{aggressive:[12,15,19,23,28,33,38,43,48,53,57,61,64,67,70,72,74,76,77,78,79,80,81,82,82],
           moderate:[12,13,15,17,19,22,24,27,29,32,34,36,38,40,42,44,45,47,48,49,50,51,52,53,53],
           bau:[12,12,12,12,12,12,12,12,13,13,13,13,13,14,14,14,14,14,14,15,15,15,15,15,15],
           worst:[12,11,11,10,10,9,9,8,8,7,7,7,6,6,6,6,5,5,5,5,5,5,5,5,5]}},
    {id:'trust',label:'Institutional Trust',unit:'%',dir:'higher',
     data:{aggressive:[28,31,34,38,42,46,50,54,57,60,63,65,67,69,71,73,74,75,76,77,78,78,79,79,80],
           moderate:[28,29,30,31,33,34,36,37,39,40,42,43,44,46,47,48,49,50,51,52,52,53,54,54,55],
           bau:[28,27,27,26,26,25,25,24,24,23,23,23,22,22,22,21,21,21,21,20,20,20,20,20,20],
           worst:[28,26,24,22,20,18,16,15,13,12,11,10,10,9,9,8,8,7,7,7,7,6,6,6,6]}}
  ],
  strategy:[
    {id:'adoption',label:'Action Adoption',unit:'%',dir:'higher',
     data:{aggressive:[15,19,24,29,35,41,47,53,58,63,67,71,74,77,79,81,83,84,85,86,87,87,88,88,88],
           moderate:[15,17,19,22,25,28,31,34,37,40,42,44,46,48,50,51,53,54,55,56,57,58,58,59,59],
           bau:[15,15,15,15,15,16,16,16,16,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,20],
           worst:[15,14,13,12,11,10,10,9,9,8,8,7,7,7,6,6,6,6,6,5,5,5,5,5,5]}},
    {id:'score',label:'Strategy Score',unit:'/100',dir:'higher',
     data:{aggressive:[35,38,42,46,50,54,58,62,66,69,72,74,76,78,80,81,83,84,85,86,87,87,88,88,88],
           moderate:[35,36,38,40,42,44,46,48,49,51,52,54,55,56,57,58,59,59,60,61,61,61,62,62,62],
           bau:[35,34,33,32,31,30,29,28,28,27,27,26,26,25,25,24,24,23,23,23,22,22,22,22,22],
           worst:[35,33,30,28,25,22,20,18,16,14,13,12,11,10,10,9,9,8,8,8,8,8,8,8,8]}}
  ]
};

/* ================================================================
   SIM_ENGINE — Simulation timeseries & narrative generation
   Canonical data source shared by simulation.html and viz.html.
   44-point arrays cover 2027–2070; use simInterp(arr, year) to sample.
   ================================================================ */
var SIM_ENGINE={
  scenarios:{
    aggressive:{name:'Aggressive Action',css:'#4ecdc4',div:10,charter:true,capex:25,reskill:20,transparency:80,
      gini:[.385,.381,.377,.373,.368,.363,.358,.352,.346,.340,.334,.328,.322,.316,.310,.305,.300,.295,.290,.286,.282,.278,.275,.272,.270,.268,.266,.264,.262,.261,.260,.259,.258,.258,.258,.258,.258,.258,.258,.258,.258,.258,.258,.258],
      trust:[.432,.437,.445,.455,.468,.483,.500,.518,.537,.557,.575,.593,.610,.626,.641,.654,.666,.677,.687,.696,.704,.712,.718,.724,.730,.735,.740,.744,.748,.752,.755,.758,.761,.764,.766,.768,.770,.772,.774,.776,.778,.780,.782,.784],
      emis:[36.3,35.8,35.0,34.0,32.8,31.5,30.0,28.4,26.8,25.2,23.6,22.1,20.7,19.4,18.2,17.1,16.1,15.2,14.4,13.6,12.9,12.3,11.7,11.2,10.7,10.3,9.9,9.5,9.2,8.9,8.6,8.4,8.2,8.0,7.8,7.6,7.5,7.3,7.2,7.1,7.0,6.9,6.8,6.7],
      resil:[.355,.360,.368,.378,.390,.404,.420,.437,.455,.473,.491,.509,.527,.544,.560,.575,.589,.602,.614,.625,.635,.644,.652,.660,.667,.673,.679,.684,.689,.693,.697,.701,.704,.707,.710,.713,.715,.717,.719,.721,.723,.725,.727,.729],
      ai:[.121,.123,.127,.132,.138,.145,.153,.162,.172,.182,.193,.204,.215,.226,.237,.248,.259,.269,.279,.289,.298,.307,.315,.323,.330,.337,.343,.349,.354,.359,.364,.368,.372,.376,.380,.383,.386,.389,.392,.394,.396,.398,.400,.402]},
    moderate:{name:'Moderate Reform',css:'#5da5da',div:5,charter:true,capex:15,reskill:12,transparency:55,
      gini:[.385,.384,.382,.380,.377,.374,.371,.367,.364,.360,.356,.352,.348,.344,.341,.337,.334,.331,.328,.326,.324,.322,.320,.319,.317,.316,.315,.315,.314,.314,.314,.314,.314,.314,.314,.315,.315,.315,.316,.316,.316,.317,.317,.317],
      trust:[.432,.434,.438,.443,.450,.458,.467,.477,.487,.497,.507,.517,.527,.536,.545,.553,.561,.568,.575,.581,.586,.591,.596,.600,.604,.607,.610,.613,.616,.618,.620,.622,.624,.625,.627,.628,.629,.630,.631,.632,.633,.634,.635,.636],
      emis:[36.3,36.0,35.5,35.0,34.3,33.6,32.8,32.0,31.2,30.4,29.6,28.9,28.2,27.5,26.8,26.2,25.6,25.1,24.6,24.1,23.7,23.3,22.9,22.6,22.3,22.0,21.7,21.5,21.3,21.1,20.9,20.8,20.6,20.5,20.4,20.3,20.2,20.1,20.0,20.0,19.9,19.9,19.8,19.8],
      resil:[.355,.357,.362,.368,.376,.385,.395,.406,.417,.428,.439,.450,.461,.471,.480,.489,.497,.505,.512,.519,.525,.530,.535,.540,.544,.548,.551,.554,.557,.560,.562,.564,.566,.568,.570,.571,.573,.574,.575,.576,.577,.578,.579,.580],
      ai:[.121,.124,.129,.136,.145,.155,.166,.178,.191,.205,.219,.234,.248,.263,.277,.291,.305,.318,.331,.343,.354,.365,.375,.385,.394,.403,.411,.418,.425,.432,.438,.444,.449,.454,.459,.463,.467,.471,.475,.478,.481,.484,.487,.490]},
    bau:{name:'Business as Usual',css:'#e8a838',div:0,charter:false,capex:5,reskill:3,transparency:20,
      gini:[.385,.387,.391,.396,.402,.409,.417,.426,.435,.444,.453,.462,.470,.478,.485,.492,.498,.504,.509,.513,.517,.521,.524,.527,.529,.531,.533,.534,.536,.537,.538,.539,.540,.541,.541,.542,.542,.543,.543,.543,.543,.544,.544,.544],
      trust:[.432,.428,.422,.415,.406,.396,.386,.375,.365,.354,.344,.334,.325,.317,.309,.302,.296,.291,.286,.282,.278,.275,.273,.271,.269,.268,.267,.266,.265,.265,.264,.264,.264,.264,.264,.264,.264,.264,.264,.264,.264,.264,.264,.264],
      emis:[36.3,36.4,36.6,36.8,37.0,37.2,37.4,37.6,37.7,37.8,37.9,38.0,38.0,38.0,38.0,37.9,37.8,37.7,37.6,37.5,37.3,37.2,37.0,36.9,36.7,36.6,36.4,36.3,36.1,36.0,35.9,35.7,35.6,35.5,35.4,35.3,35.2,35.1,35.0,34.9,34.8,34.8,34.7,34.7],
      resil:[.355,.352,.348,.342,.336,.329,.322,.315,.308,.301,.295,.289,.283,.278,.274,.270,.266,.263,.260,.258,.256,.254,.252,.251,.250,.249,.248,.247,.247,.246,.246,.246,.245,.245,.245,.245,.245,.245,.245,.245,.245,.245,.245,.245],
      ai:[.121,.127,.136,.148,.163,.180,.199,.220,.242,.265,.289,.313,.336,.359,.381,.402,.422,.441,.458,.474,.489,.502,.515,.526,.536,.545,.553,.560,.567,.573,.578,.583,.587,.591,.595,.598,.601,.604,.606,.608,.610,.612,.614,.615]},
    worst:{name:'Worst Case',css:'#d4622a',div:0,charter:false,capex:2,reskill:0,transparency:5,
      gini:[.385,.390,.398,.408,.420,.435,.451,.468,.486,.504,.521,.537,.552,.565,.577,.587,.596,.604,.611,.617,.622,.626,.630,.633,.636,.638,.640,.642,.643,.645,.646,.647,.648,.649,.650,.650,.651,.651,.652,.652,.652,.653,.653,.653],
      trust:[.432,.424,.412,.398,.382,.364,.345,.326,.308,.291,.275,.261,.248,.237,.228,.220,.214,.209,.205,.202,.199,.197,.195,.194,.193,.192,.191,.190,.190,.190,.189,.189,.189,.189,.189,.189,.189,.189,.189,.189,.189,.189,.189,.189],
      emis:[36.3,36.8,37.5,38.4,39.4,40.5,41.6,42.7,43.7,44.6,45.4,46.0,46.5,46.8,47.0,47.1,47.1,47.0,46.8,46.6,46.3,46.0,45.7,45.3,45.0,44.6,44.3,44.0,43.7,43.4,43.1,42.8,42.6,42.3,42.1,41.9,41.7,41.5,41.3,41.2,41.0,40.9,40.7,40.6],
      resil:[.355,.348,.339,.328,.316,.303,.290,.277,.265,.254,.244,.235,.228,.222,.217,.213,.210,.208,.206,.204,.203,.202,.201,.200,.200,.199,.199,.198,.198,.198,.198,.198,.198,.198,.198,.198,.198,.198,.198,.198,.198,.198,.198,.198],
      ai:[.121,.130,.144,.162,.184,.210,.239,.271,.305,.340,.376,.411,.445,.477,.507,.534,.558,.580,.599,.615,.629,.641,.651,.660,.667,.673,.678,.683,.687,.690,.693,.695,.697,.699,.701,.702,.704,.705,.706,.707,.708,.709,.710,.710]}
  },
  metrics:[
    {id:'gini',  label:'Inequality (GINI)',  unit:'',    dec:3, dir:'lower',  baseline:.385},
    {id:'trust', label:'Civic Trust',        unit:'',    dec:3, dir:'higher', baseline:.432},
    {id:'emis',  label:'Emissions',          unit:' Gt', dec:1, dir:'lower',  baseline:36.3},
    {id:'resil', label:'Resilience',         unit:'',    dec:3, dir:'higher', baseline:.355},
    {id:'ai',    label:'AI Influence',       unit:'',    dec:3, dir:'context',baseline:.121}
  ],
  narratives:{
    aggressive:'Under aggressive policy action \u2014 a 10% civic dividend, full AI charter oversight, and 25% climate capex \u2014 inequality drops steadily toward .258 by 2070 while civic trust nearly doubles to .784. Emissions fall from 36.3 Gt to 6.7 Gt, and resilience more than doubles.',
    moderate:'Moderate reform with a 5% dividend, active charter, and 15% capex produces meaningful improvement without radical restructuring. Gini stabilizes near .317, trust reaches .636, and emissions decline to 19.8 Gt.',
    bau:'Business as usual sees inequality climb to .544, trust erode to .264, and emissions plateau above 34 Gt. Resilience halves while unregulated AI influence reaches .615.',
    worst:'Under worst case, Gini exceeds .650, trust collapses to .189, and emissions peak near 47 Gt. Resilience falls to .198 and unregulated AI influence reaches .710.'
  }
};

function simInterp(arr,year){
  var idx=year-2027;
  if(idx<=0)return arr[0];if(idx>=43)return arr[43];
  var lo=Math.floor(idx),hi=Math.ceil(idx),t=idx-lo;
  return arr[lo]+(arr[hi]-arr[lo])*t;
}

function simScore(sc,year){
  var s=SIM_ENGINE.scenarios[sc];if(!s)return 0;
  var gini=simInterp(s.gini,year);
  var trust=simInterp(s.trust,year);
  var emis=simInterp(s.emis,year);
  var resil=simInterp(s.resil,year);
  var score=Math.round((1-gini)*20+trust*25+Math.max(0,(36.3-emis)/36.3)*25+resil*20+(s.charter?10:0));
  return Math.max(0,Math.min(100,score));
}

function simEra(elapsed){
  if(elapsed<=3)return'Dawn';
  if(elapsed<=12)return'Divergence';
  if(elapsed<=30)return'Maturity';
  return'Legacy';
}

function simWorldState(sc,year){
  var s=SIM_ENGINE.scenarios[sc];if(!s)return{};
  var elapsed=year-2026;
  var gini=simInterp(s.gini,year);
  var trust=simInterp(s.trust,year);
  var emis=simInterp(s.emis,year);
  var resil=simInterp(s.resil,year);
  var ai=simInterp(s.ai,year);
  var score=simScore(sc,year);
  var era=simEra(elapsed);
  var g=grade(score);

  var livelihoods,climate,governance,aiText,outlook;

  /* Livelihoods */
  if(gini<0.30)livelihoods='Inequality transformed. Income floor via dividends; reskilling is cultural norm.';
  else if(gini<0.35)livelihoods='Wealth gap narrowing. Dividends cushion transitions; changing careers feels normal.';
  else if(gini<0.40)livelihoods='Economy functioning but uneven. Gains concentrated; middle-skill jobs hollowed.';
  else livelihoods='Economy failing people. GINI at '+gini.toFixed(3)+'; displaced workers fall through gaps.';

  /* Climate */
  if(emis<15)climate='Energy transition complete. Emissions down to '+emis.toFixed(1)+' Gt. Air cleaner, worst avoided.';
  else if(emis<25)climate='Emissions down to '+emis.toFixed(1)+' Gt. Renewable transition underway but pockets of fossil remain.';
  else if(emis<36)climate='Emissions barely moved at '+emis.toFixed(1)+' Gt. Fossil economy resilient; impacts visible.';
  else climate='Emissions risen to '+emis.toFixed(1)+' Gt. Window for managed transition closing. Communities abandoned.';

  /* Trust */
  if(trust>0.7)governance='Trust at '+trust.toFixed(3)+' \u2014 earned through transparency and participation.';
  else if(trust>0.5)governance='Trust improving at '+trust.toFixed(3)+'. Institutions not loved but no longer distrusted.';
  else if(trust>0.35)governance='Trust stagnant at '+trust.toFixed(3)+'. Reforms announced, partially funded, quietly abandoned.';
  else governance='Trust collapsed to '+trust.toFixed(3)+'. Voter turnout cratered. Conspiracy fills the vacuum.';

  /* AI */
  if(s.charter&&trust>0.5&&ai<0.5)aiText='AI integrated on society\u2019s terms. Charter enforced. Influence at '+ai.toFixed(3)+'.';
  else if(s.charter&&trust>0.35)aiText='Charter exists but guardrails creaking. AI influence at '+ai.toFixed(3)+'.';
  else if(ai>0.5)aiText='AI influence at '+ai.toFixed(3)+' \u2014 shaping more outcomes than human deliberation.'+(s.charter?'':' No charter.');
  else aiText='AI influence at '+ai.toFixed(3)+' \u2014 still early.'+(s.charter?' Charter in place for the test ahead.':' No governance framework.');

  /* Outlook */
  if(score>=80)outlook='Trajectory strong. Compounding returns from early investment are self-reinforcing.';
  else if(score>=60)outlook='Real momentum but fragile. Acceleration needed \u2014 deepen dividends, expand charter, increase climate capex.';
  else if(score>=40)outlook='Critical juncture. Without course correction in 5\u201310 years, structural decline becomes self-reinforcing.';
  else if(score>=20)outlook='Recovery requires peacetime mobilization. Every lever simultaneously. Window shrinking.';
  else outlook='Prevention stage passed. Focus shifts to resilience and survival of cascading failures.';

  var eraFeel;
  if(elapsed<=3){
    eraFeel=score>=50?'Reforms are new. Hope is cautious.':'World feels much as before. Crises compound.';
  }else if(elapsed<=12){
    eraFeel=score>=60?'Paths have split. People feel the difference.':score>=40?'Awkward middle passage \u2014 changed but not safe.':'Divergence visible, and not the good kind.';
  }else if(elapsed<=30){
    eraFeel=score>=70?'A generation grew up different. Reforms are just how things work.':score>=50?'Imperfect new shape. Progress real but uneven.':score>=30?'Structures buckling. Rough patch is the new normal.':'Compound failures self-reinforcing.';
  }else{
    eraFeel=score>=70?'A world that chose to act. Foundation sound.':score>=50?'Partial success. Worst avoided but world smaller.':score>=30?'Historians debate when the window closed.':'A world that failed \u2014 gradually, through inaction.';
  }

  return{score:score,grade:g,era:era,eraFeel:eraFeel,elapsed:elapsed,
    gini:gini,trust:trust,emis:emis,resil:resil,ai:ai,
    livelihoods:livelihoods,climate:climate,governance:governance,aiText:aiText,outlook:outlook,
    scenarioName:s.name,scenarioCss:s.css,charter:s.charter};
}

function renderCrossSystem(systemId,scenario){
  var sys=CROSS_SYSTEM[systemId];
  if(!sys) return '';
  var sc=scenario||'aggressive';
  var scInfo=SCENARIOS.find(function(s){return s.id===sc});
  var scClr=scInfo?scInfo.color:'var(--text-primary)';
  var scName=scInfo?scInfo.name:sc;
  var h='<div class="cross-system-panel">';
  h+='<p class="t3" style="margin-bottom:4px">Cross-System Impact</p>';
  h+='<p class="t4" style="margin-bottom:16px;color:var(--text-muted)">How '+sys.label+' under <span style="color:'+scClr+'">'+scName+'</span> influences other systems</p>';
  sys.impacts.forEach(function(imp){
    var d=imp[sc]||imp.aggressive;
    var w=d.weight;
    var arrow=w>0?'\u2197':w<0?'\u2198':'\u2192';
    var clr=w>0?'var(--green)':w<0?'var(--red)':'var(--text-muted)';
    var pct=Math.abs(w*100).toFixed(0);
    var barW=Math.min(100,Math.abs(w)*250);
    h+='<div class="cross-impact-row">';
    h+='<div class="flex items-center gap-8">';
    h+='<span class="num-sm" style="color:'+clr+';min-width:40px">'+arrow+pct+'%</span>';
    h+='<span class="t3" style="color:var(--text-secondary)">'+imp.label+'</span>';
    h+='<div class="bar-track" style="flex:1;max-width:120px"><div class="bar-fill" style="width:'+barW+'%;background:'+clr+'"></div></div>';
    h+='</div>';
    h+='<p class="t4" style="margin-top:4px;padding-left:48px">'+d.effect+'</p>';
    h+='</div>';
  });
  h+='</div>';
  return h;
}

/* ================================================================
   CHART HEADER — matches Biodiversity domain-card style
   opts = { label, value, unit, dec, prefix, dir, baseline, color, endYear }
   ================================================================ */
function chartHeader(opts){
  var v=opts.value, dec=opts.dec!=null?opts.dec:0, pfx=opts.prefix||'', unit=opts.unit||'';
  if(v==null||isNaN(v)) return '<div style="margin-bottom:12px"><span class="t3">'+opts.label+'</span></div>';
  var formatted=pfx+v.toFixed(dec)+unit;
  var clr=opts.color||'var(--text-primary)';
  var dir=opts.dir||'higher';
  var base=opts.baseline;
  var wentUp=(base!=null)?(v>base):false;
  var wentDown=(base!=null)?(v<base):false;
  var trend=wentUp?'up':wentDown?'down':'flat';
  var trendSym=trend==='up'?'\u2191':trend==='down'?'\u2193':'\u2192';
  var good=(dir==='higher'&&wentUp)||(dir==='lower'&&wentDown);
  var bad=(dir==='higher'&&wentDown)||(dir==='lower'&&wentUp);
  var trendClr=good?'var(--green)':bad?'var(--red)':'var(--text-muted)';
  if(dir==='context') trendClr=clr;
  var h='<div style="margin-bottom:12px">';
  h+='<span class="t3">'+opts.label+'</span>';
  h+='<div style="display:flex;align-items:baseline;gap:8px;margin-top:4px">';
  h+='<span class="num-lg" style="color:'+clr+'">'+formatted+'</span>';
  h+='<span style="font-size:14px;color:'+trendClr+'">'+trendSym+'</span>';
  if(opts.endYear) h+='<span class="t4">by '+opts.endYear+'</span>';
  h+='</div>';
  if(base!=null){
    h+='<p class="t4" style="color:var(--text-faint);margin-top:2px">Baseline: '+pfx+(typeof base==='number'?base.toFixed(dec):base)+unit+'</p>';
  }
  h+='</div>';
  return h;
}

/* ================================================================
   SVG SPARKLINE (legacy)
   ================================================================ */
function sparkSVG(data,color,w,h,fill){
  w=w||120;h=h||36;fill=fill!==false;
  var mn=Math.min.apply(null,data),mx=Math.max.apply(null,data),rng=mx-mn||1;
  var pts=data.map(function(v,i){return(i/(data.length-1))*w+','+(h-((v-mn)/rng)*h)}).join(' ');
  var fp=fill?'<polygon points="0,'+h+' '+pts+' '+w+','+h+'" fill="'+color+'" opacity="0.1"/>':'';
  return '<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="height:'+h+'px">'+fp+'<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>';
}

/* ================================================================
   SVG MULTI-LINE COMPARISON (legacy)
   ================================================================ */
function comparisonSVG(datasets,colors,activeKey,w,h,labels){
  w=w||260;h=h||120;
  var allVals=[];for(var k in datasets)allVals=allVals.concat(datasets[k]);
  var mn=Math.min.apply(null,allVals),mx=Math.max.apply(null,allVals),rng=mx-mn||1;
  var s='<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="height:'+h+'px">';
  for(var k in datasets){
    var data=datasets[k];
    var pts=data.map(function(v,i){return(i/(data.length-1))*w+','+(h-4-((v-mn)/rng)*(h-8))}).join(' ');
    var isActive=k===activeKey;
    s+='<polyline points="'+pts+'" fill="none" stroke="'+(colors[k]||'#888')+'" stroke-width="'+(isActive?2:0.7)+'" opacity="'+(isActive?1:0.2)+'" vector-effect="non-scaling-stroke"/>';
  }
  if(labels){
    s+='<text x="0" y="'+h+'" fill="rgba(255,255,255,0.15)" font-size="8" font-family="var(--font-mono)">'+labels[0]+'</text>';
    s+='<text x="'+w+'" y="'+h+'" fill="rgba(255,255,255,0.15)" font-size="8" font-family="var(--font-mono)" text-anchor="end">'+labels[1]+'</text>';
  }
  s+='</svg>';
  return s;
}

/* ================================================================
   timelineSVG — multi-scenario chart with solid past / dashed future
   yearIdx: 0-based index of the current year within the data arrays
   Same signature as comparisonSVG plus yearIdx parameter.
   ================================================================ */
function timelineSVG(datasets,colors,activeKey,w,h,labels,yearIdx){
  w=w||260;h=h||120;
  var allVals=[];for(var k in datasets)allVals=allVals.concat(datasets[k]);
  var mn=Math.min.apply(null,allVals),mx=Math.max.apply(null,allVals),rng=mx-mn||1;
  var pad=4;
  function px(i,n){return(i/(n-1))*w}
  function py(v){return h-pad-((v-mn)/rng)*(h-2*pad)}
  var s='<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="height:'+h+'px">';
  /* Year marker line */
  if(yearIdx!=null&&yearIdx>=0){
    var n0=datasets[Object.keys(datasets)[0]];
    if(n0){
      var xM=px(Math.min(yearIdx,n0.length-1),n0.length);
      s+='<line x1="'+xM+'" y1="0" x2="'+xM+'" y2="'+h+'" stroke="rgba(255,255,255,0.18)" stroke-width="0.5" stroke-dasharray="2,2"/>';
    }
  }
  for(var k in datasets){
    var data=datasets[k];
    var isActive=k===activeKey;
    var clr=colors[k]||'#888';
    var sw=isActive?2:0.7;
    var op=isActive?1:0.15;
    var n=data.length;
    var yi=yearIdx!=null?Math.min(Math.max(0,yearIdx),n-1):n-1;
    /* Build point arrays for past (0..yi) and future (yi..n-1) */
    var pastPts=[],futurePts=[];
    for(var i=0;i<n;i++){
      var pt=px(i,n)+','+py(data[i]);
      if(i<=yi)pastPts.push(pt);
      if(i>=yi)futurePts.push(pt);
    }
    /* Solid past line */
    if(pastPts.length>1){
      s+='<polyline points="'+pastPts.join(' ')+'" fill="none" stroke="'+clr+'" stroke-width="'+sw+'" opacity="'+op+'" vector-effect="non-scaling-stroke"/>';
    }
    /* Dashed future line */
    if(futurePts.length>1){
      s+='<polyline points="'+futurePts.join(' ')+'" fill="none" stroke="'+clr+'" stroke-width="'+(sw*0.7)+'" opacity="'+(op*0.45)+'" stroke-dasharray="3,3" vector-effect="non-scaling-stroke"/>';
    }
    /* Filled area under active line (past only) */
    if(isActive&&pastPts.length>1){
      s+='<polygon points="'+px(0,n)+','+py(mn)+' '+pastPts.join(' ')+' '+px(yi,n)+','+py(mn)+'" fill="'+clr+'" opacity="0.06"/>';
    }
    /* Dot at current year on active line */
    if(isActive){
      var cx=px(yi,n),cy=py(data[yi]);
      s+='<circle cx="'+cx+'" cy="'+cy+'" r="2.5" fill="'+clr+'" opacity="'+op+'"/>';
    }
  }
  if(labels){
    s+='<text x="0" y="'+(h-1)+'" fill="rgba(255,255,255,0.15)" font-size="8" font-family="var(--font-mono)">'+labels[0]+'</text>';
    s+='<text x="'+w+'" y="'+(h-1)+'" fill="rgba(255,255,255,0.15)" font-size="8" font-family="var(--font-mono)" text-anchor="end">'+labels[1]+'</text>';
  }
  s+='</svg>';
  return s;
}

/* ══════════════════════════════════════════════════════════════
   scenarioChart — unified multi-scenario chart with all 4 lines
   ══════════════════════════════════════════════════════════════ */
function scenarioChart(opts){
  var ds=opts.datasets,colors=opts.colors,ak=opts.activeKey;
  var scenarios=opts.scenarios||SCENARIOS;
  var sy=opts.startYear||2026,ey=opts.endYear||2050;
  var unit=opts.unit||'',dec=opts.dec!=null?opts.dec:1,prefix=opts.prefix||'';
  var exportId=opts.exportId||'';
  var lm=80,rm=100,tm=20,bm=40;
  var vw=900,vh=340;
  var pw=vw-lm-rm,ph=vh-tm-bm;

  var allV=[];for(var k in ds)allV=allV.concat(ds[k]);
  var mn=Math.min.apply(null,allV),mx=Math.max.apply(null,allV);
  var rng=mx-mn||1;
  var pad=rng*0.08;mn-=pad;mx+=pad;rng=mx-mn;

  function yPos(v){return tm+ph-(((v-mn)/rng)*ph)}
  function xPos(i,len){return lm+((i/(len-1))*pw)}
  function fVal(v){return prefix+v.toFixed(dec)+unit}

  var nTicks=5;
  var svg='<svg viewBox="0 0 '+vw+' '+vh+'" style="width:100%;aspect-ratio:'+vw+'/'+vh+'" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Scenario comparison chart">';

  for(var t=0;t<nTicks;t++){
    var tv=mn+(t/(nTicks-1))*rng;
    var ty=yPos(tv);
    svg+='<line x1="'+lm+'" y1="'+ty+'" x2="'+(vw-rm)+'" y2="'+ty+'" stroke="rgba(255,255,255,0.07)" stroke-width="1" class="chart-gridline"/>';
    svg+='<text x="'+(lm-10)+'" y="'+(ty+5)+'" fill="rgba(255,255,255,0.4)" font-size="16" font-family="var(--font-mono)" text-anchor="end" class="chart-label">'+fVal(tv)+'</text>';
  }

  if(opts.baseline!=null){
    var bly=yPos(opts.baseline);
    svg+='<line x1="'+lm+'" y1="'+bly+'" x2="'+(vw-rm)+'" y2="'+bly+'" stroke="rgba(255,255,255,0.18)" stroke-width="1" stroke-dasharray="6,4"/>';
    svg+='<text x="'+(vw-rm+6)+'" y="'+(bly+5)+'" fill="rgba(255,255,255,0.3)" font-size="14" font-family="var(--font-mono)" class="chart-label">baseline</text>';
  }

  var ySpan=ey-sy;
  var xLabels=[sy];
  var step=ySpan<=10?2:ySpan<=15?3:ySpan<=30?5:10;
  for(var yr=sy+step;yr<ey;yr+=step)xLabels.push(yr);
  xLabels.push(ey);
  xLabels.forEach(function(yr){
    var xi=lm+((yr-sy)/ySpan)*pw;
    svg+='<line x1="'+xi+'" y1="'+tm+'" x2="'+xi+'" y2="'+(vh-bm)+'" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
    svg+='<text x="'+xi+'" y="'+(vh-bm+24)+'" fill="rgba(255,255,255,0.35)" font-size="16" font-family="var(--font-mono)" text-anchor="middle" class="chart-label">'+yr+'</text>';
  });

  if(opts.markerYear){
    var mxi=lm+((opts.markerYear-sy)/ySpan)*pw;
    svg+='<line x1="'+mxi+'" y1="'+tm+'" x2="'+mxi+'" y2="'+(vh-bm)+'" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="5,4"/>';
  }

  var keys=Object.keys(ds);
  keys.forEach(function(k){
    if(k===ak)return;
    var d=ds[k];var len=d.length;
    var pts=d.map(function(v,i){return xPos(i,len)+','+yPos(v)}).join(' ');
    svg+='<polyline points="'+pts+'" fill="none" stroke="'+(colors[k]||'#888')+'" stroke-width="2" opacity="0.25" class="chart-line-bg"/>';
    var endV=d[len-1];var ex=xPos(len-1,len);var eyl=yPos(endV);
    svg+='<circle cx="'+ex+'" cy="'+eyl+'" r="5" fill="'+(colors[k]||'#888')+'" opacity="0.35"/>';
    svg+='<text x="'+(ex+10)+'" y="'+(eyl+5)+'" fill="'+(colors[k]||'#888')+'" opacity="0.45" font-size="15" font-family="var(--font-mono)" class="chart-label">'+fVal(endV)+'</text>';
  });

  var ad=ds[ak];if(ad){
    var alen=ad.length;
    var apts=ad.map(function(v,i){return xPos(i,alen)+','+yPos(v)}).join(' ');
    svg+='<polygon points="'+xPos(0,alen)+','+yPos(mn)+' '+apts+' '+xPos(alen-1,alen)+','+yPos(mn)+'" fill="'+(colors[ak]||'#4ecdc4')+'" opacity="0.10"/>';
    svg+='<polyline points="'+apts+'" fill="none" stroke="'+(colors[ak]||'#4ecdc4')+'" stroke-width="3.5" class="chart-line-active"/>';
    var aEndV=ad[alen-1];var aex=xPos(alen-1,alen);var aeyl=yPos(aEndV);
    svg+='<circle cx="'+aex+'" cy="'+aeyl+'" r="6" fill="'+(colors[ak]||'#4ecdc4')+'"/>';
    svg+='<text x="'+(aex+10)+'" y="'+(aeyl+6)+'" fill="'+(colors[ak]||'#4ecdc4')+'" font-size="17" font-weight="600" font-family="var(--font-mono)" class="chart-label">'+fVal(aEndV)+'</text>';
  }

  svg+='</svg>';

  var html='<div class="scenario-chart">';
  html+=svg;

  html+='<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:12px;align-items:center">';
  scenarios.forEach(function(sc){
    var isA=sc.id===ak;
    html+='<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-family:var(--font-body);letter-spacing:0.03em;color:'+(isA?sc.color:'rgba(255,255,255,0.3)')+'">';
    html+='<span style="width:18px;height:'+(isA?'3':'1.5')+'px;background:'+sc.color+';opacity:'+(isA?1:0.35)+';display:inline-block;border-radius:1px"></span>';
    html+=sc.name;
    if(ds[sc.id]){
      var ev=ds[sc.id][ds[sc.id].length-1];
      html+=' <span style="font-family:var(--font-mono);font-weight:'+(isA?'600':'400')+';font-size:12px;opacity:'+(isA?1:0.5)+'">'+fVal(ev)+'</span>';
    }
    html+='</span>';
  });
  if(exportId){
    html+='<button class="export-btn" data-export="'+exportId+'" title="Download CSV">';
    html+='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    html+=' CSV</button>';
  }
  html+='</div>';

  var noteText=opts.note;
  if(opts.notes&&opts.notes[ak])noteText=opts.notes[ak];
  if(noteText){
    html+='<p style="font-size:12px;line-height:1.7;color:var(--text-muted);margin-top:12px;max-width:640px;font-family:var(--font-body)">'+noteText+'</p>';
  }
  html+='</div>';
  return html;
}

/* ── SVG Bar chart (horizontal) ── */
function barChartSVG(items,maxVal,w,h){
  w=w||260;h=h||120;
  var barH=Math.min(16,(h-4)/items.length-2);
  var s='<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="height:'+h+'px">';
  items.forEach(function(item,i){
    var y=i*(barH+4)+2;
    var bw=(item.value/maxVal)*w*0.7;
    s+='<rect x="0" y="'+y+'" width="'+bw+'" height="'+barH+'" fill="'+(item.color||'#888')+'" opacity="0.5"/>';
    s+='<text x="'+(bw+6)+'" y="'+(y+barH-2)+'" fill="rgba(255,255,255,0.5)" font-size="9" font-family="var(--font-mono)" class="chart-label">'+item.label+'</text>';
  });
  s+='</svg>';
  return s;
}

/* ── Scenario legend row (legacy) ── */
function legendHTML(scenarios,activeKey){
  return '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px">'+
    scenarios.map(function(s){
      var isA=s.id===activeKey;
      return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:9px;font-family:var(--font-body);color:'+(isA?s.color:'rgba(255,255,255,0.15)')+'"><span style="width:10px;height:1.5px;background:'+s.color+';opacity:'+(isA?1:0.25)+';display:inline-block"></span>'+s.name+'</span>';
    }).join('')+
  '</div>';
}

/* ── Delta badge ── */
function deltaHTML(val,ref){
  var d=val-ref;
  var cls=d>0?'delta-up':d<0?'delta-down':'delta-flat';
  return '<span class="delta '+cls+'">'+(d>0?'+':'')+d+'</span>';
}

/* ── Section navigation ── */
function initSectionNav(navSelector,sectionPrefix,defaultSection){
  var btns=document.querySelectorAll(navSelector+' .nav-tab');
  var nav=document.querySelector(navSelector);
  if(nav)nav.setAttribute('role','tablist');
  function show(id){
    document.querySelectorAll('[id^="'+sectionPrefix+'"]').forEach(function(el){
      el.style.display='none';
      el.setAttribute('aria-hidden','true');
    });
    var sec=document.getElementById(sectionPrefix+id);
    if(sec){sec.style.display='block';sec.setAttribute('aria-hidden','false');}
    btns.forEach(function(b){
      var isA=b.dataset.section===id;
      b.classList.toggle('active',isA);
      b.setAttribute('aria-selected',isA?'true':'false');
    });
  }
  btns.forEach(function(b){
    b.setAttribute('role','tab');
    b.setAttribute('aria-controls',sectionPrefix+b.dataset.section);
    b.addEventListener('click',function(){show(b.dataset.section)});
  });
  show(defaultSection||btns[0].dataset.section);
  return show;
}

/* ================================================================
   SCENARIO COMPARISON MODE
   ================================================================ */
function initComparisonMode(renderCallback){
  var compareActive=false;
  var compareWith='moderate';

  var bar=document.querySelector('.scenario-bar');
  if(!bar)return null;

  var btn=document.createElement('button');
  btn.className='compare-toggle';
  btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg> Compare';
  btn.title='Side-by-side scenario comparison';
  bar.appendChild(btn);

  var controlBar=bar.closest('.control-bar');
  var panel=document.createElement('div');
  panel.className='compare-panel';
  panel.style.display='none';
  panel.innerHTML='<div class="page"><div class="flex items-center gap-8 py-2" style="flex-wrap:wrap"><span class="t4">Compare with:</span>'
    +SCENARIOS.map(function(s){return '<button class="compare-pick scenario-btn" data-sc="'+s.id+'" style="color:'+s.color+'"><span class="dot" style="background:'+s.color+'"></span>'+s.name+'</button>'}).join('')
    +'<button class="compare-close t4" style="margin-left:auto;color:var(--text-muted)">\u2715 Close</button></div></div>';
  if(controlBar) controlBar.parentNode.insertBefore(panel,controlBar.nextSibling);
  else bar.parentNode.parentNode.appendChild(panel);

  btn.addEventListener('click',function(){
    compareActive=!compareActive;
    panel.style.display=compareActive?'block':'none';
    btn.classList.toggle('active',compareActive);
    if(renderCallback)renderCallback(compareActive?compareWith:null);
  });

  panel.querySelector('.compare-close').addEventListener('click',function(){
    compareActive=false;
    panel.style.display='none';
    btn.classList.remove('active');
    if(renderCallback)renderCallback(null);
  });

  panel.querySelectorAll('.compare-pick').forEach(function(b){
    b.addEventListener('click',function(){
      compareWith=b.dataset.sc;
      panel.querySelectorAll('.compare-pick').forEach(function(p){p.style.opacity=p.dataset.sc===compareWith?'1':'0.4'});
      if(renderCallback)renderCallback(compareWith);
    });
  });

  return {
    isActive:function(){return compareActive},
    getCompare:function(){return compareWith}
  };
}

/* ================================================================
   FOOTER
   ================================================================ */
function renderFooter(){
  var path=window.location.pathname;
  var idx=-1;
  PAGE_ORDER.forEach(function(p,i){if(path.indexOf(p.href)!==-1) idx=i});
  if(idx===-1&&(path.endsWith('/')||path.endsWith('/index.html'))) idx=0;
  var nav='';
  if(idx>0||idx<PAGE_ORDER.length-1){
    nav='<div class="flex justify-between" style="margin-bottom:24px">';
    if(idx>0){
      var prev=PAGE_ORDER[idx-1];
      nav+='<a href="'+prev.href+'" style="color:var(--text-muted);text-decoration:none;font-family:var(--font-body);font-size:13px">&larr; '+prev.label+'</a>';
    }else{nav+='<span></span>';}
    if(idx<PAGE_ORDER.length-1){
      var next=PAGE_ORDER[idx+1];
      nav+='<a href="'+next.href+'" style="color:var(--text-muted);text-decoration:none;font-family:var(--font-body);font-size:13px">'+next.label+' &rarr;</a>';
    }else{nav+='<span></span>';}
    nav+='</div>';
  }
  return '<footer class="site-footer"><div class="page">'+
    nav+
    '<div class="text-center">'+
    '<p class="t4">AI Civilization Simulator &middot; Clawcode Research &middot; 2026</p>'+
    '<p class="t4 mt-2" style="color:var(--text-faint)">Data: simulated projections. Methodology: scenario modeling with policy lever inputs.<br>Typography: Space Grotesk, Inter, JetBrains Mono. Layout: 12-column editorial grid.</p>'+
    '</div>'+
  '</div></footer>';
}

/* ── Chart export delegation ── */
var _chartExportRegistry={};
function registerChartExport(id,datasets,startYear,endYear,unit,prefix){
  _chartExportRegistry[id]={datasets:datasets,startYear:startYear,endYear:endYear,unit:unit||'',prefix:prefix||''};
}
document.addEventListener('click',function(e){
  var btn=e.target.closest('.export-btn');
  if(!btn)return;
  var id=btn.getAttribute('data-export');
  var reg=_chartExportRegistry[id];
  if(!reg)return;
  var d=exportChartData(reg.datasets,reg.startYear,reg.endYear,reg.unit,reg.prefix);
  downloadCSV('aicivsim-'+id+'.csv',d.headers,d.rows);
});

/* ── Auto-init: if nav already exists in DOM, highlight + mobile toggle ── */
(function(){
  if(document.querySelector('.site-nav')) initSiteNav();
})();

/* ── Chat Widget: inject on every page ── */
(function(){
  var s=document.createElement('script');
  s.src='js/chat-widget.js?v=20260221a';
  s.defer=true;
  document.body.appendChild(s);
})();
