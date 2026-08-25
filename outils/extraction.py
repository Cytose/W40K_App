#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
EXTRAIRE UNE FACTION DE BSDATA ET DU MUNITORUM

Deux sources, deux rôles, et elles ne se recouvrent pas :

- BSData/wh40k-11e   (JSON) — les fiches : profils, armes, aptitudes,
                              mots-clés, textes de règles. Pas de socles,
                              pas de stratagèmes, et un seul prix par
                              fiche, celui de l'effectif de base.
- BSData/wh40k-11e-mfm (YAML) — le Munitorum : les paliers de points par
                              effectif, les seuils de réquisition, les
                              détachements avec leurs PD, leur Disposition
                              de Force et leurs optimisations chiffrées,
                              et qui peut rejoindre qui.

Ce que ce script NE produit PAS, et qu'il faut savoir avant de lire sa
sortie : les socles (ils viennent du Base Size Guide, un PDF), les
stratagèmes (absents des deux sources), et toutes les tables qui
traduisent une règle en code pour le simulateur — APTIS_COND, AURAS_*,
OCTROIS_DETACH, STRAT_SIMU, MOMENTS. Celles-là ne se déduisent pas d'une
source : il faut lire chaque règle et décider ce qu'elle fait au calcul.
Elles sortent vides, et c'est honnête : le simulateur tournera sur les
caractéristiques nues.

Lancer :
    python3 outils/extraction.py custodes
    python3 outils/extraction.py necrons --sortie /tmp/etalon.js

Les sources sont attendues sous build/ (voir npm run sources).
============================================================
"""
import json, os, re, sys, unicodedata

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BSDATA = os.environ.get('BSDATA', os.path.join(RACINE, 'build', 'bsdata'))
MFM    = os.environ.get('MFM',    os.path.join(RACINE, 'build', 'mfm', 'data'))

# ------------------------------------------------------------------
# LES FACTIONS QU'ON SAIT EXTRAIRE
# cle : celle du registre de data.js. bs : le ou les catalogues BSData.
# mfm : le fichier du Munitorum. nom : ce que le sélecteur affiche.
# ------------------------------------------------------------------
# `guide` est l'en-tête de la faction dans le Base Size Guide, tel que
# outils/socles.py le relève. None quand le relevé ne la couvre pas : la
# faction sort alors sans socles, et le dit — le Plateau posera sur un
# socle par défaut plutôt que de mentir sur la place qu'elle prend.
FACTIONS = {
    'necrons':  dict(nom='Nécrons',          bs=['Necrons.json'],
                     mfm='necrons.yaml',     guide='NECRONS'),
    'custodes': dict(nom='Adeptus Custodes', bs=['Imperium - Adeptus Custodes.json'],
                     mfm='adeptus-custodes.yaml', guide='ADEPTUS CUSTODES'),
    'astra':    dict(nom='Astra Militarum',  bs=['Imperium - Astra Militarum.json',
                                                 'Imperium - Astra Militarum - Library.json'],
                     mfm='astra-militarum.yaml', guide='ASTRA MILITARUM'),
    'worldeaters': dict(nom='World Eaters',  bs=['Chaos - World Eaters.json'],
                        mfm='world-eaters.yaml', guide='WORLD EATERS'),
}

SOCLES_JSON = os.path.join(RACINE, 'outils', 'socles.json')

# ------------------------------------------------------------------
# LES NOMS QUE LE GUIDE N'ÉCRIT PAS COMME LES AUTRES SOURCES
# Le Base Size Guide nomme la boîte, BSData et le Munitorum nomment la
# fiche. Le plus souvent c'est le même nom ; quand ça ne l'est pas, il
# faut le dire ici, parce qu'aucune règle ne le devine — « Terminator
# Squad » et « Chaos Terminators » n'ont pas un mot en commun.
#
# Une entrée de cette table est un fait relevé à la main, pas une
# approximation : on ne l'ajoute qu'après avoir lu les deux sources.
# ------------------------------------------------------------------
ALIAS_SOCLE = {
    'worldeaters': {'Chaos Terminators': 'Terminator Squad'},
}

def chargeSocles(faction):
    """Le relevé du Base Size Guide pour cette faction, {figurine: socle}.
       Vide si le guide ne la couvre pas ou si le relevé manque : SOCLES
       sortira vide, et le Plateau posera sur un socle par défaut."""
    entete = FACTIONS[faction].get('guide')
    if not entete or not os.path.exists(SOCLES_JSON): return {}
    return json.load(open(SOCLES_JSON, encoding='utf-8')).get(entete, {})

# ==================================================================
# PARCOURS
# ==================================================================
def parcours(n, f):
    """Applique f à chaque objet de l'arbre."""
    if isinstance(n, dict):
        f(n)
        for v in n.values(): parcours(v, f)
    elif isinstance(n, list):
        for v in n: parcours(v, f)

def cueille(n, pred):
    out = []
    parcours(n, lambda x: out.append(x) if pred(x) else None)
    return out

def car(profil, nom):
    """Une caractéristique d'un profil, par son nom."""
    for ch in profil.get('characteristics', []):
        if ch.get('name') == nom:
            return (ch.get('$text') or ch.get('text') or '').strip()
    return ''

# ==================================================================
# NORMALISATION DES NOMS
# BSData écrit « C'tan Shard of the Deceiver », le Munitorum
# « C’Tan Shard Of The Deceiver » : apostrophe courbe, casse de titre.
# On rapproche sur une clé qui ignore les deux.
# ==================================================================
def cle(nom):
    s = unicodedata.normalize('NFKD', nom or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.replace('’', "'").replace('‘', "'")
    s = re.sub(r'\[legends\]', '', s, flags=re.I)
    s = re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()
    return s

def sansLegends(nom):
    """BSData suffixe le nom entre crochets — [Legends], [Crucible] — pour
       dire d'où vient la fiche. Le nom de la fiche, c'est ce qui reste."""
    return re.sub(r'\s*\[[^\]]*\]\s*', ' ', nom or '').strip()

# ==================================================================
# LECTURE DES CARACTÉRISTIQUES
# ==================================================================
def nombre(s, defaut=0):
    m = re.search(r'-?\d+', str(s or ''))
    return int(m.group(0)) if m else defaut

def cible(s):
    """« 2+ » → 2 ; « N/A » ou vide → 0."""
    m = re.match(r'\s*(\d+)\s*\+', str(s or ''))
    return int(m.group(1)) if m else 0

def pa(s):
    """BSData écrit la PA en négatif ; l'application la garde en positif."""
    return abs(nombre(s, 0))

def portee(s):
    s = (s or '').strip()
    if not s or s.lower() in ('melee', 'mêlée'): return 'càc'
    return s

# ------------------------------------------------------------------
# LES MOTS-CLÉS D'ARME
# Vocabulaire fermé, relevé sur les quatre catalogues. Ce qui n'y est
# pas est rapporté en fin d'extraction plutôt que jeté en silence.
# ------------------------------------------------------------------
ANTI = {'infantry': 'inf', 'vehicle': 'veh', 'monster': 'mon',
        'character': 'perso', 'fly': 'vol'}

def drapeaux(kw, inconnus):
    out = []
    for mot in re.split(r',\s*', (kw or '').strip()):
        mot = mot.strip().strip('[]')
        if not mot or mot == '-': continue
        b = mot.lower()
        m = re.match(r'anti-(\w+)\s*(\d+)', b)
        if m:
            # Anti-X ne vaut QUE contre ce mot-clé. Un mot-clé que
            # l'application ne connaît pas (Anti-Psyker) sort sans
            # cible : l'écran le dit au lieu de le taire.
            genre = ANTI.get(m.group(1), '')
            out.append('anti:%s:%s' % (m.group(2), genre) if genre else 'anti:%s' % m.group(2))
            continue
        m = re.match(r'rapid fire (\w+)', b)
        if m: out.append('rf:' + m.group(1).upper().replace('D', 'D')); continue
        m = re.match(r'sustained hits (\w+)', b)
        if m: out.append('sust:' + m.group(1).upper()); continue
        m = re.match(r'melta (\d+)', b)
        if m: out.append('melta:' + m.group(1)); continue
        simple = {'lethal hits': 'lethal', 'devastating wounds': 'dev', 'blast': 'blast',
                  'torrent': 'torrent', 'twin-linked': 'twin', 'ignores cover': 'ignorescover',
                  'heavy': 'heavy', 'assault': 'assault', 'pistol': 'pistol',
                  'precision': 'precision', 'extra attacks': 'extra', 'lance': 'lance',
                  'hazardous': 'hazardous', 'indirect fire': 'indirect', 'one shot': 'oneshot',
                  'psychic': 'psychic'}
        if b in simple: out.append(simple[b]); continue
        inconnus.setdefault(mot, 0)
        inconnus[mot] += 1
    return ' '.join(out)

# ==================================================================
# LES CATÉGORIES
# CAT_ORDRE dit l'ordre de priorité ; on prend la première qui colle.
# ==================================================================

# L'ordre n'est pas celui de CAT_ORDRE, qui règle l'affichage. C'est un
# ordre de PRÉSÉANCE, relevé sur la table nécrone relue à la main : une
# fiche porte souvent plusieurs mots-clés, et c'est le plus spécifique
# qui la nomme. Le C'tan Transcendant est PERSONNAGE et MONSTRE, la table
# dit Monstre ; la Convergence est VÉHICULE et FORTIFICATION, la table dit
# Fortification. Le Chronomancien est PERSONNAGE et INFANTERIE, la table
# dit Personnage — donc Personnage passe avant Infanterie mais après
# Monstre.
CATEG = [('Epic Hero', 'Epic Hero'), ('Fortification', 'Fortification'),
         ('Monster', 'Monstre'), ('Character', 'Personnage'),
         ('Battleline', 'Battleline'), ('Swarm', 'Bête'), ('Beast', 'Bête'),
         ('Mounted', 'Monté'), ('Infantry', 'Infanterie'),
         ('Vehicle', 'Véhicule')]

def categorie(motscles):
    for en, fr in CATEG:
        if en in motscles: return fr
    return 'Autre'

# ==================================================================
# BSDATA : LES FICHES
# Une fiche est une entrée de sharedSelectionEntries qui porte un
# profil « Unit » quelque part sous elle.
# ==================================================================
def porteUnProfilUnit(n):
    return bool(cueille(n, lambda x: x.get('typeName') == 'Unit' and 'characteristics' in x))

# ------------------------------------------------------------------
# SUIVRE LES LIENS
# Une fiche ne porte pas tout son armement en propre. Les armes que
# plusieurs fiches partagent — « Close combat weapon », « Armoured
# bulk », les pouvoirs de C'tan — vivent dans sharedSelectionEntries et
# sont liées par entryLink. Sans les suivre, il manquait 54 armes sur
# 138 aux Nécrons : plus d'un tiers de l'armement, et pas au hasard —
# toutes les armes de corps à corps ordinaires.
#
# On ne suit un lien que vers une entrée qui NE PORTE PAS de profil
# Unit : sinon une fiche en avalerait une autre. Et on refuse par leur
# nom les greffons du mode Croisade, qui portent de vraies armes sans
# être l'armement de personne.
# ------------------------------------------------------------------
HORS_FICHE = {'crusade', 'warlord', 'detachment', 'detachments',
              'experience points', 'legendary veterans', 'weapon modifications',
              'battle traits', 'battle scars', 'crusade relics'}

def sousArbre(fiche, idx, interdits, vus=None, prof=0):
    """La fiche et tout ce qu'elle lie, à plat.

       `interdits` porte les identifiants des AUTRES fiches : on ne
       descend jamais dedans, sinon une fiche avalerait l'armement de sa
       voisine. Tout le reste se suit — y compris les entrées de figurine
       que l'Astra Militarum range à part et que ses fiches lient."""
    if vus is None: vus = set()
    out = [fiche]
    if prof > 6: return out
    # Les profils partagés. La bibliothèque de l'Astra Militarum ne pose
    # pas le profil sur la figurine : elle le range dans sharedProfiles
    # et le lie. Un « Shock Trooper » ne porte donc aucune
    # caractéristique en propre, et la fiche qui le compte n'en portait
    # pas non plus — d'où vingt-trois fiches jouables invisibles.
    for l in cueille(fiche, lambda x: x.get('targetId') and x.get('type') == 'profile'):
        p = idx.get(l['targetId'])
        if p is not None and 'characteristics' in p: out.append(p)
    for l in cueille(fiche, lambda x: x.get('targetId') and
                     x.get('type') in ('selectionEntry', 'selectionEntryGroup')):
        tid = l['targetId']
        if tid in vus or tid in interdits: continue
        vus.add(tid)
        c = idx.get(tid)
        if not c: continue
        if cle(c.get('name')) in HORS_FICHE or cle(l.get('name')) in HORS_FICHE: continue
        out.extend(sousArbre(c, idx, interdits, vus, prof + 1))
    return out

def chargeBS(faction):
    cats = []
    for f in FACTIONS[faction]['bs']:
        chemin = os.path.join(BSDATA, f)
        if not os.path.exists(chemin):
            sys.exit("catalogue BSData introuvable : %s\n"
                     "Récupère les sources : npm run sources" % chemin)
        cats.append(json.load(open(chemin, encoding='utf-8'))['catalogue'])
    return cats

def indexeRegles(cats):
    """id → nœud, pour résoudre les infoLinks vers les règles partagées."""
    idx = {}
    for c in cats:
        parcours(c, lambda n: idx.setdefault(n['id'], n) if isinstance(n.get('id'), str) else None)
    return idx

def propre(t):
    """BSData balise ses textes : ** pour le gras, ^^ autour des mots-clés
       de fiche. L'application affiche le texte tel quel — le balisage
       s'y lit donc en clair, « **^^Shield-Captain^^** model only ». On
       le retire, sans toucher aux mots eux-mêmes : ce sont les mots-clés
       officiels, et les perdre coûterait plus que de garder les
       astérisques."""
    t = (t or '').replace('**', '').replace('^^', '')
    t = t.replace('‑', '-')          # trait d'union insécable
    return re.sub(r'[ \t]+', ' ', t).strip()

def texteRegle(n):
    """Le texte d'une règle ou d'un profil d'aptitude."""
    if n.get('description'): return propre(n['description'])
    return propre(car(n, 'Description'))

def fiches(cats, idx):
    """Les fiches d'unité, et rien d'autre.

       Les catalogues ne se ressemblent pas. Les Nécrons et les Custodes
       posent chaque fiche entière dans sharedSelectionEntries, figurines
       comprises. L'Astra Militarum range ses FIGURINES à part — « Shock
       Trooper », « Shock Trooper Sergeant » sont des entrées racines de
       type `model` — et la fiche « Cadian Shock Troops », de type `unit`,
       les lie. Chercher un profil Unit dans le seul sous-arbre brut
       ratait donc 23 fiches jouables sur 72, dont les Cadiens et tous
       les Leman Russ : le fond de l'armée.

       On sépare donc en deux temps. Une racine de type `unit` est
       toujours une fiche. Une racine de type `model` en est une aussi —
       c'est ainsi que sont écrits les personnages — SAUF si une fiche
       la lie, auquel cas c'est une de ses figurines. """
    racines = [r for c in cats for r in c.get('sharedSelectionEntries', []) or []]
    parId = {r['id']: r for r in racines if isinstance(r.get('id'), str)}

    # Les figurines qu'une fiche lie ne sont pas des fiches. On les
    # recense en descendant depuis chaque fiche de type `unit`, en
    # traversant les entrées intermédiaires — l'Astra emboîte
    # selectionEntryGroups / selectionEntries / entryLinks, et s'arrêter
    # au premier niveau n'en trouvait que quatre sur la faction entière.
    composants = set()
    def descend(n, prof=0):
        if prof > 5: return
        for l in cueille(n, lambda x: x.get('targetId') and x.get('type') == 'selectionEntry'):
            t = parId.get(l['targetId'])
            if t is None or l['targetId'] in composants: continue
            if t.get('type') == 'model':
                composants.add(l['targetId'])
                descend(t, prof + 1)
    for r in racines:
        if r.get('type') == 'unit': descend(r)

    candidates = [r for r in racines
                  if r.get('type') == 'unit'
                  or (r.get('type') == 'model' and r.get('id') not in composants)]
    interdits = {r['id'] for r in candidates if isinstance(r.get('id'), str)}

    out = []
    for r in candidates:
        arbre = sousArbre(r, idx, interdits - {r.get('id')})
        if any(porteUnProfilUnit(n) for n in arbre):
            out.append((r, arbre))
    return out

def aptitudesDe(noeuds, idx):
    """Les aptitudes d'une fiche : ses profils Abilities, plus les règles
       partagées qu'elle lie. Le texte est celui du catalogue, en anglais :
       c'est la convention du dépôt, une règle mal traduite se paie en
       partie."""
    vues, out = set(), []
    for n in noeuds:
        for p in cueille(n, lambda x: x.get('typeName') == 'Abilities' and 'characteristics' in x):
            nom, t = (p.get('name') or '').strip(), texteRegle(p)
            if nom and t and nom not in vues:
                vues.add(nom); out.append([nom, t])
    for n in noeuds:
        for l in cueille(n, lambda x: x.get('type') == 'rule' and x.get('targetId')):
            r = idx.get(l['targetId'])
            if not r: continue
            nom, t = (r.get('name') or l.get('name') or '').strip(), texteRegle(r)
            if nom and t and nom not in vues:
                vues.add(nom); out.append([nom, t])
    return out

def estArme(p):
    """Un profil d'arme se reconnaît à ses caractéristiques, pas à son
       nom de type : les pouvoirs de C'tan sont rangés sous « C'tan
       Powers » et se tirent comme des armes."""
    if 'characteristics' not in p: return False
    noms = {c.get('name') for c in p['characteristics']}
    return {'A', 'S', 'AP', 'D'} <= noms

def armesDe(noeuds, inconnus):
    """Tous les profils d'arme de la fiche et de ce qu'elle lie,
       dédoublonnés par nom et par genre : la même arme revient sur
       chaque variante de figurine."""
    vues, out = set(), []
    profs = []
    for n in noeuds: profs.extend(cueille(n, estArme))
    for p in profs:
        nom = (p.get('name') or '').strip()
        genre = 'C' if portee(car(p, 'Range')) == 'càc' else 'T'
        if not nom or (nom, genre) in vues: continue
        vues.add((nom, genre))
        out.append([nom, genre,
                    car(p, 'A') or '1',
                    cible(car(p, 'BS') or car(p, 'WS')),
                    nombre(car(p, 'S'), 0),
                    pa(car(p, 'AP')),
                    car(p, 'D') or '1',
                    drapeaux(car(p, 'Keywords'), inconnus),
                    portee(car(p, 'Range'))])
    return out

def profilUnit(arbre):
    """Le profil de la fiche, et s'il en existe un AUTRE, différent.

       Une fiche porte un profil par variante de figurine. Le plus
       souvent ils sont identiques — les trois Gardes Custodiens ne
       diffèrent que par l'arme — et il n'y a rien à signaler. Ce qui
       compte, c'est le cas où ils diffèrent vraiment : le Roi Silencieux
       et ses deux Menhirs n'ont ni les mêmes PV ni la même Endurance, et
       c'est ce que COMPO encode à la main. Compter les profils au lieu
       de les comparer noyait ce cas-là sous cinq faux positifs."""
    ps = []
    for n in arbre: ps.extend(cueille(n, lambda x: x.get('typeName') == 'Unit'
                                      and 'characteristics' in x))
    if not ps: return None, False
    signature = lambda p: tuple(car(p, c) for c in ('M', 'T', 'Sv', 'InSv', 'W', 'OC', 'LD'))
    return ps[0], len({signature(p) for p in ps}) > 1

# ==================================================================
# LE MUNITORUM
# ==================================================================
def chargeMFM(faction):
    try:
        import yaml
    except ImportError:
        sys.exit("PyYAML manque : pip install pyyaml")
    chemin = os.path.join(MFM, FACTIONS[faction]['mfm'])
    if not os.path.exists(chemin):
        sys.exit("fichier Munitorum introuvable : %s\n"
                 "Récupère les sources : npm run sources" % chemin)
    return yaml.safe_load(open(chemin, encoding='utf-8'))

def rangDe(intervalle):
    """« [1,) » → 1, « [3,) » → 3 : le rang de copie à partir duquel ce
       barème s'applique."""
    m = re.match(r'\[(\d+)', str(intervalle or '[1,)'))
    return int(m.group(1)) if m else 1

def bareme(unite):
    """Rend (tailles, points) au format de UNITS. Un seul barème donne un
       objet ; plusieurs — les seuils de réquisition — donnent la forme
       [[rang, {…}], …] que baremePts() sait lire."""
    blocs = []
    for p in unite.get('pricing', []) or []:
        rang, table = rangDe(p.get('range')), {}
        for c in p.get('costs', []) or []:
            if c.get('models') is not None and c.get('points') is not None:
                table[str(c['models'])] = c['points']
        if table: blocs.append((rang, table))
    if not blocs: return [], {}
    blocs.sort(key=lambda x: x[0])
    tailles = sorted({int(k) for _, t in blocs for k in t})
    if len(blocs) == 1: return tailles, blocs[0][1]
    return tailles, [[r, t] for r, t in blocs]

# ==================================================================
# ÉCRITURE
# ==================================================================
def js(v, indent=0):
    """Un JSON qui se lit comme du JavaScript : guillemets doubles,
       apostrophes intactes, pas d'échappement Unicode."""
    return json.dumps(v, ensure_ascii=False)

def ligneUnite(u):
    return '[' + ','.join(js(x) for x in u) + ']'

def ecrit(faction, T, stats):
    F = FACTIONS[faction]
    L = []
    A = L.append
    A('/* ============================================================')
    A('   Données %s — Warhammer 40 000, 11e édition' % F['nom'])
    A('')
    A('   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l\'extracteur.')
    A('   Refait par : python3 outils/extraction.py %s' % faction)
    A('')
    A('   Sources : BSData/wh40k-11e pour les fiches, les armes et les')
    A('   textes d\'aptitudes ; BSData/wh40k-11e-mfm pour les points, les')
    A('   détachements et les rattachements.')
    A('')
    A('   Ce que ce fichier NE porte PAS, et qu\'il faut savoir avant de')
    A('   s\'y fier :')
    if T['SOCLES']:
        A('   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :')
        A('     %d fiches sur %d en ont un. Les autres — des Legends, que le'
          % (len(T['SOCLES']), len(T['UNITS'])))
        A('     guide ne liste pas — sont posées sur un socle par défaut.')
    else:
        A('   · SOCLES est vide — le relevé du Base Size Guide ne couvre pas')
        A('     cette faction. Le Plateau posera ses figurines sur un socle')
        A('     par défaut.')
    A('   · STRATS est vide — ni BSData ni le Munitorum ne portent les')
    A('     stratagèmes. Ils se saisissent à la main dans l\'application.')
    A('   · Les tables du simulateur — APTIS_COND, AURAS_ARMEE,')
    A('     AURAS_PERSO, OCTROIS_DETACH, STRAT_SIMU, MOMENTS, ABIMEES —')
    A('     sont vides. Elles traduisent une règle en code : aucune source')
    A('     ne les donne, il faut lire chaque règle et décider ce qu\'elle')
    A('     fait au calcul. Le simulateur tourne donc sur les')
    A('     caractéristiques nues pour cette faction.')
    A('   · ARMEMENT est vide : toutes les armes de la fiche comptent, il')
    A('     n\'y a pas de panachage. C\'est faux pour les unités à choix')
    A('     d\'arme, et c\'est signalé plutôt que deviné.')
    A('   · Les aptitudes et les optimisations sont EN ANGLAIS, texte du')
    A('     catalogue. C\'est la convention du dépôt : une règle mal')
    A('     traduite se paie en partie.')
    A('   ============================================================ */')
    A('(function(){')
    A('"use strict";')
    A('')

    A('/* UNITS : [nom, M, E, Svg, Invu, PV, tailles[], points, fnp, rôle,')
    A('   legends, notes, CO, Cd] */')
    A('const UNITS = [')
    A(',\n'.join('  ' + ligneUnite(u) for u in T['UNITS']))
    A('];')
    A('')
    A('/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */')
    A('const WEAPONS = [')
    A(',\n'.join('  ' + ligneUnite(w) for w in T['WEAPONS']))
    A('];')
    A('')
    A('/* CAT : [nom, catégorie principale] */')
    A('const CAT = [')
    A(',\n'.join('  ' + ligneUnite(c) for c in T['CAT']))
    A('];')
    A('')
    A('/* ATTACH : qui peut rejoindre qui, d\'après le Munitorum */')
    A('const ATTACH = ' + json.dumps(T['ATTACH'], ensure_ascii=False, indent=1) + ';')
    A('')
    A('/* APTITUDES : le texte du catalogue, en anglais */')
    A('const APTITUDES = ' + json.dumps(T['APTITUDES'], ensure_ascii=False, indent=1) + ';')
    A('')
    A('/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,')
    A('   0, nom français, Disposition de Force] */')
    A('const DETACHMENTS = [')
    A(',\n'.join('  ' + ligneUnite(d) for d in T['DETACHMENTS']))
    A('];')
    A('')
    A('/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */')
    A('const ENHANCEMENTS = [')
    A(',\n'.join('  ' + ligneUnite(e) for e in T['ENHANCEMENTS']))
    A('];')
    A('')
    A('/* KW : les mots-clés dont les règles de détachement se servent,')
    A('   déduits des catégories du catalogue */')
    A('const KW = ' + json.dumps(T['KW'], ensure_ascii=False, indent=1) + ';')
    A('')
    A('/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.')
    A('   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un')
    A('   modèle qui n\'a pas de socle à annoncer. */')
    A('const SOCLES = ' + json.dumps(T['SOCLES'], ensure_ascii=False, indent=1) + ';')
    A('')
    A('const TRANSPORTS = ' + json.dumps(T['TRANSPORTS'], ensure_ascii=False, indent=1) + ';')
    A('const FACTION = ' + json.dumps(T['FACTION'], ensure_ascii=False, indent=1) + ';')
    A('')
    A('/* Vides, et pour de bonnes raisons : voir l\'en-tête. */')
    for nom in ['ARMEMENT', 'STRAT_SIMU', 'APTIS_CIBLE', 'RETINUE', 'ENH_ANCIENS',
                'GRPN', 'STRATS', 'MOMENTS', 'MOMENTS_ARMEE', 'COMPO',
                'ROLES_UNITE', 'OCTROIS_DETACH', 'APTIS_UNITE', 'APTIS_COND',
                'AURAS_ARMEE', 'ABIMEES', 'AURAS_PERSO']:
        vide = '[]' if nom in ('STRAT_SIMU', 'STRATS', 'MOMENTS_ARMEE', 'AURAS_ARMEE') else '{}'
        A('const %s = %s;' % (nom, vide))
    A('')
    A('enregistreFaction({')
    A('  cle : %s,' % js(faction))
    A('  nom : %s,' % js(F['nom']))
    A('  tables : {')
    A('    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,')
    A('    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,')
    A('    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,')
    A('    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,')
    A('    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO')
    A('  }')
    A('});')
    A('})();')
    return '\n'.join(L) + '\n'

# ==================================================================
# L'EXTRACTION
# ==================================================================
def extrait(faction):
    cats = chargeBS(faction)
    mfm = chargeMFM(faction)
    idx = indexeRegles(cats)
    inconnus = {}

    # le Munitorum, indexé par nom normalisé
    MU = {}
    for u in mfm.get('units', []) or []:
        MU[cle(u.get('name'))] = u

    UNITS, WEAPONS, CAT, APTITUDES, ATTACH, TRANSPORTS = [], [], [], {}, {}, {}
    sansPrix, multiProfil, horsMFM = [], [], []

    LF = fiches(cats, idx)
    for f, arbre in LF:
        nom = sansLegends(f.get('name'))
        p, profilsDifferents = profilUnit(arbre)
        if not p: continue
        if profilsDifferents: multiProfil.append(nom)

        mots = []
        for n in arbre:
            mots += [c.get('name') for c in cueille(n, lambda x: 'targetId' in x
                                                    and 'name' in x and x.get('type') is None)]
            mots += [c.get('name') for c in n.get('categoryLinks', []) or []]
        mots = [m for m in mots if m]

        # Une fiche absente du Munitorum ne se joue pas : elle n'a pas de
        # prix. Ce sont les entrées de modes annexes — le Crucible ouvre
        # à un personnage l'armurerie entière, ce qui lui collait
        # trente-trois armes qui ne sont l'armement de personne. On les
        # écarte, en les nommant.
        u = MU.get(cle(nom))
        if u is None:
            horsMFM.append(nom)
            continue
        tailles, points = bareme(u)
        legends = 1 if u.get('legends') else 0
        role = 'Meneur' if u.get('role') == 'leader' else ('Appui' if u.get('role') == 'support' else '')
        if not tailles: sansPrix.append(nom); tailles, points = [1], {'1': 0}

        invu = cible(car(p, 'InSv'))
        UNITS.append([nom, nombre(car(p, 'M'), 0), nombre(car(p, 'T'), 0),
                      cible(car(p, 'Sv')), invu, nombre(car(p, 'W'), 1),
                      tailles, points, 0, role, legends, '',
                      nombre(car(p, 'OC'), 0), car(p, 'LD') or ''])

        CAT.append([nom, categorie(mots)])
        # Une arme qui porte le même nom en tir et en corps à corps — le
        # Sceptre de Lumière, le Bâton d'Alliance — se distingue par un
        # suffixe, comme le fait la table nécrone. Sans lui, la fiche
        # d'unité affiche deux lignes du même nom et rien ne dit laquelle
        # est laquelle.
        armes = armesDe(arbre, inconnus)
        doubles = {a[0] for a in armes if sum(1 for b in armes if b[0] == a[0]) > 1}
        for a in armes:
            if a[0] in doubles: a[0] += ' (tir)' if a[1] == 'T' else ' (càc)'
            WEAPONS.append([nom] + a)
        ap = aptitudesDe(arbre, idx)
        if ap: APTITUDES[nom] = ap
        for n in arbre:
            for t in cueille(n, lambda x: x.get('typeName') == 'Transport'):
                c = car(t, 'Capacity')
                if c: TRANSPORTS[nom] = c

    # qui rejoint qui — le Munitorum le dit, la règle Leader n'a pas à être relue
    for u in mfm.get('units', []) or []:
        att = u.get('attachTo') or []
        if not att: continue
        porteur = next((x[0] for x in UNITS if cle(x[0]) == cle(u['name'])), None)
        if not porteur: continue
        cibles = []
        for a in att:
            v = next((x[0] for x in UNITS if cle(x[0]) == cle(a)), None)
            if v: cibles.append(v)
        if cibles: ATTACH[porteur] = sorted(cibles)

    # ------------------------------------------------------------------
    # LES DÉTACHEMENTS
    # Le Munitorum donne les chiffres — PD, Disposition de Force, tag
    # unique, coût des optimisations. BSData donne les textes, mais pas
    # là où on les cherche d'abord : sa règle ne porte PAS le nom du
    # détachement (« Awakened Dynasty » a pour règle « Command
    # Protocols »). Le rapprochement passe par l'entrée « Detachment »,
    # qui liste un détachement par entrée, chacune liant sa règle.
    # ------------------------------------------------------------------
    reglesDetach = {}
    for c in cats:
        for racine in c.get('sharedSelectionEntries', []) or []:
            if cle(racine.get('name')) not in ('detachment', 'detachments'): continue
            for e in cueille(racine, lambda x: x.get('name') and x.get('type') == 'upgrade'):
                for l in (e.get('infoLinks') or []):
                    r = idx.get(l.get('targetId'))
                    if r and texteRegle(r):
                        reglesDetach[cle(e['name'])] = r
                        break

    # les textes d'optimisation, indexés une fois : les chercher dans
    # l'arbre entier pour chacune des quarante coûtait une minute
    txtAptis = {}
    for c in cats:
        for p in cueille(c, lambda x: x.get('typeName') == 'Abilities' and x.get('name')):
            k = cle(p['name'])
            if k not in txtAptis and texteRegle(p): txtAptis[k] = texteRegle(p)

    def titre(s):
        """Le Munitorum imprime la Disposition en capitales — « TAKE AND
           HOLD ». L'application l'écrit comme le MFM papier l'imprime."""
        p = [m for m in re.split(r'\s+', (s or '').strip()) if m]
        return ' '.join(m.capitalize() if m.lower() not in ('and', 'the', 'of') else m.lower()
                        for m in p)

    DETACHMENTS, ENHANCEMENTS = [], []
    for d in mfm.get('detachments', []) or []:
        nom = d.get('name') or ''
        r = reglesDetach.get(cle(nom))
        nomRegle, txt = (r.get('name') or '', texteRegle(r)) if r else ('', '')
        DETACHMENTS.append([nom, d.get('dp') or 0, d.get('unique') or '',
                            nomRegle, txt, '', 0, '', titre(d.get('objective'))])
        for e in d.get('enhancements', []) or []:
            en = e.get('name') or ''
            ENHANCEMENTS.append([en, e.get('points') or 0, nom,
                                 txtAptis.get(cle(en), ''), None])

    # KW : ce dont une règle de détachement a besoin pour désigner un genre
    KW = {}
    for genre, fr in [('vehicle', 'Véhicule'), ('monster', 'Monstre'),
                      ('battleline', 'Battleline'), ('epic', 'Epic Hero'),
                      ('infantry', 'Infanterie'), ('character', 'Personnage')]:
        KW[genre] = sorted(n for n, c in CAT if c == fr)

    # ------------------------------------------------------------------
    # LA RÈGLE D'ARMÉE
    # Elle s'annonce : son texte commence par « If your Army Faction
    # is… ». C'est la formule que GW emploie pour ce qui vaut à l'armée
    # entière, et elle est plus sûre que de compter les liens — la
    # « Voix du Commandement » de l'Astra Militarum n'est liée que par
    # ses officiers, et le comptage la manquait.
    # ------------------------------------------------------------------
    faction_regle = []
    for c in cats:
        for r in (c.get('sharedRules') or []):
            t = texteRegle(r)
            if re.match(r'if your army faction is', t, re.I):
                faction_regle = [[r.get('name') or '', t]]
                break
        if faction_regle: break

    # à défaut : la règle partagée que la moitié des fiches lient
    liees = {}
    for f, arbre in LF:
        vus = set()
        for n in arbre:
            for l in cueille(n, lambda x: x.get('type') == 'rule' and x.get('targetId')):
                vus.add(l['targetId'])
        for t in vus: liees[t] = liees.get(t, 0) + 1
    if not faction_regle and liees and UNITS:
        tid, n = max(liees.items(), key=lambda kv: kv[1])
        if n >= max(3, len(UNITS) // 2):
            r = idx.get(tid)
            if r: faction_regle = [[r.get('name') or '', texteRegle(r)]]

    # ------------------------------------------------------------------
    # LES SOCLES
    # Le guide nomme des figurines, l'application nomme des unités, et
    # les deux ne s'écrivent pas pareil — « Tomb Blade » contre « Tomb
    # Blades ». On rapproche sur la clé normalisée, et on compte ce qui
    # ne tombe pas : un socle manquant ne casse rien, il fait poser sur
    # un socle par défaut, donc il doit se voir ici plutôt qu'à l'écran.
    guide = chargeSocles(faction)
    parCle = {cle(k): v for k, v in guide.items()}
    alias = ALIAS_SOCLE.get(faction, {})
    SOCLES, sansSocle = {}, []
    for u in UNITS:
        t = parCle.get(cle(alias.get(u[0], u[0])))
        if t: SOCLES[u[0]] = t
        else: sansSocle.append(u[0])

    UNITS.sort(key=lambda x: x[0])
    WEAPONS.sort(key=lambda x: (x[0], x[2] != 'T', x[1]))
    CAT.sort(key=lambda x: x[0])

    T = dict(UNITS=UNITS, WEAPONS=WEAPONS, CAT=CAT, ATTACH=ATTACH,
             APTITUDES=APTITUDES, DETACHMENTS=DETACHMENTS,
             ENHANCEMENTS=ENHANCEMENTS, KW=KW, TRANSPORTS=TRANSPORTS,
             FACTION=faction_regle, SOCLES=SOCLES)
    stats = dict(inconnus=inconnus, sansPrix=sansPrix, horsMFM=horsMFM,
                 multiProfil=multiProfil, sansSocle=sansSocle,
                 guide=len(guide))
    return T, stats

def main():
    if len(sys.argv) < 2 or sys.argv[1] not in FACTIONS:
        sys.exit("usage : python3 outils/extraction.py <%s> [--sortie fichier]"
                 % '|'.join(FACTIONS))
    faction = sys.argv[1]
    sortie = os.path.join(RACINE, 'data-%s.js' % faction)
    if '--sortie' in sys.argv: sortie = sys.argv[sys.argv.index('--sortie') + 1]

    T, stats = extrait(faction)
    open(sortie, 'w', encoding='utf-8').write(ecrit(faction, T, stats))

    jouables = [u for u in T['UNITS'] if not u[10]]
    print('%s → %s' % (FACTIONS[faction]['nom'], os.path.relpath(sortie, RACINE)))
    print('  %d fiches (%d jouables, %d Legends)' %
          (len(T['UNITS']), len(jouables), len(T['UNITS']) - len(jouables)))
    print('  %d profils d\'armes, %d unités avec aptitudes, %d rattachements' %
          (len(T['WEAPONS']), len(T['APTITUDES']), len(T['ATTACH'])))
    print('  %d détachements, %d optimisations, %d transports' %
          (len(T['DETACHMENTS']), len(T['ENHANCEMENTS']), len(T['TRANSPORTS'])))
    print('  %d socles sur %d fiches%s'
          % (len(T['SOCLES']), len(T['UNITS']),
             '' if not stats['guide'] else
             '   (relevé du guide : %d figurines)' % stats['guide']))
    if T['FACTION']: print('  règle d\'armée : %s' % T['FACTION'][0][0])
    else: print('  règle d\'armée : NON TROUVÉE')
    avecRegle = sum(1 for d in T['DETACHMENTS'] if d[4])
    avecTexte = sum(1 for e in T['ENHANCEMENTS'] if e[3])
    print('  détachements avec le texte de leur règle : %d sur %d%s'
          % (avecRegle, len(T['DETACHMENTS']),
             '' if avecRegle == len(T['DETACHMENTS'])
             else "   ← BSData ne les porte pas pour cette faction"))
    print('  optimisations avec leur texte : %d sur %d'
          % (avecTexte, len(T['ENHANCEMENTS'])))

    if stats['horsMFM']:
        print('\n  %d fiches absentes du Munitorum, donc sans points :'
              % len(stats['horsMFM']))
        for n in stats['horsMFM']: print('    · ' + n)
    if stats['sansPrix']:
        print('\n  %d fiches du Munitorum sans barème lisible : %s'
              % (len(stats['sansPrix']), ', '.join(stats['sansPrix'])))
    if stats['multiProfil']:
        print('\n  %d fiches dont les figurines n\'ont PAS le même profil — seul le'
              '\n  premier est repris, la composition se saisit à la main :'
              % len(stats['multiProfil']))
        for n in stats['multiProfil']: print('    · ' + n)
    if stats['inconnus']:
        print('\n  mots-clés d\'arme non repris :')
        for k, v in sorted(stats['inconnus'].items(), key=lambda x: -x[1]):
            print('    · %-28s %d' % (k, v))

if __name__ == '__main__':
    main()
