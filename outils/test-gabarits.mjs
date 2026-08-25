/* ============================================================
   LES DISPOSITIONS CONFRONTEES AU DOCUMENT OFFICIEL

   Le Compagnon de Rencontre Warhammer v1.1 (22 juillet 2026) publie la
   liste des gabarits de zones de terrain employes par les 45 agencements
   recommandes, avec leur quantite :

       7"  x 11,5"              4
       8"  x 11,5"  polygonal   2
       10" x 2,5"               2
       6"  x 4"                 4
       6"  x 2"                 4
                                --
                                16 zones par agencement

   layouts.js, lui, est produit depuis 40kdc-data. Les deux sources sont
   independantes : si la geometrie generee redonne le decompte officiel,
   gabarit par gabarit et sur les 45 cartes, c'est une verification et
   non une coincidence.

   Mesurer demande une precaution. Une boite englobante alignee sur les
   axes ment deux fois : elle gonfle des qu'une piece est posee de biais,
   et elle englobe les petites excroissances par lesquelles l'ombre d'une
   ruine deborde de sa zone. On mesure donc l'ecartement des deux longs
   cotes porteurs — les aretes qui portent le plus de longueur dans une
   direction donnee.

   Le gabarit polygonal, lui, n'est pas un rectangle : le document le dit
   lui-meme. Il est reconnu par elimination, et son compte verifie.

   Lancer : node outils/test-gabarits.mjs
   ============================================================ */
import fs from 'fs';
import path from 'path';

const racine = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(racine, 'layouts.js'), 'utf8');
const L = new Function(src + '; return LAYOUTS;')();

/* les quatre gabarits rectangulaires, et le polygonal a part */
const RECT = [[11.5, 7, 4], [10, 2.5, 2], [6, 4, 4], [6, 2, 4]];
const POLY = ['8" x 11,5" polygonal', 2];
const PAR_CARTE = 16;
const TOL = 0.35;   /* les sommets de layouts.js sont arrondis au dixieme */

/* ecartement des deux cotes qui portent le plus de longueur selon (ux,uy) */
function ecartement(poly, ux, uy){
  const seau = new Map();
  for (const P of poly)
    for (let i = 0; i < P.length; i++){
      const a = P[i], b = P[(i + 1) % P.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      if (len < 0.15) continue;
      if (Math.abs((dx * ux + dy * uy) / len) < 0.97) continue;   /* pas parallele */
      const c = Math.round((-a[0] * uy + a[1] * ux) * 10) / 10;
      seau.set(c, (seau.get(c) || 0) + len);
    }
  const deux = [...seau].sort((x, y) => y[1] - x[1]).slice(0, 2);
  return deux.length === 2 ? Math.abs(deux[0][0] - deux[1][0]) : null;
}

function gabarit(w){
  const axes = [[1, 0]];
  for (const P of w)
    for (let i = 0; i < P.length; i++){
      const dx = P[(i + 1) % P.length][0] - P[i][0], dy = P[(i + 1) % P.length][1] - P[i][1];
      const n = Math.hypot(dx, dy);
      if (n > 2) axes.push([dx / n, dy / n]);
    }
  for (const [ux, uy] of axes){
    const a = ecartement(w, ux, uy), b = ecartement(w, -uy, ux);
    if (a == null || b == null) continue;
    const [g, p] = [a, b].sort((x, y) => y - x);
    const t = RECT.find(([A, B]) => Math.abs(g - A) <= TOL && Math.abs(p - B) <= TOL);
    if (t) return t[0] + 'x' + t[1];
  }
  return null;
}

const compte = new Map(RECT.map(r => [r[0] + 'x' + r[1], 0]));
let cartes = 0, zones = 0, polygonales = 0;
const fautives = [];

for (const id of Object.keys(L.matchups))
  for (const v of Object.keys(L.matchups[id].v)){
    cartes++;
    const t = L.matchups[id].v[v].t || [];
    zones += t.length;
    if (t.length !== PAR_CARTE) fautives.push(id + v + ' : ' + t.length + ' zones');
    let poly = 0;
    for (const d of t){
      const g = d.w && d.w.length ? gabarit(d.w) : null;
      if (g) compte.set(g, compte.get(g) + 1); else poly++;
    }
    polygonales += poly;
    if (poly !== POLY[1]) fautives.push(id + v + ' : ' + poly + ' zones polygonales');
  }

const ok = [], ko = [];
const T = (nom, vrai, dit) => (vrai ? ok : ko).push(nom + ' — ' + dit);

T('45 agencements', cartes === 45, cartes + ' cartes');
T('16 zones de terrain par agencement',
  zones === 45 * PAR_CARTE, zones + ' zones, soit ' + (zones / cartes).toFixed(2) + ' par carte');
for (const [w, h, n] of RECT)
  T('gabarit ' + w + '" x ' + String(h).replace('.', ',') + '"',
    compte.get(w + 'x' + h) === n * cartes,
    (compte.get(w + 'x' + h) / cartes).toFixed(2) + ' par carte, attendu ' + n);
T('gabarit ' + POLY[0], polygonales === POLY[1] * cartes,
  (polygonales / cartes).toFixed(2) + ' par carte, attendu ' + POLY[1]);

console.log('\n════ CONFORME AU COMPAGNON DE RENCONTRE ════');
ok.forEach(x => console.log('  ✓ ' + x));
if (ko.length){
  console.log('\n════ ÉCARTS ════');
  ko.forEach(x => console.log('  ✗ ' + x));
  if (fautives.length) console.log('\n  cartes en cause : ' + fautives.slice(0, 20).join(', '));
}
console.log('\n' + ok.length + ' contrôles verts, ' + ko.length + ' écart' + (ko.length > 1 ? 's' : '') + '.\n');
process.exit(ko.length ? 1 : 0);
