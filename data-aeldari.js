/* ============================================================
   Données Aeldari — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py aeldari

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 89 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     71 fiches sur 98 en ont un. Les autres — des Legends, que le
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
  ["Amallyn Shadowguide",7,3,5,4,3,[1],{"1": 75},0,"",1,"",1,"6+"],
  ["Asurmen",7,3,2,4,5,[1],{"1": 135},0,"Meneur",0,"",1,"6+"],
  ["Autarch",7,3,3,4,4,[1],{"1": 70},0,"Meneur",0,"",1,"6+"],
  ["Autarch Skyrunner",14,4,3,4,5,[1],{"1": 90},0,"Meneur",1,"",2,"6+"],
  ["Autarch Wayleaper",14,3,3,4,4,[1],{"1": 70},0,"Meneur",0,"",1,"6+"],
  ["Avatar of Khaine",10,11,2,4,14,[1],{"1": 250},0,"",0,"",5,"6+"],
  ["Baharroth",14,3,2,4,5,[1],{"1": 125},0,"Meneur",0,"",1,"6+"],
  ["Bonesinger",7,3,6,4,3,[1],{"1": 45},0,"Meneur",1,"",1,"6+"],
  ["Clanblade",10,5,4,0,4,[1],{"1": 70},0,"Meneur",0,"",2,"6+"],
  ["Cobra",14,11,2,5,24,[1],{"1": 415},0,"",1,"",8,"6+"],
  ["Corsair Cloud Dancer Band",14,4,3,0,2,[3, 4, 6, 7],{"3": 125, "4": 150, "6": 210, "7": 245},0,"",1,"",2,"6+"],
  ["Corsair Reaver Band",7,3,5,0,3,[5, 6, 10, 11],{"5": 125, "6": 150, "10": 250, "11": 275},0,"",1,"",2,"6+"],
  ["Corsair Skyreavers",12,3,5,0,1,[5, 10],{"5": 75, "10": 140},0,"",0,"",1,"7+"],
  ["Corsair Voidreavers",7,3,4,0,1,[5, 10],{"5": 65, "10": 110},0,"",0,"",2,"7+"],
  ["Corsair Voidscarred",7,3,4,0,1,[5, 10],{"5": 70, "10": 140},0,"",0,"",1,"6+"],
  ["Crimson Hunter",0,8,3,5,12,[1],{"1": 160},0,"",0,"",0,"6+"],
  ["D-Cannon Platform",7,6,4,0,5,[1],[[1, {"1": 110}], [3, {"1": 130}]],0,"",0,"",1,"7+"],
  ["Dark Reapers",6,3,3,5,1,[5, 10],{"5": 95, "10": 200},0,"",0,"",1,"6+"],
  ["Death Jester",8,3,6,4,4,[1],{"1": 65},0,"",0,"",1,"6+"],
  ["Dire Avengers",7,3,4,5,1,[5, 10],{"5": 70, "10": 140},0,"",0,"",1,"6+"],
  ["Dragon Knights",10,5,4,0,4,[3, 6],[[1, {"3": 85, "6": 180}], [3, {"3": 95, "6": 190}]],0,"",0,"",2,"7+"],
  ["Eldrad Ulthran",7,4,6,4,5,[1],{"1": 120},0,"Meneur",0,"",1,"6+"],
  ["Falcon",14,9,3,0,12,[1],{"1": 130},0,"",0,"",3,"7+"],
  ["Farseer",7,3,6,4,4,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Farseer Skyrunner",14,4,6,4,5,[1],{"1": 60},0,"Meneur",0,"",2,"6+"],
  ["Fire Dragons",7,3,3,5,1,[5, 10],[[1, {"5": 110, "10": 240}], [3, {"5": 120, "10": 250}]],0,"",0,"",1,"6+"],
  ["Fire Prism",14,9,3,0,12,[1],{"1": 150},0,"",0,"",3,"7+"],
  ["Firestorm",14,9,3,0,12,[1],{"1": 115},0,"",1,"",3,"6+"],
  ["Fuegan",7,3,2,4,5,[1],{"1": 130},0,"Meneur",0,"",1,"6+"],
  ["Guardian Defenders",7,3,4,0,1,[11],{"11": 90},0,"",0,"",2,"7+"],
  ["Hemlock Wraithfighter",0,8,3,0,12,[1],{"1": 155},0,"",0,"",0,"6+"],
  ["Hornet",14,7,3,0,8,[1],{"1": 100},0,"",1,"",2,"6+"],
  ["Howling Banshees",8,3,4,4,1,[5, 10],{"5": 85, "10": 165},0,"",0,"",1,"6+"],
  ["Illic Nightspear",7,3,5,5,3,[1],{"1": 70},0,"Meneur",1,"",1,"6+"],
  ["Irillyth",12,3,2,4,5,[1],{"1": 105},0,"Meneur",1,"",1,"6+"],
  ["Jain Zar",8,3,2,4,5,[1],{"1": 105},0,"Meneur",0,"",1,"6+"],
  ["Karandras",7,3,2,4,5,[1],{"1": 90},0,"Meneur",1,"",1,"6+"],
  ["Kharseth",7,3,6,4,4,[1],{"1": 80},0,"Meneur",0,"",1,"6+"],
  ["Leystalker",10,5,4,0,4,[1],{"1": 75},0,"",0,"",2,"7+"],
  ["Lhykhis",12,3,2,4,5,[1],{"1": 135},0,"Meneur",0,"",1,"6+"],
  ["Lynx",14,9,3,5,16,[1],{"1": 180},0,"",1,"",4,"6+"],
  ["Maugan Ra",7,3,2,4,5,[1],{"1": 100},0,"Meneur",0,"",1,"6+"],
  ["Night Spinner",14,9,3,0,12,[1],[[1, {"1": 165}], [3, {"1": 195}]],0,"",0,"",3,"7+"],
  ["Nightwing",0,8,3,5,12,[1],{"1": 150},0,"",1,"",0,"6+"],
  ["Phantom Titan",14,14,2,4,55,[1],{"1": 2100},0,"",0,"",20,"6+"],
  ["Phoenix",0,9,3,0,16,[1],{"1": 175},0,"",1,"",0,"6+"],
  ["Prince Yriel",7,3,3,4,5,[1],{"1": 95},0,"Meneur",0,"",1,"6+"],
  ["Rangers",7,3,5,5,1,[5, 10],{"5": 60, "10": 110},0,"",0,"",1,"7+"],
  ["Revenant Titan",16,13,2,4,30,[1],{"1": 1100},0,"",0,"",16,"6+"],
  ["Scorpion",14,11,2,5,24,[1],{"1": 410},0,"",1,"",8,"6+"],
  ["Shadow Spectres",12,3,3,5,2,[1, 5, 10],{"1": 30, "5": 115, "10": 230},0,"",1,"",1,"6+"],
  ["Shadow Weaver Platform",7,6,4,0,5,[1],{"1": 60},0,"",0,"",1,"7+"],
  ["Shadowseer",8,3,6,4,4,[1],{"1": 50},0,"Meneur",0,"",1,"6+"],
  ["Shining Spears",14,4,3,5,2,[3, 6],{"3": 100, "6": 200},0,"",0,"",2,"6+"],
  ["Shroud Runners",14,4,5,5,3,[3, 6],{"3": 90, "6": 165},0,"",0,"",2,"7+"],
  ["Skathach Wraithknight",10,12,2,0,18,[1],{"1": 490},0,"",1,"",10,"6+"],
  ["Skyweavers",14,4,4,4,3,[2, 4],{"2": 90, "4": 180},0,"",0,"",2,"6+"],
  ["Solitaire",12,3,6,4,4,[1],{"1": 105},0,"",0,"",1,"6+"],
  ["Spiritseer",7,3,6,4,3,[1],{"1": 50},0,"",0,"",1,"6+"],
  ["Starfangs",14,6,3,0,6,[1, 2],{"1": 70, "2": 140},0,"",0,"",2,"7+"],
  ["Starweaver",14,6,4,4,6,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Stonesinger",10,5,4,0,4,[1],{"1": 55},0,"Appui",0,"",2,"7+"],
  ["Storm Guardians",7,3,4,0,2,[11],{"11": 100},0,"",0,"",0,"7+"],
  ["Striking Scorpions",7,3,3,5,1,[5, 10],{"5": 75, "10": 145},0,"",0,"",1,"6+"],
  ["Swooping Hawks",14,3,4,5,1,[5, 10],[[1, {"5": 95, "10": 190}], [3, {"5": 110, "10": 205}]],0,"",0,"",1,"6+"],
  ["The Visarch",8,3,2,4,5,[1],{"1": 80},0,"Appui",0,"",1,"6+"],
  ["The Yncarne",10,10,2,4,12,[1],{"1": 230},0,"",0,"",3,"6+"],
  ["Troupe",8,3,6,4,1,[5, 6, 11, 12],{"5": 85, "6": 100, "11": 190, "12": 205},0,"",0,"",1,"6+"],
  ["Troupe Master",8,3,6,4,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Vampire Hunter",0,12,3,4,30,[1],{"1": 460},0,"",1,"",0,"6+"],
  ["Vampire Raider",0,12,3,4,30,[1],{"1": 430},0,"",1,"",0,"6+"],
  ["Vibro Cannon Platform",7,6,4,0,5,[1],{"1": 60},0,"",0,"",1,"7+"],
  ["Voidweaver",14,6,4,4,6,[1],{"1": 115},0,"",0,"",2,"6+"],
  ["War Walkers",10,7,3,5,6,[1, 2],{"1": 80, "2": 160},0,"",0,"",2,"7+"],
  ["Warlock",7,3,6,4,2,[1],{"1": 40},0,"Appui",0,"",1,"6+"],
  ["Warlock Conclave",7,3,6,4,2,[2, 4],{"2": 55, "4": 110},0,"Appui",0,"",1,"6+"],
  ["Warlock Skyrunners",14,4,6,4,3,[1, 2],{"1": 45, "2": 90},0,"Appui",0,"",2,"6+"],
  ["Warp Hunter",14,9,3,0,12,[1],{"1": 145},0,"",1,"",3,"6+"],
  ["Warp Spiders",12,3,3,5,1,[5, 10],[[1, {"5": 105, "10": 200}], [3, {"5": 125, "10": 220}]],0,"",0,"",1,"6+"],
  ["Wasp Assault Walker",10,7,3,4,6,[1],{"1": 95},0,"",1,"",2,"6+"],
  ["Wave Serpent",14,9,3,5,13,[1],[[1, {"1": 115}], [4, {"1": 125}]],0,"",0,"",2,"7+"],
  ["Webway Gate",0,12,3,0,14,[2],{"2": 105},0,"",1,"",0,"6+"],
  ["Windriders",14,4,4,6,2,[3, 6],{"3": 80, "6": 170},0,"",0,"",2,"7+"],
  ["Wraithblades",6,6,2,0,3,[5],{"5": 140},0,"",0,"",1,"8+"],
  ["Wraithguard",6,6,2,0,3,[5],{"5": 145},0,"",0,"",1,"8+"],
  ["Wraithknight",12,12,2,0,18,[1],[[1, {"1": 385}], [2, {"1": 405}]],0,"",0,"",10,"6+"],
  ["Wraithknight with Ghostglaive",12,12,2,0,18,[1],[[1, {"1": 380}], [2, {"1": 400}]],0,"",0,"",10,"6+"],
  ["Wraithlord",8,10,2,0,10,[1],{"1": 125},0,"",0,"",3,"8+"],
  ["Wraithseer",8,11,2,5,10,[1],{"1": 160},0,"",1,"",3,"6+"],
  ["Ynnari Archon",8,3,4,2,4,[1],{"1": 85},0,"Meneur",0,"",1,"6+"],
  ["Ynnari Incubi",7,3,3,5,1,[5, 10],[[1, {"5": 80, "10": 160}], [3, {"5": 90, "10": 170}]],0,"",0,"",1,"6+"],
  ["Ynnari Kabalite Warriors",8,3,4,6,1,[10],{"10": 110},0,"",0,"",2,"6+"],
  ["Ynnari Raider",14,8,4,6,10,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Ynnari Reavers",16,4,4,6,2,[3, 6],{"3": 65, "6": 120},0,"",0,"",2,"6+"],
  ["Ynnari Succubus",8,3,6,4,4,[1],{"1": 45},0,"Meneur",0,"",1,"6+"],
  ["Ynnari Venom",14,6,4,6,6,[1],[[1, {"1": 65}], [4, {"1": 75}]],0,"",0,"",1,"6+"],
  ["Ynnari Wyches",8,3,6,4,1,[10],{"10": 90},0,"",0,"",2,"6+"],
  ["Yvraine",8,3,6,4,4,[1],{"1": 90},0,"Meneur",0,"",1,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Amallyn Shadowguide","Ranger long rifle","T","1",3,4,1,"2","heavy precision","36\""],
  ["Amallyn Shadowguide","Power blade","C","4",3,4,2,"1","","càc"],
  ["Asurmen","The Bloody Twins","T","6",2,5,1,"2","assault pistol","24\""],
  ["Asurmen","The Sword of Asur","C","6",2,6,3,"3","dev","càc"],
  ["Autarch","Death Spinner","T","D6",0,4,1,"1","ignorescover torrent","12\""],
  ["Autarch","Dragon Fusion Gun","T","1",2,9,4,"D6","assault melta:3","12\""],
  ["Autarch","Dragon Fusion Pistol","T","1",2,9,4,"D6","assault melta:3 pistol","6\""],
  ["Autarch","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Autarch","➤ Reaper Launcher - Starshot","T","1",3,10,2,"3","heavy ignorescover","48\""],
  ["Autarch","➤ Reaper Launcher - Starswarm","T","2",3,4,2,"1","heavy ignorescover","48\""],
  ["Autarch","Banshee Blade","C","5",2,4,2,"2","anti:3:inf","càc"],
  ["Autarch","Scorpion Chainsword","C","7",2,4,1,"1","sust:1","càc"],
  ["Autarch","Star Glaive","C","4",2,6,3,"3","","càc"],
  ["Autarch Skyrunner","Dragon Fusion Gun","T","1",2,9,4,"D6","assault melta:3","12\""],
  ["Autarch Skyrunner","Laser Lance (tir)","T","1",2,6,3,"2","assault","6\""],
  ["Autarch Skyrunner","Twin Shuriken Catapult","T","2",2,4,1,"1","assault","18\""],
  ["Autarch Skyrunner","Banshee Blade","C","5",2,4,3,"1","","càc"],
  ["Autarch Skyrunner","Close Combat Weapon","C","3",2,3,0,"1","","càc"],
  ["Autarch Skyrunner","Laser Lance (càc)","C","4",2,4,3,"2","lance","càc"],
  ["Autarch Wayleaper","Death Spinner","T","D6",0,4,1,"1","ignorescover torrent","12\""],
  ["Autarch Wayleaper","Dragon Fusion Gun","T","1",2,9,4,"D6","assault melta:3","12\""],
  ["Autarch Wayleaper","Dragon Fusion Pistol","T","1",2,9,4,"D6","assault melta:3 pistol","6\""],
  ["Autarch Wayleaper","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Autarch Wayleaper","➤ Reaper Launcher - Starshot","T","1",3,10,2,"3","heavy ignorescover","48\""],
  ["Autarch Wayleaper","➤ Reaper Launcher - Starswarm","T","2",3,4,2,"1","heavy ignorescover","48\""],
  ["Autarch Wayleaper","Banshee Blade","C","5",2,4,2,"2","anti:3:inf","càc"],
  ["Autarch Wayleaper","Scorpion Chainsword","C","7",2,4,1,"1","sust:1","càc"],
  ["Autarch Wayleaper","Star Glaive","C","4",2,6,3,"3","","càc"],
  ["Avatar of Khaine","The Wailing Doom","T","1",2,16,4,"D6+2","sust:D3","12\""],
  ["Avatar of Khaine","➤ The Wailing Doom - Strike","C","6",2,16,4,"D6+2","","càc"],
  ["Avatar of Khaine","➤ The Wailing Doom - Sweep","C","12",2,8,2,"2","","càc"],
  ["Baharroth","Fury of the Tempest","T","4",2,6,1,"2","assault lethal","24\""],
  ["Baharroth","The Shining Blade","C","6",2,5,2,"2","sust:1","càc"],
  ["Bonesinger","Psytronome Shaper","C","2",2,3,0,"D3","psychic","càc"],
  ["Clanblade","Solar Carbine","T","2",3,4,0,"1","rf:2","18\""],
  ["Clanblade","Drakesteed Fangs and Talons","C","3",3,5,1,"1","extra","càc"],
  ["Clanblade","Moonblades","C","5",2,4,2,"2","lethal twin","càc"],
  ["Cobra","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Cobra","D-Impaler","T","D6+3",3,16,4,"4","blast dev","36\""],
  ["Cobra","Scatter Laser","T","6",3,5,0,"1","","36\""],
  ["Cobra","Shuriken Cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Cobra","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Cobra","➤ Aeldari missile launcher - starshot","T","1",3,10,2,"D6","","48\""],
  ["Cobra","➤ Aeldari missile launcher - sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["Cobra","Wraithbone Hull","C","6",4,6,0,"1","","càc"],
  ["Corsair Cloud Dancer Band","Brace of pistols","T","2",3,3,0,"1","assault pistol","12\""],
  ["Corsair Cloud Dancer Band","Dark lance","T","1",3,12,3,"D6+2","","36\""],
  ["Corsair Cloud Dancer Band","Dissonance cannon","T","3",3,6,1,"2","dev","24\""],
  ["Corsair Cloud Dancer Band","Dissonance pistol","T","1",3,6,1,"1","dev pistol","12\""],
  ["Corsair Cloud Dancer Band","Shuriken cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Corsair Cloud Dancer Band","Splinter cannon","T","3",3,3,1,"2","anti:3:inf sust:1","36\""],
  ["Corsair Cloud Dancer Band","Twin shuriken catapult","T","2",3,4,1,"1","assault twin","18\""],
  ["Corsair Cloud Dancer Band","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Corsair Cloud Dancer Band","Void sabre","C","3",3,4,2,"1","","càc"],
  ["Corsair Reaver Band","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Corsair Reaver Band","Brace of pistols","T","2",3,3,0,"1","assault pistol","12\""],
  ["Corsair Reaver Band","Corsair firearm","T","4",3,4,0,"1","assault lethal","24\""],
  ["Corsair Reaver Band","Dark lance","T","1",4,12,3,"D6+2","heavy","48\""],
  ["Corsair Reaver Band","Dissonance pistol","T","1",3,6,1,"1","dev pistol","12\""],
  ["Corsair Reaver Band","Flamer","T","D6",0,4,0,"1","assault ignorescover torrent","12\""],
  ["Corsair Reaver Band","Fusion gun","T","1",3,8,4,"D6+1","assault melta:2","12\""],
  ["Corsair Reaver Band","Shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Corsair Reaver Band","Shuriken cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Corsair Reaver Band","Splinter cannon","T","3",3,3,1,"2","anti:3:inf heavy sust:1","36\""],
  ["Corsair Reaver Band","➤ Aeldari missile launcher - starshot","T","1",3,10,2,"D6","","48\""],
  ["Corsair Reaver Band","➤ Aeldari missile launcher - sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["Corsair Reaver Band","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Corsair Reaver Band","Spar glaive","C","4",3,3,0,"1","","càc"],
  ["Corsair Reaver Band","Void sabre","C","3",3,4,2,"1","","càc"],
  ["Corsair Skyreavers","Blast Pistol","T","1",3,8,3,"D3","assault pistol","6\""],
  ["Corsair Skyreavers","Corsair blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Corsair Skyreavers","Flamer","T","D6",0,4,0,"1","assault ignorescover torrent","12\""],
  ["Corsair Skyreavers","Fusion gun","T","1",3,8,4,"D6","assault melta:2","12\""],
  ["Corsair Skyreavers","Neuro disruptor","T","1",3,4,2,"1","anti:2:inf assault pistol","12\""],
  ["Corsair Skyreavers","Shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Corsair Skyreavers","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Corsair Skyreavers","Shuriken pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Corsair Skyreavers","Close combat weapon","C","3",3,3,0,"1","","càc"],
  ["Corsair Skyreavers","Corsair Blade","C","3",3,4,2,"1","","càc"],
  ["Corsair Voidreavers","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Corsair Voidreavers","Corsair shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Corsair Voidreavers","Neuro disruptor","T","1",3,4,2,"1","anti:2:inf assault pistol","12\""],
  ["Corsair Voidreavers","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Corsair Voidreavers","Shuriken cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Corsair Voidreavers","Shuriken pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Corsair Voidreavers","Shuriken rifle","T","1",3,4,1,"1","assault rf:1","24\""],
  ["Corsair Voidreavers","Wraithcannon","T","1",3,14,4,"D6+1","","18\""],
  ["Corsair Voidreavers","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Corsair Voidreavers","Power sword","C","2",3,4,2,"1","","càc"],
  ["Corsair Voidscarred","Corsair blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Corsair Voidscarred","Corsair shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Corsair Voidscarred","Executioner","T","3",3,6,2,"D3","anti:2:inf psychic","18\""],
  ["Corsair Voidscarred","Fusion pistol","T","1",3,8,4,"D6","assault melta:2 pistol","6\""],
  ["Corsair Voidscarred","Long rifle","T","1",3,4,1,"2","heavy precision","36\""],
  ["Corsair Voidscarred","Neuro disruptor","T","1",3,4,2,"1","anti:2:inf assault pistol","12\""],
  ["Corsair Voidscarred","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Corsair Voidscarred","Shuriken cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Corsair Voidscarred","Shuriken pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Corsair Voidscarred","Shuriken rifle","T","1",3,4,1,"1","assault rf:1","24\""],
  ["Corsair Voidscarred","Wraithcannon","T","1",3,14,4,"D6+1","","18\""],
  ["Corsair Voidscarred","Close combat weapon","C","3",3,3,0,"1","","càc"],
  ["Corsair Voidscarred","Paired Hekatarii blades","C","4",2,3,2,"1","twin","càc"],
  ["Corsair Voidscarred","Power sword","C","3",3,4,2,"1","","càc"],
  ["Corsair Voidscarred","Witch staff","C","2",2,3,0,"D3","anti:2:inf psychic","càc"],
  ["Crimson Hunter","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Crimson Hunter","Pulse Laser","T","3",3,9,2,"D6","","48\""],
  ["Crimson Hunter","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Crimson Hunter","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["D-Cannon Platform","D-cannon","T","D3",3,16,4,"D6+2","blast dev indirect","24\""],
  ["D-Cannon Platform","Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["D-Cannon Platform","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Dark Reapers","Shuriken Cannon","T","3",3,6,1,"2","ignorescover lethal","24\""],
  ["Dark Reapers","Tempest Launcher","T","2D6",3,4,1,"1","blast indirect","36\""],
  ["Dark Reapers","➤ Missile Launcher - Starshot","T","1",2,10,2,"D6","ignorescover","48\""],
  ["Dark Reapers","➤ Missile Launcher - Sunburst","T","D6",2,4,1,"1","blast ignorescover","48\""],
  ["Dark Reapers","➤ Reaper Launcher - Starshot","T","1",3,10,2,"3","ignorescover","48\""],
  ["Dark Reapers","➤ Reaper Launcher - Starswarm","T","2",3,5,2,"1","ignorescover","48\""],
  ["Dark Reapers","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Death Jester","Shrieker Cannon","T","3",2,6,2,"2","","24\""],
  ["Death Jester","Jester's Blade","C","4",2,4,0,"1","","càc"],
  ["Dire Avengers","Avenger shuriken catapult","T","4",3,4,1,"1","assault","18\""],
  ["Dire Avengers","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Dire Avengers","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Dire Avengers","Diresword","C","4",3,4,2,"1","","càc"],
  ["Dire Avengers","Power Glaive","C","3",3,5,3,"1","","càc"],
  ["Dragon Knights","Laser Lance (tir)","T","1",3,6,2,"3","assault","6\""],
  ["Dragon Knights","Solar Carbine","T","2",3,4,0,"1","rf:2","18\""],
  ["Dragon Knights","Drakesteed Fangs and Talons","C","3",3,5,1,"1","extra","càc"],
  ["Dragon Knights","Laser Lance (càc)","C","3",3,6,2,"3","lance","càc"],
  ["Eldrad Ulthran","Mind War","T","1",2,5,2,"D6","anti:4:perso precision psychic","18\""],
  ["Eldrad Ulthran","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Eldrad Ulthran","Staff of Ulthamar and witchblade","C","3",2,5,1,"2","anti:2:inf psychic","càc"],
  ["Falcon","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Falcon","Pulse Laser","T","3",3,9,2,"D6","","48\""],
  ["Falcon","Scatter Laser","T","6",3,5,0,"1","sust:1","36\""],
  ["Falcon","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Falcon","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Falcon","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Falcon","➤ Missile Launcher - Starshot","T","1",3,10,2,"D6","","48\""],
  ["Falcon","➤ Missile Launcher - Sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["Falcon","Wraithbone hull","C","3",4,6,0,"1","","càc"],
  ["Farseer","Eldritch Storm","T","D6",3,6,2,"D3","blast psychic","24\""],
  ["Farseer","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Farseer","Singing Spear (tir)","T","1",2,9,0,"3","assault psychic","12\""],
  ["Farseer","Singing Spear (càc)","C","2",2,3,0,"3","psychic","càc"],
  ["Farseer","Witchblade","C","2",2,3,0,"2","anti:2:inf psychic","càc"],
  ["Farseer Skyrunner","Eldritch Storm","T","D6",3,6,2,"D3","blast psychic","24\""],
  ["Farseer Skyrunner","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Farseer Skyrunner","Singing Spear (tir)","T","1",3,9,0,"3","assault psychic","12\""],
  ["Farseer Skyrunner","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Farseer Skyrunner","Singing Spear (càc)","C","2",2,3,0,"3","psychic","càc"],
  ["Farseer Skyrunner","Witchblade","C","2",2,3,0,"2","anti:2:inf psychic","càc"],
  ["Fire Dragons","Dragon Fusion Gun","T","1",3,9,4,"D6","assault melta:3","12\""],
  ["Fire Dragons","Dragon Fusion Pistol","T","1",3,9,4,"D6","assault melta:3 pistol","6\""],
  ["Fire Dragons","Dragon's Breath Flamer","T","D6+2",0,6,2,"1","assault ignorescover torrent","12\""],
  ["Fire Dragons","Exarch's Dragon Fusion Gun","T","1",3,9,4,"D6","assault melta:6","12\""],
  ["Fire Dragons","Firepike","T","1",3,12,4,"D6","assault melta:3","18\""],
  ["Fire Dragons","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Fire Dragons","Dragon Axe","C","3",3,6,4,"D6","","càc"],
  ["Fire Prism","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Fire Prism","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Fire Prism","➤ Prism Cannon - dispersed pulse","T","2D6",3,6,2,"2","blast","60\""],
  ["Fire Prism","➤ Prism Cannon - focused lances","T","2",3,18,4,"6","","60\""],
  ["Fire Prism","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Firestorm","Firestorm Scatter Laser","T","16",3,5,0,"1","anti:2:vol","36\""],
  ["Firestorm","Shuriken Cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Firestorm","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Firestorm","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Fuegan","➤ Searsong - Beam","T","3",2,8,3,"2","assault melta:1 sust:2","12\""],
  ["Fuegan","➤ Searsong - Lance","T","1",2,14,4,"D6","assault melta:6","18\""],
  ["Fuegan","The Fire Axe","C","6",2,5,4,"3","","càc"],
  ["Guardian Defenders","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Guardian Defenders","Scatter Laser","T","6",3,5,0,"1","sust:1","36\""],
  ["Guardian Defenders","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Guardian Defenders","Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Guardian Defenders","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Guardian Defenders","➤ Missile Launcher - Starshot","T","1",3,10,2,"D6","","48\""],
  ["Guardian Defenders","➤ Missile Launcher - Sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["Guardian Defenders","Close Combat Weapon","C","1",3,3,0,"1","","càc"],
  ["Hemlock Wraithfighter","Heavy D-Scythe","T","D6",4,12,4,"2","blast","18\""],
  ["Hemlock Wraithfighter","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Hornet","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Hornet","Hornet Pulse Laser","T","2",3,9,2,"D3","","36\""],
  ["Hornet","Scatter Laser","T","6",3,5,0,"1","","36\""],
  ["Hornet","Shuriken Cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Hornet","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Hornet","➤ Aeldari Missile Launcher - Starshot","T","1",3,10,2,"D6","","48\""],
  ["Hornet","➤ Aeldari Missile Launcher - Sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["Hornet","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Howling Banshees","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Howling Banshees","Triskele (tir)","T","3",3,3,1,"1","assault anti:3:inf","12\""],
  ["Howling Banshees","Banshee Blade","C","2",2,4,2,"2","anti:3:inf","càc"],
  ["Howling Banshees","Executioner","C","3",2,6,3,"3","anti:3:inf","càc"],
  ["Howling Banshees","Mirrorswords","C","4",2,4,2,"2","anti:3:inf","càc"],
  ["Howling Banshees","Triskele (càc)","C","6",2,3,1,"1","anti:3:inf","càc"],
  ["Illic Nightspear","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Illic Nightspear","Voidbringer","T","1",2,6,3,"3","dev heavy precision","48\""],
  ["Illic Nightspear","Aeldari power sword","C","4",2,4,2,"1","","càc"],
  ["Irillyth","Spear of Starlight (tir)","T","3",3,8,2,"4","","24\""],
  ["Irillyth","Spear of Starlight (càc)","C","4",3,5,2,"1","","càc"],
  ["Jain Zar","Silent Death","T","6",2,6,2,"1","assault","12\""],
  ["Jain Zar","Blade of Destruction","C","8",2,6,3,"2","anti:3:inf","càc"],
  ["Karandras","Arhra's Bane (tir)","T","2",2,5,1,"2","assault pistol","12\""],
  ["Karandras","Arhra's Bane (càc)","C","5",2,8,3,"2","sust:1","càc"],
  ["Karandras","Isirmathil","C","8",2,6,1,"1","sust:1","càc"],
  ["Kharseth","Dread of the Deep Void","T","D6+2",3,3,2,"1","anti:2:inf blast hazardous ignorescover psychic","24\""],
  ["Kharseth","Waystave","C","3",2,3,0,"3","anti:2:inf psychic","càc"],
  ["Leystalker","Long Rifle","T","2",2,6,2,"3","precision","36\""],
  ["Leystalker","Drakesteed Fangs and Talons","C","3",3,5,1,"1","extra","càc"],
  ["Leystalker","Hunting Blades","C","2",3,3,1,"1","","càc"],
  ["Lhykhis","Brood Twain","T","D6+3",0,6,2,"1","ignorescover torrent twin","12\""],
  ["Lhykhis","Spider's Fangs","C","5",2,4,2,"1","extra lethal","càc"],
  ["Lhykhis","Weaverender","C","5",2,6,2,"2","lethal","càc"],
  ["Lynx","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Lynx","Lynx Pulsar","T","4",3,16,3,"D6","assault","48\""],
  ["Lynx","Scatter Laser","T","6",3,5,0,"1","","36\""],
  ["Lynx","Shuriken Cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Lynx","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Lynx","➤ Aeldari missile launcher - starshot","T","1",3,10,2,"D6","","48\""],
  ["Lynx","➤ Aeldari missile launcher - sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["Lynx","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Maugan Ra","Maugetar (tir)","T","6",2,7,2,"2","dev ignorescover","36\""],
  ["Maugan Ra","Maugetar (càc)","C","5",2,6,2,"2","","càc"],
  ["Night Spinner","Doomweaver","T","D6+3",3,7,1,"2","blast indirect","48\""],
  ["Night Spinner","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Night Spinner","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Night Spinner","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Nightwing","Twin Bright Lance","T","1",3,12,3,"D6+2","twin","36\""],
  ["Nightwing","Twin Shuriken Cannon","T","3",3,6,1,"2","sust:1 twin","24\""],
  ["Nightwing","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Phantom Titan","D-bombard","T","D6",3,20,4,"2D6","blast dev","72\""],
  ["Phantom Titan","Phantom pulsar","T","8",3,18,4,"6","","120\""],
  ["Phantom Titan","Phantom starcannon","T","4",3,8,3,"2","","36\""],
  ["Phantom Titan","Pulse laser","T","3",3,9,2,"D6","","48\""],
  ["Phantom Titan","Voidstorm missile launcher","T","2D6",3,8,3,"2","","48\""],
  ["Phantom Titan","Phantom feet","C","4",3,12,2,"4","","càc"],
  ["Phantom Titan","➤ Wraith glaive - strike","C","6",3,18,4,"12","","càc"],
  ["Phantom Titan","➤ Wraith glaive - sweep","C","12",3,8,3,"4","","càc"],
  ["Phoenix","Phoenix missile array","T","D6",3,6,1,"2","blast","48\""],
  ["Phoenix","Phoenix pulse laser","T","4",3,10,2,"D6","","48\""],
  ["Phoenix","Twin shuriken cannon","T","3",3,6,1,"2","sust:1 twin","24\""],
  ["Phoenix","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Prince Yriel","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Prince Yriel","The Eye of Wrath","T","3",2,6,2,"2","assault pistol","6\""],
  ["Prince Yriel","The Spear of Twilight","C","5",2,7,3,"3","lance","càc"],
  ["Rangers","Long rifle","T","1",3,4,1,"2","heavy precision","36\""],
  ["Rangers","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Rangers","Close Combat Weapon","C","1",3,3,0,"1","","càc"],
  ["Revenant Titan","Cloudburst missile launcher","T","2D6",3,8,2,"2","blast","36\""],
  ["Revenant Titan","Revenant Pulsar","T","6",3,14,3,"4","assault","60\""],
  ["Revenant Titan","Sonic Lance","T","D6+6",0,8,3,"2","anti:4:mon anti:4:veh assault torrent","18\""],
  ["Revenant Titan","Revenant feet","C","8",3,10,1,"3","","càc"],
  ["Scorpion","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Scorpion","Scatter Laser","T","6",3,5,0,"1","","36\""],
  ["Scorpion","Shuriken Cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Scorpion","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Scorpion","Twin Scorpion Pulsar","T","6",3,18,3,"5","twin","60\""],
  ["Scorpion","➤ Aeldari missile launcher - starshot","T","1",3,10,2,"D6","","48\""],
  ["Scorpion","➤ Aeldari missile launcher - sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["Scorpion","Wraithbone Hull","C","6",4,6,0,"1","","càc"],
  ["Shadow Spectres","➤ Prism Rifle - dispersed","T","D6",3,4,1,"1","blast","18\""],
  ["Shadow Spectres","➤ Prism Rifle - focused","T","1",3,6,2,"3","","24\""],
  ["Shadow Spectres","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Shadow Weaver Platform","Shadow weaver","T","D6+2",3,6,1,"1","blast indirect","48\""],
  ["Shadow Weaver Platform","Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Shadow Weaver Platform","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Shadowseer","Neuro Disruptor","T","1",2,4,2,"1","anti:2:inf assault pistol","12\""],
  ["Shadowseer","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Shadowseer","Miststave","C","4",2,5,1,"D3","psychic","càc"],
  ["Shining Spears","Laser Lance (tir)","T","1",3,6,2,"3","assault","6\""],
  ["Shining Spears","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Shining Spears","Star Lance (tir)","T","1",3,9,3,"3","assault","6\""],
  ["Shining Spears","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Shining Spears","Laser Lance (càc)","C","3",3,5,2,"3","anti:3:mon anti:3:veh lance","càc"],
  ["Shining Spears","Paragon Sabre","C","6",3,5,2,"2","","càc"],
  ["Shining Spears","Star Lance (càc)","C","4",3,5,3,"3","anti:3:mon anti:3:veh lance","càc"],
  ["Shroud Runners","Long rifle","T","1",2,4,1,"2","precision","36\""],
  ["Shroud Runners","Scatter Laser","T","6",3,5,0,"1","sust:1","36\""],
  ["Shroud Runners","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Shroud Runners","Close Combat Weapon","C","1",3,3,0,"1","","càc"],
  ["Skathach Wraithknight","Inferno Lance","T","4",3,12,4,"D6","melta:2","24\""],
  ["Skathach Wraithknight","Scatter Laser","T","6",3,5,0,"1","","36\""],
  ["Skathach Wraithknight","Shuriken Cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Skathach Wraithknight","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Skathach Wraithknight","➤ Deathshroud Cannon - Dispersed","T","3D6",3,6,1,"1","blast dev","12\""],
  ["Skathach Wraithknight","➤ Deathshroud Cannon - Focused","T","D6",3,10,3,"2","blast dev","48\""],
  ["Skathach Wraithknight","Titanic Feet","C","5",3,8,1,"2","","càc"],
  ["Skyweavers","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Skyweavers","Skyweaver Haywire Cannon","T","2",3,3,1,"3","anti:4:veh dev","24\""],
  ["Skyweavers","Star Bolas","T","D3",3,7,2,"2","","12\""],
  ["Skyweavers","Close Combat Weapon","C","4",3,3,0,"1","","càc"],
  ["Skyweavers","Zephyrglaive","C","4",3,6,2,"2","","càc"],
  ["Solitaire","Solitaire Weapons","C","9",2,6,2,"2","precision","càc"],
  ["Spiritseer","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Spiritseer","Witch Staff","C","2",2,3,0,"D3","anti:2:inf psychic","càc"],
  ["Starfangs","Disintegrator Cannon","T","3",3,6,3,"2","assault","36\""],
  ["Starfangs","Starfang Grenade Launcher","T","D3",3,6,3,"2","assault blast","36\""],
  ["Starfangs","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Starweaver","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Starweaver","Close Combat Weapon","C","4",3,3,0,"1","","càc"],
  ["Stonesinger","Solar Carbine","T","2",3,4,0,"1","rf:2","18\""],
  ["Stonesinger","Song of Waning","T","3",3,4,2,"3","psychic","24\""],
  ["Stonesinger","Venomcrest Spit","T","3",0,3,2,"2","torrent","12\""],
  ["Stonesinger","Drakesteed Fangs and Talons","C","3",3,5,1,"1","extra","càc"],
  ["Stonesinger","Stone Stave","C","3",3,3,1,"2","psychic","càc"],
  ["Storm Guardians","Flamer","T","D6",0,4,0,"1","assault ignorescover torrent","12\""],
  ["Storm Guardians","Fusion gun","T","1",3,8,4,"D6","assault melta:2","12\""],
  ["Storm Guardians","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Storm Guardians","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Storm Guardians","Power sword","C","2",3,4,2,"1","","càc"],
  ["Striking Scorpions","Chainsabres (tir)","T","1",3,4,1,"1","assault pistol twin","12\""],
  ["Striking Scorpions","Shuriken pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Striking Scorpions","Biting blade","C","4",3,6,3,"1","sust:1","càc"],
  ["Striking Scorpions","Chainsabres (càc)","C","5",3,4,1,"1","sust:1 twin","càc"],
  ["Striking Scorpions","Scorpion chainsword","C","4",3,4,1,"1","sust:1","càc"],
  ["Striking Scorpions","Scorpion's claw","C","3",3,8,2,"2","","càc"],
  ["Swooping Hawks","Exarch's Lasblaster","T","4",3,5,1,"1","assault lethal","24\""],
  ["Swooping Hawks","Hawk's Talon","T","2",3,6,2,"2","lethal","24\""],
  ["Swooping Hawks","Lasblaster","T","4",3,4,0,"1","assault lethal","24\""],
  ["Swooping Hawks","Scatter Laser","T","6",3,5,0,"1","sust:1","36\""],
  ["Swooping Hawks","Sunpistol","T","2",3,4,0,"1","assault lethal pistol","12\""],
  ["Swooping Hawks","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Swooping Hawks","Power Sword","C","5",3,4,2,"1","","càc"],
  ["The Visarch","➤ Asu-var - duellist stance","C","6",2,5,2,"2","dev precision","càc"],
  ["The Visarch","➤ Asu-var - mythic stance","C","4",2,3,4,"3","precision","càc"],
  ["The Visarch","➤ Asu-var - quicksilver stance","C","8",2,4,1,"1","sust:2","càc"],
  ["The Yncarne","Swirling soul energy","T","D6+3",0,7,1,"D3","ignorescover psychic torrent","12\""],
  ["The Yncarne","➤ Vilith-zhar - Strike","C","5",2,12,4,"D6+1","","càc"],
  ["The Yncarne","➤ Vilith-zhar - Sweep","C","10",2,6,4,"1","","càc"],
  ["Troupe","Fusion Pistol","T","1",3,8,4,"D6","assault melta:2 pistol","6\""],
  ["Troupe","Neuro Disruptor","T","1",3,4,2,"1","anti:2:inf assault pistol","12\""],
  ["Troupe","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Troupe","Harlequin's Blade","C","5",3,3,1,"1","dev","càc"],
  ["Troupe","Harlequin's Special Weapon","C","4",3,4,1,"1","dev","càc"],
  ["Troupe","Power sword","C","5",3,4,2,"1","dev","càc"],
  ["Troupe Master","Fusion Pistol","T","1",2,8,4,"D6","assault melta:2 pistol","6\""],
  ["Troupe Master","Neuro Disruptor","T","1",2,4,2,"1","anti:2:inf assault pistol","12\""],
  ["Troupe Master","Shuriken Pistol","T","1",2,4,1,"1","assault pistol","12\""],
  ["Troupe Master","Harlequin's Special Weapon","C","6",2,4,1,"2","dev","càc"],
  ["Troupe Master","Troupe Master's Blade","C","5",2,5,2,"2","dev","càc"],
  ["Vampire Hunter","Scatter Laser","T","6",3,5,0,"1","","36\""],
  ["Vampire Hunter","Twin Pulse Laser","T","3",3,9,2,"D6","twin","48\""],
  ["Vampire Hunter","Twin Vampire Pulsar","T","3",3,12,3,"4","twin","60\""],
  ["Vampire Hunter","Wraithbone Hull","C","6",4,6,0,"1","","càc"],
  ["Vampire Raider","Scatter Laser","T","6",3,5,0,"1","","36\""],
  ["Vampire Raider","Twin Pulse Laser","T","3",3,9,2,"D6","twin","48\""],
  ["Vampire Raider","Wraithbone Hull","C","6",4,6,0,"1","","càc"],
  ["Vibro Cannon Platform","Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Vibro Cannon Platform","Vibro Cannon","T","D6",3,9,1,"2","","48\""],
  ["Vibro Cannon Platform","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Voidweaver","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Voidweaver","Voidweaver Haywire Cannon","T","3",3,4,1,"3","anti:4:veh dev","24\""],
  ["Voidweaver","➤ Prismatic Cannon - dispersed pulse","T","2D6",3,4,0,"1","blast","24\""],
  ["Voidweaver","➤ Prismatic Cannon - focused lances","T","2",3,12,3,"4","","24\""],
  ["Voidweaver","Close Combat Weapon","C","4",3,3,0,"1","","càc"],
  ["War Walkers","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["War Walkers","Scatter Laser","T","6",3,5,0,"1","sust:1","36\""],
  ["War Walkers","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["War Walkers","Starcannon","T","2",3,8,3,"2","","36\""],
  ["War Walkers","➤ Missile Launcher - Starshot","T","1",3,10,2,"D6","","48\""],
  ["War Walkers","➤ Missile Launcher - Sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["War Walkers","War Walker feet","C","3",3,5,0,"1","","càc"],
  ["Warlock","Destructor","T","D6",0,5,1,"1","psychic torrent","12\""],
  ["Warlock","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Warlock","Singing Spear (tir)","T","1",3,9,0,"3","assault psychic","12\""],
  ["Warlock","Singing Spear (càc)","C","2",3,3,0,"3","psychic","càc"],
  ["Warlock","Witchblade","C","2",3,3,0,"2","anti:2:inf psychic","càc"],
  ["Warlock Conclave","Destructor","T","D6",0,5,1,"1","psychic torrent","12\""],
  ["Warlock Conclave","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Warlock Conclave","Singing Spear (tir)","T","1",3,9,0,"3","assault psychic","12\""],
  ["Warlock Conclave","Singing Spear (càc)","C","2",3,3,0,"3","psychic","càc"],
  ["Warlock Conclave","Witchblade","C","2",3,3,0,"2","anti:2:inf psychic","càc"],
  ["Warlock Skyrunners","Destructor","T","D6",0,5,1,"1","psychic torrent","12\""],
  ["Warlock Skyrunners","Shuriken Pistol","T","1",3,4,1,"1","assault pistol","12\""],
  ["Warlock Skyrunners","Singing Spear (tir)","T","1",3,9,0,"3","assault psychic","12\""],
  ["Warlock Skyrunners","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Warlock Skyrunners","Singing Spear (càc)","C","2",3,3,0,"3","psychic","càc"],
  ["Warlock Skyrunners","Witchblade","C","2",3,3,0,"2","anti:2:inf psychic","càc"],
  ["Warp Hunter","Shuriken Cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Warp Hunter","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Warp Hunter","➤ D-Flail - blast","T","D3",3,12,4,"3","blast dev","24\""],
  ["Warp Hunter","➤ D-Flail - rift","T","D3",0,12,4,"3","dev torrent","12\""],
  ["Warp Hunter","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Warp Spiders","Death Weavers","T","D6",0,4,1,"1","ignorescover torrent twin","6\""],
  ["Warp Spiders","Death spinner","T","D6",0,4,1,"1","ignorescover torrent","12\""],
  ["Warp Spiders","Exarch's Deathspinner","T","D6",0,6,2,"1","ignorescover torrent","12\""],
  ["Warp Spiders","Spinneret Rifle","T","D6",0,5,1,"1","ignorescover torrent","18\""],
  ["Warp Spiders","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Warp Spiders","Powerblade Array","C","10",3,4,2,"1","lethal twin","càc"],
  ["Warp Spiders","Powerblades","C","5",3,4,2,"1","lethal twin","càc"],
  ["Wasp Assault Walker","Bright Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Wasp Assault Walker","Scatter Laser","T","6",3,5,0,"1","","36\""],
  ["Wasp Assault Walker","Shuriken Cannon","T","3",3,6,1,"2","sust:1","24\""],
  ["Wasp Assault Walker","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Wasp Assault Walker","➤ Aeldari missile launcher - starshot","T","1",3,10,2,"D6","","48\""],
  ["Wasp Assault Walker","➤ Aeldari missile launcher - sunburst","T","D6",3,4,1,"1","blast","48\""],
  ["Wasp Assault Walker","Wasp feet","C","3",3,5,0,"1","","càc"],
  ["Wave Serpent","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Wave Serpent","Twin Bright Lance","T","1",3,12,3,"D6+2","twin","36\""],
  ["Wave Serpent","Twin Scatter Laser","T","6",3,5,0,"1","sust:1 twin","36\""],
  ["Wave Serpent","Twin Shuriken Cannon","T","3",3,6,1,"2","lethal twin","24\""],
  ["Wave Serpent","Twin Shuriken Catapult","T","2",3,4,1,"1","assault","18\""],
  ["Wave Serpent","Twin Starcannon","T","2",3,8,3,"2","twin","36\""],
  ["Wave Serpent","➤ Twin Aeldari Missile Launcher - Starshot","T","1",3,10,2,"D6","twin","48\""],
  ["Wave Serpent","➤ Twin Aeldari Missile Launcher - Sunburst","T","D6",3,4,1,"1","blast twin","48\""],
  ["Wave Serpent","Wraithbone Hull","C","3",4,6,0,"1","","càc"],
  ["Windriders","Scatter laser","T","6",3,5,0,"1","sust:1","36\""],
  ["Windriders","Shuriken cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Windriders","Twin shuriken catapult","T","2",3,4,1,"1","assault twin","18\""],
  ["Windriders","Close combat weapon","C","3",3,3,0,"1","","càc"],
  ["Wraithblades","Ghostaxe","C","3",4,7,2,"2","","càc"],
  ["Wraithblades","Ghostswords","C","5",4,5,2,"2","","càc"],
  ["Wraithguard","D-Scythe","T","D6",0,7,3,"1","torrent","12\""],
  ["Wraithguard","Wraithcannon","T","1",4,14,4,"D6+1","","18\""],
  ["Wraithguard","Close Combat Weapon","C","3",4,5,0,"1","","càc"],
  ["Wraithknight","Heavy Wraithcannon","T","D3",3,20,4,"2D6","dev","36\""],
  ["Wraithknight","Scatter Laser","T","6",3,5,0,"1","sust:1","36\""],
  ["Wraithknight","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Wraithknight","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Wraithknight","Suncannon","T","D6+4",3,10,3,"3","blast","48\""],
  ["Wraithknight","Titanic Feet","C","5",3,8,1,"2","","càc"],
  ["Wraithknight with Ghostglaive","Heavy Wraithcannon","T","D3",3,20,4,"2D6","dev","36\""],
  ["Wraithknight with Ghostglaive","Scatter Laser","T","6",3,5,0,"1","sust:1","36\""],
  ["Wraithknight with Ghostglaive","Shuriken Cannon","T","3",3,6,1,"2","lethal","24\""],
  ["Wraithknight with Ghostglaive","Starcannon","T","2",3,8,3,"2","","36\""],
  ["Wraithknight with Ghostglaive","➤ Titanic Ghostglaive - Strike","C","5",3,16,3,"6","","càc"],
  ["Wraithknight with Ghostglaive","➤ Titanic Ghostglaive - Sweep","C","15",3,8,2,"2","","càc"],
  ["Wraithlord","Bright Lance","T","1",4,12,3,"D6+2","","36\""],
  ["Wraithlord","Flamer","T","D6",0,4,0,"1","assault ignorescover torrent","12\""],
  ["Wraithlord","Scatter Laser","T","6",4,5,0,"1","sust:1","36\""],
  ["Wraithlord","Shuriken Cannon","T","3",4,6,1,"2","lethal","24\""],
  ["Wraithlord","Shuriken Catapult","T","2",4,4,1,"1","assault","18\""],
  ["Wraithlord","Starcannon","T","2",4,8,3,"2","","36\""],
  ["Wraithlord","➤ Aeldari Missile Launcher - Starshot","T","1",4,10,2,"D6","","48\""],
  ["Wraithlord","➤ Aeldari Missile Launcher - Sunburst","T","D6",4,4,1,"1","blast","48\""],
  ["Wraithlord","Wraithbone Fists","C","4",4,7,2,"2","","càc"],
  ["Wraithlord","➤ Ghostglaive - Strike","C","4",4,10,3,"D6+1","","càc"],
  ["Wraithlord","➤ Ghostglaive - Sweep","C","8",4,7,2,"2","","càc"],
  ["Wraithseer","Bright Lance","T","1",4,12,3,"D6+2","","36\""],
  ["Wraithseer","Destructor","T","D6",0,5,1,"1","psychic torrent","12\""],
  ["Wraithseer","Scatter Laser","T","6",4,5,0,"1","","36\""],
  ["Wraithseer","Shuriken Cannon","T","3",4,6,1,"2","sust:1","24\""],
  ["Wraithseer","Starcannon","T","2",4,8,3,"2","","36\""],
  ["Wraithseer","Wraithseer D-Cannon","T","1",4,14,4,"D6","dev","24\""],
  ["Wraithseer","➤ Aeldari Missile Launcher - Starshot","T","1",4,10,2,"D6","","48\""],
  ["Wraithseer","➤ Aeldari Missile Launcher - Sunburst","T","D6",4,4,1,"1","blast","48\""],
  ["Wraithseer","➤ Ghostspear - Strike","C","4",4,10,2,"3","anti:2:inf precision psychic","càc"],
  ["Wraithseer","➤ Ghostspear - Sweep","C","12",4,7,1,"1","anti:2:inf psychic","càc"],
  ["Ynnari Archon","Blast Pistol","T","1",2,8,3,"D3","pistol","6\""],
  ["Ynnari Archon","Splinter Pistol","T","1",2,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Ynnari Archon","Huskblade","C","5",2,3,2,"2","anti:3:inf","càc"],
  ["Ynnari Incubi","Klaive","C","3",3,4,2,"2","","càc"],
  ["Ynnari Incubi","➤ Demiklaives - Dual Blades","C","6",3,4,1,"1","twin","càc"],
  ["Ynnari Incubi","➤ Demiklaives - Single Blade","C","3",3,4,2,"2","","càc"],
  ["Ynnari Kabalite Warriors","Blast Pistol","T","1",3,8,3,"D3","pistol","6\""],
  ["Ynnari Kabalite Warriors","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Ynnari Kabalite Warriors","Dark Lance","T","1",4,12,3,"D6+2","heavy","36\""],
  ["Ynnari Kabalite Warriors","Shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Ynnari Kabalite Warriors","Splinter Cannon","T","3",4,3,1,"2","anti:3:inf heavy sust:1","36\""],
  ["Ynnari Kabalite Warriors","Splinter Pistol","T","1",2,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Ynnari Kabalite Warriors","Splinter Rifle","T","2",3,2,0,"1","anti:3:inf assault","24\""],
  ["Ynnari Kabalite Warriors","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Ynnari Kabalite Warriors","Sybarite Weapon","C","3",3,3,1,"1","anti:3:inf","càc"],
  ["Ynnari Raider","Dark Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Ynnari Raider","Disintegrator Cannon","T","3",3,5,2,"2","","36\""],
  ["Ynnari Raider","Bladevanes","C","3",4,6,0,"1","","càc"],
  ["Ynnari Reavers","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Ynnari Reavers","Heat Lance","T","1",3,14,4,"D6","assault melta:3","18\""],
  ["Ynnari Reavers","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Ynnari Reavers","Splinter Rifle","T","2",3,2,0,"1","anti:3:inf assault","24\""],
  ["Ynnari Reavers","Agonizer","C","4",3,3,1,"1","anti:3:inf","càc"],
  ["Ynnari Reavers","Bladevanes","C","3",3,4,0,"1","","càc"],
  ["Ynnari Succubus","Blast Pistol","T","1",2,8,3,"D3","pistol","6\""],
  ["Ynnari Succubus","Splinter Pistol","T","1",2,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Ynnari Succubus","Succubus Weapons","C","6",2,3,2,"1","anti:3:inf","càc"],
  ["Ynnari Venom","Splinter Cannon","T","3",3,3,1,"2","anti:3:inf sust:1","36\""],
  ["Ynnari Venom","Twin Splinter Rifle","T","2",3,2,0,"1","anti:3:inf assault rf:1","24\""],
  ["Ynnari Venom","Bladevanes","C","3",4,5,0,"1","","càc"],
  ["Ynnari Wyches","Blast Pistol","T","1",3,8,3,"D3","pistol","6\""],
  ["Ynnari Wyches","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Ynnari Wyches","Hekatarii Blade","C","3",3,3,1,"1","","càc"],
  ["Yvraine","Storm of Whispers","T","D6+3",2,2,2,"1","anti:2:inf dev psychic","12\""],
  ["Yvraine","Kha-vir","C","5",2,4,3,"2","dev","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Amallyn Shadowguide","Epic Hero"],
  ["Asurmen","Epic Hero"],
  ["Autarch","Personnage"],
  ["Autarch Skyrunner","Personnage"],
  ["Autarch Wayleaper","Personnage"],
  ["Avatar of Khaine","Epic Hero"],
  ["Baharroth","Epic Hero"],
  ["Bonesinger","Personnage"],
  ["Clanblade","Personnage"],
  ["Cobra","Véhicule"],
  ["Corsair Cloud Dancer Band","Monté"],
  ["Corsair Reaver Band","Infanterie"],
  ["Corsair Skyreavers","Infanterie"],
  ["Corsair Voidreavers","Battleline"],
  ["Corsair Voidscarred","Infanterie"],
  ["Crimson Hunter","Véhicule"],
  ["D-Cannon Platform","Infanterie"],
  ["Dark Reapers","Infanterie"],
  ["Death Jester","Personnage"],
  ["Dire Avengers","Infanterie"],
  ["Dragon Knights","Monté"],
  ["Eldrad Ulthran","Epic Hero"],
  ["Falcon","Véhicule"],
  ["Farseer","Personnage"],
  ["Farseer Skyrunner","Personnage"],
  ["Fire Dragons","Infanterie"],
  ["Fire Prism","Véhicule"],
  ["Firestorm","Véhicule"],
  ["Fuegan","Epic Hero"],
  ["Guardian Defenders","Battleline"],
  ["Hemlock Wraithfighter","Véhicule"],
  ["Hornet","Véhicule"],
  ["Howling Banshees","Infanterie"],
  ["Illic Nightspear","Epic Hero"],
  ["Irillyth","Epic Hero"],
  ["Jain Zar","Epic Hero"],
  ["Karandras","Epic Hero"],
  ["Kharseth","Epic Hero"],
  ["Leystalker","Personnage"],
  ["Lhykhis","Epic Hero"],
  ["Lynx","Véhicule"],
  ["Maugan Ra","Epic Hero"],
  ["Night Spinner","Véhicule"],
  ["Nightwing","Véhicule"],
  ["Phantom Titan","Monstre"],
  ["Phoenix","Véhicule"],
  ["Prince Yriel","Epic Hero"],
  ["Rangers","Infanterie"],
  ["Revenant Titan","Monstre"],
  ["Scorpion","Véhicule"],
  ["Shadow Spectres","Infanterie"],
  ["Shadow Weaver Platform","Infanterie"],
  ["Shadowseer","Personnage"],
  ["Shining Spears","Monté"],
  ["Shroud Runners","Monté"],
  ["Skathach Wraithknight","Monstre"],
  ["Skyweavers","Monté"],
  ["Solitaire","Epic Hero"],
  ["Spiritseer","Personnage"],
  ["Starfangs","Véhicule"],
  ["Starweaver","Véhicule"],
  ["Stonesinger","Personnage"],
  ["Storm Guardians","Battleline"],
  ["Striking Scorpions","Infanterie"],
  ["Swooping Hawks","Infanterie"],
  ["The Visarch","Epic Hero"],
  ["The Yncarne","Epic Hero"],
  ["Troupe","Infanterie"],
  ["Troupe Master","Personnage"],
  ["Vampire Hunter","Véhicule"],
  ["Vampire Raider","Véhicule"],
  ["Vibro Cannon Platform","Infanterie"],
  ["Voidweaver","Véhicule"],
  ["War Walkers","Véhicule"],
  ["Warlock","Personnage"],
  ["Warlock Conclave","Infanterie"],
  ["Warlock Skyrunners","Monté"],
  ["Warp Hunter","Véhicule"],
  ["Warp Spiders","Infanterie"],
  ["Wasp Assault Walker","Véhicule"],
  ["Wave Serpent","Véhicule"],
  ["Webway Gate","Fortification"],
  ["Windriders","Monté"],
  ["Wraithblades","Infanterie"],
  ["Wraithguard","Infanterie"],
  ["Wraithknight","Monstre"],
  ["Wraithknight with Ghostglaive","Monstre"],
  ["Wraithlord","Monstre"],
  ["Wraithseer","Monstre"],
  ["Ynnari Archon","Personnage"],
  ["Ynnari Incubi","Infanterie"],
  ["Ynnari Kabalite Warriors","Battleline"],
  ["Ynnari Raider","Véhicule"],
  ["Ynnari Reavers","Monté"],
  ["Ynnari Succubus","Personnage"],
  ["Ynnari Venom","Véhicule"],
  ["Ynnari Wyches","Battleline"],
  ["Yvraine","Epic Hero"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Asurmen": [
  "Dire Avengers"
 ],
 "Autarch": [
  "Dark Reapers",
  "Dire Avengers",
  "Fire Dragons",
  "Guardian Defenders",
  "Howling Banshees",
  "Storm Guardians",
  "Striking Scorpions"
 ],
 "Autarch Skyrunner": [
  "Corsair Cloud Dancer Band",
  "Windriders"
 ],
 "Autarch Wayleaper": [
  "Swooping Hawks",
  "Warp Spiders"
 ],
 "Baharroth": [
  "Swooping Hawks"
 ],
 "Bonesinger": [
  "Wraithblades",
  "Wraithguard",
  "Wraithlord"
 ],
 "Clanblade": [
  "Dragon Knights"
 ],
 "Eldrad Ulthran": [
  "Guardian Defenders",
  "Storm Guardians"
 ],
 "Farseer": [
  "Guardian Defenders",
  "Storm Guardians"
 ],
 "Farseer Skyrunner": [
  "Warlock Skyrunners",
  "Windriders"
 ],
 "Fuegan": [
  "Fire Dragons"
 ],
 "Illic Nightspear": [
  "Rangers"
 ],
 "Irillyth": [
  "Shadow Spectres"
 ],
 "Jain Zar": [
  "Howling Banshees"
 ],
 "Karandras": [
  "Striking Scorpions"
 ],
 "Kharseth": [
  "Corsair Reaver Band",
  "Corsair Voidreavers",
  "Corsair Voidscarred"
 ],
 "Lhykhis": [
  "Warp Spiders"
 ],
 "Maugan Ra": [
  "Dark Reapers"
 ],
 "Prince Yriel": [
  "Corsair Reaver Band",
  "Corsair Voidreavers",
  "Corsair Voidscarred"
 ],
 "Shadowseer": [
  "Troupe"
 ],
 "Troupe Master": [
  "Troupe"
 ],
 "Ynnari Archon": [
  "Ynnari Incubi",
  "Ynnari Kabalite Warriors"
 ],
 "Ynnari Succubus": [
  "Ynnari Wyches"
 ],
 "Yvraine": [
  "Corsair Reaver Band",
  "Corsair Voidreavers",
  "Corsair Voidscarred",
  "Guardian Defenders",
  "Storm Guardians",
  "Ynnari Incubi",
  "Ynnari Kabalite Warriors",
  "Ynnari Wyches"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Asurmen": [
  [
   "Hand of Asuryan",
   "Once per battle, when this model is selected to shoot, it can use this ability. If it does, until the end of the phase, its Bloody Twins weapon has a Damage characteristic of 3 and the [ANTI-INFANTRY 5+] and [DEVASTATING WOUNDS] abilities."
  ],
  [
   "Tactical Acumen",
   "While this model is leading a unit, in your Shooting phase, after that unit has shot, it can make a Normal move of up to 6\". If it does, until the end of the turn, that unit is not eligible to declare a charge."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Dire Avengers"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Autarch Skyrunner": [
  [
   "Path of Command",
   "Once per battle round, one model from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that usage of that Stratagem by 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Corsair Cloud Dancer Band\n- Windriders"
  ],
  [
   "Ride the WInd",
   "While this model is leading a unit, each time that unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in that unit"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Autarch": [
  [
   "Superlative Strategist",
   "While this model is leading a unit, you can re-roll Advance rolls made for that unit, and you can re-roll any rolls made for that unit while it is performing an Agile Manoeuvre."
  ],
  [
   "Path of Command",
   "Once per battle round, one model from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that usage of that stratagem by 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Dark Reapers\n- Dire Avengers\n- Fire Dragons\n- Guardian Defenders\n- Howling Banshees\n- Storm Guardians\n- Striking Scorpions"
  ],
  [
   "Aspect Training",
   "While this model is leading a Howling Banshees unit, it has the Fights First ability.\nWhile this model is leading a Striking Scorpions unit, it has the Infiltrators, Scouts 7\" and Stealth abilities."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Autarch Wayleaper": [
  [
   "Path of Command",
   "Once per battle round, one model from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that usage of that stratagem by 1CP."
  ],
  [
   "Indomitable Strength of Will",
   "While this model is leading a unit, each time you spend a Battle Focus token to enable that unit to perform an Agile Manoeuvre, roll one D6: on a 3+ you gain 1 Battle Focus token."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Swooping Hawks\n- Warp Spiders"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Avatar of Khaine": [
  [
   "Molten Form",
   "Each time an attack is allocated to this model, halve the Damage characteristic of that attack."
  ],
  [
   "The Bloody Handed (Aura)",
   "While a friendly Aeldari unit is within 6\" of this model, add 1 to Advance and Charge rolls made for that unit."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Baharroth": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Swooping Hawks"
  ],
  [
   "Cry of the Wind",
   "Each time this model is set-up on the battlefield, until the end of the turn, each time this model makes a ranged attack, a successful unmodified Hit roll scores a Critical Hit."
  ],
  [
   "Cloudstrider",
   "While this model is leading a unit, at the end of your opponent’s turn, if that unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves. In addition, while this model is leading a unit, when that unit is set up on the battlefield using the Deep Strike ability, in your Movement phase, it can use this ability. If it does, that unit can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy models, but until the end of the turn, it is not eligible to declare a charge."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Corsair Voidreavers": [
  [
   "Reavers of the Void",
   "Each time a model in this unit makes an attack, re-roll a Hit roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Hit roll instead."
  ],
  [
   "Mistshield",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Corsair Voidscarred": [
  [
   "Piratical Raiders",
   "At the start of the battle, select one unit from your opponent’s army. Each time a model in this unit makes an attack that targets that unit, that attack has the [LETHAL HITS] and [PRECISION] abilities."
  ],
  [
   "Channeler stones",
   "Once per turn, the first time a saving throw is failed for the bearer’s unit, change the Damage characteristic of that attack to 0."
  ],
  [
   "Faolchú",
   "Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability."
  ],
  [
   "Mistshield",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Crimson Hunter": [
  [
   "Skyhunter",
   "Each time this model makes a ranged attack that targets a unit that can Fly, add 1 to the Hit roll and add 1 to the Wound roll."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Dark Reapers": [
  [
   "Inescapable Accuracy",
   "Each time a model in this unit makes a ranged attack, you can ignore any or all modifiers to that attack’s Ballistic Skill characteristic and any or all modifiers to the Hit roll."
  ],
  [
   "Aspect Shrine Token",
   "Once per battle for each Aspect Shrine token this unit has, you can change the result of one Hit roll or one Wound roll made for a model in this unit (excluding CHARACTER models) to an unmodified 6.\n\nDesigner's Note: Place an Aspect Shrine token next to the unit for each Aspect Shrine token it has, removing one each time this ability is used."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Death Jester": [
  [
   "Death is Not Enough",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding Monsters and Vehicles) hit by one or more of those attacks. That enemy unit must take a Battle-shock test. If one or more of those attacks destroyed a model in that enemy unit, subtract 1 from that test."
  ],
  [
   "Cruel Amusement",
   "In your Shooting phase, each time this model is selected to shoot, select one of the abilities below. Until the end of the phase, this model’s Shrieker Cannon has that ability:\n■ [IGNORES COVER]\n■ [PRECISION]\n■ [SUSTAINED HITS 3]"
  ],
  [
   "Flip Belt",
   "Each time the bearer's unit makes a Normal, Advance, Fall Back or Charge move, ignore any vertical distance when determining the total distance the bearer can be moved during that move."
  ],
  [
   "Travelling Players",
   "Unless otherwise stated, you cannot include more than one of this model in your army."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Dire Avengers": [
  [
   "Bladestorm",
   "Ranged weapons equipped by models in this unit have the [Sustained Hits 1] ability while targeting an enemy unit within half range."
  ],
  [
   "Aspect Shrine Token",
   "Once per battle for each Aspect Shrine token this unit has, you can change the result of one Hit roll or one Wound roll made for a model in this unit (excluding CHARACTER models) to an unmodified 6.\n\nDesigner's Note: Place an Aspect Shrine token next to the unit for each Aspect Shrine token it has, removing one each time this ability is used."
  ],
  [
   "Shimmershield",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Eldrad Ulthran": [
  [
   "Diviner of the Futures",
   "At the start of your Command phase, if this model is on the battlefield, you gain 1CP."
  ],
  [
   "Doom (Psychic)",
   "At the end of your Movement phase, select one enemy unit within 18\" of and visible to this model. Until the start of your next Command phase, each time a friendly Aeldari model makes an attack that targets that enemy unit, add 1 to the Wound roll"
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- GUARDIAN DEFENDERS\n- STORM GUARDIANS\n- WARLOCK CONCLAVE\n\nIf this model is not already attached to a unit, you can attach this model to a unit, even if one WARLOCKS unit has already been attached to it."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Falcon": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Farseer": [
  [
   "Branching Fates (Psychic)",
   "While this model is leading a unit, once per phase you can change the result of one Hit roll, one Wound roll, or one Damage roll made for a model in that unit (excluding Support Weapon models) to an unmodified 6."
  ],
  [
   "Guide (Psychic)",
   "At the end of your Movement phase, select one enemy unit within 18\" of and visible to this model. Until the start of your next Command phase, each time a friendly Aeldari model makes an attack that targets that enemy unit, add 1 to the Hit roll. Each unit can only be selected for this ability once per turn."
  ],
  [
   "Leader",
   "This model can be attached to the following units: GUARDIAN DEFENDERS, STORM GUARDIANS, WARLOCK CONCLAVE."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Farseer Skyrunner": [
  [
   "Branching Fates (Psychic)",
   "While this model is leading a unit, once per phase you can change the result of one Hit roll, one Wound roll, or one Damage roll made for a model in that unit to an unmodified 6."
  ],
  [
   "Misfortune (Psychic)",
   "At the end of your Movement phase, select one enemy unit within 18\" of and visible to this model. Until the start of your next Command phase, each time a model in that unit makes an attack, subtract 1 from the Wound roll. Each unit can only be selected for this ability once per turn."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Warlock Skyrunners\n- Windriders"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Fire Dragons": [
  [
   "Assured Destruction",
   "In your Shooting phase, each time a model in this unit makes a ranged attack that targets a Monster or Vehicle unit, you can re-roll the Hit roll, you can re-roll the Wound roll and you can re-roll the Damage roll."
  ],
  [
   "Aspect Shrine Token",
   "Once per battle for each Aspect Shrine token this unit has, you can change the result of one Hit roll or one Wound roll made for a model in this unit (excluding CHARACTER models) to an unmodified 6.\n\nDesigner's Note: Place an Aspect Shrine token next to the unit for each Aspect Shrine token it has, removing one each time this ability is used."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Fire Prism": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Crystal Matrix",
   "Each time this model is selected to shoot, you can re-roll one Hit roll and you can re-roll one Wound roll when resolving those attacks."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Fuegan": [
  [
   "Burning Lance",
   "While this model is leading a unit, add 6\" to the Range characteristic of Melta weapons equipped by models in that unit."
  ],
  [
   "Unquenchable Resolve",
   "The first time this model is destroyed, at the end of the phase, roll one D6. On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with its full wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Fire Dragons"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Guardian Defenders": [
  [
   "Fleet of Foot",
   "This unit can perform the Fade Back Agile Manoeuvre without spending a Battle Focus token to do so. It can do so even if other units have done so in the same phase, and doing so does not prevent other units from performing the same Agile Manoeuvre in the same phase."
  ],
  [
   "Crewed Platform",
   "When the last Guardian Defender model in this unit is destroyed, any remaining Heavy Weapon Platform models in this unit are also destroyed."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Hemlock Wraithfighter": [
  [
   "Mindshock Pod (Aura, Psychic)",
   "While an enemy unit is within 9\" of this model, subtract 1 from Battle-shock and Leadership tests taken for that unit."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Howling Banshees": [
  [
   "Acrobatic",
   "This unit is eligible to declare a charge in a turn in which it Advanced or Fell Back"
  ],
  [
   "Aspect Shrine Token",
   "Once per battle for each Aspect Shrine token this unit has, you can change the result of one Hit roll or one Wound roll made for a model in this unit (excluding CHARACTER models) to an unmodified 6.\n\nDesigner's Note: Place an Aspect Shrine token next to the unit for each Aspect Shrine token it has, removing one each time this ability is used."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Illic Nightspear": [
  [
   "Bringer of the True Death",
   "While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Wound roll."
  ],
  [
   "Hunter Unseen",
   "This model’s unit can only be selected as the target of a ranged attack if the attacking model is within 12\"."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Rangers"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Jain Zar": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Howling Banshees"
  ],
  [
   "Whirling Death",
   "While this model is leading a unit, each time that unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 6\" to the Move characteristic of models in that unit and each time a model in that unit makes an Advance move, ignore any vertical distance when determining the total distance that model can be moved during that move."
  ],
  [
   "Storm of Silence",
   "Each time this model makes an attack that targets a Character unit, you can re-roll the Wound roll."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Karandras": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Striking Scorpions"
  ],
  [
   "Shadow Hunter",
   "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll."
  ],
  [
   "Sustained Assault",
   "Each time this model makes a melee attack, if it made a Charge move this turn, a successful unmodified Hit roll of 4+ scores a Critical Hit"
  ],
  [
   "The Scorpion's Bite",
   "Melee weapons equipped by the bearer have the [DEVASTATING WOUNDS] ability when targeting units without the Titanic keyword."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Maugan Ra": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Dark Reapers"
  ],
  [
   "Harvester of Souls",
   "While this model is leading a unit, in your Shooting phase, after selecting targets for that unit's attacks, if every attack targets the same unit, roll one D6 for the target unit and one D6 for every other enemy unit within 3\" of the target unit. On a 5+, the unit being rolled for is struck by explosive debris; after resolving all of that unit's attacks against the target unit, each unit struck by explosive debris suffers D3 mortal wounds."
  ],
  [
   "Face of Death",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. That enemy unit must take a Battle-shock test, subtracting 1 from the result."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Night Spinner": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Monofilament Web",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with its doomweaver scored a hit against an enemy unit, until the start of your next turn, that enemy unit is pinned. While a unit is pinned, subtract 2 from that unit's Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Rangers": [
  [
   "Path of the Outcast",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6\"."
  ],
  [
   "Camouflaged Snipers",
   "RANGERS unit only. This unit’s ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Assassin's Eye",
   "RANGERS/SHROUD RUNNERS unit only. This unit’s ranged attacks that target a CHARACTER unit have +1 AP."
  ],
  [
   "Shadowfall Masks",
   "TROUPE unit only. This unit has Fights First."
  ],
  [
   "Elixir of the Corpse Courts",
   "CRONOS/TALOS unit only. This unit has 5+ InSv."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Shadowseer": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Troupe"
  ],
  [
   "Fog of Dreams (Psychic)",
   "While this model is leading a unit, that unit can only be selected as the target of a ranged attack if the attacking model is within 18\"."
  ],
  [
   "Treacherous Illusion (Psychic)",
   "Melee weapons equipped by enemy models have the [Hazardous] ability while targeting this model's unit."
  ],
  [
   "Travelling Players",
   "Unless otherwise stated, you cannot include more than one of this model in your army."
  ],
  [
   "Flip Belt",
   "Each time the bearer's unit makes a Normal, Advance, Fall Back or Charge move, ignore any vertical distance when determining the total distance the bearer can be moved during that move."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Shining Spears": [
  [
   "Extreme Mobility",
   "Each time this unit makes a Normal, Advance, Fall Back or Charge move, ignore any vertical distance when determining the total distance models in this unit can be moved during that move."
  ],
  [
   "Shimmershield",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Shroud Runners": [
  [
   "Target Acquisition",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks made with a long rifle. Until the end of the phase, that enemy unit cannot have the Benefit of Cover."
  ],
  [
   "Camouflaged Snipers",
   "RANGERS unit only. This unit’s ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Assassin's Eye",
   "RANGERS/SHROUD RUNNERS unit only. This unit’s ranged attacks that target a CHARACTER unit have +1 AP."
  ],
  [
   "Shadowfall Masks",
   "TROUPE unit only. This unit has Fights First."
  ],
  [
   "Elixir of the Corpse Courts",
   "CRONOS/TALOS unit only. This unit has 5+ InSv."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Skyweavers": [
  [
   "Acrobatic Grace",
   "- This unit has Stealth.\n- Melee attacks that target this unit have -1 to hit rolls."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Solitaire": [
  [
   "Blitz",
   "Once per battle, in your Movement phase, before this model makes a Normal move it can use this ability. If it does, until the end of\nthe turn, add 2D6\" to this model’s Move characteristic and add 3 to the\nAttacks characteristic of this model’s Solitaire weapons."
  ],
  [
   "Blur of Movement",
   "This model is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Flip Belt",
   "Each time the bearer's unit makes a Normal, Advance, Fall Back or Charge move, ignore any vertical distance when determining the total distance the bearer can be moved during that move."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Spiritseer": [
  [
   "Spirit Mark (Psychic)",
   "Once per turn, in your Movement phase, when this model starts or ends a move, select one friendly Wraith Construct unit within 6\" of this model (excluding Titanic units) and one enemy unit visible to this model. Until the start of your next Movement phase, weapons equipped by models in that friendly unit have the [Sustained Hits 1] ability while targeting that enemy unit."
  ],
  [
   "Tears of Isha (Psychic)",
   "In your Command phase, select one friendly Wraith Construct unit within 6\" of this model. If one or more models in that unit are destroyed, you can return one destroyed model to that unit. Otherwise, one model in that unit regains up to D3 lost wounds. Each unit can only be selected for this ability once per turn."
  ],
  [
   "Spiritseer",
   "While this model is within 3\" of one or more friendly Wraith Construct units, this model has the Lone Operative ability."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Starweaver": [
  [
   "Rapid Embarkation",
   "At the end of the Fight phase, if there are no models currently embarked within this Transport, you can select one friendly Harlequins Infantry unit that has 6 or fewer models that is wholly within 6\" of this Transport. Unless that unit is within Engagement Range of one or more enemy units, it can embark within this Transport. That unit can embark within this TRANSPORT in a turn it disembarked from this TRANSPORT."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Storm Guardians": [
  [
   "Stormblades",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent's Level of Control over that objective marker is greater than yours at the end of a phase."
  ],
  [
   "Crewed Platform",
   "When the last Storm Guardian model in this unit is destroyed, any remaining Serpent’s Scale Platform models in this unit are also destroyed."
  ],
  [
   "Serpent Shield",
   "Models in the bearer’s unit have a 5+ invulnerable save."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Striking Scorpions": [
  [
   "Mandiblasters",
   "Each time a model in this unit makes a melee attack, if it made a Charge move this turn, an unmodified Hit roll of 5+ scores a Critical Hit."
  ],
  [
   "Aspect Shrine Token",
   "Once per battle for each Aspect Shrine token this unit has, you can change the result of one Hit roll or one Wound roll made for a model in this unit (excluding CHARACTER models) to an unmodified 6.\n\nDesigner's Note: Place an Aspect Shrine token next to the unit for each Aspect Shrine token it has, removing one each time this ability is used."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "D-Cannon Platform": [
  [
   "Structural Collapse",
   "Each time this model makes an attack with its D-Cannon, re-roll a Damage roll of 1. If that attack targets a Titanic unit, you can re-roll the Damage roll instead."
  ],
  [
   "Support Artillery",
   "At the start of the Declare Battle Formations step, this model can join one Guardian Defenders unit from your army (a unit cannot have more than one Support Weapon model joined to it). This model then counts as part of that Guardians unit for the rest of the battle, and that unit's Starting Strength is increased accordingly.\n\nThis model, and any unit it is joined to, cannot embark within a Transport."
  ],
  [
   "Support Weapon",
   "Each time an attack targets this model's unit, it that unit contains one or more other models, until that attack is resolved, this model has a Toughness characteristic of 3."
  ]
 ],
 "Swooping Hawks": [
  [
   "Grenade Pack Flyover",
   "Once per turn, in your Movement phase, when this unit is set-up on the battlefield or ends a Normal, Advance or Fall Back move, it can use this ability. If it does, select one enemy unit within 8\" of and visible to this unit and roll one D6 for each Swooping Hawks model in this unit. For each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds). Each time this unit uses this ability , until the end of the turn, you cannot target this unit with the Grenades Stratagem."
  ],
  [
   "Aspect Shrine Token",
   "Once per battle for each Aspect Shrine token this unit has, you can change the result of one Hit roll or one Wound roll made for a model in this unit (excluding CHARACTER models) to an unmodified 6.\n\nDesigner's Note: Place an Aspect Shrine token next to the unit for each Aspect Shrine token it has, removing one each time this ability is used."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "The Visarch": [
  [
   "Way of the Blade",
   "While this model is leading a unit, models in that unit have the Fights First ability."
  ],
  [
   "Yvraine's Champion",
   "While this model is leading a unit, other Character models attached to that unit have the Feel No Pain 4+ ability."
  ],
  [
   "Support",
   "This model can be attached to the following units:\n- CORSAIR REAVER BAND\n- CORSAIR VOIDREAVERS\n- CORSAIR VOIDSCARRED\n- GUARDIAN DEFENDERS\n- STORM GUARDIANS\n- YNNARI KABALITE WARRIORS\n- YNNARI WYCHES\n\nYou can attach this unit to one of the above units, even if Yvraine has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths."
  ],
  [
   "Servant of the Whispering God",
   "If your army includes The Visarch, it cannot include any Epic Hero units (excluding Ynnari units). If your army includes any Epic Hero units (excluding Ynnari units), it cannot include The Visarch."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "The Yncarne": [
  [
   "Inevitable Death",
   "Once in each of your opponent's turns, if this model is on the battlefield when another friendly Aeldari unit is destroyed, just after removing the last model in that unit, you can remove this model from the battlefield and set it up as close as possible to where that destroyed model was destroyed and not within Engagement Range of one or more enemy units. Doing so does not prevent this model from being eligible to move."
  ],
  [
   "Ethereal Form",
   "Each time this model destroys an enemy unit it regains up to D3 lost wounds."
  ],
  [
   "Avatar of the Whispering God",
   "If your army includes The Yncarne, it cannot include any Epic Hero units (excluding Ynnari units). If your army includes any Epic Hero units (excluding Ynnari units), it cannot include The Yncarne."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Troupe": [
  [
   "Dance of Death",
   "At the start of the Fight phase, select one of the following abilities for this unit to gain until the end of the phase:\n■ Hero's Prowess: Each time a model in this unit makes an attack, re-roll a Hit roll of 1.\n■ Villain's Doom: Each time a model in this unit makes an attack, add 1 to the Wound roll.\n■ Trickster's Grace: Each time an attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "Flip Belt",
   "Each time the bearer's unit makes a Normal, Advance, Fall Back or Charge move, ignore any vertical distance when determining the total distance the bearer can be moved during that move."
  ],
  [
   "Camouflaged Snipers",
   "RANGERS unit only. This unit’s ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Assassin's Eye",
   "RANGERS/SHROUD RUNNERS unit only. This unit’s ranged attacks that target a CHARACTER unit have +1 AP."
  ],
  [
   "Shadowfall Masks",
   "TROUPE unit only. This unit has Fights First."
  ],
  [
   "Elixir of the Corpse Courts",
   "CRONOS/TALOS unit only. This unit has 5+ InSv."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Troupe Master": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Troupe"
  ],
  [
   "Choreographer of War",
   "While this model is leading a unit, each time a model in that unit makes a Pile In or Consolidate move, it can move up to 6\" instead of 3\". In addition, it does not need to end that move closer to the closest enemy model, provided it ends as close as possible to the closest enemy unit."
  ],
  [
   "Cegorach’s Favour",
   "Each time this model makes a melee attack you can re-roll a Hit roll of 1 and add 1 to the Wound roll."
  ],
  [
   "Flip Belt",
   "Each time the bearer's unit makes a Normal, Advance, Fall Back or Charge move, ignore any vertical distance when determining the total distance the bearer can be moved during that move."
  ],
  [
   "Travelling Players",
   "Unless otherwise stated, you cannot include more than one of this model in your army."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Voidweaver": [
  [
   "Polychromatic Camoflage",
   "This unit can only be selected as the target of a ranged attack if the attacking model is within 18\"."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Warlock": [
  [
   "Support",
   "This model can be attached to the following units:\n- Guardian Defenders\n- Storm Guardians\n\nYou can attach this model to a unit, even if one Autarch or Farseer model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths."
  ],
  [
   "Runes of Fortune (Psychic)",
   "Each time an enemy unit declares a charge, if one or more units with this ability are selected as a target of that charge, subtract 2 from the Charge roll."
  ],
  [
   "Psychic Communion (Psychic)",
   "Each time this model is selected to shoot, until the end of the phase, add 1 to the Attacks and Strength characteristics of its Destructor weapon for each other friendly Aeldari Psyker model within 6\" of this model (to a maximum of +2)."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Warlock Conclave": [
  [
   "Protect (Psychic)",
   "While a Farseer model is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll."
  ],
  [
   "Psychic Communion (Psychic)",
   "Each time this unit is selected to shoot, for each Warlock model in this unit, until the end of the phase, add 1 to the Attacks and Strength characteristics of that model's Destructor weapon for each other friendly Aeldari Psyker model within 6\" of this model (to a maximum of +2)."
  ],
  [
   "Support",
   "This model can be attached to the following units:\n- Guardian Defenders\n- Storm Guardians"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Warp Spiders": [
  [
   "Flickerjump",
   "In your Movement phase, each time this unit is selected to make a Normal move, it can use this ability. If it does, until the end of the turn, this unit is not eligible to declare a charge and models in it have a Move characteristic of 24\". Each time this unit uses this ability, at the end of the phase, roll one D6 for each model in this unit: for each 1, this unit suffers 1 mortal wound."
  ],
  [
   "Aspect Shrine Token",
   "Once per battle for each Aspect Shrine token this unit has, you can change the result of one Hit roll or one Wound roll made for a model in this unit (excluding CHARACTER models) to an unmodified 6.\n\nDesigner's Note: Place an Aspect Shrine token next to the unit for each Aspect Shrine token it has, removing one each time this ability is used."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Wave Serpent": [
  [
   "Wave Serpent Shield",
   "Each time a ranged attack targets this model, if the Strength characteristic of that attack is greater than the Toughness characteristic of this model, subtract 1 from the Wound roll."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Webway Gate": [
  [
   "Arcane Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack."
  ],
  [
   "Webway Strike",
   "Each time a friendly AELDARI unit arrives from Strategic Reserves, you can choose to set it up anywhere on the battlefield that is wholly within 6\" of this FORTIFICATION. If you do, that AELDARI unit can be set up within 9\" of enemy models, and can be set up within Engagement Range of enemy models. If an AELDARI unit is set up within Engagement Range of any enemy models in this way, it counts as having made a Charge move this turn and is eligible to fight this turn."
  ],
  [
   "Deployment",
   "Both Wraithbone Arches of this Fortification must be set up with their upper points no more than 1\" apart and with both statues facing in fully opposite directions so that an arch is formed, as shown on the right. Both arches are then treated as a single model for all rules purposes."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Windriders": [
  [
   "Swift Demise",
   "Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1. If the target of that attack is the closest eligible target, you can re-roll the Hit roll instead."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Wraithknight": [
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Titanic Strides",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move through models (excluding Titanic models) and sections of terrain features that are 4\" or less in height. When doing so:\nIt can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them.\nIt can also move through sections of terrain features that are more than 4\" in height, but if it does, after it has moved, roll one D6: on a 1, this model is battle-shocked."
  ],
  [
   "Point-blank Devastation",
   "Each time this model's Heavy Wraithcannon or Suncannon targets a unit within half range, you can re-roll the dice to determine the number of attacks made."
  ],
  [
   "Scattershield",
   "The bearer has a 4+ invulnerable save and each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Wraithlord": [
  [
   "Fated Hero",
   "At the start of the battle, select one of the following keywords: Infantry, Monster, Mounted, Vehicle. Each time this model makes an attack that targets a unit with the selected keyword, re-roll a Hit roll of 1 and re-roll a Wound roll of 1."
  ],
  [
   "Psychic Guidance",
   "While this model is within 12\" of one or more friendly Aeldari Psyker models, improve the Ballistic Skill and Weapon Skill characteristics of weapons equipped by this model by 1 and it has a Leadership characteristic of 6+."
  ]
 ],
 "Wraithguard": [
  [
   "War Construct",
   "This unit is eligible to shoot in a turn in which it Fell Back."
  ],
  [
   "Psychic Guidance",
   "While this unit is within 12\" of one or more friendly Aeldari Psyker models, models in this unit have a Leadership characteristic of 6+ and each time a model in this unit makes an attack, add 1 to the Hit roll."
  ]
 ],
 "Yvraine": [
  [
   "Herald of Ynnead",
   "At the start of the Fight phase, select one enemy unit within Engagement Range of this model. Until the end of the phase, each time a friendly AELDARI model makes an attack that targets that unit, you can re-roll a Wound roll of 1."
  ],
  [
   "Word of the Phoenix (Psychic)",
   "While this model is leading a unit, in your Command phase, roll one D6: on a 2+, D3+1 destroyed Bodyguard models (excluding Support Weapon models) are returned to that unit with their full wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- CORSAIR REAVER BAND\n- CORSAIR VOIDREAVERS\n- CORSAIR VOIDSCARRED\n- GUARDIAN DEFENDERS\n- STORM GUARDIANS\n- YNNARI INCUBI\n- YNNARI KABALITE WARRIORS\n- YNNARI WYCHES"
  ],
  [
   "Servant of the Whispering God",
   "If your army includes Yvraine, it cannot include any Epic Hero units (excluding Ynnari units). If your army includes any Epic Hero units (excluding Ynnari units), it cannot include Yvraine."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Wraithblades": [
  [
   "Malevolent Souls",
   "Each time a model in this unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 3+, do not remove it from play; that destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Psychic Guidance",
   "While this unit is within 12\" of one or more friendly Aeldari Psyker models, models in this unit have a Leadership characteristic of 6+ and each time a model in this unit makes an attack, add 1 to the Hit roll."
  ],
  [
   "Forceshield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Cobra": [
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from\nits Objective Control characteristic and each time this model\nmakes an attack, subtract 1 from the Hit roll"
  ],
  [
   "D-Rift",
   "In your Shooting phase, just after selecting a target for this model’s D-impaler, roll one D6 for the target unit and every other unit within 3\" of that unit: on a 5+, the unit being rolled for is struck by a D-rift. After this model has finished making its attacks against that target unit this phase, each unit struck by a D-rift this phase suffers D3 mortal wounds."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Scorpion": [
  [
   "Damaged: 1-8 Wounds Remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from\nits Objective Control characteristic and each time this model\nmakes an attack, subtract 1 from the Hit roll"
  ],
  [
   "Lanced Obliteration",
   "Each time an attack made with this model’s twin Scorpion pulsar destroys an enemy model that has the Deadly Demise ability, that model’s Deadly Demise ability inflicts mortal wounds on a D6 roll of 4+ instead of on a 6."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Hornet": [
  [
   "Lightning Assault",
   "Each time this model ends a Normal move, you can select one enemy unit (excluding Monster and Vehicle units) that it moved over during that move, then roll six D6: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Irillyth": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Shadow Spectres"
  ],
  [
   "Reaper of Souls",
   "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll"
  ],
  [
   "Shadow of Death (Aura)",
   "While an enemy unit is within 6\" of this model, each time that unit takes a Battle-shock or Leadership test, subtract 1 from that test."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Lynx": [
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Speed of Vaul",
   "Each time this model Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 9\" to the Move characteristic of this model"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Nightwing": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Interceptor",
   "Each time this model makes a ranged attack that targets a unit that can Fly, add 1 to the Hit roll."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Skathach Wraithknight": [
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Agile",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move over other models (excluding Titanic models) and terrain features that are 4\" or less in height as if they were not there."
  ],
  [
   "Webway Shunt Generator",
   "Once per battle, at the end of your opponent’s turn, if this model is not within Engagement Range of one or more enemy units, you can remove this model from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Scattershield",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Shadow Spectres": [
  [
   "Shade of Twilight",
   "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move of up to D6\". If it does, until the end of the turn, this unit is not eligible to declare a charge."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Phantom Titan": [
  [
   "Damaged: 1-16 Wounds Remaining",
   "While this model has 1-16 wounds remaining, subtract 10 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Titanic Advance",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move over models (excluding Titanic models) and terrain features that are 4\" or less in height as if they were not there."
  ],
  [
   "Towering Wraith Construct",
   "Each time you target this model with a Stratagem, you must spend three times that Stratagem’s stated CP cost to do so."
  ],
  [
   "Flawless Poise",
   "This model is eligible to shoot and declare a charge in a turn in which it Fell Back."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Revenant Titan": [
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 8 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Titanic Advance",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move over models (excluding Titanic models) and terrain features that are 4\" or less in height as if they were not there."
  ],
  [
   "Towering Wraith Construct",
   "Each time you target this model with a Stratagem, you must spend twice that Stratagem’s stated CP cost to do so."
  ],
  [
   "Revenant Jet Pack",
   "Each time this model Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 8\" to the Move characteristic of this model."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Warp Hunter": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Devastating Assault",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. That enemy unit must take a Battle-shock test."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Wraithseer": [
  [
   "Horrify (Psychic)",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. That enemy unit must take a Battle-shock test."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Amallyn Shadowguide": [
  [
   "The Path Least Travelled",
   "If your army includes this model, after both players have deployed their armies and determined who has the first turn, you can select one Rangers or Shroud Runners unit from your army and redeploy that unit. When doing so, that unit can be placed into Strategic Reserves, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Path of the Outcast",
   "In your opponent's Movement phase, when an enemy unit ends a Normal, Advance or Fall Back move within 8\" of this model, if this model is not within Engagement Range of one or more enemy units, it can make a Normal move of up to D6\"."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Bonesinger": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ Wraithblades\n■ Wraithguard\n■ Wraithlord"
  ],
  [
   "Way of the Shaper (Psychic)",
   "While this model is leading a unit, Wraith Construct models in that unit have the Feel No Pain 6+ ability."
  ],
  [
   "Bonesinger",
   "While this model is within 3\" of one or more friendly Wraith Construct or Asuryani Vehicle units, unless it is leading a unit, this model has the Lone Operative ability."
  ],
  [
   "Psytronome Shaper",
   "In your Command phase, you can select one friendly Wraith Construct or Asuryani Vehicle model within 3\" of this model. That Wraith Construct or Asuryani Vehicle model regains up to D3 lost wounds."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Corsair Cloud Dancer Band": [
  [
   "Reckless Abandon",
   "You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase."
  ]
 ],
 "Corsair Reaver Band": [
  [
   "Reaver Band",
   "In your opponent's Movement phase, when an enemy unit ends a Normal, Advance or Fall Back move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to D6\"."
  ],
  [
   "Corsairs",
   "If a model from your army with the Leader ability can be attached to a Corsair Voidreavers unit, it can be attached to this unit instead."
  ]
 ],
 "Firestorm": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Skyfire",
   "Each time you target this model with the Fire Overwatch Stratagem just after an enemy unit that can Fly starts or ends a Normal, Advance or Fall Back move, when resolving that Stratagem, in addition to shooting that enemy unit, you can select up to 3 other enemy units within 24\" of this model that can Fly; this model can also shoot at each of those units with its Firestorm scatter laser (provided each one is an eligible target), but when doing so, an unmodified Hit roll of 6 is required to score a hit."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Phoenix": [
  [
   "Strafing Run",
   "Each time this model makes a ranged attack that targets a unit that cannot FLY, add 1 to the Hit roll."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Vampire Hunter": [
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Titan Hunter",
   "Each time a ranged attack made by this model is allocated to a Monster or Vehicle model, re-roll a Damage roll of 1."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Vampire Raider": [
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Into the Foe",
   "If a unit disembarks from this Transport before it moves, until the end of the turn, that unit is eligible to charge in a turn in which it Advanced."
  ],
  [
   "Transport",
   "This model has a transport capacity of 30 Aeldari Infantry models. Each Wraith Construct model takes the space of 2 models. It cannot transport Jump Pack models or Ynnari models (excluding Yvraine and The Visarch)."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Wasp Assault Walker": [
  [
   "Cloudbreakers",
   "Each time this model Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of this model."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Warlock Skyrunners": [
  [
   "Psychic Communion (Psychic)",
   "Each time this unit is selected to shoot, for each Warlock model in this unit, until the end of the phase, add 1 to the Attacks and Strength characteristics of that model's Destructor weapon for each other friendly Aeldari Psyker model within 6\" of this model (to a maximum of +2)."
  ],
  [
   "Support",
   "This model can be attached to the following unit:\n- WINDRIDERS"
  ],
  [
   "Runes of Battle (Psychic)",
   "Weapons equipped by models in this unit have the [IGNORES COVER] ability."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Ynnari Archon": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ Ynnari Incubi\n■ Ynnari Kabalite Warriors"
  ],
  [
   "Overlord",
   "While this model is leading a unit, each time a model in that unit makes an attack, re-roll a Wound roll of 1. While that unit is below its Starting Strength, each time a model in that unit makes an attack, you can re-roll the Wound roll instead."
  ],
  [
   "Reborn Mastermind",
   "Once per battle round, one model from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that usage of that Stratagem by 1CP."
  ],
  [
   "Shadow Field",
   "You cannot re-roll invulnerable saving throws made for the bearer. The first time an invulnerable saving throw made for the bearer is failed, until the end of the battle, the bearer has no invulnerable saving throw."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Lhykhis": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Warp Spiders"
  ],
  [
   "Empyric Ambush",
   "While this model is leading a unit, that unit is eligible to declare a charge in a turn in which it used its Flickerjump ability."
  ],
  [
   "Whispering Web",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly Aeldari model makes an attack that targets that unit, an unmodified Hit roll of 5+ scores a Critical Hit."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "War Walkers": [
  [
   "Crystalline Targeting",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly Aeldari unit makes an attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. Each unit can only be selected for that ability once per turn."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Shadow Weaver Platform": [
  [
   "Monofilament Snare",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks made with its Shadow Weaver. Until the start of your next turn, that enemy unit it snared. While a unit is snared, each time that unit makes a Normal, Advance or Fall Back move, roll one D6 for each model in that unit: for each 1, that unit suffers 1 mortal wound."
  ],
  [
   "Support Artillery",
   "At the start of the Declare Battle Formations step, this model can join one Guardian Defenders unit from your army (a unit cannot have more than one Support Weapon model joined to it). This model then counts as part of that Guardians unit for the rest of the battle, and that unit's Starting Strength is increased accordingly.\n\nThis model, and any unit it is joined to, cannot embark within a Transport."
  ],
  [
   "Support Weapon",
   "Each time an attack targets this model's unit, it that unit contains one or more other models, until that attack is resolved, this model has a Toughness characteristic of 3."
  ]
 ],
 "Vibro Cannon Platform": [
  [
   "Sonic Destruction",
   "In your Shooting phase, each time this model makes an attack with its Vibro Cannon that targets an enemy unit, improve the Strength, Armour Penetration and Damage characteristics of that attack by 1 for each other friendly Vibro Cannon Platform model that made one or more attacks with its Vibro Cannon that also targeted that enemy unit this phase."
  ],
  [
   "Support Artillery",
   "At the start of the Declare Battle Formations step, this model can join one Guardian Defenders unit from your army (a unit cannot have more than one Support Weapon model joined to it). This model then counts as part of that Guardians unit for the rest of the battle, and that unit's Starting Strength is increased accordingly.\n\nThis model, and any unit it is joined to, cannot embark within a Transport."
  ],
  [
   "Support Weapon",
   "Each time an attack targets this model's unit, it that unit contains one or more other models, until that attack is resolved, this model has a Toughness characteristic of 3."
  ]
 ],
 "Wraithknight with Ghostglaive": [
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Titanic Agility",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move through models and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them."
  ],
  [
   "Scattershield",
   "The bearer has a 4+ invulnerable save and each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Ynnari Succubus": [
  [
   "Empowered by Death",
   "At the start of the Fight phase, if this model's unit is below its Starting Strength, models in that unit have the Fights First ability."
  ],
  [
   "Storm of Blades",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Ynnari Wyches"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Ynnari Kabalite Warriors": [
  [
   "Sadistic Raiders",
   "At the end of your Command phase, if you control an objective marker that this unit (or a Transport it is embarked within) is within range of, that objective marker remains under your control until your opponent's Level of Control  over that objective marker is greater than yours at the end of any phase."
  ],
  [
   "Phantasm Grenade Launcher",
   "The bearer’s unit has the Grenades keyword."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Ynnari Wyches": [
  [
   "No Escape",
   "Each time an enemy unit (excluding Monsters and Vehicles) within Engagement Range of one or more units from your army with this ability is selected to Fall Back, all models in that enemy unit must take a Desperate Escape test. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those tests."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Ynnari Incubi": [
  [
   "Tormentors",
   "At the start of the Fight phase, each enemy unit within Engagement Range of one or more units with this ability must take a Battle-shock test."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Ynnari Reavers": [
  [
   "Eviscerating Fly-by",
   "Each time this unit ends a Normal move, you can select one enemy unit (excluding Monster and Vehicle units) that it moved over during that move. If you do, roll one D6 for each model in this unit: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Cluster Caltrops",
   "Each time you roll to inflict wounds using this unit’s Eviscerating Fly-by ability, you can re-roll one D6 for each model in this unit equipped with cluster caltrops."
  ],
  [
   "Grav Talon",
   "The bearer’s melee weapons have an Armour Penetration characteristic of -2 and the [Lethal Hits] ability."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Ynnari Raider": [
  [
   "Aethersails",
   "Each time this model Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of this model."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Ynnari Venom": [
  [
   "Lithe Embarkation",
   "At the end of the Fight phase, if there are no models currently embarked within this Transport, you can select one friendly Ynnari Infantry unit that only includes models from the units listed in this unit's Transport section, that has 6 or fewer models and that is wholly within 6\" of this Transport. Unless that unit is within Engagement Range of one or more enemy units, it can embark within this Transport. That unit can embark within this TRANSPORT in a turn it disembarked from this TRANSPORT."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ],
  [
   "Disparate Paths",
   "When mustering you army, you can include Harlequins units in your army, even though they do not have the Asuryani Faction keyword. Unless otherwise stated, you cannot select Harlequins or Ynnari as your Army Faction."
  ]
 ],
 "Prince Yriel": [
  [
   "Leader",
   "This model can be attached to the following units:\n- CORSAIR REAVER BAND\n- CORSAIR VOIDREAVERS\n- CORSAIR VOIDSCARRED"
  ],
  [
   "Piratical Hero",
   "While this model is leading a unit, each time a model in that unit makes an attack, that attack has the [Sustained Hits 1] ability and add 1 to the Hit roll."
  ],
  [
   "Prince of Corsairs",
   "After both players have deployed their armies, if this model is on the battlefield (or any Transport it is embarked within is on the battlefield), select up to three Aeldari units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Kharseth": [
  [
   "Leader",
   "This model can be attached to the following units:\n- CORSAIR REAVER BAND\n- CORSAIR VOIDREAVERS\n- CORSAIR VOIDSCARRED"
  ],
  [
   "Aethersense (Psychic)",
   "Enemy units that are set up on the battlefield from Reserves cannot be set up within 12\" of this model."
  ],
  [
   "Fury of the Void (Psychic)",
   "In your Shooting phase, after this model’s unit has shot, select one enemy unit hit by one or more attacks made with this model’s Dread of the Deep Void. Until the end of the turn, that unit is riven. Each time an Aeldari model from your army makes an attack that targets a riven unit, add 1 to the Strength characteristic of that attack."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Starfangs": [
  [
   "Hallucinogen Grenades",
   "At the start of your opponent’s Shooting phase, this unit can use this ability. If it does, select one Aeldari Infantry unit from your army visible to and within 36\" of this unit: until the end of the phase, that unit has the Stealth ability."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Corsair Skyreavers": [
  [
   "Raid and Run",
   "At the end of the Fight phase, if this unit was eligible to fight this phase, and is not within Engagement Range of one or more enemy units, it can make a Normal move of up to D3+3\". Otherwise, if this unit was eligible to fight this phase, this unit can make a Fall Back move of up to D3+3\"."
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Dragon Knights": [
  [
   "Agile Reach",
   "When this unit is selected to fight, melee weapons equipped by unengaged models in this unit that are within 3\" of an enemy unit that is engaged with this unit can target that enemy unit."
  ],
  [
   "On the Hunt",
   "When this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to shoot and eligible to declare a charge."
  ],
  [
   "Drakolithe (Once per battle, per token)",
   "When an enemy unit ends a move within 8\" of this unit, if this unit is unengaged or if that enemy unit ended that move engaged with this unit, you can use this ability. If you do, roll one D6:\n- On a 3+, that enemy unit suffers 1 mortal wound.\n\n*Place one Drakolithe token next to the unit for each Drakolithe the unit is equipped with, removing one each time this ability is used.*"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Leystalker": [
  [
   "Panicked Quarry",
   "In your Shooting phase, when this unit has shot, select one enemy unit (excluding MONSTER/VEHICLE units) hit by those attacks. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Drakolithe (Once per battle, per token)",
   "When an enemy unit ends a move within 8\" of this unit, if this unit is unengaged or if that enemy unit ended that move engaged with this unit, you can use this ability. If you do, roll one D6:\n- On a 3+, that enemy unit suffers 1 mortal wound.\n\n*Place one Drakolithe token next to the unit for each Drakolithe the unit is equipped with, removing one each time this ability is used.*"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Stonesinger": [
  [
   "Elemental Ensnarement",
   "At the end of your Fight phase, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6:\n- On a 1, this unit is battle-shocked.\n- Select one visible enemy MONSTER/VEHICLE unit (excluding TITANIC units) within 18\" of this unit. That enemy unit is ensnared until the start of your next turn:\n    - While a unit is ensnared, that unit has -2\" M and cannot be pinned."
  ],
  [
   "Support",
   "This model can be attached to the following unit:\n- DRAGON KNIGHTS"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ],
 "Clanblade": [
  [
   "Cornered Prey",
   "When an enemy unit engaged with this unit is selected to make a fall-back move, that enemy unit must use the desperate escape mode. If that enemy unit is battle-shocked, -1 from those hazard rolls."
  ],
  [
   "Blade of the Clans",
   "This unit’s melee attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- DRAGON KNIGHTS"
  ],
  [
   "Battle Focus",
   "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown below:\n\n■ Incursion - 2\n■ Strike Force - 4\n■ Onslaught - 6\n\nEach time one of the triggers shown in the Agile Manoeuvres section of your codex occurs, you can spend one Battle focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Armoured Warhost",1,"","Skilled Crews","Friendly AELDARI VEHICLE units’ ranged attacks have [ASSAULT].","",0,"","Reconnaissance"],
  ["Aspect Host",3,"","Path of the Warrior","Each time an Aspect Warriors or Avatar of Khaine unit from your army is selected to shoot or fight, select one of the following abilities for it to gain until the end of the phase: ▪ Each time a model in this unit makes an attack, re-roll a Hit roll of 1. ▪ Each time a model in this unit makes an attack, re-roll a Wound roll of 1.","",0,"","Priority Assets"],
  ["Corsair Coterie",2,"","Relentless Raiders / Veterans of the Void","While an objective marker is under your control, each time an enemy unit ends a Normal, Advance, Fall Back or Charge move within range of that objective marker, roll one D6: on a 2+, that enemy unit suffers D3 mortal wounds. Anhrathe units from your army have the following ability: Void Thieves: At the end of a phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase. Each time you add an Anhrathe unit to your army, it can be given up to one Corsair Enhancement. Each Corsair Enhancement included in your army must be unique. If a unit is given a Corsair Enhancement, you must increase the points cost of that unit by the amount shown. If this causes your army to exceed the points limit for the battle you are playing, you cannot include that unit in your army.","",0,"","Priority Assets"],
  ["Devoted of Ynnead",2,"","Strength from Death","You can use the following rules: Lethal Intent At the end of your opponent’s Shooting phase, if one or more YNNARI units from your army were destroyed this phase, select one YNNARI INFANTRY or YNNARI MOUNTED unit from your army that was within 6\" of your destroyed unit. That unit can make a normal move of up to D6+1. Lethal Surge Once per turn, when a YNNARI unit from your army performs the Fade Back Agile Manouvre, it can make a surge move of up to D6+1\" instead of a normal move. Lethal Reprisal At the start of the Fight phase, select one YNNARI unit from your army (excluding TITANIC units) that is below its Starting Strength. Until the end of the phase, that unit has the Fights First ability. SERVANTS OF THE WHISPERING GOD ▪ You can include Ynnari units in your army, even though they do not have the ASURYANI Faction keyword. ▪ Asuryani units (excluding Epic Heroes) from your army gain the YNNARI keyword. ▪ You must include Yvraine and/or The Yncarne in your army, and one of those models must be your WARLORD.","",0,"","Priority Assets"],
  ["Eldritch Raiders",2,"","Yriel’s Own / Veterans of the Void","AELDARI units in your army are eligible to declare a charge in a turn in which they Advanced. In addition, each time an Anhrathe, Rangers or Shroud Runners unit from your army Advances, you can re-roll the Advance roll. Each time you add an Anhrathe unit to your army, it can be given up to one Corsair Enhancement. Each Corsair Enhancement included in your army must be unique. If a unit is given a Corsair Enhancement, you must increase the points cost of that unit by the amount shown. If this causes your army to exceed the points limit for the battle you are playing, you cannot include that unit in your army.","",0,"","Purge the Foe"],
  ["Fateful Performance",1,"","Acrobatic Onslaught","While a friendly HARLEQUINS unit is making a charge move, that unit can move through enemy models. This detachment has the ACROBATIC tag and cannot be taken with another ACROBATIC detachment.","",0,"","Disruption"],
  ["Ghosts of the Webway",2,"","Acrobatic Onslaught","Each time a Harlequins model from your army makes a Charge move, it can move through enemy models. TRAVELLING PLAYERS ▪ Troupe units from your army gain the BATTLELINE keyword and TROUPE models in those units have an Objective Control characteristic of 2. ▪ You can include up to three of each of the following models in your army: Death Jester, Shadowseer, Troupe Master. ▪ When mustering your army, you can select a friendly HARLEQUINS CHARACTER model to be your WARLORD.","",0,"","Disruption"],
  ["Guardian Battlehost",2,"","Defend at All Costs","Each time a Dire Avenger, Guardian, Support Weapon or War Walker model from your army makes an attack, if that model’s unit and/or the target unit are within range of one or more objective markers, add 1 to the Hit roll.","",0,"","Take and Hold"],
  ["Path of the Outcast",1,"","Far-Reaching Doom","When a friendly RANGERS/SHROUD RUNNERS unit is selected to shoot, enemy units have +6\" detection range until that friendly unit has shot.","",0,"","Reconnaissance"],
  ["Seer Council",2,"","Strands of Fate","At the start of the first battle round, you generate Fate dice by rolling a number of D6 based on the battle size, as shown below. Keep your Fate dice to one side - this is your Fate dice pool. BATTLE SIZENUMBER OF D6Incursion3Strike Force6Onslaught9 Each time you use one of the Stratagems below, if your Fate dice pool contains one or more Fate dice showing the corresponding value in the table below, you can discard one of those corresponding Fate dice. If you do, reduce the CP cost of that usage of that Stratagem by 1CP. STRATAGEMFATE DICE VALUEPresentiment of Dread1Forewarned2Unshrouded Truth3Fate Inescapable4Isha’s Fury5Psychic Shield6","",0,"","Priority Assets"],
  ["Serpent’s Brood",2,"","Boons of the Brood","Weapons equipped by Harlequins Mounted and Harlequins Vehicle models from your army have the [SUSTAINED HITS 1] ability. Each time a Harlequins unit from your army disembarks from a Transport, until the end of the turn, that unit’s weapons have the [SUSTAINED HITS 1] ability. TRAVELLING PLAYERS ▪ Troupe units from your army gain the BATTLELINE keyword, and TROUPE models in those units have an Objective Control characteristic of 2. ▪ You can include up to three of each of the following models in your army: Death Jester, Shadowseer, Troupe Master. ▪ When mustering your army, you can select a friendly HARLEQUINS CHARACTER model to be your WARLORD.","",0,"","Purge the Foe"],
  ["Spirit Conclave",2,"","Shepherds of the Dead","Each time an Asuryani Psyker model from your army is destroyed by an enemy unit, that enemy unit gains a Vengeful Dead token. Each time a Wraith Construct model from your army makes an attack that targets a unit with one or more Vengeful Dead tokens, add 1 to the Hit roll and add 1 to the Wound roll. ASURYANI PSYKER models from your army have the following ability: Spirit Guides (Aura): While a Wraithblades, Wraithguard or Wraithlord unit from your army is within 12\" of this model, that unit has the Battle Focus ability. KEYWORDS WRAITHBLADES and WRAITHGUARD units from your army gain the BATTLELINE keyword.","",0,"","Take and Hold"],
  ["Twilight Flickers",1,"","Dance of Distortion","Friendly HARLEQUINS units have Stealth. This detachment has the ACROBATIC tag and cannot be taken with another ACROBATIC detachment.","",0,"","Take and Hold"],
  ["Warhost",2,"","Martial Grace","▪ At the start of the battle round, you receive 1 additional Battle Focus token. ▪ Each time a unit from your army performs the Swift as the Wind Agile Manoeuvre, until the end of the phase, add an additional 1\" to the Move characteristic of models in that unit. ▪ Each time a unit from your army performs an Agile Manoeuvre that involves rolling a D6, add 1 to the result.","",0,"","Reconnaissance"],
  ["Windrider Host",2,"","Ride the Wind","In the Declare Battle Formations step you can set up Asuryani Mounted and Vyper units from your army in Reserves. During the battle, such units can be set up on the battlefield as if they were arriving from Strategic Reserves. For the purposes of setting up ASURYANI MOUNTED or VYPER units from your army on the battlefield, treat the current battle round number as being one higher than it actually is. In addition, at the end of your opponent’s turn, you can select a number of ASURYANI MOUNTED or VYPER units from your army (excluding units within Engagement Range of one or more enemy units), then remove those units from the battlefield and place them into Strategic Reserves. The maximum number of units you can select depends on the battle size, as shown below. BATTLE SIZENUMBER OF UNITSIncursion1Strike Force2Onslaught3 KEYWORDS Windriders units from your army gain the BATTLELINE keyword.","",0,"","Disruption"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Guiding Presence",25,"Armoured Warhost","AELDARI PSYKER model only. At the start of your Shooting phase, select one visible friendly AELDARI VEHICLE unit within 6\" of this model. That VEHICLE unit’s ranged attacks have +1 to hit rolls.",null],
  ["Spirit Stone of Raelyth",20,"Armoured Warhost","AELDARI PSYKER model only.\n- While this model is within 3\" of a friendly AELDARI VEHICLE unit, this model has Lone Operative.\n- In your Movement phase, at the start or end of this unit’s move, you can select one friendly AELDARI VEHICLE model within 3\" of this model. That VEHICLE model heals D3 wounds.",null],
  ["Aspect of Murder",15,"Aspect Host","Autarch or Autarch Wayleaper model only. Add 1 to the Damage characteristics of melee weapons equipped by the bearer, and those weapons have the [PRECISION] ability.",null],
  ["Mantle of Wisdom",20,"Aspect Host","Autarch or Autarch Wayleaper model only. While the bearer is leading an Aspect Warriors unit, each time that unit is selected to shoot or fight, until the end of the phase, models in that unit gain both of the abilities from the Path of the Warrior Detachment rule.",null],
  ["Shimmerstone",10,"Aspect Host","Autarch or Autarch Wayleaper model only. While the bearer is leading an Aspect Warriors unit, each time a ranged attack targets that unit, subtract 1 from the Wound roll.",null],
  ["Strategic Savant",10,"Aspect Host","Autarch or Autarch Wayleaper model only. While the bearer is leading an Aspect Warriors unit, add 1 to the Objective Control characteristic of models in that unit.",null],
  ["Archraider",35,"Corsair Coterie","Harlequins or Drukhari model only. In the Declare Battle Formations step, if the bearer starts the battle embarked within a Dedicated Transport, that Dedicated Transport has the Scouts 9\" ability.",null],
  ["Infamy",25,"Corsair Coterie","",null],
  ["Voidstone",15,"Corsair Coterie","Anhrathe Infantry unit only. Models in this unit have a 5+ invulnerable save.",null],
  ["Webway Pathstone",25,"Corsair Coterie","Anhrathe unit only. Models in this unit have the Deep Strike ability. In addition, once per battle, at the end of your opponent’s turn, if this unit is not within Engagement Range of one or more enemy units, it can use this ability. If it does, remove this unit from the battlefield and place it into Strategic Reserves.",null],
  ["Borrowed Vigour",10,"Devoted of Ynnead","Archon model only. Add 2 to the Attacks characteristic of the bearer's melee weapons.",null],
  ["Gaze of Ynnead",15,"Devoted of Ynnead","Farseer model only. The bearer's Eldritch Storm weapon has the [Devastating Wounds] ability.",null],
  ["Morbid Might",15,"Devoted of Ynnead","Succubus model only. Each time the bearer makes a melee attack, you can re-roll the Wound roll.",null],
  ["Storm of Whispers",10,"Devoted of Ynnead","Warlock model only. In your Shooting phase, after the bearer has shot, select one enemy unit hit by one or more of those attacks. That unit must take a Battle-shock test.",null],
  ["Adrenal Infusions",20,"Eldritch Raiders","Anhrathe Infantry unit only. This unit can perform the Fade Back Agile Manoeuvre without spending a Battle Focus token to do so. It can do so even if other units have done so in the same phase, and doing so does not prevent other units from performing the same Agile Manoeuvre in the same phase.",null],
  ["Alacritous Assault",20,"Eldritch Raiders","Anhrathe unit only. Melee weapons equipped by models in this unit have the [LANCE] ability.",null],
  ["Exotic Munitions",15,"Eldritch Raiders","Anhrathe unit only. Ranged weapons equipped by models in this unit have the [ANTI-MONSTER 5+] and [ANTI-VEHICLE 5+] abilities.",null],
  ["Pirate Prince",15,"Eldritch Raiders","Prince Yriel unit only. Each time you spend a Battle Focus token to enable this unit to perform an Agile Manoeuvre, roll one D6: on a 3+, you gain 1 Battle Focus token.",null],
  ["A Foot in the Future",15,"Fateful Performance","TROUPE MASTER model only. This unit can re-roll charge rolls.",null],
  ["Mistweave",20,"Fateful Performance","Shadowseer model only. While the bearer is leading a unit, models in that unit have the Infiltrators ability.",null],
  ["Cegorach’s Coil",25,"Ghosts of the Webway","Troupe Master model only. Each time the bearer's unit ends a Charge move, select one enemy unit within Engagement Range of the bearer's unit, then roll one D6 for each model in the bearer's unit that is within Engagment Range of that enemy unit: for each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",null],
  ["Mask of Secrets",15,"Ghosts of the Webway","Harlequins model only. The bearer has the Twisted Phantasm (Aura) ability.",null],
  ["Mistweave",15,"Ghosts of the Webway","Shadowseer model only. While the bearer is leading a unit, models in that unit have the Infiltrators ability.",null],
  ["Murder’s Jest",20,"Ghosts of the Webway","Death Jester model only. Each time the bearer makes an attack that targets a unit that is below Half-strength, each successful Hit scores a Critical Hit.",null],
  ["Breath of Vaul",10,"Guardian Battlehost","ASURYANI model only. While the bearer is leading a STORM GUARDIANS unit, each time you roll to determine the number of attacks made with a flamer equipped by a model in that unit, you can re-roll the result, and each time you make a Damage roll for a model equipped with a fusion gun in that unit, you can re-roll the result.",null],
  ["Craftworld’s Champion",25,"Guardian Battlehost","Asuryani model only. The bearer has an Objective Control characteristic of 5.",null],
  ["Ethereal Pathway",30,"Guardian Battlehost","Asuryani model only. In the Deploy Armies step, select up to two Guardians units from your army. Models in the selected units have the Infiltrators ability.",null],
  ["Protector of the Paths",20,"Guardian Battlehost","Asuryani model only. While the bearer is leading a Dire Avengers or Guardians unit, once per battle round, you can target the bearer's unit with the Fire Overwatch Stratagem for 0CP, and while resolving that Stratagem, hits are scored on unmodified Hit rolls of 5+, or unmodified Hit rolls of 4+ instead if the bearer's unit is within range of an objective marker you control.",null],
  ["Assassins' Eye (Upgrade)",15,"Path of the Outcast","RANGERS/SHROUD RUNNERS unit only. This unit’s ranged attacks that target a CHARACTER unit have +1 AP.",null],
  ["Camouflaged Snipers (Upgrade)",10,"Path of the Outcast","RANGERS unit only. This unit’s ranged attacks do not prevent this unit from being hidden.",null],
  ["Lucid Eye",30,"Seer Council","Asuryani Psyker model only. In your Command phase, you can add 1 to or subtract 1 from the value of one Fate dice in your Fate dice pool.",null],
  ["Runes of Warding",25,"Seer Council","Asuryani Psyker model only. Models in the bearer's unit have the Feel No Pain 4+ ability against mortal wounds, Psychic Attacks and Critical Wounds caused by attacks with the [DEVASTATING WOUNDS] ability.",null],
  ["Stone of Eldritch Fury",15,"Seer Council","Asuryani Psyker model only. Add 12\" to the Range characteristic of ranged Psychic weapons equipped by the bearer.",null],
  ["Torc of Morai-Heg",20,"Seer Council","Asuryani Psyker model only. Once per turn, when your opponent targets a unit from their army within 12\" of the bearer with a Stratagem, the bearer can use this Enhancement. If it does, increase the CP cost of that usage of that Stratagem by 1CP.",null],
  ["Fanged Leer",10,"Serpent’s Brood","Death Jester model only. When using the bearer’s Cruel Amusement ability, you can select two of the abilities for its shrieker cannon to gain, instead of one.",null],
  ["Key of Ghosts",20,"Serpent’s Brood","Harlequins model only (excluding Solitaire models). Models in the bearer’s unit have the Scouts 6\" ability.",null],
  ["Shedskin Raiment",25,"Serpent’s Brood","Shadowseer model only. After both players have deployed their armies, select up to three Harlequins units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves, regardless of how many units are already in Strategic Reserves.",null],
  ["Weavers' Wail",20,"Serpent’s Brood","Troupe Master model only. Add 3 to the Strength and add 1 to the Attacks characteristics of the bearer’s melee weapons.",null],
  ["Higher Duty",25,"Spirit Conclave","SPIRITSEER model only. In your opponent's Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to 6\".",null],
  ["Light of Clarity",30,"Spirit Conclave","Spiritseer model only. In your Command phase, select one friendly Wraith Construct unit within 12\" of the bearer. Until the start of your next Command phase, add 1 to the Objective Control characteristic of Infanty models in that unit and add 3 to the Objective Control characteristic of Monster models in that unit.",null],
  ["Rune of Mists",10,"Spirit Conclave","Spiritseer model only. In your Command phase, select one friendly Wraith Construct unit within 12\" of the bearer. Until the start of your next Command phase, each time a ranged attack targets that unit, unless the attacking model is within 18, models in that unit have the Benefit of Cover against that attack.",null],
  ["Stave of Kurnous",15,"Spirit Conclave","Spiritseer model only. In your Command phase, select one friendly Wraith Construct unit within 12\" of the bearer (excluding Titanic units). Until the start of your next Command phase, each time a model in that unit makes an attack, on a Critical Wound, that attack has the [Precision] ability.",null],
  ["Prelude Performer",20,"Twilight Flickers","HARLEQUINS model only. This unit has Scouts 6\".",null],
  ["Shadowfall Masks (Upgrade)",15,"Twilight Flickers","TROUPE unit only. This unit has Fights First.",null],
  ["Gift of Foresight",15,"Warhost","Asuryani model only. Once per battle round, you can target the bearer's unit with the Command Re-roll Stratagem for 0CP.",null],
  ["Phoenix Gem",35,"Warhost","Asuryani model only. The first time the bearer is destroyed, remove it from play, then, at the end of the phase, roll one D6: on a 2+, set the bearer back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of one of more enemy units, with its full wounds remaining.",null],
  ["Psychic Destroyer",30,"Warhost","Asuryani Psyker model only. Add 1 to the Damage characteristic of ranged Psychic weapons equipped by the bearer.",null],
  ["Timeless Strategist",15,"Warhost","Asuryani model only. At the start of the battle round, if the bearer is on the battlefield (or any Transport it is embarked within is on the battlefield), you receive 1 additional Battle Focus token.",null],
  ["Echoes of Ulthanesh",20,"Windrider Host","Asuryani Mounted model only. In your Command phase, roll one D6, adding 1 to the result if the bearer is not within your deployment zone, and adding an additional 1 to the result if the bearer is within your opponent's deployment zone: on a 5+, you gain 1CP.",null],
  ["Firstdrawn Blade",10,"Windrider Host","Asuryani Mounted model only. Models in the bearer's unit have the Scouts 9\" ability.",null],
  ["Mirage Field",25,"Windrider Host","Asuryani Mounted model only. Each time an attack targets the bearer's unit, subtract 1 from the Hit roll.",null],
  ["Seersight Strike",15,"Windrider Host","Asuryani Mounted Psyker model only. Psychic weapons equipped by the bearer have the [Anti-Monster 2+] and [Anti-Vehicle 2+] abilities.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Layered Wards","Armoured Warhost","",1,"Any phase, when a friendly AELDARI VEHICLE unit suffers a mortal wound.","That AELDARI VEHICLE unit.","Your unit has Feel No Pain 5+ against mortal wounds.",""],
  ["Soulsight","Armoured Warhost","",1,"Your Shooting phase, when a friendly AELDARI VEHICLE unit is selected to shoot.","That AELDARI VEHICLE unit.","Your unit’s attacks can re-roll: ▪ One hit roll. ▪ One wound roll. ▪ One damage roll.",""],
  ["Vectored Engines","Armoured Warhost","",1,"Your Movement phase, when a friendly AELDARI VEHICLE unit makes a fall-back move.","That AELDARI VEHICLE unit.","That move does not prevent your unit from being eligible to shoot.",""],
  ["Doom Inescapable","Aspect Host","Tactique de Bataille",1,"Your Shooting phase.","One Avatar of Khaine model from your army that has not been selected to shoot this phase.","Until the end of the phase, your model’s Wailing Doom ranged weapon has a Range characteristic of 18\" and a Damage characteristic of 8.",""],
  ["Khaine’s Vengeance","Aspect Host","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit (excluding MONSTERS and VEHICLES) is selected to Fall Back.","One Aspect Warriors or Avatar of Khaine unit from your army that is within Engagement Range of that enemy unit.","All models in that enemy unit must take a Desperate Escape test. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those tests.",""],
  ["Preternatural Precision","Aspect Host","Tactique de Bataille",1,"Your Shooting phase.","One Aspect Warriors unit from your army that has not been selected to shoot this phase.","Each time you use this Stratagem, you can remove one Aspect Shrine token your unit has (see datasheets). Then, select one of the following abilities, or select two of the following abilities if you removed an Aspect Shrine token during this usage of this Stratagem: [IGNORES COVER], [LETHAL HITS], [SUSTAINED HITS 1]. Until the end of the phase, ranged weapons equipped by models in your unit have the selected abilities.",""],
  ["Skyborne Sanctuary","Aspect Host","Ruse Stratégique",1,"End of the Fight phase.","One unengaged ASURYANI unit from your army that was eligible to fight this phase and one friendly TRANSPORT it is able to embark within.","If your ASURYANI unit is wholly within 6” of that TRANSPORT, it can embark within it.",""],
  ["To Their Final Breath","Aspect Host","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Aspect Warriors or Avatar of Khaine unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Each time you use this Stratagem, you can remove one Aspect Shrine token your unit has (see datasheets). Then, until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 to the result if you removed an Aspect Shrine token during this usage of this Stratagem. On a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Warrior Focus","Aspect Host","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Aspect Warriors or Avatar of Khaine unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, you can ignore any or all modifiers to that attack’s Ballistic Skill, Weapon skill, Strength, Armour Penetration and Damage characteristics and/or any or all modifiers to the Hit roll.",""],
  ["Cloak and Shadow","Corsair Coterie","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Aeldari Infantry unit from your army that is within range of an objective marker that you control and that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Stealth ability and your unit can only be selected as the target of a ranged attack if the attacking model is within 18\".",""],
  ["Into the Breach","Corsair Coterie","Ruse Stratégique",1,"Your Shooting phase, just after an Anhrathe unit from your army destroyed one or more enemy units.","That ANHRATHE unit.","After your unit has resolved all of its shooting attacks, it can make a Normal move of up to D6+1\".",""],
  ["Lethal Ruse","Corsair Coterie","Ruse Stratégique",1,"Your Movement phase, just after an AELDARI unit from your army Falls Back.","That AELDARI unit.","Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Fell Back. If it is an Anhrathe unit, also select one enemy unit your unit was within Engagement Range of at the start of the phase, and roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",""],
  ["Outcast Ambush","Corsair Coterie","Ruse Stratégique",1,"Your Shooting phase.","One Rangers or Shroud Runners unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] and [RAPID FIRE 1] abilities, and until the end of the phase, improve the Armour Penetration characteristic of those weapons by 1.",""],
  ["Pirates’ Due","Corsair Coterie","Tactique de Bataille",1,"The Fight phase.","One AELDARI unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, re-roll a Wound roll of 1. If your unit has the Anhrathe keyword, then until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit within range of an objective marker, you can re-roll the Wound roll instead.",""],
  ["Vengeful Sorrow","Corsair Coterie","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One AELDARI INFANTRY unit from your army, if one or more models in that unit were destroyed as a result of those attacks, and if that AELDARI unit is neither Battle-shocked nor within Engagement Range of one or more enemy units.","Your unit can make a surge move of up to D6+1\".",""],
  ["Death Answers Death","Devoted of Ynnead","Ruse Stratégique",1,"End of your opponent’s Shooting phase.","One Ynnari unit from your army (excluding Wraith Construct units), if one or more models in that unit were destroyed this phase.","Your unit can shoot as if it were your Shooting phase.",""],
  ["Emissaries of Ynnead","Devoted of Ynnead","Tactique de Bataille",1,"Fight phase, just after a Ynnari Infantry unit from your army has selected its targets.","That YNNARI INFANTRY unit.","Until the end of the phase, each time a model in your unit makes an attack, re-roll a Hit roll of 1. If your unit is below its Starting Strength, you can re-roll the Hit roll instead.",""],
  ["Macabre Resilience","Devoted of Ynnead","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Ynnari Infantry or Ynnari Mounted unit from your army (excluding Wraith Construct units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Wound roll.",""],
  ["Pall of Dread","Devoted of Ynnead","Ruse Stratégique",1,"Any phase.","One Ynnari unit from your army that was just destroyed while it was within range of one or more objective markers you controlled at the end of the previous phase. You can use this Stratagem on that unit even though it was just destroyed.","Select one of those objective markers. That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Parting the Veil","Devoted of Ynnead","Ruse Stratégique",2,"Fight phase, just after an enemy unit has selected its targets.","One Ynnari unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Soulsight","Devoted of Ynnead","Tactique de Bataille",1,"Your Shooting phase.","One Ynnari unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [LETHAL HITS] and [IGNORES COVER] abilities.",""],
  ["Impeding Fire","Eldritch Raiders","Équipement",1,"Start of your opponent’s Charge phase.","One Rangers, Shroud Runners or Starfang unit from your army.","Select one enemy unit (excluding TITANIC units) visible to and within 36\" of your unit. Until the end of the phase, each time that enemy unit declares a charge, subtract 2 from the Charge roll (this is not cumulative with any other negative modifiers to that Charge roll).",""],
  ["No Prey Too Big","Eldritch Raiders","Tactique de Bataille",1,"Your Shooting phase.","One Anhrathe, Rangers or Shroud Runners unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack, if the Strength characteristic of that attack is less than the highest Toughness characteristic of models in the target unit, add 1 to the Wound roll.",""],
  ["Raiders’ Spoils","Eldritch Raiders","Ruse Stratégique",1,"Command phase.","One Anhrathe unit from your army that is within Engagement Range of one or more enemy units.","Until the start of the next Command phase, add 1 to the Objective Control characteristic of models in your unit.",""],
  ["Ruthless Killers","Eldritch Raiders","Ruse Stratégique",1,"Your Shooting phase or the Fight phase.","One Corsair Voidscarred unit from your army that has not been selected to shoot or Fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, add 1 to the Damage characteristic of that attack.",""],
  ["Withdraw and Reinforce","Eldritch Raiders","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Anhrathe unit from your army that is not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves. If that unit is below Starting Strength, return all destroyed models (excluding CHARACTER models) to that unit.",""],
  ["Yriel’s Example","Eldritch Raiders","Fait Épique",1,"Fight phase, just after an enemy unit has selected its targets.","One Aeldari Infantry unit from your army (excluding Wraith Construct units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 5+ ability.",""],
  ["Deceptive Feint","Fateful Performance","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged HARLEQUINS INFANTRY unit.","That HARLEQUINS INFANTRY unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Exit the Stage","Fateful Performance","",1,"End of your opponent’s Fight phase.","One friendly unengaged HARLEQUINS unit.","Place your unit in strategic reserves",""],
  ["Heroes’ Fall","Fateful Performance","",1,"Fight phase, when an enemy unit targets a friendly HARLEQUINS unit.","That HARLEQUINS unit.","When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6: ▪ On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Bloody Dance","Ghosts of the Webway","Ruse Stratégique",1,"End of your opponent’s Charge phase.","One Harlequins Infantry or Harlequins Mounted unit from your army that is within 6\" of one or more enemy units and would be eligible to declare a charge against one or more of those enemy units if it were your Charge phase.","Your unit now declares a charge that only targets one or more of those enemy units, and you resolve that charge.","Note that even if this charge is successful, your unit does not receive any Charge bonus this turn."],
  ["Exit the Stage","Ghosts of the Webway","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Harlequins unit from your army that is not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Heroes’ Fall","Ghosts of the Webway","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Harlequins unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6. On a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Mocking Flight","Ghosts of the Webway","Ruse Stratégique",1,"Your Movement phase, just after a Harlequins unit from your army Falls Back.","That HARLEQUINS unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Staged Death","Ghosts of the Webway","Ruse Stratégique",1,"Any phase.","One Harlequins Character model from your army that was just destroyed. You can use this Stratagem on that model even though it was just destroyed.","At the end of the phase, set your model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with half of its starting number of wounds remaining.","Each model can only be targeted with this Stratagem once per battle."],
  ["Tricksters’ Retort","Ghosts of the Webway","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Troupe unit from your army that is within 8\" of that enemy unit.","Your unit can make a Normal move of up to 6\".",""],
  ["Blades of Asuryan","Guardian Battlehost","Tactique de Bataille",1,"Your Shooting phase.","One Dire Avengers or Guardians unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [PISTOL] ability.",""],
  ["Cost of Victory","Guardian Battlehost","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Guardians unit from your army.","If your unit is not within Engagement Range of one or more enemy units, remove it from the battlefield and place it into Strategic Reserves. When doing so, return every destroyed GUARDIANS model to your unit.",""],
  ["Shield Nodes","Guardian Battlehost","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Dire Avengers or Guardians unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","If your unit is within range of one or more objective markers, until the end of the phase, each time an attack targets your unit, subtract 1 from the Wound roll.",""],
  ["Time to Strike","Guardian Battlehost","Ruse Stratégique",1,"Your Movement phase.","One Storm Guardians unit from your army that has not been selected to move this phase.","Until the end of the phase, each time your unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 6\" to the Move characteristic of models in your unit. Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced.",""],
  ["Vaul’s Vengeance","Guardian Battlehost","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit destroys a Dire Avengers or Guardians unit from your army.","One War Walkers unit from your army.","After that enemy unit has finished making its attacks, your unit can shoot as if it were your Shooting phase, but when resolving those attacks, it can only target that enemy unit (and only if it is an eligible target).","You can only use this Stratagem once per battle round."],
  ["Warding Salvoes","Guardian Battlehost","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Dire Avengers or Guardians unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit within range of one or more objective markers, you can re-roll the Wound roll.",""],
  ["Casting Back the Veil","Path of the Outcast","",1,"Your Shooting phase, when a friendly RANGERS/SHROUD RUNNERS unit has shot.","That RANGERS/SHROUD RUNNERS unit.","Select one enemy unit hit by those ranged attacks. That enemy unit has +6\" detection range.",""],
  ["Eldritch Suppression","Path of the Outcast","",1,"Your Shooting phase, when a friendly RANGERS/SHROUD RUNNERS unit has shot.","That RANGERS/SHROUD RUNNERS unit.","Select one enemy unit hit by those ranged attacks. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll if a model in that enemy unit was destroyed by those attacks.",""],
  ["Nomads of the Hidden Way","Path of the Outcast","",1,"Your Shooting phase, when a friendly RANGERS/SHROUD RUNNERS unit has shot.","That RANGERS/SHROUD RUNNERS unit.","▪ Your unit can make a normal move of up to D6\". ▪ Your unit is not eligible to declare a charge or embark within a TRANSPORT until the end of the turn.",""],
  ["Fate Inescapable","Seer Council","Tactique de Bataille",1,"Your Shooting phase.","One Asuryani Infantry unit from your army (excluding Wraith Construct units) that has not been selected to shoot this phase and is within 9\" of one or more friendly Asuryani Psyker models.","Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability and each time a model in your unit makes an attack, on a Critical Wound, improve the Armour Penetration characteristic of that attack by 1.",""],
  ["Forewarned","Seer Council","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Asuryani Infantry unit from your army (excluding Wraith Construct units) that was selected as the target of one or more of the attacking unit’s attacks and is within 9\" of one or more friendly Asuryani Psyker models.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll and subtract 1 from the Wound roll.",""],
  ["Isha’s Fury","Seer Council","Fait Épique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Asuryani Psyker model from your army within 9\" of that enemy unit.","Roll six D6: for each 3+, that enemy unit suffers 1 mortal wound.",""],
  ["Presentiment of Dread","Seer Council","Ruse Stratégique",1,"Command phase.","One Asuryani Psyker model from your army.","Select one enemy unit within 18\" of and visible to your model. That enemy unit must take a Battle-shock test, subtracting 1 from that test.",""],
  ["Psychic Shield","Seer Council","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Asuryani Infantry unit from your army (excluding Wraith Construct units) that was selected as the target of one or more of the attacking unit’s attacks and is within 9\" of one or more friendly Asuryani Psyker models.","Until the end of the phase, your unit can only be selected as the target of a ranged attack if the attacking model is within 18\".",""],
  ["Unshrouded Truth","Seer Council","Ruse Stratégique",1,"Your Movement phase.","One Asuryani Infantry unit from your army (excluding Wraith Construct units) that has not been selected to move this phase, was not set up on the battlefield this phase, and is within 9\" of one or more friendly Asuryani Psyker models.","▪ Place your unit in strategic reserves. ▪ Your unit has Deep Strike. ▪ Your unit must make an ingress move this phase.","Until the end of the phase, your unit is not eligible to be selected to move."],
  ["Fangs of the Brood","Serpent’s Brood","",1,"Start of the Fight phase.","One Troupe unit from your army.","Until the end of the phase, when using your unit’s Dance of Death ability, you can select three of the abilities for your unit to gain, instead of one.",""],
  ["Skyward Lunge","Serpent’s Brood","",1,"End of your opponent’s Fight phase.","One Harlequins Vehicle or Harlequins Mounted unit from your army.","If your unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves.",""],
  ["Striking Stride","Serpent’s Brood","",1,"Your Charge phase.","One Harlequins unit from your army.","Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Venomous Wrath","Serpent’s Brood","",1,"Your Shooting phase.","One Harlequins Vehicle unit from your army that has not been selected to shoot this phase.","After your unit has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\". Until the end of the turn, your unit is not eligible to declare a charge.",""],
  ["Weavers’ Coils","Serpent’s Brood","",1,"End of your Fight phase.","One Harlequins Mounted unit from your army that was eligible to fight this phase.","If your unit is not within Engagement Range of one or more enemy units, it can make a Normal move. Otherwise, your unit can make a Fall Back move of up to 6\".",""],
  ["Weaving Stride","Serpent’s Brood","",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Harlequins Infantry unit from your army that is within 8\" of that enemy unit.","Your unit can make a Normal move of up to 6\".",""],
  ["Blades from Beyond","Spirit Conclave","Tactique de Bataille",1,"Fight phase.","One Wraithblades, Wraithlord or Wraithknight unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [DEVASTATING WOUNDS] ability.",""],
  ["Crushing Strides","Spirit Conclave","Tactique de Bataille",1,"Your Charge phase, just after a Wraithblades, Wraithlord or Wraithknight unit from your army ends a Charge move.","That WRAITHBLADES, WRAITHLORD or WRAITHKNIGHT unit.","Select one enemy unit within Engagement Range of your unit and roll one D6 for each WRAITHBLADES model in your unit, or roll four D6 if your unit has the WRAITHLORD keyword, or roll six D6 if your unit has the WRAITHKNIGHT keyword: for each 3+, that enemy unit suffers 1 mortal wound.",""],
  ["Seer’s Eye","Spirit Conclave","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Aeldari Psyker model from your army and one friendly Wraith Construct unit within 12\" of it that has not been selected to shoot or fight this phase.","Select one enemy unit visible to your PSYKER model. Until the end of the phase, each time a model in your WRAITH CONSTRUCT unit makes an attack that targets that enemy unit, you can ignore any or all modifiers to the Armour Penetration and/or Damage characteristics of that attack.",""],
  ["Soul Bridge","Spirit Conclave","Ruse Stratégique",1,"Your Command phase.","One Wraithblades, Wraithguard or Wraithlord unit from your army and one Asuryani Psyker model from your army.","Until the start of your next Command phase, your WRAITHBLADES, WRAITHGUARD or WRAITHLORD unit is considered to be within 12\" of your PSYKER model for the purposes of the Psychic Guidance and Spirit Guides abilities.",""],
  ["Spirit Token","Spirit Conclave","Ruse Stratégique",1,"Start of your Movement phase.","One Wraithblades or Wraithguard unit from your army.","Select one objective marker you control that your unit is within range of. That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Wraithbone Armour","Spirit Conclave","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Wraith Construct unit from your army (excluding TiTANic units] that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.",""],
  ["Captivating Performance","Twilight Flickers","",1,"End of your Movement phase.","One friendly TROUPE unit.","Select one objective your unit is controlling. That objective is secured.",""],
  ["Phantasmal Mirage","Twilight Flickers","",1,"Your Shooting phase, when a friendly HARLEQUINS VEHICLE unit has shot.","That HARLEQUINS VEHICLE unit.","▪ Your unit can make a normal move of up to D6\". ▪ Your unit is not eligible to declare a charge until the end of the turn.",""],
  ["Presaged Rehearsal","Twilight Flickers","",1,"Fight phase, when a friendly TROUPE unit is selected to fight.","That TROUPE unit.","Your unit’s melee attacks have [LANCE].",""],
  ["Blitzing Firepower","Warhost","Tactique de Bataille",1,"Your Shooting phase.","One Asuryani unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability while targeting an enemy unit within 12\". If such a weapon already has that ability, until the end of the phase, each time an attack is made with that weapon, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Feigned Retreat","Warhost","Ruse Stratégique",1,"Your Movement phase, just after an Asuryani unit from your army Falls Back.","That ASURYANI unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Fire and Fade","Warhost","Ruse Stratégique",1,"Your Shooting phase, just after an Asuryani Infantry unit from your army (excluding Aircraft, Asurmen and Wraith Construct units) has shot.","That ASURYANI unit.","Your unit can make a Normal move of up to D6+1\".","Until the end of the turn, your unit is not eligible to declare a charge or embark within a Transport."],
  ["Lightning-Fast Reactions","Warhost","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Asuryani unit from your army (excluding Wraith Construct units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Skyborne Sanctuary","Warhost","Ruse Stratégique",1,"End of the Fight phase.","One unengaged ASURYANI unit from your army that was eligible to fight this phase and one friendly TRANSPORT it is able to embark within.","If your ASURYANI unit is wholly within 6” of that TRANSPORT, it can embark within it.",""],
  ["Webway Tunnel","Warhost","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Asuryani Infantry unit from your army that is wholly within 9\" of one or more battlefield edges.","If your unit is not within Engagement Range of one or more enemy units, remove it from the battlefield and place it into Strategic Reserves.",""],
  ["Daring Riders","Windrider Host","Ruse Stratégique",1,"The Reinforcements step of your Movement phase.","One Asuryani Mounted or VYPER unit from your army in Reserves.","Until the end of the phase, when setting up your unit on the battlefield from Reserves, it can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units. When doing so, if your unit is set up within 8\" horizontally of one or more enemy units, until the end of the turn, it is not eligible to declare a charge.",""],
  ["Death from on High","Windrider Host","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Asuryani Mounted or VYPER unit from your army that was set upon the battlefield from Reserves this turn and has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, you can re-roll the Wound roll.",""],
  ["Focused Firepower","Windrider Host","Tactique de Bataille",1,"Your Shooting phase.","One Asuryani Mounted or VYPER unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack, improve the Armour Penetration characteristic of that attack by 1.",""],
  ["Overflight","Windrider Host","Ruse Stratégique",1,"End of your Shooting phase or the end of the Fight phase.","One Asuryani Mounted unit from your army that destroyed one or more enemy units this phase.","Your unit can make a Normal move of up to 7\".",""],
  ["Spiralling Evasion","Windrider Host","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Asuryani Mounted or VYPER unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a 4+ invulnerable save.",""],
  ["Wind of Blades","Windrider Host","Ruse Stratégique",1,"Your Movement phase.","One Asuryani Mounted or Vyper unit from your army that has not been selected to move this phase.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back.",""],
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
  "Cobra",
  "Crimson Hunter",
  "Falcon",
  "Fire Prism",
  "Firestorm",
  "Hemlock Wraithfighter",
  "Hornet",
  "Lynx",
  "Night Spinner",
  "Nightwing",
  "Phoenix",
  "Scorpion",
  "Starfangs",
  "Starweaver",
  "Vampire Hunter",
  "Vampire Raider",
  "Voidweaver",
  "War Walkers",
  "Warp Hunter",
  "Wasp Assault Walker",
  "Wave Serpent",
  "Ynnari Raider",
  "Ynnari Venom"
 ],
 "monster": [
  "Phantom Titan",
  "Revenant Titan",
  "Skathach Wraithknight",
  "Wraithknight",
  "Wraithknight with Ghostglaive",
  "Wraithlord",
  "Wraithseer"
 ],
 "battleline": [
  "Corsair Voidreavers",
  "Guardian Defenders",
  "Storm Guardians",
  "Ynnari Kabalite Warriors",
  "Ynnari Wyches"
 ],
 "epic": [
  "Amallyn Shadowguide",
  "Asurmen",
  "Avatar of Khaine",
  "Baharroth",
  "Eldrad Ulthran",
  "Fuegan",
  "Illic Nightspear",
  "Irillyth",
  "Jain Zar",
  "Karandras",
  "Kharseth",
  "Lhykhis",
  "Maugan Ra",
  "Prince Yriel",
  "Solitaire",
  "The Visarch",
  "The Yncarne",
  "Yvraine"
 ],
 "infantry": [
  "Corsair Reaver Band",
  "Corsair Skyreavers",
  "Corsair Voidscarred",
  "D-Cannon Platform",
  "Dark Reapers",
  "Dire Avengers",
  "Fire Dragons",
  "Howling Banshees",
  "Rangers",
  "Shadow Spectres",
  "Shadow Weaver Platform",
  "Striking Scorpions",
  "Swooping Hawks",
  "Troupe",
  "Vibro Cannon Platform",
  "Warlock Conclave",
  "Warp Spiders",
  "Wraithblades",
  "Wraithguard",
  "Ynnari Incubi"
 ],
 "character": [
  "Autarch",
  "Autarch Skyrunner",
  "Autarch Wayleaper",
  "Bonesinger",
  "Clanblade",
  "Death Jester",
  "Farseer",
  "Farseer Skyrunner",
  "Leystalker",
  "Shadowseer",
  "Spiritseer",
  "Stonesinger",
  "Troupe Master",
  "Warlock",
  "Ynnari Archon",
  "Ynnari Succubus"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Asurmen": "40",
 "Autarch": "32",
 "Autarch Wayleaper": "32",
 "Avatar of Khaine": "80",
 "Baharroth": "40",
 "Corsair Voidreavers": "28.5",
 "Corsair Voidscarred": "28.5",
 "Crimson Hunter": "120x92",
 "Dark Reapers": "28.5",
 "Death Jester": "25",
 "Dire Avengers": "28.5",
 "Eldrad Ulthran": "32",
 "Falcon": "120x92",
 "Farseer": "25",
 "Farseer Skyrunner": "60x35.5",
 "Fire Dragons": "28.5",
 "Fire Prism": "120x92",
 "Fuegan": "40",
 "Guardian Defenders": "28.5",
 "Hemlock Wraithfighter": "120x92",
 "Howling Banshees": "28.5",
 "Jain Zar": "40",
 "Maugan Ra": "40",
 "Night Spinner": "120x92",
 "Rangers": "28.5",
 "Shadowseer": "25",
 "Shining Spears": "120x92",
 "Shroud Runners": "120x92",
 "Skyweavers": "120x92",
 "Solitaire": "25",
 "Spiritseer": "25",
 "Starweaver": "120x92",
 "Storm Guardians": "28.5",
 "Striking Scorpions": "28.5",
 "D-Cannon Platform": "40",
 "Swooping Hawks": "32",
 "The Visarch": "32",
 "The Yncarne": "80",
 "Troupe": "25",
 "Troupe Master": "25",
 "Voidweaver": "120x92",
 "Warlock": "32",
 "Warlock Conclave": "32",
 "Warp Spiders": "28.5",
 "Wave Serpent": "120x92",
 "Windriders": "60x35.5",
 "Wraithknight": "120x92",
 "Wraithlord": "60",
 "Wraithguard": "40",
 "Yvraine": "75x42",
 "Wraithblades": "40",
 "Phantom Titan": "coque",
 "Revenant Titan": "coque",
 "Warlock Skyrunners": "60x35.5",
 "Ynnari Archon": "32",
 "Lhykhis": "40",
 "War Walkers": "60",
 "Shadow Weaver Platform": "40",
 "Vibro Cannon Platform": "40",
 "Wraithknight with Ghostglaive": "120x92",
 "Ynnari Succubus": "25",
 "Ynnari Kabalite Warriors": "25",
 "Ynnari Wyches": "25",
 "Ynnari Incubi": "28.5",
 "Ynnari Reavers": "60x35.5",
 "Ynnari Raider": "120x92",
 "Ynnari Venom": "120x92",
 "Prince Yriel": "40",
 "Kharseth": "32",
 "Starfangs": "105x70",
 "Corsair Skyreavers": "28.5"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Avatar of Khaine": 5,
 "Crimson Hunter": 4,
 "Falcon": 4,
 "Fire Prism": 4,
 "Hemlock Wraithfighter": 4,
 "Night Spinner": 4,
 "Wave Serpent": 4,
 "Wraithknight": 6,
 "Cobra": 8,
 "Scorpion": 8,
 "Lynx": 5,
 "Nightwing": 4,
 "Skathach Wraithknight": 6,
 "Phantom Titan": 16,
 "Revenant Titan": 10,
 "Warp Hunter": 4,
 "Firestorm": 4,
 "Phoenix": 5,
 "Vampire Hunter": 10,
 "Vampire Raider": 10,
 "Wraithknight with Ghostglaive": 6
};

const TRANSPORTS = {
 "Falcon": "This model has a transport capacity of 6 **AELDARI INFANTRY** models. Each **WRAITH CONSTRUCT** model takes the space of 2 models. It cannot transport **JUMP PACK** models or **YNNARI** models (excluding **ASURYANI**, **YVRAINE** and **THE VISARCH** models).",
 "Starweaver": "This model has a transport capacity of 6 Harlequins Infantry models.",
 "Wave Serpent": "This model has a transport capacity of 12 **ASURYANI INFANTRY** models. Each **WRAITH CONSTRUCT** model takes the space of 2 models. It cannot transport **JUMP PACK** models or **YNNARI** models (excluding **ASURYANI**, **YVRAINE** and **THE VISARCH** models).",
 "Firestorm": "This model has a transport capacity of 6 Aeldari Infantry models. Each Wraith Construct model takes the space of 2 models. It cannot transport Jump Pack models",
 "Ynnari Raider": "This model has a transport capacity of 11 models from the following units: The Visarch, Ynnari Archon, Ynnari Incubi, Ynnari Kabalite Warriors, Ynnari Succubus, Ynnari Wyches, Yvraine.",
 "Ynnari Venom": "This model has a transport capacity of 6 models from the following units: **^^The Visarch^^**, **^^Ynnari Archon^^**, **^^Ynnari Incubi^^**, **^^Ynnari Kabalite Warriors^^**, **^^Ynnari Succubus^^**, **^^Ynnari Wyches^^**, **^^Yvraine^^**.\n\nBefore the battle, at the start of the Declare Battle Formations step, you can select one **YNNARI KABALITE WARRIORS** or **YNNARI WYCHES** unit from your army that has not already been split. If you do, that unit is split into two units, each containing as equal a number of models as possible (when splitting a unit in this way, make a note of which models form each of the two new units). One of these units must start the battle embarked within this **TRANSPORT**; the other can start the battle embarked within another **TRANSPORT**, or it can be deployed as a separate unit."
};
const FACTION = [
 [
  "Battle Focus",
  "If your Army Faction is Asuryani, at the start of the battle round, you receive a number of Battle Focus tokens based on the battle size, as shown in the table below. BATTLE SIZEBATTLE FOCUS TOKENSIncursion2Strike Force4Onslaught6 Each time one of the triggers shown in the Agile Manoeuvres section below occurs, you can spend one Battle Focus token to enable the relevant eligible unit to perform that Agile Manoeuvre. A unit is eligible to perform an Agile Manoeuvre if it has this ability and has not already performed an Agile Manoeuvre in the same phase. Unless otherwise stated, you cannot trigger the same Agile Manoeuvre more than once per phase. At the end of the battle round, all unspent Battle Focus tokens are lost. AGILE MANOEUVRES SWIFT AS THE WIND TRIGGER: When an eligible unit from your army is selected to make a Normal, Advance or Fall Back move. You can trigger this Agile Manoeuvre more than once per phase (provided a different unit performs it each time). EFFECT: Until the end of the phase, add 2\" to the Move characteristic of models in that unit. FLITTING SHADOWS TRIGGER: When an eligible unit from your army is selected to make a Normal, Advance or Fall Back move, is set up on the battlefield, or declares a charge. EFFECT: Until the end of the turn, enemy units cannot use the Fire Overwatch Stratagem to shoot at that unit. STAR ENGINES TRIGGER: When an eligible VEHICLE unit from your army is selected to make an Advance move. EFFECT: Until the end of the turn, Ranged weapons equipped by this unit have the [ASSAULT] ability. SUDDEN STRIKE TRIGGER: When an eligible unit from your army ends a charge move. EFFECT: Until the end of the turn, each time a model in that unit makes a Pile-in or Consolidation move, it can move up to 6\" instead of up to 3\". OPPORTUNITY SEIZED TRIGGER: When an enemy unit ends a Fall Back move. EFFECT: One eligible unit from your army (excluding TITANIC units) that started the phase within Engagement Range of that enemy unit can make a Normal move of up to D6+1\". FADE BACK TRIGGER: In your opponent’s Shooting phase, just after an enemy unit has shot. EFFECT: One eligible unit from your army (excluding TITANIC units) that was hit by one or more of those attacks can make a Normal move of up to D6+1\"."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/aeldari.json —
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
  cle : "aeldari",
  nom : "Aeldari",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
