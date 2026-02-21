/* ================================================================
   AICIVSIM — Persistent Chat Widget
   Self-contained floating advisor that persists across page navigations.
   Injected by shared.js on every page. All state in localStorage.
   ================================================================ */
(function(){
'use strict';

/* ── CSS ── */
var css=document.createElement('style');
css.textContent=`
/* Toggle button */
.cw-toggle{position:fixed;bottom:24px;right:24px;z-index:9999;width:48px;height:48px;border-radius:50%;background:rgba(232,168,56,0.12);border:1px solid rgba(232,168,56,0.2);color:#e8a838;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 24px rgba(0,0,0,0.4)}
.cw-toggle:hover{background:rgba(232,168,56,0.2);border-color:rgba(232,168,56,0.35);transform:scale(1.05)}
.cw-toggle svg{width:22px;height:22px;transition:transform 0.3s}
.cw-toggle.open svg{transform:rotate(90deg)}
.cw-badge{position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:#4ecdc4;border:2px solid #111;display:none}

/* Panel */
.cw-panel{position:fixed;bottom:84px;right:24px;z-index:9998;width:380px;max-width:calc(100vw - 48px);height:520px;max-height:calc(100vh - 120px);background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:8px;display:flex;flex-direction:column;box-shadow:0 8px 48px rgba(0,0,0,0.6);opacity:0;transform:translateY(12px) scale(0.96);pointer-events:none;transition:all 0.25s cubic-bezier(0.4,0,0.2,1)}
.cw-panel.visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
.cw-panel.collapsed{height:auto;max-height:none}
.cw-panel.collapsed .cw-log,.cw-panel.collapsed .cw-input-area,.cw-panel.collapsed .cw-settings{display:none}
.cw-panel.collapsed .cw-head{cursor:pointer;border-bottom:none}

/* Header */
.cw-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0}
.cw-head-left{display:flex;align-items:center;gap:8px}
.cw-head-dot{width:6px;height:6px;border-radius:50%;background:#e8a838}
.cw-head-title{font-family:'Space Grotesk',system-ui,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#d4d0c6}
.cw-head-actions{display:flex;gap:4px}
.cw-head-btn{width:28px;height:28px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#5e5b54;transition:all 0.2s;background:none;border:none;cursor:pointer;font-size:14px}
.cw-head-btn:hover{color:#d4d0c6;background:rgba(255,255,255,0.04)}
.cw-page-tag{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:500;color:#5e5b54;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:2px 6px;border-radius:2px;letter-spacing:0.04em;text-transform:uppercase}

/* Settings bar */
.cw-settings{display:none;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);gap:6px;flex-shrink:0;flex-wrap:wrap}
.cw-settings.show{display:flex}
.cw-settings select,.cw-settings input{font-family:'Space Grotesk',system-ui,sans-serif;font-size:10px;background:#171717;border:1px solid rgba(255,255,255,0.06);border-radius:3px;padding:4px 8px;color:#908c82;outline:none}
.cw-settings input{flex:1;min-width:120px}
.cw-settings input:focus,.cw-settings select:focus{border-color:rgba(78,205,196,0.3)}
.cw-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;align-self:center}
.cw-dot.ok{background:#4ecdc4}
.cw-dot.none{background:#3a3834}
.cw-proxy-tag{font-family:'Space Grotesk',system-ui,sans-serif;font-size:8px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:2px 6px;border-radius:2px;white-space:nowrap}
.cw-proxy-tag.active{color:#4ecdc4;background:rgba(78,205,196,0.08);border:1px solid rgba(78,205,196,0.12)}
.cw-proxy-tag.off{color:#5e5b54;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04)}

/* Log */
.cw-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.06) transparent}
.cw-log::-webkit-scrollbar{width:3px}
.cw-log::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:2px}

/* Welcome */
.cw-welcome{text-align:center;padding:24px 12px;margin:auto}
.cw-welcome-icon{font-size:24px;margin-bottom:10px;opacity:0.5}
.cw-welcome h4{font-family:'Space Grotesk',system-ui,sans-serif;font-size:13px;font-weight:600;color:#d4d0c6;margin-bottom:6px}
.cw-welcome p{font-size:11px;color:#5e5b54;line-height:1.6;margin-bottom:12px}
.cw-starters{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
.cw-starter{font-family:'Inter',system-ui,sans-serif;font-size:10px;color:#908c82;background:#171717;border:1px solid rgba(255,255,255,0.06);border-radius:3px;padding:5px 10px;cursor:pointer;transition:all 0.2s}
.cw-starter:hover{border-color:rgba(78,205,196,0.2);color:#d4d0c6}

/* Messages */
.cw-msg{display:flex;gap:8px;align-items:flex-start;max-width:95%;animation:cwIn 0.25s ease}
.cw-msg-user{align-self:flex-end;flex-direction:row-reverse}
.cw-msg-ai{align-self:flex-start}
.cw-av{width:22px;height:22px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;flex-shrink:0;margin-top:1px}
.cw-msg-user .cw-av{background:rgba(78,205,196,0.1);color:#4ecdc4;border:1px solid rgba(78,205,196,0.12)}
.cw-msg-ai .cw-av{background:rgba(232,168,56,0.1);color:#e8a838;border:1px solid rgba(232,168,56,0.12)}
.cw-body{font-family:'Inter',system-ui,sans-serif;font-size:12px;line-height:1.65;color:#908c82;padding:8px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.06)}
.cw-msg-user .cw-body{background:rgba(78,205,196,0.03);border-color:rgba(78,205,196,0.07)}
.cw-msg-ai .cw-body{background:#171717}
.cw-body p{margin:0 0 6px}.cw-body p:last-child{margin:0}
.cw-body strong{color:#d4d0c6;font-weight:600}
.cw-body em{color:#5e5b54}
.cw-body code{font-family:'JetBrains Mono',monospace;font-size:10px;background:rgba(255,255,255,0.03);padding:1px 4px;border-radius:2px;color:#e8a838}
.cw-body a{color:#4ecdc4;border-bottom:1px solid rgba(78,205,196,0.2);text-decoration:none;transition:border-color 0.2s}
.cw-body a:hover{border-color:#4ecdc4}
.cw-body ul,.cw-body ol{margin:4px 0 6px 14px}.cw-body li{margin:2px 0}
.cw-body h4{font-family:'Space Grotesk',system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#d4d0c6;margin:8px 0 4px}.cw-body h4:first-child{margin-top:0}
.cw-body .cw-ref{display:inline-flex;align-items:center;gap:3px;font-family:'Space Grotesk',system-ui,sans-serif;font-size:9px;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;color:#4ecdc4;background:rgba(78,205,196,0.05);border:1px solid rgba(78,205,196,0.1);padding:2px 8px;border-radius:3px;margin:1px;white-space:nowrap;cursor:pointer;text-decoration:none}
.cw-body .cw-ref:hover{background:rgba(78,205,196,0.1);border-color:rgba(78,205,196,0.2)}
.cw-body .cw-ref::before{content:'\\2192';font-size:8px}

/* Typing */
.cw-typing{display:flex;gap:3px;padding:8px 12px}
.cw-typing span{width:4px;height:4px;border-radius:50%;background:rgba(232,168,56,0.35);animation:cwBlink 1.4s infinite}
.cw-typing span:nth-child(2){animation-delay:0.2s}
.cw-typing span:nth-child(3){animation-delay:0.4s}

/* Input */
.cw-input-area{border-top:1px solid rgba(255,255,255,0.06);padding:10px 12px;display:flex;gap:8px;align-items:flex-end;flex-shrink:0}
.cw-input{flex:1;font-family:'Inter',system-ui,sans-serif;font-size:12px;line-height:1.5;color:#d4d0c6;background:#171717;border:1px solid rgba(255,255,255,0.06);border-radius:4px;padding:8px 10px;resize:none;min-height:36px;max-height:100px;outline:none;transition:border-color 0.2s}
.cw-input:focus{border-color:rgba(78,205,196,0.25)}
.cw-input::placeholder{color:#3a3834}
.cw-send{font-family:'Space Grotesk',system-ui,sans-serif;font-size:9px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#4ecdc4;background:rgba(78,205,196,0.06);border:1px solid rgba(78,205,196,0.12);border-radius:4px;padding:8px 14px;cursor:pointer;transition:all 0.2s;white-space:nowrap}
.cw-send:hover:not(:disabled){background:rgba(78,205,196,0.12);border-color:rgba(78,205,196,0.25)}
.cw-send:disabled{opacity:0.3;cursor:not-allowed}

.cw-nav-note{text-align:center;font-family:'Space Grotesk',system-ui,sans-serif;font-size:9px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#5e5b54;padding:4px 0;opacity:0.6}
.cw-nav-note::before{content:'\\2014 '}
.cw-nav-note::after{content:' \\2014'}

@keyframes cwIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes cwBlink{0%,80%,100%{opacity:0.3}40%{opacity:1}}

/* Mobile */
@media(max-width:480px){
  .cw-panel{bottom:0;right:0;width:100vw;max-width:100vw;height:100vh;max-height:100vh;border-radius:0;border:none}
  .cw-toggle{bottom:16px;right:16px}
}
`;
document.head.appendChild(css);

/* ── SITE PAGES MAP ── */
var PAGES={
  'index.html':{l:'Home',d:'Overview of all 7 systems with today + projected scores, scenario selector, sparkline charts'},
  'ai.html':{l:'AI',d:'Alignment Index, Transparency, Safety Protocol Coverage, Compute Governance, Autonomy Safety, Public Trust metrics'},
  'climate.html':{l:'Climate',d:'Temperature rise, CO₂ emissions, biodiversity, renewable energy, ocean pH, crop yields, water stress, forest cover, sea level'},
  'simulation.html':{l:'Simulation',d:'5 policy levers (dividend, capex, reskill, transparency, charter), 50-year timeline, era narratives, GINI/Trust/Emissions/Resilience/AI'},
  'transition.html':{l:'Transition',d:'Poverty rate, reskill completion time, placement rate, employment metrics, income bridge calculator'},
  'civilization.html':{l:'Civilization',d:'Composite health index, KPI trajectories, funding models, aggregate projections'},
  'governance.html':{l:'Governance',d:'AI charter status, citizen assemblies, audit coverage, civic participation, institutional trust'},
  'strategy.html':{l:'Strategy',d:'20+ policy actions across individual/institutional/systemic levels with adoption rates'},
  'timeline.html':{l:'Timeline',d:'200K-year civilization arc, AI as inflection point, major historical transitions'},
  'visualizer.html':{l:'Visualizer',d:'3D Three.js interactive system network with audio, connections, scenario timeline'},
  'viz.html':{l:'3D Network',d:'Three.js node graph with nested sub-orbits, curved connections, scenario-aware coloring'},
  'research.html':{l:'Research',d:'19-section civic roadmap paper with policy recommendations and references'},
  'chat.html':{l:'Advisor',d:'AI advisor landing page with setup guide and example questions'},
  'about.html':{l:'About',d:'Project scope, intent, methodology, technology stack, design system'}
};

/* ── PAGE AWARENESS ── */
function currentPageKey(){
  var path=window.location.pathname;
  var keys=Object.keys(PAGES);
  for(var i=0;i<keys.length;i++){if(path.indexOf(keys[i])!==-1)return keys[i]}
  if(path.endsWith('/')||path.endsWith('/index.html'))return 'index.html';
  return null;
}
function currentPageLabel(){
  var k=currentPageKey();
  return k&&PAGES[k]?PAGES[k].l:'Unknown page';
}
function currentPageDesc(){
  var k=currentPageKey();
  return k&&PAGES[k]?PAGES[k].d:'';
}
var _lastPage=localStorage.getItem('cw_last_page')||'';

/* ── SYSTEM PROMPT ── */
var SYS_PROMPT=`You are the AI Advisor for AICIVSIM (AI Civilization Simulator) — a planning tool modeling civilization-scale challenges across 50-year branching futures. You live as a persistent chat widget across all pages.

## THE 7 SYSTEMS (each scored 0–100)
1. **Climate** (Today: 42) — Temperature, CO2, biodiversity, renewable energy, ocean pH, crop yields, water stress, forest cover, sea level
2. **AI** (Today: 48) — Alignment, Transparency, Safety Protocol, Compute Governance, Autonomy Safety, Public Trust
3. **Simulation** (Today: 50) — 5 policy levers, 50-year timeline, narrative eras. Tracks GINI, Trust, Emissions, Resilience, AI Influence
4. **Transition** (Today: 43) — Poverty rate, reskill time, placement rate, employment metrics
5. **Governance** (Today: 40) — Civic participation, AI charter adoption, citizen assemblies, institutional trust, audit coverage
6. **Strategy** (Today: 35) — 20+ policy actions across individual, institutional, systemic levels
7. **Civilization** (Today: 44) — Composite aggregate of all systems

## 4 SCENARIOS
| Scenario | Civic Dividends | AI Charter | Climate Capex | Reskilling | Transparency |
|---|---|---|---|---|---|
| **Aggressive** (#4ecdc4) | 10% | Enforced | 25% | 20% | 80% |
| **Moderate** (#5da5da) | 5% | Active | 15% | 10% | 50% |
| **BAU** (#e8a838) | 0% | None | 5% | 3% | 20% |
| **Worst** (#d4622a) | 0% | None | 2% | 1% | 10% |

## 2050 PROJECTIONS (Aggressive / Moderate / BAU / Worst)
- Climate: 85 / 58 / 28 / 12
- AI: 92 / 68 / 32 / 10
- Simulation: 90 / 70 / 35 / 15
- Transition: 88 / 68 / 28 / 12
- Governance: 85 / 65 / 30 / 10
- Strategy: 88 / 62 / 22 / 8
- Aggregate: 85 / 63 / 28 / 11

## CROSS-SYSTEM FEEDBACK LOOPS (42 total)
Key examples:
- Climate → Transition: Workforce displacement (−5% Aggressive to −35% Worst)
- AI → Governance: AI complicates governance (−8% Aggressive to −30% Worst)
- Governance → AI: Charter enforcement shapes AI safety (+18% Aggressive to 0% Worst)
- Climate → Governance: Environmental stress strains institutions
- Transition → Strategy: Workforce readiness enables strategy adoption

## SIMULATION ERAS
Dawn (0–3yr): Cautious hope. Divergence (4–12yr): Paths split. Maturity (13–30yr): Patterns lock. Legacy (31+yr): Verdicts.

## TIPPING POINTS
Arctic ice-free: BAU 2035, Worst 2031 | Coral collapse: BAU 2034, Worst 2030 | Amazon dieback: BAU 2040, Worst 2035

## GRADE SCALE
A (90+), A− (85+), B+ (80+), B (70+), B− (65+), C+ (60+), C (50+), C− (45+), D+ (40+), D (35+), D− (30+), F (<30)

## SITE PAGES (use these for links)
- [Home](index.html) — Overview of all 7 systems with today + projected scores
- [AI Dashboard](ai.html) — Alignment, Transparency, Safety metrics
- [Climate Dashboard](climate.html) — Temperature, Emissions, Biodiversity metrics
- [Simulation](simulation.html) — 5 policy levers, 50-year timeline, narrative reports
- [Transition Dashboard](transition.html) — Workforce poverty, reskilling, employment
- [Governance Dashboard](governance.html) — Charter, assemblies, audit coverage
- [Strategy Dashboard](strategy.html) — 20+ actions across levels
- [Civilization Dashboard](civilization.html) — Composite health, KPI trajectories
- [Timeline](timeline.html) — 200K-year arc, AI inflection point
- [Visualizer](visualizer.html) — 3D interactive system network
- [Research Paper](research.html) — 19-section civic roadmap

## CONTEXT AWARENESS
You always receive a [CONTEXT] block at the start of each user turn telling you which page the user is currently viewing and what data is on that page. Use this to:
- Tailor answers to what the user can see right now ("On this page you can see..." or "The chart above shows...")
- Suggest other pages only when the question goes beyond what the current page covers
- When the context says "Navigated via advisor link to...", acknowledge the navigation briefly (e.g. "Now that you're on the Climate dashboard, you can see...")

When linking to pages, use markdown links like [Climate Dashboard](climate.html). Keep answers concise but data-rich. Use specific scores, projections, and scenario comparisons. Frame as planning tool, not predictions.`;

/* ── STATE ── */
var messages=JSON.parse(localStorage.getItem('cw_msgs')||'[]');
var _isHomepage=(function(){var p=window.location.pathname;return p.endsWith('/')||p.endsWith('/index.html')||p.endsWith('index.html')})();
var _hasOpenPref=localStorage.getItem('cw_open')!==null;
var isOpen=_hasOpenPref?localStorage.getItem('cw_open')==='true':_isHomepage;
var isCollapsed=_hasOpenPref?localStorage.getItem('cw_collapsed')==='true':_isHomepage;
var settingsOpen=false;
var streaming=false;
var proxyAvailable=null; /* null=unchecked, true/false after probe */

/* ── BUILD DOM ── */
var toggle=document.createElement('button');
toggle.className='cw-toggle'+(isOpen?' open':'');
toggle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span class="cw-badge" id="cw-badge"></span>';
document.body.appendChild(toggle);

var panel=document.createElement('div');
panel.className='cw-panel'+(isOpen?' visible':'')+(isCollapsed?' collapsed':'');
panel.innerHTML=`
<div class="cw-head">
  <div class="cw-head-left"><div class="cw-head-dot"></div><span class="cw-head-title">Advisor</span><span class="cw-page-tag" id="cw-page-tag"></span></div>
  <div class="cw-head-actions">
    <button class="cw-head-btn" id="cw-collapse-btn" title="Collapse">&#9660;</button>
    <button class="cw-head-btn" id="cw-settings-btn" title="API settings">&#9881;</button>
    <button class="cw-head-btn" id="cw-clear-btn" title="Clear chat">&#10005;</button>
    <button class="cw-head-btn" id="cw-full-btn" title="Full page" onclick="window.location.href='chat.html'">&#8599;</button>
  </div>
</div>
<div class="cw-settings" id="cw-settings">
  <span class="cw-dot none" id="cw-api-dot"></span>
  <span class="cw-proxy-tag" id="cw-proxy-tag" style="display:none"></span>
  <select id="cw-provider"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select>
  <input type="password" id="cw-apikey" placeholder="API key (local only)">
  <select id="cw-model"></select>
</div>
<div class="cw-log" id="cw-log"></div>
<div class="cw-input-area">
  <textarea class="cw-input" id="cw-input" rows="1" placeholder="Ask about systems, scenarios&hellip;"></textarea>
  <button class="cw-send" id="cw-send">Send</button>
</div>`;
document.body.appendChild(panel);

var log=document.getElementById('cw-log');
var input=document.getElementById('cw-input');
var sendBtn=document.getElementById('cw-send');
var providerEl=document.getElementById('cw-provider');
var keyEl=document.getElementById('cw-apikey');
var modelEl=document.getElementById('cw-model');
var dotEl=document.getElementById('cw-api-dot');
var settingsEl=document.getElementById('cw-settings');

/* ── RESTORE SETTINGS ── */
keyEl.value=localStorage.getItem('aicivsim_api_key')||'';
providerEl.value=localStorage.getItem('aicivsim_api_provider')||'openai';
updateModels();
var sm=localStorage.getItem('aicivsim_api_model');
if(sm)modelEl.value=sm;
updateDot();

/* ── SETTINGS EVENTS ── */
keyEl.addEventListener('input',function(){localStorage.setItem('aicivsim_api_key',keyEl.value);updateDot()});
providerEl.addEventListener('change',function(){localStorage.setItem('aicivsim_api_provider',providerEl.value);updateModels();updateDot()});
modelEl.addEventListener('change',function(){localStorage.setItem('aicivsim_api_model',modelEl.value)});

function updateModels(){
  modelEl.innerHTML='';
  if(providerEl.value==='openai'){
    addOpt('gpt-4o-mini','GPT-4o Mini');addOpt('gpt-4o','GPT-4o');
  }else{
    addOpt('claude-sonnet-4-20250514','Claude Sonnet');addOpt('claude-haiku-4-20250514','Claude Haiku');
  }
  function addOpt(v,t){var o=document.createElement('option');o.value=v;o.textContent=t;modelEl.appendChild(o)}
  localStorage.setItem('aicivsim_api_model',modelEl.value);
}
function updateDot(){dotEl.className='cw-dot '+(keyEl.value.length>10?'ok':'none')}

var collapseBtn=document.getElementById('cw-collapse-btn');
function setCollapsed(c){
  isCollapsed=c;
  panel.classList.toggle('collapsed',c);
  collapseBtn.innerHTML=c?'&#9650;':'&#9660;';
  collapseBtn.title=c?'Expand':'Collapse';
  localStorage.setItem('cw_collapsed',c?'true':'false');
  if(!c){log.scrollTop=log.scrollHeight;setTimeout(function(){input.focus()},100)}
}
collapseBtn.addEventListener('click',function(e){e.stopPropagation();setCollapsed(!isCollapsed)});
if(isCollapsed)collapseBtn.innerHTML='&#9650;';

panel.querySelector('.cw-head').addEventListener('click',function(e){
  if(isCollapsed&&!e.target.closest('.cw-head-btn')){setCollapsed(false)}
});

document.getElementById('cw-settings-btn').addEventListener('click',function(){
  if(isCollapsed)setCollapsed(false);
  settingsOpen=!settingsOpen;
  settingsEl.className='cw-settings'+(settingsOpen?' show':'');
});
document.getElementById('cw-clear-btn').addEventListener('click',function(){
  messages=[];saveMessages();renderLog();
});

/* ── TOGGLE ── */
toggle.addEventListener('click',function(){
  isOpen=!isOpen;
  panel.classList.toggle('visible',isOpen);
  toggle.classList.toggle('open',isOpen);
  localStorage.setItem('cw_open',isOpen?'true':'false');
  if(isOpen){
    if(isCollapsed)setCollapsed(false);
    log.scrollTop=log.scrollHeight;
    setTimeout(function(){input.focus()},100);
    document.getElementById('cw-badge').style.display='none';
  }
});

/* ── RENDER MESSAGE LOG ── */
function renderLog(){
  log.innerHTML='';
  var hasVisible=messages.some(function(m){return m.role!=='system'});
  if(!hasVisible){
    log.innerHTML=`<div class="cw-welcome">
      <div class="cw-welcome-icon">&#9672;</div>
      <h4>Civilization Advisor</h4>
      <p>Ask about systems, scenarios, metrics, or policy levers. I can point you to the right page.</p>
      <div class="cw-starters" id="cw-starters">
        <button class="cw-starter">Climate under Worst Case?</button>
        <button class="cw-starter">Compare scenarios by 2050</button>
        <button class="cw-starter">Key feedback loops?</button>
        <button class="cw-starter">Which levers matter most?</button>
      </div>
    </div>`;
    document.querySelectorAll('.cw-starter').forEach(function(b){
      b.addEventListener('click',function(){input.value=b.textContent;send()});
    });
    return;
  }
  messages.forEach(function(m){
    if(m.role==='system'){
      var note=document.createElement('div');
      note.className='cw-nav-note';
      var pg=m.content.match(/navigated from (.+?) to (.+?) \(/);
      note.textContent=pg?'Navigated to '+pg[2]:'Page changed';
      log.appendChild(note);
      return;
    }
    appendMsgEl(m.role==='user'?'user':'ai',m.content);
  });
  log.scrollTop=log.scrollHeight;
}

function appendMsgEl(role,text){
  var el=document.createElement('div');
  el.className='cw-msg cw-msg-'+role;
  var av=role==='user'?'YOU':'AI';
  el.innerHTML='<div class="cw-av">'+av+'</div><div class="cw-body">'+renderMd(text)+'</div>';
  log.appendChild(el);
  bindPageLinks(el);
  return el;
}

function bindPageLinks(container){
  container.querySelectorAll('.cw-ref').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      var href=a.getAttribute('data-href');
      if(href&&PAGES[href]){
        localStorage.setItem('cw_open','true');
        localStorage.setItem('cw_nav_from',currentPageKey()||'');
        localStorage.setItem('cw_nav_to',href);
        saveMessages();
        window.location.href=href;
      }
    });
  });
}

/* ── MARKDOWN RENDERER ── */
function renderMd(raw){
  if(!raw)return'';
  var s=raw;
  s=s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  s=s.replace(/^####?\s+(.+)$/gm,'<h4>$1</h4>');
  s=s.replace(/^###?\s+(.+)$/gm,'<h4>$1</h4>');
  s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\*(.+?)\*/g,'<em>$1</em>');
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,function(_,text,href){
    if(PAGES[href])return '<a class="cw-ref" data-href="'+href+'">'+text+'</a>';
    return '<a href="'+href+'" target="_blank" rel="noopener">'+text+'</a>';
  });
  s=s.replace(/^[\-\*]\s+(.+)$/gm,'<li>$1</li>');
  s=s.replace(/((?:<li>.*<\/li>\n?)+)/g,'<ul>$1</ul>');
  s=s.replace(/^\d+\.\s+(.+)$/gm,'<li>$1</li>');
  s=s.replace(/\n{2,}/g,'</p><p>');
  s=s.replace(/\n/g,'<br>');
  if(!s.startsWith('<'))s='<p>'+s;
  if(!s.endsWith('>'))s=s+'</p>';
  s=s.replace(/<p><\/p>/g,'');
  s=s.replace(/<p>(<h4>)/g,'$1');
  s=s.replace(/(<\/h4>)<\/p>/g,'$1');
  s=s.replace(/<p>(<ul>)/g,'$1');
  s=s.replace(/(<\/ul>)<\/p>/g,'$1');
  return s;
}

/* ── PERSISTENCE ── */
function saveMessages(){localStorage.setItem('cw_msgs',JSON.stringify(messages))}

/* ── SEND ── */
input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'});
input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
sendBtn.addEventListener('click',send);

function send(){
  var text=input.value.trim();
  if(!text||streaming)return;
  if(!keyEl.value&&!proxyAvailable){
    settingsOpen=true;settingsEl.className='cw-settings show';
    keyEl.focus();keyEl.style.borderColor='rgba(212,98,42,0.5)';
    setTimeout(function(){keyEl.style.borderColor=''},1500);
    return;
  }

  var welcome=log.querySelector('.cw-welcome');
  if(welcome)welcome.remove();

  appendMsgEl('user',text);
  var ctx=buildContext();
  messages.push({role:'user',content:text,_ctx:ctx});
  saveMessages();
  input.value='';input.style.height='auto';

  streaming=true;sendBtn.disabled=true;
  var aiEl=appendMsgEl('ai','');
  var body=aiEl.querySelector('.cw-body');
  body.innerHTML='<div class="cw-typing"><span></span><span></span><span></span></div>';
  log.scrollTop=log.scrollHeight;

  callLLM(messages,function(chunk,done){
    if(body.querySelector('.cw-typing'))body.innerHTML='';
    if(chunk)body._raw=(body._raw||'')+chunk;
    body.innerHTML=renderMd(body._raw||'');
    bindPageLinks(aiEl);
    log.scrollTop=log.scrollHeight;
    if(done){
      streaming=false;sendBtn.disabled=false;
      messages.push({role:'assistant',content:body._raw||''});
      saveMessages();
      input.focus();
    }
  });
}

/* ── LLM API ── */
function buildContext(){
  var pg=currentPageKey();
  var label=currentPageLabel();
  var desc=currentPageDesc();
  var ctx='[CONTEXT] User is viewing: '+label;
  if(pg)ctx+=' ('+pg+')';
  if(desc)ctx+=' — Page contains: '+desc;
  var navTo=localStorage.getItem('cw_nav_to');
  if(navTo&&navTo===pg){
    var navFrom=localStorage.getItem('cw_nav_from');
    var fromLabel=navFrom&&PAGES[navFrom]?PAGES[navFrom].l:'another page';
    ctx+='\nUser just navigated here via an advisor link from '+fromLabel+'.';
  }
  return ctx;
}

function prepareMessages(msgs){
  var out=[];
  for(var i=0;i<msgs.length;i++){
    var m=msgs[i];
    if(m.role==='system'){
      out.push({role:'user',content:m.content});
      out.push({role:'assistant',content:'Understood, I see the user has navigated.'});
    }else if(m.role==='user'&&m._ctx){
      out.push({role:'user',content:m._ctx+'\n\n'+m.content});
    }else{
      out.push({role:m.role,content:m.content});
    }
  }
  return out;
}

function callLLM(msgs,onChunk){
  var prepared=prepareMessages(msgs);
  if(proxyAvailable&&!keyEl.value){
    callProxy(prepared,onChunk);
  }else if(keyEl.value){
    if(providerEl.value==='anthropic')callAnthropic(prepared,onChunk);
    else callOpenAI(prepared,onChunk);
  }else{
    onChunk('*No API available. Open settings (gear icon) and paste an API key, or wait for the server proxy to respond.*',true);
  }
}

/* ── Proxy call — server holds the key ── */
function callProxy(msgs,onChunk){
  var body={system:SYS_PROMPT,messages:msgs};
  fetch('api/chat.php',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  }).then(function(r){
    if(!r.ok)return r.text().then(function(t){throw new Error(t)});
    var reader=r.body.getReader(),dec=new TextDecoder(),buf='';
    var provider=(proxyProvider||'openai');
    (function read(){
      reader.read().then(function(res){
        if(res.done){onChunk('',true);return}
        buf+=dec.decode(res.value,{stream:true});
        var lines=buf.split('\n');buf=lines.pop();
        lines.forEach(function(l){
          if(!l.startsWith('data: '))return;
          var d=l.slice(6);
          if(d==='[DONE]'){onChunk('',true);return}
          try{
            var j=JSON.parse(d);
            if(j.type==='content_block_delta'&&j.delta&&j.delta.text){onChunk(j.delta.text,false)}
            else if(j.type==='message_stop'){onChunk('',true)}
            else if(j.choices&&j.choices[0]&&j.choices[0].delta&&j.choices[0].delta.content){onChunk(j.choices[0].delta.content,false)}
          }catch(e){}
        });
        read();
      }).catch(function(e){onChunk('\n\n*Error: '+e.message+'*',true)});
    })();
  }).catch(function(e){onChunk('*Proxy error: '+e.message+'*',true)});
}

/* ── Direct OpenAI call ── */
function callOpenAI(msgs,onChunk){
  var body={model:modelEl.value,messages:[{role:'system',content:SYS_PROMPT}].concat(msgs),stream:true,max_tokens:1500};
  fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+keyEl.value},
    body:JSON.stringify(body)
  }).then(function(r){
    if(!r.ok)return r.text().then(function(t){throw new Error(t)});
    var reader=r.body.getReader(),dec=new TextDecoder(),buf='';
    (function read(){
      reader.read().then(function(res){
        if(res.done){onChunk('',true);return}
        buf+=dec.decode(res.value,{stream:true});
        var lines=buf.split('\n');buf=lines.pop();
        lines.forEach(function(l){
          if(!l.startsWith('data: '))return;
          var d=l.slice(6);if(d==='[DONE]'){onChunk('',true);return}
          try{var j=JSON.parse(d);var c=j.choices&&j.choices[0]&&j.choices[0].delta;if(c&&c.content)onChunk(c.content,false)}catch(e){}
        });
        read();
      }).catch(function(e){onChunk('\n\n*Error: '+e.message+'*',true)});
    })();
  }).catch(function(e){onChunk('*Error: '+e.message+'*',true)});
}

/* ── Direct Anthropic call ── */
function callAnthropic(msgs,onChunk){
  var body={model:modelEl.value,system:SYS_PROMPT,messages:msgs.map(function(m){return{role:m.role,content:m.content}}),stream:true,max_tokens:1500};
  fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':keyEl.value,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify(body)
  }).then(function(r){
    if(!r.ok)return r.text().then(function(t){throw new Error(t)});
    var reader=r.body.getReader(),dec=new TextDecoder(),buf='';
    (function read(){
      reader.read().then(function(res){
        if(res.done){onChunk('',true);return}
        buf+=dec.decode(res.value,{stream:true});
        var lines=buf.split('\n');buf=lines.pop();
        lines.forEach(function(l){
          if(!l.startsWith('data: '))return;
          try{var j=JSON.parse(l.slice(6));if(j.type==='content_block_delta'&&j.delta&&j.delta.text)onChunk(j.delta.text,false);if(j.type==='message_stop')onChunk('',true)}catch(e){}
        });
        read();
      }).catch(function(e){onChunk('\n\n*Error: '+e.message+'*',true)});
    })();
  }).catch(function(e){onChunk('*Error: '+e.message+'*',true)});
}

/* ── PROXY DETECTION ── */
var proxyProvider='openai';
var proxyTag=document.getElementById('cw-proxy-tag');

function updateProxyUI(){
  if(!proxyTag)return;
  if(proxyAvailable){
    proxyTag.textContent='Server API';
    proxyTag.className='cw-proxy-tag active';
    proxyTag.style.display='';
    keyEl.placeholder='Optional — server API active';
    dotEl.className='cw-dot ok';
  }else if(proxyAvailable===false){
    proxyTag.style.display='none';
    updateDot();
  }
}

(function probeProxy(){
  fetch('api/chat.php',{method:'OPTIONS'}).then(function(r){
    if(r.ok||r.status===405||r.status===200){
      proxyAvailable=true;
      updateProxyUI();
    }else{
      proxyAvailable=false;updateProxyUI();
    }
  }).catch(function(){proxyAvailable=false;updateProxyUI()});
})();

/* ── INIT ── */
var pageTag=document.getElementById('cw-page-tag');
if(pageTag)pageTag.textContent=currentPageLabel();

/* On page load: detect if we arrived via an advisor link */
(function(){
  var navTo=localStorage.getItem('cw_nav_to');
  var pg=currentPageKey();
  if(navTo&&navTo===pg&&messages.length>0){
    var navFrom=localStorage.getItem('cw_nav_from')||'';
    var fromLabel=navFrom&&PAGES[navFrom]?PAGES[navFrom].l:'another page';
    var toLabel=currentPageLabel();
    var navNote={role:'system',content:'[Navigation] User clicked an advisor link and navigated from '+fromLabel+' to '+toLabel+' ('+pg+'). The page contains: '+currentPageDesc()};
    messages.push(navNote);
    saveMessages();
    localStorage.removeItem('cw_nav_to');
    localStorage.removeItem('cw_nav_from');
  }
  localStorage.setItem('cw_last_page',pg||'');
})();

renderLog();
if(isOpen)setTimeout(function(){log.scrollTop=log.scrollHeight},50);

})();
