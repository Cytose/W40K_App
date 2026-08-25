# Ouvrir l'application à d'autres factions — note technique

Guillaume voudrait y jouer **Adeptus Custodes**, **Astra Militarum** et
**World Eaters**. Cette note ne décide rien : elle chiffre. Elle dit ce
qui tombe tout seul des sources ouvertes, ce qui ne tombera jamais tout
seul, et ce que le code devrait changer. À vous deux de trancher au bout.

Rédigée le 22/08/2026, sur la base du dépôt à `3c01e6e`.
**Révisée le même jour** : Guillaume a signalé Wahapedia, qui déplace
sensiblement la ligne entre les deux moitiés. Le §3 en tient compte.

---

> ## ⚠ Ce que l'exécution a démenti — 25/08/2026
>
> **La note a été faite. Le corps ci-dessous n'est plus à jour, et il est
> gardé tel quel : c'est le compte rendu de ce qu'on savait le 22/08, pas
> l'état du dépôt.** Ce qui a réellement été livré est au §11, §12 et §13
> de `docs/feuille-de-route.md`.
>
> Guillaume a signalé que `BSData/wh40k-11e` porte les 29 factions. Le
> dépôt est joignable depuis mes machines, son voisin `wh40k-11e-mfm`
> aussi, et il est passé du `.cat` XML au **JSON** depuis la rédaction.
> Trois affirmations de cette note ne tiennent plus :
>
> | La note dit | Mesuré depuis |
> |---|---|
> | §2 — « L'invulnérable et le FNP ne sont pas dans le profil », d'où une passe de relecture par faction | Le profil `Unit` porte **`InSv`**, à côté de M, T, Sv, W, OC, LD. Cette passe n'existe pas. Le FNP, lui, reste dans le texte. |
> | §2 — « le catalogue s'est révélé **périmé sur les points** » | Les prix de l'effectif de base sont justes : **49 sur 49** contre notre table nécrone. Ce sont les **paliers** qui manquent, et le Munitorum les donne, seuils de réquisition compris. |
> | §3 — les optimisations en anglais, à chiffrer depuis le MFM | Le Munitorum donne nom **et** coût, BSData le texte complet. Les deux se recoupent par le nom. |
>
> Et une chose que la note ne dit pas, mesurée depuis : **BSData ne porte
> les règles de détachement que pour les Nécrons** — 9 sur 12, contre 0
> sur 9 pour les Custodes, 0 sur 11 pour l'Astra Militarum, 1 sur 8 pour
> les World Eaters.
>
> **Ce qui reste vrai, et qui était l'essentiel :** les stratagèmes sont
> absents des deux sources et exigent toujours Wahapedia, injoignable
> depuis mes machines (403 au tunnel) ; les socles viennent du Base Size
> Guide, un PDF ; et le **câblage du simulateur** reste le seul vrai poste
> manuel — aucune source ne traduit une règle en code.
>
> **L'option B du §7 a été retenue et exécutée.** Le refactor est fait,
> `data.js` ne connaît plus aucune faction, et les quatre factions sont
> livrées : Nécrons (51 fiches, relues à la main), Adeptus Custodes (31),
> Astra Militarum (134 dont 72 jouables), World Eaters (30). Le
> simulateur tourne sur les caractéristiques nues pour les trois
> ajoutées, comme l'option le prévoyait.
>
> L'estimation du §6 — « deux à trois semaines de soirées à deux » pour
> l'option A — portait pour l'essentiel sur du travail qui s'est révélé
> automatisable. Ce qu'il en reste, c'est le câblage, et lui seul.

---

## 1. Le constat de départ

L'application est écrite pour **une** faction. Ce n'est pas un défaut de
conception : c'était le bon choix tant qu'il n'y en avait qu'une. Mais
`data.js` déclare 39 tables globales — `UNITS`, `WEAPONS`,
`DETACHMENTS`, `APTITUDES`, `STRATS`… — et le reste du code les lit
directement, par leur nom, à 142 endroits.

Ces 142 lectures ne sont pas 142 problèmes. Elles passent presque toutes
par une petite dizaine d'index construits une fois au chargement
(`CATMAP`, le catalogue par nom, la table des armes par unité). C'est ce
qui rend le portage abordable : **ce n'est pas le nombre de références
qui coûte, c'est le contenu des tables**.

Et le contenu, lui, se sépare nettement en deux moitiés.

---

## 2. Ce qui se génère tout seul

Quatre sources ouvertes :

- **`BSData/wh40k-11e`** — profils de fiches, armes, mots-clés, textes
  d'aptitudes en anglais ;
- **`BSData/wh40k-11e-mfm`** — le Munitorum Field Manual scrapé chaque
  jour : points, détachements avec leur coût en PD, leur Disposition de
  Force, et le prix de chaque optimisation ;
- **le Base Size Guide** du Warhammer Event Companion — les socles ;
- **l'export de données Wahapedia** — voir §3, c'est la nouveauté.

Voilà ce que les trois premières produisent, mesuré :

| | Custodes | Astra Militarum | World Eaters |
|---|---:|---:|---:|
| Unités | 31 | 134 *(dont 62 Legends → **72** jouables)* | 30 |
| Profils d'armes | 93 | 846 | 127 |
| Aptitudes d'unité | 110 *(57 distinctes)* | 976 *(101 distinctes)* | 200 *(58 distinctes)* |
| Détachements | 9 | 11 | 8 |
| Optimisations chiffrées | 30 | 38 | 26 |
| Socles officiels au PDF | 31 | 75 | 31 |

Concrètement, se génèrent **sans intervention humaine** :

- `UNITS` — nom, M, E, Svg, PV, CO, tailles d'unité et paliers de points
  (y compris les paliers par effectif, `[[10,170],[20,330]]`) ;
- `WEAPONS` — nom, portée, A, CT/CC, F, PA, D, drapeaux, profils
  multiples inclus (les `➤ Plasma pistol - supercharge`) ;
- `CAT` — la catégorie de chaque unité, déduite des mots-clés ;
- `ATTACH` — qui peut rejoindre qui, déduit de la règle *Leader* ;
- `DETACHMENTS` — nom anglais, coût en PD, Disposition de Force,
  nombre et prix des optimisations ;
- `APTITUDES` — les textes anglais, tels quels. C'est déjà la convention
  du dépôt (« pas de traduction maison, une règle mal traduite se paie
  en partie ») ;
- `ENHANCEMENTS` — les textes anglais aussi.

Les deux plus gros blocs de `data.js` en volume (`APTITUDES`, 31 Ko ;
`ENHANCEMENTS`, 12 Ko) tombent donc du côté automatique.

### Deux réserves honnêtes

**Les socles ne se rattachent pas tout seuls.** Le PDF nomme des
*figurines*, l'application nomme des *unités*. Sur les unités jouables,
le rapprochement automatique par le nom donne 25/31 pour les Custodes,
65/72 pour l'Astra Militarum, 23/30 pour les World Eaters — soit **20
rattachements à faire à la main** en tout. C'est du travail bête, et
court.

**L'invulnérable et le FNP ne sont pas dans le profil.** Ils vivent dans
le texte des aptitudes. On peut les extraire par motif — ça marche bien
— mais il faut relire, faction par faction. Comptez une passe de
relecture par faction.

---

## 3. Wahapedia : ce qui change

La première version de cette note affirmait que les stratagèmes étaient
le poste le plus lourd de l'opération et qu'ils n'avaient aucun
raccourci. C'était vrai pour BSData — vérifié, zéro stratagème dans les
quatre catalogues — et faux dans l'absolu.

**Wahapedia publie un export de données officiel**, en CSV, couvrant la
11e édition, mis à jour le 17/08/2026 à l'heure où j'écris. Il est
annoncé pour cet usage exactement : *« The export data can be used to
research game mechanics and develop related interfaces »*, avec une
mention de Wahapedia recommandée en retour.

### Ce que l'export contient

Base : `https://wahapedia.ru/wh40k11ed/{Fichier}.csv`. Séparateur `|`,
une barre en fin de ligne aussi.

| Fichier | Ce qu'il donne | Ce qu'il alimente |
|---|---|---|
| `Stratagems.csv` | faction, nom, type, coût en PC, tour, phase, **détachement**, texte complet | `STRATS` |
| `Detachment_abilities.csv` | la règle de détachement, texte complet | `DETACHMENTS[4]` |
| `Enhancements.csv` | faction, nom, **coût**, détachement, texte complet | `ENHANCEMENTS` |
| `Abilities.csv` + `Datasheets_abilities.csv` | les aptitudes, texte complet | `APTITUDES` |
| `Datasheets_options.csv` | le texte des options d'équipement de chaque fiche | `ARMEMENT` |
| `Datasheets_unit_composition.csv` | la composition d'unité | `COMPO` |
| `Datasheets_models_cost.csv` | les points par effectif | recoupement du MFM |
| `Datasheets_leader.csv` | qui rejoint qui | recoupement d'`ATTACH` |
| `Factions.csv` | les codes de faction : `AC`, `AM`, `WE`, `NEC` | le filtre |

Vérifié à la main sur des lignes réelles : un stratagème arrive avec son
`<b>WHEN:</b> … <b>TARGET:</b> … <b>EFFECT:</b> …` complet ; une
optimisation Custodes arrive avec son coût (25) et sa règle intégrale.

### Le volume

| | Custodes | Astra Militarum | World Eaters |
|---|---:|---:|---:|
| Stratagèmes | **44** *(compté)* | ~50 *(estimé, 11 détachements)* | **37** *(compté)* |

Soit de l'ordre de **130 stratagèmes** pour les trois factions, contre
43 saisis à la main pour les Nécrons. **Ils ne sont plus à saisir.**

### Les quatre réserves

**1. C'est de l'anglais.** Wahapedia n'a pas de version française.
`STRATS` est en français aujourd'hui, saisi depuis les packs de faction
français de GW. Deux choix cohérents, pas trois :

- soit les factions ajoutées ont leurs stratagèmes **en anglais**, ce
  qui est déjà la convention du dépôt pour `APTITUDES` et
  `ENHANCEMENTS`, et se dit franchement à l'écran ;
- soit on traduit, et on retrouve les ~130 saisies qu'on venait
  d'économiser.

Mon avis : l'anglais. Un joueur de tournoi lit ses stratagèmes en
anglais de toute façon, et une règle mal traduite se paie en partie.

**2. Le texte est du HTML.** `<b>`, `<br>`, `<span class="kwb">` pour
les mots-clés. Il faut une petite passe de nettoyage — une trentaine de
lignes de Python — qui décide quoi garder. Les `kwb` sont en fait une
aubaine : ils marquent les mots-clés proprement, ce que le texte brut
des packs de faction ne fait pas.

**3. Je ne peux pas télécharger ces fichiers d'ici.** Vérifié :
`wahapedia.ru` n'est pas joignable depuis mon bac à sable, ni depuis le
pont vers la machine de Guillaume. Je peux lire les pages, pas aspirer
les CSV. **L'étape de récupération doit tourner sur une machine à
vous** — un `curl` sur dix-neuf fichiers, deux minutes. Le reste de la
chaîne (parsing, fusion, génération) je peux l'écrire et le tester dès
que les CSV sont dans le dépôt ou déposés dans un dossier partagé.

**4. Wahapedia est un site de fans.** Même statut que BSData vis-à-vis
de GW : non officiel, toléré, et qui peut disparaître. On ne construit
pas la chaîne dessus en dépendance dure — on télécharge une fois, on
versionne le résultat généré dans le dépôt, et on regénère quand on veut.
Et on ajoute un « powered by Wahapedia » quelque part, puisqu'ils le
demandent gentiment.

---

## 4. Ce qui ne se générera toujours pas

### Le câblage du simulateur

C'est maintenant **le seul vrai poste manuel**, et c'est aussi là qu'est
la valeur du dépôt. Savoir qu'une règle existe ne suffit pas : pour que
le simulateur en tienne compte, il faut lui dire *quel jet* elle
modifie, *quand*, et *sous quelle condition*. C'est ce que font ces
tables :

| Table | Lignes (Nécrons) | Ce qu'elle encode |
|---|---:|---|
| `APTIS_COND` | 53 | les aptitudes conditionnelles et leur déclencheur |
| `AURAS_ARMEE` | 40 | les auras d'armée |
| `OCTROIS_DETACH` | 33 | ce que chaque détachement octroie |
| `STRAT_SIMU` | 36 | les stratagèmes que le simulateur sait appliquer |
| `MENACES` | 32 | les profils de référence |
| `AURAS_PERSO` | 23 | les auras de personnage |
| `APTIS_UNITE` | 14 | les aptitudes attachées à une unité |
| `ABIMEES` | 13 | les profils dégradés |
| **Total** | **244** | |

Ces 244 lignes sont de la **traduction de règles en code**. Aucune
source ne les donne — ni BSData, ni Wahapedia, ni le MFM. Il faut lire
chaque règle et décider ce qu'elle fait au calcul. Sur les trois
factions, en supposant une densité comparable, c'est **entre 500 et 700
lignes** — et World Eaters, avec ses Bénédictions de Khorne et sa Dîme
de Sang, est sensiblement plus retors que les Nécrons.

Une nuance qui compte : ce travail est **incrémental et sans risque**.
Chaque ligne ajoutée améliore le simulateur, aucune ne casse ce qui
existe. On peut livrer les factions non câblées et câbler ensuite, à son
rythme, en commençant par les dix règles qui changent vraiment un
résultat.

### Les métiers

`ROLES_UNITE` assigne à la main, unité par unité, un à trois métiers
parmi les douze. Cinquante-et-une entrées pour les Nécrons ; 133 unités
jouables pour les trois factions.

Bonne nouvelle partielle : mon catalogue multi-faction calcule déjà une
suggestion automatique par unité, avec six axes chiffrés (mobilité,
dégâts, endurance, CO, portée, rendement) et un rôle principal. Mais il
la calcule dans **une autre taxonomie** — cinq rôles contre vos douze
métiers en quatre familles. La suggestion peut servir de **premier
jet** : elle évite la page blanche, elle ne remplace pas la relecture
d'un joueur qui connaît la faction.

Et il faut le dire clairement : les métiers Custodes et World Eaters ne
se devinent pas depuis les caractéristiques. Il faut quelqu'un qui joue
ces armées.

### Le panachage

`ARMEMENT`, `GRPN`, `RETINUE` encodent les panachages autorisés (5 Tesla
/ 5 Gauss) et les escortes. Wahapedia donne le **texte** des options de
chaque fiche, pas leur forme machine. C'est un bon point de départ pour
une saisie, pas une génération. À court terme : armement par défaut,
pas de panachage, sur les factions ajoutées.

---

## 5. Ce que le refactor touche

### La forme cible

Aujourd'hui :

```js
const UNITS = [ … ];        // Nécrons
const WEAPONS = [ … ];      // Nécrons
```

Demain :

```js
const FACTIONS = {
  necrons : { nom:"Nécrons", units:[…], weapons:[…], … },
  custodes: { nom:"Adeptus Custodes", … },
  // …
};
```

…avec un **adaptateur** qui, au changement de faction active, réaffecte
les noms globaux :

```js
let UNITS, WEAPONS, DETACHMENTS, APTITUDES, STRATS, /* … */;
function activeFaction(cle){
  const F = FACTIONS[cle];
  UNITS = F.units; WEAPONS = F.weapons; /* … les 39 tables */
  reconstruitIndex();   // CATMAP, catalogue par nom, armes par unité
}
```

Les 142 références existantes **ne bougent pas**. C'est tout l'intérêt :
le refactor est confiné à `data.js` et à une fonction de bascule. Les
tables qui ne dépendent pas de la faction — `KW`, `GLOSSAIRE`,
`MOTS_CIBLE`, `ROLES`, `DISPO_ROLES`, `DISPO_FR`, `CAT_ORDRE` — restent
globales telles quelles.

### Les points de friction, sans les cacher

1. **`const` → `let`.** Trente-neuf déclarations changent de nature.
   Mécanique, mais ça retire le filet du `const` sur des tables qu'on
   veut immuables. Une alternative : un objet `D` (`D.UNITS`,
   `D.WEAPONS`) — plus propre, mais qui casse les 142 références. Le
   `let` est le choix pragmatique.

2. **Les index dérivés.** `CATMAP`, le catalogue par nom, la table des
   armes, `BASES` (dérivé de `SOCLES`) sont construits au chargement.
   Ils doivent être reconstruits à chaque bascule. Il faut les
   recenser : c'est la partie du refactor où on oublie quelque chose.

3. **Le modèle de liste.** `{id, nom, cap, detach, fd, units, nextId}`
   n'a pas de champ faction. Il en faut un, plus une migration des
   listes déjà enregistrées dans `mathhammer.lists.v1` (défaut :
   `necrons`, ce qui est vrai pour toutes les listes existantes).
   Idem pour le lien de partage compressé et pour l'état du Plateau.

4. **Le poids.** `data.js` fait 1 809 lignes et 157 Ko pour une faction.
   La part purement générée y pèse environ 780 lignes pour 63 unités,
   soit une douzaine de lignes par unité. Les trois factions ajoutent
   133 unités jouables et 1 066 profils d'armes ; avec les stratagèmes
   Wahapedia par-dessus, comptez **+3 000 à +3 500 lignes**. `data.js`
   triple, `W40K_App.html` passe de 593 Ko à quelque chose comme 1 Mo.
   C'est encore tenable pour du hors-ligne, mais ça plaide pour **un
   fichier par faction** (`data-necrons.js`, `data-custodes.js`…) : la
   chaîne de build les concatène déjà, `build.js` n'a besoin que de
   nouvelles entrées dans `SOURCES` et `sw.js` dans `ASSETS`.

5. **Un sélecteur de faction** sur l'écran Listes, et la question de
   savoir si l'adversaire du Plateau peut être d'une autre faction que
   la sienne (aujourd'hui, le Plateau ne connaît que sa propre liste —
   ce serait l'occasion).

### Ce que ça représente

Le refactor lui-même — structure, adaptateur, index, migration,
sélecteur, build — est **de l'ordre de deux à trois soirées**, tests
compris. Ce n'est pas là que ça coûte.

---

## 6. Trois façons d'y aller

### A. Refactor + les trois factions, complètes

Tout : fiches, armes, détachements, stratagèmes, optimisations, câblage
du simulateur, métiers relus.

- Généré : 195 unités, 1 066 profils d'armes, 28 détachements, 94
  optimisations, ~130 stratagèmes.
- À la main : ~600 lignes de câblage, 133 métiers relus, 20 socles
  rattachés, 3 passes invu/FNP, le panachage.
- **Coût : le refactor, plus deux à trois soirées d'extraction, plus le
  câblage.** Avant Wahapedia j'annonçais plusieurs semaines ; c'est
  maintenant de l'ordre de **deux à trois semaines de soirées à deux**,
  dont l'essentiel est le câblage — le seul travail qui demande de
  réfléchir.

### B. Refactor + les trois factions, simulateur non câblé

On génère tout ce qui se génère, stratagèmes compris. Les factions
ajoutées ont leurs fiches, leurs armes, leurs points, leurs
détachements, leurs stratagèmes, leurs optimisations, leurs socles —
donc l'écran Listes, le Plateau, les rôles suggérés, et la consultation
des règles. Le **simulateur tourne sur les caractéristiques nues** :
pas d'auras, pas de règles conditionnelles, les stratagèmes affichés
mais non appliqués. Un bandeau le dit franchement.

- **Coût : le refactor, plus une à deux soirées par faction.**
- On câble ensuite, faction par faction, quand l'envie vient.

### C. Rien pour l'instant, le Plateau seulement

Le Plateau n'a besoin que de trois choses par unité : le nom, la taille,
le socle. Le `SOCLES` officiel couvre déjà les 29 factions (1 083
entrées extraites du PDF). On pourrait laisser Guillaume **poser des
unités adverses génériques** sur la table — « 10 figurines, socle 32 mm »
— sans toucher à `data.js`.

- **Coût : une soirée.**
- Ça résout le besoin de tester des déploiements contre du Custodes
  sans ouvrir le chantier multi-faction.

---

## 7. Ce que je recommande, pour ce que ça vaut

**B, avec C tout de suite.**

C est indépendant du reste et rend service dès demain soir : poser
l'armée d'en face sur le plateau ne demande pas de connaître ses règles.

B parce que le refactor est le seul travail qui ne se divise pas — il
faut le faire une fois, proprement, et après ça chaque faction est un
fichier de données de plus. Et parce que la frontière entre « règles
consultables » et « simulateur câblé » est nette, défendable, et facile
à expliquer à l'écran. Mieux vaut trois factions honnêtement incomplètes
qu'une promesse de simulateur qui ment sur les Bénédictions de Khorne.

Wahapedia change surtout le rapport entre B et A : la marche entre les
deux n'est plus « saisir 130 stratagèmes puis les câbler », mais
seulement « les câbler ». A devient atteignable faction par faction, en
commençant par celle que l'un de vous joue vraiment.

### La première chose à faire, concrètement

Quelqu'un lance ceci sur sa machine et commite le dossier :

```sh
mkdir -p build/waha && cd build/waha
for f in Factions Source Datasheets Datasheets_abilities Datasheets_keywords \
         Datasheets_models Datasheets_options Datasheets_wargear \
         Datasheets_unit_composition Datasheets_models_cost \
         Datasheets_stratagems Datasheets_enhancements \
         Datasheets_detachment_abilities Datasheets_leader \
         Stratagems Abilities Enhancements Detachment_abilities Last_update; do
  curl -fSL -o "$f.csv" "https://wahapedia.ru/wh40k11ed/$f.csv"
done
```

À partir de là, j'écris le parseur et la fusion, et on voit ce que ça
donne réellement sur une faction avant de décider pour les trois.

---

*Les chiffres de cette note sont mesurés, pas estimés, sauf mention
contraire : comptages faits sur `BSData/wh40k-11e` et `wh40k-11e-mfm` au
22/08/2026, sur l'export Wahapedia du 17/08/2026, et sur `data.js` à
`3c01e6e`. Wahapedia et BSData sont des projets de fans, non affiliés à
Games Workshop. Cette application non plus.*
