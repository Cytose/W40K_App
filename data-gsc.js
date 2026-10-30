/* ============================================================
   Données Cultes Genestealers — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py gsc

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 50 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     24 fiches sur 25 en ont un. Les autres — des Legends, que le
     guide ne liste pas — sont posées sur un socle par défaut.
   · Les tables du simulateur — APTIS_COND, AURAS_ARMEE,
     AURAS_PERSO, OCTROIS_DETACH, STRAT_SIMU, MOMENTS, ABIMEES —
     sont vides. Elles traduisent une règle en code : aucune source
     ne les donne, il faut lire chaque règle et décider ce qu'elle
     fait au calcul. Le simulateur tourne donc sur les
     caractéristiques nues pour cette faction.
   · ARMEMENT est vide : toutes les armes de la fiche comptent, il
     n'y a pas de panachage. C'est faux pour les unités à choix
     d'arme, et c'est signalé plutôt que deviné.
   · Les aptitudes et les optimisations sont EN ANGLAIS, texte du
     catalogue. C'est la convention du dépôt : une règle mal
     traduite se paie en partie.
   ============================================================ */
(function(){
"use strict";

/* UNITS : [nom, M, E, Svg, Invu, PV, tailles[], points, fnp, rôle,
   legends, notes, CO, Cd] */
const UNITS = [
  ["Aberrants",6,6,5,0,3,[5, 10],[[1, {"5": 140, "10": 280}], [3, {"5": 150, "10": 290}]],0,"",0,"",1,"7+"],
  ["Abominant",6,6,5,0,5,[1],[[1, {"1": 85}], [3, {"1": 95}]],0,"Meneur",0,"",1,"7+"],
  ["Achilles Ridgerunners",12,7,3,0,8,[1, 2],[[1, {"1": 95, "2": 160}], [3, {"1": 105, "2": 170}]],0,"",0,"",3,"7+"],
  ["Acolyte Hybrids with Autopistols",6,4,5,0,1,[5, 10],{"5": 65, "10": 120},0,"",0,"",2,"7+"],
  ["Acolyte Hybrids with Hand Flamers",6,4,5,0,1,[5, 10],{"5": 75, "10": 140},0,"",0,"",2,"7+"],
  ["Acolyte Iconward",6,4,5,0,3,[1],{"1": 50},0,"Meneur",0,"",1,"6+"],
  ["Atalan Jackals",12,4,5,0,2,[5, 9, 10],[[1, {"5": 85, "10": 150, "9": 160}], [3, {"5": 95, "10": 160, "9": 170}]],0,"",0,"",1,"7+"],
  ["Benefictus",6,3,5,5,3,[1],{"1": 75},0,"Meneur",0,"",1,"7+"],
  ["Biophagus",6,3,5,0,3,[1],{"1": 50},0,"Appui",0,"",1,"7+"],
  ["Clamavus",6,3,5,0,3,[1],{"1": 50},0,"Appui",0,"",1,"6+"],
  ["Goliath Rockgrinder",12,10,3,0,10,[1],[[1, {"1": 110}], [3, {"1": 120}]],0,"",0,"",3,"7+"],
  ["Goliath Truck",12,9,3,0,10,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"7+"],
  ["Hybrid Metamorphs",6,4,5,0,1,[5, 10],[[1, {"5": 75, "10": 140}], [3, {"5": 85, "10": 150}]],0,"",0,"",1,"7+"],
  ["Jackal Alphus",12,4,5,0,4,[1],{"1": 55},0,"Meneur",0,"",1,"7+"],
  ["Kelermorph",6,3,5,5,3,[1],{"1": 60},0,"",0,"",1,"7+"],
  ["Locus",6,4,5,4,3,[1],{"1": 35},0,"Appui",0,"",1,"7+"],
  ["Magus",6,3,5,5,4,[1],{"1": 50},0,"Meneur",0,"",1,"6+"],
  ["Neophyte Hybrids",6,3,5,0,1,[10, 20],{"10": 70, "20": 135},0,"",0,"",2,"7+"],
  ["Nexos",6,3,5,0,3,[1],{"1": 50},0,"Appui",0,"",1,"7+"],
  ["Patriarch",8,5,4,4,6,[1],{"1": 80},0,"Meneur",0,"",1,"6+"],
  ["Primus",6,3,5,5,4,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Purestrain Genestealers",8,4,5,5,2,[5, 10],[[1, {"5": 75, "10": 140}], [3, {"5": 85, "10": 150}]],0,"",0,"",1,"7+"],
  ["Reductus Saboteur",6,3,5,5,3,[1],[[1, {"1": 70}], [3, {"1": 80}]],0,"",0,"",1,"7+"],
  ["Sanctus",6,3,5,5,3,[1],{"1": 60},0,"",0,"",1,"7+"],
  ["Tectonic Fragdrill",0,11,3,0,14,[1],{"1": 125},0,"",1,"",0,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Aberrants","Aberrant weapons","C","3",3,7,2,"2","","càc"],
  ["Abominant","Power sledgehammer","C","4",3,12,2,"D6+1","","càc"],
  ["Achilles Ridgerunners","Achilles missile launcher","T","3",4,9,2,"3","","36\""],
  ["Achilles Ridgerunners","Heavy mining laser","T","D3",4,12,3,"D6+1","blast","36\""],
  ["Achilles Ridgerunners","Heavy mortar","T","D6+3",4,6,0,"1","blast indirect","48\""],
  ["Achilles Ridgerunners","Twin heavy stubber","T","3",4,4,0,"1","twin rf:3","36\""],
  ["Achilles Ridgerunners","Armoured hull","C","3",4,5,0,"1","","càc"],
  ["Acolyte Hybrids with Autopistols","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Acolyte Hybrids with Autopistols","Cult claws and knife","C","3",3,4,1,"1","","càc"],
  ["Acolyte Hybrids with Autopistols","Heavy mining tool","C","2",3,5,2,"3","anti:4:veh","càc"],
  ["Acolyte Hybrids with Autopistols","Leader's Bio-weapons","C","5",3,5,2,"1","","càc"],
  ["Acolyte Hybrids with Hand Flamers","Demolition charge","T","D6",5,9,2,"2","assault blast hazardous oneshot","8\""],
  ["Acolyte Hybrids with Hand Flamers","Hand flamer","T","D6",0,3,0,"1","ignorescover pistol torrent","12\""],
  ["Acolyte Hybrids with Hand Flamers","Cult claws and knife","C","3",3,4,1,"1","","càc"],
  ["Acolyte Hybrids with Hand Flamers","Leader's bio-weapons","C","5",3,5,2,"1","","càc"],
  ["Acolyte Iconward","Autopistol","T","1",3,3,0,"1","pistol","12\""],
  ["Acolyte Iconward","Cult claws","C","4",3,4,1,"1","","càc"],
  ["Atalan Jackals","Atalan incinerator","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Atalan Jackals","Atalan small arms","T","2",4,4,0,"1","pistol","12\""],
  ["Atalan Jackals","Heavy stubber","T","3",4,4,0,"1","assault rf:3","36\""],
  ["Atalan Jackals","Mining laser","T","1",4,12,3,"D6+1","","24\""],
  ["Atalan Jackals","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Atalan Jackals","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Atalan Jackals","Atalan power weapon","C","2",4,4,2,"1","","càc"],
  ["Atalan Jackals","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Benefictus","➤ Psionic cascade - focused witchfire","T","2",3,12,3,"D6+1","hazardous ignorescover psychic","18\""],
  ["Benefictus","➤ Psionic cascade - witchfire","T","1",3,12,3,"D6+1","ignorescover psychic","18\""],
  ["Benefictus","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Biophagus","Autopistol","T","1",3,3,0,"1","pistol","12\""],
  ["Biophagus","Chemical vials","T","1",3,1,1,"2","anti:2:inf","6\""],
  ["Biophagus","Injector goad","C","1",3,2,0,"D3","anti:2:inf","càc"],
  ["Clamavus","Autopistol","T","1",3,3,0,"1","pistol","12\""],
  ["Clamavus","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Goliath Rockgrinder","Clearance incinerator","T","2D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Goliath Rockgrinder","Demolition charge cache","T","D6",5,9,2,"2","assault blast hazardous","8\""],
  ["Goliath Rockgrinder","Heavy mining laser","T","D3",4,12,3,"D6+1","blast","36\""],
  ["Goliath Rockgrinder","Heavy seismic cannon","T","4",4,8,2,"D3","rf:2","24\""],
  ["Goliath Rockgrinder","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Goliath Rockgrinder","Drilldozer blade","C","8",3,10,2,"2","","càc"],
  ["Goliath Truck","Demolition charge cache","T","D6",5,9,2,"2","assault blast hazardous","8\""],
  ["Goliath Truck","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Goliath Truck","Twin autocannon","T","2",4,9,1,"3","twin","48\""],
  ["Goliath Truck","Goliath wheels","C","3",4,6,0,"1","","càc"],
  ["Hybrid Metamorphs","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Hybrid Metamorphs","Hand flamer","T","D6",0,3,0,"1","ignorescover pistol torrent","12\""],
  ["Hybrid Metamorphs","Leader's Bio-weapons","C","5",3,5,1,"2","","càc"],
  ["Hybrid Metamorphs","➤ Metamorph mutations - strike","C","3",3,5,1,"2","","càc"],
  ["Hybrid Metamorphs","➤ Metamorph mutations - sweep","C","5",3,4,1,"1","","càc"],
  ["Jackal Alphus","Autopistol","T","1",3,3,0,"1","pistol","12\""],
  ["Jackal Alphus","Cult sniper rifle","T","1",3,5,2,"3","heavy precision","36\""],
  ["Jackal Alphus","Close combat weapon","C","3",3,3,0,"1","","càc"],
  ["Kelermorph","Liberator autostubs","T","6",2,6,2,"1","dev pistol","12\""],
  ["Kelermorph","Close combat weapon","C","3",3,3,0,"1","","càc"],
  ["Locus","Locus blades","C","5",2,5,2,"2","","càc"],
  ["Magus","Autopistol","T","1",3,3,0,"1","pistol","12\""],
  ["Magus","Force stave","C","3",3,5,1,"D3","psychic","càc"],
  ["Neophyte Hybrids","Anointed pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Neophyte Hybrids","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Neophyte Hybrids","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Neophyte Hybrids","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Neophyte Hybrids","Hybrid firearm","T","1",4,3,0,"1","rf:1","24\""],
  ["Neophyte Hybrids","Mining laser","T","1",5,10,3,"D6+1","heavy","24\""],
  ["Neophyte Hybrids","Seismic cannon","T","2",5,6,1,"D3","heavy rf:2","24\""],
  ["Neophyte Hybrids","Webber","T","D6",0,2,0,"1","dev torrent","12\""],
  ["Neophyte Hybrids","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Neophyte Hybrids","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Neophyte Hybrids","Chainsword","C","2",4,3,0,"1","","càc"],
  ["Neophyte Hybrids","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Neophyte Hybrids","Power weapon","C","1",4,4,2,"1","","càc"],
  ["Nexos","Autopistol","T","1",3,3,0,"1","pistol","12\""],
  ["Nexos","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Patriarch","Patriarch's claws","C","5",2,6,2,"2","dev twin","càc"],
  ["Primus","Scoped needle pistol","T","1",2,1,0,"D3","anti:2:inf ignorescover pistol","18\""],
  ["Primus","Cult bonesword","C","5",2,5,2,"1","","càc"],
  ["Primus","Toxin injector claw","C","2",2,2,0,"D3","anti:2:inf extra","càc"],
  ["Purestrain Genestealers","Cult claws and talons","C","4",2,4,2,"1","","càc"],
  ["Reductus Saboteur","Autopistol","T","1",3,3,0,"1","pistol","12\""],
  ["Reductus Saboteur","Demolition charges","T","D6",3,9,2,"2","assault blast oneshot","8\""],
  ["Reductus Saboteur","Remote explosives","T","D6+3",3,5,0,"1","blast indirect","24\""],
  ["Reductus Saboteur","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Sanctus","Cult sniper rifle","T","1",3,7,2,"3","anti:2 heavy precision","36\""],
  ["Sanctus","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Sanctus","Sanctus bio-dagger","C","6",2,3,2,"2","anti:3:inf precision","càc"],
  ["Tectonic Fragdrill","Fragdrill","C","6",6,12,2,"D6","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Aberrants","Infanterie"],
  ["Abominant","Personnage"],
  ["Achilles Ridgerunners","Véhicule"],
  ["Acolyte Hybrids with Autopistols","Battleline"],
  ["Acolyte Hybrids with Hand Flamers","Battleline"],
  ["Acolyte Iconward","Personnage"],
  ["Atalan Jackals","Monté"],
  ["Benefictus","Personnage"],
  ["Biophagus","Personnage"],
  ["Clamavus","Personnage"],
  ["Goliath Rockgrinder","Véhicule"],
  ["Goliath Truck","Véhicule"],
  ["Hybrid Metamorphs","Infanterie"],
  ["Jackal Alphus","Personnage"],
  ["Kelermorph","Personnage"],
  ["Locus","Personnage"],
  ["Magus","Personnage"],
  ["Neophyte Hybrids","Battleline"],
  ["Nexos","Personnage"],
  ["Patriarch","Personnage"],
  ["Primus","Personnage"],
  ["Purestrain Genestealers","Infanterie"],
  ["Reductus Saboteur","Personnage"],
  ["Sanctus","Personnage"],
  ["Tectonic Fragdrill","Fortification"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Abominant": [
  "Aberrants"
 ],
 "Acolyte Iconward": [
  "Acolyte Hybrids with Autopistols",
  "Acolyte Hybrids with Hand Flamers",
  "Hybrid Metamorphs",
  "Neophyte Hybrids"
 ],
 "Benefictus": [
  "Acolyte Hybrids with Autopistols",
  "Acolyte Hybrids with Hand Flamers",
  "Hybrid Metamorphs",
  "Neophyte Hybrids"
 ],
 "Jackal Alphus": [
  "Atalan Jackals"
 ],
 "Magus": [
  "Acolyte Hybrids with Autopistols",
  "Acolyte Hybrids with Hand Flamers",
  "Hybrid Metamorphs",
  "Neophyte Hybrids"
 ],
 "Patriarch": [
  "Purestrain Genestealers"
 ],
 "Primus": [
  "Acolyte Hybrids with Autopistols",
  "Acolyte Hybrids with Hand Flamers",
  "Hybrid Metamorphs",
  "Neophyte Hybrids"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Aberrants": [
  [
   "Feel No Pain 5+",
   "This unit has a 5+ Feel No Pain"
  ],
  [
   "Hulking Bodyguards",
   "While a CHARACTER is leading this unit, each time an attack targets this unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of this unit, subtract 1 from the Wound roll."
  ],
  [
   "Cult Ambush",
   "If your Army Faction is GENESTEALER CULTS, you start the battle with a number of Resurgence points, depending on the battle size, as shown below.\n\n- Incursion: 6 Resurgence points\n- Strike Force: 10 Resurgence points\n- Onslaught: 14 Resurgence points\n\nEach time a unit from your army is destroyed, if every model (excluding\nCHARACTER models) in that unit has this ability you can spend the relevant number of Resurgence points shown below based on that unit's Starting Strength (not including attached CHARACTER models).\n\n---Aberrants---\n5 models = 4 Resurgence Points\n10 models = 8 Resurgence Points\n\n---Acolyte Hybrids with Autopistols, Acolyte Hybrids with Hand Flamers, Hybrid Metamorphs---\n5 models = 2 Resurgence Points\n10 models = 4 Resurgence Points\n\n---Atalan Jackals---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\n---Neophyte Hybrids---\n10 models = 3 Resurgence Points\n20 models = 6 Resurgence Points\n\n---Purestrain Genestealers---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\nIf you do:\n- Add a new unit to your army identical to your destroyed unit (excluding CHARACTER models), in Cult Ambush, at its Starting Strength, with all of its wounds remaining and any [ONE SHOT] weapons those models are equipped with considered as not having been shot.\n- Place one Cult Ambush marker (see below) anywhere on the battlefield that is more than 8\" horizontally away from all enemy units (if this is not possible, no marker is placed).\n\nUNITS IN CULT AMBUSH\nCult Ambush is a type of Strategic Reserves. Units in Cult Ambush cannot be targeted with the Rapid Ingress Stratagem, but can be set up on the battlefield using a Cult Ambush marker as described below, or by following the rules for Strategic Reserves in a subsequent turn. Units in Cult Ambush are not automically destroyed at the end of the third battle round.\n\nCULT AMBUSH MARKERS\nUse a circular 32mm diameter marker for Cult Ambush markers. If an enemy model (excluding AIRCRAFT) ends any kind of move within 8\" of a Cult Ambush marker you placed, that Cult Ambush marker is removed from the battlefield. At the end of your opponent’s next Movement phase, for each of your Cult Ambush markers still on the battlefield, you can select one unit from your army that is in Cult Ambush to make an ingress move. For that ingress move, set that unit up with at least one model in that unit in base contact with that Cult Ambush marker and all other models placed wholly within 3\" of that Cult Ambush marker (that Cult Ambush marker is then removed from the battlefield). Units in Cult Ambush can make an ingress move in the first battle round using this rule."
  ]
 ],
 "Abominant": [
  [
   "Feel No Pain 5+",
   "This model has a 5+ Feel No Pain"
  ],
  [
   "The Chosen One",
   "While this model is leading a unit, each time a model in that unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 4+ do not remove the destroyed model from play, it can fight after the attacking model's unit has finished making it's attacks and is then removed from play."
  ],
  [
   "Regenerating Gene-mass",
   "The first time this model is destroyed, roll one D6 at the end of the phase. On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with its full wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- ABERRANTS"
  ]
 ],
 "Achilles Ridgerunners": [
  [
   "Crossfire",
   "in your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly Genestealer Cults unit makes an attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per turn."
  ],
  [
   "Flare Launcher",
   "The bearer’s unit has the SMOKE keyword and you can target it with the Smokescreen Stratagem for 0CP."
  ],
  [
   "Spotter",
   "The bearer’s ranged weapons have a Ballistic Skill characteristic of 3+."
  ],
  [
   "Survey Augur",
   "Each time the bearer’s unit has shot, select one enemy unit that was hit by one or more attacks made by the bearer this phase. Until the end of the phase, each time a friendly GENESTEALER CULTS model makes an attack against that unit, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Acolyte Hybrids with Hand Flamers": [
  [
   "Industrialised Destruction",
   "Each time a model in this unit makes an attack, re-roll a Wound Roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the wound roll."
  ],
  [
   "Cult Icon",
   "In your Command phase, you can return up to D3 destroyed models to the bearer’s unit. If the bearer’s unit is within range of an objective marker you control, you can return up to 3 destroyed models to that unit instead. This ability cannot be used to return destroyed CHARACTER models in Attached units and any [ONE SHOT] weapons equipped with by returned models that were shot before they were destroyed are still considered to have been shot."
  ],
  [
   "Cult Ambush",
   "If your Army Faction is GENESTEALER CULTS, you start the battle with a number of Resurgence points, depending on the battle size, as shown below.\n\n- Incursion: 6 Resurgence points\n- Strike Force: 10 Resurgence points\n- Onslaught: 14 Resurgence points\n\nEach time a unit from your army is destroyed, if every model (excluding\nCHARACTER models) in that unit has this ability you can spend the relevant number of Resurgence points shown below based on that unit's Starting Strength (not including attached CHARACTER models).\n\n---Aberrants---\n5 models = 4 Resurgence Points\n10 models = 8 Resurgence Points\n\n---Acolyte Hybrids with Autopistols, Acolyte Hybrids with Hand Flamers, Hybrid Metamorphs---\n5 models = 2 Resurgence Points\n10 models = 4 Resurgence Points\n\n---Atalan Jackals---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\n---Neophyte Hybrids---\n10 models = 3 Resurgence Points\n20 models = 6 Resurgence Points\n\n---Purestrain Genestealers---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\nIf you do:\n- Add a new unit to your army identical to your destroyed unit (excluding CHARACTER models), in Cult Ambush, at its Starting Strength, with all of its wounds remaining and any [ONE SHOT] weapons those models are equipped with considered as not having been shot.\n- Place one Cult Ambush marker (see below) anywhere on the battlefield that is more than 8\" horizontally away from all enemy units (if this is not possible, no marker is placed).\n\nUNITS IN CULT AMBUSH\nCult Ambush is a type of Strategic Reserves. Units in Cult Ambush cannot be targeted with the Rapid Ingress Stratagem, but can be set up on the battlefield using a Cult Ambush marker as described below, or by following the rules for Strategic Reserves in a subsequent turn. Units in Cult Ambush are not automically destroyed at the end of the third battle round.\n\nCULT AMBUSH MARKERS\nUse a circular 32mm diameter marker for Cult Ambush markers. If an enemy model (excluding AIRCRAFT) ends any kind of move within 8\" of a Cult Ambush marker you placed, that Cult Ambush marker is removed from the battlefield. At the end of your opponent’s next Movement phase, for each of your Cult Ambush markers still on the battlefield, you can select one unit from your army that is in Cult Ambush to make an ingress move. For that ingress move, set that unit up with at least one model in that unit in base contact with that Cult Ambush marker and all other models placed wholly within 3\" of that Cult Ambush marker (that Cult Ambush marker is then removed from the battlefield). Units in Cult Ambush can make an ingress move in the first battle round using this rule."
  ]
 ],
 "Acolyte Iconward": [
  [
   "Nexus of Devotion",
   "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability. If that unit has the HYBRID METAMORPHS keyword, models in that unit have the Feel No Pain 4+ ability instead."
  ],
  [
   "Summon the Cult",
   "Once per battle, when you have to remove a Cult Ambush marker because your opponent has moved too close to it, if one or more models from your army with this ability are on the battlefield, you can use this ability. If you do, instead of removing that marker, you can place it anywhere on the battlefield that is within 12\" of a model from your army with this ability and more than 8\" horizontally away from all enemy units (if this is not possible, this ability is not considered to have been used and that marker is removed as normal)."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Acolyte Hybrids\n- Hybrid Metamorphs\n- Neophyte Hybrids"
  ]
 ],
 "Atalan Jackals": [
  [
   "Outrider Gangs",
   "Each time you use the Cult Ambush ability to set this unit back up on the battlefield, in addition to the normal rules, all of its models must be set up wholly within 9\" of a battlefield edge and at least one of its models must be touching one of your Cult Ambush markers (that marker is then removed from the battlefield). If this cannot be done, this unit cannot be set back up."
  ],
  [
   "Demolition Run",
   "Once per battle round, in your Movement phase, when this unit ends a Normal, Advance, or Fall Back move, you can select one enemy unit within 6\" of and visible to this unit and roll one D6 for each ATALAN JACKALS model in this unit: for each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds.)"
  ],
  [
   "Cult Ambush",
   "If your Army Faction is GENESTEALER CULTS, you start the battle with a number of Resurgence points, depending on the battle size, as shown below.\n\n- Incursion: 6 Resurgence points\n- Strike Force: 10 Resurgence points\n- Onslaught: 14 Resurgence points\n\nEach time a unit from your army is destroyed, if every model (excluding\nCHARACTER models) in that unit has this ability you can spend the relevant number of Resurgence points shown below based on that unit's Starting Strength (not including attached CHARACTER models).\n\n---Aberrants---\n5 models = 4 Resurgence Points\n10 models = 8 Resurgence Points\n\n---Acolyte Hybrids with Autopistols, Acolyte Hybrids with Hand Flamers, Hybrid Metamorphs---\n5 models = 2 Resurgence Points\n10 models = 4 Resurgence Points\n\n---Atalan Jackals---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\n---Neophyte Hybrids---\n10 models = 3 Resurgence Points\n20 models = 6 Resurgence Points\n\n---Purestrain Genestealers---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\nIf you do:\n- Add a new unit to your army identical to your destroyed unit (excluding CHARACTER models), in Cult Ambush, at its Starting Strength, with all of its wounds remaining and any [ONE SHOT] weapons those models are equipped with considered as not having been shot.\n- Place one Cult Ambush marker (see below) anywhere on the battlefield that is more than 8\" horizontally away from all enemy units (if this is not possible, no marker is placed).\n\nUNITS IN CULT AMBUSH\nCult Ambush is a type of Strategic Reserves. Units in Cult Ambush cannot be targeted with the Rapid Ingress Stratagem, but can be set up on the battlefield using a Cult Ambush marker as described below, or by following the rules for Strategic Reserves in a subsequent turn. Units in Cult Ambush are not automically destroyed at the end of the third battle round.\n\nCULT AMBUSH MARKERS\nUse a circular 32mm diameter marker for Cult Ambush markers. If an enemy model (excluding AIRCRAFT) ends any kind of move within 8\" of a Cult Ambush marker you placed, that Cult Ambush marker is removed from the battlefield. At the end of your opponent’s next Movement phase, for each of your Cult Ambush markers still on the battlefield, you can select one unit from your army that is in Cult Ambush to make an ingress move. For that ingress move, set that unit up with at least one model in that unit in base contact with that Cult Ambush marker and all other models placed wholly within 3\" of that Cult Ambush marker (that Cult Ambush marker is then removed from the battlefield). Units in Cult Ambush can make an ingress move in the first battle round using this rule."
  ]
 ],
 "Biophagus": [
  [
   "Twisted Science",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Biological Warfare",
   "Once per battle, when this model’s unit is selected to fight, this model can use this ability. If it does, until the end of the phase, improve the Attacks and Damage characteristics of its injector goad by 3."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- ABERRANTS\n\n- ACOLYTE HYBRIDS WITH AUTOPISTOLS\n- ACOLYTE HYBRIDS WITH HANDFLAMERS\n- HYBRID METAMORPHS\n- NEOPHYTE HYBRIDS\n\nYou can attach this model to an ACOLYTE HYBRIDS or NEOPHYTE HYBRID unit, even if a PRIMUS, MAGUS, or ACOLYTE ICONWARD model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths."
  ],
  [
   "Alchemicus Familiar",
   "Once per battle, when the bearer’s unit is selected to fight, the bearer can use its alchemicus familiar. If it does, until the end of the phase, each time a model in the bearer's unit makes an attack that targets an INFANTRY unit, add 1 to the Wound roll"
  ]
 ],
 "Clamavus": [
  [
   "Voice of New Truths",
   "In your Command phase, one model from your army with this ability can use it, if it does, select one enemy unit with 18\" of it, that enemy unit must take a Battle-shock test."
  ],
  [
   "Scrambler Array",
   "Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" of this model."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- ACOLYTE HYBRIDS\n- HYBRID METAMORPHS\n- NEOPHYTE HYBRIDS\nYou can attach this model to an ACOLYTE HYBRIDS or NEOPHYTE HYBRID unit, even if a PRIMUS, MAGUS, or ACOLYTE ICONWARD model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths."
  ]
 ],
 "Goliath Rockgrinder": [
  [
   "Grinding Line-breaker",
   "Each time an enemy unit (excluding MONSTER and VEHICLES) that is within Engagement Range of this model Falls Back, all models in that enemy unit must take a Desperate Escape test. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those tests."
  ],
  [
   "Damaged: 1-3 Wounds Remaining",
   "While this model has 1-3 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Goliath Truck": [
  [
   "Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this TRANSPORT this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ]
 ],
 "Hybrid Metamorphs": [
  [
   "Brood Surge",
   "In your opponent’s Shooting phase, when an enemy unit has shot, if a model in this unit was destroyed as a result of those attacks, this unit can make a surge move of up to D6\"."
  ],
  [
   "Cult Icon",
   "In your Command phase, you can return up to D3 destroyed models to the bearer’s unit. If the bearer’s unit is within range of an objective marker you control, you can return up to 3 destroyed models to that unit instead. This ability cannot be used to return destroyed CHARACTER models in Attached units and any [ONE SHOT] weapons equipped with by returned models that were shot before they were destroyed are still considered to have been shot."
  ],
  [
   "Cult Ambush",
   "If your Army Faction is GENESTEALER CULTS, you start the battle with a number of Resurgence points, depending on the battle size, as shown below.\n\n- Incursion: 6 Resurgence points\n- Strike Force: 10 Resurgence points\n- Onslaught: 14 Resurgence points\n\nEach time a unit from your army is destroyed, if every model (excluding\nCHARACTER models) in that unit has this ability you can spend the relevant number of Resurgence points shown below based on that unit's Starting Strength (not including attached CHARACTER models).\n\n---Aberrants---\n5 models = 4 Resurgence Points\n10 models = 8 Resurgence Points\n\n---Acolyte Hybrids with Autopistols, Acolyte Hybrids with Hand Flamers, Hybrid Metamorphs---\n5 models = 2 Resurgence Points\n10 models = 4 Resurgence Points\n\n---Atalan Jackals---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\n---Neophyte Hybrids---\n10 models = 3 Resurgence Points\n20 models = 6 Resurgence Points\n\n---Purestrain Genestealers---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\nIf you do:\n- Add a new unit to your army identical to your destroyed unit (excluding CHARACTER models), in Cult Ambush, at its Starting Strength, with all of its wounds remaining and any [ONE SHOT] weapons those models are equipped with considered as not having been shot.\n- Place one Cult Ambush marker (see below) anywhere on the battlefield that is more than 8\" horizontally away from all enemy units (if this is not possible, no marker is placed).\n\nUNITS IN CULT AMBUSH\nCult Ambush is a type of Strategic Reserves. Units in Cult Ambush cannot be targeted with the Rapid Ingress Stratagem, but can be set up on the battlefield using a Cult Ambush marker as described below, or by following the rules for Strategic Reserves in a subsequent turn. Units in Cult Ambush are not automically destroyed at the end of the third battle round.\n\nCULT AMBUSH MARKERS\nUse a circular 32mm diameter marker for Cult Ambush markers. If an enemy model (excluding AIRCRAFT) ends any kind of move within 8\" of a Cult Ambush marker you placed, that Cult Ambush marker is removed from the battlefield. At the end of your opponent’s next Movement phase, for each of your Cult Ambush markers still on the battlefield, you can select one unit from your army that is in Cult Ambush to make an ingress move. For that ingress move, set that unit up with at least one model in that unit in base contact with that Cult Ambush marker and all other models placed wholly within 3\" of that Cult Ambush marker (that Cult Ambush marker is then removed from the battlefield). Units in Cult Ambush can make an ingress move in the first battle round using this rule."
  ]
 ],
 "Jackal Alphus": [
  [
   "Leader",
   "This model can be attached to the following units:\n- ATALAN JACKALS"
  ],
  [
   "Priority Target",
   "In your Shooting phase, after this model's unit has shot, select one enemy unit hit by one or more of those attacks made with a cult sniper rifle. Until the end of the phase, each time a friendly Genestealer Cults model makes an attack that targets that enemy unit, re-roll a Hit roll of 1."
  ],
  [
   "Master Outrider",
   "In your Shooting phase, after this model’s unit has shot, if it is not within Engagement Range of any enemy units, that unit can make a Normal move of up to 6\" as if it were your Movement phase. If it does, until the end of the turn, that unit is not eligible to declare a charge."
  ]
 ],
 "Kelermorph": [
  [
   "Hypersensory Abilities",
   "Once per turn, in your opponent’s Movement phase, when an enemy unit ends a Normal, Advance or Fall Back move within 8\" of this model, if this model is not within Engagement Range of one or more enemy units, it can shoot at that unit as if it were your Shooting phase and then make a Normal move of up to D6\" (it cannot embark within a Transport as part of this move)."
  ],
  [
   "Heroic Fusillade",
   "Once per turn, after one model from your army with this ability has shot, you can select one INFANTRY unit hit by one or more of those attacks. That unit must take a Battle-shock test."
  ]
 ],
 "Locus": [
  [
   "Sudden Assault",
   "While this model is leading a unit, models in that unit have the Fights First ability."
  ],
  [
   "Bodyguard",
   "While this model is leading a unit, other Character models attached to that unit have the Feel No Pain 4+ ability"
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Acolyte Hybrids\n- Hybrid Metamorphs\n- Neophyte Hybrids\nYou can attach this model to an Acolyte Hybrids or Neophyte Hybrids unit, even if a Primus, Magus, or Acolyte Iconward model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths."
  ]
 ],
 "Magus": [
  [
   "Psychic Familiar",
   "Once per battle, at the start of any of your opponent’s Shooting phases, this model can use its psychic familiar. If it does, until the end of the phase, add 6\" to the range of its Mind Control ability."
  ],
  [
   "Mind Control (Psychic)",
   "At the start of your opponent’s Shooting phase, one PSYKER model from your army with this ability can use it. If used, select one enemy unit within 18\" of and visible to that PSYKER model and roll one D6: on a 1, that PSYKER model suffers D3 mortal wounds; on a 2-5, until the end of the phase, each time a model in that enemy unit makes an attack, subtract 1 from the Hit roll; on a 6, each time a model in that enemy unit makes an attack, subtract 1 from the Hit roll and subtract 1 from the Wound Roll."
  ],
  [
   "Spiritual Leader",
   "Once per battle, at the start of any phase, you can select one friendly GENESTELERS CULTS unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Acolyte Hybrids\n- Hybrid Metamorphs\n- Neophyte Hybrids"
  ]
 ],
 "Neophyte Hybrids": [
  [
   "A Plan Generations in the Making",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn."
  ],
  [
   "Cult Icon",
   "In your Command phase, you can return up to 3 destroyed models to the bearer’s unit. If the bearer’s unit is within range of an objective marker you control, you can return up to D3+3 destroyed models to that unit instead. This ability cannot be used to return destroyed CHARACTER models in Attached units and any [ONE SHOT] weapons equipped with by returned models that were shot before they were destroyed are still considered to have been shot."
  ],
  [
   "Cult Ambush",
   "If your Army Faction is GENESTEALER CULTS, you start the battle with a number of Resurgence points, depending on the battle size, as shown below.\n\n- Incursion: 6 Resurgence points\n- Strike Force: 10 Resurgence points\n- Onslaught: 14 Resurgence points\n\nEach time a unit from your army is destroyed, if every model (excluding\nCHARACTER models) in that unit has this ability you can spend the relevant number of Resurgence points shown below based on that unit's Starting Strength (not including attached CHARACTER models).\n\n---Aberrants---\n5 models = 4 Resurgence Points\n10 models = 8 Resurgence Points\n\n---Acolyte Hybrids with Autopistols, Acolyte Hybrids with Hand Flamers, Hybrid Metamorphs---\n5 models = 2 Resurgence Points\n10 models = 4 Resurgence Points\n\n---Atalan Jackals---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\n---Neophyte Hybrids---\n10 models = 3 Resurgence Points\n20 models = 6 Resurgence Points\n\n---Purestrain Genestealers---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\nIf you do:\n- Add a new unit to your army identical to your destroyed unit (excluding CHARACTER models), in Cult Ambush, at its Starting Strength, with all of its wounds remaining and any [ONE SHOT] weapons those models are equipped with considered as not having been shot.\n- Place one Cult Ambush marker (see below) anywhere on the battlefield that is more than 8\" horizontally away from all enemy units (if this is not possible, no marker is placed).\n\nUNITS IN CULT AMBUSH\nCult Ambush is a type of Strategic Reserves. Units in Cult Ambush cannot be targeted with the Rapid Ingress Stratagem, but can be set up on the battlefield using a Cult Ambush marker as described below, or by following the rules for Strategic Reserves in a subsequent turn. Units in Cult Ambush are not automically destroyed at the end of the third battle round.\n\nCULT AMBUSH MARKERS\nUse a circular 32mm diameter marker for Cult Ambush markers. If an enemy model (excluding AIRCRAFT) ends any kind of move within 8\" of a Cult Ambush marker you placed, that Cult Ambush marker is removed from the battlefield. At the end of your opponent’s next Movement phase, for each of your Cult Ambush markers still on the battlefield, you can select one unit from your army that is in Cult Ambush to make an ingress move. For that ingress move, set that unit up with at least one model in that unit in base contact with that Cult Ambush marker and all other models placed wholly within 3\" of that Cult Ambush marker (that Cult Ambush marker is then removed from the battlefield). Units in Cult Ambush can make an ingress move in the first battle round using this rule."
  ]
 ],
 "Nexos": [
  [
   "Battlefield Analysis",
   "Once per battle round, one model from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Cult Infiltration",
   "At the start of each player’s Command phase, if this model is on the battlefield, you can select one of your Cult Ambush markers that is on the battlefield and has not been moved this turn and move it up to 6\"."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- ACOLYTE HYBRIDS\n- HYBRID METAMORPHS\n- NEOPHYTE HYBRIDS\nYou can attach this model to an ACOLYTE HYBRIDS or NEOPHYTE HYBRID unit, even if a PRIMUS, MAGUS, or ACOLYTE ICONWARD model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths."
  ]
 ],
 "Patriarch": [
  [
   "Might From Beyond",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Cosmic Horror (Psychic)",
   "At the start of the Fight phase, each enemy unit within 6\" of this model must take a Battle-shock test."
  ],
  [
   "Psychic Familiar",
   "Once per battle, at the start of the Fight phase, this model can use its psychic familiar. If it does, until the end of the phase, add 6\" to the range of its Cosmic Horror ability."
  ],
  [
   "Supreme Commander",
   "- You cannot include more than one Patriarch model in your army.\n- If this model is in your army, it must be your Warlord."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- PURESTRAIN GENESTEALERS"
  ]
 ],
 "Primus": [
  [
   "Cult Demagogue",
   "While this model is leading a unit, each time a model in that unit makes an attack, you can add 1 to the Hit roll."
  ],
  [
   "Decoys and Misdirection",
   "If your army includes one or more models with this ability, after both players have deployed their armies, select up to three GENESTEALER CULTS units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Acolyte Hybrids\n- Hybrid Metamorphs\n- Neophyte Hybrids"
  ]
 ],
 "Purestrain Genestealers": [
  [
   "Swift and Deadly",
   "This unit is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Cult Ambush",
   "If your Army Faction is GENESTEALER CULTS, you start the battle with a number of Resurgence points, depending on the battle size, as shown below.\n\n- Incursion: 6 Resurgence points\n- Strike Force: 10 Resurgence points\n- Onslaught: 14 Resurgence points\n\nEach time a unit from your army is destroyed, if every model (excluding\nCHARACTER models) in that unit has this ability you can spend the relevant number of Resurgence points shown below based on that unit's Starting Strength (not including attached CHARACTER models).\n\n---Aberrants---\n5 models = 4 Resurgence Points\n10 models = 8 Resurgence Points\n\n---Acolyte Hybrids with Autopistols, Acolyte Hybrids with Hand Flamers, Hybrid Metamorphs---\n5 models = 2 Resurgence Points\n10 models = 4 Resurgence Points\n\n---Atalan Jackals---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\n---Neophyte Hybrids---\n10 models = 3 Resurgence Points\n20 models = 6 Resurgence Points\n\n---Purestrain Genestealers---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\nIf you do:\n- Add a new unit to your army identical to your destroyed unit (excluding CHARACTER models), in Cult Ambush, at its Starting Strength, with all of its wounds remaining and any [ONE SHOT] weapons those models are equipped with considered as not having been shot.\n- Place one Cult Ambush marker (see below) anywhere on the battlefield that is more than 8\" horizontally away from all enemy units (if this is not possible, no marker is placed).\n\nUNITS IN CULT AMBUSH\nCult Ambush is a type of Strategic Reserves. Units in Cult Ambush cannot be targeted with the Rapid Ingress Stratagem, but can be set up on the battlefield using a Cult Ambush marker as described below, or by following the rules for Strategic Reserves in a subsequent turn. Units in Cult Ambush are not automically destroyed at the end of the third battle round.\n\nCULT AMBUSH MARKERS\nUse a circular 32mm diameter marker for Cult Ambush markers. If an enemy model (excluding AIRCRAFT) ends any kind of move within 8\" of a Cult Ambush marker you placed, that Cult Ambush marker is removed from the battlefield. At the end of your opponent’s next Movement phase, for each of your Cult Ambush markers still on the battlefield, you can select one unit from your army that is in Cult Ambush to make an ingress move. For that ingress move, set that unit up with at least one model in that unit in base contact with that Cult Ambush marker and all other models placed wholly within 3\" of that Cult Ambush marker (that Cult Ambush marker is then removed from the battlefield). Units in Cult Ambush can make an ingress move in the first battle round using this rule."
  ]
 ],
 "Reductus Saboteur": [
  [
   "Primed and Ready",
   "In your Shooting phase, you can select one model from your army with this ability as the target of the Grenade Stratagem for 0CP, provided that model has not already been the target of that Stratagem this phase."
  ],
  [
   "Planted Explosives",
   "Once per battle, when an enemy unit ends a Normal, Advance or Fall Back move within 8\" of this model, this model can use its Reductus mine. If it does, roll one D6: on a 2+, that enemy unit suffers D3+3 mortal wounds. Only one model from your army with this ability can use it in the same battle round."
  ]
 ],
 "Sanctus": [
  [
   "Creeping Shadow",
   "If this model is equipped with a Cult Sniper Rifle, In your opponent's Movement phase, if an enemy unit ends a move within 8” of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to 6”."
  ],
  [
   "Psychic Spoor",
   "At the start of the first battle round, select one enemy unit to be this model’s prey. Each time this model makes an attack that targets its prey, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Cloaked Assassin",
   "If this model is equipped with a Sanctus Bio-dagger, enemy units cannot use the Fire Overwatch Stratagem to shoot at this model. Enemy units cannot target this unit with snap shooting attacks."
  ]
 ],
 "Tectonic Fragdrill": [
  [
   "Tectonic Fragdrill",
   "Friendly Genestealer Cult Infantry models can be set up or end any type of move on top of the floor sections of this Fortification."
  ],
  [
   "Underground Egress",
   "Each time one of your Cult Ambush markers is removed as the result of an enemy unit ending any kind of move within 8\" of it, you can instead move that marker so that it is wholly within 8\" of this Fortification and more than 8\" horizontally away from all enemy units (if this is not possible, that marker is removed as normal)."
  ],
  [
   "Manufactorum Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."
  ],
  [
   "Fortification",
   "While an enemy unit is only within Engagement Range of one or more FORTIFICATION from your army:\n■ That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n■ Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so."
  ]
 ],
 "Benefictus": [
  [
   "Bio-horror Disruption (Psychic)",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Psionic Shield (Psychic)",
   "Once per battle, at the start of any phase, this model can use this ability. If it does, until the end of the phase, this model has a 4+ invulnerable save."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Acolyte Hybrids\n- Hybrid Metamorphs\n- Neophyte Hybrids"
  ]
 ],
 "Acolyte Hybrids with Autopistols": [
  [
   "Claimed for the Cult",
   "At the start of your Command phase, roll one D6 for each objective marker that you control that has one or more units from your army with this ability within range of it. If one or more of the results is a 4+, you gain 1CP."
  ],
  [
   "Cult Icon",
   "In your Command phase, you can return up to D3 destroyed models to the bearer’s unit. If the bearer’s unit is within range of an objective marker you control, you can return up to 3 destroyed models to that unit instead. This ability cannot be used to return destroyed CHARACTER models in Attached units and any [ONE SHOT] weapons equipped with by returned models that were shot before they were destroyed are still considered to have been shot."
  ],
  [
   "Cult Ambush",
   "If your Army Faction is GENESTEALER CULTS, you start the battle with a number of Resurgence points, depending on the battle size, as shown below.\n\n- Incursion: 6 Resurgence points\n- Strike Force: 10 Resurgence points\n- Onslaught: 14 Resurgence points\n\nEach time a unit from your army is destroyed, if every model (excluding\nCHARACTER models) in that unit has this ability you can spend the relevant number of Resurgence points shown below based on that unit's Starting Strength (not including attached CHARACTER models).\n\n---Aberrants---\n5 models = 4 Resurgence Points\n10 models = 8 Resurgence Points\n\n---Acolyte Hybrids with Autopistols, Acolyte Hybrids with Hand Flamers, Hybrid Metamorphs---\n5 models = 2 Resurgence Points\n10 models = 4 Resurgence Points\n\n---Atalan Jackals---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\n---Neophyte Hybrids---\n10 models = 3 Resurgence Points\n20 models = 6 Resurgence Points\n\n---Purestrain Genestealers---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\nIf you do:\n- Add a new unit to your army identical to your destroyed unit (excluding CHARACTER models), in Cult Ambush, at its Starting Strength, with all of its wounds remaining and any [ONE SHOT] weapons those models are equipped with considered as not having been shot.\n- Place one Cult Ambush marker (see below) anywhere on the battlefield that is more than 8\" horizontally away from all enemy units (if this is not possible, no marker is placed).\n\nUNITS IN CULT AMBUSH\nCult Ambush is a type of Strategic Reserves. Units in Cult Ambush cannot be targeted with the Rapid Ingress Stratagem, but can be set up on the battlefield using a Cult Ambush marker as described below, or by following the rules for Strategic Reserves in a subsequent turn. Units in Cult Ambush are not automically destroyed at the end of the third battle round.\n\nCULT AMBUSH MARKERS\nUse a circular 32mm diameter marker for Cult Ambush markers. If an enemy model (excluding AIRCRAFT) ends any kind of move within 8\" of a Cult Ambush marker you placed, that Cult Ambush marker is removed from the battlefield. At the end of your opponent’s next Movement phase, for each of your Cult Ambush markers still on the battlefield, you can select one unit from your army that is in Cult Ambush to make an ingress move. For that ingress move, set that unit up with at least one model in that unit in base contact with that Cult Ambush marker and all other models placed wholly within 3\" of that Cult Ambush marker (that Cult Ambush marker is then removed from the battlefield). Units in Cult Ambush can make an ingress move in the first battle round using this rule."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Biosanctic Broodsurge",2,"","Hypermorphic Fury","Add 1 to Charge rolls made for AbERRANTS, BIOPHAgUS and PURESTRAIN GENESTEALERS units from your army. In addition, each time such a unit is selected to fight, if it made a Charge move this turn, until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit.","",0,"","Take and Hold"],
  ["Brood Brothers Auxilia",2,"","","","",0,"","Take and Hold"],
  ["Final Day",2,"","Psionic Parasitism","At the end of your Movement phase, for each Tyranids Synapse unit from your army, you can select one friendly Genestealer Cults unit (excluding Purestrain Genestealer and Patriarch units) and one friendly Tyranids unit each within 9\" of and visible to that SYNAPSE unit. If you do, that GENESTEALER CULTS unit from your army suffers D3+1 mortal wounds and one model in the selected TYRANIDS unit regains up to that many lost wounds and until the start of your next Movement phase, each time a model in the selected TYRANIDS unit makes an attack, add 1 to the Hit roll. TYRANIDS units from your army have the following ability: Catalyst (Aura): While an enemy unit is within 6\" of this unit, each time a friendly GENESTEALER CULTS unit makes an attack that targets that enemy unit, add 1 to the Hit roll. The Star Children’s Blessings You can include Tyranids Vanguard Invader units (excluding AIRCRAFT, BROODLORD and GENESTEALERS units) in your army. The combined points cost of such units depends on your battle size: ▪ Incursion: Up to 500 pts ▪ Strike Force: Up to 1000 pts ▪ Onslaught: Up to 1500 pts No TYRANIDS models from your army can be your WARLORD.","",0,"","Purge the Foe"],
  ["Heroes of the Uprising",1,"","Killer Reputation","Friendly KELERMORPH/LOCUS/REDUCTUS SABOTEUR/SANCTUS models have KILLER. Friendly KILLER models’ attacks can: ▪ Re-roll hit rolls of 1. ▪ Re-roll wound rolls of 1","",0,"","Disruption"],
  ["Host of Ascension",3,"Hosts","A Perfect Ambush","Each time a GENESTEALER CULTS unit from your army is set up on the battlefield as Reinforcements, until the end of your next Fight phase, weapons equipped by models in that unit have the [SUSTAINED HITS 1] and [IGNORES COVER] abilities.","",0,"","Take and Hold"],
  ["Outlander Claw",2,"","Rapid Takeover","While a GENESTEALER CULTS MOUNTED/VEHICLE model from your army is not Battle-shocked, add 1 to its Objective Control characteristic. In addition, at the end of your Command phase, if one or more ATALAN JACKALS units from your army are within range of an objective you control, that objective remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.","",0,"","Reconnaissance"],
  ["Purestrain Broodswarm",1,"","Enemy Within","At the end of your opponent’s Fight phase, friendly unengaged PURESTRAIN GENESTEALER units can be placed in strategic reserves. This detachment has the PURESTRAIN tag and cannot be taken with another PURESTRAIN detachment.","",0,"","Priority Assets"],
  ["Xenocreed Congregation",2,"","Unquestioning Fanaticism","For each ACOLyTE HybRIDS, HybRID METAmORPHS and NEOPHyTE HybRIDS unit from your army, while one or more CHARACTER models are leading that unit, you can re-roll Advance and Charge rolls made for it. If that CHARACTER model is a MAgUS, PRImUS or ACOLyTE ICONwARD, that model has the Feel No Pain 3+ ability while leading that unit.","",0,"","Priority Assets"],
  ["Xenocult Masses",1,"Hosts","Hordes of the Faithful","In your Command phase, if a friendly NEOPHYTE HYBRIDS unit is within a terrain area, that unit heals 3 wounds. This detachment has the HOSTS tag and cannot be taken with another HOSTS detachment.","",0,"","Reconnaissance"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Alien Majesty",15,"Biosanctic Broodsurge","AbOmINANT, BIOPHAgUS or PATRIARCH model only. While an enemy unit is within Engagement Range of the bearer’s unit, subtract 1 from the Objective Control characteristic of models in that enemy unit (to a minimum of 1).",null],
  ["Biomorph Adaptation",25,"Biosanctic Broodsurge","AbOmINANT or PATRIARCH model only. Improve the Armour Penetration and Damage characteristics of melee weapons equipped by the bearer by 1.",null],
  ["Mutagenic Regeneration",10,"Biosanctic Broodsurge","AbOmINANT, BIOPHAgUS or PATRIARCH model only. In each Command phase, one model in the bearer’s unit regains 1 lost wound.",null],
  ["Predatory Instincts",20,"Biosanctic Broodsurge","ABOMINANT, BIOPHAGUS or PATRIARCH model only. ▪ Models in the bearer’s unit have the Infiltrators ability. ▪ You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: ▪ That use is -1 CP. ▪ That use does not prevent any uses of that stratagem on other units this phase.",null],
  ["Adaptive Reprisal",15,"Brood Brothers Auxilia","GENESTEALER CULTS INFANTRY model only. When you target this unit with the Heroic Intervention stratagem, that use is -1 CP.",null],
  ["Fire-point Commander",10,"Brood Brothers Auxilia","",null],
  ["Martial Espionage",25,"Brood Brothers Auxilia","GENESTEALER CULTS INFANTRy model only. Once per turn, when a friendly ASTRA MILITARUm INFANTRy or ASTRA MILITARUm MOUNTED unit within 9\" of the bearer is selected to shoot, the bearer can use this Enhancement. If it does, until the end of the phase, improve the Armour Penetration characteristic of ranged weapons equipped by models in that unit by 1.",null],
  ["The Hero Returned",20,"Brood Brothers Auxilia","GENESTEALER CULTS INFANTRY model only. Improve the Leadership and Objective Control characteristics of models in the bearer’s unit by 1.",null],
  ["Enraptured Damnation",10,"Final Day","Genestealer Cults model only. Enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer’s unit.",null],
  ["Inhuman Integration",20,"Final Day","Genestealer Cults model only. Weapons equipped by models in the bearer’s unit have the [SUSTAINED HITS 1] ability while targeting an enemy unit within 6\" of one or more friendly Tyranids units.",null],
  ["Synaptic Auger",15,"Final Day","Tyranids model only. Each time the bearer would regain one or more lost wounds from the Psionic Parasitism Detachment rule, it regains up to twice that number of lost wounds instead.",null],
  ["Vanguard Tyrant",25,"Final Day","Winged Hive Tyrant model only. Improve the Strength and Armour Penetration characteristics of melee weapons equipped by the bearer by 1.",null],
  ["Contraband Munitions",20,"Heroes of the Uprising","KELERMORPH/REDUCTUS SABOTEUR model only. This unit’s ranged attacks have +2 S.",null],
  ["Gene-tailored Toxins",35,"Heroes of the Uprising","LOCUS/SANCTUS model only. This model’s attacks have +1 D.",null],
  ["A Chink In Their Armour",20,"Host of Ascension","GENESTEALER CULTS model only. Each time the bearer is set up on the battlefield as Reinforcements, until the end of your next Fight phase, ranged weapons equipped by models in the bearer’s unit have the [LETHAL HITS] ability.",null],
  ["Assassination Edict",15,"Host of Ascension","GENESTEALER CULTS model only. Each time a model in the bearer’s unit makes an attack that targets a CHARACTER unit, add 1 to the Hit roll",null],
  ["Our Time is Nigh",20,"Host of Ascension","GENESTEALER CULTS model only. Once per battle, when the bearer’s unit declares a charge, the bearer can use this Enhancement. If it does, until the end of the phase, add 2 to Charge rolls made for the bearer’s unit.",null],
  ["Prowling Agitant",15,"Host of Ascension","GENESTEALER CULTS model only. In your opponent's Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6\".",null],
  ["Assault Commando",15,"Outlander Claw","GENESTEALER CULTS model only. Each time a model in the bearer’s unit makes a ranged attack, if it disembarked from a TRANSPORT this turn, you can re-roll the Hit roll.",null],
  ["Cartographic Data-leech",10,"Outlander Claw","GENESTEALER CULTS model only. While the bearer is embarked within a TRANSPORT, each time that TRANSPORT is selected to shoot, until the end of the phase, improve the Ballistic Skill characteristic of ranged weapons equipped by that TRANSPORT as a result of the Firing Deck ability by 1.",null],
  ["Serpentine Tactics",10,"Outlander Claw","GENESTEALER CULTS MOUNTED model only. The bearer’s unit is eligible to shoot in a turn in which it Fell Back.",null],
  ["Starfall Shells",10,"Outlander Claw","GENESTEALER CULTS MOUNTED model only. In your Shooting phase, after the bearer has shot, select one enemy unit hit by one or more of those attacks made with a cult sniper rifle. Until the start of your next Shooting phase, each time a model in that enemy unit makes an attack, subtract 1 from the Hit roll.",null],
  ["Mark of the Star Children (Upgrade)",30,"Purestrain Broodswarm","PURESTRAIN GENESTEALERS unit only. This unit has: ▪ +1 T. ▪ 4+ Sv. ▪ This unit’s melee attacks have +1 S.",null],
  ["Talons of the Sire",15,"Purestrain Broodswarm","PATRIARCH model only. This unit’s attacks can re-roll wound rolls of 1.",null],
  ["Deeds that Speak to the Masses",25,"Xenocreed Congregation","Magus, Primus or Acolyte Iconward model only. You start the battle with 2 additional Resurgence points.",null],
  ["Denunciator of Tyrants",25,"Xenocreed Congregation","MAgUS, PRImUS or ACOLyTE ICONwARD model only. Each time a model in the bearer’s unit makes an attack that targets a CHARACTER unit, add 1 to the Hit roll and add 1 to the Wound roll.",null],
  ["Gene-sire’s Reliquant",5,"Xenocreed Congregation","MAgUS, PRImUS or ACOLyTE ICONwARD model only. You can re-roll Battle-shock tests taken for the bearer’s unit.",null],
  ["Incendiary Inspiration",15,"Xenocreed Congregation","MAgUS, PRImUS or ACOLyTE ICONwARD model only. The bearer’s unit is eligible to declare a charge in a turn in which it Advanced.",null],
  ["Devious Disguises (Upgrade)",15,"Xenocult Masses","NEOPHYTE HYBRIDS unit only. This unit has -3\" detection range.",null],
  ["Inspired to Greatness",15,"Xenocult Masses","MAGUS/PRIMUS model only. This unit’s attacks can re-roll damage rolls.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Bio-Horror Revelation","Biosanctic Broodsurge","Ruse Stratégique",1,"Start of your opponent's Shooting phase.","One Aberrants, Biophagus or Purestrain Genestealers unit from your army.","Until the end of the phase, each time an enemy unit within 9\" of your unit is selected to shoot, it must take a Leadership test, subtracting 1 from the result. If that test is failed, until the end of the phase, each time a model in that enemy unit makes an attack that targets your unit, subtract 1 from the Hit roll.",""],
  ["Evasive Vanguard","Biosanctic Broodsurge","Ruse Stratégique",1,"Any phase, just after an enemy unit ends a move within 8\" of one or more of your Cult Ambush markers, before removing those markers from the battlefield.","Select one of those Cult Ambush markers.","You can set up that Cult Ambush marker anywhere on the battlefield that is more than 8\" horizontally away from all enemy units.",""],
  ["Gene-Twisted Muscle","Biosanctic Broodsurge","Tactique de Bataille",1,"Fight phase.","One Aberrants, Biophagus or Purestrain Genestealers unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a MONSTER or VEHICLE, add 1 to the Wound roll.",""],
  ["Hyper-Metabolic Vigour","Biosanctic Broodsurge","Tactique de Bataille",1,"Fight phase.","One Aberrants, Biophagus or Purestrain Genestealers unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes a Pile-in or Consolidation move, it can move up to 6\" instead of up to 3\". In addition, it does not need to end that move closer to the closest enemy model, provided it ends it as close as possible to the closest enemy unit.",""],
  ["Saintly Paroxysm","Biosanctic Broodsurge","Fait Épique",1,"Fight phase, just after an enemy unit destroys a Genestealer Cults Character model from your army.","That destroyed CHARACTER model. You can use this Stratagem on that model even though it was just destroyed.","Roll one D6: on a 2+, that enemy unit suffers D3 mortal wounds. If that Character model is an Abominant or Patriarch, that enemy unit suffers 2D3 mortal wounds instead.",""],
  ["Stimulated Bio-Surge","Biosanctic Broodsurge","Tactique de Bataille",1,"Your Charge phase.","One ABERRANTS, BIOPHAGUS or PURESTRAIN GENESTEALERS unit from your army that has not declared a charge this phase.","Your unit has +2 to charge rolls.",""],
  ["Avenge the Star Children","Final Day","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has shot or fought.","One Tyranids Character unit from your army that was destroyed by that enemy unit this phase. You can use this Stratagem on that unit even though it was just destroyed.","Until the end of the battle, each time a Genestealer Cults model from your army makes an attack that targets that enemy unit, add 1 to the Hit roll and add 1 to the Wound roll.",""],
  ["Darting Attacks","Final Day","Ruse Stratégique",1,"Your Shooting phase or your Charge phase.","One Tyranids unit from your army.","Until the end of the phase, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Divine Imperative","Final Day","Tactique de Bataille",1,"Your Charge phase, when a friendly Genestealer Cults unit within 12\" of a friendly engaged Tyranids unit declares a charge.","That GENESTEALER CULTS unit.","▪ Your unit has +1 to charge rolls. ▪ You can use this part of this stratagem. If you do: ▪ Your unit can re-roll charge rolls. ▪ Your unit must end that charge move engaged with an enemy unit engaged with that friendly TYRANIDS unit.",""],
  ["Hyperferocity","Final Day","Tactique de Bataille",1,"Fight phase.","One Genestealer Cults unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit, re-roll a Wound roll of 1. If one or more friendly Tyranids units are within 6\" of that enemy unit, you can re-roll the Wound roll instead.",""],
  ["Psi Surge","Final Day","Ruse Stratégique",1,"Start of any phase.","One Tyranids unit from your army.","Until the start of your next Command phase, increase the range of your unit’s Catalyst ability by 3\".","Each time you use this Stratagem, until the end of your next Command phase, you cannot use this Stratagem again."],
  ["Resistance Tunnels","Final Day","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Genestealer Cults or Tyranids unit from your army that is not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Living Up to Legend","Heroes of the Uprising","",1,"Your Shooting phase or the Fight phase, when a friendly KILLER unit has attacked, if those attacks destroyed an enemy unit or an enemy CHARACTER model.","That KILLER unit.","Each visible friendly battle-shocked GENESTEALER CULTS unit within 12\" of your unit is no longer battle-shocked.",""],
  ["Loyal to the End","Heroes of the Uprising","",1,"Fight phase, when an enemy unit targets a friendly KILLER unit.","That KILLER unit.","When a KILLER model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6: ▪ On a 1, that enemy unit suffers 1 mortal wound. ▪ On a 2+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Surging Broodworship","Heroes of the Uprising","",1,"Your Shooting phase or the Fight phase, when a friendly KILLER unit is selected to attack.","That KILLER unit.","Attacks made by KILLER models in your unit have [DEVASTATING WOUNDS].",""],
  ["A Deadly Snare","Host of Ascension","Ruse Stratégique",1,"Your opponent’s Charge phase, just after an enemy unit declares a charge.","One Genestealer Cults Infantry unit from your army that was selected as a target of that charge.","Roll one D6: on a 2-4, that enemy unit suffers D3 mortal wounds; on a 5+, that enemy unit suffers 3 mortal wounds.",""],
  ["Coordinated Trap","Host of Ascension","Tactique de Bataille",2,"The start of your Shooting phase or the start of the Fight phase.","Two GENESTEALER CULTS units from your army that have not been selected to shoot or fight this phase.","Select one enemy unit (if this Stratagem is used in the Fight phase, that enemy unit must be within Engagement Range of both of your units). Until the end of the phase, each time a model in either of your units makes an attack, it can only target that enemy unit (and only if it is an eligible target for that attack), and when resolving that attack, add 1 to the Wound roll.",""],
  ["Lying in Wait","Host of Ascension","Ruse Stratégique",1,"Your opponent’s Movement phase.","One Genestealer Cults Battleline unit from your army in Cult Ambush.","Until the end of the phase, when setting your unit up using a Cult Ambush marker, set your unit up anywhere on the battlefield wholly within 6\" of that Cult Ambush marker and not within Engagement Range of one or more enemy units.",""],
  ["Primed and Readied","Host of Ascension","Tactique de Bataille",2,"Your Shooting phase or the Fight phase.","One GENESTEALER CULTS units from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, a Critical Hit is scored on an unmodified Hit roll of 5+, instead of only a 6.",""],
  ["Return to the Shadows","Host of Ascension","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Genestealer Cults Infantry unit from your army that is not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Tunnel Crawlers","Host of Ascension","Ruse Stratégique",1,"Your Movement phase.","One GENESTEALER CULTS unit from your army that is arriving using the Deep Strike ability this phase.","Your unit can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units.","A unit targeted by this Stratagem is not eligible to declare a charge in the same turn."],
  ["Along Shadowed Trails","Outlander Claw","Ruse Stratégique",1,"Any phase, just after an enemy unit ends a move within 8\" of one or more of your Cult Ambush markers.","Select one of those Cult Ambush markers.","You can set up that Cult Ambush marker anywhere on the battlefield that is more than 8\" horizontally away from all enemy units.",""],
  ["Close-Range Shoot-Out","Outlander Claw","Tactique de Bataille",1,"Your Shooting phase.","One Genestealer Cults Mounted or Genestealer Cults Vehicle unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [LETHAL HITS] ability while targeting an enemy unit within 18\".",""],
  ["Deft Manoeuvring","Outlander Claw","Tactique de Bataille",1,"Your opponent's Shooting phase, just after an enemy unit has selected its targets.","One Achilles Ridgerunners or Atalan Jackals unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a 4+ invulnerable save.",""],
  ["Devoted Crew","Outlander Claw","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Goliath Rockgrinder or Goliath Truck unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Damage characteristic of that attack.",""],
  ["Encircling the Prey","Outlander Claw","Ruse Stratégique",1,"End of your opponent's Fight phase.","One Genestealer Cults Mounted or Genestealer Cults Vehicle unit from your army that is not within Engagement Range of one or more enemy units and is wholly within 9\" of one or more battlefield edges.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Rapid Feint","Outlander Claw","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Achilles Ridgerunners or Atalan Jackals unit from your army that is within 8\" of that enemy unit.","Your unit can make a Normal move of up to 6\".",""],
  ["Crawling Horror","Purestrain Broodswarm","",1,"Start of your opponent’s Movement phase.","One friendly PURESTRAIN GENESTEALERS unit.","Your unit has -6\" detection range until the end of the turn.",""],
  ["Inhuman Reactions","Purestrain Broodswarm","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged PURESTRAIN GENESTEALERS unit.","That PURESTRAIN GENESTEALERS unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Lurk and Strike","Purestrain Broodswarm","",1,"Your Movement phase, when a friendly PURESTRAIN GENESTEALERS unit is selected to make a fall-back move.","That PURESTRAIN GENESTEALERS unit.","That move does not prevent your unit from being eligible to declare a charge.",""],
  ["Frenzied Devotion","Xenocreed Congregation","Tactique de Bataille",1,"Fight phase.","One Acolyte Hybrids, Hybrid Metamorphs or Neophyte Hybrids unit from your army that has not been selected to fight this phase.","Until the end of the phase, improve the Attacks and Weapon Skill characteristics of melee weapons equipped by models (excluding Characters) in your unit by 1 and those weapons have the [HAZARDOUS] ability.",""],
  ["The Downtrodden Rise","Xenocreed Congregation","Ruse Stratégique",2,"End of your opponent’s Movement phase.","One ACOLYTE HYBRIDS, HYBRID METAMORPHS or NEOPHYTE HYBRIDS unit from your army in Cult Ambush.","Until the end of the phase, you can set up your unit on the battlefield without using a Cult Ambush marker. When doing so, set up your unit anywhere on the battlefield that is more than 6\" horizontally away from all enemy units.",""],
  ["The Path of Anguish","Xenocreed Congregation","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One Acolyte Hybrids or Neophyte Hybrids unit from your army that had one or more of its models destroyed as a result of the attacking unit's attacks.","Your unit can make a move of up to D6\", but it unit must end that move as close as possible to the closest enemy unit (excluding AIRCRAFT), When doing so, models in your unit can be moved within Engagement Range of that enemy unit.",""],
  ["Tireless Fervour","Xenocreed Congregation","Ruse Stratégique",1,"Your Charge phase.","One ACOLYTE HYBRIDS, HYBRID METAMORPHS or NEOPHYTE HYBRIDS unit from your army that has not declared a charge this phase.","▪ If your unit made an advance/fall-back move this turn, that advance/fall-back move does not prevent your unit from being eligible to declare a charge. ▪ When your unit declares a charge, you can use this part of this stratagem. If you do: ▪ Your unit can re-roll charge rolls. ▪ Your unit must end that charge move engaged with an enemy unit engaged with a friendly CHARACTER unit.",""],
  ["Transcendent Celerity","Xenocreed Congregation","Ruse Stratégique",1,"Your Shooting phase.","One Acolyte Hybrids, Hybrid Metamorphs or Neophyte Hybrids unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [ASSAULT] ability.",""],
  ["Vengeance for the Martyr!","Xenocreed Congregation","Fait Épique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit destroys a Genestealer Cults Character model from your army.","One other GENESTEALER CULTS CHARACTER model from your army.","Until the end of the battle, each time a friendly Acolyte Hybrids, Hybrid Metamorphs or Neophyte Hybrids model makes an attack that targets that enemy unit, re-roll a Hit roll of 1. If the destroyed model was a Magus, Primus or Acolyte Iconward, you can re-roll the Hit roll instead.",""],
  ["Eyes of the Cult","Xenocult Masses","",1,"Start of your Shooting phase.","One friendly NEOPHYTE HYBRIDS unit within a terrain area.","Enemy units within that terrain area have +6\" detection range",""],
  ["Fanatical Hail","Xenocult Masses","",1,"Your Shooting phase, when a friendly NEOPHYTE HYBRIDS unit is selected to shoot.","That NEOPHYTE HYBRIDS unit.","Select one enemy unit. Your unit’s ranged attacks that target that enemy unit can re-roll hit rolls.",""],
  ["Slunk from the Underbelly","Xenocult Masses","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly NEOPHYTE HYBRIDS unit with every model within a terrain area.","That NEOPHYTE HYBRIDS unit.","Ranged attacks that target your unit have -1 AP until that unit has attacked",""],
  ["Command Re-Roll","Core","Tactique de Bataille",1,"Any phase, just after you make an Advance roll, a Charge roll, a Desperate Escape test or a Hazardous test for a unit from your army, or a Hit roll, a Wound roll, a Damage roll or a saving throw for a model in that unit, or a roll to determine the number of attacks made with a weapon equipped by a model in that unit. If you are using fast dice rolling, this Stratagem can still be used after rolling multiple rolls or saving throws at once.","That unit or model from your army.","You re-roll that roll, test or saving throw. If you are using fast dice rolling, select one of those rolls or saving throws to re-roll.",""],
  ["Counter-Offensive","Core","Ruse Stratégique",2,"Fight phase, just after an enemy unit has fought.","One unit from your army that is within Engagement Range of one or more enemy units and that has not already been selected to fight this phase.","Your unit fights next.",""],
  ["Epic Challenge","Core","Fait Épique",1,"Fight phase, when a CHARACTER unit from your army that is within Engagement Range of one or more Attached units is selected to fight.","One CHARACTER model in your unit.","Until the end of the phase, all melee attacks made by that model have the [PRECISION] ability.",""],
  ["Fire Overwatch","Core","Ruse Stratégique",1,"Your opponent’s Movement or Charge phase, just after an enemy unit is set up or when an enemy unit starts or ends a Normal, Advance or Fall Back move, or declares a charge.","One unit from your army that is within 24\" of that enemy unit and that would be eligible to shoot if it were your Shooting phase.","If that enemy unit is visible to your unit, your unit can shoot that enemy unit as if it were your Shooting phase.","You cannot target a TITANIC unit with this Stratagem. Until the end of the phase, each time a model in your unit makes a ranged attack, an unmodified Hit roll of 6 is required to score a hit, irrespective of the attacking weapon’s Ballistic Skill or any modifiers. You can only use this Stratagem once per turn."],
  ["Go to Ground","Core","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One INFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, all models in your unit have a 6+ invulnerable save and have the Benefit of Cover.",""],
  ["Grenade","Core","Équipement",1,"Your Shooting phase.","One GRENADES unit from your army (excluding units that Advanced, Fell Back or have shot this turn) that is not within Engagement Range of one or more enemy units.","Select one GRENADES model in your unit and one enemy unit that is not within Engagement Range of any units from your army and is within 8\" of and visible to your GRENADES model. Roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",""],
  ["Heroic Intervention","Core","Ruse Stratégique",1,"Your opponent’s Charge phase, just after an enemy unit ends a Charge move.","One unit from your army that is within 6\" of that enemy unit and would be eligible to declare a charge against that enemy unit if it were your Charge phase.","Your unit now declares a charge that targets only that enemy unit, and you resolve that charge as if it were your Charge phase.","You can only select a VEHICLE unit from your army if it is a WALKER. Note that even if this charge is successful, your unit does not receive any Charge bonus this turn."],
  ["Insane Bravery","Core","Fait Épique",1,"Battle-shock step of your Command phase, just before you take a Battle-shock test for a unit from your army.","That unit from your army.","Your unit automatically passes that Battle-shock test.","You cannot use this Stratagem more than once per battle."],
  ["Rapid Ingress","Core","Ruse Stratégique",1,"End of your opponent’s Movement phase.","One unit from your army that is in Reserves.","Your unit can arrive on the battlefield as if it were the Reinforcements step of your Movement phase, and if every model in that unit has the Deep Strike ability, you can set that unit up as described in the Deep Strike ability (even though it is not your Movement phase).","You cannot use this Stratagem to enable a unit to arrive on the battlefield during a battle round it would not normally be able to do so in."],
  ["Smokescreen","Core","Équipement",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One SMOKE unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, all models in your unit have the Benefit of Cover and the Stealth ability.",""],
  ["Tank Shock","Core","Ruse Stratégique",1,"Your Charge phase, just after a VEHICLE unit from your army ends a Charge move.","That VEHICLE unit.","Select one enemy unit within Engagement Range of your unit, and select one VEHICLE model in your unit that is within Engagement Range of that enemy unit. Roll a number of D6 equal to the Toughness characteristic of the selected VEHICLE model. For each 5+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",""]
];

/* KW : les mots-clés dont les règles de détachement se servent,
   déduits des catégories du catalogue */
const KW = {
 "vehicle": [
  "Achilles Ridgerunners",
  "Goliath Rockgrinder",
  "Goliath Truck"
 ],
 "monster": [],
 "battleline": [
  "Acolyte Hybrids with Autopistols",
  "Acolyte Hybrids with Hand Flamers",
  "Neophyte Hybrids"
 ],
 "epic": [],
 "infantry": [
  "Aberrants",
  "Hybrid Metamorphs",
  "Purestrain Genestealers"
 ],
 "character": [
  "Abominant",
  "Acolyte Iconward",
  "Benefictus",
  "Biophagus",
  "Clamavus",
  "Jackal Alphus",
  "Kelermorph",
  "Locus",
  "Magus",
  "Nexos",
  "Patriarch",
  "Primus",
  "Reductus Saboteur",
  "Sanctus"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Aberrants": "32",
 "Abominant": "40",
 "Achilles Ridgerunners": "120x92",
 "Acolyte Hybrids with Hand Flamers": "32",
 "Acolyte Iconward": "32",
 "Atalan Jackals": "60x35.5",
 "Biophagus": "25",
 "Clamavus": "32",
 "Goliath Rockgrinder": "coque",
 "Goliath Truck": "coque",
 "Hybrid Metamorphs": "32",
 "Jackal Alphus": "60x35.5",
 "Kelermorph": "32",
 "Locus": "32",
 "Magus": "32",
 "Neophyte Hybrids": "25",
 "Nexos": "40",
 "Patriarch": "50",
 "Primus": "32",
 "Purestrain Genestealers": "32",
 "Reductus Saboteur": "32",
 "Sanctus": "32",
 "Benefictus": "32",
 "Acolyte Hybrids with Autopistols": "32"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Goliath Rockgrinder": 3
};

const TRANSPORTS = {
 "Goliath Rockgrinder": "This model has a transport capacity of 6 GENESTEALER CULTS INFANTRY models.",
 "Goliath Truck": "This model has a transport capacity of 12 GENESTEALER CULTS INFANTRY models."
};
const FACTION = [
 [
  "Cult Ambush",
  "If your Army Faction is GENESTEALER CULTS, you start the battle with a number of Resurgence points, depending on the battle size, as shown below.\n\n- Incursion: 6 Resurgence points\n- Strike Force: 10 Resurgence points\n- Onslaught: 14 Resurgence points\n\nEach time a unit from your army is destroyed, if every model (excluding\nCHARACTER models) in that unit has this ability you can spend the relevant number of Resurgence points shown below based on that unit's Starting Strength (not including attached CHARACTER models).\n\n---Aberrants---\n5 models = 4 Resurgence Points\n10 models = 8 Resurgence Points\n\n---Acolyte Hybrids with Autopistols, Acolyte Hybrids with Hand Flamers, Hybrid Metamorphs---\n5 models = 2 Resurgence Points\n10 models = 4 Resurgence Points\n\n---Atalan Jackals---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\n---Neophyte Hybrids---\n10 models = 3 Resurgence Points\n20 models = 6 Resurgence Points\n\n---Purestrain Genestealers---\n5 models = 2 Resurgence Points\n10 models = 6 Resurgence Points\n\nIf you do:\n- Add a new unit to your army identical to your destroyed unit (excluding CHARACTER models), in Cult Ambush, at its Starting Strength, with all of its wounds remaining and any [ONE SHOT] weapons those models are equipped with considered as not having been shot.\n- Place one Cult Ambush marker (see below) anywhere on the battlefield that is more than 8\" horizontally away from all enemy units (if this is not possible, no marker is placed).\n\nUNITS IN CULT AMBUSH\nCult Ambush is a type of Strategic Reserves. Units in Cult Ambush cannot be targeted with the Rapid Ingress Stratagem, but can be set up on the battlefield using a Cult Ambush marker as described below, or by following the rules for Strategic Reserves in a subsequent turn. Units in Cult Ambush are not automically destroyed at the end of the third battle round.\n\nCULT AMBUSH MARKERS\nUse a circular 32mm diameter marker for Cult Ambush markers. If an enemy model (excluding AIRCRAFT) ends any kind of move within 8\" of a Cult Ambush marker you placed, that Cult Ambush marker is removed from the battlefield. At the end of your opponent’s next Movement phase, for each of your Cult Ambush markers still on the battlefield, you can select one unit from your army that is in Cult Ambush to make an ingress move. For that ingress move, set that unit up with at least one model in that unit in base contact with that Cult Ambush marker and all other models placed wholly within 3\" of that Cult Ambush marker (that Cult Ambush marker is then removed from the battlefield). Units in Cult Ambush can make an ingress move in the first battle round using this rule."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/gsc.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_UNITE = {
 "Acolyte Hybrids with Hand Flamers": [
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Destruction Industrielle",
   "texte": "Each time a model in this unit makes an attack, re-roll a Wound Roll of 1."
  }
 ]
};
const APTIS_COND = {
 "Acolyte Hybrids with Hand Flamers": [
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Destruction Industrielle — sur objectif",
   "quand": "La cible est à portée d'un pion d'objectif",
   "texte": "If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the wound roll."
  }
 ],
 "Biophagus": [
  {
   "champ": "wndMod",
   "val": 1,
   "port": "C",
   "nom": "Familier Alchimique",
   "quand": "Le familier est utilisé (une fois par bataille) et la cible est INFANTERIE",
   "texte": "Once per battle, when the bearer’s unit is selected to fight, the bearer can use its alchemicus familiar. If it does, until the end of the phase, each time a model in the bearer's unit makes an attack that targets an INFANTRY unit, add 1 to the Wound roll"
  }
 ],
 "Sanctus": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Piste Psychique",
   "quand": "La cible est la proie désignée au premier round",
   "texte": "Each time this model makes an attack that targets its prey, you can re-roll the Hit roll and you can re-roll the Wound roll."
  },
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Piste Psychique",
   "quand": "La cible est la proie désignée au premier round",
   "texte": "Each time this model makes an attack that targets its prey, you can re-roll the Hit roll and you can re-roll the Wound roll."
  }
 ]
};
const AURAS_PERSO = {
 "Biophagus": [
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Science Dévoyée",
   "texte": "While this model is leading a unit, melee weapons equipped by models in that unit have the [LETHAL HITS] ability."
  }
 ],
 "Patriarch": [
  {
   "mot": "dev",
   "port": "C",
   "nom": "Puissance de l'Au-delà",
   "texte": "While this model is leading a unit, melee weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  }
 ],
 "Primus": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Démagogue du Culte",
   "texte": "While this model is leading a unit, each time a model in that unit makes an attack, you can add 1 to the Hit roll."
  }
 ],
 "Benefictus": [
  {
   "mot": "lethal",
   "port": "T",
   "nom": "Perturbation Bio-horrifique",
   "texte": "While this model is leading a unit, ranged weapons equipped by models in that unit have the [LETHAL HITS] ability."
  }
 ],
 "Acolyte Iconward": [
  {
   "champ": "fnp",
   "val": 5,
   "nom": "Nexus de Dévotion",
   "texte": "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability. (Le 4+ des Hybrides Métamorphes n'est pas distingué.)"
  }
 ]
};
const AURAS_ARMEE = [
 {
  "source": "Achilles Ridgerunners",
  "kw": [],
  "champ": "apMod",
  "val": 1,
  "nom": "Feux Croisés",
  "quand": "La cible a été touchée par les Ridgerunners ce tour",
  "texte": "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly Genestealer Cults unit makes an attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1."
 },
 {
  "source": "Achilles Ridgerunners",
  "kw": [],
  "mot": "ignoresCover",
  "nom": "Augure de Relevé",
  "quand": "La cible a été touchée par le porteur de l'augure cette phase",
  "texte": "Each time the bearer’s unit has shot, select one enemy unit that was hit by one or more attacks made by the bearer this phase. Until the end of the phase, each time a friendly GENESTEALER CULTS model makes an attack against that unit, that attack has the [IGNORES COVER] ability."
 },
 {
  "source": "Jackal Alphus",
  "kw": [],
  "champ": "rrH",
  "val": "ones",
  "port": "T",
  "nom": "Cible Prioritaire",
  "quand": "La cible a été touchée par le fusil de précision de l'Alphus cette phase",
  "texte": "In your Shooting phase, after this model's unit has shot, select one enemy unit hit by one or more of those attacks made with a cult sniper rifle. Until the end of the phase, each time a friendly Genestealer Cults model makes an attack that targets that enemy unit, re-roll a Hit roll of 1."
 },
 {
  "source": "Goliath Truck",
  "kw": [],
  "champ": "rrW",
  "val": "failed",
  "port": "T",
  "nom": "Appui-Feu",
  "quand": "L'unité a débarqué de ce Goliath ce tour, et vise l'unité qu'il a touchée",
  "texte": "In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this TRANSPORT this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
 },
 {
  "detach": "Biosanctic Broodsurge",
  "kw": [
   "Aberrants",
   "Biophagus",
   "Purestrain Genestealers"
  ],
  "champ": "atkMod",
  "val": 1,
  "port": "C",
  "nom": "Fureur Hypermorphique",
  "quand": "L'unité a chargé ce tour",
  "texte": "Each time such a unit is selected to fight, if it made a Charge move this turn, until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit."
 },
 {
  "detach": "Host of Ascension",
  "kw": [],
  "mot": "sust:1",
  "nom": "Embuscade Parfaite",
  "quand": "L'unité a été placée en Renforts, jusqu'à la fin de ta phase de Combat suivante",
  "texte": "Each time a GENESTEALER CULTS unit from your army is set up on the battlefield as Reinforcements, until the end of your next Fight phase, weapons equipped by models in that unit have the [SUSTAINED HITS 1] and [IGNORES COVER] abilities."
 },
 {
  "detach": "Host of Ascension",
  "kw": [],
  "mot": "ignoresCover",
  "port": "T",
  "nom": "Embuscade Parfaite",
  "quand": "L'unité a été placée en Renforts, jusqu'à la fin de ta phase de Combat suivante",
  "texte": "Each time a GENESTEALER CULTS unit from your army is set up on the battlefield as Reinforcements, until the end of your next Fight phase, weapons equipped by models in that unit have the [SUSTAINED HITS 1] and [IGNORES COVER] abilities."
 },
 {
  "detach": "Final Day",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "nom": "Catalyseur (Aura)",
  "quand": "La cible est à 6\" d'une unité TYRANIDS amie",
  "texte": "Catalyst (Aura): While an enemy unit is within 6\" of this unit, each time a friendly GENESTEALER CULTS unit makes an attack that targets that enemy unit, add 1 to the Hit roll."
 }
];
const OCTROIS_DETACH = {
 "Heroes of the Uprising": [
  {
   "champ": "rrH",
   "val": "ones",
   "qui": "figurine",
   "kw": [
    "Kelermorph",
    "Locus",
    "Reductus Saboteur",
    "Sanctus"
   ],
   "nom": "Réputation de Tueur",
   "texte": "Friendly KELERMORPH/LOCUS/REDUCTUS SABOTEUR/SANCTUS models have KILLER. Friendly KILLER models’ attacks can: ▪ Re-roll hit rolls of 1."
  },
  {
   "champ": "rrW",
   "val": "ones",
   "qui": "figurine",
   "kw": [
    "Kelermorph",
    "Locus",
    "Reductus Saboteur",
    "Sanctus"
   ],
   "nom": "Réputation de Tueur",
   "texte": "Friendly KELERMORPH/LOCUS/REDUCTUS SABOTEUR/SANCTUS models have KILLER. Friendly KILLER models’ attacks can: ▪ Re-roll wound rolls of 1."
  }
 ]
};
const STRAT_SIMU = [
 {
  "nom": "Gene-Twisted Muscle",
  "detach": "Biosanctic Broodsurge",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Aberrants",
   "Biophagus",
   "Purestrain Genestealers"
  ],
  "sauf": [],
  "aide": "+1 pour blesser — contre MONSTRE ou VÉHICULE seulement",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Avenge the Star Children",
  "detach": "Final Day",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "+1 pour toucher et +1 pour blesser — contre l'unité qui a détruit ton PERSONNAGE TYRANIDS",
  "effet": {
   "hitMod": 1,
   "wndMod": 1
  }
 },
 {
  "nom": "Hyperferocity",
  "detach": "Final Day",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "relance des 1 pour blesser",
  "effet": {
   "rrW": "ones"
  }
 },
 {
  "nom": "Hyperferocity — près des Tyranides",
  "detach": "Final Day",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "relance TOTALE des blessures — une unité TYRANIDS amie est à 6\" de la cible",
  "effet": {
   "rrW": "failed"
  }
 },
 {
  "nom": "Surging Broodworship",
  "detach": "Heroes of the Uprising",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Kelermorph",
   "Locus",
   "Reductus Saboteur",
   "Sanctus"
  ],
  "sauf": [],
  "aide": "[BLESSURES DÉVASTATRICES] pour les figurines de TUEUR",
  "effet": {
   "dev": true
  }
 },
 {
  "nom": "Coordinated Trap",
  "detach": "Host of Ascension",
  "pc": 2,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "+1 pour blesser — deux unités visent la même cible, et elle seule",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Primed and Readied",
  "detach": "Host of Ascension",
  "pc": 2,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "touches critiques sur 5+",
  "effet": {
   "critH": 5
  }
 },
 {
  "nom": "Close-Range Shoot-Out",
  "detach": "Outlander Claw",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Atalan Jackals",
   "Jackal Alphus",
   "Achilles Ridgerunners",
   "Goliath Rockgrinder",
   "Goliath Truck"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] sur les armes de tir — cible à 18\" ou moins",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Vengeance for the Martyr!",
  "detach": "Xenocreed Congregation",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Acolyte Hybrids with Autopistols",
   "Acolyte Hybrids with Hand Flamers",
   "Hybrid Metamorphs",
   "Neophyte Hybrids"
  ],
  "sauf": [],
  "aide": "relance des 1 pour toucher — contre l'unité qui a tué ton PERSONNAGE",
  "effet": {
   "rrH": "ones"
  }
 },
 {
  "nom": "Vengeance for the Martyr! — Magus, Primus ou Iconward",
  "detach": "Xenocreed Congregation",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Acolyte Hybrids with Autopistols",
   "Acolyte Hybrids with Hand Flamers",
   "Hybrid Metamorphs",
   "Neophyte Hybrids"
  ],
  "sauf": [],
  "aide": "relance TOTALE des touches — le personnage tué était un Magus, un Primus ou un Iconward",
  "effet": {
   "rrH": "failed"
  }
 },
 {
  "nom": "Fanatical Hail",
  "detach": "Xenocult Masses",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Neophyte Hybrids"
  ],
  "sauf": [],
  "aide": "relance des touches ratées contre l'unité désignée",
  "effet": {
   "rrH": "failed"
  }
 }
];

/* Vides, faute de câblage : voir l'en-tête. */
const ARMEMENT = {};
const APTIS_CIBLE = {};
const RETINUE = {};
const ENH_ANCIENS = {};
const GRPN = {};
const MOMENTS = {};
const MOMENTS_ARMEE = [];
const COMPO = {};
const ROLES_UNITE = {};

enregistreFaction({
  cle : "gsc",
  nom : "Cultes Genestealers",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
