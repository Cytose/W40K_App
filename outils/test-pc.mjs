/* Le gain de PC contre les Regles de Base 08.02 :
   « chaque joueur gagne 1 PC » a l'etape 2 de CHAQUE phase de
   Commandement — donc deux par round de bataille pour moi. */
import { chromium, base } from './navigateur.mjs';
const nav = await chromium();
const p = await nav.newPage({viewport:{width:390,height:1400}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(base); await p.waitForTimeout(600);
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mathhammer.lists.v1',JSON.stringify({v:1,actif:'a',listes:[{id:'a',nom:'Essai PC',cap:2000,nextId:9,detach:['Hypercrypt Legion'],units:[
 {id:1,name:'Necron Warriors',size:10,lo:[],chars:[],sel:true,grp:'',enh:null}]}]}))});
await p.reload(); await p.waitForTimeout(1000);
await p.evaluate(()=>document.querySelector('[data-s="scPlay"]').click()); await p.waitForTimeout(500);

const ok = [], ko = [];
const T = (nom, v, att) => (v === att ? ok : ko).push(nom + ' : ' + v + (v === att ? '' : ' (attendu ' + att + ')'));

const pc = () => p.evaluate(()=>{
  const c = [...document.querySelectorAll('#gbar .gc')].find(x=>/PC/.test(x.textContent));
  return c ? parseInt(c.querySelector('.gv').textContent.trim(), 10) : -1;
});
const ou = () => p.evaluate(()=>document.querySelector('.gou')?.textContent.trim()||'—');
const suiv = async () => { await p.evaluate(()=>document.querySelector('.gnext').click()); await p.waitForTimeout(120); };
const prec = async () => { await p.evaluate(()=>document.querySelector('.gprev').click()); await p.waitForTimeout(120); };

T('partie neuve, R1 ma phase de Cmdt', await pc(), 1);
T('le moment de depart', await ou(), 'Round 1 · ton tour · Commandement');

/* les cinq phases de mon tour, puis la main passe : phase de Cmdt adverse */
for (let i = 0; i < 5; i++) await suiv();
T('phase de Commandement adverse, R1', await ou(), 'Round 1 · tour adverse · Commandement');
T('son etape de PC de base me donne aussi 1 PC', await pc(), 2);

/* les cinq phases adverses, puis round 2, ma phase de Cmdt */
for (let i = 0; i < 5; i++) await suiv();
T('round 2, mon tour', await ou(), 'Round 2 · ton tour · Commandement');
T('deux PC par round de bataille', await pc(), 3);

/* un round complet de plus */
for (let i = 0; i < 10; i++) await suiv();
T('round 3, mon tour', await ou(), 'Round 3 · ton tour · Commandement');
T('cinq PC au debut du round 3', await pc(), 5);

/* revenir en arriere rend le point : sinon l'aller-retour enrichit */
await prec();
T('retour au Combat adverse du round 2', await ou(), 'Round 2 · tour adverse · Combat');
T('le point du round 3 est repris', await pc(), 4);
await suiv();
T('et il revient en avancant', await pc(), 5);

/* le rappel de phase enonce la regle des deux joueurs */
const rap = await p.evaluate(()=>{
  const e = document.querySelector('#gbar')?.parentElement?.textContent || document.body.textContent;
  return /les deux joueurs gagnent 1 PC/.test(e);
});
T('le rappel de phase cite la regle', rap, true);

console.log('\n════ CONFORME ════');  ok.forEach(x=>console.log('  ✓ ' + x));
console.log('\n════ ÉCARTS ════');    console.log(ko.length ? ko.map(x=>'  ✗ '+x).join('\n') : '  (aucun)');
console.log('\n════ ERREURS JS ════'); console.log(errs.length ? [...new Set(errs)].join('\n') : '  aucune');
await nav.close();
process.exit(ko.length ? 1 : 0);
