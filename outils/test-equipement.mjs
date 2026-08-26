/* L'EQUIPEMENT QUI N'EST PAS UNE ARME

   Un orbe de resurrection ne tire pas et ne frappe pas : il ouvre une
   aptitude, une fois par partie, a la fin de n'importe quelle phase.
   L'Overlord ne l'avait nulle part -- ni dans son armement, ni sur sa
   fiche, ni dans l'aide de jeu -- et ceux qui l'avaient le voyaient
   rappele qu'ils l'aient emporte ou non.

   Lancer : node outils/test-equipement.mjs  (site servi sur :8099, ou $SITE) */
import { chromium, base } from './navigateur.mjs';
const ok = [], ko = [];
const eq = (quoi, vu, att) => (vu === att ? ok : ko).push(
  (vu === att ? '  ✓ ' : '  ✗ ') + quoi + ' : ' + JSON.stringify(vu) +
  (vu === att ? '' : ' au lieu de ' + JSON.stringify(att)));

const b = await chromium();
const p = await b.newPage({ viewport:{width:430,height:1200} });
p.on('pageerror', e => ko.push('  ✗ PAGEERROR ' + e.message));
await p.goto(base + 'index.html'); await p.waitForTimeout(800);

const liste = async unites => {
  await p.evaluate(u => { localStorage.setItem('mathhammer.lists.v1', JSON.stringify({v:1,
    actif:'l', listes:[{id:'l', nom:'S', cap:3000, detach:['Awakened Dynasty'],
                        fd:'', nextId:9, units:u}]})); }, unites);
  await p.reload(); await p.waitForTimeout(1000);
};
const maint = (ph, moi) => p.evaluate(([a, c]) => window.ROSTER.maintenant(a, c), [ph, moi]);
const rappelle = async (ph, nom) => (await maint(ph, true)).some(x => new RegExp(nom).test(x.nom));
const pts = async i => (await p.evaluate(() => window.ROSTER.liste())).unites[i].pts;
const ORB = 'Orbe de Résurrection';

console.log('\n== 1. l\'orbe est un équipement de la fiche, pas une arme ==');
await liste([{id:1, name:'Overlord', size:1, lo:[{s:0,o:0,n:1}], chars:[], sel:true, grp:'', enh:null}]);
const fiche = await p.evaluate(() => ARMEMENT['Overlord'].s);
eq('l\'Overlord a un second emplacement', fiche.length, 2);
eq('il est facultatif', fiche[1] && fiche[1].min, 0);
eq('son option ne donne aucune arme', JSON.stringify(fiche[1] && fiche[1].o), '[[]]');
eq('elle porte le nom de l\'équipement', fiche[1] && fiche[1].onom[0], ORB);
eq('et dit quelle aptitude elle apporte',
  JSON.stringify(fiche[1] && fiche[1].oapt[0]), JSON.stringify([ORB]));
eq('la fiche de l\'Overlord écrit l\'aptitude',
  await p.evaluate(() => APTITUDES['Overlord'].some(a => /Orbe de Résurrection/.test(a[0]))), true);

console.log('\n== 2. l\'aide de jeu ne le rappelle qu\'à qui l\'a emporté ==');
eq('sans l\'orbe, rien à la phase de Commandement', await rappelle('cmd', ORB), false);
eq('... ni au tir', await rappelle('tir', ORB), false);
await liste([{id:1, name:'Overlord', size:1, lo:[{s:0,o:0,n:1},{s:1,o:0,n:1}],
              chars:[], sel:true, grp:'', enh:null}]);
eq('avec l\'orbe, il se rappelle au Commandement', await rappelle('cmd', ORB), true);
eq('... et à chacune des cinq phases', (await Promise.all(
  ['cmd','mvt','tir','chg','cbt'].map(ph => rappelle(ph, ORB)))).filter(Boolean).length, 5);
eq('en fin de phase, comme le dit la règle',
  (await maint('cmd', true)).find(x => new RegExp(ORB).test(x.nom)).pos, 'fin');
eq('et il ne coûte rien de plus', await pts(0), 90);

console.log('\n== 3. deux Overlords, un seul orbe ==');
await liste([{id:1, name:'Overlord', size:1, lo:[{s:0,o:0,n:1},{s:1,o:0,n:1}], chars:[], sel:true, grp:'', enh:null},
             {id:2, name:'Overlord', size:1, lo:[{s:0,o:1,n:1}], chars:[], sel:true, grp:'', enh:null}]);
eq('un seul rappel, pas deux',
  (await maint('cmd', true)).filter(x => new RegExp(ORB).test(x.nom)).length, 1);
await p.click('#tabs button[data-s="scList"]'); await p.waitForTimeout(400);
await p.evaluate(()=>{ const e = [...document.querySelectorAll('#scList *')]
  .find(x => /^S$/.test(x.textContent.trim())); e.closest('button,div[class]').click(); });
await p.waitForTimeout(700);
const cases = await p.evaluate(() => [...document.querySelectorAll('.tile')]
  .map(t => t.textContent.replace(/\s+/g, ' ')));
eq('la case du porteur le montre', /Orbe de Résurrection/.test(cases[0] || ''), true);
eq('celle de l\'autre non', /Orbe de Résurrection/.test(cases[1] || ''), false);

console.log('\n== 4. un Overlord rattaché le porte aussi ==');
await liste([{id:1, name:'Immortals', size:10, lo:[], sel:true, grp:'', enh:null,
              chars:[{name:'Overlord', lo:[{s:0,o:0},{s:1,o:0}]}]}]);
eq('l\'orbe du meneur se rappelle', await rappelle('cmd', ORB), true);
await liste([{id:1, name:'Immortals', size:10, lo:[], sel:true, grp:'', enh:null,
              chars:[{name:'Overlord', lo:[{s:0,o:0}]}]}]);
eq('... et se tait quand il ne l\'a pas', await rappelle('cmd', ORB), false);

console.log('\n== 5. les autres porteurs, eux, l\'ont d\'office ==');
await liste([{id:1, name:'Overlord with Translocation Shroud', size:1, lo:[], chars:[], sel:true, grp:'', enh:null},
             {id:2, name:'Catacomb Command Barge', size:1, lo:[{s:0,o:0,n:1},{s:1,o:0,n:1}], chars:[], sel:true, grp:'', enh:null},
             {id:3, name:'Lokhust Lord', size:1, lo:[{s:0,o:0,n:1}], chars:[], sel:true, grp:'', enh:null}]);
const tous = await maint('cmd', true);
eq('l\'Overlord au Linceul de Translocation', tous.filter(x =>
  x.source === 'Overlord with Translocation Shroud' && /Orbe/.test(x.nom)).length, 1);
eq('la Barge de Commandement des Catacombes', tous.filter(x =>
  x.source === 'Catacomb Command Barge' && /Orbe/.test(x.nom)).length, 1);
eq('le Seigneur Lokhust et sa Résurrection', tous.filter(x =>
  x.source === 'Lokhust Lord' && /Résurrection/.test(x.nom)).length, 1);
eq('l\'amulette du Lokhust reste une option non prise',
  await rappelle('cmd', 'Amulette'), false);

console.log('\n== 6. le même lien vaut pour les Macrocytes ==');
await liste([{id:1, name:'Canoptek Macrocytes', size:5, lo:[{s:0,o:0,n:5}], chars:[], sel:true, grp:'', enh:null}]);
eq('sans mandibule, aucun rappel', await rappelle('cbt', 'Mandibule'), false);
await liste([{id:1, name:'Canoptek Macrocytes', size:5, lo:[{s:0,o:0,n:4},{s:0,o:3,n:1}], chars:[], sel:true, grp:'', enh:null}]);
eq('avec elle, il revient', await rappelle('cbt', 'Mandibule'), true);

await b.close();
console.log([...ok, ...ko].join('\n'));
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
process.exit(ko.length ? 1 : 0);
