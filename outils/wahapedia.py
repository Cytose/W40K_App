#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
LIRE L'EXPORT WAHAPEDIA

Trois choses manquaient à l'extraction, et aucune des deux sources
BSData ne les portait :

- les STRATAGÈMES. Ni le catalogue ni le Munitorum ne les contiennent.
  Les factions livrées sortaient donc avec un onglet Stratagèmes vide,
  à remplir à la main dans l'application, un texte à la fois.
- le TEXTE DES RÈGLES DE DÉTACHEMENT. Le Munitorum donne le nom du
  détachement, ses PD, sa Disposition de Force et ses optimisations
  chiffrées, mais pas ce que sa règle fait. BSData le porte pour les
  Nécrons et presque jamais ailleurs : 27 règles sur 28 manquaient
  chez l'Astra, les World Eaters et les Custodes.
- le TEXTE DE QUELQUES OPTIMISATIONS que BSData n'attache pas.

Wahapedia publie un export de ses tables. Ce module le lit ; il ne le
télécharge pas : le site le sert derrière une protection que le proxy
de ce dépôt ne franchit pas. On récupère les fichiers à la main depuis
https://wahapedia.ru/wh40k11ed/home/ (lien « Export data »), et on les
pose dans build/wahapedia/ :

    Stratagems.csv  Detachment_abilities.csv  Enhancements.csv
    Factions.csv    Last_update.csv

FORMAT. Ce ne sont pas des CSV : les champs sont séparés par « | », la
ligne se termine par un « | » de plus, l'en-tête porte une marque
d'ordre d'octets, et les descriptions contiennent du HTML ET des
retours à la ligne. Un enregistrement s'étale donc sur plusieurs
lignes, et on ne sait qu'il est fini qu'en comptant les séparateurs.
C'est ce que fait enregistrements(). Compter un séparateur de trop
recolle deux fiches en une, sans erreur et sans bruit : sur 1661
stratagèmes on en lisait 830, tous faux. Le compte est donc écrit ici
une fois, et vérifié par outils/test-wahapedia.py.

CRÉDIT. Wahapedia demande qu'on le cite ; l'application le fait dans
son écran À propos, et l'en-tête de chaque fichier généré le répète.
============================================================
"""
import os, re, unicodedata

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIER = os.environ.get('WAHAPEDIA', os.path.join(RACINE, 'build', 'wahapedia'))

# Le code de faction de Wahapedia, pour chaque clé du registre de data.js.
CODES = {'necrons': 'NEC', 'astra': 'AM', 'worldeaters': 'WE', 'custodes': 'AC'}

# Les quatre familles de stratagèmes. C'est une liste close et c'est une
# étiquette d'interface, pas une règle : la traduire ne risque rien, et
# « Stratagème de Battle Tactic » se lisait mal.
TYPES = {
    'battle tactic':  'Tactique de Bataille',
    'strategic ploy': 'Ruse Stratégique',
    'epic deed':      'Fait Épique',
    'wargear':        'Équipement',
}

def dispo():
    """L'export est-il là ? On ne s'en passe pas en silence."""
    return os.path.isfile(os.path.join(DOSSIER, 'Stratagems.csv'))

def daté():
    f = os.path.join(DOSSIER, 'Last_update.csv')
    if not os.path.isfile(f): return ''
    l = open(f, encoding='utf-8-sig').read().split('\n')
    return l[1].strip(' |') if len(l) > 1 else ''

def enregistrements(nom):
    """Les lignes d'un fichier de l'export, en dictionnaires.

       Un enregistrement se termine par un « | » et en compte autant que
       l'en-tête a de colonnes moins une — l'en-tête finit lui aussi par
       un séparateur, ce qui lui donne une dernière colonne vide qui
       n'existe pas. Tant que le compte n'y est pas, la ligne suivante
       appartient au même enregistrement : c'est une description qui
       contient un retour à la ligne."""
    chemin = os.path.join(DOSSIER, nom)
    if not os.path.isfile(chemin): return []
    texte = open(chemin, encoding='utf-8-sig').read().replace('\r\n', '\n').replace('\r', '\n')
    lignes = texte.split('\n')
    entete = lignes[0].split('|')
    if entete and entete[-1] == '': entete = entete[:-1]
    n = len(entete)
    out, buf = [], ''
    for l in lignes[1:]:
        if not buf and not l.strip(): continue
        buf = l if not buf else buf + '\n' + l
        if buf.endswith('|') and buf.count('|') >= n:
            out.append(dict(zip(entete, buf.split('|'))))
            buf = ''
    return out

# ------------------------------------------------------------------
# LE HTML
# ------------------------------------------------------------------
def propre(html, puces=True):
    """Le texte lisible d'une description.

       Wahapedia balise ses textes : <b> pour les intertitres, <br> pour
       les paragraphes, <span class="kwb"> autour des mots-clés, <ul><li>
       pour les listes à puces. L'application affiche ses règles en une
       seule chaîne ; on met donc tout à plat, et on garde la puce « ▪ »,
       qui est la convention du fichier nécron tenu à la main."""
    t = html or ''
    t = re.sub(r'<li[^>]*>', ' ▪ ' if puces else ' ', t)
    t = re.sub(r'<br\s*/?>', ' ', t)
    t = re.sub(r'</(p|div|ul|ol|li)>', ' ', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = (t.replace('&nbsp;', ' ').replace('&emsp;', ' ')
          .replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
          .replace('&quot;', '"').replace('&#39;', "'"))
    t = t.replace('‑', '-')
    t = re.sub(r'\s+', ' ', t).strip()
    return re.sub(r'^▪\s*(?=[^▪]*$)', '', t).strip()   # une seule puce n'en est pas une

def sections(html):
    """Découpe une description de stratagème en QUAND / CIBLE / EFFET /
       RESTRICTIONS. Wahapedia les annonce en gras et en capitales ; les
       intertitres rares — « ELIGIBLE IF », « AFTER MOVING » — restent
       collés à la section qu'ils suivent plutôt que d'être perdus."""
    m = list(re.finditer(r'<b>\s*(WHEN|TARGET|EFFECT|RESTRICTIONS?)\s*:\s*</b>', html or '',
                         re.I))
    if not m: return '', '', propre(html), ''
    part = {}
    for i, x in enumerate(m):
        fin = m[i + 1].start() if i + 1 < len(m) else len(html)
        k = x.group(1).upper().rstrip('S') if x.group(1).upper().startswith('RESTRICTION') \
            else x.group(1).upper()
        part[k] = (part.get(k, '') + ' ' + html[x.end():fin]).strip()
    return (propre(part.get('WHEN', '')), propre(part.get('TARGET', '')),
            propre(part.get('EFFECT', '')), propre(part.get('RESTRICTION', '')))

def famille(type_):
    """« Annihilation Legion – Strategic Ploy Stratagem » → « Ruse
       Stratégique ». Le nom du détachement précède parfois le type, et
       parfois le remplace : quand il le remplace, il n'y a pas de
       famille à annoncer."""
    t = re.sub(r'\s*Stratagem\s*$', '', (type_ or '').strip(), flags=re.I)
    t = t.split('–')[-1].split('-')[-1].strip() if ('–' in t or ' - ' in t) else t
    return TYPES.get(t.lower(), '')

def _cle(nom):
    s = unicodedata.normalize('NFKD', nom or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.replace('’', "'").replace('‘', "'")
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()

# ------------------------------------------------------------------
# CE QU'ON EN TIRE
# ------------------------------------------------------------------
def stratagemes(faction, detachements):
    """Les stratagèmes d'une faction, au format de STRATS :
       [nom, détachement, famille, PC, quand, cible, effet, restrictions].

       On ne garde que les détachements que le Munitorum reconnaît. Les
       autres sont ceux des Actions d'Abordage — « Tomb Ship Complement »,
       « Boarding Butchers » — un format à part que l'application ne joue
       pas, et les afficher dans la liste des stratagèmes disponibles
       serait un piège.

       Le nom du détachement est repris du Munitorum, pas de Wahapedia :
       c'est lui que porte DETACHMENTS, et l'onglet apparie les deux par
       égalité de chaîne."""
    code = CODES.get(faction)
    if not code: return []
    connus = {_cle(d): d for d in detachements}
    out = []
    for x in enregistrements('Stratagems.csv'):
        if x.get('faction_id') != code: continue
        det = connus.get(_cle(x.get('detachment')))
        if not det: continue
        quand, cible, effet, restric = sections(x.get('description'))
        if not effet: continue
        out.append([titre(x.get('name')), det, famille(x.get('type')),
                    int(re.sub(r'\D', '', x.get('cp_cost') or '0') or 0),
                    quand, cible, effet, restric])
    ordre = {d: i for i, d in enumerate(detachements)}
    out.sort(key=lambda s: (ordre.get(s[1], 99), s[0]))
    return out

def coeur():
    """Les stratagèmes de base de la 11e édition. Wahapedia les range
       sans faction ; deux jeux y cohabitent, celui de la 10e (type
       « Core Stratagem ») et celui de la 11e (« Core – … Stratagem »).
       On ne prend que le second, et on le dit."""
    out = []
    for x in enregistrements('Stratagems.csv'):
        if x.get('faction_id'): continue
        if not re.match(r'\s*core\s*[–-]', x.get('type') or '', re.I): continue
        quand, cible, effet, restric = sections(x.get('description'))
        if not effet: continue
        out.append([titre(x.get('name')), 'Core', famille(x.get('type')),
                    int(re.sub(r'\D', '', x.get('cp_cost') or '0') or 0),
                    quand, cible, effet, restric])
    out.sort(key=lambda s: s[0])
    return out

def reglesDetachement(faction):
    """{ nom de détachement (clé) : (nom de la règle, texte) }. Un
       détachement peut en porter plusieurs ; on les recolle."""
    code = CODES.get(faction)
    if not code: return {}
    out = {}
    for x in enregistrements('Detachment_abilities.csv'):
        if x.get('faction_id') != code: continue
        k = _cle(x.get('detachment'))
        if not k: continue
        nom, txt = (x.get('name') or '').strip(), propre(x.get('description'))
        if not txt: continue
        if k in out:
            a, b = out[k]
            out[k] = (a + ' / ' + nom if nom and nom not in a else a, b + ' ' + txt)
        else:
            out[k] = (nom, txt)
    return out

def optimisations(faction):
    """{ nom d'optimisation (clé) : texte }."""
    code = CODES.get(faction)
    if not code: return {}
    out = {}
    for x in enregistrements('Enhancements.csv'):
        if x.get('faction_id') != code: continue
        t = propre(x.get('description'))
        if t: out.setdefault(_cle(x.get('name')), t)
    return out

def titre(nom):
    """Wahapedia crie les noms de stratagème : « INSANITY'S IRE ». Le
       fichier nécron les écrit comme la carte les imprime — et le « s »
       d'un possessif ne prend pas de capitale, lui."""
    n = (nom or '').strip().replace('‑', '-')   # trait d'union insécable
    if not n or n != n.upper(): return n
    petits = ('of', 'the', 'and', 'a', 'to', 'in', 'for', 'from', 'on', 'at', 'by')
    mots = n.split(' ')
    out = []
    for i, m in enumerate(mots):
        b = m.lower()
        out.append(b if (i and b in petits) else
                   re.sub(r'(^|-)(\w)', lambda x: x.group(1) + x.group(2).upper(), b))
    return ' '.join(out)
