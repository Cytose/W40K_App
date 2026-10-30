# Ce que le moteur sait jouer, et ce qui reste dehors

Recensement du 30/10/2026, à partir des champs `"_"` de tous les fichiers
`outils/cablage/*.json` et des listes des fils Astartes, Imperium, Chaos
et Xenos. Le détail de chaque champ est en tête d'`engine.js`.

## Les nouveaux mots du câblage

Une entrée d'`APTIS_COND`, `AURAS_ARMEE`, `AURAS_PERSO`, `APTIS_UNITE` ou
`OCTROIS_DETACH` peut désormais porter :

| Champ ou mot | Valeur | Ce que ça fait | Exemple |
|---|---|---|---|
| `psy: true` | — | ne vaut que pour les armes au drapeau `psychic` | Grand Coven |
| `siMot` | `"sust"`, `"lethal"`… | seulement les armes qui portent déjà ce mot-clé | Carnival of Excess |
| `champ: "toughMod"` | `-1` | retire de l'Endurance à la cible | Don de Nurgle |
| `champ: "rrH"` / `"rrW"` | `"un"` | UNE relance pour la séquence, partagée par l'unité | Called Shots, Warpforged Cabal |
| `champ: "rrH"` / `"rrW"` | `"deux"` | relance des 1 et des 2 | Eye of the Pack |
| `champ: "rrD"` | `"un"` ou `"tous"` | relance des dégâts (un jet sous la moyenne du dé) | Eradicators, Annihilator |
| `champ: "rrA"` | `"tous"` | relance du nombre d'attaques | Overwhelming Generosity |
| `champ: "bsMod"` | `1` | CT/CC améliorée, hors du plafond ±1 | Pour le Bien Suprême |
| `champ: "bsSet"`, `"strSet"`, `"atkSet"`, `"dmgSet"` | nombre | caractéristique FIXÉE | Grotesques F8, Culexus D3 |
| `champ: "apCrit"` | `1` à `3` | PA en plus sur blessure critique | Crack Shot, Warbringer |
| `champ: "anti"` | `"4:veh"` | Anti-X prêté, qui ne mord que si la cible porte le mot-clé | Hellfire Rounds |
| `mot: "lance"` | — | [LANCE] : +1 pour blesser quand « A chargé ce tour » est coché | Seigneur de la Contagion |
| `mot: "ignoreMalus"` | — | ignore les malus au jet de touche | Techmarine |
| `mot: "heavy"` | — | [LOURD] prêté, avec son +1 si l'unité est restée immobile | Protector Imperative |

`STRAT_SIMU` accepte aussi `rrD`, `rrA`, `toughMod`, `bsMod` et `lance` dans
`effet`, et `"un"` pour `rrH`/`rrW`.

## La défense

Une entrée `sens: "def"` (dans `AURAS_ARMEE`, à déclarer dans Encaisser ;
dans `AURAS_PERSO` ou `APTIS_UNITE`, comptée d'office, ou à déclarer si
elle porte un `quand`) peut poser :

| Champ | Valeur | Ce que ça fait |
|---|---|---|
| `defHit` | `-1` | −1 au jet de touche de qui l'attaque |
| `defWnd` | `-1` | −1 au jet de blessure |
| `defWndFE` | `-1` | −1 au jet de blessure, seulement si F > E |
| `dmgRed` | `1` | −1 aux dégâts subis |
| `dmgHalf` | `1` | dégâts divisés par deux, arrondis au supérieur |
| `svMod` | `1` | sauvegarde d'armure améliorée (pas l'invulnérable) |
| `fnpPsy` | `3` à `6` | insensibilité contre les attaques psychiques seules |

Les mêmes réglages sont dans la carte Cible de l'onglet Attaque.

## Mots-clés de cible ajoutés

Psyker, Chaos, Démon, Imperium, Titanesque, Nuée, Bête, Fortification,
Marcheur. Ils se cochent sur la cible : ils ne se déduisent pas encore
d'une unité de la liste.

## Ce qui reste dehors, et pourquoi

- **Une partie de l'unité seulement** : figurines de PERSONNAGE (Aspire to
  Glory, Aspire to Infamy), Mutations, Beastmaster. Le simulateur mesure
  l'unité entière.
- **Le nombre de figurines alentour** : Psychic Communion, Hunta Rig,
  Wurrband, Sonic Destruction.
- **Mécaniques entières** : les Ordres de l'Astra, les Rituels des
  Thousand Sons (l'export n'a pas leur texte), les Actes de Foi des
  Sororitas (remplacer un dé par une valeur).
- **Un stratagème qui ne vise qu'une partie des armes** : un stratagème
  pose ses effets sur toute l'unité. « Devastating Sorcery » passe donc
  par deux pastilles d'`AURAS_ARMEE` au lieu de `STRAT_SIMU`.
- **[TIR RAPIDE] ou [FONTE] prêtés par un stratagème** : dans l'écran,
  ces cases veulent dire « à mi-portée », pas « l'arme l'a ».
- **Invulnérable selon le type d'attaque** (Kroot : 6+ au corps à corps,
  5+ au tir) et **ignorer les modificateurs de PA et de dégâts** (Seer's
  Eye).
- **Blessures mortelles** : le moteur n'en simule aucune, donc
  l'insensibilité contre les seules blessures mortelles n'a rien à
  réduire.
