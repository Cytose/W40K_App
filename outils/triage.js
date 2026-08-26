/* ============================================================
   CE QU'IL Y A À CÂBLER, ET DANS QUEL ORDRE

   Le câblage du simulateur est le seul poste qu'aucune source ne donne :
   il faut lire chaque règle et décider ce qu'elle fait au calcul. Mais
   toutes les règles n'en font pas autant. Sur une faction, la plupart
   déplacent, réaniment, protègent ou marquent un objectif — elles n'ont
   rien à faire dans une séquence d'attaque.

   Ce script lit les textes d'aptitude d'une faction et les range par ce
   qu'ils FONT au calcul, en cherchant les formules que la 11e édition
   emploie de façon stable : « re-roll the Hit roll », « critical hits on
   a 5+ », « add 1 to the Wound roll », « [SUSTAINED HITS 1] ».

   Il ne câble rien. Il dit par où commencer, et combien il en reste —
   pour qu'on attaque les dix règles qui changent un résultat au lieu de
   descendre la liste alphabétique.

   Lancer : node outils/triage.js worldeaters
            node outils/triage.js astra --tout
   ============================================================ */
const fs = require('fs'), vm = require('vm'), path = require('path');
const RACINE = path.dirname(__dirname);

const faction = process.argv[2] || 'worldeaters';
const tout = process.argv.includes('--tout');
const fichier = path.join(RACINE, 'data-' + faction + '.js');
if (!fs.existsSync(fichier)) {
  console.error('inconnue : ' + faction + ' (attendu data-<faction>.js)');
  process.exit(1);
}

const ctx = vm.createContext({ console });
vm.runInContext(
  fs.readFileSync(path.join(RACINE, 'data.js'), 'utf8') + '\n' +
  fs.readFileSync(fichier, 'utf8') +
  '\nglobalThis.__T = FACTIONS[ORDRE_FACTIONS[0]].tables;' +
  '\nglobalThis.__N = FACTIONS[ORDRE_FACTIONS[0]].nom;',
  ctx, { filename: path.basename(fichier) });
const T = ctx.__T;

/* ------------------------------------------------------------------
   LES FORMULES DE LA 11e
   Chaque motif dit un champ du simulateur. L'ordre compte : on garde le
   PREMIER qui touche, et les motifs les plus précis passent devant —
   « critical hit » avant « hit roll », sans quoi tout finirait en
   modificateur de touche.
   ------------------------------------------------------------------ */
const MOTIFS = [
  // les mots-clés d'arme accordés : la 11e les écrit entre crochets
  [/\[SUSTAINED HITS ([^\]]+)\]/i,      'mot', m => 'sust:' + m[1].toUpperCase()],
  [/\[LETHAL HITS\]/i,                  'mot', () => 'lethal'],
  [/\[DEVASTATING WOUNDS\]/i,           'mot', () => 'dev'],
  [/\[TWIN-LINKED\]/i,                  'mot', () => 'twin'],
  [/\[IGNORES COVER\]/i,                'mot', () => 'ignorescover'],
  [/\[LANCE\]/i,                        'mot', () => 'lance'],
  [/\[ASSAULT\]/i,                      'mot', () => 'assault'],
  [/\[HEAVY\]/i,                        'mot', () => 'heavy'],
  [/\[PRECISION\]/i,                    'mot', () => 'precision'],
  [/\[BLAST\]/i,                        'mot', () => 'blast'],
  [/\[TORRENT\]/i,                      'mot', () => 'torrent'],
  [/\[RAPID FIRE ([^\]]+)\]/i,          'mot', m => 'rf:' + m[1].toUpperCase()],
  [/\[MELTA ([^\]]+)\]/i,               'mot', m => 'melta:' + m[1]],

  // les seuils de critique
  [/critical hit[^.]{0,40}?(\d)\+/i,    'critH', m => +m[1]],
  [/(\d)\+[^.]{0,40}?critical hit/i,    'critH', m => +m[1]],
  [/critical wound[^.]{0,40}?(\d)\+/i,  'critW', m => +m[1]],
  [/(\d)\+[^.]{0,40}?critical wound/i,  'critW', m => +m[1]],

  // les relances
  /* « relancez les 1 » et « relancez les ratés » ne valent pas la même
     chose, et un cran d'écart se voit sur le résultat. La distinction
     tient au « of 1 » qui suit le jet : on le cherche donc dans la
     PHRASE, pas dans le tableau de correspondance — la première version
     passait `m` au lieu du texte et rendait « ratés » pour tout, ce qui
     surestimait Khârn et sa relance des 1. */
  [/re-?roll(?:s|ing)?[^.]{0,60}?Hit rolls? of (?:a )?1/i, 'rrH', () => 'ones'],
  [/re-?roll(?:s|ing)?[^.]{0,60}?Wound rolls? of (?:a )?1/i, 'rrW', () => 'ones'],
  [/re-?roll(?:s|ing)?[^.]{0,60}?Hit roll/i,   'rrH', () => 'failed'],
  [/re-?roll(?:s|ing)?[^.]{0,60}?Wound roll/i, 'rrW', () => 'failed'],

  // les modificateurs
  [/(?:add|subtract) (\d) to the Hit roll/i,   'hitMod', m => +m[1]],
  [/(?:add|subtract) (\d) to the Wound roll/i, 'wndMod', m => +m[1]],
  [/improve the Armour Penetration/i,          'apMod', () => 1],
  [/(?:add|improve)[^.]{0,30}Damage characteristic/i, 'dmgMod', () => 1],
  [/(?:add|improve)[^.]{0,30}Strength characteristic/i, 'strMod', () => 1],
  [/(?:add|improve)[^.]{0,30}Attacks characteristic/i, 'atkMod', () => 1],

  // la défense
  [/Feel No Pain (\d)\+/i,              'fnp', m => +m[1]],
  [/invulnerable save of (\d)\+/i,      'inv', m => +m[1]]
];

/* Où la règle s'applique, et à qui. Ce sont les trois choses qu'une
   table de câblage doit dire en plus de l'effet. */
const portee = t => /melee (?:attack|weapon)/i.test(t) ? 'C'
                  : /ranged (?:attack|weapon)/i.test(t) ? 'T' : '';
const aura   = t => /\(Aura\)|within (\d+)"/i.test(t);
const mene   = t => /while this (?:model|unit) is leading/i.test(t);
const degrade = t => /^Damaged:\s*(\d+)-(\d+)\s*Wounds Remaining/i.test(t);
/* Une règle qui pose une condition n'agit jamais d'office : elle se
   déclare à l'écran. C'est ce qui sépare APTIS_UNITE d'APTIS_COND. */
const conditionnelle = t => /\b(if|while|each time this unit|in your|has made a Charge|is within range of an objective)\b/i.test(t);

function classe(nom, texte) {
  const t = texte || '';
  if (degrade(nom)) return { genre: 'ABIMEES', effet: 'seuil de dégradation' };
  for (const [re, champ, val] of MOTIFS) {
    const m = t.match(re);
    if (!m) continue;
    const v = val.length ? val(m) : val(t);
    return { genre: champ === 'mot' ? 'mot' : champ, effet: champ === 'mot' ? v : champ + '=' + v,
             port: portee(t), aura: aura(t), mene: mene(t), cond: conditionnelle(t) };
  }
  return null;
}

/* ------------------------------------------------------------------ */
const trouves = [];
let sansEffet = 0, total = 0;
Object.entries(T.APTITUDES).forEach(([unite, liste]) => {
  liste.forEach(([nom, texte]) => {
    total++;
    const c = classe(nom, texte);
    if (!c) { sansEffet++; return; }
    trouves.push(Object.assign({ unite, nom, texte }, c));
  });
});

/* la table où chaque règle doit atterrir */
const table = r => r.genre === 'ABIMEES' ? 'ABIMEES'
              : r.mene ? 'AURAS_PERSO'
              : r.aura ? 'AURAS_ARMEE'
              : r.cond ? 'APTIS_COND'
              : 'APTIS_UNITE';

const parTable = {};
trouves.forEach(r => (parTable[table(r)] = parTable[table(r)] || []).push(r));

console.log('════ ' + ctx.__N + ' ════');
console.log(total + ' aptitudes lues sur ' + Object.keys(T.APTITUDES).length + ' fiches');
console.log('  ' + trouves.length + ' touchent le calcul, ' + sansEffet + ' non');
console.log('');
console.log('  table            à câbler');
Object.entries(parTable).sort((a, b) => b[1].length - a[1].length)
  .forEach(([k, v]) => console.log('   ' + k.padEnd(16) + String(v.length).padStart(4)));

const parEffet = {};
trouves.forEach(r => parEffet[r.genre] = (parEffet[r.genre] || 0) + 1);
console.log('');
console.log('  effet            combien');
Object.entries(parEffet).sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log('   ' + k.padEnd(16) + String(v).padStart(4)));

console.log('\n════ LA LISTE DE TRAVAIL ════');
console.log('(les profils dégradés sont écartés : ils se génèrent)\n');
const aFaire = trouves.filter(r => r.genre !== 'ABIMEES');
const montre = tout ? aFaire : aFaire.slice(0, 24);
montre.forEach(r => {
  console.log('  ' + table(r).padEnd(13) + (r.unite || '').slice(0, 26).padEnd(28) +
    r.nom.slice(0, 30).padEnd(32) + r.effet + (r.port ? ' [' + r.port + ']' : ''));
});
if (!tout && aFaire.length > montre.length)
  console.log('\n  … et ' + (aFaire.length - montre.length) +
    ' autres — `--tout` pour la liste entière');
