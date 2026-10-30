/* ============================================================
   Données Ligues de Votann — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py votann

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 62 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     22 fiches sur 22 en ont un. Les autres — des Legends, que le
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
  ["Arkanyst Evaluator",5,5,3,0,4,[1],{"1": 70},0,"",0,"",1,"7+"],
  ["Berehk Stornbröw",6,6,5,5,5,[1],{"1": 85},0,"Meneur",0,"",1,"7+"],
  ["Brôkhyr Iron-master",5,5,4,0,4,[5],{"5": 70},0,"Meneur",0,"",1,"7+"],
  ["Brôkhyr Thunderkyn",5,6,3,0,2,[3, 6],[[1, {"3": 80, "6": 170}], [3, {"3": 90, "6": 180}]],0,"",0,"",1,"7+"],
  ["Buri Aegnirssen",5,6,3,4,5,[1],{"1": 85},0,"",0,"",1,"6+"],
  ["Cthonian Beserks",6,6,5,0,1,[5, 10],{"5": 90, "10": 180},0,"",0,"",1,"7+"],
  ["Cthonian Earthshakers",4,6,4,0,6,[2],{"2": 100},0,"",0,"",2,"7+"],
  ["Einhyr Champion",5,5,2,0,5,[1],{"1": 65},0,"Meneur",0,"",1,"7+"],
  ["Einhyr Hearthguard",5,5,2,0,2,[5, 10],[[1, {"5": 130, "10": 270}], [3, {"5": 140, "10": 280}]],0,"",0,"",1,"7+"],
  ["Grimnyr",5,5,4,4,4,[3],{"3": 65},0,"Meneur",0,"",1,"6+"],
  ["Hearthkyn Warriors",5,5,4,5,1,[10],{"10": 90},0,"",0,"",2,"7+"],
  ["Hekaton Land Fortress",10,12,2,0,16,[1],[[1, {"1": 250}], [2, {"1": 270}]],0,"",0,"",5,"7+"],
  ["Hernkyn Pioneers",12,6,4,0,3,[3, 6],[[1, {"3": 85, "6": 170}], [3, {"3": 95, "6": 180}]],0,"",0,"",2,"7+"],
  ["Hernkyn Yaegirs",6,5,5,0,1,[10],{"10": 90},0,"",0,"",1,"7+"],
  ["Ironkin Steeljacks with Heavy Volkanite Disintegrators",5,6,2,0,3,[3, 6],[[1, {"3": 80, "6": 170}], [3, {"3": 90, "6": 180}]],0,"",0,"",1,"7+"],
  ["Ironkin Steeljacks with Melee Weapons",5,6,2,0,3,[3, 6],[[1, {"3": 75, "6": 150}], [3, {"3": 85, "6": 160}]],0,"",0,"",1,"7+"],
  ["Kapricus Carrier",12,7,4,0,7,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"7+"],
  ["Kapricus Defenders",12,7,4,0,7,[1, 2],[[1, {"1": 75, "2": 150}], [3, {"1": 95, "2": 170}]],0,"",0,"",2,"7+"],
  ["Kâhl",5,5,3,4,4,[1],{"1": 65},0,"Meneur",0,"",1,"7+"],
  ["Memnyr Strategist",5,5,4,0,4,[1],{"1": 45},0,"Meneur",0,"",1,"7+"],
  ["Sagitaur",12,9,3,0,9,[1],[[1, {"1": 85}], [4, {"1": 95}]],0,"",0,"",2,"7+"],
  ["Ûthar the Destined",5,5,3,4,5,[1],{"1": 100},0,"Meneur",0,"",1,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Arkanyst Evaluator","➤ Transmatter inverter - full charge","T","3",2,8,2,"2","hazardous rf:2","18\""],
  ["Arkanyst Evaluator","➤ Transmatter inverter - half charge","T","3",2,8,1,"1","rf:1","12\""],
  ["Arkanyst Evaluator","➤ Transmatter inverter - overcharge","T","3",2,8,3,"3","hazardous rf:3","24\""],
  ["Arkanyst Evaluator","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Berehk Stornbröw","Warforge gauntlets","C","2",2,6,2,"1","extra sust:1","càc"],
  ["Berehk Stornbröw","➤ Kromlôk's Revenge - graviton strikes","C","4",2,10,2,"4","anti:3:mon anti:3:veh sust:1","càc"],
  ["Berehk Stornbröw","➤ Kromlôk's Revenge - plasma sweeps","C","8",2,7,2,"2","sust:1","càc"],
  ["Brôkhyr Iron-master","Autoch-pattern bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Brôkhyr Iron-master","Graviton rifle","T","3",3,5,1,"3","anti:3:mon anti:3:veh","18\""],
  ["Brôkhyr Iron-master","Las-beam cutter","T","1",4,6,3,"1","","6\""],
  ["Brôkhyr Iron-master","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Brôkhyr Iron-master","Graviton hammer","C","3",4,9,1,"3","anti:3:mon anti:3:veh","càc"],
  ["Brôkhyr Iron-master","Manipulator arms","C","3",4,3,0,"1","","càc"],
  ["Brôkhyr Iron-master","Plasma torch","C","1",4,6,3,"2","","càc"],
  ["Brôkhyr Thunderkyn","Bolt cannon","T","3",4,6,1,"2","sust:2","36\""],
  ["Brôkhyr Thunderkyn","Graviton blast cannon","T","3",4,5,2,"3","anti:3:mon anti:3:veh","24\""],
  ["Brôkhyr Thunderkyn","SP conversion beamer","T","2",4,7,2,"3","lethal","24\""],
  ["Brôkhyr Thunderkyn","Close combat weapon","C","2",4,4,0,"1","","càc"],
  ["Buri Aegnirssen","Autoch-pattern bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Buri Aegnirssen","➤ Bane - strike","C","5",2,12,3,"3","precision","càc"],
  ["Buri Aegnirssen","➤ Bane - sweep","C","10",2,6,2,"1","","càc"],
  ["Cthonian Beserks","Mole grenade launcher","T","D6",5,5,1,"1","blast indirect","18\""],
  ["Cthonian Beserks","Concussion maul","C","3",4,5,2,"3","anti:3:mon anti:3:veh","càc"],
  ["Cthonian Beserks","Heavy plasma axe","C","3",4,7,2,"3","","càc"],
  ["Cthonian Beserks","Twin concussion gauntlets","C","4",4,9,2,"2","twin","càc"],
  ["Cthonian Earthshakers","Autoch-pattern bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Cthonian Earthshakers","Breacher ordnance","T","D6+1",5,10,1,"2","blast heavy indirect","24\""],
  ["Cthonian Earthshakers","Tremor shells","T","D6+4",5,6,1,"1","blast heavy indirect","36\""],
  ["Cthonian Earthshakers","Plasma picks","C","4",3,5,2,"1","","càc"],
  ["Einhyr Champion","Autoch-pattern combi-bolter","T","4",2,4,0,"1","","24\""],
  ["Einhyr Champion","Darkstar axe","C","6",2,6,3,"2","","càc"],
  ["Einhyr Champion","Mass hammer","C","3",3,12,3,"D6+1","","càc"],
  ["Einhyr Hearthguard","EtaCarn plasma gun","T","1",3,7,3,"2","rf:1","24\""],
  ["Einhyr Hearthguard","Exo-armour grenade launcher","T","D3",3,3,0,"1","blast","24\""],
  ["Einhyr Hearthguard","Volkanite disintegrator","T","3",3,5,0,"1","dev","24\""],
  ["Einhyr Hearthguard","Concussion gauntlet","C","2",3,8,2,"2","","càc"],
  ["Einhyr Hearthguard","Graviton hammer","C","3",4,9,1,"3","anti:3:mon anti:3:veh","càc"],
  ["Einhyr Hearthguard","Plasma blade gauntlet","C","3",3,6,2,"1","","càc"],
  ["Grimnyr","Autoch-pattern bolter","T","2",4,4,0,"1","","24\""],
  ["Grimnyr","➤ Ancestral Wrath - focused witchfire","T","6",3,6,2,"D3","hazardous psychic","24\""],
  ["Grimnyr","➤ Ancestral Wrath - witchfire","T","3",3,6,2,"D3","psychic","24\""],
  ["Grimnyr","Ancestral ward stave","C","2",3,7,1,"D3","psychic","càc"],
  ["Grimnyr","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Hearthkyn Warriors","Autoch-pattern bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Hearthkyn Warriors","Autoch-pattern bolter","T","2",4,4,0,"1","","24\""],
  ["Hearthkyn Warriors","EtaCarn plasma beamer","T","1",4,8,3,"2","sust:D3","18\""],
  ["Hearthkyn Warriors","HYLas auto rifle","T","3",4,6,1,"1","assault rf:3","24\""],
  ["Hearthkyn Warriors","HYLas rotary cannon","T","6",5,6,1,"1","heavy sust:1","24\""],
  ["Hearthkyn Warriors","Ion blaster","T","1",4,5,2,"1","","18\""],
  ["Hearthkyn Warriors","Magna-rail rifle","T","1",5,12,3,"D3+3","dev heavy","18\""],
  ["Hearthkyn Warriors","Theyn's pistol","T","1",4,8,2,"1","pistol","12\""],
  ["Hearthkyn Warriors","➤ L7 missile launcher - blast","T","D6",4,4,0,"1","blast","24\""],
  ["Hearthkyn Warriors","➤ L7 missile launcher - focused","T","1",4,9,2,"D6","","24\""],
  ["Hearthkyn Warriors","Close combat weapon","C","1",4,4,0,"1","","càc"],
  ["Hearthkyn Warriors","Plasma knife","C","2",4,4,2,"1","","càc"],
  ["Hearthkyn Warriors","Theyn's melee weapon","C","2",4,5,2,"2","","càc"],
  ["Hekaton Land Fortress","Cyclic ion cannon","T","D6+2",4,7,2,"2","blast","24\""],
  ["Hekaton Land Fortress","Heavy magna-rail cannon","T","2",4,18,4,"D6+4","dev heavy","30\""],
  ["Hekaton Land Fortress","Hekaton warhead","T","D6+3",4,7,2,"2","blast oneshot","36\""],
  ["Hekaton Land Fortress","MATR autocannon","T","6",4,7,1,"2","assault sust:1","24\""],
  ["Hekaton Land Fortress","SP heavy conversion beamer","T","4",4,10,2,"4","lethal","24\""],
  ["Hekaton Land Fortress","Twin bolt cannon","T","3",4,6,1,"2","sust:2 twin","36\""],
  ["Hekaton Land Fortress","Twin ion beamer","T","D3+1",4,8,2,"1","blast twin","18\""],
  ["Hekaton Land Fortress","Armoured wheels","C","6",4,8,0,"1","","càc"],
  ["Hernkyn Pioneers","Bolt revolver","T","1",4,5,0,"1","pistol","12\""],
  ["Hernkyn Pioneers","Bolt shotgun","T","2",4,5,0,"1","assault","18\""],
  ["Hernkyn Pioneers","HYLas rotary cannon","T","6",4,6,1,"1","sust:1","24\""],
  ["Hernkyn Pioneers","Ion beamer","T","D3+1",4,8,2,"1","blast","18\""],
  ["Hernkyn Pioneers","Magna-coil autocannon","T","3",4,7,1,"2","","24\""],
  ["Hernkyn Pioneers","Plasma knife","C","2",4,4,2,"1","","càc"],
  ["Hernkyn Yaegirs","APM launcher","T","1",4,6,2,"D6","anti:3:mon anti:3:veh","24\""],
  ["Hernkyn Yaegirs","Bolt revolver","T","1",4,5,0,"1","pistol","12\""],
  ["Hernkyn Yaegirs","Bolt shotgun","T","2",4,5,0,"1","assault","18\""],
  ["Hernkyn Yaegirs","Magna-coil rifle","T","1",4,5,2,"2","ignorescover precision","24\""],
  ["Hernkyn Yaegirs","Close combat weapon","C","1",4,4,0,"1","","càc"],
  ["Hernkyn Yaegirs","Plasma knife","C","2",4,4,2,"1","","càc"],
  ["Ironkin Steeljacks with Heavy Volkanite Disintegrators","Autoch-pattern bolter","T","2",4,4,0,"1","pistol","24\""],
  ["Ironkin Steeljacks with Heavy Volkanite Disintegrators","Heavy volkanite disintegrator","T","6",4,6,1,"1","dev","24\""],
  ["Ironkin Steeljacks with Heavy Volkanite Disintegrators","Plasma knife","C","2",3,6,2,"1","","càc"],
  ["Ironkin Steeljacks with Heavy Volkanite Disintegrators","Plasma sword","C","6",3,6,2,"1","sust:1","càc"],
  ["Ironkin Steeljacks with Melee Weapons","Autoch-pattern bolter","T","2",4,4,0,"1","pistol","24\""],
  ["Ironkin Steeljacks with Melee Weapons","Concussion gauntlet","C","3",4,10,2,"2","lethal","càc"],
  ["Ironkin Steeljacks with Melee Weapons","Plasma sword","C","6",3,6,2,"1","sust:1","càc"],
  ["Kapricus Carrier","Magna-coil autocannon","T","3",4,7,1,"2","","24\""],
  ["Kapricus Carrier","Twin magna-coil autocannon","T","3",4,7,1,"2","twin","24\""],
  ["Kapricus Carrier","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Kapricus Defenders","HYLas rotary cannon","T","6",4,6,1,"2","sust:1","24\""],
  ["Kapricus Defenders","Magna-rail cannon","T","1",4,14,4,"D3+3","dev heavy","24\""],
  ["Kapricus Defenders","Twin magna-coil autocannon","T","3",4,7,1,"2","twin","24\""],
  ["Kapricus Defenders","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Kâhl","Autoch-pattern combi-bolter","T","4",2,4,0,"1","","24\""],
  ["Kâhl","Volkanite disintegrator","T","3",2,5,0,"1","dev","24\""],
  ["Kâhl","Forgewrought plasma axe","C","4",2,5,2,"2","","càc"],
  ["Kâhl","Mass gauntlet","C","3",3,8,3,"3","","càc"],
  ["Memnyr Strategist","Autoch-pattern bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Memnyr Strategist","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Sagitaur","HYLas beam cannon","T","2",4,12,3,"D6+1","","24\""],
  ["Sagitaur","MATR autocannon","T","6",4,7,1,"2","assault sust:1","24\""],
  ["Sagitaur","Sagitaur missile launcher","T","2",4,10,3,"3","","36\""],
  ["Sagitaur","Twin bolt cannon","T","3",4,6,1,"2","sust:2 twin","36\""],
  ["Sagitaur","➤ L7 missile launcher - blast","T","D6",4,4,0,"1","blast","24\""],
  ["Sagitaur","➤ L7 missile launcher - focused","T","1",4,9,2,"D6","","24\""],
  ["Sagitaur","Armoured wheels","C","3",4,6,0,"1","","càc"],
  ["Ûthar the Destined","Volkanite disintegrator","T","3",2,5,0,"1","dev","24\""],
  ["Ûthar the Destined","Blade of the Ancestors","C","5",2,6,3,"2","dev","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Arkanyst Evaluator","Personnage"],
  ["Berehk Stornbröw","Epic Hero"],
  ["Brôkhyr Iron-master","Personnage"],
  ["Brôkhyr Thunderkyn","Infanterie"],
  ["Buri Aegnirssen","Epic Hero"],
  ["Cthonian Beserks","Infanterie"],
  ["Cthonian Earthshakers","Infanterie"],
  ["Einhyr Champion","Personnage"],
  ["Einhyr Hearthguard","Infanterie"],
  ["Grimnyr","Personnage"],
  ["Hearthkyn Warriors","Battleline"],
  ["Hekaton Land Fortress","Véhicule"],
  ["Hernkyn Pioneers","Monté"],
  ["Hernkyn Yaegirs","Infanterie"],
  ["Ironkin Steeljacks with Heavy Volkanite Disintegrators","Infanterie"],
  ["Ironkin Steeljacks with Melee Weapons","Infanterie"],
  ["Kapricus Carrier","Véhicule"],
  ["Kapricus Defenders","Véhicule"],
  ["Kâhl","Personnage"],
  ["Memnyr Strategist","Personnage"],
  ["Sagitaur","Véhicule"],
  ["Ûthar the Destined","Epic Hero"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Berehk Stornbröw": [
  "Cthonian Beserks"
 ],
 "Brôkhyr Iron-master": [
  "Brôkhyr Thunderkyn",
  "Hearthkyn Warriors"
 ],
 "Einhyr Champion": [
  "Einhyr Hearthguard"
 ],
 "Grimnyr": [
  "Hearthkyn Warriors"
 ],
 "Kâhl": [
  "Einhyr Hearthguard",
  "Hearthkyn Warriors"
 ],
 "Memnyr Strategist": [
  "Ironkin Steeljacks with Heavy Volkanite Disintegrators",
  "Ironkin Steeljacks with Melee Weapons"
 ],
 "Ûthar the Destined": [
  "Einhyr Hearthguard",
  "Hearthkyn Warriors"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Ûthar the Destined": [
  [
   "Ancestral Fortune",
   "Once per turn, you can spend 1YP to change one Hit roll, one Wound roll or one saving throw made for this model to an unmodified 6."
  ],
  [
   "Leader",
   "This model can be attached to the following units: EINHYR HEARTHGUARD, HEARTHKYN WARRIORS"
  ],
  [
   "Grim Efficiency",
   "Once per battle round, when a friendly Leagues of Votann unit within 12\" of this model is targeted with a Stratagem, this model can use this ability. If it does, reduce the CP cost of that Stratagem by 1CP."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Rampart crest",
   "While the bearer is leading a unit, models in that unit have a 5+ invulnerable save."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Hearthkyn Warriors": [
  [
   "Luck Has, Need Keeps, Toil Earns",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control, until your opponent's Level of Control over that is greater than yours at the end of a phase."
  ],
  [
   "Pan-spectral Scanning",
   "Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Weavefield crest",
   "Models in the bearer's unit have a 5+ invulnerable save."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Kâhl": [
  [
   "Kindred Hero",
   "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units: EINHYR HEARTHGUARD, HEARTHKYN WARRIORS"
  ],
  [
   "Seized Opportunity",
   "Once per phase, one model from your army with this ability can use it when its unit destroys an enemy unit. If it does, gain 1YP."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Rampart crest",
   "While the bearer is leading a unit, models in that unit have a 5+ invulnerable save."
  ],
  [
   "Teleport crest",
   "While the bearer is leading a unit, models in that unit have the Deep Strike ability."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Einhyr Champion": [
  [
   "Leader",
   "This model can be attached to the following unit: EINHYR HEARTHGUARD"
  ],
  [
   "Exemplar of the Einhyr",
   "While this model is leading a unit, add 1 to Advance and Charge rolls made for that unit."
  ],
  [
   "Mass Driver Accelerators",
   "Each time this model ends a Charge move, you can select one enemy unit within Engagement Range of this model and roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Weavefield crest",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Teleport crest",
   "While the bearer is leading a unit, models in that unit have the Deep Strike ability."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Grimnyr": [
  [
   "Leader",
   "This model can be attached to the following unit: HEARTHKYN WARRIORS"
  ],
  [
   "Fortify (Psychic)",
   "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability."
  ],
  [
   "Grimnyr's Regard",
   "Once per battle, at the start of any phase, you can select one friendly Leagues of Votann unit that is Battle-shocked and within 12\" of this unit's Grimnyr model. That unit is no longer Battle-shocked."
  ],
  [
   "Unit Composition",
   "If this unit’s Grimnyr model is ever destroyed, all of this unit’s remaining CORV models are also destroyed. While embarking within a Transport and while embarked within a Transport, each CORV model takes up the space of 0 models.’"
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Brôkhyr Iron-master": [
  [
   "Multi-spectral visor",
   "Each time a model in this unit makes a ranged attack, re-roll a Wound roll of 1."
  ],
  [
   "Brôkhyr Guild Support",
   "While this unit is within 3\" of one or more friendly Leagues of Votann Vehicle or Ironkin Steeljacks units, if this unit is not an attached unit, it has the Lone Operative ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units:BRÔKHYR THUNDERKYN, HEARTHKYN WARRIORS"
  ],
  [
   "Unit Composition",
   "If this unit’s Brôkhyr Iron-master model is ever destroyed, all of this unit’s remaining E-COG models are also destroyed. While embarking within a Transport and while embarked within a Transport, each E-COG model takes up the space of 0 models."
  ],
  [
   "Forgewrought Expertise",
   "At the end of your Movement phase, this model can repair one friendly Leagues of Votann Vehicle, Exoframe or Ironkin Steeljacks unit within 3\" of it. One model in that unit regains up to D3 lost wounds, or up to 3 lost wounds if this unit contains an Ironkin Assistant model. Each unit can only be repaired once per turn."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Einhyr Hearthguard": [
  [
   "Decisive Destruction",
   "Each time a model in this unit makes a ranged attack that targets the closest eligible target, re-roll a Hit roll of 1."
  ],
  [
   "Teleport crest",
   "Models in the bearer's unit have the Deep Strike ability."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Weavefield crest",
   "Models in the bearer's unit have a 5+ invulnerable save."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Cthonian Beserks": [
  [
   "Cyberstimms",
   "Each time a model in this unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6, adding one to the result if units from your army have Fortify Takeover: on a 4+, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Subterranean Explosives",
   "In your Shooting phase, after this unit has shot, select one enemy unit (excluding Monsters and Vehicles) that was hit by one or more of those attacks made with a mole grenade launcher. Until the start of your next Shooting phase, that enemy unit cannot be targeted with the Fire Overwatch Stratagem."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Hernkyn Pioneers": [
  [
   "Outflanking Mag-Riders",
   "At the end of your opponent’s turn, if this unit is wholly within 9\" of one or more battlefield edges and not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Comms array",
   "Each time you target the bearer’s unit with a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Pan-spectral scanner",
   "Each time a model in the bearer's unit makes a ranged attack, re-roll a Hit roll of 1."
  ],
  [
   "Rollbar searchlight",
   "Each time a model in the bearer's unit makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "Pan-spectral Lockons",
   "In your Shooting phase, you can select one visible enemy unit within 12\" of this unit. That enemy unit is spotted: \n- While a unit is spotted, that unit has +3\" detection range."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Sagitaur": [
  [
   "Blistering Advance",
   "Units can disembark from this Transport after it has Advanced. Units that do so count as having made a Normal move that phase, and cannot declare a charge in the same turn, but can otherwise act normally in the remainder of the turn."
  ],
  [
   "Saturation Rounds",
   "This unit’s ranged attacks have [IGNORES COVER]."
  ],
  [
   "Optimised Attack Lines",
   "This unit has MOBILE."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Firebase Control (Aura)",
   "While a friendly Leagues of Votann Infantry unit is wholly within 6\" of this Transport, ranged weapons equipped by models in that Infantry unit have the [sustained hits 1] ability."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Brôkhyr Thunderkyn": [
  [
   "Breaching Fire",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the start of your next Shooting phase, that enemy unit cannot have the Benefit of Cover."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ],
  [
   "Conversion (Thunderkyn)",
   "Each time an attack made with this weapon targets an enemy unit that is not within 12\", an unmodified Hit roll of 4+ scores a Critical Hit."
  ]
 ],
 "Hekaton Land Fortress": [
  [
   "MultiCOG Targeting",
   "Each time this model makes a ranged attack, you can ignore any or all modifiers to the following: that attack's Ballistic Skill characteristic, the Hit roll."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Pan spectral scanner",
   "Each time a model in the bearer's unit makes a ranged attack, re-roll a Hit roll of 1."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Firebase Control (Aura)",
   "While a friendly Leagues of Votann Infantry unit is wholly within 6\" of this Transport, ranged weapons equipped by models in that Infantry unit have the [sustained hits 1] ability."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Hernkyn Yaegirs": [
  [
   "Pragmatic Hunters",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8” of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6”.'"
  ],
  [
   "Shroudwërke Talismans",
   "This unit has -3\" detection range."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Buri Aegnirssen": [
  [
   "Grudge-fuelled Fortitude",
   "The first time this model is destroyed, at the end of the phase, roll one D6: on a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with its full wounds remaining."
  ],
  [
   "Unhinged Vengeance",
   "In your opponent’s Shooting phase, when an enemy unit has shot, if this model lost one or more wounds as a result of those attacks, this unit can make a surge move of up to D6+2\"."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Memnyr Strategist": [
  [
   "Computational Mastermind",
   "At the end of your Command phase, before you determine if units from your army have Hostile Acquisition or Fortify Takeover, for each objective marker you control that has one or more models with this ability in range of it, you can spend 1YP or gain 1YP."
  ],
  [
   "Predictive Guidance",
   "Once per battle round, when you target this unit with the Fire Overwatch/Heroic Intervention stratagem, you can use this ability. If you do, that use of that stratagem is -1 CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units: IRONKIN STEELJACKS WITH HEAVY VOLKANITE DISINTEGRATORS, IRONKIN STEELJACKS WITH MELEE WEAPONS"
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Arkanyst Evaluator": [
  [
   "Science Guild Support",
   "While this model is within 3\" of one or more other friendly Leagues of Votann Infantry units (excluding units with the Lone Operative ability), this model has the Lone Operative ability."
  ],
  [
   "Resource Transmutation",
   "Once per turn, in your Shooting phase, one model with this ability can choose to use it when it is selected to shoot. If it does, you must spend 1YP and, until the end of the phase, ranged weapons equipped by that model have the [Sustained Hits 1] ability and, after that model has shot this phase, if one or more enemy units were destroyed by those attacks, you can gain up to 2YP."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Kapricus Defenders": [
  [
   "Opportunistic Manoeuvre",
   "In your Shooting phase, after this unit has shot, it can make a Normal Move of up to D6\". If it does, until the end of the turn, this unit is not eligible to declare a charge."
  ],
  [
   "Smoke Launcher",
   "The bearer has the Smoke keyword."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Kapricus Carrier": [
  [
   "Scanner Uplinks",
   "In your shooting phase, after this model has shot, select one enemy unit (excluding Monsters and Vehicles) hit by one or more of those attacks. Until the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Smoke Launcher",
   "The bearer has the Smoke keyword."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Firebase Control (Aura)",
   "While a friendly Leagues of Votann Infantry unit is wholly within 6\" of this Transport, ranged weapons equipped by models in that Infantry unit have the [sustained hits 1] ability."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Ironkin Steeljacks with Heavy Volkanite Disintegrators": [
  [
   "Purge Response",
   "Each time you target this unit with the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+ while resolving that Stratagem. If units from your army have Fortify Takeover, hits are scored on unmodified Hit rolls of 4+ while resolving that Stratagem instead."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Preymark crest",
   "Each time a model in the bearer's unit makes an attack that targets an enemy unit within range of one or more objective markers, on a Critical Wound, that attack has the [Precision] ability."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Ironkin Steeljacks with Melee Weapons": [
  [
   "Merciless Eradication",
   "Each time an enemy unit (excluding Monsters and Vehicles) that is within Engagement Range of this unit Falls Back, all models in that enemy unit must take a Desperate Escape test. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those tests."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Preymark crest",
   "Each time a model in the bearer's unit makes an attack that targets an enemy unit within range of one or more objective markers, on a Critical Wound, that attack has the [Precision] ability."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Cthonian Earthshakers": [
  [
   "Geomantic Hunters",
   "Up to twice per battle, in your Shooting phase, when this unit is selected to shoot, it can use this ability. If it does, until the end of the phase, each time a model in this unit makes an attack with its breacher ordnance, you can re-roll the Wound roll."
  ],
  [
   "Destabilising Quakes",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks made with its tremor shells. That unit must take a Battle-shock test, subtracting 1 from the result."
  ],
  [
   "Guerrilla Adepts",
   "In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding Monsters and Vehicles). Until the end of the phase, attacks made by models in this unit can only attack that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements or Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ],
 "Berehk Stornbröw": [
  [
   "Break the Foe",
   "Melee weapons equipped by models in this unit have the [Sustained Hits 1] ability."
  ],
  [
   "Relentless Avalanche",
   "You can target this model's unit with the Heroic Intervention Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this phase."
  ],
  [
   "Leader",
   "This model can be attached to the following units: CTHONIAN BESERKS"
  ],
  [
   "Prioritised Efficiency",
   "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Armoured Trailblazers",1,"","Sagitaur Spearhead","Friendly SAGITAUR units have Scouts 6\".","",0,"","Disruption"],
  ["Brandfast Oathband",2,"","Mobile Sensor Relays","Leagues of Votann Transport units from your army have the following ability: Firebase Control (Aura): While a friendly Leagues of Votann Infantry unit is wholly within 6\" of this TRANSPORT, ranged weapons equipped by models in that INFANTRY unit have the [sustained hits 1] ability.","",0,"","Take and Hold"],
  ["Dêlve Assault Shift",2,"","Fury From The Dêlve","Cthonian Beserks units from your army have the Deep Strike ability. KEYWORDS CTHONIAN BESERKS units from your army gain the BATTLELINE keyword.","",0,"","Purge the Foe"],
  ["Farseekers",1,"","Eye of the Hunt","Friendly HERNKYN units’ ranged attacks that target a unit within 12\" have +1 to hit rolls.","",0,"","Reconnaissance"],
  ["Hearthband",3,"Hearthband","Methodical Annihilation","Each time a Leagues of Votann model from your army makes an attack with a weapon that targets the closest eligible target or a target that is within Engagement Range of that model’s unit: ▪ Re-roll a Wound roll of 1. ▪ If your unit is a Kâhl, Einhyr Hearthguard or Ûthar the Destined unit, improve the Armour Penetration characteristic of that attack by 1.","",0,"","Priority Assets"],
  ["Hearthfyre Arsenal",2,"","Optimal Application","At the end of your Command phase, you gain 1YP for each objective marker you control that is not within your deployment zone and has one or more Iron-master and/or Memnyr Strategist models from your army within range of it (to a maximum of 2YP gained from this Detachment rule per turn). In your Shooting phase, each time a Brôkhyr, Ironkin Steeljacks or Arkanyst Evaluator unit from your army is selected to shoot, you can spend 1YP. If you do, until the end of the phase, each time a model in that unit makes an attack, re-roll a Hit roll of 1.","",0,"","Priority Assets"],
  ["Hearthguard Covenant",1,"Hearthband","Avatars of the Ancestors","Friendly KÂHL/EINHYR CHAMPION/EINHYR HEARTHGUARD/ÛTHAR THE DESTINED units’ ranged attacks that target a unit within 9\" can re-roll wound rolls of 1. This detachment has the HEARTHGUARD tag and cannot be taken with another HEARTHGUARD detachment.","",0,"","Priority Assets"],
  ["Mercenary Oathband",2,"","Ruthless Reinvestment","Your Leagues of Votann units do not have the Hostile Acquisition or Fortify Takeover abilities except as described in this rule. At the start of the battle, your LEAGUES OF VOTANN units have the Hostile Acquisition ability. At the end of your Command phase, you can spend 3YP. If you do, LEAGUES OF VOTANN units from your army lose the Hostile Acquisition ability and gain the Fortify Takeover ability, or vice versa.","",0,"","Take and Hold"],
  ["Needgaârd Oathband",2,"","Martial Leverage","Each time an enemy unit is destroyed, you gain 1YP.","",0,"","Purge the Foe"],
  ["Persecution Prospect",2,"","Assailed From Every Angle","Leagues of Votann units from your army have the following ability: Guerrilla Adepts: In your Shooting phase, just after this unit is selected to shoot, this unit can use this ability. If it does, select one enemy unit (excluding MONSTERS and VEHICLES). Until the end of the phase, attacks made by models in this unit can only target that enemy unit (and only if it is an eligible target) and, after resolving those attacks, if one or more of those attacks hit that enemy unit, until the start of your next Shooting phase, that enemy unit is assailed (this simply labels that unit for the purposes of this ability and some Enhancements and Stratagems). If that unit is already assailed, until the start of your next Shooting phase, it is also pinned. While a unit is pinned, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it.","",0,"","Disruption"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Optimised Attack Lines (Upgrade)",15,"Armoured Trailblazers","SAGITAUR unit only. This unit has MOBILE.",null],
  ["Saturation Rounds (Upgrade)",15,"Armoured Trailblazers","SAGITAUR unit only. This unit’s ranged attacks have [IGNORES COVER].",null],
  ["Precursive Judgement",15,"Brandfast Oathband","While the bearer's unit is wholly within 6\" of one or more friendly Leagues of Votann Transport units, you can target the bearer's unit with the Fire Overwatch Stratagem for 0CP and hits are scored on an unmodified Hit roll of 5+ while resolving that Stratagem.",null],
  ["Signature Restoration",5,"Brandfast Oathband","Each time a friendly Leagues of Votann model is repaired using the bearer's Forgewrought Expertise ability, that model regains one additional lost wound.",null],
  ["Tactical Alchemy",10,"Brandfast Oathband","In your Command phase, if the bearer's unit is in range of one or more objective markers you control that are not in your deployment zone, you can spend 1YP. If you do, roll one D6: on a 4+, you gain 1CP.",null],
  ["Trivärg Cyber Implant",40,"Brandfast Oathband","In your Shooting phase, each time the bearer's unit is selected to shoot, if it disembarked from a Transport this turn, or if you spend 2YP, until the end of the phase, ranged weapons equipped by model in that unit have the [Sustained Hits 2] ability.",null],
  ["Dêlvewerke Navigator",25,"Dêlve Assault Shift","",null],
  ["Multiwave System Jammer",10,"Dêlve Assault Shift","Once per battle, in your Movement phase, if the bearer is on the battlefield, it can use this Enhancement. If it does, select one friendly Cthonian unit that is in Reserves. Until the end of the phase, for the purposes of setting up that unit on the battlefield, treat the current battle round number as one higher than it actually is.",null],
  ["Piledriver",15,"Dêlve Assault Shift","Each time the bearer's unit is selected to fight, the bearer can use this Enhancement. If it does, spend up to 2YP and, until the end of the phase, add the number of YP you just spent to the Damage characteristic of the bearer's melee weapons.",null],
  ["Quake Supervisor",20,"Dêlve Assault Shift","While the bearer is within 3\" of one or more friendly Leagues of Votann Artillery units, the bearer has the Lone Operative ability, and each time one of those Artillery units makes a ranged attack that targets an enemy unit visible to the bearer, add 1 to the Hit roll.",null],
  ["Pan-spectral Lockons (Upgrade)",10,"Farseekers","PIONEERS unit only. In your Shooting phase, you can select one visible enemy unit within 12\" of this unit. That enemy unit is spotted: ▪ While a unit is spotted, that unit has +3\" detection range.",null],
  ["Shroudwërke Talismans (Upgrade)",15,"Farseekers","YAEGIRS unit only. This unit has -3\" detection range",null],
  ["Bastion Shield",25,"Hearthband","Each time a ranged attack targets the bearer’s unit, if the attacking model is within 12\" of the bearer’s unit, worsen the Armour Penetration characteristic of that attack by 1. If you spend 1YP, until the end of the phase, if the attacking model is within 18\" of the bearer’s unit, worsen the Armour Penetration characteristic of that attack by 1 instead.",null],
  ["High Kâhl",30,"Hearthband","Each time a model in the bearer’s unit is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 4+, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",null],
  ["Ironskein",10,"Hearthband","Add 2 to the bearer’s Wounds characteristic.",null],
  ["Quake Multigenerator",15,"Hearthband","In your Shooting phase, after the bearer has shot, select one enemy unit (excluding TITANIC units) hit by one or more of those attacks. Until the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll.",null],
  ["Calculated Tenacity",15,"Hearthfyre Arsenal","While the bearer is leading a unit, add 1 to the Objective Control characteristic of models in that unit.",null],
  ["Fârstrydr Node",20,"Hearthfyre Arsenal","Iron-master or Memnyr Strategist model only. Models in the bearer’s unit have the Deep Strike ability.",null],
  ["Graviton Vault",5,"Hearthfyre Arsenal","In your Shooting phase, after the bearer has shot, and in the Fight phase, after the bearer has fought, select one enemy Monster or Vehicle unit hit by one or more of those attacks. Until the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll.",null],
  ["Mantle of Elders",10,"Hearthfyre Arsenal","Each time the bearer's unit is selected to shoot, if you spend YP using the Optimal Application Detachment rule when doing so, you can roll one D6: on a 2+, you gain 1YP.",null],
  ["High Kâhl",30,"Hearthguard Covenant","Each time a model in the bearer’s unit is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 4+, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",null],
  ["Ironskein",10,"Hearthguard Covenant","Add 2 to the bearer’s Wounds characteristic.",null],
  ["Asset Manipulator",25,"Mercenary Oathband","At the start of the Command phase, you can spend 3YP. If you do, until the end of the turn, while an enemy unit is within 3” of the bearer, subtract 1 from the Objective Control characteristic of models in that enemy unit.",null],
  ["Etacarn SB9 Targeting Implant",15,"Mercenary Oathband","Each time a model in the bearer’s unit makes an attack, re-roll a Hit roll of 1. Each time the bearer’s unit is selected to shoot or fight, you can spend 3YP. If you do, until the end of the phase, each time a model in the bearer’s unit makes an attack, that attack has the [SUSTAINED HITS 1] ability.",null],
  ["Mercenary Prospector",20,"Mercenary Oathband","Each time an enemy unit is destroyed by the bearer’s unit, gain 2YP.",null],
  ["Metaphysical Brokerage",20,"Mercenary Oathband","At the end of your turn, if the bearer is on the battlefield and you gained fewer than 3YP this turn, you gain an amount of YP equal to the difference.",null],
  ["Ancestral Crest",15,"Needgaârd Oathband","Once per turn, when you target the bearer's unit with the Command Re-roll Stratagem, the bearer can use this Enhancement. If it does, spend 1YP and reduces the CP cost of that Stratagem by 1CP.",null],
  ["Dead Reckoning",10,"Needgaârd Oathband","Leagues of Votann model only. At the end of the turn, if the bearer is on the battlefield and you spent no YP in that turn, you gain 1YP.",null],
  ["Iron Ambassador",5,"Needgaârd Oathband","Leagues of Votann model equipped with an Autoch-pattern combi-bolter only. Once per battle, when the bearer's unit is selected to shoot, the bearer can use this Enhancement. If it does, spend up to 3YP, and, until the end of the phase, add the number of YP you just spent to the Damage characteristic of the bearer's ranged weapons.",null],
  ["Oathbound Speculator",30,"Needgaârd Oathband","Each time a model in the bearer's unit makes an attack, re-roll a Wound roll of 1. Each time the bearer's unit is selected to shoot or fight, you can spend 3YP. If you do, until the end of the phase, each time a model in the bearer's unit makes an attack, add 1 to the Wound roll.",null],
  ["Eye for Weakness",25,"Persecution Prospect","Each time a model in the bearer's unit makes an attack that targets an assailed unit, add 1 to the Wound roll.",null],
  ["Nomad Strategist",20,"Persecution Prospect","Once per battle, at the end of your opponent's Fight phase, if the bearer is on the battlefield, it can use this Enhancement. If it does, select one Hernkyn unit from your army, and, for every 2YP you just spent, select up to one additional Hernkyn unit from your army. You can remove those units from the battlefield and place them into Strategic Reserves. You cannot select a unit that is within Engagement Range of one or more enemy units (excluding assailed units).",null],
  ["Surgical Saboteur",10,"Persecution Prospect","In your Shooting phase, after this model has shot, select one Monster or Vehicle unit hit by one or more of those attacks; until the start of your next Shooting phase, that model is pinned.",null],
  ["Writ of Acquisition",10,"Persecution Prospect","In your Shooting phase, after the bearer's unit has shot, you gain 1YP for each assailed unit hit by one or more of those attacks (to a maximum of 3YP).",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Built to Last","Armoured Trailblazers","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly SAGITAUR unit.","That SAGITAUR unit.","Ranged attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Coordinated Crossfire","Armoured Trailblazers","",1,"Start of your Shooting phase.","Up to two friendly SAGITAUR units.","Select one enemy unit. Your units’ ranged attacks that target that enemy unit can: ▪ Re-roll hit rolls of 1. ▪ Re-roll wound rolls of 1.",""],
  ["Outflanking Armour","Armoured Trailblazers","",1,"End of your opponent’s Movement phase, from the second battle round onwards.","Up to two friendly SAGITAUR units in strategic reserves.","Your units each make an ingress move.",""],
  ["Bastion Running","Brandfast Oathband","Tactique de Bataille",1,"Your Movement phase.","One Hekaton Land Fortress unit from your army that has not been selected to move this phase.","Until the end of the phase, each time your unit makes a Normal or Advance move, it can move horizontally through terrain features.",""],
  ["Illuminated Priority","Brandfast Oathband","Équipement",1,"Your Shooting phase, just after a Leagues of Votann Vehicle unit from your army has shot.","That LEAGUES OF VOTANN VEHICLE unit.","Select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a Leagues of Votann Infantry model from your army makes an attack that targets that enemy unit, re-roll a Hit roll of 1.",""],
  ["Inexorable Efficiency","Brandfast Oathband","Ruse Stratégique",1,"Your Shooting phase.","One Leagues of Votann unit from your army.","Until the end of the phase, your unit is eligible to shoot in a turn in which it Fell Back.",""],
  ["Opportunistic Escalation","Brandfast Oathband","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot, if units from your army have Hostile Acquisition.","One Leagues of Votann Vehicle unit from your army (excluding Hekaton Land Fortress units) that was hit by one or more of those attacks.","Your unit can make a Normal move of up to D6\".",""],
  ["Secure Positions","Brandfast Oathband","Ruse Stratégique",1,"End of any of your phases.","One Leagues of Votann Transport unit from your army.","One LEAGUES OF VOTANN unit embarked within your TRANSPORT can disembark. When doing so, models in that unit can be set up anywhere on the battlefield wholly within 6\" of your TRANSPORT. That unit cannot declare a charge in the same turn, but can otherwise act normally in the remainder of the turn.",""],
  ["Vengeance Flare","Brandfast Oathband","Ruse Stratégique",2,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One Leagues of Votann Infantry unit that was hit by one or more of those attacks.","Each time you use this Stratagem, you can spend 2YP. Select one friendly Kapricus or Sagitaur unit within 6\" of your INFANTRY unit. If you spent YP during this use of this Stratagem, you can select one friendly Hekaton Land Fortress unit within 6\" of your INFANTRY unit instead. The selected unit can shoot as if it were your Shooting phase. When doing so, models in the selected unit can only target that enemy unit (and only if it is an eligible target).",""],
  ["Augmented Assault","Dêlve Assault Shift","Ruse Stratégique",1,"Your Movement phase.","One Cthonian Beserks unit from your army that has not been selected to move this phase.","Each time you use this Stratagem, you can spend up to 2YP. Until the end of the turn, add X\" to the Move characteristic of models in your unit, where X is the number of YP you spent during this use of this Stratagem, and your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Cyberstimm Infusion","Dêlve Assault Shift","Tactique de Bataille",1,"Fight phase.","One Cthonian Beserks unit from your army that has not been selected to fight this phase.","Each time you use this Stratagem, you can spend 2YP. Until the end of the phase, each time a model in your unit makes an attack, re-roll a Wound roll of 1. If you spent YP during this use of this Stratagem, you can re-roll the Wound roll instead.",""],
  ["Hidden Accessways","Dêlve Assault Shift","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Cthonian Beserks, Hearthkyn Warriors or Hernkyn Yaegirs unit from your army that is not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Tectonic Fracture","Dêlve Assault Shift","Ruse Stratégique",1,"Your Shooting phase, just after a CTHONIAN EARTHSHAKERS unit from your army has shot.","That Cthonian Earthshakers unit.","Each time you use this Stratagem, you can spend 2YP. Select one enemy unit hit by one or more of your unit’s attacks this phase. Until the start of your next Shooting phase, subtract 2 from that unit’s Move characteristic and, if you spent YP during this use of this Stratagem, subtract 2 from Charge rolls made for that unit.",""],
  ["Unstoppable Force","Dêlve Assault Shift","Ruse Stratégique",1,"Fight phase.","One Leagues of Votann unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time your unit Piles In or Consolidates, each model in that unit can move up to 6\" instead of up to 3\".",""],
  ["Weavewërke Buttress","Dêlve Assault Shift","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets, if units from your army have Hostile Acquisition.","One Leagues of Votann Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Wound roll.",""],
  ["Economy of Motion","Farseekers","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged PIONEERS unit.","That PIONEERS unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["No Shot Wasted","Farseekers","",1,"Your Shooting phase, when a friendly HERNKYN unit is selected to shoot.","That HERNKYN unit.","Your unit’s ranged attacks have [LETHAL HITS].",""],
  ["Scornful Analysis","Farseekers","",1,"Start of your Shooting phase.","One friendly HERNKYN unit.","Select one visible enemy unit within 12\" of your unit. Friendly LEAGUES OF VOTANN units’ attacks that target that enemy unit have [IGNORES COVER].",""],
  ["Brëkkeknots","Hearthband","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Kâhl, Ûthar the Destined or Einhyr Hearthguard unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a 4+ invulnerable save.",""],
  ["Fury of the Hearth","Hearthband","Tactique de Bataille",1,"Your Shooting phase.","One Einhyr Hearthguard unit from your army that has not been selected to shoot this phase.","Until the end of the phase, improve the Strength characteristic of ranged weapons equipped by models in your unit by 1. If you spend 1YP, until the end of the phase, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability as well.",""],
  ["Materialisation Matrices","Hearthband","Ruse Stratégique",1,"The Reinforcements step of your Movement phase.","One LEAGUES OF VOTANN unit from your army that is in Reserves and has the Deep Strike ability.","Until the end of the phase, when your unit is set up on the battlefield using the Deep Strike ability, it can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units.","Until the end of the turn, your unit is not eligible to declare a charge."],
  ["Superior Craftsmanship","Hearthband","Tactique de Bataille",2,"Fight phase.","One LEAGUES OF VOTANN unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a MONSTER or VEHICLE unit, add 1 to the Damage characteristic of that attack.",""],
  ["Sure of Purpose","Hearthband","Ruse Stratégique",1,"Fight phase.","One LEAGUES OF VOTANN unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes a Pile-in or Consolidation move, it can move up to 6\" instead of up to 3\".",""],
  ["Unyielding Aggression","Hearthband","Ruse Stratégique",1,"Your Movement phase, just after a LEAGUES OF VOTANN INFANTRY unit from your army Falls Back.","That Leagues of Votann Infantry unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Cogitated Need","Hearthfyre Arsenal","Ruse Stratégique",1,"End of your opponent’s Movement phase.","One Ironkin Steeljacks unit from your army.","Your unit can make a Normal move. When doing so, your unit must end that move as close as possible to the closest objective marker.",""],
  ["Delayed-Fire Rounds","Hearthfyre Arsenal","Équipement",1,"Your Shooting phase, just after a Brôkhyr, Ironkin Steeljacks or Arkanyst Evaluator unit from your army has shot.","That BRÔKHYR, IRONKIN STEELJACKS or ARKANYST EVALUATOR unit.","Select one enemy unit (excluding MONSTERS and VEHICLES) hit by one or more of those attacks. Until the start of your next Shooting phase, each time that enemy unit makes a Normal, Advance or Fall Back move, roll one D6 for each model in that unit: for each 1, that unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",""],
  ["First Concern","Hearthfyre Arsenal","Ruse Stratégique",1,"Your Shooting phase, just after a Brôkhyr, Ironkin Steeljacks or Arkanyst Evaluator unit from your army has shot.","That BRÔKHYR, IRONKIN STEELJACKS or ARKANYST EVALUATOR unit.","If your unit Remained Stationary in your Movement phase this turn, it can make a Normal move.",""],
  ["Preventative Purge","Hearthfyre Arsenal","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Fall Back move.","One Brôkhyr Thunderkyn or Ironkin Steeljacks unit from your army.","Your unit can shoot as if it were your Shooting phase. When doing so, models in your unit can only target that enemy unit (and only if it is an eligible target) and each time a model in your unit makes an attack, subtract 1 from the Hit roll.",""],
  ["Unwavering Accuracy","Hearthfyre Arsenal","Tactique de Bataille",2,"Your Shooting phase.","One Brôkhyr Thunderkyn unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack, you can ignore any or all modifiers to the following: that attack’s Ballistic Skill characteristic; the Hit roll; the Wound roll; that attack’s Armour Penetration characteristic.",""],
  ["Wall of Steel","Hearthfyre Arsenal","Tactique de Bataille",1,"Your Charge phase, just after an Ironkin Steeljacks unit from your army ends a Charge move.","That IRONKIN STEELJACKS unit.","Each time you use this Stratagem, you can spend 2YP. Select one enemy unit (excluding MONSTERS and VEHICLES) within Engagement Range of your unit and roll one D6 for each model in your unit, rolling two additional D6 if you spent YP during this use of this Stratagem: for each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",""],
  ["Brëkkeknots","Hearthguard Covenant","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly EINHYR HEARTHGUARD unit.","That EINHYR HEARTHGUARD unit.","Your unit has 4+ InSv.",""],
  ["Fury of the Hearth","Hearthguard Covenant","",1,"Your Shooting phase, when a friendly EINHYR HEARTHGUARD unit is selected to shoot.","That EINHYR HEARTHGUARD unit.","Your unit’s ranged attacks have: ▪ +1 S. ▪ If you spend 1 YP, [SUSTAINED HITS 1].",""],
  ["Materialisation Matrices","Hearthguard Covenant","",1,"Your Movement phase, when a friendly EINHYR HEARTHGUARD unit with Deep Strike is selected to make an ingress move.","That EINHYR HEARTHGUARD unit.","▪ Your unit can be set up anywhere on the battlefield that is more than 6\" horizontally from all enemy units, even if that is within your opponent’s deployment zone. ▪ Your unit is not eligible to declare a charge until the end of the turn.",""],
  ["Auxiliary Contract","Mercenary Oathband","Ruse Stratégique",1,"Your Shooting phase or the Fight phase.","One Leagues of Votann Infantry or Leagues of Votann Mounted unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, weapons equipped by models in your unit have the [PRECISION] ability.",""],
  ["Grand Artifice","Mercenary Oathband","Ruse Stratégique",1,"Your Movement phase, just after a LEAGUES OF VOTANN unit from your army Falls Back.","That LEAGUES OF VOTANN unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Mobile Exploitation","Mercenary Oathband","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Hernkyn unit from your army that is not within Engagement Range of one or more enemy units. Alternatively, you can spend 2YP and target up to two HERNKYN units from your army that are not within Engagement Range of one or more enemy units instead.","Remove your units from the battlefield and place them into Strategic Reserves.",""],
  ["New Horizons","Mercenary Oathband","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Leagues of Votann Infantry unit from your army that is not within Engagement range of one or more enemy units and one friendly Transport it is able to embark within.","If your LEAGUES OF VOTANN unit is wholly within 6\" of that TRANSPORT, it can embark within it.",""],
  ["Optimal Expenditure","Mercenary Oathband","Équipement",1,"The Fight phase.","One Leagues of Votann Infantry unit from your army that has not been selected to fight this phase.","Each time you use this Stratagem, you can spend 3YP. Until the end of the phase, each time a model in your unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1. If you spent YP during this usage of this Stratagem, you can re-roll a Hit roll of 1 and re-roll the Wound roll instead.",""],
  ["Privateer Arsenal","Mercenary Oathband","Équipement",1,"Your Shooting phase.","One Leagues of Votann Infantry unit from your army that has not been selected to shoot this phase.","Each time you use this Stratagem, you can spend 3YP. Until the end of the phase, each time a model in your unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1. If you spent YP during this usage of this Stratagem, you can re-roll the Hit roll and re-roll a Wound roll of 1 instead.",""],
  ["Ancestral Sentence","Needgaârd Oathband","Tactique de Bataille",1,"Your Shooting phase.","One LEAGUES OF VOTANN unit from your army that has not been selected to shoot this phase.","Each time you use this Stratagem, you can spend 3YP. Until the end of the phase, ranged weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability. If you spent YP during this use of this Stratagem, until the end of the phase, those weapons have the [SUSTAINED HITS 2] ability instead.",""],
  ["Honour of the Hold","Needgaârd Oathband","Tactique de Bataille",1,"Fight phase.","One LEAGUES OF VOTANN unit from your army that has not been selected to fight this phase.","Each time you use this Stratagem, you can spend 3YP. Select one enemy unit within Engagement Range of your unit. Until the end of the phase, each time a model in your unit makes a melee attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. If you spent YP during this use of this Stratagem, improve the Armour Penetration characteristic of that attack by 2 instead.",""],
  ["Huntr’s Mark","Needgaârd Oathband","Tactique de Bataille",1,"Your Shooting phase.","One LEAGUES OF VOTANN unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",""],
  ["Ordered Retreat","Needgaârd Oathband","Ruse Stratégique",1,"Your Movement phase, just after a LEAGUES OF VOTANN unit from your army Falls Back.","That LEAGUES OF VOTANN unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Reactive Reprisal","Needgaârd Oathband","Ruse Stratégique",2,"Your opponent’s Shooting phase, just after an enemy unit has shot, if units from your army have Fortify Takeover.","One LEAGUES OF VOTANN unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Your unit can shoot as if it were your Shooting phase, can only target that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.",""],
  ["Void Hardened","Needgaârd Oathband","Équipement",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets, if units from your army have Fortify Takeover.","One LEAGUES OF VOTANN unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Adaptable Avarice","Persecution Prospect","Ruse Stratégique",1,"Start of any phase, if units from your army have Fortify Takeover.","One Leagues of Votann Character unit from your army.","Each time you use this Stratagem, you can spend any number of YP. Once you have done so, if you have 6 or fewer YP, until the start of your next turn, units from your army have Hostile Acquisition instead.",""],
  ["Claimstaker Reflex","Persecution Prospect","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One LEAGUES OF VOTANN unit from your army (excluding Artillery and Vehicle units) that is within 8\" of that enemy unit.","Each time you use this Stratagem, you can spend 2YP. Your unit can make a Normal move of up to D6\". If you spent YP during this use of this Stratagem, your unit can make a Normal move of up to 6\" instead.","A unit cannot embark within a Transport as part of this move."],
  ["Dispersed Formation","Persecution Prospect","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Leagues of Votann Infantry or Leagues of Votann Mounted unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit has the Stealth ability and each time a ranged attack targets your unit, models in your unit have the Benefit of Cover against that attack.",""],
  ["Exposed Flaws","Persecution Prospect","Tactique de Bataille",1,"Your Shooting phase.","One Hernkyn unit from your army that has not been selected to shoot this phase.","Each time you use this Stratagem, you can spend 2YP. Until the end of the phase, each time a model in your unit makes an attack, if you spent YP during this use of this Stratagem and/or if that attack targets an assailed unit, you can re-roll the Wound roll.",""],
  ["Frontier Momentum","Persecution Prospect","Tactique de Bataille",1,"Your Movement phase.","One Hernkyn unit from your army that has not been selected to move this phase.","Until the end of the phase, if your unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in your unit.",""],
  ["Ranger Tactics","Persecution Prospect","Tactique de Bataille",1,"Your Shooting phase.","One LEAGUES OF VOTANN unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack, if that attack targets an assailed unit and/or if your unit has the Hernkyn keyword, you can re-roll the Hit roll.",""],
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
  "Hekaton Land Fortress",
  "Kapricus Carrier",
  "Kapricus Defenders",
  "Sagitaur"
 ],
 "monster": [],
 "battleline": [
  "Hearthkyn Warriors"
 ],
 "epic": [
  "Berehk Stornbröw",
  "Buri Aegnirssen",
  "Ûthar the Destined"
 ],
 "infantry": [
  "Brôkhyr Thunderkyn",
  "Cthonian Beserks",
  "Cthonian Earthshakers",
  "Einhyr Hearthguard",
  "Hernkyn Yaegirs",
  "Ironkin Steeljacks with Heavy Volkanite Disintegrators",
  "Ironkin Steeljacks with Melee Weapons"
 ],
 "character": [
  "Arkanyst Evaluator",
  "Brôkhyr Iron-master",
  "Einhyr Champion",
  "Grimnyr",
  "Kâhl",
  "Memnyr Strategist"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Ûthar the Destined": "40",
 "Hearthkyn Warriors": "28.5",
 "Kâhl": "40",
 "Einhyr Champion": "40",
 "Grimnyr": "40",
 "Brôkhyr Iron-master": "32",
 "Einhyr Hearthguard": "32",
 "Cthonian Beserks": "28.5",
 "Hernkyn Pioneers": "90x52.5",
 "Sagitaur": "coque",
 "Brôkhyr Thunderkyn": "40",
 "Hekaton Land Fortress": "coque",
 "Hernkyn Yaegirs": "28.5",
 "Buri Aegnirssen": "40",
 "Memnyr Strategist": "32",
 "Arkanyst Evaluator": "32",
 "Kapricus Defenders": "105x70",
 "Kapricus Carrier": "105x70",
 "Ironkin Steeljacks with Heavy Volkanite Disintegrators": "40",
 "Ironkin Steeljacks with Melee Weapons": "40",
 "Cthonian Earthshakers": "80",
 "Berehk Stornbröw": "40"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Hekaton Land Fortress": 5
};

const TRANSPORTS = {
 "Sagitaur": "This model has a transport capacity of 6 **LEAGUES OF VOTANN INFANTRY **models. It cannot transport **ARTILLERY, EXOARMOUR, EXOFRAME** or **IRONKIN STEELJACKS** models.\n\nAt the start of the Declare Battle Formations step, you can select one ^^**Hearthkyn Warriors^^** unit from your army that has not been split. If you do, that unit is split into two units, each containing as equal a number of models as possible (when splitting a unit in this way, make a note of which models form each of the two new units). One of these units must start the battle embarked within this ^^**Transport^^**; the other can start the battle embarked within another ^^**Transport^^**, or it can be deployed as a separate unit.",
 "Hekaton Land Fortress": "This model has a transport capacity of 14 **LEAGUES OF VOTANN INFANTRY **models. Each **EXOARMOUR, EXOFRAME** or **IRONKIN STEELJACKS** model takes up the space of 2 models. It cannot transport **ARTILLERY** models.",
 "Kapricus Carrier": "This model has a transport capacity of 5 ^^**Hernkyn Yaegir**^^ models.\n\nAt the start of the Declare Battle Formations step, you can select one ^^**Hernkyn Yaegir^^** unit from your army that has not been split. If you do, that unit is split into two units, each containing as equal a number of models as possible (when splitting a unit in this way, make a note of which models form each of the two new units). One of these units must start the battle embarked within this ^^**Transport^^**; the other can start the battle embarked within another ^^**Transport^^**, or it can be deployed as a separate unit."
};
const FACTION = [
 [
  "Prioritised Efficiency",
  "If your Army Faction is Leagues of Votann, Leagues of Votann units from your army have one of two abilities: Hostile Acquisition or Fortify Takeover (see below). During the battle, which ability those Leagues of Votann units have will change depending on how many Yield points (YP) you currently have:\n- At the start of the battle, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have fewer than 7YP, your units have Hostile Acquisition until the start of your next Command phase.\n\n- At the end of your Command phase, if you have 7YP or more, your units have Fortify Takeover until the start of your next Command phase.\n\nHostile Acquisition\n- Each time a model in this unit makes an attack that targets an enemy unit within range of one or more objective markers, add 1 to the Hit roll.\n\n- You can re-roll Advance and Charge rolls made for this unit.\n\nFortify Takeover\n- Each time a model in this unit makes an attack that targets an enemy unit, if this unit is within range of one or more objective markers you control, add 1 to the Hit roll.\n\n- Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic and this unit is not a Vehicle, subtract 1 from the Wound roll.\n\n\nYield Points\nAt the end of each player’s Command phase, you gain 1YP if you control one or more objective markers within your deployment zone, and, from the second battle round onwards, you gain 1 additional YP for each of the following conditions you satisfy:\nYou control one or more objective markers not within your deployment zone.\nYou control two or more objective markers not within your deployment zone.\nYou control more objective markers than your opponent.\n\n\nIn your turn, YP gained in this way are always gained before checking which ability Leagues of Votann units from your army have.\n\n\nWhenever a rule allows you to spend YP, reduce the number of YP you have by that amount (your YP cannot go below 0), otherwise you cannot use that rule."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/votann.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */

/* Vides, faute de câblage : voir l'en-tête. */
const ARMEMENT = {};
const STRAT_SIMU = [];
const APTIS_CIBLE = {};
const RETINUE = {};
const ENH_ANCIENS = {};
const GRPN = {};
const MOMENTS = {};
const MOMENTS_ARMEE = [];
const COMPO = {};
const ROLES_UNITE = {};
const OCTROIS_DETACH = {};
const APTIS_UNITE = {};
const APTIS_COND = {};
const AURAS_ARMEE = [];
const AURAS_PERSO = {};

enregistreFaction({
  cle : "votann",
  nom : "Ligues de Votann",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
