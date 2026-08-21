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

Le plus simple est le fichier autonome **`W40K_App.html`** : tout y est
embarqué, il suffit de le poser où on veut et de l'ouvrir d'un double-clic.
Aucune installation, aucun réseau.

Pour travailler sur les sources, il faut les servir par HTTP —
`python3 -m http.server` puis `http://localhost:8000` — car un navigateur
refuse de charger des scripts séparés depuis `file://`. Après modification,
`node build.js` régénère `dist/` (nécessite `npm i terser`) : le fichier
autonome produit est `dist/W40K_App.html`, à recopier à la racine.

Le **lien de partage** n'est proposé que sur une version servie en HTTP ;
depuis un fichier local, il faut passer par « Exporter / importer la liste ».

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | structure et thème (noir nécrodermis / vert gauss / cyan phasique) |
| `data.js` | 50 datasheets (profil complet, CO et Cd), 136 profils d'armes avec portée, composition de l'armement, aptitudes d'unité, règle de faction, glossaire des mots-clés, 12 détachements, rattachements, améliorations avec leur cible, socles, octrois d'aptitudes d'arme |
| `engine.js` | moteur de dés : espérances exactes + simulation Monte-Carlo |
| `app.js` | onglet Simulateur |
| `roster.js` | axes Listes et En partie, vue Comparer, fiche d'unité, partage, encodeur QR |
| `sw.js` | service worker (mode hors-ligne) |
| `build.js` | fabrique `dist/` : le site à déployer **et** le fichier autonome |
| `vercel.json` | pointe le déploiement sur `dist/` |
| `mkloader.js` | fabrique un chargeur compressé, hors chaîne de build |

### Déploiement

`node build.js` remplit `dist/` avec deux choses distinctes :

- **le site** — `index.html`, `data.js`, `engine.js`, `app.js`, `roster.js`,
  `sw.js`, `manifest.json`, `icon.svg`, les sources telles quelles, un fichier
  par rôle. C'est ce que Vercel publie, via `vercel.json#outputDirectory` ;
- **le fichier autonome** — `dist/W40K_App.html`, l'application repliée
  en un seul fichier, recopiée à la racine du dépôt et téléchargeable depuis le
  site. `dist/hors-ligne.html` en est la variante compressée, qui se déplie au
  chargement.

Le nom du cache du service worker porte l'empreinte SHA-256 des sources : un
déploiement qui change quoi que ce soit invalide l'ancien cache au lieu de le
laisser resservir la version précédente.

Sans `vercel.json`, Vercel exécute `npm run build` puis cherche un dossier
`public` : il n'en trouve pas, le déploiement échoue, et le site reste figé sur
la dernière version publiée avant l'ajout de `package.json`.

## Les trois axes

L'application est organisée en trois axes, qui correspondent aux trois moments
d'une partie. Elle s'ouvre sur le premier : on construit sa liste avant de la
mesurer, et on la mesure avant de la jouer.

**Listes** — s'ouvre sur l'index de ce qu'on a construit. C'est là que vit le
cycle de vie d'une liste : créer, et par le bouton `⋯` de chaque carte ouvrir,
dupliquer ou supprimer. L'éditeur ne porte que ce qui qualifie la liste
ouverte — son nom et son plafond. Toucher une liste entre dans son éditeur,
présenté en **pavé** : une case carrée par unité, qui porte son groupe, ses
points, sa taille, le **nom des personnages rattachés**, l'optimisation prise et
l'arme dominante — et le rang de copie sur les unités dont le prix monte avec le
nombre. Une case bordée d'orange signale un rattachement ou une amélioration en
faute. Toucher une case ouvre son panneau. Le retour vit dans l'en-tête
collante, à côté d'« Enregistrer » : il reste sous le pouce où qu'on soit
descendu, et il est contextuel — « ‹ Mes listes » sur le pavé, « ‹ Le pavé »
dans un panneau.

Quand la liste grossit, le pavé se **regroupe par rôle** — replié, c'est la
répartition de l'armée en cinq lignes, unités et points par rôle — et se
**cherche**, par nom d'unité, de groupe ou de personnage rattaché. Le mode
Réorganiser rétablit le pavé entier et à plat. Un bandeau replié recense **ce
qu'il reste à finir** : points inutilisés, PD non dépensés, optimisations
ouvertes jamais prises, personnage laissé seul quand il pouvait mener une
escouade. Chaque ligne mène là où on la corrige.

En dessous, cinq cases mènent aux détachements, aux stratagèmes, à l'armement,
au partage et aux réglages de la liste. Le catalogue d'unités s'ouvre sur son
sommaire : dix barres de catégorie qui tiennent dans un écran, une seule ouverte
à la fois ; une recherche en cours les rouvre toutes.

**Simulateur** — trois vues sous des sous-onglets : Attaque, Comparer (côte à
côte) et Encaisser (une unité de la liste sous un volume de tir).

L'onglet **Attaque** mesure soit **une arme** du catalogue, soit **une unité
entière** de la liste — tous ses profils à la fois, armes de l'escouade et du
personnage rattaché, octrois de détachement compris, tirant dans l'ordre sur la
même cible. Chaque profil se décoche ; la phase de tir ou de corps à corps se
choisit.

Chaque profil porte ses **pastilles** : les mots-clés de l'arme, ceux qu'une
règle lui accorde — marqués d'un `+` — et les modificateurs appliqués, chacun
avec la règle et la figurine qui le donnent. Un crit 5+ venu du Plasmancien se
lit sur la ligne, avec son nom.

Les aptitudes de fiche qui touchent la séquence d'attaque entrent dans le
profil : l'Éradication Implacable des Immortels relance leurs blessures de 1
sans que rien ne soit coché. Celles qui dépendent de la situation — cible sur
un objectif, unité ayant chargé, figurine abîmée — n'agissent jamais d'office :
elles apparaissent sous leur nom officiel dans la zone rapide, à déclarer.

La **cible** tient sous son sélecteur : une grille dense au lieu de huit rangées.
Elle se choisit parmi douze archétypes rangés par nature, parmi les fiches
nécrones, ou **dans la liste ouverte** — auquel cas l'unité arrive avec son
effectif réel, ses personnages rattachés comptés, et l'insensibilité qu'un
Technomancien lui donne. Un profil saisi à la main se **garde** sous un nom et se
rappelle d'une touche : l'application ne connaissant que les Nécrons, c'est la
seule façon d'avoir un profil exact d'une autre faction.

Sous l'attaquant, les **retouches de partie** restent visibles avec le compte
de celles qui sont actives : modificateurs de touche, de blessure, de
**pénétration d'armure** et de **dégâts**, relances, et quatre raccourcis pour
les situations qui reviennent — cible à couvert, +1 pour toucher, relance des
1, cible sur objectif. Sur une unité chargée, elles s'appliquent à tous les
profils d'un coup.

**En partie** — le suivi d'une partie, enregistré en continu. Un round y est ce
qu'il est : **dix phases, cinq à toi, cinq à lui**. Un bouton fait avancer le
déroulé, passe la main, ouvre le round suivant et donne le PC au début de ton
commandement ; toucher une phase y va directement sans rien faire avancer.

Un bloc **« Maintenant »** dit ce qui se déclenche à cet instant précis, tiré de
ta liste et de ton détachement — la Réanimation en fin de commandement, le
Portail d'Éternité du Monolithe à ton mouvement, l'Hyperphasage à la fin du
combat adverse. Ce qui vaut une fois par partie ou par tour se marque utilisé, et
le suivi tient d'une phase à l'autre. Les stratagèmes sont filtrés au même
moment, « Tout voir » à une touche.

S'y ajoutent points de commandement, unités encore debout, points de vie
restants par unité et par personnage rattaché, réanimation D3 sur toute l'armée,
score primaire et secondaire, et journal du tour. La liste ouverte reste
consultable en dessous, en lecture seule.

## Fonctions

- **Simulateur** — une unité contre une cible : chaîne touche → blessure →
  sauvegarde calculée exactement, puis 30 000 simulations pour la répartition
  des dégâts entre figurines (surtue comprise).

  **La cible ne plafonne pas le compte.** Savoir qu'un gros paquet efface les
  cinq marines à coup sûr n'apprend rien ; ce qui compte est *combien* de
  figurines tombent. Le tir continue donc sur des figurines fraîches, et le
  résultat se lit en seuils de certitude : à coup sûr, 9 fois sur 10, 3 fois
  sur 4, 1 fois sur 2. La chance de balayer l'unité ciblée reste affichée —
  elle se dérive de la même distribution.
- **Mes listes** — plusieurs listes coexistent, chacune avec son nom et son
  plafond de points. L'index les présente avec leur total, leurs détachements
  et leur nombre d'unités ; on en crée, on en duplique, on en supprime depuis
  cet index. Le budget de Points de Détachement suit le plafond : 3 PD à 2000
  points, au prorata ailleurs.
- **Liste en service** — plusieurs listes cohabitent ; celle qui alimente le
  simulateur et l'écran de partie se choisit d'une touche, en tête de ces deux
  écrans ou depuis l'index. Chaque liste garde **sa propre partie** : en changer
  n'efface plus celle d'en face.
- **Ma liste** — construction de la liste ouverte : détachements (tags
  d'exclusivité), unités, armement par emplacement, personnages attachés
  (Leader / Support) **avec leur propre armement**, validation (règle des
  trois, Battleline, Epic Hero).
- **Mots-clés de la cible** — la cible porte ce qu'elle *est* (Infanterie,
  Véhicule, Monstre, Personnage, Volant), deviné de l'archétype ou de la
  datasheet choisie et rectifiable d'une touche. Les règles conditionnées par
  le genre de la cible s'appliquent alors toutes seules, et disent pourquoi.
- **Palmarès** — les 136 armes de la faction passées au moteur contre la cible
  du moment et rangées, par arme ou par unité, en puissance brute ou au point,
  sur toute la faction ou sur ce qu'on possède. Fiches nues : effectif maximum,
  sans détachement ni personnage rattaché — une carte du terrain, pas un calcul
  de partie.
- **Stratagèmes dans les retouches** — sur quarante-trois fiches, six touchent
  la séquence d'attaque : elles apparaissent en pastilles, avec leur coût en PC,
  filtrées par détachement retenu, par phase et par mots-clés de l'unité
  chargée. Les règles du détachement, qui s'appliquent sans qu'on les coche,
  s'y lisent en clair juste dessous.
- **Combien il en faut** — plusieurs unités tirent dans l'ordre sur la même
  cible, et l'écran lit après chaque activation ce qui reste debout et la
  chance d'avoir tout couché : « il en faut 3 pour coucher un Char lourd trois
  fois sur quatre ». Un multiplicateur par ligne permet d'éprouver un effectif
  qu'on n'a pas encore acheté.
- **Comparer** — met des unités côte à côte contre la cible du moment, classées
  par dégâts pour 100 points. Les deux mesures — puissance brute et
  rendement au point — se lisent côte à côte sur une seule ligne par
  unité, chaque colonne à sa propre échelle. « Depuis ma liste » y verse des **unités
  entières** — armement réel, personnages rattachés, amélioration et octrois du
  détachement — de sorte qu'on peut opposer la même escouade menée par deux
  personnages différents et lire ce que chaque aura rapporte. « Du catalogue »
  mesure une fiche nue, une arme à la fois.
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
- **Un membre à la fois** — dès qu'un personnage rejoint une unité, une case
  par membre s'affiche en tête du panneau : l'escouade, puis chaque
  personnage. On règle celui qu'on touche — son effectif, son armement — au
  lieu de dérouler le groupe entier. Le panneau d'un personnage rappelle ce
  qu'il apporte à l'unité qu'il mène.
- **Ce que le groupe reçoit** — les aptitudes qu'un détachement ou un
  personnage rattaché accorde aux armes du groupe, avec leur texte officiel et
  leur source. Elles ne figurent sur aucune fiche technique : c'est le seul
  endroit où on les lit.
- **Équipement du groupe** — deux tableaux, tir et corps à corps, avec le
  profil complet de chaque arme et ses aptitudes en pastilles — celles de la
  fiche en gris, celles qu'un détachement ou un personnage accorde en cyan et
  précédées d'un `+`. Chaque pastille porte sa définition officielle en
  infobulle. Ils couvrent toute
  l'armurerie de la fiche : l'escouade **et** chaque personnage rattaché, dont
  le nom est porté sous l'arme, options laissées de côté comprises — grisées,
  pour qu'on voie ce qu'on n'a pas pris autant que ce qu'on porte.
- **Réordonner les unités** — un bouton bascule le pavé en mode réorganisation.
  On y **attrape une case et on la pose où on veut** : les autres s'écartent
  en glissant, et le trou s'ouvre du côté de la case survolée dont on est le
  plus près. Deux flèches restent sur chaque case pour un déplacement d'un
  cran. Les cases d'outils et d'ajout s'effacent, et toucher une case ne
  l'ouvre plus.

  Le glissement passe par les **Pointer Events**, pas par l'API drag-and-drop
  du HTML — celle-ci n'existe pas sur mobile, et c'est au doigt que le pavé se
  manipule. Le même code sert donc à la souris. Un seuil de 8 px distingue le
  glissement de l'appui, et le pavé défile tout seul quand le doigt approche
  d'un bord de l'écran.
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

  Une option peut porter un **plafond** : la fiche des Arpenteurs Sépulcraux
  n'ouvre l'isolateur transdimensionnel qu'à une figurine, et celle des
  Macrocytes limite de même le faisceau atomiseur et la mandibule
  accélératrice. Le compteur s'arrête au plafond, qui est rappelé sur la
  ligne. Une option peut aussi ne donner **aucune** arme — la mandibule est
  une aptitude d'équipement, pas une arme — et porte alors son propre nom.
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
  dans le total, et **la cible que la fiche officielle leur assigne** : la
  phrase de restriction — « Figurine de CRYPTEK seulement », « Unité de
  GUERRIERS NÉCRONS seulement » — est enregistrée avec chaque amélioration.

  La liste de choix montre d'abord celles que le groupe peut réellement
  porter, en nommant le porteur, et range les autres sous « hors de portée de
  ce groupe » avec la phrase qui l'explique. Une amélioration prise indique
  **qui la porte** — un personnage rattaché, ou l'unité elle-même quand la
  fiche vise l'unité — et un bouton fait tourner entre les porteurs éligibles
  quand le groupe en compte plusieurs. Le porteur suit le lien de partage et
  figure dans le texte exporté.

  Chaque entrée porte **son texte de règle en entier** : c'est ce qu'elle fait
  qui décide du choix, pas son nom. Le tiroir affiche aussi, en tête, combien
  d'améliorations chaque détachement retenu ouvre — ce n'est pas toujours
  quatre. Le codex en donne quatre par détachement, le pack de faction deux
  pour ses trois premiers, et **aucune** pour le Panthéon de Malheur, qui
  impose à la place des Aptitudes d'Entrave Nécrodermique.

  Contrôles : le plafond du format, jamais deux fois la même, et un signal
  quand personne dans le groupe ne peut la porter. Un Epic Hero n'est jamais
  éligible.
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
Wahapedia, puis avec le **Munitorum Field Manual** (pages Detachments et Units,
relevées en 08/2026). Les 345 prix du MFM sont vérifiés programmatiquement, sans
écart. Tous les champs restent modifiables dans l'application.

Le MFM ne facture pas une unité au même prix selon le nombre de copies déjà
prises — « YOUR 1ST TO 2ND UNITS COST 50 pts », « YOUR 3RD + UNIT COSTS
60 pts ». Le champ des points accepte donc deux écritures : le barème simple
`{effectif: points}` quand le prix ne bouge jamais, et la liste de paliers
`[[rang, barème], …]` pour les dix-sept unités qui renchérissent. Le rang se
compte sur toute l'armée, personnages rattachés compris ; le catalogue annonce
le prix de la copie à venir, pas celui de la première.

Le MFM donne les noms et les coûts, jamais les règles : les quatre optimisations
du Panthéon de Malheur portent leur coût et une mention explicite à la place
d'un texte inventé. Les dispositions de force sont rendues telles que le MFM les
imprime, en anglais.

Deux unités du MFM manquent encore, faute de fiche : Overlord with Translocation
Shroud et Seraptek Heavy Construct.

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
