/* LES OPTIONS QUI SE PAIENT

   Le Munitorum fait payer certaines options (« Wargear options ») en plus
   du barème : 25 points par Praesidium Shield sur un Shield-Captain. Ce
   test vérifie que la liste les compte, qu'elle les retire quand l'option
   part, et qu'elle les annonce à côté de l'option.

   Lancer : node outils/test-options.mjs  (site servi sur :8099, ou $SITE) */
import { chromium, base } from './navigateur.mjs';
const ok = [], ko = [];
const eq = (quoi, vu, att) => (vu === att ? ok : ko).push(
  (vu === att ? '  ✓ ' : '  ✗ ') + quoi + ' : ' + JSON.stringify(vu) +
  (vu === att ? '' : ' au lieu de ' + JSON.stringify(att)));

const b = await chromium();
const p = await b.newPage({ viewport:{width:400,height:850} });
p.on('pageerror', e => ko.push('  ✗ PAGEERROR ' + e.message));
p.on('dialog', d => d.dismiss());
await p.goto(base + 'index.html'); await p.waitForTimeout(800);
await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);

const ess = u => p.evaluate(u => ROSTER.essaiPoints(u), u);
const SC = lo => ({id: 1, name: "Shield-Captain", size: 1, lo, chars: [], sel: true});

console.log('\n== 1. Shield-Captain : le bouclier se paie ==');
await p.click('#btnNewList2'); await p.waitForTimeout(300);
await p.fill('#nlQ', 'custodes'); await p.locator('#nlFactions .nl-fac').first().click();
await p.locator('#nlDetach .chip').first().click();
await p.click('#nlGo'); await p.waitForTimeout(400);
await p.fill('#uSearch', 'shield-captain');
eq('le catalogue annonce 205 avec le bouclier d\'office',
  /×1 · 205 pts/.test(await p.locator('#uList .opt').filter({hasText: /^Shield-Captain\s*×1/}).first().innerText()), true);
await p.locator('#uList .opt').filter({hasText: /^Shield-Captain\s*×1/}).first().click();
await p.waitForTimeout(200);
const ligne = await p.locator('#uListeCorps .pl-l').first().innerText();
eq('ajouté du catalogue, pyrithite et bouclier d\'office : 180 + 25', /\b205\b/.test(ligne), true);
eq('la hache rend le bouclier', await ess([SC([{s:0, o:3, n:1}])]), 180);
eq('la lame Paragon le garde', await ess([SC([{s:0, o:1, n:1}])]), 205);
eq('le second Shield-Captain : 200 + 25', await ess([SC([{s:0, o:0, n:1}]),
  {...SC([{s:0, o:0, n:1}]), id: 2}]), 205 + 225);
eq('l\'option annonce son prix et ce qu\'il paie', /Praesidium Shield \+25 pts/.test(await p.evaluate(() => ROSTER.prixOption("Shield-Captain", 0, 0))), true);
eq('une option gratuite n\'annonce rien', await p.evaluate(() => ROSTER.prixOption("Shield-Captain", 0, 2)), '');
const lo3 = await p.evaluate(() => ROSTER.loDefaut("Custodian Guard Sodality", 3));
eq('rattaché comme personnage, il paie aussi', await ess([{id: 3, name: "Custodian Guard Sodality", size: 3,
  lo: lo3, chars: [{name: "Shield-Captain", lo: [{s:0, o:0}]}], sel: true}]), 240 + 180 + 25);

console.log('\n== 2. une escouade compte ses figurines ==');
eq('Terminator Assault Squad : 4 boucliers à 5', await p.evaluate(() => ROSTER.optionsUnite("spacemarines",
  {name: "Terminator Assault Squad", size: 5, chars: [],
   lo: [{s:0, o:1, n:1}, {s:1, o:0, n:3}, {s:1, o:1, n:1}]})), 20);

console.log('\n== 3. chaque entrée tombe sur une vraie option ==');
eq('aucune entrée orpheline', (await p.evaluate(() => ROSTER.optionsOrphelines())).join(' '), '');

await b.close();
console.log(ok.join('\n')); if (ko.length) console.log(ko.join('\n'));
console.log('\n' + ok.length + ' ✓, ' + ko.length + ' ✗');
process.exit(ko.length ? 1 : 0);
