#!/usr/bin/env python3
"""LES SIX GENRES DE KW (ET LES GRENADES), D'APRÈS LES MOTS-CLÉS DE LA FICHE

extraction.py remplit vehicle, monster, battleline, epic, infantry et
character depuis la CATÉGORIE de l'unité, qui est unique : une escouade
de LIGNE n'était donc jamais INFANTERIE, un HÉROS ÉPIQUE jamais
PERSONNAGE. Une aura « unités d'INFANTERIE à 6" » passait alors à côté
des Strike Squads, une règle de PERSONNAGE à côté de Dante — sans rien
dire.

Ce script AJOUTE à chaque genre les fiches qui en portent le mot-clé dans
l'export Wahapedia (build/wahapedia/, dézippé depuis
/mnt/project-files/wahapedia/). Il ne retire rien.

  python3 outils/genres.py            toutes les factions livrées
"""
import csv, glob, json, os, re, sys
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOTS = {'vehicle': 'vehicle', 'monster': 'monster', 'battleline': 'battleline',
        'epic': 'epic hero', 'infantry': 'infantry', 'character': 'character'}
# Les mots-clés d'équipement que les stratagèmes de base demandent :
# EXPLOSIFS vise une unité GRENADES ou EXPLOSIVES. extraction.py ne les
# connaît pas ; on CRÉE donc le groupe quand une fiche de la faction le porte.
CREES = {'grenades': 'grenades', 'explosives': 'explosives'}

def motsWahapedia():
    def un(nom):
        c = glob.glob(os.path.join(RACINE, 'build', 'wahapedia', '**', nom), recursive=True)
        if not c: sys.exit("export Wahapedia introuvable dans build/wahapedia/ : " + nom)
        return csv.DictReader(open(c[0], encoding='utf-8-sig'), delimiter='|')
    noms = {r['id']: r['name'] for r in un('Datasheets.csv')}
    mots = {}
    for r in un('Datasheets_keywords.csv'):
        n = noms.get(r['datasheet_id'])
        if n: mots.setdefault(n, set()).add(r['keyword'].strip().lower())
    return mots

def traite(chemin, mots):
    src = open(chemin, encoding='utf-8').read()
    m = re.search(r'^const KW = (\{\n.*?^\});$', src, re.S | re.M)
    if not m: return 0
    try: kw = json.loads(m.group(1))
    except ValueError: return None      # table écrite à la main (Nécrons) : on n'y touche pas
    m2 = re.search(r'^const UNITS = \[\n(.*?)^\];$', src, re.S | re.M)
    unites = re.findall(r'^\s*\["((?:[^"\\]|\\.)*)"', m2.group(1), re.M)
    ajout = 0
    for g, mot in MOTS.items():
        if g not in kw: continue
        neuf = sorted(set(kw[g]) | {u for u in unites if mot in mots.get(u, ())})
        ajout += len(neuf) - len(kw[g])
        kw[g] = neuf
    for g, mot in CREES.items():
        neuf = sorted(set(kw.get(g, [])) | {u for u in unites if mot in mots.get(u, ())})
        if not neuf: continue
        ajout += len(neuf) - len(kw.get(g, []))
        kw[g] = neuf
    if ajout:
        txt = json.dumps(kw, ensure_ascii=False, indent=1)
        src = src[:m.start(1)] + txt + src[m.end(1):]
        open(chemin, 'w', encoding='utf-8').write(src)
    return ajout

if __name__ == '__main__':
    mots = motsWahapedia()
    for f in sorted(glob.glob(os.path.join(RACINE, 'data-*.js'))):
        n = traite(f, mots)
        print('%-28s %s' % (os.path.basename(f), 'tenue à la main' if n is None else '+%d' % n))
