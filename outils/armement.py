#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
L'ARMEMENT D'UNE FICHE : CE QUI EST D'OFFICE, CE QUI SE CHOISIT

Jusqu'ici, seule la table nécrone portait ARMEMENT, écrite à la main.
Les vingt-huit autres factions sortaient de l'extraction avec une table
vide, et l'application en concluait que TOUTES les armes de la fiche
étaient portées d'office : un Shield-Captain tenait à la fois sa lance,
sa hache et sa lame, sans rien à choisir.

BSData dit pourtant ce qui se choisit. Une figurine (entrée `model`)
porte :
  · des armes d'office — une entrée d'arme obligatoire (min ≥ 1), ou un
    profil posé sur la figurine elle-même ;
  · des groupes de choix (selectionEntryGroup) — « Wargear », « Weapon 1 »
    — dont chaque enfant est une option, qui peut donner plusieurs armes
    à la fois (la lance pyrithite a un profil de tir et un de mêlée) ;
  · des armes facultatives (max ≥ 1 sans min) — un emplacement à prendre
    ou non.

Une escouade à figurines différentes — un sergent, des marines, un
porteur d'arme spéciale — se décrit avec deux champs de plus que la table
nécrone ne connaissait pas :
  · `nb` sur un emplacement : combien de figurines il couvre. Positif,
    c'est un nombre fixe (le sergent : 1) ; négatif, c'est « l'effectif
    moins tant » (les marines : tous sauf le sergent). Absent : toute
    l'unité, comme avant.
  · `nf` sur la fiche : combien d'exemplaires d'une arme D'OFFICE, avec
    la même convention. Le pistolet du sergent compte un, le fusil des
    marines l'effectif moins un.
Quand une escouade a plusieurs sortes de figurines « libres » — des
Intercessors et jusqu'à deux Intercessors lance-grenades — elles
deviennent les options d'un emplacement « Figurines », chacune plafonnée
par `omax` au nombre que la fiche autorise.

Ce qui reste approché, et qu'il faut savoir :
  · les plafonds qui dépendent de l'effectif (« 1 figurine sur 5 ») sont
    lus à l'effectif de base ; BSData les écrit en modificateurs, qu'on
    ne rejoue pas ;
  · deux emplacements tirés d'un même groupe « jusqu'à deux armes » ne
    s'interdisent pas de prendre deux fois la même.

Lancer :
    python3 outils/armement.py custodes          # réécrit ARMEMENT dans data-custodes.js
    python3 outils/armement.py --toutes          # toutes les factions générées
    python3 outils/armement.py custodes --voir "Shield-Captain"
============================================================
"""
import itertools, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extraction as X

# la puce de l'en-tête des fichiers générés
ENTETE = [
    "   · ARMEMENT est déduit de BSData par outils/armement.py : armes",
    "     d'office et emplacements de choix, sergent et armes spéciales",
    "     compris. Les plafonds qui dépendent de l'effectif (« 1 sur 5 »)",
    "     sont lus à l'effectif de base.",
]
ANCIENNE = ("   · ARMEMENT est vide : toutes les armes de la fiche comptent, il\n"
            "     n'y a pas de panachage. C'est faux pour les unités à choix\n"
            "     d'arme, et c'est signalé plutôt que deviné.\n")

# des branches qui ne sont l'armement de personne
HORS = X.HORS_FICHE | {'weapon upgrades', 'warlord', 'crusade relic upgrades'}

# ------------------------------------------------------------------
# l'arbre, liens résolus
# ------------------------------------------------------------------
def contraintes(n):
    """(min, max) par figurine parente : ce que BSData appelle scope
       « parent » sur le champ « selections ». None quand absent."""
    lo = hi = None
    for c in n.get('constraints', []) or []:
        if c.get('field') not in (None, 'selections'): continue
        if c.get('scope') not in ('parent', None): continue
        v = c.get('value')
        try: v = int(v)
        except (TypeError, ValueError): continue
        if c.get('type') == 'min': lo = v if lo is None else max(lo, v)
        if c.get('type') == 'max': hi = v if hi is None else min(hi, v)
    return lo, hi

def plafondUnite(n):
    """un plafond posé à l'échelle de l'unité — « max 2 (unit) » sur le
       lance-grenades — ou None"""
    hi = None
    for c in n.get('constraints', []) or []:
        if c.get('type') == 'max' and c.get('scope') == 'unit' and \
           c.get('field') in (None, 'selections'):
            try: v = int(c.get('value'))
            except (TypeError, ValueError): continue
            hi = v if hi is None else min(hi, v)
    return hi

class Ctx:
    def __init__(self, idx, interdits):
        self.idx, self.interdits = idx, interdits

def enfants(n, ctx):
    """Les entrées sous un nœud, liens suivis. Un lien porte ses propres
       contraintes : elles s'ajoutent à celles de la cible."""
    out = []
    for e in n.get('selectionEntries', []) or []:
        out.append(e)
    for g in n.get('selectionEntryGroups', []) or []:
        g = dict(g); g['_groupe'] = True
        out.append(g)
    for l in n.get('entryLinks', []) or []:
        t = ctx.idx.get(l.get('targetId'))
        if t is None or l.get('targetId') in ctx.interdits: continue
        c = dict(t)
        c['constraints'] = (t.get('constraints') or []) + (l.get('constraints') or [])
        c['_lien'] = l.get('id')
        if l.get('type') == 'selectionEntryGroup' or 'selectionEntries' in t and \
           t.get('type') is None and l.get('type') != 'selectionEntry':
            c['_groupe'] = True
        if l.get('name'): c['name'] = l.get('name') or t.get('name')
        out.append(c)
    return [e for e in out if X.cle(e.get('name')) not in HORS
            and not (e.get('type') == 'unit')]

def estGroupe(n):
    return bool(n.get('_groupe'))

def estConteneur(g, ctx):
    """un groupe sans contrainte dont les enfants portent les leurs"""
    if not estGroupe(g) or g.get('defaultSelectionEntryId'): return False
    if contraintes(g) != (None, None): return False
    ee = enfants(g, ctx)
    return any(estGroupe(e) or contraintes(e) != (None, None) for e in ee)

def profilsArme(n, ctx):
    """les profils d'arme posés sur ce nœud lui-même"""
    out = [p for p in n.get('profiles', []) or [] if X.estArme(p)]
    for l in n.get('infoLinks', []) or []:
        if l.get('type') == 'profile':
            p = ctx.idx.get(l.get('targetId'))
            if p and X.estArme(p): out.append(p)
    return out

def combosOption(n, ctx, prof=0):
    """Toutes les façons de prendre une option : ses profils, ceux de ses
       entrées obligatoires, et un choix dans chacun de ses groupes
       obligatoires. Le Nob prend « Kustom Choppa and Kombi-skorcha »,
       puis choisit son arme de mêlée ET son arme de tir dedans : une
       seule option côté groupe, six armements possibles."""
    combos = [list(profilsArme(n, ctx))]
    if prof > 5: return combos
    for e in enfants(n, ctx):
        lo, hi = contraintes(e)
        if estGroupe(e) and not estConteneur(e, ctx):
            if (lo or 0) >= 1:
                opts = optionsGroupe(e, ctx, prof + 1)
                if opts:
                    combos = [c + o[1] for c in combos for o in opts][:12]
        elif e.get('type') != 'model' and ((lo or 0) >= 1 or not e.get('constraints')):
            sous = combosOption(e, ctx, prof + 1)
            k = max(1, lo or 1)
            combos = [c + x * k for c in combos for x in sous][:12]
    return combos

def armesOption(n, ctx, prof=0):
    """ce qu'une option donne quand on la prend telle qu'elle vient"""
    return combosOption(n, ctx, prof)[0]

def optionsGroupe(g, ctx, prof=0):
    """[(nom, [profils], plafond)] — un groupe imbriqué dans un groupe
       verse ses options dans celles du parent. L'option par défaut passe
       en tête : c'est celle que l'éditeur prend d'abord."""
    out = []
    defaut = g.get('defaultSelectionEntryId')
    for e in enfants(g, ctx):
        if e.get('type') == 'model': continue
        if estGroupe(e) and prof < 4:
            out += optionsGroupe(e, ctx, prof + 1)
            continue
        lo, hi = contraintes(e)
        if hi == 0: continue
        cap = plafondUnite(e)
        prem = defaut and defaut in (e.get('id'), e.get('_lien'))
        items = [(e.get('name') or '', arm * max(1, lo or 1), cap)
                 for arm in combosOption(e, ctx, prof + 1)]
        if prem: out[0:0] = items
        else: out += items
    return out

# ------------------------------------------------------------------
# une figurine : ses armes d'office et ses emplacements
# ------------------------------------------------------------------
def lisFigurine(m, ctx):
    fixes = [(p, 1) for p in profilsArme(m, ctx)]
    slots = []
    a_voir = list(enfants(m, ctx))
    while a_voir:
        e = a_voir.pop(0)
        if e.get('type') == 'model': continue
        lo, hi = contraintes(e)
        if estConteneur(e, ctx):
            # « Wargear » sans contrainte n'est pas un choix : un carton
            # qui range les armes d'office et les vrais groupes de choix
            a_voir = list(enfants(e, ctx)) + a_voir
            continue
        if estGroupe(e):
            opts = [o for o in optionsGroupe(e, ctx)]
            if not any(o[1] for o in opts): continue
            if len(opts) == 1 and (lo or 0) >= 1:
                fixes += [(p, 1) for p in opts[0][1]]
                continue
            k = hi if hi and hi > 1 else 1
            k = min(k, len(opts))
            for j in range(k):
                slots.append(dict(min=1 if j < (lo or 0) else 0, opts=opts))
        else:
            arm = armesOption(e, ctx)
            if not arm: continue
            if hi == 0: continue
            if (lo or 0) >= 1 or not e.get('constraints'):
                n = lo or 1
                fixes += [(p, n) for p in arm]
            else:
                slots.append(dict(min=0, opts=[(e.get('name') or '', arm, plafondUnite(e))]))
    return dict(fixes=fixes, slots=slots)

def contientFigurine(n, ctx, prof=0):
    if prof > 4: return False
    return any(e.get('type') == 'model' or contientFigurine(e, ctx, prof + 1)
               for e in enfants(n, ctx))

def figurines(racine, ctx):
    """[(noeud, min, max)] : les sortes de figurines de la fiche. Une
       fiche sans entrée `model` est sa propre figurine."""
    out = []
    def descend(n, prof=0):
        for e in enfants(n, ctx):
            if e.get('type') == 'model':
                lo, hi = contraintes(e)
                if hi == 0: continue
                out.append((e, lo or 0, hi if hi is not None else (lo or 1)))
            elif prof < 5 and contientFigurine(e, ctx):
                # Une composition au choix — « 1 sergent et 9 soldats »
                # ou « ... et 19 » — ne se descend que par son option par
                # défaut : additionner les deux doublerait l'escouade.
                ee = [x for x in enfants(e, ctx) if contientFigurine(x, ctx)
                      or x.get('type') == 'model']
                lo, hi = contraintes(e)
                if estGroupe(e) and hi == 1 and len(ee) > 1 and \
                   all(x.get('type') != 'model' for x in ee):
                    d = e.get('defaultSelectionEntryId')
                    choisi = next((x for x in ee if d in (x.get('id'), x.get('_lien'))), ee[0])
                    descend(choisi, prof + 1)
                else:
                    descend(e, prof + 1)
    if racine.get('type') == 'model':
        return [(racine, 1, 1)]
    descend(racine)
    return out or [(racine, 1, 1)]

# ------------------------------------------------------------------
# vers les indices de WEAPONS
# ------------------------------------------------------------------
def indexeur(armes):
    """armes : la liste des [nom, genre] de l'unité, dans l'ordre de
       WEAPONS. Renvoie profil BSData → indice."""
    def trouve(p):
        nom = (p.get('name') or '').strip()
        genre = 'C' if X.portee(X.car(p, 'Range')) == 'càc' else 'T'
        for i, (n, g) in enumerate(armes):
            if g != genre: continue
            if n == nom or n == nom + (' (tir)' if genre == 'T' else ' (càc)'):
                return i
        for i, (n, g) in enumerate(armes):
            if g == genre and X.cle(n) == X.cle(nom): return i
        return None
    return trouve

def uniq(xs):
    vus, out = set(), []
    for x in xs:
        if x is None or x in vus: continue
        vus.add(x); out.append(x)
    return out

def armement(racine, ctx, armes):
    """La ligne ARMEMENT d'une fiche, ou None quand tout est d'office et
       que chaque arme compte une fois par figurine (l'absence de ligne
       le dit déjà)."""
    trouve = indexeur(armes)
    idxs = lambda profs: uniq(trouve(p) for p in profs)
    def libelle(ii):
        vus = []
        for i in ii:
            b = re.sub(r'^➤\s*', '', armes[i][0])
            b = re.sub(r'\s+-\s+.*$', '', b)
            b = re.sub(r'\s*\((tir|càc)\)$', '', b)
            if b not in vus: vus.append(b)
        return ' + '.join(vus)
    figs = figurines(racine, ctx)
    lues = [(lisFigurine(m, ctx), lo, hi, m.get('name') or '') for m, lo, hi in figs]

    def slotJs(sl, nb=None, qui=None):
        o, onom, omax = [], [], []
        for nom, profs, cap in sl['opts']:
            ii = idxs(profs)
            if ii in o: continue
            o.append(ii); onom.append(nom if not ii else ''); omax.append(cap or 0)
        if len(o) < 2 and sl['min'] >= 1: return None
        if not any(o): return None
        s = {'min': sl['min'], 'o': o}
        if any(omax): s['omax'] = omax
        if any(onom): s['onom'] = onom
        if nb is not None: s['nb'] = nb
        if qui: s['qui'] = qui
        return s

    # Une seule sorte de figurine : la forme de la table nécrone.
    if len(lues) == 1:
        F, lo, hi, _ = lues[0]
        f = idxs(p for p, n in F['fixes'])
        n = {}
        if hi <= 1:
            for p, k in F['fixes']:
                i = trouve(p)
                if i is not None and k > 1: n[i] = k
        s = []
        for sl in F['slots']:
            js = slotJs(sl)
            if js is None:
                # un groupe obligatoire à une seule option : d'office
                if sl['min'] >= 1 and sl['opts']:
                    f = uniq(f + idxs(sl['opts'][0][1]))
                continue
            s.append(js)
        if hi <= 1:
            # « 4 rayons de mort » : une option peut donner plusieurs
            # exemplaires de la même arme, à une figurine seule
            for sl in F['slots']:
                for _, profs, _ in sl['opts']:
                    for i in set(trouve(p) for p in profs):
                        k = sum(1 for p in profs if trouve(p) == i)
                        if i is not None and k > 1: n[i] = max(n.get(i, 1), k)
        # une arme que rien ne place reste d'office : mieux vaut la montrer
        # en trop que la perdre
        places = set(f) | {i for x in s for o in x['o'] for i in o}
        f = f + [i for i in range(len(armes)) if i not in places]
        if not s and not n and set(f) == set(range(len(armes))): return None
        row = {'f': f, 's': s}
        if n: row['n'] = n
        return row

    # Plusieurs sortes : les figurines « fixes » (min = max, le sergent)
    # et les « libres », qui se partagent le reste de l'effectif.
    fixesT = [x for x in lues if x[1] == x[2] and x[1] > 0]
    libres = [x for x in lues if not (x[1] == x[2] and x[1] > 0)]
    nfix = sum(x[1] for x in fixesT)
    compte = {}          # indice → (exemplaires fixes, sur le reste ?)
    def ajoute(i, k, reste=False):
        a, r = compte.get(i, (0, False))
        compte[i] = (a + k, r or reste)
    s = []
    for F, lo, hi, nom in fixesT:
        for p, k in F['fixes']:
            i = trouve(p)
            if i is not None: ajoute(i, k * lo)
        for sl in F['slots']:
            js = slotJs(sl, nb=lo, qui=nom)
            if js: s.append(js)
            elif sl['min'] >= 1 and sl['opts']:
                for i in idxs(sl['opts'][0][1]): ajoute(i, lo)
    if libres:
        # Les armes que toutes les figurines libres portent d'office
        # sortent des options : elles se comptent sur le reste.
        jeux = [set(idxs(p for p, k in F['fixes'])) for F, _, _, _ in libres]
        communes = set.intersection(*jeux) if jeux else set()
        for i in sorted(communes): ajoute(i, 0, reste=True)
        if len(libres) == 1:
            F, lo, hi, nom = libres[0]
            for sl in F['slots']:
                js = slotJs(sl, nb=-nfix if nfix else None, qui=nom)
                if js: s.append(js)
                elif sl['min'] >= 1 and sl['opts']:
                    for i in idxs(sl['opts'][0][1]): ajoute(i, 0, reste=True)
        else:
            # La plus nombreuse d'abord : c'est l'armement de départ.
            libres.sort(key=lambda x: -x[2])
            opts, plafonds, noms = [], [], []
            for F, lo, hi, nom in libres:
                propres = [i for i in idxs(p for p, k in F['fixes']) if i not in communes]
                choix = [[o for o in sl['opts']] for sl in F['slots'] if sl['min'] >= 1]
                facult = [sl for sl in F['slots'] if sl['min'] < 1]
                combos = list(itertools.product(*choix)) if choix else [()]
                if len(combos) > 12: combos = combos[:12]
                for c in combos:
                    ii = uniq(propres + [i for o in c for i in idxs(o[1])])
                    opts.append(ii)
                    plafonds.append(hi if libres[0] is not (F, lo, hi, nom) and hi else 0)
                    # Une sorte de figurine à plusieurs armements dit
                    # lequel : « Nob : Power Klaw + Kombi-rokkit ».
                    noms.append(nom + ' : ' + libelle(ii) if len(combos) > 1 and ii else nom)
                for sl in facult:
                    js = slotJs(sl, nb=-nfix if nfix else None, qui=nom)
                    if js: s.append(js)
            # la première sorte n'a pas de plafond : elle prend le reste
            haut = max(x[2] for x in libres)
            plafonds = [0 if noms[k] == libres[0][3] or (plafonds[k] or 0) >= haut
                        else (plafonds[k] or 0) for k in range(len(opts))]
            o, om, on = [], [], []
            for k, ii in enumerate(opts):
                if ii in o:
                    # même armement, autre nom (le porteur de vox) : une
                    # seule option, et sans plafond si l'une n'en a pas
                    j = o.index(ii)
                    om[j] = 0 if not (om[j] and plafonds[k]) else max(om[j], plafonds[k])
                    continue
                o.append(ii); om.append(plafonds[k]); on.append(noms[k])
            sl = {'min': 1, 'o': o, 'qui': 'Figurines'}
            if any(om): sl['omax'] = om
            # une option, c'est une sorte de figurine : son nom la dit
            # mieux que la liste de ses armes
            sl['onom'] = on
            if nfix: sl['nb'] = -nfix
            if len(o) >= 2: s.insert(len([x for x in s if x.get('nb', 0) > 0]), sl)
            elif o: [ajoute(i, 0, reste=True) for i in o[0]]
    nf, f = {}, []
    for i, (k, reste) in compte.items():
        if reste and k == nfix: f.append(i)            # tout le monde
        elif reste: f.append(i); nf[i] = -(nfix - k)    # le reste, plus k
        else: f.append(i); nf[i] = k                     # seulement k
    f.sort()
    places = set(f) | {i for x in s for o in x['o'] for i in o}
    f += [i for i in range(len(armes)) if i not in places]
    row = {'f': f, 's': s}
    if nf: row['nf'] = {i: v for i, v in sorted(nf.items())}
    return row

# ------------------------------------------------------------------
# la faction entière
# ------------------------------------------------------------------
def armesDuFichier(chemin):
    """les [unité, nom, genre] de WEAPONS, lus dans le fichier livré"""
    src = open(chemin, encoding='utf-8').read()
    m = re.search(r'^const WEAPONS = \[\n(.*?)^\];', src, re.S | re.M)
    out = {}
    for ligne in m.group(1).splitlines():
        ligne = ligne.strip().rstrip(',')
        if not ligne.startswith('['): continue
        w = json.loads(ligne)
        out.setdefault(w[0], []).append((w[1], w[2]))
    return src, out

def tableFaction(faction, armesParUnite):
    cats = X.chargeBS(faction)
    idx = X.indexeRegles(cats)
    LF = X.fiches(cats, idx)
    interdits = {r['id'] for r, _ in LF if isinstance(r.get('id'), str)}
    T, vus = {}, set()
    for r, arbre in LF:
        nom = X.sansLegends(r.get('name'))
        if nom in vus or nom not in armesParUnite: continue
        vus.add(nom)
        ctx = Ctx(idx, interdits - {r.get('id')})
        row = armement(r, ctx, armesParUnite[nom])
        if row is not None: T[nom] = row
    return T

def ecritTable(T):
    L = ['const ARMEMENT = {']
    lignes = []
    for nom in sorted(T):
        lignes.append(' %s : %s' % (json.dumps(nom, ensure_ascii=False),
                                    json.dumps(T[nom], ensure_ascii=False)))
    L.append(',\n'.join(lignes))
    L.append('};')
    return '\n'.join(L)

def injecte(faction):
    chemin = os.path.join(X.RACINE, 'data-%s.js' % faction)
    src, armes = armesDuFichier(chemin)
    T = tableFaction(faction, armes)
    neuf = ecritTable(T)
    src2, k = re.subn(r'^const ARMEMENT = \{.*?^\};|^const ARMEMENT = \{\};', neuf.replace('\\', '\\\\'),
                      src, count=1, flags=re.S | re.M)
    if not k: sys.exit('ARMEMENT introuvable dans %s' % chemin)
    src2 = src2.replace(ANCIENNE, '\n'.join(ENTETE) + '\n')
    open(chemin, 'w', encoding='utf-8').write(src2)
    choix = sum(1 for r in T.values() if r['s'])
    print('%-18s %3d fiches avec un choix d\'arme, %3d lignes au total'
          % (faction, choix, len(T)))

def main():
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    if '--voir' in a:
        fac, nom = a[0], a[a.index('--voir') + 1]
        _, armes = armesDuFichier(os.path.join(X.RACINE, 'data-%s.js' % fac))
        T = tableFaction(fac, armes)
        for i, w in enumerate(armes.get(nom, [])): print('  %2d %s %s' % (i, w[1], w[0]))
        print(json.dumps(T.get(nom), ensure_ascii=False, indent=1))
        return
    facs = [f for f in X.FACTIONS if f != 'necrons'] if a[0] == '--toutes' else a
    for f in facs: injecte(f)

if __name__ == '__main__':
    main()
