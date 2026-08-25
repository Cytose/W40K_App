/* ============================================================
   Données Astra Militarum — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py astra

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     72 fiches sur 134 en ont un. Les autres — des Legends, que le
     guide ne liste pas — sont posées sur un socle par défaut.
   · STRATS est vide — ni BSData ni le Munitorum ne portent les
     stratagèmes. Ils se saisissent à la main dans l'application.
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
  ["Aegis Defence Line",0,12,2,0,10,[1],{"1": 145},0,"",0,"",0,"7+"],
  ["Aquila Lander",14,9,3,0,12,[1],{"1": 120},0,"",1,"",0,"7+"],
  ["Arkurian Stormhammer",9,13,2,0,24,[1],{"1": 480},0,"",1,"",8,"7+"],
  ["Armageddon-pattern Medusa",10,9,3,0,11,[1],{"1": 105},0,"",1,"",3,"7+"],
  ["Armoured Sentinels",8,8,2,0,7,[1, 2],{"1": 65, "2": 120},0,"",0,"",2,"7+"],
  ["Artillery Team",3,7,3,0,10,[1],{"1": 95},0,"",0,"",3,"7+"],
  ["Arvus Lighter",14,8,3,0,8,[1],{"1": 95},0,"",1,"",0,"7+"],
  ["Atlas Recovery Vehicle",10,9,3,0,10,[1],{"1": 80},0,"",1,"",3,"7+"],
  ["Attilan Rough Riders",12,4,4,0,2,[5, 10],[[1, {"5": 60, "10": 120}], [3, {"5": 65, "10": 125}]],0,"",0,"",1,"7+"],
  ["Avenger Strike Fighter",0,9,3,0,14,[1],{"1": 130},0,"",0,"",0,"7+"],
  ["Baneblade",12,13,2,0,24,[1],[[1, {"1": 415}], [2, {"1": 450}]],0,"",0,"",8,"7+"],
  ["Banehammer",12,13,2,0,24,[1],[[1, {"1": 385}], [2, {"1": 420}]],0,"",0,"",8,"7+"],
  ["Banesword",12,13,2,0,24,[1],[[1, {"1": 415}], [2, {"1": 450}]],0,"",0,"",8,"7+"],
  ["Basilisk",10,9,3,0,11,[1],[[1, {"1": 115}], [2, {"1": 135}]],0,"",0,"",3,"7+"],
  ["Bullgryn Squad",6,6,3,0,3,[3, 6],[[1, {"3": 90, "6": 200}], [2, {"3": 105, "6": 215}]],0,"",0,"",1,"7+"],
  ["Cadian Castellan",6,3,5,5,4,[1],{"1": 55},0,"Meneur",0,"",1,"7+"],
  ["Cadian Command Squad",6,3,5,0,3,[5],{"5": 60},0,"Meneur",0,"",1,"7+"],
  ["Cadian Heavy Weapons Squad",6,3,5,0,2,[3],{"3": 65},0,"",0,"",2,"7+"],
  ["Cadian Recon Squad",6,3,5,0,1,[10],{"10": 80},0,"",0,"",1,"7+"],
  ["Cadian Shock Troops",6,3,5,0,1,[10, 20],{"10": 75, "20": 145},0,"",0,"",2,"7+"],
  ["Carnodon",12,10,2,0,12,[1],{"1": 160},0,"",1,"",3,"7+"],
  ["Catachan Command Squad",6,3,5,0,3,[5],{"5": 60},0,"Meneur",0,"",1,"7+"],
  ["Catachan Heavy Weapons Squad",6,3,5,0,2,[3],{"3": 65},0,"",0,"",2,"7+"],
  ["Catachan Jungle Fighters",6,3,5,0,1,[10, 20],{"10": 75, "20": 145},0,"",0,"",2,"7+"],
  ["Centaur Light Carrier",10,7,3,0,7,[1],{"1": 40},0,"",1,"",1,"7+"],
  ["Centaur RSV",12,7,3,0,10,[1],[[1, {"1": 65}], [4, {"1": 75}]],0,"",0,"",2,"7+"],
  ["Chimera",10,9,3,0,11,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"7+"],
  ["Colossus",10,10,2,0,11,[1],{"1": 160},0,"",1,"",3,"7+"],
  ["Commissar",6,3,5,5,3,[1],{"1": 30},0,"Meneur",0,"",1,"6+"],
  ["Commissar Graves",12,8,3,4,12,[1],{"1": 125},0,"",0,"",5,"6+"],
  ["Commissar Graves on Foot",6,3,4,5,4,[1],{"1": 65},0,"Meneur",0,"",1,"6+"],
  ["Commissar Yarrick",6,4,4,4,5,[1],{"1": 120},0,"Meneur",0,"",1,"6+"],
  ["Crassus",10,11,2,0,18,[1],{"1": 180},0,"",1,"",5,"7+"],
  ["Cyclops Demolition Vehicle",8,4,3,0,4,[1],[[1, {"1": 40}], [3, {"1": 45}]],0,"",0,"",0,"8+"],
  ["Death Korps Grenadier Squad",6,3,4,0,2,[10],{"10": 110},0,"",1,"",2,"7+"],
  ["Death Korps of Krieg",6,3,5,0,1,[10, 20],{"10": 75, "20": 145},0,"",0,"",2,"7+"],
  ["Death Rider Commissar",12,4,4,5,4,[1],{"1": 35},0,"Meneur",1,"",1,"6+"],
  ["Death Riders",10,4,4,0,2,[5, 10],{"5": 60, "10": 110},0,"",0,"",1,"7+"],
  ["Deathstrike",10,10,3,0,11,[1],[[1, {"1": 125}], [2, {"1": 135}]],0,"",0,"",3,"7+"],
  ["Dominus Armoured Siege Bombard",9,13,2,0,20,[1],{"1": 325},0,"",1,"",8,"7+"],
  ["Doomhammer",12,13,2,0,24,[1],[[1, {"1": 380}], [2, {"1": 410}]],0,"",0,"",8,"7+"],
  ["Earthshaker Carriage Battery",4,7,4,0,6,[1],{"1": 120},0,"",1,"",2,"7+"],
  ["Earthshaker Platform",0,8,3,0,8,[1],{"1": 110},0,"",1,"",2,"7+"],
  ["Elysian Drop Sentinel",10,6,3,0,6,[1],{"1": 85},0,"",1,"",2,"7+"],
  ["Elysian Sniper Squad",6,3,5,0,2,[3],{"3": 65},0,"",1,"",2,"7+"],
  ["Field Ordnance Battery",3,5,4,0,6,[2],{"2": 90},0,"",0,"",2,"7+"],
  ["Gaunt’s Ghosts",6,3,4,5,3,[6],{"6": 95},0,"",0,"",1,"6+"],
  ["Gorgon Heavy Transport",9,13,2,5,20,[1],{"1": 275},0,"",1,"",8,"7+"],
  ["Griffon Mortar Carrier",10,9,3,0,11,[1],{"1": 115},0,"",1,"",3,"7+"],
  ["Hades Breaching Drill",6,9,3,0,8,[1],{"1": 110},0,"",1,"",2,"7+"],
  ["Heavy Mortar Team",4,5,3,0,4,[1],{"1": 50},0,"",1,"",2,"7+"],
  ["Heavy Quad Launcher Team",4,5,3,0,4,[1],{"1": 50},0,"",1,"",2,"7+"],
  ["Hell's Last",6,3,5,5,3,[5],{"5": 80},0,"Meneur",1,"",1,"7+"],
  ["Hellhammer",12,13,2,0,24,[1],[[1, {"1": 385}], [2, {"1": 415}]],0,"",0,"",8,"7+"],
  ["Hellhound",10,10,2,0,11,[1],[[1, {"1": 125}], [3, {"1": 135}]],0,"",0,"",3,"7+"],
  ["Hippogriff AFV",12,8,3,0,7,[1, 2],{"1": 70, "2": 140},0,"",0,"",2,"7+"],
  ["Hydra",10,9,3,0,11,[1],{"1": 90},0,"",0,"",3,"7+"],
  ["Hydra Platform",0,8,3,0,8,[1],{"1": 95},0,"",1,"",2,"7+"],
  ["Kasrkin",6,3,4,0,1,[10],[[1, {"10": 105}], [3, {"10": 120}]],0,"",0,"",1,"7+"],
  ["Krieg Combat Engineers",6,3,4,0,1,[5, 10],[[1, {"5": 65, "10": 95}], [3, {"5": 75, "10": 105}]],0,"",0,"",1,"7+"],
  ["Krieg Command Squad",6,3,5,0,3,[6],{"6": 60},0,"Meneur",0,"",1,"6+"],
  ["Krieg Heavy Weapons Squad",6,3,5,0,1,[4],{"4": 60},0,"",0,"",1,"7+"],
  ["Leman Russ Battle Tank",10,11,2,0,13,[1],[[1, {"1": 185}], [3, {"1": 195}]],0,"",0,"",3,"7+"],
  ["Leman Russ Commander",10,11,2,0,13,[1],[[1, {"1": 215}], [3, {"1": 230}]],0,"",0,"",3,"7+"],
  ["Leman Russ Demolisher",10,11,2,0,13,[1],[[1, {"1": 180}], [3, {"1": 190}]],0,"",0,"",3,"7+"],
  ["Leman Russ Eradicator",10,11,2,0,13,[1],[[1, {"1": 170}], [3, {"1": 180}]],0,"",0,"",3,"7+"],
  ["Leman Russ Executioner",10,11,2,0,13,[1],[[1, {"1": 170}], [3, {"1": 180}]],0,"",0,"",3,"7+"],
  ["Leman Russ Exterminator",10,11,2,0,13,[1],[[1, {"1": 180}], [3, {"1": 190}]],0,"",0,"",3,"7+"],
  ["Leman Russ Punisher",10,11,2,0,13,[1],[[1, {"1": 150}], [3, {"1": 160}]],0,"",0,"",3,"7+"],
  ["Leman Russ Vanquisher",10,11,2,0,13,[1],[[1, {"1": 150}], [3, {"1": 160}]],0,"",0,"",3,"7+"],
  ["Lord Marshal Dreir",10,4,4,4,6,[1],{"1": 75},0,"Meneur",0,"",2,"7+"],
  ["Lord Solar Leontus",12,4,3,4,8,[1],{"1": 130},0,"Meneur",0,"",2,"6+"],
  ["Macharius",9,13,2,0,20,[1],{"1": 310},0,"",1,"",8,"7+"],
  ["Macharius Omega",9,13,2,0,20,[1],{"1": 310},0,"",1,"",8,"7+"],
  ["Macharius Vanquisher",9,13,2,0,20,[1],{"1": 285},0,"",1,"",8,"7+"],
  ["Macharius Vulcan",9,13,2,0,20,[1],{"1": 310},0,"",1,"",8,"7+"],
  ["Malcador",10,11,2,0,18,[1],{"1": 250},0,"",1,"",5,"7+"],
  ["Malcador Annihilator",10,11,2,0,18,[1],{"1": 270},0,"",1,"",5,"7+"],
  ["Malcador Defender",10,11,2,0,18,[1],{"1": 310},0,"",1,"",5,"7+"],
  ["Malcador Infernus",10,11,2,0,18,[1],{"1": 235},0,"",1,"",5,"7+"],
  ["Manticore",10,10,3,0,11,[1],[[1, {"1": 150}], [2, {"1": 170}]],0,"",0,"",3,"7+"],
  ["Manticore Platform",0,8,3,0,8,[1],{"1": 95},0,"",1,"",2,"7+"],
  ["Marauder Bomber",0,10,2,0,20,[1],{"1": 345},0,"",1,"",0,"7+"],
  ["Marauder Destroyer",0,10,2,0,20,[1],{"1": 375},0,"",1,"",0,"7+"],
  ["Medusa Carriage Battery",4,7,4,0,6,[1],{"1": 125},0,"",1,"",2,"7+"],
  ["Militarum Tempestus Command Squad",6,3,4,0,3,[5],[[1, {"5": 85}], [3, {"5": 95}]],0,"Meneur",0,"",1,"7+"],
  ["Ministorum Priest",6,3,6,4,3,[1],{"1": 35},0,"Meneur",0,"",1,"7+"],
  ["Minotaur",10,11,2,0,18,[1],{"1": 225},0,"",1,"",5,"7+"],
  ["Mukaali Riders",8,6,4,0,5,[3],{"3": 110},0,"",1,"",2,"7+"],
  ["Munitorum Servitors",6,3,4,6,1,[4],{"4": 35},0,"",1,"",0,"8+"],
  ["Nork Deddog",6,6,4,0,6,[1],{"1": 60},0,"",0,"",1,"7+"],
  ["Ogryn Bodyguard",6,6,5,0,6,[1],{"1": 40},0,"",0,"",1,"7+"],
  ["Ogryn Squad",6,6,5,0,3,[3, 6],{"3": 60, "6": 120},0,"",0,"",1,"7+"],
  ["Praetor",10,11,2,0,18,[1],{"1": 275},0,"",1,"",5,"7+"],
  ["Primaris Psyker",6,3,5,0,3,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Provisionally Prepared",6,2,6,0,2,[1],{"1": 40},0,"Meneur",1,"",2,"8+"],
  ["Quartermaster Cadre Squad",6,3,4,0,3,[5],{"5": 45},0,"Meneur",1,"",1,"7+"],
  ["Rapier Laser Destroyer Battery",6,4,4,0,3,[1, 2, 3],{"1": 35, "2": 70, "3": 105},0,"",1,"",1,"7+"],
  ["Ratlings",6,2,6,0,1,[5, 10],{"5": 60, "10": 100},0,"",0,"",1,"8+"],
  ["Regimental Attachés",6,3,5,0,1,[3],{"3": 40},0,"",1,"",1,"7+"],
  ["Rein and Raus",6,2,6,0,1,[2],{"2": 50},0,"",1,"",1,"8+"],
  ["Rogal Dorn Battle Tank",10,12,2,0,18,[1],[[1, {"1": 260}], [2, {"1": 275}]],0,"",0,"",5,"7+"],
  ["Rogal Dorn Commander",10,12,2,0,18,[1],[[1, {"1": 290}], [2, {"1": 305}]],0,"",0,"",5,"7+"],
  ["Sabre Weapons Battery",0,4,4,0,4,[1, 2],{"1": 45, "2": 90},0,"",1,"",1,"7"],
  ["Salamander Command Vehicle",12,8,3,0,10,[1],{"1": 80},0,"",1,"",3,"7+"],
  ["Salamander Scout Vehicle",12,8,3,0,10,[1],{"1": 95},0,"",1,"",3,"7+"],
  ["Scout Sentinels",10,7,3,0,7,[1, 2],{"1": 55, "2": 100},0,"",0,"",2,"7+"],
  ["Sentinel Powerlifter",8,7,3,0,6,[1],{"1": 55},0,"",1,"",2,"7+"],
  ["Sergeant Harker",6,4,5,0,3,[1],{"1": 40},0,"Meneur",1,"",1,"7+"],
  ["Shadowsword",12,13,2,0,24,[1],[[1, {"1": 375}], [2, {"1": 405}]],0,"",0,"",8,"7+"],
  ["Sly Marbo",6,3,5,0,4,[1],{"1": 55},0,"",0,"",1,"7+"],
  ["Storm Chimera",10,9,3,0,11,[1],{"1": 90},0,"",1,"",2,"7+"],
  ["Stormblade",9,13,2,0,24,[1],{"1": 415},0,"",1,"",8,"7+"],
  ["Stormlord",12,13,2,0,24,[1],[[1, {"1": 395}], [2, {"1": 430}]],0,"",0,"",8,"7+"],
  ["Stormsword",12,13,2,0,24,[1],[[1, {"1": 430}], [2, {"1": 465}]],0,"",0,"",8,"7+"],
  ["Stygies Destroyer Tank Hunter",10,11,2,0,13,[1],{"1": 180},0,"",1,"",3,"7+"],
  ["Tarantula Battery",0,5,3,0,4,[1, 2, 3],{"1": 40, "2": 80, "3": 120},0,"",1,"",0,"7+"],
  ["Tauros Assault Vehicle",12,6,4,0,6,[1],{"1": 50},0,"",1,"",2,"7+"],
  ["Tauros Venator",12,6,4,0,6,[1],{"1": 50},0,"",1,"",2,"7+"],
  ["Taurox",12,8,3,0,10,[1],[[1, {"1": 65}], [4, {"1": 75}]],0,"",0,"",2,"7+"],
  ["Taurox Prime",12,8,3,0,10,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"7+"],
  ["Tech-Priest Enginseer",6,4,3,5,3,[1],{"1": 45},0,"Meneur",0,"",1,"7+"],
  ["Tempestus Aquilons",6,3,4,0,1,[10],{"10": 95},0,"",0,"",1,"7+"],
  ["Tempestus Scions",6,3,4,0,1,[5, 10],[[1, {"5": 75, "10": 150}], [3, {"5": 85, "10": 160}]],0,"",0,"",1,"7+"],
  ["Trojan Support Vehicle",10,9,3,0,11,[1],{"1": 80},0,"",1,"",2,"7+"],
  ["Ursula Creed",6,3,4,5,4,[1],{"1": 85},0,"Meneur",0,"",1,"7+"],
  ["Valdor",9,13,2,0,20,[1],{"1": 285},0,"",1,"",8,"7+"],
  ["Valkyrie",14,10,2,0,14,[1],[[1, {"1": 170}], [3, {"1": 180}]],0,"",0,"",0,"7+"],
  ["Valkyrie Sky Talon",14,10,2,0,14,[1],{"1": 185},0,"",1,"",0,"7+"],
  ["Vendetta Gunship",14,10,2,0,14,[1],{"1": 255},0,"",1,"",0,"7+"],
  ["Voss-pattern Lightning",0,9,3,0,14,[1],{"1": 130},0,"",1,"",0,"7+"],
  ["Vulture Gunship",14,10,2,0,14,[1],{"1": 225},0,"",1,"",0,"7+"],
  ["Wyvern",10,9,3,0,11,[1],[[1, {"1": 95}], [2, {"1": 115}]],0,"",0,"",3,"7+"],
  ["‘Iron Hand’ Straken",6,3,3,4,4,[1],{"1": 55},0,"Meneur",1,"",1,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Aquila Lander","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Aquila Lander","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Aquila Lander","Multi-laser","T","4",4,6,0,"1","","36\""],
  ["Aquila Lander","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Arkurian Stormhammer","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Arkurian Stormhammer","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Arkurian Stormhammer","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Arkurian Stormhammer","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Arkurian Stormhammer","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Arkurian Stormhammer","Multi-laser","T","4",4,6,0,"1","","48\""],
  ["Arkurian Stormhammer","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Arkurian Stormhammer","Stormhammer cannon","T","3D6",4,12,2,"3","blast","72\""],
  ["Arkurian Stormhammer","Twin battle cannon","T","D6+3",4,9,1,"3","blast twin","48\""],
  ["Arkurian Stormhammer","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Armageddon-pattern Medusa","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Armageddon-pattern Medusa","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Armageddon-pattern Medusa","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Armageddon-pattern Medusa","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Armageddon-pattern Medusa","Medusa siege cannon","T","D6",4,12,2,"4","blast indirect","36\""],
  ["Armageddon-pattern Medusa","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Armageddon-pattern Medusa","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Armoured Sentinels","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Armoured Sentinels","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Armoured Sentinels","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Armoured Sentinels","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Armoured Sentinels","Multi-laser","T","4",4,6,0,"1","","36\""],
  ["Armoured Sentinels","➤ Missile launcher - frag","T","D6",4,4,0,"1","blast heavy","48\""],
  ["Armoured Sentinels","➤ Missile launcher - krak","T","1",4,9,2,"D6","heavy","48\""],
  ["Armoured Sentinels","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Armoured Sentinels","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Armoured Sentinels","Close combat weapon","C","2",4,6,0,"1","","càc"],
  ["Armoured Sentinels","Sentinel chainsaw","C","3",4,6,1,"1","","càc"],
  ["Artillery Team","Heavy mortar","T","D6+3",5,8,1,"2","blast heavy indirect","48\""],
  ["Artillery Team","Heavy quad launcher","T","2D6",5,5,0,"1","blast heavy indirect twin","48\""],
  ["Artillery Team","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Artillery Team","Multiple rocket launcher","T","D6+3",5,2,1,"1","anti:3:inf blast heavy indirect","48\""],
  ["Artillery Team","Siege cannon","T","D6",5,12,2,"3","blast heavy indirect","48\""],
  ["Artillery Team","Crew close combat weapons","C","3",4,3,0,"1","","càc"],
  ["Arvus Lighter","Armoured Hull","C","2",4,5,0,"1","","càc"],
  ["Atlas Recovery Vehicle","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Atlas Recovery Vehicle","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Atlas Recovery Vehicle","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Atlas Recovery Vehicle","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Atlas Recovery Vehicle","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Attilan Rough Riders","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Attilan Rough Riders","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Attilan Rough Riders","Goad lance","C","2",3,6,2,"2","lance","càc"],
  ["Attilan Rough Riders","Power sabre","C","4",3,4,2,"1","","càc"],
  ["Attilan Rough Riders","Steed's hooves","C","2",4,4,0,"1","extra","càc"],
  ["Attilan Rough Riders","➤ Hunting lance - frag tip","C","D6",3,4,0,"1","lance","càc"],
  ["Attilan Rough Riders","➤ Hunting lance - melta tip","C","1",3,9,4,"D6","lance","càc"],
  ["Avenger Strike Fighter","Avenger bolt cannon","T","10",4,6,1,"2","sust:1","36\""],
  ["Avenger Strike Fighter","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Avenger Strike Fighter","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Avenger Strike Fighter","Armoured hull","C","6",4,8,0,"1","","càc"],
  ["Baneblade","Baneblade cannon","T","3D6",4,12,2,"3","blast","72\""],
  ["Baneblade","Coaxial autocannon","T","2",4,9,1,"3","","48\""],
  ["Baneblade","Demolisher cannon","T","D6+3",4,14,3,"D6","blast","24\""],
  ["Baneblade","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Baneblade","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Baneblade","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Baneblade","Twin heavy flamer","T","D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Baneblade","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Banehammer","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Banehammer","Tremor cannon","T","2D6+3",4,12,2,"3","blast","36\""],
  ["Banehammer","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Banehammer","Twin heavy flamer","T","D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Banehammer","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Banesword","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Banesword","Quake cannon","T","D6+6",4,16,4,"4","blast ignorescover","72\""],
  ["Banesword","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Banesword","Twin heavy flamer","T","D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Banesword","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Basilisk","Earthshaker cannon","T","D6+3",4,8,2,"2","blast indirect","240\""],
  ["Basilisk","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Basilisk","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Basilisk","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Basilisk","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Bullgryn Squad","Grenadier gauntlet","T","D6",4,4,0,"1","blast","18\""],
  ["Bullgryn Squad","Bullgryn maul","C","4",3,7,1,"2","","càc"],
  ["Bullgryn Squad","Close combat weapon","C","4",3,6,0,"1","","càc"],
  ["Cadian Castellan","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Cadian Castellan","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Cadian Castellan","Laspistol","T","1",3,3,0,"1","pistol","12\""],
  ["Cadian Castellan","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Cadian Castellan","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Cadian Castellan","Chainsword","C","5",3,3,0,"1","","càc"],
  ["Cadian Castellan","Close combat weapon","C","3",3,3,0,"1","","càc"],
  ["Cadian Castellan","Power fist","C","3",3,6,2,"2","","càc"],
  ["Cadian Castellan","Power weapon","C","4",3,4,2,"1","","càc"],
  ["Cadian Command Squad","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Cadian Command Squad","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Cadian Command Squad","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Cadian Command Squad","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Cadian Command Squad","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Cadian Command Squad","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Cadian Command Squad","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Cadian Command Squad","➤ Plasma gun - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Cadian Command Squad","➤ Plasma gun - supercharge","T","1",4,8,3,"2","hazardous rf:1","24\""],
  ["Cadian Command Squad","➤ Plasma pistol - standard","T","1",4,7,2,"1","pistol","12\""],
  ["Cadian Command Squad","➤ Plasma pistol - supercharge","T","1",4,8,3,"2","hazardous pistol","12\""],
  ["Cadian Command Squad","Chainsword","C","4",4,3,0,"1","","càc"],
  ["Cadian Command Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Cadian Command Squad","Power fist","C","3",4,6,2,"2","","càc"],
  ["Cadian Command Squad","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Cadian Heavy Weapons Squad","Autocannon","T","2",5,9,1,"3","heavy","48\""],
  ["Cadian Heavy Weapons Squad","Heavy bolter","T","3",5,5,1,"2","heavy sust:1","36\""],
  ["Cadian Heavy Weapons Squad","Lascannon","T","1",5,12,3,"D6+1","heavy","48\""],
  ["Cadian Heavy Weapons Squad","Laspistol","T","2",4,3,0,"1","pistol","12\""],
  ["Cadian Heavy Weapons Squad","Mortar","T","D6",5,5,0,"1","blast heavy indirect","48\""],
  ["Cadian Heavy Weapons Squad","➤ Missile launcher - frag","T","D6",5,4,0,"1","blast heavy","48\""],
  ["Cadian Heavy Weapons Squad","➤ Missile launcher - krak","T","1",5,9,2,"D6","heavy","48\""],
  ["Cadian Heavy Weapons Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Cadian Recon Squad","Autostubber","T","3",4,4,0,"1","rf:3","24\""],
  ["Cadian Recon Squad","Lasgun","T","1",4,3,0,"1","assault rf:1","24\""],
  ["Cadian Recon Squad","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Cadian Recon Squad","Long-las","T","1",4,4,2,"2","heavy precision","36\""],
  ["Cadian Recon Squad","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Cadian Recon Squad","➤ Missile launcher - frag","T","D6",5,4,0,"1","blast heavy","48\""],
  ["Cadian Recon Squad","➤ Missile launcher - krak","T","1",5,9,2,"D6","heavy","48\""],
  ["Cadian Recon Squad","➤ Plasma gun - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Cadian Recon Squad","➤ Plasma gun - supercharge","T","1",4,8,3,"2","hazardous rf:1","24\""],
  ["Cadian Recon Squad","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Cadian Shock Troops","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Cadian Shock Troops","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Cadian Shock Troops","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Cadian Shock Troops","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Cadian Shock Troops","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Cadian Shock Troops","Sergeant's autogun","T","2",4,3,0,"1","","24\""],
  ["Cadian Shock Troops","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Cadian Shock Troops","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Cadian Shock Troops","➤ Plasma gun - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Cadian Shock Troops","➤ Plasma gun - supercharge","T","1",4,8,3,"2","rf:1 hazardous","24\""],
  ["Cadian Shock Troops","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Cadian Shock Troops","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Carnodon","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Carnodon","Carnodon twin autocannon","T","2",4,9,1,"3","twin","48\""],
  ["Carnodon","Carnodon twin lascannon","T","1",4,14,3,"D6+1","twin","48\""],
  ["Carnodon","Carnodon twin multi-laser","T","6",4,6,0,"1","twin","36\""],
  ["Carnodon","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Carnodon","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Carnodon","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Carnodon","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Carnodon","Multi-laser","T","4",4,6,0,"1","","36\""],
  ["Carnodon","Volkite caliver","T","2",4,5,0,"1","dev","24\""],
  ["Carnodon","Volkite culverin","T","4",4,6,0,"2","dev","36\""],
  ["Carnodon","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Catachan Command Squad","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Catachan Command Squad","Boltgun","T","1",4,4,0,"1","rf:1","24\""],
  ["Catachan Command Squad","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Catachan Command Squad","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Catachan Command Squad","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Catachan Command Squad","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Catachan Command Squad","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Catachan Command Squad","Sniper rifle","T","1",4,4,2,"2","heavy precision","36\""],
  ["Catachan Command Squad","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Catachan Command Squad","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Catachan Command Squad","➤ Plasma gun - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Catachan Command Squad","➤ Plasma gun - supercharge","T","1",4,8,3,"2","hazardous rf:1","24\""],
  ["Catachan Command Squad","➤ Plasma pistol - standard","T","1",4,7,2,"1","pistol","12\""],
  ["Catachan Command Squad","➤ Plasma pistol - supercharge","T","1",4,8,3,"2","hazardous pistol","12\""],
  ["Catachan Command Squad","Chainsword","C","4",4,3,0,"1","","càc"],
  ["Catachan Command Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Catachan Command Squad","Power fist","C","3",4,6,2,"2","","càc"],
  ["Catachan Command Squad","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Catachan Heavy Weapons Squad","Autocannon","T","2",5,9,1,"3","heavy","48\""],
  ["Catachan Heavy Weapons Squad","Heavy bolter","T","3",5,5,1,"2","heavy sust:1","36\""],
  ["Catachan Heavy Weapons Squad","Lascannon","T","1",5,12,3,"D6+1","heavy","48\""],
  ["Catachan Heavy Weapons Squad","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Catachan Heavy Weapons Squad","Mortar","T","D6",5,5,0,"1","blast heavy indirect","48\""],
  ["Catachan Heavy Weapons Squad","➤ Missile launcher - frag","T","D6",5,4,0,"1","blast heavy","48\""],
  ["Catachan Heavy Weapons Squad","➤ Missile launcher - krak","T","1",5,9,2,"D6","heavy","48\""],
  ["Catachan Heavy Weapons Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Catachan Jungle Fighters","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Catachan Jungle Fighters","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Catachan Jungle Fighters","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Catachan Jungle Fighters","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Centaur Light Carrier","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Centaur Light Carrier","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Centaur Light Carrier","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Centaur RSV","Pintle-mounted heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Centaur RSV","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Chimera","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Chimera","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Chimera","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Chimera","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Chimera","Lasgun array","T","6",4,3,0,"1","rf:6","24\""],
  ["Chimera","Multi-laser","T","4",4,6,0,"1","","36\""],
  ["Chimera","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Chimera","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Colossus","Colossus siege mortar","T","D6",4,6,1,"D6+2","blast dev","120\""],
  ["Colossus","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Colossus","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Colossus","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Colossus","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Commissar","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Commissar","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Commissar","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Commissar","Chainsword","C","4",3,3,0,"1","","càc"],
  ["Commissar","Power weapon","C","3",3,4,2,"1","","càc"],
  ["Commissar Graves","Chiron gatling cannon","T","12",3,5,0,"1","","24\""],
  ["Commissar Graves","Prefectus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["Commissar Graves","Armoured hull","C","3",4,6,0,"1","extra","càc"],
  ["Commissar Graves","Enforcer crew","C","10",4,3,0,"1","extra","càc"],
  ["Commissar Graves","Power sword and Manus Mortis","C","5",2,6,2,"2","lance","càc"],
  ["Commissar Graves on Foot","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Commissar Graves on Foot","Power sword and Manus Mortis","C","5",2,6,2,"2","","càc"],
  ["Commissar Yarrick","Bale Eye","T","2",2,6,2,"D3+1","precision","12\""],
  ["Commissar Yarrick","Laspistol","T","1",2,3,0,"1","pistol","12\""],
  ["Commissar Yarrick","Storm bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Commissar Yarrick","Power klaw","C","4",2,8,2,"2","","càc"],
  ["Commissar Yarrick","Power sword","C","6",2,4,2,"1","","càc"],
  ["Crassus","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Crassus","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Crassus","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Crassus","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Death Korps Grenadier Squad","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Death Korps Grenadier Squad","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Death Korps Grenadier Squad","Heavy stubber","T","3",4,4,0,"1","heavy rf:3","36\""],
  ["Death Korps Grenadier Squad","Hot-shot lasgun","T","1",3,3,1,"1","rf:1","24\""],
  ["Death Korps Grenadier Squad","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Death Korps Grenadier Squad","Sergeant's pistol","T","1",3,4,1,"1","pistol","12\""],
  ["Death Korps Grenadier Squad","Sniper rifle","T","1",4,4,2,"2","heavy precision","36\""],
  ["Death Korps Grenadier Squad","➤ Grenade launcher - frag","T","D3",3,4,0,"1","blast","24\""],
  ["Death Korps Grenadier Squad","➤ Grenade launcher - krak","T","1",3,9,2,"D3","","24\""],
  ["Death Korps Grenadier Squad","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Death Korps Grenadier Squad","➤ Plasma gun - supercharge","T","1",3,8,3,"2","rf:1 hazardous","24\""],
  ["Death Korps Grenadier Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Death Korps Grenadier Squad","Sergeant's close combat weapon","C","2",4,4,2,"1","","càc"],
  ["Death Korps of Krieg","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Death Korps of Krieg","Boltgun","T","1",4,4,0,"1","rf:1","24\""],
  ["Death Korps of Krieg","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Death Korps of Krieg","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Death Korps of Krieg","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Death Korps of Krieg","Long-las","T","1",4,4,2,"2","heavy precision","36\""],
  ["Death Korps of Krieg","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Death Korps of Krieg","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Death Korps of Krieg","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Death Korps of Krieg","➤ Plasma gun - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Death Korps of Krieg","➤ Plasma gun - supercharge","T","1",4,8,3,"2","rf:1 hazardous","24\""],
  ["Death Korps of Krieg","➤ Plasma pistol - standard","T","1",4,7,2,"1","pistol","12\""],
  ["Death Korps of Krieg","➤ Plasma pistol - supercharge","T","1",4,8,3,"2","hazardous pistol","12\""],
  ["Death Korps of Krieg","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Death Korps of Krieg","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Death Korps of Krieg","Power weapon","C","2",4,4,2,"1","","càc"],
  ["Death Rider Commissar","Commisar's pistol","T","1",3,3,1,"1","pistol","12\""],
  ["Death Rider Commissar","Commissar’s close combat weapon","C","3",3,4,2,"1","","càc"],
  ["Death Rider Commissar","Savage claws","C","2",4,4,1,"1","extra","càc"],
  ["Death Riders","Death Rider lascarbine","T","2",4,3,0,"1","assault","18\""],
  ["Death Riders","Frag lance","C","D6",3,4,0,"1","lance","càc"],
  ["Death Riders","Power sabre","C","3",3,4,2,"1","","càc"],
  ["Death Riders","Steed's savage claws","C","2",4,4,1,"1","extra","càc"],
  ["Deathstrike","Deathstrike Missile","T","2D6",2,16,4,"1","blast oneshot","N/A"],
  ["Deathstrike","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Deathstrike","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Deathstrike","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Deathstrike","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Dominus Armoured Siege Bombard","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Dominus Armoured Siege Bombard","Dominus triple bombard","T","2D6",4,12,2,"3","blast indirect","48\""],
  ["Dominus Armoured Siege Bombard","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Dominus Armoured Siege Bombard","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Dominus Armoured Siege Bombard","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Dominus Armoured Siege Bombard","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Dominus Armoured Siege Bombard","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Dominus Armoured Siege Bombard","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Dominus Armoured Siege Bombard","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Doomhammer","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Doomhammer","Magma cannon","T","D6+3",4,12,4,"D6","blast melta:6","24\""],
  ["Doomhammer","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Doomhammer","Twin heavy flamer","T","D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Doomhammer","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Earthshaker Carriage Battery","Earthshaker cannon","T","D6+3",5,8,2,"2","blast heavy indirect","240\""],
  ["Earthshaker Carriage Battery","Battery close combat weapons","C","5",4,3,0,"1","","càc"],
  ["Earthshaker Platform","Earthshaker Cannon","T","D6+3",4,8,2,"2","blast indirect","240\""],
  ["Earthshaker Platform","Close combat weapons","C","3",4,3,0,"1","","càc"],
  ["Elysian Drop Sentinel","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Elysian Drop Sentinel","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Elysian Drop Sentinel","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Elysian Drop Sentinel","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Elysian Drop Sentinel","Close Combat Weapons","C","2",4,6,0,"1","","càc"],
  ["Elysian Sniper Squad","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Elysian Sniper Squad","Sniper rifle","T","1",3,4,2,"2","heavy precision","36\""],
  ["Elysian Sniper Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Field Ordnance Battery","Bombast field gun","T","D6",5,7,1,"2","blast heavy indirect","48\""],
  ["Field Ordnance Battery","Heavy lascannon","T","2",5,14,3,"D6+1","heavy","48\""],
  ["Field Ordnance Battery","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Field Ordnance Battery","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Field Ordnance Battery","Malleus rocket launcher","T","D6+6",5,6,1,"1","blast heavy","48\""],
  ["Field Ordnance Battery","Battery close combat weapons","C","3",4,3,0,"1","","càc"],
  ["Gaunt’s Ghosts","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Gaunt’s Ghosts","Bragg's autocannon","T","4",5,9,1,"3","heavy","48\""],
  ["Gaunt’s Ghosts","Corbec's hot-shot lascarbine","T","3",3,3,1,"1","assault","24\""],
  ["Gaunt’s Ghosts","Larkin's long-las","T","1",2,5,2,"4","heavy precision","36\""],
  ["Gaunt’s Ghosts","Lascarbine","T","3",3,3,0,"1","assault","24\""],
  ["Gaunt’s Ghosts","Rawne's lascarbine","T","3",3,3,0,"1","assault sust:1","24\""],
  ["Gaunt’s Ghosts","Gaunt's chainsword","C","5",2,3,1,"1","","càc"],
  ["Gaunt’s Ghosts","Mkoll's straight silver knife","C","5",2,3,1,"1","dev precision","càc"],
  ["Gaunt’s Ghosts","Straight silver knife","C","3",3,3,0,"1","","càc"],
  ["Gorgon Heavy Transport","Gorgon mortar","T","D6",4,5,0,"1","blast indirect","48\""],
  ["Gorgon Heavy Transport","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Gorgon Heavy Transport","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Gorgon Heavy Transport","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Gorgon Heavy Transport","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Gorgon Heavy Transport","Twin heavy stubber","T","3",4,4,0,"1","rf:3 twin","36\""],
  ["Gorgon Heavy Transport","Landing ramp","C","6",4,8,0,"1","","càc"],
  ["Griffon Mortar Carrier","Griffon heavy mortar","T","D6",4,7,1,"2","blast indirect","48\""],
  ["Griffon Mortar Carrier","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Griffon Mortar Carrier","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Griffon Mortar Carrier","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Griffon Mortar Carrier","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Griffon Mortar Carrier","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Hades Breaching Drill","Melta-cutter drill","C","6",4,9,4,"D6+2","","càc"],
  ["Heavy Mortar Team","Heavy mortar","T","D6",5,6,1,"2","heavy blast indirect","48\""],
  ["Heavy Mortar Team","Close combat weapons","C","3",4,3,0,"1","","càc"],
  ["Heavy Quad Launcher Team","Heavy quad launcher","T","2D6",4,5,0,"1","blast indirect","48\""],
  ["Heavy Quad Launcher Team","Close combat weapons","C","3",4,3,0,"1","","càc"],
  ["Hell's Last","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Hell's Last","Demolitions","T","D6",4,9,2,"2","blast oneshot","6\""],
  ["Hell's Last","Hot-shot laspistol","T","1",3,3,1,"1","pistol","12\""],
  ["Hell's Last","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Hell's Last","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Hell's Last","Dirk","C","3",3,3,1,"1","precision","càc"],
  ["Hell's Last","Power weapon","C","4",3,4,2,"1","","càc"],
  ["Hellhammer","Coaxial autocannon","T","2",4,9,1,"3","","48\""],
  ["Hellhammer","Demolisher cannon","T","D6+3",4,14,3,"D6","blast","24\""],
  ["Hellhammer","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Hellhammer","Hellhammer cannon","T","4D6",4,7,1,"2","blast ignorescover","30\""],
  ["Hellhammer","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Hellhammer","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Hellhammer","Twin heavy flamer","T","D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Hellhammer","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Hellhound","Chem cannon","T","D6+1",0,2,2,"2","anti:2:inf torrent","12\""],
  ["Hellhound","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Hellhound","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Hellhound","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Hellhound","Inferno cannon","T","2D6",0,6,2,"1","ignorescover torrent","18\""],
  ["Hellhound","Melta cannon","T","D3",4,9,4,"D6","blast melta:4","18\""],
  ["Hellhound","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Hellhound","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Hippogriff AFV","Chiron gatling cannon","T","12",4,5,0,"1","assault","24\""],
  ["Hippogriff AFV","Heavy stubber","T","3",4,4,0,"1","assault rf:3","36\""],
  ["Hippogriff AFV","Lascannon","T","1",4,12,3,"D6+1","assault","48\""],
  ["Hippogriff AFV","Melta cannon","T","2",4,9,4,"D6","assault melta:2","18\""],
  ["Hippogriff AFV","Meltagun","T","1",4,9,4,"D6","assault melta:2","12\""],
  ["Hippogriff AFV","Vigilator cannon","T","D6",4,8,1,"2","assault blast","36\""],
  ["Hippogriff AFV","Armoured hull","C","3",4,5,0,"1","","càc"],
  ["Hydra","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Hydra","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Hydra","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Hydra","Hydra autocannon","T","4",4,9,1,"3","anti:2:vol twin","72\""],
  ["Hydra","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Hydra Platform","Hydra Quad Autocannon","T","4",4,9,1,"3","anti:2:vol twin","72\""],
  ["Hydra Platform","Close combat weapons","C","3",4,3,0,"1","","càc"],
  ["Kasrkin","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Kasrkin","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Kasrkin","Hot-shot lasgun","T","1",3,3,1,"1","rf:1","24\""],
  ["Kasrkin","Hot-shot laspistol","T","1",3,3,1,"1","pistol","12\""],
  ["Kasrkin","Hot-shot marksman rifle","T","1",3,4,2,"3","heavy precision","36\""],
  ["Kasrkin","Hot-shot volley gun","T","2",3,4,1,"1","rf:2","30\""],
  ["Kasrkin","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Kasrkin","➤ Grenade launcher - frag","T","D3",3,4,0,"1","blast","24\""],
  ["Kasrkin","➤ Grenade launcher - krak","T","1",3,9,2,"D3","","24\""],
  ["Kasrkin","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Kasrkin","➤ Plasma gun - supercharge","T","1",3,8,3,"2","rf:1 hazardous","24\""],
  ["Kasrkin","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Kasrkin","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Kasrkin","Chainsword","C","4",4,3,0,"1","","càc"],
  ["Kasrkin","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Kasrkin","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Krieg Combat Engineers","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Krieg Combat Engineers","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Krieg Combat Engineers","Combat shotgun","T","2",4,4,0,"1","assault","12\""],
  ["Krieg Combat Engineers","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Krieg Combat Engineers","Hand flamer","T","D6",0,3,0,"1","ignorescover pistol torrent","12\""],
  ["Krieg Combat Engineers","➤ Plasma pistol - standard","T","1",4,7,2,"1","pistol","12\""],
  ["Krieg Combat Engineers","➤ Plasma pistol - supercharge","T","1",4,8,3,"2","hazardous pistol","12\""],
  ["Krieg Combat Engineers","Chainsword","C","4",4,3,0,"1","","càc"],
  ["Krieg Combat Engineers","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Krieg Combat Engineers","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Krieg Combat Engineers","Trench club","C","2",4,4,0,"1","","càc"],
  ["Krieg Command Squad","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Krieg Command Squad","Boltgun","T","1",4,4,0,"1","rf:1","24\""],
  ["Krieg Command Squad","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Krieg Command Squad","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Krieg Command Squad","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Krieg Command Squad","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Krieg Command Squad","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Krieg Command Squad","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Krieg Command Squad","➤ Plasma gun - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Krieg Command Squad","➤ Plasma gun - supercharge","T","1",4,8,3,"2","hazardous rf:1","24\""],
  ["Krieg Command Squad","➤ Plasma pistol - standard","T","1",4,7,2,"1","pistol","12\""],
  ["Krieg Command Squad","➤ Plasma pistol - supercharge","T","1",4,8,3,"2","hazardous pistol","12\""],
  ["Krieg Command Squad","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Krieg Command Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Krieg Command Squad","Power fist","C","3",4,6,2,"2","","càc"],
  ["Krieg Command Squad","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Krieg Command Squad","Trench club","C","3",4,4,0,"1","","càc"],
  ["Krieg Heavy Weapons Squad","Krieg heavy flamer","T","D6",0,5,1,"2","ignorescover torrent","18\""],
  ["Krieg Heavy Weapons Squad","Lascannon","T","1",5,12,3,"D6+1","heavy","48\""],
  ["Krieg Heavy Weapons Squad","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Krieg Heavy Weapons Squad","Twin Krieg heavy stubber","T","3",5,6,1,"1","heavy rf:3 twin","48\""],
  ["Krieg Heavy Weapons Squad","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Leman Russ Battle Tank","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Leman Russ Battle Tank","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Leman Russ Battle Tank","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Leman Russ Battle Tank","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Leman Russ Battle Tank","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Leman Russ Battle Tank","Leman Russ battle cannon","T","D6+3",4,10,1,"3","blast","48\""],
  ["Leman Russ Battle Tank","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Leman Russ Battle Tank","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Leman Russ Battle Tank","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Leman Russ Battle Tank","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Leman Russ Battle Tank","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Leman Russ Commander","Demolisher battle cannon","T","D6+1",4,14,3,"D6","blast","24\""],
  ["Leman Russ Commander","Eradicator nova cannon","T","D3+6",4,7,1,"2","blast ignorescover","36\""],
  ["Leman Russ Commander","Exterminator autocannon","T","4",4,9,1,"3","rf:4 twin","48\""],
  ["Leman Russ Commander","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Leman Russ Commander","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Leman Russ Commander","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Leman Russ Commander","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Leman Russ Commander","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Leman Russ Commander","Leman Russ battle cannon","T","D6+3",4,10,1,"3","blast","48\""],
  ["Leman Russ Commander","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Leman Russ Commander","Punisher gatling cannon","T","20",4,6,0,"1","","24\""],
  ["Leman Russ Commander","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Leman Russ Commander","Vanquisher battle cannon","T","1",4,18,4,"D6+6","heavy","72\""],
  ["Leman Russ Commander","➤ Executioner plasma cannon - standard","T","D6+3",4,7,2,"2","blast","36\""],
  ["Leman Russ Commander","➤ Executioner plasma cannon - supercharge","T","D6+3",4,8,3,"3","blast hazardous","36\""],
  ["Leman Russ Commander","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Leman Russ Commander","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Leman Russ Commander","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Leman Russ Demolisher","Demolisher battle cannon","T","D6+1",4,14,3,"D6","blast","24\""],
  ["Leman Russ Demolisher","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Leman Russ Demolisher","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Leman Russ Demolisher","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Leman Russ Demolisher","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Leman Russ Demolisher","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Leman Russ Demolisher","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Leman Russ Demolisher","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Leman Russ Demolisher","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Leman Russ Demolisher","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Leman Russ Demolisher","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Leman Russ Eradicator","Eradicator nova cannon","T","D3+6",4,7,1,"2","blast ignorescover","36\""],
  ["Leman Russ Eradicator","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Leman Russ Eradicator","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Leman Russ Eradicator","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Leman Russ Eradicator","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Leman Russ Eradicator","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Leman Russ Eradicator","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Leman Russ Eradicator","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Leman Russ Eradicator","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Leman Russ Eradicator","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Leman Russ Eradicator","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Leman Russ Executioner","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Leman Russ Executioner","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Leman Russ Executioner","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Leman Russ Executioner","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Leman Russ Executioner","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Leman Russ Executioner","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Leman Russ Executioner","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Leman Russ Executioner","➤ Executioner plasma cannon - standard","T","D6+3",4,7,2,"2","blast","36\""],
  ["Leman Russ Executioner","➤ Executioner plasma cannon - supercharge","T","D6+3",4,8,3,"3","blast hazardous","36\""],
  ["Leman Russ Executioner","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Leman Russ Executioner","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Leman Russ Executioner","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Leman Russ Exterminator","Exterminator autocannon","T","4",4,9,1,"3","rf:4 twin","48\""],
  ["Leman Russ Exterminator","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Leman Russ Exterminator","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Leman Russ Exterminator","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Leman Russ Exterminator","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Leman Russ Exterminator","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Leman Russ Exterminator","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Leman Russ Exterminator","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Leman Russ Exterminator","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Leman Russ Exterminator","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Leman Russ Exterminator","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Leman Russ Punisher","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Leman Russ Punisher","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Leman Russ Punisher","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Leman Russ Punisher","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Leman Russ Punisher","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Leman Russ Punisher","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Leman Russ Punisher","Punisher gatling cannon","T","20",4,6,0,"1","","24\""],
  ["Leman Russ Punisher","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Leman Russ Punisher","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Leman Russ Punisher","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Leman Russ Punisher","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Leman Russ Vanquisher","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Leman Russ Vanquisher","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Leman Russ Vanquisher","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Leman Russ Vanquisher","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Leman Russ Vanquisher","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Leman Russ Vanquisher","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Leman Russ Vanquisher","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Leman Russ Vanquisher","Vanquisher battle cannon","T","1",4,18,4,"D6+6","heavy","72\""],
  ["Leman Russ Vanquisher","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Leman Russ Vanquisher","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Leman Russ Vanquisher","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Lord Marshal Dreir","Laspistol","T","1",3,3,0,"1","pistol","12\""],
  ["Lord Marshal Dreir","Sabre of Sacrifice","C","6",2,6,2,"1","anti:4:inf","càc"],
  ["Lord Marshal Dreir","Savage claws","C","2",4,4,1,"1","extra","càc"],
  ["Lord Solar Leontus","Sol's Righteous Gaze","T","2",2,8,2,"2","pistol","12\""],
  ["Lord Solar Leontus","Conquest","C","6",2,6,2,"2","","càc"],
  ["Lord Solar Leontus","Konstantin's hooves","C","2",4,4,0,"1","extra","càc"],
  ["Macharius","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Macharius","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Macharius","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Macharius","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Macharius","Macharius twin battlecannon","T","D6+3",4,10,1,"3","blast twin","48\""],
  ["Macharius","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Macharius","Twin heavy stubber","T","3",4,4,0,"1","rf:3 twin","36\""],
  ["Macharius","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Macharius Omega","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Macharius Omega","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Macharius Omega","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Macharius Omega","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Macharius Omega","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Macharius Omega","➤ Omega-pattern plasma blastgun - standard","T","2D6",0,8,2,"2","blast","60\""],
  ["Macharius Omega","➤ Omega-pattern plasma blastgun - supercharged","T","2D6",4,9,3,"3","blast hazardous","60\""],
  ["Macharius Omega","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Macharius Vanquisher","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Macharius Vanquisher","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Macharius Vanquisher","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Macharius Vanquisher","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Macharius Vanquisher","Macharius twin vanquisher cannon","T","1",4,18,4,"D6+6","heavy twin","72\""],
  ["Macharius Vanquisher","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Macharius Vanquisher","Twin heavy stubber","T","3",4,4,0,"1","rf:3 twin","36\""],
  ["Macharius Vanquisher","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Macharius Vulcan","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Macharius Vulcan","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Macharius Vulcan","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Macharius Vulcan","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Macharius Vulcan","Macharius vulcan mega-bolter","T","16",4,6,1,"2","sust:1","48\""],
  ["Macharius Vulcan","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Macharius Vulcan","Twin heavy stubber","T","3",4,4,0,"1","rf:3 twin","36\""],
  ["Macharius Vulcan","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Malcador","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Malcador","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Malcador","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Malcador","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Malcador","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Malcador","Malcador battle cannon","T","D6+3",4,9,1,"3","blast","48\""],
  ["Malcador","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Malcador","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Malcador Annihilator","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Malcador Annihilator","Demolisher cannon","T","D6+3",4,14,3,"D6","blast","24\""],
  ["Malcador Annihilator","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Malcador Annihilator","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Malcador Annihilator","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Malcador Annihilator","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Malcador Annihilator","Malcador twin lascannon","T","1",4,12,3,"D6+1","twin","48\""],
  ["Malcador Annihilator","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Malcador Annihilator","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Malcador Defender","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Malcador Defender","Demolisher cannon","T","D6+3",4,14,3,"D6","blast","24\""],
  ["Malcador Defender","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Malcador Defender","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Malcador Defender","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Malcador Defender","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Malcador Defender","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Malcador Defender","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Malcador Infernus","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Malcador Infernus","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Malcador Infernus","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Malcador Infernus","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Malcador Infernus","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Malcador Infernus","Inferno gun","T","D6+3",0,5,2,"2","ignorescover torrent","18\""],
  ["Malcador Infernus","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Malcador Infernus","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Malcador Infernus","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Manticore","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Manticore","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Manticore","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Manticore","Storm eagle rockets","T","D6",4,7,2,"3","anti:2:inf blast indirect","120\""],
  ["Manticore","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Manticore Platform","Storm Eagle Rockets","T","D6+1",4,10,2,"3","blast indirect","120\""],
  ["Manticore Platform","Close combat weapons","C","3",4,3,0,"1","","càc"],
  ["Marauder Bomber","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Marauder Bomber","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Marauder Bomber","Armoured hull","C","6",4,8,0,"1","","càc"],
  ["Marauder Destroyer","Assault cannon","T","6",4,6,0,"1","dev","24\""],
  ["Marauder Destroyer","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Marauder Destroyer","Hellstrike missile rack","T","2",4,10,3,"D6","anti:2:vol","48\""],
  ["Marauder Destroyer","Marauder nose autocannons","T","4",4,10,2,"3","twin","48\""],
  ["Marauder Destroyer","Armoured hull","C","6",4,8,0,"1","","càc"],
  ["Medusa Carriage Battery","Medusa siege cannon","T","D6",5,10,3,"3","blast heavy indirect","36\""],
  ["Medusa Carriage Battery","Battery close combat weapons","C","5",4,3,0,"1","","càc"],
  ["Militarum Tempestus Command Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Militarum Tempestus Command Squad","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Militarum Tempestus Command Squad","Hot-shot lasgun","T","1",3,3,1,"1","rf:1","24\""],
  ["Militarum Tempestus Command Squad","Hot-shot laspistol","T","1",3,3,1,"1","pistol","12\""],
  ["Militarum Tempestus Command Squad","Hot-shot volley gun","T","2",3,4,1,"1","rf:2","30\""],
  ["Militarum Tempestus Command Squad","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Militarum Tempestus Command Squad","➤ Grenade launcher - frag","T","D3",3,4,0,"1","blast","24\""],
  ["Militarum Tempestus Command Squad","➤ Grenade launcher - krak","T","1",3,9,2,"D3","","24\""],
  ["Militarum Tempestus Command Squad","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Militarum Tempestus Command Squad","➤ Plasma gun - supercharge","T","1",3,8,3,"2","rf:1 hazardous","24\""],
  ["Militarum Tempestus Command Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Militarum Tempestus Command Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Militarum Tempestus Command Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Militarum Tempestus Command Squad","Tempestus dagger","C","4",3,3,0,"1","","càc"],
  ["Ministorum Priest","Holy pistol","T","3",4,4,0,"1","pistol","12\""],
  ["Ministorum Priest","Zealot's vindicator (tir)","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Ministorum Priest","Power weapon","C","3",3,4,2,"1","","càc"],
  ["Ministorum Priest","Zealot's vindicator (càc)","C","3",4,5,1,"2","","càc"],
  ["Minotaur","Minotaur twin earthshaker cannon","T","D6+3",4,8,2,"2","blast indirect twin","240\""],
  ["Minotaur","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Mukaali Riders","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Mukaali Riders","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Mukaali Riders","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Mukaali Riders","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Mukaali Riders","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Mukaali Riders","➤ Plasma gun - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Mukaali Riders","➤ Plasma gun - supercharge","T","1",4,8,3,"2","hazardous rf:1","24\""],
  ["Mukaali Riders","➤ Plasma pistol - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Mukaali Riders","➤ Plasma pistol - supercharged","T","1",4,8,3,"2","hazardous rf:1","24\""],
  ["Mukaali Riders","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Mukaali Riders","Hunting lance","C","3",4,4,0,"1","lance","càc"],
  ["Mukaali Riders","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Mukaali Riders","Stomping Feet","C","2",4,4,0,"1","extra","càc"],
  ["Munitorum Servitors","Heavy bolter","T","3",6,5,1,"2","heavy sust:1","36\""],
  ["Munitorum Servitors","Multi-melta","T","2",6,9,4,"D6","heavy melta:2","18\""],
  ["Munitorum Servitors","➤ Plasma cannon - standard","T","D3",6,7,2,"1","blast heavy","36\""],
  ["Munitorum Servitors","➤ Plasma cannon - supercharge","T","D3",6,8,3,"2","blast hazardous heavy","36\""],
  ["Munitorum Servitors","Servitor's servo arm","C","1",5,6,2,"3","","càc"],
  ["Nork Deddog","Ripper gun","T","3",3,5,1,"2","rf:3","18\""],
  ["Nork Deddog","Huge knife","C","6",2,8,1,"2","dev","càc"],
  ["Ogryn Bodyguard","Grenadier gauntlet","T","D6",4,4,0,"1","blast","18\""],
  ["Ogryn Bodyguard","Ripper gun (tir)","T","3",4,5,1,"2","rf:3","18\""],
  ["Ogryn Bodyguard","Bullgryn maul","C","5",3,7,1,"2","","càc"],
  ["Ogryn Bodyguard","Close combat weapon","C","4",3,6,0,"1","","càc"],
  ["Ogryn Bodyguard","Huge knife","C","6",3,8,1,"2","","càc"],
  ["Ogryn Bodyguard","Ripper gun (càc)","C","4",3,6,1,"1","","càc"],
  ["Ogryn Squad","Ripper gun (tir)","T","3",4,5,1,"2","rf:3","18\""],
  ["Ogryn Squad","Ripper gun (càc)","C","4",3,6,1,"1","","càc"],
  ["Praetor","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Praetor","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Praetor","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Praetor","➤ Praetor launcher - firestorm","T","2D6",4,6,1,"2","blast heavy ignorescover indirect","120\""],
  ["Praetor","➤ Praetor launcher - foehammer","T","D6+1",4,4,2,"3","anti:4:mon anti:4:veh blast heavy indirect","120\""],
  ["Praetor","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Primaris Psyker","Laspistol","T","1",3,3,0,"1","pistol","12\""],
  ["Primaris Psyker","➤ Psychic maelstrom - focused witchfire","T","D6+1",3,6,2,"2","blast dev hazardous psychic","18\""],
  ["Primaris Psyker","➤ Psychic maelstrom - witchfire","T","D6",3,5,2,"1","blast dev psychic","18\""],
  ["Primaris Psyker","Force weapon","C","3",4,6,1,"D3","psychic","càc"],
  ["Provisionally Prepared","Sniper rifle","T","1",3,4,2,"2","heavy precision","36\""],
  ["Provisionally Prepared","Close combat weapons","C","2",5,2,0,"1","","càc"],
  ["Quartermaster Cadre Squad","Quartermaster's pistol","T","1",3,3,1,"1","pistol","12\""],
  ["Quartermaster Cadre Squad","Medical scalpels","C","1",4,3,0,"1","","càc"],
  ["Quartermaster Cadre Squad","Quartermaster's close combat weapon","C","2",3,4,2,"1","","càc"],
  ["Rapier Laser Destroyer Battery","Laser destroyer","T","2",5,12,2,"D6+1","heavy twin","36\""],
  ["Rapier Laser Destroyer Battery","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Ratlings","Sniper rifle","T","1",3,4,2,"2","heavy precision","36\""],
  ["Ratlings","Tankstopper rifle","T","1",3,9,3,"D6","heavy","36\""],
  ["Ratlings","Close combat weapon","C","1",5,2,0,"1","","càc"],
  ["Regimental Attachés","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Regimental Attachés","Astropath's stave","C","1",4,6,1,"D3","psychic","càc"],
  ["Regimental Attachés","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Rein and Raus","Demolition Charge","T","D6+3",4,12,2,"2","blast hazardous oneshot","6\""],
  ["Rein and Raus","Sniper rifle","T","1",3,4,2,"2","heavy precision","36\""],
  ["Rein and Raus","Stub Pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Rein and Raus","Close Combat Weapon","C","1",5,2,0,"1","","càc"],
  ["Rogal Dorn Battle Tank","Castigator gatling cannon","T","12",4,5,0,"1","","24\""],
  ["Rogal Dorn Battle Tank","Coaxial autocannon","T","2",4,9,1,"3","","48\""],
  ["Rogal Dorn Battle Tank","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Rogal Dorn Battle Tank","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Rogal Dorn Battle Tank","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Rogal Dorn Battle Tank","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Rogal Dorn Battle Tank","Oppressor cannon","T","D6+3",4,12,2,"3","blast","72\""],
  ["Rogal Dorn Battle Tank","Pulveriser cannon","T","D6",4,9,3,"3","blast","24\""],
  ["Rogal Dorn Battle Tank","Twin battle cannon","T","D6+3",4,10,1,"3","blast twin","48\""],
  ["Rogal Dorn Battle Tank","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Rogal Dorn Commander","Castigator gatling cannon","T","12",4,5,0,"1","","24\""],
  ["Rogal Dorn Commander","Coaxial autocannon","T","2",4,9,1,"3","","48\""],
  ["Rogal Dorn Commander","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Rogal Dorn Commander","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Rogal Dorn Commander","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Rogal Dorn Commander","Multi-melta","T","2",4,9,4,"D6","melta:2","18\""],
  ["Rogal Dorn Commander","Oppressor cannon","T","D6+3",4,12,2,"3","blast","72\""],
  ["Rogal Dorn Commander","Pulveriser cannon","T","D6",4,9,3,"3","blast","24\""],
  ["Rogal Dorn Commander","Twin battle cannon","T","D6+3",4,10,1,"3","blast twin","48\""],
  ["Rogal Dorn Commander","Armoured tracks","C","6",4,7,0,"1","","càc"],
  ["Sabre Weapons Battery","Twin autocannon","T","2",4,9,1,"3","twin","48\""],
  ["Sabre Weapons Battery","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Sabre Weapons Battery","Twin heavy stubber","T","3",4,4,0,"1","rf:3 twin","36\""],
  ["Sabre Weapons Battery","Twin lascannon","T","1",4,12,3,"D6+1","twin","48\""],
  ["Sabre Weapons Battery","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Salamander Command Vehicle","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Salamander Command Vehicle","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Salamander Command Vehicle","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Salamander Command Vehicle","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Salamander Command Vehicle","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Salamander Command Vehicle","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Salamander Scout Vehicle","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Salamander Scout Vehicle","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Salamander Scout Vehicle","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Salamander Scout Vehicle","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Salamander Scout Vehicle","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Salamander Scout Vehicle","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Scout Sentinels","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Scout Sentinels","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Scout Sentinels","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Scout Sentinels","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Scout Sentinels","Multi-laser","T","4",4,6,0,"1","","36\""],
  ["Scout Sentinels","➤ Missile launcher - frag","T","D6",4,4,0,"1","blast heavy","48\""],
  ["Scout Sentinels","➤ Missile launcher - krak","T","1",4,9,2,"D6","heavy","48\""],
  ["Scout Sentinels","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast","36\""],
  ["Scout Sentinels","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous","36\""],
  ["Scout Sentinels","Close combat weapon","C","3",4,6,0,"1","","càc"],
  ["Scout Sentinels","Sentinel chainsaw","C","3",4,6,1,"1","","càc"],
  ["Sentinel Powerlifter","Powerlifter","C","3",4,10,2,"D3","","càc"],
  ["Sergeant Harker","Payback","T","3",3,5,1,"2","sust:1","36\""],
  ["Sergeant Harker","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Shadowsword","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Shadowsword","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Shadowsword","Twin heavy flamer","T","D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Shadowsword","Volcano cannon","T","D3+1",4,24,5,"12","blast heavy","96\""],
  ["Shadowsword","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Sly Marbo","Ripper pistol","T","3",2,5,1,"2","anti:2:inf pistol precision","12\""],
  ["Sly Marbo","Envenomed blade","C","5",2,5,1,"2","anti:2:inf precision","càc"],
  ["Storm Chimera","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Storm Chimera","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Storm Chimera","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Storm Chimera","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Storm Chimera","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Storm Chimera","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Storm Chimera","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Stormblade","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Stormblade","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Stormblade","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Stormblade","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Stormblade","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Stormblade","Twin heavy flamer","T","D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Stormblade","➤ Stormblade plasma blastgun - standard","T","D6+3",4,9,2,"3","blast","48\""],
  ["Stormblade","➤ Stormblade plasma blastgun - supercharge","T","D6+3",4,10,3,"4","blast hazardous","48\""],
  ["Stormblade","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Stormlord","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Stormlord","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Stormlord","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Stormlord","Twin heavy flamer","T","D6",0,5,1,"1","ignorescover torrent twin","12\""],
  ["Stormlord","Vulcan mega-bolter","T","20",4,6,1,"2","sust:1","48\""],
  ["Stormlord","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Stormsword","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Stormsword","Stormsword siege cannon","T","D6+6",4,16,4,"D6+2","blast ignorescover","48\""],
  ["Stormsword","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Stormsword","Twin heavy flamer","T","D6",0,6,1,"1","ignorescover torrent twin","12\""],
  ["Stormsword","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Stygies Destroyer Tank Hunter","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Stygies Destroyer Tank Hunter","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Stygies Destroyer Tank Hunter","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Stygies Destroyer Tank Hunter","Stygies laser destroyer","T","2",4,14,4,"D6+3","heavy","72\""],
  ["Stygies Destroyer Tank Hunter","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Tarantula Battery","Twin heavy bolter","T","3",4,5,1,"2","sust:1 twin","36\""],
  ["Tarantula Battery","Twin lascannon","T","1",4,12,3,"D6+1","twin","48\""],
  ["Tarantula Battery","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Tauros Assault Vehicle","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Tauros Assault Vehicle","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Tauros Assault Vehicle","➤ Tauros grenade launcher - frag","T","D6",0,4,0,"1","blast","24\""],
  ["Tauros Assault Vehicle","➤ Tauros grenade launcher - krak","T","2",4,9,2,"D3","","24\""],
  ["Tauros Assault Vehicle","Armoured frame","C","2",4,5,0,"1","","càc"],
  ["Tauros Venator","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Tauros Venator","Twin lascannon","T","1",4,12,3,"D6+1","twin","48\""],
  ["Tauros Venator","Twin multi-laser","T","4",4,6,0,"1","twin","36\""],
  ["Tauros Venator","Armoured frame","C","2",4,5,0,"1","","càc"],
  ["Taurox","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Taurox","Twin autocannon","T","2",4,9,1,"3","twin","48\""],
  ["Taurox","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Taurox Prime","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Taurox Prime","Taurox battle cannon","T","D6",3,8,1,"2","blast","48\""],
  ["Taurox Prime","Taurox gatling cannon","T","8",3,4,0,"1","dev twin","24\""],
  ["Taurox Prime","Twin Taurox hot-shot volley gun","T","3",3,4,1,"1","rf:3 twin","30\""],
  ["Taurox Prime","Twin autocannon","T","2",3,9,1,"3","twin","48\""],
  ["Taurox Prime","➤ Taurox missile launcher - frag","T","D6",3,4,0,"1","blast twin","48\""],
  ["Taurox Prime","➤ Taurox missile launcher - krak","T","1",3,9,2,"D6","twin","48\""],
  ["Taurox Prime","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Tech-Priest Enginseer","Mechanicus pistol","T","1",3,6,0,"1","dev pistol","12\""],
  ["Tech-Priest Enginseer","Enginseer Axe","C","3",4,6,2,"2","","càc"],
  ["Tech-Priest Enginseer","Servo-arm","C","1",4,6,2,"2","extra","càc"],
  ["Tempestus Aquilons","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Tempestus Aquilons","Hot-shot lascarbine","T","2",3,3,1,"1","assault","18\""],
  ["Tempestus Aquilons","Hot-shot laspistol","T","1",3,3,1,"1","pistol","12\""],
  ["Tempestus Aquilons","Hot-shot long las","T","1",3,4,2,"3","heavy precision","36\""],
  ["Tempestus Aquilons","Melta carbine","T","1",3,9,4,"D6","assault melta:2","10\""],
  ["Tempestus Aquilons","Sentry flamer","T","D6+3",0,4,0,"1","ignorescover torrent","12\""],
  ["Tempestus Aquilons","Sentry hot-shot volley gun","T","4",4,4,1,"1","rf:4","30\""],
  ["Tempestus Aquilons","➤ Plasma carbine - standard","T","2",3,7,2,"1","assault","18\""],
  ["Tempestus Aquilons","➤ Plasma carbine - supercharge","T","2",3,8,3,"2","assault hazardous","18\""],
  ["Tempestus Aquilons","➤ Sentry grenade launcher - frag","T","D3+3",4,4,0,"1","blast","24\""],
  ["Tempestus Aquilons","➤ Sentry grenade launcher - krak","T","2",4,9,2,"D3","","24\""],
  ["Tempestus Aquilons","Chainsword","C","4",4,3,0,"1","","càc"],
  ["Tempestus Aquilons","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Tempestus Aquilons","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Tempestus Scions","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Tempestus Scions","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Tempestus Scions","Hot-shot lasgun","T","1",3,3,1,"1","rf:1","24\""],
  ["Tempestus Scions","Hot-shot laspistol","T","1",3,3,1,"1","pistol","12\""],
  ["Tempestus Scions","Hot-shot volley gun","T","2",3,4,1,"1","rf:2","30\""],
  ["Tempestus Scions","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Tempestus Scions","➤ Grenade launcher - frag","T","D3",3,4,0,"1","blast","24\""],
  ["Tempestus Scions","➤ Grenade launcher - krak","T","1",3,9,2,"D3","","24\""],
  ["Tempestus Scions","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Tempestus Scions","➤ Plasma gun - supercharge","T","1",3,8,3,"2","rf:1 hazardous","24\""],
  ["Tempestus Scions","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Tempestus Scions","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Tempestus Scions","Chainsword","C","4",4,3,0,"1","","càc"],
  ["Tempestus Scions","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Tempestus Scions","Power fist","C","3",4,6,2,"2","","càc"],
  ["Tempestus Scions","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Trojan Support Vehicle","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Trojan Support Vehicle","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Trojan Support Vehicle","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Trojan Support Vehicle","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Ursula Creed","Duty and Vengeance","T","4",3,5,2,"1","pistol","12\""],
  ["Ursula Creed","Power weapon","C","4",3,4,2,"1","","càc"],
  ["Valdor","Autocannon","T","2",4,9,1,"3","","48\""],
  ["Valdor","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Valdor","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Valdor","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Valdor","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Valdor","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Valdor","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Valdor","Valdor neutron laser","T","2",4,16,4,"D6+1","heavy","48\""],
  ["Valdor","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Valkyrie","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Valkyrie","Hellstrike missiles","T","1",4,10,3,"D6","anti:2:vol","48\""],
  ["Valkyrie","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Valkyrie","Multi-laser","T","4",4,6,0,"1","","36\""],
  ["Valkyrie","Multiple rocket pod","T","D6",4,6,0,"1","blast","36\""],
  ["Valkyrie","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Valkyrie Sky Talon","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Valkyrie Sky Talon","Hellstrike missiles","T","1",4,10,3,"D6","anti:2:vol","48\""],
  ["Valkyrie Sky Talon","Multiple rocket pod","T","D6",4,6,0,"1","blast","36\""],
  ["Valkyrie Sky Talon","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Vendetta Gunship","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Vendetta Gunship","Vendetta hellstrike rack","T","2",4,10,3,"D6","anti:2:vol","48\""],
  ["Vendetta Gunship","Vendetta twin lascannon","T","1",4,12,3,"D6+1","twin","48\""],
  ["Vendetta Gunship","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Voss-pattern Lightning","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Voss-pattern Lightning","Lightning hellstrike rack","T","2",4,10,3,"D6","anti:2:vol","48\""],
  ["Voss-pattern Lightning","Armoured hull","C","6",4,8,0,"1","","càc"],
  ["Vulture Gunship","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Vulture Gunship","Multiple rocket pods","T","D6",4,6,0,"1","blast","36\""],
  ["Vulture Gunship","Vulture gatling cannon","T","18",4,5,0,"1","sust:1","24\""],
  ["Vulture Gunship","Vulture hellstrike rack","T","2",4,10,3,"D6","anti:2:vol","48\""],
  ["Vulture Gunship","Armoured hull","C","6",4,4,0,"1","","càc"],
  ["Wyvern","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Wyvern","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Wyvern","Hunter-killer missile","T","1",4,14,3,"D6","oneshot","48\""],
  ["Wyvern","Wyvern quad stormshard mortar","T","2D6",4,5,0,"1","blast indirect twin","48\""],
  ["Wyvern","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["‘Iron Hand’ Straken","Auto Shotgun","T","3",3,4,0,"2","assault","12\""],
  ["‘Iron Hand’ Straken","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["‘Iron Hand’ Straken","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["‘Iron Hand’ Straken","Bionic Arm with Devil's Claw","C","6",2,6,2,"2","anti:4:mon","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Aegis Defence Line","Fortification"],
  ["Aquila Lander","Véhicule"],
  ["Arkurian Stormhammer","Véhicule"],
  ["Armageddon-pattern Medusa","Véhicule"],
  ["Armoured Sentinels","Véhicule"],
  ["Artillery Team","Infanterie"],
  ["Arvus Lighter","Véhicule"],
  ["Atlas Recovery Vehicle","Véhicule"],
  ["Attilan Rough Riders","Monté"],
  ["Avenger Strike Fighter","Véhicule"],
  ["Baneblade","Véhicule"],
  ["Banehammer","Véhicule"],
  ["Banesword","Véhicule"],
  ["Basilisk","Véhicule"],
  ["Bullgryn Squad","Infanterie"],
  ["Cadian Castellan","Personnage"],
  ["Cadian Command Squad","Personnage"],
  ["Cadian Heavy Weapons Squad","Infanterie"],
  ["Cadian Recon Squad","Infanterie"],
  ["Cadian Shock Troops","Battleline"],
  ["Carnodon","Véhicule"],
  ["Catachan Command Squad","Personnage"],
  ["Catachan Heavy Weapons Squad","Infanterie"],
  ["Catachan Jungle Fighters","Battleline"],
  ["Centaur Light Carrier","Véhicule"],
  ["Centaur RSV","Véhicule"],
  ["Chimera","Véhicule"],
  ["Colossus","Véhicule"],
  ["Commissar","Personnage"],
  ["Commissar Graves","Epic Hero"],
  ["Commissar Graves on Foot","Epic Hero"],
  ["Commissar Yarrick","Epic Hero"],
  ["Crassus","Véhicule"],
  ["Cyclops Demolition Vehicle","Véhicule"],
  ["Death Korps Grenadier Squad","Infanterie"],
  ["Death Korps of Krieg","Battleline"],
  ["Death Rider Commissar","Personnage"],
  ["Death Riders","Monté"],
  ["Deathstrike","Véhicule"],
  ["Dominus Armoured Siege Bombard","Véhicule"],
  ["Doomhammer","Véhicule"],
  ["Earthshaker Carriage Battery","Infanterie"],
  ["Earthshaker Platform","Fortification"],
  ["Elysian Drop Sentinel","Véhicule"],
  ["Elysian Sniper Squad","Infanterie"],
  ["Field Ordnance Battery","Infanterie"],
  ["Gaunt’s Ghosts","Epic Hero"],
  ["Gorgon Heavy Transport","Véhicule"],
  ["Griffon Mortar Carrier","Véhicule"],
  ["Hades Breaching Drill","Véhicule"],
  ["Heavy Mortar Team","Infanterie"],
  ["Heavy Quad Launcher Team","Infanterie"],
  ["Hell's Last","Epic Hero"],
  ["Hellhammer","Véhicule"],
  ["Hellhound","Véhicule"],
  ["Hippogriff AFV","Véhicule"],
  ["Hydra","Véhicule"],
  ["Hydra Platform","Fortification"],
  ["Kasrkin","Infanterie"],
  ["Krieg Combat Engineers","Infanterie"],
  ["Krieg Command Squad","Personnage"],
  ["Krieg Heavy Weapons Squad","Infanterie"],
  ["Leman Russ Battle Tank","Véhicule"],
  ["Leman Russ Commander","Personnage"],
  ["Leman Russ Demolisher","Véhicule"],
  ["Leman Russ Eradicator","Véhicule"],
  ["Leman Russ Executioner","Véhicule"],
  ["Leman Russ Exterminator","Véhicule"],
  ["Leman Russ Punisher","Véhicule"],
  ["Leman Russ Vanquisher","Véhicule"],
  ["Lord Marshal Dreir","Epic Hero"],
  ["Lord Solar Leontus","Epic Hero"],
  ["Macharius","Véhicule"],
  ["Macharius Omega","Véhicule"],
  ["Macharius Vanquisher","Véhicule"],
  ["Macharius Vulcan","Véhicule"],
  ["Malcador","Véhicule"],
  ["Malcador Annihilator","Véhicule"],
  ["Malcador Defender","Véhicule"],
  ["Malcador Infernus","Véhicule"],
  ["Manticore","Véhicule"],
  ["Manticore Platform","Fortification"],
  ["Marauder Bomber","Véhicule"],
  ["Marauder Destroyer","Véhicule"],
  ["Medusa Carriage Battery","Infanterie"],
  ["Militarum Tempestus Command Squad","Personnage"],
  ["Ministorum Priest","Personnage"],
  ["Minotaur","Véhicule"],
  ["Mukaali Riders","Monté"],
  ["Munitorum Servitors","Infanterie"],
  ["Nork Deddog","Epic Hero"],
  ["Ogryn Bodyguard","Personnage"],
  ["Ogryn Squad","Infanterie"],
  ["Praetor","Véhicule"],
  ["Primaris Psyker","Personnage"],
  ["Provisionally Prepared","Epic Hero"],
  ["Quartermaster Cadre Squad","Personnage"],
  ["Rapier Laser Destroyer Battery","Infanterie"],
  ["Ratlings","Infanterie"],
  ["Regimental Attachés","Infanterie"],
  ["Rein and Raus","Epic Hero"],
  ["Rogal Dorn Battle Tank","Véhicule"],
  ["Rogal Dorn Commander","Personnage"],
  ["Sabre Weapons Battery","Fortification"],
  ["Salamander Command Vehicle","Véhicule"],
  ["Salamander Scout Vehicle","Véhicule"],
  ["Scout Sentinels","Véhicule"],
  ["Sentinel Powerlifter","Véhicule"],
  ["Sergeant Harker","Epic Hero"],
  ["Shadowsword","Véhicule"],
  ["Sly Marbo","Epic Hero"],
  ["Storm Chimera","Véhicule"],
  ["Stormblade","Véhicule"],
  ["Stormlord","Véhicule"],
  ["Stormsword","Véhicule"],
  ["Stygies Destroyer Tank Hunter","Véhicule"],
  ["Tarantula Battery","Véhicule"],
  ["Tauros Assault Vehicle","Monté"],
  ["Tauros Venator","Monté"],
  ["Taurox","Véhicule"],
  ["Taurox Prime","Véhicule"],
  ["Tech-Priest Enginseer","Personnage"],
  ["Tempestus Aquilons","Infanterie"],
  ["Tempestus Scions","Infanterie"],
  ["Trojan Support Vehicle","Véhicule"],
  ["Ursula Creed","Epic Hero"],
  ["Valdor","Véhicule"],
  ["Valkyrie","Véhicule"],
  ["Valkyrie Sky Talon","Véhicule"],
  ["Vendetta Gunship","Véhicule"],
  ["Voss-pattern Lightning","Véhicule"],
  ["Vulture Gunship","Véhicule"],
  ["Wyvern","Véhicule"],
  ["‘Iron Hand’ Straken","Epic Hero"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "‘Iron Hand’ Straken": [
  "Catachan Jungle Fighters"
 ],
 "Cadian Castellan": [
  "Cadian Shock Troops",
  "Kasrkin"
 ],
 "Cadian Command Squad": [
  "Cadian Shock Troops"
 ],
 "Catachan Command Squad": [
  "Catachan Jungle Fighters"
 ],
 "Commissar": [
  "Cadian Shock Troops",
  "Catachan Jungle Fighters",
  "Death Korps Grenadier Squad",
  "Death Korps of Krieg",
  "Kasrkin",
  "Krieg Combat Engineers",
  "Tempestus Scions"
 ],
 "Commissar Graves on Foot": [
  "Cadian Shock Troops",
  "Catachan Jungle Fighters",
  "Death Korps Grenadier Squad",
  "Death Korps of Krieg",
  "Kasrkin",
  "Krieg Combat Engineers",
  "Tempestus Scions"
 ],
 "Commissar Yarrick": [
  "Cadian Shock Troops",
  "Catachan Jungle Fighters",
  "Death Korps Grenadier Squad",
  "Death Korps of Krieg",
  "Kasrkin",
  "Krieg Combat Engineers",
  "Tempestus Scions"
 ],
 "Death Rider Commissar": [
  "Death Riders"
 ],
 "Hell's Last": [
  "Cadian Shock Troops"
 ],
 "Krieg Command Squad": [
  "Death Korps Grenadier Squad",
  "Death Korps of Krieg",
  "Krieg Combat Engineers"
 ],
 "Lord Marshal Dreir": [
  "Death Riders"
 ],
 "Lord Solar Leontus": [
  "Attilan Rough Riders",
  "Cadian Shock Troops",
  "Catachan Jungle Fighters",
  "Death Korps Grenadier Squad",
  "Death Korps of Krieg",
  "Death Riders",
  "Kasrkin",
  "Krieg Combat Engineers"
 ],
 "Militarum Tempestus Command Squad": [
  "Tempestus Scions"
 ],
 "Ministorum Priest": [
  "Cadian Shock Troops",
  "Catachan Jungle Fighters",
  "Death Korps Grenadier Squad",
  "Death Korps of Krieg",
  "Kasrkin",
  "Krieg Combat Engineers",
  "Tempestus Scions"
 ],
 "Primaris Psyker": [
  "Cadian Shock Troops",
  "Catachan Jungle Fighters",
  "Death Korps Grenadier Squad",
  "Death Korps of Krieg",
  "Kasrkin",
  "Krieg Combat Engineers",
  "Tempestus Scions"
 ],
 "Provisionally Prepared": [
  "Ratlings"
 ],
 "Quartermaster Cadre Squad": [
  "Death Korps Grenadier Squad",
  "Death Korps of Krieg",
  "Krieg Combat Engineers"
 ],
 "Sergeant Harker": [
  "Catachan Jungle Fighters"
 ],
 "Tech-Priest Enginseer": [
  "Cadian Shock Troops",
  "Catachan Jungle Fighters",
  "Death Korps of Krieg",
  "Kasrkin",
  "Krieg Combat Engineers"
 ],
 "Ursula Creed": [
  "Cadian Shock Troops",
  "Kasrkin"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Aegis Defence Line": [
  [
   "Emplacement Platform",
   "Friendly Astra Militarum Infantry models can be set up or end any type of move on top of the platform section of this Fortification."
  ],
  [
   "Reinforced Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack."
  ],
  [
   "Defence Line",
   "While an Astra Militarum Infantry model has the Benefit of Cover as a result of this terrain feature, that model has a 4+ invulnerable save"
  ],
  [
   "Deployment",
   "When this model is set up, it will consist of 1 platform section, up to 5 shield sections, up to 2 broken shield sections and up to 2 end sections. All sections must be connected to each other to form a continuous defence line; the 2 broken shield sections can be placed either at the end of the defence line, or in the middle of it such that both are within ½\" of each other (in this case, these 2 sections count as being connected to each other). All of the sections that have been set up are then treated as a single model for all rules purposes."
  ]
 ],
 "Armoured Sentinels": [
  [
   "Mobile Hunter-killers",
   "Each time a model in this unit makes an attack that targets a Monster or Vehicle unit, you can re-roll the Wound roll."
  ]
 ],
 "Attilan Rough Riders": [
  [
   "Horsemasters",
   "This unit is eligible to shoot and declare a charge in a turn in which it Fell Back."
  ]
 ],
 "Baneblade": [
  [
   "Rolling Fortress",
   "Each time a ranged attack is allocated to an Astra Militarum model from your army, if that model is not fully visible to every model in the attacking unit because of this Baneblade model, that model has the Benefit of Cover against that attack."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Banehammer": [
  [
   "Tremor Quake",
   "In your Shooting phase, just after selecting a target for this model’s tremor cannon, the target unit and every other enemy Infantry unit within 3\" of that unit must take a Battle-shock test."
  ],
  [
   "Transport",
   "This model has a transport capacity of 26 Astra Militarum Infantry models. Each Ogryn model takes up the space of 3 models. It cannot transport Artillery models."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Banesword": [
  [
   "Armour Obliteration",
   "Each time an attack made with this model’s quake cannon destroys an enemy model that has the Deadly Demise ability, that model’s Deadly Demise ability inflicts mortal wounds on a D6 roll of 3+ instead of on a 6."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Basilisk": [
  [
   "Earthshaker Rounds",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with its earthshaker cannon scored a hit against an enemy INFANTRY unit, until the start of your next Shooting phase, that unit is shaken. While a unit is shaken, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Bullgryn Squad": [
  [
   "Wall of Muscle",
   "Each time an attack is allocated to a model in this unit, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Slabshield",
   "The bearer has a Wounds characteristic of 4."
  ],
  [
   "Brute Shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Cadian Castellan": [
  [
   "Senior Officer",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability"
  ],
  [
   "Get Back in the Fight",
   "While this model is leading a unit, that unit is eligible to shoot in a turn in which it Fell Back."
  ],
  [
   "Leader",
   "This model can be attached to the following units: Cadian Shock Troops, Kasrkin"
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Cadian Command Squad": [
  [
   "Cadia Stands!",
   "While this unit contains an OFFICER model and this unit is within range of an objective, this unit can re-roll battle-shock rolls."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: Cadian Shock Troops"
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ],
  [
   "Regimental Standard",
   "Add 1 to the Objective Control characteristic of models in the bearer’s unit."
  ],
  [
   "Master Vox",
   "Each time the Officer in the bearer’s unit issues an Order, it can issue it to an eligible unit up to 24\" away."
  ],
  [
   "Medi-pack",
   "At the start of your Command phase, if the bearer's unit is below its Starting Strength, you can return up to D3 destroyed Platoon (excluding Characters) to this unit."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Cadian Shock Troops": [
  [
   "Shock Troops",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn."
  ],
  [
   "Unit Composition",
   "*This unit can have up to two Leader units attached to it, provided no more than one of those units is a Command Squad unit. If it does, and this Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.*"
  ],
  [
   "Vox-caster",
   "Each time you target the bearer’s unit with a Stratagem, roll one D6, adding 1 to the result if there are one or more friendly Officer models within 6\": on a 5+, you gain 1CP"
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- OGRYN SQUAD\n- BULLGRYN SQUAD"
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ]
 ],
 "Catachan Jungle Fighters": [
  [
   "Jungle Fighters",
   "Each time a model in this unit makes a melee attack, if this unit made a Charge move or was charged this turn, add 1 to the Wound roll."
  ],
  [
   "Unit Composition",
   "*This unit can have up to two Leader units attached to it, provided no more than one of those units is a Command Squad unit. If it does, and this Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.*"
  ],
  [
   "Vox-caster",
   "Each time you target the bearer’s unit with a Stratagem, roll one D6, adding 1 to the result if there are one or more friendly Officer models within 6\": on a 5+, you gain 1CP"
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- OGRYN SQUAD\n- BULLGRYN SQUAD"
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ]
 ],
 "Chimera": [
  [
   "Mobile Command Vehicle",
   "In your Command phase, one Officer model embarked within this Transport can issue Orders even though it is not on the battlefield. When doing so, measure distances to and from this *Transport."
  ]
 ],
 "Commissar": [
  [
   "Summary Execution",
   "Once per battle round, at the start of any phase, you can select one friendly Astra Militarum Infantry unit that is Battle-shocked and within 12\" of this model. If you do, one model in that unit is destroyed, and that unit is then no longer Battle-shocked."
  ],
  [
   "Political Overwatch",
   "While another Officer model is in the same unit as this model, you can re-roll Battle-shock tests taken for that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CADIAN SHOCK TROOPS\n- CATACHAN JUNGLE FIGHTERS\n- DEATH KORPS GRENADIER SQUAD\n- DEATH KORPS OF KRIEG\n- KASRKIN\n- KRIEG COMBAT ENGINEERS\n- TEMPESTUS SCIONS"
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Death Korps of Krieg": [
  [
   "Grim Demeanour",
   "Each time a model in this unit makes an attack, add 1 to the Hit roll if this unit is below its Starting Strength, and add 1 to the Wound roll as well if this unit is Below Half-strength."
  ],
  [
   "Unit Composition",
   "*This unit can have up to two Leader units attached to it, provided no more than one of those units is a Command Squad unit. If it does, and this Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.*"
  ],
  [
   "Death Korps of Krieg Medi-pack",
   "At the start of your Command phase, if the bearer’s unit is below its Starting Strength, you can return up to D3 destroyed Death Korps Troopers to this unit (if this unit contains two models equipped with a Death Korps medi-pack, return up to D3+1 destroyed Death Korps Troopers to this unit instead)."
  ],
  [
   "Vox-caster",
   "Each time you target the bearer’s unit with a Stratagem, roll one D6, adding 1 to the result if there are one or more friendly Officer models within 6\": on a 5+, you gain 1CP"
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- OGRYN SQUAD\n- BULLGRYN SQUAD"
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ]
 ],
 "Deathstrike": [
  [
   "Deathstrike Missile",
   "In your Shooting phase, each time this model is selected to shoot, if it has not shot with its  Deathstrike missile this battle, you can do one of the following in addition to resolving this model’s ranged attacks:\n\n- Designate Target: If this model does not have a Deathstrike Target marker on the battlefield, place a Deathstrike Target marker for this model anywhere on the battlefield.\n\n- Adjust Target: If this model has a Deathstrike Target marker on the battlefield, move that marker to anywhere else on the battlefield."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Doomhammer": [
  [
   "Close-range Titan Killer",
   "Each time this model’s magma cannon targets a Monster or Vehicle unit, that target is always considered to be within half range of that weapon."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Field Ordnance Battery": [
  [
   "Rearm, Reload, Fire",
   "While this unit is being affected by an Order, provided it Remained Stationary this turn, all Heavy weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability"
  ]
 ],
 "Gaunt’s Ghosts": [
  [
   "Covert Stealth Team",
   "At the end of your opponent’s turn, if this unit is unengaged, you can use this ability. If you do:\n- Place this unit in strategic reserves.\n- This unit has Deep Strike until the start of your next Shooting phase.\n- This unit must make an ingress move in your next Movement phase (including in your first turn)."
  ],
  [
   "Tanith Camo-cloaks",
   "Models in this unit have the Benefit of Cover."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Cadian Heavy Weapons Squad": [
  [
   "Covering Fire",
   "Each time you target this unit with the Fire Overwatch Stratagem, while resolving that Stratagem, hits are scored on unmodified Hit rolls of 5+, or on unmodified Hit rolls of 4+ instead if this unit is within 6\" of one or more friendly Platoon units."
  ],
  [
   "Embarking",
   "While embarked within a Transport, each model takes up the space of 2 models, and each weapon equipped by these models is considered to be 2 models' weapons for the purposes of the Firing Deck ability."
  ]
 ],
 "Hellhammer": [
  [
   "Close-quarters Warfare",
   "This model does not suffer the penalty to its Hit rolls for making ranged attacks while enemy units are within Engagement Range of it."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Hellhound": [
  [
   "Flush Them Out",
   "In your Shooting phase, after this model has shot, select one enemy unit that was hit by one or more of those attacks. Until the start of your next Shooting phase, that unit is scattered. While a unit is scattered, it cannot have the Benefit of Cover."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Hydra": [
  [
   "Flak Battery",
   "Each time this model makes an attack that targets a unit that can Fly, you can re-roll the Hit roll."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "‘Iron Hand’ Straken": [
  [
   "Been There, Seen it, Killed it",
   "Each time this model makes a melee attack, if it made a Charge move this turn, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Catachan Jungle Fighters"
  ],
  [
   "Cold Steel and Courage",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Kasrkin": [
  [
   "Warrior Elite",
   "Once per battle round, at the start of any phase, you can select one Order to affect this unit until the start of your next Command phase, in addition to any other Orders issued to this unit by an Officer model this turn."
  ],
  [
   "Melta mine",
   "Once per battle, at the start of any phase, you can select one enemy unit within 3\" of the bearer and roll one D6: on a 2+, that enemy unit suffers D3 mortal wounds, or 2D3 mortal wounds instead if it is a Vehicle unit."
  ],
  [
   "Vox-caster",
   "Each time you target the bearer’s unit with a Stratagem, roll one D6, adding 1 to the result if there are one or more friendly Officer models within 6\": on a 5+, you gain 1CP"
  ]
 ],
 "Leman Russ Battle Tank": [
  [
   "Armoured Spearhead",
   "Each time this model makes an attack that targets an enemy unit, re-roll a Hit roll of 1 and, if that unit is within range of an objective marker you do not control, you can re-roll the Hit roll instead."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Leman Russ Demolisher": [
  [
   "Line-breaker",
   "When making ranged attacks with its demolisher battle cannon, this model can target enemy units within Engagement Range of it (provided no other friendly units are also within Engagement Range of that enemy unit). In addition, when making ranged attacks, this model does not suffer the penalty to its Hit rolls for being within Engagement Range of one or more enemy units."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Leman Russ Eradicator": [
  [
   "Urban Warfare",
   "Each time a ranged attack targets this model, if this model has the Benefit of Cover against that attack, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Leman Russ Executioner": [
  [
   "Gung-ho Executioners",
   "Each time this model makes an attack with its executioner plasma cannon that targets a unit that is Below Half-strength, add 1 to the Hit roll."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Leman Russ Exterminator": [
  [
   "Withering Hail",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks made with its exterminator autocannon. Until the end of the phase, each time a friendly Astra Militarum unit makes an attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per phase."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Leman Russ Punisher": [
  [
   "Mow Down the Enemy",
   "Each time this model makes an attack with its punisher gatling cannon that targets an enemy unit (excluding Monsters and Vehicles), that attack has the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Leman Russ Vanquisher": [
  [
   "Tank-killer",
   "Each time this model makes a ranged attack with its vanquisher battle cannon that targets a Monster or Vehicle unit, you can re-roll the Wound roll."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Lord Solar Leontus": [
  [
   "The Lord Solar",
   "At the start of your Command phase, If this model is on the battlefield, you gain 1CP."
  ],
  [
   "The Collegiate Astrolex",
   "After both players have deployed their armies, select up to three Astra Militarum units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Supreme Commander",
   "If this model is in your army, it must be your Warlord."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- ATTILAN ROUGH RIDERS\n- CADIAN SHOCK TROOPS\n- CATACHAN JUNGLE FIGHTERS\n- DEATH KORPS GRENADIER SQUAD\n- DEATH KORPS OF KRIEG\n- DEATH RIDERS\n- KASRKIN\n- KRIEG COMBAT ENGINEERS"
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Manticore": [
  [
   "Furious Barrage",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding Monsters and Vehicles) that was hit by one or more of those attacks made with this model's storm eagle rockets. Until the start of your next Shooting phase, that enemy unit is staggered. While a unit is staggered, subtract 1 from the Objective Control characteristic of models in that unit (to a minimum of 1)."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Militarum Tempestus Command Squad": [
  [
   "Medi-pack",
   "At the start of your Command phase, if the bearer's unit is below its Starting Strength, you can return up to D3 destroyed Tempestus Scions models to this unit."
  ],
  [
   "Command Rod",
   "While the bearer is leading a unit, that unit can be affected by up to two different Orders at the same time."
  ],
  [
   "Leader",
   "This unit can be attached to the following unit:\n- Tempestus Scions"
  ],
  [
   "Tempestor Prime",
   "While this unit contains a Tempestor Prime, ranged weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Regimental Standard",
   "Add 1 to the Objective Control characteristic of models in the bearer’s unit."
  ],
  [
   "Master Vox",
   "Each time the Officer in the bearer’s unit issues an Order, it can issue it to an eligible unit up to 24\" away."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Munitorum Servitors": [
  [
   "Mindlock",
   "While a friendly Tech-Priest Enginseer model is leading this unit, improve the Ballistic Skill and Weapon Skill characteristics of ranged and melee weapons equipped by Munitorum Servitor models in this unit by 1."
  ],
  [
   "Servitor Retinue",
   "At the start of the Declare Battle Formations step, this unit can join one other unit from your army that is being led by a Regimental Enginseer (a unit cannot have more than one Munitorum Servitors unit joined to it). If it does, until the end of the battle, every model in this unit counts as being part of that Bodyguard unit, and that Bodyguard unit’s Starting Strength is increased accordingly."
  ]
 ],
 "Nork Deddog": [
  [
   "Thunderous Head-butt",
   "Each time this model’s unit is selected to fight, you can select one enemy unit within Engagement Range of this model and roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Loyal Protector",
   "At the start of the Declare Battle Formations step, this model must join one Command Squad unit from your army (a Command Squad cannot have more than one Loyal Protector model joined to it). This model then counts as part of that Command Squad for the rest of the battle, and its Starting Strength is increased accordingly. If it is not possible to join this model to a Command Squad, it does not take part in the battle and counts as having been destroyed. \n\nWhile this model is joined to a unit, it can embark within any Transport that unit can embark within, and takes up the space of 3 models.\n\nThis model cannot be selected as your Warlord."
  ],
  [
   "Ogryn Bodyguard",
   "While one or more Officer models are in the same unit as this model, those Officer models have the Feel No Pain 4+ ability"
  ]
 ],
 "Ogryn Bodyguard": [
  [
   "Loyal Protector",
   "At the start of the Declare Battle Formations step, this model must join one Command Squad unit from your army (a Command Squad cannot have more than one Loyal Protector model joined to it). This model then counts as part of that Command Squad for the rest of the battle, and its Starting Strength is increased accordingly. If it is not possible to join this model to a Command Squad, it does not take part in the battle and counts as having been destroyed. \n\nWhile this model is joined to a unit, it can embark within any Transport that unit can embark within, and takes up the space of 3 models.\n\nThis model cannot be selected as your WARLORD and cannot be given Enhancements"
  ],
  [
   "Slabshield",
   "The bearer has a Wounds characteristic of 7."
  ],
  [
   "Ogryn Bodyguard",
   "While one or more Officer models are in the same unit as this model, those Officer models have the Feel No Pain 4+ ability"
  ],
  [
   "Brute Shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Ogryn Squad": [
  [
   "Point-blank Barrage",
   "Each time a model in this unit makes a ranged attack that targets the closest eligible target, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Primaris Psyker": [
  [
   "Psychic Barrier (Psychic)",
   "At the start of your opponent’s Shooting phase, you can roll one D6: on a 1, this Psyker’s unit suffers D3 mortal wounds; on a 2+, until the end of the phase, models in this Psyker’s unit have a 4+ invulnerable save."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CADIAN SHOCK TROOPS\n- CATACHAN JUNGLE FIGHTERS\n- DEATH KORPS GRENADIER SQUAD\n- DEATH KORPS OF KRIEG\n- KASRKIN\n- KRIEG COMBAT ENGINEERS\n- TEMPESTUS SCIONS"
  ],
  [
   "Malign Wardings (Psychic)",
   "While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability against Psychic Attacks."
  ]
 ],
 "Regimental Attachés": [
  [
   "Aeronautica Commander",
   "At the start of your Shooting phase, select one enemy unit within 30\" of and visible to this unit’s Officer of the Fleet model. Until the end of the phase, each time a friendly Astra Militarum Aircraft model makes a ranged attack that targets that unit, add 1 to the Hit roll."
  ],
  [
   "Divination (Psychic)",
   "Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" of this unit’s Astropath model."
  ],
  [
   "Attachés",
   "At the start of the Declare Battle Formations step, this unit must join one Command Squad unit from your army (a Command Squad unit cannot have more than one Regimental Attaché unit joined to it). For the rest of the battle, every model in this unit counts as part of that Command Squad unit, and its Starting Strength is increased accordingly. If it is not possible to join a Regimental Attaché unit to a Command Squad in this way, it does not take part in the battle and counts as having been destroyed.\n\n\nWhile this unit is joined to a unit, it can embark within any Transport that unit can embark within."
  ],
  [
   "Artillery Commander",
   "At the start of your Shooting phase, select one enemy unit within 30\" of and visible to this unit’s Master of Ordnance model that has not already been selected for this ability this phase. Until the end of the phase, Blast weapons equipped by friendly Astra Militarum Artillery models have the [SUSTAINED HITS 1] ability when targeting that unit"
  ]
 ],
 "Tech-Priest Enginseer": [
  [
   "Vengeance for the Omnissiah",
   "If a friendly Astra Militarum Vehicle model is destroyed within 12\" of this model, until the end of the battle, this model’s Enginseer axe has an Attacks characteristic of 6."
  ],
  [
   "Omnissiah’s Blessing",
   "In your Command phase, select one friendly Astra Militarum Vehicle model within 3\" of this model. That Vehicle model regains up to D3 lost wounds and, until the start of your next Command phase, that Vehicle model has a 4+ invulnerable save. Each model can only be selected for this ability once per turn."
  ],
  [
   "Enginseer",
   "While this model is within 3\" of one or more friendly Astra Militarum Vehicle units, this model has the Lone Operative ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Cadian Shock Troops\n- Catachan Jungle Fighters\n- Death Korps of Krieg\n- Kasrkin\n- Krieg Combat Engineers"
  ]
 ],
 "Rogal Dorn Battle Tank": [
  [
   "Ablative Plating",
   "Once per battle, when an attack is allocated to this model, you change the Damage characteristic of that attack to 0."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Scout Sentinels": [
  [
   "Daring Recon",
   "At the start of your Shooting phase, select one enemy unit within 18\" of and visible to this unit. Until the end of the phase, each time a friendly Astra Militarum model makes an attack that targets that unit, re-roll a Hit roll of 1."
  ],
  [
   "Signal Flares",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is designated:\n▪ While a unit is designated, that unit has +3\" detection range."
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- OGRYN SQUAD\n- BULLGRYN SQUAD"
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ]
 ],
 "Sergeant Harker": [
  [
   "Harker’s Hellraisers",
   "While this model is leading a unit, each time a ranged attack targets that unit, if the attacking model is more than 12\" away, subtract 1 from the Hit roll."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- CATACHAN JUNGLE FIGHTERS"
  ],
  [
   "Payback Time",
   "Once per battle, when this model is selected to shoot, it can use this ability. If it does, until the end of the phase, its Payback weapon has an Attacks characteristic of 6 and the [SUSTAINED HITS 3] ability instead of the [SUSTAINED HITS 1] ability."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Shadowsword": [
  [
   "Titan-killer",
   "Each time this model makes a ranged attack with its volcano cannon that targets a Monster or Vehicle unit, that attack has the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Sly Marbo": [
  [
   "Like Fighting a Shadow",
   "In your Shooting phase, after this model has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move. If it does, until the end of the turn, this model is not eligible to declare a charge."
  ],
  [
   "One-man Army",
   "Once per turn, in your opponent's Shooting phase, when an enemy unit makes a ranged attack that targets a friendly Regiment unit within 3\" of this model, after that enemy unit has shot, this model can shoot as if it were your Shooting phase, but it must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target."
  ]
 ],
 "Stormlord": [
  [
   "Mount Up!",
   "At the end of your opponent’s Movement phase, if there are no models currently embarked within this Transport, you can select one friendly Astra Militarum Infantry unit (excluding Artillery units) that is wholly within 6\" of this Transport. Unless that unit is within Engagement Range of one or more enemy units, it can embark within this Transport."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Stormsword": [
  [
   "Concussive Wave",
   "In your Shooting phase, just after selecting a target for this model’s Stormsword siege cannon, roll one D6 for the target unit and every other unit within 3\" of that unit: on a 5+, the unit being rolled for is struck by a concussive wave. After this model has finished making its attacks against that target unit this phase, each unit struck by a concussive wave suffers D3 mortal wounds."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Leman Russ Commander": [
  [
   "Death Befitting An Officer",
   "In your opponent’s Shooting phase, when this unit is destroyed, before this unit’s deadly demise roll, roll one D6: \n- On a 2+, do not remove this unit from the battlefield. After the attacking unit has shot, this unit can shoot using normal shooting, but while doing so this unit can only target that enemy unit. When this unit has shot, or at the end of the phase (whichever comes first), resolve this unit’s deadly demise roll, then this unit is removed from the battlefield."
  ],
  [
   "Vox-net",
   "Each time this model issues an Order, it can issue it to an eligible unit up to 12\" away"
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Taurox": [
  [
   "Rapid Deployment",
   "Units can disembark from this Transport after it has Advanced. Units that do so count as having made a Normal move that phase, and cannot declare a charge in the same turn, but can otherwise act normally."
  ]
 ],
 "Taurox Prime": [
  [
   "Transport Support",
   "In your Shooting phase, after this model has shot, select one enemy unit that was hit by one or more of those attacks. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Hit roll."
  ]
 ],
 "Tempestus Scions": [
  [
   "Storm Troopers",
   "Each time a model in this unit makes an attack, re-roll a Wound roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Wound roll instead."
  ],
  [
   "Unit Composition",
   "*This unit can have up to two Leader units attached to it, provided no more than one of those units is a Command Squad unit. If it does, and this Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.*"
  ],
  [
   "Vox-caster",
   "Each time you target the bearer’s unit with a Stratagem, roll one D6, adding 1 to the result if there are one or more friendly Officer models within 6\": on a 5+, you gain 1CP"
  ]
 ],
 "Ursula Creed": [
  [
   "Lord Castellan",
   "While this model is leading a unit, that unit can be affected by up to two different Orders at the same time."
  ],
  [
   "Tactical Genius",
   "Once per battle round, one unit from your army with this ability can use it when a friendly Regiment unit within 12\" of that model is targeted with a Stratagem. If it does, reduce the CP cost of that usage of that Stratagem by 1 CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Cadian Shock Troops\n- Kasrkin"
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Valkyrie": [
  [
   "Airborne Insertion",
   "At the end of your opponent’s Movement phase, one or more units embarked within this Transport can disembark from it."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Wyvern": [
  [
   "Suppression Bombardment",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding Monsters and Vehicles) that was hit by one or more attacks made with this model’s Wyvern quad stormshard mortar. Unit the start of your next Shooting phase, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Death Riders": [
  [
   "Screening Line",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to 6\"."
  ]
 ],
 "Carnodon": [
  [
   "Ancient Conquest",
   "Each time this model makes an attack that targets an enemy unit that is within your opponent’s deployment zone, re-roll a Hit roll of 1 and re-roll a Wound roll of 1."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Cyclops Demolition Vehicle": [
  [
   "Demolition Charges",
   "Each time this model or an enemy unit ends a move, if this model is within 3\" of one or more enemy units, select one of those enemy units. This model is destroyed, but instead of rolling for its Deadly Demise ability, roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers D6 mortal wounds."
  ],
  [
   "Unstable Payload",
   "When rolling for this model’s Deadly Demise ability, units within 6\" suffer mortal wounds on a 4+, instead of on a 6."
  ],
  [
   "Compact",
   "This model can embark within an ASTRA MILITARUM TRANSPORT model as if it were an INFANTRY model. If it does, it takes up the space of 7 models."
  ]
 ],
 "Malcador": [
  [
   "Rugged Reliability",
   "Each time a ranged attack targets this model, worsen the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Malcador Annihilator": [
  [
   "Battlefield Dominance",
   "Ranged weapons equipped by this model have the [IGNORES COVER] ability while targeting an enemy unit within half range."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Malcador Defender": [
  [
   "Armoured Defender",
   "Each time you target this model with the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+ while resolving that Stratagem."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Malcador Infernus": [
  [
   "Explosive Death",
   "When this model is destroyed, roll one D6: on a 3+, do not remove it from play – it can, after the attacking model’s unit has finished making its attacks, shoot with its inferno gun as if it were your Shooting phase and as if it had its full wounds remaining. This model is then removed from play."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Medusa Carriage Battery": [
  [
   "Siege Bombardment",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. That enemy unit must take a Battle-shock test."
  ]
 ],
 "Earthshaker Carriage Battery": [
  [
   "Earthshaker Rounds",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with its earthshaker cannon scored a hit against an INFANTRY unit, until the end of your opponent’s next turn, that INFANTRY unit is shaken. While a unit is shaken, subtract 2\" from its Move characteristic and subtract 2 from Advance and Charge rolls made for it."
  ]
 ],
 "Stormblade": [
  [
   "Close-range Devastation",
   "Each time this model makes a ranged attack with its Stormblade plasma blastgun that targets a unit within half range, you can re-roll the Hit roll."
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Macharius": [
  [
   "Battlefield Control",
   "Each time this model makes a ranged attack, if it is within range of an objective marker you control, re-roll a Hit roll of 1."
  ],
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Macharius Vanquisher": [
  [
   "Tank Hunter",
   "Each time this model makes a ranged attack with its Macharius twin vanquisher cannon that targets a MONSTER or VEHICLE unit, you can re-roll the Hit roll."
  ],
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Macharius Vulcan": [
  [
   "Armoured Aggressor",
   "Each time this model makes a ranged attack, it does not suffer the penalty to the Hit roll for being within Engagement Range of one or more enemy units."
  ],
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Praetor": [
  [
   "Targeting Coordinates",
   "While this model is being affected by an Order, each time it makes an attack with its Praetor launcher, it does not suffer the penalty to the Hit roll for attacking a unit that is not visible to it."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Crassus": [
  [
   "Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit that was hit by one or more of those attacks. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Colossus": [
  [
   "Tracking Target",
   "Each time this model is selected to shoot, provided it Remained Stationary this turn, its Colossus siege mortar has the [ANTI-MONSTER 5+] and [ANTI-VEHICLE 5+] abilities while resolving those attacks."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Valdor": [
  [
   "Power Overload",
   "Each time this model makes an attack that targets a MONSTER or VEHICLE unit, you can re-roll the Damage roll."
  ],
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Avenger Strike Fighter": [
  [
   "Fiery Vengeance",
   "Once per turn, in your opponent’s Shooting phase, when another friendly ASTRA MILITARUM unit within 6\" of this model is destroyed by an attack made by a unit that can Fly, one model from your army with this ability can use it. If it does, after the attacking unit has finished making its attacks, that model can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit (and only if it is an eligible target)."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Voss-pattern Lightning": [
  [
   "Agile Dogfighter",
   "Each time an attack targets this model, subtract 1 from the Hit roll."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Vulture Gunship": [
  [
   "Gunship Barrage",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. That enemy unit must take a Battle-shock test."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Marauder Bomber": [
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Heavy Bombs",
   "Each time the bearer ends a Normal move, you can select one enemy unit it moved over during that move and roll nine D6, adding 1 to each result if that unit is a MONSTER or VEHICLE: for each 5+, that unit suffers 1 mortal wound."
  ],
  [
   "Inferno Bombs",
   "Each time the bearer ends a Normal move, you can select one enemy unit it moved over during that move and roll nine D6, adding 1 to each result if that unit is not a MONSTER or VEHICLE: for each 5+, that unit suffers 1 mortal wound."
  ]
 ],
 "Marauder Destroyer": [
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bomb Drop",
   "Each time this model ends a Normal move, you can select one enemy unit it moved over during that move and roll six D6: for each 3+, that unit suffers 1 mortal wound."
  ]
 ],
 "Tarantula Battery": [
  [
   "Sentry Programming",
   "You can target this unit with the Fire Overwatch Stratagem for 0CP, and can do so even if you have already used that Stratagem on a different unit this phase."
  ]
 ],
 "Rapier Laser Destroyer Battery": [
  [
   "Powerful Volley",
   "While this unit is being affected by an Order, provided it Remained Stationary this turn, Heavy weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ]
 ],
 "Hades Breaching Drill": [
  [
   "Subterranean Assault",
   "Each time you set up this model on the battlefield using the Deep Strike ability, you can select one friendly Astra Militarum Infantry unit in Strategic Reserves. If you do, set up that unit anywhere on the battlefield that is wholly within 9\" of this model and more than 8\" away from all enemy units."
  ]
 ],
 "Trojan Support Vehicle": [
  [
   "Support Vehicle",
   "In your Command phase, select one friendly ASTRA MILITARUM VEHICLE model within 3\" of this model. That VEHICLE model regains up to D3 lost wounds and, until the start of your next Command phase, each time that VEHICLE model makes an attack, re-roll a Hit roll of 1. The same VEHICLE model cannot be selected for both this ability and the REGIMENTAL ENGINSEER's Omnissiah’s Blessing ability in the same turn, and each model can only be selected for this ability once per Command phase."
  ]
 ],
 "Valkyrie Sky Talon": [
  [
   "Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Aquila Lander": [
  [
   "Aerial Deployment",
   "If this model starts the game in Hover mode and in Strategic Reserves, it can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Dominus Armoured Siege Bombard": [
  [
   "Pinning Bombardment",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with its Dominus triple bombard scored a hit against an enemy Infantry unit, that unit must take a Battle-shock test."
  ],
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Gorgon Heavy Transport": [
  [
   "Mount Up!",
   "At the end of your opponent’s Movement phase, if there are no models currently embarked within this Transport, you can select one friendly Astra Militarum Infantry unit (excluding Artillery units) that is wholly within 6\" of this Transport. Unless that unit is within Engagement Range of one or more enemy units, it can embark within this Transport."
  ],
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Death Korps Grenadier Squad": [
  [
   "Grenadiers",
   "Once per turn, you can target this unit with the Grenade Stratagem for 0CP."
  ],
  [
   "Grenadier Squad",
   "If a model from your army with the Leader ability can be attached to a Krieg Combat Engineers unit, it can be attached to this unit instead."
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- OGRYN SQUAD\n- BULLGRYN SQUAD"
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ]
 ],
 "Centaur Light Carrier": [
  [
   "Blistering Advance",
   "Units can disembark from this Transport after it has Advanced. Units that do so count as having made a Normal move that phase, and cannot declare a charge in the same turn, but can otherwise act normally in the remainder of the turn"
  ]
 ],
 "Macharius Omega": [
  [
   "Overwhelming Short-range Firepower",
   "Each time this model makes an attack that targets the closest eligible enemy unit, re-roll a Hit roll of 1 and re-roll a Wound roll or 1."
  ],
  [
   "Damaged: 1-7 Wounds Remaining",
   "While this model has 1-7 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Stygies Destroyer Tank Hunter": [
  [
   "Tank Hunter",
   "Each time this model makes a ranged attack that targets a Vehicle unit, add 1 to the Wound roll"
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Rein and Raus": [
  [
   "Shoot Sharp and Scarper",
   "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move. If it does, until the end of the turn, this unit is not eligible to declare a charge"
  ],
  [
   "The Ratling Twins",
   "While this unit contains 2 models, each time a model in this unit makes a ranged attack, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ]
 ],
 "Quartermaster Cadre Squad": [
  [
   "Medicae Medi-packs",
   "Whilst this unit contains one or more Medicae Servitors, models in this unit have the Feel No Pain 5+ ability."
  ],
  [
   "Mindlock",
   "While this unit contains a Quartermaster Revenant model, improve the Weapon Skill characteristic of this unit's Medical scalpels by 1."
  ],
  [
   "Leader",
   "This unit can be attached to the following units:\n- DEATH KORPS GRENADIER SQUAD\n- DEATH KORPS OF KRIEG\n- KRIEG COMBAT ENGINEERS"
  ]
 ],
 "Atlas Recovery Vehicle": [
  [
   "Recovery Vehicle",
   "At the end of your Movement phase, you can select one friendly Astra Militarum Vehicle model within 3\" of this model. That Vehicle model regains up to D3 lost wounds. Each model can only be selected for this ability once per turn."
  ]
 ],
 "Sabre Weapons Battery": [
  [
   "Sentinel Directives",
   "Each time you target this unit with the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+ when resolving that Stratagem."
  ],
  [
   "Fortification",
   "While an enemy unit is only within Engagement Range of one or more Fortifications from your army:\n■ That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n■ Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so."
  ],
  [
   "Defence Searchlight",
   "At the start of your Shooting phase, you can select one enemy unit within 24\" and visible to the bearer. Until the end of the phase, that unit cannot have the Benefit of Cover."
  ]
 ],
 "Elysian Drop Sentinel": [
  [
   "Meteoric Descent",
   "When this model is set up on the battlefield using the Deep Strike ability, it can perform a meteoric descent. If it does, this model can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units, but until the end of the turn, it is not eligible to declare a charge."
  ]
 ],
 "Elysian Sniper Squad": [
  [
   "Mark the Target",
   "Each time this unit Remains Stationary, until the start of your next Movement phase, ranged weapons equipped by models in this unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Sniper Teams",
   "For the purposes of embarking within Transports, each Elysian Sniper Team model counts as one Heavy Weapons Team model."
  ]
 ],
 "Heavy Mortar Team": [
  [
   "Rearm, Reload, Fire",
   "While this model is being affected by an Order, provided it Remained Stationary this turn, ranged weapons equipped by this model have the [SUSTAINED HITS 1] ability"
  ]
 ],
 "Armageddon-pattern Medusa": [
  [
   "Pinning Bombardment",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with its Medusa siege cannon scored a hit against an enemy Infantry unit, that unit must take a Battle-shock test."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Heavy Quad Launcher Team": [
  [
   "Suppression Bombardment",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding Monster and Vehicle units) hit by one or more of those attacks. Unit the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Arvus Lighter": [
  [
   "Aerial Deployment",
   "If this model starts the game in Hover mode and in Strategic Reserves, it can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules."
  ]
 ],
 "Vendetta Gunship": [
  [
   "Anti-armour Gunship",
   "Each time a ranged attack made by this model is allocated to a Monster or Vehicle model, re-roll a Damage roll of 1"
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Minotaur": [
  [
   "Armoured Frontis",
   "Each time an attack is allocated to this model, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Death Rider Commissar": [
  [
   "Summary Execution",
   "Once per battle round, at the start of any phase, you can select one friendly ASTRA MILITARUM INFANTRY or ASTRA MILITARUM MOUNTED unit that is Battle-shocked and within 12\" of this model. If you do, one model in that unit is destroyed, and that unit is then no longer Battle-shocked."
  ],
  [
   "Political Overwatch",
   "While another Officer model is in the same unit as this model, you can re-roll Battle-shock tests taken for that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Death Riders\n\n*You can attach this model to the above unit even if one Death Rider Squadron Commander, Lord Marshal Dreir or Lord Solar Leontus model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.*"
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Sentinel Powerlifter": [
  [
   "Powerlifter Charge",
   "Each time this model ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers 3 mortal wounds."
  ]
 ],
 "Manticore Platform": [
  [
   "Reinforced Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack"
  ],
  [
   "Furious Barrage",
   "Each time this model makes an attack with its storm eagle rockets that targets an enemy unit that contains five or more models, you can re-roll the Hit roll."
  ]
 ],
 "Hydra Platform": [
  [
   "Flak Battery",
   "Each time this model makes an attack that targets a unit that can Fly, you can re-roll the Hit roll."
  ],
  [
   "Reinforced Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack"
  ]
 ],
 "Griffon Mortar Carrier": [
  [
   "Suppression Bombardment",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding Monster and Vehicle units) hit by one or more of those attacks made with this model’s Griffon heavy mortar. Unit the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Earthshaker Platform": [
  [
   "Earthshaker Rounds",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with its earthshaker cannon scored a hit against an enemy Infantry unit, until the end of your opponent’s next turn, that unit is shaken. While a unit is shaken, subtract 2\" from its Move characteristic and subtract 2 from Advance and Charge rolls made for it."
  ],
  [
   "Reinforced Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack."
  ],
  [
   "Fortification",
   "While an enemy unit is only within Engagement Range of one or more Fortifications from your army:\n■ That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n■ Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so."
  ]
 ],
 "Mukaali Riders": [
  [
   "Desert Riders",
   "You can ignore any or all modifiers to this unit’s Move characteristic and to Advance and Charge rolls made for it. In addition, this unit is eligible to shoot and declare a charge in a turn in which it Fell Back"
  ]
 ],
 "Salamander Scout Vehicle": [
  [
   "Outflank",
   "When this model arrives from Strategic Reserves, it can be set up within your opponent’s deployment zone (all other restrictions still apply)."
  ]
 ],
 "Tauros Assault Vehicle": [
  [
   "Turbo-boost",
   "Each time this model Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of this model."
  ]
 ],
 "Tauros Venator": [
  [
   "Mobile Hunter-killer",
   "Each time this model makes an attack that targets a Monster or Vehicle unit, you can re-roll the Wound roll."
  ]
 ],
 "Salamander Command Vehicle": [
  [
   "Auspex Surveyor",
   "Each time this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that unit cannot have the Benefit of Cover"
  ]
 ],
 "Arkurian Stormhammer": [
  [
   "Rolling Fortress",
   "Each time a ranged attack is allocated to an ASTRA MILITARUM model from your army, if that model is not fully visible to every model in the attacking unit because of this Arkurian Stormhammer model, that model has the Benefit of Cover against that attack"
  ],
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Storm Chimera": [
  [
   "Mobile Command Vehicle",
   "In your Command phase, one Officer model embarked within this Transport can issue Orders even though it is not on the battlefield. When doing so, measure distances to and from this Transport."
  ]
 ],
 "Tempestus Aquilons": [
  [
   "Precision Drop",
   "In your Movement phase, when this unit is set up on the battlefield using the Deep Strike ability, it can perform a precision drop. If it does, this unit can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units, but until the end of the turn, it is not eligible to declare a charge."
  ],
  [
   "Servo-sentry",
   "When this unit is set up on the battlefield using the Deep Strike ability, the Tempestor Aquilon can shoot with its sentry weapon (its sentry flamer, sentry grenade launcher or sentry hot-shot volley gun)."
  ],
  [
   "Signal Flares",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is designated:\n▪ While a unit is designated, that unit has +3\" detection range."
  ]
 ],
 "Ratlings": [
  [
   "Shoot Sharp and Scarper",
   "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of any enemy units, it can make a Normal move as if it were your Movement phase. If it does, until the end of the turn, this unit is not eligible to declare a charge."
  ],
  [
   "Ratling Battlemutt",
   "Once per battle, when this unit is selected to shoot, it can use this ability. If it does, until the end of the phase, ranged weapons equipped by models in this unit have the [LETHAL HITS] ability.\n\nDesigner’s Note: *Place a Ratling Battlemutt token next to the unit, removing it once this ability has been used.*"
  ],
  [
   "Demolition Gear",
   "The bearer’s unit has the Grenades keyword."
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- OGRYN SQUAD\n- BULLGRYN SQUAD"
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ]
 ],
 "Krieg Command Squad": [
  [
   "Grim Determination",
   "While this unit contains an Officer, you can target this unit with Stratagems even while it is Battle-shocked and Orders issued to this unit do not cease to affect this unit if it becomes Battle-shocked."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- DEATH KORPS GRENADIER SQUAD\n- DEATH KORPS OF KRIEG\n- KRIEG COMBAT ENGINEERS"
  ],
  [
   "Alchemyk Counteragents",
   "The bearer's unit has the Feel No Pain 6+ ability against mortal wounds."
  ],
  [
   "Servo-scribes",
   "Once per battle, when issuing an Order, the Lord Commissar can issue one additional Order.\n\n\nDesigner's Note: Place a Servo-scribes token next to the unit, removing it when this ability has been used."
  ],
  [
   "Sharp Eyes, Light Fingers",
   "RATLINGS unit only. When this unit is selected to shoot, enemy units have +6\" detection range until this unit has shot."
  ],
  [
   "Exemplar of Duty",
   "COMMISSAR model only. This model has Feel No Pain 4+."
  ],
  [
   "Recon Star",
   "ASTRA MILITARUM INFANTRY PLATOON unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Long-range Scout",
   "SCOUT SENTINEL unit only. This unit has Infiltrators."
  ],
  [
   "Master Vox",
   "Each time the Officer in the bearer’s unit issues an Order, it can issue it to an eligible unit up to 24\" away."
  ],
  [
   "Regimental Standard",
   "Add 1 to the Objective Control characteristic of models in the bearer’s unit."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Lord Marshal Dreir": [
  [
   "Tough to Kill",
   "The first time this model is destroyed, roll one D6 at the end of the phase. On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with D3 wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Death Riders"
  ],
  [
   "Leading the Charge",
   "Each time this model's unit makes a Charge move, until the end of the turn, melee weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Catachan Command Squad": [
  [
   "Gung-ho Command",
   "While this unit contains an Officer, ranged weapons equipped by models in this unit have the [ASSAULT] ability."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: Catachan Jungle Fighters"
  ],
  [
   "Master Vox",
   "Each time the Officer in the bearer’s unit issues an Order, it can issue it to an eligible unit up to 24\" away."
  ],
  [
   "Regimental Standard",
   "Add 1 to the Objective Control characteristic of models in the bearer’s unit."
  ],
  [
   "Medi-pack",
   "At the start of your Command phase, if the bearer's unit is below its Starting Strength, you can return up to D3 destroyed Platoon (excluding Characters) to this unit."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Rogal Dorn Commander": [
  [
   "Called Shots",
   "Each time this model is selected to shoot, you can re-roll one Hit roll, you can re-roll one Wound roll and you can re-roll one Damage roll when resolving its attacks."
  ],
  [
   "Vox-net",
   "Each time this model issues an Order, it can issue it to an eligible unit up to 12\" away"
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Ministorum Priest": [
  [
   "Holy Piety",
   "Each time this model makes a melee attack, unless this model's unit is Battle-shocked, you can re-roll the Hit roll."
  ],
  [
   "War Hymns",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CADIAN SHOCK TROOPS\n- CATACHAN JUNGLE FIGHTERS\n- DEATH KORPS GRENADIER SQUAD\n- DEATH KORPS OF KRIEG\n- KASRKIN\n- KRIEG COMBAT ENGINEERS\n- TEMPESTUS SCIONS"
  ]
 ],
 "Krieg Combat Engineers": [
  [
   "Grenadiers",
   "Once per turn, you can target this unit with the Grenade Stratagem for 0CP."
  ],
  [
   "Remote mine",
   "Once per battle, at the start of your Shooting phase, you can select one enemy unit within 9\" of and visible to the bearer and roll one D6: on a 3+, that enemy unit suffers D3 mortal wounds, or 2D3 mortal wounds instead if it is a VEHICLE or FORTIFICATIONS unit.\n\nDesigner's Note: *Place a Remote Mine token next to the unit, removing it once this ability has been used.*"
  ],
  [
   "Signal Flares",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is designated:\n▪ While a unit is designated, that unit has +3\" detection range."
  ]
 ],
 "Catachan Heavy Weapons Squad": [
  [
   "Bring it Down!",
   "Each time a model in this unit makes a ranged attack that targets a Monster or Vehicle unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1."
  ],
  [
   "Embarking",
   "While embarked within a Transport, each model takes up the space of 2 models, and each weapon equipped by these models is considered to be 2 models' weapons for the purposes of the Firing Deck ability."
  ]
 ],
 "Krieg Heavy Weapons Squad": [
  [
   "Final Duty",
   "While the Fire Coordinator model is on the battlefield, each time a Heavy Weapons Gunner model is destroyed, roll one D6: on a 3+, do not remove it from play. The destroyed model can shoot after the attacking model’s unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Embarking",
   "While embarked within a Transport, each Heavy Weapons Gunner model takes up the space of 2 models, and each weapon equipped by these models is considered to be 2 models' weapons for the purposes of the Firing Deck ability."
  ]
 ],
 "Artillery Team": [
  [
   "Remorseless Barrage",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with an Indirect Fire weapon scored a hit against an enemy unit, that unit must take a Battle-shock test (if an Infantry unit is hit by one or more attacks made by a multiple rocket launcher, they must subtract 1 from their Battle-shock test when doing so)."
  ]
 ],
 "Provisionally Prepared": [
  [
   "Well-stocked Supplies",
   "While this model is leading a unit, improve the Leadership and Objective Control characteristics of models in that unit by 1."
  ],
  [
   "A Hearty 'Pick Me Up'",
   "While this model is leading a unit, in your Command phase, you can return up to D3 destroyed models to that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Ratlings"
  ]
 ],
 "Hell's Last": [
  [
   "Lesk’s Heroes",
   "Add 1 to the Leadership characteristic of models in this unit and you can re-roll Battle-shock and Leadership tests taken for this unit."
  ],
  [
   "Heroic Example",
   "While this unit’s Minka Lesk model is on the battlefield, each time a model in this unit makes an attack, you can re-roll the Hit roll."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Cadian Shock Troops"
  ],
  [
   "Regimental Banner",
   "Add 1 to the Objective Control characteristic of models in the bearer’s unit."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Commissar Yarrick": [
  [
   "Will of Iron",
   "The first time this model is destroyed, remove it from play, then, at the end of the phase, roll one D6: on a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with 3 wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CADIAN SHOCK TROOPS\n- CATACHAN JUNGLE FIGHTERS\n- DEATH KORPS GRENADIER SQUAD\n- DEATH KORPS OF KRIEG\n- KASRKIN\n- KRIEG COMBAT ENGINEERS\n- TEMPESTUS SCIONS"
  ],
  [
   "Hero of Hades Hive",
   "In your Command phase, you can select one of the abilities in the Hero of Hades Hive section. Until the start of your next Command phase, this model has that ability."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Commissar Graves": [
  [
   "Brutal Disciplinarian",
   "Once per turn, at the start of any phase, you can select one friendly Astra Militarum Infantry unit (excluding units that only contain one model) that is Battle-shocked and within 24\" of and visible to this model. If you do, one model in that unit is destroyed, and that unit is no longer Battle-shocked."
  ],
  [
   "Mechanised Spearhead",
   "In your Movement phase, each time a friendly Astra Militarum Regiment unit disembarks from a Transport that is within 6\" of this model, after that unit has been set up, this model can issue 1 Order to that Regiment unit, regardless of how many Orders this model has already issued this turn."
  ],
  [
   "Aquiline Prow",
   "Each time this unit ends a Charge move, you can select one enemy unit within Engagement Range of it, then roll one D6: on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Commissar Graves on Foot": [
  [
   "Brutal Disciplinarian",
   "Once per turn, at the start of any phase, you can select one friendly Astra Militarum Infantry (excluding units that only contain one model) unit that is Battle-shocked and within 12\" of this model. If you do, one model in that unit is destroyed, and that unit is no longer Battle-shocked."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CADIAN SHOCK TROOPS\n- CATACHAN JUNGLE FIGHTERS\n- DEATH KORPS GRENADIER SQUAD\n- DEATH KORPS OF KRIEG\n- KASRKIN\n- KRIEG COMBAT ENGINEERS\n- TEMPESTUS SCIONS"
  ],
  [
   "Icon of Discipline",
   "This model’s unit is eligible to shoot and declare a Charge in a turn in which it Fell Back."
  ],
  [
   "Using Commissar Graves",
   "Your army can only include one Commissar Graves or Commissar Graves on Foot unit."
  ],
  [
   "Voice Of Command",
   "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
  ]
 ],
 "Hippogriff AFV": [
  [
   "Convoy Escort Vehicle",
   "In your Shooting phase, after this unit has shot, it can make a Normal move of up to D6\". If it does, until the end of the turn, this unit is not eligible to declare a charge."
  ]
 ],
 "Centaur RSV": [
  [
   "Rapid Strike Vehicle",
   "While one or more units are embarked within this model, unless this model is Battle-shocked, add 1 to this model’s Objective Control characteristic for every 3 models (rounding down) embarked within it."
  ]
 ],
 "Cadian Recon Squad": [
  [
   "Vox-caster",
   "Each time you target the bearer’s unit with a Stratagem, roll one D6, adding 1 to the result if there are one or more friendly Officer models within 6\": on a 5+, you gain 1CP."
  ],
  [
   "Vox-relay beacon",
   "At the start of the battle, you can set up one Vox-relay Beacon token for this unit anywhere on the battlefield that is not in your opponent’s deployment zone. While a friendly Astra Militarum Regiment unit is within 6\" of that token, Officer units from your army can issue orders to that Regiment unit as if the Officer unit was within 6\" of it. At the end of every phase, If an enemy unit is within 1\" of a Vox-relay Beacon token you set up, that token is removed from the battlefield."
  ],
  [
   "Independent Operatives",
   "Each time an Order is issued to this unit, that Order affects this unit until a new Order is issued to this unit, or until this unit becomes Battle-shocked, or until the battle ends (whichever happens first)."
  ],
  [
   "Signal Flares",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is designated:\n▪ While a unit is designated, that unit has +3\" detection range."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Abhuman Auxiliaries",1,"Abhuman","","","",0,"","Take and Hold"],
  ["Armoured Infantry",2,"","","","",0,"","Take and Hold"],
  ["Bridgehead Strike",1,"","","","",0,"","Priority Assets"],
  ["Combined Arms",2,"","","","",0,"","Take and Hold"],
  ["Designation Force",1,"Recon","","","",0,"","Reconnaissance"],
  ["Grizzled Company",3,"Abhuman","","","",0,"","Priority Assets"],
  ["Hammer Of The Emperor",2,"","","","",0,"","Purge the Foe"],
  ["Mechanised Assault",2,"","","","",0,"","Reconnaissance"],
  ["Recon Element",3,"Recon","","","",0,"","Reconnaissance"],
  ["Siege Regiment",2,"","","","",0,"","Disruption"],
  ["Steel Hammer",2,"","","","",0,"","Purge the Foe"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Exemplar of Duty (Upgrade)",10,"Abhuman Auxiliaries","",null],
  ["Sharp Eyes (Upgrade)",10,"Abhuman Auxiliaries","",null],
  ["Exemplary Officer",20,"Armoured Infantry","Infantry Officer model only. Each time the bearer issues an Order to its own unit, you can select up to two other Platoon units within 3\" of the bearer’s unit. That Order is also issued to each of those units.",null],
  ["Grand Strategist",25,"Armoured Infantry","Officer model only. In your Command phase, the bearer can issue one additional Order.",null],
  ["Master Manoeuvrist",15,"Armoured Infantry","Infantry Officer model only. At the end of your opponent’s Fight phase, if the bearer’s unit is not within Engagement Range of one or more enemy units and every model in that unit is within 3\" of an Astra Militarum Transport from your army, it can embark within that Transport.",null],
  ["Omnissian Unguents",35,"Armoured Infantry","",null],
  ["Bombast-class Vox-array",15,"Bridgehead Strike","MILITARUM TEMPESTUS OFFICER model only. When this model issues an Order, if this unit has the Master Vox wargear ability, this model can issue that Order to up to three different REGIMENT units, instead of only one.",null],
  ["Priority Drop Beacon",25,"Bridgehead Strike","MILITARUM TEMPESTUS OFFICER model only. In your first Movement phase, this unit can make an ingress move.",null],
  ["Death Mask of Ollanius",10,"Combined Arms","Officer model only. While the bearer’s unit is Battle-shocked, subtract 1 from the Objective Control characteristic of models in that unit, instead of changing it to 0",null],
  ["Drill Commander",20,"Combined Arms","Officer model only. While the bearer is leading a unit, each time a model in that unit makes a ranged attack, if that unit Remained Stationary this turn, a Critical Hit is scored on a successful unmodified Hit roll of 5+.",null],
  ["Grand Strategist",15,"Combined Arms","Officer model only. In your Command phase, the bearer can issue one additional Order.",null],
  ["Reactive Command",15,"Combined Arms","Officer model only. Each time an enemy unit is set up within 8\" of the bearer's unit, the bearer can issue one Order. This is not counted towards the number of Orders the bearer can issue each battle round.",null],
  ["Long-range Scout (Upgrade)",10,"Designation Force","",null],
  ["Recon Star (Upgrade)",10,"Designation Force","",null],
  ["Abhuman Detail",20,"Grizzled Company","Commissar model only. Add the Ogryn keyword to the list of units this model can issue Orders too (as stated on its datasheet).\n\nIn the Declare Battle Formations step, the bearer can be attached to an Ogryn Squad or Bullgryn squad unit.",null],
  ["Aquilan Eye",20,"Grizzled Company","Astra Militarum Officer model only. Each time you select an Order for the bearer to issue, you can select the Order below:\n\nTarget Weak Spot (Order): Each time a model in this unit makes a ranged attack that targets an enemy unit within 12\", improve the Armour Penetration characteristic of that attack by 1.",null],
  ["Laud Hailer",10,"Grizzled Company","Astra Militarum Officer model only. Each time you select a unit for this Officer model to issue an Order to, that unit can be within 12\" instead of within 6\".",null],
  ["Spec Ops Veteran",15,"Grizzled Company","Astra Militarum Infantry Officer model only. Each time you select an Order for the bearer to issue, you can select the Order below:\n\nMove to the Shadows (Order): Each time a ranged attack targets this unit, until those attacks are resolved, models in this unit have the Stealth ability.",null],
  ["Calm Under Fire",15,"Hammer Of The Emperor","Vehicle Officer model only. Once per turn, after the bearer issues an Order to a Squadron unit from your army, it can issue the same Order to another Squadron unit from your army.",null],
  ["Indomitable Steed",15,"Hammer Of The Emperor","Vehicle Officer model only. The bearer has the Feel No Pain 6+ ability.",null],
  ["Regimental Banner",20,"Hammer Of The Emperor","Add 1 to the Objective Control characteristic of models in the bearer’s unit.",null],
  ["Veteran Crew",20,"Hammer Of The Emperor","Vehicle Officer model only. Each time a model in the bearer's unit makes a ranged attack, re-roll a Hit roll of 1.",null],
  ["Bold Leadership",25,"Mechanised Assault","Infantry Officer model only. If you control an objective marker at the end of your Command phase, and the bearer's unit (or any Transport it is embarked within) is within range of that objective marker, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn.",null],
  ["Sacred Unguents",10,"Mechanised Assault","Astra Militarum Tech-Priest Enginseer model only. At the start of your Shooting phase, select one Transport from your army (excluding Aircraft and Titanic units) within 3\" of the bearer. Until the end of the phase, each time that Transport makes an attack, you can re-roll the Hit roll.",null],
  ["Smoke Grenades",10,"Mechanised Assault","Infantry Officer model only. The bearer's unit has the Benefit of Cover and the Stealth ability while the bearer's unit is wholly within 3\" of one or more friendly Transport models.",null],
  ["Vanguard Honours",15,"Mechanised Assault","Infantry Officer model only. The bearer's unit can disembark from a Transport after it has Advanced. If it does, it counts as having made a Normal move that phase, and cannot declare a charge in the same turn, but can otherwise act normally in the remainder of the turn.",null],
  ["Guerrilla Honours",25,"Recon Element","Infantry Officer model only. After both players have deployed their armies, if the bearer is on the battlefield, select up to three other Astra Militarum Infantry units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",null],
  ["Scare Gas Grenades",5,"Recon Element","Astra Militarum Infantry model only. Once per battle, at the start of any phase, the bearer can use this Enhancement. If it does, select one enemy unit within 8\" of the bearer's unit (excluding Monster and Vehicle units); that unit must take a Battle-shock test.",null],
  ["Survival Gear",5,"Recon Element","Astra Militarum Infantry model only. The bearer has the Scouts 6\" ability.",null],
  ["Tripwires",20,"Recon Element","Astra Militarum Infantry model only. Each time an enemy Infantry or Mounted unit ends a Normal, Advance, Charge, or Fall Back move within 8\" of the bearer's unit, roll a D6; on a 4+, until the start of your next turn, that enemy unit is stunned. While a unit is stunned, each time a model in that unit makes an attack, subtract 1 from the Hit roll.",null],
  ["Eager Advance",20,"Siege Regiment","Infantry Officer model only. While the bearer is leading a Regiment unit, that unit has the Scouts 6\" ability.",null],
  ["Flash Grenades",20,"Siege Regiment","Infantry Officer model only. Enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer's unit.",null],
  ["Legacy Sidearm",10,"Siege Regiment","Infantry Officer model only. Add 2 to the Attacks characteristics of the bearer's Pistols.",null],
  ["Stalwart’s Honours",15,"Siege Regiment","Officer model only. While the bearer is leading a unit, when that unit is issued an Order, it is also affected by the Take Cover! Order.",null],
  ["Assault Hatches",25,"Steel Hammer","Astra Militarum Titanic Character Transport model only. Each time a unit disembarks from the bearer after it has made a Normal move, that unit is still eligible to declare a charge this turn.",null],
  ["Battalion Commander",30,"Steel Hammer","Astra Militarum Titanic Character model only. The bearer has the Voice of Command ability and the Officer keyword, and can issue up to 2 Orders to Astra Militarum Titanic and Squadron units.",null],
  ["Engine Speaker",15,"Steel Hammer","Astra Militarum Tech-Priest Enginseer model only. Each time the bearer uses its Omnissiah’s Blessing ability, until the start of your next Command phase, add 3\" to the Move characteristic of the selected Vehicle model.",null],
  ["Titan Killer",20,"Steel Hammer","Each time this model makes a ranged attack with its volcano cannon that targets a Monster or Vehicle unit, that attack has the [DEVASTATING WOUNDS] ability.",null]
];

/* KW : les mots-clés dont les règles de détachement se servent,
   déduits des catégories du catalogue */
const KW = {
 "vehicle": [
  "Aquila Lander",
  "Arkurian Stormhammer",
  "Armageddon-pattern Medusa",
  "Armoured Sentinels",
  "Arvus Lighter",
  "Atlas Recovery Vehicle",
  "Avenger Strike Fighter",
  "Baneblade",
  "Banehammer",
  "Banesword",
  "Basilisk",
  "Carnodon",
  "Centaur Light Carrier",
  "Centaur RSV",
  "Chimera",
  "Colossus",
  "Crassus",
  "Cyclops Demolition Vehicle",
  "Deathstrike",
  "Dominus Armoured Siege Bombard",
  "Doomhammer",
  "Elysian Drop Sentinel",
  "Gorgon Heavy Transport",
  "Griffon Mortar Carrier",
  "Hades Breaching Drill",
  "Hellhammer",
  "Hellhound",
  "Hippogriff AFV",
  "Hydra",
  "Leman Russ Battle Tank",
  "Leman Russ Demolisher",
  "Leman Russ Eradicator",
  "Leman Russ Executioner",
  "Leman Russ Exterminator",
  "Leman Russ Punisher",
  "Leman Russ Vanquisher",
  "Macharius",
  "Macharius Omega",
  "Macharius Vanquisher",
  "Macharius Vulcan",
  "Malcador",
  "Malcador Annihilator",
  "Malcador Defender",
  "Malcador Infernus",
  "Manticore",
  "Marauder Bomber",
  "Marauder Destroyer",
  "Minotaur",
  "Praetor",
  "Rogal Dorn Battle Tank",
  "Salamander Command Vehicle",
  "Salamander Scout Vehicle",
  "Scout Sentinels",
  "Sentinel Powerlifter",
  "Shadowsword",
  "Storm Chimera",
  "Stormblade",
  "Stormlord",
  "Stormsword",
  "Stygies Destroyer Tank Hunter",
  "Tarantula Battery",
  "Taurox",
  "Taurox Prime",
  "Trojan Support Vehicle",
  "Valdor",
  "Valkyrie",
  "Valkyrie Sky Talon",
  "Vendetta Gunship",
  "Voss-pattern Lightning",
  "Vulture Gunship",
  "Wyvern"
 ],
 "monster": [],
 "battleline": [
  "Cadian Shock Troops",
  "Catachan Jungle Fighters",
  "Death Korps of Krieg"
 ],
 "epic": [
  "Commissar Graves",
  "Commissar Graves on Foot",
  "Commissar Yarrick",
  "Gaunt’s Ghosts",
  "Hell's Last",
  "Lord Marshal Dreir",
  "Lord Solar Leontus",
  "Nork Deddog",
  "Provisionally Prepared",
  "Rein and Raus",
  "Sergeant Harker",
  "Sly Marbo",
  "Ursula Creed",
  "‘Iron Hand’ Straken"
 ],
 "infantry": [
  "Artillery Team",
  "Bullgryn Squad",
  "Cadian Heavy Weapons Squad",
  "Cadian Recon Squad",
  "Catachan Heavy Weapons Squad",
  "Death Korps Grenadier Squad",
  "Earthshaker Carriage Battery",
  "Elysian Sniper Squad",
  "Field Ordnance Battery",
  "Heavy Mortar Team",
  "Heavy Quad Launcher Team",
  "Kasrkin",
  "Krieg Combat Engineers",
  "Krieg Heavy Weapons Squad",
  "Medusa Carriage Battery",
  "Munitorum Servitors",
  "Ogryn Squad",
  "Rapier Laser Destroyer Battery",
  "Ratlings",
  "Regimental Attachés",
  "Tempestus Aquilons",
  "Tempestus Scions"
 ],
 "character": [
  "Cadian Castellan",
  "Cadian Command Squad",
  "Catachan Command Squad",
  "Commissar",
  "Death Rider Commissar",
  "Krieg Command Squad",
  "Leman Russ Commander",
  "Militarum Tempestus Command Squad",
  "Ministorum Priest",
  "Ogryn Bodyguard",
  "Primaris Psyker",
  "Quartermaster Cadre Squad",
  "Rogal Dorn Commander",
  "Tech-Priest Enginseer"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Aegis Defence Line": "coque",
 "Armoured Sentinels": "80",
 "Attilan Rough Riders": "60x35.5",
 "Baneblade": "coque",
 "Banehammer": "coque",
 "Banesword": "coque",
 "Basilisk": "coque",
 "Bullgryn Squad": "40",
 "Cadian Castellan": "28.5",
 "Cadian Command Squad": "28.5",
 "Cadian Shock Troops": "25",
 "Catachan Jungle Fighters": "25",
 "Chimera": "coque",
 "Commissar": "28.5",
 "Death Korps of Krieg": "25",
 "Deathstrike": "coque",
 "Doomhammer": "coque",
 "Field Ordnance Battery": "100",
 "Gaunt’s Ghosts": "28.5",
 "Cadian Heavy Weapons Squad": "50",
 "Hellhammer": "coque",
 "Hellhound": "coque",
 "Hydra": "coque",
 "Kasrkin": "28.5",
 "Leman Russ Battle Tank": "coque",
 "Leman Russ Demolisher": "coque",
 "Leman Russ Eradicator": "coque",
 "Leman Russ Executioner": "coque",
 "Leman Russ Exterminator": "coque",
 "Leman Russ Punisher": "coque",
 "Leman Russ Vanquisher": "coque",
 "Lord Solar Leontus": "80",
 "Manticore": "coque",
 "Militarum Tempestus Command Squad": "25",
 "Nork Deddog": "40",
 "Ogryn Bodyguard": "40",
 "Ogryn Squad": "40",
 "Primaris Psyker": "32",
 "Tech-Priest Enginseer": "32",
 "Rogal Dorn Battle Tank": "coque",
 "Scout Sentinels": "80",
 "Shadowsword": "coque",
 "Sly Marbo": "32",
 "Stormlord": "coque",
 "Stormsword": "coque",
 "Leman Russ Commander": "coque",
 "Taurox": "coque",
 "Taurox Prime": "coque",
 "Tempestus Scions": "25",
 "Ursula Creed": "32",
 "Valkyrie": "120x92",
 "Wyvern": "coque",
 "Death Riders": "60x35.5",
 "Cyclops Demolition Vehicle": "coque",
 "Avenger Strike Fighter": "120x92",
 "Tempestus Aquilons": "28.5",
 "Ratlings": "25",
 "Krieg Command Squad": "25",
 "Lord Marshal Dreir": "75x42",
 "Catachan Command Squad": "25",
 "Rogal Dorn Commander": "coque",
 "Ministorum Priest": "32",
 "Krieg Combat Engineers": "25",
 "Catachan Heavy Weapons Squad": "60",
 "Krieg Heavy Weapons Squad": "50",
 "Artillery Team": "130",
 "Commissar Yarrick": "32",
 "Commissar Graves": "coque",
 "Commissar Graves on Foot": "32",
 "Hippogriff AFV": "coque",
 "Centaur RSV": "coque",
 "Cadian Recon Squad": "28.5"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Baneblade": 8,
 "Banehammer": 8,
 "Banesword": 8,
 "Basilisk": 4,
 "Deathstrike": 4,
 "Doomhammer": 8,
 "Hellhammer": 8,
 "Hellhound": 4,
 "Hydra": 4,
 "Leman Russ Battle Tank": 4,
 "Leman Russ Demolisher": 4,
 "Leman Russ Eradicator": 4,
 "Leman Russ Executioner": 4,
 "Leman Russ Exterminator": 4,
 "Leman Russ Punisher": 4,
 "Leman Russ Vanquisher": 4,
 "Manticore": 4,
 "Rogal Dorn Battle Tank": 6,
 "Shadowsword": 8,
 "Stormlord": 8,
 "Stormsword": 8,
 "Leman Russ Commander": 4,
 "Valkyrie": 5,
 "Carnodon": 4,
 "Malcador": 6,
 "Malcador Annihilator": 6,
 "Malcador Defender": 6,
 "Malcador Infernus": 6,
 "Stormblade": 8,
 "Macharius": 7,
 "Macharius Vanquisher": 7,
 "Macharius Vulcan": 7,
 "Praetor": 6,
 "Crassus": 6,
 "Colossus": 4,
 "Valdor": 7,
 "Avenger Strike Fighter": 5,
 "Voss-pattern Lightning": 5,
 "Vulture Gunship": 5,
 "Marauder Bomber": 7,
 "Marauder Destroyer": 7,
 "Valkyrie Sky Talon": 5,
 "Aquila Lander": 4,
 "Dominus Armoured Siege Bombard": 7,
 "Gorgon Heavy Transport": 7,
 "Macharius Omega": 7,
 "Stygies Destroyer Tank Hunter": 4,
 "Armageddon-pattern Medusa": 4,
 "Vendetta Gunship": 5,
 "Minotaur": 6,
 "Arkurian Stormhammer": 8,
 "Rogal Dorn Commander": 6
};

const TRANSPORTS = {
 "Chimera": "This model has a transport capacity of 12 **^^Astra Militarum Infantry^^** models. Each **^^Ogryn^^** model takes up the space of 3 models. It cannot transport **^^Artillery^^** models.",
 "Doomhammer": "This model has a transport capacity of 26 **^^Astra Militarum Infantry^^** models. Each **^^Ogryn^^** model takes up the space of 3 models. It cannot transport **^^Artillery^^** models.",
 "Stormlord": "This model has a transport capacity of 40 **^^Astra Militarum Infantry^^** models. Each **^^Ogryn^^** model takes up the space of 3 models. It cannot transport **^^Artillery^^** models.",
 "Taurox": "This model has a transport capacity of 12 **^^Astra Militarum Infantry^^** models. Each **^^Ogryn^^** model takes up the space of 3 models. It cannot transport **^^Artillery^^** models.",
 "Taurox Prime": "This model has a transport capacity of 12 **^^Militarum Tempestus Infantry^^** or **^^Astra Militarum Infantry Character^^** models.",
 "Valkyrie": "This model has a transport capacity of 12 **^^Astra Militarum Infantry^^** models. Each **^^Ogryn^^** model takes up the space of 3 models. It cannot transport **^^Artillery^^** models.",
 "Crassus": "This model has a transport capacity of 35 ASTRA MILITARUM INFANTRY models. Each Heavy Weapons Team model and Veteran Heavy Weapons Team model takes up the space of  2 models. Each OGRYN model takes up the space of 3 models. It cannot transport ARTILLERY models.",
 "Valkyrie Sky Talon": "This model has a transport capacity of 1 TAUROS model or 2 ASTRA MILITARUM WALKER models.",
 "Aquila Lander": "This model has a transport capacity of 12 Astra Militarum Infantry models. Each Heavy Weapons Team model and Veteran Heavy Weapons Team model takes up the space of 2 models. Each Ogryn model takes up the space of 3 models. It cannot transport Artillery models.",
 "Gorgon Heavy Transport": "This model has a transport capacity of 30 **^^Astra Militarum Infantry^^** models. Each Heavy Weapons Team model and Veteran Heavy Weapons Team model takes up the space of 2 models. Each **^^Ogryn^^** model takes up the space of 3 models. It cannot transport **^^Artillery^^** models.",
 "Centaur Light Carrier": "This model has a transport capacity of 6 Astra Militarum Infantry models. Each Heavy Weapons Team model and Veteran Heavy Weapons Team model takes up the space of 2 models. It cannot transport Ogryn or Artillery models.",
 "Arvus Lighter": "This model has a transport capacity of 12 Astra Militarum Infantry models. Each Heavy Weapons Team model and Veteran Heavy Weapons Team model takes up the space of 2 models. It cannot transport Ogryn or Artillery models.",
 "Storm Chimera": "This model has a transport capacity of 12 Astra Militarum Infantry models. Each Heavy Weapons Team model and Veteran Heavy Weapons Team model takes up the space of 2 models. Each Ogryn model takes up the space of 3 models. It cannot transport Artillery models.",
 "Centaur RSV": "This model has a transport capacity of 12 **^^Astra Militarum Infantry^^** models. Each **^^Ogryn^^** model takes up the space of 3 models. It cannot transport **^^Artillery^^** models."
};
const FACTION = [
 [
  "Voice Of Command",
  "If your Army Faction is Astra Militarum, Officer models with this ability can issue Orders. Each Officer's datasheet will specify how many Orders it can issue and which units are eligible to receive those Orders. Each time an Officer model issues an Order, select one of the Orders below, then select one eligible friendly unit within 6\" of that Officer model to issue it to. Officer models can issue Orders in your Command phase and at the end of a phase in which they disembarked from a Transport or were set up on the battlefield.\n\nUntil the start of your next Command phase, the unit you selected is affected by that Order. Unless otherwise stated, a unit can only be affected by one Order at a time (any Order subsequently issued to that unit replaces the current one). Orders cannot be issued to Battle-shocked units, and if a unit being affected by an Order becomes Battle-shocked, that Order ceases to affect that unit.\n\n\nOnly Astra Militarum models gain the benefit of an Order issued to their unit.\n\nMOVE! MOVE! MOVE!\nAdd 3\" to the Move characteristic of models in this unit.\n\nFIX BAYONETS!\nImprove the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n\nTAKE AIM!\nImprove the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n\nFIRST RANK, FIRE! SECOND RANK, FIRE!\nImprove the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1.\n\nTAKE COVER!\nImprove the Save characteristic of models in this unit by 1 (this cannot improve a model’s Save to better than 3+).\n\nDUTY AND HONOUR!\nImprove the Leadership and Objective Control characteristics of models in this unit by 1."
 ]
];

/* Vides, et pour de bonnes raisons : voir l'en-tête. */
const ARMEMENT = {};
const STRAT_SIMU = [];
const APTIS_CIBLE = {};
const RETINUE = {};
const ENH_ANCIENS = {};
const GRPN = {};
const STRATS = [];
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
  cle : "astra",
  nom : "Astra Militarum",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
