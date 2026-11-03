#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
REPOSER LES PORTEURS DES OPTIMISATIONS

L'extraction remplit désormais la cible de chaque optimisation — la
liste des fiches qui peuvent la porter — depuis l'export Wahapedia
(voir wahapedia.porteursOptimisations). Relancer toute l'extraction
pour ça referait aussi les fiches, les armes et les points depuis des
sources plus récentes : ce script ne touche qu'à la cinquième colonne
de ENHANCEMENTS, dans chaque data-<faction>.js généré, et laisse le
reste à l'octet près.

    python3 outils/porteurs.py            # toutes les factions
    python3 outils/porteurs.py custodes   # une seule

L'export Wahapedia est attendu dans build/wahapedia/. Le fichier
nécron, tenu à la main, a ses cibles écrites à la main : on n'y touche
pas.
============================================================
"""
import glob, json, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import wahapedia

RACINE = os.path.dirname(ICI)

def ligne(e):
    return '[' + ','.join(json.dumps(x, ensure_ascii=False) for x in e) + ']'

def traite(chemin):
    faction = os.path.basename(chemin)[5:-3]
    src = open(chemin, encoding='utf-8').read()
    mu = re.search(r'\nconst UNITS = \[\n(.*?)\n\];', src, re.S)
    me = re.search(r'\nconst ENHANCEMENTS = \[\n(.*?)\n\];', src, re.S)
    if not mu or not me: return faction, None
    try:
        unites = [json.loads(l.rstrip(','))[0] for l in mu.group(1).split('\n') if l.strip()]
        enh = [json.loads(l.strip().rstrip(',')) for l in me.group(1).split('\n') if l.strip()]
    except ValueError:
        return faction, None          # écrit à la main : on n'y touche pas
    porteurs = wahapedia.porteursOptimisations(faction)
    posees = 0
    for e in enh:
        e[4] = wahapedia.cibleOptimisation(porteurs, e[2], e[0], unites)
        if e[4]: posees += 1
    bloc = ',\n'.join('  ' + ligne(e) for e in enh)
    src = src[:me.start(1)] + bloc + src[me.end(1):]
    open(chemin, 'w', encoding='utf-8').write(src)
    return faction, (posees, len(enh))

if __name__ == '__main__':
    if not wahapedia.dispo():
        sys.exit("L'export Wahapedia manque dans build/wahapedia/.")
    voulues = sys.argv[1:]
    for f in sorted(glob.glob(os.path.join(RACINE, 'data-*.js'))):
        if voulues and os.path.basename(f)[5:-3] not in voulues: continue
        faction, r = traite(f)
        if r is None: print('%-18s laissé tel quel' % faction)
        else: print('%-18s %d/%d optimisations avec leurs porteurs' % (faction, r[0], r[1]))
