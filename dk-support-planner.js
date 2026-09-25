(function(){
'use strict';

if(!location.href.includes('screen=place')||!location.href.includes('mode=call'))return;
if(document.getElementById('dkSupportPlanner'))return;

const units=['spear','sword','axe','archer','spy','light','marcher','heavy','ram','catapult','knight','snob'];

function sec(t){
 const m=String(t||'').match(/(\d+):(\d{2}):(\d{2})/);
 return m?+m[1]*3600+ +m[2]*60+ +m[3]:0;
}

function fmt(s){
 s=((s%86400)+86400)%86400;
 return Math.floor(s/3600)+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}

function nowSec(){
 const e=document.querySelector('#serverTime,#server_time,.server-time,.server-time-container');
 if(e){
  const m=e.textContent.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if(m)return +m[1]*3600+ +m[2]*60+ +m[3];
 }
 const d=new Date();
 return d.getHours()*3600+d.getMinutes()*60+d.getSeconds();
}

function selected(){
 return units.filter(u=>{
  const e=document.getElementById('checkbox_'+u);
  return e&&e.checked;
 });
}

function travel(row){
 let max=0;
 selected().forEach(u=>{
  const td=row.querySelector('td[data-unit="'+u+'"]');
  if(!td)return;

  const input=td.querySelector('.call-unit-box');
  let n;

  if(input&&!input.disabled&&input.value.trim()!=='')
   n=parseInt(input.value,10);
  else
   n=parseInt(td.dataset.count,10);

  if(!isNaN(n)&&n>0)
   max=Math.max(max,sec(td.dataset.title));
 });
 return max;
}

const first=document.querySelector('tr.call-village');
if(!first)return;

const table=first.closest('table');
if(!table)return;

const panel=document.createElement('div');
panel.id='dkSupportPlanner';
panel.style.cssText=
'margin:8px 0;padding:7px 9px;border:1px solid #aaa;'+
'background:#f5f5f5;font-size:13px;';

panel.innerHTML=
'<b>Plánovač podpory</b> &nbsp;'+
'Požadovaný príchod: '+
'<input id="dkArrivalTime" type="time" step="1" value="20:00:00" style="width:105px"> '+
'<button id="dkMarkReady" type="button">Označiť tie, ktoré stíhajú</button>';

table.parentNode.insertBefore(panel,table);

const head=table.querySelector('thead tr');
if(head){
 const th=document.createElement('th');
 th.textContent='Plánovač';
 head.appendChild(th);
}

function calculate(){
 const value=document.getElementById('dkArrivalTime').value;
 if(!value)return;

 const p=value.split(':').map(Number);
 const target0=p[0]*3600+p[1]*60+(p[2]||0);
 const current=nowSec();

 let target=target0;
 if(target<=current)target+=86400;

 document.querySelectorAll('tr.call-village').forEach(row=>{
  let cell=row.querySelector('.dkPlannerCell');

  if(!cell){
   cell=document.createElement('td');
   cell.className='dkPlannerCell';
   row.appendChild(cell);
  }

  const t=travel(row);

  if(!t){
   cell.innerHTML='<span style="color:#888">—</span>';
   row.dataset.dkReady='0';
   return;
  }

  const departure=target-t;
  const ok=departure>=current;

  cell.innerHTML=
   '<b>Odchod:</b> '+fmt(departure)+
   '<br><b>Príchod:</b> '+value+
   '<br><span style="color:#777">Cesta: '+fmt(t)+'</span>'+
   '<br><b style="color:'+(ok?'green':'red')+'">'+
   (ok?'STÍHA':'NESTÍHA')+'</b>';

  row.dataset.dkReady=ok?'1':'0';
 });
}

document.getElementById('dkArrivalTime')
 .addEventListener('change',calculate);

document.querySelectorAll('.unit_checkbox')
 .forEach(e=>e.addEventListener('change',()=>setTimeout(calculate,100)));

document.addEventListener('change',e=>{
 if(e.target.matches('.call-unit-box,.troop-request-selector'))
  setTimeout(calculate,100);
});

document.getElementById('dkMarkReady').onclick=function(){
 document.querySelectorAll('tr.call-village').forEach(row=>{
  const cb=row.querySelector('.troop-request-selector');
  if(!cb)return;

  const ready=row.dataset.dkReady==='1';
  if(cb.checked!==ready)cb.click();
 });
};

calculate();

})();
