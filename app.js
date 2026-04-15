/* ============================================
   PLANNING RÉVISION · LIQUID GLASS
   Three-state slots · Suivi ✅❌ · Auto-reschedule
   ============================================ */

const DAYS_FR = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const DAYS_KEY = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAYS_SHORT = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const SK = 'planning-revision-v4';
const VAC_START = '2026-04-17', VAC_END = '2026-05-03';
const OFF = ['2026-05-08','2026-05-14','2026-05-15','2026-05-25'];
const MON1 = '2026-04-13', WEEKS = 9;
const SUBJ = {
  francais:{l:'Français',i:'📚'},maths:{l:'Maths',i:'🔢'},
  physique:{l:'Physique-Chimie',i:'🔬'},svt:{l:'SVT',i:'🧬'},
  sport:{l:'Sport',i:'🏋️'},devoirs:{l:'Devoirs supp.',i:'📝'},
  autre:{l:'Autre',i:'✏️'}
};

// Templates
const TPL = {
  vacances: {
    monday:[{t:'francais',s:'10:00',e:'11:30'},{t:'maths',s:'20:00',e:'21:30'}],
    tuesday:[{t:'francais',s:'10:00',e:'11:30'},{t:'sport',s:'16:00',e:'18:30'},{t:'maths',s:'20:00',e:'21:30'}],
    wednesday:[{t:'francais',s:'10:00',e:'11:30'},{t:'devoirs',s:'14:00',e:'16:00'},{t:'sport',s:'16:00',e:'18:30'},{t:'maths',s:'20:00',e:'21:30'}],
    thursday:[{t:'francais',s:'10:00',e:'11:30'},{t:'maths',s:'20:00',e:'21:30'}],
    friday:[{t:'francais',s:'10:00',e:'11:30'},{t:'sport',s:'16:00',e:'18:30'},{t:'maths',s:'20:00',e:'21:30'}],
    saturday:[{t:'francais',s:'10:00',e:'11:30'},{t:'sport',s:'14:00',e:'16:30'},{t:'maths',s:'17:00',e:'18:30'}],
    sunday:[{t:'francais',s:'10:00',e:'11:00'},{t:'physique',s:'14:00',e:'15:30'},{t:'svt',s:'15:45',e:'17:15'},{t:'sport',s:'17:30',e:'20:00'}]
  },
  scolaire: {
    monday:[{t:'francais',s:'15:00',e:'16:00'},{t:'maths',s:'20:00',e:'21:00'}],
    tuesday:[{t:'sport',s:'16:00',e:'18:30'},{t:'francais',s:'18:30',e:'19:30'},{t:'maths',s:'20:00',e:'20:45'}],
    wednesday:[{t:'francais',s:'12:00',e:'13:30'},{t:'maths',s:'15:00',e:'16:30'},{t:'sport',s:'16:30',e:'19:00'}],
    thursday:[{t:'francais',s:'14:00',e:'15:00'},{t:'maths',s:'20:00',e:'21:00'}],
    friday:[{t:'sport',s:'16:00',e:'18:30'},{t:'francais',s:'18:30',e:'19:30'},{t:'maths',s:'20:00',e:'21:00'}],
    saturday:[{t:'francais',s:'10:00',e:'11:00'},{t:'sport',s:'14:00',e:'16:30'},{t:'maths',s:'17:00',e:'18:00'}],
    sunday:[{t:'francais',s:'10:00',e:'10:45'},{t:'physique',s:'14:00',e:'15:30'},{t:'svt',s:'15:45',e:'17:00'},{t:'sport',s:'17:00',e:'19:30'}]
  }
};

const RULES = [
  {i:'⚖️',l:'Ajustements',items:['Jour sauté → +30min les jours suivants','Français extensible jusqu\'à 2h','Maths extensible jusqu\'à 2h','Jour chargé → déplacer vers Mercredi']},
  {i:'🧠',l:'Règles',items:['Utiliser les trous en priorité','Français = concentration max (journée)','Maths = soir ou gros blocs','Régularité > intensité']},
  {i:'🏋️',l:'Sport',items:['Mar, Mer, Ven, Sam, Dim','2h30 par session','Adapter révisions autour du sport']},
  {i:'💡',l:'Conseils',items:['Garder du temps libre','Adapter selon la fatigue','Mercredi = rattrapage']}
];

// ── State ──
let wks = [], ci = 0, tab = 'planning';
let mMode = 'add', mWi = 0, mDk = '', mSi = -1;

// ── DOM ──
const $ = id => document.getElementById(id);
const grid = $('grid'), stats = $('stats'), rules = $('rules');
const wkLabel = $('wk-label'), wkBadge = $('wk-badge'), wkCounter = $('wk-counter'), dots = $('dots');
const btnP = $('prev'), btnN = $('next'), btnR = $('reset');
const tPlan = $('t-plan'), tSuivi = $('t-suivi'), tGraph = $('t-graph');
const secPlan = $('sec-planning'), secSuivi = $('sec-suivi'), secGraph = $('sec-graph');
const suiviDone = $('suivi-done'), suiviSkip = $('suivi-skip');
const mbg = $('mbg'), modal = $('modal');
const mTitle = $('m-title'), mSubj = $('m-subj'), mDesc = $('m-desc');
const mStart = $('m-start'), mEnd = $('m-end'), mDur = $('m-dur');
const mSave = $('m-save'), mCancel = $('m-cancel'), mX = $('m-x'), mDel = $('m-del');
const toastEl = $('toast'), countdown = $('countdown');
const island = $('island'), islandTime = $('island-time'), islandClose = $('island-close');

let timerInt = null, timerSec = 0;

// ── Utils ──
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const ds = (y,m,d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const addD = (s,n) => { const [y,m,d]=s.split('-').map(Number); const dt=new Date(y,m-1,d+n); return ds(dt.getFullYear(),dt.getMonth()+1,dt.getDate()); };
const fmtD = s => { const [,m,d]=s.split('-').map(Number); return `${d} ${MONTHS[m-1]}`; };
const t2m = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const m2t = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const durH = (a,b) => !a||!b ? 0 : Math.max(0,(t2m(b)-t2m(a))/60);
const durS = (a,b) => { if(!a||!b) return '—'; const m=t2m(b)-t2m(a); if(m<=0) return '—'; const h=Math.floor(m/60),r=m%60; return h===0?`${r}min`:r===0?`${h}h`:`${h}h${String(r).padStart(2,'0')}`; };
const today = () => { const n=new Date(); return ds(n.getFullYear(),n.getMonth()+1,n.getDate()); };
const period = s => { if(OFF.includes(s)) return 'off'; if(s>=VAC_START && s<=VAC_END) return 'vacances'; return 'scolaire'; };

function tpl(p,dk) {
  if(p==='off') return [];
  const t = p==='vacances' ? TPL.vacances : TPL.scolaire;
  return (t[dk]||[]).map(x => ({id:uid(),type:x.t,startTime:x.s,endTime:x.e,description:'',status:'pending',rescheduled:false}));
}

function wkPeriod(w) {
  const ps = new Set();
  DAYS_KEY.forEach(k => { const p=w.days[k].period; if(p!=='off') ps.add(p); });
  if(ps.has('vacances')&&ps.has('scolaire')) return 'Mixte';
  if(ps.has('vacances')) return '🏖️ Vacances';
  return '📚 Scolaire';
}

// ── Data ──
function gen() {
  const r=[]; let m=MON1;
  for(let i=0;i<WEEKS;i++){
    const w={startDate:m,endDate:addD(m,6),days:{}};
    DAYS_KEY.forEach((k,j)=>{const d=addD(m,j);const p=period(d);w.days[k]={date:d,period:p,slots:tpl(p,k)};});
    r.push(w); m=addD(m,7);
  }
  return r;
}

function load() {
  try { const s=localStorage.getItem(SK); if(s){const p=JSON.parse(s); if(p&&p.wks&&p.wks.length===WEEKS){wks=p.wks;ci=p.ci||0;return;}} } catch(e){}
  wks=gen(); ci=findCi();
}

function save() { try{localStorage.setItem(SK,JSON.stringify({wks,ci}));}catch(e){} }
function findCi() { const t=today(); for(let i=0;i<wks.length;i++) if(t>=wks[i].startDate&&t<=wks[i].endDate) return i; return 0; }

// ── Auto reschedule (triggered when user marks a slot as skipped) ──
function rescheduleSlot(sl, fromDate) {
  const td = today();
  const dur = t2m(sl.endTime) - t2m(sl.startTime);
  if(dur <= 0) return;
  const tgt = findDay(td, dur); if(!tgt) return;
  const ft = findFree(tgt, dur); if(!ft) return;
  tgt.slots.push({
    id: uid(), type: sl.type,
    description: sl.description ? `${sl.description} (rattrapage)` : `Rattrapage du ${fmtD(fromDate)}`,
    startTime: ft, endTime: m2t(t2m(ft) + dur),
    status: 'pending', rescheduled: true
  });
  tgt.slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  save();
  showToast('🔄 Créneau rééquilibré automatiquement');
}

function findDay(td,dur){
  for(const w of wks) for(const k of DAYS_KEY){
    const d=w.days[k]; if(d.date<td||d.period==='off') continue;
    const tot=d.slots.reduce((s,sl)=>s+Math.max(0,t2m(sl.endTime)-t2m(sl.startTime)),0);
    if(tot+dur<=420) return d;
  } return null;
}

function findFree(day,dur){
  const sorted=[...day.slots].sort((a,b)=>a.startTime.localeCompare(b.startTime));
  let c=480;
  for(const s of sorted){const ss=t2m(s.startTime),se=t2m(s.endTime);if(ss-c>=dur) return m2t(c);c=Math.max(c,se);}
  if(1320-c>=dur) return m2t(c); return null;
}

// ── Tabs ──
function switchTab(t){
  tab=t;
  tPlan.classList.toggle('active',t==='planning');
  tSuivi.classList.toggle('active',t==='suivi');
  tGraph.classList.toggle('active',t==='graph');
  secPlan.style.display=t==='planning'?'block':'none';
  secSuivi.style.display=t==='suivi'?'block':'none';
  secGraph.style.display=t==='graph'?'block':'none';
  if(t==='suivi') renderSuivi();
  if(t==='graph') renderGraph();
}

// ── Render Planning ──
function renderAll(){renderNav();renderDots();renderStats();renderGrid();}

function renderNav(){
  const w=wks[ci];
  const sm=+w.startDate.split('-')[1]-1, em=+w.endDate.split('-')[1]-1;
  const sd=+w.startDate.split('-')[2], ed=+w.endDate.split('-')[2];
  
  let done=0, tot=0;
  DAYS_KEY.forEach(k=>{w.days[k].slots.forEach(s=>{ if(s.status==='done') done++; tot++; });});
  const pct = tot ? Math.round((done/tot)*100) : 0;
  
  wkLabel.textContent = sm===em ? `${sd} – ${ed} ${MONTHS[sm]}` : `${sd} ${MONTHS[sm]} – ${ed} ${MONTHS[em]}`;
  wkBadge.textContent = wkPeriod(w);
  wkCounter.textContent = `S${ci+1}/${WEEKS} · ${pct}%`;
  btnP.disabled=ci===0; btnN.disabled=ci===wks.length-1;
}

function renderDots(){
  dots.innerHTML='';
  for(let i=0;i<wks.length;i++){
    const d=document.createElement('button');d.className=`dot${i===ci?' active':''}`;
    d.addEventListener('click',()=>go(i)); dots.appendChild(d);
  }
}

function renderStats(){
  const w=wks[ci]; let rev=0,spt=0,done=0,skip=0,tot=0;
  DAYS_KEY.forEach(k=>{w.days[k].slots.forEach(s=>{
    const h=durH(s.startTime,s.endTime); s.type==='sport'?spt+=h:rev+=h;
    if(s.status==='done') done++; if(s.status==='skipped') skip++; tot++;
  });});
  stats.innerHTML=`
    <div class="stats__card glass-subtle"><span class="stats__val">${rev.toFixed(1).replace('.0','')}h</span><span class="stats__lbl">Révisions</span></div>
    <div class="stats__card glass-subtle"><span class="stats__val">${spt.toFixed(1).replace('.0','')}h</span><span class="stats__lbl">Sport</span></div>
    <div class="stats__card glass-subtle"><span class="stats__val">${done}</span><span class="stats__lbl">✅ Fait</span></div>
    <div class="stats__card glass-subtle"><span class="stats__val">${skip}</span><span class="stats__lbl">❌ Manqué</span></div>`;
}

function renderGrid(){
  const w=wks[ci], td=today();
  grid.innerHTML=''; grid.classList.remove('anim'); void grid.offsetWidth; grid.classList.add('anim');

  DAYS_KEY.forEach((k,idx)=>{
    const day=w.days[k], isToday=day.date===td, isOff=day.period==='off';
    const hasSport=day.slots.some(s=>s.type==='sport');
    const doneC=day.slots.filter(s=>s.status==='done').length, totC=day.slots.length;
    const pct=totC?doneC/totC*100:0;
    let totalH=0; day.slots.forEach(s=>totalH+=durH(s.startTime,s.endTime));

    const card=document.createElement('div');
    card.className=`card glass${isToday?' today':''}${isOff?' off':''}`;

    let slotsHTML='';
    if(!day.slots.length){
      slotsHTML=`<div class="card__empty">${isOff?'Jour OFF':'Aucun créneau'}</div>`;
    } else {
      slotsHTML=day.slots.map((sl,si)=>{
        const sb=SUBJ[sl.type]||SUBJ.autre, dur=durS(sl.startTime,sl.endTime);
        const isDone=sl.status==='done', isSkip=sl.status==='skipped';
        const checkDoneClass=isDone?' active':'';
        const checkSkipClass=isSkip?' active':'';
        const slotClass=isDone?' is-done':isSkip?' is-skipped':'';
        const rBadge=sl.rescheduled?'<span class="slot__reschedule">rattrapage</span>':'';
        const dMins = Math.max(0, t2m(sl.endTime) - t2m(sl.startTime));
        return `<div class="slot${slotClass}">
          <button class="slot__btn slot__btn--done${checkDoneClass}" data-w="${ci}" data-d="${k}" data-s="${si}" data-a="done">✔️</button>
          <div class="slot__icon">${sb.i}</div>
          <div class="slot__body">
            <div class="slot__subj">${sb.l}${rBadge}</div>
            ${sl.description?`<div class="slot__desc">${sl.description}</div>`:''}
            <div class="slot__time">${sl.startTime} – ${sl.endTime}</div>
          </div>
          <div class="slot__dur">${dur}</div>
          <div class="slot__actions">
            <button class="slot__btn slot__btn--skip${checkSkipClass}" data-w="${ci}" data-d="${k}" data-s="${si}" data-a="skip">❌</button>
            <button class="slot__act play" data-d="${k}" data-s="${si}" data-a="play" data-mins="${dMins}">▶</button>
            <button class="slot__act" data-d="${k}" data-s="${si}" data-a="edit">✏️</button>
            <button class="slot__act del" data-d="${k}" data-s="${si}" data-a="del">🗑️</button>
          </div>
        </div>`;
      }).join('');
    }

    card.innerHTML=`
      <div class="card__head">
        <div>
          <div class="card__name">${DAYS_FR[idx]}${isToday?'<span class="chip chip--today">Aujourd\'hui</span>':''}</div>
          <div class="card__date">${fmtD(day.date)}</div>
        </div>
        ${isOff?'<span class="chip chip--off">OFF</span>':''}
        ${hasSport&&!isOff?'<span class="chip chip--sport">🏋️ Sport</span>':''}
      </div>
      <div class="card__slots">${slotsHTML}</div>
      <button class="card__add" data-d="${k}">+ Ajouter</button>
      <div class="card__foot">
        <div class="pbar"><div class="pbar__fill" style="width:${pct}%"></div></div>
        <div class="card__total"><b>${totalH.toFixed(1).replace('.0','')}h</b> · ${doneC}/${totC}</div>
      </div>`;

    grid.appendChild(card);
  });

  // Events
  grid.querySelectorAll('.slot__btn').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation(); setStatus(+b.dataset.w,b.dataset.d,+b.dataset.s, b.dataset.a);
  }));
  grid.querySelectorAll('.slot__act').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    if(b.dataset.a==='edit') openEdit(ci,b.dataset.d,+b.dataset.s);
    else if(b.dataset.a==='play') startTimer(parseInt(b.dataset.mins) || 25);
    else delSlot(ci,b.dataset.d,+b.dataset.s);
  }));
  grid.querySelectorAll('.card__add').forEach(b=>b.addEventListener('click',()=>openAdd(ci,b.dataset.d)));
}

// ── State Setter: Done or Skipped ──
// When marked as skipped (❌), auto-reschedule to next free slot
function setStatus(wi,dk,si,action){
  const sl=wks[wi].days[dk].slots[si]; if(!sl) return;
  const day=wks[wi].days[dk];
  
  if (action === 'done') {
    sl.status = (sl.status === 'done') ? 'pending' : 'done';
    if(sl.status === 'done') fireConfetti();
  } else if (action === 'skip') {
    const wasPending = sl.status !== 'skipped';
    sl.status = (sl.status === 'skipped') ? 'pending' : 'skipped';
    if (sl.status === 'skipped' && sl.type !== 'sport' && wasPending) {
      rescheduleSlot(sl, day.date);
    }
  }
  
  save(); renderStats(); renderGrid();
}

function fireConfetti() {
  const colors = ['#34C759', '#007AFF', '#FF3B30', '#FFCCEA', '#AACCFF'];
  for(let i=0; i<35; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.left = Math.random() * 100 + 'vw';
    conf.style.background = colors[Math.floor(Math.random()*colors.length)];
    conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
    conf.style.animationDelay = (Math.random() * 0.5) + 's';
    const s = Math.random() * 8 + 6;
    conf.style.width = s + 'px';
    conf.style.height = (s * 1.5) + 'px';
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 4000);
  }
}

function startTimer(min) {
  if(timerInt) clearInterval(timerInt);
  timerSec = min * 60;
  island.classList.add('active');
  playTimer();
  timerInt = setInterval(playTimer, 1000);
}
function playTimer() {
  if(timerSec <= 0) { clearInterval(timerInt); islandTime.textContent = 'Terminé!'; return; }
  timerSec--;
  const m = Math.floor(timerSec/60), s = timerSec%60;
  islandTime.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ── Navigation ──
function go(i){if(i<0||i>=wks.length) return; ci=i; save(); renderAll();}

// ── Modal ──
function openAdd(wi,dk){
  mMode='add'; mWi=wi; mDk=dk; mSi=-1;
  mTitle.textContent='Nouveau créneau';
  mSubj.value='francais'; mDesc.value='';
  mStart.value='10:00'; mEnd.value='11:30';
  mDel.style.display='none'; updDur(); openM();
}

function openEdit(wi,dk,si){
  const sl=wks[wi].days[dk].slots[si]; if(!sl) return;
  mMode='edit'; mWi=wi; mDk=dk; mSi=si;
  mTitle.textContent='Modifier le créneau';
  mSubj.value=sl.type; mDesc.value=sl.description||'';
  mStart.value=sl.startTime; mEnd.value=sl.endTime;
  mDel.style.display='inline-flex'; updDur(); openM();
}

function openM(){mbg.classList.add('open');modal.classList.add('open');document.body.style.overflow='hidden';}
function closeM(){mbg.classList.remove('open');modal.classList.remove('open');document.body.style.overflow='';}

function saveM(){
  const t=mSubj.value, d=mDesc.value.trim(), s=mStart.value, e=mEnd.value;
  if(!s||!e||s>=e){mDur.innerHTML='Durée : <span style="color:var(--red)">Invalide</span>';return;}
  const day=wks[mWi].days[mDk];
  if(mMode==='add'){
    day.slots.push({id:uid(),type:t,description:d,startTime:s,endTime:e,status:'pending',rescheduled:false});
  } else {
    const sl=day.slots[mSi]; sl.type=t; sl.description=d; sl.startTime=s; sl.endTime=e;
  }
  day.slots.sort((a,b)=>a.startTime.localeCompare(b.startTime));
  closeM(); save(); renderStats(); renderGrid();
}

function delSlot(wi,dk,si){
  const day=wks[wi].days[dk], sl=day.slots[si]; if(!sl) return;
  if(!confirm(`Supprimer "${(SUBJ[sl.type]||SUBJ.autre).l}" ?`)) return;
  day.slots.splice(si,1); save(); renderStats(); renderGrid();
}

function delFromM(){
  if(mMode!=='edit'||mSi<0) return;
  if(!confirm('Supprimer ce créneau ?')) return;
  wks[mWi].days[mDk].slots.splice(mSi,1); closeM(); save(); renderStats(); renderGrid();
}

function updDur(){
  const d=durS(mStart.value,mEnd.value);
  const inv=mStart.value&&mEnd.value&&mStart.value>=mEnd.value;
  mDur.innerHTML=inv?'Durée : <span style="color:var(--red)">Invalide</span>':`Durée : <span>${d}</span>`;
}

// ── Reset ──
function resetWk(){
  if(!confirm('Réinitialiser cette semaine ?')) return;
  DAYS_KEY.forEach(k=>{const d=wks[ci].days[k],p=period(d.date);d.period=p;d.slots=tpl(p,k);});
  save(); renderAll(); showToast('Semaine réinitialisée');
}

// ── Suivi ──
function renderSuivi(){
  const td=today();
  const doneItems=[], skipItems=[];

  for(let wi=0;wi<wks.length;wi++){
    const w=wks[wi];
    DAYS_KEY.forEach((k,di)=>{
      const day=w.days[k];
      day.slots.forEach(sl=>{
        const sb=SUBJ[sl.type]||SUBJ.autre;
        const item={subj:sb,sl,day,dayName:DAYS_SHORT[di],weekLabel:`S${wi+1}`};
        if(sl.status==='done') doneItems.push(item);
        else if(sl.status==='skipped'||(sl.status==='pending'&&day.date<td&&sl.type!=='sport')) skipItems.push(item);
      });
    });
  }

  // Done section
  suiviDone.innerHTML=`<div class="suivi__heading suivi__heading--done">✅ Créneaux réalisés (${doneItems.length})</div>`;
  if(doneItems.length){
    const g=document.createElement('div'); g.className='suivi__group glass';
    doneItems.forEach(({subj,sl,day,dayName})=>{
      const el=document.createElement('div'); el.className='suivi__item is-done';
      el.innerHTML=`
        <div class="suivi__dot suivi__dot--done">✓</div>
        <div class="suivi__info">
          <div class="suivi__subj">${subj.i} ${subj.l}${sl.rescheduled?'<span class="slot__reschedule">rattrapage</span>':''}</div>
          ${sl.description?`<div class="suivi__desc">${sl.description}</div>`:''}
          <div class="suivi__meta">${dayName} ${fmtD(day.date)} · ${sl.startTime}–${sl.endTime} · ${durS(sl.startTime,sl.endTime)}</div>
        </div>`;
      g.appendChild(el);
    });
    suiviDone.appendChild(g);
  } else { suiviDone.innerHTML+=`<div class="suivi__empty glass-subtle">Aucun créneau réalisé pour le moment</div>`; }

  // Skipped section
  suiviSkip.innerHTML=`<div class="suivi__heading suivi__heading--skip">❌ Créneaux non réalisés (${skipItems.length})</div>`;
  if(skipItems.length){
    const g=document.createElement('div'); g.className='suivi__group glass';
    skipItems.forEach(({subj,sl,day,dayName})=>{
      const el=document.createElement('div'); el.className='suivi__item';
      el.innerHTML=`
        <div class="suivi__dot suivi__dot--skip">✕</div>
        <div class="suivi__info">
          <div class="suivi__subj">${subj.i} ${subj.l}</div>
          ${sl.description?`<div class="suivi__desc">${sl.description}</div>`:''}
          <div class="suivi__meta">${dayName} ${fmtD(day.date)} · ${sl.startTime}–${sl.endTime} · ${durS(sl.startTime,sl.endTime)}</div>
        </div>`;
      g.appendChild(el);
    });
    suiviSkip.appendChild(g);
  } else { suiviSkip.innerHTML+=`<div class="suivi__empty glass-subtle">Tous les créneaux ont été réalisés 🎉</div>`; }
}

// ── Graphiques ──
function renderGraph(){
  const w=wks[ci];
  
  // Storage Bar (Subject Breakdown)
  const bMap = {}; let tM = 0;
  DAYS_KEY.forEach(k => w.days[k].slots.forEach(s => {
    const m = Math.max(0, t2m(s.endTime) - t2m(s.startTime));
    if(!bMap[s.type]) bMap[s.type] = {m:0, sb:SUBJ[s.type]||SUBJ.autre};
    bMap[s.type].m += m; tM += m;
  }));
  const cols = ['#34C759','#007AFF','#FF9500','#AF52DE','#FF2D55','#FFCC00','#8E8E93'];
  let sg = '<div class="storage"><div class="storage__title">Répartition Hebdomadaire <span>Semaine '+ (ci+1) +'</span></div><div class="storage__bar">';
  let lg = '<div class="storage__legend">';
  Object.values(bMap).sort((a,b)=>b.m-a.m).forEach((b,i) => {
    if(b.m===0) return;
    const pct = (b.m/tM)*100; const c = cols[i%cols.length];
    sg += `<div class="storage__segment" style="width:${pct}%;background:${c};"></div>`;
    lg += `<div class="storage__item"><div class="storage__dot" style="background:${c}"></div>${b.sb.l} (${Math.round(pct)}%)</div>`;
  });
  sg += '</div>' + lg + '</div></div>';

  let html = sg + `<div class="suivi__heading">📈 Progression journalière (Semaine ${ci+1})</div><div class="chart glass">`;
  DAYS_KEY.forEach((k, idx)=>{
    const slots = w.days[k].slots;
    const tot = slots.length;
    const done = slots.filter(s=>s.status==='done').length;
    const pct = tot ? Math.round((done/tot)*100) : 0;
    const h = pct + '%';
    const cClass = pct===100 && tot>0 ? ' chart__bar--100' : '';
    html += `
      <div class="chart__col">
        <div class="chart__pct">${pct}%</div>
        <div class="chart__bar-bg"><div class="chart__bar${cClass}" style="height:${h}"></div></div>
        <div class="chart__lbl">${DAYS_SHORT[idx]}</div>
      </div>
    `;
  });
  html += `</div>`;
  secGraph.innerHTML = html;
}

// ── Rules ──
function renderRules(){
  rules.innerHTML='';
  RULES.forEach(r=>{
    const c=document.createElement('div'); c.className='rcard glass-subtle';
    c.innerHTML=`
      <div class="rcard__head"><div class="rcard__left"><span class="rcard__icon">${r.i}</span><span class="rcard__label">${r.l}</span></div><span class="rcard__arrow">▼</span></div>
      <div class="rcard__body"><ul>${r.items.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
    c.querySelector('.rcard__head').addEventListener('click',()=>{
      c.querySelector('.rcard__body').classList.toggle('open');
      c.querySelector('.rcard__arrow').classList.toggle('open');
    });
    rules.appendChild(c);
  });
}

// ── Toast ──
function showToast(m){toastEl.textContent=m;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),3000);}

// ── Events ──
function setup(){
  btnP.addEventListener('click',()=>go(ci-1));
  btnN.addEventListener('click',()=>go(ci+1));
  btnR.addEventListener('click',resetWk);
  tPlan.addEventListener('click',()=>switchTab('planning'));
  tSuivi.addEventListener('click',()=>switchTab('suivi'));
  tGraph.addEventListener('click',()=>switchTab('graph'));
  mbg.addEventListener('click',closeM); mX.addEventListener('click',closeM);
  mCancel.addEventListener('click',closeM); mSave.addEventListener('click',saveM);
  mDel.addEventListener('click',delFromM);
  mStart.addEventListener('input',updDur); mEnd.addEventListener('input',updDur);
  
  islandClose.addEventListener('click', () => { clearInterval(timerInt); island.classList.remove('active'); });

  $('export-img').addEventListener('click', () => {
    if(!window.html2canvas) return showToast('Erreur chargement export');
    showToast('Préparation de l\'image...');
    html2canvas(document.body, { backgroundColor: '#F2F2F7', scale: 2 }).then(canvas => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `planning_S${ci+1}.png`;
      a.click();
      showToast('Image sauvegardée !');
    });
  });

  document.addEventListener('keydown',e=>{
    if(modal.classList.contains('open')){if(e.key==='Escape') closeM(); return;}
    if(tab==='planning'){if(e.key==='ArrowLeft') go(ci-1); if(e.key==='ArrowRight') go(ci+1);}
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded',()=>{
  load(); setup(); renderAll(); renderRules();
  
  // Custom J-X Countdown
  const xM = new Date('2026-06-11T00:00:00');
  const dDiff = Math.ceil((xM - new Date()) / (1000*60*60*24));
  countdown.innerHTML = dDiff > 0 ? `⏳ J-${dDiff} avant l'Examen` : `🎉 C'est le jour J !`;

  // Init PWA Service Worker
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(console.error);
});
