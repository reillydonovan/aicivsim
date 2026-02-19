var fs=require('fs');
var pages=['climate.html','simulation.html','civilization.html','transition.html','governance.html'];
pages.forEach(function(p){
  var src=fs.readFileSync(p,'utf8');
  var scripts=src.match(/<script>[\s\S]*?<\/script>/g);
  if(!scripts){console.log(p+': no inline scripts'); return;}
  scripts.forEach(function(s,i){
    var code=s.replace('<script>','').replace('</script>','');
    try{new Function(code); console.log(p+' script['+i+']: OK')}
    catch(e){console.log(p+' script['+i+']: ERROR - '+e.message)}
  });
});
