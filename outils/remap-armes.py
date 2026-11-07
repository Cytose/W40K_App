#!/usr/bin/env python3
"""LES CHOIX D'ARMES À TRAVERS UNE MISE À JOUR

Une liste enregistre ses choix d'armes par position : l'emplacement s,
l'option o. Quand une mise à jour renomme ou ajoute une arme (« Plasma
pistol - standard » devient « Plasma pistol (Standard) »), l'ordre des
armes et des options bouge, et ces positions désignent autre chose —
ou plus rien.

Ce script compare l'ARMEMENT d'avant (un commit git) et celui d'après
(les data-*.js du répertoire), reconnaît chaque option à la liste de
ses armes, noms rapprochés (casse, tirets, parenthèses), et écrit
remap-armes.js : pour chaque fiche dont des positions ont bougé,
« s:o ancien » → « s:o nouveau ». roster.js l'applique une fois aux
listes enregistrées avant la mise à jour.

  python3 outils/remap-armes.py <commit d'avant> <date de la maj, ms>
"""
import json, os, re, subprocess, sys
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LIS = """
let T; global.window = global; global.enregistreFaction = o => { T = o.tables };
require(process.argv[1]);
console.log(JSON.stringify({a: T.ARMEMENT, w: T.WEAPONS}));
"""
def tables(src):
    """ARMEMENT et WEAPONS, lus par Node comme les lit l'application"""
    import tempfile
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as t:
        t.write(src)
    try:
        o = json.loads(subprocess.run(['node', '-e', LIS, t.name], capture_output=True,
                                      text=True, check=True).stdout)
    finally:
        os.unlink(t.name)
    return o['a'], o['w']

def norm(n):
    n = n.lower().replace('➤', '')
    n = re.sub(r'[\s\-–()\[\],.]+', ' ', n)
    return n.strip()

VIDES = {'astartes', 'w', 'with', 'and', 'the', 'of'}
def mots(n):
    return {m for m in norm(n).split() if m not in VIDES}

def options(arm, weps, nom):
    """{emplacement: [(position, signature exacte, mots)]}"""
    a = arm.get(nom)
    if not a: return {}
    noms = [w[1] for w in weps if w[0] == nom]
    out = {}
    for si, sl in enumerate(a['s']):
        onom = sl.get('onom') or []
        for oi, o in enumerate(sl['o']):
            ws = [noms[i] for i in o if i < len(noms)]
            on = onom[oi] if oi < len(onom) else ''
            sig = tuple(sorted(norm(w) for w in ws)) + (('§' + norm(on),) if on else ())
            m = set().union(*[mots(w) for w in ws]) if ws else set()
            m |= mots(on)
            out.setdefault(si, []).append((oi, sig, m))
    return out

def apparie(vieux, neufs):
    """Chaque ancienne option vers la nouvelle qui lui ressemble le plus.
       Égalité exacte d'abord, puis les mots en commun (Jaccard) : « Plasma
       pistol - standard » et « Plasma pistol (Standard) » ont les mêmes
       mots, « Dreadnought Combat Weapon » et « Dreadnought Fist » en
       partagent un. Une nouvelle option ne sert qu'une fois."""
    paires, pris = {}, set()
    for o0, sg0, _ in vieux:
        for o1, sg1, _ in neufs:
            if sg0 == sg1 and o1 not in pris and o0 not in paires:
                paires[o0] = o1; pris.add(o1)
    cands = []
    for o0, _, m0 in vieux:
        if o0 in paires: continue
        for o1, _, m1 in neufs:
            if o1 in pris or not (m0 | m1): continue
            j = len(m0 & m1) / len(m0 | m1)
            if j >= 0.34: cands.append((-j, o0, o1))
    for _, o0, o1 in sorted(cands):
        if o0 in paires or o1 in pris: continue
        paires[o0] = o1; pris.add(o1)
    return paires

def main():
    avant, quand = sys.argv[1], int(sys.argv[2])
    remap, perdus = {}, []
    for f in sorted(os.listdir(RACINE)):
        if not re.match(r'data-.*\.js$', f): continue
        neuf = open(os.path.join(RACINE, f), encoding='utf-8').read()
        try: vieux = subprocess.run(['git', 'show', '%s:%s' % (avant, f)], cwd=RACINE,
                                    capture_output=True, text=True, check=True).stdout
        except subprocess.CalledProcessError: continue
        cle = re.search(r'cle\s*:\s*"([^"]+)"', neuf).group(1)
        if vieux == neuf: continue
        try:
            A0, W0 = tables(vieux)
            A1, W1 = tables(neuf)
        except subprocess.CalledProcessError:
            print('   table illisible, ignorée :', f); continue
        if A0 == A1 and W0 == W1: continue
        for nom in A0:
            o0, o1 = options(A0, W0, nom), options(A1, W1, nom)
            if not o0: continue
            m = {}
            # un emplacement peut disparaître et décaler les suivants (la
            # Vanguard Veteran Squad a perdu sa « Vanguard Veteran Weapon ») :
            # chaque ancien emplacement va au nouveau qui lui ressemble le plus,
            # à égalité celui de même rang
            slots, prises = {}, set()
            essais = sorted(((-len(apparie(v, n)), si != sj, si, sj)
                             for si, v in o0.items() for sj, n in o1.items()))
            for score, _, si, sj in essais:
                if score == 0 or si in slots or sj in prises: continue
                slots[si] = sj; prises.add(sj)
            for si, vieux in o0.items():
                sj = slots.get(si, si)
                paires = apparie(vieux, o1.get(sj, []))
                for o, sig, _ in vieux:
                    k = '%d:%d' % (si, o)
                    if o not in paires:
                        perdus.append('%s · %s · %s' % (cle, nom, ' + '.join(sig) or '(vide)'))
                        m[k] = None
                    elif (sj, paires[o]) != (si, o):
                        m[k] = '%d:%d' % (sj, paires[o])
            if m: remap.setdefault(cle, {})[nom] = m
    with open(os.path.join(RACINE, 'remap-armes.js'), 'w', encoding='utf-8') as out:
        out.write('/* FICHIER GÉNÉRÉ par outils/remap-armes.py — ne pas corriger ici.\n'
                  '   Les positions de choix d\'armes qui ont bougé à la mise à jour du\n'
                  '   %s ; null = option disparue. roster.js l\'applique une fois aux\n'
                  '   listes enregistrées avant cette date. */\n' % avant)
        out.write('const REMAP_ARMES = %s;\n' % json.dumps({'avant': quand, 'table': remap},
                                                       ensure_ascii=False, indent=1))
    n = sum(len(v) for v in remap.values())
    print('%d fiches à réaligner, %d options sans équivalent' % (n, len(perdus)))
    for p in perdus: print('   ·', p)

main()
