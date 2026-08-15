/* ════════════════════════════════════════════════════════════════
   AICIVSIM — v3 runtime (the shipped design system)
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
  ai:{label:'AI',color:'#e8a838',href:'ai.html'},
  climate:{label:'Climate',color:'#4ecdc4',href:'climate.html'},
  governance:{label:'Governance',color:'#9b87f5',href:'governance.html'},
  transition:{label:'Transition',color:'#5da5da',href:'transition.html'},
  civilization:{label:'Civilization',color:'#e05c7e',href:'civilization.html'},
  strategy:{label:'Strategy',color:'#d4622a',href:'strategy.html'},
  simulation:{label:'Simulation',color:'#b8b6ae',href:'simulation.html'}
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
      var on=b.getAttribute('data-sc')===id;
      b.setAttribute('aria-pressed',String(on));
      if(on)V3.pop(b.querySelector('.dot'),1.7);
    });
    listeners.forEach(function(fn){fn(id)});
  },
  onChange:function(fn){listeners.push(fn)}
};

/* ════════ Motion ════════
   Backbone: motion.dev (vanilla UMD, loaded from jsdelivr before this
   file — same CDN precedent as three.js). When present, it drives
   entrances (inView springs), press physics, and emphasis pops; the
   hand-rolled spring engine below remains for number counting and as
   the full fallback when the CDN is unreachable. */
var REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
V3.REDUCED=REDUCED;
var M=window.Motion&&window.Motion.animate?window.Motion:null;
V3.M=M;
/* emphasis pop — a playful overshoot on the element that just gained
   meaning (active dot, chosen segment, changed status) */
V3.pop=function(el,amount){
  if(!M||REDUCED||!el)return;
  M.animate(el,{scale:[1,amount||1.25,1]},{duration:.5,ease:[.22,1.4,.36,1]});
};
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
   Only elements captured at call time; later re-renders never re-hide.
   With motion.dev present, entrances are true springs via inView;
   the CSS .pre path is the no-Motion fallback. */
var REVEAL_SEL='.section-head,.stat,.chart-card,.t-card,.q-card,.impact-row,.spine-item,.land-row,.ledger-row,.lever,.action-card,.slope-card,.diff-row,.hero-stats,.narrative,.lever-delta';
V3.reveal=function(){
  if(REDUCED)return;
  var els=document.querySelectorAll(REVEAL_SEL);
  if(M){
    els.forEach(function(el){
      if(el.__rv)return;el.__rv=1;
      var idx=Array.prototype.indexOf.call(el.parentNode.children,el);
      el.style.opacity='0';
      var stop=M.inView(el,function(){
        stop();
        M.animate(el,{opacity:[0,1],y:[20,0]},
          {type:'spring',stiffness:130,damping:17,delay:Math.min(.3,idx*.055)});
      },{margin:'0px 0px 18% 0px'});
    });
    return;
  }
  var io=new IntersectionObserver(function(ents){
    ents.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
    });
  },{rootMargin:'0px 0px 18% 0px',threshold:.01});
  els.forEach(function(el){
    if(el.classList.contains('pre'))return;
    el.classList.add('pre');
    var idx=Array.prototype.indexOf.call(el.parentNode.children,el);
    el.style.setProperty('--rv-delay',Math.min(280,idx*55)+'ms');
    io.observe(el);
  });
};

/* Press physics — every interactive element squishes under the pointer
   and springs back with overshoot on release. Delegated, so content
   re-rendered on scenario switches keeps the behavior. */
function pressPhysics(){
  if(!M||REDUCED)return;
  var PRESS='button:not([disabled]),.t-card,.ledger-row,.land-dot,.menu a,.nav-link';
  document.addEventListener('pointerdown',function(e){
    var t=e.target.closest?e.target.closest(PRESS):null;
    if(!t)return;
    M.animate(t,{scale:.962},{duration:.09,ease:'easeOut'});
    function release(){
      M.animate(t,{scale:1},{type:'spring',stiffness:430,damping:16});
      removeEventListener('pointerup',release);
      removeEventListener('pointercancel',release);
    }
    addEventListener('pointerup',release);
    addEventListener('pointercancel',release);
  },{passive:true});
}

/* ════════ Chrome ════════ */
var NAV=[
  {label:'Overview',href:'index.html'},
  {label:'Systems',menu:['ai','climate','governance','transition','civilization','strategy'].map(function(k){
    return {href:V3.SYS[k].href,label:V3.SYS[k].label,tick:V3.SYS[k].color,hint:{ai:'48 today',climate:'42 today',governance:'40 today',transition:'43 today',civilization:'44 today',strategy:'35 today'}[k]};
  })},
  {label:'Tools',menu:[
    {href:'simulation.html',label:'Simulation',hint:'5 levers · 2027–2070'},
    {href:'pathways.html',label:'Pathways',hint:'between futures'},
    {href:'visualizer.html',label:'Visualizer',hint:'3D · XR'}]},
  {label:'Evidence',menu:[
    {href:'data.html',label:'Live data',hint:'8 feeds'},
    {href:'timeline.html',label:'Timeline',hint:'200K years'},
    {href:'research.html',label:'Research',hint:'the paper'}]},
  {label:'Advisor',href:'chat.html'},
  {label:'About',href:'about.html'}
];
V3.nav=function(currentHref){
  var h='<nav class="nav" aria-label="Site"><div class="nav-inner">';
  h+='<a class="wordmark" href="index.html">AICIVSIM<em>.</em></a>';
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
V3.deck=function(sysKey,context,noSeg){
  var s=V3.SYS[sysKey]||{label:context||'',color:'var(--ink-4)'};
  return '<div class="deck"><div class="deck-inner">'
    +'<div class="deck-title"><i style="background:'+(s.color||'var(--ink-4)')+'"></i><b>'+s.label+'</b>'
    +(context?'<span>'+context+'</span>':'')+'</div>'
    /* noSeg: pages that host their own scenario instrument (Pathways)
       must not repeat the four options in the deck — one page, one
       place where those names are clickable. */
    +(noSeg?'':V3.seg(true))+'</div></div>';
};
V3.footer=function(){
  return '<footer class="v3-footer"><div class="col">'
    +'<div class="foot-grid"><div><a class="wordmark" href="index.html">AICIVSIM<em>.</em></a>'
    +'<p class="body-2" style="margin-top:14px;max-width:300px">A data-driven simulation framework for reasoning about the systems that decide civilizational outcomes. Open source; not a prediction engine.</p></div>'
    +'<div><h4>Systems</h4><a href="ai.html">AI</a><a href="climate.html">Climate</a><a href="governance.html">Governance</a><a href="transition.html">Transition</a><a href="civilization.html">Civilization</a><a href="strategy.html">Strategy</a></div>'
    +'<div><h4>Explore</h4><a href="simulation.html">Simulation</a><a href="pathways.html">Pathways</a><a href="visualizer.html">Visualizer</a><a href="data.html">Live data</a><a href="research.html">Research</a><a href="about.html">About</a><a href="design-system.html">Design system</a></div></div>'
    +'<div class="foot-note"><span>AI Civilization Simulator · 2026 · grounded in live data from NOAA, Our World in Data, and the World Bank</span>'
    +'<span><a href="design-system.html">Built on the AICIVSIM design system</a></span></div>'
    +'</div></footer>';
};
V3.boot=function(opts){
  opts=opts||{};
  var here=location.pathname.split('/').pop()||'index.html';
  document.body.insertAdjacentHTML('afterbegin',
    V3.nav(here)+(opts.deck?V3.deck(opts.deck.sys,opts.deck.context,opts.deck.noSeg):''));
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
  /* menu intent: open instantly, switch between menus instantly,
     close only after a short grace so stray pointer exits don't kill
     the menu — but sweeping the bar never leaves a trail */
  var openItem=null,closeTimer=null;
  document.querySelectorAll('.nav-item').forEach(function(item){
    if(!item.querySelector('.menu'))return;
    item.addEventListener('mouseenter',function(){
      clearTimeout(closeTimer);
      if(openItem&&openItem!==item)openItem.classList.remove('open');
      item.classList.add('open');openItem=item;
    });
    item.addEventListener('mouseleave',function(){
      clearTimeout(closeTimer);
      closeTimer=setTimeout(function(){
        item.classList.remove('open');
        if(openItem===item)openItem=null;
      },160);
    });
  });
  /* sweeping onto a plain link (no menu) closes any open menu at once */
  document.querySelectorAll('.nav-item').forEach(function(item){
    if(item.querySelector('.menu'))return;
    item.addEventListener('mouseenter',function(){
      clearTimeout(closeTimer);
      if(openItem){openItem.classList.remove('open');openItem=null}
    });
  });
  /* press physics + a playful accent on the wordmark */
  pressPhysics();
  if(M&&!REDUCED&&M.hover){
    M.hover('.wordmark',function(el){
      var dot=el.querySelector('em');
      if(dot)M.animate(dot,{y:[0,-5,0]},{duration:.5,ease:[.3,1.6,.4,1]});
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
  /* context note — the "why this matters in this future" line. Updates
     with a soft crossfade on scenario switch. */
  var note=null;
  if(spec.notes){
    note=document.createElement('p');note.className='c-note';
    card.appendChild(note);
  }
  var years=spec.years,n=years.length;
  var lo=Infinity,hi=-Infinity;
  V3.SC_ORDER.forEach(function(sc){spec.data[sc].forEach(function(v){if(v<lo)lo=v;if(v>hi)hi=v})});
  var pad=(hi-lo)*.07;lo-=pad;hi+=pad;
  var W,H=216,ML=8,MR=76,MT=10,MB=22,iw,ih;
  function X(i){return ML+iw*(i/(n-1))}
  function Y(v){return MT+ih*(1-(v-lo)/(hi-lo))}
  var svg,gGhost={},pActive,pArea,dot,cursor,xhair,xdots={},xyear,labels={},disp=null,raf=null,drawn=false,curYear=null;

  function lineD(arr){var d='M';for(var i=0;i<n;i++){d+=(i?'L':'')+X(i).toFixed(1)+','+Y(arr[i]).toFixed(1)}return d}
  function areaD(arr){return lineD(arr)+'L'+X(n-1).toFixed(1)+','+(MT+ih)+'L'+ML+','+(MT+ih)+'Z'}

  function build(){
    W=Math.max(280,plot.clientWidth||card.clientWidth-40);
    iw=W-ML-MR;ih=H-MT-MB;
    plot.innerHTML='';
    svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H});
    plot.appendChild(svg);
    /* end labels own the right rail — tick numbers yield to them */
    var endYs=V3.SC_ORDER.map(function(sc){var d=spec.data[sc];return Y(d[d.length-1])});
    niceTicks(lo,hi,3).forEach(function(t){
      var y=Y(t);if(y<MT-1||y>MT+ih+1)return;
      svg.appendChild(svgEl('line',{class:'grid',x1:ML,x2:W-MR+8,y1:y,y2:y}));
      var collides=endYs.some(function(ey){return Math.abs(ey-y)<13});
      if(collides)return;
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
    /* hover crosshair: a vertical line + a marker on every series at
       the hovered year, so the tooltip's numbers have a place on the
       plot. Hidden until the pointer enters. */
    xhair=svgEl('line',{class:'hover-line',y1:MT,y2:MT+ih,x1:-10,x2:-10});svg.appendChild(xhair);
    xdots={};
    V3.SC_ORDER.forEach(function(sc){
      var c=svgEl('circle',{r:2.6,fill:V3.SC[sc].color,class:'hover-dot'});
      c.style.opacity='0';xdots[sc]=c;svg.appendChild(c);
    });
    xyear=svgEl('text',{class:'hover-year','text-anchor':'middle',y:H-6});
    xyear.style.opacity='0';svg.appendChild(xyear);
    V3.SC_ORDER.forEach(function(sc){
      var t=svgEl('text',{class:'endlbl',x:W-MR+12});labels[sc]=t;svg.appendChild(t);
    });
    svg.addEventListener('mousemove',onHover);
    svg.addEventListener('mouseleave',hideHover);
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
    /* resolve collisions downward, then shift the chain back up if it
       ran past the plot floor — labels never stack on the x-axis */
    for(var i=1;i<pos.length;i++)if(pos[i].y-pos[i-1].y<13)pos[i].y=pos[i-1].y+13;
    var over=pos[pos.length-1].y-(MT+ih);
    if(over>0)for(var j=0;j<pos.length;j++)pos[j].y-=over;
    for(var k=pos.length-2;k>=0;k--)if(pos[k+1].y-pos[k].y<13)pos[k].y=pos[k+1].y-13;
    var activeSlot=null;
    pos.forEach(function(l){
      var t=labels[l.sc];
      t.setAttribute('fill',V3.SC[l.sc].color);
      t.setAttribute('class','endlbl'+(l.on?'':' ghosted'));
      if(!l.on){
        t.setAttribute('y',Math.max(MT+8,l.y)+3.5);
        t.textContent=V3.SC[l.sc].short.toLowerCase();
      }else activeSlot=Math.max(MT+8,l.y)+3.5;
    });
    return activeSlot;
  }
  function setActive(sc,animate){
    var m=V3.SC[sc],target=spec.data[sc];
    pActive.setAttribute('stroke',m.color);
    dot.setAttribute('fill',m.color);
    pArea.setAttribute('fill',m.color);
    pArea.setAttribute('fill-opacity',REDUCED?.07:.075);
    V3.SC_ORDER.forEach(function(g){gGhost[g].style.opacity=g===sc?0:''});
    var activeSlot=layoutLabels(sc);
    var last=target[n-1];
    read.innerHTML=spec.read?spec.read(last,spec):('<b style="color:'+m.color+'">'+(spec.prefix||'')+fmtVal(last,spec.dec)+(spec.unit||'')+'</b> by '+years[n-1]+' · '+m.name.toLowerCase());
    if(note){
      var txt=spec.notes[sc]||'';
      if(animate&&!REDUCED){
        note.style.opacity='.35';
        setTimeout(function(){note.textContent=txt;note.style.opacity=''},140);
      }else note.textContent=txt;
    }
    if(raf)cancelAnimationFrame(raf);
    if(!animate||REDUCED){
      disp=target.slice();paintDisp();
      if(activeSlot!=null)labels[sc].setAttribute('y',activeSlot);
      return;
    }
    var from=disp.slice(),t0=performance.now(),D=460;
    function step(t){
      var k=easeOut(Math.min(1,(t-t0)/D));
      for(var i=0;i<n;i++)disp[i]=from[i]+(target[i]-from[i])*k;
      paintDisp();
      if(k<1)raf=requestAnimationFrame(step);
      else if(activeSlot!=null)labels[sc].setAttribute('y',activeSlot);
    }
    raf=requestAnimationFrame(step);
  }
  function hideHover(){
    V3.tipHide();
    xhair.setAttribute('x1',-10);xhair.setAttribute('x2',-10);
    xyear.style.opacity='0';
    V3.SC_ORDER.forEach(function(sc){xdots[sc].style.opacity='0'});
  }
  function onHover(e){
    var r=svg.getBoundingClientRect();
    var fx=(e.clientX-r.left)/r.width*W;
    var idx=Math.round((fx-ML)/iw*(n-1));
    if(idx<0||idx>n-1){hideHover();return}
    var act=V3.scenario.get();
    /* crosshair snaps to the year; markers land on every series; the
       year rides the line along the axis — a true timeline indicator */
    var cx=X(idx);
    xhair.setAttribute('x1',cx);xhair.setAttribute('x2',cx);
    xyear.setAttribute('x',Math.max(ML+16,Math.min(ML+iw-16,cx)));
    xyear.textContent=years[idx];
    xyear.style.opacity='1';
    V3.SC_ORDER.forEach(function(sc){
      var c=xdots[sc],on=sc===act;
      c.setAttribute('cx',cx);
      c.setAttribute('cy',Y(sc===act?disp[idx]:spec.data[sc][idx]));
      c.setAttribute('r',on?3.4:2.4);
      c.style.opacity=on?'1':'var(--ghost)';
    });
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
        var on=d.getAttribute('data-sc')===act;
        var was=d.getAttribute('data-active')==='true';
        d.setAttribute('data-active',String(on));
        if(on&&!was&&animate)V3.pop(d,1.35);
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

/* ── thresholds — risk / tipping-point cards with breach state ──
   items:[{label,thresholdText,desc,scenarioNote:{sc},value:fn(sc)→n,
   fmt:fn(n)→str, breach:fn(n)→bool, nearFrac}] */
V3.thresholds=function(container,items){
  var el=typeof container==='string'?document.querySelector(container):container;
  el.classList.add('th-grid');
  el.innerHTML=items.map(function(it,i){
    return '<div class="th-card" data-i="'+i+'">'
      +'<div class="th-head"><h4>'+it.label+'</h4><span class="th-state num"></span></div>'
      +'<div class="th-line"><b class="num th-val"></b><span class="th-thr">'+it.thresholdText+'</span></div>'
      +'<p class="th-desc">'+it.desc+'</p>'
      +'<p class="th-note"></p></div>';
  }).join('');
  var lastVals=items.map(function(){return null});
  function update(animate){
    var act=V3.scenario.get(),m=V3.SC[act];
    items.forEach(function(it,i){
      var card=el.querySelector('.th-card[data-i="'+i+'"]');
      var v=it.value(act);
      var breached=it.breach(v);
      var near=!breached&&it.near(v);
      var stEl=card.querySelector('.th-state');
      var newState=breached?'breached':near?'near':'clear';
      var changed=card.getAttribute('data-state')&&card.getAttribute('data-state')!==newState;
      stEl.textContent=breached?'BREACHED':near?'AT RISK':'CLEAR';
      stEl.className='th-state num '+(breached?'bad':near?'warn':'good');
      card.setAttribute('data-state',newState);
      if(changed&&animate)V3.pop(stEl,1.22);
      var vEl=card.querySelector('.th-val');
      vEl.style.color=m.color;
      if(animate&&lastVals[i]!=null)V3.tween(vEl,v,{from:lastVals[i],fmt:it.fmt});
      else vEl.textContent=it.fmt(v);
      lastVals[i]=v;
      card.querySelector('.th-note').textContent=it.scenarioNote[act]||'';
    });
    if(animate)V3.stagger(el.querySelectorAll('.th-card .th-state'),30);
  }
  update(false);
  V3.scenario.onChange(function(){update(true)});
};

/* ── milestones — a dated rail of goals with per-future status ──
   list:[{year,title,goalScore,items:[...],<sc>:{score,status,note}}] */
V3.milestones=function(container,list){
  var el=typeof container==='string'?document.querySelector(container):container;
  el.classList.add('spine');
  el.innerHTML=list.map(function(ms,i){
    return '<div class="spine-item ms" data-i="'+i+'">'
      +'<div class="when">'+ms.year+' · goal '+ms.goalScore+'/100</div>'
      +'<h3>'+ms.title+' <span class="ms-status num"></span> <span class="grade-chip sm ms-score"></span></h3>'
      +'<p class="ms-note"></p>'
      +'<div class="ms-items">'+ms.items.map(function(x){return '<span>'+x+'</span>'}).join('')+'</div>'
      +'</div>';
  }).join('');
  var TONE={Complete:'good','On track':'good',Partial:'warn',Delayed:'warn',Stalled:'warn','At risk':'warn','Not started':'bad',Failed:'bad',Abandoned:'bad',Collapsed:'bad'};
  function update(animate){
    var act=V3.scenario.get(),m=V3.SC[act];
    list.forEach(function(ms,i){
      var it=el.querySelector('.spine-item[data-i="'+i+'"]');
      var s=ms[act];if(!s)return;
      var st=it.querySelector('.ms-status');
      st.textContent=s.status;
      st.className='ms-status num '+(TONE[s.status]||'warn');
      var sc=it.querySelector('.ms-score');
      sc.textContent=s.score+'/'+ms.goalScore;
      sc.style.color=s.score>=ms.goalScore?'var(--good)':m.color;
      it.querySelector('.ms-note').textContent=s.note;
      it.classList.toggle('now',s.score>=ms.goalScore);
    });
    if(animate)V3.stagger(el.querySelectorAll('.spine-item.ms h3'),36);
  }
  update(false);
  V3.scenario.onChange(function(){update(true)});
};

/* ── stack — composition bar (funding sources etc.) ──
   getSegments:fn(sc)→[{name,pct,color,range?}] */
V3.stack=function(container,getSegments){
  var el=typeof container==='string'?document.querySelector(container):container;
  el.classList.add('stack');
  el.innerHTML='<div class="stack-bar"></div><div class="stack-legend"></div>';
  var bar=el.querySelector('.stack-bar'),leg=el.querySelector('.stack-legend');
  function update(){
    var segs=getSegments(V3.scenario.get())||[];
    bar.innerHTML=segs.map(function(s){
      return '<i style="width:'+s.pct+'%;background:'+s.color+'" title="'+s.name+' '+s.pct+'%"></i>';
    }).join('');
    leg.innerHTML=segs.map(function(s){
      return '<div class="stack-row"><i style="background:'+s.color+'"></i><span>'+s.name+'</span>'
        +'<b class="num">'+(s.range||s.pct+'%')+'</b></div>';
    }).join('');
  }
  update();
  V3.scenario.onChange(update);
};

/* ── bridges — the income-bridge calculator (transition) ──
   Original math preserved: dividend covers rate×months of training
   cost; payback = out-of-pocket ÷ monthly salary gain. */
V3.bridges=function(container,bridges,DIV_RATE){
  var el=typeof container==='string'?document.querySelector(container):container;
  var sel=0;
  el.innerHTML='<div class="br-picker" role="group" aria-label="Career transition"></div>'
    +'<div class="br-callout"></div>'
    +'<div class="br-detail kpis" style="margin-top:12px"></div>';
  var picker=el.querySelector('.br-picker'),callout=el.querySelector('.br-callout'),detail=el.querySelector('.br-detail');
  function fmtD(v){return '$'+Math.round(Math.abs(v)).toLocaleString()}
  function update(){
    var act=V3.scenario.get(),m=V3.SC[act],rate=DIV_RATE[act];
    picker.innerHTML=bridges.map(function(b,i){
      return '<button data-b="'+i+'" aria-pressed="'+(i===sel)+'">'+b.from+' → '+b.to+'</button>';
    }).join('');
    var b=bridges[sel];
    var divTotal=rate*b.trainMo;
    var oop=Math.max(0,b.trainCost-divTotal);
    var salaryGain=b.post-(b.loss*12);
    var payback=rate>0?Math.max(1,Math.round(oop/(salaryGain/12))):Math.round(b.trainCost/(salaryGain/12));
    var net10=salaryGain*10-oop;
    callout.innerHTML=rate>0
      ?'<span class="pill-dot" style="background:'+m.color+'"></span>Under '+m.name.toLowerCase()+', a civic dividend of <b class="num" style="color:'+m.color+'">$'+rate+'/mo</b> covers <b class="num">'+fmtD(Math.min(divTotal,b.trainCost))+'</b> of this retraining.'
      :'<span class="pill-dot" style="background:'+m.color+'"></span>Under '+m.name.toLowerCase()+' there is <b style="color:var(--bad)">no civic dividend</b> — the worker carries every dollar of this transition.';
    detail.innerHTML=[
      {l:'Income dip during training',v:'−$'+b.loss.toLocaleString()+'/mo',c:'bad',ctx:b.trainMo+' months of retraining'},
      {l:'Training cost',v:fmtD(b.trainCost),c:'flat',ctx:rate>0?fmtD(oop)+' out of pocket after dividend':'entirely out of pocket'},
      {l:'New salary',v:fmtD(b.post)+'/yr',c:'good',ctx:'+'+fmtD(salaryGain)+'/yr over the displaced income'},
      {l:'Payback time',v:payback+' mo',c:payback<=18?'good':'bad',ctx:'until the move pays for itself'},
      {l:'10-year net',v:(net10>0?'+':'−')+fmtD(net10),c:net10>0?'good':'bad',ctx:'lifetime value of making the jump'}
    ].map(function(x){
      return '<div class="stat"><div class="lbl">'+x.l+'</div>'
        +'<div class="val" style="font-size:22px">'+x.v+'</div>'
        +'<div class="delta '+x.c+'"><span class="ctx">'+x.ctx+'</span></div></div>';
    }).join('');
    V3.stagger(detail.querySelectorAll('.stat'),26);
  }
  el.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('button[data-b]'):null;
    if(b){sel=+b.getAttribute('data-b');update()}
  });
  update();
  V3.scenario.onChange(update);
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
    var len=mspec.data.bau.length;
    var yrs=[];for(var yy=2050-(len-1);yy<=2050;yy++)yrs.push(yy);
    var spec={label:mspec.label,unit:mspec.unit,prefix:mspec.prefix,dir:mspec.dir,years:yrs,data:mspec.data,
      dec:mspec.dec!=null?mspec.dec:autoDec(mspec.data.bau[0]),notes:mspec.notes};
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
      unit:mspec.unit,dir:mspec.dir,min:lo-pad,max:hi+pad,
      dec:mspec.dec!=null?mspec.dec:autoDec(mspec.data.bau[0])};
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
