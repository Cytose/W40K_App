#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
LES SOCLES, DEPUIS LE BASE SIZE GUIDE

Ni BSData ni le Munitorum ne portent les socles. Ils vivent dans le
Base Size Guide du Warhammer Event Companion, un PDF publié librement
par Games Workshop — et c'est la seule source qui les chiffre.

Ce script le lit et écrit `outils/socles.json` : une table par faction,
que `extraction.py` reprend pour remplir SOCLES. Le PDF lui-même n'entre
pas dans le dépôt ; c'est le relevé qu'on versionne, comme pour les
cartes.

    python3 outils/socles.py build/base-size*.pdf

Le guide se fournit parfois en plusieurs morceaux — un extrait A→N, puis
la suite. On les lit tous et on fusionne : une faction ne vit que dans un
seul morceau, il n'y a donc rien à arbitrer.

Deux choses que le guide ne dit pas comme l'application les attend, et
qu'il faut savoir avant de lire la sortie :

1. **Il nomme des FIGURINES, l'application nomme des UNITÉS.** « Repentia
   Squad: Repentia Superior » et « Repentia Squad: Sister Repentia » sont
   deux lignes pour une seule unité. On garde les deux, et on ajoute
   l'unité elle-même, au socle le PLUS GRAND de ses figurines : c'est
   celui qui décide de la place qu'elle prend sur la table, et le Plateau
   ne mesure rien d'autre.

2. **Deux entrées ne portent pas de dimension mais un nom de produit
   Citadel** — « Large Flying Base » et « Small Flying Base ». Le guide ne
   les chiffre nulle part. Les valeurs retenues ici sont celles que le
   même guide donne aux modèles volés qu'il chiffre par ailleurs, 120x92
   et 60x35.5. C'est une DÉDUCTION, elle est signalée comme telle dans la
   sortie, et elle reprend celle que la table nécrone portait déjà.
============================================================
"""
import json, os, re, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'outils', 'socles.json')

# Les sections qui découpent une page sans nommer une faction.
SECTIONS = {'UNIT BASE SIZE', 'IMPERIAL ARMOUR', 'DAEMONS', 'LEGENDS'}

# Le vocabulaire du guide, fermé : relevé sur ses 725 lignes de données.
DEDUCTION = {'Large Flying Base': '120x92', 'Small Flying Base': '60x35.5'}


def taille(s):
    """Rend la taille au format de SOCLES, ou None si la ligne n'en porte
       pas. « 32mm » → « 32 » ; « 120x92mm Oval Base » → « 120x92 » ;
       « Hull » → « coque », qui n'a pas de socle à annoncer."""
    s = s.strip()
    # « Hull » et « Unique » disent la même chose : ce modèle n'a pas de
    # socle standard à annoncer, on prend sa coque. Le guide écrit
    # « Unique » pour les quatre aéronefs qui viennent avec le leur.
    if s in ('Hull', 'Unique'): return 'coque', False
    if s in DEDUCTION: return DEDUCTION[s], True
    m = re.fullmatch(r'(\d+(?:\.\d+)?(?:x\d+(?:\.\d+)?)?)mm(?:\s+Oval\s+Base)?', s)
    return (m.group(1), False) if m else (None, False)


def coupe(ligne):
    """Sépare « <nom> <taille> » en ses deux moitiés. On cherche la taille
       par la fin, parce qu'un nom peut contenir des chiffres — le
       Contemptor-Achillus, la Console de Commandement — et qu'un motif
       ancré au début les mangerait."""
    for suffixe in ('mm Oval Base', 'mm', 'Hull', 'Unique',
                    'Large Flying Base', 'Small Flying Base'):
        if not ligne.endswith(suffixe): continue
        reste = ligne[:-len(suffixe)].rstrip()
        if suffixe in ('mm Oval Base', 'mm'):
            m = re.search(r'(\d+(?:\.\d+)?(?:x\d+(?:\.\d+)?)?)$', reste)
            if not m: return None, None
            return reste[:m.start()].strip(), m.group(1) + suffixe
        return reste, suffixe
    return None, None


def lit(chemin):
    try:
        import pdfplumber
    except ImportError:
        sys.exit("pdfplumber manque : pip install pdfplumber")
    if not os.path.exists(chemin):
        sys.exit("PDF introuvable : %s" % chemin)
    with pdfplumber.open(chemin) as pdf:
        return '\n'.join((p.extract_text() or '') for p in pdf.pages)


def analyse(txt):
    # Deux entrées du guide portent un nom trop long pour sa colonne :
    # il déborde sur la ligne suivante, alors que la taille est restée
    # sur la première. On recolle avant d'analyser, sans quoi le nom
    # sortait tronqué sur une virgule et la suite était perdue.
    lignes, attente = [], None
    for l in txt.split('\n'):
        s = l.strip()
        if attente is not None:
            lignes.append(attente[0] + ' ' + s + ' ' + attente[1])
            attente = None
            continue
        nom, t = coupe(s)
        if nom is not None and nom.endswith(','):
            attente = (nom, t)
            continue
        lignes.append(s)

    factions, courante, deductions, illisibles = {}, None, [], []
    for brut in lignes:
        s = brut.strip()
        if not s or s in SECTIONS: continue
        if re.fullmatch(r'\d+', s): continue                     # numéro de page
        if s == s.upper() and re.search(r'[A-Z]{3}', s) and not re.search(r'\d', s):
            courante = s
            factions.setdefault(courante, {})
            continue
        if courante is None: continue
        nom, brut_taille = coupe(s)
        if nom is None:
            illisibles.append((courante, s))
            continue
        t, deduit = taille(brut_taille)
        if t is None:
            illisibles.append((courante, s))
            continue
        factions[courante][nom] = t
        if deduit: deductions.append((courante, nom, brut_taille))
    return factions, deductions, illisibles


def surface(t):
    """De quoi comparer deux socles. Une coque n'a pas de socle : elle ne
       gagne jamais la comparaison."""
    if t == 'coque': return -1
    p = [float(x) for x in t.split('x')]
    return p[0] * (p[1] if len(p) > 1 else p[0])


def ajouteLesUnites(table):
    """« Repentia Squad: Sister Repentia » nomme une figurine. L'unité,
       c'est « Repentia Squad », et son socle est le plus grand des
       siens — c'est lui qui décide de sa place sur la table."""
    parUnite = {}
    for nom, t in table.items():
        if ':' not in nom: continue
        unite = nom.split(':', 1)[0].strip()
        if unite in table: continue           # le guide la nomme déjà
        garde = parUnite.get(unite)
        if garde is None or surface(t) > surface(garde): parUnite[unite] = t
    table.update(parUnite)
    return len(parUnite)


def main():
    chemins = sys.argv[1:] or [os.path.join(RACINE, 'build', 'base-size.pdf')]
    factions, deductions, illisibles = {}, [], []
    for c in chemins:
        f, d, i = analyse(lit(c))
        for nom, table in f.items():
            factions.setdefault(nom, {}).update(table)
        deductions += d; illisibles += i

    ajoutees = 0
    for t in factions.values(): ajoutees += ajouteLesUnites(t)

    total = sum(len(t) for t in factions.values())
    json.dump({k: dict(sorted(v.items())) for k, v in sorted(factions.items())},
              open(SORTIE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(SORTIE, 'a', encoding='utf-8').write('\n')

    print('%s → %s' % (', '.join(os.path.basename(c) for c in chemins),
                       os.path.relpath(SORTIE, RACINE)))
    print('  %d factions, %d entrées (dont %d noms d\'unité ajoutés'
          ' depuis leurs figurines)' % (len(factions), total, ajoutees))
    print('  %d socles déduits d\'un nom de produit Citadel : %s'
          % (len(deductions), ', '.join(sorted({d[2] for d in deductions}))))
    if illisibles:
        print('\n  %d lignes non lues :' % len(illisibles))
        for f, s in illisibles: print('    · [%s] %s' % (f, s))
    print('\n  factions couvertes : ' + ', '.join(sorted(factions)))


if __name__ == '__main__':
    main()
