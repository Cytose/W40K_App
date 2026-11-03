/* CRÉER ET RANGER UNE LISTE

   Le retour du téléphone quittait l'application ; la liste disparaissait
   derrière le catalogue ; un personnage ne pouvait rejoindre aucune
   unité hors des Nécrons, parce que les autres tables écrivent « Meneur »
   là où le code attendait « Leader ». Ce test refait le parcours.

   Lancer : node outils/test-listes.mjs  (site servi sur :8099, ou $SITE) */
import { chromium, base } from './navigateur.mjs';
const ok = [], ko = [];
const eq = (quoi, vu, att) => (vu === att ? ok : ko).push(
  (vu === att ? '  ✓ ' : '  ✗ ') + quoi + ' : ' + JSON.stringify(vu) +
  (vu === att ? '' : ' au lieu de ' + JSON.stringify(att)));

const b = await chromium();
const p = await b.newPage({ viewport:{width:400,height:850} });
p.on('pageerror', e => ko.push('  ✗ PAGEERROR ' + e.message));
p.on('dialog', d => d.dismiss());
await p.goto('about:blank');
await p.goto(base + 'index.html'); await p.waitForTimeout(800);
await p.evaluate(() => localStorage.clear());
await p.reload(); await p.waitForTimeout(900);
const etat = () => p.evaluate(() => ({
  feuilles: [...document.querySelectorAll('.sheet.open')].map(x => x.id).join(','),
  editeur: !document.getElementById('listEditor').hidden,
  panneau: !document.getElementById('btnBackPad').hidden }));
const retour = async () => { await p.goBack({waitUntil:'commit'}).catch(()=>{}); await p.waitForTimeout(300); };
const ajoute = async (q, re) => {
  await p.fill('#uSearch', q);
  await p.locator('#uList .opt').filter({hasText: re}).first().click();
};

console.log('\n== 1. une nouvelle liste en un écran ==');
await p.click('#btnNewList2'); await p.waitForTimeout(300);
await p.fill('#nlQ', 'ork');
eq('la recherche ne laisse que les Orks', await p.locator('#nlFactions .nl-fac').count(), 1);
await p.locator('#nlFactions .nl-fac').first().click();
await p.locator('#nlDetach .chip').filter({hasText: 'Green Tide'}).click();
eq('le nom se propose tout seul', await p.inputValue('#nlNom'), 'Orks · Green Tide · 2000');
await p.click('#nlGo'); await p.waitForTimeout(400);
eq('on sort droit dans le catalogue', (await etat()).feuilles, 'sheetUnit');
const L = await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('mathhammer.lists.v1'));
  return o.listes.find(x => x.id === o.actif); });
eq('la liste est orke', L.faction, 'orks');
eq('avec son détachement', JSON.stringify(L.detach), '["Green Tide"]');

console.log('\n== 2. la liste reste visible à côté du catalogue ==');
await ajoute('boyz', /^Boyz/); await ajoute('warboss', /^Warboss/);
eq('deux lignes dans « Ma liste »', await p.locator('#uListeCorps .pl-l').count(), 2);
eq('le catalogue dit combien on en a', await p.locator('#uList .opt .dans').count(), 1);
await p.locator('#uListeCorps .pl-l').filter({hasText: 'Boyz'}).locator('.pl-eff button', {hasText: '20'}).click();
eq('l\'effectif se change depuis la liste',
  await p.evaluate(() => JSON.parse(localStorage.getItem('mathhammer.lists.v1')).listes.slice(-1)[0].units[0].size), 20);

console.log('\n== 3. le retour remonte d\'un écran ==');
await retour();
let e = await etat();
eq('le retour ferme le catalogue', e.feuilles, '');
eq('et laisse l\'éditeur ouvert', e.editeur, true);
eq('la liste est en lignes', await p.locator('#padUnits .uligne').count(), 2);
await p.locator('#padUnits .uligne .pl-n').filter({hasText: 'Boyz'}).click(); await p.waitForTimeout(300);
eq('une ligne ouvre le réglage de l\'unité', (await etat()).panneau, true);

console.log('\n== 4. un Meneur rejoint son unité ==');
await p.locator('.men-p .chip').filter({hasText: 'Warboss'}).click(); await p.waitForTimeout(300);
const u = await p.evaluate(() => JSON.parse(localStorage.getItem('mathhammer.lists.v1')).listes.slice(-1)[0].units);
eq('le Warboss mène les Boyz', u.length === 1 && u[0].chars.map(c => c.name).join(), 'Warboss');
eq('il n\'est plus compté à part', u.length, 1);
await retour();
e = await etat();
eq('le retour ramène à la liste', e.panneau, false);
eq('sans quitter l\'éditeur', e.editeur, true);
await retour();
eq('puis à mes listes', (await etat()).editeur, false);
await retour();
eq('et enfin hors de l\'application', p.url(), 'about:blank');

await b.close();
console.log([...ok, ...ko].join('\n'));
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
process.exit(ko.length ? 1 : 0);
