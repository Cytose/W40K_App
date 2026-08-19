(function(global){
"use strict";
const el = id => document.getElementById(id);

/* ==========================================================
   ÉTAT
   ========================================================== */
const S = {
  wName:"", attacks:"20", bs:3, str:5, ap:1, dmg:"1",
  tough:4, sv:3, inv:0, wounds:2, models:5, fnp:0, dmgRed:0, cover:false,
  torrent:false, lethal:true, dev:false, sustainedOn:false, sustainedN:"1",
  blast:false, rapidOn:false, rapidN:1, meltaOn:false, meltaN:2,
  critH:6, critW:6, hitMod:0, wndMod:0, rrH:"none", rrW:"none"
};
let viewMode = "auto";
let curUnit = "Immortals", curWeapon = 0, curSize = 10;
let tgtTab = "generic";

/* ==========================================================
   DÉS
   ========================================================== */
const {parseDice,diceMean,diceRoll,scaleDice,sets,probs,woundTarget,saveTarget,
       passProb,meanDamagePerHit,analytic,simulate} = ENG;

const GENERIC_TARGETS = [
  ["Garde impérial",     {tough:3, sv:5, inv:0, wounds:1, models:10, fnp:0, dmgRed:0}],
  ["Ork Boy",            {tough:5, sv:6, inv:0, wounds:1, models:10, fnp:0, dmgRed:0}],
  ["Space Marine",       {tough:4, sv:3, inv:0, wounds:2, models:5,  fnp:0, dmgRed:0}],
  ["Marine Gravis",      {tough:6, sv:3, inv:0, wounds:3, models:3,  fnp:0, dmgRed:0}],
  ["Terminator",         {tough:5, sv:2, inv:4, wounds:3, models:5,  fnp:0, dmgRed:0}],
  ["Custodes",           {tough:6, sv:2, inv:4, wounds:3, models:4,  fnp:0, dmgRed:0}],
  ["Aeldari (Guardian)", {tough:3, sv:4, inv:0, wounds:1, models:10, fnp:0, dmgRed:0}],
  ["Genestealer",        {tough:4, sv:5, inv:5, wounds:2, models:10, fnp:0, dmgRed:0}],
  ["Guerrier tyranide",  {tough:5, sv:4, inv:0, wounds:3, models:3,  fnp:0, dmgRed:0}],
  ["Transport (T9)",     {tough:9, sv:3, inv:0, wounds:10, models:1, fnp:0, dmgRed:0}],
  ["Char lourd (T11)",   {tough:11,sv:2, inv:0, wounds:16, models:1, fnp:0, dmgRed:0}],
  ["Knight (T12)",       {tough:12,sv:3, inv:5, wounds:22, models:1, fnp:0, dmgRed:0}]
];

const SEGS = [
  ["segBS","bs",[[2,"2+"],[3,"3+"],[4,"4+"],[5,"5+"],[6,"6+"]]],
  ["segAP","ap",[[0,"0"],[1,"-1"],[2,"-2"],[3,"-3"],[4,"-4"],[5,"-5"]]],
  ["segSv","sv",[[2,"2+"],[3,"3+"],[4,"4+"],[5,"5+"],[6,"6+"],[7,"—"]]],
  ["segInv","inv",[[0,"—"],[2,"2+"],[3,"3+"],[4,"4+"],[5,"5+"],[6,"6+"]]],
  ["segFNP","fnp",[[0,"—"],[4,"4+"],[5,"5+"],[6,"6+"]]],
  ["segDmgRed","dmgRed",[[0,"—"],[1,"-1"],[2,"-2"]]],
  ["segCritH","critH",[[4,"4+"],[5,"5+"],[6,"6+"]]],
  ["segCritW","critW",[[2,"2+"],[3,"3+"],[4,"4+"],[5,"5+"],[6,"6+"]]],
  ["segHitMod","hitMod",[[-1,"−1"],[0,"0"],[1,"+1"]]],
  ["segWndMod","wndMod",[[-1,"−1"],[0,"0"],[1,"+1"]]],
  ["segRrH","rrH",[["none","—"],["ones","1"],["failed","Ratés"]]],
  ["segRrW","rrW",[["none","—"],["ones","1"],["failed","Ratés"]]]
];
const TEXTF = ["wName","attacks","dmg","sustainedN"];
const NUMF  = ["str","tough","wounds","models","rapidN","meltaN"];
const CHKF  = ["cover","torrent","lethal","dev","sustainedOn","blast","rapidOn","meltaOn"];

function buildSegs(){
  SEGS.forEach(([id,key,opts])=>{
    const host = el(id); if(!host) return;
    host.innerHTML = "";
    opts.forEach(([v,label])=>{
      const b = document.createElement("button");
      b.type="button"; b.textContent=label; b.dataset.v=String(v);
      b.addEventListener("click", ()=>{ S[key]=v; syncSeg(id,key); render(); });
      host.appendChild(b);
    });
    syncSeg(id,key);
  });
}
function syncSeg(id,key){
  const host = el(id); if(!host) return;
  host.querySelectorAll("button").forEach(b=>{
    const raw = b.dataset.v;
    const v = /^-?\d+$/.test(raw) ? +raw : raw;
    b.setAttribute("aria-pressed", String(S[key]===v));
  });
}
function bindFields(){
  TEXTF.forEach(k=> el(k).addEventListener("input", e=>{ S[k]=e.target.value; render(); }));
  NUMF.forEach(k=> el(k).addEventListener("input", e=>{
    const v = parseInt(e.target.value,10); if(!isNaN(v)) S[k]=Math.max(1,Math.min(60,v)); render();
  }));
  CHKF.forEach(k=> el(k).addEventListener("change", e=>{ S[k]=e.target.checked; render(); }));
}
function pushState(){
  TEXTF.forEach(k=> el(k).value = S[k]);
  NUMF.forEach(k=> el(k).value = S[k]);
  CHKF.forEach(k=> el(k).checked = S[k]);
  SEGS.forEach(([id,key])=> syncSeg(id,key));
}

/* ==========================================================
   ATTAQUANT — unité / arme / taille
   ========================================================== */
const KWLABEL = {precision:"Precision", heavy:"Heavy", extra:"Extra Attacks",
  ignorescover:"Ignores Cover", pistol:"Pistol", assault:"Assault",
  indirect:"Indirect Fire", oneshot:"One Shot"};
function parseFlags(str){
  const o = {};
  String(str||"").split(" ").filter(Boolean).forEach(tok=>{
    const i = tok.indexOf(":");
    if(i < 0) o[tok] = true; else o[tok.slice(0,i)] = tok.slice(i+1);
  });
  return o;
}
const unitRow  = n => UNITS.find(u => u[0] === n);
const unitWeps = n => WEAPONS.filter(w => w[0] === n);

function applyWeapon(){
  if(window.__syncRosterQuickPending !== true){
    window.__syncRosterQuickPending = true;
    setTimeout(()=>{ window.__syncRosterQuickPending = false;
      if(window.__syncRosterQuick) window.__syncRosterQuick(); }, 0);
  }
  const u = unitRow(curUnit), list = unitWeps(curUnit);
  if(!u || !list.length) return;
  if(curWeapon >= list.length) curWeapon = 0;
  const w = list[curWeapon], f = parseFlags(w[8]);
  const sizes = u[6];
  if(sizes.indexOf(curSize) < 0) curSize = sizes[sizes.length-1];

  S.wName   = w[1];
  S.attacks = scaleDice(w[3], curSize);
  S.bs = w[4]; S.str = w[5]; S.ap = w[6]; S.dmg = w[7];
  S.torrent = !!f.torrent;
  S.lethal  = !!f.lethal;
  S.dev     = !!f.dev;
  S.sustainedOn = !!f.sust;  S.sustainedN = f.sust ? String(f.sust) : "1";
  S.blast   = !!f.blast;
  S.rapidOn = !!f.rf;        S.rapidN = f.rf ? Math.min(60, (+f.rf) * curSize) : 1;
  S.meltaOn = !!f.melta;     S.meltaN = f.melta ? +f.melta : 2;
  S.critH   = 6;
  S.critW   = f.anti ? +f.anti : 6;
  S.rrW     = f.twin ? "failed" : "none";
  refreshAttacker();
  pushState(); render();
}

function refreshAttacker(){
  const u = unitRow(curUnit), list = unitWeps(curUnit);
  const w = list[curWeapon] || list[0], f = parseFlags(w[8]);

  el("puName").textContent = curUnit + (u[10] ? "  (Legends)" : "");
  el("puSub").textContent = (u[1] ? "M " + u[1] + "\"" : "immobile") + " · E" + u[2] + " · Svg " + u[3] + "+" +
    (u[4] ? " / " + u[4] + "++" : "") + " · " + u[5] + " PV" +
    (u[7][String(curSize)] ? " · " + u[7][String(curSize)] + " pts" : "");

  const wc = el("weaponChips"); wc.innerHTML = "";
  list.forEach((x,i)=>{
    const b = document.createElement("button");
    b.type="button"; b.className = "chip" + (i===curWeapon ? " on" : "");
    b.textContent = x[1] + (x[2]==="C" ? "  ·càc" : "");
    b.addEventListener("click", ()=>{ curWeapon = i; applyWeapon(); });
    wc.appendChild(b);
  });

  const sc = el("sizeChips"); sc.innerHTML = "";
  u[6].forEach(sz=>{
    const b = document.createElement("button");
    b.type="button"; b.className = "chip" + (sz===curSize ? " on" : "");
    b.textContent = "×" + sz + (u[7][String(sz)] ? " · " + u[7][String(sz)] + " pts" : "");
    b.addEventListener("click", ()=>{ curSize = sz; applyWeapon(); });
    sc.appendChild(b);
  });
  el("sizeChips").style.display = u[6].length > 1 ? "" : "none";

  const kws = [];
  if(f.lethal)  kws.push("Lethal Hits");
  if(f.dev)     kws.push("Devastating Wounds");
  if(f.torrent) kws.push("Torrent");
  if(f.blast)   kws.push("Blast");
  if(f.twin)    kws.push("Twin-linked");
  if(f.sust)    kws.push("Sustained Hits " + f.sust);
  if(f.rf)      kws.push("Rapid Fire " + f.rf);
  if(f.melta)   kws.push("Melta " + f.melta);
  if(f.anti)    kws.push("Anti-X " + f.anti + "+");
  const notes = [];
  Object.keys(KWLABEL).forEach(k=>{ if(f[k]) notes.push(KWLABEL[k]); });

  const warn = [];
  if(u[6].length > 1) warn.push("Calculé pour " + curSize + " figurines portant cette arme.");
  if(f.rf) warn.push("Rapid Fire compté (à mi-portée) — décoche-le dans « Capacités » si tu tires de loin.");
  if(f.anti) warn.push("Anti-X ne vaut que contre le bon mot-clé.");
  if(notes.length) warn.push("Sans effet sur les dés : " + notes.join(", ") + ".");

  el("profBox").innerHTML =
    '<span class="stat">A ' + w[3] + " · " + (f.torrent ? "auto" : w[4] + "+") +
    " · F" + w[5] + " · PA " + (w[6] ? "-" + w[6] : "0") + " · D " + w[7] + "</span>" +
    (kws.length ? '<span class="kw">' + kws.join("  ·  ") + "</span>" : "") +
    (warn.length ? '<span class="warn">' + warn.join(" ") + "</span>" : "");
}

/* ==========================================================
   CIBLE
   ========================================================== */
let tgtName = "Space Marine", tgtUnit = null, tgtSize = 5;
function applyGenericTarget(name){
  const p = GENERIC_TARGETS.find(t => t[0] === name);
  if(!p) return;
  Object.assign(S, p[1]);
  tgtName = name; tgtUnit = null;
  refreshTarget(); pushState(); render();
}
function applyNecronTarget(name, size){
  const u = unitRow(name); if(!u) return;
  const sizes = u[6];
  size = sizes.indexOf(size) < 0 ? sizes[sizes.length-1] : size;
  S.tough = u[2]; S.sv = u[3]; S.inv = u[4]; S.wounds = u[5];
  S.models = (name === "Szarekh, The Silent King") ? 1 : size;
  S.fnp = u[8];
  S.dmgRed = /Necrodermis|Implacable Resilience|-1 D.gât/.test(u[11]) ? 1 : 0;
  tgtName = name; tgtUnit = u; tgtSize = size;
  refreshTarget(); pushState(); render();
}
function refreshTarget(){
  el("ptName").textContent = tgtName;
  el("ptSub").textContent = "E" + S.tough + " · Svg " + S.sv + "+" + (S.inv ? " / " + S.inv + "++" : "") +
    " · " + S.wounds + " PV × " + S.models + (S.fnp ? " · FNP " + S.fnp + "+" : "") +
    (S.dmgRed ? " · -" + S.dmgRed + " dégât" : "");
  const sc = el("tSizeChips"); sc.innerHTML = "";
  if(tgtUnit && tgtUnit[6].length > 1){
    sc.style.display = "";
    tgtUnit[6].forEach(sz=>{
      const b = document.createElement("button");
      b.type="button"; b.className = "chip" + (sz===tgtSize ? " on" : "");
      b.textContent = "×" + sz;
      b.addEventListener("click", ()=> applyNecronTarget(tgtName, sz));
      sc.appendChild(b);
    });
  } else sc.style.display = "none";
  el("tgtNote").textContent = tgtUnit ? tgtUnit[11] : "";
}

/* ==========================================================
   FEUILLES DE SÉLECTION
   ========================================================== */
function openSheet(id){ el(id).classList.add("open"); document.body.style.overflow="hidden"; }
function closeSheet(id){ el(id).classList.remove("open"); document.body.style.overflow=""; }
document.querySelectorAll("[data-close]").forEach(b=>
  b.addEventListener("click", ()=> closeSheet(b.dataset.close)));

const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function renderUnitList(){
  if(window.__rosterPick) return;
  const q = norm(el("uSearch").value.trim());
  const host = el("uList"); host.innerHTML = "";

  /* d'abord ce qui est deja dans la liste ouverte : en general on veut
     simuler une unite de son armee, pas n'importe laquelle du catalogue */
  const roster = window.ROSTER && window.ROSTER.actives();
  if(roster && roster.unites.length){
    const vus = new Set();
    const retenues = roster.unites.filter(x=>{
      if(q && !norm(x.nom).includes(q)) return false;
      const k = x.nom + "|" + x.taille + "|" + x.arme;
      if(vus.has(k)) return false;
      vus.add(k); return true;
    });
    if(retenues.length){
      const sep = document.createElement("div");
      sep.className = "sheet-sep";
      sep.textContent = "Dans « " + roster.liste + " »";
      host.appendChild(sep);
      retenues.forEach(x=>{
        const u = unitRow(x.nom); if(!u) return;
        const wl = unitWeps(x.nom), w = wl[x.arme] || wl[0];
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opt" + (x.nom === curUnit ? " sel" : "");
        b.innerHTML = '<span class="oi"><span class="o1">' + x.nom + '</span><span class="o2">' +
          '×' + x.taille + (w ? ' · ' + w[1] : '') + ' · ' + x.groupe + '</span></span>' +
          (x.perso ? '<span class="otag">RATTACHÉ</span>' : '');
        b.addEventListener("click", ()=>{
          curUnit = x.nom; curWeapon = x.arme; curSize = x.taille;
          const sizes = unitRow(x.nom)[6];
          if(sizes.indexOf(curSize) < 0) curSize = sizes[sizes.length-1];
          closeSheet("sheetUnit"); applyWeapon();
        });
        host.appendChild(b);
      });
      const sep2 = document.createElement("div");
      sep2.className = "sheet-sep";
      sep2.textContent = "Tout le catalogue";
      host.appendChild(sep2);
    }
  }

  const list = UNITS.filter(u => !q || norm(u[0]).includes(q) ||
    unitWeps(u[0]).some(w => norm(w[1]).includes(q)));
  if(!list.length && !host.children.length){
    host.innerHTML = '<div class="sheet-empty">Aucune unité trouvée.</div>'; return;
  }
  list.forEach(u=>{
    const b = document.createElement("button");
    b.type="button"; b.className = "opt" + (u[0]===curUnit ? " sel" : "");
    const pts = u[7][String(u[6][u[6].length-1])];
    b.innerHTML = '<span class="oi"><span class="o1">' + u[0] + '</span>' +
      '<span class="o2">E' + u[2] + " · Svg " + u[3] + "+" + (u[4] ? "/" + u[4] + "++" : "") +
      " · " + u[5] + " PV · ×" + u[6].join("/") + (pts ? " · " + pts + " pts" : "") + '</span></span>' +
      (u[10] ? '<span class="otag">LEGENDS</span>' : (u[9] ? '<span class="otag">' + u[9].toUpperCase() + '</span>' : ""));
    b.addEventListener("click", ()=>{
      curUnit = u[0]; curWeapon = 0; curSize = u[6][u[6].length-1];
      closeSheet("sheetUnit"); applyWeapon();
    });
    host.appendChild(b);
  });
}
function renderTargetList(){
  const q = norm(el("tSearch").value.trim());
  const host = el("tList"); host.innerHTML = "";
  if(tgtTab === "generic"){
    const list = GENERIC_TARGETS.filter(t => !q || norm(t[0]).includes(q));
    if(!list.length){ host.innerHTML = '<div class="sheet-empty">Aucune cible trouvée.</div>'; return; }
    list.forEach(([name,p])=>{
      const b = document.createElement("button");
      b.type="button"; b.className = "opt" + (name===tgtName ? " sel" : "");
      b.innerHTML = '<span class="oi"><span class="o1">' + name + '</span><span class="o2">E' + p.tough +
        " · Svg " + p.sv + "+" + (p.inv ? "/" + p.inv + "++" : "") + " · " + p.wounds + " PV × " + p.models + '</span></span>';
      b.addEventListener("click", ()=>{ closeSheet("sheetTarget"); applyGenericTarget(name); });
      host.appendChild(b);
    });
  } else {
    const list = UNITS.filter(u => !q || norm(u[0]).includes(q));
    if(!list.length){ host.innerHTML = '<div class="sheet-empty">Aucune unité trouvée.</div>'; return; }
    list.forEach(u=>{
      const b = document.createElement("button");
      b.type="button"; b.className = "opt" + (u[0]===tgtName ? " sel" : "");
      b.innerHTML = '<span class="oi"><span class="o1">' + u[0] + '</span><span class="o2">E' + u[2] +
        " · Svg " + u[3] + "+" + (u[4] ? "/" + u[4] + "++" : "") + " · " + u[5] + " PV · ×" + u[6].join("/") + '</span></span>' +
        (u[10] ? '<span class="otag">LEGENDS</span>' : "");
      b.addEventListener("click", ()=>{ closeSheet("sheetTarget"); applyNecronTarget(u[0], u[6][u[6].length-1]); });
      host.appendChild(b);
    });
  }
}

/* ==========================================================
   PROFILS ENREGISTRÉS
   ========================================================== */
const KEY = "mathhammer.necrons.v2";
let memStore = null;
const loadProfiles = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch(e){ return memStore || []; } };
const saveProfiles = l => { memStore = l; try { localStorage.setItem(KEY, JSON.stringify(l)); } catch(e){} };
function renderProfiles(){
  const list = loadProfiles(), host = el("savedList");
  host.innerHTML = "";
  el("savedHint").style.display = list.length ? "none" : "block";
  list.forEach((p,i)=>{
    const b = document.createElement("button");
    b.type="button"; b.className="chip"; b.textContent = p.name + "  ×";
    b.addEventListener("click", ev=>{
      const r = b.getBoundingClientRect();
      if(ev.clientX > r.right - 26){ const l = loadProfiles(); l.splice(i,1); saveProfiles(l); renderProfiles(); return; }
      Object.assign(S, p.state);
      if(p.unit){ curUnit = p.unit; curWeapon = p.weapon|0; curSize = p.size|0; refreshAttacker(); }
      tgtName = p.tgtName || tgtName; tgtUnit = p.tgtUnit ? unitRow(p.tgtUnit) : null;
      refreshTarget(); pushState(); render();
    });
    host.appendChild(b);
  });
}

/* ==========================================================
   GRAPHIQUES — une série par graphique, pas de légende requise
   ========================================================== */
const NS = "http://www.w3.org/2000/svg";
const mk = (n,a) => { const e = document.createElementNS(NS,n); for(const k in a) e.setAttribute(k,a[k]); return e; };
const pct = v => (v*100 < 0.05 && v>0) ? "<0,1 %" : (v*100).toFixed(v*100>=10?0:1).replace(".",",")+" %";
const num = (v,d) => v.toFixed(d===undefined?1:d).replace(".",",");

function barPath(x,y,w,h,r){
  r = Math.min(r, w/2, h);
  if(h <= 0.4) return "M"+x+","+(y+h)+" L"+(x+w)+","+(y+h)+" Z";
  return "M"+x+","+(y+h)+" L"+x+","+(y+r)+" Q"+x+","+y+" "+(x+r)+","+y+
         " L"+(x+w-r)+","+y+" Q"+(x+w)+","+y+" "+(x+w)+","+(y+r)+" L"+(x+w)+","+(y+h)+" Z";
}
function binned(dist, maxCat){
  const n = dist.length, out = {labels:[], values:[], starts:[], ends:[]};
  if(n <= maxCat){
    for(let i=0;i<n;i++){ out.labels.push(String(i)); out.values.push(dist[i]); out.starts.push(i); out.ends.push(i); }
    return out;
  }
  const size = Math.ceil(n/maxCat);
  for(let i=0;i<n;i+=size){
    const hi = Math.min(n-1, i+size-1);
    let s=0; for(let j=i;j<=hi;j++) s += dist[j];
    out.labels.push(size===1?String(i):(i+"–"+hi));
    out.values.push(s); out.starts.push(i); out.ends.push(hi);
  }
  return out;
}
const tip = el("tip");
function showTip(ev, html){
  tip.innerHTML = html; tip.style.opacity = 1;
  const r = tip.getBoundingClientRect();
  let x = ev.clientX - r.width/2, y = ev.clientY - r.height - 14;
  x = Math.max(8, Math.min(window.innerWidth - r.width - 8, x));
  if(y < 8) y = ev.clientY + 18;
  tip.style.left = x+"px"; tip.style.top = y+"px";
}
const hideTip = () => { tip.style.opacity = 0; };
document.addEventListener("pointerdown", e=>{ if(!e.target.closest("svg")) hideTip(); });

function drawBars(svg, data, color, tipFmt){
  const Wd=340, Ht=156, mL=32, mR=6, mT=12, mB=26;
  svg.setAttribute("viewBox","0 0 "+Wd+" "+Ht);
  svg.innerHTML = "";
  const iw = Wd-mL-mR, ih = Ht-mT-mB;
  const maxV = Math.max(0.0001, Math.max.apply(null, data.values));
  const nice = [0.02,0.05,0.1,0.2,0.25,0.5,1].find(v=>v>=maxV) || 1;

  [0,0.5,1].forEach(f=>{
    const y = mT + ih - f*ih;
    svg.appendChild(mk("line",{x1:mL,x2:Wd-mR,y1:y,y2:y,class:"gridline"}));
    const t = mk("text",{x:mL-6,y:y+3.5,"text-anchor":"end",class:"axis-lbl"});
    const v = nice*f*100;
    t.textContent = (Math.abs(v-Math.round(v))<0.05 ? String(Math.round(v)) : v.toFixed(1).replace(".",","))+"%";
    svg.appendChild(t);
  });

  const n = data.values.length;
  const slot = iw/n, gap = Math.min(2, slot*0.28), bw = Math.max(1.5, slot-gap);
  const labelStep = Math.ceil(n/9);
  let maxIdx = 0;
  data.values.forEach((v,i)=>{ if(v > data.values[maxIdx]) maxIdx = i; });

  data.values.forEach((v,i)=>{
    const h = (v/nice)*ih, x = mL + i*slot + gap/2, y = mT + ih - h;
    svg.appendChild(mk("path",{d:barPath(x,y,bw,h,4), fill:color}));
    const hit = mk("rect",{x:mL+i*slot, y:mT, width:slot, height:ih, fill:"transparent"});
    const handler = ev => showTip(ev, tipFmt(i, v));
    hit.addEventListener("pointerenter", handler);
    hit.addEventListener("pointerdown", handler);
    hit.addEventListener("pointerleave", hideTip);
    svg.appendChild(hit);
    const lastDrawn = Math.floor((n-1)/labelStep)*labelStep;
    if(i % labelStep === 0 || (i === n-1 && (n-1) - lastDrawn > labelStep*0.6)){
      const t = mk("text",{x:mL+i*slot+slot/2, y:Ht-mB+14, "text-anchor":"middle", class:"axis-lbl"});
      t.textContent = data.labels[i];
      svg.appendChild(t);
    }
  });
  if(data.values[maxIdx] > 0.02){
    const h = (data.values[maxIdx]/nice)*ih;
    let x = mL + maxIdx*slot + slot/2, y = mT + ih - h - 5, anchor = "middle";
    if(x < mL + 22){ x = mL + 22; anchor = "start"; }
    if(x > Wd - mR - 22){ x = Wd - mR - 22; anchor = "end"; }
    if(y < mT + 9) y = mT + 9;
    const t = mk("text",{x, y, "text-anchor":anchor, class:"axis-lbl"});
    t.setAttribute("style","fill:var(--tx);font-weight:800;font-size:10px;paint-order:stroke;stroke:var(--s1);stroke-width:3px;stroke-linejoin:round");
    t.textContent = pct(data.values[maxIdx]);
    svg.appendChild(t);
  }
}

/* ==========================================================
   RENDU
   ========================================================== */
let lastSim = null, lastData = null;
function render(){
  const a = analytic(S);
  const sim = simulate(S, a.A > 120 ? 8000 : 30000);
  lastSim = sim;
  const M = S.models, W = S.wounds;
  const wipe = sim.slainDist[M], atLeast1 = 1 - sim.slainDist[0];

  el("sumDmg").textContent = num(sim.meanDealt);
  el("sumSlain").textContent = num(sim.meanSlain);
  el("sumWipe").textContent = pct(wipe);

  const steps = [
    ["Attaques", a.A, ""],
    ["Touches", a.hits, S.torrent ? "auto" : "sur "+Math.max(2,Math.min(6,S.bs - S.hitMod))+"+"],
    ["Blessures", a.wounds, "sur "+a.wt+"+"],
    ["Non sauv.", a.unsaved, a.st>=7 ? "aucune svg" : "svg "+a.st+"+"],
    ["Dégâts bruts", a.rawDmg, S.fnp ? "après FNP" : (S.dmgRed ? "après -"+S.dmgRed : "")]
  ];
  const mx = Math.max.apply(null, steps.map(s=>s[1])) || 1;
  el("funnel").innerHTML = steps.map(([k,v,sub])=>
    '<div class="fstep"><div class="fl">'+k+'</div>'+
    '<div class="ftrack"><div class="fbar" style="width:'+Math.max(0.5,(v/mx)*100)+'%"></div></div>'+
    '<div class="fv">'+num(v)+'<span>'+sub+'</span></div></div>').join("");

  const mode = viewMode === "auto" ? (M > 1 ? "slain" : "dmg") : viewMode;
  const dist = mode === "slain" ? sim.slainDist : sim.dmgDist;
  const unit = mode === "slain" ? "figurine" : "PV";
  el("histTitle").textContent = mode === "slain" ? "Distribution des figurines tuées" : "Distribution des dégâts infligés";
  el("histSub").textContent = "Probabilité de chaque résultat, sur "+sim.N.toLocaleString("fr-FR")+" simulations. Touche une barre pour le détail.";

  const data = binned(dist, 26);
  lastData = {data, mode, unit};
  drawBars(el("hist"), data, "var(--green)", (i,v)=>{
    const pl = (unit === "figurine" && data.ends[i] > 1) ? "s" : "";
    return "<b>"+data.labels[i]+"</b> "+unit+pl+"<br>probabilité <b>"+pct(v)+"</b>";
  });

  const cum = [];
  for(let k=0;k<dist.length;k++){ let s=0; for(let j=k;j<dist.length;j++) s+=dist[j]; cum.push(s); }
  const cdata = {labels:[], values:[], starts:[], ends:[]};
  const step = Math.max(1, Math.ceil((dist.length-1)/22));
  for(let k=1;k<dist.length;k+=step){ cdata.labels.push("≥"+k); cdata.values.push(cum[k]); cdata.starts.push(k); cdata.ends.push(k); }
  if(!cdata.values.length){ cdata.labels.push("≥1"); cdata.values.push(0); cdata.starts.push(1); cdata.ends.push(1); }
  el("cumTitle").textContent = mode === "slain" ? "Probabilité d'en tuer au moins N" : "Probabilité d'infliger au moins N PV";
  el("cumSub").textContent = "Cumulé, sur "+sim.N.toLocaleString("fr-FR")+" simulations.";
  drawBars(el("cum"), cdata, "var(--cyan)", (i,v)=>
    "<b>"+cdata.labels[i]+"</b> "+unit+((unit==="figurine"&&cdata.starts[i]>1)?"s":"")+"<br>probabilité <b>"+pct(v)+"</b>");

  el("rDmg").textContent = num(sim.meanDealt)+" PV";
  el("rWaste").textContent = num(Math.max(0, sim.meanRaw - sim.meanDealt))+" PV";
  el("rSlain").textContent = num(sim.meanSlain);
  let acc=0, med=0;
  for(let i=0;i<sim.slainDist.length;i++){ acc += sim.slainDist[i]; if(acc >= 0.5){ med = i; break; } }
  el("rMed").textContent = String(med);
  el("rOne").textContent = pct(atLeast1);
  el("rWipe").textContent = pct(wipe);
  el("rLeft").textContent = num(Math.max(0, M*W - sim.meanDealt))+" PV";
  if(el("tableWrap").style.display !== "none") renderTable();
}
function renderTable(){
  if(!lastData) return;
  const {data, unit} = lastData;
  const dist = lastData.mode === "slain" ? lastSim.slainDist : lastSim.dmgDist;
  let html = "<table><thead><tr><th>"+(unit==="figurine"?"Figs tuées":"Dégâts")+
    "</th><th>Probabilité</th><th>Cumulé ≥</th></tr></thead><tbody>";
  data.values.forEach((v,i)=>{
    let c=0; for(let j=data.starts[i]; j<dist.length; j++) c += dist[j];
    html += "<tr><td>"+data.labels[i]+"</td><td>"+pct(v)+"</td><td>"+pct(c)+"</td></tr>";
  });
  el("tableWrap").innerHTML = html + "</tbody></table>";
}

/* ==========================================================
   INIT
   ========================================================== */
document.querySelectorAll(".card > h2").forEach(h=>
  h.addEventListener("click", ()=> h.parentElement.classList.toggle("collapsed")));
el("btnTable").addEventListener("click", ()=>{
  const w = el("tableWrap"), open = w.style.display === "none";
  w.style.display = open ? "block" : "none";
  el("btnTable").textContent = open ? "Masquer le tableau de données" : "Afficher le tableau de données";
  if(open) renderTable();
});
el("btnSave").addEventListener("click", ()=>{
  const name = prompt("Nom du profil :", S.wName + " → " + tgtName);
  if(!name) return;
  const l = loadProfiles();
  l.push({name:name.slice(0,44), state:JSON.parse(JSON.stringify(S)),
          unit:curUnit, weapon:curWeapon, size:curSize,
          tgtName:tgtName, tgtUnit:tgtUnit ? tgtUnit[0] : null});
  saveProfiles(l); renderProfiles();
  el("cardSaved").classList.remove("collapsed");
});
el("modeChips").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    viewMode = b.dataset.m;
    el("modeChips").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    render();
  }));
el("awakened").addEventListener("change", e=>{ S.hitMod = e.target.checked ? 1 : 0; pushState(); render(); });
/* les unites de la liste ouverte, en acces direct sous le selecteur :
   on veut mesurer son armee sans passer par une feuille */
function renderRosterQuick(){
  const host = el("rosterQuick"); if(!host) return;
  const r = window.ROSTER && window.ROSTER.actives();
  host.innerHTML = "";
  if(!r || !r.unites.length) return;
  const lbl = document.createElement("span");
  lbl.className = "lbl";
  lbl.innerHTML = 'Dans <b>' + r.liste + '</b>';
  host.appendChild(lbl);
  const wrap = document.createElement("div");
  wrap.className = "chips tight";
  const vus = new Set();
  r.unites.forEach(x=>{
    const cle = x.nom + "|" + x.taille + "|" + x.arme;
    if(vus.has(cle)) return;
    vus.add(cle);
    const u = unitRow(x.nom); if(!u) return;
    const wl = unitWeps(x.nom), w = wl[x.arme] || wl[0];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (x.nom === curUnit && x.taille === curSize && x.arme === curWeapon ? " on" : "");
    b.innerHTML = x.nom + (x.perso ? "" : " ×" + x.taille) +
      '<small>' + (w ? w[1] : "—") + '</small>';
    b.addEventListener("click", ()=>{
      curUnit = x.nom; curWeapon = x.arme;
      const tailles = u[6];
      curSize = tailles.indexOf(x.taille) >= 0 ? x.taille : tailles[tailles.length-1];
      applyWeapon();
    });
    wrap.appendChild(b);
  });
  host.appendChild(wrap);
}
window.__syncRosterQuick = renderRosterQuick;

/* Plein ecran — la barre d'adresse du navigateur mange une bonne part de
   la hauteur. L'API n'existe pas sur Safari iOS : le bouton n'y apparait
   pas, seule l'installation sur l'ecran d'accueil y donne le plein ecran. */
(function initPleinEcran(){
  const r = document.documentElement, b = el("btnFull");
  if(!b) return;
  const demande = r.requestFullscreen || r.webkitRequestFullscreen;
  const sortie = document.exitFullscreen || document.webkitExitFullscreen;
  if(!demande) return;                    /* Safari iOS : rien a proposer */
  b.hidden = false;
  const actif = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const refletat = ()=>{
    b.classList.toggle("on", actif());
    b.textContent = actif() ? "⤢" : "⛶";
    b.setAttribute("aria-label", actif() ? "Quitter le plein écran" : "Passer en plein écran");
  };
  b.addEventListener("click", ()=>{
    if(actif()) sortie.call(document);
    else demande.call(r).catch(()=>{});
  });
  document.addEventListener("fullscreenchange", refletat);
  document.addEventListener("webkitfullscreenchange", refletat);
  refletat();
})();

el("pickUnit").addEventListener("click", ()=>{ window.__rosterPick=false; el("uSearch").value=""; el("sheetUnit").querySelector("h3").textContent="Choisir l'unité"; renderUnitList(); openSheet("sheetUnit"); });
el("pickTarget").addEventListener("click", ()=>{ el("tSearch").value=""; renderTargetList(); openSheet("sheetTarget"); });
el("uSearch").addEventListener("input", renderUnitList);
el("tSearch").addEventListener("input", renderTargetList);
el("tTabs").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    tgtTab = b.dataset.t;
    el("tTabs").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    renderTargetList();
  }));
window.addEventListener("resize", hideTip);

buildSegs(); bindFields(); renderProfiles();
applyGenericTarget("Space Marine");
applyWeapon();

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=> navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
global.SIM = {S, unitRow, unitWeps, parseFlags, GENERIC_TARGETS,
  applyGenericTarget, applyNecronTarget, drawBars, binned, pct, num,
  get tgtName(){ return tgtName; }, get tgtUnit(){ return tgtUnit; }};
})(window);
