#!/usr/bin/env python3
"""
============================================================
REMETTRE TOUTES LES FACTIONS À JOUR — npm run maj

Le Munitorum change ses points, fait passer des unités en Legends,
renomme des escouades au gré des codex. Ce script refait d'un coup ce
qu'il fallait faire à la main faction par faction :

  1. rafraîchit BSData et le Munitorum sous build/ ;
  2. régénère chaque faction du registre de l'extracteur ;
  3. pour les Nécrons, tenus à la main, ne reprend que les POINTS et le
     drapeau LEGENDS, sans toucher aux profils relus ;
  4. dit, faction par faction, ce qui a bougé.

Il refuse de tourner sans l'export Wahapedia sous build/wahapedia/ :
l'extraction le lit pour les stratagèmes, et une faction régénérée sans
lui les perdrait tous. L'export se récupère à la main (« Export data »
sur wahapedia.ru) — le proxy ne le laisse pas passer.

Après lui : npm run livrees, puis node build.js.
============================================================
"""
import json, os, subprocess, sys, tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RACINE, 'outils'))
import extraction, wahapedia

# Les tables tenues à la main : seuls leurs points et leur drapeau Legends
# suivent le Munitorum. Le nom du Munitorum, quand il diffère du leur.
A_LA_MAIN = {'necrons': {'Szarekh, The Silent King': 'The Silent King'}}

# Ce que compare le bilan : la ligne d'unité, lue par Node comme le fait
# l'application. Points [6,7], profil [1..5], Legends [10].
COMPARE = r'''
const [, , avant, apres] = process.argv;
const lis = p => { let T; global.window = global;
  global.enregistreFaction = o => { T = o.tables };
  delete require.cache[require.resolve(p)]; require(p); return T; };
const A = lis(avant), B = lis(apres);
const b = Object.fromEntries(B.UNITS.map(u => [u[0], u]));
const j = JSON.stringify, r = { points: [], profils: [], legends: [], retirees: [], nouvelles: [] };
A.UNITS.forEach(u => { const v = b[u[0]];
  if (!v) return r.retirees.push(u[0]);
  if (j([u[6], u[7]]) !== j([v[6], v[7]])) r.points.push(u[0]);
  if (j(u.slice(1, 6)) !== j(v.slice(1, 6))) r.profils.push(u[0]);
  if (!!u[10] !== !!v[10]) r.legends.push(u[0] + (v[10] ? ' → Legends' : ' ← Legends'));
});
const a = new Set(A.UNITS.map(u => u[0]));
B.UNITS.forEach(u => { if (!a.has(u[0])) r.nouvelles.push(u[0]); });
console.log(j(r));
'''

def sh(*cmd, cwd=RACINE):
    return subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True).stdout

def sources():
    for nom, url in (('bsdata', 'https://github.com/BSData/wh40k-11e.git'),
                     ('mfm', 'https://github.com/BSData/wh40k-11e-mfm.git')):
        d = os.path.join(RACINE, 'build', nom)
        if os.path.isdir(os.path.join(d, '.git')):
            sh('git', 'pull', '-q', '--ff-only', cwd=d)
        else:
            sh('git', 'clone', '-q', '--depth', '1', url, d)

def compare(avant, apres):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
        f.write(COMPARE)
    try:
        return json.loads(sh('node', f.name, avant, apres))
    finally:
        os.unlink(f.name)

def extrais(faction, sortie):
    sh(sys.executable, os.path.join(RACINE, 'outils', 'extraction.py'), faction, '--sortie', sortie)

def reporteALaMain(faction, frais, noms):
    """Recopie points et drapeau Legends du fichier frais dans la table
       tenue à la main, ligne à ligne, sans réécrire le reste."""
    table = json.loads(sh('node', '-e', '''
      let T; global.window = global; global.enregistreFaction = o => { T = o.tables };
      require(process.argv[1]);
      console.log(JSON.stringify(Object.fromEntries(T.UNITS.map(u => [u[0], [u[6], u[7], u[10]]]))));
    ''', frais))
    chemin = os.path.join(RACINE, 'data-%s.js' % faction)
    L = open(chemin, encoding='utf-8').read().split('\n')
    debut = next(i for i, l in enumerate(L) if l.startswith('const UNITS = ['))
    c = lambda x: json.dumps(x, separators=(',', ':'), ensure_ascii=False)
    for i in range(debut + 1, len(L)):
        l = L[i]
        if l.startswith('];'): break
        if not l.startswith('["'): continue
        u = json.loads(l.rstrip(','))
        v = table.get(noms.get(u[0], u[0]))
        if not v: continue
        u2 = list(u); u2[6], u2[7], u2[10] = v[0], v[1], 1 if v[2] else 0
        if u2 != u:
            L[i] = c(u2) + (',' if l.rstrip().endswith(',') else '')
    open(chemin, 'w', encoding='utf-8').write('\n'.join(L))

def main():
    if not wahapedia.dispo():
        sys.exit("L'export Wahapedia manque sous build/wahapedia/ : sans lui, chaque\n"
                 "faction régénérée perdrait ses stratagèmes. Récupère les CSV sur\n"
                 "https://wahapedia.ru/wh40k11ed/home/ (« Export data »).")
    print('Sources…'); sources()
    print('Export Wahapedia du %s\n' % wahapedia.daté())
    tmp = tempfile.mkdtemp()
    for f in extraction.FACTIONS:
        actuel = os.path.join(RACINE, 'data-%s.js' % f)
        avant = os.path.join(tmp, 'avant-%s.js' % f)
        open(avant, 'w', encoding='utf-8').write(open(actuel, encoding='utf-8').read())
        if f in A_LA_MAIN:
            frais = os.path.join(tmp, 'frais-%s.js' % f)
            extrais(f, frais)
            reporteALaMain(f, frais, A_LA_MAIN[f])
        else:
            extrais(f, actuel)
        r = compare(avant, actuel)
        bouge = {k: v for k, v in r.items() if v}
        nom = extraction.FACTIONS[f]['nom']
        if not bouge:
            print('%-24s inchangée' % nom); continue
        print('%-24s %s' % (nom, ', '.join('%d %s' % (len(v), k) for k, v in bouge.items())))
        for k in ('legends', 'retirees', 'nouvelles'):
            for n in r[k]: print('    %-9s %s' % (k, n))
    print('\nEnsuite : npm run livrees, puis node build.js.')

if __name__ == '__main__':
    main()
