(function(){
var rows=document.querySelectorAll('tr.call-village');
var units=document.querySelectorAll('.unit_checkbox');
var cells=document.querySelectorAll('td[data-unit]');
var x=document.createElement('div');

x.style.cssText=
'position:fixed;top:10px;left:10px;right:10px;z-index:999999;'+
'background:#fff;border:3px solid #000;padding:15px;font-size:16px;color:#000;';

x.innerHTML=
'<b>DK DIAGNOSTIKA</b><br>'+
'Dediny: '+rows.length+'<br>'+
'Checkboxy jednotiek: '+units.length+'<br>'+
'Bunky jednotiek: '+cells.length+'<br>'+
'URL screen: '+location.href;

document.body.appendChild(x);
})();
