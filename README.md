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
| `data.js` | 53 datasheets (profil complet, CO et Cd), 142 profils d'armes avec portée, aptitudes d'unité, règle de faction, glossaire des mots-clés, 12 détachements, rattachements, améliorations, socles |
| `engine.js` | moteur de dés : espérances exactes + simulation Monte-Carlo |
| `app.js` | onglet Simulateur |
| `roster.js` | axes Listes et En partie, vues Tir cumulé et Comparer, fiche d'unité, partage, encodeur QR |
| `sw.js` | service worker (mode hors-ligne) |
| `build.js` | fabrique le bundle minifié dans `dist/` |
| `mkloader.js` | fabrique le chargeur compressé `dist/index.html` + `dist/a.b64` |

## Les trois axes

L'application est organisée en trois axes, qui correspondent aux trois moments
d'une partie. Elle s'ouvre sur le premier : on construit sa liste avant de la
mesurer, et on la mesure avant de la jouer.

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

**En partie** — le suivi d'une partie, enregistré en continu : tour, phase,
points de commandement, unités encore debout, points de vie restants par unité
et par personnage rattaché, réanimation D3 sur toute l'armée, score primaire et
secondaire, stratagèmes jouables qui débitent les PC, et journal du tour. La
liste ouverte reste consultable en dessous, en lecture seule.

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
- **Réordonner les unités** — un bouton bascule le pavé en mode réorganisation :
  chaque case reçoit deux flèches qui la font avancer ou reculer, les cases
  d'outils et d'ajout s'effacent, et toucher une case ne l'ouvre plus. L'ordre
  compte : c'est celui que suit le tir cumulé.
- **Armement par emplacement** — une figurine porte plusieurs armes, et une
  option d'armement peut en donner plusieurs à la fois. `ARMEMENT` décrit
  donc, pour chaque unité, ses armes portées d'office et ses *emplacements*
  de choix, chacun avec ses options :

  | | d'office | emplacements |
  |---|---|---|
  | Immortals | arme de corps à corps | fusil gauss \| carabine tesla |
  | Triarch Praetorians | — | rod of covenant \| particle caster **et** voidblade |
  | Canoptek Wraiths | — | six combinaisons de griffes/fouet et rayon/projecteur |
  | Canoptek Spyders | griffes | deux particle beamers (facultatif) |
  | Doomsday Ark | canon, arrays, éperon | aucun |

  Les armes d'office sont listées sans compteur. Chaque emplacement a son
  propre bandeau « x / effectif » et affiche **toutes** ses options avec
  leur compteur — cinq fusils gauss et cinq tesla sur dix Immortals se
  posent directement, sans passer par une feuille d'ajout. Une figurine
  seule choisit par un bouton plutôt que par un compteur. Un emplacement
  facultatif est marqué comme tel et peut rester vide.

  La structure vient du catalogue BattleScribe : une arme rattachée au
  modèle est d'office, un groupe d'options exclusives devient un
  emplacement, et plusieurs variantes de modèle deviennent les options d'un
  même emplacement.
- **Armes à plusieurs profils** — un bâton de lumière donne un tir *et* une
  frappe, un rayon thermique deux modes de tir. L'application équipe l'arme,
  pas le profil : porter le bâton met ses deux profils à disposition, et le
  choix du mode se fait au moment d'attaquer. Quinze armes du catalogue sont
  dans ce cas.
- **Choix d'unité rangé** — le sélecteur groupe les 50 unités par grande
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
  sur leur texte Quand / Cible / Effet / Restrictions, au texte officiel
  français.
- **Lien de partage** — la liste ouverte est encodée dans l'URL avec son nom et
  son plafond (JSON réduit, gzip, base64url) : on s'envoie le lien et la liste
  s'ouvre sur l'autre appareil, sans serveur ni compte. Une liste de 2000
  points tient en moins de 400 caractères. Elle s'ajoute aux listes existantes
  après confirmation, sans en écraser aucune, que l'application soit déjà
  ouverte ou non.

- **Fiche d'unité** — le profil complet avec CO et Cd, les armes avec leur
  portée, les aptitudes propres de l'unité, la règle de faction, les mots-clés
  et le glossaire des seuls mots-clés d'arme que cette unité porte. Elle
  s'ouvre depuis le pied du panneau d'unité, depuis le bouton `ⓘ` de chaque
  entrée du catalogue — sans rien ajouter à la liste — et en touchant une unité
  dans l'axe En partie.
- **Construction rapide** — le catalogue reste ouvert : on pose dix unités
  d'affilée pendant que le pavé se remplit derrière, avec en tête les points
  posés et ce qu'il reste au budget. La taille par défaut est la plus petite,
  le prix s'annonce en fourchette, et une entrée hors budget se signale. La
  recherche prend le nom, l'arme, la catégorie, le rôle et les mots-clés.
- **Actions sur une case** — appui long, ou clic droit : régler, fiche,
  dupliquer, retirer. Un retrait s'annule pendant sept secondes.
- **Partager** — le texte de la liste au format attendu par les organisateurs,
  la copie dans le presse-papier, l'impression (donc le PDF), le lien, le QR
  code, la sauvegarde de toutes les listes dans un fichier et l'import d'un
  `.ros` BattleScribe ou New Recruit.
- **Stratagèmes** — quarante-trois fiches au texte officiel français : les
  trente-trois des sept détachements du pack de faction et les dix
  stratagèmes de base. Les cinq détachements du codex n'y figurent pas ; leurs
  stratagèmes se saisissent dans l'application et restent enregistrés sur
  l'appareil. On peut aussi ajouter un stratagème absent de la table.

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

Les unités ont été confrontées au catalogue BattleScribe
[BSData/wh40k-10e](https://github.com/BSData/wh40k-10e) rev.106 — dépôt qui
porte encore le nom de la 10e mais contient les nouveautés de la 11e.

Résultat : **aucune divergence sur les profils d'armes** (125 appariés), une
seule sur les caractéristiques (Night Scythe, mouvement 14″ ici contre 20″
là-bas), et 36 écarts de points. Sur les douze valeurs lisibles dans WarOrgan
— dataset Warhammer 40k 11th du 06/08/2026 — `data.js` est d'accord douze fois
sur douze, le catalogue seulement sept. Les points d'ici sont donc les bons et
c'est BSData qui est en retard ; les vingt-quatre autres écarts n'ont pas pu
être tranchés faute de référence.

Le catalogue **ne contient aucun stratagème** de la 11e, ni ceux des
détachements ni les stratagèmes de base sous une forme exploitable.

Le catalogue a servi de source pour les rattachements (règle Leader de chaque
personnage) et les améliorations ; un coût inconnu vaut `null` et ne compte
pas dans le total.

## Sources officielles, 19/08/2026

Deux documents publiés librement par Games Workshop remplacent désormais une
grande partie des données de règles :

- **Nécrons, Pack de Faction version 1.1**, valide pour le jeu égal à partir
  du 22 juillet 2026 — sept détachements avec leur règle, leurs optimisations
  et leurs stratagèmes ; huit fiches techniques ; une section de mises à jour
  de règles et une FAQ.
- **Warhammer 40,000, Règles de Base** — les dix stratagèmes de base
  (section 15) et le glossaire des aptitudes d'arme et de base (section 24).

Ce qui en vient : les 43 stratagèmes, les règles des sept détachements du
pack, leurs 20 optimisations, les aptitudes des 8 fiches du pack, les
Protocoles de Réanimation, le glossaire complet, et les errata qui touchent
des fiches existantes (Chronomancien, Plasmancien, Monolithe, Roi Silencieux,
Réanimateur Canoptek, Console de Commandement, Destroyers Ophydiens, C'tan
Transcendant, mot-clé CHÂSSIS).

Les valeurs en points n'y figurent pas — elles vivent dans l'Inventaire du
Munitorum — donc `data.js` garde les siennes, vérifiées en 08/2026. Les cinq
détachements du codex (Dynastie Éveillée, Cour Canoptek, Légion
d'Annihilation, Phalange d'Obéissance, Légion d'Hypercrypte) ne sont pas repris
par le pack : leurs optimisations restent en anglais et leurs stratagèmes
restent à saisir.

Deux corrections trouvées à cette occasion : les Bolas Gravitiques étaient
rangées sous Fer de Lance Linceul Céleste alors qu'elles appartiennent au
Conclave de Crypteks, et la sismolance du Géomancien était enregistrée sans
portée sous un nom inventé.

Deux points que le pack ne tranche pas, ou tranche contre lui-même : la
composition de Convergence de Domination reste inconnue, et le pack retire
« Meneur » aux Crypteks page 30 alors que la fiche du Géomancien page 17 la
porte encore.

Les fiches d'errata nommées « Faucheur » et « Moissonneur » ont été rattachées
au **Doom Scythe** et au **Night Scythe** par déduction : la section 23.02 des
règles de base ne laisse aux AÉRODYNES que le mouvement d'arrivée, ce qui
explique un M et un CO à « — » pour l'un ; le Moissonneur, lui, perd AÉRODYNE
et prend un M de 14″, exactement la refonte que BSData avait déjà relevée sur
le Night Scythe. Ce rattachement est signalé comme déduction sur les deux
fiches.

## Unités Legends

Elles ont été retirées à la demande de l'utilisateur, qui ne les joue pas :
**Nemesor Zahndrekh**, **Vargard Obyron** et **Lord**, avec leurs armes, leurs
aptitudes, leurs rattachements, leurs socles et leurs mots-clés. Le drapeau
`legends` de `UNITS` et le badge correspondant restent en place : ils ne
coûtent rien et servent si une unité Legends revient un jour.

Une liste enregistrée qui contenait une de ces unités — ou un personnage
rattaché supprimé — la perd au chargement, avec un message qui la nomme.
Auparavant une unité inconnue disparaissait du pavé sans un mot tout en
restant dans les données.
Les empreintes de socle ne viennent d'aucune de ces deux sources : seules
Immortals 32, Canoptek Tomb Crawlers 50 et Lokhust Heavy Destroyers 60 sont
confirmées, le reste suit les socles habituels et reste à vérifier.
