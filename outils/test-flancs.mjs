/* LES ARMES DE FLANC VONT PAR PAIRE

   Un joueur d'Astra Militarum ne pouvait mettre « qu'une seule » arme de
   flanc sur son Leman Russ : l'option s'appelait « Heavy bolter », et le
   compteur s'arrêtait à un. La fiche dit pourtant « 2 heavy bolters,
   2 heavy flamers, 2 multi-meltas ou 2 plasma cannons ». Et comme le
   nombre était rangé par arme (`n`), le bolter lourd de COQUE comptait
   double, lui aussi.

   Désormais une option écrit ses exemplaires en répétant l'indice, et
   `n` ne compte que les armes d'office.

   Lancer : node outils/test-flancs.mjs  (site servi sur :8099, ou $SITE) */
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
};
/* nombre d'exemplaires de chaque arme, lu dans les profils construits :
   « Heavy bolter ×3 » → {"heavy bolter": 3} */
const portes = async (id) => {
  const pr = await p.evaluate(i => window.ROSTER.profils(i, 'T'), id);
  const out = {};
  (pr || []).forEach(x => {
    const m = x.label.match(/^(.*?)\s*×(\d+)$/);
    if(m) out[m[1].replace(/^➤\s*/, '').toLowerCase()] = +m[2];
  });
  return out;
};
const unite = (name, lo) => ({id:1, name, size:1, lo, chars:[], sel:true, grp:'', enh:null});

console.log('\n== 1. Leman Russ : les flancs se lisent par paire ==');
await charge('astra', [unite('Leman Russ Battle Tank', [{s:0, o:0, n:1}])]);
const lr = await p.evaluate(() => ARMEMENT['Leman Russ Battle Tank']);
eq('l\'option de flanc donne deux bolters lourds', lr.s[1].o[0], [0, 0]);
eq('n ne compte plus les armes de flanc', lr.n || null, null);
await p.evaluate(() => window.ROSTER.liste());
const libelles = await p.evaluate(() => [...document.querySelectorAll('.lo .ln')].map(e => e.textContent));
eq('le libellé annonce la paire', ['2× Heavy bolter', '2× Heavy flamer', '2× Multi-melta', '2× Plasma cannon']
  .every(t => libelles.some(l => l.startsWith(t + ' '))), true);
eq('le multi-fuseau garde son nom', libelles.some(l => /^Multi /.test(l)), false);

console.log('\n== 2. coque et flancs ne se confondent plus ==');
/* coque : bolter lourd (option 1) ; flancs : bolters lourds (option 0) */
await charge('astra', [unite('Leman Russ Battle Tank', [{s:0, o:1, n:1}, {s:1, o:0, n:1}])]);
eq('bolter de coque + deux de flanc = trois', (await portes(1))['heavy bolter'], 3);
await charge('astra', [unite('Leman Russ Battle Tank', [{s:0, o:1, n:1}])]);
eq('le bolter de coque seul compte un', (await portes(1))['heavy bolter'], 1);
await charge('astra', [unite('Leman Russ Battle Tank', [{s:0, o:0, n:1}, {s:1, o:2, n:1}])]);
eq('deux multi-fuseurs de flanc', (await portes(1))['multi-melta'], 2);
await charge('astra', [unite('Leman Russ Battle Tank', [{s:0, o:0, n:1}, {s:1, o:3, n:1}])]);
eq('deux canons plasma de flanc', (await portes(1))['plasma cannon - standard'], 2);

console.log('\n== 3. Baneblade : un bolter jumelé de coque, pas deux ==');
await charge('astra', [unite('Baneblade', [{s:0, o:0, n:1}])]);
let P = await portes(1);
eq('bolter lourd jumelé de coque : un', P['twin heavy bolter'], 1);
eq('lance-flammes lourds jumelés : deux', P['twin heavy flamer'], 2);
eq('lascanons d\'office : deux', P['lascannon'], 2);
await charge('astra', [unite('Baneblade', [{s:0, o:0, n:1}, {s:1, o:0, n:1}])]);
P = await portes(1);
eq('avec les flancs : quatre lascanons', P['lascannon'], 4);
eq('avec les flancs : trois bolters jumelés', P['twin heavy bolter'], 3);

console.log('\n== 4. le Monolithe garde ses quatre rayons ==');
await charge('necrons', [unite('Monolith', [{s:0, o:0, n:1}])]);
eq('quatre rayons de mort', (await portes(1))['death ray'], 4);

console.log('\n== 5. les fusils radiants ne sont plus une seule arme ==');
await charge('astra', [{id:1, name:'Tempestus Scions', size:5, lo:[], chars:[], sel:true, grp:'', enh:null}]);
P = await portes(1);
eq('le fusil laser radiant a sa ligne', P['hot-shot lasgun'] > 0, true);

console.log('\n' + ok.length + ' ✓, ' + ko.length + ' ✗');
ko.forEach(x => console.log(x));
await b.close();
process.exit(ko.length ? 1 : 0);
