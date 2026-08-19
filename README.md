# Nécron — aide de jeu

Simulateur de séquence d'attaque, constructeur de liste et comparateur d'unités
pour **Warhammer 40 000, 11e édition**, orienté armée **Nécrons**.

Application web statique, sans dépendance, installable sur téléphone et
utilisable hors-ligne.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | structure et thème (noir nécrodermis / vert gauss / cyan phasique) |
| `data.js` | 52 datasheets, 141 profils d'armes, 12 détachements, mots-clés |
| `engine.js` | moteur de dés : espérances exactes + simulation Monte-Carlo |
| `app.js` | onglet Simulateur |
| `roster.js` | onglets Ma liste, Tir cumulé et Comparer |
| `sw.js` | service worker (mode hors-ligne) |
| `build.js` | fabrique le bundle minifié dans `dist/` |
| `mkloader.js` | fabrique le chargeur compressé `dist/index.html` + `dist/a.b64` |

## Fonctions

- **Simulateur** — une unité contre une cible : chaîne touche → blessure →
  sauvegarde calculée exactement, puis 30 000 simulations pour la répartition
  des dégâts entre figurines (surtue comprise). Distribution, médiane,
  probabilité d'effacer l'unité.
- **Ma liste** — construction à 2000 points : détachements (budget de 3 PD,
  tags d'exclusivité), unités, armement mixte par unité, personnages attachés
  (Leader / Support), validation (règle des trois, Battleline, Epic Hero).
- **Tir cumulé** — plusieurs unités de la liste tirent sur la même cible dans
  l'ordre : la surtue d'une unité pénalise les suivantes, comme en partie.
  Contribution de chaque unité et puissance perdue.
- **Comparer** — met des unités côte à côte contre la cible du moment, classées
  par dégâts pour 100 points.

## Règles modélisées

Lethal Hits, Devastating Wounds, Sustained Hits (y compris D3), Torrent, Blast,
Rapid Fire, Melta, Anti-X, Twin-linked, couvert, invulnérable, Insensible à la
douleur, réduction de dégâts (Necrodermis, Implacable Resilience) avec plancher
à 1, modificateurs plafonnés à ±1, relances des 1 ou des ratés.

Les Protocoles de Réanimation ne sont **pas** simulés : ils soignent D3 PV en
fin de phase de Commandement et ne réduisent rien au moment de l'encaissement.

## Données

Faction Pack Necrons v1.0 (Games Workshop, légal au 20/06/2026) recoupé avec
Wahapedia. Les points viennent de Wahapedia et non du Munitorum Field Manual :
à revérifier. Tous les champs restent modifiables dans l'application.

Non affilié à Games Workshop.
