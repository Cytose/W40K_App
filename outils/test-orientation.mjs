/* ============================================================
   L'ORIENTATION DU PLATEAU

   Le plateau est stocke en portrait, comme la carte officielle, et
   affiche couche par defaut — un plateau debout ne laisse presque rien
   voir sur un telephone. Couche, il ne se compare plus au document : la
   diagonale d'une zone de deploiement penche dans l'autre sens, et on ne
   sait plus dire si c'est la donnee qui se trompe ou l'affichage.

   Cette suite l'etablit dans les deux sens, sur la carte Sabotage
   variante B, dont les zones sont deux triangles — le cas ou une erreur
   d'orientation se verrait le plus :

     — couche, les sommets dessines sont l'image exacte de X = y,
       Y = 44 - x appliquee a layouts.js ;
     — debout, ce sont les sommets de layouts.js, sans transformation.

   Il faut le site servi : python3 -m http.server 8099 (ou $SITE).
   Lancer : node outils/test-orientation.mjs
   ============================================================ */
import { chromium, base } from './navigateur.mjs';
import fs from 'fs';
import path from 'path';

const racine = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(racine, 'layouts.js'), 'utf8');
const L = new Function(src + '; return LAYOUTS;')();
const W = L.table.w;

/* Sabotage, variante B : Actifs Prioritaires des deux cotes */
const carte = Object.values(L.matchups)
  .find(m => m.p1 === 'PRIORITY ASSETS' && m.p2 === 'PRIORITY ASSETS').v.b;

const nav = await chromium();
const p = await nav.newPage({ viewport: { width: 1100, height: 1700 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(base); await p.waitForTimeout(600);
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v:1, actif:'a', listes:[{
    id:'a', nom:'Essai orientation', cap:2000, nextId:9, detach:['Cryptek Conclave'],
    units:[{ id:1, name:'Necron Warriors', size:10, lo:[], chars:[], sel:true, grp:'', enh:null }] }] }));
});
await p.reload(); await p.waitForTimeout(1100);
await p.evaluate(() => document.querySelector('[data-s="scMap"]').click());
await p.waitForTimeout(800);
const clic = t => p.evaluate(x => {
  const b = [...document.querySelectorAll('button')].find(e => e.textContent.trim() === x);
  if (b) { b.click(); return true; } return false;
}, t);
await clic('Actifs Prioritaires'); await p.waitForTimeout(400);
await clic('Layout B');            await p.waitForTimeout(600);

const lis = () => p.evaluate(() => {
  const s = document.getElementById('mapSvg');
  return { vue: s.getAttribute('viewBox'),
           z: [...s.querySelectorAll('polygon')].slice(0, 2).map(e => e.getAttribute('points')) };
});
const pts = s => s.trim().split(/\s+/).map(q => q.split(',').map(Number));
const meme = (a, b) => {
  const k = x => JSON.stringify([...x].map(q => q.map(v => +v.toFixed(3))).sort());
  return k(a) === k(b);
};

const ok = [], ko = [];
const T = (nom, vrai) => (vrai ? ok : ko).push(nom);

let r = await lis(), z = r.z.map(pts);
T('couché : cadrage paysage 63 × 47', r.vue === '-1.5 -1.5 63 47');
T('couché : la zone 1 est l’image de X = y, Y = 44 − x',
  z.some(q => meme(q, carte.z1.map(([x, y]) => [y, W - x]))));
T('couché : la zone 2 est l’image de X = y, Y = 44 − x',
  z.some(q => meme(q, carte.z2.map(([x, y]) => [y, W - x]))));

await p.evaluate(() => document.getElementById('mapOrient').click());
await p.waitForTimeout(600);
r = await lis(); z = r.z.map(pts);
T('debout : cadrage portrait 47 × 63', r.vue === '-1.5 -1.5 47 63');
T('debout : la zone 1 est la donnée, sommet pour sommet', z.some(q => meme(q, carte.z1)));
T('debout : la zone 2 est la donnée, sommet pour sommet', z.some(q => meme(q, carte.z2)));

await p.reload(); await p.waitForTimeout(1100);
await p.evaluate(() => document.querySelector('[data-s="scMap"]').click());
await p.waitForTimeout(800);
T('le choix survit au rechargement', (await lis()).vue === '-1.5 -1.5 47 63');
T('aucune erreur JS', errs.length === 0);

console.log('\n════ ORIENTATION ════');
ok.forEach(x => console.log('  ✓ ' + x));
if (ko.length) { console.log('\n════ ÉCARTS ════'); ko.forEach(x => console.log('  ✗ ' + x)); }
if (errs.length) console.log('\nerreurs JS :\n  ' + [...new Set(errs)].join('\n  '));
console.log('\n' + ok.length + ' contrôles, ' + ko.length + ' écart' + (ko.length > 1 ? 's' : '') + '.\n');
await nav.close();
process.exit(ko.length ? 1 : 0);
