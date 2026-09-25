(function(){
'use strict';

if(!location.href.includes('screen=place')||!location.href.includes('mode=call'))return;
if(document.getElementById('dkSupportPlanner'))return;

const U=['spear','sword','axe','archer','spy','light','marcher','heavy','ram','catapult','knight','snob'];
let clockOffset=0;
let clockReady=false;

function sec(t){
 const m=String(t||'').match(/(\d+):(\d{2}):(\d{2})/);
 return m?+m[1]*3600+ +m[2]*60+ +m[3]:0;
}

function fmt(s){
 s=((Math.floor(s)%86400)+86400)%86400;
 return Math.floor(s/3600)+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}

function localSec(){
 const d=new Date();
 return d.getHours()*3600+d.getMinutes()*60+d.getSeconds()+d.getMilliseconds()/1000;
}

function syncClock(){
 let txt='';
 const els=[
  '#serverTime','#server_time','.server-time',
  '.server-time-container','.serverTime'
 ];
 for(const s of els){
  const e=document.querySelector(s);
  if(e){txt=e.textContent||'';break;}
 }

 const m=txt.match(/\b(\d{1,2}):(\d{2}):(\d{2})\b/);

 if(m){
  let h=+m[1],mi=+m[2],se=+m[3];
  const d=new Date();
  let server=h*3600+mi*60+se;
  let local=d.getHours()*3600+d.getMinutes()*60+d.getSeconds();
  let diff=server-local;

  if(diff>43200)diff-=86400;
  if(diff<-43200)diff+=86400;

  clockOffset=diff;
  clockReady=true;
  return;
 }

 if(typeof server_utc_diff!=='undefined'){
  clockOffset=Number(server_utc_diff)||0;
  clockReady=true;
 }
}

function now(){
 if(!clockReady)syncClock();
 return localSec()+clockOffset;
}

function selected(){
 return U.filter(function(u){
  const e=document.getElementById('checkbox_'+u);
  return e&&e.checked;
 });
}

function travel(row){
 let max=0;

 selected().forEach(function(u){
  const td=row.querySelector('td[data-unit="'+u+'"]');
  if(!td)return;

  const input=td.querySelector('.call-unit-box');
  let amount=0;

  if(input&&!input.disabled&&String(input.value).trim()!=='')
   amount=parseInt(input.value,10)||0;
  else
   amount=parseInt(td.getAttribute('data-count'),10)||0;

  if(amount<=0)return;

  const t=sec(
   td.getAttribute('data-title')||
   td.getAttribute('title')||
   ''
  );

  if(t>max)max=t;
 });

 return max;
}

function arrival(){
 const e=document.getElementById('dkArrivalTime');
 if(!e||!e.value)return null;

 const p=e.value.split(':').map(Number);
 return p[0]*3600+p[1]*60+(p[2]||0);
}

function calculate(){
 const target0=arrival();
 if(target0===null)return;

 const n=now();
 let target=target0;

 while(target<n)target+=86400;

 document.querySelectorAll('tr.call-village').forEach(function(row){
  let cell=row.querySelector('.dkPlannerCell');

  if(!cell){
   cell=document.createElement('td');
   cell.className='dkPlannerCell';
   row.appendChild(cell);
  }

  const t=travel(row);

  if(!t){
   cell.innerHTML='<span class="dkNoUnits">—</span>';
   row.dataset.dkReady='0';
   return;
  }

  let dep=target-t;
  const ready=dep>=n;

  cell.innerHTML=
   '<div class="dkDep">Odchod <b>'+fmt(dep)+'</b></div>'+
   '<div class="dkArr">Príchod <b>'+fmt(target)+'</b></div>'+
   '<div class="dkTravel">Cesta '+fmt(t)+'</div>'+
   '<div class="dkStatus '+(ready?'dkOk':'dkBad')+'">'+
   (ready?'STÍHA':'NESTÍHA')+'</div>';

  row.dataset.dkReady=ready?'1':'0';
 });
}

function build(){
 const first=document.querySelector('tr.call-village');
 if(!first)return;

 const table=first.closest('table');
 if(!table)return;

 const style=document.createElement('style');
 style.textContent=
 '#dkSupportPlanner{margin:6px 0 8px;padding:7px 9px;border:1px solid #c7b99a;background:rgba(255,255,255,.55);font-size:13px;line-height:28px;box-sizing:border-box}'+
 '#dkSupportPlanner b{font-weight:700}'+
 '#dkArrivalTime{width:108px;height:27px;box-sizing:border-box;padding:2px 5px;font-size:13px}'+
 '#dkSupportPlanner button{height:27px;padding:2px 9px;margin-left:3px;cursor:pointer;font-size:12px}'+
 '.dkPlannerCell{text-align:center;white-space:nowrap;font-size:11px;line-height:15px;padding:3px!important}'+
 '.dkDep b,.dkArr b{font-weight:700}'+
 '.dkTravel{color:#777;font-size:10px}'+
 '.dkStatus{font-weight:700;font-size:11px}'+
 '.dkOk{color:#278327}'+
 '.dkBad{color:#c62828}'+
 '.dkNoUnits{color:#888}'+
 '@media(max-width:600px){'+
 '#dkSupportPlanner{font-size:12px;padding:6px;line-height:30px}'+
 '#dkSupportPlanner button{font-size:11px;padding:2px 7px}'+
 '#dkArrivalTime{width:105px}'+
 '.dkPlannerCell{font-size:10px;line-height:14px}'+
 '.dkTravel{font-size:9px}'+
 '.dkStatus{font-size:10px}'+
 '}';

 document.head.appendChild(style);

 const panel=document.createElement('div');
 panel.id='dkSupportPlanner';

 panel.innerHTML=
 '<b>Plánovač podpory</b> &nbsp;'+
 'Príchod: '+
 '<input id="dkArrivalTime" type="time" step="1" value="20:00:00"> '+
 '<button id="dkCalculate" type="button">Vypočítať</button>'+
 '<button id="dkMarkReady" type="button">Označiť stíhajúce</button>';

 table.parentNode.insertBefore(panel,table);

 const head=table.querySelector('thead tr');

 if(head){
  const th=document.createElement('th');
  th.textContent='Plánovač';
  th.className='dkPlannerHead';
  head.appendChild(th);
 }

 document.getElementById('dkCalculate').onclick=calculate;

 document.getElementById('dkArrivalTime').oninput=calculate;
 document.getElementById('dkArrivalTime').onchange=calculate;

 document.addEventListener('change',function(e){
  if(!e.target)return;

  if(
   e.target.classList.contains('unit_checkbox')||
   e.target.classList.contains('call-unit-box')||
   e.target.classList.contains('troop-request-selector')
  ){
   setTimeout(calculate,30);
  }
 });

 document.getElementById('dkMarkReady').onclick=function(){
  document.querySelectorAll('tr.call-village').forEach(function(row){
   const cb=row.querySelector('.troop-request-selector');
   if(!cb)return;

   const ready=row.dataset.dkReady==='1';

   if(cb.checked!==ready)cb.click();
  });
 };

 syncClock();
 calculate();

 setInterval(function(){
  syncClock();
 },5000);
}

build();

})();
