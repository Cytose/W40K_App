#!/usr/bin/env python3
"""
============================================================
LES ZONES DE DÉPLOIEMENT, CONFRONTÉES AUX PAGES OFFICIELLES

layouts.js est produit depuis 40kdc-data. Le Compagnon de Rencontre
Warhammer, lui, imprime les 45 agencements. Deux sources indépendantes :
si la géométrie générée redonne les aplats du document, c'est une
vérification et non une coïncidence.

Sur chaque page, le plateau est un rectangle bordé d'un trait noir, et
les deux zones de déploiement sont deux aplats — rouge #8C0E11 pour
l'attaquant, bleu #04536F pour le défenseur. On repère le cadre, on
convertit les aplats en masques exprimés en pouces sur le plateau
44 × 60, et on les confronte à nos polygones rastérisés.

Trois précautions, chacune apprise d'une mesure fausse :

  — Le cadre ne se trouve pas en comptant les pixels sombres d'une ligne,
    un filet de mise en page en aligne autant. On exige une plage
    CONTINUE assez longue : seul le cadre en porte une. Les repères de
    bord attaquant et défenseur, rouges et bleus eux aussi, sont ainsi
    écartés sans avoir à les reconnaître — qu'ils soient horizontaux ou
    verticaux selon l'agencement.

  — Les décors sont dessinés PAR-DESSUS les aplats. Comparer les aires
    donne donc 71 % là où la géométrie est juste. On ne compare que là où
    le document se prononce : un décor masque la couleur, jamais
    l'inverse.

  — Qui est rouge et qui est bleu dépend de l'attaquant et du défenseur,
    et rien ne dit laquelle de nos deux zones tient ce rôle. On essaie
    les deux appariements ; compter l'échange comme une erreur ferait
    passer une carte juste pour fausse.

USAGE
    pip install Pillow numpy
    python3 outils/cartes-officielles.py <dossier>

Le dossier contient une image par page, nommée pNN.png. Ces images ne
sont pas versionnées : ce sont les pages d'un document de Games
Workshop, à fournir soi-même.

outils/cartes.json donne, pour chaque page, l'appariement et la lettre
d'agencement lus sur son bandeau. Sans lui, l'outil se contente de dire
quelle variante chaque page reconnaît le mieux.
============================================================
"""
import sys, os, json, subprocess, glob
from PIL import Image
import numpy as np

ROUGE, BLEU = (0x8C, 0x0E, 0x11), (0x04, 0x53, 0x6F)
W_PO, H_PO = 44.0, 60.0
PAS = 0.25          # côté d'une case de la grille de comparaison, en pouces
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def proche(im, c, tol=40):
    return np.abs(im - np.array(c)).sum(axis=2) < tol


def aplage(masque, k, axe):
    """Y a-t-il, par ligne (axe=1) ou colonne (axe=0), une plage continue
       d'au moins k pixels vrais ? Sommes cumulées : une boucle Python sur
       quatre millions de pixels est hors de propos."""
    m = masque if axe == 1 else masque.T
    cs = np.zeros((m.shape[0], m.shape[1] + 1), int)
    np.cumsum(m, axis=1, out=cs[:, 1:])
    if m.shape[1] < k:
        return np.zeros(m.shape[0], bool)
    return ((cs[:, k:] - cs[:, :-k]) == k).any(axis=1)


def cadre(im):
    sombre = im.sum(axis=2) < 300
    lig = np.where(aplage(sombre, 800, 1))[0]
    col = np.where(aplage(sombre, 1100, 0))[0]
    if not len(lig) or not len(col):
        raise ValueError('cadre du plateau introuvable')
    return int(col.min()), int(lig.min()), int(col.max()), int(lig.max())


def masques(chemin, pas=PAS):
    im = np.array(Image.open(chemin).convert('RGB')).astype(int)
    x0, y0, x1, y1 = cadre(im)
    nx, ny = int(W_PO / pas), int(H_PO / pas)
    ix = np.clip((x0 + (np.arange(nx) + 0.5) / nx * (x1 - x0)).astype(int), 0, im.shape[1] - 1)
    iy = np.clip((y0 + (np.arange(ny) + 0.5) / ny * (y1 - y0)).astype(int), 0, im.shape[0] - 1)
    sous = im[np.ix_(iy, ix)]
    return {'rouge': proche(sous, ROUGE), 'bleu': proche(sous, BLEU),
            'pas': pas, 'nx': nx, 'ny': ny,
            'ppp': ((x1 - x0) / W_PO, (y1 - y0) / H_PO)}


def rasterise(poly, nx, ny, pas):
    """Polygone en pouces vers masque, par la règle pair-impair."""
    X, Y = np.meshgrid((np.arange(nx) + .5) * pas, (np.arange(ny) + .5) * pas)
    dedans = np.zeros(X.shape, bool)
    n = len(poly)
    for i in range(n):
        ax, ay = poly[i]
        bx, by = poly[(i + 1) % n]
        coupe = (ay > Y) != (by > Y)
        with np.errstate(divide='ignore', invalid='ignore'):
            xint = (bx - ax) * (Y - ay) / (by - ay) + ax
        dedans ^= coupe & (X < xint)
    return dedans


def eloignement(cible, source, pas, maxi=40):
    """Distance approchée, en pouces, de chaque case au `source` le plus
       proche — par dilatations successives, faute de transformée de
       distance sous la main."""
    vu, front = source.copy(), source.copy()
    d = np.full(source.shape, np.inf)
    d[source] = 0.0
    for k in range(1, maxi + 1):
        gr = np.zeros_like(front)
        gr[1:, :] |= front[:-1, :]; gr[:-1, :] |= front[1:, :]
        gr[:, 1:] |= front[:, :-1]; gr[:, :-1] |= front[:, 1:]
        front = gr & ~vu
        if not front.any():
            break
        d[front] = k * pas
        vu |= front
    return d


def confronte(m, z1, z2):
    a = rasterise(z1, m['nx'], m['ny'], m['pas'])
    b = rasterise(z2, m['nx'], m['ny'], m['pas'])
    out = {}
    for nom, off, notre, autre in (('1', m['rouge'], a, b), ('2', m['bleu'], b, a)):
        out['couverture' + nom] = off[notre].sum() / off.sum() if off.sum() else 1.0
        out['fuite' + nom] = off[autre].sum() / off.sum() if off.sum() else 0.0
        if off.sum() and notre.sum():
            dd = eloignement(notre, off, m['pas'])[notre]
            dd = dd[np.isfinite(dd)]
            out['ecart' + nom] = float(np.percentile(dd, 99)) if dd.size else 99.0
        else:
            out['ecart' + nom] = 99.0
    return out


def note(m, v):
    """La moins bonne des deux zones, au meilleur des deux appariements
       de couleur."""
    best = None
    for a, b in ((v['z1'], v['z2']), (v['z2'], v['z1'])):
        r = confronte(m, a, b)
        s = min(r['couverture1'] - r['fuite1'], r['couverture2'] - r['fuite2'])
        if best is None or s > best[0]:
            best = (s, r)
    return best


def layouts():
    js = ('const fs=require("fs");'
          'const s=fs.readFileSync(%r,"utf8");'
          'const L=new Function(s+"; return LAYOUTS;")();'
          'console.log(JSON.stringify(L));' % os.path.join(RACINE, 'layouts.js'))
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True).stdout)


def main():
    dossier = sys.argv[1] if len(sys.argv) > 1 else 'cartes'
    pages = sorted(glob.glob(os.path.join(dossier, 'p*.png')),
                   key=lambda p: int(''.join(filter(str.isdigit, os.path.basename(p)))))
    if not pages:
        print('Aucune page dans %s. Attendu : des images nommées pNN.png.' % dossier)
        return 2
    L = layouts()
    carnet = {}
    f = os.path.join(RACINE, 'outils', 'cartes.json')
    if os.path.exists(f):
        carnet = json.load(open(f, encoding='utf-8'))

    # les noms de mission : chaque joueur a la sienne selon sa Disposition
    # des Forces, et la table les porte separement. On les confronte dans
    # les deux sens avant de passer a la geometrie.
    mm = mk = 0
    for fiche in carnet.values():
        if not isinstance(fiche, dict): continue
        for cle, att in ((fiche['p1'] + '|' + fiche['p2'], fiche.get('mission1')),
                         (fiche['p2'] + '|' + fiche['p1'], fiche.get('mission2'))):
            if att is None: continue
            if L['missions'].get(cle) == att: mm += 1
            else:
                mk += 1
                print('  ÉCART mission  %-34s officiel « %s », chez nous « %s »'
                      % (cle, att, L['missions'].get(cle)))
    if mm or mk:
        print('\n%d noms de mission confrontés, %d écart%s.'
              % (mm + mk, mk, 's' if mk > 1 else ''))

    print('\n%-6s %-46s %-21s %6s %7s %7s' %
          ('page', 'carte', 'patron', 'note', 'couvre', 'écart'))
    print('─' * 96)
    bons = vus = 0
    for chemin in pages:
        page = ''.join(filter(str.isdigit, os.path.basename(chemin)))
        m = masques(chemin)
        fiche = carnet.get(page)
        if fiche:
            p1, p2, lettre = fiche['p1'], fiche['p2'], fiche['agencement']
            cand = [v for v in L['matchups'].values() if {v['p1'], v['p2']} == {p1, p2}]
            if not cand:
                print('%-6s appariement inconnu : %s vs %s' % (page, p1, p2)); continue
            mu = cand[0]
            s, r = note(m, mu['v'][lettre])
            autres = [note(m, mu['v'][x])[0] for x in 'abc' if x != lettre]
            ok = s > 0.95 and s >= max(autres)
            vus += 1; bons += ok
            print('%-6s %-46s %-21s %6.3f %7.3f %6.2f″  %s  (autres %.2f / %.2f)' % (
                page, '%s vs %s — %s' % (p1.title(), p2.title(), lettre.upper()),
                mu['v'][lettre]['pat'], s, min(r['couverture1'], r['couverture2']),
                max(r['ecart1'], r['ecart2']), '✓' if ok else '✗', autres[0], autres[1]))
        else:
            meilleur = max(((note(m, mu['v'][x])[0], mu, x)
                            for mu in L['matchups'].values() for x in 'abc'),
                           key=lambda t: t[0])
            s, mu, x = meilleur
            print('%-6s %-46s %-21s %6.3f %7s %6s   (page non répertoriée)' % (
                page, 'reconnaît %s vs %s — %s' % (mu['p1'].title(), mu['p2'].title(), x.upper()),
                mu['v'][x]['pat'], s, '—', '—'))

    if vus:
        print('\n%d / %d pages répertoriées sont conformes.' % (bons, vus))
        print('La note est la part de l’aplat officiel que couvre notre zone, moins')
        print('ce qui tomberait dans l’autre ; l’écart, la distance dont notre zone')
        print('s’éloigne au plus de la couleur — l’épaisseur d’un décor posé dessus.')
    return 0 if bons == vus else 1


if __name__ == '__main__':
    sys.exit(main())
