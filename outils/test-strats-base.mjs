/* ============================================================
   LES STRATAGÈMES DE BASE QUI FONT DES DÉGÂTS

   Le 03/11/2026, Kevin voulait retrouver dans le simulateur la grenade
   (EXPLOSIFS en 11e) pour ses Venatari et le tank shock (IMPACT
   ÉCRASANT) pour les véhicules et les monstres. Ni l'un ni l'autre ne
   retouche un jet : ils infligent des blessures mortelles. Cette suite
   vérifie :
   1. le moteur : l'espérance exacte et la simulation, plafond compris ;
   2. l'offre : seulement les unités qui portent le mot-clé, et seulement
      dans la bonne phase ;
   3. l'écran : la pastille cochée ajoute ses blessures au résultat.

   Lancer : node outils/test-strats-base.mjs (le site servi sur :8099, ou $SITE)
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
const pres = (a, b, tol) => Math.abs(a - b) <= tol;

await p.goto(base); await p.waitForTimeout(800);

/* ---- 1. le moteur ---- */
const moteur = await p.evaluate(() => {
  const cible = { tough: 4, sv: 3, inv: 0, wounds: 1, models: 10, fnp: 0 };
  const exp = Object.assign({}, cible, { mortels: { des: 6, seuil: 4, max: 0 } });
  const imp = Object.assign({}, cible, { mortels: { des: 12, seuil: 5, max: 6 } });
  const fnp = Object.assign({}, exp, { fnp: 5 });
  return {
    exp: ENG.analytic(exp).rawDmg, expSim: ENG.simulate(exp, 40000).meanDealt,
    impCap: ENG.moyenneMortels(imp.mortels), impSim: ENG.simulate(imp, 40000),
    fnp: ENG.analytic(fnp).rawDmg,
    seul: ENG.simulateCombined([exp], 20000).meanSlain
  };
});
T('Explosifs : 6D6 à 4+ = 3 blessures mortelles en moyenne', moteur.exp, v => pres(v, 3, 1e-9));
T('… et la simulation le confirme', moteur.expSim, v => pres(v, 3, 0.05));
T('Impact écrasant E12 : 12D6 à 5+, plafonné à 6 (sous 4)', moteur.impCap, v => v < 4 && v > 3.5);
T("… la simulation ne dépasse jamais six", Math.max(...Object.keys(moteur.impSim.dmgDist)
  .filter(k => moteur.impSim.dmgDist[k] > 0).map(Number)), v => v <= 6);
T('une insensibilité 5+ arrête un tiers des mortelles', moteur.fnp, v => pres(v, 2, 1e-9));
T('une blessure mortelle par figurine de 1 PV', moteur.seul, v => pres(v, 3, 0.06));

/* ---- 2. l'offre, sur une liste custodes ---- */
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({ v: 1, actif: 'sb', listes: [
    { id: 'sb', nom: 'Stratagèmes de base', faction: 'custodes', cap: 2000, nextId: 4,
      detach: ['Shield Host'], fd: '', units: [
        { id: 1, name: 'Venatari with Kinetic Destroyers', size: 3, lo: [], chars: [], sel: true, grp: '', enh: null },
        { id: 2, name: 'Caladius Grav-tank', size: 1, lo: [], chars: [], sel: true, grp: '', enh: null },
        { id: 3, name: 'Custodian Guard Sodality', size: 4, lo: [], chars: [], sel: true, grp: '', enh: null }
      ] }
  ] }));
});
await p.reload(); await p.waitForTimeout(1400);
const offre = (id, ph) => p.evaluate(([id, ph]) => {
  SIM.charge(id, ph);
  return SIM.strats().filter(x => x.mortels).map(x => x.nom);
}, [id, ph]);
T('Venatari (EXPLOSIVES), au tir : Explosifs', await offre(1, 'T'), ['Explosifs']);
T('Venatari, au combat : rien (ce ne sont pas des véhicules)', await offre(1, 'C'), []);
T('Caladius, au combat : Impact écrasant', await offre(2, 'C'), ['Impact écrasant']);
T('Caladius, au tir : rien (pas de grenades)', await offre(2, 'T'), []);
T('Gardes Custodiens : ni l\'un ni l\'autre', [await offre(3, 'T'), await offre(3, 'C')], [[], []]);
T("l'Impact du Caladius jette autant de dés que son Endurance", await p.evaluate(() => {
  SIM.charge(2, 'C');
  const x = SIM.strats().find(s => s.mortels);
  return [x.mortels.des === SIM.unitRow('Caladius Grav-tank')[2], x.mortels.seuil, x.mortels.max];
}), [true, 5, 6]);

/* ---- 3. l'écran : cocher ajoute les mortelles au résultat ---- */
const ecran = await p.evaluate(() => {
  SIM.charge(1, 'T');
  const lit = () => parseFloat(document.getElementById('sumDmg').textContent.replace(',', '.'));
  const avant = lit();
  const b = [...document.querySelectorAll('.vstrat')].find(x => /Explosifs/.test(x.textContent));
  if (!b) return null;
  b.click();
  const b2 = [...document.querySelectorAll('.vstrat')].find(x => /Explosifs/.test(x.textContent));
  const apres = lit();
  const funnel = document.getElementById('funnel').textContent;
  b2.click();
  return { avant, apres, coche: b2.classList.contains('on'), funnel,
           retour: lit(), compte: document.getElementById('viteCount').textContent };
});
T('la pastille Explosifs est à l\'écran', !!ecran, true);
if (ecran){
  T('cochée, elle ajoute des dégâts', ecran.apres - ecran.avant, v => v > 1);
  T('elle se voit cochée', ecran.coche, true);
  T("l'entonnoir dit la part des mortelles", ecran.funnel, v => /dont 3,0 mortelles/.test(v));
  T('décochée, le résultat revient', Math.abs(ecran.retour - ecran.avant), v => v < 0.3);
}
T('aucune erreur dans la page', errs, []);
await nav.close();
console.log(ok.map(x => '  ok  ' + x).join('\n'));
if (ko.length){ console.log(ko.map(x => '  KO  ' + x).join('\n')); process.exit(1); }
console.log('\n' + ok.length + ' vérifications, toutes bonnes.');
