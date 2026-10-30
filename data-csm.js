/* ============================================================
   Données Space Marines du Chaos — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py csm

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 104 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     54 fiches sur 77 en ont un. Les autres — des Legends, que le
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
  ["Abaddon the Despoiler",5,6,2,4,9,[1],{"1": 300},0,"Meneur",0,"",4,"5+"],
  ["Accursed Cultists",6,4,6,0,3,[8, 16],[[1, {"8": 90, "16": 185}], [3, {"8": 110, "16": 205}]],0,"",0,"",1,"7+"],
  ["Chaos Bikers",12,6,3,0,3,[3, 6],{"3": 80, "6": 150},0,"",0,"",2,"6+"],
  ["Chaos Deimos Predator",10,10,3,0,11,[1],{"1": 115},0,"",1,"",3,"6+"],
  ["Chaos Land Raider",10,12,2,0,16,[1],[[1, {"1": 220}], [3, {"1": 240}]],0,"",0,"",5,"6+"],
  ["Chaos Lord",6,5,3,4,5,[1],{"1": 95},0,"Meneur",0,"",1,"6+"],
  ["Chaos Lord in Terminator Armour",5,6,2,4,6,[1],{"1": 90},0,"Meneur",0,"",1,"6+"],
  ["Chaos Lord on Bike",12,5,3,4,6,[1],{"1": 95},0,"Meneur",1,"",2,"6+"],
  ["Chaos Lord on Disc of Tzeentch",12,4,3,4,6,[1],{"1": 100},0,"Meneur",1,"",1,"6+"],
  ["Chaos Lord on Juggernaut",10,6,2,4,7,[1],{"1": 115},0,"Meneur",1,"",2,"6+"],
  ["Chaos Lord on Palanquin of Nurgle",5,5,3,4,8,[1],{"1": 90},0,"Meneur",1,"",2,"6+"],
  ["Chaos Lord on Steed of Slaanesh",14,5,3,4,6,[1],{"1": 100},0,"Meneur",1,"",2,"6+"],
  ["Chaos Lord with Jump Pack",12,5,3,4,5,[1],{"1": 85},0,"Meneur",0,"",1,"6+"],
  ["Chaos Predator Annihilator",10,10,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Chaos Predator Destructor",10,10,3,0,11,[1],[[1, {"1": 145}], [3, {"1": 155}]],0,"",0,"",3,"6+"],
  ["Chaos Rhino",12,9,3,0,10,[1],[[1, {"1": 65}], [4, {"1": 75}]],0,"",0,"",2,"6+"],
  ["Chaos Spawn",8,5,4,0,4,[2],{"2": 60},0,"",0,"",0,"7+"],
  ["Chaos Terminator Squad",5,6,2,4,3,[5, 10],[[1, {"5": 185, "10": 370}], [3, {"5": 215, "10": 400}]],0,"",0,"",1,"6+"],
  ["Chaos Vindicator",9,11,2,0,11,[1],[[1, {"1": 180}], [3, {"1": 190}]],0,"",0,"",3,"6+"],
  ["Chosen",6,5,3,0,3,[5, 10],[[1, {"5": 140, "10": 280}], [3, {"5": 150, "10": 290}]],0,"",0,"",1,"6+"],
  ["Cultist Firebrand",6,4,4,0,4,[1],[[1, {"1": 45}], [3, {"1": 50}]],0,"Meneur",0,"",1,"6+"],
  ["Cultist Mob",6,3,6,0,1,[10, 20],{"10": 50, "20": 90},0,"",0,"",1,"7+"],
  ["Cultist Mob with Firearms",6,3,6,0,1,[10, 20],{"10": 50, "20": 100},0,"",1,"",1,"7+"],
  ["Cypher",6,5,3,4,5,[1],{"1": 95},0,"",0,"",1,"6+"],
  ["Dark Apostle",6,5,3,4,4,[3],{"3": 70},0,"Meneur",0,"",1,"5+"],
  ["Dark Commune",6,3,6,0,1,[5],[[1, {"5": 90}], [3, {"5": 100}]],0,"Meneur",0,"",1,"7+"],
  ["Defiler",12,11,3,5,18,[1],[[1, {"1": 300}], [2, {"1": 350}]],0,"",0,"",5,"6+"],
  ["Exalted Champion",6,4,3,0,4,[1],{"1": 70},0,"Appui",1,"",1,"6+"],
  ["Fabius Bile",6,5,3,0,5,[2],{"2": 110},0,"Meneur",0,"",1,"6+"],
  ["Fellgor Beastmen",6,4,5,0,1,[10],{"10": 60},0,"",0,"",1,"7+"],
  ["Forgefiend",8,10,3,5,12,[1],[[1, {"1": 155}], [3, {"1": 165}]],0,"",0,"",3,"6+"],
  ["Gellerpox Infected",5,5,6,0,1,[7],{"7": 125},0,"",1,"",1,"7+"],
  ["Haarken Worldclaimer",12,5,3,4,5,[1],{"1": 95},0,"Meneur",0,"",1,"6+"],
  ["Havocs",5,5,3,0,3,[5],[[1, {"5": 135}], [3, {"5": 145}]],0,"",0,"",1,"6+"],
  ["Helbrute",6,9,2,0,8,[1],{"1": 125},0,"",0,"",3,"6+"],
  ["Heldrake",12,9,3,5,12,[1],{"1": 175},0,"",0,"",0,"6+"],
  ["Hell Blade",20,8,3,5,10,[1],{"1": 115},0,"",1,"",0,"6+"],
  ["Hell Talon",20,9,3,5,14,[1],{"1": 140},0,"",1,"",0,"6+"],
  ["Heretic Astartes Daemon Prince",8,10,2,4,10,[1],{"1": 155},0,"",0,"",3,"6+"],
  ["Heretic Astartes Daemon Prince with wings",12,9,2,4,10,[1],{"1": 170},0,"",0,"",3,"6+"],
  ["Huron Blackheart",6,6,3,4,5,[1],{"1": 135},0,"Meneur",0,"",1,"6+"],
  ["Khorne Lord of Skulls",8,13,3,5,24,[1],[[1, {"1": 450}], [2, {"1": 475}]],0,"",0,"",8,"6+"],
  ["Kravek Morne",5,6,2,4,6,[1],{"1": 130},0,"Meneur",0,"",1,"6+"],
  ["Legionaries",6,5,3,0,2,[5, 10],{"5": 95, "10": 180},0,"",0,"",2,"6+"],
  ["Lord Discordant on Helstalker",14,9,2,4,10,[1],{"1": 155},0,"",0,"",4,"6+"],
  ["Master of Executions",6,5,3,0,4,[1],{"1": 75},0,"Appui",0,"",1,"6+"],
  ["Master of Possession",8,5,3,5,4,[1],{"1": 65},0,"Meneur",0,"",1,"6+"],
  ["Masters of the Maelstrom",6,5,3,0,4,[5],{"5": 150},0,"Appui",0,"",1,"6+"],
  ["Maulerfiend",10,10,3,5,12,[1],{"1": 125},0,"",0,"",3,"6+"],
  ["Mutilators",5,7,2,5,5,[3],[[1, {"3": 165}], [3, {"3": 185}]],0,"",0,"",2,"6+"],
  ["Mutoid Vermin",8,2,7,0,1,[16],{"16": 85},0,"",1,"",0,"8+"],
  ["Negavolt Cultists",6,3,7,5,1,[4],{"4": 55},0,"",1,"",1,"7+"],
  ["Nemesis Claw",6,5,3,0,2,[5, 10],{"5": 105, "10": 190},0,"",0,"",1,"6+"],
  ["Noctilith Crown",0,11,3,0,14,[1],{"1": 125},0,"",0,"",0,"6+"],
  ["Obliterators",4,7,2,5,5,[2],[[1, {"2": 160}], [3, {"2": 170}]],0,"",0,"",2,"6+"],
  ["Possessed",9,6,3,5,3,[5, 10],[[1, {"5": 130, "10": 260}], [3, {"5": 150, "10": 280}]],0,"",0,"",1,"6+"],
  ["Raptors",12,5,3,0,2,[5, 10],[[1, {"5": 115, "10": 225}], [3, {"5": 125, "10": 235}]],0,"",0,"",1,"6+"],
  ["Red Corsairs Raiders",6,5,3,0,3,[5, 10],[[1, {"5": 120, "10": 220}], [3, {"5": 130, "10": 230}]],0,"",0,"",2,"6+"],
  ["Red Corsairs Reave-captain",6,5,3,4,5,[1],{"1": 65},0,"Meneur",0,"",1,"6+"],
  ["Renegade Enforcer",6,3,5,5,3,[1],{"1": 65},0,"Meneur",1,"",1,"6+"],
  ["Renegade Heavy Weapons Squad",6,3,5,0,2,[3],{"3": 75},0,"",1,"",2,"7+"],
  ["Renegade Ogryn Beast Handler",6,6,5,0,4,[4, 7],{"4": 40, "7": 70},0,"",1,"",1,"7+"],
  ["Renegade Ogryn Brutes",6,6,5,0,3,[3],{"3": 95},0,"",1,"",1,"7+"],
  ["Renegade Plague Ogryns",5,7,5,0,3,[3],{"3": 95},0,"",1,"",1,"7+"],
  ["Rogue Psyker",6,3,5,0,3,[1],{"1": 60},0,"Meneur",1,"",1,"7+"],
  ["Sorcerer",6,5,3,0,4,[1],{"1": 65},0,"Meneur",0,"",1,"6+"],
  ["Sorcerer in Terminator Armour",5,6,2,4,5,[1],{"1": 85},0,"Meneur",0,"",1,"6+"],
  ["Sorcerer on Bike",12,5,3,0,5,[1],{"1": 75},0,"Meneur",1,"",2,"6+"],
  ["Sorcerer on Disc of Tzeentch",12,4,3,0,5,[1],{"1": 80},0,"Meneur",1,"",1,"6+"],
  ["Sorcerer on Palanquin of Nurgle",5,5,3,0,7,[1],{"1": 80},0,"Meneur",1,"",2,"6+"],
  ["Sorcerer on Steed of Slaanesh",14,5,3,0,5,[1],{"1": 85},0,"Meneur",1,"",2,"6+"],
  ["Traitor Enforcer",6,3,5,5,3,[2],{"2": 70},0,"Meneur",0,"",1,"6+"],
  ["Traitor Guardsmen Squad",6,3,5,0,1,[10],{"10": 65},0,"",0,"",2,"7+"],
  ["Vashtorr the Arkifane",12,10,2,4,14,[1],{"1": 220},0,"",0,"",3,"6+"],
  ["Venomcrawler",12,9,3,5,9,[1],[[1, {"1": 120}], [3, {"1": 130}]],0,"",0,"",3,"6+"],
  ["Warp Talons",12,5,3,5,2,[5, 10],[[1, {"5": 130, "10": 290}], [3, {"5": 140, "10": 300}]],0,"",0,"",1,"6+"],
  ["Warpsmith",6,5,2,0,4,[1],{"1": 65},0,"Meneur",0,"",1,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Abaddon the Despoiler","Talon of Horus (tir)","T","4",2,5,1,"2","sust:1","24\""],
  ["Abaddon the Despoiler","Drach'nyen","C","8",2,14,4,"3","dev","càc"],
  ["Abaddon the Despoiler","Talon of Horus (càc)","C","14",2,7,3,"1","dev","càc"],
  ["Accursed Cultists","Blasphemous appendages","C","2",4,4,0,"1","","càc"],
  ["Accursed Cultists","Hideous mutations","C","D6+2",4,5,1,"2","","càc"],
  ["Chaos Bikers","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Chaos Bikers","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Bikers","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Bikers","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Chaos Bikers","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Chaos Bikers","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Chaos Bikers","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Chaos Bikers","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Chaos Bikers","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Chaos Bikers","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Chaos Bikers","Astartes chainsword","C","4",3,5,1,"1","","càc"],
  ["Chaos Bikers","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Chaos Bikers","Power fist","C","3",3,8,2,"2","","càc"],
  ["Chaos Deimos Predator","Combi-bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Chaos Deimos Predator","Conversion beam cannon","T","1",3,7,1,"3","sust:D3","24\""],
  ["Chaos Deimos Predator","Heavy bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Chaos Deimos Predator","Infernus cannon","T","2D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Chaos Deimos Predator","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Chaos Deimos Predator","Magna-melta cannon","T","2",3,12,4,"D6","melta:4","18\""],
  ["Chaos Deimos Predator","➤ Plasma destroyer - standard","T","D3",3,8,2,"2","blast","36\""],
  ["Chaos Deimos Predator","➤ Plasma destroyer - supercharge","T","D3",3,9,3,"3","blast hazardous","36\""],
  ["Chaos Land Raider","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Land Raider","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Land Raider","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Land Raider","Soulshatter lascannon","T","2",3,12,3,"D6+1","","48\""],
  ["Chaos Land Raider","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Chaos Land Raider","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Chaos Lord","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Chaos Lord","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Chaos Lord","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Chaos Lord","Astartes chainblade","C","7",2,5,1,"1","","càc"],
  ["Chaos Lord","Daemon hammer","C","5",3,8,2,"2","dev","càc"],
  ["Chaos Lord","Power fist","C","5",2,8,2,"2","","càc"],
  ["Chaos Lord in Terminator Armour","Combi-bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Chaos Lord in Terminator Armour","Combi-weapon","T","1",3,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Lord in Terminator Armour","Chainfist","C","5",3,8,2,"2","anti:3:veh","càc"],
  ["Chaos Lord in Terminator Armour","Exalted weapon","C","6",2,5,2,"2","","càc"],
  ["Chaos Lord in Terminator Armour","Paired accursed weapons","C","7",2,5,2,"1","twin","càc"],
  ["Chaos Lord in Terminator Armour","Power fist","C","5",2,8,2,"2","","càc"],
  ["Chaos Lord on Bike","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Chaos Lord on Bike","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Chaos Lord on Bike","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Lord on Bike","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Chaos Lord on Bike","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Chaos Lord on Bike","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Chaos Lord on Bike","Astartes chainsword","C","7",2,4,1,"1","","càc"],
  ["Chaos Lord on Bike","Close combat weapon","C","6",2,4,0,"1","","càc"],
  ["Chaos Lord on Bike","Paired accursed weapons","C","7",2,4,1,"1","twin","càc"],
  ["Chaos Lord on Bike","Power fist","C","5",2,8,2,"2","","càc"],
  ["Chaos Lord on Disc of Tzeentch","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Chaos Lord on Disc of Tzeentch","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Chaos Lord on Disc of Tzeentch","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Lord on Disc of Tzeentch","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Chaos Lord on Disc of Tzeentch","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Chaos Lord on Disc of Tzeentch","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Chaos Lord on Disc of Tzeentch","Astartes chainsword","C","7",2,4,1,"1","","càc"],
  ["Chaos Lord on Disc of Tzeentch","Close combat weapon","C","6",2,4,0,"1","","càc"],
  ["Chaos Lord on Disc of Tzeentch","Paired accursed weapons","C","7",2,4,1,"1","twin","càc"],
  ["Chaos Lord on Disc of Tzeentch","Power fist","C","5",2,8,2,"2","","càc"],
  ["Chaos Lord on Juggernaut","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Chaos Lord on Juggernaut","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Chaos Lord on Juggernaut","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Lord on Juggernaut","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Chaos Lord on Juggernaut","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Chaos Lord on Juggernaut","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Chaos Lord on Juggernaut","Astartes chainsword","C","7",2,4,1,"1","","càc"],
  ["Chaos Lord on Juggernaut","Bladed horn","C","4",4,6,1,"1","extra lance","càc"],
  ["Chaos Lord on Juggernaut","Close combat weapon","C","6",2,4,0,"1","","càc"],
  ["Chaos Lord on Juggernaut","Paired accursed weapons","C","7",2,4,1,"1","twin","càc"],
  ["Chaos Lord on Juggernaut","Power fist","C","5",2,8,2,"2","","càc"],
  ["Chaos Lord on Palanquin of Nurgle","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Chaos Lord on Palanquin of Nurgle","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Chaos Lord on Palanquin of Nurgle","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Lord on Palanquin of Nurgle","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Chaos Lord on Palanquin of Nurgle","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Chaos Lord on Palanquin of Nurgle","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Chaos Lord on Palanquin of Nurgle","Astartes chainsword","C","7",2,4,1,"1","","càc"],
  ["Chaos Lord on Palanquin of Nurgle","Close combat weapon","C","6",2,4,0,"1","","càc"],
  ["Chaos Lord on Palanquin of Nurgle","Nurgling's claws and teeth","C","4",5,2,0,"1","extra","càc"],
  ["Chaos Lord on Palanquin of Nurgle","Paired accursed weapons","C","7",2,4,1,"1","twin","càc"],
  ["Chaos Lord on Palanquin of Nurgle","Power fist","C","5",2,8,2,"2","","càc"],
  ["Chaos Lord on Steed of Slaanesh","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Chaos Lord on Steed of Slaanesh","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Chaos Lord on Steed of Slaanesh","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Lord on Steed of Slaanesh","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Chaos Lord on Steed of Slaanesh","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Chaos Lord on Steed of Slaanesh","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Chaos Lord on Steed of Slaanesh","Astartes chainsword","C","7",2,4,1,"1","","càc"],
  ["Chaos Lord on Steed of Slaanesh","Close combat weapon","C","6",2,4,0,"1","","càc"],
  ["Chaos Lord on Steed of Slaanesh","Lashing tongue","C","3",4,4,0,"1","extra lethal","càc"],
  ["Chaos Lord on Steed of Slaanesh","Paired accursed weapons","C","7",2,4,1,"1","twin","càc"],
  ["Chaos Lord on Steed of Slaanesh","Power fist","C","5",2,8,2,"2","","càc"],
  ["Chaos Lord with Jump Pack","Bolt pistol","T","1",2,5,1,"1","pistol","12\""],
  ["Chaos Lord with Jump Pack","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Chaos Lord with Jump Pack","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Chaos Lord with Jump Pack","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Chaos Lord with Jump Pack","Power fist","C","5",2,8,2,"2","","càc"],
  ["Chaos Lord with Jump Pack","Twin lightning claws","C","6",2,5,2,"1","twin","càc"],
  ["Chaos Predator Annihilator","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Predator Annihilator","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Predator Annihilator","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Predator Annihilator","Heavy bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Chaos Predator Annihilator","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Chaos Predator Annihilator","Predator twin lascannon","T","1",3,14,3,"D6+1","twin","48\""],
  ["Chaos Predator Annihilator","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Predator Destructor","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Predator Destructor","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Predator Destructor","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Predator Destructor","Heavy bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Chaos Predator Destructor","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Chaos Predator Destructor","Predator autocannon","T","4",3,9,1,"3","rf:2","48\""],
  ["Chaos Predator Destructor","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Rhino","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Rhino","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Rhino","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Rhino","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Spawn","Hideous Mutations","C","D6+2",4,5,1,"2","","càc"],
  ["Chaos Terminator Squad","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Terminator Squad","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Terminator Squad","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Chaos Terminator Squad","Reaper autocannon","T","4",3,7,1,"1","dev sust:1","36\""],
  ["Chaos Terminator Squad","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Chaos Terminator Squad","Chainfist","C","3",4,8,2,"2","anti:3:veh","càc"],
  ["Chaos Terminator Squad","Paired accursed weapons","C","5",3,5,2,"1","twin","càc"],
  ["Chaos Terminator Squad","Power fist","C","3",3,8,2,"2","","càc"],
  ["Chaos Vindicator","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Vindicator","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Vindicator","Demolisher cannon","T","D6+3",3,14,3,"D6","blast","24\""],
  ["Chaos Vindicator","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Vindicator","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chosen","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Chosen","Boltgun","T","2",3,5,1,"1","","24\""],
  ["Chosen","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chosen","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Chosen","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Chosen","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Chosen","Paired accursed weapons","C","5",3,5,2,"1","twin","càc"],
  ["Chosen","Power fist","C","4",3,8,2,"2","","càc"],
  ["Cultist Firebrand","Balefire pike","T","D6+3",0,5,1,"1","ignorescover torrent","12\""],
  ["Cultist Firebrand","Close combat weapon","C","4",4,4,0,"1","","càc"],
  ["Cultist Mob","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Cultist Mob","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Cultist Mob","Brutal assault weapon","C","2",4,3,0,"1","","càc"],
  ["Cultist Mob with Firearms","Autogun","T","1",4,3,0,"1","rf:1","24\""],
  ["Cultist Mob with Firearms","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Cultist Mob with Firearms","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Cultist Mob with Firearms","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Cultist Mob with Firearms","Heavy stubber","T","4",5,4,0,"1","heavy rf:3","36\""],
  ["Cultist Mob with Firearms","➤ Cultist grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Cultist Mob with Firearms","➤ Cultist grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Cultist Mob with Firearms","Brutal assault weapon","C","2",4,3,0,"1","","càc"],
  ["Cultist Mob with Firearms","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Cypher","Cypher's bolt pistol (tir)","T","6",2,5,1,"1","assault pistol sust:1","12\""],
  ["Cypher","Cypher's plasma pistol (tir)","T","3",2,8,3,"2","assault pistol sust:1","12\""],
  ["Cypher","Cypher's bolt pistol (càc)","C","6",2,5,1,"1","sust:1","càc"],
  ["Cypher","Cypher's plasma pistol (càc)","C","3",2,8,3,"2","extra","càc"],
  ["Dark Apostle","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Dark Apostle","Accursed crozius","C","5",2,6,1,"2","","càc"],
  ["Dark Apostle","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Dark Commune","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Dark Commune","➤ Warp Curse - focused witchfire","T","3",3,5,1,"2","hazardous psychic sust:2","18\""],
  ["Dark Commune","➤ Warp Curse - witchfire","T","3",3,4,1,"2","psychic","18\""],
  ["Dark Commune","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Dark Commune","Commune blade","C","2",4,4,2,"1","","càc"],
  ["Dark Commune","Commune stave","C","2",4,3,0,"D3","dev","càc"],
  ["Defiler","Ectoplasma destructor","T","D6",3,12,3,"3","blast","36\""],
  ["Defiler","Excruciator cannon","T","6",3,6,1,"2","","36\""],
  ["Defiler","Hades battle cannon","T","D6+3",3,10,1,"3","blast","48\""],
  ["Defiler","Hades lascannon","T","2",3,12,3,"D6+1","","48\""],
  ["Defiler","Heavy baleflamer","T","D6+3",0,7,2,"2","ignorescover torrent","12\""],
  ["Defiler","Heavy reaper autocannon","T","4",3,9,1,"3","dev sust:1","48\""],
  ["Defiler","Magma cutter","T","2",3,9,4,"D6","melta:2","12\""],
  ["Defiler","➤ Heavy missile launcher - frag","T","2D6",3,5,1,"1","blast","48\""],
  ["Defiler","➤ Heavy missile launcher - krak","T","2",3,10,2,"D6+1","","48\""],
  ["Defiler","Electroscourge","C","5",3,12,2,"2","extra sust:2","càc"],
  ["Defiler","Shearing claws - strike","C","5",3,16,3,"D6+1","","càc"],
  ["Defiler","Shearing claws - sweep","C","10",3,6,2,"1","","càc"],
  ["Exalted Champion","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Exalted Champion","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Exalted Champion","Exalted weapon","C","5",2,5,2,"2","","càc"],
  ["Fabius Bile","Xyclos needler","T","3",2,2,1,"2","anti:2:inf pistol","18\""],
  ["Fabius Bile","Rod of Torment","C","6",2,5,1,"3","","càc"],
  ["Fabius Bile","Surgeon Acolyte's tools","C","1",5,3,0,"1","","càc"],
  ["Fabius Bile","The Chirurgeon","C","2",2,4,0,"1","extra","càc"],
  ["Fellgor Beastmen","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Fellgor Beastmen","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Fellgor Beastmen","Corrupted stave (tir)","T","D3",4,5,1,"1","dev psychic","18\""],
  ["Fellgor Beastmen","➤ Plasma pistol - standard","T","1",4,7,2,"1","pistol","12\""],
  ["Fellgor Beastmen","➤ Plasma pistol- supercharge","T","1",4,8,3,"2","hazardous pistol","12\""],
  ["Fellgor Beastmen","Chainsword","C","3",4,4,0,"1","","càc"],
  ["Fellgor Beastmen","Close combat weapon","C","2",4,4,0,"1","","càc"],
  ["Fellgor Beastmen","Corrupted stave (càc)","C","2",4,4,1,"D3","dev psychic","càc"],
  ["Fellgor Beastmen","Great weapon","C","2",5,8,1,"2","","càc"],
  ["Forgefiend","Ectoplasma cannon","T","D3",3,10,3,"3","blast","36\""],
  ["Forgefiend","Hades autocannon","T","6",3,8,1,"2","","36\""],
  ["Forgefiend","Armoured limbs","C","2",3,6,0,"2","","càc"],
  ["Forgefiend","Forgefiend jaws","C","5",3,7,0,"2","","càc"],
  ["Gellerpox Infected","Belly flamer","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Gellerpox Infected","Brutal weapons","C","2",4,4,0,"1","","càc"],
  ["Gellerpox Infected","Hideous mutations","C","4",4,6,1,"2","","càc"],
  ["Haarken Worldclaimer","Hellspear (tir)","T","1",2,8,3,"3","assault sust:D3","12\""],
  ["Haarken Worldclaimer","Hellspear (càc)","C","1",2,8,3,"3","extra lance sust:D3","càc"],
  ["Haarken Worldclaimer","Herald's Talon","C","6",2,5,2,"2","precision","càc"],
  ["Havocs","Boltgun","T","2",3,5,1,"1","","24\""],
  ["Havocs","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Havocs","Havoc autocannon","T","2",3,9,1,"3","","48\""],
  ["Havocs","Havoc heavy bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Havocs","Havoc lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Havocs","Havoc reaper chaincannon","T","8",3,5,0,"1","","24\""],
  ["Havocs","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Havocs","➤ Havoc missile launcher - frag","T","D6",3,4,0,"1","blast","48\""],
  ["Havocs","➤ Havoc missile launcher - krak","T","1",3,9,2,"D6","","48\""],
  ["Havocs","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Havocs","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Havocs","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Havocs","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Havocs","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Havocs","Astartes chainsword","C","4",3,5,1,"1","","càc"],
  ["Havocs","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Havocs","Power fist","C","3",3,8,2,"2","","càc"],
  ["Helbrute","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Helbrute","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Helbrute","Helbrute plasma cannon","T","D3",3,8,3,"3","blast hazardous","36\""],
  ["Helbrute","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Helbrute","Twin autocannon","T","2",3,9,1,"3","twin","48\""],
  ["Helbrute","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Helbrute","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Helbrute","➤ Missile launcher - frag","T","D6",3,4,0,"1","blast","48\""],
  ["Helbrute","➤ Missile launcher - krak","T","1",3,9,2,"D6","","48\""],
  ["Helbrute","Close combat weapon","C","5",3,6,0,"1","","càc"],
  ["Helbrute","Helbrute fist","C","5",3,12,2,"3","","càc"],
  ["Helbrute","Helbrute hammer","C","5",4,14,3,"D6+1","","càc"],
  ["Helbrute","Power scourge","C","8",3,7,1,"2","","càc"],
  ["Heldrake","Baleflamer","T","D6+3",0,6,1,"2","ignorescover torrent","12\""],
  ["Heldrake","Hades autocannon","T","6",3,8,1,"2","","36\""],
  ["Heldrake","Heldrake claws","C","5",3,7,1,"2","anti:2:vol dev","càc"],
  ["Hell Blade","Twin autocannon","T","2",3,9,3,"3","twin","48\""],
  ["Hell Blade","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Hell Blade","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Hell Talon","Autocannon","T","2",3,9,1,"3","","48\""],
  ["Hell Talon","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Hell Talon","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Hell Talon","Armoured hull","C","6",4,6,0,"1","","càc"],
  ["Heretic Astartes Daemon Prince","Infernal cannon","T","3",2,5,1,"2","","24\""],
  ["Heretic Astartes Daemon Prince","➤ Hellforged weapons - strike","C","6",2,8,2,"3","","càc"],
  ["Heretic Astartes Daemon Prince","➤ Hellforged weapons - sweep","C","14",2,6,0,"1","","càc"],
  ["Heretic Astartes Daemon Prince with wings","Infernal cannon","T","3",2,5,1,"2","","24\""],
  ["Heretic Astartes Daemon Prince with wings","➤ Hellforged weapons - strike","C","6",2,8,2,"3","","càc"],
  ["Heretic Astartes Daemon Prince with wings","➤ Hellforged weapons - sweep","C","14",2,6,0,"1","","càc"],
  ["Huron Blackheart","Tyrant's Claw heavy flamer","T","D6+2",0,6,1,"1","ignorescover pistol torrent","12\""],
  ["Huron Blackheart","Tyrant's Claw and exalted power weapon","C","6",2,8,3,"3","","càc"],
  ["Khorne Lord of Skulls","Daemongore cannon","T","D6",3,14,4,"D6+2","blast","18\""],
  ["Khorne Lord of Skulls","Gorestorm cannon","T","D6+3",3,10,2,"3","blast","24\""],
  ["Khorne Lord of Skulls","Hades gatling cannon","T","12",3,8,2,"2","sust:1","48\""],
  ["Khorne Lord of Skulls","Ichor cannon","T","2D6",3,7,2,"2","blast","48\""],
  ["Khorne Lord of Skulls","Skullhurler","T","2D6",3,14,3,"3","","60\""],
  ["Khorne Lord of Skulls","➤ Great cleaver of Khorne - strike","C","5",3,16,4,"8","","càc"],
  ["Khorne Lord of Skulls","➤ Great cleaver of Khorne - sweep","C","15",3,8,2,"2","","càc"],
  ["Kravek Morne","Baleflamer","T","D6+3",0,6,1,"2","ignorescover torrent","12\""],
  ["Kravek Morne","Combi-bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Kravek Morne","Last Argument and power fist","C","7",2,10,2,"2","dev","càc"],
  ["Kravek Morne","Servo-harness","C","3",2,6,2,"2","anti:2:veh extra","càc"],
  ["Legionaries","Balefire tome","T","2",3,5,1,"1","psychic","18\""],
  ["Legionaries","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Legionaries","Boltgun","T","2",3,5,1,"1","","24\""],
  ["Legionaries","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Legionaries","Havoc autocannon","T","2",4,9,1,"3","","48\""],
  ["Legionaries","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Legionaries","Lascannon","T","1",4,12,3,"D6+1","heavy","48\""],
  ["Legionaries","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Legionaries","Reaper chaincannon","T","8",4,5,0,"1","heavy","24\""],
  ["Legionaries","➤ Missile launcher - frag","T","D6",4,4,0,"1","blast heavy","48\""],
  ["Legionaries","➤ Missile launcher - krak","T","1",4,9,2,"D6","heavy","48\""],
  ["Legionaries","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Legionaries","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Legionaries","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Legionaries","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Legionaries","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Legionaries","Astartes chainsword","C","4",3,5,1,"1","","càc"],
  ["Legionaries","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Legionaries","Heavy melee weapon","C","3",3,8,2,"2","","càc"],
  ["Lord Discordant on Helstalker","Baleflamer","T","D6+3",0,6,1,"2","ignorescover torrent","12\""],
  ["Lord Discordant on Helstalker","Bolt pistol","T","1",2,5,1,"1","pistol","12\""],
  ["Lord Discordant on Helstalker","Helstalker autocannon","T","3",2,9,1,"3","","48\""],
  ["Lord Discordant on Helstalker","Magma cutter","T","2",3,9,4,"D6","melta:2","6\""],
  ["Lord Discordant on Helstalker","Bladed limbs","C","4",3,6,1,"2","extra","càc"],
  ["Lord Discordant on Helstalker","Impaler chainglaive","C","5",2,8,3,"3","lance","càc"],
  ["Lord Discordant on Helstalker","Techno-virus injector","C","1",3,3,3,"2","anti:2:veh extra","càc"],
  ["Master of Executions","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Master of Executions","Axe of dismemberment","C","5",2,7,2,"2","dev precision","càc"],
  ["Master of Possession","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Master of Possession","➤ Rite of Possession - focused witchfire","T","2",3,6,3,"3","anti:2 hazardous pistol precision psychic","18\""],
  ["Master of Possession","➤ Rite of Possession - witchfire","T","2",3,4,3,"2","anti:2 pistol precision psychic","18\""],
  ["Master of Possession","Staff of possession","C","4",3,6,1,"D3","anti:2 psychic","càc"],
  ["Masters of the Maelstrom","Absolver bolt pistol","T","1",3,5,1,"2","pistol","18\""],
  ["Masters of the Maelstrom","Bolt pistol","T","1",3,4,1,"1","pistol","12\""],
  ["Masters of the Maelstrom","Laspistol","T","1",3,4,1,"1","pistol","12\""],
  ["Masters of the Maelstrom","Londaxi maimer","T","3",3,4,1,"1","assault","18\""],
  ["Masters of the Maelstrom","Mind Wrench","T","1",2,6,2,"D6+1","precision psychic","12\""],
  ["Masters of the Maelstrom","Axe of Ending","C","6",2,6,2,"2","anti:2:perso precision","càc"],
  ["Masters of the Maelstrom","Bionic gauntlet","C","1",2,6,2,"2","","càc"],
  ["Masters of the Maelstrom","Force stave","C","4",2,6,2,"2","psychic","càc"],
  ["Masters of the Maelstrom","Power sabre","C","4",3,4,2,"1","","càc"],
  ["Masters of the Maelstrom","Reductor array","C","6",3,4,2,"1","","càc"],
  ["Maulerfiend","Magma cutter","T","2",3,9,4,"D6","melta:2","6\""],
  ["Maulerfiend","Lasher tendrils","C","6",3,7,1,"1","extra","càc"],
  ["Maulerfiend","Maulerfiend fists","C","6",3,14,2,"D6+1","","càc"],
  ["Mutilators","➤ Fleshmetal weapons - clawed sweeps","C","6",3,6,2,"1","","càc"],
  ["Mutilators","➤ Fleshmetal weapons - rending strikes","C","4",3,9,3,"3","","càc"],
  ["Mutilators","➤ Fleshmetal weapons - thunderous blows","C","2",3,12,4,"D6+2","","càc"],
  ["Mutoid Vermin","Diseased claws and fangs","C","2",4,2,0,"1","lethal","càc"],
  ["Negavolt Cultists","Electro-goads","C","3",3,4,0,"1","sust:2","càc"],
  ["Nemesis Claw","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Nemesis Claw","Boltgun","T","2",3,5,1,"1","","24\""],
  ["Nemesis Claw","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Nemesis Claw","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Nemesis Claw","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Nemesis Claw","➤ Missile launcher - frag","T","D6",4,4,0,"1","blast heavy","48\""],
  ["Nemesis Claw","➤ Missile launcher - krak","T","1",4,9,2,"D6","heavy","48\""],
  ["Nemesis Claw","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Nemesis Claw","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Nemesis Claw","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Nemesis Claw","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Nemesis Claw","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Nemesis Claw","Astartes chainsword","C","4",3,5,1,"1","","càc"],
  ["Nemesis Claw","Close combat weapon","C","3",3,4,0,"1","","càc"],
  ["Nemesis Claw","Nostraman chainblade","C","5",3,5,1,"1","sust:1","càc"],
  ["Nemesis Claw","Nostraman chainglaive","C","4",3,8,2,"1","sust:1","càc"],
  ["Nemesis Claw","Paired accursed weapons","C","5",3,5,2,"1","twin","càc"],
  ["Nemesis Claw","Power fist","C","3",3,8,2,"2","","càc"],
  ["Noctilith Crown","Lashing warp energies","T","8",4,8,1,"2","","6\""],
  ["Obliterators","➤ Fleshmetal guns - focused malice","T","D3",3,12,3,"4","melta:2","18\""],
  ["Obliterators","➤ Fleshmetal guns - ruinous salvo","T","D6",3,8,2,"2","blast","24\""],
  ["Obliterators","➤ Fleshmetal guns - warp hail","T","D6+3",3,5,1,"1","sust:1","24\""],
  ["Obliterators","Crushing fists","C","4",3,9,2,"2","","càc"],
  ["Possessed","Hideous mutations","C","4",3,6,1,"2","","càc"],
  ["Raptors","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Raptors","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Raptors","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Raptors","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Raptors","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Raptors","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Raptors","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Raptors","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Raptors","Astartes chainsword","C","4",3,5,1,"1","","càc"],
  ["Raptors","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Raptors","Heavy melee weapon","C","3",3,8,2,"2","","càc"],
  ["Raptors","Mutations","C","4",3,5,2,"1","","càc"],
  ["Red Corsairs Raiders","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Red Corsairs Raiders","Boltgun","T","2",3,5,1,"1","","24\""],
  ["Red Corsairs Raiders","Hand flamer","T","D6",0,3,0,"1","ignorescover pistol torrent","12\""],
  ["Red Corsairs Raiders","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Red Corsairs Raiders","Power fist","C","3",3,8,2,"2","","càc"],
  ["Red Corsairs Raiders","Reaver's blade","C","4",3,5,1,"1","","càc"],
  ["Red Corsairs Reave-captain","Bolt pistol","T","1",2,5,1,"1","pistol","12\""],
  ["Red Corsairs Reave-captain","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Red Corsairs Reave-captain","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Red Corsairs Reave-captain","Power maul","C","5",2,5,2,"2","","càc"],
  ["Red Corsairs Reave-captain","Power sword","C","7",2,5,2,"1","sust:1","càc"],
  ["Renegade Enforcer","Autogun","T","1",3,3,0,"1","rf:1","24\""],
  ["Renegade Enforcer","Enforcer pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Renegade Enforcer","Lasgun","T","1",3,3,0,"1","rf:1","24\""],
  ["Renegade Enforcer","Shotgun","T","2",3,4,0,"1","assault","18\""],
  ["Renegade Enforcer","Enforcer melee weapon","C","4",3,4,0,"1","","càc"],
  ["Renegade Enforcer","Power fist","C","3",3,6,2,"2","","càc"],
  ["Renegade Enforcer","Power weapon","C","3",3,4,2,"1","","càc"],
  ["Renegade Heavy Weapons Squad","Autocannon","T","2",5,9,1,"3","heavy","48\""],
  ["Renegade Heavy Weapons Squad","Heavy bolter","T","3",5,5,1,"2","heavy sust:1","36\""],
  ["Renegade Heavy Weapons Squad","Heavy stubber","T","4",5,4,0,"1","heavy rf:3","36\""],
  ["Renegade Heavy Weapons Squad","Lascannon","T","1",5,12,3,"D6+1","heavy","48\""],
  ["Renegade Heavy Weapons Squad","Mortar","T","D6",5,5,0,"1","blast heavy indirect","48\""],
  ["Renegade Heavy Weapons Squad","Renegade firearm","T","1",4,3,0,"1","rf:1","24\""],
  ["Renegade Heavy Weapons Squad","➤ Missile launcher - frag","T","D6",5,4,0,"1","blast heavy","48\""],
  ["Renegade Heavy Weapons Squad","➤ Missile launcher - krak","T","1",5,9,2,"D6","blast","48\""],
  ["Renegade Heavy Weapons Squad","Close combat weapons","C","2",4,3,0,"1","","càc"],
  ["Renegade Ogryn Beast Handler","Befouled fangs and claws","C","2",3,5,0,"1","","càc"],
  ["Renegade Ogryn Beast Handler","Mauler goad and ripper claw","C","4",3,6,1,"2","","càc"],
  ["Renegade Ogryn Brutes","Ogryn power drill","C","3",3,10,2,"2","","càc"],
  ["Renegade Ogryn Brutes","Ogryn weapon","C","3",3,6,1,"2","","càc"],
  ["Renegade Plague Ogryns","Ogryn plague claws","C","3",3,6,1,"2","lethal","càc"],
  ["Rogue Psyker","Laspistol","T","1",4,3,0,"1","pistol","12\""],
  ["Rogue Psyker","➤ Psychic Strike - focused witchfire","T","D6+3",3,6,2,"2","blast dev hazardous psychic","12\""],
  ["Rogue Psyker","➤ Psychic Strike - witchfire","T","D6",3,6,2,"1","blast dev psychic","12\""],
  ["Rogue Psyker","Chaos stave","C","1",4,6,1,"D3","psychic","càc"],
  ["Sorcerer","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Sorcerer","➤ Infernal Gaze - focused witchfire","T","D6",3,6,2,"D3","dev hazardous psychic","24\""],
  ["Sorcerer","➤ Infernal Gaze - witchfire","T","D6",3,5,1,"D3","psychic","24\""],
  ["Sorcerer","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Sorcerer in Terminator Armour","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Sorcerer in Terminator Armour","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Sorcerer in Terminator Armour","➤ Infernal Gaze - focused witchfire","T","D6",3,6,2,"D3","dev hazardous psychic","24\""],
  ["Sorcerer in Terminator Armour","➤ Infernal Gaze - witchfire","T","D6",3,5,1,"D3","psychic","24\""],
  ["Sorcerer in Terminator Armour","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Sorcerer on Bike","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Sorcerer on Bike","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Sorcerer on Bike","Combi-weapon","T","1",2,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Sorcerer on Bike","➤ Infernal Gaze - focused witchfire","T","D6",3,6,2,"D3","dev hazardous psychic","24\""],
  ["Sorcerer on Bike","➤ Infernal Gaze - witchfire","T","D6",3,5,1,"D3","psychic","24\""],
  ["Sorcerer on Bike","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Sorcerer on Bike","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Sorcerer on Bike","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Sorcerer on Bike","Astartes chainsword","C","5",3,4,1,"1","","càc"],
  ["Sorcerer on Bike","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Sorcerer on Bike","Power fist","C","5",2,8,2,"2","","càc"],
  ["Sorcerer on Disc of Tzeentch","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Sorcerer on Disc of Tzeentch","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Sorcerer on Disc of Tzeentch","Combi-weapon","T","1",2,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Sorcerer on Disc of Tzeentch","➤ Infernal Gaze - focused witchfire","T","D6",3,6,2,"D3","dev hazardous psychic","24\""],
  ["Sorcerer on Disc of Tzeentch","➤ Infernal Gaze - witchfire","T","D6",3,5,1,"D3","psychic","24\""],
  ["Sorcerer on Disc of Tzeentch","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Sorcerer on Disc of Tzeentch","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Sorcerer on Disc of Tzeentch","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Sorcerer on Disc of Tzeentch","Astartes chainsword","C","5",3,4,1,"1","","càc"],
  ["Sorcerer on Disc of Tzeentch","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Sorcerer on Disc of Tzeentch","Power fist","C","5",2,8,2,"2","","càc"],
  ["Sorcerer on Palanquin of Nurgle","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Sorcerer on Palanquin of Nurgle","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Sorcerer on Palanquin of Nurgle","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Sorcerer on Palanquin of Nurgle","➤ Infernal Gaze - focused witchfire","T","D6",3,6,2,"D3","dev hazardous psychic","24\""],
  ["Sorcerer on Palanquin of Nurgle","➤ Infernal Gaze - witchfire","T","D6",3,5,1,"D3","psychic","24\""],
  ["Sorcerer on Palanquin of Nurgle","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Sorcerer on Palanquin of Nurgle","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Sorcerer on Palanquin of Nurgle","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Sorcerer on Palanquin of Nurgle","Astartes chainsword","C","5",3,4,1,"1","","càc"],
  ["Sorcerer on Palanquin of Nurgle","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Sorcerer on Palanquin of Nurgle","Nurgling's claws and teeth","C","4",5,2,0,"1","extra lethal","càc"],
  ["Sorcerer on Palanquin of Nurgle","Power fist","C","5",2,8,2,"2","","càc"],
  ["Sorcerer on Steed of Slaanesh","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Sorcerer on Steed of Slaanesh","Combi-bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Sorcerer on Steed of Slaanesh","Combi-weapon","T","1",2,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Sorcerer on Steed of Slaanesh","➤ Infernal Gaze - focused witchfire","T","D6",3,6,2,"D3","dev hazardous psychic","24\""],
  ["Sorcerer on Steed of Slaanesh","➤ Infernal Gaze - witchfire","T","D6",3,5,1,"D3","psychic","24\""],
  ["Sorcerer on Steed of Slaanesh","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Sorcerer on Steed of Slaanesh","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Sorcerer on Steed of Slaanesh","Accursed weapon","C","6",2,5,2,"1","","càc"],
  ["Sorcerer on Steed of Slaanesh","Astartes chainsword","C","5",3,4,1,"1","","càc"],
  ["Sorcerer on Steed of Slaanesh","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Sorcerer on Steed of Slaanesh","Lashing tongue","C","3",4,4,0,"1","extra lethal","càc"],
  ["Sorcerer on Steed of Slaanesh","Power fist","C","5",2,8,2,"2","","càc"],
  ["Traitor Enforcer","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Traitor Enforcer","Ogryn weapons","C","5",3,7,1,"2","","càc"],
  ["Traitor Enforcer","Power fist","C","3",3,6,2,"2","","càc"],
  ["Traitor Guardsmen Squad","Boltgun","T","1",4,4,0,"1","rf:1","24\""],
  ["Traitor Guardsmen Squad","Corrupted pistol","T","1",4,4,1,"1","pistol","12\""],
  ["Traitor Guardsmen Squad","Cultist sniper rifle","T","1",4,4,2,"2","heavy precision","36\""],
  ["Traitor Guardsmen Squad","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Traitor Guardsmen Squad","Lasgun","T","1",4,3,0,"1","rf:1","24\""],
  ["Traitor Guardsmen Squad","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Traitor Guardsmen Squad","➤ Cultist grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Traitor Guardsmen Squad","➤ Cultist grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Traitor Guardsmen Squad","➤ Plasma gun - standard","T","1",4,7,2,"1","rf:1","24\""],
  ["Traitor Guardsmen Squad","➤ Plasma gun - supercharge","T","1",4,8,3,"2","hazardous rf:1","24\""],
  ["Traitor Guardsmen Squad","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Traitor Guardsmen Squad","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Traitor Guardsmen Squad","Power weapon","C","2",4,4,2,"1","","càc"],
  ["Vashtorr the Arkifane","Vashtorr's claw","T","D6",0,5,2,"1","anti:4:veh torrent","12\""],
  ["Vashtorr the Arkifane","➤ Vashtorr's hammer - strike","C","6",2,14,3,"3","anti:4:veh dev","càc"],
  ["Vashtorr the Arkifane","➤ Vashtorr's hammer - sweep","C","12",2,8,1,"2","anti:4:veh dev","càc"],
  ["Venomcrawler","Excruciator cannon","T","6",3,6,1,"2","","36\""],
  ["Venomcrawler","Soulflayer tendrils and claws","C","6",3,6,1,"2","","càc"],
  ["Warp Talons","Warp claws","C","4",3,5,2,"1","twin","càc"],
  ["Warpsmith","Flamer tendril","T","D6",0,3,0,"1","ignorescover pistol torrent","12\""],
  ["Warpsmith","Melta tendril","T","1",2,8,4,"D3","melta:1 pistol","6\""],
  ["Warpsmith","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Warpsmith","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Warpsmith","Forge weapon","C","4",3,6,2,"2","anti:4:veh","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Abaddon the Despoiler","Epic Hero"],
  ["Accursed Cultists","Infanterie"],
  ["Chaos Bikers","Monté"],
  ["Chaos Deimos Predator","Véhicule"],
  ["Chaos Land Raider","Véhicule"],
  ["Chaos Lord","Personnage"],
  ["Chaos Lord in Terminator Armour","Personnage"],
  ["Chaos Lord on Bike","Personnage"],
  ["Chaos Lord on Disc of Tzeentch","Personnage"],
  ["Chaos Lord on Juggernaut","Personnage"],
  ["Chaos Lord on Palanquin of Nurgle","Personnage"],
  ["Chaos Lord on Steed of Slaanesh","Personnage"],
  ["Chaos Lord with Jump Pack","Personnage"],
  ["Chaos Predator Annihilator","Véhicule"],
  ["Chaos Predator Destructor","Véhicule"],
  ["Chaos Rhino","Véhicule"],
  ["Chaos Spawn","Bête"],
  ["Chaos Terminator Squad","Infanterie"],
  ["Chaos Vindicator","Véhicule"],
  ["Chosen","Infanterie"],
  ["Cultist Firebrand","Personnage"],
  ["Cultist Mob","Battleline"],
  ["Cultist Mob with Firearms","Battleline"],
  ["Cypher","Epic Hero"],
  ["Dark Apostle","Personnage"],
  ["Dark Commune","Personnage"],
  ["Defiler","Véhicule"],
  ["Exalted Champion","Personnage"],
  ["Fabius Bile","Epic Hero"],
  ["Fellgor Beastmen","Infanterie"],
  ["Forgefiend","Véhicule"],
  ["Gellerpox Infected","Infanterie"],
  ["Haarken Worldclaimer","Epic Hero"],
  ["Havocs","Infanterie"],
  ["Helbrute","Véhicule"],
  ["Heldrake","Véhicule"],
  ["Hell Blade","Véhicule"],
  ["Hell Talon","Véhicule"],
  ["Heretic Astartes Daemon Prince","Monstre"],
  ["Heretic Astartes Daemon Prince with wings","Monstre"],
  ["Huron Blackheart","Epic Hero"],
  ["Khorne Lord of Skulls","Véhicule"],
  ["Kravek Morne","Epic Hero"],
  ["Legionaries","Battleline"],
  ["Lord Discordant on Helstalker","Personnage"],
  ["Master of Executions","Personnage"],
  ["Master of Possession","Personnage"],
  ["Masters of the Maelstrom","Epic Hero"],
  ["Maulerfiend","Véhicule"],
  ["Mutilators","Infanterie"],
  ["Mutoid Vermin","Bête"],
  ["Negavolt Cultists","Infanterie"],
  ["Nemesis Claw","Infanterie"],
  ["Noctilith Crown","Fortification"],
  ["Obliterators","Infanterie"],
  ["Possessed","Infanterie"],
  ["Raptors","Infanterie"],
  ["Red Corsairs Raiders","Infanterie"],
  ["Red Corsairs Reave-captain","Personnage"],
  ["Renegade Enforcer","Personnage"],
  ["Renegade Heavy Weapons Squad","Infanterie"],
  ["Renegade Ogryn Beast Handler","Bête"],
  ["Renegade Ogryn Brutes","Infanterie"],
  ["Renegade Plague Ogryns","Infanterie"],
  ["Rogue Psyker","Personnage"],
  ["Sorcerer","Personnage"],
  ["Sorcerer in Terminator Armour","Personnage"],
  ["Sorcerer on Bike","Personnage"],
  ["Sorcerer on Disc of Tzeentch","Personnage"],
  ["Sorcerer on Palanquin of Nurgle","Personnage"],
  ["Sorcerer on Steed of Slaanesh","Personnage"],
  ["Traitor Enforcer","Personnage"],
  ["Traitor Guardsmen Squad","Infanterie"],
  ["Vashtorr the Arkifane","Epic Hero"],
  ["Venomcrawler","Véhicule"],
  ["Warp Talons","Infanterie"],
  ["Warpsmith","Personnage"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Abaddon the Despoiler": [
  "Chaos Terminator Squad",
  "Chosen"
 ],
 "Chaos Lord": [
  "Chosen",
  "Legionaries",
  "Nemesis Claw",
  "Red Corsairs Raiders"
 ],
 "Chaos Lord in Terminator Armour": [
  "Chaos Terminator Squad"
 ],
 "Chaos Lord on Bike": [
  "Chaos Bikers"
 ],
 "Chaos Lord on Disc of Tzeentch": [
  "Chosen",
  "Legionaries"
 ],
 "Chaos Lord on Juggernaut": [
  "Chaos Bikers"
 ],
 "Chaos Lord on Palanquin of Nurgle": [
  "Chosen",
  "Legionaries"
 ],
 "Chaos Lord on Steed of Slaanesh": [
  "Chaos Bikers"
 ],
 "Chaos Lord with Jump Pack": [
  "Raptors"
 ],
 "Cultist Firebrand": [
  "Accursed Cultists",
  "Cultist Mob",
  "Cultist Mob with Firearms",
  "Negavolt Cultists"
 ],
 "Dark Apostle": [
  "Accursed Cultists",
  "Chosen",
  "Cultist Mob",
  "Cultist Mob with Firearms",
  "Legionaries",
  "Negavolt Cultists",
  "Nemesis Claw",
  "Red Corsairs Raiders"
 ],
 "Dark Commune": [
  "Accursed Cultists",
  "Cultist Mob",
  "Cultist Mob with Firearms",
  "Negavolt Cultists"
 ],
 "Fabius Bile": [
  "Accursed Cultists",
  "Chosen",
  "Cultist Mob",
  "Cultist Mob with Firearms",
  "Legionaries",
  "Negavolt Cultists",
  "Red Corsairs Raiders"
 ],
 "Haarken Worldclaimer": [
  "Raptors"
 ],
 "Huron Blackheart": [
  "Chaos Terminator Squad",
  "Chosen",
  "Legionaries",
  "Red Corsairs Raiders"
 ],
 "Kravek Morne": [
  "Chaos Terminator Squad",
  "Mutilators",
  "Obliterators"
 ],
 "Master of Possession": [
  "Chosen",
  "Legionaries",
  "Nemesis Claw",
  "Possessed",
  "Red Corsairs Raiders"
 ],
 "Red Corsairs Reave-captain": [
  "Chosen",
  "Legionaries",
  "Nemesis Claw",
  "Red Corsairs Raiders"
 ],
 "Renegade Enforcer": [
  "Renegade Heavy Weapons Squad",
  "Traitor Guardsmen Squad"
 ],
 "Rogue Psyker": [
  "Accursed Cultists",
  "Cultist Mob",
  "Cultist Mob with Firearms",
  "Negavolt Cultists"
 ],
 "Sorcerer": [
  "Chosen",
  "Legionaries",
  "Nemesis Claw",
  "Red Corsairs Raiders"
 ],
 "Sorcerer in Terminator Armour": [
  "Chaos Terminator Squad"
 ],
 "Sorcerer on Bike": [
  "Chaos Bikers"
 ],
 "Sorcerer on Disc of Tzeentch": [
  "Chosen",
  "Legionaries"
 ],
 "Sorcerer on Palanquin of Nurgle": [
  "Chosen",
  "Legionaries"
 ],
 "Sorcerer on Steed of Slaanesh": [
  "Chaos Bikers"
 ],
 "Traitor Enforcer": [
  "Traitor Guardsmen Squad"
 ],
 "Warpsmith": [
  "Chosen",
  "Havocs",
  "Legionaries",
  "Nemesis Claw",
  "Red Corsairs Raiders"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Abaddon the Despoiler": [
  [
   "The Warmaster",
   "In your Command phase, select one Warmaster ability. Until the start of your next Command phase, this model has that ability."
  ],
  [
   "Dark Destiny",
   "Each time this model makes a Dark Pact and does not fail the resulting leadership roll, if the result of that roll was 7+, you gain 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units: CHAOS TERMINATOR SQUAD, CHOSEN"
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Haarken Worldclaimer": [
  [
   "Leader",
   "This model can be attached to the following units: RAPTORS"
  ],
  [
   "Head Taker",
   "While this model is leading a unit, each time this model’s unit ends a Charge move, select one enemy unit within Engagement Range of this model’s unit and roll one D6 for each model in this model’s unit which is within Engagement Range of that enemy unit: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Herald of the Apocalypse (Aura)",
   "While an enemy unit is within 6\" of this model, in the Battle-shock step of your opponent’s Command phase, if that enemy unit is below its Starting Strength, it must take a Battle-shock test. This ability cannot cause a unit to take two Battle-shock tests in the same phase."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Huron Blackheart": [
  [
   "Leader",
   "This model can be attached to the following units: CHAOS TERMINATOR SQUAD, CHOSEN, LEGIONARIES, RED CORSAIRS RAIDERS"
  ],
  [
   "Lord of Badab (Aura)",
   "While a friendly Heretic Astartes Infantry unit (excluding Battle-shocked units and Damned units) is within 6\" of this model, add 1 to the Objective Control characteristic of models in that unit."
  ],
  [
   "Hamadrya’s Knowledge (Psychic)",
   "Once per battle round, when an enemy unit ends a Normal, Advance or Fall Back move within 8\" of this model’s unit, if this model’s unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to D3+3\"."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Heretic Astartes Daemon Prince": [
  [
   "Dark Blessing (Aura)",
   "While a friendly HERETIC ASTARTES INFANTRY unit is within 6\" of this model, each time a ranged attack is allocated to a model in that unit, that model has the Benefit of Cover against that attack."
  ],
  [
   "Ascended Daemon",
   "Each time this model shoot or fights, while resolving those attacks, you can re-roll one Hit roll and you can re-roll one Wound roll."
  ],
  [
   "Lord of Chaos",
   "While this model is within 3\" of a friendly Heretic Astartes Infantry unit, this model has Lone Operative."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Heretic Astartes Daemon Prince with wings": [
  [
   "Flying Horror",
   "Each time this model ends a Normal or Advance move, select one enemy unit it moved over during that move. That unit must take a Battle-shock test."
  ],
  [
   "Daemonic Destruction",
   "Each time this model ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6 for each of this model’s remaining wounds: for each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds)."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Fabius Bile": [
  [
   "Enhanced Warriors",
   "If this unit is attached to a unit at the start of the battle, until the end of the battle, add 1 to the Strength characteristic of melee weapons equipped by Bodyguard models in that unit and add 1 to the Toughness characteristic of Bodyguard models in that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units: ACCURSED CULTISTS, CHOSEN, CULTIST MOB, CULTIST MOB WITH FIREARMS, LEGIONARIES, NEGAVOLT CULTISTS, RED CORSAIRS RAIDERS"
  ],
  [
   "Surgeon Acolyte",
   "Once per turn, when an attack is allocated to a model in this unit, if this unit contains Fabius Bile, you can change the Damage characteristic of that attack to 0."
  ],
  [
   "Chirurgeon",
   "The first time this unit’s Fabius Bile model is destroyed, at the end of the phase, roll one D6: on a 2+, set it back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy models, with its full wounds remaining."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Cypher": [
  [
   "Agent of Discord (Aura)",
   "Once per turn, when your opponent targets a unit from their army within 12” of this model with a stratagem, you can use this ability. If you do increase the CP cost of that use of that stratagem by 1CP."
  ],
  [
   "Guns Blazing",
   "Once per turn, in your opponent's Shooting phase, when an enemy unit makes a ranged attacks that targets a friendly HERETIC ASTARTES unit within 3\" of this model, after that enemy unit has shot, this model can shoot as if it were your Shooting phase, but it must target only that enemy unit when doing so and can only do so if that enemy unit is an eligible target."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Master of Possession": [
  [
   "Leader",
   "This model can be attached to the following units: CHOSEN, LEGIONARIES, NEMESIS CLAW, POSSESSED, RED CORSAIRS RAIDERS"
  ],
  [
   "Daemonkin (Psychic)",
   "While this model is leading a unit, add 1 to Advance and Charge rolls made for that unit."
  ],
  [
   "Sacrificial Dagger",
   "Once per phase, when this model is selected to shoot or fight, it can use this ability. If it does, this model’s unit suffers 1 mortal wound and, until the end of the phase, each time this model makes a Psychic Attack, add 1 to the Hit roll and add 1 to the Wound roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Lord": [
  [
   "Leader",
   "This model can be attached to the following units: CHOSEN, LEGIONARIES, NEMESIS CLAW, RED CORSAIRS RAIDERS"
  ],
  [
   "Chance for Glory",
   "Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, improve the Strength, Attacks, Armour Penetration and Damage characteristics of melee weapons equipped by this model by 1."
  ],
  [
   "Lord of Chaos",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Lord in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units: CHAOS TERMINATOR SQUAD"
  ],
  [
   "Formidably Resilient",
   "Each time an attack is allocated to this model, halve the Damage characteristic of that attack."
  ],
  [
   "Lord of Chaos",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Sorcerer": [
  [
   "Leader",
   "This model can be attached to the following units: CHOSEN, LEGIONARIES, NEMESIS CLAW, RED CORSAIRS RAIDERS"
  ],
  [
   "Prescience (Psychic)",
   "While this model is leading a unit, each time an attack targets that unit, subtract 1 from the Hit roll."
  ],
  [
   "Gift of Chaos (Psychic)",
   "Each time this model is selected to shoot or fight, after resolving its attacks, select one enemy unit hit by one or more of those attacks that had the [PSYCHIC] ability. That unit must take a Leadership test: if that test is failed, that unit suffers D3 mortal wounds."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Sorcerer in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units: CHAOS TERMINATOR SQUAD"
  ],
  [
   "Warptime (Psychic)",
   "While this model is leading a unit, you can re-roll Advance and Charge rolls made for that unit."
  ],
  [
   "Death Hex (Psychic)",
   "At the start of your Shooting phase, one PSYKER with this ability can use it. If it does, select one enemy unit within 12\" of and visible to that PSYKER and roll one D6: on a 1, that PSYKER's unit suffers D3 mortal wounds; on a 2+, until the start of your next Movement phase, each time an attack targets that enemy unit, improve the Armour Penetration  characteristic of that attack by 1."
  ],
  [
   "Chaos Familiar",
   "Once per battle, when an attack is allocated to the bearer, you can change the Damage characteristic to 0."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Lord Discordant on Helstalker": [
  [
   "Corrupt Machine Spirits",
   "At the start of your Shooting phase, select one visible enemy Vehicle unit within 12\" of this model and roll one D6: on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds.’"
  ],
  [
   "Spirit Thief",
   "At the start of your Shooting phase, select one visible enemy Vehicle unit. Until the end of the phase, each time a friendly Heretic Astartes model makes an attack that targets that unit, re-roll a Wound roll of 1."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Warpsmith": [
  [
   "Warpsmith",
   "While this model is within 3\" of one or more friendly Heretic Astartes Vehicle units, this model has the Lone Operative ability."
  ],
  [
   "Master of Mechanisms",
   "In your Command phase, select one friendly Heretic Astartes Vehicle model within 3\" of this model. That Vehicle model regains up to D3 lost wounds and, until the start of your next Command phase, each time that Vehicle makes an attack, add 1 to the Hit roll. Each model can only be selected for this ability once per Command phase."
  ],
  [
   "Enrage Machine Spirits",
   "At the end of your Movement phase, select one enemy Vehicle unit within 12\" of this model. That unit must take a Battle-shock test."
  ],
  [
   "Leader",
   "This model can be attached to the following units: CHOSEN, HAVOCS, LEGIONARIES, NEMESIS CLAW, RED CORSAIRS RAIDERS"
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Exalted Champion": [
  [
   "Support",
   "This model can be attached to the following units: CHOSEN,  LEGIONARIES"
  ],
  [
   "Dark Champion",
   "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll."
  ],
  [
   "Aspire to Glory",
   "Each time this model’s unit makes a Dark Pact, until the end of the phase, add D3 to the Strength characteristic of weapons equipped by this model."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Dark Apostle": [
  [
   "Leader",
   "This model can be attached to the following units: ACCURSED CULTISTS, CHOSEN, CULTIST MOB, CULTIST MOB WITH FIREARMS, LEGIONARIES, NEGAVOLT CULTISTS, NEMESIS CLAW, RED CORSAIRS RAIDERS"
  ],
  [
   "Dark Zealotry",
   "While this unit is leading a unit and contains a DARK APOSTLE model, each time a model in that unit makes a melee attack, add 1 to the Wound roll."
  ],
  [
   "Demagogue",
   "Once per battle, at the start of any phase, you can select one friendly HERETIC ASTARTES unit that is Battle-shocked and within 12\" of this unit’s DARK APOSTLE model. That unit is no longer Battle-shocked."
  ],
  [
   "Malign Sacrifice",
   "At the start of the Fight phase, if this unit contains one or more Dark Disciple models, you can select one of those models and one enemy unit within Engagement Range of this unit, then roll one D6: on a 2-5, that enemy unit suffers 1 mortal wound; on a 6, that enemy unit suffers D3 mortal wounds. That Dark Disciple model is then destroyed."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Dark Commune": [
  [
   "Leader",
   "This model can be attached to the following units: ACCURSED CULTISTS, CULTIST MOB, CULTIST MOB WITH FIREARMS, NEGAVOLT CULTISTS"
  ],
  [
   "Faithful Flock",
   "While this unit is leading a unit and contains a CULT DEMAGOGUE model, models in that unit have a 5+ invulnerable save."
  ],
  [
   "Dark Ritual",
   "Once per battle, in your Command phase, if this unit contains a CULT DEMAGOGUE model, it can use this ability. If it does, until the end of the turn, this unit can declare a charge in a turn in which it Advanced and each time a model in this unit makes an attack, add 1 to the Hit roll and add 1 to the Wound roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Chaos icon",
   "Each time the bearer’s unit takes a Leadership test for the Dark Pacts ability, you can re-roll that test."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Legionaries": [
  [
   "Veterans of the Long War",
   "Each time a model in this unit targets an enemy unit with a melee attack, re-roll a Wound roll of 1. If that enemy unit is within range of an objective marker, you can re-roll the Wound roll instead."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Chaos icon",
   "Each time the bearer’s unit takes a Leadership test for the Dark Pacts ability, you can re-roll that test."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Cultist Mob": [
  [
   "For the Dark Gods",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent's level of Control over that objective marker is greater than yours at the start or end of any phase."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Warp Stalker",
   "You can re-roll Advance and Charge rolls made for this model's unit."
  ],
  [
   "Unholy Speed",
   "Add 1 to Advance and Charge rolls made for this model's unit."
  ],
  [
   "Mutant Form",
   "Add 1 to this model's Wounds characteristic."
  ],
  [
   "Massive Fangs",
   "Melee weapons equipped by this model have the [LANCE] ability."
  ],
  [
   "Eightfold Eyes",
   "Once per turn, you can re-roll one Hit roll, one Wound roll, one Damage roll or one saving throw made for this model."
  ],
  [
   "Daemonic Flesh",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Scorpion Tail",
   "Add 1 to the Attacks characteristic of melee weapons equipped by this model."
  ],
  [
   "Iron-hard Talons",
   "Improve the Armour Penetration characteristic of melee weapons equipped by this model by 1."
  ],
  [
   "Dark Blessing",
   "Once per battle, at the start of your opponent's Shooting phase, this model can use this ability. If it does, until the end of the phase, this model's unit has the Stealth ability."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Accursed Cultists": [
  [
   "Howling Horde",
   "In your opponent's Shooting phase, when an enemy unit has shot, if a model from this unit was destroyed as a result of those attacks, this unit can make a surge move of up to D6\"."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Terminator Squad": [
  [
   "Despoilers",
   "Each time this unit makes a Dark Pact, until the end of the phase, each time a model in this unit makes an attack, you can re-roll the Hit roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Warp Stalker",
   "You can re-roll Advance and Charge rolls made for this model's unit."
  ],
  [
   "Unholy Speed",
   "Add 1 to Advance and Charge rolls made for this model's unit."
  ],
  [
   "Mutant Form",
   "Add 1 to this model's Wounds characteristic."
  ],
  [
   "Massive Fangs",
   "Melee weapons equipped by this model have the [LANCE] ability."
  ],
  [
   "Eightfold Eyes",
   "Once per turn, you can re-roll one Hit roll, one Wound roll, one Damage roll or one saving throw made for this model."
  ],
  [
   "Daemonic Flesh",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Scorpion Tail",
   "Add 1 to the Attacks characteristic of melee weapons equipped by this model."
  ],
  [
   "Iron-hard Talons",
   "Improve the Armour Penetration characteristic of melee weapons equipped by this model by 1."
  ],
  [
   "Dark Blessing",
   "Once per battle, at the start of your opponent's Shooting phase, this model can use this ability. If it does, until the end of the phase, this model's unit has the Stealth ability."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Master of Executions": [
  [
   "Support",
   "This model can be attached to the following units: CHOSEN, LEGIONARIES, NEMESIS CLAW, RED CORSAIRS RAIDERS"
  ],
  [
   "Warp-sighted Butcher",
   "While this model is leading a unit, each time a model in that unit makes a melee attack that targets a unit that is below its Starting Strength, you can re-roll the Hit roll. If that unit is Below Half-strength, you can re-roll the Wound roll as well."
  ],
  [
   "Trophy Taker",
   "Each time this model destroys an enemy CHARACTER model, you gain 1CP."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Possessed": [
  [
   "Unholy Bloodshed",
   "Once per battle, when this unit makes a Dark Pact, until the end of the phase, weapons equipped by models in this unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Chaos icon",
   "Each time the bearer’s unit takes a Leadership test for the Dark Pacts ability, you can re-roll that test."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chosen": [
  [
   "Chosen Marauders",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Chaos icon",
   "Each time the bearer’s unit takes a Leadership test for the Dark Pacts ability, you can re-roll that test."
  ],
  [
   "Warp Stalker",
   "You can re-roll Advance and Charge rolls made for this model's unit."
  ],
  [
   "Unholy Speed",
   "Add 1 to Advance and Charge rolls made for this model's unit."
  ],
  [
   "Mutant Form",
   "Add 1 to this model's Wounds characteristic."
  ],
  [
   "Massive Fangs",
   "Melee weapons equipped by this model have the [LANCE] ability."
  ],
  [
   "Eightfold Eyes",
   "Once per turn, you can re-roll one Hit roll, one Wound roll, one Damage roll or one saving throw made for this model."
  ],
  [
   "Daemonic Flesh",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Scorpion Tail",
   "Add 1 to the Attacks characteristic of melee weapons equipped by this model."
  ],
  [
   "Iron-hard Talons",
   "Improve the Armour Penetration characteristic of melee weapons equipped by this model by 1."
  ],
  [
   "Dark Blessing",
   "Once per battle, at the start of your opponent's Shooting phase, this model can use this ability. If it does, until the end of the phase, this model's unit has the Stealth ability."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Venomcrawler": [
  [
   "Soul Eater",
   "At the end of the Fight phase, if one or more attacks made by this model that phase destroyed one or more enemy units, until the end of the battle, add 1 to the Attacks characteristic of this model’s weapons."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Bikers": [
  [
   "Rapid Assault",
   "Each time a model in this unit makes a melee attack, if this unit made a Charge move this turn, improve the Strength characteristic of that attack by 1."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Chaos icon",
   "Each time the bearer’s unit takes a Leadership test for the Dark Pacts ability, you can re-roll that test."
  ],
  [
   "Warp Stalker",
   "You can re-roll Advance and Charge rolls made for this model's unit."
  ],
  [
   "Unholy Speed",
   "Add 1 to Advance and Charge rolls made for this model's unit."
  ],
  [
   "Mutant Form",
   "Add 1 to this model's Wounds characteristic."
  ],
  [
   "Massive Fangs",
   "Melee weapons equipped by this model have the [LANCE] ability."
  ],
  [
   "Eightfold Eyes",
   "Once per turn, you can re-roll one Hit roll, one Wound roll, one Damage roll or one saving throw made for this model."
  ],
  [
   "Daemonic Flesh",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Scorpion Tail",
   "Add 1 to the Attacks characteristic of melee weapons equipped by this model."
  ],
  [
   "Iron-hard Talons",
   "Improve the Armour Penetration characteristic of melee weapons equipped by this model by 1."
  ],
  [
   "Dark Blessing",
   "Once per battle, at the start of your opponent's Shooting phase, this model can use this ability. If it does, until the end of the phase, this model's unit has the Stealth ability."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Raptors": [
  [
   "Fearsome (Aura)",
   "While an enemy unit is within 6\" of this unit, each time that enemy unit takes a Battle-shock or Leadership test, subtract 1 from the result."
  ],
  [
   "Terrifying Assault",
   "At the start of the Fight phase, each enemy unit within Engagement Range of one or more units with this ability must take a Battle-shock test."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Warp Talons": [
  [
   "Warp Strike",
   "At the end of the Fight phase, if this unit destroyed one or more enemy units this phase and is not within Engagement Range of one or more enemy units, you can remove this unit from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Havocs": [
  [
   "Stabilisation Talons",
   "Each time a model in this unit makes an attack with a ranged weapon, you can ignore any or all modifiers to the Hit roll and any or all modifiers to the Ballistic Skill characteristic of that weapon."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Obliterators": [
  [
   "Warp Rift Firepower",
   "(Once per battle, per unit): In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this unit's ranged attacks have [INDIRECT FIRE]."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Noctilith Crown": [
  [
   "Malevolent Locus (Aura)",
   "While a friendly HERETIC ASTARTES unit is within 9\" of this Fortification, improve that unit's Leadership characteristic by 1."
  ],
  [
   "Malign Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Vashtorr the Arkifane": [
  [
   "Unholy Mechanisms (Aura)",
   "While a friendly Daemon Vehicle unit is within 6\" of this model, add 2 to the Strength characteristic of weapons equipped by models in that unit."
  ],
  [
   "Reorder Reality",
   "Each time an enemy unit within 18\" of this model targets this model, subtract 1 from the Hit roll and, until the end of the phase, that enemy unit’s ranged weapons have the [HAZARDOUS] ability."
  ],
  [
   "Indentured Daemon Engines",
   "While this model is within 3\" of one or more friendly Daemon Vehicle units, this model has the Lone Operative ability."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Traitor Guardsmen Squad": [
  [
   "Twisted Defence Force",
   "While this unit is within range of an objective, this unit has +1 Sv against ranged attacks."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Fellgor Beastmen": [
  [
   "Bestial Raiders",
   "If this unit begins the game in Strategic Reserves, it can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules. If this unit is in Strategic Reserves, for the purposes of setting it up on the battlefield, treat the current battle round number as being one higher than it actually is."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Traitor Enforcer": [
  [
   "Leader",
   "This unit can be attached to the following unit: TRAITOR GUARDSMAN SQUAD"
  ],
  [
   "Brutal Example",
   "Once per turn, while this unit is leading a unit and contains a TRAITOR ENFORCER model, you can target that unit with the Fire Overwatch Stratagem for 0CP, and can do so even if you have already targeted a different unit from your army with that Stratagem this phase. Each time you use this ability, one Bodyguard model in that unit is destroyed."
  ],
  [
   "Mutated Bodyguard",
   "While this unit contains a Traitor Ogryn model, CHARACTER models in this unit have the Feel No Pain 4+ ability."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Land Raider": [
  [
   "Assault Ramp",
   "Each time a unit disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Predator Annihilator": [
  [
   "Annihilator",
   "Each time a ranged attack made by this model is allocated to a Monster or Vehicle model, you can re-roll the Damage roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Predator Destructor": [
  [
   "Destructor",
   "Each time a ranged attack made by this model targets an enemy INFANTRY unit, improve the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Vindicator": [
  [
   "Siege Shield",
   "When making ranged attacks with its demolisher cannon, this model can target enemy units within Engagement Range of it (provided no other friendly units are also within Engagement Range of that enemy unit). In addition, when making ranged attacks, this model does not suffer the penalty to its Hit rolls for being within Engagement Range of one or more enemy units."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Forgefiend": [
  [
   "Daemonic Ordnance",
   "Each time this model is selected to shoot, it can use this ability. If it does, until the end of the phase, its ranged weapons have the [DEVASTATING WOUNDS] and [HAZARDOUS] abilities."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Helbrute": [
  [
   "Dark Ascension (Aura)",
   "While a friendly HERETIC ASTARTES unit is within 6\" of this model, each time that unit makes a Dark Pact, until the end of the phase, its weapons gain both abilities conferred by that pact (instead of only one)."
  ],
  [
   "Devoted to Destruction",
   "If this model is equipped with 2 melee weapons in addition to its close combat weapon, add 2 to the Attacks characteristics of those 2 weapons."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Heldrake": [
  [
   "Airborne Predator",
   "Each time this model makes an attack that targets a unit that can FLY, add 1 to the Hit roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Maulerfiend": [
  [
   "Siege Crawler",
   "You can ignore any or all modifiers to this model's Move characteristic and to Advance and Charge rolls made for it."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Rhino": [
  [
   "Self-repair",
   "At the start of your Command phase, this model regains 1 lost wound."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Khorne Lord of Skulls": [
  [
   "Plough Through the Enemy",
   "In the Fight phase, after this model has finished making its attacks, if this model destroyed one or more enemy units this phase, each enemy unit within 6\" of this model must take a Battle-shock test."
  ],
  [
   "Damaged: 1-8 wounds remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Spawn": [
  [
   "Mind-breaking Mutations (Aura)",
   "While an enemy unit (excluding VEHICLES) is within 3\" of this unit, subtract 1 from the Objective Control characteristic of models in that enemy unit."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Hell Talon": [
  [
   "Bomb Rack",
   "Each time this model ends a Normal move, you can select one enemy unit it moved across during that move and roll six D6: for each 3+, that unit suffers 1 mortal wound."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Hell Blade": [
  [
   "Interceptor",
   "Each time this model makes a ranged attack that targets a unit that can FLY, add 1 to the Hit roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Sorcerer on Disc of Tzeentch": [
  [
   "Leader",
   "This model can be attached to the following unit: CHOSEN, LEGIONARIES"
  ],
  [
   "Flames of Change (Psychic)",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [IGNORES COVER] ability."
  ],
  [
   "Altered Reality (Psychic)",
   "Once per battle round, after a Hit roll, a Wound roll or a saving throw is made for this model, you can change the result of that roll to a 6."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Sorcerer on Palanquin of Nurgle": [
  [
   "Leader",
   "This model can be attached to the following unit: CHOSEN, LEGIONARIES"
  ],
  [
   "Gift of Poxes (Psychic)",
   "While this model is leading a unit, weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Feculent Despair (Aura, Psychic)",
   "While an enemy unit is within 6\" of this model, each time that unit takes a Battle-shock test, subtract 1 from that test."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Lord on Palanquin of Nurgle": [
  [
   "Leader",
   "This model can be attached to the following unit: CHOSEN, LEGIONARIES"
  ],
  [
   "Revolting Regeneration",
   "At the start of your Command phase, this model regains up to D3 lost wounds."
  ],
  [
   "Lord of Chaos",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Lord on Disc of Tzeentch": [
  [
   "Leader",
   "This model can be attached to the following unit: CHOSEN, LEGIONARIES"
  ],
  [
   "Lord of Fate",
   "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability against mortal wounds."
  ],
  [
   "Lord of Chaos",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Lord on Juggernaut": [
  [
   "Leader",
   "This model can be attached to the following unit: CHAOS BIKERS"
  ],
  [
   "Bloody Stampede",
   "Each time this model’s unit ends a Charge move, select one enemy unit within Engagement Range of this model and roll one D6: on a 2-3, that enemy unit suffers 1 mortal wound; on a 4-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Lord of Chaos",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Lord on Steed of Slaanesh": [
  [
   "Leader",
   "This model can be attached to the following unit: CHAOS BIKERS"
  ],
  [
   "Cut Off Their Escape",
   "Each time an enemy unit (excluding MONSTERS and VEHICLES) within Engagement Range of this model’s unit is selected to Fall Back, models in that enemy unit must take Desperate Escape tests as if their unit was Battle-shocked. When doing so, if that enemy unit is also Battle-shocked by other means, subtract 1 from each of those Desperate Escape tests."
  ],
  [
   "Lord of Chaos",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Sorcerer on Steed of Slaanesh": [
  [
   "Leader",
   "This model can be attached to the following unit: CHAOS BIKERS"
  ],
  [
   "Infernal Speed",
   "While this model is leading a unit, change the Move characteristic of models in that unit to 14\"."
  ],
  [
   "Dark Favour (Psychic)",
   "While this model is leading a unit, models in that unit have a 4+ invulnerable save."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Gellerpox Infected": [
  [
   "Fearsome (Aura)",
   "While an enemy unit is within 6\" of this unit, each time that enemy unit takes a Battle-shock or Leadership test, subtract 1 from the result."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Mutoid Vermin": [
  [
   "Mischief Makers (Aura)",
   "While an enemy unit (excluding MONSTERS and VEHICLES) is within 6\" of this unit, each time a model in that unit makes a melee attack, subtract 1 from the Hit roll."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Renegade Enforcer": [
  [
   "Brutal Example",
   "While this model is leading a unit, you can target that unit with the Insane Bravery Stratagem for 0CP, and can do so even if another unit from your army has already been targeted with that Stratagem this phase. Each time you use this ability, one Bodyguard model in that unit is destroyed."
  ],
  [
   "Enforcer",
   "This model's unit is eligible to declare a charge in a turn in which it Fell Back."
  ],
  [
   "Leader",
   "This model can be attached to the following units: RENEGADE HEAVY WEAPONS SQUAD, TRAITOR GUARDSMEN SQUAD"
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Renegade Heavy Weapons Squad": [
  [
   "Covering Fire",
   "Each time you target this unit with the Fire Overwatch Stratagem, while resolving that Stratagem, hits are scored on unmodified Hit rolls of 5+."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Renegade Plague Ogryns": [
  [
   "Wall of Muscle",
   "Each time an attack is allocated to a model in this unit, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Mutilators": [
  [
   "Crushing Charge",
   "You can re-roll charge rolls made for this unit, and each time this unit makes a Charge move, select one enemy unit and roll one D6 for each model in this unit that is within Engagement Range of that unit: for each 4+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Renegade Ogryn Brutes": [
  [
   "Ogryn Combat Stimms",
   "Each time a model in this unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 4+, do not remove it from play; that destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Rogue Psyker": [
  [
   "Leader",
   "This model can be attached to the following units: ACCURSED CULTISTS, CULTIST MOB, CULTIST MOB WITH FIREARMS, NEGAVOLT CULTISTS"
  ],
  [
   "Cursed Wardings (Psychic)",
   "While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability against Psychic Attacks."
  ],
  [
   "Psychic Barrier (Psychic)",
   "At the start of your opponent’s Shooting phase, you can roll one D6: on a 1, this PSYKER’s unit suffers D3 mortal wounds; on a 2+, until the end of the phase, models in this PSYKER’s unit have a 4+ invulnerable save."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Negavolt Cultists": [
  [
   "Voltagheist Field",
   "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6 for each model in this unit: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Servants of the Abyss",
   "If a unit from your army with the Leader ability can be attached to a CULTIST MOB, it can be attached to this unit instead."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Sorcerer on Bike": [
  [
   "Leader",
   "This model can be attached to the following unit: CHAOS BIKERS"
  ],
  [
   "Prescience (Psychic)",
   "While this model is leading a unit, each time an attack targets that unit, subtract 1 from the Hit roll."
  ],
  [
   "Unholy Power",
   "Each time this model's unit makes a Dark Pact, until the end of the phase, each time this model makes a Psychic Attack, add 1 to the Wound roll."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Renegade Ogryn Beast Handler": [
  [
   "Beastmaster",
   "While this unit contains an Ogryn Pack Master model, you can re-roll Charge rolls made for this unit, and each time a Chaos Mauler Hound model in this unit makes an attack, re-roll a Hit roll of 1."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Lord on Bike": [
  [
   "Leader",
   "This model can be attached to the following unit: CHAOS BIKERS"
  ],
  [
   "Swift Assault",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [ASSAULT] ability."
  ],
  [
   "Lord of Chaos",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Deimos Predator": [
  [
   "Armoured Spearhead",
   "Each time this model makes an attack that targets an enemy unit, re-roll a Hit roll of 1 and, if that unit is within range of an objective marker you do not control, you can re-roll the Hit roll instead."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Chaos Lord with Jump Pack": [
  [
   "Leader",
   "This model can be attached to the following units: RAPTORS"
  ],
  [
   "Cruel Hunter",
   "While this model is leading a unit, each time that unit Piles In or Consolidates, each model in that unit can move up to 6\" instead of up to 3\"."
  ],
  [
   "Lord of Chaos",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Cultist Firebrand": [
  [
   "Fiery Faith",
   "While this model is leading a unit, you can re-roll Leadership tests taken for that unit."
  ],
  [
   "Cursed Flames",
   "In your Shooting phase, after this model has shot, select one enemy INFANTRY unit hit by one or more of those attacks. That unit must make a Battle-shock test."
  ],
  [
   "Leader",
   "This model can be attached to the following units: ACCURSED CULTISTS, CULTIST MOB, CULTIST MOB WITH FIREARMS, NEGAVOLT CULTISTS"
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Cultist Mob with Firearms": [
  [
   "For the Dark Gods",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent's level of Control over that objective marker is greater than yours at the start or end of any phase."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Nemesis Claw": [
  [
   "Visions of Suffering (Psychic)",
   "Each time a model in this unit makes an attack that targets an enemy unit that is below its Starting Strength, add 1 to the Hit roll. If that enemy unit is Below Half-strength, add 1 to the Wound roll as well."
  ],
  [
   "Attached Unit",
   "If a CHARACTER UNIT unit from your army with the Leader ability (excluding EPIC HEROES) can be attached to a LEGIONARIES unit, it can be attached to this unit instead."
  ],
  [
   "Voice eater",
   "Enemy units (excluding MONSTERS and VEHICLES) cannot be targeted with Stratagems while they are within Engagement Range of the bearer’s unit."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Masters of the Maelstrom": [
  [
   "Fleet Command",
   "After both players have deployed their armies, if this unit is on the battlefield (or any Transport it is embarked within is on the battlefield) select up to three Heretic Astartes units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Plunder",
   "Once per battle, after this unit ends a Normal move, you can select one visible enemy unit within 12\" of it and roll one D6: on a 2+, that enemy unit suffers D3+1 mortal wounds."
  ],
  [
   "Support",
   "This unit can be attached to the following units: CHOSEN, LEGIONARIES, RED CORSAIRS RAIDERS"
  ],
  [
   "Choice Samples",
   "While this unit's Garreon the Corpsemaster model is on the battlefield, in your Command phase, select one of the following: you can return one destroyed model (excluding Character models) to this unit, or, if one or more Heretic Astartes Infantry units from your army are below Starting Strength and within 3\" of this unit, you gain 1CP."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Red Corsairs Raiders": [
  [
   "Trophy Takers",
   "The first time this unit destroys an enemy unit, until the end of the battle, while this unit is not Battle-shocked, add 1 to the Objective Control characteristic of models in this unit."
  ],
  [
   "Attached Unit",
   "If a Character unit from your army with the Leader ability can be attached to a Legionaries unit, it can be attached to this unit instead."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Red Corsairs Reave-captain": [
  [
   "Brutal Raider",
   "Each time this model's unit ends a Charge move, until the end of the turn, add 1 to the Strength characteristic of melee weapons equipped by this model and improve the Armour Penetration characteristic of those weapons by 1."
  ],
  [
   "Raider's Due",
   "Each time this unit declares a Charge that targets one or more units that are within range of one or more objective markers, you can re-roll the Charge roll."
  ],
  [
   "Leader",
   "This model can be attached to the following units: CHOSEN, LEGIONARIES, NEMESIS CLAW, RED CORSAIRS RAIDERS"
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Defiler": [
  [
   "Scuttling Walker",
   "Each time this unit makes a Normal, Advance or Fall Back move, it can move through models (excluding Titanic models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed."
  ],
  [
   "Daemonforge",
   "Each time this unit makes a Dark Pact, until the end of the phase, each time this model makes an attack, re-roll a Wound roll of 1."
  ],
  [
   "Khorne",
   "Add 2 to the Strength characteristic of this model's hellforged weapons."
  ],
  [
   "Nurgle",
   "Add 1 to this model's Toughness characteristic."
  ],
  [
   "Slaanesh",
   "Add 2\" to this model's Move characteristic."
  ],
  [
   "Tzeentch",
   "Add 3 to the Attacks characteristic of this model's infernal cannon."
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ],
 "Kravek Morne": [
  [
   "Headlong Destruction",
   "Each time a model in this unit makes an attack that targets the closest eligible enemy unit, improve the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Architect of Ruin",
   "At the start of the battle, select one unit in your opponent’s army to be this model’s hated foe. Each time this model makes an attack that targets its hated foe, you can re-roll the Wound roll. Each time this model’s hated foe is destroyed, you can select a new unit from your opponent’s army to be its hated foe."
  ],
  [
   "Leader",
   "This model can be attached to the following units: CHAOS TERMINATOR SQUAD, MUTILATORS, OBLITERATORS"
  ],
  [
   "Dark Pacts",
   "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Cabal of Chaos",1,"","Empyric Wellspring","▪ In your Shooting phase, when a friendly HERETIC ASTARTES PSYKER unit (excluding DAEMON units) is selected to shoot, if that unit makes a Dark Pact, that unit’s ranged attacks have +1 S. ▪ In the Fight phase, when a friendly HERETIC ASTARTES DAEMON PRINCE/DAEMON PRINCE WITH WINGS unit (excluding KHORNE units) is selected to fight, if that unit makes a Dark Pact, that unit’s melee attacks have: ▪ +2 S. ▪ +1 AP.","",0,"","Disruption"],
  ["Chaos Cult",2,"","Desperate Devotion / KEYWORDS","Each time a DAMNED unit from your army with the Dark Pacts ability is selected to make a Normal or Advance move or declare a charge (excluding units that arrived from Reserves this turn), it can make a Desperate Pact (see below). If it does, until the end of the phase, add 2 to the Move characteristic of models in that unit and add 2 to Charge rolls made for that unit. Desperate Pacts Each time a unit makes a Desperate Pact, it must first take a Leadership test; if that test is failed, that unit suffers D3 mortal wounds before any effects of that Desperate Pact are resolved. TRAITOR GUARDSMEN SQUAD units from your army gain the BATTLELINE keyword.","",0,"","Priority Assets"],
  ["Creations of Bile",3,"","Experimental Augmentations","At the start of the battle, select which augmentations are active for Heretic Astartes Infantry models (excluding Damned models) from your army until the end of the battle. To do so, either select one from the list below, or randomly determine two by rolling two D6. If Fabius Bile is your WARLORD, when randomly determining your augmentations, you can re-roll one or both of the dice. Duplicated augmentations have no additional effect. Cholinergic Accelerants: Add 1 to the Attacks characteristic of melee weapons equipped by this model.Hyperadrenal Infusion: Add 2\" to the Move characteristic of this model.Paraneural Reactions: Improve the Weapon Skill characteristic of melee weapons equipped by this model by 1.Supracutaneous Chitination: Improve the Toughness characteristic of this model by 1.Macrotensile Sinews: Add 1 to the Strength characteristic of melee weapons equipped by this model.Ophthalmic Enhancement: Improve the Ballistic Skill characteristic of ranged weapons equipped by this model by 1.","",0,"","Take and Hold"],
  ["Cult of the Arkifane",2,"","Soul Forge Boons","Heretic Astartes Vehicle units from your army gain the Daemon keyword. Heretic Astartes Vehicle, Lord Discordant and Vashtorr the Arkifane units from your army gain the SOUL FORGE keyword. SOUL FORGE units from your army have a 5+ invulnerable save.","",0,"","Priority Assets"],
  ["Deceptors",2,"","Masters of Misdirection","In the Declare Battle Formations step, you can select a number of LEGIONARIES and CULTIST MOB units from your army: until the end of the battle, those units, and any CHARACTER units attached to them (excluding EPIC HEROES), have the Infiltrators ability. The maximum number of units you can select in this way depends on the battle size, as shown below. BATTLE SIZENUMBER OF UNITSLEGIONARIESCULTIST MOBSIncursion Up to 2 units Up to 2 units Strike ForceUp to 3 units Up to 3 units OnslaughtUp to 4 units Up to 4 units","",0,"","Disruption"],
  ["Devotees of Destruction",1,"","Rain of Ruin","Friendly HAVOCS/OBLITERATORS units’ ranged attacks have [HEAVY].","",0,"","Priority Assets"],
  ["Dread Talons",2,"","Terror Descends (Aura)","In the Battle-shock step of your opponent’s Command phase, if an enemy unit that is below its Starting Strength is within 12\" of one or more HERETIC ASTARTES units from your army, that enemy unit must take a Battle-shock test. Each time an enemy unit within 12\" of one or more HERETIC ASTARTES units from your army takes a Battle-shock test, subtract 1 from the result. Enemy units affected by this Detachment rule do not need to take any other Battle-shock tests in the same phase.","",0,"","Disruption"],
  ["Fellhammer Siege-Host",2,"","Iron Fortitude","Each time a ranged attack targets a HERETIC ASTARTES unit from your army (excluding DAMNED units), if the Strength characteristic of that attack is greater than the Toughness characteristic of that unit, subtract 1 from the Wound roll.","",0,"","Take and Hold"],
  ["Huron’s Marauders",3,"","Tyrannical Motivation","In your Command phase, select one of the following abilities. Until the start of your next Command phase, each Heretic Astartes Infantry unit from your army has that ability. At the start of each phase, if such a unit is visible to a friendly Huron Blackheart model, until the end of the phase, it has both of the following abilities. Huron’s Elite Hand-picked by Huron Blackheart himself, these warriors strive to retain his favour with feats of arms. Each time a model in this unit makes an attack, add 1 to the Hit roll. Mobile Marauders The Red Corsairs utilise a highly mobile form of warfare and, under Huron’s watch, are relentless in their aggression. This unit is eligible to shoot and declare a charge in a turn in which it Fell Back. Designer’s Note: If a unit is gaining eligibility to shoot and declare a charge in a turn in which it Fell Back as a result of being visible to Huron Blackheart, but after making a Fall Back move it is no longer visible to Huron Blackheart, that unit will not be eligible to shoot in your Shooting phase or to declare a charge in your Charge phase unless it is visible again at the start of the respective phase.","",0,"","Disruption"],
  ["Murdertalon Raiders",1,"Nightmare","Prey on the Weak","▪ Friendly HERETIC ASTARTES INFANTRY FLY units’ attacks that target a battle-shocked unit or a unit at or below half-strength can re-roll hit rolls of 1. ▪ When an enemy unit’s attacks target a friendly HERETIC ASTARTES INFANTRY FLY unit, if that enemy unit is battle-shocked or at or below half-strength, those attacks have -1 to hit rolls. This detachment has the NIGHTMARE tag and cannot be taken with another NIGHTMARE detachment.","",0,"","Reconnaissance"],
  ["Nightmare Hunt",2,"Nightmare","Terror Made Manifest","In the Battle-shock step of your opponent’s Command phase, if an enemy unit that is below its Starting Strength is within 12\" of one or more HERETIC ASTARTES units from your army, that enemy unit must take a Battle-shock test, subtracting 1 from the result. Enemy units affected by this Detachment rule do not need to take any other Battle-shock tests in the same phase. Each time a HERETIC ASTARTES model from your army makes an attack that targets a unit that is Below Half-strength, add 1 to the Hit roll. Each time an attack targets a HERETIC ASTARTES unit from your army, if the attacking model is Battle‐shocked, subtract 1 from the Hit roll. Each time a HERETIC ASTARTES model from your army makes an attack that targets a Battle‐shocked unit, add 1 to the Wound roll.","",0,"","Disruption"],
  ["Pactbound Zealots",3,"","Marks of Chaos","When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED. Each time a unit with one of these keywords gains a weapon ability as the result of a Dark Pact and does not fail the resulting Leadership test, until the end of the phase, that unit gains the associated ability below. UNITS THAT GAINED [LETHAL HITS] ▪ KHORNE: Each time a model in this unit makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit. ▪ TZEENTCH: Each time a model in this unit makes a ranged attack, an unmodified Hit roll of 5+ scores a Critical Hit. ▪ CHAOS UNDIVIDED: Each time a model in this unit makes an attack, re-roll a Hit roll of 1. UNITS THAT GAINED [SUSTAINED HITS 1] ▪ NURGLE: Each time a model in this unit makes a ranged attack, an unmodified Hit roll of 5+ scores a Critical Hit. ▪ SLAANESH: Each time a model in this unit makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit. ▪ CHAOS UNDIVIDED: Each time a model in this unit makes an attack, re-roll a Hit roll of 1. RESTRICTIONS ▪ You cannot select the KHORNE keyword for a Psyker unit. ▪ A Character/EPIC HERO unit can only be attached to a unit if both units share the same keyword from the list above. ▪ A unit can only embark within (or start the battle embarked within) a TRANSPORT if both of those units share the same keyword from the list above.","",0,"","Disruption"],
  ["Renegade Raiders",3,"","Raiders and Reavers","Ranged weapons equipped by HERETIC ASTARTES models from your army have the [ASSAULT] ability, and each time a HERETIC ASTARTES model from your army makes an attack that targets a unit within range of an objective marker, improve the Armour Penetration characteristic of that attack by 1.","",0,"","Priority Assets"],
  ["Renegade Warband",2,"","Slaves to None / Vendetta / Twisted Doctrine","HERETIC ASTARTES models from your army lose the Dark Pacts ability. Ranged weapons equipped by HERETIC ASTARTES models from your army have the [ASSAULT] ability. When mustering your army, you cannot use the Cults of the Dark Gods rule. At the start of your Command phase, select one unit from your opponent’s army. Until the start of your next Command phase, that enemy unit is your Vendetta target. Each time a HERETIC ASTARTES model from your army (excluding Damned models) makes an attack that targets your Vendetta target, you can re-roll the Hit roll. In your Movement phase, each time you set up or select a HERETIC ASTARTES unit (excluding Battle-shocked units) from your army to move, it can choose to Default to Doctrine. If it does, it must first take a Battle-shock test. Then, select one of the following: ▪ Until the end of the turn, this unit is eligible to shoot and declare a charge in a turn in which it Fell Back. ▪ Until the end of the turn, this unit is eligible to declare a charge in a turn in which it Advanced.","",0,"","Priority Assets"],
  ["Soulforged Warpack",2,"","Debt to the Soul Forge","Each time a HERETIC ASTARTES DAEMON VEHICLE unit from your army makes a Dark Pact, it can invoke its contract. If it does, subtract 1 from the resulting Leadership test when making that Dark Pact, and until the end of the phase: ▪ Each time a model in that unit makes a ranged attack, add 1 to the Wound roll. ▪ Add 2 to the Attacks characteristic of melee weapons equipped by models in that unit.","",0,"","Take and Hold"],
  ["Veterans of the Long War",2,"","Focus of Hatred","At the start of your Command phase, select one unit from your opponents army to be your focus of hatred. Until the start of your next Command phase, each time a HERETIC ASTARTES model from your army (excluding DAMNED models) makes an attack that targets your focus of hatred, you can re-roll the Hit roll.","",0,"","Take and Hold"],
  ["Warpstrike Champions",2,"","Warp Portals","At the end of your opponent’s turn, you can select a number of Heretic Astartes Terminator, Obliterators and Mutilators units from your army (excluding units that are within Engagement Range of one or more enemy units). The maximum number of units you can select depends on the battle size, as follows: BATTLE SIZENUMBER OF UNITSIncursionUp to 1 unitStrike ForceUp to 2 unitsOnslaughtUp to 3 units Once you have made your selections, remove those units from the battlefield and place them into Strategic Reserves.","",0,"","Disruption"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Conduit of Chaos",20,"Cabal of Chaos","This model’s melee attacks have [LANCE].",null],
  ["Touched by the Warp",10,"Cabal of Chaos","- This model has PSYKER. \n- This model’s weapons have [PSYCHIC].",null],
  ["Amulet of Tainted Vigour",20,"Chaos Cult","In your Command phase, you can return up to D3 destroyed DAMNED models (excluding CHARACTER models) to the bearer's unit.",null],
  ["Cultist’s Brand",30,"Chaos Cult","If every other model in the bearer's unit (excluding Dark Disciples) is DAMNED, you can re-roll Advance and Charge rolls made for the bearer's unit.",null],
  ["Incendiary Goad",25,"Chaos Cult","While the bearer's unit is below its Starting Strength, add 1 to the Strength characteristic of melee weapons equipped by DAMNED models in that unit, and while that unit is Below Half-Strength, add 1 to the Attacks characteristic of those weapons as well.",null],
  ["Warped Foresight",10,"Chaos Cult","While the bearer is leading a unit with the Scouts 6” ability, every model in the bearer’s unit has the Scouts 6” ability.",null],
  ["Helm of All-Seeing",25,"Creations of Bile","HERETIC ASTARTES INFANTRY model (excluding DAMNED models) only. Enemy units that are set up on the battlefield from Reserves cannot be set up within 12\" of the bearer.",null],
  ["Living Carapace",15,"Creations of Bile","CHAOS LORD model only. Add 1 to the bearer’s Wounds characteristic and the bearer has the Feel No Pain 5+ ability.",null],
  ["Prime Test Subject",35,"Creations of Bile","Heretic Astartes Infantry model (excluding Damned models) only. Add 1 to the Damage characteristic of melee weapons equipped by the bearer. Each time the bearer makes a melee attack, you can re-roll the Hit roll.",null],
  ["Surgical Precision",10,"Creations of Bile","HERETIC ASTARTES model (excluding DAMNED models) only. The bearer’s melee weapons have the [PRECISION] ability.",null],
  ["Crown of Worms",15,"Cult of the Arkifane","Add 3” to the range of the bearer’s Warpsmith, Master of Mechanisms and Enrage Machine Spirits abilities.",null],
  ["Cybinfernal Font",20,"Cult of the Arkifane","Models in the bearer’s unit have the Soul Forge keyword.",null],
  ["Mark of the Soul Forges",20,"Cult of the Arkifane","Each time the bearer makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit.",null],
  ["Wyredjinn",25,"Cult of the Arkifane","At the start of your Command phase, if the bearer is on the battlefield, roll one D6, adding 1 to the result if the bearer is within range of an objective marker you control: on a 4+, you gain 1CP.",null],
  ["Cursed Fang",10,"Deceptors","Improve the Armour Penetration characteristic of the bearer's melee weapons by 1, and the bearer's melee weapons have the [PRECISION] ability.",null],
  ["Falsehood",10,"Deceptors","In the Declare Battle Formations step, you can set up the bearer in Reserves instead of setting it up on the battlefield. If you do, in one of your Movement phases, you can select one model in a friendly LEGIONARIES or CHOSEN unit that has two or more models remaining and is on the battlefield (excluding Attached units).. The selected model is destroyed (ignoring any rules that are triggered when a model is destroyed) and the bearer is set up as close as possible to where that model was destroyed and only within Engagement Range of any units if the destroyed model was in Engagement Range of those units. The bearer now attaches to that unit as its Leader.",null],
  ["Shroud of Obfuscation",15,"Deceptors","The bearer has the Stealth and Lone Operative abilities.",null],
  ["Soul Link",5,"Deceptors","At the start of your Command phase, you can select one other HERETIC ASTARTES INFANTRY CHARACTER model from your army (excluding EPIC HEROES). Until the start of your next Command phase, the bearer gains the PSYKER keyword, and replace the bearer's datasheet abilities with the datasheet abilities of the CHARACTER you selected.",null],
  ["Eye of Oblivion",20,"Devotees of Destruction","When this unit is selected to shoot, select one enemy unit within 24\" of this unit. That enemy unit has +6\" detection range until this unit has shot.",null],
  ["Pact of Destruction",15,"Devotees of Destruction","- When this unit uses its Dark Pacts ability, this unit can re-roll Leadership rolls.\n- In your Shooting phase, when this unit has shot, if this unit used its Dark Pacts ability and if those attacks destroyed an enemy model, this unit heals 3 wounds.",null],
  ["Eater of Dread",15,"Dread Talons","At the start of your Command phase, if the bearer is on the battlefield, roll one D6, adding 1 to the result for each Battle-shocked enemy unit that is on the battlefield: on a 5+, you gain 1CP.",null],
  ["Night’s Shroud",10,"Dread Talons","Models in the bearer's unit have the Stealth ability.",null],
  ["Warp-Fuelled Thrusters",20,"Dread Talons","At the end of your opponent's turn, if the bearer's unit is not within Engagement Range of one or more enemy units, you can remove the bearer's unit from the battlefield and place it into Strategic Reserves.",null],
  ["Willbreaker",10,"Dread Talons","In the Fight phase, after the bearer has made its attacks, select one enemy unit hit by one or more of those attacks. That unit must take a Battle-shock test.",null],
  ["Bastion Plate",10,"Fellhammer Siege-Host","Once per battle round, when a saving throw is failed for the bearer's unit, you can change the Damage characteristic of that attack to 0.",null],
  ["Iron Artifice",10,"Fellhammer Siege-Host","The bearer's weapons have the [ANTI-VEHICLE 4+] and [ANTI-FORTIFICATION 4+] abilities.",null],
  ["Ironbound Enmity",15,"Fellhammer Siege-Host","Each time the bearer makes an attack while within range of an objective marker, add 1 to the Wound roll.",null],
  ["Warp Tracer",20,"Fellhammer Siege-Host","In your Shooting phase, after the bearer has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that enemy unit cannot have the Benefit of Cover.",null],
  ["Dread Reputation",25,"Huron’s Marauders","Each time the bearer’s unit is set up on the battlefield, each enemy unit within 6” of the bearer’s unit (or within 12” if the bearer’s unit was set up using the Deep Strike ability) takes a Battle-shock test.",null],
  ["Eager for Bloodshed",30,"Huron’s Marauders","The bearer has the Infiltrators ability.",null],
  ["Raid Leader",20,"Huron’s Marauders","Each time the bearer’s unit is set up after disembarking from a Transport that has made a Normal move this turn, the bearer’s unit is still eligible to declare a charge.",null],
  ["Voice of the Tyrant",25,"Huron’s Marauders","The bearer’s unit has both abilities from the Tyrannical Motivation Detachment rule.",null],
  ["Pact of Cursed Pinions",20,"Murdertalon Raiders","- This model has DAEMON. \n- This model’s melee attacks have +1 A.",null],
  ["Shadowcowl Talisman",20,"Murdertalon Raiders","This unit has 5+ InSv.",null],
  ["Greyveil Hex",25,"Nightmare Hunt","Models in the bearer's unit have the Stealth ability.\n\nWhile the bearer’s unit is within range of one or more objective markers you control, that unit can only be selected as the target of a ranged attack if the attacking model is within 18\".",null],
  ["Sorrowscent Vulture",35,"Nightmare Hunt","Models in the bearer’s unit have the Scouts 6\" ability.",null],
  ["Terrorglut Parasite",20,"Nightmare Hunt","At the start of the Fight phase, each enemy unit within Engagement Range of the bearer must take a Battle-shock test, subtracting 1 from the result.",null],
  ["Warp-Fuelled Thrusters",20,"Nightmare Hunt","At the end of your opponent's turn, if the bearer's unit is not within Engagement Range of one or more enemy units, you can remove the bearer's unit from the battlefield and place it into Strategic Reserves.",null],
  ["Eye of Tzeentch",15,"Pactbound Zealots","Each time the bearer’s unit makes a Dark Pact and does not fail the resulting Leadership test, if the result of that test was 8 or more, you gain 1CP.",null],
  ["Intoxicating Elixir",15,"Pactbound Zealots","The bearer has the Feel No Pain 5+ ability. Each time the bearer shoots or fights, if the bearer’s unit made a Dark Pact this phase and did not fail the resulting Leadership test, after the bearer has resolved those attacks, select one enemy unit that was hit by one or more of those attacks; that enemy unit must take a Battle-shock test.",null],
  ["Orbs of Unlife",15,"Pactbound Zealots","At the end of the Fight phase, roll one D6 for every enemy unit within 3\" of the bearer, adding 1 to the result if the bearer’s unit made a Dark Pact that phase and did not fail the resulting Leadership test: on a 4+, that enemy unit suffers D3 mortal wounds.",null],
  ["Talisman of Burning Blood",15,"Pactbound Zealots","Add 1 to the Attacks and Strength characteristics of the bearer’s melee weapons. Each time the bearer’s unit makes a Dark Pact and does not fail the resulting Leadership test, roll one D3; until the end of the phase, add the result to the Attacks and Strength characteristics of the bearer’s melee weapons instead.",null],
  ["Despot’s Claim",15,"Renegade Raiders","At the start of your Command phase, if the bearer is on the battlefield, roll one D6, adding one to the result if the bearer is wholly within 12\" of your opponent's deployment zone; on a 5+, you gain 1CP.",null],
  ["Dread Reaver",15,"Renegade Raiders","Each time the bearer makes a melee attack, if the bearer is wholly within 12\" of your opponent's deployment zone, you can re-roll the Hit roll and you can re-roll the Wound roll.",null],
  ["Mark of the Hound",25,"Renegade Raiders","Models in the bearer's unit have the Scouts 6\" ability.",null],
  ["Tyrant’s Lash",20,"Renegade Raiders","You can re-roll Advance rolls made for the bearer's unit, and the bearer's unit is eligible to shoot in a turn in which it Fell Back.",null],
  ["Empyric Symbiote",15,"Renegade Warband","Add 1 to Advance and Charge rolls made for the bearer’s unit.",null],
  ["Eyes of the Hunter",15,"Renegade Warband","Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability.",null],
  ["Fratricidal Trophies",5,"Renegade Warband","In a turn in which the bearer’s unit chose to Default to Doctrine, until the end of the turn, each time a model in this unit makes an attack, you can re-roll the Hit roll.",null],
  ["Weaponised Hatred",35,"Renegade Warband","Once per battle round, after your Vendetta target is destroyed, if the bearer is on the battlefield, you can select one enemy unit visible to the bearer. That enemy unit becomes your Vendetta target until you select a new one.",null],
  ["Forge’s Blessing",20,"Soulforged Warpack","In your Command phase, select one friendly HERETIC ASTARTES VEHICLE unit within 12\" of the bearer. Until the start of your next Command phase, that unit has the Feel No Pain 6+ ability.",null],
  ["Invigorated Mechatendrils",15,"Soulforged Warpack","Add 4\" to the bearer's Move characteristic.",null],
  ["Soul Harvester",15,"Soulforged Warpack","While the bearer is on the battlefield, each time an enemy unit within 12\" of the bearer is destroyed, roll one D6; on a 5+, you gain 1CP.",null],
  ["Tempting Addendum",40,"Soulforged Warpack","Each time a HERETIC ASTARTES DAEMON VEHICLE from your army invokes its contract while within 3\" of the bearer:\n- If it suffers one or more mortal wounds as a result of that Dark Pact, add 1 to the number of mortal wounds it suffers.\n- Until the end of the phase, each time a model in that unit makes an attack, you can re-roll the Hit roll.",null],
  ["Eager for Vengeance",20,"Veterans of the Long War","The bearer’s unit is eligible to shoot and declare a charge in a turn in which it Fell Back. Each time a model in the bearer’s unit makes an attack that targets your focus of hatred, if the bearer’s unit Fell Back this turn, add 1 to the Hit roll, and each time you select your focus of hatred as a target of that unit’s charge, add 1 to the Charge roll.",null],
  ["Eye of Abaddon",15,"Veterans of the Long War","While the bearer is on the battlefield, each time your focus of hatred is destroyed, roll one D6; on a 4+, you gain 1CP.",null],
  ["Mark of Legend",10,"Veterans of the Long War","Once per turn, you can re-roll one Hit roll, one Wound roll or one saving throw made for the bearer.",null],
  ["Warmaster’s Gift",15,"Veterans of the Long War","Each time the bearer makes an attack that targets your focus of hatred, an unmodified successful wound roll of 5+ scores a Critical Wound.",null],
  ["Akshur’s Binding Runes",20,"Warpstrike Champions","The bearer’s unit can be set up using the Deep Strike ability in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules.",null],
  ["Eye of the Warp",15,"Warpstrike Champions","Each time the bearer’s unit is set up on the battlefield, until the end of the turn, you can re-roll Charge rolls made for that unit.",null],
  ["Infernal Fulgurite",20,"Warpstrike Champions","Once per battle, you can target the bearer’s unit with the Rapid Ingress Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this phase.",null],
  ["Tzagulla",25,"Warpstrike Champions","Improve the Attacks, Strength and Armour Penetration characteristics of the bearer’s weapons by 1. In addition, each time the bearer’s unit is set up on the battlefield from Reserves, until the end of the turn, improve the Damage characteristic of the bearer’s weapons by 1.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Fleshy Curse","Cabal of Chaos","",1,"Start of your Shooting phase.","One friendly HERETIC ASTARTES PSYKER unit.","Select one visible enemy unit within 12\" of your unit. Roll one D6: ▪ On a 1, that enemy unit suffers 1 mortal wound. ▪ On a 2-4, that enemy unit suffers D3 mortal wounds. ▪ On a 5-6, that enemy unit suffers 2D3 mortal wounds. These mortal wounds are inflicted by a psychic attack.",""],
  ["Infernal Vigour","Cabal of Chaos","",1,"Your Command phase.","One friendly HERETIC ASTARTES PSYKER/DAEMON unit (excluding KHORNE units).","Your unit heals D3+1 wounds.",""],
  ["Wreathed in Warpflame","Cabal of Chaos","",1,"Your Shooting phase, when a friendly HERETIC ASTARTES PSYKER unit is selected to shoot.","That HERETIC ASTARTES PSYKER unit.","Your unit’s ranged attacks have [IGNORES COVER].",""],
  ["Chosen for Glory","Chaos Cult","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One DAMNED unit from your army that has not been selected to shoot or fight this phase.","Your unit can make a Desperate Pact. If it does, until the end of the phase, each time a model in your unit makes an attack, you can re-roll the Hit roll, and if your unit did not fail the resulting Leadership test when making that Desperate Pact, you can re-roll the Wound roll as well.",""],
  ["Crazed Focus","Chaos Cult","Tactique de Bataille",1,"Your Shooting phase.","One DAMNED unit from your army that has not been selected to shoot this phase.","Your unit can make a Desperate Pact. If it does, until the end of the phase, each time a model in your unit makes an attack, improve the Armour Penetration characteristic of that attack by 1, and if your unit did not fail the resulting Leadership test when making that Desperate Pact, improve the Strength characteristic of that attack by 1 as well.",""],
  ["Infernal Sacrifice","Chaos Cult","Tactique de Bataille",1,"Fight phase.","One DAMNED unit from your army that has not been selected to fight this phase.","Your unit can make a Desperate Pact. If it does, your unit suffers D3 mortal wounds (in addition to any suffered for failing the resulting Leadership test), and until the end of the phase, add 1 to the Attacks characteristic of the melee weapons equipped by models in your unit, and if your unit did not fail the resulting Leadership test when making that Desperate Pact, until the end of the phase, improve the Strength characteristic of those weapons by 1 as well.",""],
  ["Mortal Thralls","Chaos Cult","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected ts targets.","One HERETIC ASTARTES unit from your army that was selected as the target of one or more of the attacking units attacks, and one friendly DAMNED unit within 3\" of your unit and visible to both your unit and the attacking unit.","Until the end of the phase, while your DAMNED unit is on the battlefield, each time your opponent would make a Wound roll for an attack that targets your HERETIC ASTARTES unit, if your DAMNED unit is visible to the attacking model and is an eligible target for that attack, no roll is made; instead, your DAMNED unit suffers a number of mortal wounds equal to the Damage characteristic of that attack.",""],
  ["Reckless Haste","Chaos Cult","Ruse Stratégique",1,"Your Charge phase","One DAMNED unit from your army.","Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Selfless Demise","Chaos Cult","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One DAMNED unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has resolved all of its attacks, each time a model in your unit is destroyed, roll one D6 on a 6, the attacking unit suffers 1 mortal wound after all of its attacks have been resolved.",""],
  ["Autostimulants","Creations of Bile","Ruse Stratégique",1,"Start of your Charge phase.","One Heretic Astartes Infantry unit from your army.","Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Delayed Mutations","Creations of Bile","Ruse Stratégique",2,"Your Command phase.","One Heretic Astartes Infantry unit (excluding Damned units) from your army.","Your unit suffers D3 mortal wounds. Then select one augmentation (see Experimental Augmentations). Until the start of your next Command phase, models in your unit have the selected augmentation in addition to any other augmentations they have.",""],
  ["Diabolic Regeneration","Creations of Bile","Ruse Stratégique",1,"Your Command phase.","One Heretic Astartes Infantry unit (excluding Damned units) from your army.","One destroyed model (excluding Character models) is returned to your unit. If your unit is a Battleline unit, D3 destroyed models (excluding CHARACTER models) are returned to your unit instead.",""],
  ["Masters Are Watching","Creations of Bile","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Heretic Astartes Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, subtracting 1 from the result if it is a Damned unit: on a 4+, do not remove it from play. That destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Monstrous Visages","Creations of Bile","Ruse Stratégique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Heretic Astartes Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Specimens for the Spider","Creations of Bile","Ruse Stratégique",2,"Fight phase.","One Heretic Astartes Infantry unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes a melee attack that targets a CHARACTER unit, you can re-roll the Wound roll. After your unit has fought, if one or more enemy CHARACTER models were destroyed as a result of those attacks, select one enemy unit within 6\" of your unit. That enemy unit must take a Battle-shock test. If the enemy WARLORD was destroyed as a result of those attacks, each enemy unit within 6\" of your unit must take a Battle-shock test instead.",""],
  ["Balefire Boon","Cult of the Arkifane","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Soul Forge unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, improve the Armour Penetration characteristic of that attack by 1.",""],
  ["Biomechanoid Regeneration","Cult of the Arkifane","Fait Épique",1,"Your Command phase.","One HERETIC ASTARTES unit from your army (excluding Damned units).","One model in your unit regains up to D3 lost wounds. If your unit has the Soul Forge keyword, one model in your unit regains up to 3 lost wounds instead.",""],
  ["Forge-Fire Surge","Cult of the Arkifane","Ruse Stratégique",1,"Your Movement phase, just after a HERETIC ASTARTES unit from your army Advances.","That HERETIC ASTARTES unit.","Until the end of the turn, your unit is eligible to shoot in a turn in which it Advanced. If your unit has the Soul Forge keyword, until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced instead.",""],
  ["Soul-Tally Offering","Cult of the Arkifane","Tactique de Bataille",2,"Your Shooting phase or the Fight phase.","One Soul Forge unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a CHARACTER, MONSTER or VEHICLE unit, you can re-roll the Wound roll.",""],
  ["Touch of the Arkifane","Cult of the Arkifane","Tactique de Bataille",1,"Any phase.","One HERETIC ASTARTES unit from your army (excluding Damned units) that has not been selected to shoot or fight this phase.","Until the end of the phase, if your unit is selected to make a Dark Pact, you can select both abilities for that unit’s weapons to gain.",""],
  ["Unholy Fortitude","Cult of the Arkifane","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Soul Forge unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, add 1 to the Toughness characteristic of models in your unit.",""],
  ["Coils of Deception","Deceptors","Ruse Stratégique",1,"Your Movement phase, just after a HERETIC ASTARTES unit from your army Falls Back.","That HERETIC ASTARTES unit.","Until the end of the turn, your unit is eligible to shoot in a turn in which it Fell Back",""],
  ["Detonator","Deceptors","Équipement",1,"Any phase, just after an enemy model with the Deadly Demise ability (excluding TITANIC models) is destroyed","One HERETIC ASTARTES CHARACTER unit from your army that was within 18\" of that enemy model when it was destroyed.","Your opponent does not roll to determine whether mortal wounds are inflicted by their model’s Deadly Demise ability. Instead, mortal wounds are automatically inflicted (if that ability inflicts a random number of mortal wounds, your opponent rolls to determine that number as normal).",""],
  ["From All Sides","Deceptors","Tactique de Bataille",1,"Start of your Charge phase.","One HERETIC ASTARTES unit from your army.","Until the end of the phase, add 1 to Charge rolls made for your unit for each other HERETIC ASTARTES unit from your army that made a Charge move this phase (to a maximum of +3)",""],
  ["Pick Them Off","Deceptors","Tactique de Bataille",1,"Your Shooting phase.","One HERETIC ASTARTES unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a unit that is below its Starting Strength, you can re-roll the Hit roll. If the target is Below Half-strength, you can re-roll the Wound roll as well.",""],
  ["Relentless Pursuit","Deceptors","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One HERETIC ASTARTES INFANTRY or HERETIC ASTARTES MOUNTED unit from your army that is within 8\" of that enemy unit and not within Engagement Range of one or more enemy units.","Your unit can make a Normal move of up to 6\".",""],
  ["Scrambled Coordinates","Deceptors","Ruse Stratégique",1,"Start of the Reinforcements step of your opponent’s Movement phase.","One HERETIC ASTARTES unit from your army.","Until the end of the phase, enemy units that are set up on the battlefield from Reserves cannot be set up within 12\" horizontally of your unit.",""],
  ["Ruination’s Bounty","Devotees of Destruction","",1,"Your Shooting phase, when a friendly HAVOCS/OBLITERATORS unit is selected to shoot.","That HAVOCS/OBLITERATORS unit.","When your unit uses the Dark Pacts ability, your unit’s ranged attacks have: ▪ [LETHAL HITS]. ▪ [SUSTAINED HITS 1].",""],
  ["Snare of Fire","Devotees of Destruction","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged HAVOCS unit.","That HAVOCS unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Undying Hatred","Devotees of Destruction","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly HAVOCS/OBLITERATORS unit.","That HAVOCS/OBLITERATORS unit.","Attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Bloody Example","Dread Talons","Fait Épique",1,"Fight phase, just after a HERETIC ASTARTES unit from your army destroys a CHARACTER unit.","That HERETIC ASTARTES unit.","Each enemy unit within 12\" of and visible to your unit must take a Battle-shock test.",""],
  ["Depthless Cruelty","Dread Talons","Tactique de Bataille",1,"Fight phase","One HERETIC ASTARTES INFANTRY unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a unit that is Battle-shocked and/or Below Half-strength, improve the Armour Penetration characteristic of that attack by 1.",""],
  ["Merciless Pursuit","Dread Talons","Ruse Stratégique",1,"End of your opponent’s Movement phase.","One HERETIC ASTARTES INFANTRY unit from your army that is not within Engagement range of one or more enemy units.","Select one enemy unit that Fell Back this turn and is within 6\" of your unit. Your unit can declare a charge as if it were your Charge phase. When doing so, you can only select that enemy unit as the target of that charge (and only if it is an eligible target). Note that even if this charge is successful, your unit does not receive any Charge bonus this turn.",""],
  ["Pitiless Hunters","Dread Talons","Tactique de Bataille",1,"Your Shooting phase.","One HERETIC ASTARTES INFANTRY unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a unit that is Battle-shocked and/or Below Half-strength, you can re-roll the Hit roll and you can re-roll the Wound roll.",""],
  ["Relentless Terror","Dread Talons","Ruse Stratégique",1,"Your Movement phase, just after a HERETIC ASTARTES INFANTRY unit from your army Falls Back.","That HERETIC ASTARTES INFANTRY unit.","Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Fell Back.",""],
  ["Screaming Descent","Dread Talons","Ruse Stratégique",1,"Reinforcements step of your Movement phase, from the second battle round onwards.","One HERETIC ASTARTES JUMP PACK unit from your army that is in Reserves.","Set your unit up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units, but until the end of the turn, it is not eligible to declare a charge. Then select one enemy INFANTRY or MOUNTED unit within 9\" of and visible to your unit: that unit must take a Battle-shock test.",""],
  ["Brutal Attrition","Fellhammer Siege-Host","Fait Épique",1,"Fight phase, just after an enemy unit has selected its targets.","One HERETIC ASTARTES INFANTRY unit from your army (excluding DAMNED units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a melee attack is allocated to your unit, after the attacking unit has finished making its attacks, roll one D6 (to maximum of six D6 per attacking unit): for each 4+, the attacking unit suffers 1 mortal wound.",""],
  ["Persistent Assailants","Fellhammer Siege-Host","Tactique de Bataille",1,"Fight phase.","One HERETIC ASTARTES unit from your army that was selected as the target of one or more attacks this phase and has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, you can re-roll the Hit roll, and if your unit is Below Half-strength you can re-roll the Wound roll as well.",""],
  ["Pitiless Cannonade","Fellhammer Siege-Host","Tactique de Bataille",1,"Your Shooting phase.","One HERETIC ASTARTES unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a unit that is Below Half-strength, a successful unmodified Hit roll of 5+ scores a Critical Hit",""],
  ["Point-Blank Destruction","Fellhammer Siege-Host","Tactique de Bataille",1,"Your Shooting phase","One HERETIC ASTARTES unit from your army that is within Engagement Range of one or more enemy units and has not been selected to shoot this phase.","Until the end of the phase, your unit’s ranged weapons (excluding Blast weapons) have the [PISTOL] ability.",""],
  ["Siegecraft","Fellhammer Siege-Host","Ruse Stratégique",1,"Start of your opponents Charge phase.","One HERETIC ASTARTES unit from your army.","Until the end of the phase, each time an enemy unit selects your unit as a target of a charge, subtract 2 from the Charge roll (this is not cumulative with any other negative modifiers to that Charge roll).",""],
  ["Steadfast Determination","Fellhammer Siege-Host","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One HERETIC ASTARTES unit from your army (excluding DAMNED units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 5+ ability.",""],
  ["At the Tyrant’s Command","Huron’s Marauders","Ruse Stratégique",1,"Your Movement phase.","One HERETIC ASTARTES unit (excluding Monsters and Vehicles) from your army.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced.",""],
  ["Encircling Surge","Huron’s Marauders","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One HERETIC ASTARTES unit (excluding Monsters and Vehicles) from your army that is within 6\" of one or more battlefield edges and not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Hardened Killers","Huron’s Marauders","Tactique de Bataille",1,"Your Command phase.","One Damned unit from your army.","Select one of the following effects: ▪ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1. ▪ Improve the Attacks characteristic of Rapid Fire weapons equipped by models in this unit by 1. ▪ Improve the Save characteristic of models in this unit by 1. Until the start of your next turn, your unit has the benefit of that effect.",""],
  ["Reavers’ Flurry","Huron’s Marauders","Tactique de Bataille",1,"Your Fight phase.","One HERETIC ASTARTES unit from your army that made a Charge move this turn.","Until the end of the phase, add 1 to the Attacks characteristics of melee weapons equipped by models in your unit.",""],
  ["Seize the Prize","Huron’s Marauders","Tactique de Bataille",1,"Your Movement phase, just after a HERETIC ASTARTES unit (excluding Monsters and Vehicles) from your army has been selected to Advance.","That HERETIC ASTARTES unit.","Do not make an Advance roll for your unit. Instead, until the end of the phase add 6\" to the Move characteristic of models in your unit.",""],
  ["To the Favoured the Spoils","Huron’s Marauders","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One HERETIC ASTARTES unit from your army that lost one or more wounds as a result of those attacks.","Your unit can make a surge move of up to D6\".",""],
  ["Plunging Talons","Murdertalon Raiders","",1,"Fight phase, when a friendly HERETIC ASTARTES INFANTRY FLY unit that made a charge move this turn is selected to fight.","That HERETIC ASTARTES INFANTRY FLY unit.","Your unit’s melee attacks have [LANCE].",""],
  ["Raking Pass","Murdertalon Raiders","",1,"Your Movement phase, when a friendly HERETIC ASTARTES INFANTRY FLY unit is selected to make a fall-back move.","That HERETIC ASTARTES INFANTRY FLY unit.","That move does not prevent your unit from being eligible to declare a charge.",""],
  ["Warp-Twisted Terrors","Murdertalon Raiders","",1,"Your Movement phase, when a friendly WARP TALONS unit ends a move.","That WARP TALONS unit.","Select one visible enemy unit (excluding MONSTER/VEHICLE units) within 9\" of your unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll.",""],
  ["Horrific Incursion","Nightmare Hunt","",1,"Your Movement phase.","One HERETIC ASTARTES unit from your army that arrived from Reserves this turn.","Select one enemy unit (excluding MONSTER and VEHICLE units) within 12\" of and visible to your unit: that unit must take a Battle-shock test, subtracting 1 from the result.",""],
  ["Malicious Surge","Nightmare Hunt","",1,"Your Charge phase.","One Heretic Astartes Infantry unit from your army.","Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Prey on the Weak","Nightmare Hunt","",1,"Your Shooting phase or the Fight phase.","One Heretic Astartes Infantry unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a unit that is Battle-shocked and/or Below Half-strength, you can re-roll the Hit roll.",""],
  ["Relentless Terror","Nightmare Hunt","",1,"Your Movement phase, just after a Heretic Astartes Infantry unit from your army Falls Back.","That HERETIC ASTARTES unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Sadistic Display","Nightmare Hunt","",1,"Fight phase, just after a HERETIC ASTARTES unit from your army destroys an enemy unit.","That HERETIC ASTARTES unit.","Each enemy unit within 6\" of and visible to your unit (excluding MONSTER and VEHICLE units) must take a Battle-shock test.",""],
  ["Talons Sunk Deep","Nightmare Hunt","",1,"Your Shooting phase or the Fight phase.","One Heretic Astartes Infantry unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a unit that is Battle-shocked and/or Below Half-strength, improve the Armour Penetration characteristic of that attack by 1.",""],
  ["Eternal Hate","Pactbound Zealots","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One HERETIC ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 to the result if it is a Khorne unit: on a 4+, do not remove it from play. That destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play.",""],
  ["Eye of the Gods","Pactbound Zealots","Fait Épique",1,"Fight phase, just after a HERETIC ASTARTES CHARACTER unit from your army (excluding DAMNED, DAEMON and EPIC HERO units) destroys a enemy unit.","One HERETIC ASTARTES CHARACTER model in that unit.","Until the end of the battle, add 1 to the Move, Toughness and Wounds characteristics of that CHARACTER model, and add 1 to the Attacks. Strength and Damage characteristics of that CHARACTER model’s melee weapons.",""],
  ["Festering Miasma","Pactbound Zealots","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One HERETIC ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit has the Stealth ability. In addition, if your unit is a Nurgle unit, it can only be selected as the target of a ranged attack if the attacking model is within 18\".",""],
  ["Profane Zeal","Pactbound Zealots","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Heretic Astartes Chaos Undivided unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, you can re-roll the Wound roll.",""],
  ["Skinshift","Pactbound Zealots","Fait Épique",1,"Your Command phase.","One HERETIC ASTARTES unit from your army.","One model in your unit regains up to 3 lost wounds. In addition, if your unit is a Tzeentch unit below its Starting Strength, one destroyed model (excluding Character models) is returned to your unit with its full wounds remaining.",""],
  ["Torpefying Refrain","Pactbound Zealots","Ruse Stratégique",1,"Your Movement phase.","One HERETIC ASTARTES unit from your army.","Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Fell Back. If your unit is a Slaanesh unit, until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back.",""],
  ["Opportunistic Raiders","Renegade Raiders","Ruse Stratégique",1,"End of the Fight phase","One HERETIC ASTARTES unit from your army that was eligible to fight this phase.","If your unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\", or up to 12\" if it is a MOUNTED unit. Otherwise, your unit can make a Fall Back move. It cannot embark within a TRANSPORT at the end of this move if it disembarked from a TRANSPORT this turn.",""],
  ["Reavers’ Haste","Renegade Raiders","Ruse Stratégique",1,"Your Charge phase.","One HERETIC ASTARTES INFANTRY or HERETIC ASTARTES MOUNTED unit from your army.","Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced. If you select one or more units within range of an objective marker as a target of that charge, add 1 to the Charge roll.",""],
  ["Ruinous Raid","Renegade Raiders","Tactique de Bataille",1,"Your Shooting phase or your Fight phase","One HERETIC ASTARTES unit from your army that disembarked from a TRANSPORT this turn and has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, if the target of that attack is within range of an objective marker, you can re-roll the Hit roll and you can re-roll the Wound roll.",""],
  ["Scour and Seize","Renegade Raiders","Tactique de Bataille",1,"Fight phase.","One HERETIC ASTARTES unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a unit within range of an objective marker, that attack has the [PRECISION] ability.",""],
  ["Unfailingly Obdurate","Renegade Raiders","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One HERETIC ASTARTES unit from your army (excluding DAMNED units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Warpcharged Engines","Renegade Raiders","Équipement",1,"Your Movement phase.","One HERETIC ASTARTES TRANSPORT or HERETIC ASTARTES MOUNTED unit from your army that has not been selected to move this phase.","Until the end of the phase, if your unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in your unit.",""],
  ["Corrupted Munitions","Renegade Warband","Tactique de Bataille",1,"Your Shooting phase.","One HERETIC ASTARTES unit in your army that has just been selected to shoot.","Until the end of the phase, each time a model in this unit makes a ranged attack, improve the Armour Penetration of that attack by 1.",""],
  ["Never Outgunned","Renegade Warband","Fait Épique",1,"Your Shooting phase or the Fight phase.","One HERETIC ASTARTES unit from your army that has just been selected to shoot or fight.","Select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until the end of the phase, weapons equipped by models in your unit have the selected ability.",""],
  ["Reavers’ Reaction","Renegade Warband","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One HERETIC ASTARTES unit (excluding Monsters and Vehicles) from your army that was hit by one or more of those attacks.","Your unit can make a Normal move of up to D6\".",""],
  ["Renegade Claim","Renegade Warband","Ruse Stratégique",1,"Your Movement phase","One HERETIC ASTARTES unit from your army within range of an objective marker you control.","That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Undying Hatred","Renegade Warband","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One HERETIC ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6: on a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Vengeful Destruction","Renegade Warband","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Heretic Astartes Infantry (excluding Damned units) or Heretic Astartes Mounted unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time your unit makes an attack that targets your Vendetta target, add 1 to the Wound roll.",""],
  ["Daemonic Possession","Soulforged Warpack","Fait Épique",1,"Your Command phase.","One HERETIC ASTARTES VEHICLE unit from your army (excluding Daemon units).","Until the end of the battle, your unit has the DAEMON keyword.",""],
  ["Desperate Pledge","Soulforged Warpack","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One HERETIC ASTARTES DAEMON VEHICLE unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, if your unit invokes its contract, each time it makes an attack, improve the Armour Penetration characteristic of that attack by 1.",""],
  ["Feeding Frenzy","Soulforged Warpack","Ruse Stratégique",1,"Your opponent’s Movement phase, when an enemy unit (excluding MONSTER and VEHICLES) is selected to Fall Back.","One HERETIC ASTARTES DAEMON VEHICLE or Vashtorr the Arkifane unit from your army that is within Engagement Range of that enemy unit.","Until the end of the phase, each time an enemy unit (excluding MONSTERS and VEHICLES) that is within Engagement Range of your unit Falls Back, all models in that enemy unit must take a Desperate Escape test. When doing so, of that enemy unit is Battle-shocked, substract 1 from each of those tests.",""],
  ["Glut of Souls","Soulforged Warpack","Ruse Stratégique",1,"Fight phase.","One HERETIC ASTARTES DAEMON VEHICLE unit from your army (excluding Titanic units) that has not been selected to fight this phase.","Until the end of the phase, if your unit invokes its contract, each time it makes an attack that destroys an enemy model, roll one D6: on 5+, your unit regains 1 lost wound after all of its attacks have been resolved (to a maximum of 6 wound).",""],
  ["Predatory Pursuit","Soulforged Warpack","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall back move.","One HERETIC ASTARTES DAEMON VEHICLE or Vashtorr the Arkifane unit from your army that is within 8\" of that enemy unit and not within Engagement Range of one or more enemy units.","Your unit can make a Normal move of up to 6\", but must end that move as close as possible to that enemy unit.",""],
  ["Unstoppable Rampage","Soulforged Warpack","Ruse Stratégique",1,"Your Movement phase or Charge phase.","One HERETIC ASTARTES DAEMON VEHICLE or Vashtorr the Arkifane unit from your army that has not been selected to move or charge this phase.","Until the end of the phase, each time your unit makes Normal, Advance or charge move, it can move horizontally through terrain features as if they were not there.",""],
  ["Black Crusade","Veterans of the Long War","Ruse Stratégique",1,"Your Movement phase","One HERETIC ASTARTES INFANTRY unit or HERETIC ASTARTES MOUNTED unit from your army (excluding DAMNED units).","Until the end of the turn, your unit is eligible to shoot in a turn in which it Advanced or Fell Back, and bolt pistols, boltguns and combi-bolters equipped by models in your unit have the [DEVASTATING WOUNDS] ability while your unit has not already inflicted 6 wounds this turn using that ability.",""],
  ["Bringers of Despair","Veterans of the Long War","Fait Épique",1,"Fight phase.","One HERETIC ASTARTES unit from your army (excluding DAMNED units) that is within Engagement Range of your focus of hatred.","Until the end of the phase, your unit has the Fights First ability.",""],
  ["Contemptuous Disregard","Veterans of the Long War","Tactique de Bataille",1,"Your opponents Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One HERETIC ASTARTES unit from your army (excluding DAMNED units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Endless Ire","Veterans of the Long War","Fait Épique",2,"Any phase, just after your focus of hatred is destroyed.","One HERETIC ASTARTES CHARACTER unit from your army (excluding DAMNED units)","Select one enemy unit within 12\" of and visible to your unit. Until the start of your next Command phase, that enemy unit is considered to be your focus of hatred.",""],
  ["Let the Galaxy Burn","Veterans of the Long War","Tactique de Bataille",1,"Your Shooting phase.","One HERETIC ASTARTES unit from your army (excluding TZEENTCH units) that has not been selected to shoot this phase","Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability, and change the Attacks characteristic of Torrent weapons equipped by models in your unit to 6.",""],
  ["Millennia of Experience","Veterans of the Long War","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One HERETIC ASTARTES INFANTRY or HERETIC ASTARTES MOUNTED unit from your army (excluding DAMNED units) that is within 8\" of that enemy unit and not within Engagement Range of one or more enemy units.","Your unit can make a Normal move of up to 6\".",""],
  ["Armour of Corruption","Warpstrike Champions","Ruse Stratégique",2,"Fight phase, just after an enemy unit has selected its targets.","One Heretic Astartes Terminator, Obliterators or Mutilators unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the turn, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.","You cannot target the same unit with the Armour of Corruption and Empyric Dislocation Stratagems in the same phase."],
  ["Empyric Dislocation","Warpstrike Champions","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One HERETIC ASTARTES unit from your army (excluding Damned units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.","You cannot target the same unit with the Empyric Dislocation and Armour of Corruption Stratagems in the same phase."],
  ["Portal of Spite","Warpstrike Champions","Tactique de Bataille",1,"Your Charge phase.","One HERETIC ASTARTES unit from your army that was set up using the Deep Strike ability this turn and has not declared a charge this phase.","Your unit has +2 to charge rolls.",""],
  ["Siegebreaker Strike","Warpstrike Champions","Ruse Stratégique",1,"Your Shooting phase.","Up to two HERETIC ASTARTES units from your army that were set up using the Deep Strike ability this turn and have not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your units have the [IGNORES COVER] ability.",""],
  ["Warp Flicker","Warpstrike Champions","Ruse Stratégique",1,"Your Movement phase.","One Heretic Astartes Terminator, Obliterators or Mutilators unit from your army.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced.",""],
  ["Warp-Tainted","Warpstrike Champions","Ruse Stratégique",1,"Your Movement phase.","One Heretic Astartes Terminator, Obliterators or Mutilators unit from your army, within range of an objective marker you control.","That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
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
  "Chaos Deimos Predator",
  "Chaos Land Raider",
  "Chaos Predator Annihilator",
  "Chaos Predator Destructor",
  "Chaos Rhino",
  "Chaos Vindicator",
  "Defiler",
  "Forgefiend",
  "Helbrute",
  "Heldrake",
  "Hell Blade",
  "Hell Talon",
  "Khorne Lord of Skulls",
  "Maulerfiend",
  "Venomcrawler"
 ],
 "monster": [
  "Heretic Astartes Daemon Prince",
  "Heretic Astartes Daemon Prince with wings"
 ],
 "battleline": [
  "Cultist Mob",
  "Cultist Mob with Firearms",
  "Legionaries"
 ],
 "epic": [
  "Abaddon the Despoiler",
  "Cypher",
  "Fabius Bile",
  "Haarken Worldclaimer",
  "Huron Blackheart",
  "Kravek Morne",
  "Masters of the Maelstrom",
  "Vashtorr the Arkifane"
 ],
 "infantry": [
  "Accursed Cultists",
  "Chaos Terminator Squad",
  "Chosen",
  "Fellgor Beastmen",
  "Gellerpox Infected",
  "Havocs",
  "Mutilators",
  "Negavolt Cultists",
  "Nemesis Claw",
  "Obliterators",
  "Possessed",
  "Raptors",
  "Red Corsairs Raiders",
  "Renegade Heavy Weapons Squad",
  "Renegade Ogryn Brutes",
  "Renegade Plague Ogryns",
  "Traitor Guardsmen Squad",
  "Warp Talons"
 ],
 "character": [
  "Chaos Lord",
  "Chaos Lord in Terminator Armour",
  "Chaos Lord on Bike",
  "Chaos Lord on Disc of Tzeentch",
  "Chaos Lord on Juggernaut",
  "Chaos Lord on Palanquin of Nurgle",
  "Chaos Lord on Steed of Slaanesh",
  "Chaos Lord with Jump Pack",
  "Cultist Firebrand",
  "Dark Apostle",
  "Dark Commune",
  "Exalted Champion",
  "Lord Discordant on Helstalker",
  "Master of Executions",
  "Master of Possession",
  "Red Corsairs Reave-captain",
  "Renegade Enforcer",
  "Rogue Psyker",
  "Sorcerer",
  "Sorcerer in Terminator Armour",
  "Sorcerer on Bike",
  "Sorcerer on Disc of Tzeentch",
  "Sorcerer on Palanquin of Nurgle",
  "Sorcerer on Steed of Slaanesh",
  "Traitor Enforcer",
  "Warpsmith"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Abaddon the Despoiler": "60",
 "Haarken Worldclaimer": "40",
 "Huron Blackheart": "50",
 "Heretic Astartes Daemon Prince": "60",
 "Heretic Astartes Daemon Prince with wings": "60",
 "Fabius Bile": "40",
 "Cypher": "32",
 "Master of Possession": "40",
 "Chaos Lord": "40",
 "Chaos Lord in Terminator Armour": "40",
 "Sorcerer": "40",
 "Sorcerer in Terminator Armour": "40",
 "Lord Discordant on Helstalker": "120x92",
 "Warpsmith": "60x35.5",
 "Dark Apostle": "40",
 "Dark Commune": "32",
 "Legionaries": "32",
 "Cultist Mob": "25",
 "Accursed Cultists": "40",
 "Chaos Terminator Squad": "40",
 "Master of Executions": "40",
 "Possessed": "40",
 "Chosen": "32",
 "Venomcrawler": "100",
 "Chaos Bikers": "75x42",
 "Raptors": "32",
 "Warp Talons": "32",
 "Havocs": "40",
 "Obliterators": "50",
 "Noctilith Crown": "coque",
 "Vashtorr the Arkifane": "80",
 "Traitor Guardsmen Squad": "25",
 "Fellgor Beastmen": "32",
 "Traitor Enforcer": "32",
 "Chaos Land Raider": "coque",
 "Chaos Predator Annihilator": "coque",
 "Chaos Predator Destructor": "coque",
 "Chaos Vindicator": "coque",
 "Forgefiend": "120x92",
 "Helbrute": "60",
 "Heldrake": "120x92",
 "Maulerfiend": "120x92",
 "Chaos Rhino": "coque",
 "Khorne Lord of Skulls": "coque",
 "Chaos Spawn": "50",
 "Mutilators": "50",
 "Chaos Lord with Jump Pack": "40",
 "Cultist Firebrand": "32",
 "Nemesis Claw": "32",
 "Masters of the Maelstrom": "40",
 "Red Corsairs Raiders": "40",
 "Red Corsairs Reave-captain": "32",
 "Defiler": "160",
 "Kravek Morne": "50"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Chaos Land Raider": 5,
 "Khorne Lord of Skulls": 8,
 "Hell Talon": 5
};

const TRANSPORTS = {
 "Chaos Land Raider": "This model has a transport capacity of 12 ^^**Heretic Astartes Infantry**^^ (excluding ^^**Obliterator^^** and ^^**Jump Pack^^** models). Each ^^**Possessed, Mutilators^^** and ^^**Terminator^^** model takes up the space of 2 models.",
 "Chaos Rhino": "This model has a transport capacity of 12 ^^**Heretic Astartes Infantry**^^ models. It cannot transport ^^**Terminator, Jump Pack, Mutilators, Obliterators**^^ or ^^**Possessed**^^ models.",
 "Renegade Heavy Weapons Squad": "For the purposes of embarking within TRANSPORTS, each Renegade Heavy Weapons Team model counts as two models.",
 "Renegade Plague Ogryns": "For the purposes of embarking within TRANSPORTS, each Renegade Plague Ogryn model counts as one TERMINATOR model.",
 "Renegade Ogryn Brutes": "For the purposes of embarking within TRANSPORTS, each Renegade Ogryn Brute model counts as one TERMINATOR model."
};
const FACTION = [
 [
  "Dark Pacts",
  "If your Army Faction is Heretic Astartes, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of the Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase:\n■ [LETHAL HITS]\n■ [SUSTAINED HITS 1]"
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/csm.json —
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
  cle : "csm",
  nom : "Space Marines du Chaos",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
