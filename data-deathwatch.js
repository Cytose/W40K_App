/* ============================================================
   Données Deathwatch — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py deathwatch

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 65 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     87 fiches sur 94 en ont un. Les autres — des Legends, que le
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
  ["Astraeus",10,12,2,5,24,[1],[[1, {"1": 550}], [2, {"1": 650}]],0,"",0,"",8,"6+"],
  ["Ballistus Dreadnought",8,10,2,0,12,[1],[[1, {"1": 150}], [3, {"1": 170}]],0,"",0,"",4,"6+"],
  ["Bladeguard Ancient",6,5,3,4,4,[1],{"1": 70},0,"Appui",0,"",3,"6+"],
  ["Bladeguard Veteran Squad",6,5,3,4,3,[3, 6],[[1, {"3": 90, "6": 180}], [3, {"3": 110, "6": 200}]],0,"",0,"",1,"6+"],
  ["Brutalis Dreadnought",10,10,2,0,12,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",4,"6+"],
  ["Captain",6,5,3,4,5,[1],{"1": 90},0,"Meneur",0,"",1,"6+"],
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
  ["Company Heroes",6,5,3,0,4,[4],[[1, {"4": 125}], [3, {"4": 145}]],0,"",0,"",2,"6+"],
  ["Corvus Blackstar",14,10,3,0,14,[1],{"1": 180},0,"",0,"",0,"6+"],
  ["Deathwatch Terminator Squad",5,6,2,4,3,[5, 10],[[1, {"5": 190, "10": 380}], [3, {"5": 230, "10": 420}]],0,"",0,"",1,"6+"],
  ["Deathwatch Veterans",6,5,3,0,2,[5, 10],{"5": 115, "10": 220},0,"",0,"",2,"6+"],
  ["Decimus Kill Team",6,5,3,0,2,[5, 10],{"5": 110, "10": 210},0,"",0,"",2,"6+"],
  ["Desolation Squad",6,5,3,0,2,[5],[[1, {"5": 140}], [3, {"5": 150}]],0,"",0,"",1,"6+"],
  ["Dreadnought",6,9,2,0,8,[1],{"1": 135},0,"",1,"",3,"6+"],
  ["Drop Pod",0,7,3,0,8,[1],[[1, {"1": 60}], [4, {"1": 70}]],0,"",0,"",0,"6+"],
  ["Eliminator Squad",8,4,3,0,2,[3],{"3": 85},0,"",0,"",1,"6+"],
  ["Eradicator Squad with Heavy Bolters",5,6,3,0,3,[3, 6],[[1, {"3": 100, "6": 215}], [3, {"3": 130, "6": 245}]],0,"",0,"",1,"6+"],
  ["Eradicator Squad with Melta Rifles",5,6,3,0,3,[3, 6],[[1, {"3": 100, "6": 200}], [3, {"3": 120, "6": 220}]],0,"",0,"",1,"6+"],
  ["Firestrike Servo-Turrets",5,6,2,0,6,[1, 2],{"1": 80, "2": 160},0,"",0,"",2,"6+"],
  ["Fortis Kill Team",6,5,3,0,2,[10],[[1, {"10": 210}], [3, {"10": 225}]],0,"",0,"",2,"6+"],
  ["Gladiator Lancer",10,10,3,0,12,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",3,"6+"],
  ["Gladiator Reaper",10,10,3,0,12,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",3,"6+"],
  ["Gladiator Valiant",10,10,3,0,12,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",3,"6+"],
  ["Hammerfall Bunker",0,12,2,0,14,[1],{"1": 175},0,"",1,"",0,"6+"],
  ["Heavy Intercessor Squad",5,6,3,0,3,[5, 10],{"5": 115, "10": 230},0,"",0,"",2,"6+"],
  ["Hellblaster Squad",6,5,3,0,2,[5, 10],[[1, {"5": 115, "10": 230}], [3, {"5": 130, "10": 245}]],0,"",0,"",1,"6+"],
  ["Impulsor",12,9,3,0,11,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Inceptor Squad",10,6,3,0,3,[3, 6],[[1, {"3": 130, "6": 260}], [3, {"3": 150, "6": 280}]],0,"",0,"",1,"6+"],
  ["Incursor Squad",8,4,3,0,2,[5, 10],[[1, {"5": 90, "10": 170}], [3, {"5": 100, "10": 180}]],0,"",0,"",1,"6+"],
  ["Indomitor Kill Team",5,6,3,0,3,[10],[[1, {"10": 280}], [3, {"10": 300}]],0,"",0,"",1,"6+"],
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
  ["Librarian",6,5,3,0,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
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
  ["Scout Bike Squad",12,5,4,0,3,[3, 6],{"3": 75, "6": 150},0,"",1,"",2,"6+"],
  ["Spectrus Kill Team",8,4,3,0,2,[10],[[1, {"10": 185}], [3, {"10": 195}]],0,"",0,"",1,"6+"],
  ["Sternguard Veteran Squad",6,5,3,0,2,[5, 10],[[1, {"5": 105, "10": 210}], [3, {"5": 120, "10": 225}]],0,"",0,"",1,"6+"],
  ["Storm Speeder Hailstrike",14,9,3,0,11,[1],[[1, {"1": 110}], [3, {"1": 120}]],0,"",0,"",3,"6+"],
  ["Storm Speeder Hammerstrike",14,9,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Storm Speeder Thunderstrike",14,9,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Stormhawk Interceptor",0,9,3,0,10,[1],{"1": 155},0,"",1,"",0,"6+"],
  ["Stormraven Gunship",14,10,3,0,14,[1],[[1, {"1": 280}], [2, {"1": 300}]],0,"",1,"",0,"6+"],
  ["Stormtalon Gunship",0,8,3,0,10,[1],{"1": 165},0,"",1,"",0,"6+"],
  ["Talonstrike Kill Team",12,5,3,0,2,[10],[[1, {"10": 280}], [3, {"10": 300}]],0,"",0,"",1,"6+"],
  ["Techmarine",6,5,2,0,4,[1],{"1": 55},0,"Meneur",0,"",1,"6+"],
  ["Thunderhawk Gunship",20,12,2,0,30,[1],[[1, {"1": 850}], [2, {"1": 950}]],0,"",0,"",0,"6+"],
  ["Vanguard Veteran Squad",6,4,3,0,2,[5, 10],{"5": 120, "10": 240},0,"",1,"",1,"6+"],
  ["Vanguard Veteran Squad with Jump Packs",12,5,3,0,2,[5, 10],[[1, {"5": 110, "10": 220}], [3, {"5": 130, "10": 240}]],0,"",0,"",1,"6+"],
  ["Venerable Dreadnought",6,9,2,0,8,[1],{"1": 165},0,"",1,"",3,"6+"],
  ["Vindicator",9,11,2,0,11,[1],[[1, {"1": 185}], [3, {"1": 200}]],0,"",1,"",3,"6+"],
  ["Watch Captain Artemis",6,5,3,4,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Watch Master",6,5,2,4,5,[1],{"1": 105},0,"Meneur",0,"",1,"6+"],
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
  ["Astraeus","Astraeus las-ripper","T","3",3,12,3,"D3+3","","36\""],
  ["Astraeus","Ironhail Heavy Stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Astraeus","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Astraeus","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Astraeus","Twin lascannon","T","1",3,12,3,"D3+3","twin","48\""],
  ["Astraeus","Twin macro-accelerator cannon","T","12",3,9,1,"3","sust:1 twin","72\""],
  ["Astraeus","➤ Plasma eradicator - standard","T","D6",3,7,2,"2","","36\""],
  ["Astraeus","➤ Plasma eradicator - supercharge","T","3",3,8,3,"3","hazardous","36\""],
  ["Astraeus","Armoured Hull","C","6",4,8,0,"1","","càc"],
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
  ["Company Heroes","Master-crafted Bolt Pistol","T","1",3,5,1,"2","","12\""],
  ["Company Heroes","Master-crafted Bolt Rifle","T","2",3,5,1,"2","assault rf:1","24\""],
  ["Company Heroes","Master-crafted Heavy Bolter","T","4",3,6,1,"2","assault heavy rf:2 sust:1","36\""],
  ["Company Heroes","Combat Knife","C","5",3,5,1,"1","","càc"],
  ["Company Heroes","Master-crafted Power Weapon","C","6",2,6,2,"2","precision","càc"],
  ["Corvus Blackstar","Blackstar rocket launcher","T","4",3,5,0,"1","","30\""],
  ["Corvus Blackstar","Hurricane bolter","T","6",3,5,1,"1","rf:6 twin","24\""],
  ["Corvus Blackstar","Stormstrike missile launcher","T","1",3,10,2,"3","","48\""],
  ["Corvus Blackstar","Twin assault cannon","T","6",3,6,2,"1","sust:1 twin","24\""],
  ["Corvus Blackstar","Twin lascannon","T","1",3,12,3,"D3+3","twin","48\""],
  ["Corvus Blackstar","Armoured Hull","C","3",4,6,0,"1","","càc"],
  ["Deathwatch Terminator Squad","Assault Cannon","T","6",3,6,2,"1","sust:1","24\""],
  ["Deathwatch Terminator Squad","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Deathwatch Terminator Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Deathwatch Terminator Squad","➤ Cyclone missile launcher - frag","T","8",3,4,1,"1","","36\""],
  ["Deathwatch Terminator Squad","➤ Cyclone missile launcher - krak","T","2",3,10,2,"D3+3","","36\""],
  ["Deathwatch Terminator Squad","➤ Plasma cannon - standard","T","3",3,9,2,"2","","36\""],
  ["Deathwatch Terminator Squad","➤ Plasma cannon - supercharge","T","3",3,10,3,"3","hazardous","36\""],
  ["Deathwatch Terminator Squad","Power fist","C","3",3,8,2,"2","","càc"],
  ["Deathwatch Terminator Squad","Power weapon","C","5",3,5,2,"1","","càc"],
  ["Deathwatch Terminator Squad","Thunder Hammer","C","3",3,8,2,"3","dev","càc"],
  ["Deathwatch Terminator Squad","Twin lightning claws","C","6",3,5,2,"1","twin","càc"],
  ["Deathwatch Terminator Squad","➤ Chainfist - Hunter: Monster/Vehicle","C","3",3,12,2,"3","","càc"],
  ["Deathwatch Terminator Squad","➤ Chainfist - Standard","C","2",4,8,2,"2","","càc"],
  ["Deathwatch Veterans","Boltgun","T","1",3,5,1,"1","rf:1","24\""],
  ["Deathwatch Veterans","Deathwatch shotgun","T","2",3,4,1,"2","assault","18\""],
  ["Deathwatch Veterans","Frag cannon","T","2",3,7,2,"2","heavy lethal rf:1","18\""],
  ["Deathwatch Veterans","Stalker-pattern boltgun","T","1",3,5,1,"2","heavy precision","24\""],
  ["Deathwatch Veterans","➤ Combi-weapon (Damnatus)","T","1",3,9,3,"D3+2","","12\""],
  ["Deathwatch Veterans","➤ Combi-weapon (Infernus)","T","3",0,4,0,"1","torrent","12\""],
  ["Deathwatch Veterans","➤ Combi-weapon (Purgatus)","T","2",3,7,2,"2","melta:2","24\""],
  ["Deathwatch Veterans","➤ Infernus heavy bolter (Bolt)","T","3",3,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Deathwatch Veterans","➤ Infernus heavy bolter (Infernus)","T","3",0,5,1,"1","torrent","12\""],
  ["Deathwatch Veterans","Blackshield blades","C","4",3,5,2,"1","twin","càc"],
  ["Deathwatch Veterans","Heavy thunder hammer","C","3",4,10,2,"3","dev","càc"],
  ["Deathwatch Veterans","Knives and Fists","C","3",3,5,0,"1","","càc"],
  ["Deathwatch Veterans","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Deathwatch Veterans","Xenophase blade","C","4",3,5,2,"1","dev","càc"],
  ["Decimus Kill Team","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Decimus Kill Team","Deathwatch marksman bolt carbine","T","2",3,5,1,"1","heavy lethal","24\""],
  ["Decimus Kill Team","Frag cannon","T","2",3,7,2,"2","heavy lethal rf:1","18\""],
  ["Decimus Kill Team","Hellstorm bolt rifle","T","2",3,5,2,"2","assault heavy lethal","30\""],
  ["Decimus Kill Team","Special-issue bolt pistol","T","1",3,4,1,"1","lethal precision","18\""],
  ["Decimus Kill Team","Stalker bolt rifle","T","2",3,5,2,"2","heavy lethal precision","30\""],
  ["Decimus Kill Team","➤ Grenade Launcher - Frag","T","4",3,4,1,"1","","24\""],
  ["Decimus Kill Team","➤ Grenade Launcher - Krak","T","1",3,10,2,"3","rf:1","24\""],
  ["Decimus Kill Team","➤ Infernus heavy bolter (Bolt)","T","3",3,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Decimus Kill Team","➤ Infernus heavy bolter (Infernus)","T","3",0,5,1,"1","torrent","12\""],
  ["Decimus Kill Team","➤ Plasma incinerator - Standard","T","2",3,7,2,"1","assault heavy","24\""],
  ["Decimus Kill Team","➤ Plasma incinerator - Supercharge","T","2",3,8,3,"2","assault hazardous heavy","24\""],
  ["Decimus Kill Team","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Decimus Kill Team","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Decimus Kill Team","Combat knife","C","4",3,4,1,"1","precision","càc"],
  ["Decimus Kill Team","Heavy thunder hammer","C","3",4,10,2,"3","dev","càc"],
  ["Decimus Kill Team","Knives and Fists","C","3",3,5,0,"1","","càc"],
  ["Decimus Kill Team","Power weapon","C","4",3,5,2,"1","sust:1","càc"],
  ["Decimus Kill Team","Xenophase blade","C","4",3,5,2,"1","dev","càc"],
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
  ["Fortis Kill Team","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Fortis Kill Team","Castellan Launcher","T","2",3,5,1,"1","heavy","24\""],
  ["Fortis Kill Team","Deathwatch bolt rifle","T","2",3,5,2,"1","assault heavy lethal","24\""],
  ["Fortis Kill Team","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Fortis Kill Team","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Fortis Kill Team","Pyreblaster","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Fortis Kill Team","Superfrag missile launcher","T","4",3,5,1,"1","heavy","48\""],
  ["Fortis Kill Team","Superkrak missile launcher","T","1",3,10,2,"D3+3","heavy","48\""],
  ["Fortis Kill Team","Vengor launcher","T","4",3,7,1,"2","heavy indirect","48\""],
  ["Fortis Kill Team","➤ Grenade Launcher - Frag","T","4",3,4,1,"1","","24\""],
  ["Fortis Kill Team","➤ Grenade Launcher - Krak","T","1",3,10,2,"3","rf:1","24\""],
  ["Fortis Kill Team","➤ Plasma incinerator - Standard","T","2",3,7,2,"1","assault heavy","24\""],
  ["Fortis Kill Team","➤ Plasma incinerator - Supercharge","T","2",3,8,3,"2","assault hazardous heavy","24\""],
  ["Fortis Kill Team","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Fortis Kill Team","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Fortis Kill Team","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Fortis Kill Team","Knives and Fists","C","3",3,5,0,"1","","càc"],
  ["Fortis Kill Team","Power fist","C","3",3,8,2,"2","","càc"],
  ["Fortis Kill Team","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Fortis Kill Team","Thunder Hammer","C","3",4,8,2,"3","dev","càc"],
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
  ["Indomitor Kill Team","Auto boltstorm gauntlets","T","3",3,5,1,"1","twin","18\""],
  ["Indomitor Kill Team","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Indomitor Kill Team","Deathwatch heavy bolt rifle","T","2",3,5,2,"2","assault heavy lethal","30\""],
  ["Indomitor Kill Team","Deathwatch heavy bolter","T","3",3,5,2,"3","assault heavy lethal sust:1","36\""],
  ["Indomitor Kill Team","Fragstorm grenade launcher","T","3",3,4,1,"1","","18\""],
  ["Indomitor Kill Team","➤ Flamestorm gauntlets (Close-quarters)","T","3",0,4,1,"1","torrent twin","12\""],
  ["Indomitor Kill Team","➤ Flamestorm gauntlets (Ranged)","T","3",0,4,1,"1","torrent twin","12\""],
  ["Indomitor Kill Team","➤ Melta Rifle","T","1",3,10,3,"D3+2","melta:2","18\""],
  ["Indomitor Kill Team","➤ Melta Rifle HUNTER:Monster/Vehicle","T","1",2,12,3,"D3+2","melta:2","18\""],
  ["Indomitor Kill Team","➤ Multi-melta","T","2",3,10,3,"D3+2","heavy melta:3","18\""],
  ["Indomitor Kill Team","➤Multi-melta (HUNTER:Monster/Vehicle)","T","2",2,12,3,"D3+2","melta:3","18\""],
  ["Indomitor Kill Team","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Indomitor Kill Team","Twin power fists","C","3",3,8,2,"2","twin","càc"],
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
  ["Librarian","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Librarian","➤ Smite - Focused Witchfire","T","D3+3",3,6,2,"2","dev hazardous psychic","24\""],
  ["Librarian","➤ Smite - Witchfire","T","D6",3,6,1,"2","psychic","24\""],
  ["Librarian","Force weapon [Psychic]","C","4",3,6,2,"2","psychic","càc"],
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
  ["Spectrus Kill Team","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Spectrus Kill Team","Bolt sniper rifle","T","1",3,6,2,"3","heavy precision","36\""],
  ["Spectrus Kill Team","Deathwatch Bolt carbine","T","2",3,5,1,"1","lethal precision","24\""],
  ["Spectrus Kill Team","Deathwatch marksman bolt carbine","T","2",3,5,1,"1","heavy lethal","24\""],
  ["Spectrus Kill Team","Deathwatch occulus bolt carbine","T","2",3,5,1,"1","assault ignorescover lethal","24\""],
  ["Spectrus Kill Team","Instigator bolt carbine","T","1",3,5,2,"2","precision rf:2","24\""],
  ["Spectrus Kill Team","Las fusil","T","1",3,10,3,"D3+3","heavy","36\""],
  ["Spectrus Kill Team","Special-issue bolt pistol","T","1",3,5,1,"1","precision","12\""],
  ["Spectrus Kill Team","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Spectrus Kill Team","Combat knife","C","4",3,5,1,"1","precision","càc"],
  ["Spectrus Kill Team","Paired combat blades","C","3",3,5,1,"1","sust:1","càc"],
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
  ["Talonstrike Kill Team","Assault bolters","T","3",3,5,1,"2","assault sust:2 twin","18\""],
  ["Talonstrike Kill Team","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Talonstrike Kill Team","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Talonstrike Kill Team","➤ Plasma exterminators - standard","T","2",3,7,2,"2","assault twin","18\""],
  ["Talonstrike Kill Team","➤ Plasma exterminators - supercharge","T","2",3,8,3,"3","assault hazardous twin","18\""],
  ["Talonstrike Kill Team","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Talonstrike Kill Team","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Talonstrike Kill Team","Ceramite Fists","C","3",3,5,0,"1","","càc"],
  ["Talonstrike Kill Team","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Talonstrike Kill Team","Power fist","C","3",3,8,2,"2","","càc"],
  ["Talonstrike Kill Team","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Techmarine","Forge Bolter","T","3",2,5,1,"2","sust:1","24\""],
  ["Techmarine","Grav-pistol","T","2",2,2,1,"3","anti:2:veh","12\""],
  ["Techmarine","Omnissian Power Axe and Servo-arm","C","5",3,6,2,"2","","càc"],
  ["Thunderhawk Gunship","Hellstrike missile battery","T","4",3,8,2,"3","anti:4:vol","72\""],
  ["Thunderhawk Gunship","Thunderhawk heavy cannon","T","D6+6",3,10,2,"3","blast","48\""],
  ["Thunderhawk Gunship","Turbo-laser destructor","T","D3+1",3,20,4,"D6+6","blast","96\""],
  ["Thunderhawk Gunship","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
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
  ["Watch Captain Artemis","Hellfire Extremis","T","3",0,4,1,"1","anti:4:inf dev ignorescover torrent","12\""],
  ["Watch Captain Artemis","Master-crafted power weapon","C","6",2,6,2,"2","","càc"],
  ["Watch Master","Vigil spear (tir)","T","2",2,5,1,"2","","24\""],
  ["Watch Master","Vigil spear (càc)","C","6",2,6,2,"2","lance","càc"],
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
  ["Astraeus","Véhicule"],
  ["Ballistus Dreadnought","Véhicule"],
  ["Bladeguard Ancient","Personnage"],
  ["Bladeguard Veteran Squad","Infanterie"],
  ["Brutalis Dreadnought","Véhicule"],
  ["Captain","Personnage"],
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
  ["Company Heroes","Personnage"],
  ["Corvus Blackstar","Véhicule"],
  ["Deathwatch Terminator Squad","Infanterie"],
  ["Deathwatch Veterans","Battleline"],
  ["Decimus Kill Team","Battleline"],
  ["Desolation Squad","Infanterie"],
  ["Dreadnought","Véhicule"],
  ["Drop Pod","Véhicule"],
  ["Eliminator Squad","Infanterie"],
  ["Eradicator Squad with Heavy Bolters","Infanterie"],
  ["Eradicator Squad with Melta Rifles","Infanterie"],
  ["Firestrike Servo-Turrets","Véhicule"],
  ["Fortis Kill Team","Infanterie"],
  ["Gladiator Lancer","Véhicule"],
  ["Gladiator Reaper","Véhicule"],
  ["Gladiator Valiant","Véhicule"],
  ["Hammerfall Bunker","Fortification"],
  ["Heavy Intercessor Squad","Battleline"],
  ["Hellblaster Squad","Infanterie"],
  ["Impulsor","Véhicule"],
  ["Inceptor Squad","Infanterie"],
  ["Incursor Squad","Infanterie"],
  ["Indomitor Kill Team","Infanterie"],
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
  ["Librarian","Personnage"],
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
  ["Scout Bike Squad","Monté"],
  ["Spectrus Kill Team","Infanterie"],
  ["Sternguard Veteran Squad","Infanterie"],
  ["Storm Speeder Hailstrike","Véhicule"],
  ["Storm Speeder Hammerstrike","Véhicule"],
  ["Storm Speeder Thunderstrike","Véhicule"],
  ["Stormhawk Interceptor","Véhicule"],
  ["Stormraven Gunship","Véhicule"],
  ["Stormtalon Gunship","Véhicule"],
  ["Talonstrike Kill Team","Infanterie"],
  ["Techmarine","Personnage"],
  ["Thunderhawk Gunship","Véhicule"],
  ["Vanguard Veteran Squad","Infanterie"],
  ["Vanguard Veteran Squad with Jump Packs","Infanterie"],
  ["Venerable Dreadnought","Véhicule"],
  ["Vindicator","Véhicule"],
  ["Watch Captain Artemis","Epic Hero"],
  ["Watch Master","Personnage"],
  ["Whirlwind","Véhicule"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Captain": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Company Heroes",
  "Deathwatch Veterans",
  "Decimus Kill Team",
  "Desolation Squad",
  "Fortis Kill Team",
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
  "Heavy Intercessor Squad",
  "Indomitor Kill Team"
 ],
 "Captain in Phobos Armour": [
  "Eliminator Squad",
  "Incursor Squad",
  "Infiltrator Squad",
  "Reiver Squad",
  "Spectrus Kill Team"
 ],
 "Captain in Terminator Armour": [
  "Deathwatch Terminator Squad"
 ],
 "Captain on Bike": [
  "Outrider Squad"
 ],
 "Captain with Jump Pack": [
  "Assault Intercessors with Jump Packs",
  "Talonstrike Kill Team",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "Chaplain": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Deathwatch Veterans",
  "Decimus Kill Team",
  "Fortis Kill Team",
  "Hellblaster Squad",
  "Infernus Squad",
  "Intercessor Squad",
  "Sternguard Veteran Squad",
  "Vanguard Veteran Squad"
 ],
 "Chaplain in Terminator Armour": [
  "Deathwatch Terminator Squad"
 ],
 "Chaplain on Bike": [
  "Outrider Squad"
 ],
 "Chaplain with Jump Pack": [
  "Assault Intercessors with Jump Packs",
  "Talonstrike Kill Team",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "Librarian": [
  "Assault Intercessor Squad",
  "Deathwatch Veterans",
  "Decimus Kill Team",
  "Desolation Squad",
  "Fortis Kill Team",
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
  "Spectrus Kill Team"
 ],
 "Librarian in Terminator Armour": [
  "Deathwatch Terminator Squad"
 ],
 "Techmarine": [
  "Assault Intercessor Squad",
  "Decimus Kill Team",
  "Desolation Squad",
  "Fortis Kill Team",
  "Intercessor Squad"
 ],
 "Watch Captain Artemis": [
  "Deathwatch Veterans",
  "Decimus Kill Team",
  "Fortis Kill Team"
 ],
 "Watch Master": [
  "Deathwatch Veterans",
  "Decimus Kill Team",
  "Fortis Kill Team"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
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
 ],
 "Corvus Blackstar": [
  [
   "Blackstar Cluster Launcher",
   "In your Movement phase, when this unit ends a normal move, select up to one enemy unit this unit moved over during that move and roll six D6:\n\n\n- For each 4+, that unit suffers 1 mortal wound."
  ],
  [
   "Auspex Array",
   "Ranged weapons equipped by the bearer have the [IGNORES COVER] ability."
  ]
 ],
 "Deathwatch Terminator Squad": [
  [
   "Terminatus Assault",
   "- This unit can re-roll charge rolls.\n- After this unit ends a charge move, each enemy unit engaged with this unit makes a battle-shock roll, with -1 to that battle-shock roll if it's a non-Imperium/Chaos unit."
  ],
  [
   "Teleport Homer",
   "At the start of the battle, you can set up one Teleport Homer token for this unit on the battlefield. If you do:\n\n- When you target this unit with the Rapid Ingress stratagem, you can use that Teleport Homer token. If you do, that use is -1 CP, but when resolving that stratagem, this unit must be set up within 3\" of that Teleport Homer token and not within 8\" of an enemy unit. That Teleport Homer token is then removed from the battlefield.\n- If an enemy unit ends a move within 1\" of that Teleport Homer token, that Teleport Homer token is removed from the battlefield."
  ],
  [
   "Storm Shield",
   "The bearer has a Wounds characteristic of 4."
  ]
 ],
 "Deathwatch Veterans": [
  [
   "Death to the Alien",
   "This unit's attacks can:\n\n- Re-roll hit rolls of 1.\n- Or: If the target of those attacks does not have IMPERIUM/CHAOS, re-roll hit rolls."
  ],
  [
   "Storm shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Decimus Kill Team": [
  [
   "Death to the Alien",
   "This unit's attacks can:\n\n- Re-roll hit rolls of 1.\n- Or: If the target of those attacks does not have IMPERIUM/CHAOS, re-roll hit rolls."
  ],
  [
   "Astartes shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Fortis Kill Team": [
  [
   "Fortis Doctrines",
   "This unit's attacks that target a unit\n\n\n- Below starting strength, have +1 to hit rolls.\n- Or: at or below half-strength have +1 to hit rolls and wound rolls."
  ]
 ],
 "Indomitor Kill Team": [
  [
   "Indomitor Doctrines",
   "- This unit's ranged attacks that target the closest eligible enemy unit, have +1 S.\n- If this unit made a charge move this turn, this unit's melee attacks have +1 S."
  ]
 ],
 "Spectrus Kill Team": [
  [
   "Spectrus Doctrines",
   "At the end of your opponent's Fight phase, if this unit is unengaged, you can place this unit in strategic reserves."
  ],
  [
   "Helix Gauntlet",
   "In your Command phase, this unit heals D3 wounds."
  ]
 ],
 "Talonstrike Kill Team": [
  [
   "Talonstrike Doctrines",
   "In a turn this unit was set up on the battlefield:\n\n\n- This unit's attacks have +1 AP.\n- This unit's melee attacks have [LANCE]."
  ]
 ],
 "Watch Captain Artemis": [
  [
   "Tactical Instinct",
   "This unit's attacks have [Sustained Hits 1]."
  ],
  [
   "Unstoppable Champion",
   "(Once per battle, per army)\nAt the end of a phase in which this model is destroyed, roll one D6:\n\n\n- On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed, unengaged with 3 wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following units: \nDEATHWATCH VETERANS, DECIMUS KILL TEAM, FORTIS KILL TEAM"
  ]
 ],
 "Watch Master": [
  [
   "Strategic Knowledge",
   "- This unit’s ranged attacks have [ASSAULT].\n- When this unit is selected to make an advance move, that advance move does not prevent this unit from being eligible to declare a charge.\n- When this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to shoot and eligible to declare a charge."
  ],
  [
   "Watch Master",
   "This model’s attacks that target a Character unit can:\n\n\n- Re-roll hit rolls of 1.\n- Re-roll wound rolls of 1."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\nDEATHWATCH VETERANS, DECIMUS KILL TEAM, FORTIS KILL TEAM"
  ],
  [
   "Purgatus Quarry",
   "At the start of the first battle round, select up to one enemy unit to be this unit’s hunted:\n\n\n- This unit’s attacks that target this unit’s hunted unit can re-roll wound rolls of 1.\n- Each time this unit’s hunted is destroyed, select up to one enemy unit to be this unit’s hunted."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Assault Brethren",1,"Doctrines","Assault Mastery","You can select the assault doctrine one additional time per battle.","",0,"","Take and Hold"],
  ["Black Spear Task Force",3,"","Mission Tactics","Friendly KILL TEAM units with this ability have the following abilities: Furor Tactics: If the devastator doctrine is active for your unit, your unit’s attacks have [SUSTAINED HITS 1]. Malleus Tactics: If the tactical doctrine is active for your unit, your unit’s attacks have [LETHAL HITS]. Purgatus Tactics: If the assault doctrine is active for your unit, your unit’s attacks that target an enemy unit within 9\" of this unit have [PRECISION]. RESTRICTIONS: Your army can include ADEPTUS ASTARTES DEATHWATCH units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter. With the exception of Kill Team Cassius (see Legends: Agents of the Imperium), your army cannot include any AGENTS OF THE IMPERIUM DEATHWATCH units.","",0,"","Priority Assets"],
  ["Devastator Brethren",1,"Doctrines","Devastator Mastery","You can select the devastator doctrine one additional time per battle.","",0,"","Purge the Foe"],
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
  ["Terminator Storm Force",1,"Terminator","Death Blow","Friendly Adeptus Astartes Terminator units have +1 to charge rolls.","",0,"","Priority Assets"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Furious Assault (Upgrade)",10,"Assault Brethren","Adeptus Astartes Infantry unit only. This unit’s melee attacks have [Sustained Hits 1: non-Monster/Vehicle].",null],
  ["Imperium’s Sword",20,"Assault Brethren","ADEPTUS ASTARTES model only. This model has the following weapon:",null],
  ["Beacon Angelis",25,"Black Spear Task Force","ADEPTUS ASTARTES model only. If this unit is a Kill Team unit, this unit has:\n\n▪ Deep Strike.\n▪ When you target this unit with the Rapid Ingress Stratagem, that use is -1CP.",null],
  ["Osseus Key (Aura)",20,"Black Spear Task Force","WATCH MASTER/TECHMARINE model only. While an enemy VEHICLE unit is within 6\" of this model, that enemy unit’s attacks have -1 A.",null],
  ["The Thief of Secrets",10,"Black Spear Task Force","WATCH MASTER/CAPTAIN model only. This model has the following weapon:",null],
  ["The Tome of Ectoclades",15,"Black Spear Task Force","WATCH MASTER/CAPTAIN model only. (Once per battle, per army) In your Command phase, you can use this ability. If you do, the assault doctrine, devastator doctrine and tactical doctrine are active for this unit until the start of your next Command phase.",null],
  ["Honour of Vigilance",20,"Devastator Brethren","Adeptus Astartes model only. \n▪ This unit's ranged attacks have [Lethal Hits]\n▪ If the devastator doctrine is active for this unit, this unit can re-roll advance rolls.",null],
  ["Master-forged Firearms",15,"Devastator Brethren","Adeptus Astartes Infantry/Mounted model only. This model's ranged attacks (excluding [Psychic] attacks) have +1A, S, AP and D.",null],
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
  ["Corporeum Reliquary",25,"Terminator Storm Force","Adeptus Astartes Terminator model only. In your first Movement phase, this unit can make an ingress move.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Armour of Contempt","Assault Brethren","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Duty in Death","Assault Brethren","",1,"Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +1 to that roll if the assault doctrine is active for your unit: ▪ On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Gene-Wrought Might","Assault Brethren","",1,"Fight phase, when a friendly ADEPTUS ASTARTES unit is selected to fight.","That ADEPTUS ASTARTES unit.","Your unit’s melee attacks have: ▪ [Lance]. ▪ Or: If the assault doctrine is active for your unit, [Lance] and +1 AP.",""],
  ["Adaptive Tactics","Black Spear Task Force","",1,"Your Command phase.","One friendly ADEPTUS ASTARTES unit.","Select one combat doctrine. That combat doctrine is active for your unit until the start of your next Command phase.",""],
  ["Armour of Contempt","Black Spear Task Force","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Dragonfire Rounds","Black Spear Task Force","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks: ▪ Can re-roll wound rolls of 1. ▪ Have [IGNORES COVER].",""],
  ["Hellfire Rounds","Black Spear Task Force","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks (excluding [DEVASTATING WOUNDS] attacks) have [ANTI-non-VEHICLE 4+].",""],
  ["Kraken Rounds","Black Spear Task Force","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks: ▪ Have +6\" R. ▪ Have +1 S.",""],
  ["Site-To-Site Teleportation","Black Spear Task Force","",1,"End of your opponent’s Fight phase.","One friendly unengaged ADEPTUS ASTARTES INFANTRY unit.","▪ Place your unit in strategic reserves. ▪ If your unit has Kill Team, your unit has Deep Strike until the end of your next Movement phase.",""],
  ["Armour of Contempt","Devastator Brethren","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Hail of Vengeance","Devastator Brethren","",2,"Your opponent’s Shooting phase, when an enemy unit has shot, if those attacks destroyed a model in a friendly ADEPTUS ASTARTES unit.","That ADEPTUS ASTARTES unit.","Your unit shoots using normal shooting, but while doing so your unit can only target that enemy unit.",""],
  ["Storm of Fire","Devastator Brethren","",1,"Your Shooting phase, when a friendly ADEPTUS ASTARTES unit is selected to shoot.","That ADEPTUS ASTARTES unit.","Your unit’s ranged attacks have: ▪ [Ignores Cover]. ▪ Or: If the devastator doctrine is active for your unit, [Ignores Cover] and +1 AP.",""],
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
  "Ballistus Dreadnought",
  "Brutalis Dreadnought",
  "Corvus Blackstar",
  "Dreadnought",
  "Drop Pod",
  "Firestrike Servo-Turrets",
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
  "Deathwatch Veterans",
  "Decimus Kill Team",
  "Heavy Intercessor Squad",
  "Intercessor Squad"
 ],
 "epic": [
  "Watch Captain Artemis"
 ],
 "infantry": [
  "Aggressor Squad",
  "Assault Intercessors with Jump Packs",
  "Bladeguard Veteran Squad",
  "Centurion Assault Squad",
  "Centurion Devastator Squad",
  "Deathwatch Terminator Squad",
  "Desolation Squad",
  "Eliminator Squad",
  "Eradicator Squad with Heavy Bolters",
  "Eradicator Squad with Melta Rifles",
  "Fortis Kill Team",
  "Hellblaster Squad",
  "Inceptor Squad",
  "Incursor Squad",
  "Indomitor Kill Team",
  "Infernus Squad",
  "Infiltrator Squad",
  "Reiver Squad",
  "Spectrus Kill Team",
  "Sternguard Veteran Squad",
  "Talonstrike Kill Team",
  "Vanguard Veteran Squad",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "character": [
  "Ancient",
  "Ancient in Terminator Armour",
  "Apothecary",
  "Apothecary Biologis",
  "Bladeguard Ancient",
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
  "Judiciar",
  "Librarian",
  "Librarian in Phobos Armour",
  "Librarian in Terminator Armour",
  "Lieutenant",
  "Lieutenant in Phobos Armour",
  "Lieutenant with Combi-weapon",
  "Techmarine",
  "Watch Master"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
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
 "Bladeguard Veteran Squad": "40",
 "Vanguard Veteran Squad with Jump Packs": "32",
 "Sternguard Veteran Squad": "32",
 "Reiver Squad": "32",
 "Aggressor Squad": "40",
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
 "Invader ATVs": "coque",
 "Corvus Blackstar": "120x92",
 "Deathwatch Terminator Squad": "40",
 "Deathwatch Veterans": "32",
 "Decimus Kill Team": "40",
 "Fortis Kill Team": "32",
 "Indomitor Kill Team": "40",
 "Spectrus Kill Team": "32",
 "Talonstrike Kill Team": "32",
 "Watch Captain Artemis": "32",
 "Watch Master": "32"
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
 "Thunderhawk Gunship": "This model has a transport capacity of 30 ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED models. Each JUMP PACK, WULFEN, GRAVIS or TERMINATOR model takes up the space of 2 models. Each CENTURION model takes up the space of 3 models. Each MOUNTED model takes up the space of 4 models.",
 "Corvus Blackstar": "This model has a transport capacity of 12 ^^**DEATHWATCH INFANTRY**^^ models. Each ^^**GRAVIS/JUMP PACK/TERMINATOR**^^ model takes up the space of 2 models."
};
const FACTION = [
 [
  "Combat Doctrines",
  "At the start of your Command phase, you can select one combat doctrine listed below. If you do, that combat doctrine is active for friendly ADEPTUS ASTARTES units with this ability until the start of your next Command phase. ASSAULT DOCTRINEWhen this unit is selected to make an advance move, that advance move does not prevent this unit from being eligible to declare a charge. DEVASTATOR DOCTRINEThis unit’s ranged attacks have [ASSAULT]. TACTICAL DOCTRINEWhen this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to shoot and eligible to declare a charge. Unless otherwise stated: ▪ You can only select each combat doctrine once per battle. ▪ Only one combat doctrine can be active for each unit. If a rule makes a combat doctrine active for a unit, any combat doctrine previously active for that unit is no longer active for that unit."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/deathwatch.json —
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
 "Deathwatch Veterans": [
  {
   "champ": "rrH",
   "val": "ones",
   "nom": "Mort à l'Étranger",
   "texte": "This unit's attacks can: - Re-roll hit rolls of 1. - Or: If the target of those attacks does not have IMPERIUM/CHAOS, re-roll hit rolls."
  }
 ],
 "Decimus Kill Team": [
  {
   "champ": "rrH",
   "val": "ones",
   "nom": "Mort à l'Étranger",
   "texte": "This unit's attacks can: - Re-roll hit rolls of 1. - Or: If the target of those attacks does not have IMPERIUM/CHAOS, re-roll hit rolls."
  }
 ],
 "Watch Captain Artemis": [
  {
   "mot": "sust:1",
   "nom": "Instinct Tactique",
   "texte": "This unit's attacks have [Sustained Hits 1]."
  }
 ],
 "Corvus Blackstar": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Réseau Auspex",
   "texte": "Ranged weapons equipped by the bearer have the [IGNORES COVER] ability."
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
 "Deathwatch Veterans": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Mort à l'Étranger — xenos",
   "quand": "La cible n'est ni IMPERIUM ni CHAOS",
   "texte": "This unit's attacks can: - Re-roll hit rolls of 1. - Or: If the target of those attacks does not have IMPERIUM/CHAOS, re-roll hit rolls."
  }
 ],
 "Decimus Kill Team": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Mort à l'Étranger — xenos",
   "quand": "La cible n'est ni IMPERIUM ni CHAOS",
   "texte": "This unit's attacks can: - Re-roll hit rolls of 1. - Or: If the target of those attacks does not have IMPERIUM/CHAOS, re-roll hit rolls."
  }
 ],
 "Fortis Kill Team": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Doctrines Fortis",
   "quand": "La cible est sous son effectif de départ",
   "texte": "This unit's attacks that target a unit - Below starting strength, have +1 to hit rolls. - Or: at or below half-strength have +1 to hit rolls and wound rolls."
  },
  {
   "champ": "wndMod",
   "val": 1,
   "nom": "Doctrines Fortis — sous la moitié",
   "quand": "La cible est à la moitié de son effectif ou moins",
   "texte": "This unit's attacks that target a unit - Below starting strength, have +1 to hit rolls. - Or: at or below half-strength have +1 to hit rolls and wound rolls."
  }
 ],
 "Indomitor Kill Team": [
  {
   "champ": "strMod",
   "val": 1,
   "port": "T",
   "nom": "Doctrines Indomitor",
   "quand": "La cible est l'unité ennemie éligible la plus proche",
   "texte": "- This unit's ranged attacks that target the closest eligible enemy unit, have +1 S. - If this unit made a charge move this turn, this unit's melee attacks have +1 S."
  },
  {
   "champ": "strMod",
   "val": 1,
   "port": "C",
   "nom": "Doctrines Indomitor",
   "quand": "L'unité a chargé ce tour",
   "texte": "- This unit's ranged attacks that target the closest eligible enemy unit, have +1 S. - If this unit made a charge move this turn, this unit's melee attacks have +1 S."
  }
 ],
 "Talonstrike Kill Team": [
  {
   "champ": "apMod",
   "val": 1,
   "nom": "Doctrines Talonstrike",
   "quand": "L'unité a été posée sur la table ce tour",
   "texte": "In a turn this unit was set up on the battlefield: - This unit's attacks have +1 AP. - This unit's melee attacks have [LANCE]."
  },
  {
   "champ": "wndMod",
   "val": 1,
   "port": "C",
   "nom": "Doctrines Talonstrike — Lance",
   "quand": "L'unité a été posée sur la table ce tour, et elle a chargé",
   "texte": "In a turn this unit was set up on the battlefield: - This unit's attacks have +1 AP. - This unit's melee attacks have [LANCE]."
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
 ],
 "Watch Master": [
  {
   "champ": "rrH",
   "val": "ones",
   "nom": "Maître de Guet",
   "texte": "This model’s attacks that target a Character unit can: - Re-roll hit rolls of 1. - Re-roll wound rolls of 1.",
   "vs": [
    "perso"
   ]
  },
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Maître de Guet",
   "texte": "This model’s attacks that target a Character unit can: - Re-roll hit rolls of 1. - Re-roll wound rolls of 1.",
   "vs": [
    "perso"
   ]
  }
 ]
};
const AURAS_PERSO = {
 "Watch Captain Artemis": [
  {
   "mot": "sust:1",
   "nom": "Instinct Tactique",
   "texte": "This unit's attacks have [Sustained Hits 1]."
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
   "Aggressor Squad",
   "Ancient",
   "Ancient in Terminator Armour",
   "Apothecary",
   "Apothecary Biologis",
   "Assault Intercessor Squad",
   "Assault Intercessors with Jump Packs",
   "Bladeguard Ancient",
   "Bladeguard Veteran Squad",
   "Captain",
   "Captain in Gravis Armour",
   "Captain in Phobos Armour",
   "Captain in Terminator Armour",
   "Captain with Jump Pack",
   "Centurion Assault Squad",
   "Centurion Devastator Squad",
   "Chaplain",
   "Chaplain in Terminator Armour",
   "Chaplain with Jump Pack",
   "Company Heroes",
   "Desolation Squad",
   "Eliminator Squad",
   "Eradicator Squad with Heavy Bolters",
   "Eradicator Squad with Melta Rifles",
   "Heavy Intercessor Squad",
   "Hellblaster Squad",
   "Inceptor Squad",
   "Incursor Squad",
   "Infernus Squad",
   "Infiltrator Squad",
   "Intercessor Squad",
   "Judiciar",
   "Librarian",
   "Librarian in Phobos Armour",
   "Librarian in Terminator Armour",
   "Lieutenant",
   "Lieutenant in Phobos Armour",
   "Lieutenant with Combi-weapon",
   "Reiver Squad",
   "Scout Squad",
   "Sternguard Veteran Squad",
   "Techmarine",
   "Terminator Assault Squad",
   "Terminator Squad",
   "Vanguard Veteran Squad",
   "Vanguard Veteran Squad with Jump Packs"
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
   "Aggressor Squad",
   "Ancient",
   "Ancient in Terminator Armour",
   "Apothecary",
   "Apothecary Biologis",
   "Assault Intercessor Squad",
   "Assault Intercessors with Jump Packs",
   "Bladeguard Ancient",
   "Bladeguard Veteran Squad",
   "Captain",
   "Captain in Gravis Armour",
   "Captain in Phobos Armour",
   "Captain in Terminator Armour",
   "Captain with Jump Pack",
   "Centurion Assault Squad",
   "Centurion Devastator Squad",
   "Chaplain",
   "Chaplain in Terminator Armour",
   "Chaplain with Jump Pack",
   "Company Heroes",
   "Desolation Squad",
   "Eliminator Squad",
   "Eradicator Squad with Heavy Bolters",
   "Eradicator Squad with Melta Rifles",
   "Heavy Intercessor Squad",
   "Hellblaster Squad",
   "Inceptor Squad",
   "Incursor Squad",
   "Infernus Squad",
   "Infiltrator Squad",
   "Intercessor Squad",
   "Judiciar",
   "Librarian",
   "Librarian in Phobos Armour",
   "Librarian in Terminator Armour",
   "Lieutenant",
   "Lieutenant in Phobos Armour",
   "Lieutenant with Combi-weapon",
   "Reiver Squad",
   "Scout Squad",
   "Sternguard Veteran Squad",
   "Techmarine",
   "Terminator Assault Squad",
   "Terminator Squad",
   "Vanguard Veteran Squad",
   "Vanguard Veteran Squad with Jump Packs"
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
   "Aggressor Squad",
   "Apothecary Biologis",
   "Captain in Gravis Armour",
   "Eradicator Squad with Heavy Bolters",
   "Eradicator Squad with Melta Rifles",
   "Heavy Intercessor Squad",
   "Inceptor Squad"
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
  "champ": "rrW",
  "val": "ones",
  "nom": "Embusqués de l'Avant-garde",
  "quand": "L'unité, PHOBOS, était cachée à la fin de ton mouvement",
  "texte": "At the end of your Movement phase, if a friendly Phobos unit is hidden, that unit’s attacks can re-roll wound rolls of 1 until the end of the turn."
 },
 {
  "source": "Watch Master",
  "kw": [
   "Watch Master"
  ],
  "nom": "Proie Purgatus (Meneur)",
  "quand": "L'unité est menée par Watch Master, et la cible est sa proie",
  "texte": "This unit’s attacks that target this unit’s hunted unit can re-roll wound rolls of 1.",
  "champ": "rrW",
  "val": "ones"
 },
 {
  "detach": "Black Spear Task Force",
  "kw": [
   "Deathwatch Terminator Squad",
   "Deathwatch Veterans",
   "Decimus Kill Team",
   "Fortis Kill Team",
   "Indomitor Kill Team",
   "Spectrus Kill Team",
   "Talonstrike Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "mot": "sust",
  "nom": "Tactiques Furor",
  "quand": "L'unité est une KILL TEAM, sous la doctrine Devastator",
  "texte": "Friendly KILL TEAM units with this ability have the following abilities: Furor Tactics: If the devastator doctrine is active for your unit, your unit’s attacks have [SUSTAINED HITS 1]."
 },
 {
  "detach": "Black Spear Task Force",
  "kw": [
   "Deathwatch Terminator Squad",
   "Deathwatch Veterans",
   "Decimus Kill Team",
   "Fortis Kill Team",
   "Indomitor Kill Team",
   "Spectrus Kill Team",
   "Talonstrike Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "mot": "lethal",
  "nom": "Tactiques Malleus",
  "quand": "L'unité est une KILL TEAM, sous la doctrine tactique",
  "texte": "Friendly KILL TEAM units with this ability have the following abilities: Malleus Tactics: If the tactical doctrine is active for your unit, your unit’s attacks have [LETHAL HITS]."
 }
];
const OCTROIS_DETACH = {
 "Ironclad Champions": [
  {
   "champ": "rrH",
   "val": "ones",
   "qui": "unite",
   "kw": [
    "Ballistus Dreadnought",
    "Brutalis Dreadnought",
    "Redemptor Dreadnought",
    "Venerable Dreadnought"
   ],
   "nom": "Vengeance Endurante",
   "texte": "Friendly Adeptus Astartes Dreadnought units can re-roll hit rolls of 1."
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
   "Aggressor Squad",
   "Apothecary Biologis",
   "Captain in Gravis Armour",
   "Eradicator Squad with Heavy Bolters",
   "Eradicator Squad with Melta Rifles",
   "Heavy Intercessor Squad",
   "Inceptor Squad"
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
   "Aggressor Squad",
   "Apothecary Biologis",
   "Captain in Gravis Armour",
   "Eradicator Squad with Heavy Bolters",
   "Eradicator Squad with Melta Rifles",
   "Heavy Intercessor Squad",
   "Inceptor Squad"
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
   "Ballistus Dreadnought",
   "Brutalis Dreadnought",
   "Redemptor Dreadnought",
   "Venerable Dreadnought"
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
   "Ballistus Dreadnought",
   "Brutalis Dreadnought",
   "Redemptor Dreadnought",
   "Venerable Dreadnought"
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
   "Astraeus",
   "Firestrike Servo-Turrets",
   "Gladiator Lancer",
   "Gladiator Reaper",
   "Gladiator Valiant",
   "Invader ATVs",
   "Land Raider",
   "Land Raider Crusader",
   "Land Raider Excelsior",
   "Land Raider Redeemer",
   "Predator Annihilator",
   "Predator Destructor",
   "Repulsor",
   "Repulsor Executioner",
   "Rhino Primaris",
   "Vindicator",
   "Whirlwind"
  ],
  "sauf": [],
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
   "Astraeus",
   "Firestrike Servo-Turrets",
   "Gladiator Lancer",
   "Gladiator Reaper",
   "Gladiator Valiant",
   "Invader ATVs",
   "Land Raider",
   "Land Raider Crusader",
   "Land Raider Excelsior",
   "Land Raider Redeemer",
   "Predator Annihilator",
   "Predator Destructor",
   "Repulsor",
   "Repulsor Executioner",
   "Rhino Primaris",
   "Vindicator",
   "Whirlwind"
  ],
  "sauf": [],
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
   "Ancient",
   "Apothecary",
   "Assault Intercessor Squad",
   "Assault Intercessors with Jump Packs",
   "Bladeguard Ancient",
   "Bladeguard Veteran Squad",
   "Captain",
   "Captain with Jump Pack",
   "Chaplain",
   "Chaplain with Jump Pack",
   "Company Heroes",
   "Desolation Squad",
   "Hellblaster Squad",
   "Infernus Squad",
   "Intercessor Squad",
   "Judiciar",
   "Librarian",
   "Lieutenant",
   "Sternguard Veteran Squad",
   "Techmarine",
   "Vanguard Veteran Squad with Jump Packs"
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
   "Ancient",
   "Apothecary",
   "Assault Intercessor Squad",
   "Assault Intercessors with Jump Packs",
   "Bladeguard Ancient",
   "Bladeguard Veteran Squad",
   "Captain",
   "Captain with Jump Pack",
   "Chaplain",
   "Chaplain with Jump Pack",
   "Company Heroes",
   "Desolation Squad",
   "Hellblaster Squad",
   "Infernus Squad",
   "Intercessor Squad",
   "Judiciar",
   "Librarian",
   "Lieutenant",
   "Sternguard Veteran Squad",
   "Techmarine",
   "Vanguard Veteran Squad with Jump Packs"
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
   "Ancient",
   "Apothecary",
   "Assault Intercessor Squad",
   "Assault Intercessors with Jump Packs",
   "Bladeguard Ancient",
   "Bladeguard Veteran Squad",
   "Captain",
   "Captain with Jump Pack",
   "Chaplain",
   "Chaplain with Jump Pack",
   "Company Heroes",
   "Desolation Squad",
   "Hellblaster Squad",
   "Infernus Squad",
   "Intercessor Squad",
   "Judiciar",
   "Librarian",
   "Lieutenant",
   "Sternguard Veteran Squad",
   "Techmarine",
   "Vanguard Veteran Squad with Jump Packs"
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
   "Ancient",
   "Apothecary",
   "Assault Intercessor Squad",
   "Assault Intercessors with Jump Packs",
   "Bladeguard Ancient",
   "Bladeguard Veteran Squad",
   "Captain",
   "Captain with Jump Pack",
   "Chaplain",
   "Chaplain with Jump Pack",
   "Company Heroes",
   "Desolation Squad",
   "Hellblaster Squad",
   "Infernus Squad",
   "Intercessor Squad",
   "Judiciar",
   "Librarian",
   "Lieutenant",
   "Sternguard Veteran Squad",
   "Techmarine",
   "Vanguard Veteran Squad with Jump Packs"
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
   "Ancient",
   "Apothecary",
   "Assault Intercessor Squad",
   "Assault Intercessors with Jump Packs",
   "Bladeguard Ancient",
   "Bladeguard Veteran Squad",
   "Captain",
   "Captain with Jump Pack",
   "Chaplain",
   "Chaplain with Jump Pack",
   "Company Heroes",
   "Desolation Squad",
   "Hellblaster Squad",
   "Infernus Squad",
   "Intercessor Squad",
   "Judiciar",
   "Librarian",
   "Lieutenant",
   "Sternguard Veteran Squad",
   "Techmarine",
   "Vanguard Veteran Squad with Jump Packs"
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
   "Ancient in Terminator Armour",
   "Captain in Terminator Armour",
   "Chaplain in Terminator Armour",
   "Librarian in Terminator Armour",
   "Terminator Assault Squad",
   "Terminator Squad"
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
  "nom": "Dragonfire Rounds",
  "detach": "Black Spear Task Force",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Deathwatch Terminator Squad",
   "Deathwatch Veterans",
   "Decimus Kill Team",
   "Fortis Kill Team",
   "Indomitor Kill Team",
   "Spectrus Kill Team",
   "Talonstrike Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "sauf": [],
  "aide": "relance des 1 pour blesser et [IGNORE LE COUVERT]",
  "effet": {
   "rrW": "ones",
   "ignoresCover": true
  }
 },
 {
  "nom": "Hellfire Rounds",
  "detach": "Black Spear Task Force",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Deathwatch Terminator Squad",
   "Deathwatch Veterans",
   "Decimus Kill Team",
   "Fortis Kill Team",
   "Indomitor Kill Team",
   "Spectrus Kill Team",
   "Talonstrike Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "sauf": [],
  "aide": "[ANTI-non-VÉHICULE 4+] : blessure critique sur 4+ — contre une cible qui n'est pas un VÉHICULE",
  "effet": {
   "critW": 4
  }
 },
 {
  "nom": "Kraken Rounds",
  "detach": "Black Spear Task Force",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Deathwatch Terminator Squad",
   "Deathwatch Veterans",
   "Decimus Kill Team",
   "Fortis Kill Team",
   "Indomitor Kill Team",
   "Spectrus Kill Team",
   "Talonstrike Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "sauf": [],
  "aide": "+1 en Force (et +6\" de portée)",
  "effet": {
   "strMod": 1
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
  cle : "deathwatch",
  nom : "Deathwatch",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
