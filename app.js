(function(global){
"use strict";
const el = id => document.getElementById(id);

/* ==========================================================
   ÉTAT
   ========================================================== */
const S = {
  wName:"", attacks:"20", kind:"T", bs:3, str:5, ap:1, dmg:"1",
  tough:4, sv:3, inv:0, wounds:2, models:5, fnp:0, dmgRed:0, cover:false,
  torrent:false, lethal:true, dev:false, sustainedOn:false, sustainedN:"1",
  blast:false, rapidOn:false, rapidN:1, meltaOn:false, meltaN:2,
  critH:6, critW:6, hitMod:0, wndMod:0, rrH:"none", rrW:"none",
  apMod:0, dmgMod:0, ignoresCover:false, indirect:false, ignoreMalus:false,
  /* ce que la cible EST — plusieurs règles ne valent que contre un
     certain genre d'unité, et le moteur ne connaissait d'elle que des
     chiffres */
  kwCible:{}
};
let viewMode = "auto";
let curUnit = "Immortals", curWeapon = 0, curSize = 10;
let tgtTab = "generic";

/* ==========================================================
   L'ATTAQUANT : UNE ARME, OU UNE UNITE ENTIERE
   Mesurer une arme seule repond a « que vaut ce fusil ». Mais on ne
   tire jamais un fusil : on tire une unite, avec ses armes speciales,
   son arme de melee par defaut et l'armement du personnage qui la mene.
   Le second mode charge donc tous les profils d'une unite de la liste
   et les fait tirer dans l'ordre sur la meme cible, comme le tir cumule
   le fait deja entre unites.
   ========================================================== */
let atkMode = "profil";      /* "profil" | "unite" */
let atkPhase = "T";          /* phase choisie quand une unite est chargee */
let atkUnitId = null;
let atkUnit = null;          /* ce que ROSTER.simUnite a rendu */
let atkOff = {};             /* profils decoches, par etiquette */
let condOn = {};             /* aptitudes conditionnelles declarees */

/* ==========================================================
   DÉS
   ========================================================== */
const {parseDice,diceMean,diceRoll,scaleDice,sets,probs,woundTarget,saveTarget,
       passProb,meanDamagePerHit,analytic,simulate,seuilTues,auMoins} = ENG;

/* Ce qu'on veut savoir d'un paquet d'attaques n'est pas « est-ce que je
   balaie exactement cette unite » mais combien de figurines tombent, et
   avec quelle certitude. */
const SEUILS = [[0.95,"à coup sûr"],[0.9,"9 fois sur 10"],[0.75,"3 fois sur 4"],[0.5,"1 fois sur 2"]];
function rendSeuils(host, dist){
  if(!host) return;
  host.innerHTML = SEUILS.map(([q,lbl])=>{
    const k = seuilTues(dist, q);
    return '<div class="seuil' + (k ? '' : ' faible') + '"><span class="sk">' + lbl +
      '</span><span class="sv">' + k + '</span></div>';
  }).join("");
}

/* Les cibles generiques sont des archetypes, pas des fiches officielles :
   l'application ne connait que les Necrons. Elles servent a se faire une
   idee — pour un chiffre exact contre un adversaire reel, on saisit son
   profil et on le garde (voir « cibles gardees »). */
const NATURE_CIBLE = {
  "Garde impérial":"Infanterie légère", "Ork Boy":"Infanterie légère",
  "Aeldari (Guardian)":"Infanterie légère",
  "Space Marine":"Infanterie lourde", "Marine Gravis":"Infanterie lourde",
  "Genestealer":"Infanterie lourde", "Guerrier tyranide":"Infanterie lourde",
  "Terminator":"Élite", "Custodes":"Élite",
  "Transport (T9)":"Véhicule & monstre", "Char lourd (T11)":"Véhicule & monstre",
  "Knight (T12)":"Véhicule & monstre"
};
const NATURE_ORDRE = ["Infanterie légère","Infanterie lourde","Élite","Véhicule & monstre"];

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
  ["segApMod","apMod",[[-1,"−1"],[0,"0"],[1,"+1"],[2,"+2"]]],
  ["segDmgMod","dmgMod",[[-1,"−1"],[0,"0"],[1,"+1"],[2,"+2"]]],
  ["segRrH","rrH",[["none","—"],["ones","1"],["failed","Ratés"]]],
  ["segRrW","rrW",[["none","—"],["ones","1"],["failed","Ratés"]]]
];
const TEXTF = ["wName","attacks","dmg"];
const NUMF  = ["str","tough","wounds","models"];
/* les mots-cles d'arme ne sont plus des cases a cocher empilees mais des
   pastilles dessinees par renderCaps ; « couvert » reste sur la cible */
const CHKF  = ["cover"];

function buildSegs(){
  SEGS.forEach(([id,key,opts])=>{
    const host = el(id); if(!host) return;
    host.innerHTML = "";
    opts.forEach(([v,label])=>{
      const b = document.createElement("button");
      b.type="button"; b.textContent=label; b.dataset.v=String(v);
      b.addEventListener("click", ()=>{ S[key]=v; syncSeg(id,key);
        if(atkMode === "unite") renderAtkUnite();
        majVite(); render(); });
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
  TEXTF.forEach(k=> el(k).addEventListener("input", e=>{ S[k]=e.target.value;
    if(atkMode === "unite") renderAtkUnite();
    render(); }));
  NUMF.forEach(k=> el(k).addEventListener("input", e=>{
    const v = parseInt(e.target.value,10); if(!isNaN(v)) S[k]=Math.max(1,Math.min(60,v)); render();
  }));
  CHKF.forEach(k=> el(k).addEventListener("change", e=>{ S[k]=e.target.checked;
    if(atkMode === "unite") renderAtkUnite();
    majVite(); render(); }));
}
function pushState(){
  TEXTF.forEach(k=> el(k).value = S[k]);
  NUMF.forEach(k=> el(k).value = S[k]);
  CHKF.forEach(k=> el(k).checked = S[k]);
  SEGS.forEach(([id,key])=> syncSeg(id,key));
  renderCaps();
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
/* « anti:2:veh » : le seuil de blessure critique, puis le mot-cle vise.
   Anti-X ne vaut QUE contre ce mot-cle — c'est le sens meme de la regle,
   et l'appliquer sans condition surestime l'arme partout ailleurs. Une
   valeur sans mot-cle (« anti:4 ») est une fiche qu'on n'a pas encore pu
   lire : faute de savoir contre quoi, elle vaut partout, et l'ecran le
   dit au lieu de le taire. */
function antiDe(f){
  if(!f || !f.anti) return null;
  const p = String(f.anti).split(":"), seuil = +p[0];
  return seuil ? { seuil: seuil, kw: p[1] || "" } : null;
}
const antiActif = (a, kw) => !!a && (!a.kw || !!(kw || {})[a.kw]);
const nomMotCible = k => ((typeof MOTS_CIBLE !== "undefined" ? MOTS_CIBLE : [])
                          .find(x => x[0] === k) || [k, k])[1];
const libelleAnti = a => "Anti-" + (a.kw ? nomMotCible(a.kw) : "X") + " " + a.seuil + "+";

const unitRow  = n => UNITS.find(u => u[0] === n);
const unitWeps = n => WEAPONS.filter(w => w[0] === n);

function applyWeapon(){
  const u = unitRow(curUnit), list = unitWeps(curUnit);
  if(!u || !list.length) return;
  if(curWeapon >= list.length) curWeapon = 0;
  const w = list[curWeapon], f = parseFlags(w[8]);
  const sizes = u[6];
  if(sizes.indexOf(curSize) < 0) curSize = sizes[sizes.length-1];

  S.wName   = w[1];
  S.kind    = w[2];
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
  S.critW   = antiActif(antiDe(f), S.kwCible) ? antiDe(f).seuil : 6;
  S.rrW     = f.twin ? "failed" : "none";
  /* Ignore le couvert est une propriete de l'arme : elle vaut toujours.
     Le tir indirect, lui, se decide au moment de tirer — une arme qui
     voit sa cible tire normalement — donc il part eteint. */
  S.ignoresCover = !!f.ignorescover;
  S.indirect = false;
  refreshAttacker();
  pushState(); render();
}

function refreshAttacker(){
  const u = unitRow(curUnit), list = unitWeps(curUnit);
  const w = list[curWeapon] || list[0], f = parseFlags(w[8]);

  el("puName").textContent = curUnit + (u[10] ? "  (Legends)" : "");
  el("puSub").textContent = (u[1] ? "M " + u[1] + "\"" : "M —") + " · E" + u[2] + " · Svg " + u[3] + "+" +
    (u[4] ? " / " + u[4] + "++" : "") + " · " + u[5] + " PV" +
    (ptsPour(u, curSize, 1) ? " · " + ptsPour(u, curSize, 1) + " pts" : "");

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
    const pSz = ptsPour(u, sz, 1);
    b.textContent = "×" + sz + (pSz ? " · " + pSz + " pts" : "");
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
  const anti = antiDe(f);
  if(anti) kws.push(libelleAnti(anti) +
                    (antiActif(anti, S.kwCible) ? "" : " — inactif"));
  const notes = [];
  Object.keys(KWLABEL).forEach(k=>{ if(f[k]) notes.push(KWLABEL[k]); });

  const warn = [];
  if(u[6].length > 1) warn.push("Calculé pour " + curSize + " figurines portant cette arme.");
  if(f.rf) warn.push("Rapid Fire compté (à mi-portée) — décoche-le dans « Capacités » si tu tires de loin.");
  if(anti && !anti.kw)
    warn.push("Anti-X : le mot-clé visé n'est pas au catalogue, l'aptitude est donc appliquée sans condition — à corriger sur la fiche.");
  else if(anti && !antiActif(anti, S.kwCible))
    warn.push("Anti-" + nomMotCible(anti.kw) + " ne joue pas : la cible ne porte pas ce mot-clé.");
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

/* ---------- cibles gardees ----------
   L'application ne connait que les fiches necrones. Contre un adversaire
   reel, le seul profil exact est celui que le joueur saisit lui-meme :
   on le lui fait garder plutot que d'inventer des caracteristiques
   d'autres factions. */
const CLE_CIBLES = "mathhammer.cibles.v1";
const CHAMPS_CIBLE = ["tough","sv","inv","wounds","models","fnp","dmgRed"];
/* les mots-cles font partie de la cible : une cible gardee sans eux
   rappellerait des chiffres justes et des regles fausses */
const clesKw = o => Object.keys(o || {}).filter(k => o[k]).sort().join(",");
let ciblesGardees = [];
function chargeCibles(){
  try{ const b = JSON.parse(localStorage.getItem(CLE_CIBLES) || "[]");
       ciblesGardees = Array.isArray(b) ? b : []; }
  catch(e){ ciblesGardees = []; }
}
const sauveCibles = () => {
  try{ localStorage.setItem(CLE_CIBLES, JSON.stringify(ciblesGardees)); }catch(e){}
};
const resumeCible = c => "E" + c.tough + " · Svg " + c.sv + "+" +
  (c.inv ? "/" + c.inv + "++" : "") + " · " + c.wounds + " PV ×" + c.models +
  (c.fnp ? " · FNP " + c.fnp + "+" : "") + (c.dmgRed ? " · -" + c.dmgRed + " D" : "");
/* la cible de l'ecran est-elle exactement celle-ci ? */
const memeCible = c => CHAMPS_CIBLE.every(k => S[k] === c[k]) &&
  clesKw(S.kwCible) === (c.kw || []).slice().sort().join(",");

function gardeCible(){
  const propose = tgtName && tgtName !== "Space Marine" ? tgtName : "";
  const nom = (window.prompt("Nom de cette cible ?", propose) || "").trim();
  if(!nom) return;
  const c = {nom: nom};
  CHAMPS_CIBLE.forEach(k => c[k] = S[k]);
  c.kw = Object.keys(S.kwCible).filter(k => S.kwCible[k]);
  const i = ciblesGardees.findIndex(x => x.nom === nom);
  if(i >= 0) ciblesGardees[i] = c; else ciblesGardees.push(c);
  sauveCibles(); tgtName = nom; tgtUnit = null;
  refreshTarget(); render();
}
function appliqueCibleGardee(c){
  CHAMPS_CIBLE.forEach(k => S[k] = c[k]);
  poseKwCible(c.kw);
  tgtName = c.nom; tgtUnit = null;
  refreshTarget(); pushState(); render();
}
function renderCiblesGardees(){
  const host = el("cibGardees"); if(!host) return;
  host.innerHTML = "";
  ciblesGardees.forEach(c=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cg" + (memeCible(c) ? " on" : "");
    b.innerHTML = '<b>' + c.nom + '</b><i>' + resumeCible(c) + '</i>';
    b.addEventListener("click", ()=> appliqueCibleGardee(c));
    const x = document.createElement("span");
    x.className = "x"; x.textContent = "×"; x.title = "Oublier « " + c.nom + " »";
    x.addEventListener("click", e=>{
      e.stopPropagation();
      ciblesGardees = ciblesGardees.filter(y => y.nom !== c.nom);
      sauveCibles(); renderCiblesGardees();
    });
    b.appendChild(x);
    host.appendChild(b);
  });
}
/* Les mots-cles de la cible se devinent de ce qu'on vient de choisir —
   un Char lourd est un vehicule, un Monolithe aussi — et restent
   modifiables : l'application ne connait pas les armees adverses, et
   l'archetype « Space Marine » couvre autant une escouade tactique
   qu'un personnage a pied. */
function poseKwCible(liste){
  S.kwCible = {};
  (liste || []).forEach(k => { S.kwCible[k] = true; });
  majAnti();
}
/* Changer de cible change ce qu'Anti-X vaut. Le seuil se repose donc
   tout seul — mais uniquement sur une arme qui porte le drapeau : un
   seuil regle a la main sur une autre arme n'a aucune raison de sauter. */
function majAnti(){
  const list = (typeof curUnit === "undefined") ? null : unitWeps(curUnit);
  if(!list || !list.length) return;
  const w = list[curWeapon] || list[0];
  const a = antiDe(parseFlags(w[8]));
  if(!a) return;
  S.critW = antiActif(a, S.kwCible) ? a.seuil : 6;
}
/* la categorie d'une unite necron : « categorie() » vit dans roster.js,
   hors de portee d'ici, mais la table brute est dans data.js */
const catDe = nom => {
  const t = (typeof CAT !== "undefined") ? CAT.find(x => x[0] === nom) : null;
  return t ? t[1] : "Autre";
};
const kwDeCategorie = cat => {
  const tbl = (typeof KW_CATEGORIE !== "undefined") ? KW_CATEGORIE : {};
  return (tbl[cat] || []).slice();
};
function applyGenericTarget(name){
  const p = GENERIC_TARGETS.find(t => t[0] === name);
  if(!p) return;
  Object.assign(S, p[1]);
  poseKwCible((typeof KW_ARCHETYPE !== "undefined" ? KW_ARCHETYPE : {})[name]);
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
  poseKwCible(kwDeCategorie(catDe(name)));
  tgtName = name; tgtUnit = u; tgtSize = size;
  refreshTarget(); pushState(); render();
}
/* le nom retenu, le profil reellement en vigueur, et l'etat des cibles
   gardees — tout ce qui doit suivre la moindre retouche */
function majResumeCible(){
  const n = el("ptName"); if(!n) return;
  n.textContent = tgtName;
  el("ptSub").textContent = "E" + S.tough + " · Svg " + S.sv + "+" + (S.inv ? " / " + S.inv + "++" : "") +
    " · " + S.wounds + " PV × " + S.models + (S.fnp ? " · FNP " + S.fnp + "+" : "") +
    (S.dmgRed ? " · -" + S.dmgRed + " dégât" : "");
  renderCiblesGardees();
}
/* les mots-cles, en pastilles, sous le profil de la cible */
function renderKwCible(){
  const host = el("kwCible"); if(!host) return;
  const tbl = (typeof MOTS_CIBLE !== "undefined") ? MOTS_CIBLE : [];
  host.innerHTML = "";
  tbl.forEach(([k, nom])=>{
    const on = !!S.kwCible[k];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "kwc" + (on ? " on" : "");
    b.textContent = nom;
    b.addEventListener("click", ()=>{
      if(on) delete S.kwCible[k]; else S.kwCible[k] = true;
      /* une regle peut s'allumer ou s'eteindre : les profils changent */
      renderKwCible();
      if(atkMode === "unite") rechargeUnite(); else render();
    });
    host.appendChild(b);
  });
}
function refreshTarget(){
  majResumeCible();
  renderKwCible();
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
    /* le simulateur n'est pas une liste : le prix s'y donne au tarif de
       la premiere copie, sans rang a compter */
    const pts = ptsPour(u, u[6][u[6].length-1], 1);
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
    /* douze entrees a la file se lisaient mal : on les range par nature,
       qui est justement le critere avec lequel on choisit une cible */
    const bouton = ([name,p])=>{
      const b = document.createElement("button");
      b.type="button"; b.className = "opt" + (name===tgtName ? " sel" : "");
      b.innerHTML = '<span class="oi"><span class="o1">' + name + '</span><span class="o2">E' + p.tough +
        " · Svg " + p.sv + "+" + (p.inv ? "/" + p.inv + "++" : "") + " · " + p.wounds + " PV × " + p.models + '</span></span>';
      b.addEventListener("click", ()=>{ closeSheet("sheetTarget"); applyGenericTarget(name); });
      return b;
    };
    NATURE_ORDRE.forEach(nat=>{
      const lot = list.filter(t => NATURE_CIBLE[t[0]] === nat);
      if(!lot.length) return;
      const sep = document.createElement("div");
      sep.className = "sheet-sep"; sep.textContent = nat;
      host.appendChild(sep);
      lot.forEach(t => host.appendChild(bouton(t)));
    });
    const orphelines = list.filter(t => !NATURE_CIBLE[t[0]]);
    orphelines.forEach(t => host.appendChild(bouton(t)));
    const note = document.createElement("p");
    note.className = "hint";
    note.style.padding = "10px 14px 4px";
    note.textContent = "Ces profils sont des archétypes : l'application ne connaît " +
      "en propre que les fiches nécrones. Pour un chiffre exact contre un adversaire, " +
      "saisis son profil et garde-le.";
    host.appendChild(note);
  } else if(tgtTab === "roster"){
    /* Viser une unite de sa propre liste : l'effectif reel, et
       l'insensibilite qu'un Technomancien rattache lui donne — ce que le
       catalogue seul ne sait pas. */
    const r = window.ROSTER && window.ROSTER.simListe();
    const lot = (r && r.unites || []).filter(x => !q || norm(x.nom).includes(q));
    if(!lot.length){
      host.innerHTML = '<div class="sheet-empty">' +
        (r && r.unites.length ? "Aucune unité de ta liste ne correspond."
          : "Ta liste ouverte est vide.") + '</div>';
      return;
    }
    lot.forEach(x=>{
      const c = window.ROSTER.simCible(x.id); if(!c) return;
      const b = document.createElement("button");
      b.type="button"; b.className = "opt" + (x.nom===tgtName ? " sel" : "");
      b.innerHTML = '<span class="oi"><span class="o1">' + x.nom + '</span><span class="o2">' +
        resumeCible(c) + (x.persos.length ? ' · ' + x.persos.join(", ") : '') + '</span></span>';
      b.addEventListener("click", ()=>{
        closeSheet("sheetTarget");
        CHAMPS_CIBLE.forEach(k => S[k] = c[k]);
        /* une unite de ma liste sait ce qu'elle est : simListe donne
           deja sa categorie */
        poseKwCible(kwDeCategorie(x.cat || catDe(x.unite)));
        tgtName = x.nom; tgtUnit = null;
        refreshTarget(); pushState(); render();
      });
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
   L'UNITE ENTIERE COMME ATTAQUANT
   ========================================================== */
const FORCE_RR = {none:0, ones:1, failed:2};
const plusFort = (a, b) => (FORCE_RR[a] || 0) >= (FORCE_RR[b] || 0) ? a : b;
const borne1 = v => Math.max(-1, Math.min(1, v));

/* Un profil charge n'apporte que son arme. La cible et les retouches de
   partie viennent de l'ecran : c'est ce qui permet de regler « couvert,
   Lourd, relance des 1 » une seule fois pour toute l'unite au lieu de
   dix fois arme par arme. Les modificateurs de la fiche et ceux de
   l'ecran s'additionnent avant le plafond a plus ou moins un ; une
   relance de l'ecran ne peut qu'ameliorer celle de l'arme. */
/* Les conditions declarees ne touchent que les profils qu'elles visent :
   « Mû par la Haine » est l'aptitude du Seigneur Lokhust et ne vaut que
   pour ses armes a lui, pas pour l'escouade qu'il mene. Une condition
   sans porteur — une aura d'armee — vaut pour toute l'unite. */
function condPour(p){
  if(!atkUnit || !atkUnit.conditions) return [];
  return atkUnit.conditions.filter(c => condOn[c.id] &&
    (!c.sur || c.sur === p.porteur));
}
function profilPourMoteur(p){
  const q = Object.assign({}, p, {
    tough:S.tough, sv:S.sv, inv:S.inv, wounds:S.wounds, models:S.models,
    fnp:S.fnp, dmgRed:S.dmgRed, cover:S.cover,
    hitMod: borne1((p.hitMod || 0) + S.hitMod),
    wndMod: borne1((p.wndMod || 0) + S.wndMod),
    /* la PA et les degats octroyes par une aura — le +1 en penetration
       d'Illuminor Szeras — etaient jusqu'ici ecrases par la valeur de
       l'ecran au lieu de s'y ajouter */
    apMod: (p.apMod || 0) + S.apMod,
    dmgMod: (p.dmgMod || 0) + S.dmgMod,
    rrH: plusFort(p.rrH || "none", S.rrH),
    rrW: plusFort(p.rrW || "none", S.rrW),
    /* Quand une unite entiere est chargee, la carte des capacites ne
       decrit plus une arme : elle decrit ce que la partie ajoute a
       toutes ses armes — un stratageme qui donne Lethal, un Anti-X
       pretee, un seuil de touche critique abaisse. Elle n'enleve donc
       jamais ce qu'une arme possede deja : tout se cumule vers le
       mieux, ce qui permet de cocher une fois pour l'unite au lieu de
       dix fois arme par arme. */
    torrent: !!p.torrent || S.torrent,
    lethal:  !!p.lethal  || S.lethal,
    dev:     !!p.dev     || S.dev,
    blast:   !!p.blast   || S.blast,
    sustainedOn: !!p.sustainedOn || S.sustainedOn,
    sustainedN:  p.sustainedOn ? p.sustainedN : S.sustainedN,
    critH: Math.min(p.critH === undefined ? 6 : p.critH, S.critH),
    critW: Math.min(p.critW === undefined ? 6 : p.critW, S.critW),
    /* Tir Rapide et Fonte ne sont pas des mots-cles a offrir mais une
       distance : chaque arme applique les SIENS, et seulement si l'on
       est a mi-portee. Une unite chargee tirait jusqu'ici comme si
       elle etait toujours collee a la cible. */
    rapidOn: !!p.rapidOn && !!S.rapidOn,
    meltaOn: !!p.meltaOn && !!S.meltaOn,
    /* le couvert ignore s'ajoute — l'arme l'a, ou la partie l'accorde */
    ignoresCover: !!p.ignoresCover || !!S.ignoresCover,
    ignoreMalus: !!S.ignoreMalus,
    /* le tir indirect demande les deux : que l'arme le permette, et que
       le joueur declare qu'il tire sans voir */
    indirect: !!p.indirectCap && !!S.indirect
  });
  /* « tout jet REUSSI devient critique » n'est pas un seuil fixe : il
     suit la caracteristique et ses modificateurs. La Faim de Chair des
     Ecorcheurs, notee 2+, faisait toucher l'unite sur 2+ au lieu de 3+,
     puisqu'une touche critique reussit toujours. La demande reste donc
     en attente et se resout apres la boucle, modificateurs connus. */
  let toutH = false, toutW = false;
  condPour(p).forEach(c=>{
    if(c.mot) q[c.mot === "sust" ? "sustainedOn" : c.mot] = true;
    else if(c.champ === "critH") { if(c.val === "tous") toutH = true;
                                   else q.critH = Math.min(q.critH, c.val); }
    else if(c.champ === "critW") { if(c.val === "tous") toutW = true;
                                   else q.critW = Math.min(q.critW, c.val); }
    else if(c.champ === "rrH") q.rrH = plusFort(q.rrH, c.val);
    else if(c.champ === "rrW") q.rrW = plusFort(q.rrW, c.val);
    else if(c.champ === "hitMod") q.hitMod = borne1(q.hitMod + c.val);
    else if(c.champ === "wndMod") q.wndMod = borne1(q.wndMod + c.val);
    else if(c.champ === "apMod") q.apMod = (q.apMod || 0) + c.val;
    else if(c.champ === "strMod") q.str = Math.max(1, q.str + c.val);
    else if(c.champ === "dmgMod") q.dmgMod = (q.dmgMod || 0) + c.val;
  });
  /* le plus petit jet qui reussisse : la caracteristique moins le
     modificateur, et jamais moins de 2 puisqu'un 1 rate toujours */
  const plancher = (cible, mod) => Math.max(2, cible - Math.max(-1, Math.min(1, mod || 0)));
  if(toutH) q.critH = Math.min(q.critH, plancher(q.bs, q.hitMod));
  if(toutW) q.critW = Math.min(q.critW, plancher(ENG.woundTarget(q.str, q.tough), q.wndMod));
  return q;
}
const profilsActifs = () => !atkUnit ? [] :
  atkUnit.profils.filter(p => !atkOff[p.label]);

/* Ce que le moteur va reellement faire de ce profil, dit en clair.
   Un crit 5+ applique mais invisible ne se verifie pas, et un joueur
   qui ne peut pas verifier ne fait pas confiance au chiffre. Les
   pastilles se lisent donc sur le profil DEJA retouche, pas sur la
   fiche : ce qui s'affiche est ce qui sera calcule. */
const RR_MOT = {ones:"des 1", failed:"des ratés"};
function pastilles(q, brut){
  const out = [];
  /* d'ou vient ce mot-cle : de la fiche de l'arme, ou d'une regle qui le
     lui accorde. La distinction compte — c'est elle qui dit au joueur si
     son detachement fait bien ce qu'il croit. */
  const donne = m => (brut.octrois || []).filter(o => o.mot === m)
                       .map(o => o.nom + " · " + o.source).join(" ; ");
  const kw = (t, m) => { const d = m ? donne(m) : "";
    out.push({t: (d ? "+ " : "") + t, cl: d ? "m" : "k", d: d}); };
  if(q.torrent) kw("TORRENT", "torrent");
  if(q.lethal) kw("LÉTHAL", "lethal");
  if(q.dev) kw("DÉVASTATRICES", "dev");
  if(q.sustainedOn) kw("SOUTENU " + q.sustainedN, "sust");
  if(q.blast) kw("DÉFLAGRATION", "blast");
  if(q.rapidOn) kw("TIR RAPIDE " + q.rapidN, "rf");
  if(q.meltaOn) kw("FONTE " + q.meltaN, "melta");
  /* l'arme le porte, mais la distance ne le donne pas. On l'affiche
     eteint plutot que de le cacher : sinon le joueur croit que
     l'application a oublie le mot-cle de sa fiche. */
  if(!q.rapidOn && brut.rapidOn) out.push({t:"TIR RAPIDE " + brut.rapidN, cl:"d", d:"hors mi-portée"});
  if(!q.meltaOn && brut.meltaOn) out.push({t:"FONTE " + brut.meltaN, cl:"d", d:"hors mi-portée"});
  if(q.ignoresCover) kw("IGNORE LE COUVERT", "ignorescover");
  if(q.ignoreMalus) out.push({t:"MALUS IGNORÉS", cl:"m", d:"aucun malus au jet de touche"});
  if(q.indirect) out.push({t:"TIR INDIRECT", cl:"m", d:"−1 pour toucher, cible à couvert"});
  else if(brut.indirectCap) out.push({t:"TIR INDIRECT", cl:"d", d:"la cible est en vue"});
  /* les mots-cles que la sequence d'attaque ne traduit pas : ils se
     lisent quand meme, sinon le joueur croit que sa fiche a ete perdue */
  if(q.pistol) kw("PISTOLET", "pistol");
  if(q.precision) kw("PRÉCISION", "precision");
  if(q.oneshot) kw("TIR UNIQUE", "oneshot");
  if(q.extra) kw("ATTAQUES SUPP.", "extra");
  if(q.assault) kw("ASSAUT", "assault");
  if(q.heavy) kw("LOURD", "heavy");
  /* la provenance : ce que la fiche seule ne donnait pas */
  const dit = c => (brut.octrois || []).filter(o => o.champ === c || (c === "mot" && o.mot))
                     .map(o => o.nom + " · " + o.source).join(" ; ");
  if(q.critH < 6) out.push({t:"Touche crit. " + q.critH + "+", cl:"m", d:dit("critH")});
  if(q.critW < 6) out.push({t:"Blessure crit. " + q.critW + "+", cl:"m",
                            d:dit("critW") ||
                              (brut.anti && antiActif(brut.anti, S.kwCible)
                                 ? libelleAnti(brut.anti) : "")});
  else if(brut.anti) out.push({t:libelleAnti(brut.anti).toUpperCase(), cl:"d",
                               d:brut.anti.kw ? "la cible ne porte pas ce mot-clé"
                                              : "mot-clé visé inconnu au catalogue"});
  if(q.rrH !== "none") out.push({t:"Relance touche " + RR_MOT[q.rrH], cl:"m", d:dit("rrH")});
  if(q.rrW !== "none") out.push({t:"Relance blessure " + RR_MOT[q.rrW], cl:"m", d:dit("rrW")});
  /* le modificateur de touche porte sa cause : un -1 qui arrive sans nom
     ne se verifie pas, et le couvert comme le tir indirect passent
     desormais par la, pas par la sauvegarde. Quand un bonus les annule,
     on le dit plutot que de ne rien afficher. */
  const causeH = [];
  if(q.cover) causeH.push("cible à couvert");
  if(q.indirect) causeH.push("tir indirect");
  if(q.hitMod) out.push({t:(q.hitMod > 0 ? "+" : "−") + "1 pour toucher", cl:"m",
                         d:causeH.join(" ; ")});
  else if(causeH.length) out.push({t:causeH.join(" + ").toUpperCase(), cl:"d",
                                   d:"compensé par un bonus"});
  if(q.wndMod) out.push({t:(q.wndMod > 0 ? "+" : "−") + "1 pour blesser", cl:"m", d:""});
  /* la Force retouchee par une condition : la ligne montre deja le
     chiffre final, la pastille dit qu'il a bouge */
  if(brut.str !== undefined && q.str !== brut.str)
    out.push({t:"F " + (q.str > brut.str ? "+" : "−") + Math.abs(q.str - brut.str), cl:"m", d:""});
  if(q.apMod) out.push({t:"PA " + (q.apMod > 0 ? "+" : "−") + Math.abs(q.apMod), cl:"m", d:""});
  if(q.dmgMod) out.push({t:"Dégâts " + (q.dmgMod > 0 ? "+" : "−") + Math.abs(q.dmgMod), cl:"m", d:""});
  return out;
}

function chargeUnite(id){
  if(!window.ROSTER || !window.ROSTER.simUnite) return;
  const u = window.ROSTER.simUnite(id, atkPhase);
  if(!u) return;
  atkUnitId = id; atkUnit = u;
  /* les mots-cles « aussi sur cette arme » se lisent sur l'unite
     chargee : sans ce redessin ils resteraient ceux de l'arme d'avant */
  renderCaps();
  renderAtkUnite(); render();
}
function rechargeUnite(){
  if(atkUnitId !== null) chargeUnite(atkUnitId);
  else { renderAtkUnite(); render(); }
}

function renderAtkUnite(){
  const nom = el("ruName"), sub = el("ruSub"), host = el("atkProfils");
  if(!nom || !host) return;
  if(!atkUnit){
    nom.textContent = "Aucune unité chargée";
    sub.textContent = "Choisis une unité de ta liste";
    host.innerHTML = '<p class="hint">Rien n\'est chargé. Le bouton ci-dessus liste les unités de la liste ouverte, avec leurs personnages rattachés.</p>';
    return;
  }
  nom.textContent = atkUnit.nom;
  sub.textContent = atkUnit.unite + " ×" + atkUnit.taille +
    (atkUnit.persos.length ? "  ·  " + atkUnit.persos.join(", ") : "");
  host.innerHTML = "";
  if(!atkUnit.profils.length){
    host.innerHTML = '<p class="hint">Cette unité n\'a aucune arme ' +
      (atkPhase === "C" ? "de mêlée" : "de tir") + '.</p>';
    return;
  }
  const lbl = document.createElement("div");
  lbl.className = "proflbl";
  const n = profilsActifs().length;
  lbl.innerHTML = '<span>' + n + ' profil' + (n > 1 ? 's' : '') + ' sur ' +
    atkUnit.profils.length + ' tirent sur la cible</span>' +
    '<button type="button" class="ghost mini" id="btnAllProf">' +
    (n === atkUnit.profils.length ? "Tout décocher" : "Tout cocher") + '</button>';
  host.appendChild(lbl);
  lbl.querySelector("#btnAllProf").addEventListener("click", ()=>{
    const tout = n === atkUnit.profils.length;
    atkUnit.profils.forEach(p => { atkOff[p.label] = tout; });
    renderAtkUnite(); render();
  });
  atkUnit.profils.forEach(p=>{
    const actif = !atkOff[p.label];
    const row = document.createElement("button");
    row.type = "button";
    row.className = "profrow" + (actif ? " on" : "");
    /* on affiche le profil tel que le moteur le verra, tir indirect
       compris : sinon la ligne annonce un jet de touche que le calcul
       ne fait pas */
    const q = ENG.normalise(profilPourMoteur(p));
    const past = pastilles(q, p);
    row.innerHTML = '<span class="pbox">' + (actif ? "✓" : "") + '</span>' +
      '<span class="pmain"><b>' + p.label + '</b>' +
      '<i>A ' + q.attacks + ' · ' + (p.kind === "C" ? "CC" : "CT") + ' ' + q.bs + '+' +
      ' · F ' + q.str + ' · PA ' + (ENG.apEffectif(q) ? "-" + ENG.apEffectif(q) : "0") +
      ' · D ' + q.dmg + '</i>' +
      (past.length ? '<span class="pkw">' + past.map(x =>
        '<span class="pk-' + x.cl + '"' + (x.d ? ' title="' + x.d.replace(/"/g, "&quot;") + '"' : '') +
        '>' + x.t + (x.d ? '<em>' + x.d + '</em>' : '') + '</span>').join("") + '</span>' : '') +
      '</span>';
    row.addEventListener("click", ()=>{
      atkOff[p.label] = actif; renderAtkUnite(); render();
    });
    host.appendChild(row);
  });
}

/* le choix de l'unite a charger */
function renderRosterUnitList(){
  const host = el("ruList"); if(!host) return;
  host.innerHTML = "";
  const r = window.ROSTER && window.ROSTER.simListe && window.ROSTER.simListe();
  if(!r || !r.unites.length){
    host.innerHTML = '<div class="sheet-empty">Aucune liste ouverte, ou liste vide. ' +
      'Monte une liste dans l\'onglet Listes : elle apparaîtra ici.</div>';
    return;
  }
  const tete = document.createElement("div");
  tete.className = "sheet-sep";
  tete.textContent = r.nom;
  host.appendChild(tete);
  r.unites.forEach(x=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (String(x.id) === String(atkUnitId) ? " sel" : "");
    const n = atkPhase === "C" ? x.nC : x.nT;
    /* l'armement en clair : deux escouades du meme nom et du meme
       effectif ne se distinguent que par lui */
    b.innerHTML = '<span class="oi"><span class="o1">' + x.nom + '</span><span class="o2">' +
      x.unite + ' ×' + x.taille +
      (x.persos.length ? ' · ' + x.persos.join(", ") : '') +
      (x.enh ? ' · ' + x.enh : '') + '</span>' +
      (x.armes ? '<span class="oarm">' + x.armes + '</span>' : '') +
      '<span class="o2">' + x.nT + ' profil' + (x.nT > 1 ? 's' : '') + ' de tir, ' +
      x.nC + ' au corps à corps</span></span>' +
      (n ? '' : '<span class="otag">RIEN ICI</span>');
    b.addEventListener("click", ()=>{
      atkOff = {}; condOn = {};
      closeSheet("sheetRosterUnit");
      chargeUnite(x.id);
    });
    host.appendChild(b);
  });
}

/* ==========================================================
   RETOUCHES DE PARTIE — les raccourcis
   Ce ne sont pas des regles de l'application mais les situations qui
   reviennent a chaque tour : on entre dans un couvert, on reste
   immobile avec une arme lourde, on tire sur un objectif tenu. Chacune
   se pose et se retire d'une touche.
   ========================================================== */
/* Quatre situations, pas sept raccourcis : les valeurs brutes sont deja
   sous la main dans les segments juste dessous. Ce qui merite un bouton,
   c'est ce qui porte un nom a la table — « je suis dans un couvert »,
   « je n'ai pas bouge », « je tire sur un objectif ». */
const PRESETS = [
  {id:"cover", nom:"Cible à couvert", aide:"−1 pour toucher",
   lis:()=> S.cover,            met:v=>{ S.cover = v; }},
  {id:"heavy", nom:"+1 pour toucher", aide:"Lourd immobile, Protocoles…",
   lis:()=> S.hitMod === 1,     met:v=>{ S.hitMod = v ? 1 : 0; }},
  {id:"rr1",   nom:"Relance des 1",   aide:"aux jets de touche",
   lis:()=> S.rrH === "ones",   met:v=>{ S.rrH = v ? "ones" : "none"; }},
  {id:"rrw",   nom:"Cible sur objectif", aide:"relance les blessures ratées",
   lis:()=> S.rrW === "failed", met:v=>{ S.rrW = v ? "failed" : "none"; }}
];
/* Ce qui ne vaut que pour une unite entiere : trois choses qu'on
   change plusieurs fois par partie et qui, sans ces boutons, obligeaient
   a descendre dans la carte des capacites arme par arme. */
const PRESETS_UNITE = [
  {id:"mi",    nom:"À mi-portée",     aide:"Tir Rapide et Fonte comptent",
   lis:()=> S.rapidOn && S.meltaOn, met:v=>{ S.rapidOn = v; S.meltaOn = v; }},
  {id:"leth",  nom:"Léthal pour tous", aide:"stratagème, protocole…",
   lis:()=> S.lethal,               met:v=>{ S.lethal = v; }},
  {id:"crit5", nom:"Touche crit. 5+",  aide:"sur toutes les armes",
   lis:()=> S.critH <= 5,           met:v=>{ S.critH = v ? 5 : 6; }}
];
function renderPresets(){
  const host = el("vitePresets"); if(!host) return;
  host.innerHTML = "";
  const bouton = pr => {
    const on = pr.lis();
    const b = document.createElement("button");
    b.type = "button";
    b.className = "vpre" + (on ? " on" : "");
    b.innerHTML = pr.nom + (pr.aide ? '<small>' + pr.aide + '</small>' : '');
    b.addEventListener("click", ()=>{ pr.met(!on); pushState(); renderAtkUnite(); majVite(); render(); });
    host.appendChild(b);
  };
  const sep = txt => { const d = document.createElement("div");
    d.className = "vsep"; d.textContent = txt; host.appendChild(d); };
  PRESETS.forEach(bouton);
  if(atkMode === "unite"){
    sep("Toutes les armes de l'unité");
    PRESETS_UNITE.forEach(bouton);
  }
  /* Les aptitudes que porte l'unite chargee et qui attendent une
     condition. Elles arrivent sous leur nom officiel : le joueur
     reconnait sa fiche, et sait donc si la condition est remplie. */
  /* Les conditions de detachement, recuperees de l'ecran « Tir cumule »
     qui n'existe plus. Elles ne valent que pour une unite de la liste :
     une arme mesuree seule ne connait aucun detachement. */
  const sit = (atkMode === "unite" && window.ROSTER && window.ROSTER.situations)
    ? window.ROSTER.situations() : [];
  if(sit.length){
    sep("Conditions du détachement");
    sit.forEach(x=>{
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vpre vcond" + (x.on ? " on" : "");
      b.title = x.source;
      b.innerHTML = x.nom + '<small>' + x.source + '</small>';
      b.addEventListener("click", ()=>{
        window.ROSTER.poseSituation(x.cle, !x.on);
        /* la condition change les profils eux-memes : il faut les
           reconstruire, pas seulement les redessiner */
        rechargeUnite(); majVite();
      });
      host.appendChild(b);
    });
  }
  /* Les stratagemes de mes detachements qui changent vraiment un jet.
     Une pastille les pose et les retire comme n'importe quelle
     retouche : leur cout en PC est ecrit, la depense reste au joueur. */
  const DEFAUT_STRAT = { apMod:0, wndMod:0, hitMod:0, rrH:"none", rrW:"none",
                         sustainedOn:false, sustainedN:"1", ignoreMalus:false };
  const st = (atkMode === "unite" && atkUnit && window.ROSTER && window.ROSTER.stratsSimu)
    ? window.ROSTER.stratsSimu(atkUnit.unite, atkUnit.persos, atkPhase) : [];
  if(st.length){
    sep("Stratagèmes");
    st.forEach(x=>{
      const cles = Object.keys(x.effet);
      const on = cles.every(k => S[k] === x.effet[k]);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vpre vstrat" + (on ? " on" : "");
      b.title = x.detach;
      b.innerHTML = '<span class="pc">' + x.pc + ' PC</span>' + x.nom +
        '<small>' + x.aide + '</small>';
      b.addEventListener("click", ()=>{
        cles.forEach(k => { S[k] = on ? DEFAUT_STRAT[k] : x.effet[k]; });
        pushState(); renderAtkUnite(); majVite(); render();
      });
      host.appendChild(b);
    });
  }
  const cond = (atkMode === "unite" && atkUnit && atkUnit.conditions) || [];
  if(cond.length) sep("Aptitudes de " + atkUnit.nom);
  cond.forEach(c=>{
    const on = !!condOn[c.id];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "vpre vcond" + (on ? " on" : "");
    b.title = c.texte;
    b.innerHTML = c.nom + '<small>' + c.quand + '</small>';
    b.addEventListener("click", ()=>{
      condOn[c.id] = !on;
      /* les lignes de profil montrent le profil retouche : sans ce
         redessin, le calcul changeait et l'affichage mentait */
      renderAtkUnite(); majVite(); render();
    });
    host.appendChild(b);
  });

  /* Ce que le detachement fait DEJA, sans rien cocher. C'est applique
     depuis le debut mais rien ne le disait : on ne verifie pas ce qu'on
     ne voit pas. Lecture seule — ce n'est pas une retouche. */
  const regles = (atkMode === "unite" && window.ROSTER && window.ROSTER.reglesDetach)
    ? window.ROSTER.reglesDetach() : [];
  if(!regles.length) return;
  sep("Ce que fait ton détachement");
  regles.forEach(r=>{
    const d = document.createElement("div");
    d.className = "vinfo";
    d.innerHTML = '<b>' + r.nom + '</b><i>' + r.detach +
      (r.conditionnel ? ' · sous condition, voir plus haut' : '') + '</i>' +
      '<span>' + r.texte + '</span>';
    host.appendChild(d);
  });
}
/* combien de retouches sont actives : on doit pouvoir le voir sans
   deplier, parce qu'un +1 oublie fausse toute une soiree de calculs */
function majVite(){
  renderPresets();
  const caps = atkMode !== "unite" ? 0 :
    (S.torrent ? 1 : 0) + (S.lethal ? 1 : 0) + (S.dev ? 1 : 0) +
    (S.sustainedOn ? 1 : 0) + (S.blast ? 1 : 0) + (S.rapidOn ? 1 : 0) +
    (S.meltaOn ? 1 : 0) + (S.critH < 6 ? 1 : 0) + (S.critW < 6 ? 1 : 0) +
    (S.ignoresCover ? 1 : 0) + (S.indirect ? 1 : 0) + (S.ignoreMalus ? 1 : 0);
  const nSit = (atkMode === "unite" && window.ROSTER && window.ROSTER.situations)
    ? window.ROSTER.situations().filter(x => x.on).length : 0;
  const n = nSit + (S.hitMod ? 1 : 0) + (S.wndMod ? 1 : 0) + (S.apMod ? 1 : 0) +
            (S.dmgMod ? 1 : 0) + (S.rrH !== "none" ? 1 : 0) +
            (S.rrW !== "none" ? 1 : 0) + (S.cover ? 1 : 0) + caps +
            Object.keys(condOn).filter(k => condOn[k]).length;
  const c = el("viteCount");
  if(c){ c.textContent = n ? n + " active" + (n > 1 ? "s" : "") : "aucune"; c.className = n ? "on" : ""; }
  const box = el("viteBox");
  if(box) box.classList.toggle("actif", n > 0);
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
  majVite();
  /* Le resume de la cible et les pastilles gardees se lisent sur l'etat
     courant : les recalculer ici, et non seulement au moment ou l'on
     choisit une cible, evite qu'ils affirment autre chose que ce qui est
     reellement simule des qu'on retouche une caracteristique a la main. */
  majResumeCible();
  /* Deux facons de mesurer, un seul rendu. En mode « une arme » on
     simule le profil de l'ecran ; en mode « unite entiere » tous les
     profils coches tirent dans l'ordre sur le meme vivier de figurines,
     de sorte que la surtue de l'arme lourde profite — ou nuit — aux
     suivantes, exactement comme en partie. */
  const lot = (atkMode === "unite") ? profilsActifs().map(profilPourMoteur) : null;
  let a, sim;
  if(lot){
    if(!lot.length){ videResultats(); return; }
    a = lot.map(analytic).reduce((acc, x)=>({
      A: acc.A + x.A, hits: acc.hits + x.hits, wounds: acc.wounds + x.wounds,
      unsaved: acc.unsaved + x.unsaved, rawDmg: acc.rawDmg + x.rawDmg,
      wt: x.wt, st: x.st
    }));
    sim = ENG.simulateCombined(lot, a.A > 120 ? 8000 : 30000);
  } else {
    a = analytic(S);
    sim = simulate(S, a.A > 120 ? 8000 : 30000);
  }
  lastSim = sim;
  const M = S.models;
  const wipe = auMoins(sim.slainDist, M), atLeast1 = 1 - sim.slainDist[0];

  el("sumDmg").textContent = num(sim.meanDealt);
  el("sumSlain").textContent = num(sim.meanSlain);
  el("sumWipe").textContent = String(seuilTues(sim.slainDist, 0.75));

  /* le seuil de touche affiche doit etre celui que le moteur applique :
     le couvert et le tir indirect passent par la normalisation, pas par
     le modificateur de l'ecran */
  const Sn = ENG.normalise(S);
  const steps = [
    ["Attaques", a.A, lot ? lot.length + " profil" + (lot.length > 1 ? "s" : "") : ""],
    ["Touches", a.hits, lot ? "" : (S.torrent ? "auto" : "sur "+Math.max(2,Math.min(6,Sn.bs - Sn.hitMod))+"+")],
    ["Blessures", a.wounds, lot ? "" : "sur "+a.wt+"+"],
    ["Non sauv.", a.unsaved, lot ? "" : (a.st>=7 ? "aucune svg" : "svg "+a.st+"+")],
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
  el("rWipeL").textContent = "Balaye une unité de " + M + " figurine" + (M > 1 ? "s" : "");
  el("rWipe").textContent = pct(wipe);
  rendSeuils(el("rSeuils"), sim.slainDist);
  if(el("tableWrap").style.display !== "none") renderTable();
}

/* aucun profil coche : on le dit plutot que de laisser les anciens
   chiffres a l'ecran, ou l'on croirait mesurer quelque chose */
function videResultats(){
  lastSim = null; lastData = null;
  ["sumDmg","sumSlain","sumWipe","rDmg","rWaste","rSlain","rMed","rOne","rWipe"]
    .forEach(id => { const e = el(id); if(e) e.textContent = "—"; });
  const f = el("funnel");
  if(f) f.innerHTML = '<p class="hint" style="margin:0">Aucun profil sélectionné : coche au moins une arme.</p>';
  ["hist","cum"].forEach(id => { const e = el(id); if(e) e.innerHTML = ""; });
  const sl = el("rSeuils"); if(sl) sl.innerHTML = "";
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
el("modeChips").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    viewMode = b.dataset.m;
    el("modeChips").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    render();
  }));

/* ---------- bascule « une arme » / « une unité entière » ---------- */
/* Les cases de la carte des capacites decrivent l'arme choisie tant
   qu'on mesure une arme seule. Elles changent de sens des qu'une unite
   entiere est chargee : elles s'ajoutent alors a toutes ses armes. On
   les remet donc a zero en entrant dans ce mode — sans quoi le Lethal
   Hits coche par defaut se serait offert a toute la liste — et on rend
   a l'arme les siennes en sortant. */
const CAPF = ["torrent","lethal","dev","sustainedOn","sustainedN","blast",
              "rapidOn","rapidN","meltaOn","meltaN","critH","critW",
              "ignoresCover","indirect","ignoreMalus"];
let capMemo = null;
function videCaps(){
  S.torrent = false; S.lethal = false; S.dev = false;
  S.sustainedOn = false; S.sustainedN = "1"; S.blast = false;
  S.rapidOn = false; S.meltaOn = false;
  S.ignoresCover = false; S.indirect = false; S.ignoreMalus = false;
  S.critH = 6; S.critW = 6;
}
function majLibelleCaps(){
  const u = atkMode === "unite";
  const t = el("cardAbilTitre");
  if(t) t.textContent = u ? "Ce que la partie ajoute" : "Capacités de l'arme";
  const n = el("abilNote"); if(n) n.hidden = !u;
  renderCaps();
}

/* ==========================================================
   LES MOTS-CLÉS DE L'ARME, EN PASTILLES
   Ils vivaient sous la carte Cible, en pile de cases a cocher qu'il
   fallait aller chercher tout en bas de l'ecran. Ils remontent au
   contact de l'attaquant et prennent la forme des retouches de
   partie : une pastille par mot-cle, la valeur a cote quand il y en a
   une, tout tient en un coup d'oeil.
   ========================================================== */
const CAPS = [
  {k:"torrent",      nom:"Torrent",           aide:"touche automatiquement"},
  {k:"lethal",       nom:"Léthal",            aide:"touche crit. = blessure auto"},
  {k:"dev",          nom:"Dévastatrices",     aide:"blessure crit. = pas de svg"},
  {k:"sustainedOn",  nom:"Soutenu",           aide:"touches en plus par critique",
   num:{id:"sustainedN", texte:true}},
  {k:"blast",        nom:"Déflagration",      aide:"+1 attaque par 5 figurines"},
  {k:"rapidOn",      nom:"Tir Rapide",        aide:"attaques en plus à mi-portée",
   uAide:"on est à mi-portée", num:{id:"rapidN", min:1, max:60}, uSansNum:true},
  {k:"meltaOn",      nom:"Fonte",             aide:"dégâts en plus à mi-portée",
   uAide:"on est à mi-portée", num:{id:"meltaN", min:1, max:6}, uSansNum:true},
  {k:"ignoresCover", nom:"Ignore le couvert", aide:"la cible n'en profite pas"},
  {k:"indirect",     nom:"Tir indirect",      aide:"−1 pour toucher, cible à couvert"}
];
/* Ceux-la, la sequence d'attaque ne les traduit pas : ils changent qui
   peut tirer, sur qui, ou combien de fois — pas les jets. On les montre
   quand meme, en pointille, plutot que de laisser croire a un oubli. */
const CAPS_INFO = [
  ["assault",   "Assaut",              "peut tirer après avoir avancé"],
  ["heavy",     "Lourd",               "+1 pour toucher si l'unité n'a pas bougé — à poser dans les retouches"],
  ["pistol",    "Pistolet",            "peut tirer même engagée au corps à corps"],
  ["precision", "Précision",           "les blessures critiques peuvent viser un personnage rattaché"],
  ["oneshot",   "Tir unique",          "une seule fois par partie"],
  ["extra",     "Attaques supp.",      "s'ajoute à l'autre arme de mêlée au lieu de la remplacer"],
  ["twin",      "Jumelée",             "relance les blessures ratées — déjà appliqué"],
  ["indirect",  "Tir indirect",        "disponible sur cette arme : la pastille ci-dessus l'active"]
];
function majApresCap(redessine){
  if(redessine !== false) renderCaps();
  if(atkMode === "unite") renderAtkUnite();
  majVite(); render();
}
function renderCaps(){
  const host = el("capGrid"); if(!host) return;
  const u = atkMode === "unite";
  host.innerHTML = "";
  CAPS.forEach(c=>{
    const on = !!S[c.k];
    const box = document.createElement("div");
    box.className = "cap" + (on ? " on" : "");
    const b = document.createElement("button");
    b.type = "button"; b.className = "capb";
    const aide = (u && c.uAide) ? c.uAide : c.aide;
    b.innerHTML = c.nom + (aide ? '<small>' + aide + '</small>' : '');
    b.addEventListener("click", ()=>{ S[c.k] = !on; majApresCap(); });
    box.appendChild(b);
    /* la valeur n'apparait que quand la capacite est active, et jamais
       en mode unite pour Tir Rapide et Fonte : la chacune des armes
       apporte la sienne, celle de l'ecran ne voudrait rien dire */
    if(c.num && on && !(u && c.uSansNum)){
      const w = document.createElement("span"); w.className = "capn";
      const i = document.createElement("input");
      i.id = c.num.id;
      if(c.num.texte){ i.type = "text"; i.inputMode = "text"; }
      else { i.type = "number"; i.min = c.num.min; i.max = c.num.max; i.inputMode = "numeric"; }
      i.value = S[c.num.id];
      i.addEventListener("input", ()=>{
        if(c.num.texte) S[c.num.id] = i.value;
        else { const v = parseInt(i.value, 10);
               if(!isNaN(v)) S[c.num.id] = Math.max(c.num.min, Math.min(c.num.max, v)); }
        /* on ne redessine pas la grille pendant la frappe : le champ
           perdrait le curseur a chaque touche */
        majApresCap(false);
      });
      w.appendChild(i); box.appendChild(w);
    }
    host.appendChild(box);
  });
  renderCapInfo();
}
/* les mots-cles portes par l'arme choisie, ou par l'une des armes de
   l'unite chargee */
function drapeauxCourants(){
  if(atkMode === "unite"){
    const o = {};
    ((atkUnit && atkUnit.profils) || []).forEach(pr=>{
      CAPS_INFO.forEach(([k])=>{ if(pr[k] || (k === "indirect" && pr.indirectCap)) o[k] = true; });
    });
    return o;
  }
  const list = unitWeps(curUnit), w = list[curWeapon] || list[0];
  return w ? parseFlags(w[8]) : {};
}
function renderCapInfo(){
  const host = el("capInfo"); if(!host) return;
  const f = drapeauxCourants();
  const vus = CAPS_INFO.filter(([k]) => !!f[k]);
  host.innerHTML = "";
  if(!vus.length) return;
  const h = document.createElement("div");
  h.className = "cih";
  h.textContent = atkMode === "unite" ? "Aussi sur les armes de l'unité" : "Aussi sur cette arme";
  host.appendChild(h);
  vus.forEach(([k, nom, txt])=>{
    const d = document.createElement("div");
    d.className = "ci";
    d.innerHTML = nom + '<em>' + txt + '</em>';
    host.appendChild(d);
  });
}
function capsPourMode(){
  if(atkMode === "unite"){
    if(!capMemo){ const o = {}; CAPF.forEach(k => o[k] = S[k]); capMemo = o; videCaps(); }
  } else if(capMemo){ Object.assign(S, capMemo); capMemo = null; }
  majLibelleCaps();
  pushState();
}
function majAtkMode(){
  const chips = el("atkModeChips");
  if(chips) chips.querySelectorAll(".chip").forEach(b => b.classList.toggle("on", b.dataset.am === atkMode));
  const pr = el("atkProfil"), un = el("atkUnite");
  if(pr) pr.hidden = atkMode !== "profil";
  if(un) un.hidden = atkMode !== "unite";
  const ph = el("atkPhaseChips");
  if(ph) ph.querySelectorAll(".chip").forEach(b => b.classList.toggle("on", b.dataset.ap === atkPhase));
}
if(el("atkModeChips")) el("atkModeChips").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    atkMode = b.dataset.am;
    majAtkMode();
    capsPourMode();
    if(atkMode === "unite" && !atkUnit) renderAtkUnite();
    majVite();
    render();
  }));
if(el("atkPhaseChips")) el("atkPhaseChips").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    atkPhase = b.dataset.ap;
    majAtkMode();
    /* changer de phase change les armes : les decochages d'avant ne
       veulent plus rien dire */
    atkOff = {}; condOn = {};
    rechargeUnite();
  }));
if(el("pickRosterUnit")) el("pickRosterUnit").addEventListener("click", ()=>{
  renderRosterUnitList(); openSheet("sheetRosterUnit");
});
/* La liste peut changer pendant qu'on simule — on ajoute une figurine,
   on change une arme — et l'unite chargee doit suivre. C'est tout ce que
   ce raccord fait desormais : le mode « une unite entiere » a remplace
   les pastilles « dans ma liste » qui doublonnaient sous le selecteur
   d'arme, en montrant l'unite complete au lieu d'une arme a la fois. */
window.__relitUniteChargee = function(){
  if(atkMode === "unite" && atkUnitId !== null) rechargeUnite();
};

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

buildSegs(); bindFields();applyGenericTarget("Space Marine");
applyWeapon();
majAtkMode(); renderAtkUnite(); majVite();

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=> navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
chargeCibles();
if(el("btnSaveCible")) el("btnSaveCible").addEventListener("click", gardeCible);

global.SIM = {S, unitRow, unitWeps, parseFlags, antiDe, antiActif, libelleAnti, GENERIC_TARGETS,
  applyGenericTarget, applyNecronTarget, drawBars, binned, pct, num, rendSeuils,
  get tgtName(){ return tgtName; }, get tgtUnit(){ return tgtUnit; },
  /* crochets de verification : dans quel mode on est, ce qui est charge,
     et les profils reellement envoyes au moteur */
  atk: function(){
    return { mode: atkMode, phase: atkPhase, unite: atkUnit ? atkUnit.nom : null,
      profils: atkUnit ? atkUnit.profils.map(p => p.label) : [],
      conditions: atkUnit && atkUnit.conditions
        ? atkUnit.conditions.map(c => (condOn[c.id] ? "✓ " : "· ") + c.nom + " — " + c.quand) : [],
      actifs: profilsActifs().map(p => p.label),
      moteur: profilsActifs().map(p => {
        const q = ENG.normalise(profilPourMoteur(p));
        return { label: p.label, attacks: q.attacks, bs: q.bs, str: q.str,
                 ap: q.ap, apEff: ENG.apEffectif(q), dmg: q.dmg, dmgMod: q.dmgMod,
                 hitMod: q.hitMod, wndMod: q.wndMod, rrH: q.rrH, rrW: q.rrW };
      }) };
  },
  charge: function(id, ph){ atkMode = "unite"; if(ph) atkPhase = ph; atkOff = {};
    majAtkMode(); capsPourMode(); chargeUnite(id); majVite(); }};
})(window);
