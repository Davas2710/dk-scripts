(function(){
var els=document.querySelectorAll('*');
var found=null;

for(var i=0;i<els.length;i++){
 var t=(els[i].innerText||'').trim();
 if(t.indexOf('[32] (411|570) K54')!==-1){
  if(t.length<3000){
   found=els[i];
   break;
  }
 }
}

var x=document.createElement('pre');
x.style.cssText=
'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;'+
'background:#fff;color:#000;padding:10px;overflow:auto;font-size:11px;';

x.textContent=found?
 found.outerHTML:
 'NENAŠIEL SOM ELEMENT S DEDINOU';

document.body.appendChild(x);
})();
