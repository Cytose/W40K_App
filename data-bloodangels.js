/* ============================================================
   Données Blood Angels — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py bloodangels

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 75 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     94 fiches sur 111 en ont un. Les autres — des Legends, que le
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
  ["Aggressor Squad",5,6,3,0,3,[3, 6],{"3": 90, "6": 180},0,"",0,"",1,"6+"],
  ["Ancient",6,5,3,0,4,[1],{"1": 40},0,"Appui",0,"",2,"6+"],
  ["Ancient in Terminator Armour",5,6,2,4,5,[1],{"1": 75},0,"Appui",0,"",2,"6+"],
  ["Apothecary",6,5,3,0,4,[1],{"1": 45},0,"Appui",0,"",1,"6+"],
  ["Apothecary Biologis",5,6,3,0,5,[1],{"1": 60},0,"Appui",0,"",3,"6+"],
  ["Assault Intercessor Squad",6,5,3,0,2,[5, 10],{"5": 85, "10": 170},0,"",0,"",2,"6+"],
  ["Assault Intercessors with Jump Packs",12,5,3,0,2,[5, 10],[[1, {"5": 95, "10": 190}], [3, {"5": 105, "10": 200}]],0,"",0,"",1,"6+"],
  ["Astorath",12,5,2,4,5,[1],{"1": 90},0,"Meneur",0,"",1,"5+"],
  ["Astraeus",10,12,2,5,24,[1],[[1, {"1": 550}], [2, {"1": 650}]],0,"",0,"",8,"6+"],
  ["Baal Predator",12,10,3,0,11,[1],[[1, {"1": 135}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Ballistus Dreadnought",8,10,2,0,12,[1],[[1, {"1": 150}], [3, {"1": 170}]],0,"",0,"",4,"6+"],
  ["Bladeguard Ancient",6,5,3,4,4,[1],{"1": 70},0,"Appui",0,"",3,"6+"],
  ["Bladeguard Veteran Squad",6,5,3,4,3,[3, 6],[[1, {"3": 90, "6": 180}], [3, {"3": 110, "6": 200}]],0,"",0,"",1,"6+"],
  ["Blood Angels Captain",6,5,3,4,5,[1],{"1": 90},0,"Meneur",0,"",1,"6+"],
  ["Brother Corbulo",6,4,3,0,4,[1],{"1": 75},0,"",1,"",1,"6+"],
  ["Brutalis Dreadnought",10,10,2,0,12,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",4,"6+"],
  ["Captain",6,5,3,4,5,[1],{"1": 90},0,"Meneur",0,"",1,"6+"],
  ["Captain Tycho",6,4,2,4,4,[1],{"1": 75},0,"",1,"",1,"6+"],
  ["Captain in Gravis Armour",5,6,3,4,6,[1],{"1": 90},0,"Meneur",0,"",1,"6+"],
  ["Captain in Phobos Armour",8,4,3,4,5,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Captain in Terminator Armour",5,6,2,4,6,[1],{"1": 90},0,"Meneur",0,"",1,"6+"],
  ["Captain on Bike",12,5,3,4,6,[1],{"1": 110},0,"Meneur",0,"",2,"6+"],
  ["Captain with Jump Pack",12,5,3,4,5,[1],{"1": 90},0,"Meneur",0,"",1,"6+"],
  ["Centurion Assault Squad",4,7,2,0,4,[3, 6],{"3": 150, "6": 300},0,"",1,"",2,"6+"],
  ["Centurion Devastator Squad",4,7,2,0,4,[3, 6],{"3": 175, "6": 350},0,"",1,"",2,"6+"],
  ["Chaplain",6,5,3,4,4,[1],{"1": 60},0,"Meneur",0,"",1,"5+"],
  ["Chaplain in Terminator Armour",5,6,2,4,5,[1],{"1": 75},0,"Meneur",0,"",1,"5+"],
  ["Chaplain on Bike",12,6,3,4,5,[1],{"1": 75},0,"Meneur",0,"",2,"5+"],
  ["Chaplain with Jump Pack",12,5,3,4,4,[1],{"1": 75},0,"Meneur",0,"",1,"5+"],
  ["Chief Librarian Mephiston",8,6,2,4,6,[1],{"1": 175},0,"",0,"",1,"6+"],
  ["Commander Dante",12,5,2,4,6,[1],{"1": 140},0,"Meneur",0,"",1,"6+"],
  ["Company Heroes",6,5,3,0,4,[4],[[1, {"4": 125}], [3, {"4": 145}]],0,"",0,"",2,"6+"],
  ["Death Company Captain",6,5,3,4,5,[1],{"1": 80},0,"Meneur",0,"",1,"6+"],
  ["Death Company Captain with Jump Pack",12,5,3,4,5,[1],{"1": 85},0,"Meneur",0,"",1,"6+"],
  ["Death Company Dreadnought",10,10,2,0,12,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",4,"6+"],
  ["Death Company Dreadnought with Magna-Grapple",8,9,2,0,8,[1],{"1": 145},0,"",1,"",3,"6+"],
  ["Death Company Marines",6,5,3,0,2,[5, 10],[[1, {"5": 90, "10": 170}], [3, {"5": 105, "10": 185}]],0,"",0,"",1,"6+"],
  ["Death Company Marines with Boltguns",6,4,3,0,2,[5, 10],{"5": 125, "10": 250},0,"",1,"",1,"6+"],
  ["Death Company Marines with Boltguns and Jump Packs",12,4,3,0,2,[5, 10],{"5": 140, "10": 280},0,"",1,"",1,"6+"],
  ["Death Company Marines with Jump Packs",12,5,3,0,2,[5, 10],[[1, {"5": 130, "10": 260}], [3, {"5": 160, "10": 290}]],0,"",0,"",1,"6+"],
  ["Desolation Squad",6,5,3,0,2,[5],[[1, {"5": 140}], [3, {"5": 150}]],0,"",0,"",1,"6+"],
  ["Dreadnought",6,9,2,0,8,[1],{"1": 135},0,"",1,"",3,"6+"],
  ["Drop Pod",0,7,3,0,8,[1],[[1, {"1": 60}], [4, {"1": 70}]],0,"",0,"",0,"6+"],
  ["Eliminator Squad",8,4,3,0,2,[3],{"3": 85},0,"",0,"",1,"6+"],
  ["Eradicator Squad with Heavy Bolters",5,6,3,0,3,[3, 6],[[1, {"3": 100, "6": 215}], [3, {"3": 130, "6": 245}]],0,"",0,"",1,"6+"],
  ["Eradicator Squad with Melta Rifles",5,6,3,0,3,[3, 6],[[1, {"3": 100, "6": 200}], [3, {"3": 120, "6": 220}]],0,"",0,"",1,"6+"],
  ["Firestrike Servo-Turrets",5,6,2,0,6,[1, 2],{"1": 80, "2": 160},0,"",0,"",2,"6+"],
  ["Furioso Dreadnought",6,9,2,0,8,[1],{"1": 150},0,"",1,"",3,"6+"],
  ["Gabriel Seth",6,4,3,4,6,[1],{"1": 90},0,"",1,"",1,"6+"],
  ["Gladiator Lancer",10,10,3,0,12,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",3,"6+"],
  ["Gladiator Reaper",10,10,3,0,12,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",3,"6+"],
  ["Gladiator Valiant",10,10,3,0,12,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",3,"6+"],
  ["Hammerfall Bunker",0,12,2,0,14,[1],{"1": 175},0,"",1,"",0,"6+"],
  ["Heavy Intercessor Squad",5,6,3,0,3,[5, 10],{"5": 115, "10": 230},0,"",0,"",2,"6+"],
  ["Hellblaster Squad",6,5,3,0,2,[5, 10],[[1, {"5": 115, "10": 230}], [3, {"5": 130, "10": 245}]],0,"",0,"",1,"6+"],
  ["Impulsor",12,9,3,0,11,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Inceptor Squad",10,6,3,0,3,[3, 6],[[1, {"3": 130, "6": 260}], [3, {"3": 150, "6": 280}]],0,"",0,"",1,"6+"],
  ["Incursor Squad",8,4,3,0,2,[5, 10],[[1, {"5": 90, "10": 170}], [3, {"5": 100, "10": 180}]],0,"",0,"",1,"6+"],
  ["Infernus Squad",6,5,3,0,2,[5, 10],[[1, {"5": 95, "10": 190}], [3, {"5": 105, "10": 200}]],0,"",0,"",1,"6+"],
  ["Infiltrator Squad",8,4,3,0,2,[5, 10],{"5": 85, "10": 150},0,"",0,"",1,"6+"],
  ["Intercessor Squad",6,5,3,0,2,[5, 10],{"5": 85, "10": 170},0,"",0,"",2,"6+"],
  ["Invader ATVs",10,6,3,0,8,[1, 2],[[1, {"1": 65, "2": 130}], [3, {"1": 75, "2": 140}]],0,"",0,"",2,"6+"],
  ["Invictor Tactical Warsuit",10,9,3,0,12,[1],[[1, {"1": 135}], [3, {"1": 150}]],0,"",0,"",4,"6+"],
  ["Judiciar",6,5,3,4,4,[1],{"1": 50},0,"Appui",0,"",1,"6+"],
  ["Land Raider",10,12,2,0,16,[1],[[1, {"1": 245}], [2, {"1": 265}]],0,"",0,"",5,"6+"],
  ["Land Raider Crusader",12,12,2,0,16,[1],[[1, {"1": 230}], [2, {"1": 250}]],0,"",0,"",5,"6+"],
  ["Land Raider Excelsior",10,12,2,0,16,[1],{"1": 250},0,"",1,"",5,"6+"],
  ["Land Raider Redeemer",12,12,2,0,16,[1],[[1, {"1": 245}], [2, {"1": 265}]],0,"",0,"",5,"6+"],
  ["Land Speeder",14,8,3,0,9,[1],{"1": 105},0,"",0,"",3,"6+"],
  ["Lemartes",12,5,3,4,5,[1],{"1": 110},0,"Meneur",0,"",1,"5+"],
  ["Librarian",6,5,3,0,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Librarian Dreadnought",8,9,2,0,8,[1],{"1": 170},0,"",1,"",3,"6+"],
  ["Librarian in Phobos Armour",8,4,3,0,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Librarian in Terminator Armour",5,6,2,4,5,[1],{"1": 80},0,"Meneur",0,"",1,"6+"],
  ["Lieutenant",6,5,3,0,4,[1],{"1": 50},0,"Appui",0,"",1,"6+"],
  ["Lieutenant in Phobos Armour",8,4,3,0,4,[1],{"1": 40},0,"Appui",0,"",1,"6+"],
  ["Lieutenant with Combi-weapon",8,4,3,0,4,[1],{"1": 85},0,"",0,"",1,"6+"],
  ["Outrider Squad",12,6,3,0,4,[3, 6],{"3": 80, "6": 160},0,"",0,"",2,"6+"],
  ["Predator Annihilator",10,10,3,0,11,[1],[[1, {"1": 135}], [3, {"1": 145}]],0,"",1,"",3,"6+"],
  ["Predator Destructor",10,10,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",1,"",3,"6+"],
  ["Razorback",12,9,3,0,10,[1],{"1": 95},0,"",1,"",2,"6+"],
  ["Redemptor Dreadnought",8,10,2,0,12,[1],[[1, {"1": 170}], [3, {"1": 190}]],0,"",0,"",4,"6+"],
  ["Reiver Squad",8,4,3,0,2,[5, 10],{"5": 85, "10": 165},0,"",0,"",1,"6+"],
  ["Relic Razorback",12,9,3,0,10,[1],{"1": 105},0,"",1,"",2,"6+"],
  ["Repulsor",10,12,3,0,16,[1],[[1, {"1": 190}], [3, {"1": 210}]],0,"",0,"",5,"6+"],
  ["Repulsor Executioner",10,12,3,0,16,[1],[[1, {"1": 260}], [3, {"1": 280}]],0,"",0,"",5,"6+"],
  ["Rhino",12,9,3,0,10,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Rhino Primaris",12,9,3,0,10,[1],{"1": 95},0,"",1,"",3,"6+"],
  ["Sanguinary Guard",12,5,2,4,3,[3, 6],[[1, {"3": 135, "6": 275}], [3, {"3": 150, "6": 290}]],0,"",0,"",2,"6+"],
  ["Sanguinary Priest",6,5,3,0,4,[1],{"1": 60},0,"Appui",0,"",1,"6+"],
  ["Sanguinary Priest with Jump Pack",12,4,3,0,4,[1],{"1": 100},0,"",1,"",1,"6+"],
  ["Scout Bike Squad",12,5,4,0,3,[3, 6],{"3": 75, "6": 150},0,"",1,"",2,"6+"],
  ["Scout Squad",6,4,4,0,2,[5, 10],{"5": 65, "10": 120},0,"",0,"",1,"6+"],
  ["Sternguard Veteran Squad",6,5,3,0,2,[5, 10],[[1, {"5": 105, "10": 210}], [3, {"5": 120, "10": 225}]],0,"",0,"",1,"6+"],
  ["Storm Speeder Hailstrike",14,9,3,0,11,[1],[[1, {"1": 110}], [3, {"1": 120}]],0,"",0,"",3,"6+"],
  ["Storm Speeder Hammerstrike",14,9,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Storm Speeder Thunderstrike",14,9,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Stormhawk Interceptor",0,9,3,0,10,[1],{"1": 155},0,"",1,"",0,"6+"],
  ["Stormraven Gunship",14,10,3,0,14,[1],[[1, {"1": 280}], [2, {"1": 300}]],0,"",1,"",0,"6+"],
  ["Stormtalon Gunship",0,8,3,0,10,[1],{"1": 165},0,"",1,"",0,"6+"],
  ["Techmarine",6,5,2,0,4,[1],{"1": 55},0,"Meneur",0,"",1,"6+"],
  ["Terminator Assault Squad",5,6,2,4,4,[5, 10],[[1, {"5": 170, "10": 340}], [3, {"5": 210, "10": 380}]],0,"",0,"",1,"6+"],
  ["Terminator Squad",5,6,2,4,3,[5, 10],[[1, {"5": 190, "10": 380}], [3, {"5": 230, "10": 420}]],0,"",0,"",1,"6+"],
  ["The Sanguinor",12,5,2,4,7,[1],{"1": 120},0,"",0,"",1,"6+"],
  ["Thunderhawk Gunship",20,12,2,0,30,[1],[[1, {"1": 850}], [2, {"1": 950}]],0,"",0,"",0,"6+"],
  ["Tycho the Lost",6,4,2,4,4,[1],{"1": 90},0,"Meneur",1,"",1,"6+"],
  ["Vanguard Veteran Squad",6,4,3,0,2,[5, 10],{"5": 120, "10": 240},0,"",1,"",1,"6+"],
  ["Vanguard Veteran Squad with Jump Packs",12,5,3,0,2,[5, 10],[[1, {"5": 110, "10": 220}], [3, {"5": 130, "10": 240}]],0,"",0,"",1,"6+"],
  ["Venerable Dreadnought",6,9,2,0,8,[1],{"1": 165},0,"",1,"",3,"6+"],
  ["Vindicator",9,11,2,0,11,[1],[[1, {"1": 185}], [3, {"1": 200}]],0,"",1,"",3,"6+"],
  ["Whirlwind",10,10,3,0,11,[1],[[1, {"1": 175}], [2, {"1": 195}]],0,"",1,"",3,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Aggressor Squad","Auto Boltstorm Gauntlets","T","3",3,5,1,"1","twin","18\""],
  ["Aggressor Squad","Fragstorm grenade launcher","T","3",3,4,1,"1","","18\""],
  ["Aggressor Squad","➤ Flamestorm Gauntlets","T","3",0,4,1,"1","torrent twin","12\""],
  ["Aggressor Squad","➤ Flamestorm Gauntlets - Close-quarters","T","3",0,4,1,"1","torrent twin","12\""],
  ["Aggressor Squad","Twin power fist","C","3",3,8,2,"2","twin","càc"],
  ["Ancient","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Ancient","➤ Bolt Rifle - Focused Fire","T","1",3,6,1,"2","heavy rf:1","24\""],
  ["Ancient","➤ Bolt Rifle - Saturation","T","2",3,5,1,"1","assault rf:1","24\""],
  ["Ancient","Ceramite Fists","C","4",3,5,0,"1","","càc"],
  ["Ancient","Power weapon","C","5",3,5,2,"1","","càc"],
  ["Ancient in Terminator Armour","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Ancient in Terminator Armour","Master-crafted power weapon","C","5",3,5,2,"2","","càc"],
  ["Apothecary","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Apothecary","Reductor Pistol","T","1",3,5,4,"2","extra","3\""],
  ["Apothecary","Servo-armature","C","4",3,5,0,"1","","càc"],
  ["Apothecary Biologis","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Apothecary Biologis","Servo-armature","C","4",3,5,0,"1","","càc"],
  ["Assault Intercessor Squad","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Assault Intercessor Squad","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Assault Intercessor Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Assault Intercessor Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Assault Intercessor Squad","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Assault Intercessor Squad","Power fist","C","3",3,8,2,"2","","càc"],
  ["Assault Intercessor Squad","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Assault Intercessor Squad","Thunder Hammer","C","3",4,8,2,"3","dev","càc"],
  ["Assault Intercessors with Jump Packs","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Assault Intercessors with Jump Packs","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Assault Intercessors with Jump Packs","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Assault Intercessors with Jump Packs","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Assault Intercessors with Jump Packs","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Assault Intercessors with Jump Packs","Power fist","C","3",3,8,2,"2","","càc"],
  ["Assault Intercessors with Jump Packs","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Astorath","The Executioner's Axe","C","6",2,7,3,"2","dev precision","càc"],
  ["Astraeus","Astraeus las-ripper","T","3",3,12,3,"D3+3","","36\""],
  ["Astraeus","Ironhail Heavy Stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Astraeus","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Astraeus","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Astraeus","Twin lascannon","T","1",3,12,3,"D3+3","twin","48\""],
  ["Astraeus","Twin macro-accelerator cannon","T","12",3,9,1,"3","sust:1 twin","72\""],
  ["Astraeus","➤ Plasma eradicator - standard","T","D6",3,7,2,"2","","36\""],
  ["Astraeus","➤ Plasma eradicator - supercharge","T","3",3,8,3,"3","hazardous","36\""],
  ["Astraeus","Armoured Hull","C","6",4,8,0,"1","","càc"],
  ["Baal Predator","Baal Flamestorm Cannon","T","6",0,6,2,"2","assault torrent","18\""],
  ["Baal Predator","Heavy Bolter","T","3",3,5,1,"2","assault rf:2 sust:1","36\""],
  ["Baal Predator","Heavy Flamer","T","3",0,5,1,"1","assault torrent","12\""],
  ["Baal Predator","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Baal Predator","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Baal Predator","Twin Assault Cannon","T","6",3,6,2,"1","assault sust:1 twin","24\""],
  ["Baal Predator","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Ballistus Dreadnought","Ballistus Lascannon","T","2",3,12,3,"D3+3","","48\""],
  ["Ballistus Dreadnought","Storm Bolters","T","4",3,5,1,"1","rf:4","24\""],
  ["Ballistus Dreadnought","➤ Ballistus Missile Launcher - Frag","T","D6+6",3,5,1,"1","","48\""],
  ["Ballistus Dreadnought","➤ Ballistus Missile Launcher - Krak","T","2",3,10,2,"D3+3","","48\""],
  ["Ballistus Dreadnought","Armoured Feet","C","5",3,7,0,"1","","càc"],
  ["Bladeguard Ancient","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Bladeguard Ancient","Relics of Battle","C","4",3,5,2,"2","","càc"],
  ["Bladeguard Veteran Squad","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Bladeguard Veteran Squad","Neo-volkite Pistol","T","1",3,5,0,"2","dev","12\""],
  ["Bladeguard Veteran Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Bladeguard Veteran Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Bladeguard Veteran Squad","Master-crafted power weapon","C","4",3,5,2,"2","","càc"],
  ["Blood Angels Captain","Heavy Bolt Pistol","T","1",2,5,1,"1","pistol","18\""],
  ["Blood Angels Captain","Inferno pistol","T","1",2,8,3,"D3+2","melta:1","9\""],
  ["Blood Angels Captain","Master-crafted Chainsword","C","7",2,5,1,"2","","càc"],
  ["Blood Angels Captain","Power fist","C","5",2,8,2,"2","","càc"],
  ["Blood Angels Captain","Relic Weapon","C","6",2,5,2,"2","","càc"],
  ["Brother Corbulo","Bolt pistol","T","1",2,4,0,"1","","12\""],
  ["Brother Corbulo","Heaven's Teeth","C","6",2,5,1,"1","sust:1","càc"],
  ["Brutalis Dreadnought","Bolt Rifles","T","4",3,5,1,"1","twin","24\""],
  ["Brutalis Dreadnought","Twin Icarus ironhail heavy stubber","T","3",3,4,1,"1","anti:3:vol rf:3 twin","36\""],
  ["Brutalis Dreadnought","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Brutalis Dreadnought","Twin multi-melta","T","2",3,10,3,"D3+2","melta:3 twin","18\""],
  ["Brutalis Dreadnought","Brutalis Fists","C","6",3,12,3,"D3+3","twin","càc"],
  ["Brutalis Dreadnought","Brutalis Talons","C","8",3,10,2,"2","sust:1 twin","càc"],
  ["Captain","Heavy Bolt Pistol","T","1",2,5,1,"1","","18\""],
  ["Captain","Master-crafted bolter","T","2",2,5,1,"2","assault rf:1","24\""],
  ["Captain","Neo-volkite Pistol","T","1",2,5,0,"2","dev pistol","12\""],
  ["Captain","➤ Plasma pistol - standard","T","1",2,7,2,"1","","12\""],
  ["Captain","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous","12\""],
  ["Captain","Master-crafted power weapon","C","6",2,6,2,"2","","càc"],
  ["Captain","Power fist","C","5",2,8,2,"2","","càc"],
  ["Captain Tycho","Blood Song","T","2",2,4,1,"2","anti:4:inf dev melta:2","24\""],
  ["Captain Tycho","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Captain Tycho","Dead Man's Hand","C","6",2,4,1,"2","","càc"],
  ["Captain in Gravis Armour","Boltstorm Gauntlet (tir)","T","3",2,5,1,"1","","12\""],
  ["Captain in Gravis Armour","Master-crafted Heavy Bolt Rifle","T","2",2,6,1,"3","assault heavy rf:1","30\""],
  ["Captain in Gravis Armour","Boltstorm Gauntlet (càc)","C","5",2,8,2,"2","","càc"],
  ["Captain in Gravis Armour","Master-crafted power weapon","C","6",2,6,2,"2","","càc"],
  ["Captain in Gravis Armour","Relic Blade","C","2",2,6,2,"2","extra","càc"],
  ["Captain in Gravis Armour","Relic Chainsword","C","3",2,5,1,"2","extra","càc"],
  ["Captain in Gravis Armour","Relic Fist","C","1",2,8,2,"2","extra","càc"],
  ["Captain in Phobos Armour","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Captain in Phobos Armour","Instigator Bolt Carbine","T","2",2,5,2,"2","assault precision rf:1","24\""],
  ["Captain in Phobos Armour","Combat Knife","C","6",2,5,1,"1","precision sust:1","càc"],
  ["Captain in Terminator Armour","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Captain in Terminator Armour","➤ Combi-weapon - Damnatus","T","1",2,9,3,"D3+2","melta:2","12\""],
  ["Captain in Terminator Armour","➤ Combi-weapon - Infernus","T","3",0,4,0,"1","torrent","12\""],
  ["Captain in Terminator Armour","➤ Combi-weapon - Purgatus","T","2",2,7,2,"2","","24\""],
  ["Captain in Terminator Armour","Relic Fist","C","5",2,8,2,"2","","càc"],
  ["Captain in Terminator Armour","Relic Weapon","C","6",2,6,2,"2","","càc"],
  ["Captain on Bike","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Captain on Bike","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Captain on Bike","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Captain on Bike","Inferno Pistol","T","1",3,8,3,"D3+2","melta:1","9\""],
  ["Captain on Bike","Master-crafted boltgun","T","2",2,4,0,"2","","24\""],
  ["Captain on Bike","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Captain on Bike","Twin boltgun","T","2",3,4,0,"1","twin","24\""],
  ["Captain on Bike","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Captain on Bike","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Captain on Bike","Astartes Chainsword","C","7",2,4,1,"1","","càc"],
  ["Captain on Bike","Close combat weapon","C","6",2,4,0,"1","","càc"],
  ["Captain on Bike","Power fist","C","5",2,8,2,"2","","càc"],
  ["Captain on Bike","Relic Weapon","C","6",2,5,2,"2","","càc"],
  ["Captain on Bike","Thunder Hammer","C","5",3,8,2,"3","dev","càc"],
  ["Captain on Bike","Twin lightning claws","C","6",2,5,2,"1","twin","càc"],
  ["Captain with Jump Pack","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Captain with Jump Pack","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Captain with Jump Pack","➤ Plasma pistol - standard","T","1",2,7,2,"1","","12\""],
  ["Captain with Jump Pack","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous","12\""],
  ["Captain with Jump Pack","Astartes Chainsword","C","8",2,5,1,"1","","càc"],
  ["Captain with Jump Pack","Power fist","C","5",2,8,2,"2","","càc"],
  ["Captain with Jump Pack","Relic Weapon","C","6",2,6,2,"2","","càc"],
  ["Captain with Jump Pack","Thunder Hammer","C","5",3,8,2,"3","dev","càc"],
  ["Centurion Assault Squad","Centurion Bolters","T","3",3,4,0,"1","rf:3 twin","24\""],
  ["Centurion Assault Squad","Twin flamer","T","D6",0,4,0,"1","ignorescover torrent twin","12\""],
  ["Centurion Assault Squad","Twin meltagun","T","1",3,9,4,"D6","melta:2 twin","12\""],
  ["Centurion Assault Squad","Siege Drills","C","3",3,10,2,"3","twin","càc"],
  ["Centurion Devastator Squad","Centurion Bolters","T","3",3,4,0,"1","rf:3 twin","24\""],
  ["Centurion Devastator Squad","Centurion missile launcher","T","D3",3,9,2,"D3","blast","36\""],
  ["Centurion Devastator Squad","Grav-cannon","T","3",3,6,1,"3","anti:2:veh","24\""],
  ["Centurion Devastator Squad","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Centurion Devastator Squad","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Centurion Devastator Squad","Centurion Fists","C","3",4,5,1,"2","","càc"],
  ["Chaplain","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Chaplain","Crozius arcanum","C","5",2,6,1,"2","","càc"],
  ["Chaplain in Terminator Armour","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaplain in Terminator Armour","Crozius arcanum","C","5",2,6,1,"2","","càc"],
  ["Chaplain on Bike","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Chaplain on Bike","Twin bolt rifle","T","2",3,5,1,"1","rf:2 twin","24\""],
  ["Chaplain on Bike","Crozius arcanum","C","5",2,6,1,"2","","càc"],
  ["Chaplain with Jump Pack","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Chaplain with Jump Pack","Crozius arcanum","C","5",2,6,1,"2","","càc"],
  ["Chief Librarian Mephiston","➤ Fury of the Ancients - Focused Witchfire","T","3",2,6,2,"3","assault hazardous psychic","18\""],
  ["Chief Librarian Mephiston","➤ Fury of the Ancients - Witchfire","T","3",2,5,1,"2","assault psychic","18\""],
  ["Chief Librarian Mephiston","➤ Plasma pistol - standard","T","1",2,7,2,"1","assault","12\""],
  ["Chief Librarian Mephiston","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","assault","12\""],
  ["Chief Librarian Mephiston","Vitarus","C","6",2,10,3,"3","lethal psychic","càc"],
  ["Commander Dante","Perdition Pistol","T","1",2,10,3,"D3+2","melta:2 sust:1","9\""],
  ["Commander Dante","The Axe Mortalis","C","8",2,8,3,"2","lethal","càc"],
  ["Company Heroes","Master-crafted Bolt Pistol","T","1",3,5,1,"2","","12\""],
  ["Company Heroes","Master-crafted Bolt Rifle","T","2",3,5,1,"2","assault rf:1","24\""],
  ["Company Heroes","Master-crafted Heavy Bolter","T","4",3,6,1,"2","assault heavy rf:2 sust:1","36\""],
  ["Company Heroes","Combat Knife","C","5",3,5,1,"1","","càc"],
  ["Company Heroes","Master-crafted Power Weapon","C","6",2,6,2,"2","precision","càc"],
  ["Death Company Captain","Heavy Bolt Pistol","T","1",2,5,1,"1","","18\""],
  ["Death Company Captain","Inferno pistol","T","1",2,8,3,"D3+2","melta:1","9\""],
  ["Death Company Captain","Master-crafted Chainsword","C","8",2,5,1,"2","sust:1","càc"],
  ["Death Company Captain","Power fist","C","6",2,8,2,"2","","càc"],
  ["Death Company Captain","Relic weapon","C","7",2,6,2,"2","","càc"],
  ["Death Company Captain with Jump Pack","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Death Company Captain with Jump Pack","Heavy Bolt Pistol","T","1",2,4,1,"1","","18\""],
  ["Death Company Captain with Jump Pack","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Death Company Captain with Jump Pack","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Death Company Captain with Jump Pack","Astartes Chainsword","C","8",2,5,1,"1","sust:1","càc"],
  ["Death Company Captain with Jump Pack","Power fist","C","5",2,8,2,"2","","càc"],
  ["Death Company Captain with Jump Pack","Relic Weapon","C","6",2,5,2,"2","","càc"],
  ["Death Company Captain with Jump Pack","Thunder Hammer","C","5",3,8,2,"3","dev","càc"],
  ["Death Company Dreadnought","Blood Fist Bolt Rifles","T","4",3,5,1,"1","twin","24\""],
  ["Death Company Dreadnought","Twin Icarus ironhail heavy stubber","T","3",3,4,1,"1","anti:3:vol rf:3 twin","36\""],
  ["Death Company Dreadnought","Twin Multi-melta","T","2",3,10,3,"D3+2","melta:3 twin","18\""],
  ["Death Company Dreadnought","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Death Company Dreadnought","Blood Fists","C","6",3,12,3,"D3+3","twin","càc"],
  ["Death Company Dreadnought","Blood Talons","C","8",3,10,2,"2","sust:1 twin","càc"],
  ["Death Company Dreadnought with Magna-Grapple","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Death Company Dreadnought with Magna-Grapple","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Death Company Dreadnought with Magna-Grapple","Storm Bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Death Company Dreadnought with Magna-Grapple","Blood Talons","C","7",3,8,2,"3","twin","càc"],
  ["Death Company Dreadnought with Magna-Grapple","Twin Furioso Fists","C","5",3,12,3,"3","twin","càc"],
  ["Death Company Marines","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Death Company Marines","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Death Company Marines","Inferno Pistol","T","1",3,8,3,"D3+2","melta:1","9\""],
  ["Death Company Marines","➤ Bolt Rifle - Focused Fire","T","1",3,6,1,"2","heavy rf:1","24\""],
  ["Death Company Marines","➤ Bolt Rifle - Saturation","T","2",3,5,1,"1","assault rf:1","24\""],
  ["Death Company Marines","➤ Grenade Launcher - Frag","T","4",3,4,1,"1","","24\""],
  ["Death Company Marines","➤ Grenade Launcher - Krak","T","2",3,10,2,"3","rf:1","24\""],
  ["Death Company Marines","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Death Company Marines","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Death Company Marines","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Death Company Marines","Combat blade","C","3",3,5,0,"1","","càc"],
  ["Death Company Marines","Eviscerator","C","3",3,7,2,"2","","càc"],
  ["Death Company Marines","Power fist","C","3",3,8,2,"2","","càc"],
  ["Death Company Marines","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Death Company Marines","Thunder Hammer","C","3",4,8,2,"3","dev","càc"],
  ["Death Company Marines with Boltguns","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Death Company Marines with Boltguns","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Death Company Marines with Boltguns","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Death Company Marines with Boltguns","Inferno Pistol","T","1",3,8,3,"D3+2","melta:1","9\""],
  ["Death Company Marines with Boltguns","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Death Company Marines with Boltguns","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Death Company Marines with Boltguns","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Death Company Marines with Boltguns","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Death Company Marines with Boltguns","Power fist","C","3",3,8,2,"2","","càc"],
  ["Death Company Marines with Boltguns","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Death Company Marines with Boltguns","Thunder Hammer","C","3",4,8,2,"2","dev","càc"],
  ["Death Company Marines with Boltguns and Jump Packs","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Death Company Marines with Boltguns and Jump Packs","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Death Company Marines with Boltguns and Jump Packs","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Death Company Marines with Boltguns and Jump Packs","Inferno Pistol","T","1",3,8,3,"D3+2","melta:1","9\""],
  ["Death Company Marines with Boltguns and Jump Packs","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Death Company Marines with Boltguns and Jump Packs","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Death Company Marines with Boltguns and Jump Packs","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Death Company Marines with Boltguns and Jump Packs","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Death Company Marines with Boltguns and Jump Packs","Power fist","C","3",3,8,2,"2","","càc"],
  ["Death Company Marines with Boltguns and Jump Packs","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Death Company Marines with Boltguns and Jump Packs","Thunder Hammer","C","3",4,8,2,"2","dev","càc"],
  ["Death Company Marines with Jump Packs","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Death Company Marines with Jump Packs","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Death Company Marines with Jump Packs","Inferno Pistol","T","1",3,8,3,"D3+2","melta:1","9\""],
  ["Death Company Marines with Jump Packs","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Death Company Marines with Jump Packs","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Death Company Marines with Jump Packs","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Death Company Marines with Jump Packs","Eviscerator","C","3",3,7,2,"2","","càc"],
  ["Death Company Marines with Jump Packs","Power fist","C","3",3,8,2,"2","","càc"],
  ["Death Company Marines with Jump Packs","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Desolation Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Desolation Squad","Castellan Launcher","T","2",3,5,1,"1","heavy","24\""],
  ["Desolation Squad","Superfrag Rocket Launcher","T","4",3,5,1,"1","heavy","48\""],
  ["Desolation Squad","Superkrak Rocket Launcher","T","1",3,10,2,"D3+3","heavy","48\""],
  ["Desolation Squad","Vengor launcher","T","4",3,7,1,"2","heavy indirect","48\""],
  ["Desolation Squad","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Dreadnought","Assault Cannon","T","6",3,6,0,"1","dev","24\""],
  ["Dreadnought","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Dreadnought","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Dreadnought","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Dreadnought","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Dreadnought","➤ Heavy Plasma Cannon","T","D3",3,8,3,"3","blast hazardous","36\""],
  ["Dreadnought","➤ Heavy Plasma Cannon - Standard","T","D3",3,7,2,"2","blast","36\""],
  ["Dreadnought","➤ Missile Launcher - Frag","T","D6",3,4,0,"1","blast","48\""],
  ["Dreadnought","➤ Missile Launcher - Krak","T","1",3,9,2,"D6","","48\""],
  ["Dreadnought","Close combat weapon","C","5",3,6,0,"1","","càc"],
  ["Dreadnought","Dreadnought Combat Weapon","C","5",3,12,2,"3","","càc"],
  ["Eliminator Squad","Bolt Sniper Rifle","T","1",3,6,2,"3","heavy precision","36\""],
  ["Eliminator Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Eliminator Squad","Instigator Bolt Carbine","T","2",3,5,2,"2","precision rf:2","24\""],
  ["Eliminator Squad","Las fusil","T","1",3,10,3,"D3+3","heavy","36\""],
  ["Eliminator Squad","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Eradicator Squad with Heavy Bolters","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Eradicator Squad with Heavy Bolters","Heavy Bolter","T","3",3,6,1,"2","heavy rf:2 sust:1","36\""],
  ["Eradicator Squad with Heavy Bolters","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Eradicator Squad with Melta Rifles","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Eradicator Squad with Melta Rifles","➤ Melta Rifle","T","1",3,10,3,"D3+2","melta:2","18\""],
  ["Eradicator Squad with Melta Rifles","➤ Melta Rifle HUNTER:Monster/Vehicle","T","1",2,12,3,"D3+2","melta:2","18\""],
  ["Eradicator Squad with Melta Rifles","➤ Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Eradicator Squad with Melta Rifles","➤ Multi-melta HUNTER:Monster/Vehicle","T","2",2,12,3,"D3+2","melta:3","18\""],
  ["Eradicator Squad with Melta Rifles","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Firestrike Servo-Turrets","Twin Firestrike Autocannon","T","4",2,9,1,"3","rf:2 twin","48\""],
  ["Firestrike Servo-Turrets","Twin Firestrike Las-talon","T","2",2,10,3,"D3+3","twin","36\""],
  ["Firestrike Servo-Turrets","Hovering Bulk","C","3",3,5,0,"1","","càc"],
  ["Furioso Dreadnought","Heavy Frag Cannon","T","D6",3,7,1,"2","blast rf:D6","18\""],
  ["Furioso Dreadnought","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Furioso Dreadnought","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Furioso Dreadnought","Blood Talons","C","7",3,8,2,"3","twin","càc"],
  ["Furioso Dreadnought","Furioso Fist","C","5",3,12,3,"3","","càc"],
  ["Furioso Dreadnought","Twin Furioso Fists","C","5",3,12,3,"3","twin","càc"],
  ["Gabriel Seth","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Gabriel Seth","Blood Reaver","C","6",2,8,2,"3","sust:1","càc"],
  ["Gladiator Lancer","Defensive Array","T","6",3,5,1,"1","rf:6","24\""],
  ["Gladiator Lancer","Lancer Laser Destroyer","T","2",3,14,3,"D6+3","heavy","72\""],
  ["Gladiator Lancer","Armoured Hull","C","3",4,6,0,"1","","càc"],
  ["Gladiator Reaper","Defensive Array","T","12",3,5,1,"1","rf:12","24\""],
  ["Gladiator Reaper","Twin Heavy Onslaught Gatling Cannon","T","12",3,6,1,"1","sust:2 twin","24\""],
  ["Gladiator Reaper","Armoured Hull","C","3",4,6,0,"1","","càc"],
  ["Gladiator Valiant","Defensive Array","T","6",3,5,1,"1","rf:6","24\""],
  ["Gladiator Valiant","Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Gladiator Valiant","Twin Las-talon","T","2",3,10,3,"D3+3","twin","36\""],
  ["Gladiator Valiant","Armoured Hull","C","3",4,6,0,"1","","càc"],
  ["Hammerfall Bunker","Hammerfall Heavy Bolter Array","T","6",4,5,1,"2","sust:1 twin","36\""],
  ["Hammerfall Bunker","Hammerfall Heavy Flamer Array","T","2D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Hammerfall Bunker","➤ Hammerfall Missile Launcher - Superfrag","T","2d6+2",4,5,0,"1","blast","48\""],
  ["Hammerfall Bunker","➤ Hammerfall Missile Launcher - Superkrak","T","2",4,10,2,"D6+1","","48\""],
  ["Heavy Intercessor Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Heavy Intercessor Squad","Heavy Bolt Rifle","T","2",3,5,1,"2","heavy rf:1","30\""],
  ["Heavy Intercessor Squad","Heavy Bolter","T","3",3,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Heavy Intercessor Squad","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Hellblaster Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Hellblaster Squad","➤ Plasma Incinerator - Standard","T","2",3,7,2,"2","assault rf:1","24\""],
  ["Hellblaster Squad","➤ Plasma Incinerator - Supercharge","T","2",3,8,3,"2","assault hazardous rf:1","24\""],
  ["Hellblaster Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Hellblaster Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Hellblaster Squad","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Impulsor","Fragstorm Grenade Launchers","T","6",3,4,1,"1","","18\""],
  ["Impulsor","Ironhail Heavy Stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Impulsor","Ironhail Skytalon Array","T","6",3,4,1,"1","rf:6","36\""],
  ["Impulsor","Storm Bolters","T","4",3,5,1,"1","rf:4","24\""],
  ["Impulsor","➤ Bellicatus Missile Array - Frag","T","4",3,4,1,"1","","48\""],
  ["Impulsor","➤ Bellicatus Missile Array - Icarus","T","3",3,6,1,"2","anti:2:vol","48\""],
  ["Impulsor","➤ Bellicatus Missile Array - Krak","T","1",3,10,2,"D3+3","","48\""],
  ["Impulsor","Armoured Hull","C","3",4,6,0,"1","","càc"],
  ["Inceptor Squad","Assault Bolters","T","3",3,5,1,"2","assault sust:2 twin","18\""],
  ["Inceptor Squad","➤ Plasma Exterminators - Standard","T","2",3,7,2,"2","assault twin","18\""],
  ["Inceptor Squad","➤ Plasma Exterminators - Supercharge","T","2",3,8,3,"3","assault hazardous twin","18\""],
  ["Inceptor Squad","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Incursor Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Incursor Squad","Occulus Bolt Carbine","T","2",3,5,1,"1","assault ignorescover","24\""],
  ["Incursor Squad","Paired Combat Blades","C","3",3,5,1,"1","sust:1","càc"],
  ["Infernus Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Infernus Squad","Pyreblaster","T","3",0,5,1,"1","torrent","12\""],
  ["Infernus Squad","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Infiltrator Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Infiltrator Squad","Marksman Bolt Carbine","T","2",3,5,1,"1","precision rf:1","24\""],
  ["Infiltrator Squad","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Intercessor Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Intercessor Squad","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Intercessor Squad","➤ Bolt Rifle - Focused Fire","T","1",3,6,1,"2","heavy rf:1","24\""],
  ["Intercessor Squad","➤ Bolt Rifle - Saturation","T","2",3,5,1,"1","assault rf:1","24\""],
  ["Intercessor Squad","➤ Grenade Launcher - Frag","T","4",3,4,1,"1","","24\""],
  ["Intercessor Squad","➤ Grenade Launcher - Krak","T","1",3,10,2,"3","rf:1","24\""],
  ["Intercessor Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Intercessor Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Intercessor Squad","Chainsword","C","5",3,5,1,"1","","càc"],
  ["Intercessor Squad","Knives and Fists","C","3",3,5,0,"1","","càc"],
  ["Intercessor Squad","Power fist","C","3",3,8,2,"2","","càc"],
  ["Intercessor Squad","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Intercessor Squad","Thunder Hammer","C","3",4,8,2,"3","dev","càc"],
  ["Invader ATVs","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Invader ATVs","Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Invader ATVs","Onslaught gatling cannon","T","8",3,5,1,"1","","24\""],
  ["Invader ATVs","Twin Bolt Rifle","T","2",3,5,1,"1","assault rf:2 twin","24\""],
  ["Invader ATVs","Armoured Impact","C","4",3,5,0,"1","","càc"],
  ["Invictor Tactical Warsuit","Fragstorm grenade launcher","T","3",3,4,1,"1","","18\""],
  ["Invictor Tactical Warsuit","Heavy Bolter","T","3",3,5,1,"2","rf:2 sust:1","36\""],
  ["Invictor Tactical Warsuit","Incendium Cannon","T","4",0,6,1,"2","torrent","12\""],
  ["Invictor Tactical Warsuit","Ironhail Heavy Stubbers","T","6",3,4,1,"1","rf:6","36\""],
  ["Invictor Tactical Warsuit","Twin Ironhail Autocannon","T","4",3,9,1,"3","twin","48\""],
  ["Invictor Tactical Warsuit","Invictor Fist","C","5",3,12,2,"3","","càc"],
  ["Judiciar","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Judiciar","Executioner Relic Blade","C","5",2,7,2,"2","dev precision","càc"],
  ["Land Raider","Godhammer Lascannon","T","2",3,12,3,"D3+3","","48\""],
  ["Land Raider","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Land Raider","Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Land Raider","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Land Raider","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Land Raider","Armoured Tracks","C","6",4,8,0,"1","","càc"],
  ["Land Raider Crusader","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Land Raider Crusader","Hurricane Bolter","T","6",3,5,1,"1","rf:6 twin","24\""],
  ["Land Raider Crusader","Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Land Raider Crusader","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Land Raider Crusader","Twin assault cannon","T","6",3,6,2,"1","sust:1 twin","24\""],
  ["Land Raider Crusader","Armoured Tracks","C","6",4,8,0,"1","","càc"],
  ["Land Raider Excelsior","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Land Raider Excelsior","Godhammer Lascannon","T","2",3,12,3,"D3+3","","48\""],
  ["Land Raider Excelsior","Grav-cannon","T","3",3,6,1,"3","anti:2:veh","24\""],
  ["Land Raider Excelsior","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Land Raider Excelsior","Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Land Raider Excelsior","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Land Raider Excelsior","Armoured Tracks","C","6",4,8,0,"1","","càc"],
  ["Land Raider Redeemer","Flamestorm Cannon","T","4",0,6,2,"2","torrent","12\""],
  ["Land Raider Redeemer","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Land Raider Redeemer","Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Land Raider Redeemer","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Land Raider Redeemer","Twin assault cannon","T","6",3,6,2,"1","sust:1 twin","24\""],
  ["Land Raider Redeemer","Armoured Tracks","C","6",4,8,0,"1","","càc"],
  ["Land Speeder","Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Land Speeder","Onslaught gatling cannon","T","8",3,5,1,"1","","24\""],
  ["Land Speeder","Pyrecannon","T","4",0,6,1,"1","torrent","12\""],
  ["Land Speeder","Stormfury Missile Launcher","T","1",3,10,3,"D3+3","","48\""],
  ["Land Speeder","Armoured Impact","C","3",4,6,0,"1","","càc"],
  ["Lemartes","Absolvor Bolt Pistol","T","1",2,5,2,"2","","18\""],
  ["Lemartes","The Blood Crozius","C","6",2,6,2,"2","lethal","càc"],
  ["Librarian","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Librarian","➤ Smite - Focused Witchfire","T","D3+3",3,6,2,"2","dev hazardous psychic","24\""],
  ["Librarian","➤ Smite - Witchfire","T","D6",3,6,1,"2","psychic","24\""],
  ["Librarian","Force weapon [Psychic]","C","4",3,6,2,"2","psychic","càc"],
  ["Librarian Dreadnought","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Librarian Dreadnought","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Librarian Dreadnought","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Librarian Dreadnought","➤ Blood Lance - Focused Witchfire","T","1",3,12,3,"D6+3","hazardous psychic sust:D3","18\""],
  ["Librarian Dreadnought","➤ Blood Lance - Witchfire","T","1",3,10,3,"D6","psychic sust:D3","18\""],
  ["Librarian Dreadnought","Furioso Fist","C","5",3,12,3,"3","","càc"],
  ["Librarian Dreadnought","Furioso Force Halberd","C","1",2,9,3,"D6+3","extra psychic","càc"],
  ["Librarian in Phobos Armour","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Librarian in Phobos Armour","➤ Smite - Focused Witchfire","T","D3+3",3,6,2,"2","dev hazardous psychic","24\""],
  ["Librarian in Phobos Armour","➤ Smite - Witchfire","T","D6",3,6,1,"2","psychic","24\""],
  ["Librarian in Phobos Armour","Force weapon [Psychic]","C","4",3,6,2,"2","psychic","càc"],
  ["Librarian in Terminator Armour","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Librarian in Terminator Armour","➤ Smite - Focused Witchfire","T","D3+3",3,6,2,"2","dev hazardous psychic","24\""],
  ["Librarian in Terminator Armour","➤ Smite - Witchfire","T","D6",3,6,1,"2","psychic","24\""],
  ["Librarian in Terminator Armour","Force weapon [Psychic]","C","4",3,6,2,"2","psychic","càc"],
  ["Lieutenant","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Lieutenant","Heavy Bolt Pistol","T","1",2,5,1,"1","","18\""],
  ["Lieutenant","Master-crafted bolter","T","2",2,5,1,"2","","24\""],
  ["Lieutenant","Neo-volkite Pistol","T","1",2,5,0,"2","dev pistol","12\""],
  ["Lieutenant","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Lieutenant","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Lieutenant","Ceramite Fists","C","5",2,5,0,"1","","càc"],
  ["Lieutenant","Master-crafted Power Weapon","C","5",2,6,2,"2","","càc"],
  ["Lieutenant","Master-crafted power weapon","C","6",2,6,2,"2","","càc"],
  ["Lieutenant","Power fist","C","4",2,8,2,"2","","càc"],
  ["Lieutenant in Phobos Armour","Master-crafted Bolt Carbine","T","2",2,5,1,"2","assault rf:1","24\""],
  ["Lieutenant in Phobos Armour","Special-issue Bolt Pistol","T","1",2,5,2,"2","precision","12\""],
  ["Lieutenant in Phobos Armour","Monomolecular Combat Blades","C","6",2,5,1,"1","precision sust:1","càc"],
  ["Lieutenant with Combi-weapon","➤ Combi-weapon - Bolter","T","2",2,5,1,"2","assault rf:1","24\""],
  ["Lieutenant with Combi-weapon","➤ Combi-weapon - Flamer","T","3",0,5,1,"1","assault torrent","12\""],
  ["Lieutenant with Combi-weapon","Paired Combat Blades","C","6",2,5,1,"1","sust:1","càc"],
  ["Outrider Squad","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Outrider Squad","Twin bolt rifle","T","2",2,5,1,"1","assault rf:2 twin","24\""],
  ["Outrider Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Outrider Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Outrider Squad","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Outrider Squad","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Outrider Squad","Thunder Hammer","C","3",4,8,2,"3","dev","càc"],
  ["Predator Annihilator","Heavy Bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Predator Annihilator","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Predator Annihilator","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Predator Annihilator","Predator Twin Lascannon","T","1",3,14,3,"D6+1","twin","48\""],
  ["Predator Annihilator","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Predator Annihilator","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Predator Destructor","Heavy Bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Predator Destructor","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Predator Destructor","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Predator Destructor","Predator Autocannon","T","4",3,9,1,"3","rf:2","48\""],
  ["Predator Destructor","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Predator Destructor","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Razorback","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Razorback","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Razorback","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Razorback","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Razorback","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Redemptor Dreadnought","Fragstorm Grenade Launchers","T","6",3,4,1,"1","","18\""],
  ["Redemptor Dreadnought","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Redemptor Dreadnought","Heavy Onslaught Gatling Cannon","T","12",3,6,1,"1","sust:2","24\""],
  ["Redemptor Dreadnought","Icarus Rocket Pod","T","3",3,6,1,"2","anti:2:vol","24\""],
  ["Redemptor Dreadnought","Onslaught gatling cannon","T","8",3,5,1,"1","","24\""],
  ["Redemptor Dreadnought","Storm Bolters","T","4",3,5,1,"1","rf:4","24\""],
  ["Redemptor Dreadnought","➤ Macro Plasma Incinerator - Standard","T","D3+3",3,9,3,"2","","36\""],
  ["Redemptor Dreadnought","➤ Macro Plasma Incinerator - Supercharge","T","D3+3",3,10,4,"3","hazardous","36\""],
  ["Redemptor Dreadnought","Redemptor Fist","C","5",3,12,3,"D3+3","","càc"],
  ["Reiver Squad","Bolt Carbine","T","3",3,5,1,"1","assault precision","18\""],
  ["Reiver Squad","Special-issue Bolt Pistol","T","1",3,5,2,"1","precision","12\""],
  ["Reiver Squad","Monomolecular Combat Knife","C","4",3,5,1,"1","precision","càc"],
  ["Relic Razorback","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Relic Razorback","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Relic Razorback","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Relic Razorback","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Relic Razorback","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Relic Razorback","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Relic Razorback","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Repulsor","Defensive Array","T","18",3,5,1,"1","","24\""],
  ["Repulsor","Heavy Onslaught Gatling Cannon","T","12",3,6,1,"1","sust:2","24\""],
  ["Repulsor","Hunter-slayer missile","T","1",2,14,3,"D3+3","indirect oneshot","48\""],
  ["Repulsor","Las-talon","T","2",3,10,3,"D3+3","","36\""],
  ["Repulsor","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Repulsor","Twin lascannon","T","1",3,12,3,"D3+3","twin","48\""],
  ["Repulsor","Armoured Hull","C","6",4,8,0,"1","","càc"],
  ["Repulsor Executioner","Defensive Array","T","18",3,5,1,"1","","24\""],
  ["Repulsor Executioner","Heavy Laser Destroyer","T","2",3,16,4,"D6+4","dev heavy","72\""],
  ["Repulsor Executioner","Heavy Onslaught Gatling Cannon","T","12",3,6,1,"1","sust:2","24\""],
  ["Repulsor Executioner","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Repulsor Executioner","➤ Macro Plasma Incinerator - Standard","T","D3+3",3,9,3,"2","","36\""],
  ["Repulsor Executioner","➤ Macro Plasma Incinerator - Supercharge","T","D3+3",3,10,4,"3","hazardous","36\""],
  ["Repulsor Executioner","Armoured Hull","C","6",4,8,0,"1","","càc"],
  ["Rhino","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Rhino","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Rhino","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Rhino Primaris","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Rhino Primaris","➤ Twin Plasma Gun - Overcharge","T","1",3,8,3,"2","hazardous rf:1 twin","24\""],
  ["Rhino Primaris","➤ Twin Plasma Gun - Standard","T","1",3,7,2,"1","rf:1 twin","24\""],
  ["Rhino Primaris","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Sanguinary Guard","Angelus Boltgun","T","3",2,5,1,"1","assault","18\""],
  ["Sanguinary Guard","Inferno pistol","T","1",2,8,3,"D3+2","melta:1","9\""],
  ["Sanguinary Guard","Encarmine Weapon","C","4",2,6,2,"2","lance","càc"],
  ["Sanguinary Priest","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Sanguinary Priest","Astartes Chainsword","C","5",3,5,1,"1","","càc"],
  ["Sanguinary Priest with Jump Pack","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Sanguinary Priest with Jump Pack","Astartes Chainsword","C","5",2,4,1,"1","","càc"],
  ["Scout Bike Squad","Astartes Shotgun","T","2",3,4,0,"1","assault","18\""],
  ["Scout Bike Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Scout Bike Squad","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Scout Bike Squad","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Scout Bike Squad","Grav-pistol","T","1",3,4,1,"2","anti:2:veh pistol","12\""],
  ["Scout Bike Squad","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Scout Bike Squad","Inferno Pistol","T","1",3,8,3,"D3+2","melta:1","9\""],
  ["Scout Bike Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Scout Bike Squad","Twin boltgun","T","2",3,4,0,"1","twin","24\""],
  ["Scout Bike Squad","➤ Astartes grenade launcher - frag","T","D3",3,4,0,"1","blast","24\""],
  ["Scout Bike Squad","➤ Astartes grenade launcher - krak","T","1",3,9,2,"D3","","24\""],
  ["Scout Bike Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Scout Bike Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Scout Bike Squad","Astartes Chainsword","C","3",3,4,1,"1","","càc"],
  ["Scout Bike Squad","Combat Knife","C","3",3,4,0,"1","","càc"],
  ["Scout Bike Squad","Power fist","C","2",3,8,2,"2","","càc"],
  ["Scout Bike Squad","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Scout Bike Squad","Thunder Hammer","C","2",4,8,2,"3","dev","càc"],
  ["Scout Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Scout Squad","Boltgun","T","1",3,5,1,"1","rf:1","24\""],
  ["Scout Squad","Heavy Bolter","T","3",4,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Scout Squad","Shotgun","T","2",3,4,1,"1","assault","18\""],
  ["Scout Squad","Sniper Rifle","T","1",3,5,2,"2","heavy precision","36\""],
  ["Scout Squad","➤ Missile Launcher - Frag","T","4",4,4,1,"1","heavy","48\""],
  ["Scout Squad","➤ Missile Launcher - Krak","T","1",4,10,2,"D3+3","","48\""],
  ["Scout Squad","Chainsword","C","4",3,4,1,"1","","càc"],
  ["Scout Squad","Combat Knife","C","3",3,4,1,"1","","càc"],
  ["Sternguard Veteran Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Sternguard Veteran Squad","Heavy Bolter","T","3",3,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Sternguard Veteran Squad","Pyrecannon","T","4",0,6,1,"1","torrent","12\""],
  ["Sternguard Veteran Squad","➤ Artificer Firearm - Damnatus","T","1",3,9,3,"D3+2","assault melta:2","12\""],
  ["Sternguard Veteran Squad","➤ Artificer Firearm - Infernus","T","2",3,5,1,"1","assault rf:2","24\""],
  ["Sternguard Veteran Squad","➤ Artificer Firearm - Purgatus","T","1",3,7,2,"2","assault rf:1","24\""],
  ["Sternguard Veteran Squad","Astartes Chainsword","C","6",3,4,1,"1","","càc"],
  ["Sternguard Veteran Squad","Ceramite Fists","C","4",3,5,0,"1","","càc"],
  ["Sternguard Veteran Squad","Power fist","C","4",3,8,2,"2","","càc"],
  ["Sternguard Veteran Squad","Power weapon","C","5",3,5,2,"1","","càc"],
  ["Storm Speeder Hailstrike","Fragstorm Grenade Launchers","T","6",3,4,1,"1","","18\""],
  ["Storm Speeder Hailstrike","Ironhail Heavy Stubber Array","T","6",3,4,1,"1","ignorescover rf:6","36\""],
  ["Storm Speeder Hailstrike","Onslaught gatling cannon","T","8",3,5,1,"1","","24\""],
  ["Storm Speeder Hailstrike","Armoured Impact","C","3",4,6,0,"1","","càc"],
  ["Storm Speeder Hammerstrike","Hammerstrike Missile Launcher","T","2",3,10,3,"D3+2","","36\""],
  ["Storm Speeder Hammerstrike","Krakstorm Grenade Launchers","T","2",3,9,1,"2","","18\""],
  ["Storm Speeder Hammerstrike","Melta Destroyer","T","3",3,10,3,"D3+2","melta:3","18\""],
  ["Storm Speeder Hammerstrike","Armoured Impact","C","3",4,6,0,"1","","càc"],
  ["Storm Speeder Thunderstrike","Stormfury Missile Launcher","T","2",3,10,3,"D3+3","","48\""],
  ["Storm Speeder Thunderstrike","Thunderstrike Icarus Rocket Pod","T","6",3,6,1,"2","anti:2:vol","24\""],
  ["Storm Speeder Thunderstrike","Thunderstrike Las-talon","T","2",3,10,3,"D3+3","","36\""],
  ["Storm Speeder Thunderstrike","Armoured Impact","C","3",4,6,0,"1","","càc"],
  ["Stormhawk Interceptor","Icarus Stormcannon","T","6",3,7,1,"2","anti:2:vol","48\""],
  ["Stormhawk Interceptor","Las-talon","T","2",3,10,3,"D3+3","","36\""],
  ["Stormhawk Interceptor","Skyhammer Missile Launcher","T","3",3,8,1,"D3","anti:2:vol","48\""],
  ["Stormhawk Interceptor","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Stormhawk Interceptor","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Stormhawk Interceptor","➤ Typhoon missile launcher - frag","T","2D6",3,4,0,"1","blast","48\""],
  ["Stormhawk Interceptor","➤ Typhoon missile launcher - krak","T","2",3,9,2,"D6","","48\""],
  ["Stormhawk Interceptor","Armoured Hull","C","3",4,6,0,"1","","càc"],
  ["Stormraven Gunship","Hurricane Bolter","T","6",3,4,0,"1","rf:6 twin","24\""],
  ["Stormraven Gunship","Stormstrike Missile Launcher","T","1",3,10,2,"3","","48\""],
  ["Stormraven Gunship","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Stormraven Gunship","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Stormraven Gunship","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Stormraven Gunship","Twin multi-melta","T","2",3,9,4,"D6","melta:2 twin","18\""],
  ["Stormraven Gunship","➤ Twin Heavy Plasma Cannon - Standard","T","D3",3,7,2,"2","blast twin","36\""],
  ["Stormraven Gunship","➤ Twin Heavy Plasma Cannon - Supercharge","T","D3",3,8,3,"3","blast hazardous twin","36\""],
  ["Stormraven Gunship","➤ Typhoon missile launcher - frag","T","2D6",3,4,0,"1","blast","48\""],
  ["Stormraven Gunship","➤ Typhoon missile launcher - krak","T","2",3,9,2,"D6","","48\""],
  ["Stormraven Gunship","Armoured Hull","C","6",4,8,0,"1","","càc"],
  ["Stormtalon Gunship","Skyhammer Missile Launcher","T","3",3,8,1,"D3","anti:2:vol twin","48\""],
  ["Stormtalon Gunship","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Stormtalon Gunship","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Stormtalon Gunship","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Stormtalon Gunship","➤ Typhoon missile launcher - frag","T","2D6",3,4,0,"1","blast","48\""],
  ["Stormtalon Gunship","➤ Typhoon missile launcher - krak","T","2",3,9,2,"D6","","48\""],
  ["Stormtalon Gunship","Armoured Hull","C","3",4,6,0,"1","","càc"],
  ["Techmarine","Forge Bolter","T","3",2,5,1,"2","sust:1","24\""],
  ["Techmarine","Grav-pistol","T","2",2,2,1,"3","anti:2:veh","12\""],
  ["Techmarine","Omnissian Power Axe and Servo-arm","C","5",3,6,2,"2","","càc"],
  ["Terminator Assault Squad","Thunder Hammer","C","3",3,8,2,"3","dev","càc"],
  ["Terminator Assault Squad","Twin Lightning Claws","C","6",3,5,2,"1","twin","càc"],
  ["Terminator Squad","Assault Cannon","T","6",3,6,2,"1","sust:1","24\""],
  ["Terminator Squad","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Terminator Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Terminator Squad","➤ Cyclone missile launcher - frag","T","8",3,4,1,"1","","36\""],
  ["Terminator Squad","➤ Cyclone missile launcher - krak","T","2",3,10,2,"D3+3","","36\""],
  ["Terminator Squad","Power fist","C","3",3,8,2,"2","","càc"],
  ["Terminator Squad","Power weapon","C","5",3,5,2,"1","","càc"],
  ["Terminator Squad","➤ Chainfist - Hunter: Monster/Vehicle","C","3",3,12,2,"3","","càc"],
  ["Terminator Squad","➤ Chainfist - Standard","C","2",4,8,2,"2","","càc"],
  ["The Sanguinor","Encarmine Broadsword","C","8",2,6,3,"2","dev","càc"],
  ["Thunderhawk Gunship","Hellstrike missile battery","T","4",3,8,2,"3","anti:4:vol","72\""],
  ["Thunderhawk Gunship","Thunderhawk heavy cannon","T","D6+6",3,10,2,"3","blast","48\""],
  ["Thunderhawk Gunship","Turbo-laser destructor","T","D3+1",3,20,4,"D6+6","blast","96\""],
  ["Thunderhawk Gunship","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Tycho the Lost","Blood Song","T","2",2,4,1,"2","anti:4:inf dev melta:2","24\""],
  ["Tycho the Lost","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Tycho the Lost","Dead Man's Hand","C","6",2,4,1,"2","","càc"],
  ["Vanguard Veteran Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Vanguard Veteran Squad","Grav-pistol","T","1",3,4,1,"2","anti:2:veh pistol","12\""],
  ["Vanguard Veteran Squad","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Vanguard Veteran Squad","Inferno Pistol","T","1",3,8,3,"D3+2","melta:1","9\""],
  ["Vanguard Veteran Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Vanguard Veteran Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Vanguard Veteran Squad","Heirloom Weapon","C","4",3,5,1,"1","","càc"],
  ["Vanguard Veteran Squad","Vanguard Veteran Weapon","C","4",3,5,1,"1","","càc"],
  ["Vanguard Veteran Squad with Jump Packs","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Vanguard Veteran Squad with Jump Packs","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Vanguard Veteran Squad with Jump Packs","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Vanguard Veteran Squad with Jump Packs","Master-crafted Power Weapon","C","3",3,5,2,"2","","càc"],
  ["Vanguard Veteran Squad with Jump Packs","Power fist","C","3",3,8,2,"2","","càc"],
  ["Vanguard Veteran Squad with Jump Packs","Relic Blade","C","3",3,6,2,"2","","càc"],
  ["Vanguard Veteran Squad with Jump Packs","Thunder Hammer","C","3",4,8,2,"3","dev","càc"],
  ["Venerable Dreadnought","Assault Cannon","T","6",3,6,0,"1","dev","24\""],
  ["Venerable Dreadnought","Dreadnought Inferno Cannon","T","2D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Venerable Dreadnought","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Venerable Dreadnought","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Venerable Dreadnought","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Venerable Dreadnought","➤ Heavy Plasma Cannon","T","D3",3,8,3,"3","blast hazardous","36\""],
  ["Venerable Dreadnought","➤ Heavy Plasma Cannon - Standard","T","D3",3,7,2,"2","blast","36\""],
  ["Venerable Dreadnought","➤ Missile Launcher - Frag","T","D6",3,4,0,"1","blast","48\""],
  ["Venerable Dreadnought","➤ Missile Launcher - Krak","T","1",3,9,2,"D6","","48\""],
  ["Venerable Dreadnought","Armoured Feet","C","5",3,6,0,"1","","càc"],
  ["Venerable Dreadnought","Close combat weapon","C","5",3,6,0,"1","","càc"],
  ["Venerable Dreadnought","Dreadnought Combat Weapon","C","5",3,12,2,"3","","càc"],
  ["Vindicator","Demolisher Cannon","T","D6+3",3,14,3,"D6","blast","24\""],
  ["Vindicator","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Vindicator","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Vindicator","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Whirlwind","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Whirlwind","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Whirlwind","Whirlwind Vengeance Launcher","T","D6+3",3,8,2,"2","blast indirect","72\""],
  ["Whirlwind","Armoured Tracks","C","3",4,6,0,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Aggressor Squad","Infanterie"],
  ["Ancient","Personnage"],
  ["Ancient in Terminator Armour","Personnage"],
  ["Apothecary","Personnage"],
  ["Apothecary Biologis","Personnage"],
  ["Assault Intercessor Squad","Battleline"],
  ["Assault Intercessors with Jump Packs","Infanterie"],
  ["Astorath","Epic Hero"],
  ["Astraeus","Véhicule"],
  ["Baal Predator","Véhicule"],
  ["Ballistus Dreadnought","Véhicule"],
  ["Bladeguard Ancient","Personnage"],
  ["Bladeguard Veteran Squad","Infanterie"],
  ["Blood Angels Captain","Personnage"],
  ["Brother Corbulo","Epic Hero"],
  ["Brutalis Dreadnought","Véhicule"],
  ["Captain","Personnage"],
  ["Captain Tycho","Epic Hero"],
  ["Captain in Gravis Armour","Personnage"],
  ["Captain in Phobos Armour","Personnage"],
  ["Captain in Terminator Armour","Personnage"],
  ["Captain on Bike","Personnage"],
  ["Captain with Jump Pack","Personnage"],
  ["Centurion Assault Squad","Infanterie"],
  ["Centurion Devastator Squad","Infanterie"],
  ["Chaplain","Personnage"],
  ["Chaplain in Terminator Armour","Personnage"],
  ["Chaplain on Bike","Personnage"],
  ["Chaplain with Jump Pack","Personnage"],
  ["Chief Librarian Mephiston","Epic Hero"],
  ["Commander Dante","Epic Hero"],
  ["Company Heroes","Personnage"],
  ["Death Company Captain","Personnage"],
  ["Death Company Captain with Jump Pack","Personnage"],
  ["Death Company Dreadnought","Véhicule"],
  ["Death Company Dreadnought with Magna-Grapple","Véhicule"],
  ["Death Company Marines","Infanterie"],
  ["Death Company Marines with Boltguns","Infanterie"],
  ["Death Company Marines with Boltguns and Jump Packs","Infanterie"],
  ["Death Company Marines with Jump Packs","Infanterie"],
  ["Desolation Squad","Infanterie"],
  ["Dreadnought","Véhicule"],
  ["Drop Pod","Véhicule"],
  ["Eliminator Squad","Infanterie"],
  ["Eradicator Squad with Heavy Bolters","Infanterie"],
  ["Eradicator Squad with Melta Rifles","Infanterie"],
  ["Firestrike Servo-Turrets","Véhicule"],
  ["Furioso Dreadnought","Véhicule"],
  ["Gabriel Seth","Epic Hero"],
  ["Gladiator Lancer","Véhicule"],
  ["Gladiator Reaper","Véhicule"],
  ["Gladiator Valiant","Véhicule"],
  ["Hammerfall Bunker","Fortification"],
  ["Heavy Intercessor Squad","Battleline"],
  ["Hellblaster Squad","Infanterie"],
  ["Impulsor","Véhicule"],
  ["Inceptor Squad","Infanterie"],
  ["Incursor Squad","Infanterie"],
  ["Infernus Squad","Infanterie"],
  ["Infiltrator Squad","Infanterie"],
  ["Intercessor Squad","Battleline"],
  ["Invader ATVs","Monté"],
  ["Invictor Tactical Warsuit","Véhicule"],
  ["Judiciar","Personnage"],
  ["Land Raider","Véhicule"],
  ["Land Raider Crusader","Véhicule"],
  ["Land Raider Excelsior","Véhicule"],
  ["Land Raider Redeemer","Véhicule"],
  ["Land Speeder","Véhicule"],
  ["Lemartes","Epic Hero"],
  ["Librarian","Personnage"],
  ["Librarian Dreadnought","Véhicule"],
  ["Librarian in Phobos Armour","Personnage"],
  ["Librarian in Terminator Armour","Personnage"],
  ["Lieutenant","Personnage"],
  ["Lieutenant in Phobos Armour","Personnage"],
  ["Lieutenant with Combi-weapon","Personnage"],
  ["Outrider Squad","Monté"],
  ["Predator Annihilator","Véhicule"],
  ["Predator Destructor","Véhicule"],
  ["Razorback","Véhicule"],
  ["Redemptor Dreadnought","Véhicule"],
  ["Reiver Squad","Infanterie"],
  ["Relic Razorback","Véhicule"],
  ["Repulsor","Véhicule"],
  ["Repulsor Executioner","Véhicule"],
  ["Rhino","Véhicule"],
  ["Rhino Primaris","Véhicule"],
  ["Sanguinary Guard","Infanterie"],
  ["Sanguinary Priest","Personnage"],
  ["Sanguinary Priest with Jump Pack","Personnage"],
  ["Scout Bike Squad","Monté"],
  ["Scout Squad","Infanterie"],
  ["Sternguard Veteran Squad","Infanterie"],
  ["Storm Speeder Hailstrike","Véhicule"],
  ["Storm Speeder Hammerstrike","Véhicule"],
  ["Storm Speeder Thunderstrike","Véhicule"],
  ["Stormhawk Interceptor","Véhicule"],
  ["Stormraven Gunship","Véhicule"],
  ["Stormtalon Gunship","Véhicule"],
  ["Techmarine","Personnage"],
  ["Terminator Assault Squad","Infanterie"],
  ["Terminator Squad","Infanterie"],
  ["The Sanguinor","Epic Hero"],
  ["Thunderhawk Gunship","Véhicule"],
  ["Tycho the Lost","Epic Hero"],
  ["Vanguard Veteran Squad","Infanterie"],
  ["Vanguard Veteran Squad with Jump Packs","Infanterie"],
  ["Venerable Dreadnought","Véhicule"],
  ["Vindicator","Véhicule"],
  ["Whirlwind","Véhicule"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Astorath": [
  "Death Company Marines with Jump Packs"
 ],
 "Blood Angels Captain": [
  "Assault Intercessor Squad",
  "Company Heroes",
  "Infernus Squad",
  "Intercessor Squad",
  "Sternguard Veteran Squad"
 ],
 "Captain": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Company Heroes",
  "Desolation Squad",
  "Hellblaster Squad",
  "Infernus Squad",
  "Intercessor Squad",
  "Sternguard Veteran Squad",
  "Vanguard Veteran Squad"
 ],
 "Captain in Gravis Armour": [
  "Aggressor Squad",
  "Eradicator Squad with Heavy Bolters",
  "Eradicator Squad with Melta Rifles",
  "Heavy Intercessor Squad"
 ],
 "Captain in Phobos Armour": [
  "Eliminator Squad",
  "Incursor Squad",
  "Infiltrator Squad",
  "Reiver Squad",
  "Scout Squad"
 ],
 "Captain in Terminator Armour": [
  "Terminator Assault Squad",
  "Terminator Squad"
 ],
 "Captain on Bike": [
  "Outrider Squad"
 ],
 "Captain with Jump Pack": [
  "Assault Intercessors with Jump Packs",
  "Sanguinary Guard",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "Chaplain": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Death Company Marines",
  "Hellblaster Squad",
  "Infernus Squad",
  "Intercessor Squad",
  "Sternguard Veteran Squad",
  "Vanguard Veteran Squad"
 ],
 "Chaplain in Terminator Armour": [
  "Terminator Assault Squad",
  "Terminator Squad"
 ],
 "Chaplain on Bike": [
  "Outrider Squad"
 ],
 "Chaplain with Jump Pack": [
  "Assault Intercessors with Jump Packs",
  "Death Company Marines with Jump Packs",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "Commander Dante": [
  "Assault Intercessors with Jump Packs",
  "Sanguinary Guard",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "Death Company Captain": [
  "Death Company Marines"
 ],
 "Death Company Captain with Jump Pack": [
  "Death Company Marines with Jump Packs"
 ],
 "Lemartes": [
  "Death Company Marines with Jump Packs"
 ],
 "Librarian": [
  "Assault Intercessor Squad",
  "Desolation Squad",
  "Hellblaster Squad",
  "Infernus Squad",
  "Intercessor Squad",
  "Sternguard Veteran Squad",
  "Vanguard Veteran Squad"
 ],
 "Librarian in Phobos Armour": [
  "Eliminator Squad",
  "Incursor Squad",
  "Infiltrator Squad",
  "Reiver Squad",
  "Scout Squad"
 ],
 "Librarian in Terminator Armour": [
  "Terminator Assault Squad",
  "Terminator Squad"
 ],
 "Techmarine": [
  "Assault Intercessor Squad",
  "Desolation Squad",
  "Intercessor Squad"
 ],
 "Tycho the Lost": [
  "Death Company Marines with Boltguns"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Astorath": [
  [
   "Redeemer of the Lost",
   "In the Fight phase, when a model in this unit is destroyed, if this unit has not been selected to fight this phase, roll one D6, with +1 to that roll if that model was engaged with an enemy unit with a T greater than or equal to this unit's T:\n\n- On a 4+, do not remove that model from the battlefield. When this unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield."
  ],
  [
   "Mass of Doom",
   "If this unit made a charge move this turn, this unit's melee attacks have [DEVASTATING WOUNDS:non-MONSTER/VEHICLE]"
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\nDeath Company Marines with Jump Packs"
  ]
 ],
 "Baal Predator": [
  [
   "Overcharged Engines",
   "This unit can re-roll advance rolls."
  ]
 ],
 "Brother Corbulo": [
  [
   "Sanguinary Priest",
   "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability."
  ],
  [
   "The Red Grail",
   "While this model is leading a unit, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Assault Squad\n■ Assault Intercessor Squad\n■ Sternguard Veteran Squad\n■ Devastator Squad\n■ Tactical Squad\n■ Vanguard Veteran Squad"
  ]
 ],
 "Captain Tycho": [
  [
   "Gifted Commander",
   "While this model is leading a unit, each time that unit is selected to shoot, select one of the following abilities to apply to ranged weapons equipped by models in that unit until the end of the phase:\n\n\n■ [ASSAULT]\n■ [HEAVY]\n■ [RAPID FIRE 1]"
  ],
  [
   "Embittered",
   "The first time an attack is allocated to this model, after the attacking unit has finished making its attacks, until the end of the battle, change the Attacks characteristic of this model’s Dead Man’s Hand to 12"
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Assault Squad\n■ Command Squad\n■ Assault Intercessor Squad\n■ Sternguard Veteran Squad\n■ Company Heroes\n■ Tactical Squad\n■ Vanguard Veteran Squad"
  ],
  [
   "Tycho",
   "Your army cannot contain both Captain Tycho and Tycho the Lost."
  ]
 ],
 "Tycho the Lost": [
  [
   "Forlorn Hero",
   "While this model is leading a unit, that unit is  eligible to declare a charge in a turn in which it Advanced"
  ],
  [
   "Death Visions of Sanguinius",
   "If this model is destroyed by a melee attack, after the attacking unit has finished making its attacks, you can roll one D6, adding 2 to the result if the attacking unit contains the enemy Warlord: on a 2-3, that enemy unit suffers 3 mortal wounds; on a 4-5, that enemy unit suffers D3+3 mortal wounds; on a 6+, that enemy unit suffers D6+3 mortal wounds."
  ],
  [
   "Tycho",
   "Your army cannot contain both Captain Tycho and Tycho the Lost."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n\n■ Death Company Marines"
  ],
  [
   "Black Rage",
   "Each time a model in this unit makes an attack, you can re-roll the Hit roll. While this unit is not within 12\" of one or more friendly Chaplain models, it cannot be selected to Fall Back and the Objective Control characteristic of models in this unit is 0."
  ]
 ],
 "Chief Librarian Mephiston": [
  [
   "Chief Librarian (Psyker level 3)",
   "This model has the psychic abilities listed in the Psychic Abilities section."
  ]
 ],
 "Commander Dante": [
  [
   "Death Mask of Sanguinius",
   "At the start of the Fight phase, each enemy unit within 6\" of this model makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Lord Regent of the Imperium Nihilus",
   "The assault doctrine and tactical doctrine are active for this unit in addition to any other combat doctrine."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Assault Squad with Jump Packs\n■ Sanguinary Guard\n■ Vanguard Veteran Squad with Jump Packs\n■ Assault Intercessors with Jump Packs"
  ]
 ],
 "Death Company Dreadnought with Magna-Grapple": [
  [
   "Frenzied Reprisal",
   "Each time an enemy unit targets this model, after that unit has finished making its attacks, this model can either shoot as if it were your Shooting phase or fight as if it were the Fight phase."
  ],
  [
   "Magna-grapple",
   "Add 2 to Charge rolls made for the bearer if one or more of the targets of that charge is a MOSNTER or VEHICLE unit."
  ],
  [
   "Black Rage",
   "Each time a model in this unit makes an attack, you can re-roll the Hit roll. While this unit is not within 12\" of one or more friendly Chaplain models, it cannot be selected to Fall Back and the Objective Control characteristic of models in this unit is 0."
  ]
 ],
 "Death Company Marines with Boltguns": [
  [
   "An Honourable Death in Combat",
   "Each time a model in this unit makes an attack, that attack has the [SUSTAINED HITS 1] ability if this unit is below its Starting Strength, or the [SUSTAINED HITS 2] ability if this unit is Below Half-strength."
  ],
  [
   "Attached Leader",
   "If a Chaplain model from your army with the Leader ability can be attached to a Tactical Squad, it can be attached to this unit instead.\n\n\nIf a Character unit from your army with the Leader ability can be attached to a Death Company Marines unit, it can be attached to this unit instead."
  ],
  [
   "Black Rage",
   "- This unit's melee attacks can re-roll hit rolls of 1.\n- While this unit is not within 6\" of one or more friendly Blood Angels Character models, or not within 12\" of one or more friendly Chaplain models, it cannot make a fall-back move and its OC is modified to 0."
  ]
 ],
 "Death Company Marines with Jump Packs": [
  [
   "Savage Fury",
   "This unit has +1 to charge rolls."
  ],
  [
   "Black Rage",
   "- This unit's melee attacks can re-roll hit rolls of 1.\n- While this unit is not within 6\" of one or more friendly Blood Angels Character models, or not within 12\" of one or more friendly Chaplain models, it cannot make a fall-back move and its OC is modified to 0."
  ]
 ],
 "Furioso Dreadnought": [
  [
   "Wrathful Rampage",
   "Each time this model is selected to fight, you can select one enemy unit within Engagement Range  of it and roll one D6, adding 2 to the result if this model made a Charge move this turn: on a 4-5, that enemy unit suffers D3 mortal wounds; on a 6+, that enemy unit suffers 3 mortal wounds."
  ],
  [
   "Magna-grapple",
   "The bearer loses the Smoke keyword, but  add 2 to Charge rolls made for the bearer if one or more of the targets of that charge is a Monster or Vehicle unit"
  ]
 ],
 "Gabriel Seth": [
  [
   "Lord of Slaughter",
   "While this model is leading a unit, that unit is eligible to declare a charge in a turn in which it Advanced"
  ],
  [
   "Whirlwind of Rage",
   "Each time this model fights, until that fight is resolved, add 1 to the Attacks characteristic of this model’s Blood Reaver for every 5 enemy models within 6\" of this model."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Assault Squad\n■ Command Squad\n■ Tactical Squad\n■ Vanguard Veteran Squad\n■ Assault Intercessor Squad\n■ Company Heroes\n■ Sternguard Veteran Squad\n■ Bladeguard Veteran Squad"
  ]
 ],
 "Lemartes": [
  [
   "Guardian of the Lost",
   "Attacks that target this unit have -1 D."
  ],
  [
   "Fury Unbound",
   "This unit's melee attacks have [LETHAL HITS]."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n\n■ Death Company Marines with Jump Packs"
  ]
 ],
 "Librarian Dreadnought": [
  [
   "Shield of Sanguinius (Aura, Psychic)",
   "While a friendly Adeptus Astartes unit is within 6\" of this model, models in that unit have the Feel No Pain 5+ ability against mortal wounds and Psychic Attacks."
  ],
  [
   "Wings of Sanguinius (Psychic)",
   "Once per turn, at the end of your Movement phase, one Psyker from your army with this ability can use it. If it does, roll one D6: on a 1, that Psyker suffers D3 mortal wounds; on a 2+, select one friendly Adeptus Astartes Infantry unit within 12\" of that Psyker and remove the selected unit from the battlefield, then set it up again anywhere on the battlefield that is more than 9\"\nhorizontally away from all enemy models."
  ]
 ],
 "Sanguinary Guard": [
  [
   "Angelic Visage",
   "Melee attacks that target this unit have -1 to hit rolls."
  ],
  [
   "Heirs of Azkaellon",
   "Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls."
  ]
 ],
 "Sanguinary Priest": [
  [
   "Narthecium",
   "(Once per turn, per unit) In your Command phase, this unit heals D3+1 wounds."
  ],
  [
   "Blood Chalice",
   "This unit has +1 T."
  ],
  [
   "Support",
   "This model can be attached to the following units: \nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, COMPANY HEROES, DESOLATION SQUAD, HELLBLASTER SQUAD, INFERNUS SQUAD, INTERCESSOR SQUAD, STERNGUARD VETERAN SQUAD"
  ]
 ],
 "The Sanguinor": [
  [
   "Aura of Fervour",
   "Friendly ADEPTUS ASTARTES units within 12\" of this model can re-roll leadership rolls."
  ],
  [
   "Miraculous Savior",
   "(Once per battle, per army) At the end of your opponent's Charge phase (excluding the first battle round), you can select one enemy unit that made a charge move this phase. This unit can make an ingress move and must be set up engaged with that enemy unit. That move does not prevent this unit from being eligible to move"
  ]
 ],
 "Sanguinary Priest with Jump Pack": [
  [
   "Sanguinary Priest",
   "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability"
  ],
  [
   "Blood Chalice",
   "While this model is leading a unit, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1."
  ],
  [
   "Support",
   "This model can be attached to the following units:\n\n■ Assault Squad with Jump Packs\n■ Vanguard Veteran Squad with Jump packs\n■ Assault Intercessors with Jump Packs"
  ]
 ],
 "Blood Angels Captain": [
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Assault Intercessor Squad\n■ Company Heroes\n■ Infernus Squad\n■ Intercessor Squad\n■ Sternguard Veteran Squad"
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ],
  [
   "Finest Hour",
   "(Once per battle, per unit): In the Fight phase, when this unit is selected to fight, you can use this ability. If you do, this model's melee attacks have: \n▪ +3 A \n▪ [DEVASTATING WOUNDS]."
  ]
 ],
 "Death Company Captain": [
  [
   "Leader",
   "This model can be attached to the following units:\nDeath Company Marines"
  ],
  [
   "Forlorn Hero",
   "This unit has Scouts 6\"."
  ],
  [
   "Black Rage",
   "- This unit's melee attacks can re-roll hit rolls of 1.\n- While this unit is not within 6\" of one or more friendly Blood Angels Character models, or not within 12\" of one or more friendly Chaplain models, it cannot make a fall-back move and its OC is modified to 0."
  ],
  [
   "Death Vision of Sanguinius",
   "In the Fight phase, when an enemy unit has fought, if this model was destroyed by those attacks, you can use this ability. If you do, roll one D6, with +2 to that roll if this model was engaged with an enemy warlord unit:\n\n- On a 2-3, that enemy unit suffers D3 mortal wounds.\n- On a 4-5, that enemy unit suffers 3 mortal wounds.\n- On a 6+, that enemy unit suffers D3+3 mortal wounds."
  ]
 ],
 "Death Company Captain with Jump Pack": [
  [
   "Lost to Fury",
   "This unit's melee attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\nDeath Company Marines with Jump Packs"
  ],
  [
   "Relic Shield",
   "This model has +1 W."
  ],
  [
   "Black Rage",
   "- This unit's melee attacks can re-roll hit rolls of 1.\n- While this unit is not within 6\" of one or more friendly Blood Angels Character models, or not within 12\" of one or more friendly Chaplain models, it cannot make a fall-back move and its OC is modified to 0."
  ],
  [
   "Death Vision of Sanguinius",
   "In the Fight phase, when an enemy unit has fought, if this model was destroyed by those attacks, you can use this ability. If you do, roll one D6, with +2 to that roll if this model was engaged with an enemy warlord unit:\n\n- On a 2-3, that enemy unit suffers D3 mortal wounds.\n- On a 4-5, that enemy unit suffers 3 mortal wounds.\n- On a 6+, that enemy unit suffers D3+3 mortal wounds."
  ]
 ],
 "Death Company Marines": [
  [
   "An Honourable Death in Combat",
   "This unit's attacks:\n- Have [SUSTAINED HITS 1], if this unit is below starting strength.\n- Or: have [SUSTAINED HITS 2], if this unit is below half-strength."
  ],
  [
   "Black Rage",
   "- This unit's melee attacks can re-roll hit rolls of 1.\n- While this unit is not within 6\" of one or more friendly Blood Angels Character models, or not within 12\" of one or more friendly Chaplain models, it cannot make a fall-back move and its OC is modified to 0."
  ]
 ],
 "Death Company Dreadnought": [
  [
   "Driven by Fury",
   "In your opponent's Shooting phase, when an enemy unit has shot, if this unit was hit by those attacks, it can make a surge move of up to D6+1\"."
  ],
  [
   "Black Rage",
   "- This unit's melee attacks can re-roll hit rolls of 1.\n- While this unit is not within 6\" of one or more friendly Blood Angels Character models, or not within 12\" of one or more friendly Chaplain models, it cannot make a fall-back move and its OC is modified to 0."
  ]
 ],
 "Death Company Marines with Boltguns and Jump Packs": [
  [
   "Beserk Fury",
   "You can re-roll Charge rolls made for this unit"
  ],
  [
   "Attached Leader",
   "If a Chaplain model from your army with the Leader ability can be attached to Assault Intercessors with Jump Packs or an Assault Squad with Jump Packs, it can be attached to this unit instead.\n\n\nIf a Character unit from your army with the Leader ability can be attached to a Death Company Marines with Jump Packs unit, it can be attached to this unit instead."
  ],
  [
   "Black Rage",
   "Each time a model in this unit makes an attack, you can re-roll the Hit roll. While this unit is not within 12\" of one or more friendly Chaplain models, it cannot be selected to Fall Back and the Objective Control characteristic of models in this unit is 0."
  ]
 ],
 "Captain in Gravis Armour": [
  [
   "Refuse to Yield",
   "Attacks allocated to this model have -1D"
  ],
  [
   "Leader",
   "This model can be attached to the following units:\nAGGRESSOR SQUAD, ERADICATOR SQUAD WITH HEAVY BOLTERS, ERADICATOR SQUAD WITH MELTA RIFLES, HEAVY INTERCESSOR SQUAD, INDOMITOR KILL TEAM"
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ]
 ],
 "Captain in Phobos Armour": [
  [
   "Tactical Fluidity",
   "(Once per battle round, per unit): \n▪ In your Shooting phase, when this unit has shot, if this unit is unengaged, this unit can make a normal move of up to D6\". \n▪ Or: At the end of your opponent's Fight phase if this unit is engaged, this unit can make a fall-back move of up to 6\"."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\nELIMINATOR SQUAD, INCURSOR SQUAD, INFILTRATOR SQUAD, REIVER SQUAD, SCOUT SQUAD, SPECTRUS KILL TEAM, WOLF SCOUTS"
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ]
 ],
 "Captain in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units: DEATHWATCH TERMINATOR SQUAD, DEATHWING KNIGHTS, DEATHWING TERMINATOR SQUAD, RELIC TERMINATOR SQUAD, TERMINATOR ASSAULT SQUAD, TERMINATOR SQUAD"
  ],
  [
   "Unstoppable Valour",
   "You can re-roll Charge rolls made for this unit."
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ]
 ],
 "Captain with Jump Pack": [
  [
   "Angel's Wrath",
   "This unit has +1 to Advance and Charge rolls"
  ],
  [
   "Leader",
   "This model can be attached to the following units: ASSAULT INTERCESSORS WITH JUMP PACKS, ASSAULT SQUAD WITH JUMP PACKS, SANGUINARY GUARD, TALONSTRIKE KILL TEAM, VANGUARD VETERAN SQUAD WITH JUMP PACKS"
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ],
  [
   "Relic Shield",
   "Add 1 to the bearer's Wounds characteristic."
  ]
 ],
 "Intercessor Squad": [
  [
   "Bolter Discipline",
   "In your Shooting phase, if any of the following apply, this unit's ranged attacks have +1 to hit rolls: \n▪ This unit is within range of an objective. \n▪ The target of that attack is within range of an objective."
  ],
  [
   "Tactical Mainstay",
   "▪ Being engaged/battle-shocked does not prevent this unit from being eligible to start an action. \n▪ When this unit starts an action, that action does not prevent this unit from being eligible to shoot."
  ]
 ],
 "Infernus Squad": [
  [
   "Driven from Cover",
   "In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. Friendly ADEPTUS ASTARTES units' ranged attacks that target that enemy unit have [IGNORES COVER]."
  ]
 ],
 "Assault Intercessor Squad": [
  [
   "Targeted Intercession",
   "If this unit made a charge move this turn, this unit's melee attacks have +1 S and AP."
  ]
 ],
 "Heavy Intercessor Squad": [
  [
   "Unyielding in the Face of the Foe",
   "While this unit is controlling an objective, this unit has +1 to save rolls."
  ]
 ],
 "Infiltrator Squad": [
  [
   "Omni-scramblers",
   "In your Shooting phase, you can select one visible enemy unit within 18\" of this unit. That unit is detected: \n▪ While a unit is detected, that unit has +3\" detection range."
  ],
  [
   "Helix Gauntlet",
   "In your Command phase, this unit heals D3 wounds."
  ]
 ],
 "Incursor Squad": [
  [
   "Divinator-class Auspexes",
   "(Once per phase, per unit) In your Shooting phase, when a friendly ADEPTUS ASTARTES unit is selected to shoot, you can use this ability. If you do, select one visible enemy unit within 18\" of this unit. That unit is scanned: \n▪ While a unit is scanned, ranged attacks that target that unit can re-roll hit rolls of 1."
  ],
  [
   "Haywire Mine",
   "(Once per battle, per unit) In your Shooting phase, you can select one visible enemy unit within 6\" of this unit and roll one D6. On a 2+: \n▪ That enemy unit suffers D3 mortal wounds. \n▪ Or: If that enemy unit is a VEHICLE unit, that enemy unit suffers 2D3 mortal wounds."
  ]
 ],
 "Scout Squad": [
  [
   "Flexible Asset",
   "When this unit is selected to make an advance/fall-back move, that advance/fall-back move does not prevent this unit from being eligible to start an action."
  ]
 ],
 "Bladeguard Veteran Squad": [
  [
   "Bladeguard",
   "(Once per turn, per unit): In the Fight phase, when this unit is selected to fight or when an enemy unit targets this unit, you can select one of the following:\n\n\n▪ This unit’s melee attacks have +1 to hit rolls.\n▪ Or: Attacks that target this unit have -1 to hit rolls."
  ]
 ],
 "Vanguard Veteran Squad with Jump Packs": [
  [
   "Vanguard Assault",
   "If this unit made a charge move this turn, this unit's melee attacks have +1A"
  ],
  [
   "Combat Shield",
   "This model has a 5+ InvSv"
  ]
 ],
 "Vanguard Veteran Squad": [
  [
   "Vanguard Assault",
   "Each time this unit ends a Charge move, until the end of the turn, melee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ],
  [
   "Storm Shield",
   "The bearer has a 4+ invulnerable save"
  ]
 ],
 "Sternguard Veteran Squad": [
  [
   "Sternguard Focus",
   "This unit's ranged attacks can re-roll hit rolls of 1"
  ]
 ],
 "Reiver Squad": [
  [
   "Fearsome Assault",
   "At the start of the Fight phase, each enemy unit engaged with a unit with this ability makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Terror Troops (Aura)",
   "While an enemy model is within 3\" of this unit, that enemy model has -1 OC."
  ],
  [
   "Grapnel Launchers",
   "When this unit makes a move, this unit can: \n▪ Move through all types of model. \n▪ Ignore all vertical distance for the purposes of how far this unit has moved."
  ],
  [
   "Grav-chute",
   "This unit has Deep Strike."
  ]
 ],
 "Aggressor Squad": [
  [
   "Close-quarters Firepower",
   "This unit's attacks that target an enemy unit within 9\" of this unit have +1S"
  ]
 ],
 "Terminator Assault Squad": [
  [
   "Terminatus Assault",
   "If this unit made a charge move this turn, this unit's: \n▪ Lightning Claws weapons have [SUSTAINED HITS 1: NON-MONSTER/VEHICLE] \n▪ Thunder Hammer weapons have [SUSTAINED HITS 1: MONSTER/VEHICLE]."
  ],
  [
   "Storm Shield",
   "The bearer has a Wounds characteristic of 4."
  ],
  [
   "Teleport Homer",
   "(Once per battle, per unit) At the start of the battle, you can set up one Teleport Homer token for this unit on the battlefield. If you do: When you target this unit with the Rapid Ingress stratagem, you can use that Teleport Homer token. If you do, that use is -1 CP, but when resolving that stratagem, this unit must be set up within 3\" of that Teleport Homer token and not within 8\" of an enemy unit. That Teleport Homer token is then removed from the battlefield. If an enemy unit ends a move within 1\" of that Teleport Homer token, that Teleport Homer token is removed from the battlefield."
  ]
 ],
 "Terminator Squad": [
  [
   "Fury of the First",
   "This unit's attacks that target a unit within 9\" of this unit have +1 AP."
  ],
  [
   "Teleport Homer",
   "(Once per battle, per unit) At the start of the battle, you can set up one Teleport Homer token for this unit on the battlefield. If you do: When you target this unit with the Rapid Ingress stratagem, you can use that Teleport Homer token. If you do, that use is -1 CP, but when resolving that stratagem, this unit must be set up within 3\" of that Teleport Homer token and not within 8\" of an enemy unit. That Teleport Homer token is then removed from the battlefield. If an enemy unit ends a move within 1\" of that Teleport Homer token, that Teleport Homer token is removed from the battlefield."
  ]
 ],
 "Centurion Assault Squad": [
  [
   "Annihilator Protocols",
   "Melee weapons equipped by models in this unit have the [SUSTAINED HITS 2] ability when targeting Monster, Vehicle or Fortification units"
  ],
  [
   "Centurion Assault Launchers",
   "The bearer has the Grenades keyword."
  ]
 ],
 "Centurion Devastator Squad": [
  [
   "Decimator Protocols",
   "Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Hit roll instead."
  ]
 ],
 "Invictor Tactical Warsuit": [
  [
   "Forward Assault Warsuit",
   "At the start of the first battle round, you can select one enemy unit to be this unit's mark:\n▪ This unit's attacks that target this unit's mark can re-roll wound rolls of 1.\n▪  Each time this unit's mark is destroyed, select one enemy unit to be this unit's mark."
  ]
 ],
 "Dreadnought": [
  [
   "Wisdom of the Ancients [Aura]",
   "While a friendly Adeptus Astartes Infantry unit is within 6\" of this model, each time a model in that unit makes an attack, re-roll a Hit roll of 1."
  ]
 ],
 "Redemptor Dreadnought": [
  [
   "Duty Eternal",
   "Attacks that target this unit with a S greater than this unit's T have -1 to wound rolls."
  ]
 ],
 "Ballistus Dreadnought": [
  [
   "Ballistus Strike",
   "This unit's ranged attacks that target an enemy unit within 24\" of this unit have [SUSTAINED HITS 1]"
  ]
 ],
 "Brutalis Dreadnought": [
  [
   "Brutalis Charge",
   "You can target this unit with the Crushing Impact stratagem, regardless of any other uses of that stratagem this phase. If you do:\n▪ That use is -1 CP.\n▪ That use does not prevent any uses of that stratagem on other units this phase."
  ]
 ],
 "Outrider Squad": [
  [
   "Full-throttle Assault",
   "If this unit made a charge move this turn, this unit's: \n▪ Thunder Hammer weapons have +1 to hit rolls and [SUSTAINED HITS 1]. \n▪ Other melee weapons have +1 D and [SUSTAINED HITS 1]."
  ]
 ],
 "Scout Bike Squad": [
  [
   "Outflank",
   "When this unit arrives from Strategic Reserves, it can be set up within your opponent’s deployment zone (all other restrictions still apply)."
  ]
 ],
 "Inceptor Squad": [
  [
   "Meteoric Descent",
   "If this unit made an ingress move this turn, this unit's ranged attacks have +1 to hit rolls."
  ],
  [
   "Parabolic Jetleap",
   "At the end of your opponent's Fight phase, if this unit is unengaged, you can place this unit in strategic reserves."
  ]
 ],
 "Storm Speeder Hailstrike": [
  [
   "Hailstrike",
   "In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. Friendly Adeptus Astartes units' ranged attacks that target that enemy unit have [Ignores Cover]."
  ]
 ],
 "Storm Speeder Thunderstrike": [
  [
   "Thunderstrike",
   "This unit's ranged attacks that target a Monster/Vehicle unit have +1 to wound rolls."
  ],
  [
   "Shattered Defences",
   "In your Shooting phase, when this unit has shot, select one enemy Monster/Vehicle unit hit by those attacks. Friendly Adeptus Astartes units' ranged attacks that target that enemy unit have +1 AP."
  ]
 ],
 "Storm Speeder Hammerstrike": [
  [
   "Hammerstrike",
   "This unit's ranged attacks that target an enemy unit within a terrain area have [SUSTAINED HITS 1]"
  ]
 ],
 "Hellblaster Squad": [
  [
   "Rites of Thermal Appeasement",
   "This unit has +1 to hazard rolls made for its Plasma Incinerator and Plasma Pistol weapons."
  ]
 ],
 "Eliminator Squad": [
  [
   "Special-issue Optics and Ammunition",
   "In your Shooting phase, when this unit is selected to shoot, you can select one of the following: \n▪ This unit's ranged attacks have [IGNORES COVER]. \n▪ Or: Select one enemy unit within 24\" of this unit. That enemy unit has +6\" detection range until this unit has shot."
  ],
  [
   "Chameleoline Cloaks",
   "This unit has -3\" detection range"
  ]
 ],
 "Eradicator Squad with Melta Rifles": [
  [
   "Total Obliteration",
   "This unit's ranged attacks can re-roll damage rolls"
  ]
 ],
 "Desolation Squad": [
  [
   "Targeter Optics",
   "This unit's ranged attacks that target a visible enemy unit have [IGNORES COVER]"
  ]
 ],
 "Firestrike Servo-Turrets": [
  [
   "Sentinel Protocols",
   "(Once per phase per unit) You can target this unit with the Fire Overwatch stratagem, regardless of any other uses of that stratagem this phase. If you do: \n▪ This unit's snap shooting attacks hit on unmodified hit rolls of 4+ until that stratagem is resolved. \n▪ That use does not prevent any uses of that stratagem on other units this phase."
  ]
 ],
 "Whirlwind": [
  [
   "Pinning Bombardment",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with its Whirlwind vengeance launcher scored a hit against an enemy Infantry unit, that unit must take a Battle-shock test."
  ]
 ],
 "Predator Destructor": [
  [
   "Destructor",
   "Each time this model makes a ranged attack that targets an Infantry unit, improve the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Predator Annihilator": [
  [
   "Annihilator",
   "Each time a ranged attack made by this model is allocated to a Monster or Vehicle model, you can re-roll the Damage roll"
  ]
 ],
 "Gladiator Lancer": [
  [
   "Aqullon Optics",
   "This unit's ranged attacks that target a Monster/Vehicle unit can:\n▪ Re-roll one hit roll.\n▪ Re-roll one wound roll.\n▪ Re-roll one damage roll."
  ]
 ],
 "Gladiator Reaper": [
  [
   "Reaping Tally",
   "This unit's ranged attacks that target a unit (excluding Monster/Vehicle units) have +1 AP."
  ]
 ],
 "Gladiator Valiant": [
  [
   "Priority Target Acquisition",
   "This unit's ranged attacks that target a unit within 12\" of this unit have +1S"
  ]
 ],
 "Vindicator": [
  [
   "Siege Shield",
   "When making ranged attacks with its demolisher cannon, this model can target enemy units within Engagement Range of it (provided no other friendly units are also within Engagement Range of that enemy unit). In addition, when making ranged attacks, this model does not suffer the penalty to its Hit rolls for being within Engagement Range of one or more enemy units."
  ]
 ],
 "Land Raider": [
  [
   "Transport",
   "This model has a transport capacity of 14 Adeptus Astartes Infantry models. It cannot transport Jump Pack models. Each Gravis/Terminator model takes up the space of 2 models"
  ],
  [
   "Power of the Machine Spirit",
   "This unit's ranged attacks can:\n▪ Re-roll one hit roll.\n▪ Re-roll one wound roll."
  ],
  [
   "Assault Ramp",
   "In your Movement phase, when this unit ends a normal move, units embarked within this unit can make an assault disembark move (pg 157)."
  ]
 ],
 "Land Raider Crusader": [
  [
   "Transport",
   "This model has a transport capacity of 16 Adeptus Astartes Infantry models. It cannot transport Jump Pack models. Each Gravis/Terminator model takes up the space of 2 models"
  ],
  [
   "Fury of the Machine Spirit",
   "This unit's ranged attacks that target a unit within 12\" of this unit have Lethal Hits"
  ],
  [
   "Assault Ramp",
   "In your Movement phase, when this unit ends a normal move, units embarked within this unit can make an assault disembark move (pg 157)."
  ]
 ],
 "Land Raider Redeemer": [
  [
   "Transport",
   "This model has a transport capacity of 14 Adeptus Astartes Infantry models. It cannot transport Jump Pack models. Each Gravis/Terminator model takes up the space of 2 models"
  ],
  [
   "Wrath of the Machine Spirit",
   "This unit’s ranged attacks that target a unit within 12\" of this unit have [Devastating Wounds: non-Monster/vehicle]"
  ],
  [
   "Assault Ramp",
   "In your Movement phase, when this unit ends a normal move, units embarked within this unit can make an assault disembark move (pg 157)."
  ]
 ],
 "Repulsor": [
  [
   "Transport",
   "This model has a transport capacity of 14 Adeptus Astartes Infantry models. It cannot transport Jump Pack models. Each Gravis/Terminator model takes up the space of 2 models."
  ],
  [
   "Combat Embarkation",
   "In your opponent's Charge phase, when an enemy unit has selected charge targets, you can select one friendly unengaged Adeptus Astartes unit that was one of those charge targets and is eligible to embark within this Transport. If every model in that unit is within 3\" of this Transport, that unit can embark within this Transport. That enemy unit can then select new charge targets for that charge move."
  ]
 ],
 "Repulsor Executioner": [
  [
   "Transport",
   "This model has a transport capacity of 7 Adeptus Astartes Infantry models. It cannot transport Jump Pack models. Each Gravis/Terminator model takes up the space of 2 models."
  ],
  [
   "Executioner",
   "This unit's ranged attacks that target a unit not below half-strength have +1 to hit rolls."
  ]
 ],
 "Rhino": [
  [
   "Veiling Smoke",
   "(Once per phase, per unit) You can target this unit with the Smokescreen stratagem, regardless of any other uses of that stratagem this phase. If you do: That use is -1 CP. That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Transport",
   "This model has a transport capacity of 12 ADEPTUS ASTARTES INFANTRY models. It cannot transport JUMP PACK/GRAVIS/TERMINATOR models"
  ]
 ],
 "Razorback": [
  [
   "Fire Support",
   "In your Shooting phase, after this model has  shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ],
  [
   "Transport",
   "This model has a transport capacity of 6 Adeptus Astartes Infantry models.  It cannot transport JUMP PACK, WULFEN, PHOBOS, GRAVIS, CENTURION, TERMINATOR or TACTICUS models (excluding TACTICUS CHARACTER models that began the battle attached to a non-TACTICUS unit)"
  ]
 ],
 "Impulsor": [
  [
   "Transport",
   "This model has a transport capacity of 7 ADEPTUS ASTARTES INFANTRY models. It cannot transport TERMINATOR/JUMP PACK models. Each GRAVIS model takes up the space of 2 models."
  ],
  [
   "Rapid Disembarkation",
   "In your Movement phase, when this unit ends an advance move, units embarked within this unit can make a shock disembark move (pg 157)."
  ],
  [
   "Orbital Comms Array",
   "This unit has Scouts 6\""
  ],
  [
   "Shield Dome",
   "This unit has a 5+ InvSv"
  ]
 ],
 "Drop Pod": [
  [
   "Drop Pod Assault",
   "▪ This unit must start the battle in strategic reserves. \n▪ In your first Movement phase, this unit can make an ingress move. \n▪ When this unit is set up, all units embarked within this unit must make a disembark/assault disembark move (pg 157), and those units must be set up more than 8\" away from all enemy units."
  ],
  [
   "Transport",
   "This model has a transport capacity of 12 Adeptus Astartes Infantry models. It cannot transport GRAVIS/JUMP PACK/TERMINATOR models."
  ],
  [
   "Deployment Complete",
   "When this unit is set up on the battlefield and all units within it have disembarked, units cannot embark within this TRANSPORT"
  ]
 ],
 "Stormhawk Interceptor": [
  [
   "Interceptor",
   "Each time this model makes a ranged attack that targets a unit that can Fly, add 1 to the Hit roll"
  ],
  [
   "Thundercowl Turbines",
   "Ravenwing Fly/Mounted unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Nightforged Battery",
   "Landspeeder Vengeance unit only. This unit can re-roll:\n\n\n▪ Rolls to determine the A of a weapon.\n▪ Hazard rolls."
  ]
 ],
 "Stormtalon Gunship": [
  [
   "Strafing Run",
   "Each time this model makes a ranged attack that targets a unit that cannot Fly, add 1 to the Hit roll."
  ],
  [
   "Thundercowl Turbines",
   "Ravenwing Fly/Mounted unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Nightforged Battery",
   "Landspeeder Vengeance unit only. This unit can re-roll:\n\n\n▪ Rolls to determine the A of a weapon.\n▪ Hazard rolls."
  ]
 ],
 "Stormraven Gunship": [
  [
   "Armoured Resilience",
   "Each time an attack is allocated to this model, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Transport",
   "This model has a transport capacity of 12 Adeptus Astartes Infantry models and 1 Dreadnought model. Each Jump Pack, Wulfen, Gravis or Terminator model takes up the space of 2 models and each Centurion model takes up the space of 3 models."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Thundercowl Turbines",
   "Ravenwing Fly/Mounted unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Nightforged Battery",
   "Landspeeder Vengeance unit only. This unit can re-roll:\n\n\n▪ Rolls to determine the A of a weapon.\n▪ Hazard rolls."
  ]
 ],
 "Hammerfall Bunker": [
  [
   "Fortification",
   "While an enemy unit is only within Engagement Range of one or more Fortifications from your army:\n■ That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n■ Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so."
  ],
  [
   "Ceramite Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack."
  ],
  [
   "Defensive Array",
   "You can target this Fortification with the Fire Overwatch Strategem for 0CP, and can do so even if you have already targeted another unit with that Stratagem this turn. This Fortification can only be targeted with that Stratagem once per turn."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Captain on Bike": [
  [
   "Swift Assault",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [ASSAULT] ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units: BIKE SQUAD, COMPANY VETERANS ON BIKES, OUTRIDER SQUAD"
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ],
  [
   "Relic Shield",
   "Add 1 to the bearer's Wounds characteristic."
  ]
 ],
 "Lieutenant": [
  [
   "Support",
   "This model can be attached to the following units: \n\nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, COMPANY HEROES, CRUSADER SQUAD, DEATHWATCH VETERANS, DECIMUS KILL TEAM, DESOLATION SQUAD, FORTIS KILL TEAM, HELLBLASTER SQUAD, INFERNUS SQUAD, INNER CIRCLE COMPANIONS, INTERCESSOR SQUAD, STERNGUARD VETERAN SQUAD, SWORD BRETHREN SQUAD, VANGUARD VETERAN SQUAD"
  ],
  [
   "Storm Shield",
   "The bearer has a 4+ invulnerable save"
  ],
  [
   "Demi-company Commander",
   "(Once per turn, per unit): When a friendly CAPTAIN unit uses its Strategic Acumen ability, you can use this ability. If you do, the selected combat doctrine is active for this unit until the start of your next Command phase."
  ],
  [
   "Tactical Precision",
   "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ]
 ],
 "Lieutenant in Phobos Armour": [
  [
   "Support",
   "This model can be attached to the following units:\nELIMINATOR SQUAD, INCURSOR SQUAD, INFILTRATOR SQUAD, REIVER SQUAD, SPECTRUS KILL TEAM, WOLF SCOUTS"
  ],
  [
   "Tactical Precision",
   "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Demi-company Commander",
   "(Once per turn, per unit): When a friendly CAPTAIN unit uses its Strategic Acumen ability, you can use this ability. If you do, the selected combat doctrine is active for this unit until the start of your next Command phase."
  ]
 ],
 "Librarian": [
  [
   "Leader",
   "This model can be attached to the following units: \nASSAULT INTERCESSOR SQUAD, DEATHWATCH VETERANS, DECIMUS KILL TEAM, DESOLATION SQUAD, FORTIS KILL TEAM, HELLBLASTER SQUAD, INFERNUS SQUAD, INNER CIRCLE COMPANIONS, INTERCESSOR SQUAD, STERNGUARD VETERAN SQUAD, VANGUARD VETERAN SQUAD"
  ],
  [
   "[Psychic Abilities] - Veil of Time (Psychic Level 1)",
   "When this unit is selected to make an advance move, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: \n▪ On a 1, this unit is battle-shocked. \n▪ This unit can change that advance roll to a 6."
  ],
  [
   "[Psychic Abilities] - Force Dome (Psychic Level 1)",
   "In your Movement phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: \n▪ On a 1, this unit is battle-shocked. \n▪ This unit has 4+ InSv until the start of your next turn."
  ],
  [
   "Psychic Hood",
   "This unit has Feel No Pain 4+ against psychic attacks."
  ],
  [
   "Librarian (Psyker Level 1)",
   "This model has the psychic abilities listed in the Psychic Abilities section (see left)."
  ]
 ],
 "Librarian in Phobos Armour": [
  [
   "Leader",
   "This model can be attached to the following units:\nELIMINATOR SQUAD, INCURSOR SQUAD, INFILTRATOR SQUAD, REIVER SQUAD, SCOUT SQUAD, SPECTRUS KILL TEAM, WOLF SCOUTS"
  ],
  [
   "[Psychic Abilities] - Shrouding (Psychic Level 1)",
   "When an enemy unit targets this unit, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: \n▪ On a 1, this unit is battle-shocked. \n▪ Attacks that target this unit have -1 to hit rolls until the end of the phase."
  ],
  [
   "[Psychic Abilities] - Soul Sight (Psychic Level 1)",
   "In your Shooting phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: \n▪ On a 1, this unit is battle-shocked. \n▪ Select one visible enemy unit. Ranged attacks that target that enemy unit have [IGNORES COVER]."
  ],
  [
   "Psychic Hood",
   "This unit has Feel No Pain 4+ against psychic attacks."
  ],
  [
   "Librarian (Psyker Level 1)",
   "This model has the psychic abilities listed in the Psychic Abilities section (see left)."
  ]
 ],
 "Librarian in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units: \nDEATHWATCH TERMINATOR SQUAD, DEATHWING KNIGHTS, DEATHWING TERMINATOR SQUAD, RELIC TERMINATOR SQUAD, TERMINATOR ASSAULT SQUAD, TERMINATOR SQUAD, WOLF GUARD TERMINATORS"
  ],
  [
   "[Psychic Abilities] - Might of Heroes (Psychic Level 1)",
   "In the Fight phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: \n▪ On a 1, this unit is battle-shocked. \n▪ This unit's melee attacks have +2 S."
  ],
  [
   "[Psychic Abilities] - Thunderous Force (Psychic Level 1)",
   "In your Shooting phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: \n▪ On a 1, this unit is battle-shocked. \n▪ This unit's ranged attacks have +6\" R."
  ],
  [
   "Psychic Hood",
   "This unit has Feel No Pain 4+ against psychic attacks."
  ],
  [
   "Librarian (Psyker Level 1)",
   "This model has the psychic abilities listed in the Psychic Abilities section (see left)."
  ]
 ],
 "Chaplain": [
  [
   "Leader",
   "This model can be attached to the following units: \nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, CRUSADER SQUAD, DEATH COMPANY MARINES, DEATHWATCH VETERANS, DECIMUS KILL TEAM, FORTIS KILL TEAM, HELLBLASTER SQUAD, INFERNUS SQUAD, INNER CIRCLE COMPANIONS, INTERCESSOR SQUAD, STERNGUARD VETERAN SQUAD, SWORD BRETHREN SQUAD, VANGUARD VETERAN SQUAD"
  ],
  [
   "Litany of Hate",
   "This unit's melee attacks have [LANCE]"
  ],
  [
   "Spiritual Leader",
   "(Once per battle round, per unit): At the start of any phase, you can select one friendly battle-shocked ADEPTUS ASTARTES unit within 6\" of this model. That unit is no longer battle-shocked."
  ]
 ],
 "Chaplain in Terminator Armour": [
  [
   "Zealous Fortitude",
   "This unit has Feel No Pain 4+ against mortal wounds"
  ],
  [
   "Leader",
   "This model can be attached to the following units: \nDEATHWATCH TERMINATOR SQUAD, DEATHWING KNIGHTS, DEATHWING TERMINATOR SQUAD, TERMINATOR ASSAULT SQUAD, TERMINATOR SQUAD, WOLF GUARD TERMINATORS"
  ],
  [
   "Litany of Hate",
   "This unit's melee attacks have [LANCE]"
  ],
  [
   "Relic Shield",
   "Add 1 to the bearer's Wounds characteristic."
  ]
 ],
 "Chaplain on Bike": [
  [
   "Catechism of Fire",
   "In your Shooting phase, when this unit is selected to shoot, you can select one visible enemy unit. This unit's ranged attacks that target that unit have [DEVASTATING WOUNDS]."
  ],
  [
   "Leader",
   "This model can be attached to the following units: BIKE SQUAD, COMPANY VETERANS ON BIKES, OUTRIDER SQUAD, RAVENWING BLACK KNIGHTS"
  ],
  [
   "Litany of Hate",
   "This unit's melee attacks have [LANCE]"
  ]
 ],
 "Chaplain with Jump Pack": [
  [
   "Exhortation of Rage",
   "While this unit is at or below half-strength, this unit's melee attacks can re-roll wound rolls."
  ],
  [
   "Leader",
   "This model can be attached to the following units: ASSAULT INTERCESSORS WITH JUMP PACKS, ASSAULT SQUAD WITH JUMP PACKS, DEATH COMPANY MARINES WITH JUMP PACKS, TALONSTRIKE KILL TEAM, VANGUARD VETERAN SQUAD WITH JUMP PACKS"
  ],
  [
   "Litany of Hate",
   "This unit's melee attacks have [LANCE]"
  ]
 ],
 "Techmarine": [
  [
   "Techmarine",
   "While this model is within 3\" of a friendly ADEPTUS ASTARTES VEHICLE unit, this model has Lone Operative."
  ],
  [
   "Blessing of the Omnissiah",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly ADEPTUS ASTARTES VEHICLE model within 3\" of this model: \n▪ That VEHICLE model heals D3 wounds. \n▪ That VEHICLE model's attacks can ignore modifiers to hit rolls and wound rolls until the start of your next Movement phase."
  ],
  [
   "Leader",
   "This model can be attached to the following units: \nASSAULT INTERCESSOR SQUAD, CRUSADER SQUAD, DECIMUS KILL TEAM, DESOLATION SQUAD, FORTIS KILL TEAM, INTERCESSOR SQUAD, SWORD BRETHREN SQUAD"
  ]
 ],
 "Lieutenant with Combi-weapon": [
  [
   "Priority Target Identified",
   "(Once per battle, per unit): In your Command phase, you can use this ability. If you do, select one visible terrain feature. That terrain feature is identified until the end of the turn. \n\n\n▪ While an enemy unit is within an identified terrain feature, that enemy unit has +3\" detection range."
  ],
  [
   "Evade and Survive",
   "(Once per phase, per unit): In your opponent's Movement phase, when an enemy unit ends a move within 8\" of this unit, if this unit is unengaged, this unit can make a normal move of up to D3+3\"."
  ]
 ],
 "Apothecary": [
  [
   "Narthecium",
   "In your Command phase, this unit heals D3+1 wounds."
  ],
  [
   "Support",
   "This model can be attached to the following units: ASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, COMPANY HEROES, CRUSADER SQUAD, DEATHWATCH VETERANS, DECIMUS KILL TEAM, DESOLATION SQUAD, FORTIS KILL TEAM, HELLBLASTER SQUAD, INFERNUS SQUAD, INNER CIRCLE COMPANIONS, INTERCESSOR SQUAD, STERNGUARD VETERAN SQUAD, SWORD BRETHREN SQUAD"
  ]
 ],
 "Apothecary Biologis": [
  [
   "Vivispectral Analysis Targeting",
   "This unit's attacks have [LETHAL HITS: non-VEHICLE]."
  ],
  [
   "Support",
   "This model can be attached to the following units:\nAGGRESSOR SQUAD, ERADICATOR SQUAD WITH HEAVY BOLTERS, ERADICATOR SQUAD WITH MELTA RIFLES, HEAVY INTERCESSOR SQUAD, INDOMITOR KILL TEAM"
  ]
 ],
 "Ancient": [
  [
   "Honour of the Company",
   "This unit has +1 OC."
  ],
  [
   "Support",
   "This model can be attached to the following units: ASSAULT INTERCESSOR SQUAD, CRUSADER SQUAD, DEATHWATCH VETERANS, DECIMUS KILL TEAM, DESOLATION SQUAD, FORTIS KILL TEAM, HELLBLASTER SQUAD, INFERNUS SQUAD, INNER CIRCLE COMPANIONS, INTERCESSOR SQUAD, STERNGUARD VETERAN SQUAD, SWORD BRETHREN SQUAD, VANGUARD VETERAN SQUAD"
  ],
  [
   "Raise the Banner",
   "At the end of your Movement phase, if this unit is controlling an objective, that objective is secured."
  ]
 ],
 "Bladeguard Ancient": [
  [
   "Deeds of Legend",
   "While this unit is within range of an objective, this unit's melee attacks have +1 A."
  ],
  [
   "Support",
   "This model can be attached to the following unit:\n\n■ BLADEGUARD VETERAN SQUAD"
  ],
  [
   "Raise the Banner",
   "At the end of your Movement phase, if this unit is controlling an objective, that objective is secured."
  ]
 ],
 "Ancient in Terminator Armour": [
  [
   "Never Shall the Standard Fall",
   "While this unit is within range of an objective, attacks that target this unit with a S greater than this unit's T have -1 to wound rolls."
  ],
  [
   "Support",
   "This model can be attached to the following units: DEATHWATCH TERMINATOR SQUAD, DEATHWING KNIGHTS, DEATHWING TERMINATOR SQUAD, TERMINATOR ASSAULT SQUAD, TERMINATOR SQUAD, WOLF GUARD TERMINATORS"
  ],
  [
   "Raise the Banner",
   "At the end of your Movement phase, if this unit is controlling an objective, that objective is secured."
  ]
 ],
 "Judiciar": [
  [
   "Tempormortis",
   "This unit has Fights First"
  ],
  [
   "*Invulnerable Save",
   "Against melee attacks only"
  ],
  [
   "Support",
   "This model can be attached to the following units: \nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, CRUSADER SQUAD, DEATHWATCH VETERANS, DECIMUS KILL TEAM, FORTIS KILL TEAM, INFERNUS SQUAD, INNER CIRCLE COMPANIONS, INTERCESSOR SQUAD, STERNGUARD VETERAN SQUAD, SWORD BRETHREN SQUAD, VANGUARD VETERAN SQUAD"
  ]
 ],
 "Captain": [
  [
   "Leader",
   "This model can be attached to the following units: \n\nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, COMPANY HEROES, CRUSADER SQUAD, DEATHWATCH VETERANS, DECIMUS KILL TEAM, DESOLATION SQUAD, FORTIS KILL TEAM, HELLBLASTER SQUAD, INFERNUS SQUAD, INNER CIRCLE COMPANIONS, INTERCESSOR SQUAD, STERNGUARD VETERAN SQUAD, SWORD BRETHREN SQUAD, VANGUARD VETERAN SQUAD, VICTRIX HONOUR GUARD"
  ],
  [
   "Relic Shield",
   "The bearer has a Wounds characteristic of 6."
  ],
  [
   "Finest Hour",
   "(Once per battle, per unit): In the Fight phase, when this unit is selected to fight, you can use this ability. If you do, this model's melee attacks have: \n▪ +3 A \n▪ [DEVASTATING WOUNDS]."
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ]
 ],
 "Astraeus": [
  [
   "Suppression Fire",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more attacks made with its twin macro-accelerator cannon this phase. Until the start of your next turn, while this model is on the battlefield, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ]
 ],
 "Thunderhawk Gunship": [
  [
   "Aerial Assault",
   "Each time a unit with the Deep Strike ability disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Thunderhawk Cluster Bombs",
   "Each time the bearer ends a Normal move, you can select one enemy unit it moved over during that move and roll six D6: for each 3+, that unit suffers 1 mortal wound."
  ]
 ],
 "Venerable Dreadnought": [
  [
   "Wisdom of the Ancients [Aura]",
   "While a friendly Adeptus Astartes Infantry unit is within 6\" of this model, each time a model in that unit makes an attack, re-roll a Hit roll of 1."
  ]
 ],
 "Rhino Primaris": [
  [
   "Self Repair",
   "At the end of your Command phase, this model regains 1 lost wound."
  ],
  [
   "Transport",
   "This model has a transport capacity of 6 Adeptus Astartes Infantry models. It cannot transport Jump Pack, Wulfen, Phobos, Gravis, Centurion, Terminator or Tacticus models (except for Tacticus Character models that begin the battle attached to a non-Tacticus unit)."
  ],
  [
   "Orbital Comms Array [Aura]",
   "While a friendly Adeptus Astartes unit is within 6\" of the bearer, each time you target that unit with a Stratagem, roll one D6: on a 5+, you gain 1CP"
  ]
 ],
 "Land Raider Excelsior": [
  [
   "Assault Ramp",
   "Each time a unit disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Transport",
   "This model has a transport capacity of 12 Adeptus Astartes Infantry models. Each Jump Pack, Wulfen, Gravis or Terminator model takes up the space of 2 models and each Centurion model takes up the space of 3 models."
  ],
  [
   "Invulnerable Save",
   "5+"
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ]
 ],
 "Relic Razorback": [
  [
   "Fire Support",
   "In your Shooting phase, after this model has  shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ],
  [
   "Transport",
   "This model has a transport capacity of 6 Adeptus Astartes Infantry models. It cannot transport Jump Pack, Wulfen, Tacticus, Phobos, Gravis, Centurion or Terminator models."
  ]
 ],
 "Assault Intercessors with Jump Packs": [
  [
   "Hammer of Wrath",
   "When this unit ends a charge move, you can select one enemy unit engaged with this unit. For each model in this unit engaged with that enemy unit, roll one D6: On a 4+, that enemy unit suffers 1 mortal wound."
  ]
 ],
 "Company Heroes": [
  [
   "Command Squad",
   "Attacks that target this unit have -1 to wound rolls"
  ],
  [
   "Raise the Banner",
   "At the end of your Movement phase, if this unit is controlling an objective, that objective is secured."
  ]
 ],
 "Eradicator Squad with Heavy Bolters": [
  [
   "Overlapping Detonations",
   "In your Shooting phase, when this unit is selected to shoot you can select one enemy unit visible to it. This unit’s heavy bolters that targeted that selected unit have [BLAST 1]."
  ]
 ],
 "Land Speeder": [
  [
   "Purgation Run",
   "In your Shooting phase, when this unit has shot, you can use this ability. If you do:\n▪ This unit can make a normal move of up to D6\".\n▪ This unit is not eligible to declare a charge until the end of the turn."
  ]
 ],
 "Invader ATVs": [
  [
   "Aggressive Reconnaissance",
   "In your Shooting phase, this unit's ranged attacks that target an enemy unit that is not within 6\" of any other enemy units have +1 to wound rolls."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Angelic Inheritors",3,"","Legacy of the Angel","Friendly Blood Angels Character units: ▪ Can re-roll hit rolls of 1. ▪ Can re-roll wound rolls of 1. Restrictions: Your army can include Blood Angels units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.","",0,"","Priority Assets"],
  ["Assault Brethren",1,"Doctrines","Assault Mastery","You can select the assault doctrine one additional time per battle.","",0,"","Take and Hold"],
  ["Deathwatch Support",1,"","Mission Tactics","Friendly KILL TEAM units with this ability have the following abilities: Furor Tactics When the enemy horde grows close, the Deathwatch will be tasked with the decimation of their core. Aiming not for clinical kills but for maximum destruction over a wide area, they tear the heart from the enemy army. If the devastator doctrine is active for your unit, your unit’s attacks have [SUSTAINED HITS 1]. Malleus Tactics When the giants of war lumber forth, the Deathwatch will adopt Malleus tactics. Even the largest behemoth has a weak point, and the archives of the Deathwatch number them all. If the tactical doctrine is active for your unit, your unit’s attacks have [LETHAL HITS]. Purgatus Tactics By adopting Purgatus tactics, the Deathwatch focus their deadly ire upon the commanders of the enemy host, assassinating them one after another with pitiless head shots and killing thrusts of the blade. If the assault doctrine is active for your unit, your unit’s attacks that target an enemy unit within 9\" of this unit have [PRECISION]. DEATHWATCH ALLIES You can include Deathwatch units in your army, even though they do not have the same Chapter faction keyword as other units in your army. The combined points value of such units cannot exceed 500 points. When mustering your army, unless otherwise stated, you cannot select a DEATHWATCH model to be your WARLORD. In addition KILL TEAM units can only contain enhancements taken from this detachment. This an exception to the Space Marine Chapters Army Rules.","",0,"","Disruption"],
  ["Devastator Brethren",1,"Doctrines","Devastator Mastery","You can select the devastator doctrine one additional time per battle.","",0,"","Purge the Foe"],
  ["Encarmine Speartip",1,"","Wrath of Angels","The tactical doctrine is active for Sanguinary Guard units in addition to any other combat doctrine. Restrictions: Your army can include Blood Angels units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.","",0,"","Disruption"],
  ["Gauntlet Task Force",1,"","Combined Deployment","In your Shooting phase, when a friendly Adeptus Astartes Transport unit has shot, you can select one enemy unit hit by those attacks. That enemy unit is assailed until the end of the turn: ▪ While a unit is assailed, when an ADEPTUS ASTARTES unit that disembarked this turn targets that unit, those attacks have [Sustained Hits 1].","",0,"","Reconnaissance"],
  ["Gladius Task Force",3,"","Codex Discipline","You can select one combat doctrine one additional time per battle.","",0,"","Take and Hold"],
  ["Gravis Linebreaker Force",1,"Gravis","Walking Fortress","In a turn a friendly Gravis unit made a normal move, that unit’s ranged attacks: ▪ Do not have [Heavy]. ▪ Have +1 to hit rolls.","",0,"","Take and Hold"],
  ["Gravis Siege Force",1,"Gravis","Indomitable Defence","While a friendly Gravis unit is within range of an objective, attacks that target that unit with a S greater than that unit’s T have -1 to wound rolls.","",0,"","Take and Hold"],
  ["Ironclad Champions",1,"","Enduring Vengeance","Friendly Adeptus Astartes Dreadnought units can re-roll hit rolls of 1.","",0,"","Priority Assets"],
  ["Ironstorm Spearhead",1,"Ironstorm","Ironstorm Auto-targeters","Friendly Adeptus Astartes Vehicle units’ (excluding walker units) ranged attacks can: ▪ Re-roll one hit roll. ▪ Re-roll one wound roll.","",0,"","Purge the Foe"],
  ["Phobos Shadow Force",1,"Phobos","Shadow Masters","When a friendly Phobos or Scout SQUAD unit has shot: ▪ Those attacks do not prevent that unit from being hidden. ▪ Or: That unit can make a normal move of up to D6\". That unit is not eligible to declare a charge until the end of the turn.","",0,"","Disruption"],
  ["Phobos Shock Force",1,"Phobos","Vanguard Ambushers","At the end of your Movement phase, if a friendly Phobos unit is hidden, that unit’s attacks can re-roll wound rolls of 1 until the end of the turn.","",0,"","Disruption"],
  ["Stormlance Task Force",1,"","Lightning-fast Strike","Friendly Adeptus Astartes Mounted/Speeder units have +2\" M.","",0,"","Reconnaissance"],
  ["Tactical Brethren",1,"Doctrines","Tactical Mastery","You can select the tactical doctrine one additional time per battle.","",0,"","Priority Assets"],
  ["Tacticus Attack Force",1,"Tacticus","Wrath of the Chapter","Friendly Tacticus units can re-roll advance rolls.","",0,"","Take and Hold"],
  ["Tacticus Firestorm Force",1,"Tacticus","Codex Fire-patterns","Friendly Tacticus units’ [Rapid Fire] attacks benefit from [Rapid Fire] when targeting units up to that attack’s maximum range.","",0,"","Priority Assets"],
  ["Terminator Storm Force",1,"Terminator","Death Blow","Friendly Adeptus Astartes Terminator units have +1 to charge rolls.","",0,"","Priority Assets"],
  ["Wrath of the Doomed",1,"","Sanguinius' Fury","Friendly DEATH COMPANY units have the following: ▪ At the start of each phase, the assault doctrine is active for this unit. ▪ The devastator/tactical doctrine cannot be active for this unit. This means that, regardless of any other rules, DEATH COMPANY units can never have an active doctrine other than the assault doctrine. Restrictions: Your army can include Blood Angels units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.","",0,"","Purge the Foe"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Blazing Icon",20,"Angelic Inheritors","Adeptus Astartes model only. Enemy units cannot target this unit with snap shooting attacks.",null],
  ["Ordained Sacrifice",25,"Angelic Inheritors","Adeptus Astartes model only. (Once per battle, per army) At the end of a phase in which this model is destroyed, roll one D6:\n\n\n▪ On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed, unengaged, with 3 wounds remaining.",null],
  ["Prescient Flash",25,"Angelic Inheritors","Adeptus Astartes model only. This unit has Scouts 6”.",null],
  ["Unto Death",15,"Angelic Inheritors","Adeptus Astartes model only. (Once per battle, per army) In your Command phase you can use this ability. If you do, until the end of the turn this unit can:\n\n▪ Re-roll advance rolls.\n▪ Re-roll charge rolls.",null],
  ["Furious Assault (Upgrade)",10,"Assault Brethren","Adeptus Astartes Infantry unit only. This unit’s melee attacks have [Sustained Hits 1: non-Monster/Vehicle].",null],
  ["Imperium’s Sword",20,"Assault Brethren","ADEPTUS ASTARTES model only. This model has the following weapon:",null],
  ["Beacon Angelis",25,"Deathwatch Support","ADEPTUS ASTARTES model only. If this unit is a Kill Team unit, this unit has:\n\n▪ Deep Strike.\n▪ When you target this unit with the Rapid Ingress Stratagem, that use is -1CP.",null],
  ["Honour of Vigilance",20,"Devastator Brethren","Adeptus Astartes model only. \n▪ This unit's ranged attacks have [Lethal Hits]\n▪ If the devastator doctrine is active for this unit, this unit can re-roll advance rolls.",null],
  ["Master-forged Firearms",15,"Devastator Brethren","Adeptus Astartes Infantry/Mounted model only. This model's ranged attacks (excluding [Psychic] attacks) have +1A, S, AP and D.",null],
  ["Angelic Executioner",20,"Encarmine Speartip","Adeptus Astartes Jump Pack model only. When this unit is selected to fight, this unit's melee attacks have:\n\n\n▪ [LETHAL HITS].\n▪ Or: [SUSTAINED HITS 1].",null],
  ["Shadow of Abomination",15,"Encarmine Speartip","Adeptus Astartes Jump Pack model only. (once per battle, per army) When this unit is selected to fight you can use this ability. If you do, this model's melee attacks have +1 D.",null],
  ["Damocles-class Uplink",15,"Gauntlet Task Force","Captain model only. In your Movement phase, if this unit is embarked within a Transport unit, you can select one friendly Adeptus Astartes Infantry unit within 6\" of that Transport unit and select one combat doctrine. That combat doctrine is active for that Infantry unit.",null],
  ["Linebreaker Onslaught",20,"Gauntlet Task Force","Adeptus Astartes Infantry model only. If this unit disembarked this turn:\n▪ This unit can re-roll charge rolls\n▪ Enemy units cannot target this unit with snap shooting attacks.",null],
  ["Adept of the Codex",20,"Gladius Task Force","Captain model only. The tactical doctrine is active for this unit in addition to any other combat doctrine",null],
  ["Artificer Armour",15,"Gladius Task Force","Adeptus Astartes model only. This model has:\n▪ 2+ Sv\n▪  Feel No Pain 5+",null],
  ["Laurels of Triumph",20,"Gladius Task Force","Adeptus Astartes model only. This model's melee attacks have:\n▪ +1S and AP\n▪ Or: if the assault doctrine is active for this unit, +2S and AP",null],
  ["Standard of the Emperor Ascendant",25,"Gladius Task Force","Ancient Model only. This model has:\n▪ +1OC and Ld\n▪ Feel No Pain 5+\n▪ The following ability:\nAncient Exhortation (Once per battle, per army). When this unit is selected to fight, you can use this ability. If you do, this unit's melee attacks have +1A until the end of the phase.",null],
  ["Indefatigable Fortitude",20,"Gravis Linebreaker Force","Gravis model only. Attacks that target this unit with a S greater than this unit's T have -1 to wound rolls.",null],
  ["Relentless Advance",20,"Gravis Linebreaker Force","Gravis model only. This unit has Scouts 5\"",null],
  ["Immovable Conquerors (Upgrade)",15,"Gravis Siege Force","Gravis unit only. This unit has +1 OC.",null],
  ["Narthecis Gauntlet",20,"Gravis Siege Force","Apothecary Biologis model only. In your Command phase, this unit heals D3+1 wounds.",null],
  ["Artificer Sarcophagus (Upgrade)",40,"Ironclad Champions","Dreadnought unit only. Attacks that target this unit have -1 D.",null],
  ["Venerable Champion (Aura) (Upgrade)",30,"Ironclad Champions","Dreadnought unit only. While a friendly Adeptus Astartes Infantry/Mounted unit is within 6\" of this unit, that unit’s attacks can re-roll hit rolls of 1.",null],
  ["Gunnery Honours (Upgrade)",15,"Ironstorm Spearhead","Adeptus Astartes Vehicle unit only (excluding Dedicated Transport/Fly/Walker units). This unit’s ranged attacks have [Heavy].",null],
  ["Redoubtable Machine Spirit (Upgrade)",25,"Ironstorm Spearhead","Adeptus Astartes Vehicle unit only (excluding Dedicated Transport/Fly/Walker units). This unit: ▪ Has 5+ InSv. ▪ At the end of your Command phase, heals 1 wound.",null],
  ["Execute and Redeploy",25,"Phobos Shadow Force","Phobos model only. In your shooting phase, after this unit has shot, if this unit is unengaged, this unit can make a normal move of up to 6\". If it does, this unit is not eligible to declare a charge until the end of the turn.",null],
  ["Venator Omni-auspex",15,"Phobos Shadow Force","Phobos model only. This unit's attacks that target a hidden units can:\n▪ Re-roll wound rolls of 1\n▪ Or: If the assault  doctrine is active for this unit, re-roll wound rolls of 1 and 2",null],
  ["Seal of Shrouding",15,"Phobos Shock Force","Phobos model only. Enemy units cannot target this unit with snap shooting attacks.",null],
  ["Venator Omni-auspex",15,"Phobos Shock Force","Phobos model only. This unit's attacks that target a hidden units can:\n▪ Re-roll wound rolls of 1\n▪ Or: If the assault  doctrine is active for this unit, re-roll wound rolls of 1 and 2",null],
  ["Auspex Triangulation Shrines (Upgrade)",10,"Stormlance Task Force","Adeptus Astartes speeder unit only. At the start of your Shooting phase, select one visible enemy unit within 12\" of this unit. That enemy unit is spotted: ▪ While a unit is spotted, that unit has +3\" detection range.",null],
  ["Supercharged Engines (Upgrade)",10,"Stormlance Task Force","Adeptus Astartes Mounted unit only. This unit can re-roll advance rolls.",null],
  ["Laurels of Vigilance",10,"Tactical Brethren","Adeptus Astartes model only. (Once per battle round per army) When you use the Fire Overwatch/Heroic Intervention stratagem, if you target a friendly Adeptus Astartes Battleline unit within 12\" of this model with that stratagem, that use is -1CP",null],
  ["Tactical Insight",15,"Tactical Brethren","Captain model only. The tactical doctrine is active for this unit in addition to any other combat doctrine",null],
  ["Martial Paragon",10,"Tacticus Attack Force","Tacticus model only. This unit's attacks can:\n▪ Re-roll one hit roll\n▪ Re-roll one wound roll.",null],
  ["Spearpoint War Leader",15,"Tacticus Attack Force","Tacticus model only. This unit has Scouts 6\"",null],
  ["Cyber-familiar",15,"Tacticus Firestorm Force","Tacticus model only. When both players have deployed their armies, you can redeploy up to three friendly Adeptus Astartes units. When doing so, you can set those units up in strategic reserves, regardless of how many units are already in strategic reserves.",null],
  ["Tempered in Battle (Aura)",10,"Tacticus Firestorm Force","Adeptus Astartes model only. Friendly Adeptus Astartes units within 6” of this model can re-roll leadership rolls.",null],
  ["Champion of the First Company",20,"Terminator Storm Force","Adeptus Astartes Terminator model only. This unit's melee attacks have [Lethal Hits]",null],
  ["Corporeum Reliquary",25,"Terminator Storm Force","Adeptus Astartes Terminator model only. In your first Movement phase, this unit can make an ingress move.",null],
  ["Instinctive Interception",10,"Wrath of the Doomed","Death Company model only. When you target this unit with the Heroic Intervention stratagem, that use is -1 CP.",null],
  ["On the Archtraitor's Bridge",20,"Wrath of the Doomed","Death Company model only. This model's melee attacks have +2 A.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Focused Fury","Angelic Inheritors","",1,"Fight phase, when a friendly ADEPTUS ASTARTES unit is selected to fight.","That ADEPTUS ASTARTES unit.","Your unit’s melee attacks: ▪ Have [LETHAL HITS]. ▪ Or: If your unit is a Character unit, have [LETHAL HITS], [LANCE].",""],
  ["In the Shadow of Great Wings","Angelic Inheritors","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly Adeptus Astartes Character unit.","That ADEPTUS ASTARTES CHARACTER unit.","Your unit has: ▪ Stealth. ▪ -3\" detection range.",""],
  ["Instant of Grace","Angelic Inheritors","",1,"Your Command phase.","One friendly Adeptus Astartes Infantry unit.","Your unit has CHARACTER until the start of your next Command phase.",""],
  ["Measured Strategist","Angelic Inheritors","",1,"Your Command phase.","One friendly Adeptus Astartes Character unit.","Select one combat doctrine. That combat doctrine is active for your unit until the start of your next Command phase.",""],
  ["Strike Now for Glory","Angelic Inheritors","",1,"Your Shooting phase when a friendly Adeptus Astartes unit is selected to attack.","That ADEPTUS ASTARTES unit.","Your unit’s ranged attacks have [SUSTAINED HITS 1].",""],
  ["Unto the Burning Skies","Angelic Inheritors","",1,"End of your opponent’s Fight phase.","One friendly The Sanguinor/unengaged Adeptus Astartes Jump Pack unit.","Place your unit in strategic reserves.",""],
  ["Armour of Contempt","Assault Brethren","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Duty in Death","Assault Brethren","",1,"Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +1 to that roll if the assault doctrine is active for your unit: ▪ On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Gene-Wrought Might","Assault Brethren","",1,"Fight phase, when a friendly ADEPTUS ASTARTES unit is selected to fight.","That ADEPTUS ASTARTES unit.","Your unit’s melee attacks have: ▪ [Lance]. ▪ Or: If the assault doctrine is active for your unit, [Lance] and +1 AP.",""],
  ["Blackstar Extraction","Deathwatch Support","",1,"End of your opponent’s Fight phase.","One friendly unengaged KILL TEAM unit.","Place your unit in strategic reserves.",""],
  ["Dragonfire Rounds","Deathwatch Support","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks: ▪ Can re-roll wound rolls of 1. ▪ Have [IGNORES COVER].",""],
  ["Hellfire Rounds","Deathwatch Support","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks (excluding [DEVASTATING WOUNDS] attacks) have [ANTI-non-VEHICLE 4+].",""],
  ["Kraken Rounds","Deathwatch Support","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks have: ▪ Have +6\" R. ▪ Have +1 S.",""],
  ["Armour of Contempt","Devastator Brethren","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Hail of Vengeance","Devastator Brethren","",2,"Your opponent’s Shooting phase, when an enemy unit has shot, if those attacks destroyed a model in a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Your unit shoots using normal shooting, but while doing so your unit can only target that enemy unit.",""],
  ["Storm of Fire","Devastator Brethren","",1,"Your Shooting phase, when a friendly ADEPTUS ASTARTES unit is selected to shoot.","That ADEPTUS ASTARTES unit.","Your unit’s ranged attacks have: ▪ [Ignores Cover]. ▪ Or: If the devastator doctrine is active for your unit, [Ignores Cover] and +1 AP.",""],
  ["Blinding Blurs of Vengeance","Encarmine Speartip","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly Sanguinary Guard unit.","That SANGUINARY GUARD unit.","Your unit has: ▪ Stealth. ▪ -3\" detection range.",""],
  ["Inexorable Valour","Encarmine Speartip","",1,"Your opponent’s Movement phase, when an enemy unit that was engaged with a friendly Sanguinary Guard unit ends a fall-back move, if that SANGUINARY GUARD unit is unengaged.","That SANGUINARY GUARD unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Judgement of the Golden Host","Encarmine Speartip","",1,"Your Charge phase, when a friendly Sanguinary Guard unit form your army ends a charge move.","That SANGUINARY GUARD unit.","Select one enemy unit engaged with your unit. Roll one D6 for each model in your unit engaged with that enemy unit: ▪ For each 3+, that enemy unit suffers 1 mortal wound.",""],
  ["Aggressive Disembarkation","Gauntlet Task Force","",1,"Any phase, when a friendly ADEPTUS ASTARTES unit embarked within a Transport is selected to move.","That ADEPTUS ASTARTES unit.","While making that move, each model in your unit can be set up within the set-up distance of that TRANSPORT. This allows you to set up your unit within the set-up distance of your TRANSPORT, instead of wholly within that distance.",""],
  ["Duty Is Never Done","Gauntlet Task Force","",1,"End of the Fight phase.","One friendly unengaged Adeptus Astartes Infantry unit that was eligible to fight this phase, is wholly within 6\" of a friendly Transport unit, and is eligible to embark within that TRANSPORT unit.","Your unit embarks within that TRANSPORT unit.",""],
  ["Storm and Secure","Gauntlet Task Force","",1,"End of your Movement phase.","One friendly Adeptus Astartes Transport unit that has an Adeptus Astartes Battleline unit embarked within it.","Select one objective your unit is controlling. That objective is secured.",""],
  ["A Worthy Death","Gladius Task Force","",1,"Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6: ▪ On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Adaptive Strategy","Gladius Task Force","",1,"Your Command phase.","One friendly ADEPTUS ASTARTES unit.","Select one combat doctrine. That combat doctrine is active for your unit until the start of your next Command phase.",""],
  ["Armour of Contempt","Gladius Task Force","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Might of Angels","Gladius Task Force","",1,"Fight phase, when a friendly ADEPTUS ASTARTES unit is selected to fight.","That ADEPTUS ASTARTES unit.","Your unit’s melee attacks have [Lance].",""],
  ["Responsive Tactics","Gladius Task Force","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged Adeptus Astartes Infantry/Mounted unit.","That ADEPTUS ASTARTES INFANTRY/MOUNTED unit.","Your unit can make a normal move of up to D6\".",""],
  ["Storm of Devastation","Gladius Task Force","",1,"Your Shooting phase, when a friendly ADEPTUS ASTARTES unit is selected to shoot.","That ADEPTUS ASTARTES unit.","Your unit’s ranged attacks have [IGNORES COVER].",""],
  ["Annihilating Force","Gravis Linebreaker Force","",1,"Your Shooting phase or the Fight phase, when a friendly Gravis unit is selected to attack.","That GRAVIS unit.","Your unit’s attacks have [Lethal Hits].",""],
  ["Armoured Impact","Gravis Linebreaker Force","",1,"Your Charge phase, when a friendly Gravis unit ends a charge move.","That GRAVIS unit.","When your unit ends a charge move, you can select one enemy unit engaged with your unit. If you do, roll one D6 for each model in your unit engaged with that enemy unit: ▪ For each 3+, that enemy unit suffers 1 mortal wound.",""],
  ["Purgation Push","Gravis Linebreaker Force","",1,"Your Shooting phase, when a friendly Gravis unit has shot.","That GRAVIS unit.","▪ If your unit is unengaged, your unit can make a normal move of up to 5\", and must end that move within range of an objective. ▪ Your unit is not eligible to declare a charge or embark within a Transport until the end of the turn.",""],
  ["Annihilating Force","Gravis Siege Force","",1,"Your Shooting phase or the Fight phase, when a friendly Gravis unit is selected to attack.","That GRAVIS unit.","Your unit’s attacks have [Lethal Hits].",""],
  ["Stand Unyielding","Gravis Siege Force","",1,"End of your Movement phase.","One friendly Gravis unit.","Select one objective your unit is controlling. That objective is secured.",""],
  ["Suppression Volleys","Gravis Siege Force","",1,"Your Shooting phase, when a friendly Gravis unit has shot.","That GRAVIS unit.","Select one enemy unit hit by those attacks. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll.",""],
  ["Adamantine Terror","Ironclad Champions","",1,"Start of the Fight phase.","One friendly Dreadnought unit.","Each enemy unit engaged with your unit makes a battle-shock roll, with -1 to that battle-shock roll.",""],
  ["Mercy Is Weakness","Ironclad Champions","",1,"Your Shooting phase or the Fight phase, when a friendly Dreadnought unit is selected to attack.","That DREADNOUGHT unit.","Your unit’s attacks have: ▪ [lethal hits]. ▪ Or: [Sustained Hits 1].",""],
  ["Upstoppable Advance","Ironclad Champions","",1,"Your Movement/Charge phase, when a friendly Dreadnought unit is selected to move or declares a charge.","That DREADNOUGHT unit.","Your unit has Mobile.",""],
  ["Headhunter Doctrine","Ironstorm Spearhead","",1,"Your Shooting phase, when a friendly Adeptus Astartes Vehicle unit (excluding Dedicated Transport/Fly/Walker units) is selected to shoot.","That ADEPTUS ASTARTES VEHICLE unit.","Your unit’s ranged attacks have [Lethal Hits: Monster/Vehicle].",""],
  ["Layered Ceramite","Ironstorm Spearhead","",1,"Any phase, when a friendly Adeptus Astartes Vehicle unit suffers a mortal wound.","That ADEPTUS ASTARTES VEHICLE unit.","Your unit has Feel No Pain 5+ against mortal wounds.",""],
  ["Might of the Machine Spirit","Ironstorm Spearhead","",1,"Your Command phase.","One friendly Adeptus Astartes Vehicle unit (excluding Dedicated Transport/Fly/Walker units).","Until the start of your next Command phase, your unit can ignore modifiers to your unit’s: ▪ M. ▪ BS. ▪ Hit rolls and wound rolls.",""],
  ["Mortis Snares","Phobos Shadow Force","",1,"End of your Movement phase.","One friendly unengaged Phobos/Scout Squad unit.","If your unit is controlling an objective, that objective is snared. While an objective is snared, when an enemy unit ends a move within range of that objective, roll one D6: ▪ On a 2+, that enemy unit suffers D6 mortal wounds. ▪ That objective is no longer snared.",""],
  ["Strike from the Shadows","Phobos Shadow Force","",1,"Your Shooting phase or the Fight phase, when a friendly hidden Phobos unit is selected to attack.","That PHOBOS unit.","Your unit’s attacks have: ▪ +1 S. ▪ [Lethal Hits].",""],
  ["Tactical Withdrawal","Phobos Shadow Force","",1,"End of your opponent’s Fight phase.","One friendly unengaged Phobos/Scout SQUAD unit.","Place your unit in strategic reserves.",""],
  ["Strike from the Shadows","Phobos Shock Force","",1,"Your Shooting phase or the Fight phase, when a friendly hidden Phobos unit is selected to attack.","That PHOBOS unit.","Your unit’s attacks have: ▪ +1 S. ▪ [Lethal Hits].",""],
  ["Transhuman Reactions","Phobos Shock Force","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged Phobos unit.","That PHOBOS unit.","Your unit can make a normal move of: ▪ Up to D6\". ▪ Or: If the tactical doctrine is active for your unit, up to 6\".",""],
  ["Umbral Evasion","Phobos Shock Force","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly Phobos unit.","That PHOBOS unit.","Ranged attacks that target your unit have -1 to hit rolls.",""],
  ["Hurtling Targets","Stormlance Task Force","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly Adeptus Astartes Mounted/Speeder unit.","That ADEPTUS ASTARTES MOUNTED/SPEEDER unit.","Ranged attacks that target your unit have -1 to hit rolls.",""],
  ["Sudden Onslaught","Stormlance Task Force","",1,"Your Movement phase, when a friendly Adeptus Astartes Mounted/Speeder unit is selected to make an advance move.","That ADEPTUS ASTARTES MOUNTED/SPEEDER unit.","Your unit can change its advance rolls to a 6.",""],
  ["Wind-Swift Evasion","Stormlance Task Force","",1,"End of the Fight phase.","One friendly Adeptus Astartes Mounted unit that was eligible to fight this phase.","▪ If your unit is unengaged, your unit can make a normal move. ▪ Or: If your unit is engaged, your unit can make a fall-back move.",""],
  ["Armour of Contempt","Tactical Brethren","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Domination Fire","Tactical Brethren","",1,"Your Shooting phase, when a friendly ADEPTUS ASTARTES unit has shot.","That ADEPTUS ASTARTES unit.","Select one enemy unit hit by those attacks. That enemy unit is suppressed until the start of your next turn: ▪ While a unit is suppressed, that unit’s attacks have -1 to hit rolls.",""],
  ["Masterful Tactics","Tactical Brethren","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged Adeptus Astartes Infantry/Mounted unit.","That ADEPTUS ASTARTES INFANTRY/MOUNTED unit.","Your unit can make a normal move of: ▪ Up to D6\". ▪ Or: If the tactical doctrine is active for your unit, up to 6\".",""],
  ["Relentless Assault","Tacticus Attack Force","",1,"Your Shooting phase or the Fight phase, when a friendly Tacticus unit is selected to attack.","That TACTICUS unit.","Your unit’s attacks have: ▪ [Sustained Hits 1: non-Monster/Vehicle]. ▪ Or: [Lethal Hits: Monster/Vehicle].",""],
  ["Tactical Focus","Tacticus Attack Force","",1,"Fight phase, when a friendly Tacticus unit is selected to make a consolidation move.","That TACTICUS unit.","When making that consolidation move, your unit can move up to D3+3\".",""],
  ["Transhuman Swiftness","Tacticus Attack Force","",1,"Fight phase, when an enemy unit has fought.","One friendly Tacticus unit that is within range of an objective and is eligible to fight.","Your unit has Fights First and must be the next unit you select to fight.",""],
  ["For the Emperor!","Tacticus Firestorm Force","",1,"Command phase.","One friendly Tacticus unit that is within range of an objective.","Your unit has +1 OC until the end of the turn.",""],
  ["Point-Blank Brutality","Tacticus Firestorm Force","",1,"Your Shooting phase, when a friendly engaged Tacticus unit is selected to shoot.","That TACTICUS unit.","Your unit’s ranged attacks (excluding [Blast] attacks) have: ▪ [Close-Quarters]. ▪ [Ignores Cover].",""],
  ["Relentless Assault","Tacticus Firestorm Force","",1,"Your Shooting phase or the Fight phase, when a friendly Tacticus unit is selected to attack.","That TACTICUS unit.","Your unit’s attacks have: ▪ [Sustained Hits 1: non-Monster/Vehicle]. ▪ Or: [Lethal Hits: Monster/Vehicle].",""],
  ["Gunship Extraction","Terminator Storm Force","",1,"End of your opponent’s Fight phase.","One friendly unengaged adeptus astartes terminator unit.","Place your unit in strategic reserves.",""],
  ["Merciless Veterans","Terminator Storm Force","",1,"Your Shooting phase, when a friendly adeptus astartes Terminator unit is selected to shoot.","That ADEPTUS ASTARTES TERMINATOR unit.","Your unit’s ranged attacks have: ▪ [Lethal Hits]. ▪ [Sustained Hits 1].",""],
  ["Tactical Dreadnought Fortitude","Terminator Storm Force","",2,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly adeptus astartes Terminator unit.","That ADEPTUS ASTARTES TERMINATOR unit.","Attacks that target your unit have -1 D until that enemy unit has attacked.",""],
  ["Death Begets Vengeance","Wrath of the Doomed","",1,"Any phase, when a friendly Death Company unit is destroyed by an enemy unit.","That enemy unit.","That enemy unit is hated until the end of the battle: ▪ While a unit is hated, friendly DEATH COMPANY units’ attacks that target that unit have +1 to wound rolls.",""],
  ["No Barrier to Retribution","Wrath of the Doomed","",1,"Your Movement or your Charge phase, when a friendly Death Company Dreadnought unit is selected to make a normal/advance/charge move.","That DEATH COMPANY DREADNOUGHT unit.","Your unit has Mobile.",""],
  ["Rage-Fuelled Response","Wrath of the Doomed","",1,"Your opponent’s Shooting phase, when an enemy unit that targeted a friendly unengaged Death Company unit has shot.","That DEATH COMPANY unit.","Your unit can make a surge move of up to D6\".",""],
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
  "Astraeus",
  "Baal Predator",
  "Ballistus Dreadnought",
  "Brutalis Dreadnought",
  "Death Company Dreadnought",
  "Death Company Dreadnought with Magna-Grapple",
  "Dreadnought",
  "Drop Pod",
  "Firestrike Servo-Turrets",
  "Furioso Dreadnought",
  "Gladiator Lancer",
  "Gladiator Reaper",
  "Gladiator Valiant",
  "Impulsor",
  "Invictor Tactical Warsuit",
  "Land Raider",
  "Land Raider Crusader",
  "Land Raider Excelsior",
  "Land Raider Redeemer",
  "Land Speeder",
  "Librarian Dreadnought",
  "Predator Annihilator",
  "Predator Destructor",
  "Razorback",
  "Redemptor Dreadnought",
  "Relic Razorback",
  "Repulsor",
  "Repulsor Executioner",
  "Rhino",
  "Rhino Primaris",
  "Storm Speeder Hailstrike",
  "Storm Speeder Hammerstrike",
  "Storm Speeder Thunderstrike",
  "Stormhawk Interceptor",
  "Stormraven Gunship",
  "Stormtalon Gunship",
  "Thunderhawk Gunship",
  "Venerable Dreadnought",
  "Vindicator",
  "Whirlwind"
 ],
 "monster": [],
 "battleline": [
  "Assault Intercessor Squad",
  "Heavy Intercessor Squad",
  "Intercessor Squad"
 ],
 "epic": [
  "Astorath",
  "Brother Corbulo",
  "Captain Tycho",
  "Chief Librarian Mephiston",
  "Commander Dante",
  "Gabriel Seth",
  "Lemartes",
  "The Sanguinor",
  "Tycho the Lost"
 ],
 "infantry": [
  "Aggressor Squad",
  "Assault Intercessors with Jump Packs",
  "Bladeguard Veteran Squad",
  "Centurion Assault Squad",
  "Centurion Devastator Squad",
  "Death Company Marines",
  "Death Company Marines with Boltguns",
  "Death Company Marines with Boltguns and Jump Packs",
  "Death Company Marines with Jump Packs",
  "Desolation Squad",
  "Eliminator Squad",
  "Eradicator Squad with Heavy Bolters",
  "Eradicator Squad with Melta Rifles",
  "Hellblaster Squad",
  "Inceptor Squad",
  "Incursor Squad",
  "Infernus Squad",
  "Infiltrator Squad",
  "Reiver Squad",
  "Sanguinary Guard",
  "Scout Squad",
  "Sternguard Veteran Squad",
  "Terminator Assault Squad",
  "Terminator Squad",
  "Vanguard Veteran Squad",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "character": [
  "Ancient",
  "Ancient in Terminator Armour",
  "Apothecary",
  "Apothecary Biologis",
  "Bladeguard Ancient",
  "Blood Angels Captain",
  "Captain",
  "Captain in Gravis Armour",
  "Captain in Phobos Armour",
  "Captain in Terminator Armour",
  "Captain on Bike",
  "Captain with Jump Pack",
  "Chaplain",
  "Chaplain in Terminator Armour",
  "Chaplain on Bike",
  "Chaplain with Jump Pack",
  "Company Heroes",
  "Death Company Captain",
  "Death Company Captain with Jump Pack",
  "Judiciar",
  "Librarian",
  "Librarian in Phobos Armour",
  "Librarian in Terminator Armour",
  "Lieutenant",
  "Lieutenant in Phobos Armour",
  "Lieutenant with Combi-weapon",
  "Sanguinary Priest",
  "Sanguinary Priest with Jump Pack",
  "Techmarine"
 ],
 "gravis": [
  "Aggressor Squad",
  "Apothecary Biologis",
  "Captain in Gravis Armour",
  "Eradicator Squad with Heavy Bolters",
  "Eradicator Squad with Melta Rifles",
  "Heavy Intercessor Squad",
  "Inceptor Squad"
 ],
 "tacticus": [
  "Ancient",
  "Apothecary",
  "Assault Intercessor Squad",
  "Assault Intercessors with Jump Packs",
  "Bladeguard Ancient",
  "Bladeguard Veteran Squad",
  "Blood Angels Captain",
  "Captain",
  "Captain with Jump Pack",
  "Chaplain",
  "Chaplain with Jump Pack",
  "Chief Librarian Mephiston",
  "Commander Dante",
  "Company Heroes",
  "Death Company Captain",
  "Death Company Captain with Jump Pack",
  "Death Company Marines",
  "Death Company Marines with Jump Packs",
  "Desolation Squad",
  "Hellblaster Squad",
  "Infernus Squad",
  "Intercessor Squad",
  "Judiciar",
  "Librarian",
  "Lieutenant",
  "Sanguinary Guard",
  "Sanguinary Priest",
  "Sternguard Veteran Squad",
  "Techmarine",
  "The Sanguinor",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "terminator": [
  "Ancient in Terminator Armour",
  "Captain in Terminator Armour",
  "Chaplain in Terminator Armour",
  "Librarian in Terminator Armour",
  "Terminator Assault Squad",
  "Terminator Squad"
 ],
 "phobos": [
  "Captain in Phobos Armour",
  "Eliminator Squad",
  "Incursor Squad",
  "Infiltrator Squad",
  "Invictor Tactical Warsuit",
  "Librarian in Phobos Armour",
  "Lieutenant in Phobos Armour",
  "Lieutenant with Combi-weapon",
  "Reiver Squad"
 ],
 "dreadnought": [
  "Ballistus Dreadnought",
  "Brutalis Dreadnought",
  "Death Company Dreadnought",
  "Death Company Dreadnought with Magna-Grapple",
  "Dreadnought",
  "Furioso Dreadnought",
  "Librarian Dreadnought",
  "Redemptor Dreadnought",
  "Venerable Dreadnought"
 ],
 "mounted": [
  "Captain on Bike",
  "Chaplain on Bike",
  "Invader ATVs",
  "Outrider Squad",
  "Scout Bike Squad"
 ],
 "walker": [
  "Ballistus Dreadnought",
  "Brutalis Dreadnought",
  "Death Company Dreadnought",
  "Death Company Dreadnought with Magna-Grapple",
  "Dreadnought",
  "Furioso Dreadnought",
  "Invictor Tactical Warsuit",
  "Librarian Dreadnought",
  "Redemptor Dreadnought",
  "Venerable Dreadnought"
 ],
 "fly": [
  "Assault Intercessors with Jump Packs",
  "Astorath",
  "Captain with Jump Pack",
  "Chaplain with Jump Pack",
  "Commander Dante",
  "Death Company Captain with Jump Pack",
  "Death Company Marines with Jump Packs",
  "Inceptor Squad",
  "Land Speeder",
  "Lemartes",
  "Sanguinary Guard",
  "Sanguinary Priest with Jump Pack",
  "Storm Speeder Hailstrike",
  "Storm Speeder Hammerstrike",
  "Storm Speeder Thunderstrike",
  "Stormhawk Interceptor",
  "Stormraven Gunship",
  "Stormtalon Gunship",
  "The Sanguinor",
  "Thunderhawk Gunship",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "dedicated transport": [
  "Drop Pod",
  "Impulsor",
  "Razorback",
  "Relic Razorback",
  "Rhino"
 ],
 "fortification": [
  "Hammerfall Bunker"
 ],
 "kill team": [],
 "death company": [
  "Death Company Captain",
  "Death Company Captain with Jump Pack",
  "Death Company Dreadnought",
  "Death Company Dreadnought with Magna-Grapple",
  "Death Company Marines",
  "Death Company Marines with Boltguns",
  "Death Company Marines with Boltguns and Jump Packs",
  "Death Company Marines with Jump Packs"
 ],
 "deathwing": [],
 "ravenwing": []
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Astorath": "40",
 "Baal Predator": "coque",
 "Chief Librarian Mephiston": "40",
 "Commander Dante": "50",
 "Death Company Marines with Jump Packs": "32",
 "Lemartes": "40",
 "Sanguinary Guard": "40",
 "Sanguinary Priest": "40",
 "The Sanguinor": "40",
 "Blood Angels Captain": "40",
 "Death Company Captain": "40",
 "Death Company Captain with Jump Pack": "40",
 "Death Company Marines": "32",
 "Death Company Dreadnought": "90",
 "Captain in Gravis Armour": "40",
 "Captain in Phobos Armour": "40",
 "Captain in Terminator Armour": "50",
 "Captain with Jump Pack": "40",
 "Intercessor Squad": "32",
 "Infernus Squad": "32",
 "Assault Intercessor Squad": "32",
 "Heavy Intercessor Squad": "40",
 "Infiltrator Squad": "32",
 "Incursor Squad": "32",
 "Scout Squad": "28.5",
 "Bladeguard Veteran Squad": "40",
 "Vanguard Veteran Squad with Jump Packs": "32",
 "Sternguard Veteran Squad": "32",
 "Reiver Squad": "32",
 "Aggressor Squad": "40",
 "Terminator Assault Squad": "40",
 "Terminator Squad": "40",
 "Centurion Assault Squad": "50",
 "Centurion Devastator Squad": "50",
 "Invictor Tactical Warsuit": "90",
 "Dreadnought": "60",
 "Redemptor Dreadnought": "90",
 "Ballistus Dreadnought": "90",
 "Brutalis Dreadnought": "90",
 "Outrider Squad": "90x52.5",
 "Inceptor Squad": "40",
 "Storm Speeder Hailstrike": "90",
 "Storm Speeder Thunderstrike": "90",
 "Storm Speeder Hammerstrike": "90",
 "Hellblaster Squad": "32",
 "Eliminator Squad": "40",
 "Eradicator Squad with Melta Rifles": "40",
 "Desolation Squad": "32",
 "Firestrike Servo-Turrets": "80",
 "Whirlwind": "coque",
 "Predator Destructor": "coque",
 "Predator Annihilator": "coque",
 "Gladiator Lancer": "100",
 "Gladiator Reaper": "100",
 "Gladiator Valiant": "100",
 "Vindicator": "coque",
 "Land Raider": "coque",
 "Land Raider Crusader": "coque",
 "Land Raider Redeemer": "coque",
 "Repulsor": "100",
 "Repulsor Executioner": "100",
 "Rhino": "coque",
 "Razorback": "coque",
 "Impulsor": "100",
 "Drop Pod": "coque",
 "Stormhawk Interceptor": "120x92",
 "Stormtalon Gunship": "120x92",
 "Stormraven Gunship": "120x92",
 "Hammerfall Bunker": "coque",
 "Lieutenant": "40",
 "Lieutenant in Phobos Armour": "40",
 "Librarian": "40",
 "Librarian in Phobos Armour": "40",
 "Librarian in Terminator Armour": "40",
 "Chaplain": "40",
 "Chaplain in Terminator Armour": "40",
 "Chaplain on Bike": "90x52.5",
 "Chaplain with Jump Pack": "32",
 "Techmarine": "40",
 "Lieutenant with Combi-weapon": "40",
 "Apothecary": "40",
 "Apothecary Biologis": "40",
 "Ancient": "40",
 "Bladeguard Ancient": "40",
 "Ancient in Terminator Armour": "40",
 "Judiciar": "40",
 "Captain": "40",
 "Astraeus": "coque",
 "Thunderhawk Gunship": "coque",
 "Assault Intercessors with Jump Packs": "32",
 "Company Heroes": "40",
 "Eradicator Squad with Heavy Bolters": "40",
 "Land Speeder": "105x70",
 "Invader ATVs": "coque"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Predator Destructor": 4,
 "Stormraven Gunship": 5,
 "Hammerfall Bunker": 4,
 "Thunderhawk Gunship": 10
};

const TRANSPORTS = {
 "Thunderhawk Gunship": "This model has a transport capacity of 30 ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED models. Each JUMP PACK, WULFEN, GRAVIS or TERMINATOR model takes up the space of 2 models. Each CENTURION model takes up the space of 3 models. Each MOUNTED model takes up the space of 4 models."
};
const FACTION = [
 [
  "Combat Doctrines",
  "At the start of your Command phase, you can select one combat doctrine listed below. If you do, that combat doctrine is active for friendly ADEPTUS ASTARTES units with this ability until the start of your next Command phase. ASSAULT DOCTRINEWhen this unit is selected to make an advance move, that advance move does not prevent this unit from being eligible to declare a charge. DEVASTATOR DOCTRINEThis unit’s ranged attacks have [ASSAULT]. TACTICAL DOCTRINEWhen this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to shoot and eligible to declare a charge. Unless otherwise stated: ▪ You can only select each combat doctrine once per battle. ▪ Only one combat doctrine can be active for each unit. If a rule makes a combat doctrine active for a unit, any combat doctrine previously active for that unit is no longer active for that unit."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/bloodangels.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_UNITE = {
 "Sternguard Veteran Squad": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "T",
   "nom": "Focalisation Sternguard",
   "texte": "This unit's ranged attacks can re-roll hit rolls of 1"
  }
 ],
 "Desolation Squad": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Optiques de Visée",
   "texte": "This unit's ranged attacks that target a visible enemy unit have [IGNORES COVER]"
  }
 ],
 "Centurion Devastator Squad": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "T",
   "nom": "Protocoles Décimateurs",
   "texte": "Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1."
  }
 ],
 "Death Company Captain": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Rage Noire",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Death Company Captain with Jump Pack": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Rage Noire",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  },
  {
   "mot": "sust:1",
   "port": "C",
   "nom": "Perdu dans la Fureur",
   "texte": "This unit's melee attacks have [SUSTAINED HITS 1]."
  }
 ],
 "Death Company Dreadnought": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Rage Noire",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Death Company Dreadnought with Magna-Grapple": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Rage Noire",
   "texte": "Each time a model in this unit makes an attack, you can re-roll the Hit roll."
  }
 ],
 "Death Company Marines": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Rage Noire",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Death Company Marines with Boltguns": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Rage Noire",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Death Company Marines with Boltguns and Jump Packs": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Rage Noire",
   "texte": "Each time a model in this unit makes an attack, you can re-roll the Hit roll."
  }
 ],
 "Death Company Marines with Jump Packs": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Rage Noire",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Tycho the Lost": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Rage Noire",
   "texte": "Each time a model in this unit makes an attack, you can re-roll the Hit roll."
  }
 ],
 "Lemartes": [
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Fureur Déchaînée",
   "texte": "This unit's melee attacks have [LETHAL HITS]."
  }
 ]
};
const APTIS_COND = {
 "Intercessor Squad": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Discipline du Bolter",
   "quand": "L'unité, ou sa cible, est à portée d'un objectif",
   "texte": "In your Shooting phase, if any of the following apply, this unit's ranged attacks have +1 to hit rolls: ▪ This unit is within range of an objective. ▪ The target of that attack is within range of an objective."
  }
 ],
 "Assault Intercessor Squad": [
  {
   "champ": "strMod",
   "val": 1,
   "port": "C",
   "nom": "Intercession Ciblée",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this unit's melee attacks have +1 S and AP."
  },
  {
   "champ": "apMod",
   "val": 1,
   "port": "C",
   "nom": "Intercession Ciblée — PA",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this unit's melee attacks have +1 S and AP."
  }
 ],
 "Bladeguard Veteran Squad": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Bladeguard — en attaque",
   "quand": "L'option offensive est choisie ce tour (une fois par tour)",
   "texte": "(Once per turn, per unit): In the Fight phase, when this unit is selected to fight or when an enemy unit targets this unit, you can select one of the following: ▪ This unit’s melee attacks have +1 to hit rolls. ▪ Or: Attacks that target this unit have -1 to hit rolls."
  }
 ],
 "Vanguard Veteran Squad with Jump Packs": [
  {
   "champ": "atkMod",
   "val": 1,
   "port": "C",
   "nom": "Assaut des Vétérans",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this unit's melee attacks have +1A"
  }
 ],
 "Vanguard Veteran Squad": [
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Assaut des Vétérans",
   "quand": "L'unité a chargé ce tour",
   "texte": "Each time this unit ends a Charge move, until the end of the turn, melee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  }
 ],
 "Aggressor Squad": [
  {
   "champ": "strMod",
   "val": 1,
   "nom": "Puissance de Feu Rapprochée",
   "quand": "La cible est à 9\" ou moins",
   "texte": "This unit's attacks that target an enemy unit within 9\" of this unit have +1S"
  }
 ],
 "Terminator Assault Squad": [
  {
   "mot": "sust",
   "port": "C",
   "nom": "Assaut Terminatus",
   "quand": "L'unité a chargé ce tour, et la cible va avec l'arme : griffes éclair contre ni MONSTRE ni VÉHICULE, marteaux tonnerre contre MONSTRE ou VÉHICULE",
   "texte": "If this unit made a charge move this turn, this unit's: ▪ Lightning Claws weapons have [SUSTAINED HITS 1: NON-MONSTER/VEHICLE] ▪ Thunder Hammer weapons have [SUSTAINED HITS 1: MONSTER/VEHICLE]."
  }
 ],
 "Terminator Squad": [
  {
   "champ": "apMod",
   "val": 1,
   "nom": "Fureur du Premier",
   "quand": "La cible est à 9\" ou moins",
   "texte": "This unit's attacks that target a unit within 9\" of this unit have +1 AP."
  }
 ],
 "Invictor Tactical Warsuit": [
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Exo-armure d'Assaut",
   "quand": "La cible est sa marque",
   "texte": "This unit's attacks that target this unit's mark can re-roll wound rolls of 1."
  }
 ],
 "Ballistus Dreadnought": [
  {
   "mot": "sust",
   "port": "T",
   "nom": "Frappe Ballistus",
   "quand": "La cible est à 24\" ou moins",
   "texte": "This unit's ranged attacks that target an enemy unit within 24\" of this unit have [SUSTAINED HITS 1]"
  }
 ],
 "Outrider Squad": [
  {
   "mot": "sust",
   "port": "C",
   "nom": "Assaut à Pleins Gaz",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this unit's: ▪ Thunder Hammer weapons have +1 to hit rolls and [SUSTAINED HITS 1]. ▪ Other melee weapons have +1 D and [SUSTAINED HITS 1]."
  },
  {
   "champ": "dmgMod",
   "val": 1,
   "port": "C",
   "nom": "Assaut à Pleins Gaz — +1 D",
   "quand": "L'unité a chargé ce tour, armes autres que les marteaux tonnerre",
   "texte": "Other melee weapons have +1 D and [SUSTAINED HITS 1]."
  },
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Assaut à Pleins Gaz — marteaux",
   "quand": "L'unité a chargé ce tour, avec les marteaux tonnerre",
   "texte": "Thunder Hammer weapons have +1 to hit rolls and [SUSTAINED HITS 1]."
  }
 ],
 "Inceptor Squad": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Descente Météorique",
   "quand": "L'unité est arrivée sur la table ce tour",
   "texte": "If this unit made an ingress move this turn, this unit's ranged attacks have +1 to hit rolls."
  }
 ],
 "Storm Speeder Hammerstrike": [
  {
   "mot": "sust",
   "port": "T",
   "nom": "Hammerstrike",
   "quand": "La cible est dans une zone de terrain",
   "texte": "This unit's ranged attacks that target an enemy unit within a terrain area have [SUSTAINED HITS 1]"
  }
 ],
 "Eliminator Squad": [
  {
   "mot": "ignoresCover",
   "port": "T",
   "nom": "Optiques et Munitions Spéciales",
   "quand": "L'option Ignore le Couvert est choisie",
   "texte": "In your Shooting phase, when this unit is selected to shoot, you can select one of the following: ▪ This unit's ranged attacks have [IGNORES COVER]. ▪ Or: Select one enemy unit within 24\" of this unit. That enemy unit has +6\" detection range until this unit has shot."
  }
 ],
 "Gladiator Valiant": [
  {
   "champ": "strMod",
   "val": 1,
   "port": "T",
   "nom": "Acquisition de Cible Prioritaire",
   "quand": "La cible est à 12\" ou moins",
   "texte": "This unit's ranged attacks that target a unit within 12\" of this unit have +1S"
  }
 ],
 "Land Raider Crusader": [
  {
   "mot": "lethal",
   "port": "T",
   "nom": "Fureur de l'Esprit de la Machine",
   "quand": "La cible est à 12\" ou moins",
   "texte": "This unit's ranged attacks that target a unit within 12\" of this unit have Lethal Hits"
  }
 ],
 "Land Raider Redeemer": [
  {
   "mot": "dev",
   "port": "T",
   "nom": "Courroux de l'Esprit de la Machine",
   "quand": "La cible est à 12\" ou moins, et n'est ni MONSTRE ni VÉHICULE",
   "texte": "This unit’s ranged attacks that target a unit within 12\" of this unit have [Devastating Wounds: non-Monster/vehicle]"
  }
 ],
 "Repulsor Executioner": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Exécuteur",
   "quand": "La cible n'est pas sous la moitié de son effectif",
   "texte": "This unit's ranged attacks that target a unit not below half-strength have +1 to hit rolls."
  }
 ],
 "Invader ATVs": [
  {
   "champ": "wndMod",
   "val": 1,
   "port": "T",
   "nom": "Reconnaissance Agressive",
   "quand": "Aucune autre unité ennemie n'est à 6\" de la cible",
   "texte": "In your Shooting phase, this unit's ranged attacks that target an enemy unit that is not within 6\" of any other enemy units have +1 to wound rolls."
  }
 ],
 "Captain": [
  {
   "champ": "atkMod",
   "val": 3,
   "port": "C",
   "nom": "Heure de Gloire",
   "quand": "L'aptitude est déclenchée — une fois par bataille",
   "texte": "(Once per battle, per unit): In the Fight phase, when this unit is selected to fight, you can use this ability. If you do, this model's melee attacks have: ▪ +3 A ▪ [DEVASTATING WOUNDS]."
  },
  {
   "mot": "dev",
   "port": "C",
   "nom": "Heure de Gloire — Blessures Dévastatrices",
   "quand": "L'aptitude est déclenchée — une fois par bataille",
   "texte": "If you do, this model's melee attacks have: ▪ +3 A ▪ [DEVASTATING WOUNDS]."
  }
 ],
 "Centurion Devastator Squad": [
  {
   "champ": "rrH",
   "val": "failed",
   "port": "T",
   "nom": "Protocoles Décimateurs — objectif",
   "quand": "La cible est à portée d'un objectif",
   "texte": "If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Hit roll instead."
  }
 ],
 "Blood Angels Captain": [
  {
   "champ": "atkMod",
   "val": 3,
   "port": "C",
   "nom": "Heure de Gloire",
   "quand": "L'aptitude est déclenchée — une fois par bataille",
   "texte": "(Once per battle, per unit): In the Fight phase, when this unit is selected to fight, you can use this ability. If you do, this model's melee attacks have: ▪ +3 A ▪ [DEVASTATING WOUNDS]."
  },
  {
   "mot": "dev",
   "port": "C",
   "nom": "Heure de Gloire — Blessures Dévastatrices",
   "quand": "L'aptitude est déclenchée — une fois par bataille",
   "texte": "(Once per battle, per unit): In the Fight phase, when this unit is selected to fight, you can use this ability. If you do, this model's melee attacks have: ▪ +3 A ▪ [DEVASTATING WOUNDS]."
  }
 ],
 "Death Company Marines": [
  {
   "mot": "sust",
   "nom": "Une Mort Honorable au Combat",
   "quand": "L'unité est sous son effectif de départ",
   "texte": "This unit's attacks: - Have [SUSTAINED HITS 1], if this unit is below starting strength. - Or: have [SUSTAINED HITS 2], if this unit is below half-strength."
  }
 ],
 "Death Company Marines with Boltguns": [
  {
   "mot": "sust",
   "nom": "Une Mort Honorable au Combat",
   "quand": "L'unité est sous son effectif de départ",
   "texte": "Each time a model in this unit makes an attack, that attack has the [SUSTAINED HITS 1] ability if this unit is below its Starting Strength, or the [SUSTAINED HITS 2] ability if this unit is Below Half-strength."
  }
 ]
};
const APTIS_CIBLE = {
 "Predator Destructor": [
  {
   "champ": "apMod",
   "val": 1,
   "port": "T",
   "nom": "Destructeur",
   "texte": "Each time this model makes a ranged attack that targets an Infantry unit, improve the Armour Penetration characteristic of that attack by 1.",
   "vs": [
    "inf"
   ]
  }
 ],
 "Stormhawk Interceptor": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Intercepteur",
   "texte": "Each time this model makes a ranged attack that targets a unit that can Fly, add 1 to the Hit roll",
   "vs": [
    "vol"
   ]
  }
 ],
 "Stormtalon Gunship": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Mitraillage",
   "texte": "Each time this model makes a ranged attack that targets a unit that cannot Fly, add 1 to the Hit roll.",
   "sauf": [
    "vol"
   ]
  }
 ],
 "Storm Speeder Thunderstrike": [
  {
   "champ": "wndMod",
   "val": 1,
   "port": "T",
   "nom": "Thunderstrike",
   "texte": "This unit's ranged attacks that target a Monster/Vehicle unit have +1 to wound rolls.",
   "vs": [
    "mon",
    "veh"
   ]
  }
 ],
 "Gladiator Reaper": [
  {
   "champ": "apMod",
   "val": 1,
   "port": "T",
   "nom": "Moisson Comptée",
   "texte": "This unit's ranged attacks that target a unit (excluding Monster/Vehicle units) have +1 AP.",
   "sauf": [
    "mon",
    "veh"
   ]
  }
 ],
 "Centurion Assault Squad": [
  {
   "mot": "sust:2",
   "port": "C",
   "nom": "Protocoles Annihilateurs",
   "texte": "Melee weapons equipped by models in this unit have the [SUSTAINED HITS 2] ability when targeting Monster, Vehicle or Fortification units",
   "vs": [
    "mon",
    "veh"
   ]
  }
 ]
};
const AURAS_PERSO = {
 "Death Company Captain": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Rage Noire",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Death Company Captain with Jump Pack": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Rage Noire",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  },
  {
   "mot": "sust:1",
   "port": "C",
   "nom": "Perdu dans la Fureur",
   "texte": "This unit's melee attacks have [SUSTAINED HITS 1]."
  }
 ],
 "Lemartes": [
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Fureur Déchaînée",
   "texte": "This unit's melee attacks have [LETHAL HITS]."
  }
 ],
 "Brother Corbulo": [
  {
   "champ": "fnp",
   "val": 5,
   "nom": "Prêtre Sanguinien",
   "texte": "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability."
  }
 ],
 "Sanguinary Priest with Jump Pack": [
  {
   "champ": "fnp",
   "val": 5,
   "nom": "Prêtre Sanguinien",
   "texte": "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability"
  },
  {
   "champ": "apMod",
   "val": 1,
   "port": "C",
   "nom": "Calice de Sang",
   "texte": "While this model is leading a unit, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "source": "Chaplain",
  "kw": [
   "Chaplain"
  ],
  "nom": "Litanie de Haine (Meneur)",
  "quand": "L'unité est menée par Chaplain, et elle a chargé ce tour ([LANCE] : +1 pour blesser)",
  "texte": "This unit's melee attacks have [LANCE]",
  "champ": "wndMod",
  "val": 1,
  "port": "C"
 },
 {
  "source": "Chaplain in Terminator Armour",
  "kw": [
   "Chaplain in Terminator Armour"
  ],
  "nom": "Litanie de Haine (Meneur)",
  "quand": "L'unité est menée par Chaplain in Terminator Armour, et elle a chargé ce tour ([LANCE] : +1 pour blesser)",
  "texte": "This unit's melee attacks have [LANCE]",
  "champ": "wndMod",
  "val": 1,
  "port": "C"
 },
 {
  "source": "Chaplain on Bike",
  "kw": [
   "Chaplain on Bike"
  ],
  "nom": "Litanie de Haine (Meneur)",
  "quand": "L'unité est menée par Chaplain on Bike, et elle a chargé ce tour ([LANCE] : +1 pour blesser)",
  "texte": "This unit's melee attacks have [LANCE]",
  "champ": "wndMod",
  "val": 1,
  "port": "C"
 },
 {
  "source": "Chaplain with Jump Pack",
  "kw": [
   "Chaplain with Jump Pack"
  ],
  "nom": "Litanie de Haine (Meneur)",
  "quand": "L'unité est menée par Chaplain with Jump Pack, et elle a chargé ce tour ([LANCE] : +1 pour blesser)",
  "texte": "This unit's melee attacks have [LANCE]",
  "champ": "wndMod",
  "val": 1,
  "port": "C"
 },
 {
  "source": "Chaplain on Bike",
  "kw": [
   "Chaplain on Bike"
  ],
  "nom": "Catéchisme du Feu (Meneur)",
  "quand": "L'unité est menée par Chaplain on Bike, et la cible est celle qu'il a désignée",
  "texte": "In your Shooting phase, when this unit is selected to shoot, you can select one visible enemy unit. This unit's ranged attacks that target that unit have [DEVASTATING WOUNDS].",
  "mot": "dev",
  "port": "T"
 },
 {
  "source": "Chaplain with Jump Pack",
  "kw": [
   "Chaplain with Jump Pack"
  ],
  "nom": "Exhortation de Rage (Meneur)",
  "quand": "L'unité est menée par Chaplain with Jump Pack, et elle est à la moitié de son effectif ou moins",
  "texte": "While this unit is at or below half-strength, this unit's melee attacks can re-roll wound rolls.",
  "champ": "rrW",
  "val": "failed",
  "port": "C"
 },
 {
  "source": "Lieutenant",
  "kw": [
   "Lieutenant"
  ],
  "nom": "Précision Tactique (Meneur)",
  "quand": "L'unité est menée par Lieutenant, et la cible n'est ni MONSTRE ni VÉHICULE",
  "texte": "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE].",
  "mot": "lethal"
 },
 {
  "source": "Lieutenant in Phobos Armour",
  "kw": [
   "Lieutenant in Phobos Armour"
  ],
  "nom": "Précision Tactique (Meneur)",
  "quand": "L'unité est menée par Lieutenant in Phobos Armour, et la cible n'est ni MONSTRE ni VÉHICULE",
  "texte": "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE].",
  "mot": "lethal"
 },
 {
  "source": "Apothecary Biologis",
  "kw": [
   "Apothecary Biologis"
  ],
  "nom": "Ciblage Vivispectral (Meneur)",
  "quand": "L'unité est menée par Apothecary Biologis, et la cible n'est pas un VÉHICULE",
  "texte": "This unit's attacks have [LETHAL HITS: non-VEHICLE].",
  "mot": "lethal"
 },
 {
  "source": "Librarian in Terminator Armour",
  "kw": [
   "Librarian in Terminator Armour"
  ],
  "nom": "Puissance des Héros (Meneur)",
  "quand": "L'unité est menée par Librarian in Terminator Armour, et le test psychique est fait",
  "texte": "In the Fight phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: ▪ On a 1, this unit is battle-shocked. ▪ This unit's melee attacks have +2 S.",
  "champ": "strMod",
  "val": 2,
  "port": "C"
 },
 {
  "source": "Bladeguard Ancient",
  "kw": [
   "Bladeguard Ancient"
  ],
  "nom": "Hauts Faits de Légende (Meneur)",
  "quand": "L'unité est menée par Bladeguard Ancient, et elle est à portée d'un objectif",
  "texte": "While this unit is within range of an objective, this unit's melee attacks have +1 A.",
  "champ": "atkMod",
  "val": 1,
  "port": "C"
 },
 {
  "source": "Incursor Squad",
  "kw": [],
  "champ": "rrH",
  "val": "ones",
  "port": "T",
  "nom": "Auspex Divinator (Aura)",
  "quand": "La cible a été scannée par les Incursors ce tour (à 18\" d'eux)",
  "texte": "While a unit is scanned, ranged attacks that target that unit can re-roll hit rolls of 1."
 },
 {
  "source": "Infernus Squad",
  "kw": [],
  "mot": "ignoresCover",
  "port": "T",
  "nom": "Débusqués",
  "quand": "La cible a été touchée par l'Escouade Infernus ce tour",
  "texte": "In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. Friendly ADEPTUS ASTARTES units' ranged attacks that target that enemy unit have [IGNORES COVER]."
 },
 {
  "source": "Storm Speeder Hailstrike",
  "kw": [],
  "mot": "ignoresCover",
  "port": "T",
  "nom": "Hailstrike",
  "quand": "La cible a été touchée par le Storm Speeder Hailstrike ce tour",
  "texte": "In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. Friendly Adeptus Astartes units' ranged attacks that target that enemy unit have [Ignores Cover]."
 },
 {
  "source": "Storm Speeder Thunderstrike",
  "kw": [],
  "champ": "apMod",
  "val": 1,
  "port": "T",
  "nom": "Défenses Brisées",
  "quand": "La cible, MONSTRE ou VÉHICULE, a été touchée par le Storm Speeder Thunderstrike ce tour",
  "texte": "In your Shooting phase, when this unit has shot, select one enemy Monster/Vehicle unit hit by those attacks. Friendly Adeptus Astartes units' ranged attacks that target that enemy unit have +1 AP."
 },
 {
  "source": "Librarian in Phobos Armour",
  "kw": [],
  "mot": "ignoresCover",
  "port": "T",
  "nom": "Vue de l'Âme",
  "quand": "Le Lexicanum a réussi son test psychique sur la cible",
  "texte": "Select one visible enemy unit. Ranged attacks that target that enemy unit have [IGNORES COVER]."
 },
 {
  "source": "Razorback",
  "kw": [],
  "champ": "rrW",
  "val": "failed",
  "nom": "Appui-feu",
  "quand": "L'unité a débarqué de ce Razorback ce tour, et la cible a été touchée par lui",
  "texte": "In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
 },
 {
  "source": "Relic Razorback",
  "kw": [],
  "champ": "rrW",
  "val": "failed",
  "nom": "Appui-feu",
  "quand": "L'unité a débarqué de ce Razorback ce tour, et la cible a été touchée par lui",
  "texte": "In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
 },
 {
  "source": "Dreadnought",
  "kw": [
   "infantry"
  ],
  "champ": "rrH",
  "val": "ones",
  "nom": "Sagesse des Anciens (Aura)",
  "quand": "L'unité, INFANTERIE, est à 6\" du Dreadnought",
  "texte": "While a friendly Adeptus Astartes Infantry unit is within 6\" of this model, each time a model in that unit makes an attack, re-roll a Hit roll of 1."
 },
 {
  "source": "Venerable Dreadnought",
  "kw": [
   "infantry"
  ],
  "champ": "rrH",
  "val": "ones",
  "nom": "Sagesse des Anciens (Aura)",
  "quand": "L'unité, INFANTERIE, est à 6\" du Dreadnought",
  "texte": "While a friendly Adeptus Astartes Infantry unit is within 6\" of this model, each time a model in that unit makes an attack, re-roll a Hit roll of 1."
 },
 {
  "detach": "Gauntlet Task Force",
  "kw": [],
  "mot": "sust",
  "port": "T",
  "nom": "Déploiement Combiné",
  "quand": "L'unité a débarqué ce tour, et la cible est assaillie (touchée par un TRANSPORT ami ce tour)",
  "texte": "While a unit is assailed, when an ADEPTUS ASTARTES unit that disembarked this turn targets that unit, those attacks have [Sustained Hits 1]."
 },
 {
  "detach": "Gravis Linebreaker Force",
  "kw": [
   "gravis"
  ],
  "champ": "hitMod",
  "val": 1,
  "port": "T",
  "nom": "Forteresse Ambulante",
  "quand": "L'unité, GRAVIS, a fait un mouvement normal ce tour",
  "texte": "In a turn a friendly Gravis unit made a normal move, that unit’s ranged attacks: ▪ Do not have [Heavy]. ▪ Have +1 to hit rolls."
 },
 {
  "detach": "Phobos Shock Force",
  "kw": [
   "phobos"
  ],
  "champ": "rrW",
  "val": "ones",
  "nom": "Embusqués de l'Avant-garde",
  "quand": "L'unité, PHOBOS, était cachée à la fin de ton mouvement",
  "texte": "At the end of your Movement phase, if a friendly Phobos unit is hidden, that unit’s attacks can re-roll wound rolls of 1 until the end of the turn."
 },
 {
  "source": "Astorath",
  "kw": [
   "Astorath"
  ],
  "nom": "Masse Funeste (Meneur)",
  "quand": "L'unité est menée par Astorath, et elle a chargé ce tour, contre ni MONSTRE ni VÉHICULE",
  "texte": "If this unit made a charge move this turn, this unit's melee attacks have [DEVASTATING WOUNDS:non-MONSTER/VEHICLE]",
  "mot": "dev",
  "port": "C"
 },
 {
  "source": "Brother Corbulo",
  "kw": [
   "Brother Corbulo"
  ],
  "nom": "Le Graal Rouge (Meneur)",
  "quand": "L'unité est menée par Brother Corbulo",
  "texte": "While this model is leading a unit, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit.",
  "champ": "atkMod",
  "val": 1,
  "port": "C"
 }
];
const OCTROIS_DETACH = {
 "Ironclad Champions": [
  {
   "champ": "rrH",
   "val": "ones",
   "qui": "unite",
   "kw": [
    "dreadnought"
   ],
   "nom": "Vengeance Endurante",
   "texte": "Friendly Adeptus Astartes Dreadnought units can re-roll hit rolls of 1."
  }
 ],
 "Angelic Inheritors": [
  {
   "champ": "rrH",
   "val": "ones",
   "qui": "unite",
   "kw": [
    "character"
   ],
   "nom": "L'Héritage de l'Ange",
   "texte": "Friendly Blood Angels Character units: ▪ Can re-roll hit rolls of 1. ▪ Can re-roll wound rolls of 1."
  },
  {
   "champ": "rrW",
   "val": "ones",
   "qui": "unite",
   "kw": [
    "character"
   ],
   "nom": "L'Héritage de l'Ange",
   "texte": "Friendly Blood Angels Character units: ▪ Can re-roll hit rolls of 1. ▪ Can re-roll wound rolls of 1."
  }
 ]
};
const STRAT_SIMU = [
 {
  "nom": "Gene-Wrought Might",
  "detach": "Assault Brethren",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[LANCE] : +1 pour blesser, l'unité devant avoir chargé ce tour",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Gene-Wrought Might — doctrine d'assaut",
  "detach": "Assault Brethren",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[LANCE] : +1 pour blesser, l'unité devant avoir chargé ce tour, et +1 en PA sous la doctrine d'assaut",
  "effet": {
   "wndMod": 1,
   "apMod": 1
  }
 },
 {
  "nom": "Storm of Fire",
  "detach": "Devastator Brethren",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT]",
  "effet": {
   "ignoresCover": true
  }
 },
 {
  "nom": "Storm of Fire — doctrine Devastator",
  "detach": "Devastator Brethren",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT] et +1 en PA sous la doctrine Devastator",
  "effet": {
   "ignoresCover": true,
   "apMod": 1
  }
 },
 {
  "nom": "Might of Angels",
  "detach": "Gladius Task Force",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[LANCE] : +1 pour blesser, l'unité devant avoir chargé ce tour",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Storm of Devastation",
  "detach": "Gladius Task Force",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT]",
  "effet": {
   "ignoresCover": true
  }
 },
 {
  "nom": "Annihilating Force",
  "detach": "Gravis Linebreaker Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "gravis"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES]",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Annihilating Force",
  "detach": "Gravis Siege Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "gravis"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES]",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Mercy Is Weakness",
  "detach": "Ironclad Champions",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "dreadnought"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES]",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Mercy Is Weakness — Touches Soutenues",
  "detach": "Ironclad Champions",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "dreadnought"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] au lieu des Touches Fatales",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Headhunter Doctrine",
  "detach": "Ironstorm Spearhead",
  "pc": 1,
  "ph": "T",
  "unites": [
   "vehicle"
  ],
  "sauf": [
   "walker",
   "fly",
   "dedicated transport",
   "fortification"
  ],
  "aide": "[TOUCHES FATALES] — contre un MONSTRE ou un VÉHICULE seulement",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Might of the Machine Spirit",
  "detach": "Ironstorm Spearhead",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "vehicle"
  ],
  "sauf": [
   "walker",
   "fly",
   "dedicated transport",
   "fortification"
  ],
  "aide": "ignore les modificateurs de touche et de blessure, jusqu'à ta prochaine phase de Commandement",
  "effet": {
   "ignoreMalus": true
  }
 },
 {
  "nom": "Strike from the Shadows",
  "detach": "Phobos Shadow Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "phobos"
  ],
  "sauf": [],
  "aide": "+1 en Force et [TOUCHES FATALES] — l'unité est cachée",
  "effet": {
   "strMod": 1,
   "lethal": true
  }
 },
 {
  "nom": "Strike from the Shadows",
  "detach": "Phobos Shock Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "phobos"
  ],
  "sauf": [],
  "aide": "+1 en Force et [TOUCHES FATALES] — l'unité est cachée",
  "effet": {
   "strMod": 1,
   "lethal": true
  }
 },
 {
  "nom": "Relentless Assault",
  "detach": "Tacticus Attack Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "tacticus"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] — contre ni MONSTRE ni VÉHICULE",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Relentless Assault — MONSTRE ou VÉHICULE",
  "detach": "Tacticus Attack Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "tacticus"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] — contre un MONSTRE ou un VÉHICULE",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Relentless Assault",
  "detach": "Tacticus Firestorm Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "tacticus"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] — contre ni MONSTRE ni VÉHICULE",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Relentless Assault — MONSTRE ou VÉHICULE",
  "detach": "Tacticus Firestorm Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "tacticus"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] — contre un MONSTRE ou un VÉHICULE",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Point-Blank Brutality",
  "detach": "Tacticus Firestorm Force",
  "pc": 1,
  "ph": "T",
  "unites": [
   "tacticus"
  ],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT] — l'unité est engagée, armes sans [EXPLOSION]",
  "effet": {
   "ignoresCover": true
  }
 },
 {
  "nom": "Merciless Veterans",
  "detach": "Terminator Storm Force",
  "pc": 1,
  "ph": "T",
  "unites": [
   "terminator"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] et [TOUCHES SOUTENUES 1]",
  "effet": {
   "lethal": true,
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Focused Fury",
  "detach": "Angelic Inheritors",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES FATALES]",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Focused Fury — PERSONNAGE",
  "detach": "Angelic Inheritors",
  "pc": 1,
  "ph": "C",
  "unites": [
   "character"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] et [LANCE] : +1 pour blesser, l'unité devant avoir chargé ce tour — l'unité est un PERSONNAGE",
  "effet": {
   "lethal": true,
   "wndMod": 1
  }
 },
 {
  "nom": "Strike Now for Glory",
  "detach": "Angelic Inheritors",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1]",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Death Begets Vengeance",
  "detach": "Wrath of the Doomed",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "death company"
  ],
  "sauf": [],
  "aide": "+1 pour blesser — contre l'unité haïe, qui a détruit une unité de la Compagnie de la Mort",
  "effet": {
   "wndMod": 1
  }
 }
];

/* Vides, faute de câblage : voir l'en-tête. */
const ARMEMENT = {};
const RETINUE = {};
const ENH_ANCIENS = {};
const GRPN = {};
const MOMENTS = {};
const MOMENTS_ARMEE = [];
const COMPO = {};
const ROLES_UNITE = {};

enregistreFaction({
  cle : "bloodangels",
  nom : "Blood Angels",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
