/* ============================================================
   Données Space Wolves — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py spacewolves

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
     99 fiches sur 123 en ont un. Les autres — des Legends, que le
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
  ["Arjac Rockfist",6,6,2,4,6,[1],{"1": 105},0,"Meneur",0,"",1,"6+"],
  ["Assault Intercessor Squad",6,5,3,0,2,[5, 10],{"5": 85, "10": 170},0,"",0,"",2,"6+"],
  ["Assault Intercessors with Jump Packs",12,5,3,0,2,[5, 10],[[1, {"5": 95, "10": 190}], [3, {"5": 105, "10": 200}]],0,"",0,"",1,"6+"],
  ["Astraeus",10,12,2,5,24,[1],[[1, {"1": 550}], [2, {"1": 650}]],0,"",0,"",8,"6+"],
  ["Ballistus Dreadnought",8,10,2,0,12,[1],[[1, {"1": 150}], [3, {"1": 170}]],0,"",0,"",4,"6+"],
  ["Bjorn the Fell-Handed",9,10,2,5,8,[1],{"1": 160},0,"",0,"",3,"6+"],
  ["Bladeguard Ancient",6,5,3,4,4,[1],{"1": 70},0,"Appui",0,"",3,"6+"],
  ["Bladeguard Veteran Squad",6,5,3,4,3,[3, 6],[[1, {"3": 90, "6": 180}], [3, {"3": 110, "6": 200}]],0,"",0,"",1,"6+"],
  ["Blood Claws",7,5,3,0,2,[10, 20],{"10": 150, "20": 290},0,"",0,"",2,"6+"],
  ["Brutalis Dreadnought",10,10,2,0,12,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",4,"6+"],
  ["Canis Wolfborn",10,6,3,0,6,[1],{"1": 75},0,"",1,"",2,"6+"],
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
  ["Cyberwolf",10,4,6,6,2,[1],{"1": 20},0,"",1,"",0,"7+"],
  ["Desolation Squad",6,5,3,0,2,[5],[[1, {"5": 140}], [3, {"5": 150}]],0,"",0,"",1,"6+"],
  ["Dreadnought",6,9,2,0,8,[1],{"1": 135},0,"",1,"",3,"6+"],
  ["Drop Pod",0,7,3,0,8,[1],[[1, {"1": 60}], [4, {"1": 70}]],0,"",0,"",0,"6+"],
  ["Eliminator Squad",8,4,3,0,2,[3],{"3": 85},0,"",0,"",1,"6+"],
  ["Eradicator Squad with Heavy Bolters",5,6,3,0,3,[3, 6],[[1, {"3": 100, "6": 215}], [3, {"3": 130, "6": 245}]],0,"",0,"",1,"6+"],
  ["Eradicator Squad with Melta Rifles",5,6,3,0,3,[3, 6],[[1, {"3": 100, "6": 200}], [3, {"3": 120, "6": 220}]],0,"",0,"",1,"6+"],
  ["Fenrisian Wolves",10,4,6,0,1,[5, 10],[[1, {"5": 45, "10": 75}], [3, {"5": 50, "10": 80}]],0,"",0,"",0,"8+"],
  ["Firestrike Servo-Turrets",5,6,2,0,6,[1, 2],{"1": 80, "2": 160},0,"",0,"",2,"6+"],
  ["Gladiator Lancer",10,10,3,0,12,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",3,"6+"],
  ["Gladiator Reaper",10,10,3,0,12,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",3,"6+"],
  ["Gladiator Valiant",10,10,3,0,12,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",3,"6+"],
  ["Grey Hunters",7,5,3,0,2,[10],{"10": 180},0,"",0,"",3,"6+"],
  ["Hammerfall Bunker",0,12,2,0,14,[1],{"1": 175},0,"",1,"",0,"6+"],
  ["Harald Deathwolf",10,6,3,4,7,[1],{"1": 85},0,"",1,"",2,"6+"],
  ["Heavy Intercessor Squad",5,6,3,0,3,[5, 10],{"5": 115, "10": 230},0,"",0,"",2,"6+"],
  ["Hellblaster Squad",6,5,3,0,2,[5, 10],[[1, {"5": 115, "10": 230}], [3, {"5": 130, "10": 245}]],0,"",0,"",1,"6+"],
  ["Hounds of Morkai",6,4,3,6,2,[5, 10],{"5": 95, "10": 190},0,"",1,"",1,"6+"],
  ["Impulsor",12,9,3,0,11,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Inceptor Squad",10,6,3,0,3,[3, 6],[[1, {"3": 130, "6": 260}], [3, {"3": 150, "6": 280}]],0,"",0,"",1,"6+"],
  ["Incursor Squad",8,4,3,0,2,[5, 10],[[1, {"5": 90, "10": 170}], [3, {"5": 100, "10": 180}]],0,"",0,"",1,"6+"],
  ["Infernus Squad",6,5,3,0,2,[5, 10],[[1, {"5": 95, "10": 190}], [3, {"5": 105, "10": 200}]],0,"",0,"",1,"6+"],
  ["Infiltrator Squad",8,4,3,0,2,[5, 10],{"5": 85, "10": 150},0,"",0,"",1,"6+"],
  ["Intercessor Squad",6,5,3,0,2,[5, 10],{"5": 85, "10": 170},0,"",0,"",2,"6+"],
  ["Invader ATVs",10,6,3,0,8,[1, 2],[[1, {"1": 65, "2": 130}], [3, {"1": 75, "2": 140}]],0,"",0,"",2,"6+"],
  ["Invictor Tactical Warsuit",10,9,3,0,12,[1],[[1, {"1": 135}], [3, {"1": 150}]],0,"",0,"",4,"6+"],
  ["Iron Priest",7,5,2,0,4,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Judiciar",6,5,3,4,4,[1],{"1": 50},0,"Appui",0,"",1,"6+"],
  ["Krom Dragongaze",6,4,3,4,4,[1],{"1": 65},0,"Meneur",1,"",1,"6+"],
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
  ["Logan Grimnar",6,6,2,4,8,[1],{"1": 150},0,"Meneur",0,"",1,"6+"],
  ["Logan Grimnar on Stormrider",10,6,2,4,12,[1],{"1": 180},0,"",1,"",4,"6+"],
  ["Long Fangs",6,4,3,0,2,[5, 6],{"5": 120, "6": 145},0,"",1,"",1,"6+"],
  ["Lukas the Trickster",6,4,3,0,4,[1],{"1": 50},0,"",1,"",1,"6+"],
  ["Murderfang",9,9,2,0,8,[1],{"1": 150},0,"",0,"",0,"6+"],
  ["Njal Stormcaller",7,5,3,4,4,[1],{"1": 100},0,"Meneur",0,"",1,"6+"],
  ["Outrider Squad",12,6,3,0,4,[3, 6],{"3": 80, "6": 160},0,"",0,"",2,"6+"],
  ["Predator Annihilator",10,10,3,0,11,[1],[[1, {"1": 135}], [3, {"1": 145}]],0,"",1,"",3,"6+"],
  ["Predator Destructor",10,10,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",1,"",3,"6+"],
  ["Ragnar Blackmane",7,5,3,4,5,[1],{"1": 100},0,"Meneur",0,"",1,"6+"],
  ["Razorback",12,9,3,0,10,[1],{"1": 95},0,"",1,"",2,"6+"],
  ["Redemptor Dreadnought",8,10,2,0,12,[1],[[1, {"1": 170}], [3, {"1": 190}]],0,"",0,"",4,"6+"],
  ["Reiver Squad",8,4,3,0,2,[5, 10],{"5": 85, "10": 165},0,"",0,"",1,"6+"],
  ["Relic Razorback",12,9,3,0,10,[1],{"1": 105},0,"",1,"",2,"6+"],
  ["Repulsor",10,12,3,0,16,[1],[[1, {"1": 190}], [3, {"1": 210}]],0,"",0,"",5,"6+"],
  ["Repulsor Executioner",10,12,3,0,16,[1],[[1, {"1": 260}], [3, {"1": 280}]],0,"",0,"",5,"6+"],
  ["Rhino",12,9,3,0,10,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Rhino Primaris",12,9,3,0,10,[1],{"1": 95},0,"",1,"",3,"6+"],
  ["Scout Bike Squad",12,5,4,0,3,[3, 6],{"3": 75, "6": 150},0,"",1,"",2,"6+"],
  ["Scout Squad",6,4,4,0,2,[5, 10],{"5": 65, "10": 120},0,"",0,"",1,"6+"],
  ["Skyclaws",12,4,3,0,2,[5, 10, 15],{"5": 90, "10": 165, "15": 240},0,"",1,"",1,"6+"],
  ["Sternguard Veteran Squad",6,5,3,0,2,[5, 10],[[1, {"5": 105, "10": 210}], [3, {"5": 120, "10": 225}]],0,"",0,"",1,"6+"],
  ["Storm Speeder Hailstrike",14,9,3,0,11,[1],[[1, {"1": 110}], [3, {"1": 120}]],0,"",0,"",3,"6+"],
  ["Storm Speeder Hammerstrike",14,9,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Storm Speeder Thunderstrike",14,9,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Stormfang Gunship",20,10,3,0,14,[1],{"1": 300},0,"",1,"",0,"6+"],
  ["Stormhawk Interceptor",0,9,3,0,10,[1],{"1": 155},0,"",1,"",0,"6+"],
  ["Stormraven Gunship",14,10,3,0,14,[1],[[1, {"1": 280}], [2, {"1": 300}]],0,"",1,"",0,"6+"],
  ["Stormtalon Gunship",0,8,3,0,10,[1],{"1": 165},0,"",1,"",0,"6+"],
  ["Stormwolf",20,10,3,0,14,[1],{"1": 250},0,"",1,"",0,"6+"],
  ["Techmarine",6,5,2,0,4,[1],{"1": 55},0,"Meneur",0,"",1,"6+"],
  ["Terminator Assault Squad",5,6,2,4,4,[5, 10],[[1, {"5": 170, "10": 340}], [3, {"5": 210, "10": 380}]],0,"",0,"",1,"6+"],
  ["Terminator Squad",5,6,2,4,3,[5, 10],[[1, {"5": 190, "10": 380}], [3, {"5": 230, "10": 420}]],0,"",0,"",1,"6+"],
  ["Thunderhawk Gunship",20,12,2,0,30,[1],[[1, {"1": 850}], [2, {"1": 950}]],0,"",0,"",0,"6+"],
  ["Thunderwolf Cavalry",12,6,3,0,4,[3, 6],[[1, {"3": 115, "6": 230}], [3, {"3": 145, "6": 260}]],0,"",0,"",2,"6+"],
  ["Ulrik the Slayer",7,5,3,4,4,[1],{"1": 90},0,"Meneur",0,"",1,"5+"],
  ["Vanguard Veteran Squad",6,4,3,0,2,[5, 10],{"5": 120, "10": 240},0,"",1,"",1,"6+"],
  ["Vanguard Veteran Squad with Jump Packs",12,5,3,0,2,[5, 10],[[1, {"5": 110, "10": 220}], [3, {"5": 130, "10": 240}]],0,"",0,"",1,"6+"],
  ["Venerable Dreadnought",8,9,2,0,8,[1],{"1": 165},0,"",1,"",3,"6+"],
  ["Vindicator",9,11,2,0,11,[1],[[1, {"1": 185}], [3, {"1": 200}]],0,"",1,"",3,"6+"],
  ["Whirlwind",10,10,3,0,11,[1],[[1, {"1": 175}], [2, {"1": 195}]],0,"",1,"",3,"6+"],
  ["Wolf Guard",6,4,3,0,2,[5, 10],{"5": 85, "10": 170},0,"",1,"",1,"5+"],
  ["Wolf Guard Battle Leader",7,5,3,4,5,[1],{"1": 80},0,"Meneur",0,"",1,"6+"],
  ["Wolf Guard Battle Leader in Terminator Armour",5,5,2,4,5,[1],{"1": 75},0,"",1,"",1,"6+"],
  ["Wolf Guard Battle Leader on Thunderwolf",10,6,3,0,5,[1],{"1": 80},0,"",1,"",2,"6+"],
  ["Wolf Guard Headtakers",10,4,6,0,1,[3, 6, 12],[[1, {"3": 85, "6": 170, "12": 230}], [3, {"3": 95, "6": 180, "12": 240}]],0,"",0,"",0,"8+"],
  ["Wolf Guard Pack Leader",6,4,3,0,2,[1],{"1": 30},0,"Appui",1,"",1,"6+"],
  ["Wolf Guard Pack Leader in Terminator Armour",5,5,2,0,3,[1],{"1": 40},0,"Appui",1,"",1,"6+"],
  ["Wolf Guard Pack Leader with Jump Pack",12,4,3,0,2,[1],{"1": 35},0,"Appui",1,"",1,"6+"],
  ["Wolf Guard Terminators",6,6,2,4,3,[5, 10],[[1, {"5": 180, "10": 365}], [3, {"5": 220, "10": 405}]],0,"",0,"",1,"6+"],
  ["Wolf Lord on Thunderwolf",10,6,3,4,6,[1],{"1": 100},0,"",1,"",2,"6+"],
  ["Wolf Priest",7,5,3,4,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Wolf Scouts",6,4,4,0,2,[6, 12],[[1, {"6": 95, "12": 190}], [3, {"6": 105, "12": 200}]],0,"",0,"",1,"6+"],
  ["Wulfen",9,6,4,0,2,[5, 10],[[1, {"5": 90, "10": 180}], [3, {"5": 105, "10": 195}]],0,"",0,"",0,"7+"],
  ["Wulfen Dreadnought",9,9,2,0,8,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",0,"6+"],
  ["Wulfen with Storm Shields",9,6,4,4,2,[5, 10],[[1, {"5": 125, "10": 250}], [3, {"5": 155, "10": 280}]],0,"",0,"",0,"7+"]
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
  ["Arjac Rockfist","Foehammer (tir)","T","1",2,10,2,"3","assault","9\""],
  ["Arjac Rockfist","Foehammer (càc)","C","5",2,10,2,"3","precision","càc"],
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
  ["Bjorn the Fell-Handed","Assault cannon","T","6",3,6,2,"1","sust:1","24\""],
  ["Bjorn the Fell-Handed","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Bjorn the Fell-Handed","Multi-melta","T","2",2,10,3,"D3+2","melta:3","18\""],
  ["Bjorn the Fell-Handed","➤ Helfrost cannon - dispersed","T","3",0,6,1,"2","torrent","12\""],
  ["Bjorn the Fell-Handed","➤ Helfrost cannon - focused","T","1",2,10,3,"5","","36\""],
  ["Bjorn the Fell-Handed","Trueclaw","C","6",2,12,2,"3","lethal","càc"],
  ["Bladeguard Ancient","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Bladeguard Ancient","Relics of Battle","C","4",3,5,2,"2","","càc"],
  ["Bladeguard Veteran Squad","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Bladeguard Veteran Squad","Neo-volkite Pistol","T","1",3,5,0,"2","dev","12\""],
  ["Bladeguard Veteran Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Bladeguard Veteran Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Bladeguard Veteran Squad","Master-crafted power weapon","C","4",3,5,2,"2","","càc"],
  ["Blood Claws","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Blood Claws","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Blood Claws","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Blood Claws","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Blood Claws","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Brutalis Dreadnought","Bolt Rifles","T","4",3,5,1,"1","twin","24\""],
  ["Brutalis Dreadnought","Twin Icarus ironhail heavy stubber","T","3",3,4,1,"1","anti:3:vol rf:3 twin","36\""],
  ["Brutalis Dreadnought","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Brutalis Dreadnought","Twin multi-melta","T","2",3,10,3,"D3+2","melta:3 twin","18\""],
  ["Brutalis Dreadnought","Brutalis Fists","C","6",3,12,3,"D3+3","twin","càc"],
  ["Brutalis Dreadnought","Brutalis Talons","C","8",3,10,2,"2","sust:1 twin","càc"],
  ["Canis Wolfborn","Bolt pistol","T","1",5,4,0,"1","pistol","12\""],
  ["Canis Wolfborn","Teeth and claws","C","3",4,5,1,"1","extra","càc"],
  ["Canis Wolfborn","Wolf claws","C","8",2,5,2,"1","twin","càc"],
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
  ["Cyberwolf","Teeth and claws","C","4",4,4,0,"1","","càc"],
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
  ["Fenrisian Wolves","Teeth and claws","C","3",4,4,0,"1","","càc"],
  ["Firestrike Servo-Turrets","Twin Firestrike Autocannon","T","4",2,9,1,"3","rf:2 twin","48\""],
  ["Firestrike Servo-Turrets","Twin Firestrike Las-talon","T","2",2,10,3,"D3+3","twin","36\""],
  ["Firestrike Servo-Turrets","Hovering Bulk","C","3",3,5,0,"1","","càc"],
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
  ["Grey Hunters","Bolt Carbine","T","3",3,5,1,"1","assault rf:1","24\""],
  ["Grey Hunters","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Grey Hunters","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Grey Hunters","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Grey Hunters","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Grey Hunters","Power fist","C","3",3,8,2,"2","","càc"],
  ["Grey Hunters","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Hammerfall Bunker","Hammerfall Heavy Bolter Array","T","6",4,5,1,"2","sust:1 twin","36\""],
  ["Hammerfall Bunker","Hammerfall Heavy Flamer Array","T","2D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Hammerfall Bunker","➤ Hammerfall Missile Launcher - Superfrag","T","2d6+2",4,5,0,"1","blast","48\""],
  ["Hammerfall Bunker","➤ Hammerfall Missile Launcher - Superkrak","T","2",4,10,2,"D6+1","","48\""],
  ["Harald Deathwolf","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Harald Deathwolf","Crushing teeth and claws","C","3",3,5,1,"1","extra","càc"],
  ["Harald Deathwolf","Glacius","C","6",2,6,2,"2","","càc"],
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
  ["Hounds of Morkai","Morkai bolt pistol","T","1",3,4,1,"1","anti:4 dev pistol precision","12\""],
  ["Hounds of Morkai","Morkai combat knife","C","4",3,4,0,"1","anti:4 dev precision","càc"],
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
  ["Iron Priest","➤ Helfrost pistol - dispersed","T","3",0,4,1,"1","torrent","12\""],
  ["Iron Priest","➤ Helfrost pistol - focused","T","1",2,6,3,"3","","12\""],
  ["Iron Priest","Tempest hammer and Servo-arm","C","4",4,8,2,"3","","càc"],
  ["Judiciar","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Judiciar","Executioner Relic Blade","C","5",2,7,2,"2","dev precision","càc"],
  ["Krom Dragongaze","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Krom Dragongaze","Wyrmclaw","C","6",2,7,2,"2","lethal","càc"],
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
  ["Logan Grimnar","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Logan Grimnar","Tyrnak and Fenrir","C","6",2,5,1,"1","extra","càc"],
  ["Logan Grimnar","➤ Axe Morkai - Strike","C","6",2,10,2,"3","","càc"],
  ["Logan Grimnar","➤ Axe Morkai - Sweep","C","10",2,6,2,"1","","càc"],
  ["Logan Grimnar on Stormrider","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Logan Grimnar on Stormrider","Flurry of teeth and claws","C","6",4,5,1,"1","extra","càc"],
  ["Logan Grimnar on Stormrider","➤ Axe Morkai - Strike","C","6",2,8,2,"3","","càc"],
  ["Logan Grimnar on Stormrider","➤ Axe Morkai - Sweep","C","10",2,6,2,"1","","càc"],
  ["Long Fangs","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Long Fangs","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Long Fangs","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Long Fangs","Grav-cannon","T","3",4,6,1,"3","anti:2:veh heavy","24\""],
  ["Long Fangs","Grav-gun","T","2",3,5,1,"2","anti:2:veh","18\""],
  ["Long Fangs","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Long Fangs","Heavy flamer","T","D6",0,5,1,"1","heavy ignorescover torrent","12\""],
  ["Long Fangs","Lascannon","T","1",4,12,3,"D6+1","heavy","48\""],
  ["Long Fangs","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Long Fangs","Multi-melta","T","2",4,9,4,"D6","heavy melta:2","18\""],
  ["Long Fangs","➤ Missile launcher - frag","T","D6",4,4,0,"1","blast heavy","48\""],
  ["Long Fangs","➤ Missile launcher - krak","T","1",4,9,2,"D6","heavy","48\""],
  ["Long Fangs","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast heavy","36\""],
  ["Long Fangs","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous heavy","36\""],
  ["Long Fangs","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Long Fangs","➤ Plasma gun - supercharge","T","1",3,8,3,"2","rf:1 hazardous","24\""],
  ["Long Fangs","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Long Fangs","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Long Fangs","Astartes Chainsword","C","3",3,4,1,"1","","càc"],
  ["Long Fangs","Close combat weapon","C","2",3,4,0,"1","","càc"],
  ["Long Fangs","Power fist","C","2",3,8,2,"2","","càc"],
  ["Long Fangs","Power weapon","C","2",3,5,2,"1","","càc"],
  ["Lukas the Trickster","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Lukas the Trickster","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Lukas the Trickster","Claw of the Jackalwolf","C","6",2,5,2,"1","","càc"],
  ["Murderfang","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Murderfang","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Murderfang","Murderclaws","C","8",3,14,2,"3","sust:1 twin","càc"],
  ["Njal Stormcaller","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Njal Stormcaller","➤ Living Lightning - focused witchfire","T","D6+6",3,7,2,"1","hazardous psychic sust:2","24\""],
  ["Njal Stormcaller","➤ Living Lightning - witchfire","T","D3+3",3,7,1,"1","psychic sust:2","24\""],
  ["Njal Stormcaller","Staff of the Stormcaller","C","4",3,7,1,"2","psychic sust:2","càc"],
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
  ["Ragnar Blackmane","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Ragnar Blackmane","Frostfang","C","8",2,6,3,"2","sust:1","càc"],
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
  ["Scout Squad","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Scout Squad","Boltgun","T","1",3,5,1,"1","rf:1","24\""],
  ["Scout Squad","Heavy Bolter","T","3",4,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Scout Squad","Shotgun","T","2",3,4,1,"1","assault","18\""],
  ["Scout Squad","Sniper Rifle","T","1",3,5,2,"2","heavy precision","36\""],
  ["Scout Squad","➤ Missile Launcher - Frag","T","4",4,4,1,"1","heavy","48\""],
  ["Scout Squad","➤ Missile Launcher - Krak","T","1",4,10,2,"D3+3","","48\""],
  ["Scout Squad","Chainsword","C","4",3,4,1,"1","","càc"],
  ["Scout Squad","Combat Knife","C","3",3,4,1,"1","","càc"],
  ["Skyclaws","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Skyclaws","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Skyclaws","Grav-gun","T","2",3,5,1,"2","anti:2:veh","18\""],
  ["Skyclaws","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Skyclaws","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Skyclaws","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Skyclaws","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Skyclaws","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Skyclaws","Astartes Chainsword","C","3",3,4,1,"1","","càc"],
  ["Skyclaws","Close combat weapon","C","2",3,4,0,"1","","càc"],
  ["Skyclaws","Power fist","C","2",3,8,2,"2","","càc"],
  ["Skyclaws","Power weapon","C","3",3,5,2,"1","","càc"],
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
  ["Stormfang Gunship","Skyhammer Missile Launcher","T","3",3,8,1,"D3","anti:2:vol","48\""],
  ["Stormfang Gunship","Twin multi-melta","T","2",3,9,4,"D6","melta:2 twin","18\""],
  ["Stormfang Gunship","Twin stormstrike missile launcher","T","1",3,10,2,"3","twin","48\""],
  ["Stormfang Gunship","➤ Helfrost destructor - dispersed","T","D3",3,11,3,"7","sust:D3","36\""],
  ["Stormfang Gunship","➤ Helfrost destructor - focused","T","D6+6",0,8,1,"2","torrent","12\""],
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
  ["Stormwolf","Skyhammer Missile Launcher","T","3",3,8,1,"D3","anti:2:vol","48\""],
  ["Stormwolf","Twin multi-melta","T","2",3,9,4,"D6","melta:2 twin","18\""],
  ["Stormwolf","➤ Twin helfrost cannon - dispersed","T","D6",0,6,1,"2","torrent twin","12\""],
  ["Stormwolf","➤ Twin helfrost cannon - focused","T","1",3,9,3,"5","twin","36\""],
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
  ["Thunderhawk Gunship","Hellstrike missile battery","T","4",3,8,2,"3","anti:4:vol","72\""],
  ["Thunderhawk Gunship","Thunderhawk heavy cannon","T","D6+6",3,10,2,"3","blast","48\""],
  ["Thunderhawk Gunship","Turbo-laser destructor","T","D3+1",3,20,4,"D6+6","blast","96\""],
  ["Thunderhawk Gunship","Twin heavy bolter","T","3",3,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Thunderwolf Cavalry","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Thunderwolf Cavalry","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Thunderwolf Cavalry","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Thunderwolf Cavalry","Teeth and claws","C","3",4,5,1,"1","extra","càc"],
  ["Thunderwolf Cavalry","Wolf Guard Weapon","C","4",3,5,2,"2","","càc"],
  ["Ulrik the Slayer","➤ Plasma pistol - standard","T","1",2,7,2,"1","","12\""],
  ["Ulrik the Slayer","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous","12\""],
  ["Ulrik the Slayer","Artificer Crozius Arcanum","C","5",2,6,2,"2","","càc"],
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
  ["Venerable Dreadnought","Assault Cannon","T","6",3,6,2,"1","sust:1","24\""],
  ["Venerable Dreadnought","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Venerable Dreadnought","Multi-melta","T","2",3,10,3,"D3+2","melta:3","18\""],
  ["Venerable Dreadnought","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Venerable Dreadnought","➤ Helfrost cannon - dispersed","T","3",0,6,1,"2","torrent","12\""],
  ["Venerable Dreadnought","➤ Helfrost cannon - focused","T","1",3,10,3,"5","","36\""],
  ["Venerable Dreadnought","Dreadnought Combat Weapon","C","5",3,12,2,"3","","càc"],
  ["Venerable Dreadnought","➤ Fenrisian great axe - strike","C","6",3,10,2,"D3+3","","càc"],
  ["Venerable Dreadnought","➤ Fenrisian great axe - sweep","C","12",3,6,2,"1","","càc"],
  ["Vindicator","Demolisher Cannon","T","D6+3",3,14,3,"D6","blast","24\""],
  ["Vindicator","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Vindicator","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Vindicator","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Whirlwind","Hunter-killer missile","T","1",2,14,3,"D3+3","oneshot","48\""],
  ["Whirlwind","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Whirlwind","Whirlwind Vengeance Launcher","T","D6+3",3,8,2,"2","blast indirect","72\""],
  ["Whirlwind","Armoured Tracks","C","3",4,6,0,"1","","càc"],
  ["Wolf Guard","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Wolf Guard","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Wolf Guard","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Wolf Guard","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Wolf Guard","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Wolf Guard","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Wolf Guard","Heirloom weapon","C","4",3,5,1,"1","","càc"],
  ["Wolf Guard Battle Leader","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Wolf Guard Battle Leader","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Wolf Guard Battle Leader","Master-crafted Power Weapon","C","7",2,6,2,"2","","càc"],
  ["Wolf Guard Battle Leader","Thunder Hammer","C","5",3,8,2,"3","dev","càc"],
  ["Wolf Guard Battle Leader in Terminator Armour","Combi-weapon","T","1",3,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Wolf Guard Battle Leader in Terminator Armour","Storm bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Wolf Guard Battle Leader in Terminator Armour","Chainfist","C","4",3,8,2,"2","anti:3:veh","càc"],
  ["Wolf Guard Battle Leader in Terminator Armour","Close combat weapon","C","5",3,4,0,"1","","càc"],
  ["Wolf Guard Battle Leader in Terminator Armour","Power fist","C","4",2,8,2,"2","","càc"],
  ["Wolf Guard Battle Leader in Terminator Armour","Power weapon","C","5",2,5,2,"1","","càc"],
  ["Wolf Guard Battle Leader in Terminator Armour","Thunder hammer","C","4",3,8,2,"2","dev","càc"],
  ["Wolf Guard Battle Leader in Terminator Armour","Twin lightning claws","C","6",2,5,2,"1","twin","càc"],
  ["Wolf Guard Battle Leader on Thunderwolf","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Wolf Guard Battle Leader on Thunderwolf","Combi-weapon","T","1",3,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Wolf Guard Battle Leader on Thunderwolf","Master-crafted boltgun","T","2",2,4,0,"2","","24\""],
  ["Wolf Guard Battle Leader on Thunderwolf","Storm bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Wolf Guard Battle Leader on Thunderwolf","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Wolf Guard Battle Leader on Thunderwolf","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Wolf Guard Battle Leader on Thunderwolf","Close combat weapon","C","6",3,4,0,"1","","càc"],
  ["Wolf Guard Battle Leader on Thunderwolf","Power fist","C","4",2,8,2,"2","","càc"],
  ["Wolf Guard Battle Leader on Thunderwolf","Relic weapon","C","5",2,5,2,"2","","càc"],
  ["Wolf Guard Battle Leader on Thunderwolf","Teeth and claws","C","3",4,5,1,"1","extra","càc"],
  ["Wolf Guard Battle Leader on Thunderwolf","Thunder hammer","C","4",3,8,2,"2","dev","càc"],
  ["Wolf Guard Battle Leader on Thunderwolf","Twin lightning claws","C","6",2,5,2,"1","twin","càc"],
  ["Wolf Guard Headtakers","Heavy Bolt Pistol","T","1",3,5,1,"1","","18\""],
  ["Wolf Guard Headtakers","Master-crafted Power Weapon","C","4",3,5,2,"2","","càc"],
  ["Wolf Guard Headtakers","Paired Master-crafted Power Weapons","C","6",3,5,2,"2","","càc"],
  ["Wolf Guard Headtakers","Teeth and Claws","C","3",4,4,0,"1","","càc"],
  ["Wolf Guard Pack Leader","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Wolf Guard Pack Leader","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Wolf Guard Pack Leader","Combi-weapon","T","1",3,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Wolf Guard Pack Leader","Storm Bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Wolf Guard Pack Leader","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Wolf Guard Pack Leader","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Wolf Guard Pack Leader","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Wolf Guard Pack Leader","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Wolf Guard Pack Leader","Power fist","C","2",3,8,2,"2","","càc"],
  ["Wolf Guard Pack Leader","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Wolf Guard Pack Leader","Thunder Hammer","C","2",4,8,2,"3","dev","càc"],
  ["Wolf Guard Pack Leader","Twin lightning claws","C","4",3,5,2,"1","twin","càc"],
  ["Wolf Guard Pack Leader in Terminator Armour","Assault Cannon","T","6",3,6,0,"1","dev","24\""],
  ["Wolf Guard Pack Leader in Terminator Armour","Combi-weapon","T","1",3,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Wolf Guard Pack Leader in Terminator Armour","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Wolf Guard Pack Leader in Terminator Armour","Storm Bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Wolf Guard Pack Leader in Terminator Armour","➤ Cyclone missile launcher - frag","T","2D6",3,4,0,"1","blast","36\""],
  ["Wolf Guard Pack Leader in Terminator Armour","➤ Cyclone missile launcher - krak","T","2",3,9,2,"D6","","36\""],
  ["Wolf Guard Pack Leader in Terminator Armour","Power fist","C","3",3,8,2,"2","","càc"],
  ["Wolf Guard Pack Leader in Terminator Armour","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Wolf Guard Pack Leader in Terminator Armour","Thunder Hammer","C","2",4,8,2,"3","dev","càc"],
  ["Wolf Guard Pack Leader in Terminator Armour","Twin lightning claws","C","5",3,5,2,"1","twin","càc"],
  ["Wolf Guard Pack Leader in Terminator Armour","➤ Chainfist - Hunter: Monster/Vehicle","C","3",3,12,2,"3","","càc"],
  ["Wolf Guard Pack Leader in Terminator Armour","➤ Chainfist - Standard","C","2",4,8,2,"2","","càc"],
  ["Wolf Guard Pack Leader with Jump Pack","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Wolf Guard Pack Leader with Jump Pack","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Wolf Guard Pack Leader with Jump Pack","Combi-weapon","T","1",3,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Wolf Guard Pack Leader with Jump Pack","Storm Bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Wolf Guard Pack Leader with Jump Pack","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Wolf Guard Pack Leader with Jump Pack","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Wolf Guard Pack Leader with Jump Pack","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Wolf Guard Pack Leader with Jump Pack","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Wolf Guard Pack Leader with Jump Pack","Power fist","C","2",3,8,2,"2","","càc"],
  ["Wolf Guard Pack Leader with Jump Pack","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Wolf Guard Pack Leader with Jump Pack","Thunder Hammer","C","2",4,8,2,"3","dev","càc"],
  ["Wolf Guard Pack Leader with Jump Pack","Twin lightning claws","C","4",3,5,2,"1","twin","càc"],
  ["Wolf Guard Terminators","Assault Cannon","T","6",3,6,2,"1","sust:1","24\""],
  ["Wolf Guard Terminators","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Wolf Guard Terminators","Master-crafted power weapon","C","4",3,5,2,"2","","càc"],
  ["Wolf Guard Terminators","Power fist","C","3",3,8,2,"2","","càc"],
  ["Wolf Guard Terminators","Relic Great Axe","C","3",3,8,2,"3","dev","càc"],
  ["Wolf Guard Terminators","Twin lightning claws","C","6",3,5,2,"1","twin","càc"],
  ["Wolf Lord on Thunderwolf","Bolt pistol","T","1",2,5,1,"1","","12\""],
  ["Wolf Lord on Thunderwolf","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Wolf Lord on Thunderwolf","Master-crafted boltgun","T","2",2,4,0,"2","","24\""],
  ["Wolf Lord on Thunderwolf","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Wolf Lord on Thunderwolf","➤ Plasma pistol - standard","T","1",3,7,2,"1","","12\""],
  ["Wolf Lord on Thunderwolf","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Wolf Lord on Thunderwolf","Close combat weapon","C","6",3,4,0,"1","","càc"],
  ["Wolf Lord on Thunderwolf","Power fist","C","5",2,8,2,"2","","càc"],
  ["Wolf Lord on Thunderwolf","Relic Weapon","C","6",2,5,2,"2","","càc"],
  ["Wolf Lord on Thunderwolf","Teeth and claws","C","3",4,5,1,"1","extra","càc"],
  ["Wolf Lord on Thunderwolf","Thunder Hammer","C","5",3,8,2,"3","dev","càc"],
  ["Wolf Lord on Thunderwolf","Twin lightning claws","C","7",2,5,2,"1","twin","càc"],
  ["Wolf Priest","Absolvor bolt pistol","T","1",3,5,2,"2","","18\""],
  ["Wolf Priest","Crozius arcanum","C","5",2,6,1,"2","","càc"],
  ["Wolf Scouts","Astartes shotgun","T","2",3,4,0,"1","assault","18\""],
  ["Wolf Scouts","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Wolf Scouts","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Wolf Scouts","Combi-weapon","T","1",3,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Wolf Scouts","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Wolf Scouts","Grav-gun","T","2",3,5,1,"2","anti:2:veh","18\""],
  ["Wolf Scouts","Grav-pistol","T","1",3,4,1,"2","anti:2:veh pistol","12\""],
  ["Wolf Scouts","Hand flamer","T","3",0,4,0,"1","torrent","9\""],
  ["Wolf Scouts","Heavy Bolter","T","3",4,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Wolf Scouts","Inferno Pistol","T","1",3,8,3,"D3+2","melta:1","9\""],
  ["Wolf Scouts","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Wolf Scouts","Storm Bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Wolf Scouts","➤ Missile Launcher - Frag","T","4",4,4,1,"1","heavy","48\""],
  ["Wolf Scouts","➤ Missile Launcher - Krak","T","1",4,10,2,"D3+3","","48\""],
  ["Wolf Scouts","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Wolf Scouts","➤ Plasma gun - supercharge","T","1",3,8,3,"2","rf:1 hazardous","24\""],
  ["Wolf Scouts","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Wolf Scouts","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Wolf Scouts","Chainsword","C","4",3,5,1,"1","","càc"],
  ["Wolf Scouts","Close combat weapon","C","2",3,4,0,"1","","càc"],
  ["Wolf Scouts","Combat knife","C","3",3,5,1,"1","","càc"],
  ["Wolf Scouts","Power fist","C","2",3,8,2,"2","","càc"],
  ["Wolf Scouts","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Wolf Scouts","Thunder Hammer","C","2",4,8,2,"3","dev","càc"],
  ["Wolf Scouts","Twin lightning claws","C","4",3,5,2,"1","twin","càc"],
  ["Wulfen","Stormfrag auto-launcher","T","2",4,4,1,"1","assault","12\""],
  ["Wulfen","Wulfen Weapons","C","3",3,6,2,"2","sust:1","càc"],
  ["Wulfen Dreadnought","Heavy Flamer","T","3",0,5,1,"1","torrent","12\""],
  ["Wulfen Dreadnought","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Wulfen Dreadnought","Great wolf claw","C","6",3,10,3,"3","","càc"],
  ["Wulfen Dreadnought","➤ Fenrisian great axe - strike","C","6",3,10,2,"D3+3","","càc"],
  ["Wulfen Dreadnought","➤ Fenrisian great axe - sweep","C","12",3,6,2,"1","","càc"],
  ["Wulfen with Storm Shields","Stormfrag auto-launcher","T","2",4,4,1,"1","assault","12\""],
  ["Wulfen with Storm Shields","➤ Thunder Hammer","C","2",3,8,2,"3","dev","càc"],
  ["Wulfen with Storm Shields","➤ Thunder Hammer (Hunter: Monster/Vehicle)","C","3",3,10,3,"3","dev","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Aggressor Squad","Infanterie"],
  ["Ancient","Personnage"],
  ["Ancient in Terminator Armour","Personnage"],
  ["Arjac Rockfist","Epic Hero"],
  ["Assault Intercessor Squad","Battleline"],
  ["Assault Intercessors with Jump Packs","Infanterie"],
  ["Astraeus","Véhicule"],
  ["Ballistus Dreadnought","Véhicule"],
  ["Bjorn the Fell-Handed","Epic Hero"],
  ["Bladeguard Ancient","Personnage"],
  ["Bladeguard Veteran Squad","Infanterie"],
  ["Blood Claws","Battleline"],
  ["Brutalis Dreadnought","Véhicule"],
  ["Canis Wolfborn","Epic Hero"],
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
  ["Cyberwolf","Personnage"],
  ["Desolation Squad","Infanterie"],
  ["Dreadnought","Véhicule"],
  ["Drop Pod","Véhicule"],
  ["Eliminator Squad","Infanterie"],
  ["Eradicator Squad with Heavy Bolters","Infanterie"],
  ["Eradicator Squad with Melta Rifles","Infanterie"],
  ["Fenrisian Wolves","Bête"],
  ["Firestrike Servo-Turrets","Véhicule"],
  ["Gladiator Lancer","Véhicule"],
  ["Gladiator Reaper","Véhicule"],
  ["Gladiator Valiant","Véhicule"],
  ["Grey Hunters","Battleline"],
  ["Hammerfall Bunker","Fortification"],
  ["Harald Deathwolf","Epic Hero"],
  ["Heavy Intercessor Squad","Battleline"],
  ["Hellblaster Squad","Infanterie"],
  ["Hounds of Morkai","Infanterie"],
  ["Impulsor","Véhicule"],
  ["Inceptor Squad","Infanterie"],
  ["Incursor Squad","Infanterie"],
  ["Infernus Squad","Infanterie"],
  ["Infiltrator Squad","Infanterie"],
  ["Intercessor Squad","Battleline"],
  ["Invader ATVs","Monté"],
  ["Invictor Tactical Warsuit","Véhicule"],
  ["Iron Priest","Personnage"],
  ["Judiciar","Personnage"],
  ["Krom Dragongaze","Epic Hero"],
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
  ["Logan Grimnar","Epic Hero"],
  ["Logan Grimnar on Stormrider","Epic Hero"],
  ["Long Fangs","Infanterie"],
  ["Lukas the Trickster","Epic Hero"],
  ["Murderfang","Epic Hero"],
  ["Njal Stormcaller","Epic Hero"],
  ["Outrider Squad","Monté"],
  ["Predator Annihilator","Véhicule"],
  ["Predator Destructor","Véhicule"],
  ["Ragnar Blackmane","Epic Hero"],
  ["Razorback","Véhicule"],
  ["Redemptor Dreadnought","Véhicule"],
  ["Reiver Squad","Infanterie"],
  ["Relic Razorback","Véhicule"],
  ["Repulsor","Véhicule"],
  ["Repulsor Executioner","Véhicule"],
  ["Rhino","Véhicule"],
  ["Rhino Primaris","Véhicule"],
  ["Scout Bike Squad","Monté"],
  ["Scout Squad","Infanterie"],
  ["Skyclaws","Infanterie"],
  ["Sternguard Veteran Squad","Infanterie"],
  ["Storm Speeder Hailstrike","Véhicule"],
  ["Storm Speeder Hammerstrike","Véhicule"],
  ["Storm Speeder Thunderstrike","Véhicule"],
  ["Stormfang Gunship","Véhicule"],
  ["Stormhawk Interceptor","Véhicule"],
  ["Stormraven Gunship","Véhicule"],
  ["Stormtalon Gunship","Véhicule"],
  ["Stormwolf","Véhicule"],
  ["Techmarine","Personnage"],
  ["Terminator Assault Squad","Infanterie"],
  ["Terminator Squad","Infanterie"],
  ["Thunderhawk Gunship","Véhicule"],
  ["Thunderwolf Cavalry","Monté"],
  ["Ulrik the Slayer","Epic Hero"],
  ["Vanguard Veteran Squad","Infanterie"],
  ["Vanguard Veteran Squad with Jump Packs","Infanterie"],
  ["Venerable Dreadnought","Véhicule"],
  ["Vindicator","Véhicule"],
  ["Whirlwind","Véhicule"],
  ["Wolf Guard","Infanterie"],
  ["Wolf Guard Battle Leader","Personnage"],
  ["Wolf Guard Battle Leader in Terminator Armour","Personnage"],
  ["Wolf Guard Battle Leader on Thunderwolf","Personnage"],
  ["Wolf Guard Headtakers","Bête"],
  ["Wolf Guard Pack Leader","Personnage"],
  ["Wolf Guard Pack Leader in Terminator Armour","Personnage"],
  ["Wolf Guard Pack Leader with Jump Pack","Personnage"],
  ["Wolf Guard Terminators","Infanterie"],
  ["Wolf Lord on Thunderwolf","Personnage"],
  ["Wolf Priest","Personnage"],
  ["Wolf Scouts","Infanterie"],
  ["Wulfen","Infanterie"],
  ["Wulfen Dreadnought","Véhicule"],
  ["Wulfen with Storm Shields","Infanterie"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Arjac Rockfist": [
  "Terminator Assault Squad",
  "Terminator Squad",
  "Wolf Guard Terminators"
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
  "Scout Squad",
  "Wolf Scouts"
 ],
 "Captain in Terminator Armour": [
  "Terminator Assault Squad",
  "Terminator Squad",
  "Wolf Guard Terminators"
 ],
 "Captain on Bike": [
  "Outrider Squad"
 ],
 "Captain with Jump Pack": [
  "Assault Intercessors with Jump Packs",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "Chaplain": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Hellblaster Squad",
  "Infernus Squad",
  "Intercessor Squad",
  "Sternguard Veteran Squad",
  "Vanguard Veteran Squad"
 ],
 "Chaplain in Terminator Armour": [
  "Terminator Assault Squad",
  "Terminator Squad",
  "Wolf Guard Terminators"
 ],
 "Chaplain on Bike": [
  "Outrider Squad"
 ],
 "Chaplain with Jump Pack": [
  "Assault Intercessors with Jump Packs",
  "Vanguard Veteran Squad with Jump Packs"
 ],
 "Iron Priest": [
  "Assault Intercessor Squad",
  "Blood Claws",
  "Grey Hunters",
  "Intercessor Squad",
  "Wolf Guard Headtakers"
 ],
 "Krom Dragongaze": [
  "Wolf Guard"
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
  "Scout Squad",
  "Wolf Scouts"
 ],
 "Librarian in Terminator Armour": [
  "Terminator Assault Squad",
  "Terminator Squad",
  "Wolf Guard Terminators"
 ],
 "Logan Grimnar": [
  "Terminator Assault Squad",
  "Terminator Squad",
  "Wolf Guard Terminators"
 ],
 "Njal Stormcaller": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Blood Claws",
  "Grey Hunters",
  "Intercessor Squad",
  "Wolf Guard Headtakers"
 ],
 "Ragnar Blackmane": [
  "Blood Claws",
  "Wolf Guard Headtakers"
 ],
 "Techmarine": [
  "Assault Intercessor Squad",
  "Desolation Squad",
  "Intercessor Squad"
 ],
 "Ulrik the Slayer": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Blood Claws",
  "Grey Hunters",
  "Intercessor Squad",
  "Wolf Guard Headtakers"
 ],
 "Wolf Guard Battle Leader": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Blood Claws",
  "Grey Hunters",
  "Intercessor Squad",
  "Wolf Guard Headtakers"
 ],
 "Wolf Priest": [
  "Assault Intercessor Squad",
  "Bladeguard Veteran Squad",
  "Blood Claws",
  "Grey Hunters",
  "Intercessor Squad",
  "Wolf Guard Headtakers"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Logan Grimnar": [
  [
   "Leader",
   "This model can be attached to the following units:\nTERMINATOR ASSAULT SQUAD, TERMINATOR SQUAD, WOLF GUARD TERMINATORS"
  ],
  [
   "High King of Fenris",
   "(Once per battle round, per unit)\nIn your Movement phase, select up to one friendly Space Wolves unit in strategic reserves. If you do, when that unit makes an ingress move, treat the current battle round number as being one higher than it actually is."
  ],
  [
   "Guile of the Wolf",
   "At the start of each phase, the assault doctrine, devastator doctrine and tactical doctrine are active for this unit."
  ]
 ],
 "Logan Grimnar on Stormrider": [
  [
   "Leader",
   "This model can be attached to the following unit:\n\n■ Thunderwolf Cavalry"
  ],
  [
   "Logan Grimnar",
   "Your army cannot contain both Logan Grimnar and Logan Grimnar on Stormrider"
  ]
 ],
 "Njal Stormcaller": [
  [
   "Leader",
   "This model can be attached to the following units:\nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, BLOOD CLAWS, GREY HUNTERS, INTERCESSOR SQUAD, WOLF GUARD HEADTAKERS"
  ],
  [
   "Wind Walker",
   "- This unit's ranged attacks have [ASSAULT].\n- When this unit is selected to make an advance move, this unit can change advance rolls to a 6."
  ],
  [
   "High Rune Priest (psyker level 3)",
   "This model has the psychic abilities listed in the Psychic Abilities section."
  ]
 ],
 "Bjorn the Fell-Handed": [
  [
   "Legendary Tenacity",
   "Attacks that target this unit with a S greater than this unit's T have -1 to wound rolls."
  ],
  [
   "Ancient Tactician",
   "(Once per turn, per army)\nWhen you target this unit with a stratagem, that use is -1CP"
  ]
 ],
 "Arjac Rockfist": [
  [
   "Leader",
   "This model can be attached to the following units:\nTERMINATOR ASSAULT SQUAD, TERMINATOR SQUAD, WOLF GUARD TERMINATORS"
  ],
  [
   "Anvil of Endurance",
   "In the Fight phase, when a model in this unit is destroyed, if this unit has not been selected to fight this phase, roll one D6:\n\n\n- On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is then removed from the battlefield."
  ],
  [
   "Champion of the Kingsguard",
   "This model’s attacks that target a Character unit:\n\n\n- Can re-roll hit rolls of 1.\n- Can re-roll wound rolls of 1."
  ]
 ],
 "Ulrik the Slayer": [
  [
   "Slayer’s Oath",
   "At the start of the first battle round, you select up to one enemy Character/Monster/Vehicle unit to be this unit's slayer's oath:\n\n- This unit's attacks that target this unit's slayer's oath can ignore modifiers to your unit's:\n- BS and WS.\n- Hit rolls."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, BLOOD CLAWS, GREY HUNTERS, INTERCESSOR SQUAD, WOLF GUARD HEADTAKERS"
  ],
  [
   "Oathbound",
   "This unit's melee attacks have +1 to hit rolls.\n- Or: This unit's melee attacks that target this unit's slayer's oath have +1 to hit rolls and wound rolls."
  ]
 ],
 "Ragnar Blackmane": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ Blood Claws\n■ Wolf Guard Headtakers"
  ],
  [
   "War Howl",
   "- While this model is attached to a Blood Claws unit, this unit's melee attacks have +1 S and [SUSTAINED HITS 1].\n- While this model is attached to a Wolf Guard Headtakers unit, when this unit is selected to make an advance move, that advance move does not prevent this unit from being eligible to declare a charge."
  ],
  [
   "Battle-lust",
   "If this unit made a charge move this turn, this model's melee attacks have +2 A."
  ]
 ],
 "Krom Dragongaze": [
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Blood Claws\n■ Grey Hunters\n■ Wolf Guard"
  ],
  [
   "Refuse to Accept Defeat",
   "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll if that unit is below its Starting Strength, and add 1 to the Wound roll as well if that unit is Below Half-strength."
  ],
  [
   "The Fierce Eye",
   "In your Shooting phase, you can select one enemy INFANTRY unit within 12\" of and visible to this model. That enemy unit must take a Battle-shock test."
  ]
 ],
 "Harald Deathwolf": [
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Thunderwolf Cavalry"
  ],
  [
   "Lord of the Wolfkin",
   "While this model is leading a unit, each time that unit makes a Charge move, until the end of the turn, crushing teeth and claws equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Mantle of the Troll King",
   "Once per phase, when resolving an attack made against this model, after you make a saving throw for this model, you can change the Damage characteristic of that attack to 0."
  ]
 ],
 "Canis Wolfborn": [
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Fenrisian Wolves\n■ Thunderwolf Cavalry"
  ],
  [
   "Born of Wolves",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Alpha Predator",
   "Each time this model ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6: on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6, that enemy units suffers D3+3 mortal wounds."
  ]
 ],
 "Wolf Guard Battle Leader in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Relic Terminator Squad\n■ Terminator Assault Squad\n■ Terminator Squad\n■ Wolf Guard Terminators\n\nYou can attach this model to one of the above units even if one Captain or Chapter Master model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths."
  ],
  [
   "Huskarl to the Jarl",
   "While this model is attached to a unit that contains another CHARACTER model, all CHARACTER models in that unit have the Feel No Pain 4+ ability."
  ],
  [
   "Relic shield",
   "The bearer has a Wounds characteristic of 6."
  ],
  [
   "Tactical Precision",
   "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ]
 ],
 "Wolf Lord on Thunderwolf": [
  [
   "Leader",
   "This model can be attached to the following units:\n\n■ Thunderwolf Cavalry"
  ],
  [
   "Speed of the Hunter",
   "Add 1 to Advance and Charge rolls made for this model’s unit."
  ],
  [
   "Relic shield",
   "The bearer has a Wounds characteristic of 7."
  ],
  [
   "Strategic Acumen",
   "In your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ]
 ],
 "Wolf Guard Battle Leader on Thunderwolf": [
  [
   "Leader",
   "This model can be attached to the following unit:\n\n■ Thunderwolf Cavalry"
  ],
  [
   "Aggressive Hunter",
   "Once per battle, in your opponent’s Shooting phase, after an enemy unit has finished making its attacks, if this model’s unit was targeted by one or more of those attacks, this model’s unit can make a Normal move of up to D6\", but must end that move as close as possible to the closest enemy unit. When doing so, models in this model’s unit can be moved within Engagement Range of that enemy unit."
  ],
  [
   "Storm Shield",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Tactical Precision",
   "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ]
 ],
 "Blood Claws": [
  [
   "Berserk Charge",
   "When this unit is selected to make an advance move, that advance move does not prevent this unit from being eligible to declare a charge."
  ]
 ],
 "Grey Hunters": [
  [
   "Cunning Hunters",
   "In the Fight phase, if this unit is within range of an objective, this unit’s melee attacks:\n\n\n- Have +1 S.\n- Have +1 AP."
  ],
  [
   "Old Greymanes",
   "In the Declare Battle Formations step, you can split this unit into two units, each containing as equal a number of models as possible (when splitting a unit in this way, make a note of which models form each of the two new units)."
  ]
 ],
 "Wolf Guard": [
  [
   "Chosen Companions",
   "While a CHARACTER model is leading this unit, each time a model in this unit makes an attack, add 1 to the Hit roll."
  ],
  [
   "Attached Unit",
   "If a CHARACTER unit from your army with the Leader ability can be attached to an STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD, it can instead be attached to this unit."
  ],
  [
   "Storm Shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Lukas the Trickster": [
  [
   "Pelt of the Doppelgangrel:",
   "While this model is leading a unit, each time an attack targets that unit, subtract 1 from the Hit roll."
  ],
  [
   "Last Laugh",
   "If this model is destroyed by a melee attack, after the attacking unit has finished making its attacks, roll one D6: on a 4+, the attacking unit suffers D6 mortal wounds and is Battle-shocked."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n\n■ Blood Claws"
  ],
  [
   "Master of Mischief",
   "This model cannot be your WARLORD."
  ]
 ],
 "Wolf Guard Terminators": [
  [
   "Rugged Resilience",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of this unit, subtract 1 from the Wound roll."
  ],
  [
   "Storm Shield",
   "This model has +1 W."
  ]
 ],
 "Hounds of Morkai": [
  [
   "Morkai’s Howl",
   "In your Shooting phase, you can select one enemy unit within 12\" of this unit (if a LIEUTENANT IN REIVER ARMOUR is leading this unit, you can select one enemy unit within 18\" instead). That unit must take a Battle-shock test, subtracting 1 from the result if it is a PSYKER unit. If that test is failed, in addition to being Battle-shocked, that unit is Stunned until the start of your next Shooting phase. While a unit is Stunned, each time a model in that unit makes a Psychic Attack, subtract 1 from the Hit roll."
  ],
  [
   "Invulnerable Save",
   "Models in this unit have a 6+ invulnerable save. This invulnerable save is improved to 4+ against Psychic Attacks."
  ],
  [
   "Attached Unit",
   "If a CHARACTER unit from your army with the Leader ability can be attached to a REIVER SQUAD, it can instead be attached to this unit."
  ]
 ],
 "Wulfen": [
  [
   "Savage Frenzy",
   "When an enemy unit engaged with your unit (excluding Monster/Vehicle units) makes a fall-back move that enemy unit must use the desperate escape mode. If that enemy unit is battle-shocked, -1 from those hazard rolls."
  ],
  [
   "Death Totem",
   "This unit's melee attacks can re-roll hit rolls of 1."
  ],
  [
   "Curse of the Wulfen",
   "While this unit is within 6” of a friendly Space Wolves Character model (excluding Wulfen models) or within 12” of a friendly Wolf Priest model, if this unit is not battle-shocked:\n\n\n- If this unit has Infantry, this unit has +1 OC.\n- If this unit has Vehicle, this unit has +3 OC.\n\n\nBestial Forms: For the purposes of transport capacity, each Wulfen model takes up the space of 2 models."
  ]
 ],
 "Wulfen Dreadnought": [
  [
   "Bestial Rage",
   "In your opponent's Shooting phase, when an enemy unit has shot, if this unit lost a wound as a result of those attacks, this unit can make a surge move of up to D6+1\"."
  ],
  [
   "Violent Fury",
   "If this model is equipped with two melee weapons, melee attacks made by this unit have [TWIN-LINKED]."
  ],
  [
   "Blizzard shield",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Curse of the Wulfen",
   "While this unit is within 6” of a friendly Space Wolves Character model (excluding Wulfen models) or within 12” of a friendly Wolf Priest model, if this unit is not battle-shocked:\n\n\n- If this unit has Infantry, this unit has +1 OC.\n- If this unit has Vehicle, this unit has +3 OC.\n\n\nBestial Forms: For the purposes of transport capacity, each Wulfen model takes up the space of 2 models."
  ]
 ],
 "Murderfang": [
  [
   "Murder-maker",
   "In the Fight phase, each time an attack targets a friendly WULFEN unit within 6\" of In the Fight phase, when a friendly Wulfen model within 6\" of this unit is destroyed, if that model's unit has not been selected to fight this phase, roll one D6:\n\n\n- On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield."
  ],
  [
   "Force of Untamed Destruction",
   "This model cannot be your WARLORD."
  ],
  [
   "Bestial Fury",
   "This unit:\n-Can re-roll advance rolls.\n-Can re-roll charge rolls."
  ],
  [
   "Curse of the Wulfen",
   "While this unit is within 6” of a friendly Space Wolves Character model (excluding Wulfen models) or within 12” of a friendly Wolf Priest model, if this unit is not battle-shocked:\n\n\n- If this unit has Infantry, this unit has +1 OC.\n- If this unit has Vehicle, this unit has +3 OC.\n\n\nBestial Forms: For the purposes of transport capacity, each Wulfen model takes up the space of 2 models."
  ]
 ],
 "Thunderwolf Cavalry": [
  [
   "Thunderous Charge",
   "If this unit made a charge move this turn this units melee attacks have\n• +1 S\n• +1 D"
  ],
  [
   "Storm Shield",
   "This model has a 4+ InSv."
  ]
 ],
 "Fenrisian Wolves": [
  [
   "Predatory Instinct",
   "In your opponent's Movement phase, when an enemy unit ends a move within 8\" of this unit, if this unit is unengaged, this unit can make a normal move of up to D6\"."
  ],
  [
   "Hunting Hounds",
   "While this unit is within 6\" of a friendly Space Wolves Character model (excluding Wulfen), if this unit is not battle-shocked, Hunting Wolf models have +1 OC."
  ]
 ],
 "Skyclaws": [
  [
   "Headstrong",
   "You can re-roll Charge rolls made for this unit. Each time this unit makes a Charge move, until the end of the turn, each time a model in this unit makes a melee attack, add 1 to the Hit roll."
  ],
  [
   "Attached Unit",
   "If a CHARACTER unit from your army with the Leader ability can be attached to an ASSAULT INTERCESSOR SQUAD WITH JUMP PACKS or ASSAULT SQUAD WITH JUMP PACKS, it can instead be attached to this unit."
  ]
 ],
 "Long Fangs": [
  [
   "Fire Discipline",
   "Each time this unit Remains Stationary, if it includes a Long Fang Pack Leader, you can select one enemy unit that is visible to that model. Until the end of the turn, each time a model in this unit makes a ranged attack that targets that enemy unit, re-roll a Hit roll of 1."
  ],
  [
   "Attached Unit",
   "If a CHARACTER unit from your army with the Leader ability can be attached to a DEVASTATOR SQUAD, it can instead be attached to this unit."
  ],
  [
   "Armorium Cherub",
   "Once per battle, after making a Hit roll for a model in this unit, you can change that roll to an unmodified 6."
  ]
 ],
 "Stormfang Gunship": [
  [
   "Frozen Prey",
   "In your Shooting phase, after this model has shot, if an enemy MONSTER or VEHICLE unit was hit by one or more of those attacks made with this model’s helfrost destructor, until the end of your opponent’s next turn, that enemy unit is Frozen. While a unit is Frozen, subtract 2 from that unit’s Move characteristic, and  subtract 2 from Advance and Charge rolls made for that unit."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Stormwolf": [
  [
   "Into the Foe",
   "If a unit disembarks from this TRANSPORT before it moves, until the end of the turn, that unit is eligible to charge in a turn in which it Advanced."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Wolf Guard Pack Leader": [
  [
   "Support",
   "This model can be attached to the following units:\n\n■ Blood Claws\n■ Grey Hunters\n■ Long Fangs"
  ],
  [
   "Storm Shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Wolf Guard Pack Leader with Jump Pack": [
  [
   "Support",
   "This model can be attached to the following unit: Skyclaws"
  ],
  [
   "Storm Shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Wolf Guard Pack Leader in Terminator Armour": [
  [
   "Support",
   "This model can be attached to the following units:\n\n■ Blood Claws\n■ Grey Hunters\n■ Long Fangs"
  ],
  [
   "Storm Shield",
   "The bearer has a Wounds characteristic of 4."
  ],
  [
   "Invulnerable Save",
   "4+"
  ]
 ],
 "Iron Priest": [
  [
   "Iron Priest",
   "While this model is within 3\" of a friendly Space Wolves Vehicle unit, this model has Lone Operative."
  ],
  [
   "Gift of the Iron Wolf",
   "In your Movement phase, at the start or end of this unit's move, select up to one friendly Space Wolves Vehicle model within 3\" of this model:\n- That Vehicle model heals D3 wounds.\n- That Vehicle model’s attacks can ignore modifiers to hit rolls and wound rolls until the start of your next Movement phase.\n\nYou cannot select the same Vehicle model for this ability more than once per phase."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\nASSAULT INTERCESSOR SQUAD, BLOOD CLAWS, GREY HUNTERS, INTERCESSOR SQUAD, WOLF GUARD HEADTAKERS"
  ],
  [
   "Judgement of the Omnissiah",
   "This model's attacks that target an enemy unit engaged with a friendly Space Wolves Vehicle can re-roll wound rolls."
  ]
 ],
 "Cyberwolf": [
  [
   "Alpha Hunter",
   "While this model is leading a unit, models in that unit have the Scouts 6\" ability."
  ],
  [
   "Close In for the Kill",
   "Each time this model makes an attack that targets an enemy unit that is Below Half-strength, add 1 to the Hit roll and add 1 to the Wound roll."
  ],
  [
   "Support",
   "This model can be attached to the following unit:\n\n■ Fenrisian Wolves"
  ],
  [
   "Wolfkin",
   "This model cannot be your WARLORD and cannot be given Enhancements."
  ]
 ],
 "Wolf Scouts": [
  [
   "Guerrilla Tactics",
   "At the end of your opponent’s turn, if this unit is more than 6\" away from all enemy models, you can remove this unit from the battlefield and place it into\nStrategic Reserves."
  ]
 ],
 "Venerable Dreadnought": [
  [
   "Fervour of the Ancients",
   "Friendly Space Wolves units within 6\" of this unit:\n- Have +1 to advance rolls.\n- Have +1 to charge rolls."
  ],
  [
   "Blizzard shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Wolf Priest": [
  [
   "Leader",
   "This model can be attached to the following units:\nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, BLOOD CLAWS, GREY HUNTERS, INTERCESSOR SQUAD, WOLF GUARD HEADTAKERS"
  ],
  [
   "Healing Balms",
   "In your Command phase, this unit heals D3+1 wounds."
  ],
  [
   "Litany of Hate",
   "This unit's melee attacks have [LANCE]"
  ]
 ],
 "Wolf Guard Battle Leader": [
  [
   "Tempered Ferocity",
   "- This unit's attacks have [SUSTAINED HITS 1].\n- This unit's attacks that target an enemy unit within 6\" of this unit can re-roll hit rolls of 1."
  ],
  [
   "Heroic Last Stand",
   "In the Fight phase, when this model is destroyed, if this unit has not been selected to fight this phase, roll one D6:\n\n\n- On a 2+, do not remove this model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), this model is removed from the battlefield."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\nASSAULT INTERCESSOR SQUAD, BLADEGUARD VETERAN SQUAD, BLOOD CLAWS, GREY HUNTERS, INTERCESSOR SQUAD, WOLF GUARD HEADTAKERS"
  ],
  [
   "Storm Shield",
   "This model has +1 W."
  ]
 ],
 "Wolf Guard Headtakers": [
  [
   "Headhunters",
   "At the start of the first battle round, select up to one enemy unit to be this unit's quarry:\n- This unit's attacks that target this unit's quarry have [DEVASTATING WOUNDS] and [PRECISION].\n- Each time this unit's quarry is destroyed, select one enemy unit to be this unit's quarry."
  ],
  [
   "Hunting Hounds",
   "While this unit is within 6\" of a friendly Space Wolves Character model (excluding Wulfen), if this unit is not battle-shocked, Hunting Wolf models have +1 OC."
  ],
  [
   "Let Loose the Wolves",
   "At the start of the Declare Battle Formations step, you can split this unit into two units, one containing all Wolf Guard Headtaker models and all leader/support models, the other containing all Hunting Wolves models, with new starting strengths accordingly."
  ],
  [
   "Storm Shield",
   "This model has a 4+ InSv."
  ]
 ],
 "Wulfen with Storm Shields": [
  [
   "Hammer Blow",
   "In the Fight phase, when this unit has fought, select up to one enemy Monster/Vehicle unit hit by those attacks. If you do, that enemy unit is suppressed until the start of your next turn:\n\n\n-While a unit is suppressed, that unit's attacks have -1 to hit rolls."
  ],
  [
   "Death Totem",
   "This unit's melee attacks can re-roll hit rolls of 1."
  ],
  [
   "Storm Shield",
   "This model has a 4+ InSv."
  ],
  [
   "Curse of the Wulfen",
   "While this unit is within 6” of a friendly Space Wolves Character model (excluding Wulfen models) or within 12” of a friendly Wolf Priest model, if this unit is not battle-shocked:\n\n\n- If this unit has Infantry, this unit has +1 OC.\n- If this unit has Vehicle, this unit has +3 OC.\n\n\nBestial Forms: For the purposes of transport capacity, each Wulfen model takes up the space of 2 models."
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
  ["Assault Brethren",1,"Doctrines","Assault Mastery","You can select the assault doctrine one additional time per battle.","",0,"","Take and Hold"],
  ["Champions of Fenris",1,"Terminator","The Great Wolf Watches","Friendly Adeptus Astartes Character units have the following ability: Countercharge: (Once per battle round, per unit) When you target this unit with the Heroic Intervention stratagem, that use is -1CP.","",0,"","Priority Assets"],
  ["Deathwatch Support",1,"","Mission Tactics","Friendly KILL TEAM units with this ability have the following abilities: Furor Tactics When the enemy horde grows close, the Deathwatch will be tasked with the decimation of their core. Aiming not for clinical kills but for maximum destruction over a wide area, they tear the heart from the enemy army. If the devastator doctrine is active for your unit, your unit’s attacks have [SUSTAINED HITS 1]. Malleus Tactics When the giants of war lumber forth, the Deathwatch will adopt Malleus tactics. Even the largest behemoth has a weak point, and the archives of the Deathwatch number them all. If the tactical doctrine is active for your unit, your unit’s attacks have [LETHAL HITS]. Purgatus Tactics By adopting Purgatus tactics, the Deathwatch focus their deadly ire upon the commanders of the enemy host, assassinating them one after another with pitiless head shots and killing thrusts of the blade. If the assault doctrine is active for your unit, your unit’s attacks that target an enemy unit within 9\" of this unit have [PRECISION]. DEATHWATCH ALLIES You can include Deathwatch units in your army, even though they do not have the same Chapter faction keyword as other units in your army. The combined points value of such units cannot exceed 500 points. When mustering your army, unless otherwise stated, you cannot select a DEATHWATCH model to be your WARLORD. In addition KILL TEAM units can only contain enhancements taken from this detachment. This an exception to the Space Marine Chapters Army Rules.","",0,"","Disruption"],
  ["Devastator Brethren",1,"Doctrines","Devastator Mastery","You can select the devastator doctrine one additional time per battle.","",0,"","Purge the Foe"],
  ["Gauntlet Task Force",1,"","Combined Deployment","In your Shooting phase, when a friendly Adeptus Astartes Transport unit has shot, you can select one enemy unit hit by those attacks. That enemy unit is assailed until the end of the turn: ▪ While a unit is assailed, when an ADEPTUS ASTARTES unit that disembarked this turn targets that unit, those attacks have [Sustained Hits 1].","",0,"","Reconnaissance"],
  ["Gladius Task Force",3,"","Codex Discipline","You can select one combat doctrine one additional time per battle.","",0,"","Take and Hold"],
  ["Gravis Linebreaker Force",1,"Gravis","Walking Fortress","In a turn a friendly Gravis unit made a normal move, that unit’s ranged attacks: ▪ Do not have [Heavy]. ▪ Have +1 to hit rolls.","",0,"","Take and Hold"],
  ["Gravis Siege Force",1,"Gravis","Indomitable Defence","While a friendly Gravis unit is within range of an objective, attacks that target that unit with a S greater than that unit’s T have -1 to wound rolls.","",0,"","Take and Hold"],
  ["Ironclad Champions",1,"","Enduring Vengeance","Friendly Adeptus Astartes Dreadnought units can re-roll hit rolls of 1.","",0,"","Priority Assets"],
  ["Ironstorm Spearhead",1,"Ironstorm","Ironstorm Auto-targeters","Friendly Adeptus Astartes Vehicle units’ (excluding walker units) ranged attacks can: ▪ Re-roll one hit roll. ▪ Re-roll one wound roll.","",0,"","Purge the Foe"],
  ["Phobos Shadow Force",1,"Phobos","Shadow Masters","When a friendly Phobos or Scout SQUAD unit has shot: ▪ Those attacks do not prevent that unit from being hidden. ▪ Or: That unit can make a normal move of up to D6\". That unit is not eligible to declare a charge until the end of the turn.","",0,"","Disruption"],
  ["Phobos Shock Force",1,"Phobos","Vanguard Ambushers","At the end of your Movement phase, if a friendly Phobos unit is hidden, that unit’s attacks can re-roll wound rolls of 1 until the end of the turn.","",0,"","Disruption"],
  ["Saga of the Beastslayer",1,"","Legendary Slayers","Attacks made by friendly Blood Claws/Thunderwolf Cavalry/Wulfen units have [Lethal Hits: Character/Monster/Vehicle].","",0,"","Purge the Foe"],
  ["Saga of the Great Wolf",2,"","Master of Wolves","Friendly ADEPTUS ASTARTES units (excluding MONSTER/VEHICLES units) with this ability have the following abilities: Encircling Jaws: If the assault doctrine is active for your unit, your unit has +1 to advance rolls and charge rolls. Hunter’s Eye: If the devastator doctrine is active for your unit, your unit’s ranged attacks can re-roll hit rolls of 1. Ferocious Strike: If the tactical doctrine is active for your unit, your unit’s attacks that target an enemy unit with 9\" have [Sustained Hits 1]. Friendly Logan Grimnar units have the following ability: Howling Onslaught: (Once per battle, per army) In your command phase, you can use this ability. If you do, friendly Adeptus Astartes Monster/Vehicle units benefit from the Master of Wolves rule until the start of your next command phase. Restrictions: Your army can include Space Wolves units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.","",0,"","Take and Hold"],
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
  ["A Giant Amongst Giants",15,"Champions of Fenris","ADEPTUS ASTARTES INFANTRY model only.\n\n\n▪ This model has +2 W.\n▪ This model’s melee attacks have +1 S",null],
  ["Preyslayer",15,"Champions of Fenris","ADEPTUS ASTARTES INFANTRY model only. This unit can re-roll charge rolls",null],
  ["Beacon Angelis",25,"Deathwatch Support","ADEPTUS ASTARTES model only. If this unit is a Kill Team unit, this unit has:\n\n▪ Deep Strike.\n▪ When you target this unit with the Rapid Ingress Stratagem, that use is -1CP.",null],
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
  ["Hunter’s Guile",20,"Saga of the Beastslayer","Adeptus Astartes model only. When both players have deployed their armies, you can redeploy up to three friendly Blood Claws/Thunderwolf Cavalry/Wulfen units. When doing so, you can set those units up in strategic reserves, regardless of how many units are already in strategic reserves.",null],
  ["Wolf-Touched",15,"Saga of the Beastslayer","Adeptus Astartes model only. This unit has:\n\n\n▪ Wulfen.\n▪ +2”M.",null],
  ["Chariots of the Storm",25,"Saga of the Great Wolf","Adeptus Astartes model only. When both players have deployed their armies, you can redeploy up to three friendly Adeptus Astartes units. When doing so, you can set those units up in strategic reserves, regardless of how many units are already in strategic reserves.",null],
  ["Grimnar’s Mark",15,"Saga of the Great Wolf","Adeptus Astartes Terminator Captain model only. (Once per battle round, per army) You can target this unit with the Rapid Ingress/Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n\n▪ That use is -1CP.\n▪ That use does not prevent any uses of that stratagem on other units this phase.",null],
  ["Howlmaw",15,"Saga of the Great Wolf","Wolf Priest model only. (Once per turn, per unit) At the start of the fight phase, you can select one enemy unit within 6” of this model. That unit makes a battle-shock roll with -1 to that battle-shock roll.",null],
  ["Skjald’s Foretelling",20,"Saga of the Great Wolf","Wolf Guard Battle Leader model only. This unit’s melee attacks have [Lance].",null],
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
  ["Birth of a Saga","Champions of Fenris","",1,"Your Command phase.","One friendly ADEPTUS ASTARTES unit (excluding Monster/Vehicle units).","Until the start of your next Command phase, your unit has CHARACTER.",""],
  ["Champion's Guidance","Champions of Fenris","",1,"Fight phase, when a friendly Adeptus Astartes Character unit is selected to fight.","That ADEPTUS ASTARTES CHARACTER unit.","Your unit’s melee attacks can re-roll hit rolls of 1 and wound rolls of 1.",""],
  ["Heroic Resolve","Champions of Fenris","",2,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly Adeptus Astartes Character unit.","That ADEPTUS ASTARTES CHARACTER unit.","Attacks that target your unit have -1 D until that enemy unit has attacked.",""],
  ["Blackstar Extraction","Deathwatch Support","",1,"End of your opponent’s Fight phase.","One friendly unengaged KILL TEAM unit.","Place your unit in strategic reserves.",""],
  ["Dragonfire Rounds","Deathwatch Support","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks: ▪ Can re-roll wound rolls of 1. ▪ Have [IGNORES COVER].",""],
  ["Hellfire Rounds","Deathwatch Support","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks (excluding [DEVASTATING WOUNDS] attacks) have [ANTI-non-VEHICLE 4+].",""],
  ["Kraken Rounds","Deathwatch Support","",1,"Your Shooting phase when a KILL TEAM unit is selected to shoot.","That KILL TEAM unit.","Your unit’s ranged attacks have: ▪ Have +6\" R. ▪ Have +1 S.",""],
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
  ["Co-Ordinated Strike","Saga of the Beastslayer","",1,"End of your opponent’s Fight phase.","One unengaged Blood Claws/Thunderwolf Cavalry/Wulfen unit that is within 9\" of one or more battlefield edges.","Place your unit in strategic reserves.",""],
  ["Impetuosity","Saga of the Beastslayer","",1,"Your opponent’s Shooting phase, when an enemy unit that targeted a friendly unengaged Blood Claws/Thunderwolf Cavalry/Wulfen unit has shot.","That BLOOD CLAWS/THUNDERWOLF CAVALRY/WULFEN unit.","Your unit can make a surge move of up to D6\".",""],
  ["Unbridled Feroicity","Saga of the Beastslayer","",1,"Fight phase, when a friendly Blood Claws/Thunderwolf Cavalry/Wulfen unit is selected to fight.","That BLOOD CLAWS/THUNDERWOLF CAVALRY/WULFEN unit.","Your unit’s melee attacks have [LANCE].",""],
  ["Battle Instincts","Saga of the Great Wolf","",1,"Your opponent’s Shooting phase, when an enemy unit that targeted a friendly unengaged Adeptus Astartes Infantry/Mounted unit has shot.","That ADEPTUS ASTARTES INFANTRY/MOUNTED unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Eye of the Pack","Saga of the Great Wolf","",1,"Your Shooting phase, or the Fight phase, when a friendly Adeptus Astartes Infantry unit is selected to attack.","That ADEPTUS ASTARTES INFANTRY unit.","Your unit’s attacks can re-roll wound rolls of 1 and 2.",""],
  ["Fangs of the Pack","Saga of the Great Wolf","",1,"Fight phase, when a friendly Adeptus Astartes Infantry/Mounted unit is selected to fight.","That ADEPTUS ASTARTES INFANTRY/MOUNTED unit.","Your unit’s melee attacks have [Precision].",""],
  ["Fenrisian Ferocity","Saga of the Great Wolf","",1,"Your Movement/Charge phase, when a friendly Adeptus Astartes Mounted/Walker unit is selected to move or declares a charge.","That ADEPTUS ASTARTES MOUNTED/WALKER unit.","Your unit has Mobile.",""],
  ["Grimnar's Command","Saga of the Great Wolf","",1,"Your Command phase.","One friendly ADEPTUS ASTARTES unit (excluding Monster/Vehicle units).","Select one combat doctrine. That combat doctrine is active for your unit until the start of your next Command phase.",""],
  ["Wolf Totems","Saga of the Great Wolf","",1,"Any phase, when a friendly Adeptus Astartes Infantry/Mounted unit suffers a mortal wound.","That ADEPTUS ASTARTES INFANTRY/MOUNTED unit.","Your unit has Feel No Pain 5+ against mortal wounds.",""],
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
  "Stormfang Gunship",
  "Stormhawk Interceptor",
  "Stormraven Gunship",
  "Stormtalon Gunship",
  "Stormwolf",
  "Thunderhawk Gunship",
  "Venerable Dreadnought",
  "Vindicator",
  "Whirlwind",
  "Wulfen Dreadnought"
 ],
 "monster": [],
 "battleline": [
  "Assault Intercessor Squad",
  "Blood Claws",
  "Grey Hunters",
  "Heavy Intercessor Squad",
  "Intercessor Squad"
 ],
 "epic": [
  "Arjac Rockfist",
  "Bjorn the Fell-Handed",
  "Canis Wolfborn",
  "Harald Deathwolf",
  "Krom Dragongaze",
  "Logan Grimnar",
  "Logan Grimnar on Stormrider",
  "Lukas the Trickster",
  "Murderfang",
  "Njal Stormcaller",
  "Ragnar Blackmane",
  "Ulrik the Slayer"
 ],
 "infantry": [
  "Aggressor Squad",
  "Assault Intercessors with Jump Packs",
  "Bladeguard Veteran Squad",
  "Centurion Assault Squad",
  "Centurion Devastator Squad",
  "Desolation Squad",
  "Eliminator Squad",
  "Eradicator Squad with Heavy Bolters",
  "Eradicator Squad with Melta Rifles",
  "Hellblaster Squad",
  "Hounds of Morkai",
  "Inceptor Squad",
  "Incursor Squad",
  "Infernus Squad",
  "Infiltrator Squad",
  "Long Fangs",
  "Reiver Squad",
  "Scout Squad",
  "Skyclaws",
  "Sternguard Veteran Squad",
  "Terminator Assault Squad",
  "Terminator Squad",
  "Vanguard Veteran Squad",
  "Vanguard Veteran Squad with Jump Packs",
  "Wolf Guard",
  "Wolf Guard Terminators",
  "Wolf Scouts",
  "Wulfen",
  "Wulfen with Storm Shields"
 ],
 "character": [
  "Ancient",
  "Ancient in Terminator Armour",
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
  "Cyberwolf",
  "Iron Priest",
  "Judiciar",
  "Librarian",
  "Librarian in Phobos Armour",
  "Librarian in Terminator Armour",
  "Lieutenant",
  "Lieutenant in Phobos Armour",
  "Lieutenant with Combi-weapon",
  "Techmarine",
  "Wolf Guard Battle Leader",
  "Wolf Guard Battle Leader in Terminator Armour",
  "Wolf Guard Battle Leader on Thunderwolf",
  "Wolf Guard Pack Leader",
  "Wolf Guard Pack Leader in Terminator Armour",
  "Wolf Guard Pack Leader with Jump Pack",
  "Wolf Lord on Thunderwolf",
  "Wolf Priest"
 ],
 "gravis": [
  "Aggressor Squad",
  "Captain in Gravis Armour",
  "Eradicator Squad with Heavy Bolters",
  "Eradicator Squad with Melta Rifles",
  "Heavy Intercessor Squad",
  "Inceptor Squad"
 ],
 "tacticus": [
  "Ancient",
  "Assault Intercessor Squad",
  "Assault Intercessors with Jump Packs",
  "Bladeguard Ancient",
  "Bladeguard Veteran Squad",
  "Blood Claws",
  "Captain",
  "Captain with Jump Pack",
  "Chaplain",
  "Chaplain with Jump Pack",
  "Company Heroes",
  "Desolation Squad",
  "Grey Hunters",
  "Hellblaster Squad",
  "Infernus Squad",
  "Intercessor Squad",
  "Judiciar",
  "Librarian",
  "Lieutenant",
  "Njal Stormcaller",
  "Ragnar Blackmane",
  "Sternguard Veteran Squad",
  "Techmarine",
  "Vanguard Veteran Squad with Jump Packs",
  "Wolf Guard Battle Leader",
  "Wolf Guard Headtakers",
  "Wolf Priest"
 ],
 "terminator": [
  "Ancient in Terminator Armour",
  "Arjac Rockfist",
  "Captain in Terminator Armour",
  "Chaplain in Terminator Armour",
  "Librarian in Terminator Armour",
  "Logan Grimnar",
  "Terminator Assault Squad",
  "Terminator Squad",
  "Wolf Guard Battle Leader in Terminator Armour",
  "Wolf Guard Pack Leader in Terminator Armour",
  "Wolf Guard Terminators"
 ],
 "phobos": [
  "Captain in Phobos Armour",
  "Eliminator Squad",
  "Hounds of Morkai",
  "Incursor Squad",
  "Infiltrator Squad",
  "Invictor Tactical Warsuit",
  "Librarian in Phobos Armour",
  "Lieutenant in Phobos Armour",
  "Lieutenant with Combi-weapon",
  "Reiver Squad",
  "Wolf Scouts"
 ],
 "dreadnought": [
  "Ballistus Dreadnought",
  "Bjorn the Fell-Handed",
  "Brutalis Dreadnought",
  "Dreadnought",
  "Murderfang",
  "Redemptor Dreadnought",
  "Venerable Dreadnought",
  "Wulfen Dreadnought"
 ],
 "mounted": [
  "Canis Wolfborn",
  "Captain on Bike",
  "Chaplain on Bike",
  "Harald Deathwolf",
  "Invader ATVs",
  "Logan Grimnar on Stormrider",
  "Outrider Squad",
  "Scout Bike Squad",
  "Thunderwolf Cavalry",
  "Wolf Guard Battle Leader on Thunderwolf",
  "Wolf Lord on Thunderwolf"
 ],
 "walker": [
  "Ballistus Dreadnought",
  "Bjorn the Fell-Handed",
  "Brutalis Dreadnought",
  "Dreadnought",
  "Invictor Tactical Warsuit",
  "Murderfang",
  "Redemptor Dreadnought",
  "Venerable Dreadnought",
  "Wulfen Dreadnought"
 ],
 "fly": [
  "Assault Intercessors with Jump Packs",
  "Captain with Jump Pack",
  "Chaplain with Jump Pack",
  "Inceptor Squad",
  "Land Speeder",
  "Skyclaws",
  "Storm Speeder Hailstrike",
  "Storm Speeder Hammerstrike",
  "Storm Speeder Thunderstrike",
  "Stormfang Gunship",
  "Stormhawk Interceptor",
  "Stormraven Gunship",
  "Stormtalon Gunship",
  "Stormwolf",
  "Thunderhawk Gunship",
  "Vanguard Veteran Squad with Jump Packs",
  "Wolf Guard Pack Leader with Jump Pack"
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
 "death company": [],
 "deathwing": [],
 "ravenwing": []
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Logan Grimnar": "80",
 "Njal Stormcaller": "40",
 "Bjorn the Fell-Handed": "60",
 "Arjac Rockfist": "50",
 "Ulrik the Slayer": "32",
 "Ragnar Blackmane": "40",
 "Blood Claws": "32",
 "Grey Hunters": "32",
 "Wolf Guard Terminators": "40",
 "Wulfen": "40",
 "Wulfen Dreadnought": "60",
 "Murderfang": "60",
 "Thunderwolf Cavalry": "60",
 "Fenrisian Wolves": "40",
 "Iron Priest": "32",
 "Wolf Scouts": "32",
 "Venerable Dreadnought": "60",
 "Wolf Priest": "40",
 "Wolf Guard Battle Leader": "40",
 "Wolf Guard Headtakers": "40",
 "Wulfen with Storm Shields": "40",
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
 "Stormfang Gunship": 5,
 "Stormwolf": 5,
 "Predator Destructor": 4,
 "Stormraven Gunship": 5,
 "Hammerfall Bunker": 4,
 "Thunderhawk Gunship": 10
};

const TRANSPORTS = {
 "Stormfang Gunship": "This model has a transport capacity of 6 ADEPTUS ASTARTES INFANTRY models. Each JUMP PACK, WULFEN, GRAVIS or TERMINATOR model takes up the space of 2 models and each CENTURION model takes up the space of 3 models.",
 "Stormwolf": "This model has a transport capacity of 16 ADEPTUS ASTARTES INFANTRY models. Each JUMP PACK, WULFEN, GRAVIS or TERMINATOR model takes up the space of 2 models and each CENTURION model takes up the space of 3 models.",
 "Thunderhawk Gunship": "This model has a transport capacity of 30 ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED models. Each JUMP PACK, WULFEN, GRAVIS or TERMINATOR model takes up the space of 2 models. Each CENTURION model takes up the space of 3 models. Each MOUNTED model takes up the space of 4 models."
};
const FACTION = [
 [
  "Combat Doctrines",
  "At the start of your Command phase, you can select one combat doctrine listed below. If you do, that combat doctrine is active for friendly ADEPTUS ASTARTES units with this ability until the start of your next Command phase. ASSAULT DOCTRINEWhen this unit is selected to make an advance move, that advance move does not prevent this unit from being eligible to declare a charge. DEVASTATOR DOCTRINEThis unit’s ranged attacks have [ASSAULT]. TACTICAL DOCTRINEWhen this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to shoot and eligible to declare a charge. Unless otherwise stated: ▪ You can only select each combat doctrine once per battle. ▪ Only one combat doctrine can be active for each unit. If a rule makes a combat doctrine active for a unit, any combat doctrine previously active for that unit is no longer active for that unit."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/spacewolves.json —
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
 "Wulfen": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Totem de Mort",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Wulfen with Storm Shields": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Totem de Mort",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Wolf Guard Battle Leader": [
  {
   "mot": "sust:1",
   "nom": "Férocité Maîtrisée",
   "texte": "- This unit's attacks have [SUSTAINED HITS 1]. - This unit's attacks that target an enemy unit within 6\" of this unit can re-roll hit rolls of 1."
  }
 ],
 "Ulrik the Slayer": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Lié par Serment",
   "texte": "This unit's melee attacks have +1 to hit rolls. - Or: This unit's melee attacks that target this unit's slayer's oath have +1 to hit rolls and wound rolls."
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
 "Cyberwolf": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Curée",
   "quand": "La cible est sous la moitié de son effectif",
   "texte": "Each time this model makes an attack that targets an enemy unit that is Below Half-strength, add 1 to the Hit roll and add 1 to the Wound roll."
  },
  {
   "champ": "wndMod",
   "val": 1,
   "nom": "Curée — blessure",
   "quand": "La cible est sous la moitié de son effectif",
   "texte": "Each time this model makes an attack that targets an enemy unit that is Below Half-strength, add 1 to the Hit roll and add 1 to the Wound roll."
  }
 ],
 "Grey Hunters": [
  {
   "champ": "strMod",
   "val": 1,
   "port": "C",
   "nom": "Chasseurs Rusés",
   "quand": "L'unité est à portée d'un objectif",
   "texte": "In the Fight phase, if this unit is within range of an objective, this unit’s melee attacks: - Have +1 S. - Have +1 AP."
  },
  {
   "champ": "apMod",
   "val": 1,
   "port": "C",
   "nom": "Chasseurs Rusés — PA",
   "quand": "L'unité est à portée d'un objectif",
   "texte": "In the Fight phase, if this unit is within range of an objective, this unit’s melee attacks: - Have +1 S. - Have +1 AP."
  }
 ],
 "Iron Priest": [
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Jugement de l'Omnimessie",
   "quand": "La cible est engagée avec un VÉHICULE ami",
   "texte": "This model's attacks that target an enemy unit engaged with a friendly Space Wolves Vehicle can re-roll wound rolls."
  }
 ],
 "Long Fangs": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "T",
   "nom": "Discipline de Tir",
   "quand": "L'unité est restée immobile avec son chef de meute, contre la cible désignée",
   "texte": "Each time this unit Remains Stationary, if it includes a Long Fang Pack Leader, you can select one enemy unit that is visible to that model. Until the end of the turn, each time a model in this unit makes a ranged attack that targets that enemy unit, re-roll a Hit roll of 1."
  }
 ],
 "Ragnar Blackmane": [
  {
   "champ": "atkMod",
   "val": 2,
   "port": "C",
   "nom": "Soif de Bataille",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this model's melee attacks have +2 A."
  }
 ],
 "Skyclaws": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Tête Brûlée",
   "quand": "L'unité a chargé ce tour",
   "texte": "Each time this unit makes a Charge move, until the end of the turn, each time a model in this unit makes a melee attack, add 1 to the Hit roll."
  }
 ],
 "Thunderwolf Cavalry": [
  {
   "champ": "strMod",
   "val": 1,
   "port": "C",
   "nom": "Charge Tonitruante",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn this units melee attacks have • +1 S • +1 D"
  },
  {
   "champ": "dmgMod",
   "val": 1,
   "port": "C",
   "nom": "Charge Tonitruante — dégâts",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn this units melee attacks have • +1 S • +1 D"
  }
 ],
 "Wolf Guard": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Compagnons Élus",
   "quand": "Un PERSONNAGE mène l'unité",
   "texte": "While a CHARACTER model is leading this unit, each time a model in this unit makes an attack, add 1 to the Hit roll."
  }
 ],
 "Wolf Guard Headtakers": [
  {
   "mot": "dev",
   "nom": "Chasseurs de Têtes",
   "quand": "La cible est leur proie",
   "texte": "This unit's attacks that target this unit's quarry have [DEVASTATING WOUNDS] and [PRECISION]."
  }
 ],
 "Wulfen Dreadnought": [
  {
   "champ": "rrW",
   "val": "failed",
   "port": "C",
   "nom": "Fureur Violente",
   "quand": "Il porte deux armes de mêlée ([JUMELÉE])",
   "texte": "If this model is equipped with two melee weapons, melee attacks made by this unit have [TWIN-LINKED]."
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
 "Arjac Rockfist": [
  {
   "champ": "rrH",
   "val": "ones",
   "nom": "Champion de la Garde du Roi",
   "texte": "This model’s attacks that target a Character unit: - Can re-roll hit rolls of 1. - Can re-roll wound rolls of 1.",
   "vs": [
    "perso"
   ]
  },
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Champion de la Garde du Roi",
   "texte": "This model’s attacks that target a Character unit: - Can re-roll hit rolls of 1. - Can re-roll wound rolls of 1.",
   "vs": [
    "perso"
   ]
  }
 ]
};
const AURAS_PERSO = {
 "Wolf Guard Battle Leader": [
  {
   "mot": "sust:1",
   "nom": "Férocité Maîtrisée",
   "texte": "- This unit's attacks have [SUSTAINED HITS 1]. - This unit's attacks that target an enemy unit within 6\" of this unit can re-roll hit rolls of 1."
  }
 ],
 "Ulrik the Slayer": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Lié par Serment",
   "texte": "This unit's melee attacks have +1 to hit rolls. - Or: This unit's melee attacks that target this unit's slayer's oath have +1 to hit rolls and wound rolls."
  }
 ],
 "Canis Wolfborn": [
  {
   "mot": "sust:1",
   "port": "C",
   "nom": "Né des Loups",
   "texte": "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
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
  "source": "Wolf Guard Battle Leader",
  "kw": [
   "Wolf Guard Battle Leader"
  ],
  "nom": "Férocité Maîtrisée — relance (Meneur)",
  "quand": "L'unité est menée par Wolf Guard Battle Leader, et la cible est à 6\" ou moins",
  "texte": "- This unit's attacks have [SUSTAINED HITS 1]. - This unit's attacks that target an enemy unit within 6\" of this unit can re-roll hit rolls of 1.",
  "champ": "rrH",
  "val": "ones"
 },
 {
  "source": "Wolf Guard Battle Leader in Terminator Armour",
  "kw": [
   "Wolf Guard Battle Leader in Terminator Armour"
  ],
  "nom": "Précision Tactique (Meneur)",
  "quand": "L'unité est menée par Wolf Guard Battle Leader in Terminator Armour, et la cible n'est ni MONSTRE ni VÉHICULE",
  "texte": "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE].",
  "mot": "lethal"
 },
 {
  "source": "Wolf Guard Battle Leader on Thunderwolf",
  "kw": [
   "Wolf Guard Battle Leader on Thunderwolf"
  ],
  "nom": "Précision Tactique (Meneur)",
  "quand": "L'unité est menée par Wolf Guard Battle Leader on Thunderwolf, et la cible n'est ni MONSTRE ni VÉHICULE",
  "texte": "This unit's attacks have [LETHAL HITS: non-MONSTER/VEHICLE].",
  "mot": "lethal"
 },
 {
  "source": "Ulrik the Slayer",
  "kw": [
   "Ulrik the Slayer"
  ],
  "nom": "Lié par Serment — serment (Meneur)",
  "quand": "L'unité est menée par Ulrik the Slayer, et la cible est le serment du Tueur",
  "texte": "This unit's melee attacks have +1 to hit rolls. - Or: This unit's melee attacks that target this unit's slayer's oath have +1 to hit rolls and wound rolls.",
  "champ": "wndMod",
  "val": 1,
  "port": "C"
 },
 {
  "source": "Wolf Priest",
  "kw": [
   "Wolf Priest"
  ],
  "nom": "Litanie de Haine (Meneur)",
  "quand": "L'unité est menée par Wolf Priest, et elle a chargé ce tour ([LANCE] : +1 pour blesser)",
  "texte": "This unit's melee attacks have [LANCE]",
  "champ": "wndMod",
  "val": 1,
  "port": "C"
 },
 {
  "source": "Harald Deathwolf",
  "kw": [
   "Harald Deathwolf"
  ],
  "nom": "Seigneur des Loups (Meneur)",
  "quand": "L'unité est menée par Harald Deathwolf, et elle a chargé ce tour — crocs et griffes seulement",
  "texte": "While this model is leading a unit, each time that unit makes a Charge move, until the end of the turn, crushing teeth and claws equipped by models in that unit have the [DEVASTATING WOUNDS] ability.",
  "mot": "dev",
  "port": "C"
 },
 {
  "source": "Krom Dragongaze",
  "kw": [
   "Krom Dragongaze"
  ],
  "nom": "Refus de la Défaite (Meneur)",
  "quand": "L'unité est menée par Krom Dragongaze, et elle est sous son effectif de départ",
  "texte": "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll if that unit is below its Starting Strength, and add 1 to the Wound roll as well if that unit is Below Half-strength.",
  "champ": "hitMod",
  "val": 1
 },
 {
  "source": "Krom Dragongaze",
  "kw": [
   "Krom Dragongaze"
  ],
  "nom": "Refus de la Défaite — sous la moitié (Meneur)",
  "quand": "L'unité est menée par Krom Dragongaze, et elle est sous la moitié de son effectif",
  "texte": "add 1 to the Wound roll as well if that unit is Below Half-strength.",
  "champ": "wndMod",
  "val": 1
 },
 {
  "source": "Ragnar Blackmane",
  "kw": [
   "Ragnar Blackmane"
  ],
  "nom": "Hurlement de Guerre (Meneur)",
  "quand": "L'unité est menée par Ragnar Blackmane, et ce sont des Griffes Sanglantes",
  "texte": "While this model is attached to a Blood Claws unit, this unit's melee attacks have +1 S and [SUSTAINED HITS 1].",
  "champ": "strMod",
  "val": 1,
  "port": "C"
 },
 {
  "source": "Ragnar Blackmane",
  "kw": [
   "Ragnar Blackmane"
  ],
  "nom": "Hurlement de Guerre — Soutenues (Meneur)",
  "quand": "L'unité est menée par Ragnar Blackmane, et ce sont des Griffes Sanglantes",
  "texte": "While this model is attached to a Blood Claws unit, this unit's melee attacks have +1 S and [SUSTAINED HITS 1].",
  "mot": "sust",
  "port": "C"
 },
 {
  "detach": "Saga of the Beastslayer",
  "kw": [
   "Blood Claws",
   "Thunderwolf Cavalry",
   "Wulfen",
   "Wulfen with Storm Shields"
  ],
  "mot": "lethal",
  "nom": "Tueurs Légendaires",
  "quand": "L'unité est des Griffes Sanglantes, de la Cavalerie Loup-Tonnerre ou des Wulfen, contre un PERSONNAGE, un MONSTRE ou un VÉHICULE",
  "texte": "Attacks made by friendly Blood Claws/Thunderwolf Cavalry/Wulfen units have [Lethal Hits: Character/Monster/Vehicle]."
 },
 {
  "detach": "Saga of the Great Wolf",
  "kw": [],
  "sauf": [
   "monster",
   "vehicle"
  ],
  "champ": "rrH",
  "val": "ones",
  "port": "T",
  "nom": "Maître des Loups — Œil du Chasseur",
  "quand": "La doctrine Devastator est active pour l'unité",
  "texte": "Hunter’s Eye: If the devastator doctrine is active for your unit, your unit’s ranged attacks can re-roll hit rolls of 1."
 },
 {
  "detach": "Saga of the Great Wolf",
  "kw": [],
  "sauf": [
   "monster",
   "vehicle"
  ],
  "mot": "sust",
  "nom": "Maître des Loups — Frappe Féroce",
  "quand": "La doctrine tactique est active pour l'unité, et la cible est à 9\" ou moins",
  "texte": "Ferocious Strike: If the tactical doctrine is active for your unit, your unit’s attacks that target an enemy unit with 9\" have [Sustained Hits 1]."
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
  "nom": "Champion's Guidance",
  "detach": "Champions of Fenris",
  "pc": 1,
  "ph": "C",
  "unites": [
   "character"
  ],
  "sauf": [],
  "aide": "relance des 1 pour toucher et pour blesser",
  "effet": {
   "rrH": "ones",
   "rrW": "ones"
  }
 },
 {
  "nom": "Unbridled Feroicity",
  "detach": "Saga of the Beastslayer",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Blood Claws",
   "Thunderwolf Cavalry",
   "Wulfen",
   "Wulfen with Storm Shields"
  ],
  "sauf": [],
  "aide": "[LANCE] : +1 pour blesser, l'unité devant avoir chargé ce tour",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Eye of the Pack",
  "detach": "Saga of the Great Wolf",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "infantry"
  ],
  "sauf": [],
  "aide": "relance des 1 et des 2 pour blesser — seuls les 1 sont comptés, le moteur ne connaît pas mieux",
  "effet": {
   "rrW": "ones"
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
  cle : "spacewolves",
  nom : "Space Wolves",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
