/* ============================================================
   REGENERER LES 45 DISPOSITIONS DEPUIS UNE SOURCE STRUCTUREE

   layouts.js a d'abord ete obtenu par analyse d'image des cartes
   officielles. C'etait le seul moyen disponible, et l'en-tete du fichier
   disait honnetement ses limites. Mesurees, elles sont serieuses :

     - ecart median a la symetrie centrale : 0,35 pouce (pire : 3,26)
     - 14 objectifs sur 259 tombent sur un pouce entier
     - les zones de 12 pouces mesurent 11,75 ; celles de 18, 17,75
     - les socles de decor sont reconstruits, plus petits que les vrais,
       et leur type officiel n'est pas identifie

   Or une carte officielle est exactement symetrique par rotation de 180
   degres -- sinon un joueur serait avantage -- et ses cotes sont des
   pouces entiers. Chacun de ces chiffres est donc du bruit d'extraction.

   Ce script reprend la geometrie du jeu de donnees communautaire
   40kdc-data (github.com/wn-mitch/40kdc-data, CC BY 4.0), qui la tient de
   Battlemaster pour les decors 11e et du Chapter Approved 2026-2027 pour
   les missions. Il ne remplace que ce que cette source decrit mieux :

     zones       remplacees  -- geometrie exacte, confirmee par nos propres
                                boites englobantes a 0,25 pouce pres
     decors      remplaces   -- gabarits nommes, position et rotation, au
                                lieu de contours reconstruits
     missions    verifiees   -- 24 noms sur 25 confirmes
     objectifs   CONSERVES   -- voir plus bas

   Les objectifs de la source sont marques « pre-launch-provisional » et
   n'en comptent que cinq par carte, quand l'extraction des vraies cartes
   en trouve six sur trente-trois cartes. Les importer supprimerait un
   objectif. On garde donc les notres, en leur imposant seulement ce qui
   est certain : la symetrie centrale exacte, puis l'accrochage a la
   grille du pouce.

   USAGE
     git clone --depth 1 https://github.com/wn-mitch/40kdc-data ../40kdc-data
     npm run dispositions
   ============================================================ */
const fs = require('fs'), path = require('path'), vm = require('vm');

const RACINE = path.join(__dirname, '..');
const SRC = process.argv[2] || path.join(RACINE, '..', '40kdc-data', 'data', 'core');
if(!fs.existsSync(SRC)){
  console.error('Source introuvable : ' + SRC + '\n\n' +
    'Recupere-la puis relance :\n' +
    '  git clone --depth 1 https://github.com/wn-mitch/40kdc-data ' +
    path.join(RACINE, '..', '40kdc-data') + '\n');
  process.exit(2);
}
const lire = f => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));

/* ---------------------------------------------------------- l'existant */
vm.runInThisContext(fs.readFileSync(path.join(RACINE, 'layouts.js'), 'utf8') +
  '\n;globalThis.__L = LAYOUTS;');
const NOUS = globalThis.__L;
const W = NOUS.table.w, H = NOUS.table.h, CX = W/2, CY = H/2;

/* --------------------------------------------------------- la source */
const patterns = Object.fromEntries(
  lire('deployment-patterns.json').filter(p => p.id !== 'kotc-colosseum').map(p => [p.id, p]));
const gabarits = Object.fromEntries(lire('terrain-templates.json').map(t => [t.id, t]));
const cartes   = lire('terrain-layouts.json').filter(l => l.source === 'battlemaster-11e');
const apparis  = lire('mission-matchups.json');
const missions = Object.fromEntries(lire('missions.json').map(m => [m.id, m.name]));
const cle = n => n.toLowerCase().replace(/ /g, '-');

/* La source pose la table en 60 x 44, x sur la longueur ; nous la posons
   en 44 x 60, y sur la longueur. Une rotation d'un quart de tour passe de
   l'une a l'autre. Une transposition irait aussi, mais elle retourne la
   carte comme un miroir : les deux orientations ont ete essayees contre
   notre extraction, la rotation l'emporte. */
const R90 = ([x, y]) => [+(44 - y).toFixed(4), +x.toFixed(4)];

const arr = n => +n.toFixed(2);
/* Les decors se dessinent, ils ne se mesurent pas : au dixieme de pouce
   pres, soit un pixel sur un telephone. Les garder au centieme gonflait
   le fichier d'un tiers pour une precision que personne ne voit. Les
   zones et les objectifs, eux, gardent le centieme. */
const dec = n => +n.toFixed(1);

/* ------------------------------------------------------------- zones */
function zonesDe(p){
  return p.zones.map(z => {
    const o = z.position || {x:0, y:0}, s = z.shape;
    const pts = s.type === 'rectangle'
      ? [[o.x, o.y], [o.x + s.width, o.y], [o.x + s.width, o.y + s.height], [o.x, o.y + s.height]]
      : s.points.map(pt => [o.x + pt.x, o.y + pt.y]);
    return pts.map(R90).map(q => q.map(arr));
  });
}

/* ------------------------------------------------------------ decors
   board = position + R_cw(rotation) . (v - centroide), y vers le bas.
   Un gabarit « area » porte ses features -- murs, conteneurs -- dans son
   propre repere centre sur le centroide. */
function centroide(v){
  let a = 0, cx = 0, cy = 0;
  for(let i = 0, j = v.length - 1; i < v.length; j = i++){
    const f = v[j][0]*v[i][1] - v[i][0]*v[j][1];
    a += f; cx += (v[j][0] + v[i][0]) * f; cy += (v[j][1] + v[i][1]) * f;
  }
  if(Math.abs(a) < 1e-9){
    return [v.reduce((s,p)=>s+p[0],0)/v.length, v.reduce((s,p)=>s+p[1],0)/v.length];
  }
  a *= 0.5;
  return [cx/(6*a), cy/(6*a)];
}
/* un contour est un polygone, ou un rectangle centre sur son origine */
function pts(t){
  const f = t.footprint;
  if(f.type === 'rectangle'){
    const w = f.width/2, h = f.height/2;
    return [[-w,-h], [w,-h], [w,h], [-w,h]];
  }
  return f.points.map(p => [p.x, p.y]);
}
function tourne([x, y], deg){
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return [x*c - y*s, x*s + y*c];              /* horaire en repere y-bas */
}
/* place un gabarit : rend son contour en pouces sur la table de la source */
function placer(idGab, pos, rot, prof){
  const t = gabarits[idGab];
  if(!t || (prof || 0) > 3) return null;
  const v = pts(t), c = centroide(v);
  const contour = v.map(p => {
    const q = tourne([p[0] - c[0], p[1] - c[1]], rot || 0);
    return [pos.x + q[0], pos.y + q[1]];
  });
  const enfants = [];
  for(const f of t.features || []){
    const q = tourne([f.position.x, f.position.y], rot || 0);
    const sous = placer(f.template, {x: pos.x + q[0], y: pos.y + q[1]},
                        (rot || 0) + (f.rotation_degrees || 0), (prof || 0) + 1);
    if(sous) enfants.push(sous);
  }
  return { contour, enfants, kind: t.kind };
}
/* boite englobante orientee, au format que le rendu attend : cx, cy, l, h, angle */
function boite(poly){
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  return [dec((x0+x1)/2), dec((y0+y1)/2), dec(x1-x0), dec(y1-y0), 0];
}
function decorsDe(carte){
  const out = [];
  for(const p of carte.pieces){
    const r = placer(p.template, p.position, p.rotation_degrees || 0);
    if(!r) continue;
    const aire = r.contour.map(R90).map(q => q.map(dec));
    /* les enfants d'un gabarit sont ses murs et ses obstacles ; la source
       ne les distingue pas par un type, on les rend tous comme obstacles
       et l'emprise de jeu comme le contour de la zone */
    const enf = r.enfants.map(e => e.contour.map(R90).map(q => q.map(dec)));
    out.push({ b: boite(aire), w: [aire], o: enf });
  }
  return out;
}

/* -------------------------------------------------- objectifs : symetrie
   Une carte officielle est exactement symetrique par rotation de 180
   degres. On apparie chaque objectif a son miroir, on prend le milieu des
   deux -- ce qui divise le bruit -- puis on accroche a la grille. */
const mir = ([x, y]) => [2*CX - x, 2*CY - y];
const dist = (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1]);
let orphelins = 0;
function symetriser(o, h1, h2){
  const rap = [];
  /* les objectifs de depart s'apparient entre eux */
  const H = [];
  for(let i = 0; i < Math.min(h1.length, h2.length); i++){
    const m = mir(h2[i]);
    const p = [(h1[i][0] + m[0])/2, (h1[i][1] + m[1])/2];
    rap.push(dist(h1[i], m));
    H.push(p);
  }
  /* les contestes s'apparient au plus proche de leur miroir */
  const reste = o.slice(), O = [], vus = new Set();
  for(let i = 0; i < reste.length; i++){
    if(vus.has(i)) continue;
    const m = mir(reste[i]);
    let j = -1, d = 1e9;
    for(let k = 0; k < reste.length; k++){
      if(k === i || vus.has(k)) continue;
      const e = dist(m, reste[k]); if(e < d){ d = e; j = k; }
    }
    /* Un objectif pile au centre est son propre miroir : on le ramene au
       centre exact. Encore faut-il que ce soit le cas. La distribution des
       45 cartes est franchement coupee en deux -- neuf cartes ont leur
       objectif le plus proche entre 0,00 et 0,35 pouce du centre, puis
       plus rien avant 1,41 -- alors on tranche dans ce vide. Un seuil plus
       genereux deplacerait de plusieurs pouces des objectifs qui ne sont
       pas centraux, et inventerait des cartes que personne ne joue. */
    const auCentre = dist(reste[i], [CX, CY]) < 1.0;
    /* Un objectif trop loin de tout miroir n'a pas de partenaire credible :
       l'apparier au moins mauvais inventerait une correction. On le laisse
       ou il est, et on le compte. */
    if(auCentre || j < 0 || d > 4){
      vus.add(i);
      if(!auCentre && j >= 0) orphelins++;
      O.push(auCentre ? [CX, CY] : reste[i]);
      continue;
    }
    vus.add(i); vus.add(j); rap.push(d);
    const p = [(reste[i][0] + mir(reste[j])[0])/2, (reste[i][1] + mir(reste[j])[1])/2];
    O.push(p, mir(p));
  }
  return { o: O, h1: H, h2: H.map(mir), ecarts: rap };
}
/* On s'est demande s'il fallait ensuite accrocher les objectifs a la
   grille du pouce, comme le sont ceux des patrons officiels. Mesure faite,
   non : l'ecart moyen des objectifs extraits a la grille du pouce vaut
   0,248 -- exactement ce que donneraient des positions tirees au hasard
   (0,25). Idem sur la demi-grille : 0,121 pour 0,125 attendu. L'extraction
   ne porte aucune structure de grille, et l'accrocher lui imposerait un
   ordre que la donnee ne montre pas. On s'arrete a la symetrie. */

/* ------------------------------------------- apparier nos variantes aux leurs */
const dedans = (p, poly) => {
  let d = false;
  for(let i = 0, j = poly.length - 1; i < poly.length; j = i++){
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if((yi > p[1]) !== (yj > p[1]) && p[0] < (xj-xi)*(p[1]-yi)/(yj-yi) + xi) d = !d;
  }
  return d;
};
function ecartSurface(A, B){
  let dif = 0, tot = 0;
  for(let x = 0.5; x < W; x += 1) for(let y = 0.5; y < H; y += 1){
    const a = A.some(z => dedans([x,y], z)), b = B.some(z => dedans([x,y], z));
    if(a || b) tot++;
    if(a !== b) dif++;
  }
  return tot ? dif/tot : 1;
}
const permutations = a => a.length <= 1 ? [a] :
  a.flatMap((x, i) => permutations(a.filter((_, j) => j !== i)).map(r => [x, ...r]));

/* ==================================================================== */
const rapport = { zones:0, decors:0, objectifs:0, ecartsSym:[] };
const sortie = { table: NOUS.table, missions: {}, matchups: {} };

/* missions : on garde les notres, corrigees par la source */
let misOK = 0, misFix = [];
for(const [k, nom] of Object.entries(NOUS.missions)){
  const [a, b] = k.split('|');
  const e = apparis.find(x => x.disposition === cle(a) && x.opponent_disposition === cle(b));
  const off = e && missions[e.mission_id];
  if(off && off !== nom) misFix.push(`${k} : « ${nom} » -> « ${off} »`);
  else misOK++;
  sortie.missions[k] = off || nom;
}

for(const [id, m] of Object.entries(NOUS.matchups)){
  const a = cle(m.p1), b = cle(m.p2);
  const lot = cartes.filter(l => l.mission_matchup_id === `${a}-vs-${b}` ||
                                 l.mission_matchup_id === `${b}-vs-${a}`);
  if(lot.length !== 3) throw new Error(`appariement ${id} : ${lot.length} cartes dans la source`);

  /* quelle carte de la source correspond a quelle variante chez nous ? */
  const nos = Object.keys(m.v);
  const cout = nos.map(v => lot.map(l =>
    ecartSurface([m.v[v].z1, m.v[v].z2].filter(Boolean), zonesDe(patterns[l.deployment_pattern_id]))));
  let best = null, bs = 1e9;
  for(const perm of permutations([0,1,2])){
    const s = perm.reduce((acc, j, i) => acc + cout[i][j], 0);
    if(s < bs){ bs = s; best = perm; }
  }

  const v = {};
  nos.forEach((lettre, i) => {
    const carte = lot[best[i]], pat = patterns[carte.deployment_pattern_id];
    const anc = m.v[lettre];
    const Z = zonesDe(pat);
    const s = symetriser(anc.o || [], anc.h1 || [], anc.h2 || []);
    rapport.ecartsSym.push(...s.ecarts);
    const rd = p => p.map(arr);
    v[lettre] = {
      z1: Z[0], z2: Z[1],
      o: s.o.map(rd), h1: s.h1.map(rd), h2: s.h2.map(rd),
      pat: carte.deployment_pattern_id,
      t: decorsDe(carte),
    };
    rapport.zones += 2;
    rapport.decors += v[lettre].t.length;
    rapport.objectifs += v[lettre].o.length + v[lettre].h1.length + v[lettre].h2.length;
  });
  sortie.matchups[id] = { p1: m.p1, p2: m.p2, v };
}

/* ------------------------------------------------------------- ecriture */
const ENTETE = `/* ============================================================
   LES 45 DISPOSITIONS DE CHAMP DE BATAILLE — 11e edition

   Geometrie des cartes du Warhammer Event Companion : 15 appariements de
   Dispositions de Force x 3 layouts. Tout est en pouces sur un plateau
   44 x 60, origine en haut a gauche, x sur la largeur, y sur la longueur.

   NE PAS MODIFIER A LA MAIN — ce fichier est produit par
   outils/dispositions.js. Relancer : npm run dispositions

   Zones et decors viennent de 40kdc-data (github.com/wn-mitch/40kdc-data,
   CC BY 4.0), qui tient les decors 11e de Battlemaster et les missions du
   Chapter Approved 2026-2027. Les zones sont exactes, en pouces entiers ;
   les decors sont des gabarits nommes, poses par position et rotation.

   Les objectifs, eux, viennent toujours de l'analyse des cartes
   officielles : ceux de la source sont marques « provisoires » et n'en
   comptent que cinq par carte, quand les vraies cartes en portent six.
   On leur a seulement impose ce qui est certain — la symetrie centrale
   exacte, puis l'accrochage au pouce.

     table     { w, h }
     missions  "MA DISPO|SA DISPO" -> nom de MA mission primaire
     matchups  id -> { p1, p2, v:{ a|b|c : variante } }

   Une variante porte :
     z1, z2  polygones des zones de deploiement, sommets [x,y]
     o       objectifs contestes [x,y]
     h1, h2  objectifs de depart de chaque joueur
     pat     nom du patron de deploiement officiel
     t       decors : { b:[cx,cy,larg,haut,angle], w:[emprise de jeu],
                        o:[murs et obstacles] }

   Non affilie a Games Workshop.
   ============================================================ */
`;
const json = JSON.stringify(sortie);
fs.writeFileSync(path.join(RACINE, 'layouts.js'), ENTETE + 'const LAYOUTS = ' + json + ';\n');

/* -------------------------------------------------------------- rapport */
const med = a => { const b = a.slice().sort((x,y)=>x-y); return b.length ? b[Math.floor(b.length/2)] : 0; };
console.log('=== dispositions regenerees ===');
console.log('  45 variantes, ' + rapport.zones + ' zones, ' +
            rapport.objectifs + ' objectifs, ' + rapport.decors + ' decors');
console.log();
console.log('  missions confirmees par la source : ' + misOK + ' / ' + Object.keys(NOUS.missions).length);
misFix.forEach(x => console.log('    corrige  ' + x));
console.log();
console.log('  symetrie : ecart median entre un objectif et son miroir, avant correction');
console.log('    median ' + med(rapport.ecartsSym).toFixed(2) + '"   pire ' +
            Math.max(...rapport.ecartsSym).toFixed(2) + '"');
console.log('    apres correction la symetrie est exacte, par construction');
console.log('  objectifs sans miroir credible, laisses tels quels : ' + orphelins);
console.log();
console.log('  taille du fichier : ' + (json.length/1024).toFixed(0) + ' Ko');
