/* ============================================================
   Données Agents Impériaux — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py agents

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 41 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     29 fiches sur 46 en ont un. Les autres — des Legends, que le
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
  ["Aquila Kill Team",6,5,3,0,2,[5, 10],{"5": 110, "10": 210},0,"",0,"",2,"6+"],
  ["Callidus Assassin",7,4,6,4,4,[1],{"1": 100},0,"",0,"",1,"6+"],
  ["Corvus Blackstar",14,10,3,0,14,[1],{"1": 180},0,"",0,"",0,"6+"],
  ["Culexus Assassin",7,4,6,4,4,[1],{"1": 85},0,"",0,"",1,"6+"],
  ["Daemonhost",6,3,5,5,3,[1, 2],{"1": 40, "2": 80},0,"",1,"",0,"7+"],
  ["Damned Legionnaires",6,4,3,4,2,[5, 10],{"5": 90, "10": 180},0,"",1,"",1,"6+"],
  ["Deathwatch Kill Team",6,5,3,0,2,[5, 10],{"5": 115, "10": 220},0,"",0,"",2,"6+"],
  ["Deathwatch Terminator Squad",5,5,2,4,3,[5, 10],{"5": 210, "10": 420},0,"",1,"",1,"6+"],
  ["Eversor Assassin",9,4,6,4,4,[1],{"1": 110},0,"",0,"",1,"6+"],
  ["Exaction Squad",6,3,4,0,1,[11],{"11": 85},0,"",0,"",1,"7+"],
  ["Fortis Kill Team",6,4,3,0,2,[5, 10],{"5": 100, "10": 200},0,"",1,"",1,"6+"],
  ["Grey Knights Terminator Squad",5,6,2,4,3,[5],{"5": 190},0,"",0,"",2,"6+"],
  ["Imperial Navy Breachers",6,3,4,0,1,[10],{"10": 90},0,"",0,"",2,"7+"],
  ["Imperial Rhino",12,9,3,0,10,[1],[[1, {"1": 65}], [4, {"1": 75}]],0,"",0,"",2,"6+"],
  ["Indomitor Kill Team",5,6,3,0,3,[5, 10],{"5": 120, "10": 240},0,"",1,"",1,"6+"],
  ["Inquisitor",6,3,4,5,4,[1],{"1": 65},0,"Meneur",0,"",1,"6+"],
  ["Inquisitor Coteaz",6,3,2,4,4,[1],{"1": 95},0,"Meneur",0,"",1,"6+"],
  ["Inquisitor Draxus",6,3,3,5,4,[1],{"1": 110},0,"Meneur",0,"",1,"6+"],
  ["Inquisitor Eisenhorn",6,3,4,5,4,[1],{"1": 65},0,"Meneur",1,"",1,"6+"],
  ["Inquisitor Greyfax",6,3,3,5,4,[1],{"1": 65},0,"Meneur",0,"",1,"6+"],
  ["Inquisitor Karamazov",8,9,3,4,10,[1],{"1": 140},0,"",1,"",3,"6+"],
  ["Inquisitor Kroyle",12,4,3,4,6,[1],{"1": 100},0,"",0,"",2,"6+"],
  ["Inquisitor Ostromandeus",6,3,3,5,4,[2],{"2": 65},0,"Meneur",1,"",1,"6+"],
  ["Inquisitor in Terminator Armour",5,4,2,4,5,[1],{"1": 70},0,"Meneur",1,"",1,"6+"],
  ["Inquisitorial Agents",6,3,5,0,1,[6, 12],{"6": 60, "12": 120},0,"",0,"",1,"7+"],
  ["Inquisitorial Chimera",10,9,3,0,11,[1],[[1, {"1": 60}], [4, {"1": 70}]],0,"",0,"",2,"7+"],
  ["Janus Draik",6,3,4,4,4,[1],{"1": 40},0,"Meneur",1,"",1,"6+"],
  ["Jokaero Weaponsmith",6,3,5,4,2,[1],{"1": 30},0,"Meneur",1,"",0,"7+"],
  ["Kill Team Cassius",6,4,3,4,4,[11],{"11": 220},0,"",1,"",2,"5+"],
  ["Ministorum Priest",6,3,6,4,3,[1],{"1": 40},0,"Appui",0,"",1,"7+"],
  ["Navigator",6,3,5,4,3,[1],{"1": 75},0,"Meneur",0,"",1,"7+"],
  ["Neyam Shai Murad",6,3,4,4,4,[1],{"1": 40},0,"Meneur",1,"",1,"6+"],
  ["Proteus Kill Team",12,5,3,0,3,[5, 10],{"5": 160, "10": 320},0,"",1,"",2,"6+"],
  ["Rogue Trader Entourage",6,3,4,4,4,[4],{"4": 105},0,"Meneur",0,"",1,"6+"],
  ["Sanctifiers",6,3,6,5,1,[9],{"9": 100},0,"",0,"",1,"7+"],
  ["Sisters of Battle Immolator",12,10,3,6,11,[1],[[1, {"1": 105}], [4, {"1": 115}]],0,"",0,"",2,"7+"],
  ["Sisters of Battle Squad",6,3,3,6,1,[10],{"10": 110},0,"",0,"",2,"7+"],
  ["Spectrus Kill Team",6,4,3,0,2,[5, 10],{"5": 90, "10": 180},0,"",1,"",1,"6+"],
  ["Subductor Squad",6,3,3,4,1,[11],{"11": 100},0,"",0,"",1,"7+"],
  ["UR-025",5,5,3,0,4,[1],{"1": 55},0,"",1,"",1,"7+"],
  ["Veteran Bike Squad",12,5,3,0,3,[3, 6],{"3": 70, "6": 140},0,"",1,"",2,"6+"],
  ["Vigilant Squad",6,3,4,0,1,[11],{"11": 85},0,"",0,"",2,"7+"],
  ["Vindicare Assassin",7,4,6,4,4,[1],{"1": 125},0,"",0,"",1,"6+"],
  ["Voidsmen-at-Arms",6,3,4,0,1,[6],{"6": 70},0,"",0,"",2,"7+"],
  ["Watch Captain Artemis",6,5,3,4,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Watch Master",6,5,2,4,5,[1],{"1": 105},0,"Meneur",0,"",1,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Aquila Kill Team","Bolt pistol","T","1",3,5,1,"1","","12\""],
  ["Aquila Kill Team","Deathwatch marksman bolt carbine","T","2",3,5,1,"1","heavy lethal","24\""],
  ["Aquila Kill Team","Frag cannon","T","2",3,7,2,"2","heavy lethal rf:1","18\""],
  ["Aquila Kill Team","Hellstorm bolt rifle","T","2",3,5,2,"2","assault heavy lethal","30\""],
  ["Aquila Kill Team","Special-issue bolt pistol","T","1",3,5,1,"1","lethal precision","18\""],
  ["Aquila Kill Team","Stalker bolt rifle","T","2",3,5,2,"2","heavy lethal precision","30\""],
  ["Aquila Kill Team","➤ Grenade Launcher (Frag)","T","4",3,4,1,"1","","24\""],
  ["Aquila Kill Team","➤ Grenade Launcher (Krak)","T","1",3,10,2,"3","rf:1","24\""],
  ["Aquila Kill Team","➤ Infernus heavy bolter (Bolt)","T","3",3,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Aquila Kill Team","➤ Infernus heavy bolter (Infernus)","T","3",0,5,1,"1","torrent","12\""],
  ["Aquila Kill Team","➤ Plasma incinerator - Standard","T","2",3,7,2,"2","assault rf:1","24\""],
  ["Aquila Kill Team","➤ Plasma incinerator - Supercharge","T","2",3,8,3,"2","assault hazardous rf:1","24\""],
  ["Aquila Kill Team","➤ Plasma pistol - Standard","T","1",3,7,2,"1","","12\""],
  ["Aquila Kill Team","➤ Plasma pistol - Supercharge","T","1",3,8,3,"2","hazardous","12\""],
  ["Aquila Kill Team","Heavy thunder hammer","C","3",4,10,2,"3","dev","càc"],
  ["Aquila Kill Team","Knives and Fists","C","3",3,5,0,"1","","càc"],
  ["Aquila Kill Team","Power weapon","C","4",3,5,2,"1","sust:1","càc"],
  ["Aquila Kill Team","Xenophase blade","C","4",3,5,2,"1","dev","càc"],
  ["Callidus Assassin","Neural shredder","T","D6",0,5,2,"1","anti:2:inf torrent","12\""],
  ["Callidus Assassin","Phase sword and poison blades","C","5",2,5,4,"2","lethal precision","càc"],
  ["Corvus Blackstar","Blackstar rocket launcher","T","4",3,5,0,"1","","30\""],
  ["Corvus Blackstar","Hurricane bolter","T","6",3,5,1,"1","rf:6 twin","24\""],
  ["Corvus Blackstar","Stormstrike missile launcher","T","1",3,10,2,"3","","48\""],
  ["Corvus Blackstar","Twin assault cannon","T","6",3,6,2,"1","sust:1 twin","24\""],
  ["Corvus Blackstar","Twin lascannon","T","1",3,12,3,"D3+3","twin","48\""],
  ["Corvus Blackstar","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Culexus Assassin","Animus speculum","T","3",2,5,2,"D3","anti:2 assault precision","24\""],
  ["Culexus Assassin","Life-draining touch","C","4",2,4,2,"2","anti:2 dev precision","càc"],
  ["Daemonhost","Unholy gaze","T","3",4,8,2,"D3","psychic","18\""],
  ["Daemonhost","Warp grasp","C","4",3,4,2,"1","lethal psychic","càc"],
  ["Damned Legionnaires","Bolt pistol","T","1",3,4,0,"1","ignorescover pistol","12\""],
  ["Damned Legionnaires","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Damned Legionnaires","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Damned Legionnaires","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Damned Legionnaires","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Damned Legionnaires","Multi-melta","T","2",4,9,4,"D6","heavy melta:2","18\""],
  ["Damned Legionnaires","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Damned Legionnaires","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Damned Legionnaires","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Damned Legionnaires","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Damned Legionnaires","Astartes chainsword","C","5",3,4,1,"1","","càc"],
  ["Damned Legionnaires","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Damned Legionnaires","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Deathwatch Kill Team","Boltgun","T","2",3,5,1,"1","rf:1","24\""],
  ["Deathwatch Kill Team","Deathwatch shotgun","T","2",3,4,1,"2","assault","18\""],
  ["Deathwatch Kill Team","Frag cannon","T","2",4,7,1,"2","heavy lethal rf:1","18\""],
  ["Deathwatch Kill Team","Stalker-pattern boltgun","T","1",3,5,1,"2","heavy precision","24\""],
  ["Deathwatch Kill Team","➤ Combi-weapon (Damnatus)","T","1",3,9,3,"D3+2","melta:2","12\""],
  ["Deathwatch Kill Team","➤ Combi-weapon (Infernus)","T","3",0,4,0,"1","torrent","12\""],
  ["Deathwatch Kill Team","➤ Combi-weapon (Purgatus)","T","2",3,7,2,"2","","24\""],
  ["Deathwatch Kill Team","➤ Infernus heavy bolter (Bolt)","T","3",4,5,1,"2","heavy rf:2 sust:1","36\""],
  ["Deathwatch Kill Team","➤ Infernus heavy bolter (Infernus)","T","3",0,5,1,"1","torrent","12\""],
  ["Deathwatch Kill Team","Black Shield blades","C","4",3,5,2,"1","twin","càc"],
  ["Deathwatch Kill Team","Heavy thunder hammer","C","3",4,10,2,"3","dev","càc"],
  ["Deathwatch Kill Team","Knives and Fists","C","3",3,5,0,"1","","càc"],
  ["Deathwatch Kill Team","Power weapon","C","3",3,5,2,"1","","càc"],
  ["Deathwatch Kill Team","Xenophase blade","C","4",3,5,2,"1","dev","càc"],
  ["Deathwatch Terminator Squad","Assault cannon","T","6",3,6,0,"1","dev","24\""],
  ["Deathwatch Terminator Squad","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Deathwatch Terminator Squad","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Deathwatch Terminator Squad","➤ Cyclone missile launcher - frag","T","2D6",3,4,0,"1","blast","36\""],
  ["Deathwatch Terminator Squad","➤ Cyclone missile launcher - krak","T","2",3,9,2,"D6","","36\""],
  ["Deathwatch Terminator Squad","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast heavy","36\""],
  ["Deathwatch Terminator Squad","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous heavy","36\""],
  ["Deathwatch Terminator Squad","Chainfist","C","3",4,8,2,"2","anti:3:veh","càc"],
  ["Deathwatch Terminator Squad","Power Fist","C","3",3,8,2,"2","","càc"],
  ["Deathwatch Terminator Squad","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Deathwatch Terminator Squad","Thunder hammer","C","3",4,8,2,"2","dev","càc"],
  ["Deathwatch Terminator Squad","Twin lightning claws","C","5",3,5,2,"1","twin","càc"],
  ["Eversor Assassin","Executioner pistol","T","4",2,4,0,"1","anti:3:inf pistol precision sust:3","12\""],
  ["Eversor Assassin","Power sword and neuro gauntlet","C","6",2,5,2,"2","anti:3:inf precision sust:3","càc"],
  ["Exaction Squad","Arbites combat shotgun","T","2",4,4,0,"1","assault","18\""],
  ["Exaction Squad","Arbites shotpistol","T","1",4,4,0,"1","pistol","12\""],
  ["Exaction Squad","Executioner shotgun","T","1",4,5,1,"1","ignorescover precision","24\""],
  ["Exaction Squad","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Exaction Squad","Webber","T","D6",0,2,0,"1","assault dev torrent","12\""],
  ["Exaction Squad","➤ Arbites grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Exaction Squad","➤ Arbites grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Exaction Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Exaction Squad","Excruciator maul","C","2",3,4,1,"2","","càc"],
  ["Exaction Squad","Mechanical bite","C","3",4,4,0,"1","","càc"],
  ["Fortis Kill Team","Bolt Rifle","T","2",3,4,1,"1","assault heavy","24\""],
  ["Fortis Kill Team","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Fortis Kill Team","Hand Flamer","T","D6",0,3,0,"1","ignorescover pistol torrent","12\""],
  ["Fortis Kill Team","Heavy bolt pistol","T","1",3,4,1,"1","pistol","12\""],
  ["Fortis Kill Team","Long Vigil ranged weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Fortis Kill Team","Twin Bolt Rifle","T","2",3,4,1,"1","twin","24\""],
  ["Fortis Kill Team","➤ Plasma incinerator - Standard","T","2",3,7,2,"1","assault heavy","24\""],
  ["Fortis Kill Team","➤ Plasma incinerator - Supercharge","T","2",3,8,3,"2","assault hazardous heavy","24\""],
  ["Fortis Kill Team","➤ Plasma pistol - Standard","T","1",3,7,2,"1","pistol","12\""],
  ["Fortis Kill Team","➤ Plasma pistol - Supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Fortis Kill Team","Astartes chainsword","C","4",4,4,1,"1","","càc"],
  ["Fortis Kill Team","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Fortis Kill Team","Long Vigil melee weapon","C","3",3,5,2,"1","","càc"],
  ["Grey Knights Terminator Squad","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Grey Knights Terminator Squad","Psilencer","T","6",3,5,0,"1","psychic sust:1","24\""],
  ["Grey Knights Terminator Squad","Psycannon","T","3",3,8,1,"2","psychic","24\""],
  ["Grey Knights Terminator Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Grey Knights Terminator Squad","Nemesis force weapon","C","4",3,6,2,"2","psychic","càc"],
  ["Imperial Navy Breachers","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Imperial Navy Breachers","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Imperial Navy Breachers","Demolition charge","T","D6",5,9,2,"2","assault blast hazardous oneshot","6\""],
  ["Imperial Navy Breachers","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Imperial Navy Breachers","Navis heavy shotgun","T","4",4,4,0,"1","assault","12\""],
  ["Imperial Navy Breachers","Navis las-volley","T","4",4,6,0,"1","","18\""],
  ["Imperial Navy Breachers","Navis shotgun","T","2",4,4,0,"1","assault","12\""],
  ["Imperial Navy Breachers","➤ Plasma gun - standard","T","1",4,7,1,"1","rf:1","24\""],
  ["Imperial Navy Breachers","➤ Plasma gun - supercharge","T","1",4,8,2,"2","hazardous rf:1","24\""],
  ["Imperial Navy Breachers","Chainfist","C","1",5,6,2,"2","anti:3:veh","càc"],
  ["Imperial Navy Breachers","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Imperial Navy Breachers","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Imperial Navy Breachers","Power weapon","C","2",4,4,2,"1","","càc"],
  ["Imperial Rhino","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Imperial Rhino","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Imperial Rhino","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Indomitor Kill Team","Assault bolters","T","3",3,5,1,"2","assault pistol sust:2 twin","18\""],
  ["Indomitor Kill Team","Auto boltstorm gauntlets","T","3",3,4,0,"1","twin","18\""],
  ["Indomitor Kill Team","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Indomitor Kill Team","Flamestorm gauntlets","T","D6+1",0,4,0,"1","ignorescover torrent twin","12\""],
  ["Indomitor Kill Team","Fragstorm grenade launcher","T","D6",3,4,0,"1","blast","18\""],
  ["Indomitor Kill Team","Heavy Bolter","T","3",4,5,1,"2","assault heavy sust:1","36\""],
  ["Indomitor Kill Team","Heavy bolt rifle","T","2",3,5,1,"1","assault heavy","30\""],
  ["Indomitor Kill Team","Melta rifle","T","1",3,9,4,"D6","heavy melta:2","18\""],
  ["Indomitor Kill Team","Multi-melta","T","2",4,9,4,"D6","heavy melta:2","18\""],
  ["Indomitor Kill Team","➤ Plasma exterminators - Standard","T","2",3,7,2,"2","assault pistol twin","18\""],
  ["Indomitor Kill Team","➤ Plasma exterminators - Supercharge","T","2",3,8,3,"3","assault hazardous pistol twin","18\""],
  ["Indomitor Kill Team","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Indomitor Kill Team","Power fists","C","3",4,8,2,"2","twin","càc"],
  ["Inquisitor","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Inquisitor","Combi-weapon","T","1",3,4,2,"1","anti:4:inf dev rf:1","24\""],
  ["Inquisitor","Psychic Shock Wave","T","2D6",0,3,2,"1","dev psychic torrent","18\""],
  ["Inquisitor","Force weapon","C","4",3,5,2,"D3","psychic","càc"],
  ["Inquisitor","Inquisitorial melee weapon","C","5",3,4,2,"1","","càc"],
  ["Inquisitor Coteaz","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Inquisitor Coteaz","Psychic Blast","T","D6",3,3,1,"1","anti:4 anti:5:inf dev psychic","18\""],
  ["Inquisitor Coteaz","Nemesis daemon hammer","C","3",3,9,3,"3","psychic","càc"],
  ["Inquisitor Draxus","Dirgesinger","T","4",3,4,0,"2","anti:4:inf assault dev","18\""],
  ["Inquisitor Draxus","Psychic Tempest","T","6",3,6,0,"2","psychic sust:2","18\""],
  ["Inquisitor Draxus","Power fist","C","3",3,6,2,"2","","càc"],
  ["Inquisitor Eisenhorn","Artificer bolt pistol","T","4",3,4,0,"2","","12\""],
  ["Inquisitor Eisenhorn","Mind Assault","T","2",3,5,2,"3","dev precision psychic sust:1","18\""],
  ["Inquisitor Eisenhorn","Runestaff and Barbarisater","C","5",3,6,2,"2","psychic","càc"],
  ["Inquisitor Greyfax","Castigation","T","1",3,8,2,"3","anti:4:perso dev precision psychic","18\""],
  ["Inquisitor Greyfax","Condemnor stake","T","1",3,4,0,"1","anti:2 dev precision rf:1","24\""],
  ["Inquisitor Greyfax","Master-crafted power sword","C","4",3,4,2,"2","","càc"],
  ["Inquisitor Karamazov","Master-crafted multi-melta","T","3",3,10,4,"D6","melta:3","18\""],
  ["Inquisitor Karamazov","Master-crafted power sword","C","6",3,6,2,"2","","càc"],
  ["Inquisitor Kroyle","Jindarii tox-cycler","T","1",2,6,2,"2","anti:2:mon heavy precision","36\""],
  ["Inquisitor Kroyle","Stubcarbine","T","2",2,5,2,"2","pistol","12\""],
  ["Inquisitor Kroyle","Butcher blade","C","5",3,4,2,"1","","càc"],
  ["Inquisitor Kroyle","Garralisk's claws and teeth","C","4",4,5,1,"1","extra","càc"],
  ["Inquisitor Ostromandeus","Inferno pistol","T","1",3,8,4,"D3","melta:2 pistol","6\""],
  ["Inquisitor Ostromandeus","Hydraulic vox-ram","C","3",4,6,2,"2","","càc"],
  ["Inquisitor Ostromandeus","Power sword","C","5",3,4,2,"1","","càc"],
  ["Inquisitor in Terminator Armour","Combi-weapon","T","1",3,4,2,"1","anti:4:inf dev rf:1","24\""],
  ["Inquisitor in Terminator Armour","Psycannon","T","3",3,8,1,"2","psychic","24\""],
  ["Inquisitor in Terminator Armour","Psychic shock wave","T","2D6",0,3,2,"1","dev psychic torrent","18\""],
  ["Inquisitor in Terminator Armour","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Inquisitor in Terminator Armour","Force weapon","C","4",3,5,2,"D3","psychic","càc"],
  ["Inquisitor in Terminator Armour","Inquisitorial melee weapon","C","5",3,4,2,"1","","càc"],
  ["Inquisitorial Agents","Agent firearm","T","1",3,4,1,"1","pistol","12\""],
  ["Inquisitorial Agents","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Inquisitorial Agents","Multi-melta","T","2",4,9,4,"D6","heavy melta:2","18\""],
  ["Inquisitorial Agents","➤ Plasma cannon - standard","T","D3",4,7,1,"1","blast heavy","36\""],
  ["Inquisitorial Agents","➤ Plasma cannon - supercharge","T","D3",4,8,2,"2","blast hazardous heavy","36\""],
  ["Inquisitorial Agents","➤ Plasma pistol - standard","T","1",3,7,1,"1","pistol","12\""],
  ["Inquisitorial Agents","➤ Plasma pistol - supercharge","T","1",3,8,2,"2","hazardous pistol","12\""],
  ["Inquisitorial Agents","Agent melee weapon","C","3",3,3,0,"1","","càc"],
  ["Inquisitorial Agents","Eviscerator","C","2",3,6,2,"2","dev","càc"],
  ["Inquisitorial Agents","Mystic stave","C","2",3,5,1,"D3","anti:4:inf psychic","càc"],
  ["Inquisitorial Chimera","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Inquisitorial Chimera","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Inquisitorial Chimera","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Inquisitorial Chimera","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Inquisitorial Chimera","Lasgun array","T","6",4,3,0,"1","rf:6","24\""],
  ["Inquisitorial Chimera","Multi-laser","T","4",4,6,0,"1","","36\""],
  ["Inquisitorial Chimera","Storm bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Inquisitorial Chimera","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Janus Draik","Heirloom pistol","T","1",3,4,1,"3","anti:4:inf pistol","12\""],
  ["Janus Draik","Monomolecular rapier","C","4",3,3,2,"1","sust:1","càc"],
  ["Jokaero Weaponsmith","Jokaero weapons - focused","T","1",4,10,1,"3","","24\""],
  ["Jokaero Weaponsmith","Jokaero weapons - scattered","T","D6",0,4,0,"1","torrent","12\""],
  ["Jokaero Weaponsmith","Close combat weapon","C","2",5,4,0,"1","","càc"],
  ["Kill Team Cassius","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Kill Team Cassius","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Kill Team Cassius","Deathwatch twin boltgun","T","4",3,4,0,"1","","24\""],
  ["Kill Team Cassius","Frag cannon","T","D3",4,7,1,"2","blast heavy rf:D3","18\""],
  ["Kill Team Cassius","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Kill Team Cassius","Long Vigil ranged weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Kill Team Cassius","Psychic Cleanse","T","D6",3,5,1,"D3","psychic","24\""],
  ["Kill Team Cassius","Artificer crozius","C","5",2,6,1,"2","","càc"],
  ["Kill Team Cassius","Close combat weapon","C","3",3,5,2,"1","","càc"],
  ["Kill Team Cassius","Force weapon","C","5",2,5,3,"D3","psychic","càc"],
  ["Kill Team Cassius","Long Vigil melee weapon","C","3",3,5,2,"1","","càc"],
  ["Kill Team Cassius","Power fist","C","3",3,8,2,"2","","càc"],
  ["Kill Team Cassius","Twin lightning claws","C","4",3,5,2,"1","twin","càc"],
  ["Ministorum Priest","Holy Pistol","T","3",4,4,0,"1","pistol","12\""],
  ["Ministorum Priest","Zealot's vindictor (tir)","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Ministorum Priest","Power weapon","C","3",4,4,2,"1","","càc"],
  ["Ministorum Priest","Zealot's vindictor (càc)","C","3",4,5,1,"2","","càc"],
  ["Navigator","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Navigator","Force-orb cane","C","3",4,6,1,"D3","psychic","càc"],
  ["Neyam Shai Murad","Negotiator pistols","T","4",3,4,2,"1","precision","12\""],
  ["Neyam Shai Murad","Close combat weapon","C","4",3,3,0,"1","","càc"],
  ["Proteus Kill Team","Assault cannon","T","6",3,6,0,"1","dev","24\""],
  ["Proteus Kill Team","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Proteus Kill Team","Boltgun","T","2",3,4,0,"1","","24\""],
  ["Proteus Kill Team","Frag Cannon","T","D3",4,7,1,"2","blast heavy rf:D3","18\""],
  ["Proteus Kill Team","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Proteus Kill Team","Long Vigil ranged weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Proteus Kill Team","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Proteus Kill Team","Twin boltgun","T","2",3,4,0,"1","twin","24\""],
  ["Proteus Kill Team","➤ Cyclone missile launcher - frag","T","2D6",3,4,0,"1","blast","36\""],
  ["Proteus Kill Team","➤ Cyclone missile launcher - krak","T","2",3,9,2,"D6","","36\""],
  ["Proteus Kill Team","➤ Infernus heavy bolter - heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Proteus Kill Team","➤ Infernus heavy bolter - heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Proteus Kill Team","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast heavy","36\""],
  ["Proteus Kill Team","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous heavy","36\""],
  ["Proteus Kill Team","Chainfist","C","3",4,8,2,"2","anti:3:veh","càc"],
  ["Proteus Kill Team","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Proteus Kill Team","Deathwatch thunder hammer","C","3",4,10,2,"3","dev","càc"],
  ["Proteus Kill Team","Long Vigil melee weapon","C","3",3,5,2,"1","","càc"],
  ["Proteus Kill Team","Power Fist","C","3",3,8,2,"2","","càc"],
  ["Proteus Kill Team","Power weapon","C","4",3,5,2,"1","","càc"],
  ["Proteus Kill Team","Thunder hammer","C","3",4,8,2,"2","dev","càc"],
  ["Proteus Kill Team","Twin lightning claws","C","5",3,5,2,"1","twin","càc"],
  ["Rogue Trader Entourage","Dartmask","T","1",4,2,1,"D3","anti:2:inf pistol precision","12\""],
  ["Rogue Trader Entourage","Household pistol","T","2",3,5,2,"2","pistol dev","12\""],
  ["Rogue Trader Entourage","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Rogue Trader Entourage","Voltaic pistol","T","3",3,4,2,"1","pistol sust:2","12\""],
  ["Rogue Trader Entourage","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Rogue Trader Entourage","Death Cult power blade","C","5",2,4,2,"1","precision","càc"],
  ["Rogue Trader Entourage","Monomolecular cane-rapier","C","4",3,4,1,"1","","càc"],
  ["Sanctifiers","Holy fire","T","D6",0,6,1,"2","ignorescover oneshot torrent","12\""],
  ["Sanctifiers","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Sanctifiers","Ministorum flamer","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Sanctifiers","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Sanctifiers","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Sanctifiers","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Sanctifiers","Burning hands","C","1",2,6,2,"3","dev","càc"],
  ["Sanctifiers","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Sanctifiers","Death Cult blades","C","4",2,4,2,"1","precision","càc"],
  ["Sanctifiers","Sanctifier melee weapon","C","3",3,3,0,"1","","càc"],
  ["Sisters of Battle Immolator","Heavy bolter","T","3",4,5,1,"2","sust:1","36\""],
  ["Sisters of Battle Immolator","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Sisters of Battle Immolator","Immolation flamers","T","2D6",0,6,1,"1","ignorescover torrent","18\""],
  ["Sisters of Battle Immolator","Twin heavy bolter","T","3",3,5,1,"2","sust:2 twin","36\""],
  ["Sisters of Battle Immolator","Twin multi-melta","T","2",3,9,4,"D6","melta:2 twin","18\""],
  ["Sisters of Battle Immolator","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Sisters of Battle Squad","Artificer-crafted storm bolter","T","2",3,4,0,"2","rf:2","24\""],
  ["Sisters of Battle Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Sisters of Battle Squad","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Sisters of Battle Squad","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Sisters of Battle Squad","Condemnor boltgun","T","1",3,4,0,"1","anti:2 dev precision rf:1","24\""],
  ["Sisters of Battle Squad","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Sisters of Battle Squad","Inferno pistol","T","1",3,8,4,"D3","melta:2 pistol","6\""],
  ["Sisters of Battle Squad","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Sisters of Battle Squad","Ministorum flamer","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Sisters of Battle Squad","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Sisters of Battle Squad","Ministorum heavy flamer","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Sisters of Battle Squad","Multi-melta","T","2",4,9,4,"D6","heavy melta:2","18\""],
  ["Sisters of Battle Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Sisters of Battle Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Sisters of Battle Squad","Chainsword","C","3",4,3,1,"1","","càc"],
  ["Sisters of Battle Squad","Close combat weapon","C","1",4,3,1,"1","","càc"],
  ["Sisters of Battle Squad","Power weapon","C","2",4,4,2,"1","","càc"],
  ["Spectrus Kill Team","Accelerator autocannon","T","3",4,8,1,"2","heavy","48\""],
  ["Spectrus Kill Team","Bolt carbine","T","2",3,4,0,"1","precision","24\""],
  ["Spectrus Kill Team","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Spectrus Kill Team","Bolt sniper rifle","T","1",3,5,2,"3","heavy precision","36\""],
  ["Spectrus Kill Team","Las fusil","T","1",3,9,3,"D6","heavy","36\""],
  ["Spectrus Kill Team","Marksman bolt carbine","T","2",3,4,0,"1","heavy","24\""],
  ["Spectrus Kill Team","Occulus bolt carbine","T","2",3,4,0,"1","assault ignorescover","24\""],
  ["Spectrus Kill Team","Special-issue bolt pistol","T","1",3,4,1,"1","pistol precision","12\""],
  ["Spectrus Kill Team","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Spectrus Kill Team","Combat knife","C","4",3,4,0,"1","precision","càc"],
  ["Spectrus Kill Team","Paired combat blades","C","3",3,4,0,"1","sust:1","càc"],
  ["Subductor Squad","Arbites shotpistol","T","1",4,4,0,"1","pistol","12\""],
  ["Subductor Squad","Mechanical bite","C","3",4,4,0,"1","","càc"],
  ["Subductor Squad","Shock maul","C","2",4,4,1,"1","","càc"],
  ["UR-025","Mk 1 assault weapon","T","4",3,5,1,"1","assault","24\""],
  ["UR-025","Power claw","C","3",4,8,2,"2","","càc"],
  ["Veteran Bike Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Veteran Bike Squad","Long Vigil ranged weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Veteran Bike Squad","Twin boltgun","T","2",3,4,0,"1","twin","24\""],
  ["Veteran Bike Squad","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Veteran Bike Squad","Long Vigil melee weapon","C","3",3,5,2,"1","","càc"],
  ["Veteran Bike Squad","Xenophase blade","C","4",3,5,2,"1","dev","càc"],
  ["Vigilant Squad","Arbites combat shotgun","T","2",4,4,0,"1","assault","18\""],
  ["Vigilant Squad","Arbites shotpistol","T","1",4,4,0,"1","pistol","12\""],
  ["Vigilant Squad","Executioner shotgun","T","1",4,5,1,"1","ignorescover precision","24\""],
  ["Vigilant Squad","Heavy stubber","T","3",4,4,0,"1","rf:3","36\""],
  ["Vigilant Squad","Webber","T","D6",0,2,0,"1","assault dev torrent","12\""],
  ["Vigilant Squad","➤ Arbites grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Vigilant Squad","➤ Arbites grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Vigilant Squad","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Vigilant Squad","Mechanical bite","C","3",4,4,0,"1","","càc"],
  ["Vindicare Assassin","Exitus pistol","T","3",2,6,2,"3","dev ignorescover pistol precision","12\""],
  ["Vindicare Assassin","Exitus rifle","T","1",2,8,3,"D3+3","dev heavy ignorescover precision","48\""],
  ["Vindicare Assassin","Vindicare combat knife","C","4",2,4,1,"1","","càc"],
  ["Voidsmen-at-Arms","Artificer shotgun","T","2",4,4,0,"2","assault","12\""],
  ["Voidsmen-at-Arms","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Voidsmen-at-Arms","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Voidsmen-at-Arms","Voidsman rotor cannon","T","6",5,6,0,"1","heavy sust:1","24\""],
  ["Voidsmen-at-Arms","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Voidsmen-at-Arms","Vicious bite","C","3",4,4,0,"1","","càc"],
  ["Watch Captain Artemis","Hellfire Extremis","T","3",0,4,1,"1","anti:4:inf dev ignorescover torrent","12\""],
  ["Watch Captain Artemis","Master-crafted power weapon","C","6",2,6,2,"2","","càc"],
  ["Watch Master","Vigil spear (tir)","T","2",2,5,1,"2","","24\""],
  ["Watch Master","Vigil spear (càc)","C","6",2,6,2,"2","lance","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Aquila Kill Team","Battleline"],
  ["Callidus Assassin","Epic Hero"],
  ["Corvus Blackstar","Véhicule"],
  ["Culexus Assassin","Epic Hero"],
  ["Daemonhost","Infanterie"],
  ["Damned Legionnaires","Infanterie"],
  ["Deathwatch Kill Team","Battleline"],
  ["Deathwatch Terminator Squad","Infanterie"],
  ["Eversor Assassin","Epic Hero"],
  ["Exaction Squad","Infanterie"],
  ["Fortis Kill Team","Infanterie"],
  ["Grey Knights Terminator Squad","Infanterie"],
  ["Imperial Navy Breachers","Battleline"],
  ["Imperial Rhino","Véhicule"],
  ["Indomitor Kill Team","Infanterie"],
  ["Inquisitor","Personnage"],
  ["Inquisitor Coteaz","Epic Hero"],
  ["Inquisitor Draxus","Epic Hero"],
  ["Inquisitor Eisenhorn","Epic Hero"],
  ["Inquisitor Greyfax","Epic Hero"],
  ["Inquisitor Karamazov","Epic Hero"],
  ["Inquisitor Kroyle","Epic Hero"],
  ["Inquisitor Ostromandeus","Epic Hero"],
  ["Inquisitor in Terminator Armour","Personnage"],
  ["Inquisitorial Agents","Infanterie"],
  ["Inquisitorial Chimera","Véhicule"],
  ["Janus Draik","Epic Hero"],
  ["Jokaero Weaponsmith","Personnage"],
  ["Kill Team Cassius","Epic Hero"],
  ["Ministorum Priest","Personnage"],
  ["Navigator","Personnage"],
  ["Neyam Shai Murad","Epic Hero"],
  ["Proteus Kill Team","Infanterie"],
  ["Rogue Trader Entourage","Personnage"],
  ["Sanctifiers","Infanterie"],
  ["Sisters of Battle Immolator","Véhicule"],
  ["Sisters of Battle Squad","Infanterie"],
  ["Spectrus Kill Team","Infanterie"],
  ["Subductor Squad","Infanterie"],
  ["UR-025","Epic Hero"],
  ["Veteran Bike Squad","Monté"],
  ["Vigilant Squad","Battleline"],
  ["Vindicare Assassin","Epic Hero"],
  ["Voidsmen-at-Arms","Infanterie"],
  ["Watch Captain Artemis","Epic Hero"],
  ["Watch Master","Personnage"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Inquisitor": [
  "Aquila Kill Team",
  "Exaction Squad",
  "Grey Knights Terminator Squad",
  "Imperial Navy Breachers",
  "Inquisitorial Agents",
  "Sanctifiers",
  "Sisters of Battle Squad",
  "Subductor Squad",
  "Vigilant Squad"
 ],
 "Inquisitor Coteaz": [
  "Exaction Squad",
  "Grey Knights Terminator Squad",
  "Imperial Navy Breachers",
  "Inquisitorial Agents",
  "Subductor Squad",
  "Vigilant Squad"
 ],
 "Inquisitor Draxus": [
  "Aquila Kill Team",
  "Exaction Squad",
  "Imperial Navy Breachers",
  "Inquisitorial Agents",
  "Subductor Squad",
  "Vigilant Squad"
 ],
 "Inquisitor Eisenhorn": [
  "Daemonhost",
  "Deathwatch Kill Team",
  "Deathwatch Terminator Squad",
  "Exaction Squad",
  "Fortis Kill Team",
  "Imperial Navy Breachers",
  "Indomitor Kill Team",
  "Inquisitorial Agents",
  "Proteus Kill Team",
  "Spectrus Kill Team",
  "Subductor Squad",
  "Vigilant Squad"
 ],
 "Inquisitor Greyfax": [
  "Exaction Squad",
  "Imperial Navy Breachers",
  "Inquisitorial Agents",
  "Sanctifiers",
  "Sisters of Battle Squad",
  "Subductor Squad",
  "Vigilant Squad"
 ],
 "Inquisitor in Terminator Armour": [
  "Deathwatch Kill Team",
  "Deathwatch Terminator Squad",
  "Exaction Squad",
  "Fortis Kill Team",
  "Grey Knights Terminator Squad",
  "Imperial Navy Breachers",
  "Indomitor Kill Team",
  "Inquisitorial Agents",
  "Proteus Kill Team",
  "Sisters of Battle Squad",
  "Spectrus Kill Team",
  "Subductor Squad",
  "Vigilant Squad"
 ],
 "Inquisitor Ostromandeus": [
  "Exaction Squad",
  "Imperial Navy Breachers",
  "Inquisitorial Agents",
  "Sisters of Battle Squad",
  "Subductor Squad",
  "Vigilant Squad"
 ],
 "Janus Draik": [
  "Imperial Navy Breachers",
  "Voidsmen-at-Arms"
 ],
 "Jokaero Weaponsmith": [
  "Inquisitorial Agents"
 ],
 "Navigator": [
  "Imperial Navy Breachers",
  "Voidsmen-at-Arms"
 ],
 "Neyam Shai Murad": [
  "Imperial Navy Breachers",
  "Voidsmen-at-Arms"
 ],
 "Rogue Trader Entourage": [
  "Imperial Navy Breachers",
  "Voidsmen-at-Arms"
 ],
 "Watch Captain Artemis": [
  "Aquila Kill Team",
  "Deathwatch Kill Team",
  "Deathwatch Terminator Squad",
  "Fortis Kill Team",
  "Indomitor Kill Team",
  "Proteus Kill Team",
  "Spectrus Kill Team"
 ],
 "Watch Master": [
  "Aquila Kill Team",
  "Deathwatch Kill Team",
  "Deathwatch Terminator Squad",
  "Fortis Kill Team",
  "Indomitor Kill Team",
  "Proteus Kill Team",
  "Spectrus Kill Team"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Vindicare Assassin": [
  [
   "Shieldbreaker",
   "Once per battle, when selecting targets for this model’s exitus rifle, it can fire a shieldbreaker round. If it does, until the end of the phase, each time this model makes an attack with that weapon, add 1 to the Wound roll and any successful Wound roll scores a Critical Wound."
  ],
  [
   "Dead-shot",
   "When this unit is selected to shoot, until this unit has shot: \n- Enemy units do not have Lone Operative. \n- Hidden enemy units have +15\" detection range.'"
  ],
  [
   "Micromelta Rounds",
   "This model’s exitus rifle has the [ANTI-MONSTER 4+] and [ANTI-VEHICLE 4+] abilities."
  ],
  [
   "Shadow Assignment",
   "This model cannot be selected as your WARLORD. If your army faction is AGENTS OF THE IMPERIUM, then during the Declare Battle Formations step, you can replace this model with a different OFFICIO ASSASSINORUM model, provided that the points value of the new model does not exceed the points value of the model it replaced. Your army cannot include duplicates of the same model (i.e. after replacing this model with this rule, your army cannot have more than 1 VINDICARE ASSASSIN, it cannot have more than 1 CULEXUS ASSASSIN, it cannot have more than 1 EVERSOR ASSASSIN and it cannot have more than 1 CALLIDUS ASSASSIN)."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Culexus Assassin": [
  [
   "Abomination",
   "This model has the Feel No Pain 2+ ability against Psychic Attacks."
  ],
  [
   "Soulless Horror",
   "Once per battle, at the start of any Command phase, this model can use this ability. If it does, each enemy unit within 9\" of this model must take a Battle-shock test, subtracting 1 from that test (or subtracting 2 if that unit is a PSYKER)."
  ],
  [
   "Etheric Emergence",
   "In your Movement phase, when this model is set up on the battlefield using the Deep Strike ability, it can perform an etheric emergence. If it does, this model can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units, but until the end of the turn, it is not eligible to declare a charge."
  ],
  [
   "Esoteric Explosives",
   "Each time this model is targeted with the Grenades Stratagem, 1 mortal wound is inflicted for each D6 roll of 3+ instead of for each 4+"
  ],
  [
   "Shadow Assignment",
   "This model cannot be selected as your WARLORD. If your army faction is AGENTS OF THE IMPERIUM, then during the Declare Battle Formations step, you can replace this model with a different OFFICIO ASSASSINORUM model, provided that the points value of the new model does not exceed the points value of the model it replaced. Your army cannot include duplicates of the same model (i.e. after replacing this model with this rule, your army cannot have more than 1 VINDICARE ASSASSIN, it cannot have more than 1 CULEXUS ASSASSIN, it cannot have more than 1 EVERSOR ASSASSIN and it cannot have more than 1 CALLIDUS ASSASSIN)."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Eversor Assassin": [
  [
   "Frenzon",
   "This model is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "Overkill",
   "Once per battle, in your Movement phase, this model can use this ability before it makes a Normal move. If it does, until the end of the turn, add 6\" to this model's Movement characteristic and add 3 to the Attacks characteristic of this model's melee weapons."
  ],
  [
   "Intra-neural Biotech",
   "You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: \n- That use is -1 CP. \n- That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Shadow Assignment",
   "This model cannot be selected as your WARLORD. If your army faction is AGENTS OF THE IMPERIUM, then during the Declare Battle Formations step, you can replace this model with a different OFFICIO ASSASSINORUM model, provided that the points value of the new model does not exceed the points value of the model it replaced. Your army cannot include duplicates of the same model (i.e. after replacing this model with this rule, your army cannot have more than 1 VINDICARE ASSASSIN, it cannot have more than 1 CULEXUS ASSASSIN, it cannot have more than 1 EVERSOR ASSASSIN and it cannot have more than 1 CALLIDUS ASSASSIN)."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Callidus Assassin": [
  [
   "Reign of Confusion",
   "Once per turn, when your opponent targets a unit from their army within 12” of this model with a stratagem, this model can use this ability. If you do increase the CP cost of that use of that stratagem by 1CP."
  ],
  [
   "Acrobatic Escape",
   "- At the end of the Fight phase, if this unit is engaged, this unit can make a fall-back move of up to D6\". \n- At the end of your opponent’s turn, if this unit is more than 3\" from all enemy units, you can use this ability. If you do: \n- Place this unit in strategic reserves. \n- This unit must make an ingress move in your next Movement phase (including in your first turn)."
  ],
  [
   "Decoy Targets",
   "Twice per battle, in your Movement phase, you can select one other friendly INFANTRY model that is on the battlefield and not within Engagement Range of one or more enemy units. The selected model is destroyed (ignoring any rules that are triggered when a model is destroyed) and this model is removed from the battlefield and set up again as close as possible to where that destroyed model was and not within Engagement Range of one or more enemy units. This ability cannot be used more than once in the same battle round."
  ],
  [
   "Shadow Assignment",
   "This model cannot be selected as your WARLORD. If your army faction is AGENTS OF THE IMPERIUM, then during the Declare Battle Formations step, you can replace this model with a different OFFICIO ASSASSINORUM model, provided that the points value of the new model does not exceed the points value of the model it replaced. Your army cannot include duplicates of the same model (i.e. after replacing this model with this rule, your army cannot have more than 1 VINDICARE ASSASSIN, it cannot have more than 1 CULEXUS ASSASSIN, it cannot have more than 1 EVERSOR ASSASSIN and it cannot have more than 1 CALLIDUS ASSASSIN)."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Rogue Trader Entourage": [
  [
   "Backroom Deals",
   "If your army contains one or more units with this ability, during the Declare Battle Formations step, select one of those units. While the selected unit is leading a unit, models in that unit have the Infiltrators ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units: IMPERIAL NAVY BREACHERS, VOIDSMEN-AT-ARMS"
  ],
  [
   "Warrant of Trade",
   "If your army contains one or more models with this ability, after both players have deployed their armies, select up to D3 IMPERIUM BATTLELINE units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserve, regardless of how many units are already in Strategic Reserve."
  ],
  [
   "Healing Serum",
   "At the start of your Command phase, if the bearer's unit is below its Starting Strength, you can return up to D3 destroyed models (excluding CHARACTERS) to the bearer's unit."
  ]
 ],
 "Voidsmen-at-Arms": [
  [
   "Masters of Close Confines",
   "Each time a model in this unit makes a ranged attack that targets the closest eligible target, that attack has the [LETHAL HITS] ability."
  ],
  [
   "Navy Bodyguards",
   "If your Army Faction is not AGENTS OF THE IMPERIUM, then for each VOIDFARERS CHARACTER unit you include in your army, you can include one VOIDSMEN-AT-ARMS unit in your army that does not count towards the number of RETINUE units your army can include."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Imperial Navy Breachers": [
  [
   "Breaching Team",
   "Each time a model in this unit makes an attack, re-roll a Wound roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Wound roll instead."
  ],
  [
   "Gheistskull",
   "Once per battle, when you select this unit as the target of the Grenade Stratagem, you can target one enemy unit visible to and within 18\" of this unit that is not within Engagement Range of any units from your army, instead of one within 8\"."
  ],
  [
   "CAT Unit",
   "Once per battle, when this unit is selected to shoot, until the end of the phase, ranged weapons equipped by this unit gain the [Ignores Cover] ability."
  ],
  [
   "Endurant shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Subductor Squad": [
  [
   "Dedication to Duty",
   "Each time a model in this unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6: on a 4+, do not remove it from play. The destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Nuncio-aquila",
   "Once per battle, at the start of any Command phase, you can select one objective marker within 6\" of the bearer. All enemy units (excluding MONSTERS and VEHICLES) within range of that objective marker must take a Battle-shock test. Each objective marker can only be targeted by this ability once per turn."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Exaction Squad": [
  [
   "Imperial Law",
   "At the start of the battle, select one unit from your opponent's army. Each time a model in this unit makes an attack that targets that unit, that attack has the [Lethal Hits] and [Precision] abilities."
  ],
  [
   "Arbites medi-kit",
   "At the start of your Command phase, if the bearer's unit is below its Starting Strength, you can return up to D3 destroyed Exaction Vigilants to this unit."
  ],
  [
   "Soulguilt scanner",
   "Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability."
  ],
  [
   "Nuncio-aquila",
   "Once per battle, at the start of any Command phase, you can select one objective marker within 6\" of the bearer. All enemy units (excluding MONSTERS and VEHICLES) within range of that objective marker must take a Battle-shock test. Each objective marker can only be targeted by this ability once per turn."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Vigilant Squad": [
  [
   "Merciless Judgement",
   "Each time a model in this unit makes a ranged attack that targets a unit that is Below Half-strength, add 1 to the Wound roll."
  ],
  [
   "Nuncio-aquila",
   "Once per battle, at the start of any Command phase, you can select one objective marker within 6\" of the bearer. All enemy units (excluding MONSTERS and VEHICLES) within range of that objective marker must take a Battle-shock test. Each objective marker can only be targeted by this ability once per turn."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitor Draxus": [
  [
   "Xenos Hunter",
   "While this model is leading a unit, each time a model in that unit makes an attack that targets an enemy unit that does not have the IMPERIUM or CHAOS keywords, add 1 to the Hit roll."
  ],
  [
   "Psychic Veil (Psychic)",
   "In your Command phase, this PSYKER can use this ability. If it does, roll one D6: on a 1, this PSYKER’s unit suffers D3 mortal wounds; on a 2+, until the start of your next Command phase, this PSYKER’s unit can only be selected as the target of a ranged attack if the attacking model is within 18\"."
  ],
  [
   "Leader",
   "This model can be attached to the following units: AQUILA KILL TEAM,  BATTLELINE IMPERIUM INFANTRY, EXACTION SQUAD, IMPERIAL NAVY BREACHERS, INQUISITORIAL AGENTS, SUBDUCTOR SQUAD, VIGILANT SQUAD"
  ],
  [
   "Authority of the Inquisition",
   "While this model is leading a unit, it can embark within any Transport that its Bodyguard unit can embark within."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitor Coteaz": [
  [
   "Malefic Wardings (Psychic)",
   "While this model is leading a unit, models in that unit have a 6+ invulnerable save, and 4+ invulnerable save against Psychic Attacks and attacks made by DAEMON models."
  ],
  [
   "Spy Network",
   "Each time your opponent gains a CP as the result of an ability, roll one D6: on a 2+, you also gain 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units: BATTLELINE IMPERIUM INFANTRY, EXACTION SQUAD, GREY KNIGHTS TERMINATOR SQUAD, IMPERIAL NAVY BREACHERS, INQUISITORIAL AGENTS, SUBDUCTOR SQUAD, VIGILANT SQUAD"
  ],
  [
   "Glovodan Psyber-eagle",
   "In your Command phase, you can select one enemy unit within 18\" of the bearer. Until the start of your next Command phase, that unit cannot have the Benefit of Cover."
  ],
  [
   "Authority of the Inquisition",
   "While this model is leading a unit, it can embark within any Transport that its Bodyguard unit can embark within."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitor Greyfax": [
  [
   "Psyoculum",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [ANTI-PSYKER 4+] ability."
  ],
  [
   "No Mercy",
   "While this model is leading a unit, each time a model in that unit makes an attack that targets a unit that is Below Half-strength, add 1 to the Hit roll."
  ],
  [
   "Leader",
   "This model can be attached to the following units: BATTLELINE IMPERIUM INFANTRY, EXACTION SQUAD, IMPERIAL NAVY BREACHERS, INQUISITORIAL AGENTS, SANCTIFIERS, SISTERS OF BATTLE SQUAD, SUBDUCTOR SQUAD, VIGILANT SQUAD"
  ],
  [
   "Authority of the Inquisition",
   "While this model is leading a unit, it can embark within any Transport that its Bodyguard unit can embark within."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitor Karamazov": [
  [
   "Unsubtle Crusader",
   "At the start of the Declare Battle Formations step, you can select up to 3 Agents of the Imperium Infantry units from your army, or one Imperium Battleline unit from your army - those units gain the Scouts 6\" ability."
  ],
  [
   "Throne of Judgement (Aura)",
   "While a friendly unit is within 6\" of this model, improve the Leadership characteristic of models in that unit by 1. While an enemy unit is within 6\" of this model, worsen the Leadership characteristic of models in that unit by 1."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitor": [
  [
   "Leader",
   "This model can be attached to the following units: AQUILA KILL TEAM, BATTLELINE IMPERIUM INFANTRY, EXACTION SQUAD, GREY KNIGHTS TERMINATOR SQUAD, IMPERIAL NAVY BREACHERS, INQUISITORIAL AGENTS, SANCTIFIERS, SISTERS OF BATTLE SQUAD, SUBDUCTOR SQUAD, VIGILANT SQUAD"
  ],
  [
   "Blessed Wardings",
   "While this model is leading a unit, models in that unit have a 6+ invulnerable save."
  ],
  [
   "Psychic gifts",
   "The bearer has the PSYKER keyword."
  ],
  [
   "Authority of the Inquisition",
   "While this model is leading a unit, it can embark within any Transport that its Bodyguard unit can embark within."
  ],
  [
   "Power of the Rosette",
   "Each time you target this model’s unit with a Stratagem, roll one D6: on a 3+, you gain 1CP."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitor Eisenhorn": [
  [
   "Leader",
   "This model can be attached to the following units: DAEMONHOST, DEATHWATCH KILL TEAM, DEATHWATCH TERMINATOR SQUAD, EXACTION SQUAD, FORTIS KILL TEAM, IMPERIAL NAVY BREACHERS, INDOMITOR KILL TEAM, INQUISITORIAL AGENTS, PROTEUS KILL TEAM, SPECTRUS KILL TEAM, SUBDUCTOR SQUAD, VIGILANT SQUAD"
  ],
  [
   "Malus Codicium",
   "While this model is leading a unit, double the Attacks characteristic of weapons equipped by Daemonhost models in that unit."
  ],
  [
   "Dominate Will (Psychic)",
   "At the start of your opponent’s Shooting phase, select one enemy INFANTRY unit that is within 12\" of and visible to this model and roll one D6: on a 1, this model suffers D3 mortal wounds; on a 2-5, until the end of the phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll; on a 6, until the end of the phase, that unit is not eligible to shoot."
  ],
  [
   "Authority of the Inquisition",
   "While this model is leading a unit, it can embark within any Transport that its Bodyguard unit can embark within."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "UR-025": [
  [
   "Self Repair",
   "At the start of your Command phase, this model regains 1 lost wound."
  ],
  [
   "Evade and Survive",
   "Once per turn, when an enemy unit ends a Normal, Advance or Fall Back move within 9\" of this model, if this model is not within Engagement Range of one or more enemy units, it can make a Normal move."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Neyam Shai Murad": [
  [
   "Leader",
   "This model can be attached to the following units: IMPERIAL NAVY BREACHERS, VOIDSMEN-AT-ARMS"
  ],
  [
   "Backroom Deals",
   "If your army contains one or more units with this ability, during the Declare Battle Formations step, select one of those units. While the selected unit is leading a unit, models in that unit have the Infiltrators ability."
  ],
  [
   "Warrant of Trade",
   "If your army includes one or more units with this ability, after both players have deployed their armies, select up to D3 Imperium Battleline units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Janus Draik": [
  [
   "Leader",
   "This model can be attached to the following units: IMPERIAL NAVY BREACHERS, VOIDSMEN-AT-ARMS"
  ],
  [
   "Backroom Deals",
   "If your army contains one or more units with this ability, during the Declare Battle Formations step, select one of those units. While the selected unit is leading a unit, models in that unit have the Infiltrators ability."
  ],
  [
   "Warrant of Trade",
   "If your army includes one or more units with this ability, after both players have deployed their armies, select up to D3 Imperium Battleline units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Damned Legionnaires": [
  [
   "Grim Spectres",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. That enemy unit must take a Battle-shock test, subtracting 1 from the result when doing so."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitor in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units: DEATHWATCH KILL TEAM, DEATHWATCH TERMINATOR SQUAD, EXACTION SQUAD, FORTIS KILL TEAM, GREY KNIGHTS TERMINATOR SQUAD, IMPERIAL NAVY BREACHERS, INDOMITOR KILL TEAM, INQUISITORIAL AGENTS, PROTEUS KILL TEAM, SISTERS OF BATTLE SQUAD, SPECTRUS KILL TEAM, SUBDUCTOR SQUAD, VIGILANT SQUAD"
  ],
  [
   "Psychic Gifts",
   "The bearer has the PSYKER keyword."
  ],
  [
   "Blessed Wardings",
   "While this model is leading a unit, models in that unit have a 6+ invulnerable save."
  ],
  [
   "Authority of the Inquisition",
   "While this model is leading a unit, it can embark within any Transport that its Bodyguard unit can embark within."
  ],
  [
   "Power of the Rosette",
   "Each time you target this model’s unit with a Stratagem, roll one D6: on a 3+, you gain 1CP."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Navigator": [
  [
   "Third Eye (Psychic)",
   "At the start of your Shooting phase, select one enemy unit within 12\" of and visible to this model. That enemy unit must take a Battle-shock test, subtracting 2 from the result if it is an INFANTRY unit; if the test is failed, that enemy unit suffers 3 mortal wounds."
  ],
  [
   "Gaze into the Empyrean (Psychic)",
   "Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" of this model."
  ],
  [
   "Leader",
   "This model can be attached to the following units: IMPERIAL NAVY BREACHERS, VOIDSMEN-AT-ARMS"
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Ministorum Priest": [
  [
   "Zealot",
   "Once per battle, in the Fight phase, this model can use this ability. If it does, until the end of the phase, improve the Strength and Attacks characteristics of melee weapons equipped by this model by 3."
  ],
  [
   "Holy Hatred",
   "While this model is leading a unit, melee weapons equipped by that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Support",
   "This model can be attached to the following units: EXACTION SQUAD, IMPERIAL NAVY BREACHERS, INQUISITORIAL AGENTS, SANCTIFIERS, SISTERS OF BATTLE SQUAD, SUBDUCTOR SQUAD, VIGILANT SQUAD"
  ]
 ],
 "Inquisitorial Agents": [
  [
   "Loyal Henchmen",
   "While an INQUISITOR model is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll."
  ],
  [
   "Inquisitorial Henchmen",
   "If your Army Faction is not AGENTS OF THE IMPERIUM, then for each INQUISITOR unit you include in your army, you can include one INQUISITORIAL AGENTS unit in your army that does not count towards the number of RETINUE units your army can include."
  ],
  [
   "Tome-skull",
   "Once per battle for each Tome-skull this unit is equipped with, at the start of any phase, you can select one other friendly AGENTS OF THE IMPERIUM unit that is Battle-shocked and within 6\" of this unit or one enemy unit within 6\" of this unit. If you select a friendly unit, that unit is no longer Battle-shocked. If you select an enemy unit, it must take a Battle-shock test."
  ]
 ],
 "Grey Knights Terminator Squad": [
  [
   "Rites of Teleportation",
   "If one or more INQUISITOR units are attached to this unit during the Declare Battle Formations step, models in those units have the Deep Strike ability."
  ],
  [
   "Hammerhand (Psychic)",
   "Each time this unit makes a Charge move, until the end of the turn, melee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  ],
  [
   "Narthecium",
   "In your Command phase, you can return 1 destroyed model (excluding CHARACTERS) to the bearer's unit."
  ],
  [
   "Ancient's Banner",
   "Add 1 to the Objective Control characteristic of models in the bearer's unit."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitorial Chimera": [
  [
   "Rapid Deployment",
   "Units can disembark from this TRANSPORT after it has Advanced. Units that do so count as having made a Normal move that phase, and cannot declare a charge in the same turn, but can otherwise act normally."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Imperial Rhino": [
  [
   "Self-repair",
   "At the start of your Command phase, this model regains 1 lost wound."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Sisters of Battle Squad": [
  [
   "Defenders of the Faith",
   "If you control an objective marker at the end of your Command phase and this unit is within range of that objective marker, that objective marker remains under your control, even if you have no models in range of it, until your opponent controls it at the start or end of any turn."
  ],
  [
   "Incensor Cherub",
   "Once per battle, you can target this unit with the Command Re-roll Stratagem for 0CP and can do so if you have already targeted a different unit with that Stratagem this phase."
  ],
  [
   "Simulacrum Imperialis",
   "Improve the Leadership characteristic of models in the bearer's unit by 1."
  ]
 ],
 "Sisters of Battle Immolator": [
  [
   "Purge and Cleanse",
   "Each time this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that enemy unit cannot have the Benefit of Cover."
  ]
 ],
 "Daemonhost": [
  [
   "Malefic Warding",
   "While an INQUISITOR model is leading a unit that contains one or more DAEMONHOST models, models in this unit have a 5+ invulnerable save."
  ],
  [
   "Bound Daemon",
   "While an INQUISITOR model is leading a unit that includes one or more DAEMONHOST models, the Objective Control characteristic of DAEMONHOST models in that unit is 1."
  ],
  [
   "Inquisitorial Retinue",
   "If your Army Faction is not AGENTS OF THE IMPERIUM, then for each unique pairing of 1 INQUISITORIAL AGENTS unit and 1 DAEMONHOST unit occuring in your army, increase the maximum number of RETINUE units permitted in your army by 1. At the start of the Declare Battle Formations step, this unit can join one INQUISITORIAL AGENTS unit from your army that is being led by an INQUISITOR model (a unit cannot have more than one DAEMONHOST unit joined to it). If it does, until the end of the battle, every model in this unit counts as being part of that Bodyguard unit, and that Bodyguard unit’s Starting Strength is increased accordingly."
  ]
 ],
 "Jokaero Weaponsmith": [
  [
   "Inconceivable Augmentation",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units: INQUISITORIAL AGENTS"
  ],
  [
   "Inquisitorial Agent",
   "If your Army Faction is not AGENTS OF THE IMPERIUM, then for each unique pairing of 1 INQUISITORIAL AGENTS unit and 1 JOKAERO WEAPONSMITH unit occuring in your army, increase the maximum number of CHARACTER units permitted in your army by 1."
  ],
  [
   "A Weaponsmith, Not a Warlord",
   "This model cannot be selected to be your Warlord. While an INQUISITOR model is leading a unit that includes one or more JOKAERO WEAPONSMITH models, the Objective Control characteristic of JOKAERO WEAPONSMITH models in that unit is 1."
  ]
 ],
 "Corvus Blackstar": [
  [
   "Blackstar Cluster Launcher",
   "In your Movement phase, when this unit ends a normal move, select up to one enemy unit this unit moved over during that move and roll six D6:\n\n\n- For each 4+, that unit suffers 1 mortal wound."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Auspex Array",
   "Ranged weapons equipped by the bearer have the [IGNORES COVER] ability."
  ]
 ],
 "Deathwatch Kill Team": [
  [
   "Death to the Alien",
   "Each time a model in this unit makes an attack, re-roll a Hit roll of 1. If the target of that attack does not have the IMPERIUM or CHAOS keywords, you can re-roll the Hit roll instead."
  ],
  [
   "Storm Shield",
   "This model has a 4+ InSv."
  ]
 ],
 "Deathwatch Terminator Squad": [
  [
   "Terminatus Assault",
   "Each time this unit ends a Charge move, each enemy unit within Engagement Range of this unit must take a Battle-shock test."
  ],
  [
   "Teleport Homer",
   "At the start of the battle, you can set up one Teleport Homer token for this unit anywhere on the battlefield that is not in your opponent’s deployment zone. If you do, once per battle, you can target this unit with the Rapid Ingress Stratagem for 0CP, but when resolving that Stratagem, you must set this unit up within 3\" of that token and not within 9\" of any enemy models. That token is then removed."
  ],
  [
   "Attached Unit",
   "If a CHARACTER from your army with the Leader ability can be attached to a DEATHWATCH KILL TEAM, it can be attached to this unit instead."
  ],
  [
   "Storm shield",
   "The bearer has a Wounds characteristic of 4."
  ]
 ],
 "Fortis Kill Team": [
  [
   "Fortis Doctrines",
   "Each time a model in this unit makes an attack that targets a unit that is Below Half-strength, add 1 to the Hit roll."
  ],
  [
   "Attached Unit",
   "If a CHARACTER from your army with the Leader ability can be attached to an DEATHWATCH KILL TEAM, it can be attached to this unit instead."
  ],
  [
   "Kill Team",
   "Each time an attack targets this unit, if it contains models with different Toughness characteristics, until the attacking unit has finished making its attacks, use the Toughness characteristic of the majority of the models in that unit when determining what roll is required for that attack to successfully wound. If two or more Toughness characteristics are tied for majority, use the highest value. \nFor the purposes of determining which models in this unit can embark within a TRANSPORT, Kill Team Terminator models, Kill Team Outrider models, Kill Team Biker models and models equipped with a jump pack each take up the space of 2 models, but can otherwise embark within any TRANSPORT their unit can embark within, even though similar models in other units have the TERMINATOR, MOUNTED or JUMP PACK keywords. \nFor the purposes of interacting with terrain features, all models in units with this ability are considered Infantry models, even though similar models in other units may have the Mounted or Jump Pack keywords. \nDesigner’s Note: *While the abstractions in the above rule cause some models to behave differently to similar models in other units, they are designed to minimise complicated movement, Transport and Benefit of Cover rules.*"
  ]
 ],
 "Indomitor Kill Team": [
  [
   "Indomitor Doctrines",
   "Each time a model in this unit makes an attack, add 1 to the Hit roll if this unit is below its Starting Strength, and add 1 to the Wound roll as well if this unit is Below Half-strength."
  ],
  [
   "Attached Unit",
   "If a CHARACTER unit from your army can be attached to a DEATHWATCH KILL TEAM, it can be attached to this unit instead."
  ],
  [
   "Jump pack",
   "The bearer has a Move characteristic of 10\" and can move over models and terrain features as if they were not there."
  ]
 ],
 "Kill Team Cassius": [
  [
   "Catechism of Death",
   "While this unit contains Chaplain Cassius, melee weapons equipped by models in this unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Unflinching",
   "You can re-roll Battle-shock tests for this unit."
  ],
  [
   "Jump Pack",
   "The bearer has a Move characteristic of 12\" and can move over models and terrain as if they were not there."
  ],
  [
   "Psychic Hood",
   "Models in the bearer’s unit have the Feel No Pain 4+ ability against Psychic Attacks."
  ]
 ],
 "Proteus Kill Team": [
  [
   "Proteus Doctrines",
   "Each time a model in this unit makes an attack that targets a unit that is not Below Half-strength, add 1 to the Hit roll."
  ],
  [
   "Attached Unit",
   "If a CHARACTER from your army with the Leader ability can be attached to a DEATHWATCH KILL TEAM, it can be attached to this unit instead."
  ],
  [
   "Invulnerable Save",
   "4+"
  ],
  [
   "Storm shield",
   "The bearer has a Wounds characteristic of 4."
  ],
  [
   "Jump Pack",
   "The bearer has a Move characteristic of 12\" and can move over models and terrain features as if they were not there."
  ],
  [
   "Astartes shield",
   "The bearer has a 4+ invulnerable save."
  ],
  [
   "Kill Team",
   "Each time an attack targets this unit, if it contains models with different Toughness characteristics, until the attacking unit has finished making its attacks, use the Toughness characteristic of the majority of the models in that unit when determining what roll is required for that attack to successfully wound. If two or more Toughness characteristics are tied for majority, use the highest value. \nFor the purposes of determining which models in this unit can embark within a TRANSPORT, Kill Team Terminator models, Kill Team Outrider models, Kill Team Biker models and models equipped with a jump pack each take up the space of 2 models, but can otherwise embark within any TRANSPORT their unit can embark within, even though similar models in other units have the TERMINATOR, MOUNTED or JUMP PACK keywords. \nFor the purposes of interacting with terrain features, all models in units with this ability are considered Infantry models, even though similar models in other units may have the Mounted or Jump Pack keywords. \nDesigner’s Note: *While the abstractions in the above rule cause some models to behave differently to similar models in other units, they are designed to minimise complicated movement, Transport and Benefit of Cover rules.*"
  ]
 ],
 "Spectrus Kill Team": [
  [
   "Attached Unit",
   "If a CHARACTER unit from your army can be attached to a DEATHWATCH KILL TEAM, it can be attached to this unit instead."
  ],
  [
   "Spectrus Doctrines",
   "At the end of your opponent’s turn, if this unit is more than 6\" away from all enemy units, you can remove this unit from the battlefield and place it into Strategic Reserves. It will arrive back on the battlefield in the Reinforcements step of your next Movement phase."
  ],
  [
   "Helix Gauntlet",
   "Models in the bearer’s unit have the Feel No Pain 6+ ability."
  ],
  [
   "Infiltrator Comms Array",
   "Each time you target the bearer’s unit with a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Jump pack",
   "The bearer has a Move characteristic of 12\" and can move over models and terrain features as if they were not there."
  ],
  [
   "Kill Team",
   "Each time an attack targets this unit, if it contains models with different Toughness characteristics, until the attacking unit has finished making its attacks, use the Toughness characteristic of the majority of the models in that unit when determining what roll is required for that attack to successfully wound. If two or more Toughness characteristics are tied for majority, use the highest value. \nFor the purposes of determining which models in this unit can embark within a TRANSPORT, Kill Team Terminator models, Kill Team Outrider models, Kill Team Biker models and models equipped with a jump pack each take up the space of 2 models, but can otherwise embark within any TRANSPORT their unit can embark within, even though similar models in other units have the TERMINATOR, MOUNTED or JUMP PACK keywords. \nFor the purposes of interacting with terrain features, all models in units with this ability are considered Infantry models, even though similar models in other units may have the Mounted or Jump Pack keywords. \nDesigner’s Note: *While the abstractions in the above rule cause some models to behave differently to similar models in other units, they are designed to minimise complicated movement, Transport and Benefit of Cover rules.*"
  ]
 ],
 "Veteran Bike Squad": [
  [
   "Turbo-boost",
   "Each time this unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in this unit."
  ],
  [
   "Astartes Shield",
   "The bearer has a 4+ invulnerable save."
  ]
 ],
 "Watch Captain Artemis": [
  [
   "Tactical Instinct",
   "This unit's attacks have [Sustained Hits 1]."
  ],
  [
   "Unstoppable Champion",
   "At the end of a phase in which this model is destroyed, roll one D6:\n- On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed, unengaged with 3 wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following units: AQUILA KILL TEAM, DEATHWATCH KILL TEAM, DEATHWATCH TERMINATOR SQUAD, FORTIS KILL TEAM, INDOMITOR KILL TEAM, PROTEUS KILL TEAM, SPECTRUS KILL TEAM"
  ]
 ],
 "Watch Master": [
  [
   "Strategic Acumen",
   "n your Command phase, you can use this ability. If you do, select one combat doctrine to be active for this unit until the start of your next Command phase."
  ],
  [
   "Watch Master",
   "This model’s attacks that target a Character unit can:\n- Re-roll hit rolls of 1.\n- Re-roll wound rolls of 1."
  ],
  [
   "Leader",
   "This model can be attached to the following units: AQUILA KILL TEAM, DEATHWATCH KILL TEAM, DEATHWATCH TERMINATOR SQUAD, FORTIS KILL TEAM, INDOMITOR KILL TEAM, PROTEUS KILL TEAM, SPECTRUS KILL TEAM"
  ],
  [
   "Purgatus Quarry",
   "At the start of the first battle round, select up to one enemy unit to be this unit’s hunted:\n- This unit’s attacks that target this unit’s hunted unit can re-roll wound rolls of 1.\n- Each time this unit’s hunted is destroyed, select up to one enemy unit to be this unit’s hunted."
  ]
 ],
 "Sanctifiers": [
  [
   "Ministorum Sermon",
   "While this unit contains a Ministorum Priest, each time a model in this unit makes a melee attack, add 1 to the Wound roll."
  ],
  [
   "Cherub",
   "Once per battle, you can target this unit with the Command Re-roll Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this phase."
  ],
  [
   "Attached Unit",
   "If a Ministorum Priest or Inquisitor model from your army with the Leader ability can be attached to a Sisters of Battle Squad, it can be attached to this unit instead. If a Ministorum Priest or Inquisitor model from your army is attached to this unit during the Declare Battle Formations step, that model gains the Scouts 6\" ability."
  ],
  [
   "Salvationist Medikit",
   "In your Command phase, if the bearer is on the battlefield, you can return up to D3 destroyed models (excluding Character models) to this unit."
  ],
  [
   "Simulacrum Imperialis",
   "Improve the Leadership characteristic of models in the bearer’s unit by 1."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Inquisitor Ostromandeus": [
  [
   "Ward Against the Malefic Arts",
   "While this unit is leading a unit, each time a Psychic Attack targets that unit, subtract 1 from the Hit roll and subtract 1 from the Wound roll."
  ],
  [
   "Vox‑cast Proclamations (Aura)",
   "Each time your opponent targets a unit from their army with a Stratagem, if that unit is within 12\" of this unit’s Inquisitor Ostromandeus model, increase the cost of that use of that Stratagem by 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units: EXACTION SQUAD, IMPERIAL NAVY BREACHERS, INQUISITORIAL AGENTS, SISTERS OF BATTLE SQUAD, SUBDUCTOR SQUAD, VIGILANT SQUAD"
  ],
  [
   "Vox-skull",
   "Once per battle, at the start of any phase, you can select one enemy unit (excluding Monsters and Vehicles) within 12\" of the bearer. That unit must take a Battle-shock test; if that test is failed, until the end of your next turn, that unit cannot have the Benefit of Cover. \nDesigner’s Note: *Place a vox-skull token next to the unit, removing it once this ability has been used.*"
  ],
  [
   "Authority of the Inquisition",
   "While this model is leading a unit, it can embark within any Transport that its Bodyguard unit can embark within."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ],
 "Aquila Kill Team": [
  [
   "Death to the Alien",
   "This unit's attacks can:\n- Re-roll hit rolls of 1.\n- Or: If the target of those attacks does not have IMPERIUM/CHAOS, re-roll hit rolls."
  ],
  [
   "Storm shield",
   "This model has a 4+ InSv."
  ]
 ],
 "Inquisitor Kroyle": [
  [
   "On My Signal, Fire!",
   "After this unit has shot, you can select one enemy unit hit by those attacks. Until the end of the phase, each time an Agents of the Imperium or Imperium Infantry Battleline model from your army makes an attack that targets that enemy unit, you can re-roll the Hit roll."
  ],
  [
   "Tox‑cycler",
   "In your Shooting phase, after this unit has shot, if this model scored a hit with its Jindarii tox-cycler, until the end of the battle, add 2 to the Strength and Damage characteristics of that weapon (to a maximum Damage characteristic of 6)."
  ],
  [
   "Assigned Agents",
   "If your army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below.\n\nIncursion: 1 RETINUE, 1 CHARACTER, 1 REQUISITIONED\nStrike Force: 2 RETINUE, 2 CHARACTER, 1 REQUISITIONED\nOnslaught: 3 RETINUE, 3 CHARACTER, 2 REQUISITIONED\n\n\nNote that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Imperialis Fleet",2,"","At all Costs","At the start of your Command phase, you can select one of the following to apply: Eliminate At All Costs Select one enemy unit on the battlefield. Until the start of your next Command phase, each time an AGENTS OF THE IMPERIUM model from your army makes an attack that targets that enemy unit, add 1 to the Hit roll. Acquire At All Costs Select one objective marker on the battlefield. Until the start of your next Command phase, while an AGENTS OF THE IMPERIUM unit from your army is within range of that objective marker, improve the Leadership and Objective Control characteristics of models in that unit by 1 and models in that unit have a 5+ invulnerable save.","",0,"","Reconnaissance"],
  ["Ordo Hereticus, Purgation Force",2,"","Root out Heresy","Ranged weapons equipped by ADEPTUS ARbITES, INqUISITOR, INqUISITORIAl AGENTS and ORDO HERETICUS models from your army have the [IGNORES COvER] ability. Each time an ADEPTUS ARBITES, INQUISITOR, INQUISITORIAL AGENTS or ORDO HERETICUS model from your army makes an attack that targets a CHAOS unit containing 5 or more models, that attack has the [SUSTAINED HITS 1] ability.","",0,"","Take and Hold"],
  ["Ordo Malleus, Daemon Hunters",2,"","Destroy the Daemonic","Each time an INqUISITOR, INqUISITORIAl AGENTS or ORDO MAllEUS model from your army makes an attack, re-roll a Hit roll of 1 and, if the target of that attack is a DAEMON unit, re-roll a Wound roll of 1 as well.","",0,"","Priority Assets"],
  ["Ordo Xenos, Alien Hunters",2,"","Deathwatch Mission Tactics","At the start of your Command phase, you can select one of the Mission Tactics listed below. Until the start of your next Command phase, that Mission Tactic is active and its effects apply to all DEATHwATCH units from your army. Each Mission Tactic can only be selected once per battle. Furor Tactics The warriors of the Deathwatch are often sorely outnumbered by swarming foes, yet by striking for maximum indiscriminate carnage they soon even the odds. While this Mission Tactic is active, weapons equipped by DEATHWATCH units from your army have the [SUSTAINED HITS 1] ability. Malleus Tactics Even the largest behemoth has a weak point, and the Deathwatch find them all. While this Mission Tactic is active, weapons equipped by DEATHWATCH units from your army have the [LETHAL HITS] ability. Purgatus Tactics Adopting Purgatus tactics, the Deathwatch focus their ire upon the commanders of the enemy host. While this Mission Tactic is active, each time a DEATHWATCH model from your army makes an attack, on a Critical Wound, that attack has the [PRECISION] ability.","",0,"","Purge the Foe"],
  ["Veiled Blade Elimination Force",1,"","Extremis Sanction","Officio Assassinorum units from your army can use the Overkill, Soulless Horror and Shieldbreaker abilities twice per battle, instead of once per battle (but cannot use such an ability more than once in the same battle round). When mustering your army, each OFFICIO ASSASSINORUM unit from your army has the relevant Extremis ability shown on the right, and you must increase the points cost of each of those units by the amount shown. If this causes your army to exceed the points limit for the battle you are playing, you cannot include that unit in your army.","",0,"","Disruption"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Clandestine Operation",15,"Imperialis Fleet","At the start of the Declare Battle Formations step, you can select up to three AGENTS OF THE IMPERIUM INFANTRY units from your army (excluding GREY KNIGHTS TERMINATOR SQUAD units) - those units gain the Infiltrators ability.",null],
  ["Combat Landers",10,"Imperialis Fleet","At the start of the Declare Battle Formations step, you can select up to three VOIDFARERS units from your army - those units gain the Deep Strike ability.",null],
  ["Digital Weapons",10,"Imperialis Fleet","Each time the bearer is selected to fight, roll three D6; for each 4+, one enemy unit within Engagement Range of the bearer suffers 1 mortal wound. Mortal wounds inflicted by this Enhancement are allocated as if they have the [PRECISION] ability.",null],
  ["Fleetmaster",20,"Imperialis Fleet","Once per battle round, you can target the bearer's unit with the Violent Acquisition, Masters of the Void or Close-quarters Barrage Stratagems for 0CP.",null],
  ["Ignis Judicium",10,"Ordo Hereticus, Purgation Force","The bearer's ranged weapons have the [DEVASTATING WOUNDS], [MELTA 1] and [PRECISION] abilities.",null],
  ["Liber Heresius",10,"Ordo Hereticus, Purgation Force","After both players have deployed their armies, select up to 3 AGENTS OF THE IMPERIUM units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",null],
  ["No Escape",25,"Ordo Hereticus, Purgation Force","",null],
  ["Witch Hunter",15,"Ordo Hereticus, Purgation Force","While the bearer is leading a unit, each time a model in that unit makes an attack that targets a PSYKER unit, you can re-roll the Hit roll.",null],
  ["Daemon Slayer",10,"Ordo Malleus, Daemon Hunters","Add 1 to the Attacks characteristic of the bearer's melee weapons, and those weapons have the [ANTI-DAEMON 3+] ability.",null],
  ["Formidable Resolve",5,"Ordo Malleus, Daemon Hunters","Improve the bearer's Leadership and Wounds characteristics by 1. Once per battle, at the start of any phase, you can select one friendly Battle-shocked unit within 12\" of the bearer. That unit is no longer Battle-shocked.",null],
  ["Gift of the Prescient",20,"Ordo Malleus, Daemon Hunters","Once per battle, if the bearer is on the battlefield, you can use the Rapid Ingress Stratagem for 0CP. When doing so, you must target a GREY KNIGHTS TERMINATOR SQUAD unit from your army, and when using the Stratagem, that unit can be set up on the battlefield anywhere that is more than 6\" from all enemy units.",null],
  ["Grimoire of True Names",10,"Ordo Malleus, Daemon Hunters","",null],
  ["Amulet of Auto-chastisement",25,"Ordo Xenos, Alien Hunters","At the start of your opponent's Shooting phase, select one enemy VEHICLE unit (excluding TITANIC units) within 12\" of and visible to the bearer. That unit must take a Leadership test. If that test is passed, until the end of the phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll. If that test is failed, that unit is not eligible to shoot this phase.",null],
  ["Beacon Angelis",30,"Ordo Xenos, Alien Hunters","Models in the bearer's unit have the Deep Strike ability. In addition, you can target the bearer's unit with the Rapid Ingress Stratagem for 0CP.",null],
  ["Blackweave Shroud",15,"Ordo Xenos, Alien Hunters","The bearer has the Feel No Pain 4+ ability.",null],
  ["Universal Anathema",10,"Ordo Xenos, Alien Hunters","Melee weapons equipped by the bearer have the [ANTI-INFANTRY 2+] and [ANTI-MONSTER 4+] abilities",null],
  ["Decoy Targets",15,"Veiled Blade Elimination Force","Twice per battle, in your Movement phase, you can select one other friendly INFANTRY model that is on the battlefield and not within Engagement Range of one or more enemy units. The selected model is destroyed (ignoring any rules that are triggered when a model is destroyed) and this model is removed from the battlefield and set up again as close as possible to where that destroyed model was and not within Engagement Range of one or more enemy units. This ability cannot be used more than once in the same battle round.",null],
  ["Esoteric Explosives",10,"Veiled Blade Elimination Force","Each time this model is targeted with the Grenades Stratagem, 1 mortal wound is inflicted for each D6 roll of 3+ instead of for each 4+",null],
  ["Introneural Biotech",15,"Veiled Blade Elimination Force","",null],
  ["Micromelta Rounds",20,"Veiled Blade Elimination Force","This model’s exitus rifle has the [ANTI-MONSTER 4+] and [ANTI-VEHICLE 4+] abilities.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Close-Quarters Barrage","Imperialis Fleet","Tactique de Bataille",1,"Your Shooting phase.","One VOIDFARERS unit from your army.","Until the end of the phase, each time a model in your unit makes a ranged attack that targets a unit within 12\", improve the Strength and Armour Penetration characteristics of that attack by 1.",""],
  ["Displacer Field","Imperialis Fleet","Équipement",1,"Your opponent's Shooting phase, just after an enemy unit has selected its targets.","One AGENTS OF THE IMpERIUM CHARACTER unit from your army (excluding OFFICIO ASSASSINORUM units) that was selected as the target of one or more of the attacking unit's attacks.","Until the end of the phase, models in your unit have a 4+ invulnerable save and, after the attacking unit has resolved its attacks, unless your unit is within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\" (when doing so, models in this unit move as if they have the Fly keyword).",""],
  ["Emperor’s Will","Imperialis Fleet","Ruse Stratégique",1,"Your Movement phase.","One AGENTS OF THE IMpERIUM unit from your army.","Until the end of the phase, your unit is eligible to shoot in a turn in which it Advanced or Fell Back.",""],
  ["Masters of the Void","Imperialis Fleet","Fait Épique",1,"Your Movement phase.","One VOIDFARERS CHARACTER unit from your army.","Until the end of the phase, each AGENTS OF THE IMpERIUM unit from your army that is arriving from Strategic Reserves this turn can be set up within your opponent’s deployment zone (all other restrictions still apply).",""],
  ["Selfless Bodyguard","Imperialis Fleet","Fait Épique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One AGENTS OF THE IMpERIUM Attached unit that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack with the [PRECISION] ability is allocated to a CHARACTER model in your unit, if there are one or more Bodyguard models in your unit, roll one D6: on a 2+, that attack is allocated to a Bodyguard model of your choice in your unit instead.",""],
  ["Violent Acquisition","Imperialis Fleet","Ruse Stratégique",2,"Your Shooting phase or the Fight phase.","One AGENTS OF THE IMpERIUM unit from your army.","Until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit within range of an objective marker, that attack has the [SUSTAINED HITS 1], [LANCE] and [IGNORES COVER] abilities.",""],
  ["Dispense Justice","Ordo Hereticus, Purgation Force","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One ADEpTUS ARbITES, INQUISITORIAl AGENTS or ORDO HERETICUS unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, weapons equipped by models in your unit have the [LETHAL HITS] ability.",""],
  ["Exact Punishment","Ordo Hereticus, Purgation Force","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an AGENTS OF THE IMpERIUM unit from your army is destroyed as the result of an enemy unit's attacks.","One ADEpTUS ARbITES, INQUISITORIAl AGENTS or ORDO HERETICUS unit from your army that was within 6\" of the destroyed unit (you cannot target the destroyed unit with the Stratagem).","After the attacking unit has shot, your unit can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit (and only if it is an eligible target).",""],
  ["Execution Order","Ordo Hereticus, Purgation Force","Fait Épique",2,"Your Command phase.","One ADEpTUS ARbITES, INQUISITORIAl AGENTS or ORDO HERETICUS INFANTRy unit from your army.","Select one enemy CHARACTER unit on the battlefield. Until the start of your next Command phase, each time a model in your unit targets that CHARACTER unit, its weapons have the [PRECISION] ability.",""],
  ["Inviolate Jurisdiction","Ordo Hereticus, Purgation Force","Ruse Stratégique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One ADEpTUS ARbITES, INQUISITORIAl AGENTS or ORDO HERETICUS INFANTRy unit from your army within range of an objective marker and that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 5+ ability.",""],
  ["Line of Fire","Ordo Hereticus, Purgation Force","Ruse Stratégique",1,"Your Shooting phase.","One ADEpTUS ARbITES, INQUISITORIAl AGENTS or ORDO HERETICUS unit from your army that has not been selected to shoot this phase.","Until the end of the phase, models in your unit can target enemy units that are within Engagement Range of one or more friendly units with ranged weapons (excluding Blast weapons), provided the target is within 12\".",""],
  ["Stun Grenades","Ordo Hereticus, Purgation Force","Équipement",1,"Start of any phase (excluding the Command phase).","One ADEpTUS ARbITES, INQUISITORIAl AGENTS or ORDO HERETICUS GRENADES unit from your army that is not within Engagement Range of one or more enemy units.","Select one enemy unit (excluding MONSTERS or VEHICLES) within 8\" of and visible to your unit. That enemy unit must take a Battle-shock test and, until the end of the phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll.",""],
  ["Hexagrammic Wards","Ordo Malleus, Daemon Hunters","Équipement",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One ORDO MAllEUS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, all Psychic weapons equipped by models in the attacking unit have the [HAZARDOUS] ability.",""],
  ["Psybolt Ammunition","Ordo Malleus, Daemon Hunters","Équipement",1,"Your Shooting phase.","One GREy KNIGHTS TERMINATOR SQUAD unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [LETHAL HITS] and [PSYCHIC] abilities.",""],
  ["Rites of Exorcism","Ordo Malleus, Daemon Hunters","Ruse Stratégique",1,"Your Shooting phase or the Fight phase.","One INQUISITOR, INQUISITORIAl AGENTS or ORDO MAllEUS unit from your army.","Select one enemy DAEMON unit within 12\" and visible to your unit. That unit must take a Battle-shock test. If that test is failed, then until the end of the phase, each time a friendly AGENTS OF THE IMpERIUM unit makes an attack that targets that DAEMON unit, that attack has the [DEVASTATING WOUNDS] ability.",""],
  ["Ritual of Warding","Ordo Malleus, Daemon Hunters","Ruse Stratégique",1,"Start of any Command phase.","One INQUISITOR, INQUISITORIAl AGENTS or ORDO MAllEUS unit from your army that is within range of an objective marker you control.","That objective marker is said to be Warded and remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn. While an objective marker is Warded and under your control, enemy DAEMON units cannot be set up on the battlefield within 6\" of it.",""],
  ["Steel Heart","Ordo Malleus, Daemon Hunters","Ruse Stratégique",1,"Your Movement phase, just after a GREy KNIGHTS TERMINATOR SQUAD unit from your army Falls Back.","That GREY KNIGHTS TERMINATOR SQUAD unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Truesilver Armour","Ordo Malleus, Daemon Hunters","Équipement",1,"Your opponent’s Shooting phase orthe Fight phase, just after an enemy unit has selected its targets.","One GREy KNIGHTS TERMINATOR SQUAD unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Adaptive Tactics","Ordo Xenos, Alien Hunters","Ruse Stratégique",1,"Your Command phase.","One DEATHwATCH unit from your army.","Select the Furor Tactics, Malleus Tactics or Purgatus Tactics. Until the start of your next Command phase, that Deathwatch Mission Tactic is active for your unit instead of any other Deathwatch Mission Tactic that is active for your army, even if you have already selected that Deathwatch Mission Tactic this battle.",""],
  ["Armour of Contempt","Ordo Xenos, Alien Hunters","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One DEATHwATCH unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Dragonfire Rounds","Ordo Xenos, Alien Hunters","Équipement",1,"Your Shooting phase.","One DEATHwATCH INFANTRy unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [ASSAULT] and [IGNORES COVER] abilities.","You cannot select any units that have already been targeted with either the Kraken Rounds or Hellfire Rounds Stratagems this phase."],
  ["Hellfire Rounds","Ordo Xenos, Alien Hunters","Équipement",1,"Your Shooting phase.","One DEATHwATCH INFANTRy unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons (excluding Devastating Wounds weapons) equipped by models in your unit have the [ANTI-INFANTRY 2+] and [ANTI-MONSTER 5+] abilities.","You cannot select any units that have already been targeted with either the Kraken Rounds or Dragonfire Rounds Stratagems this phase."],
  ["Kraken Rounds","Ordo Xenos, Alien Hunters","Équipement",1,"Your Shooting phase.","One DEATHwATCH INFANTRy unit from your army that has not been selected to shoot this phase.","Until the end of the phase, improve the Armour Penetration characteristic of ranged weapons equipped by models in your unit by 1 and improve the Range characteristic of those weapons by 6\".","You cannot select any units that have already been targeted with either the Dragonfire Rounds or Hellfire Rounds Stratagems this phase."],
  ["Rapid Tactical Relocation","Ordo Xenos, Alien Hunters","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One INQUISITOR or DEATHwATCH INFANTRy unit from your army.","Remove your unit from the battlefield. In the Reinforcements step of your next Movement phase, set your unit up anywhere on the battlefield that is more than 8\" horizontally away from all enemy models.","You cannot select a unit that is within Engagement Range of one or more enemy units."],
  ["Blind Grenades","Veiled Blade Elimination Force","Ruse Stratégique",1,"Your opponent’s Charge phase, just after an enemy unit has declared a charge.","One Agents of the Imperium Grenades or Vindicare Assassin unit from your army that was selected as one of the targets of that charge and is not within Engagement Range of one or more enemy units.","Until the end of the phase, subtract 1 from Charge rolls made for that enemy unit, or, if your unit is a VINDICARE ASSASSIN, subtract 2 from Charge rolls made for that enemy unit instead.",""],
  ["Ensnaring Trap","Veiled Blade Elimination Force","Ruse Stratégique",1,"End of your opponent’s Charge phase.","One Agents of the Imperium Infantry unit from your army that is within 6\" of one or more enemy units and would be eligible to declare a charge against one or more of those enemy units.","Your unit can declare a charge. When doing so, you must select one or more of those enemy units as the targets of that charge. In addition, if it is a CALLIDUS ASSASSIN unit and it makes a Charge move as a result of this Stratagem, until the end of the turn, each time a model in your unit makes a melee attack, add 1 to the Wound roll",""],
  ["Hyperstimms","Veiled Blade Elimination Force","Tactique de Bataille",2,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Agents of the Imperium Character unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, add 1 to the Toughness characteristic of models in your unit. In addition, if it is an Eversor Assassin unit, until the end of the phase, it has the Feel No Pain 4+ ability.",""],
  ["Orbital Oversight","Veiled Blade Elimination Force","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Agents of the Imperium Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit can only be selected as the target of a ranged attack if the attacking model is within 18\", or, if your unit has the Lone Operative ability, if the attacking model is within 6\".",""],
  ["Prime Target","Veiled Blade Elimination Force","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Agents of the Imperium unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a CHARACTER unit, re-roll a Wound roll of 1. If that attack is made by an Officio Assassinorum model and it targets the enemy WARLORD, you can re-roll the Wound roll instead.",""],
  ["Will-Sapping Salvo","Veiled Blade Elimination Force","Ruse Stratégique",1,"Your Shooting phase.","One Agents of the Imperium Infantry unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability. In addition, if it is a Culexus Assassin unit, until the end of the phase, change the Damage characteristic of ranged weapons equipped by models in your unit to 3.",""],
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
  "Corvus Blackstar",
  "Imperial Rhino",
  "Inquisitorial Chimera",
  "Sisters of Battle Immolator"
 ],
 "monster": [],
 "battleline": [
  "Aquila Kill Team",
  "Deathwatch Kill Team",
  "Imperial Navy Breachers",
  "Vigilant Squad"
 ],
 "epic": [
  "Callidus Assassin",
  "Culexus Assassin",
  "Eversor Assassin",
  "Inquisitor Coteaz",
  "Inquisitor Draxus",
  "Inquisitor Eisenhorn",
  "Inquisitor Greyfax",
  "Inquisitor Karamazov",
  "Inquisitor Kroyle",
  "Inquisitor Ostromandeus",
  "Janus Draik",
  "Kill Team Cassius",
  "Neyam Shai Murad",
  "UR-025",
  "Vindicare Assassin",
  "Watch Captain Artemis"
 ],
 "infantry": [
  "Daemonhost",
  "Damned Legionnaires",
  "Deathwatch Terminator Squad",
  "Exaction Squad",
  "Fortis Kill Team",
  "Grey Knights Terminator Squad",
  "Indomitor Kill Team",
  "Inquisitorial Agents",
  "Proteus Kill Team",
  "Sanctifiers",
  "Sisters of Battle Squad",
  "Spectrus Kill Team",
  "Subductor Squad",
  "Voidsmen-at-Arms"
 ],
 "character": [
  "Inquisitor",
  "Inquisitor in Terminator Armour",
  "Jokaero Weaponsmith",
  "Ministorum Priest",
  "Navigator",
  "Rogue Trader Entourage",
  "Watch Master"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Vindicare Assassin": "32",
 "Culexus Assassin": "32",
 "Eversor Assassin": "32",
 "Callidus Assassin": "32",
 "Rogue Trader Entourage": "25",
 "Voidsmen-at-Arms": "25",
 "Imperial Navy Breachers": "25",
 "Subductor Squad": "28.5",
 "Exaction Squad": "28.5",
 "Vigilant Squad": "28.5",
 "Inquisitor Draxus": "32",
 "Inquisitor Coteaz": "40",
 "Inquisitor Greyfax": "32",
 "Inquisitor": "32",
 "Navigator": "32",
 "Ministorum Priest": "32",
 "Inquisitorial Agents": "25",
 "Grey Knights Terminator Squad": "40",
 "Inquisitorial Chimera": "coque",
 "Imperial Rhino": "coque",
 "Sisters of Battle Squad": "32",
 "Sisters of Battle Immolator": "coque",
 "Corvus Blackstar": "120x92",
 "Deathwatch Kill Team": "32",
 "Watch Captain Artemis": "32",
 "Watch Master": "32",
 "Sanctifiers": "25",
 "Aquila Kill Team": "40",
 "Inquisitor Kroyle": "60"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Corvus Blackstar": 5
};

const TRANSPORTS = {
 "Inquisitorial Chimera": "This model has a transport capacity of 13 INQUISITOR INFANTRY and INQUISITORIAL AGENT models. It cannot transport TERMINATOR models.",
 "Imperial Rhino": "This model has a transport capacity of 12 AGENTS OF THE IMPERIUM INFANTRY models. It cannot transport TERMINATOR or OFFICIO ASSASSINORUM models.",
 "Sisters of Battle Immolator": "This model has a transport capacity of 6 ORDO HERETICUS INFANTRY models.\n\nAt the start of the Declare Battle Formations step, you can select one SISTERS OF BATTLE SQUAD from your army. If you do, that unit is split into two units, each containing as equal a number of models as possible (when splitting a unit in this way, make a note of which models form each of the two new units). One of these units must start the battle embarked within this TRANSPORT; the other can start the battle embarked within another TRANSPORT, or it can be deployed as a separate unit.",
 "Corvus Blackstar": "This model has a transport capacity of 12 DEATHWATCH INFANTRY models.",
 "Fortis Kill Team": "This unit cannot embark within an IMPERIAL RHINO.",
 "Indomitor Kill Team": "This unit cannot embark within an IMPERIAL RHINO.",
 "Spectrus Kill Team": "This unit cannot embark within an IMPERIAL RHINO."
};
const FACTION = [
 [
  "Assigned Agents",
  "If your Army Faction is AGENTS OF THE IMPERIUM, then in the Select Detachment Rules step, you can select one of the available Detachments from this book as normal. If your Army Faction is not AGENTS OF THE IMPERIUM, but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below. BATTLE SIZERETINUE UNITSCHARACTER UNITSREQUISITIONED UNITSIncursion111Strike Force221Onslaught332 Note that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/agents.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_UNITE = {
 "Imperial Navy Breachers": [
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Équipe de Brèche",
   "texte": "Each time a model in this unit makes an attack, re-roll a Wound roll of 1."
  }
 ],
 "Deathwatch Kill Team": [
  {
   "champ": "rrH",
   "val": "ones",
   "nom": "Mort aux Xénos",
   "texte": "Each time a model in this unit makes an attack, re-roll a Hit roll of 1."
  }
 ],
 "Watch Captain Artemis": [
  {
   "mot": "sust:1",
   "nom": "Instinct Tactique",
   "texte": "This unit's attacks have [Sustained Hits 1]."
  }
 ],
 "Sanctifiers": [
  {
   "champ": "wndMod",
   "val": 1,
   "port": "C",
   "nom": "Sermon du Ministorum",
   "texte": "While this unit contains a Ministorum Priest, each time a model in this unit makes a melee attack, add 1 to the Wound roll."
  }
 ]
};
const APTIS_COND = {
 "Vindicare Assassin": [
  {
   "arme": "Exitus rifle",
   "champ": "wndMod",
   "val": 1,
   "port": "T",
   "nom": "Brise-Bouclier",
   "quand": "Balle brise-bouclier tirée — une fois par bataille",
   "texte": "Once per battle: until the end of the phase, each time this model makes an attack with that weapon, add 1 to the Wound roll."
  },
  {
   "arme": "Exitus rifle",
   "champ": "critW",
   "val": "tous",
   "port": "T",
   "nom": "Brise-Bouclier — critiques",
   "quand": "Balle brise-bouclier tirée — une fois par bataille",
   "texte": "... and any successful Wound roll scores a Critical Wound."
  }
 ],
 "Eversor Assassin": [
  {
   "champ": "atkMod",
   "val": 3,
   "port": "C",
   "nom": "Surmenage",
   "quand": "Déclenchée à ta phase de Mouvement — une fois par bataille",
   "texte": "Once per battle: until the end of the turn, add 3 to the Attacks characteristic of this model's melee weapons."
  }
 ],
 "Voidsmen-at-Arms": [
  {
   "mot": "lethal",
   "port": "T",
   "nom": "Maîtres des Espaces Clos",
   "quand": "La cible est l'unité éligible la plus proche",
   "texte": "Each time a model in this unit makes a ranged attack that targets the closest eligible target, that attack has the [LETHAL HITS] ability."
  }
 ],
 "Imperial Navy Breachers": [
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Équipe de Brèche — objectif",
   "quand": "La cible est à portée d'un pion d'objectif",
   "texte": "If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Wound roll instead."
  },
  {
   "mot": "ignoresCover",
   "port": "T",
   "nom": "Unité CAT",
   "quand": "Déclenchée ce tour — une fois par bataille",
   "texte": "Once per battle, when this unit is selected to shoot, ranged weapons equipped by this unit gain the [Ignores Cover] ability."
  }
 ],
 "Exaction Squad": [
  {
   "mot": "lethal",
   "nom": "Loi Impériale",
   "quand": "La cible est l'unité désignée en début de bataille",
   "texte": "Each time a model in this unit makes an attack that targets that unit, that attack has the [Lethal Hits] and [Precision] abilities."
  },
  {
   "mot": "ignoresCover",
   "port": "T",
   "nom": "Scanner de Culpabilité",
   "quand": "L'escouade porte le scanner de culpabilité",
   "texte": "Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability."
  }
 ],
 "Vigilant Squad": [
  {
   "champ": "wndMod",
   "val": 1,
   "port": "T",
   "nom": "Jugement Impitoyable",
   "quand": "La cible est sous la moitié de son effectif",
   "texte": "Each time a model in this unit makes a ranged attack that targets a unit that is Below Half-strength, add 1 to the Wound roll."
  }
 ],
 "Ministorum Priest": [
  {
   "champ": "atkMod",
   "val": 3,
   "port": "C",
   "nom": "Zélote",
   "quand": "Déclenchée ce tour — une fois par bataille",
   "texte": "Once per battle, in the Fight phase: improve the Strength and Attacks characteristics of melee weapons equipped by this model by 3."
  },
  {
   "champ": "strMod",
   "val": 3,
   "port": "C",
   "nom": "Zélote — la Force",
   "quand": "Déclenchée ce tour — une fois par bataille",
   "texte": "... and Strength by 3."
  }
 ],
 "Grey Knights Terminator Squad": [
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Main de Fer (Psychique)",
   "quand": "L'unité a chargé ce tour",
   "texte": "Each time this unit makes a Charge move, until the end of the turn, melee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  }
 ],
 "Deathwatch Kill Team": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Mort aux Xénos — ni IMPERIUM ni CHAOS",
   "quand": "La cible n'est ni IMPERIUM ni CHAOS",
   "texte": "If the target of that attack does not have the IMPERIUM or CHAOS keywords, you can re-roll the Hit roll instead."
  }
 ],
 "Aquila Kill Team": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Mort aux Xénos — ni IMPERIUM ni CHAOS",
   "quand": "La cible n'est ni IMPERIUM ni CHAOS",
   "texte": "If the target of that attack does not have the IMPERIUM or CHAOS keywords, you can re-roll the Hit roll instead."
  }
 ],
 "Watch Master": [
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Proie Purgatus",
   "quand": "La cible est la proie traquée",
   "texte": "This unit’s attacks that target this unit’s hunted unit can re-roll wound rolls of 1."
  }
 ],
 "Inquisitor Kroyle": [
  {
   "arme": "Jindarii tox-cycler",
   "champ": "strMod",
   "val": 2,
   "port": "T",
   "nom": "Tox-Cycleur",
   "quand": "Le tox-cycleur a déjà touché dans la bataille",
   "texte": "If this model scored a hit with its Jindarii tox-cycler, until the end of the battle, add 2 to the Strength and Damage characteristics of that weapon."
  },
  {
   "arme": "Jindarii tox-cycler",
   "champ": "dmgMod",
   "val": 2,
   "port": "T",
   "nom": "Tox-Cycleur — dégâts",
   "quand": "Le tox-cycleur a déjà touché dans la bataille",
   "texte": "... add 2 to the Damage characteristic."
  }
 ]
};
const APTIS_CIBLE = {
 "Vindicare Assassin": [
  {
   "vs": [
    "mon"
   ],
   "arme": "Exitus rifle",
   "champ": "critW",
   "val": 4,
   "port": "T",
   "nom": "Balles Micromelta",
   "texte": "This model’s exitus rifle has the [ANTI-MONSTER 4+] ability."
  },
  {
   "vs": [
    "veh"
   ],
   "arme": "Exitus rifle",
   "champ": "critW",
   "val": 4,
   "port": "T",
   "nom": "Balles Micromelta",
   "texte": "This model’s exitus rifle has the [ANTI-VEHICLE 4+] ability."
  }
 ],
 "Watch Master": [
  {
   "vs": [
    "perso"
   ],
   "champ": "rrH",
   "val": "ones",
   "nom": "Maître de Veille",
   "texte": "This model’s attacks that target a Character unit can re-roll hit rolls of 1."
  },
  {
   "vs": [
    "perso"
   ],
   "champ": "rrW",
   "val": "ones",
   "nom": "Maître de Veille",
   "texte": "This model’s attacks that target a Character unit can re-roll wound rolls of 1."
  }
 ]
};
const AURAS_PERSO = {
 "Inquisitor": [
  {
   "champ": "inv",
   "val": 6,
   "nom": "Protections Bénies",
   "texte": "While this model is leading a unit, models in that unit have a 6+ invulnerable save."
  }
 ],
 "Inquisitor Coteaz": [
  {
   "champ": "inv",
   "val": 6,
   "nom": "Protections Maléfiques (Psychique)",
   "texte": "While this model is leading a unit, models in that unit have a 6+ invulnerable save (4+ against Psychic Attacks and DAEMON models, not simulated)."
  }
 ],
 "Ministorum Priest": [
  {
   "mot": "sust:1",
   "port": "C",
   "nom": "Haine Sacrée",
   "texte": "While this model is leading a unit, melee weapons equipped by that unit have the [SUSTAINED HITS 1] ability."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "detach": "Ordo Hereticus, Purgation Force",
  "kw": [
   "Exaction Squad",
   "Inquisitor",
   "Inquisitor Coteaz",
   "Inquisitor Draxus",
   "Inquisitor Greyfax",
   "Inquisitor Kroyle",
   "Inquisitorial Agents",
   "Ministorum Priest",
   "Sisters of Battle Immolator",
   "Sisters of Battle Squad",
   "Subductor Squad",
   "Vigilant Squad"
  ],
  "qui": "figurine",
  "mot": "sust",
  "nom": "Débusquer l'Hérésie — CHAOS",
  "quand": "La cible est une unité du CHAOS de 5 figurines ou plus",
  "texte": "Each time such a model makes an attack that targets a CHAOS unit containing 5 or more models, that attack has the [SUSTAINED HITS 1] ability."
 },
 {
  "detach": "Ordo Malleus, Daemon Hunters",
  "kw": [
   "Grey Knights Terminator Squad",
   "Inquisitor",
   "Inquisitor Coteaz",
   "Inquisitor Draxus",
   "Inquisitor Greyfax",
   "Inquisitor Kroyle",
   "Inquisitorial Agents"
  ],
  "qui": "figurine",
  "champ": "rrW",
  "val": "ones",
  "nom": "Détruire le Démoniaque — DÉMON",
  "quand": "La cible est une unité de DÉMONS",
  "texte": "If the target of that attack is a DAEMON unit, re-roll a Wound roll of 1 as well."
 },
 {
  "detach": "Imperialis Fleet",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "nom": "Éliminer à Tout Prix",
  "quand": "Ce choix est retenu ce tour, et la cible est l'unité désignée",
  "texte": "Each time an AGENTS OF THE IMPERIUM model from your army makes an attack that targets that enemy unit, add 1 to the Hit roll."
 },
 {
  "detach": "Ordo Xenos, Alien Hunters",
  "kw": [
   "Aquila Kill Team",
   "Deathwatch Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "mot": "sust",
  "nom": "Tactique Furor",
  "quand": "La Tactique Furor est active ce tour",
  "texte": "While this Mission Tactic is active, weapons equipped by DEATHWATCH units from your army have the [SUSTAINED HITS 1] ability."
 },
 {
  "detach": "Ordo Xenos, Alien Hunters",
  "kw": [
   "Aquila Kill Team",
   "Deathwatch Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "mot": "lethal",
  "nom": "Tactique Malleus",
  "quand": "La Tactique Malleus est active ce tour",
  "texte": "While this Mission Tactic is active, weapons equipped by DEATHWATCH units from your army have the [LETHAL HITS] ability."
 },
 {
  "detach": "Imperialis Fleet",
  "kw": [],
  "sens": "def",
  "champ": "inv",
  "val": 5,
  "nom": "À Tout Prix — invulnérable",
  "quand": "« Acquérir à Tout Prix » est retenu, et l'unité est sur l'objectif désigné",
  "texte": "While an AGENTS OF THE IMPERIUM unit from your army is within range of that objective marker, models in that unit have a 5+ invulnerable save."
 },
 {
  "source": "Inquisitor Greyfax",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "nom": "Sans Merci",
  "quand": "L'unité est menée par Greyfax, et la cible est sous la moitié de son effectif",
  "texte": "While this model is leading a unit, each time a model in that unit makes an attack that targets a unit that is Below Half-strength, add 1 to the Hit roll."
 },
 {
  "source": "Inquisitor Draxus",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "nom": "Chasseur de Xénos",
  "quand": "L'unité est menée par Draxus, et la cible n'est ni IMPERIUM ni CHAOS",
  "texte": "While this model is leading a unit, each time a model in that unit makes an attack that targets an enemy unit that does not have the IMPERIUM or CHAOS keywords, add 1 to the Hit roll."
 },
 {
  "source": "Inquisitor Kroyle",
  "kw": [],
  "champ": "rrH",
  "val": "failed",
  "nom": "À Mon Signal, Feu !",
  "quand": "La cible a été touchée par Kroyle cette phase",
  "texte": "Each time an Agents of the Imperium or Imperium Infantry Battleline model from your army makes an attack that targets that enemy unit, you can re-roll the Hit roll."
 },
 {
  "source": "Sisters of Battle Immolator",
  "kw": [],
  "mot": "ignoresCover",
  "port": "T",
  "nom": "Purger et Purifier",
  "quand": "La cible a été touchée par l'Immolator cette phase",
  "texte": "Until the end of the phase, that enemy unit cannot have the Benefit of Cover."
 }
];
const OCTROIS_DETACH = {
 "Ordo Hereticus, Purgation Force": [
  {
   "qui": "figurine",
   "kw": [
    "Exaction Squad",
    "Inquisitor",
    "Inquisitor Coteaz",
    "Inquisitor Draxus",
    "Inquisitor Greyfax",
    "Inquisitor Kroyle",
    "Inquisitorial Agents",
    "Ministorum Priest",
    "Sisters of Battle Immolator",
    "Sisters of Battle Squad",
    "Subductor Squad",
    "Vigilant Squad"
   ],
   "mot": "ignorescover",
   "port": "T",
   "nom": "Débusquer l'Hérésie",
   "texte": "Ranged weapons equipped by ADEPTUS ARBITES, INQUISITOR, INQUISITORIAL AGENTS and ORDO HERETICUS models from your army have the [IGNORES COVER] ability."
  }
 ],
 "Ordo Malleus, Daemon Hunters": [
  {
   "qui": "figurine",
   "kw": [
    "Grey Knights Terminator Squad",
    "Inquisitor",
    "Inquisitor Coteaz",
    "Inquisitor Draxus",
    "Inquisitor Greyfax",
    "Inquisitor Kroyle",
    "Inquisitorial Agents"
   ],
   "champ": "rrH",
   "val": "ones",
   "nom": "Détruire le Démoniaque",
   "texte": "Each time an INQUISITOR, INQUISITORIAL AGENTS or ORDO MALLEUS model from your army makes an attack, re-roll a Hit roll of 1."
  }
 ]
};
const STRAT_SIMU = [
 {
  "nom": "Close-Quarters Barrage",
  "detach": "Imperialis Fleet",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Imperial Navy Breachers",
   "Navigator",
   "Rogue Trader Entourage",
   "Voidsmen-at-Arms"
  ],
  "sauf": [],
  "aide": "+1 en Force et +1 en PA — cible à 12\" ou moins",
  "effet": {
   "strMod": 1,
   "apMod": 1
  }
 },
 {
  "nom": "Violent Acquisition",
  "detach": "Imperialis Fleet",
  "pc": 2,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1], [LANCE] (+1 pour blesser après une charge) et [IGNORE LE COUVERT] — cible sur un objectif",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1",
   "ignoresCover": true
  }
 },
 {
  "nom": "Violent Acquisition — après une charge",
  "detach": "Imperialis Fleet",
  "pc": 2,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "… et [LANCE] : l'unité a chargé ce tour",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1",
   "wndMod": 1
  }
 },
 {
  "nom": "Dispense Justice",
  "detach": "Ordo Hereticus, Purgation Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Exaction Squad",
   "Inquisitor Greyfax",
   "Inquisitorial Agents",
   "Ministorum Priest",
   "Sisters of Battle Immolator",
   "Sisters of Battle Squad",
   "Subductor Squad",
   "Vigilant Squad"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES]",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Psybolt Ammunition",
  "detach": "Ordo Malleus, Daemon Hunters",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Grey Knights Terminator Squad"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] au tir",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Rites of Exorcism",
  "detach": "Ordo Malleus, Daemon Hunters",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "[BLESSURES DÉVASTATRICES] contre le DÉMON qui a raté son test",
  "effet": {
   "dev": true
  }
 },
 {
  "nom": "Dragonfire Rounds",
  "detach": "Ordo Xenos, Alien Hunters",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Aquila Kill Team",
   "Deathwatch Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT] au tir",
  "effet": {
   "ignoresCover": true
  }
 },
 {
  "nom": "Kraken Rounds",
  "detach": "Ordo Xenos, Alien Hunters",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Aquila Kill Team",
   "Deathwatch Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "sauf": [],
  "aide": "+1 en PA au tir",
  "effet": {
   "apMod": 1
  }
 },
 {
  "nom": "Hellfire Rounds — contre INFANTERIE",
  "detach": "Ordo Xenos, Alien Hunters",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Aquila Kill Team",
   "Deathwatch Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "sauf": [],
  "aide": "[ANTI-INFANTERIE 2+] — contre une INFANTERIE",
  "effet": {
   "critW": 2
  }
 },
 {
  "nom": "Hellfire Rounds — contre MONSTRE",
  "detach": "Ordo Xenos, Alien Hunters",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Aquila Kill Team",
   "Deathwatch Kill Team",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "sauf": [],
  "aide": "[ANTI-MONSTRE 5+] — contre un MONSTRE",
  "effet": {
   "critW": 5
  }
 },
 {
  "nom": "Prime Target",
  "detach": "Veiled Blade Elimination Force",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "relance des 1 pour blesser — contre un PERSONNAGE",
  "effet": {
   "rrW": "ones"
  }
 },
 {
  "nom": "Prime Target — Assassin contre le Seigneur de Guerre",
  "detach": "Veiled Blade Elimination Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Callidus Assassin",
   "Culexus Assassin",
   "Eversor Assassin",
   "Vindicare Assassin"
  ],
  "sauf": [],
  "aide": "relance des blessures — un ASSASSIN contre le Seigneur de Guerre adverse",
  "effet": {
   "rrW": "failed"
  }
 },
 {
  "nom": "Will-Sapping Salvo",
  "detach": "Veiled Blade Elimination Force",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Aquila Kill Team",
   "Callidus Assassin",
   "Culexus Assassin",
   "Deathwatch Kill Team",
   "Eversor Assassin",
   "Exaction Squad",
   "Grey Knights Terminator Squad",
   "Imperial Navy Breachers",
   "Inquisitor",
   "Inquisitor Coteaz",
   "Inquisitor Draxus",
   "Inquisitor Greyfax",
   "Inquisitorial Agents",
   "Ministorum Priest",
   "Navigator",
   "Rogue Trader Entourage",
   "Sanctifiers",
   "Sisters of Battle Squad",
   "Subductor Squad",
   "Vigilant Squad",
   "Vindicare Assassin",
   "Voidsmen-at-Arms",
   "Watch Captain Artemis",
   "Watch Master"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] au tir",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
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
  cle : "agents",
  nom : "Agents Impériaux",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
