/* ============================================================
   Données Empire T'au — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py tau

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 42 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     43 fiches sur 62 en ont un. Les autres — des Legends, que le
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
  ["AX-1-0 Tiger Shark",0,11,3,5,18,[1],[[1, {"1": 315}], [2, {"1": 375}]],0,"",0,"",0,"7+"],
  ["Aun'shi",6,3,6,5,3,[1],{"1": 50},0,"Meneur",1,"",1,"7+"],
  ["Aun'va",6,3,5,4,5,[3],{"3": 65},0,"",1,"",1,"7+"],
  ["Barracuda",0,10,3,5,14,[1],{"1": 220},0,"",1,"",0,"7+"],
  ["Breacher Team",6,3,4,0,1,[10],{"10": 80},0,"",0,"",2,"7+"],
  ["Broadside Battlesuits",5,6,2,0,8,[1, 2, 3],[[1, {"1": 75, "2": 150, "3": 255}], [3, {"1": 95, "2": 170, "3": 275}]],0,"",0,"",2,"7+"],
  ["Cadre Fireblade",6,3,4,0,3,[1],{"1": 50},0,"Meneur",0,"",1,"7+"],
  ["Commander Farsight",10,5,2,4,8,[1],{"1": 70},0,"Meneur",0,"",2,"6+"],
  ["Commander Shadowsun",10,4,3,5,6,[1],{"1": 100},0,"",0,"",1,"6+"],
  ["Commander in Coldstar Battlesuit",12,5,3,0,6,[1],{"1": 95},0,"Meneur",0,"",2,"7+"],
  ["Commander in Crisis Battlesuit",10,5,3,0,5,[1],{"1": 80},0,"Meneur",1,"",2,"7+"],
  ["Commander in Enforcer Battlesuit",8,5,2,0,6,[1],{"1": 80},0,"Meneur",0,"",2,"7+"],
  ["Crisis Battlesuits",10,5,3,0,4,[3, 6],{"3": 200, "6": 400},0,"",1,"",2,"7+"],
  ["Crisis Fireknife Battlesuits",10,5,3,0,4,[3],[[1, {"3": 100}], [3, {"3": 110}]],0,"",0,"",2,"7+"],
  ["Crisis Starscythe Battlesuits",10,5,3,0,4,[3],[[1, {"3": 100}], [3, {"3": 110}]],0,"",0,"",2,"7+"],
  ["Crisis Sunforge Battlesuits",10,5,3,4,4,[3],[[1, {"3": 125}], [3, {"3": 135}]],0,"",0,"",2,"7+"],
  ["Darkstrider",7,3,4,0,3,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Devilfish",12,9,3,0,13,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"7+"],
  ["Drone Sentry Turret",0,8,4,0,4,[1],{"1": 50},0,"",1,"",0,"8+"],
  ["Ethereal",6,3,5,5,3,[1],{"1": 50},0,"Meneur",0,"",1,"6+"],
  ["Firesight Team",6,3,4,0,4,[1],{"1": 55},0,"",0,"",3,"7+"],
  ["Ghostkeel Battlesuit",10,8,2,0,12,[1],[[1, {"1": 150}], [3, {"1": 165}]],0,"",0,"",3,"7+"],
  ["Great Knarloc",9,8,4,0,10,[1],{"1": 100},0,"",1,"",3,"7+"],
  ["Hammerhead Gunship",10,10,3,0,14,[1],[[1, {"1": 150}], [3, {"1": 160}]],0,"",0,"",3,"7+"],
  ["Heavy Gun Drones",8,5,4,0,2,[2],{"2": 45},0,"",1,"",0,"8+"],
  ["Knarloc Riders",7,5,5,0,4,[3],{"3": 110},0,"",1,"",2,"7+"],
  ["Kroot Carnivores",7,3,6,0,1,[10, 20],{"10": 65, "20": 130},0,"",0,"",2,"7+"],
  ["Kroot Farstalkers",7,3,6,0,1,[12],[[1, {"12": 75}], [3, {"12": 85}]],0,"",0,"",1,"7+"],
  ["Kroot Flesh Shaper",7,3,6,0,3,[1],{"1": 45},0,"Meneur",0,"",1,"7+"],
  ["Kroot Hounds",12,3,6,0,1,[5, 10],{"5": 45, "10": 65},0,"",0,"",0,"8+"],
  ["Kroot Lone-spear",12,5,5,0,6,[1],{"1": 80},0,"",0,"",2,"7+"],
  ["Kroot Trail Shaper",7,3,6,0,3,[1],{"1": 50},0,"Meneur",0,"",1,"7+"],
  ["Kroot War Shaper",7,3,6,0,3,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Krootox Rampagers",7,6,5,0,5,[3, 6],[[1, {"3": 85, "6": 170}], [3, {"3": 95, "6": 180}]],0,"",0,"",2,"7+"],
  ["Krootox Riders",7,6,5,0,5,[1, 2, 3],{"1": 45, "2": 60, "3": 90},0,"",0,"",2,"7+"],
  ["Longstrike",10,10,3,0,14,[1],{"1": 140},0,"",1,"",3,"7+"],
  ["Manta",40,14,2,5,60,[1],{"1": 2100},0,"",0,"",0,"7+"],
  ["Orca Dropship",20,12,3,0,28,[1],{"1": 275},0,"",1,"",0,"7+"],
  ["Pathfinder Team",7,3,4,0,1,[10],[[1, {"10": 85}], [3, {"10": 100}]],0,"",0,"",1,"7+"],
  ["Piranhas",14,7,4,0,7,[1, 2, 3],[[1, {"1": 65, "2": 110, "3": 165}], [3, {"1": 75, "2": 120, "3": 175}]],0,"",0,"",2,"7+"],
  ["R'varna Battlesuit",8,10,2,5,15,[1],{"1": 200},0,"",1,"",4,"7+"],
  ["Razorshark Strike Fighter",0,10,3,0,12,[1],{"1": 160},0,"",0,"",0,"7+"],
  ["Remora Stealth Drones",16,6,3,0,5,[2],{"2": 160},0,"",1,"",0,"7+"],
  ["Remote Sensor Tower",0,8,4,0,4,[1],{"1": 50},0,"",1,"",0,"8+"],
  ["Riptide Battlesuit",10,9,2,4,14,[1],[[1, {"1": 190}], [3, {"1": 220}]],0,"",0,"",4,"7+"],
  ["Shas'o R'alai",8,6,3,4,6,[1],{"1": 80},0,"Meneur",1,"",2,"7+"],
  ["Sky Ray Gunship",10,10,3,0,14,[1],{"1": 140},0,"",0,"",3,"7+"],
  ["Stealth Battlesuits",8,4,3,0,2,[5],[[1, {"5": 100}], [3, {"5": 110}]],0,"",0,"",1,"7+"],
  ["Stormsurge",8,11,2,4,20,[1],[[1, {"1": 375}], [2, {"1": 400}]],0,"",0,"",6,"7+"],
  ["Strike Team",6,3,4,0,1,[10],{"10": 70},0,"",0,"",2,"7+"],
  ["Sun Shark Bomber",0,9,3,0,12,[1],{"1": 150},0,"",0,"",0,"7+"],
  ["TX42 Piranha",14,7,4,0,7,[1],{"1": 60},0,"",1,"",2,"7+"],
  ["Ta'unar Supremacy Armour",8,13,2,5,30,[1],[[1, {"1": 790}], [2, {"1": 890}]],0,"",0,"",10,"7+"],
  ["Tetras",14,7,4,0,7,[2, 4],{"2": 80, "4": 160},0,"",1,"",2,"7+"],
  ["The Twin Lance",10,6,2,4,8,[2],{"2": 240},0,"",0,"",2,"6+"],
  ["Tidewall Droneport",4,8,3,0,10,[1],{"1": 85},0,"",0,"",0,"7+"],
  ["Tidewall Gunrig",4,8,3,0,14,[1],{"1": 90},0,"",0,"",0,"7+"],
  ["Tidewall Shieldline",4,8,3,5,10,[1],{"1": 20},0,"",0,"",0,"7+"],
  ["Tiger Shark",0,11,3,5,18,[1],[[1, {"1": 395}], [2, {"1": 445}]],0,"",0,"",0,"7+"],
  ["Vespid Stingwings",12,4,4,0,1,[5, 10],{"5": 70, "10": 115},0,"",0,"",1,"7+"],
  ["XV9 Hazard Battlesuits",8,6,3,0,4,[1, 2],{"1": 55, "2": 110},0,"",1,"",2,"7+"],
  ["Y'vahra Battlesuit",10,9,2,5,15,[1],{"1": 210},0,"",1,"",4,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["AX-1-0 Tiger Shark","Burst cannon","T","4",4,5,0,"1","","18\""],
  ["AX-1-0 Tiger Shark","Missile pod","T","2",4,7,1,"2","","30\""],
  ["AX-1-0 Tiger Shark","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["AX-1-0 Tiger Shark","Twin heavy rail cannon","T","1",4,26,5,"12","dev twin","120\""],
  ["AX-1-0 Tiger Shark","➤ Cyclic ion blaster - overcharge","T","3",4,8,2,"2","hazardous","18\""],
  ["AX-1-0 Tiger Shark","➤ Cyclic ion blaster - standard","T","3",4,7,1,"1","","18\""],
  ["AX-1-0 Tiger Shark","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["Aun'shi","Fidelity","C","6",3,5,1,"2","sust:1","càc"],
  ["Aun'va","Close combat weapon","C","1",6,2,0,"1","","càc"],
  ["Aun'va","Supreme honour blade","C","3",3,5,0,"1","","càc"],
  ["Barracuda","Long-barrelled burst cannon","T","8",4,6,0,"1","","24\""],
  ["Barracuda","Missile pod","T","2",4,7,1,"2","","30\""],
  ["Barracuda","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Barracuda","Swiftstrike burst cannon","T","16",4,6,1,"1","","36\""],
  ["Barracuda","Swiftstrike railgun","T","1",4,20,5,"D6+6","dev","72\""],
  ["Barracuda","➤ Cyclic ion blaster - overcharge","T","3",4,8,2,"2","hazardous","18\""],
  ["Barracuda","➤ Cyclic ion blaster - standard","T","3",4,7,1,"1","","18\""],
  ["Barracuda","➤ Ion cannon - overcharge","T","D6+3",4,8,2,"3","blast hazardous","60\""],
  ["Barracuda","➤ Ion cannon - standard","T","D6+3",4,7,1,"2","blast","60\""],
  ["Barracuda","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["Breacher Team","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Breacher Team","Pulse blaster","T","2",3,6,1,"1","assault","10\""],
  ["Breacher Team","Pulse pistol","T","1",4,5,0,"1","pistol","12\""],
  ["Breacher Team","Support turret","T","2",5,5,0,"1","indirect twin","30\""],
  ["Breacher Team","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Breacher Team","Close combat weapon","C","1",5,3,0,"1","","càc"],
  ["Broadside Battlesuits","Heavy rail rifle","T","2",4,12,4,"D6+1","heavy dev","60\""],
  ["Broadside Battlesuits","High-yield missile pods","T","6",4,7,1,"2","twin","30\""],
  ["Broadside Battlesuits","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Broadside Battlesuits","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Broadside Battlesuits","Twin plasma rifle","T","1",4,8,3,"3","twin","18\""],
  ["Broadside Battlesuits","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Broadside Battlesuits","Twin smart missile system","T","4",4,5,0,"1","indirect twin","30\""],
  ["Broadside Battlesuits","Crushing bulk","C","3",5,6,0,"1","","càc"],
  ["Cadre Fireblade","Fireblade pulse rifle","T","1",3,5,0,"2","rf:1","30\""],
  ["Cadre Fireblade","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Cadre Fireblade","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Cadre Fireblade","Close combat weapon","C","3",4,3,0,"1","","càc"],
  ["Commander Farsight","High-intensity plasma rifle","T","2",2,8,3,"3","","24\""],
  ["Commander Farsight","➤ Dawn Blade - strike","C","4",2,10,2,"3","","càc"],
  ["Commander Farsight","➤ Dawn Blade - sweep","C","8",2,6,1,"1","","càc"],
  ["Commander Shadowsun","Flechette launcher","T","5",2,3,0,"1","","18\""],
  ["Commander Shadowsun","High-energy fusion blaster","T","1",2,10,4,"D6","melta:2","18\""],
  ["Commander Shadowsun","Light missile pod","T","2",2,7,0,"2","","24\""],
  ["Commander Shadowsun","Pulse pistol","T","1",3,5,0,"1","pistol","12\""],
  ["Commander Shadowsun","Battlesuit fists","C","3",4,5,0,"1","","càc"],
  ["Commander in Coldstar Battlesuit","Airbursting fragmentation projector","T","D6",3,3,0,"1","blast indirect","24\""],
  ["Commander in Coldstar Battlesuit","Burst cannon","T","4",3,5,0,"1","","18\""],
  ["Commander in Coldstar Battlesuit","Fusion blaster","T","1",3,9,4,"D6","melta:2","12\""],
  ["Commander in Coldstar Battlesuit","High-output burst cannon","T","8",3,5,0,"1","","18\""],
  ["Commander in Coldstar Battlesuit","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Commander in Coldstar Battlesuit","Plasma rifle","T","1",3,8,3,"3","","18\""],
  ["Commander in Coldstar Battlesuit","T'au flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Commander in Coldstar Battlesuit","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Commander in Coldstar Battlesuit","➤ Cyclic ion blaster - overcharge","T","3",3,8,2,"2","hazardous","18\""],
  ["Commander in Coldstar Battlesuit","➤ Cyclic ion blaster - standard","T","3",3,7,1,"1","","18\""],
  ["Commander in Coldstar Battlesuit","Battlesuit fists","C","3",4,5,0,"1","","càc"],
  ["Commander in Crisis Battlesuit","Airbursting fragmentation projector","T","D6",3,3,0,"1","blast indirect","24\""],
  ["Commander in Crisis Battlesuit","Burst cannon","T","4",3,5,0,"1","","18\""],
  ["Commander in Crisis Battlesuit","Fusion blaster","T","1",3,9,4,"D6","melta:2","12\""],
  ["Commander in Crisis Battlesuit","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Commander in Crisis Battlesuit","Plasma rifle","T","1",3,8,3,"3","","18\""],
  ["Commander in Crisis Battlesuit","T'au flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Commander in Crisis Battlesuit","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Commander in Crisis Battlesuit","➤ Cyclic ion blaster - overcharge","T","3",3,8,2,"2","hazardous","18\""],
  ["Commander in Crisis Battlesuit","➤ Cyclic ion blaster - standard","T","3",3,7,1,"1","","18\""],
  ["Commander in Crisis Battlesuit","Battlesuit fists","C","3",4,5,0,"1","","càc"],
  ["Commander in Enforcer Battlesuit","Airbursting fragmentation projector","T","D6",3,3,0,"1","blast indirect","24\""],
  ["Commander in Enforcer Battlesuit","Burst cannon","T","4",3,5,0,"1","","18\""],
  ["Commander in Enforcer Battlesuit","Fusion blaster","T","1",3,9,4,"D6","melta:2","12\""],
  ["Commander in Enforcer Battlesuit","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Commander in Enforcer Battlesuit","Plasma rifle","T","1",3,8,3,"3","","18\""],
  ["Commander in Enforcer Battlesuit","T'au flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Commander in Enforcer Battlesuit","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Commander in Enforcer Battlesuit","➤ Cyclic ion blaster - overcharge","T","3",3,8,2,"2","hazardous","18\""],
  ["Commander in Enforcer Battlesuit","➤ Cyclic ion blaster - standard","T","3",3,7,1,"1","","18\""],
  ["Commander in Enforcer Battlesuit","Battlesuit fists","C","3",4,5,0,"1","","càc"],
  ["Crisis Battlesuits","Airbursting fragmentation projector","T","D6",4,3,0,"1","blast indirect","24\""],
  ["Crisis Battlesuits","Burst cannon","T","4",4,5,0,"1","","18\""],
  ["Crisis Battlesuits","Fusion blaster","T","1",4,9,4,"D6","melta:2","12\""],
  ["Crisis Battlesuits","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Crisis Battlesuits","Plasma rifle","T","1",4,8,3,"3","","18\""],
  ["Crisis Battlesuits","T'au flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Crisis Battlesuits","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Crisis Battlesuits","➤ Cyclic ion blaster - overcharge","T","3",4,8,2,"2","hazardous","18\""],
  ["Crisis Battlesuits","➤ Cyclic ion blaster - standard","T","3",4,7,1,"1","","18\""],
  ["Crisis Battlesuits","Battlesuit fists","C","3",5,5,0,"1","","càc"],
  ["Crisis Fireknife Battlesuits","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Crisis Fireknife Battlesuits","Plasma rifle","T","1",4,8,3,"3","","18\""],
  ["Crisis Fireknife Battlesuits","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Crisis Fireknife Battlesuits","Battlesuit fists","C","3",5,5,0,"1","","càc"],
  ["Crisis Starscythe Battlesuits","Burst cannon","T","4",4,5,0,"1","","18\""],
  ["Crisis Starscythe Battlesuits","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Crisis Starscythe Battlesuits","T'au flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Crisis Starscythe Battlesuits","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Crisis Starscythe Battlesuits","Battlesuit fists","C","3",5,5,0,"1","","càc"],
  ["Crisis Sunforge Battlesuits","Fusion blaster","T","1",4,9,4,"D6","melta:2","12\""],
  ["Crisis Sunforge Battlesuits","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Crisis Sunforge Battlesuits","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Crisis Sunforge Battlesuits","Battlesuit fists","C","3",5,5,0,"1","","càc"],
  ["Darkstrider","Shade","T","2",2,5,0,"2","assault","18\""],
  ["Darkstrider","Close combat weapon","C","3",4,3,0,"1","","càc"],
  ["Devilfish","Accelerator burst cannon","T","4",4,6,1,"1","","18\""],
  ["Devilfish","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Devilfish","Smart missile system","T","3",4,5,0,"1","indirect","30\""],
  ["Devilfish","Twin pulse carbine","T","2",4,5,0,"1","twin assault","20\""],
  ["Devilfish","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["Drone Sentry Turret","Twin burst cannon","T","4",5,5,0,"1","twin","18\""],
  ["Drone Sentry Turret","Twin fusion blaster","T","1",5,9,4,"D6","melta:2 twin","12\""],
  ["Drone Sentry Turret","Twin missile pod","T","2",5,7,1,"2","twin","30\""],
  ["Drone Sentry Turret","Twin plasma rifle","T","1",5,8,3,"3","twin","24\""],
  ["Ethereal","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Ethereal","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Ethereal","Honour stave","C","2",4,5,0,"1","","càc"],
  ["Firesight Team","Longshot pulse rifles","T","3",4,5,1,"2","heavy precision","36\""],
  ["Firesight Team","Pulse pistol","T","1",3,5,0,"1","pistol","12\""],
  ["Firesight Team","Close combat weapons","C","4",5,3,0,"1","","càc"],
  ["Ghostkeel Battlesuit","Fusion collider","T","2",4,12,4,"D6","melta:2","18\""],
  ["Ghostkeel Battlesuit","Twin T'au flamer","T","D6",0,4,0,"1","ignorescover torrent twin","12\""],
  ["Ghostkeel Battlesuit","Twin burst cannon","T","4",4,5,0,"1","twin","18\""],
  ["Ghostkeel Battlesuit","Twin fusion blaster","T","1",4,9,4,"D6","melta:2 twin","12\""],
  ["Ghostkeel Battlesuit","➤ Cyclic ion raker - overcharge","T","6",4,8,2,"3","hazardous","36\""],
  ["Ghostkeel Battlesuit","➤ Cyclic ion raker - standard","T","6",4,7,1,"2","","36\""],
  ["Ghostkeel Battlesuit","Ghostkeel fists","C","3",5,6,0,"2","","càc"],
  ["Great Knarloc","Kroot bolt thrower","T","1",4,12,2,"3","","12\""],
  ["Great Knarloc","Kroot rifle (Ranged)","T","1",4,4,0,"1","rf:1","24\""],
  ["Great Knarloc","Twin Kroot gun","T","2",4,7,0,"2","twin","36\""],
  ["Great Knarloc","Great Knarloc beak and talons","C","4",3,7,1,"3","extra","càc"],
  ["Great Knarloc","Kroot rifle (Melee)","C","2",3,4,0,"1","","càc"],
  ["Hammerhead Gunship","Accelerator burst cannon","T","4",4,6,1,"1","","18\""],
  ["Hammerhead Gunship","Railgun","T","1",4,20,5,"D6+6","heavy dev","72\""],
  ["Hammerhead Gunship","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Hammerhead Gunship","Smart missile system","T","3",4,5,0,"1","indirect","30\""],
  ["Hammerhead Gunship","Twin pulse carbine","T","2",4,5,0,"1","twin","20\""],
  ["Hammerhead Gunship","➤ Ion cannon - overcharge","T","D6+3",4,8,2,"3","blast hazardous","60\""],
  ["Hammerhead Gunship","➤ Ion cannon - standard","T","D6+3",4,7,1,"2","blast","60\""],
  ["Hammerhead Gunship","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["Heavy Gun Drones","Burst cannon","T","4",4,5,0,"1","","18\""],
  ["Heavy Gun Drones","Twin burst cannon","T","4",5,5,0,"1","twin","18\""],
  ["Heavy Gun Drones","Close combat weapon","C","1",6,3,0,"1","","càc"],
  ["Knarloc Riders","Kroot rifle (Ranged)","T","1",4,4,0,"1","rf:1","24\""],
  ["Knarloc Riders","Knarloc beak and talons","C","4",3,6,1,"1","extra","càc"],
  ["Knarloc Riders","Kroot rifle (Melee)","C","2",3,4,0,"1","","càc"],
  ["Kroot Carnivores","Kroot carbine","T","1",4,4,0,"2","","18\""],
  ["Kroot Carnivores","Kroot pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Kroot Carnivores","Kroot rifle","T","1",4,4,0,"1","rf:1","24\""],
  ["Kroot Carnivores","Tanglebomb launcher","T","D3",4,5,0,"1","blast","24\""],
  ["Kroot Carnivores","Close combat weapon","C","2",3,4,0,"1","","càc"],
  ["Kroot Farstalkers","Dvorgite skinner","T","D6",0,4,1,"1","ignorescover torrent","12\""],
  ["Kroot Farstalkers","Farstalker firearm","T","1",4,4,0,"1","rf:1","24\""],
  ["Kroot Farstalkers","Kroot pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Kroot Farstalkers","Londaxi tribalest","T","3",5,7,1,"1","anti:4:veh dev heavy","18\""],
  ["Kroot Farstalkers","T'au tech rifle","T","1",4,5,0,"1","rf:1","30\""],
  ["Kroot Farstalkers","Close combat weapon","C","2",3,4,0,"1","","càc"],
  ["Kroot Farstalkers","Ripping fangs","C","3",3,3,0,"1","","càc"],
  ["Kroot Farstalkers","Ritual blade","C","3",3,5,0,"1","","càc"],
  ["Kroot Flesh Shaper","Kroot scattergun","T","2",4,4,0,"1","assault","12\""],
  ["Kroot Flesh Shaper","Twin ritualistic blades","C","4",2,5,1,"1","twin","càc"],
  ["Kroot Hounds","Ripping fangs","C","3",3,3,0,"1","","càc"],
  ["Kroot Lone-spear","Blast javelin","T","D6",4,10,2,"2","assault blast","18\""],
  ["Kroot Lone-spear","Kroot long gun","T","1",3,6,2,"3","heavy precision","36\""],
  ["Kroot Lone-spear","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Kroot Lone-spear","Hunting javelin","C","3",3,4,1,"1","lance","càc"],
  ["Kroot Lone-spear","Kalamandra's bite","C","4",4,5,1,"1","extra","càc"],
  ["Kroot Trail Shaper","Kroot rifle","T","1",4,4,0,"1","rf:1","24\""],
  ["Kroot Trail Shaper","Shaper's blade","C","4",2,5,0,"1","","càc"],
  ["Kroot War Shaper","Dart-bow and tri-blade","T","D3+1",4,4,0,"2","anti:3:inf assault heavy","24\""],
  ["Kroot War Shaper","Kroot pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Kroot War Shaper","Bladestave and prey-hook","C","4",2,5,1,"2","lethal","càc"],
  ["Kroot War Shaper","Shaper's blade","C","4",2,5,0,"1","","càc"],
  ["Krootox Rampagers","Kroot pistol and hunting javelins","T","2",4,4,0,"1","assault pistol","12\""],
  ["Krootox Rampagers","Hunting blades","C","3",3,4,1,"1","lance","càc"],
  ["Krootox Rampagers","Rampager fists","C","4",3,6,1,"2","extra sust:1","càc"],
  ["Krootox Riders","Repeater cannon","T","2",4,7,1,"2","rf:2","36\""],
  ["Krootox Riders","Tanglecannon","T","D6+1",4,6,0,"1","blast heavy","36\""],
  ["Krootox Riders","Close combat weapon","C","2",3,4,0,"1","","càc"],
  ["Krootox Riders","Krootox fists","C","4",3,6,1,"2","extra","càc"],
  ["Longstrike","Accelerator burst cannon","T","4",4,6,1,"1","","18\""],
  ["Longstrike","Railgun","T","1",3,20,5,"D6+6","dev heavy","72\""],
  ["Longstrike","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Longstrike","Smart missile system","T","3",4,5,0,"1","indirect","30\""],
  ["Longstrike","Twin pulse carbine","T","2",4,5,0,"1","twin assault","20\""],
  ["Longstrike","➤ Ion cannon - overcharge","T","D6+3",3,8,2,"3","blast hazardous","60\""],
  ["Longstrike","➤ Ion cannon - standard","T","D6+3",3,7,1,"2","blast","60\""],
  ["Longstrike","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["Manta","Heavy rail cannon","T","1",4,26,5,"12","dev","120\""],
  ["Manta","Long-barrelled burst cannon array","T","32",4,6,1,"1","","24\""],
  ["Manta","Missile pod","T","2",4,7,1,"2","","30\""],
  ["Manta","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Manta","➤ Ion cannon - overcharge","T","D6+3",4,8,2,"3","blast hazardous","60\""],
  ["Manta","➤ Ion cannon - standard","T","D6+3",4,7,1,"2","blast","60\""],
  ["Manta","Armoured hull","C","8",5,6,0,"1","","càc"],
  ["Orca Dropship","Long-barrelled burst cannon","T","4",4,5,0,"1","","36\""],
  ["Orca Dropship","Missile pod","T","2",4,7,1,"2","","30\""],
  ["Orca Dropship","Armoured hull","C","3",5,8,0,"1","","càc"],
  ["Pathfinder Team","Drone burst cannon","T","4",5,5,0,"1","","18\""],
  ["Pathfinder Team","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Pathfinder Team","Pulse carbine","T","2",4,5,0,"1","","20\""],
  ["Pathfinder Team","Pulse pistol","T","1",4,5,0,"1","pistol","12\""],
  ["Pathfinder Team","Rail rifle","T","1",5,10,4,"3","dev heavy","30\""],
  ["Pathfinder Team","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Pathfinder Team","➤ Ion rifle - overcharge","T","3",5,8,2,"2","hazardous heavy","30\""],
  ["Pathfinder Team","➤ Ion rifle - standard","T","3",5,7,1,"1","heavy","30\""],
  ["Pathfinder Team","➤ Semi-automatic grenade launcher - EMP","T","1",4,3,0,"1","anti:4:veh dev","18\""],
  ["Pathfinder Team","➤ Semi-automatic grenade launcher - fusion","T","1",4,6,1,"3","","18\""],
  ["Pathfinder Team","Close combat weapon","C","1",5,3,0,"1","","càc"],
  ["Piranhas","Piranha burst cannon","T","4",4,6,1,"1","","18\""],
  ["Piranhas","Piranha fusion blaster","T","1",4,9,4,"D6","melta:4","12\""],
  ["Piranhas","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Piranhas","Twin pulse carbine","T","2",4,5,0,"1","twin assault","20\""],
  ["Piranhas","Armoured hull","C","2",5,4,0,"1","","càc"],
  ["R'varna Battlesuit","Missile pod","T","2",5,7,1,"2","","30\""],
  ["R'varna Battlesuit","Pulse submunitions cannon","T","D6+2",4,8,1,"2","blast","60\""],
  ["R'varna Battlesuit","Battlesuit fists","C","6",5,6,0,"2","","càc"],
  ["Razorshark Strike Fighter","Accelerator burst cannon","T","4",4,6,1,"1","","18\""],
  ["Razorshark Strike Fighter","Missile pod","T","2",4,7,1,"2","","30\""],
  ["Razorshark Strike Fighter","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Razorshark Strike Fighter","➤ Quad ion turret - overcharge","T","8",4,8,2,"2","hazardous twin","30\""],
  ["Razorshark Strike Fighter","➤ Quad ion turret - standard","T","8",4,7,1,"1","twin","30\""],
  ["Razorshark Strike Fighter","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["Remora Stealth Drones","Remora seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Remora Stealth Drones","Twin long-barrelled burst cannon","T","4",4,6,1,"1","twin","24\""],
  ["Remora Stealth Drones","Close combat weapon","C","1",5,4,0,"1","","càc"],
  ["Riptide Battlesuit","Heavy burst cannon","T","12",4,6,1,"2","","36\""],
  ["Riptide Battlesuit","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Riptide Battlesuit","Twin fusion blaster","T","1",4,9,4,"D6","melta:2 twin","12\""],
  ["Riptide Battlesuit","Twin plasma rifle","T","1",4,8,3,"3","twin","18\""],
  ["Riptide Battlesuit","Twin smart missile system","T","3",4,5,0,"1","indirect twin","30\""],
  ["Riptide Battlesuit","➤ Ion accelerator - overcharge","T","6",4,10,3,"4","hazardous","72\""],
  ["Riptide Battlesuit","➤ Ion accelerator - standard","T","6",4,9,2,"3","","72\""],
  ["Riptide Battlesuit","Riptide fists","C","6",5,6,0,"2","","càc"],
  ["Shas'o R'alai","➤ Experimental pulse submunitions rifle - EMP","T","1",3,1,0,"3","anti:3:veh dev","24\""],
  ["Shas'o R'alai","➤ Experimental pulse submunitions rifle - ionic cluster-beam shell","T","D6",3,6,1,"1","blast","24\""],
  ["Shas'o R'alai","Battlesuit fists","C","3",4,5,0,"1","","càc"],
  ["Sky Ray Gunship","Accelerator burst cannon","T","4",4,6,1,"1","","18\""],
  ["Sky Ray Gunship","Seeker missile rack","T","3",4,14,3,"D6+1","twin","48\""],
  ["Sky Ray Gunship","Smart missile system","T","3",4,5,0,"1","indirect","30\""],
  ["Sky Ray Gunship","Twin pulse carbine","T","2",4,5,0,"1","twin assault","20\""],
  ["Sky Ray Gunship","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["Stealth Battlesuits","Burst cannon","T","4",4,5,0,"1","","18\""],
  ["Stealth Battlesuits","Fusion blaster","T","1",4,9,4,"D6","melta:2","12\""],
  ["Stealth Battlesuits","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Stealth Battlesuits","Pulse pistol","T","1",4,5,0,"1","pistol","12\""],
  ["Stealth Battlesuits","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Stealth Battlesuits","Battlesuit fists","C","2",5,4,0,"1","","càc"],
  ["Stormsurge","Cluster rocket system","T","4D6",4,5,0,"1","blast heavy","48\""],
  ["Stormsurge","Destroyer missiles","T","1",4,16,4,"D6+2","heavy","72\""],
  ["Stormsurge","Pulse Driver Cannon","T","D6+3",4,12,3,"3","blast heavy","72\""],
  ["Stormsurge","Twin T'au flamer","T","D6",0,4,0,"1","ignorescover torrent twin","12\""],
  ["Stormsurge","Twin airbursting fragmentation projector","T","D6",4,3,0,"1","blast heavy indirect twin","24\""],
  ["Stormsurge","Twin burst cannon","T","4",4,5,0,"1","heavy twin","18\""],
  ["Stormsurge","Twin smart missile system","T","3",4,5,0,"1","heavy indirect twin","30\""],
  ["Stormsurge","➤ Pulse blast cannon - dispersed","T","6",4,10,2,"4","heavy","48\""],
  ["Stormsurge","➤ Pulse blast cannon - focused","T","2",4,24,6,"12","heavy","24\""],
  ["Stormsurge","Thunderous footfalls","C","3",5,8,1,"2","","càc"],
  ["Strike Team","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Strike Team","Pulse carbine","T","2",4,5,0,"1","","20\""],
  ["Strike Team","Pulse pistol","T","1",4,5,0,"1","pistol","12\""],
  ["Strike Team","Pulse rifle","T","1",4,5,0,"1","rf:1","30\""],
  ["Strike Team","Support turret","T","2",5,5,0,"1","indirect twin","30\""],
  ["Strike Team","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["Strike Team","Close combat weapon","C","1",5,3,0,"1","","càc"],
  ["Sun Shark Bomber","Missile pod","T","2",4,7,1,"2","","30\""],
  ["Sun Shark Bomber","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Sun Shark Bomber","Twin missile pod","T","2",4,7,1,"2","twin","30\""],
  ["Sun Shark Bomber","➤ Twin ion rifle - overcharged","T","3",4,8,2,"2","hazardous twin","30\""],
  ["Sun Shark Bomber","➤ Twin ion rifle - standard","T","3",4,7,1,"1","twin","30\""],
  ["Sun Shark Bomber","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["TX42 Piranha","Fusion blaster","T","1",4,9,4,"D6","melta:2","12\""],
  ["TX42 Piranha","Missile pod","T","2",4,7,1,"2","","30\""],
  ["TX42 Piranha","Plasma rifle","T","1",4,8,3,"3","","18\""],
  ["TX42 Piranha","Rail rifle","T","1",4,10,4,"3","dev","30\""],
  ["TX42 Piranha","Armoured hull","C","2",5,4,0,"1","","càc"],
  ["Ta'unar Supremacy Armour","Burst cannon","T","4",4,5,0,"1","","18\""],
  ["Ta'unar Supremacy Armour","Fragmentation cluster shell launcher","T","2D6+6",4,6,1,"1","blast","24\""],
  ["Ta'unar Supremacy Armour","Fusion eradicator","T","5",4,10,4,"D6","melta:3","24\""],
  ["Ta'unar Supremacy Armour","Heavy rail cannon array","T","2",4,26,5,"16","dev heavy","120\""],
  ["Ta'unar Supremacy Armour","Nexus missile launcher","T","8",4,8,3,"2","","36\""],
  ["Ta'unar Supremacy Armour","Pulse ordnance driver","T","8",4,5,1,"3","anti:2:inf","60\""],
  ["Ta'unar Supremacy Armour","Smart missile system","T","3",4,5,0,"1","indirect","30\""],
  ["Ta'unar Supremacy Armour","➤ Tri-axis ion cannon - standard","T","D6+3",4,8,2,"2","blast","36\""],
  ["Ta'unar Supremacy Armour","➤ Tri-axis ion cannon - supercharge","T","D6+3",4,9,3,"3","blast hazardous","36\""],
  ["Ta'unar Supremacy Armour","Crushing feet","C","6",5,8,1,"2","","càc"],
  ["Tetras","Pulse rifle","T","1",4,5,0,"1","rf:1","30\""],
  ["Tetras","Close combat weapons","C","2",5,3,0,"1","","càc"],
  ["The Twin Lance","Fusion eliminator (tir)","T","2",2,10,4,"D6","melta:2","18\""],
  ["The Twin Lance","Shardstorm burst system","T","D6",2,5,0,"1","pistol","18\""],
  ["The Twin Lance","Twin pulse blaster","T","2",5,6,1,"1","assault twin","10\""],
  ["The Twin Lance","XV pulse pistol (tir)","T","2",2,6,1,"2","rf:2","12\""],
  ["The Twin Lance","➤ Ion scattercannon - overcharge","T","4",2,8,3,"3","hazardous rf:2","18\""],
  ["The Twin Lance","➤ Ion scattercannon - standard","T","4",2,7,2,"2","rf:2","18\""],
  ["The Twin Lance","Fusion eliminator (càc)","C","1",4,10,4,"D6+2","extra","càc"],
  ["The Twin Lance","Ion scattercannon","C","3",4,7,2,"2","extra","càc"],
  ["The Twin Lance","XV pulse pistol (càc)","C","4",3,6,1,"2","","càc"],
  ["Tidewall Droneport","Drone defenders","T","8",5,5,0,"1","assault twin","20\""],
  ["Tidewall Gunrig","Supremacy railgun","T","1",5,20,5,"D6+6","dev twin","72\""],
  ["Tiger Shark","Burst cannon","T","4",4,5,0,"1","","18\""],
  ["Tiger Shark","Missile pod","T","2",4,7,1,"2","","30\""],
  ["Tiger Shark","Seeker missile","T","1",4,14,3,"D6+1","oneshot","48\""],
  ["Tiger Shark","Skyspear missile rack","T","D6+1",4,6,1,"1","anti:3:vol blast","72\""],
  ["Tiger Shark","Swiftstrike burst cannon","T","16",4,6,1,"1","","36\""],
  ["Tiger Shark","Swiftstrike railgun","T","1",4,20,5,"D6+6","dev","72\""],
  ["Tiger Shark","➤ Cyclic ion blaster - overcharge","T","3",4,8,2,"2","hazardous","18\""],
  ["Tiger Shark","➤ Cyclic ion blaster - standard","T","3",4,7,1,"1","","18\""],
  ["Tiger Shark","➤ Ion cannon - overcharge","T","D6+3",4,8,2,"3","blast hazardous","60\""],
  ["Tiger Shark","➤ Ion cannon - standard","T","D6+3",4,7,1,"2","blast","60\""],
  ["Tiger Shark","Armoured hull","C","3",5,6,0,"1","","càc"],
  ["Vespid Stingwings","Neutron blaster","T","2",4,5,2,"2","assault","18\""],
  ["Vespid Stingwings","Neutron grenade launcher","T","D6",4,4,1,"2","anti:3:inf blast","18\""],
  ["Vespid Stingwings","Neutron rail rifle","T","1",4,10,4,"3","dev","30\""],
  ["Vespid Stingwings","T'au flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Vespid Stingwings","Stingwing claws","C","1",4,4,1,"1","","càc"],
  ["XV9 Hazard Battlesuits","Fusion cascade","T","1",4,9,4,"D6","melta:4","12\""],
  ["XV9 Hazard Battlesuits","Missile pod","T","2",5,7,1,"2","","30\""],
  ["XV9 Hazard Battlesuits","Phased ion gun","T","4",4,6,1,"1","","30\""],
  ["XV9 Hazard Battlesuits","Twin hazard burst cannon","T","4",4,5,0,"1","twin","24\""],
  ["XV9 Hazard Battlesuits","Twin pulse carbine","T","2",5,5,0,"1","assault twin","20\""],
  ["XV9 Hazard Battlesuits","Battlesuit fists","C","3",5,5,0,"1","","càc"],
  ["Y'vahra Battlesuit","Flechette pod","T","5",4,3,0,"1","","12\""],
  ["Y'vahra Battlesuit","Missile pod","T","2",5,7,1,"2","","30\""],
  ["Y'vahra Battlesuit","Phased plasma-flamer","T","10",0,6,1,"1","ignorescover torrent","12\""],
  ["Y'vahra Battlesuit","➤ Ionic discharge cannon - overcharge","T","D6+1",4,8,2,"3","blast hazardous","18\""],
  ["Y'vahra Battlesuit","➤ Ionic discharge cannon - standard","T","D6+1",4,7,1,"2","blast","18\""],
  ["Y'vahra Battlesuit","Battlesuit fists","C","6",5,6,0,"2","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["AX-1-0 Tiger Shark","Véhicule"],
  ["Aun'shi","Epic Hero"],
  ["Aun'va","Epic Hero"],
  ["Barracuda","Véhicule"],
  ["Breacher Team","Battleline"],
  ["Broadside Battlesuits","Véhicule"],
  ["Cadre Fireblade","Personnage"],
  ["Commander Farsight","Epic Hero"],
  ["Commander Shadowsun","Epic Hero"],
  ["Commander in Coldstar Battlesuit","Personnage"],
  ["Commander in Crisis Battlesuit","Personnage"],
  ["Commander in Enforcer Battlesuit","Personnage"],
  ["Crisis Battlesuits","Véhicule"],
  ["Crisis Fireknife Battlesuits","Véhicule"],
  ["Crisis Starscythe Battlesuits","Véhicule"],
  ["Crisis Sunforge Battlesuits","Véhicule"],
  ["Darkstrider","Epic Hero"],
  ["Devilfish","Véhicule"],
  ["Drone Sentry Turret","Fortification"],
  ["Ethereal","Personnage"],
  ["Firesight Team","Personnage"],
  ["Ghostkeel Battlesuit","Véhicule"],
  ["Great Knarloc","Monstre"],
  ["Hammerhead Gunship","Véhicule"],
  ["Heavy Gun Drones","Véhicule"],
  ["Knarloc Riders","Monté"],
  ["Kroot Carnivores","Infanterie"],
  ["Kroot Farstalkers","Infanterie"],
  ["Kroot Flesh Shaper","Personnage"],
  ["Kroot Hounds","Bête"],
  ["Kroot Lone-spear","Personnage"],
  ["Kroot Trail Shaper","Personnage"],
  ["Kroot War Shaper","Personnage"],
  ["Krootox Rampagers","Monté"],
  ["Krootox Riders","Monté"],
  ["Longstrike","Epic Hero"],
  ["Manta","Véhicule"],
  ["Orca Dropship","Véhicule"],
  ["Pathfinder Team","Infanterie"],
  ["Piranhas","Véhicule"],
  ["R'varna Battlesuit","Véhicule"],
  ["Razorshark Strike Fighter","Véhicule"],
  ["Remora Stealth Drones","Véhicule"],
  ["Remote Sensor Tower","Fortification"],
  ["Riptide Battlesuit","Véhicule"],
  ["Shas'o R'alai","Epic Hero"],
  ["Sky Ray Gunship","Véhicule"],
  ["Stealth Battlesuits","Infanterie"],
  ["Stormsurge","Véhicule"],
  ["Strike Team","Battleline"],
  ["Sun Shark Bomber","Véhicule"],
  ["TX42 Piranha","Véhicule"],
  ["Ta'unar Supremacy Armour","Véhicule"],
  ["Tetras","Véhicule"],
  ["The Twin Lance","Epic Hero"],
  ["Tidewall Droneport","Fortification"],
  ["Tidewall Gunrig","Fortification"],
  ["Tidewall Shieldline","Fortification"],
  ["Tiger Shark","Véhicule"],
  ["Vespid Stingwings","Infanterie"],
  ["XV9 Hazard Battlesuits","Véhicule"],
  ["Y'vahra Battlesuit","Véhicule"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Aun'shi": [
  "Breacher Team",
  "Kroot Carnivores",
  "Kroot Farstalkers",
  "Strike Team"
 ],
 "Cadre Fireblade": [
  "Breacher Team",
  "Strike Team"
 ],
 "Commander Farsight": [
  "Crisis Battlesuits",
  "Crisis Fireknife Battlesuits",
  "Crisis Starscythe Battlesuits",
  "Crisis Sunforge Battlesuits"
 ],
 "Commander in Coldstar Battlesuit": [
  "Crisis Battlesuits",
  "Crisis Fireknife Battlesuits",
  "Crisis Starscythe Battlesuits",
  "Crisis Sunforge Battlesuits"
 ],
 "Commander in Crisis Battlesuit": [
  "Crisis Battlesuits",
  "Crisis Fireknife Battlesuits",
  "Crisis Starscythe Battlesuits",
  "Crisis Sunforge Battlesuits"
 ],
 "Commander in Enforcer Battlesuit": [
  "Crisis Battlesuits",
  "Crisis Fireknife Battlesuits",
  "Crisis Starscythe Battlesuits",
  "Crisis Sunforge Battlesuits"
 ],
 "Darkstrider": [
  "Pathfinder Team"
 ],
 "Ethereal": [
  "Breacher Team",
  "Strike Team"
 ],
 "Kroot Flesh Shaper": [
  "Kroot Carnivores",
  "Kroot Farstalkers"
 ],
 "Kroot Trail Shaper": [
  "Kroot Carnivores",
  "Kroot Farstalkers"
 ],
 "Kroot War Shaper": [
  "Kroot Carnivores",
  "Kroot Farstalkers"
 ],
 "Shas'o R'alai": [
  "XV9 Hazard Battlesuits"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Commander Shadowsun": [
  [
   "Agile Combatant",
   "This model is eligible to shoot in a turn in which it Fell Back."
  ],
  [
   "Hero of the Empire (Aura)",
   "While a friendly T’au Empire unit is within 6\" of this model, each time a model in that unit makes a ranged attack, re-roll a Hit roll of 1."
  ],
  [
   "Advanced Guardian Drone",
   "Each time a ranged attack targets the bearer, subtract 1 from the Wound roll."
  ],
  [
   "Command-link Drone (Aura)",
   "While a friendly T’au Empire unit is within 6\" of the bearer, each time you select that unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Supreme Commander",
   "If this model is in your army, it must be your Warlord."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Commander Farsight": [
  [
   "Way of the Short Blade",
   "While this model is leading a unit, each time a model in that unit makes an attack that targets an enemy unit within 9\", add 1 to the Wound roll."
  ],
  [
   "Puretide's Teachings",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CRISIS BATTLESUITS\n- CRISIS FIREKNIFE BATTLESUITS\n- CRISIS STARSCYTHE BATTLESUITS\n- CRISIS SUNFORGE BATTLESUITS"
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Commander in Crisis Battlesuit": [
  [
   "Crisis Commander",
   "While this model is leading a unit, each time a model in that unit makes a ranged attack, re-roll a Hit roll of 1."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CRISIS BATTLESUITS\n- CRISIS FIREKNIFE BATTLESUITS\n- CRISIS STARSCYTHE BATTLESUITS\n- CRISIS SUNFORGE BATTLESUITS"
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "Battlesuit Support System",
   "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks."
  ],
  [
   "Shield Generator",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Commander in Enforcer Battlesuit": [
  [
   "Enforcer Commander",
   "While this model is leading a unit, each time a ranged attack targets that unit, worsen the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CRISIS BATTLESUITS\n- CRISIS FIREKNIFE BATTLESUITS\n- CRISIS STARSCYTHE BATTLESUITS\n- CRISIS SUNFORGE BATTLESUITS"
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "Battlesuit Support System",
   "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks."
  ],
  [
   "Shield Generator",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Commander in Coldstar Battlesuit": [
  [
   "Leader",
   "This model can be attached to the following units:\n- CRISIS BATTLESUITS\n- CRISIS FIREKNIFE BATTLESUITS\n- CRISIS STARSCYTHE BATTLESUITS\n- CRISIS SUNFORGE BATTLESUITS"
  ],
  [
   "Coldstar Commander",
   "While this model is leading a unit, models in that unit have a Move characteristic of 12\" and ranged weapons equipped by models in that unit have the [ASSAULT] ability."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "Battlesuit Support System",
   "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks."
  ],
  [
   "Shield Generator",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Cadre Fireblade": [
  [
   "Volley Fire",
   "While this model is leading a unit, add 1 to the Attacks characteristic of ranged weapons equipped by models in that unit."
  ],
  [
   "Crack Shot",
   "Each time this model makes a ranged attack, on a Critical Wound, that attack has an Armour Penetration characteristic of -3."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Breacher Team\n- Strike Team"
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Ethereal": [
  [
   "Coordinated Leadership",
   "In your Command phase, roll one D6: on a 4+, you gain 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Breacher Team\n- Strike Team"
  ],
  [
   "Failure Is Not an Option",
   "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability."
  ],
  [
   "Hover Drone",
   "The bearer can Fly and has a Move characteristic of 10\"."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Aun'va": [
  [
   "Duality Shield",
   "Once per battle, each time an attack targets this unit, it can use this ability. If it does, until the end of the phase, models in this unit have a 2+ invulnerable save."
  ],
  [
   "Paradox of Duality",
   "Each time an attack targets this unit, subtract 1 from the Hit roll and subtract 1 from the Wound roll."
  ],
  [
   "Supreme Loyalty (Aura)",
   "While a friendly T’AU EMPIRE unit is within 6\" of this unit, each time that unit takes a Battle-shock or Leadership test, add 1 to that test."
  ]
 ],
 "Aun'shi": [
  [
   "Inspirational Defiance",
   "While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- BREACHER TEAM\n- KROOT CARNIVORES\n- KROOT FARSTALKERS\n- STRIKE TEAM"
  ],
  [
   "Martial Warrior",
   "Each time this model is selected to fight, select one of the following abilities to be active while resolving those attacks:\n- Direct Grace: Fidelity has the [PRECISION] ability.\n- Forceful Strike: Fidelity has the [DEVASTATING WOUNDS] ability.\n- Whirling Stance: Fidelity has the [SUSTAINED HITS 2] ability instead of [SUSTAINED HITS 1]."
  ]
 ],
 "Darkstrider": [
  [
   "Structural Analyser",
   "While this model is leading a unit, each time a model in that unit makes a ranged attack, add 1 to the Wound roll."
  ],
  [
   "Jammer Array",
   "Enemy units that are set up on the battlefield from Reserves cannot be set up within 12\" of this model."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Pathfinder Team"
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Longstrike": [
  [
   "XV02 Pilot Battlesuit",
   "In your Command phase, you can select one friendly HAMMERHEAD GUNSHIP unit within 12\". Until the start of your next Command phase, ranged weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Armour Hunter",
   "Each time this model makes an attack that targets a MONSTER or VEHICLE, add 1 to the Hit roll."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Targeting Array",
   "Each time this model is selected to shoot, you can re-roll one Hit roll or you can re-roll one Wound roll when resolving those attacks."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Strike Team": [
  [
   "Suppression Volley",
   "In your Shooting phase, after this unit has shot, select one enemy INFANTRY unit hit by one or more of those attacks. Until the start of your next turn, while unit is on the battlefield, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "DS8 Support Turret",
   "In your Movement phase, if this unit Remains Stationary, until the start of your next turn, its Shas’ui model is equipped with the support turret weapon.\n\nDesigner’s Note: Place a Support Turret token next to this unit to remind you."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Breacher Team": [
  [
   "Breach and Clear",
   "Each time a model in this unit makes a ranged attack that targets an enemy unit within range of an objective marker, you can re-roll the Wound roll."
  ],
  [
   "DS8 Support Turret",
   "In your Movement phase, if this unit Remains Stationary, until the start of your next turn, its Shas’ui model is equipped with the support turret weapon.\n\nDesigner’s Note: Place a Support Turret token next to this unit to remind you."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Kroot Carnivores": [
  [
   "Fieldcraft",
   "At the end of the your Command phase, if this unit within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn."
  ],
  [
   "Bodyguard",
   "If this unit has a Starting Strength of 20, you can attach up to two Leader units to it instead of one, provided those Leaders are not duplicates (e.g. you cannot attach two WAR SHAPERS to this unit). If you do, and this unit is destroyed, the Leader units attached to it become separate units with their original Starting Strengths."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Krootox Riders": [
  [
   "Kroot Packmates",
   "Once per turn, in your opponent's Shooting phase, when a friendly KROOT INFANTRY unit within 6\" of this unit is selected as the target of an attack, one unit from your army with this ability can use it. If it does, after that enemy unit has finished making its attacks, that unit with this ability can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit (and only if it is an eligible target)."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Crisis Battlesuits": [
  [
   "Turbo-jets",
   "Each time this unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in this unit."
  ],
  [
   "Crisis Bodyguard",
   "If a Character unit from your army with the Leader ability can be attached to a Crisis Fireknife Battlesuit unit, it can be attached to this unit instead."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Battlesuit Support System",
   "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks."
  ],
  [
   "Shield Generator",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Stealth Battlesuits": [
  [
   "Forward Observers",
   "Each time this unit is an Observer unit, until the end of the phase, each time a ranged attack is made by a model in a Guided unit that targets their Spotted unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1."
  ],
  [
   "Localised Stealth Projectors (Aura)",
   "When a friendly KROOT/VESPID STINGWINGS unit within 6\" of this unit has shot, those attacks do not prevent that unit from being hidden."
  ],
  [
   "Unmasking Suite",
   "GHOSTKEEL BATTLESUIT/PATHFINDER TEAM/STEALTH BATTLESUITS unit only. When this unit is selected to shoot, you can select one enemy unit within 24\" of this unit. That enemy unit has +9\" detection range until this unit has shot."
  ],
  [
   "Negation Emitters",
   "STEALTH BATTLESUITS unit only. This unit has -3\" detection range."
  ],
  [
   "Homing Beacon",
   "Once per battle, you can use the Rapid Ingress Stratagem for 0CP. The target must be set up within 3\" of the bearer’s unit and more than 8\" away from all enemy units.\nDesigner’s Note: *Place a Homing Beacon token next to this unit, removing it once this ability is used.*"
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Ghostkeel Battlesuit": [
  [
   "Stealth Drones",
   "Twice per battle, after an attack has been allocated to this model, you can change the Damage characteristic of that attack to 0.\n\nDesigner’s Note: Place two Stealth Drone tokens next to the unit, removing one each time this ability has been used."
  ],
  [
   "Battlesuit Support System",
   "The bearer is eligible to shoot in a turn in which it Fell Back but it loses the Smoke keyword."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Localised Stealth Projectors (Aura)",
   "When a friendly KROOT/VESPID STINGWINGS unit within 6\" of this unit has shot, those attacks do not prevent that unit from being hidden."
  ],
  [
   "Unmasking Suite",
   "GHOSTKEEL BATTLESUIT/PATHFINDER TEAM/STEALTH BATTLESUITS unit only. When this unit is selected to shoot, you can select one enemy unit within 24\" of this unit. That enemy unit has +9\" detection range until this unit has shot."
  ],
  [
   "Negation Emitters",
   "STEALTH BATTLESUITS unit only. This unit has -3\" detection range."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Firesight Team": [
  [
   "Precise Targeting",
   "Each time a model in this unit makes an attack that targets a Spotted unit, you can re-roll the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Pathfinder Team": [
  [
   "Target Uploaded",
   "Each time a model in this unit makes an attack that targets their Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and that attack has the [IGNORES COVER] ability."
  ],
  [
   "Grav-inhibitor Drone",
   "Each time an enemy unit selects the bearer's unit as the target of a charge, subtract 2 from the Charge roll (this is not cumulative with any other negative modifiers to that Charge roll)."
  ],
  [
   "Pulse Accelerator Drone",
   "Add 6\" to the Range characteristic of pulse carbines equipped by models in the bearer’s unit."
  ],
  [
   "Recon Drone",
   "The bearer is equipped with 1 drone burst cannon and the bearer’s unit has the Infiltrators ability."
  ],
  [
   "Unmasking Suite",
   "GHOSTKEEL BATTLESUIT/PATHFINDER TEAM/STEALTH BATTLESUITS unit only. When this unit is selected to shoot, you can select one enemy unit within 24\" of this unit. That enemy unit has +9\" detection range until this unit has shot."
  ],
  [
   "Negation Emitters",
   "STEALTH BATTLESUITS unit only. This unit has -3\" detection range."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Piranhas": [
  [
   "Drone Harassment Tactics",
   "At the end of your Movement phase, select one enemy unit within 12\" of this unit; that enemy unit must take a Battle-shock test."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Vespid Stingwings": [
  [
   "Airborne Agility",
   "At the end of your opponent’s turn, if this unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Oversight Drone",
   "Once per battle, when the bearer’s unit is selected to shoot, until the end of the phase, ranged weapons equipped by models in this unit have the [IGNORES COVER] ability.\n\nDesigner’s Note: Place an Oversight Drone token next to the bearer, removing it once this ability has been used."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Kroot Hounds": [
  [
   "Loping Pounce",
   "At the start of your Command phase, if this unit is within 6\" of one or more friendly KROOT INFANTRY units, then until the end of the turn, this unit is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Hunting Hounds",
   "While this unit is within 12\" of one or more friendly KROOT CHARACTER models, the Objective Control characteristic of models in this unit is 1."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Broadside Battlesuits": [
  [
   "Advanced Armour",
   "Models in this unit have the Feel No Pain 4+ ability against mortal wounds."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Riptide Battlesuit": [
  [
   "Nova Charge",
   "Once per battle, when this unit is selected to shoot in your Shooting phase, select one ranged weapon equipped by this model. Until the end of the phase, that weapon has the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Battlesuit Support System",
   "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Hammerhead Gunship": [
  [
   "Armour Hunter",
   "Each time this model makes an attack that targets a MONSTER or VEHICLE, add 1 to the Hit roll."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Targeting Array",
   "Each time this model is selected to shoot, you can re-roll one Hit roll or you can re-roll one Wound roll when resolving those attacks."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Sky Ray Gunship": [
  [
   "Velocity Tracker",
   "Each time this model makes an attack with a ranged weapon that targets a unit that can FLY, you can re-roll the Hit roll."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Targeting Array",
   "Each time this model is selected to shoot, you can re-roll one Hit roll or you can re-roll one Wound roll when resolving those attacks."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Devilfish": [
  [
   "Rapid Deployment",
   "Units can disembark from this TRANSPORT after it has Advanced. Units that do so count as having made a Normal move that phase, and cannot declare a charge in the same turn, but can otherwise act normally in the remainder of the turn."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Razorshark Strike Fighter": [
  [
   "Ground Strike Fighter",
   "Each time this model makes a ranged attack that targets an enemy unit that cannot FLY, add 1 to the Hit roll."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Sun Shark Bomber": [
  [
   "Pulse Bombs",
   "At the end of your opponent’s Fight phase, select one visible enemy unit (excluding Lone Operative units) within 24\" of this unit, and roll six D6 for that unit: For each 4+, that unit suffers 1 mortal wound."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Tidewall Shieldline": [
  [
   "Tidewall Defence Platform",
   "If equipped with a Tidewall defence platform, this FORTIFICATION has a Wounds characteristic of 15."
  ],
  [
   "Tidewall Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."
  ]
 ],
 "Tidewall Droneport": [
  [
   "Droneport",
   "Each time this FORTIFICATION is selected to shoot, its drone defenders weapon will target and resolve attacks against every enemy unit that is an eligible target to this FORTIFICATION."
  ],
  [
   "Tidewall Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."
  ]
 ],
 "Tidewall Gunrig": [
  [
   "Tidewall Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."
  ]
 ],
 "Stormsurge": [
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this models Objective Control characteristic, and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Heavy Walker",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move over models (excluding TITANIC models) and terrain features that are 4\" or less in height as if they were not there."
  ],
  [
   "Support System",
   "Each time this model makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "Titan-killer",
   "Each time this model makes a ranged attack that targets a TITANIC or TOWERING unit, you can re-roll the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Kroot Farstalkers": [
  [
   "Bounty Hunters",
   "At the start of the battle, select one unit from your opponent’s army. Each time a model in this unit makes an attack that targets that unit, that attack has the [LETHAL HITS] and [PRECISION] abilities."
  ],
  [
   "Pech'ra",
   "Ranged weapons equipped by the bearer’s unit have the [IGNORES COVER] ability."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "R'varna Battlesuit": [
  [
   "Nova Shielding",
   "Once per battle, when this model is selected as the target of a ranged attack, it can use this ability. If it does, until the end of the phase, each time an attack targets this model, if the Strength characteristic of that attack is greater than the Toughness characteristic of this model, subtract 1 from the Wound roll."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "Battlesuit Support System",
   "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Y'vahra Battlesuit": [
  [
   "Nova Burst",
   "Once per battle, before this model makes a Normal, Advance or Fall Back move, it can use this ability. If it does, until the end of the phase, it has a Move characteristic of 18\"."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "Battlesuit Support System",
   "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Tetras": [
  [
   "High-intensity Markerlights",
   "Each time this unit is an Observer unit, until the end of the phase, each time a model in its Guided unit makes an attack that targets their Spotted unit, you can re-roll the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Remora Stealth Drones": [
  [
   "Aerial Disengagement",
   "In your opponent's Movement phase, when an enemy unit ends a Normal, Advance or Fall Back move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\"."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Ta'unar Supremacy Armour": [
  [
   "Coordinated Strike",
   "While this model is a Guided unit, each time it makes an attack that targets its Spotted unit, re-roll a Hit roll of 1."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Barracuda": [
  [
   "Agile Dogfighter",
   "Each time an attack targets this model, subtract 1 from the Hit roll."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Tiger Shark": [
  [
   "Strafing Run",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks that cannot FLY. That enemy unit must take a Battle-shock test."
  ],
  [
   "Transport bay",
   "The bearer has the TRANSPORT keyword and has a transport capacity of 12 TACTICAL DRONES models."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "AX-1-0 Tiger Shark": [
  [
   "Titan Hunter",
   "This model’s twin heavy rail cannon and seeker missiles have the [ANTI-TITANIC 3+] ability while targeting a unit within half range."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Manta": [
  [
   "Aggressive Deployment",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly model that disembarked from this TRANSPORT this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ],
  [
   "Air Caste Colossus",
   "Each time you target this model with a Stratagem, you must spend three times that Stratagem’s stated CP cost to do so."
  ],
  [
   "Damaged: 1-20 Wounds Remaining",
   "While this model has 1-20 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Orca Dropship": [
  [
   "Jet Pack Insertion",
   "At the end of your opponent’s Movement phase, one or more units embarked within this TRANSPORT can disembark from it, provided every model in each of those disembarking units has the Deep Strike ability."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Heavy Gun Drones": [
  [
   "Drone Escort",
   "Once per turn, in your opponent’s Shooting phase, when a friendly T'AU EMPIRE unit within 6\" of this unit is selected as the target of an attack, one unit from your army with this ability can use it. If it does, after that enemy unit has finished making its attacks, the unit using this ability can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit (and only if it is an eligible target)."
  ]
 ],
 "Great Knarloc": [
  [
   "Loping Stride",
   "Each time this model Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of this model."
  ],
  [
   "Baggage Harness (Aura)",
   "While a friendly KROOT unit is within 3\" of the bearer, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "TX42 Piranha": [
  [
   "Outflank",
   "When this unit arrives from Strategic Reserves, it can be set up within your opponent’s deployment zone (all other restrictions still apply)."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Knarloc Riders": [
  [
   "Thunderous Pounce",
   "Each time this unit ends a Charge move, until the end of the turn, Knarloc beak and talons equipped by models in this unit have the [LANCE] ability."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Shas'o R'alai": [
  [
   "Eclipse Field Generator",
   "While this model is leading a unit, models in that unit have a 5+ invulnerable save."
  ],
  [
   "Assassin",
   "Each time this model makes an attack that targets a Character unit, you can re-roll the Hit roll."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- XV9 Hazard Battlesuits"
  ],
  [
   "Blacklight Marker Drones",
   "Twice per battle, when this unit is an Observer unit, until the end of the phase, each time a ranged attack is made by a model in their Guided unit that targets their Spotted unit, re-roll a Wound roll of 1.\nDesigner’s Note: *Place two Blacklight Marker Drone tokens next to this model, removing one each time this ability has been used.*"
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "XV9 Hazard Battlesuits": [
  [
   "Photon Casters",
   "In your Shooting phase, after this unit has shot, if an enemy Infantry unit was hit by one or more of those attacks, until the end of your opponent’s next turn, that enemy unit is stunned. While a unit is stunned, subtract 2 from that unit’s Move characteristic, and subtract 2 from Advance and Charge rolls made for that unit."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "Battlesuit Support System",
   "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks."
  ],
  [
   "Shield Generator",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Weapon Support System",
   "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Remote Sensor Tower": [
  [
   "Orbital Comms Array (Aura)",
   "While a friendly T'AU EMPIRE unit is within 6\" of this FORTIFICATION, each time you target that unit with a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Reinforced Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."
  ]
 ],
 "Drone Sentry Turret": [
  [
   "Reinforced Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."
  ],
  [
   "Sentinel Protocols",
   "Each time you select this FORTIFICATION for the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+ when resolving that Stratagem."
  ]
 ],
 "Crisis Sunforge Battlesuits": [
  [
   "Sunforge",
   "Each time a model in this unit makes a ranged attack that targets a MONSTER or VEHICLE unit, you can re-roll the Wound roll and you can re-roll the Damage roll."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Crisis Fireknife Battlesuits": [
  [
   "Fireknife",
   "Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1. If that attack targets a unit that is at its Starting Strength, you can re-roll the Hit roll instead."
  ],
  [
   "Weapon Support System",
   "Each time a model in this unit makes a ranged attack, you can ignore any or all modifiers to the Hit roll."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Crisis Starscythe Battlesuits": [
  [
   "Starscythe",
   "Each time a model in this unit makes a ranged attack (excluding attacks that target MONSTERS and VEHICLES), improve the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Battlesuit Support System",
   "The unit is eligible to shoot in a turn in which it Fell Back."
  ],
  [
   "Marker Drone",
   "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn."
  ],
  [
   "Shield Drone",
   "Add 1 to the bearer’s Wounds characteristic."
  ],
  [
   "Guardian Drone",
   "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ],
 "Kroot Trail Shaper": [
  [
   "Kroot Ambush",
   "After both players have deployed their armies, you can redeploy this model’s unit and one other friendly KROOT unit. When doing so, any of those units can be placed into Strategic Reserves, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Trail Finding",
   "In your opponent’s Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6\"."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Kroot Carnivores\n- Kroot Farstalkers"
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Kroot War Shaper": [
  [
   "Root of Honour",
   "Once per battle, at the start of any phase, you can select one friendly KROOT unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Kroot Carnivores\n- Kroot Farstalkers"
  ],
  [
   "War Leader",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Kroot Flesh Shaper": [
  [
   "Leader",
   "This model can be attached to the following units:\n- Kroot Carnivores\n- Kroot Farstalkers"
  ],
  [
   "Rites of Feasting",
   "While this model is leading a unit, models in that unit have the Feel Not Pain 6+ ability. If that unit destroys one or more enemy units in the Fight phase, until the end of the battle, models in that unit have the Feel No Pain 5+ ability instead."
  ],
  [
   "Ritual Butchery",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Kroot Lone-spear": [
  [
   "Fire and Fade",
   "In your Shooting phase, after this model has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\". If it does, until the end of the turn, this model is not eligible to declare a charge."
  ],
  [
   "Advanced Scouting",
   "Each time this model makes a ranged attack that hits an enemy unit, until the end of the turn, each time another KROOT model from your army makes an attack that targets that enemy unit, you can re-roll the Hit roll."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "Krootox Rampagers": [
  [
   "Kroot Linebreakers",
   "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it, then roll one D6 for each model in this unit that is within Engagement Range of that enemy unit: for each 4+, that enemy unit suffers D3 mortal wounds. If one or more enemy models are destroyed as a result of these mortal wounds, that enemy unit must take a Battle-shock test."
  ],
  [
   "Harnessed Alien Instincts",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked:\n- While a unit is prey-marked, that unit has +3\" detection range."
  ]
 ],
 "The Twin Lance": [
  [
   "Neocapacitor Shields",
   "At the start of your opponent’s Charge phase, you can select one visible enemy unit (excluding MONSTER and VEHICLE units) within 12\" of this unit. That unit must take a Battle-shock test and, until the end of the turn, subtract 1 from Charge rolls made for that unit."
  ],
  [
   "Exemplars of Mont’ka",
   "Each time a model in this unit makes a ranged attack that targets the closest eligible target, that attack has the [SUSTAINED HITS 1] and [IGNORES COVER] abilities."
  ],
  [
   "Retro-thrusters",
   "At the end of the Fight phase, if this unit was eligible to fight this phase, this unit can either make a Normal move of up to 6\" or a Fall Back move."
  ],
  [
   "MV15 Gun Drone",
   "The bearer is equipped with 1 twin pulse blaster."
  ],
  [
   "For The Greater Good",
   "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Advanced Acquisition Cadre",1,"","Expert Fieldcraft","In your Shooting phase, when a friendly PATHFINDER TEAM/STEALTH BATTLESUITS unit is selected to shoot, those ranged attacks do not prevent your unit from being hidden.","",0,"","Reconnaissance"],
  ["Auxiliary Cadre",1,"Auxiliary","Integrated Command Structure","Friendly KROOT/VESPID STINGWINGS units have the following ability: Harnessed Alien Instincts: In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked: ▪ While a unit is prey-marked, that unit has +3\" detection range Friendly GHOSTKEEL BATTLESUIT/STEALTH BATTLESUITS units have the following ability: Localised Stealth Projectors (Aura): When a friendly KROOT/VESPID STINGWINGS unit within 6\" of this unit has shot, those attacks do not prevent that unit from being hidden. This detachment has the AUXILIARIES tag and cannot be taken with another AUXILIARIES detachment.","",0,"","Disruption"],
  ["Experimental Prototype Cadre",1,"Battlesuit","Superior Craftsmanship","Friendly BATTLESUIT CHARACTER units’ ranged attacks have +6\" R. This detachment has the BATTLESUIT tag and cannot be taken with another BATTLESUIT detachment.","",0,"","Priority Assets"],
  ["Kauyon",2,"","Patient Hunter","During the third, fourth and fifth battle rounds, ranged weapons equipped by T’au Empire models from your army have the [SUSTAINED HITS 1] ability. During the third, fourth and fifth battle rounds, while a unit is a Guided unit (see For the Greater Good), each time a ranged attack is made by a model in that unit that targets a Spotted unit, you can ignore any or all modifiers to that attack’s Ballistic skill characteristics and/or all modifiers to the Hit roll.","",0,"","Reconnaissance"],
  ["Kroot Hunting Pack",2,"Auxiliary","Hunter’s Instincts / Skirmish Fighters / KEYWORDS","Each time a Kroot model from your army makes an attack, add 1 to the Hit roll if the target of that attack is below its Starting Strength, and add 1 to the Wound roll as well if the target of that attack is Below Half-strength. Kroot models from your army have a 6+ invulnerable save against melee attacks and a 5+ invulnerable save against ranged attacks. If you select this Detachment, Kroot Carnivore units from your army have the Battleline keyword.","",0,"","Take and Hold"],
  ["Mont’ka",3,"","Killing Blow","During the first, second and third battle rounds, ranged weapons equipped by T’AU EMPIRE models from your army have the [ASSAULT] ability. During the first, second and third battle rounds, while a unit is a Guided unit, its ranged weapons have the [LETHAL HITS] ability.","",0,"","Take and Hold"],
  ["Retaliation Cadre",3,"Battlesuit","Bonded Heroes","Each time a T’au Empire Battlesuit model from your army makes a ranged attack that targets a unit within 12\", improve the Strength characteristic of that attack by 1. If that attack targets a unit within 8\", improve the Armour Penetration characteristic of that attack by 1 as well.","",0,"","Purge the Foe"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Negation Emitters (Upgrade)",15,"Advanced Acquisition Cadre","STEALTH BATTLESUITS unit only. This unit has -3\" detection range.",null],
  ["Unmasking Suite (Upgrade)",15,"Advanced Acquisition Cadre","GHOSTKEEL BATTLESUIT/PATHFINDER TEAM/STEALTH BATTLESUITS unit only. When this unit is selected to shoot, you can select one enemy unit within 24\" of this unit. That enemy unit has +9\" detection range until this unit has shot.",null],
  ["Admired Leader",20,"Auxiliary Cadre","T’AU EMPIRE model only (excluding KROOT models). In your Command phase, you can select one KROOT/VESPID STINGWINGS unit within 12\" of this model. If you do, that unit has +1 Ld and OC until the start of your next Command phase.",null],
  ["Student of Kauyon",20,"Auxiliary Cadre","KROOT SHAPER model only. In the Declare Battle Formations step, you can select up to three friendly KROOT CARNIVORES/FARSTALKERS units. Those units have Deep Strike.",null],
  ["Plasma Accelerator Rifle",20,"Experimental Prototype Cadre","BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s Plasma Rifle weapons. That weapon’s attacks have:\n- +2 S\n- +1 A, AP and D.",null],
  ["Supernova Launcher",15,"Experimental Prototype Cadre","BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s Airbursting Fragmentation Projector weapons. That weapon’s attacks have:\n- +3 S\n- +1 AP and D.",null],
  ["Thermoneutronic Projector",15,"Experimental Prototype Cadre","BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s T’au Flamer weapons. That weapon’s attacks have:\n- +2 S\n- +1 AP and D.",null],
  ["Exemplar of the Kauyon",20,"Kauyon","T’au Empire model only (excluding Kroot Shaper models). While the bearer is leading a unit, the Patient Hunter Detachment rule applies to that unit from the second battle round onwards instead of the third.",null],
  ["Precision of the Patient Hunter",15,"Kauyon","T’au Empire model only. Each time the bearer makes a ranged attack, add 1 to the Hit roll. From the third battle round onwards, add 1 to the Wound roll as well.",null],
  ["Solid-image Projection Unit",20,"Kauyon","T’au Empire model only. After both players have deployed their armies, select up to three T’au Empire units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",null],
  ["Through Unity, Devastation",30,"Kauyon","T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, each time that unit is an Observer unit, until the end of the phase, ranged weapons equipped by models in a Guided unit have the [LETHAL HITS] ability while targeting their Spotted unit.",null],
  ["Borthrod Gland",15,"Kroot Hunting Pack","Kroot Flesh Shaper only. While the bearer is leading a unit, each time a model in that unit makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit.",null],
  ["Kroothawk Flock",10,"Kroot Hunting Pack","Kroot model only. Ranged weapons equipped by models in the bearer's unit have the [IGNORES COVER] ability, and enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" horizontally of the bearer.",null],
  ["Nomadic Hunter",20,"Kroot Hunting Pack","Kroot Trail Shaper model only. While the bearer is leading a unit, add 3\" to the Move characteristic of models in that unit and ranged weapons equipped by the models in that unit have the [ASSAULT] ability.",null],
  ["Root-carved Weapons",10,"Kroot Hunting Pack","Kroot War Shaper model only. All weapons equipped by the bearer have the [PRECISION] and [DEVASTATING WOUNDS] abilities.",null],
  ["Coordinated Exploitation",30,"Mont’ka","T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, each time that unit is an Observer unit, until the end of the phase, ranged weapons equipped by models in a Guided unit have the [SUSTAINED HITS 1] ability while targeting their Spotted unit.",null],
  ["Exemplar of the Mont’ka",10,"Mont’ka","T’au Empire model only (excluding Kroot Shaper models). While the bearer is leading a unit, the Killing Blow Detachment rule applies to that unit during the fourth battle round as well.",null],
  ["Strategic Conqueror",15,"Mont’ka","T’au Empire model only. At the start of the first battle round, before the first turn begins, select one objective marker on the battlefield. While a friendly T’au Empire model is within range of that objective marker and the bearer is on the battlefield, add 1 to that friendly model's Objective Control characteristic.",null],
  ["Strike Swiftly",45,"Mont’ka","In the Resolve Pre-battle Abilities step, you can select up to two friendly T’AU EMPIRE units within 6\" of this model that do not have the Scouts ability. Until the end of the battle, all models in the selected units have the Scouts 6\" ability.",null],
  ["Internal Grenade Racks",20,"Retaliation Cadre","T’au Empire Battlesuit model only. The bearer has the Grenades keyword, and each time the bearer ends a Normal move, you can select one enemy unit that it moved over during that move. If you do, roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",null],
  ["Prototype Weapon System",15,"Retaliation Cadre","T’au Empire Battlesuit model only. Each time the bearer is select to shoot, select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until those attacks are resolved, ranged weapons equipped by the bearer have the select ability.",null],
  ["Puretide Engram Neurochip",15,"Retaliation Cadre","T’AU EMPIRE BATTLESUIT model only. Each time you target the bearer’s unit with a Stratagem, roll one D6: on a 4+, you gain 1CP.",null],
  ["Starflare Ignition System",20,"Retaliation Cadre","T’au Empire Battlesuit model only. At the end of your opponent's turn, if the bearer's unit is not within Engagement Range of one or more enemy units, you can remove that unit from the battlefield and place it into Strategic Reserves.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Autoreactive Camouflage","Advanced Acquisition Cadre","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly PATHFINDER TEAM/ STEALTH BATTLESUITS unit, if that friendly unit is hidden.","That PATHFINDER TEAM/STEALTH BATTLESUITS unit.","Your unit has +1 Sv.",""],
  ["Marker Beacon","Advanced Acquisition Cadre","",1,"End of your Movement phase.","One friendly PATHFINDER TEAM/STEALTH BATTLESUITS unit.","Select one objective your unit is controlling. That objective is secured.",""],
  ["Microdrone Support","Advanced Acquisition Cadre","",1,"Your Shooting phase, when a friendly PATHFINDER TEAM/ STEALTH BATTLESUITS unit starts an action.","That PATHFINDER TEAM/STEALTH BATTLESUITS unit.","That action does not prevent your unit from being eligible to shoot.",""],
  ["Alien Expertise","Auxiliary Cadre","",1,"Your Movement phase, when a friendly KROOT/VESPID STINGWINGS unit is selected to make an advance move.","That KROOT/VESPID STINGWINGS unit.","That move does not prevent your unit from being eligible to declare a charge.",""],
  ["Experimental Modifications","Auxiliary Cadre","",1,"Your Shooting phase or the Fight phase, when a friendly KROOT/VESPID STINGWINGS unit is selected to attack.","That KROOT/VESPID STINGWINGS unit.","Your unit’s attacks have +1 AP.",""],
  ["Guided by Unity","Auxiliary Cadre","",1,"Your Shooting phase, when a friendly T’AU EMPIRE unit (excluding KROOT/VESPID STINGWINGS units) is selected to shoot.","That T’AU EMPIRE unit.","Your unit’s ranged attacks that target a unit within 9\" of a friendly KROOT/VESPID STINGWINGS unit have [LETHAL HITS].",""],
  ["Experimental Ammunition","Experimental Prototype Cadre","",1,"Your Shooting phase, when a friendly BATTLESUIT CHARACTER unit is selected to shoot.","That BATTLESUIT CHARACTER unit.","Your unit’s ranged attacks have: ▪ +1 S. ▪ OR: +1 S, AP and [HAZARDOUS].",""],
  ["A Tempting Trap","Kauyon","Tactique de Bataille",1,"Your Shooting phase.","One T’AU EMPIRE unit from your army that has not been selected to shoot this phase. The first time you use this Stratagem, you must also select one objective marker that is not in your opponent’s deployment zone; until the end of the battle, this becomes your Trap objective marker.","Until the end of the phase, each time a model in your unit makes a ranged attack that targets an enemy unit within range of your Trap objective marker, add 1 to the Wound roll.","You cannot use this Stratagem during the first or second battle rounds."],
  ["Combat Embarkation","Kauyon","Équipement",1,"Your opponent’s Charge phase, just after an enemy unit has declared a charge.","One T’au Empire Infantry unit from your army that was selected as one of the targets of that charge, and one friendly Transport.","Your unit can embark within that TRANSPORT. If it does, your opponent can select new targets for that charge.","Every model in your T’AU EMPIRE INFANTRY unit must be within 3\" of that TRANSPORT and there must be sufficient transport capacity to embark the entire unit."],
  ["Coordinate to Engage","Kauyon","Tactique de Bataille",1,"Your Shooting phase.","One T’AU EMPIRE unit from your army that has just been selected as an Observer unit (see For the Greater Good).","Until the end of the phase, each time a model in your unit makes an attack that targets their Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if your unit has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",""],
  ["Photon Grenades","Kauyon","Équipement",1,"Your opponent's charge phase, just after an enemy unit has selected its charge target.","One T’AU EMPIRE GRENADES unit from your army that was selected as one of the targets of that charge.","That enemy unit must immediately take a Battle-shock test, and until the end of the phase, subtract 2 from Charge rolls made for that enemy unit.","You cannot target a unit that is within Engagement Range of one or more enemy units."],
  ["Point-Blank Ambush","Kauyon","Tactique de Bataille",1,"Your Shooting phase.","One T’AU EMPIRE unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes a ranged attack that targets an enemy unit within 9\", improve the Armour Penetration characteristic of that attack by 1.","You cannot use this Stratagem during the first or second battle rounds."],
  ["Wall of Mirrors","Kauyon","Tactique de Bataille",1,"End of your opponent’s Fight phase.","One Stealth, Ghostkeel or Commander Shadowsun unit from your army.","Remove your unit from the battlefield and place it into Strategic Reserves.","You cannot target a unit that is within Engagement Range of one or more enemy units."],
  ["A Trap Well Laid","Kroot Hunting Pack","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Kroot unit from your army that has not been selected to shoot or fight this phase.","After your unit has resolved its attacks this phase, select one enemy unit that was hit by one or more of those attacks. Until the end of the phase, each time a KROOT model from your army makes an attack that targets that enemy unit, unless the attacking unit is Battle-shocked, improve the Armour Penetration characteristic of that attack by 1.",""],
  ["Emp Grenades","Kroot Hunting Pack","Équipement",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy VEHICLE unit is selected to shoot or fight.","One Kroot Grenades unit from your army within 8\" of that enemy VEHICLE unit.","Until the end of the phase, worsen the Weapon Skill and Ballistic Skill characteristics of that enemy VEHICLE unit’s weapons by 1.",""],
  ["Guerrilla Warriors","Kroot Hunting Pack","Ruse Stratégique",1,"Your Movement phase, just after a Kroot unit from your army Falls Back.","That KROOT unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge.",""],
  ["Hidden Hunters","Kroot Hunting Pack","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Kroot unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit can only be selected as the target of a ranged attack if the attacking model is within 18\".",""],
  ["Join the Hunt","Kroot Hunting Pack","Tactique de Bataille",2,"Any phase.","One Kroot Infantry or Kroot Hounds unit from your army that was just destroyed. You can use this Stratagem on that unit even though it was just destroyed.","Add a new unit to your army identical to your destroyed unit, in Strategic Reserves, at its Starting Strength.","This Stratagem cannot be used to return destroyed Character units to Attached units. You can only use this Stratagem once per battle."],
  ["The Grisly Feast","Kroot Hunting Pack","Ruse Stratégique",1,"Fight phase.","One Kroot unit from your army that destroyed one or more enemy units this phase.","In your opponent’s next Command phase, each enemy unit within 6\" of your unit must take a Battle-shock test. If the unit taking that test is Below Half-strength, subtract 1 from that test. Enemy units affected by this Stratagem do not need to take any other Battle-shock tests in the same phase.",""],
  ["Aggressive Mobility","Mont’ka","Tactique de Bataille",1,"Your Movement phase.","One T’AU EMPIRE unit from your army that has not been selected to move this phase.","Until the end of the phase, if your unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in your unit.",""],
  ["Combat Debarkation","Mont’ka","Tactique de Bataille",1,"Your Shooting phase.","One T’au Empire Infantry unit from your army that disembarked from a TRANSPORT this turn.","Until the end of the phase, each time a model in your unit makes an attack that targets the closest enemy unit, you can re-roll the Wound roll.",""],
  ["Counterfire Defence Systems","Mont’ka","Équipement",2,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One T’AU EMPIRE unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack is allocated to your unit, subtract 1 from the Damage characteristic of that attack.",""],
  ["Focused Fire","Mont’ka","Tactique de Bataille",1,"Start of your Shooting phase.","Two T’AU EMPIRE units from your army that have not been selected to shoot this phase, and one enemy unit.","Until the end of the phase, each time a model in either of your units makes an attack, it can only target that enemy unit (and only if it is an eligible target for that attack), and when resolving that attack, improve the Armour Penetration characteristic by 1.","You cannot use this Stratagem during the fourth or fifth battle rounds."],
  ["Pinpoint Counter-Offensive","Mont’ka","Tactique de Bataille",1,"Any phase.","One T’AU EMPIRE unit (excluding Kroot units) from your army that was just destroyed. You can use this Stratagem on that unit even though it was just destroyed.","Until the end of the battle, each time a T’AU EMPIRE unit (excluding KROOT units) from your army makes an attack that targets the enemy unit that just destroyed your unit, you can re-roll the Hit roll.",""],
  ["Pulse Onslaught","Mont’ka","Ruse Stratégique",2,"Your Shooting phase.","One T’au Empire Infantry unit (excluding Kroot units) from your army that has just shot, and one enemy unit (excluding MONSTERS and VEHICLES) hit by one or more of those attacks.","Until the end of your opponent’s next turn, that enemy unit is shaken. While a unit is shaken, subtract 2 from its Move characteristic and subtract 2 from Advance and Charge rolls made for it.",""],
  ["Fail-Safe Detonator","Retaliation Cadre","Fait Épique",2,"Any phase, just after a T’au Empire Battlesuit model from your army is destroyed.","That destroyed model’s unit. You can use this Stratagem on that unit even if that unit was just destroyed.","Before removing your model from play, if it has the Deadly Demise ability, do not roll for that ability; instead, you can choose whether the result of that roll is a 1 or a 6. If your model does not have the Deadly Demise ability, roll one D6 for each unit within 6\" of it: on a 4+, that unit suffers D3 mortal wounds.",""],
  ["Grav-Inhibitor Field","Retaliation Cadre","Ruse Stratégique",1,"Your opponent’s Charge phase, just after an enemy unit has declared a charge.","One T’au Empire Battlesuit unit from your army that was selected as a target of that charge.","That enemy unit must immediately take a Battle-shock test and you must roll one D6 for each model in that enemy unit: for each 6, that enemy unit suffers 1 mortal wound.",""],
  ["Stimm Injectors","Retaliation Cadre","Équipement",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One T’au Empire Battlesuit unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 6+ ability.",""],
  ["The Arro’kon Protocol","Retaliation Cadre","Tactique de Bataille",1,"Your Shooting phase.","One T’au Empire Battlesuit unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit that contains 6 or more models, that attack has the [SUSTAINED HITS 1] ability. If that attack targets an enemy unit that contains 11 or more models, it has the [SUSTAINED HITS 2] ability instead.",""],
  ["The Shortened Blade","Retaliation Cadre","Ruse Stratégique",2,"Your Movement phase.","One T’au Empire Battlesuit unit from your army that is arriving using the Deep Strike ability this phase.","Your unit can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy models.","A unit targeted with this Stratagem is not eligible to declare a charge in the same turn."],
  ["The Torchstar Gambit","Retaliation Cadre","Ruse Stratégique",1,"Your Shooting phase.","One T’au Empire Battlesuit unit from your army that can FLY whose attacks have been resolved this phase.","If your unit is not within Engagement Range of one or more enemy units, it can make a Normal move. If it does, your unit cannot declare a charge this turn",""],
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
  "AX-1-0 Tiger Shark",
  "Barracuda",
  "Broadside Battlesuits",
  "Crisis Battlesuits",
  "Crisis Fireknife Battlesuits",
  "Crisis Starscythe Battlesuits",
  "Crisis Sunforge Battlesuits",
  "Devilfish",
  "Ghostkeel Battlesuit",
  "Hammerhead Gunship",
  "Heavy Gun Drones",
  "Manta",
  "Orca Dropship",
  "Piranhas",
  "R'varna Battlesuit",
  "Razorshark Strike Fighter",
  "Remora Stealth Drones",
  "Riptide Battlesuit",
  "Sky Ray Gunship",
  "Stormsurge",
  "Sun Shark Bomber",
  "TX42 Piranha",
  "Ta'unar Supremacy Armour",
  "Tetras",
  "Tiger Shark",
  "XV9 Hazard Battlesuits",
  "Y'vahra Battlesuit"
 ],
 "monster": [
  "Great Knarloc"
 ],
 "battleline": [
  "Breacher Team",
  "Strike Team"
 ],
 "epic": [
  "Aun'shi",
  "Aun'va",
  "Commander Farsight",
  "Commander Shadowsun",
  "Darkstrider",
  "Longstrike",
  "Shas'o R'alai",
  "The Twin Lance"
 ],
 "infantry": [
  "Kroot Carnivores",
  "Kroot Farstalkers",
  "Pathfinder Team",
  "Stealth Battlesuits",
  "Vespid Stingwings"
 ],
 "character": [
  "Cadre Fireblade",
  "Commander in Coldstar Battlesuit",
  "Commander in Crisis Battlesuit",
  "Commander in Enforcer Battlesuit",
  "Ethereal",
  "Firesight Team",
  "Kroot Flesh Shaper",
  "Kroot Lone-spear",
  "Kroot Trail Shaper",
  "Kroot War Shaper"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Commander Shadowsun": "50",
 "Commander Farsight": "60",
 "Commander in Enforcer Battlesuit": "60",
 "Commander in Coldstar Battlesuit": "60",
 "Cadre Fireblade": "25",
 "Ethereal": "40",
 "Darkstrider": "32",
 "Strike Team": "25",
 "Breacher Team": "25",
 "Kroot Carnivores": "28.5",
 "Krootox Riders": "50",
 "Stealth Battlesuits": "32",
 "Ghostkeel Battlesuit": "105x70",
 "Firesight Team": "40",
 "Pathfinder Team": "25",
 "Piranhas": "120x92",
 "Vespid Stingwings": "28.5",
 "Kroot Hounds": "28.5",
 "Broadside Battlesuits": "60",
 "Riptide Battlesuit": "120x92",
 "Hammerhead Gunship": "120x92",
 "Sky Ray Gunship": "120x92",
 "Devilfish": "120x92",
 "Razorshark Strike Fighter": "120x92",
 "Sun Shark Bomber": "120x92",
 "Tidewall Shieldline": "coque",
 "Tidewall Droneport": "coque",
 "Tidewall Gunrig": "coque",
 "Stormsurge": "170x109",
 "Kroot Farstalkers": "28.5",
 "Ta'unar Supremacy Armour": "160",
 "Tiger Shark": "160",
 "AX-1-0 Tiger Shark": "160",
 "Manta": "coque",
 "Crisis Sunforge Battlesuits": "50",
 "Crisis Fireknife Battlesuits": "50",
 "Crisis Starscythe Battlesuits": "50",
 "Kroot Trail Shaper": "32",
 "Kroot War Shaper": "32",
 "Kroot Flesh Shaper": "32",
 "Kroot Lone-spear": "90x52.5",
 "Krootox Rampagers": "50",
 "The Twin Lance": "60"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Longstrike": 5,
 "Ghostkeel Battlesuit": 4,
 "Riptide Battlesuit": 4,
 "Hammerhead Gunship": 5,
 "Sky Ray Gunship": 5,
 "Razorshark Strike Fighter": 4,
 "Sun Shark Bomber": 4,
 "Stormsurge": 5,
 "R'varna Battlesuit": 5,
 "Y'vahra Battlesuit": 5,
 "Ta'unar Supremacy Armour": 10,
 "Barracuda": 5,
 "Tiger Shark": 6,
 "AX-1-0 Tiger Shark": 6,
 "Manta": 20,
 "Orca Dropship": 9
};

const TRANSPORTS = {
 "Devilfish": "This model has a transport capacity of 12 T’AU EMPIRE INFANTRY models. It cannot transport BATTLESUIT, KROOT or VESPID STINGWINGS models.",
 "Tidewall Shieldline": "This model has a transport capacity of 11 T’AU EMPIRE INFANTRY models. It cannot transport BATTLESUIT, KROOT or VESPID STINGWINGS models. If this model is equipped with a Tidewall defence platform, it has a transport capacity of 22 T’AU INFANTRY models instead.",
 "Tidewall Droneport": "This model has a transport capacity of 11 T’AU EMPIRE INFANTRY models. It cannot transport BATTLESUIT, KROOT or VESPID STINGWINGS models.",
 "Tidewall Gunrig": "This model has a transport capacity of 11 T’AU EMPIRE INFANTRY models. It cannot transport BATTLESUIT, KROOT or VESPID STINGWINGS models.",
 "Manta": "This model has a transport capacity of all of the following:\n- 200 T’AU EMPIRE INFANTRY or TACTICAL DRONE models\n- 4 DEVILFISH, SKY RAY GUNSHIP or HAMMERHEAD models\n- 8 BATTLESUIT models with a Wounds characteristic of 9 or less",
 "Orca Dropship": "This model has a transport capacity of 48 T’AU EMPIRE INFANTRY models. This model can also transport up to 6 BATTLESUIT models (these models take up the space of a number of models equal to their Wounds characteristic, e.g. a BATTLESUIT with a Wounds characteristic of 8 would take up the space of 8 models). This model cannot transport KROOT or VESPID STINGWINGS models."
};
const FACTION = [
 [
  "For The Greater Good",
  "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/tau.json —
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
  cle : "tau",
  nom : "Empire T'au",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
