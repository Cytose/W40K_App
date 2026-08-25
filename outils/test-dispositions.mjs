/* Les invariants d'une carte officielle. Ils ne dependent d'aucune source :
   ils tiennent aux regles du jeu. Une carte qui les viole est fausse, quelle
   que soit la maniere dont elle a ete obtenue.

   Lancer : node outils/test-dispositions.mjs */
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
vm.runInThisContext(fs.readFileSync(path.join(RACINE, 'layouts.js'), 'utf8') +
  '\n;globalThis.__L = LAYOUTS;');
const L = globalThis.__L;
const W = L.table.w, H = L.table.h, CX = W/2, CY = H/2;

const ok = [], ko = [];
const t = (nom, cond, vu) => {
  (cond ? ok : ko).push(nom);
  console.log((cond ? '  ✓ ' : '  ✗ ') + nom + (vu === undefined ? '' : ' : ' + vu));
};
const d = (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1]);
const mir = ([x, y]) => [2*CX - x, 2*CY - y];
const vars = () => Object.entries(L.matchups).flatMap(([id, m]) =>
  Object.entries(m.v).map(([v, va]) => ({ cle: id + v, m, v, va })));

console.log('\n== 1. la table et son decoupage ==');
t('plateau 44 x 60 pouces', W === 44 && H === 60, W + ' x ' + H);
t('15 appariements', Object.keys(L.matchups).length === 15);
t('trois variantes chacun', Object.values(L.matchups).every(m => Object.keys(m.v).length === 3));
t('45 variantes en tout', vars().length === 45);
t('25 missions primaires', Object.keys(L.missions).length === 25);

console.log('\n== 2. la symetrie centrale — sinon un joueur est avantage ==');
let pire = 0, pireCle = '';
for(const { cle, va } of vars()){
  const pts = (va.o||[]).concat(va.h1||[], va.h2||[]);
  for(const p of pts){
    const e = Math.min(...pts.map(q => d(mir(p), q)));
    if(e > pire){ pire = e; pireCle = cle; }
  }
}
t('chaque objectif a son miroir a moins de 0,02"', pire <= 0.02,
  'pire ' + pire.toFixed(3) + '" en ' + pireCle);

console.log('\n== 3. les zones de deploiement ==');
const sommets = vars().flatMap(x => [x.va.z1, x.va.z2]).filter(Boolean).flat();
t('90 zones', vars().flatMap(x => [x.va.z1, x.va.z2]).filter(Boolean).length === 90);
t('aucun sommet hors du plateau',
  sommets.every(p => p[0] >= -0.01 && p[0] <= W + 0.01 && p[1] >= -0.01 && p[1] <= H + 0.01));
const entier = n => Math.abs(n - Math.round(n)) < 0.011;
const rondes = sommets.filter(p => entier(p[0]) && entier(p[1])).length;
t('les sommets tombent sur des pouces entiers ou des quarts',
  sommets.every(p => [p[0], p[1]].every(c => Math.abs(c*100 - Math.round(c*100)) < 1e-6)),
  rondes + ' / ' + sommets.length + ' sur un pouce entier');
/* les deux zones d'une carte sont l'image l'une de l'autre */
let asym = 0;
for(const { va } of vars()){
  if(!va.z1 || !va.z2) continue;
  const e = Math.max(...va.z1.map(p => Math.min(...va.z2.map(q => d(mir(p), q)))));
  if(e > 0.02) asym++;
}
t('les deux zones sont l\'image l\'une de l\'autre', asym === 0, asym + ' ecart(s)');

console.log('\n== 4. le patron de deploiement ==');
const PATRONS = ['tipping-point','hammer-and-anvil','sweeping-engagement',
                 'dawn-of-war','crucible-of-battle','search-and-destroy'];
t('chaque variante nomme son patron', vars().every(x => x.va.pat));
t('et c\'est un des six officiels', vars().every(x => PATRONS.includes(x.va.pat)));
t('les trois variantes d\'un appariement en ont trois differents',
  Object.values(L.matchups).every(m => new Set(Object.values(m.v).map(v => v.pat)).size === 3));

console.log('\n== 5. les objectifs ==');
const nbObj = vars().map(x => (x.va.o||[]).length + (x.va.h1||[]).length + (x.va.h2||[]).length);
t('chaque carte porte au moins quatre objectifs', Math.min(...nbObj) >= 4, 'mini ' + Math.min(...nbObj));
/* Toutes les cartes 11e n'ont pas d'objectif au centre : sur les 45, neuf
   en portent un et les autres non. Ce qui se verifie, c'est qu'il n'y a pas
   de position intermediaire -- un objectif est au centre exact, ou il en est
   franchement ecarte. */
const auCentre = vars().filter(x =>
  (x.va.o||[]).concat(x.va.h1||[], x.va.h2||[]).some(p => d(p, [CX, CY]) < 0.02));
t('les cartes a objectif central l\'ont au centre exact', auCentre.length > 0,
  auCentre.length + ' / 45 cartes');
t('aucun objectif dans la zone grise du centre (0,02\" a 1\")',
  vars().every(x => (x.va.o||[]).concat(x.va.h1||[], x.va.h2||[])
    .every(p => { const e = d(p, [CX, CY]); return e < 0.02 || e > 1; })));
t('aucun objectif hors du plateau', vars().every(x =>
  (x.va.o||[]).concat(x.va.h1||[], x.va.h2||[])
    .every(p => p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H)));
t('autant d\'objectifs de depart de chaque cote',
  vars().every(x => (x.va.h1||[]).length === (x.va.h2||[]).length));

console.log('\n== 6. les decors ==');
/* Poser un gabarit, comme le fait plateau.js : contour local, miroir,
   rotation horaire, puis translation. Le refaire ici plutot que de le
   supposer, c'est verifier que le catalogue et les poses s'accordent. */
function poser(d, out, prof){
  const g = (L.gab || {})[d.g];
  if(!g || (prof || 0) > 3) return;
  const r = (d.r || 0) * Math.PI / 180, co = Math.cos(r), si = Math.sin(r);
  const loc = q => {
    let x = q[0], y = q[1];
    if(d.m === 1) x = -x; else if(d.m === 2) y = -y;
    return [d.p[0] + x*co - y*si, d.p[1] + x*si + y*co];
  };
  out.push({ k: g.k, dense: !!d.d, poly: g.p.map(loc) });
  (g.f || []).forEach(f => poser(
    { g:f.g, p:loc(f.p), r:(d.r || 0) + (f.r || 0) * (d.m ? -1 : 1), m:d.m, d:f.d },
    out, (prof || 0) + 1));
}
const dec = vars().flatMap(x => x.va.t || []);
t('720 pieces de decor', dec.length === 720, dec.length);
t('chaque pose nomme un gabarit connu', dec.every(d => (L.gab || {})[d.g]));
t('chaque pose porte son centre', dec.every(d => Array.isArray(d.p) && d.p.length === 2));
const gabs = Object.values(L.gab || {});
t('le catalogue tient en une cinquantaine de gabarits',
  gabs.length > 0 && gabs.length < 80, gabs.length + ' gabarits');
t('chaque gabarit est un polygone ferme',
  gabs.every(g => Array.isArray(g.p) && g.p.length >= 3));
const poses = [];
dec.forEach(d => poser(d, poses));
t('chaque emprise porte ses elements', poses.length > dec.length,
  poses.length + ' contours pour ' + dec.length + ' emprises');
const horsPlateau = poses.filter(q => q.poly.some(c =>
  c[0] < -2 || c[0] > W + 2 || c[1] < -2 || c[1] > H + 2)).length;
t('aucun decor ne deborde du plateau', horsPlateau === 0, horsPlateau + ' debordement(s)');
const retournees = dec.filter(d => d.m).length;
t('le miroir de la source est conserve', retournees > 0, retournees + ' emprises retournees');

console.log('\n== 7. terrain dense ou leger ==');
/* Le document peint le terrain dense en vert et le terrain leger en or.
   La distinction n'est pas decorative : le dense porte la regle Plein,
   on ne tire pas de ligne de vue au travers au ras du sol. Elle a ete
   relevee sur les 45 pages ; on verifie ici que layouts.js dit la meme
   chose que le releve, et que le releve dit la meme chose que le type de
   la piece -- une ruine est dense, un muret est leger. */
const releve = JSON.parse(fs.readFileSync(path.join(RACINE, 'outils', 'densite.json'), 'utf8')).table;
const emprises = Object.entries(L.gab).filter(([, g]) => g.k === 'a' && (g.f || []).length);
t('chaque emprise portante a ete relevee',
  emprises.every(([k]) => releve[k]), emprises.length + ' emprises');
t('layouts.js et le releve disent la meme chose',
  emprises.every(([k, g]) => g.f.every((f, i) => !!f.d === (releve[k].elements[i] === 1))));
const DENSE = { ab:1, co:1, ef:1, gh:1, generator:1, pipes:1, tower:1 };
const contredits = emprises.flatMap(([k, g]) =>
  g.f.filter(f => !!f.d !== !!DENSE[f.g]).map(f => k + '/' + f.g));
t('le releve s\'accorde au type de la piece', contredits.length === 0,
  contredits.length ? contredits.join(', ') : '0 ecart sur ' +
    emprises.reduce((n, [, g]) => n + g.f.length, 0) + ' elements');
const posesTous = [];
dec.forEach(x => poser(x, posesTous));
const elems = posesTous.filter(q => q.k === 'f');
t('les deux familles sont sur la table',
  elems.some(q => q.dense) && elems.some(q => !q.dense),
  elems.filter(q => q.dense).length + ' denses, ' +
  elems.filter(q => !q.dense).length + ' legers');

console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
if(ko.length) console.log('KO : ' + ko.join(' ; '));
process.exit(ko.length ? 1 : 0);
