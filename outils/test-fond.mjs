/* ============================================================
   LE FOND DE CARTE

   La page officielle d'un agencement, posee sous la geometrie. Les images
   ne sont pas livrees avec l'application — ce sont les pages d'un document
   de Games Workshop, et le depot comme le site sont publics : c'est
   l'utilisateur qui charge les siennes, et elles ne quittent pas son
   navigateur.

   Cette suite eprouve les quatre choses qui peuvent casser sans bruit :
     — le cadre du plateau est reconnu dans l'image et l'image recadree ;
     — le fond se retourne avec le plateau quand on le couche ;
     — il survit au rechargement, donc il est bien range dans IndexedDB ;
     — il disparait quand on le retire.

   La troisieme a deja lache une fois : la relecture appelait une variable
   qui n'existe pas dans ce fichier, la promesse levait une ReferenceError
   avalee en silence, et le fond ne revenait jamais. Rien ne s'affichait a
   la console, et l'ecran avait l'air normal.

   Il faut le site servi (:8099 ou $SITE) et une image de page passee en
   argument — a defaut, la suite se declare non jouable plutot que verte.

   Lancer : node outils/test-fond.mjs <image-de-page.png>
   ============================================================ */
import { chromium, base } from './navigateur.mjs';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const racine = path.resolve(import.meta.dirname, '..');
const carnet = JSON.parse(fs.readFileSync(path.join(racine, 'outils', 'cartes.json'), 'utf8'));
const LAY = JSON.parse(execFileSync('node', ['-e',
  'const fs=require("fs");const s=fs.readFileSync(' + JSON.stringify(path.join(racine, 'layouts.js')) +
  ',"utf8");const L=new Function(s+"; return LAYOUTS;")();console.log(JSON.stringify(L));'],
  { encoding: 'utf8' }));
process.chdir(racine);

const image = process.argv[2];
if (!image || !fs.existsSync(image)) {
  console.log('\nIl faut l’image d’une page d’agencement, pour éprouver le remplacement :\n' +
              '   node outils/test-fond.mjs <page.png>\n');
  process.exit(2);
}

const nav = await chromium();
const p = await nav.newPage({ viewport: { width: 820, height: 1500 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

await p.goto(base); await p.waitForTimeout(600);
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v:1, actif:'a', listes:[{
    id:'a', nom:'Essai fond', cap:2000, nextId:9, detach:['Cryptek Conclave'],
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
await clic('Layout C');            await p.waitForTimeout(600);

const ok = [], ko = [];
const T = (nom, vrai, dit) => (vrai ? ok : ko).push(nom + (dit ? ' — ' + dit : ''));

T('la carte « Fond de carte » existe',
  await p.evaluate(() => !!document.getElementById('mapCardFond')));

/* On ouvre la carte en cliquant son en-tête, comme un doigt — et non en
   lui retirant sa classe. La première version de cette suite trichait
   ainsi, et elle est passée au vert sur une carte qui ne s'ouvrait pas :
   un second gestionnaire basculait la classe une deuxième fois. */
const ouvre = () => p.evaluate(() => {
  const c = document.getElementById('mapCardFond');
  if (c && c.classList.contains('collapsed')) c.querySelector('h2').click();
  return !!c && !c.classList.contains('collapsed');
});
T('elle s’ouvre quand on clique son en-tête', await ouvre());

/* le fond livre est la avant tout geste */
const href = () => p.evaluate(() =>
  document.querySelector('#mapSvg image')?.getAttribute('href') || '');
const livre = await href();
T('le fond livré est posé sans rien charger', /^cartes\/\d+-[abc]\.jpg$/.test(livre), livre);

/* les 45 fichiers sont bien la */
const manquants = [];
for (const [n, f] of Object.entries(carnet)) {
  if (!f || typeof f !== 'object') continue;
  const mu = Object.entries(LAY.matchups).find(([, m]) => m.p1 === f.p1 && m.p2 === f.p2 ||
                                                          m.p2 === f.p1 && m.p1 === f.p2);
  if (!mu) continue;
  const nom = 'cartes/' + mu[0] + '-' + f.agencement + '.jpg';
  if (!fs.existsSync(nom)) manquants.push(nom);
}
T('les 45 fonds sont livrés', manquants.length === 0, manquants.slice(0, 3).join(', '));

await p.setInputFiles('#fondFichier', image);
await p.waitForTimeout(3000);

const pose = await p.evaluate(() => {
  const im = document.querySelector('#mapSvg image');
  return { la: !!im, mien: /^data:/.test(im?.getAttribute('href') || ''),
           op: im ? im.parentNode.getAttribute('opacity') : null,
           avert: !!document.querySelector('#mapCardFond .hint[style*="warn"]') };
});
T('mon image remplace celle livrée', pose.la && pose.mien, 'opacité ' + pose.op);
T('le cadre du plateau a été reconnu dans mon image', !pose.avert);

const cles = await p.evaluate(() => new Promise(res => {
  const r = indexedDB.open('mathhammer.fonds', 1);
  r.onsuccess = () => {
    const t = r.result.transaction('pages', 'readonly').objectStore('pages').getAllKeys();
    t.onsuccess = () => res(t.result); t.onerror = () => res([]);
  };
  r.onerror = () => res([]);
}));
T('l’image est rangée dans le navigateur', cles.length === 1, cles.join(', '));

/* Le plateau s'affiche couché par défaut ; on lit donc l'état plutôt que
   de supposer dans quel sens le bouton va le faire basculer. */
const vue = () => p.evaluate(() => ({
  portrait: /47 63/.test(document.getElementById('mapSvg').getAttribute('viewBox') || ''),
  tr: document.querySelector('#mapSvg image')?.getAttribute('transform') || ''
}));
let v = await vue();
T('couché, le fond pivote d’un quart de tour comme la géométrie',
  v.portrait || /rotate\(-90\)/.test(v.tr), 'viewBox portrait : ' + v.portrait);
await p.evaluate(() => document.getElementById('mapOrient').click());
await p.waitForTimeout(700);
const w = await vue();
T('debout, le fond ne pivote pas',
  w.portrait ? w.tr === '' : /rotate\(-90\)/.test(w.tr), 'transform « ' + w.tr + ' »');
T('les deux orientations diffèrent bien', v.portrait !== w.portrait);
await p.evaluate(() => document.getElementById('mapOrient').click());
await p.waitForTimeout(600);

await p.reload(); await p.waitForTimeout(1400);
await p.evaluate(() => document.querySelector('[data-s="scMap"]').click());
await p.waitForTimeout(1800);
T('mon image survit au rechargement',
  /^data:/.test(await href()));

T('elle se rouvre après rechargement', await ouvre());
p.on('dialog', d => d.accept());
await p.evaluate(() => document.getElementById('fondOter')?.click());
await p.waitForTimeout(1200);
/* Les deux calques : la page officielle et notre tracé, chacun réglable.
   C'est ce qui permet de vérifier à l'œil qu'ils concordent. */
const calques = () => p.evaluate(() => ({
  fond: document.querySelector('#mapSvg image')?.parentNode.getAttribute('opacity'),
  trace: document.getElementById('mapTrace')?.getAttribute('opacity'),
  dedans: document.getElementById('mapTrace')?.children.length || 0
}));
const regle = (id, v) => p.evaluate(([i, x]) => {
  const c = document.getElementById(i); if (!c) return;
  c.value = x;
  c.dispatchEvent(new Event('input', { bubbles: true }));
  c.dispatchEvent(new Event('change', { bubbles: true }));
}, [id, v]);

let q = await calques();
T('zones, décors et objectifs sont dans un seul calque', q.dedans > 20, q.dedans + ' éléments');
await regle('traceOp', '25'); await p.waitForTimeout(300);
q = await calques();
T('le tracé généré a son propre réglage', q.trace === '0.25', 'opacité ' + q.trace);
await regle('fondOp', '100'); await p.waitForTimeout(300);
q = await calques();
T('les deux calques se règlent séparément',
  q.fond === '1' && q.trace === '0.25', 'page ' + q.fond + ', tracé ' + q.trace);
await p.reload(); await p.waitForTimeout(1400);
await p.evaluate(() => document.querySelector('[data-s="scMap"]').click());
await p.waitForTimeout(1600);
q = await calques();
T('les deux réglages survivent au rechargement',
  q.fond === '1' && q.trace === '0.25', 'page ' + q.fond + ', tracé ' + q.trace);
await p.evaluate(() => {
  const c = document.getElementById('mapCardFond');
  if (c && c.classList.contains('collapsed')) c.querySelector('h2').click();
});
await p.waitForTimeout(300);

T('« Reprendre celle d’origine » rend le fond livré',
  /^cartes\/\d+-[abc]\.jpg$/.test(await href()), await href());
T('aucune erreur JS', errs.length === 0, errs.slice(0, 2).join(' | '));

console.log('\n════ FOND DE CARTE ════');
ok.forEach(x => console.log('  ✓ ' + x));
if (ko.length) { console.log('\n════ ÉCARTS ════'); ko.forEach(x => console.log('  ✗ ' + x)); }
console.log('\n' + ok.length + ' contrôles, ' + ko.length + ' écart' + (ko.length > 1 ? 's' : '') + '.\n');
await nav.close();
process.exit(ko.length ? 1 : 0);
