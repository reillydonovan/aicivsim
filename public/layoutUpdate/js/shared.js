/* ================================================================
   SHARED UTILITIES — Feltron Design System
   ================================================================ */

/* ── Grade helpers ── */
function grade(s){return s>=93?'A':s>=85?'A\u2212':s>=80?'B+':s>=73?'B':s>=68?'B\u2212':s>=63?'C+':s>=58?'C':s>=53?'C\u2212':s>=48?'D+':s>=43?'D':s>=38?'D\u2212':'F'}
function gClr(s){return s>=73?'#4ecdc4':s>=53?'#e8a838':s>=38?'#c48a3f':'#d4622a'}
function avg(arr){return Math.round(arr.reduce((a,b)=>a+b,0)/arr.length)}
function fmtK(n){return n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(0)}K`:String(n)}
function fmtPct(n,d=1){return n.toFixed(d)+'%'}

/* ── Chart header — matches Biodiversity domain-card style ──
   opts = { label, value, unit, dec, prefix, dir, baseline, color, endYear }
*/
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

/* ── SVG Sparkline (legacy — still used by governance audit) ── */
function sparkSVG(data, color, w, h, fill){
  w=w||120; h=h||36; fill=fill!==false;
  var mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  var pts=data.map(function(v,i){return (i/(data.length-1))*w+','+(h-((v-mn)/rng)*h)}).join(' ');
  var fp=fill?'<polygon points="0,'+h+' '+pts+' '+w+','+h+'" fill="'+color+'" opacity="0.1"/>':'';
  return '<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="height:'+h+'px">'+fp+'<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>';
}

/* ── SVG Multi-line comparison (legacy — kept for back-compat) ── */
function comparisonSVG(datasets, colors, activeKey, w, h, labels){
  w=w||260;h=h||120;
  var allVals=[]; for(var k in datasets) allVals=allVals.concat(datasets[k]);
  var mn=Math.min(...allVals),mx=Math.max(...allVals),rng=mx-mn||1;
  var s='<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="height:'+h+'px">';
  for(var k in datasets){
    var data=datasets[k];
    var pts=data.map(function(v,i){return (i/(data.length-1))*w+','+(h-4-((v-mn)/rng)*(h-8))}).join(' ');
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
   ══════════════════════════════════════════════════════════════
   opts = {
     datasets   : {aggressive:[…], moderate:[…], bau:[…], worst:[…]},
     colors     : {aggressive:'#4ecdc4', …},
     scenarios  : [{id,name,color}, …],
     activeKey  : 'aggressive',
     startYear  : 2026,
     endYear    : 2050,
     unit       : '%',         // y-axis unit suffix
     dec        : 1,           // decimal places for labels
     prefix     : '',          // e.g. '$' or '+'
     dir        : 'higher',    // 'higher'|'lower'|'context'
     baseline   : null,        // optional baseline value for reference line
     note       : '',          // supporting text below chart
     height     : 180,         // px
     markerYear : null         // optional vertical marker
   }
   Returns an HTML string (SVG + legend + note)
   ────────────────────────────────────────────────────────────── */
function scenarioChart(opts){
  var ds=opts.datasets, colors=opts.colors, ak=opts.activeKey;
  var scenarios=opts.scenarios||[];
  var sy=opts.startYear||2026, ey=opts.endYear||2050;
  var unit=opts.unit||'', dec=opts.dec!=null?opts.dec:1, prefix=opts.prefix||'';
  var lm=80, rm=100, tm=20, bm=40;
  var vw=900, vh=340;
  var pw=vw-lm-rm, ph=vh-tm-bm;

  var allV=[]; for(var k in ds) allV=allV.concat(ds[k]);
  var mn=Math.min.apply(null,allV), mx=Math.max.apply(null,allV);
  var rng=mx-mn||1;
  var pad=rng*0.08; mn-=pad; mx+=pad; rng=mx-mn;

  function yPos(v){ return tm+ph-(((v-mn)/rng)*ph); }
  function xPos(i,len){ return lm+((i/(len-1))*pw); }
  function fVal(v){ return prefix+v.toFixed(dec)+unit; }

  var nTicks=5;
  var svg='<svg viewBox="0 0 '+vw+' '+vh+'" style="width:100%;aspect-ratio:'+vw+'/'+vh+'" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Scenario comparison chart">';

  for(var t=0;t<nTicks;t++){
    var tv=mn+(t/(nTicks-1))*rng;
    var ty=yPos(tv);
    svg+='<line x1="'+lm+'" y1="'+ty+'" x2="'+(vw-rm)+'" y2="'+ty+'" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>';
    svg+='<text x="'+(lm-10)+'" y="'+(ty+5)+'" fill="rgba(255,255,255,0.4)" font-size="16" font-family="var(--font-mono)" text-anchor="end">'+fVal(tv)+'</text>';
  }

  if(opts.baseline!=null){
    var bly=yPos(opts.baseline);
    svg+='<line x1="'+lm+'" y1="'+bly+'" x2="'+(vw-rm)+'" y2="'+bly+'" stroke="rgba(255,255,255,0.18)" stroke-width="1" stroke-dasharray="6,4"/>';
    svg+='<text x="'+(vw-rm+6)+'" y="'+(bly+5)+'" fill="rgba(255,255,255,0.3)" font-size="14" font-family="var(--font-mono)">baseline</text>';
  }

  var ySpan=ey-sy;
  var xLabels=[sy];
  var step=ySpan<=10?2:ySpan<=15?3:ySpan<=30?5:10;
  for(var yr=sy+step;yr<ey;yr+=step) xLabels.push(yr);
  xLabels.push(ey);
  xLabels.forEach(function(yr){
    var xi=lm+((yr-sy)/ySpan)*pw;
    svg+='<line x1="'+xi+'" y1="'+tm+'" x2="'+xi+'" y2="'+(vh-bm)+'" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
    svg+='<text x="'+xi+'" y="'+(vh-bm+24)+'" fill="rgba(255,255,255,0.35)" font-size="16" font-family="var(--font-mono)" text-anchor="middle">'+yr+'</text>';
  });

  if(opts.markerYear){
    var mxi=lm+((opts.markerYear-sy)/ySpan)*pw;
    svg+='<line x1="'+mxi+'" y1="'+tm+'" x2="'+mxi+'" y2="'+(vh-bm)+'" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="5,4"/>';
  }

  var keys=Object.keys(ds);
  keys.forEach(function(k){
    if(k===ak) return;
    var d=ds[k]; var len=d.length;
    var pts=d.map(function(v,i){return xPos(i,len)+','+yPos(v)}).join(' ');
    svg+='<polyline points="'+pts+'" fill="none" stroke="'+(colors[k]||'#888')+'" stroke-width="2" opacity="0.25"/>';
    var endV=d[len-1]; var ex=xPos(len-1,len); var eyl=yPos(endV);
    svg+='<circle cx="'+ex+'" cy="'+eyl+'" r="5" fill="'+(colors[k]||'#888')+'" opacity="0.35"/>';
    svg+='<text x="'+(ex+10)+'" y="'+(eyl+5)+'" fill="'+(colors[k]||'#888')+'" opacity="0.45" font-size="15" font-family="var(--font-mono)">'+fVal(endV)+'</text>';
  });

  var ad=ds[ak]; if(ad){
    var alen=ad.length;
    var apts=ad.map(function(v,i){return xPos(i,alen)+','+yPos(v)}).join(' ');
    svg+='<polygon points="'+xPos(0,alen)+','+yPos(mn)+' '+apts+' '+xPos(alen-1,alen)+','+yPos(mn)+'" fill="'+(colors[ak]||'#4ecdc4')+'" opacity="0.10"/>';
    svg+='<polyline points="'+apts+'" fill="none" stroke="'+(colors[ak]||'#4ecdc4')+'" stroke-width="3.5"/>';
    var aEndV=ad[alen-1]; var aex=xPos(alen-1,alen); var aeyl=yPos(aEndV);
    svg+='<circle cx="'+aex+'" cy="'+aeyl+'" r="6" fill="'+(colors[ak]||'#4ecdc4')+'"/>';
    svg+='<text x="'+(aex+10)+'" y="'+(aeyl+6)+'" fill="'+(colors[ak]||'#4ecdc4')+'" font-size="17" font-weight="600" font-family="var(--font-mono)">'+fVal(aEndV)+'</text>';
  }

  svg+='</svg>';

  var html='<div class="scenario-chart">';
  html+=svg;

  html+='<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:12px">';
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
  html+='</div>';

  var noteText=opts.note;
  if(opts.notes&&opts.notes[ak]) noteText=opts.notes[ak];
  if(noteText){
    html+='<p style="font-size:12px;line-height:1.7;color:rgba(255,255,255,0.45);margin-top:12px;max-width:640px;font-family:var(--font-body)">'+noteText+'</p>';
  }
  html+='</div>';
  return html;
}

/* ── SVG Bar chart (horizontal) ── */
function barChartSVG(items, maxVal, w, h){
  w=w||260;h=h||120;
  var barH=Math.min(16, (h-4)/items.length - 2);
  var s='<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="height:'+h+'px">';
  items.forEach(function(item,i){
    var y=i*(barH+4)+2;
    var bw=(item.value/maxVal)*w*0.7;
    s+='<rect x="0" y="'+y+'" width="'+bw+'" height="'+barH+'" fill="'+(item.color||'#888')+'" opacity="0.5"/>';
    s+='<text x="'+(bw+6)+'" y="'+(y+barH-2)+'" fill="rgba(255,255,255,0.5)" font-size="9" font-family="var(--font-mono)">'+item.label+'</text>';
  });
  s+='</svg>';
  return s;
}

/* ── Scenario legend row (legacy) ── */
function legendHTML(scenarios, activeKey){
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
function initSectionNav(navSelector, sectionPrefix, defaultSection){
  var btns=document.querySelectorAll(navSelector+' .nav-tab');
  var nav=document.querySelector(navSelector);
  if(nav) nav.setAttribute('role','tablist');
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

/* ── Scenario selector ── */
function getScenarioFromHash(){
  var h=window.location.hash.replace('#','');
  if(h&&/^(aggressive|moderate|bau|worst)$/.test(h)) return h;
  return null;
}
function setScenarioHash(id){
  if(window.history&&window.history.replaceState) window.history.replaceState(null,'','#'+id);
  else window.location.hash=id;
}
function initScenarioSelector(barSelector, callback){
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

function updateScenarioBar(barSelector, activeId, scenarios){
  document.querySelectorAll(barSelector+' .scenario-btn').forEach(function(b){
    var sc=b.dataset.sc;
    var info=scenarios.find(function(s){return s.id===sc});
    if(!info) return;
    var isA=sc===activeId;
    b.style.color=isA?info.color:'var(--text-faint)';
    b.setAttribute('aria-pressed',isA?'true':'false');
    b.setAttribute('aria-label','Scenario: '+info.name+(isA?' (active)':''));
    var dot=b.querySelector('.dot');
    if(dot) dot.style.background=isA?info.color:'rgba(255,255,255,0.1)';
  });
}

/* ── Site nav highlighting + mobile toggle ── */
(function(){
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
})();

/* ── HTML template for shared page shell ── */
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
    } else { nav+='<span></span>'; }
    if(idx<PAGE_ORDER.length-1){
      var next=PAGE_ORDER[idx+1];
      nav+='<a href="'+next.href+'" style="color:var(--text-muted);text-decoration:none;font-family:var(--font-body);font-size:13px">'+next.label+' &rarr;</a>';
    } else { nav+='<span></span>'; }
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
