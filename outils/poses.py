#!/usr/bin/env python3
"""
============================================================
LA PLACE DES DÉCORS DANS LEUR EMPRISE, RELEVÉE SUR LES CARTES

La source donne, pour chaque emprise, la liste des pièces qu'elle porte
et la place de chacune. Confrontée aux cartes, cette place est souvent
fausse : un muret à un demi-pouce de son mur, un petit L à deux pouces de
son coin, une barrière posée à l'envers. Le décalage se voit à l'œil nu
dès qu'on superpose le tracé au fond de carte.

C'est le même défaut, une troisième fois : la source exporte des emprises
retournées sans retourner ce qu'elles portent. Les deux premiers relevés
— outils/empreintes.py --densite pour le retournement, outils/formes.py
pour le contour — l'ont corrigée là où des rectangles suffisaient à le
voir. Des rectangles, justement, ne montrent ni un quart de tour ni un
demi-tour. Maintenant que les pièces ont leur vraie forme, ils se voient.

LE GESTE. Pour chaque emprise et chacune de ses pièces, on essaie les
quatre quarts de tour et toutes les translations du quart de pouce, et on
garde celle qui met le plus de la pièce sur SA couleur — le vert du
dense, l'or du léger. La moyenne se fait sur toutes les poses de
l'emprise, sur les 45 cartes : un voisin ne peut pas tromper le compte,
il change de place à chaque pose.

Trois garde-fous :

  — UNE PIÈCE RESTE DANS SON EMPRISE. Un mur appartient à sa ruine. On
    refuse toute place qui l'en ferait sortir plus qu'elle n'en sort
    déjà. Sans cette borne, un petit L d'or va se coller sur l'or du
    voisin, à deux pouces de chez lui.

  — ON NE CORRIGE QUE CE QUI GAGNE VRAIMENT. En deçà de cinq centièmes,
    la source est laissée telle quelle : à ce niveau on ne mesure plus
    que la maille du relevé de forme et le crénelage du fond de carte.

  — LE RELEVÉ SE COMPOSE. dispositions.js applique poses.json a la
    source ; relancer l'outil mesure donc ce qui RESTE a corriger, et le
    resultat s'ajoute a ce qui etait deja ecrit. Un second tour ne trouve
    presque plus rien : c'est la preuve que le premier a convergé.

  — LE MIROIR N'EST PAS DANS LA FAMILLE. Retourner une pièce sur
    elle-même gagnerait deux centièmes de plus, et voudrait dire qu'une
    ruine de plastique existe en deux exemplaires symétriques. On s'en
    passe : ce n'est pas assez pour affirmer ça.

USAGE
    pip install Pillow numpy
    npm run poses            relève et écrit outils/poses.json

Les fonds de carte appartiennent à Games Workshop. Non affilié.
============================================================
"""
import sys, os, json, math, subprocess
import numpy as np
from PIL import Image

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARTES = os.path.join(RACINE, 'cartes')
PAS = 0.2               # pas d'echantillonnage d'une piece, en pouces
LARGE = 3.0             # amplitude de la recherche, en pouces
GROS, FIN = 0.25, 0.0625
SEUIL = 0.05            # gain minimal pour qu'une correction soit retenue
DEDANS = 0.75           # part de la piece qui doit rester dans son emprise

VERT = lambda R, G, B: (G - R > 40) & (G - B > 5) & (G > 60)
OR_ = lambda R, G, B: (R - B > 55) & (R - G > 20) & (G - B > 20) & (R > 110)


def layouts():
    js = ('const fs=require("fs");const s=fs.readFileSync(%r,"utf8");'
          'const L=new Function(s+"; return LAYOUTS;")();'
          'console.log(JSON.stringify(L));' % os.path.join(RACINE, 'layouts.js'))
    return json.loads(subprocess.run(['node', '-e', js],
                                     capture_output=True, text=True).stdout)


def semis(poly, pas=PAS):
    """Un semis de points reguliers a l'interieur d'un contour."""
    xs = [q[0] for q in poly]; ys = [q[1] for q in poly]
    X, Y = np.meshgrid(np.arange(min(xs), max(xs), pas) + pas/2,
                       np.arange(min(ys), max(ys), pas) + pas/2)
    m = np.zeros(X.shape, bool); n = len(poly)
    for i in range(n):
        ax, ay = poly[i]; bx, by = poly[(i+1) % n]
        c = (ay > Y) != (by > Y)
        with np.errstate(divide='ignore', invalid='ignore'):
            t = (bx-ax)*(Y-ay)/(by-ay) + ax
        m ^= c & (X < t)
    P = np.stack([X[m], Y[m]], 1)
    return P if len(P) else np.zeros((1, 2))


def dedans(P, poly):
    m = np.zeros(len(P), bool); n = len(poly)
    for i in range(n):
        ax, ay = poly[i]; bx, by = poly[(i+1) % n]
        c = (ay > P[:, 1]) != (by > P[:, 1])
        with np.errstate(divide='ignore', invalid='ignore'):
            t = (bx-ax)*(P[:, 1]-ay)/(by-ay) + ax
        m ^= c & (P[:, 0] < t)
    return m


def main():
    L = layouts()
    if not L.get('gab'):
        print('layouts.js illisible'); return 2
    W, H = L['table']['w'], L['table']['h']
    gab = L['gab']

    cartes, idx = [], {}
    for k, mu in L['matchups'].items():
        for var in (mu.get('v') or {}):
            f = os.path.join(CARTES, '%s-%s.jpg' % (k, var))
            if os.path.exists(f):
                idx['%s-%s' % (k, var)] = len(cartes); cartes.append(f)
    if not cartes:
        print('Aucun fond de carte dans cartes/'); return 2
    NY, NX = np.array(Image.open(cartes[0]).convert('RGB')).shape[:2]
    MV = np.zeros((len(cartes), NY, NX), bool); MO = np.zeros_like(MV)
    for i, f in enumerate(cartes):
        a = np.array(Image.open(f).convert('RGB').resize((NX, NY))).astype(int)
        R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
        MV[i] = VERT(R, G, B); MO[i] = OR_(R, G, B)
    SX, SY = NX / W, NY / H

    cache = {}
    def pts(g):
        if g not in cache: cache[g] = semis(gab[g]['p'])
        return cache[g]

    lots = {}
    for k, mu in L['matchups'].items():
        for var, v in (mu.get('v') or {}).items():
            cle = '%s-%s' % (k, var)
            if cle not in idx: continue
            for d in v.get('t', []):
                g = gab.get(d['g'])
                if not g: continue
                for i, fe in enumerate(g.get('f', [])):
                    if fe['g'] not in gab: continue
                    lots.setdefault((d['g'], i), {'p': [], 'fe': fe})['p'].append(
                        (idx[cle], d['p'], d.get('r', 0), d.get('m', 0)))

    def monde(v, k, dx, dy):
        """Les points de la piece, portes sur chacune de ses poses."""
        fe = v['fe']; P = pts(fe['g'])
        fr = k + fe.get('r', 0)
        CI, WX, WY = [], [], []
        for ci, P0, rot, m in v['p']:
            px, py = fe['p'][0] + dx, fe['p'][1] + dy
            if m == 1: px = -px
            elif m == 2: py = -py
            rr = math.radians(rot); co, si = math.cos(rr), math.sin(rr)
            cx, cy = P0[0] + px*co - py*si, P0[1] + px*si + py*co
            Q = P.copy()
            if m == 1: Q = Q * np.array([-1., 1.])
            elif m == 2: Q = Q * np.array([1., -1.])
            fw = math.radians(rot + fr * (-1 if m else 1))
            c2, s2 = math.cos(fw), math.sin(fw)
            WX.append(cx + Q[:, 0]*c2 - Q[:, 1]*s2)
            WY.append(cy + Q[:, 0]*s2 + Q[:, 1]*c2)
            CI.append(np.full(len(Q), ci))
        return np.concatenate(CI), np.concatenate(WX), np.concatenate(WY)

    def note(v, k, dx, dy):
        ci, wx, wy = monde(v, k, dx, dy)
        ix = np.clip((wx*SX).astype(int), 0, NX-1)
        iy = np.clip((wy*SY).astype(int), 0, NY-1)
        return float((MV if v['fe'].get('d') else MO)[ci, iy, ix].mean())

    def tient(g, v, k, dx, dy):
        """La piece reste-t-elle dans son emprise ? On regarde dans le repere
           de l'emprise, une fois pour toutes : la pose n'y change rien."""
        fe = v['fe']; P = pts(fe['g'])
        fr = math.radians(k + fe.get('r', 0)); c, s = math.cos(fr), math.sin(fr)
        Q = np.stack([fe['p'][0] + dx + P[:, 0]*c - P[:, 1]*s,
                      fe['p'][1] + dy + P[:, 0]*s + P[:, 1]*c], 1)
        return float(dedans(Q, gab[g]['p']).mean())

    dejala = {}
    f = os.path.join(RACINE, 'outils', 'poses.json')
    if os.path.exists(f):
        dejala = json.load(open(f, encoding='utf-8')).get('poses') or {}
    lignes, sortie = [], dict(dejala)
    av, ap, neuves = [], [], 0
    for (g, i), v in sorted(lots.items()):
        s0 = note(v, 0, 0, 0)
        borne = min(DEDANS, tient(g, v, 0, 0, 0))
        best = (s0, 0, 0.0, 0.0)
        gros = np.arange(-LARGE, LARGE + 1e-9, GROS)
        for k in (0, 90, 180, 270):
            for dx in gros:
                for dy in gros:
                    q = note(v, k, dx, dy)
                    if q > best[0] and tient(g, v, k, dx, dy) >= borne:
                        best = (q, k, float(dx), float(dy))
        _, k, dx, dy = best
        for ddx in np.arange(-GROS, GROS + 1e-9, FIN):
            for ddy in np.arange(-GROS, GROS + 1e-9, FIN):
                q = note(v, k, dx+ddx, dy+ddy)
                if q > best[0] and tient(g, v, k, dx+ddx, dy+ddy) >= borne:
                    best = (q, k, dx+ddx, dy+ddy)
        garde = best[0] - s0 >= SEUIL
        av.append(s0); ap.append(best[0] if garde else s0)
        if garde:
            neuves += 1
            cle = '%s/%d' % (g, i)
            v0 = dejala.get(cle) or {'k': 0, 'd': [0, 0], 'avant': round(s0, 3)}
            sortie[cle] = {'k': (v0['k'] + best[1]) % 360,
                           'd': [round(v0['d'][0] + best[2], 3),
                                 round(v0['d'][1] + best[3], 3)],
                           'avant': v0['avant'], 'apres': round(best[0], 3)}
        lignes.append('  %-5s %-14s %4d poses  %.3f -> %.3f  %s' % (
            g, v['fe']['g'], len(v['p']), s0, best[0],
            ('quart %3d, %+.3f %+.3f' % (best[1], best[2], best[3])) if garde
            else 'laissee telle quelle'))

    with open(os.path.join(RACINE, 'outils', 'poses.json'), 'w', encoding='utf-8') as fh:
        json.dump({'_': "Place des elements dans leur emprise, relevee sur "
                        "cartes/*.jpg par outils/poses.py. k : quart de tour "
                        "ajoute ; d : translation dans le repere de l'emprise, "
                        "en pouces. NE PAS MODIFIER A LA MAIN.",
                   'seuil': SEUIL, 'poses': sortie}, fh, ensure_ascii=False, indent=1)
    print('\n'.join(lignes))
    print('\n%d elements, %d corriges ce tour, %d en tout — pose moyen '
          '%.3f -> %.3f' % (len(av), neuves, len(sortie),
                            float(np.mean(av)), float(np.mean(ap))))
    return 0


if __name__ == '__main__':
    sys.exit(main())
