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

---

## 19. Le catalogue plié, et le Munitorum Field Manual — 20/08/2026

### Le catalogue s'ouvre sur son sommaire

Les catégories du catalogue se repliaient depuis le chantier précédent, mais
elles s'ouvraient toutes : il fallait donc replier avant de chercher. Le retour
était net — « il faut que les listes soient repliées **par nature**, comme ça je
cherche tout de suite un véhicule, je sélectionne ce dont j'ai besoin, et c'est
plus rapide que de devoir scroller ou replier ».

Trois décisions :

- **Plié à l'ouverture.** Neuf barres, 643 px, une seule vue sur un téléphone
  de 844 px de haut. Aucun défilement pour atteindre n'importe quel rayon.
- **Une seule catégorie ouverte à la fois.** Ouvrir la suivante referme la
  précédente : on ne replie jamais soi-même, ce qui était l'autre moitié de la
  demande.
- **Remise à zéro à chaque ouverture.** Le catalogue présente toujours le même
  sommaire, plutôt que l'état laissé par la fois d'avant.

La recherche continue d'ouvrir tout : filtrer pour devoir ensuite déplier
n'aurait aucun sens.

### Le barème du MFM, enfin lisible

Le Munitorum Field Manual restait inaccessible par le réseau (chantier 18). Il
est arrivé en photo — page DETACHMENTS et trois pages UNITS.

**Les points de la première copie étaient tous justes.** 345 prix vérifiés
programmatiquement, zéro écart. Les valeurs BattleScribe du chantier 1, que
j'avais signalées comme suspectes, tiennent.

Ce qui manquait était ailleurs, et c'est un mécanisme entier : le MFM ne facture
pas une unité au même prix selon le nombre de copies déjà prises.

```
LOKHUST HEAVY DESTROYERS
  YOUR 1ST TO 2ND UNITS COST    1 model 50 · 2 models 100 · 3 models 160
  YOUR 3RD + UNIT COSTS         1 model 60 · 2 models 110 · 3 models 170
```

Dix-sept unités sont concernées, sur deux formes de palier — « à partir de la
2ᵉ » et « à partir de la 3ᵉ ». Le champ `UNITS[7]` accepte donc désormais deux
écritures : le barème simple `{effectif: points}` quand le prix ne bouge jamais,
et la liste de paliers `[[rang, barème], …]` sinon. Les trente-six unités à prix
fixe gardent la forme courte.

Le rang se compte sur toute l'armée, personnages rattachés compris : un
Technomancien greffé sur une seconde escouade est bien la deuxième copie, à 90
points et non 80. Le total ne dépend pas de l'ordre — deux fois le premier
palier et une fois le second font la même somme quel que soit le rang attribué à
qui — mais l'ordre de la liste donne un rang stable à afficher.

Le catalogue annonce le prix de **la copie à venir**, pas celui de la première :
afficher 50 points quand on en a déjà deux fausserait le budget au moment même
du choix. Une pastille « 3ᵉ copie » le dit quand le prix a monté. Les pastilles
d'effectif de l'éditeur suivent le rang de leur unité, et la fiche technique
gagne un bloc de barème.

### Détachements : ce qui était juste, ce qui ne l'était pas

| | |
|---|---|
| Coûts en PD, douze détachements | tous justes |
| Étiquettes UNIQUE (DYNASTIE, HYPERCRYPTE) | toutes justes |
| Nombre d'optimisations par détachement | juste sauf un |
| Points d'optimisation | **quatre faux, cinq manquants** |
| Disposition de force | **absente** |

Les quatre optimisations de la Légion d'Annihilation étaient toutes **cinq
points trop chères** — un décalage systématique, pas quatre erreurs
indépendantes. Les cinq coûts restés à « inconnu » depuis le chantier 8 sont
désormais connus : Sentinelles Animées 20, Instruments de Domination 15,
Réanimation Récursive 5, Optimisateur de Prélocalisation 25, Linceul Mortel 10.

Et j'avais tort sur le Panthéon de Malheur. J'avais écrit qu'il n'en donnait
aucune ; le MFM en imprime quatre. Elles sont ajoutées avec leur coût.

### Ce que le MFM ne dit pas

Le MFM donne les noms et les coûts, jamais les règles. Les quatre optimisations
du Panthéon de Malheur portent donc une mention explicite plutôt qu'un texte
inventé — la leçon du chantier 8 tient toujours.

Un doute mérite d'être posé : la règle du détachement parle d'**Entraves
Nécrodermiques** payantes sur les MONSTRES, et les quatre noms en question
(Amortisseur d'Animus, Aiguillon Quantique, Attache Relativiste, Matrice de
Singularité) avec leurs coûts inhabituels (35 à 45 points) leur ressemblent
beaucoup. Le MFM les imprime pourtant sous l'intitulé ENHANCEMENTS. La question
reste ouverte, codex en main.

Les **dispositions de force** sont rendues telles que le MFM les imprime, en
anglais — Take and Hold, Purge the Foe, Priority Assets, Reconnaissance,
Disruption. Traduire aurait produit des termes introuvables dans un livre.

### Deux unités absentes

Le MFM en liste deux que l'application ignore : **Overlord with Translocation
Shroud** (90 pts) et **Seraptek Heavy Construct** (540/570 pts). Le MFM donne
leur prix, pas leur fiche : profil, armement et aptitudes manquent. À reprendre
quand la source existera.

Enfin, le MFM appelle « The Silent King » ce que l'application nomme « Szarekh,
The Silent King ». Même unité, même prix.

---

## 20. Le pavé dit ce qu'il contient, et ce qu'il reste à faire

Retour de l'utilisateur : « on améliore encore la création de liste ». Trois
directions retenues sur quatre proposées.

### Les cases parlent

Une case du pavé portait le nom, les points et l'effectif — et un grand vide au
milieu. « +1 perso » ne disait pas **qui**, et deux Destroyers Lourds identiques
étaient indiscernables l'un de l'autre.

La case porte maintenant, dans ce vide : le **nom des personnages rattachés**,
l'**optimisation** si elle est prise, et l'**arme dominante** de l'unité. Le
**rang de copie** s'affiche en bas à droite — mais seulement sur les unités dont
le prix bouge d'une copie à l'autre. Sur une unité à tarif fixe, « 2ᵉ copie »
n'aurait été que du bruit.

### Le pavé se regroupe et se cherche

Deux commandes apparaissent quand la liste grossit : **Par rôle** à partir de
quatre unités, la **recherche** à partir de six.

Le regroupement a d'abord été écrit tout ouvert. C'était pire que rien : chaque
en-tête prend une ligne entière, un rôle à une seule unité laisse deux colonnes
vides, et une liste de huit unités passait de trois rangées à huit. Replié par
défaut, avec un seul rôle ouvert à la fois, il devient ce qu'il aurait dû être
dès le départ — **la répartition de l'armée en cinq lignes**, combien d'unités
et combien de points par rôle, et on n'ouvre que celui qu'on vient régler.

La recherche porte sur le nom de l'unité, le nom du groupe qu'on lui a donné et
le nom des personnages rattachés : chercher « overlord » retrouve l'escouade
qu'il mène, pas seulement une figurine.

Le mode **Réorganiser** ignore les deux : il rétablit le pavé entier, à plat, et
efface le filtre en cours. On ne déplace pas une case dans un pavé filtré ou
replié sous peine de la poser ailleurs qu'où on croit.

### Ce qu'il reste à finir

`validate()` disait ce qui est **illégal**. Rien ne disait ce qui est simplement
**inachevé** — ces choses qu'on découvre une fois la liste imprimée et la partie
commencée.

Un bandeau replié en haut du pavé les recense :

| ce qui est signalé | pourquoi |
|---|---|
| aucun détachement | il commande optimisations, stratagèmes et mots-clés d'armes |
| PD non dépensés | il reste de quoi prendre un détachement |
| points inutilisés | avec le nombre d'unités qui tiennent encore, quand le reste commence à serrer |
| optimisations ouvertes jamais prises | et combien sont déjà posées |
| personnage laissé seul | avec la liste des unités qu'il pouvait rejoindre |
| emplacement d'armement facultatif vide | facultatif, mais gratuit |

Chaque ligne est cliquable et mène là où on la corrige.

### Ce qui n'a pas été fait

La quatrième direction proposée — **guider une liste neuve** (nommer, choisir le
plafond et le détachement avant d'entrer dans l'éditeur) — n'a pas été retenue
par l'utilisateur. Le bandeau ci-dessus en couvre déjà la moitié : une liste
neuve affiche « Aucun détachement » dès la première unité posée.

---

## 21. Le simulateur prend une unité entière

Retour de l'utilisateur : « le but du jeu, c'est de pouvoir charger une liste
pour voir les unités complètes avec tous les profils d'armes… entièrement
l'unité complète ».

### Une arme, ou une unité

L'onglet Attaque ne savait mesurer qu'**une** arme. C'est la bonne réponse à
« que vaut ce fusil », mais on ne tire jamais un fusil : on tire une unité,
avec ses armes spéciales, son arme de mêlée par défaut et l'armement du
personnage qui la mène.

Une bascule ouvre un second mode. Il charge une unité de la liste avec **tous**
ses profils — escouade et personnages rattachés, octrois de détachement déjà
appliqués — et les fait tirer dans l'ordre sur la même cible. Le moteur savait
déjà le faire : `simulateCombined` sert le tir cumulé depuis le chantier 13.
Elle est simplement offerte à l'onglet Attaque, qui lui apporte ce que le tir
cumulé n'a pas : l'entonnoir, les histogrammes, les seuils de certitude et les
modificateurs.

Chaque profil se décoche. La phase se choisit — tir ou corps à corps — et
change les armes, donc remet les décochages à zéro : ils ne voudraient plus
rien dire.

### Les retouches de partie

La zone des modificateurs vivait dans une carte repliée, sous les résultats.
Or c'est là que les règles de la partie viennent modifier une arme, et cela
change à chaque tour. Elle remonte sous l'attaquant, toujours visible, avec le
compte des retouches actives — **un +1 oublié fausse toute une soirée de
calculs**.

Deux réglages manquaient :

| | |
|---|---|
| **Pénétration d'armure** | −1 / 0 / +1 / +2. « +1 » améliore : une PA -1 devient -2. Plancher à zéro — dégrader une PA 0 ne rend pas la sauvegarde meilleure que nature. |
| **Dégâts** | −1 / 0 / +1 / +2, plancher à 1 point comme la fonte et la réduction. |

Quatre raccourcis nomment les situations qui reviennent : cible à couvert, +1
pour toucher, relance des 1, cible sur objectif. Pas plus : les valeurs brutes
sont dans les segments juste dessous, et un raccourci qui double un segment
n'est que du bruit.

Sur une unité chargée, ces retouches s'appliquent à **tous** les profils d'un
coup. Les modificateurs de la fiche et ceux de l'écran s'additionnent avant le
plafond à ±1 ; une relance de l'écran ne peut qu'améliorer celle de l'arme,
jamais l'affaiblir.

### Deux suppressions

**Les profils enregistrés** ne servaient à rien : supprimés, avec le bouton
« Enregistrer » de l'en-tête qui les alimentait. Ce bouton était trompeur — il
restait visible dans l'éditeur de liste, où l'on pouvait croire qu'il
enregistrait la liste, alors que celle-ci se sauve à chaque changement.

**La case « Personnage nécron à la tête »** écrivait le même champ que la zone
rapide. Deux commandes pour une valeur finissent toujours par se contredire ;
son sens est repris dans le raccourci « +1 pour toucher ».

### Ce qui n'a pas bougé

La sélection de la cible, à la demande expresse de l'utilisateur. Les trois
indicateurs en tête d'écran — dégâts moyens, figurines tuées, trois fois sur
quatre — qu'il a explicitement gardés parce qu'ils évitent de descendre
jusqu'en bas.

---

## 22. Les aptitudes de fiche entrent dans le profil

Retour de l'utilisateur : « comme pour les armes qui ont Dévastatrices, et comme
tu as pu le faire avec les capacités du Plasmancien en marquant que l'unité a un
critique à 5+ — l'appliquer et qu'on le retrouve dans les caractéristiques de
l'arme… il faudra que je puisse sélectionner mon unité d'Immortels avec le
Plasmancien et me retrouver avec le critique à 5+ déjà calibré. Et comme c'est
des Immortels, la relance des 1 déjà calibrée de base. »

### Le calcul était juste, l'affichage muet

Vérification faite avant d'écrire une ligne : le crit 5+ du Plasmancien **était
déjà appliqué** — `critH=5` sur les profils de l'unité qu'il mène, `6` sans lui.
La ligne de profil n'affichait que A/CT/F/PA/D. On ne pouvait donc pas le
vérifier, et **un chiffre invisible ne se vérifie pas.**

Chaque profil porte maintenant ses pastilles : les mots-clés de l'arme, ceux
qu'une règle lui accorde — marqués d'un `+` — et les modificateurs appliqués,
chacun avec la règle et la figurine qui le donnent.

```
Gauss blaster ×10        A 20 · CT 3+ · F 5 · PA -1 · D 1
  LÉTHAL
  + ASSAUT                Protocoles d'Hypermobilité · Main de la Dynastie
  Touche crit. 5+         Héraut de la Destruction · Plasmancer
  Relance blessure des 1  Éradication Implacable · Immortals
```

### La relance des Immortels

Elle n'existait pas. `APTITUDES` portait le texte d'**Éradication Implacable**
mais rien ne le lisait : le glossaire décrivait, il n'agissait pas.

Deux tableaux sont nés, et **la frontière entre eux est la seule chose qui
compte** :

- `APTIS_UNITE` — l'inconditionnel, appliqué d'office. Éradication Implacable
  des Immortels (relance des blessures de 1) et Assaut Tourbillonnant des
  Skorpekh (relance des touches de 1, mêlée seulement).
- `APTIS_COND` — tout ce qui dépend de la situation, jamais appliqué de
  lui-même : la cible tient un objectif, l'unité a chargé, la cible est sous
  son demi-effectif, le véhicule est resté immobile.

Mélanger les deux aurait fait mentir chaque calcul **dans le sens de
l'attaquant** — c'est la raison d'être de la séparation.

Les conditionnelles apparaissent dans la zone rapide sous leur **nom officiel**,
avec la condition en clair, et seulement quand l'unité chargée les possède. Le
joueur reconnaît sa fiche, donc il sait si la condition est remplie.

S'y ajoutent `ABIMEES` — les sept figurines dont la fiche impose −1 pour toucher
sous un seuil de PV, proposées en raccourci puisque l'application ignore combien
il leur reste de vie — et `AURAS_ARMEE`, pour l'unique cas qui ne rentrait pas
dans le moule : l'Augmentation Mécanique d'Illuminor Szeras profite à une
**autre** unité que celle qui la porte, et ne s'offre donc que si Szeras est
dans la liste et si l'unité chargée est BATTLELINE.

### Le Seigneur Skorpekh

`AURAS_PERSO` ne savait accorder qu'un champ chiffré. **Uni dans la Destruction**
accorde un mot-clé — [TOUCHES LÉTHALES] aux armes de mêlée de l'unité menée. Le
tableau accepte désormais `mot` comme les octrois de détachement, et l'aptitude
se lit sur les trois profils du groupe, source nommée.

### Un défaut attrapé au vol

Déclarer une condition changeait le calcul mais pas les lignes affichées :
`render()` ne redessine pas les profils. Le résultat bougeait, les pastilles
restaient à l'ancienne valeur — **l'affichage mentait sur ce qui venait d'être
calculé**. Corrigé, avec le même redessin sur les raccourcis et les segments.

---

## 23. La cible se choisit vite, et se garde

Retour de l'utilisateur : « tu peux améliorer la partie de sélection des cibles ».

### Un écran entier pour huit réglages

La carte Cible empilait huit rangées pleine largeur — endurance, sauvegarde,
invulnérable, PV, figurines, insensibilité, réduction de dégâts, couvert. Près de
**800 px** pour des valeurs qu'on pose une fois, pendant que l'attaquant, lui,
tenait replié sur une ligne. Les résultats commençaient hors écran.

Tout est passé dans une grille dense, celle des retouches de partie. **380 px**,
et le premier histogramme apparaît sans faire défiler.

### Garder une cible

C'est le vrai manque. L'application ne connaît **que** les fiches nécrones : les
douze cibles génériques sont des archétypes, pas des profils officiels, et je
n'ai aucune source pour les autres factions. Inventer des caractéristiques de
Custodes ou de Tyranides serait la faute du chantier 8.

La réponse honnête n'est pas d'en écrire davantage, c'est de laisser le joueur
saisir le profil qu'il a sous les yeux et de le **garder** — nommé, rangé sur le
téléphone, rappelé d'une touche. « Les Custodes de Marc » vaut mieux qu'une
approximation de ma main. Une pastille s'allume quand le profil à l'écran est
exactement celui d'une cible gardée, et s'éteint dès qu'on retouche une valeur.

Le catalogue générique porte désormais la mention de ce qu'il est, et se range
par nature — infanterie légère, infanterie lourde, élite, véhicule & monstre —
puisque c'est le critère avec lequel on choisit une cible.

### Viser sa propre liste

Un troisième onglet, « Ma liste », vise une unité de la liste ouverte avec ce
qu'elle sera **réellement** en jeu : l'effectif choisi, les personnages
rattachés comptés dans les figurines, et l'insensibilité qu'un Technomancien
donne au groupe. Le catalogue seul n'en savait rien.

```
Phalange   E4 · Svg 4+ · 1 PV ×21 · FNP 5+ · Technomancer
```

Vingt Guerriers plus le Technomancien font vingt-et-une figurines, et les Rites
de Réanimation donnent le 5+ à tout le monde.

### Le même défaut, une deuxième fois

La pastille d'une cible gardée restait allumée après qu'on eut changé
l'endurance, et le résumé sous le sélecteur gardait l'ancien profil : `render()`
ne rafraîchissait pas la cible, seulement le calcul. **L'affichage affirmait
autre chose que ce qui était simulé** — exactement le défaut corrigé au chantier
précédent sur les pastilles de profil.

Le résumé et les pastilles se recalculent maintenant dans `render()` lui-même,
ce qui ferme la classe entière plutôt qu'un cas.

---

## 24. En partie : où l'on en est, et ce qui se déclenche

Deux directions retenues sur quatre : **le déroulé du tour** et **ne rien oublier
à chaque phase**.

### Il manquait la moitié de la partie

L'état de partie suivait le round et la phase, mais **pas à qui était le tour**.
Or la moitié des stratagèmes se jouent chez l'adversaire — sur quarante-trois
fiches, dix-huit portent « adverse » dans leur phrase de déclenchement. Sans
cette information, aucun filtre n'a de sens.

Un round est maintenant ce qu'il est : dix phases, cinq à moi, cinq à lui.

```
‹   Round 1 · ton tour · Mouvement        [Phase suivante · Tir]
‹   Round 1 · ton tour · Combat           [Passer la main · tour adverse]
‹   Round 1 · tour adverse · Combat       [Round suivant · ton tour · +1 PC]
```

Le point de commandement se gagne au début de **mon** commandement seulement :
l'application ne compte pas ceux d'en face. Toucher une phase y va directement
sans rien faire avancer — c'est le bouton qui fait progresser la partie, pour
qu'un doigt qui dérape ne fasse pas gagner un PC.

### L'index des moments

`APTITUDES` portait déjà, en toutes lettres, le moment de déclenchement de
trente-sept aptitudes — « In your Shooting phase », « À la fin de la phase de
Combat », « Once per battle ». Le texte était là ; rien ne le lisait.

`MOMENTS` indexe ces trente-six aptitudes retenues par phase, camp, position
dans la phase et unicité. **Le texte reste la source, l'index n'en est qu'une
lecture** — la clé est « Unité|Aptitude », exactement les deux noms
d'`APTITUDES`, pour qu'une faute de frappe se voie tout de suite. Un contrôle le
vérifie : zéro clé orpheline.

Le classement a été obtenu par analyse du texte **puis relu ligne à ligne**, et
sept entrées étaient fausses. Le « jusqu'à la fin de la phase » d'un *effet* se
lisait comme un *déclenchement* en fin de phase ; le Héraut du Désespoir vise
cinq phases quand l'analyse n'en voyait que deux. Une analyse automatique non
relue aurait menti sept fois sur trente-six.

Les stratagèmes, eux, sont classés à la volée depuis leur phrase de
déclenchement — pas de second tableau à tenir en accord avec le premier. La
phrase peut citer deux moments (« à votre phase de Tir ou à la phase de
Combat ») : chaque morceau porte son propre camp, et un morceau sans « votre »
ni « adverse » vaut pour les deux tours.

### La règle de prudence

**En cas de doute, on montre.** Cacher un stratagème dont on avait besoin coûte
une partie ; en montrer un de trop coûte une ligne. Le filtre affiche par défaut
ce qui se joue à cet instant, et « Tout voir » est à une touche — les fiches
hors moment y apparaissent grisées, avec leur phrase de déclenchement.

### Ce qui se déclenche maintenant

Un bloc en tête d'écran, tiré de la liste ouverte et du détachement pris :

| | |
|---|---|
| Ton commandement | Protocoles de Réanimation · *fin de phase* |
| Ton mouvement | Portail d'Éternité · *Monolithe* — Technomancien · *fin de phase* |
| Ton tir | Evasion Engrams · *Motolames* |
| Fin du combat adverse | Hyperphasage · *Légion d'Hypercrypte* |

Les aptitudes « à n'importe quelle phase » se déclenchent aux dix phases du
round : les afficher en entier partout noyait celles qui ne valent qu'ici. Elles
passent en pied de bloc, sur une ligne.

Ce qui est **une fois par partie** ou **une fois par tour** se marque utilisé, et
le suivi tient d'une phase à l'autre. Le journal en garde la trace.

### Deux détails d'usage

Le bandeau affichait deux cellules intitulées « Tour » — le numéro de round et le
camp. La première est devenue « Round ».

Le texte du Portail d'Éternité fait douze lignes et écrasait les trois autres
aptitudes de la phase. Au-delà de cent quatre-vingt-dix caractères, un texte se
replie sur trois lignes et s'ouvre d'une touche.

---

## 25. Les capacités de l'arme agissent sur l'unité entière — 20/08/2026

### Une carte coupée du calcul

Charger une unité entière coupait la carte « Capacités de l'arme » du moteur.
Cocher Léthal, descendre la touche critique à 4+, changer le seuil d'Anti-X : plus
rien ne bougeait. `profilPourMoteur` recopiait le profil de l'arme et n'y versait
que la cible et les quatre modificateurs — touche, blessure, PA, dégâts. Les
mots-clés et les seuils critiques de l'écran étaient perdus en route.

La carte change donc de sens selon le mode, et le dit. En mode unité elle
s'appelle **« Ce que la partie ajoute »** et ne fait qu'ajouter :

| Réglage d'écran | En mode unité |
|---|---|
| Léthal, Dévastateur, Torrent, Souffle, Soutenu | s'ajoutent ; une arme qui les porte déjà les garde |
| Touche / blessure critique | ne peuvent que **descendre**, jamais remonter |
| Tir Rapide, Fonte | ne s'accordent pas : chaque arme applique les siens |
| PA, dégâts | s'**ajoutent** à ce que l'aura a déjà donné |

Les cases sont remises à zéro en entrant dans le mode — sinon le Léthal coché par
défaut se serait offert à toute la liste — et l'arme retrouve les siennes en
sortant.

### Tir Rapide et Fonte sont une distance, pas un cadeau

Ce ne sont pas des mots-clés à distribuer : ils dépendent de la portée. Une unité
chargée tirait jusqu'ici comme si elle était toujours collée à la cible, ce qui
gonflait ses dégâts. Chaque arme applique désormais les siens, et seulement à
mi-portée. Le mot-clé reste affiché en pointillé hors de portée plutôt que caché :
le voir absent renseigne autant que le voir actif.

### Deux corrections au passage

- La PA et les dégâts octroyés par une aura — le +1 en pénétration d'Illuminor
  Szeras — étaient **écrasés** par la valeur de l'écran au lieu de s'y ajouter.
- Cocher une case ou saisir un nombre ne redessinait pas les lignes de profil : le
  calcul changeait sans que l'affichage suive.

---

## 26. Les mots-clés d'arme remontent au-dessus de la cible — 20/08/2026

### Sept cases à cocher, tout en bas

La carte des capacités vivait **sous** la carte Cible, en pile de cases qu'il
fallait aller chercher au bas de l'écran. Elle remonte au contact de l'attaquant,
s'ouvre par défaut, et prend la forme des retouches de partie : une pastille par
mot-clé, la valeur à côté quand il y en a une, et elle n'apparaît que si la
capacité est active.

### Deux mots-clés n'arrivaient pas jusqu'au moteur

**« Ignore le couvert »** est porté par six armes de la faction. Il ne quittait
jamais la fiche : le moteur accordait le couvert à la cible malgré lui, et
sous-estimait ces armes de tout le bénéfice. Il est maintenant lu de la fiche, et
peut aussi s'accorder à la main.

**« Tir indirect »** n'existait pas du tout. Il n'est pas automatique — une arme
qui voit sa cible tire normalement — donc il se déclare : la pastille ne fait
effet que sur les armes qui le permettent, et applique alors le −1 pour toucher et
le couvert offert à la cible.

### Ce que la séquence ne traduit pas

Assaut, Lourd, Pistolet, Précision, Tir unique, Attaques supplémentaires, Jumelée
s'affichent en pointillé sous « Aussi sur cette arme », avec ce qu'ils font. Les
cacher laissait croire que la fiche avait été perdue.

Les lignes de profil montrent désormais le **profil normalisé**, tir indirect
compris : la ligne annonçait sinon un jet de touche que le calcul ne faisait pas.

---

## 27. Le couvert passe sur le jet de touche — 20/08/2026

En 11e édition le bénéfice du couvert ne donne plus le +1 en sauvegarde : il
impose un **−1 au jet pour toucher**. Le moteur appliquait encore la règle de
l'édition précédente.

`saveTarget` ne connaît plus le couvert du tout — la sauvegarde ne dépend plus que
de l'armure, de la pénétration et de l'invulnérable — et le −1 rejoint
`normalise`, là où vivait déjà celui du tir indirect.

### Trois conséquences que l'ancienne règle n'avait pas

| | |
|---|---|
| Sauvegarde 3+ ou mieux face à une PA 0 | était épargnée par l'ancienne formule ; elle subit maintenant le couvert comme les autres |
| Couvert **et** tir indirect | ne se cumulent plus qu'à hauteur d'un seul −1, le plafond à ±1 s'appliquant à leur somme |
| « Ignore le couvert » | annule désormais un malus de touche et non plus un bonus de sauvegarde — même effet, autre étape de la séquence |

Le couvert ne vaut que contre les attaques de tir : le profil porte maintenant sa
nature (`kind`) et une arme de mêlée n'en tient pas compte. **C'est une hypothèse
de ma part** — à corriger si une règle de mêlée en bénéficie.

L'entonnoir affiche le seuil de touche réellement appliqué, et le modificateur
porte sa cause sur la ligne de profil — « −1 pour toucher (cible à couvert) ».
Quand un bonus l'annule, la pastille reste visible en pointillé plutôt que de
disparaître sans explication.

---

## 28. Comparer met face à face des unités entières — 20/08/2026

### Deux suppressions

**« Dans ma liste » quitte le mode « une arme ».** Il faisait doublon depuis que le
mode « une unité entière » existe : choisir une unité de sa liste pour n'en
mesurer qu'une arme à la fois, alors que l'onglet voisin charge la même unité avec
tous ses profils, ses personnages rattachés et les octrois de son détachement. Le
mode « une arme » redevient ce qu'il doit être : le catalogue, pour peser une arme
hors de toute liste.

**« Tir cumulé » disparaît** — il faisait tirer plusieurs unités dans l'ordre sur
la même cible, et le mode « unité entière » couvre le besoin réel. Il reviendra
retourné au chantier 31.

Ses **sept conditions de détachement**, elles, servaient — et il était le seul
endroit où les cocher, alors qu'elles changent tous les profils construits depuis
la liste. Les retirer sans regarder les aurait tuées en silence. Elles rejoignent
les retouches de partie du simulateur, à côté des aptitudes conditionnelles
d'unité qui sont exactement de la même nature.

### Comparer prend des unités, non plus des fiches

Une entrée `{src:"roster", id}` apporte l'armement réel, les personnages
rattachés, l'amélioration et les octrois du détachement — la même construction que
le chargement d'unité de l'onglet Attaque. C'est ce qui permet de poser côte à
côte la même escouade menée par deux personnages différents :

| | Points | Dégâts | /100 pts |
|---|---|---|---|
| Immortels ×10 + Plasmancien | 195 | 7,6 PV | 3,9 |
| Immortels ×10 + Psychomancien | 195 | 6,4 PV | 3,3 |
| Immortels ×10 seuls | 140 | 5,5 PV | 4,0 |

Une unité supprimée de la liste depuis qu'on l'a mise en comparaison se signale et
quitte le verdict au lieu d'y peser un zéro.

### Un raccord mort depuis le début

Le raccord qui relisait la liste après modification ne servait à rien : la
fonction posée en fin de fichier **écrasait** celle qui rechargeait l'unité. Changer
une escouade de 5 à 10 dans l'éditeur ne bougeait ni le profil chargé ni le
résultat — le simulateur continuait de mesurer l'ancienne unité. Vérifié sur la
version précédente avant correction : ×5 → ×5, dégâts 2,8 → 2,8. Il s'appelle
maintenant `__relitUniteChargee`, qui est ce qu'il fait.

---

## 29. « Efface » comptait exactement N morts, pas au moins N — 20/08/2026

La colonne du verdict et le bloc « Unité effacée » de l'onglet Encaisser lisaient
`slainDist[N]` — la probabilité de coucher **exactement** autant de figurines que
la cible en compte. Or la distribution n'est pas plafonnée à l'effectif : le tir
continue sur des figurines fraîches, de sorte que toutes les parties où l'unité
tombe **et** où il reste de la puissance étaient jetées.

Le biais frappait précisément les unités qui effacent le plus sûrement, puisque ce
sont elles qui débordent le plus. Contre cinq Space Marines :

| Unité | Avant | Après |
|---|---|---|
| Destroyers Lourds Lokhust | 26,3 % | **55,2 %** |
| Immortels + Plasmancien | 15,6 % | 22,5 % |
| Immortels + Psychomancien | 5,9 % | 6,8 % |

Le classement s'inversait donc entre unités de puissance voisine.

Le seuil « combien de tireurs pour effacer l'unité une fois sur deux » souffrait du
même calcul, en pire : à fort volume de tir la probabilité d'un compte exact
**redescend**, si bien que la dichotomie pouvait conclure qu'aucun nombre de
tireurs n'y suffisait.

La colonne ne disait pas non plus contre quoi. L'en-tête porte désormais
l'effectif — « Efface ×5 » — et une ligne sous le tableau nomme la cible et
définit les quatre colonnes.

### Le verdict tient en deux colonnes

Puissance brute et rendement au point occupaient deux graphiques empilés, donc deux
titres, deux légendes et deux fois le nom de chaque unité. Une seule ligne par
unité désormais, deux colonnes, chacune à son échelle, classées par rendement.
Trois unités tiennent en **744 px** au lieu de dépasser le millier.

---

## 30. Ce que porte chaque unité, et quelle liste est en service — 21/08/2026

### On ne voyait pas l'armement

Le comparateur annonçait « Lokhust Heavy Destroyers ×3 · 160 pts » pour deux
escouades dont l'une porte des Destructeurs gauss et l'autre des Exterminateurs
enmitiques. Rien à l'écran ne les séparait : on en choisissait une au hasard.

Chaque unité affiche maintenant son armement — « 3× Gauss destructor » — dans les
trois endroits où on la désigne : les lignes du comparateur, sa feuille d'ajout, et
la feuille « charger une unité » de l'onglet Attaque. Le nom des armes entre aussi
dans la recherche.

L'arme de mêlée par défaut est tue quand il y a mieux à dire : toute figurine la
porte, aucune unité ne s'en distingue. Elle reste affichée quand c'est tout ce que
l'unité a. Et quand deux unités portent malgré tout le même nom, elles sont
numérotées « #1 », « #2 » — le repère suit jusque dans le verdict.

### La liste en service

Le simulateur et l'écran de partie travaillaient sur « la dernière liste ouverte » —
jamais dit, jamais montré. Avec trois listes, plus moyen de savoir laquelle on
mesure. Une barre en tête des deux écrans nomme la liste en service et l'ouvre d'une
touche ; la feuille de choix montre les points, les détachements et, pour chacune,
si une partie y est en cours.

**Surtout : ouvrir une autre liste effaçait la partie en cours**, sans prévenir et
sans retour. Les parties sont désormais rangées par liste — chacune retrouve la
sienne intacte, y compris après un rechargement. L'ancien format à partie unique
est repris et réécrit dès la première lecture.

Le drapeau « une partie a commencé » lisait la table des unités, que l'écran
remplit dès qu'il s'affiche : toute partie même vierge se déclarait en cours. Il
regarde maintenant ce qui a vraiment bougé — le round, le camp, la phase, les PC,
le score, le journal, ou une unité descendue sous son maximum.

---

## 31. La cible sait ce qu'elle est, et trois écrans en tirent parti — 21/08/2026

### Cinq mots-clés sur la cible

Le moteur ne connaissait de la cible que ses caractéristiques chiffrées. Une règle
du genre « relance des 1 pour blesser contre les VÉHICULES » ne pouvait donc ni
s'appliquer ni s'en abstenir : il fallait l'ignorer ou l'accorder toujours, deux
façons de mentir.

La cible porte maintenant **Infanterie, Véhicule, Monstre, Personnage, Volant**,
devinés de ce qu'on vient de choisir — un archétype générique, une datasheet
nécron, ou une unité de la liste. Ils se rectifient d'une touche, parce que
l'application ne connaît pas les armées adverses, et ils se gardent avec les cibles
enregistrées.

Ils commandent une nouvelle famille d'aptitudes, celles dont la condition porte sur
la cible. Rien à cocher : changer la cible suffit à les faire apparaître ou
disparaître du profil. Sur les Destroyers Lourds Lokhust, l'Exterminateur enmitique
relance ses 1 contre l'Infanterie, le Destructeur gauss contre les Véhicules et les
Monstres.

> **Réserve.** Le texte de ces deux règles vient de ce que le joueur m'a dicté, pas
> d'une source que j'ai pu lire. La pastille le dit en toutes lettres — « règle de
> fiche — à confirmer sur ta datasheet ».

### Combien il en faut pour coucher cette cible

Le tir cumulé revient, mais retourné. Il donnait un total, ce que le mode « unité
entière » fait déjà ; ce qui manquait, c'est le **seuil**. Devant un char, la
question n'est pas « combien de dégâts » mais « est-ce que ce que j'ai suffit, et
sinon combien il m'en faut de plus ».

Les unités tirent dans l'ordre sur le même vivier, et l'écran **relance le groupe
après chaque activation ajoutée** — seul moyen d'avoir la vraie probabilité
cumulée, la surtue de la première changeant ce qui reste à faire aux suivantes.

|  | Points cumulés | Dégâts | Tout couché |
|---|---|---|---|
| 1 Destroyers Lourds | 160 | 8,2 PV | 10 % |
| 2 Destroyers Lourds | 320 | 15,5 PV | 59 % |
| 3 Destroyers Lourds | 480 | 22,9 PV | **86 %** |
| 4 Destroyers Lourds | 640 | 30,2 PV | 96 % |

> Il en faut **3** pour coucher Char lourd (T11) trois fois sur quatre, et **2**
> pour y arriver une fois sur deux.

Chaque ligne porte un multiplicateur : « ×4 » fait tirer quatre escouades
identiques, de quoi éprouver un effectif qu'on n'a pas encore acheté.

### Les stratagèmes qui changent un jet

Sur les **quarante-trois** fiches de stratagème, j'en ai relu chacune : **six**
seulement touchent la séquence d'attaque. Les autres déplacent, réaniment,
protègent, marquent un objectif ou réagissent au tir adverse. Les verser toutes en
aurait fait une liste à faire défiler ; elles restent dans l'écran En partie, qui
les donne toutes, filtrées par phase et par camp.

Les six apparaissent en pastilles, coût en PC écrit devant, filtrées par
détachement retenu, par phase, et par les mots-clés de l'unité chargée : Meurtre
Méthodique disparaît quand on charge un Monolithe, puisqu'il exclut les VÉHICULES.

**Ciblage Moléculaire** a demandé un vrai travail de moteur. « Ignorer les
modificateurs au jet de touche » inclut le −1 du couvert et celui du tir indirect,
qui en 11e édition passent tous deux par le jet de touche mais sont appliqués dans
la normalisation, pas dans `hitMod`. Le drapeau les court-circuite donc là, et
laisse le bonus.

Et les règles du détachement, qui s'appliquent depuis toujours sans qu'on les
coche, se lisent enfin : un bloc en lecture seule sous les pastilles. On ne vérifie
pas ce qu'on ne voit pas.

### Le palmarès des 136 armes

« Avec quoi je perce ce char » ne se résout pas en essayant les armes une par une.
L'écran les passe **toutes** au moteur contre la cible du moment et les range :
par arme ou par unité, en puissance brute ou au point, sur toute la faction ou sur
ce qu'on possède déjà, en tir ou en mêlée. Les unités de la liste en service
portent un repère.

Contre du Space Marine, le Rayon Annihilateur du Roi Silencieux sort premier à
25 PV. Contre un char lourd il tient encore la tête, mais c'est le **Destructeur
gauss** des Destroyers Lourds qui gagne au point : 4,7 PV pour 100 points contre
4,0 — et il coûte 160 points au lieu de 420.

Chaque fiche est prise **nue** : effectif maximum, toutes les figurines portant
l'arme quand l'emplacement le permet, sans détachement, sans personnage rattaché,
sans retouche. C'est une carte du terrain, pas un calcul de partie, et l'écran le
dit sous le tableau.

---

## Ce qui reste en suspens après le chantier 31

| Point | Ce qu'il faudrait |
|---|---|
| **Anti-X sans mot-clé** | cinq profils portent `anti:N` sans que le catalogue dise **contre quoi** : Obélisque « Tesla sphere ×4 », Voûte Tesseract « Time's Arrow », Trompeur C'tan « Cosmic insanity », et les deux profils de la lance du Dragon du Vide. Le moteur l'applique donc **sans condition**, ce qui surestime ces armes hors de leur vraie cible. Les mots-clés de cible existent maintenant : il ne manque que les cinq valeurs. |
| **Les deux règles Lokhust** | à confirmer sur la datasheet ; marquées comme telles dans l'écran. |
| **Le couvert en mêlée** | gaté au tir par hypothèse. |
| **Traduction** | 0 nom d'unité sur 50, ~98 noms d'arme sur 108, 32 améliorations sur 42 restent en anglais. |
| **PC au round 1** | le compteur démarre à 0. |

---

## 32. Quinze fiches relues, et Anti-X sait enfin contre quoi — 21/08/2026

Le joueur a envoyé quinze datasheets en photo. Je les ai comparées ligne à ligne
au catalogue. **Les caractéristiques étaient justes** — cinquante unités, aucune
valeur de M, E, Svg, PV, points ou effectif à reprendre. Ce qui manquait était
ailleurs.

### Anti-X : le trou signalé au chantier 31 se referme

Cinq profils portaient `anti:N` sans que le catalogue dise **contre quoi**. Le
moteur l'accordait donc toujours. Trois sont maintenant renseignés :

| Arme | Vraie règle |
|---|---|
| Trompeur C'tan · Folie cosmique | **ANTI-PERSONNAGE 4+** |
| Dragon du Vide · lance (tir) | **ANTI-VÉHICULE 2+** |
| Dragon du Vide · lance (mêlée) | **ANTI-VÉHICULE 2+** |

Le drapeau devient `anti:4:perso` — seuil, puis mot-clé visé. Rien à cocher : la
cible porte ses mots-clés depuis le chantier 31, donc l'aptitude s'allume ou
s'éteint toute seule. Éteinte, elle reste affichée **en pointillé** avec sa
raison, comme le Tir Rapide hors de portée : une arme qui perd son Anti-X doit
le montrer, pas disparaître en silence.

Le surcoût était réel. Le Trompeur, dont la Folie cosmique a aussi Blessures
Dévastatrices, était **surévalué de 22 %** contre tout ce qui n'est pas un
personnage — 6,1 PV annoncés contre 5,0 réels sur cinq Space Marines. La lance
du Dragon du Vide, elle, ne perd rien : à F8 contre E4 elle blesse déjà sur 2+.

Deux profils restent sans mot-clé — Obélisque « Tesla sphere ×4 » et Voûte
Tesseract « Time's Arrow ». Faute de leur fiche, ils s'appliquent sans
condition, et **l'écran le dit** plutôt que de le taire.

### Six écarts de fiche

| | |
|---|---|
| Aeonstave du Chronomancien | ni **Déflagration** ni portée : deux caractéristiques perdues |
| Huit profils de mêlée | portaient la portée de leur jumeau de tir (« Bâton de lumière (càc) · 18" ») |
| Roi Silencieux | la masse blindée des deux Menhirs n'était pas au catalogue |
| Sept socles | Hexmark 50, Plasmancien 32, Géomancien 50, Garde Royal 32, Technomancien 50, Nékrosor 80, Trazyn 25 |
| Deux socles de C'tan | Fossoyeur **90**, Trompeur **40** — tous deux notés 60 |
| Overlord au Linceul de Translocation | fiche entière absente : 90 pts, lame seule, orbe d'office |

### Quatre règles qui n'atteignaient pas le calcul

Leur texte était au catalogue et se lisait dans la fiche ; simplement, rien ne
descendait jusqu'au moteur.

- **Folie Meurtrière Infectieuse** (Nékrosor) — Touches Soutenues 1 à toute unité
  NÉCRONS à 6". La fiche **exclut** MONSTRE et TITANESQUE : les auras ne savaient
  qu'inclure, elles savent maintenant exclure. Un Monolithe ne reçoit rien.
- **Phaeron des Astres** (Roi Silencieux) — relance des 1 à la touche *et* à la
  blessure, MONSTRES exclus.
- **Phaeron des Lames** (Roi Silencieux) — **+1 en Force en mêlée**. Le profil ne
  savait pas recevoir un modificateur de Force par condition : il le sait.
  L'aptitude ne se propose donc qu'au corps à corps.
- **Maître Chronomancien** (Orikan) — invulnérable 4+ à l'unité menée. Le côté
  cible d'une unité de la liste ne lisait que l'insensibilité d'un Technomancien ;
  il lit maintenant aussi l'invulnérable octroyée. Dix Immortels menés par Orikan
  passent de « pas d'invu » à 4+.

Les trois aptitudes du Triarcat s'excluent — une seule par round de bataille. Le
libellé de chaque case le dit ; le choix reste au joueur.

**Prophète de la Destruction** (Nékrosor) rejoint les conditions de partie, comme
toute règle suspendue à un événement du tour.

### Ce qui reste ouvert

L'aura d'Illuminor Szeras a une **seconde moitié, défensive** — chaque attaque
visant l'unité voit sa Pénétration d'Armure empirée de 1. L'onglet Encaisser ne
l'applique pas : le texte du raccourci le dit désormais en toutes lettres plutôt
que de laisser croire l'aura entière.

---

## 33. Les cinquante fiches relues, une par une — 21/08/2026

Le joueur a envoyé la faction entière en photo. Chaque datasheet a été comparée
ligne à ligne au catalogue : caractéristiques, profils d'arme, mots-clés, coûts,
paliers d'effectif, textes de règles.

**Le fond était juste.** Sur cinquante et une unités et cent trente-huit profils
d'arme, pas un M, une E, une Svg, un PV, un coût ni un palier à reprendre. Ce qui
a été trouvé tenait dans trois catégories.

### Anti-X est refermé

Les cinq profils qui portaient `anti:N` sans dire contre quoi ont tous leur
mot-clé :

| Arme | Règle |
|---|---|
| Trompeur C'tan · Folie cosmique | ANTI-PERSONNAGE 4+ |
| Dragon du Vide · lance (tir et mêlée) | ANTI-VÉHICULE 2+ |
| **Obélisque · Sphère tesla** | **ANTI-VOLANT 4+** |
| **Voûte Tesseract · Flèche du Temps** | **ANTI-PERSONNAGE 4+** |

Plus aucune aptitude Anti-X n'est accordée sans condition.

### Le défaut de calcul : un seuil qui n'en était pas un

La **Faim de Chair** des Écorcheurs et **Les Astres Sont Alignés** d'Orikan disent
« un jet **réussi** donne un critique ». Toutes deux étaient encodées « 2+ ». Or
dans le moteur une touche critique réussit toujours : un seuil de 2+ faisait
toucher les Écorcheurs sur 2+ au lieu de 3+.

```
dix Écorcheurs, Faim de Chair déclarée
   annoncé   25,0 PV
   réel      20,0 PV        un quart de trop
```

Le seuil n'est pas un chiffre mais une conséquence — le plus petit jet qui
réussisse. La valeur `"tous"` le dit et se résout après les conditions, quand les
modificateurs sont connus : à CC 3+ le critique tombe à 3+, avec +1 pour toucher
il descend à 2+.

### La règle des Destroyers Lourds, confirmée — et corrigée

Elle était encodée sur la dictée du joueur, marquée « à confirmer sur ta
datasheet ». La fiche la confirme, et corrige une nuance : la clause de
l'Exterminateur enmitique **exclut** MONSTRE et VÉHICULE au lieu d'inclure
INFANTERIE. Un ennemi qui ne serait ni l'un ni l'autre — une BÊTE, un ESSAIM —
recevait donc l'aptitude à tort dans un sens et pas dans l'autre. Les aptitudes
conditionnées par la cible savent maintenant exclure autant qu'inclure.

Le doublon manuel qui restait dans les conditions de partie disparaît : la règle
s'applique seule, correctement.

### Quinze écarts de fiche

| | |
|---|---|
| Aeonstave du Chronomancien | ni Déflagration ni portée |
| Bâton d'alliance des Prétoriens | tirait « au contact » au lieu de 12" |
| Deux projecteurs de particules | avaient perdu PISTOLET |
| Huit profils de mêlée | portaient la portée de leur jumeau de tir |
| Masse blindée des Menhirs | absente du Roi Silencieux |
| Réanimateur Canoptek | Cd 8+ au lieu de 7+ |
| Overlord au Linceul de Translocation | fiche entière absente |
| **Vingt-cinq socles** | dont deux C'tan, quatre socles volants ronds pris pour des rectangles, et trois « utiliser le modèle » |

### Sept règles qui n'atteignaient pas le calcul

Folie Meurtrière Infectieuse du Nékrosor (Touches Soutenues 1, MONSTRES et
TITANESQUES exclus — les auras ne savaient qu'inclure), Phaeron des Astres et
Phaeron des Lames du Roi Silencieux (dont un +1 en Force que le profil ne savait
pas recevoir), Maître Chronomancien d'Orikan (invulnérable 4+ à l'unité menée),
Prophète de la Destruction du Nékrosor.

### Quatre réserves tombent

| Réserve | Verdict de la fiche |
|---|---|
| « le rattachement au Doom Scythe est une déduction » | nom, M et CO à « — » confirmés |
| « le pack nomme cette fiche Moissonneur » | Night Scythe confirmé — et le mot-clé CHÂSSIS que la note affirmait n'existe pas |
| « aucune invu listée pour les Prétoriens (à revérifier) » | ils n'en ont pas |
| « la composition 1 à 3 de la Convergence n'a pas de source » | confirmée |

### Ce qui reste ouvert

L'aura d'Illuminor Szeras garde sa **moitié défensive** non automatisée — chaque
attaque visant l'unité voit sa PA empirée de 1, ce que l'onglet Encaisser
n'applique pas. Le texte du raccourci le dit. *(Refermé au chantier 34.)*

## 34. L'onglet Encaisser sait enfin ce qui protège l'unité — 21/08/2026

Une aura peut avoir deux moitiés qui ne regardent pas du même côté. Celle
d'**Illuminor Szeras** améliore de 1 la PA des attaques que fait l'unité *et*
empire de 1 la PA des attaques qui la **visent**. Seule la première était
calculée ; la seconde n'existait que dans le texte d'un raccourci, à retrancher
à la main.

### Une aura, deux sens

`sens:"def"` sépare les deux moitiés dans la même table. Le côté attaque écarte
ce qui porte la marque ; l'onglet Encaisser ne lit que cela. `val` est ce qu'on
ajoute à la PA de l'assaillant — `-1` l'empire d'un cran — et le moteur plafonne
déjà à 0, donc une PA nulle reste nulle sans rien de spécial à écrire.

```
vingt Guerriers, dix Bolters lourds
   sans l'aura   11,1 figurines perdues
   déclarée       8,3                     un quart de moins
```

Le profil de la menace annonce la retouche au lieu de la subir en silence :
`PA 0 au lieu de -1`. Quand la PA vaut déjà 0, rien ne s'affiche — l'aura n'y
change rien et ne doit pas prétendre le contraire.

### Ce qui protège : deux natures, pas une

L'écran distingue maintenant deux choses que le joueur ne doit pas confondre.

| | Nature | Traitement |
|---|---|---|
| Ce qu'un **personnage rattaché** donne | une propriété de la liste : il mène l'unité, point | compté d'office, annoncé en clair |
| Une **aura d'armée** | tient à une distance que l'application ne connaît pas | proposée, laissée à déclarer |

C'est la même règle que partout ailleurs dans l'application : ne jamais deviner
une distance, ne jamais faire oublier ce qui est acquis.

### Le défaut trouvé en chemin : deux onglets, deux réponses

L'onglet Attaque lisait déjà l'invulnérable et l'Insensible qu'un personnage
rattaché accorde à son escouade. L'onglet Encaisser, non — il construisait le
profil défensif à partir de la seule ligne du catalogue. La même unité de la même
liste répondait donc deux choses différentes selon l'écran regardé.

```
dix Immortels menés par Orikan, dix tirs de Plasma surchargé
   annoncé   7,4 figurines perdues        sauvegarde 6+ après PA
   réel      4,5                          invulnérable 4+ d'Orikan
```

Quatre pertes sur dix annoncées en trop. Le Technomancien avait le même sort,
plus discrètement (Insensible 5+ : 11,1 → 9,9 contre des Bolters lourds).

### Et l'unité visée est enfin la bonne

Les pastilles de choix étaient dédupliquées sur le nom et l'effectif, et l'unité
retrouvée dans la liste **par son nom**. Deux escouades d'Immortels ×10, l'une
menée par Orikan et l'autre non, n'en faisaient qu'une — et c'était toujours la
première qui répondait. Chaque pastille porte maintenant son meneur, la clé de
déduplication le compte, et la résolution passe par l'identité de l'unité. Une
figurine visée seule ne mène personne : ni ses auras ni celles qu'elle recevrait
comme meneuse ne la couvrent.

### Vérification

`ROSTER.defenses(nom, id)` rend ce qui protège une unité, d'office d'un côté et à
déclarer de l'autre — dix-huit contrôles en navigateur : l'aura proposée aux
BATTLELINE et refusée aux autres, la PA qui bouge et les pertes qui baissent, le
personnage rattaché compté, le côté attaque qui ignore la moitié défensive, et
deux escouades homonymes qui ne se confondent plus.

## 35. Chaque unité a un métier, et la Disposition dit lesquels comptent — 21/08/2026

L'application savait ranger une liste par **catégorie de fiche** — Battleline,
Infanterie, Véhicule. Utile pour retrouver une unité, muet sur la partie. Ce
chantier lui donne le vocabulaire qui manquait : ce que chaque unité **fait**.

### Ce qui a été écarté, et pourquoi

Le vocabulaire compétitif mélange deux choses. « Alpha strike »,
« contre-charge », « pièce d'échange », « denial » ne sont pas des métiers
d'unité — ce sont des **plans** ou des **moments**. Une unité n'est pas
« alpha strike » ; c'est la liste qui a un plan d'alpha strike. « Denial », c'est
ce que fait un écran. « Slot filler » est mort avec l'organisation d'armée de la
9e édition.

Un rôle utile répond à une question qu'on se pose **la liste ouverte**.

### Douze rôles, quatre familles

| Famille | Rôles |
|---|---|
| **Marquer** | Garde arrière · Preneur de milieu · Faiseur d'actions |
| **Tenir** | Enclume · Écran |
| **Détruire** | Anti-char · Anti-élite · Anti-masse · Marteau |
| **Peser** | Harcèlement · Soutien · Transport |

Les rôles de destruction se découpent **par profil de cible**, parce que c'est
ainsi qu'on relit une liste : « ai-je du tir » ne veut rien dire, « qui tue un
char » se vérifie. Un anti-char (Force haute, PA, dégâts par coup) et un
anti-masse (volume d'attaques, la PA se gaspille) ne partagent aucune arme.
Les trois premiers disent QUOI on tue ; le Marteau dit OÙ — un autre axe,
assumé, parce que gagner un corps à corps qu'on choisit est une question
distincte de percer un blindage.

Trois rôles au plus par unité, et **pas de rôle principal** : une unité qui fait
deux métiers apparaît dans les deux. C'est justement la question qu'on se pose —
« qui couvre ce travail », et non « à quoi sert celle-ci ».

### Le rôle vit sur la liste, pas sur la fiche

Les mêmes vingt Guerriers gardent l'objectif arrière dans une liste et servent
d'enclume au milieu dans une autre. Le rôle appartient donc à l'unité **de la
liste**. Le catalogue ne fournit qu'une suggestion — les cinquante et une fiches
nécrones en ont une, tirée des profils d'arme et des aptitudes de mouvement —
affichée en pointillé tant qu'on n'y a pas touché, et jamais enregistrée. Le
premier clic fige le choix ; un bouton rend la suggestion.

### Le vrai levier : la Disposition de Force

L'application relevait déjà la Disposition de chaque détachement sur le MFM sans
rien en faire. En 11e, c'est elle qui dit **comment tu marques**.

| Disposition | Les métiers qu'elle réclame |
|---|---|
| Prendre et Tenir | garde arrière, preneur de milieu, enclume, écran |
| Purger l'Ennemi | anti-char, anti-élite, anti-masse, marteau |
| Reconnaissance | faiseur d'actions, harcèlement, transport |
| Perturbation | faiseur d'actions, harcèlement, écran |
| Actifs Prioritaires | preneur de milieu, enclume, anti-char, garde arrière |

La bonne question n'est donc pas « ma liste est-elle équilibrée » dans l'absolu,
mais **« ai-je ce qu'il faut pour la façon dont MOI je marque »**. Une liste sans
anti-char est cassée en Purger l'Ennemi ; la même peut très bien tenir en Prendre
et Tenir.

Le bilan le dit en tête, avant les points non dépensés :

> **Aucun anti-char, aucun anti-masse** — Ta disposition Purger l'Ennemi marque
> là-dessus. C'est 2 métiers que ta liste ne fait pas.

Et quand un seul métier manque, la ligne rappelle ce qu'il demande, de quoi
partir chercher l'unité.

### Un manque doit se voir là où on le cherche

Première version : la vue par rôle ne montrait que les rôles **occupés**. Le
métier absent — l'information la plus chère de l'écran — n'y apparaissait
nulle part. Un rôle que la Disposition réclame et que personne ne fait a
maintenant sa ligne, en rouge, marquée « personne ». Une ligne vide vaut mieux
qu'une ligne absente : c'est la case non cochée d'une liste de courses.

Le pavé cycle désormais sur trois vues au lieu de deux : à plat, par catégorie de
fiche, par rôle tactique. Et il prévient qu'une unité comptée dans deux métiers
apparaît dans les deux, sinon la somme des lignes ne tombe pas sur le total de la
liste et on croit à un défaut.

### Vérification

`ROSTER.roles(id)` rend les métiers d'une unité, d'où ils viennent et ce que la
Disposition attend. Trente et un contrôles en navigateur, plus cinq sur le
partage : le rôle choisi voyage dans le lien, la suggestion se recalcule à
l'arrivée — si le catalogue a changé entre-temps, c'est la nouvelle qui vaut.
