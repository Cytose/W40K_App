/* ============================================================
   UNE SECONDE FACTION RÉELLE, À L'ÉCRAN

   test-factions.mjs éprouve le registre avec une faction jouet. Celle-ci
   éprouve la vraie : data-custodes.js, généré depuis BSData et le
   Munitorum, sans qu'une ligne en ait été relue à la main.

   Ce qu'elle vérifie n'est pas que les chiffres sont beaux, c'est qu'ils
   traversent l'application : une liste custodes se relit, se compte, se
   simule, s'affiche et se pose sur le plateau — y compris là où la
   génération laisse un trou (les tables du simulateur), qui doit se
   traverser sans casser.

   Lancer : node outils/test-custodes.mjs (le site servi sur :8099, ou $SITE)
   ============================================================ */
import { chromium, base } from './navigateur.mjs';

const nav = await chromium();
const ctx = await nav.newContext({ viewport: { width: 390, height: 1400 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
p.on('dialog', d => d.accept());

const ok = [], ko = [];
const T = (nom, v, att) => {
  const bon = typeof att === 'function' ? att(v) : JSON.stringify(v) === JSON.stringify(att);
  (bon ? ok : ko).push(nom + ' : ' + JSON.stringify(v) +
    (bon ? '' : ' (attendu ' + JSON.stringify(att) + ')'));
};

await p.goto(base); await p.waitForTimeout(800);

/* ---- la faction est livrée ---- */
T('les Custodes sont au registre',
  await p.evaluate(() => listeFactions().map(f => f.cle)), v => v.includes('custodes'));
T('sous leur nom', await p.evaluate(() => factionNom('custodes')), 'Adeptus Custodes');

/* ---- une liste custodes, relue depuis le stockage ---- */
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v: 1, actif: 'cust', listes: [
    { id: 'cust', nom: 'Garde du Trône', faction: 'custodes', cap: 2000, nextId: 4,
      detach: ['Shield Host'], fd: '', units: [
        { id: 1, name: 'Custodian Guard', size: 5, lo: [], chars: [], sel: true, grp: '', enh: null },
        { id: 2, name: 'Allarus Custodians', size: 3, lo: [], chars: [], sel: true, grp: '', enh: null },
        { id: 3, name: 'Vertus Praetors', size: 3, lo: [], chars: [], sel: true, grp: '', enh: null }
      ] }
  ] }));
});
await p.reload(); await p.waitForTimeout(1400);

T('la faction custodes est en service', await p.evaluate(() => FACTION_ACTIVE), 'custodes');
T('sa table est chargée', await p.evaluate(() => UNITS.length), 31);
const stock = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('mathhammer.lists.v1')).listes[0].units.map(u => u.name));
T('les trois unités ont survécu à la relecture', stock,
  ['Custodian Guard', 'Allarus Custodians', 'Vertus Praetors']);

/* ---- le total de points, calculé par l'application ---- */
/* Custodian Guard ×5 = 215, Allarus ×3 = 165, Vertus Praetors ×3 : on
   ne fige pas le troisième, on demande à la table ce qu'elle en dit et
   on vérifie que l'écran affiche la somme. C'est l'écran qu'on éprouve,
   pas le Munitorum. */
const pts = await p.evaluate(() => {
  const somme = [['Custodian Guard', 5], ['Allarus Custodians', 3], ['Vertus Praetors', 3]]
    .reduce((a, [n, t]) => a + ptsPour(UNITS.find(u => u[0] === n), t, 1), 0);
  const b = document.querySelector('#ptsbar .c .v');
  return { attendu: somme, affiche: b ? b.textContent.trim() : '—' };
});
T('le prix des Gardes Custodiens ×5', await p.evaluate(() =>
  ptsPour(UNITS.find(u => u[0] === 'Custodian Guard'), 5, 1)), 215);
T("l'écran affiche le total de la liste", pts.affiche, v => v.startsWith(String(pts.attendu)));

/* le seuil de réquisition : la 4e copie coûte plus cher, et l'application
   le sait déjà lire — c'est le même mécanisme que les Destroyers Lokhust */
T('le barème monte au 4e exemplaire', await p.evaluate(() => {
  const u = UNITS.find(x => x[0] === 'Custodian Guard');
  return [ptsPour(u, 5, 1), ptsPour(u, 5, 4)];
}), v => v[1] > v[0]);

/* ---- le simulateur tourne sur ces profils ---- */
await p.evaluate(() => document.querySelector('[data-s="scSim"]').click());
await p.waitForTimeout(700);
const simu = await p.evaluate(() => {
  const u = UNITS.find(x => x[0] === 'Custodian Guard');
  const w = WEAPONS.filter(x => x[0] === 'Custodian Guard');
  /* la lance gardienne de cinq Gardes Custodiens, en corps a corps,
     contre un Space Marine : A5 CT2+ F7 PA2 D2, cible E4 Svg3+ PV2 */
  /* on part de l'état par défaut de l'écran : le moteur attend une
     trentaine de champs — crits, relances, modificateurs — et un objet
     bricolé à la main les laisse tous à undefined, ce qui rend zéro
     touche sans rien signaler. */
  const lance = ENG.analytic(Object.assign({}, SIM.S, {
    attacks: '5', kind: 'C', bs: 2, str: 7, ap: 2, dmg: '2', models: 5,
    tough: 4, sv: 3, inv: 0, wounds: 2, fnp: 0, cover: false, lethal: false
  }));
  return { armes: w.length, profil: [u[1], u[2], u[3], u[4], u[5], u[12]],
           champs: lance ? Object.keys(lance) : [],
           touches: lance && lance.hits, blessures: lance && lance.wounds,
           degats: lance && lance.rawDmg };
});
T('les Gardes Custodiens ont leurs 5 profils d\'arme', simu.armes, 5);
T('leur profil est celui de la fiche (M6 E6 Svg2+ Inv4++ PV3 CO2)',
  simu.profil, [6, 6, 2, 4, 3, 2]);
T('le moteur rend ses espérances sur un profil custodes',
  simu.champs, v => v.includes('hits') && v.includes('wounds') && v.includes('rawDmg'));
/* Le moteur est déjà éprouvé ailleurs : ce qu'on vérifie ici, c'est que
   les chiffres custodes le traversent. `models` est l'effectif de la
   CIBLE, pas de l'attaquant : le moteur compte une lance gardienne, ses
   cinq attaques, et les cinq sixièmes qui portent à CC 2+. */
T('cinq attaques à CC 2+ donnent 4,17 touches', simu.touches,
  v => Math.abs(v - 25 / 6) < 0.01);
T('elles blessent', simu.blessures, v => v > 0 && v <= simu.touches);
T('et font des dégâts', simu.degats, v => v > 0);

/* ---- la fiche d'unité s'ouvre, avec ses aptitudes ---- */
const fiche = await p.evaluate(() => {
  const a = APTITUDES['Custodian Guard'] || [];
  return { n: a.length, noms: a.map(x => x[0]), texte: (a[0] || ['', ''])[1].slice(0, 40) };
});
T('la fiche porte ses aptitudes', fiche.n, v => v >= 2);
T('nommées', fiche.noms, v => v.includes("Martial Ka'tah"));
T('avec un texte, en anglais, et sans balisage BSData',
  fiche.texte, v => v.length > 10 && !/\*\*|\^\^/.test(v));

/* ---- les socles, depuis le Base Size Guide ---- */
T('les 31 fiches ont leur socle', await p.evaluate(() => Object.keys(SOCLES).length), 31);
T('le Garde Custodien est sur un 40 mm', await p.evaluate(() => SOCLES['Custodian Guard']), '40');
T('le Prétorien Vertus sur un ovale 75x42',
  await p.evaluate(() => SOCLES['Vertus Praetors']), '75x42');
T('BASES est reconstruit depuis eux, ovale compris',
  await p.evaluate(() => [Object.keys(BASES).length, BASES['Vertus Praetors']]), [31, '75×42']);

/* ---- les stratagèmes, depuis l'export de Wahapedia ---- */
/* Ils étaient vides à la livraison de la faction : ni BSData ni le
   Munitorum ne les portent. Ils viennent maintenant de l'export du
   site — quarante-cinq de détachement, onze de base — et l'onglet
   n'affiche que ceux des détachements retenus par la liste. */
T('les 9 détachements ont leurs stratagèmes', await p.evaluate(() =>
  [STRATS.filter(x => x[1] !== 'Core').length,
   new Set(STRATS.filter(x => x[1] !== 'Core').map(x => x[1])).size]), [45, 9]);
T('plus les stratagèmes de base', await p.evaluate(() =>
  STRATS.filter(x => x[1] === 'Core').length), 11);
T('l\'onglet en dessine ceux du détachement retenu, et les rangs de base',
  await p.evaluate(() => {
    const h = document.getElementById('stratList');
    return [h.querySelectorAll('.strat').length,
            [...h.querySelectorAll('.stratsep')].map(x => x.textContent)];
  }), v => v[0] === 17 && v[1].length === 2 && v[1][1] === 'Stratagèmes de base');
T('un stratagème dit quand, sur quoi et ce qu\'il fait', await p.evaluate(() => {
  const x = STRATS.find(s => s[0] === 'Vengeful Retaliation') || STRATS[0];
  return [x[3] > 0, x[4].length > 10, x[6].length > 10, /<|&[a-z]+;/.test(x[4] + x[5] + x[6])];
}), [true, true, true, false]);

/* ---- les trous qui restent se traversent sans casser ---- */
T('et les tables du simulateur aussi', await p.evaluate(() =>
  [Object.keys(APTIS_COND).length, AURAS_ARMEE.length, Object.keys(OCTROIS_DETACH).length]),
  [0, 0, 0]);

/* le Plateau lit SOCLES : il pose maintenant sur les vrais socles */
await p.evaluate(() => document.querySelector('[data-s="scMap"]')?.click());
await p.waitForTimeout(1000);
const n = await p.locator('[data-pose]').count();
for (let i = 0; i < n; i++) { await p.locator('[data-pose]').nth(i).click({ force: true }); await p.waitForTimeout(250); }
const plateau = await p.evaluate(() => window.PLATEAU && window.PLATEAU.etat());
T('le Plateau propose de poser les trois unités', n, 3);
T('et pose leurs 11 figurines, chacune sur son socle',
  plateau && plateau.figurines, 5 + 3 + 3);
T('dessinées à l\'écran', await p.locator('#mapSvg [data-unite]').count(), 11);

/* ---- retour aux Nécrons : rien n'a bougé de leur côté ---- */
const retour = await p.evaluate(() => {
  activeFaction('necrons');
  return { u: UNITS.length, socles: Object.keys(SOCLES).length,
           bases: BASES['Doomsday Ark'], strat: STRATS.length };
});
T('les Nécrons retrouvent leur table', retour.u, v => v >= 50);
T('leurs socles', retour.socles, v => v > 40);
T('leur BASES reconstruit', retour.bases, '120×92');
T('et leurs stratagèmes', retour.strat, v => v > 30);

console.log('\n════ CONFORME ════'); ok.forEach(x => console.log('  ✓ ' + x));
console.log('\n════ ÉCARTS ════'); console.log(ko.length ? ko.map(x => '  ✗ ' + x).join('\n') : '  (aucun)');
console.log('\n════ ERREURS JS ════'); console.log(errs.length ? [...new Set(errs)].join('\n') : '  aucune');
console.log('\n' + (ok.length + ko.length) + ' contrôles, ' + ko.length + ' écart(s).');
await nav.close();
process.exit(ko.length || errs.length ? 1 : 0);
