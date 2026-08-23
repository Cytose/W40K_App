/* ==========================================================
   AXE PLATEAU
   Le quatrième moment d'une partie : après avoir construit sa liste
   et l'avoir mesurée, on la POSE. L'écran affiche la disposition
   officielle que le croisement des deux Dispositions de Force impose,
   et laisse essayer un déploiement avant d'arriver à la table.

   Une unité n'y est pas un jeton : c'est le nombre exact de figurines
   qu'elle compte, chacune sur son socle, à l'échelle du plateau. On
   les déplace ensemble ou une par une, la distance parcourue se lit
   en direct pendant le geste, et la cohésion se vérifie en posant.

   Ce module ne touche à rien : il lit la liste en service dans le
   stockage de roster.js et les tables de data.js, et garde ses propres
   positions sous sa propre clé. Aucune fonction de roster.js ni de
   app.js n'est appelée — il n'y a donc rien à casser de ce côté.
   ========================================================== */
(function(){
"use strict";
const el = id => document.getElementById(id);
if(!el("scMap") || typeof LAYOUTS === "undefined") return;

const LKEY = "mathhammer.lists.v1";      /* la liste en service, écrite par roster.js */
const PKEY = "mathhammer.plateau.v1";    /* nos positions, écrites par nous seuls */

const W = LAYOUTS.table.w, H = LAYOUTS.table.h;   /* 44 x 60 pouces, sans exception */
const NS = "http://www.w3.org/2000/svg";
const MM = 25.4;

/* Les deux règles qui décident d'un déploiement, en pouces. */
const COHESION = 2;      /* bord à bord, d'une figurine à sa voisine */
const PRISE_MAX = 9;     /* prise au sol qu'on s'impose sur l'unité entière */

/* Le plateau est stocké en portrait, comme la carte officielle : 44 de
   large sur 60 de long, origine en haut à gauche.

   Il s'affiche couché par défaut, parce qu'un plateau debout ne laisse
   presque rien voir sur un téléphone : X = y, Y = 44 - x, et les angles
   perdent 90°.

   Mais couché, il ne se compare plus au document officiel — la diagonale
   d'une zone de déploiement penche dans l'autre sens, et on ne sait plus
   dire si c'est la donnée qui se trompe ou l'affichage. D'où le second
   mode, debout, où l'écran reprend exactement l'orientation de la carte.
   La donnée, elle, ne bouge pas : seule la projection change. */
const ORIENT = "mathhammer.plateau.debout";
let debout = false;
try { debout = localStorage.getItem(ORIENT) === "1"; } catch(e){ /* navigation privée */ }

const DX = (x,y) => debout ? x : y;
const DY = (x,y) => debout ? y : W - x;
const versPlateau = (px,py) => debout ? ({ x: px, y: py }) : ({ x: W - py, y: px });
/* couché, tout ce qui porte un angle perd 90° ; debout, rien ne tourne */
const ROT = () => debout ? 0 : -90;
const VUE = () => debout ? "-1.5 -1.5 47 63" : "-1.5 -1.5 63 47";

/* ==========================================================
   LE FOND DE CARTE

   La page officielle d'un agencement, posee sous la geometrie, pour
   comparer d'un coup d'oeil. Les images ne sont pas livrees avec
   l'application : ce sont les pages d'un document de Games Workshop, et
   le depot comme le site sont publics. C'est donc l'utilisateur qui
   charge les siennes, et elles ne quittent jamais son navigateur.

   Le calage est automatique. Sur ces pages, le plateau est un rectangle
   borde d'un trait noir ; on le retrouve en cherchant, ligne par ligne
   et colonne par colonne, une plage CONTINUE de pixels sombres assez
   longue. Compter les pixels sombres ne suffirait pas — un filet de mise
   en page en aligne autant — mais seul le cadre du plateau porte une
   plage d'un seul tenant sur presque toute la largeur. C'est la regle
   que suit outils/cartes-officielles.py, et elle vaut ici pour la meme
   raison : elle ecarte au passage les reperes de bord attaquant et
   defenseur, qu'ils soient horizontaux ou verticaux.

   Une image cadree pese quelques centaines de kilo-octets : trop pour
   localStorage des la deuxieme, d'ou IndexedDB.
   ========================================================== */
const FONDS = "mathhammer.fonds";
let fondBase = null, fondCache = {};

/* Les 45 agencements sont livres avec l'application. Sur le site ils sont
   un fichier chacun, demandes seulement quand on les regarde ; dans le
   fichier autonome la construction les replie dans CARTES, puisqu'il n'y a
   plus de reseau pour aller les chercher. Une image chargee par
   l'utilisateur passe devant : c'est peut-etre un meilleur tirage que le
   notre, ou une carte que nous n'avons pas. */
const carteLivree = cle =>
  (self.CARTES && self.CARTES[cle]) || ("cartes/" + cle.replace("|", "-") + ".jpg");

function fondOuvre(){
  return new Promise((ok, ko) => {
    if(fondBase) return ok(fondBase);
    if(!self.indexedDB) return ko(new Error("pas d'IndexedDB"));
    const r = indexedDB.open(FONDS, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("pages");
    r.onsuccess = () => { fondBase = r.result; ok(fondBase); };
    r.onerror = () => ko(r.error);
  });
}
function fondLit(cle){
  return fondOuvre().then(db => new Promise((ok, ko) => {
    const t = db.transaction("pages", "readonly").objectStore("pages").get(cle);
    t.onsuccess = () => ok(t.result || null);
    t.onerror = () => ko(t.error);
  })).catch(() => null);
}
function fondEcrit(cle, val){
  return fondOuvre().then(db => new Promise((ok, ko) => {
    const m = db.transaction("pages", "readwrite").objectStore("pages");
    const t = val == null ? m.delete(cle) : m.put(val, cle);
    t.onsuccess = () => ok(true);
    t.onerror = () => ko(t.error);
  })).catch(() => false);
}

/* La cle : l'appariement resolu et la variante, pas la liste — une carte
   est la meme quelle que soit l'armee qu'on pose dessus. On prend
   l'identifiant que « plateauDe » a retenu, et non les deux libelles :
   celui de sa propre Disposition peut etre vide tant qu'aucun detachement
   ne la fixe, et deux cartes se retrouveraient alors sous la meme cle. */
const fondCle = (p, bd) => (bd && bd.id != null ? bd.id : "?") + "|" + (p.variante || "a");

/* Y a-t-il, sur cette ligne de pixels, une plage continue d'au moins k
   sombres ? */
function plageContinue(sombre, deb, pas, n, k){
  let suite = 0;
  for(let i = 0; i < n; i++){
    suite = sombre[deb + i * pas] ? suite + 1 : 0;
    if(suite >= k) return true;
  }
  return false;
}

/* Le rectangle du plateau dans l'image d'une page. Rend null si rien ne
   ressemble a un cadre : mieux vaut le dire que caler de travers. */
function cadrePage(don, w, h){
  const sombre = new Uint8Array(w * h);
  for(let i = 0, j = 0; i < sombre.length; i++, j += 4)
    sombre[i] = (don[j] + don[j+1] + don[j+2]) < 300 ? 1 : 0;
  const kx = Math.round(w * 0.48), ky = Math.round(h * 0.47);
  let x0 = -1, x1 = -1, y0 = -1, y1 = -1;
  for(let y = 0; y < h; y++)
    if(plageContinue(sombre, y * w, 1, w, kx)){ if(y0 < 0) y0 = y; y1 = y; }
  for(let x = 0; x < w; x++)
    if(plageContinue(sombre, x, w, h, ky)){ if(x0 < 0) x0 = x; x1 = x; }
  if(x0 < 0 || y0 < 0 || x1 - x0 < w * 0.3 || y1 - y0 < h * 0.2) return null;
  return {x:x0, y:y0, w:x1 - x0, h:y1 - y0};
}

/* Charge un fichier, retrouve le plateau, le decoupe, et rend une image
   au rapport 44 x 60. */
function fondPrepare(fichier){
  return new Promise((ok, ko) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      const x = c.getContext("2d", {willReadFrequently:true});
      x.drawImage(im, 0, 0);
      let r;
      try { r = cadrePage(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height); }
      catch(e){ r = null; }          /* image d'une autre origine */
      const cale = !!r;
      if(!r) r = {x:0, y:0, w:c.width, h:c.height};
      const d = document.createElement("canvas");
      d.width = Math.min(1100, r.w); d.height = Math.round(d.width * r.h / r.w);
      d.getContext("2d").drawImage(im, r.x, r.y, r.w, r.h, 0, 0, d.width, d.height);
      URL.revokeObjectURL(im.src);
      ok({ url: d.toDataURL("image/jpeg", 0.82), cale: cale,
           rapport: +(r.w / r.h).toFixed(4) });
    };
    im.onerror = () => ko(new Error("image illisible"));
    im.src = URL.createObjectURL(fichier);
  });
}

/* ---------- état ---------- */
/* PLAT[idListe] = { adv, variante, dispo, mode,
                     unites:{ [idUnite]: [{x,y,a}, …] }, decors:[], portees:{} } */
let PLAT = {};
let selection = null;    /* {genre:"unite"|"decor", id, fig} — fig = index de figurine */
let mesure = null;       /* {x0,y0,x,y} pendant un déplacement */

function chargePlat(){
  try{ PLAT = JSON.parse(localStorage.getItem(PKEY) || "{}") || {}; }
  catch(e){ PLAT = {}; }
}
function savePlat(){
  try{ localStorage.setItem(PKEY, JSON.stringify(PLAT)); }catch(e){}
}

/* ---------- la liste en service ----------
   On relit le stockage à chaque affichage plutôt que de garder une
   copie : la liste peut avoir changé pendant qu'on était sur un autre
   axe, et une copie périmée poserait des unités qui n'existent plus. */
function listeEnService(){
  let o = null;
  try{ o = JSON.parse(localStorage.getItem(LKEY) || "null"); }catch(e){ return null; }
  if(!o || !Array.isArray(o.listes) || !o.listes.length) return null;
  return o.listes.find(L => L.id === o.actif) || o.listes[0];
}
function etatDe(L){
  if(!PLAT[L.id]) PLAT[L.id] = { adv:"", variante:"a", dispo:"", mode:"unite",
                                 unites:{}, decors:[], portees:{ mvt:1, charge:1, tir:0 } };
  const p = PLAT[L.id];
  p.unites = p.unites || {}; p.decors = p.decors || [];
  p.mode = p.mode || "unite";
  p.portees = p.portees || { mvt:1, charge:1, tir:0 };
  /* migration : la première version posait un seul jeton par unité */
  if(p.jetons){
    for(const id in p.jetons)
      if(!p.unites[id]) p.unites[id] = { migre:[p.jetons[id].x, p.jetons[id].y] };
    delete p.jetons;
  }
  return p;
}

/* ---------- lecture des tables de data.js ---------- */
const ligneUnite = nom => (typeof SIM !== "undefined" && SIM.unitRow) ? SIM.unitRow(nom)
                        : (typeof UNITS !== "undefined" ? UNITS.find(u => u[0] === nom) : null);
const ligneDetach = nom => (typeof DETACHMENTS !== "undefined")
                        ? DETACHMENTS.find(d => d[0] === nom) : null;
const nomDetachFR = nom => { const d = ligneDetach(nom); return d ? (d[7] || d[0]) : nom; };

function disposDeLaListe(L){
  const out = [];
  (L.detach || []).forEach(n => {
    const d = ligneDetach(n);
    if(d && d[8] && out.indexOf(d[8]) < 0) out.push(d[8]);
  });
  return out;
}
function maDispo(L, p){
  const ch = disposDeLaListe(L);
  if(!ch.length) return "";
  if(ch.indexOf(p.dispo) >= 0) return p.dispo;
  if(L.fd && ch.indexOf(L.fd) >= 0) return L.fd;
  return ch[0];
}

/* Les métiers d'une unité de la liste : ceux qu'on a figés, sinon la
   suggestion du catalogue. Même règle que l'éditeur. */
const rolesDe = ru => Array.isArray(ru.roles) ? ru.roles
                    : ((typeof ROLES_UNITE !== "undefined" && ROLES_UNITE[ru.name]) || []);
function familleDe(ru){
  const k = rolesDe(ru)[0];
  if(!k || typeof ROLES === "undefined") return "Peser";
  const r = ROLES.find(x => x[0] === k);
  return r ? r[2] : "Peser";
}
const COUL = { "Marquer":"var(--cyan)", "Tenir":"var(--green)",
               "Détruire":"var(--alert)", "Peser":"var(--warn)" };

/* ---------- les socles ----------
   SOCLES vient du Base Size Guide de l'Event Companion : un chiffre pour
   un socle rond, deux pour un ovale, « coque » quand le modèle n'a pas
   de socle du tout. */
const COQUE = { w: 4.7, h: 3.1 };   /* faute de socle, une emprise déclarée */
function socle(nom){
  const s = (typeof SOCLES !== "undefined" && SOCLES[nom]) || null;
  if(!s) return { w: 32/MM, h: 32/MM, defaut:true };
  if(s === "coque") return { w: COQUE.w, h: COQUE.h, coque:true };
  const m = /^([\d.]+)(?:x([\d.]+))?$/.exec(s);
  if(!m) return { w: 32/MM, h: 32/MM, defaut:true };
  const w = (+m[1]) / MM;
  return { w: w, h: m[2] ? (+m[2]) / MM : w };
}
/* Rayon moyen : pour mesurer bord à bord entre deux socles dont l'un peut
   être ovale, on prend le rayon moyen. C'est une approximation assumée —
   la mesure exacte dépendrait de l'orientation des deux socles. */
const rayonMoyen = s => (s.w + s.h) / 4;
const socleTexte = nom => {
  const s = (typeof SOCLES !== "undefined" && SOCLES[nom]) || null;
  if(!s) return "socle inconnu";
  if(s === "coque") return "coque";
  return s.indexOf("x") >= 0 ? s + " mm ovale" : s + " mm";
};

/* Les figurines d'une unité de la liste : l'escouade, puis un modèle par
   personnage rattaché — chacun avec son propre socle. */
function figurinesDe(ru){
  const out = [];
  for(let i = 0; i < (ru.size || 1); i++) out.push({ nom: ru.name, chef: false });
  (ru.chars || []).forEach(c => out.push({ nom: c.name, chef: true }));
  return out;
}

const mouvementDe = nom => { const u = ligneUnite(nom); return u ? (+u[1] || 0) : 0; };
function porteeMax(nom){
  if(typeof WEAPONS === "undefined") return 0;
  let mx = 0;
  WEAPONS.forEach(w => {
    if(w[0] !== nom || w[2] !== "T") return;
    const m = String(w[9] || "").match(/(\d+)/);
    if(m) mx = Math.max(mx, +m[1]);
  });
  return mx;
}

/* ---------- quel plateau ----------
   LAYOUTS écrit les Dispositions en majuscules, comme le MFM les
   imprime ; data.js les écrit en capitales initiales. La casse du
   catalogue fait foi partout, on ne monte en majuscules que pour
   interroger les cartes. */
const CLE = s => String(s || "").toUpperCase();

function plateauDe(L, p){
  const mienne = maDispo(L, p);
  if(!mienne) return null;
  const adverse = p.adv || mienne;
  for(const id in LAYOUTS.matchups){
    const m = LAYOUTS.matchups[id];
    const direct  = CLE(m.p1) === CLE(mienne) && CLE(m.p2) === CLE(adverse);
    const inverse = CLE(m.p2) === CLE(mienne) && CLE(m.p1) === CLE(adverse);
    if(!direct && !inverse) continue;
    const v = m.v[p.variante] || m.v.a;
    if(!v) continue;
    return {
      id: id, mienne: mienne, adverse: adverse,
      moi:       direct ? v.z1 : v.z2,
      lui:       direct ? v.z2 : v.z1,
      departMoi: direct ? v.h1 : v.h2,
      departLui: direct ? v.h2 : v.h1,
      objectifs: v.o || [],
      decors:    v.t || [],
      variantes: Object.keys(m.v),
      maMission: LAYOUTS.missions[CLE(mienne) + "|" + CLE(adverse)] || "",
      saMission: LAYOUTS.missions[CLE(adverse) + "|" + CLE(mienne)] || ""
    };
  }
  return null;
}
const DISPOS = ["Take and Hold","Purge the Foe","Disruption","Reconnaissance","Priority Assets"];
const nomDispo = k => (typeof DISPO_FR !== "undefined" && DISPO_FR[k]) ? DISPO_FR[k] : k;

/* ---------- géométrie ---------- */
function dansPolygone(x, y, poly){
  let dedans = false;
  for(let i = 0, j = poly.length - 1; i < poly.length; j = i++){
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if(((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) dedans = !dedans;
  }
  return dedans;
}
const arrondi = v => Math.round(v * 8) / 8;   /* le huitième de pouce : ce qu'on sait mesurer */

/* ---------- la formation en quinconce ----------
   Des rangs décalés d'un demi-pas : c'est ainsi qu'on pose une escouade,
   et c'est ce qui tient dans le moins de place à cohésion égale. Le pas
   se resserre tant que l'unité ne tient pas dans sa prise au sol. */
function quinconce(figs, cx, cy){
  const n = figs.length;
  const d = Math.max.apply(null, figs.map(f => { const s = socle(f.nom); return Math.max(s.w, s.h); }));
  for(const air of [0.35, 0.25, 0.15, 0.08, 0]){
    const pas = d + air;
    const cols = Math.max(1, Math.round(Math.sqrt(n * 1.25)));
    const rangs = Math.ceil(n / cols);
    const larg = (cols - 1) * pas + d;
    const haut = (rangs - 1) * pas * 0.866 + d;
    const out = [];
    for(let i = 0; i < n; i++){
      const r = Math.floor(i / cols), c = i % cols;
      const surLeRang = Math.min(cols, n - r * cols);
      const decal = (r % 2 ? pas / 2 : 0) + (cols - surLeRang) * pas / 2;
      out.push({ x: cx - larg / 2 + c * pas + decal, y: cy - haut / 2 + r * pas * 0.866, a: 0 });
    }
    const mx = out.reduce((s,q) => s + q.x, 0) / n, my = out.reduce((s,q) => s + q.y, 0) / n;
    out.forEach(q => { q.x = arrondi(q.x + cx - mx); q.y = arrondi(q.y + cy - my); });
    /* La prise au sol se mesure, elle ne se devine pas : le décalage d'un
       demi-pas sur les rangs impairs déborde du rectangle théorique. */
    if(air > 0 && priseAuSol(figs, out) > PRISE_MAX) continue;
    return out;
  }
  return [{ x:arrondi(cx), y:arrondi(cy), a:0 }];
}

/* Cohésion : chaque figurine doit être à 2″ bord à bord d'une autre —
   de deux autres dès que l'unité compte sept figurines ou plus. */
function cohesion(figs, pos){
  if(pos.length <= 1) return { isolees: [], exige: 0 };   /* seule, elle l'est par définition */
  const r = figs.map(f => rayonMoyen(socle(f.nom)));
  const exige = figs.length >= 7 ? 2 : 1;
  const isolees = [];
  for(let i = 0; i < pos.length; i++){
    let voisins = 0;
    for(let j = 0; j < pos.length; j++){
      if(i === j) continue;
      const bord = Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y) - r[i] - r[j];
      if(bord <= COHESION) voisins++;
    }
    if(voisins < exige) isolees.push(i);
  }
  return { isolees: isolees, exige: exige };
}
/* Prise au sol : la plus grande distance entre deux socles, bords compris. */
function priseAuSol(figs, pos){
  const r = figs.map(f => rayonMoyen(socle(f.nom)));
  if(pos.length === 1) return r[0] * 2;
  let mx = 0;
  for(let i = 0; i < pos.length; i++)
    for(let j = i + 1; j < pos.length; j++)
      mx = Math.max(mx, Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y) + r[i] + r[j]);
  return mx;
}
const centreDe = pos => ({ x: pos.reduce((s,q)=>s+q.x,0)/pos.length,
                           y: pos.reduce((s,q)=>s+q.y,0)/pos.length });

/* Une place libre dans la zone : le centre de gravité s'il est libre,
   sinon en spirale jusqu'à ne plus chevaucher une unité déjà posée. */
function placeLibre(L, p, bd, ru){
  const figs = figurinesDe(ru);
  const rayon = priseAuSol(figs, quinconce(figs, 0, 0)) / 2;
  const zone = bd && bd.moi ? bd.moi : null;
  const pris = [];
  for(const id in p.unites){
    const autre = (L.units || []).find(u => String(u.id) === String(id));
    const pos = p.unites[id];
    if(!autre || !Array.isArray(pos) || !pos.length) continue;
    const c = centreDe(pos);
    pris.push({ x:c.x, y:c.y, r: priseAuSol(figurinesDe(autre), pos) / 2 });
  }
  let cx = W / 2, cy = H - 8;
  if(zone){
    cx = zone.reduce((s,q) => s + q[0], 0) / zone.length;
    cy = zone.reduce((s,q) => s + q[1], 0) / zone.length;
  }
  const ok = (px,py) => (!zone || dansPolygone(px, py, zone)) &&
    px > rayon && px < W - rayon && py > rayon && py < H - rayon &&
    !pris.some(t => Math.hypot(t.x - px, t.y - py) < t.r + rayon + 0.6);
  if(ok(cx, cy)) return quinconce(figs, cx, cy);
  for(let anneau = 1; anneau < 40; anneau++){
    for(let a = 0; a < 16; a++){
      const ang = a * Math.PI / 8, dd = anneau * 1.8;
      const px = cx + Math.cos(ang) * dd, py = cy + Math.sin(ang) * dd;
      if(ok(px, py)) return quinconce(figs, px, py);
    }
  }
  return quinconce(figs, cx, cy);
}

/* positions d'une unité, créées au besoin — en reprenant le point de
   l'ancienne version quand il y en avait un */
function posDe(L, p, bd, ru){
  let pos = p.unites[ru.id];
  if(Array.isArray(pos) && pos.length) return pos;
  pos = (pos && pos.migre) ? quinconce(figurinesDe(ru), pos.migre[0], pos.migre[1])
                           : placeLibre(L, p, bd, ru);
  p.unites[ru.id] = pos;
  return pos;
}
const estPosee = (p, ru) => Array.isArray(p.unites[ru.id]) && p.unites[ru.id].length > 0;

const DECORS = [
  { t:"L", n:"Ruine 7 × 11,5\"",     w:7,  h:11.5 },
  { t:"T", n:"Ruine 8 × 11,5\"",     w:8,  h:11.5 },
  { t:"M", n:"Ruine 6 × 4\"",        w:6,  h:4 },
  { t:"D", n:"Barricade 10 × 2,5\"", w:10, h:2.5 },
  { t:"S", n:"Barricade 6 × 2\"",    w:6,  h:2 }
];

/* ---------- rendu ---------- */
const esc = s => String(s == null ? "" : s)
  .replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const pouces = v => (Math.round(v * 10) / 10).toString().replace(".", ",") + "″";

function svgEl(tag, attrs, txt){
  const e = document.createElementNS(NS, tag);
  for(const k in attrs) e.setAttribute(k, attrs[k]);
  if(txt != null) e.textContent = txt;
  return e;
}
const chemin = poly => poly.map(q => DX(q[0],q[1]) + "," + DY(q[0],q[1])).join(" ");

function iconeObjectif(g, genre, coul){
  if(genre === "depart"){
    g.appendChild(svgEl("rect", {x:-0.95, y:-0.95, width:1.9, height:1.9, rx:0.35, fill:coul}));
    g.appendChild(svgEl("rect", {x:-0.32, y:-0.15, width:0.64, height:1.1, fill:"var(--s1)"}));
  } else if(genre === "centre"){
    g.appendChild(svgEl("circle", {cx:0, cy:0, r:1.1, fill:coul}));
    g.appendChild(svgEl("circle", {cx:0, cy:0, r:0.44, fill:"var(--s1)"}));
  } else {
    g.appendChild(svgEl("path", {d:"M -0.85 1 L -0.85 -1 L 1 -0.35 L -0.85 0.3 Z", fill:coul}));
  }
}

function dessine(L, p, bd){
  const svg = el("mapSvg");
  svg.setAttribute("viewBox", VUE());
  if(!svg) return;
  svg.innerHTML = "";

  svg.appendChild(svgEl("rect", {x:0, y:0, width:H, height:W, fill:"var(--s2)"}));

  /* Le fond de carte, sous tout le reste. Il est range en portrait,
     comme la donnee ; couche, on le fait pivoter d'un quart de tour
     autour du coin, exactement comme la geometrie. */
  const cleFond = fondCle(p, bd);
  const fond = fondCache[cleFond] || { url: carteLivree(cleFond), cale: true, livre: true };
  if(fond && p.fondVu !== false){
    const g = svgEl("g", {opacity: (p.fondOp == null ? 55 : p.fondOp) / 100});
    const im = svgEl("image", {width: W, height: H, preserveAspectRatio:"none",
                               transform: debout ? "" : "translate(0 " + W + ") rotate(-90)"});
    im.setAttributeNS("http://www.w3.org/1999/xlink", "href", fond.url);
    im.setAttribute("href", fond.url);
    g.appendChild(im);
    svg.appendChild(g);
  }
  const surFond = p.fondVu !== false;
  const fine = svgEl("g", {stroke:"var(--line-soft)", "stroke-width":0.03,
                           "stroke-opacity": surFond ? 0 : 0.9});
  for(let v = 1; v < H; v++) if(v % 6) fine.appendChild(svgEl("line", {x1:v, y1:0, x2:v, y2:W}));
  for(let v = 1; v < W; v++) if(v % 6) fine.appendChild(svgEl("line", {x1:0, y1:v, x2:H, y2:v}));
  svg.appendChild(fine);
  const gros = svgEl("g", {stroke:"var(--line)", "stroke-width":0.07,
                           "stroke-opacity": surFond ? 0 : 0.9});
  for(let v = 6; v < H; v += 6) gros.appendChild(svgEl("line", {x1:v, y1:0, x2:v, y2:W}));
  for(let v = 6; v < W; v += 6) gros.appendChild(svgEl("line", {x1:0, y1:v, x2:H, y2:v}));
  svg.appendChild(gros);

  if(bd.lui) svg.appendChild(svgEl("polygon", {points:chemin(bd.lui), fill:"var(--alert)",
    "fill-opacity":0.13, stroke:"var(--alert)", "stroke-width":0.16, "stroke-opacity":0.85}));
  if(bd.moi) svg.appendChild(svgEl("polygon", {points:chemin(bd.moi), fill:"var(--cyan)",
    "fill-opacity":0.13, stroke:"var(--cyan)", "stroke-width":0.16, "stroke-opacity":0.9}));
  const etiquette = (z, coul, txt) => {
    if(!z || !z.length) return;
    const cx = z.reduce((s,q)=>s+q[0],0)/z.length, cy = z.reduce((s,q)=>s+q[1],0)/z.length;
    svg.appendChild(svgEl("text", {x:DX(cx,cy), y:DY(cx,cy), "text-anchor":"middle",
      "font-size":2.1, fill:coul, "fill-opacity":0.42, "letter-spacing":0.32}, txt));
  };
  etiquette(bd.lui, "var(--alert)", "ADVERSAIRE");
  etiquette(bd.moi, "var(--cyan)", "TOI");

  (bd.decors || []).forEach(t => {
    const b = t.b;
    const g = svgEl("g", {transform:"translate(" + DX(b[0],b[1]) + " " + DY(b[0],b[1]) +
                                   ") rotate(" + (b[4] + ROT()) + ")"});
    g.appendChild(svgEl("rect", {x:-b[2]/2, y:-b[3]/2, width:b[2], height:b[3], rx:0.25,
      fill:"var(--s3)", stroke:"var(--line-hi)", "stroke-width":0.1}));
    svg.appendChild(g);
    (t.w || []).forEach(q => svg.appendChild(svgEl("polygon", {points:chemin(q),
      fill:"var(--green)", "fill-opacity":0.9})));
    (t.o || []).forEach(q => svg.appendChild(svgEl("polygon", {points:chemin(q),
      fill:"var(--warn)", "fill-opacity":0.9})));
  });

  (p.decors || []).forEach(d => {
    const spec = DECORS.find(s => s.t === d.t); if(!spec) return;
    const on = selection && selection.genre === "decor" && selection.id === d.id;
    const g = svgEl("g", {transform:"translate(" + DX(d.x,d.y) + " " + DY(d.x,d.y) +
                                    ") rotate(" + ((d.r||0) + ROT()) + ")",
                          "data-decor":d.id, style:"cursor:move"});
    g.appendChild(svgEl("rect", {x:-spec.w/2, y:-spec.h/2, width:spec.w, height:spec.h, rx:0.2,
      fill:"var(--s3)", stroke: on ? "var(--glow)" : "var(--line-hi)",
      "stroke-width": on ? 0.24 : 0.1, "stroke-dasharray": on ? "" : "0.5 0.35"}));
    svg.appendChild(g);
  });

  const pose = (o, genre, coul) => {
    svg.appendChild(svgEl("circle", {cx:DX(o[0],o[1]), cy:DY(o[0],o[1]), r:3, fill:"none",
      stroke:coul, "stroke-width":0.08, "stroke-opacity":0.55, "stroke-dasharray":"0.6 0.5"}));
    svg.appendChild(svgEl("circle", {cx:DX(o[0],o[1]), cy:DY(o[0],o[1]), r:1.55,
      fill:"var(--s1)", stroke:coul, "stroke-width":0.16}));
    const g = svgEl("g", {transform:"translate(" + DX(o[0],o[1]) + " " + DY(o[0],o[1]) + ")"});
    iconeObjectif(g, genre, coul);
    svg.appendChild(g);
  };
  (bd.objectifs || []).forEach(o => {
    const centre = Math.abs(o[0] - W/2) < 3.5 && Math.abs(o[1] - H/2) < 3.5;
    pose(o, centre ? "centre" : "nml", centre ? "var(--glow)" : "var(--green)");
  });
  (bd.departLui || []).forEach(o => pose(o, "depart", "var(--alert)"));
  (bd.departMoi || []).forEach(o => pose(o, "depart", "var(--cyan)"));

  /* ---- les figurines ---- */
  (L.units || []).forEach(ru => {
    if(!estPosee(p, ru)) return;
    const pos = p.unites[ru.id], figs = figurinesDe(ru);
    const on = selection && selection.genre === "unite" && String(selection.id) === String(ru.id);
    const coul = COUL[familleDe(ru)] || "var(--warn)";
    const coh = on ? cohesion(figs, pos) : null;
    const c = centreDe(pos), rayon = priseAuSol(figs, pos) / 2;

    if(on){
      const M = mouvementDe(ru.name), anneaux = [];
      if(p.portees.mvt)    anneaux.push([M, "var(--cyan)"]);
      if(p.portees.charge) anneaux.push([M + 7, "var(--alert)"]);   /* 2D6 moyen */
      if(p.portees.tir && porteeMax(ru.name)) anneaux.push([M + porteeMax(ru.name), "var(--glow)"]);
      anneaux.forEach(a => { if(a[0] > 0) svg.appendChild(svgEl("circle",
        {cx:DX(c.x,c.y), cy:DY(c.x,c.y), r:a[0] + rayon, fill:"none", stroke:a[1],
         "stroke-width":0.17, "stroke-dasharray":"0.9 0.7", "stroke-opacity":0.9})); });
    }

    pos.forEach((q, i) => {
      const f = figs[i] || figs[figs.length - 1];
      const s = socle(f.nom);
      const sel = on && selection.fig === i;
      const isolee = coh && coh.isolees.indexOf(i) >= 0;
      const g = svgEl("g", {transform:"translate(" + DX(q.x,q.y) + " " + DY(q.x,q.y) +
                            ") rotate(" + ((q.a || 0) + ROT()) + ")",
                            "data-unite":ru.id, "data-fig":i, style:"cursor:move"});
      g.appendChild(svgEl("ellipse", {cx:0, cy:0, rx:s.w/2, ry:s.h/2,
        fill:coul, "fill-opacity": f.chef ? 0.62 : 0.42,
        stroke: isolee ? "var(--alert)" : (sel ? "var(--glow)" : coul),
        "stroke-width": (sel || isolee) ? 0.16 : 0.09}));
      if(f.chef) g.appendChild(svgEl("circle", {cx:0, cy:0, r:Math.min(s.w,s.h)/5,
        fill:"var(--s1)", "fill-opacity":0.9}));
      svg.appendChild(g);
    });

    if(on){
      const nom = ru.name.length > 20 ? ru.name.slice(0,19) + "…" : ru.name;
      svg.appendChild(svgEl("text", {x:DX(c.x,c.y), y:DY(c.x,c.y) + rayon + 1.6,
        "text-anchor":"middle", "font-size":1.5, fill:"var(--tx)",
        "paint-order":"stroke", stroke:"var(--s2)", "stroke-width":0.55}, nom));
    }
  });

  /* ---- le ruban de mesure ----
     Un déplacement se juge en pouces, pas à l'œil : le trait part du
     point de départ et porte la distance. */
  if(mesure){
    const d = Math.hypot(mesure.x - mesure.x0, mesure.y - mesure.y0);
    svg.appendChild(svgEl("line", {x1:DX(mesure.x0,mesure.y0), y1:DY(mesure.x0,mesure.y0),
      x2:DX(mesure.x,mesure.y), y2:DY(mesure.x,mesure.y),
      stroke:"var(--glow)", "stroke-width":0.14, "stroke-dasharray":"0.5 0.4"}));
    svg.appendChild(svgEl("circle", {cx:DX(mesure.x0,mesure.y0), cy:DY(mesure.x0,mesure.y0),
      r:0.35, fill:"var(--glow)"}));
    if(d > 0.2) svg.appendChild(svgEl("text", {
      x:(DX(mesure.x0,mesure.y0) + DX(mesure.x,mesure.y)) / 2,
      y:(DY(mesure.x0,mesure.y0) + DY(mesure.x,mesure.y)) / 2 - 0.7,
      "text-anchor":"middle", "font-size":1.9, fill:"var(--glow)",
      "paint-order":"stroke", stroke:"var(--s2)", "stroke-width":0.7}, pouces(d)));
  }
}

/* ---------- l'écran ---------- */
function renderMap(){
  chargePlat();
  const hote = el("mapBody");
  if(!hote) return;
  const L = listeEnService();
  if(!L){
    hote.innerHTML = '<div class="card"><h2>Aucune liste</h2><div class="body">' +
      '<p class="hint" style="margin-top:2px">Crée une liste dans l\'axe Listes : ' +
      'c\'est elle qui donne la Disposition et les figurines à poser.</p></div></div>';
    return;
  }
  const p = etatDe(L);
  const choix = disposDeLaListe(L);
  if(!choix.length){
    hote.innerHTML = '<div class="card"><h2>' + esc(L.nom) + '</h2><div class="body">' +
      '<p class="hint" style="margin-top:2px">Cette liste n\'a pas encore de détachement. ' +
      'La Disposition de Force vient du détachement, et c\'est elle qui décide du plateau.</p>' +
      '</div></div>';
    return;
  }
  if(!p.adv) p.adv = maDispo(L, p);
  const bd = plateauDe(L, p);
  if(!bd){
    hote.innerHTML = '<div class="card"><h2>Plateau introuvable</h2><div class="body">' +
      '<p class="hint">Aucune carte pour ce croisement.</p></div></div>';
    return;
  }

  const aPoser = (L.units || []).map(ru => {
    const posee = estPosee(p, ru);
    const on = selection && selection.genre === "unite" && String(selection.id) === String(ru.id);
    const figs = figurinesDe(ru);
    const socles = [socleTexte(ru.name)].concat((ru.chars || []).map(c => socleTexte(c.name)));
    return '<button type="button" class="opt' + (on ? " sel" : "") + '" data-pose="' + ru.id + '">' +
      '<span class="oi"><span class="o1">' +
        '<span class="pastille" style="background:' + (COUL[familleDe(ru)] || "var(--warn)") + '"></span>' +
        esc(ru.name) + '</span>' +
      '<span class="o2">' + figs.length + ' fig. · ' + esc(socles.join(" + ")) +
        ' · M ' + mouvementDe(ru.name) + '″</span></span>' +
      '<span class="otag">' + (posee ? "POSÉE" : "À POSER") + '</span></button>';
  }).join("") || '<div class="hint">Cette liste ne contient aucune unité.</div>';

  hote.innerHTML =
  '<div class="card">' +
    '<h2>Scénario</h2>' +
    '<div class="body">' +
      '<div class="kv"><span>Ta Disposition</span><b>' + esc(nomDispo(bd.mienne)) + '</b></div>' +
      (choix.length > 1
        ? '<div class="chips" id="mapMine">' + choix.map(k =>
            '<button type="button" class="chip' + (k === bd.mienne ? " on" : "") +
            '" data-mine="' + esc(k) + '">' + esc(nomDispo(k)) + '</button>').join("") + '</div>'
        : '') +
      '<div class="kv" style="margin-top:2px"><span>En face</span><b>' + esc(nomDispo(bd.adverse)) + '</b></div>' +
      '<div class="chips" id="mapAdv">' + DISPOS.map(k =>
        '<button type="button" class="chip' + (k === bd.adverse ? " on" : "") +
        '" data-adv="' + esc(k) + '">' + esc(nomDispo(k)) + '</button>').join("") + '</div>' +
      '<div class="kv"><span>Ta mission</span><b>' + esc(bd.maMission || "—") + '</b></div>' +
      '<div class="kv"><span>La sienne</span><b>' + esc(bd.saMission || "—") + '</b></div>' +
      '<div class="chips" id="mapVar">' + bd.variantes.map(v =>
        '<button type="button" class="chip' + (v === (p.variante || "a") ? " on" : "") +
        '" data-var="' + v + '">Layout ' + v.toUpperCase() + '</button>').join("") + '</div>' +
      '<p class="hint">Le croisement des deux Dispositions impose la carte, et chaque appariement ' +
      'en propose trois. Les détachements de ' + esc(L.nom) + ' : ' +
      esc((L.detach || []).map(nomDetachFR).join(" · ") || "aucun") + '.</p>' +
    '</div>' +
  '</div>' +

  '<div class="card">' +
    '<h2>Le plateau' +
      '<button type="button" id="mapOrient" class="minibtn" aria-pressed="' +
        (debout ? "true" : "false") + '" title="' +
        (debout ? "Coucher le plateau pour mieux le voir sur un téléphone"
                : "Redresser le plateau dans le sens de la carte officielle") + '">' +
        (debout ? "Coucher" : "Redresser") + '</button>' +
    '</h2>' +
    '<div class="body">' +
      '<svg id="mapSvg" role="img" aria-label="Plateau de jeu"></svg>' +
      '<div class="maplg">' +
        '<span><i style="background:var(--cyan)"></i>Ta zone</span>' +
        '<span><i style="background:var(--alert)"></i>Sa zone</span>' +
        '<span><i style="background:var(--glow);border-radius:50%"></i>Objectif central</span>' +
        '<span><i style="background:var(--green)"></i>No man\'s land</span>' +
        /* Les decors ne sont plus des contours reconstruits mais les
           gabarits officiels : le vert est l'emprise de jeu du decor,
           celle qu'on mesure, et le brun les elements qui la garnissent. */
        '<span><i style="background:var(--s3);border:1px solid var(--line-hi)"></i>Socle</span>' +
        '<span><i style="background:var(--green)"></i>Emprise du décor</span>' +
        '<span><i style="background:var(--warn)"></i>Ruines</span>' +
      '</div>' +
      '<p class="hint" id="mapHud">Touche une unité pour la poser, glisse-la pour l\'ajuster.</p>' +
    '</div>' +
  '</div>' +

  '<div class="card' + (p.fondOuvert ? '' : ' collapsed') + '" id="mapCardFond">' +
    '<h2>Fond de carte <span class="chev">▾</span></h2>' +
    '<div class="body">' +
      '<p class="hint" style="margin:2px 0 8px">La page officielle de cet agencement, posée ' +
      'sous la géométrie. Charge la tienne si tu en as un meilleur tirage — elle restera dans ' +
      'ce navigateur, et « Reprendre celle d\'origine » revient à l\'image livrée.</p>' +
      '<div class="seg" style="justify-content:flex-start">' +
        '<button type="button" id="fondVoir" aria-pressed="' + (p.fondVu !== false) + '">' +
          (p.fondVu !== false ? 'Masquer' : 'Afficher') + '</button>' +
        '<button type="button" id="fondChoisir">Charger la mienne…</button>' +
        (fondCache[fondCle(p, bd)]
          ? '<button type="button" id="fondOter">Reprendre celle d\'origine</button>' : '') +
      '</div>' +
      '<input type="file" id="fondFichier" accept="image/*" hidden>' +
      '<label style="display:block;margin-top:10px">Opacité ' +
        '<b id="fondVal">' + (p.fondOp == null ? 55 : p.fondOp) + ' %</b>' +
        '<input type="range" id="fondOp" min="10" max="100" step="5" style="width:100%" ' +
          'value="' + (p.fondOp == null ? 55 : p.fondOp) + '"></label>' +
      (fondCache[fondCle(p, bd)]
        ? (fondCache[fondCle(p, bd)].cale ? '<p class="hint">Ton image, recadrée sur le plateau.</p>'
           : '<p class="hint" style="color:var(--warn-tx)">Le cadre du plateau n\'a pas été ' +
             'reconnu sur ton image : elle est posée telle quelle, le calage peut être faux.</p>')
        : '<p class="hint">Image livrée avec l\'application.</p>') +
    '</div>' +
  '</div>' +

  '<div class="card">' +
    '<h2>Déplacer</h2>' +
    '<div class="body">' +
      '<p class="hint" style="margin:2px 0 8px">La distance parcourue depuis le point de départ ' +
      's\'affiche sur le plateau pendant le geste, et se compare au mouvement de l\'unité.</p>' +
      '<div class="seg" style="justify-content:flex-start">' +
        '<button type="button" data-mode="unite" aria-pressed="' + (p.mode === "unite" ? "true" : "false") + '">L\'unité entière</button>' +
        '<button type="button" data-mode="figurine" aria-pressed="' + (p.mode === "figurine" ? "true" : "false") + '">Une figurine</button>' +
      '</div>' +
      '<div class="seg" style="justify-content:flex-start;margin-top:8px">' +
        '<button type="button" id="mapReforme">Reformer en quinconce</button>' +
      '</div>' +
      '<p class="hint">Cohésion : ' + COHESION + '″ bord à bord d\'une figurine à sa voisine — de deux ' +
      'voisines dès sept figurines. Une figurine isolée se cerne de rouge. La prise au sol de ' +
      'l\'unité est signalée au-delà de ' + PRISE_MAX + '″.</p>' +
    '</div>' +
  '</div>' +

  '<div class="card">' +
    '<h2>Portées de menace</h2>' +
    '<div class="body">' +
      '<p class="hint" style="margin:2px 0 8px">Sur l\'unité sélectionnée, depuis le bord de sa prise ' +
      'au sol. La charge compte 7″, la moyenne de 2D6 — ce n\'est pas une garantie.</p>' +
      '<div class="seg" style="justify-content:flex-start">' +
        '<button type="button" data-portee="mvt" aria-pressed="' + (p.portees.mvt ? "true" : "false") + '">Mouvement</button>' +
        '<button type="button" data-portee="charge" aria-pressed="' + (p.portees.charge ? "true" : "false") + '">Mvt + charge</button>' +
        '<button type="button" data-portee="tir" aria-pressed="' + (p.portees.tir ? "true" : "false") + '">Mvt + tir</button>' +
      '</div>' +
    '</div>' +
  '</div>' +

  '<div class="card">' +
    '<h2>Mes unités</h2>' +
    '<div class="body"><div class="sheet-list" style="padding:0;max-height:none">' + aPoser + '</div></div>' +
  '</div>' +

  '<div class="card' + (p.decorOuvert ? '' : ' collapsed') + '" id="mapCardDecor">' +
    '<h2>Ajouter un décor <span class="chev">▾</span></h2>' +
    '<div class="body">' +
      '<p class="hint" style="margin:2px 0 8px">Le décor officiel est déjà posé. Ces pièces — les ' +
      'cinq empreintes du pack de terrain — servent à le corriger ou à éprouver une autre table. ' +
      '« Pivoter » sert aussi à orienter un socle ovale.</p>' +
      '<div class="seg" style="justify-content:flex-start">' +
        DECORS.map(d => '<button type="button" data-decor-add="' + d.t + '">' + esc(d.n) + '</button>').join("") +
      '</div>' +
      '<div class="seg" style="justify-content:flex-start;margin-top:8px">' +
        '<button type="button" id="mapRot">Pivoter 15°</button>' +
        '<button type="button" id="mapRot90">Pivoter 90°</button>' +
        '<button type="button" id="mapDel">Retirer</button>' +
        '<button type="button" id="mapClear">Tout effacer</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* Le fond vient d'IndexedDB, donc apres coup. On ne le lit qu'une fois
     par agencement : la reponse, meme vide, reste en cache pour ne pas
     redessiner en boucle. */
  const cleF = fondCle(p, bd);
  if(!(cleF in fondCache)){
    fondCache[cleF] = null;
    fondLit(cleF).then(img => {
      if(!img) return;
      fondCache[cleF] = img;
      renderMap();          /* la cle est deja en cache : pas de boucle */
    }).catch(e => console.warn("fond de carte illisible :", e));
  }

  branche(L, p, bd);
  dessine(L, p, bd);
  majHud(L, p, bd);
}

/* Ce que dit le bandeau sous le plateau : pendant un geste la distance,
   au repos l'état de l'unité sélectionnée. */
function majHud(L, p, bd){
  const h = el("mapHud"); if(!h) return;
  if(mesure && selection){
    const d = Math.hypot(mesure.x - mesure.x0, mesure.y - mesure.y0);
    const ru = (L.units || []).find(u => String(u.id) === String(selection.id));
    const M = ru ? mouvementDe(ru.name) : 0;
    const trop = M && d > M;
    h.innerHTML = '<b style="font-size:15px">' + pouces(d) + '</b> parcourus' +
      (M ? ' · mouvement ' + M + '″ · <b style="color:' +
           (trop ? "var(--alert)" : "var(--green)") + '">' +
           (trop ? "dépassé de " + pouces(d - M) : "il reste " + pouces(M - d)) + '</b>' : '');
    return;
  }
  if(selection && selection.genre === "unite"){
    const ru = (L.units || []).find(u => String(u.id) === String(selection.id));
    const pos = ru ? p.unites[ru.id] : null;
    if(ru && pos && pos.length){
      const figs = figurinesDe(ru);
      const coh = cohesion(figs, pos), prise = priseAuSol(figs, pos);
      const dedans = bd.moi ? pos.every(q => dansPolygone(q.x, q.y, bd.moi)) : true;
      const partiel = bd.moi ? pos.some(q => dansPolygone(q.x, q.y, bd.moi)) : true;
      h.innerHTML = esc(ru.name) + ' · ' + figs.length + ' fig. · M ' + mouvementDe(ru.name) + '″' +
        ' · prise au sol <b style="color:' + (prise > PRISE_MAX ? "var(--alert)" : "var(--tx2)") + '">' +
        pouces(prise) + '</b>' +
        ' · cohésion <b style="color:' + (coh.isolees.length ? "var(--alert)" : "var(--green)") + '">' +
        (coh.isolees.length ? coh.isolees.length + ' isolée' + (coh.isolees.length > 1 ? 's' : '')
                            : 'bonne') + '</b>' +
        ' · <b style="color:' + (dedans ? "var(--green)" : "var(--alert)") + '">' +
        (dedans ? "toute dans ta zone" : partiel ? "à cheval sur ta zone" : "hors de ta zone") + '</b>';
      return;
    }
  }
  if(selection && selection.genre === "decor"){
    h.textContent = "Décor sélectionné — pivote-le ou retire-le depuis le panneau du bas.";
    return;
  }
  h.textContent = "Touche une unité pour la poser, glisse-la pour l'ajuster.";
}

/* ---------- interactions ---------- */
function branche(L, p, bd){
  const hote = el("mapBody");

  /* L'orientation ne touche pas la partie : c'est une préférence
     d'affichage, gardée hors de l'état de plateau. */
  const fc = el("fondChoisir"), ff = el("fondFichier");
  if(fc && ff){
    fc.addEventListener("click", ()=> ff.click());
    ff.addEventListener("change", ()=>{
      const f = ff.files && ff.files[0];
      if(!f) return;
      fc.disabled = true; fc.textContent = "Lecture…";
      fondPrepare(f).then(img => {
        const cle = fondCle(p, bd);
        fondCache[cle] = img;
        return fondEcrit(cle, img);
      }).then(()=>{ p.fondOuvert = true; p.fondVu = true; savePlat(); renderMap(); })
        .catch(()=>{ fc.disabled = false; fc.textContent = "Charger une image…";
                     alert("Cette image n'a pas pu être lue."); });
    });
  }
  const fv = el("fondVoir");
  if(fv) fv.addEventListener("click", ()=>{
    p.fondVu = p.fondVu === false; savePlat(); renderMap();
  });
  const fo = el("fondOter");
  if(fo) fo.addEventListener("click", ()=>{
    if(!confirm("Retirer le fond de cet agencement ?")) return;
    const cle = fondCle(p, bd);
    delete fondCache[cle];
    fondEcrit(cle, null).then(()=>{ savePlat(); renderMap(); });
  });
  const fop = el("fondOp");
  if(fop) fop.addEventListener("input", ()=>{
    p.fondOp = +fop.value;
    const v = el("fondVal"); if(v) v.textContent = p.fondOp + " %";
    const g = el("mapSvg") && el("mapSvg").firstChild;
    const im = el("mapSvg") && el("mapSvg").querySelector("image");
    if(im && im.parentNode) im.parentNode.setAttribute("opacity", p.fondOp / 100);
    savePlat();
  });

  const bo = el("mapOrient");
  if(bo) bo.addEventListener("click", ()=>{
    debout = !debout;
    try { localStorage.setItem(ORIENT, debout ? "1" : "0"); } catch(e){ /* tant pis */ }
    renderMap();
  });

  hote.querySelectorAll("[data-mine]").forEach(b => b.addEventListener("click", ()=>{
    p.dispo = b.dataset.mine; selection = null; savePlat(); renderMap();
  }));
  hote.querySelectorAll("[data-adv]").forEach(b => b.addEventListener("click", ()=>{
    p.adv = b.dataset.adv; selection = null; savePlat(); renderMap();
  }));
  hote.querySelectorAll("[data-var]").forEach(b => b.addEventListener("click", ()=>{
    p.variante = b.dataset.var; selection = null; savePlat(); renderMap();
  }));
  hote.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", ()=>{
    p.mode = b.dataset.mode; savePlat(); renderMap();
  }));
  hote.querySelectorAll("[data-portee]").forEach(b => b.addEventListener("click", ()=>{
    p.portees[b.dataset.portee] = p.portees[b.dataset.portee] ? 0 : 1;
    savePlat(); renderMap();
  }));
  hote.querySelectorAll("[data-pose]").forEach(b => b.addEventListener("click", ()=>{
    const id = b.dataset.pose;
    const ru = (L.units || []).find(u => String(u.id) === String(id));
    if(!ru) return;
    posDe(L, p, bd, ru);
    selection = { genre:"unite", id:id, fig:-1 };
    savePlat(); renderMap();
  }));
  const reforme = el("mapReforme");
  if(reforme) reforme.addEventListener("click", ()=>{
    if(!selection || selection.genre !== "unite") return;
    const ru = (L.units || []).find(u => String(u.id) === String(selection.id));
    const pos = ru && p.unites[ru.id]; if(!pos || !pos.length) return;
    const c = centreDe(pos);
    p.unites[ru.id] = quinconce(figurinesDe(ru), c.x, c.y);
    savePlat(); dessine(L, p, bd); majHud(L, p, bd);
  });

  hote.querySelectorAll("[data-decor-add]").forEach(b => b.addEventListener("click", ()=>{
    const id = "d" + Date.now().toString(36);
    p.decors.push({ id:id, t:b.dataset.decorAdd, x:W/2, y:H/2, r:0 });
    selection = { genre:"decor", id:id };
    p.decorOuvert = true;
    savePlat(); renderMap();
  }));
  /* Pivoter sert au décor, et à une figurine sur socle ovale : un socle
     volant ne se pose pas dans n'importe quel sens. */
  const pivote = deg => {
    if(!selection) return;
    if(selection.genre === "decor"){
      const d = p.decors.find(x => x.id === selection.id); if(!d) return;
      d.r = ((d.r || 0) + deg) % 360;
    } else {
      const pos = p.unites[selection.id]; if(!pos) return;
      if(selection.fig >= 0 && pos[selection.fig])
        pos[selection.fig].a = ((pos[selection.fig].a || 0) + deg) % 360;
      else pos.forEach(q => q.a = ((q.a || 0) + deg) % 360);
    }
    savePlat(); dessine(L, p, bd);
  };
  if(el("mapRot"))   el("mapRot").addEventListener("click", ()=> pivote(15));
  if(el("mapRot90")) el("mapRot90").addEventListener("click", ()=> pivote(90));
  if(el("mapDel"))   el("mapDel").addEventListener("click", ()=>{
    if(!selection) return;
    if(selection.genre === "decor") p.decors = p.decors.filter(x => x.id !== selection.id);
    else delete p.unites[selection.id];
    selection = null; savePlat(); renderMap();
  });
  if(el("mapClear")) el("mapClear").addEventListener("click", ()=>{
    if(!confirm("Retirer toutes les unités posées et les décors ajoutés ?")) return;
    p.unites = {}; p.decors = []; selection = null; savePlat(); renderMap();
  });

  /* Glissement au doigt comme à la souris : Pointer Events, comme le
     pavé de l'éditeur. L'API drag-and-drop du HTML n'existe pas sur
     mobile, et c'est au doigt qu'on pose une armée. */
  const svg = el("mapSvg");
  let glisse = null;
  const pointSvg = ev => {
    const q = svg.createSVGPoint();
    q.x = ev.clientX; q.y = ev.clientY;
    return q.matrixTransform(svg.getScreenCTM().inverse());
  };

  svg.addEventListener("pointerdown", ev => {
    const u = ev.target.closest("[data-unite]"), d = ev.target.closest("[data-decor]");
    if(u) selection = { genre:"unite", id:u.getAttribute("data-unite"),
                        fig:+u.getAttribute("data-fig") };
    else if(d) selection = { genre:"decor", id:d.getAttribute("data-decor") };
    else { selection = null; mesure = null; dessine(L, p, bd); majHud(L, p, bd); majListe(); return; }

    const pt = pointSvg(ev), b = versPlateau(pt.x, pt.y);
    if(selection.genre === "decor"){
      const o = p.decors.find(x => x.id === selection.id); if(!o){ selection = null; return; }
      glisse = { genre:"decor", dx: b.x - o.x, dy: b.y - o.y };
      mesure = { x0:o.x, y0:o.y, x:o.x, y:o.y };
    } else {
      const pos = p.unites[selection.id]; if(!pos || !pos.length){ selection = null; return; }
      const unitaire = p.mode === "figurine";
      const ref = unitaire ? pos[selection.fig] : centreDe(pos);
      if(!ref){ selection = null; return; }
      glisse = { genre:"unite", unitaire: unitaire, dx: b.x - ref.x, dy: b.y - ref.y,
                 depart: pos.map(q => ({ x:q.x, y:q.y })) };
      mesure = { x0:ref.x, y0:ref.y, x:ref.x, y:ref.y };
    }
    svg.setPointerCapture(ev.pointerId);
    dessine(L, p, bd); majHud(L, p, bd); majListe();
  });

  svg.addEventListener("pointermove", ev => {
    if(!glisse || !selection) return;
    const pt = pointSvg(ev), b = versPlateau(pt.x, pt.y);
    const nx = arrondi(Math.max(0, Math.min(W, b.x - glisse.dx)));
    const ny = arrondi(Math.max(0, Math.min(H, b.y - glisse.dy)));
    if(glisse.genre === "decor"){
      const o = p.decors.find(x => x.id === selection.id); if(!o) return;
      o.x = nx; o.y = ny;
    } else {
      const pos = p.unites[selection.id]; if(!pos) return;
      if(glisse.unitaire){
        pos[selection.fig].x = nx; pos[selection.fig].y = ny;
      } else {
        const ddx = nx - mesure.x0, ddy = ny - mesure.y0;
        pos.forEach((q, i) => {
          q.x = arrondi(Math.max(0, Math.min(W, glisse.depart[i].x + ddx)));
          q.y = arrondi(Math.max(0, Math.min(H, glisse.depart[i].y + ddy)));
        });
      }
    }
    mesure.x = nx; mesure.y = ny;
    dessine(L, p, bd); majHud(L, p, bd);
  });

  const fin = ()=>{
    if(!glisse) return;
    glisse = null; mesure = null; savePlat();
    dessine(L, p, bd); majHud(L, p, bd);
  };
  svg.addEventListener("pointerup", fin);
  svg.addEventListener("pointercancel", fin);

  function majListe(){
    hote.querySelectorAll("[data-pose]").forEach(b =>
      b.classList.toggle("sel", !!selection && selection.genre === "unite" &&
                                 String(selection.id) === String(b.dataset.pose)));
  }
}

/* ---------- branchement à la navigation ----------
   vaVers() de roster.js bascule déjà les .screen par leur id ; on
   n'ajoute qu'un rendu au moment où l'axe s'ouvre. */
const onglet = document.querySelector('#tabs button[data-s="scMap"]');
if(onglet) onglet.addEventListener("click", renderMap);

/* Les cartes repliables du reste de l'application se replient au clic
   sur leur titre ; les nôtres sont créées après coup, on rebranche.
   L'état de la carte des décors se retient : sans cela, poser une pièce
   la refermait, et les boutons pour la pivoter disparaissaient avec. */
document.addEventListener("click", ev => {
  const h = ev.target.closest("#scMap .card > h2");
  if(!h) return;
  const carte = h.parentNode;
  carte.classList.toggle("collapsed");
  const memoire = { mapCardDecor: "decorOuvert", mapCardFond: "fondOuvert" };
  const champ = memoire[carte.id];
  if(champ){
    const L = listeEnService();
    if(L){ etatDe(L)[champ] = !carte.classList.contains("collapsed"); savePlat(); }
  }
});

/* crochet de vérification */
window.PLATEAU = {
  rend: renderMap,
  etat: function(){
    const L = listeEnService(); if(!L) return null;
    const p = etatDe(L), bd = plateauDe(L, p);
    let figs = 0;
    for(const id in p.unites) if(Array.isArray(p.unites[id])) figs += p.unites[id].length;
    return { liste:L.nom, dispo: bd && bd.mienne, adverse: bd && bd.adverse,
             variante: p.variante, mission: bd && bd.maMission, mode: p.mode,
             posees: Object.keys(p.unites).length, figurines: figs,
             decorsOfficiels: bd ? bd.decors.length : 0,
             objectifs: bd ? bd.objectifs.length : 0 };
  },
  /* les mesures d'une unité posée */
  unite: function(id){
    const L = listeEnService(); if(!L) return null;
    const p = etatDe(L);
    const ru = (L.units || []).find(u => String(u.id) === String(id));
    const pos = ru && p.unites[ru.id];
    if(!ru || !Array.isArray(pos) || !pos.length) return null;
    const figs = figurinesDe(ru);
    return { nom:ru.name, figurines:pos.length, socle:socleTexte(ru.name),
             prise: Math.round(priseAuSol(figs, pos) * 100) / 100,
             isolees: cohesion(figs, pos).isolees.length,
             centre: centreDe(pos) };
  }
};
})();
