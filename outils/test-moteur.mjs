/* LE MOTEUR SEUL : CE QUE LE CABLAGE NE SAVAIT PAS DIRE

   Sans navigateur. Chaque regle ajoutee au moteur le 30/10/2026 est
   mesuree deux fois : par l'esperance exacte (analytic) et par la
   simulation (simulate). Les deux doivent s'accorder, et l'effet doit
   aller dans le bon sens, de la bonne taille.

   Lancer : node outils/test-moteur.mjs */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('../engine.js');
const E = globalThis.ENG;

const ok = [], ko = [];
const T = (quoi, bon, dit) => (bon ? ok : ko).push((bon ? '  ✓ ' : '  ✗ ') + quoi + (dit ? ' : ' + dit : ''));
const proche = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const N = 60000;

const BASE = { attacks:"10", kind:"T", bs:3, str:4, ap:0, dmg:"1",
  tough:4, sv:7, inv:0, wounds:1, models:10, fnp:0, dmgRed:0, cover:false,
  torrent:false, lethal:false, dev:false, sustainedOn:false, sustainedN:"1",
  blast:false, rapidOn:false, rapidN:0, meltaOn:false, meltaN:0,
  critH:6, critW:6, hitMod:0, wndMod:0, rrH:"none", rrW:"none" };
const P = o => Object.assign({}, BASE, o);
/* esperance et simulation de degats bruts, cote a cote */
const deux = s => { const a = E.analytic(s), m = E.simulate(s, N); return [a.rawDmg, m.meanRaw]; };
const accord = (quoi, s, tol = 0.03) => {
  const [a, m] = deux(s);
  T(quoi + ' — esperance et simulation d\'accord', proche(a, m, tol), a.toFixed(3) + ' / ' + m.toFixed(3));
  return a;
};

console.log('\n== l\'existant ne bouge pas ==');
const ref = accord('profil de reference', P({}));
T('10 attaques CT3+ F4 E4 sans sauvegarde : 10·4/6·3/6', proche(ref, 10*4/6*3/6, 1e-9), ref.toFixed(4));

console.log('\n== l\'Endurance de la cible ==');
const tm = accord('toughMod −1', P({toughMod:-1}));
T('F4 contre E4−1 blesse a 3+', proche(tm, 10*4/6*4/6, 1e-9), tm.toFixed(4));
T('jamais sous 1', E.endurance({tough:1, toughMod:-3}) === 1);

console.log('\n== les relances uniques ==');
const h1 = accord('une relance de touche', P({rrH1:true}));
/* P(au moins un rate parmi 10) · 4/6 */
T('elle ajoute (1−(4/6)^10)·4/6·3/6', proche(h1 - ref, (1 - Math.pow(4/6, 10))*4/6*3/6, 1e-9),
  (h1 - ref).toFixed(4));
const h1e = accord('rrH « un » venu de l\'ecran', P({rrH:"un"}));
T('l\'ecran et le champ disent la meme chose', proche(h1e, h1, 1e-9));
const hf = E.analytic(P({rrH:"failed", rrH1:true})).rawDmg;
T('inutile quand on relance deja tous les rates', proche(hf, E.analytic(P({rrH:"failed"})).rawDmg, 1e-9));
accord('relance des 1 plus une unique', P({rrH:"ones", rrH1:true}));
accord('une relance de blessure', P({rrW1:true}));
const d2 = accord('relance des 1 et des 2 pour blesser', P({rrW:"deux", str:3}));
const d1 = E.analytic(P({rrW:"ones", str:3})).rawDmg, dF = E.analytic(P({rrW:"failed", str:3})).rawDmg;
T('« deux » entre « 1 » et « ratés »', d1 < d2 && d2 < dF, [d1, d2, dF].map(x => x.toFixed(3)).join(' < '));
/* plusieurs profils : UNE relance pour l'unite */
const deuxProfils = E.simulateCombined([P({rrH1:true, attacks:"1"}), P({rrH1:true, attacks:"1"})], N).meanRaw;
const seul = E.analytic(P({attacks:"2", rrH1:true})).rawDmg;
T('deux profils partagent la meme relance unique', proche(deuxProfils, seul, 0.04),
  deuxProfils.toFixed(3) + ' / ' + seul.toFixed(3));

console.log('\n== les relances de degats ==');
const dd = P({dmg:"D6", wounds:20});
const d0 = accord('D6 sans relance', dd);
const dT = accord('D6, relance de tous les jets faibles', P({dmg:"D6", wounds:20, rrD:"tous"}));
T('D6 relance sous 3,5 vaut 4,25 par attaque', proche(dT / d0 * 3.5, 4.25, 1e-9), (dT / d0 * 3.5).toFixed(3));
const dU = accord('D6, une relance', P({dmg:"D6", wounds:20, rrD:"un"}), 0.04);
T('« un » entre rien et « tous »', d0 < dU && dU < dT);
T('degats fixes : la relance ne change rien', proche(E.analytic(P({dmg:"2", rrD:"tous"})).rawDmg, E.analytic(P({dmg:"2"})).rawDmg, 1e-9));

console.log('\n== la relance du nombre d\'attaques ==');
const a0 = E.analytic(P({attacks:"D6"})).rawDmg;
const aR = accord('D6 attaques, jet faible relance', P({attacks:"D6", rrA:"tous"}));
T('D6 relance sous 3,5 vaut 4,25 attaques', proche(aR / a0 * 3.5, 4.25, 1e-9), (aR / a0 * 3.5).toFixed(3));

console.log('\n== [LANCE] ==');
const l0 = E.analytic(P({lance:true})).rawDmg;
const l1 = accord('lance apres une charge', P({lance:true, charge:true}));
T('sans charge, rien', proche(l0, ref, 1e-9));
T('apres une charge, +1 pour blesser', proche(l1, 10*4/6*4/6, 1e-9));
T('plafonnee avec les autres modificateurs', proche(E.analytic(P({lance:true, charge:true, wndMod:1})).rawDmg, l1, 1e-9));

console.log('\n== le genre psychique ==');
const fp = P({psychic:true, fnpPsy:5, wounds:3, dmg:"3"});
const f1 = accord('insensibilite 5+ contre une arme psychique', fp);
T('elle joue contre une arme psychique', proche(f1, E.analytic(P({fnp:5, wounds:3, dmg:"3"})).rawDmg, 1e-9));
T('pas contre une autre', proche(E.analytic(Object.assign({}, fp, {psychic:false})).rawDmg, E.analytic(P({wounds:3, dmg:"3"})).rawDmg, 1e-9));
T('elle ne degrade pas une meilleure insensibilite', proche(E.analytic(Object.assign({}, fp, {fnp:4})).rawDmg, E.analytic(P({fnp:4, wounds:3, dmg:"3"})).rawDmg, 1e-9));

console.log('\n== CT amelioree, caracteristiques fixees ==');
const bm = accord('CT amelioree de 1', P({bsMod:1, bs:4}));
T('CT4+ amelioree = CT3+', proche(bm, ref, 1e-9));
T('cumulee avec +1 pour toucher, elle depasse le plafond', E.analytic(P({bs:4, bsMod:1, hitMod:1})).rawDmg > E.analytic(P({bs:4, hitMod:1})).rawDmg);
T('jamais mieux que 2+', E.ctEffective({bs:2, bsMod:2}) === 2);
T('CT fixee a 3+', proche(E.analytic(P({bs:5, bsSet:3})).rawDmg, ref, 1e-9));
T('Force fixee a 8 contre E4', proche(E.analytic(P({strSet:8})).rawDmg, 10*4/6*5/6, 1e-9));
T('Attaques fixees a 12', proche(E.analytic(P({atkSet:12})).rawDmg, 12*4/6*3/6, 1e-9));
T('Degats fixes a 3', proche(E.analytic(P({dmg:"D3", dmgSet:3, wounds:3})).rawDmg, 3*ref, 1e-9));

console.log('\n== la PA d\'une blessure critique ==');
const ac = accord('PA +2 sur blessure critique, Svg 3+', P({sv:3, apCrit:2}));
/* normales 2/6 : sauvees a 3+ (4/6) ; critiques 1/6 : sauvees a 5+ (2/6) */
T('les critiques percent a part', proche(ac, 10*4/6*(2/6*2/6 + 1/6*4/6), 1e-9), ac.toFixed(4));

console.log('\n== ce que la cible impose ==');
T('−1 pour toucher', proche(E.analytic(P({defHit:-1})).rawDmg, 10*3/6*3/6, 1e-9));
T('... qu\'« ignore les malus » efface', proche(E.analytic(P({defHit:-1, ignoreMalus:true})).rawDmg, ref, 1e-9));
T('−1 pour blesser', proche(E.analytic(P({defWnd:-1})).rawDmg, 10*4/6*2/6, 1e-9));
T('−1 si F > E : pas a F egale', proche(E.analytic(P({defWndFE:-1})).rawDmg, ref, 1e-9));
T('... mais a F5 contre E4', proche(E.analytic(P({defWndFE:-1, str:5})).rawDmg, 10*4/6*3/6, 1e-9));
T('... et l\'Endurance retouchee compte', proche(E.analytic(P({defWndFE:-1, toughMod:-1})).rawDmg, 10*4/6*3/6, 1e-9));
const hv = accord('degats divises par deux', P({dmg:"3", wounds:5, dmgHalf:true}));
T('3 degats deviennent 2', proche(hv, 2*ref, 1e-9));
T('1 degat reste 1', proche(E.analytic(P({dmgHalf:true})).rawDmg, ref, 1e-9));
const sm = accord('sauvegarde d\'armure amelioree', P({sv:4, svMod:1}));
T('Svg 4+ amelioree = 3+', proche(sm, E.analytic(P({sv:3})).rawDmg, 1e-9));
T('l\'invulnerable n\'en profite pas', proche(E.analytic(P({sv:7, inv:4, svMod:1})).rawDmg, E.analytic(P({sv:7, inv:4})).rawDmg, 1e-9));

console.log(ok.join('\n'));
if(ko.length){ console.log('\nECHECS :\n' + ko.join('\n')); process.exit(1); }
console.log('\n' + ok.length + ' verifications, toutes bonnes.');
