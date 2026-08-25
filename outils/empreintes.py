#!/usr/bin/env python3
"""
============================================================
LES EMPRISES DE DÉCOR, CONFRONTÉES AUX PAGES OFFICIELLES

layouts.js ne garde plus, par carte, que la pose de seize gabarits : une
clé, un centre, un angle, un miroir. Cet outil refait la pose comme
plateau.js la fait, la rastérise en pouces sur le plateau 44 × 60, et la
confronte à ce que la page officielle dessine réellement.

Séparer le décor du fond ne se fait pas sur la clarté : le fond du no
man's land et le gravat ont la même. Il se fait sur la TEINTE — le fond
est chaud, rouge un peu au-dessus du bleu, le gravat est neutre. Le blanc
est ambigu : quadrillage au-dehors, éclat de gravat au-dedans ; on ne le
rend au vide que s'il touche déjà du vide.

Deux mesures, et une épreuve :

  — POSÉ : quelle part de nos emprises tombe sur de la matière. Une
    emprise juste doit y être presque entière.

  — RENDU : quelle part de la matière de la page nos emprises expliquent.
    Elle plafonne sous 1 : le document laisse le gravat déborder de la
    zone, et ce débord n'est pas une emprise.

  — L'ÉPREUVE : chaque page reconnaît-elle SA carte parmi les 45 ? C'est
    le seul contrôle qu'une erreur d'ensemble ne peut pas passer. Quelques
    ex æquo sont attendus et ne sont pas des fautes : les deux
    appariements en miroir — Disruption contre Disruption, Reconnaissance
    contre Reconnaissance — reçoivent du document le MÊME agencement de
    décor. Aucune mesure ne peut les départager, et il n'y a rien à
    départager. On les compte à part.

USAGE
    pip install Pillow numpy
    python3 outils/empreintes.py <dossier>
    python3 outils/empreintes.py <dossier> --planches <dir>   + calques

Le dossier contient une image par page, nommée pNN.png. Ces images ne
sont pas versionnées : ce sont les pages d'un document de Games Workshop,
à fournir soi-même. outils/cartes.json dit quelle page est quelle carte.

Non affilié à Games Workshop.
============================================================
"""
import sys, os, json, glob, math, subprocess
import numpy as np
from PIL import Image, ImageDraw

W_PO, H_PO = 44.0, 60.0
PAS = 0.25
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ------------------------------------------------------------- la page
def aplage(masque, k, axe):
    m = masque if axe == 1 else masque.T
    cs = np.zeros((m.shape[0], m.shape[1] + 1), int)
    np.cumsum(m, axis=1, out=cs[:, 1:])
    if m.shape[1] < k:
        return np.zeros(m.shape[0], bool)
    return ((cs[:, k:] - cs[:, :-k]) == k).any(axis=1)


def cadre(im):
    """Le plateau est la seule chose de la page qui porte une plage sombre
       continue sur presque toute sa largeur.

       Sombre veut dire NOIR ET NEUTRE, pas seulement peu lumineux : le
       bleu d'une zone de deploiement est aussi sombre que le trait de
       cadre, et une carte ou la zone bleue touche le bord faisait
       deborder le plateau de huit pixels."""
    mx, mn = im.max(axis=2), im.min(axis=2)
    sombre = (mx < 105) & (mx - mn < 22)
    lig = np.where(aplage(sombre, 800, 1))[0]
    col = np.where(aplage(sombre, 1100, 0))[0]
    if not len(lig) or not len(col):
        raise ValueError('cadre du plateau introuvable')
    return int(col.min()), int(lig.min()), int(col.max()), int(lig.max())


def jeu(im):
    """Le 44 x 60 utile, dedans le trait de cadre.

       Le cadre fait sept pixels a cette definition ; le compter pour du
       plateau raccourcissait d'un pouce toute la longueur. On mesure donc
       son epaisseur au lieu de la supposer.

       La mesurer sur une seule ligne ne marche pas : sur trois pages, un
       decor sombre touche le cadre a l'endroit sondé et la sonde file
       jusqu'au milieu du plateau. On demande donc a la ligne ENTIERE
       d'etre noire aux trois quarts : un decor n'y suffit jamais, le
       cadre toujours."""
    x0, y0, x1, y1 = cadre(im)
    mx, mn = im.max(axis=2), im.min(axis=2)
    noir = (mx < 105) & (mx - mn < 22)

    def bande(part):
        """Longueur du trait plein depuis le bord, au plus 40 pixels."""
        k = 0
        while k < min(40, len(part)) and part[k].mean() > 0.75:
            k += 1
        return k

    h = noir[y0:y1+1, x0:x1+1]
    return (x0 + bande(h.T), y0 + bande(h),
            x1 - bande(h.T[::-1]), y1 - bande(h[::-1]))

def matiere(im):
    """Ce qui est pose sur le plateau, par la teinte."""
    R, G, B = im[:, :, 0], im[:, :, 1], im[:, :, 2]
    chaud = (R - B >= 7) & (R - B <= 26) & (R > 140)
    rouge = (R - G > 40) & (R - B > 40)
    bleu = (B - R > 25) & (B - G > 0)
    blanc = (R > 243) & (G > 243) & (B > 243)
    vide = chaud | rouge | bleu
    voisin = np.zeros_like(vide)
    for dy in (-4, 0, 4):
        for dx in (-4, 0, 4):
            voisin |= np.roll(np.roll(vide, dy, 0), dx, 1)
    return ~(vide | (blanc & voisin))


def densite(m, k):
    p = np.pad(m.astype(np.int32), k + 1)
    c = p.cumsum(0).cumsum(1)
    n = 2 * k + 1
    h, w = m.shape
    return (c[n:n+h, n:n+w] - c[0:h, n:n+w] - c[n:n+h, 0:w] + c[0:h, 0:w]) / (n * n)


def masse(chemin, pas=PAS):
    """La matiere de la page, ramenee a la grille en pouces du plateau."""
    im = np.array(Image.open(chemin).convert('RGB')).astype(int)
    x0, y0, x1, y1 = jeu(im)
    sous = im[y0:y1+1, x0:x1+1]
    d = densite(matiere(sous), 3) > 0.60
    H, W = d.shape
    nx, ny = int(W_PO / pas), int(H_PO / pas)
    ix = np.clip(((np.arange(nx) + 0.5) / nx * W).astype(int), 0, W - 1)
    iy = np.clip(((np.arange(ny) + 0.5) / ny * H).astype(int), 0, H - 1)
    return d[np.ix_(iy, ix)], (x0, y0, x1, y1)


# ----------------------------------------------------------- nos emprises
def layouts():
    js = ('const fs=require("fs");'
          'const s=fs.readFileSync(%r,"utf8");'
          'const L=new Function(s+"; return LAYOUTS;")();'
          'console.log(JSON.stringify(L));' % os.path.join(RACINE, 'layouts.js'))
    return json.loads(subprocess.run(['node', '-e', js],
                                     capture_output=True, text=True).stdout)


def poser(gab, d, out, prof=0):
    """Le meme geste que plateau.js : contour local, miroir, rotation
       horaire, translation ; puis les elements portes."""
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

    out.append((g.get('k', 'a'), [loc(q) for q in g['p']]))
    for f in g.get('f', []):
        poser(gab, {'g': f['g'], 'p': loc(f['p']),
                    'r': d.get('r', 0) + f.get('r', 0) * (-1 if d.get('m') else 1),
                    'm': d.get('m')}, out, prof + 1)


def rasterise(poly, nx, ny, pas):
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


def emprise(gab, v, pas=PAS, quoi='a'):
    nx, ny = int(W_PO / pas), int(H_PO / pas)
    u = np.zeros((ny, nx), bool)
    poses = []
    for d in v.get('t', []):
        poser(gab, d, poses)
    for k, poly in poses:
        if quoi == 'tout' or k == quoi:
            u |= rasterise(poly, nx, ny, pas)
    return u


# ------------------------------------------------------------------ sortie
def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    dossier = sys.argv[1]
    planches = None
    if '--planches' in sys.argv:
        planches = sys.argv[sys.argv.index('--planches') + 1]
        os.makedirs(planches, exist_ok=True)
    pages = sorted(glob.glob(os.path.join(dossier, 'p*.png')))
    if not pages:
        print('aucune page pNN.png dans', dossier)
        return 1
    L = layouts()
    gab = L.get('gab', {})
    carnet = json.load(open(os.path.join(RACINE, 'outils', 'cartes.json')))

    variantes = []
    for mid, mu in L['matchups'].items():
        for lettre in 'abc':
            v = mu['v'].get(lettre)
            if v:
                variantes.append((mu['p1'], mu['p2'], lettre,
                                  emprise(gab, v), emprise(gab, v, quoi='tout')))

    print('%-5s %-42s %7s %7s %8s' % ('page', 'carte', 'posé', 'rendu', '2e carte'))
    print('─' * 76)
    seuls = exaequo = rates = 0
    poses, rendus, litiges = [], [], []
    ECART = 0.01
    for p in pages:
        cle = os.path.basename(p)[1:3]
        m, boite = masse(p)
        c = carnet.get(cle)
        notes = []
        for (p1, p2, lettre, u, tout) in variantes:
            notes.append(((u & m).sum() / max(u.sum(), 1), p1, p2, lettre, u, tout))
        notes.sort(key=lambda x: -x[0])
        paire = lambda x: (c and x[3] == c['agencement'] and
                           {x[1], x[2]} == {c['p1'], c['p2']})
        sienne = next((x for x in notes if paire(x)), None)
        best = notes[0]
        if sienne is None:
            print('%-5s %-42s   (page inconnue du carnet)' % (cle, '?'))
            continue
        rang = notes.index(sienne)
        pose = sienne[0]
        rendu = (sienne[5] & m).sum() / max(m.sum(), 1)
        poses.append(pose); rendus.append(rendu)
        rival = notes[1] if rang == 0 else best
        second = rival[0]
        if rang == 0 and second < pose - ECART:
            seuls += 1
            note = ''
        elif abs(second - pose) <= ECART:
            exaequo += 1
            note = '   = %s / %s %s' % (rival[1][:12], rival[2][:12], rival[3])
            litiges.append('%s ≡ %s/%s %s' % (cle, rival[1][:12], rival[2][:12], rival[3]))
        else:
            rates += 1
            note = '   ← %de' % (rang + 1)
        print('%-5s %-42s %7.3f %7.3f %8.3f%s' % (
            cle, '%s / %s %s' % (c['p1'][:16], c['p2'][:16], c['agencement']),
            pose, rendu, second, note))

        if planches:
            im = Image.open(p).convert('RGB').crop((boite[0], boite[1], boite[2]+1, boite[3]+1))
            SX, SY = im.size[0] / W_PO, im.size[1] / H_PO
            dr = ImageDraw.Draw(im, 'RGBA')
            mu = next(mu for mu in L['matchups'].values()
                      if {mu['p1'], mu['p2']} == {c['p1'], c['p2']})
            liste = []
            for d in mu['v'][c['agencement']]['t']:
                poser(gab, d, liste)
            for k, poly in liste:
                dr.polygon([(q[0]*SX, q[1]*SY) for q in poly],
                           outline=(255, 0, 255, 255) if k == 'a' else (0, 170, 255, 255),
                           width=3)
            im.save(os.path.join(planches, 'p%s.png' % cle))

    print('─' * 76)
    print('  posé   médian %.3f   pire %.3f' % (np.median(poses), min(poses)))
    print('  rendu  médian %.3f' % np.median(rendus))
    total = seuls + exaequo + rates
    print('  %d pages sur %d reconnaissent leur carte seule' % (seuls, total))
    if exaequo:
        print('  %d ex æquo, agencements que le document dessine a l\'identique :' % exaequo)
        print('    ' + ', '.join(litiges))
    if rates:
        print('  %d page(s) reconnaissent une AUTRE carte' % rates)
    return 0 if rates == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
