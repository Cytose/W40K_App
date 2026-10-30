/* LES RÈGLES QUE LE SIMULATEUR NE SAVAIT PAS JOUER (30/10/2026)

   Le moteur seul est éprouvé par test-moteur.mjs. Celle-ci vérifie le
   chemin entier, de la liste au chiffre : qu'une règle câblée avec les
   nouveaux champs arrive bien sur les bonnes armes, et seulement sur
   elles.

   Lancer : node outils/test-regles.mjs  (site servi sur :8099, ou $SITE) */
import { chromium, base } from './navigateur.mjs';
const ok = [], ko = [];
const eq = (quoi, vu, att) => {
  const bon = JSON.stringify(vu) === JSON.stringify(att);
  (bon ? ok : ko).push((bon ? '  ✓ ' : '  ✗ ') + quoi + ' : ' + JSON.stringify(vu) +
    (bon ? '' : ' au lieu de ' + JSON.stringify(att)));
};
const vrai = (quoi, v) => eq(quoi, !!v, true);

const b = await chromium();
const p = await b.newPage({ viewport:{width:430,height:1600} });
p.on('pageerror', e => ko.push('  ✗ PAGEERROR ' + e.message));
await p.goto(base + 'index.html'); await p.waitForTimeout(900);

const liste = async (faction, detach, unites) => {
  await p.evaluate(([f, d, u]) => {
    localStorage.clear();
    localStorage.setItem('mathhammer.lists.v1', JSON.stringify({v:1, actif:'l', listes:[{
      id:'l', nom:'R', faction:f, cap:3000, detach:d, fd:'', nextId:9, units:u}]}));
  }, [faction, detach, unites]);
  await p.reload(); await p.waitForTimeout(1200);
  await p.click('#tabs button[data-s="scSim"]'); await p.waitForTimeout(400);
};
const unite = (id, name, size, chars) => ({id, name, size, lo:[], chars:(chars || []).map(n => ({name:n, lo:[]})),
                                            sel:true, grp:'', enh:null});
const charge = (id, ph) => p.evaluate(([i, f]) => window.SIM.charge(i, f), [id, ph]);
const moteur = () => p.evaluate(() => window.SIM.atk().moteur);
const pose = (k, v) => p.evaluate(([a, c]) => window.SIM.pose(a, c), [k, v]);
const cond = (n, on) => p.evaluate(([a, c]) => window.SIM.cond(a, c), [n, on]);
const conds = () => p.evaluate(() => window.SIM.atk().conditions);
const esp = () => p.evaluate(() => window.SIM.esperances());
const offre = () => p.evaluate(() => window.SIM.offre().presets);
const generique = n => p.evaluate(k => window.SIM.applyGenericTarget(k), n);

console.log('\n== Death Guard : la LANCE du Seigneur de la Contagion, le Don de Nurgle ==');
await liste('deathguard', ['Virulent Vectorium'], [unite(1, 'Plague Marines', 5, ['Lord of Contagion'])]);
await generique('Space Marine');
await charge(1, 'C');
let m = await moteur();
vrai('les armes de mêlée du groupe reçoivent la LANCE', m.length && m.every(x => x.lance));
eq('... sans charge, elle ne joue pas', m.map(x => x.wndMod), m.map(() => 0));
eq('« A chargé ce tour » est proposé', (await offre()).includes('charge'), true);
const avant = await esp();
await pose('charge', true);
m = await moteur();
eq('après une charge, +1 pour blesser sur chaque arme', m.map(x => x.wndMod), m.map(() => 1));
const apres = await esp();
/* une arme qui blesse déjà à 2+ n'y gagne rien : le +1 est plafonné */
vrai('... et l\'espérance monte', apres.every((v, i) => v >= avant[i]) && apres.some((v, i) => v > avant[i]));
await pose('charge', false);
vrai('l\'ancienne pastille « LANCE comptée comme +1 » a disparu',
  !(await conds()).some(c => /\[LANCE\]/.test(c) && /chargé/.test(c)));
vrai('le Don de Nurgle se propose', (await conds()).some(c => /Don de Nurgle/.test(c)));
await cond('Don de Nurgle — cible Affligée', true);
m = await moteur();
eq('déclaré, il retire 1 en Endurance à la cible', m.map(x => x.toughMod), m.map(() => -1));
await cond('Don de Nurgle — cible Affligée', false);
/* Overwhelming Generosity : le stratagème pose la relance du nombre
   d'attaques ; le Blight launcher (D3 attaques) en profite */
await charge(1, 'T');
const strats = await p.evaluate(() => window.SIM.strats().map(s => s.nom));
vrai('« Overwhelming Generosity » est proposé', strats.includes('Overwhelming Generosity'));

console.log('\n== Thousand Sons : les règles des seules armes psychiques ==');
await liste('thousandsons', ['Grand Coven'], [unite(1, 'Rubric Marines', 5, ['Sorcerer'])]);
await generique('Space Marine');
await charge(1, 'T');
const noms = await p.evaluate(() => window.SIM.atk().actifs);
const psy = await p.evaluate(() => window.SIM.atk().moteur.map(x => x.psychic));
vrai('l\'unité a des armes psychiques et d\'autres', psy.includes(true) && psy.includes(false));
await cond('Maelström Psychique', true);
m = await moteur();
eq('le Maelström ne donne +1 pour blesser qu\'aux armes psychiques',
  m.map(x => x.wndMod), psy.map(v => v ? 1 : 0));
await cond('Maelström Psychique', false);
await cond('Courroux de l\'Immaterium', true);
m = await moteur();
eq('le Courroux ne donne [DÉVASTATRICES] qu\'aux armes psychiques',
  m.map(x => x.dev), psy.map((v, i) => v || [...noms][i].startsWith('Soulreaper')));
await cond('Courroux de l\'Immaterium', false);
/* Sorcelleries Tordues : le Sorcier seul, ses armes psychiques seules */
await cond('Sorcelleries Tordues — Force', true);
const avantF = await p.evaluate(() => window.SIM.atk().moteur.map(x => x.str));
await cond('Sorcelleries Tordues — Force', false);
const nuF = await p.evaluate(() => window.SIM.atk().moteur.map(x => x.str));
eq('+3 en Force sur la seule « Pandaemonic Delusion » du Sorcier',
  noms.filter((n, i) => avantF[i] !== nuF[i]).map(n => n.replace(/ ×\d+$/, '').replace(/^.* — /, '')),
  ['Pandaemonic Delusion']);

console.log('\n== Thousand Sons : les relances uniques du Warpforged Cabal ==');
await liste('thousandsons', ['Warpforged Cabal'], [unite(1, 'Chaos Predator Annihilator', 1)]);
await generique('Char lourd (T11)');
await charge(1, 'T');
const e0 = await esp();
await cond('Infusion de Feu Warp — une relance de touche', true);
m = await moteur();
vrai('une relance de touche, sur chaque arme', m.every(x => x.rrH1));
const e1 = await esp();
vrai('... qui fait monter l\'espérance sans la doubler',
  e1.every((v, i) => v >= e0[i]) && e1.reduce((a, v) => a + v, 0) < 1.5 * e0.reduce((a, v) => a + v, 0));
await cond('Infusion de Feu Warp — une relance de dégâts', true);
m = await moteur();
eq('une relance de dégâts', m.map(x => x.rrD), m.map(() => 'un'));

console.log('\n== la cible : ce qu\'elle impose, et ce que l\'écran garde ==');
await liste('deathguard', [], [unite(1, 'Plague Marines', 5)]);
await generique('Space Marine');
await pose('defWnd', -1);
await generique('Terminator');
eq('changer de cible remet ses défenses à zéro', await p.evaluate(() => window.SIM.S.defWnd), 0);
eq('les mots-clés de cible nouveaux sont là',
  await p.evaluate(() => ['psyker','chaos','demon','imperium','titan','nuee','bete','fort','marcheur']
    .every(k => MOTS_CIBLE.some(x => x[0] === k))), true);

await b.close();
console.log(ok.join('\n'));
if(ko.length){ console.log('\nKO :\n' + ko.join('\n')); }
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
process.exit(ko.length ? 1 : 0);
