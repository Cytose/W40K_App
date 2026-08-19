(function(){
"use strict";
const el = id => document.getElementById(id);
const {scaleDice, analytic, simulateCombined, simulate} = ENG;
const {S, unitRow, unitWeps, parseFlags, drawBars, binned, pct, num} = SIM;

/* ==========================================================
   ETAT DE LA LISTE
   ========================================================== */
const RKEY = "mathhammer.roster.v1";   /* ancien format, une seule liste */
const LKEY = "mathhammer.lists.v1";

/* Une liste : {id, nom, cap, detach:[], units:[], nextId}
   units : {id,name,size,lo:[{w,n}],chars:[{name,w}],sel,grp,enh} */
let LISTS = [];
let R = null;                         // la liste ouverte
let nextId = 1;                       // compteur d'unites de la liste ouverte
let phase = "T";
let situ = {};                        // conditions situationnelles cochees

const listeVierge = (nom, cap) => ({
  id: "l" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36),
  nom: nom || "Nouvelle liste", cap: cap || 2000, detach: [], units: [], nextId: 1
});

function saveR(){
  if(R){ R.nextId = nextId; }
  try{ localStorage.setItem(LKEY, JSON.stringify({ v:1, actif: R ? R.id : null, listes: LISTS })); }catch(e){}
}

/* remet une liste d'aplomb : champs manquants des versions precedentes */
function normaliseListe(L){
  L.detach = L.detach || []; L.units = L.units || [];
  L.cap = L.cap || 2000; L.nom = L.nom || "Liste"; L.nextId = L.nextId || 1;
  if(!L.id) L.id = listeVierge().id;
  L.units.forEach(ru => {
    ru.chars = ru.chars || []; ru.lo = ru.lo || [];
    if(ru.sel === undefined) ru.sel = true;
    if(!ru.grp) ru.grp = nomGroupe();
    if(ru.enh === undefined) ru.enh = null;
    if(!ru.id) ru.id = L.nextId++;
  });
  return L;
}

function ouvre(L){ R = L; nextId = L.nextId || 1; }

function loadR(){
  let actif = null;
  try{
    const o = JSON.parse(localStorage.getItem(LKEY) || "null");
    if(o && Array.isArray(o.listes)){ LISTS = o.listes; actif = o.actif; }
  }catch(e){}

  /* reprise de l'ancien format : la liste unique devient la premiere */
  if(!LISTS.length){
    let ancienne = null;
    try{
      const o = JSON.parse(localStorage.getItem(RKEY) || "null");
      if(o && o.R) ancienne = Object.assign(listeVierge("Ma liste", 2000), {
        detach: o.R.detach || [], units: o.R.units || [], nextId: o.nextId || 1
      });
    }catch(e){}
    LISTS = [ancienne || listeVierge("Ma liste", 2000)];
    actif = LISTS[0].id;
  }
  LISTS.forEach(normaliseListe);
  ouvre(LISTS.find(x => x.id === actif) || LISTS[0]);
  /* premier lancement, ou reprise de l'ancien format : on fixe l'etat
     tout de suite plutot que d'attendre la premiere modification */
  if(!localStorage.getItem(LKEY)) saveR();
}

/* ---- gestion des listes ---- */
function nouvelleListe(){
  const L = listeVierge("Liste " + (LISTS.length + 1), R ? R.cap : 2000);
  LISTS.push(L); ouvre(L); saveR(); renderList();
}
function dupliqueListe(){
  if(!R) return;
  const copie = JSON.parse(JSON.stringify(R));
  copie.id = listeVierge().id;
  copie.nom = R.nom + " (copie)";
  LISTS.push(copie); ouvre(copie); saveR(); renderList();
}
function supprimeListe(){
  if(!R || LISTS.length < 2){
    alert("C'est ta seule liste : crées-en une autre avant de supprimer celle-ci.");
    return;
  }
  if(!confirm("Supprimer « " + R.nom + " » et ses " + R.units.length + " unité" +
    (R.units.length > 1 ? "s" : "") + " ? C'est définitif.")) return;
  const i = LISTS.indexOf(R);
  LISTS.splice(i, 1);
  ouvre(LISTS[Math.max(0, i - 1)]);
  saveR(); renderList();
}
/* le simulateur pioche ici : unites de la liste ouverte, avec la taille
   et l'arme retenues, plus les personnages rattaches */
window.ROSTER = {
  actives: function(){
    if(!R) return null;
    const out = [];
    R.units.forEach(ru=>{
      const dom = ru.lo.slice().sort((a,b)=>b.n-a.n)[0];
      out.push({ nom: ru.name, taille: ru.size, arme: dom ? dom.w : 0,
                 groupe: nomAffiche(ru), perso: false });
      ru.chars.forEach(c => out.push({ nom: c.name, taille: 1, arme: c.w|0,
                 groupe: nomAffiche(ru), perso: true }));
    });
    return { liste: R.nom, unites: out };
  }
};

function ouvreListe(id){
  const L = LISTS.find(x => x.id === id); if(!L) return;
  ouvre(L); saveR(); renderList();
}

/* ==========================================================
   GROUPES RATTACHES
   Une unite de la liste porte un nom de groupe fabrique tout
   seul : c'est ce nom qu'on annonce en partie (« la Phalange
   d'Obsidienne tire »), sans avoir a le saisir. On peut le
   reecrire a la main ou en retirer un autre au hasard.
   ========================================================== */
const auHasard = t => t[Math.floor(Math.random() * t.length)];
function nomGroupe(){
  return auHasard(GRPN.forme) + " " + auHasard(GRPN.qualif) + " " + auHasard(GRPN.origine);
}

/* un personnage ne peut rejoindre que les unites listees par sa
   regle Leader ; une escorte suit sa propre liste */
function peutRejoindre(perso, unite){
  const l = ATTACH[perso] || RETINUE[perso];
  return !l ? null : l.indexOf(unite) >= 0;
}

/* ce qu'un groupe porte deja : un chef, un soutien, une escorte */
const roleDe = nom => (unitRow(nom) || [])[9] || (RETINUE[nom] ? "Escorte" : "");
const compteRole = (ru, role) => ru.chars.filter(c => roleDe(c.name) === role).length;
const aCryptek = ru => ru.chars.some(c => has("cryptek", c.name));

/* pourquoi ce personnage ne peut pas rejoindre ce groupe, "" s'il le peut.
   Une escorte Cryptek pose une double condition : elle ne se greffe que sur
   une unite deja menee par un CRYPTEK, et une seule a la fois. */
function refusAttache(nom, ru){
  if(ru.chars.some(c => c.name === nom)) return "déjà dans ce groupe";
  const role = roleDe(nom);
  if(role === "Leader" && compteRole(ru, "Leader")) return "un seul chef par unité";
  if(role === "Support" && compteRole(ru, "Support")) return "un seul soutien par unité";
  if(role === "Escorte"){
    if(!aCryptek(ru)) return "exige un CRYPTEK dans l'unité";
    if(compteRole(ru, "Escorte")) return "une seule escorte par unité";
  }
  return "";
}

/* mots-cles portes par le groupe : ceux de l'unite plus ceux de
   chaque personnage rattache — c'est ce qui decide si un
   stratageme CRYPTEK ou NOBLE peut viser le groupe */
function motsClesGroupe(ru){
  const out = [];
  const ajoute = (nom, source) => {
    Object.keys(KW).forEach(k => {
      if(has(k, nom) && !out.some(o => o.kw === k)) out.push({kw:k, source:source});
    });
  };
  ajoute(ru.name, "");
  ru.chars.forEach(c => ajoute(c.name, c.name));
  return out;
}

const socle = nom => (BASES && BASES[nom]) || "";

/* ameliorations ouvertes par les detachements retenus */
const enhDispo = () => ENHANCEMENTS.filter(e => R.detach.indexOf(e[2]) >= 0);
const enhRow = nom => ENHANCEMENTS.find(e => e[0] === nom);
function enhPts(ru){
  const e = ru.enh && enhRow(ru.enh);
  return e && typeof e[1] === "number" ? e[1] : 0;
}

const KWSET = {};
Object.keys(KW).forEach(k => KWSET[k] = new Set(KW[k]));
const has = (kw, name) => KWSET[kw] ? KWSET[kw].has(name) : false;
const detachRow = n => DETACHMENTS.find(d => d[0] === n);
const CATMAP = {};
CAT.forEach(([n, c]) => CATMAP[n] = c);
const categorie = n => CATMAP[n] || "Autre";
/* un nom de groupe ne vaut que pour un ensemble : seule, une unite
   s'annonce par son propre nom */
const estGroupe = ru => ru.chars.length > 0;
const nomAffiche = ru => (estGroupe(ru) && ru.grp) ? ru.grp : ru.name;

/* ==========================================================
   POINTS & VALIDATION
   ========================================================== */
function unitPoints(ru){
  const u = unitRow(ru.name); if(!u) return 0;
  let p = u[7][String(ru.size)] || 0;
  ru.chars.forEach(c => { const cu = unitRow(c.name); if(cu) p += cu[7][String(cu[6][0])] || 0; });
  return p + enhPts(ru);
}
const totalPoints = () => R.units.reduce((a,ru) => a + unitPoints(ru), 0);
const totalDP = () => R.detach.reduce((a,n) => { const d = detachRow(n); return a + (d ? d[1] : 0); }, 0);
/* budget de Points de Detachement : 3 a 2000 pts, au prorata ailleurs
   (1 par tranche de 500 pts, minimum 1) */
const capDP = () => Math.max(1, Math.round((R.cap || 2000) / 2000 * 3));

function validate(){
  const w = [];
  const pts = totalPoints(), cap = R.cap || 2000;
  if(pts > cap) w.push("Liste à <b>" + pts + " pts</b> : " + (pts-cap) +
    " pts au-dessus du plafond de " + cap + ".");
  const dp = totalDP(), dpMax = capDP();
  if(dp > dpMax) w.push("<b>" + dp + " PD</b> utilisés sur " + dpMax + " disponibles à " + cap + " pts.");
  const tags = {};
  R.detach.forEach(n => { const d = detachRow(n); if(d && d[2]){ (tags[d[2]] = tags[d[2]] || []).push(n); } });
  Object.keys(tags).forEach(t => { if(tags[t].length > 1)
    w.push("Tag <b>" + t + "</b> en double : " + tags[t].join(" + ") + " ne sont pas combinables."); });

  const count = {};
  R.units.forEach(ru => { count[ru.name] = (count[ru.name]||0) + 1; });
  Object.keys(count).forEach(n => {
    const lim = has("epic", n) ? 1 : (has("battleline", n) ? 6 : 3);
    if(count[n] > lim) w.push("<b>" + n + "</b> ×" + count[n] + " : maximum " + lim +
      (lim===1 ? " (Epic Hero)" : lim===6 ? " (Battleline)" : " (règle des trois)") + ".");
  });
  R.units.forEach(ru => {
    const nom = estGroupe(ru) && ru.grp ? ru.grp + " (" + ru.name + ")" : ru.name;
    const led = compteRole(ru, "Leader"), sup = compteRole(ru, "Support"),
          esc = compteRole(ru, "Escorte");
    if(led > 1) w.push("<b>" + nom + "</b> : " + led + " chefs, un seul est autorisé.");
    if(sup > 1) w.push("<b>" + nom + "</b> : " + sup + " soutiens, un seul est autorisé.");
    if(esc > 1) w.push("<b>" + nom + "</b> : " + esc + " escortes, une seule est autorisée.");
    /* une escorte Cryptek reste suspendue au CRYPTEK qui l'a fait venir */
    if(esc && !aCryptek(ru)){
      const e = ru.chars.filter(c => roleDe(c.name) === "Escorte").map(c => c.name).join(", ");
      w.push("<b>" + e + "</b> sur " + nom + " : une escorte Cryptek exige un CRYPTEK dans l'unité, " +
        "or il n'y en a plus.");
    }
    const tot = ru.lo.reduce((a,l) => a + l.n, 0);
    if(tot > ru.size) w.push("<b>" + ru.name + "</b> : " + tot + " armes réparties pour " + ru.size + " figurines.");
    ru.chars.forEach(c => {
      if(peutRejoindre(c.name, ru.name) === false)
        w.push("<b>" + c.name + "</b> ne peut pas rejoindre <b>" + ru.name +
          "</b> : sa règle Leader ne cite pas cette unité.");
    });
    if(ru.enh && R.detach.indexOf((enhRow(ru.enh)||[])[2]) < 0)
      w.push("Amélioration <b>" + ru.enh + "</b> sur " + ru.name +
        " : elle appartient à un détachement que tu n'as pas pris.");
    const perso = ru.chars.some(c => (unitRow(c.name)||[])[9]);
    if(ru.enh && !perso)
      w.push("Amélioration <b>" + ru.enh + "</b> sur " + ru.name +
        " : elle se porte par un personnage, or ce groupe n'en a aucun.");
    if(ru.enh && ru.chars.some(c => has("epic", c.name)))
      w.push("Amélioration <b>" + ru.enh + "</b> sur " + ru.name +
        " : un Epic Hero ne peut pas recevoir d'amélioration.");
  });
  const enhs = R.units.map(x => x.enh).filter(Boolean);
  enhs.forEach((e, i) => { if(enhs.indexOf(e) !== i)
    w.push("Amélioration <b>" + e + "</b> prise deux fois : une seule par armée."); });
  if(enhs.length > 3) w.push("<b>" + enhs.length + " améliorations</b> : trois au maximum.");
  return w;
}

/* ==========================================================
   REGLES DE DETACHEMENT
   ========================================================== */
const SITU_LABEL = {
  canoptek_rr : "Unité entièrement dans la Matrice de Puissance (relance totale)",
  obj_hit1    : "Cible à portée d'un marqueur d'objectif",
  destroyer_ap1: "Cible éligible la plus proche",
  noble_wound1: "Cible désignée par Worthy Foes",
  cryptek_anti: "Aptitude choisie : Anti-Infanterie 3+",
  monster_ap1 : "Cible « unravelling » à 6\" d'un MONSTRE",
  tomb_hit1   : "Tomb Blades arrivées par ingress ce tour"
};
function activeRules(){
  const out = [];
  R.detach.forEach(n => { const d = detachRow(n); if(d && d[5]) out.push(d); });
  return out;
}
/* applique les regles de detachement a un profil deja construit */
function applyDetach(prof, ru){
  const n = ru.name, ledBy = ru.chars.length > 0;
  activeRules().forEach(d => {
    const key = d[5], cond = d[6];
    if(cond && !situ[key]) return;
    switch(key){
      case "led_hit1":
        if(ledBy || (unitRow(n)||[])[9]) prof.hitMod = Math.max(prof.hitMod, 1);
        break;
      case "canoptek_rr":
        if(has("canoptek", n) || has("cryptek", n)) prof.rrH = situ.canoptek_rr ? "failed" : "ones";
        break;
      case "obj_hit1":
        if(!has("monster", n)) prof.hitMod = Math.max(prof.hitMod, 1);
        break;
      case "destroyer_ap1":
        if(has("destroyer", n) && prof.kind === "T") prof.ap = Math.min(5, prof.ap + 1);
        break;
      case "noble_wound1":
        if(has("noble", n) || has("lychguard", n) || has("triarch", n)) prof.wndMod = Math.max(prof.wndMod, 1);
        break;
      case "destroyer_str2":
        if(has("destroyer", n)) prof.str += 2;
        break;
      case "cryptek_anti":
        if(has("cryptek", n)) prof.critW = Math.min(prof.critW, 3);
        break;
      case "monster_ap1":
        prof.ap = Math.min(5, prof.ap + 1);
        break;
      case "tomb_hit1":
        if(has("tombblade", n)) prof.hitMod = Math.max(prof.hitMod, 1);
        break;
    }
  });
  return prof;
}
/* la regle canoptek_rr s'applique meme hors condition (relance des 1) */
function preApply(prof, ru){
  R.detach.forEach(dn=>{
    const d = detachRow(dn); if(!d) return;
    if(d[5] === "canoptek_rr" && (has("canoptek", ru.name) || has("cryptek", ru.name)))
      prof.rrH = "ones";
  });
  return prof;
}

/* ==========================================================
   CONSTRUCTION DES PROFILS D'ATTAQUE
   ========================================================== */
function tgtFields(){
  return {tough:S.tough, sv:S.sv, inv:S.inv, wounds:S.wounds, models:S.models,
          fnp:S.fnp, dmgRed:S.dmgRed, cover:S.cover};
}
function weaponProfile(unitName, w, bearers, ru){
  const f = parseFlags(w[8]);
  const p = Object.assign({}, tgtFields(), {
    label: (ru ? "" : "") + w[1],
    kind: w[2],
    attacks: scaleDice(w[3], bearers),
    bs: w[4], str: w[5], ap: w[6], dmg: w[7],
    torrent: !!f.torrent, lethal: !!f.lethal, dev: !!f.dev,
    sustainedOn: !!f.sust, sustainedN: f.sust ? String(f.sust) : "1",
    blast: !!f.blast,
    rapidOn: !!f.rf, rapidN: f.rf ? Math.min(120, (+f.rf) * bearers) : 1,
    meltaOn: !!f.melta, meltaN: f.melta ? +f.melta : 2,
    critH: 6, critW: f.anti ? +f.anti : 6,
    hitMod: 0, wndMod: 0, rrH: "none", rrW: f.twin ? "failed" : "none"
  });
  if(ru){ preApply(p, ru); applyDetach(p, ru); }
  return p;
}
/* tous les profils d'une unite de la liste pour la phase courante */
function unitProfiles(ru){
  const list = unitWeps(ru.name), out = [];
  let matched = 0;
  ru.lo.forEach(l=>{
    const w = list[l.w];
    if(!w || w[2] !== phase || l.n <= 0) return;
    matched++;
    const p = weaponProfile(ru.name, w, l.n, ru);
    p.label = w[1] + " ×" + l.n;
    out.push(p);
  });
  /* au corps a corps, toute figurine sans arme de melee choisie se bat
     avec l'arme de melee par defaut de sa datasheet */
  if(phase === "C" && !matched){
    const i = list.findIndex(w => w[2] === "C");
    if(i >= 0){
      const p = weaponProfile(ru.name, list[i], ru.size, ru);
      p.label = list[i][1] + " ×" + ru.size;
      out.push(p);
    }
  }
  ru.chars.forEach(c=>{
    const cl = unitWeps(c.name);
    let w = cl[c.w];
    if(!w || w[2] !== phase) w = cl.find(x => x[2] === phase);
    if(!w) return;
    const p = weaponProfile(c.name, w, 1, ru);
    p.label = c.name + " — " + w[1];
    out.push(p);
  });
  return out;
}

/* ==========================================================
   ECRAN « MA LISTE »
   ========================================================== */
/* points d'une liste quelconque, sans passer par la liste ouverte */
function pointsDe(L){
  return L.units.reduce((a,ru)=>{
    const u = unitRow(ru.name); if(!u) return a;
    let n = u[7][String(ru.size)] || 0;
    ru.chars.forEach(c => { const cu = unitRow(c.name); if(cu) n += cu[7][String(cu[6][0])] || 0; });
    const e = ru.enh && enhRow(ru.enh);
    return a + n + (e && typeof e[1] === "number" ? e[1] : 0);
  }, 0);
}

/* ==========================================================
   ENCAISSER
   Le calcul du simulateur, rôles inversés : l'unité de la liste
   devient la cible, l'attaquant est un archétype d'arme. On ne
   cherche pas la justesse d'une liste adverse, seulement à
   savoir si une unité tient un volume de tir donné.
   ========================================================== */
let defUnite = null, defMenace = 0, defTireurs = 10;

function defCible(){
  /* l'unite choisie, a defaut la premiere de la liste */
  if(defUnite){
    const u = unitRow(defUnite.nom);
    if(u) return {u:u, taille:defUnite.taille, nom:defUnite.nom};
  }
  const ru = R && R.units[0];
  if(ru){ const u = unitRow(ru.name); if(u) return {u:u, taille:ru.size, nom:ru.name}; }
  const u = unitRow("Immortals");
  return u ? {u:u, taille:10, nom:"Immortals"} : null;
}

function renderDef(){
  const host = el("defQuick"); if(!host) return;

  /* --- qui encaisse : les unites de la liste, puis un repli */
  host.innerHTML = "";
  const cible = defCible();
  const r = window.ROSTER && window.ROSTER.actives();
  const wrap = document.createElement("div");
  wrap.className = "chips tight";
  const vus = new Set();
  const proposer = (nom, taille) => {
    const cle = nom + "|" + taille;
    if(vus.has(cle)) return;
    vus.add(cle);
    const u = unitRow(nom); if(!u) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (cible && cible.nom === nom && cible.taille === taille ? " on" : "");
    b.innerHTML = nom + ' ×' + taille;
    b.addEventListener("click", ()=>{ defUnite = {nom:nom, taille:taille}; renderDef(); });
    wrap.appendChild(b);
  };
  if(r && r.unites.length) r.unites.forEach(x => proposer(x.nom, x.taille));
  else UNITS.slice(0, 8).forEach(u => proposer(u[0], u[6][u[6].length-1]));
  host.appendChild(wrap);

  if(!cible){ el("defProf").textContent = ""; return; }
  const u = cible.u;
  el("defProf").innerHTML = '<span class="stat">×' + cible.taille + ' · E' + u[2] +
    ' · Svg ' + u[3] + '+' + (u[4] ? ' / ' + u[4] + '++' : '') + ' · ' + u[5] + ' PV' +
    (u[8] ? ' · Insensible ' + u[8] + '+' : '') + '</span>' +
    '<span class="kw">' + (cible.taille * u[5]) + ' PV au total</span>';

  /* --- ce qu'elle recoit */
  const th = el("defThreats");
  th.innerHTML = "";
  MENACES.forEach((m, i)=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (i === defMenace ? " on" : "");
    b.textContent = m[0];
    b.addEventListener("click", ()=>{ defMenace = i; renderDef(); });
    th.appendChild(b);
  });
  const m = MENACES[defMenace];
  const f = parseFlags(m[6]);
  el("defThreatProf").innerHTML =
    '<span class="stat">A ' + m[1] + ' · ' + (f.torrent ? 'auto' : m[2] + '+') +
    ' · F' + m[3] + ' · PA ' + (m[4] ? '-' + m[4] : '0') + ' · D ' + m[5] + '</span>' +
    (m[6] ? '<span class="kw">' + motsArme(m[6]) + '</span>' : '') +
    '<span class="warn">' + m[7] + '</span>';

  /* --- resultat : le moteur, cible et attaquant echanges */
  const prof = {
    attacks: scaleDice(m[1], defTireurs),
    bs: m[2] || 4, str: m[3], ap: m[4], dmg: m[5],
    tough: u[2], sv: u[3], inv: u[4] || 0, wounds: u[5],
    models: cible.taille, fnp: u[8] || 0, dmgRed: 0, cover: false,
    torrent: !!f.torrent, lethal: !!f.lethal, dev: !!f.dev,
    sustainedOn: !!f.sust, sustainedN: f.sust || "1",
    blast: !!f.blast, rapidOn: false, rapidN: 0,
    meltaOn: !!f.melta, meltaN: f.melta || 0,
    critH: 6, critW: 6, hitMod: 0, wndMod: 0, rrH: "none", rrW: "none"
  };
  const sim = simulate(prof, 20000);
  const pv = cible.taille * u[5];
  const perte = sim.meanSlain, reste = Math.max(0, cible.taille - perte);
  const efface = sim.slainDist[cible.taille] || 0;
  /* combien de tireurs pour effacer l'unite une fois sur deux :
     dichotomie sur 1..60, six essais au lieu de soixante */
  const efface50 = n => (simulate(Object.assign({}, prof, {attacks: scaleDice(m[1], n)}), 2500)
                          .slainDist[cible.taille] || 0) >= 0.5;
  let seuil = null;
  if(efface50(60)){
    let bas = 1, haut = 60;
    while(bas < haut){
      const mid = (bas + haut) >> 1;
      if(efface50(mid)) haut = mid; else bas = mid + 1;
    }
    seuil = bas;
  }

  el("defSum").innerHTML =
    '<div class="sum hero"><div class="k">Figurines perdues</div><div class="v">' + num(perte) + '</div></div>' +
    '<div class="sum"><div class="k">Il en reste</div><div class="v">' + num(reste) + '</div></div>' +
    '<div class="sum"><div class="k">Unité effacée</div><div class="v">' + pct(efface) + '</div></div>';

  el("defSub").textContent = "Sur " + sim.N.toLocaleString("fr-FR") +
    " simulations de la salve, figurines perdues par l'unité.";
  drawBars(el("defBars"), binned(sim.slainDist, cible.taille), "var(--cyan)", (i,v)=>
    "<b>" + i + "</b> figurine" + (i>1?"s":"") + " perdue" + (i>1?"s":"") +
    "<br>probabilité <b>" + pct(v) + "</b>");
  el("defNote").innerHTML =
    '<b>' + defTireurs + ' × ' + m[0] + '</b> sur <b>' + cible.nom + ' ×' + cible.taille + '</b> (' + pv + ' PV) : ' +
    num(sim.meanDealt) + ' PV encaissés en moyenne' +
    (sim.meanRaw > sim.meanDealt + 0.05 ? ', ' + num(sim.meanRaw - sim.meanDealt) + ' perdus en surtue' : '') + '. ' +
    (seuil ? 'Il en faudrait <b>' + seuil + '</b> pour l\'effacer une fois sur deux.'
           : 'Moins d\'une chance sur deux de l\'effacer, même à 60 tireurs.');
}

/* ==========================================================
   INDEX DES LISTES
   L'axe s'ouvre ici : on voit ce qu'on a, on entre dans l'une
   d'elles pour la modifier.
   ========================================================== */
/* ==========================================================
   PAVÉ DE L'ÉDITEUR
   Une longue page qu'on déroule se prête mal à la construction
   d'une liste : on cherche une unité parmi d'autres, on la règle,
   on revient. Le pavé pose chaque unité sur sa case ; toucher une
   case ouvre son panneau, le retour ramène au pavé.
   ========================================================== */
const PANNEAUX = ["cardSettings", "cardDetach", "cardUnits", "cardStrat", "cardArms"];
let unitOuverte = null;          /* id de l'unite affichee seule */

function pointsUnite(ru){
  const u = unitRow(ru.name); if(!u) return 0;
  let p = u[7][String(ru.size)] || 0;
  ru.chars.forEach(c => { const cu = unitRow(c.name); if(cu) p += cu[7][String(cu[6][0])] || 0; });
  const e = ru.enh && enhRow(ru.enh);
  return p + (e && typeof e[1] === "number" ? e[1] : 0);
}

/* une unite dont le rattachement ou l'amelioration cloche merite d'etre
   signalee sur sa case, sans avoir a l'ouvrir */
function uniteSuspecte(ru){
  if(compteRole(ru, "Leader") > 1 || compteRole(ru, "Support") > 1) return true;
  if(compteRole(ru, "Escorte") > 1) return true;
  if(compteRole(ru, "Escorte") && !aCryptek(ru)) return true;
  if(ru.chars.some(c => peutRejoindre(c.name, ru.name) === false)) return true;
  if(ru.enh && !ru.chars.length) return true;
  return false;
}

function renderPad(){
  const gu = el("padUnits"), gt = el("padTools");
  if(!gu || !gt) return;

  gu.innerHTML = "";
  R.units.forEach(ru=>{
    const u = unitRow(ru.name); if(!u) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tile" + (uniteSuspecte(ru) ? " warnmark" : "");
    const nAtt = ru.chars.length;
    b.innerHTML =
      (estGroupe(ru) && ru.grp ? '<span class="tg">' + ru.grp + '</span>' : '') +
      '<span class="tn">' + ru.name + '</span>' +
      '<span class="tb"><span class="tp">' + pointsUnite(ru) + '<small>points</small></span>' +
      '<span class="tx">×' + ru.size + (nAtt ? '<br>+' + nAtt + ' perso' + (nAtt > 1 ? 's' : '') : '') + '</span></span>' +
      (uniteSuspecte(ru) ? '<span class="tmark"></span>' : '');
    b.addEventListener("click", ()=> ouvrePanneau("cardUnits", ru.id));
    gu.appendChild(b);
  });
  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "tile add";
  plus.innerHTML = "+<br>Unité";
  plus.addEventListener("click", openUnitPick);
  gu.appendChild(plus);

  const dp = totalDP(), dpMax = capDP();
  const outils = [
    ["cardDetach",   "◈", "Détachements", dp + " / " + dpMax + " PD"],
    ["cardStrat",    "⚡", "Stratagèmes",  STRATS.filter(x => x[1] === "Core" || R.detach.indexOf(x[1]) >= 0).length + " fiches"],
    ["cardArms",     "⌖", "Armement",     WEAPONS.length ? R.units.length + " unité" + (R.units.length > 1 ? "s" : "") : ""],
    ["cardSettings", "⚙", "Réglages",     R.cap + " pts"]
  ];
  gt.innerHTML = "";
  outils.forEach(([id, ic, nom, compl])=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tile tool";
    b.innerHTML = '<span class="ti2">' + ic + '</span><span class="tn">' + nom + '</span>' +
      (compl ? '<span class="tc">' + compl + '</span>' : '');
    b.addEventListener("click", ()=> ouvrePanneau(id));
    gt.appendChild(b);
  });
}

function ouvrePanneau(id, uid){
  unitOuverte = uid || null;
  el("pad").hidden = true;
  el("btnBackPad").hidden = false;
  PANNEAUX.forEach(p=>{
    const c = el(p); if(!c) return;
    c.hidden = (p !== id);
    c.classList.remove("collapsed");
  });
  let titre = "Retour au pavé";
  if(uid){
    const ru = R.units.find(x => x.id === uid);
    if(ru) titre = nomAffiche(ru);
  }
  el("panelTitle").textContent = titre;
  renderList();
  window.scrollTo(0, 0);
}

function fermePanneau(){
  unitOuverte = null;
  el("pad").hidden = false;
  el("btnBackPad").hidden = true;
  PANNEAUX.forEach(p => { const c = el(p); if(c) c.hidden = true; });
  renderList();
  window.scrollTo(0, 0);
}

/* actions de cycle de vie d'une liste : elles vivent la ou l'on choisit sa
   liste, pas dans l'editeur — celui-ci ne porte que ce qui la qualifie */
function ouvreActions(L){
  el("listActTitle").textContent = L.nom;
  const host = el("listActList");
  host.innerHTML = "";
  const item = (titre, sous, action, danger) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt";
    b.innerHTML = '<span class="oi"><span class="o1"' + (danger ? ' style="color:var(--warn)"' : '') +
      '>' + titre + '</span><span class="o2">' + sous + '</span></span>';
    b.addEventListener("click", ()=>{ closeSheet("sheetListAct"); action(); });
    host.appendChild(b);
  };
  item("Ouvrir", "Modifier cette liste", ()=> ouvreEditeur(L.id));
  item("Dupliquer", "Une copie de « " + L.nom + " », unités comprises",
    ()=>{ ouvre(L); dupliqueListe(); ouvreEditeur(); });
  if(LISTS.length > 1)
    item("Supprimer", L.units.length + " unité" + (L.units.length > 1 ? "s" : "") + " perdue" +
      (L.units.length > 1 ? "s" : "") + ", définitivement",
      ()=>{ ouvre(L); supprimeListe(); renderIndex(); }, true);
  else
    item("Supprimer", "Impossible : c'est ta seule liste", ()=>{}, false);
  openSheet("sheetListAct");
}

function renderIndex(){
  const host = el("listCards"); if(!host) return;
  host.innerHTML = "";
  if(!LISTS.length){
    host.innerHTML = '<div class="empty" style="padding:16px 4px">Aucune liste. Crées-en une pour commencer.</div>';
    return;
  }
  LISTS.forEach(L=>{
    const p = pointsDe(L), over = p > L.cap;
    const rangee = document.createElement("div");
    rangee.className = "lrow";
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lcard" + (L === R ? " on" : "");
    b.innerHTML =
      '<span class="li"><b>' + L.nom + '</b>' +
      '<i>' + L.units.length + ' unité' + (L.units.length > 1 ? 's' : '') +
        ' · ' + L.detach.length + ' détachement' + (L.detach.length > 1 ? 's' : '') + '</i>' +
      '<span class="det">' + (L.detach.join(" · ") || "aucun détachement") + '</span></span>' +
      '<span class="lp' + (over ? ' over' : '') + '"><b>' + p + '</b><i>/ ' + L.cap + ' pts</i></span>';
    b.addEventListener("click", ()=> ouvreEditeur(L.id));
    const m = document.createElement("button");
    m.type = "button";
    m.className = "lmore";
    m.setAttribute("aria-label", "Actions sur « " + L.nom + " »");
    m.textContent = "⋯";
    m.addEventListener("click", e => { e.stopPropagation(); ouvreActions(L); });
    rangee.appendChild(b); rangee.appendChild(m);
    host.appendChild(rangee);
  });
}

/* ==========================================================
   LISTE EN LECTURE
   Ce qu'on regarde en partie : les groupes, leurs figurines et
   leur armement, sans rien pouvoir modifier par megarde.
   ========================================================== */
function renderPlay(){
  const host = el("playList"); if(!host) return;
  host.innerHTML = "";
  if(!R || !R.units.length){
    host.innerHTML = '<div class="empty" style="padding:16px 4px">La liste ouverte est vide.</div>';
    return;
  }
  const tete = document.createElement("div");
  tete.className = "ptsbar";
  const p = pointsDe(R);
  tete.innerHTML =
    '<div class="c ' + (p > R.cap ? "over" : "ok") + '"><div class="k">' + R.nom +
      '</div><div class="v">' + p + ' <small style="font-size:11px;color:var(--tx3)">/ ' + R.cap + '</small></div></div>' +
    '<div class="c"><div class="k">Détachement</div><div class="v">' + totalDP() + ' / ' + capDP() + '</div></div>' +
    '<div class="c"><div class="k">Unités</div><div class="v">' + R.units.length + '</div></div>';
  host.appendChild(tete);

  R.units.forEach(ru=>{
    const u = unitRow(ru.name); if(!u) return;
    const wl = unitWeps(ru.name);
    const g = document.createElement("div");
    g.className = "pgrp";
    let html = '<h4>' + nomAffiche(ru) + '</h4>';
    const sc = socle(ru.name);
    /* une fortification ne bouge pas : son mouvement se note « — » */
    const mv = u[1] ? 'M' + u[1] + '"' : 'immobile';
    html += '<div class="pu"><b>' + ru.name + '</b><i>×' + ru.size + ' · ' + mv + ' · E' + u[2] +
      ' · Svg ' + u[3] + '+' + (u[4] ? '/' + u[4] + '++' : '') + ' · ' + u[5] + ' PV' +
      (sc ? ' · socle ' + sc + ' mm' : '') + '</i>';
    ru.lo.forEach(l=>{ const w = wl[l.w]; if(w && l.n)
      html += '<span class="pw">×' + l.n + ' ' + w[1] + ' — A' + w[3] + ' ' + w[4] + '+ F' + w[5] +
        ' PA' + (w[6] ? '-' + w[6] : '0') + ' D' + w[7] + '</span>'; });
    html += '</div>';
    ru.chars.forEach(c=>{
      const cu = unitRow(c.name), cw = unitWeps(c.name)[c.w || 0];
      if(!cu) return;
      html += '<div class="pu"><b style="color:var(--glow)">' + c.name + '</b><i>' +
        (roleDe(c.name) || '') + ' · E' + cu[2] + ' · ' + cu[5] + ' PV' +
        (socle(c.name) ? ' · socle ' + socle(c.name) + ' mm' : '') + '</i>' +
        (cw ? '<span class="pw">' + cw[1] + ' — A' + cw[3] + ' ' + cw[4] + '+ F' + cw[5] +
          ' PA' + (cw[6] ? '-' + cw[6] : '0') + ' D' + cw[7] + '</span>' : '') + '</div>';
    });
    if(ru.enh){
      const e = enhRow(ru.enh);
      html += '<div class="pu"><b style="color:var(--cyan)">' + ru.enh + '</b><i>' +
        (e && typeof e[1] === "number" ? e[1] + ' pts' : 'coût inconnu') + '</i></div>';
    }
    const kws = motsClesGroupe(ru);
    if(kws.length) html += '<div class="pu"><div class="kwline" style="margin:0">' +
      kws.map(k => '<span class="gkw' + (k.source ? ' gkwadd' : '') + '">' + k.kw.toUpperCase() + '</span>').join("") +
      '</div></div>';
    g.innerHTML = html;
    host.appendChild(g);
  });
}

function renderLists(){
  const nom = el("listName"), cap = el("listCap");
  if(nom && document.activeElement !== nom) nom.value = R.nom;
  if(cap && document.activeElement !== cap) cap.value = R.cap;
  const hint = el("detHint");
  if(hint) hint.textContent = capDP() + " Points de Détachement à " + R.cap +
    " pts. Deux détachements ne peuvent pas partager le même tag d'exclusivité.";
}

function renderPtsBar(){
  const pts = totalPoints(), dp = totalDP();
  const b = el("ptsbar");
  if(!b) return;
  const cap = R.cap || 2000, dpMax = capDP();
  b.innerHTML =
    '<div class="c ' + (pts>cap?"over":(pts?"ok":"")) + '"><div class="k">Points</div><div class="v">' +
      pts + ' <small style="font-size:11px;color:var(--tx3)">/ ' + cap + '</small></div></div>' +
    '<div class="c ' + (dp>dpMax?"over":"") + '"><div class="k">Détachement</div><div class="v">' + dp + ' / ' + dpMax + '</div></div>' +
    '<div class="c"><div class="k">Unités</div><div class="v">' + R.units.length + '</div></div>';
}
function renderDetach(){
  const host = el("detList"); host.innerHTML = "";
  /* plus de budget ou plus rien de compatible : on ferme la porte
     plutot que de proposer un choix qui ne menerait qu'a une alerte */
  const b = el("btnAddDetach");
  if(b){
    const libre = DETACHMENTS.some(d => !detachBloque(d));
    b.disabled = !libre;
    b.textContent = libre ? "+ Ajouter un détachement"
      : (capDP() - totalDP() > 0 ? "Aucun détachement compatible" : "Budget de détachement épuisé");
  }
  if(!R.detach.length){ host.innerHTML = '<div class="empty" style="padding:14px 4px">Aucun détachement choisi.</div>'; return; }
  R.detach.forEach((n,i)=>{
    const d = detachRow(n); if(!d) return;
    const div = document.createElement("div");
    div.className = "runit";
    div.innerHTML =
      '<div class="rhead"><div class="rn"><b>' + d[0] + '</b><i>' + d[3] + ' · ' + d[1] + ' PD</i></div>' +
      '<button class="xbtn" type="button">×</button></div>' +
      '<p class="hint" style="margin-top:7px">' + d[4] + '</p>';
    div.querySelector(".xbtn").addEventListener("click", ()=>{ R.detach.splice(i,1); saveR(); renderList(); });
    host.appendChild(div);
  });
}
function stepper(get, set, min, max){
  const w = document.createElement("span");
  w.className = "stepper";
  const mk = (t, delta) => {
    const b = document.createElement("button");
    b.type="button"; b.textContent=t;
    b.addEventListener("click", ()=>{
      const v = Math.max(min, Math.min(max, get() + delta));
      set(v); saveR(); renderList();
    });
    return b;
  };
  const val = document.createElement("span");
  val.textContent = get();
  w.appendChild(mk("−",-1)); w.appendChild(val); w.appendChild(mk("+",1));
  return w;
}
function renderRoster(){
  const host = el("rosterList"); host.innerHTML = "";
  if(!R.units.length){
    host.innerHTML = '<div class="empty">Ta liste est vide.<br>Ajoute une unité pour commencer.</div>';
    return;
  }
  /* le pave ouvre une unite a la fois : on ne rend que celle-la */
  const vues = unitOuverte ? R.units.filter(x => x.id === unitOuverte) : R.units;
  if(!vues.length){ fermePanneau(); return; }
  vues.forEach((ru)=>{
    const ui = R.units.indexOf(ru);
    const u = unitRow(ru.name); if(!u) return;
    const wl = unitWeps(ru.name);
    const div = document.createElement("div");
    div.className = "runit";

    /* une unite seule n'est pas un groupe : le nom n'apparait qu'une fois
       un personnage rattache, puisque c'est ce qui en fait un ensemble */
    if(ru.chars.length){
      const gh = document.createElement("div");
      gh.className = "ghead";
      const gi = document.createElement("input");
      gi.type = "text"; gi.className = "gname"; gi.value = ru.grp || "";
      gi.setAttribute("aria-label", "Nom du groupe");
      gi.addEventListener("change", ()=>{ ru.grp = gi.value.trim() || nomGroupe(); saveR(); renderList(); });
      const gr = document.createElement("button");
      gr.type="button"; gr.className="xbtn"; gr.textContent="⟳"; gr.title="Un autre nom";
      gr.addEventListener("click", ()=>{ ru.grp = nomGroupe(); saveR(); renderList(); });
      gh.appendChild(gi); gh.appendChild(gr);
      div.appendChild(gh);
    }

    const head = document.createElement("div");
    head.className = "rhead";
    const sc = socle(ru.name);
    head.innerHTML = '<div class="rn"><b>' + ru.name + '</b><i>×' + ru.size + ' · E' + u[2] +
      ' · Svg ' + u[3] + '+' + (u[4] ? '/' + u[4] + '++' : '') + ' · ' + u[5] + ' PV · socle ' +
      (sc ? sc + ' mm' : '—') + '</i></div>' +
      '<span class="rpts">' + unitPoints(ru) + ' pts</span>';
    div.appendChild(head);

    if(u[6].length > 1){
      const sc = document.createElement("div");
      sc.className = "chips tight";
      u[6].forEach(sz=>{
        const b = document.createElement("button");
        b.type="button"; b.className = "chip" + (sz===ru.size ? " on" : "");
        b.textContent = "×" + sz + (u[7][String(sz)] ? " · " + u[7][String(sz)] + " pts" : "");
        b.addEventListener("click", ()=>{
          ru.size = sz;
          const tot = ru.lo.reduce((a,l)=>a+l.n,0);
          if(tot > sz && ru.lo.length === 1) ru.lo[0].n = sz;
          saveR(); renderList();
        });
        sc.appendChild(b);
      });
      div.appendChild(sc);
    }

    ru.lo.forEach((l, li)=>{
      const w = wl[l.w]; if(!w) return;
      const row = document.createElement("div");
      row.className = "lo";
      row.innerHTML = '<span class="ln">' + w[1] + (w[2]==="C" ? ' <em>·càc</em>' : '') +
        ' <em>A' + w[3] + ' F' + w[5] + ' PA' + (w[6]?'-'+w[6]:'0') + ' D' + w[7] + '</em></span>';
      row.appendChild(stepper(()=>l.n, v=>{ l.n = v; if(v===0) ru.lo.splice(li,1); }, 0, 60));
      div.appendChild(row);
    });

    ru.chars.forEach((c, ci)=>{
      const cl = unitWeps(c.name), w = cl[c.w] || cl[0];
      const row = document.createElement("div");
      row.className = "lo";
      const role = (unitRow(c.name)||[])[9] || (RETINUE[c.name] ? "Escorte" : "");
      const scc = socle(c.name);
      const hors = peutRejoindre(c.name, ru.name) === false;
      row.innerHTML = '<span class="ln" style="color:var(--glow)">' + c.name +
        (hors ? ' <b class="alerte" title="Ce personnage ne figure pas dans la liste des unités qu\'il peut rejoindre">!</b>' : '') +
        ' <em>' + role + (scc ? ' · socle ' + scc + ' mm' : '') + (w ? ' · ' + w[1] : '') + '</em></span>';
      const nx = document.createElement("button");
      nx.className="xbtn"; nx.type="button"; nx.textContent="⟳"; nx.title="Changer d'arme";
      nx.addEventListener("click", ()=>{ c.w = (c.w + 1) % cl.length; saveR(); renderList(); });
      const rm = document.createElement("button");
      rm.className="xbtn"; rm.type="button"; rm.textContent="×";
      rm.addEventListener("click", ()=>{ ru.chars.splice(ci,1); saveR(); renderList(); });
      row.appendChild(nx); row.appendChild(rm);
      div.appendChild(row);
    });

    /* amelioration portee par le groupe */
    if(ru.enh){
      const e = enhRow(ru.enh);
      const row = document.createElement("div");
      row.className = "lo";
      row.innerHTML = '<span class="ln" style="color:var(--cyan,#5CE8E8)">' + ru.enh +
        ' <em>' + (e && typeof e[1] === "number" ? e[1] + ' pts' : 'coût inconnu') +
        (e ? ' · ' + e[2] : '') + '</em></span>';
      const rm = document.createElement("button");
      rm.className="xbtn"; rm.type="button"; rm.textContent="×";
      rm.addEventListener("click", ()=>{ ru.enh = null; saveR(); renderList(); });
      row.appendChild(rm);
      div.appendChild(row);
    }

    /* mots-cles du groupe : ceux apportes par un personnage sont signales */
    const kws = motsClesGroupe(ru);
    if(kws.length){
      const kwl = document.createElement("div");
      kwl.className = "kwline";
      kwl.innerHTML = kws.map(k => '<span class="gkw' + (k.source ? ' gkwadd' : '') + '"' +
        (k.source ? ' title="apporté par ' + k.source + '"' : '') + '>' + k.kw.toUpperCase() + '</span>').join("");
      div.appendChild(kwl);
    }

    /* Équipement — les armes de tir se répartissent entre figurines, les
       armes de mêlée sont portées par toutes : elles n'apparaissaient donc
       nulle part tant qu'on ne les avait pas ajoutées à la main. */
    const eq = document.createElement("div");
    eq.className = "eqbloc";
    const pris = {};
    ru.lo.forEach(l => { if(l.n > 0) pris[l.w] = (pris[l.w] || 0) + l.n; });
    const lignes = wl.map((w, i) => ({ w:w, i:i, n:pris[i] || 0 }));
    const tir = lignes.filter(x => x.w[2] === "T"), cac = lignes.filter(x => x.w[2] === "C");
    const table = (titre, lot) => {
      if(!lot.length) return "";
      let h = '<div class="eqt">' + titre + '</div><div class="eqwrap"><table class="arms">' +
        '<thead><tr><th style="text-align:left">Arme</th><th>A</th><th>CT</th><th>F</th><th>PA</th><th>D</th></tr></thead><tbody>';
      lot.forEach(x=>{
        const w = x.w, mots = w[8] ? motsArme(w[8]) : "";
        h += '<tr class="' + (x.n ? '' : 'off') + '"><td class="an">' +
          (x.n ? '<b class="q">×' + x.n + ' </b>' : '') + w[1] +
          (mots ? '<span class="n">' + mots + '</span>' : '') + '</td>' +
          '<td>' + w[3] + '</td><td>' + w[4] + '+</td><td>' + w[5] + '</td>' +
          '<td>' + (w[6] ? '-' + w[6] : '0') + '</td><td>' + w[7] + '</td></tr>';
      });
      return h + '</tbody></table></div>';
    };
    eq.innerHTML = table("Tir", tir) + table("Corps à corps", cac) +
      '<p class="hint">Les armes de mêlée équipent toute l\'unité : elles ne se répartissent pas.</p>';
    div.appendChild(eq);

    const add = document.createElement("div");
    add.className = "addrow";
    const bw = document.createElement("button");
    bw.type="button"; bw.textContent="+ Arme";
    bw.addEventListener("click", ()=> openWeaponPick(ru));
    const bc = document.createElement("button");
    bc.type="button"; bc.textContent="+ Personnage";
    bc.addEventListener("click", ()=> openCharPick(ru));
    const be = document.createElement("button");
    be.type="button"; be.textContent = ru.enh ? "⇄ Amélioration" : "+ Amélioration";
    be.addEventListener("click", ()=> openEnhPick(ru));
    add.appendChild(bw); add.appendChild(bc); add.appendChild(be);
    div.appendChild(add);

    const del = document.createElement("button");
    del.type = "button"; del.className = "btn danger";
    del.textContent = "Retirer « " + ru.name + " » de la liste";
    del.addEventListener("click", ()=>{
      if(!confirm("Retirer " + ru.name + " ×" + ru.size +
        (ru.chars.length ? " et ses " + ru.chars.length + " personnage" + (ru.chars.length>1?"s":"") : "") +
        " de la liste ?")) return;
      const i = R.units.indexOf(ru);
      if(i >= 0) R.units.splice(i, 1);
      saveR(); fermePanneau();
    });
    div.appendChild(del);
    host.appendChild(div);
  });
}
/* ==========================================================
   STRATAGEMES
   Ceux des detachements retenus, puis ceux de base. Le texte
   n'est renseigne que pour ce qui a pu etre verifie.
   ========================================================== */
function renderStrats(){
  const host = el("stratList"); if(!host) return;
  host.innerHTML = "";
  const groupes = R.detach.slice();
  groupes.push("Core");
  let rien = true;
  groupes.forEach(g=>{
    const lot = STRATS.filter(x => x[1] === g);
    if(!lot.length) return;
    rien = false;
    const sep = document.createElement("div");
    sep.className = "stratsep";
    sep.textContent = g === "Core" ? "Stratagèmes de base" : g;
    host.appendChild(sep);
    lot.forEach(x=>{
      const [nom, det, type, cp, quand, cible, effet] = x;
      const d = document.createElement("div");
      d.className = "strat";
      const t = document.createElement("button");
      t.type = "button";
      t.innerHTML = '<span class="sn"><b>' + nom + '</b><i>' +
        (type && type !== "Core" ? type : (det === "Core" ? "Stratagème de base" : det)) +
        '</i></span><span class="cp">' + cp + ' PC</span>';
      const body = document.createElement("div");
      body.className = "sbody";
      body.innerHTML = effet
        ? '<dl><dt>Quand</dt><dd>' + quand + '</dd><dt>Cible</dt><dd>' + cible +
          '</dd><dt>Effet</dt><dd>' + effet + '</dd></dl>'
        : '<p class="vide">Texte non renseigné — aucune source vérifiable n\'a pu être trouvée pour ce stratagème.</p>';
      t.addEventListener("click", ()=> d.classList.toggle("open"));
      d.appendChild(t); d.appendChild(body);
      host.appendChild(d);
    });
  });
  if(rien) host.innerHTML = '<div class="empty">Choisis un détachement pour voir ses stratagèmes.</div>';
}

/* ==========================================================
   ARMEMENT A PLAT
   Tous les profils de la liste dans un seul tableau, comme le
   « Show All Weapons » de WarOrgan : en partie on cherche une
   arme, pas une unite.
   ========================================================== */
let armMode = "prises";
function motsArme(flags){
  const f = parseFlags(flags), k = [];
  if(f.lethal)  k.push("Lethal Hits");
  if(f.dev)     k.push("Devastating Wounds");
  if(f.torrent) k.push("Torrent");
  if(f.blast)   k.push("Blast");
  if(f.twin)    k.push("Twin-linked");
  if(f.sust)    k.push("Sustained Hits " + f.sust);
  if(f.rf)      k.push("Rapid Fire " + f.rf);
  if(f.melta)   k.push("Melta " + f.melta);
  if(f.anti)    k.push("Anti-X " + f.anti + "+");
  if(f.assault) k.push("Assault");
  if(f.heavy)   k.push("Heavy");
  if(f.precision) k.push("Precision");
  if(f.hazard)  k.push("Hazardous");
  if(f.pistol)  k.push("Pistol");
  if(f.indirect) k.push("Indirect");
  return k.join(" · ");
}
function renderArms(){
  const host = el("armList"); if(!host) return;
  host.innerHTML = "";
  if(!R.units.length){
    host.innerHTML = '<div class="empty">Ta liste est vide.</div>';
    return;
  }
  R.units.forEach(ru=>{
    const wl = unitWeps(ru.name); if(!wl.length) return;
    /* combien de figurines portent chaque arme, personnages compris */
    const pris = {};
    ru.lo.forEach(l => { if(l.n > 0) pris[l.w] = (pris[l.w] || 0) + l.n; });

    const lignes = [];
    wl.forEach((w, i)=>{
      const n = pris[i] || 0;
      if(armMode === "prises" && !n) return;
      if(armMode === "tir" && w[2] !== "T") return;
      if(armMode === "cac" && w[2] !== "C") return;
      lignes.push({w:w, n:n, unite:ru.name});
    });
    /* armes des personnages rattaches : celle qui est selectionnee */
    ru.chars.forEach(c=>{
      const cw = unitWeps(c.name);
      cw.forEach((w, i)=>{
        const equipee = (c.w || 0) === i;
        if(armMode === "prises" && !equipee) return;
        if(armMode === "tir" && w[2] !== "T") return;
        if(armMode === "cac" && w[2] !== "C") return;
        lignes.push({w:w, n:equipee ? 1 : 0, unite:c.name, perso:true});
      });
    });
    if(!lignes.length) return;

    const g = document.createElement("div");
    g.className = "armgrp";
    g.innerHTML = '<h4>' + nomAffiche(ru) + (estGroupe(ru) ? ' <span>· ' + ru.name + '</span>' : '') +
      ' <span>×' + ru.size + '</span></h4>';
    const wrap = document.createElement("div");
    wrap.className = "armwrap";
    let html = '<table class="arms"><thead><tr><th style="text-align:left">Arme</th>' +
      '<th>A</th><th>CT</th><th>F</th><th>PA</th><th>D</th></tr></thead><tbody>';
    lignes.forEach(L=>{
      const w = L.w, mots = w[8] ? motsArme(w[8]) : "";
      html += '<tr class="' + (L.n ? '' : 'off') + '"><td class="an">' +
        (L.n ? '<b class="q">' + (L.perso ? '' : '×' + L.n + ' ') + '</b>' : '') + w[1] +
        (w[2] === "C" ? ' <em style="color:var(--tx3)">càc</em>' : '') +
        (L.perso ? ' <em style="color:var(--tx3)">· ' + L.unite + '</em>' : '') +
        (mots ? '<span class="n">' + mots + '</span>' : '') + '</td>' +
        '<td>' + w[3] + '</td><td>' + w[4] + '+</td><td>' + w[5] + '</td>' +
        '<td>' + (w[6] ? '-' + w[6] : '0') + '</td><td>' + w[7] + '</td></tr>';
    });
    wrap.innerHTML = html + '</tbody></table>';
    g.appendChild(wrap);
    host.appendChild(g);
  });
  if(!host.children.length) host.innerHTML = '<div class="empty">Rien à afficher avec ce filtre.</div>';
}

function renderWarn(){
  const w = validate(), host = el("rosterWarn");
  host.innerHTML = w.length ? '<div class="warnbox">' + w.join("<br>") + '</div>' : "";
}
function renderList(){
  renderLists(); renderPtsBar(); renderDetach(); renderRoster(); renderWarn();
  renderStrats(); renderArms(); renderFireList(); renderIndex(); renderPad();
  if(window.__syncRosterQuick) window.__syncRosterQuick();
}

/* ---------- ajout d'unite / arme / personnage via la feuille ---------- */
let pickMode = null, pickTarget = null;
function openSheet(id){ el(id).classList.add("open"); document.body.style.overflow="hidden"; }
function closeSheet(id){ el(id).classList.remove("open"); document.body.style.overflow=""; }

function openUnitPick(){
  window.__rosterPick = true; pickMode = "unit"; pickTarget = null;
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
function openWeaponPick(ru){
  window.__rosterPick = true; pickMode = "weapon"; pickTarget = ru;
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
function openCmpPick(src){
  window.__rosterPick = true; pickMode = "cmp:" + src; pickTarget = null;
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
function openCharPick(ru){
  window.__rosterPick = true; pickMode = "char"; pickTarget = ru;
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
function openEnhPick(ru){
  window.__rosterPick = true; pickMode = "enh"; pickTarget = ru;
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function renderPick(){
  const q = norm(el("uSearch").value.trim());
  const host = el("uList"); host.innerHTML = "";
  const head = el("sheetUnit").querySelector("h3");

  if(pickMode === "weapon"){
    head.textContent = "Ajouter une arme — " + pickTarget.name;
    unitWeps(pickTarget.name).forEach((w,i)=>{
      if(q && !norm(w[1]).includes(q)) return;
      const b = document.createElement("button");
      b.type="button"; b.className="opt";
      b.innerHTML = '<span class="oi"><span class="o1">' + w[1] + (w[2]==="C"?"  ·càc":"") + '</span>' +
        '<span class="o2">A' + w[3] + ' · ' + w[4] + '+ · F' + w[5] + ' · PA ' + (w[6]?'-'+w[6]:'0') + ' · D' + w[7] + '</span></span>';
      b.addEventListener("click", ()=>{
        const ex = pickTarget.lo.find(l => l.w === i);
        if(ex) ex.n = Math.min(pickTarget.size, ex.n + 1);
        else pickTarget.lo.push({w:i, n:1});
        closeSheet("sheetUnit"); saveR(); renderList();
      });
      host.appendChild(b);
    });
    return;
  }
  if(pickMode === "char"){
    head.textContent = "Rattacher à " + pickTarget.name;
    const cible = pickTarget.name;
    /* eligibles : personnages dont la regle Leader cite cette unite,
       plus les escortes qui peuvent s'y greffer */
    const candidats = UNITS.filter(u => (u[9] || RETINUE[u[0]]) && (!q || norm(u[0]).includes(q)));
    const ok = candidats.filter(u => peutRejoindre(u[0], cible) === true);
    const inconnu = candidats.filter(u => peutRejoindre(u[0], cible) === null);
    const non = candidats.filter(u => peutRejoindre(u[0], cible) === false);

    const bouton = (u, etat) => {
      const refus = refusAttache(u[0], pickTarget);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opt" + (etat === "non" || refus ? " opt-off" : "");
      if(refus) b.disabled = true;
      const role = u[9] || "Escorte";
      const sc = socle(u[0]);
      b.innerHTML = '<span class="oi"><span class="o1">' + u[0] + '</span><span class="o2">' +
        role + ' · E' + u[2] + ' · ' + u[5] + ' PV' + (sc ? ' · socle ' + sc + ' mm' : '') +
        ' · ' + (u[7][String(u[6][0])]||0) + ' pts' + (refus ? ' — ' + refus : '') + '</span></span>' +
        '<span class="otag">' + role.toUpperCase() + '</span>';
      if(!refus) b.addEventListener("click", ()=>{
        pickTarget.chars.push({name:u[0], w:0});
        closeSheet("sheetUnit"); saveR(); renderList();
      });
      return b;
    };
    const titre = t => {
      const d = document.createElement("div");
      d.className = "sheet-sep"; d.textContent = t; host.appendChild(d);
    };
    if(ok.length){ titre("Peuvent rejoindre " + cible); ok.forEach(u => host.appendChild(bouton(u, "ok"))); }
    if(inconnu.length){ titre("Sans règle de rattachement connue"); inconnu.forEach(u => host.appendChild(bouton(u, "?"))); }
    if(non.length){ titre("Hors règles — cette unité n'est pas dans leur liste"); non.forEach(u => host.appendChild(bouton(u, "non"))); }
    if(!host.children.length) host.innerHTML = '<div class="sheet-empty">Aucun personnage ne correspond.</div>';
    return;
  }
  if(pickMode === "enh"){
    head.textContent = "Amélioration — " + pickTarget.name;
    const dispo = enhDispo().filter(e => !q || norm(e[0]).includes(q));
    if(!R.detach.length){
      host.innerHTML = '<div class="sheet-empty">Choisis d\'abord un détachement : ' +
        'les améliorations en dépendent.</div>';
      return;
    }
    /* une amelioration ne se prend qu'une fois dans l'armee */
    const prises = R.units.filter(x => x !== pickTarget).map(x => x.enh).filter(Boolean);
    dispo.forEach(e=>{
      const deja = prises.indexOf(e[0]) >= 0;
      const b = document.createElement("button");
      b.type="button"; b.className = "opt" + (deja ? " opt-off" : "") + (pickTarget.enh === e[0] ? " sel" : "");
      b.innerHTML = '<span class="oi"><span class="o1">' + e[0] + '</span><span class="o2">' +
        (typeof e[1] === "number" ? e[1] + ' pts' : 'coût inconnu') + ' · ' + e[2] +
        (deja ? ' · déjà prise ailleurs' : '') + '</span>' +
        (e[3] ? '<span class="o3">' + e[3] + '</span>' : '') + '</span>';
      b.addEventListener("click", ()=>{
        pickTarget.enh = (pickTarget.enh === e[0]) ? null : e[0];
        closeSheet("sheetUnit"); saveR(); renderList();
      });
      host.appendChild(b);
    });
    if(!host.children.length) host.innerHTML =
      '<div class="sheet-empty">Aucune amélioration pour les détachements retenus.</div>';
    return;
  }
  if(pickMode && pickMode.indexOf("cmp:") === 0){
    const fromRoster = pickMode === "cmp:roster";
    head.textContent = fromRoster ? "Comparer — depuis ma liste" : "Comparer — catalogue";
    const src = fromRoster
      ? R.units.map(ru => ({name:ru.name, size:ru.size, w:(ru.lo[0]||{w:0}).w}))
      : UNITS.map(u => ({name:u[0], size:u[6][u[6].length-1], w:0}));
    const seen = new Set();
    src.filter(c => !q || norm(c.name).includes(q)).forEach(c=>{
      if(fromRoster && seen.has(c.name + c.size)) return;
      seen.add(c.name + c.size);
      const u = unitRow(c.name); if(!u) return;
      const b = document.createElement("button");
      b.type="button"; b.className="opt";
      b.innerHTML = '<span class="oi"><span class="o1">' + c.name + '</span><span class="o2">×' + c.size +
        ' · ' + (u[7][String(c.size)]||0) + ' pts · E' + u[2] + ' · Svg ' + u[3] + '+</span></span>';
      b.addEventListener("click", ()=>{
        CMP.push({name:c.name, size:c.size, w:c.w|0});
        closeSheet("sheetUnit"); saveCmp(); renderCmpList();
      });
      host.appendChild(b);
    });
    if(!host.children.length) host.innerHTML = '<div class="sheet-empty">Rien à ajouter ici.</div>';
    return;
  }
  head.textContent = "Ajouter une unité";
  /* rangé par grande catégorie : on cherche « un véhicule », « un héros »,
     rarement un nom précis dans une liste de cinquante-deux entrées */
  const retenues = UNITS.filter(u => !q || norm(u[0]).includes(q) ||
    unitWeps(u[0]).some(w => norm(w[1]).includes(q)) || norm(categorie(u[0])).includes(q));
  const parCat = {};
  retenues.forEach(u => (parCat[categorie(u[0])] = parCat[categorie(u[0])] || []).push(u));
  const bouton = u => {
    const b = document.createElement("button");
    b.type="button"; b.className="opt";
    const sz = u[6][u[6].length-1];
    b.innerHTML = '<span class="oi"><span class="o1">' + u[0] + '</span><span class="o2">×' + u[6].join("/") +
      ' · ' + (u[7][String(sz)]||0) + ' pts · E' + u[2] + ' · Svg ' + u[3] + '+</span></span>' +
      (u[10] ? '<span class="otag">LEGENDS</span>' : (u[9] ? '<span class="otag">' + u[9].toUpperCase() + '</span>' : ""));
    b.addEventListener("click", ()=>{
      const wl = unitWeps(u[0]);
      let di = wl.findIndex(w => w[2] === "T");
      if(di < 0) di = 0;
      const neuve = {id:nextId++, name:u[0], size:sz, lo:[{w:di, n:sz}], chars:[], sel:true,
        grp:nomGroupe(), enh:null};
      R.units.push(neuve);
      closeSheet("sheetUnit"); saveR();
      /* on vient de la poser sur le pave : on ouvre directement son panneau,
         c'est la qu'on va la regler */
      if(el("listEditor") && !el("listEditor").hidden) ouvrePanneau("cardUnits", neuve.id);
      else renderList();
    });
    return b;
  };
  CAT_ORDRE.forEach(cat=>{
    const lot = parCat[cat];
    if(!lot || !lot.length) return;
    const sep = document.createElement("div");
    sep.className = "sheet-sep";
    sep.textContent = cat + "  ·  " + lot.length;
    host.appendChild(sep);
    lot.forEach(u => host.appendChild(bouton(u)));
  });
  if(!host.children.length) host.innerHTML = '<div class="sheet-empty">Aucune unité trouvée.</div>';
}

/* ==========================================================
   ECRAN « TIR CUMULE »
   ========================================================== */
function renderFireList(){
  const host = el("fireList"); if(!host) return;
  host.innerHTML = "";
  if(!R.units.length){
    host.innerHTML = '<div class="empty">Aucune unité dans ta liste.<br>Va dans « Ma liste » pour en ajouter.</div>';
    el("situBox").innerHTML = ""; renderFire(); return;
  }
  R.units.forEach(ru=>{
    const profs = unitProfiles(ru);
    const div = document.createElement("div");
    div.className = "runit checkrow" + (ru.sel && profs.length ? " on sel" : "");
    div.style.cursor = profs.length ? "pointer" : "default";
    div.style.opacity = profs.length ? "1" : ".45";
    const nA = profs.reduce((a,p)=> a + analytic(p).A, 0);
    div.innerHTML = '<span class="cbox">✓</span><span class="rn" style="flex:1;min-width:0">' +
      '<b style="display:block;font-size:14px">' + ru.name + '</b>' +
      '<i style="display:block;font-style:normal;font-size:11px;color:var(--tx3);margin-top:2px">' +
      (profs.length ? profs.length + " profil" + (profs.length>1?"s":"") + " · " + num(nA) + " attaques"
                    : "aucune arme pour cette phase") +
      ' · ' + unitPoints(ru) + ' pts</i></span>';
    if(profs.length) div.addEventListener("click", ()=>{ ru.sel = !ru.sel; saveR(); renderFireList(); });
    host.appendChild(div);
  });
  renderSitu();
  renderFire();
}
function renderSitu(){
  const host = el("situBox"); if(!host) return;
  const rules = activeRules().filter(d => d[6]);
  if(!rules.length){ host.innerHTML = ""; return; }
  host.innerHTML = '<p class="hint" style="margin-top:12px">Conditions de tes détachements — coche celles qui sont vraies ce tour-ci :</p>';
  rules.forEach(d=>{
    const lab = document.createElement("label");
    lab.className = "toggle";
    lab.innerHTML = '<input type="checkbox"' + (situ[d[5]] ? " checked" : "") + '><span class="box">✓</span>' +
      '<span class="txt">' + (SITU_LABEL[d[5]] || d[3]) + '<em>' + d[0] + '</em></span>';
    lab.querySelector("input").addEventListener("change", e=>{
      situ[d[5]] = e.target.checked; renderFireList();
    });
    host.appendChild(lab);
  });
}

function renderFire(){
  const chosen = R.units.filter(ru => ru.sel);
  const entries = [];
  chosen.forEach(ru=>{
    unitProfiles(ru).forEach(p => entries.push({ru, p}));
  });
  if(!entries.length){
    el("fDmg").textContent = "—"; el("fSlain").textContent = "—"; el("fWipe").textContent = "—";
    el("fTable").innerHTML = ""; el("fSub").textContent = "";
    el("fHist").innerHTML = ""; el("fNote").textContent = "";
    return;
  }
  const N = entries.length > 8 ? 12000 : 25000;
  const sim = simulateCombined(entries.map(e => e.p), N);
  const M = S.models;

  el("fDmg").textContent = num(sim.meanDealt);
  el("fSlain").textContent = num(sim.meanSlain);
  el("fWipe").textContent = pct(sim.slainDist[M]);
  el("fSub").textContent = "Figurines tuées sur " + sim.N.toLocaleString("fr-FR") +
    " simulations complètes de la phase, dans l'ordre de la liste.";
  drawBars(el("fHist"), binned(sim.slainDist, 26), "var(--green)", (i,v)=>
    "<b>" + i + "</b> figurine" + (i>1?"s":"") + "<br>probabilité <b>" + pct(v) + "</b>");

  /* agregation par unite */
  const byUnit = new Map();
  entries.forEach((e,i)=>{
    const k = e.ru.id;
    if(!byUnit.has(k)) byUnit.set(k, {ru:e.ru, dealt:0, raw:0, pts:unitPoints(e.ru), alone:0});
    const o = byUnit.get(k);
    o.dealt += sim.per[i].dealt;
    o.raw   += sim.per[i].raw;
  });
  /* « seule » : ce que l'unite ferait en tirant la premiere sur une cible intacte */
  byUnit.forEach(o=>{
    const ps = unitProfiles(o.ru);
    const s2 = simulateCombined(ps, 8000);
    o.alone = s2 ? s2.meanDealt : 0;
  });

  const rows = [...byUnit.values()].sort((a,b)=> b.dealt - a.dealt);
  const tot = rows.reduce((a,o)=> a + o.dealt, 0) || 1;
  let html = '<table><thead><tr><th>Unité</th><th>Infligé</th><th>Seule</th><th>Part</th><th>/100 pts</th></tr></thead><tbody>';
  rows.forEach(o=>{
    html += "<tr><td>" + o.ru.name + "</td><td>" + num(o.dealt) + "</td><td>" + num(o.alone) +
      "</td><td>" + Math.round(o.dealt/tot*100) + " %</td><td>" +
      (o.pts ? num(o.alone/o.pts*100) : "—") + "</td></tr>";
  });
  html += "</tbody></table>";
  el("fTable").innerHTML = html;

  const waste = Math.max(0, sim.meanRaw - sim.meanDealt);
  el("fNote").innerHTML = "Puissance brute totale <b>" + num(sim.meanRaw) + " PV</b>, dont <b>" +
    num(waste) + " PV</b> perdus en surtue (" + Math.round(waste/Math.max(sim.meanRaw,0.001)*100) +
    " %). La colonne « /100 pts » utilise la puissance de l'unité seule : c'est la mesure d'efficacité, indépendante de l'ordre de tir.";
}


/* ==========================================================
   ECRAN « COMPARER »
   ========================================================== */
let CMP = [];          // {name, size, w}
let cmpPhaseV = "T";

function loadCmp(){ try{ CMP = JSON.parse(localStorage.getItem("mathhammer.cmp.v1") || "[]"); }catch(e){ CMP = []; } }
function saveCmp(){ try{ localStorage.setItem("mathhammer.cmp.v1", JSON.stringify(CMP)); }catch(e){} }

function cmpProfiles(c){
  const list = unitWeps(c.name);
  let w = list[c.w];
  if(!w || w[2] !== cmpPhaseV) w = list.find(x => x[2] === cmpPhaseV);
  if(!w) return [];
  const pseudo = {name:c.name, chars: el("cmpLed").checked ? [{name:"—"}] : []};
  const p = weaponProfile(c.name, w, c.size, pseudo);
  p.label = w[1];
  return [p];
}
function cmpPoints(c){
  const u = unitRow(c.name);
  return u ? (u[7][String(c.size)] || 0) : 0;
}
function renderCmpList(){
  const host = el("cmpList"); host.innerHTML = "";
  if(!CMP.length){
    host.innerHTML = '<div class="empty">Ajoute au moins deux unités à comparer.</div>';
    renderCmp(); return;
  }
  CMP.forEach((c,i)=>{
    const u = unitRow(c.name); if(!u) return;
    const list = unitWeps(c.name);
    let w = list[c.w]; if(!w || w[2] !== cmpPhaseV) w = list.find(x=>x[2]===cmpPhaseV);
    const row = document.createElement("div");
    row.className = "cmprow";
    row.innerHTML = '<span class="cn"><b>' + c.name + '</b><i>×' + c.size + ' · ' +
      (w ? w[1] : "aucune arme pour cette phase") + ' · ' + cmpPoints(c) + ' pts</i></span>';
    const nx = document.createElement("button");
    nx.className="xbtn"; nx.type="button"; nx.textContent="⟳"; nx.title="Arme suivante";
    nx.addEventListener("click", ()=>{
      const idxs = list.map((x,j)=>[x,j]).filter(([x])=>x[2]===cmpPhaseV).map(([,j])=>j);
      if(!idxs.length) return;
      const cur = idxs.indexOf(c.w);
      c.w = idxs[(cur + 1) % idxs.length];
      saveCmp(); renderCmpList();
    });
    const sz = document.createElement("button");
    sz.className="xbtn"; sz.type="button"; sz.textContent="±"; sz.title="Taille suivante";
    sz.addEventListener("click", ()=>{
      const k = u[6].indexOf(c.size);
      c.size = u[6][(k + 1) % u[6].length];
      saveCmp(); renderCmpList();
    });
    const rm = document.createElement("button");
    rm.className="xbtn"; rm.type="button"; rm.textContent="×";
    rm.addEventListener("click", ()=>{ CMP.splice(i,1); saveCmp(); renderCmpList(); });
    if(u[6].length > 1) row.appendChild(sz);
    row.appendChild(nx); row.appendChild(rm);
    host.appendChild(row);
  });
  renderCmp();
}
function hbars(host, rows, fmt, alt){
  const max = Math.max.apply(null, rows.map(r => r.v)) || 1;
  host.innerHTML = rows.map(r =>
    '<div class="hbar-row"><div class="hbar-top"><span class="hn">' + r.n + '</span>' +
    '<span class="hv">' + fmt(r.v) + '</span><span class="hp">' + r.p + ' pts</span></div>' +
    '<div class="hbar-track"><div class="hbar-fill' + (alt ? " alt" : "") +
    '" style="width:' + Math.max(1.5, r.v/max*100) + '%"></div></div></div>').join("");
}
function renderCmp(){
  const hostE = el("cmpEff"), hostA = el("cmpAbs"), hostT = el("cmpTable");
  if(CMP.length < 1){
    hostE.innerHTML = hostA.innerHTML = hostT.innerHTML = ""; el("cmpNote").textContent = ""; return;
  }
  const res = [];
  CMP.forEach(c=>{
    const ps = cmpProfiles(c);
    if(!ps.length){ res.push({n:c.name, pts:cmpPoints(c), dmg:0, slain:0, wipe:0, eff:0, none:true}); return; }
    const sim = simulateCombined(ps, 20000);
    const pts = cmpPoints(c);
    res.push({n:c.name, pts, dmg:sim.meanDealt, raw:sim.meanRaw, slain:sim.meanSlain,
              wipe:sim.slainDist[S.models], eff: pts ? sim.meanRaw/pts*100 : 0});
  });
  const byEff = res.slice().sort((a,b)=> b.eff - a.eff);
  const byAbs = res.slice().sort((a,b)=> b.raw - a.raw);
  hbars(hostE, byEff.map(r=>({n:r.n, v:r.eff, p:r.pts})), v=>num(v)+" PV", false);
  hbars(hostA, byAbs.map(r=>({n:r.n, v:r.raw||0, p:r.pts})), v=>num(v)+" PV", true);

  let html = '<table><thead><tr><th>Unité</th><th>Pts</th><th>Dégâts</th><th>Figs</th><th>Efface</th><th>/100 pts</th></tr></thead><tbody>';
  byEff.forEach(r=>{
    html += "<tr><td>" + r.n + "</td><td>" + r.pts + "</td><td>" + num(r.raw||0) + "</td><td>" +
      num(r.slain) + "</td><td>" + pct(r.wipe||0) + "</td><td>" + num(r.eff) + "</td></tr>";
  });
  hostT.innerHTML = html + "</tbody></table>";

  if(byEff.length >= 2 && byEff[0].eff > 0){
    const g = byEff[0], b = byEff[byEff.length-1];
    const ratio = b.eff > 0 ? (g.eff/b.eff) : 0;
    el("cmpNote").innerHTML = "Contre cette cible, <b>" + g.n + "</b> rend <b>" + num(g.eff) +
      " PV pour 100 pts</b>" + (ratio > 1.05 ? ", soit " + num(ratio) + "× mieux que " + b.n : "") +
      ". « Dégâts » est la puissance brute avant plafonnement par les PV de la cible : c'est la bonne mesure pour comparer, la surtue dépendant de l'ordre de tir.";
  } else el("cmpNote").textContent = "";
}

/* ==========================================================
   IMPORT / EXPORT
   ========================================================== */
function exportImport(){
  const txt = JSON.stringify({nom:R.nom, cap:R.cap, detach:R.detach, units:R.units});
  const v = prompt("Copie ce texte pour sauvegarder ta liste, ou colle-en un autre pour l'importer " +
    "— la liste importée s'ajoutera aux tiennes :", txt);
  if(v === null || v === txt) return;
  try{
    const o = JSON.parse(v);
    if(!o || !Array.isArray(o.units)) throw 0;
    const L = listeVierge(o.nom || "Liste importée", o.cap || 2000);
    L.detach = o.detach || [];
    L.units = o.units;
    normaliseListe(L);
    LISTS.push(L); ouvre(L);
    saveR(); renderList();
  }catch(e){ alert("Liste illisible — rien n'a été modifié."); }
}

/* ==========================================================
   LIEN DE PARTAGE
   la liste tient dans l'URL : JSON reduit -> gzip -> base64url,
   ce qui permet de passer une liste d'un appareil a l'autre
   sans serveur ni compte.
   ========================================================== */
const B64A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function b64u(bytes){
  let s = "";
  for(let i=0; i<bytes.length; i+=3){
    const a = bytes[i], b = bytes[i+1], c = bytes[i+2];
    s += B64A[a >> 2] + B64A[((a & 3) << 4) | ((b || 0) >> 4)];
    if(b === undefined) break;
    s += B64A[((b & 15) << 2) | ((c || 0) >> 6)];
    if(c === undefined) break;
    s += B64A[c & 63];
  }
  return s;
}
function unb64u(str){
  const n = str.length, out = new Uint8Array(Math.floor(n * 3 / 4));
  let p = 0, buf = 0, bits = 0;
  for(let i=0; i<n; i++){
    const v = B64A.indexOf(str[i]);
    if(v < 0) throw 0;
    buf = (buf << 6) | v; bits += 6;
    if(bits >= 8){ bits -= 8; out[p++] = (buf >> bits) & 255; }
  }
  return out.subarray(0, p);
}

/* on ne transporte que ce qui n'est pas reconstructible : ni id ni points */
const packList = () => ({
  t: R.nom, p: R.cap,
  d: R.detach,
  u: R.units.map(ru => ({ n: ru.name, s: ru.size, l: ru.lo, c: ru.chars, x: ru.sel ? 1 : 0,
    g: ru.grp || "", e: ru.enh || "" }))
});

async function encodeList(){
  const bytes = new TextEncoder().encode(JSON.stringify(packList()));
  if(self.CompressionStream){
    try{
      const buf = await new Response(new Blob([bytes]).stream()
        .pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
      return "1" + b64u(new Uint8Array(buf));
    }catch(e){}
  }
  return "0" + b64u(bytes);
}
async function decodeList(code){
  const raw = unb64u(code.slice(1));
  let bytes;
  if(code[0] === "1"){
    const buf = await new Response(new Blob([raw]).stream()
      .pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
    bytes = new Uint8Array(buf);
  } else if(code[0] === "0"){ bytes = raw; }
  else throw 0;
  return JSON.parse(new TextDecoder().decode(bytes));
}

/* une liste recue arrive a cote des tiennes, elle n'en ecrase aucune */
function applyPacked(o){
  if(!o || !Array.isArray(o.u)) throw 0;
  const L = listeVierge(o.t || "Liste reçue", o.p || 2000);
  L.detach = Array.isArray(o.d) ? o.d : [];
  L.units = o.u.map(u => ({
    id: L.nextId++, name: u.n, size: u.s, lo: u.l || [], chars: u.c || [], sel: u.x !== 0,
    grp: u.g || nomGroupe(), enh: u.e || null
  }));
  LISTS.push(L); ouvre(L);
  saveR(); renderList();
}

async function shareLink(){
  /* depuis un fichier ouvert en local, le lien porte un chemin file:// qui
     ne veut rien dire sur une autre machine : on renvoie vers l'export */
  if(location.protocol === "file:"){
    alert("Cette copie est ouverte depuis un fichier local : un lien de partage n'y " +
      "serait valable que sur cet ordinateur.\n\nUtilise « Exporter / importer la liste » " +
      "pour passer ta liste d'un appareil à l'autre.");
    return;
  }
  if(!R.units.length){ alert("Ta liste est vide — ajoute au moins une unité avant de la partager."); return; }
  let url;
  try{ url = location.href.replace(/#.*$/, "") + "#l=" + await encodeList(); }
  catch(e){ alert("Impossible de fabriquer le lien de partage."); return; }
  if(navigator.share){
    try{ await navigator.share({ title: "Ma liste Nécrons", url: url }); return; }
    catch(e){ if(e && e.name === "AbortError") return; }
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    try{
      await navigator.clipboard.writeText(url);
      alert("Lien copié. Ouvre-le sur l'autre appareil pour y charger la liste.");
      return;
    }catch(e){}
  }
  prompt("Copie ce lien pour ouvrir la liste sur un autre appareil :", url);
}

async function readSharedLink(){
  const m = /[#&]l=([A-Za-z0-9\-_]+)/.exec(location.hash || "");
  if(!m) return;
  try{
    const o = await decodeList(m[1]);
    const n = (o.u || []).length;
    if(confirm("Ce lien contient « " + (o.t || "une liste") + " », " + n + " unité" +
      (n>1?"s":"") + ". L'ajouter à tes listes ? Les tiennes ne sont pas touchées."))
      applyPacked(o);
  }catch(e){ alert("Ce lien de partage est illisible — ta liste n'a pas été modifiée."); }
  /* on nettoie l'URL pour ne pas reproposer l'import a chaque rechargement */
  try{ history.replaceState(null, "", location.href.replace(/#.*$/, "")); }catch(e){}
}

/* ==========================================================
   INIT
   ========================================================== */
/* pourquoi ce detachement est indisponible, "" s'il l'est */
function detachBloque(d){
  if(R.detach.indexOf(d[0]) >= 0) return "déjà pris";
  const reste = capDP() - totalDP();
  if(d[1] > reste) return reste > 0
    ? "coûte " + d[1] + " PD, il n'en reste que " + reste
    : "plus de Points de Détachement";
  if(d[2] && R.detach.some(n => { const a = detachRow(n); return a && a[2] === d[2]; }))
    return "tag " + d[2] + " déjà utilisé";
  return "";
}

function initDetachSheet(){
  const host = el("dList"); host.innerHTML = "";
  const reste = capDP() - totalDP();
  const tete = document.createElement("div");
  tete.className = "sheet-sep";
  tete.textContent = reste > 0
    ? reste + " Point" + (reste > 1 ? "s" : "") + " de Détachement disponible" + (reste > 1 ? "s" : "")
    : "Budget de Points de Détachement épuisé";
  host.appendChild(tete);

  let dispo = 0;
  DETACHMENTS.forEach(d=>{
    const raison = detachBloque(d), pris = R.detach.indexOf(d[0]) >= 0;
    if(!raison) dispo++;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (pris ? " sel" : "") + (raison ? " opt-off" : "");
    if(raison) b.disabled = true;
    b.innerHTML = '<span class="oi"><span class="o1">' + d[0] + '</span>' +
      '<span class="o2">' + d[1] + ' PD · ' + d[3] + (d[2] ? ' · tag ' + d[2] : '') +
      (raison ? ' — ' + raison : '') + '</span></span>' +
      (d[5] ? '<span class="otag">DÉS</span>' : '');
    if(!raison) b.addEventListener("click", ()=>{
      R.detach.push(d[0]);
      closeSheet("sheetDetach"); saveR(); renderList();
    });
    host.appendChild(b);
  });
  if(!dispo){
    const m = document.createElement("div");
    m.className = "sheet-empty";
    m.textContent = reste > 0
      ? "Aucun détachement compatible avec ceux déjà pris."
      : "Retire un détachement pour en prendre un autre.";
    host.appendChild(m);
  }
}

/* ==========================================================
   NAVIGATION
   Trois axes : les listes, le simulateur, l'aide de jeu.
   L'axe des listes s'ouvre sur leur index ; on entre dans
   l'editeur en touchant une liste, on en ressort par la barre
   de retour.
   ========================================================== */
function vaVers(id){
  el("tabs").querySelectorAll("button").forEach(x=>x.classList.toggle("on", x.dataset.s === id));
  document.querySelectorAll(".screen").forEach(sc=>sc.classList.toggle("on", sc.id === id));
  window.scrollTo(0,0);
  el("headSum").style.display = (id === "scSim" && el("subAtk").classList.contains("on")) ? "" : "none";
  if(id === "scList") renderList();
  if(id === "scPlay") renderPlay();
}
el("tabs").querySelectorAll("button").forEach(b=>
  b.addEventListener("click", ()=> vaVers(b.dataset.s)));

/* sous-onglets du simulateur */
el("simTabs").querySelectorAll("button").forEach(b=>{
  b.addEventListener("click", ()=>{
    el("simTabs").querySelectorAll("button").forEach(x=>x.classList.toggle("on", x===b));
    document.querySelectorAll("#scSim .sub").forEach(v=>v.classList.toggle("on", v.id === b.dataset.v));
    window.scrollTo(0,0);
    el("headSum").style.display = (b.dataset.v === "subAtk") ? "" : "none";
    if(b.dataset.v === "subFire"){ syncTarget(); renderFireList(); }
    if(b.dataset.v === "subCmp"){ syncTarget(); renderCmpList(); }
    if(b.dataset.v === "subDef") renderDef();
  });
});

/* index <-> editeur */
function ouvreEditeur(id){
  if(id) ouvreListe(id);
  el("listIndex").hidden = true;
  el("listEditor").hidden = false;
  fermePanneau();
}
function fermeEditeur(){
  el("listEditor").hidden = true;
  el("listIndex").hidden = false;
  renderIndex(); window.scrollTo(0,0);
}
el("btnBackIndex").addEventListener("click", fermeEditeur);
el("btnBackPad").addEventListener("click", fermePanneau);
el("btnNewList2").addEventListener("click", ()=>{ nouvelleListe(); ouvreEditeur(); });
function syncTarget(){
  el("ptName3").textContent = SIM.tgtName;
  el("ptSub3").textContent = "E" + S.tough + " · Svg " + S.sv + "+" + (S.inv ? " / " + S.inv + "++" : "") +
    " · " + S.wounds + " PV × " + S.models;
  el("ptName2").textContent = SIM.tgtName;
  el("ptSub2").textContent = "E" + S.tough + " · Svg " + S.sv + "+" + (S.inv ? " / " + S.inv + "++" : "") +
    " · " + S.wounds + " PV × " + S.models + (S.fnp ? " · FNP " + S.fnp + "+" : "") +
    (S.dmgRed ? " · -" + S.dmgRed + " dégât" : "");
}
el("pickTarget2").addEventListener("click", ()=> el("pickTarget").click());
el("btnAddUnit").addEventListener("click", openUnitPick);
el("btnAddDetach").addEventListener("click", ()=>{ initDetachSheet(); openSheet("sheetDetach"); });
el("btnExport").addEventListener("click", exportImport);
if(el("listName")) el("listName").addEventListener("change", ()=>{
  R.nom = el("listName").value.trim() || "Liste"; saveR(); renderList();
});
if(el("listCap")) el("listCap").addEventListener("change", ()=>{
  const v = parseInt(el("listCap").value, 10);
  R.cap = (isFinite(v) && v >= 100) ? Math.min(10000, v) : 2000;
  saveR(); renderList();
});
if(el("defN")) el("defN").addEventListener("change", ()=>{
  const v = parseInt(el("defN").value, 10);
  defTireurs = (isFinite(v) && v > 0) ? Math.min(60, v) : 10;
  el("defN").value = defTireurs;
  renderDef();
});
if(el("armMode")) el("armMode").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    armMode = b.dataset.m;
    el("armMode").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    renderArms();
  }));
el("btnShare").addEventListener("click", shareLink);
el("uSearch").addEventListener("input", ()=>{ if(window.__rosterPick && pickMode) renderPick(); });
el("phaseChips").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    phase = b.dataset.p;
    el("phaseChips").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    renderFireList();
  }));
document.querySelectorAll('[data-close="sheetUnit"]').forEach(b=>
  b.addEventListener("click", ()=>{ pickMode = null; }));

/* le simulateur possede sa propre liste d'unites : on remet son mode
   quand l'utilisateur rouvre la feuille depuis l'onglet Simulateur */
const origPick = el("pickUnit");
origPick.addEventListener("click", ()=>{ pickMode = null; window.__rosterPick = false; }, true);

/* la cible change dans l'onglet Simulateur -> repercuter ici */
const obs = new MutationObserver(()=>{
  if(el("subFire").classList.contains("on")){ syncTarget(); renderFireList(); }
  if(el("subCmp").classList.contains("on")){ syncTarget(); renderCmpList(); }
});
obs.observe(el("ptSub"), {childList:true, characterData:true, subtree:true});

// insere la barre de points sous l'en-tete
const bar = document.createElement("div");
bar.className = "ptsbar"; bar.id = "ptsbar";
el("listEditor").insertBefore(bar, el("listEditor").children[1] || null);

el("btnCmpRoster").addEventListener("click", ()=> openCmpPick("roster"));
el("btnCmpCat").addEventListener("click", ()=> openCmpPick("cat"));
el("cmpLed").addEventListener("change", renderCmpList);
el("pickTarget3").addEventListener("click", ()=> el("pickTarget").click());
el("cmpPhase").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    cmpPhaseV = b.dataset.p;
    el("cmpPhase").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    renderCmpList();
  }));

loadR(); loadCmp();
PANNEAUX.forEach(p => { const c = el(p); if(c) c.hidden = true; });
initDetachSheet();
renderList();
renderIndex();
renderCmpList();
syncTarget();
readSharedLink();
/* coller un lien dans un onglet deja ouvert ne recharge pas la page :
   le navigateur ne fait qu'un saut d'ancre, il faut l'ecouter */
window.addEventListener("hashchange", readSharedLink);
})();
