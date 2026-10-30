/* ============================================================
   Données Death Guard — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py deathguard

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 56 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     35 fiches sur 40 en ont un. Les autres — des Legends, que le
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
  ["Beasts of Nurgle",6,9,6,5,7,[1, 2],{"1": 70, "2": 140},0,"",0,"",3,"7+"],
  ["Biologus Putrifier",5,6,3,0,4,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Blightlord Terminators",5,7,2,4,3,[3, 5, 10],[[1, {"3": 115, "5": 185, "10": 370}], [3, {"3": 145, "5": 215, "10": 400}]],0,"",0,"",1,"6+"],
  ["Chaos Land Raider",10,12,2,0,16,[1],[[1, {"1": 220}], [3, {"1": 240}]],0,"",0,"",5,"6+"],
  ["Chaos Predator Annihilator",10,10,3,0,11,[1],[[1, {"1": 130}], [3, {"1": 140}]],0,"",0,"",3,"6+"],
  ["Chaos Predator Destructor",10,10,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Chaos Rhino",12,9,3,0,10,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"6+"],
  ["Chaos Spawn",8,7,4,0,4,[2],{"2": 80},0,"",0,"",1,"7+"],
  ["Daemon Prince of Nurgle",8,12,2,4,10,[1],{"1": 185},0,"",0,"",3,"6+"],
  ["Daemon Prince of Nurgle with wings",12,11,2,4,10,[1],{"1": 160},0,"",0,"",3,"6+"],
  ["Death Guard Chaos Lord",5,5,3,4,5,[1],{"1": 65},0,"Meneur",1,"",1,"6+"],
  ["Death Guard Chaos Lord in Terminator Armour",4,6,2,4,6,[1],{"1": 85},0,"Meneur",1,"",1,"6+"],
  ["Death Guard Cultists",6,3,6,0,1,[10, 20],{"10": 50, "20": 100},0,"",1,"",1,"7+"],
  ["Death Guard Possessed",9,6,3,5,3,[5, 10],{"5": 155, "10": 310},0,"",1,"",1,"6+"],
  ["Death Guard Sorcerer in Terminator Armour",4,6,2,4,5,[1],{"1": 70},0,"Meneur",1,"",1,"6+"],
  ["Deathshroud Terminators",5,7,2,4,4,[3, 6],[[1, {"3": 150, "6": 305}], [3, {"3": 160, "6": 315}]],0,"",0,"",1,"6+"],
  ["Defiler",12,11,3,5,18,[1],[[1, {"1": 300}], [2, {"1": 350}]],0,"",0,"",5,"6+"],
  ["Foetid Bloat-drone",10,9,3,5,10,[1],[[1, {"1": 100}], [3, {"1": 110}]],0,"",0,"",3,"6+"],
  ["Foetid Bloat-drone with heavy blight launcher",10,9,3,5,10,[1],[[1, {"1": 125}], [3, {"1": 135}]],0,"",0,"",3,"6+"],
  ["Foul Blightspawn",5,6,3,0,4,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Great Unclean One",7,12,5,4,20,[1],[[1, {"1": 265}], [3, {"1": 280}]],0,"",0,"",5,"6+"],
  ["Helbrute",7,9,2,0,8,[1],{"1": 105},0,"",0,"",3,"6+"],
  ["Icon Bearer",5,6,3,0,4,[1],{"1": 45},0,"Meneur",0,"",1,"5+"],
  ["Lord of Contagion",5,7,2,4,6,[1],{"1": 110},0,"Meneur",0,"",1,"6+"],
  ["Lord of Poxes",5,6,3,4,5,[1],{"1": 65},0,"Meneur",0,"",1,"6+"],
  ["Lord of Virulence",5,7,2,4,6,[1],{"1": 90},0,"Meneur",0,"",1,"6+"],
  ["Malignant Plaguecaster",5,6,3,0,4,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Miasmic Malignifier",0,10,3,0,12,[1],{"1": 105},0,"",0,"",0,"6+"],
  ["Mortarion",10,12,2,4,16,[1],{"1": 375},0,"",0,"",6,"5+"],
  ["Noxious Blightbringer",5,6,3,0,4,[1],{"1": 50},0,"Meneur",0,"",1,"6+"],
  ["Nurglings",5,3,7,5,4,[3, 6],{"3": 45, "6": 90},0,"",0,"",0,"8+"],
  ["Plague Drones",10,8,6,5,5,[3, 6],{"3": 110, "6": 220},0,"",0,"",2,"7+"],
  ["Plague Marines",5,6,3,0,2,[5, 7, 10],{"5": 90, "7": 125, "10": 175},0,"",0,"",2,"6+"],
  ["Plague Surgeon",5,6,3,0,4,[1],{"1": 50},0,"Meneur",0,"",1,"6+"],
  ["Plaguebearers",5,5,7,5,2,[10],{"10": 115},0,"",0,"",2,"7+"],
  ["Plagueburst Crawler",10,10,2,5,12,[1],[[1, {"1": 170}], [3, {"1": 200}]],0,"",0,"",3,"6+"],
  ["Poxwalkers",5,4,7,0,1,[10, 20],{"10": 65, "20": 130},0,"",0,"",1,"8+"],
  ["Rotigus",7,12,5,4,22,[1],{"1": 280},0,"",0,"",5,"6+"],
  ["Tallyman",5,6,3,0,4,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Typhus",5,7,2,4,6,[1],{"1": 90},0,"Meneur",0,"",1,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Beasts of Nurgle","Putrid appendages","C","6",4,6,1,"2","dev","càc"],
  ["Biologus Putrifier","Hyper blight grenades","T","D6",3,7,1,"2","assault blast lethal","12\""],
  ["Biologus Putrifier","Injector pistol","T","1",3,4,1,"3","anti:2:inf pistol precision","3\""],
  ["Biologus Putrifier","Plague knives","C","4",3,5,1,"1","lethal","càc"],
  ["Blightlord Terminators","Blight launcher","T","D3",3,6,1,"2","blast lethal","24\""],
  ["Blightlord Terminators","Combi-bolter","T","2",3,5,1,"1","lethal rf:2","24\""],
  ["Blightlord Terminators","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Blightlord Terminators","Plague spewer","T","D6",0,5,1,"1","anti:2:inf ignorescover torrent","12\""],
  ["Blightlord Terminators","Reaper autocannon","T","4",3,7,1,"1","dev sust:1","36\""],
  ["Blightlord Terminators","Bubotic blade","C","3",3,5,2,"2","lethal","càc"],
  ["Blightlord Terminators","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Blightlord Terminators","Flail of corruption","C","6",3,5,1,"2","lethal","càc"],
  ["Chaos Land Raider","Combi-bolter","T","2",3,5,1,"1","lethal rf:2","24\""],
  ["Chaos Land Raider","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Land Raider","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Land Raider","Soulshatter lascannon","T","2",3,12,3,"D6+1","","48\""],
  ["Chaos Land Raider","Twin heavy bolter","T","3",3,5,1,"2","lethal sust:1 twin","36\""],
  ["Chaos Land Raider","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Chaos Predator Annihilator","Combi-bolter","T","2",3,5,1,"1","lethal rf:2","24\""],
  ["Chaos Predator Annihilator","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Predator Annihilator","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Predator Annihilator","Heavy bolter","T","3",3,5,1,"2","lethal sust:1","36\""],
  ["Chaos Predator Annihilator","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Chaos Predator Annihilator","Predator twin lascannon","T","1",3,14,3,"D6+1","twin","48\""],
  ["Chaos Predator Annihilator","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Predator Destructor","Combi-bolter","T","2",3,5,1,"1","lethal rf:2","24\""],
  ["Chaos Predator Destructor","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Predator Destructor","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Predator Destructor","Heavy bolter","T","3",3,5,1,"2","lethal sust:1","36\""],
  ["Chaos Predator Destructor","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Chaos Predator Destructor","Predator autocannon","T","4",3,9,1,"3","lethal rf:2","48\""],
  ["Chaos Predator Destructor","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Rhino","Combi-bolter","T","2",3,5,1,"1","lethal rf:2","24\""],
  ["Chaos Rhino","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Rhino","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Rhino","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Spawn","Hideous Mutations","C","D6+2",4,5,1,"2","","càc"],
  ["Daemon Prince of Nurgle","Infernal cannon","T","3",2,5,1,"2","lethal","24\""],
  ["Daemon Prince of Nurgle","➤ Hellforged weapons - strike","C","7",2,8,2,"3","lethal","càc"],
  ["Daemon Prince of Nurgle","➤ Hellforged weapons - sweep","C","14",2,6,1,"1","lethal","càc"],
  ["Daemon Prince of Nurgle with wings","Infernal cannon","T","3",2,7,1,"2","lethal","24\""],
  ["Daemon Prince of Nurgle with wings","➤ Hellforged weapons - strike","C","7",2,8,2,"3","lethal","càc"],
  ["Daemon Prince of Nurgle with wings","➤ Hellforged weapons - sweep","C","14",2,6,1,"1","lethal","càc"],
  ["Death Guard Chaos Lord","Combi-bolter","T","2",3,4,0,"1","lethal rf:2","24\""],
  ["Death Guard Chaos Lord","Combi-weapon","T","1",2,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Death Guard Chaos Lord","Plague bolt pistol","T","1",2,4,0,"1","lethal pistol","12\""],
  ["Death Guard Chaos Lord","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Death Guard Chaos Lord","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Death Guard Chaos Lord","Astartes chainsword","C","7",2,4,1,"1","","càc"],
  ["Death Guard Chaos Lord","Plague fist","C","5",3,8,2,"2","lethal","càc"],
  ["Death Guard Chaos Lord","Plague-encrusted exalted weapon","C","6",2,5,2,"1","lethal","càc"],
  ["Death Guard Chaos Lord","Twin lightning claws","C","7",2,5,2,"1","twin","càc"],
  ["Death Guard Chaos Lord in Terminator Armour","Combi-bolter","T","2",3,4,0,"1","lethal rf:2","24\""],
  ["Death Guard Chaos Lord in Terminator Armour","Combi-weapon","T","1",3,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Death Guard Chaos Lord in Terminator Armour","Chainfist","C","5",3,8,2,"2","anti:3:veh","càc"],
  ["Death Guard Chaos Lord in Terminator Armour","Plague fist","C","5",2,8,2,"2","lethal","càc"],
  ["Death Guard Chaos Lord in Terminator Armour","Plague-encrusted exalted weapon","C","6",2,5,2,"1","lethal","càc"],
  ["Death Guard Chaos Lord in Terminator Armour","Twin lightning claws","C","7",2,5,2,"1","twin","càc"],
  ["Death Guard Cultists","Cultist firearm","T","1",4,3,0,"1","","24\""],
  ["Death Guard Cultists","Flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Death Guard Cultists","Heavy stubber","T","3",5,4,0,"1","rf:3","36\""],
  ["Death Guard Cultists","➤ Grenade launcher - frag","T","D3",4,4,0,"1","blast","24\""],
  ["Death Guard Cultists","➤ Grenade launcher - krak","T","1",4,9,2,"D3","","24\""],
  ["Death Guard Cultists","Brutal assault weapon","C","2",4,3,0,"1","","càc"],
  ["Death Guard Possessed","Hideous mutations","C","4",3,5,1,"2","","càc"],
  ["Death Guard Sorcerer in Terminator Armour","Combi-bolter","T","2",3,4,0,"1","lethal rf:2","24\""],
  ["Death Guard Sorcerer in Terminator Armour","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Death Guard Sorcerer in Terminator Armour","➤ Curse of the Leper - focused witchfire","T","2D6",3,6,2,"1","hazardous psychic","24\""],
  ["Death Guard Sorcerer in Terminator Armour","➤ Curse of the Leper - witchfire","T","D6",3,6,1,"1","psychic","24\""],
  ["Death Guard Sorcerer in Terminator Armour","Chainfist","C","3",4,8,2,"2","anti:3:veh","càc"],
  ["Death Guard Sorcerer in Terminator Armour","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Death Guard Sorcerer in Terminator Armour","Plague fist","C","3",3,8,2,"2","lethal","càc"],
  ["Death Guard Sorcerer in Terminator Armour","Plague-encrusted exalted weapon","C","6",2,5,2,"1","lethal","càc"],
  ["Death Guard Sorcerer in Terminator Armour","Twin lightning claws","C","5",3,5,2,"1","twin","càc"],
  ["Deathshroud Terminators","Plaguespurt gauntlet","T","D6",0,3,0,"1","anti:4:inf ignorescover pistol torrent","12\""],
  ["Deathshroud Terminators","➤ Manreaper - strike","C","4",2,8,2,"2","lethal","càc"],
  ["Deathshroud Terminators","➤ Manreaper - sweep","C","8",3,4,1,"1","lethal","càc"],
  ["Defiler","Ectoplasma destructor","T","D6",3,12,3,"3","blast lethal","36\""],
  ["Defiler","Excruciator cannon","T","6",3,6,1,"2","lethal","36\""],
  ["Defiler","Hades battle cannon","T","D6+3",3,10,1,"3","blast lethal","48\""],
  ["Defiler","Hades lascannon","T","2",3,12,3,"D6+1","lethal","48\""],
  ["Defiler","Heavy baleflamer","T","D6+3",0,7,2,"2","ignorescover torrent","12\""],
  ["Defiler","Heavy reaper autocannon","T","4",3,9,1,"3","dev lethal sust:1","48\""],
  ["Defiler","Magma cutter","T","2",3,9,4,"D6","lethal melta:2","12\""],
  ["Defiler","➤ Heavy missile launcher - frag","T","2D6",3,5,1,"1","blast lethal","48\""],
  ["Defiler","➤ Heavy missile launcher - krak","T","2",3,10,2,"D6+1","lethal","48\""],
  ["Defiler","Electroscourge","C","5",3,12,2,"2","extra sust:2","càc"],
  ["Defiler","Shearing claws - strike","C","5",3,16,3,"D6+1","lethal","càc"],
  ["Defiler","Shearing claws - sweep","C","10",3,6,2,"1","lethal","càc"],
  ["Foetid Bloat-drone","Plaguespitter","T","D6",0,6,1,"1","anti:2:inf ignorescover torrent","12\""],
  ["Foetid Bloat-drone","Fleshmower","C","10",3,7,1,"2","lethal","càc"],
  ["Foetid Bloat-drone","Plague probe","C","3",3,6,1,"1","lethal","càc"],
  ["Foetid Bloat-drone with heavy blight launcher","Heavy blight launcher","T","D6+2",3,10,2,"3","blast lethal","36\""],
  ["Foetid Bloat-drone with heavy blight launcher","Plague probe","C","3",3,6,1,"1","lethal","càc"],
  ["Foul Blightspawn","Plague sprayer","T","D6",0,7,2,"2","anti:2:inf ignorescover torrent","12\""],
  ["Foul Blightspawn","Close combat weapon","C","4",3,5,0,"1","","càc"],
  ["Great Unclean One","Plague flail","T","D6+1",3,7,2,"2","","6\""],
  ["Great Unclean One","Putrid vomit","T","D6+3",0,5,2,"1","ignorescover torrent","12\""],
  ["Great Unclean One","Bileblade","C","3",2,6,2,"2","extra lethal","càc"],
  ["Great Unclean One","Doomsday bell","C","6",2,7,1,"2","lethal","càc"],
  ["Great Unclean One","➤ Bilesword - strike","C","6",2,10,2,"D6+1","lethal","càc"],
  ["Great Unclean One","➤ Bilesword - sweep","C","12",2,7,1,"1","lethal","càc"],
  ["Helbrute","Combi-bolter","T","2",3,5,1,"1","lethal rf:2","24\""],
  ["Helbrute","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Helbrute","Multi-melta","T","2",3,9,4,"D6","lethal melta:2","18\""],
  ["Helbrute","Plasma cannon","T","D3",3,8,3,"3","blast hazardous lethal","36\""],
  ["Helbrute","Twin autocannon","T","2",3,10,1,"3","twin lethal","48\""],
  ["Helbrute","Twin heavy bolter","T","3",3,5,1,"2","lethal sust:1 twin","36\""],
  ["Helbrute","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Helbrute","➤ Missile launcher - frag","T","D6",3,4,0,"1","blast","48\""],
  ["Helbrute","➤ Missile launcher - krak","T","1",3,9,2,"D6","","48\""],
  ["Helbrute","Close combat weapon","C","5",3,6,0,"1","","càc"],
  ["Helbrute","Helbrute fist","C","5",3,12,2,"3","","càc"],
  ["Helbrute","Helbrute hammer","C","4",3,14,3,"D6+1","","càc"],
  ["Helbrute","Power scourge","C","8",3,7,1,"2","","càc"],
  ["Icon Bearer","Boltgun","T","2",3,5,1,"1","lethal","24\""],
  ["Icon Bearer","Plague knife","C","4",3,5,1,"1","lethal","càc"],
  ["Lord of Contagion","➤ Manreaper - strike","C","5",2,9,2,"3","lethal","càc"],
  ["Lord of Contagion","➤ Manreaper - sweep","C","10",2,6,1,"1","lethal","càc"],
  ["Lord of Poxes","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Lord of Poxes","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Lord of Poxes","Great plague blade","C","6",2,8,2,"2","dev lethal","càc"],
  ["Lord of Virulence","Twin plague spewer","T","D6",0,5,1,"1","anti:2:inf ignorescover torrent twin","12\""],
  ["Lord of Virulence","Power fist","C","5",2,8,2,"2","lethal","càc"],
  ["Malignant Plaguecaster","Bolt pistol","T","1",3,5,1,"1","lethal pistol","12\""],
  ["Malignant Plaguecaster","➤ Plague Wind - focused witchfire","T","D6+3",0,6,2,"D3","hazardous psychic torrent","12\""],
  ["Malignant Plaguecaster","➤ Plague Wind - witchfire","T","D6",0,4,1,"D3","psychic torrent","12\""],
  ["Malignant Plaguecaster","Corrupted staff","C","4",3,6,1,"D3","lethal psychic","càc"],
  ["Miasmic Malignifier","Miasmic gouts","T","2D6",0,3,0,"1","ignorescover torrent","9\""],
  ["Mortarion","Lantern","T","1",2,10,3,"3","pistol sust:D3","24\""],
  ["Mortarion","Rotwind","T","D6+3",2,7,2,"1","blast dev lethal psychic","24\""],
  ["Mortarion","➤ Silence - strike","C","5",2,14,3,"D6+1","dev lethal","càc"],
  ["Mortarion","➤ Silence - sweep","C","15",2,8,2,"2","lethal sust:1","càc"],
  ["Noxious Blightbringer","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Noxious Blightbringer","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Noxious Blightbringer","Cursed plague bell","C","5",3,4,0,"2","anti:2 lethal","càc"],
  ["Nurglings","Diseased claws and teeth","C","4",5,2,0,"1","lethal","càc"],
  ["Plague Drones","Death's heads","T","D3",4,4,0,"1","blast lethal","12\""],
  ["Plague Drones","Foul mouthparts","C","2",4,5,1,"2","extra lethal","càc"],
  ["Plague Drones","Plaguesword","C","2",3,4,1,"1","lethal","càc"],
  ["Plague Marines","Blight launcher","T","D3",3,6,1,"2","blast lethal","24\""],
  ["Plague Marines","Bolt pistol","T","1",3,5,1,"1","lethal pistol","12\""],
  ["Plague Marines","Boltgun","T","2",3,5,1,"1","lethal","24\""],
  ["Plague Marines","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Plague Marines","Plague belcher","T","D6",0,4,0,"1","anti:4:inf ignorescover torrent","12\""],
  ["Plague Marines","Plague spewer","T","D6",0,5,1,"1","anti:2:inf ignorescover torrent","12\""],
  ["Plague Marines","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Plague Marines","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Plague Marines","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Plague Marines","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Plague Marines","Bubotic weapons","C","4",3,5,2,"1","lethal","càc"],
  ["Plague Marines","Heavy plague weapon","C","3",4,8,2,"2","lethal","càc"],
  ["Plague Marines","Plague knives","C","3",3,5,1,"1","lethal","càc"],
  ["Plague Marines","Power fist","C","3",3,8,2,"2","lethal","càc"],
  ["Plague Surgeon","Bolt pistol","T","1",3,5,1,"1","lethal pistol","12\""],
  ["Plague Surgeon","Balesword","C","4",3,5,2,"2","lethal","càc"],
  ["Plaguebearers","Plaguesword","C","2",3,4,1,"1","lethal","càc"],
  ["Plagueburst Crawler","Entropy cannon","T","1",3,10,3,"D6+1","lethal","36\""],
  ["Plagueburst Crawler","Heavy slugger","T","4",3,5,1,"1","lethal","36\""],
  ["Plagueburst Crawler","Plagueburst mortar","T","D6+3",3,8,1,"2","blast indirect lethal","48\""],
  ["Plagueburst Crawler","Plaguespitter","T","D6",0,6,1,"1","anti:2:inf ignorescover torrent","12\""],
  ["Plagueburst Crawler","Rothail volley gun","T","3",3,5,0,"1","lethal rf:3","36\""],
  ["Plagueburst Crawler","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Poxwalkers","Improvised weapons","C","2",5,3,0,"1","lethal","càc"],
  ["Rotigus","Streams of brackish filth","T","2D6",0,8,2,"1","dev ignorescover torrent","12\""],
  ["Rotigus","➤ Gnarlrod - strike","C","7",2,10,3,"3","lethal psychic","càc"],
  ["Rotigus","➤ Gnarlrod - sweep","C","14",2,8,1,"1","lethal psychic","càc"],
  ["Tallyman","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Tallyman","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Tallyman","Close combat weapon","C","4",3,5,0,"1","","càc"],
  ["Typhus","➤ Lakrimae - strike","C","6",2,9,2,"3","lethal","càc"],
  ["Typhus","➤ Lakrimae - sweep","C","12",2,6,1,"1","lethal","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Beasts of Nurgle","Bête"],
  ["Biologus Putrifier","Personnage"],
  ["Blightlord Terminators","Infanterie"],
  ["Chaos Land Raider","Véhicule"],
  ["Chaos Predator Annihilator","Véhicule"],
  ["Chaos Predator Destructor","Véhicule"],
  ["Chaos Rhino","Véhicule"],
  ["Chaos Spawn","Bête"],
  ["Daemon Prince of Nurgle","Monstre"],
  ["Daemon Prince of Nurgle with wings","Monstre"],
  ["Death Guard Chaos Lord","Personnage"],
  ["Death Guard Chaos Lord in Terminator Armour","Personnage"],
  ["Death Guard Cultists","Infanterie"],
  ["Death Guard Possessed","Infanterie"],
  ["Death Guard Sorcerer in Terminator Armour","Personnage"],
  ["Deathshroud Terminators","Infanterie"],
  ["Defiler","Véhicule"],
  ["Foetid Bloat-drone","Véhicule"],
  ["Foetid Bloat-drone with heavy blight launcher","Véhicule"],
  ["Foul Blightspawn","Personnage"],
  ["Great Unclean One","Monstre"],
  ["Helbrute","Véhicule"],
  ["Icon Bearer","Personnage"],
  ["Lord of Contagion","Personnage"],
  ["Lord of Poxes","Personnage"],
  ["Lord of Virulence","Personnage"],
  ["Malignant Plaguecaster","Personnage"],
  ["Miasmic Malignifier","Fortification"],
  ["Mortarion","Epic Hero"],
  ["Noxious Blightbringer","Personnage"],
  ["Nurglings","Bête"],
  ["Plague Drones","Monté"],
  ["Plague Marines","Battleline"],
  ["Plague Surgeon","Personnage"],
  ["Plaguebearers","Battleline"],
  ["Plagueburst Crawler","Véhicule"],
  ["Poxwalkers","Infanterie"],
  ["Rotigus","Epic Hero"],
  ["Tallyman","Personnage"],
  ["Typhus","Epic Hero"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Biologus Putrifier": [
  "Plague Marines"
 ],
 "Death Guard Chaos Lord": [
  "Plague Marines"
 ],
 "Death Guard Chaos Lord in Terminator Armour": [
  "Blightlord Terminators",
  "Deathshroud Terminators"
 ],
 "Death Guard Sorcerer in Terminator Armour": [
  "Blightlord Terminators",
  "Deathshroud Terminators"
 ],
 "Foul Blightspawn": [
  "Plague Marines"
 ],
 "Icon Bearer": [
  "Plague Marines"
 ],
 "Lord of Contagion": [
  "Blightlord Terminators",
  "Deathshroud Terminators"
 ],
 "Lord of Poxes": [
  "Plague Marines"
 ],
 "Lord of Virulence": [
  "Blightlord Terminators",
  "Deathshroud Terminators"
 ],
 "Malignant Plaguecaster": [
  "Plague Marines",
  "Poxwalkers"
 ],
 "Noxious Blightbringer": [
  "Plague Marines",
  "Poxwalkers"
 ],
 "Plague Surgeon": [
  "Plague Marines"
 ],
 "Tallyman": [
  "Plague Marines"
 ],
 "Typhus": [
  "Blightlord Terminators",
  "Deathshroud Terminators",
  "Poxwalkers"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Daemon Prince of Nurgle": [
  [
   "Death Guard Defenders",
   "While this model is within 3\" of one or more friendly Death Guard Infantry units, this model has the Lone Operative ability."
  ],
  [
   "Fevered Strategist",
   "Once per Battle Round, one model from your army with this ability can use it when a friendly Death Guard unit within 12\" of that model is targeted with a Stratagem. If it does, reduce the CP cost of that Stratagem by 1CP."
  ],
  [
   "Miasma of Pestilence (Aura)",
   "While a friendly Death Guard unit is within 6\" of this model, each time a ranged attack targets that unit, models in that unit have the Benefit of Cover against that attack."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Daemon Prince of Nurgle with wings": [
  [
   "Horrifying Visage",
   "Each time this model ends a Charge move, select one enemy unit within Engagement Range of it. That unit must take a Battle-shock test, subtracting 1 from that test."
  ],
  [
   "Enfeebling Miasma (Aura)",
   "While an enemy unit (excluding *Monsters and Vehicles) is within 6\" of this model, each time that unit is selected to Fall Back, models in that enemy unit must take Desperate Escape tests. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those Desperate Escape tests."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Typhus": [
  [
   "Leader",
   "This model can be attached to the following units: BLIGHTLORD TERMINATORS, DEATHSHROUD TERMINATORS, POXWALKERS"
  ],
  [
   "The Destroyer Hive",
   "While this model is leading a unit, each time a melee attack targets that unit, subtract 1 from the Hit roll."
  ],
  [
   "Eater Plague (Psychic)",
   "In your Shooting phase, you can select one enemy unit within 18\" of and visible to this Psyker (excluding units with the Lone Operative ability that are not part of an Attached unit and are not within 12\" of this Psyker and roll one D6: on a 1, this Psyker's unit suffers D3 mortal wounds; on a 2-5, that enemy unit suffers D6 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Death Guard Chaos Lord": [
  [
   "Leader",
   "This model can be attached to the following unit: PLAGUE MARINES"
  ],
  [
   "Chaos Lord",
   "While this model is leading a unit, each time a model in that unit makes an attack, re-roll a Hit roll of 1."
  ],
  [
   "Dessication Conduit (Aura)",
   "While an enemy unit is within Contagion Range of this model, at the end of the turn, roll one D6: on a 4+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Death Guard Chaos Lord in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units: BLIGHTLORD TERMINATORS, DEATHSHROUD TERMINATORS"
  ],
  [
   "Chaos Lord",
   "While this model is leading a unit, each time a model in that unit makes an attack, re-roll a Hit roll of 1."
  ],
  [
   "Dessication Conduit (Aura)",
   "While an enemy unit is within Contagion Range of this model, at the end of the turn, roll one D6: on a 4+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Lord of Virulence": [
  [
   "Virulent Aura",
   "While this model is leading a unit, each time a model in that unit makes a ranged attack, you can re-roll the Wound roll."
  ],
  [
   "Blight Bombardment",
   "At the start of your Shooting phase, select one enemy unit within 30\" of and visible to this model. Until the end of the phase, each time a friendly Death Guard unit makes a ranged attack that targets that unit, re-roll a Hit roll of 1 (if that attack is made with a Blast weapon, you can re-roll the Hit roll instead)."
  ],
  [
   "Leader",
   "This model can be attached to the following units: BLIGHTLORD TERMINATORS, DEATHSHROUD TERMINATORS"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Lord of Contagion": [
  [
   "Vector of Disease",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [Sustained Hits 1] and [Lance] abilties."
  ],
  [
   "Unholy Resilience",
   "The first time a model with this ability is destroyed in a battle round, roll one D6 at the end of the phase. On a 2+, set that model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with 3 wounds remaining. Each model can only be set up in this way once per battle."
  ],
  [
   "Leader",
   "This model can be attached to the following units: BLIGHTLORD TERMINATORS, DEATHSHROUD TERMINATORS"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Death Guard Sorcerer in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following units: BLIGHTLORD TERMINATORS, DEATHSHROUD TERMINATORS"
  ],
  [
   "Putrescent Vitality (Psychic)",
   "At the start of the Fight phase, you can roll one D6: on a 1, this PSYKER’s unit suffers D3 mortal wounds; on a 2+, until the end of the phase, each time an attack is allocated to a model in this PSYKER’s unit, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Pestilent Familiar (Psychic)",
   "Once per battle, after selecting targets for a Psychic weapon equipped by this model, until the end of the phase, improve the Strength and Damage characteristics of that weapon by 2."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Malignant Plaguecaster": [
  [
   "Gift of Contagion (Psychic)",
   "While this model is leading a unit, each time a model in that unit makes an attack which targets a unit which is Afflicted, that attack has the [Sustained Hits 1] ability."
  ],
  [
   "Pestilent Fallout (Psychic)",
   "In your Shooting phase, after this model has shot, select one enemy Infantry unit hit by one or more of those attacks made with its Plague Wind. Until the end of your opponent's next turn, that unit is enfeebled. While a unit is enfeebled, subtract 2\" from the Move characteristic of models in that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units: PLAGUE MARINES, POXWALKERS"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Plague Marines": [
  [
   "Infused with the Blessings of Nurgle",
   "In your Shooting phase, each time this unit is selected to shoot, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the start of your next turn, that unit is Afflicted."
  ],
  [
   "Insectile Murmuration",
   "When this unit’s attacks target a unit within Contagion Range of a friendly unit, those attacks can re-roll wound rolls of 1."
  ],
  [
   "Plagueveil",
   "This unit has -3\" detection range."
  ],
  [
   "Icon of Despair (Aura)",
   "While an enemy unit is within 6\" of the bearer, worsen the Leadership characteristic of models in that unit by 1."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Death Guard Cultists": [
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Poxwalkers": [
  [
   "Curse of the Walking Pox",
   "Each time a Poxwalker model in this unit makes an attack that destroys an enemy model (excluding Monster and Vehicle models), after this unit has resolved its attacks, you can return one destroyed Poxwalker model to this unit.\n\nWhile Typhus is leading this unit, enemy models destroyed as a result of Typhus’ Eater Plague ability count as enemy models destroyed by an attack made by a Poxwalker model in this unit for the purposes of this ability."
  ],
  [
   "Skittering Limbs",
   "Each time a model in this unit makes a Normal, Advance or Fall Back move, it can move through enemy models. When doing so, it can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed."
  ],
  [
   "Spatterfilth",
   "Each time a model in this unit makes a melee attack, you can ignore any or all modifiers to the Hit roll, to the Wound roll and to the Armour Penetration characteristic."
  ],
  [
   "Choking Mist",
   "Once per battle, when this unit is selected to make a Normal, Advance or Fall Back move, is set up on the battlefield, or declares a charge it can use this Battle Trait. Until the end of the turn, enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "Bone Horns",
   "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6 for each model in this unit that is within Engagement Range of that enemy unit: for each 5+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Stolid Bulk",
   "Add 1 to the Ballistic Skill characteristic of ranged weapons equipped by models in this unit."
  ],
  [
   "Cackling Plague Mites",
   "Ranged weapons equipped by models in this unit have the [IGNORES COVER] ability."
  ],
  [
   "Quivering Cilia",
   "Each time you target this unit with the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+ while resolving that Stratagem."
  ],
  [
   "Infectious Buboes",
   "Each time a melee attack is allocated to this unit, after the attacking unit has finished making its attacks, roll one D6 (to a maximum of six D6 per attacking unit): for each 5+, the attacking unit suffers 1 mortal wound."
  ],
  [
   "Sporebelch",
   "Each time this unit ends a Fall Back move, select one enemy unit that was within Engagement Range of this unit at the start of the phase. Roll three D6: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Lambent Taint",
   "In your Shooting phase, after this unit has shot, select one visible enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly Nurgle Daemon model makes an attack that targets that unit, re-roll a Hit roll of 1."
  ],
  [
   "Plated Growths",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit's Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "Masterwork Maladies",
   "Add 6\" to the Range characteristic of ranged Lethal Hits weapons equipped by models in this unit."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Noxious Blightbringer": [
  [
   "Sickening Vitality",
   "While this model is leading a unit, add 1\" to the Move characteristic of models in that unit and you can re-roll Advance and Charge rolls made for that unit."
  ],
  [
   "Tocsin of Misery (Aura)",
   "In the Battle-shock step of your opponent's Command phase, if an enemy unit that is below its Starting Strength is within 9\" of this model, that enemy unit must take a Battle-shock test, subtracting 1 from that test if it is a Psyker unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units: PLAGUE MARINES, POXWALKERS"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Foul Blightspawn": [
  [
   "Putrefying Stink",
   "Enemy models cannot start or end an Advance move within 9\" of this model."
  ],
  [
   "Blinding Spray",
   "In the Fight phase, you can select one model from your army with this ability to use this ability. If you do, until the end of that phase, that model's unit has the Fights First ability. Each model can only be selected for this ability once per battle."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: PLAGUE MARINES†\n†*Can join even if the unit is already led by another Leader.*"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Biologus Putrifier": [
  [
   "Extraction of Fresh Disease",
   "The first time this model's unit destroys an enemy unit as a result of a melee attack, until the end of the battle, add 6 to the Objective Control characteristic of this model."
  ],
  [
   "Foul Infusion",
   "While this model is leading a unit, weapons equipped by models in that unit have the [Lethal Hits] ability. In addition, each time a model in that unit makes an attack, a Critical Hit is scored on an unmodified Hit roll of 5+, instead of only on a 6."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: PLAGUE MARINES†\n†*Can join even if the unit is already led by another Leader.*"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Tallyman": [
  [
   "Malicious Calculations",
   "While this model is leading a unit, each time a model in that unit makes an attack, you can ignore any or all modifiers to that attack's Ballistic Skill or Weapon Skill characteristics and/or any or all modifiers to the Hit roll."
  ],
  [
   "Seven-fold Chant",
   "In your Command phase, if this model is on the battlefield, roll 2D6: on a 7+, you gain 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: PLAGUE MARINES†\n†*Can join even if the unit is already led by another Leader.*"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Plague Surgeon": [
  [
   "Tainted Narthecium",
   "While this model is leading a unit, in your Command phase, you can return 1 destroyed Bodyguard model to that unit."
  ],
  [
   "Inflamed Infections",
   "At the start of the Fight phase, select one enemy unit within Engagement Range of this model. Until the end of the phase, each time this model makes an attack that targets that unit, an unmodified Hit roll of 5+ scores a Critical Hit. If that unit is below Half-strength, an unmodified Hit roll of 4+ scores a Critical Hit instead."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: PLAGUE MARINES†\n†*Can join even if the unit is already led by another Leader.*"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Deathshroud Terminators": [
  [
   "Silent Bodyguard",
   "While a Character model is leading this unit, that Character model has the Feel No Pain 4+ ability."
  ],
  [
   "Death Approaches",
   "In your Movement phase, when this unit is set up on the battlefield using the Deep Strike ability, it can be set up anywhere on the battlefield that is more than 6\" horizontally away from all Afflicted enemy units, and more than 8\" horizontally away from any other enemy units."
  ],
  [
   "Icon of Despair (Aura)",
   "While an enemy unit is within 6\" of the bearer, worsen the Leadership characteristic of models in that unit by 1."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Helbrute": [
  [
   "Diseased Malice",
   "Each time this model makes an attack that targets an Afflicted unit, add 1 to the Wound roll."
  ],
  [
   "Froth-spattered Frenzy",
   "If this model is equipped with two melee weapons in addition to its close combat weapon, add 2 to the Attacks characteristic of those two weapons."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Blightlord Terminators": [
  [
   "Blistering Fusillade",
   "If this unit has a Starting Strength of 5 or more, or if a Character is leading this unit, then each time a model in this unit makes a ranged attack that targets an Afflicted unit, improve the Strength and Armour Penetration characteristics of that attack by 1."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Chaos Spawn": [
  [
   "Lethal Ichor",
   "Each time a melee attack is allocated to a model in this unit, after the attacking unit has finished making its attacks, roll one D6 (to a maximum of six D6 per attacking unit): for each 4+, the attacking unit suffers 1 mortal wound."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Foetid Bloat-drone": [
  [
   "Hovering Death",
   "This model is eligible to shoot and declare a charge in a turn in which it Fell Back."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Plagueburst Crawler": [
  [
   "Spore-laced Shock Waves",
   "In your Shooting phase, each time you select a target for this model's Plagueburst mortar, roll one D6 for the target unit and every other enemy unit within 3\" of the target unit, adding 1 to that roll if the unit being rolled for is Afflicted. On a 6+, the unit being rolled for is struck by spores; after resolving all of this model's attacks against the target unit, each unit struck by spores suffers D3 mortal wounds."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
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
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Chaos Predator Annihilator": [
  [
   "Metalophagic Infection",
   "In your Shooting phase, after this model has shot, select one enemy Monster or Vehicle unit hit by one or more of those attacks. Roll one D6, adding 1 to the result if that unit is Afflicted; on a 5+, that unit suffers D3 mortal wounds."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Chaos Predator Destructor": [
  [
   "Hail of Corrosive Disease",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding Monsters and Vehicles) hit by one or more of those attacks. Until the end of the phase, each time a friending Death Guard unit makes a ranged attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per phase."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Chaos Rhino": [
  [
   "Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that unit, you can re-roll the Wound roll."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Mortarion": [
  [
   "Host of Plagues",
   "At the end of your Movement phase, roll one D6 for each enemy unit within 6\" of this model, adding 1 to the result if that unit is Afflicted; on a 3+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Lord of the Death Guard",
   "Once per turn, this model can use one of the Lord of the Death Guard abilties."
  ],
  [
   "Damaged: 1-6 wounds remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Icon Bearer": [
  [
   "Unclean Icon",
   "While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit."
  ],
  [
   "Blessed Icon of Disease",
   "Once per battle, at the start of any phase, you can select one friendly Death Guard unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: PLAGUE MARINES†\n†*Can join even if the unit is already led by another Leader.*"
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Miasmic Malignifier": [
  [
   "Putrescent Fog (Aura)",
   "Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" of this model."
  ],
  [
   "Diseased Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack."
  ],
  [
   "Deployment",
   "Both parts of this Fortification must be deployed within 1\" of each other. Both parts are then treated as a single model for all rules purposes."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Death Guard Possessed": [
  [
   "Infectious Bloodshed",
   "Each time this unit makes a Charge move, until the end of the turn, weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Diseased icon",
   "Melee weapons in the bearer's unit have the [LETHAL HITS] ability."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Lord of Poxes": [
  [
   "Leader",
   "This model can be attached to the following units: PLAGUE MARINES"
  ],
  [
   "Gift of Poxes",
   "Add 3\" to the range of this model's Contagion Range."
  ],
  [
   "Shroud of Disease",
   "While this model is leading a unit, that unit cannot be targeted by ranged attacks unless the attacking unit is within 18\"."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Great Unclean One": [
  [
   "Daemon Lord of Nurgle (Aura)",
   "While a friendly Plague Legions unit is within 6\" of this model, add 1 to the Toughness characteristic of models in that unit."
  ],
  [
   "Nurgle’s Rot (Psychic)",
   "At the end of your Movement phase, you can select one enemy unit within 12\" of this model. Until the start of your next Movement phase, that unit is rotted. While a unit is rotted, subtract 1 from the Toughness characteristic of models in that unit."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Rotigus": [
  [
   "Virulent Blessing (Psychic)",
   "At the start of the Fight phase, you can select one enemy unit within 24\" of and visible to this model. Until the end of the phase, each time an attack made by a Plague Legions model is allocated to a model in that unit, add 1 to the Damage characteristic of that attack."
  ],
  [
   "Deluge of Nurgle (Aura)",
   "While an enemy unit is within 6\" of this model, subtract 2 from the Move characteristic and subtract 1 from the Objective Control characteristic of models in that unit."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Plaguebearers": [
  [
   "Infected Outbreak",
   "If you control an objective marker at the end of your Command phase and this unit is within range of that objective marker, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ]
 ],
 "Plague Drones": [
  [
   "Death’s Heads",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly NURGLE LEGIONES DAEMONICA unit makes an attack that targets that unit, you can re-roll the Wound roll."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ]
 ],
 "Beasts of Nurgle": [
  [
   "Grotesque Regeneration",
   "At the end of each phase, if a Beasts of Nurgle model in this unit has lost any wounds but is not destroyed, that model regains all of its lost wounds."
  ]
 ],
 "Nurglings": [
  [
   "Mischief Makers (Aura)",
   "Each time an enemy unit (excluding Titanic units) within Engagement Range of one or more units with this ability is selected to fight, until the end of the phase, each time a model in that enemy unit makes a melee attack, subtract 1 from the Hit roll."
  ]
 ],
 "Foetid Bloat-drone with heavy blight launcher": [
  [
   "Explosive Blight",
   "In your Shooting phase, each time this model makes an attack that destroys an enemy unit, before removing the last model in that unit from play, roll a D6, adding 1 to the result if that unit is Afflicted; on a 5+, each enemy unit within 6\" of that model is Afflicted until the start of your next turn."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ],
 "Defiler": [
  [
   "Scuttling Walker",
   "Each time this unit makes a Normal, Advance or Fall Back move, it can move through models (excluding Titanic models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed."
  ],
  [
   "Barrage of Filth",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that unit cannot have the Benefit of Cover."
  ],
  [
   "Nurgle's Gift (Aura)",
   "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Champions of Contagion",2,"","Manifold Maladies","At the start of the battle round, you can select one of the Plagues listed in Nurgle’s Gift. Until the end of the battle, that is your chosen Plague instead of any previously chosen Plague.","",0,"","Take and Hold"],
  ["Contagion Engines",1,"","Warped and Rusted Animus","▪ Friendly FOETID BLOAT-DRONE/FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER/HELBRUTE/MYPHITIC BLIGHT-HAULER units have CONTAGION ENGINE. ▪ Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT]. This detachment has the ENGINES tag and cannot be taken with another ENGINES detachment.","",0,"","Reconnaissance"],
  ["Death Lord’s Chosen",2,"","Deadly Vectors","In your opponent’s Command phase, roll 2D6 for each Afflicted enemy unit, subtracting 1 from the result if that unit is Below Half-strength. If the result is 6 or less, that enemy unit suffers D3 mortal wounds.","",0,"","Priority Assets"],
  ["Flyblown Host",1,"","Verminous Haze","In the Declare Battle Formations step, you can select up to two friendly PLAGUE MARINES units. Those units have Infiltrators. This detachment has the FLYBLOWN tag and cannot be taken with another FLYBLOWN detachment.","",0,"","Reconnaissance"],
  ["Mortarion’s Hammer",2,"","Miasmic Bombardment","At the start of the battle round, select a number of enemy units more than 12\" away from every model from your army that is on the battlefield. Until the end of the battle round, those enemy units are Afflicted. The maximum number of units you can select in this way depends on the battle size, as shown below. BATTLE SIZEUNITSIncursion1Strike Force2Onslaught3","",0,"","Purge the Foe"],
  ["Paragons of Putrescence",1,"","Hypervirulent Strains","Friendly DEATH GUARD CHARACTER units have +3\" to their Contagion Range (to a maximum of 12\").","",0,"","Priority Assets"],
  ["Shamblerot Vectorium",2,"","Numberless Horde","In your Command phase in each of the following battle rounds, depending on your chosen battle size, add a new Poxwalkers unit with a Starting Strength of 10 to your army, in Strategic Reserves. BATTLE SIZEBATTLE ROUNDSIncursion2,3Strike Force2, 3, 4Onslaught2, 3, 4, 5 KEYWORDS POXWALKERS units from your army gain the BATTLELINE keyword.","",0,"","Disruption"],
  ["Tallyband Summoners",2,"","Reverberant Rancidity","While a Plague Legions unit from your army is within 7\" of one or more DEATH GUARD units from your army, that PLAGUE LEGIONS unit has the Nurgle’s Gift ability. While a Death Guard unit from your army is within 7\" of one or more PLAGUE LEGIONS units from your army, add 3\" to that DEATH GUARD units Contagion Range. PLAGUE LEGIONS You can include Plague Legions units in your army, even though they do not have the DEATH GUARD Faction keyword. The combined points cost of such units you can include in your army is: ▪ Incursion: Up to 500 pts ▪ Strike Force: Up to 1000 pts ▪ Onslaught: Up to 1500 pts No PLAGUE LEGIONS models from your army can be your WARLORD.","",0,"","Disruption"],
  ["Virulent Vectorium",3,"","Worldblight","At the end of your Command phase, if a friendly DEATH GUARD unit is controlling an objective, that objective is secured. Until you lose control of that objective, while an enemy unit is within range of that objective, that enemy unit is Afflicted.","",0,"","Take and Hold"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Cornucophagus",35,"Champions of Contagion","In the Declare Battle Formations step, select one Plague. Until the end of the battle, while an enemy is within Contagion Range of the bearer, that enemy unit has the effect of that Plague in addition to any other.",null],
  ["Final Ingredient",20,"Champions of Contagion","Once per battle, after the bearer's unit has fought, if one or more Character models were destroyed by those attacks, select one Plague. Until the end of the battle, if an enemy unit is Afflicted, that unit has the effect of the selected Plague in addition to any other.",null],
  ["Needle of Nurgle",25,"Champions of Contagion","Each time the bearer uses its Tainted Narthecium ability, you can return up to D3 destroyed models to the bearer's unit (instead of 1).",null],
  ["Visions of Virulence",15,"Champions of Contagion","While an enemy unit is enfeebled by the bearer's Pestilent Fallout ability, that unit is also Afflicted.",null],
  ["Lancet of the Worldsore (Upgrade)",15,"Contagion Engines","Friendly HELBRUTE/MYPHITIC BLIGHT-HAULER unit only. This unit has MOBILE.",null],
  ["Parasitic Woe‑reaper (Upgrade)",15,"Contagion Engines","CONTAGION ENGINE unit only. When this unit has fought, one model in this unit heals D3 wounds.",null],
  ["Face of Death",10,"Death Lord’s Chosen","At the start of the Fight phase, each enemy unit within Engagement Range of the bearer's unit must take a Battle-shock test.",null],
  ["Helm of The Fly King",20,"Death Lord’s Chosen","While the bearer is leading a unit, models in that unit cannot be targeted by ranged attacks unless the attacking model is within 18\".",null],
  ["Vile Vigour",15,"Death Lord’s Chosen","While the bearer is leading a unit, add 1\" to the Movement characteristics of models in that unit and you can re-roll Advance rolls made for that unit.",null],
  ["Warprot Talisman",30,"Death Lord’s Chosen","Once per battle, at the end of your opponent's turn, if the bearer's unit is not within Engagement Range of one or more enemy units, you can remove it from the battle field and place it into Strategic Reserves.",null],
  ["Insectile Murmuration (Upgrade)",15,"Flyblown Host","PLAGUE MARINES unit only. When this unit’s attacks target a unit within Contagion Range of a friendly unit, those attacks can re-roll wound rolls of 1.",null],
  ["Plagueveil (Upgrade)",15,"Flyblown Host","PLAGUE MARINES unit only. This unit has -3\" detection range.",null],
  ["Bilemaw Blight",10,"Mortarion’s Hammer","At the start of your Shooting phase, until the end of the phase, add 12\" to the Range characteristics of the bearer's Plague Wind weapon.",null],
  ["Eye of Affliction",20,"Mortarion’s Hammer","Ranged weapons equipped by model's in the bearer's unit have the [Ignores Cover] ability while targeting an Afflicted enemy unit.",null],
  ["Shriekworm Familiar",15,"Mortarion’s Hammer","Once per battle round, you can target the bearer's unit with the Fire Overwatch Stratagem for 0CP.",null],
  ["Tendrilous Emissions",30,"Mortarion’s Hammer","While the bearer is within 3\" of one or more friendly Death Guard Vehicle units, the bearer has the Lone Operative ability, and each time one of those Vehicle units makes a ranged attack that targets an enemy unit visible to the bearer, re-roll a Wound roll of 1.",null],
  ["Host of the Hybridised Pox",40,"Paragons of Putrescence","(Once per battle, per army) In your Command phase, you can use this ability. If you do, select one of the Plagues listed in Nurgle’s Gift (see Codex: Death Guard). Enemy units within Contagion Range of this unit also have the effect of that Plague in addition to your army’s chosen Plague until the end of the battle.",null],
  ["Rejuvenating Swarm",20,"Paragons of Putrescence","Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls.",null],
  ["Lord of the Walking Pox",15,"Shamblerot Vectorium","If the bearer is leading a Poxwalkers unit, and is in Strategic Reserves, for the purposes of setting up that unit on the battlefield, treat the current battle round as the third battle round.",null],
  ["Sorrowsyphon",10,"Shamblerot Vectorium","While the bearer is leading a Poxwalkers unit, add 1 to the Damage characteristic of the bearer's Plague Wind weapon. Each time the bearer makes one or more attacks with a Plague Wind weapon, after the bearer's unit has resolved its attacks, D3 Bodyguard models from the bearer's unit are destroyed.",null],
  ["Talisman of Burgeoning",25,"Shamblerot Vectorium","While the bearer is leading a Poxwalkers unit, add 1 to the Toughness characteristic of Poxwalkers models in that unit.",null],
  ["Witherbone Pipes",25,"Shamblerot Vectorium","While the bearer is leading a Poxwalkers unit, add 1 to the Objective Control characteristic of models in that unit, and each time that unit takes a Battle-shock or Leadership test, add 1 to that test.",null],
  ["Beckoning Blight",20,"Tallyband Summoners","Each time a Plague Legions unit from your army is set up on the battle field using the Deep Strike ability, if it is set up wholly within 12\" of the bearer, it can be set up anywhere that is more than 6\" horizontally away from any enemy models, instead of more than 8\".",null],
  ["Entropic Knell",15,"Tallyband Summoners","In the Battle-shock step of your opponent's Command phase, each enemy unit within 6\" of the bearer that is below its Starting Strength must take a Battle-shock test, subtracting 1 from that test.",null],
  ["Fell Harvester",10,"Tallyband Summoners","Add 2 to the Attacks characteristic of the bearer's melee weapons.",null],
  ["Tome of Bounteous Blessings",20,"Tallyband Summoners","Each time a Plague Legions unit within 12\" of the bearer takes a Battle-shock test, add 1 to that test and, if that test is passed, one model in that unit regains up to D3 lost wounds (if that unit is a Battleline unit and that test is passed, up to D3 destroyed models can be returned to that unit instead).",null],
  ["Arch Contaminator",25,"Virulent Vectorium","While the bearer's unit is within range of an objective marker you control, each time a model in the bearer's unit makes an attack, you can re-roll the Wound roll.",null],
  ["Daemon Weapon of Nurgle",10,"Virulent Vectorium","Each time the bearer makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit.",null],
  ["Furnace of Plagues",25,"Virulent Vectorium","Add 1 to the Strength and Attacks characteristics of the bearer's melee weapons, and the bearer's melee weapons have the Devastating Wounds abilty.",null],
  ["Revolting Regeneration",30,"Virulent Vectorium","At the start of your Command phase, this model regains up to D3 lost wounds.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Blessings of Filth","Champions of Contagion","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Death Guard Attached unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Death’s Heads","Champions of Contagion","Équipement",1,"Your Shooting phase.","One Biologus Putrifier unit from your army that is not within Engagement Range of one or more enemy units and has not been selected to shoot this phase.","Select one enemy unit (excluding VEHICLES) that is within 8\" of and visible to your unit. Until the start of your next turn, that unit has the effect of all Plagues (see Nurgle’s Gift).",""],
  ["Grotesque Fortitude","Champions of Contagion","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Death Guard Attached unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, add 2 to the Toughness characteristic of models in your unit.",""],
  ["Malignance Magnified","Champions of Contagion","Tactique de Bataille",2,"Your Shooting phase or the Fight phase.","One Death Guard Attached unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a unit that is below its Starting Strength, you can re-roll the Hit roll and you can re-roll the Wound roll.",""],
  ["Mobile Vector","Champions of Contagion","Ruse Stratégique",1,"Your Movement phase, before the Reinforcements step.","One Death Guard Character unit from your army that is not leading a unit.","Select one other friendly Death Guard unit (excluding Battle-shocked units and Attached units that already have two Leader units or one of your CHARACTER units leading it] within 2\" horizontally and 5\" vertically of your unit that your unit can lead (as described in the Leader section of its datasheet]. Your unit attaches to that unit as a Leader. Change that unit’s Starting Strength accordingly.",""],
  ["Rabid Infusion","Champions of Contagion","Ruse Stratégique",1,"Start of the Fight phase.","One Death Guard unit from your army that includes two Character models.","Until the end of the phase, your unit has the Fights First ability.",""],
  ["Bloodrust Deluge","Contagion Engines","",1,"Your Shooting phase, when a friendly CONTAGION ENGINE unit is selected to shoot.","That CONTAGION ENGINE unit.","Select one visible enemy unit. That enemy unit is Afflicted until your unit has attacked.",""],
  ["Fresh Vectors","Contagion Engines","",1,"Your Shooting phase or the Fight phase, when a friendly CONTAGION ENGINE unit is selected to attack.","That CONTAGION ENGINE unit.","Your unit’s attacks can re-roll wound rolls of 1.",""],
  ["Soulrot Flux","Contagion Engines","",1,"Your opponent’s Movement phase, when an enemy unit is selected to make a fall-back move, if that enemy unit is engaged with a friendly CONTAGION ENGINE unit.","That CONTAGION ENGINE unit.","When an enemy unit engaged with your unit is selected to make a fall-back move, roll one D6: ▪ On a 1, that enemy unit suffers 1 mortal wound. ▪ On a 2-5, that enemy unit suffers D3 mortal wounds. ▪ On a 6, that enemy unit suffers 3 mortal wounds.",""],
  ["Blooming Pestilence","Death Lord’s Chosen","Fait Épique",1,"Start of any phase.","One Terminator unit from your army.","Until the end of the phase, add 3\" to the Contagion Range of models in your unit.",""],
  ["Grim Reapers","Death Lord’s Chosen","Tactique de Bataille",1,"Fight phase.","One Terminator unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit (excluding MONSTERS and VEHICLES) you can re-roll the Hit roll.",""],
  ["Mortarion's Teachings","Death Lord’s Chosen","Ruse Stratégique",1,"Your Shooting phase.","One Terminator unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [ASSAULT] and [HEAVY] abilities.",""],
  ["Sickening Impact","Death Lord’s Chosen","Ruse Stratégique",1,"Your Charge phase, just after a Terminator unit from your army ends a Charge move.","That TERMINATOR unit.","Select one enemy unit within Engagement Range of your unit, then roll one D6 for each model in your unit that is within Engagement Range of that enemy unit: for each 2+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",""],
  ["Signal Pox","Death Lord’s Chosen","Fait Épique",1,"Your Command phase.","One Lord of Virulence model from your army.","Select one objective marker within 30\" of and visible to your model. Until the start of your next turn, while an enemy unit is within range of that objective marker, that unit is Afflicted.",""],
  ["Undying Spite","Death Lord’s Chosen","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Terminator unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6. On a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Droning Horror","Flyblown Host","",1,"Your Shooting phase, when a friendly PLAGUE MARINES unit is selected to shoot.","That PLAGUE MARINES unit.","Your unit’s ranged attacks: ▪ Can re-roll hit rolls of 1. ▪ That target a unit within half range, can re-roll wound rolls of 1.",""],
  ["Eye of the Swarm","Flyblown Host","",1,"Your Shooting phase, when a friendly PLAGUE MARINES unit is selected to shoot.","That PLAGUE MARINES unit.","Your unit’s ranged attacks have [CLOSE-QUARTERS].",""],
  ["Nauseating Paroxysms","Flyblown Host","",1,"Start of the Fight phase","One friendly engaged PLAGUE MARINES unit.","Select one enemy unit engaged with your unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll.",""],
  ["Blighted Land","Mortarion’s Hammer","Ruse Stratégique",2,"End of your Movement phase.","One Death Guard Vehicle unit from your army.","Select one terrain feature within 24\" of and visible to your unit. Until the start of your next turn, enemy units are Afflicted while they are within 3\" of that terrain feature.",""],
  ["Drawn to Despair","Mortarion’s Hammer","Tactique de Bataille",1,"Your Shooting phase.","One Death Guard unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a visible enemy unit (excluding AIRCRAFT) within your opponent’s deployment zone, you can re-roll the Hit roll.",""],
  ["Eyestinger Storm","Mortarion’s Hammer","Ruse Stratégique",1,"Your opponent’s Command phase.","One Death Guard Vehicle unit from your army.","Select one objective marker visible to one or more models in your unit. Each Afflicted enemy unit within range of that objective marker must take a Battle-shock test. Enemy units affected by this Stratagem do not need to take any other Battle-shock tests in the same phase.",""],
  ["Font of Filth","Mortarion’s Hammer","Ruse Stratégique",1,"Your Shooting phase.","One Death Guard Vehicle unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [ASSAULT] ability.",""],
  ["Relentless Grind","Mortarion’s Hammer","Ruse Stratégique",1,"Your Movement phase or your Charge phase.","One Death Guard Vehicle unit from your army that has not been selected to move or charge this phase.","Until the end of the phase, each time your unit makes a Normal, Advance or Charge move, it can move horizontally through terrain features.",""],
  ["Stinking Mire","Mortarion’s Hammer","Ruse Stratégique",1,"Start of your opponent’s Charge phase.","One friendly unengaged DEATH GUARD VEHICLE unit.","Select one visible enemy unit within 12\" of your unit. When that enemy unit declares a charge, that enemy unit has -1 to charge rolls.",""],
  ["Aggravus Spasms","Paragons of Putrescence","",1,"Start of your Shooting Phase.","One friendly DEATH GUARD CHARACTER unit.","Select one visible enemy unit within Contagion Range of your unit. That enemy unit has +6\" detection range.",""],
  ["Simultaneous Contamination","Paragons of Putrescence","",1,"Your Shooting phase, when a friendly DEATH GUARD CHARACTER unit starts an action.","That DEATH GUARD CHARACTER unit.","That action does not prevent your unit from being eligible to shoot.",""],
  ["Territorial Infection","Paragons of Putrescence","",1,"Start of the Command phase.","One friendly DEATH GUARD CHARACTER unit.","Your unit has +1 OC until the end of the turn.",""],
  ["Gnawing Hunger","Shamblerot Vectorium","Tactique de Bataille",1,"Your Command phase.","One Poxwalkers unit from your army.","Until the end of the turn, add 1 to the Move characteristic of models in your unit, and add 1 to the Attacks and Strength characteristics of melee weapons equipped by models in your unit.",""],
  ["Grip of the Walking Pox","Shamblerot Vectorium","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Poxwalkers unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","After the attacking unit has fought, roll one D6 for each model from your unit that was destroyed as a result of those attacks: on a 6, the attacking unit suffers 1 mortal wound. If your unit is not destroyed after the attacking unit has fought, enemy models destroyed as a result of this Stratagem count as enemy models destroyed by an attack made by a model in your unit for the purposes of the Curse of the Walking Pox ability.",""],
  ["Hidden Amongst the Dead","Shamblerot Vectorium","Ruse Stratégique",1,"The Reinforcements step of your Movement phase.","One Poxwalkers unit from your army that is in Strategic Reserves and that is not an Attached unit.","Until the end of the phase, models in that unit have the Deep Strike ability.",""],
  ["Shambling Wall","Shamblerot Vectorium","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Death Guard unit from your army that was selected as the target of one or more of the attacking unit’s attacks, and one friendly Poxwalkers unit within 3\" of your unit and visible to both your unit and the attacking unit.","Until the end of the phase, each time you would allocate an attack to a model in your DEATH GUARD unit, if your POXWALKERS unit is visible to the attacking model and is an eligible target for that attack, no saving throw is made for that attack; instead a number of POXWALKERS from your POXWALKERS unit equal to the Damage characteristic of that attack are destroyed.",""],
  ["Shock and Horror","Shamblerot Vectorium","Ruse Stratégique",1,"Your Charge phase, just after a Death Guard unit from your army ends a Charge move.","That DEATH GUARD unit.","Each enemy unit within Engagement Range of your unit must take a Battle-shock test, subtracting 1 from that test.",""],
  ["Smeared With Filth","Shamblerot Vectorium","Ruse Stratégique",1,"Fight phase.","One Poxwalkers unit from your army that was just destroyed. You can target that unit with this Stratagem even though it was just destroyed.","Select one enemy unit that made one or more attacks that targeted your unit this phase. Until the end of the battle, that enemy unit is Afflicted.",""],
  ["All Is Rot","Tallyband Summoners","Ruse Stratégique",1,"Your Shooting phase.","One Plague Legions unit from your army that is within Engagement Range of one or more enemy units.","Until the end of the phase, enemy units are not considered to be within Engagement Range of your unit for the purposes of selecting targets of ranged weapons. Until the end of the phase, each time an enemy model loses a wound, while that model’s unit is within Engagement Range of your unit, roll one D6: on a 5+, your unit suffers 1 mortal wound after the attacking unit has finished making its attacks.",""],
  ["Avatars of Decay","Tallyband Summoners","Ruse Stratégique",1,"Your Shooting phase.","One Plague Legions unit from your army.","Until the end of the phase, while an enemy unit is within 6\" of your unit, that enemy unit is Afflicted.",""],
  ["Clutching Corruption","Tallyband Summoners","Tactique de Bataille",1,"Fight phase.","One Death Guard unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit that is within Engagement Range of one or more Plague Legions units from your army, you can re-roll the Hit roll.",""],
  ["Fleshy Avalanche","Tallyband Summoners","Ruse Stratégique",1,"Your Movement phase or your Charge phase.","One Plague Legions Monster unit from your army that has not been selected to move or charge this phase.","Until the end of the phase, each time your unit makes a Normal, Advance or Charge move, it can move horizontally through terrain features.",""],
  ["Mireslick","Tallyband Summoners","Ruse Stratégique",1,"Your opponent’s Movement phase, when an enemy unit (excluding MONSTERS and VEHICLES) is selected to Fall Back.","One Plague Legions unit from your army that is within Engagement Range of that enemy unit.","Until the end of the phase, while an enemy unit is within Engagement Range of your unit, each time that unit is selected to Fall Back, it must take a Leadership test. If that test is failed, that unit must Remain Stationary this phase instead.",""],
  ["Persistent Pests","Tallyband Summoners","Ruse Stratégique",1,"Any phase.","One Nurglings unit from your army that was just destroyed. You can target that unit with this Stratagem even though it was just destroyed.","Add a new unit to your army identical to your destroyed unit, in Strategic Reserves, at its Starting Strength and with its full wounds remaining.","You can only use this Stratagem once per battle."],
  ["Creeping Blight","Virulent Vectorium","Équipement",1,"Your Shooting phase.","One Death Guard Infantry unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes a ranged attack that targets an Afflicted unit, you can re-roll the Hit roll and you can re-roll the Wound roll.",""],
  ["Disgustingly Resilient","Virulent Vectorium","Tactique de Bataille",2,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Death Guard unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.",""],
  ["Leechspore Eruption","Virulent Vectorium","Fait Épique",1,"Your Command phase.","One Death Guard model your army that has lost one or more wounds.","Select one enemy unit within 3\" of your model. Roll a number of D6 equal to the number of wounds your model has lost: for each 5+, that enemy unit suffers one mortal wound (to a maximum of 6 mortal wounds) and your model regains 1 lost wound (to a maximum of 6 lost wounds).",""],
  ["Overwhelming Generosity","Virulent Vectorium","Équipement",1,"Start of your Shooting phase.","One Death Guard Character unit from your army.","Select one enemy unit visible to your unit. Until the end of the phase, each time a DEATH GUARD unit from your army selects that enemy unit as the target of any ranged attacks, you can re-roll the dice to determine how many attacks a weapon equipped by a model in that unit makes.",""],
  ["Plaguesurge","Virulent Vectorium","Fait Épique",2,"Your Command phase.","Your Death Guard WARLORD that is on the battlefield.","Until the start of your next Command phase, add 3\" to the Contagion Range of models from your army.",""],
  ["Putrid Detonation","Virulent Vectorium","Ruse Stratégique",1,"Any phase.","One Death Guard Vehicle or Death Guard Monster model from your army with the Deadly Demise ability that was just destroyed. You can use this Stratagem on that model even though it was just destroyed.","Do not roll one D6 to determine whether mortal wounds are inflicted by your model’s Deadly Demise ability. Instead, mortal wounds are automatically inflicted. In addition, any enemy units that suffer mortal wounds as a result of this Stratagem are Afflicted until the start of your next turn.",""],
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
  "Chaos Land Raider",
  "Chaos Predator Annihilator",
  "Chaos Predator Destructor",
  "Chaos Rhino",
  "Defiler",
  "Foetid Bloat-drone",
  "Foetid Bloat-drone with heavy blight launcher",
  "Helbrute",
  "Plagueburst Crawler"
 ],
 "monster": [
  "Daemon Prince of Nurgle",
  "Daemon Prince of Nurgle with wings",
  "Great Unclean One"
 ],
 "battleline": [
  "Plague Marines",
  "Plaguebearers"
 ],
 "epic": [
  "Mortarion",
  "Rotigus",
  "Typhus"
 ],
 "infantry": [
  "Blightlord Terminators",
  "Death Guard Cultists",
  "Death Guard Possessed",
  "Deathshroud Terminators",
  "Poxwalkers"
 ],
 "character": [
  "Biologus Putrifier",
  "Death Guard Chaos Lord",
  "Death Guard Chaos Lord in Terminator Armour",
  "Death Guard Sorcerer in Terminator Armour",
  "Foul Blightspawn",
  "Icon Bearer",
  "Lord of Contagion",
  "Lord of Poxes",
  "Lord of Virulence",
  "Malignant Plaguecaster",
  "Noxious Blightbringer",
  "Plague Surgeon",
  "Tallyman"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Daemon Prince of Nurgle": "60",
 "Daemon Prince of Nurgle with wings": "60",
 "Typhus": "50",
 "Lord of Virulence": "50",
 "Lord of Contagion": "40",
 "Malignant Plaguecaster": "32",
 "Plague Marines": "32",
 "Poxwalkers": "25",
 "Noxious Blightbringer": "40",
 "Foul Blightspawn": "40",
 "Biologus Putrifier": "40",
 "Tallyman": "40",
 "Plague Surgeon": "40",
 "Deathshroud Terminators": "40",
 "Helbrute": "60",
 "Blightlord Terminators": "40",
 "Chaos Spawn": "50",
 "Foetid Bloat-drone": "60",
 "Plagueburst Crawler": "coque",
 "Chaos Land Raider": "coque",
 "Chaos Predator Annihilator": "coque",
 "Chaos Predator Destructor": "coque",
 "Chaos Rhino": "coque",
 "Mortarion": "100",
 "Icon Bearer": "32",
 "Miasmic Malignifier": "coque",
 "Lord of Poxes": "40",
 "Great Unclean One": "130",
 "Rotigus": "130",
 "Plaguebearers": "32",
 "Plague Drones": "120x92",
 "Beasts of Nurgle": "60",
 "Nurglings": "40",
 "Foetid Bloat-drone with heavy blight launcher": "60",
 "Defiler": "160"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Chaos Land Raider": 5,
 "Mortarion": 6,
 "Great Unclean One": 7,
 "Rotigus": 7
};

const TRANSPORTS = {
 "Chaos Land Raider": "This model has a transport capacity of 14 ^^**Death Guard Infantry^^** models. Each ^^**Terminator^^** model takes up the space of 2 models.",
 "Chaos Rhino": "This model has a transport capacity of 12 ^^**Death Guard Infantry**^^ models. It cannot transport ^^**Terminator**^^ models."
};
const FACTION = [
 [
  "Nurgle's Gift (Aura)",
  "If your Army Faction is DEATH GUARD, while an enemy unit is within Contagion Range of one or more Death Guard units from your army, it is Afflicted.\n\nCONTAGION RANGE\n1st Battle Round: Contagion Range = 3\"\n2nd Battle Round: Contagion Range = 6\"\n3rd Battle Round Onwards: Contagion Range = 9\"\n\nContagion Range cannot be greater than 12\" after modifiers.\n\nAFFLICTED\n\nDuring the Declare Battle Formations step, select one of the Plagues below. Until the end of the battle, while an enemy unit is Afflicted, subtract 1 from the Toughness characteristic of models in that unit, and that unit has the effect of your chosen Plague.\n\nSkullsquirm Blight\n- Each time a model in this unit makes a ranged attack, enemy units have the benefit of cover against that attack.\n- Each time a model in this unit makes a melee attack, subtract 1 from the Hit roll.\n\nRattlejoint Ague\nWorsen the Save characteristic of models in this unit by 1.\n\nScabrous Soulrot\nWorsen the Move, Leadership and Objective Control characteristics of models in this unit by 1 (this rule can only worsen a model's Objective Control characteristic to a minimum of 1)."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/deathguard.json —
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
  cle : "deathguard",
  nom : "Death Guard",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
