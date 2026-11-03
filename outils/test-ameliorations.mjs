/* ============================================================
   UNE AMÉLIORATION SE VOIT, ET COMPTE, DANS LE SIMULATEUR

   Le 03/11/2026, un Contemptor-Galatus portant le Memento Moritoi
   (« This model's melee attacks have +1 A, S and D ») se chargeait dans
   le simulateur avec la lame de sa fiche : A 8, F 10, D 3, et pas un
   mot de l'amélioration. Cette suite vérifie :
   1. la lecture des textes (ce qui s'applique d'office, ce qui se
      déclare, ce qui ne touche pas les armes) ;
   2. le profil chargé et l'écran, sur la liste de Kevin.

   Lancer : node outils/test-ameliorations.mjs (le site servi sur :8099, ou $SITE)
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

/* ---- 1. la lecture des textes ---- */
const lis = t => p.evaluate(t => ROSTER.lisEnh(t), t);
T('Memento Moritoi : +1 A, F, D au corps à corps, sur le porteur',
  (await lis("Adeptus Custodes Dreadnought model only. This model’s melee attacks have +1 A, S and D.")).auto,
  [{champ:'atkMod', val:1, port:'C', qui:'figurine'}, {champ:'strMod', val:1, port:'C', qui:'figurine'},
   {champ:'dmgMod', val:1, port:'C', qui:'figurine'}]);
T("l'ancienne tournure : Add … characteristics of … weapons",
  (await lis("Add 1 to the Damage characteristics of melee weapons equipped by the bearer, and those weapons have the [PRECISION] ability.")).auto
    .map(o => o.champ || o.mot), ['dmgMod', 'precision']);
T('+1A, S, AP and D collés, armes psychiques exclues',
  (await lis("This model's ranged attacks (excluding [Psychic] attacks) have +1A, S, AP and D.")).auto
    .map(o => o.champ + (o.horsPsy ? '!psy' : '') + o.port), ['atkMod!psyT', 'strMod!psyT', 'apMod!psyT', 'dmgMod!psyT']);
T("l'unité entière : Anti-X lu vers les mots-clés de cible",
  (await lis("Ranged weapons equipped by models in this unit have the [ANTI-MONSTER 5+] and [ANTI-VEHICLE 5+] abilities.")).auto,
  [{champ:'anti', val:'5:mon', port:'T', qui:'unite'}, {champ:'anti', val:'5:veh', port:'T', qui:'unite'}]);
const cond = await lis("Grey Knights model only. Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, add 4 to the Strength characteristic of melee weapons equipped by the bearer.");
T('« once per battle … if it does » : à déclarer, pas d\'office',
  [cond.auto.length, cond.cond.map(c => c.effets.map(o => o.champ + o.val))], [0, [['strMod4']]]);
const choix = await lis("Adeptus Astartes Jump Pack model only. When this unit is selected to fight, this unit's melee attacks have: ▪ [LETHAL HITS]. ▪ Or: [SUSTAINED HITS 1].");
T('« Or: » : un choix, donc deux pastilles à déclarer', [choix.auto.length, choix.cond.length], [0, 2]);
T('une défense ne touche pas les attaques de l\'unité',
  await lis("Each time an attack targets the bearer, worsen the Armour Penetration characteristic of that attack by 1."),
  {auto: [], cond: []});
T('le fichier nécron, en français',
  (await lis("Figurine NÉCRON seulement. Les armes de tir dont sont équipées les figurines de l'unité du porteur ont l'aptitude [IGNORE LE COUVERT].")).auto,
  [{mot:'ignorescover', port:'T', qui:'unite'}]);

/* ---- 2. la liste de Kevin : un Galatus avec, un autre sans ---- */
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v: 1, actif: 'mor', listes: [
    { id: 'mor', nom: 'Moritoi', faction: 'custodes', cap: 2000, nextId: 4,
      detach: ['Might of the Moritoi'], fd: '', units: [
        { id: 1, name: 'Contemptor-Galatus Dreadnought', size: 1, lo: [], chars: [], sel: true, grp: '',
          enh: 'Memento Moritoi (one per army) (Upgrade)' },
        { id: 2, name: 'Contemptor-Galatus Dreadnought', size: 1, lo: [], chars: [], sel: true, grp: '', enh: null },
        { id: 3, name: 'Custodian Guard Sodality', size: 3, lo: [], chars: [], sel: true, grp: '', enh: null }
      ] }
  ] }));
});
await p.reload(); await p.waitForTimeout(1400);
T('la faction custodes est en service', await p.evaluate(() => FACTION_ACTIVE), 'custodes');

const lame = id => p.evaluate(id => {
  const u = ROSTER.simUnite(id, 'C');
  const w = u.profils.find(x => x.arme === 'Warblade (càc)');
  return { A: w.attacks, atkMod: w.atkMod || 0, F: w.str, D: w.dmg, dmgMod: w.dmgMod || 0,
           sources: (w.octrois || []).filter(o => o.source === 'Amélioration').map(o => o.champ) };
}, id);
T('avec le Memento Moritoi : A 8+1, F 11, D 3+1', await lame(1),
  { A: '8', atkMod: 1, F: 11, D: '3', dmgMod: 1, sources: ['atkMod', 'strMod', 'dmgMod'] });
T('sans : la lame de la fiche', await lame(2),
  { A: '8', atkMod: 0, F: 10, D: '3', dmgMod: 0, sources: [] });
T("au tir, l'amélioration de mêlée ne joue pas", await p.evaluate(() => {
  const w = ROSTER.simUnite(1, 'T').profils.find(x => x.arme === 'Warblade (tir)');
  return [w.str, w.atkMod || 0, w.dmgMod || 0];
}), [6, 0, 0]);
T("le résumé de l'amélioration", await p.evaluate(() => ROSTER.simUnite(1, 'C').enh),
  { nom: 'Memento Moritoi (one per army)', porteur: 'Contemptor-Galatus Dreadnought',
    texte: 'Adeptus Custodes Dreadnought model only. This model’s melee attacks have +1 A, S and D.',
    auto: ['+1 A (corps à corps)', '+1 F (corps à corps)', '+1 D (corps à corps)'], cond: [] });

/* l'écran : on charge l'unité dans l'onglet Attaque, au corps à corps */
const ecran = await p.evaluate(() => {
  SIM.charge(1, 'C');
  const host = document.getElementById('atkProfils');
  const row = [...host.querySelectorAll('.profrow')].find(r => /Warblade \(càc\)/.test(r.textContent));
  return { sous: document.getElementById('ruSub').textContent,
           bloc: (host.querySelector('.enhbox') || {}).textContent || '',
           ligne: row ? row.querySelector('i').textContent : '',
           pastilles: row ? [...row.querySelectorAll('.pkw > span')].map(s => s.textContent) : [] };
});
T("le nom de l'amélioration sous l'unité", ecran.sous, v => /Memento Moritoi/.test(v));
T("le bloc dit ce qui est compté", ecran.bloc, v => /Compté d'office/.test(v) && /\+1 A \(corps à corps\)/.test(v));
T('la ligne montre la lame améliorée', ecran.ligne, 'A 9 · CC 2+ · F 11 · PA -2 · D 4');
T('les pastilles nomment le Memento Moritoi', ecran.pastilles,
  v => ['A +1', 'Dégâts +1', 'F +1'].every(t => v.some(x => x.startsWith(t) && /Memento Moritoi/.test(x))));
T("l'autre Galatus n'a pas de bloc", await p.evaluate(() => {
  SIM.charge(2, 'C'); return !!document.querySelector('#atkProfils .enhbox');
}), false);

/* une amélioration qui se déclare : elle rejoint les aptitudes de l'unité,
   sur son porteur, et ne joue pas tant qu'on ne l'a pas cochée */
await p.evaluate(() => {
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v: 1, actif: 'gt', listes: [
    { id: 'gt', nom: 'Gardiens', faction: 'custodes', cap: 2000, nextId: 2,
      detach: ['Guardians of the Throne'], fd: '', units: [
        { id: 1, name: 'Custodian Guard Sodality', size: 4, lo: [], sel: true, grp: '',
          chars: [{ name: 'Shield-Captain', lo: (activeFaction('custodes'), ROSTER.loDefaut('Shield-Captain', 1)) }],
          enh: 'Bane of Abominations', enhP: 'Shield-Captain' }
      ] }
  ] }));
});
await p.reload(); await p.waitForTimeout(1400);
const gt = await p.evaluate(() => {
  const u = ROSTER.simUnite(1, 'C');
  const c = u.conditions.find(x => /amélioration/.test(x.nom));
  return c ? { nom: c.nom, champ: c.champ, val: c.val, sur: c.sur, enh: u.enh && u.enh.cond } : u;
});
T('Bane of Abominations : +1 pour blesser à déclarer, sur le Shield-Captain', gt,
  { nom: 'Bane of Abominations (amélioration)', champ: 'wndMod', val: 1, sur: 'Shield-Captain',
    enh: ['+1 pour blesser'] });

T('cochée, elle touche les armes du Shield-Captain, pas celles des Gardes', await p.evaluate(() => {
  SIM.charge(1, 'C'); SIM.cond('Bane of Abominations (amélioration)', true);
  return SIM.atk().moteur.map(m => [m.label.startsWith('Shield-Captain'), m.wndMod]);
}), v => v.length >= 2 && v.every(([sc, w]) => w === (sc ? 1 : 0)));
T('aucune erreur dans la page', errs, []);
await nav.close();
console.log(ok.map(x => '  ok  ' + x).join('\n'));
if (ko.length){ console.log(ko.map(x => '  KO  ' + x).join('\n')); process.exit(1); }
console.log('\n' + ok.length + ' vérifications, toutes bonnes.');
