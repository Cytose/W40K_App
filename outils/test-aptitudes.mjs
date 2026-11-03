/* ============================================================
   LES APTITUDES DE FICHE ARRIVENT AU CALCUL

   Le relevé du 03/11/2026 a trouvé des aptitudes d'attaque que rien ne
   câblait : la Main d'Asuryan, l'Annihilateur des Predator, les
   protocoles du Datasmith… Celles-ci en éprouvent un échantillon, en
   mode « par arme » comme en mode « unité de la liste » : une aptitude
   câblée mais mal adressée ne fait rien, et ne le dit pas.

   Lancer : node outils/test-aptitudes.mjs (le site servi sur :8099, ou $SITE)
   ============================================================ */
import { chromium, base } from './navigateur.mjs';

const nav = await chromium();
const p = await (await nav.newContext({ viewport: { width: 430, height: 1600 } })).newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
const ok = [], ko = [];
const T = (nom, v, att) => {
  const bon = typeof att === 'function' ? att(v) : JSON.stringify(v) === JSON.stringify(att);
  (bon ? ok : ko).push(nom + ' : ' + JSON.stringify(v) + (bon ? '' : ' (attendu ' + JSON.stringify(att) + ')'));
};
const u = (id, name, size, chars) => ({ id, name, size, lo: [], chars: (chars || []).map(n => ({ name: n, lo: [] })),
                                         sel: true, grp: '', enh: null });
const liste = async (faction, units) => {
  await p.evaluate(([f, us]) => localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v: 1, actif: 'l',
    listes: [{ id: 'l', nom: 'T', faction: f, cap: 3000, detach: [], fd: '', nextId: 20, units: us }] })), [faction, units]);
  await p.reload(); await p.waitForTimeout(1200);
  await p.click('#tabs button[data-s="scSim"]'); await p.waitForTimeout(300);
};
const arme = (nom, i) => p.evaluate(([n, k]) => { SIM.choisitArme(n, k); return SIM.arme(); }, [nom, i]);
const declare = nom => p.evaluate(n => { SIM.condArme(n); return SIM.arme(); }, nom);
await p.goto(base + 'index.html'); await p.waitForTimeout(800);

/* ---- par arme : une aptitude qui fait trois choses d'une pastille ---- */
await liste('aeldari', []);
let a = await arme('Asurmen', 0);
T('Asurmen propose la Main d\'Asuryan', a.conditions, v => v.includes('· Main d\'Asuryan'));
a = await declare('Main d\'Asuryan');
T('… qui pose Dévastatrices', a.moteur.dev, true);
T('… et l\'Anti-Infanterie 5+ contre de l\'infanterie', await p.evaluate(() => {
  SIM.cible(['inf']); return SIM.arme().moteur.critW; }), 5);

/* ---- d'office : rien à cocher ---- */
await liste('votann', []);
a = await p.evaluate(() => { const i = SIM.unitWeps('Berehk Stornbröw').findIndex(w => w[2] === 'C');
  SIM.choisitArme('Berehk Stornbröw', i); return SIM.arme(); });
T('Berehk : Briser l\'Ennemi joue d\'office', a.auto, ['Briser l\'Ennemi']);
T('… Touches Soutenues 1 au moteur', [a.moteur.sustainedOn, String(a.moteur.sustainedN)], [true, '1']);

/* ---- une caractéristique fixée et un N meilleur ---- */
await liste('astra', []);
a = await arme('Sergeant Harker', 0);
const avant = a.degats;
a = await declare('L\'Heure de la Revanche');
T('Harker : Touches Soutenues 3 au lieu de 1', String(a.moteur.sustainedN), '3');
T('… et le calcul y gagne', a.degats > avant, true);

/* ---- en mode unité : l'Annihilateur contre un véhicule ---- */
await liste('spacemarines', [u(1, 'Predator Annihilator', 1)]);
const rd = await p.evaluate(() => { SIM.cible(['veh']); SIM.charge(1, 'T');
  return SIM.atk().moteur.map(m => m.rrD); });
T('Predator Annihilator : relance des dégâts contre un VÉHICULE', rd, v => v.length > 0 && v.every(x => x === 'tous'));
const rd2 = await p.evaluate(() => { SIM.cible(['inf']); SIM.charge(1, 'T');
  return SIM.atk().moteur.map(m => m.rrD); });
T('… mais pas contre de l\'infanterie', rd2, v => v.every(x => x === 'none'));
await liste('bloodangels', [u(1, 'Predator Annihilator', 1)]);
T('les chapitres en héritent (Blood Angels)', await p.evaluate(() => { SIM.cible(['veh']); SIM.charge(1, 'T');
  return SIM.atk().moteur.map(m => m.rrD); }), v => v.length > 0 && v.every(x => x === 'tous'));

/* ---- une aura d'armée, source dans la liste : la Sagesse des Anciens ---- */
await liste('greyknights', [u(1, 'Strike Squad', 5), u(2, 'Grey Knights Dreadnought', 1)]);
const gk = await p.evaluate(() => { SIM.charge(1, 'T'); const c = SIM.atk().conditions;
  const e0 = SIM.esperances(); SIM.cond('Sagesse des Anciens (Aura)');
  const m = SIM.atk().moteur; return { c, e0, e1: SIM.esperances(), rr: m.map(x => [x.rrH, x.rrW]) }; });
T('Grey Knights : la Sagesse des Anciens se propose à l\'infanterie', gk.c.some(x => /Sagesse des Anciens/.test(x)), true);
T('… relance les 1 en touche ET en blessure d\'une seule pastille', gk.rr, v => v.length > 0 && v.every(x => x[0] === 'ones' && x[1] === 'ones'));
T('… et le calcul y gagne', gk.e1.reduce((a, b) => a + b, 0) > gk.e0.reduce((a, b) => a + b, 0), true);

/* ---- la défense de fiche, dans Encaisser ---- */
await liste('demons', [u(1, 'Plaguebearers', 10)]);
T('Plaguebearers : Pourriture Crépusculaire comptée d\'office', await p.evaluate(() =>
  ROSTER.defenses('Plaguebearers', 1).auto), v => v.some(x => /Pourriture Crépusculaire.*defWndFE -1/.test(x)));
await liste('aeldari', [u(1, 'Wave Serpent', 1)]);
T('Wave Serpent : son bouclier se déclare (tir seulement)', await p.evaluate(() =>
  ROSTER.defenses('Wave Serpent', 1).decl), v => v.some(x => /Bouclier du Wave Serpent/.test(x)));

/* ---- les genres suivent les mots-clés : une escouade de LIGNE est INFANTERIE ---- */
await liste('greyknights', []);
T('Strike Squad est INFANTERIE', await p.evaluate(() => KW.infantry.includes('Strike Squad')), true);

/* ---- les Thousand Sons ont retrouvé leurs tables ---- */
await liste('thousandsons', []);
T('Thousand Sons : le Flux de Magie est revenu', await p.evaluate(() => Object.keys(OCTROIS_DETACH)), ['Hexwarp Thrallband']);

console.log('\n════ CONFORME ════'); ok.forEach(x => console.log('  ✓ ' + x));
console.log('\n════ ÉCARTS ════'); console.log(ko.length ? ko.map(x => '  ✗ ' + x).join('\n') : '  (aucun)');
console.log('\n════ ERREURS JS ════'); console.log(errs.length ? [...new Set(errs)].join('\n') : '  aucune');
console.log('\n' + (ok.length + ko.length) + ' contrôles, ' + ko.length + ' écart(s).');
await nav.close();
process.exit(ko.length || errs.length ? 1 : 0);
