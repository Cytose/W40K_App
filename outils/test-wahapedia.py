#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
CE QUE VAUT LA LECTURE DE L'EXPORT WAHAPEDIA

Le format se lit mal et se lit faux en silence. Les champs sont séparés
par « | », mais les descriptions contiennent du HTML, des « | » nulle
part et des retours à la ligne partout : un enregistrement s'étale sur
plusieurs lignes, et on ne sait qu'il est fini qu'en comptant les
séparateurs. Compter un séparateur de trop recolle deux fiches en une —
et le résultat reste un tableau bien formé, avec la moitié des lignes,
chacune portant le nom d'un stratagème et le texte du suivant. Rien ne
proteste.

C'est arrivé. Sur 1661 stratagèmes on en lisait 830. La seule défense
est de compter autrement : le début d'un enregistrement se reconnaît à
son identifiant, un nombre de neuf chiffres au moins en troisième
colonne, et ce compte-là ne dépend pas du recollement.

Lancer : python3 outils/test-wahapedia.py
============================================================
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wahapedia as W

ok, ko = [], []
def T(nom, v, att):
    bon = att(v) if callable(att) else v == att
    (ok if bon else ko).append('%s : %r%s' % (nom, v, '' if bon else ' (attendu %r)' % att))

if not W.dispo():
    sys.exit("L'export n'est pas sous %s — rien à éprouver.\n"
             "On le récupère à la main sur https://wahapedia.ru/wh40k11ed/home/ "
             "(« Export data »)." % W.DOSSIER)

# ------------------------------------------------------------------
# LE RECOLLEMENT
# ------------------------------------------------------------------
def debuts(nom, colonne):
    """Combien d'enregistrements le fichier contient VRAIMENT, compté
       sans recoller quoi que ce soit : une ligne qui porte un
       identifiant de neuf chiffres en position `colonne` en commence un."""
    t = open(os.path.join(W.DOSSIER, nom), encoding='utf-8-sig').read().replace('\r\n', '\n')
    motif = r'(?m)^' + r'[^|\n]*\|' * colonne + r'\d{9,}\|'
    return len(re.findall(motif, t))

for fichier, colonne in [('Stratagems.csv', 2), ('Enhancements.csv', 2),
                         ('Detachment_abilities.csv', 0)]:
    T('%s : autant d\'enregistrements que de débuts de fiche' % fichier,
      len(W.enregistrements(fichier)), debuts(fichier, colonne))

T('un stratagème porte toutes ses colonnes',
  sorted(W.enregistrements('Stratagems.csv')[0]),
  ['cp_cost', 'description', 'detachment', 'detachment_id', 'faction_id',
   'id', 'legend', 'name', 'phase', 'turn', 'type'])

# ------------------------------------------------------------------
# LE HTML
# ------------------------------------------------------------------
T('les balises tombent',
  W.propre('<b>WHEN:</b> Your <span class="kwb">SHOOTING</span> phase.<br><br>Fin.'),
  'WHEN: Your SHOOTING phase. Fin.')
T('les entités aussi', W.propre('a&nbsp;b &amp; c'), 'a b & c')
T('une liste devient des puces',
  W.propre('<ul><li>Un point.</li><li>Un autre.</li></ul>'), '▪ Un point. ▪ Un autre.')
T('une puce unique n\'en est pas une',
  W.propre('<ul><li>Seul point.</li></ul>'), 'Seul point.')

quand, cible, effet, restric = W.sections(
  '<b>WHEN:</b> Fight phase.<br><br><b>TARGET:</b> One unit.<br><br>'
  '<b>EFFECT:</b> It fights.<br><br><b>RESTRICTIONS:</b> Once per battle.')
T('une description se découpe en quatre', [quand, cible, effet, restric],
  ['Fight phase.', 'One unit.', 'It fights.', 'Once per battle.'])
T('une description sans intertitre passe entière en effet',
  W.sections('Just do it.'), ('', '', 'Just do it.', ''))

# ------------------------------------------------------------------
# CE QU'ON EN TIRE
# ------------------------------------------------------------------
T('la famille se lit malgré le nom de détachement en tête',
  W.famille('Annihilation Legion  – Strategic Ploy Stratagem'), 'Ruse Stratégique')
T('un détachement qui remplace la famille n\'en donne pas',
  W.famille('Hand of the Dynasty Stratagem'), '')
T('les noms criés se rhabillent', W.titre("INSANITY’S IRE"), 'Insanity’s Ire')
T('les petits mots restent petits', W.titre('WILL OF THE CONQUEROR'), 'Will of the Conqueror')
T('un nom déjà mis en casse n\'est pas retouché',
  W.titre('Hand of the Dynasty'), 'Hand of the Dynasty')

DET_NEC = ["Hand of the Dynasty", "Skyshroud Spearhead", "The Phaeron's Armoury",
           "Starshatter Arsenal", "Cryptek Conclave", "Cursed Legion", "Pantheon of Woe",
           "Awakened Dynasty", "Canoptek Court", "Annihilation Legion",
           "Obeisance Phalanx", "Hypercrypt Legion"]
s = W.stratagemes('necrons', DET_NEC)
T('les douze détachements nécrons ont leurs stratagèmes',
  [len(s), len({x[1] for x in s})], [63, 12])
T('et rien qui vienne d\'ailleurs',
  sorted({x[1] for x in s} - set(DET_NEC)), [])
T('le nom de détachement est celui du Munitorum, pas celui de Wahapedia',
  all(x[1] in DET_NEC for x in s), True)
T('chacun dit quand, sur quoi et ce qu\'il fait',
  [x[0] for x in s if not (x[3] > 0 and x[4] and x[6])], [])
T('et aucun ne garde de HTML',
  [x[0] for x in s if re.search(r'<[a-z/]|&[a-z]+;', x[4] + x[5] + x[6] + x[7], re.I)], [])

T('les stratagèmes de base sont ceux de la 11e édition, onze cartes',
  len(W.coeur()), 11)
T('« Explosifs » et « Impact Écrasant », de la 10e, n\'y sont plus',
  [x[0] for x in W.coeur() if x[0] in ('Explosives', 'Crushing Impact')], [])

rd = W.reglesDetachement('custodes')
T('les règles de détachement custodes ont leur texte',
  [len(rd), all(t and n for n, t in rd.values())], [11, True])
T('les optimisations aussi', len(W.optimisations('worldeaters')), lambda v: v >= 26)

print('\n'.join('  ✓ ' + x for x in ok))
if ko:
    print('\n════ ÉCARTS ════')
    print('\n'.join('  ✗ ' + x for x in ko))
print('\n%d contrôles, %d écart(s).' % (len(ok) + len(ko), len(ko)))
sys.exit(1 if ko else 0)
