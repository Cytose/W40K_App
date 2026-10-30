/* ============================================================
   LE CÂBLAGE ASTARTES, VU DEPUIS L'APPLICATION

   test-livrees.mjs vérifie que les tables se tiennent : aucun nom mort,
   aucun champ qu'on ne saurait retirer. Il ne dit pas qu'une règle
   arrive là où elle doit. Celui-ci ouvre une liste par cas et regarde
   ce que le simulateur reçoit vraiment : le profil retouché, les
   conditions à déclarer, les stratagèmes offerts.

   Six familles de chemin, une par façon de câbler :
   · l'octroi de détachement (Ironclad Champions → relance des 1) ;
   · la règle de détachement à déclarer, sans source (Ceramite Sentinels) ;
   · la règle de meneur, déclarée pour l'unité menée (Chapelain, Lieutenant) ;
   · l'aura d'un personnage qui mène (Capitaine de la Compagnie de la Mort) ;
   · l'héritage : une fiche du Codex câblée une fois, jouée par un chapitre ;
   · le stratagème réservé à un mot-clé.

   Lancer : node outils/test-astartes.mjs  (site servi sur :8099, ou $SITE)
   ============================================================ */
import { chromium, base } from './navigateur.mjs';

const nav = await chromium();
const p = await nav.newPage({ viewport: { width: 430, height: 1400 } });
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
const ok = [], ko = [];
const T = (nom, v, att) => {
  const bon = typeof att === 'function' ? att(v) : JSON.stringify(v) === JSON.stringify(att);
  (bon ? ok : ko).push(nom + ' : ' + JSON.stringify(v) + (bon ? '' : ' (attendu ' + JSON.stringify(att) + ')'));
};
await p.goto(base); await p.waitForTimeout(900);

const u = (id, name, size, chars = []) => ({ id, name, size, lo: [], sel: true, grp: '', enh: null,
  chars: chars.map(n => ({ name: n, lo: [] })) });
const ouvre = async (faction, detach, units) => {
  await p.evaluate(([f, d, us]) => {
    localStorage.clear();
    localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v: 1, actif: 'l', listes: [{
      id: 'l', nom: 'Astartes', faction: f, cap: 3000, detach: [d], fd: '', nextId: 9, units: us }] }));
  }, [faction, detach, units]);
  await p.reload(); await p.waitForTimeout(1200);
};
const sim = (id, ph) => p.evaluate(([i, f]) => {
  const s = ROSTER.simUnite(i, f);
  return { rrH: [...new Set(s.profils.map(x => x.rrH))], conds: s.conditions.map(c => c.nom),
           strats: ROSTER.stratsSimu(s.unite, s.persos, f).map(x => x.nom) };
}, [id, ph]);

/* ---- 1. Space Marines, Ironclad Champions ---- */
await ouvre('spacemarines', 'Ironclad Champions', [
  u(1, 'Redemptor Dreadnought', 1),
  u(2, 'Intercessor Squad', 5, ['Lieutenant']),
  u(3, 'Assault Intercessor Squad', 5, ['Chaplain'])]);
let r = await sim(1, 'T');
T('SM — le Redemptor relance ses 1 pour toucher (Vengeance Endurante)', r.rrH, v => v.includes('ones'));
T('SM — et se voit offrir Mercy Is Weakness', r.strats, v => v.includes('Mercy Is Weakness'));
r = await sim(2, 'T');
T('SM — les Intercessors ne relancent rien : ce ne sont pas des Dreadnoughts', r.rrH, v => !v.includes('ones'));
T('SM — ils déclarent la Discipline du Bolter', r.conds, v => v.includes('Discipline du Bolter'));
T('SM — et la Précision Tactique de leur Lieutenant', r.conds, v => v.includes('Précision Tactique (Meneur)'));
T('SM — mais pas Mercy Is Weakness', r.strats, v => !v.includes('Mercy Is Weakness'));
r = await sim(3, 'C');
T('SM — la Litanie de Haine du Chapelain s\'offre à son escouade, au corps à corps', r.conds, v => v.includes('Litanie de Haine (Meneur)'));
T('SM — et l\'Intercession Ciblée de la fiche', r.conds, v => v.includes('Intercession Ciblée'));
T('SM — mais pas la Précision Tactique : le Lieutenant mène une autre escouade', r.conds, v => !v.includes('Précision Tactique (Meneur)'));
r = await sim(3, 'T');
T('SM — pas au tir', r.conds, v => !v.includes('Litanie de Haine (Meneur)'));

/* ---- 2. une règle de détachement à déclarer ---- */
await ouvre('spacemarines', 'Ceramite Sentinels', [u(1, 'Intercessor Squad', 5)]);
r = await sim(1, 'T');
T('SM — Ceramite Sentinels propose la Défense Adaptative', r.conds, v => v.includes('Défense Adaptative'));
T('SM — et le stratagème Augmented Targeting, en trois pastilles', r.strats.filter(n => /^Augmented Targeting/.test(n)).length, 3);
await ouvre('spacemarines', 'Gladius Task Force', [u(1, 'Intercessor Squad', 5)]);
r = await sim(1, 'T');
T('SM — un autre détachement ne la propose pas', r.conds, v => !v.includes('Défense Adaptative'));

/* ---- 3. Blood Angels : la Rage Noire et l'Héritage de l'Ange ---- */
await ouvre('bloodangels', 'Angelic Inheritors', [
  u(1, 'Death Company Marines', 5, ['Death Company Captain']),
  u(2, 'Redemptor Dreadnought', 1)]);
r = await sim(1, 'C');
T('BA — la Compagnie de la Mort menée relance ses 1 en mêlée', r.rrH, v => v.includes('ones'));
T('BA — Focused Fury s\'offre, et sa variante de PERSONNAGE aussi', r.strats, v => v.includes('Focused Fury') && v.includes('Focused Fury — PERSONNAGE'));
r = await sim(2, 'T');
T('BA — le Redemptor, fiche du Codex, garde son câblage hérité', r.strats, v => v.includes('Strike Now for Glory'));

/* ---- 4. Space Wolves : Ragnar et les Griffes Sanglantes ---- */
await ouvre('spacewolves', 'Saga of the Beastslayer', [
  u(1, 'Blood Claws', 10, ['Ragnar Blackmane']),
  u(2, 'Grey Hunters', 10)]);
r = await sim(1, 'C');
T('SW — Ragnar prête son Hurlement de Guerre aux Griffes Sanglantes', r.conds, v => v.includes('Hurlement de Guerre (Meneur)'));
T('SW — la Saga leur donne les Tueurs Légendaires', r.conds, v => v.includes('Tueurs Légendaires'));
T('SW — et Unbridled Feroicity', r.strats, v => v.includes('Unbridled Feroicity'));
r = await sim(2, 'C');
T('SW — pas aux Chasseurs Gris', r.conds, v => !v.includes('Hurlement de Guerre (Meneur)') && !v.includes('Tueurs Légendaires'));

/* ---- 5. Deathwatch : les munitions des Kill Teams ---- */
await ouvre('deathwatch', 'Black Spear Task Force', [u(1, 'Fortis Kill Team', 5), u(2, 'Redemptor Dreadnought', 1)]);
r = await sim(1, 'T');
T('DW — la Kill Team reçoit les trois munitions', r.strats, v => ['Dragonfire Rounds', 'Hellfire Rounds', 'Kraken Rounds'].every(n => v.includes(n)));
T('DW — et ses tactiques de mission', r.conds, v => v.includes('Tactiques Furor') && v.includes('Tactiques Malleus'));
r = await sim(2, 'T');
T('DW — pas le Redemptor', r.strats, v => !v.includes('Kraken Rounds'));

console.log('\n════ CONFORME ════'); ok.forEach(x => console.log('  ✓ ' + x));
console.log('\n════ ÉCARTS ════'); console.log(ko.length ? ko.map(x => '  ✗ ' + x).join('\n') : '  (aucun)');
console.log('\n════ ERREURS JS ════'); console.log(errs.length ? [...new Set(errs)].join('\n') : '  aucune');
console.log('\n' + (ok.length + ko.length) + ' contrôles, ' + ko.length + ' écart(s).');
await nav.close();
process.exit(ko.length || errs.length ? 1 : 0);
