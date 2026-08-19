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
