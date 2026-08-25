/* ============================================================
   Données World Eaters — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py worldeaters

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     30 fiches sur 30 en ont un. Les autres — des Legends, que le
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
  ["Angron",14,11,2,4,16,[1],{"1": 330},0,"",0,"",6,"5+"],
  ["Bloodcrushers",10,7,3,5,4,[3, 6],[[1, {"3": 95, "6": 190}], [3, {"3": 115, "6": 210}]],0,"",0,"",2,"7+"],
  ["Bloodletters",8,4,7,5,1,[10],{"10": 90},0,"",0,"",1,"7+"],
  ["Bloodthirster",12,11,3,4,18,[1],[[1, {"1": 320}], [3, {"1": 335}]],0,"",0,"",5,"6+"],
  ["Chaos Land Raider",10,12,2,0,16,[1],[[1, {"1": 220}], [3, {"1": 240}]],0,"",0,"",5,"6+"],
  ["Chaos Predator Annihilator",10,10,3,0,11,[1],[[1, {"1": 130}], [3, {"1": 140}]],0,"",0,"",3,"6+"],
  ["Chaos Predator Destructor",10,10,3,0,11,[1],[[1, {"1": 130}], [3, {"1": 140}]],0,"",0,"",3,"6+"],
  ["Chaos Rhino",12,9,3,0,10,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"6+"],
  ["Chaos Spawn",10,5,4,0,4,[2],{"2": 95},0,"",0,"",1,"7+"],
  ["Chaos Terminators",7,5,2,4,3,[5, 10],[[1, {"5": 165, "10": 330}], [3, {"5": 175, "10": 340}]],0,"",0,"",1,"6+"],
  ["Daemon Prince of Khorne",10,10,2,4,10,[1],{"1": 200},0,"",0,"",3,"6+"],
  ["Daemon Prince of Khorne with wings",14,9,2,4,10,[1],{"1": 170},0,"",0,"",3,"6+"],
  ["Defiler",14,11,3,5,18,[1],[[1, {"1": 270}], [2, {"1": 310}]],0,"",0,"",5,"6+"],
  ["Eightbound",10,6,3,5,3,[3, 6],[[1, {"3": 125, "6": 255}], [3, {"3": 140, "6": 270}]],0,"",0,"",1,"6+"],
  ["Exalted Eightbound",10,6,3,5,3,[3, 6],[[1, {"3": 130, "6": 265}], [3, {"3": 145, "6": 280}]],0,"",0,"",1,"6+"],
  ["Flesh Hounds",12,4,7,5,2,[5, 10],{"5": 75, "10": 150},0,"",0,"",1,"7+"],
  ["Forgefiend",10,10,3,5,12,[1],[[1, {"1": 140}], [3, {"1": 155}]],0,"",0,"",3,"6+"],
  ["Goremongers",9,4,6,0,1,[8],{"8": 75},0,"",0,"",1,"7+"],
  ["Helbrute",9,9,2,0,8,[1],{"1": 120},0,"",0,"",3,"6+"],
  ["Heldrake",12,9,3,5,12,[1],{"1": 175},0,"",0,"",0,"6+"],
  ["Jakhals",7,4,6,0,1,[10, 20],{"10": 65, "20": 130},0,"",0,"",1,"7+"],
  ["Khorne Berzerkers",8,4,3,0,2,[10, 20],{"10": 170, "20": 330},0,"",0,"",2,"6+"],
  ["Khorne Lord of Skulls",12,13,3,5,24,[1],[[1, {"1": 505}], [2, {"1": 535}]],0,"",0,"",8,"6+"],
  ["Khârn the Betrayer",8,4,3,4,5,[1],{"1": 115},0,"Meneur",0,"",1,"6+"],
  ["Lord Invocatus",10,6,3,4,8,[1],{"1": 100},0,"Meneur",0,"",2,"6+"],
  ["Lord on Juggernaut",10,6,3,4,7,[1],{"1": 95},0,"Meneur",0,"",2,"6+"],
  ["Master of Executions",8,4,3,0,4,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Maulerfiend",12,10,3,5,12,[1],[[1, {"1": 140}], [3, {"1": 150}]],0,"",0,"",3,"6+"],
  ["Skarbrand",10,11,3,4,20,[1],{"1": 315},0,"",0,"",5,"6+"],
  ["Slaughterbound",10,6,3,5,6,[1],{"1": 100},0,"Meneur",0,"",1,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Angron","➤ Samni’arius and Spinegrinder - strike","C","8",2,14,3,"D6+2","dev","càc"],
  ["Angron","➤ Samni’arius and Spinegrinder - sweep","C","16",2,7,2,"2","dev","càc"],
  ["Bloodcrushers","Bladed horn","C","4",4,6,1,"1","extra lance","càc"],
  ["Bloodcrushers","Hellblade","C","2",3,5,2,"2","","càc"],
  ["Bloodletters","Hellblade","C","2",3,5,2,"2","","càc"],
  ["Bloodthirster","Bloodflail","T","1",2,16,3,"D6+1","dev","12\""],
  ["Bloodthirster","Hellfire breath","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Bloodthirster","Lash of Khorne","T","9",2,8,1,"2","","12\""],
  ["Bloodthirster","➤ Axe of Khorne - strike","C","8",2,14,4,"D3+1","","càc"],
  ["Bloodthirster","➤ Axe of Khorne - sweep","C","16",2,8,2,"1","","càc"],
  ["Bloodthirster","➤ Great axe of Khorne - strike","C","7",2,16,4,"D6+2","","càc"],
  ["Bloodthirster","➤ Great axe of Khorne - sweep","C","14",2,10,2,"2","","càc"],
  ["Chaos Land Raider","Combi-bolter","T","2",4,4,0,"1","rf:4","24\""],
  ["Chaos Land Raider","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Land Raider","Havoc launcher","T","D6",4,5,0,"1","blast","48\""],
  ["Chaos Land Raider","Soulshatter lascannon","T","2",4,12,3,"D6+1","rf:2","48\""],
  ["Chaos Land Raider","Twin heavy bolter","T","3",4,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Chaos Land Raider","Armoured tracks","C","9",3,8,0,"1","","càc"],
  ["Chaos Predator Annihilator","Combi-bolter","T","2",4,4,0,"1","rf:4","24\""],
  ["Chaos Predator Annihilator","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Predator Annihilator","Havoc launcher","T","D6",4,5,0,"1","blast","48\""],
  ["Chaos Predator Annihilator","Heavy bolter","T","3",4,5,1,"2","rf:2 sust:1","36\""],
  ["Chaos Predator Annihilator","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Chaos Predator Annihilator","Predator twin lascannon","T","1",4,14,3,"D6+1","rf:2 twin","48\""],
  ["Chaos Predator Annihilator","Armoured tracks","C","6",3,6,0,"1","","càc"],
  ["Chaos Predator Destructor","Combi-bolter","T","2",4,4,0,"1","rf:4","24\""],
  ["Chaos Predator Destructor","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Predator Destructor","Havoc launcher","T","D6",4,5,0,"1","blast","48\""],
  ["Chaos Predator Destructor","Heavy bolter","T","3",4,5,1,"2","rf:2 sust:1","36\""],
  ["Chaos Predator Destructor","Lascannon","T","1",4,12,3,"D6+1","","48\""],
  ["Chaos Predator Destructor","Predator autocannon","T","4",4,9,1,"3","rf:6","48\""],
  ["Chaos Predator Destructor","Armoured tracks","C","6",3,6,0,"1","","càc"],
  ["Chaos Rhino","Combi-bolter","T","2",4,4,0,"1","rf:4","24\""],
  ["Chaos Rhino","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Rhino","Havoc launcher","T","D6",4,5,0,"1","blast","48\""],
  ["Chaos Rhino","Armoured tracks","C","6",3,6,0,"1","","càc"],
  ["Chaos Spawn","Hideous Mutations","C","D6+4",4,5,1,"2","","càc"],
  ["Chaos Terminators","Combi-bolter","T","2",4,4,0,"1","rf:4","24\""],
  ["Chaos Terminators","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Terminators","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Chaos Terminators","Reaper autocannon","T","4",4,7,1,"1","dev rf:2 sust:1","36\""],
  ["Chaos Terminators","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Chaos Terminators","Chainfist","C","3",4,8,3,"2","anti:3:veh","càc"],
  ["Chaos Terminators","Paired accursed weapons","C","5",3,5,2,"1","twin","càc"],
  ["Chaos Terminators","Power fist","C","3",3,8,2,"2","","càc"],
  ["Daemon Prince of Khorne","Infernal cannon","T","3",3,5,1,"2","rf:1","24\""],
  ["Daemon Prince of Khorne","➤ Hellforged weapons - strike","C","8",2,8,2,"3","","càc"],
  ["Daemon Prince of Khorne","➤ Hellforged weapons - sweep","C","16",2,6,1,"1","","càc"],
  ["Daemon Prince of Khorne with wings","Infernal cannon","T","3",3,5,1,"2","rf:1","24\""],
  ["Daemon Prince of Khorne with wings","➤ Hellforged weapons - strike","C","8",2,8,2,"3","","càc"],
  ["Daemon Prince of Khorne with wings","➤ Hellforged weapons - sweep","C","16",2,6,1,"1","","càc"],
  ["Defiler","Ectoplasma destructor","T","D6",4,12,3,"3","blast rf:2","36\""],
  ["Defiler","Excruciator cannon","T","6",4,6,1,"2","rf:3","36\""],
  ["Defiler","Hades battle cannon","T","D6+3",4,10,1,"3","blast rf:3","48\""],
  ["Defiler","Hades lascannon","T","2",4,12,3,"D6+1","rf:1","48\""],
  ["Defiler","Heavy baleflamer","T","D6+3",0,7,2,"2","ignorescover torrent","12\""],
  ["Defiler","Heavy reaper autocannon","T","4",4,9,1,"3","dev rf:2 sust:1","48\""],
  ["Defiler","Magma cutter","T","2",4,9,4,"D6","melta:2 rf:1","12\""],
  ["Defiler","➤ Heavy missile launcher - frag","T","2D6",4,5,1,"1","blast rf:3","48\""],
  ["Defiler","➤ Heavy missile launcher - krak","T","2",4,10,2,"D6+1","rf:1","48\""],
  ["Defiler","Electroscourge","C","7",3,12,2,"2","extra sust:2","càc"],
  ["Defiler","Shearing claws - strike","C","6",3,16,3,"D6+1","","càc"],
  ["Defiler","Shearing claws - sweep","C","12",3,6,2,"1","","càc"],
  ["Eightbound","Chainblades","C","5",3,8,2,"2","","càc"],
  ["Exalted Eightbound","Chainblades","C","4",3,8,3,"2","anti:3:mon anti:3:veh","càc"],
  ["Flesh Hounds","Burning roar","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Flesh Hounds","Gore-drenched fangs","C","3",3,5,1,"1","","càc"],
  ["Forgefiend","Ectoplasma cannon","T","D3",4,10,3,"3","blast rf:1","36\""],
  ["Forgefiend","Hades autocannon","T","6",4,8,1,"2","rf:4","36\""],
  ["Forgefiend","Forgefiend claws","C","6",3,6,0,"1","","càc"],
  ["Forgefiend","Forgefiend jaws","C","8",3,7,1,"2","","càc"],
  ["Goremongers","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Goremongers","Blood harpoon","T","1",4,5,1,"2","assault sust:D3","18\""],
  ["Goremongers","Chainblade","C","3",4,3,0,"1","lance","càc"],
  ["Goremongers","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Helbrute","Combi-bolter","T","2",4,4,0,"1","rf:4","24\""],
  ["Helbrute","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Helbrute","Multi-melta","T","2",4,9,4,"D6","melta:2 rf:1","18\""],
  ["Helbrute","Plasma cannon","T","D3",4,8,3,"3","blast hazardous rf:D3","36\""],
  ["Helbrute","Twin autocannon","T","2",4,9,1,"3","rf:2 twin","48\""],
  ["Helbrute","Twin heavy bolter","T","3",4,5,1,"2","rf:2 sust:1 twin","36\""],
  ["Helbrute","Twin lascannon","T","1",4,12,3,"D6+1","rf:1 twin","48\""],
  ["Helbrute","➤ Missile launcher - frag","T","D6",4,4,0,"1","blast rf:3","48\""],
  ["Helbrute","➤ Missile launcher - krak","T","1",4,9,2,"D6","rf:1","48\""],
  ["Helbrute","Close combat weapon","C","6",3,6,0,"1","","càc"],
  ["Helbrute","Helbrute fist","C","6",3,12,2,"3","","càc"],
  ["Helbrute","Helbrute hammer","C","6",4,14,3,"D6+1","","càc"],
  ["Helbrute","Power scourge","C","10",3,7,1,"2","","càc"],
  ["Heldrake","Baleflamer","T","D6+3",0,6,1,"2","ignorescover torrent","12\""],
  ["Heldrake","Hades autocannon","T","6",4,8,1,"2","rf:4","36\""],
  ["Heldrake","Heldrake claws","C","6",3,7,1,"2","anti:2:vol dev","càc"],
  ["Jakhals","Autopistol","T","1",4,3,0,"1","pistol","12\""],
  ["Jakhals","Chainblades","C","3",4,3,0,"1","","càc"],
  ["Jakhals","Mauler chainblade","C","3",5,4,1,"2","","càc"],
  ["Jakhals","Paired manglers","C","4",4,4,0,"1","","càc"],
  ["Jakhals","Skullsmasher and mangler","C","2",4,4,1,"2","","càc"],
  ["Khorne Berzerkers","Bolt pistol","T","1",4,4,0,"1","pistol","12\""],
  ["Khorne Berzerkers","➤ Plasma pistol - standard","T","1",4,7,2,"1","pistol","12\""],
  ["Khorne Berzerkers","➤ Plasma pistol - supercharge","T","1",4,8,3,"2","hazardous pistol","12\""],
  ["Khorne Berzerkers","Chainblade","C","4",3,4,1,"1","","càc"],
  ["Khorne Berzerkers","Khornate eviscerator","C","3",3,8,2,"2","","càc"],
  ["Khorne Lord of Skulls","Daemongore cannon","T","D6",4,14,4,"D6+2","blast rf:3","18\""],
  ["Khorne Lord of Skulls","Gorestorm cannon","T","D6+3",4,10,2,"3","blast rf:3","24\""],
  ["Khorne Lord of Skulls","Hades gatling cannon","T","12",4,8,2,"2","rf:6 sust:1","48\""],
  ["Khorne Lord of Skulls","Ichor cannon","T","2D6",4,7,2,"2","blast rf:4","48\""],
  ["Khorne Lord of Skulls","Skullhurler","T","2D6",4,14,3,"3","rf:3","60\""],
  ["Khorne Lord of Skulls","➤ Great cleaver of Khorne - strike","C","6",3,16,4,"8","","càc"],
  ["Khorne Lord of Skulls","➤ Great cleaver of Khorne - sweep","C","18",3,8,2,"2","","càc"],
  ["Khârn the Betrayer","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Khârn the Betrayer","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Khârn the Betrayer","Gorechild","C","8",2,7,2,"3","","càc"],
  ["Lord Invocatus","Bolt pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Lord Invocatus","Bladed horn","C","4",3,6,1,"2","extra lance","càc"],
  ["Lord Invocatus","Coward's Bane","C","7",2,6,2,"2","dev","càc"],
  ["Lord on Juggernaut","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Lord on Juggernaut","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Lord on Juggernaut","Bladed horn","C","4",3,6,1,"2","extra lance","càc"],
  ["Lord on Juggernaut","Exalted chainblade","C","7",2,6,1,"2","","càc"],
  ["Master of Executions","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Master of Executions","Axe of dismemberment","C","5",2,7,2,"2","dev precision","càc"],
  ["Maulerfiend","Magma cutter","T","2",4,9,4,"D6","melta:2 rf:1","6\""],
  ["Maulerfiend","Lasher tendrils","C","6",3,7,1,"1","extra","càc"],
  ["Maulerfiend","Maulerfiend fists","C","8",3,14,2,"D6+1","","càc"],
  ["Skarbrand","Bellow of endless fury","T","2D6",0,8,1,"1","ignorescover torrent","12\""],
  ["Skarbrand","➤ Slaughter and Carnage - strike","C","8",2,16,4,"6","","càc"],
  ["Skarbrand","➤ Slaughter and Carnage - sweep","C","16",2,8,2,"2","","càc"],
  ["Slaughterbound","Lacerator and daemonic claw","C","6",2,10,2,"2","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Angron","Epic Hero"],
  ["Bloodcrushers","Monté"],
  ["Bloodletters","Battleline"],
  ["Bloodthirster","Monstre"],
  ["Chaos Land Raider","Véhicule"],
  ["Chaos Predator Annihilator","Véhicule"],
  ["Chaos Predator Destructor","Véhicule"],
  ["Chaos Rhino","Véhicule"],
  ["Chaos Spawn","Bête"],
  ["Chaos Terminators","Infanterie"],
  ["Daemon Prince of Khorne","Monstre"],
  ["Daemon Prince of Khorne with wings","Monstre"],
  ["Defiler","Véhicule"],
  ["Eightbound","Infanterie"],
  ["Exalted Eightbound","Infanterie"],
  ["Flesh Hounds","Bête"],
  ["Forgefiend","Véhicule"],
  ["Goremongers","Infanterie"],
  ["Helbrute","Véhicule"],
  ["Heldrake","Véhicule"],
  ["Jakhals","Infanterie"],
  ["Khorne Berzerkers","Battleline"],
  ["Khorne Lord of Skulls","Véhicule"],
  ["Khârn the Betrayer","Epic Hero"],
  ["Lord Invocatus","Epic Hero"],
  ["Lord on Juggernaut","Personnage"],
  ["Master of Executions","Personnage"],
  ["Maulerfiend","Véhicule"],
  ["Skarbrand","Epic Hero"],
  ["Slaughterbound","Personnage"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Khârn the Betrayer": [
  "Khorne Berzerkers"
 ],
 "Lord Invocatus": [
  "Eightbound",
  "Exalted Eightbound",
  "Khorne Berzerkers"
 ],
 "Lord on Juggernaut": [
  "Eightbound",
  "Exalted Eightbound",
  "Khorne Berzerkers"
 ],
 "Master of Executions": [
  "Khorne Berzerkers"
 ],
 "Slaughterbound": [
  "Eightbound",
  "Exalted Eightbound"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Angron": [
  [
   "Reborn in Blood",
   "At the start of the battle round, when you make a Blessings of Khorne roll, if this model is destroyed, you can use a triple 6 from that roll to use this ability instead of activating any Blessings of Khorne at the start of that battle round. If you do, this model is no longer destroyed and in the Reinforcements step of your next Movement phase, it is set up anywhere on the battlefield using its Deep Strike ability, with 8 wounds remaining."
  ],
  [
   "Wrathful Presence",
   "At the start of the battle round, select one Wrathful Presence ability. Until the start of the next battle round, this model has that ability."
  ],
  [
   "Damaged: 1-6 wounds remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Khârn the Betrayer": [
  [
   "Legendary Killer",
   "While this model is leading a unit, each time a model in that unit makes a melee attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1."
  ],
  [
   "The Betrayer",
   "At the end of your Charge phase, if this model is leading a unit and that unit is not within Engagement Range of one or more enemy units, you must take a Leadership test for this model. If that test is failed, one Bodyguard model of your choice in that unit is destroyed."
  ],
  [
   "Berserker Frenzy",
   "The first time this model is destroyed, at the end of the phase, roll one D6: on a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with 3 wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: Khorne Berzerkers"
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Lord Invocatus": [
  [
   "Leader",
   "This model can be attached to the following units: Eightbound, Exalted Eightbound, Khorne Berzerkers"
  ],
  [
   "Fire Riders",
   "While this model is leading a unit, models in that unit have the Deep Strike ability and each time a model in that unit makes a Normal, Advance, Fall Back or Charge move, it can move horizontally through models and terrain features. When making a Normal, Advance or Fall Back move, models in that unit can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them and any Desperate Escape test is automatically passed."
  ],
  [
   "Bloody Stampede",
   "Each time this model's unit ends a Charge move, select one enemy unit within Engagement Range of this model, then roll one D6: on a 2-3, that enemy unit suffers 1 mortal wound; on a 4-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Daemon Prince of Khorne": [
  [
   "Lord of Murder",
   "While this model is within 3\" of one or more friendly World Eaters Infantry units, this model has the Lone Operative ability."
  ],
  [
   "Devastating Assault",
   "Each time this model makes a Charge move, until the end of the turn, its hellforged weapons have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Direct the Slaughter",
   "Once per battle round, one model from your army with this ability can use it when a friendly World Eaters unit within 12\" of this model is targeted with a Stratagem. If it does, reduce the CP cost of that Stratagem by 1CP."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Daemon Prince of Khorne with wings": [
  [
   "Bloodied Terror",
   "At the start of the Fight phase, each enemy unit within Engagement Range of this model must take a Battle-shock test, subtracting 1 if that enemy unit is Below Half-strength."
  ],
  [
   "Swooping Predator",
   "Each time this model ends a Normal or Advance move, you can select one enemy unit that it moved over during that move and roll 6 D6: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Lord on Juggernaut": [
  [
   "Aggressive Advance",
   "While this model is leading a unit, models in that unit have a Move characteristic of 10\" and each time a model in that unit makes a Normal, Advance, Fall Back or Charge move, it can move horizontally though terrain features."
  ],
  [
   "Crush All Who Stand Before Us",
   "Each time this model's unit is selected to fight, you can use this ability. When determining which models in this unit are eligible to fight, any models in it that are within 3\" of one or more enemy models are eligible to fight. When resolving those attacks, such models can target one of those enemy units that is within 3\" of them and within Engagement Range of their unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units: Eightbound, Exalted Eightbound, Khorne Berzerkers"
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Master of Executions": [
  [
   "Leader",
   "This model can be attached to the following unit: Khorne Berzerkers"
  ],
  [
   "A Worthy Skull",
   "Each time this model makes a melee attack that targets a Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll. Each time this model's unit destroys a Character model, you gain 1CP."
  ],
  [
   "Forwards, For Blood!",
   "While this model is leading a unit, you can re-roll Advance rolls made for that unit and each time that unit makes a Blood Surge move, you can re-roll the D6 used to determine how far models in that unit move."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Khorne Berzerkers": [
  [
   "Blood Surge",
   "In your opponent’s Shooting phase, when an enemy unit has shot, if a model in this unit was destroyed as a result of those attacks, this unit can make a surge move of up to D6+2\"."
  ],
  [
   "Icon of Khorne",
   "If the bearer's unit contains 1 or more Icons of Khorne, each time the bearer's unit destroys an enemy unit, you gain one Bloodshed point. Each time you make a Blessings of Khorne roll, roll one additional D6 for each Bloodshed point you have, after which, all your Bloodshed points are lost."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Chaos Terminators": [
  [
   "Bloody Fury",
   "- This unit’s ranged attacks that target the closest eligible target can re-roll hit rolls.\n- When this unit declares a charge, you can use this part of this ability. \nIf you do: \n-- This unit can re-roll that charge roll.\n-- This unit must end that charge move engaged with the closest charge target."
  ],
  [
   "Sanctified in Slaughter",
   "This unit has +1OC."
  ],
  [
   "Gore-stained Veterans",
   "This unit’s melee attacks have +1 WS."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Jakhals": [
  [
   "Objective Ravaged",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent's Level of Control over that objective marker is greater than yours at the end of a phase."
  ],
  [
   "Icon of Khorne",
   "If the bearer's unit contains 1 or more Icons of Khorne, each time the bearer's unit destroys an enemy unit, you gain one Bloodshed point. Each time you make a Blessings of Khorne roll, roll one additional D6 for each Bloodshed point you have, after which, all your Bloodshed points are lost."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Eightbound": [
  [
   "Beacons of Rage (Aura)",
   "While a friendly World Eaters unit is within 6\" of this unit, each time a model in that unit makes a melee attack that targets a unit (excluding Monsters and Vehicles), add 1 to the Hit roll. If that attack targets a unit that is Below Half-strength, add 1 to the Wound roll as well."
  ],
  [
   "Brazen Fury",
   "In your opponent’s Shooting phase, when an enemy unit has shot, if a model in this unit was destroyed as a result of those attacks, this unit can make a surge move of up to D6\". That surge move is a Brazen Fury move."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Exalted Eightbound": [
  [
   "Rend and Tear",
   "Each time a model in this unit makes a melee attack that targets a Monster or Vehicle unit, until the end of the phase, improve the Damage characteristic of that attack by 1."
  ],
  [
   "Brazen Fury",
   "In your opponent’s Shooting phase, when an enemy unit has shot, if a model in this unit was destroyed as a result of those attacks, this unit can make a surge move of up to D6\". That surge move is a Brazen Fury move."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
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
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Chaos Predator Annihilator": [
  [
   "Blood-hungry Annihilator",
   "Each time this model makes a ranged attack that targets the closest eligible Monster or Vehicle target within 18\", you can re-roll the Wound roll and you can re-roll the Damage roll."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Chaos Predator Destructor": [
  [
   "Punishing Suppression",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks (excluding Monsters and Vehicles*). Until the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Defiler": [
  [
   "Scuttling Walker",
   "Each time this unit makes a Normal, Advance or Fall Back move, it can move through models (excluding Titanic models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed."
  ],
  [
   "Unleash Wrath",
   "At the end of your opponent's Movement phase, you can select one enemy unit that was set up on the battlefield within 12\" of this model; this model can then either:\n- Shoot at that unit, but only if it is an eligible target.\n- Declare a charge against that unit (note that even if this charge is successful, this model does not receive any Charge bonus this turn)."
  ],
  [
   "Terror of Khorne",
   "At the start of the Fight phase, you can select one enemy unit engaged with this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. You cannot select the same enemy unit for this effect more than once per phase."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Forgefiend": [
  [
   "Furious Onslaught",
   "Each time this model makes a ranged attack that targets the closest eligible target within 18\", you can re-roll the Hit roll."
  ],
  [
   "Terror of Khorne",
   "At the start of the Fight phase, you can select one enemy unit engaged with this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. You cannot select the same enemy unit for this effect more than once per phase."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Helbrute": [
  [
   "Frenzy",
   "(Once per turn, per unit) In the Fight phase, when an enemy unit targets this unit, after that unit has resolved its attacks, you can use this ability. If you do, this unit is eligible to fight (even if it has already fought this phase) and must be selected to fight next."
  ],
  [
   "Devoted to Destruction",
   "If this model is equipped with 2 melee weapons in addition to its close combat weapon, add 2 to the Attacks characteristic of those two weapons."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Heldrake": [
  [
   "Airborne Predator",
   "Each time this model makes an attack that targets a unit that can Fly, add 1 to the Hit roll."
  ],
  [
   "Terror of Khorne",
   "At the start of the Fight phase, you can select one enemy unit engaged with this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. You cannot select the same enemy unit for this effect more than once per phase."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Maulerfiend": [
  [
   "The Scent of Blood",
   "In the Charge phase, when this unit declares a charge: \n- If an enemy unit below starting strength is within 9\" of this unit, this unit has +1 to charge rolls. \n- Or: If an enemy unit below half strength is within 9\" of this unit, this unit has +2 to charge rolls."
  ],
  [
   "Savage Exaltation",
   "Each time this model makes a melee attack that targets an enemy unit that is below its Starting Strength, add 1 to the Hit roll and, if that attack targets an enemy unit that is Below Half-Strength, add 1 to the Wound roll as well."
  ],
  [
   "Terror of Khorne",
   "At the start of the Fight phase, you can select one enemy unit engaged with this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. You cannot select the same enemy unit for this effect more than once per phase."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Chaos Rhino": [
  [
   "Meet Any Challenge",
   "In your opponent's Movement phase, each time an enemy unit is set up or ends a Normal, Advance or Fall Back move within 8\" of this model, any units embarked within it can disembark."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Chaos Spawn": [
  [
   "To Slake Its Rage",
   "This unit is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Khorne Lord of Skulls": [
  [
   "Idol of Blessed Blood",
   "At the start of the battle round, if this unit is on the battlefield, when you make a Blessings of Khorne roll, roll one additional D6."
  ],
  [
   "Damaged: 1-8 wounds remaining",
   "While this model has 1-8 wounds remaining, subtract 4 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Terror of Khorne",
   "At the start of the Fight phase, you can select one enemy unit engaged with this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. You cannot select the same enemy unit for this effect more than once per phase."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Goremongers": [
  [
   "Loping Speed",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6\"."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Slaughterbound": [
  [
   "Rage Eternal",
   "While this model is leading a unit, in your Command phase, you can return one destroyed Bodyguard model to that unit."
  ],
  [
   "Possessed Lord",
   "Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by this model and those weapons have the [Devastating Wounds] ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units: Eightbound, Exalted Eightbound"
  ],
  [
   "Lord of the Eightbound",
   "If this model is attached to a World Eaters Possessed unit during the Declare Battle Formations step, this model has the Deep Strike and Scouts 6\" abilities."
  ],
  [
   "Blessings of Khorne",
   "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
  ]
 ],
 "Skarbrand": [
  [
   "Rage Embodied (Aura)",
   "While a friendly Blood Legions unit is within 6\" of this model, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit."
  ],
  [
   "Murderlust",
   "This unit is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, add 2 to the Attacks characteristic of this model’s Slaughter and Carnage."
  ]
 ],
 "Bloodthirster": [
  [
   "Daemon Lord of Khorne (Aura)",
   "While a friendly Blood Legions unit is within 6\" of this model, each time a model in that unit makes a melee attack, add 1 to the Hit roll."
  ],
  [
   "Relentless Carnage",
   "At the end of the Fight phase, you can select one enemy unit within Engagement Range of this model and roll eight D6: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Damaged: 1-6 wounds remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Bloodletters": [
  [
   "Bane of Cowards",
   "Each time an enemy unit (excluding Monsters and Vehicles) within Engagement Range of one or more units from your army with this ability Falls Back, models in that enemy unit must take Desperate Escape tests. When doing so, if that enemy unit is also Battle-shocked, subtract 1 from each of those Desperate Escape tests."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ]
 ],
 "Bloodcrushers": [
  [
   "Brass Stampede",
   "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of this unit and roll one D6 for each model in this unit: for each 4+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ]
 ],
 "Flesh Hounds": [
  [
   "Hunters from the Warp",
   "At the end of your opponent’s turn, if this unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Collar of Khorne",
   "The bearer has the Feel No Pain 3+ ability against Psychic Attacks."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Berzerker Warband",3,"","","","",0,"","Purge the Foe"],
  ["Brazen Engines",1,"","","","",0,"","Disruption"],
  ["Butchers Of Khorne",1,"","","","",0,"","Take and Hold"],
  ["Cult Of Blood",2,"","","","",0,"","Priority Assets"],
  ["Goretrack Onslaught",2,"","","","",0,"","Take and Hold"],
  ["Khorne Daemonkin",2,"","","","",0,"","Reconnaissance"],
  ["Possessed Slaughterband",2,"","","","",0,"","Purge the Foe"],
  ["Vessels Of Wrath",1,"","Wrath of Khorne","When a friendly WORLD EATERS CHARACTER unit (excluding EPIC HERO units) is selected to fight, that unit's CHARACTER models' melee attacks can have: \n- [CLEAVE 1]. \n- Or: +1 AP.","",0,"","Priority Assets"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Battle-lust",20,"Berzerker Warband","You can re-roll Charge rolls made for the bearer's unit. In addition, while the Unbridled Bloodlust Blessing of Khorne is active for your army, add 1 to Charge rolls made for the bearer's unit.",null],
  ["Berzerker Glaive",35,"Berzerker Warband","Add 1 to the Attacks and Damage characteristics of melee weapons (excluding Extra Attacks weapons) equipped by the bearer.",null],
  ["Favoured of Khorne",20,"Berzerker Warband","Each time you make a Blessings of Khorne roll, if the bearer is on the battlefield, you can re-roll up to 2 of the D6 rolled.",null],
  ["Helm of Brazen Ire",30,"Berzerker Warband","Each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of that attack.",null],
  ["Murder-forged Entity (Upgrade)",15,"Brazen Engines","",null],
  ["Talons of Butchery (Upgrade)",20,"Brazen Engines","",null],
  ["Gore-stained Veterans (Upgrade)",20,"Butchers Of Khorne","",null],
  ["Sanctified in Slaughter (Upgrade)",15,"Butchers Of Khorne","",null],
  ["Brazen Form",25,"Cult Of Blood","Add 1 to the bearer's Toughness characteristic and the bearer has the Feel No Pain 5+ ability.",null],
  ["Butcher Lord",10,"Cult Of Blood","The bearer has the Infiltrators ability.",null],
  ["Chosen of the Blood God",15,"Cult Of Blood","Add 3\" to the range of the bearer's Aura abilities.",null],
  ["Strategic Slaughter",20,"Cult Of Blood","After both players have deployed their armies, select up to 3 Jakhals and/or Goremongers units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves, regardless of how many units are already in Strategic Reserves.",null],
  ["Aggressive Deployment",20,"Goretrack Onslaught","In the Declare Battle Formations step, if the bearer starts the battle embarked within a Dedicated Transport, that Dedicated Transport has the Scouts 9\" ability.",null],
  ["Infernal Infusion",25,"Goretrack Onslaught","Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, the bearer's unit has the Fights First ability.",null],
  ["Murderous Onslaught",5,"Goretrack Onslaught","If the bearer's unit disembarked from a Transport this turn, until the end of the turn, enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer's unit.",null],
  ["Unleash Hell",10,"Goretrack Onslaught","At the start of your Shooting phase, you can select one Vehicle model within 6\" of the bearer or, if the bearer is embarked within a Transport, you can select that Transport model. Until the end of the phase, after the selected model has shot, select one enemy unit hit by one or more of those attacks. Until the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll.",null],
  ["Blade of Endless Bloodshed",30,"Khorne Daemonkin","Add 1 to the Attacks, Strength and Damage characteristics of the bearer's melee weapons. Each time the bearer's unit destroys an enemy unit with a melee attack, do not roll to gain a Blood Tithe point, you automatically gain 1 Blood Tithe point instead.",null],
  ["Blood-Forged Armour",20,"Khorne Daemonkin","The bearer has a Save characteristic of 2+. If the bearer is destroyed, you gain 1 Blood Tithe point.",null],
  ["Disciple of Khorne",15,"Khorne Daemonkin","The bearer has the Deep Strike ability, and it has the BLOOD LEGIONS Faction keyword instead of the WORLD EATERS Faction keyword.",null],
  ["Icon of War",25,"Khorne Daemonkin","While a friendly Blood Legions unit is within 6\" of the bearer, that unit has the Blessings of Khorne ability. If the Might of Khorne ability is active for your army, then while a friendly Blood Legions unit is within 6\" of the bearer, you can re-roll Battle-shock tests taken for that unit.",null],
  ["Frenzied Focus",20,"Possessed Slaughterband","Each time a model in the bearer's unit makes an attack, a Critical Hit is scored on an unmodified Hit roll of 5+, instead of only a 6.",null],
  ["Killing Clarity",15,"Possessed Slaughterband","Each time the bearer's unit destroys an enemy unit, roll one D6: on a 4+, you gain 1CP.",null],
  ["Malicious Vigour",30,"Possessed Slaughterband","Each time the bearer's unit makes a Brazen Fury move, it is treated as having rolled a 6 for the distance the unit can be moved.",null],
  ["Violent Demise",10,"Possessed Slaughterband","The bearer's Deadly Demise ability inflicts mortal wounds on a D6 roll of 2+ instead of on a 6. In addition, the bearer has the Deadly Demise D3+1 ability, instead of the Deadly Demise D3 ability.",null],
  ["Archslaughterer",30,"Vessels Of Wrath","(Once per battle, per army) In your Command phase, you can use this ability. If you do, every Blessing of Khorne is active for this unit until the start of your next turn.",null],
  ["Gateways to Glory",10,"Vessels Of Wrath","This model has: \n- MOBILE. \n- +1 to charge rolls.",null]
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
  "Forgefiend",
  "Helbrute",
  "Heldrake",
  "Khorne Lord of Skulls",
  "Maulerfiend"
 ],
 "monster": [
  "Bloodthirster",
  "Daemon Prince of Khorne",
  "Daemon Prince of Khorne with wings"
 ],
 "battleline": [
  "Bloodletters",
  "Khorne Berzerkers"
 ],
 "epic": [
  "Angron",
  "Khârn the Betrayer",
  "Lord Invocatus",
  "Skarbrand"
 ],
 "infantry": [
  "Chaos Terminators",
  "Eightbound",
  "Exalted Eightbound",
  "Goremongers",
  "Jakhals"
 ],
 "character": [
  "Lord on Juggernaut",
  "Master of Executions",
  "Slaughterbound"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Angron": "100",
 "Khârn the Betrayer": "40",
 "Lord Invocatus": "90x52.5",
 "Daemon Prince of Khorne": "60",
 "Daemon Prince of Khorne with wings": "60",
 "Lord on Juggernaut": "90x52.5",
 "Master of Executions": "40",
 "Khorne Berzerkers": "32",
 "Chaos Terminators": "40",
 "Jakhals": "28.5",
 "Eightbound": "40",
 "Exalted Eightbound": "40",
 "Chaos Land Raider": "coque",
 "Chaos Predator Annihilator": "coque",
 "Chaos Predator Destructor": "coque",
 "Defiler": "160",
 "Forgefiend": "120x92",
 "Helbrute": "60",
 "Heldrake": "120x92",
 "Maulerfiend": "120x92",
 "Chaos Rhino": "coque",
 "Chaos Spawn": "50",
 "Khorne Lord of Skulls": "coque",
 "Goremongers": "32",
 "Slaughterbound": "50",
 "Skarbrand": "100",
 "Bloodthirster": "120x92",
 "Bloodletters": "32",
 "Bloodcrushers": "90x52.5",
 "Flesh Hounds": "60x35.5"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Angron": 6,
 "Chaos Land Raider": 5,
 "Khorne Lord of Skulls": 8,
 "Skarbrand": 7,
 "Bloodthirster": 6
};

const TRANSPORTS = {
 "Chaos Land Raider": "This model has a transport capacity of 14 ^^**World Eaters Infantry^^** models. Each ^^**Possessed^^** and ^^**Terminator^^** model takes up the space of 2 models.",
 "Chaos Rhino": "This model has a transport capacity of 12 ^^**World Eaters Infantry**^^ models. It cannot transport ^^**Possessed^^** or ^^**Terminator^^** models."
};
const FACTION = [
 [
  "Blessings of Khorne",
  "If your Army Faction is World Eaters, at the start of the battle round, you can make a Blessings of Khorne roll. To do so, roll eight D6. You can then use those dice to activate up to two Blessings of Khorne. Each Blessing of Khorne specifies the dice results it requires (where a number is specified, a double or triple of that value or higher is required). You can only activate each Blessing of Khorne once per battle round. Any unused dice from the Blessings of Khorne roll are then discarded. Once activated, each Blessing of Khorne applies to all units from your army with this ability until the end of the battle round.\n\nExample: Ash makes their Blessings of Khorne roll and gets the following dice: 1, 2, 2, 2, 3, 4, 6, 6. First they use the two 6s to activate Warp Blades (which requires a double 5+), leaving the following dice: 1, 2, 2, 2, 3, 4.\nThey then use the two 2s to activate Wrathful Devotion (which requires any double), leaving the following dice: 1, 2, 3, 4.\nHowever, now that they have activated two Blessings of Khorne, they cannot activate any more and the remaining dice are discarded."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/worldeaters.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_COND = {
 "Daemon Prince of Khorne": [
  {
   "mot": "dev",
   "port": "C",
   "nom": "Assaut Dévastateur",
   "quand": "Ce modèle a chargé ce tour",
   "texte": "Each time this model makes a Charge move, until the end of the turn, its hellforged weapons have the [DEVASTATING WOUNDS] ability."
  }
 ],
 "Daemon Prince of Khorne with wings": [
  {
   "mot": "dev",
   "port": "C",
   "nom": "Assaut Dévastateur",
   "quand": "Ce modèle a chargé ce tour",
   "texte": "Each time this model makes a Charge move, until the end of the turn, its hellforged weapons have the [DEVASTATING WOUNDS] ability."
  }
 ],
 "Chaos Terminators": [
  {
   "champ": "rrH",
   "val": "failed",
   "port": "T",
   "nom": "Fureur Sanglante",
   "quand": "La cible est l'unité ennemie éligible la plus proche",
   "texte": "This unit's ranged attacks that target the closest eligible target can re-roll hit rolls."
  }
 ],
 "Chaos Predator Annihilator": [
  {
   "champ": "rrW",
   "val": "failed",
   "port": "T",
   "nom": "Annihilateur Assoiffé de Sang",
   "quand": "La cible est le MONSTRE ou VÉHICULE éligible le plus proche, à 18\" ou moins",
   "texte": "Each time this model makes a ranged attack that targets the closest eligible Monster or Vehicle target within 18\", you can re-roll the Wound roll and you can re-roll the Damage roll. (La relance des dégâts n'est pas simulée.)"
  }
 ],
 "Forgefiend": [
  {
   "champ": "rrH",
   "val": "failed",
   "port": "T",
   "nom": "Assaut Furieux",
   "quand": "La cible est l'unité éligible la plus proche, à 18\" ou moins",
   "texte": "Each time this model makes a ranged attack that targets the closest eligible target within 18\", you can re-roll the Hit roll."
  }
 ],
 "Maulerfiend": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Exaltation Sauvage",
   "quand": "La cible est sous son Effectif de Départ",
   "texte": "Each time this model makes a melee attack that targets an enemy unit that is below its Starting Strength, add 1 to the Hit roll."
  },
  {
   "champ": "wndMod",
   "val": 1,
   "port": "C",
   "nom": "Exaltation Sauvage — sous la moitié",
   "quand": "La cible est sous la moitié de son effectif",
   "texte": "If that attack targets an enemy unit that is Below Half-Strength, add 1 to the Wound roll as well."
  }
 ],
 "Slaughterbound": [
  {
   "mot": "dev",
   "port": "C",
   "nom": "Seigneur Possédé",
   "quand": "L'aptitude est déclenchée — une fois par bataille",
   "texte": "Once per battle, at the start of the Fight phase: until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by this model and those weapons have the [DEVASTATING WOUNDS] ability."
  },
  {
   "champ": "atkMod",
   "val": 3,
   "port": "C",
   "nom": "Seigneur Possédé — les attaques",
   "quand": "L'aptitude est déclenchée — une fois par bataille",
   "texte": "Add 3 to the Attacks characteristic of melee weapons equipped by this model."
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
 ]
};
const APTIS_CIBLE = {
 "Master of Executions": [
  {
   "vs": [
    "perso"
   ],
   "champ": "rrH",
   "val": "failed",
   "port": "C",
   "nom": "Un Crâne Digne de ce Nom",
   "texte": "Each time this model makes a melee attack that targets a Character unit, you can re-roll the Hit roll."
  },
  {
   "vs": [
    "perso"
   ],
   "champ": "rrW",
   "val": "failed",
   "port": "C",
   "nom": "Un Crâne Digne de ce Nom",
   "texte": "Each time this model makes a melee attack that targets a Character unit, you can re-roll the Wound roll."
  }
 ],
 "Exalted Eightbound": [
  {
   "vs": [
    "mon",
    "veh"
   ],
   "champ": "dmgMod",
   "val": 1,
   "port": "C",
   "nom": "Déchirer et Lacérer",
   "texte": "Each time a model in this unit makes a melee attack that targets a Monster or Vehicle unit, improve the Damage characteristic of that attack by 1."
  }
 ],
 "Heldrake": [
  {
   "vs": [
    "vol"
   ],
   "champ": "hitMod",
   "val": 1,
   "nom": "Prédateur Aérien",
   "texte": "Each time this model makes an attack that targets a unit that can Fly, add 1 to the Hit roll."
  }
 ]
};
const AURAS_PERSO = {
 "Khârn the Betrayer": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Tueur Légendaire",
   "texte": "While this model is leading a unit, each time a model in that unit makes a melee attack, re-roll a Hit roll of 1."
  },
  {
   "champ": "rrW",
   "val": "ones",
   "port": "C",
   "nom": "Tueur Légendaire",
   "texte": "While this model is leading a unit, each time a model in that unit makes a melee attack, re-roll a Wound roll of 1."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "source": "Eightbound",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "port": "C",
  "nom": "Balises de Rage (Aura)",
  "quand": "L'unité est à 6\" des Huit-Enchaînés, et la cible n'est ni MONSTRE ni VÉHICULE",
  "texte": "While a friendly World Eaters unit is within 6\" of this unit, each time a model in that unit makes a melee attack that targets a unit (excluding Monsters and Vehicles), add 1 to the Hit roll."
 },
 {
  "source": "Eightbound",
  "kw": [],
  "champ": "wndMod",
  "val": 1,
  "port": "C",
  "nom": "Balises de Rage (Aura) — cible entamée",
  "quand": "L'unité est à 6\" des Huit-Enchaînés, et la cible est sous la moitié de son effectif",
  "texte": "If that attack targets a unit that is Below Half-strength, add 1 to the Wound roll as well."
 },
 {
  "source": "Skarbrand",
  "kw": [],
  "champ": "atkMod",
  "val": 1,
  "port": "C",
  "nom": "Rage Incarnée (Aura)",
  "quand": "L'unité est à 6\" de Skarbrand, et elle est BLOOD LEGIONS",
  "texte": "While a friendly Blood Legions unit is within 6\" of this model, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit."
 },
 {
  "source": "Bloodthirster",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "port": "C",
  "nom": "Seigneur Démon de Khorne (Aura)",
  "quand": "L'unité est à 6\" du Bloodthirster, et elle est BLOOD LEGIONS",
  "texte": "While a friendly Blood Legions unit is within 6\" of this model, each time a model in that unit makes a melee attack, add 1 to the Hit roll."
 }
];

/* Vides, faute de câblage : voir l'en-tête. */
const ARMEMENT = {};
const STRAT_SIMU = [];
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

enregistreFaction({
  cle : "worldeaters",
  nom : "World Eaters",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
