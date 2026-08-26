/* ============================================================
   LE REGISTRE DES FACTIONS, ÉPROUVÉ SUR L'ÉCRAN

   Le refactor multi-faction ne change rien de visible tant qu'il n'y a
   qu'une faction : les suites existantes passent au vert sans rien
   prouver. Celle-ci éprouve ce que le refactor a réellement introduit.

   Elle se donne une SECONDE faction en interceptant data-necrons.js et
   en lui ajoutant un data-essai.js — c'est le seul moyen d'éprouver une
   bascule tant qu'une seule faction est livrée, et c'est le vrai chemin :
   le fichier s'enregistre au chargement, comme le ferait un
   data-custodes.js, et il survit donc aux rechargements de page.

   Ce qui est éprouvé :
   1. une liste enregistrée AVANT le champ `faction` se relit intacte ;
   2. le contrôle des 28 tables nomme celle qui manque ;
   3. la bascule rebranche les tables ET les index dérivés, et rend les
      tables nécrones telles quelles au retour ;
   4. deux listes de factions différentes cohabitent sans que la
      normalisation de l'une efface l'autre — le piège du procédé ;
   5. le sélecteur n'apparaît que s'il y a un choix, et changer de
      faction prévient avant de vider ;
   6. le lien de partage porte la faction, bout en bout.

   Lancer : node outils/test-factions.mjs (le site servi sur :8099, ou $SITE)
   ============================================================ */
import { chromium, base } from './navigateur.mjs';

/* Une faction minuscule mais complète : le contrôle des 28 tables
   l'exige, et c'est justement ce qu'on veut éprouver. */
const ESSAI = `
enregistreFaction({
  cle : "essai", nom : "Faction d'essai",
  tables : {
    UNITS : [["Essai-Pieton",6,4,4,0,2,[5,10],{"5":50,"10":100},0,"",0,"",2,"7+"],
             ["Essai-Char",10,10,3,0,12,[1],{"1":150},0,"",0,"",4,"7+"]],
    ARMEMENT : {},
    WEAPONS : [["Essai-Pieton","Fusil d'essai","T","1",3,4,0,"1",""],
               ["Essai-Char","Canon d'essai","T","2",3,9,2,"3",""]],
    KW : { infanterie:["Essai-Pieton"], blindage:["Essai-Char"] },
    STRAT_SIMU : [], APTIS_CIBLE : {},
    DETACHMENTS : [["Essai Detachment",0,[],"","",0,"","Detachement d'essai","Take and Hold"]],
    ATTACH : {}, RETINUE : {}, ENHANCEMENTS : [], ENH_ANCIENS : {},
    SOCLES : { "Essai-Pieton":"32", "Essai-Char":"100x60" },
    GRPN : {}, STRATS : [], MOMENTS : {}, MOMENTS_ARMEE : [],
    CAT : [["Essai-Pieton","Battleline"],["Essai-Char","Véhicule"]],
    COMPO : {}, ROLES_UNITE : {}, APTITUDES : {}, TRANSPORTS : {},
    FACTION : [["Règle d'essai","Sans effet."]],
    OCTROIS_DETACH : {}, APTIS_UNITE : {}, APTIS_COND : {},
    AURAS_ARMEE : [], ABIMEES : {}, AURAS_PERSO : {}
  }
});
`;

const nav = await chromium();
/* Service worker bloqué : il sert data-necrons.js depuis son cache, et
   ses requêtes ne passent pas par le routage de Playwright — la seconde
   faction disparaissait au premier rechargement, sans erreur, ce qui
   donnait l'illusion que la bascule ne tenait pas. */
const ctx = await nav.newContext({ viewport: { width: 390, height: 1400 }, serviceWorkers: 'block' });
try { await ctx.grantPermissions(['clipboard-read', 'clipboard-write']); } catch { /* pas partout */ }
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
p.on('dialog', d => d.accept());

/* la seconde faction, servie à la suite de la première */
let injecte = false;
await p.route('**/data-necrons.js', async route => {
  const rep = await route.fetch();
  const corps = await rep.text();
  route.fulfill({ response: rep, body: corps + (injecte ? ESSAI : '') });
});

const ok = [], ko = [];
const T = (nom, v, att) => {
  const bon = typeof att === 'function' ? att(v) : JSON.stringify(v) === JSON.stringify(att);
  (bon ? ok : ko).push(nom + ' : ' + JSON.stringify(v) +
    (bon ? '' : ' (attendu ' + JSON.stringify(att) + ')'));
};
const listes = () => p.evaluate(() =>
  JSON.parse(localStorage.getItem('mathhammer.lists.v1') || 'null'));

/* ============================================================
   1. UNE LISTE D'AVANT LE CHAMP FACTION
   ============================================================ */
await p.goto(base); await p.waitForTimeout(600);
await p.evaluate(() => {
  localStorage.clear();
  /* exactement la forme d'avant : aucun champ faction nulle part */
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v: 1, actif: 'vieille', listes: [
    { id: 'vieille', nom: "Liste d'avant", cap: 2000, nextId: 3, detach: ['Awakened Dynasty'], fd: '', units: [
      { id: 1, name: 'Necron Warriors', size: 10, lo: [], chars: [], sel: true, grp: '', enh: null },
      { id: 2, name: 'Lychguard', size: 5, lo: [], chars: [], sel: true, grp: '', enh: null }
    ] }
  ] }));
});
await p.reload(); await p.waitForTimeout(1200);

const relue = (await listes()).listes[0];
T("la liste d'avant garde ses unités", relue.units.map(u => u.name), ['Necron Warriors', 'Lychguard']);
T('elle garde son détachement', relue.detach, ['Awakened Dynasty']);
T('et repart en base avec sa faction', relue.faction, 'necrons');
T('la migration est écrite sans attendre une modification', typeof relue.faction, 'string');
T("l'écran affiche bien ses deux unités",
  await p.evaluate(() => document.querySelectorAll('#unitPad .upad').length ||
                         document.querySelectorAll('[data-uid]').length), v => v >= 2);

/* ============================================================
   2. LE CONTRÔLE DES 28 TABLES
   ============================================================ */
const manquante = await p.evaluate(() => {
  try { enregistreFaction({ cle: 'boiteuse', nom: 'Boiteuse', tables: { UNITS: [] } }); return 'acceptée'; }
  catch (e) { return e.message; }
});
T('une faction incomplète est refusée en nommant ce qui manque',
  manquante, v => v !== 'acceptée' && /WEAPONS/.test(v) && /APTITUDES/.test(v));
T("et elle n'entre pas au registre",
  await p.evaluate(() => listeFactions().map(f => f.cle)), v => !v.includes('boiteuse'));

/* ============================================================
   3 à 6. AVEC UNE SECONDE FACTION
   ============================================================ */
injecte = true;
await p.reload(); await p.waitForTimeout(1200);

/* les factions livrées, plus celle qu'on vient d'injecter */
const registre = await p.evaluate(() => listeFactions().map(f => f.cle));
T('la faction injectée rejoint celles qui sont livrées', registre,
  v => v.includes('necrons') && v.includes('custodes') && v.includes('essai'));
T('la première enregistrée reste en service au démarrage',
  await p.evaluate(() => FACTION_ACTIVE), 'necrons');

/* la bascule rebranche les tables ET les index dérivés */
const bascule = await p.evaluate(() => {
  const etat = () => ({ u: UNITS.length, catNec: CATMAP['Necron Warriors'], catEss: CATMAP['Essai-Char'],
    baseNec: BASES['Doomsday Ark'], baseEss: BASES['Essai-Char'],
    kw: Object.keys(KWSET), regle: FACTION[0][0], socle: Object.keys(SOCLES).length });
  const avant = etat();
  activeFaction('essai');
  const pendant = etat();
  activeFaction('necrons');
  return { avant, pendant, apres: etat() };
});
/* on ne fige pas le compte exact : il bouge a chaque fiche ajoutee.
   Ce qui compte, c'est que ce soit la table pleine et pas celle d'a cote. */
T('la table nécrone est au complet', bascule.avant.u, v => v >= 50);
T("la faction d'essai en compte 2", bascule.pendant.u, 2);
T('CATMAP suit la bascule', bascule.pendant.catEss, 'Véhicule');
T("et oublie l'ancienne faction", bascule.pendant.catNec, undefined);
T('BASES est refait depuis le SOCLES de la nouvelle', bascule.pendant.baseEss, '100×60');
T("et ne garde rien de l'ancienne", bascule.pendant.baseNec, undefined);
T('KWSET aussi', bascule.pendant.kw, ['infanterie', 'blindage']);
T('la règle de faction suit', bascule.pendant.regle, "Règle d'essai");
T('au retour, les tables nécrones sont telles quelles',
  JSON.stringify(bascule.apres), JSON.stringify(bascule.avant));

/* ---- deux listes, deux factions, un seul stockage ---- */
await p.evaluate(() => {
  const o = JSON.parse(localStorage.getItem('mathhammer.lists.v1'));
  o.listes.push({ id: 'ess', nom: "Liste d'essai", faction: 'essai', cap: 2000, nextId: 3,
    detach: ['Essai Detachment'], fd: '', units: [
      { id: 1, name: 'Essai-Pieton', size: 5, lo: [], chars: [], sel: true, grp: '', enh: null },
      { id: 2, name: 'Essai-Char', size: 1, lo: [], chars: [], sel: true, grp: '', enh: null }] });
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify(o));
});
await p.reload(); await p.waitForTimeout(1200);

const deux = await listes();
const nec = deux.listes.find(L => L.faction === 'necrons');
const ess = deux.listes.find(L => L.faction === 'essai');
T('la liste nécrone garde ses 2 unités après relecture', nec.units.length, 2);
T("la liste d'essai garde les siennes, relue dans SA table", ess.units.length, 2);
T("aucune n'a été relue dans la faction de l'autre",
  [nec.units[0].name, ess.units[0].name], ['Necron Warriors', 'Essai-Pieton']);
/* La faction d'essai ne fournit AUCUN nom de groupe. C'est le cas d'une
   faction qu'on ajoute sans s'occuper de cet agrement : il ne doit pas
   emporter le chargement. */
T("une faction sans noms de groupe ne fait pas tomber le chargement", errs.length, 0);
T('ses unités portent simplement un groupe vide',
  ess.units.map(u => u.grp), ['', '']);

/* ---- le sélecteur ---- */
const sel = await p.evaluate(() => {
  const row = document.getElementById('rowFaction'), s = document.getElementById('listFaction');
  return { cache: row.hidden, choix: [...s.options].map(o => o.value),
           libelles: [...s.options].map(o => o.textContent), valeur: s.value };
});
T("le sélecteur sort de sa cachette dès qu'il y a un choix", sel.cache, false);
T('il propose exactement les factions du registre', sel.choix, registre);
T('chacune sous son nom', sel.libelles,
  v => v.length === registre.length && v.every(Boolean) &&
       v.includes('Nécrons') && v.includes('Adeptus Custodes'));
T("et montre celle de la liste ouverte", sel.valeur, 'necrons');

/* changer la faction d'une liste peuplée : la question est posée
   (le dialogue est accepté d'office ici), puis la liste est vidée */
await p.evaluate(() => {
  const s = document.getElementById('listFaction');
  s.value = 'essai'; s.dispatchEvent(new Event('change'));
});
await p.waitForTimeout(400);
const apresChgt = await p.evaluate(() => {
  const o = JSON.parse(localStorage.getItem('mathhammer.lists.v1'));
  const L = o.listes.find(x => x.id === o.actif);
  return { faction: L.faction, n: L.units.length, detach: L.detach.length,
           enService: FACTION_ACTIVE, unites: UNITS.length };
});
T('la liste change de faction', apresChgt.faction, 'essai');
T('ses unités sont retirées, pas converties', apresChgt.n, 0);
T('son détachement aussi', apresChgt.detach, 0);
T("et la table de la nouvelle faction est en service", apresChgt.enService, 'essai');
T('avec ses 2 fiches', apresChgt.unites, 2);

/* ---- le lien de partage, bout en bout ---- */
/* on repart sur la liste d'essai peuplée, qui n'a pas bougé */
await p.evaluate(() => {
  const o = JSON.parse(localStorage.getItem('mathhammer.lists.v1'));
  o.actif = 'ess';
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify(o));
});
await p.reload(); await p.waitForTimeout(1200);
T("la liste d'essai est bien en service", await p.evaluate(() => FACTION_ACTIVE), 'essai');

const lien = await p.evaluate(async () => {
  const b = document.getElementById('btnShare2');
  if (!b) return null;
  b.click();
  await new Promise(r => setTimeout(r, 400));
  try { return await navigator.clipboard.readText(); } catch (e) { return 'CLIPBOARD: ' + e.message; }
});
T('le bouton rend un lien', lien, v => typeof v === 'string' && /#/.test(v));

if (typeof lien === 'string' && /#/.test(lien)) {
  const hash = lien.slice(lien.indexOf('#'));
  /* on efface les listes pour que la reçue soit seule à l'arrivée */
  await p.evaluate(() => localStorage.removeItem('mathhammer.lists.v1'));
  await p.goto(base + hash);
  await p.waitForTimeout(1400);
  const recue = await p.evaluate(() => {
    const o = JSON.parse(localStorage.getItem('mathhammer.lists.v1'));
    const L = o.listes.find(x => x.id === o.actif);
    return { faction: L.faction, unites: L.units.map(u => u.name), enService: FACTION_ACTIVE };
  });
  T("la liste reçue par lien arrive dans sa faction", recue.faction, 'essai');
  T('avec ses unités', recue.unites, ['Essai-Pieton', 'Essai-Char']);
  T('et met cette faction en service', recue.enService, 'essai');
}

console.log('\n════ CONFORME ════'); ok.forEach(x => console.log('  ✓ ' + x));
console.log('\n════ ÉCARTS ════'); console.log(ko.length ? ko.map(x => '  ✗ ' + x).join('\n') : '  (aucun)');
console.log('\n════ ERREURS JS ════'); console.log(errs.length ? [...new Set(errs)].join('\n') : '  aucune');
console.log('\n' + (ok.length + ko.length) + ' contrôles, ' + ko.length + ' écart(s).');
await nav.close();
process.exit(ko.length || errs.length ? 1 : 0);
