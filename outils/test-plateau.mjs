/* Suite d'intégration de l'axe Plateau.
   Ouvre l'axe sur une liste témoin et mesure ce que l'écran prétend dire.
   Lancer : node outils/test-plateau.mjs (le site doit être servi sur :8099, ou $SITE) */
import { chromium, base } from './navigateur.mjs';
const errs = [], ok = [];
const dit = (quoi, vu, attendu) => {
  const bon = typeof attendu === 'function' ? attendu(vu) : vu === attendu;
  (bon ? ok : errs).push(`${bon ? '✓' : '✗'} ${quoi} : ${JSON.stringify(vu)}`);
};

const b = await chromium();
const p = await b.newPage({ viewport:{width:1000,height:1300} });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
await p.goto(base + 'index.html');
await p.waitForTimeout(1000);

await p.evaluate(() => {
  const L = { id:'ltest', nom:'Test plateau', cap:2000, detach:['Awakened Dynasty'], fd:'',
    nextId:6, units:[
      {id:1,name:'Necron Warriors',size:10,lo:[],chars:[],sel:null,grp:'',enh:''},
      {id:2,name:'Lychguard',size:5,lo:[],chars:[{name:'Technomancer',w:[]}],sel:null,grp:'',enh:''},
      {id:3,name:'Doomsday Ark',size:1,lo:[],chars:[],sel:null,grp:'',enh:''},
      {id:4,name:'Tomb Blades',size:3,lo:[],chars:[],sel:null,grp:'',enh:''},
      {id:5,name:'Immortals',size:20,lo:[],chars:[],sel:null,grp:'',enh:''}
    ]};
  localStorage.removeItem('mathhammer.plateau.v1');
  localStorage.setItem('mathhammer.lists.v1', JSON.stringify({v:1, actif:'ltest', listes:[L]}));
});
await p.reload(); await p.waitForTimeout(1100);
await p.click('#tabs button[data-s="scMap"]'); await p.waitForTimeout(700);

const e0 = await p.evaluate(() => window.PLATEAU.etat());
dit('disposition déduite du détachement', e0.dispo, 'Take and Hold');
dit('mission primaire nommée', e0.mission, 'Battlefield Dominance');
dit('décor officiel de la carte', e0.decorsOfficiels, v => v > 5);
dit('objectifs de la carte', e0.objectifs, v => v >= 2);
/* le document peint le dense en vert et le leger en or ; une carte
   porte toujours des deux */
dit('terrain dense sur la carte', e0.denses, v => v > 0);
dit('terrain leger sur la carte', e0.legers, v => v > 0);

/* poser toutes les unités */
const n = await p.locator('[data-pose]').count();
for(let i=0;i<n;i++){ await p.locator('[data-pose]').nth(i).click({force:true}); await p.waitForTimeout(200); }
const e1 = await p.evaluate(() => window.PLATEAU.etat());
dit('unités posées', e1.posees, n);
dit('figurines sur la table', e1.figurines, 10 + 6 + 1 + 3 + 20);
dit('figurines dessinées', await p.locator('#mapSvg [data-unite]').count(), 40);

/* chaque unité : cohésion bonne et prise au sol sous 9 pouces */
for(const id of [1,2,3,4,5]){
  const u = await p.evaluate(i => window.PLATEAU.unite(i), id);
  dit(`${u.nom} — ${u.figurines} fig., socle ${u.socle}, prise ${u.prise}″`,
      u.isolees === 0 && u.prise <= 9.01, true);
}

/* le socle vient bien du guide officiel */
dit('socle des Tomb Blades (petit socle volant)',
    (await p.evaluate(() => window.PLATEAU.unite(4))).socle, '60x35.5 mm ovale');
dit('socle de la Doomsday Ark (grand socle volant)',
    (await p.evaluate(() => window.PLATEAU.unite(3))).socle, '120x92 mm ovale');

/* Déplacement de l'unité entière. L'en-tête de l'application est collante :
   on amène le plateau au milieu de la fenêtre, sinon le pointeur tombe sur
   l'en-tête au lieu du plateau. */
const auMilieu = async () => {
  await p.evaluate(() => document.getElementById('mapSvg').scrollIntoView({block:'center'}));
  await p.waitForTimeout(350);
  return p.locator('#mapSvg').boundingBox();
};
const av = await p.evaluate(() => window.PLATEAU.unite(1));
let box = await auMilieu();
const ech = box.width / 63;                      /* pixels par pouce affiché */
const f0 = await p.locator('#mapSvg [data-unite="1"]').first().boundingBox();
await p.mouse.move(f0.x + f0.width/2, f0.y + f0.height/2);
await p.mouse.down();
await p.mouse.move(box.x + box.width*0.5, box.y + box.height*0.6, {steps:14});
const ruban = await p.locator('#mapSvg text').filter({hasText:'″'}).count();
dit('la distance s\'affiche pendant le geste', ruban, v => v >= 1);
const hud = await p.locator('#mapHud').textContent();
dit('le bandeau annonce les pouces parcourus', /parcourus/.test(hud), true);
dit('le bandeau compare au mouvement', /mouvement/.test(hud), true);
await p.mouse.up(); await p.waitForTimeout(300);
const ap = await p.evaluate(() => window.PLATEAU.unite(1));
dit('l\'unité entière a suivi, formation intacte', ap.figurines === av.figurines &&
    Math.abs(ap.prise - av.prise) < 0.2, true);
dit('l\'unité a bougé', Math.hypot(ap.centre.x-av.centre.x, ap.centre.y-av.centre.y) > 1, true);

/* déplacement d'une seule figurine */
await p.locator('[data-mode="figurine"]').click({force:true}); await p.waitForTimeout(400);
await p.locator('[data-pose]').first().click({force:true}); await p.waitForTimeout(300);
const av2 = await p.evaluate(() => window.PLATEAU.unite(1));
box = await auMilieu();
const cible = await p.locator('#mapSvg [data-unite="1"][data-fig="0"]').boundingBox();
await p.mouse.move(cible.x + cible.width/2, cible.y + cible.height/2);
await p.mouse.down();
await p.mouse.move(cible.x + ech*6, cible.y + ech*5, {steps:12});
await p.mouse.up(); await p.waitForTimeout(300);
const ap2 = await p.evaluate(() => window.PLATEAU.unite(1));
dit('une seule figurine a bougé — la prise au sol s\'étire', ap2.prise > av2.prise + 1, true);
dit('la figurine écartée est signalée isolée', ap2.isolees, v => v >= 1);

/* reformer répare la formation */
/* On amène le bouton sous les yeux avant de cliquer. Un clic forcé
   part des coordonnées de l'élément : dès qu'une carte s'ajoute plus
   haut dans la page, il atterrit sur le bouton d'à côté et la suite
   échoue en accusant le reformage. C'est arrivé deux fois. */
await p.locator('#mapReforme').scrollIntoViewIfNeeded();
await p.waitForTimeout(200);
await p.locator('#mapReforme').click(); await p.waitForTimeout(400);
const ap3 = await p.evaluate(() => window.PLATEAU.unite(1));
dit('reformer en quinconce rétablit la cohésion', ap3.isolees, 0);
dit('reformer ramène la prise au sol sous 9″', ap3.prise, v => v <= 9.01);

await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(250);
await p.screenshot({ path:'outils/shot-large.png', fullPage:true });
await p.setViewportSize({width:430,height:930}); await p.waitForTimeout(450);
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(250);
await p.screenshot({ path:'outils/shot-mobile.png', fullPage:true });
const deb = await p.evaluate(()=>[document.documentElement.scrollWidth, document.documentElement.clientWidth]);
dit('pas de débordement horizontal', deb[0] <= deb[1]+1, true);

/* les trois axes d'avant basculent toujours */
/* ---- la ligne de vue ---- */
const ombres = () => p.evaluate(() => document.querySelectorAll('#mapSvg path[fill-rule]').length);
await p.locator('[data-unite]').first().click({force:true}); await p.waitForTimeout(300);
dit('sans le réglage, pas d\'ombre', await ombres(), 0);
await p.locator('[data-portee="vue"]').scrollIntoViewIfNeeded();
await p.locator('[data-portee="vue"]').click(); await p.waitForTimeout(200);
await p.locator('[data-unite]').first().click({force:true}); await p.waitForTimeout(400);
dit('la lampe projette son ombre', await ombres(), 1);
/* On interroge l\'ombre elle-même, point par point, plutôt que de relire
   le code : isPointInFill dit si un point du plateau est dans l\'ombre.
   Deux choses en découlent. La lampe s\'éclaire elle-même — sinon le
   décor où se tient la figurine l\'occulterait, alors que la règle exclut
   les zones où l\'une des deux figurines se trouve. Et l\'ombre couvre une
   part du plateau, ni rien ni tout. */
const sonde = await p.evaluate(() => {
  const svg = document.querySelector('#mapSvg');
  const ch = svg.querySelector('path[fill-rule]');
  const l = svg.querySelector('#mapLampe');
  const pt = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q; };
  const lampe = ch.isPointInFill(pt(+l.getAttribute('cx'), +l.getAttribute('cy')));
  let noir = 0, tout = 0;
  for(let x = 0.5; x < 60; x += 1) for(let y = 0.5; y < 44; y += 1){
    tout++; if(ch.isPointInFill(pt(x, y))) noir++;
  }
  return { lampe: lampe, part: noir / tout };
});
dit('la lampe s\'éclaire elle-même', sonde.lampe, false);
dit('l\'ombre couvre une part du plateau, ni rien ni tout',
    Math.round(sonde.part * 100) / 100, v => v > 0.05 && v < 0.95);

/* Mordre une emprise, c'est voir a travers TOUTE l'emprise. On interroge
   le meme point deux fois, sans socle puis avec un socle qui touche
   l'emprise : rien d'autre n'a bouge, la regle est donc seule en cause.
   Et le terrain dense, lui, ne cede pas -- au milieu meme de l'emprise,
   les murs qu'elle porte ombrent encore. */
const mord = await p.evaluate(() => {
  const b = window.PLATEAU.lampe([22, 30], 0);
  const e = b.emprises[0];
  const cx = e.reduce((s, q) => s + q[0], 0) / e.length;
  const cy = e.reduce((s, q) => s + q[1], 0) / e.length;
  const v = e[0], dx = v[0] - cx, dy = v[1] - cy, n = Math.hypot(dx, dy) || 1;
  const dehors = [v[0] + dx/n*0.3, v[1] + dy/n*0.3];
  const oter = o => { delete o.emprises; return o; };
  return { sans: oter(window.PLATEAU.lampe(dehors, 0)),
           avec: oter(window.PLATEAU.lampe(dehors, 0.6)),
           milieu: oter(window.PLATEAU.lampe([cx, cy], 0.6)) };
});
dit('un socle qui ne touche rien ne mord aucune emprise', mord.sans.mordues, 0);
dit('un socle qui chevauche l\'emprise la mord', mord.avec.mordues, v => v >= 1);
dit('l\'emprise mordue cesse d\'ombrer',
    mord.avec.ombres < mord.sans.ombres, true);
dit('les murs pleins ombrent toujours autant',
    mord.avec.pleins === mord.sans.pleins && mord.sans.pleins > 0, true);
dit('au milieu de l\'emprise, ses murs ombrent encore', mord.milieu.pleins, v => v > 0);

/* Deux emprises collees n'en font qu'une : mordre l'une ecarte les deux.
   On le lit sans rien supposer -- on pose un socle au centre de chaque
   emprise et on compte celles que ce socle ecarte. */
const colle = await p.evaluate(() => {
  const b = window.PLATEAU.lampe([22, 30], 0);
  const C = e => [e.reduce((s, q) => s + q[0], 0) / e.length,
                  e.reduce((s, q) => s + q[1], 0) / e.length];
  const n = b.emprises.map(e => window.PLATEAU.lampe(C(e), 0).mordues);
  return { liees: b.liees, seules: n.filter(v => v === 1).length,
           doubles: n.filter(v => v >= 2).length };
});
dit('des emprises sont collees deux a deux', colle.liees, v => v >= 2);
dit('mordre l\'une des deux, c\'est ecarter les deux', colle.doubles, v => v >= 2);
dit('les autres restent seules', colle.seules, v => v > 0);

/* Et c'est le SOCLE qui mord, pas son centre : le meme point, avec le
   meme socle ovale, mord ou ne mord pas selon qu'on le pose en travers
   ou en long. Un point, ou un disque, ne saurait pas faire la
   difference. */
const ovale = await p.evaluate(() => {
  const b = window.PLATEAU.lampe([22, 30], 0);
  const e = b.emprises[0];
  const cx = e.reduce((s, q) => s + q[0], 0) / e.length;
  const cy = e.reduce((s, q) => s + q[1], 0) / e.length;
  const v = e[0], dx = v[0] - cx, dy = v[1] - cy, n = Math.hypot(dx, dy) || 1;
  const p2 = [v[0] + dx/n*1.2, v[1] + dy/n*1.2];
  const a = Math.atan2(dy, dx) * 180 / Math.PI;
  return { point: window.PLATEAU.lampe(p2, 0).mordues,
           long: window.PLATEAU.lampe(p2, 1.6, 0.3, a + 180).mordues,
           travers: window.PLATEAU.lampe(p2, 1.6, 0.3, a + 90).mordues };
});
dit('le centre seul ne mord pas', ovale.point, 0);
dit('le socle pose en long mord', ovale.long, v => v >= 1);
dit('le meme socle mis en travers ne mord pas', ovale.travers, 0);
await p.reload(); await p.waitForTimeout(1000);
await p.click('#tabs button[data-s="scMap"]'); await p.waitForTimeout(500);
await p.locator('[data-unite]').first().click({force:true}); await p.waitForTimeout(400);
dit('le réglage survit au rechargement', await ombres(), 1);
await p.locator('[data-portee="vue"]').scrollIntoViewIfNeeded();
await p.locator('[data-portee="vue"]').click(); await p.waitForTimeout(200);
await p.locator('[data-unite]').first().click({force:true}); await p.waitForTimeout(300);
dit('on peut la rééteindre', await ombres(), 0);

for(const s of ['scList','scSim','scPlay']){
  await p.click(`#tabs button[data-s="${s}"]`); await p.waitForTimeout(350);
  dit('axe ' + s, await p.evaluate(id => document.getElementById(id).classList.contains('on'), s), true);
}

console.log(ok.join('\n'));
if(errs.length){ console.log('\n' + errs.join('\n')); process.exitCode = 1; }
else console.log(`\n${ok.length} contrôles, aucun écart.`);
await b.close();
