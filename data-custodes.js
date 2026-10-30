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

   STRATS porte 52 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     36 fiches sur 36 en ont un. Les autres — des Legends, que le
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
  ["Aleya",7,3,3,5,4,[1],{"1": 55},0,"Meneur",1,"",1,"6+"],
  ["Allarus Custodians",7,8,2,4,6,[2, 3],[[1, {"2": 180, "3": 270}], [3, {"2": 210, "3": 300}]],0,"",0,"",2,"5+"],
  ["Anathema Psykana Rhino",12,9,3,0,10,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Aquilon Terminators with Solarite Power Gauntlets",7,8,2,4,6,[3],[[1, {"3": 285}], [3, {"3": 315}]],0,"",0,"",2,"5+"],
  ["Aquilon Terminators with Solarite Power Talons",7,8,2,4,6,[3],[[1, {"3": 275}], [3, {"3": 305}]],0,"",0,"",2,"5+"],
  ["Ares Gunship",0,12,2,5,22,[1],[[1, {"1": 580}], [2, {"1": 610}]],0,"",0,"",0,"6+"],
  ["Blade Champion",8,7,2,4,7,[1],[[1, {"1": 175}], [3, {"1": 195}]],0,"Meneur",0,"",2,"5+"],
  ["Caladius Annihilator Grav-tank",10,11,2,5,14,[1],[[1, {"1": 250}], [3, {"1": 280}]],0,"",0,"",4,"5+"],
  ["Caladius Grav-tank",10,11,2,5,14,[1],[[1, {"1": 230}], [3, {"1": 260}]],0,"",0,"",4,"5+"],
  ["Contemptor-Achillus Dreadnought",9,10,2,5,12,[1],[[1, {"1": 230}], [3, {"1": 260}]],0,"",0,"",3,"5+"],
  ["Contemptor-Galatus Dreadnought",9,10,2,4,12,[1],[[1, {"1": 220}], [3, {"1": 250}]],0,"",0,"",3,"5+"],
  ["Coronus Grav-carrier",12,12,2,5,16,[1],[[1, {"1": 225}], [3, {"1": 245}]],0,"",0,"",5,"5+"],
  ["Custodian Guard Sodality",8,7,2,4,5,[3],[[1, {"3": 240}], [4, {"3": 270}]],0,"",0,"",3,"5+"],
  ["Custodian Guard Sodality with Adrasite Spears",8,7,2,4,5,[3],{"3": 200},0,"",1,"",2,"5+"],
  ["Custodian Guard Sodality with Pyrithite Spears",8,7,2,4,5,[3],{"3": 215},0,"",1,"",2,"5+"],
  ["Custodian Wardens",8,7,2,4,6,[2, 3],[[1, {"2": 200, "3": 295}], [2, {"2": 230, "3": 325}]],0,"",0,"",2,"5+"],
  ["Gyrfalcon Jetbike Sodality",12,8,2,4,9,[2],[[1, {"2": 260}], [2, {"2": 280}]],0,"",0,"",2,"5+"],
  ["Knight-Centura",7,3,3,5,4,[1],{"1": 55},0,"Appui",0,"",1,"6+"],
  ["Orion Assault Dropship",14,12,2,5,22,[1],[[1, {"1": 690}], [2, {"1": 740}]],0,"",0,"",0,"6+"],
  ["Pallas Grav-attack",12,9,2,5,10,[1],{"1": 135},0,"",0,"",2,"5+"],
  ["Prosecutor Squad",7,3,3,0,1,[4, 5, 9, 10],{"4": 45, "5": 50, "9": 80, "10": 90},0,"",0,"",2,"6+"],
  ["Sagittarum Custodians Sodality",8,7,2,4,5,[3],{"3": 185},0,"",1,"",3,"5+"],
  ["Sentinel Guard Sodality",8,7,2,4,5,[3],[[1, {"3": 240}], [4, {"3": 270}]],0,"",0,"",3,"5+"],
  ["Shield-Captain",8,7,2,4,8,[1],[[1, {"1": 180}], [2, {"1": 200}]],0,"Meneur",0,"",2,"5+"],
  ["Shield-Captain in Allarus Terminator Armour",7,8,2,4,9,[1],[[1, {"1": 185}], [2, {"1": 205}]],0,"Meneur",0,"",2,"5+"],
  ["Shield-Captain on Dawneagle Jetbike",12,8,2,4,10,[1],[[1, {"1": 205}], [2, {"1": 225}]],0,"Meneur",0,"",2,"5+"],
  ["Telemon Heavy Dreadnought",10,11,2,4,14,[1],[[1, {"1": 280}], [2, {"1": 310}]],0,"",0,"",4,"5+"],
  ["Trajann Valoris",8,7,2,4,10,[1],{"1": 265},0,"Meneur",0,"",2,"5+"],
  ["Valerian",8,7,2,4,8,[1],{"1": 130},0,"Meneur",1,"",2,"5+"],
  ["Venatari with Kinetic Destroyers",12,7,2,4,5,[3],[[1, {"3": 255}], [3, {"3": 280}]],0,"",0,"",2,"5+"],
  ["Venatari with Verutum Lances",12,7,2,4,5,[3],[[1, {"3": 270}], [3, {"3": 300}]],0,"",0,"",2,"5+"],
  ["Venerable Contemptor Dreadnought",9,10,2,5,12,[1],{"1": 220},0,"",1,"",3,"5+"],
  ["Venerable Land Raider",10,12,2,0,16,[1],{"1": 230},0,"",1,"",5,"7+"],
  ["Vertus Praetors",12,8,2,4,7,[2, 3],[[1, {"2": 220, "3": 330}], [2, {"2": 240, "3": 350}]],0,"",0,"",2,"5+"],
  ["Vigilator Squad",7,3,3,0,1,[4, 5, 9, 10],{"4": 50, "5": 55, "9": 90, "10": 100},0,"",0,"",1,"6+"],
  ["Witchseeker Squad",7,3,3,0,1,[4, 5, 9, 10],{"4": 55, "5": 60, "9": 100, "10": 110},0,"",0,"",1,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Aleya","Somnus","C","4",2,6,3,"3","anti:5 dev","càc"],
  ["Allarus Custodians","Balistus grenade launcher","T","3",2,5,1,"1","assault","18\""],
  ["Allarus Custodians","Castellan axe (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Allarus Custodians","Guardian Spear (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Allarus Custodians","Castellan axe (càc)","C","3",2,10,2,"4","","càc"],
  ["Allarus Custodians","Guardian Spear (càc)","C","6",2,8,2,"2","","càc"],
  ["Anathema Psykana Rhino","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Anathema Psykana Rhino","Storm Bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Aquilon Terminators with Solarite Power Gauntlets","Adrathic Combi-destructor","T","2",2,5,2,"3","","12\""],
  ["Aquilon Terminators with Solarite Power Gauntlets","Solarite Power Gauntlet","C","5",2,10,2,"3","","càc"],
  ["Aquilon Terminators with Solarite Power Talons","Infernus Firepike","T","3",0,5,1,"1","torrent","12\""],
  ["Aquilon Terminators with Solarite Power Talons","Lastrum Storm Bolter","T","3",2,5,1,"1","rf:3","24\""],
  ["Aquilon Terminators with Solarite Power Talons","Solarite Power Talons","C","6",2,6,2,"1","sust:2","càc"],
  ["Ares Gunship","Arachnus heavy blaze cannon","T","4",2,12,3,"D3+3","","36\""],
  ["Ares Gunship","Arachnus magna-blaze cannon","T","3",2,18,4,"D6+6","","48\""],
  ["Ares Gunship","Armoured hull","C","9",4,9,0,"1","","càc"],
  ["Blade Champion","➤ Vaultswords - Behemor","C","5",2,10,3,"3","dev","càc"],
  ["Blade Champion","➤ Vaultswords - Hurricanis","C","10",2,6,1,"1","sust:1","càc"],
  ["Blade Champion","➤ Vaultswords - Victus","C","8",2,8,3,"2","precision","càc"],
  ["Caladius Annihilator Grav-tank","Arachnus Blaze Carronade","T","4",2,12,3,"D6+2","","48\""],
  ["Caladius Annihilator Grav-tank","Twin Lastrum Bolt Cannon","T","3",2,6,2,"2","sust:1 twin","36\""],
  ["Caladius Annihilator Grav-tank","Twin Neutronium Cascade Projectors","T","3",0,7,2,"1","torrent twin","12\""],
  ["Caladius Annihilator Grav-tank","Armoured hull","C","4",4,6,0,"1","","càc"],
  ["Caladius Grav-tank","Twin Iliastus Accelerator Cannon","T","4",2,10,1,"3","rf:4 sust:1","48\""],
  ["Caladius Grav-tank","Twin Lastrum Bolt Cannon","T","3",2,6,2,"2","sust:1 twin","36\""],
  ["Caladius Grav-tank","Twin Neutronium Cascade Projectors","T","3",0,7,2,"1","torrent twin","12\""],
  ["Caladius Grav-tank","Armoured hull","C","4",4,6,0,"1","","càc"],
  ["Contemptor-Achillus Dreadnought","Adrathic combi-destructor","T","2",2,5,2,"3","","12\""],
  ["Contemptor-Achillus Dreadnought","Dreadspear (tir)","T","2",2,10,3,"D3+2","","18\""],
  ["Contemptor-Achillus Dreadnought","Lastrum storm bolter","T","3",2,5,1,"1","rf:3","24\""],
  ["Contemptor-Achillus Dreadnought","Twin Infernus incinerator","T","3",0,6,1,"1","torrent twin","12\""],
  ["Contemptor-Achillus Dreadnought","Dreadspear (càc)","C","5",2,12,3,"D3+3","lance","càc"],
  ["Contemptor-Galatus Dreadnought","Warblade (tir)","T","4",0,6,1,"2","torrent twin","12\""],
  ["Contemptor-Galatus Dreadnought","Warblade (càc)","C","8",2,10,2,"3","sust:1","càc"],
  ["Coronus Grav-carrier","Twin Arachnus Blaze Cannon","T","2",2,10,3,"D3+2","twin","24\""],
  ["Coronus Grav-carrier","Twin Lastrum Bolt Cannon","T","3",2,6,2,"2","sust:1 twin","36\""],
  ["Coronus Grav-carrier","Twin Neutronium Cascade Projectors","T","3",0,7,2,"1","torrent twin","12\""],
  ["Coronus Grav-carrier","Armoured hull","C","4",4,6,0,"1","","càc"],
  ["Custodian Guard Sodality","Guardian Spear (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Custodian Guard Sodality","Guardian Spear (càc)","C","6",2,8,2,"2","","càc"],
  ["Custodian Guard Sodality with Adrasite Spears","Adrasite spear (tir)","T","2",2,8,2,"3","","18\""],
  ["Custodian Guard Sodality with Adrasite Spears","Adrasite spear (càc)","C","6",2,8,2,"2","","càc"],
  ["Custodian Guard Sodality with Pyrithite Spears","Pyrithite spear (tir)","T","1",2,10,3,"D3+2","melta:2","12\""],
  ["Custodian Guard Sodality with Pyrithite Spears","Pyrithite spear (càc)","C","6",2,8,2,"2","","càc"],
  ["Custodian Wardens","Castellan axe (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Custodian Wardens","Guardian Spear (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Custodian Wardens","Castellan axe (càc)","C","3",2,10,2,"4","","càc"],
  ["Custodian Wardens","Guardian Spear (càc)","C","6",2,8,2,"2","","càc"],
  ["Gyrfalcon Jetbike Sodality","Adrathic Devastator","T","3",2,8,2,"3","","18\""],
  ["Gyrfalcon Jetbike Sodality","Arachnus Volley Cannon","T","8",2,5,1,"1","dev sust:1","24\""],
  ["Gyrfalcon Jetbike Sodality","Lastrum Bolt Cannon","T","3",2,6,2,"2","sust:1","36\""],
  ["Gyrfalcon Jetbike Sodality","Twin Corvae Las-pulser","T","1",2,10,3,"D3+2","twin","18\""],
  ["Gyrfalcon Jetbike Sodality","Solarite Power Lance","C","5",2,8,2,"3","lance","càc"],
  ["Knight-Centura","Master-crafted Flamer","T","4",0,4,1,"1","anti:4 assault torrent","12\""],
  ["Knight-Centura","Master-crafted boltgun","T","2",2,5,1,"2","anti:4 assault rf:1","24\""],
  ["Knight-Centura","Executioner Greatblade","C","4",2,5,2,"2","anti:5","càc"],
  ["Knight-Centura","Gun Stock","C","3",3,3,0,"1","","càc"],
  ["Orion Assault Dropship","Arachnus heavy blaze cannon","T","4",2,12,3,"D3+3","","36\""],
  ["Orion Assault Dropship","Spiculus heavy bolt launcher","T","8",2,7,1,"2","","36\""],
  ["Orion Assault Dropship","Twin lastrum bolt cannon","T","3",2,6,2,"2","sust:1 twin","36\""],
  ["Orion Assault Dropship","Armoured hull","C","9",4,9,0,"1","","càc"],
  ["Pallas Grav-attack","Twin Arachnus Blaze Cannon","T","2",2,10,3,"D3+2","twin","24\""],
  ["Pallas Grav-attack","Twin Iliastus Accelerator Fusil","T","2",2,10,1,"3","rf:2 twin","48\""],
  ["Pallas Grav-attack","Armoured hull","C","4",4,6,0,"1","","càc"],
  ["Prosecutor Squad","Boltgun","T","1",3,5,1,"1","anti:4 assault rf:1","24\""],
  ["Prosecutor Squad","Gun Stock","C","3",3,3,0,"1","","càc"],
  ["Sagittarum Custodians Sodality","Adrastus bolt caliver","T","3",2,7,2,"2","sust:1","36\""],
  ["Sagittarum Custodians Sodality","Misericordia","C","4",2,6,2,"1","","càc"],
  ["Sentinel Guard Sodality","Sentinel Blade (tir)","T","4",2,5,1,"2","assault","12\""],
  ["Sentinel Guard Sodality","Sentinel Blade (càc)","C","5",2,6,2,"2","","càc"],
  ["Shield-Captain","Castellan Axe (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Shield-Captain","Guardian Spear (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Shield-Captain","Pyrithite Spear (tir)","T","1",2,10,3,"D3+2","assault melta:2","12\""],
  ["Shield-Captain","Castellan Axe (càc)","C","5",2,10,2,"4","","càc"],
  ["Shield-Captain","Eternity-pattern Paragon Blade","C","6",2,10,3,"3","precision","càc"],
  ["Shield-Captain","Guardian Spear (càc)","C","8",2,8,2,"2","","càc"],
  ["Shield-Captain","Pyrithite Spear (càc)","C","8",2,8,2,"2","","càc"],
  ["Shield-Captain in Allarus Terminator Armour","Balistus grenade launcher","T","3",2,5,1,"1","assault","18\""],
  ["Shield-Captain in Allarus Terminator Armour","Castellan Axe (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Shield-Captain in Allarus Terminator Armour","Guardian Spear (tir)","T","2",2,5,1,"2","assault rf:2","24\""],
  ["Shield-Captain in Allarus Terminator Armour","Castellan Axe (càc)","C","5",2,10,2,"4","","càc"],
  ["Shield-Captain in Allarus Terminator Armour","Guardian Spear (càc)","C","8",2,8,2,"2","","càc"],
  ["Shield-Captain on Dawneagle Jetbike","Hurricane bolter","T","3",2,5,1,"2","rf:3 twin","18\""],
  ["Shield-Captain on Dawneagle Jetbike","Salvo launcher","T","2",2,10,2,"D3+2","","24\""],
  ["Shield-Captain on Dawneagle Jetbike","Interceptor lance","C","8",2,8,2,"2","lance","càc"],
  ["Telemon Heavy Dreadnought","Adrathic Desolator","T","4",2,10,2,"4","","24\""],
  ["Telemon Heavy Dreadnought","Arachnus Storm Cannon","T","12",2,6,1,"1","dev sust:1","24\""],
  ["Telemon Heavy Dreadnought","Iliastus Accelerator Culverin","T","3",2,10,1,"3","rf:3","48\""],
  ["Telemon Heavy Dreadnought","Spiculus bolt launcher","T","6",2,5,1,"1","","36\""],
  ["Telemon Heavy Dreadnought","Twin Neutronium Cascade Projectors","T","3",0,7,2,"1","torrent twin","12\""],
  ["Telemon Heavy Dreadnought","Caestus Fist","C","5",2,14,3,"4","","càc"],
  ["Telemon Heavy Dreadnought","Dual Caestus Fists","C","7",2,14,3,"4","twin","càc"],
  ["Trajann Valoris","Eagle's Scream","T","2",2,6,2,"2","assault rf:2","24\""],
  ["Trajann Valoris","Watcher's Axe","C","6",2,12,3,"4","","càc"],
  ["Valerian","Gnosis (tir)","T","3",2,6,1,"2","assault rf:2","24\""],
  ["Valerian","Gnosis (càc)","C","7",2,8,3,"3","","càc"],
  ["Venatari with Kinetic Destroyers","Kinetic destroyer","T","4",2,6,2,"1","assault sust:1","18\""],
  ["Venatari with Kinetic Destroyers","Tarsis buckler","C","5",2,6,2,"1","sust:1","càc"],
  ["Venatari with Verutum Lances","Verutum Lance (tir)","T","1",2,10,2,"3","assault","18\""],
  ["Venatari with Verutum Lances","Verutum Lance (càc)","C","5",2,7,2,"2","lance precision","càc"],
  ["Venerable Contemptor Dreadnought","Combi-bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Venerable Contemptor Dreadnought","Kheres-pattern assault cannon","T","6",2,7,2,"2","sust:1","24\""],
  ["Venerable Contemptor Dreadnought","Multi-melta","T","2",2,10,3,"D3+2","melta:3","18\""],
  ["Venerable Contemptor Dreadnought","Contemptor Fist","C","5",2,12,3,"D3+3","","càc"],
  ["Venerable Land Raider","Godhammer lascannon","T","2",2,12,3,"D3+3","","48\""],
  ["Venerable Land Raider","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Venerable Land Raider","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Venerable Land Raider","Twin heavy bolter","T","3",2,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Venerable Land Raider","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Vertus Praetors","Hurricane bolter","T","3",2,5,1,"2","rf:3 twin","18\""],
  ["Vertus Praetors","Salvo launcher","T","2",2,10,2,"D3+2","","24\""],
  ["Vertus Praetors","Interceptor lance","C","6",2,8,2,"2","lance","càc"],
  ["Vigilator Squad","Executioner greatblade","C","3",3,5,2,"2","anti:5","càc"],
  ["Witchseeker Squad","Flamer","T","3",0,4,1,"1","anti:4 assault torrent","12\""],
  ["Witchseeker Squad","Gun Stock","C","3",3,3,0,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Aleya","Epic Hero"],
  ["Allarus Custodians","Infanterie"],
  ["Anathema Psykana Rhino","Véhicule"],
  ["Aquilon Terminators with Solarite Power Gauntlets","Infanterie"],
  ["Aquilon Terminators with Solarite Power Talons","Infanterie"],
  ["Ares Gunship","Véhicule"],
  ["Blade Champion","Personnage"],
  ["Caladius Annihilator Grav-tank","Véhicule"],
  ["Caladius Grav-tank","Véhicule"],
  ["Contemptor-Achillus Dreadnought","Véhicule"],
  ["Contemptor-Galatus Dreadnought","Véhicule"],
  ["Coronus Grav-carrier","Véhicule"],
  ["Custodian Guard Sodality","Battleline"],
  ["Custodian Guard Sodality with Adrasite Spears","Infanterie"],
  ["Custodian Guard Sodality with Pyrithite Spears","Infanterie"],
  ["Custodian Wardens","Infanterie"],
  ["Gyrfalcon Jetbike Sodality","Monté"],
  ["Knight-Centura","Personnage"],
  ["Orion Assault Dropship","Véhicule"],
  ["Pallas Grav-attack","Véhicule"],
  ["Prosecutor Squad","Infanterie"],
  ["Sagittarum Custodians Sodality","Infanterie"],
  ["Sentinel Guard Sodality","Battleline"],
  ["Shield-Captain","Personnage"],
  ["Shield-Captain in Allarus Terminator Armour","Personnage"],
  ["Shield-Captain on Dawneagle Jetbike","Personnage"],
  ["Telemon Heavy Dreadnought","Véhicule"],
  ["Trajann Valoris","Epic Hero"],
  ["Valerian","Epic Hero"],
  ["Venatari with Kinetic Destroyers","Infanterie"],
  ["Venatari with Verutum Lances","Infanterie"],
  ["Venerable Contemptor Dreadnought","Véhicule"],
  ["Venerable Land Raider","Véhicule"],
  ["Vertus Praetors","Monté"],
  ["Vigilator Squad","Infanterie"],
  ["Witchseeker Squad","Infanterie"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Aleya": [
  "Prosecutor Squad",
  "Vigilator Squad",
  "Witchseeker Squad"
 ],
 "Blade Champion": [
  "Custodian Guard Sodality",
  "Custodian Wardens",
  "Sentinel Guard Sodality"
 ],
 "Shield-Captain": [
  "Custodian Guard Sodality",
  "Custodian Guard Sodality with Adrasite Spears",
  "Custodian Guard Sodality with Pyrithite Spears",
  "Custodian Wardens",
  "Sagittarum Custodians Sodality",
  "Sentinel Guard Sodality"
 ],
 "Shield-Captain in Allarus Terminator Armour": [
  "Allarus Custodians",
  "Aquilon Terminators with Solarite Power Gauntlets",
  "Aquilon Terminators with Solarite Power Talons"
 ],
 "Shield-Captain on Dawneagle Jetbike": [
  "Gyrfalcon Jetbike Sodality",
  "Vertus Praetors"
 ],
 "Trajann Valoris": [
  "Allarus Custodians",
  "Aquilon Terminators with Solarite Power Gauntlets",
  "Aquilon Terminators with Solarite Power Talons",
  "Custodian Guard Sodality",
  "Custodian Guard Sodality with Adrasite Spears",
  "Custodian Guard Sodality with Pyrithite Spears",
  "Custodian Wardens",
  "Sagittarum Custodians Sodality",
  "Sentinel Guard Sodality"
 ],
 "Valerian": [
  "Custodian Guard Sodality",
  "Custodian Guard Sodality with Adrasite Spears",
  "Custodian Guard Sodality with Pyrithite Spears",
  "Custodian Wardens",
  "Sagittarum Custodians Sodality",
  "Sentinel Guard Sodality"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Aleya": [
  [
   "Tactical Perception",
   "This unit has Fights First."
  ],
  [
   "Tenacious Spirit",
   "- While this unit is below starting strength, this unit's attacks have +1 to hit rolls.\n- While this unit is below half-strength, this unit's attacks have +1 to wound rolls."
  ],
  [
   "Leader",
   "This model can be attached to the following units: PROSECUTORS, VIGILATORS, WITCHSEEKERS"
  ],
  [
   "Daughters of the Abyss",
   "- Friendly Anathema Psykana units with this ability have Feel No Pain 3+ against psychic attacks.\n- Friendly Anathema Psykana units with this ability have the following ability:\nPsychic Null (Aura): Friendly Adeptus Custodes units within 6\" of this unit have Feel No Pain 5+ against psychic attacks."
  ]
 ],
 "Allarus Custodians": [
  [
   "Slayers of Tyrants",
   "This unit's melee attacks that target a unit with a T greater than this unit's T have +1 to wound rolls."
  ],
  [
   "Vexilla",
   "- This unit has +1 OC.\n- This unit can ignore modifiers to this unit's Ld."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Anathema Psykana Rhino": [
  [
   "Assault Vehicle",
   "In your Movement phase, when this unit ends an advance move, units embarked within this unit can make a shock disembark move."
  ],
  [
   "Creeping Dread (Aura)",
   "In the Battle-shock step of your opponent's Command phase, each enemy unit within 12\" of this unit that is a Psyker unit/below starting strength makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Daughters of the Abyss",
   "- Friendly Anathema Psykana units with this ability have Feel No Pain 3+ against psychic attacks.\n- Friendly Anathema Psykana units with this ability have the following ability:\nPsychic Null (Aura): Friendly Adeptus Custodes units within 6\" of this unit have Feel No Pain 5+ against psychic attacks."
  ]
 ],
 "Blade Champion": [
  [
   "Leader",
   "This model can be attached to the following units: CUSTODIAN GUARD, CUSTODIAN GUARD WITH ADRASITE AND PYRITHITE SPEARS, CUSTODIAN WARDENS, SAGITTARUM CUSTODIANS"
  ],
  [
   "Sword of the Throne",
   "At the start of the first battle round, select one enemy unit to be this model's mark.\n-This model's attacks that target this model's mark have +1 to wound rolls.\n- Each time this model's mark is destroyed, select one enemy unit to be this model's mark."
  ],
  [
   "Swift Onslaught",
   "This unit can:\n- Re-roll advance rolls.\n- Re-roll charge rolls."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Custodian Guard Sodality": [
  [
   "Impenetrable Defence",
   "This unit's attacks have [SUSTAINED HITS 1: non-MONSTER/VEHICLE] if any of the following apply:\n- This unit is within range of an objective.\n- The target of those attacks is within range of an objective."
  ],
  [
   "Vexilla",
   "- This unit has +1 OC.\n- This unit can ignore modifiers to this unit's Ld."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Custodian Wardens": [
  [
   "Living Fortress",
   "Attacks that target this unit have -1AP."
  ],
  [
   "Vexilla",
   "- This unit has +1 OC.\n- This unit can ignore modifiers to this unit's Ld."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Knight-Centura": [
  [
   "Support",
   "This model can be attached to the following units:\n- Prosecutors\n- Vigilators\n- Witchseekers"
  ],
  [
   "Seeker's Instincts",
   "- This unit has +2\" M.\n- This unit can re-roll advance rolls and charge rolls."
  ],
  [
   "Corner the Quarry",
   "When an enemy unit (excluding MONSTERS/VEHICLES) engaged with this unit makes a fall-back move, that enemy unit must use the desperate escape mode. If that enemy unit is battle-shocked, -1 from those hazard rolls."
  ],
  [
   "Creeping Dread (Aura)",
   "In the Battle-shock step of your opponent's Command phase, each enemy unit within 12\" of this unit that is a Psyker unit/below starting strength makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Daughters of the Abyss",
   "- Friendly Anathema Psykana units with this ability have Feel No Pain 3+ against psychic attacks.\n- Friendly Anathema Psykana units with this ability have the following ability:\nPsychic Null (Aura): Friendly Adeptus Custodes units within 6\" of this unit have Feel No Pain 5+ against psychic attacks."
  ]
 ],
 "Prosecutor Squad": [
  [
   "Purity of Execution",
   "In your Shooting phase, you can select one visible enemy unit within 18\" of this unit. That unit is detected.\n- While a unit is detected, that unit has +3\" detection range."
  ],
  [
   "Creeping Dread (Aura)",
   "In the Battle-shock step of your opponent's Command phase, each enemy unit within 12\" of this unit that is a Psyker unit/below starting strength makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Daughters of the Abyss",
   "- Friendly Anathema Psykana units with this ability have Feel No Pain 3+ against psychic attacks.\n- Friendly Anathema Psykana units with this ability have the following ability:\nPsychic Null (Aura): Friendly Adeptus Custodes units within 6\" of this unit have Feel No Pain 5+ against psychic attacks."
  ]
 ],
 "Shield-Captain": [
  [
   "Leader",
   "This model can be attached to the following units: CUSTODIAN GUARD, CUSTODIAN GUARD WITH ADRASITE AND PYRITHITE SPEARS, CUSTODIAN WARDENS, SAGITTARUM CUSTODIANS"
  ],
  [
   "Vengeful Surge",
   "(Once per battle, per unit)\nIn your opponent's Shooting phase, when an enemy unit has shot, if a model in this unit lost a wound as a result of those attacks, this unit can make a surge move of up to D6+2\""
  ],
  [
   "Master of the Ka'tahs",
   "(Once per battle round, per unit)\nIf this unit is not readied, you can use this ability. If you do, this unit is readied."
  ],
  [
   "Praesidium Shield",
   "Attacks allocated to this model have -1 D."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ],
  [
   "Aquila Commander",
   "At the start of the battle round, if a model with this ability is your Warlord, gain 1CP."
  ]
 ],
 "Shield-Captain in Allarus Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units: ALLARUS CUSTODIANS, AQUILON CUSTODIANS"
  ],
  [
   "Archeotech Teleport-shunter",
   "(Once per battle, per unit)\nIn your Movement phase, if this unit is unengaged and has not been selected to move this phase, you can use this ability. If you do, place this unit in strategic reserves and this unit must make an ingress move this phase."
  ],
  [
   "Master of the Ka'tahs",
   "(Once per battle round, per unit)\nIf this unit is not readied, you can use this ability. If you do, this unit is readied."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ],
  [
   "Aquila Commander",
   "At the start of the battle round, if a model with this ability is your Warlord, gain 1CP."
  ]
 ],
 "Shield-Captain on Dawneagle Jetbike": [
  [
   "Leader",
   "This model can be attached to the following units: AGAMATUS CUSTODIANS, VERTUS PRAETORS"
  ],
  [
   "Sweeping Advance",
   "(Once per battle, per unit)\nAt the end of the Fight phase, if this unit was eligible to fight this phase:\n- If this unit is unengaged, this unit can make a normal move.\n- Or: if this unit is engaged, this unit can make a fall-back move."
  ],
  [
   "Master of the Ka'tahs",
   "(Once per battle round, per unit)\nIf this unit is not readied, you can use this ability. If you do, this unit is readied."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aquila Commander",
   "At the start of the battle round, if a model with this ability is your Warlord, gain 1CP."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Trajann Valoris": [
  [
   "Leader",
   "This model can be attached to the following units: ALLARUS CUSTODIANS, AQUILON TERMINATORS WITH SOLARITE POWER GAUNTLETS, AQUILON TERMINATORS WITH SOLARITE POWER TALONS, CUSTODIAN GUARD SODALITY, CUSTODIAN GUARD SODALITY WITH ADRASITE SPEARS, CUSTODIAN GUARD SODALITY WITH PYRITHITE SPEARS, CUSTODIAN WARDENS, SAGITTARUM CUSTODIANS SODALITY, SENTINEL GUARD SODALITY"
  ],
  [
   "Captain-General (Aura)",
   "Friendly Adeptus Custodes units (excluding MONSTER/VEHICLE units) within 6\" of this model can:\n- Re-roll hit rolls of 1\n- Re-roll wound rolls of 1"
  ],
  [
   "Moment Shackle",
   "(Once per battle, per army)\nAt the start of any phase, you can select one of the following to take effect until the end of the phase:\n- This model’s Watcher’s Axe weapon has +3 A.\n- This model has 3+ InSv."
  ],
  [
   "Aquila Commander",
   "At the start of the battle round, if a model with this ability is your Warlord, gain 1CP."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ]
 ],
 "Valerian": [
  [
   "Leader",
   "This model can be attached to the following units: CUSTODIAN GUARD, CUSTODIAN GUARD WITH ADRASITE AND PYRITHITE SPEARS, CUSTODIAN WARDENS, SAGITTARUM CUSTODIANS"
  ],
  [
   "Golden Laurels",
   "Attacks that target this unit have -1 AP."
  ],
  [
   "Hero of Lion's Gate",
   "(Once per battle, per unit)\nAfter making a hit roll, wound roll or save roll for this model, you can change the result to an unmodified 6."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ],
  [
   "Aquila Commander",
   "At the start of the battle round, if a model with this ability is your Warlord, gain 1CP."
  ]
 ],
 "Venerable Contemptor Dreadnought": [
  [
   "Unyielding Ancient",
   "(Once per battle, per unit)\nAt the end of a phase in which this model is destroyed, roll one D6:\n- On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed, unengaged and with 3 wounds remaining"
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Venerable Land Raider": [
  [
   "Assault Ramp",
   "In your Movement phase, when this unit ends a normal move, units embarked within this unit can make an assault disembark move."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Vertus Praetors": [
  [
   "Quicksilver Execution",
   "If this unit made a charge move this turn, this unit's melee attacks have [SUSTAINED HITS 1]"
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Vigilator Squad": [
  [
   "Deft Parry",
   "Melee attacks that target this unit have -1 to hit rolls."
  ],
  [
   "Creeping Dread (Aura)",
   "In the Battle-shock step of your opponent's Command phase, each enemy unit within 12\" of this unit that is a Psyker unit/below starting strength makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Daughters of the Abyss",
   "- Friendly Anathema Psykana units with this ability have Feel No Pain 3+ against psychic attacks.\n- Friendly Anathema Psykana units with this ability have the following ability:\nPsychic Null (Aura): Friendly Adeptus Custodes units within 6\" of this unit have Feel No Pain 5+ against psychic attacks."
  ]
 ],
 "Witchseeker Squad": [
  [
   "Sanctified Flames",
   "In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. That enemy unit makes a battle-shock roll* with -1 to that battle-shock roll if that enemy unit is a Psyker unit.."
  ],
  [
   "Creeping Dread (Aura)",
   "In the Battle-shock step of your opponent's Command phase, each enemy unit within 12\" of this unit that is a Psyker unit/below starting strength makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Daughters of the Abyss",
   "- Friendly Anathema Psykana units with this ability have Feel No Pain 3+ against psychic attacks.\n- Friendly Anathema Psykana units with this ability have the following ability:\nPsychic Null (Aura): Friendly Adeptus Custodes units within 6\" of this unit have Feel No Pain 5+ against psychic attacks."
  ]
 ],
 "Custodian Guard Sodality with Adrasite Spears": [
  [
   "Stand Vigil",
   "This unit's attacks can:\n- Re-roll wound rolls of 1.\n- Or: If this unit is within range of an objective, re-roll wound rolls"
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Sagittarum Custodians Sodality": [
  [
   "Disintegration Beams",
   "(Once per battle, per unit)\nIn your Shooting phase, you can use this ability. If you do, this unit's ranged attacks have [DEVASTATING WOUNDS]."
  ],
  [
   "Saturation Volleys",
   "In your Shooting phase, after this unit has shot, you can select one enemy non-Monster/Vehicle unit hit by those attacks. That unit is suppressed until the start of your next turn:\n- While a unit is suppressed, that unit's attacks have -1 to hit rolls."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Gyrfalcon Jetbike Sodality": [
  [
   "Death Blow",
   "If this unit made a charge move this turn, this unit's melee attacks have +1 AP."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Venatari with Kinetic Destroyers": [
  [
   "Strike from the Skies",
   "In your Shooting phase, if this unit made an ingress move this turn, this unit's ranged attacks can re-roll hit rolls."
  ],
  [
   "Neutronium Cascade Mine",
   "(Once per battle, per unit)\nAt the start of any phase, you can select one enemy unit within 3\" of this unit and roll one D6. On a 2+:\n- That enemy unit suffers D3 mortal wounds.\n- Or: if that enemy unit is a VEHICLE/MONSTER unit that enemy unit suffers 2D3 mortal wounds."
  ],
  [
   "Take Wing",
   "At the end of your opponent's Fight phase, if this unit is unengaged, you can place this unit in strategic reserves."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Contemptor-Galatus Dreadnought": [
  [
   "Unyielding Ancient",
   "Attacks that target this unit with a S greater than this unit's T have -1 to wound rolls."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Contemptor-Achillus Dreadnought": [
  [
   "Unyielding Ancient",
   "Attacks that target this unit with a S greater than this unit's T have -1 to wound rolls."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Pallas Grav-attack": [
  [
   "Mobile Hunter",
   "In your Shooting phase, when this unit has shot, you can use this ability. If you do:\n- This unit can make a normal move of up to D6\".\n- This unit is not eligible to declare a charge until the end of the turn."
  ],
  [
   "Flare Shields",
   "This unit has a 4+ InSv against ranged attacks."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Caladius Grav-tank": [
  [
   "Destructor Optics",
   "This unit's ranged attacks that target a unit (excluding MONSTER/VEHICLE) have +1 AP."
  ],
  [
   "Flare Shields",
   "This unit has a 4+ InSv against ranged attacks."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Telemon Heavy Dreadnought": [
  [
   "Guardian Eternal",
   "Ranged attacks that target this unit have -1 D."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Coronus Grav-carrier": [
  [
   "Assault Vehicle",
   "In your Movement phase, when this unit ends an advance move, units embarked within this unit can make a shock disembark move."
  ],
  [
   "Repulsor Suspensor Technology",
   "(Once per phase, per unit)\nIn your opponent's Shooting phase, when an enemy unit has shot, if this unit lost a wound as a result of those attacks and is unengaged, this unit can make a normal move* of up to D6\"."
  ],
  [
   "Flare Shields",
   "This unit has a 4+ InSv against ranged attacks."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Orion Assault Dropship": [
  [
   "Assault Dropship",
   "In your Movement phase, when a friendly Adeptus Custodes unit is selected to make a tactical disembark move from this unit, if that unit is then selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Ares Gunship": [
  [
   "Infernus Firebombs",
   "At the end of your opponent's Fight phase, select one visible enemy unit (excluding Lone Operative and Aircraft units) within 24\" of this unit:\n- Ranged attacks that target that enemy unit have [IGNORES COVER] until the end of your next turn,\n- Roll one D6 for each model in that enemy unit:\n- On a 6, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds)."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Sentinel Guard Sodality": [
  [
   "Stand Vigil",
   "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE] if any of the following apply:\n- This unit is within range of an objective.\n- The target of those attacks is within range of an objective."
  ],
  [
   "Praesidium Shield",
   "Attacks that target this unit with a S greater than this unit's T have -1 to wound rolls."
  ],
  [
   "Vexilla",
   "- This unit has +1 OC.\n- This unit can ignore modifiers to this unit's Ld."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Aquilon Terminators with Solarite Power Gauntlets": [
  [
   "Dread Foe",
   "This unit's melee attacks that target a unit (excluding MONSTER/VEHICLE units) have +1 AP."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ]
 ],
 "Aquilon Terminators with Solarite Power Talons": [
  [
   "Reap a Terrible Tally",
   "This unit’s attacks that target an Infantry unit can:\n- Re-roll hit rolls of 1.\n- Re-roll wound rolls of 1."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ]
 ],
 "Venatari with Verutum Lances": [
  [
   "Swift Ruin",
   "(Once per phase, per army)\nYou can target this unit with the Rapid Ingress stratagem regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1CP.\n- That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Neutronium Cascade Mine",
   "(Once per battle, per unit)\nAt the start of any phase, you can select one enemy unit within 3\" of this unit and roll one D6. On a 2+:\n- That enemy unit suffers D3 mortal wounds.\n- Or: if that enemy unit is a VEHICLE/MONSTER unit that enemy unit suffers 2D3 mortal wounds."
  ],
  [
   "Take Wing",
   "At the end of your opponent's Fight phase, if this unit is unengaged, you can place this unit in strategic reserves."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Caladius Annihilator Grav-tank": [
  [
   "Advanced Firepower",
   "This unit's ranged attacks that target a MONSTER/VEHICLE unit can:\n- Re-roll one hit roll.\n- Re-roll one wound roll.\n- Re-roll one damage roll."
  ],
  [
   "Flare Shields",
   "This unit has a 4+ InSv against ranged attacks."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ],
 "Custodian Guard Sodality with Pyrithite Spears": [
  [
   "No Foe Shall Stand",
   "(Once per battle, per unit)\nThis unit's ranged attacks have [LETHAL HITS] and [IGNORES COVER]."
  ],
  [
   "Martial Ka'tah",
   "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka-tah abilities for that unit to use. If you do, that unit is no longer readied.\n\nEach ka-tah ability will tell you when that ka-tah ability can be used and the effects that ka-tah ability has on the unit using it."
  ],
  [
   "Aegis of the Emperor",
   "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Aquilan Shield",1,"Shield Host","Gilded Guardians","While a friendly Adeptus Custodes unit (excluding Monster/Vehicle units) is within range of an objective, ranged attacks that target that unit with a S greater than that unit’s T have -1 to wound rolls. Favoured ka’tah: Salvus Additional Effect: Your unit’s ranged attacks have +6\" R.","",0,"","Take and Hold"],
  ["Auric Champions",1,"","Assemblage of Might","In your Command phase, you can select one enemy unit to be a dreadful foe unit until the start of your next Command phase. Friendly Adeptus Custodes Character models’ attacks that target a dreadful foe unit have +1 to wound rolls.","",0,"","Purge the Foe"],
  ["Dread Host",1,"Shield Host","Instruments of the Emperor’s Wrath","Friendly Adeptus Custodes units can re-roll charge rolls. Favoured ka’tah: Dacatarai Additional Effect: When an enemy unit engaged with your unit makes a pile-in/consolidation move, -2\" from that pile-in/consolidation move.","",0,"","Purge the Foe"],
  ["Emissaries Imperatus",1,"Shield Host","Heralds of the Throne","Friendly Adeptus Custodes units have Fights First. Favoured Ka’tah: Conservai Additional Effect: Until the end of the turn, being selected to make an advance/fall-back move does not prevent your unit from being eligible to start an action.","",0,"","Priority Assets"],
  ["Emperor’s Chosen",1,"Shield Host","Magna Imperator","When a friendly Adeptus Custodes unit is selected to attack, that unit’s attacks can: ▪ Re-roll one hit roll. ▪ Re-roll one wound roll. Favoured ka’tah: Rendax Additional Effect: You can select one enemy MONSTER/VEHICLE unit engaged with your unit and roll one D6: ▪ On a 1-2, that enemy unit suffers 1 mortal wound. ▪ On a 3-5, that enemy unit suffers D3 mortal wounds. ▪ On a 6, that enemy unit suffers 3 mortal wounds.","",0,"","Priority Assets"],
  ["Grav‑Assault Force",1,"","Flare Shields","Friendly grav-assault units have 4+ InSv against ranged attacks.","",0,"","Reconnaissance"],
  ["Guardians of the Throne",3,"","Martial Mastery","In the Fight phase, when a friendly Adeptus Custodes unit is selected to fight, that unit’s melee attacks have: ▪ [Sustained Hits 1]. ▪ Or: [Lethal Hits].","",0,"","Priority Assets"],
  ["Honoured Companions",1,"","Companion’s Watch","While a friendly Trusted Sentinel unit is within range of an objective, that unit’s attacks can re-roll wound rolls of 1.","",0,"","Take and Hold"],
  ["Lions of the Emperor",1,"","On Gilded Wings","At the end of your opponent’s Fight phase, if a friendly Adeptus Custodes Terminator unit is unengaged, you can place that unit in strategic reserves.","",0,"","Disruption"],
  ["Might of the Moritoi",1,"","Moritoi Ancients","▪ While a friendly Adeptus Custodes Dreadnought unit is at starting strength, that unit has +2 OC. ▪ While a friendly ADEPTUS CUSTODES DREADNOUGHT unit is below starting strength, that unit’s attacks can re-roll hit rolls of 1. ▪ While a friendly ADEPTUS CUSTODES DREADNOUGHT unit is below half-strength, that unit’s attacks can: ▪ Re-roll hit rolls of 1. ▪ Re-roll wound rolls of 1.","",0,"","Take and Hold"],
  ["Null Maiden Vigil",1,"","Silent Sisterhood","▪ When mustering your army, you can select a friendly Anathema Psykana Character model to be your WARLORD. ▪ Friendly Prosecutor SQUAD units have BATTLELINE. ▪ Friendly Anathema Psykana units have the following ability: Creeping Dread (Aura): In the Battle-shock step of your opponent’s Command phase, each enemy unit within 12\" of this unit that is a PSYKER unit/below starting strength makes a battle-shock roll, with -1 to that battle-shock roll.","",0,"","Disruption"],
  ["Shadowkeepers",1,"Shield Host","Wardens of the Dark Cells","While a friendly Adeptus Custodes unit (excluding Monster/Vehicle units) is within range of an objective, melee attacks that target that unit with a S greater than that unit’s T have -1 to wound rolls. Favoured ka’tah: Kaptaris Additional Effect: You can select one enemy unit engaged with your unit. That enemy unit must make a battle-shock roll, with -1 to that battle-shock roll. You cannot select the same enemy unit for this effect more than once per phase.","",0,"","Purge the Foe"],
  ["Solar Watch",1,"Shield Host","Talon Sortie","When a friendly Adeptus Custodes unit makes a fall-back move, that fall-back move does not prevent that unit from being eligible to charge. Favoured ka’tah: Calistus Additional Effect: Your unit has +2\" M.","",0,"","Reconnaissance"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Not a Shell Wasted",10,"Aquilan Shield","This unit's ranged attacks have +1 A.",null],
  ["Pareldor’s Caducatrix",30,"Aquilan Shield","(Once per battle, per army) At the start of any phase, this model heals D3+3 wounds.",null],
  ["Inspirational Exemplar",10,"Auric Champions","(Once per battle round, per army) At the start of any phase, you can select one friendly battle-shocked Adeptus Custodes unit within 9\" of the bearer: that unit is no longer battle-shocked.",null],
  ["Shroud of the Hidden Blade",20,"Auric Champions","This model has:\n- Stealth\n- Lone Operative",null],
  ["Superior Creation",30,"Auric Champions","(Once per battle, per army)\nAt the end of a phase in which this model is destroyed, roll one D6:\n- On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed, unengaged with 3 wounds remaining.",null],
  ["Auric Exemplar",15,"Dread Host","This model's melee attacks have [CLEAVE 1].",null],
  ["Flawless Bladework",15,"Dread Host","This model's melee attacks have [SUSTAINED HITS 1].",null],
  ["Auriferous Orb",20,"Emissaries Imperatus","ADEPTUS CUSTODES model only. This model has the following weapon:",null],
  ["Edge of the Blade",15,"Emissaries Imperatus","If this unit made a charge move this turn, this model's attacks can:\n- Re-roll hit rolls of 1.\n- Re-roll wound rolls of 1.",null],
  ["From the Hall of Armouries",15,"Emperor’s Chosen","This model's melee attacks have [DEVASTATING WOUNDS].",null],
  ["Radiant Mantle",40,"Emperor’s Chosen","Attacks that target this unit have -1 to hit rolls.",null],
  ["Anti-gravitic Mobility (Upgrade)",15,"Grav‑Assault Force","grav-assault unit only. When this unit makes a fall-back move, that fall-back move does not prevent this unit from being eligible to shoot.",null],
  ["Combat Deployment (Upgrade)",20,"Grav‑Assault Force","grav-assault Transport model only. When a friendly Adeptus Custodes unit is selected to make a disembark move from this unit, until the end of the turn: ▪ That unit can re-roll charge rolls. ▪ Enemy units cannot target that unit with snap shooting attacks.",null],
  ["Bane of Abominations",20,"Guardians of the Throne","This model's attacks that target an enemy Character/Monster/Vehicle unit have +1 to wound rolls.",null],
  ["Castellan’s Mark",25,"Guardians of the Throne","When both players have deployed their armies, you can redeploy up to three friendly Adeptus Custodes units. When doing so, you can set those units up in strategic reserves, regardless of how many units are already in strategic reserves.",null],
  ["Eagle’s Eye",30,"Guardians of the Throne","- This model has +1 W.\n- (Once per battle, per army) When attacks are allocated to this model, you can use this ability. If you do, this model has 3+ InSv.",null],
  ["Emperor’s Light",15,"Guardians of the Throne","ADEPTUS CUSTODES model only. This model has the following weapon:",null],
  ["Arae-Shrike",20,"Honoured Companions","Enemy units that are selected to make an ingress move cannot be set up within 12\" of this unit.",null],
  ["Celeritous Sentries (Upgrade)",15,"Honoured Companions","Trusted Sentinel unit only. (Once per phase, per unit) You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: ▪ That use is -1 CP. ▪ That use does not prevent any uses of that stratagem on other units this phase.",null],
  ["Leonine Ferocity",20,"Lions of the Emperor","(Once per phase, per unit)\nYou can target this unit with the Rapid Ingress stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase.",null],
  ["Lightning Descent",20,"Lions of the Emperor","In your first Movement phase, this unit can make an ingress move.",null],
  ["Augury Uplink (one per army) (Upgrade)",30,"Might of the Moritoi","Adeptus Custodes Dreadnought model only. This model has Feel No Pain 5+.",null],
  ["Memento Moritoi (one per army) (Upgrade)",30,"Might of the Moritoi","Adeptus Custodes Dreadnought model only. This model’s melee attacks have +1 A, S and D.",null],
  ["Huntress’ Eye",10,"Null Maiden Vigil","In your Movement phase, you can select one visible enemy unit within 12\" of this unit. That unit makes a battle-shock roll, with -1 to that battle-shock roll.",null],
  ["Oblivion Knight",15,"Null Maiden Vigil","This unit's attacks have:\n- +1 to hit rolls.\n- Or: If this unit targets a Psyker/battle-shocked unit, +1 to hit rolls and wound rolls.",null],
  ["Genalchemic Warding",30,"Shadowkeepers","This model has Feel No Pain 5+.",null],
  ["Unstoppable Destroyer",25,"Shadowkeepers","When this unit is selected to make a pile-in/consolidation move:\n- This unit can move up to 4\".\n- You can select any consolidation mode for that consolidation move, regardless of that consolidation move's Before Moving restrictions.",null],
  ["Auric Eagle (Upgrade)",15,"Solar Watch","Adeptus Custodes Infantry/Mounted unit only (excluding Terminator units). This unit has +1 to advance rolls and charge rolls.",null],
  ["Sally Forth",30,"Solar Watch","At the start of your Charge phase, select one friendly Adeptus Custodes Infantry unit within 6\" of this model. If that unit made an advance move this turn, that advance move does not prevent that unit from being eligible to declare a charge.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Manoeuvre and Fire","Aquilan Shield","",1,"Your Movement phase, when a friendly Adeptus Custodes unit is selected to make a fall-back move.","That ADEPTUS CUSTODES unit.","That move does not prevent your unit from being eligible to shoot/declare a charge.",""],
  ["Rapid Reactions","Aquilan Shield","",1,"Your opponent’s Movement phase, when an enemy unit ends a fall-back move.","One friendly Adeptus Custodes Infantry unit that was engaged with that enemy unit at the start of the phase.","Your unit shoots using normal shooting, but while doing so your unit can only target that enemy unit.",""],
  ["Tip of the Talon","Aquilan Shield","",1,"Your Shooting phase, when a friendly Adeptus Custodes unit is selected to shoot.","That ADEPTUS CUSTODES unit.","Your unit’s ranged attacks that target an enemy unit within 9\" of your unit have +1 S.",""],
  ["Duty Unto Death","Auric Champions","",1,"Fight phase, when an enemy unit targets a friendly Adeptus Custodes unit.","That ADEPTUS CUSTODES unit.","When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +1 to that roll if that model is a Character model: ▪ On a 3+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Gilded Champion","Auric Champions","",1,"Any phase, when a friendly Adeptus Custodes Character model has used a (Once per battle, per unit) datasheet ability.","That ADEPTUS CUSTODES CHARACTER model.","Your model can use that (Once per battle, per unit) datasheet ability one additional time, but not in the same phase.","You cannot use this stratagem on the same ADEPTUS CUSTODES CHARACTER model more than once per battle."],
  ["Golden Light of the Moiraides","Dread Host","",2,"Your Movement phase, when a friendly Adeptus Custodes unit is selected to make an ingress move.","That ADEPTUS CUSTODES Unit.","Until the start of your next turn: ▪ Attacks that target your unit have -1 to hit rolls. ▪ Enemy units cannot target your unit with snap shooting attacks.",""],
  ["Lightning Wrath","Dread Host","",1,"Fight phase, when a friendly Adeptus Custodes unit is selected to make a pile-in move.","That ADEPTUS CUSTODES unit.","When making that pile-in move, your unit can move up to D3+3\".",""],
  ["Preternatural Rapidity","Dread Host","",1,"Your Movement phase, when a friendly Adeptus Custodes unit ends an advance move.","That ADEPTUS CUSTODES unit.","That advance move does not prevent your unit from being eligible to declare a charge.",""],
  ["Bearers of His Light","Emissaries Imperatus","",1,"Fight phase, when a friendly Adeptus Custodes unit is selected to fight.","That ADEPTUS CUSTODES unit.","Your unit’s melee attacks can ignore modifiers to hit rolls and wound rolls.",""],
  ["Selfless Service","Emissaries Imperatus","",1,"End of your opponent’s Charge phase.","One friendly unengaged Adeptus Custodes unit within 6\" of an enemy unit. You can only select a VEHICLE unit if it is a CHARACTER/WALKER unit.","Declare a charge with your unit: ▪ When making the charge roll, if the result is greater than 6 (after modifiers), change it to 6. ▪ When selecting charge targets, you can select any enemy units that are within 6\" of your unit and within the maximum distance.",""],
  ["Slayers of Nightmares","Emissaries Imperatus","",1,"Fight phase, when a friendly Adeptus Custodes unit is selected to fight.","That ADEPTUS CUSTODES unit.","Your unit’s melee attacks that target a unit with a T greater than this unit’s T have +1 to wound rolls.",""],
  ["Impenetrable Bastion","Emperor’s Chosen","",1,"End of your Movement phase.","One friendly Adeptus Custodes unit (excluding Monster/Vehicle units).","Select one objective your unit is controlling. That objective is secured.",""],
  ["In Auramite Clad","Emperor’s Chosen","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly Adeptus Custodes unit (excluding Custodian Wardens units).","That ADEPTUS CUSTODES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Superhuman Focus","Emperor’s Chosen","",1,"End of any phase.","One friendly Adeptus Custodes unit that is not readied.","Your unit is readied.","You cannot select the same unit as the target of this stratagem more than once per battle round."],
  ["Advanced Stabilisers","Grav‑Assault Force","",1,"Your Shooting phase, when a friendly grav-assault unit is selected to shoot.","That GRAV-ASSAULT unit.","Your unit’s ranged attacks have [Assault].",""],
  ["Inevitable Annihilation","Grav‑Assault Force","",1,"Your Shooting phase, when a friendly grav-assault unit is selected to shoot.","That GRAV-ASSAULT unit.","Your unit can ignore modifiers to your unit’s: ▪ BS. ▪ Hit rolls.",""],
  ["Victory Before Death","Grav‑Assault Force","",1,"Any phase, when a friendly grav-assault unit within range of an objective is destroyed.","That GRAV-ASSAULT unit. You can target that unit with this stratagem even though it is destroyed.","Select one objective that: ▪ Your unit was controlling when it was destroyed. ▪ Has no enemy units (excluding AIRCRAFT units) within range of it. That objective is secured.",""],
  ["In Auramite Clad","Guardians of the Throne","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly Adeptus Custodes unit (excluding Custodian Wardens units).","That ADEPTUS CUSTODES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Prime Target","Guardians of the Throne","",1,"Your Shooting phase, when a friendly Adeptus Custodes unit is selected to shoot.","That ADEPTUS CUSTODES unit.","Your unit’s ranged attacks can: ▪ Re-roll one hit roll. ▪ Re-roll one wound roll. ▪ Re-roll one damage roll.",""],
  ["Shield of Honour","Guardians of the Throne","",1,"Start of the Fight phase.","One friendly Adeptus Custodes Infantry/Mounted unit.","When an enemy model engaged with your unit selects targets, if that enemy model does not select your unit as the target of all of its attacks, that enemy model’s attacks have: ▪ -1 to hit rolls. ▪ -1 to wound rolls.",""],
  ["Superhuman Focus","Guardians of the Throne","",1,"End of any phase.","One friendly Adeptus Custodes unit that is not readied.","Your unit is readied.","You cannot select the same unit as the target of this Stratagem more than once per battle round."],
  ["Swift As the Eagle","Guardians of the Throne","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged Trusted Sentinel unit.","That TRUSTED SENTINEL unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Unlimited Endurance","Guardians of the Throne","",1,"Your Movement phase, when a friendly Adeptus Custodes unit ends an advance move.","That ADEPTUS CUSTODES unit.","Until the end of the turn: ▪ Your unit’s ranged attacks have [Assault]. ▪ That advance move does not prevent your unit from being eligible to declare a charge.",""],
  ["Avenge the Fallen","Honoured Companions","",1,"Fight phase, when a friendly Trusted Sentinel unit that is below starting strength is selected to fight.","That TRUSTED SENTINEL unit.","Your unit’s melee attacks (excluding those made by Character models) have +2 A.",""],
  ["Emperor's Domain","Honoured Companions","",1,"Fight phase, when a friendly Trusted Sentinel unit is selected to make a consolidation move.","That TRUSTED SENTINEL unit.","You can select the objective consolidation mode for that consolidation move, regardless of that consolidation move’s Before Moving restrictions. This means your unit can move out of engagement range with enemy units, provided it meets the conditions of the objective consolidation mode.",""],
  ["Swift As the Eagle","Honoured Companions","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged Trusted Sentinel unit.","That TRUSTED SENTINEL unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Fury of the Emperor","Lions of the Emperor","",1,"Your Charge phase, when a friendly Adeptus Custodes Terminator unit that made an ingress move this turn is selected to declare a charge.","That ADEPTUS CUSTODES TERMINATOR unit.","Your unit has +2 to charge rolls.",""],
  ["Unleash the Lions","Lions of the Emperor","",1,"Your Command phase.","One friendly Adeptus Custodes Terminator unit that has 2+ models.","Your unit is split into separate units, each containing one model. These new units each have a starting strength of 1.",""],
  ["Vigil Unending","Lions of the Emperor","",2,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly Adeptus Custodes Terminator unit.","That ADEPTUS CUSTODES TERMINATOR unit.","Attacks that target your unit have -1 D until that enemy unit has attacked.",""],
  ["Honoured Interred","Might of the Moritoi","",1,"Your Shooting phase or the Fight phase.","One friendly Adeptus Custodes Dreadnought unit.","Your unit has the following ability: Honoured Interred (Aura): Friendly Adeptus Custodes units within 6\" of this unit can re-roll hit rolls of 1.",""],
  ["Unceasing Onslaught","Might of the Moritoi","",1,"Your Movement phase, when a friendly Adeptus Custodes Dreadnought unit ends an advance move.","That ADEPTUS CUSTODES DREADNOUGHT unit.","▪ Your unit’s ranged attacks have [Assault] until the end of the turn. ▪ That move does not prevent your unit from being eligible to declare a charge.",""],
  ["Unstoppable Momentum","Might of the Moritoi","",1,"Your Movement/Charge phase, when a friendly Adeptus Custodes Dreadnought unit is selected to move or declares a charge.","That ADEPTUS CUSTODES DREADNOUGHT unit.","Your unit has Mobile.",""],
  ["Anathema Blademastery","Null Maiden Vigil","",1,"Fight phase, when a friendly Vigilator squad unit is selected to fight.","That VIGILATOR SQUAD unit.","Your unit’s attacks have: ▪ [Sustained Hits 1] ▪ Or: [Lethal Hits].",""],
  ["Psy-Chaff Volley","Null Maiden Vigil","",1,"Your Shooting phase, when a friendly Prosecutor squad unit has shot.","That PROSECUTOR SQUAD unit.","Select one enemy unit hit by those attacks. That unit is prosecuted until the end of the turn: ▪ Attacks that target a prosecuted unit have +1 AP.",""],
  ["Purgation Sweep","Null Maiden Vigil","",1,"Your Shooting phase, when a friendly Witchseeker squad unit is selected to shoot.","That WITCHSEEKER SQUAD unit.","Your unit’s [Torrent] attacks have: ▪ +1 A. ▪ Or: If those attacks target a PSYKER/battle-shocked unit, +2 A.",""],
  ["Grim Responsibility","Shadowkeepers","",1,"Fight phase, when a friendly Adeptus Custodes Infantry unit is selected to fight.","That ADEPTUS CUSTODES unit.","Your unit’s melee attacks have [Lethal Hits: Character/Monster].",""],
  ["Indomitable Guardians","Shadowkeepers","",1,"Your opponent’s Fight phase, when an enemy unit has fought.","One friendly Adeptus Custodes unit that is within range of an objective and is eligible to fight.","Your unit has Fights First and must be the next unit you select to fight.",""],
  ["No Escape","Shadowkeepers","",2,"Your opponent’s Movement phase, when an enemy unit ends a fall-back move.","One friendly unengaged Adeptus Custodes Infantry unit that is within 6\" of that enemy unit.","Declare a charge with your unit. When selecting charge targets, you can only select enemy units that made a fall-back move this phase and are within the maximum distance.",""],
  ["At Spear's Length","Solar Watch","",1,"Your Movement phase, when a friendly Adeptus Custodes unit is selected to make a fall-back move.","That ADEPTUS CUSTODES unit.","That fall-back move does not prevent your unit from being eligible to shoot.",""],
  ["Gravimetric Grenade","Solar Watch","",1,"Start of your opponent’s Charge phase.","One friendly unengaged Adeptus Custodes unit.","Select one visible enemy unit within 12\" of your unit. When that enemy unit declares a charge, that enemy unit has -1 to charge rolls.",""],
  ["Inexorable","Solar Watch","",1,"Your Movement phase, when a friendly Adeptus Custodes unit is selected to move.","That ADEPTUS CUSTODES unit.","Until the end of the turn, your unit can ignore modifiers to your unit’s: ▪ M. ▪ Advance rolls and charge rolls.",""],
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
  "Caladius Annihilator Grav-tank",
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
  "Custodian Guard Sodality",
  "Sentinel Guard Sodality"
 ],
 "epic": [
  "Aleya",
  "Trajann Valoris",
  "Valerian"
 ],
 "infantry": [
  "Allarus Custodians",
  "Aquilon Terminators with Solarite Power Gauntlets",
  "Aquilon Terminators with Solarite Power Talons",
  "Custodian Guard Sodality with Adrasite Spears",
  "Custodian Guard Sodality with Pyrithite Spears",
  "Custodian Wardens",
  "Prosecutor Squad",
  "Sagittarum Custodians Sodality",
  "Venatari with Kinetic Destroyers",
  "Venatari with Verutum Lances",
  "Vigilator Squad",
  "Witchseeker Squad"
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
 "Custodian Guard Sodality": "40",
 "Custodian Wardens": "40",
 "Knight-Centura": "32",
 "Prosecutor Squad": "32",
 "Shield-Captain": "40",
 "Shield-Captain in Allarus Terminator Armour": "40",
 "Shield-Captain on Dawneagle Jetbike": "75x42",
 "Trajann Valoris": "40",
 "Valerian": "40",
 "Venerable Contemptor Dreadnought": "60",
 "Venerable Land Raider": "coque",
 "Vertus Praetors": "75x42",
 "Vigilator Squad": "32",
 "Witchseeker Squad": "32",
 "Custodian Guard Sodality with Adrasite Spears": "40",
 "Sagittarum Custodians Sodality": "40",
 "Gyrfalcon Jetbike Sodality": "75x42",
 "Venatari with Kinetic Destroyers": "40",
 "Contemptor-Galatus Dreadnought": "60",
 "Contemptor-Achillus Dreadnought": "60",
 "Pallas Grav-attack": "105x70",
 "Caladius Grav-tank": "170x109",
 "Telemon Heavy Dreadnought": "100",
 "Coronus Grav-carrier": "170x109",
 "Orion Assault Dropship": "160",
 "Ares Gunship": "160",
 "Sentinel Guard Sodality": "40",
 "Aquilon Terminators with Solarite Power Gauntlets": "50",
 "Aquilon Terminators with Solarite Power Talons": "50",
 "Venatari with Verutum Lances": "40",
 "Caladius Annihilator Grav-tank": "170x109",
 "Custodian Guard Sodality with Pyrithite Spears": "40"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {};

const TRANSPORTS = {
 "Anathema Psykana Rhino": "This model has a transport capacity of 12 ANATHEMA PSYKANA INFANTRY models.",
 "Venerable Land Raider": "This model has a transport capacity of 6 ADEPTUS CUSTODES INFANTRY models.",
 "Coronus Grav-carrier": "This model has a transport capacity of 8 ^^Adeptus Custodes Infantry^^ models. It cannot transport ^^**Jump Pack**^^ models.",
 "Orion Assault Dropship": "This model has a transport capacity of 12 ^^**Adeptus Custodes Infantry**^^ models. Or 1 ^^**Dreadnought**^^ models. While transporting 1 ^^**Dreadnought**^^ unit, this unit also has a transport capacity of 6 ^^**Adeptus Custodes Infantry**^^ models."
};
const FACTION = [
 [
  "Aegis of the Emperor",
  "Friendly Adeptus Custodes units with this ability have Feel No Pain 5+ against mortal wounds."
 ],
 [
  "Martial Ka’tah",
  "At the start of your Command phase, friendly Adeptus Custodes units with this ability are readied. While a friendly unit is readied, you can select one of the ka’tah abilities presented below for that unit to use. If you do, that unit is no longer readied. Each ka’tah ability will tell you when that ka’tah ability can be used, and the effects that ka’tah ability has on the unit using it. We recommend placing a token next to each readied unit, removing it when that unit is no longer readied. Favoured Ka’tah Many of the most prominent shield hosts favour a specific martial ka’tah above all others. All detachments tagged ‘Unique: Shield Host’ state a Favoured Ka’tah. If you selected one of these detachments, the ka’tah ability that is the Favoured Ka’tah of that detachment grants the additional effect listed in that detachment. Example: If you selected the Solar Watch detachment, when you select the Calistus ka’tah ability for a readied unit, that unit has +2\" M in addition to the normal effect of Calistus. CONSERVAI KA’TAH ABILITY WHEN: Your Command phase. TARGET: One friendly readied unit. EFFECT: Until the end of the turn: ▪ Being engaged/battle-shocked does not prevent your unit from being eligible to start an action. ▪ Starting an action does not prevent your unit from being eligible to shoot. CALISTUS KA’TAH ABILITY WHEN: Your Movement phase, when a friendly readied unit is selected to move. TARGET: That readied unit. EFFECT: When your unit makes a normal/advance/fall-back move, your unit can move through all types of model. SALVUS KA’TAH ABILITY WHEN: Your Shooting phase, when a friendly readied unit is selected to shoot. TARGET: That readied unit. EFFECT: Your unit can ignore modifiers to your unit’s: ▪ BS. ▪ Hit rolls and wound rolls. DACATARAI KA’TAH ABILITY WHEN: Start of the Fight phase. TARGET: One friendly readied unit. EFFECT: Your unit’s melee attacks that target an enemy unit (excluding MONSTER/VEHICLE units) can re-roll hit rolls of 1. KAPTARIS KA’TAH ABILITY WHEN: Start of the Fight phase. TARGET: One friendly readied unit. EFFECT: Melee attacks that target your unit have -1 to hit rolls. RENDAX KA’TAH ABILITY WHEN: Fight phase, when a friendly readied unit is selected to fight. TARGET: One friendly readied unit. EFFECT: Your unit’s melee attacks have [Lethal Hits: Monster/Vehicle]."
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
