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



# ────────────────────────────────────────────────────────────────────────
# LE DÉCOR
#
# Les zones se lisent d'un coup : deux aplats francs. Le décor, non — c'est
# du gris sur du gris. Trois couches se ressemblent :
#
#   le fond du no man's land   gris CHAUD clair, quadrillé, somme RVB ≈ 625
#   le gabarit posé dessus     gris NEUTRE, gravats, somme 250 à 600
#   les ruines qui le garnissent   teintes franches, vert-de-gris et rouille
#
# On classe au pixel, puis on vote à la maille de 0,25″ : une ligne de
# quadrillage large d'un ou deux pixels est minoritaire dans une maille de
# cinq, elle disparaît sans qu'on ait à l'éroder. Restent les intersections
# du quadrillage, qui passent le vote : on retire les taches de moins de
# dix mailles, un gabarit en faisant des dizaines.
#
# Ce masque suit les gravats, pas le contour du gabarit : il en couvre les
# deux tiers. On ne peut donc pas en tirer une cote au dixième de pouce
# comme pour les zones. Ce qu'il établit est autre chose, et c'est déjà
# beaucoup : que chaque page reconnaisse SA carte parmi les 45, et qu'aucun
# décalage d'ensemble ne rattrape mieux nos décors sur le document.
# ────────────────────────────────────────────────────────────────────────

def masque_decor(im, cad, pas=PAS):
    x0, y0, x1, y1 = cad
    b = im[y0:y1, x0:x1]
    lum = b.sum(axis=2); sat = b.max(axis=2) - b.min(axis=2)
    rouge = np.abs(b - np.array(ROUGE)).sum(axis=2) < 110
    bleu  = np.abs(b - np.array(BLEU )).sum(axis=2) < 110
    ruine  = (sat > 25) & ~rouge & ~bleu
    gravat = (lum > 240) & (lum < 600) & (sat <= 25) & ~rouge & ~bleu
    m = (gravat | ruine).astype(np.float32)
    nx, ny = int(W_PO / pas), int(H_PO / pas)
    bx = np.linspace(0, m.shape[1], nx + 1).astype(int)
    by = np.linspace(0, m.shape[0], ny + 1).astype(int)
    cs = np.zeros((m.shape[0] + 1, m.shape[1] + 1), np.float64)
    cs[1:, 1:] = m.cumsum(0).cumsum(1)
    som = (cs[np.ix_(by[1:], bx[1:])] - cs[np.ix_(by[:-1], bx[1:])]
           - cs[np.ix_(by[1:], bx[:-1])] + cs[np.ix_(by[:-1], bx[:-1])])
    return (som / np.outer(np.diff(by), np.diff(bx))) > 0.5


def sans_miettes(g, mini=10):
    """Retire les taches de moins de `mini` mailles."""
    vu = np.zeros(g.shape, bool); out = np.zeros(g.shape, bool)
    H, Wd = g.shape
    for j in range(H):
        for i in range(Wd):
            if not g[j, i] or vu[j, i]:
                continue
            pile, amas = [(j, i)], []
            vu[j, i] = True
            while pile:
                y, x = pile.pop(); amas.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    b, a = y + dy, x + dx
                    if 0 <= b < H and 0 <= a < Wd and g[b, a] and not vu[b, a]:
                        vu[b, a] = True; pile.append((b, a))
            if len(amas) >= mini:
                for y, x in amas:
                    out[y, x] = True
    return out


def emprise(v, pas=PAS):
    """L'union de nos emprises de décor, à la maille."""
    nx, ny = int(W_PO / pas), int(H_PO / pas)
    u = np.zeros((ny, nx), bool)
    for d in v.get('t', []):
        for poly in (d.get('w') or []):
            u |= rasterise(poly, nx, ny, pas)
    return u


def decale(m, dy, dx):
    o = np.zeros_like(m)
    ny, nx = m.shape
    ys = slice(max(0, dy), ny + min(0, dy)); yd = slice(max(0, -dy), ny + min(0, -dy))
    xs = slice(max(0, dx), nx + min(0, dx)); xd = slice(max(0, -dx), nx + min(0, -dx))
    o[ys, xs] = m[yd, xd]
    return o


def layouts():
    js = ('const fs=require("fs");'
          'const s=fs.readFileSync(%r,"utf8");'
          'const L=new Function(s+"; return LAYOUTS;")();'
          'console.log(JSON.stringify(L));' % os.path.join(RACINE, 'layouts.js'))
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True).stdout)



def decors(pages, carnet, L):
    """Chaque page reconnaît-elle SA carte à partir du seul décor ?

       On ne cherche pas une cote : le masque suit les gravats, pas le
       contour du gabarit. On demande deux choses, toutes deux
       falsifiables — que la carte de la page batte les 44 autres, et
       qu'aucun décalage d'ensemble ne rattrape mieux nos décors."""
    if not carnet:
        print('\nDécors : il faut outils/cartes.json pour savoir quelle page est quelle carte.')
        return False

    variantes = []
    for mu in L['matchups'].values():
        for x in 'abc':
            variantes.append((mu['p1'], mu['p2'], x, emprise(mu['v'][x])))

    print('\n\n%-6s %-46s %8s %8s %9s' %
          ('page', 'carte', 'remplit', '2e carte', 'décalage'))
    print('─' * 88)
    seuls = ties = 0
    remplis, glissants = [], []
    for chemin in pages:
        page = ''.join(filter(str.isdigit, os.path.basename(chemin)))
        fiche = carnet.get(page)
        if not fiche:
            continue
        im = np.array(Image.open(chemin).convert('RGB')).astype(int)
        off = sans_miettes(masque_decor(im, cadre(im)))
        if not off.any():
            continue
        notes = []
        for p1, p2, x, u in variantes:
            notes.append((off[u].sum() / off.sum(), p1, p2, x))
        notes.sort(reverse=True)
        sienne = [t for t in notes
                  if {t[1], t[2]} == {fiche['p1'], fiche['p2']} and t[3] == fiche['agencement']][0]
        autre = max(t[0] for t in notes if t[1:] != sienne[1:])
        remplis.append(sienne[0])

        cand = [v for v in L['matchups'].values() if {v['p1'], v['p2']} == {fiche['p1'], fiche['p2']}][0]
        nous = emprise(cand['v'][fiche['agencement']])
        base = (off & nous).sum()
        meilleur = max(((off & decale(nous, dy, dx)).sum(), -(abs(dy) + abs(dx)), dy, dx)
                       for dy in range(-8, 9) for dx in range(-8, 9))
        nul = (meilleur[2], meilleur[3]) == (0, 0)
        if not nul:
            glissants.append((page, meilleur[3] * PAS, meilleur[2] * PAS,
                              meilleur[0] / max(1, base) - 1))

        if sienne[0] > autre: seuls += 1
        elif sienne[0] >= autre - 0.002: ties += 1
        print('%-6s %-46s %8.3f %8.3f %9s  %s' % (
            page, '%s vs %s — %s' % (fiche['p1'].title(), fiche['p2'].title(),
                                     fiche['agencement'].upper()),
            sienne[0], autre, 'nul' if nul else 'non nul',
            '✓' if sienne[0] > autre else ('=' if sienne[0] >= autre - 0.002 else '✗')))

    n = len(remplis)
    print('\n%d pages sur %d reconnaissent leur propre carte ; %d sont à égalité avec une'
          % (seuls, n, ties))
    print('carte que le document lui-même dessine à l’identique — lettres permutées entre')
    print('Perturbation vs Perturbation et Reconnaissance vs Reconnaissance.')
    print('Couverture médiane %.2f : la part de l’encre de décor du document qui tombe'
          % float(np.median(remplis)))
    print('dans nos emprises. Elle ne vaut pas 1 parce que le masque suit les gravats et')
    print('non le contour du gabarit — ce chiffre mesure le dessin autant que notre écart.')
    if glissants:
        print('\n%d cartes sur %d gagneraient à un décalage d’ensemble :' % (len(glissants), n))
        for pg, dx, dy, gain in glissants:
            print('   page %-4s  %+.2f″ en x, %+.2f″ en y, pour %+.1f %% de recouvrement'
                  % (pg, dx, dy, 100 * gain))
    else:
        print('\nAucune carte ne gagne à un décalage d’ensemble : le zéro est déjà l’optimum.')
    return seuls + ties == n


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

    if '--decors' in sys.argv:
        bons_d = decors(pages, carnet, L)
        return 0 if (bons == vus and bons_d) else 1
    return 0 if bons == vus else 1


if __name__ == '__main__':
    sys.exit(main())
