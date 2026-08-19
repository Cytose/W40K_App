# Nécron — aide de jeu

Simulateur de séquence d'attaque, constructeur de liste et comparateur d'unités
pour **Warhammer 40 000, 11e édition**, orienté armée **Nécrons**.

Application web statique, sans dépendance, installable sur téléphone et
utilisable hors-ligne.

## Plein écran

Un bouton `⛶` dans l'en-tête bascule la page en plein écran : la barre
d'adresse du navigateur disparaît, ce qui rend une bonne part de la hauteur.
Il n'apparaît que là où l'API existe — donc pas sur Safari iOS, où seule
l'installation sur l'écran d'accueil donne le plein écran.

Le manifeste demande `display: "fullscreen"`, avec `display_override` pour
retomber sur `standalone` puis `minimal-ui` là où le plein écran est refusé.
Une application déjà installée garde le mode qu'elle avait à l'installation :
il faut la retirer de l'écran d'accueil et la réinstaller pour que le
changement prenne effet.

## Utiliser l'application

Le plus simple est le fichier autonome **`Necron_Aide_Jeu.html`** : tout y est
embarqué, il suffit de le poser où on veut et de l'ouvrir d'un double-clic.
Aucune installation, aucun réseau.

Pour travailler sur les sources, il faut les servir par HTTP —
`python3 -m http.server` puis `http://localhost:8000` — car un navigateur
refuse de charger des scripts séparés depuis `file://`. Après modification,
`node build.js` régénère le bundle (nécessite `npm i terser`) : le fichier
produit est `dist/_full.html`, à recopier sur `Necron_Aide_Jeu.html`.

Le **lien de partage** n'est proposé que sur une version servie en HTTP ;
depuis un fichier local, il faut passer par « Exporter / importer la liste ».

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | structure et thème (noir nécrodermis / vert gauss / cyan phasique) |
| `data.js` | 53 datasheets, 141 profils d'armes, 12 détachements, mots-clés, rattachements, améliorations, socles |
| `engine.js` | moteur de dés : espérances exactes + simulation Monte-Carlo |
| `app.js` | onglet Simulateur |
| `roster.js` | onglets Ma liste, Tir cumulé et Comparer |
| `sw.js` | service worker (mode hors-ligne) |
| `build.js` | fabrique le bundle minifié dans `dist/` |
| `mkloader.js` | fabrique le chargeur compressé `dist/index.html` + `dist/a.b64` |

## Les trois axes

L'application est organisée en trois axes, qui correspondent aux trois moments
d'une partie.

**Listes** — s'ouvre sur l'index de ce qu'on a construit. C'est là que vit le
cycle de vie d'une liste : créer, et par le bouton `⋯` de chaque carte ouvrir,
dupliquer ou supprimer. L'éditeur ne porte que ce qui qualifie la liste
ouverte — son nom et son plafond. Toucher une liste entre dans son éditeur,
présenté en **pavé** : une case carrée par unité, avec
son groupe, ses points, sa taille et ses personnages ; une case bordée d'orange
signale un rattachement ou une amélioration en faute. Toucher une case ouvre
son panneau, la barre de retour ramène au pavé. En dessous, quatre cases mènent
aux détachements, aux stratagèmes, à l'armement et aux réglages de la liste.

**Simulateur** — quatre vues sous des sous-onglets : Attaque (une unité contre
une cible), Tir cumulé (plusieurs unités dans l'ordre), Comparer (côte à côte)
et Encaisser (une unité de la liste sous un volume de tir). Les unités de la
liste ouverte sont accessibles en une touche.

**En partie** — la liste ouverte en lecture seule, telle qu'on la consulte
pendant le jeu. Cet axe accueillera le suivi de partie : points de commandement,
phase en cours, capacités et stratagèmes déployables. Il attend surtout les
données de stratagèmes, aujourd'hui presque vides.

## Fonctions

- **Simulateur** — une unité contre une cible : chaîne touche → blessure →
  sauvegarde calculée exactement, puis 30 000 simulations pour la répartition
  des dégâts entre figurines (surtue comprise). Distribution, médiane,
  probabilité d'effacer l'unité.
- **Mes listes** — plusieurs listes coexistent, chacune avec son nom et son
  plafond de points. L'index les présente avec leur total, leurs détachements
  et leur nombre d'unités ; on en crée, on en duplique, on en supprime depuis
  cet index. Le budget de Points de Détachement suit le plafond : 3 PD à 2000
  points, au prorata ailleurs.
- **Ma liste** — construction de la liste ouverte : détachements (tags
  d'exclusivité), unités, armement mixte par unité, personnages attachés
  (Leader / Support), validation (règle des trois, Battleline, Epic Hero).
- **Tir cumulé** — plusieurs unités de la liste tirent sur la même cible dans
  l'ordre : la surtue d'une unité pénalise les suivantes, comme en partie.
  Contribution de chaque unité et puissance perdue.
- **Comparer** — met des unités côte à côte contre la cible du moment, classées
  par dégâts pour 100 points.
- **Simulateur depuis la liste** — le sélecteur d'unité du simulateur propose
  d'abord ce que contient la liste ouverte, avec la taille et l'arme retenues
  et les personnages rattachés, avant le catalogue complet.
- **Groupes rattachés** — dès qu'un personnage rejoint une unité, l'ensemble
  porte un nom fabriqué tout seul (« Cohorte de Nécrodermis de Thanatos »,
  5 184 combinaisons), qu'on peut réécrire ou retirer au sort. C'est ce nom
  qu'on annonce en partie. Une unité seule garde le sien : elle n'est pas un
  groupe, le champ n'apparaît pas.
- **Dupliquer une unité** — depuis son panneau, une fois réglée : la copie
  reprend l'armement, les personnages rattachés et l'amélioration, se place
  juste après l'originale et s'ouvre aussitôt. Un groupe dupliqué reçoit son
  propre nom. La validation signale ensuite ce qui dépasse — règle des trois,
  Epic Hero en double.
- **Équipement de l'unité** — deux tableaux, tir et corps à corps, avec le
  profil complet de chaque arme et ses mots-clés. Les armes de mêlée équipent
  toute l'unité et ne se répartissent pas : elles n'apparaissaient nulle part
  tant qu'on ne les avait pas ajoutées à la main.
- **Choix d'unité rangé** — le sélecteur groupe les 53 unités par grande
  catégorie (Epic Hero, Personnage, Battleline, Infanterie, Bête, Monté,
  Véhicule, Monstre, Fortification), reprises des mots-clés du catalogue
  BattleScribe. Le type de châssis prime sur le statut : les C'tan sont des
  Monstres avant d'être des Epic Heroes, la Convergence of Dominion une
  Fortification avant d'être un Véhicule. La recherche accepte aussi un nom
  de catégorie.
- **Rattachement** — le choix d'un personnage est trié selon sa règle Leader :
  ceux qui peuvent rejoindre l'unité d'abord, escortes Cryptek comprises, les
  autres relégués et signalés. Un rattachement hors règles reste possible mais
  lève un avertissement.
- **Mots-clés du groupe** — l'unité affiche ses mots-clés plus ceux qu'apporte
  chaque personnage rattaché, en couleur distincte : un Technomancer sur des
  Immortals rend le groupe CRYPTEK, ce qui décide des stratagèmes applicables.
- **Améliorations** — celles des détachements retenus, avec leur coût compté
  dans le total. Contrôles : trois au maximum, jamais deux fois la même, ni sur
  un groupe sans personnage, ni sur un Epic Hero.
- **Encaisser** — le calcul du simulateur, rôles inversés : une unité de la
  liste subit un volume de tir. Dix archétypes d'armes — fusil laser, bolter,
  bolter lourd, fuseur, plasma, canon laser, autocanon, lance-flammes, épée
  tronçonneuse, gantelet énergétique — et un nombre de tireurs réglable.
  Sortie : figurines perdues, survivantes, probabilité d'être effacée,
  distribution complète, et combien de tireurs il faudrait pour effacer
  l'unité une fois sur deux. Ces profils sont des repères indicatifs, pas des
  profils officiels : les listes adverses sont trop variées pour être
  modélisées.
- **Empreinte de socle** — affichée sur l'unité et sur chaque personnage.
- **Armement** — tous les profils de la liste à plat, groupés par groupe, pour
  retrouver une arme sans dérouler l'unité. Quatre filtres : armes prises,
  toutes les armes, tir seul, càc seul. Les armes des personnages rattachés
  sont incluses ; celles qui ne sont pas équipées restent visibles, grisées.
- **Stratagèmes** — ceux des détachements retenus plus ceux de base, dépliables
  sur leur texte Quand / Cible / Effet.
- **Lien de partage** — la liste ouverte est encodée dans l'URL avec son nom et
  son plafond (JSON réduit, gzip, base64url) : on s'envoie le lien et la liste
  s'ouvre sur l'autre appareil, sans serveur ni compte. Une liste de 2000
  points tient en moins de 400 caractères. Elle s'ajoute aux listes existantes
  après confirmation, sans en écraser aucune, que l'application soit déjà
  ouverte ou non.

## Règles modélisées

Lethal Hits, Devastating Wounds, Sustained Hits (y compris D3), Torrent, Blast,
Rapid Fire, Melta, Anti-X, Twin-linked, couvert, invulnérable, Insensible à la
douleur, réduction de dégâts (Necrodermis, Implacable Resilience) avec plancher
à 1, modificateurs plafonnés à ±1, relances des 1 ou des ratés.

Les Protocoles de Réanimation ne sont **pas** simulés : ils soignent D3 PV en
fin de phase de Commandement et ne réduisent rien au moment de l'encaissement.

## Données

Faction Pack Necrons v1.0 (Games Workshop, légal au 20/06/2026) recoupé avec
Wahapedia. Les points viennent de Wahapedia et non du Munitorum Field Manual ;
la vérification menée en 08/2026 (plus bas) les confirme partout où une
référence a pu être trouvée. Tous les champs restent modifiables dans
l'application.

Non affilié à Games Workshop.

## Vérification des données, 08/2026

Les 52 unités ont été confrontées au catalogue BattleScribe
[BSData/wh40k-10e](https://github.com/BSData/wh40k-10e) rev.106 — dépôt qui
porte encore le nom de la 10e mais contient les nouveautés de la 11e.

Résultat : **aucune divergence sur les profils d'armes** (125 appariés), une
seule sur les caractéristiques (Night Scythe, mouvement 14″ ici contre 20″
là-bas), et 36 écarts de points. Sur les douze valeurs lisibles dans WarOrgan
— dataset Warhammer 40k 11th du 06/08/2026 — `data.js` est d'accord douze fois
sur douze, le catalogue seulement sept. Les points d'ici sont donc les bons et
c'est BSData qui est en retard ; les vingt-quatre autres écarts n'ont pas pu
être tranchés faute de référence.

Le catalogue **ne contient aucun stratagème** de la 11e : ni ceux des
détachements — Molecular Targeting, Microscarab Swarm, Animus Curse et les
autres y sont introuvables — ni les stratagèmes de base sous une forme
exploitable. `STRATS` ne porte donc que ce qui est lisible sur les captures
WarOrgan : dix-sept entrées avec nom, détachement, type et coût, dont une
seule avec son texte complet. Les autres s'affichent « texte non renseigné » ;
les compléter ne demande que de remplir les trois dernières colonnes.

Le catalogue a servi de source pour les rattachements (règle Leader de chaque
personnage) et les améliorations. Il ignore encore celles de Skyshroud
Spearhead, relevées sur WarOrgan ; un coût inconnu vaut `null` et ne compte pas.
Les empreintes de socle ne viennent d'aucune de ces deux sources : seules
Immortals 32, Canoptek Tomb Crawlers 50 et Lokhust Heavy Destroyers 60 sont
confirmées, le reste suit les socles habituels et reste à vérifier.
