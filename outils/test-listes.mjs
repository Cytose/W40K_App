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
/* Rattaché, le meneur disparaissait de la liste : il ne restait qu'un
   « avec Warboss » sous les Boyz. Il garde maintenant sa ligne. */
eq('le Warboss garde sa ligne sous les Boyz',
  await p.locator('#padUnits .membre-l .pl-n b').first().textContent(), '↳Warboss');
await p.locator('#padUnits .membre-l .pl-n').first().click(); await p.waitForTimeout(300);
eq('sa ligne ouvre le réglage sur lui',
  await p.locator('#rosterList .membre.on .mn').first().textContent(), 'Warboss');
eq('le bouton Fiche du panneau vise le Warboss',
  await p.locator('.unitfoot .btn').first().textContent(), 'Fiche · Warboss');
await retour();
await p.locator('#padUnits .membre-l .pl-x').first().click(); await p.waitForTimeout(300);
eq('« ⋯ » propose sa fiche',
  await p.locator('#listActList .opt .o1').filter({hasText: /^Fiche$/}).count(), 1);
await p.locator('#listActList .opt').filter({hasText: 'Détacher'}).click(); await p.waitForTimeout(300);
let u2 = await p.evaluate(() => JSON.parse(localStorage.getItem('mathhammer.lists.v1')).listes.slice(-1)[0].units);
eq('détaché, il reprend sa ligne à part', u2.map(x => x.name + ':' + x.chars.length).join(), 'Boyz:0,Warboss:0');
await p.locator('#padUnits .uligne .pl-n').filter({hasText: 'Boyz'}).click(); await p.waitForTimeout(300);
await p.locator('.men-p .chip').filter({hasText: 'Warboss'}).click(); await p.waitForTimeout(300);
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

console.log('\n== 6. les Space Marines ont leur rubrique ==');
await p.goto(base + 'index.html'); await p.waitForTimeout(900);
await p.evaluate(() => localStorage.clear());
await p.reload(); await p.waitForTimeout(900);
await p.click('#btnNewList2'); await p.waitForTimeout(300);
const rubriques = await p.locator('#nlFactions .nl-sous').allInnerTexts();
eq('quatre rubriques, Space Marines en tête', rubriques.map(r => r.trim().toLowerCase()).filter(r => r !== 'tes armées').join(','),
  'space marines,imperium,chaos,xenos');
const rubrique = t => p.evaluate(t => {
  const titre = [...document.querySelectorAll('#nlFactions .nl-sous')].find(x => x.textContent.trim().toLowerCase() === t);
  return [...titre.nextElementSibling.querySelectorAll('.nl-fac')].map(b => b.firstChild.textContent.trim());
}, t);
eq('les six Space Marines, le Codex en tête', (await rubrique('space marines')).join(','),
  'Space Marines,Black Templars,Blood Angels,Dark Angels,Deathwatch,Space Wolves');
const imp = await rubrique('imperium');
eq('plus aucun Space Marine dans l\'Imperium', imp.some(n => /Angels|Wolves|Templars|Deathwatch|^Space Marines$/.test(n)), false);
eq('les Grey Knights restent dans l\'Imperium', imp.indexOf('Grey Knights') >= 0, true);
eq('le Titanicus ne se choisit plus', imp.some(n => /Titanicus/.test(n)), false);
await p.fill('#nlQ', 'marine');
const vus = (await p.locator('#nlFactions .nl-fac').allInnerTexts()).map(x => x.split('\n')[0].trim());
eq('« marine » trouve les chapitres', vus.filter(n => /Blood Angels|Dark Angels|Space Wolves|Black Templars|Deathwatch/.test(n)).length, 5);

console.log('\n== 7. la roue masque les Legends, et s\'en souvient ==');
await p.goto(base + 'index.html'); await p.waitForTimeout(900);
await p.evaluate(() => localStorage.clear());
await p.reload(); await p.waitForTimeout(900);
await p.click('#btnNewList2'); await p.waitForTimeout(300);
await p.fill('#nlQ', 'ork');
await p.locator('#nlFactions .nl-fac').first().click();
await p.locator('#nlDetach .chip').filter({hasText: 'Green Tide'}).click();
await p.click('#nlGo'); await p.waitForTimeout(400);
await p.fill('#uSearch', 'big trakk');
eq('par défaut, les Legends sont là', await p.locator('#uList .opt').filter({hasText: /^Big Trakk/}).count(), 1);
eq('la roue est éteinte', await p.locator('#uPrefsBtn.on').count(), 0);
await p.click('#uPrefsBtn');
eq('la roue ouvre ses préférences', await p.locator('#uPrefs').isVisible(), true);
await p.uncheck('#prefLegends'); await p.waitForTimeout(150);
eq('décochées, les Legends disparaissent', await p.locator('#uList .opt').filter({hasText: /^Big Trakk/}).count(), 0);
eq('un rappel dit combien sont masquées', (await p.locator('#uList .legmasq').innerText()).trim(), '1 unité Legends masquée · Afficher');
eq('la roue s\'allume', await p.locator('#uPrefsBtn.on').count(), 1);
await p.fill('#uSearch', '');
eq('plus aucun badge LEGENDS dans le catalogue', await p.evaluate(() => {
  document.querySelectorAll('#uList .catbar').forEach(c => c.click());
  return document.querySelectorAll('#uList .otag').length && [...document.querySelectorAll('#uList .otag')].filter(t => t.textContent === 'LEGENDS').length;
}), 0);
eq('la préférence est retenue', await p.evaluate(() => JSON.parse(localStorage.getItem('mathhammer.prefs-catalogue')).legends), false);
await p.reload(); await p.waitForTimeout(900);
await p.click('#btnNewList2'); await p.waitForTimeout(300);
await p.fill('#nlQ', 'ork');
await p.locator('#nlFactions .nl-fac').first().click();
await p.click('#nlGo'); await p.waitForTimeout(400);
await p.fill('#uSearch', 'big trakk');
eq('toujours masquées après rechargement', await p.locator('#uList .opt').count(), 0);
await p.locator('#uList .legmasq').click();
eq('le rappel les réaffiche', await p.locator('#uList .opt').filter({hasText: /^Big Trakk/}).count(), 1);
eq('et coche la préférence', await p.isChecked('#prefLegends'), true);

console.log('\n== 8. un détachement montre ses stratagèmes et ses améliorations ==');
/* Kevin, le 03/11 : « quand je choisis un détachement, je voudrais
   savoir les stratagèmes et les améliorations possibles ». */
await p.goto(base + 'index.html'); await p.waitForTimeout(900);
await p.evaluate(() => localStorage.clear());
await p.reload(); await p.waitForTimeout(900);
await p.click('#btnNewList2'); await p.waitForTimeout(300);
await p.fill('#nlQ', 'custodes');
await p.locator('#nlFactions .nl-fac').first().click();
eq('rien de coché, aucune fiche', await p.locator('#nlRegle .dfiche').count(), 0);
await p.locator('#nlDetach .chip').filter({hasText: 'Aquilan Shield'}).first().click();
const fiche = p.locator('#nlRegle .dfiche').first();
eq('le détachement coché a sa fiche', await p.locator('#nlRegle .dfiche').count(), 1);
eq('ses trois stratagèmes', (await fiche.locator('summary').first().innerText()).trim().toLowerCase(), '3 stratagèmes');
eq('ses deux améliorations', (await fiche.locator('summary').nth(1).innerText()).trim().toLowerCase(), '2 améliorations');
await fiche.locator('summary').first().click();
await fiche.locator('.strat > button').first().click();
eq('un stratagème se déplie avec son texte', await fiche.locator('.strat.open .sbody dd').count() >= 3, true);
await fiche.locator('summary').nth(1).click();
const enh = fiche.locator('.dfiche-e').filter({hasText: 'Not a Shell Wasted'});
eq('l\'amélioration dit son coût', (await enh.locator('.cp').innerText()).trim(), '10 pts');
eq('et qui peut la porter', /Shield-Captain/.test(await enh.locator('.dfiche-qui').innerText()), true);
await p.selectOption('#nlVoir', 'Lions of the Emperor');
eq('un autre se consulte sans être pris', await p.locator('#nlRegle .dfiche.apercu').count(), 1);
eq('rien n\'a été coché pour autant', await p.locator('#nlDetach .chip.on').count(), 1);
await p.locator('#nlRegle .dfiche-prendre').click();
eq('le bouton de l\'aperçu le prend', await p.locator('#nlDetach .chip.on').count(), 2);
/* la table nécrone vise des groupes de KW : ils doivent se lire en fiches */
await p.fill('#nlQ', 'nécrons');
await p.locator('#nlFactions .nl-fac').first().click();
const porteurs = await p.evaluate(() =>
  ['Dimensional Sanctum', 'Autodivinator'].map(n => ROSTER.porteursEnh('necrons', n).noms));
eq('« cryptek » devient des noms de fiches', porteurs.length > 0 && porteurs.every(n => n.length && n.every(x => x !== 'cryptek')), true);
/* l'éditeur, lui, déplie la fiche sous chaque ligne */
await p.click('#nlGo'); await p.waitForTimeout(400);
await retour();
await p.evaluate(() => document.getElementById('btnAddDetach').click()); await p.waitForTimeout(200);
await p.locator('#dList .dvoir summary').first().click(); await p.waitForTimeout(200);
eq('la feuille des détachements déplie une fiche', await p.locator('#dList .dvoir .dfiche').count(), 1);

console.log('\n== 9. la feuille des détachements reste ouverte ==');
const ouverte = () => p.evaluate(() => getComputedStyle(document.getElementById('sheetDetach')).display !== 'none');
const pris = () => p.locator('#dList .opt.sel').count();
const avant = await pris();
await p.locator('#dList .opt:not(.sel):not([disabled])').first().click(); await p.waitForTimeout(150);
eq('un toucher prend le détachement', await pris(), avant + 1);
eq('la feuille reste ouverte après un choix', await ouverte(), true);
const libre = p.locator('#dList .opt:not(.sel):not([disabled])');
if(await libre.count()){
  await libre.first().click(); await p.waitForTimeout(150);
  eq('un second détachement se prend dans la foulée', await pris(), avant + 2);
}
const n = await pris();
await p.locator('#dList .opt.sel').last().click(); await p.waitForTimeout(150);
eq('toucher un détachement pris le retire', await pris(), n - 1);
eq('et la feuille reste ouverte', await ouverte(), true);
await p.locator('#sheetDetach [data-close]').click(); await p.waitForTimeout(150);
eq('le bouton Terminé ramène à la liste', await ouverte(), false);

await b.close();
console.log([...ok, ...ko].join('\n'));
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
process.exit(ko.length ? 1 : 0);
