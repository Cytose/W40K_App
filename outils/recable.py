#!/usr/bin/env python3
"""RECÂBLER SANS RÉEXTRAIRE

Reporte outils/cablage/<faction>.json dans data-<faction>.js sans relancer
l'extraction (ni BSData, ni Munitorum, ni Wahapedia). Seules les tables de
câblage pures sont réécrites — aptitudes, auras, octrois, stratagèmes :
KW et ARMEMENT, qui mêlent câblage et extraction, ne bougent pas.

  python3 outils/recable.py custodes tau        une ou plusieurs factions
  python3 outils/recable.py --toutes            toutes celles qui ont un câblage
"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
import extraction as X

TABLES = ['APTIS_UNITE', 'APTIS_COND', 'APTIS_CIBLE', 'AURAS_PERSO',
          'AURAS_ARMEE', 'OCTROIS_DETACH', 'STRAT_SIMU']
VIDE = {'STRAT_SIMU': [], 'AURAS_ARMEE': []}

def noms(chemin):
    """les fiches et les détachements que le fichier livré porte"""
    js = ("const fs=require('fs'),vm=require('vm');let o;"
          "const c=vm.createContext({enregistreFaction:F=>{o={u:F.tables.UNITS.map(x=>x[0]),"
          "d:F.tables.DETACHMENTS.map(x=>x[0])};}});"
          "vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);"
          "process.stdout.write(JSON.stringify(o));")
    o = json.loads(subprocess.run(['node', '-e', js, chemin], capture_output=True,
                                  text=True, check=True).stdout)
    return set(o['u']), set(o['d'])

def recable(faction):
    chemin = os.path.join(X.RACINE, 'data-%s.js' % faction)
    unites, dets = noms(chemin)
    cab = X.chargeCablage(faction, unites, dets)
    src = open(chemin, encoding='utf-8').read()
    neuf = src
    for t in TABLES:
        val = cab.get(t, VIDE.get(t, {}))
        bloc = 'const %s = %s;' % (t, json.dumps(val, ensure_ascii=False, indent=1))
        motif = re.compile(r'^const %s = (?:\{\}|\[\]);$|^const %s = [\[{]\n.*?^[\]}];$' % (t, t),
                           re.S | re.M)
        neuf, k = motif.subn(lambda m: bloc, neuf, count=1)
        if not k: sys.exit('%s introuvable dans %s' % (t, chemin))
    if neuf != src:
        open(chemin, 'w', encoding='utf-8').write(neuf)
    print('%-18s %s' % (faction, 'réécrit' if neuf != src else 'inchangé'))

if __name__ == '__main__':
    args = sys.argv[1:]
    if args == ['--toutes']:
        args = sorted(f[:-5] for f in os.listdir(X.CABLAGE) if f.endswith('.json'))
    if not args: sys.exit(__doc__)
    for f in args: recable(f)
