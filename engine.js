/* ==========================================================
   Moteur de sequence d'attaque — Warhammer 40 000, 11e ed.
   Un profil "S" contient l'attaquant ET la cible :
   attaquant : attacks, atkMod, bs, str, strMod, ap, dmg, torrent, lethal, dev,
               sustainedOn/sustainedN, blast, rapidOn/rapidN,
               meltaOn/meltaN, critH, critW, hitMod, wndMod, rrH, rrW,
               apMod, dmgMod, ignoresCover, indirect, ignoreMalus, kind,
               toughMod, rrH1, rrW1, rrD, lance, charge, psychic,
               bsMod, bsSet, strSet, atkSet, dmgSet, apCrit, rrA
   cible     : tough, sv, inv, wounds, models, fnp, dmgRed, cover,
               fnpPsy, defHit, defWnd, defWndFE, dmgHalf, svMod

   apMod, dmgMod et strMod sont les retouches de partie : une regle qui
   ameliore la penetration d'armure de 1 (« +1 » : une PA -1 devient -2),
   qui ajoute un point de degats, ou qui augmente la Force. Ils s'ecrivent
   a part du profil d'arme, qui reste celui de la fiche.

   strMod n'est PAS un modificateur de jet : il change la caracteristique
   de Force AVANT la comparaison avec l'Endurance, ce qui peut faire
   franchir un palier — F5 contre E5 blesse a 4+, F6 contre E5 a 3+.

   CE QUE LE CABLAGE NE SAVAIT PAS DIRE (30/10/2026)
   — toughMod : l'attaquant retouche l'ENDURANCE de la cible. Le Don de
     Nurgle de la Death Guard ote 1 a celle d'une cible Affligee ; c'est
     un champ de l'attaquant, parce que c'est sa regle qui le fait.
   — rrH1, rrW1 : UNE relance, pas « les 1 » ni « les rates ». Elle ne
     reprend qu'un de deja rate et jamais relance (un de ne se relance
     qu'une fois). rrH/rrW acceptent aussi « deux » : les 1 et les 2.
   — rrD : relance du jet de DEGATS, « tous » ou « un ». Le joueur
     relance un jet sous la moyenne du de.
   — lance + charge : [LANCE] donne +1 pour blesser si le porteur a
     charge ce tour. Le mot-cle vient de l'arme, la charge du joueur.
   — psychic : le genre de l'attaque. Il ne change rien a la sequence
     par lui-meme ; il sert a la cible (fnpPsy, une insensibilite contre
     les seules attaques psychiques) et au cablage (une regle `psy` ne
     vaut que pour les armes psychiques de l'unite).
   — bsMod : la CT/CC AMELIOREE (« Pour le Bien Supreme »). Ce n'est pas
     un modificateur de jet : il change la caracteristique, hors du
     plafond a plus ou moins un, comme strMod pour la Force.
   — bsSet, strSet, atkSet, dmgSet : une caracteristique FIXEE par une
     regle (« la CT de cette arme est 3+ », « Degats 3 »). Elle remplace
     celle de la fiche, avant toute retouche.
   — apCrit : ce qu'une blessure CRITIQUE ajoute a la penetration.
   — rrA : relance du NOMBRE d'attaques (« Overwhelming Generosity ») :
     un jet d'attaques sous la moyenne du de est repris.
   Cote cible, les defenses que l'onglet Encaisser ne savait pas lire :
   defHit et defWnd (un -1 au jet de touche ou de blessure de qui
   l'attaque), defWndFE (le meme -1, seulement si la Force depasse
   l'Endurance), dmgHalf (degats divises par deux, arrondis au superieur),
   svMod (sauvegarde d'armure amelioree, l'invulnerable n'en profite pas).
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
/* La Force effective : celle de l'arme, plus ce que la partie ajoute.
   Elle ne descend pas sous 1 — une arme de Force 0 ne blesse rien, et
   les regles n'en connaissent pas. */
const force = s => Math.max(1, (s.strSet ? +s.strSet : (+s.str || 0)) + (+s.strMod || 0));
/* L'Endurance que l'attaque rencontre : celle de la cible, moins ce que
   la regle de l'attaquant lui retire. Jamais sous 1. */
const endurance = s => Math.max(1, (+s.tough || 0) + (+s.toughMod || 0));
/* La CT/CC reellement lue : la fiche, ou la valeur fixee par une regle,
   amelioree de bsMod. Jamais mieux que 2+ : un 1 rate toujours. */
const ctEffective = s => Math.max(2, Math.min(7, (s.bsSet ? +s.bsSet : (+s.bs || 4)) - (+s.bsMod || 0)));
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
  else if(rr === "deux"){ const pf = (st.ok[2] ? 1 : 2)/6; ps += pf*ps; pc += pf*pc; }
  else if(rr === "failed"){ const pf = 1 - s/6; ps += pf*ps; pc += pf*pc; }
  return {ps, pc};
}
/* le de est-il relance par la politique « rr » ? */
const relance = (rr, st, r) => !st.ok[r] &&
  (rr === "failed" || (rr === "ones" && r === 1) || (rr === "deux" && r <= 2));
/* La part d'un de qui rate SANS avoir ete relance : c'est le seul qu'une
   relance unique peut reprendre. */
function rateSansRelance(st, rr){
  let n = 0;
  for(let r=1;r<=6;r++) if(!st.ok[r] && !relance(rr, st, r)) n++;
  return n/6;
}
/* Une relance UNIQUE sur n jets : elle sert des qu'au moins un de rate
   sans avoir ete relance, ce qui arrive avec la probabilite
   1-(1-q)^n. On la reporte sur chaque de pour garder des probabilites
   « par attaque ». n est un nombre moyen de jets : la dispersion de ce
   nombre est negligee, ce qui surestime a peine quand n est petit. */
function avecUne(p, st, rr, n){
  if(!(n > 0)) return p;
  const q = rateSansRelance(st, rr);
  if(!q) return p;
  const sert = 1 - Math.pow(1 - q, n);
  let s=0, c=0;
  for(let r=1;r<=6;r++){ if(st.ok[r]) s++; if(st.crit[r]) c++; }
  return {ps: p.ps + sert*(s/6)/n, pc: p.pc + sert*(c/6)/n};
}
function woundTarget(str, tou){
  if(str >= 2*tou) return 2;
  if(str >  tou)   return 3;
  if(str === tou)  return 4;
  if(2*str <= tou) return 6;
  return 5;
}
/* penetration d'armure reellement appliquee : celle de l'arme, plus la
   retouche de partie. Elle ne descend pas sous zero — une regle qui
   degrade une PA 0 ne rend pas la sauvegarde meilleure que nature. */
const apEffectif = s => Math.max(0, (s.ap || 0) + (s.apMod || 0));
/* Le couvert ne touche plus la sauvegarde en 11e edition : il est passe
   sur le jet de touche (voir normalise). La sauvegarde ne depend donc
   plus que de l'armure, de la penetration et de l'invulnerable. */
function saveTarget(s, apPlus){
  if(s.sv >= 7 && !s.inv) return 99;
  /* svMod ameliore l'ARMURE (« A Couvert ! », l'Imagifer) ; il ne
     franchit pas 2+ et ne touche pas l'invulnerable */
  const sv = Math.max(2, s.sv - (s.svMod || 0));
  const arm = s.sv >= 7 ? 99 : sv + Math.max(0, apEffectif(s) + (apPlus || 0));
  return s.inv ? Math.min(arm, s.inv) : arm;
}
const passProb = t => t >= 7 ? 0 : Math.min(5/6, (7 - Math.max(t,2))/6);

/* Trois regles ne se lisent pas dans la sequence mais la deplacent
   avant qu'elle ne commence :

   — Le couvert. En 11e edition il ne donne plus le +1 en sauvegarde :
     la cible a couvert impose un -1 au jet pour la toucher. Il ne vaut
     que contre les attaques de tir — une arme de melee ne connait pas
     le couvert — d'ou le test sur « kind ».
   — Tir indirect : on tire sans voir la cible. Le jet de touche subit
     un -1 et la cible beneficie du couvert, qu'elle soit a l'abri ou
     non. Ce n'est pas automatique — une arme a tir indirect qui voit
     sa cible tire normalement — d'ou le drapeau pose par le joueur.
   — Ignore le couvert : le couvert de la cible ne compte pas. Il
     l'emporte donc sur celui que le tir indirect vient d'offrir.

   Les -1 s'ajoutent aux autres modificateurs de touche puis le tout est
   plafonne a plus ou moins un, comme le veut la regle : une cible a
   couvert visee par un tir indirect ne subit qu'un seul -1. */
function normalise(s){
  const q = Object.assign({}, s);
  /* les caracteristiques fixees et la CT amelioree se resolvent d'abord :
     tout ce qui suit lit la caracteristique, plus la fiche */
  q.bs = ctEffective(s);
  if(s.atkSet) q.attacks = String(s.atkSet);
  if(s.dmgSet) q.dmg = String(s.dmgSet);
  if(s.strSet){ q.str = +s.strSet; q.strSet = 0; }
  let m = q.hitMod || 0;
  /* la cible qui impose un -1 a qui l'attaque (Umbral Evasion, Deft
     Parry...) : un malus comme les autres, que « ignore les malus »
     efface aussi */
  m += (s.defHit || 0);
  const indirect = !!s.indirect;
  /* « ignore les malus au jet de touche » : le -1 du couvert et celui
     du tir indirect en sont, puisqu'en 11e edition tous deux passent
     par le jet de touche. Le bonus, lui, reste. */
  if(s.ignoreMalus){
    q.hitMod = Math.max(0, Math.min(1, s.hitMod || 0));
    q.cover = false;
  } else {
    const couvert = (!!s.cover || indirect) && !s.ignoresCover && s.kind !== "C";
    if(indirect) m -= 1;
    if(couvert) m -= 1;
    q.hitMod = Math.max(-1, Math.min(1, m));
    /* « q.cover » dit la verite a l'affichage au lieu de repeter la case
       cochee : couvert coche en melee, ou contre une arme qui l'ignore */
    q.cover = couvert;
  }
  /* le jet de blessure : [LANCE] apres une charge, et les defenses de la
     cible — d'office, ou seulement si la Force depasse l'Endurance */
  let w = (s.wndMod || 0) + ((s.lance && s.charge) ? 1 : 0) + (s.defWnd || 0);
  if(s.defWndFE && force(q) > endurance(q)) w += s.defWndFE;
  q.wndMod = Math.max(-1, Math.min(1, w));
  /* l'insensibilite contre les attaques psychiques ne vaut que contre
     elles, et seulement si elle bat celle que la cible a deja */
  /* « un » dans rrH/rrW/rrD vient de l'ecran : c'est la relance unique */
  if(q.rrH === "un"){ q.rrH = "none"; q.rrH1 = true; }
  if(q.rrW === "un"){ q.rrW = "none"; q.rrW1 = true; }
  if(s.psychic && s.fnpPsy && (!s.fnp || s.fnpPsy < s.fnp)) q.fnp = s.fnpPsy;
  return q;
}

/* Les degats d'une attaque non sauvegardee, un resultat de des donne :
   la reduction de la cible, puis la moitie (arrondie au superieur), et
   jamais moins de 1. */
const finDegats = (x, bonus, half) => {
  let d = Math.max(1, x + bonus);
  if(half) d = Math.ceil(d / 2);
  return d;
};
/* Tous les resultats d'un jet de degats, ou null si l'espace est trop
   grand pour etre parcouru (on retombe alors sur la moyenne). */
function issuesDe(d){
  if(d.n === 0) return [d.b];
  if(Math.pow(d.f, d.n) > 20000) return null;
  const out = [];
  const rec = (left, acc) => {
    if(left === 0){ out.push(acc + d.b); return; }
    for(let i=1;i<=d.f;i++) rec(left-1, acc+i);
  };
  rec(d.n, 0);
  return out;
}
/* Ce que vaut une attaque non sauvegardee : moyenne sans relance, avec
   relance de chaque jet sous la moyenne du de, et le gain d'UNE relance
   ramene a la probabilite qu'un jet soit faible. */
function degatsDetail(s){
  const d = parseDice(s.dmgSet ? String(s.dmgSet) : s.dmg) || {n:0,f:0,b:1};
  const bonus = (s.meltaOn ? s.meltaN : 0) + (s.dmgMod||0) - (s.dmgRed||0);
  const half = !!s.dmgHalf;
  const xs = issuesDe(d);
  if(!xs){
    const m = finDegats(diceMean(d), bonus, half);
    return {plain:m, tous:m, pLow:0, gainLow:0};
  }
  const moy = diceMean(d);
  const vals = xs.map(x => finDegats(x, bonus, half));
  const plain = vals.reduce((a,v)=>a+v,0) / vals.length;
  let low = 0, sumLow = 0, tous = 0;
  xs.forEach((x,i)=>{
    if(x < moy){ low++; sumLow += vals[i]; tous += plain; }
    else tous += vals[i];
  });
  tous /= xs.length;
  const pLow = low / xs.length;
  return {plain, tous, pLow, gainLow: low ? plain - sumLow/low : 0};
}
/* degats moyens par attaque non sauvegardee, reduction incluse (plancher 1) */
function meanDamagePerHit(s){
  const D = degatsDetail(s);
  return s.rrD === "tous" ? D.tous : D.plain;
}

/* Le nombre moyen d'attaques, avec ou sans relance du jet. Les issues
   sous la moyenne valent, une fois relancees, la moyenne elle-meme. */
function moyenneAttaques(d, rrA){
  const m = diceMean(d);
  if(!rrA || rrA === "none" || !d.n) return m;
  const xs = issuesDe(d);
  if(!xs) return m;
  return xs.reduce((a, x) => a + (x < m ? m : x), 0) / xs.length;
}
/* ---------- esperances exactes ---------- */
function analytic(s0){
  const s = normalise(s0);
  const atk = parseDice(s.attacks) || {n:0,f:0,b:0};
  const blast = s.blast ? Math.floor(s.models/5) : 0;
  const rapid = s.rapidOn ? s.rapidN : 0;
  /* atkMod : ce qu'une regle ajoute a la caracteristique d'Attaques.
     L'aura de Skarbrand donne +1 en melee, le Slaughterbound +3 sur ses
     propres armes. Ca s'ajoute au nombre d'attaques, pas au jet — et ca
     ne descend jamais sous zero, une regle qui retire des attaques ne
     peut pas en rendre de negatives. */
  const A = Math.max(0, moyenneAttaques(atk, s.rrA) + blast + rapid + (s.atkMod || 0));

  const hitSet = sets(s.bs, s.hitMod, s.critH);
  let hp = s.torrent ? {ps:1, pc:0} : probs(hitSet, s.rrH);
  if(!s.torrent && s.rrH1) hp = avecUne(hp, hitSet, s.rrH, A);
  const wt = woundTarget(force(s), endurance(s));
  const wSet = sets(wt, s.wndMod, s.critW);
  let wp = probs(wSet, s.rrW);
  const st = saveTarget(s);
  const pSave = passProb(st);
  /* une blessure critique peut percer davantage (apCrit) */
  const pSaveC = s.apCrit ? passProb(saveTarget(s, s.apCrit)) : pSave;
  const sust = s.sustainedOn ? diceMean(parseDice(s.sustainedN) || {n:0,f:0,b:1}) : 0;

  const critHits = A * hp.pc;
  const hits = A*hp.ps + critHits*sust;
  const toWound = A*(hp.ps - hp.pc) + critHits*sust + (s.lethal ? 0 : critHits);
  if(s.rrW1) wp = avecUne(wp, wSet, s.rrW, toWound);
  const autoW = s.lethal ? critHits : 0;
  const cWounds = toWound * wp.pc;
  const nWounds = toWound * (wp.ps - wp.pc) + autoW;
  const wounds = nWounds + cWounds;
  const unsaved = nWounds * (1 - pSave) + (s.dev ? cWounds : cWounds * (1 - pSaveC));

  const fnpKeep = s.fnp ? 1 - passProb(s.fnp) : 1;
  const D = degatsDetail(s);
  let parAttaque = s.rrD === "tous" ? D.tous : D.plain;
  let rawDmg = unsaved * parAttaque * fnpKeep;
  /* UNE relance de degats : elle ne sert qu'une fois, sur le premier jet
     faible, ce qui arrive avec la probabilite 1-(1-pLow)^unsaved */
  if(s.rrD === "un" && D.pLow > 0 && unsaved > 0)
    rawDmg += (1 - Math.pow(1 - D.pLow, unsaved)) * D.gainLow * fnpKeep;
  return {A, hits, wounds, unsaved, rawDmg, wt, st};
}

/* ---------- precalcul pour la simulation ---------- */
const roll = () => 1 + (Math.random()*6|0);
function prep(s0){
  const s = normalise(s0);
  const dmgD = parseDice(s.dmg) || {n:0,f:0,b:1};
  return {
    atk: parseDice(s.attacks) || {n:0,f:0,b:0},
    rrA: !!s.rrA && s.rrA !== "none",
    dmgD, dmgMoy: diceMean(dmgD),
    blast: s.blast ? Math.floor(s.models/5) : 0,
    rapid: s.rapidOn ? s.rapidN : 0,
    atkMod: s.atkMod || 0,
    hitSet: sets(s.bs, s.hitMod, s.critH),
    wSet: sets(woundTarget(force(s), endurance(s)), s.wndMod, s.critW),
    st: saveTarget(s),
    stC: s.apCrit ? saveTarget(s, s.apCrit) : saveTarget(s),
    sustD: s.sustainedOn ? (parseDice(s.sustainedN) || {n:0,f:0,b:1}) : null,
    bonus: (s.meltaOn ? s.meltaN : 0) + (s.dmgMod||0) - (s.dmgRed||0),
    half: !!s.dmgHalf,
    torrent: !!s.torrent, lethal: !!s.lethal, dev: !!s.dev,
    fnp: s.fnp|0, rrH: s.rrH, rrW: s.rrW,
    rrH1: !!s.rrH1, rrW1: !!s.rrW1, rrD: s.rrD || "none"
  };
}
/* Les relances UNIQUES d'une sequence : une fois prise, elle ne revient
   pas. Quand plusieurs profils tirent ensemble, ils partagent le meme
   etat — c'est UNE relance pour l'unite, pas une par arme. */
const neuves = () => ({h:false, w:false, d:false});
/* un jet, sa relance selon la politique, puis la relance unique s'il
   rate encore et n'a pas deja ete relance */
function jette(set, rr, une, U, cle){
  let r = roll();
  if(relance(rr, set, r)) return roll();
  if(une && !U[cle] && !set.ok[r]){ U[cle] = true; r = roll(); }
  return r;
}
/* nombre d'attaques non sauvegardees sur un jet complet */
function rollUnsaved(P, U){
  U = U || neuves();
  let x = diceRoll(P.atk);
  if(P.rrA && P.atk.n && x < diceMean(P.atk)) x = diceRoll(P.atk);
  let A = x + P.blast + P.rapid + P.atkMod;
  if(A < 0) A = 0;
  let normalHits = 0, autoWounds = 0;
  if(P.torrent){ normalHits = A; }
  else for(let i=0;i<A;i++){
    const r = jette(P.hitSet, P.rrH, P.rrH1, U, "h");
    if(!P.hitSet.ok[r]) continue;
    if(P.hitSet.crit[r]){
      if(P.sustD) normalHits += diceRoll(P.sustD);
      if(P.lethal) autoWounds++; else normalHits++;
    } else normalHits++;
  }
  let pool = autoWounds, poolC = 0, bypass = 0;
  for(let i=0;i<normalHits;i++){
    const r = jette(P.wSet, P.rrW, P.rrW1, U, "w");
    if(!P.wSet.ok[r]) continue;
    if(P.wSet.crit[r]){ if(P.dev) bypass++; else poolC++; }
    else pool++;
  }
  let unsaved = bypass;
  for(let i=0;i<pool;i++){ const r = roll(); if(r === 1 || r < P.st) unsaved++; }
  for(let i=0;i<poolC;i++){ const r = roll(); if(r === 1 || r < P.stC) unsaved++; }
  return unsaved;
}
/* degats effectivement subis pour une attaque non sauvegardee */
function rollDamage(P, U){
  U = U || neuves();
  let x = diceRoll(P.dmgD);
  /* on relance un jet sous la moyenne du de : c'est ce que fait le
     joueur, et c'est ce qui maximise l'esperance */
  if(P.dmgD.n && x < P.dmgMoy &&
     (P.rrD === "tous" || (P.rrD === "un" && !U.d))){
    if(P.rrD === "un") U.d = true;
    x = diceRoll(P.dmgD);
  }
  let d = finDegats(x, P.bonus, P.half);
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
  /* Une unite peut melanger des figurines de resistance differente : le
     Roi Silencieux tient 16 PV, chacun de ses Menhirs 5. `pvPool` donne
     les PV figurine par figurine, dans l'ordre ou le defenseur les
     sacrifie. Absent — le cas courant — tout le monde a W. */
  const pool = (s.pvPool && s.pvPool.length) ? s.pvPool : null;
  const pvDe = k => pool ? pool[k % pool.length] : W;
  const slainCount = [], dmgCount = [];
  let sumDealt=0, sumRaw=0, sumSlain=0;
  for(let it=0; it<N; it++){
    const U = neuves();
    const unsaved = rollUnsaved(P, U);
    let k=0, cur=pvDe(0), slain=0, dealt=0, raw=0;
    for(let i=0;i<unsaved;i++){
      const d = rollDamage(P, U);
      raw += d;
      const applied = d < cur ? d : cur;
      dealt += applied; cur -= applied;
      if(cur <= 0){ slain++; k++; cur = pvDe(k); }
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
  /* meme pool que ci-dessus : la cible est la meme pour tous les profils */
  const pool = (list[0].pvPool && list[0].pvPool.length) ? list[0].pvPool : null;
  const pvDe = k => pool ? pool[k % pool.length] : W;
  const slainCount = [], dmgCount = [];
  const perDealt = new Float64Array(list.length);
  const perRaw = new Float64Array(list.length);
  let sumDealt=0, sumRaw=0, sumSlain=0;

  for(let it=0; it<N; it++){
    let k=0, cur=pvDe(0), slain=0, dealt=0;
    const U = neuves();
    for(let pi=0; pi<preps.length; pi++){
      const P = preps[pi];
      const unsaved = rollUnsaved(P, U);
      let mine = 0, mineRaw = 0;
      for(let i=0;i<unsaved;i++){
        const d = rollDamage(P, U);
        mineRaw += d;
        const applied = d < cur ? d : cur;
        mine += applied; cur -= applied;
        if(cur <= 0){ slain++; k++; cur = pvDe(k); }
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
              saveTarget, apEffectif, passProb, endurance, force, ctEffective, meanDamagePerHit, analytic, simulate,
              normalise,
              simulateCombined, seuilTues, auMoins};
})(typeof window !== "undefined" ? window : globalThis);
