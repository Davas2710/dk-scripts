(function(){
var a=[];
document.querySelectorAll('input,td,tr,table').forEach(function(e){
 var s=e.tagName+
 ' id='+e.id+
 ' class='+e.className+
 ' name='+e.getAttribute('name')+
 ' data-unit='+e.getAttribute('data-unit')+
 ' data-count='+e.getAttribute('data-count')+
 ' data-title='+e.getAttribute('data-title');
 if(s.length<500)a.push(s);
});
var x=document.createElement('pre');
x.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;background:#fff;color:#000;padding:10px;overflow:auto;font-size:11px;white-space:pre-wrap';
x.textContent=a.join('\\n');
document.body.appendChild(x);
})();
