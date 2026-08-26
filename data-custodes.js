/* ============================================================
   Données Adeptus Custodes — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py custodes

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 56 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     31 fiches sur 31 en ont un. Les autres — des Legends, que le
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
  ["Agamatus Custodians",12,6,2,4,4,[3, 6],{"3": 225, "6": 450},0,"",0,"",2,"6+"],
  ["Aleya",6,3,3,5,4,[1],{"1": 55},0,"Meneur",0,"",1,"6+"],
  ["Allarus Custodians",5,7,2,4,4,[2, 3, 5, 6],{"2": 110, "3": 165, "5": 275, "6": 330},0,"",0,"",2,"6+"],
  ["Anathema Psykana Rhino",12,9,3,0,10,[1],[[1, {"1": 65}], [4, {"1": 75}]],0,"",0,"",2,"6+"],
  ["Aquilon Custodians",5,7,2,4,4,[3, 6],{"3": 195, "6": 390},0,"",0,"",2,"6+"],
  ["Ares Gunship",0,12,2,5,22,[1],[[1, {"1": 580}], [2, {"1": 610}]],0,"",0,"",0,"6+"],
  ["Blade Champion",6,6,2,4,6,[1],[[1, {"1": 110}], [2, {"1": 125}]],0,"Meneur",0,"",2,"6+"],
  ["Caladius Grav-tank",10,11,2,5,14,[1],[[1, {"1": 210}], [3, {"1": 225}]],0,"",0,"",4,"6+"],
  ["Contemptor-Achillus Dreadnought",6,9,2,5,10,[1],[[1, {"1": 155}], [3, {"1": 170}]],0,"",0,"",3,"6+"],
  ["Contemptor-Galatus Dreadnought",6,9,2,4,10,[1],[[1, {"1": 165}], [3, {"1": 180}]],0,"",0,"",3,"6+"],
  ["Coronus Grav-carrier",12,12,2,5,16,[1],[[1, {"1": 180}], [3, {"1": 200}]],0,"",0,"",5,"6+"],
  ["Custodian Guard",6,6,2,4,3,[4, 5],[[1, {"4": 170, "5": 215}], [4, {"4": 180, "5": 225}]],0,"",0,"",2,"6+"],
  ["Custodian Guard with Adrasite and Pyrithite spears",6,6,2,4,3,[5],[[1, {"5": 250}], [4, {"5": 260}]],0,"",0,"",2,"6+"],
  ["Custodian Wardens",6,6,2,4,3,[4, 5],[[1, {"4": 200, "5": 250}], [2, {"4": 220, "5": 270}]],0,"",0,"",2,"6+"],
  ["Knight-Centura",6,3,3,5,4,[1],{"1": 55},0,"Meneur",0,"",1,"6+"],
  ["Orion Assault Dropship",20,12,2,5,22,[1],[[1, {"1": 690}], [2, {"1": 740}]],0,"",0,"",0,"6+"],
  ["Pallas Grav-attack",12,8,2,5,9,[1],{"1": 100},0,"",0,"",2,"6+"],
  ["Prosecutors",6,3,3,0,1,[4, 5, 9, 10],{"4": 45, "5": 50, "9": 75, "10": 85},0,"",0,"",2,"6+"],
  ["Sagittarum Custodians",6,6,2,4,3,[5],{"5": 225},0,"",0,"",2,"6+"],
  ["Shield-Captain",6,6,2,4,6,[1],{"1": 110},0,"Meneur",0,"",2,"6+"],
  ["Shield-Captain in Allarus Terminator Armour",5,7,2,4,7,[1],{"1": 130},0,"Meneur",0,"",2,"6+"],
  ["Shield-Captain on Dawneagle Jetbike",12,7,2,4,8,[1],{"1": 140},0,"Meneur",0,"",2,"6+"],
  ["Telemon Heavy Dreadnought",8,10,2,4,12,[1],[[1, {"1": 225}], [2, {"1": 245}]],0,"",0,"",4,"6+"],
  ["Trajann Valoris",6,6,2,4,7,[1],{"1": 135},0,"Meneur",0,"",2,"5+"],
  ["Valerian",6,6,2,4,6,[1],{"1": 110},0,"Meneur",0,"",2,"6+"],
  ["Venatari Custodians",10,6,2,4,3,[3, 6],[[1, {"3": 150, "6": 300}], [3, {"3": 160, "6": 310}]],0,"",0,"",2,"6+"],
  ["Venerable Contemptor Dreadnought",6,9,2,5,10,[1],[[1, {"1": 170}], [3, {"1": 185}]],0,"",0,"",3,"6+"],
  ["Venerable Land Raider",10,12,2,0,16,[1],[[1, {"1": 220}], [2, {"1": 240}]],0,"",0,"",5,"6+"],
  ["Vertus Praetors",12,7,2,4,5,[2, 3],{"2": 145, "3": 215},0,"",0,"",2,"6+"],
  ["Vigilators",6,3,3,0,1,[4, 5, 9, 10],{"4": 50, "5": 55, "9": 90, "10": 100},0,"",0,"",1,"6+"],
  ["Witchseekers",6,3,3,0,1,[4, 5, 9, 10],{"4": 50, "5": 55, "9": 90, "10": 100},0,"",0,"",1,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Agamatus Custodians","Adrathic devastator","T","1",2,7,2,"3","","18\""],
  ["Agamatus Custodians","Lastrum bolt cannon","T","3",2,6,1,"1","sust:1","36\""],
  ["Agamatus Custodians","Twin las-pulsar","T","2",2,9,1,"2","twin","24\""],
  ["Agamatus Custodians","Interceptor Lance","C","5",2,7,2,"2","lance","càc"],
  ["Aleya","Somnus","C","4",2,6,3,"3","anti:5 dev","càc"],
  ["Allarus Custodians","Balistus grenade launcher","T","D6",2,4,1,"1","blast","18\""],
  ["Allarus Custodians","Castellan axe (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Allarus Custodians","Guardian Spear (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Allarus Custodians","Castellan axe (càc)","C","4",2,9,1,"3","","càc"],
  ["Allarus Custodians","Guardian Spear (càc)","C","5",2,7,2,"2","","càc"],
  ["Allarus Custodians","Misericordia","C","5",2,5,2,"1","","càc"],
  ["Anathema Psykana Rhino","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Anathema Psykana Rhino","Storm Bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Anathema Psykana Rhino","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Aquilon Custodians","Infernus firepike","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Aquilon Custodians","Lastrum storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Aquilon Custodians","Twin adrathic destructor","T","1",2,6,2,"3","twin","18\""],
  ["Aquilon Custodians","Solerite power gauntlet","C","5",2,8,2,"2","","càc"],
  ["Aquilon Custodians","Solerite power talon","C","7",2,7,2,"1","","càc"],
  ["Ares Gunship","Arachnus heavy blaze cannon","T","4",2,12,3,"D6+1","","36\""],
  ["Ares Gunship","Arachnus magna-blaze cannon","T","3",2,18,4,"D6+6","","48\""],
  ["Ares Gunship","Armoured hull","C","9",4,9,0,"1","","càc"],
  ["Blade Champion","➤ Vaultswords - Behemor","C","6",2,7,2,"2","precision","càc"],
  ["Blade Champion","➤ Vaultswords - Hurricanis","C","9",2,5,1,"1","sust:1","càc"],
  ["Blade Champion","➤ Vaultswords - Victus","C","5",2,6,3,"3","dev","càc"],
  ["Caladius Grav-tank","Twin arachnus heavy blaze cannon","T","4",2,12,3,"D6+2","twin","48\""],
  ["Caladius Grav-tank","Twin iliastus accelerator cannon","T","4",2,10,1,"3","rf:4 twin","48\""],
  ["Caladius Grav-tank","Twin lastrum bolt cannon","T","3",2,6,1,"1","sust:1","36\""],
  ["Caladius Grav-tank","Armoured hull","C","4",4,6,0,"1","","càc"],
  ["Contemptor-Achillus Dreadnought","Achillus dreadspear (tir)","T","1",2,9,2,"3","","12\""],
  ["Contemptor-Achillus Dreadnought","Infernus incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Contemptor-Achillus Dreadnought","Lastrum storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Contemptor-Achillus Dreadnought","Twin adrathic destructor","T","1",2,6,2,"3","twin","18\""],
  ["Contemptor-Achillus Dreadnought","Achillus dreadspear (càc)","C","5",2,12,2,"D6+1","lance","càc"],
  ["Contemptor-Galatus Dreadnought","Galatus warblade (tir)","T","D6",0,6,1,"1","ignorescover torrent twin","12\""],
  ["Contemptor-Galatus Dreadnought","Galatus warblade (càc)","C","8",2,8,2,"3","","càc"],
  ["Coronus Grav-carrier","Twin arachnus blaze cannon","T","8",2,5,1,"1","dev twin","24\""],
  ["Coronus Grav-carrier","Twin lastrum bolt cannon","T","3",2,6,1,"1","sust:1","36\""],
  ["Coronus Grav-carrier","Armoured hull","C","6",4,8,0,"1","","càc"],
  ["Custodian Guard","Guardian Spear (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Custodian Guard","Sentinel Blade (tir)","T","2",2,4,1,"2","assault pistol","12\""],
  ["Custodian Guard","Guardian Spear (càc)","C","5",2,7,2,"2","","càc"],
  ["Custodian Guard","Misericordia","C","5",2,5,2,"1","","càc"],
  ["Custodian Guard","Sentinel Blade (càc)","C","5",2,6,2,"1","","càc"],
  ["Custodian Guard with Adrasite and Pyrithite spears","Adrasite spear (tir)","T","1",2,5,2,"3","","18\""],
  ["Custodian Guard with Adrasite and Pyrithite spears","Pyrithite spear (tir)","T","1",2,9,4,"D6","melta:2","12\""],
  ["Custodian Guard with Adrasite and Pyrithite spears","Adrasite spear (càc)","C","5",2,7,2,"2","","càc"],
  ["Custodian Guard with Adrasite and Pyrithite spears","Pyrithite spear (càc)","C","5",2,7,2,"2","","càc"],
  ["Custodian Wardens","Castellan axe (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Custodian Wardens","Guardian Spear (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Custodian Wardens","Castellan axe (càc)","C","4",2,9,1,"3","","càc"],
  ["Custodian Wardens","Guardian Spear (càc)","C","5",2,7,2,"2","","càc"],
  ["Knight-Centura","Master-crafted boltgun","T","1",2,4,0,"2","rf:1","24\""],
  ["Knight-Centura","Witchseeker flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Knight-Centura","Close combat weapon","C","3",2,3,0,"1","","càc"],
  ["Knight-Centura","Executioner Greatblade","C","3",2,5,2,"2","anti:5 dev","càc"],
  ["Orion Assault Dropship","Arachnus heavy blaze cannon","T","4",2,12,3,"D6+1","","36\""],
  ["Orion Assault Dropship","Spiculus heavy bolt launcher","T","D6+6",2,7,1,"2","blast","36\""],
  ["Orion Assault Dropship","Twin lastrum bolt cannon","T","3",2,6,1,"1","sust:1","36\""],
  ["Orion Assault Dropship","Armoured hull","C","9",4,9,0,"1","","càc"],
  ["Pallas Grav-attack","Twin arachnus blaze cannon","T","8",2,5,1,"1","dev twin","24\""],
  ["Pallas Grav-attack","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Prosecutors","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Prosecutors","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Sagittarum Custodians","Adrastus bolt caliver","T","3",2,5,1,"2","sust:1","36\""],
  ["Sagittarum Custodians","Misericordia","C","4",2,5,2,"1","","càc"],
  ["Shield-Captain","Castellan axe (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Shield-Captain","Guardian Spear (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Shield-Captain","Pyrithite Spear (tir)","T","1",2,9,4,"D6","melta:2","12\""],
  ["Shield-Captain","Sentinel Blade (tir)","T","2",2,4,1,"2","assault pistol","12\""],
  ["Shield-Captain","Castellan axe (càc)","C","6",2,9,1,"3","","càc"],
  ["Shield-Captain","Guardian Spear (càc)","C","7",2,7,2,"2","","càc"],
  ["Shield-Captain","Pyrithite Spear (càc)","C","7",2,7,2,"2","","càc"],
  ["Shield-Captain","Sentinel Blade (càc)","C","7",2,6,2,"1","","càc"],
  ["Shield-Captain in Allarus Terminator Armour","Balistus grenade launcher","T","D6",2,4,1,"1","blast","18\""],
  ["Shield-Captain in Allarus Terminator Armour","Castellan axe (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Shield-Captain in Allarus Terminator Armour","Guardian Spear (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Shield-Captain in Allarus Terminator Armour","Castellan axe (càc)","C","6",2,9,1,"3","","càc"],
  ["Shield-Captain in Allarus Terminator Armour","Guardian Spear (càc)","C","7",2,7,2,"2","","càc"],
  ["Shield-Captain on Dawneagle Jetbike","Salvo launcher","T","1",2,10,3,"D6+1","twin","24\""],
  ["Shield-Captain on Dawneagle Jetbike","Vertus hurricane bolter","T","3",2,4,1,"2","rf:3 twin","18\""],
  ["Shield-Captain on Dawneagle Jetbike","Interceptor lance","C","6",2,7,2,"2","lance","càc"],
  ["Telemon Heavy Dreadnought","Arachnus storm cannon","T","12",2,6,1,"1","dev","24\""],
  ["Telemon Heavy Dreadnought","Iliastus accelerator culverin","T","4",2,9,1,"3","","48\""],
  ["Telemon Heavy Dreadnought","Spiculus bolt launcher","T","D6+3",2,5,0,"1","blast","36\""],
  ["Telemon Heavy Dreadnought","Twin plasma projector","T","D3",0,7,2,"1","torrent twin","12\""],
  ["Telemon Heavy Dreadnought","Armoured feet","C","5",2,7,0,"1","","càc"],
  ["Telemon Heavy Dreadnought","Telemon Caestus","C","5",2,12,2,"3","","càc"],
  ["Trajann Valoris","Eagle's Scream","T","2",2,5,2,"3","assault","24\""],
  ["Trajann Valoris","Watcher's Axe","C","6",2,10,2,"3","","càc"],
  ["Valerian","Gnosis (tir)","T","3",2,4,1,"2","assault","24\""],
  ["Valerian","Gnosis (càc)","C","7",2,8,3,"2","","càc"],
  ["Venatari Custodians","Kinetic destroyer","T","2",2,6,1,"1","pistol sust:1","12\""],
  ["Venatari Custodians","Venatari lance (tir)","T","2",2,4,1,"2","assault","24\""],
  ["Venatari Custodians","Tarsis buckler","C","5",2,5,2,"1","","càc"],
  ["Venatari Custodians","Venatari lance (càc)","C","5",2,7,2,"2","lance","càc"],
  ["Venerable Contemptor Dreadnought","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Venerable Contemptor Dreadnought","Kheres-pattern assault cannon","T","6",2,7,1,"1","dev","24\""],
  ["Venerable Contemptor Dreadnought","Multi-melta","T","2",2,9,4,"D6","melta:2","18\""],
  ["Venerable Contemptor Dreadnought","Contemptor combat weapon","C","5",2,12,2,"3","","càc"],
  ["Venerable Land Raider","Godhammer lascannon","T","2",2,12,3,"D6+1","","48\""],
  ["Venerable Land Raider","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Venerable Land Raider","Storm bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Venerable Land Raider","Twin heavy bolter","T","3",2,5,1,"2","sust:1 twin","36\""],
  ["Venerable Land Raider","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Vertus Praetors","Salvo launcher","T","1",2,10,3,"D6+1","twin","24\""],
  ["Vertus Praetors","Vertus hurricane bolter","T","3",2,4,1,"2","rf:3 twin","18\""],
  ["Vertus Praetors","Interceptor lance","C","5",2,7,2,"2","lance","càc"],
  ["Vigilators","Executioner greatblade","C","2",3,5,2,"2","anti:5 dev","càc"],
  ["Witchseekers","Witchseeker flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Witchseekers","Close combat weapon","C","2",3,3,0,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Agamatus Custodians","Monté"],
  ["Aleya","Epic Hero"],
  ["Allarus Custodians","Infanterie"],
  ["Anathema Psykana Rhino","Véhicule"],
  ["Aquilon Custodians","Infanterie"],
  ["Ares Gunship","Véhicule"],
  ["Blade Champion","Personnage"],
  ["Caladius Grav-tank","Véhicule"],
  ["Contemptor-Achillus Dreadnought","Véhicule"],
  ["Contemptor-Galatus Dreadnought","Véhicule"],
  ["Coronus Grav-carrier","Véhicule"],
  ["Custodian Guard","Battleline"],
  ["Custodian Guard with Adrasite and Pyrithite spears","Infanterie"],
  ["Custodian Wardens","Infanterie"],
  ["Knight-Centura","Personnage"],
  ["Orion Assault Dropship","Véhicule"],
  ["Pallas Grav-attack","Véhicule"],
  ["Prosecutors","Infanterie"],
  ["Sagittarum Custodians","Infanterie"],
  ["Shield-Captain","Personnage"],
  ["Shield-Captain in Allarus Terminator Armour","Personnage"],
  ["Shield-Captain on Dawneagle Jetbike","Personnage"],
  ["Telemon Heavy Dreadnought","Véhicule"],
  ["Trajann Valoris","Epic Hero"],
  ["Valerian","Epic Hero"],
  ["Venatari Custodians","Infanterie"],
  ["Venerable Contemptor Dreadnought","Véhicule"],
  ["Venerable Land Raider","Véhicule"],
  ["Vertus Praetors","Monté"],
  ["Vigilators","Infanterie"],
  ["Witchseekers","Infanterie"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Aleya": [
  "Prosecutors",
  "Vigilators",
  "Witchseekers"
 ],
 "Blade Champion": [
  "Custodian Guard",
  "Custodian Guard with Adrasite and Pyrithite spears",
  "Custodian Wardens",
  "Sagittarum Custodians"
 ],
 "Knight-Centura": [
  "Prosecutors",
  "Vigilators",
  "Witchseekers"
 ],
 "Shield-Captain": [
  "Custodian Guard",
  "Custodian Guard with Adrasite and Pyrithite spears",
  "Custodian Wardens",
  "Sagittarum Custodians"
 ],
 "Shield-Captain in Allarus Terminator Armour": [
  "Allarus Custodians",
  "Aquilon Custodians"
 ],
 "Shield-Captain on Dawneagle Jetbike": [
  "Agamatus Custodians",
  "Vertus Praetors"
 ],
 "Trajann Valoris": [
  "Custodian Guard",
  "Custodian Guard with Adrasite and Pyrithite spears",
  "Custodian Wardens",
  "Sagittarum Custodians"
 ],
 "Valerian": [
  "Custodian Guard",
  "Custodian Guard with Adrasite and Pyrithite spears",
  "Custodian Wardens",
  "Sagittarum Custodians"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Aleya": [
  [
   "Tactical Perception",
   "While this model is leading a unit, models in that unit have the Fights First ability."
  ],
  [
   "Tenacious Spirit",
   "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll if that unit is below its Starting Strength, and add 1 to the Wound roll as well if that unit is Below Half-strength."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n■ Prosecutors\n■ Vigilators\n■ Witchseekers"
  ],
  [
   "Daughter of the Abyss",
   "This model has the Feel No Pain 3+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "Ceaseless Vigilance",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is nulled: \n- While a unit is nulled, that unit has +3\" detection range."
  ]
 ],
 "Allarus Custodians": [
  [
   "Slayers of Tyrants",
   "Each time a model in this unit makes an attack that targets a Character, Monster or Vehicle unit, you can re-roll the Wound roll."
  ],
  [
   "From Golden Light",
   "Once per battle, at the end of your opponent's turn, if this unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Vexilla",
   "Add 1 to the Objective Control characteristic of models in the bearer's unit."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Anathema Psykana Rhino": [
  [
   "Self Repair",
   "At the start of your Command phase, this model regains 1 lost wound."
  ],
  [
   "Daughter of the Abyss",
   "This model has the Feel No Pain 3+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "Ceaseless Vigilance",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is nulled: \n- While a unit is nulled, that unit has +3\" detection range."
  ]
 ],
 "Blade Champion": [
  [
   "Leader",
   "This model can be attached to the following units:\n- Custodian Guard\n- Custodian Guard with Adrasite and Pyrithite Spears\n- Custodian Wardens\n- Sagittarum Custodians"
  ],
  [
   "Martial Inspiration",
   "Once per battle, in your Charge phase, this model's unit is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Swift Onslaught",
   "While this model is leading a unit, you can re-roll Charge rolls made for that unit."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Custodian Guard": [
  [
   "Stand Vigil",
   "Each time a model in this unit makes an attack, re-roll a Wound roll of 1. While this unit is within range of an objective marker you control, you can re-roll the Wound roll instead."
  ],
  [
   "Sentinel Storm",
   "Once per battle, in your Shooting phase, after the unit has shot, it can shoot again."
  ],
  [
   "Praesidium Shield",
   "Add 1 to the bearer's Wounds characteristic."
  ],
  [
   "Vexilla",
   "Add 1 to the Objective Control characteristic of models in the bearer's unit."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Custodian Wardens": [
  [
   "Resolute Will",
   "While a CHARACTER is leading this unit, each time an attack targets this unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of this unit, subtract 1 from the Wound roll."
  ],
  [
   "Living Fortress",
   "Once per battle, at the start of any phase, this unit can use this ability. If it does, until the end of the phase, models in this unit have the Feel No Pain 4+ ability."
  ],
  [
   "Vexilla",
   "Add 1 to the Objective Control characteristic of models in the bearer’s unit."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Knight-Centura": [
  [
   "Leader",
   "This model can be attached to the following units:\n- Prosecutors\n- Vigilators\n- Witchseekers"
  ],
  [
   "Seeker's Instincts",
   "While this model is leading a unit, add 2\" to the Move characteristic of models in that unit and add 2 to Advance and Charge rolls made for that unit."
  ],
  [
   "Corner the Quarry",
   "Each time an enemy unit (excluding MONSTERS and VEHICLES) that is within Engagement Range of this model’s unit Falls Back, all models in that enemy unit must take a Desperate Escape test. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those tests."
  ],
  [
   "Daughter of the Abyss",
   "This model has the Feel No Pain 3+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "Ceaseless Vigilance",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is nulled: \n- While a unit is nulled, that unit has +3\" detection range."
  ]
 ],
 "Prosecutors": [
  [
   "Purity of Execution",
   "Each time a model in this unit makes a ranged attack that targets a Psyker unit, that attack has the [PRECISION] and [DEVASTATING WOUNDS] abilities."
  ],
  [
   "Daughters of the Abyss",
   "Models in this unit have the Feel No Pain 3+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "Ceaseless Vigilance",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is nulled: \n- While a unit is nulled, that unit has +3\" detection range."
  ]
 ],
 "Shield-Captain": [
  [
   "Master of the Stances",
   "Once per battle, when this model's unit is selected to fight, it can use this ability. If it does, until that fight is resolved, both Ka'tah Stances are active for that unit, instead of only one."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Custodian Guard\n- Custodian Guard with Adrasite and Pyrithite Spears\n- Custodian Wardens\n- Sagittarum Custodians"
  ],
  [
   "Strategic Mastery",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Praesidium Shield",
   "Add 1 to the bearer's Wounds characteristic."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Shield-Captain in Allarus Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units:\n- Allarus Custodians\n- Aquilon Custodians"
  ],
  [
   "Auramite and Adamantite",
   "Once per battle, at the start of any phase, this model can use this ability. If it does, until the end of the phase, each time an attack is allocated to this model, change the Damage characteristic of that attack to 1."
  ],
  [
   "Strategic Mastery",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Shield-Captain on Dawneagle Jetbike": [
  [
   "Leader",
   "This model can be attached to the following units:\n- Agamatus Custodians\n- Vertus Praetors"
  ],
  [
   "Sweeping Advance",
   "Once per battle, at the end of the Fight phase, if this model's unit fought this phase, if it is within Engagement Range of one or more enemy units, it can make a Fall Back move or, if it is not within Engagement Range of one or more enemy units, it can make a Normal move."
  ],
  [
   "Strategic Mastery",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Trajann Valoris": [
  [
   "Feel No Pain",
   "5+"
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Custodian Guard\n- Custodian Guard with Adrasite and Pyrithite Spears\n- Custodian Wardens\n- Sagittarum Custodians"
  ],
  [
   "Captain-General",
   "While this model is leading a unit, each time a model in that unit makes an attack, you can ignore any or all modifiers to that attack's Ballistic Skill or Weapon Skill characteristics and/or all modifiers to the Hit roll."
  ],
  [
   "Moment Shackle",
   "Once per battle, at the start of the Fight phase, you can select one of the following to take effect until the end of the phase:\n■ This model's Watcher's Axe melee weapon has an Attacks characteristic of 12.\n■ This model has a 2+ invulnerable save."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Valerian": [
  [
   "Leader",
   "This model can be attached to the following units:\n- Custodian Guard\n- Custodian Guard with Adrasite and Pyrithite Spears\n- Custodian Wardens\n- Sagittarum Custodians"
  ],
  [
   "Golden Laurels",
   "While this model is leading a unit, each time a melee attack targets that unit, worsen that Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Hero of Lion's Gate",
   "Once per battle, after making a Hit roll, Wound roll or saving throw for this model, you can change the result of that roll to an unmodified 6."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Venerable Contemptor Dreadnought": [
  [
   "Unyielding Ancient",
   "The first time this model is destroyed, remove it from play without resolving its Deadly Demise ability. Then, at the end of the phase, roll one D6: on a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with D6 wounds remaining."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Venerable Land Raider": [
  [
   "Assault Ramp",
   "Each time a unit disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Damaged: 1-5 Wounds remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Vertus Praetors": [
  [
   "Turbo Boost",
   "Each time this unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 6\" to the Move characteristic of models in this unit."
  ],
  [
   "Quicksilver Execution",
   "Once per battle, after this unit ends a normal or Advance move, you can select one enemy unit (excluding MONSTERS and VEHICLES) that it moved over during that move, then roll one D6 for each model in this unit; for each 2+, that enemy unit suffers 2 mortal wounds."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Vigilators": [
  [
   "Deft Parry",
   "Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "Daughters of the Abyss",
   "Models in this unit have the Feel No Pain 3+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "Ceaseless Vigilance",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is nulled: \n- While a unit is nulled, that unit has +3\" detection range."
  ]
 ],
 "Witchseekers": [
  [
   "Sanctified Flames",
   "In your Shooting phase, after this unit has shot, select one enemy unit that was hit by one or more of those attacks. That unit must take a Battle-shock test."
  ],
  [
   "Daughters of the Abyss",
   "Models in this unit have the Feel No Pain 3+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "Ceaseless Vigilance",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is nulled: \n- While a unit is nulled, that unit has +3\" detection range."
  ]
 ],
 "Custodian Guard with Adrasite and Pyrithite spears": [
  [
   "Stand Vigil",
   "Each time a model in this unit makes an attack, re-roll a Wound roll of 1. While this unit is within range of an objective marker you control, you can re-roll the Wound roll instead."
  ],
  [
   "No Foe Shall Stand",
   "Once per battle, at the start of your Shooting phase, this unit can use this ability. If it does, until the end of the phase, ranged weapons equipped by models in this unit have the [LETHAL HITS] and [IGNORES COVER abilities]."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Sagittarum Custodians": [
  [
   "Disintegration Beams",
   "Once per battle, at the start of your Shooting phase, this unit can use this ability. If it does, until the end of the phase, ranged weapons equipped by models in this unit have the Devastating Wounds ability."
  ],
  [
   "Saturation Volleys",
   "In your Shooting phase, after this unit has shot, select one enemy unit (excluding MONSTERS and VEHICLES) hit by one or more of those attacks. Until the start of your next turn, while this unit is on the battlefield. that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the hit roll."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Aquilon Custodians": [
  [
   "Heavy Assault Infantry",
   "Each time a model in this unit makes a ranged attack that targets the closest eligible target, re-roll a Wound roll of 1."
  ],
  [
   "From Golden Light",
   "Once per battle, at the end of your opponent's turn, if this unit is not whithin Engagement Range of one or more enemy units, you can remove it from the battlefield. In the Reinforcements step of your next Movement phase, set it up anywhere on the battlefield that is more than 9\" horizontally away from all enemy models."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Agamatus Custodians": [
  [
   "Implacable Vanguard",
   "Once per battle, in your Shooting phase, after this unit has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\". If it does, until the end of the turn, this unit is not elgibile to declare a charge."
  ],
  [
   "Turbo Boost",
   "Each time this unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 6\" to the Move characteristic of models in this unit."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Venatari Custodians": [
  [
   "Strike from the Skies",
   "This unit is eligible to shoot and declare a charge in a turn in which it Fell Back."
  ],
  [
   "Swooping Dive",
   "Once per battle, you can target this unit with the Rapid Ingress Stratagem for 0 CP, and can do so even if you have already targeted a different unit with that Stratagem that phase."
  ],
  [
   "Tarsis Buckler",
   "The bearer has a Wounds characteristic of 4."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Contemptor-Galatus Dreadnought": [
  [
   "Galatus Shield",
   "Each time a melee attack targets this model subtract 1 from the Wound roll."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Contemptor-Achillus Dreadnought": [
  [
   "Dread Foe",
   "Each time this model is selected to fight, you can select one enemy unit within Engagement Range of it and roll one D6, adding 2 to the result if this model made a Charge move this turn: on 4-5, that enemy unit suffers D3 mortal wounds; on a 6+, that enemy unit suffers 3 mortal wounds."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Pallas Grav-attack": [
  [
   "Merciless Hunter",
   "In your Shooting phase, each time this model makes an attack that targets an enemy unit that is Below Half-strength, add 1 to the Wound roll."
  ]
 ],
 "Caladius Grav-tank": [
  [
   "Advanced Firepower",
   "Each time this model makes an attack with its Twin iliastus accelerator cannon that targets an enemy unit (excluding MONSTERS and VEHICLES), that attack has the [LETHAL HITS] ability. Each time this model makes an attack with its Twin arachnus heavy blaze cannon that targets an enemy MONSTER or VEHICLE unit, that attack has the [LETHAL HITS] ability."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Telemon Heavy Dreadnought": [
  [
   "Guardian Eternal",
   "Each time an attack is allocated to this model, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Damaged: 1-4 wounds remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Devoted to Destruction",
   "If this model is equipped with 2 Telemon caestus weapons in addition to its armoured feet weapon, add 2 to the Attacks characteristic of those Telemon caestus weapons."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Coronus Grav-carrier": [
  [
   "Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Orion Assault Dropship": [
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Assault Dropship",
   "If a unit disembarks from this TRANSPORT before it moves, until the end of the turn, that unit is eligibile to charge in a turn in which it Advanced."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Ares Gunship": [
  [
   "Infernus Firebombs",
   "At the end of your Movement phase, select one visible enemy unit (excluding AIRCRAFT/Lone Operative units) within 24\" of this unit: \n- That enemy unit cannot have the benefit of cover until the end of your next Shooting phase. \n- Roll one D6 for each model in that enemy unit: for each 6, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Martial Ka'tah",
   "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Auric Champions",2,"","Assemblage of Might","At the start of your Command phase, select one unit from your opponent’s army. Until the start of your next Command phase, each time a model in an Adeptus Custodes Character unit from your army makes an attack that targets that enemy unit, add 1 to the Wound roll.","",0,"","Priority Assets"],
  ["Lions Of The Emperor",2,"Lions","Against All Odds","Each time a model in an Adeptus Custodes unit from your army (excluding Vehicles) makes an attack, if there are no other friendly units within 6\" of that unit, add 1 to the Hit roll and add 1 to the Wound roll.","",0,"","Disruption"],
  ["Might Of The Moritoi",1,"Armoury","March of the Honoured Dead","Friendly ADEPTUS CUSTODES WALKER units: ▪ Have +2\" M. ▪ Have +1 to advance rolls and charge rolls. This detachment has the ARMOURY tag and cannot be taken with another ARMOURY detachment.","",0,"","Take and Hold"],
  ["Null Maiden Vigil",2,"","Creeping Dread (Aura)","In the Battle-shock step of your opponent’s Command phase, if an enemy unit that is either a PSYKER unit or below its Starting Strength is within 12\" of one or more Anathema Psykana models from your army, that enemy unit must take a Battle-shock test. If that unit is Below Half-strength, it must subtract 1 from its Battle-shock test this phase instead. Designer’s Note: This means that all enemy PSYKER units within range of this Aura ability and all enemy units within range of this Aura ability that have lost one or more models must take a Battle-shock test in your opponents Command phase, not just those that are Below Half-strength.","",0,"","Reconnaissance"],
  ["Shield Host",2,"","Martial Mastery","At the start of the battle round, you can select one of the bullet points below. If you do, until the start of the next battle round, that bullet point’s effects apply. ▪ Each time an Adeptus Custodes model from your army with the Martial Ka’tah ability makes a melee attack, a successful unmodified Hit roll of 5+ scores a Critical Hit. ▪ Improve the Armour Penetration characteristic of melee weapons equipped by ADEPTUS CUSTODES models from your army with the Martial Ka’tah ability by 1.","",0,"","Purge the Foe"],
  ["Silent Hunters",1,"","Skin-Crawling Disorientation","▪ When a friendly ANATHEMA PSYKANA unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to start an action. ▪ Friendly ANATHEMA PSYKANA units have the following ability: Ceaseless Vigilance: In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is nulled: ▪ While a unit is nulled, that unit has +3\" detection range.","",0,"","Reconnaissance"],
  ["Solar Spearhead",2,"Armoury","Auric Armour","▪ While an Adeptus Custodes Vehicle unit from your army is at Starting Strength, unless that unit is an Aircraft or it is Battle-shocked, add 2 to the Objective Control characteristic of models in that unit. ▪ While an ADEPTUS CUSTODES VEHICLE unit from your army is below Starting Strength, each time a model in that unit makes an attack, re-roll a Hit roll of 1. ▪ While an ADEPTUS CUSTODES VEHICLE unit from your army is Below Half-strength, each time a model in that unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1. MORITOI ANCIENTS The Adeptus Custodes’ honoured fallen are ever eager for battle. Add 2\" to the Move characteristic of models in ADEPTUS CUSTODES WALKER units from your army and add 1 to Advance and Charge rolls made for such units. KEYWORDS In the Muster Armies step, you can select up to 2 ADEPTUS CUSTODES WALKER models from your army. The selected units gain the CHARACTER keyword. Designer’s Note: This means that the selected models can be given Enhancements and one of them can be selected as your WARLORD.","",0,"","Take and Hold"],
  ["Talons Of The Emperor",3,"","Revered Companions","Anathema Psykana units from your army gain the following the ability: Null Aegis (Aura): While an Adeptus Custodes unit is within 6\" of this unit, models in that unit have the Feel No Pain 5+ ability against Psychic Attacks and mortal wounds. All other ADEPTUS CUSTODES units from your army gain the following ability: Deadly Unity (Aura): While an ANATHEMA PSYKANA unit is within 6\" of this unit, each time a model in that ANATHEMA PSYKANA unit makes an attack, add 1 to the Hit roll.","",0,"","Take and Hold"],
  ["Tharanatoi Hammerblow",1,"Lions","The Hammer Falls","If a friendly ADEPTUS CUSTODES TERMINATOR unit made an ingress move this turn, that unit can re-roll charge rolls. This detachment has the LIONS tag and cannot be taken with another LIONS detachment.","",0,"","Priority Assets"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Blade Imperator",25,"Auric Champions","Each time the bearer's unit ends a Charge move, select one enemy unit within Engagement Range of the bearer and roll one D6: on a 4+, that enemy unit suffers D3 mortal wounds. Once per battle, when the bearer's unit ends a Charge move, all enemy units within 6\" of the bearer must take a Battle-shock test.",null],
  ["Inspirational Exemplar",10,"Auric Champions","The bearer has a Leadership characteristic of 5+. Once per battle, at the start of any phase, you can select one friendly Adeptus Custodes unit that is Battle-shocked and within 12\" of the bearer: that unit is no longer Battle-shocked.",null],
  ["Martial Philosopher",30,"Auric Champions","Once per battle, in your opponent's Movement phase, when an enemy unit ends a Normal, Advance or Fall Back move within 8\" of the bearer, if the bearer's unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\".",null],
  ["Veiled Blade",25,"Auric Champions","Add 2 to the Attacks characteristic of the bearer's melee weapons. Once per battle, at the start of any Command phase, triple the bearer's Objective Control characteristic until the end of the turn.",null],
  ["Admonimortis",30,"Lions Of The Emperor","Shield-Captain model only. Improve the Strength characteristic of melee weapons equipped by the bearer by 3, and improve the Armour Penetration and Damage characteristics of those weapons by  1.",null],
  ["Fierce Conqueror",15,"Lions Of The Emperor","At the start of the Fight phase, until the end of the phase, add 2 to the Attacks characteristic of melee weapons equipped by the bearer for every 5 enemy models within 6\" of the bearer (rounding  down).",null],
  ["Praesidius",25,"Lions Of The Emperor","The bearer has the Lone Operative and Stealth abilities.",null],
  ["Superior Creation",25,"Lions Of The Emperor","Adeptus Custodes Infantry model only. The first time the bearer is destroyed, roll one D6 at the end of the phase. On a 2+, set the bearer back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with its full wounds remaining.",null],
  ["Auramite Sarcophagus (Upgrade)",15,"Might Of The Moritoi","ADEPTUS CUSTODES WALKER unit only. When you target this unit with the Crushing Impact stratagem, that use is -1 CP.",null],
  ["Interred Expertise (Upgrade)",25,"Might Of The Moritoi","ADEPTUS CUSTODES WALKER unit only. This unit’s attacks can: ▪ Re-roll hit rolls of 1. ▪ Re-roll wound rolls of 1.",null],
  ["Enhanced Voidsheen Cloak",10,"Null Maiden Vigil","Each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of that attack. If that attack was made by a Psyker or Battle-shocked model, change the Damage characteristic of that attack to 1 instead.",null],
  ["Huntress’ Eye",15,"Null Maiden Vigil","In your Command phase, select one enemy unit within 12\" of the bearer. That unit must take a Battle-shock test.",null],
  ["Oblivion Knight",25,"Null Maiden Vigil","While the bearer is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll. If that attack targeted an enemy Psyker unit, add 1 to the Wound roll as well.",null],
  ["Raptor Blade",5,"Null Maiden Vigil","Add 1 to the Attacks, Strength and Damage characteristics of the bearer's melee weapons. While the bearer is within Engagement Range of one or more enemy Psyker units that are Battle-shocked, add 2 to the Attacks, Strength and Damage characteristics of the bearer's melee weapons instead.",null],
  ["Auric Mantle",15,"Shield Host","Shield-Captain or Blade Champion model only. Add 2 to the bearer's Wounds characteristic.",null],
  ["Castellan’s Mark",20,"Shield Host","After both players have deployed their armies, you can select up to two ADEPTUS CUSTODES units from your army (excluding ANATHEMA PSYKANA units) and redeploy all of those units. When doing so, any of those units can be placed into Strategic Reserves, regardless of how  any units are already in Strategic Reserves.",null],
  ["From the Hall of Armouries",20,"Shield Host","Add 1 to the Strength and Damage characteristics of the bearer's melee weapons.",null],
  ["Panoptispex",5,"Shield Host","While the bearer is leading a unit, ranged weapons equipped by models in that unit have the [IGNORES COVER] ability.",null],
  ["Encircling Hunter",15,"Silent Hunters","When both players have deployed their armies, you can redeploy up to three friendly ANATHEMA PSYKANA INFANTRY units. When doing so, you can set those units up in strategic reserves, regardless of how many units are already in strategic reserves.",null],
  ["Psyk-out Grenades (Upgrade)",10,"Silent Hunters","ANATHEMA PSYKANA unit only. ▪ This unit has EXPLOSIVES. ▪ When you target this unit with the Explosives stratagem, if you select an enemy PSYKER unit, you can re-roll rolls to determine whether that enemy unit suffers a mortal wound.",null],
  ["Adamantine Talisman",25,"Solar Spearhead","Adeptus Custodes model only. Improve the Attacks, Strength and Damage characteristics of melee weapons equipped by the bearer by 1.",null],
  ["Augury Uplink",35,"Solar Spearhead","ADEPTUS CUSTODES model only. The bearer has the Feel No Pain 5+ ability.",null],
  ["Honoured Fallen",15,"Solar Spearhead","ADEPTUS CUSTODES VEHICLE model only. While a friendly ADEPTUS CUSTODES INFANTRY or ADEPTUS CUSTODES MOUNTED unit is within 6\" of the bearer, each time a model in that unit makes  an attack, re-roll a Hit roll of 1.",null],
  ["Veteran of the Kataphraktoi",10,"Solar Spearhead","ADEPTUS CUSTODES INFANTRY or ADEPTUS CUSTODES MOUNTED model only. In your Command phase, select one ADEPTUS CUSTODES VEHICLE or ADEPTUS CUSTODES MOUNTED unit within 6\" of the bearer. Until the start of your next Command phase, that unit is eligible to shoot in a turn in which it Fell Back.",null],
  ["Aegis Projector",20,"Talons Of The Emperor","Once per turn, the first time a saving throw is failed for the bearer's unit, change the Damage characteristic of that attack to 0.",null],
  ["Champion of the Imperium",25,"Talons Of The Emperor","The range of the bearer’s Null Aegis or Deadly Unity ability is increased to 9\".",null],
  ["Gift of Terran Artifice",15,"Talons Of The Emperor","Each time the bearer makes a melee attack, add 1 to the Wound roll.",null],
  ["Radiant Mantle",30,"Talons Of The Emperor","Each time an attack targets the bearer's unit, if the attacking model is within 12\", subtract 1 from the Hit roll.",null],
  ["Efficient Aggression",25,"Tharanatoi Hammerblow","(Once per turn, per army) In your opponent’s Shooting phase, when an enemy unit has shot, if this unit lost a wound as a result of those attacks, this unit can make a surge move of up to D6+1\".",null],
  ["Mnemo-locked Shrine Cipher",25,"Tharanatoi Hammerblow","In your first Movement phase, this unit can make an ingress move.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Earning of a Name","Auric Champions","Fait Épique",1,"Fight phase.","Up to two Adeptus Custodes Character units from your army that have not been selected to fight this phase.","Until the end of the phase, each time a CHARACTER model in either of your units makes an attack that targets a MONSTER or VEHICLE unit, you can re-roll the Hit roll and you can re-roll the Wound roll.",""],
  ["Shoulder the Mantle","Auric Champions","Fait Épique",1,"Your Movement phase, before the Reinforcements step.","One Adeptus Custodes Character model from your army that is not leading a unit.","Select one friendly unit (excluding Battle-shocked and Attached units) within 2\" horizontally and 5\" vertically of your model that it could lead (as described in the Leader section of its datasheet). Your model attaches to that unit as a Leader. Change that unit’s Starting Strength accordingly.",""],
  ["Slayer of Champions","Auric Champions","Fait Épique",1,"Any phase.","One Adeptus Custodes Character unit from your army that has just destroyed the unit you selected at the start of your Command phase as the target of your Assemblage of Might ability.","Select one enemy unit on the battlefield Until the start of your next Command phase, each time an ADEPTUS CUSTODES CHARACTER model from your army makes an attack that target that enemy unit, add 1 to the Wound roll In addition, if the destroyed unit was a CHARACTER unit, gain 1CP.",""],
  ["Superhuman Reserves","Auric Champions","Fait Épique",2,"Any phase, just after an Adeptus Custodes Warlord model from your army has used an ability on its datasheet or from an Enhancement that says it can only be used Once per battle.","That Adeptus Custodes Warlord model.","Your model can use its Once per battle’ ability one additional time during this battle (but not in the same phase).","You cannot use this Stratagem more than once per battle."],
  ["The Emperor’s Auspice","Auric Champions","Fait Épique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Adeptus Custodes Character unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, CHARACTER models in your unit have the Feel No Pain 4+ ability.",""],
  ["Vigil Unending","Auric Champions","Fait Épique",2,"Fight phase.","One Adeptus Custodes Character model from your army that was just destroyed and has not fought this phase. You can use this Stratagem on that unit even though it was just destroyed.","Do not remove your destroyed model from play. The destroyed model can fight after the attacking unit has finished making attacks, and is then removed from play.",""],
  ["Defiant to the Last","Lions Of The Emperor","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One ADEPTUS CUSTODES unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 2 to the result if that model has the CHARACTER keyword. On a 4+, do not remove it from play; the destroyed model can fight after the attacking unit has finished making its attacks (when doing so, it is treated as having 1 wound remaining), and is then removed from play.",""],
  ["Gilded Champion","Lions Of The Emperor","Ruse Stratégique",1,"Any phase, just after an Adeptus Custodes Character model from your army has used an ability on its datasheet that states it can only be used ‘once per battle’.","That ADEPTUS CUSTODES CHARACTER model.","Your model can use that ‘once per battle’ ability one additional time during the battle (but not in the same phase).","You cannot use this Stratagem on the same ADEPTUS CUSTODES CHARACTER model more than once per battle."],
  ["Manoeuvre and Fire","Lions Of The Emperor","Ruse Stratégique",1,"Your Movement phase, just after an ADEPTUS CUSTODES unit from your army Falls Back.","That ADEPTUS CUSTODES unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Peerless Warrior","Lions Of The Emperor","Tactique de Bataille",1,"Fight phase.","One ADEPTUS CUSTODES unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [PRECISION] ability.",""],
  ["Swift As the Eagle","Lions Of The Emperor","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One ADEPTUS CUSTODES unit from your army (excluding VEHICLE units) that was selected as the target of one or more of the attacking unit’s attacks.","Your unit can make a Normal move of up to D6\".",""],
  ["Unleash the Lions","Lions Of The Emperor","Ruse Stratégique",1,"Your Command phase.","One Allarus Custodians or Aquilon Custodians unit from your army that is on the battlefield.","That unit is split into separate units, each containing one model. These new units each have a Starting Strength of 1.",""],
  ["Flawless Construction","Might Of The Moritoi","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS CUSTODES WALKER unit.","That ADEPTUS CUSTODES WALKER unit.","Attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Prioritised Eradication","Might Of The Moritoi","",1,"Your Shooting phase, when a friendly TELEMON HEAVY DREADNOUGHT unit is selected to shoot.","That TELEMON HEAVY DREADNOUGHT unit.","Your unit’s: ▪ Arachnus Storm Cannon weapons have [RAPID FIRE 6]. ▪ Iliastus Accelerator Culverin weapons have [RAPID FIRE 2].",""],
  ["Unstoppable Advance","Might Of The Moritoi","",1,"Your Movement phase, when a friendly ADEPTUS CUSTODES WALKER unit is selected to move.","That ADEPTUS CUSTODES WALKER unit.","Your unit has MOBILE.",""],
  ["Anathema Blademastery","Null Maiden Vigil","Tactique de Bataille",1,"Fight phase.","One Vigilators unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes a melee attack, you can re-roll the Hit roll If the target of that attack is Battle-shocked or a PSYKER, you can re-roll the Wound roll as well.",""],
  ["Desperation’s Price","Null Maiden Vigil","Ruse Stratégique",1,"Any phase, just after an enemy PSYKER unit has either finished using a Psychic ability that targets a unit, or finished making Psychic Attacks.","One Anathema Psykana unit from your army within 18\" of that enemy PSYKER unit.","That enemy PSYKER unit must take a Leadership test If the test is passed, that PSYKER unit is Battle-shocked; if the test is failed that PSYKER unit suffers 3 mortal wounds and is Battle-shocked.",""],
  ["Psy-Chaff Volley","Null Maiden Vigil","Ruse Stratégique",1,"Your Shooting phase.","One Prosecutors unit from your army that has just shot.","Select one enemy unit hit by one or more of those attacks. Until the start of your next turn, while your unit is on the battlefield, that enemy unit is prosecuted. While a unit is prosecuted, each time an Anathema Psykana model makes an attack against that unit, improve the Armour Penetration characteristic of that attack by 1. While a PSYKER or Battle-shocked unit is prosecuted, each time a model in that unit makes an attack, subtract 1 from the Hit roll.",""],
  ["Psychic Abominations","Null Maiden Vigil","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Anathema Psykana Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit has the Stealth ability, and Battle-shocked and PSYKER models can only select your unit as a target of a ranged attack if they are within 12\".",""],
  ["Purgation Sweep","Null Maiden Vigil","Tactique de Bataille",1,"Your Shooting phase.","One Witchseekers unit from your army that has not been selected to shoot this phase.","Until the end of the phase, add 1 to the Attacks characteristic of Torrent weapons equipped by models in your unit. If such a weapon targets a PSYKER or Battle-shocked unit this phase, add 2 to its Attacks characteristic instead.",""],
  ["Witch Hunters","Null Maiden Vigil","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Anathema Psykana unit from your army that has not been selected to shoot or fight this phase.","Select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until the end of the phase, weapons equipped by models in your unit have the selected ability, but models in your unit can only target PSYKER units with their attacks.",""],
  ["Arcane Genetic Alchemy","Shield Host","Tactique de Bataille",1,"Any phase, just after a mortal wound has been allocated to an Adeptus Custodes model from your army(excluding Anathema Psykana models).","That ADEPTUS CUSTODES model’s unit.","Until the end of the phase, models in your unit have the Feel No Pain 4+ ability against mortal wounds.",""],
  ["Archeotech Munitions","Shield Host","Équipement",1,"Your Shooting phase.","One ADEPTUS CUSTODES unit from your army (excluding Anathema Psykana units) that has not been selected to shoot this phase.","Select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until the end of the phase ranged weapons equipped by models in your unit have the selected ability.",""],
  ["Avenge the Fallen","Shield Host","Ruse Stratégique",1,"Start of the Fight phase.","One ADEPTUS CUSTODES unit from your army (excluding Anathema Psykana units) that is below its Starting Strength.","Until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit. If your unit is Below Half-strength, until the end of the phase, add 2 to the Attacks characteristic of those melee weapons instead.",""],
  ["Multipotentiality","Shield Host","Ruse Stratégique",1,"Your Movement phase.","One Adeptus Custodes unit from your army that Fell Back this phase.","Until the end of your turn, that unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Unwavering Sentinels","Shield Host","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Adeptus Custodes Infantry unit from your army (excluding Anathema Psykana units) that is within range of an objective marker you control and that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a melee attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Vigilance Eternal","Shield Host","Ruse Stratégique",1,"Your Movement phase.","One Adeptus Custodes Battleline unit from your army (excluding Anathema Psykana units) within range of an objective marker you control.","That objective marker remains under your control even if you have no models within range of it, until your opponent controls it at the start or end of any turn.",""],
  ["Deathsong Scythes","Silent Hunters","",1,"Fight phase, when a friendly VIGILATORS unit is selected to fight.","That VIGILATORS unit.","▪ Your unit’s melee attacks have [LANCE]. ▪ Your unit’s melee attacks that target a PSYKER unit have +1 A.",""],
  ["Synchronised Inferno","Silent Hunters","",1,"Your Shooting phase, when a friendly WITCHSEEKERS unit is selected to shoot.","That WITCHSEEKERS unit.","Your unit’s [TORRENT] ranged attacks have [BLAST 1].",""],
  ["Umbral Prosecution","Silent Hunters","",1,"Your Shooting phase, when a friendly PROSECUTORS unit is selected to shoot.","That PROSECUTORS unit.","Your unit’s Boltgun weapons have: ▪ [RAPID FIRE 2]. ▪ +1 AP.",""],
  ["Emperor’s Vengeance","Solar Spearhead","Tactique de Bataille",1,"Fight phase, just after an enemy unit has selected its targets.","One ADEPTUS CUSTODES unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 to the result if your unit has the Walker keyword. On a 4+, do not remove it from play; The destroyed model can fight after the attacking unit has finished making its attacks (when doing so, it is assumed to have 1 wound remaining), and is then removed from play.",""],
  ["Flawless Construction","Solar Spearhead","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Adeptus Custodes Vehicle unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets a model in your unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of your unit, subtract 1 from the Wound roll.",""],
  ["Punishment Inescapable","Solar Spearhead","Ruse Stratégique",1,"Your Shooting phase.","One ADEPTUS CUSTODES unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability, and until the end of the phase, each time a model in your unit makes an attack, you can ignore any or all modifiers to that attack’s Ballistic Skill characteristic and/or any or all modifiers to the Hit roll.",""],
  ["Relentless Persecution","Solar Spearhead","Ruse Stratégique",1,"Your Movement phase, just after an ADEPTUS CUSTODES VEHICLE unit from your army Advances.","That Adeptus Custodes Vehicle unit.","Until the end of the turn, your unit is eligible to shoot in a turn in which it Advanced. If your unit has the Walker keyword, until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced instead.",""],
  ["Unstoppable","Solar Spearhead","Ruse Stratégique",1,"Your Movement phase or your Charge phase.","One Adeptus Custodes Vehicle or Adeptus Custodes Mounted unit from your army.","Until the end of the phase, each time a model in your unit makes a move, it can move through terrain features.",""],
  ["Wrathful Advance","Solar Spearhead","Tactique de Bataille",1,"Fight phase, just before an ADEPTUS CUSTODES unit from your army Piles In.","That ADEPTUS CUSTODES unit.","Until the end of the phase, each time a model in your unit makes a Pile-in move, it can move up to D3+3\" instead of up to 3\".",""],
  ["Emperor’s Executioners","Talons Of The Emperor","Tactique de Bataille",2,"Start of the Fight phase.","Up to two Adeptus Custodes units from your army.","Until the end of the phase, each time a model in one of your units targets an enemy unit that is below its Starting Strength, add 1 to the Wound roll.","You can only select two units if one (and only one) of them is an Anathema Psykana unit and both are within 6\" of each other."],
  ["Empyric Severance","Talons Of The Emperor","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One ADEPTUS CusTODES unit from your army that was selected as the target of one or more of the attacking unit’s attacks, and one friendly ANATHEMA PSYKANA unit within 6\" of that ADEPTUS CUSTODES unit.","Until the end of the phase, your unit has the Feel No Pain 4+ ability against Psychic attacks and mortal wounds.",""],
  ["Hunt As One","Talons Of The Emperor","Ruse Stratégique",1,"Start of your Movement phase.","Up to two ADEPTUS CUSTODES units from your army.","Until the end of the turn, your units are eilgible to shoot and/or declare a charge in a turn in which they Fell Back.","You can only select two units if one (and only one) of them is an ANATHEMA PSYKANA unit and both are within 6\" of each other."],
  ["Shield of Honour","Talons Of The Emperor","Fait Épique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Anathema Psykana Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks, and one other friendly Adeptus Custodes Infantry unit (excluding ANATHEMA PSYKANA units) within 6\" of that ANATHEMA PSYKANA INFANTRY unit.","Until the end of the phase, any attack that targets your ANATHEMA PSYKANA unit must instead target your other ADEPTUS CUSTODES unit (unless it is not an eligible target).",""],
  ["Taloned Pincer","Talons Of The Emperor","Tactique de Bataille",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","Up to two Adeptus Custodes units from your army that are within 8\" of that enemy unit.","Your units can make a Normal move of up to 6\".","You cannot select units that are within Engagement Range of one or more enemy units. You can only select two units if one (and only one) of them is an Anathema Psykana unit and both are within 6\" of each other."],
  ["Talons Interlocked","Talons Of The Emperor","Tactique de Bataille",1,"Your Shooting phase.","Up to two ADEPTUS CUSTODES INFANTRY units from your army, and one enemy unit that is an eligible target for all of those units.","Until the end of the phase, your units can only target that enemy unit, but each time a model in one of your units makes a ranged attack, improve the Strength and Armour Penetration characteristics of that attack by 1.","You can only select two units if one (and only one) of them is an ANATHEMA PSYKANA unit and both are within 6\" of each other."],
  ["Electroexorcist Saturation","Tharanatoi Hammerblow","",1,"Your Shooting phase, when a friendly ADEPTUS CUSTODES TERMINATOR unit is selected to shoot.","That ADEPTUS CUSTODES TERMINATOR unit.","Your unit’s Ballistus Grenade Launcher weapons have D3+3 A.",""],
  ["Hardened Resolve","Tharanatoi Hammerblow","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS CUSTODES TERMINATORADEPTUS CUSTODES TERMINATOR unit.","That ADEPTUS CUSTODES TERMINATOR unit.","Your unit has +1 T.",""],
  ["Unleash the Lions","Tharanatoi Hammerblow","",1,"Your Command phase.","One friendly ALLARUS CUSTODIANS/AQUILON CUSTODIANS unit that is on the battlefield.","Your unit is split into separate units, each containing one model. These new units each have a starting strength of 1.",""],
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
  "Anathema Psykana Rhino",
  "Ares Gunship",
  "Caladius Grav-tank",
  "Contemptor-Achillus Dreadnought",
  "Contemptor-Galatus Dreadnought",
  "Coronus Grav-carrier",
  "Orion Assault Dropship",
  "Pallas Grav-attack",
  "Telemon Heavy Dreadnought",
  "Venerable Contemptor Dreadnought",
  "Venerable Land Raider"
 ],
 "monster": [],
 "battleline": [
  "Custodian Guard"
 ],
 "epic": [
  "Aleya",
  "Trajann Valoris",
  "Valerian"
 ],
 "infantry": [
  "Allarus Custodians",
  "Aquilon Custodians",
  "Custodian Guard with Adrasite and Pyrithite spears",
  "Custodian Wardens",
  "Prosecutors",
  "Sagittarum Custodians",
  "Venatari Custodians",
  "Vigilators",
  "Witchseekers"
 ],
 "character": [
  "Blade Champion",
  "Knight-Centura",
  "Shield-Captain",
  "Shield-Captain in Allarus Terminator Armour",
  "Shield-Captain on Dawneagle Jetbike"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Aleya": "32",
 "Allarus Custodians": "40",
 "Anathema Psykana Rhino": "coque",
 "Blade Champion": "40",
 "Custodian Guard": "40",
 "Custodian Wardens": "40",
 "Knight-Centura": "32",
 "Prosecutors": "32",
 "Shield-Captain": "40",
 "Shield-Captain in Allarus Terminator Armour": "40",
 "Shield-Captain on Dawneagle Jetbike": "75x42",
 "Trajann Valoris": "40",
 "Valerian": "40",
 "Venerable Contemptor Dreadnought": "60",
 "Venerable Land Raider": "coque",
 "Vertus Praetors": "75x42",
 "Vigilators": "32",
 "Witchseekers": "32",
 "Custodian Guard with Adrasite and Pyrithite spears": "40",
 "Sagittarum Custodians": "40",
 "Aquilon Custodians": "50",
 "Agamatus Custodians": "75x42",
 "Venatari Custodians": "40",
 "Contemptor-Galatus Dreadnought": "60",
 "Contemptor-Achillus Dreadnought": "60",
 "Pallas Grav-attack": "105x70",
 "Caladius Grav-tank": "170x109",
 "Telemon Heavy Dreadnought": "100",
 "Coronus Grav-carrier": "170x109",
 "Orion Assault Dropship": "160",
 "Ares Gunship": "160"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Venerable Land Raider": 5,
 "Caladius Grav-tank": 5,
 "Telemon Heavy Dreadnought": 4,
 "Coronus Grav-carrier": 5,
 "Orion Assault Dropship": 7,
 "Ares Gunship": 7
};

const TRANSPORTS = {
 "Anathema Psykana Rhino": "This model has a transport capacity of 12 ANATHEMA PSYKANA INFANTRY models.",
 "Venerable Land Raider": "This model has a transport capacity of 6 ADEPTUS CUSTODES INFANTRY models.",
 "Coronus Grav-carrier": "This model has a transport capacity of 8 ^^Adeptus Custodes Infantry^^ models.",
 "Orion Assault Dropship": "This model has a transport capacity of 12 ADEPTUS CUSTODES INFANTRY models. This model can also transport 1 VENERABLE CONTEMPTOR DREADNOUGHt, 1 CONTEMPTOR-ACHILLUS DREADNOUGHT or 1 CONTEMPTOR GALATUS-DREADNOUGHT; while doing so, its transport capacity is reduced to 6 ADEPTUS CUSTODES INFANTRY models."
};
const FACTION = [
 [
  "Martial Ka'tah",
  "Each time a unit with this ability is selected to fight, select one of the Ka'tah stances below. Until that unit has finished making its attacks, the selected Stance is active for it and it gains the relevant ability.\n\n■ DACATARAI STANCE\nMelee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.\n■ RENDAX STANCE\nMelee weapons equipped by models in this unit have the [LETHAL HITS] ability."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/custodes.json —
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
  cle : "custodes",
  nom : "Adeptus Custodes",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
