(function(){
var f=document.getElementById('place_call_form');
var out=[];

if(!f){
 out.push('FORM NENAJDEN');
}else{
 f.querySelectorAll('*').forEach(function(e){
  var t=(e.innerText||'').trim().replace(/\s+/g,' ');
  if(t.length>0&&t.length<250){
   out.push(
    e.tagName+
    ' | id='+e.id+
    ' | class='+e.className+
    ' | name='+e.getAttribute('name')+
    ' | text='+t.slice(0,180)
   );
  }
 });
}

var x=document.createElement('pre');
x.style.cssText=
'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;'+
'background:#fff;color:#000;padding:10px;overflow:auto;font-size:11px;';
x.textContent=out.join('\n');
document.body.appendChild(x);
})();
