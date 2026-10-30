/* ============================================================
   Données Tyranides — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py tyranides

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
     52 fiches sur 57 en ont un. Les autres — des Legends, que le
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
  ["Barbed Hierodule",8,12,2,0,18,[1],{"1": 340},0,"",1,"",5,"8+"],
  ["Barbgaunts",6,4,4,0,2,[5, 10],{"5": 50, "10": 100},0,"",0,"",1,"8+"],
  ["Biovores",5,6,3,0,5,[1, 2, 3],{"1": 60, "2": 100, "3": 140},0,"",0,"",1,"8+"],
  ["Broodlord",8,5,4,4,6,[1],{"1": 80},0,"Meneur",0,"",1,"7+"],
  ["Carnifexes",8,9,2,0,8,[1, 2],{"1": 90, "2": 180},0,"",0,"",3,"8+"],
  ["Deathleaper",8,6,3,4,7,[1],{"1": 80},0,"",0,"",1,"7+"],
  ["Dimachaeron",12,10,3,5,16,[1],{"1": 200},0,"",1,"",5,"7+"],
  ["Exocrine",8,10,3,0,14,[1],[[1, {"1": 135}], [3, {"1": 145}]],0,"",0,"",4,"8+"],
  ["Gargoyles",12,3,6,0,1,[10, 20],{"10": 75, "20": 150},0,"",0,"",2,"8+"],
  ["Genestealers",8,4,5,5,2,[5, 10],[[1, {"5": 75, "10": 140}], [3, {"5": 85, "10": 150}]],0,"",0,"",1,"7+"],
  ["Harpy",0,9,3,0,12,[1],{"1": 185},0,"",0,"",0,"8+"],
  ["Harridan",14,10,3,0,30,[1],[[1, {"1": 610}], [2, {"1": 660}]],0,"",0,"",0,"8+"],
  ["Haruspex",8,11,3,0,14,[1],[[1, {"1": 125}], [3, {"1": 135}]],0,"",0,"",4,"8+"],
  ["Hierophant",12,14,2,5,30,[1],[[1, {"1": 810}], [2, {"1": 910}]],0,"",0,"",12,"8+"],
  ["Hive Crone",0,9,3,0,12,[1],{"1": 170},0,"",0,"",0,"8+"],
  ["Hive Guard",6,7,3,0,4,[3, 6],[[1, {"3": 80, "6": 160}], [3, {"3": 90, "6": 170}]],0,"",0,"",1,"8+"],
  ["Hive Tyrant",8,10,2,4,10,[1],{"1": 195},0,"Meneur",0,"",3,"7+"],
  ["Hormagaunts",10,3,5,0,1,[10, 20],{"10": 70, "20": 120},0,"",0,"",2,"8+"],
  ["Hyperadapted Raveners",10,5,4,0,6,[5],[[1, {"5": 165}], [3, {"5": 175}]],0,"Meneur",0,"",1,"7+"],
  ["Lictor",8,6,4,0,6,[1],{"1": 60},0,"",0,"",1,"7+"],
  ["Malanthrope",6,5,4,0,10,[1],{"1": 75},0,"Meneur",1,"",3,"7+"],
  ["Maleceptor",8,11,3,4,14,[1],[[1, {"1": 180}], [3, {"1": 190}]],0,"",0,"",4,"7+"],
  ["Mawloc",10,10,3,0,14,[1],{"1": 130},0,"",0,"",4,"8+"],
  ["Mucolid Spores",4,4,7,0,3,[1, 2],{"1": 30, "2": 60},0,"",0,"",0,"8+"],
  ["Neurogaunts",6,3,6,0,1,[11, 22],{"11": 45, "22": 90},0,"",0,"",1,"8+"],
  ["Neurolictor",8,5,4,4,7,[1],[[1, {"1": 80}], [3, {"1": 90}]],0,"",0,"",1,"7+"],
  ["Neurotyrant",6,8,4,4,9,[1],{"1": 120},0,"Meneur",0,"",3,"7+"],
  ["Norn Assimilator",10,11,2,0,16,[1],[[1, {"1": 250}], [2, {"1": 270}]],0,"",0,"",5,"7+"],
  ["Norn Emissary",10,11,2,4,16,[1],[[1, {"1": 250}], [2, {"1": 270}]],0,"",0,"",5,"7+"],
  ["Old One Eye",8,9,2,0,9,[1],{"1": 130},0,"Meneur",0,"",3,"8+"],
  ["Parasite of Mortrex",12,5,4,0,5,[1],{"1": 65},0,"",0,"",1,"8+"],
  ["Psychophage",12,9,3,0,10,[1],{"1": 110},0,"",0,"",3,"8+"],
  ["Pyrovores",5,6,3,0,5,[1, 2, 3],[[1, {"1": 40, "2": 70, "3": 100}], [3, {"1": 50, "2": 80, "3": 110}]],0,"",0,"",1,"8+"],
  ["Raveners",10,5,4,0,3,[5],[[1, {"5": 125}], [3, {"5": 135}]],0,"",0,"",1,"8+"],
  ["Ripper Swarms",6,2,6,0,4,[1, 2, 3],{"1": 30, "2": 40, "3": 50},0,"",0,"",0,"8+"],
  ["Screamer-killer",8,9,2,0,10,[1],[[1, {"1": 125}], [3, {"1": 135}]],0,"",0,"",3,"8+"],
  ["Scythed Hierodule",12,12,2,0,18,[1],{"1": 330},0,"",1,"",5,"8+"],
  ["Sky-slasher Swarms",12,2,6,0,4,[3],{"3": 60},0,"",1,"",0,"8+"],
  ["Spore Mines",4,1,7,0,1,[3, 6],{"3": 55, "6": 110},0,"",0,"",0,"8+"],
  ["Sporocyst",0,10,3,0,10,[1],{"1": 145},0,"",0,"",0,"8+"],
  ["Termagants",6,3,5,0,1,[10, 20],{"10": 55, "20": 110},0,"",0,"",2,"8+"],
  ["Tervigon",8,11,2,0,16,[1],{"1": 150},0,"",0,"",5,"7+"],
  ["The Red Terror",10,8,3,0,9,[1],{"1": 120},0,"",0,"",3,"8+"],
  ["The Swarmlord",8,10,2,4,10,[1],{"1": 210},0,"Meneur",0,"",3,"7+"],
  ["Toxicrene",8,11,3,0,14,[1],{"1": 120},0,"",0,"",4,"8+"],
  ["Trygon",10,10,3,0,14,[1],{"1": 135},0,"",0,"",4,"8+"],
  ["Tyranid Prime with Lash Whip",10,5,3,0,6,[1],{"1": 75},0,"Meneur",0,"",1,"7+"],
  ["Tyranid Warriors with Melee Bio-Weapons",6,5,4,0,3,[3, 6],{"3": 75, "6": 150},0,"",0,"",2,"7+"],
  ["Tyranid Warriors with Ranged Bio-Weapons",6,5,4,0,3,[3, 6],{"3": 60, "6": 120},0,"",0,"",2,"7+"],
  ["Tyrannocyte",8,9,3,0,10,[1],[[1, {"1": 80}], [4, {"1": 90}]],0,"",0,"",2,"8+"],
  ["Tyrannofex",9,12,2,0,16,[1],[[1, {"1": 170}], [3, {"1": 180}]],0,"",0,"",5,"8+"],
  ["Tyrant Guard",6,8,3,0,4,[3, 6],{"3": 80, "6": 170},0,"",0,"",1,"8+"],
  ["Venomthropes",6,5,4,0,3,[3, 6],{"3": 55, "6": 110},0,"",0,"",1,"8+"],
  ["Von Ryan's Leapers",10,5,4,6,3,[3, 6],{"3": 55, "6": 105},0,"",0,"",1,"8+"],
  ["Winged Hive Tyrant",12,9,2,4,10,[1],{"1": 185},0,"",0,"",3,"7+"],
  ["Winged Tyranid Prime",12,5,4,0,6,[1],{"1": 65},0,"Meneur",0,"",1,"7+"],
  ["Zoanthropes",5,5,5,4,3,[3, 6],{"3": 90, "6": 190},0,"",0,"",1,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Barbed Hierodule","Bio-cannon","T","D6+3",3,9,2,"2","blast","48\""],
  ["Barbed Hierodule","Hierodule scything talons","C","8",3,14,2,"D3+3","","càc"],
  ["Barbgaunts","Barblauncher","T","D6",4,5,0,"1","blast heavy","24\""],
  ["Barbgaunts","Chitinous claws and teeth","C","1",4,4,0,"1","","càc"],
  ["Biovores","Spore mine launcher","T","D3",4,6,1,"2","blast dev heavy indirect","48\""],
  ["Biovores","Chitin-barbed limbs","C","2",4,5,0,"1","","càc"],
  ["Broodlord","Broodlord Claws and Talons","C","5",2,6,2,"2","dev twin","càc"],
  ["Carnifexes","Bio-plasma","T","D3",4,7,2,"1","assault blast","12\""],
  ["Carnifexes","Deathspitters with slimer maggots","T","6",4,7,2,"1","","24\""],
  ["Carnifexes","Devourers with brainleech worms","T","12",4,6,0,"1","","18\""],
  ["Carnifexes","Heavy venom cannon","T","D3",4,9,2,"3","blast","36\""],
  ["Carnifexes","Spine banks","T","5",4,5,0,"1","assault","6\""],
  ["Carnifexes","Stranglethorn cannon","T","D6+1",4,7,1,"2","blast","36\""],
  ["Carnifexes","Carnifex crushing claws","C","4",4,12,3,"D6+1","","càc"],
  ["Carnifexes","Carnifex extra scything talons","C","2",4,9,2,"3","extra","càc"],
  ["Carnifexes","Carnifex scything talons","C","6",4,9,2,"3","","càc"],
  ["Carnifexes","Chitinous claws and teeth","C","4",4,6,0,"1","","càc"],
  ["Deathleaper","Lictor claws and talons","C","6",2,7,2,"2","precision","càc"],
  ["Dimachaeron","Massive scything talons","C","10",3,9,2,"3","twin","càc"],
  ["Exocrine","Bio-plasmic cannon","T","D6+3",3,9,3,"3","blast heavy","36\""],
  ["Exocrine","Powerful limbs","C","3",3,7,0,"2","","càc"],
  ["Gargoyles","Fleshborer","T","1",4,5,0,"1","assault","18\""],
  ["Gargoyles","Blinding venom","C","1",4,3,0,"1","","càc"],
  ["Genestealers","Genestealers claws and talons","C","4",2,4,2,"1","","càc"],
  ["Harpy","Stinger salvoes","T","8",3,5,0,"1","","24\""],
  ["Harpy","Twin heavy venom cannon","T","D3",3,9,2,"3","blast twin","36\""],
  ["Harpy","Twin stranglethorn cannon","T","D6+1",2,7,1,"2","blast twin","36\""],
  ["Harpy","Scything wings","C","4",4,7,1,"2","","càc"],
  ["Harridan","Dire bio-cannon","T","D6+6",3,10,3,"3","blast","48\""],
  ["Harridan","Gargantuan scything talons","C","6",3,14,2,"D6","","càc"],
  ["Haruspex","Grasping tongue","T","1",3,6,2,"D6+1","precision","12\""],
  ["Haruspex","Ravenous maw","C","14",3,7,1,"2","","càc"],
  ["Haruspex","Shovelling claws","C","4",3,14,2,"D6+1","extra","càc"],
  ["Hierophant","Bio-plasma torrent","T","3D6",0,7,2,"1","assault torrent","12\""],
  ["Hierophant","Dire bio-cannon","T","D6+6",3,10,3,"3","blast","48\""],
  ["Hierophant","Lashwhip pods","C","10",3,5,1,"1","extra","càc"],
  ["Hierophant","Titanic scything talons","C","8",3,20,2,"D6+1","","càc"],
  ["Hive Crone","Drool cannon","T","2D6",0,6,1,"1","torrent","12\""],
  ["Hive Crone","Stinger salvoes","T","8",3,5,0,"1","","24\""],
  ["Hive Crone","Tentaclids","T","4",3,7,0,"2","anti:4:veh dev","36\""],
  ["Hive Crone","Scything wings","C","4",4,7,1,"2","","càc"],
  ["Hive Crone","Thorax spur","C","1",3,10,3,"D6","anti:2:vol extra","càc"],
  ["Hive Guard","Impaler cannon","T","4",4,5,1,"1","heavy indirect","36\""],
  ["Hive Guard","Shockcannon","T","2",3,7,1,"3","anti:2:veh","24\""],
  ["Hive Guard","Chitinous claws and teeth","C","3",4,5,0,"1","","càc"],
  ["Hive Tyrant","Heavy venom cannon","T","D3",2,9,2,"3","blast","36\""],
  ["Hive Tyrant","Stranglethorn cannon","T","D6+1",2,7,1,"2","blast","36\""],
  ["Hive Tyrant","Monstrous bonesword and lash whip","C","6",2,9,2,"3","twin","càc"],
  ["Hive Tyrant","Monstrous scything talons","C","4",2,7,2,"2","extra","càc"],
  ["Hormagaunts","Hormagaunt talons","C","3",4,3,1,"1","","càc"],
  ["Hyperadapted Raveners","Venom bolt","T","D6+3",0,6,1,"1","assault ignorescover torrent","12\""],
  ["Hyperadapted Raveners","Prime claws and talons","C","6",3,5,2,"2","anti:5:mon anti:5:veh twin","càc"],
  ["Hyperadapted Raveners","Ravener heavy claws and talons","C","3",3,5,2,"2","anti:5:mon anti:5:veh twin","càc"],
  ["Lictor","Lictor claws and talons","C","6",2,7,2,"2","precision","càc"],
  ["Malanthrope","Grasping tail","C","4",0,5,0,"2","","càc"],
  ["Maleceptor","Psychic overload","T","D6+3",3,10,2,"3","blast psychic","18\""],
  ["Maleceptor","➤ Massive scything talons - strike","C","3",3,9,2,"D6+1","","càc"],
  ["Maleceptor","➤ Massive scything talons - sweep","C","6",3,7,1,"2","","càc"],
  ["Mawloc","Distendible jaw","C","1",3,5,0,"3","anti:4:inf dev extra","càc"],
  ["Mawloc","Mawloc scything talons","C","16",3,8,2,"1","","càc"],
  ["Neurogaunts","Chitinous claws and teeth","C","1",4,3,0,"1","","càc"],
  ["Neurolictor","Piercing claws and talons","C","6",2,6,2,"1","precision","càc"],
  ["Neurotyrant","Psychic scream","T","2D6",0,5,1,"2","ignorescover psychic torrent","18\""],
  ["Neurotyrant","Neurotyrant claws and lashes","C","6",3,5,0,"1","","càc"],
  ["Norn Assimilator","Toxinjecter Harpoon (tir)","T","2",2,12,3,"D6+1","","12\""],
  ["Norn Assimilator","Monstrous scything talons","C","6",2,9,2,"3","","càc"],
  ["Norn Assimilator","Toxinjecter Harpoon (càc)","C","4",2,12,3,"D6+1","extra","càc"],
  ["Norn Emissary","➤ Psychic tendril - neuroblast","T","2D6",2,6,2,"1","blast psychic","18\""],
  ["Norn Emissary","➤ Psychic tendril - neurolance","T","2",2,12,3,"D6","melta:2 psychic","18\""],
  ["Norn Emissary","➤ Psychic tendril - neuroparasite","T","2",2,8,2,"D3","precision psychic","18\""],
  ["Norn Emissary","Monstrous rending claws","C","4",2,7,2,"2","extra","càc"],
  ["Norn Emissary","Monstrous scything talons","C","6",2,9,2,"3","","càc"],
  ["Old One Eye","➤ Old One Eye’s claws and talons - Strike","C","6",3,14,3,"D6+1","","càc"],
  ["Old One Eye","➤ Old One Eye’s claws and talons - Sweep","C","12",3,6,1,"1","","càc"],
  ["Parasite of Mortrex","Barbed ovipositor","C","1",2,3,2,"3","anti:3:inf extra","càc"],
  ["Parasite of Mortrex","Clawed limbs","C","6",2,5,1,"1","","càc"],
  ["Psychophage","Psychoclastic torrent","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Psychophage","Talons and betentacled maw","C","6",3,6,2,"2","anti:4 dev","càc"],
  ["Pyrovores","Flamespurt","T","D6+1",0,6,1,"1","ignorescover torrent twin","12\""],
  ["Pyrovores","Chitin-barbed limbs","C","2",4,5,0,"1","","càc"],
  ["Raveners","Ravener claws and talons","C","3",3,5,2,"2","twin","càc"],
  ["Ripper Swarms","Spinemaw","T","4",5,3,0,"1","pistol","6\""],
  ["Ripper Swarms","Chitinous claws and teeth","C","6",5,2,0,"1","sust:1","càc"],
  ["Screamer-killer","Bio-plasmic scream","T","D6+3",4,8,2,"1","assault blast","18\""],
  ["Screamer-killer","Screamer-killer talons","C","10",3,10,2,"3","","càc"],
  ["Scythed Hierodule","Bio-acid spray","T","3D6",0,6,2,"1","torrent","18\""],
  ["Scythed Hierodule","Hierodule scything talons","C","10",3,14,2,"D3+3","","càc"],
  ["Sky-slasher Swarms","Spinemaws","T","4",5,3,0,"1","pistol","6\""],
  ["Sky-slasher Swarms","Claws and teeth","C","6",5,2,0,"1","sust:1","càc"],
  ["Sporocyst","Sporocyst bio-weapon","T","10",4,5,1,"2","","24\""],
  ["Sporocyst","Flensing whips","C","6",4,7,1,"2","","càc"],
  ["Termagants","Fleshborer","T","1",4,5,0,"1","assault","18\""],
  ["Termagants","Shardlauncher","T","D3",4,5,0,"1","blast heavy","18\""],
  ["Termagants","Spike rifle","T","1",4,4,1,"1","heavy","24\""],
  ["Termagants","Strangleweb","T","D6",0,2,0,"1","assault dev torrent","18\""],
  ["Termagants","Termagant devourer","T","2",4,4,0,"1","","18\""],
  ["Termagants","Termagant spinefist","T","2",4,3,0,"1","assault pistol twin","12\""],
  ["Termagants","Chitinous claws and teeth","C","1",4,3,0,"1","","càc"],
  ["Tervigon","Stinger salvoes","T","8",3,5,0,"1","","24\""],
  ["Tervigon","Massive crushing claws","C","4",4,12,3,"D6+1","","càc"],
  ["Tervigon","➤ Massive scything talons - strike","C","4",3,9,2,"D6","","càc"],
  ["Tervigon","➤ Massive scything talons - sweep","C","8",3,7,1,"2","","càc"],
  ["The Red Terror","Gaping maw","C","1",2,5,0,"D3+2","extra dev precision","càc"],
  ["The Red Terror","Scything talons","C","12",2,7,2,"2","","càc"],
  ["The Swarmlord","Synaptic Pulse","T","D6+3",0,5,1,"2","psychic torrent","18\""],
  ["The Swarmlord","Bone Sabres","C","8",2,9,2,"3","twin","càc"],
  ["Toxicrene","Massive toxic lashes (tir)","T","2D6",3,6,1,"2","anti:2:inf","9\""],
  ["Toxicrene","Massive toxic lashes (càc)","C","12",3,6,1,"2","anti:2:inf","càc"],
  ["Trygon","Bio-electric pulse","T","6",3,5,0,"1","sust:2","12\""],
  ["Trygon","Trygon scything talons","C","12",3,9,2,"3","","càc"],
  ["Tyranid Prime with Lash Whip","Lash whip","C","8",2,4,2,"1","extra","càc"],
  ["Tyranid Prime with Lash Whip","Rending claw","C","4",2,8,2,"3","","càc"],
  ["Tyranid Prime with Lash Whip","Scything talons","C","6",2,6,2,"2","","càc"],
  ["Tyranid Warriors with Melee Bio-Weapons","Tyranid Warrior claws and talons","C","6",3,5,2,"1","twin","càc"],
  ["Tyranid Warriors with Ranged Bio-Weapons","Barbed strangler","T","D6+1",4,6,1,"1","blast","36\""],
  ["Tyranid Warriors with Ranged Bio-Weapons","Deathspitter","T","3",4,5,1,"1","","24\""],
  ["Tyranid Warriors with Ranged Bio-Weapons","Devourer","T","5",4,4,0,"1","","18\""],
  ["Tyranid Warriors with Ranged Bio-Weapons","Spinefists","T","2",4,4,0,"1","assault pistol twin","12\""],
  ["Tyranid Warriors with Ranged Bio-Weapons","Venom cannon","T","D3",4,9,2,"2","blast","36\""],
  ["Tyranid Warriors with Ranged Bio-Weapons","Tyranid Warrior claws and talons","C","5",3,5,1,"1","","càc"],
  ["Tyrannocyte","Tyrannocyte Bio-weapons","T","5",4,5,1,"2","","24\""],
  ["Tyrannocyte","Flensing Whips","C","6",4,7,1,"2","","càc"],
  ["Tyrannofex","Acid spray","T","D6+6",0,6,2,"2","torrent","18\""],
  ["Tyrannofex","Fleshborer hive","T","20",3,5,0,"1","heavy sust:1 twin","24\""],
  ["Tyrannofex","Rupture cannon","T","2",3,18,4,"D6+6","heavy","48\""],
  ["Tyrannofex","Stinger salvoes","T","8",3,5,0,"1","","24\""],
  ["Tyrannofex","Powerful limbs","C","4",3,8,0,"2","","càc"],
  ["Tyrant Guard","Bone cleaver, lash whip and rending claws","C","3",3,5,1,"2","","càc"],
  ["Tyrant Guard","Crushing claws and rending claws","C","2",4,8,2,"2","twin","càc"],
  ["Tyrant Guard","Scything talons and rending claws","C","5",3,5,1,"1","","càc"],
  ["Venomthropes","Toxic lashes","C","5",3,3,0,"1","anti:2:inf","càc"],
  ["Von Ryan's Leapers","Leaper's talons","C","6",3,5,1,"1","","càc"],
  ["Winged Hive Tyrant","Heavy venom cannon","T","D3",2,9,2,"3","blast","36\""],
  ["Winged Hive Tyrant","Stranglethorn cannon","T","D6+1",2,7,1,"2","blast","36\""],
  ["Winged Hive Tyrant","Monstrous bonesword and lash whip","C","6",2,9,2,"3","twin","càc"],
  ["Winged Hive Tyrant","Monstrous scything talons","C","4",2,7,2,"2","extra","càc"],
  ["Winged Hive Tyrant","Tyrant talons","C","5",2,7,2,"2","","càc"],
  ["Winged Tyranid Prime","Prime talons","C","6",2,6,1,"2","","càc"],
  ["Zoanthropes","➤ Warp blast - focused witchfire","T","1",3,12,3,"D6+1","lethal psychic","24\""],
  ["Zoanthropes","➤ Warp blast - witchfire","T","D3",3,7,2,"D3","blast psychic","24\""],
  ["Zoanthropes","Chitinous claws and teeth","C","2",5,3,0,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Barbed Hierodule","Monstre"],
  ["Barbgaunts","Infanterie"],
  ["Biovores","Infanterie"],
  ["Broodlord","Personnage"],
  ["Carnifexes","Monstre"],
  ["Deathleaper","Epic Hero"],
  ["Dimachaeron","Monstre"],
  ["Exocrine","Monstre"],
  ["Gargoyles","Battleline"],
  ["Genestealers","Infanterie"],
  ["Harpy","Monstre"],
  ["Harridan","Monstre"],
  ["Haruspex","Monstre"],
  ["Hierophant","Monstre"],
  ["Hive Crone","Monstre"],
  ["Hive Guard","Infanterie"],
  ["Hive Tyrant","Monstre"],
  ["Hormagaunts","Battleline"],
  ["Hyperadapted Raveners","Personnage"],
  ["Lictor","Infanterie"],
  ["Malanthrope","Personnage"],
  ["Maleceptor","Monstre"],
  ["Mawloc","Monstre"],
  ["Mucolid Spores","Bête"],
  ["Neurogaunts","Infanterie"],
  ["Neurolictor","Infanterie"],
  ["Neurotyrant","Monstre"],
  ["Norn Assimilator","Monstre"],
  ["Norn Emissary","Monstre"],
  ["Old One Eye","Epic Hero"],
  ["Parasite of Mortrex","Personnage"],
  ["Psychophage","Monstre"],
  ["Pyrovores","Infanterie"],
  ["Raveners","Infanterie"],
  ["Ripper Swarms","Bête"],
  ["Screamer-killer","Monstre"],
  ["Scythed Hierodule","Monstre"],
  ["Sky-slasher Swarms","Bête"],
  ["Spore Mines","Bête"],
  ["Sporocyst","Monstre"],
  ["Termagants","Battleline"],
  ["Tervigon","Monstre"],
  ["The Red Terror","Epic Hero"],
  ["The Swarmlord","Epic Hero"],
  ["Toxicrene","Monstre"],
  ["Trygon","Monstre"],
  ["Tyranid Prime with Lash Whip","Personnage"],
  ["Tyranid Warriors with Melee Bio-Weapons","Infanterie"],
  ["Tyranid Warriors with Ranged Bio-Weapons","Infanterie"],
  ["Tyrannocyte","Monstre"],
  ["Tyrannofex","Monstre"],
  ["Tyrant Guard","Infanterie"],
  ["Venomthropes","Infanterie"],
  ["Von Ryan's Leapers","Infanterie"],
  ["Winged Hive Tyrant","Monstre"],
  ["Winged Tyranid Prime","Personnage"],
  ["Zoanthropes","Infanterie"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Broodlord": [
  "Genestealers"
 ],
 "Hive Tyrant": [
  "Tyrant Guard"
 ],
 "Hyperadapted Raveners": [
  "Raveners"
 ],
 "Malanthrope": [
  "Venomthropes"
 ],
 "Neurotyrant": [
  "Neurogaunts",
  "Tyrant Guard",
  "Zoanthropes"
 ],
 "Old One Eye": [
  "Carnifexes"
 ],
 "The Swarmlord": [
  "Tyrant Guard"
 ],
 "Tyranid Prime with Lash Whip": [
  "Hormagaunts",
  "Termagants",
  "Tyranid Warriors with Melee Bio-Weapons",
  "Tyranid Warriors with Ranged Bio-Weapons"
 ],
 "Winged Tyranid Prime": [
  "Gargoyles",
  "Tyranid Warriors with Melee Bio-Weapons",
  "Tyranid Warriors with Ranged Bio-Weapons"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Tervigon": [
  [
   "Spawn Termagants",
   "In your Command phase, you can select one friendly TERMAGANTS unit within 6\" of this model and return up to D3+3 destroyed TERMAGANT models to that unit. A TERMAGANTS unit cannot be selected for this ability more than once per phase."
  ],
  [
   "Brood Progenitor (Aura, Psychic)",
   "While a friendly TERMAGANTS unit is within 6\" of this model, ranged weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "The Swarmlord": [
  [
   "Hive Commander",
   "At the start of your Command phase, if this model is on the battlefield, you gain 1CP"
  ],
  [
   "Malign Presence (Aura)",
   "Once per turn, when your opponent targets a unit from their army within 12\" of this model with a stratagem, you can use this ability. If you do increase the CP cost of that use of that stratagem by 1CP."
  ],
  [
   "Domination of the Hive Mind (Aura)",
   "While a friendly TYRANIDS unit is within 9\" of this model, that unit is within your army’s Synapse Range."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Tyrant Guard"
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Broodlord": [
  [
   "Vicious Insight",
   "While this model is leading a unit, weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Hypnotic Gaze (Psychic)",
   "At the start of the Fight phase, select one enemy unit within Engagement Range of this model. Until the end of the phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Genestealers"
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ]
 ],
 "Old One Eye": [
  [
   "Alpha Leader",
   "While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Hit roll."
  ],
  [
   "Unstoppable Monster",
   "At the start of each player’s Command phase, this model regains up to D3 lost wounds."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Carnifexes"
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Tyranid Warriors with Ranged Bio-Weapons": [
  [
   "Adaptable Predators",
   "This unit is eligible to shoot and declare a charge in a turn in which it Fell Back."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Tyranid Warriors with Melee Bio-Weapons": [
  [
   "Adaptive Instincts (Once per turn, per unit)",
   "In the Fight phase, when this unit is selected to fight or when an enemy unit targets this unit, you can select one of the following:\n▪ This unit’s melee attacks have +1 S.\n▪ Or: This unit has +1 T."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Termagants": [
  [
   "Skulking Horrors",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6\"."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Hormagaunts": [
  [
   "Bounding Leap",
   "This unit is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Toxicrene": [
  [
   "Grasping Tendrils",
   "Each time an enemy unit (excluding Titanic units) within Engagement Range of one or more units from your army with this ability is selected to Fall Back, you can roll one D6: on a 3+, that enemy unit must Remain Stationary instead."
  ],
  [
   "Hypertoxic Miasma (Aura)",
   "At the end of your Movement phase, roll one D6 for each enemy unit within 6\" of this model: on a 2-3, that unit suffers 1 mortal wound; on a 4-5, that unit suffers D3 mortal wounds; on a 6, that unit suffers D6 mortal wounds."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Tyrant Guard": [
  [
   "Guardian Organism",
   "While a Character model is leading this unit, that Character has the Feel No Pain 5+ ability."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Neurotyrant": [
  [
   "Node Lash (Psychic)",
   "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll. If the target is Battle-shocked, add 1 to the Wound roll as well."
  ],
  [
   "Psychic Terror (Psychic)",
   "If one or more Neurotyrants from your army are on the battlefield when you unleash the Shadow in the Warp, subtract 1 from the Battle-shock test each enemy unit on the battlefield must take as a result."
  ],
  [
   "Neuroloids",
   "In your Command phase, you can select up to two friendly Tyranids units within 18\" of this model’s unit. Until the start of your next Command phase, the selected units are always considered to be within Synapse Range of your army.\n\nDesigner's Note: *Place a Neuroloid token next to each select unit to remind you.*"
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Neurogaunts\n- Tyrant Guard\n- Zoanthropes"
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Maleceptor": [
  [
   "Encephalic Diffusion (Aura, Psychic)",
   "While an enemy unit is within 6\" of this model, each time a model in that unit makes an attack, subtract 1 from the Hit roll, and, if that enemy unit is Below Half-strength, subtract 1 from the Wound roll as well."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Pyrovores": [
  [
   "Burning Spray",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that enemy unit cannot have the Benefit of Cover."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Haruspex": [
  [
   "Grisly Spectacle",
   "Each time this model is selected to fight, after resolving its attacks, if one or more enemy units were destroyed by those attacks, each enemy unit within 6\" of this model must take a Battle-shock test."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Venomthropes": [
  [
   "Foul Spores (Aura)",
   "Friendly TYRANIDS units within 6\" of this unit have Stealth."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Neurogaunts": [
  [
   "Neurocytes",
   "While this unit is within Synapse Range of your friendly Tyranids unit (excluding Neurogaunt units), it has the Synapse keyword."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Zoanthropes": [
  [
   "Spirit Leech (Aura, Psychic)",
   "While an enemy unit is within 6\" of this unit, if it contains a Neurothrope, each time that enemy unit fails a Battle-shock test, it suffers D3 mortal wounds and one model in this unit regains up to D3 lost wounds."
  ],
  [
   "Warp Field (Aura, Psychic)",
   "While a friendly TYRANIDS unit is within 6\" of this unit, models in that unit have a 6+ invulnerable save."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Mucolid Spores": [
  [
   "Bio-minefield",
   "Enemy units cannot start or end an Advance move within 6\" of this unit."
  ],
  [
   "Floating Death",
   "Each time this unit or an enemy unit ends a move, for each model in this unit within 3\" of one or more enemy units, select one of those enemy units. That model in this unit is destroyed, then roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6 that enemy unit suffers D6 mortal wounds."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Spore Mines": [
  [
   "Bio-minefield",
   "Enemy units cannot start or end an Advance move within 6\" of this unit."
  ],
  [
   "Floating Death",
   "Each time this unit or an enemy unit ends a move, for each model in this unit that is within 3\" of one or more enemy units, select one of those enemy units. That model in this unit is destroyed, then roll one D6: on a 2-5, that enemy unit suffers 1 mortal wound; on a 6, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Exocrine": [
  [
   "Symbiotic Targeting",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly TYRANIDS model makes an attack that targets that unit, re-roll a Hit roll of 1."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Biovores": [
  [
   "Seed Spore Mines",
   "Once per turn, in your Shooting Phase, when selected to shoot, one unit with this ability can use it instead of making any attacks with its ranged weapons. If it does, you can add one new SPORE MINES unit to your army and set it up anywhere on the battlefield that is wholly within 48\" of this unit and more than 8\" horizontally away from all enemy units. That SPORE MINES unit contains 1 model for each model in this unit."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Carnifexes": [
  [
   "Blistering Assault",
   "In your opponent’s Shooting phase, when an enemy unit has shot, if a model in this unit lost a wound as a result of those attacks, this unit can make a surge move of up to D6+2\"."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Screamer-killer": [
  [
   "Death Scream",
   "In your Shooting phase, after this model has shot, select one unit hit by one or more of those attacks. That unit must take a Battle-shock test, subtracting 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Hive Guard": [
  [
   "Defensive Stance",
   "Each time you target this unit with the Fire Overwatch Stratagem, while resolving that Stratagem, hits are scored on unmodified Hit rolls of 5+, or unmodified Hit rolls of 4+ instead if this unit is within range of an objective marker that you control."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Tyrannofex": [
  [
   "Resilient Organism",
   "Once per battle, when an attack is allocated to this model, you can change the Damage characteristic of that attack to 0."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Hive Crone": [
  [
   "Airborne Predator",
   "Each time this model makes a ranged attack that targets a unit that can FLY, add 1 to the Hit roll."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Harpy": [
  [
   "Spore Mine Cysts",
   "At the end of your opponent’s Fight phase, you can do one of the following:\n- Select one visible enemy unit (excluding Lone Operative units) within 24\" of this unit and roll six D6 for that unit: for each 3+, that unit suffers 1 mortal wound.\n- Add a new SPORE MINES unit containing D3 models to your army and set it up anywhere on the battlefield that is within 6\" of this model and more than 8\" horizontally away from all enemy units. You cannot select this option for more than one model per turn."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Sporocyst": [
  [
   "Seed Mucolids",
   "Once per turn, in your shooting phase, when selected to shoot, one unit with this ability can use it instead of making any attacks with it's ranged weapons. If it does, you can add one new MUCOLID SPORES containing 1 model to your army and set it up anywhere on the battlefield that is wholly within 18\" of this model and more than 8\" horizontally away from all enemy units."
  ],
  [
   "Hive Defences",
   "You can target this model with the Fire Overwatch stratagem for 0CP, and can do so even if you have already targeted a different unit with that stratagem this turn. This model can only be targeted with that Stratagem once per turn"
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Psychophage": [
  [
   "Bio-stimulus",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly TYRANIDS unit makes a melee attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per turn."
  ],
  [
   "Feeding Frenzy",
   "Each time this model makes a melee attack that targets a unit that is below its Starting Strength, add 1 to the Hit roll. If that target is also Below Half strength, add 1 to the Wound roll as well."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Barbgaunts": [
  [
   "Disruption Bombardment",
   "In your Shooting phase, after this unit has shot, select one enemy INFANTRY unit hit by one or more of those attacks. Until the end of your opponent’s next turn, that enemy unit is disrupted. While a unit is disrupted, subtract 2 from its Move characteristic, and subtract 2 from Advance and Charge rolls made for it."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Barbed Hierodule": [
  [
   "Overgrown Barbs",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding Titanic units) that was hit by one or more of those attacks. Until the start of your next turn, while this model is on the battlefield, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Scythed Hierodule": [
  [
   "Irresistible Force",
   "This model is eligible to declare a charge in a turn in which it Fell Back."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Harridan": [
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Frenzied Metabolism",
   "Each time this model is selected to shoot, you can use this ability. If you do, until the end of the phase, each time this model makes an attack, add 1 to the Wound roll. After resolving those attacks, roll one D6: on a 2+, this model suffers D3 mortal wounds."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Hierophant": [
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, subtract 6 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Apex-beast",
   "Each time this model makes an attack that targets a unit that is Battle-shocked, add 1 to the Hit roll."
  ],
  [
   "Stalking Forward",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move over models (excluding TITANIC models) and terrain features that are 4\" or less in height as if they were not there."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Genestealers": [
  [
   "Vanguard Predator",
   "Each time a model in this unit makes an attack, re-roll a Hit roll of 1. If the target is within range of one or more objective markers, re-roll a Wound roll 1 as well."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Dimachaeron": [
  [
   "Digestion Spine",
   "Each time this model fights, after it has resolved its attacks, if one or more enemy models (excluding Vehicle models) were destroyed as the result of those attacks, this model regains up to D3 mortal wounds."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Sky-slasher Swarms": [
  [
   "Chitinous Horrors",
   "While an enemy unit is within Engagement Range of one or more units with this ability, halve the Objective Control characteristic of models in that enemy unit."
  ]
 ],
 "Malanthrope": [
  [
   "Enhanced Toxic Miasma",
   "While this model is leading a unit, the range of that unit's Foul Spores Aura ability is increased to 9\"."
  ],
  [
   "Prey Adaptation",
   "Each time this model's unit is selected to fight, select one of the following abilities to apply to all melee weapons equipped by models in that unit until the end of the phase:\n- [SUSTAINED HITS 1]\n- [LANCE]\n- [LETHAL HITS]"
  ],
  [
   "Leader",
   "This model can be attached to the following unit: \n- Venomthropes"
  ]
 ],
 "Norn Assimilator": [
  [
   "Harpoon Barbs",
   "Once per turn, when an enemy unit within Engagement Range of this unit is chosen to Fall Back, roll one D6; on a 2+, that unit suffers D6 mortal wounds."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Singular Purpose",
   "At the start of the first battle round, select one of the following:\n- Select one enemy unit. Until the end of the battle, each time this model makes an attack that targets that unit you can re-roll the Hit roll and you can re-roll the Wound roll\n- Select one objective marker. Until the end of the battle, while this model is within range of that objective marker, it has the Feel No Pain 5+ ability and an Objective Control characteristic of 15."
  ],
  [
   "Protean Purpose",
   "(Once per battle, per unit) In your Command phase, you can use this ability. If you do, this unit can make a selection for its Singular Purpose ability (this replaces the previous selection)."
  ],
  [
   "Encircling Horrors",
   "NEUROLICTOR/LICTOR/VON RYAN’S LEAPERS unit only. In your opponent’s Movement phase, when an enemy unit ends a move within 8\" of this unit, this unit can make a normal move of up to D3+3\"."
  ],
  [
   "Cryptophotaic Camouflage",
   "VON RYAN’S LEAPERS unit only. This unit has -3\" detection range."
  ],
  [
   "Destabilising Predation",
   "NORN EMISSARY unit only. This unit’s ranged attacks have [ANTI-CHARACTER 2+]."
  ],
  [
   "Synaptoprescience",
   "NORN ASSIMILATOR unit only. This unit has 4+ InSv."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Norn Emissary": [
  [
   "Unnatural Resistance",
   "This model has the Feel No Pain 4+ ability against Mortal Wounds."
  ],
  [
   "Singular Purpose",
   "At the start of the first battle round, select one of the following:\n- Select one enemy unit. Until the end of the battle, each time this model makes an attack that targets that unit you can re-roll the Hit roll and you can re-roll the Wound roll\n- Select one objective marker. Until the end of the battle, while this model is within range of that objective marker, it has the Feel No Pain 5+ ability and an Objective Control characteristic of 15."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Protean Purpose",
   "(Once per battle, per unit) In your Command phase, you can use this ability. If you do, this unit can make a selection for its Singular Purpose ability (this replaces the previous selection)."
  ],
  [
   "Encircling Horrors",
   "NEUROLICTOR/LICTOR/VON RYAN’S LEAPERS unit only. In your opponent’s Movement phase, when an enemy unit ends a move within 8\" of this unit, this unit can make a normal move of up to D3+3\"."
  ],
  [
   "Cryptophotaic Camouflage",
   "VON RYAN’S LEAPERS unit only. This unit has -3\" detection range."
  ],
  [
   "Destabilising Predation",
   "NORN EMISSARY unit only. This unit’s ranged attacks have [ANTI-CHARACTER 2+]."
  ],
  [
   "Synaptoprescience",
   "NORN ASSIMILATOR unit only. This unit has 4+ InSv."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Hive Tyrant": [
  [
   "Onslaught (Aura, Psychic)",
   "While a friendly TYRANIDS unit is within 6\" of this model, ranged weapons equipped by models in that unit have the [ASSAULT] and [LETHAL HITS] abilities."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Tyrant Guard"
  ],
  [
   "Will of the Hive Mind",
   "Once per battle round, one model from your army with this ability can use it when a friendly TYRANIDS unit within 12\" of that model is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Tyranid Prime with Lash Whip": [
  [
   "Alpha Warrior",
   "Weapons equipped by models in this model’s unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Aggressive Leader‑beast",
   "In your opponent’s Shooting phase, when an enemy unit has shot, if a model in this unit was destroyed by those attacks, this unit can make a surge move of up to D6\"."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Hormagaunts\n- Termagants\n- Tyranid Warriors with Melee Bio-weapons\n- Tyranid Warriors with Ranged Bio-weapons"
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ]
 ],
 "Winged Hive Tyrant": [
  [
   "Paroxysm (Psychic)",
   "At the start of the Fight phase, you can select one enemy unit within 12\" of and visible to this model and roll one D6: on a 1, this Psyker suffers D3 mortal wounds; on a 2+, until the end of the phase, subtract 1 from the Attacks characteristic of weapons equipped by models in that unit."
  ],
  [
   "Will of the Hive Mind",
   "Once per battle round, one model from your army with this ability can use it when a friendly TYRANIDS unit within 12\" of that model is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Winged Tyranid Prime": [
  [
   "Alpha Warrior",
   "While this model is leading a unit, weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Death Blow",
   "If this model is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 4+, do not remove it from play. The destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Gargoyles\n- Tyranid Warriors With Melee Bio-Weapons\n- Tyranid Warriors With Ranged Bio-Weapons"
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ]
 ],
 "Deathleaper": [
  [
   "Fear of the Unseen (Aura)",
   "While an enemy unit is within 6\" of this model, worsen the Leadership characteristic of models in that unit by 1. In addition, in the Battle-shock step of your opponent’s Command phase, if such an enemy unit is below its Starting Strength, it must take a Battle-shock test."
  ],
  [
   "Hunter Organism",
   "This model cannot be your Warlord"
  ],
  [
   "Feeder Tendrils",
   "Each time this model destroys an enemy Character model, you gain 1CP."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Gargoyles": [
  [
   "Winged Swarm",
   "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of any enemy units, it can make a Normal move of up to 6\". If it does, until the end of the turn, this unit is not eligible to declare a charge."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Hyperadapted Raveners": [
  [
   "Alpha Invader",
   "Weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Hypersensory Array",
   "Once per battle round, you can target this unit with the Rapid Ingress/Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Leader",
   "This unit can be attached to the following units: Raveners"
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ]
 ],
 "Lictor": [
  [
   "Pheromone Trail",
   "Once per battle round, you can target one model with this ability with the Rapid Ingress Stratagem for 0CP."
  ],
  [
   "Feeder Tendrils",
   "Each time this model destroys an enemy Character model, you gain 1CP."
  ],
  [
   "Encircling Horrors",
   "NEUROLICTOR/LICTOR/VON RYAN’S LEAPERS unit only. In your opponent’s Movement phase, when an enemy unit ends a move within 8\" of this unit, this unit can make a normal move of up to D3+3\"."
  ],
  [
   "Cryptophotaic Camouflage",
   "VON RYAN’S LEAPERS unit only. This unit has -3\" detection range."
  ],
  [
   "Destabilising Predation",
   "NORN EMISSARY unit only. This unit’s ranged attacks have [ANTI-CHARACTER 2+]."
  ],
  [
   "Synaptoprescience",
   "NORN ASSIMILATOR unit only. This unit has 4+ InSv."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Mawloc": [
  [
   "Terror from the Deep",
   "Each time this unit is set up on the battlefield using the Deep Strike ability, roll one D6 for each enemy unit within 12\" of this model: on a 2-4, that unit suffers D3 mortal wounds; on a 5+, that unit suffers 3 mortal wounds and must take a Battle-shock test."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Neurolictor": [
  [
   "Feeder Tendrils",
   "Each time this model destroys an enemy CHARACTER model, you gain 1CP"
  ],
  [
   "Neural Disruption",
   "In your Command phase, select one enemy unit within 12\" of this model. That unit must take a Battle-shock test"
  ],
  [
   "Psychological Saboteur (Aura)",
   "While an enemy unit is with 12\" of this model, if that unit is Battle-shocked:\n\n- Each time a model in that unit makes an attack, subtract 1 from the Hit roll\n- Each time a friendly TYRANIDS model makes an attack that targets that unit, add 1 to the Wound roll."
  ],
  [
   "Encircling Horrors",
   "NEUROLICTOR/LICTOR/VON RYAN’S LEAPERS unit only. In your opponent’s Movement phase, when an enemy unit ends a move within 8\" of this unit, this unit can make a normal move of up to D3+3\"."
  ],
  [
   "Cryptophotaic Camouflage",
   "VON RYAN’S LEAPERS unit only. This unit has -3\" detection range."
  ],
  [
   "Destabilising Predation",
   "NORN EMISSARY unit only. This unit’s ranged attacks have [ANTI-CHARACTER 2+]."
  ],
  [
   "Synaptoprescience",
   "NORN ASSIMILATOR unit only. This unit has 4+ InSv."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Parasite of Mortrex": [
  [
   "Parasitic Infection",
   "Each time an Infantry model is destroyed by an attack made with this model’s barbed ovipositor, after this model has finished making its attacks, you can add one new Ripper Swarms unit to your army consisting of D3 models and set it up within 3\" of this model. If you do, that Ripper Swarms unit can be set up within Engagement Range of the destroyed model’s unit (but not within Engagement Range of any other enemy units)."
  ],
  [
   "It Itches!",
   "At the start of the Fight phase, select one enemy unit within Engagement Range of this model. That enemy unit must take a Battle-shock test."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ],
  [
   "Shadow in the Warp",
   "If your Army Faction is TYRANIDS, once per battle, in either player’s Command phase, if one or more units from your army with this ability are on the battlefield, you can unleash the Shadow in the Warp. When you do, each enemy unit on the battlefield must take a Battle-shock test. Each time an enemy unit takes such a Battle-shock test, if it is within 6\" of one or more SYNAPSE units from your army, subtract 1 from that test."
  ]
 ],
 "Raveners": [
  [
   "Death From Below",
   "At the end of your opponent’s turn, if this unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Trygon": [
  [
   "Subterranean Tunnels",
   "In your Movement phase, when this model is set up on the battlefield using the Deep Strike ability, it can use a subterranean tunnel. If it does, this model can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units, but until the end of the turn, it is not eligible to declare a charge."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Tyrannocyte": [
  [
   "Aerial Seeding",
   "This model must start the battle in Reserves, but neither it nor any units embarked within it are counted towards any limits placed on the maximum number of Reserves units you can start the battle with. This model can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules. Any units embarked within this model must immediately disembark after it has been set up on the battlefield, and they must be set up more than 8\" away from all enemy models. After this model has been set up on the battlefield, no units can embark within it."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Von Ryan's Leapers": [
  [
   "Pouncing Leap",
   "You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n▪ That use is -1 CP.\n▪ That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Encircling Horrors",
   "NEUROLICTOR/LICTOR/VON RYAN’S LEAPERS unit only. In your opponent’s Movement phase, when an enemy unit ends a move within 8\" of this unit, this unit can make a normal move of up to D3+3\"."
  ],
  [
   "Cryptophotaic Camouflage",
   "VON RYAN’S LEAPERS unit only. This unit has -3\" detection range."
  ],
  [
   "Destabilising Predation",
   "NORN EMISSARY unit only. This unit’s ranged attacks have [ANTI-CHARACTER 2+]."
  ],
  [
   "Synaptoprescience",
   "NORN ASSIMILATOR unit only. This unit has 4+ InSv."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "Ripper Swarms": [
  [
   "Chitinous Horrors (Aura)",
   "While an enemy unit is within Engagement Range of this unit, halve the Objective Control characteristic of models in that enemy unit."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ],
 "The Red Terror": [
  [
   "Swallow Whole",
   "Each time an attack with this model’s gaping maw targets an Infantry, Mounted or Beasts unit, each successful unmodified Wound roll is a Critical Wound. Each time an Infantry, Mounted or Beasts model is destroyed as a result of an attack made by this model’s gaping maw, this model regains up to D3+2 lost wounds."
  ],
  [
   "Subterranean Hunter",
   "At the end of the Fight phase, if this unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Synapse",
   "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Ambush Predators",1,"","Mindhunger","▪ Friendly DEATHLEAPER/LICTOR/NEUROLICTOR units have Deep Strike. ▪ Friendly LICTOR/NEUROLICTOR units’ attacks that target a CHARACTER unit can re-roll hit rolls of 1.","",0,"","Disruption"],
  ["Assimilation Swarm",2,"","Feed the Swarm","In your Command phase, each Harvester unit from your army can Regenerate one friendly TYRANIDS unit that is within 6\" of it. A unit can only be regenerated once per phase. Each time a unit regenerates, do one of the following: ▪ One model in that unit regains up to D3+1 lost wounds. ▪ One destroyed Infantry model (excluding Characters) is returned to that unit with its full wounds remaining. If that unit is an Endless Multitude unit, up to 3 destroyed models are returned instead.","",0,"","Priority Assets"],
  ["Crusher Stampede",2,"","Enraged Behemoths","Each time a Tyranids Monster model from your army makes an attack, add 1 to the Hit roll if that model’s unit is below its Starting Strength, and add 1 to the Wound roll as well if that model’s unit is Below Half-strength. In addition, while a TYRANIDS MONSTER unit from your army (excluding Battle-shocked units) is at its Starting Strength, add 2 to the Objective Control characteristic of models in that unit.","",0,"","Purge the Foe"],
  ["Invasion Fleet",3,"","Hyper-adaptations","At the start of the first battle round, select one of the following Hyper-adaptations to be active for TYRANIDS units from your army until the end of the battle: Swarming Instincts Each time a TYRANIDS model with this Hyper-adaptation makes an attack that targets an INFANTRY or SWARM unit, that attack has the [SUSTAINED HITS 1] ability. Hyper-aggression Each time a TYRANIDS model with this Hyper-adaptation makes an attack that targets a MONSTER or VEHICLE unit, that attack has the [LETHAL HITS] ability. Hive Predators Each time a TYRANIDS model with this Hyper-adaptation makes an attack that targets a CHARACTER unit, on a Critical Hit, that attack has the [PRECISION] ability.","",0,"","Take and Hold"],
  ["Subterranean Assault",3,"","Surprise Assault","Each time a Tyranids model from your army makes an attack, re-roll a Hit roll of 1. Each time a Burrower unit from your army is set up on the battlefield from Reserves, place a circular 40mm Tunnel Marker anywhere on the battlefield within 1\" of that unit and more than 3\" horizontally away from all enemy units. In the Reinforcements step of your Movement phase, when you set up a unit on the battlefield from Reserves, you can set that unit up wholly within 9\" of one of your Tunnel Markers and more than 6\" horizontally away from any enemy units. If an enemy model (excluding AIRCRAFT) ends any kind of move within 3\" of one of your Tunnel Markers, that Tunnel Marker is removed from the battlefield. KEYWORDS Mawloc and Trygon units from your army have the BURROWER keyword. In the Muster Armies step, you can select up to 2 TRYGON models from your army. The selected units gain the CHARACTER keyword. Designer’s Note: This means that the selected models can be given Enhancements and one of them can be selected as your WARLORD.","",0,"","Disruption"],
  ["Synaptic Nexus",2,"","Synaptic Imperatives","At the start of the battle round, you can select one of the Synaptic Imperatives shown below. Until the end of the battle round, that Synaptic Imperative is active for your army and while a TYRANIDS unit from your army is within Synapse Range of your army, it will benefit from it. Each Synaptic Imperative can only be selected once per battle. ▪ Synaptic Augmentation: While this unit is within Synapse Range of your army, models in this unit have a 5+ invulnerable save. ▪ Surging Vitality: While this unit is within Synapse Range of your army, add 1 to Advance and Charge rolls made for this unit. ▪ Goaded to Slaughter: While this unit is within Synapse Range of your army, each time a model in this unit makes a melee attack, add 1 to the Hit roll.","",0,"","Disruption"],
  ["Talons of the Norn Queen",1,"","Higher Imperatives","Friendly NORN EMISSARY/NORN ASSIMILATOR units have the following ability: Protean Purpose: (Once per battle, per unit) In your Command phase, you can use this ability. If you do, this unit can make a selection for its Singular Purpose ability (this replaces the previous selection).","",0,"","Take and Hold"],
  ["Unending Swarm",2,"","Insurmountable Odds","In your opponent’s Shooting phase, when an enemy unit has shot, if a model from a friendly ENDLESS MULTITUDE unit was destroyed as a result of those attacks, that friendly unit can make a surge move of up to D6\".","",0,"","Take and Hold"],
  ["Vanguard Onslaught",2,"","Questing Tendrils","TYRANIDS units with this ability are eligible to charge in a turn in which they Fell Back. Vanguard Invader units with this ability are eligible to charge in a turn in which they Advanced.","",0,"","Reconnaissance"],
  ["Warrior Bioform Onslaught",1,"","Leader-beasts","▪ Friendly TYRANID WARRIORS WITH RANGED BIO-WEAPONS/TYRANID WARRIORS WITH MELEE BIO-WEAPONS units have: ▪ TYRANID WARRIORS. ▪ BATTLELINE. ▪ TYRANID WARRIORS/TYRANID PRIME WITH LASH WHIP/WINGED TYRANID PRIME models from your army have 5+ InSv.","",0,"","Take and Hold"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Cryptophotaic Camouflage (Upgrade)",15,"Ambush Predators","VON RYAN’S LEAPERS unit only. This unit has -3\" detection range.",null],
  ["Encircling Horrors (Upgrade)",20,"Ambush Predators","NEUROLICTOR/LICTOR/VON RYAN’S LEAPERS unit only. In your opponent’s Movement phase, when an enemy unit ends a move within 8\" of this unit, this unit can make a normal move of up to D3+3\".",null],
  ["Biophagic Flow",10,"Assimilation Swarm","",null],
  ["Instinctive Defence",15,"Assimilation Swarm","TYRANIDS model only. While the bearer is within 6\" of one or more friendly HARVESTER units, when you target this unit with the Heroic Intervention stratagem, that use is -1 CP. In addition, while the bearer is within 6\" of one or more friendly HARVESTER units, models in the bearer’s unit have the Fights First ability.",null],
  ["Parasitic Biomorphology",25,"Assimilation Swarm","Tyranids model only. Add 1 to the Strength characteristic of melee weapons equipped by models in the bearer's unit. The first time the bearer's unit destroys an enemy unit in the Fight phase while the bearer is within 6\" of one or more Harvester units, until the end of battle, add 1 to the Attacks characteristic of melee weapons equipped by models in the bearer's unit.",null],
  ["Regenerating Monstrosity",20,"Assimilation Swarm","Tyranids model only (excluding Monsters models) The bearer's unit can be regenerated up to twice per phase, instead of once.",null],
  ["Enraged Reserves",20,"Crusher Stampede","Tyranids Monster only. If the bearer is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 3+, do not remove it from play. It can fight after the attacking model's unit has finished making its attacks, and is then removed from play.",null],
  ["Monstrous Nemesis",25,"Crusher Stampede","Tyranids Monster only. Each time the bearer makes a melee attack that targets a Monster or Vehicle unit, add 1 to the Wound roll.",null],
  ["Null Nodules",10,"Crusher Stampede","Tyranids Monster only. Once per battle, when a Psychic Attack is allocated to the bearer, it can use this ability. If it does, until the end of the phase, the bearer has the Feel No Pain 5+ ability against Psychic Attacks.",null],
  ["Ominous Presence",15,"Crusher Stampede","Tyranids Monster only. Add 3 to the bearer's Objective Control characteristic.",null],
  ["Adaptive Biology",25,"Invasion Fleet","Tyranids model only. The bearer has the Feel No Pain 5+ ability. At the start of any turn, if the bearer has fewer than its starting number of wounds remaining, until the end of the battle, it has the Feel No Pain 4+ ability instead.",null],
  ["Alien Cunning",30,"Invasion Fleet","Tyranids model only. After both players have deployed their armies, select up to three Tyranids units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",null],
  ["Perfectly Adapted",15,"Invasion Fleet","Tyranids model only. Once per turn, you can re-roll one Hit roll, one Wound roll, one Damage roll, one Advance roll, one Charge roll or one saving throw made for the bearer",null],
  ["Synaptic Linchpin",20,"Invasion Fleet","Tyranids model only. While a friendly Tyranids unit is within 9\" of the bearer, that unit is within Synapse Range of your army.",null],
  ["Synaptic Strategy",15,"Subterranean Assault","Tyranids model only. Once per battle, you can target the bearer’s unit with the Rapid Ingress stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this phase.",null],
  ["Tremor Senses",20,"Subterranean Assault","Tyranids model only. After both players have deployed their armies, select up to three friendly Tyranids units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves, regardless of how many units are already in Strategic Reserves.",null],
  ["Trygon Prime",20,"Subterranean Assault","Trygon model only. The bearer gains the Synapse keyword. Improve the Strength and Weapon Skill characteristics of melee weapons equipped by the bearer by 1.",null],
  ["Vanguard Intellect",15,"Subterranean Assault","Tyranids model with the Deep Strike ability only. The bearer’s unit can be set up using the Deep Strike ability in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules.",null],
  ["Power of the Hive Mind",10,"Synaptic Nexus","Tyranids Psyker model only. Improve the Strength and Armour Penetration characteristic of psychic weapons equipped by the wearer of 1.",null],
  ["Psychostatic Disruption (Aura)",30,"Synaptic Nexus","Tyranids Synapse model only. Enemy units that arrive on the battlefield from Reserves cannot be set up with 12\" of the bearer. In addition, once per battle, during the first or second battle round, when your opponent declares that a unit will arrive on the battlefield from Strategic Reserves, the bearer can use this enhancement. If it does, roll one D6: on a 4+, that enemy cannot arrive on the battlefield this turn.",null],
  ["Synaptic Control",20,"Synaptic Nexus","Tyranids Synapse model only. Each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of the attack.",null],
  ["The Dirgeheart of Kharis",15,"Synaptic Nexus","Tyranids Synapse model only. While an enemy unit is within 9\" of the bearer, worsen that unit's Leadership characteristic by 1.",null],
  ["Destabilising Predation (Upgrade)",20,"Talons of the Norn Queen","NORN EMISSARY unit only. This unit’s ranged attacks have [ANTI-CHARACTER 2+].",null],
  ["Synaptoprescience (Upgrade)",30,"Talons of the Norn Queen","NORN ASSIMILATOR unit only. This unit has 4+ InSv.",null],
  ["Adrenalised Onslaught",15,"Unending Swarm","Tyranids model only. Each time the bearer's unit makes a Pile In or Consolidation, models in this unit can move an additional 3\"",null],
  ["Naturalised Camouflage",30,"Unending Swarm","TYRANIDS model only. At the start of the first battle round, select up to three friendly Endless Multitude units within 9\" of the bearer. Until the end of the battle round, each time a ranged attack targets one of those units, models in that unit have the Benefit of Cover against that attack.",null],
  ["Piercing Talons",25,"Unending Swarm","Tyranids model only. Each time a model in the Bearer's unit makes an attack, on a Critical Wound, improve the Armour Penetration characteristic of that attack by 1.",null],
  ["Relentless Hunger",20,"Unending Swarm","Tyranids model only. Add 2\" to the Move characteristic of models in the bearer's unit.",null],
  ["Chameleonic",15,"Vanguard Onslaught","VANGUARD INVADER model only. This unit has Stealth.",null],
  ["Hunting Grounds",30,"Vanguard Onslaught","Tyranids model only. While the bearer is on the battlefield, each time your opponent sets up a Reserves unit on the battlefield, roll one D6: on a 2+ that unit must make a Battle-shock test.",null],
  ["Neuronode",20,"Vanguard Onslaught","TYRANIDS model only. After both players have deployed their armies, you can select up to three VANGUARD INVADER units from your army and redeploy all of those units. When doing so, any of those units can be placed into Strategic Reserves, regardless of how many units are already in Strategic Reserves.",null],
  ["Stalker",10,"Vanguard Onslaught","Vanguard Invader model only. At the start of the battle, select one enemy unit. Each time the bearer makes an attack that targets that enemy unit, add 1 to the Hit roll and Wound roll.",null],
  ["Elevated Might",30,"Warrior Bioform Onslaught","WINGED TYRANID PRIME/TYRANID PRIME WITH LASH WHIP model only. This model’s melee attacks:\n- Can re-roll wound rolls.\n- Have +1 AP.",null],
  ["Ocular Adaptation",20,"Warrior Bioform Onslaught","WINGED TYRANID PRIME/TYRANID PRIME WITH LASH WHIP model only. This unit’s melee attacks have +1 to hit rolls.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Counterpredation","Ambush Predators","",1,"Fight phase, when a friendly DEATHLEAPER/LICTOR/ NEUROLICTOR/VON RYAN’S LEAPERS unit is selected to fight.","That DEATHLEAPER/LICTOR/NEUROLICTOR/VON RYAN’S LEAPERS unit.","Your unit’s attacks that target a hidden unit have +1 S and AP.",""],
  ["Hypersensory Adaptations","Ambush Predators","",1,"Start of your Shooting phase.","One friendly DEATHLEAPER/LICTOR/NEUROLICTOR/VON RYAN’S LEAPERS unit.","Select one visible enemy unit within 12\" of your unit. That enemy unit has +6\" detection range.",""],
  ["Scanner Gheist","Ambush Predators","",1,"End of your opponent’s Fight phase.","One friendly unengaged DEATHLEAPER/LICTOR/ NEUROLICTOR unit.","Place your unit in strategic reserves.",""],
  ["Ablative Carapace","Assimilation Swarm","Fait Épique",2,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Harvester unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 5+ ability. If your unit is within range of an objective marker you control, until the end of the phase models in your unit have the Feel No Pain 4+ ability instead.",""],
  ["Broodguard Impulse","Assimilation Swarm","Fait Épique",1,"Any phase.","One Harvester unit from your army that was just destroyed. You can use this Stratagem on that unit even though it was just destroyed.","Until the end of the battle, each time a friendly TYRANIDS model makes an attack that targets the enemy unit that just destroyed your HARVESTER unit, add 1 to the Wound roll.",""],
  ["Rapacious Hunger","Assimilation Swarm","Tactique de Bataille",1,"Your Fight phase.","One TYRANIDS unit from your army that just destroyed an enemy unit.","Your unit immediately Regenerates (See Feed the Swarm). When doing so, if your unit is a Harvester unit and you choose for one model to regain up to D3 lost wounds, that model regains up to 3 lost wounds instead.",""],
  ["Reclaim Biomass","Assimilation Swarm","Ruse Stratégique",1,"Any phase, when a TYRANIDS unit from your army is destroyed, before the last model in it is removed from play.","One Harvester unit from your army that is within 6\" of that destroyed unit.","Regenerate one friendly TYRANIDS unit within 6\" of your HARVESTER unit (See Feed the Swarm).",""],
  ["Secure Biomass","Assimilation Swarm","Ruse Stratégique",1,"Fight phase.","One TYRANIDS unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [LETHAL HITS] ability. If your unit is a Harvester unit, each time a model in that unit makes a melee attack, a successful unmodified Hit roll of 5+ scores a Critical Hit as well.",""],
  ["Tyrannoformed","Assimilation Swarm","Ruse Stratégique",1,"Command phase.","One Harvester unit from your army that is within range of an objective marker you control.","That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Corrosive Viscera","Crusher Stampede","Ruse Stratégique",1,"Your opponent’s Shooting phase or the Fight phase, just after a Tyranids Monster model from your army with the Deadly Demise ability that cannot FLY is destroyed.","That TYRANIDS MONSTER model. You can use this Stratagem on that model even though it was just destroyed.","Do not roll one D6 to determine whether mortal wounds are inflicted by your model’s Deadly Demise ability. Instead, mortal wounds are automatically inflicted.",""],
  ["Massive Impact","Crusher Stampede","Fait Épique",1,"Your Charge phase, just after a Tyranids Monster model from your army ends a Charge move.","That TYRANIDS MONSTER model.","Select one enemy unit within Engagement Range of your model and roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",""],
  ["Rampaging Monstrosities","Crusher Stampede","Tactique de Bataille",1,"Fight phase.","One Tyranids Monster unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, you can re-roll the Hit roll.",""],
  ["Savage Roar","Crusher Stampede","Tactique de Bataille",1,"Fight phase, just after an enemy unit has selected its targets.","One Tyranids Monster unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","That enemy unit must take a Battle-shock test and, until the end of the phase, each time a model in that enemy unit makes an attack that targets your unit, subtract 1 from the Hit roll. If that Battle-shock test was failed, subtract 1 from the Wound roll as well.",""],
  ["Swarm-Guided Salvoes","Crusher Stampede","Tactique de Bataille",1,"Your Shooting phase.","One Tyranids Monster unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability, and until the end of the phase each time a model in your unit makes an attack, you can ignore any or all modifiers to that model’s Ballistic Skill characteristic and any or all modifiers to the Hit roll.",""],
  ["Untrammelled Ferocity","Crusher Stampede","Ruse Stratégique",1,"Your Movement phase.","One Tyranids Monster unit from your army that has not been selected to move this phase.","Until the end of the phase, each time a model in your unit makes a Normal, Advance or Fall Back move, it can move through models (excluding TITANIC models) and sections of terrain features that are 4\" or less in height. When doing so: ▪ It can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them. ▪ It can also move through sections of terrain features that are more than 4\" in height, but if it does, after its unit has moved, roll one D6: on a 1, your unit is Battle-shocked.",""],
  ["Adrenal Surge","Invasion Fleet","Tactique de Bataille",2,"Fight phase.","Up to two TYRANIDS units from your army that are within Synapse Range of your army and are eligible to fight, or one other TYRANIDS unit from your army that is eligible to fight.","Until the end of the phase, each time a model in any of those selected units makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Death Frenzy","Invasion Fleet","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One TYRANIDS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6: on a 4+, do not remove it from play. The destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play.",""],
  ["Endless Swarm","Invasion Fleet","Ruse Stratégique",1,"Your Command phase.","Up to two Endless Multitude units from your army that are within Synapse Range of your army, or one other ENDLESS MULTITUDE unit from your army.","You can return up to D3+3 destroyed models to each of the selected units.",""],
  ["Overrun","Invasion Fleet","Ruse Stratégique",1,"Fight phase, just before a TYRANIDS unit from your army Consolidates.","That TYRANIDS unit.","Until the end of the phase, each time your unit Consolidates, models in it can move an additional 3\" as long as your unit can end that move within Engagement Range of one or more enemy units. If your unit is within Synapse Range of your army and not within Engagement Range of any enemy units, instead of making that Consolidation move, it can make a Normal move of up to 6\".",""],
  ["Predatory Imperative","Invasion Fleet","Ruse Stratégique",1,"Your Command phase.","Up to two TYRANIDS units from your army that are within Synapse Range of your army, or one other TYRANIDS unit from your army.","Select one Hyper-adaptation. Until the start of your next Command phase, that Hyper-adaptation is active for those selected units in addition to any other that may be active for your army.","You cannot select the same Hyper-adaptation you selected at the start of the first battle round."],
  ["Rapid Regeneration","Invasion Fleet","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One TYRANIDS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 6+ ability. If your unit is within Synapse Range of your army, models in your unit have the Feel No Pain 5+ ability instead.",""],
  ["Adaptive Optimisation","Subterranean Assault","Équipement",1,"Command phase.","One Mawloc or Trygon unit from your army.","Until the start of your next Command phase, your unit has the Synapse keyword.",""],
  ["Enfilading Emergence","Subterranean Assault","Ruse Stratégique",1,"End of your Movement phase.","One Tyranids unit from your army that was set up as Reinforcements this turn.","Until the end of your next Fight phase, weapons equipped by models in your unit have the [SUSTAINED HITS 1] and [IGNORES COVER] abilities.",""],
  ["Replenishing Swarms","Subterranean Assault","Équipement",1,"Your Movement phase.","One Tyranids unit from your army, wholly within 9\" of one or more Tunnel Markers you placed.","One model in your unit regains up to D3+1 lost wounds, or you can return up to D3+1 destroyed models with a Wounds characteristic of 1 to your unit, with their full wounds remaining, instead.",""],
  ["Retreat Below","Subterranean Assault","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Tyranids unit or up to two Burrower units from your army that are not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Swarming Assault","Subterranean Assault","Ruse Stratégique",1,"Your Charge phase.","One Tyranids Monster unit from your army that was set up as Reinforcements this turn.","Until the end of the phase, friendly Tyranids units within 6\" of your unit can re-roll Charge rolls.",""],
  ["Tunnel Network","Subterranean Assault","Ruse Stratégique",1,"End of your Movement phase.","One Tyranids unit from your army that is wholly within 9\" of one or more of your Tunnel Markers and not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and set it up again, wholly within 9\" of another Tunnel Marker you placed, and more than 6\" horizontally away from all enemy units.",""],
  ["Imperative Dominance","Synaptic Nexus","Ruse Stratégique",1,"Your Command phase.","One TYRANIDS unit from your army that is within Synapse Range of your army.","Select one Synaptic Imperative, even if you have already selected that imperative this battle. Until the start of your next Command phase, that Synaptic Imperative is active for your unit instead of any other Synaptic Imperative that is active for your army.",""],
  ["Irresistible Will","Synaptic Nexus","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Synapse unit from your army that has not been selected to shoot or fight this phase, and one enemy unit within 24\" of and visible to the SYNAPSE unit.","Until the end of the phase, each time a friendly TYRANIDS model makes an attack that targets that enemy unit, if the attacking model’s unit is within 6\" of your SYNAPSE unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",""],
  ["Override Instincts","Synaptic Nexus","Ruse Stratégique",1,"Your Movement phase.","One TYRANIDS unit from your army that is within Synapse Range of your army and made a Fall Back move this phase.","Your unit is eligible to shoot and declare a charge this turn.",""],
  ["Reinforced Hive Node","Synaptic Nexus","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Synapse unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Synaptic Channelling","Synaptic Nexus","Tactique de Bataille",1,"Command phase.","One Synapse unit from your army.","Until the end of the turn, while a friendly TYRANIDS unit is within 9\" of the selected unit, that unit is within Synapse Range of your army.",""],
  ["The Smothering Shadow","Synaptic Nexus","Ruse Stratégique",1,"Any phase, just after an enemy unit fails a Battle-shock test.","One Synapse unit from your army within 12\" of that enemy unit.","Roll six D6: for each 3+, that enemy unit suffers 1 mortal wound.",""],
  ["Catalytic Biofortification","Talons of the Norn Queen","",1,"Any phase, when a friendly NORN ASSIMILATOR unit suffers a mortal wound.","That NORN ASSIMILATOR unit.","Your unit has Feel No Pain 4+ against mortal wounds.",""],
  ["Lesser Prey","Talons of the Norn Queen","",1,"Fight phase, when a friendly NORN ASSIMILATOR/NORN EMISSARY unit is selected to fight.","That NORN ASSIMILATOR/NORN EMISSARY unit.","Your unit’s melee attacks have +2 S.",""],
  ["Tanglestrike Rounds","Talons of the Norn Queen","",1,"Your Shooting phase, when a friendly NORN ASSIMILATOR unit has shot.","That NORN ASSIMILATOR unit.","Select one enemy unit hit by those attacks. That enemy unit is tethered until the start of your next Command phase: ▪ While a unit is tethered, that unit has -2\" M.",""],
  ["Bounding Advance","Unending Swarm","Tactique de Bataille",1,"Your Movement phase.","One Endless Multitude unit from your army.","Until the end of the phase, each time your unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 6\" to the Move characteristic of models in your unit.",""],
  ["Preservation Imperative","Unending Swarm","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Endless Multitude unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit is treated as containing fewer than five models for the purpose of the [BLAST] ability.",""],
  ["Swarming Masses","Unending Swarm","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Endless Multitude unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability, and If your unit contains 15 or more models, each time a model in your unit makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Synaptic Goading","Unending Swarm","Ruse Stratégique",1,"Any phase, just before an Endless Multitude unit from your army that is within Synapse Range of your army makes a surge move.","That ENDLESS MULTITUDE unit.","When making that surge move, you can re-roll the D6 to determine how far your unit moves, and your unit can end that move as close as possible to the closest objective marker (instead of as close as possible to the closest enemy unit]. All other rules for making surge moves still apply.",""],
  ["Teeming Masses","Unending Swarm","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Endless Multitude unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Unending Waves","Unending Swarm","Ruse Stratégique",2,"Any phase.","One Endless Multitude unit from your army that was just destroyed. You can use this Stratagem on that unit even though it was just destroyed.","Add a new unit to your army identical to your destroyed unit, in Strategic Reserves, at its Starting Strength.","Any destroyed Character units that were attached to your unit are not returned. You can only use this Stratagem once per battle."],
  ["Assassin Beasts","Vanguard Onslaught","Tactique de Bataille",1,"Fight phase.","One Vanguard Invader Infantry unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [PRECISION] ability.",""],
  ["Hypersensory Scillia","Vanguard Onslaught","Ruse Stratégique",2,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","Up to two Vanguard Invader units from your army that are within 8\" of that enemy unit, or one other Tyranids Infantry unit from your army that is within 8\" of that enemy unit.","Those selected units can each make a Normal move of up to 6\".","You cannot target units that are within Engagement Range of one or more enemy units."],
  ["Invisible Hunter","Vanguard Onslaught","Ruse Stratégique",1,"End of your opponent’s Fight phase.","Up to two Vanguard Invader units from your army, or one Tyranids Infantry unit from your army.","Remove the targeted units from the battlefield and place them into Strategic Reserves.","The targeted units must be more than 3\" away from all enemy units."],
  ["Seeded Broods","Vanguard Onslaught","Ruse Stratégique",1,"Your Movement phase.","One TYRANIDS unit from your army that is in Reserves, or up to two Vanguard Invader units from your army that are in Reserves.","Until the end of the phase, for the purposes of setting up those selected units on the battlefield, treat the current battle round number as being one higher than it actually is.",""],
  ["Surprise Assault","Vanguard Onslaught","Tactique de Bataille",1,"Your Shooting phase or the Fight phase, just after a Vanguard Invader unit from your army has selected its targets.","That VANGUARD INVADER unit.","Select one enemy unit that was selected as the target of one or more of your unit’s attacks. That enemy unit must take a Battle-shock test. Until the end of the phase, each time a model in your unit makes an attack that targets that enemy unit, add 1 to the Hit roll. If the Battle-shock test was failed, add 1 to the Wound roll as well.",""],
  ["Unseen Lurkers","Vanguard Onslaught","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Vanguard Invader unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit can only be selected as the target of a ranged attack if the attacking model is within 18\" or, if your unit has the Lone Operative ability, if the attacking model is within 6\". Your opponent can select new targets for the attacking unit’s attacks.",""],
  ["Alien Physiology","Warrior Bioform Onslaught","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly TYRANID WARRIORS unit.","That TYRANID WARRIORS unit.","Attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Parasitic Payload","Warrior Bioform Onslaught","",1,"Your Shooting phase, when a friendly TYRANID WARRIORS unit is selected to shoot.","That TYRANID WARRIORS unit.","Your unit’s ranged attacks have [IGNORE COVER].",""],
  ["Synaptic Micronodes","Warrior Bioform Onslaught","",1,"End of your Movement phase.","One friendly TYRANID WARRIORS unit.","Select one objective your unit is controlling. That objective is secured.",""],
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
 "vehicle": [],
 "monster": [
  "Barbed Hierodule",
  "Carnifexes",
  "Dimachaeron",
  "Exocrine",
  "Harpy",
  "Harridan",
  "Haruspex",
  "Hierophant",
  "Hive Crone",
  "Hive Tyrant",
  "Maleceptor",
  "Mawloc",
  "Neurotyrant",
  "Norn Assimilator",
  "Norn Emissary",
  "Psychophage",
  "Screamer-killer",
  "Scythed Hierodule",
  "Sporocyst",
  "Tervigon",
  "Toxicrene",
  "Trygon",
  "Tyrannocyte",
  "Tyrannofex",
  "Winged Hive Tyrant"
 ],
 "battleline": [
  "Gargoyles",
  "Hormagaunts",
  "Termagants"
 ],
 "epic": [
  "Deathleaper",
  "Old One Eye",
  "The Red Terror",
  "The Swarmlord"
 ],
 "infantry": [
  "Barbgaunts",
  "Biovores",
  "Genestealers",
  "Hive Guard",
  "Lictor",
  "Neurogaunts",
  "Neurolictor",
  "Pyrovores",
  "Raveners",
  "Tyranid Warriors with Melee Bio-Weapons",
  "Tyranid Warriors with Ranged Bio-Weapons",
  "Tyrant Guard",
  "Venomthropes",
  "Von Ryan's Leapers",
  "Zoanthropes"
 ],
 "character": [
  "Broodlord",
  "Hyperadapted Raveners",
  "Malanthrope",
  "Parasite of Mortrex",
  "Tyranid Prime with Lash Whip",
  "Winged Tyranid Prime"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Tervigon": "120x92",
 "The Swarmlord": "60",
 "Broodlord": "75x42",
 "Old One Eye": "105x70",
 "Tyranid Warriors with Ranged Bio-Weapons": "50",
 "Tyranid Warriors with Melee Bio-Weapons": "50",
 "Termagants": "28.5",
 "Hormagaunts": "28.5",
 "Toxicrene": "120x92",
 "Tyrant Guard": "50",
 "Neurotyrant": "50",
 "Maleceptor": "120x92",
 "Pyrovores": "80",
 "Haruspex": "120x92",
 "Venomthropes": "40",
 "Neurogaunts": "25",
 "Zoanthropes": "40",
 "Mucolid Spores": "40",
 "Spore Mines": "25",
 "Exocrine": "120x92",
 "Biovores": "80",
 "Carnifexes": "105x70",
 "Screamer-killer": "90",
 "Hive Guard": "50",
 "Tyrannofex": "120x92",
 "Hive Crone": "120x92",
 "Harpy": "120x92",
 "Sporocyst": "coque",
 "Psychophage": "120x92",
 "Barbgaunts": "40",
 "Harridan": "coque",
 "Hierophant": "coque",
 "Genestealers": "32",
 "Norn Assimilator": "100",
 "Norn Emissary": "100",
 "Hive Tyrant": "60",
 "Tyranid Prime with Lash Whip": "50",
 "Winged Hive Tyrant": "60",
 "Winged Tyranid Prime": "50",
 "Deathleaper": "60",
 "Gargoyles": "60x35.5",
 "Hyperadapted Raveners": "40",
 "Lictor": "50",
 "Mawloc": "120x92",
 "Neurolictor": "50",
 "Parasite of Mortrex": "40",
 "Raveners": "40",
 "Trygon": "120x92",
 "Tyrannocyte": "100",
 "Von Ryan's Leapers": "40",
 "Ripper Swarms": "40",
 "The Red Terror": "100"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Tervigon": 5,
 "Toxicrene": 5,
 "Maleceptor": 5,
 "Haruspex": 5,
 "Exocrine": 5,
 "Tyrannofex": 5,
 "Hive Crone": 4,
 "Harpy": 4,
 "Barbed Hierodule": 6,
 "Scythed Hierodule": 6,
 "Harridan": 10,
 "Hierophant": 10,
 "Dimachaeron": 5,
 "Norn Assimilator": 5,
 "Norn Emissary": 5,
 "Mawloc": 5,
 "Trygon": 5
};

const TRANSPORTS = {
 "Harridan": "This model has a transport capacity of 20 GARGOYLES models and 1 WINGED TYRANID PRIME model.",
 "Hierophant": "This model has a transport capacity of 20 TYRANIDS INFANTRY models. Each model with a Wounds characteristic of more than 1 takes up the space of 3 models. This model cannot transport models that can FLY.",
 "Tyrannocyte": "This model has a transport capacity of 20 TYRANIDS INFANTRY models, or 1 TYRANIDS MONSTER model with a Wounds characteristic of 12 or less. Each INFANTRY model with a Wounds characteristic of more than 1 takes up the space of 3 models."
};
const FACTION = [
 [
  "Synapse",
  "If your Army Faction is TYRANIDS, while a TYRANIDS unit from your army is within 6\" of one or more friendly SYNAPSE models, that TYRANIDS unit is said to be within Synapse Range of that model and of your army. While a TYRANIDS unit from your army is within Synapse Range of your army:\n▪ Each time that unit takes a Battle-shock test, take that test on 3D6 instead of 2D6.\n▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/tyranides.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_UNITE = {
 "Genestealers": [
  {
   "champ": "rrH",
   "val": "ones",
   "nom": "Prédateur d'Avant-garde",
   "texte": "Each time a model in this unit makes an attack, re-roll a Hit roll of 1."
  }
 ],
 "Hyperadapted Raveners": [
  {
   "mot": "sust:1",
   "nom": "Envahisseur Alpha",
   "texte": "Weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability."
  }
 ],
 "Tyranid Prime with Lash Whip": [
  {
   "mot": "sust:1",
   "nom": "Guerrier Alpha",
   "texte": "Weapons equipped by models in this model’s unit have the [SUSTAINED HITS 1] ability."
  }
 ]
};
const APTIS_COND = {
 "Genestealers": [
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Prédateur d'Avant-garde — sur objectif",
   "quand": "La cible est à portée d'un pion d'objectif",
   "texte": "If the target is within range of one or more objective markers, re-roll a Wound roll 1 as well."
  }
 ],
 "Psychophage": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Frénésie Vorace",
   "quand": "La cible est sous son Effectif de Départ",
   "texte": "Each time this model makes a melee attack that targets a unit that is below its Starting Strength, add 1 to the Hit roll."
  },
  {
   "champ": "wndMod",
   "val": 1,
   "port": "C",
   "nom": "Frénésie Vorace — sous la moitié",
   "quand": "La cible est sous la moitié de son effectif",
   "texte": "If that target is also Below Half strength, add 1 to the Wound roll as well."
  }
 ],
 "Hierophant": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Bête Apex",
   "quand": "La cible est sous le choc",
   "texte": "Each time this model makes an attack that targets a unit that is Battle-shocked, add 1 to the Hit roll."
  }
 ],
 "Malanthrope": [
  {
   "mot": "sust:1",
   "port": "C",
   "nom": "Adaptation à la Proie — Touches Soutenues",
   "quand": "Tu choisis [TOUCHES SOUTENUES 1] ce combat",
   "texte": "Each time this model's unit is selected to fight, select one of the following abilities to apply to all melee weapons equipped by models in that unit until the end of the phase: - [SUSTAINED HITS 1] - [LANCE] - [LETHAL HITS]"
  },
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Adaptation à la Proie — Touches Fatales",
   "quand": "Tu choisis [TOUCHES FATALES] ce combat",
   "texte": "Each time this model's unit is selected to fight, select one of the following abilities to apply to all melee weapons equipped by models in that unit until the end of the phase: - [SUSTAINED HITS 1] - [LANCE] - [LETHAL HITS]"
  }
 ],
 "Norn Assimilator": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Dessein Unique",
   "quand": "La cible est l'unité désignée au premier round",
   "texte": "Select one enemy unit. Until the end of the battle, each time this model makes an attack that targets that unit you can re-roll the Hit roll and you can re-roll the Wound roll"
  },
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Dessein Unique",
   "quand": "La cible est l'unité désignée au premier round",
   "texte": "Select one enemy unit. Until the end of the battle, each time this model makes an attack that targets that unit you can re-roll the Hit roll and you can re-roll the Wound roll"
  }
 ],
 "Norn Emissary": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Dessein Unique",
   "quand": "La cible est l'unité désignée au premier round",
   "texte": "Select one enemy unit. Until the end of the battle, each time this model makes an attack that targets that unit you can re-roll the Hit roll and you can re-roll the Wound roll"
  },
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Dessein Unique",
   "quand": "La cible est l'unité désignée au premier round",
   "texte": "Select one enemy unit. Until the end of the battle, each time this model makes an attack that targets that unit you can re-roll the Hit roll and you can re-roll the Wound roll"
  }
 ],
 "The Red Terror": [
  {
   "arme": "Gaping maw",
   "champ": "critW",
   "val": "tous",
   "port": "C",
   "nom": "Avaler Tout Rond",
   "quand": "La cible est INFANTERIE, MONTÉE ou BÊTE — gueule béante seulement",
   "texte": "Each time an attack with this model’s gaping maw targets an Infantry, Mounted or Beasts unit, each successful unmodified Wound roll is a Critical Wound."
  }
 ]
};
const APTIS_CIBLE = {
 "Hive Crone": [
  {
   "vs": [
    "vol"
   ],
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Prédateur Aérien",
   "texte": "Each time this model makes a ranged attack that targets a unit that can FLY, add 1 to the Hit roll."
  }
 ]
};
const AURAS_PERSO = {
 "Broodlord": [
  {
   "mot": "dev",
   "nom": "Perspicacité Vicieuse",
   "texte": "While this model is leading a unit, weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  }
 ],
 "Old One Eye": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Chef Alpha",
   "texte": "While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Hit roll."
  }
 ],
 "Neurotyrant": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Fouet Nodal",
   "texte": "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll."
  }
 ],
 "Tyranid Prime with Lash Whip": [
  {
   "mot": "sust:1",
   "nom": "Guerrier Alpha",
   "texte": "Weapons equipped by models in this model’s unit have the [SUSTAINED HITS 1] ability."
  }
 ],
 "Winged Tyranid Prime": [
  {
   "mot": "sust:1",
   "nom": "Guerrier Alpha",
   "texte": "While this model is leading a unit, weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "kw": [],
  "champ": "strMod",
  "val": 1,
  "port": "C",
  "nom": "Synapse",
  "quand": "L'unité est à portée de Synapse (6\" d'une figurine SYNAPSE amie)",
  "texte": "While a TYRANIDS unit from your army is within Synapse Range of your army: ▪ Each time a model in that unit makes a melee attack, add 1 to the Strength characteristic of that attack."
 },
 {
  "source": "Tervigon",
  "kw": [
   "Termagants"
  ],
  "mot": "lethal",
  "port": "T",
  "nom": "Progénitrice de Couvée (Aura, Psychique)",
  "quand": "Les Termagants sont à 6\" du Tervigon",
  "texte": "While a friendly TERMAGANTS unit is within 6\" of this model, ranged weapons equipped by models in that unit have the [LETHAL HITS] ability."
 },
 {
  "source": "Hive Tyrant",
  "kw": [],
  "mot": "lethal",
  "port": "T",
  "nom": "Assaut (Aura, Psychique)",
  "quand": "L'unité est à 6\" du Tyran des Ruches",
  "texte": "While a friendly TYRANIDS unit is within 6\" of this model, ranged weapons equipped by models in that unit have the [ASSAULT] and [LETHAL HITS] abilities."
 },
 {
  "source": "Neurotyrant",
  "kw": [
   "Neurotyrant",
   "Neurogaunts",
   "Tyrant Guard",
   "Zoanthropes"
  ],
  "champ": "wndMod",
  "val": 1,
  "nom": "Fouet Nodal — cible sous le choc",
  "quand": "L'unité est menée par le Neurotyran, et la cible est sous le choc",
  "texte": "If the target is Battle-shocked, add 1 to the Wound roll as well."
 },
 {
  "source": "Exocrine",
  "kw": [],
  "champ": "rrH",
  "val": "ones",
  "port": "T",
  "nom": "Ciblage Symbiotique",
  "quand": "La cible a été touchée par l'Exocrine cette phase",
  "texte": "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly TYRANIDS model makes an attack that targets that unit, re-roll a Hit roll of 1."
 },
 {
  "source": "Psychophage",
  "kw": [],
  "champ": "apMod",
  "val": 1,
  "port": "C",
  "nom": "Bio-stimulus",
  "quand": "La cible a été touchée par le Psychophage ce tour",
  "texte": "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly TYRANIDS unit makes a melee attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per turn."
 },
 {
  "source": "Neurolictor",
  "kw": [],
  "champ": "wndMod",
  "val": 1,
  "nom": "Saboteur Psychologique (Aura)",
  "quand": "La cible est à 12\" du Neurolictor, et sous le choc",
  "texte": "While an enemy unit is with 12\" of this model, if that unit is Battle-shocked: - Each time a friendly TYRANIDS model makes an attack that targets that unit, add 1 to the Wound roll."
 },
 {
  "detach": "Ambush Predators",
  "kw": [
   "Lictor",
   "Neurolictor"
  ],
  "champ": "rrH",
  "val": "ones",
  "nom": "Faim Mentale",
  "quand": "La cible est un PERSONNAGE",
  "texte": "▪ Friendly LICTOR/NEUROLICTOR units’ attacks that target a CHARACTER unit can re-roll hit rolls of 1."
 },
 {
  "detach": "Crusher Stampede",
  "kw": [
   "monster"
  ],
  "champ": "hitMod",
  "val": 1,
  "nom": "Béhémoths Enragés",
  "quand": "Le MONSTRE est sous son Effectif de Départ",
  "texte": "Each time a Tyranids Monster model from your army makes an attack, add 1 to the Hit roll if that model’s unit is below its Starting Strength."
 },
 {
  "detach": "Crusher Stampede",
  "kw": [
   "monster"
  ],
  "champ": "wndMod",
  "val": 1,
  "nom": "Béhémoths Enragés — sous la moitié",
  "quand": "Le MONSTRE est sous la moitié de son effectif",
  "texte": "…and add 1 to the Wound roll as well if that model’s unit is Below Half-strength."
 },
 {
  "detach": "Invasion Fleet",
  "kw": [],
  "mot": "sust:1",
  "nom": "Hyper-adaptation — Instincts Grégaires",
  "quand": "Instincts Grégaires est choisie, et la cible est INFANTERIE ou NUÉE",
  "texte": "Swarming Instincts Each time a TYRANIDS model with this Hyper-adaptation makes an attack that targets an INFANTRY or SWARM unit, that attack has the [SUSTAINED HITS 1] ability."
 },
 {
  "detach": "Invasion Fleet",
  "kw": [],
  "mot": "lethal",
  "nom": "Hyper-adaptation — Hyper-agressivité",
  "quand": "Hyper-agressivité est choisie, et la cible est MONSTRE ou VÉHICULE",
  "texte": "Hyper-aggression Each time a TYRANIDS model with this Hyper-adaptation makes an attack that targets a MONSTER or VEHICLE unit, that attack has the [LETHAL HITS] ability."
 },
 {
  "detach": "Synaptic Nexus",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "port": "C",
  "nom": "Impératif — Poussés au Massacre",
  "quand": "Cet impératif est actif ce round, et l'unité est à portée de Synapse",
  "texte": "▪ Goaded to Slaughter: While this unit is within Synapse Range of your army, each time a model in this unit makes a melee attack, add 1 to the Hit roll."
 },
 {
  "detach": "Synaptic Nexus",
  "sens": "def",
  "kw": [],
  "champ": "inv",
  "val": 5,
  "nom": "Impératif — Augmentation Synaptique",
  "quand": "Cet impératif est actif ce round, et l'unité est à portée de Synapse",
  "texte": "▪ Synaptic Augmentation: While this unit is within Synapse Range of your army, models in this unit have a 5+ invulnerable save."
 },
 {
  "detach": "Warrior Bioform Onslaught",
  "sens": "def",
  "kw": [
   "Tyranid Warriors with Melee Bio-Weapons",
   "Tyranid Warriors with Ranged Bio-Weapons",
   "Tyranid Prime with Lash Whip",
   "Winged Tyranid Prime"
  ],
  "champ": "inv",
  "val": 5,
  "nom": "Bêtes Meneuses",
  "quand": "Toujours, pour les Guerriers et les Primes",
  "texte": "▪ TYRANID WARRIORS/TYRANID PRIME WITH LASH WHIP/WINGED TYRANID PRIME models from your army have 5+ InSv."
 }
];
const OCTROIS_DETACH = {
 "Subterranean Assault": [
  {
   "champ": "rrH",
   "val": "ones",
   "qui": "unite",
   "kw": [],
   "nom": "Assaut Surprise",
   "texte": "Each time a Tyranids model from your army makes an attack, re-roll a Hit roll of 1."
  }
 ]
};
const STRAT_SIMU = [
 {
  "nom": "Broodguard Impulse",
  "detach": "Assimilation Swarm",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "+1 pour blesser — contre l'unité qui a détruit ton MOISSONNEUR",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Secure Biomass",
  "detach": "Assimilation Swarm",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES FATALES] au corps à corps",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Secure Biomass — Moissonneur",
  "detach": "Assimilation Swarm",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Haruspex",
   "Norn Assimilator",
   "Psychophage",
   "Pyrovores",
   "Ripper Swarms"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] et touches critiques sur 5+ au corps à corps — MOISSONNEURS",
  "effet": {
   "lethal": true,
   "critH": 5
  }
 },
 {
  "nom": "Rampaging Monstrosities",
  "detach": "Crusher Stampede",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Barbed Hierodule",
   "Carnifexes",
   "Dimachaeron",
   "Exocrine",
   "Harpy",
   "Harridan",
   "Haruspex",
   "Hierophant",
   "Hive Crone",
   "Hive Tyrant",
   "Maleceptor",
   "Mawloc",
   "Neurotyrant",
   "Norn Assimilator",
   "Norn Emissary",
   "Old One Eye",
   "Psychophage",
   "Screamer-killer",
   "Scythed Hierodule",
   "Sporocyst",
   "Tervigon",
   "The Red Terror",
   "The Swarmlord",
   "Toxicrene",
   "Trygon",
   "Tyrannocyte",
   "Tyrannofex",
   "Winged Hive Tyrant"
  ],
  "sauf": [],
  "aide": "relance des touches ratées",
  "effet": {
   "rrH": "failed"
  }
 },
 {
  "nom": "Swarm-Guided Salvoes",
  "detach": "Crusher Stampede",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Barbed Hierodule",
   "Carnifexes",
   "Dimachaeron",
   "Exocrine",
   "Harpy",
   "Harridan",
   "Haruspex",
   "Hierophant",
   "Hive Crone",
   "Hive Tyrant",
   "Maleceptor",
   "Mawloc",
   "Neurotyrant",
   "Norn Assimilator",
   "Norn Emissary",
   "Old One Eye",
   "Psychophage",
   "Screamer-killer",
   "Scythed Hierodule",
   "Sporocyst",
   "Tervigon",
   "The Red Terror",
   "The Swarmlord",
   "Toxicrene",
   "Trygon",
   "Tyrannocyte",
   "Tyrannofex",
   "Winged Hive Tyrant"
  ],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT], et ignore les malus de CT et de touche",
  "effet": {
   "ignoresCover": true,
   "ignoreMalus": true
  }
 },
 {
  "nom": "Adrenal Surge",
  "detach": "Invasion Fleet",
  "pc": 2,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "touches critiques sur 5+",
  "effet": {
   "critH": 5
  }
 },
 {
  "nom": "Enfilading Emergence",
  "detach": "Subterranean Assault",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] et [IGNORE LE COUVERT] — l'unité est arrivée en Renforts ce tour",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1",
   "ignoresCover": true
  }
 },
 {
  "nom": "Irresistible Will",
  "detach": "Synaptic Nexus",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "relance des 1 pour toucher et pour blesser — contre la cible désignée, à 6\" de la SYNAPSE",
  "effet": {
   "rrH": "ones",
   "rrW": "ones"
  }
 },
 {
  "nom": "Swarming Masses",
  "detach": "Unending Swarm",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Gargoyles",
   "Hormagaunts",
   "Neurogaunts",
   "Termagants"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1]",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Swarming Masses — 15 figurines ou plus",
  "detach": "Unending Swarm",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Gargoyles",
   "Hormagaunts",
   "Neurogaunts",
   "Termagants"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] et touches critiques sur 5+ — l'unité compte 15 figurines ou plus",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1",
   "critH": 5
  }
 },
 {
  "nom": "Surprise Assault",
  "detach": "Vanguard Onslaught",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Broodlord",
   "Deathleaper",
   "Gargoyles",
   "Genestealers",
   "Harpy",
   "Hive Crone",
   "Hyperadapted Raveners",
   "Lictor",
   "Mawloc",
   "Neurolictor",
   "Parasite of Mortrex",
   "Raveners",
   "The Red Terror",
   "Trygon",
   "Tyrannocyte",
   "Winged Hive Tyrant",
   "Winged Tyranid Prime"
  ],
  "sauf": [],
  "aide": "+1 pour toucher contre la cible désignée",
  "effet": {
   "hitMod": 1
  }
 },
 {
  "nom": "Surprise Assault — test de choc raté",
  "detach": "Vanguard Onslaught",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Broodlord",
   "Deathleaper",
   "Gargoyles",
   "Genestealers",
   "Harpy",
   "Hive Crone",
   "Hyperadapted Raveners",
   "Lictor",
   "Mawloc",
   "Neurolictor",
   "Parasite of Mortrex",
   "Raveners",
   "The Red Terror",
   "Trygon",
   "Tyrannocyte",
   "Winged Hive Tyrant",
   "Winged Tyranid Prime"
  ],
  "sauf": [],
  "aide": "+1 pour toucher et +1 pour blesser — la cible a raté son test de choc",
  "effet": {
   "hitMod": 1,
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
  cle : "tyranides",
  nom : "Tyranides",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
