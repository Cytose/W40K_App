/* Les detachements du Pack de Faction Necrons v1.1, et surtout ce que le
   Pantheon de Malheur impose.

   Ce detachement n'ouvre AUCUNE optimisation. Il impose a chaque unite de
   MONSTRE NECRON une Entrave Necrodermique, la fait payer sur l'unite, et
   ne laisse rien a choisir. L'application le rangeait avec les
   optimisations ordinaires, faute d'avoir la page : quatre noms anglais,
   un cout, et un effet vide. Le pack les donne.

   Lancer : node outils/test-detachements.mjs  (site servi sur :8099, ou $SITE) */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium, base } from './navigateur.mjs';

const RACINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ok = [], ko = [];
const t = (quoi, bon, dit) => (bon ? ok : ko).push((bon ? '  ✓ ' : '  ✗ ') + quoi +
  (dit !== undefined ? ' : ' + dit : ''));
/* comparer, plutot que d'esperer qu'une valeur soit vraie : `false` est
   une reponse juste aussi souvent qu'une autre */
const eq = (quoi, vu, att) => t(quoi, vu === att, JSON.stringify(vu) +
  (vu === att ? '' : ' au lieu de ' + JSON.stringify(att)));

const D = new Function(fs.readFileSync(path.join(RACINE, 'data.js'), 'utf8') +
  '; return {E:ENHANCEMENTS, T:ENTRAVES, K:KW, D:DETACHMENTS, O:ENH_OTEES, A:APTITUDES};')();

console.log('\n== 1. les sept detachements du pack ==');
const PACK = {
  "Hand of the Dynasty": 2, "Skyshroud Spearhead": 2, "The Phaeron's Armoury": 2,
  "Starshatter Arsenal": 4, "Cryptek Conclave": 4, "Cursed Legion": 4,
  "Pantheon of Woe": 0
};
t('les sept sont dans la table',
  Object.keys(PACK).every(n => D.D.some(d => d[0] === n)));
Object.entries(PACK).forEach(([n, k]) => {
  const v = D.E.filter(e => e[2] === n).length;
  t('optimisations de ' + n, v === k, v + ' / ' + k + ' attendues');
});

console.log('\n== 2. les entraves necrodermiques ==');
/* Le pack nomme, pour chacune, la seule figurine qui la porte. Ce sont
   exactement les quatre MONSTRES necrons — ni plus, ni moins. */
t('une entrave par MONSTRE, et rien d\'autre',
  JSON.stringify(Object.keys(D.T).sort()) === JSON.stringify(D.K.monster.slice().sort()),
  Object.keys(D.T).length + ' entraves pour ' + D.K.monster.length + ' monstres');
t('chacune porte son nom francais, son cout et son texte',
  Object.values(D.T).every(v => v[0] && typeof v[1] === 'number' && v[1] > 0 &&
                                 v[2] && v[2].length > 60 && v[3]));
/* Le texte du pack nomme la figurine : c'est ce qui lie l'entrave a son
   monstre, et c'est verifiable mot pour mot. */
const LIEN = {
  "C'tan Shard of the Nightbringer": "NYCTOPHORE",
  "C'tan Shard of the Deceiver": "MYSTIFICATEUR",
  "C'tan Shard of the Void Dragon": "DRAGON DU NÉANT",
  "Transcendent C'tan": "C'TAN TRANSCENDANT"
};
t('chaque texte nomme la figurine qui la porte',
  Object.entries(LIEN).every(([u, mot]) => (D.T[u][2] || '').indexOf(mot) >= 0));
t('les quatre noms du Munitorum sont retires des optimisations',
  D.O.length === 4 && D.O.every(n => !D.E.some(e => e[0] === n)),
  D.O.join(', '));
t('le Munitorum et le pack se recoupent',
  Object.values(D.T).map(v => v[3]).sort().join(',') === D.O.slice().sort().join(','));
/* Et la fiche de chaque monstre porte la meme aptitude : le joueur la
   trouve la ou il la cherche, pas seulement dans la liste. */
t('la fiche du monstre porte l\'aptitude',
  Object.entries(D.T).every(([u, v]) =>
    (D.A[u] || []).some(a => a[0].indexOf(v[0]) === 0)));

console.log('\n== 3. sur une vraie liste ==');
const b = await chromium();
const p = await b.newPage({ viewport:{width:1000,height:1300} });
p.on('pageerror', e => ko.push('  ✗ PAGEERROR ' + e.message));
await p.goto(base + 'index.html'); await p.waitForTimeout(900);
const pose = async detach => {
  await p.evaluate(d => {
    localStorage.removeItem('mathhammer.plateau.v1');
    localStorage.setItem('mathhammer.lists.v1', JSON.stringify({v:1, actif:'l', listes:[{
      id:'l', nom:'Essai', cap:2000, detach:[d], fd:'', nextId:3, units:[
        {id:1, name:"C'tan Shard of the Nightbringer", size:1, lo:[], chars:[], sel:true, grp:'', enh:null},
        {id:2, name:"Necron Warriors", size:10, lo:[], chars:[], sel:true, grp:'', enh:null}]}]}));
  }, detach);
  await p.reload(); await p.waitForTimeout(1000);
  const l = await p.evaluate(() => window.ROSTER.liste());
  l.html = await p.evaluate(() => document.body.innerHTML);
  l.bilan = await p.evaluate(() => window.ROSTER.bilan());
  return l;
};
const sans = await pose('Awakened Dynasty');
const avec = await pose('Pantheon of Woe');
const nb = l => l.unites.find(u => u.nom === "C'tan Shard of the Nightbringer");
eq('sans le Pantheon, aucune entrave', nb(sans).entrave, '');
eq('avec le Pantheon, le Nyctophore porte la sienne', nb(avec).entrave, 'Aiguillon Quantique');
eq('elle coute 45 points de plus sur l\'unite', nb(avec).pts - nb(sans).pts, 45);
eq('et ces points sont dans le total', avec.total - sans.total, 45);
eq('elle se lit sur la liste', /Aiguillon Quantique/.test(avec.html), true);
eq('elle disparait avec le detachement', /Aiguillon Quantique/.test(sans.html), false);
/* Les Guerriers ne sont pas un MONSTRE : rien ne doit leur etre pose. */
eq('les autres unites n\'en portent pas', avec.unites.filter(u => u.entrave).length, 1);
/* Le bilan de la liste dit ce que les entraves coutent -- et, si aucun
   MONSTRE n'est la, que le detachement ne donne rien du tout. */
eq('le bilan chiffre les entraves',
  avec.bilan.some(x => /Entraves Nécrodermiques/.test(x)), true);
await p.evaluate(() => {
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({v:1, actif:'l', listes:[{
    id:'l', nom:'Sans monstre', cap:2000, detach:['Pantheon of Woe'], fd:'', nextId:2, units:[
      {id:1, name:"Necron Warriors", size:10, lo:[], chars:[], sel:true, grp:'', enh:null}]}]}));
});
await p.reload(); await p.waitForTimeout(1000);
eq('un Pantheon sans MONSTRE est signale',
  (await p.evaluate(() => window.ROSTER.bilan()))
    .some(x => /sans MONSTRE/.test(x)), true);

/* Une liste enregistree avant ce correctif portait l'une des quatre
   lignes comme une optimisation ordinaire. Elle doit la perdre — et
   recuperer l'entrave, qui ne se porte pas sur un personnage. */
await p.evaluate(() => {
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({v:1, actif:'l', listes:[{
    id:'l', nom:'Ancienne', cap:2000, detach:['Pantheon of Woe'], fd:'', nextId:3, units:[
      {id:1, name:"C'tan Shard of the Deceiver", size:1, lo:[], chars:[], sel:true,
       grp:'', enh:'Singularity Matrix'}]}]}));
});
await p.reload(); await p.waitForTimeout(1000);
const vieille = await p.evaluate(() => window.ROSTER.liste());
eq('l\'ancienne optimisation est otee', vieille.unites[0].enh, '');
eq('et l\'entrave la remplace', vieille.unites[0].entrave, 'Matrice de Singularité');
eq('le Mystificateur paie 45 pts de plus', vieille.unites[0].pts, 330 + 45);
await b.close();

console.log([...ok, ...ko].join('\n'));
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
process.exit(ko.length ? 1 : 0);
