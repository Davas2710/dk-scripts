(function(){
'use strict';

/* =========================================
   DK AUTO OZNAČOVÁNÍ
========================================= */

if(
 !location.href.includes('screen=overview') &&
 !location.href.includes('screen=incomings')
){
 console.log('DK Auto Označování: nesprávna stránka.');
 return;
}

if(document.getElementById('dkAutoOznacovani')){
 console.log('DK Auto Označování už beží.');
 return;
}


/* =========================================
   NASTAVENIE
========================================= */

const MIN_MINUTES=4;
const MAX_MINUTES=7;
const MAX_ATTEMPTS=5;

const STORAGE_NEXT='dk_dalsi_oznaceni';
const STORAGE_ATTEMPTS='dk_pokusy';
const STORAGE_STOPPED='dk_auto_oznacovani_stop';
const STORAGE_ACTION='dk_auto_oznacovani_action';


/* =========================================
   STAV
========================================= */

let attempts=parseInt(
 localStorage.getItem(STORAGE_ATTEMPTS)||'0',
 10
)||0;


/* =========================================
   POMOCNÉ FUNKCIE
========================================= */

function pad(n){
 return String(n).padStart(2,'0');
}


function getNextTime(){

 const value=
  parseInt(
   localStorage.getItem(STORAGE_NEXT)||'0',
   10
  );

 return isNaN(value)?0:value;
}


function remaining(){

 const next=getNextTime();

 if(!next)
  return 0;

 return Math.max(0,next-Date.now());
}


function formatRemaining(ms){

 if(ms<=0)
  return 'teraz';

 const total=
  Math.ceil(ms/1000);

 const min=
  Math.floor(total/60);

 const sec=
  total%60;

 return min+' min '+pad(sec)+' s';
}


function randomDelay(){

 return Math.floor(
  Math.random()*
  (MAX_MINUTES-MIN_MINUTES+1)+
  MIN_MINUTES
 )*60*1000;
}


/* =========================================
   ZASTAVENIE
========================================= */

function isStopped(){

 return localStorage.getItem(
  STORAGE_STOPPED
 )==='1';

}


function stop(){

 localStorage.setItem(
  STORAGE_STOPPED,
  '1'
 );

 localStorage.removeItem(
  STORAGE_NEXT
 );

 localStorage.removeItem(
  STORAGE_ACTION
 );

 setStatus(
  'Zastavené',
  'bad'
 );

 updatePanel();

 console.log(
  'DK Auto Označování: zastavené.'
 );

}


/* =========================================
   SPUSTENIE
========================================= */

function resume(){

 localStorage.removeItem(
  STORAGE_STOPPED
 );

 localStorage.removeItem(
  STORAGE_ACTION
 );

 updatePanel();

 setStatus(
  'Kontrolujem...',
  'wait'
 );

 setTimeout(
  oznac,
  100
 );

}


/* =========================================
   NASTAVENIE ĎALŠEJ KONTROLY
========================================= */

function setNextRun(){

 const delay=randomDelay();

 const next=
  Date.now()+delay;

 localStorage.setItem(
  STORAGE_NEXT,
  String(next)
 );

 console.log(
  'DK Auto Označování: ďalšia kontrola o '+
  Math.round(delay/60000)+
  ' min.'
 );

 updatePanel();

 return next;
}


/* =========================================
   RESET POKUSOV
========================================= */

function resetAttempts(){

 attempts=0;

 localStorage.setItem(
  STORAGE_ATTEMPTS,
  '0'
 );

 updatePanel();

}


/* =========================================
   NEÚSPEŠNÝ POKUS
========================================= */

function failedAttempt(){

 attempts++;

 localStorage.setItem(
  STORAGE_ATTEMPTS,
  String(attempts)
 );

 updatePanel();


 if(attempts>=MAX_ATTEMPTS){

  setStatus(
   'Zastavené – veľa neúspešných pokusov',
   'bad'
  );

  localStorage.setItem(
   STORAGE_STOPPED,
   '1'
  );

  console.warn(
   'DK Auto Označování: príliš veľa '+
   'neúspešných pokusov ('+
   attempts+'/'+MAX_ATTEMPTS+').'
  );

  return false;
 }

 return true;

}


/* =========================================
   PANEL
========================================= */

function setStatus(text,type){

 const e=
  document.getElementById(
   'dkAutoStatus'
  );

 if(!e)
  return;

 e.textContent=text;

 e.className=
  'dkAutoStatus '+
  (type||'normal');

}


function updatePanel(){

 const remainingEl=
  document.getElementById(
   'dkAutoRemaining'
  );

 const attemptsEl=
  document.getElementById(
   'dkAutoAttempts'
  );

 const statusEl=
  document.getElementById(
   'dkAutoStatus'
  );

 const stopBtn=
  document.getElementById(
   'dkAutoStop'
  );


 if(remainingEl)
  remainingEl.textContent=
   formatRemaining(remaining());


 if(attemptsEl)
  attemptsEl.textContent=
   attempts+'/'+MAX_ATTEMPTS;


 if(isStopped()){

  if(statusEl){

   statusEl.textContent=
    'Zastavené';

   statusEl.className=
    'dkAutoStatus bad';

  }

  if(stopBtn)
   stopBtn.textContent='Spustiť';

 }

 else{

  if(stopBtn)
   stopBtn.textContent='Zastaviť';

 }

}


/* =========================================
   VYTVORENIE PANELU
========================================= */

function createPanel(){

 const panel=
  document.createElement('div');

 panel.id=
  'dkAutoOznacovani';


 const style=
  document.createElement('style');


 style.textContent=

 '#dkAutoOznacovani{'+
 'margin:6px 0 8px;'+
 'padding:7px 9px;'+
 'border:1px solid #c7b99a;'+
 'background:rgba(255,255,255,.55);'+
 'font-size:13px;'+
 'line-height:27px;'+
 'box-sizing:border-box;'+
 'width:max-content;'+
 'min-width:100%;'+
 '}'+

 '.dkAutoRow{'+
 'display:flex;'+
 'align-items:center;'+
 'flex-wrap:nowrap;'+
 'gap:7px;'+
 'white-space:nowrap;'+
 'width:max-content;'+
 '}'+

 '.dkAutoTitle{'+
 'font-weight:700;'+
 'margin-right:4px;'+
 '}'+

 '.dkAutoStatus{'+
 'font-weight:700;'+
 '}'+

 '.dkAutoStatus.normal{'+
 'color:#555;'+
 '}'+

 '.dkAutoStatus.wait{'+
 'color:#7a5b00;'+
 '}'+

 '.dkAutoStatus.ok{'+
 'color:#278327;'+
 '}'+

 '.dkAutoStatus.bad{'+
 'color:#c62828;'+
 '}'+

 '.dkAutoButton{'+
 'height:27px;'+
 'padding:2px 9px;'+
 'margin:0;'+
 'cursor:pointer;'+
 'font-size:12px;'+
 'white-space:nowrap;'+
 '}'+

 '@media(max-width:600px){'+

 '#dkAutoOznacovani{'+
 'padding:6px 8px;'+
 'font-size:11px;'+
 'line-height:29px;'+
 'width:max-content;'+
 'min-width:100%;'+
 '}'+

 '.dkAutoRow{'+
 'gap:5px;'+
 '}'+

 '.dkAutoTitle{'+
 'margin-right:2px;'+
 '}'+

 '.dkAutoButton{'+
 'height:29px;'+
 'font-size:11px;'+
 'padding:2px 7px;'+
 '}'+

 '}';


 document.head.appendChild(style);


 panel.innerHTML=

 '<div class="dkAutoRow">'+

 '<span class="dkAutoTitle">'+
 'Auto Označování'+
 '</span>'+

 '<span>Stav:</span>'+

 '<span id="dkAutoStatus" '+
 'class="dkAutoStatus normal">'+
 'Spúšťa sa...'+
 '</span>'+

 '<span>Ďalšia kontrola:</span>'+

 '<b id="dkAutoRemaining">—</b>'+

 '<span>Pokusy:</span>'+

 '<b id="dkAutoAttempts">'+
 attempts+'/'+MAX_ATTEMPTS+
 '</b>'+

 '<button '+
 'id="dkAutoNow" '+
 'class="dkAutoButton" '+
 'type="button">'+
 'Skontrolovať teraz'+
 '</button>'+

 '<button '+
 'id="dkAutoStop" '+
 'class="dkAutoButton" '+
 'type="button">'+
 'Zastaviť'+
 '</button>'+

 '</div>';


 const target=
  document.querySelector(
   '#content_value'
  )||
  document.querySelector(
   '#contentContainer'
  )||
  document.body;


 target.insertBefore(
  panel,
  target.firstChild
 );


 /* =====================================
    RUČNÁ KONTROLA
 ===================================== */

 document.getElementById(
  'dkAutoNow'
 ).onclick=function(){

  localStorage.removeItem(
   STORAGE_NEXT
  );

  localStorage.removeItem(
   STORAGE_ACTION
  );

  localStorage.removeItem(
   STORAGE_STOPPED
  );

  setStatus(
   'Kontrolujem...',
   'wait'
  );

  updatePanel();

  setTimeout(
   oznac,
   100
  );

 };


 /* =====================================
    ZASTAVIŤ / SPUSTIŤ
 ===================================== */

 document.getElementById(
  'dkAutoStop'
 ).onclick=function(){

  if(isStopped()){

   resume();

  }else{

   stop();

  }

 };


 return panel;

}


/* =========================================
   OZNAČOVANIE
========================================= */

function oznac(){

 if(isStopped())
  return;


 setStatus(
  'Hľadám útoky...',
  'wait'
 );


 const selectAllBtn=
  document.querySelector(
   '#select_all'
  );


 if(!selectAllBtn){

  console.log(
   'DK Auto Označování: '+
   'nenašlo sa tlačidlo Vybrať všetko.'
  );

  setStatus(
   'Nenašlo sa „Vybrať všetko“',
   'bad'
  );


  if(!failedAttempt())
   return;


  setNextRun();

  scheduleReload();

  return;

 }


 /* =====================================
    VYBER VŠETKO
 ===================================== */

 selectAllBtn.click();


 console.log(
  'DK Auto Označování: Vybrať všetko.'
 );


 setStatus(
  'Útoky vybrané...',
  'wait'
 );


 /* =====================================
    HĽADANIE OZNAČENIA
 ===================================== */

 setTimeout(function(){

  let clicked=false;


  const buttons=
   document.querySelectorAll(
    '.btn, input[type="submit"], button'
   );


  buttons.forEach(function(btn){

   if(clicked)
    return;


   const text=
    String(
     btn.value||
     btn.textContent||
     ''
    ).trim().toLowerCase();


   if(
    text.includes('označ')||
    text.includes('oznac')||
    text.includes('mark')
   ){

    /* ================================
       DÔLEŽITÉ:
       Najprv uložíme stav.
       AŽ POTOM klikneme.
    ================================= */

    const next=
     setNextRun();


    localStorage.setItem(
     STORAGE_ACTION,
     'marking'
    );


    localStorage.setItem(
     STORAGE_STOPPED,
     '0'
    );


    setStatus(
     'Označujem a obnovujem stránku...',
     'ok'
    );


    clicked=true;


    resetAttempts();


    console.log(
     'DK Auto Označování: '+
     'označujem útoky.'
    );


    console.log(
     'DK Auto Označování: '+
     'ďalšia kontrola za '+
     formatRemaining(
      next-Date.now()
     )
    );


    /*
     * DK po kliknutí pravdepodobne
     * obnoví/naviguje stránku.
     *
     * Stav je už uložený v localStorage,
     * takže po novom načítaní skript
     * pokračuje automaticky.
     */

    btn.click();

   }

  });


  /* ===================================
     NIČ SA NENAŠLO
  =================================== */

  if(!clicked){

   console.log(
    'DK Auto Označování: '+
    'tlačidlo Označiť sa nenašlo.'
   );


   setStatus(
    'Nič na označenie',
    'wait'
   );


   if(!failedAttempt())
    return;


   setNextRun();

   scheduleReload();

  }

 },1500);

}


/* =========================================
   KONTROLA STAVU PO RELOAD
========================================= */

function handleReloadState(){

 const action=
  localStorage.getItem(
   STORAGE_ACTION
  );


 if(action==='marking'){

  /*
   * Označenie bolo spustené pred
   * predchádzajúcim reloadom.
   *
   * Ak sme už späť na stránke,
   * akcia sa považuje za dokončenú.
   */

  localStorage.removeItem(
   STORAGE_ACTION
  );


  const next=
   getNextTime();


  if(next){

   setStatus(
    'Označenie dokončené – čakám',
    'ok'
   );

   console.log(
    'DK Auto Označování: stránka sa obnovila '+
    'po označení. Pokračujem ďalej.'
   );

  }

 }

}


/* =========================================
   NAPLÁNOVANIE RELOADU
========================================= */

function scheduleReload(){

 if(isStopped())
  return;


 const ms=
  remaining();


 if(ms<=0){

  setTimeout(
   function(){

    if(!isStopped())
     location.reload();

   },
   60000
  );

  return;

 }


 console.log(
  'DK Auto Označování: stránka sa obnoví za '+
  formatRemaining(ms)
 );


 setTimeout(
  function(){

   if(!isStopped())
    location.reload();

  },
  ms
 );

}


/* =========================================
   START
========================================= */

function start(){

 createPanel();

 updatePanel();

 handleReloadState();


 /* =====================================
    ZASTAVENÉ
 ===================================== */

 if(isStopped()){

  setStatus(
   'Zastavené',
   'bad'
  );

  updatePanel();

  return;

 }


 /* =====================================
    EXISTUJE NAPLÁNOVANÁ KONTROLA
 ===================================== */

 const next=
  getNextTime();


 if(next){

  if(Date.now()<next){

   setStatus(
    'Čakám',
    'wait'
   );

   console.log(
    'DK Auto Označování: čakám. '+
    'Ďalšia kontrola za '+
    formatRemaining(
     next-Date.now()
    )
   );


   scheduleReload();

   return;

  }


  setStatus(
   'Kontrolujem...',
   'wait'
  );

  oznac();

  return;

 }


 /* =====================================
    ŽIADNY PLÁN → PRVÁ KONTROLA
 ===================================== */

 setStatus(
  'Kontrolujem...',
  'wait'
 );

 oznac();

}


/* =========================================
   AKTUALIZÁCIA PANELU
========================================= */

setInterval(
 function(){

  updatePanel();

 },
 1000
);


console.log(
 'DK Auto Označování spustený.'
);


start();

})();
