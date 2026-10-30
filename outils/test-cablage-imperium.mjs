/* ============================================================
   LE CÂBLAGE IMPERIUM, VU DEPUIS L'ÉCRAN

   test-livrees.mjs vérifie que le câblage désigne des unités, des
   armes et des détachements qui existent. Il ne dit pas qu'une règle
   ARRIVE là où elle doit : qu'un ka'tah se propose au Combat et pas au
   Tir, qu'un Lien d'Allégeance ne se montre que si le Chevalier est
   dans l'armée, qu'une règle de PERSONNAGE ne retouche que le
   personnage. Celui-ci ouvre une liste par faction, charge une unité
   dans le simulateur comme l'onglet Attaque le fait, et lit ce qu'il
   reçoit.

   Lancer : node outils/test-cablage-imperium.mjs (le site servi sur
   :8099, ou $SITE)
   ============================================================ */
import { chromium, base } from './navigateur.mjs';

const nav = await chromium();
const p = await (await nav.newContext()).newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto(base); await p.waitForTimeout(900);

const ok = [], ko = [];
const T = (nom, v, att) => {
  const bon = typeof att === 'function' ? att(v) : JSON.stringify(v) === JSON.stringify(att);
  (bon ? ok : ko).push(nom + ' : ' + JSON.stringify(v) + (bon ? '' : ' (attendu ' + JSON.stringify(att) + ')'));
};

/* une liste d'une unité (et son meneur), un détachement, puis ce que
   le simulateur charge pour elle en Tir et en Combat */
async function charge(faction, detach, unite, persos, autres) {
  await p.evaluate(([faction, detach, unite, persos, autres]) => {
    const u = n => ({ name: n, lo: [] });
    const units = [{ id: 1, name: unite, size: (activeFaction(faction), UNITS.find(x => x[0] === unite)[6][0]),
                     lo: [], chars: persos.map(u), sel: true, grp: '', enh: null }];
    autres.forEach((n, i) => units.push({ id: i + 2, name: n, size: UNITS.find(x => x[0] === n)[6][0],
                     lo: [], chars: [], sel: true, grp: '', enh: null }));
    localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v: 1, actif: 'l', listes: [
      { id: 'l', nom: 'Essai', faction, cap: 2000, nextId: units.length + 1,
        detach: [detach], fd: '', units }] }));
  }, [faction, detach, unite, persos, autres]);
  await p.reload(); await p.waitForTimeout(900);
  return p.evaluate(() => {
    const lis = ph => { const s = ROSTER.simUnite(1, ph);
      return { cond: s.conditions.map(c => c.nom + (c.sur ? ' @' + c.sur : '')),
               profils: s.profils.map(q => ({ l: q.label, rrH: q.rrH, rrW: q.rrW,
                 lethal: q.lethal, sust: q.sustainedOn, ic: q.ignoresCover, hit: q.hitMod,
                 oct: (q.octrois || []).map(o => o.nom) })) }; };
    return { T: lis('T'), C: lis('C') };
  });
}
const a = (l, n) => l.some(x => x.startsWith(n));

/* ---- Adeptus Custodes ---- */
let r = await charge('custodes', 'Auric Champions', 'Custodian Guard Sodality', ['Shield-Captain'], []);
T('Custodes — Dacatarai se propose au Combat', a(r.C.cond, 'Ka’tah Dacatarai'), true);
T('Custodes — et pas au Tir', a(r.T.cond, 'Ka’tah Dacatarai'), false);
T('Custodes — Salvus se propose au Tir', a(r.T.cond, 'Ka’tah Salvus'), true);
T('Custodes — Assemblage of Might ne vise que le PERSONNAGE',
  r.C.cond.filter(c => c.startsWith('Assemblage of Might')), ['Assemblage of Might @Shield-Captain']);
T('Custodes — Défense Impénétrable sur la Sodality', a(r.C.cond, 'Défense Impénétrable'), true);
r = await charge('custodes', 'Guardians of the Throne', 'Custodian Guard Sodality', [], []);
T('Custodes — Martial Mastery : deux choix', r.C.cond.filter(c => c.startsWith('Martial Mastery')).length, 2);
T('Custodes — pas d\'Assemblage hors de son détachement', a(r.C.cond, 'Assemblage of Might'), false);

/* ---- Adepta Sororitas ---- */
r = await charge('sororitas', 'Bringers of Flame', 'Battle Sisters Squad', ['Palatine'], []);
T('Sororitas — la Palatine donne Touches Fatales à l\'escouade', r.T.profils.every(q => q.lethal), true);
T('Sororitas — Purgation Fervente donne [ASSAUT] d\'office', r.T.profils.every(q => q.oct.includes('Purgation Fervente')), true);
T('Sororitas — le +1 en Force à 6" se déclare', a(r.T.cond, 'Purgation Fervente — à 6"'), true);

/* ---- Adeptus Mechanicus ---- */
r = await charge('mechanicus', 'Eradication Cohort', 'Skitarii Rangers', [], []);
T('Mechanicus — Impératif Protecteur au Tir', a(r.T.cond, 'Impératif Protecteur'), true);
T('Mechanicus — Impératif Meurtrier pour les SKITARII', a(r.T.cond, 'Impératif Meurtrier — Protecteur'), true);

/* ---- Grey Knights ---- */
r = await charge('greyknights', 'Warpbane Task Force', 'Purifier Squad', [], []);
T('Grey Knights — Warpbane : les Purificateurs relancent toutes leurs touches', r.C.profils.every(q => q.rrH === 'failed'), true);
T('Grey Knights — et relancent les 1 pour blesser', r.C.profils.every(q => q.rrW === 'ones'), true);
r = await charge('greyknights', 'Warpbane Task Force', 'Strike Squad', [], []);
T('Grey Knights — les autres ne relancent que les 1', r.C.profils.every(q => q.rrH === 'ones'), true);

/* ---- Agents Impériaux ---- */
r = await charge('agents', 'Ordo Hereticus, Purgation Force', 'Exaction Squad', [], []);
T('Agents — Ordo Hereticus : les ARBITES ignorent le couvert', r.T.profils.every(q => q.ic), true);
r = await charge('agents', 'Ordo Hereticus, Purgation Force', 'Voidsmen-at-Arms', [], []);
T('Agents — pas les VOIDFARERS', r.T.profils.some(q => q.ic), false);

/* ---- Chevaliers Impériaux ---- */
r = await charge('chevaliers', 'Gate Warden Lance', 'Armiger Warglaive', [], ['Knight Paladin']);
T('Chevaliers — le Lien du Paladin se propose à l\'Armiger', a(r.C.cond, 'Devoir du Paladin'), true);
T('Chevaliers — Gloire Impétueuse au Combat', a(r.C.cond, 'Gloire Impétueuse'), true);
T('Chevaliers — la ligne défensive', a(r.T.cond, 'Contre la Horde'), true);
r = await charge('chevaliers', 'Gate Warden Lance', 'Armiger Warglaive', [], []);
T('Chevaliers — sans Paladin, pas de Lien', a(r.C.cond, 'Devoir du Paladin'), false);

/* ---- Astra Militarum ---- */
r = await charge('astra', 'Grizzled Company', 'Cadian Shock Troops', [], []);
T('Astra — l\'Ordre « En Joue ! » au Tir', a(r.T.cond, 'Ordre : En Joue !'), true);
T('Astra — « Baïonnette au Canon ! » au Combat', a(r.C.cond, 'Ordre : Baïonnette au Canon !'), true);
T('Astra — Discipline Impitoyable', a(r.T.cond, 'Discipline Impitoyable'), true);

console.log(ok.map(x => '  ✓ ' + x).join('\n'));
if (ko.length) console.log('\n════ ÉCARTS ════\n' + ko.map(x => '  ✗ ' + x).join('\n'));
console.log('\n' + (errs.length ? 'ERREURS JS : ' + errs.join(' | ') : 'aucune erreur JS'));
console.log((ok.length + ko.length) + ' contrôles, ' + ko.length + ' écart(s).');
await nav.close();
process.exit(ko.length || errs.length ? 1 : 0);
