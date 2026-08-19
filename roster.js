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
  nom: nom || "Nouvelle liste", cap: cap || 2000, detach: [], fd: "", units: [], nextId: 1
});

function saveR(){
  if(R){ R.nextId = nextId; }
  try{ localStorage.setItem(LKEY, JSON.stringify({ v:1, actif: R ? R.id : null, listes: LISTS })); }catch(e){}
}

/* remet une liste d'aplomb : champs manquants des versions precedentes */
/* le pack de faction nomme en francais des optimisations que le
   catalogue nommait en anglais : les listes deja enregistrees
   retrouvent la leur */
function migreEnh(nom){
  if(!nom) return nom;
  if(typeof ENH_ANCIENS !== "undefined" && ENH_ANCIENS[nom]) return ENH_ANCIENS[nom];
  return nom;
}

/* unites d'une liste enregistree qui n'existent plus dans la table :
   on les retire, mais on le dit — une unite qui disparait en silence
   fausse le total sans prevenir */
let RETIREES = [];
let MIGRE = false;

function normaliseListe(L){
  L.detach = L.detach || []; L.units = L.units || [];
  L.cap = L.cap || 2000; L.nom = L.nom || "Liste"; L.nextId = L.nextId || 1;
  if(!L.id) L.id = listeVierge().id;
  L.units = L.units.filter(ru => {
    if(unitRow(ru.name)) return true;
    RETIREES.push(ru.name);
    return false;
  });
  L.units.forEach(ru => {
    ru.chars = (ru.chars || []).filter(c => {
      if(unitRow(c.name)) return true;
      RETIREES.push(c.name);
      return false;
    });
  });
  L.units.forEach(ru => {
    ru.chars = ru.chars || []; ru.lo = ru.lo || [];
    if(ru.sel === undefined) ru.sel = true;
    if(!ru.grp) ru.grp = nomGroupe();
    if(ru.enh === undefined) ru.enh = null;
    ru.enh = migreEnh(ru.enh);
    /* les armes portees d'office ne se repartissent plus : on retire les
       lignes qui leur etaient allouees et on rend leur place aux autres,
       sans quoi une arme de melee mangeait des figurines a l'armement */
    const wl0 = unitWeps(ru.name);
    if(wl0.length){
      ru.lo = ru.lo.filter(l => wl0[l.w] && !armeDOffice(wl0[l.w]));
      const choix0 = wl0.map((w, i) => ({w:w, i:i})).filter(x => !armeDOffice(x.w));
      if(choix0.length){
        const manque = ru.size - ru.lo.reduce((a, l) => a + l.n, 0);
        if(manque > 0){
          if(ru.lo.length) ru.lo[0].n += manque;
          else ru.lo.push({ w: choix0[0].i, n: ru.size });
          MIGRE = true;
        }
      } else if(ru.lo.length){
        ru.lo = [];
        MIGRE = true;
      }
    }
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
  if(!localStorage.getItem(LKEY) || MIGRE){ saveR(); MIGRE = false; }
  if(RETIREES.length){
    const uniques = RETIREES.filter((x,i) => RETIREES.indexOf(x) === i);
    saveR();
    setTimeout(()=> toast(
      uniques.join(", ") + (uniques.length > 1 ? " ne sont plus dans la table" : " n'est plus dans la table") +
      " : retiré" + (uniques.length > 1 ? "s" : "") + " de tes listes.", "", null), 900);
    RETIREES = [];
  }
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

/* Comment une arme est portee. Le catalogue distingue l'arme rattachee
   au modele — toutes les figurines l'ont, elle ne se choisit pas — de
   l'arme prise dans un groupe d'options. Sans information, on suppose
   qu'elle est portee d'office : c'est le cas de tous les armements de
   vehicule et de personnage. */
const armeDOffice = w => !w || w[10] !== 0;
const aDesChoix = nom => unitWeps(nom).some(w => !armeDOffice(w));

/* combien de figurines portent chaque arme, par indice : une arme
   d'office est portee par toute l'unite, une arme au choix par ce que
   la repartition lui donne */
function portParArme(ru){
  const wl = unitWeps(ru.name), out = {};
  wl.forEach((w, i) => { if(armeDOffice(w)) out[i] = ru.size; });
  (ru.lo || []).forEach(l => {
    if(l.n > 0 && wl[l.w] && !armeDOffice(wl[l.w])) out[l.w] = (out[l.w] || 0) + l.n;
  });
  return out;
}
/* la meme chose ramenee au groupe d'arme : un baton de lumiere qui donne
   un tir et une frappe ne compte qu'une fois */
function portParGroupe(ru){
  const par = portParArme(ru), out = {};
  Object.keys(par).forEach(i => {
    const g = groupeDe(ru.name, +i);
    if(g) out[g.base] = Math.max(out[g.base] || 0, par[i]);
  });
  return out;
}
/* total reparti sur les seules armes au choix */
const totalChoix = ru => (ru.lo || []).reduce((a, l) => a + l.n, 0);

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
/* nom francais officiel du detachement, le nom du catalogue sinon */
const nomDetach = n => { const d = detachRow(n); return (d && d[7]) || n; };
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
/* ameliorations : deux a 1000 points, quatre a 2000, au prorata ailleurs */
const capEnhancements = () => Math.max(1, Math.round((R.cap || 2000) / 500));

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
    const tot = totalChoix(ru);
    if(!aDesChoix(ru.name)){ /* rien a repartir : toutes ses armes sont d'office */ }
    else if(tot > ru.size)
      w.push("<b>" + nom + "</b> : " + tot + " armes réparties pour " + ru.size + " figurines.");
    else if(tot < ru.size)
      w.push("<b>" + nom + "</b> : " + (ru.size - tot) + " figurine" + (ru.size - tot > 1 ? "s" : "") +
        " sans arme sur " + ru.size + ".");
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
  const capEnh = capEnhancements();
  if(enhs.length > capEnh) w.push("<b>" + enhs.length + " améliorations</b> : " + capEnh +
    " au maximum à " + cap + " pts.");
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
  const port = portParArme(ru);
  Object.keys(port).forEach(k=>{
    const i = +k, w = list[i], n = port[i];
    if(!w || w[2] !== phase || n <= 0) return;
    matched++;
    const p = weaponProfile(ru.name, w, n, ru);
    p.label = w[1] + " ×" + n;
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
const PANNEAUX = ["cardSettings", "cardDetach", "cardUnits", "cardStrat", "cardArms", "cardPartage"];
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
  /* une escouade a moitie equipee est la faute la plus courante :
     elle merite le meme signal que les autres */
  if(aDesChoix(ru.name) && totalChoix(ru) !== ru.size) return true;
  return false;
}

let modeRange = false;

function renderPad(){
  const gu = el("padUnits"), gt = el("padTools");
  if(!gu || !gt) return;

  const pad = el("pad");
  if(pad) pad.classList.toggle("range", modeRange);
  const cpt = el("padCount");
  if(cpt) cpt.textContent = modeRange
    ? "Ordre de la liste — il commande le tir cumulé"
    : R.units.length + " unité" + (R.units.length > 1 ? "s" : "");
  const br = el("btnReorder");
  if(br){
    br.textContent = modeRange ? "Terminé" : "Réorganiser";
    br.classList.toggle("on", modeRange);
    br.disabled = R.units.length < 2;
  }

  gu.innerHTML = "";
  R.units.forEach((ru, iu)=>{
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
    if(modeRange){
      const mv = document.createElement("span");
      mv.className = "tmove";
      const fl = (txt, delta, off) => {
        const x = document.createElement("button");
        x.type = "button"; x.textContent = txt; x.disabled = off;
        x.setAttribute("aria-label", delta < 0 ? "Avancer" : "Reculer");
        x.addEventListener("click", e=>{
          e.stopPropagation();
          const j = iu + delta;
          if(j < 0 || j >= R.units.length) return;
          R.units.splice(j, 0, R.units.splice(iu, 1)[0]);
          saveR(); renderList();
        });
        return x;
      };
      mv.appendChild(fl("◀", -1, iu === 0));
      mv.appendChild(fl("▶", 1, iu === R.units.length - 1));
      b.appendChild(mv);
    } else {
      appuiLong(b, ()=> ouvreActionsUnite(ru));
      b.addEventListener("click", ()=> ouvrePanneau("cardUnits", ru.id));
    }
    gu.appendChild(b);
  });
  const hint = el("padHint");
  if(hint) hint.hidden = modeRange || !R.units.length;
  if(modeRange){ gt.innerHTML = ""; return; }
  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "tile add";
  plus.hidden = modeRange;
  plus.innerHTML = "+<br>Unité";
  plus.addEventListener("click", openUnitPick);
  gu.appendChild(plus);

  const dp = totalDP(), dpMax = capDP();
  const outils = [
    ["cardDetach",   "◈", "Détachements", dp + " / " + dpMax + " PD"],
    ["cardStrat",    "⚡", "Stratagèmes",  stratsListe().length + " fiches"],
    ["cardArms",     "⌖", "Armement",     WEAPONS.length ? R.units.length + " unité" + (R.units.length > 1 ? "s" : "") : ""],
    ["cardPartage",  "⇪", "Partager",     R.units.length ? "texte, QR, fichier" : "liste vide"],
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
  unitOuverte = null; modeRange = false;
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

/* appui long (ou clic droit) sur une case du pave : dupliquer, consulter
   ou retirer sans avoir a ouvrir l'unite */
function ouvreActionsUnite(ru){
  el("listActTitle").textContent = nomAffiche(ru);
  const host = el("listActList");
  host.innerHTML = "";
  const item = (titre, sous, action, danger) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "opt";
    b.innerHTML = '<span class="oi"><span class="o1"' + (danger ? ' style="color:var(--warn)"' : '') +
      '>' + titre + '</span><span class="o2">' + sous + '</span></span>';
    b.addEventListener("click", ()=>{ closeSheet("sheetListAct"); action(); });
    host.appendChild(b);
  };
  item("Régler", "Effectif, armement, personnages", ()=> ouvrePanneau("cardUnits", ru.id));
  item("Fiche", "Profil, armes et aptitudes de " + ru.name, ()=> ouvreFiche(ru.name));
  item("Dupliquer", "Une seconde, armement et rattachements compris", ()=>{
    const copie = JSON.parse(JSON.stringify(ru));
    copie.id = nextId++;
    if(estGroupe(copie)) copie.grp = nomGroupe();
    R.units.splice(R.units.indexOf(ru) + 1, 0, copie);
    saveR(); renderList();
    toast(ru.name + " dupliqué.", "", null);
  });
  item("Retirer", pointsUnite(ru) + " pts rendus au budget", ()=> retireUnite(ru), true);
  openSheet("sheetListAct");
}

/* pose l'appui long sur un element : 480 ms suffisent a distinguer
   l'intention d'un simple toucher, et le clic droit fait pareil */
function appuiLong(elem, action){
  let t = null, bouge = false;
  const stop = ()=>{ clearTimeout(t); t = null; };
  elem.addEventListener("pointerdown", e=>{
    if(e.button && e.button !== 0) return;
    bouge = false;
    t = setTimeout(()=>{ t = null; if(!bouge){ elem.dataset.longp = "1"; action(); } }, 480);
  });
  elem.addEventListener("pointermove", ()=>{ bouge = true; stop(); });
  ["pointerup","pointercancel","pointerleave"].forEach(n => elem.addEventListener(n, stop));
  elem.addEventListener("contextmenu", e=>{ e.preventDefault(); action(); });
  elem.addEventListener("click", e=>{
    if(elem.dataset.longp){ delete elem.dataset.longp; e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
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
      '<span class="det">' + (L.detach.map(nomDetach).join(" · ") || "aucun détachement") + '</span></span>' +
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
/* ==========================================================
   SUIVI DE PARTIE
   Le tour, la phase, les points de commandement, ce qu'il
   reste de chaque unite et le score. Tout est enregistre :
   fermer l'application au milieu d'une partie ne perd rien.
   ========================================================== */
const GKEY = "mathhammer.partie.v1";
const PHASES = [["cmd","Cmdt"],["mvt","Mvt"],["tir","Tir"],["chg","Charge"],["cbt","Combat"]];
const PHASE_LONG = {cmd:"Commandement", mvt:"Mouvement", tir:"Tir", chg:"Charge", cbt:"Combat"};
const RAPPELS = {
  cmd: "Gagne 1 PC. Étape d'Ébranlement : jet pour les unités sous la moitié de leur effectif. Fin de phase, Protocoles de Réanimation : chaque unité amie qui a l'aptitude et se trouve sur le champ de bataille soigne D3 points de vie.",
  mvt: "Mouvement normal, Avance (+D6, plus de tir sauf armes d'Assaut), ou Rester Immobile (+1 pour toucher aux armes Lourdes). Étape des Renforts : Frappe en Profondeur à plus de 9\" de tout ennemi.",
  tir: "Une unité au contact ne tire qu'avec ses Pistolets. Rapid Fire double dans la moitié de la portée, Melta ajoute ses dégâts. Vérifie la portée avant de désigner la cible : la colonne Po est sur chaque fiche.",
  chg: "2D6, il faut atteindre le contact. Une unité qui a Avancé ou Est Restée Immobile ne charge pas. Surveillance : ton adversaire peut dépenser 1 PC pour tirer.",
  cbt: "Les unités qui ont chargé frappent en premier, puis alternance en commençant par le joueur dont c'est le tour. Une figurine doit être au contact ou à 2\" d'une figurine de son unité qui l'est."
};
let G = null;

const partieVierge = () => ({ liste: R ? R.id : "", tour: 1, phase: "cmd", pc: 0,
  prim: 0, sec: 0, u: {}, journal: [] });

function saveG(){ try{ localStorage.setItem(GKEY, JSON.stringify(G)); }catch(e){} }
function loadG(){
  try{ G = JSON.parse(localStorage.getItem(GKEY) || "null"); }catch(e){ G = null; }
  if(!G || !G.u) G = partieVierge();
  /* la partie suit la liste ouverte : en changer repart de zero */
  if(R && G.liste !== R.id) G = partieVierge();
}

const pvMax = ru => { const u = unitRow(ru.name); return u ? ru.size * u[5] : 0; };
const pvMaxChar = nom => { const u = unitRow(nom); return u ? u[5] : 0; };

/* etat d'une unite, cree a la demande pour suivre les ajouts de liste */
function etat(ru){
  let e = G.u[ru.id];
  if(!e){ e = G.u[ru.id] = { pv: pvMax(ru), c: ru.chars.map(c => pvMaxChar(c.name)) }; }
  if(e.c.length !== ru.chars.length) e.c = ru.chars.map((c,i) => e.c[i] !== undefined ? e.c[i] : pvMaxChar(c.name));
  return e;
}

function noteJournal(txt){
  G.journal.unshift({ t: G.tour, p: G.phase, x: txt });
  if(G.journal.length > 60) G.journal.length = 60;
}

const d3 = () => 1 + Math.floor(Math.random() * 3);

function renderPartie(){
  if(!G) loadG();
  /* changer de liste, c'est changer de partie */
  if(R && G.liste !== R.id){ G = partieVierge(); saveG(); }
  const bar = el("gbar"); if(!bar) return;
  if(!R){ bar.innerHTML = ""; return; }

  const vivantes = R.units.filter(ru => etat(ru).pv > 0).length;
  bar.innerHTML =
    '<div class="gc"><div class="gk">Tour</div><div class="gv">' + G.tour + '<small style="font-size:11px;color:var(--tx3)"> / 5</small></div></div>' +
    '<div class="gc"><div class="gk">Phase</div><div class="gv" style="font-size:13px;padding:4px 0 2px">' + PHASE_LONG[G.phase] + '</div></div>' +
    '<div class="gc"><div class="gk">PC</div><div class="gv">' + G.pc + '</div>' +
      '<div class="gpm"><button type="button" data-pc="-1">−</button><button type="button" data-pc="1">+</button></div></div>' +
    '<div class="gc"><div class="gk">Debout</div><div class="gv">' + vivantes + '<small style="font-size:11px;color:var(--tx3)"> / ' + R.units.length + '</small></div></div>';
  bar.querySelectorAll("[data-pc]").forEach(b => b.addEventListener("click", ()=>{
    G.pc = Math.max(0, G.pc + parseInt(b.dataset.pc, 10));
    saveG(); renderPartie();
  }));

  const ph = el("gphases");
  ph.innerHTML = "";
  PHASES.forEach(([k, lbl])=>{
    const b = document.createElement("button");
    b.type = "button"; b.textContent = lbl;
    b.className = k === G.phase ? "on" : "";
    b.addEventListener("click", ()=>{
      /* revenir au commandement, c'est le tour suivant : un PC de plus */
      if(k === "cmd" && G.phase !== "cmd"){
        G.tour = Math.min(9, G.tour + 1); G.pc++;
        noteJournal("Tour " + G.tour + " — +1 PC (total " + G.pc + ")");
      }
      G.phase = k; saveG(); renderPartie();
    });
    ph.appendChild(b);
  });

  const rap = el("grappel");
  rap.innerHTML = "<b>" + PHASE_LONG[G.phase] + "</b>" + RAPPELS[G.phase];

  /* --- etat des unites --- */
  const host = el("gunits"); host.innerHTML = "";
  if(!R.units.length){ host.innerHTML = '<div class="empty">La liste ouverte est vide.</div>'; }
  R.units.forEach(ru=>{
    const u = unitRow(ru.name); if(!u) return;
    const e = etat(ru), max = pvMax(ru);
    const figs = u[5] > 0 ? Math.ceil(e.pv / u[5]) : 0;
    const row = document.createElement("div");
    row.className = "grow" + (e.pv <= 0 ? " mort" : "");
    const gn = document.createElement("div");
    gn.className = "gn";
    gn.innerHTML = '<b>' + nomAffiche(ru) + '</b><i>' + (e.pv > 0
      ? figs + " figurine" + (figs > 1 ? "s" : "") + " sur " + ru.size
      : "détruite") + '</i>';
    gn.querySelector("b").addEventListener("click", ()=> ouvreFiche(ru.name));
    const pv = document.createElement("span");
    pv.className = "gpv" + (e.pv <= max / 2 ? " bas" : "");
    pv.textContent = e.pv + "/" + max;
    const gb = document.createElement("div");
    gb.className = "gb";
    const bt = (txt, delta) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = txt;
      b.addEventListener("click", ()=>{
        if(delta === null){ e.pv = max; e.c = ru.chars.map(c => pvMaxChar(c.name)); }
        else e.pv = Math.max(0, Math.min(max, e.pv + delta));
        if(e.pv === 0) noteJournal(nomAffiche(ru) + " détruite");
        saveG(); renderPartie();
      });
      return b;
    };
    gb.appendChild(bt("−5", -5)); gb.appendChild(bt("−1", -1));
    gb.appendChild(bt("+1", 1)); gb.appendChild(bt("⟲", null));
    row.appendChild(gn); row.appendChild(pv); row.appendChild(gb);
    host.appendChild(row);

    ru.chars.forEach((c, i)=>{
      const cu = unitRow(c.name); if(!cu) return;
      const cmax = pvMaxChar(c.name);
      const sr = document.createElement("div");
      sr.className = "grow gsub" + (e.c[i] <= 0 ? " mort" : "");
      const n2 = document.createElement("div");
      n2.className = "gn";
      n2.innerHTML = '<b style="color:var(--cyan)">' + c.name + '</b><i>' +
        (e.c[i] > 0 ? (roleDe(c.name) || "personnage") : "détruit") + '</i>';
      n2.querySelector("b").addEventListener("click", ()=> ouvreFiche(c.name));
      const p2 = document.createElement("span");
      p2.className = "gpv" + (e.c[i] <= cmax / 2 ? " bas" : "");
      p2.textContent = e.c[i] + "/" + cmax;
      const b2 = document.createElement("div");
      b2.className = "gb";
      [["−1",-1],["+1",1],["⟲",null]].forEach(([t,d])=>{
        const b = document.createElement("button");
        b.type = "button"; b.textContent = t;
        b.addEventListener("click", ()=>{
          e.c[i] = d === null ? cmax : Math.max(0, Math.min(cmax, e.c[i] + d));
          if(e.c[i] === 0) noteJournal(c.name + " détruit");
          saveG(); renderPartie();
        });
        b2.appendChild(b);
      });
      sr.appendChild(n2); sr.appendChild(p2); sr.appendChild(b2);
      host.appendChild(sr);
    });
  });

  /* --- score --- */
  const sc = el("gscore"); sc.innerHTML = "";
  const ligne = (lbl, clef, pas) => {
    const r = document.createElement("div");
    r.className = "srow";
    const t = document.createElement("span"); t.textContent = lbl;
    const moins = document.createElement("button"); moins.type = "button"; moins.textContent = "−";
    const v = document.createElement("b"); v.textContent = G[clef];
    const plus = document.createElement("button"); plus.type = "button"; plus.textContent = "+";
    moins.addEventListener("click", ()=>{ G[clef] = Math.max(0, G[clef] - pas); saveG(); renderPartie(); });
    plus.addEventListener("click", ()=>{ G[clef] += pas; saveG(); renderPartie(); });
    r.appendChild(t); r.appendChild(moins); r.appendChild(v); r.appendChild(plus);
    sc.appendChild(r);
  };
  ligne("Primaire", "prim", 5);
  ligne("Secondaire", "sec", 1);
  const tot = document.createElement("div");
  tot.className = "srow";
  tot.innerHTML = '<span style="color:var(--glow);font-weight:700">Total</span><b style="color:var(--glow)">' +
    (G.prim + G.sec) + '</b>';
  sc.appendChild(tot);

  /* --- stratagemes jouables --- */
  const gs = el("gstrat"); gs.innerHTML = "";
  const lot = stratsListe();
  lot.forEach(st=>{
    const cout = st[3] || 1;
    const d = document.createElement("div");
    d.className = "grow";
    const n = document.createElement("div");
    n.className = "gn";
    const provenance = st[1] === "Core" ? "Stratagème de base"
      : nomDetach(st[1]) + (st[2] ? " · " + st[2] : "");
    n.innerHTML = '<b>' + st[0] + '</b><i>' + provenance + ' · ' + cout + ' PC</i>';
    const b = document.createElement("button");
    b.type = "button"; b.className = "gplay"; b.textContent = "Jouer";
    b.disabled = G.pc < cout;
    b.addEventListener("click", ()=>{
      G.pc -= cout;
      noteJournal(st[0] + " (−" + cout + " PC, reste " + G.pc + ")");
      saveG(); renderPartie();
    });
    d.appendChild(n); d.appendChild(b);
    gs.appendChild(d);
  });

  /* --- journal --- */
  const jr = el("gjournal");
  jr.innerHTML = G.journal.length
    ? G.journal.map(j => '<div class="je"><b>T' + j.t + ' · ' + (PHASE_LONG[j.p] || j.p) + '</b> — ' + j.x + '</div>').join("")
    : '<div class="empty" style="padding:12px 4px">Rien encore.</div>';
}

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
    const mv = u[1] ? 'M' + u[1] + '"' : 'M —';
    html += '<div class="pu"><b>' + ru.name + '</b><i>×' + ru.size + ' · ' + mv + ' · E' + u[2] +
      ' · Svg ' + u[3] + '+' + (u[4] ? '/' + u[4] + '++' : '') + ' · ' + u[5] + ' PV' +
      (sc ? ' · socle ' + sc + ' mm' : '') + '</i>';
    const portU = portParArme(ru), vusG = {};
    Object.keys(portU).forEach(k=>{
      const i = +k, n = portU[i];
      if(!n) return;
      const g = groupeDe(ru.name, i);
      if(g){ if(vusG[g.base]) return; vusG[g.base] = 1; }
      const profils = g ? g.profils : (wl[i] ? [{w:wl[i]}] : []);
      profils.forEach(p=>{ const w = p.w;
        html += '<span class="pw">×' + n + ' ' + w[1] + ' — ' + portee(w) + ' A' + w[3] + ' ' + w[4] +
          '+ F' + w[5] + ' PA' + (w[6] ? '-' + w[6] : '0') + ' D' + w[7] + '</span>'; });
    });
    html += '</div>';
    ru.chars.forEach(c=>{
      const cu = unitRow(c.name);
      if(!cu) return;
      const gc = groupeDe(c.name, c.w || 0);
      const cws = gc ? gc.profils.map(p => p.w) : [unitWeps(c.name)[c.w || 0]].filter(Boolean);
      html += '<div class="pu"><b style="color:var(--glow)">' + c.name + '</b><i>' +
        (roleDe(c.name) || '') + ' · E' + cu[2] + ' · ' + cu[5] + ' PV' +
        (socle(c.name) ? ' · socle ' + socle(c.name) + ' mm' : '') + '</i>' +
        cws.map(cw => '<span class="pw">' + cw[1] + ' — ' + portee(cw) + ' A' + cw[3] + ' ' + cw[4] +
          '+ F' + cw[5] + ' PA' + (cw[6] ? '-' + cw[6] : '0') + ' D' + cw[7] + '</span>').join('') + '</div>';
    });
    if(ru.enh){
      const e = enhRow(ru.enh);
      html += '<div class="pu"><b style="color:var(--cyan)">' + ru.enh + '</b><i>' +
        (e && typeof e[1] === "number" ? e[1] + ' pts' : 'coût inconnu') + '</i>' +
        (e && e[3] ? '<p class="fiche-note" style="margin:4px 0 0">' + e[3] + '</p>' : '') + '</div>';
    }
    const kws = motsClesGroupe(ru);
    if(kws.length) html += '<div class="pu"><div class="kwline" style="margin:0">' +
      kws.map(k => '<span class="gkw' + (k.source ? ' gkwadd' : '') + '">' + k.kw.toUpperCase() + '</span>').join("") +
      '</div></div>';
    g.innerHTML = html;
    /* en partie, on veut la regle sous les yeux : toucher l'unite ouvre sa fiche,
       toucher un personnage rattache ouvre la sienne */
    g.querySelectorAll(".pu").forEach((bloc, i) => {
      const cible = i === 0 ? ru.name : (ru.chars[i-1] ? ru.chars[i-1].name : null);
      if(!cible || !unitRow(cible)) return;
      bloc.classList.add("tap");
      bloc.addEventListener("click", ()=> ouvreFiche(cible));
    });
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
/* la Disposition de Force se choisit parmi celles du detachement retenu.
   Le catalogue ne les porte pas : on laisse la saisir, plutot que d'en
   inventer une liste. */
function renderDispo(){
  const z = el("listDispo"); if(!z) return;
  if(document.activeElement !== z) z.value = R.fd || "";
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
      '<div class="rhead"><div class="rn"><b>' + nomDetach(d[0]) + '</b><i>' + d[3] + ' · ' + d[1] + ' PD</i></div>' +
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

    const grp = groupesArmes(ru.name);

    /* Les armes d'office se listent sans compteur : toutes les figurines
       les ont. Seules les armes au choix se repartissent — cinq fusils
       gauss et cinq tesla sur dix Immortals — et le bandeau ne parle que
       de celles-la. */
    const wlU = wl;
    const dOffice = [];
    grp.forEach(g => { if(g.profils.every(pr => armeDOffice(pr.w))) dOffice.push(g); });
    dOffice.forEach(g=>{
      const row = document.createElement("div");
      row.className = "lo lo-fixe";
      const detail = g.profils.map(pr =>
        (pr.w[2] === "C" ? "càc" : "tir") + " A" + pr.w[3] + " F" + pr.w[5] +
        " PA" + (pr.w[6] ? "-" + pr.w[6] : "0") + " D" + pr.w[7]).join("  ·  ");
      row.innerHTML = '<span class="ln">' + g.libelle + ' <em>' + detail + '</em></span>' +
        '<span class="lofix">' + (ru.size > 1 ? "toutes les figurines" : "d'office") + '</span>';
      div.appendChild(row);
    });

    const choixPossible = aDesChoix(ru.name);
    const totArmes = () => totalChoix(ru);
    const reste = ru.size - totArmes();
    if(choixPossible){
      const rep = document.createElement("div");
      rep.className = "repart" + (reste === 0 ? " ok" : " todo");
      rep.innerHTML = '<b>' + totArmes() + ' / ' + ru.size + '</b> figurine' + (ru.size > 1 ? 's' : '') +
        ' au choix' +
        (reste > 0 ? ' · <span>' + reste + ' sans arme</span>'
                   : (reste < 0 ? ' · <span>' + (-reste) + ' de trop</span>' : ''));
      div.appendChild(rep);
    }

    ru.lo.forEach((l, li)=>{
      const w = wl[l.w]; if(!w) return;
      const g = groupeDe(ru.name, l.w);
      const row = document.createElement("div");
      row.className = "lo";
      /* l'arme porte parfois plusieurs profils : on les montre tous, c'est
         ce dont la figurine dispose une fois équipée */
      const detail = (g ? g.profils : [{w:w}]).map(p =>
        (p.w[2] === "C" ? "càc" : "tir") + " A" + p.w[3] + " F" + p.w[5] +
        " PA" + (p.w[6] ? "-" + p.w[6] : "0") + " D" + p.w[7]).join("  ·  ");
      row.innerHTML = '<span class="ln">' + (g ? g.libelle : w[1]) +
        ' <em>' + detail + '</em></span>';
      /* plafond : ce que porte déjà la ligne, plus ce qui reste sans arme */
      const plafond = () => Math.max(0, l.n + (ru.size - totArmes()));
      row.appendChild(stepper(()=>l.n, v=>{ l.n = Math.min(v, plafond()); }, 0, ru.size));
      const sw = document.createElement("button");
      sw.type="button"; sw.className="xbtn"; sw.textContent="⇄"; sw.title="Changer d'arme";
      sw.addEventListener("click", ()=> openWeaponPick(ru, li));
      const rm = document.createElement("button");
      rm.type="button"; rm.className="xbtn"; rm.textContent="×"; rm.title="Retirer cette arme";
      rm.addEventListener("click", ()=>{ ru.lo.splice(li,1); saveR(); renderList(); });
      row.appendChild(sw); row.appendChild(rm);
      div.appendChild(row);
    });

    ru.chars.forEach((c, ci)=>{
      const cl = unitWeps(c.name), gAct = groupeDe(c.name, c.w || 0);
      const w = gAct ? {1: gAct.libelle} : (cl[c.w] || cl[0]);
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
      nx.addEventListener("click", ()=>{
        const gs = groupesArmes(c.name);
        const iAct = gs.findIndex(g => g.profils.some(p => p.i === (c.w || 0)));
        c.w = gs[(iAct + 1 + gs.length) % gs.length].principal;
        saveR(); renderList();
      });
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
    /* une arme équipée met tous ses profils à disposition : le nombre de
       porteurs vaut donc pour chacun d'eux */
    const prisGrp = portParGroupe(ru);
    const lignes = [];
    grp.forEach(g => g.profils.forEach(p =>
      lignes.push({ w:p.w, i:p.i, n:prisGrp[g.base] || 0,
                    lbl: g.libelle, modes: g.profils.length > 1 })));
    const tir = lignes.filter(x => x.w[2] === "T"), cac = lignes.filter(x => x.w[2] === "C");
    const table = (titre, lot) => {
      if(!lot.length) return "";
      let h = '<div class="eqt">' + titre + '</div><div class="eqwrap"><table class="arms">' +
        '<thead><tr><th style="text-align:left">Arme</th><th>Po</th><th>A</th><th>CT</th><th>F</th><th>PA</th><th>D</th></tr></thead><tbody>';
      lot.forEach(x=>{
        const w = x.w, mots = w[8] ? motsArme(w[8]) : "";
        h += '<tr class="' + (x.n ? '' : 'off') + '"><td class="an">' +
          (x.n ? '<b class="q">×' + x.n + ' </b>' : '') + w[1] +
          (mots ? '<span class="n">' + mots + '</span>' : '') + '</td>' +
          '<td>' + portee(w) + '</td>' +
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
    bw.disabled = !aDesChoix(ru.name);
    if(bw.disabled) bw.title = "Toutes les armes de cette unité sont portées d'office.";
    bw.addEventListener("click", ()=> openWeaponPick(ru));
    const bc = document.createElement("button");
    bc.type="button"; bc.textContent="+ Personnage";
    bc.addEventListener("click", ()=> openCharPick(ru));
    const be = document.createElement("button");
    be.type="button"; be.textContent = ru.enh ? "⇄ Amélioration" : "+ Amélioration";
    be.addEventListener("click", ()=> openEnhPick(ru));
    add.appendChild(bw); add.appendChild(bc); add.appendChild(be);
    div.appendChild(add);

    /* dupliquer une fois l'unite reglee : c'est la qu'on veut la seconde,
       avec son armement et ses rattachements, pas une unite vierge */
    const pied = document.createElement("div");
    pied.className = "unitfoot";
    const fic = document.createElement("button");
    fic.type = "button"; fic.className = "btn";
    fic.textContent = "Fiche";
    fic.addEventListener("click", ()=> ouvreFiche(ru.name));
    const dup = document.createElement("button");
    dup.type = "button"; dup.className = "btn";
    dup.textContent = "Dupliquer";
    dup.addEventListener("click", ()=>{
      const copie = JSON.parse(JSON.stringify(ru));
      copie.id = nextId++;
      if(estGroupe(copie)) copie.grp = nomGroupe();
      R.units.splice(R.units.indexOf(ru) + 1, 0, copie);
      saveR(); ouvrePanneau("cardUnits", copie.id);
    });
    const del = document.createElement("button");
    del.type = "button"; del.className = "btn danger";
    del.textContent = "Retirer";
    /* plus de confirmation : le bandeau d'annulation la remplace, et il
       coute moins cher qu'une boite de dialogue a chaque retrait */
    del.addEventListener("click", ()=>{ retireUnite(ru); fermePanneau(); });
    pied.appendChild(fic); pied.appendChild(dup); pied.appendChild(del);
    div.appendChild(pied);
    host.appendChild(div);
  });
}
/* ==========================================================
   STRATAGEMES
   Ceux des detachements retenus, puis ceux de base. Le texte
   n'est renseigne que pour ce qui a pu etre verifie.
   ========================================================== */
/* ==========================================================
   STRATAGEMES SAISIS A LA MAIN
   Le texte officiel ne figure ni dans le catalogue BattleScribe
   ni dans le fichier de systeme, et la presse specialisee n'en
   donne que des paraphrases : hors de question de les inscrire
   ici. On offre donc de le saisir, en anglais, et de le garder.
   ========================================================== */
const SKEY = "mathhammer.strats.v1";
let SUSER = { fiches: {}, ajouts: [] };
function loadS(){
  try{
    const o = JSON.parse(localStorage.getItem(SKEY) || "null");
    if(o && o.fiches) SUSER = { fiches: o.fiches, ajouts: o.ajouts || [] };
  }catch(e){}
}
function saveS(){ try{ localStorage.setItem(SKEY, JSON.stringify(SUSER)); }catch(e){} }
const clefStrat = (det, nom) => det + "|" + nom;

/* la table de base, completee de ce qui a ete saisi */
function stratsDe(g){
  const lot = STRATS.filter(x => x[1] === g).map(x => x.slice());
  SUSER.ajouts.filter(a => a[1] === g).forEach(a => lot.push(a.slice()));
  return lot.map(x=>{
    const f = SUSER.fiches[clefStrat(x[1], x[0])];
    if(f){
      if(f.cp !== undefined && f.cp !== "") x[3] = parseInt(f.cp, 10) || 1;
      if(f.type) x[2] = f.type;
      x[4] = f.quand || x[4]; x[5] = f.cible || x[5]; x[6] = f.effet || x[6];
      x[7] = f.restric !== undefined ? f.restric : x[7];
      x.saisi = true;
    }
    return x;
  });
}
/* tous les stratagemes utilisables par la liste ouverte */
const stratsListe = () => R.detach.concat(["Core"]).reduce((a, g) => a.concat(stratsDe(g)), []);

function renderStrats(){
  const host = el("stratList"); if(!host) return;
  host.innerHTML = "";
  const groupes = R.detach.slice();
  groupes.push("Core");
  let rien = true;
  groupes.forEach(g=>{
    const lot = stratsDe(g);
    if(!lot.length) return;
    rien = false;
    const sep = document.createElement("div");
    sep.className = "stratsep";
    sep.textContent = g === "Core" ? "Stratagèmes de base" : nomDetach(g);
    host.appendChild(sep);
    lot.forEach(x=>{
      const [nom, det, type, cp, quand, cible, effet, restric] = x;
      const d = document.createElement("div");
      d.className = "strat";
      const t = document.createElement("button");
      t.type = "button";
      t.innerHTML = '<span class="sn"><b>' + nom + '</b><i>' +
        (det === "Core" ? "Stratagème de base"
          : (type ? "Stratagème de " + type + " · " + nomDetach(det) : nomDetach(det))) +
        (x.saisi ? ' <span class="smod">saisi</span>' : '') +
        '</i></span><span class="cp">' + cp + ' PC</span>';
      const body = document.createElement("div");
      body.className = "sbody";
      const rendu = ()=>{
        body.innerHTML = effet
          ? '<dl><dt>Quand</dt><dd>' + quand + '</dd><dt>Cible</dt><dd>' + (cible || "—") +
            '</dd><dt>Effet</dt><dd>' + effet + '</dd>' +
            (restric ? '<dt>Restrictions</dt><dd>' + restric + '</dd>' : '') + '</dl>'
          : '<p class="vide">Texte non renseigné. Recopie-le depuis ta fiche : il restera sur cet appareil.</p>';
        const b = document.createElement("button");
        b.type = "button"; b.className = "ghost";
        b.style.cssText = "margin:6px 11px 10px";
        b.textContent = effet ? "Corriger le texte" : "Saisir le texte";
        b.addEventListener("click", ()=> edite());
        body.appendChild(b);
      };
      const edite = ()=>{
        const f = SUSER.fiches[clefStrat(det, nom)] || {};
        body.innerHTML = "";
        const box = document.createElement("div");
        box.className = "sedit";
        box.innerHTML =
          '<label>Coût en PC</label><input type="number" min="0" max="9" value="' + cp + '" data-f="cp">' +
          '<label>Type</label><input type="text" value="' + (type && type !== "Core" ? type : "") +
            '" placeholder="Tactique de Bataille, Fait Épique…" data-f="type">' +
          '<label>Quand</label><textarea data-f="quand" placeholder="When…">' + (quand || "") + '</textarea>' +
          '<label>Cible</label><textarea data-f="cible" placeholder="Target…">' + (cible || "") + '</textarea>' +
          '<label>Effet</label><textarea data-f="effet" placeholder="Effet…">' + (effet || "") + '</textarea>' +
          '<label>Restrictions</label><textarea data-f="restric" placeholder="Restrictions…">' + (restric || "") + '</textarea>';
        const row = document.createElement("div");
        row.className = "addrow";
        const ok = document.createElement("button");
        ok.type = "button"; ok.textContent = "Enregistrer";
        ok.addEventListener("click", ()=>{
          const v = {};
          box.querySelectorAll("[data-f]").forEach(i => v[i.dataset.f] = i.value.trim());
          SUSER.fiches[clefStrat(det, nom)] = v;
          saveS(); renderStrats(); renderPartie();
          toast(nom + " enregistré.", "", null);
        });
        const non = document.createElement("button");
        non.type = "button"; non.textContent = "Annuler";
        non.addEventListener("click", rendu);
        row.appendChild(ok); row.appendChild(non);
        box.appendChild(row);
        body.appendChild(box);
      };
      rendu();
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
/* ==========================================================
   ARMES À PLUSIEURS PROFILS
   Un bâton de lumière donne un tir ET une frappe ; un rayon
   thermique donne deux modes de tir. Porter l'arme, c'est
   disposer de tous ses profils : le choix du mode se fait au
   moment d'attaquer, pas au moment de s'équiper.
   ========================================================== */
const baseArme = n => String(n).toLowerCase()
  .replace(/\s*\((tir|càc|cac|c'tan)\)\s*$/i, '')
  .replace(/\s*[×x]\s*\d+\s*$/i, '')
  .replace(/\s*[—-]\s*.+$/, '')
  .trim();

/* [{base, libelle, profils:[{w, i}], principal}] pour une unité */
function groupesArmes(nom){
  const wl = unitWeps(nom), vus = {}, out = [];
  wl.forEach((w, i)=>{
    const b = baseArme(w[1]);
    if(vus[b] === undefined){
      vus[b] = out.length;
      const lbl = w[1].replace(/\s*\((tir|càc|cac)\)\s*$/i, '')
                      .replace(/\s*[×x]\s*\d+\s*$/i, '')
                      .replace(/\s*[—-]\s*.+$/, '').trim();
      out.push({ base: b, libelle: lbl || w[1], profils: [], principal: i });
    }
    out[vus[b]].profils.push({ w: w, i: i });
  });
  return out;
}
/* le groupe auquel appartient un profil donné */
function groupeDe(nom, i){
  const g = groupesArmes(nom);
  return g.find(x => x.profils.some(p => p.i === i)) || null;
}

/* ==========================================================
   FICHE D'UNITE
   Le profil complet, armes portee comprise, aptitudes et
   mots-cles : ce qu'on consulte avant d'ajouter une unite et
   ce qu'on relit en partie.
   ========================================================== */
const portee = w => w[9] || (w[2] === "C" ? "càc" : "—");
const aptitudesDe = nom => (typeof APTITUDES !== "undefined" && APTITUDES[nom]) || [];
const transportDe = nom => (typeof TRANSPORTS !== "undefined" && TRANSPORTS[nom]) || "";

/* les mots-cles d'arme effectivement portes par l'unite, pour ne
   derouler que le glossaire qui la concerne */
function motsUtiles(nom){
  const out = [];
  unitWeps(nom).forEach(w => {
    motsArme(w[8]).split(" · ").forEach(m => {
      if(!m) return;
      const clef = m.replace(/\s+[\dD]+\+?$/, "");
      if(GLOSSAIRE[clef] && out.indexOf(clef) < 0) out.push(clef);
    });
  });
  return out;
}

function ouvreFiche(nom){
  const u = unitRow(nom); if(!u) return;
  el("ficheTitle").textContent = nom;
  const host = el("ficheBody");
  const esc = t => String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
  let h = "";

  const tailles = u[6], pmin = u[7][String(tailles[0])] || 0,
        pmax = u[7][String(tailles[tailles.length-1])] || 0;
  h += '<p class="fiche-note">' + categorie(nom) + '  ·  ×' + tailles.join(" / ") +
       '  ·  ' + (pmin === pmax ? pmin + " pts" : pmin + "–" + pmax + " pts") +
       (socle(nom) ? '  ·  socle ' + socle(nom) + ' mm' : '') + '</p>';

  const cel = (v, l) => '<div><b>' + v + '</b><i>' + l + '</i></div>';
  h += '<div class="fiche-prof">' +
    cel(u[1] ? u[1] + '"' : "—", "M") + cel(u[2], "E") +
    cel(u[3] + "+", "SVG") + cel(u[4] ? u[4] + "++" : "—", "INVU") +
    cel(u[5], "PV") + cel(u[13] || "—", "CD") + cel(u[12] || 0, "CO") + '</div>';

  const wl = unitWeps(nom);
  const table = (titre, lot) => {
    if(!lot.length) return "";
    let t = '<div class="fiche-sec">' + titre + '</div><div class="eqwrap"><table class="arms">' +
      '<thead><tr><th style="text-align:left">Arme</th><th>Po</th><th>A</th><th>CT</th>' +
      '<th>F</th><th>PA</th><th>D</th></tr></thead><tbody>';
    lot.forEach(w => {
      const mots = w[8] ? motsArme(w[8]) : "";
      t += '<tr><td class="an">' + esc(w[1]) +
        (mots ? '<span class="n">' + mots + '</span>' : '') + '</td>' +
        '<td>' + portee(w) + '</td><td>' + w[3] + '</td><td>' + w[4] + '+</td>' +
        '<td>' + w[5] + '</td><td>' + (w[6] ? "-" + w[6] : "0") + '</td><td>' + w[7] + '</td></tr>';
    });
    return t + '</tbody></table></div>';
  };
  h += table("Tir", wl.filter(w => w[2] === "T"));
  h += table("Corps à corps", wl.filter(w => w[2] === "C"));

  const apts = aptitudesDe(nom);
  if(apts.length){
    h += '<div class="fiche-sec">Aptitudes</div>';
    apts.forEach(a => h += '<div class="fiche-apt"><b>' + esc(a[0]) + '</b><p>' + esc(a[1]) + '</p></div>');
  }
  if(u[8]) h += '<div class="fiche-apt"><b>Feel No Pain ' + u[8] + '+</b><p>' +
    esc(GLOSSAIRE["Feel No Pain"] || "") + '</p></div>';

  const tr = transportDe(nom);
  if(tr) h += '<div class="fiche-sec">Transport</div><div class="fiche-apt"><p>' + esc(tr) + '</p></div>';

  if(typeof FACTION !== "undefined" && FACTION.length){
    h += '<div class="fiche-sec">Règle de faction</div>';
    FACTION.forEach(f => h += '<div class="fiche-apt"><b>' + esc(f[0]) + '</b><p>' + esc(f[1]) + '</p></div>');
  }

  const kws = [];
  Object.keys(KW).forEach(k => { if(has(k, nom)) kws.push(k); });
  if(u[9]) kws.unshift(u[9].toLowerCase());
  if(kws.length) h += '<div class="fiche-sec">Mots-clés</div><div class="fiche-kw">' +
    kws.map(k => '<span>' + esc(k) + '</span>').join("") + '</div>';

  const glo = motsUtiles(nom);
  if(glo.length){
    h += '<div class="fiche-sec">Mots-clés d\'arme</div>';
    glo.forEach(k => h += '<div class="fiche-glo"><b>' + esc(k) + '</b><p>' +
      esc(GLOSSAIRE[k]) + '</p></div>');
  }

  if(u[11]) h += '<div class="fiche-sec">Note</div><p class="fiche-note">' + esc(u[11]) + '</p>';

  host.innerHTML = h;
  host.scrollTop = 0;
  openSheet("sheetFiche");
}

function motsArme(flags){
  const f = parseFlags(flags), k = [];
  if(f.lethal)  k.push("Touches Fatales");
  if(f.dev)     k.push("Blessures Dévastatrices");
  if(f.torrent) k.push("Torrent");
  if(f.blast)   k.push("Déflagration");
  if(f.twin)    k.push("Jumelé");
  if(f.sust)    k.push("Touches Soutenues " + f.sust);
  if(f.rf)      k.push("Tir Rapide " + f.rf);
  if(f.melta)   k.push("Fusion " + f.melta);
  if(f.anti)    k.push("Anti-X " + f.anti + "+");
  if(f.assault) k.push("Assaut");
  if(f.heavy)   k.push("Lourd");
  if(f.precision) k.push("Précision");
  if(f.hazard)  k.push("À Risque");
  if(f.pistol)  k.push("Pistolet");
  if(f.indirect) k.push("Tir Indirect");
  if(f.ignorescover) k.push("Ignore le Couvert");
  if(f.extra)   k.push("Attaques Bonus");
  if(f.oneshot) k.push("Tir Unique");
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
    const prisG = portParGroupe(ru);

    const lignes = [];
    groupesArmes(ru.name).forEach(g => g.profils.forEach(p=>{
      const n = prisG[g.base] || 0, w = p.w;
      if(armMode === "prises" && !n) return;
      if(armMode === "tir" && w[2] !== "T") return;
      if(armMode === "cac" && w[2] !== "C") return;
      lignes.push({w:w, n:n, unite:ru.name});
    }));
    /* armes des personnages rattaches : celle qui est selectionnee */
    ru.chars.forEach(c=>{
      const gAct = groupeDe(c.name, c.w || 0);
      groupesArmes(c.name).forEach(g => g.profils.forEach(p=>{
        const equipee = !!(gAct && gAct.base === g.base), w = p.w;
        if(armMode === "prises" && !equipee) return;
        if(armMode === "tir" && w[2] !== "T") return;
        if(armMode === "cac" && w[2] !== "C") return;
        lignes.push({w:w, n:equipee ? 1 : 0, unite:c.name, perso:true});
      }));
    });
    if(!lignes.length) return;

    const g = document.createElement("div");
    g.className = "armgrp";
    g.innerHTML = '<h4>' + nomAffiche(ru) + (estGroupe(ru) ? ' <span>· ' + ru.name + '</span>' : '') +
      ' <span>×' + ru.size + '</span></h4>';
    const wrap = document.createElement("div");
    wrap.className = "armwrap";
    let html = '<table class="arms"><thead><tr><th style="text-align:left">Arme</th>' +
      '<th>Po</th><th>A</th><th>CT</th><th>F</th><th>PA</th><th>D</th></tr></thead><tbody>';
    lignes.forEach(L=>{
      const w = L.w, mots = w[8] ? motsArme(w[8]) : "";
      html += '<tr class="' + (L.n ? '' : 'off') + '"><td class="an">' +
        (L.n ? '<b class="q">' + (L.perso ? '' : '×' + L.n + ' ') + '</b>' : '') + w[1] +
        (w[2] === "C" ? ' <em style="color:var(--tx3)">càc</em>' : '') +
        (L.perso ? ' <em style="color:var(--tx3)">· ' + L.unite + '</em>' : '') +
        (mots ? '<span class="n">' + mots + '</span>' : '') + '</td>' +
        '<td>' + portee(w) + '</td>' +
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
  renderStrats(); renderArms(); renderFireList(); renderIndex(); renderPad(); renderPartie();
  renderDispo();
  if(el("cardPartage") && !el("cardPartage").hidden) renderPartage();
  if(window.__syncRosterQuick) window.__syncRosterQuick();
}

/* ---------- ajout d'unite / arme / personnage via la feuille ---------- */
let pickMode = null, pickTarget = null;
/* ==========================================================
   ANNULATION
   Une suppression d'unite se reprend : on garde la derniere
   et on l'offre pendant quelques secondes.
   ========================================================== */
let toastT = null;
function toast(txt, libelle, action){
  const t = el("toast"); if(!t) return;
  el("toastTxt").textContent = txt;
  const b = el("toastAct");
  b.textContent = libelle || "";
  b.onclick = null;
  if(action) b.onclick = ()=>{ cacheToast(); action(); };
  t.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(cacheToast, action ? 7000 : 3000);
}
function cacheToast(){ const t = el("toast"); if(t) t.classList.remove("on"); clearTimeout(toastT); }

/* retire une unite en gardant de quoi la remettre a sa place */
function retireUnite(ru){
  const i = R.units.indexOf(ru);
  if(i < 0) return;
  const copie = JSON.parse(JSON.stringify(ru));
  R.units.splice(i, 1);
  saveR(); renderList();
  toast(ru.name + " retiré de la liste.", "Annuler", ()=>{
    R.units.splice(Math.min(i, R.units.length), 0, copie);
    saveR(); renderList();
  });
}

function openSheet(id){ el(id).classList.add("open"); document.body.style.overflow="hidden"; }
function closeSheet(id){ el(id).classList.remove("open"); document.body.style.overflow=""; }

let derniereAjoutee = null, ajoutees = 0;
/* le compteur du catalogue : combien la liste pese deja, ce qu'il reste */
function majBudgetPick(){
  const bar = el("uBudget"); if(!bar) return;
  if(pickMode !== "unit" || !R){ bar.hidden = true; return; }
  const pts = totalPoints(), cap = R.cap || 2000, reste = cap - pts;
  bar.hidden = false;
  bar.classList.toggle("over", reste < 0);
  bar.innerHTML = '<b>' + pts + '</b><span class="pb2">/ ' + cap + ' pts  ·  ' +
    (reste >= 0 ? reste + ' restants' : (-reste) + ' de trop') + '</span>' +
    '<span class="pb2" style="text-align:right;flex:0 0 auto">' + R.units.length +
    ' unité' + (R.units.length > 1 ? 's' : '') + '</span>';
}

function openUnitPick(){
  window.__rosterPick = true; pickMode = "unit"; pickTarget = null;
  derniereAjoutee = null; ajoutees = 0;
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
let pickSlot = null;      /* index dans ru.lo quand on remplace une arme */
function openWeaponPick(ru, slot){
  window.__rosterPick = true; pickMode = "weapon"; pickTarget = ru;
  pickSlot = (slot === undefined) ? null : slot;
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
    const remplace = pickSlot !== null && pickTarget.lo[pickSlot];
    head.textContent = remplace
      ? "Remplacer l'arme — " + pickTarget.name
      : "Ajouter une arme — " + pickTarget.name;
    /* on équipe une arme, pas un profil : proposer « Rod of covenant (tir) »
       et « (càc) » séparément laissait croire qu'on peut prendre l'un sans
       l'autre, alors que le bâton donne les deux */
    groupesArmes(pickTarget.name).forEach(g=>{
      /* une arme portee d'office n'est pas un choix : la proposer laisserait
         croire qu'on peut s'en passer */
      if(g.profils.every(pr => armeDOffice(pr.w))) return;
      if(q && !norm(g.libelle).includes(q)) return;
      const b = document.createElement("button");
      b.type="button"; b.className="opt";
      const detail = g.profils.map(p =>
        (p.w[2] === "C" ? "càc" : "tir") + " A" + p.w[3] + " " + p.w[4] + "+ F" + p.w[5] +
        " PA" + (p.w[6] ? "-" + p.w[6] : "0") + " D" + p.w[7]).join("  ·  ");
      b.innerHTML = '<span class="oi"><span class="o1">' + g.libelle + '</span>' +
        '<span class="o2">' + detail + '</span></span>' +
        (g.profils.length > 1 ? '<span class="otag">' + g.profils.length + ' PROFILS</span>' : '');
      /* la case déjà servie par cette arme se marque, on ne la propose pas
         comme remplacement d'elle-même */
      const actuelle = remplace &&
        groupeDe(pickTarget.name, pickTarget.lo[pickSlot].w) &&
        groupeDe(pickTarget.name, pickTarget.lo[pickSlot].w).base === g.base;
      if(actuelle) b.classList.add("sel");
      b.addEventListener("click", ()=>{
        if(remplace){
          /* on garde le nombre de porteurs : c'est un échange d'arme, pas
             une nouvelle ligne */
          const n = pickTarget.lo[pickSlot].n;
          const autre = pickTarget.lo.findIndex((l, i) => i !== pickSlot &&
            groupeDe(pickTarget.name, l.w) && groupeDe(pickTarget.name, l.w).base === g.base);
          if(autre >= 0){
            /* l'arme choisie est déjà servie ailleurs : on fusionne */
            pickTarget.lo[autre].n = Math.min(pickTarget.size, pickTarget.lo[autre].n + n);
            pickTarget.lo.splice(pickSlot, 1);
          } else {
            pickTarget.lo[pickSlot] = { w: g.principal, n: n };
          }
        } else {
          /* on sert d'abord les figurines encore sans arme : ajouter une
             seconde arme à une escouade complète n'aurait aucun sens */
          const tot = pickTarget.lo.reduce((a, x) => a + x.n, 0);
          let libre = Math.max(0, pickTarget.size - tot);
          const ex = pickTarget.lo.find(l => groupeDe(pickTarget.name, l.w) &&
                                             groupeDe(pickTarget.name, l.w).base === g.base);
          if(!libre && !ex){
            /* l'escouade est deja entierement equipee : la nouvelle arme
               prend une figurine a la ligne la plus fournie, sinon on
               deborderait de l'effectif */
            const gros = pickTarget.lo.slice().sort((a, b) => b.n - a.n)[0];
            if(gros && gros.n > 0){ gros.n -= 1; libre = 1; }
          }
          if(ex) ex.n = Math.min(pickTarget.size, ex.n + Math.max(1, libre));
          else pickTarget.lo.push({w:g.principal, n: Math.max(1, libre)});
          pickTarget.lo = pickTarget.lo.filter(l => l.n > 0);
        }
        pickSlot = null;
        closeSheet("sheetUnit"); saveR(); renderList();
      });
      host.appendChild(b);
    });
    if(!host.children.length) host.innerHTML = '<div class="sheet-empty">Aucune arme trouvée.</div>';
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
      const rangee = document.createElement("div");
      rangee.className = "optrow";
      const inf = document.createElement("button");
      inf.type = "button"; inf.className = "ibtn"; inf.textContent = "ⓘ";
      inf.title = "Voir la fiche de " + u[0];
      inf.addEventListener("click", e => { e.stopPropagation(); ouvreFiche(u[0]); });
      rangee.appendChild(b); rangee.appendChild(inf);
      return rangee;
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
        (typeof e[1] === "number" ? e[1] + ' pts' : 'coût inconnu') + ' · ' + nomDetach(e[2]) +
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
  majBudgetPick();
  /* rangé par grande catégorie : on cherche « un véhicule », « un héros »,
     rarement un nom précis dans une liste de cinquante-deux entrées.
     La recherche prend aussi les mots-cles et le role : « canoptek »,
     « leader », « battleline » ramenent ce qu'il faut. */
  const retenues = UNITS.filter(u => !q || norm(u[0]).includes(q) ||
    unitWeps(u[0]).some(w => norm(w[1]).includes(q)) || norm(categorie(u[0])).includes(q) ||
    norm(u[9] || "").includes(q) ||
    Object.keys(KW).some(k => has(k, u[0]) && norm(k).includes(q)));
  const parCat = {};
  retenues.forEach(u => (parCat[categorie(u[0])] = parCat[categorie(u[0])] || []).push(u));
  const bouton = u => {
    const b = document.createElement("button");
    b.type="button"; b.className="opt";
    /* la taille minimale est celle qu'on prend le plus souvent, et surtout
       la moins chere : poser d'office la plus grande faisait croire toute
       l'armee hors de prix. Le prix s'annonce en fourchette. */
    const sz = u[6][0];
    const pmin = u[7][String(u[6][0])] || 0, pmax = u[7][String(u[6][u[6].length-1])] || 0;
    const reste = (R.cap || 2000) - totalPoints();
    if(pmin > reste) b.classList.add("cher");
    b.innerHTML = '<span class="oi"><span class="o1">' + u[0] + '</span><span class="o2">×' + u[6].join("/") +
      ' · ' + (pmin === pmax ? pmin + ' pts' : pmin + '–' + pmax + ' pts') +
      ' · E' + u[2] + ' · Svg ' + u[3] + '+</span></span>' +
      (u[10] ? '<span class="otag">LEGENDS</span>' : (u[9] ? '<span class="otag">' + u[9].toUpperCase() + '</span>' : ""));
    b.addEventListener("click", ()=>{
      const wl = unitWeps(u[0]);
      let di = wl.findIndex(w => w[2] === "T");
      if(di < 0) di = 0;
      const neuve = {id:nextId++, name:u[0], size:sz, lo:[{w:di, n:sz}], chars:[], sel:true,
        grp:nomGroupe(), enh:null};
      R.units.push(neuve);
      saveR(); renderList();
      /* on reste dans le catalogue : monter une liste, c'est poser dix
         unites d'affilee, pas ressortir dix fois. Le pave se remplit
         derriere et le budget se met a jour au-dessus. */
      b.classList.add("pose");
      setTimeout(()=> b.classList.remove("pose"), 700);
      majBudgetPick();
      derniereAjoutee = neuve.id; ajoutees++;
    });
    /* la fiche se consulte avant d'ajouter : c'est la qu'on decide */
    const rangee = document.createElement("div");
    rangee.className = "optrow";
    const inf = document.createElement("button");
    inf.type = "button"; inf.className = "ibtn"; inf.textContent = "ⓘ";
    inf.title = "Voir la fiche de " + u[0];
    inf.addEventListener("click", e => { e.stopPropagation(); ouvreFiche(u[0]); });
    rangee.appendChild(b); rangee.appendChild(inf);
    return rangee;
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
/* ==========================================================
   PARTAGE : texte, impression, sauvegarde, import
   ========================================================== */
/* le texte que les organisateurs de tournoi attendent : lisible,
   sans mise en forme, chaque unite avec son cout et son armement */
function listeEnTexte(L){
  L = L || R;
  const lignes = [];
  const pts = pointsDe(L);
  lignes.push(L.nom + " — Nécrons — " + pts + " / " + L.cap + " pts");
  lignes.push("Détachement : " + (L.detach.length ? L.detach.map(nomDetach).join(" + ") : "aucun"));
  if(L.fd) lignes.push("Disposition de Force : " + L.fd);
  lignes.push("");

  const parCat = {};
  L.units.forEach(ru => {
    const c = categorie(ru.name);
    (parCat[c] = parCat[c] || []).push(ru);
  });
  CAT_ORDRE.forEach(cat => {
    const lot = parCat[cat]; if(!lot || !lot.length) return;
    lignes.push("+ " + cat.toUpperCase() + " +");
    lignes.push("");
    lot.forEach(ru => {
      const u = unitRow(ru.name); if(!u) return;
      const tete = (estGroupe(ru) && ru.grp ? ru.grp + " — " : "") +
        ru.name + " ×" + ru.size + " (" + pointsUnite(ru) + " pts)";
      lignes.push(tete);
      const wl = unitWeps(ru.name);
      const portE = portParArme(ru), vusE = {};
      Object.keys(portE).forEach(k => {
        const i = +k, n = portE[i], w = wl[i];
        if(!n || !w) return;
        const g = groupeDe(ru.name, i);
        if(g){ if(vusE[g.base]) return; vusE[g.base] = 1; }
        lignes.push("  • " + n + "× " + (g ? g.libelle : w[1]));
      });
      ru.chars.forEach(c => {
        const cu = unitRow(c.name); if(!cu) return;
        lignes.push("  ‣ " + c.name + " (" + (cu[7][String(cu[6][0])] || 0) + " pts)");
        const gc = groupeDe(c.name, c.w || 0);
        if(gc) lignes.push("      • " + gc.libelle);
      });
      if(ru.enh){
        const e = enhRow(ru.enh);
        lignes.push("  ★ " + ru.enh + " (" + (e && typeof e[1] === "number" ? e[1] + " pts" : "coût inconnu") + ")");
      }
      lignes.push("");
    });
  });
  lignes.push("Total : " + pts + " pts sur " + L.cap + ".");
  const av = validate();
  if(av.length) lignes.push("À vérifier : " + av.length + " avertissement" + (av.length > 1 ? "s" : "") +
    " dans l'application.");
  return lignes.join("\n");
}

function renderPartage(){
  const z = el("listTxt"); if(!z) return;
  z.textContent = listeEnTexte();
  const q = el("qrHost"); if(q){ q.hidden = true; q.innerHTML = ""; }
  const r = el("importRap"); if(r) r.innerHTML = "";
}

/* le presse-papier moderne n'existe pas partout : on retombe sur la
   selection quand il manque */
function copier(txt, quoi){
  const fini = ok => toast(ok ? quoi + " copié." : "Copie refusée par le navigateur — sélectionne le texte à la main.", "", null);
  if(navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(txt).then(()=> fini(true), ()=> fini(false));
  else {
    try{
      const t = document.createElement("textarea");
      t.value = txt; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      fini(document.execCommand("copy"));
      document.body.removeChild(t);
    }catch(e){ fini(false); }
  }
}

/* impression : on ouvre une fenetre propre plutot que d'imprimer
   l'application, dont la mise en page ne s'y prete pas */
function imprimeListe(){
  const w = window.open("", "_blank");
  if(!w){ toast("Le navigateur a bloqué la fenêtre d'impression.", "", null); return; }
  const esc = t => String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
  w.document.write('<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">' +
    '<title>' + esc(R.nom) + '</title><style>' +
    'body{font:13px/1.55 ui-monospace,Menlo,monospace;margin:26px;color:#111;max-width:720px}' +
    'h1{font-size:17px;letter-spacing:.04em;margin:0 0 14px;border-bottom:2px solid #111;padding-bottom:6px}' +
    'pre{white-space:pre-wrap;margin:0;font:inherit}' +
    '@page{margin:16mm}</style></head><body><h1>' + esc(R.nom) + '</h1><pre>' +
    esc(listeEnTexte()) + '</pre></body></html>');
  w.document.close();
  w.focus();
  setTimeout(()=>{ try{ w.print(); }catch(e){} }, 250);
}

/* sauvegarde de toutes les listes dans un fichier */
function sauvegardeTout(){
  const payload = { app: "necron-aide-jeu", v: 1, listes: LISTS, strats: SUSER };
  const blob = new Blob([JSON.stringify(payload, null, 1)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "listes-necrons.json";
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast(LISTS.length + " liste" + (LISTS.length > 1 ? "s" : "") + " sauvegardée" +
    (LISTS.length > 1 ? "s" : "") + ".", "", null);
}

function rapport(lignes){
  const host = el("importRap"); if(!host) return;
  host.innerHTML = lignes.map(l =>
    '<div class="ir' + (l.warn ? " warn" : "") + '">' + l.txt + '</div>').join("");
}

/* ==========================================================
   QR CODE — encodeur autonome, mode octet, correction L.
   Ecrit ici plutot qu'importe : l'application n'a aucune
   dependance et doit tourner depuis un simple fichier.
   ========================================================== */
const QR = (function(){
  /* corps de Galois GF(256), polynome 0x11D */
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for(let i=0, x=1; i<255; i++){
    EXP[i] = x; LOG[x] = i;
    x <<= 1; if(x & 256) x ^= 0x11D;
  }
  for(let i=255; i<512; i++) EXP[i] = EXP[i-255];
  const mul = (a,b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;

  /* polynome generateur de n symboles de correction */
  function gen(n){
    let p = [1];
    for(let i=0; i<n; i++){
      const q = new Array(p.length + 1).fill(0);
      for(let j=0; j<p.length; j++){
        q[j] ^= p[j];                    /* x · p */
        q[j+1] ^= mul(p[j], EXP[i]);     /* α^i · p */
      }
      p = q;
    }
    return p;
  }
  function ecc(data, n){
    const g = gen(n), res = new Array(data.length + n).fill(0);
    for(let i=0; i<data.length; i++) res[i] = data[i];
    for(let i=0; i<data.length; i++){
      const c = res[i];
      if(!c) continue;
      for(let j=0; j<g.length; j++) res[i+j] ^= mul(g[j], c);
    }
    return res.slice(data.length);
  }

  /* niveau L : [symboles de correction par bloc, blocs G1, donnees G1, blocs G2, donnees G2] */
  const BLOCS = [null,
   [7,1,19,0,0],[10,1,34,0,0],[15,1,55,0,0],[20,1,80,0,0],[26,1,108,0,0],
   [18,2,68,0,0],[20,2,78,0,0],[24,2,97,0,0],[30,2,116,0,0],[18,2,68,2,69],
   [20,4,81,0,0],[24,2,92,2,93],[26,4,107,0,0],[30,3,115,1,116],[22,5,87,1,88],
   [24,5,98,1,99],[28,1,107,5,108],[30,5,120,1,121],[28,3,113,4,114],[28,3,107,5,108],
   [28,4,116,4,117],[28,2,111,7,112],[30,4,121,5,122],[30,6,117,4,118],[26,8,106,4,107],
   [28,10,114,2,115],[30,8,122,4,123],[30,3,117,10,118],[30,7,116,7,117],[30,5,115,10,116],
   [30,13,115,3,116],[30,17,115,0,0],[30,17,115,1,116],[30,13,115,6,116],[30,12,121,7,122],
   [30,6,121,14,122],[30,17,122,4,123],[30,4,122,18,123],[30,20,117,4,118],[30,19,118,6,119]];

  const ALIGN = [null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],
   [6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],
   [6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],
   [6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],
   [6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],
   [6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],
   [6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],
   [6,26,54,82,110,138,166],[6,30,58,86,114,142,170]];

  const donneesDe = v => { const b = BLOCS[v]; return b[1]*b[2] + b[3]*b[4]; };

  /* BCH : 10 bits pour le format, 12 pour la version */
  function bch(v, poly, n){
    let d = v << n;
    const lg = x => { let l = 0; while(x){ l++; x >>= 1; } return l; };
    const lp = lg(poly);
    while(lg(d) >= lp) d ^= poly << (lg(d) - lp);
    return d;
  }

  function encode(txt){
    const bytes = new TextEncoder().encode(txt);
    let v = 0;
    for(let i=1; i<=40; i++){
      const cc = i < 10 ? 8 : 16;
      if(donneesDe(i) * 8 >= 4 + cc + bytes.length * 8){ v = i; break; }
    }
    if(!v) throw new Error("trop long pour un QR code");

    /* flux binaire : mode octet, longueur, donnees, terminaison */
    const bits = [];
    const put = (val, n) => { for(let i=n-1; i>=0; i--) bits.push((val >> i) & 1); };
    put(4, 4);
    put(bytes.length, v < 10 ? 8 : 16);
    bytes.forEach(b => put(b, 8));
    const cap = donneesDe(v) * 8;
    for(let i=0; i<4 && bits.length < cap; i++) bits.push(0);
    while(bits.length % 8) bits.push(0);
    const mots = [];
    for(let i=0; i<bits.length; i+=8){
      let b = 0; for(let j=0; j<8; j++) b = (b << 1) | bits[i+j];
      mots.push(b);
    }
    const REMPLIS = [0xEC, 0x11];
    for(let i=0; mots.length < donneesDe(v); i++) mots.push(REMPLIS[i % 2]);

    /* decoupage en blocs, correction, entrelacement */
    const [nec, b1, d1, b2, d2] = BLOCS[v];
    const blocs = [], eccs = [];
    let p = 0;
    for(let i=0; i<b1; i++){ blocs.push(mots.slice(p, p+d1)); p += d1; }
    for(let i=0; i<b2; i++){ blocs.push(mots.slice(p, p+d2)); p += d2; }
    blocs.forEach(b => eccs.push(ecc(b, nec)));
    const flux = [];
    const maxD = Math.max(d1, d2);
    for(let i=0; i<maxD; i++) blocs.forEach(b => { if(i < b.length) flux.push(b[i]); });
    for(let i=0; i<nec; i++) eccs.forEach(e => flux.push(e[i]));

    /* trame */
    const n = v * 4 + 17;
    const m = [], res = [];
    for(let i=0; i<n; i++){ m.push(new Uint8Array(n)); res.push(new Uint8Array(n)); }
    const pose = (r, c, val) => { m[r][c] = val; res[r][c] = 1; };

    const reperes = (r, c) => {
      for(let i=-1; i<=7; i++) for(let j=-1; j<=7; j++){
        const y = r+i, x = c+j;
        if(y < 0 || y >= n || x < 0 || x >= n) continue;
        const bord = (i >= 0 && i <= 6 && (j === 0 || j === 6)) ||
                     (j >= 0 && j <= 6 && (i === 0 || i === 6));
        const coeur = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        pose(y, x, (bord || coeur) ? 1 : 0);
      }
    };
    reperes(0, 0); reperes(0, n-7); reperes(n-7, 0);

    /* les trois coins portent deja un repere : ces mires-la n'existent pas.
       Toutes les autres se posent, y compris sur la ligne de synchronisation. */
    const A = ALIGN[v], der = A[A.length-1];
    A.forEach(r => A.forEach(c => {
      if((r === 6 && c === 6) || (r === 6 && c === der) || (r === der && c === 6)) return;
      for(let i=-2; i<=2; i++) for(let j=-2; j<=2; j++)
        pose(r+i, c+j, (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0)) ? 1 : 0);
    }));

    for(let i=8; i<n-8; i++){ pose(6, i, i % 2 === 0 ? 1 : 0); pose(i, 6, i % 2 === 0 ? 1 : 0); }
    pose(n-8, 8, 1);

    /* emplacements du format, reserves avant le remplissage */
    for(let i=0; i<9; i++){ if(!res[8][i]) pose(8, i, 0); if(!res[i][8]) pose(i, 8, 0); }
    for(let i=0; i<8; i++){ if(!res[8][n-1-i]) pose(8, n-1-i, 0); if(!res[n-1-i][8]) pose(n-1-i, 8, 0); }
    if(v >= 7){
      const vb = (v << 12) | bch(v, 0x1F25, 12);
      for(let i=0; i<18; i++){
        const b = (vb >> i) & 1;
        pose(Math.floor(i/3), n-11 + (i%3), b);
        pose(n-11 + (i%3), Math.floor(i/3), b);
      }
    }

    /* remplissage en zigzag, de droite a gauche */
    let bit = 0, montant = true;
    const flot = [];
    flux.forEach(b => { for(let i=7; i>=0; i--) flot.push((b >> i) & 1); });
    for(let col = n-1; col > 0; col -= 2){
      if(col === 6) col--;
      for(let k=0; k<n; k++){
        const r = montant ? n-1-k : k;
        for(let d=0; d<2; d++){
          const c = col - d;
          if(res[r][c]) continue;
          m[r][c] = bit < flot.length ? flot[bit] : 0;
          bit++;
        }
      }
      montant = !montant;
    }

    /* masques : on garde celui qui penalise le moins */
    const MASQUES = [
      (r,c)=>(r+c)%2===0, (r)=>r%2===0, (r,c)=>c%3===0, (r,c)=>(r+c)%3===0,
      (r,c)=>(Math.floor(r/2)+Math.floor(c/3))%2===0, (r,c)=>(r*c)%2+(r*c)%3===0,
      (r,c)=>((r*c)%2+(r*c)%3)%2===0, (r,c)=>((r+c)%2+(r*c)%3)%2===0
    ];
    let best = null, bestP = Infinity;
    for(let k=0; k<8; k++){
      const g = m.map(l => Uint8Array.from(l));
      for(let r=0; r<n; r++) for(let c=0; c<n; c++)
        if(!res[r][c] && MASQUES[k](r,c)) g[r][c] ^= 1;
      /* format : 01 pour le niveau L, puis le numero de masque */
      const fb = (((1 << 3) | k) << 10 | bch((1 << 3) | k, 0x537, 10)) ^ 0x5412;
      for(let i=0; i<15; i++){
        const b = (fb >> i) & 1;
        /* copie verticale : colonne 8 en haut, puis en bas */
        if(i < 6) g[i][8] = b;
        else if(i < 8) g[i+1][8] = b;
        else g[n-15+i][8] = b;
        /* copie horizontale : ligne 8 a droite, puis a gauche */
        if(i < 8) g[8][n-1-i] = b;
        else if(i === 8) g[8][7] = b;
        else g[8][14-i] = b;
      }
      g[n-8][8] = 1;
      const p = penalite(g, n);
      if(p < bestP){ bestP = p; best = g; }
    }
    return best;
  }

  function penalite(g, n){
    let p = 0, sombres = 0;
    const serie = (get) => {
      for(let a=0; a<n; a++){
        let run = 1;
        for(let b=1; b<n; b++){
          if(get(a,b) === get(a,b-1)) run++;
          else { if(run >= 5) p += 3 + (run - 5); run = 1; }
        }
        if(run >= 5) p += 3 + (run - 5);
      }
    };
    serie((a,b)=>g[a][b]); serie((a,b)=>g[b][a]);
    for(let r=0; r<n-1; r++) for(let c=0; c<n-1; c++){
      const v = g[r][c];
      if(v === g[r][c+1] && v === g[r+1][c] && v === g[r+1][c+1]) p += 3;
    }
    const MOTIF = [1,0,1,1,1,0,1,0,0,0,0];
    const cherche = (get) => {
      for(let a=0; a<n; a++) for(let b=0; b+11<=n; b++){
        let ok = true;
        for(let i=0; i<11; i++) if(get(a,b+i) !== MOTIF[i]){ ok = false; break; }
        if(ok) p += 40;
        ok = true;
        for(let i=0; i<11; i++) if(get(a,b+i) !== MOTIF[10-i]){ ok = false; break; }
        if(ok) p += 40;
      }
    };
    cherche((a,b)=>g[a][b]); cherche((a,b)=>g[b][a]);
    for(let r=0; r<n; r++) for(let c=0; c<n; c++) if(g[r][c]) sombres++;
    p += Math.floor(Math.abs(sombres * 100 / (n*n) - 50) / 5) * 10;
    return p;
  }

  return { encode: encode };
})();

/* dessine la matrice dans un canvas, marge de quatre modules */
function dessineQR(txt, taille){
  const m = QR.encode(txt), n = m.length, q = 4, tot = n + q*2;
  const px = Math.max(1, Math.floor((taille || 560) / tot));
  const cv = document.createElement("canvas");
  cv.width = cv.height = tot * px;
  const g = cv.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = "#000";
  for(let r=0; r<n; r++) for(let c=0; c<n; c++)
    if(m[r][c]) g.fillRect((c+q)*px, (r+q)*px, px, px);
  return { canvas: cv, version: (n - 17) / 4 };
}

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
  d: R.detach, f: R.fd || "",
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
  L.fd = o.f || "";
  L.units = o.u.map(u => ({
    id: L.nextId++, name: u.n, size: u.s, lo: u.l || [], chars: u.c || [], sel: u.x !== 0,
    grp: u.g || nomGroupe(), enh: migreEnh(u.e || null)
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
      "pour passer ta liste d'un appareil à l'autre, ou la sauvegarde en fichier.");
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

/* le lien, tel quel : le QR code et la copie s'en servent tous deux */
async function lienDeListe(){
  if(location.protocol === "file:") return "";
  if(!R.units.length) return "";
  try{ return location.href.replace(/#.*$/, "") + "#l=" + await encodeList(); }
  catch(e){ return ""; }
}

async function afficheQR(){
  const host = el("qrHost"); if(!host) return;
  const url = await lienDeListe();
  host.hidden = false;
  if(!url){
    host.innerHTML = '<p>' + (location.protocol === "file:"
      ? "Cette copie est ouverte depuis un fichier local : le lien n'aurait de sens que sur cet ordinateur. Sauvegarde tes listes dans un fichier pour les transporter."
      : "Ta liste est vide — ajoute au moins une unité.") + '</p>';
    return;
  }
  host.innerHTML = "";
  try{
    const q = dessineQR(url);
    host.appendChild(q.canvas);
    const p = document.createElement("p");
    p.textContent = "Version " + q.version + " · " + url.length +
      " caractères. Vise-le avec l'autre appareil pour y ouvrir la liste.";
    host.appendChild(p);
  }catch(e){
    host.innerHTML = '<p>Liste trop longue pour tenir dans un QR code (' + url.length +
      ' caractères). Passe par le lien ou par la sauvegarde en fichier.</p>';
  }
}

/* ==========================================================
   IMPORT BATTLESCRIBE
   Un .ros est du XML : on y cherche les selections qui portent
   un profil d'unite, on rapproche les noms de notre catalogue
   et on dit franchement ce qui n'a pas ete reconnu.
   ========================================================== */
function importeRos(txt){
  let doc;
  try{ doc = new DOMParser().parseFromString(txt, "application/xml"); }
  catch(e){ rapport([{txt:"Fichier illisible.", warn:true}]); return; }
  if(doc.querySelector("parsererror")){
    rapport([{txt:"Ce fichier n'est pas un XML valide. Un .rosz est une archive : décompresse-la d'abord, le .ros est dedans.", warn:true}]);
    return;
  }
  const nom = (doc.documentElement.getAttribute("name") || "Liste importée").trim();
  const cle = s => String(s).toLowerCase().replace(/\[legends\]/g, "").replace(/[^a-z0-9]/g, "");
  const catalogue = {};
  UNITS.forEach(u => catalogue[cle(u[0])] = u);

  const trouvees = [], inconnues = [];
  const selections = doc.getElementsByTagName("selection");
  for(let i=0; i<selections.length; i++){
    const sel = selections[i];
    const type = sel.getAttribute("type");
    if(type !== "unit" && type !== "model") continue;
    const n = (sel.getAttribute("name") || "").trim();
    if(!n) continue;
    const u = catalogue[cle(n)];
    /* une entree imbriquee dans une unite deja reconnue est une figurine
       de cette unite, pas une unite de plus */
    const parent = sel.parentNode && sel.parentNode.parentNode;
    const dansUnite = parent && parent.nodeName === "selection" &&
      (parent.getAttribute("type") === "unit" || parent.getAttribute("type") === "model");
    if(dansUnite) continue;
    if(u) trouvees.push({ u: u, n: parseInt(sel.getAttribute("number"), 10) || 1, brut: n });
    else if(inconnues.indexOf(n) < 0) inconnues.push(n);
  }

  if(!trouvees.length){
    rapport([{txt:"Aucune unité nécron reconnue dans ce fichier. Il vient peut-être d'une autre faction.", warn:true}]);
    return;
  }
  const L = listeVierge(nom, R.cap || 2000);
  L.nextId = 1;
  trouvees.forEach(t => {
    const u = t.u;
    /* la taille du .ros ne se lit pas de facon fiable : on prend la plus
       petite compatible et on laisse regler a la main */
    const wl = unitWeps(u[0]);
    let di = wl.findIndex(w => w[2] === "T"); if(di < 0) di = 0;
    const sz = u[6][0];
    L.units.push({ id: L.nextId++, name: u[0], size: sz, lo:[{w:di, n:sz}],
      chars: [], sel: true, grp: "", enh: null });
  });
  normaliseListe(L);
  LISTS.push(L); ouvre(L);
  saveR(); renderList();
  const lignes = [{txt: "<b>" + L.units.length + " unité" + (L.units.length > 1 ? "s" : "") +
    "</b> importée" + (L.units.length > 1 ? "s" : "") + " dans « " + nom + " ». " +
    "Effectifs et armement sont posés au minimum : à régler unité par unité."}];
  if(inconnues.length) lignes.push({warn:true, txt: "<b>" + inconnues.length +
    " entrée" + (inconnues.length > 1 ? "s non reconnues" : " non reconnue") + "</b> : " +
    inconnues.slice(0, 12).join(", ") + (inconnues.length > 12 ? "…" : "") + "."});
  rapport(lignes);
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
    b.innerHTML = '<span class="oi"><span class="o1">' + nomDetach(d[0]) + '</span>' +
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
if(el("btnReorder")) el("btnReorder").addEventListener("click", ()=>{
  modeRange = !modeRange; renderPad();
});
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

el("btnAddDetach").addEventListener("click", ()=>{ initDetachSheet(); openSheet("sheetDetach"); });
el("btnExport2").addEventListener("click", exportImport);
el("btnAddStrat").addEventListener("click", ()=>{
  if(!R.detach.length){ toast("Choisis d'abord un détachement.", "", null); return; }
  const nom = prompt("Nom du stratagème, tel qu'il figure sur ta fiche :", "");
  if(!nom || !nom.trim()) return;
  const det = R.detach.length === 1 ? R.detach[0]
    : (prompt("De quel détachement ?\n" + R.detach.join("\n"), R.detach[0]) || "").trim();
  if(R.detach.indexOf(det) < 0){ toast("Détachement inconnu.", "", null); return; }
  SUSER.ajouts.push([nom.trim(), det, "", 1, "", "", "", ""]);
  saveS(); renderStrats(); renderPartie();
  toast(nom.trim() + " ajouté — touche-le pour saisir son texte.", "", null);
});
if(el("listDispo")) el("listDispo").addEventListener("change", ()=>{
  R.fd = el("listDispo").value.trim(); saveR(); renderList();
});

/* boutons du suivi de partie */
el("btnReanime").addEventListener("click", ()=>{
  if(!R) return;
  let n = 0;
  R.units.forEach(ru=>{
    const e = etat(ru), max = pvMax(ru);
    if(e.pv <= 0 || e.pv >= max) return;
    const g = d3();
    e.pv = Math.min(max, e.pv + g);
    n++;
  });
  noteJournal(n ? "Réanimation de " + n + " unité" + (n > 1 ? "s" : "") : "Réanimation : rien à relever");
  saveG(); renderPartie();
  toast(n ? n + " unité" + (n > 1 ? "s réanimées" : " réanimée") + "." : "Aucune unité à réanimer.", "", null);
});
el("btnResetPV").addEventListener("click", ()=>{
  if(!R) return;
  R.units.forEach(ru=>{ const e = etat(ru); e.pv = pvMax(ru); e.c = ru.chars.map(c => pvMaxChar(c.name)); });
  noteJournal("Toutes les unités remises à neuf");
  saveG(); renderPartie();
});
el("btnNewGame").addEventListener("click", ()=>{
  if(!confirm("Repartir d'une partie vierge ? Le tour, les PC, le score et l'état des unités sont remis à zéro.")) return;
  G = partieVierge(); saveG(); renderPartie();
  toast("Nouvelle partie.", "", null);
});
el("btnCopyTxt").addEventListener("click", ()=> copier(listeEnTexte(), "Le texte de la liste"));
el("btnPrint").addEventListener("click", imprimeListe);
el("btnShare2").addEventListener("click", shareLink);
el("btnQR").addEventListener("click", afficheQR);
el("btnBackup").addEventListener("click", sauvegardeTout);
el("btnShareTxt").addEventListener("click", async ()=>{
  const txt = listeEnTexte();
  if(navigator.share){
    try{ await navigator.share({ title: R.nom, text: txt }); return; }
    catch(e){ if(e && e.name === "AbortError") return; }
  }
  copier(txt, "Le texte de la liste");
});

/* un seul champ de fichier sert aux deux entrees : on retient ce
   qu'on attend avant de l'ouvrir */
let attenteFichier = null;
el("btnRestore").addEventListener("click", ()=>{ attenteFichier = "json"; el("fileIn").click(); });
el("btnImportRos").addEventListener("click", ()=>{ attenteFichier = "ros"; el("fileIn").click(); });
el("fileIn").addEventListener("change", ()=>{
  const f = el("fileIn").files && el("fileIn").files[0];
  el("fileIn").value = "";
  if(!f) return;
  const fr = new FileReader();
  fr.onload = ()=>{
    const txt = String(fr.result || "");
    if(attenteFichier === "ros"){ importeRos(txt); return; }
    try{
      const o = JSON.parse(txt);
      const lot = Array.isArray(o) ? o : (o && o.listes);
      if(!Array.isArray(lot) || !lot.length) throw 0;
      let n = 0;
      lot.forEach(L => {
        if(!L || !Array.isArray(L.units)) return;
        const neuve = listeVierge(L.nom || "Liste restaurée", L.cap || 2000);
        neuve.detach = L.detach || [];
        neuve.units = L.units;
        normaliseListe(neuve);
        LISTS.push(neuve); n++;
      });
      if(!n) throw 0;
      /* les stratagemes saisis voyagent avec les listes : ils se completent,
         ce qui est deja saisi ici n'est pas ecrase */
      if(o && o.strats && o.strats.fiches){
        Object.keys(o.strats.fiches).forEach(k => { if(!SUSER.fiches[k]) SUSER.fiches[k] = o.strats.fiches[k]; });
        (o.strats.ajouts || []).forEach(a => {
          if(!SUSER.ajouts.some(x => x[0] === a[0] && x[1] === a[1])) SUSER.ajouts.push(a);
        });
        saveS();
      }
      saveR(); renderList(); renderIndex();
      rapport([{txt: "<b>" + n + " liste" + (n > 1 ? "s" : "") + "</b> restaurée" +
        (n > 1 ? "s" : "") + ". Rien n'a été écrasé : elles s'ajoutent aux tiennes."}]);
    }catch(e){
      rapport([{txt:"Ce fichier ne contient pas de listes lisibles.", warn:true}]);
    }
  };
  fr.readAsText(f);
});
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

el("uSearch").addEventListener("input", ()=>{ if(window.__rosterPick && pickMode) renderPick(); });
el("phaseChips").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    phase = b.dataset.p;
    el("phaseChips").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    renderFireList();
  }));
document.querySelectorAll('[data-close="sheetUnit"]').forEach(b=>
  b.addEventListener("click", ()=>{
    /* on sort du catalogue : dire ce qu'on vient d'y poser, et proposer
       d'ouvrir la derniere si on n'en a pose qu'une */
    if(pickMode === "unit" && ajoutees){
      const id = derniereAjoutee;
      toast(ajoutees + " unité" + (ajoutees > 1 ? "s ajoutées" : " ajoutée") + " à la liste.",
        ajoutees === 1 ? "Régler" : "", ajoutees === 1 ? ()=> ouvrePanneau("cardUnits", id) : null);
    }
    pickMode = null; pickSlot = null; ajoutees = 0;
    const bar = el("uBudget"); if(bar) bar.hidden = true;
  }));

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

loadR(); loadCmp(); loadS();
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
