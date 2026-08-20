/* ==========================================================
   Moteur de sequence d'attaque — Warhammer 40 000, 11e ed.
   Un profil "S" contient l'attaquant ET la cible :
   attaquant : attacks, bs, str, ap, dmg, torrent, lethal, dev,
               sustainedOn/sustainedN, blast, rapidOn/rapidN,
               meltaOn/meltaN, critH, critW, hitMod, wndMod, rrH, rrW
   cible     : tough, sv, inv, wounds, models, fnp, dmgRed, cover
   ========================================================== */
(function(global){
"use strict";

function parseDice(str){
  const s = String(str||"").replace(/\s+/g,"").toLowerCase();
  if(!s) return null;
  let m = s.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if(m) return {n: m[1]?+m[1]:1, f:+m[2], b: m[3]?+m[3]:0};
  m = s.match(/^(\d+)$/);
  if(m) return {n:0,f:0,b:+m[1]};
  return null;
}
const diceMean = d => d ? d.n*(d.f+1)/2 + d.b : 0;
function diceRoll(d){
  if(!d) return 0;
  let t = d.b;
  for(let i=0;i<d.n;i++) t += 1 + (Math.random()*d.f|0);
  return t < 0 ? 0 : t;
}
function scaleDice(expr, k){
  const d = parseDice(expr);
  if(!d || k === 1) return String(expr);
  if(d.n === 0) return String(d.b * k);
  const b = d.b * k;
  return (d.n*k) + "D" + d.f + (b ? (b>0?"+":"") + b : "");
}

function sets(target, mod, critThr){
  mod = Math.max(-1, Math.min(1, mod));
  const ok = [], crit = [];
  for(let r=1;r<=6;r++){
    const isCrit = r >= critThr;
    const success = isCrit ? true : (r===1 ? false : (r+mod) >= target);
    ok[r] = success; crit[r] = isCrit && success;
  }
  return {ok, crit};
}
function probs(st, rr){
  let s=0,c=0;
  for(let r=1;r<=6;r++){ if(st.ok[r]) s++; if(st.crit[r]) c++; }
  let ps = s/6, pc = c/6;
  if(rr === "ones"){ ps += (1/6)*ps; pc += (1/6)*pc; }
  else if(rr === "failed"){ const pf = 1 - s/6; ps += pf*ps; pc += pf*pc; }
  return {ps, pc};
}
function woundTarget(str, tou){
  if(str >= 2*tou) return 2;
  if(str >  tou)   return 3;
  if(str === tou)  return 4;
  if(2*str <= tou) return 6;
  return 5;
}
function saveTarget(s){
  if(s.sv >= 7 && !s.inv) return 99;
  let arm = s.sv >= 7 ? 99 : s.sv + s.ap;
  if(s.cover && s.sv < 7 && !(s.sv <= 3 && s.ap === 0)) arm -= 1;
  let t = arm;
  if(s.inv) t = Math.min(t, s.inv);
  return t;
}
const passProb = t => t >= 7 ? 0 : Math.min(5/6, (7 - Math.max(t,2))/6);

/* degats moyens par attaque non sauvegardee, reduction incluse (plancher 1) */
function meanDamagePerHit(s){
  const d = parseDice(s.dmg) || {n:0,f:0,b:1};
  const bonus = (s.meltaOn ? s.meltaN : 0) - (s.dmgRed||0);
  if(d.n === 0) return Math.max(1, d.b + bonus);
  if(Math.pow(d.f, d.n) <= 20000){
    let sum = 0, count = 0;
    const rec = (left, acc) => {
      if(left === 0){ sum += Math.max(1, acc + d.b + bonus); count++; return; }
      for(let i=1;i<=d.f;i++) rec(left-1, acc+i);
    };
    rec(d.n, 0);
    return sum / count;
  }
  return Math.max(1, diceMean(d) + bonus);
}

/* ---------- esperances exactes ---------- */
function analytic(s){
  const atk = parseDice(s.attacks) || {n:0,f:0,b:0};
  const blast = s.blast ? Math.floor(s.models/5) : 0;
  const rapid = s.rapidOn ? s.rapidN : 0;
  const A = diceMean(atk) + blast + rapid;

  const hitSet = sets(s.bs, s.hitMod, s.critH);
  const hp = s.torrent ? {ps:1, pc:0} : probs(hitSet, s.rrH);
  const wt = woundTarget(s.str, s.tough);
  const wSet = sets(wt, s.wndMod, s.critW);
  const wp = probs(wSet, s.rrW);
  const st = saveTarget(s);
  const pSave = passProb(st);
  const sust = s.sustainedOn ? diceMean(parseDice(s.sustainedN) || {n:0,f:0,b:1}) : 0;

  const critHits = A * hp.pc;
  const hits = A*hp.ps + critHits*sust;
  const toWound = A*(hp.ps - hp.pc) + critHits*sust + (s.lethal ? 0 : critHits);
  const autoW = s.lethal ? critHits : 0;
  const cWounds = toWound * wp.pc;
  const nWounds = toWound * (wp.ps - wp.pc) + autoW;
  const wounds = nWounds + cWounds;
  const bypass = s.dev ? cWounds : 0;
  const pool = s.dev ? nWounds : wounds;
  const unsaved = pool * (1 - pSave) + bypass;

  const fnpKeep = s.fnp ? 1 - passProb(s.fnp) : 1;
  const rawDmg = unsaved * meanDamagePerHit(s) * fnpKeep;
  return {A, hits, wounds, unsaved, rawDmg, wt, st};
}

/* ---------- precalcul pour la simulation ---------- */
const roll = () => 1 + (Math.random()*6|0);
function prep(s){
  return {
    atk: parseDice(s.attacks) || {n:0,f:0,b:0},
    dmgD: parseDice(s.dmg) || {n:0,f:0,b:1},
    blast: s.blast ? Math.floor(s.models/5) : 0,
    rapid: s.rapidOn ? s.rapidN : 0,
    hitSet: sets(s.bs, s.hitMod, s.critH),
    wSet: sets(woundTarget(s.str, s.tough), s.wndMod, s.critW),
    st: saveTarget(s),
    sustD: s.sustainedOn ? (parseDice(s.sustainedN) || {n:0,f:0,b:1}) : null,
    bonus: (s.meltaOn ? s.meltaN : 0) - (s.dmgRed||0),
    torrent: !!s.torrent, lethal: !!s.lethal, dev: !!s.dev,
    fnp: s.fnp|0, rrH: s.rrH, rrW: s.rrW
  };
}
/* nombre d'attaques non sauvegardees sur un jet complet */
function rollUnsaved(P){
  let A = diceRoll(P.atk) + P.blast + P.rapid;
  if(A < 0) A = 0;
  let normalHits = 0, autoWounds = 0;
  if(P.torrent){ normalHits = A; }
  else for(let i=0;i<A;i++){
    let r = roll();
    if((P.rrH==="ones" && r===1) || (P.rrH==="failed" && !P.hitSet.ok[r])) r = roll();
    if(!P.hitSet.ok[r]) continue;
    if(P.hitSet.crit[r]){
      if(P.sustD) normalHits += diceRoll(P.sustD);
      if(P.lethal) autoWounds++; else normalHits++;
    } else normalHits++;
  }
  let pool = autoWounds, bypass = 0;
  for(let i=0;i<normalHits;i++){
    let r = roll();
    if((P.rrW==="ones" && r===1) || (P.rrW==="failed" && !P.wSet.ok[r])) r = roll();
    if(!P.wSet.ok[r]) continue;
    if(P.wSet.crit[r] && P.dev) bypass++; else pool++;
  }
  let unsaved = bypass;
  for(let i=0;i<pool;i++){ const r = roll(); if(r === 1 || r < P.st) unsaved++; }
  return unsaved;
}
/* degats effectivement subis pour une attaque non sauvegardee */
function rollDamage(P){
  let d = diceRoll(P.dmgD) + P.bonus;
  if(d < 1) d = 1;
  if(P.fnp){
    let kept = 0;
    for(let j=0;j<d;j++){ const r = roll(); if(r===1 || r<P.fnp) kept++; }
    d = kept;
  }
  return d;
}

/* ---------- simulation : un seul profil ---------- */
/* ---------- comptage a taille libre ----------
   La cible n'est plus un vivier ferme. Ce qui interesse le joueur n'est
   pas « est-ce que je balaie exactement ces cinq marines » mais « combien
   j'en couche, et avec quelle certitude » : le tir continue donc sur des
   figurines fraiches au lieu d'etre tronque a l'effectif declare.
   L'ancienne lecture reste exacte et se derive : la chance de balayer une
   unite de M figurines vaut P(tuees >= M).                             */
const pousse = (t, i) => { t[i] = (t[i] || 0) + 1; };
function fige(t, N){
  const out = new Float64Array(t.length);
  for(let i=0;i<t.length;i++) out[i] = (t[i] || 0) / N;
  return out;
}
/* le plus grand nombre de figurines couchees avec au moins cette
   certitude : le plus grand k tel que P(tuees >= k) >= seuil */
function seuilTues(dist, seuil){
  let cum = 0;
  for(let i = dist.length - 1; i >= 0; i--){
    cum += dist[i];
    if(cum >= seuil - 1e-9) return i;
  }
  return 0;
}
/* P(tuees >= k) */
function auMoins(dist, k){
  let cum = 0;
  for(let i = Math.max(0, k); i < dist.length; i++) cum += dist[i];
  return cum;
}

function simulate(s, N){
  const P = prep(s), W = s.wounds;
  const slainCount = [], dmgCount = [];
  let sumDealt=0, sumRaw=0, sumSlain=0;
  for(let it=0; it<N; it++){
    const unsaved = rollUnsaved(P);
    let cur=W, slain=0, dealt=0, raw=0;
    for(let i=0;i<unsaved;i++){
      const d = rollDamage(P);
      raw += d;
      const applied = d < cur ? d : cur;
      dealt += applied; cur -= applied;
      if(cur <= 0){ slain++; cur = W; }
    }
    pousse(slainCount, slain); pousse(dmgCount, dealt);
    sumDealt += dealt; sumRaw += raw; sumSlain += slain;
  }
  return { slainDist: fige(slainCount, N), dmgDist: fige(dmgCount, N), N,
           meanDealt:sumDealt/N, meanRaw:sumRaw/N, meanSlain:sumSlain/N };
}

/* ---------- simulation : plusieurs profils sur LA MEME cible ----------
   Tous les profils tirent dans l'ordre de la liste sur le meme pool de
   figurines : la surtue d'un profil penalise les suivants, exactement
   comme en partie.                                                     */
function simulateCombined(list, N){
  if(!list.length) return null;
  const preps = list.map(prep);
  const W = list[0].wounds;
  const slainCount = [], dmgCount = [];
  const perDealt = new Float64Array(list.length);
  const perRaw = new Float64Array(list.length);
  let sumDealt=0, sumRaw=0, sumSlain=0;

  for(let it=0; it<N; it++){
    let cur=W, slain=0, dealt=0;
    for(let pi=0; pi<preps.length; pi++){
      const P = preps[pi];
      const unsaved = rollUnsaved(P);
      let mine = 0, mineRaw = 0;
      for(let i=0;i<unsaved;i++){
        const d = rollDamage(P);
        mineRaw += d;
        const applied = d < cur ? d : cur;
        mine += applied; cur -= applied;
        if(cur <= 0){ slain++; cur = W; }
      }
      perDealt[pi] += mine; perRaw[pi] += mineRaw;
      dealt += mine; sumRaw += mineRaw;
    }
    pousse(slainCount, slain); pousse(dmgCount, dealt);
    sumDealt += dealt; sumSlain += slain;
  }
  const per = [];
  for(let i=0;i<list.length;i++) per.push({dealt: perDealt[i]/N, raw: perRaw[i]/N});
  return { slainDist: fige(slainCount, N), dmgDist: fige(dmgCount, N), N, per,
           meanDealt:sumDealt/N, meanRaw:sumRaw/N, meanSlain:sumSlain/N };
}

global.ENG = {parseDice, diceMean, diceRoll, scaleDice, sets, probs, woundTarget,
              saveTarget, passProb, meanDamagePerHit, analytic, simulate, simulateCombined,
              seuilTues, auMoins};
})(typeof window !== "undefined" ? window : globalThis);
