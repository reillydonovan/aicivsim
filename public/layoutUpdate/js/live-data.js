/* ================================================================
   LIVE DATA LAYER — real-world baselines from key-free, CORS-open APIs
   ----------------------------------------------------------------
   Sources (all verified to send Access-Control-Allow-Origin: *):
     - global-warming.org  (NOAA/NASA mirrors: CO2 daily, methane, arctic)
     - ourworldindata.org  (grapher CSV: temp anomaly, renewables, CO2 emis)
     - api.worldbank.org   (v2 JSON: poverty, unemployment)

   Design rules:
     - NEVER block rendering on the network. Every consumer must look
       correct with the static baked-in baselines; live values overlay
       when (and only when) a fetch succeeds.
     - Results cached in sessionStorage for 6 hours.
     - window.LIVE_DATA.fetchAll() -> Promise<{indicators, fetchedAt}>
       Each indicator: {id,label,value,display,unit,asOf,source,url,
                        baseline,baselineLabel} or null if unavailable.
   ================================================================ */
(function(){
'use strict';

var CACHE_KEY='aicivsim-live-v1';
var CACHE_TTL=6*60*60*1000; /* 6h */
var TIMEOUT_MS=12000;

function tfetch(url,opts){
  return new Promise(function(resolve,reject){
    var t=setTimeout(function(){reject(new Error('timeout'))},TIMEOUT_MS);
    fetch(url,opts).then(function(r){clearTimeout(t);resolve(r)},function(e){clearTimeout(t);reject(e)});
  });
}

/* OWID grapher CSV: rows Entity,Code,Year,Value[,...] — return the last
   World row that has a numeric value in column `col` (default 3). */
function owidWorldLatest(csvText,col){
  col=col==null?3:col;
  var lines=csvText.split('\n');
  var best=null;
  for(var i=1;i<lines.length;i++){
    var c=lines[i].split(',');
    if(c.length<=col)continue;
    if(c[0]!=='World'&&c[1]!=='OWID_WRL')continue;
    var v=parseFloat(c[col]);
    if(isNaN(v))continue;
    var yr=parseInt(c[2],10);
    if(!best||yr>=best.year)best={year:yr,value:v};
  }
  return best;
}

var OWID_WORLD='?csvType=filtered&tab=chart&country=~OWID_WRL';

/* ── Indicator definitions ── */
var INDICATORS=[
  {
    id:'co2ppm',label:'CO₂ Concentration',unit:'ppm',dec:1,
    baseline:421,baselineLabel:'model baseline (2026)',
    source:'NOAA GML via global-warming.org',
    url:'https://global-warming.org/api/co2-api',
    fetch:function(){
      return tfetch('https://global-warming.org/api/co2-api').then(function(r){return r.json()}).then(function(j){
        var arr=j.co2;if(!arr||!arr.length)throw new Error('empty');
        var last=arr[arr.length-1];
        var v=parseFloat(last.trend||last.cycle);
        if(isNaN(v)||v<300||v>600)throw new Error('implausible');
        return {value:v,asOf:last.year+'-'+String(last.month).padStart(2,'0')+'-'+String(last.day).padStart(2,'0')};
      });
    }
  },
  {
    id:'tempAnomaly',label:'Warming vs Pre-industrial',unit:'°C',dec:2,prefix:'+',
    baseline:1.1,baselineLabel:'model baseline (2026)',
    source:'Met Office/Berkeley via Our World in Data',
    url:'https://ourworldindata.org/grapher/temperature-anomaly',
    fetch:function(){
      return tfetch('https://ourworldindata.org/grapher/temperature-anomaly.csv'+OWID_WORLD).then(function(r){return r.text()}).then(function(t){
        var b=owidWorldLatest(t);
        if(!b||b.value<0.5||b.value>3)throw new Error('implausible');
        return {value:b.value,asOf:String(b.year)};
      });
    }
  },
  {
    id:'renewShare',label:'Renewable Electricity Share',unit:'%',dec:1,
    baseline:30,baselineLabel:'model baseline (2026)',
    source:'Ember via Our World in Data',
    url:'https://ourworldindata.org/grapher/share-electricity-renewables',
    fetch:function(){
      return tfetch('https://ourworldindata.org/grapher/share-electricity-renewables.csv'+OWID_WORLD).then(function(r){return r.text()}).then(function(t){
        var b=owidWorldLatest(t);
        if(!b||b.value<10||b.value>90)throw new Error('implausible');
        return {value:b.value,asOf:String(b.year)};
      });
    }
  },
  {
    id:'co2emis',label:'Global CO₂ Emissions',unit:' Gt/yr',dec:1,
    baseline:36.3,baselineLabel:'model baseline (2026)',
    source:'Global Carbon Project via Our World in Data',
    url:'https://ourworldindata.org/grapher/annual-co2-emissions-per-country',
    fetch:function(){
      return tfetch('https://ourworldindata.org/grapher/annual-co2-emissions-per-country.csv'+OWID_WORLD).then(function(r){return r.text()}).then(function(t){
        var b=owidWorldLatest(t);
        if(!b)throw new Error('empty');
        var gt=b.value/1e9; /* OWID stores tonnes */
        if(gt<20||gt>60)throw new Error('implausible');
        return {value:gt,asOf:String(b.year)};
      });
    }
  },
  {
    id:'methane',label:'Atmospheric Methane',unit:' ppb',dec:0,
    baseline:null,baselineLabel:null,
    source:'NOAA GML via global-warming.org',
    url:'https://global-warming.org/api/methane-api',
    fetch:function(){
      return tfetch('https://global-warming.org/api/methane-api').then(function(r){return r.json()}).then(function(j){
        var arr=j.methane;if(!arr||!arr.length)throw new Error('empty');
        var last=arr[arr.length-1];
        var v=parseFloat(last.trend||last.average);
        if(isNaN(v)||v<1500||v>2500)throw new Error('implausible');
        return {value:v,asOf:String(last.date)};
      });
    }
  },
  {
    /* The feed's `value` is GLOBAL (Arctic+Antarctic) sea-ice extent;
       we surface the anomaly vs the monthly mean — the actual signal. */
    id:'seaice',label:'Global Sea Ice Anomaly',unit:' M km²',dec:2,
    baseline:null,baselineLabel:null,
    source:'NSIDC via global-warming.org',
    url:'https://global-warming.org/api/arctic-api',
    fetch:function(){
      return tfetch('https://global-warming.org/api/arctic-api').then(function(r){return r.json()}).then(function(j){
        var data=j.arcticData&&j.arcticData.data;if(!data)throw new Error('empty');
        var keys=Object.keys(data).sort();
        for(var i=keys.length-1;i>=0;i--){
          var d=data[keys[i]];
          var a=d&&parseFloat(d.anom);
          if(!isNaN(a)&&Math.abs(a)<8){
            var k=keys[i];
            return {value:a,asOf:k.slice(0,4)+'-'+k.slice(4,6)};
          }
        }
        throw new Error('no valid rows');
      });
    }
  },
  {
    id:'poverty',label:'Extreme Poverty Rate',unit:'%',dec:1,
    baseline:11,baselineLabel:'model baseline (2026)',
    source:'World Bank ($3.00/day, 2021 PPP)',
    url:'https://data.worldbank.org/indicator/SI.POV.DDAY',
    fetch:function(){
      return tfetch('https://api.worldbank.org/v2/country/WLD/indicator/SI.POV.DDAY?format=json&mrnev=1').then(function(r){return r.json()}).then(function(j){
        var row=j&&j[1]&&j[1][0];
        if(!row||row.value==null)throw new Error('empty');
        return {value:row.value,asOf:String(row.date)};
      });
    }
  },
  {
    id:'unemployment',label:'Global Unemployment',unit:'%',dec:1,
    baseline:null,baselineLabel:null,
    source:'ILO via World Bank',
    url:'https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS',
    fetch:function(){
      return tfetch('https://api.worldbank.org/v2/country/WLD/indicator/SL.UEM.TOTL.ZS?format=json&mrv=1').then(function(r){return r.json()}).then(function(j){
        var rows=j&&j[1];if(!rows)throw new Error('empty');
        for(var i=0;i<rows.length;i++){
          if(rows[i].value!=null)return {value:rows[i].value,asOf:String(rows[i].date)};
        }
        throw new Error('all null');
      });
    }
  }
];

function fmt(ind,v){
  return (ind.prefix||'')+v.toFixed(ind.dec)+ind.unit;
}

function readCache(){
  try{
    var raw=sessionStorage.getItem(CACHE_KEY);
    if(!raw)return null;
    var j=JSON.parse(raw);
    if(!j.fetchedAt||Date.now()-j.fetchedAt>CACHE_TTL)return null;
    return j;
  }catch(e){return null}
}
function writeCache(result){
  try{sessionStorage.setItem(CACHE_KEY,JSON.stringify(result))}catch(e){}
}

var inflight=null;

function fetchAll(){
  var cached=readCache();
  if(cached)return Promise.resolve(cached);
  if(inflight)return inflight;
  inflight=Promise.all(INDICATORS.map(function(ind){
    return ind.fetch().then(function(res){
      return {id:ind.id,label:ind.label,value:res.value,display:fmt(ind,res.value),
        unit:ind.unit,asOf:res.asOf,source:ind.source,url:ind.url,
        baseline:ind.baseline,baselineLabel:ind.baselineLabel,
        baselineDisplay:ind.baseline!=null?fmt(ind,ind.baseline):null};
    }).catch(function(){return null});
  })).then(function(list){
    var indicators={};
    list.forEach(function(x){if(x)indicators[x.id]=x});
    var result={indicators:indicators,fetchedAt:Date.now(),
      ok:Object.keys(indicators).length};
    if(result.ok)writeCache(result);
    inflight=null;
    return result;
  });
  return inflight;
}

window.LIVE_DATA={fetchAll:fetchAll,INDICATORS:INDICATORS};

/* ── Optional auto-mount: any page with #live-strip gets a compact
      live-signal row (used on the homepage). ── */
function mountStrip(){
  var el=document.getElementById('live-strip');
  if(!el)return;
  fetchAll().then(function(res){
    var want=['co2ppm','tempAnomaly','renewShare','poverty'];
    var got=want.map(function(id){return res.indicators[id]}).filter(Boolean);
    if(!got.length){el.style.display='none';return}
    var h='<div class="flex items-baseline gap-4 flex-wrap" style="row-gap:8px">';
    h+='<span class="t3" style="color:var(--green)">● Live</span>';
    got.forEach(function(ind){
      h+='<span class="t4" style="white-space:nowrap">'+ind.label+' ';
      h+='<span class="num num-sm" style="color:var(--text-primary)">'+ind.display+'</span>';
      h+='<span style="color:var(--text-faint)"> ('+ind.asOf+')</span></span>';
    });
    h+='<a href="data.html" class="t4" style="color:var(--climate);white-space:nowrap">All live data &rarr;</a>';
    h+='</div>';
    el.innerHTML=h;
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountStrip);
else mountStrip();

})();
