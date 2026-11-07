/* LES CHOIX D'ARMES SURVIVENT À LA MISE À JOUR DU 07/11/2026

   Une liste Space Marines enregistrée avant la mise à jour avait choisi,
   sur sa Vanguard Veteran Squad, le pistolet à plasma du 3e emplacement
   (2:2). L'emplacement « Vanguard Veteran Weapon » a disparu : ce choix
   est désormais en 1:2. Rouverte, la liste doit le retrouver — et une
   liste faite après la mise à jour ne doit pas bouger.

   Lancer : node outils/test-remap-armes.mjs  (site servi sur :8099, ou $SITE) */
import { chromium, base } from './navigateur.mjs';
const ok = [], ko = [];
const eq = (quoi, vu, att) => { const b = JSON.stringify(vu) === JSON.stringify(att);
  (b ? ok : ko).push((b ? '  ✓ ' : '  ✗ ') + quoi + ' : ' + JSON.stringify(vu) +
  (b ? '' : ' au lieu de ' + JSON.stringify(att))); };

const b = await chromium();
const p = await b.newPage();
p.on('pageerror', e => ko.push('  ✗ PAGEERROR ' + e.message));
await p.goto(base + 'index.html'); await p.waitForTimeout(800);
const liste = (id, maj, armV) => Object.assign({
  id, nom: id, faction: 'spacemarines', cap: 2000, detach: [], fd: '', nextId: 3, maj,
  units: [{ id: 1, name: 'Vanguard Veteran Squad', size: 5, sel: true, chars: [],
            lo: [{s:0, o:2, n:1}, {s:2, o:2, n:4}] }]
}, armV ? {armV} : {});
await p.evaluate(L => localStorage.setItem('mathhammer.lists.v1',
  JSON.stringify({ listes: L, actif: L[0].id })), [
  liste('avant', Date.UTC(2026, 10, 1)),
  liste('apres', Date.UTC(2026, 10, 8)),
  liste('marquee', Date.UTC(2026, 10, 1), 1)]);
await p.reload(); await p.waitForTimeout(1200);
const lo = id => p.evaluate(id => {
  const o = JSON.parse(localStorage.getItem('mathhammer.lists.v1'));
  const L = o.listes.find(x => x.id === id);
  const c = window.ROSTER.realigne(L);
  return [c.armV, c.units[0].lo.map(l => [l.s, l.o, l.n])];
}, id);
/* le localStorage brut : la page a pu deja normaliser et sauver la
   liste active, on relit donc nos propres listes telles que posees */
await p.evaluate(L => localStorage.setItem('mathhammer.lists.v1',
  JSON.stringify({ listes: L, actif: 'x' })), [
  liste('avant', Date.UTC(2026, 10, 1)),
  liste('apres', Date.UTC(2026, 10, 8)),
  liste('marquee', Date.UTC(2026, 10, 1), 1)]);
eq('liste d\'avant : plasma 0:2 → 0:1, plasma 2:2 → 1:2', await lo('avant'), [1, [[0,1,1],[1,2,4]]]);
eq('liste d\'après la mise à jour : rien ne bouge', await lo('apres'), [1, [[0,2,1],[2,2,4]]]);
eq('liste déjà réalignée : rien ne bouge', await lo('marquee'), [1, [[0,2,1],[2,2,4]]]);
await b.close();
console.log(ok.concat(ko).join('\n'));
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
process.exit(ko.length ? 1 : 0);
