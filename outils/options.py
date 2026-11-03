#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
LES OPTIONS QUI SE PAIENT — OPTIONS_PTS

Le Munitorum ne donne pas qu'un prix par effectif. Sous certaines
fiches, il ajoute une ligne « Wargear options » : un Shield-Captain
paie 25 points par Praesidium Shield, un Leman Russ 5 points par
multi-melta de flanc. L'extraction ne lisait que les barèmes : ces
lignes-là se perdaient, et la liste affichait 180 pour un
Shield-Captain qui en coûte 205 avec son bouclier.

Ce script relie chaque ligne « wargear » du Munitorum à ce que la
fiche permet de choisir dans ARMEMENT, et pose la table

    OPTIONS_PTS = { "Fiche": [[objet, points, [[emplacement, option, n], …], [arme d'office, …]], … ] }

· une option d'emplacement compte quand l'une de ses armes porte le
  nom de l'objet, ou quand son libellé (onom) le cite — « Assault
  Terminator w/ Thunder Hammer & Storm Shield ». n : combien d'objets
  une figurine qui la prend emporte (le Monolithe en prend quatre).
· une arme d'office qui porte ce nom compte toujours.
· ce que rien ne relie se règle à la main dans A_LA_MAIN, et ce qui
  reste sans lien est signalé à la fin, pour qu'on le sache.

    python3 outils/options.py            # toutes les factions générées
    python3 outils/options.py custodes   # une seule

Il lit le Munitorum sous build/mfm/ (npm run sources) et ne touche, dans
chaque data-<faction>.js, qu'à la table OPTIONS_PTS. L'extraction
l'appelle aussi, pour qu'une faction régénérée garde ses options.
============================================================
"""
import json, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
RACINE = os.path.dirname(ICI)

# Ce que ni les armes ni les libellés ne disent. Le Praesidium Shield du
# Shield-Captain n'est pas une arme : il vient avec la pyrithite et la
# lame Paragon, et part avec la hache ou la lance de garde (Wahapedia,
# Datasheets_options : « Pyrithite Spear and Praesidium Shield can be
# replaced with… »).
A_LA_MAIN = {
    ('custodes', 'Shield-Captain', 'Praesidium Shield'): [[0, 0, 1], [0, 1, 1]],
    # le marteau tonnerre du Deathwatch Terminator vient avec son bouclier
    # (libellé « Thunder Hammer » seul, sergent comme escouade)
    ('deathwatch', 'Deathwatch Terminator Squad', 'Storm Shield'): [[0, 2, 1], [1, 2, 1]],
}

def norme(s):
    """« ➤ Plasma cannon - supercharge », « Pyrithite Spear (tir) » et
       « Plasma Cannons » se ramènent au même nom."""
    s = (s or '').replace('➤', '').replace('’', "'").strip().lower()
    s = re.sub(r'\s*\((tir|càc)\)$', '', s)
    s = re.sub(r'\s+-\s+.*$', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def singulier(s):
    return s[:-1] if s.endswith('s') and not s.endswith('ss') else s

def memeObjet(a, b):
    return singulier(norme(a)) == singulier(norme(b))

def citeDans(objet, libelle):
    """le libellé d'option nomme-t-il l'objet ? mot à mot, pluriel toléré"""
    mots = [singulier(m) for m in re.split(r'[^a-z0-9\'-]+', norme(libelle)) if m]
    om = [singulier(m) for m in norme(objet).split()]
    return any(mots[i:i + len(om)] == om for i in range(len(mots)))

def tablesDuFichier(src):
    """UNITS (noms), WEAPONS (par unité) et ARMEMENT, lus dans le fichier"""
    noms, armes = set(), {}
    m = re.search(r'^const UNITS = \[\n(.*?)^\];', src, re.S | re.M)
    for l in m.group(1).splitlines():
        l = l.strip().rstrip(',')
        if l.startswith('['): noms.add(json.loads(l)[0])
    m = re.search(r'^const WEAPONS = \[\n(.*?)^\];', src, re.S | re.M)
    for l in m.group(1).splitlines():
        l = l.strip().rstrip(',')
        if l.startswith('['):
            w = json.loads(l); armes.setdefault(w[0], []).append(w[1])
    arm = {}
    m = re.search(r'^const ARMEMENT = (\{.*?^\});', src, re.S | re.M)
    if m: arm = json.loads(m.group(1))
    return noms, armes, arm

def relie(faction, unite, objet, armes, row):
    """[[emplacement, option, n]…], [armes d'office…] pour un objet payant"""
    main = A_LA_MAIN.get((faction, unite, objet))
    if main: return main, []
    idx = [i for i, n in enumerate(armes) if memeObjet(n, objet)]
    port = (row or {}).get('n') or {}
    # une fiche absente d'ARMEMENT porte toutes ses armes d'office
    fixes = [i for i in idx if i in row.get('f', [])] if row else idx
    opts, lots = [], set()
    slots = (row or {}).get('s') or []
    for si, sl in enumerate(slots):
        onom = sl.get('onom') or []
        for oi, o in enumerate(sl.get('o') or []):
            vus = [i for i in (o or []) if i in idx]
            if vus:
                # une arme à plusieurs profils (tir et càc, standard et
                # surcharge) ne compte qu'une fois
                opts.append([si, oi, max(port.get(str(i), 1) for i in vus)])
            elif not idx and oi < len(onom) and onom[oi] and citeDans(objet, onom[oi]):
                # l'objet n'est pas une arme : seul le libellé le nomme
                opts.append([si, oi, 1])
                if o: lots.add(tuple(sorted(o)))
    # Le bouclier que le libellé des figurines nomme vient aussi avec la
    # même arme chez le sergent, dont l'option n'a pas de libellé : le
    # marteau tonnerre du sergent Terminator porte son storm shield.
    for si, sl in enumerate(slots):
        for oi, o in enumerate(sl.get('o') or []):
            if o and tuple(sorted(o)) in lots and [si, oi, 1] not in opts:
                opts.append([si, oi, 1])
    # deux profils d'une même arme d'office : un seul objet
    if fixes: fixes = fixes[:1]
    return opts, fixes

def tableFaction(faction, src):
    import extraction as X
    Y = X.chargeMFM(faction)
    noms, armes, arm = tablesDuFichier(src)
    T, orphelins = {}, []
    for u in Y.get('units') or []:
        nom = u.get('name')
        if nom not in noms or not u.get('wargear'): continue
        # un même nom peut revenir (Legends, mot-clé Imperium) : la
        # première fiche qui a des options l'emporte, comme le barème
        if nom in T: continue
        lignes = []
        for w in u['wargear']:
            if w.get('points') is None: continue
            opts, fixes = relie(faction, nom, w['item'], armes.get(nom, []), arm.get(nom))
            if not opts and not fixes:
                orphelins.append('%s · %s · %s (+%s)' % (faction, nom, w['item'], w['points']))
                continue
            lignes.append([w['item'], w['points'], opts, fixes])
        if lignes: T[nom] = lignes
    return T, orphelins

def ecritTable(T):
    if not T: return 'const OPTIONS_PTS = {};'
    L = ['const OPTIONS_PTS = {']
    L.append(',\n'.join(' %s : %s' % (json.dumps(n, ensure_ascii=False),
                                       json.dumps(T[n], ensure_ascii=False)) for n in sorted(T)))
    L.append('};')
    return '\n'.join(L)

ENTETE = ('/* Options payantes du Munitorum (« Wargear options ») : '
          'voir outils/options.py */')

def injecte(faction, chemin=None, bavard=True):
    chemin = chemin or os.path.join(RACINE, 'data-%s.js' % faction)
    src = open(chemin, encoding='utf-8').read()
    T, orphelins = tableFaction(faction, src)
    neuf = ecritTable(T)
    m = re.search(r'^const OPTIONS_PTS = \{.*?^\};|^const OPTIONS_PTS = \{\};', src, re.S | re.M)
    if m:
        src = src[:m.start()] + neuf + src[m.end():]
    else:
        i = src.index('\nenregistreFaction({')
        src = src[:i] + '\n' + ENTETE + '\n' + neuf + '\n' + src[i:]
    if not re.search(r'tables : \{[^}]*OPTIONS_PTS', src):
        src = re.sub(r'(tables : \{\n(?:[^}]*?))(\n  \})', r'\1,\n    OPTIONS_PTS\2', src, count=1)
    open(chemin, 'w', encoding='utf-8').write(src)
    if bavard:
        n = sum(len(v) for v in T.values())
        print('%-18s %3d options payantes sur %2d fiches' % (faction, n, len(T)))
    return orphelins

def main():
    import extraction as X
    a = sys.argv[1:]
    facs = a or [f for f in X.FACTIONS if f != 'necrons']
    orph = []
    for f in facs: orph += injecte(f)
    if orph:
        print('\nSans lien avec un choix de la fiche (non comptées) :')
        for o in orph: print('  ' + o)

if __name__ == '__main__':
    main()
