(function(){
var out=[];
document.querySelectorAll('input').forEach(function(e){
 if(
  e.type==='checkbox'||
  e.type==='number'
 ){
  out.push(
   e.tagName+
   ' | type='+e.type+
   ' | id='+e.id+
   ' | class='+e.className+
   ' | name='+e.name+
   ' | checked='+e.checked+
   ' | disabled='+e.disabled+
   ' | value='+e.value
  );
 }
});
var x=document.createElement('pre');
x.style.cssText=
'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;'+
'background:#fff;color:#000;padding:10px;overflow:auto;font-size:11px;';
x.textContent=out.join('\n');
document.body.appendChild(x);
})();
