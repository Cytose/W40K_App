# Ce qui manque — audit de l'application et proposition

Rédigé après un tour complet de l'application écran par écran, et un
tour d'horizon de ce qui se fait ailleurs (WarOrgan, New Recruit, Sigdex,
ListForge, BattleBase, GrimSlate, l'appli officielle Warhammer 40 000).

Rien n'est décidé ici : c'est une liste de constats et une proposition
d'ordre de marche. Tout est arbitrable.

---

## 1. L'état des lieux

### Ce qui tient debout

| Axe | État |
|---|---|
| **Listes** | index multi-listes, plafond par liste, création / duplication / suppression, pavé de tuiles, réorganisation, panneau par unité |
| Armement | répartition panachée (5 Tesla / 5 Gauss), échange d'arme, armes multi-profils (Rod of covenant) |
| Personnages | rattachement contrôlé (un chef, un soutien, escorte suspendue à un CRYPTEK), améliorations |
| Détachements | budget de PD, tags d'exclusivité, règles appliquées au simulateur |
| Validation | plafond de points, PD, règle des trois / six / Epic Hero, doublons d'améliorations, figurines sans arme |
| **Simulateur** | attaque unitaire, tir cumulé avec surtue et rendement /100 pts, comparateur, encaissement |
| **En partie** | affichage de la liste en lecture seule |
| Technique | hors-ligne (PWA), plein écran, lien de partage compressé, fichier HTML autonome |

Le simulateur est, très honnêtement, **au-dessus de ce que proposent les
autres**. Le tir cumulé avec calcul de surtue et colonne « dégâts pour
100 points » n'existe nulle part ailleurs sous cette forme : ListForge a
un mathhammer intégré, mais unité par unité.

### Ce qui est en retard

L'éditeur de liste. Et le retard n'est pas d'abord ergonomique — il est
dans les **données**.

---

## 2. Le vrai retard : les données

`data.js` ne contient que des chiffres de combat. Il manque, pour chaque
unité :

| Manque | Conséquence concrète |
|---|---|
| **La portée des armes** | on ne peut pas savoir si un Gauss blaster tire à 24" ou à 36". Une aide de jeu sans portée n'est pas une aide de jeu. |
| **Le CO (contrôle d'objectif)** | la caractéristique qui décide des parties. Absente. |
| **Le Cd (commandement)** | absent. |
| **Les aptitudes d'unité** | aucune. Pas de Reanimation Protocols, pas de Living Metal, pas d'aura. |
| **La règle de faction** | absente. |
| **Le texte des stratagèmes** | 16 fiches sur 17 affichent « texte non renseigné ». Et 10 détachements sur 11 n'ont aucun stratagème. |
| **La capacité des transports** | absente ; les transports ne sont pas rattachables à une unité. |
| **Les mots-clés d'arme expliqués** | « Lethal Hits » s'affiche, mais rien ne dit ce que ça fait. |
| **La version des points** | rien n'indique de quel Munitorum la liste est datée. |

**La bonne nouvelle** : le catalogue BattleScribe que j'ai récupéré
(`Necrons.cat`) contient déjà, vérifié :

- **196 portées d'armes**
- **257 textes d'aptitudes** (unités, améliorations, pouvoirs de C'tan, aptitudes Triarch)
- **67 profils complets** avec M, Cd, CO, E, Svg, PV
- la **capacité des transports**

Deux réserves : ces textes sont **en anglais**, et le catalogue s'est
révélé **périmé sur les points** (7 justes sur 12 lors de la
vérification — tes chiffres à toi étaient les bons). Donc : on importe
les portées, les aptitudes, le CO et le Cd, **on ne touche pas aux
points**.

---

## 3. Ce que font les autres et que nous n'avons pas

| Fonction | Qui la fait | Chez nous |
|---|---|---|
| Portées et aptitudes affichées | tous | ✗ |
| Force Disposition (11e) | New Recruit, appli officielle | ✗ |
| Import d'une liste BattleScribe / New Recruit (`.ros`, `.rosz`) | New Recruit, Sigdex, Warscribe | ✗ |
| Export texte au format tournoi (ITC / BCP) | tous | ✗ (on n'a qu'un lien et un JSON) |
| Export PDF / impression | ListForge, New Recruit | ✗ |
| Partage par QR code | New Recruit, ListForge | ✗ (lien seulement) |
| Suivi de collection (« ai-je les figurines ? ») | New Recruit, ListForge | ✗ |
| Notes libres sur une unité | ListForge | ✗ |
| Compteur de PC en partie | appli officielle, ListForge, BattleBase | ✗ |
| Suivi de partie : PV, pertes, tour, score | ListForge, BattleBase, appli officielle | ✗ |
| Vue « écran adverse » | appli officielle, ListForge | ✗ |
| Historique et statistiques de parties | ListForge, New Recruit, BattleBase | ✗ |

### Une règle 11e à trancher

D'après ce que j'ai lu, la 11e édition autorise **2 améliorations à
1000 pts et 4 à 2000 pts**, avec en plus des « Upgrades » accessibles aux
unités sans personnage (jusqu'à 3, ne consommant qu'un seul emplacement).
Or l'application plafonne **en dur à 3**, quel que soit le format.

Je n'ai pas de source officielle sous la main, seulement de la presse
spécialisée. **Confirme-moi la règle et je corrige.**

---

## 4. Les manques de l'éditeur, en détail

### Fluidité (c'est ce qui te fait dire que WarOrgan va plus vite)

1. **Après avoir ajouté une unité, on est éjecté dans son panneau.** Pour
   en ajouter cinq, il faut ressortir cinq fois. Il faudrait **rester dans
   le sélecteur**, avec le total qui monte en direct et un badge sur ce
   qui vient d'être posé.
2. **La taille par défaut est la plus grande.** Ajouter des Necron
   Warriors pose ×20 à 190 pts d'emblée. Et le catalogue affiche pour
   chaque unité **le prix de sa taille maximale** — donc on croit tout
   plus cher que ça ne l'est. Il faudrait afficher une fourchette
   (« 95–190 pts ») et poser la taille minimale.
3. **Le sélecteur ne dit pas ce qu'il reste au budget.** On ajoute, puis
   on découvre qu'on a dépassé.
4. **Pas d'annulation.** Une suppression d'unité est définitive.
5. **Dupliquer oblige à ouvrir l'unité.** Devrait être sur la tuile.
6. **Le pavé ne signale pas les unités en faute.** L'avertissement est
   global ; la tuile fautive n'est pas marquée.
7. **Pas de tri ni de filtre du pavé**, pas de sous-total par catégorie.
8. **Recherche du catalogue limitée** au nom, à l'arme et à la catégorie —
   pas aux mots-clés (CANOPTEK, VEHICLE), pas de filtre « ce qui rentre
   encore dans mon budget ».
9. **Pas de mise en page ordinateur.** Le pavé reste en colonnes étroites
   sur grand écran alors qu'on pourrait voir la liste entière d'un coup.

### Sortie et partage

10. Pas d'export texte lisible, ni de copie dans le presse-papier.
11. Pas d'impression ni de PDF.
12. Pas de sauvegarde globale de toutes les listes en un fichier.
13. Pas d'import depuis une autre application.

### L'axe « En partie »

Il n'affiche aujourd'hui que la liste en lecture seule. Il manque tout le
reste : compteur de PC, tour et phase en cours, PV restants par unité,
Reanimation Protocols, rappel des stratagèmes jouables dans la phase
courante, score.

### Technique

14. Pas de `package.json` alors que `build.js` a besoin de terser.
15. La branche par défaut du dépôt est encore la branche de travail, pas `main`.
16. La composition de Convergence of Dominion (1 à 3 éléments) reste une
    invention de ma part.

---

## 5. La proposition

Six chantiers. L'ordre est celui du rapport bénéfice / effort, pas celui
de la difficulté.

### Chantier 1 — Enrichir les données depuis le catalogue

Portées, CO, Cd, capacité des transports, aptitudes d'unité, aptitudes
des améliorations, pouvoirs de C'tan. Extraction automatique, points
laissés intacts.

C'est le chantier qui débloque tous les autres : sans portée ni aptitude,
ni l'aide de jeu ni la fiche d'unité ne peuvent exister.

*Réserve : textes en anglais. Je peux les traduire, mais une traduction
maison de texte de règles est un risque en partie — à toi de dire.*

### Chantier 2 — La fiche d'unité complète

Une vraie datasheet : profil, armes avec portée, aptitudes, mots-clés,
consultable depuis la liste **et** depuis le catalogue avant d'ajouter.
C'est ce que Sigdex fait bien et qui manque le plus ici.

### Chantier 3 — Fluidifier l'éditeur

Les points 1 à 9 ci-dessus. Aucun besoin de données nouvelles, gain
immédiat sur la vitesse de construction. C'est le chantier qui répond
directement à « WarOrgan va plus vite ».

### Chantier 4 — Entrées et sorties

Export texte tournoi, copie presse-papier, impression / PDF, QR code,
sauvegarde et restauration de toutes les listes, import BattleScribe.

### Chantier 5 — L'axe « En partie »

Compteur de PC, tour et phase, PV et pertes par unité, Reanimation,
stratagèmes filtrés par phase, score. C'est le plus gros morceau et le
plus dépendant de données que je n'ai pas (texte des stratagèmes).

### Chantier 6 — Finitions

Force Disposition, limite d'améliorations corrigée, mise en page
ordinateur, `package.json`, branche par défaut, composition de
Convergence of Dominion.

---

## 6. Ce dont j'ai besoin de toi

| Question | Pourquoi |
|---|---|
| **Le texte des stratagèmes** | tu avais dit le transmettre ; sans lui, l'axe « En partie » reste creux |
| **La limite d'améliorations en 11e** — 3 partout, ou 2/4 selon le format ? | la validation est fausse dans un cas comme dans l'autre |
| **Les Force Dispositions** de tes détachements | absentes du catalogue |
| **Traduire ou non les aptitudes** | anglais fidèle contre français maison |
| **La composition de Convergence of Dominion** | 1 à 3 éléments est une invention |
| **L'ordre des chantiers** | celui proposé est discutable |


---

## 7. Où en est le chantier

Décision du 19/08/2026 : limite d'améliorations à 4 pour 2000 points,
stratagèmes laissés en anglais, feu vert sur l'ensemble.

| Chantier | État |
|---|---|
| 1. Enrichir les données | **fait** — 141 portées sur 142, CO, Cd, 53 jeux d'aptitudes, transports, règle de faction, glossaire de 31 mots-clés |
| 2. Fiche d'unité | **fait** — depuis la liste, depuis le catalogue avant d'ajouter, depuis l'axe En partie |
| 3. Fluidifier l'éditeur | **fait** — catalogue persistant, budget en direct, taille minimale, fourchette de prix, recherche par mot-clé, appui long, annulation, écran large |
| 4. Entrées et sorties | **fait** — texte tournoi, presse-papier, impression, lien, QR code, sauvegarde fichier, import `.ros` |
| 5. Axe En partie | **fait** — tour, phase, PC, PV par unité, réanimation, score, stratagèmes jouables, journal |
| 6. Finitions | **fait** — limite d'améliorations 2/4, Disposition de Force en saisie libre, `package.json` |

### Ce qui reste en suspens

- **Le texte des stratagèmes** — absent du catalogue BattleScribe comme du
  fichier de système, et la presse spécialisée n'en donne que des paraphrases.
  Plutôt que d'inscrire une règle approximative dans une aide de jeu,
  l'application permet désormais de la saisir : elle reste sur l'appareil et
  voyage dans la sauvegarde.
- **La composition de Convergence of Dominion** — 1 à 3 éléments reste une
  invention.
- **La portée de l'Aeonstave blast du Chronomancer** — le catalogue ne connaît
  que le « Chronomancer's stave », de corps à corps : il n'a pas suivi le
  dernier faction pack.
- **Les aptitudes sont en anglais** — texte du catalogue, non traduit.
- **La branche par défaut du dépôt** est toujours la branche de travail.

## 8. Les documents officiels — 19/08/2026

Kévin a transmis deux PDF publiés librement par Games Workshop : le **Pack de
Faction Nécrons version 1.1**, valide pour le jeu égal à partir du 22 juillet
2026, et les **Règles de Base**. Ils règlent d'un coup le point resté ouvert au
chantier 6.

### Ce qui en a été repris

| Élément | Source | Avant | Après |
|---|---|---|---|
| Stratagèmes | pack + règles de base §15 | 17 fiches, 1 texte complet | **43 fiches, toutes complètes, en français** |
| Règles de détachement | pack | résumé maison | texte officiel pour les 7 du pack |
| Optimisations | pack | 34, anglais | **38, dont 20 au texte officiel français** |
| Aptitudes d'unité | pack | anglais | 8 fiches du pack en français |
| Protocoles de Réanimation | pack, mises à jour | ancien texte détaillé | nouveau texte : D3 PV en fin de phase de Commandement |
| Glossaire | règles de base §24 | 31 entrées, anglais | **35 entrées, français officiel** |
| Mots-clés d'arme affichés | règles de base §24 | anglais | français |

Les errata du pack ont été appliqués aux fiches existantes : Chronomancien
(Cape d'Uchronie), Plasmancien (Foudre Consciente), Monolithe (Portail
d'Éternité), Roi Silencieux (Marche Implacable et mots-clés), Réanimateur
Canoptek, Console de Commandement (Orbe de Résurrection et mot-clé NOBLE),
Destroyers Ophydiens, C'tan Transcendant (Déplacement Transdimensionnel),
Seigneur Lokhust (Résurrection), plus le mot-clé CHÂSSIS sur neuf fiches.

Les valeurs en points ne figurent pas dans le pack — elles vivent dans
l'Inventaire du Munitorum — donc celles de `data.js`, vérifiées en 08/2026,
n'ont pas bougé. Cinq optimisations du pack n'ont donc pas de coût : elles
affichent « coût inconnu » et ne comptent rien dans le total.

### Deux erreurs trouvées au passage

- Les **Bolas Gravitiques** étaient rangées sous Fer de Lance Linceul Céleste ;
  le pack les donne au Conclave de Crypteks.
- La **sismolance du Géomancien** était enregistrée sans portée, sous le nom
  inventé de « Tremorglaive ». Ses deux profils de tir portent à 18″.

### Ce qui reste en suspens

- **Les stratagèmes des cinq détachements du codex** — Dynastie Éveillée, Cour
  Canoptek, Légion d'Annihilation, Phalange d'Obéissance, Légion d'Hypercrypte.
  Le pack ne les reprend pas. Le formulaire de saisie reste en place pour eux.
- **Leurs seize optimisations** restent en anglais, texte du catalogue.
- **La composition de Convergence of Dominion** — toujours inconnue.
- **La portée de l'Aeonstave blast du Chronomancer** — le pack ne donne pas
  cette fiche.
- **Une contradiction du pack lui-même** : page 30 il retire « Meneur » aux
  Crypteks et leur donne « Appui », mais la fiche du Géomancien page 17 porte
  encore « Meneur ». Les deux versions sont signalées sur la fiche.
- **Deux fiches d'errata non rattachées** : « Faucheur » (M et CO remplacés par
  « — ») et « Moissonneur » (M 14″, Stationnaire, plus AÉRODYNE). Aucune unité
  de la table ne porte ces noms de façon certaine ; le second correspond au
  Night Scythe, dont les corrections sont déjà appliquées.
- **La branche par défaut du dépôt** est désormais `main`.

## 9. Retrait des Legends — 19/08/2026

Kévin ne joue jamais les unités Legends. Trois d'entre elles étaient dans la
table : **Nemesor Zahndrekh**, **Vargard Obyron** et **Lord**. Elles sont
retirées, ainsi que leurs six profils d'armes, leurs aptitudes, leurs
rattachements, leurs socles, leurs catégories et leurs entrées dans les
groupes de mots-clés `noble` et `epic`. La table passe de 53 à 50 unités,
sans référence pendante.

Le drapeau `legends` de `UNITS` et le badge qui l'affiche restent en place :
ils ne coûtent rien et resservent si une unité Legends revient.

**Une unité inconnue ne disparaît plus en silence.** Jusqu'ici, une liste
enregistrée citant une unité absente de la table la voyait simplement ignorée
du pavé, tout en restant dans les données et hors du total. Elle est
maintenant retirée au chargement, sauvegardée, et nommée dans un message.
Cela vaut aussi pour un personnage rattaché.

### Le Faucheur et le Moissonneur

Kévin pensait qu'il s'agissait d'unités Legends. Le catalogue donne la liste
des Legends nécrons — Anrakyr, Obyron, Zahndrekh, Lord, Canoptek Tomb Stalker,
Tomb Sentinel, Acanthrites, Tesseract Ark, Gauss Pylon, Sentry Pylon, Night
Shroud — et aucune ne correspond.

Ce sont les deux aérodynes de la table :

- **Faucheur = Doom Scythe.** La section 23.02 des règles de base ne laisse
  aux AÉRODYNES qu'un mouvement d'arrivée, et ils ne tiennent pas d'objectif :
  d'où un M et un CO à « — ». Appliqué.
- **Moissonneur = Night Scythe.** L'errata lui retire AÉRODYNE, fixe son M à
  14″ et lui donne Stationnaire puis Frappe en Profondeur — exactement la
  refonte que BSData avait déjà relevée sur le Night Scythe, source
  indépendante. Déjà appliqué en base.

Le rattachement reste une déduction, pas une lecture : il est signalé comme
telle sur les deux fiches.

### Le Géomancien

Décision de Kévin : on le laisse en **Appui**, et on laisse le doute planer
sur « Meneur ». La fiche continue de signaler la contradiction du pack.

## 10. Armes portées d'office — 19/08/2026

Kévin : « il faut bien que tu prennes en compte qu'il y a des armes de corps
à corps et des armes de distance, là je n'ai pas pu choisir ».

Le modèle de données était faux. Chaque figurine ne pouvait porter qu'**une**
arme, et la répartition devait couvrir tout l'effectif. Sur dix Immortals
avec trois armes en table — fusil gauss, carabine tesla, arme de corps à
corps — poser dix fusils gauss laissait zéro figurine pour les deux autres :
impossible de panacher, et l'arme de corps à corps, que toutes les figurines
portent, mangeait des places.

### La distinction

Le catalogue la porte explicitement. Pour les Immortals :

- l'arme de corps à corps est un `selectionEntry` rattaché **directement au
  modèle**, min 1 max 1 — toutes les figurines l'ont ;
- le fusil gauss et la carabine tesla sont dans un `selectionEntryGroup`
  « Weapons » min 1 max 1 — un choix exclusif.

Deux formes coexistent dans le catalogue : un modèle unique avec un groupe
d'options (Immortals, Lychguard), ou plusieurs variantes de modèle partageant
une arme commune par `entryLink` (Necron Warriors, Macrocytes Canopteks).
L'extraction gère les deux, en lisant les contraintes de groupe : un groupe
dont le `max` est inférieur au nombre d'options est un choix, sinon chaque
option se juge sur son propre `min`.

Résultat : **91 armes portées d'office, 45 au choix**, sur 136. Trente-quatre
unités sur cinquante n'ont aucun choix d'arme — véhicules et personnages
pour l'essentiel.

Les dix-huit armes que le catalogue ne nomme pas comme les nôtres tombent sur
« portée d'office », ce qui est correct pour toutes : éperons blindés,
pouvoirs C'tan de la Crypte Tesseract, sismolance du Géomancien, bâton du
Chronomancien, armement de Szarekh, lame du Tétrarque sur la Console de
Commandement.

### Ce que ça change

- L'éditeur liste les armes d'office **sans compteur**, marquées « toutes les
  figurines » ou « d'office » pour une figurine seule.
- Le bandeau de répartition ne parle plus que des armes au choix, et
  disparaît quand il n'y en a pas.
- « + Arme » ne propose plus que de vrais choix, et se désactive sinon.
- Ajouter une arme à une escouade déjà complète prend une figurine à la ligne
  la plus fournie au lieu de déborder de l'effectif.
- **Le simulateur compte enfin les armes d'office.** Dix Immortals frappaient
  à 0 attaque en corps à corps, ils frappent à 20. Un Doomsday Ark dont
  l'armement n'avait jamais été réparti tirait à 0, il tire à 25,5.
- Le texte exporté et l'axe Armement montrent tout l'armement de l'unité, pas
  seulement ce qui avait été réparti à la main.

Les listes déjà enregistrées sont migrées au chargement : les lignes allouées
à une arme d'office sont retirées, et l'effectif libéré revient aux armes au
choix.

### Une limite assumée

Une seule réserve d'armes au choix par unité, pas une par emplacement. Une
unité qui aurait deux choix indépendants — une tourelle et des barbettes —
serait mal servie. C'était déjà le cas avant ; le corriger demanderait de
distinguer les groupes du catalogue un par un, et l'extraction montre que ça
ne concerne aucune unité nécron aujourd'hui.

### Wahapedia

Kévin a proposé `wahapedia.ru/wh40k11ed/factions/necrons/`. Le proxy réseau de
l'environnement d'exécution bloque ce domaine : la page est inatteignable
d'ici. Le contournement est celui des PDF — déposer la page enregistrée dans
la conversation.

## 11. L'armement par emplacement — 20/08/2026

Kévin, après le chantier 10 : « tu n'es toujours pas bon avec les armes de
corps à corps. Un Immortel, il a son fusil et il peut taper au corps à corps,
donc il a les deux profils. La limite qui fait que je ne peux pas avoir plus
d'armes que de figurines, ça bloque. Il faudrait que ce soit par type de
profil — et encore, ça ne marchera même pas, parce qu'il y a des unités qui
ont plusieurs profils de tir. »

Il a raison sur les deux points, et le second condamne la rustine.

### Ce qui restait faux

Le chantier 10 avait sorti les armes d'office de la répartition, mais gardait
un défaut de fond : **une seule réserve d'armes au choix par unité**, et une
option d'armement réduite à une seule arme. Deux cas restaient impossibles :

- **Triarch Praetorians.** L'option n'est pas « particle caster » ni
  « voidblade » : c'est *le couple*. Cinq praetorians auraient demandé dix
  allocations pour cinq figurines.
- **Canoptek Wraiths.** Un choix de mêlée — griffes ou fouets — *et* un choix
  de tir facultatif. Deux emplacements indépendants qui se disputaient la
  même réserve.

### Le modèle

Le catalogue décrit exactement la bonne structure. Une nouvelle table
`ARMEMENT` la reprend :

- `f` : les armes portées d'office par chaque figurine ;
- `s` : les emplacements de choix, chacun avec son `min` — 1 si chaque
  figurine doit prendre une option, 0 si l'emplacement est facultatif — et
  ses options, une option pouvant donner **plusieurs** armes.

Deux formes du catalogue s'y ramènent : un `selectionEntryGroup` exclusif
devient un emplacement, et plusieurs variantes de modèle deviennent les
options d'un même emplacement. Les cinquante unités sont couvertes, dont
seize avec au moins un emplacement de choix.

`ru.lo` passe de `[{arme, nombre}]` à `[{emplacement, option, nombre}]`. Les
listes enregistrées sont converties au chargement : chaque ancienne ligne
rejoint **l'option la plus simple** qui contient son arme, pour qu'une ligne
« griffes » ne devienne pas « griffes plus rayon dimensionnel ».

### L'éditeur

Toutes les options d'un emplacement sont visibles avec leur compteur. Il n'y
a plus de bouton « + Arme », plus de bouton d'échange, plus de feuille de
choix d'arme : cent cinquante lignes de code en moins, et un panachage se
pose directement. Une figurine seule choisit par un bouton plutôt que par un
compteur. Chaque emplacement a son propre bandeau « x / effectif ».

Le champ `port` ajouté à `WEAPONS` au chantier 10 devient redondant et
disparaît : `ARMEMENT` est la seule source.

### Ce qui reste hors du modèle

La limite « une seule figurine peut prendre cette option » — l'isolateur
transdimensionnel des Arpenteurs Sépulcraux, par exemple — n'est pas
exprimée : l'emplacement accepte n'importe quelle répartition sur l'effectif.

## 12. Le porteur de l'optimisation — 20/08/2026

Kévin : « normalement l'équipement est porté par un leader ou un soutien qui
est dans l'unité, voire certains équipements sont utilisables par certaines
unités. Sauf que là, vu la façon dont on gère les unités groupées, je n'ai
pas accès au Plasmancien quand il est lié dans un groupe. »

Le bouton « + Amélioration » existait bien sur le groupe — mais il manquait
l'essentiel : **rien ne disait qui portait l'optimisation**, et **la
restriction de la fiche n'était pas vérifiée**. Les Sentinelles Animées,
réservées aux Guerriers Nécrons, étaient proposées sur des Immortels.

### La cible, telle que la fiche l'écrit

Chaque optimisation ouvre sur une phrase de restriction. Elle est désormais
enregistrée comme cinquième champ d'`ENHANCEMENTS` :

| phrase | cible |
|---|---|
| Figurine NÉCRON seulement | une figurine, sans autre condition — 16 cas |
| Figurine de CRYPTEK seulement | une figurine CRYPTEK — 7 cas |
| Figurine de CULTE DESTROYER seulement | une figurine du culte — 4 cas |
| OVERLORD model only | l'Overlord — 4 cas |
| Figurine de TÉTRARQUE ou CONSOLE DE COMMANDEMENT | 2 cas |
| Unité de GUERRIERS NÉCRONS / d'IMMORTELS / de MÉCANOPTÈRES / d'OBÉLISQUE / MONTÉE de CULTE DESTROYER | l'unité elle-même — 5 cas |

Les cinq dernières sont la nouveauté du pack de faction : elles visent
l'**unité**, pas une figurine. L'ancien contrôle « elle se porte par un
personnage, or ce groupe n'en a aucun » les aurait signalées à tort.

« Tétrarque » n'existe pas dans `UNITS`. Le pack désigne sans doute
l'Overlord, admis à ce titre — déduction, signalée en commentaire de la table.

### Ce que ça donne

- La liste de choix montre **d'abord** ce que le groupe peut porter, en
  nommant le porteur, et range le reste sous « hors de portée de ce groupe »
  avec la phrase qui l'explique.
- Une optimisation prise affiche **qui la porte**. Un bouton fait tourner
  entre les porteurs éligibles quand le groupe en compte plusieurs — un
  Plasmancien et un Royal Warden sur des Immortels, par exemple.
- Le porteur voyage dans le lien de partage et figure dans le texte exporté.
- Le contrôle « un Epic Hero ne peut pas recevoir d'amélioration » ne
  regardait pas le bon personnage : il signalait le groupe dès qu'un Epic Hero
  s'y trouvait, même si l'optimisation allait à quelqu'un d'autre. Il porte
  maintenant sur le porteur.

## 13. Le groupe entier, et combien de figurines tombent — 20/08/2026

Trois demandes de Kévin en une, avant d'aller se coucher.

### L'armement des personnages rattachés

« Si je mets un Overlord, je dois pouvoir sélectionner les armes de l'Overlord
dans l'unité. »

Un personnage rattaché n'avait qu'un **indice d'arme unique**, changé par un
bouton qui tournait entre ses armes. Un Overlord ne pouvait donc jamais porter
sa lame *et* sa flèche tachyon, et son bâton de lumière ne donnait qu'un de
ses deux profils.

Il reçoit désormais le même modèle d'emplacements que les unités : ses armes
d'office sont listées, et chaque emplacement propose ses options en
« prendre / prise », décalées sous sa ligne. Le Plasmancien, qui n'a pas de
choix, affiche simplement sa lance plasmique « d'office » — ce que Kévin avait
anticipé.

### Le groupe entier dans le simulateur

Le tir cumulé ne prenait qu'**une** arme par personnage. Un groupe Immortels +
Overlord + Plasmancien annonce maintenant 3 profils et 24 attaques en phase de
tir — dix fusils gauss, la flèche tachyon, la lance plasmique — et 26 attaques
au corps à corps, pour ses 285 points cumulés.

### Combien de figurines tombent

« Si je mets un énorme pack qui peut tuer les cinq space marines, ce qui
m'intéresse ce n'est pas de savoir si je suis à 100 % de chance de les tuer.
C'est de savoir combien j'en tue à 100 %, ou à 75 %. »

Le moteur **tronquait le tir à l'effectif de la cible** : `if(idx >= M)
continue`. Tout ce qui dépassait était jeté, et la seule lecture disponible
était « chance de balayer les M figurines », qui sature à 100 % dès que le
paquet est un peu gros.

Le vivier n'est plus fermé : le tir continue sur des figurines fraîches, et la
distribution des figurines couchées est rendue sans plafond. Le résultat se
lit en seuils — le plus grand *k* tel que P(tuées ≥ *k*) ≥ seuil :

| | à coup sûr | 9 fois sur 10 | 3 fois sur 4 | 1 fois sur 2 |
|---|---|---|---|---|
| Immortels + Overlord + Doomsday Ark + 3 Lokhust lourds | 8 | 9 | 10 | 12 |

Là où l'ancienne lecture disait « balaye les 5 marines : 100 % », donc rien.

Rien n'est perdu : la chance de balayer une unité de M figurines vaut
exactement P(tuées ≥ M) sur cette même distribution, et reste affichée. La
surtue devient plus honnête aussi — elle ne mesure plus « j'ai manqué de
cibles » mais le vrai débordement de dégâts sur la figurine qui tombe.

---

## 14. Retour sur l'application en main — 20/08/2026

Retour vocal de Kévin, l'application ouverte sous les yeux. Quatre points,
tous vérifiés dans le code avant d'être corrigés.

### Le retour en arrière n'était pas là où on le cherche

« Le petit bouton pour retourner en arrière n'est pas prévisible à chaque fois
que je me loupe. Par contre le bouton Enregistrer, Réorganiser et plein écran,
eux je les vois bien. »

Deux causes distinctes.

La première est un défaut de cascade : `.backbar` impose `display:flex`, ce qui
l'emportait sur le `display:none` que l'attribut `hidden` applique par la
feuille de style de l'agent. Les **deux** barres de retour — « Mes listes » et
« Retour au pavé » — restaient donc affichées en permanence, y compris quand
elles ne menaient nulle part. Un `.backbar[hidden]{display:none}` referme le
trou.

La seconde est structurelle : ces barres vivent dans le flux du document, en
haut. Dès qu'on descend dans une unité, elles sortent de l'écran. Le retour
rejoint donc l'en-tête collante, à côté d'« Enregistrer », et devient
contextuel — « ‹ Mes listes » sur le pavé, « ‹ Le pavé » dans un panneau. Sur
un téléphone étroit le nom de l'application s'efface pour lui laisser la place ;
au-delà de 520 px les deux tiennent.

La barre « Mes listes » en page, devenue un doublon, disparaît. Celle du
panneau reste : elle porte le nom du groupe ouvert.

### « Réorganiser » ne faisait rien

Le mode existait bel et bien : `modeRange` bascule, le libellé passe à
« Terminé », chaque case reçoit ses flèches ◀ ▶. Mais le CSS les révélait par
`.pad.range .tile .tmove{display:flex}` alors que l'élément est un `<div
id="pad">` **sans classe `pad`**. Le sélecteur ne correspondait à rien : les
flèches restaient en `display:none`, et le bouton semblait mort.

Une classe ajoutée à l'élément, et l'ordre se règle case par case.

### L'armement du groupe ne montrait pas celui des personnages

Le récapitulatif en bas de l'unité annonçait « Tout l'armement du groupe,
personnages rattachés compris » — et ne lisait que `groupesArmes(ru.name)`,
c'est-à-dire l'escouade seule. La faux d'un Overlord et la lance d'un
Plasmancien n'y figuraient nulle part.

Il balaie maintenant l'escouade puis chaque personnage, et nomme le porteur
quand ce n'est pas l'escouade. Il liste aussi **toute** l'armurerie de la
fiche, y compris les options laissées de côté, grisées : on voit ce qu'on n'a
pas pris autant que ce qu'on porte.

Un défaut d'affichage attrapé au passage : un profil de corps à corps qui
partage sa ligne avec un profil de tir héritait de sa portée — la lance
plasmique s'affichait « 18" » en mêlée. Une arme de mêlée n'a pas de portée.

### Les améliorations, lisibles avant d'être choisies

« Il faudrait que je puisse lire ce qu'elles font avant de les sélectionner. »

Le texte était bien rendu, mais tronqué à `max-height:3.6em; overflow:hidden`
sans aucun moyen de le dérouler. Le plafond saute ; la phrase de restriction —
« Figurine de CRYPTEK seulement. » — se détache en tête, en vert quand le
groupe peut la porter, en ambre sinon.

### Vérification du compte : ce n'est pas toujours quatre

« Normalement, il n'y a que quatre de disponibles, je ne sais pas, revérifier. »

Vérifié contre le pack de faction v1.1 :

| Détachement | Optimisations |
|---|---|
| Main de la Dynastie | 2 |
| Fer de Lance Linceul Céleste | 2 |
| L'Arsenal du Phaëron | 2 |
| Arsenal Brise-astres | 4 |
| Conclave de Crypteks | 4 |
| Légion Maudite | 4 |
| Panthéon de Malheur | **0** |
| Les cinq détachements du codex | 4 chacun |

Les quatre par détachement viennent du codex. Le pack de faction en donne deux
pour ses trois premiers détachements, et **aucune** pour le Panthéon de
Malheur, qui impose à la place des Aptitudes d'Entrave Nécrodermique — une par
Écharde C'tan, obligatoires et facturées. Le total de 38 est donc juste.

Pour que ce compte ne passe plus pour un oubli, le tiroir des améliorations
l'affiche détachement par détachement, en tête de liste.

**Reste ouvert** : cinq optimisations n'ont pas de coût en points — les deux de
la Main de la Dynastie, la Réanimation Récursive et les deux de l'Arsenal du
Phaëron. Le pack ne les donne pas (elles vivent dans l'Inventaire du
Munitorum) et le catalogue BattleScribe ne connaît pas encore ces
détachements de juillet 2026. Elles comptent pour 0 point dans le total de la
liste, et l'affichage le dit — « coût inconnu ».

---

## 15. Le site n'était plus déployé — 20/08/2026

« Ça ne fonctionne pas, je suis sur le vercel.app. Je ne vois pas
l'organisation des armes, enfin ce n'est pas poussé, en tout cas je ne vois
pas. »

C'était poussé. Ce n'était pas *déployé*.

Le journal de build de Vercel :

```
Running "npm run build"
> node build.js
app 276610 o | chargeur 103744 o
Error: No Output Directory named "public" found after the Build completed.
```

L'ajout de `package.json` au chantier 8 a fait basculer Vercel d'un service
statique — il publiait la racine du dépôt telle quelle — à un build détecté :
il exécute `npm run build`, puis cherche `public`. `build.js` écrit dans
`dist/`. Aucun `vercel.json` ne le disait.

**Huit fusions de suite ont échoué au déploiement.** La dernière production
servie datait de la PR #23 : tout ce qui a été fait depuis — le pack de
faction, le retrait des Legends, l'armement par emplacement, le porteur de
l'optimisation, l'armement des personnages, les seuils de certitude, et le
chantier 14 d'hier — n'a jamais atteint le site. Les fichiers autonomes que
j'envoyais à chaque fois, eux, étaient bien à jour : d'où l'impression que
« c'est fait » d'un côté et « je ne vois rien » de l'autre.

`vercel.json` fixe `outputDirectory: "dist"`, et `build.js` remplit désormais
`dist/` avec un site complet — les sources une par une, comme avant l'ajout du
build — plus le fichier autonome, téléchargeable depuis la page.

Le chargeur compressé quitte `dist/index.html` pour `dist/hors-ligne.html` :
il n'a jamais été la version déployée, et occuper la porte d'entrée du site
l'aurait remplacée par un `document.write` de 104 ko.

Le nom du cache du service worker portait un numéro de version écrit à la
main, jamais incrémenté. Il porte maintenant l'empreinte SHA-256 des cinq
sources : un déploiement qui change quoi que ce soit invalide l'ancien cache
au lieu de le laisser resservir la version précédente.

**Leçon** : le vert d'une suite de tests locale ne dit rien de ce que voit
l'utilisateur. L'état du déploiement fait partie de la livraison, et je ne
l'avais jamais vérifié.

---

## 16. Glisser-déposer sur le pavé — 20/08/2026

Les flèches déplaçaient d'un cran à la fois : reculer une unité de six rangs
demandait six appuis. « Je veux un système de clic and drop pour la
réorganisation. »

### Pointer Events, pas drag-and-drop

L'API drag-and-drop du HTML (`draggable`, `dragstart`, `dragover`) n'existe pas
sur mobile — aucun navigateur tactile ne l'implémente. Or c'est au doigt que ce
pavé se manipule. Le glissement passe donc par les **Pointer Events**, qui
couvrent doigt, stylet et souris avec le même code.

Trois précautions :

- `touch-action: none` sur les cases en mode réorganisation, sinon le
  navigateur interprète le geste comme un défilement de page et ne renvoie
  jamais de `pointermove` ;
- un seuil de 8 px avant de considérer qu'il s'agit d'un glissement : sans lui,
  le moindre tremblement au moment de toucher une flèche démarrerait un
  déplacement ;
- `setPointerCapture`, pour que le doigt garde la case même s'il sort de sa
  surface.

### Le trou s'ouvre du bon côté

Première version : le sens du déplacement décidait de l'insertion — avant la
case survolée si on remontait, après si on descendait. Résultat mesuré, en
glissant la 6ᵉ case sur la 1ʳᵉ :

```
attendu : Lokhust | Immortals | Warriors | …
obtenu  : Immortals | Lokhust | Warriors | …
```

La case atterrissait un cran à côté de la cible. La cause : le DOM est
réordonné en continu pendant le trajet, donc « le sens » dépend du chemin
parcouru, pas de l'endroit visé.

C'est la **moitié de case survolée** qui décide : moitié gauche, le trou
s'ouvre à gauche ; moitié droite, à droite. Indépendant du chemin, et conforme
à ce que l'œil attend. Vérifié au doigt sur neuf cases :

| geste | résultat |
|---|---|
| 9ᵉ déposée sur la moitié **gauche** de la 2ᵉ | s'insère **avant** la 2ᵉ |
| 1ʳᵉ déposée sur la moitié **droite** de la 5ᵉ | s'insère **après** la 5ᵉ |

### Les cases s'écartent au lieu de sauter

Réordonner le DOM en cours de route donne le retour visuel, mais fait sauter
les cases d'un coup. Chaque déplacement mesure donc les positions avant et
après, repart les voisines de leur ancienne place par une transformation
inverse, et les laisse revenir en 160 ms. La case attrapée, elle, voit son
origine décalée d'autant : elle reste exactement sous le doigt au lieu de lui
échapper à chaque réinsertion.

### Ce qui ne change pas

Les deux flèches restent sur chaque case — un cran précis, sans viser. Un appui
sans déplacement ne réordonne rien et n'ouvre aucun panneau. Sortir du mode en
plein glissement le referme proprement, sans laisser de case fantôme.

---

## 17. Un membre à la fois, et ce que le groupe reçoit — 20/08/2026

Quatre demandes, toutes autour du panneau d'unité.

### La Catacomb Command Barge ne rejoint personne

« C'est un véhicule, ça ne peut pas être relié comme personnage. »

Vérifié contre le catalogue BattleScribe : sa liste des figurines qui ont
l'aptitude Meneur compte vingt-trois entrées, et la Catacomb Command Barge n'y
est pas. Elle était pourtant marquée `"Leader"` dans `UNITS[9]` — une erreur de
ma part au chantier d'enrichissement. C'est la seule des sept ainsi marquées
qui ne le méritait pas.

Le champ `[9]` confondait deux choses : « a l'aptitude Meneur ou Appui » et
« est un personnage ». La barge est bien un PERSONNAGE — elle peut porter une
optimisation — mais elle ne se rattache à rien. Elle passe donc au rôle
`"Personnage"`, le tiroir de rattachement ne retient plus que `Leader`,
`Support` et les escortes, et `refusAttache` refuse tout le reste même si un
ancien lien de partage le force.

Vérifié : quatorze personnages proposés, sans la barge ; et la barge se voit
toujours proposer les quatre optimisations de son détachement.

### Un membre à la fois

« Ça évite d'avoir un gros pavé où je scroll trop pour chercher les choses. »

Une case par membre s'affiche en tête du panneau — l'escouade avec son effectif
et ses points, puis chaque personnage avec son rôle et son coût. On règle celui
qu'on touche. Le panneau d'un personnage porte son propre en-tête (E, Svg, PV,
socle, points), son armement à plat — plus de sous-lignes indentées, il occupe
tout le panneau — et un bouton pour le détacher.

L'état vit dans `vueMembre`, une table d'affichage indexée par identifiant
d'unité : il ne part ni dans la sauvegarde, ni dans le lien de partage, ni dans
le texte exporté.

Ce qui reste visible quel que soit le membre : le nom du groupe,
l'optimisation, les mots-clés, et le récapitulatif de tout l'armement.

### Les octrois d'aptitudes d'arme

« Si je prends le Conclave de Crypteks, normalement la lance a assaut. Si je
prends Main de la Dynastie, tout ce qui est immortel et guerrier gagne le mot
assaut. »

Un profil d'arme n'est pas figé : le détachement retenu et les personnages
rattachés lui ajoutent des aptitudes que la fiche technique ne porte pas. Deux
tables les décrivent dans `data.js`.

`OCTROIS_DETACH` distingue **deux portées**, et la distinction compte :

| détachement | texte officiel | portée |
|---|---|---|
| Conclave de Crypteks | « Les armes de tir des **figurines** de CRYPTEK… » | la figurine porteuse seule |
| Main de la Dynastie | « Les attaques de tir des **unités** d'IMMORTELS/GUERRIERS… » | tout le groupe |

Sous le Conclave, seule la lance du Plasmancien gagne [ASSAUT] ; les fusils
gauss de l'escouade ne le gagnent pas. Sous la Main de la Dynastie, tout le
groupe le gagne — y compris l'armement des personnages rattachés, puisqu'ils
font partie de l'unité.

`AURAS_PERSO` porte ce qu'un personnage accorde à l'unité **qu'il mène** :

| personnage | aptitude | effet |
|---|---|---|
| Plasmancien | Héraut de la Destruction | Critique Touche 5+ au tir |
| Seigneur Lokhust | Culte Destroyer | Critique Touche 5+ au tir |
| Technomancien | Rites de Réanimation | Insensible à la Douleur 5+ |

La condition « tant que cette figurine mène une unité » est respectée : le code
ne lit que `ru.chars`, donc un Plasmancien joué seul n'en profite pas. Mesuré :

```
Immortels + Plasmancien, tir        → critH 5
Immortels seuls, tir                → critH 6
Immortels + Plasmancien, corps à corps → critH 6   (l'aura ne vise que le tir)
```

Un octroi qui pose un **mot-clé** s'ajoute à la chaîne de drapeaux de l'arme,
donc `motsArme` l'affiche et `parseFlags` le voit ; un octroi qui touche un
**champ de profil** est appliqué après les règles de détachement. Une arme qui
porte déjà l'aptitude ne la reçoit pas deux fois — la carabine tesla a [ASSAUT]
sur sa fiche et ne gagne rien sous la Main de la Dynastie.

Défaut attrapé au passage : la règle `cryptek_anti` du Conclave lisait
`has("cryptek", ru.name)`, donc les mots-clés de l'escouade seule. Or un
Plasmancien rattaché rend l'unité CRYPTEK. Elle lit maintenant ceux du groupe.

### Les aptitudes d'arme, lisibles

« Là je le vois tout soutenu, mais c'est un peu petit. »

Elles passent de 9,5 px en gris clair à des pastilles encadrées de 10 px, avec
la définition officielle du glossaire en infobulle. Celles qu'un détachement ou
un personnage accorde sont en cyan et précédées d'un `+` : elles ne figurent
pas sur la fiche technique, et la distinction doit rester lisible à la table.

Un bloc « Ce que le groupe reçoit » récapitule tous les octrois actifs avec
leur texte officiel et leur source, visible depuis n'importe quel membre —
c'est le seul endroit où se lit un effet comme le Critique Touche 5+, qui ne
tient sur aucune ligne d'arme.

### Reste en suspens

La règle du Fer de Lance Linceul Céleste vise les « MÉCANOPTÈRES ». Le code
l'applique aux Tomb Blades. Le pack écrit « Canopteks » sur ses fiches
techniques et « MÉCANOPTÈRES » dans cette règle — deux orthographes dans le
même document, et je ne sais pas laquelle désigne quoi. À trancher avec le
codex français en main plutôt qu'au jugé.

---

## 18. Les fiches du pack, les Échardes et le catalogue repliable — 20/08/2026

### Les Arpenteurs Sépulcraux et les Macrocytes

« Je crois que tu n'as pas bien compris les Tomb Crawlers en termes
d'équipement. »

Relu le pack, page 16 :

> **1 figurine** peut remplacer sa faucheuse Gauss jumelée par 1 Isolateur
> transdimensionnel.

L'application proposait deux isolateurs sur deux figurines. Le catalogue
BattleScribe ne porte pas cette limite — il décrit un choix par figurine, sans
plafond d'unité — et `ARMEMENT` n'avait aucun moyen de l'exprimer. C'est le
manque que j'avais noté au chantier 11 sans le combler.

Un emplacement gagne donc `omax`, un plafond **par option** : le compteur
s'arrête à la valeur, qui est rappelée sur la ligne, et une option dépassée
marque la case du pavé comme les autres fautes. `loParDefaut` ouvre désormais
sur la première option **sans plafond** — une option limitée à une figurine ne
peut pas être l'armement de départ d'une escouade.

La même relecture a montré que les **Macrocytes Canopteks** étaient plus faux
encore. Leur fiche, page 14, ouvre quatre choix :

| option | plafond |
|---|---|
| scalpel Gauss | l'unité entière |
| projecteur Tesla | l'unité entière |
| faisceau atomiseur + projecteur de nanoscarabées | 1 figurine |
| mandibule accélératrice | 1 figurine |

Les deux dernières n'existaient pas dans l'application. La mandibule n'est pas
une arme : c'est une **aptitude d'équipement**, sans profil, qui remplace
l'arme de tir de son porteur. Un emplacement accepte donc une option **sans
arme**, qui porte son propre nom par `onom`.

Vérifié : trois appuis sur « + » de l'isolateur laissent 1, et la sauvegarde
enregistre `[{"s":0,"o":1,"n":1}]`.

### Les Échardes C'tan sont des Héros Épiques

Les trois Échardes portaient bien le mot-clé `epic` — les optimisations leur
étaient donc correctement refusées — mais la table `CAT` les rangeait sous
« Monstre ». Elles passent sous « Epic Hero ». Le C'tan Transcendant reste sous
« Monstre » : il n'est pas un Héros Épique, et l'était déjà correctement.

### Le catalogue se replie

Cinquante entrées à la file : on cherchait un véhicule en faisant défiler
l'infanterie. Chaque catégorie devient une barre qu'on plie et déplie, avec son
compte. L'état tient d'une ouverture à l'autre, sans être enregistré. Une
recherche en cours rouvre tout — filtrer pour devoir ensuite déplier serait
absurde.

### Les points par effectif : je ne peux pas vérifier

« Quand ma troisième unité arrive, ça coûte plus cher. »

Le mécanisme existe déjà et gère le non-linéaire : `UNITS[7]` est une table
`{effectif : points}`, et plusieurs entrées sont bien non proportionnelles.

| unité | 1 | 2 | 3 | 6 |
|---|---|---|---|---|
| Destroyers Lourds Lokhusts | 50 | 100 | **160** | — |
| Destroyers Lokhusts | 40 | 55 | 80 | 170 |
| Spectres Mécanoptères | — | — | 95 (×3) | **220** (×6) |
| Guerriers Nécrons | — | — | 80 (×10) | **190** (×20) |

La troisième figurine de Destroyer Lourd coûte donc bien 60 et non 50.

Ce que je ne peux pas faire, c'est **vérifier ces valeurs**. Le Munitorum Field
Manual est bloqué par la politique de sortie réseau de l'environnement :

```
https://mfm.warhammer-community.com/en  → EGRESS_BLOCKED
https://www.warhammer-community.com/    → 000
https://munitorum.app/                  → 000
```

Même mur que Wahapedia. Les points actuels viennent du catalogue BattleScribe
au chantier 1, et je les avais alors signalés comme périmés. Réécrire de
mémoire les valeurs d'un document de points serait exactement l'erreur commise
au chantier 8 sur les optimisations du codex — et rattrapée de justesse par une
comparaison programmatique. Je ne le referai pas.

**Ce qu'il faut** : le PDF du Munitorum Field Manual déposé dans la
conversation, comme le pack de faction l'a été. L'extraction et la comparaison
avec la table actuelle sont alors mécaniques.
