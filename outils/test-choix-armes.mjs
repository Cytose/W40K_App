/* LES CHOIX D'ARMES DE TOUTES LES FACTIONS

   Seuls les Nécrons avaient une table ARMEMENT : ailleurs, tout était
   d'office, et un Shield-Captain portait lance, hache et lame à la fois.
   outils/armement.py la déduit désormais de BSData. On vérifie ici
   qu'une figurine seule choisit, et qu'une escouade à sergent répartit
   ses choix sur le bon nombre de figurines.

   Lancer : node outils/test-choix-armes.mjs  (site servi sur :8099, ou $SITE) */
import { chromium, base } from './navigateur.mjs';
const ok = [], ko = [];
const eq = (quoi, vu, att) => (JSON.stringify(vu) === JSON.stringify(att) ? ok : ko).push(
  (JSON.stringify(vu) === JSON.stringify(att) ? '  ✓ ' : '  ✗ ') + quoi + ' : ' + JSON.stringify(vu) +
  (JSON.stringify(vu) === JSON.stringify(att) ? '' : ' au lieu de ' + JSON.stringify(att)));

const b = await chromium();
const p = await b.newPage({ viewport:{width:430,height:1200} });
p.on('pageerror', e => ko.push('  ✗ PAGEERROR ' + e.message));
await p.goto(base + 'index.html'); await p.waitForTimeout(800);

const charge = async (faction, units) => {
  await p.evaluate(([f, u]) => { localStorage.clear(); localStorage.setItem('mathhammer.lists.v1',
    JSON.stringify({v:1, actif:'l', listes:[{id:'l', nom:'T', faction:f, cap:2000, detach:[],
      nextId:9, units:u}]})); }, [faction, units]);
  await p.reload(); await p.waitForTimeout(1000);
  return p.evaluate(() => window.ROSTER.liste());
};

console.log('\n== 1. le Shield-Captain choisit son arme ==');
let L = await charge('custodes', [{id:1, name:'Shield-Captain', size:1, lo:[], chars:[], sel:true, grp:'', enh:null}]);
const sc = await p.evaluate(() => ARMEMENT['Shield-Captain']);
eq('il n\'a rien d\'office', sc.f, []);
eq('un emplacement à quatre options', sc.s[0].o.length, 4);
eq('il en prend une, et une seule', L.unites[0].lo || (await p.evaluate(() =>
  JSON.parse(localStorage.getItem('mathhammer.lists.v1')).listes[0].units[0].lo)), [{s:0, o:0, n:1}]);

console.log('\n== 2. l\'escouade à sergent répartit sur le bon effectif ==');
await charge('spacemarines', [{id:1, name:'Intercessor Squad', size:5, lo:[], chars:[], sel:true, grp:'', enh:null}]);
const lo = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('mathhammer.lists.v1')).listes[0].units[0].lo);
const arm = await p.evaluate(() => ARMEMENT['Intercessor Squad']);
const nbs = arm.s.map(s => s.nb || 0);
eq('le sergent a ses deux emplacements, une figurine chacun', nbs.filter(n => n === 1).length, 2);
eq('les autres figurines se partagent le reste', nbs.filter(n => n === -1).length, 1);
eq('l\'armement de départ couvre 1 + 1 + 4 figurines',
  arm.s.map((s, si) => lo.filter(l => l.s === si).reduce((a, l) => a + l.n, 0)), [1, 1, 4]);

console.log(ok.join('\n')); if(ko.length) console.log(ko.join('\n'));
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
await b.close(); process.exit(ko.length ? 1 : 0);
