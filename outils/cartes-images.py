#!/usr/bin/env python3
"""
============================================================
LES FONDS DE CARTE, PRÉPARÉS POUR L'APPLICATION

Prend un dossier de pages du Compagnon de Rencontre (pNN.png), découpe le
plateau de chacune et écrit dans cartes/ une image par agencement, nommée
d'après la clé que l'application emploie : <appariement>-<variante>.jpg.

Le découpe suit la règle de cartes-officielles.py : le cadre du plateau est
la seule chose de la page qui porte une plage CONTINUE de pixels sombres
sur presque toute la largeur. Compter les pixels sombres ne suffirait pas,
un filet de mise en page en aligne autant.

La taille est un compromis mesuré. Ces images servent de calque sous la
géométrie, à demi-opacité : 620 pixels pour 44 pouces font 14 pixels au
pouce, assez pour lire les zones et la forme des décors, et tiennent en
65 Ko pièce — 3 Mo pour les 45, ce que le fichier autonome peut porter.

USAGE
    pip install Pillow numpy
    python3 outils/cartes-images.py <dossier-des-pages>
============================================================
"""
import sys, os, json, subprocess, glob
import importlib.util as iu
from PIL import Image
import numpy as np

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LARGE, QUALITE = 620, 58

sp = iu.spec_from_file_location('co', os.path.join(RACINE, 'outils', 'cartes-officielles.py'))
co = iu.module_from_spec(sp); sp.loader.exec_module(co)


def layouts():
    js = ('const fs=require("fs");const s=fs.readFileSync(%r,"utf8");'
          'const L=new Function(s+"; return LAYOUTS;")();console.log(JSON.stringify(L));'
          % os.path.join(RACINE, 'layouts.js'))
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True).stdout)


def main():
    if len(sys.argv) < 2:
        print(__doc__); return 2
    dossier = sys.argv[1]
    carnet = json.load(open(os.path.join(RACINE, 'outils', 'cartes.json'), encoding='utf-8'))
    L = layouts()
    sortie = os.path.join(RACINE, 'cartes')
    os.makedirs(sortie, exist_ok=True)

    pages = sorted(glob.glob(os.path.join(dossier, 'p*.png')),
                   key=lambda p: int(''.join(filter(str.isdigit, os.path.basename(p)))))
    if not pages:
        print('Aucune page dans %s (attendu : pNN.png).' % dossier); return 2

    total = faits = 0
    for chemin in pages:
        n = ''.join(filter(str.isdigit, os.path.basename(chemin)))
        fiche = carnet.get(n)
        if not fiche:
            print('  page %s : absente du carnet, ignorée' % n); continue
        cand = [i for i, mu in L['matchups'].items()
                if {mu['p1'], mu['p2']} == {fiche['p1'], fiche['p2']}]
        if not cand:
            print('  page %s : appariement inconnu, ignorée' % n); continue

        im = Image.open(chemin).convert('RGB')
        try:
            x0, y0, x1, y1 = co.cadre(np.array(im).astype(int))
        except Exception:
            print('  page %s : cadre introuvable, ignorée' % n); continue
        b = im.crop((x0, y0, x1, y1))
        b = b.resize((LARGE, round(LARGE * b.height / b.width)), Image.LANCZOS)
        nom = '%s-%s.jpg' % (cand[0], fiche['agencement'])
        f = os.path.join(sortie, nom)
        b.save(f, 'JPEG', quality=QUALITE, optimize=True, progressive=True)
        total += os.path.getsize(f); faits += 1

    print('%d fonds écrits dans cartes/ — %.1f Mo, %.0f Ko en moyenne'
          % (faits, total / 1048576, total / max(1, faits) / 1024))
    return 0 if faits else 1


if __name__ == '__main__':
    sys.exit(main())
