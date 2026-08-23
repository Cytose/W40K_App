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

## Travailler à plusieurs

Le dépôt porte quatre branches, et une règle simple : **une branche appartient
à une personne, et personne d'autre ne la réécrit.**

| Branche | À qui | Qui la réécrit |
|---|---|---|
| `main` | tout le monde | personne directement — on y arrive par fusion d'une PR |
| `dev/kevin` | Kevin | Kevin seul |
| `dev/Guillaume` | Guillaume | Guillaume seul |
| `claude/...` | l'assistant | l'assistant seul |

Cette règle est née d'une panne. Après chaque fusion, les branches `dev/*`
étaient réalignées sur `main` par un `push --force`. Vu du dépôt, c'était
propre : tout le monde repartait de la dernière version. Vu de celui qui
travaillait dessus, sa branche changeait sous ses pieds, et son `push` suivant
était refusé — *non-fast-forward*. Le symptôme ressemble à un problème de
droits ; ce n'en est pas un.

**Pour récupérer les derniers changements, c'est à toi de tirer, quand tu
veux :**

```
git fetch origin
git merge origin/main        # ou : git rebase origin/main
```

Personne ne pousse dans la branche d'un autre. Une branche qu'on ne contrôle
pas est une branche sur laquelle on ne peut pas travailler.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | structure et thème (noir nécrodermis / vert gauss / cyan phasique) |
| `data.js` | 50 datasheets (profil complet, CO et Cd), 136 profils d'armes avec portée, composition de l'armement, aptitudes d'unité, règle de faction, glossaire des mots-clés, 12 détachements, rattachements, améliorations avec leur cible, socles, octrois d'aptitudes d'arme |
| `engine.js` | moteur de dés : espérances exactes + simulation Monte-Carlo |
| `app.js` | onglet Simulateur |
| `roster.js` | axes Listes et En partie, vue Comparer, fiche d'unité, partage, encodeur QR |
| `layouts.js` | les 45 dispositions de champ de bataille : zones de déploiement, objectifs, décors, missions primaires |
| `plateau.js` | axe Plateau |
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

## Les quatre axes

L'application est organisée en quatre axes, qui correspondent aux quatre moments
d'une partie. Elle s'ouvre sur le premier : on construit sa liste avant de la
mesurer, on la mesure avant de la poser, et on la pose avant de la jouer.

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

**Plateau** — la table telle qu'elle sera. Le croisement de ta Disposition de
Force et de celle d'en face désigne une des quinze cartes officielles, chacune
en trois variantes : l'écran affiche celle-là, avec les deux zones de
déploiement, les objectifs et le décor, à l'échelle sur 44 × 60 pouces et sur
une grille de six.

La Disposition vient du détachement retenu ; quand plusieurs détachements en
ouvrent plusieurs, on choisit. Les deux missions primaires que le croisement
génère sont nommées, la tienne et la sienne.

En dessous, les unités de la liste en service. Toucher une unité la pose dans
ta zone, **figurine par figurine** : dix Guerriers sont dix socles de 32 mm à
l'échelle du plateau, posés en quinconce, resserrés jusqu'à ce que l'unité
tienne dans ses 9 pouces de prise au sol. Les socles viennent du **Base Size
Guide** de l'Event Companion, ovales compris — une Arche du Jugement occupe ses
120 × 92 mm, pas un rond de convenance.

On déplace **l'unité entière ou une seule figurine**, au choix, et la
**distance parcourue s'affiche en pouces sur le plateau pendant le geste**, avec
ce qu'il reste du mouvement de l'unité. La **cohésion** se vérifie en même
temps : une figurine à plus de 2 pouces bord à bord de sa voisine — de ses deux
voisines dès sept figurines — se cerne de rouge, et la prise au sol de l'unité
est annoncée, signalée au-delà de 9 pouces. « Reformer en quinconce » remet
l'escouade d'aplomb autour de son centre.

Chaque socle porte la **couleur de la famille de son métier**, et un personnage
rattaché se distingue par un point clair. L'unité sélectionnée montre ses
**portées de menace** — mouvement, mouvement + charge (7 pouces, la moyenne de
2D6, pas une garantie), mouvement + portée de son arme la plus longue, mesurées
depuis le bord de sa prise au sol — et l'écran dit si elle est toute dans ta
zone, à cheval, ou dehors.

Le décor officiel est déjà en place. Les cinq empreintes du pack de terrain
restent disponibles pour le corriger ou éprouver une autre table ; positions et
décor ajouté sont enregistrés par liste.


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

## Compagnon de Rencontre, 22/08/2026

Un troisième document officiel s'est ajouté : le **Compagnon de Rencontre
Warhammer version 1.1**, celui qui porte les 45 agencements de terrain.

Il a d'abord servi à trancher une règle que l'application appliquait de
travers. Les Règles de Base, section 08.02, disent qu'à l'étape des PC de
Base « chaque joueur gagne 1 Point de Commandement », et l'encadré de la page
30 précise « à chaque tour ». Il y a deux phases de Commandement par round de
bataille : chaque joueur en gagne donc **deux par round**, un au sien, un à
celui d'en face. L'application n'en accordait qu'un, au tour de son seul
propriétaire. Le Compagnon confirme la lecture en plafonnant l'autre moitié :
« à l'exclusion des PC de Base, chaque joueur gagne un maximum de 1 PC par
round de bataille ».

Le même document fixe les plafonds de score, que l'axe En partie ignorait :
45 PdV pour la mission principale, 45 pour les missions secondaires, 10 pour
une armée peinte au standard Paré au Combat, et « tout PdV marqué au-delà de
ces maximums est ignoré ». Les compteurs s'arrêtent maintenant à leur plafond,
l'affichent, et la ligne de l'armée peinte a été ajoutée : le total va de 0 à
100.

Enfin, il donne la liste des gabarits de zones de terrain employés par les
agencements recommandés, avec leur quantité — 7″ × 11,5″ ×4, 8″ × 11,5″
polygonal ×2, 10″ × 2,5″ ×2, 6″ × 4″ ×4, 6″ × 2″ ×4, soit seize zones par
agencement. C'est une source entièrement indépendante de 40kdc-data, d'où
`layouts.js` est produit. `npm run gabarits` mesure les 720 zones des 45
cartes et retrouve **les cinq gabarits au compte officiel exact**, ce qui
vérifie la géométrie générée au lieu de la supposer.

Mesurer demandait une précaution : une boîte englobante alignée sur les axes
gonfle dès qu'une pièce est posée de biais, et englobe les petites
excroissances par lesquelles l'ombre d'une ruine déborde de sa zone. Le
gabarit de 10″ × 2,5″ se lisait ainsi 10,2 × 3,4. On mesure donc l'écartement
des deux longs côtés porteurs. Le gabarit polygonal, lui, n'est pas un
rectangle — le document le dit — et se reconnaît par élimination.

Une lacune du glossaire a été comblée au passage : **Mouvement d'Éclaireur**
(24.32), qui manquait alors que les 35 autres aptitudes de la section 24 y
étaient. Et le rappel de la phase de Charge parlait encore de
« Surveillance », nom que la 11e a remplacé par **Tir en État d'Alerte**.

Trois vérifications sont rejouables : `npm run gabarits` (les gabarits
officiels), `npm run dispositions-test` (les invariants de géométrie) et
`node outils/test-pc.mjs` (le gain de PC, navigateur, site servi sur `:8099`
ou `$SITE`).

## Le plateau, couché ou debout

Le plateau est **stocké en portrait**, comme la carte officielle : 44″ de large
sur 60″ de long, origine en haut à gauche. Il s'affichait toujours **couché**,
parce qu'un plateau debout ne laisse presque rien voir sur un téléphone —
`X = y`, `Y = 44 − x`, et les angles perdent 90°.

Le problème n'est apparu qu'en comparant l'écran au document : couchée, la
diagonale d'une zone de déploiement penche dans l'autre sens que sur la carte
imprimée. Rien n'est faux, mais on ne peut plus rien vérifier — impossible de
dire si c'est la donnée qui se trompe ou l'affichage.

Un bouton **Redresser** a donc été posé dans l'en-tête de la carte. Debout,
l'écran reprend exactement l'orientation de la carte officielle, et les deux se
superposent. La donnée ne bouge pas : seule la projection change.

`node outils/test-orientation.mjs` l'établit dans les deux sens, sur la carte
Sabotage variante B — deux triangles, le cas où une erreur d'orientation se
verrait le plus. Couché, les sommets dessinés sont l'image exacte de
`X = y, Y = 44 − x` appliquée à `layouts.js` ; debout, ce sont les sommets de
`layouts.js`, sans transformation. Huit contrôles.

Le bouton est dans l'en-tête et non sous le plateau, et ce n'est pas un détail :
posé dans le corps de la carte, il repoussait tout ce qui suit de quarante
pixels, et `test-plateau.mjs` — qui clique à des coordonnées absolues — touchait
un autre bouton. Deux de ses contrôles tombaient. Dans l'en-tête, rien ne bouge.

## Le fond de carte

L'axe Plateau peut poser **la page officielle d'un agencement sous la
géométrie**, pour les comparer d'un coup d'œil : carte « Fond de carte »,
« Charger une image… », et un curseur d'opacité.

Les images ne sont **pas livrées** avec l'application. Ce sont les pages d'un
document de Games Workshop, et le dépôt comme le site sont publics : les
embarquer reviendrait à les rediffuser. C'est donc l'utilisateur qui charge les
siennes, depuis son propre exemplaire, et elles ne quittent pas son
navigateur — ni envoi, ni dépôt, ni Vercel.

Le calage est automatique. Sur ces pages, le plateau est un rectangle bordé
d'un trait noir : on le retrouve en cherchant, ligne par ligne et colonne par
colonne, une plage **continue** de pixels sombres assez longue. Compter les
pixels sombres ne suffirait pas — un filet de mise en page en aligne autant —
mais seul le cadre porte une plage d'un seul tenant sur presque toute la
largeur. C'est la règle de `outils/cartes-officielles.py`, portée en
JavaScript, et elle écarte au passage les repères de bord attaquant et
défenseur, qu'ils soient horizontaux ou verticaux. Si aucun cadre n'est
reconnu, l'image est posée telle quelle et l'application le dit, plutôt que de
caler de travers en silence.

Le fond suit l'orientation : couché, il pivote d'un quart de tour comme la
géométrie. Il est rangé dans IndexedDB — une image recadrée pèse quelques
centaines de kilo-octets, trop pour `localStorage` dès la deuxième — et
survit donc au rechargement.

`node outils/test-fond.mjs <page.png>` éprouve les douze points qui peuvent
casser sans bruit. Deux ont déjà lâché.

La relecture appelait une variable absente de `plateau.js` : la promesse levait
une `ReferenceError` avalée en silence, et le fond ne revenait jamais après
rechargement. Rien à la console, un écran d'apparence normale.

Et la carte ne s'ouvrait pas du tout. `plateau.js` porte déjà un gestionnaire
**délégué** sur `#scMap .card > h2` — les cartes de cet axe sont créées après
coup, donc rebranchées ainsi. Le mien basculait la classe une seconde fois :
elle s'enlevait puis se remettait. L'état d'ouverture se retient maintenant
dans ce gestionnaire, comme celui de la carte des décors.

Cette seconde faute avait échappé à la suite parce que la suite trichait :
elle retirait la classe `collapsed` à la main au lieu de cliquer l'en-tête.
Elle passait donc au vert sur une carte qui ne s'ouvrait pas. Elle clique
désormais, comme un doigt — et remise dans son état d'avant, elle tombe bien
sur le bug.

## Les zones confrontées aux pages officielles

`layouts.js` vient de 40kdc-data ; le Compagnon de Rencontre imprime les
45 agencements. Deux sources indépendantes : si la géométrie générée redonne
les aplats du document, c'est une vérification et non une coïncidence.

`npm run cartes -- <dossier>` prend un dossier d'images de pages (`pNN.png`),
repère le plateau, convertit les deux aplats de déploiement en masques
exprimés en pouces sur le plateau 44 × 60, et les confronte à nos polygones.
Les images ne sont pas versionnées : ce sont les pages d'un document de Games
Workshop, à fournir soi-même.

**Résultat sur les 45 cartes : 45 conformes, aucun écart.** Notre zone couvre
de 98,0 % à 99,8 % de l'aplat officiel, rien ne tombe dans la mauvaise zone,
et à chaque fois la lettre d'agencement imprimée sur la page ressort comme la
meilleure des trois. L'écart résiduel — de 2,00″ à 3,75″ — est l'épaisseur
d'un décor posé sur la zone.

Les **90 noms de mission** sont confrontés au passage, eux aussi sans écart.
Chaque joueur a la sienne selon sa Disposition des Forces, et la table les
porte séparément : *Locate and Deny* pour le joueur Perturbation face à Atouts
Prioritaires, *Extract Relic* pour son adversaire.

`outils/cartes.json` porte ce que dit le bandeau de chaque page — les deux
Dispositions, les deux missions, la lettre. Les 45 pages ont été lues une par
une. L'ordre est régulier (trois agencements par appariement, les appariements
dans l'ordre des Dispositions) mais il a été vérifié, pas supposé.

Trois précautions, chacune apprise d'une mesure fausse :

- Le cadre ne se trouve pas en comptant les pixels sombres d'une ligne : un
  filet de mise en page en aligne autant. On exige une plage **continue**
  assez longue — 800 px en largeur, 1100 en hauteur. Cela écarte au passage
  les repères de bord attaquant et défenseur, rouges et bleus eux aussi, sans
  avoir à les reconnaître : ils sont horizontaux ou verticaux selon
  l'agencement, et deux pages sur six y résistaient.
- Les décors sont dessinés **par-dessus** les aplats. Comparer les aires donne
  71 % là où la géométrie est juste au dixième de pouce. On ne compare donc
  que là où le document se prononce : un décor masque la couleur, jamais
  l'inverse.
- Qui est rouge et qui est bleu dépend de l'attaquant et du défenseur, et rien
  ne dit laquelle de nos deux zones tient ce rôle. On essaie les deux
  appariements : compter l'échange comme une erreur faisait passer
  *Disruption vs Disruption* pour fausse à 0,000 alors qu'elle est à 0,994.

### Le décor

Les zones se lisent d'un coup : deux aplats francs. Le décor, non — c'est du
gris sur du gris, et trois couches se ressemblent. Le fond du no man's land
est un gris **chaud** clair, quadrillé, de somme RVB ≈ 625 ; le gabarit posé
dessus est un gris **neutre** de gravats, entre 250 et 600 ; les ruines qui le
garnissent portent des teintes franches.

`npm run decors -- <dossier>` classe au pixel, puis vote à la maille de 0,25″
— une ligne de quadrillage large d'un ou deux pixels est minoritaire dans une
maille de cinq, elle disparaît sans qu'on ait à l'éroder — et retire enfin les
taches de moins de dix mailles, un gabarit en faisant des dizaines.

Ce masque suit les **gravats**, pas le contour du gabarit : il en couvre les
deux tiers. On ne peut donc pas en tirer une cote au dixième de pouce comme
pour les zones. Deux choses sont établies, toutes deux falsifiables :

- **Chaque page reconnaît sa propre carte parmi les 45.** 41 la reconnaissent
  seule, avec une avance médiane de 0,22 sur la deuxième ; les 4 autres sont à
  égalité — au millième — avec une carte que le document lui-même dessine à
  l'identique. Vérifié en confrontant les pages officielles entre elles :
  *Perturbation vs Perturbation* et *Reconnaissance vs Reconnaissance*
  réemploient le même agencement de décor, lettres permutées, avec un
  recouvrement mutuel de 0,85 à 0,97. Nos données font de même. Rien ne peut
  départager deux images identiques, et c'est le document qui se répète.
- **Aucun décalage d'ensemble ne rattrape mieux nos décors.** On essaie les
  289 translations de ±2″ par quart de pouce : sur 42 cartes le zéro est déjà
  l'optimum, et les trois autres gagneraient 0,1 % pour un quart de pouce —
  une maille, soit du bruit.

Couverture médiane 0,85. Les 18 pièces qui tombent sous 0,30 sont toutes du
gabarit 6″ × 2″ — la barricade, dont l'illustration est une clôture qui remplit
mal son emprise — et se répartissent sur treize pages ; les trois autres
familles de gabarit n'en comptent aucune. C'est une limite de la mesure, pas
une carte fautive.

Ce qui reste hors de portée : la **cote exacte** d'un décor. `npm run gabarits`
confirme le nombre et les dimensions des gabarits sur une source indépendante,
`npm run decors` leur agencement ; leurs coordonnées au dixième de pouce
viennent toujours de 40kdc-data.

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
Les empreintes de socle viennent désormais du **Base Size Guide** de
l'Event Companion v1.1 (Games Workshop, mis à jour juin 2026) : les 46 fiches
nécrones de sa section NECRONS, reprises telles qu'il les écrit, ovales
compris. `SOCLES` porte la source, `BASES` n'en est plus qu'une lecture pour la
fiche d'unité. Deux entrées du guide ne portent pas de dimension mais un nom de
produit — Large et Small Flying Base : les valeurs retenues, 120 × 92 et
60 × 35,5, sont une déduction signalée comme telle dans `data.js`.
