/* ============================================================
   LES FACTIONS LIVRÉES, PASSÉES AU CRIBLE

   test-factions.mjs éprouve le registre avec une faction jouet.
   test-custodes.mjs éprouve une faction générée de bout en bout.
   Celle-ci passe sur TOUTES les factions du registre, celles d'hier
   comme celles qu'on ajoutera, et vérifie ce qui doit être vrai de
   n'importe laquelle.

   L'essentiel est l'intégrité référentielle. Une table générée peut être
   pleine et fausse : une arme rattachée à une unité qui n'existe pas, un
   rattachement vers un nom mal orthographié, une optimisation qui cite un
   détachement absent. Rien de tout cela ne fait tomber l'application —
   ça produit un écran qui ment. C'est exactement ce que l'extracteur
   risque de fabriquer, et donc ce qu'il faut mesurer.

   Lancer : node outils/test-livrees.mjs (le site servi sur :8099, ou $SITE)
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

await p.goto(base); await p.waitForTimeout(900);

const registre = await p.evaluate(() => listeFactions());
T('le registre porte au moins quatre factions', registre.length, v => v >= 4);
console.log('factions au registre : ' + registre.map(f => f.cle).join(', ') + '\n');

/* ------------------------------------------------------------------
   L'INTÉGRITÉ, FACTION PAR FACTION
   ------------------------------------------------------------------ */
for (const F of registre) {
  const R = await p.evaluate(cle => {
    activeFaction(cle);
    const noms = new Set(UNITS.map(u => u[0]));
    const detach = new Set(DETACHMENTS.map(d => d[0]));
    const balise = t => /\*\*|\^\^/.test(String(t || ''));

    const textes = [];
    Object.values(APTITUDES).forEach(a => a.forEach(x => textes.push(x[1])));
    ENHANCEMENTS.forEach(e => textes.push(e[3]));
    DETACHMENTS.forEach(d => textes.push(d[4]));
    FACTION.forEach(f => textes.push(f[1]));

    return {
      unites: UNITS.length,
      jouables: UNITS.filter(u => !u[10]).length,
      armes: WEAPONS.length,
      detachements: DETACHMENTS.length,
      optimisations: ENHANCEMENTS.length,

      /* toute unité a un nom, un effectif et un barème */
      sansNom: UNITS.filter(u => !u[0]).length,
      sansTaille: UNITS.filter(u => !Array.isArray(u[6]) || !u[6].length).map(u => u[0]),
      sansPrix: UNITS.filter(u => ptsPour(u, u[6] && u[6][0], 1) <= 0).map(u => u[0]),

      /* toute arme, toute catégorie, toute aptitude désigne une unité réelle */
      armesOrphelines: [...new Set(WEAPONS.filter(w => !noms.has(w[0])).map(w => w[0]))],
      catOrphelines: CAT.filter(c => !noms.has(c[0])).map(c => c[0]),
      aptisOrphelines: Object.keys(APTITUDES).filter(n => !noms.has(n)),

      /* tout rattachement part d'une unité réelle et vise des unités réelles */
      attachOrphelins: Object.keys(ATTACH).filter(n => !noms.has(n)),
      attachCibles: [...new Set(Object.values(ATTACH).flat().filter(n => !noms.has(n)))],

      /* toute optimisation cite un détachement du catalogue */
      enhOrphelines: ENHANCEMENTS.filter(e => !detach.has(e[2])).map(e => e[0]),
      enhSansCout: ENHANCEMENTS.filter(e => !(e[1] > 0)).map(e => e[0]),

      /* toute unité a au moins une arme — une fiche muette est une fiche ratée */
      unitesSansArme: UNITS.filter(u => !WEAPONS.some(w => w[0] === u[0])).map(u => u[0]),

      /* les index dérivés répondent pour chaque unité */
      catManquantes: UNITS.filter(u => !CATMAP[u[0]]).map(u => u[0]),

      /* Les socles. Le guide ne liste pas les Legends, donc on ne mesure
         que les unités jouables — mais celles-la, toutes. Un socle
         manquant ne casse rien : le Plateau pose sur un socle par
         defaut, et l'unite prend une place qui n'est pas la sienne. Ca
         ne se voit qu'en comptant. */
      socles: Object.keys(SOCLES).length,
      jouablesSansSocle: UNITS.filter(u => !u[10] && !SOCLES[u[0]]).map(u => u[0]),
      soclesOrphelins: Object.keys(SOCLES).filter(n => !noms.has(n)),

      /* Une aptitude qui porte le nom d'une OPTIMISATION, sur plusieurs
         fiches à la fois, n'est pas une aptitude : c'est BSData qui
         accroche à chaque personnage tout ce qu'il pourrait prendre. La
         fiche affiche alors des règles que l'unité n'a pas — un écran
         qui ment, et rien d'autre ne le signale. Sur une seule fiche
         c'est plausible : un équipement peut porter le même nom. */
      aptisQuiSontDesOptims: (() => {
        const opt = new Set(ENHANCEMENTS.map(e => e[0].toLowerCase()));
        const combien = {};
        Object.values(APTITUDES).forEach(l => l.forEach(([n]) => {
          const k = String(n).toLowerCase();
          if (opt.has(k)) combien[n] = (combien[n] || 0) + 1;
        }));
        return Object.entries(combien).filter(([, n]) => n > 1).map(([n, c]) => n + ' ×' + c);
      })(),

      /* Le câblage du simulateur. Il est écrit à la main, donc il peut
         nommer une unité qui n'existe pas — une faute de frappe, ou une
         fiche renommée par la source depuis. Une règle câblée sur un nom
         mort ne s'applique jamais et ne dit rien : elle se compte ici. */
      cablees: (() => {
        let n = 0;
        [APTIS_UNITE, APTIS_COND, APTIS_CIBLE, AURAS_PERSO].forEach(t =>
          Object.values(t || {}).forEach(l => n += l.length));
        return n + (AURAS_ARMEE || []).length;
      })(),
      cablageOrphelin: (() => {
        const out = [];
        [['APTIS_UNITE', APTIS_UNITE], ['APTIS_COND', APTIS_COND],
         ['APTIS_CIBLE', APTIS_CIBLE], ['AURAS_PERSO', AURAS_PERSO]].forEach(([k, t]) =>
          Object.keys(t || {}).forEach(u => { if (!noms.has(u)) out.push(k + ' → ' + u); }));
        (AURAS_ARMEE || []).forEach(a => {
          if (!noms.has(a.source)) out.push('AURAS_ARMEE → ' + a.source);
        });
        return out;
      })(),

      /* Une règle câblée peut viser UNE arme — « avec son canon
         vanquisher ». Si le nom ne correspond à aucune arme de l'unité,
         elle ne s'applique jamais : même silence qu'un nom d'unité mort,
         et c'est le nom d'arme qui bouge le plus souvent, parce que le
         catalogue préfixe les sous-profils d'un ➤. */
      armeCablageOrpheline: (() => {
        const out = [];
        [['APTIS_CIBLE', APTIS_CIBLE], ['APTIS_COND', APTIS_COND],
         ['APTIS_UNITE', APTIS_UNITE]].forEach(([k, t]) =>
          Object.entries(t || {}).forEach(([u, l]) => l.forEach(a => {
            if (!a.arme) return;
            if (!WEAPONS.some(w => w[0] === u && w[1] === a.arme))
              out.push(k + ' · ' + u + ' → ' + a.arme);
          })));
        return out;
      })(),

      /* le balisage du catalogue ne doit pas atteindre l'écran */
      balisees: textes.filter(balise).length,
      regle: FACTION.length ? FACTION[0][0] : ''
    };
  }, F.cle);

  const dit = (quoi, v, att) => T(F.nom + ' — ' + quoi, v, att);
  console.log('── ' + F.nom + ' : ' + R.unites + ' fiches (' + R.jouables + ' jouables), ' +
    R.armes + ' armes, ' + R.detachements + ' détachements, ' + R.optimisations +
    ' optimisations, ' + R.socles + ' socles, ' + R.cablees + ' règles câblées');

  dit('la table est peuplée', R.unites, v => v > 0);
  dit('toute fiche a un nom', R.sansNom, 0);
  dit('toute fiche a un effectif', R.sansTaille, []);
  dit('toute fiche a un prix', R.sansPrix, []);
  dit('aucune arme orpheline', R.armesOrphelines, []);
  dit('aucune catégorie orpheline', R.catOrphelines, []);
  dit('aucune aptitude orpheline', R.aptisOrphelines, []);
  dit('tout rattachement part d\'une unité réelle', R.attachOrphelins, []);
  dit('et vise des unités réelles', R.attachCibles, []);
  dit('toute optimisation cite un détachement du catalogue', R.enhOrphelines, []);
  dit('toute optimisation a un coût', R.enhSansCout, []);
/* Une fiche sans arme existe : la Ligne de Défense Aegis est une
   fortification, le Véhicule de Démolition Cyclope explose par une
   aptitude. Ce n'est donc pas une faute — mais une faction où beaucoup
   de fiches seraient muettes en serait une, et grosse : c'est exactement
   la forme qu'avait le défaut des liens non suivis, qui privait 54 armes
   sur 138 de leur unité. On mesure donc la proportion. */
if (R.unitesSansArme.length)
  console.log('     (sans arme, et c\'est exact pour elles : ' +
    R.unitesSansArme.join(', ') + ')');
dit('presque toutes les fiches portent une arme',
  R.unitesSansArme.length / R.unites, v => v <= 0.05);
  dit('aucune optimisation déguisée en aptitude', R.aptisQuiSontDesOptims, []);
  dit('aucune règle câblée sur une unité qui n\'existe pas', R.cablageOrphelin, []);
  dit('aucune règle câblée sur une arme que l\'unité n\'a pas', R.armeCablageOrpheline, []);
  dit('toute unité jouable a son socle', R.jouablesSansSocle, []);
/* Un socle qui ne désigne aucune fiche n'est pas un mensonge : il ne
   sert à rien, voilà tout. Il y en a deux dans la table nécrone relue à
   la main — le Seraptek, resté derrière quand les Legends ont été
   retirées, et le Menhir Triarcal, qui est une FIGURINE que COMPO
   nomme, pas une unité. On le dit sans faire échouer : l'invariant qui
   compte est l'autre, celui qui exige un socle pour chaque unité. */
if (R.soclesOrphelins.length)
  console.log('     (socles ne désignant aucune fiche : ' +
    R.soclesOrphelins.join(', ') + ')');
  dit('CATMAP répond pour chaque fiche', R.catManquantes, []);
  dit('aucun balisage de catalogue dans les textes', R.balisees, 0);
  dit('la règle d\'armée est nommée', R.regle, v => v.length > 0);
}

/* ------------------------------------------------------------------
   UNE LISTE PAR FACTION, RELUE DEPUIS LE STOCKAGE
   C'est le chemin complet : normaliseListe bascule sur la bonne table,
   ouvre() la met en service, le pavé se dessine, le total se calcule.
   ------------------------------------------------------------------ */
const listes = await p.evaluate(cles => {
  const out = { v: 1, actif: null, listes: [] };
  cles.forEach((c, i) => {
    activeFaction(c);
    const trois = UNITS.filter(u => !u[10]).slice(0, 3);
    out.listes.push({
      id: 'l' + i, nom: 'Essai ' + c, faction: c, cap: 2000, nextId: trois.length + 1,
      detach: DETACHMENTS.length ? [DETACHMENTS[0][0]] : [], fd: '',
      units: trois.map((u, k) => ({ id: k + 1, name: u[0], size: u[6][0], lo: [],
        chars: [], sel: true, grp: '', enh: null }))
    });
  });
  out.actif = out.listes[0].id;
  localStorage.clear();
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify(out));
  return out.listes.map(L => ({ f: L.faction, n: L.units.length, u: L.units.map(x => x.name) }));
}, registre.map(f => f.cle));

await p.reload(); await p.waitForTimeout(1600);

const apres = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('mathhammer.lists.v1')).listes
    .map(L => ({ f: L.faction, n: L.units.length })));
T('chaque liste garde ses unités après relecture',
  apres.map(x => x.f + ':' + x.n), listes.map(x => x.f + ':' + x.n));
T('aucune liste n\'a été relue dans la faction d\'une autre',
  apres.map(x => x.f), registre.map(f => f.cle));

/* on ouvre chaque liste et on regarde ce que l'écran calcule */
for (let i = 0; i < registre.length; i++) {
  const F = registre[i];
  const vu = await p.evaluate(id => {
    const o = JSON.parse(localStorage.getItem('mathhammer.lists.v1'));
    o.actif = id;
    localStorage.setItem('mathhammer.lists.v1', JSON.stringify(o));
    return true;
  }, 'l' + i);
  await p.reload(); await p.waitForTimeout(1200);
  const etat = await p.evaluate(() => {
    const b = document.querySelector('#ptsbar .c .v');
    return { faction: FACTION_ACTIVE, unites: UNITS.length,
             tuiles: document.querySelectorAll('#unitPad .upad, [data-uid]').length,
             total: b ? b.textContent.trim() : '' };
  });
  T(F.nom + ' — ouvrir sa liste met sa table en service', etat.faction, F.cle);
  T(F.nom + ' — le pavé dessine ses trois unités', etat.tuiles, v => v >= 3);
  T(F.nom + ' — le total est un nombre de points', etat.total, v => /^\d+ \/ \d+/.test(v));
}

console.log('\n════ CONFORME ════'); ok.forEach(x => console.log('  ✓ ' + x));
console.log('\n════ ÉCARTS ════'); console.log(ko.length ? ko.map(x => '  ✗ ' + x).join('\n') : '  (aucun)');
console.log('\n════ ERREURS JS ════'); console.log(errs.length ? [...new Set(errs)].join('\n') : '  aucune');
console.log('\n' + (ok.length + ko.length) + ' contrôles, ' + ko.length + ' écart(s).');
await nav.close();
process.exit(ko.length || errs.length ? 1 : 0);
