(function(){
'use strict';

if(!location.href.includes('screen=place')||!location.href.includes('mode=call'))return;
if(document.getElementById('dkSupportPlanner'))return;

var units=['spear','sword','axe','archer','spy','light','marcher','heavy','ram','catapult','knight','snob'];

function sec(t){
 var m=String(t||'').match(/(\d+):(\d{2}):(\d{2})/);
 return m?+m[1]*3600+ +m[2]*60+ +m[3]:0;
}

function fmt(s){
 s=((s%86400)+86400)%86400;
 return Math.floor(s/3600)+':'+
 String(Math.floor((s%3600)/60)).padStart(2,'0')+':'+
 String(s%60).padStart(2,'0');
}

function nowSec(){
 var e=document.querySelector('#serverTime,#server_time,.server-time,.server-time-container');
 if(e){
  var m=e.textContent.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if(m)return +m[1]*3600+ +m[2]*60+ +m[3];
 }
 var d=new Date();
 return d.getHours()*3600+d.getMinutes()*60+d.getSeconds();
}

function selected(){
 return units.filter(function(u){
  var e=document.getElementById('checkbox_'+u);
  return e&&e.checked;
 });
}

function travel(row){
 var max=0;

 selected().forEach(function(u){
  var td=row.querySelector('td[data-unit="'+u+'"]');
  if(!td)return;

  var input=td.querySelector('.call-unit-box');
  var n;

  if(input&&!input.disabled&&String(input.value).trim()!==''){
   n=parseInt(input.value,10);
  }else{
   n=parseInt(td.getAttribute('data-count'),10);
  }

  if(!isNaN(n)&&n>0){
   var t=sec(td.getAttribute('data-title'));
   if(t>max)max=t;
  }
 });

 return max;
}

var first=document.querySelector('tr.call-village');
if(!first)return;

var table=first.closest('table');
if(!table)return;

var panel=document.createElement('div');
panel.id='dkSupportPlanner';
panel.style.cssText=
'margin:8px 0;padding:8px;border:1px solid #999;'+
'background:#f5f5f5;font-size:13px;line-height:20px;';

panel.innerHTML=
'<b>Plánovač podpory</b><br>'+
'Požadovaný príchod: '+
'<input id="dkArrivalTime" type="time" step="1" value="20:00:00" '+
'style="width:105px;height:28px;"> '+
'<button id="dkCalculate" type="button" style="height:28px;">Vypočítať</button> '+
'<button id="dkMarkReady" type="button" style="height:28px;">Označiť stíhajúce</button>';

table.parentNode.insertBefore(panel,table);

var head=table.querySelector('thead tr');
if(head){
 var th=document.createElement('th');
 th.textContent='Plánovač';
 head.appendChild(th);
}

function calculate(){
 var input=document.getElementById('dkArrivalTime');
 if(!input)return;

 var value=input.value;
 if(!value)return;

 var p=value.split(':').map(Number);
 var target=p[0]*3600+p[1]*60+(p[2]||0);
 var current=nowSec();

 if(target<=current)target+=86400;

 document.querySelectorAll('tr.call-village').forEach(function(row){
  var cell=row.querySelector('.dkPlannerCell');

  if(!cell){
   cell=document.createElement('td');
   cell.className='dkPlannerCell';
   row.appendChild(cell);
  }

  var t=travel(row);

  if(!t){
   cell.innerHTML='<span style="color:#888">—</span>';
   row.setAttribute('data-dk-ready','0');
   return;
  }

  var departure=target-t;
  var ok=departure>=current;

  cell.innerHTML=
   '<b>Odchod:</b> '+fmt(departure)+
   '<br><b>Príchod:</b> '+value+
   '<br><span style="color:#777">Cesta: '+fmt(t)+'</span>'+
   '<br><b style="color:'+(ok?'green':'red')+'">'+
   (ok?'STÍHA':'NESTÍHA')+'</b>';

  row.setAttribute('data-dk-ready',ok?'1':'0');
 });
}

document.getElementById('dkCalculate').onclick=function(){
 calculate();
};

document.getElementById('dkArrivalTime').onchange=function(){
 calculate();
};

document.getElementById('dkArrivalTime').oninput=function(){
 calculate();
};

document.addEventListener('change',function(e){
 if(e.target&&(
  e.target.classList.contains('unit_checkbox')||
  e.target.classList.contains('call-unit-box')||
  e.target.classList.contains('troop-request-selector')
  )){
  setTimeout(calculate,50);
 }
});

document.getElementById('dkMarkReady').onclick=function(){
 document.querySelectorAll('tr.call-village').forEach(function(row){
  var cb=row.querySelector('.troop-request-selector');
  if(!cb)return;

  var ready=row.getAttribute('data-dk-ready')==='1';

  if(cb.checked!==ready)cb.click();
 });
};

calculate();

})();
