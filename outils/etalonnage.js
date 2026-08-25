/* ============================================================
   CE QUE VAUT L'EXTRACTION, MESURÉ SUR LES NÉCRONS

   L'extracteur sera jugé sur des factions dont personne ici ne connaît
   les chiffres par cœur. La seule façon honnête de savoir ce qu'il vaut
   est de le lâcher sur la seule faction dont l'application a une version
   relue à la main, sur le pack de faction officiel, et de compter les
   écarts.

   Ce qu'il retrouve sur les Nécrons, il le retrouvera ailleurs. Ce qu'il
   rate ici, il le ratera ailleurs — sauf qu'ailleurs, personne ne s'en
   apercevra.

   Lancer :
     python3 outils/extraction.py necrons --sortie build/etalon-necrons.js
     node outils/etalonnage.js build/etalon-necrons.js
   ============================================================ */
const fs = require('fs'), vm = require('vm'), path = require('path');
const RACINE = path.dirname(__dirname);

const charge = fichier => {
  const ctx = vm.createContext({ console });
  vm.runInContext(
    fs.readFileSync(path.join(RACINE, 'data.js'), 'utf8') + '\n' +
    fs.readFileSync(fichier, 'utf8') +
    '\nglobalThis.__T = FACTIONS[ORDRE_FACTIONS[0]].tables;',
    ctx, { filename: path.basename(fichier) });
  return ctx.__T;
};

const REF = charge(path.join(RACINE, 'data-necrons.js'));
const GEN = charge(process.argv[2] || path.join(RACINE, 'build', 'etalon-necrons.js'));

/* les deux sources n'écrivent pas les noms pareil : « Tomb Blade » contre
   « Tomb Blades », « Szarekh » contre « Szarekh, The Silent King ». On
   rapproche sur une clé qui ignore la casse, la ponctuation et le
   pluriel final. */
const cle = n => String(n || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’‘]/g, "'").replace(/\[[^\]]*\]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').trim()
  .replace(/s$/, '');

const index = (t, k) => { const m = new Map(); t.forEach(x => m.set(cle(x[k]), x)); return m; };

let total = 0, accord = 0;
const bloc = [];
const dit = (t, a, b, quoi) => { total++; if (String(a) === String(b)) accord++; else bloc.push([quoi, a, b]); };

/* ---------------- UNITS ---------------- */
const gU = index(GEN.UNITS, 0);
const trouvees = [], perdues = [];
const CHAMPS = [['M', 1], ['E', 2], ['Svg', 3], ['Invu', 4], ['PV', 5], ['CO', 12], ['Cd', 13]];
const compte = {}; CHAMPS.forEach(([n]) => compte[n] = [0, 0]);
let ptsOk = 0, ptsKo = 0, taillesOk = 0, taillesKo = 0;
const ecartsPts = [], ecartsCar = [];

REF.UNITS.forEach(r => {
  const g = gU.get(cle(r[0]));
  if (!g) { perdues.push(r[0]); return; }
  trouvees.push(r[0]);
  CHAMPS.forEach(([nom, i]) => {
    const a = String(r[i] === undefined ? '' : r[i]), b = String(g[i] === undefined ? '' : g[i]);
    if (a === b) compte[nom][0]++; else { compte[nom][1]++; ecartsCar.push([r[0], nom, a, b]); }
  });
  if (JSON.stringify(r[6]) === JSON.stringify(g[6])) taillesOk++;
  else { taillesKo++; ecartsPts.push([r[0], 'tailles', JSON.stringify(r[6]), JSON.stringify(g[6])]); }
  if (JSON.stringify(r[7]) === JSON.stringify(g[7])) ptsOk++;
  else { ptsKo++; ecartsPts.push([r[0], 'points', JSON.stringify(r[7]), JSON.stringify(g[7])]); }
});

console.log('════ LES FICHES ════');
console.log('  référence ' + REF.UNITS.length + ' · extraites ' + GEN.UNITS.length +
  ' · rapprochées ' + trouvees.length);
console.log('');
console.log('  champ      d\'accord   en écart');
CHAMPS.forEach(([n]) => console.log('   ' + n.padEnd(9) + String(compte[n][0]).padStart(7) +
  String(compte[n][1]).padStart(11)));
console.log('   tailles  ' + String(taillesOk).padStart(7) + String(taillesKo).padStart(11));
console.log('   points   ' + String(ptsOk).padStart(7) + String(ptsKo).padStart(11));

if (perdues.length) {
  console.log('\n  non retrouvées dans l\'extraction (' + perdues.length + ') :');
  perdues.forEach(n => console.log('    · ' + n));
}
if (ecartsCar.length) {
  console.log('\n  écarts de caractéristique (référence contre extraction) :');
  ecartsCar.slice(0, 20).forEach(([n, c, a, b]) =>
    console.log('    · ' + n.padEnd(32) + c.padEnd(6) + 'réf=' + String(a).padEnd(6) + 'ext=' + b));
  if (ecartsCar.length > 20) console.log('    … et ' + (ecartsCar.length - 20) + ' autres');
}
if (ecartsPts.length) {
  console.log('\n  écarts de points ou d\'effectif :');
  ecartsPts.slice(0, 20).forEach(([n, c, a, b]) =>
    console.log('    · ' + n.padEnd(30) + c.padEnd(8) + '\n        réf=' + a + '\n        ext=' + b));
  if (ecartsPts.length > 20) console.log('    … et ' + (ecartsPts.length - 20) + ' autres');
}

/* ---------------- WEAPONS ---------------- */
const kW = w => cle(w[0]) + '|' + cle(w[1]);
const gW = new Map(); GEN.WEAPONS.forEach(w => gW.set(kW(w), w));
const CH_W = [['genre', 2], ['A', 3], ['CT', 4], ['F', 5], ['PA', 6], ['D', 7], ['portée', 9]];
const cW = {}; CH_W.forEach(([n]) => cW[n] = [0, 0]);
let armesPerdues = [], drapOk = 0, drapKo = 0;
const ecartsW = [], ecartsD = [];
REF.WEAPONS.forEach(r => {
  const g = gW.get(kW(r));
  if (!g) { armesPerdues.push(r); return; }
  CH_W.forEach(([nom, i]) => {
    const a = String(r[i] ?? ''), b = String(g[i] ?? '');
    if (a === b) cW[nom][0]++; else { cW[nom][1]++; ecartsW.push([r[0] + ' — ' + r[1], nom, a, b]); }
  });
  const da = String(r[8] || '').split(' ').filter(Boolean).sort().join(' ');
  const db = String(g[8] || '').split(' ').filter(Boolean).sort().join(' ');
  if (da === db) drapOk++; else { drapKo++; ecartsD.push([r[0] + ' — ' + r[1], da, db]); }
});
/* Une arme « absente » l'est rarement : elle est là sous un autre nom.
   La table nécrone traduit et désambiguïse — « Heat ray — focalisé » là
   où BSData écrit « ➤ Heat ray - focused ». On repêche donc les
   orphelines de chaque côté en les rapprochant sur leurs CHIFFRES, à
   unité égale : même genre, même A, même CT, même F, même PA, même D,
   même portée. Deux profils qui disent exactement la même chose sont le
   même profil, quel que soit son nom. */
const prisG = new Set(REF.WEAPONS.map(kW).filter(k => gW.has(k)));
const chiffres = w => [w[2], w[3], w[4], w[5], w[6], w[7], w[9]].join('/');
const libresG = GEN.WEAPONS.filter(w => !prisG.has(kW(w)));
const renommees = [];
armesPerdues = armesPerdues.filter(r => {
  const i = libresG.findIndex(g => cle(g[0]) === cle(r[0]) && chiffres(g) === chiffres(r));
  if (i < 0) return true;
  renommees.push([r[0], r[1], libresG[i][1]]);
  libresG.splice(i, 1);
  return false;
});

console.log('\n════ LES ARMES ════');
console.log('  référence ' + REF.WEAPONS.length + ' · extraites ' + GEN.WEAPONS.length +
  ' · rapprochées par le nom ' + (REF.WEAPONS.length - armesPerdues.length - renommees.length) +
  ' · retrouvées par leurs chiffres ' + renommees.length +
  ' · introuvables ' + armesPerdues.length);
console.log('');
console.log('  champ      d\'accord   en écart');
CH_W.forEach(([n]) => console.log('   ' + n.padEnd(9) + String(cW[n][0]).padStart(7) +
  String(cW[n][1]).padStart(11)));
console.log('   drapeaux ' + String(drapOk).padStart(7) + String(drapKo).padStart(11));
if (renommees.length) {
  console.log('\n  même profil, autre nom — la référence traduit, l\'extraction' +
    ' garde celui du catalogue (' + renommees.length + ') :');
  renommees.slice(0, 20).forEach(([u, a, b]) =>
    console.log('    · ' + u.slice(0, 28).padEnd(30) + a.slice(0, 30).padEnd(32) + '→ ' + b));
  if (renommees.length > 20) console.log('    … et ' + (renommees.length - 20) + ' autres');
}
if (armesPerdues.length) {
  console.log('\n  armes de la référence VRAIMENT absentes (' + armesPerdues.length + ') :');
  armesPerdues.slice(0, 18).forEach(r => console.log('    · ' + r[0] + ' — ' + r[1]));
  if (armesPerdues.length > 18) console.log('    … et ' + (armesPerdues.length - 18) + ' autres');
}
if (ecartsW.length) {
  console.log('\n  écarts de profil d\'arme :');
  ecartsW.slice(0, 18).forEach(([n, c, a, b]) =>
    console.log('    · ' + n.slice(0, 44).padEnd(46) + c.padEnd(7) + 'réf=' + String(a).padEnd(7) + 'ext=' + b));
  if (ecartsW.length > 18) console.log('    … et ' + (ecartsW.length - 18) + ' autres');
}
if (ecartsD.length) {
  console.log('\n  écarts de drapeaux :');
  ecartsD.slice(0, 18).forEach(([n, a, b]) =>
    console.log('    · ' + n.slice(0, 44).padEnd(46) + '\n        réf=[' + a + ']\n        ext=[' + b + ']'));
  if (ecartsD.length > 18) console.log('    … et ' + (ecartsD.length - 18) + ' autres');
}

/* ---------------- LE RESTE ---------------- */
const gC = index(GEN.CAT, 0);
let catOk = 0, catKo = 0; const ecartsC = [];
REF.CAT.forEach(([n, c]) => {
  const g = gC.get(cle(n)); if (!g) return;
  if (g[1] === c) catOk++; else { catKo++; ecartsC.push([n, c, g[1]]); }
});
console.log('\n════ LES CATÉGORIES ════');
console.log('  d\'accord ' + catOk + ' · en écart ' + catKo);
ecartsC.slice(0, 12).forEach(([n, a, b]) =>
  console.log('    · ' + n.padEnd(32) + 'réf=' + a.padEnd(14) + 'ext=' + b));

const clesA = o => new Set(Object.keys(o).map(cle));
const aRef = clesA(REF.ATTACH), aGen = clesA(GEN.ATTACH);
let attOk = 0; const attManque = [];
Object.keys(REF.ATTACH).forEach(p => {
  const g = GEN.ATTACH[Object.keys(GEN.ATTACH).find(x => cle(x) === cle(p))];
  if (!g) { attManque.push(p); return; }
  const a = REF.ATTACH[p].map(cle).sort().join('|'), b = g.map(cle).sort().join('|');
  if (a === b) attOk++; else attManque.push(p + '  réf=[' + REF.ATTACH[p] + ']  ext=[' + g + ']');
});
console.log('\n════ LES RATTACHEMENTS ════');
console.log('  référence ' + aRef.size + ' · extraits ' + aGen.size + ' · identiques ' + attOk);
attManque.slice(0, 14).forEach(n => console.log('    · ' + n));

const dRef = new Set(REF.DETACHMENTS.map(d => cle(d[0])));
const dGen = new Set(GEN.DETACHMENTS.map(d => cle(d[0])));
const dCom = [...dRef].filter(x => dGen.has(x));
let dpOk = 0, dispoOk = 0, regleOk = 0;
REF.DETACHMENTS.forEach(r => {
  const g = GEN.DETACHMENTS.find(x => cle(x[0]) === cle(r[0])); if (!g) return;
  if (String(r[1]) === String(g[1])) dpOk++;
  if (String(r[8] || '') === String(g[8] || '')) dispoOk++;
  if (g[4]) regleOk++;
});
console.log('\n════ LES DÉTACHEMENTS ════');
console.log('  référence ' + dRef.size + ' · extraits ' + dGen.size + ' · communs ' + dCom.length);
console.log('  PD d\'accord ' + dpOk + ' · Disposition de Force d\'accord ' + dispoOk +
  ' · avec un texte de règle ' + regleOk);
const dPerdus = [...dRef].filter(x => !dGen.has(x));
if (dPerdus.length) console.log('  absents de l\'extraction : ' + dPerdus.join(', '));

let enhOk = 0, enhTxt = 0; const enhManque = [];
REF.ENHANCEMENTS.forEach(r => {
  const g = GEN.ENHANCEMENTS.find(x => cle(x[0]) === cle(r[0]));
  if (!g) { enhManque.push(r[0]); return; }
  if (String(r[1]) === String(g[1])) enhOk++;
  if (g[3]) enhTxt++;
});
console.log('\n════ LES OPTIMISATIONS ════');
console.log('  référence ' + REF.ENHANCEMENTS.length + ' · extraites ' + GEN.ENHANCEMENTS.length +
  ' · rapprochées ' + (REF.ENHANCEMENTS.length - enhManque.length));
console.log('  coût d\'accord ' + enhOk + ' · avec un texte ' + enhTxt);
if (enhManque.length) {
  console.log('  non rapprochées (' + enhManque.length + ') : ' + enhManque.slice(0, 10).join(', ') +
    (enhManque.length > 10 ? '…' : ''));
}

const apRef = Object.keys(REF.APTITUDES).length, apGen = Object.keys(GEN.APTITUDES).length;
let apCom = 0, apLignes = 0;
Object.keys(REF.APTITUDES).forEach(n => {
  const k = Object.keys(GEN.APTITUDES).find(x => cle(x) === cle(n));
  if (k) { apCom++; apLignes += GEN.APTITUDES[k].length; }
});
console.log('\n════ LES APTITUDES ════');
console.log('  unités documentées : référence ' + apRef + ' · extraction ' + apGen +
  ' · communes ' + apCom);
console.log('  (les textes ne se comparent pas : la référence est en français' +
  ' officiel, l\'extraction en anglais du catalogue)');
console.log('  lignes d\'aptitude extraites pour ces unités : ' + apLignes);
