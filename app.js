'use strict';
/* ========= CONFIGURACIÓN (ajustable con el personal de Ore Control) ========= */
const LITO = [
  [13,'Diorita'],[14,'Diorita c/ley'],[30,'Hornfels Fm. Mara'],[31,'Hornfels Fm. Mara c/ley'],
  [32,'Caliza-Mármol Fm. Ferrobamba'],[40,'Skarn'],[49,'Brecha Polimíctica'],[65,'Stockwork Monzonita'],
  [68,'Stockwork Sedimentarios'],[78,'Dique Dacita'],[80,'Dique Monzonita'],[98,'Dique Brecha'],
  [85,'Monzonita Sur Mralz.'],[88,'Monzonita Sur Barren'],[99,'Cuaternario Aluvial'],
  [100,'Volcánico Barroso'],[101,'Toba Volcánica'],[103,'Lahar']
].map(([c,n])=>({v:String(c),t:c+' · '+n}));

const FIELDS = [
  {k:'estado',  l:'Estado del taladro', type:'chips', req:true, opts:['Logueado','No accesible','Tapado','Caído','No perforado']},
  {k:'lito',    l:'Litología', type:'select', opts:LITO, only:'Logueado'},
  {k:'lito2',   l:'Litología secundaria', type:'select', opts:LITO, only:'Logueado'},
  {k:'alter',   l:'Alteración', type:'chips', only:'Logueado',
     opts:['Sin alteración','Potásica','Propilítica','Fílica','Argílica','Silicificación','Skarn','Otra']},
  {k:'mineral', l:'Mineralización', type:'multi', only:'Logueado',
     opts:['Calcopirita','Bornita','Calcosina','Pirita','Molibdenita','Malaquita','Crisocola','Óx. Fe']},
  {k:'intens',  l:'Intensidad mineralización', type:'chips', only:'Logueado', opts:['Nula','Baja','Media','Alta']},
  {k:'dureza',  l:'Dureza', type:'chips', only:'Logueado', opts:['R0','R1','R2','R3','R4','R5','R6']},
  {k:'fractura',l:'Fracturamiento', type:'chips', only:'Logueado', opts:['Bajo','Medio','Alto']},
  {k:'humedad', l:'Humedad', type:'chips', only:'Logueado', opts:['Seco','Húmedo','Saturado']},
  {k:'contacto',l:'Contacto litológico', type:'chips', only:'Logueado', opts:['No','Sí']},
  {k:'contacto_m',l:'Prof. del contacto (m)', type:'num', only:'Logueado', needs:['contacto','Sí']},
  {k:'prof',    l:'Profundidad real (m)', type:'num', only:'Logueado'},
  {k:'obs',     l:'Observaciones', type:'text'}
];
/* ============================================================================ */

const $ = s => document.querySelector(s);

/* ---------- iconos (SVG propios, trazo 2px) ---------- */
const AUTOR={nombre:'nrgarridoa',url:'https://github.com/nrgarridoa',repo:'https://github.com/nrgarridoa/logueo-blastholes'};
const VERSION='1.5';
const IC={
  layers:'<path d="M12 3 3 8l9 5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
  file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h6"/>',
  upload:'<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 15v5h16v-5"/>',
  download:'<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
  sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  locate:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  next:'<path d="M5 5v14l10-7z"/><path d="M19 5v14"/>',
  left:'<path d="m15 5-7 7 7 7"/>',
  right:'<path d="m9 5 7 7-7 7"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  check:'<path d="m5 12 5 5 9-10"/>',
  history:'<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/><path d="M12 8v4l3 2"/>',
  pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  clipboard:'<rect x="6" y="5" width="12" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4"/>',
};
function hydrate(root=document){ root.querySelectorAll('[data-ic]').forEach(el=>{
  if(el.firstChild) return; el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(IC[el.dataset.ic]||'')+'</svg>'; }); }
const cv = $('#map'), ctx = cv.getContext('2d');
const S = { proj:null, holes:[], logs:new Map(), sel:null, draft:{}, view:{cx:0,cy:0,k:1},
            gps:null, watch:null, near:null, last:null, bounds:null, fitK:1, order:[], wake:null, cfg:{user:'',zone:19,hemi:'S',dE:0,dN:0}, cssv:{} };

/* ---------- IndexedDB mínimo ---------- */
let db;
const idb = {
  open(){ return new Promise((res,rej)=>{
    const r = indexedDB.open('logueo-bh',1);
    r.onupgradeneeded = e => { const d=e.target.result;
      d.createObjectStore('projects',{keyPath:'name'});
      d.createObjectStore('logs',{keyPath:'key'}).createIndex('proj','proj');
      d.createObjectStore('photos',{keyPath:'id',autoIncrement:true}).createIndex('key','key'); };
    r.onsuccess = ()=>{db=r.result;res()}; r.onerror = ()=>rej(r.error); }); },
  tx(st,mode='readonly'){ return db.transaction(st,mode); },
  req(r){ return new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}); },
  all(st,idx,q){ const s=this.tx(st).objectStore(st); return this.req((idx?s.index(idx):s).getAll(q)); },
  get(st,k){ return this.req(this.tx(st).objectStore(st).get(k)); },
  put(st,v){ return this.req(this.tx(st,'readwrite').objectStore(st).put(v)); },
  del(st,k){ return this.req(this.tx(st,'readwrite').objectStore(st).delete(k)); },
};

/* ---------- utilidades ---------- */
function toast(m,ms=2200){ const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),ms); }
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function loadCfg(){ try{ Object.assign(S.cfg, JSON.parse(localStorage.getItem('cfg')||'{}')); }catch{} }
function saveCfg(){ try{ localStorage.setItem('cfg',JSON.stringify(S.cfg)); }catch{} }

/* ---------- lat/lon -> UTM (WGS84) ---------- */
function toUTM(lat,lon,zone){
  const a=6378137, f=1/298.257223563, k0=0.9996, e2=f*(2-f), ep2=e2/(1-e2), r=Math.PI/180;
  const p=lat*r, l=lon*r, l0=((zone-1)*6-180+3)*r;
  const N=a/Math.sqrt(1-e2*Math.sin(p)**2), T=Math.tan(p)**2, C=ep2*Math.cos(p)**2, A=(l-l0)*Math.cos(p);
  const e4=e2*e2, e6=e4*e2;
  const M=a*((1-e2/4-3*e4/64-5*e6/256)*p-(3*e2/8+3*e4/32+45*e6/1024)*Math.sin(2*p)
        +(15*e4/256+45*e6/1024)*Math.sin(4*p)-(35*e6/3072)*Math.sin(6*p));
  const E=k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep2)*A**5/120)+500000;
  let Nn=k0*(M+N*Math.tan(p)*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep2)*A**6/720));
  if(lat<0) Nn+=10000000;
  return {E,N:Nn};
}
const gpsEN = () => S.gps ? (()=>{const u=toUTM(S.gps.lat,S.gps.lon,S.cfg.zone);
  return {E:u.E+S.cfg.dE,N:u.N+S.cfg.dN};})() : null;

/* ---------- CSV ---------- */
function parseCSV(txt){
  const rows = txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
    .map(l=>l.split(l.includes(';')&&!l.includes(',')?';':',').map(x=>x.trim().replace(/^"|"$/g,'')));
  const num = x => parseFloat(String(x).replace(',','.'));
  const holes=[];
  for(const r of rows){
    if(r.length<3) continue;
    const a=num(r[1]), b=num(r[2]);
    if(!isFinite(a)||!isFinite(b)) continue;      // cabecera u otra fila
    // el valor ~8e6 es el Norte, ~2e5-8e5 el Este (en Perú sur)
    const N=Math.max(a,b)>1e6?Math.max(a,b):a, E=Math.max(a,b)>1e6?Math.min(a,b):b;
    holes.push({id:r[0],E,N,Z:num(r[3]),proj:r[4]||''});
  }
  return holes;
}

/* ---------- proyectos ---------- */
async function refreshProjects(sel){
  const ps = await idb.all('projects');
  if(!ps.length){ S.proj=null; S.holes=[]; S.logs=new Map(); S.order=[]; S.bounds=null; $('#sheet').hidden=true; draw(); updateProgress(); return; }
  ps.sort((a,b)=>a.name.localeCompare(b.name));
  let want = sel && ps.find(p=>p.name===sel) ? sel : null;
  if(!want){ let last=''; try{ last=localStorage.getItem('proj')||''; }catch{} want=ps.find(p=>p.name===last)?last:ps[0].name; }
  await openProject(want);
}
async function openProject(name){
  const p=await idb.get('projects',name); if(!p) return;
  S.proj=name; S.holes=p.holes; S.order=[...p.holes].sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true})); S.sel=null; $('#sheet').hidden=true;
  try{localStorage.setItem('proj',name)}catch{}
  S.logs=new Map((await idb.all('logs','proj',name)).map(l=>[l.key,l]));
  fitView(); draw(); updateProgress();
}
function updateProgress(){
  const n=S.holes.length, done=[...S.logs.values()].filter(l=>l.estado).length, pct=n?Math.round(done*100/n):0;
  $('#projName').textContent=S.proj||'Sin proyecto';
  $('#projPct').textContent=n?`${done}/${n}`:'';
  $('#bar i').style.width=pct+'%';
  $('#empty').style.display = n?'none':'flex';
  $('main').classList.toggle('noproj',!n);
}

/* ---------- mapa ---------- */
function fitView(){
  if(!S.holes.length) return;
  const E=S.holes.map(h=>h.E),N=S.holes.map(h=>h.N);
  const minE=Math.min(...E),maxE=Math.max(...E),minN=Math.min(...N),maxN=Math.max(...N);
  const w=cv.clientWidth||400,h=cv.clientHeight||400,pad=50;
  S.view.k=Math.min((w-pad*2)/Math.max(maxE-minE,10),(h-pad*2)/Math.max(maxN-minN,10));
  S.view.cx=(minE+maxE)/2; S.view.cy=(minN+maxN)/2;
  S.bounds={minE,maxE,minN,maxN}; S.fitK=S.view.k;
}
function clampView(){
  const b=S.bounds; if(!b) return; const m=40;
  S.view.cx=Math.min(Math.max(S.view.cx,b.minE-m),b.maxE+m);
  S.view.cy=Math.min(Math.max(S.view.cy,b.minN-m),b.maxN+m);
  S.view.k=Math.min(60,Math.max(S.fitK*0.5,S.view.k));
}
const w2s=(E,N)=>[(E-S.view.cx)*S.view.k+cv.clientWidth/2,(S.view.cy-N)*S.view.k+cv.clientHeight/2];
const s2w=(x,y)=>[(x-cv.clientWidth/2)/S.view.k+S.view.cx,S.view.cy-(y-cv.clientHeight/2)/S.view.k];
function resize(){ const d=devicePixelRatio||1;
  cv.width=cv.clientWidth*d; cv.height=cv.clientHeight*d; ctx.setTransform(d,0,0,d,0,0); draw(); }
function cssv(){ const s=getComputedStyle(document.documentElement);
  ['pend','ok','obs','sel','lbl','mapbg','grid','halo','dotline'].forEach(k=>S.cssv[k]=s.getPropertyValue('--'+k).trim()); }
function colorFor(h){ const l=S.logs.get(S.proj+'|'+h.id);
  if(!l||!l.estado) return S.cssv.pend; return l.estado==='Logueado'?S.cssv.ok:S.cssv.obs; }

let raf=0; function draw(){ if(raf) return; raf=requestAnimationFrame(()=>{raf=0; clampView(); render();}); }
function render(){
  cssv(); const w=cv.clientWidth,h=cv.clientHeight; ctx.clearRect(0,0,w,h);
  if(!S.holes.length) return;
  // cuadrícula métrica de fondo
  const nice=[1,2,5,10,20,50,100,200,500,1000]; const gs=nice.find(v=>v*S.view.k>=36)||1000;
  const [w0,n0]=s2w(0,0),[w1,n1]=s2w(w,h);
  ctx.lineWidth=1; ctx.strokeStyle=S.cssv.grid; ctx.beginPath();
  for(let E=Math.ceil(w0/gs)*gs;E<=w1;E+=gs){ const [x]=w2s(E,0); ctx.moveTo(Math.round(x)+.5,0); ctx.lineTo(Math.round(x)+.5,h); }
  for(let N=Math.ceil(n1/gs)*gs;N<=n0;N+=gs){ const [,y]=w2s(0,N); ctx.moveTo(0,Math.round(y)+.5); ctx.lineTo(w,Math.round(y)+.5); }
  ctx.stroke();
  ctx.font='700 11px system-ui'; ctx.textBaseline='middle'; ctx.lineJoin='round';
  const rad=Math.min(9,Math.max(3.5,S.view.k*1.4)), placed=[], labels=[];
  for(const p of S.holes){
    const [x,y]=w2s(p.E,p.N); if(x<-30||y<-30||x>w+30||y>h+30) continue;
    if(S.sel===p.id){ ctx.beginPath(); ctx.arc(x,y,rad+7,0,7); ctx.fillStyle=S.cssv.sel+'55'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(x,y,rad,0,7); ctx.fillStyle=colorFor(p); ctx.fill();
    ctx.lineWidth=1.8; ctx.strokeStyle=S.sel===p.id?S.cssv.sel:S.cssv.dotline; ctx.stroke();
    labels.push([p,x,y]);
  }
  labels.sort((a,b)=>(b[0].id===S.sel)-(a[0].id===S.sel));
  for(const [p,x,y] of labels){
    const tw=ctx.measureText(p.id).width, bx=x+rad+2, by=y-6.5, bw=tw+4, bh=13;
    if(p.id!==S.sel && placed.some(r=>bx<r[0]+r[2]&&bx+bw>r[0]&&by<r[1]+r[3]&&by+bh>r[1])) continue;
    placed.push([bx,by,bw,bh]);
    ctx.lineWidth=3; ctx.strokeStyle=S.cssv.halo; ctx.strokeText(p.id,bx+2,by+bh/2);
    ctx.fillStyle=S.cssv.lbl; ctx.fillText(p.id,bx+2,by+bh/2);
  }
  const gp=gpsEN(), sh=S.sel&&S.holes.find(x=>x.id===S.sel);
  if(gp&&sh){ const [a,b]=w2s(gp.E,gp.N),[c,d]=w2s(sh.E,sh.N);
    ctx.setLineDash([6,5]); ctx.lineWidth=2; ctx.strokeStyle='#ef4444'; ctx.beginPath(); ctx.moveTo(a,b); ctx.lineTo(c,d); ctx.stroke(); ctx.setLineDash([]); }
  const g=gpsEN();
  if(g){ const [x,y]=w2s(g.E,g.N), acc=(S.gps.acc||5)*S.view.k;
    ctx.beginPath(); ctx.arc(x,y,Math.max(acc,9),0,7); ctx.fillStyle='#ef444422'; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,7.5,0,7); ctx.fillStyle='#ef4444'; ctx.fill();
    ctx.lineWidth=3; ctx.strokeStyle='#fff'; ctx.stroke(); }
  // escala y norte
  const m=nice.find(v=>v*S.view.k>=70)||1000, px=m*S.view.k, by=h-96;
  ctx.strokeStyle=S.cssv.lbl; ctx.fillStyle=S.cssv.lbl; ctx.lineWidth=2; ctx.font='700 12px system-ui';
  ctx.beginPath(); ctx.moveTo(14,by); ctx.lineTo(14+px,by); ctx.moveTo(14,by-5); ctx.lineTo(14,by+5); ctx.moveTo(14+px,by-5); ctx.lineTo(14+px,by+5); ctx.stroke();
  ctx.fillText(m+' m',18,by-11);
  ctx.beginPath(); ctx.moveTo(w-30,62); ctx.lineTo(w-38,88); ctx.lineTo(w-30,82); ctx.lineTo(w-22,88); ctx.closePath(); ctx.fill();
  ctx.fillText('N',w-35,100);
}
function nearestTo(E,N,maxM=Infinity){ let best=null,bd=maxM;
  for(const p of S.holes){ const d=Math.hypot(p.E-E,p.N-N); if(d<bd){bd=d;best=p;} }
  return best?{h:best,d:bd}:null; }

/* gestos: arrastrar, pellizcar, rueda, tap */
const ptrs=new Map(); let moved=0,startPt=null,pinch=0;
cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===1){moved=0;startPt=[e.clientX,e.clientY];} pinch=0; });
cv.addEventListener('pointermove',e=>{ if(!ptrs.has(e.pointerId)) return;
  const prev=ptrs.get(e.pointerId); ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===1){ const dx=e.clientX-prev[0],dy=e.clientY-prev[1]; moved+=Math.abs(dx)+Math.abs(dy);
    S.view.cx-=dx/S.view.k; S.view.cy+=dy/S.view.k; draw(); }
  else if(ptrs.size===2){ moved+=99; const [a,b]=[...ptrs.values()]; const d=Math.hypot(a[0]-b[0],a[1]-b[1]);
    if(pinch){ zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,d/pinch); } pinch=d; } });
const up=e=>{ const was=ptrs.has(e.pointerId); ptrs.delete(e.pointerId);
  if(was&&ptrs.size===0&&moved<8&&e.type==='pointerup'){ tap(e.clientX,e.clientY); } pinch=0; };
cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.offsetX,e.offsetY,e.deltaY<0?1.2:1/1.2)},{passive:false});
function zoomAt(x,y,f){ const [E,N]=s2w(x,y); S.view.k=S.view.k*f;
  const [x2,y2]=w2s(E,N); S.view.cx+=(x2-x)/S.view.k; S.view.cy-=(y2-y)/S.view.k; draw(); }
function tap(cx,cy){ const r=cv.getBoundingClientRect(),[E,N]=s2w(cx-r.left,cy-r.top);
  const n=nearestTo(E,N); if(n&&n.d*S.view.k<28) openHole(n.h); }

/* ---------- formulario ---------- */
async function openHole(h){
  S.sel=h.id; const key=S.proj+'|'+h.id;
  S.draft = {...(S.logs.get(key)||{})}; renderForm(); await renderThumbs();
  const g=gpsEN(), d=g?Math.hypot(g.E-h.E,g.N-h.N):null;
  $('#holeTitle').textContent='Taladro '+h.id;
  $('#holeSub').textContent=` Cota ${isFinite(h.Z)?h.Z.toFixed(0):'-'}`+(d!=null?` · a ${d.toFixed(0)} m de ti`:'');
  $('#sheet').hidden=false; $('#sheet').scrollTop=0;
  S.view.cx=h.E; S.view.cy=h.N; if(S.view.k<3) S.view.k=3; draw();
}
function renderForm(){
  const f=$('#form'); f.innerHTML='';
  for(const fd of FIELDS){
    if(fd.only && S.draft.estado!==fd.only) continue;
    if(fd.needs && S.draft[fd.needs[0]]!==fd.needs[1]) continue;
    const box=document.createElement('div'); box.className='fld';
    box.innerHTML=`<label>${esc(fd.l)}${fd.req?' *':''}</label>`;
    const v=S.draft[fd.k];
    if(fd.type==='chips'||fd.type==='multi'){
      const c=document.createElement('div'); c.className='chips';
      const cur=fd.type==='multi'?(v||[]):[v];
      for(const o of fd.opts){ const b=document.createElement('button'); b.type='button';
        b.className='chip'+(cur.includes(o)?' on':''); b.textContent=o;
        b.onclick=()=>{ if(fd.type==='multi'){ const a=new Set(S.draft[fd.k]||[]); a.has(o)?a.delete(o):a.add(o); S.draft[fd.k]=[...a]; }
          else S.draft[fd.k]= S.draft[fd.k]===o?'':o;
          renderForm(); };
        c.append(b); }
      box.append(c);
    } else if(fd.type==='select'){
      const s=document.createElement('select'); s.add(new Option('—',''));
      fd.opts.forEach(o=>s.add(new Option(o.t,o.v))); s.value=v||'';
      s.onchange=()=>S.draft[fd.k]=s.value; box.append(s);
    } else if(fd.type==='num'){
      const i=document.createElement('input'); i.type='number'; i.inputMode='decimal'; i.step='any'; i.value=v??'';
      i.oninput=()=>S.draft[fd.k]=i.value; box.append(i);
    } else {
      const t=document.createElement('textarea'); t.rows=2; t.value=v||''; t.oninput=()=>S.draft[fd.k]=t.value; box.append(t);
    }
    f.append(box);
  }
}
async function renderThumbs(){
  const box=$('#thumbs'); box.innerHTML='';
  const ph=await idb.all('photos','key',S.proj+'|'+S.sel);
  for(const p of ph){ const im=new Image(); im.src=URL.createObjectURL(p.blob);
    im.onclick=()=>{ if(confirm('¿Eliminar esta foto?')) idb.del('photos',p.id).then(renderThumbs); }; box.append(im); }
}
$('#btnPhoto').onclick=()=>$('#filePhoto').click();
$('#filePhoto').onchange=async e=>{
  for(const f of e.target.files){ const blob=await shrink(f); await idb.put('photos',{key:S.proj+'|'+S.sel,blob,ts:Date.now()}); }
  e.target.value=''; renderThumbs(); toast('Foto guardada');
};
function shrink(file,max=1280){ return new Promise(res=>{
  const im=new Image(); im.onload=()=>{ const k=Math.min(1,max/Math.max(im.width,im.height));
    const c=document.createElement('canvas'); c.width=im.width*k; c.height=im.height*k;
    c.getContext('2d').drawImage(im,0,0,c.width,c.height); c.toBlob(b=>res(b||file),'image/jpeg',0.8); URL.revokeObjectURL(im.src); };
  im.onerror=()=>res(file); im.src=URL.createObjectURL(file); }); }

$('#btnClose').onclick=()=>{ $('#sheet').hidden=true; S.sel=null; draw(); };
$('#btnSave').onclick=async()=>{
  if(!S.draft.estado){ toast('Elige el estado del taladro'); return; }
  const h=S.holes.find(x=>x.id===S.sel), g=gpsEN();
  const rec={...S.draft,key:S.proj+'|'+h.id,proj:S.proj,id:h.id,E:h.E,N:h.N,Z:h.Z,
    user:S.cfg.user,ts:new Date().toISOString(),
    gps_E:g?+g.E.toFixed(2):'',gps_N:g?+g.N.toFixed(2):'',gps_acc:S.gps?+(S.gps.acc||0).toFixed(1):'',
    gps_dist:g?+Math.hypot(g.E-h.E,g.N-h.N).toFixed(1):''};
  await idb.put('logs',rec); S.logs.set(rec.key,rec); S.last=rec;
  $('#sheet').hidden=true; S.sel=null; updateProgress(); draw(); toast('Taladro '+h.id+' guardado');
};
$('#btnCal').onclick=()=>{
  if(!S.gps){ toast('Activa el GPS (◎) primero'); return; }
  const h=S.holes.find(x=>x.id===S.sel); const u=toUTM(S.gps.lat,S.gps.lon,S.cfg.zone);
  if(!confirm(`¿Estás parado sobre el taladro ${h.id}? Se corregirá la posición GPS de todo el mapa.`)) return;
  S.cfg.dE=h.E-u.E; S.cfg.dN=h.N-u.N; saveCfg(); draw(); toast(`Calibrado (ΔE ${S.cfg.dE.toFixed(1)}, ΔN ${S.cfg.dN.toFixed(1)} m)`);
};

/* ---------- GPS ---------- */
$('#btnGps').onclick=()=>{
  if(!S.holes.length){ toast('Carga primero el CSV'); return; }
  if(!navigator.geolocation){ toast('Este equipo no tiene GPS'); return; }
  if(S.watch==null){
    S.watch=navigator.geolocation.watchPosition(p=>{
      S.gps={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy};
      gpsStatus(); draw(); },
      err=>{ toast('GPS: '+err.message); S.watch=null; },
      {enableHighAccuracy:true,maximumAge:2000,timeout:20000});
    toast('Buscando GPS…'); keepAwake();
  }
  const g=gpsEN(); if(g){ S.view.cx=g.E; S.view.cy=g.N; if(S.view.k<2) S.view.k=2; draw(); }
};
function gpsStatus(){
  const g=gpsEN(); const n=g&&nearestTo(g.E,g.N);
  $('#gpsInfo').innerHTML = n? `±${Math.round(S.gps.acc)} m · más cercano: <b>${esc(n.h.id)}</b> (${n.d.toFixed(0)} m)`:'';
  if(n){ S.near=n.h; }
}
$('#gpsInfo').onclick=()=>{ if(S.near) openHole(S.near); };

/* ---------- carga CSV ---------- */
$('#btnCsv').onclick=()=>$('#fileCsv').click();
$('#fileCsv').onchange=async e=>{
  const files=[...e.target.files]; e.target.value=''; if(!files.length) return;
  const groups=new Map();                                  // varios CSV, o un CSV con varios proyectos
  for(const f of files){ const base=f.name.replace(/\.\w+$/,'');
    for(const h of parseCSV(await f.text())){ const nm=h.proj||base; h.proj=nm; if(!groups.has(nm)) groups.set(nm,[]); groups.get(nm).push(h); } }
  if(!groups.size){ toast('No se encontraron taladros en los CSV',3500); return; }
  const exist=[]; for(const nm of groups.keys()) if(await idb.get('projects',nm)) exist.push(nm);
  if(exist.length&&!confirm(`Ya existen: ${exist.join(', ')}. ¿Reemplazar sus taladros? (los logueos se conservan)`)) return;
  let last,total=0; for(const [nm,hs] of groups){ await idb.put('projects',{name:nm,holes:hs,added:Date.now()}); last=nm; total+=hs.length; }
  await refreshProjects(last); if($('#projDlg').open) renderProjects();
  toast(`${groups.size} proyecto${groups.size>1?'s':''} · ${total} taladros cargados`,3500);
};

/* ---------- ajustes ---------- */
function offTxt(){ $('#cfgOff').textContent=`Calibración GPS: ΔE ${S.cfg.dE.toFixed(1)} m, ΔN ${S.cfg.dN.toFixed(1)} m`; }
$('#btnCfg').onclick=()=>{ $('#cfgClave').value=''; $('#cfgClave').placeholder=getClave()?'Guardada (escribe otra para cambiarla)':'Sin clave'; $('#cfgUser').value=S.cfg.user; $('#cfgZone').value=S.cfg.zone; $('#cfgHemi').value=S.cfg.hemi; offTxt(); $('#cfg').showModal(); };
$('#cfgOk').onclick=()=>{ const nc=$('#cfgClave').value; if(nc){ setClave(nc); cifSesion=null; } S.cfg.user=$('#cfgUser').value.trim(); S.cfg.zone=+$('#cfgZone').value||19; S.cfg.hemi=$('#cfgHemi').value;
  saveCfg(); $('#cfg').close(); draw(); };
$('#cfgClaveDel').onclick=()=>{ setClave(''); cifSesion=null; $('#cfgClave').placeholder='Sin clave'; toast('Clave de campo borrada de este equipo'); };
$('#cfgResetOff').onclick=()=>{ S.cfg.dE=S.cfg.dN=0; saveCfg(); offTxt(); draw(); };
/* ---------- exportar (ZIP: logueo.csv + fotos) ---------- */
const COLS=['proj','id','E','N','Z','estado','lito','lito2','alter','mineral','intens','dureza','fractura','humedad',
  'contacto','contacto_m','prof','obs','user','ts','gps_E','gps_N','gps_acc','gps_dist'];
const crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=crcT[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function zip(files){ // almacenado sin compresión
  const enc=new TextEncoder(), parts=[], cen=[]; let off=0;
  const u16=n=>[n&255,n>>8&255], u32=n=>[n&255,n>>8&255,n>>16&255,n>>>24&255];
  for(const f of files){ const nm=enc.encode(f.name), crc=crc32(f.data), sz=f.data.length;
    const lh=new Uint8Array([0x50,0x4b,3,4,20,0,0,8,0,0,0,0,0,0,...u32(crc),...u32(sz),...u32(sz),...u16(nm.length),0,0,...nm]);
    parts.push(lh,f.data);
    cen.push(new Uint8Array([0x50,0x4b,1,2,20,0,20,0,0,8,0,0,0,0,0,0,...u32(crc),...u32(sz),...u32(sz),...u16(nm.length),0,0,0,0,0,0,0,0,0,0,0,0,...u32(off),...nm]));
    off+=lh.length+sz; }
  const cl=cen.reduce((a,b)=>a+b.length,0);
  return new Blob([...parts,...cen,new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u16(files.length),...u16(files.length),...u32(cl),...u32(off),0,0])],{type:'application/zip'});
}
async function exportProject(name){
  const logs=await idb.all('logs','proj',name); if(!logs.length){ toast('Aún no hay logueos en '+name); return; }
  const q=v=>{const s=Array.isArray(v)?v.join('|'):String(v??'');return /[",;\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
  const csv='﻿'+COLS.join(',')+'\n'+logs.sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}))
    .map(l=>COLS.map(c=>q(l[c])).join(',')).join('\n');
  const enc=new TextEncoder(), files=[{name:'logueo.csv',data:enc.encode(csv)}];
  const keyId=new Map(logs.map(l=>[l.key,l.id])); let n=0;
  for(const p of await idb.all('photos')){ const id=keyId.get(p.key); if(!id) continue;
    files.push({name:`fotos/${id}_${++n}.jpg`,data:new Uint8Array(await p.blob.arrayBuffer())}); }
  const d=new Date().toISOString().slice(0,10), fn=`${name}_logueo_${(S.cfg.user||'user').replace(/\W+/g,'')}_${d}.zip`;
  const blob=zip(files), file=new File([blob],fn,{type:'application/zip'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){ try{ await navigator.share({files:[file],title:fn}); return; }catch(e){ if(e.name==='AbortError') return; } }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fn; a.click(); toast('Descargado '+fn,3500);
}
$('#btnExport').onclick=()=>{ if(!S.proj){ toast('No hay proyecto'); return; } exportProject(S.proj); };

/* ---------- encuadre, búsqueda y navegación ---------- */
$('#btnFit').onclick=()=>{ fitView(); draw(); };
$('#btnZin').onclick=()=>zoomAt(cv.clientWidth/2,cv.clientHeight/2,1.5);
$('#btnZout').onclick=()=>zoomAt(cv.clientWidth/2,cv.clientHeight/2,1/1.5);
cv.addEventListener('dblclick',e=>zoomAt(e.offsetX,e.offsetY,1.8));
function goHole(h,open=true){ S.view.cx=h.E; S.view.cy=h.N; if(S.view.k<3) S.view.k=3; if(open) openHole(h); else draw(); }
$('#search').addEventListener('keydown',e=>{ if(e.key!=='Enter') return;
  const q=e.target.value.trim(); if(!q) return;
  const h=S.holes.find(x=>x.id===q)||S.holes.find(x=>x.id.endsWith(q))||S.holes.find(x=>x.id.startsWith(q));
  if(!h){ toast('No existe el taladro '+q); return; } e.target.blur(); e.target.value=''; goHole(h); });
function step(d){ const i=S.order.findIndex(x=>x.id===S.sel); if(i<0) return;
  goHole(S.order[(i+d+S.order.length)%S.order.length]); }
$('#btnPrev').onclick=()=>step(-1); $('#btnNextH').onclick=()=>step(1);
$('#btnNext').onclick=()=>{
  const g=gpsEN()||{E:S.view.cx,N:S.view.cy};
  const pend=S.holes.filter(h=>!(S.logs.get(S.proj+'|'+h.id)||{}).estado);
  if(!pend.length){ toast('No quedan taladros pendientes'); return; }
  let b=pend[0],bd=1e18; for(const h of pend){ const d=Math.hypot(h.E-g.E,h.N-g.N); if(d<bd){bd=d;b=h;} }
  S.sel=b.id; goHole(b,false); toast(`Pendiente más cercano: ${b.id} (${bd.toFixed(0)} m)`); };
$('#btnCopy').onclick=()=>{ if(!S.last){ toast('Aún no guardaste ningún taladro'); return; }
  for(const k of ['estado','lito','lito2','alter','mineral','intens','dureza','fractura','humedad']) if(S.last[k]!==undefined) S.draft[k]=Array.isArray(S.last[k])?[...S.last[k]]:S.last[k];
  renderForm(); toast('Copiado del taladro '+S.last.id); };

/* ---------- PC <-> celular: enlace del proyecto e importación de logueos ---------- */
const b64u={ enc:u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode(...u.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');},
             dec:t=>Uint8Array.from(atob(t.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)) };
async function pipe(bytes,Stream,fmt){ return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new Stream(fmt))).arrayBuffer()); }

/* enlaces cifrados #bc= : version(1) | sal(16) | iv(12) | AES-256-GCM (clave PBKDF2-SHA256 de la clave de campo) */
const CLAVE_LS='clave-campo', ITER=200000, TE=new TextEncoder();
const getClave=()=>{ try{ return localStorage.getItem(CLAVE_LS)||''; }catch{ return ''; } };
const setClave=c=>{ try{ c?localStorage.setItem(CLAVE_LS,c):localStorage.removeItem(CLAVE_LS); }catch{} };
async function derivar(clave,sal,usos){
  const base=await crypto.subtle.importKey('raw',TE.encode(clave),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:sal,iterations:ITER,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,usos); }
async function descifrar(bytes,clave){
  if(bytes[0]!==1) throw new Error('Enlace de una versión que esta app no conoce. Actualiza la app.');
  const k=await derivar(clave,bytes.slice(1,17),['decrypt']);
  return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(17,29),additionalData:TE.encode('b')},k,bytes.slice(29))); }
let cifSesion=null;                      // una sal por sesion: la clave se deriva una vez
async function cifrar(bytes,clave){
  if(!cifSesion||cifSesion.clave!==clave){ const sal=crypto.getRandomValues(new Uint8Array(16)); cifSesion={clave,sal,k:await derivar(clave,sal,['encrypt'])}; }
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:TE.encode('b')},cifSesion.k,bytes));
  const out=new Uint8Array(29+ct.length); out[0]=1; out.set(cifSesion.sal,1); out.set(iv,17); out.set(ct,29); return out; }
function pedirClave(error){ const d=$('#claveDlg'); $('#claveErr').textContent=error||''; $('#claveIn').value=''; d.showModal();
  return new Promise(res=>{ d.onclose=()=>res(d.returnValue==='ok'?{clave:$('#claveIn').value,recordar:$('#claveRec').checked}:null); }); }
async function abrirCifrado(bytes){
  let clave=getClave(), recordar=true, error='';
  for(;;){
    if(!clave){ const r=await pedirClave(error); if(!r) throw new Error('Se necesita la clave de campo para abrir este enlace');
      clave=r.clave; recordar=r.recordar; }
    try{ const out=await descifrar(bytes,clave); if(recordar) setClave(clave); return out; }
    catch(e){ if(/versión/.test(e.message)) throw e; setClave(''); clave=''; error='Clave incorrecta'; }
  } }

/* formato compacto: coordenadas en cm como diferencias base-36, comprimido con deflate */
const isNumId=s=>/^\d+$/.test(s)&&String(+s)===s;
function packHoles(name,holes){
  let pI=0,pE=0,pN=0,pZ=0; const out=[name];
  for(const h of holes){
    const e=Math.round(h.E*100), n=Math.round(h.N*100), z=isFinite(h.Z)?Math.round(h.Z*10):null;
    let id; if(isNumId(h.id)){ id=(+h.id-pI).toString(36); pI=+h.id; } else id='='+h.id;
    out.push([id,(e-pE).toString(36),(n-pN).toString(36),z==null?'n':(z-pZ).toString(36)].join(','));
    pE=e; pN=n; if(z!=null) pZ=z; }
  return out.join('\n');
}
function unpackHoles(txt){
  const [name,...rows]=txt.split('\n'); let pI=0,pE=0,pN=0,pZ=0;
  const holes=rows.filter(Boolean).map(r=>{ const [a,b,c,d]=r.split(',');
    let id; if(a[0]==='=') id=a.slice(1); else { pI+=parseInt(a,36); id=String(pI); }
    pE+=parseInt(b,36); pN+=parseInt(c,36); let Z=NaN; if(d!=='n'){ pZ+=parseInt(d,36); Z=pZ/10; }
    return {id,E:pE/100,N:pN/100,Z,proj:name}; });
  return {name,holes};
}
/* paquete de salida: varios proyectos por enlace/QR; si no caben, se reparten en partes */
const MAXQR=1400;                       // caracteres máximos por QR (legible en pantalla de PC)
const PK='\u0001';
async function rawLink(names,part,total){
  const blocks=[];
  for(const n of names){ const p=await idb.get('projects',n); blocks.push(PK+packHoles(p.name,p.holes)); }
  const z=await pipe(new TextEncoder().encode(`${part}/${total}\n`+blocks.join('\n')),CompressionStream,'deflate-raw');
  const clave=getClave();                // con clave de campo guardada el enlace sale cifrado
  return clave ? location.origin+location.pathname+'#bc='+b64u.enc(await cifrar(z,clave))
               : location.origin+location.pathname+'#b='+b64u.enc(z);
}
async function bundleLinks(names){
  const groups=[[]];
  for(const n of names){ const cur=groups[groups.length-1];
    if(cur.length&&(await rawLink([...cur,n],1,1)).length>MAXQR) groups.push([n]); else cur.push(n); }
  return Promise.all(groups.map(async(g,i)=>({names:g,link:await rawLink(g,i+1,groups.length)})));
}
function unpackBundle(txt){
  const lines=txt.split('\n'); const [part,total]=lines.shift().split('/').map(Number);
  const projects=[]; let cur=null,pI=0,pE=0,pN=0,pZ=0;
  for(const l of lines){ if(!l) continue;
    if(l[0]===PK){ cur={name:l.slice(1),holes:[]}; projects.push(cur); pI=pE=pN=pZ=0; continue; }
    const [a,b,c,d]=l.split(','); let id; if(a[0]==='=') id=a.slice(1); else { pI+=parseInt(a,36); id=String(pI); }
    pE+=parseInt(b,36); pN+=parseInt(c,36); let Z=NaN; if(d!=='n'){ pZ+=parseInt(d,36); Z=pZ/10; }
    cur.holes.push({id,E:pE/100,N:pN/100,Z,proj:cur.name}); }
  return {part,total,projects};
}
const got={total:0,parts:new Set(),t:0};
async function importLink(str){
  str=String(str); let m, projects, part=1,total=1;
  if(m=str.match(/#bc=([\w-]+)/)){
    ({part,total,projects}=unpackBundle(new TextDecoder().decode(await pipe(await abrirCifrado(b64u.dec(m[1])),DecompressionStream,'deflate-raw')))); }
  else if(m=str.match(/#b=([\w-]+)/)){
    ({part,total,projects}=unpackBundle(new TextDecoder().decode(await pipe(b64u.dec(m[1]),DecompressionStream,'deflate-raw')))); }
  else if(m=str.match(/#q=([\w-]+)/)){                                 // formato anterior
    const d=unpackHoles(new TextDecoder().decode(await pipe(b64u.dec(m[1]),DecompressionStream,'deflate-raw'))); projects=[d]; }
  else if(m=str.match(/#p=([\w-]+)/)){                                 // formato más antiguo
    const [name,...rows]=new TextDecoder().decode(await pipe(b64u.dec(m[1]),DecompressionStream,'gzip')).split('\n');
    projects=[{name,holes:rows.filter(Boolean).map(r=>{const [id,E,N,Z]=r.split(',');return{id,E:+E,N:+N,Z:Z===''?NaN:+Z,proj:name};})}]; }
  else throw new Error('El enlace no es válido');
  for(const p of projects) await idb.put('projects',{name:p.name,holes:p.holes,added:Date.now()});
  await refreshProjects(projects[projects.length-1].name);
  if(total>1){ if(got.total!==total||Date.now()-got.t>3600e3){ got.total=total; got.parts=new Set(); }
    got.parts.add(part); got.t=Date.now(); const left=total-got.parts.size;
    toast(left?`Parte ${part} de ${total} cargada. Faltan ${left} por escanear`:`Paquete completo: ${total} partes cargadas`,4500); }
  else toast(projects.length>1?`${projects.length} proyectos cargados`:`Proyecto ${projects[0].name}: ${projects[0].holes.length} taladros`);
}
async function pasteLink(){ let t=''; try{ t=await navigator.clipboard.readText(); }catch{}
  if(!/#(?:[qpb]|bc)=/.test(t)) t=prompt('Pega aquí el enlace del proyecto:')||'';
  if(!t) return; try{ await importLink(t); $('#projDlg').close(); }catch(e){ toast(e.message,3500); } }
$('#cfgImp').onclick=()=>$('#fileImp').click();

function parseRows(txt){ const out=[]; let row=[],f='',q=false;
  for(let i=0;i<txt.length;i++){ const c=txt[i];
    if(q){ if(c==='"'){ if(txt[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else if(c==='"') q=true; else if(c===','){row.push(f);f='';}
    else if(c==='\n'||c==='\r'){ if(c==='\r'&&txt[i+1]==='\n') i++; row.push(f);f=''; if(row.length>1||row[0]!=='') out.push(row); row=[]; }
    else f+=c; }
  if(f!==''||row.length){row.push(f);out.push(row);} return out; }
async function unzip(buf){ const v=new DataView(buf),u=new Uint8Array(buf),dec=new TextDecoder(),files=[]; let o=0;
  while(o+30<=u.length&&v.getUint32(o,true)===0x04034b50){
    const meth=v.getUint16(o+8,true),csz=v.getUint32(o+18,true),nl=v.getUint16(o+26,true),el=v.getUint16(o+28,true);
    const name=dec.decode(u.subarray(o+30,o+30+nl)), st=o+30+nl+el; let d=u.subarray(st,st+csz);
    if(meth===8) d=await pipe(d,DecompressionStream,'deflate-raw'); else if(meth!==0) throw new Error('ZIP no soportado');
    files.push({name,data:d}); o=st+csz; }
  return files; }
async function importLogs(file){
  let csv,photos=[];
  if(/\.zip$/i.test(file.name)){ const fs=await unzip(await file.arrayBuffer());
    const c=fs.find(f=>/logueo\.csv$/i.test(f.name)); if(!c) throw new Error('El ZIP no trae logueo.csv');
    csv=new TextDecoder().decode(c.data); photos=fs.filter(f=>/^fotos\/.+\.jpe?g$/i.test(f.name)); }
  else csv=await file.text();
  const rows=parseRows(csv.replace(/^﻿/,'')); const head=rows.shift(); let n=0,sk=0;
  for(const r of rows){ const l={}; head.forEach((k,i)=>l[k]=r[i]??'');
    if(!l.proj||!l.id) continue;
    for(const k of ['E','N','Z']) if(l[k]!==''&&isFinite(l[k])) l[k]=+l[k];
    l.mineral=l.mineral?l.mineral.split('|'):[]; l.key=l.proj+'|'+l.id;
    const cur=await idb.get('logs',l.key); if(cur&&cur.ts>=l.ts){ sk++; continue; }
    if(!await idb.get('projects',l.proj)) await idb.put('projects',{name:l.proj,holes:[],added:Date.now()});
    await idb.put('logs',l); n++;
    const mine=photos.filter(p=>p.name.split('/')[1].startsWith(l.id+'_'));
    if(mine.length&&!(await idb.all('photos','key',l.key)).length)
      for(const p of mine) await idb.put('photos',{key:l.key,blob:new Blob([p.data],{type:'image/jpeg'}),ts:Date.now()}); }
  await refreshProjects(S.proj); toast(`${n} logueos importados`+(sk?` (${sk} ya estaban más recientes)`:''),4000);
}
$('#fileImp').onchange=async e=>{ const f=e.target.files[0]; e.target.value=''; if(!f) return;
  try{ await importLogs(f); $('#cfg').close(); }catch(err){ toast(err.message,4000); } };

/* ---------- pantalla encendida mientras se usa el GPS ---------- */
async function keepAwake(){ try{ S.wake=await navigator.wakeLock?.request('screen'); }catch{} }
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&S.watch!=null) keepAwake(); });


/* ---------- panel de proyectos (varios proyectos en campo) ---------- */
function fmtDist(m){ return m<1000?Math.round(m)+' m':(m/1000).toFixed(m<10000?1:0)+' km'; }
const unpick=new Set();            // proyectos desmarcados para la salida (por defecto van todos)
async function renderProjects(){
  const ps=await idb.all('projects'), logs=await idb.all('logs'), done={};
  logs.forEach(l=>{ if(l.estado) done[l.proj]=(done[l.proj]||0)+1; });
  const g=gpsEN();
  const rows=ps.map(p=>{ const n=p.holes.length; let d=null;
    if(g&&n){ const cE=p.holes.reduce((a,h)=>a+h.E,0)/n, cN=p.holes.reduce((a,h)=>a+h.N,0)/n; d=Math.hypot(g.E-cE,g.N-cN); }
    return {p,n,dn:done[p.name]||0,d}; });
  rows.sort((a,b)=>(a.d!=null&&b.d!=null)?a.d-b.d:a.p.name.localeCompare(b.p.name));
  const box=$('#projList');
  if(!rows.length){ box.innerHTML='<div class="pnone">Aún no hay proyectos.<br>Carga uno o varios CSV, o pega un enlace.</div>'; updatePick(); return; }
  box.innerHTML=rows.map(r=>{ const pct=r.n?Math.round(r.dn*100/r.n):0;
    return `<div class="prow${r.p.name===S.proj?' cur':''}" data-n="${esc(r.p.name)}">
      <input type="checkbox" class="psel" ${unpick.has(r.p.name)?'':'checked'} title="Incluir en el paquete de salida">
      <div class="pmain" data-a="open"><b>${esc(r.p.name)}</b>
        <small>${r.dn} / ${r.n} taladros · ${pct}%${r.d!=null?' · a '+fmtDist(r.d):''}</small>
        <div class="pbar"><i style="width:${pct}%"></i></div></div>
      <div class="pact">
        <button class="ib" data-a="exp" title="Exportar logueos"><i class="ic" data-ic="upload"></i></button>
        <button class="ib" data-a="del" title="Borrar proyecto"><i class="ic" data-ic="trash"></i></button>
      </div></div>`; }).join('');
  hydrate(box); updatePick();
}
function pickedNames(){ return [...document.querySelectorAll('#projList .prow')].filter(r=>r.querySelector('.psel').checked).map(r=>r.dataset.n); }
function updatePick(){ const n=pickedNames().length; $('#pQr').disabled=!n; $('#pQrN').textContent=n?`(${n})`:''; }
$('#projList').addEventListener('change',e=>{ if(!e.target.classList.contains('psel')) return;
  const n=e.target.closest('.prow').dataset.n; e.target.checked?unpick.delete(n):unpick.add(n); updatePick(); });
async function openProjectsPanel(){
  $('#projDlg').showModal(); renderProjects();
  try{ const st=await navigator.permissions?.query({name:'geolocation'});     // si ya hay permiso, ordenar por cercanía
    if(st?.state==='granted') navigator.geolocation.getCurrentPosition(p=>{
      S.gps={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy}; if($('#projDlg').open) renderProjects(); },()=>{},{timeout:8000}); }catch{}
}
async function wipeProject(name){
  if(!confirm(`¿Borrar el proyecto ${name} con TODOS sus logueos y fotos de este equipo? Exporta antes.`)) return false;
  for(const l of await idb.all('logs','proj',name)) await idb.del('logs',l.key);
  for(const p of await idb.all('photos')) if(p.key.startsWith(name+'|')) await idb.del('photos',p.id);
  await idb.del('projects',name); return true;
}
$('#projBtn').onclick=openProjectsPanel;
$('#pCsv').onclick=()=>$('#fileCsv').click();
$('#pPaste').onclick=pasteLink;
$('#emptyCsv').onclick=()=>$('#fileCsv').click();
$('#emptyLink').onclick=pasteLink;
$('#projList').addEventListener('click',async e=>{
  const b=e.target.closest('[data-a]'); if(!b) return; const name=b.closest('.prow').dataset.n;
  if(b.dataset.a==='open'){ await openProject(name); $('#projDlg').close(); }
  else if(b.dataset.a==='exp') exportProject(name);
  else if(b.dataset.a==='del'){ if(await wipeProject(name)){ await refreshProjects(name===S.proj?undefined:S.proj); renderProjects(); } }
});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));

/* ---------- QR del proyecto ---------- */
let qrParts=[],qrIdx=0;
async function showBundleQR(){
  const names=pickedNames(); if(!names.length){ toast('Marca al menos un proyecto'); return; }
  qrParts=await bundleLinks(names); qrIdx=0; drawQR(); $('#projDlg').close(); $('#qrDlg').showModal();
}
function drawQR(){
  const part=qrParts[qrIdx], tot=qrParts.length, cvq=$('#qrCv'), note=$('#qrNote');
  $('#qrTitle').textContent=tot>1?'Paquete de salida':part.names[0];
  $('#qrPart').textContent=tot>1?`Parte ${qrIdx+1} de ${tot}`:'';
  $('.qrnav').style.display=tot>1?'flex':'none';
  note.textContent=(tot>1?`Escanea las ${tot} partes, una tras otra. `:'Escanéalo con la cámara del celular. ')+'Esta parte: '+part.names.join(', ')+'.';
  try{ const qr=qrcode(0,'L'); qr.addData(part.link); qr.make();
    const n=qr.getModuleCount(), sc=Math.max(2,Math.floor(320/(n+8))), size=(n+8)*sc; cvq.width=cvq.height=size;
    const c=cvq.getContext('2d'); c.fillStyle='#fff'; c.fillRect(0,0,size,size); c.fillStyle='#000';
    for(let r=0;r<n;r++)for(let q=0;q<n;q++) if(qr.isDark(r,q)) c.fillRect((q+4)*sc,(r+4)*sc,sc,sc);
    cvq.style.display='block'; cvq.style.width=Math.min(size,320)+'px';
  }catch{ cvq.style.display='none'; note.textContent='Este proyecto es muy grande para un QR. Copia el enlace y envíalo por WhatsApp o Teams, o comparte el CSV.'; }
}
$('#qrPrev').onclick=()=>{ qrIdx=(qrIdx-1+qrParts.length)%qrParts.length; drawQR(); };
$('#qrNext').onclick=()=>{ qrIdx=(qrIdx+1)%qrParts.length; drawQR(); };
$('#qrCopy').onclick=async()=>{ const l=qrParts[qrIdx].link; try{ await navigator.clipboard.writeText(l); toast('Enlace copiado'); }catch{ prompt('Copia este enlace:',l); } };
$('#pQr').onclick=showBundleQR;

/* ---------- acerca de ---------- */
function setupAbout(){
  for(const [id,txt] of [['#byLink',AUTOR.nombre],['#aboutBy',AUTOR.nombre]]){ const a=$(id); a.textContent=txt; a.href=AUTOR.url; }
  const r=$('#aboutRepo'); r.href=AUTOR.repo; $('#ver').textContent=VERSION;
}
$('#cfgAbout').onclick=()=>{ $('#cfg').close(); $('#aboutDlg').showModal(); };
$('#cfgWipe').onclick=async()=>{ if(!S.proj) return; if(await wipeProject(S.proj)){ $('#cfg').close(); await refreshProjects(); } };

/* ---------- arranque ---------- */
addEventListener('resize',resize);
matchMedia('(prefers-color-scheme:dark)').addEventListener?.('change',draw);
(async()=>{
  loadCfg(); hydrate(); setupAbout(); await idb.open(); resize(); await refreshProjects();
  if(/#(?:[qpb]|bc)=/.test(location.hash)){ try{ await importLink(location.href); }catch(e){ toast(e.message,4000); } history.replaceState(null,'',location.pathname); }
  if(navigator.storage?.persist) navigator.storage.persist();   // evita que el navegador borre los datos
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
