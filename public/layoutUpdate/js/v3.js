/* ════════════════════════════════════════════════════════════════
   AICIVSIM — DESIGN V3 runtime (experiment branch: design-v3)
   Loads AFTER js/shared.js (data: VIZ_METRICS, SIM_ENGINE,
   STRATEGY_CATALOG, CROSS_SYSTEM, grade, simWorldState…).

   Provides:
   • V3.scenario  — sitewide scenario store. DEFAULT IS ALWAYS BAU;
     a user selection persists across pages via localStorage
     ('aicivsim-scenario', same key as the live site) + URL hash.
   • V3.nav / V3.deck / V3.footer — shared chrome.
   • Motion — spring physics engine (motion.dev-inspired, zero-dep):
     springs drive number tweens and generate CSS linear() easings;
     stagger() ripples confirmation through data lists on change.
     Production recommendation: motion.dev vanilla build (~5KB).
   • Chart kit — "one geometry, six forms": stat, traj, dumbbell,
     meter, bars, slope. Shared anatomy; emphasis rule (active
     scenario bold + direct-labeled, others ghost); no per-chart
     legends — the scenario control is the legend; uniform tooltip.
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var V3=window.V3={};

/* ── Scenario meta (chart moderate-blue #4a7fd4 is the validated
      refinement; see design-v3.html "A palette that survives") ── */
V3.SC={
  aggressive:{id:'aggressive',name:'Aggressive action',short:'Aggressive',color:'#4ecdc4',proj:85,verdict:'systemic recovery underway'},
  moderate:{id:'moderate',name:'Moderate reform',short:'Moderate',color:'#4a7fd4',proj:63,verdict:'moderate improvement'},
  bau:{id:'bau',name:'Business as usual',short:'As usual',color:'#e8a838',proj:28,verdict:'systemic decline'},
  worst:{id:'worst',name:'Worst case',short:'Worst',color:'#d4622a',proj:11,verdict:'civilizational failure'}
};
V3.SC_ORDER=['aggressive','moderate','bau','worst'];
V3.SYS={
  ai:{label:'AI',color:'#e8a838',href:'ai-v3.html'},
  climate:{label:'Climate',color:'#4ecdc4',href:'climate-v3.html'},
  governance:{label:'Governance',color:'#9b87f5',href:'governance-v3.html'},
  transition:{label:'Transition',color:'#5da5da',href:'transition-v3.html'},
  civilization:{label:'Civilization',color:'#e05c7e',href:'civilization-v3.html'},
  strategy:{label:'Strategy',color:'#d4622a',href:'strategy-v3.html'},
  simulation:{label:'Simulation',color:'#b8b6ae',href:'simulation-v3.html'}
};
V3.grade=window.grade||function(s){return s>=93?'A':s>=85?'A−':s>=80?'B+':s>=73?'B':s>=68?'B−':s>=63?'C+':s>=58?'C':s>=53?'C−':s>=48?'D+':s>=43?'D':s>=38?'D−':'F'};

/* ════════ Scenario store — default BAU, persist across pages ════════ */
var listeners=[];
var current=(function(){
  var h=location.hash.replace('#','');
  if(V3.SC[h])return h;
  try{var s=localStorage.getItem('aicivsim-scenario');if(V3.SC[s])return s}catch(e){}
  return 'bau';                             /* the default, everywhere */
})();
V3.scenario={
  get:function(){return current},
  meta:function(){return V3.SC[current]},
  set:function(id){
    if(!V3.SC[id]||id===current)return;
    current=id;
    try{localStorage.setItem('aicivsim-scenario',id)}catch(e){}
    if(history.replaceState)history.replaceState(null,'','#'+id);
    document.querySelectorAll('.sc-seg button').forEach(function(b){
      b.setAttribute('aria-pressed',String(b.getAttribute('data-sc')===id));
    });
    listeners.forEach(function(fn){fn(id)});
  },
  onChange:function(fn){listeners.push(fn)}
};

/* ════════ Motion — spring engine (motion.dev-inspired) ════════ */
var REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Sample a damped spring into a CSS linear() easing so plain CSS
   transitions get real spring feel with zero dependencies. */
function springEasing(stiffness,damping){
  var m=1,x=1,v=0,dt=1/60,pts=[],dur=0;
  for(var t=0;t<3;t+=dt){
    var F=-stiffness*x-damping*v;
    v+=F/m*dt;x+=v*dt;dur=t;
    pts.push(1-x);
    if(Math.abs(x)<.001&&Math.abs(v)<.001)break;
  }
  var step=Math.max(1,Math.floor(pts.length/24));
  var out=[];for(var i=0;i<pts.length;i+=step)out.push((Math.round(pts[i]*1000)/1000));
  out.push(1);
  return {css:'linear('+out.join(',')+')',duration:dur};
}
var SPRING=springEasing(170,20);            /* default: settle ~.6s, slight overshoot */
document.documentElement.style.setProperty('--spring',SPRING.css);
document.documentElement.style.setProperty('--spring-dur',(REDUCED?0.01:SPRING.duration).toFixed(2)+'s');

/* Spring-driven number tween (replaces duration easings). */
V3.tween=function(el,to,opts){
  opts=opts||{};
  var from=opts.from!=null?opts.from:parseFloat(String(el.textContent).replace(/[^\d.+-]/g,''))||0;
  var dec=opts.dec||0,fmt=opts.fmt||function(v){return v.toFixed(dec)};
  if(REDUCED){el.textContent=fmt(to);return}
  var x=from,v=0,k=opts.stiffness||170,d=opts.damping||26,last=performance.now();
  function step(now){
    var dt=Math.min(.064,(now-last)/1000);last=now;
    var F=-k*(x-to)-d*v;v+=F*dt;x+=v*dt;
    if(Math.abs(x-to)<.002*Math.max(1,Math.abs(to))&&Math.abs(v)<.01){el.textContent=fmt(to);return}
    el.textContent=fmt(x);requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};
/* Confirmation ripple: stagger a subtle pulse through a list when
   its data changes. Never hides content — opacity floor is .55. */
V3.stagger=function(nodes,perDelay){
  if(REDUCED)return;
  perDelay=perDelay==null?26:perDelay;
  Array.prototype.forEach.call(nodes,function(n,i){
    n.style.transition='none';n.style.opacity='.55';n.style.transform='translateY(3px)';
    setTimeout(function(){
      n.style.transition='opacity .3s ease,transform .5s '+SPRING.css;
      n.style.opacity='';n.style.transform='';
    },i*perDelay);
  });
};

/* ════════ Chrome ════════ */
var NAV=[
  {label:'Overview',href:'index-v3.html'},
  {label:'Systems',menu:['ai','climate','governance','transition','civilization','strategy'].map(function(k){
    return {href:V3.SYS[k].href,label:V3.SYS[k].label,tick:V3.SYS[k].color,hint:{ai:'48 today',climate:'42 today',governance:'40 today',transition:'43 today',civilization:'44 today',strategy:'35 today'}[k]};
  })},
  {label:'Tools',menu:[
    {href:'simulation-v3.html',label:'Simulation',hint:'5 levers · 2027–2070'},
    {href:'pathways-v3.html',label:'Pathways',hint:'between futures'},
    {href:'visualizer-v3.html',label:'Visualizer',hint:'3D · XR'}]},
  {label:'Evidence',menu:[
    {href:'data-v3.html',label:'Live data',hint:'8 feeds'},
    {href:'timeline-v3.html',label:'Timeline',hint:'200K years'},
    {href:'research-v3.html',label:'Research',hint:'the paper'}]},
  {label:'Advisor',href:'chat.html'},
  {label:'About',href:'about-v3.html'}
];
V3.protoNote=function(){
  return '<div class="proto-note">Design v3 prototype — an experiment on the <b>design-v3</b> branch. Read the <a href="design-v3.html">audit &amp; proposal</a> · <a href="'+location.pathname.split('/').pop().replace('-v3','').replace('index.html','index.html')+'" style="opacity:.85">current design</a></div>';
};
V3.nav=function(currentHref){
  var h='<nav class="nav" aria-label="Site"><div class="nav-inner">';
  h+='<a class="wordmark" href="index-v3.html">AICIVSIM<em>.</em></a>';
  NAV.forEach(function(item){
    h+='<div class="nav-item">';
    if(item.menu){
      var cur=item.menu.some(function(m){return m.href===currentHref});
      h+='<button class="nav-link"'+(cur?' aria-current="true"':'')+' aria-haspopup="true">'+item.label+' <span class="chev"></span></button><div class="menu">';
      item.menu.forEach(function(m){
        h+='<a href="'+m.href+'">'+(m.tick?'<i class="tick" style="background:'+m.tick+'"></i>':'')+m.label+(m.hint?'<span class="hint">'+m.hint+'</span>':'')+'</a>';
      });
      h+='</div>';
    }else{
      h+='<a class="nav-link" href="'+item.href+'"'+(item.href===currentHref?' aria-current="page"':'')+'>'+item.label+'</a>';
    }
    h+='</div>';
  });
  h+='<button class="theme-btn" id="v3-theme" aria-label="Toggle theme"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></button>';
  h+='</div></nav>';
  return h;
};
V3.seg=function(compact){
  var h='<div class="sc-seg'+(compact?' compact':'')+'" role="group" aria-label="Scenario">';
  V3.SC_ORDER.forEach(function(id){
    var m=V3.SC[id];
    h+='<button data-sc="'+id+'" style="--sc:'+m.color+'" aria-pressed="'+(id===current)+'"><span class="dot"></span>'+m.short+'</button>';
  });
  return h+'</div>';
};
V3.deck=function(sysKey,context){
  var s=V3.SYS[sysKey]||{label:context||'',color:'var(--ink-4)'};
  return '<div class="deck"><div class="deck-inner">'
    +'<div class="deck-title"><i style="background:'+(s.color||'var(--ink-4)')+'"></i><b>'+s.label+'</b>'
    +(context?'<span>'+context+'</span>':'')+'</div>'
    +V3.seg(true)+'</div></div>';
};
V3.footer=function(){
  return '<footer class="v3-footer"><div class="col">'
    +'<div class="foot-grid"><div><a class="wordmark" href="index-v3.html">AICIVSIM<em>.</em></a>'
    +'<p class="body-2" style="margin-top:14px;max-width:300px">A data-driven simulation framework for reasoning about the systems that decide civilizational outcomes. Open source; not a prediction engine.</p></div>'
    +'<div><h4>Systems</h4><a href="ai-v3.html">AI</a><a href="climate-v3.html">Climate</a><a href="governance-v3.html">Governance</a><a href="transition-v3.html">Transition</a><a href="civilization-v3.html">Civilization</a><a href="strategy-v3.html">Strategy</a></div>'
    +'<div><h4>Explore</h4><a href="simulation-v3.html">Simulation</a><a href="pathways-v3.html">Pathways</a><a href="visualizer-v3.html">Visualizer</a><a href="data-v3.html">Live data</a><a href="research-v3.html">Research</a><a href="about-v3.html">About</a></div></div>'
    +'<div class="foot-note"><span>AI Civilization Simulator · 2026 · grounded in live data from NOAA, Our World in Data, and the World Bank</span>'
    +'<span>Design v3 prototype — <a href="design-v3.html">read the proposal</a></span></div>'
    +'</div></footer>';
};
/* Mount chrome + wire controls. Call once per page. */
V3.boot=function(opts){
  opts=opts||{};
  var here=location.pathname.split('/').pop()||'index-v3.html';
  document.body.insertAdjacentHTML('afterbegin',
    V3.protoNote()+V3.nav(here)+(opts.deck?V3.deck(opts.deck.sys,opts.deck.context):''));
  document.body.insertAdjacentHTML('beforeend',V3.footer());
  /* theme — same key as live site */
  try{if(localStorage.getItem('aicivsim-theme')==='light')document.body.classList.add('light')}catch(e){}
  document.getElementById('v3-theme').addEventListener('click',function(){
    var light=document.body.classList.toggle('light');
    try{localStorage.setItem('aicivsim-theme',light?'light':'dark')}catch(e){}
  });
  /* every segmented control drives the store */
  document.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.sc-seg button'):null;
    if(b)V3.scenario.set(b.getAttribute('data-sc'));
  });
};

/* ════════ Tooltip singleton ════════ */
var tip=null;
function tipEl(){
  if(!tip){tip=document.createElement('div');tip.className='v3-tip';document.body.appendChild(tip)}
  return tip;
}
V3.tipShow=function(x,y,html){
  var t=tipEl();t.innerHTML=html;t.style.opacity='1';
  var w=t.offsetWidth,h=t.offsetHeight;
  var px=Math.min(innerWidth-w-12,x+14),py=y-h-12;if(py<8)py=y+16;
  t.style.left=px+'px';t.style.top=py+'px';
};
V3.tipHide=function(){if(tip)tip.style.opacity='0'};

/* ════════ Chart kit ════════ */
function niceTicks(lo,hi,n){
  if(lo===hi){hi=lo+1}
  var span=hi-lo,step=Math.pow(10,Math.floor(Math.log10(span/n)));
  var err=span/n/step;
  step*= err>=7.5?10:err>=3?5:err>=1.5?2:1;
  var t0=Math.ceil(lo/step)*step,ticks=[];
  for(var v=t0;v<=hi+1e-9;v+=step)ticks.push(Math.round(v*1000)/1000);
  return ticks;
}
function fmtVal(v,dec){
  if(dec!=null)return v.toFixed(dec);
  return Math.abs(v)>=100?String(Math.round(v)):Math.abs(v)>=10?v.toFixed(1).replace(/\.0$/,''):v.toFixed(2).replace(/0$/,'').replace(/\.$/,'');
}
V3.fmtVal=fmtVal;

/* traj — EMPHASIS trajectory. spec: {label,unit,prefix,dec,dir,years:[...],
   data:{sc:[...]}, read:fn(active2050,spec)→string, cursorYear:fn|null} */
V3.traj=function(container,spec){
  var card=typeof container==='string'?document.querySelector(container):container;
  var plot=document.createElement('div');plot.className='v3-plot';
  var head=document.createElement('div');head.className='c-head';
  head.innerHTML='<span class="c-title">'+spec.label+'</span><span class="c-unit">'+(spec.unit||'')+'</span>';
  var read=document.createElement('div');read.className='c-read';
  card.appendChild(head);card.appendChild(read);card.appendChild(plot);
  var years=spec.years;
  var lo=Infinity,hi=-Infinity;
  V3.SC_ORDER.forEach(function(sc){spec.data[sc].forEach(function(v){if(v<lo)lo=v;if(v>hi)hi=v})});
  var pad=(hi-lo)*.06;lo-=pad;hi+=pad;
  function render(){
    var W=Math.max(280,plot.clientWidth||card.clientWidth-40),H=210;
    var ML=8,MR=72,MT=8,MB=22;
    var iw=W-ML-MR,ih=H-MT-MB;
    var X=function(i){return ML+iw*(i/(years.length-1))};
    var Y=function(v){return MT+ih*(1-(v-lo)/(hi-lo))};
    var act=V3.scenario.get(),am=V3.SC[act];
    var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">';
    var ticks=niceTicks(lo,hi,3);
    ticks.forEach(function(t){
      var y=Y(t);if(y<MT-1||y>MT+ih+1)return;
      s+='<line class="grid" x1="'+ML+'" x2="'+(W-MR+6)+'" y1="'+y+'" y2="'+y+'"/>';
      s+='<text class="axis" x="'+(W-MR+10)+'" y="'+(y+3.5)+'">'+fmtVal(t,spec.dec)+'</text>';
    });
    s+='<text class="axis" x="'+ML+'" y="'+(H-6)+'">'+years[0]+'</text>';
    s+='<text class="axis" x="'+(ML+iw)+'" y="'+(H-6)+'" text-anchor="end">'+years[years.length-1]+'</text>';
    /* ghosts under, active on top */
    var order=V3.SC_ORDER.filter(function(x){return x!==act}).concat([act]);
    var endLabels=[];
    order.forEach(function(sc){
      var m=V3.SC[sc],d=spec.data[sc],on=sc===act;
      var path='M'+d.map(function(v,i){return X(i).toFixed(1)+','+Y(v).toFixed(1)}).join('L');
      s+='<path d="'+path+'" fill="none" stroke="'+m.color+'" stroke-width="'+(on?2.2:1.25)+'"'+(on?'':' stroke-opacity="var(--ghost)"')+' stroke-linejoin="round" stroke-linecap="round"'+(on?' class="traj-active"':'')+'/>';
      var ev=d[d.length-1];
      endLabels.push({sc:sc,on:on,y:Y(ev),v:ev,color:m.color});
      if(on)s+='<circle cx="'+X(d.length-1)+'" cy="'+Y(ev)+'" r="3.4" fill="'+m.color+'"/>';
    });
    /* collision-avoided direct end labels — identity never color-alone */
    endLabels.sort(function(a,b){return a.y-b.y});
    for(var i=1;i<endLabels.length;i++)if(endLabels[i].y-endLabels[i-1].y<13)endLabels[i].y=endLabels[i-1].y+13;
    endLabels.forEach(function(l){
      /* active line: the value (its name is in the read-line); ghosts: name */
      var txt=l.on?(spec.prefix||'')+fmtVal(l.v,spec.dec):V3.SC[l.sc].short.toLowerCase();
      s+='<text class="endlbl'+(l.on?'':' ghosted')+'" x="'+(W-MR+10)+'" y="'+(Math.max(MT+8,Math.min(MT+ih,l.y))+3.5)+'" fill="'+l.color+'">'+txt+'</text>';
    });
    if(spec.cursorYear){
      var cy=spec.cursorYear();
      if(cy!=null){
        var ci=(cy-years[0])/(years[years.length-1]-years[0])*(years.length-1);
        var cx=X(Math.max(0,Math.min(years.length-1,ci)));
        s+='<line class="cursor-line" x1="'+cx+'" x2="'+cx+'" y1="'+MT+'" y2="'+(MT+ih)+'"/>';
      }
    }
    s+='</svg>';
    plot.innerHTML=s;
    var last=spec.data[act][spec.data[act].length-1];
    read.innerHTML=spec.read?spec.read(last,spec):('<b style="color:'+am.color+'">'+(spec.prefix||'')+fmtVal(last,spec.dec)+(spec.unit||'')+'</b> by '+years[years.length-1]+' · '+am.name.toLowerCase());
    /* hover: crosshair + all four values, uniform everywhere */
    var svg=plot.querySelector('svg');
    svg.addEventListener('mousemove',function(e){
      var r=svg.getBoundingClientRect();
      var fx=(e.clientX-r.left)/r.width*W;
      var idx=Math.round((fx-ML)/iw*(years.length-1));
      if(idx<0||idx>years.length-1){V3.tipHide();return}
      var rows=V3.SC_ORDER.slice().sort(function(a,b){return spec.data[b][idx]-spec.data[a][idx]})
        .map(function(sc){
          var m=V3.SC[sc];
          return '<div class="row'+(sc===V3.scenario.get()?' on':'')+'"><i style="background:'+m.color+'"></i>'+m.short+'<b>'+(spec.prefix||'')+fmtVal(spec.data[sc][idx],spec.dec)+(spec.unit||'')+'</b></div>';
        }).join('');
      V3.tipShow(e.clientX,e.clientY,'<div class="yr">'+years[idx]+'</div>'+rows);
    });
    svg.addEventListener('mouseleave',V3.tipHide);
  }
  render();
  V3.scenario.onChange(render);
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(render,150)});
  return {render:render};
};

/* stat — KPI tile. spec:{label,unit,prefix,dec,dir,years,data} → value at
   TODAY (first point) with delta to 2050 under active scenario + spark. */
V3.stat=function(container,spec){
  var el=typeof container==='string'?document.querySelector(container):container;
  el.classList.add('stat');
  function render(){
    var act=V3.scenario.get(),m=V3.SC[act];
    var d=spec.data[act],v0=d[0],v1=d[d.length-1];
    var better=spec.dir==='lower'?v1<v0:v1>v0;
    var cls=Math.abs(v1-v0)<1e-9?'flat':better?'good':'bad';
    var arrow=v1>v0?'▲':v1<v0?'▼':'—';
    var W=150,H=30;
    var lo=Math.min.apply(null,d),hi=Math.max.apply(null,d);if(lo===hi)hi=lo+1;
    var pts=d.map(function(v,i){return (W*i/(d.length-1)).toFixed(1)+','+(H-2-(H-4)*(v-lo)/(hi-lo)).toFixed(1)}).join(' ');
    el.innerHTML='<div class="lbl">'+spec.label+'</div>'
      +'<div class="val">'+(spec.prefix||'')+fmtVal(v0,spec.dec)+'<small> '+(spec.unit||'')+' today</small></div>'
      +'<div class="delta '+cls+'">'+arrow+' '+(spec.prefix||'')+fmtVal(v1,spec.dec)+(spec.unit||'')+' <span class="ctx">by 2050 · '+m.short.toLowerCase()+'</span></div>'
      +'<div class="spark"><svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'"><polyline points="'+pts+'" fill="none" stroke="'+m.color+'" stroke-width="1.6" stroke-linejoin="round"/></svg></div>';
  }
  render();V3.scenario.onChange(render);
  return {render:render};
};

/* dumbbell — before→after rows. rows:[{label,sub,today,proj:{sc:v},unit,dec,dir,min,max}] */
V3.dumbbells=function(container,rows,opts){
  var el=typeof container==='string'?document.querySelector(container):container;
  el.classList.add('db-rows');
  opts=opts||{};
  function render(){
    var act=V3.scenario.get(),m=V3.SC[act];
    el.innerHTML=rows.map(function(r){
      var proj=typeof r.proj==='object'?r.proj[act]:r.proj;
      var lo=r.min!=null?r.min:Math.min(r.today,proj),hi=r.max!=null?r.max:Math.max(r.today,proj);
      if(lo===hi)hi=lo+1;
      var P=function(v){return Math.max(0,Math.min(100,(v-lo)/(hi-lo)*100))};
      var a=P(r.today),b=P(proj);
      var better=r.dir==='lower'?proj<r.today:proj>r.today;
      var cls=Math.abs(proj-r.today)<1e-9?'flat':better?'good':'bad';
      var arrow=proj>r.today?'▲':proj<r.today?'▼':'—';
      return '<div class="db-row"><div class="lbl">'+r.label+(r.sub?'<small>'+r.sub+'</small>':'')+'</div>'
        +'<div class="db-track"><div class="rail"></div>'
        +'<div class="link" style="left:'+Math.min(a,b)+'%;width:'+Math.abs(a-b)+'%;background:'+m.color+'55"></div>'
        +'<span class="pt today" style="left:'+a+'%"></span>'
        +'<span class="pt proj" style="left:'+b+'%;background:'+m.color+'"></span>'
        +'<span class="pt-lbl" style="left:'+a+'%">'+fmtVal(r.today,r.dec)+'</span>'
        +'</div>'
        +'<div class="delta '+cls+'">'+arrow+' '+fmtVal(proj,r.dec)+(r.unit||'')+'</div></div>';
    }).join('');
    V3.stagger(el.querySelectorAll('.db-row .delta'),30);
  }
  render();V3.scenario.onChange(render);
  return {render:render};
};

/* meter — ratio vs cap, one hue. */
V3.meter=function(el,pct,valueText,color){
  el.classList.add('meter');
  el.innerHTML='<div class="m-track"><div class="m-fill" style="width:0%;'+(color?'background:'+color:'')+'"></div></div>'
    +'<div class="m-val">'+valueText+'</div>';
  requestAnimationFrame(function(){el.querySelector('.m-fill').style.width=Math.max(0,Math.min(100,pct))+'%'});
};

/* ════════ System dashboard template ════════
   One layout for all six system pages — the design system in one
   function. cfg:{sys, tagline, lead, today, proj:{sc:n},
   metrics:VIZ_METRICS[sys], narratives:{sc:str}|null, crossKey} */
V3.systemPage=function(cfg){
  var sys=V3.SYS[cfg.sys];
  var years=[];for(var y=2026;y<=2050;y++)years.push(y);
  var app=document.getElementById('app');
  var h='';
  h+='<header class="page-hero"><div class="col">'
    +'<span class="eyebrow">System · '+sys.label+'</span>'
    +'<h1 class="title-1">'+cfg.tagline+'</h1>'
    +'<p class="lead">'+cfg.lead+'</p>'
    +'<div class="hero-stats">'
    +'<div class="hero-score"><div class="big">'+cfg.today+'</div>'
    +'<div class="sub"><span class="grade-chip" style="color:var(--accent)">'+V3.grade(cfg.today)+'</span><span class="body-2">out of 100 today</span></div></div>'
    +'<div class="hero-arrow">→</div>'
    +'<div class="hero-proj"><div class="big" id="sys-proj">'+cfg.proj[V3.scenario.get()]+'</div>'
    +'<div class="sub"><span class="grade-chip" id="sys-proj-grade">'+V3.grade(cfg.proj[V3.scenario.get()])+'</span>'
    +'<span class="body-2" id="sys-proj-ctx"></span></div></div>'
    +'</div></div></header>';
  h+='<main>';
  h+='<section class="section"><div class="col">'
    +'<div class="section-head"><div><h2 class="title-2">Where it stands, where it goes</h2>'
    +'<p class="lead">Each metric today and in 2050 under the chosen future.</p></div></div>'
    +'<div id="sys-kpis" class="kpis"></div>'
    +'<div id="sys-dumbbells" style="margin-top:12px"></div>'
    +'</div></section>';
  h+='<section class="section"><div class="col">'
    +'<div class="section-head"><div><h2 class="title-2">The projections</h2>'
    +'<p class="lead">All four futures on every chart; the bold line is your chosen scenario. Hover any year for the full comparison.</p></div></div>'
    +'<div id="sys-charts" class="chart-grid'+(cfg.metrics.length===1?' one':'')+'"></div>'
    +'</div></section>';
  if(cfg.narratives){
    h+='<section class="section"><div class="col">'
      +'<div class="section-head"><div><h2 class="title-2">What that world feels like</h2></div></div>'
      +'<div class="narrative"><div class="who" id="sys-nar-who"></div><p id="sys-nar"></p></div>'
      +'</div></section>';
  }
  if(cfg.crossKey&&window.CROSS_SYSTEM&&CROSS_SYSTEM[cfg.crossKey]){
    h+='<section class="section"><div class="col">'
      +'<div class="section-head"><div><h2 class="title-2">How '+sys.label.toLowerCase()+' moves the other systems</h2>'
      +'<p class="lead">Feedback weights under the chosen future — the coupling that makes six systems one score.</p></div></div>'
      +'<div id="sys-impacts" class="impacts"></div>'
      +'</div></section>';
  }
  h+='</main>';
  app.innerHTML=h;

  /* KPI tiles + trajectory charts from the same metric specs */
  var kpiWrap=document.getElementById('sys-kpis');
  var chartWrap=document.getElementById('sys-charts');
  cfg.metrics.forEach(function(mspec){
    var spec={label:mspec.label,unit:mspec.unit,prefix:mspec.prefix,dir:mspec.dir,years:years,data:mspec.data,
      dec:(function(){var v=mspec.data.bau[0];return v!==Math.round(v)||Math.abs(v)<10?( Math.abs(v)<3?2:1):0})()};
    var tile=document.createElement('div');kpiWrap.appendChild(tile);
    V3.stat(tile,spec);
    var card=document.createElement('div');card.className='chart-card';chartWrap.appendChild(card);
    V3.traj(card,spec);
  });
  /* dumbbells */
  var dbRows=cfg.metrics.map(function(mspec){
    var proj={};V3.SC_ORDER.forEach(function(sc){proj[sc]=mspec.data[sc][mspec.data[sc].length-1]});
    var all=[];V3.SC_ORDER.forEach(function(sc){all=all.concat(mspec.data[sc])});
    return {label:mspec.label,sub:mspec.unit||'',today:mspec.data.bau[0],proj:proj,
      unit:mspec.unit,dir:mspec.dir,min:Math.min.apply(null,all),max:Math.max.apply(null,all),
      dec:(function(){var v=mspec.data.bau[0];return v!==Math.round(v)||Math.abs(v)<10?(Math.abs(v)<3?2:1):0})()};
  });
  V3.dumbbells('#sys-dumbbells',dbRows);
  /* scenario-reactive hero + narrative + impacts */
  var lastProj=cfg.proj[V3.scenario.get()];
  function paint(){
    var act=V3.scenario.get(),m=V3.SC[act];
    var el=document.getElementById('sys-proj');
    el.style.color=m.color;
    V3.tween(el,cfg.proj[act],{from:lastProj});lastProj=cfg.proj[act];
    var g=document.getElementById('sys-proj-grade');
    g.textContent=V3.grade(cfg.proj[act]);g.style.color=m.color;
    document.getElementById('sys-proj-ctx').textContent='in 2050 · '+m.name.toLowerCase();
    if(cfg.narratives){
      document.getElementById('sys-nar-who').textContent=m.name+' · 2050';
      document.getElementById('sys-nar').textContent=cfg.narratives[act];
    }
    if(cfg.crossKey&&window.CROSS_SYSTEM&&CROSS_SYSTEM[cfg.crossKey]){
      var rows=CROSS_SYSTEM[cfg.crossKey].impacts.map(function(imp){
        var e=imp[act];var w=Math.round(e.weight*100);
        var cls=w>1?'good':w<-1?'bad':'flat';
        var t=V3.SYS[imp.target]||{label:imp.label,color:'var(--ink-4)'};
        return '<div class="impact-row"><span class="w '+cls+'">'+(w>0?'+':'')+w+'%</span>'
          +'<span class="t"><i style="background:'+t.color+'"></i>'+imp.label+'</span>'
          +'<span class="e">'+e.effect+'</span></div>';
      }).join('');
      document.getElementById('sys-impacts').innerHTML=rows;
      V3.stagger(document.querySelectorAll('.impact-row'),22);
    }
  }
  paint();
  V3.scenario.onChange(paint);
};

/* slope — FROM→TO two-state comparison (pathways). spec:{label,unit,dec,
   from:{name,color,v}, to:{name,color,v}} */
V3.slope=function(card,spec){
  var W=240,H=150,ML=54,MR=54,MT=14,MB=20;
  var lo=Math.min(spec.from.v,spec.to.v),hi=Math.max(spec.from.v,spec.to.v);
  var pad=(hi-lo)*.25||1;lo-=pad;hi+=pad;
  var Y=function(v){return MT+(H-MT-MB)*(1-(v-lo)/(hi-lo))};
  var y1=Y(spec.from.v),y2=Y(spec.to.v);
  card.innerHTML='<div class="c-title">'+spec.label+'</div><div class="c-unit">'+(spec.unit||'')+'</div>'
    +'<div class="v3-plot"><svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">'
    +'<line class="grid" x1="'+ML+'" x2="'+ML+'" y1="'+MT+'" y2="'+(H-MB)+'"/>'
    +'<line class="grid" x1="'+(W-MR)+'" x2="'+(W-MR)+'" y1="'+MT+'" y2="'+(H-MB)+'"/>'
    +'<line x1="'+ML+'" x2="'+(W-MR)+'" y1="'+y1+'" y2="'+y2+'" stroke="'+spec.to.color+'" stroke-width="2"/>'
    +'<circle cx="'+ML+'" cy="'+y1+'" r="3.4" fill="'+spec.from.color+'"/>'
    +'<circle cx="'+(W-MR)+'" cy="'+y2+'" r="3.4" fill="'+spec.to.color+'"/>'
    +'<text class="endlbl" x="'+(ML-8)+'" y="'+(y1+3.5)+'" text-anchor="end" fill="'+spec.from.color+'">'+fmtVal(spec.from.v,spec.dec)+'</text>'
    +'<text class="endlbl" x="'+(W-MR+8)+'" y="'+(y2+3.5)+'" fill="'+spec.to.color+'">'+fmtVal(spec.to.v,spec.dec)+'</text>'
    +'<text class="axis" x="'+ML+'" y="'+(H-4)+'" text-anchor="middle">now·'+spec.from.name+'</text>'
    +'<text class="axis" x="'+(W-MR)+'" y="'+(H-4)+'" text-anchor="middle">2050·'+spec.to.name+'</text>'
    +'</svg></div>';
};

})();
