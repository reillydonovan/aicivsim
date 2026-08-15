/* ════════════════════════════════════════════════════════════════
   AICIVSIM — DESIGN V3 runtime (experiment branch: design-v3)
   Loads AFTER js/shared.js (data: VIZ_METRICS, SIM_ENGINE,
   STRATEGY_CATALOG, CROSS_SYSTEM, grade, simWorldState…).

   • V3.scenario — sitewide store. DEFAULT IS ALWAYS BAU; a user
     selection persists across pages ('aicivsim-scenario' + hash).
   • Motion: spring engine (motion.dev-inspired, zero-dep). Charts
     update IN PLACE — the active trajectory MORPHS between futures,
     indicators glide, numbers count. Entrances rise on scroll with
     a fast, early-triggered reveal. prefers-reduced-motion collapses
     all of it to instant state changes.
   • Chart kit — "one geometry, six forms": stat, traj (morphing
     emphasis), landing (today tick + all four futures on one track),
     meter, bars, slope. No per-chart legends — the scenario control
     is the legend. One uniform crosshair tooltip.
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var V3=window.V3={};

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
  return 'bau';
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

/* ════════ Motion ════════ */
var REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
V3.REDUCED=REDUCED;
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
var SPRING=springEasing(170,20);
document.documentElement.style.setProperty('--spring',SPRING.css);
document.documentElement.style.setProperty('--spring-dur',(REDUCED?0.01:SPRING.duration).toFixed(2)+'s');
function easeOut(k){return 1-Math.pow(1-k,3)}

V3.tween=function(el,to,opts){
  opts=opts||{};
  var from=opts.from!=null?opts.from:parseFloat(String(el.textContent).replace(/[^\d.+-]/g,''))||0;
  var dec=opts.dec||0,fmt=opts.fmt||function(v){return v.toFixed(dec)};
  if(REDUCED||from===to){el.textContent=fmt(to);return}
  var x=from,v=0,k=opts.stiffness||170,d=opts.damping||26,last=performance.now();
  function step(now){
    var dt=Math.min(.064,(now-last)/1000);last=now;
    var F=-k*(x-to)-d*v;v+=F*dt;x+=v*dt;
    if(Math.abs(x-to)<.002*Math.max(1,Math.abs(to))&&Math.abs(v)<.01){el.textContent=fmt(to);return}
    el.textContent=fmt(x);requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};
V3.stagger=function(nodes,perDelay){
  if(REDUCED)return;
  perDelay=perDelay==null?26:perDelay;
  Array.prototype.forEach.call(nodes,function(n,i){
    n.style.transition='none';n.style.opacity='.5';n.style.transform='translateY(4px)';
    setTimeout(function(){
      n.style.transition='opacity .3s ease,transform .5s '+SPRING.css;
      n.style.opacity='';n.style.transform='';
    },i*perDelay);
  });
};
/* Entrance reveal: fast, triggered slightly BEFORE entering, one-shot.
   Only elements captured at call time; later re-renders never re-hide. */
V3.reveal=function(){
  if(REDUCED)return;
  var sel='.section-head,.stat,.chart-card,.t-card,.q-card,.impact-row,.spine-item,.land-row,.ledger-row,.lever,.action-card,.slope-card,.diff-row,.hero-stats,.narrative,.lever-delta';
  var els=document.querySelectorAll(sel);
  var io=new IntersectionObserver(function(ents){
    ents.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
    });
  },{rootMargin:'0px 0px -4% 0px',threshold:.01});
  els.forEach(function(el){
    if(el.classList.contains('pre'))return;
    el.classList.add('pre');
    var idx=Array.prototype.indexOf.call(el.parentNode.children,el);
    el.style.setProperty('--rv-delay',Math.min(280,idx*55)+'ms');
    io.observe(el);
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
  return '<div class="proto-note">Design v3 prototype — an experiment on the <b>design-v3</b> branch. Read the <a href="design-v3.html">audit &amp; proposal</a> · <a href="'+location.pathname.split('/').pop().replace('-v3','')+'" style="opacity:.85">current design</a></div>';
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
V3.boot=function(opts){
  opts=opts||{};
  var here=location.pathname.split('/').pop()||'index-v3.html';
  document.body.insertAdjacentHTML('afterbegin',
    V3.protoNote()+V3.nav(here)+(opts.deck?V3.deck(opts.deck.sys,opts.deck.context):''));
  document.body.insertAdjacentHTML('beforeend',V3.footer());
  try{if(localStorage.getItem('aicivsim-theme')==='light')document.body.classList.add('light')}catch(e){}
  document.getElementById('v3-theme').addEventListener('click',function(){
    var light=document.body.classList.toggle('light');
    try{localStorage.setItem('aicivsim-theme',light?'light':'dark')}catch(e){}
  });
  document.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.sc-seg button'):null;
    if(b)V3.scenario.set(b.getAttribute('data-sc'));
  });
  /* keep the ⌘K palette inside the demo: remap its page links to the
     v3 equivalents (CMD_ITEMS is shared by reference with shared.js) */
  if(window.CMD_ITEMS){
    var remap={'index.html':1,'ai.html':1,'civilization.html':1,'simulation.html':1,'visualizer.html':1,'climate.html':1,'transition.html':1,'governance.html':1,'strategy.html':1,'pathways.html':1,'timeline.html':1,'data.html':1,'research.html':1,'about.html':1};
    CMD_ITEMS.forEach(function(it){
      if(it.h&&remap[it.h])it.h=it.h.replace('.html','-v3.html');
    });
  }
  /* reveal after the page's synchronous scripts have rendered content */
  requestAnimationFrame(function(){requestAnimationFrame(V3.reveal)});
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
var NS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs){
  var el=document.createElementNS(NS,tag);
  for(var k in attrs)el.setAttribute(k,attrs[k]);
  return el;
}
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
function autoDec(v){return v!==Math.round(v)||Math.abs(v)<10?(Math.abs(v)<3?2:1):0}

/* ── traj — morphing emphasis trajectory ──
   The active future is a bold line with an end dot and value; the
   other three are ghost context with name labels. Switching futures
   MORPHS the bold line from the old shape to the new one (450ms
   ease-out on every point), retints the area fill, counts the end
   value, and slides the labels. First reveal draws the line in. */
V3.traj=function(container,spec){
  var card=typeof container==='string'?document.querySelector(container):container;
  var head=document.createElement('div');head.className='c-head';
  head.innerHTML='<span class="c-title">'+spec.label+'</span><span class="c-unit">'+(spec.unit||'')+'</span>';
  var read=document.createElement('div');read.className='c-read';
  var plot=document.createElement('div');plot.className='v3-plot';
  card.appendChild(head);card.appendChild(read);card.appendChild(plot);
  var years=spec.years,n=years.length;
  var lo=Infinity,hi=-Infinity;
  V3.SC_ORDER.forEach(function(sc){spec.data[sc].forEach(function(v){if(v<lo)lo=v;if(v>hi)hi=v})});
  var pad=(hi-lo)*.07;lo-=pad;hi+=pad;
  var W,H=216,ML=8,MR=76,MT=10,MB=22,iw,ih;
  function X(i){return ML+iw*(i/(n-1))}
  function Y(v){return MT+ih*(1-(v-lo)/(hi-lo))}
  var svg,gGhost={},pActive,pArea,dot,cursor,labels={},disp=null,raf=null,drawn=false,curYear=null;

  function lineD(arr){var d='M';for(var i=0;i<n;i++){d+=(i?'L':'')+X(i).toFixed(1)+','+Y(arr[i]).toFixed(1)}return d}
  function areaD(arr){return lineD(arr)+'L'+X(n-1).toFixed(1)+','+(MT+ih)+'L'+ML+','+(MT+ih)+'Z'}

  function build(){
    W=Math.max(280,plot.clientWidth||card.clientWidth-40);
    iw=W-ML-MR;ih=H-MT-MB;
    plot.innerHTML='';
    svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H});
    plot.appendChild(svg);
    niceTicks(lo,hi,3).forEach(function(t){
      var y=Y(t);if(y<MT-1||y>MT+ih+1)return;
      svg.appendChild(svgEl('line',{class:'grid',x1:ML,x2:W-MR+8,y1:y,y2:y}));
      var tx=svgEl('text',{class:'axis',x:W-MR+12,y:y+3.5});tx.textContent=fmtVal(t,spec.dec);svg.appendChild(tx);
    });
    var x0=svgEl('text',{class:'axis',x:ML,y:H-6});x0.textContent=years[0];svg.appendChild(x0);
    var x1=svgEl('text',{class:'axis',x:ML+iw,y:H-6,'text-anchor':'end'});x1.textContent=years[n-1];svg.appendChild(x1);
    pArea=svgEl('path',{class:'tj-area','fill-opacity':0});svg.appendChild(pArea);
    V3.SC_ORDER.forEach(function(sc){
      var p=svgEl('path',{class:'tj-ghost',fill:'none',stroke:V3.SC[sc].color,'stroke-width':1.25,'stroke-linejoin':'round','stroke-linecap':'round'});
      p.setAttribute('d',lineD(spec.data[sc]));
      gGhost[sc]=p;svg.appendChild(p);
    });
    pActive=svgEl('path',{class:'tj-line',fill:'none','stroke-width':2.2,'stroke-linejoin':'round','stroke-linecap':'round'});
    svg.appendChild(pActive);
    dot=svgEl('circle',{r:3.6});svg.appendChild(dot);
    cursor=svgEl('line',{class:'cursor-line',y1:MT,y2:MT+ih,x1:-10,x2:-10});svg.appendChild(cursor);
    V3.SC_ORDER.forEach(function(sc){
      var t=svgEl('text',{class:'endlbl',x:W-MR+12});labels[sc]=t;svg.appendChild(t);
    });
    svg.addEventListener('mousemove',onHover);
    svg.addEventListener('mouseleave',V3.tipHide);
    if(disp==null)disp=spec.data[V3.scenario.get()].slice();
    setActive(V3.scenario.get(),false);
    if(curYear!=null)setCursor(curYear);
    if(!drawn&&!REDUCED){
      drawn=true;
      var len=pActive.getTotalLength();
      pActive.style.strokeDasharray=len;
      pActive.style.strokeDashoffset=len;
      pActive.getBoundingClientRect();
      pActive.style.transition='stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)';
      pActive.style.strokeDashoffset='0';
      setTimeout(function(){pActive.style.strokeDasharray='';pActive.style.transition=''},950);
    }
  }
  function paintDisp(){
    pActive.setAttribute('d',lineD(disp));
    pArea.setAttribute('d',areaD(disp));
    dot.setAttribute('cx',X(n-1));dot.setAttribute('cy',Y(disp[n-1]));
    labels[V3.scenario.get()].setAttribute('y',Math.max(MT+8,Math.min(MT+ih,Y(disp[n-1])))+3.5);
    labels[V3.scenario.get()].textContent=(spec.prefix||'')+fmtVal(disp[n-1],spec.dec);
  }
  function layoutLabels(act){
    var pos=V3.SC_ORDER.map(function(sc){
      return {sc:sc,on:sc===act,y:Y(spec.data[sc][n-1])};
    }).sort(function(a,b){return a.y-b.y});
    for(var i=1;i<pos.length;i++)if(pos[i].y-pos[i-1].y<13)pos[i].y=pos[i-1].y+13;
    pos.forEach(function(l){
      var t=labels[l.sc];
      t.setAttribute('fill',V3.SC[l.sc].color);
      t.setAttribute('class','endlbl'+(l.on?'':' ghosted'));
      if(!l.on){
        t.setAttribute('y',Math.max(MT+8,Math.min(MT+ih,l.y))+3.5);
        t.textContent=V3.SC[l.sc].short.toLowerCase();
      }
    });
  }
  function setActive(sc,animate){
    var m=V3.SC[sc],target=spec.data[sc];
    pActive.setAttribute('stroke',m.color);
    dot.setAttribute('fill',m.color);
    pArea.setAttribute('fill',m.color);
    pArea.setAttribute('fill-opacity',REDUCED?.07:.075);
    V3.SC_ORDER.forEach(function(g){gGhost[g].style.opacity=g===sc?0:''});
    layoutLabels(sc);
    var last=target[n-1];
    read.innerHTML=spec.read?spec.read(last,spec):('<b style="color:'+m.color+'">'+(spec.prefix||'')+fmtVal(last,spec.dec)+(spec.unit||'')+'</b> by '+years[n-1]+' · '+m.name.toLowerCase());
    if(raf)cancelAnimationFrame(raf);
    if(!animate||REDUCED){disp=target.slice();paintDisp();return}
    var from=disp.slice(),t0=performance.now(),D=460;
    function step(t){
      var k=easeOut(Math.min(1,(t-t0)/D));
      for(var i=0;i<n;i++)disp[i]=from[i]+(target[i]-from[i])*k;
      paintDisp();
      if(k<1)raf=requestAnimationFrame(step);
    }
    raf=requestAnimationFrame(step);
  }
  function onHover(e){
    var r=svg.getBoundingClientRect();
    var fx=(e.clientX-r.left)/r.width*W;
    var idx=Math.round((fx-ML)/iw*(n-1));
    if(idx<0||idx>n-1){V3.tipHide();return}
    var act=V3.scenario.get();
    var rows=V3.SC_ORDER.slice().sort(function(a,b){return spec.data[b][idx]-spec.data[a][idx]})
      .map(function(sc){
        var m=V3.SC[sc];
        return '<div class="row'+(sc===act?' on':'')+'"><i style="background:'+m.color+'"></i>'+m.short+'<b>'+(spec.prefix||'')+fmtVal(spec.data[sc][idx],spec.dec)+(spec.unit||'')+'</b></div>';
      }).join('');
    V3.tipShow(e.clientX,e.clientY,'<div class="yr">'+years[idx]+'</div>'+rows);
  }
  function setCursor(year){
    curYear=year;
    if(!svg)return;
    var i=(year-years[0])/(years[n-1]-years[0])*(n-1);
    var cx=X(Math.max(0,Math.min(n-1,i)));
    cursor.setAttribute('x1',cx);cursor.setAttribute('x2',cx);
  }
  build();
  V3.scenario.onChange(function(sc){setActive(sc,true)});
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150)});
  return {setCursor:setCursor,rebuild:build};
};

/* ── stat — KPI tile: today's value, the 2050 delta, a filled spark ── */
V3.stat=function(container,spec){
  var el=typeof container==='string'?document.querySelector(container):container;
  el.classList.add('stat');
  var m0=V3.SC[V3.scenario.get()];
  var d0=spec.data[V3.scenario.get()];
  el.innerHTML='<div class="lbl">'+spec.label+'</div>'
    +'<div class="val">'+(spec.prefix||'')+fmtVal(d0[0],spec.dec)+'<small> '+(spec.unit||'')+' today</small></div>'
    +'<div class="delta"><span class="d-arrow"></span> <span class="d-val num"></span><span class="d-unit"></span> <span class="ctx"></span></div>'
    +'<div class="spark"></div>';
  var dArrow=el.querySelector('.d-arrow'),dVal=el.querySelector('.d-val'),dUnit=el.querySelector('.d-unit'),dCtx=el.querySelector('.ctx'),dRow=el.querySelector('.delta'),spark=el.querySelector('.spark');
  var lastEnd=null;
  function render(animate){
    var act=V3.scenario.get(),m=V3.SC[act];
    var d=spec.data[act],v0=d[0],v1=d[d.length-1];
    var better=spec.dir==='lower'?v1<v0:v1>v0;
    dRow.className='delta '+(Math.abs(v1-v0)<1e-9?'flat':better?'good':'bad');
    dArrow.textContent=v1>v0?'▲':v1<v0?'▼':'—';
    dUnit.textContent=spec.unit||'';
    dCtx.textContent='by 2050 · '+m.short.toLowerCase();
    if(animate&&lastEnd!=null)V3.tween(dVal,v1,{from:lastEnd,dec:spec.dec!=null?spec.dec:autoDec(v1),fmt:function(v){return (spec.prefix||'')+fmtVal(v,spec.dec)}});
    else dVal.textContent=(spec.prefix||'')+fmtVal(v1,spec.dec);
    lastEnd=v1;
    var Wp=160,Hp=34;
    var lo=Math.min.apply(null,d),hi=Math.max.apply(null,d);if(lo===hi)hi=lo+1;
    var pts=d.map(function(v,i){return [(Wp*i/(d.length-1)),(Hp-3-(Hp-7)*(v-lo)/(hi-lo))]});
    var line=pts.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)}).join('');
    spark.innerHTML='<svg viewBox="0 0 '+Wp+' '+Hp+'" width="'+Wp+'" height="'+Hp+'">'
      +'<path d="'+line+'L'+Wp+','+Hp+'L0,'+Hp+'Z" fill="'+m.color+'" fill-opacity=".1"/>'
      +'<path d="'+line+'" fill="none" stroke="'+m.color+'" stroke-width="1.6" stroke-linejoin="round"/>'
      +'<circle cx="'+pts[pts.length-1][0]+'" cy="'+pts[pts.length-1][1]+'" r="2.6" fill="'+m.color+'"/></svg>';
    if(animate&&!REDUCED){
      spark.style.opacity='.25';
      spark.style.transition='none';
      requestAnimationFrame(function(){spark.style.transition='opacity .45s ease';spark.style.opacity=''});
    }
  }
  render(false);
  V3.scenario.onChange(function(){render(true)});
  return {render:render};
};

/* ── landing — where each future lands ──
   One track per metric: a "today" tick plus a dot for ALL FOUR
   futures at 2050. The chosen future gets the ring and the value
   bubble, which GLIDES between dots on switch. Hover any dot for
   its future's name and value. Replaces the old dumbbell rows,
   which duplicated the KPI tiles and hid the cross-future story. */
V3.landing=function(container,rows){
  var el=typeof container==='string'?document.querySelector(container):container;
  el.classList.add('land-rows');
  el.innerHTML=rows.map(function(r,ri){
    var lo=r.min,hi=r.max;if(lo===hi)hi=lo+1;
    var P=function(v){return Math.max(0,Math.min(100,(v-lo)/(hi-lo)*100))};
    var dots=V3.SC_ORDER.map(function(sc){
      return '<span class="land-dot" data-sc="'+sc+'" data-row="'+ri+'" style="left:'+P(r.proj[sc])+'%;--sc:'+V3.SC[sc].color+'"></span>';
    }).join('');
    return '<div class="land-row">'
      +'<div class="lbl">'+r.label+(r.sub?'<small>'+r.sub+'</small>':'')+'</div>'
      +'<div class="land-track">'
      +'<div class="rail"></div>'
      +'<span class="land-today" style="left:'+P(r.today)+'%"><i></i><em>today '+fmtVal(r.today,r.dec)+'</em></span>'
      +dots
      +'<span class="land-bubble num" data-row="'+ri+'"></span>'
      +'</div>'
      +'<div class="delta num" data-row="'+ri+'"></div>'
      +'</div>';
  }).join('');
  var lastVals=rows.map(function(){return null});
  function update(animate){
    var act=V3.scenario.get(),m=V3.SC[act];
    rows.forEach(function(r,ri){
      var lo=r.min,hi=r.max;if(lo===hi)hi=lo+1;
      var P=function(v){return Math.max(0,Math.min(100,(v-lo)/(hi-lo)*100))};
      var v=r.proj[act];
      el.querySelectorAll('.land-dot[data-row="'+ri+'"]').forEach(function(d){
        d.setAttribute('data-active',String(d.getAttribute('data-sc')===act));
      });
      var bub=el.querySelector('.land-bubble[data-row="'+ri+'"]');
      bub.style.left=P(v)+'%';
      bub.style.color=m.color;
      var dec=r.dec!=null?r.dec:autoDec(v);
      if(animate&&lastVals[ri]!=null)V3.tween(bub,v,{from:lastVals[ri],fmt:function(x){return fmtVal(x,dec)}});
      else bub.textContent=fmtVal(v,dec);
      lastVals[ri]=v;
      var delta=el.querySelector('.delta[data-row="'+ri+'"]');
      var diff=v-r.today;
      var better=r.dir==='lower'?diff<0:diff>0;
      delta.className='delta num '+(Math.abs(diff)<1e-9?'flat':better?'good':'bad');
      delta.textContent=(diff>0?'▲ +':diff<0?'▼ ':'— ')+fmtVal(Math.abs(diff),dec)+(r.unit||'');
    });
  }
  el.addEventListener('mousemove',function(e){
    var d=e.target.closest?e.target.closest('.land-dot'):null;
    if(!d){return}
    var sc=d.getAttribute('data-sc'),ri=+d.getAttribute('data-row');
    var r=rows[ri],m=V3.SC[sc];
    V3.tipShow(e.clientX,e.clientY,'<div class="yr">'+r.label+' · 2050</div>'
      +'<div class="row on"><i style="background:'+m.color+'"></i>'+m.short+'<b>'+fmtVal(r.proj[sc],r.dec!=null?r.dec:autoDec(r.proj[sc]))+(r.unit||'')+'</b></div>');
  });
  el.addEventListener('mouseleave',V3.tipHide);
  update(false);
  V3.scenario.onChange(function(){update(true)});
  return {update:update};
};

/* ── meter — ratio vs cap, one hue, fills on first sight ── */
V3.meter=function(el,pct,valueText,color){
  el.classList.add('meter');
  el.innerHTML='<div class="m-track"><div class="m-fill" style="width:0%;'+(color?'background:'+color:'')+'"></div></div>'
    +'<div class="m-val">'+valueText+'</div>';
  var fill=el.querySelector('.m-fill');
  var target=Math.max(0,Math.min(100,pct));
  if(REDUCED){fill.style.width=target+'%';return}
  var io=new IntersectionObserver(function(ents){
    ents.forEach(function(e){
      if(e.isIntersecting){requestAnimationFrame(function(){fill.style.width=target+'%'});io.disconnect()}
    });
  },{threshold:.4});
  io.observe(el);
};

/* ── slope — the same metric in 2050, origin vs destination ── */
V3.slope=function(card,spec){
  var W=250,H=158,ML=64,MR=64,MT=16,MB=24;
  var lo=Math.min(spec.from.v,spec.to.v),hi=Math.max(spec.from.v,spec.to.v);
  var pad=(hi-lo)*.25||1;lo-=pad;hi+=pad;
  var Y=function(v){return MT+(H-MT-MB)*(1-(v-lo)/(hi-lo))};
  var y1=Y(spec.from.v),y2=Y(spec.to.v);
  var diff=spec.to.v-spec.from.v;
  var better=spec.dir==='lower'?diff<0:spec.dir==='higher'?diff>0:null;
  var cls=better==null?'flat':Math.abs(diff)<1e-9?'flat':better?'good':'bad';
  card.innerHTML='<div class="c-head"><span class="c-title">'+spec.label+'</span>'
    +'<span class="delta num '+cls+'" style="font-size:11.5px;font-weight:600">'+(diff>0?'▲ +':diff<0?'▼ ':'— ')+fmtVal(Math.abs(diff),spec.dec)+(spec.unit||'')+'</span></div>'
    +'<div class="c-unit" style="margin-bottom:6px">'+(spec.unit||'in 2050')+' · both values are 2050</div>'
    +'<div class="v3-plot"><svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">'
    +'<line class="grid" x1="'+ML+'" x2="'+ML+'" y1="'+MT+'" y2="'+(H-MB)+'"/>'
    +'<line class="grid" x1="'+(W-MR)+'" x2="'+(W-MR)+'" y1="'+MT+'" y2="'+(H-MB)+'"/>'
    +'<line class="slope-line" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+y1+'" y2="'+y2+'" stroke="'+spec.to.color+'" stroke-width="2"/>'
    +'<circle cx="'+ML+'" cy="'+y1+'" r="3.6" fill="'+spec.from.color+'"/>'
    +'<circle cx="'+(W-MR)+'" cy="'+y2+'" r="3.6" fill="'+spec.to.color+'"/>'
    +'<text class="endlbl" x="'+(ML-9)+'" y="'+(y1+3.5)+'" text-anchor="end" fill="'+spec.from.color+'">'+fmtVal(spec.from.v,spec.dec)+'</text>'
    +'<text class="endlbl" x="'+(W-MR+9)+'" y="'+(y2+3.5)+'" fill="'+spec.to.color+'">'+fmtVal(spec.to.v,spec.dec)+'</text>'
    +'<text class="axis" x="'+ML+'" y="'+(H-6)+'" text-anchor="middle">'+spec.from.name+'</text>'
    +'<text class="axis" x="'+(W-MR)+'" y="'+(H-6)+'" text-anchor="middle">'+spec.to.name+'</text>'
    +'</svg></div>';
};

/* ════════ System dashboard template ════════ */
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
    +'<div class="hero-score"><div class="big" id="sys-today">'+cfg.today+'</div>'
    +'<div class="sub"><span class="grade-chip" style="color:var(--accent)">'+V3.grade(cfg.today)+'</span><span class="body-2">out of 100 today</span></div></div>'
    +'<div class="hero-arrow">→</div>'
    +'<div class="hero-proj"><div class="big" id="sys-proj">'+cfg.proj[V3.scenario.get()]+'</div>'
    +'<div class="sub"><span class="grade-chip" id="sys-proj-grade">'+V3.grade(cfg.proj[V3.scenario.get()])+'</span>'
    +'<span class="body-2" id="sys-proj-ctx"></span></div></div>'
    +'</div></div></header>';
  h+='<main>';
  h+='<section class="section"><div class="col">'
    +'<div class="section-head"><div><h2 class="title-2">Where each future lands</h2>'
    +'<p class="lead">Each metric today — and where all four futures put it by 2050. The ringed dot is your chosen scenario; hover any dot to identify its future.</p></div></div>'
    +'<div id="sys-kpis" class="kpis"></div>'
    +'<div id="sys-landing" style="margin-top:12px"></div>'
    +'</div></section>';
  h+='<section class="section"><div class="col">'
    +'<div class="section-head"><div><h2 class="title-2">The projections</h2>'
    +'<p class="lead">All four futures on every chart; the bold line is your chosen scenario — switch futures and watch it morph. Hover any year for the full comparison.</p></div></div>'
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

  var kpiWrap=document.getElementById('sys-kpis');
  var chartWrap=document.getElementById('sys-charts');
  cfg.metrics.forEach(function(mspec){
    var spec={label:mspec.label,unit:mspec.unit,prefix:mspec.prefix,dir:mspec.dir,years:years,data:mspec.data,dec:autoDec(mspec.data.bau[0])};
    var tile=document.createElement('div');kpiWrap.appendChild(tile);
    V3.stat(tile,spec);
    var card=document.createElement('div');card.className='chart-card';chartWrap.appendChild(card);
    V3.traj(card,spec);
  });
  var dbRows=cfg.metrics.map(function(mspec){
    var proj={};V3.SC_ORDER.forEach(function(sc){proj[sc]=mspec.data[sc][mspec.data[sc].length-1]});
    var all=[mspec.data.bau[0]];V3.SC_ORDER.forEach(function(sc){all.push(proj[sc])});
    var lo=Math.min.apply(null,all),hi=Math.max.apply(null,all),pad=(hi-lo)*.09||1;
    return {label:mspec.label,sub:mspec.unit||'',today:mspec.data.bau[0],proj:proj,
      unit:mspec.unit,dir:mspec.dir,min:lo-pad,max:hi+pad,dec:autoDec(mspec.data.bau[0])};
  });
  V3.landing('#sys-landing',dbRows);

  var lastProj=cfg.proj[V3.scenario.get()];
  var impactsBuilt=false;
  function paint(animate){
    var act=V3.scenario.get(),m=V3.SC[act];
    var el=document.getElementById('sys-proj');
    el.style.color=m.color;
    if(animate)V3.tween(el,cfg.proj[act],{from:lastProj});
    else el.textContent=cfg.proj[act];
    lastProj=cfg.proj[act];
    var g=document.getElementById('sys-proj-grade');
    g.textContent=V3.grade(cfg.proj[act]);g.style.color=m.color;
    document.getElementById('sys-proj-ctx').textContent='in 2050 · '+m.name.toLowerCase();
    if(cfg.narratives){
      document.getElementById('sys-nar-who').textContent=m.name+' · 2050';
      document.getElementById('sys-nar').textContent=cfg.narratives[act];
    }
    if(cfg.crossKey&&window.CROSS_SYSTEM&&CROSS_SYSTEM[cfg.crossKey]){
      var wrap=document.getElementById('sys-impacts');
      if(!impactsBuilt){
        wrap.innerHTML=CROSS_SYSTEM[cfg.crossKey].impacts.map(function(imp,i){
          var t=V3.SYS[imp.target]||{label:imp.label,color:'var(--ink-4)'};
          return '<div class="impact-row" data-i="'+i+'"><span class="w num"></span>'
            +'<span class="t"><i style="background:'+t.color+'"></i>'+imp.label+'</span>'
            +'<span class="e"></span></div>';
        }).join('');
        impactsBuilt=true;
      }
      CROSS_SYSTEM[cfg.crossKey].impacts.forEach(function(imp,i){
        var row=wrap.querySelector('.impact-row[data-i="'+i+'"]');
        var e=imp[act];var w=Math.round(e.weight*100);
        var wEl=row.querySelector('.w');
        wEl.className='w num '+(w>1?'good':w<-1?'bad':'flat');
        wEl.textContent=(w>0?'+':'')+w+'%';
        row.querySelector('.e').textContent=e.effect;
      });
      if(animate)V3.stagger(wrap.querySelectorAll('.impact-row .w'),24);
    }
  }
  paint(false);
  V3.scenario.onChange(function(){paint(true)});
};

})();
