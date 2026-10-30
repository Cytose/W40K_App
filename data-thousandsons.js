/* ============================================================
   Données Thousand Sons — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py thousandsons

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
     34 fiches sur 34 en ont un. Les autres — des Legends, que le
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
  ["Ahriman",10,5,3,4,6,[1],{"1": 105},0,"Meneur",0,"",2,"6+"],
  ["Blue Horrors",6,3,7,4,1,[10],{"10": 90},0,"",0,"",0,"8+"],
  ["Chaos Land Raider",10,12,2,0,16,[1],[[1, {"1": 220}], [3, {"1": 240}]],0,"",0,"",5,"6+"],
  ["Chaos Predator Annihilator",10,10,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Chaos Predator Destructor",10,10,3,0,11,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Chaos Rhino",12,9,3,0,10,[1],[[1, {"1": 80}], [4, {"1": 90}]],0,"",0,"",2,"6+"],
  ["Chaos Spawn",8,5,4,5,4,[2],{"2": 65},0,"",0,"",1,"7+"],
  ["Chaos Vindicator",9,11,2,0,11,[1],[[1, {"1": 185}], [3, {"1": 195}]],0,"",0,"",3,"6+"],
  ["Daemon Prince of Tzeentch",9,10,2,4,10,[1],{"1": 170},0,"",0,"",3,"6+"],
  ["Daemon Prince of Tzeentch with wings",13,9,2,4,10,[1],[[1, {"1": 170}], [2, {"1": 180}]],0,"",0,"",3,"6+"],
  ["Defiler",12,11,3,5,18,[1],[[1, {"1": 300}], [2, {"1": 350}]],0,"",0,"",5,"6+"],
  ["Exalted Sorcerer",6,5,3,4,5,[1],{"1": 100},0,"Meneur",0,"",1,"6+"],
  ["Exalted Sorcerer on Disc of Tzeentch",10,5,3,4,6,[1],{"1": 95},0,"Meneur",0,"",2,"6+"],
  ["Flamers",9,4,7,4,3,[3, 6],{"3": 65, "6": 130},0,"",0,"",1,"7+"],
  ["Forgefiend",8,10,3,5,12,[1],[[1, {"1": 135}], [3, {"1": 145}]],0,"",0,"",3,"6+"],
  ["Helbrute",8,9,2,5,8,[1],{"1": 110},0,"",0,"",3,"6+"],
  ["Heldrake",12,9,3,5,12,[1],{"1": 175},0,"",0,"",0,"6+"],
  ["Infernal Master",6,5,3,5,4,[1],{"1": 105},0,"Meneur",0,"",1,"6+"],
  ["Kairos Fateweaver",12,10,6,4,20,[1],{"1": 305},0,"",0,"",5,"6+"],
  ["Lord of Change",12,10,6,4,18,[1],[[1, {"1": 320}], [3, {"1": 340}]],0,"",0,"",5,"6+"],
  ["Magnus the Red",14,11,2,4,16,[1],{"1": 455},0,"",0,"",6,"5+"],
  ["Maulerfiend",10,10,3,5,12,[1],[[1, {"1": 120}], [3, {"1": 130}]],0,"",0,"",3,"6+"],
  ["Mutalith Vortex Beast",10,10,4,5,13,[1],[[1, {"1": 170}], [3, {"1": 190}]],0,"",0,"",4,"6+"],
  ["Pink Horrors",6,3,7,4,1,[10],{"10": 115},0,"",0,"",0,"8+"],
  ["Rubric Marines",6,5,3,5,2,[5, 10],[[1, {"5": 115, "10": 210}], [4, {"5": 125, "10": 220}]],0,"",0,"",2,"7+"],
  ["Scarab Occult Terminators",5,6,2,4,4,[5, 10],[[1, {"5": 200, "10": 425}], [3, {"5": 240, "10": 465}]],0,"",0,"",1,"6+"],
  ["Screamers",14,4,6,4,3,[3, 6],{"3": 80, "6": 160},0,"",0,"",1,"7+"],
  ["Sekhetar Robots",8,6,3,5,4,[2, 4],[[1, {"2": 85, "4": 175}], [3, {"2": 100, "4": 190}]],0,"",0,"",1,"7+"],
  ["Sorcerer",6,5,3,5,4,[1],[[1, {"1": 100}], [3, {"1": 110}]],0,"Meneur",0,"",1,"6+"],
  ["Sorcerer in Terminator Armour",5,6,2,4,5,[1],[[1, {"1": 110}], [3, {"1": 120}]],0,"Meneur",0,"",1,"6+"],
  ["Tzaangor Enlightened",10,4,5,5,2,[3, 6],{"3": 50, "6": 90},0,"",0,"",2,"7+"],
  ["Tzaangor Enlightened with Fatecaster greatbows",10,4,5,5,2,[3, 6],{"3": 55, "6": 110},0,"",0,"",2,"7+"],
  ["Tzaangor Shaman",10,4,5,5,4,[1],{"1": 65},0,"Meneur",0,"",2,"7+"],
  ["Tzaangors",6,4,6,6,1,[10, 20],{"10": 75, "20": 145},0,"",0,"",1,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Ahriman","Inferno bolt pistol","T","1",2,5,2,"1","pistol","12\""],
  ["Ahriman","Transmogrifying Blast","T","D6+1",2,6,1,"D3","blast psychic","18\""],
  ["Ahriman","Black Staff of Ahriman","C","5",2,7,1,"3","psychic","càc"],
  ["Blue Horrors","Coruscating Blue flames","T","2",4,3,1,"1","pistol psychic","18\""],
  ["Blue Horrors","Coruscating Yellow flames (ref. only)","T","2",5,2,1,"1","pistol psychic","18\""],
  ["Blue Horrors","Blue claws","C","1",5,3,0,"1","","càc"],
  ["Blue Horrors","Yellow claws (ref. only)","C","2",5,2,0,"1","","càc"],
  ["Chaos Land Raider","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Land Raider","Inferno combi-bolter","T","2",3,5,2,"1","rf:2","24\""],
  ["Chaos Land Raider","Inferno combi-weapon","T","1",4,5,2,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Land Raider","Soulshatter lascannon","T","2",3,12,3,"D6+1","","48\""],
  ["Chaos Land Raider","Twin inferno heavy bolter","T","3",3,5,2,"2","sust:1 twin","36\""],
  ["Chaos Land Raider","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Chaos Predator Annihilator","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Predator Annihilator","Inferno combi-bolter","T","2",3,5,2,"1","rf:2","24\""],
  ["Chaos Predator Annihilator","Inferno combi-weapon","T","1",4,5,2,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Predator Annihilator","Inferno heavy bolter","T","3",3,5,2,"2","sust:1","36\""],
  ["Chaos Predator Annihilator","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Chaos Predator Annihilator","Predator twin lascannon","T","1",3,14,3,"D6+1","twin","48\""],
  ["Chaos Predator Annihilator","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Predator Destructor","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Predator Destructor","Inferno combi-bolter","T","2",3,5,2,"1","rf:2","24\""],
  ["Chaos Predator Destructor","Inferno combi-weapon","T","1",4,5,2,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Predator Destructor","Inferno heavy bolter","T","3",3,5,2,"2","sust:1","36\""],
  ["Chaos Predator Destructor","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Chaos Predator Destructor","Predator autocannon","T","4",3,9,1,"3","rf:2","48\""],
  ["Chaos Predator Destructor","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Rhino","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Rhino","Inferno combi-bolter","T","2",3,5,2,"1","rf:2","24\""],
  ["Chaos Rhino","Inferno combi-weapon","T","1",4,5,2,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Rhino","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Spawn","Hideous Mutations","C","D6+2",4,5,1,"2","","càc"],
  ["Chaos Vindicator","Demolisher cannon","T","D6+3",3,14,3,"D6","blast","24\""],
  ["Chaos Vindicator","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Vindicator","Inferno combi-bolter","T","2",3,5,2,"1","rf:2","24\""],
  ["Chaos Vindicator","Inferno combi-weapon","T","1",4,5,2,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Vindicator","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Daemon Prince of Tzeentch","Dark Blessing","T","9",2,4,1,"1","ignorescover psychic sust:1","24\""],
  ["Daemon Prince of Tzeentch","Infernal cannon","T","3",2,5,2,"2","","24\""],
  ["Daemon Prince of Tzeentch","➤ Hellforged weapons - strike","C","6",2,8,2,"3","dev psychic","càc"],
  ["Daemon Prince of Tzeentch","➤ Hellforged weapons - sweep","C","12",2,6,1,"1","dev psychic","càc"],
  ["Daemon Prince of Tzeentch with wings","Dark Blessing","T","9",2,4,1,"1","ignorescover psychic sust:1","24\""],
  ["Daemon Prince of Tzeentch with wings","Infernal cannon","T","3",2,5,2,"2","","24\""],
  ["Daemon Prince of Tzeentch with wings","➤ Hellforged weapons - strike","C","6",2,8,2,"3","dev psychic","càc"],
  ["Daemon Prince of Tzeentch with wings","➤ Hellforged weapons - sweep","C","12",2,6,1,"1","dev psychic","càc"],
  ["Defiler","Ectoplasma destructor","T","D6",3,12,3,"3","blast","36\""],
  ["Defiler","Excruciator cannon","T","6",3,6,2,"2","","36\""],
  ["Defiler","Hades battle cannon","T","D6+3",3,10,1,"3","blast","48\""],
  ["Defiler","Hades lascannon","T","2",3,12,3,"D6+1","","48\""],
  ["Defiler","Heavy baleflamer","T","D6+3",0,7,2,"2","ignorescover torrent","12\""],
  ["Defiler","Heavy reaper autocannon","T","4",3,9,2,"3","dev sust:1","48\""],
  ["Defiler","Pyraflux magma cutter","T","2",3,10,4,"D6","melta:2","12\""],
  ["Defiler","➤ Heavy missile launcher - frag","T","2D6",3,5,1,"1","blast","48\""],
  ["Defiler","➤ Heavy missile launcher - krak","T","2",3,10,2,"D6+1","","48\""],
  ["Defiler","Electroscourge","C","5",3,12,2,"2","extra sust:2","càc"],
  ["Defiler","Shearing claws - strike","C","5",3,16,3,"D6+1","","càc"],
  ["Defiler","Shearing claws - sweep","C","10",3,6,2,"1","","càc"],
  ["Exalted Sorcerer","Astral Blast","T","D6",2,6,2,"D3","blast dev psychic","18\""],
  ["Exalted Sorcerer","Inferno bolt pistol","T","1",2,5,2,"1","pistol","12\""],
  ["Exalted Sorcerer","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Exalted Sorcerer","Prosperine khopesh","C","4",2,5,2,"2","","càc"],
  ["Exalted Sorcerer on Disc of Tzeentch","Arcane Fire","T","D6",0,6,2,"D3","ignorescover psychic torrent","18\""],
  ["Exalted Sorcerer on Disc of Tzeentch","Inferno bolt pistol","T","1",2,5,2,"1","pistol","12\""],
  ["Exalted Sorcerer on Disc of Tzeentch","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Exalted Sorcerer on Disc of Tzeentch","Prosperine khopesh","C","4",2,5,2,"2","","càc"],
  ["Flamers","Flickering flames","T","D6",0,4,1,"1","ignorescover psychic torrent","12\""],
  ["Flamers","Flamer mouths","C","3",4,4,0,"1","","càc"],
  ["Forgefiend","Ectoplasma cannon","T","D3",3,10,3,"3","blast","36\""],
  ["Forgefiend","Hades autocannon","T","6",3,8,2,"2","","36\""],
  ["Forgefiend","Forgefiend claws","C","3",3,6,0,"1","","càc"],
  ["Forgefiend","Forgefiend jaws","C","5",3,7,0,"2","","càc"],
  ["Helbrute","Heavy flamer","T","D6",0,5,2,"1","ignorescover torrent","12\""],
  ["Helbrute","Helbrute plasma cannon","T","D3",3,8,3,"3","blast hazardous","36\""],
  ["Helbrute","Inferno combi-bolter","T","2",3,5,2,"1","rf:2","24\""],
  ["Helbrute","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Helbrute","Twin autocannon","T","2",3,9,1,"3","twin","48\""],
  ["Helbrute","Twin inferno heavy bolter","T","3",3,5,2,"2","sust:1 twin","36\""],
  ["Helbrute","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Helbrute","➤ Missile launcher - frag","T","D6",3,4,0,"1","blast","48\""],
  ["Helbrute","➤ Missile launcher - krak","T","1",3,9,2,"D6","","48\""],
  ["Helbrute","Close combat weapon","C","5",3,6,0,"1","","càc"],
  ["Helbrute","Helbrute fist","C","5",3,12,2,"3","","càc"],
  ["Helbrute","Helbrute hammer","C","5",4,14,3,"D6+1","","càc"],
  ["Helbrute","Power scourge","C","8",3,7,1,"2","","càc"],
  ["Heldrake","Baleflamer","T","D6+3",0,6,2,"2","ignorescover torrent","12\""],
  ["Heldrake","Hades autocannon","T","6",3,8,2,"2","","36\""],
  ["Heldrake","Heldrake claws","C","5",3,7,1,"2","anti:2:vol dev","càc"],
  ["Infernal Master","Inferno bolt pistol","T","1",2,5,2,"1","pistol","12\""],
  ["Infernal Master","➤ Fires of the Abyss - focused witchfire","T","2D6",0,6,2,"1","hazardous psychic torrent","18\""],
  ["Infernal Master","➤ Fires of the Abyss - witchfire","T","D6",0,6,2,"1","psychic torrent","18\""],
  ["Infernal Master","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Kairos Fateweaver","➤ Infernal Gateway - focused witchfire","T","D3+6",2,9,2,"3","blast hazardous indirect psychic","24\""],
  ["Kairos Fateweaver","➤ Infernal Gateway - witchfire","T","D6+3",2,9,2,"D3","blast indirect psychic","24\""],
  ["Kairos Fateweaver","Staff of Tomorrow","C","5",3,8,2,"2D3","psychic","càc"],
  ["Lord of Change","Rod of sorcery","T","6",2,8,1,"2","psychic","18\""],
  ["Lord of Change","➤ Bolt of Change - focused witchfire","T","9",2,9,2,"3","hazardous psychic","18\""],
  ["Lord of Change","➤ Bolt of Change - witchfire","T","9",2,9,1,"1","psychic","18\""],
  ["Lord of Change","Baleful sword","C","3",3,7,2,"3","extra","càc"],
  ["Lord of Change","Staff of Tzeentch","C","5",3,6,1,"3","psychic","càc"],
  ["Magnus the Red","Gaze of Magnus","T","3D3",2,11,2,"3","dev psychic","24\""],
  ["Magnus the Red","Tzeentch's Firestorm","T","D6+3",2,6,1,"2","blast ignorescover psychic","24\""],
  ["Magnus the Red","➤ Blade of Magnus - strike","C","7",2,16,3,"3","dev psychic","càc"],
  ["Magnus the Red","➤ Blade of Magnus - sweep","C","14",2,8,1,"2","psychic","càc"],
  ["Maulerfiend","Magma cutter","T","2",3,9,4,"D6","melta:2","6\""],
  ["Maulerfiend","Lasher tendrils","C","6",3,7,1,"1","extra","càc"],
  ["Maulerfiend","Maulerfiend fists","C","6",3,14,2,"D6+1","","càc"],
  ["Mutalith Vortex Beast","➤ Warp vortex - beam","T","1",3,18,3,"D6+6","dev","36\""],
  ["Mutalith Vortex Beast","➤ Warp vortex - blast","T","D6+3",3,9,2,"2","blast","24\""],
  ["Mutalith Vortex Beast","➤ Warp vortex - torrent","T","2D6",0,6,1,"1","ignorescover torrent","18\""],
  ["Mutalith Vortex Beast","Betentacled maw","C","15",3,7,0,"1","","càc"],
  ["Mutalith Vortex Beast","Mutalith claws","C","5",3,10,2,"3","","càc"],
  ["Pink Horrors","Coruscating blue flames (ref. only)","T","2",4,3,1,"1","pistol psychic","18\""],
  ["Pink Horrors","Coruscating pink flames","T","2",3,4,1,"1","pistol psychic","18\""],
  ["Pink Horrors","Coruscating yellow flames (ref. only)","T","2",5,2,1,"1","pistol psychic","18\""],
  ["Pink Horrors","Blue claws (ref. only)","C","1",5,3,0,"1","","càc"],
  ["Pink Horrors","Pink claws","C","1",4,3,0,"1","","càc"],
  ["Pink Horrors","Yellow claws (ref. only)","C","2",5,2,0,"1","","càc"],
  ["Rubric Marines","Inferno bolt pistol","T","1",3,5,2,"1","pistol","12\""],
  ["Rubric Marines","Inferno boltgun","T","2",3,5,2,"1","","24\""],
  ["Rubric Marines","Malefic Curse","T","3",3,4,3,"1","anti:4:inf dev psychic","24\""],
  ["Rubric Marines","Soulreaper cannon","T","6",3,6,2,"1","dev","24\""],
  ["Rubric Marines","Warpflame pistol","T","D6",0,3,1,"1","ignorescover pistol torrent","12\""],
  ["Rubric Marines","Warpflamer","T","D6",0,4,1,"1","ignorescover torrent","12\""],
  ["Rubric Marines","Close combat weapon","C","2",3,5,0,"1","","càc"],
  ["Rubric Marines","Force weapon","C","3",3,6,1,"D3","psychic","càc"],
  ["Scarab Occult Terminators","Heavy warpflamer","T","D6",0,5,2,"1","ignorescover torrent","12\""],
  ["Scarab Occult Terminators","Hellfyre missile rack","T","2",3,10,2,"3","","36\""],
  ["Scarab Occult Terminators","Inferno combi-bolter","T","2",3,5,2,"1","rf:2","24\""],
  ["Scarab Occult Terminators","Malefic Curse","T","3",3,4,3,"1","anti:4:inf dev psychic","24\""],
  ["Scarab Occult Terminators","Soulreaper cannon","T","6",3,6,2,"1","dev","24\""],
  ["Scarab Occult Terminators","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Scarab Occult Terminators","Prosperine khopesh","C","3",3,5,2,"2","","càc"],
  ["Screamers","Lamprey bite","C","3",3,6,2,"2","anti:4:mon anti:4:veh","càc"],
  ["Sekhetar Robots","Heavy warpflamer","T","D6",0,5,2,"1","ignorescover torrent","12\""],
  ["Sekhetar Robots","Hellfyre missile rack","T","2",4,10,2,"3","","36\""],
  ["Sekhetar Robots","Pyreflux meltagun","T","1",4,10,4,"D6","melta:2","12\""],
  ["Sekhetar Robots","Warpflame projector","T","D3",0,3,1,"1","ignorescover torrent","12\""],
  ["Sekhetar Robots","Close combat weapon","C","3",4,5,0,"1","","càc"],
  ["Sekhetar Robots","Power claw","C","3",4,10,2,"2","","càc"],
  ["Sorcerer","Inferno bolt pistol","T","1",2,5,2,"1","pistol","12\""],
  ["Sorcerer","Pandaemonic Delusion","T","6",3,5,1,"1","psychic sust:3","24\""],
  ["Sorcerer","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Sorcerer","Prosperine khopesh","C","3",3,5,2,"2","","càc"],
  ["Sorcerer in Terminator Armour","Gaze of Hate","T","3",3,4,3,"2","anti:4:mon anti:4:veh dev psychic","18\""],
  ["Sorcerer in Terminator Armour","Inferno combi-bolter","T","2",3,5,2,"1","rf:2","24\""],
  ["Sorcerer in Terminator Armour","Inferno combi-weapon","T","1",4,5,2,"1","anti:4:inf dev rf:1","24\""],
  ["Sorcerer in Terminator Armour","Force weapon","C","4",3,6,1,"D3","psychic","càc"],
  ["Tzaangor Enlightened","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Tzaangor Enlightened","Chainsword","C","6",4,4,0,"1","precision","càc"],
  ["Tzaangor Enlightened","Divining spear","C","3",4,5,1,"2","lance precision","càc"],
  ["Tzaangor Enlightened with Fatecaster greatbows","Fatecaster greatbow","T","2",4,5,2,"2","ignorescover lethal precision","30\""],
  ["Tzaangor Enlightened with Fatecaster greatbows","Close combat weapon","C","2",4,4,0,"1","","càc"],
  ["Tzaangor Shaman","Baleful Devolution","T","D6",3,9,0,"1","blast dev psychic","18\""],
  ["Tzaangor Shaman","Force stave","C","3",3,5,1,"D3","psychic","càc"],
  ["Tzaangors","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Tzaangors","Chainsword","C","3",4,4,0,"1","","càc"],
  ["Tzaangors","Tzaangor blades","C","2",4,5,0,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Ahriman","Epic Hero"],
  ["Blue Horrors","Battleline"],
  ["Chaos Land Raider","Véhicule"],
  ["Chaos Predator Annihilator","Véhicule"],
  ["Chaos Predator Destructor","Véhicule"],
  ["Chaos Rhino","Véhicule"],
  ["Chaos Spawn","Bête"],
  ["Chaos Vindicator","Véhicule"],
  ["Daemon Prince of Tzeentch","Monstre"],
  ["Daemon Prince of Tzeentch with wings","Monstre"],
  ["Defiler","Véhicule"],
  ["Exalted Sorcerer","Personnage"],
  ["Exalted Sorcerer on Disc of Tzeentch","Personnage"],
  ["Flamers","Infanterie"],
  ["Forgefiend","Véhicule"],
  ["Helbrute","Véhicule"],
  ["Heldrake","Véhicule"],
  ["Infernal Master","Personnage"],
  ["Kairos Fateweaver","Epic Hero"],
  ["Lord of Change","Monstre"],
  ["Magnus the Red","Epic Hero"],
  ["Maulerfiend","Véhicule"],
  ["Mutalith Vortex Beast","Monstre"],
  ["Pink Horrors","Battleline"],
  ["Rubric Marines","Battleline"],
  ["Scarab Occult Terminators","Infanterie"],
  ["Screamers","Bête"],
  ["Sekhetar Robots","Véhicule"],
  ["Sorcerer","Personnage"],
  ["Sorcerer in Terminator Armour","Personnage"],
  ["Tzaangor Enlightened","Monté"],
  ["Tzaangor Enlightened with Fatecaster greatbows","Monté"],
  ["Tzaangor Shaman","Personnage"],
  ["Tzaangors","Infanterie"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Ahriman": [
  "Rubric Marines",
  "Tzaangor Enlightened",
  "Tzaangor Enlightened with Fatecaster greatbows"
 ],
 "Exalted Sorcerer": [
  "Rubric Marines"
 ],
 "Exalted Sorcerer on Disc of Tzeentch": [
  "Rubric Marines",
  "Tzaangor Enlightened",
  "Tzaangor Enlightened with Fatecaster greatbows"
 ],
 "Infernal Master": [
  "Rubric Marines"
 ],
 "Sorcerer": [
  "Rubric Marines"
 ],
 "Sorcerer in Terminator Armour": [
  "Scarab Occult Terminators"
 ],
 "Tzaangor Shaman": [
  "Tzaangor Enlightened",
  "Tzaangor Enlightened with Fatecaster greatbows",
  "Tzaangors"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Ahriman": [
  [
   "Scryer of Fates (Psychic)",
   "if your army includes this model, after both players have deployed their armies, you can select up to 3 Thousand Sons units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Arch-Sorcerer of Tzeentch (Psychic)",
   "Each time this model attempts a Ritual, add 1 to the Psychic test result."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: RUBRIC MARINES, TZAANGOR ENLIGHTENED, TZAANGOR ENLIGHTENED WITH FATECASTER GREATBOWS"
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Chaos Land Raider": [
  [
   "Assault Ramp",
   "Each time a unit disembarks from this Transport after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Chaos Predator Annihilator": [
  [
   "Ensorcelled Annihilation",
   "Each time this model makes a ranged attack that targets a Monster or Vehicle unit that was hit by one or more Psychic attacks made by a Thousand Sons Psyker unit from your army this turn, you can re-roll the Hit roll and you can re-roll the Damage roll."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Chaos Predator Destructor": [
  [
   "Ensorcelled Destruction",
   "Each time this model makes a ranged attack that targets a unit (excluding Monsters and Vehicles) that was hit by one or more Psychic attacks made by a Thousand Sons Psyker unit from your army this turn, improve the Strength and Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Chaos Rhino": [
  [
   "Sorcerous Support",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes a Psychic attack that targets that enemy unit, add 1 to the Hit roll and add 1 to the Wound roll."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Chaos Spawn": [
  [
   "Regenerating Monstrosities",
   "At the start of each player’s Command phase, one model in this unit regains up to 3 lost wounds."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Chaos Vindicator": [
  [
   "Siege Shield",
   "When making ranged attacks with its demolisher cannon, this model can target enemy units within Engagement Range of it (provided no other friendly units are also within Engagement Range of that enemy unit). In addition, when making ranged attacks, this model does not suffer the penalty to its Hit rolls for being within Engagement Range of one or more enemy units."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Exalted Sorcerer": [
  [
   "Arcane Shield (Psychic)",
   "While this model is leading a unit, models in that unit have a 4+ invulnerable save."
  ],
  [
   "Rebind Rubricae (Psychic)",
   "In your Command phase, if this model is leading a unit, you can roll one D6: on a 1, that unit suffers D3 mortal wounds; on a 2-5, you can return 1 destroyed Bodyguard model to that unit; on a 6, you can return up to 2 destroyed Bodyguard models to that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: RUBRIC MARINES"
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Exalted Sorcerer on Disc of Tzeentch": [
  [
   "Illusions of Tzeentch (Psychic)",
   "While this model is leading a unit, that unit can only be selected as the target of a ranged attack if the attacking model is within 18\"."
  ],
  [
   "Binding Tendrils (Psychic)",
   "In your Shooting phase, after this model has shot, select one enemy Infantry unit hit by one or more of those attacks made with Arcane Fire. Until the start of your next turn, that unit is ensnared. While a unit is ensnared, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: RUBRIC MARINES, TZAANGOR ENLIGHTENED, TZAANGOR ENLIGHTENED WITH FATECASTER GREATBOWS"
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Forgefiend": [
  [
   "Blazing Salvos",
   "In your Shooting phase, after this model has shot, select one enemy unit that was hit by one or more of those attacks. Until the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the hit roll."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Helbrute": [
  [
   "Terrifying Assault",
   "In your Shooting phase and the Fight phase, after this model has shot, select one enemy unit hit by one or more of those attacks. That unit must take a Battle-shock test, subtracting 1 if that unit is within 9\" of one or more Thousand Sons Psyker units from your army."
  ],
  [
   "Devoted to Destruction",
   "If this model is equipped with 2 melee weapons in addition to its close combat weapon, add 2 to the Attacks characteristic of those two weapons."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Heldrake": [
  [
   "Flame-wreathed",
   "Each time this model ends a Normal move, select one enemy unit it moved over during that move. Until the end of the turn, models in that unit cannot have the Benefit of Cover."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Infernal Master": [
  [
   "Malefic Maelstrom (Psychic)",
   "While this model is leading a unit, weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Glimpse of Eternity (Psychic)",
   "Once per turn, you can change the result of one Hit roll, one Wound roll or one saving throw made for this model to an unmodified 6."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: RUBRIC MARINES"
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Magnus the Red": [
  [
   "Damaged: 1-6 wounds remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Unearthly Power",
   "At the start of the battle round, select one of the abilities in the Crimson King section. Until the start of the next battle round, this model has that ability."
  ],
  [
   "Lord of the Planet of the Sorcerers (Psychic)",
   "This model can attempt up to 2 Rituals per turn instead of one, and each time this model attempts a Ritual, add 2 to the Psychic test result."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Maulerfiend": [
  [
   "Snarling Protector",
   "You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: \n- That use is -1 CP. \n- That use does not prevent any uses of that stratagem on other units this phase.\n- When this unit declares a charge, if a friendly engaged PSYKER unit is within 12\" of this unit, you can use this part of this ability. \nIf you do: \n- This unit can re-roll that charge roll. \n- This unit must end that charge move engaged with an enemy unit engaged with that friendly PSYKER unit."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Mutalith Vortex Beast": [
  [
   "Mutating Vortex (Aura)",
   "At the end of your Movement phase, roll one D6 for each enemy unit within 6\" of this model: on a 2-3, that unit suffers 1 mortal wound; on a 4-5, that unit suffers D3 mortal wounds; on a 6, that unit suffers D6 mortal wounds. Each enemy unit within range of this ability must then take a Battle-shock test."
  ],
  [
   "Immaterial Flare (Aura)",
   "While a friendly Thousand Sons Psyker model is within 6\" of this model, each time that model Channels the Warp, add 1 to the Psychic test result. This is not cumulative with any other modifiers to the Psychic test result."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Rubric Marines": [
  [
   "Bringers of Change",
   "Each time a model in this unit makes a ranged attack, re-roll a Wound roll of 1. If the attack targets a unit within range of an objective marker you do not control, you can re-roll the Wound roll instead."
  ],
  [
   "Icon of Flame",
   "Ranged weapons equipped by models in the bearer's unit (excluding Characters) have the [Ignores Cover] ability."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Scarab Occult Terminators": [
  [
   "Rites of Coalescence",
   "While this unit contains one or more Psyker models, each time an attack targets this unit, subtract 1 from the\nWound roll."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Sorcerer": [
  [
   "Leader",
   "This model can be attached to the following unit: RUBRIC MARINES"
  ],
  [
   "Twisted Sorceries (Psychic)",
   "Once per battle, in your Shooting phase or the Fight phase, this model can use this ability. If it does, until the end of the phase, improve the Strength and Attacks characteristic of Psychic weapons equipped by this model by 3."
  ],
  [
   "Empyric Guidance (Psychic)",
   "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Sorcerer in Terminator Armour": [
  [
   "Leader",
   "This model can be attached to the following unit: SCARAB OCCULT TERMINATORS"
  ],
  [
   "Marked by Fate (Psychic)",
   "At the start of your Shooting phase, select one enemy unit that is visible to this Psyker model. Until the end of the phase, each time a model in this unit makes an attack that targets that enemy unit, add 1 to the Hit roll."
  ],
  [
   "Empyric Guidance (Psychic)",
   "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Daemon Prince of Tzeentch": [
  [
   "Spirit Snare",
   "Each time a friendly Thousand Sons Psyker model with the Cabal of Sorcerers ability is destroyed while within 9\" of one or more models with this ability, select one of those models with this ability: until the end of the battle, each time the selected model attempts a Ritual, add 1 to the Psychic test result (to a maximum of +2)."
  ],
  [
   "Servile Pawns",
   "While this model is within 3\" of one or more friendly Thousand Sons Infantry units, this model has the Lone Operative ability."
  ],
  [
   "Glamour of Tzeentch (Aura, Psychic)",
   "While a friendly Thousand Sons Infantry unit is within 6\" of this model, models in that unit have the Stealth ability."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Daemon Prince of Tzeentch with wings": [
  [
   "Aetherstride (Psychic)",
   "In your Movement phase, when this model is set up on the battlefield using the Deep Strike ability, it can perform an aetherstride. If it does:\n- It can be set up anywhere on the battlefield more than 6\" horizontally away from all enemy units.\n- Until the end of the turn, its Dark Blessing has the [Sustained Hits D3] ability.\n- Until the end of the turn, it is not eligible to declare a charge."
  ],
  [
   "Hunter of Souls",
   "Each time this model makes an attack that targets a Character unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1 (if that attack targets a Psyker Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll instead). Each time this model destroys a Character unit, this model regains up to D3 lost wounds (if that Character unit was a Psyker, this model regains up to 3 lost wounds instead)."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Tzaangor Enlightened": [
  [
   "Prophesied Doom",
   "Each time this unit makes a Charge move, select one enemy unit within Engagement Range of it, then roll one D6 for each model in this unit that is within Engagement Range of that enemy unit: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Tzaangor Shaman": [
  [
   "Sacrificial Blessing",
   "While this model is leading a unit, in your Shooting phase and the Fight phase, each time that unit is selected to shoot or fight, this model can use this ability. If it does, select one Bodyguard model in that unit; that Bodyguard model is destroyed and, until the end of the phase, add D3 to the Attacks and Strength characteristics of Psychic weapons equipped by this model."
  ],
  [
   "Bestial Prophet",
   "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll."
  ],
  [
   "Leader",
   "This model can be attached to the following units: TZAANGOR ENLIGHTENED, TZAANGOR ENLIGHTENED WITH FATECASTER GREATBOWS, TZAANGORS"
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ],
  [
   "Cabal of Sorcerers",
   "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
  ]
 ],
 "Tzaangors": [
  [
   "Ambushing Hunters",
   "At the end of your opponent's turn, if this unit is more than 6\" horizontally away from all enemy units, you can remove this unit from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Brayhorn",
   "You can re-roll Advance and Charge rolls made for the bearer’s unit."
  ],
  [
   "Herd banner",
   "While the bearer's unit is within range of one or more objective markers you control, improve the Leadership characteristic of models in the bearer's unit by 1."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Sekhetar Robots": [
  [
   "Prophetic Sentinels",
   "Once per turn, when you target this unit with the Fire Overwatch/ Heroic Intervention stratagem, that use is -1 CP."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Tzaangor Enlightened with Fatecaster greatbows": [
  [
   "Malign Trickery",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6\"."
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ],
 "Kairos Fateweaver": [
  [
   "One Head Looks Forward",
   "At the end of your Command phase, if this model is on the battlefield, take a Leadership test for this model; if that test is passed, you gain 1CP."
  ],
  [
   "One Head Looks Back (Aura)",
   "Once per turn, when your opponent targets a unit from their army within 12\" of this model with a stratagem, you can use this ability. If you do, increase the CP cost of that use of that stratagem by 1CP"
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Daemonic Illusions (Aura)",
   "While a friendly Thousand Sons Psyker unit is within 6\" of and visible to this unit, models in that unit have a 4+ invulnerable save against ranged attacks."
  ]
 ],
 "Lord of Change": [
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Daemon Lord of Tzeentch (Aura)",
   "While a friendly Scintillating Legions unit is within 6\" of this model, each time a model in that unit makes a ranged attack, add 1 to the Strength characteristic of that attack."
  ],
  [
   "Master of Magicks (Aura)",
   "In your Shooting phase, select one of the following abilities: [Ignores Cover], [Lethal Hits], [Sustained Hits D3]. Until the end of the phase, this model's Bolt of Change has that ability."
  ],
  [
   "Daemonic Illusions (Aura)",
   "While a friendly Thousand Sons Psyker unit is within 6\" of and visible to this unit, models in that unit have a 4+ invulnerable save against ranged attacks."
  ]
 ],
 "Flamers": [
  [
   "Bounding Leaps",
   "This unit is eligible to shoot in a turn in which it Fell Back."
  ],
  [
   "Daemonic Illusions (Aura)",
   "While a friendly Thousand Sons Psyker unit is within 6\" of and visible to this unit, models in that unit have a 4+ invulnerable save against ranged attacks."
  ]
 ],
 "Screamers": [
  [
   "Slashing Dive",
   "In your Movement phase, after this unit ends a Normal move, select one enemy unit it moved over during that move and roll one D6 for each model in this unit: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Daemonic Illusions (Aura)",
   "While a friendly Thousand Sons Psyker unit is within 6\" of and visible to this unit, models in that unit have a 4+ invulnerable save against ranged attacks."
  ]
 ],
 "Pink Horrors": [
  [
   "Split",
   "Each time a Pink Horror or Blue Horror model in this unit is destroyed, after the attacking unit has finished making its attacks, if this unit is not destroyed, roll one D6 for that model. On a 4+, if it was a Pink Horror, add 2 Blue Horror models to this unit and if it was a Blue Horror, add one Brimstone Horror model to this unit."
  ],
  [
   "Horrors are Pink. Horrors are Blue. Where once there was one, now there are two.",
   "If, at any point, this unit contains no Pink Horrors models, use the Blue Horrors datasheet for this unit. \n\n_Designer’s Note: While this unit contains one or more Pink Horrors models, the Sullen Malevolence and Exploding Horrors abilities from the Blue Horrors datasheet do not apply to this unit._"
  ],
  [
   "Daemonic Icon",
   "Models in the bearer's unit have a Leadership characteristic of 6+"
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer's unit."
  ],
  [
   "Daemonic Illusions (Aura)",
   "While a friendly Thousand Sons Psyker unit is within 6\" of and visible to this unit, models in that unit have a 4+ invulnerable save against ranged attacks."
  ]
 ],
 "Blue Horrors": [
  [
   "Split",
   "Each time a Blue Horror model in this unit is destroyed, after the attacking unit has finished making its attacks, if this unit is not destroyed, roll one D6 for that model. On a 4+, add one Brimstone Horror model to this unit."
  ],
  [
   "Sullen Malevolence (Aura)",
   "While an enemy unit is within 6\" of this unit, if this unit contains one or more Blue Horror models, worsen the Leadership characteristic of models in that enemy unit by 1."
  ],
  [
   "Exploding Horrors",
   "Each time this unit is selected to fight, you can select one enemy unit within Engagement Range of it, then select one or more Brimstone Horror models in this unit. For each Brimstone Horror model you select, roll one D6: on a 4+, that model is destroyed and that enemy unit suffers 1 mortal wound."
  ],
  [
   "Daemonic Illusions (Aura)",
   "While a friendly Thousand Sons Psyker unit is within 6\" of and visible to this unit, models in that unit have a 4+ invulnerable save against ranged attacks."
  ]
 ],
 "Defiler": [
  [
   "Scuttling Walker",
   "Each time this unit makes a Normal, Advance or Fall Back move, it can move through models (excluding Titanic models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed."
  ],
  [
   "Destroyer of Futures (Once per phase, per unit)",
   "You can target this unit with the Counteroffensive stratagem, regardless of any other uses of that stratagem this phase. If you do: \n- That use is -1 CP. \n- That use does not prevent any uses of that stratagem on other units this phase.'"
  ],
  [
   "Mortal Sorcery (Aura)",
   "While a friendly Scintillating Legions Psyker unit from your army is within 6\" of and visible to this unit, that Scintillating Legions unit has the Cabal of Sorcerers ability."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Changehost of Deceit",2,"","Infernal Pacts","Scintillating Legions units from your army have the following the ability: Daemonic Illusions (Aura): While a friendly Thousand Sons Psyker unit is within 6\" of and visible to this unit, models in that unit have a 4+ invulnerable save against ranged attacks. Thousand Sons units from your army have the following ability: Mortal Sorcery (Aura): While a friendly Scintillating Legions Psyker unit is within 6\" of and visible to this unit, that SCINTILLATING LEGIONS unit has the Cabal of Sorcerers ability. RESTRICTIONS You can include Scintillating Legions units in your army, even though they do not have the THOUSAND SONS Faction keyword. The combined points cost of such units you can include in your army is: Incursion: Up to 500 pts Strike Force: Up to 1000 pts Onslaught: Up to 1500 pts No SCINTILLATING LEGIONS models from your army can be your WARLORD.","",0,"","Reconnaissance"],
  ["Grand Coven",3,"","Kindred Sorcery","In your Command phase, you can select one of the abilities listed below to take effect until the start of your next Command phase. You can only select each of these abilities once per battle. Imbued Manifestation Add 6\" to the Range characteristic of ranged Psychic weapons equipped by THOUSAND SONS models from your army. Psychic Maelstrom Each time a THOUSAND SONS model from your army makes an attack with a Psychic weapon, add 1 to the Wound roll. Wrath of the Immaterium Psychic weapons equipped by THOUSAND SONS models from your army have the [devastating wounds] ability.","",0,"","Disruption"],
  ["Hexwarp Thrallband",3,"","Flow of Magic","Certain areas of the battlefield are within your army’s Flow of Magic, as follows: ▪ Your deployment zone is always within your army’s Flow of Magic. ▪ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Flow of Magic. ▪ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Flow of Magic. Each time a THOUSAND SONS model from your army makes a Psychic Attack, re-roll a Wound roll of 1. If such a model is wholly within your army’s Flow of Magic, each time it makes a Psychic Attack, add 1 to the Wound roll instead.","",0,"","Take and Hold"],
  ["Ritual of Regeneration",1,"","Sorcerous Invigoration","(Once per turn, per unit) When a friendly THOUSAND SONS PSYKER unit (excluding MONSTER units) successfully manifests a Ritual, that unit heals D3 wounds.","",0,"","Take and Hold"],
  ["Rubricae Phalanx",3,"","All is Dust","Each time an attack with an unmodified Damage characteristic of 1 is allocated to a Rubricae model from your army, add 1 to any armour saving throw made against that attack.","",0,"","Take and Hold"],
  ["Sekhetar Cohort",1,"","Ensorcelled Animus","▪ Friendly SEKHETAR ROBOTS units’ attacks have [PSYCHIC]. ▪ Friendly THOUSAND SONS PSYKER units have the following ability: Infusion (Aura): While a friendly SEKHETAR ROBOTS unit is within 12\" of this unit, that unit’s melee attacks have +1 WS.","",0,"","Disruption"],
  ["Servants of Change",1,"Mutant","All-Seeing Mutant Hordes","▪ Friendly TZAANGORS units have BATTLELINE. ▪ In your Shooting phase, while a friendly MUTANT unit is shooting, enemy units have +6\" detection range. This detachment has the MUTANT tag and cannot be taken with another MUTANT detachment.","",0,"","Reconnaissance"],
  ["Warpforged Cabal",2,"","Warpfire Infusion","Each time a Thousand Sons Vehicle unit from your army is selected to shoot or fight, apply one of the following when resolving those attacks: ▪ If that VEHICLE unit is within 6\" of one or more friendly Thousand Sons Psyker models, you can re-roll one Hit roll, one Wound roll and one Damage roll. ▪ Otherwise, you can re-roll one Hit roll, one Wound roll or one Damage roll. Each time a THOUSAND SONS VEHICLE model from your army with the Deadly Demise ability is destroyed while it is within 6\" of one or more friendly THOUSAND SONS PSYKER models, that model’s Deadly Demise ability inflicts mortal wounds on a D6 roll of 5+ instead of only a 6.","",0,"","Priority Assets"],
  ["Warpmeld Pact",2,"Mutant","Warpmeld Sacrifice","Each time an enemy unit is selected to shoot or fight and one or more Tzeentch Mutant Infantry or Tzeentch Mutant Mounted units from your army are selected as a target of one or more of those attacks, each of those TZEENTCH MUTANT units can make a Warpmeld Sacrifice. If it does, until the end of the phase, each time an attack targets that unit, subtract 1 from the Wound roll. At the end of the phase, that TZEENTCH MUTANT unit suffers D3 mortal wounds. Each time a TZEENTCH MUTANT INFANTRY or TZEENTCH MUTANT MOUNTED unit from your army is selected to shoot or fight, before selecting its targets, that unit can make a Warpmeld Sacrifice. If it does, until the end of the phase, each time a model in that unit makes an attack, add 1 to the Wound roll. At the end of the phase, that TZEENTCH MUTANT unit suffers D3 mortal wounds. KEYWORDS Tzaangors units from your army have the BATTLELINE keyword, and while such a unit is not Battle-shocked, add 1 to the Objective Control characteristic of TZAANGOR models in that unit.","",0,"","Purge the Foe"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Diabolic Savant",20,"Changehost of Deceit","Thousand Sons Infantry model only. While the bearer is within 6\" of one or more friendly Scintillating Legions units, each time the bearer Channels the Warp, add 1 to the Psychic test result.",null],
  ["Duplicitous Malediction",15,"Changehost of Deceit","After both players have deployed their armies, select up to three Thousand Sons units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserve if you wish, regardless of how many units are already in Strategic Reserves.",null],
  ["Nethershriek Mind-Eater",10,"Changehost of Deceit","At the start of your Shooting phase, select one enemy unit within 12\" of and visible to the bearer. That unit must take a Battle-shock test; if that test is failed, that unit suffers 3 mortal wounds.",null],
  ["Tome of True Names",20,"Changehost of Deceit","Once per battle, at the start of any phase, the bearer can use this Enhancement. If it does, until the end of the phase, the bearer has a 2+ invulnerable save.",null],
  ["Eldritch Vortex of E’Taph",35,"Grand Coven","Add 1 to the Strength and Damage characteristics of Psychic weapons equipped by the bearer.",null],
  ["Incandaeum",15,"Grand Coven","Exalted Sorcerer model only. Once per battle, when selecting a Ritual for the bearer to attempt, you can select Doombolt, even if a model from your army have already attempted to manifest that Ritual this phase.",null],
  ["Lord of Forbidden Lore",20,"Grand Coven","Each time the bearer manifests a Ritual, while resolving the Ritual, add 6\" to its range.",null],
  ["Umbralefic Crystal",30,"Grand Coven","(Once per battle, per army) In your Command phase, if this unit is unengaged, you can use this ability. If you do: \n- Place this unit in strategic reserves. \n- This unit has Deep Strike until the start of your next Shooting phase. \n- This unit must make an ingress move in your next Movement phase (including in your first turn).",null],
  ["Arcane Might",20,"Hexwarp Thrallband","Add 1 to the Strength characteristic of Psychic weapons equipped by models in the bearer’s unit. While the bearer’s unit is wholly within your army’s Flow of Magic, add 2 to the Strength characteristic of Psychic weapons equipped by models in that unit instead.",null],
  ["Empowered Manifestation",20,"Hexwarp Thrallband","While the bearer’s unit is wholly within your army’s Flow of Magic, you can add 6\" to the range of Psychic abilities the bearer has that specify a range (including Rituals) and each time a model in the bearer’s unit takes a Hazardous test for a Psychic weapon, you can re-roll the result.",null],
  ["Empyric Onslaught",25,"Hexwarp Thrallband","While the bearer’s unit is wholly within your army’s Flow of Magic, add 3 to the Attacks characteristic of ranged Psychic weapons equipped by the bearer.",null],
  ["Noctilith Mantle",15,"Hexwarp Thrallband","While the bearer’s unit is on the battlefield, it is wholly within your army’s Flow of Magic. Models in that unit cannot be selected to use any Rituals.",null],
  ["Curse of Life",20,"Ritual of Regeneration","When this model heals as a result of the Sorcerous Invigoration detachment rule, you can add 3 to the number of wounds healed.",null],
  ["Eruption of Vitality",35,"Ritual of Regeneration","(Once per battle, per army) When this model is destroyed, at the end of the phase, roll one D6: \n- On a 2+, set up this model on the battlefield, unengaged and as close as possible to where it was destroyed. This model is not part of an attached unit and its unit has a starting strength of 1. This model has 3 wounds remaining.",null],
  ["Arcane Thralls",5,"Rubricae Phalanx","",null],
  ["Lord of the Rubricae",15,"Rubricae Phalanx","While the bearer is leading a unit, each time a Rubricae model in that unit makes an attack, add 1 to the Hit roll.",null],
  ["Risen Rubricae",30,"Rubricae Phalanx","At the start of the Declare Battle Formations step, select either two Rubricae Battleline units from your army or one other Rubricae unit from your army; models in the selected units have the Infiltrators ability.",null],
  ["Stave Abominus",20,"Rubricae Phalanx","The bearer's melee weapons have the [Sustained Hits D3] and [Devastating Wounds] abilities.",null],
  ["Occulus Infernum",20,"Sekhetar Cohort","In your Movement phase, at the start or end of this unit’s move, you can select one friendly SEKHETAR ROBOTS unit within 6\" of this unit. That unit’s ranged attacks have +1 BS until the start of your next turn.",null],
  ["Walking Rampart",30,"Sekhetar Cohort","This model has the following abilities: \n- Soul Bound: In your Movement phase, at the start or end of this unit’s move, you can select one friendly SEKHETAR ROBOTS unit within 3\" of this model. That SEKHETAR ROBOTS unit heals D3+1 wounds. \n▪ Kine-shielded Guardians: While this model is within 3\" of a friendly SEKHETAR ROBOTS unit, this model has Lone Operative.",null],
  ["Thicket of Bladed Bone (Upgrade)",10,"Servants of Change","SPAWN unit only. This unit’s melee attacks have: ▪ +1 AP. ▪ [CLEAVE 1].",null],
  ["Unravelled Fates",15,"Servants of Change","In your Movement phase, at the start or end of this unit's move, you can select one friendly battle-shocked MUTANT unit within 6\" of this model. That unit is no longer battle-shocked.",null],
  ["Biomechanical Mutation",15,"Warpforged Cabal","In your Command phase, you can select one friendly Thousand Sons Vehicle model within 6\" of this model. That model regains up to D3 lost wounds.",null],
  ["Perplexing Cloak",20,"Warpforged Cabal","While the bearer is within 3\" of one or more friendly Thousand Sons Vehicle units, the bearer has the Lone Operative ability.",null],
  ["Warp Syphon",5,"Warpforged Cabal","While the bearer is within 6\" of one or more friendly Thousand Sons Vehicle units, each time the bearer Channels the Warp, after you roll that additional D6 but before checking for doubles or triples, the bearer can use this Enhancement. If it does, select one of those Vehicle units; that Vehicle unit suffers 1 mortal wound and you can re-roll that additional D6.",null],
  ["Warp-Cursed Runemaster",10,"Warpforged Cabal","While the bearer is within 6\" of one or more friendly Thousand Sons Vehicle units, each time the bearer manifests a Ritual, while resolving that Ritual, add 6\" to its range.",null],
  ["Bray Lord",15,"Warpmeld Pact","The bearer has the Scouts 6\" ability.",null],
  ["Diamond of Distortion",20,"Warpmeld Pact","While the bearer is leading a unit, each time an attack targets that unit, subtract 1 from the Hit roll.",null],
  ["Flowing Flesh",10,"Warpmeld Pact","The bearer has the Feel No Pain 4+ ability and a Wounds characteristic of 5.",null],
  ["Warpmeld Dagger",10,"Warpmeld Pact","Each time the bearer attempts a Ritual, just before determining the Psychic test result, the bearer can use this Enhancement. If it does, the bearer suffers D3 mortal wounds; if it is not destroyed as a result, add 1 to that Psychic test result for each of those mortal wounds suffered.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Chronosorcerous Bleed","Changehost of Deceit","Ruse Stratégique",1,"Start of your opponent’s Charge phase.","One friendly unengaged THOUSAND SONS PSYKER/SCINTILLATING LEGIONS unit.","Select one visible enemy unit within 12\" of your unit. When that enemy unit declares a charge, that enemy unit has -1 to charge rolls.",""],
  ["Deceptive Glamour","Changehost of Deceit","Ruse Stratégique",2,"Start of the Fight phase.","One Thousand Sons unit from your army.","Until the end of the phase, each time an enemy model within Engagement Range of your unit selects targets for its attacks, it can only target your unit if there are no eligible Scintillating Legions targets for those attacks.",""],
  ["Ethereal Phantasm","Changehost of Deceit","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Scintillating Legions unit from your army that is within 8\" of that enemy unit and not within Engagement Range of one or more enemy units.","Your unit can make a Normal move of up to D6\", or a Normal move of up to 6\" instead if it is wholly within 6\" of one or more friendly Thousand Sons units.",""],
  ["Fractal Disjunction","Changehost of Deceit","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Scintillating Legions unit from your army (excluding Monsters) that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit can only be selected as the target of a ranged attack if the attacking model is within 18\".",""],
  ["Glimmershift Portal","Changehost of Deceit","Ruse Stratégique",1,"End of your opponent’s Fight phase.","Up to two Scintillating Legions units from your army (excluding Monsters), or one Scintillating Legions Monster unit from your army, if all of those units are more than 6\" horizontally away from all enemy units.","Remove those units from the battlefield and place them into Strategic Reserves.",""],
  ["Sulphurous Veil","Changehost of Deceit","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Thousand Sons or Scintillating Legions unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Arcane Focus","Grand Coven","Fait Épique",1,"Your Shooting phase, just after you take a Psychic test for a Thousand Sons model from your army that Channelled the Warp (before resolving that Ritual).","That THOUSAND SONS model.","Re-roll all of the D6 rolled for that Psychic test (including the additional D6 for Channelling the Warp).",""],
  ["Desecration of Worlds","Grand Coven","Fait Épique",1,"Your Command phase.","One Thousand Sons Psyker unit from your army within range of an objective marker you control.","That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Destined by Fate","Grand Coven","Fait Épique",1,"Any phase, just after a saving throw is failed for a Thousand Sons Psyker model from your army. If you are using fast dice rolling, this Stratagem can still be used after rolling multiple saving throws at once.","That PSYKER model.","Change the Damage characteristic of that attack to 0. If you are using fast dice rolling, select one of those attacks you failed a saving throw for.",""],
  ["Devastating Sorcery","Grand Coven","Tactique de Bataille",2,"Your Shooting phase.","One Thousand Sons Psyker unit from your army that has not been selected to shoot this phase.","Until the end of the phase, add 9\" to the Range characteristic of Psychic weapons equipped by models in your unit, and each time a model in your unit makes an attack with a Psychic weapon, you can re-roll the Hit roll and you can re-roll the Wound roll.",""],
  ["Egotistical Power","Grand Coven","Ruse Stratégique",1,"Your Command phase.","One Thousand Sons Psyker unit from your army.","Select the Imbued Manifestation, Psychic Maelstrom or Wrath of the Immaterium ability. Until the start of your next Command phase, that ability applies to your unit instead of any other Kindred Sorcery ability, even if you have already selected that ability this battle.",""],
  ["Psychic Dominion","Grand Coven","Fait Épique",1,"Any phase, just after an enemy unit has selected its targets.","One Thousand Sons unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, all attacks made against your unit with Psychic weapons have the [hazardous] ability and all models in your unit have the Feel No Pain 4+ ability against Psychic Attacks.",""],
  ["Kaleidoscopic Tempest","Hexwarp Thrallband","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One THOUSAND SONS PSYKER unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","▪ Your unit has Stealth. ▪ If your unit is wholly within your army’s Flow of Magic, your unit has ‐3 detection range.",""],
  ["Scouring Warpflame","Hexwarp Thrallband","Ruse Stratégique",1,"Your Shooting phase.","One Thousand Sons Psyker unit from your army that has not been selected to shoot this phase and is wholly within your army’s Flow of Magic.","Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability. After your unit has shot this phase, select one enemy unit hit by one or more of those attacks. Until the end of the phase, models in that unit cannot have the Benefit of Cover.",""],
  ["Strands of Time","Hexwarp Thrallband","Ruse Stratégique",1,"Your Movement phase, just after a THOUSAND SONS PSYKER unit from your army Falls Back.","That Thousand Sons Psyker unit.","Until the end of the turn, your unit is eligible to shoot or declare a charge in a turn in which it Fell Back. If your unit is wholly within your army’s Flow of Magic when it is targeted with this Stratagem, then until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Through the Veil","Hexwarp Thrallband","Fait Épique",1,"Start of the Reinforcements step of your Movement phase.","One Rubric Marines or Scarab Occult Terminators unit from your army that is in Strategic Reserves.","If it is a RUBRIC MARINES unit, until the end of the phase, it has the Deep Strike ability. When your unit is set up on the battlefield using the Deep Strike ability, if it is a SCARAB OCCULT TERMINATOR unit it can be set up anywhere on the battlefield that is wholly within your army’s Flow of Magic and more than 6\" horizontally away from all enemy models.","If a SCARAB OCCULT TERMINATORS unit is targeted with this Stratagem, it is not eligible to declare a charge in the same turn."],
  ["Warding Hex","Hexwarp Thrallband","Fait Épique",1,"Command phase.","One Thousand Sons Psyker unit from your army within range of an objective marker you control, if that objective marker is wholly within your army’s Flow of Magic.","That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Wrath of the Doomed","Hexwarp Thrallband","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One THOUSAND SONS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 to the result if your unit is wholly within your army’s Flow of Magic: on a 4+, do not remove it from play. That destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Multitudinous Limbs","Ritual of Regeneration","",1,"Your Movement phase, when a friendly INFANTRY/MOUNTED THOUSAND SONS PSYKER unit is selected to make an advance/fall back move.","That INFANTRY/MOUNTED THOUSAND SONS PSYKER unit.","That move does not prevent your unit from being eligible to start an action.",""],
  ["Mutagenic Magicks","Ritual of Regeneration","",1,"Start of the Fight phase.","One friendly engaged THOUSAND SONS PSYKER unit.","Start of the Fight phase. One friendly engaged Thousand Sons Psyker unit. Select one enemy unit engaged with your unit. Roll six D6: For each 4+, that enemy unit suffers 1 mortal wound.",""],
  ["Relentless Rebirth","Ritual of Regeneration","",1,"Any phase, when a friendly INFANTRY/MOUNTED THOUSAND SONS PSYKER unit suffers a mortal wound.","That INFANTRY/MOUNTED THOUSAND SONS PSYKER unit.","Your unit has Feel No Pain 5+ against mortal wounds.",""],
  ["Ardent Automata","Rubricae Phalanx","Ruse Stratégique",1,"Your Movement phase, just after a Rubricae unit from your army Falls Back.","That RUBRICAE unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Implacable Guardians","Rubricae Phalanx","Ruse Stratégique",2,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Rubric Marines Psyker unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack is allocated to a model in your unit (excluding PSYKER models), subtract 1 from the Damage characteristic of that attack.",""],
  ["Inexorable Advance","Rubricae Phalanx","Ruse Stratégique",1,"Your Movement phase.","One Rubricae unit from your army.","Until the end of the turn, your unit can ignore any or all modifiers to its Move characteristic and to Advance rolls made for it, and ranged weapons equipped by models in your unit have the [ASSAULT] ability.",""],
  ["Infernal Fusillade","Rubricae Phalanx","Équipement",1,"Your Shooting phase.","One Thousand Sons Psyker unit from your army that has not been selected to shoot this phase.","Until the end of the phase, all inferno bolt pistols, inferno boltguns, inferno combi-bolters and inferno combi-weapons equipped by models in your unit have the [PSYCHIC] ability.",""],
  ["Revenge of the Rubricae","Rubricae Phalanx","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after a Thousand Sons Psyker model from your army is destroyed.","One Rubricae unit from your army that was within 6\" of that PSYKER model when it was destroyed.","After the attacking unit has shot, your RUBRICAE unit can shoot as if it were your Shooting phase, but when resolving those attacks it can only target the enemy unit that just destroyed your PSYKER model (and only if it is an eligible target).",""],
  ["Unwavering Phalanx","Rubricae Phalanx","Tactique de Bataille",1,"Your opponent’s Charge phase, just after an enemy unit ends a Charge move.","One Rubric Marines unit from your army within Engagement Range of that enemy unit.","Until the end of the turn, attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Arcane Venting","Sekhetar Cohort","",1,"End of your Movement phase.","One friendly SEKHETAR ROBOTS unit.","Select one objective your unit is controlling. That objective is secured.",""],
  ["Ectoplasmic Extrusion","Sekhetar Cohort","",1,"Your Shooting phase, when a friendly SEKHETAR ROBOTS unit within 12\" of a friendly THOUSAND SONS PSYKER unit starts an action.","That SEKHETAR ROBOTS unit.","That action does not prevent your unit from being eligible to shoot.",""],
  ["Warp Fields","Sekhetar Cohort","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly SEKHETAR ROBOTS unit within 12\" of a friendly THOUSAND SONS PSYKER unit.","That SEKHETAR ROBOTS unit.","Ranged attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Prismatic Displacement","Servants of Change","",1,"Your Movement phase, when a friendly INFANTRY/MOUNTED MUTANT unit is selected to make an advance/fall back move.","That INFANTRY/MOUNTED MUTANT unit.","▪ Your unit’s ranged attacks have [ASSAULT] until the end of the turn. ▪ That move does not prevent your unit from being eligible to shoot/declare a charge.",""],
  ["Temporal Instability","Servants of Change","",1,"Your Movement phase, when a friendly INFANTRY/MOUNTED MUTANT unit is selected to make an advance/fall back move.","That INFANTRY/MOUNTED MUTANT unit.","In a turn your unit made an advance/fall-back move, that move does not prevent your unit from being eligible to start an action.",""],
  ["The Land Writhes","Servants of Change","",1,"Your Movement phase, when a friendly MONSTER MUTANT unit is selected to move.","That MONSTER MUTANT unit.","Your unit has MOBILE.",""],
  ["Cyberspirit Machinations","Warpforged Cabal","Ruse Stratégique",1,"Your Movement phase, just after a Thousand Sons Vehicle unit from your army Falls Back.","That VEHICLE unit, and one friendly Thousand Sons Psyker unit within 6\" of that VEHICLE unit.","Until the end of the turn, your VEHICLE unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Ensorcelled Infusion","Warpforged Cabal","Tactique de Bataille",2,"Your Shooting phase.","One Thousand Sons Vehicle unit from your army that has not been selected to shoot this phase, that is within 6\" of one or more friendly Thousand Sons Psyker units.","Until the end of the phase, ranged weapons equipped by VEHICLE models in your unit have the [PSYCHIC] ability and each time an attack is made with such a weapon, add 1 to the Wound roll.",""],
  ["Hex-Marked Armour","Warpforged Cabal","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Thousand Sons Vehicle unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Malevolent Animus","Warpforged Cabal","Fait Épique",1,"Your Command phase.","One Thousand Sons Vehicle unit from your army within 6\" of one or more friendly Thousand Sons Psyker units.","Until the start of your next Command phase, your VEHICLE unit is malevolent. While a unit is malevolent, it can ignore any or all modifiers to the following: the profile characteristics of its models; the Weapon Skill and Ballistic Skill characteristics of weapons equipped by its models; any roll or test made for it (excluding modifiers to saving throws).",""],
  ["Mutate Landscape","Warpforged Cabal","Fait Épique",1,"Your Command phase.","One Thousand Sons Psyker unit from your army within range of an objective marker you control.","That objective marker is mutated, and remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase. While an objective marker is mutated and under your control, each time an enemy unit ends a Normal, Advance, Fall Back or Charge move within range of that objective marker, roll one D6: on a 4+, that enemy unit suffers D3 mortal wounds.",""],
  ["Warpflame Gargoyles","Warpforged Cabal","Équipement",1,"Your opponent’s Charge phase, just after an enemy unit ends a Charge move.","One Thousand Sons Vehicle unit from your army within Engagement Range of that enemy unit.","Roll six D6: for each 5+, that enemy unit suffers 1 mortal wound. That enemy unit must then take a Battle-shock test.",""],
  ["Blessed Transmutations","Warpmeld Pact","Ruse Stratégique",1,"Your Command phase.","One Thousand Sons Psyker model from your army, and one friendly Tzaangors unit that is below its Starting Strength and within 12\" of that PSYKER model.","Return up to D3+1 destroyed models (excluding Characters) to your TZAANGORS unit.",""],
  ["Deranged Ferocity","Warpmeld Pact","Ruse Stratégique",1,"Fight phase, just after a Tzeentch Mutant unit from your army is selected to fight.","That TZEENTCH MUTANT unit.","Until the end of the phase, each time a model in your unit makes a Pile-in or Consolidation move, it can move up to 6\" instead of up to 3\", and when determining which models in it are eligible to fight, any models in it that are within 3\" of one or more enemy models are eligible to fight. When resolving those attacks, such models can target one of those enemy units that is within 3\" of them and within Engagement Range of their unit.",""],
  ["Gift of Change","Warpmeld Pact","Fait Épique",1,"Any phase.","One Thousand Sons Character model from your army (excluding Monsters) that was just destroyed. You can use this Stratagem on that model even though it was just destroyed.","At the end of the phase, add one Tzeentch Chaos Spawn unit containing one model to your army, and set it up as close as possible to where your model was destroyed and not within Engagement Range of one or more enemy units.","You can only use this Stratagem once per battle round."],
  ["Touched by Tzeentch","Warpmeld Pact","Ruse Stratégique",1,"Start of your Movement phase.","One Tzeentch Mutant unit from your army.","Until the end of the turn, your unit is eligible to shoot or declare a charge in a turn in which it Advanced.",""],
  ["Twisted Mirage","Warpmeld Pact","Ruse Stratégique",1,"Reinforcements step of your Movement phase.","One Tzeentch Mutant unit from your army that is arriving from Strategic Reserves this phase.","Your unit can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units, or anywhere on the battlefield that is more than 8\" horizontally away from all enemy units if it is a Monster unit. In either case, until the end of the turn, it is not eligible to declare a charge.",""],
  ["Warped Vicissitude","Warpmeld Pact","Ruse Stratégique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Tzaangors unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a 4+ invulnerable save.",""],
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
  "Chaos Vindicator",
  "Defiler",
  "Forgefiend",
  "Helbrute",
  "Heldrake",
  "Maulerfiend",
  "Sekhetar Robots"
 ],
 "monster": [
  "Daemon Prince of Tzeentch",
  "Daemon Prince of Tzeentch with wings",
  "Lord of Change",
  "Mutalith Vortex Beast"
 ],
 "battleline": [
  "Blue Horrors",
  "Pink Horrors",
  "Rubric Marines"
 ],
 "epic": [
  "Ahriman",
  "Kairos Fateweaver",
  "Magnus the Red"
 ],
 "infantry": [
  "Flamers",
  "Scarab Occult Terminators",
  "Tzaangors"
 ],
 "character": [
  "Exalted Sorcerer",
  "Exalted Sorcerer on Disc of Tzeentch",
  "Infernal Master",
  "Sorcerer",
  "Sorcerer in Terminator Armour",
  "Tzaangor Shaman"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Ahriman": "40",
 "Chaos Land Raider": "coque",
 "Chaos Predator Annihilator": "coque",
 "Chaos Predator Destructor": "coque",
 "Chaos Rhino": "coque",
 "Chaos Spawn": "50",
 "Chaos Vindicator": "coque",
 "Exalted Sorcerer": "32",
 "Exalted Sorcerer on Disc of Tzeentch": "40",
 "Forgefiend": "120x92",
 "Helbrute": "60",
 "Heldrake": "120x92",
 "Infernal Master": "40",
 "Magnus the Red": "100",
 "Maulerfiend": "120x92",
 "Mutalith Vortex Beast": "120x92",
 "Rubric Marines": "32",
 "Scarab Occult Terminators": "40",
 "Sorcerer": "32",
 "Sorcerer in Terminator Armour": "40",
 "Daemon Prince of Tzeentch": "60",
 "Daemon Prince of Tzeentch with wings": "60",
 "Tzaangor Enlightened": "40",
 "Tzaangor Shaman": "40",
 "Tzaangors": "32",
 "Sekhetar Robots": "40",
 "Tzaangor Enlightened with Fatecaster greatbows": "40",
 "Kairos Fateweaver": "100",
 "Lord of Change": "100",
 "Flamers": "32",
 "Screamers": "60x35.5",
 "Pink Horrors": "32",
 "Blue Horrors": "25",
 "Defiler": "160"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Chaos Land Raider": 5,
 "Magnus the Red": 6,
 "Kairos Fateweaver": 7,
 "Lord of Change": 7
};

const TRANSPORTS = {
 "Chaos Land Raider": "This model has a transport capacity of 12 ^^**Thousand Sons Infantry^^** models. Each ^^**Terminator^^** model takes up the space of 2 models.",
 "Chaos Rhino": "This model has a transport capacity of 12 ^^**Thousand Sons Infantry^^** models (excluding ^^**Terminator^^** models)."
};
const FACTION = [
 [
  "Cabal of Sorcerers",
  "If your army Faction is Thousand Sons, at the start of your Shooting phase, one or more models from your army with this ability can attempt Rituals. To do so, select one model from your army with this ability that has not yet attempted a Ritual this turn and select one Ritual no model from your army has attempted to manifest this turn, then take a Psychic test by following the sequence below:\n\n1. Roll 2D6\n2. Optionally, roll one additional D6 (Channel the Warp). Then, if one or more doubles or triples were rolled during this test, that model's unit suffers D3 mortal wounds.\n3. If that model is not destroyed, the combined total of all the dice rolled during this test is the Psychic test result. If this equals or exceeds the Warp Charge value of the Ritual being attempted, that model manifests that Ritual and you resolve its effects."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/thousandsons.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_UNITE = {
 "Rubric Marines": [
  {
   "champ": "rrW",
   "val": "ones",
   "port": "T",
   "nom": "Porteurs du Changement",
   "texte": "Each time a model in this unit makes a ranged attack, re-roll a Wound roll of 1. If the attack targets a unit within range of an objective marker you do not control, you can re-roll the Wound roll instead."
  }
 ]
};
const APTIS_COND = {
 "Rubric Marines": [
  {
   "champ": "rrW",
   "val": "failed",
   "port": "T",
   "nom": "Porteurs du Changement — objectif adverse",
   "quand": "La cible est à portée d'un objectif que tu ne contrôles pas",
   "texte": "Each time a model in this unit makes a ranged attack, re-roll a Wound roll of 1. If the attack targets a unit within range of an objective marker you do not control, you can re-roll the Wound roll instead."
  },
  {
   "mot": "ignoresCover",
   "port": "T",
   "nom": "Icône de Flamme",
   "quand": "L'unité porte l'icône (les personnages n'en profitent pas)",
   "texte": "Ranged weapons equipped by models in the bearer's unit (excluding Characters) have the [Ignores Cover] ability."
  }
 ],
 "Chaos Predator Annihilator": [
  {
   "champ": "rrH",
   "val": "failed",
   "port": "T",
   "nom": "Annihilation Ensorcelée",
   "quand": "La cible est un MONSTRE ou VÉHICULE touché par une attaque psychique de ton armée ce tour (la relance des dégâts n'est pas simulée)",
   "texte": "Each time this model makes a ranged attack that targets a Monster or Vehicle unit that was hit by one or more Psychic attacks made by a Thousand Sons Psyker unit from your army this turn, you can re-roll the Hit roll and you can re-roll the Damage roll."
  }
 ],
 "Helbrute": [
  {
   "champ": "atkMod",
   "val": 2,
   "port": "C",
   "nom": "Voué à la Destruction",
   "quand": "Le Helbrute porte deux armes de mêlée en plus de son arme de base",
   "texte": "If this model is equipped with 2 melee weapons in addition to its close combat weapon, add 2 to the Attacks characteristic of those two weapons."
  }
 ],
 "Daemon Prince of Tzeentch with wings": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Chasseur d'Âmes — PSYKER",
   "quand": "La cible est un PERSONNAGE PSYKER",
   "texte": "Each time this model makes an attack that targets a Character unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1 (if that attack targets a Psyker Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll instead). Each time this model destroys a Character unit, this model regains up to D3 lost wounds (if that Character unit was a Psyker, this model regains up to 3 lost wounds instead)."
  },
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Chasseur d'Âmes — PSYKER, blessure",
   "quand": "La cible est un PERSONNAGE PSYKER",
   "texte": "Each time this model makes an attack that targets a Character unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1 (if that attack targets a Psyker Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll instead). Each time this model destroys a Character unit, this model regains up to D3 lost wounds (if that Character unit was a Psyker, this model regains up to 3 lost wounds instead)."
  }
 ]
};
const APTIS_CIBLE = {
 "Daemon Prince of Tzeentch with wings": [
  {
   "vs": [
    "perso"
   ],
   "champ": "rrH",
   "val": "ones",
   "nom": "Chasseur d'Âmes",
   "texte": "Each time this model makes an attack that targets a Character unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1 (if that attack targets a Psyker Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll instead). Each time this model destroys a Character unit, this model regains up to D3 lost wounds (if that Character unit was a Psyker, this model regains up to 3 lost wounds instead)."
  },
  {
   "vs": [
    "perso"
   ],
   "champ": "rrW",
   "val": "ones",
   "nom": "Chasseur d'Âmes",
   "texte": "Each time this model makes an attack that targets a Character unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1 (if that attack targets a Psyker Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll instead). Each time this model destroys a Character unit, this model regains up to D3 lost wounds (if that Character unit was a Psyker, this model regains up to 3 lost wounds instead)."
  }
 ]
};
const AURAS_PERSO = {
 "Infernal Master": [
  {
   "mot": "sust:1",
   "nom": "Maelström Maléfique",
   "texte": "While this model is leading a unit, weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  }
 ],
 "Sorcerer": [
  {
   "mot": "lethal",
   "nom": "Guidance Empyréenne",
   "texte": "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability."
  }
 ],
 "Sorcerer in Terminator Armour": [
  {
   "mot": "lethal",
   "nom": "Guidance Empyréenne",
   "texte": "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability."
  }
 ],
 "Tzaangor Shaman": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Prophète Bestial",
   "texte": "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "source": "Sorcerer in Terminator Armour",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "port": "T",
  "nom": "Marqué par le Destin",
  "quand": "L'unité est menée par le Sorcier en Armure Terminator, et la cible est celle qu'il a désignée",
  "texte": "At the start of your Shooting phase, select one enemy unit that is visible to this Psyker model. Until the end of the phase, each time a model in this unit makes an attack that targets that enemy unit, add 1 to the Hit roll."
 },
 {
  "source": "Lord of Change",
  "kw": [
   "Blue Horrors",
   "Flamers",
   "Kairos Fateweaver",
   "Pink Horrors",
   "Screamers"
  ],
  "champ": "strMod",
  "val": 1,
  "port": "T",
  "nom": "Seigneur Démon de Tzeentch (Aura)",
  "quand": "L'unité des LÉGIONS SCINTILLANTES est à 6\" du Seigneur du Changement",
  "texte": "While a friendly Scintillating Legions unit is within 6\" of this model, each time a model in that unit makes a ranged attack, add 1 to the Strength characteristic of that attack."
 },
 {
  "detach": "Sekhetar Cohort",
  "kw": [
   "Sekhetar Robots"
  ],
  "champ": "hitMod",
  "val": 1,
  "port": "C",
  "nom": "Infusion (Aura)",
  "quand": "Les Robots Sekhetar sont à 12\" d'un PSYKER des Thousand Sons (CC améliorée de 1)",
  "texte": "Infusion (Aura): While a friendly SEKHETAR ROBOTS unit is within 12\" of this unit, that unit’s melee attacks have +1 WS."
 },
 {
  "detach": "Warpmeld Pact",
  "kw": [
   "Tzaangor Shaman",
   "Tzaangors",
   "Tzaangor Enlightened",
   "Tzaangor Enlightened with Fatecaster greatbows",
   "Tzaangor Shaman"
  ],
  "champ": "wndMod",
  "val": 1,
  "nom": "Sacrifice Distordant",
  "quand": "L'unité MUTANTE de TZEENTCH fait un Sacrifice Distordant (D3 blessures mortelles en fin de phase)",
  "texte": "Each time a TZEENTCH MUTANT INFANTRY or TZEENTCH MUTANT MOUNTED unit from your army is selected to shoot or fight, before selecting its targets, that unit can make a Warpmeld Sacrifice. If it does, until the end of the phase, each time a model in that unit makes an attack, add 1 to the Wound roll."
 }
];
const STRAT_SIMU = [
 {
  "nom": "Scouring Warpflame",
  "detach": "Hexwarp Thrallband",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Ahriman",
   "Daemon Prince of Tzeentch",
   "Daemon Prince of Tzeentch with wings",
   "Exalted Sorcerer",
   "Exalted Sorcerer on Disc of Tzeentch",
   "Infernal Master",
   "Kairos Fateweaver",
   "Lord of Change",
   "Magnus the Red",
   "Rubric Marines",
   "Scarab Occult Terminators",
   "Sorcerer",
   "Sorcerer in Terminator Armour",
   "Tzaangor Shaman"
  ],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT] — unité PSYKER entièrement dans le Flux de Magie",
  "effet": {
   "ignoresCover": true
  }
 },
 {
  "nom": "Ensorcelled Infusion",
  "detach": "Warpforged Cabal",
  "pc": 2,
  "ph": "T",
  "unites": [
   "Chaos Land Raider",
   "Chaos Predator Annihilator",
   "Chaos Predator Destructor",
   "Chaos Rhino",
   "Chaos Vindicator",
   "Defiler",
   "Forgefiend",
   "Helbrute",
   "Heldrake",
   "Maulerfiend",
   "Sekhetar Robots"
  ],
  "sauf": [],
  "aide": "+1 pour blesser au tir — VÉHICULE à 6\" d'un PSYKER",
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
const OCTROIS_DETACH = {};

enregistreFaction({
  cle : "thousandsons",
  nom : "Thousand Sons",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
