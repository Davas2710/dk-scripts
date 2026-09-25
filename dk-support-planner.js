(function(){
var r=document.querySelector('#village_troup_list tr.call-village');
var out=[];
if(!r){
 out.push('RIADOK NENAJDEN');
}else{
 r.querySelectorAll('td').forEach(function(td,i){
  out.push(
   'TD '+i+
   ' | class='+td.className+
   ' | data-unit='+td.getAttribute('data-unit')+
   ' | data-count='+td.getAttribute('data-count')+
   ' | data-title='+td.getAttribute('data-title')+
   ' | html='+td.outerHTML.slice(0,500)
  );
 });
}
var x=document.createElement('pre');
x.style.cssText=
'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;'+
'background:#fff;color:#000;padding:10px;overflow:auto;font-size:10px;';
x.textContent=out.join('\n\n');
document.body.appendChild(x);
})();
