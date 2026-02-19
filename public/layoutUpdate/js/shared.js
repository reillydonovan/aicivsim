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
  {href:'climate.html',label:'ClimateOS'},
  {href:'simulation.html',label:'SimulationOS'},
  {href:'transition.html',label:'TransitionOS'},
  {href:'civilization.html',label:'CivilizationOS'},
  {href:'governance.html',label:'GovernanceOS'},
  {href:'strategy.html',label:'StrategyOS'},
  {href:'timeline.html',label:'Timeline'},
  {href:'research.html',label:'Research'},
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
    label:'ClimateOS',color:'var(--climate)',
    impacts:[
      {target:'transition',label:'TransitionOS',
        aggressive:{weight:-0.05,effect:'Managed green transition creates short-term displacement but reskilling infrastructure absorbs it. Net workforce disruption minimal.'},
        moderate:{weight:-0.10,effect:'Moderate climate investment displaces some fossil-fuel workers. Reskilling programs exist but lag behind demand.'},
        bau:{weight:-0.22,effect:'Unmanaged climate shifts force rapid fossil-fuel exits. No reskilling infrastructure — mass displacement underway.'},
        worst:{weight:-0.35,effect:'Climate emergencies trigger industry collapse across multiple sectors. Workforce displacement is systemic and unaddressed.'}},
      {target:'governance',label:'GovernanceOS',
        aggressive:{weight:-0.03,effect:'Climate stability reduces emergency governance burden. Institutions focus on long-term planning rather than crisis response.'},
        moderate:{weight:-0.08,effect:'Periodic climate events strain governance capacity. Institutions cope but emergency protocols consume bandwidth.'},
        bau:{weight:-0.18,effect:'Frequent climate disasters erode institutional trust. Governance capacity diverted to perpetual crisis management.'},
        worst:{weight:-0.30,effect:'Cascading climate failures overwhelm institutions entirely. Public trust in governance collapses.'}},
      {target:'civilization',label:'CivilizationOS',
        aggressive:{weight:-0.04,effect:'Environmental recovery improves quality of life. Biodiversity stabilizing. Air and water quality trending positive.'},
        moderate:{weight:-0.10,effect:'Mixed environmental outcomes. Some regions improve, others degrade. Inequality in environmental quality persists.'},
        bau:{weight:-0.20,effect:'Environmental degradation accelerates. Heat stress, water scarcity, and crop failure reduce wellbeing across populations.'},
        worst:{weight:-0.38,effect:'Multiple tipping points breached. Civilizational wellbeing in freefall as habitable zones shrink and resources collapse.'}},
      {target:'strategy',label:'StrategyOS',
        aggressive:{weight:0.10,effect:'Climate urgency galvanizes public action. Strategy adoption accelerates as citizens see tangible environmental progress.'},
        moderate:{weight:0.04,effect:'Moderate climate awareness drives some strategy adoption. Public engagement uneven across demographics.'},
        bau:{weight:-0.06,effect:'Climate fatigue sets in. Public disengages from strategy adoption as problems feel insurmountable.'},
        worst:{weight:-0.14,effect:'Climate despair paralyzes action. Strategy adoption collapses as populations shift to survival mode.'}},
      {target:'simulation',label:'SimulationOS',
        aggressive:{weight:0.08,effect:'Positive climate data validates simulation models. Public trust in projections increases, strengthening evidence-based policy.'},
        moderate:{weight:0.03,effect:'Mixed climate results create uncertainty in simulation accuracy. Model credibility holds but confidence is tepid.'},
        bau:{weight:-0.05,effect:'Worsening climate outcomes undermine confidence in simulation models. Policy-makers question projection value.'},
        worst:{weight:-0.12,effect:'Climate reality far exceeds worst projections. Simulation credibility collapses — models seen as dangerously optimistic.'}}
    ]
  },
  transition:{
    label:'TransitionOS',color:'var(--workforce)',
    impacts:[
      {target:'governance',label:'GovernanceOS',
        aggressive:{weight:0.18,effect:'Near-full employment and civic dividends create an engaged, trusting citizenry. Institutional legitimacy at historic highs.'},
        moderate:{weight:0.10,effect:'Moderate workforce stability supports civic participation. Trust rebuilding, but gaps remain in underserved regions.'},
        bau:{weight:-0.05,effect:'Rising unemployment breeds frustration and disengagement. Civic participation declining as economic anxiety grows.'},
        worst:{weight:-0.20,effect:'Mass unemployment destroys social contract. Anti-institutional sentiment surges. Governance legitimacy in crisis.'}},
      {target:'civilization',label:'CivilizationOS',
        aggressive:{weight:0.20,effect:'Universal reskilling and civic dividends dramatically reduce poverty and inequality. Workforce transition becomes a model for equity.'},
        moderate:{weight:0.12,effect:'Partial reskilling reduces poverty but inequality persists. Some communities left behind by automation wave.'},
        bau:{weight:-0.08,effect:'Poverty rising as automation displaces without replacement. Inequality widening. Middle class eroding.'},
        worst:{weight:-0.25,effect:'Permanent underclass forming. No pathway from displacement to employment. Inequality at levels not seen in a century.'}},
      {target:'climate',label:'ClimateOS',
        aggressive:{weight:0.12,effect:'Reskilled workforce powers green energy buildout. Clean sector employment exceeds fossil-fuel legacy jobs.'},
        moderate:{weight:0.06,effect:'Some workers transition to green sectors but pace is slow. Net emissions benefit modest.'},
        bau:{weight:-0.02,effect:'No workforce pipeline for green sectors. Clean energy buildout bottlenecked by labor shortages.'},
        worst:{weight:-0.08,effect:'Economic collapse reduces emissions through degrowth — not by design but by failure. No green transition.'}},
      {target:'strategy',label:'StrategyOS',
        aggressive:{weight:0.15,effect:'Employed, secure populations invest in long-term strategies. Reskilling culture normalizes lifelong learning and civic action.'},
        moderate:{weight:0.07,effect:'Moderate economic security allows some strategic planning. Adoption concentrated among those with stable employment.'},
        bau:{weight:-0.04,effect:'Economic precarity leaves no bandwidth for strategic engagement. Survival overrides long-term planning.'},
        worst:{weight:-0.12,effect:'Mass unemployment eliminates capacity for strategy adoption. Populations focused entirely on immediate survival.'}},
      {target:'simulation',label:'SimulationOS',
        aggressive:{weight:0.10,effect:'Successful transition validates simulation projections. Public trust in modeling strengthens evidence-based governance.'},
        moderate:{weight:0.04,effect:'Partial transition results provide mixed validation of simulation models. Credibility holds in some sectors.'},
        bau:{weight:-0.03,effect:'Stalled transition outcomes cast doubt on simulation accuracy. Policy-makers question model assumptions.'},
        worst:{weight:-0.10,effect:'Catastrophic workforce outcomes discredit simulation models entirely. Projections seen as meaningless in crisis.'}}
    ]
  },
  civilization:{
    label:'CivilizationOS',color:'#e8a838',
    impacts:[
      {target:'governance',label:'GovernanceOS',
        aggressive:{weight:0.15,effect:'High wellbeing and equity produce an engaged citizenry. Democratic institutions strengthened by broad participation.'},
        moderate:{weight:0.08,effect:'Moderate wellbeing supports baseline civic engagement. Institutional trust slowly rebuilding.'},
        bau:{weight:-0.05,effect:'Declining wellbeing reduces civic participation. Apathy and distrust spreading through affected communities.'},
        worst:{weight:-0.18,effect:'Civilizational decline breeds extremism and institutional rejection. Democratic norms under direct threat.'}},
      {target:'transition',label:'TransitionOS',
        aggressive:{weight:0.12,effect:'Civic dividends fund reskilling and reduce displacement friction. Transition costs shared equitably.'},
        moderate:{weight:0.06,effect:'Some dividend funding reaches displaced workers. Reskilling partially subsidized but unevenly distributed.'},
        bau:{weight:-0.04,effect:'No dividend system. Displaced workers bear full transition costs individually.'},
        worst:{weight:-0.15,effect:'Social safety net collapsed. No resources available for workforce transition of any kind.'}},
      {target:'strategy',label:'StrategyOS',
        aggressive:{weight:0.18,effect:'High public awareness and engagement drive rapid adoption of personal, organizational, and policy strategies.'},
        moderate:{weight:0.10,effect:'Moderate public engagement. Strategy adoption concentrated in already-active demographics.'},
        bau:{weight:0.02,effect:'Low engagement limits strategy adoption to early adopters. Systemic change stalls.'},
        worst:{weight:-0.08,effect:'Public disengagement and cynicism prevent any meaningful strategy adoption. Fatalism dominates.'}},
      {target:'climate',label:'ClimateOS',
        aggressive:{weight:0.08,effect:'High wellbeing enables climate investment. Prosperous societies prioritize environmental stewardship and fund green infrastructure.'},
        moderate:{weight:0.03,effect:'Moderate wellbeing allows some environmental investment. Climate remains a priority but competes with other concerns.'},
        bau:{weight:-0.04,effect:'Declining wellbeing pushes climate down the priority list. Short-term economic survival overrides environmental goals.'},
        worst:{weight:-0.10,effect:'Civilizational crisis eliminates climate capacity. Survival needs consume all resources — environment abandoned.'}},
      {target:'simulation',label:'SimulationOS',
        aggressive:{weight:0.06,effect:'Strong civilizational outcomes validate simulation utility. Public demand for data-driven governance grows.'},
        moderate:{weight:0.02,effect:'Mixed civilizational outcomes produce moderate confidence in simulation models.'},
        bau:{weight:-0.03,effect:'Worsening conditions reduce public interest in simulation. Fatalism replaces evidence-based planning.'},
        worst:{weight:-0.08,effect:'Civilizational decline makes simulation feel irrelevant. Populations abandon data-driven approaches for reactive survival.'}}
    ]
  },
  governance:{
    label:'GovernanceOS',color:'var(--governance)',
    impacts:[
      {target:'climate',label:'ClimateOS',
        aggressive:{weight:0.22,effect:'Strong governance enforces carbon pricing, renewable mandates, and conservation targets. Climate policy fully funded and binding.'},
        moderate:{weight:0.12,effect:'Partial governance enables some climate policy. Carbon pricing exists but enforcement is inconsistent.'},
        bau:{weight:0.02,effect:'Weak governance produces voluntary commitments only. No binding climate legislation. Industry self-regulates.'},
        worst:{weight:-0.10,effect:'Governance capture by fossil-fuel interests actively blocks climate action. Regulatory rollback underway.'}},
      {target:'civilization',label:'CivilizationOS',
        aggressive:{weight:0.18,effect:'Democratic institutions protect equity, distribute AI productivity gains, and ensure universal service access.'},
        moderate:{weight:0.10,effect:'Institutions provide partial safety net. Equity improving but concentrated benefits persist.'},
        bau:{weight:-0.05,effect:'Weak institutions unable to counter wealth concentration. AI gains flow to capital owners.'},
        worst:{weight:-0.20,effect:'Institutional failure enables authoritarian capture. Equity protections dismantled. Surveillance replaces democracy.'}},
      {target:'transition',label:'TransitionOS',
        aggressive:{weight:0.15,effect:'Policy mandates fund universal reskilling, regulate automation pace, and guarantee transition support.'},
        moderate:{weight:0.08,effect:'Some policy support for workforce transition. Reskilling funded but not mandated.'},
        bau:{weight:-0.02,effect:'No policy framework for workforce transition. Market forces alone determine outcomes.'},
        worst:{weight:-0.12,effect:'Governance collapse means no labor protections. Workers face automation with zero institutional support.'}},
      {target:'strategy',label:'StrategyOS',
        aggressive:{weight:0.14,effect:'Strong institutional frameworks legitimize and amplify grassroots strategies. Policy creates fertile ground for civic action.'},
        moderate:{weight:0.06,effect:'Some institutional support for strategy adoption. Advocacy channels exist but compete for attention.'},
        bau:{weight:-0.02,effect:'Weak institutions provide no framework for organized strategy. Individual action remains disconnected.'},
        worst:{weight:-0.10,effect:'Institutional collapse delegitimizes organized strategy. Advocacy seen as futile against captured systems.'}},
      {target:'simulation',label:'SimulationOS',
        aggressive:{weight:0.12,effect:'Strong governance enables transparent simulation infrastructure. Public trust in modeling underpins policy decisions.'},
        moderate:{weight:0.06,effect:'Moderate governance supports simulation credibility. Some transparency gaps limit full public confidence.'},
        bau:{weight:-0.04,effect:'Weak governance undermines simulation independence. Models perceived as politically influenced.'},
        worst:{weight:-0.14,effect:'Governance failure makes simulation impossible. No institutional capacity to maintain or trust modeling infrastructure.'}}
    ]
  },
  strategy:{
    label:'StrategyOS',color:'var(--equity)',
    impacts:[
      {target:'climate',label:'ClimateOS',
        aggressive:{weight:0.10,effect:'Widespread individual and organizational action measurably reduces emissions. Consumer behavior shifts accelerate corporate change.'},
        moderate:{weight:0.05,effect:'Moderate adoption of green strategies. Some measurable emissions impact from early movers.'},
        bau:{weight:0.01,effect:'Minimal voluntary action. Individual strategies too scattered to produce systemic impact.'},
        worst:{weight:-0.03,effect:'Strategy adoption near zero. Public fatalism prevents even personal action.'}},
      {target:'governance',label:'GovernanceOS',
        aggressive:{weight:0.12,effect:'Organized advocacy and civic engagement strengthen democratic institutions and accelerate charter adoption.'},
        moderate:{weight:0.06,effect:'Moderate civic pressure supports governance reform. Charter awareness growing but adoption patchy.'},
        bau:{weight:0.01,effect:'No organized pressure for governance reform. Status quo entrenched.'},
        worst:{weight:-0.05,effect:'Anti-institutional movements undermine governance reform efforts. Advocacy groups defunded or suppressed.'}},
      {target:'transition',label:'TransitionOS',
        aggressive:{weight:0.14,effect:'Proactive organizational reskilling and individual upskilling reduce displacement severity. Companies invest ahead of automation.'},
        moderate:{weight:0.08,effect:'Some organizations invest in reskilling. Individual upskilling growing but unevenly distributed.'},
        bau:{weight:0.02,effect:'Negligible proactive reskilling. Organizations automate first, address displacement later (if at all).'},
        worst:{weight:-0.04,effect:'No organizational investment in transition. Workers abandoned to market forces.'}},
      {target:'civilization',label:'CivilizationOS',
        aggressive:{weight:0.10,effect:'Widespread strategy adoption improves quality of life. Communities organized around shared goals see measurable wellbeing gains.'},
        moderate:{weight:0.05,effect:'Moderate strategy adoption benefits engaged communities. Wellbeing improvements concentrated in organized populations.'},
        bau:{weight:0.01,effect:'Scattered strategy adoption produces negligible civilization-scale impact. Benefits limited to individuals.'},
        worst:{weight:-0.06,effect:'Strategy collapse removes last buffer against declining wellbeing. No grassroots resilience to offset systemic failures.'}},
      {target:'simulation',label:'SimulationOS',
        aggressive:{weight:0.08,effect:'High strategy adoption generates rich feedback data. Simulation models improve as real-world action validates projections.'},
        moderate:{weight:0.03,effect:'Some strategy data feeds back into simulation. Model accuracy improves incrementally.'},
        bau:{weight:0.00,effect:'Minimal strategy action provides no useful feedback data. Simulation models run without real-world validation.'},
        worst:{weight:-0.04,effect:'No strategy adoption means no feedback loop. Simulation operates in a vacuum, disconnected from reality.'}}
    ]
  },
  simulation:{
    label:'SimulationOS',color:'var(--technology)',
    impacts:[
      {target:'climate',label:'ClimateOS',
        aggressive:{weight:0.25,effect:'Maximum climate capex allocation directly funds renewable buildout, grid storage, and carbon capture at scale.'},
        moderate:{weight:0.15,effect:'Moderate climate investment produces measurable but incomplete decarbonization trajectory.'},
        bau:{weight:0.03,effect:'Minimal climate investment. Emissions reduction depends entirely on market-driven technology adoption.'},
        worst:{weight:-0.05,effect:'Climate investment actively defunded. Fossil-fuel subsidies restored. Emissions trajectory worsening.'}},
      {target:'transition',label:'TransitionOS',
        aggressive:{weight:0.22,effect:'High civic dividends and reskilling investment create comprehensive workforce safety net.'},
        moderate:{weight:0.12,effect:'Moderate dividend and reskilling investment provides partial coverage. Gaps remain for hardest-hit sectors.'},
        bau:{weight:-0.05,effect:'No dividend system. Minimal reskilling. Automation proceeds without workforce support.'},
        worst:{weight:-0.18,effect:'Zero workforce investment. Automation maximized for profit extraction. Displacement is a feature, not a bug.'}},
      {target:'governance',label:'GovernanceOS',
        aggressive:{weight:0.18,effect:'Full transparency and binding AI charter create accountable, participatory governance infrastructure.'},
        moderate:{weight:0.10,effect:'Active charter and moderate transparency support governance but lack universal enforcement.'},
        bau:{weight:-0.03,effect:'No charter, minimal transparency. AI governance is voluntary and toothless.'},
        worst:{weight:-0.15,effect:'Governance deliberately weakened. AI systems deployed without oversight. Accountability mechanisms dismantled.'}},
      {target:'civilization',label:'CivilizationOS',
        aggressive:{weight:0.16,effect:'Simulation-driven policy optimizes resource allocation. Civic dividends, healthcare, and education calibrated by predictive models.'},
        moderate:{weight:0.08,effect:'Partial simulation guidance improves some civilizational outcomes. Policy calibration better than guesswork but incomplete.'},
        bau:{weight:-0.04,effect:'No simulation guidance for policy. Civilizational outcomes determined by ad-hoc decisions and political convenience.'},
        worst:{weight:-0.12,effect:'Simulation misuse or collapse leaves civilization flying blind. No evidence base for critical resource decisions.'}},
      {target:'strategy',label:'StrategyOS',
        aggressive:{weight:0.14,effect:'Simulation clarity shows citizens exactly which strategies matter. Evidence-based action plans drive adoption at every level.'},
        moderate:{weight:0.06,effect:'Moderate simulation output informs some strategy choices. Public has partial visibility into what actions work.'},
        bau:{weight:-0.02,effect:'No simulation insight available to public. Strategy adoption based on intuition, marketing, and ideology.'},
        worst:{weight:-0.08,effect:'Simulation credibility destroyed. Citizens have no trusted information source for strategic decisions.'}}
    ]
  }
};

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
