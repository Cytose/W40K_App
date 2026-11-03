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

console.log('\n== 5. plusieurs détachements dès la création ==');
/* Les détachements à 1 PD n'affichaient pas leur coût, et l'écran n'en
   gardait qu'un : impossible d'en cumuler trois à 2000 pts. */
await p.goto(base + 'index.html'); await p.waitForTimeout(900);
await p.click('#btnNewList2'); await p.waitForTimeout(300);
await p.fill('#nlQ', 'custodes');
await p.locator('#nlFactions .nl-fac').first().click();
const puceCustodes = t => p.locator('#nlDetach .chip').filter({hasText: t}).first();
eq('chaque détachement dit son coût, même à 1 PD',
  await p.locator('#nlDetach .chip').filter({hasNotText: 'Plus tard'}).evaluateAll(
    l => l.every(x => / PD/.test(x.textContent))), true);
await puceCustodes('Auric Champions').click();
await puceCustodes('Lions of the Emperor').click();
await puceCustodes('Null Maiden Vigil').click();
eq('trois détachements à 1 PD tiennent dans 3 PD',
  await p.locator('#nlDetach .chip.on').count(), 3);
eq('le quatrième est grisé', await puceCustodes('Honoured Companions').isDisabled(), true);
await puceCustodes('Null Maiden Vigil').click();
eq('un détachement coché se décoche', await p.locator('#nlDetach .chip.on').count(), 2);
await p.locator('#nlFormat .chip').filter({hasText: '1000'}).click();
eq('à 1000 pts, il ne reste que ce qui tient en 2 PD', await p.locator('#nlDetach .chip.on').count(), 2);
await p.locator('#nlFormat .chip').filter({hasText: '2000'}).click();
await puceCustodes('Null Maiden Vigil').click();
await p.click('#nlGo'); await p.waitForTimeout(400);
eq('la liste naît avec ses trois détachements', await p.evaluate(() =>
  JSON.parse(localStorage.getItem('mathhammer.lists.v1')).listes.slice(-1)[0].detach.length), 3);

console.log('\n== 6. les Space Marines tiennent dans une tuile ==');
await p.goto(base + 'index.html'); await p.waitForTimeout(900);
await p.evaluate(() => localStorage.clear());
await p.reload(); await p.waitForTimeout(900);
await p.click('#btnNewList2'); await p.waitForTimeout(300);
const noms = () => p.locator('#nlFactions .nl-fac').allInnerTexts()
  .then(t => t.map(x => x.split('\n')[0].trim()));
let vus = await noms();
eq('une seule tuile Space Marines', vus.filter(n => n === 'Space Marines').length, 1);
eq('les chapitres sont repliés', ['Blood Angels','Dark Angels','Space Wolves','Black Templars','Deathwatch']
  .filter(n => vus.indexOf(n) >= 0).length, 0);
eq('le Titanicus ne se choisit plus', vus.some(n => /Titanicus/.test(n)), false);
eq('les Grey Knights restent à part', vus.indexOf('Grey Knights') >= 0, true);
await p.locator('#nlFactions .nl-groupe').click();
vus = await noms();
eq('la tuile déplie les six', vus.filter(n => /Blood Angels|Dark Angels|Space Wolves|Black Templars|Deathwatch/.test(n)).length, 5);
await p.locator('#nlFactions .nl-chapitres .nl-fac').filter({hasText: 'Blood Angels'}).click();
eq('un chapitre se choisit', await p.locator('#nlGo').isDisabled(), false);
eq('la tuile dit lequel', (await p.locator('#nlFactions .nl-groupe').innerText()).includes('Blood Angels'), true);
await p.fill('#nlQ', 'marine');
vus = await noms();
eq('« marine » trouve les chapitres', vus.filter(n => /Blood Angels|Dark Angels|Space Wolves|Black Templars|Deathwatch/.test(n)).length, 5);

await b.close();
console.log([...ok, ...ko].join('\n'));
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
process.exit(ko.length ? 1 : 0);
