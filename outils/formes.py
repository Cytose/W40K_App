#!/usr/bin/env python3
"""
============================================================
LA FORME DES DÉCORS, RELEVÉE SUR LES FONDS DE CARTE

La source structurée ne donne de chaque pièce de décor que sa BOÎTE :
« Small L, rectangle 1,5 × 2,5 ». Or le document, lui, dessine un L —
deux branches minces à angle droit — et cette forme se voit sur la table.
La rendre pleine, c'est boucher une ouverture par laquelle on tire.

Aucune source ne porte ces contours. Ils se relèvent, et le seul relevé
possible est celui des cartes elles-mêmes : cartes/*.jpg, le plateau seul
découpé de chaque page, quatorze pixels au pouce, versionné avec l'app.

LE GESTE. Chaque pièce est posée quatre-vingt-dix fois ou plus sur les
quarante-cinq cartes, à des angles quelconques. On rapporte chacune de
ces poses dans le repère propre de la pièce, on y lit la couleur du
document — vert pour le dense, or pour le léger, les mêmes prédicats que
outils/empreintes.py — et on MOYENNE. Ce qui appartient à la pièce est là
sur toutes les poses ; ce qui appartient au voisinage — une ruine
mitoyenne, une pastille de légende — change de place à chaque pose et
tombe sous le seuil. Reste la forme.

Deux précautions :

  — les pastilles d'objectif sont vertes elles aussi, et grandes. On les
    ôte : un disque autour de chaque objectif et de chaque marqueur de
    déploiement, écarté du compte plutôt que compté vide.

  — le relevé se fait sur une grille du quart de pouce, pas au pixel.
    Les pièces sont cotées au quart de pouce, la grille dit donc ce que
    le document dit, sans le bruit du crénelage ni celui du JPEG.

Le contour sort rectiligne, tracé sur le bord des cases retenues, ses
points alignés fondus. Il s'écrit dans outils/formes.json, que
outils/dispositions.js lit pour remplacer la boîte de la source.

USAGE
    pip install Pillow numpy
    npm run formes                   relève et écrit outils/formes.json
    npm run formes -- --planche      + outils/formes.png, planche de contrôle
                                       (non versionnée : la moyenne relevée
                                        en gris, le contour retenu dessus)

Les fonds de carte appartiennent à Games Workshop. Non affilié.
============================================================
"""
import sys, os, json, math, subprocess
import numpy as np
from PIL import Image

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARTES = os.path.join(RACINE, 'cartes')
PAS = 0.25              # la grille du relevé, en pouces
MARGE = 0.75            # on regarde au-dela de la boite de la source
SOUS = 4                # sous-echantillons par cote de case
SEUIL = 0.5             # une case est pleine a la moitie du plein de sa piece
LIEN = 0.25             # ... et le quart suffit si elle tient a du plein
ECARTE = 1.7            # rayon, en pouces, du disque ote autour d'un objectif

VERT = lambda R, G, B: (G - R > 40) & (G - B > 5) & (G > 60)
OR_ = lambda R, G, B: (R - B > 55) & (R - G > 20) & (G - B > 20) & (R > 110)


def layouts():
    js = ('const fs=require("fs");const s=fs.readFileSync(%r,"utf8");'
          'const L=new Function(s+"; return LAYOUTS;")();'
          'console.log(JSON.stringify(L));' % os.path.join(RACINE, 'layouts.js'))
    r = subprocess.run(['node', '-e', js], capture_output=True, text=True)
    return json.loads(r.stdout)


def jeu(a):
    """Le fond de carte est découpé sur le BORD EXTÉRIEUR du cadre noir.
       L'aire de jeu est ce cadre ôté. Son épaisseur ne fait que trois
       pixels ; on la mesure en fraction de pixel, en additionnant la part
       sombre de chaque ligne tant qu'elle domine."""
    mx, mn = a.max(2), a.min(2)
    noir = (mx < 105) & ((mx - mn) < 30)
    h, w = noir.shape

    def bande(lignes):
        e = 0.0
        for v in lignes:
            f = v.mean()
            if f < 0.5:
                break
            e += f
        return e
    t = bande(noir[i] for i in range(12))
    b = bande(noir[h - 1 - i] for i in range(12))
    g = bande(noir[:, i] for i in range(12))
    d = bande(noir[:, w - 1 - i] for i in range(12))
    return g, t, w - d, h - b


def poses(L):
    """Toutes les poses d'élément des 45 cartes, dans le repère du plateau :
       clé de carte, clé de gabarit, centre, angle, miroir. Même geste que
       poserGabarit dans plateau.js — mais on garde la POSE, pas le contour."""
    gab = L['gab']
    out = []

    def marche(cle, d, prof=0):
        g = gab.get(d['g'])
        if not g or prof > 3:
            return
        r = math.radians(d.get('r', 0))
        co, si = math.cos(r), math.sin(r)

        def loc(q):
            x, y = q
            if d.get('m') == 1:
                x = -x
            elif d.get('m') == 2:
                y = -y
            return (d['p'][0] + x*co - y*si, d['p'][1] + x*si + y*co)
        if g.get('k') == 'f':
            out.append((cle, d['g'], d['p'], d.get('r', 0), d.get('m', 0)))
        for f in g.get('f', []):
            marche(cle, {'g': f['g'], 'p': loc(f['p']),
                         'r': d.get('r', 0) + f.get('r', 0) * (-1 if d.get('m') else 1),
                         'm': d.get('m')}, prof + 1)

    for k, mu in L['matchups'].items():
        for var, v in (mu.get('v') or {}).items():
            for d in v.get('t', []):
                marche('%s-%s' % (k, var), d)
    return out


def cartes(L):
    """Une carte lue : masques de couleur, échelle, et le disque ôté autour
       de chaque pastille d'objectif."""
    W, H = L['table']['w'], L['table']['h']
    vues = {}
    for k, mu in L['matchups'].items():
        for var, v in (mu.get('v') or {}).items():
            cle = '%s-%s' % (k, var)
            f = os.path.join(CARTES, cle + '.jpg')
            if not os.path.exists(f):
                continue
            a = np.array(Image.open(f).convert('RGB')).astype(int)
            R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
            x0, y0, x1, y1 = jeu(a)
            pastilles = [tuple(o) for o in (v.get('o') or [])]
            pastilles += [tuple(o) for o in (v.get('h1') or [])]
            pastilles += [tuple(o) for o in (v.get('h2') or [])]
            vues[cle] = {'vert': VERT(R, G, B), 'or': OR_(R, G, B),
                         'sx': (x1 - x0) / W, 'sy': (y1 - y0) / H,
                         'x0': x0, 'y0': y0, 'w': a.shape[1], 'h': a.shape[0],
                         'past': np.array(pastilles, float) if pastilles else None}
    return vues


def couleurs(L):
    """Chaque pièce est peinte d'une couleur et d'une seule : le relevé de
       densité l'a établi. On la retrouve ici par le drapeau d qu'il a posé
       sur les éléments du catalogue."""
    gab, dit = L['gab'], {}
    for g in gab.values():
        for f in g.get('f', []):
            k = f['g']
            dit.setdefault(k, [0, 0])
            dit[k][1 if f.get('d') else 0] += 1
    return {k: ('vert' if v[1] >= v[0] else 'or') for k, v in dit.items()}


def boites(L):
    """La boite de chaque piece — celle de la SOURCE, pas celle du dernier
       relevé. Une fois le contour ecrit dans layouts.js, le relire y
       prendrait la boite du contour mesure, plus petite : le relevé
       retrecirait a chaque tour. On la garde donc dans formes.json, et
       on ne la mesure qu'une fois."""
    f = os.path.join(RACINE, 'outils', 'formes.json')
    dit = {}
    if os.path.exists(f):
        dit = json.load(open(f, encoding='utf-8')).get('boites') or {}
    out = {}
    for k, g in L['gab'].items():
        if g.get('k') != 'f':
            continue
        if k in dit:
            out[k] = tuple(dit[k])
        else:
            p = g['p']
            out[k] = (max(q[0] for q in p) - min(q[0] for q in p),
                      max(q[1] for q in p) - min(q[1] for q in p))
    return out


def releve(L):
    vues, coul, tout = cartes(L), couleurs(L), poses(L)
    gab = L['gab']; boite = boites(L)
    par = {}
    for cle, g, p, r, m in tout:
        par.setdefault(g, []).append((cle, p, r, m))

    formes = {}
    for g, liste in sorted(par.items()):
        w, h = boite[g]
        """La grille se cale sur la BOÎTE, pas sur la fenêtre : ses bords
           tombent sur des bords de case. Une pièce de 3,75 pouces centrée
           sur une grille du quart de pouce couperait sinon une case en
           deux, et le contour déborderait d'un huitième de pouce."""
        w = round(w / PAS) * PAS
        h = round(h / PAS) * PAS
        mg = int(math.ceil(MARGE / PAS))
        nx = int(round(w / PAS)) + 2*mg
        ny = int(round(h / PAS)) + 2*mg
        ox, oy = -w/2 - mg*PAS, -h/2 - mg*PAS
        u = (np.arange(nx * SOUS) + 0.5) * PAS / SOUS + ox
        v = (np.arange(ny * SOUS) + 0.5) * PAS / SOUS + oy
        LX, LY = np.meshgrid(u, v)
        somme = np.zeros(LX.shape)
        compte = np.zeros(LX.shape)
        for cle, p, r, m in liste:
            vue = vues.get(cle)
            if not vue:
                continue
            x, y = LX.copy(), LY.copy()
            if m == 1:
                x = -x
            elif m == 2:
                y = -y
            a = math.radians(r)
            co, si = math.cos(a), math.sin(a)
            wx = p[0] + x*co - y*si
            wy = p[1] + x*si + y*co
            px = np.clip((vue['x0'] + wx * vue['sx']).astype(int), 0, vue['w'] - 1)
            py = np.clip((vue['y0'] + wy * vue['sy']).astype(int), 0, vue['h'] - 1)
            bon = np.ones(px.shape, bool)
            if vue['past'] is not None:
                for ox2, oy2 in vue['past']:
                    bon &= ((wx - ox2)**2 + (wy - oy2)**2) > ECARTE**2
            somme += np.where(bon, vue[coul.get(g, 'vert')][py, px], 0)
            compte += bon
        part = np.where(compte > 0, somme / np.maximum(compte, 1), 0)
        cases = part.reshape(ny, SOUS, nx, SOUS).mean(axis=(1, 3))
        X, Y = np.meshgrid((np.arange(nx) + .5) * PAS + ox,
                           (np.arange(ny) + .5) * PAS + oy)
        formes[g] = {'cases': cases, 'ox': ox, 'oy': oy, 'poses': len(liste),
                     'coul': coul.get(g, 'vert'), 'boite': (w, h),
                     'dans': (np.abs(X) <= w/2) & (np.abs(Y) <= h/2)}
    return formes


def retenue(f):
    """Ce qui est retenu de la moyenne. Deux règles, et une seule idée :
       ne garder que ce qui appartient à la pièce.

       LE SEUIL EST RELATIF. Une barrière mince ne noircit jamais autant
       qu'un pan de ruine : sa matière est étroite, le crénelage et le JPEG
       la diluent. Un seuil absolu la ferait disparaître. On prend donc la
       moitié de ce que la pièce atteint chez elle — son 92e centile — et
       les deux familles se relèvent à la même aune.

       LA BOÎTE FAIT LOI. La source donne de chaque pièce sa boîte
       englobante ; rien de la pièce n'est dehors. Ce qui déborde est le
       voisinage, et on le coupe.

       DEUX SEUILS, PAS UN. Une barrière est un muret entre deux contreforts :
       les contreforts passent le seuil, le muret non, et la pièce se
       casserait en trois. On garde donc aussi le faible — le quart du plein
       — quand il TIENT à du fort. Le voisinage, lui, ne tient à rien."""
    from scipy import ndimage
    dans = f['dans']
    plein = float(np.percentile(f['cases'][dans], 92))
    fort = (f['cases'] >= SEUIL * plein) & dans
    faible = (f['cases'] >= LIEN * plein) & dans
    lab, n = ndimage.label(faible)
    garde = np.isin(lab, [i for i in np.unique(lab[fort]) if i])
    return plusgros(garde)


def plusgros(m):
    """La plus grande composante 4-connexe, trous bouchés."""
    from scipy import ndimage
    lab, n = ndimage.label(m)
    if n == 0:
        return m
    tailles = ndimage.sum(m, lab, range(1, n + 1))
    garde = lab == (int(np.argmax(tailles)) + 1)
    return ndimage.binary_fill_holes(garde)


def contour(m, ox, oy, pas=PAS):
    """Le bord des cases retenues, chaîné en boucle. Chaque case pleine
       donne au contour ceux de ses quatre côtés qui touchent le vide,
       orientés dans le sens horaire ; les recoller bout à bout donne le
       polygone."""
    ny, nx = m.shape
    aretes = {}
    for i in range(ny):
        for j in range(nx):
            if not m[i, j]:
                continue
            if i == 0 or not m[i-1, j]:
                aretes.setdefault((j, i), []).append((j+1, i))
            if j == nx-1 or not m[i, j+1]:
                aretes.setdefault((j+1, i), []).append((j+1, i+1))
            if i == ny-1 or not m[i+1, j]:
                aretes.setdefault((j+1, i+1), []).append((j, i+1))
            if j == 0 or not m[i, j-1]:
                aretes.setdefault((j, i+1), []).append((j, i))
    boucles = []
    while aretes:
        dep = next(iter(aretes))
        b, ici = [dep], dep
        while True:
            suite = aretes.get(ici)
            if not suite:
                break
            nxt = suite.pop(0)
            if not suite:
                del aretes[ici]
            if nxt == dep:
                break
            b.append(nxt)
            ici = nxt
        if len(b) > 3:
            boucles.append(b)
    if not boucles:
        return []

    def aire(b):
        s = 0
        for k in range(len(b)):
            a, c = b[k], b[(k+1) % len(b)]
            s += a[0]*c[1] - c[0]*a[1]
        return abs(s) / 2
    b = max(boucles, key=aire)
    pts = [[round(ox + x*pas, 3), round(oy + y*pas, 3)] for x, y in b]
    return fondre(pts)


def fondre(pts):
    """Trois points alignés n'en font qu'un tournant : on ôte celui du milieu."""
    out = []
    n = len(pts)
    for i in range(n):
        a, b, c = pts[(i-1) % n], pts[i], pts[(i+1) % n]
        if abs((b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])) > 1e-9:
            out.append(b)
    return out


def planche(formes, polys, chemin):
    """Une planche de contrôle : pour chaque pièce, la moyenne relevée en
       gris, et le contour retenu par-dessus."""
    from PIL import ImageDraw
    z = 12
    cols, lignes = 4, int(math.ceil(len(formes) / 4))
    cw = max(f['cases'].shape[1] for f in formes.values()) * z + 24
    ch = max(f['cases'].shape[0] for f in formes.values()) * z + 34
    im = Image.new('RGB', (cols*cw, lignes*ch), (250, 250, 248))
    dr = ImageDraw.Draw(im)
    for n, (g, f) in enumerate(sorted(formes.items())):
        bx, by = (n % cols)*cw + 12, (n // cols)*ch + 26
        c = f['cases']
        for i in range(c.shape[0]):
            for j in range(c.shape[1]):
                t = int(255 - 210*min(1, c[i, j]))
                dr.rectangle([bx+j*z, by+i*z, bx+(j+1)*z-1, by+(i+1)*z-1],
                             fill=(t, t, t))
        p = polys.get(g) or []
        if p:
            xy = [(bx + (x - f['ox'])/PAS*z, by + (y - f['oy'])/PAS*z) for x, y in p]
            dr.line(xy + [xy[0]], fill=(0, 160, 60) if f['coul'] == 'vert'
                    else (230, 150, 0), width=3)
        dr.text((bx, by - 16), '%s  %d poses' % (g, f['poses']), fill=(20, 20, 20))
    im.save(chemin)


def main():
    L = layouts()
    if not L.get('gab'):
        print('layouts.js illisible'); return 2
    formes = releve(L)
    polys, lignes = {}, []
    bt = {g: [round(f['boite'][0], 3), round(f['boite'][1], 3)]
          for g, f in formes.items()}
    for g, f in sorted(formes.items()):
        m = retenue(f)
        if not m.any():
            lignes.append('  %-14s AUCUNE matiere retenue' % g); continue
        p = contour(m, f['ox'], f['oy'])
        polys[g] = p
        aire = m.sum() * PAS * PAS
        w, h = f['boite']
        bw = (max(q[0] for q in p) - min(q[0] for q in p)) / w
        bh = (max(q[1] for q in p) - min(q[1] for q in p)) / h
        lignes.append('  %-14s %-4s %3d poses  %2d points  %5.2f po2 sur %5.2f '
                      '(%3d %%)  boite remplie %.2f x %.2f'
                      % (g, f['coul'], f['poses'], len(p), aire, w*h,
                         round(100*aire/(w*h)), bw, bh))
    sortie = os.path.join(RACINE, 'outils', 'formes.json')
    with open(sortie, 'w', encoding='utf-8') as fh:
        json.dump({'_': "Contours releves sur cartes/*.jpg par outils/formes.py. "
                        "Repere local de la piece, en pouces, origine au centre "
                        "de la boite de la source. NE PAS MODIFIER A LA MAIN.",
                   'pas': PAS, 'seuil': SEUIL,
                   'boites': {k: bt[k] for k in sorted(bt)},
                   'formes': {k: polys[k] for k in sorted(polys)}},
                  fh, ensure_ascii=False, indent=1)
    print('\n'.join(lignes))
    print('%d contours ecrits dans outils/formes.json' % len(polys))
    if '--planche' in sys.argv:
        f = os.path.join(RACINE, 'outils', 'formes.png')
        planche(formes, polys, f)
        print('planche de controle : ' + f)
    return 0


if __name__ == '__main__':
    sys.exit(main())
