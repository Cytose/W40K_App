/* ============================================================
   CONFRONTER LE CATALOGUE DE L'APP AU CATALOGUE OFFICIEL

   Les profils de data.js ont ete saisis a la main depuis les fiches
   d'unite. Une saisie manuelle derape sans prevenir : Szarekh a porte
   trente-six attaques de corps a corps au lieu de douze pendant des
   semaines, parce qu'un facteur trois s'etait glisse partout.

   Ce script confronte data.js au depot BSData/wh40k-11e, qui transcrit
   les memes fiches en JSON. Il ne corrige rien : il dit ou les deux
   catalogues divergent, a charge du lecteur de trancher.

   USAGE
     git clone --depth 1 https://github.com/BSData/wh40k-11e.git ../wh40k-11e
     npm run catalogue

   Le chemin du catalogue peut etre passe en argument.
   Sortie 0 si aucun ecart, 1 sinon.
   ============================================================ */
const fs = require('fs'), path = require('path'), vm = require('vm');

const RACINE = path.join(__dirname, '..');
const SRC = process.argv[2] ||
  path.join(RACINE, '..', 'wh40k-11e', 'Necrons.json');

if(!fs.existsSync(SRC)){
  console.error('Catalogue officiel introuvable : ' + SRC + '\n\n' +
    'Recupere-le puis relance :\n' +
    '  git clone --depth 1 https://github.com/BSData/wh40k-11e.git ' +
    path.join(RACINE, '..', 'wh40k-11e') + '\n');
  process.exit(2);
}

/* ------------------------------------------------------------------
   Le catalogue de l'application. `const` ne s'accroche pas au global :
   on ajoute une queue qui expose ce dont on a besoin.
   ------------------------------------------------------------------ */
/* Les tables necrones ont quitte data.js pour data-necrons.js, qui les
   remet au registre : on evalue les deux, comme la page le fait. */
vm.runInThisContext(fs.readFileSync(path.join(RACINE, 'data.js'), 'utf8') + '\n' +
  fs.readFileSync(path.join(RACINE, 'data-necrons.js'), 'utf8') +
  '\n;globalThis.__cat = {UNITS, WEAPONS, ARMEMENT};');
const APP = globalThis.__cat;

const cat = JSON.parse(fs.readFileSync(SRC, 'utf8')).catalogue;
const CHAMP_PTS = '51b2-306e-1021-d207';

/* ------------------------------------------------------- index par id */
const PAR_ID = new Map();
(function indexer(o){
  if(Array.isArray(o)) return o.forEach(indexer);
  if(!o || typeof o !== 'object') return;
  if(typeof o.id === 'string' && !PAR_ID.has(o.id)) PAR_ID.set(o.id, o);
  for(const k in o) indexer(o[k]);
})(cat);

/* ------------------------------------------------------------ lectures */
const carac = p => {
  const o = {};
  (p.characteristics || []).forEach(c => { o[c.name] = c.$text || ''; });
  return o;
};
const cout = e => {
  const c = (e.costs || []).find(x => x.name === 'pts');
  return c ? c.value : null;
};
function bornes(o){
  let mn = null, mx = null;
  (o.constraints || []).forEach(c => {
    if(c.field !== 'selections') return;
    if(c.type === 'min') mn = c.value;
    if(c.type === 'max') mx = c.value;
  });
  return [mn, mx];
}
/* Les figurines vivent tantot dans un groupe, tantot directement sous la
   fiche, et les groupes s'emboitent. On garde toute la chaine, car les
   bornes d'effectif peuvent etre a n'importe quel etage. */
function chaines(e, ancetres, prof){
  ancetres = ancetres || []; prof = prof || 0;
  let out = [];
  if(prof > 5) return out;
  const mods = (e.selectionEntries || []).filter(x => x.type === 'model');
  if(mods.length) out.push([ancetres, mods]);
  (e.selectionEntryGroups || []).forEach(g => {
    out = out.concat(chaines(g, [g].concat(ancetres), prof + 1));
  });
  return out;
}
/* Plusieurs types de figurines en nombre fixe : Szarekh et ses deux
   menhirs. Les armes y sont portees par un type de figurine et comptent
   d'autant. Une unite homogene, elle, garde des armes par figurine. */
function compositionMixte(e){
  const mods = [].concat(...chaines(e).map(c => c[1]));
  const fixes = new Map();
  for(const x of mods){
    const [mn, mx] = bornes(x);
    if(mn === null || mx === null || mn !== mx) return null;
    fixes.set(x, mn);
  }
  return fixes.size > 1 ? fixes : null;
}
function tailles(e){
  const mixte = compositionMixte(e);
  if(mixte) return [[...mixte.values()].reduce((a, b) => a + b, 0)];
  for(const [groupes, mods] of chaines(e)){
    const sources = groupes.concat([{constraints:
      [].concat(...mods.map(x => x.constraints || []))}]);
    for(const src of sources){
      const [mn, mx] = bornes(src);
      if(mn && mx && mn !== mx) return suite(mn, mx);
      if(mn && mx && mn === mx) return [mn];
    }
    let mn = null, mx = null;
    mods.forEach(x => {
      const [a, b] = bornes(x);
      if(a !== null) mn = mn === null ? a : Math.min(mn, a);
      if(b !== null) mx = mx === null ? b : Math.max(mx, b);
    });
    if(mn && mx && mn !== mx) return suite(mn, mx);
    if(mn) return [mn];
    if(mx) return [mx];
  }
  return [1];
}
const suite = (a, b) => Array.from({length: b - a + 1}, (_, i) => a + i);

/* ---------------------------------------------------------------- prix */
function seuilEffectif(m){
  for(const c of m.conditions || []){
    if(c.field !== 'selections') continue;
    if(c.childId !== 'model' && c.childId != null) continue;
    if(c.type === 'atLeast') return c.value == null ? 1 : c.value;
    if(c.type === 'greaterThan') return (c.value || 0) + 1;
  }
  return null;
}
function prixFigurine(e){
  for(const [, mods] of chaines(e)) for(const x of mods){
    const c = cout(x); if(c) return c;
  }
  return 0;
}
function prix(e, n){
  let v = cout(e) || 0;
  if(!v){ const pf = prixFigurine(e); if(pf) return pf * n; }
  for(const m of e.modifiers || []){
    if(m.field !== CHAMP_PTS) continue;
    const s = seuilEffectif(m);
    if(s === null || n < s) continue;
    if(m.type === 'set') v = m.value;
    else if(m.type === 'increment') v += m.value;
  }
  return v;
}

/* -------------------------------------------- parcours avec resolution */
const PROFILS = ['Unit', 'Ranged Weapons', 'Melee Weapons', "C'tan Powers"];
/* Un exemplaire, ou plusieurs : le Monolithe a quatre arcs de flux. */
function combien(e){
  const [mn, mx] = bornes(e);
  if(mn && mx && mn === mx) return mn;
  return mx || mn || 1;
}
function parcourir(n, vus, out, prof, mult, mixte){
  if(prof > 12 || !n || typeof n !== 'object') return;
  if(Array.isArray(n)) return n.forEach(v => parcourir(v, vus, out, prof, mult, mixte));
  const k = combien(n) * mult;
  (n.profiles || []).forEach(p => {
    if(PROFILS.includes(p.typeName)) out.push([p.typeName, p.name || '', carac(p), k]);
  });
  ['selectionEntries', 'selectionEntryGroups'].forEach(cle => {
    (n[cle] || []).forEach(v => {
      const m = (mixte && mixte.has(v)) ? mult * mixte.get(v) : mult;
      parcourir(v, vus, out, prof + 1, m, mixte);
    });
  });
  (n.entryLinks || []).concat(n.infoLinks || []).forEach(l => {
    const c = l.targetId;
    if(!c || vus.has(c)) return;
    const e = PAR_ID.get(c);
    if(!e) return;
    vus.add(c);
    parcourir(e, vus, out, prof + 1, mult, mixte);
  });
}
function fiche(e){
  const out = [];
  parcourir(e, new Set(), out, 0, 1, compositionMixte(e));
  let stats = null;
  const armes = [], vus = new Set();
  for(const [t, nom, c, n] of out){
    if(t === 'Unit'){ if(!stats) stats = c; continue; }
    const cle = [nom, c.A, c.S, c.D, c.Range].join('|');
    if(vus.has(cle)) continue;
    vus.add(cle);
    armes.push({nom, genre: t === 'Melee Weapons' ? 'C' : 'T',
      portee: c.Range || '', A: c.A || '', CT: c.BS || c.WS || '',
      F: c.S || '', PA: c.AP || '', D: c.D || '', mots: c.Keywords || '', n});
  }
  return {stats, armes};
}

/* ------------------------------------------------------------ reference */
const REF = {};
for(const e of cat.sharedSelectionEntries){
  if(e.type !== 'unit' && e.type !== 'model') continue;
  const {stats, armes} = fiche(e);
  if(!stats) continue;
  const t = tailles(e);
  REF[e.name] = {stats, tailles: t, armes,
    points: Object.fromEntries(t.map(n => [n, prix(e, n)]))};
}

/* =====================================================================
   CONFRONTATION

   Les deux catalogues ne parlent pas la meme langue : la PA est positive
   d'un cote et negative de l'autre, les profils alternatifs d'une meme
   arme sont prefixes ici et suffixes la, et certains noms sont traduits.
   On normalise avant de comparer, sinon le rapport se noie dans des
   ecarts qui n'en sont pas.
   ===================================================================== */
const ALIAS_UNITE = {'The Silent King': 'Szarekh, The Silent King'};
/* Ecarts voulus : l'application dit quelque chose que le catalogue ne peut
   pas dire, et on prefere ce qu'elle dit. Ils sont listes a part plutot que
   masques -- un ecart qu'on ne voit plus est un ecart qu'on ne revoit
   jamais -- mais ils ne font pas echouer le controle. */
const ASSUMES = {
  'Lychguard|stat|Invu':
    "l'invulnerable 4+ ne vaut qu'avec le bouclier de dispersion ; le " +
    'catalogue ne sait pas conditionner une sauvegarde, l\'application si.',
};
const ALIAS_ARME = {
  'scythe of the nightbringer': 'scythe',
  'spear of the void dragon': 'spear',
  'tesla spheres': 'tesla sphere',
  'cosmic fire': "cosmic fire (c'tan)",
  "time's arrow": "time's arrow (c'tan)",
  'antimatter meteor': "antimatter meteor (c'tan)",
  'tremorglaive': 'sismolance',          /* nom traduit dans l'application */
};
function baseArme(n){
  n = String(n).replace(/^\s*➤\s*/, '')
       .replace(/\s*\((tir|càc|melee|menhir)\)\s*$/i, '')
       .split(/\s+[—-]\s+/)[0]
       .replace(/\s*×\s*\d+\s*$/, '')
       .trim().toLowerCase();
  n = ALIAS_ARME[n] || n;
  return n.replace(/\s*\(c'tan\)$/, '');
}
/* Les mots-cles : le catalogue les ecrit en toutes lettres, l'application
   en abrege. C'est le champ que la premiere passe ne comparait pas -- et
   c'est exactement la qu'un « Tir Rapide 5 » multiplie par deux porteurs
   s'etait cache en « rf:10 ». */
const MOTS = [
  [/^Lethal Hits$/i,            () => 'lethal'],
  [/^Devastating Wounds$/i,     () => 'dev'],
  [/^Twin-linked$/i,            () => 'twin'],
  [/^Blast$/i,                  () => 'blast'],
  [/^Torrent$/i,                () => 'torrent'],
  [/^Ignores Cover$/i,          () => 'ignorescover'],
  [/^Indirect Fire$/i,          () => 'indirect'],
  [/^Precision$/i,              () => 'precision'],
  [/^Pistol$/i,                 () => 'pistol'],
  [/^Heavy$/i,                  () => 'heavy'],
  [/^Hazardous$/i,              () => null],          /* sans effet sur le jet */
  [/^One Shot$/i,               () => 'oneshot'],
  [/^Extra Attacks$/i,          () => 'extra'],
  [/^Assault$/i,                () => 'assault'],
  [/^Rapid Fire (\S+)$/i,       m => 'rf:' + m[1]],
  [/^Sustained Hits (\S+)$/i,   m => 'sust:' + m[1]],
  [/^Melta (\S+)$/i,            m => 'melta:' + m[1]],
  [/^Anti-(\S+) (\d)\+$/i,     m => 'anti:' + m[2] + ':' + m[1].toLowerCase()],
];
/* les mots du catalogue, traduits dans le vocabulaire de l'application */
function motsRef(txt){
  const out = [];
  String(txt || '').split(',').map(x => x.trim())
    .filter(x => x && x !== '-' && x !== '—').forEach(m => {
    const r = MOTS.find(([re]) => re.test(m));
    if(!r){ out.push('?' + m); return; }
    const v = r[1](r[0].exec(m));
    if(v) out.push(v);
  });
  return out;
}
/* Anti-X et les mots-cles cibles nomment un mot-cle d'unite que
   l'application abrege a sa facon : on ne compare que le seuil. */
const cleMot = m => m.replace(/^(anti:\d+):.*$/, '$1');

const nb = (x, d) => {
  const m = /^-?\d+/.exec(String(x == null ? '' : x).trim());
  return m ? parseInt(m[0], 10) : d;
};
const pa = x => Math.abs(nb(x, 0));
const portee = x => {
  const s = String(x || '').trim().toLowerCase();
  if(!s || s === 'melee' || s === 'càc') return 'càc';
  return s.replace(/[^0-9]/g, '') || 'càc';
};
/* '3D6+1' -> [3,6,1] ; '12' -> [0,0,12]. Permet de multiplier une
   caracteristique d'attaques par un nombre de porteurs. */
function des(x){
  const s = String(x == null ? '' : x).trim().toUpperCase().replace(/\s/g, '');
  let m = /^(\d*)D(\d+)([+-]\d+)?$/.exec(s);
  if(m) return [parseInt(m[1] || '1', 10), parseInt(m[2], 10), parseInt(m[3] || '0', 10)];
  m = /^(\d+)$/.exec(s);
  return m ? [0, 0, parseInt(m[1], 10)] : null;
}
const fois = (d, k) => d && [d[0] * k, d[1], d[2] * k];
const dit = d => !d ? '?' : (!d[0] ? String(d[2])
  : (d[0] > 1 ? d[0] : '') + 'D' + d[1] + (d[2] ? '+' + d[2] : ''));

const armesApp = {}, unitsApp = {};
APP.WEAPONS.forEach(w => { (armesApp[w[0]] = armesApp[w[0]] || []).push(w); });
APP.UNITS.forEach(u => { unitsApp[u[0]] = u; });

const ecarts = new Map(), assumes = [], absApp = [], absRef = [];
const note = (u, g, t) => {
  const cle = u + '|' + g + '|' + String(t).split(' ')[0];
  if(ASSUMES[cle]){ assumes.push([u, t, ASSUMES[cle]]); return; }
  if(!ecarts.has(u)) ecarts.set(u, []);
  ecarts.get(u).push([g, t]);
};

const STATS = [['M', 1], ['T', 2], ['Sv', 3], ['W', 5], ['OC', 12]];

for(const nom of Object.keys(REF).sort()){
  const r = REF[nom], nomApp = ALIAS_UNITE[nom] || nom, u = unitsApp[nomApp];
  if(!u){ absApp.push(nom); continue; }

  for(const [cle, idx] of STATS){
    const attendu = nb(r.stats[cle]);
    if(attendu == null) continue;
    if(cle === 'M' && u[idx] === 0) continue;      /* M — : immobile */
    if(nb(u[idx]) !== attendu)
      note(nomApp, 'stat', cle + ' : app ' + u[idx] + ' / catalogue ' + attendu);
  }
  const cd = String(r.stats.LD || '').trim();
  if(cd && String(u[13]).trim() !== cd)
    note(nomApp, 'stat', 'Cd : app ' + u[13] + ' / catalogue ' + cd);
  const inv = nb(r.stats.InSv, 0) || 0;
  if(inv !== (u[4] || 0))
    note(nomApp, 'stat', 'Invu : app ' + (u[4] || '—') + ' / catalogue ' + (inv || '—'));

  /* points et effectifs : le premier palier de rang seulement, le surcout
     par copie se lit ailleurs */
  const paliers = Array.isArray(u[7]) ? u[7] : [[1, u[7]]];
  const bareme = paliers[0][1];
  u[6].forEach(t => {
    if(r.points[t] != null && r.points[t] !== bareme[String(t)])
      note(nomApp, 'points', t + ' fig. : app ' + bareme[String(t)] +
           ' / catalogue ' + r.points[t]);
  });
  const lo = r.tailles[0], hi = r.tailles[r.tailles.length - 1];
  if(u[6].length && (Math.min(...u[6]) !== lo || Math.max(...u[6]) !== hi))
    note(nomApp, 'effectif', 'app [' + u[6] + '] / catalogue ' + lo + '-' + hi);

  /* armement */
  const parBase = {};
  (armesApp[nomApp] || []).forEach(w => {
    const b = baseArme(w[1]);
    (parBase[b] = parBase[b] || []).push(w);
  });
  const arm = APP.ARMEMENT[nomApp] || {};

  r.armes.forEach(a => {
    const b = baseArme(a.nom), cands = parBase[b];
    if(!cands){ note(nomApp, 'arme absente', a.nom); return; }
    /* Une meme arme peut avoir un profil de tir et un de corps a corps :
       on apparie d'abord par genre, sinon la lance abyssale du
       Psychomancien se compare a elle-meme dans la mauvaise phase. */
    const memeGenre = cands.filter(x => (x[2] === 'T') === (a.genre === 'T'));
    const pool = memeGenre.length ? memeGenre : cands;
    const score = w => (nb(w[3], 0) === nb(a.A, 0)) + (w[5] === nb(a.F, 0)) +
                       (pa(w[6]) === pa(a.PA)) + (String(w[7]) === String(a.D).trim());
    const w = pool.reduce((m, x) => score(x) > score(m) ? x : m, pool[0]);

    /* attaques : on compare des totaux, porteurs compris. L'application
       exprime le nombre de porteurs soit dans le nom (« ×4 », attaques
       deja multipliees), soit dans ARMEMENT.n ; le catalogue le donne a
       part. C'est ce controle qui attrape un facteur glisse partout. */
    let nApp = 1;
    if(arm.n) nApp = arm.n[(armesApp[nomApp] || []).indexOf(w)] || 1;
    const totApp = fois(des(w[3]), nApp), totRef = fois(des(a.A), a.n);
    if(totApp && totRef && dit(totApp) !== dit(totRef))
      note(nomApp, 'attaques', a.nom + ' : app ' + dit(totApp) + ' / catalogue ' +
           dit(totRef) + ' (' + a.A + ' × ' + a.n + ' porteur' + (a.n > 1 ? 's' : '') + ')');

    const ctRef = nb(a.CT);
    [['CT/CC', String(w[4]), ctRef == null ? String(w[4]) : String(ctRef)],
     ['F', String(w[5]), String(nb(a.F, ''))],
     ['PA', String(pa(w[6])), String(pa(a.PA))],
     ['D', String(w[7]), String(a.D).trim()],
     ['portée', portee(w[9]), portee(a.portee)]
    ].forEach(([lib, got, exp]) => {
      if(got.toLowerCase() !== exp.toLowerCase())
        note(nomApp, 'arme', a.nom + ' · ' + lib + ' : app ' + got + ' / catalogue ' + exp);
    });
    if((w[2] === 'T') !== (a.genre === 'T'))
      note(nomApp, 'arme', a.nom + ' : type app ' + w[2] + ' / catalogue ' + a.genre);

    /* mots-cles. Un mot numerique -- Tir Rapide, Coups Prolonges, Fusion --
       porte le meme piege que les attaques : il vaut par arme, et le
       multiplier par le nombre de porteurs est une erreur silencieuse. */
    const motsApp = String(w[8] || '').split(/\s+/).filter(Boolean);
    const attendus = motsRef(a.mots);
    const inconnus = attendus.filter(m => m[0] === '?');
    attendus.filter(m => m[0] !== '?').forEach(m => {
      if(motsApp.some(x => cleMot(x) === cleMot(m))) return;
      const proche = motsApp.find(x => x.split(':')[0] === m.split(':')[0]);
      note(nomApp, 'mot-clé', a.nom + ' : ' + (proche
        ? 'app ' + proche + ' / catalogue ' + m
        : 'catalogue dit « ' + m +' », absent de l\'application'));
    });
    if(inconnus.length)
      note(nomApp, 'mot-clé', a.nom + ' : non traduit — ' + inconnus.join(', ').replace(/\?/g, ''));
  });

  const basesRef = new Set(r.armes.map(a => baseArme(a.nom)));
  Object.keys(parBase).forEach(b => {
    if(!basesRef.has(b)) note(nomApp, 'arme en trop', parBase[b][0][1]);
  });
}
const connues = new Set(Object.keys(REF).concat(Object.values(ALIAS_UNITE)));
Object.keys(unitsApp).forEach(n => { if(!connues.has(n)) absRef.push(n); });

/* ---------------------------------------------------------- rapport */
let tot = 0;
ecarts.forEach(v => { tot += v.length; });
const confrontees = Object.keys(REF)
  .filter(n => unitsApp[ALIAS_UNITE[n] || n]).length;
console.log('=== ' + confrontees + ' unites confrontees, ' + tot +
            ' ecart' + (tot > 1 ? 's' : '') + ' sur ' + ecarts.size + ' unite' +
            (ecarts.size > 1 ? 's' : '') + ' ===\n');
ecarts.forEach((lst, nom) => {
  console.log('## ' + nom);
  lst.forEach(([g, t]) => console.log('   [' + g + '] ' + t));
  console.log('');
});
if(assumes.length){
  console.log('--- ecarts assumes (' + assumes.length + ') ---');
  assumes.forEach(([u, t, r]) => console.log('    ' + u + ' · ' + t + '\n      ' + r));
  console.log('');
}
console.log('--- au catalogue officiel, absentes de l\'application (' +
            absApp.length + ') ---');
absApp.forEach(n => console.log('    ' + n));
if(absRef.length){
  console.log('\n--- dans l\'application, absentes du catalogue officiel (' +
              absRef.length + ') ---');
  absRef.forEach(n => console.log('    ' + n));
}
process.exit(tot ? 1 : 0);
