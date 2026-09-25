(function(){
var all=document.querySelectorAll('*');
var found=null;

for(var i=0;i<all.length;i++){
 var t=(all[i].innerText||'').trim();
 if(t.indexOf('[32] (411|570) K54')!==-1){
  found=all[i];
  break;
 }
}

var x=document.createElement('pre');
x.style.cssText=
'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;'+
'background:#fff;color:#000;padding:10px;overflow:auto;font-size:11px;';

if(found){
 var p=found;
 var out='';
 for(var j=0;j<6&&p;j++,p=p.parentElement){
  out+='\n--- LEVEL '+j+' '+p.tagName+
  ' id='+p.id+
  ' class='+p.className+' ---\n';
  out+=p.outerHTML.slice(0,5000);
 }
 x.textContent=out;
}else{
 x.textContent='DEDINA NENAJDENA';
}

document.body.appendChild(x);
})();
