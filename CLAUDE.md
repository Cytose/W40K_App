# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Langue

Tout le dépôt est en français : README, commentaires, noms de fonctions et de
variables (`profilsActifs`, `listeVierge`, `vaVers`), messages de commit. Écrire
en français, et dans le même registre : les commentaires expliquent *pourquoi*
une chose est ainsi, pas ce que le code fait déjà lire.

## Commandes

```sh
python3 -m http.server 8000     # servir les sources ; file:// refuse les <script src>
npm run build                   # = node build.js (nécessite npm i terser)

npm run gabarits                # layouts.js confronté aux gabarits officiels (Node pur)
npm run dispositions-test       # invariants géométriques des 45 cartes (Node pur)
node outils/test-plateau.mjs    # intégration axe Plateau — site servi sur :8099, ou $SITE
node outils/test-pc.mjs         # intégration gain de PC — idem

npm run catalogue               # écarts data.js ↔ BSData/wh40k-11e (clone voisin requis)
npm run dispositions            # RÉGÉNÈRE layouts.js depuis 40kdc-data (clone voisin requis)
```

Pas de linter, pas de framework de test. Chaque suite est un script autonome qui
imprime des lignes `✓` / `✗` et sort en 1 si quelque chose casse : le script
entier est la granularité, il n'y a pas de sélection d'un cas isolé. Les deux
suites d'intégration passent par `outils/navigateur.mjs`, qui résout Playwright
et son Chromium par leur nom — ne jamais y réintroduire un chemin absolu.

## Architecture

Application web statique : pas de framework, pas de bundler, aucune dépendance à
l'exécution. `index.html` porte la structure *et* toute la CSS, puis charge six
scripts **dans un ordre qui compte** — chacun est une IIFE qui lit les globales
posées par les précédents :

| Fichier | Expose | Rôle |
|---|---|---|
| `data.js` | ~39 tables (`UNITS`, `WEAPONS`, `ARMEMENT`, `DETACHMENTS`, `STRATS`, `APTITUDES`, `SOCLES`, `GLOSSAIRE`…) | les données Nécrons, lues partout par leur nom |
| `engine.js` | `ENG` | moteur de dés, pur, sans DOM : espérance exacte (`analytic`) et Monte-Carlo (`simulate`, `simulateCombined`) |
| `app.js` | `SIM` | axe Simulateur + l'état `S` et les utilitaires que `roster.js` déstructure en tête de fichier |
| `roster.js` | `ROSTER` | axes Listes et En partie, Comparer, fiche d'unité, partage, import `.ros`, navigation entre écrans |
| `layouts.js` | `LAYOUTS` | **fichier généré** — géométrie des 45 dispositions |
| `plateau.js` | `PLATEAU` | axe Plateau : pose des figurines, cohésion, portées de menace |

Les quatre axes sont quatre `div.screen` (`scList`, `scSim`, `scPlay`, `scMap`)
qu'on bascule par la classe `.on` ; `vaVers()` dans `roster.js` est le seul
point d'entrée de la navigation.

`roster.js` fait 5 900 lignes et se lit par ses bandeaux de commentaires en
capitales (`ETAT DE LA LISTE`, `CONSTRUCTION DES PROFILS D'ATTAQUE`,
`CE QUI SE DECLENCHE MAINTENANT`, `LIEN DE PARTAGE`…) : les grepper est plus
rapide que dérouler.

Un profil envoyé au moteur porte **l'attaquant et la cible dans le même objet**
(voir l'en-tête d'`engine.js`). Les retouches de partie — `apMod`, `dmgMod`,
`hitMod`, relances — s'écrivent à part du profil d'arme, qui reste celui de la
fiche officielle.

`SIM.atk()`, `ROSTER.simUnite()` et `PLATEAU.etat()` sont des **crochets de
vérification** : les suites Playwright y lisent ce que l'écran prétend dire.
Un remaniement qui les casse casse les suites.

## Données

`data.js` est saisi à la main depuis les sources officielles (Pack de Faction
Nécrons, Règles de Base, Compagnon de Rencontre, Munitorum Field Manual) et
recoupé programmatiquement — `npm run catalogue` dit où le catalogue BattleScribe
diverge, sans rien corriger. Le champ des points accepte deux écritures : le
barème simple `{effectif: points}`, et la liste de paliers `[[rang, barème], …]`
pour les dix-sept unités dont le prix monte avec le nombre de copies.

`layouts.js` porte `NE PAS MODIFIER A LA MAIN` en tête et le mérite : il est
produit par `outils/dispositions.js` depuis 40kdc-data. Une correction de
géométrie se fait dans le générateur, jamais dans le fichier.

## Persistance

Les clés `localStorage` gardent leur préfixe historique `mathhammer.*` —
`lists.v1`, `roster.v1`, `partie.v1`, `plateau.v1`, `strats.v1`, `cibles.v1`,
`cmp.v1`, `grp.v1`. **Les renommer couperait chaque joueur de ses listes
enregistrées** : un nom de projet est une étiquette, une clé de stockage est une
adresse. Les listes chargées passent par `normaliseListe()` et `migreEnh()`, qui
rattrapent les formats antérieurs ; une unité devenue inconnue est retirée *et
nommée*, jamais escamotée en silence.

## Build et déploiement

`node build.js` produit d'un coup :

- `dist/` — le site que Vercel publie (`vercel.json#outputDirectory`), sources
  telles quelles ;
- `dist/W40K_App.html` **et `W40K_App.html` à la racine** — l'application repliée
  en un seul fichier. Ce fichier racine est suivi par git : toute modification
  des sources demande de rejouer le build et de committer le fichier autonome
  régénéré ;
- `dist/hors-ligne.html` — la même, gzippée derrière un chargeur ;
- `dist/sw.js` — le service worker dont le nom de cache porte l'empreinte
  SHA-256 des sources, de sorte qu'un déploiement invalide l'ancien cache.

Le repli en un fichier passe par des `String.replace()` qui **matchent les
balises `<script>` d'`index.html` au caractère près**. Ajouter un fichier JS
demande donc quatre gestes solidaires : l'ajouter à `SOURCES` dans `build.js`,
à `ASSETS` dans `sw.js`, aux balises d'`index.html`, et aux deux motifs de
substitution de `build.js` — sinon le fichier autonome sort silencieusement
amputé.

Toute la couleur vit dans le bloc `:root` d'`index.html`, jetons translucides
compris, et les valeurs y sont mesurées (4,5 : 1 minimum pour le texte, 2,2 : 1
de clarté entre les deux séries de graphique). Changer de thème = réécrire ce
bloc, rien d'autre.

## Git

Une branche appartient à une personne : `dev/kevin` à Kevin, `dev/Guillaume` à
Guillaume, `claude/*` à l'assistant. **Personne ne réécrit la branche d'un
autre** — pas de `push --force` sur une branche qu'on ne tient pas ; pour se
remettre à jour, on tire soi-même depuis `main`.

Les messages de commit sont en français : un titre qui dit le geste, puis un
corps qui raconte le problème constaté, la source qui tranche, et ce qui a été
corrigé. Le dépôt se lit comme un journal de bord.

`.gitignore` ignore `t*.js` (fichiers d'essai) : un nouveau source dont le nom
commence par `t` serait ignoré sans avertissement.
