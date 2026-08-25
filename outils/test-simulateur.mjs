/* LE SIMULATEUR : DEUX ENCADRES, ET CE QUE LE DETACHEMENT PERMET VRAIMENT

   « Retouches de partie » ne montre plus que ce que l'unite chargee et le
   detachement retenu permettent : la situation sur la table, les conditions
   du detachement, les strategemes payables, les aptitudes de fiche. Les
   modificateurs bruts -- et tout ce que le jeu permet ailleurs -- sont
   descendus dans « Capacites et modifications », ou l'on prospecte.

   Lancer : node outils/test-simulateur.mjs  (site servi sur :8099, ou $SITE) */
import { chromium, base } from './navigateur.mjs';
const ok = [], ko = [];
const eq = (quoi, vu, att) => (vu === att ? ok : ko).push(
  (vu === att ? '  ✓ ' : '  ✗ ') + quoi + ' : ' + JSON.stringify(vu) +
  (vu === att ? '' : ' au lieu de ' + JSON.stringify(att)));

const b = await chromium();
const p = await b.newPage({ viewport:{width:430,height:1600} });
p.on('pageerror', e => ko.push('  ✗ PAGEERROR ' + e.message));
await p.goto(base + 'index.html'); await p.waitForTimeout(900);

const liste = async (detach, unites) => {
  await p.evaluate(([d, u]) => {
    localStorage.setItem('mathhammer.lists.v1', JSON.stringify({v:1, actif:'l', listes:[{
      id:'l', nom:'S', cap:3000, detach:[d], fd:'', nextId:9, units:u}]}));
  }, [detach, unites]);
  await p.reload(); await p.waitForTimeout(1100);
  await p.click('#tabs button[data-s="scSim"]'); await p.waitForTimeout(500);
};
const IMM = [{id:1, name:'Immortals', size:10, lo:[], chars:[{name:'Technomancer', lo:[]}],
              sel:true, grp:'', enh:null}];
const charge = id => p.evaluate(i => { window.SIM.charge(i, 'T'); }, id);
const atk = () => p.evaluate(() => window.SIM.atk());
const pose = (k, v) => p.evaluate(([a, b2]) => window.SIM.pose(a, b2), [k, v]);
const situ = (cle, v) => p.evaluate(([a, b2]) => {
  window.ROSTER.poseSituation(a, b2); window.SIM.charge(window.SIM.atk().id || 1, 'T');
}, [cle, v]);

console.log('\n== 1. les deux encadres ==');
await liste('Cryptek Conclave', IMM);
const html = await p.evaluate(() => document.body.innerHTML);
const dans = (id, quoi) => p.evaluate(([a, b2]) => {
  const h = document.getElementById(a); return !!(h && h.querySelector(b2));
}, [id, quoi]);
eq('les modificateurs bruts ont quitté les retouches de partie',
  await dans('viteBox', '#segHitMod'), false);
eq('... et sont dans Capacités et modifications',
  await dans('cardAbil', '#segHitMod'), true);
eq('les relances aussi', await dans('cardAbil', '#segRrW'), true);
eq('les seuils critiques aussi', await dans('cardAbil', '#segCritW'), true);
eq('les capacités d\'arme y sont restées', await dans('cardAbil', '#capGrid'), true);
eq('l\'encadré du bas s\'appelle Capacités et modifications',
  /Capacités et modifications/.test(html), true);
eq('l\'ancien nom a disparu', /Ce que la partie ajoute/.test(html), false);
eq('chaque encadré a son compte', /id="capCount"/.test(html), true);

console.log('\n== 2. le Conclave de Crypteks : cinq aptitudes au choix ==');
await charge(1);
const a0 = await atk();
eq('l\'unité est chargée', a0.unite !== null, true);
const critW0 = a0.moteur[0].critW;
await situ('cryptek_anti', ['anti-inf']);
eq('Anti-Infanterie 3+ abaisse la blessure critique',
  (await atk()).moteur[0].critW, 3);
await situ('cryptek_anti', ['anti-mont']);
eq('Anti-Monté 4+ l\'abaisse moins', (await atk()).moteur[0].critW, 4);
await situ('cryptek_anti', ['ignore']);
const aIgn = await atk();
eq('Ignore le couvert se pose sur les armes de tir',
  aIgn.moteur.every(m => m.ignoresCover), true);
eq('... et la blessure critique revient à son seuil', aIgn.moteur[0].critW, critW0);
await situ('cryptek_anti', ['lourd']);
eq('Lourd seul ne donne rien — il faut ne pas avoir bougé',
  (await atk()).moteur[0].hitMod, 0);
await pose('immobile', true);
eq('resté immobile, Lourd donne son +1', (await atk()).moteur[0].hitMod, 1);
await pose('immobile', false);
await situ('cryptek_anti', ['anti-inf', 'lourd']);
eq('deux aptitudes tiennent ensemble — le stratagème Pouvoir Inexploité',
  (await atk()).moteur[0].critW, 3);
await situ('cryptek_anti', []);

console.log('\n== 3. resté immobile ne profite qu\'aux armes LOURDES ==');
await liste('Awakened Dynasty', [{id:1, name:'Lokhust Heavy Destroyers', size:3, lo:[],
                                  chars:[], sel:true, grp:'', enh:null}]);
await charge(1);
await pose('immobile', true);
const lh = await atk();
const lourdes = lh.moteur.filter(m => m.heavy), legeres = lh.moteur.filter(m => !m.heavy);
eq('des armes LOURDES sont bien là', lourdes.length > 0, true);
eq('elles gagnent leur +1', lourdes.every(m => m.hitMod === 1), true);
eq('les autres ne gagnent rien', legeres.every(m => m.hitMod === 0), true);

console.log('\n== 4. le Panthéon : le stratagème et l\'aura ensemble ==');
await liste('Pantheon of Woe', IMM);
await charge(1);
const s0 = await p.evaluate(() => window.SIM.strats());
const aura = s0.find(x => /Aura Entrophasique/.test(x.nom));
eq('le stratagème est proposé', !!aura, true);
eq('il relance les 1 pour toucher', aura && aura.effet.rrH, 'ones');
eq('il ne relance pas encore les blessures', aura && aura.effet.rrW, undefined);
eq('et il le dit', !!(aura && aura.enAttente), true);
await situ('monster_ap1', true);
const s1 = await p.evaluate(() => window.SIM.strats());
const aura1 = s1.find(x => /Aura Entrophasique/.test(x.nom));
eq('cible effritée déclarée, il relance aussi les 1 pour blesser',
  aura1 && aura1.effet.rrW, 'ones');
eq('et il ne parle plus d\'attente', !!(aura1 && aura1.enAttente), false);

await b.close();
console.log([...ok, ...ko].join('\n'));
console.log('\n' + ok.length + ' ok, ' + ko.length + ' KO');
process.exit(ko.length ? 1 : 0);
