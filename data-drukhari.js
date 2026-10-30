/* ============================================================
   Données Drukhari — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py drukhari

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
     23 fiches sur 30 en ont un. Les autres — des Legends, que le
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
  ["Archon",7,3,4,2,4,[1],{"1": 80},0,"Meneur",0,"",1,"6+"],
  ["Beastmaster",12,4,6,6,3,[7],{"7": 135},0,"",1,"",1,"7+"],
  ["Court of the Archon",7,3,5,5,2,[4],{"4": 95},0,"",1,"",1,"7+"],
  ["Cronos",7,7,3,6,7,[1, 2],{"1": 55, "2": 100},0,"",0,"",2,"7+"],
  ["Drazhar",7,3,2,4,5,[1],{"1": 85},0,"Meneur",0,"",1,"6+"],
  ["Grotesques",7,5,6,6,4,[3, 6],{"3": 80, "6": 170},0,"",1,"",1,"7+"],
  ["Haemonculus",7,4,5,6,5,[1],{"1": 50},0,"Meneur",0,"",1,"7+"],
  ["Hand of the Archon",7,3,4,6,1,[10],{"10": 115},0,"",0,"",1,"7+"],
  ["Hellions",14,4,4,6,2,[5, 10],[[1, {"5": 90, "10": 180}], [3, {"5": 100, "10": 190}]],0,"",0,"",1,"7+"],
  ["Incubi",7,3,3,5,1,[5, 10],[[1, {"5": 90, "10": 180}], [3, {"5": 100, "10": 190}]],0,"",0,"",1,"6+"],
  ["Kabalite Warriors",7,3,4,6,1,[10],{"10": 110},0,"",0,"",2,"7+"],
  ["Lady Malys",7,3,4,4,5,[1],{"1": 100},0,"Meneur",0,"",2,"6+"],
  ["Lelith Hesperax",8,3,6,4,4,[1],{"1": 80},0,"Meneur",0,"",1,"6+"],
  ["Mandrakes",8,3,7,5,1,[5, 10],[[1, {"5": 80, "10": 160}], [3, {"5": 90, "10": 170}]],0,"",0,"",1,"7+"],
  ["Raider",14,8,4,6,10,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"7+"],
  ["Ravager",14,9,4,6,11,[1],{"1": 110},0,"",0,"",3,"7+"],
  ["Raven Strike Fighter",20,8,4,5,10,[1],{"1": 170},0,"",1,"",0,"7+"],
  ["Razorwing Jetfighter",0,8,4,6,10,[1],{"1": 170},0,"",0,"",0,"7+"],
  ["Reaper",14,9,4,6,11,[1],{"1": 115},0,"",1,"",3,"7+"],
  ["Reavers",16,4,4,6,2,[3, 6],[[1, {"3": 75, "6": 150}], [3, {"3": 85, "6": 160}]],0,"",0,"",2,"7+"],
  ["Scourges with Heavy Weapons",14,3,4,5,1,[5],[[1, {"5": 110}], [3, {"5": 120}]],0,"",0,"",1,"7+"],
  ["Scourges with Shardcarbines",14,3,4,5,1,[5],[[1, {"5": 75}], [3, {"5": 85}]],0,"",0,"",1,"7+"],
  ["Succubus",8,3,6,4,4,[1],{"1": 50},0,"Meneur",0,"",1,"7+"],
  ["Talos",7,7,3,6,7,[1, 2],[[1, {"1": 70, "2": 140}], [3, {"1": 80, "2": 150}]],0,"",0,"",2,"7+"],
  ["Tantalus",16,10,4,5,18,[1],{"1": 230},0,"",1,"",5,"7+"],
  ["Urien Rakarth",7,4,6,4,5,[1],{"1": 80},0,"Meneur",1,"",1,"6+"],
  ["Venom",14,6,4,6,6,[1],[[1, {"1": 65}], [4, {"1": 75}]],0,"",0,"",1,"7+"],
  ["Voidraven Bomber",0,9,4,6,12,[1],{"1": 245},0,"",0,"",0,"7+"],
  ["Wracks",7,4,5,6,2,[5, 8, 10],{"5": 55, "8": 90, "10": 110},0,"",0,"",2,"7+"],
  ["Wyches",8,3,6,4,1,[10],{"10": 90},0,"",0,"",2,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Archon","Blast pistol","T","1",2,8,3,"D3","pistol","6\""],
  ["Archon","Splinter pistol","T","1",2,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Archon","Agoniser","C","6",2,3,2,"1","anti:3:inf","càc"],
  ["Archon","Huskblade","C","4",2,3,2,"3","dev","càc"],
  ["Archon","Master-crafted power weapon","C","5",2,4,2,"2","","càc"],
  ["Beastmaster","Splinter pods","T","2",3,2,0,"1","anti:3:inf assault twin","18\""],
  ["Beastmaster","Agonizer","C","3",3,3,2,"1","anti:3:inf","càc"],
  ["Beastmaster","Clawed Fiend fists","C","5",4,5,2,"2","dev","càc"],
  ["Beastmaster","Khymerae talons","C","4",4,5,1,"1","lethal","càc"],
  ["Beastmaster","Razorwing Feathers","C","6",4,3,0,"1","sust:1","càc"],
  ["Court of the Archon","Eyeburst","T","D6",0,6,2,"1","pistol torrent","12\""],
  ["Court of the Archon","Shardcarbine","T","3",3,2,0,"1","anti:3:inf assault","18\""],
  ["Court of the Archon","Splinter pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Court of the Archon","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Court of the Archon","Shaimeshi Blade","C","4",3,4,2,"1","anti:2:inf","càc"],
  ["Court of the Archon","Sslyth battle-blade","C","3",3,5,2,"2","","càc"],
  ["Court of the Archon","Ur-ghul Talons","C","6",3,4,0,"1","sust:1","càc"],
  ["Cronos","Spirit Syphon","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Cronos","Spirit Vortex","T","D6",3,5,1,"1","blast ignorescover","18\""],
  ["Cronos","Spirit-leech Tentacles","C","6",3,5,1,"1","anti:2:inf","càc"],
  ["Drazhar","➤ The Executioner's demiklaives - Dual Blades","C","8",2,5,2,"2","dev","càc"],
  ["Drazhar","➤ The Executioner's demiklaives - Single Blade","C","6",2,6,2,"3","dev","càc"],
  ["Grotesques","Liquifier Gun","T","D6",0,4,1,"1","anti:3:inf torrent","12\""],
  ["Grotesques","Monstrous Weapons","C","4",3,5,2,"2","","càc"],
  ["Grotesques","Paired monstrous Weapons","C","4",3,5,2,"2","twin","càc"],
  ["Haemonculus","Stinger Pistol","T","1",2,2,1,"D3","anti:2:inf pistol precision","12\""],
  ["Haemonculus","Haemonculus tools and scissorhands","C","5",2,3,1,"D3","anti:2:inf precision","càc"],
  ["Hand of the Archon","Blast Pistol","T","1",3,8,3,"D3","pistol","6\""],
  ["Hand of the Archon","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Hand of the Archon","Dark Lance","T","1",4,12,3,"D6+2","heavy","36\""],
  ["Hand of the Archon","Shardcarbine","T","3",3,2,0,"1","anti:3:inf assault","18\""],
  ["Hand of the Archon","Shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Hand of the Archon","Splinter Cannon","T","3",4,3,1,"2","anti:3:inf heavy sust:1","36\""],
  ["Hand of the Archon","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Hand of the Archon","Splinter Rifle","T","2",3,2,0,"1","anti:3:inf assault","24\""],
  ["Hand of the Archon","Stinger pistol","T","1",3,2,0,"1","anti:2:inf pistol","12\""],
  ["Hand of the Archon","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Hand of the Archon","Pain sculptors","C","3",3,4,1,"1","anti:4:inf twin","càc"],
  ["Hand of the Archon","Power Weapon","C","4",3,3,2,"1","anti:3:inf","càc"],
  ["Hand of the Archon","Razorflail","C","4",3,4,2,"1","","càc"],
  ["Hellions","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Hellions","Splinter Pods","T","2",3,2,0,"1","anti:3:inf assault","18\""],
  ["Hellions","Hellglaive","C","3",3,4,1,"2","lance sust:1","càc"],
  ["Hellions","Power weapon","C","4",3,3,2,"1","anti:3:inf lance sust:1","càc"],
  ["Hellions","Stunclaw","C","4",3,3,1,"1","dev lance precision","càc"],
  ["Incubi","Klaive","C","3",3,5,2,"2","","càc"],
  ["Incubi","➤ Demiklaives - Dual Blades","C","6",3,4,2,"1","","càc"],
  ["Incubi","➤ Demiklaives - Single Blade","C","4",3,5,2,"2","","càc"],
  ["Kabalite Warriors","Blast Pistol","T","1",3,8,3,"D3","pistol","6\""],
  ["Kabalite Warriors","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Kabalite Warriors","Dark Lance","T","1",4,12,3,"D6+2","heavy","36\""],
  ["Kabalite Warriors","Shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Kabalite Warriors","Splinter Cannon","T","3",4,3,1,"2","anti:3:inf heavy sust:1","36\""],
  ["Kabalite Warriors","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Kabalite Warriors","Splinter Rifle","T","2",3,2,0,"1","anti:3:inf assault","24\""],
  ["Kabalite Warriors","Close Combat Weapon","C","2",3,3,0,"1","","càc"],
  ["Kabalite Warriors","Power Weapon","C","3",3,3,2,"1","anti:3:inf","càc"],
  ["Lady Malys","Lady's Blade","C","6",2,5,3,"3","dev hazardous","càc"],
  ["Lady Malys","Razor fan","C","6",2,3,0,"1","extra","càc"],
  ["Lelith Hesperax","Lelith's blades","C","8",2,3,2,"1","anti:2:inf precision sust:2","càc"],
  ["Mandrakes","Baleblast","T","2",3,5,1,"1","assault dev ignorescover","18\""],
  ["Mandrakes","Glimmersteel Blade","C","3",3,5,1,"1","dev","càc"],
  ["Raider","Dark Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Raider","Disintegrator Cannon","T","3",3,6,3,"2","","36\""],
  ["Raider","Bladevanes and chainsnares","C","D3+3",4,6,1,"1","","càc"],
  ["Ravager","Dark Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Ravager","Disintegrator Cannon","T","3",3,6,3,"2","","36\""],
  ["Ravager","Bladevanes","C","3",4,6,1,"1","","càc"],
  ["Raven Strike Fighter","Dark lance","T","1",3,12,3,"D6+2","","36\""],
  ["Raven Strike Fighter","Splinterstorm cannon","T","8",3,3,1,"2","anti:3:inf sust:2","36\""],
  ["Raven Strike Fighter","Bladed wings","C","3",4,6,1,"1","","càc"],
  ["Razorwing Jetfighter","Dark Lance","T","1",3,12,3,"D6+2","","36\""],
  ["Razorwing Jetfighter","Disintegrator Cannon","T","3",3,6,3,"2","","36\""],
  ["Razorwing Jetfighter","Splinter Cannon","T","3",3,3,1,"2","anti:3:inf sust:1","36\""],
  ["Razorwing Jetfighter","Twin Splinter Rifle","T","2",3,2,0,"1","anti:3:inf assault rf:2","24\""],
  ["Razorwing Jetfighter","➤ Razorwing Missiles - Monoscythe Missiles","T","D6",3,6,1,"2","blast","48\""],
  ["Razorwing Jetfighter","➤ Razorwing Missiles - Neurotoxin Missiles","T","D6+3",3,2,0,"1","anti:2:inf blast","48\""],
  ["Razorwing Jetfighter","➤ Razorwing Missiles - Shatterfield Missiles","T","D6",3,7,2,"1","blast","48\""],
  ["Razorwing Jetfighter","Bladed Wings","C","3",4,6,1,"1","","càc"],
  ["Reaper","➤ Storm vortex projector - beam","T","3",3,12,3,"D6","","36\""],
  ["Reaper","➤ Storm vortex projector - blast","T","D6+3",3,6,2,"2","blast","24\""],
  ["Reaper","Bladevanes","C","3",4,6,1,"1","","càc"],
  ["Reaper","Prow blade","C","1",4,8,2,"2","extra lance sust:3","càc"],
  ["Reavers","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Reavers","Heat Lance","T","1",3,14,4,"D6","assault melta:3","18\""],
  ["Reavers","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Reavers","Splinter Rifle","T","2",3,2,0,"1","anti:3:inf assault","24\""],
  ["Reavers","Bladevanes","C","4",3,4,1,"1","lance","càc"],
  ["Scourges with Heavy Weapons","Blast Pistol","T","1",3,8,3,"D3","pistol","6\""],
  ["Scourges with Heavy Weapons","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Scourges with Heavy Weapons","Dark Lance","T","1",4,12,3,"D6+2","heavy","36\""],
  ["Scourges with Heavy Weapons","Haywire Blaster","T","2",4,3,1,"3","anti:4:veh dev heavy","24\""],
  ["Scourges with Heavy Weapons","Heat Lance","T","1",4,14,4,"D6","assault heavy melta:3","18\""],
  ["Scourges with Heavy Weapons","Shardcarbine","T","3",3,2,0,"1","anti:3:inf assault","18\""],
  ["Scourges with Heavy Weapons","Shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Scourges with Heavy Weapons","Splinter Cannon","T","3",4,3,1,"2","anti:3:inf heavy sust:1","36\""],
  ["Scourges with Heavy Weapons","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Scourges with Heavy Weapons","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Scourges with Heavy Weapons","Power Weapon","C","3",3,3,2,"1","anti:3:inf","càc"],
  ["Scourges with Shardcarbines","Blast Pistol","T","1",3,8,3,"D3","pistol","6\""],
  ["Scourges with Shardcarbines","Blaster","T","1",3,8,4,"D6+1","assault","18\""],
  ["Scourges with Shardcarbines","Shardcarbine","T","3",3,2,0,"1","anti:3:inf assault","18\""],
  ["Scourges with Shardcarbines","Shredder","T","D6",0,6,0,"1","assault torrent","18\""],
  ["Scourges with Shardcarbines","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Scourges with Shardcarbines","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Scourges with Shardcarbines","Power Weapon","C","3",3,3,2,"1","anti:3:inf","càc"],
  ["Succubus","Archite glaive and agoniser","C","7",2,3,2,"1","anti:3:inf precision","càc"],
  ["Talos","Stinger Pod","T","2D6",3,5,0,"1","","24\""],
  ["Talos","Twin Haywire Blaster","T","2",3,3,1,"3","anti:4:veh dev twin","24\""],
  ["Talos","Twin Liquifier Gun","T","D6",0,4,1,"1","anti:3:inf torrent twin","12\""],
  ["Talos","Twin Splinter Cannon","T","3",3,3,1,"2","anti:3:inf sust:1 twin","36\""],
  ["Talos","Twin heat lance","T","1",3,14,4,"D6","assault melta:3 twin","18\""],
  ["Talos","Chain-flails","C","8",3,6,1,"1","","càc"],
  ["Talos","Macro-Scalpel","C","5",3,7,2,"2","","càc"],
  ["Talos","Talos Gauntlet","C","5",4,9,2,"3","","càc"],
  ["Talos","Talos Ichor Injector","C","1",2,8,2,"D6","extra","càc"],
  ["Tantalus","Pulse disintegrators","T","12",3,10,2,"2","assault","36\""],
  ["Tantalus","Dire scythe blades","C","9",4,8,1,"2","dev","càc"],
  ["Urien Rakarth","Casket of Flensing","T","3D6",0,3,1,"1","dev oneshot torrent","12\""],
  ["Urien Rakarth","Haemonculus tools and scissorhands","C","5",2,3,1,"D3","anti:2:inf precision","càc"],
  ["Venom","Splinter Cannon","T","3",3,3,1,"2","anti:3:inf sust:1","36\""],
  ["Venom","Twin Splinter Rifle","T","2",3,2,0,"1","anti:3:inf assault rf:2","24\""],
  ["Venom","Bladevanes","C","3",4,5,1,"1","","càc"],
  ["Voidraven Bomber","Dark Scythe","T","6",3,8,4,"2","","24\""],
  ["Voidraven Bomber","Void Lance","T","2",3,14,4,"D6+2","","36\""],
  ["Voidraven Bomber","➤ Voidraven Missiles -  Implosion Missiles","T","D3",3,9,2,"3","blast","48\""],
  ["Voidraven Bomber","➤ Voidraven Missiles - Shatterfield Missiles","T","D6",3,7,2,"1","blast","48\""],
  ["Voidraven Bomber","Bladed Wings","C","3",4,6,1,"1","","càc"],
  ["Wracks","Hexrifle","T","1",3,8,2,"3","heavy precision","36\""],
  ["Wracks","Liquifier Gun","T","D6",0,4,1,"1","anti:3:inf torrent","12\""],
  ["Wracks","Ossefactor","T","1",3,2,2,"2","anti:4:inf dev","24\""],
  ["Wracks","Stinger Pistol","T","1",3,2,0,"1","anti:2:inf pistol","12\""],
  ["Wracks","Power weapon","C","3",3,5,2,"1","anti:3:inf","càc"],
  ["Wracks","Torturer's tool","C","2",3,4,1,"1","anti:4:inf","càc"],
  ["Wracks","Twin Torturer's Tools","C","2",3,4,1,"1","anti:4:inf twin","càc"],
  ["Wyches","Blast Pistol","T","1",3,8,4,"D3","pistol","6\""],
  ["Wyches","Splinter Pistol","T","1",3,2,0,"1","anti:3:inf assault pistol","12\""],
  ["Wyches","Gladiatorial weapons","C","5",3,4,2,"1","","càc"],
  ["Wyches","Hekatarii Blade","C","4",3,3,1,"1","","càc"],
  ["Wyches","Power weapon","C","5",3,3,2,"1","anti:3:inf","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Archon","Personnage"],
  ["Beastmaster","Personnage"],
  ["Court of the Archon","Infanterie"],
  ["Cronos","Monstre"],
  ["Drazhar","Epic Hero"],
  ["Grotesques","Infanterie"],
  ["Haemonculus","Personnage"],
  ["Hand of the Archon","Infanterie"],
  ["Hellions","Monté"],
  ["Incubi","Infanterie"],
  ["Kabalite Warriors","Battleline"],
  ["Lady Malys","Epic Hero"],
  ["Lelith Hesperax","Epic Hero"],
  ["Mandrakes","Infanterie"],
  ["Raider","Véhicule"],
  ["Ravager","Véhicule"],
  ["Raven Strike Fighter","Véhicule"],
  ["Razorwing Jetfighter","Véhicule"],
  ["Reaper","Véhicule"],
  ["Reavers","Monté"],
  ["Scourges with Heavy Weapons","Infanterie"],
  ["Scourges with Shardcarbines","Infanterie"],
  ["Succubus","Personnage"],
  ["Talos","Monstre"],
  ["Tantalus","Véhicule"],
  ["Urien Rakarth","Epic Hero"],
  ["Venom","Véhicule"],
  ["Voidraven Bomber","Véhicule"],
  ["Wracks","Battleline"],
  ["Wyches","Battleline"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Archon": [
  "Court of the Archon",
  "Hand of the Archon",
  "Incubi",
  "Kabalite Warriors"
 ],
 "Drazhar": [
  "Incubi"
 ],
 "Haemonculus": [
  "Wracks"
 ],
 "Lady Malys": [
  "Hand of the Archon",
  "Incubi",
  "Kabalite Warriors"
 ],
 "Lelith Hesperax": [
  "Wyches"
 ],
 "Succubus": [
  "Wyches"
 ],
 "Urien Rakarth": [
  "Wracks"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Archon": [
  [
   "Leader",
   "This model can be attached to the following units:\n- COURT OF THE ARCHON\n- HAND OF THE ARCHON\n- INCUBI\n- KABALITE WARRIORS"
  ],
  [
   "Overlord",
   "Once per battle, at the start of any phase, you can select one friendly Drukhari unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked."
  ],
  [
   "Devious Mastermind",
   "Once per battle round, one model from your army with this ability can use it when its unit is targeted with a stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Hatred Eternal (Pain)",
   "In your Shooting or the Fight phase, when you select this model's unit to shoot or fight, you can spend 1 Pain token to Empower that unit. While that unit is Empowered, each time a model in that unit makes an attack, you can re-roll the Hit roll."
  ],
  [
   "Shadowfield",
   "While this model has an InSv, this unit cannot re-roll save rolls. When this model loses a wound (excluding from mortal wounds), this model has no InSv until the end of the battle."
  ],
  [
   "Soul Trap",
   "Add 1 to the Attacks and Strength characteristics of the bearer's melee weapons. The first time the bearer makes a melee attack that destroys an enemy model, after all the bearer's attacks have been resolved, until the end of the battle, add an additional 1 to the Attacks and Strength characteristics of the bearer's melee weapons."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Beastmaster": [
  [
   "Beastmaster",
   "While this unit contains a Beastmaster model, you can re-roll Charge rolls made for this unit."
  ],
  [
   "Goaded Savagery (Pain)",
   "In the Fight phase, when you select this unit to fight, you can spend 1 of your Pain tokens to Empower this unit. While this unit is Empowered, if it contains a Beastmaster model, each time a Beast model in this unit makes a melee attack, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Court of the Archon": [
  [
   "Court of the Archon",
   "While a Character model is leading a unit that contains one or more Lhamaean, Medusae, Sslyth and/or Ur-ghul models, that Character model has the Feel No Pain 4+ ability."
  ],
  [
   "Deadly Retinue (Pain)",
   "At the start of your Shooting phase or at the start of the Fight phase, you can spend 1 Pain token to Empower this unit. While this unit is Empowered:\n■ If it contains one or more Lhamaean models, melee weapons equipped by models in this unit have the [LETHAL HITS] ability.\n■ If it contains one or more Medusae models, ranged weapons equipped by models in this unit have the [IGNORES COVER] ability.\n■ If it contains one or more Sslyth models, each time a melee attack targets this unit, subtract 1 from the Wound roll.\n■ If this unit contains one or more Ur-ghul models, this unit has the Fights First ability."
  ],
  [
   "Court of the Archon [Legends]",
   "This unit can be led by an Archon. Alternatively, in the Declare Battle Formations step, this unit can join one Kabalite Warriors or Hand of the Archon unit from your army that is being led by an Archon (a unit cannot have more than one Court of the Archon unit joined to it). If it does, until the end of the battle, every model in this unit counts as part of that Kabalite Warriors or Hand of the Archon unit, and its Starting Strength is increased accordingly."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Cronos": [
  [
   "Pain Engine (Aura)",
   "Each time you spend 1 Pain token to Empower a friendly unit within 9\" of this unit, roll one D6, adding 1 to the result if one or more models in this unit are not equipped with a spirit vortex: on a 5+, you gain 1 Pain token.\n\n\nDesigner's Note: Pain tokens you spend for reasons other than Empowering a unit do not trigger this ability."
  ],
  [
   "Pain Parasite (Pain)",
   "In your Shooting phase or the Fight phase, when you select this unit to shoot or fight, you can spend 1 Pain token to Empower this unit. While Empowered, each time this unit shoots or fights, after it has resolved its attacks, if one or more enemy models were destroyed as a result of those attacks, one model in this unit regains up to 3 lost wounds (if all models in this unit have their starting number of wounds and this unit is below its Starting Strength, 1 model is returned to this unit with 3 wounds remaining)."
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
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Drazhar": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Incubi"
  ],
  [
   "Master of Blades (Pain)",
   "In the Fight phase, when you select this model's unit to fight, you can spend 1 Pain token to Empower that unit. While that unit is Empowered, each time a model in that unit makes a melee attack, add 1 to the Wound roll."
  ],
  [
   "Onslaught",
   "While this model is leading a unit, each time a model in that unit makes a Pile-In or Consolidation move, it can move up to 6\" instead of up to 3\"."
  ],
  [
   "Silent Executioner",
   "Each time this model make an attack that targets a unit that is below its Starting Strength, you can re-roll the Hit roll. If that target is Below Half-Strength, you can re-roll the Wound roll as well."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Grotesques": [
  [
   "Monstrous Hulks",
   "This unit cannot embark within a Venom, but it can embark within other Drukhari Transports; when doing so, each Grotesque model takes up the space of 3 models."
  ],
  [
   "Macro-steroids (Pain)",
   "In the Fight phase, when you select this unit to fight, you can spend 1 of your Pain tokens to Empower this unit. While Empowered, melee weapons equipped by models in this unit have a Strength characteristic of 8 and the [LETHAL HITS] ability."
  ],
  [
   "Monstrous Charge",
   "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it, then roll one D6 for each model in this unit that is within Engagement Range of that enemy unit: for each 4+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Haemonculus": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Wracks"
  ],
  [
   "Fear Incarnate (Aura)",
   "While an enemy unit is within 6\" of this model, worsen the Leadership characteristic of models in that unit by 1. In addition, in the Battle-shock step of your opponent's Command phase, if such an enemy unit is below its Starting Strength, it must take a Battle-shock test."
  ],
  [
   "Pain Adept",
   "In your Command phase, if one or more models from your army with this ability are on the battlefield, roll one D6: on a 4+, you gain 1 Pain token."
  ],
  [
   "Fleshcraft (Pain)",
   "In your Command phase, you can spend 1 Pain token to Empower this model's unit. Each time you do, you can return up to D3+1 destroyed Bodyguard models to that unit."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Hellions": [
  [
   "Battlefield Butchery (Pain)",
   "In the Fight phase, when you select this unit to fight, you can spend 1 Pain token to Empower this unit. While Empowered, add 1 to the Attacks and Strength characteristics of this unit's melee weapons."
  ],
  [
   "Skyboard Evasion",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8” of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6”."
  ],
  [
   "Phantasm Grenade Launcher",
   "The bearer’s unit has the Smoke and Grenades keywords."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Incubi": [
  [
   "Tormentors",
   "At the start of the Fight phase, each enemy unit within Engagement Range of one or more units with this ability must take a Battle-shock test. Each time a model in this unit makes a melee attack that targets a Battle-shocked unit, add 1 to the Hit roll."
  ],
  [
   "Decapitating Strikes (Pain)",
   "In the Fight phase, when you select this unit to fight, you can spend 1 Pain token to Empower this unit. While Empowered, each time a model in this unit makes a melee attack that targets an Infantry unit, that attack has the [Devastating Wounds] ability."
  ],
  [
   "Incubi Shrine Token",
   "Once per battle for each Incubi Shrine token this unit has, you can change the result of one Hit roll or one Wound roll made for a Klaivex or Incubi model in this unit to an unmodified 6."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Kabalite Warriors": [
  [
   "Cruel Enforcers",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under you control, until your opponent's Level of Control over that objective marker is greater than yours at the end of a phase."
  ],
  [
   "Sadistic Raiders (Pain)",
   "In your Shooting phase or the Fight phase, when you select this unit to shoot or fight, you can spend 1 Pain token to Empower this unit. While Empowered, each time a model in this unit makes an attack, re-roll a Wound roll of 1. If the target is within range of an objective marker, you can re-roll the Wound roll instead."
  ],
  [
   "Phantasm Grenade Launcher",
   "The bearer’s unit has the Smoke and Grenades keywords."
  ],
  [
   "Kabalite Icon",
   "While the bearer's unit is not Battle-shocked, add 1 to the bearer's Objective Control characteristic."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Lelith Hesperax": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Wyches"
  ],
  [
   "Brides of Death (Pain)",
   "In the Fight phase, when you select this model's unit to fight, you can spend 1 Pain token to Empower that unit. While that unit is Empowered, each time a model in that unit makes a melee attack, improve the Strength and Armour Penetration characteristics of that attack by 1."
  ],
  [
   "Thrilling Spectacle",
   "Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, this model has a 3+ invulnerable save and change the Attacks characteristic of melee weapons equipped by this model to 12."
  ],
  [
   "Blur of Blades",
   "While this model is leading a unit, models in that unit have the Fights First ability."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Mandrakes": [
  [
   "Fade Away (Pain)",
   "At the end of your opponent’s Fight phase, if this unit is not within Engagement Range of one or more enemy units, you can spend 1 Pain token to Empower this unit. Each time you do, remove this unit from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Shade Weavers",
   "This unit cannot be targeted by ranged attacks unless the attacking model is within 18\"."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Raider": [
  [
   "Splinter Racks (Pain)",
   "In your Shooting phase, when you select this model to shoot, you can spend 1 Pain token to Empower this model. While Empowered, if one or more units are embarked within this model, each time this model makes an attack with a ranged weapon that has the Anti ability, you can re-roll the Hit roll."
  ],
  [
   "Vanguard of the Dark City",
   "At the start of your Command phase, select one of the abilities in the Vanguard of the Dark City section for this model. Until the start of your next Command phase, this model has that ability."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Ravager": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Eradicate the Foe",
   "Each time this model makes an attack that targets an enemy unit that is at its Starting Strength, you can re-roll the Hit roll."
  ],
  [
   "Agonising Suppression (Pain)",
   "In your Shooting phase, when you select this model to shoot, you can spend 1 Pain token to Empower this model. While Empowered, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the start of your next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Razorwing Jetfighter": [
  [
   "Ground-attack Craft",
   "Each time a model in this unit makes a ranged attack that targets an enemy unit (excluding units that can Fly), add 1 to the Hit roll."
  ],
  [
   "Nowhere to Run (Pain)",
   "In your Shooting phase, when you select this unit to shoot, you can spend 1 Pain token to Empower this unit. While Empowered, after this unit has shot, select one enemy unit (excluding Monsters and Vehicles) hit by one or more of those attacks; until the start of your next turn, that enemy unit is pinned. While a unit is pinned, subtract 2 from that unit's Move characteristic and subtract 2 from Charge rolls made for that unit."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Reavers": [
  [
   "Eviscerating Fly-by",
   "Each time this unit ends a Normal or Advance move, you can select one enemy unit (excluding Monster and Vehicle units) that it moved over during that move, then roll one D6 for each model in this unit: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Matchless Swiftness (Pain)",
   "In your Movement phase, when you select this unit to Advance, you can spend 1 Pain token to Empower this unit. While Empowered, each time this unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 8\" to the Move characteristic of models in this unit."
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
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Scourges with Heavy Weapons": [
  [
   "Airborne Evasion",
   "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of any enemy units, it can make a Normal move of up to 6\". If it does, until the end of the turn, this unit is not eligible to declare a charge."
  ],
  [
   "Winged Strike (Pain)",
   "In your Shooting phase, when you select this unit to shoot, you can spend 1 Pain token to Empower this unit. While Empowered, each time a model in this unit makes a range attack, you can re-roll the Hit roll."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Succubus": [
  [
   "Lithe Agility (Pain)",
   "In your Movement phase when you select this model's unit to Advance, or in your Charge phase before you make a Charge roll for this model's unit, you can spend 1 Pain token to Empower that unit. While that unit is Empowered, you can re-roll Advance and Charge rolls made for that unit."
  ],
  [
   "Storm of Blades",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Wyches"
  ],
  [
   "Bloody Spectacle",
   "Each time this model makes a melee attack that targets a Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll. Each time this model's unit destroys a Character model, you gain 1CP."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Talos": [
  [
   "Torture Device",
   "Each time this unit destroys an enemy unit, you gain 1 additional Pain token."
  ],
  [
   "Devoted to Pain",
   "If a model in this unit is equipped with 2 macro-scalpels, those weapons have the [Twin-Linked] ability."
  ],
  [
   "Mindless Killing Machines (Pain)",
   "At the start of the Fight phase, you can spend 1 Pain token to Empower this unit. While Empowered, each time a model in this unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 2+, do not remove it from play; that destroyed model can fight after the attacking unit has finished making its attacks, and it is then removed from play."
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
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Urien Rakarth": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Wracks"
  ],
  [
   "Horrific Regeneration",
   "The first time this model is destroyed, roll one D6 at the end of the phase. On a 2+, set this model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with its full wounds remaining"
  ],
  [
   "Sculptor of Torments (Pain)",
   "In your Fight phase, when you select this model’s unit to fight, you can spend 1 of your Pain tokens to Empower this model’s unit. While that unit is Empowered, each time a model in that unit makes a melee attack, add 1 to the Wound roll."
  ],
  [
   "Father of Pain",
   "Each time an attack with a Damage characteristic of 1 is allocated to a model in this model’s unit, that model has the Feel No Pain 4+ ability against that attack."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Venom": [
  [
   "Aerialists",
   "At the end of the Fight phase, if there are no models currently embarked within this TRANSPORT, you can select one friendly DRUKHARI INFANTRY unit that has 6 or fewer models that is wholly within 6\" of this TRANSPORT (you cannot select a unit that can FLY). Unless that unit is within Engagement Range of one or more enemy units, it can embark within this TRANSPORT. That unit can embark within this TRANSPORT in a turn it disembarked from a TRANSPORT."
  ],
  [
   "Rapid Deployment (Pain)",
   "In your Movement phase, when you select this model to Advance, you can spend 1 Pain token to Empower this model. While Empowered, units can disembark from this model after it has Advanced. Units that do so count as having made a Normal move that phase, and cannot declare a charge in the same turn, but can otherwise act normally in the remainder of the turn."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Voidraven Bomber": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Void Mine",
   "At the end of your opponent’s Fight phase, select one visible enemy model (excluding Lone Operative units) within 24\" of this unit, and roll one D6 for each enemy unit within D6\" of that model:\n- For each 4+, that enemy unit suffers D6 mortal wounds."
  ],
  [
   "Nowhere to Hide (Pain)",
   "In your Shooting phase, when you select this unit to shoot, you can spend 1 Pain token to Empower this unit. While Empowered, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that enemy unit cannot have the Benefit of Cover."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Wracks": [
  [
   "Torturer’s Craft",
   "In your Shooting phase and the Fight phase, after this unit has shot or fought, select one enemy unit (excluding Vehicles) hit by one or more of those attacks. That units must take a Battle-shock test."
  ],
  [
   "Experimental Enhancements (Pain)",
   "In the Fight phase, when you select this unit to fight, you can spend 1 Pain token to Empower this unit. Each time you do, select one of the following to apply to this unit until the end of the phase:\n\n■ Melee weapons equipped by non-Character models in this unit have an Attacks characteristic of 3.\n■ Melee weapons equipped by non-Character models in this unit have an Attacks characteristic of 4 and the [Hazardous] ability."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Wyches": [
  [
   "No Escape",
   "Each time an enemy unit (excluding Monsters and Vehicles) within Engagement Range of one or more units from your army with this ability Falls Back, all models in that enemy unit must take Desperate Escape test. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those tests."
  ],
  [
   "Acrobatic Gladiators (Pain)",
   "At the start of your Charge phase, you can spend 1 Pain token to Empower this unit. While Empowered, this unit is eligible to declare a charge in a turn in which it Advanced or Fell Back."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Tantalus": [
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Scything Charge",
   "Each time this model ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6: on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Engine of Destruction (Pain)",
   "In your Shooting phase, when you select this model to shoot, you can spend 1 Pain token to Empower this model. While Empowered, this model’s pulse disintegrators have the [RAPID FIRE 8] ability."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Raven Strike Fighter": [
  [
   "Ground-attack Craft",
   "Each time a model in this unit makes a ranged attack that targets an enemy unit  (excluding unit that can Fly), add 1 to the Hit roll."
  ],
  [
   "Shredding Fire (Pain)",
   "In your Shooting phase, when you select this unit to shoot, you can spend 1 Pain token to Empower this unit. While Empowered, the Armour Penetration characteristic of its ranged weapons is increased by 1."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Reaper": [
  [
   "Eradicate the Foe",
   "Each time this model makes an attack that targets an enemy unit that is at its Starting Strength, re-roll a Hit roll of 1. If the target unit has a Starting Strength of 1, this ability only applies if that unit has its starting number of wounds."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Electromagnetic Cascade (Pain)",
   "In your Shooting phase, when you select this model to shoot, you can spend 1 Pain token to Empower this model. While Empowered: \n■ Each time this model makes a ranged attack that targets a Vehicle unit, that attack has the [SUSTAINED HITS 2] ability. \n■ Each time this model makes a ranged attack that targets a non-Vehicle unit, that attack has the [SUSTAINED HITS 1] ability."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Lady Malys": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ Hand of the Archon\n■ Incubi\n■ Kabalite Warriors"
  ],
  [
   "Archon of the Poisoned Tongue (Pain)",
   "In your Shooting phase or the Fight phase, when you select this model's unit to shoot or fight, you can spend 1 Pain token to Empower that unit. If you do, select one of the following abilities: [Sustained Hits 1]; [Lethal Hits]. Until the end of the phase, while that unit is Empowered, weapons equipped by models in that unit have that selected ability."
  ],
  [
   "Precognisant",
   "If you army includes this model, after both players have deployed their armies, select up to three Drukhari units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves."
  ],
  [
   "Mind Like a Steel Trap",
   "Once per turn, when your opponent targets a unit from their army within 12” of this model with a stratagem, you can use this ability. If you do increase the CP cost of that use of that stratagem by 1CP."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Hand of the Archon": [
  [
   "Assassins' Poisons (Pain)",
   "In your Shooting phase or the Fight phase, when you select this unit to shoot or fight, you can spend 1 Pain token to Empower this unit. While Empowered, weapons equipped by models in this unit (excluding blast pistols, blasters and dark lances) have the [Lethal Hits] and [Precision] abilities."
  ],
  [
   "Archon's Will",
   "At the start of the first battle round, select one objective marker on the battlefield. Until the end of the battle, while this unit is within range of that objective marker, unless this unit is Battle-shocked, models in this unit have a 5+ invulnerable save and an Objective Control characteristic of 3."
  ],
  [
   "Archon's Retinue",
   "If this unit has a Leader unit attached to it during the Declare Battle Formations step, that Leader unit gains the Scouts 7\" ability."
  ],
  [
   "Phantasm Grenade Launcher",
   "The bearer’s unit has the Smoke keyword."
  ],
  [
   "Kabalite icon",
   "While the bearer's unit is not Battle-shocked, add 1 to the bearer's Objective Control characteristic."
  ],
  [
   "Stimm-needler",
   "Once per turn, the first time a saving throw is failed for a model in the bearer's unit, change the Damage characteristic of that attack to 0."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ],
 "Scourges with Shardcarbines": [
  [
   "Murderous Crossfire",
   "After this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly Drukhari unit makes a ranged attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per turn."
  ],
  [
   "Swooping Descent (Pain)",
   "In your Movement phase, you can spend 1 Pain token to Empower this unit. While Empowered, each time a model in this unit is set up on the battlefield using the Deep Strike ability, it can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units. When doing so, if this unit is set up within 8\" of one or more enemy units, until the end of the turn, it is not eligible to declare a charge."
  ],
  [
   "Power from Pain",
   "All Drukhari units have a Pain ability, tagged with the word 'Pain'. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is Drukhari, you can Empower units from your army with Pain abilities by spending Pain tokens (see below).\n\nGAINING PAIN TOKENS\n\nIf your Army Faction is Drukhari, you gain Pain tokens as follows:\n■ 1 Pain token at the start of your Command phase.\n■ 1 Pain token each time an enemy unit is destroyed.\n■ 1 Pain token each time an enemy unit fails a Battle-shock test.\n\nEach time you gain a Pain token, keep it to one side – this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount.\n\nEMPOWERED THROUGH PAIN\n\nEach Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Covenite Coterie",2,"","Stitchflesh Abominations","Each time an attack targets a Haemonculus Covens unit from your army, if the Strength characteristic of that attack is greater than the Toughness characteristic of your unit, subtract 1 from the Wound roll.","",0,"","Take and Hold"],
  ["Exhibition of Slaughter",1,"","Exacting Cruelty","Friendly WYCH CULT units’ melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]. This detachment has the WYCH CULT tag and cannot be taken with another WYCH CULT detachment.","",0,"","Reconnaissance"],
  ["Kabalite Agonysts",1,"","Contracted Harvest","Friendly BLADES FOR HIRE/KABAL units’ ranged attacks have [SUSTAINED HITS 1: non-MONSTER/VEHICLE]. This detachment has the KABAL tag and cannot be taken with another KABAL detachment.","",0,"","Disruption"],
  ["Kabalite Cartel",2,"","Murderous Agenda","At the start of the first battle round, select one of the Contracts below, then select one unit from your opponent’s army that matches the ‘Contract’ description in that Contract. Until that Contract is completed, that unit is your Contract unit and Kabal and Blades for Hire units from your army have the ability stated in that Contract. At the start of your Command phase, if your Contract unit is destroyed, that Contract is completed and you gain 3 Pain tokens. Trophy Hunters Contract: One CHARACTER unit. Ability: Each time a KABAL or BLADES FOR HIRE model in this unit makes an attack that targets the Contract unit, that attack has the [precision] ability. Sow Fear and Terror Contract: One INFANTRY or MOUNTED unit (excluding units containing only CHARACTER models). At the start of your Command phase, this Contract is completed if all non-CHARACTER models in that unit are destroyed. Ability: Each time a KABAL or BLADES FOR HIRE model in this unit makes an attack that targets an INFANTRY or MOUNTED unit, that attack has the [sustained hits 1] ability. Show of Strength Contract: One MONSTER or VEHICLE unit. Ability: Each time a KABAL or BLADES FOR HIRE model in this unit makes an attack that targets a MONSTER or VEHICLE unit, that attack has the [lethal hits] ability.","",0,"","Disruption"],
  ["Realspace Raiders",2,"","Alliance of Agony","At the start of the battle, you gain 2 Pain tokens for each of the following combinations your army contains (these do not need to be in the same Attached unit): ▪ One or more Archon models and one or more Kabalite Warriors units. ▪ One or more Succubus models and one or more Wyches units. ▪ One or more Haemonculus models and one or more Wracks units. Designer’s Note: These are all cumulative, so if your army contains at least one of all of the combinations listed above, you start the battle with 6 Pain tokens.","",0,"","Priority Assets"],
  ["Reaper’s Wager",3,"","Callous Competition","At the start of the battle, Drukhari units from your army are winning the wager. Each time a DRUKHARI unit from your army destroys an enemy unit, DRUKHARI units from your army are winning the wager. Each time a Harlequins unit from your army destroys an enemy unit, HARLEQUIN units from your army are winning the wager. While DRUKHARI units from your army are winning the wager, HARLEQUIN units from your army are losing the wager, and vice versa. Each time a DRUKHARI or HARLEQUINS model from your army makes an attack, if that model’s unit is winning the wager, re-roll a Hit roll of 1. If that model’s unit is losing the wager, re-roll a Hit roll of 1 and re-roll a Wound roll of 1 instead. HARLEQUINS You can include Harlequins units in your army (see Codex: Aeldari). The combined points cost of such units depends on your battle size: ▪ Incursion: Up to 500 pts ▪ Strike Force: Up to 1000 pts ▪ Onslaught: Up to 1500 pts No HARLEQUINS models from your army can be your WARLORD. If you select this Detachment, you cannot use the Corsairs and Travelling Players army rule.","",0,"","Priority Assets"],
  ["Skysplinter Assault",2,"","Rain Of Cruelty","Each time a Drukhari unit from your army disembarks from a Transport, until the end of the turn: ▪ Ranged weapons equipped by models in that disembarking unit have the [ignores cover] ability. ▪ Melee weapons equipped by models in that disembarking unit have the [lance] ability.","",0,"","Reconnaissance"],
  ["Spectacle of Spite",2,"","Combat Drugs","At the start of your Command phase, select which Combat Drugs will be active for your army until the start of your next Command phase. To do so, either select one from the list below (you cannot select the same Combat Drug more than once per battle), or randomly select two by rolling two D6. When doing so randomly, Combat Drugs you have previously selected can become active again, but if you randomly select one that is already active for your army, it has no additional effect. 1. Adrenalight Add 1 to the Attacks characteristic of melee weapons equipped by Wych Cult models from your army. 2. Hypex Add 2\" to the Move characteristic of WYCH CULT models from your army. 3. Serpentin Improve the Weapon Skill characteristic of melee weapons equipped by WYCH CULT models from your army by 1. 4. Painbringer Add 1 to the Toughness characteristic of WYCH CULT models from your army. 5. Grave Lotus Add 1 to the Strength characteristic of melee weapons equipped by WYCH CULT models from your army. 6. Splintermind Improve the Leadership characteristic of WYCH CULT models from your army by 1, and improve the Ballistic Skill characteristic of ranged weapons equipped by WYCH CULT models from your army by 1.","",0,"","Purge the Foe"],
  ["Tools of Torment",1,"","Darkest Artifice","Attacks that target friendly CRONOS/TALOS units with a S greater than that unit’s T have -1 to wound rolls. This detachment has the COVENS tag and cannot be taken with another COVENS detachment.","",0,"","Take and Hold"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Master Artisan",20,"Covenite Coterie","Haemonculus model only. Add 1 to the bearer's Wounds characteristic and add 1 to the Toughness characteristic of models in the bearer's unit.",null],
  ["Master Nemesine",5,"Covenite Coterie","Haemonculus model only. The bearer's weapons have the [Anti-Beast 2+] and [Anti-Monster 4+] abilities.",null],
  ["Master Regenesist",25,"Covenite Coterie","Haemonculus model only. Each time the bearer uses its Fleshcraft ability, you can return up to D3+3 destroyed Bodyguard models to the bearer's unit instead of D3+1.",null],
  ["Master Repugnomancer",15,"Covenite Coterie","",null],
  ["Hyperstimm Trafficker",20,"Exhibition of Slaughter","SUCCUBUS model only. This unit has +1 T.",null],
  ["Periapt of Torments",20,"Exhibition of Slaughter","Succubus model only. Enemy units cannot use the Fire Overwatch stratagem to shoot at the bearer's unit.",null],
  ["Contempt for Rivals",20,"Kabalite Agonysts","ARCHON model only. This unit’s attacks have [PRECISION].",null],
  ["Towering Arrogance",15,"Kabalite Agonysts","Archon models only. While the bearer is leading a unit, improve the Leadership and Objective Control characteristics of models in that unit by 1.",null],
  ["Informant Network",30,"Kabalite Cartel","Archon model only. At the start of the Declare Battle Formations step, select up to three Kabalite Warriors and/or Hand of the Archon units from your army; those units gain the Infiltrators ability.",null],
  ["Leechbite Plate",5,"Kabalite Cartel","Archon model only. The bearer has a Save characteristic of 3+. At the start of either player's Command phase, you can spend 1 Pain token; if you do, the bearer regains all of its lost wounds.",null],
  ["Towering Arrogance",20,"Kabalite Cartel","Archon models only. While the bearer is leading a unit, improve the Leadership and Objective Control characteristics of models in that unit by 1.",null],
  ["Webway Awl",25,"Kabalite Cartel","Archon model only. Models in the bearer's unit have the Deep Strike ability, and you can target the bearer's unit with the Rapid Ingress Stratagem for 0CP.",null],
  ["Crucible of Malediction",15,"Realspace Raiders","Haemonculus model only. Once per battle, in your Shooting phase, the bearer can use this Enhancement. If it does, you can spend 1 Pain token. Then, each enemy unit within 12\" of the bearer must take a Battle-shock test, subtracting 1 from that test if you spent 1 Pain token. Each time a Psyker unit fails that test, it suffers 3 mortal wounds.",null],
  ["Dark Vitality",20,"Realspace Raiders","Drukhari model only. The bearer's unit is always Empowered - you do not need to spend any Pain tokens to activate that unit's Pain abilities",null],
  ["Eye of Spite",15,"Realspace Raiders","Succubus model only. Improve the Attacks and Armour Penetration characteristics of the bearer’s melee weapons by 1. Each time the bearer's unit is selected to fight, you can spend 1 Pain token; if you do, until the end of the phase, improve the Attacks and Armour Penetration characteristics of the bearer’s melee weapons by 2 instead.",null],
  ["Labyrinthine Cunning",25,"Realspace Raiders","Archon model only. At the start of your Command phase, if the bearer is on the battlefield, you can do one of the following:\nSpend 1 Pain token and gain 1CP.\nRoll one D6: on a 4+, you gain 1CP.",null],
  ["Archraider",15,"Reaper’s Wager","Harlequins or Drukhari model only. In the Declare Battle Formations step, if the bearer starts the battle embarked within a Dedicated Transport, that Dedicated Transport has the Scouts 9\" ability.",null],
  ["Conductor of Torment",20,"Reaper’s Wager","Drukhari model only. In your Command phase, you can do one of the following:\n■ If your Drukhari units are currently losing the wager, you can gain 1 Pain token. If you do, Drukhari units from your army are now winning the wager.\n■ If your Drukhari units are currently winning the wager, you can discard 1 Pain token. If you do, Harlequins units from your army are now winning the wager.",null],
  ["Reaper’s Cowl",25,"Reaper’s Wager","Harlequins model only. Models in the bearer’s unit have the Stealth and Infiltrators abilities.",null],
  ["Webway Walker",15,"Reaper’s Wager","Harlequins or Drukhari model only. Models in the bearer’s unit have the Deep Strike ability. Each time the bearer’s unit is set up on the battlefield using the Deep Strike ability, if that unit is currently losing the wager, until the end of the turn, you can re-roll Charge rolls made for that unit.",null],
  ["NIGHTMARE SHROUD",20,"Skysplinter Assault","Drukhari model only. Each time the bearer’s unit disembarks from a Transport, until the end of the turn, enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer’s unit.",null],
  ["Phantasmal Smoke",15,"Skysplinter Assault","Drukhari model only. While the bearer’s unit is wholly within 6\" of a friendly Drukhari Transport:\nModels in the bearer’s unit have the  Stealth ability\nEach time a ranged attack targets the bearer's unit, models in that unit have the Benefit of Cover against that attack.",null],
  ["Sadistic Fulcrum",15,"Skysplinter Assault","Drukhari model only. Each time you spend 1 Pain token to Empower the bearer’s unit in the Shooting phase, select one friendly Drukhari Transport within 6\" of the bearer’s unit; until the end of the phase, each time that Transport makes an attack, you can re-roll the Hit roll.",null],
  ["Spiteful Raider",10,"Skysplinter Assault","Drukhari model only. Each time the bearer’s unit destroys an enemy unit in the Fight phase, if that enemy unit was within range of one or more objective markers when the bearer’s unit was selected to fight, you gain 1 additional Pain token.",null],
  ["Chronoshard",15,"Spectacle of Spite","Succubus model only. Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, models in the bearer's unit have the Fights First ability.",null],
  ["Morghenna’s Curse",20,"Spectacle of Spite","Succubus model only. Improve the Armour Penetration and Damage characteristics of the bearer's melee weapons by 1.",null],
  ["Periapt of Torments",25,"Spectacle of Spite","Succubus model only. Enemy units cannot use the Fire Overwatch stratagem to shoot at the bearer's unit.",null],
  ["Pharmacophex",15,"Spectacle of Spite","Succubus model only. At the start of your Command phase, after selecting which Combat Drugs will be active for your army, roll one D6 and consult the Combat Drugs list. The result rolled applies to the bearer's unit until the start of your next Command phase in addition to any other Combat Drugs that are active for your army. If you randomly select one that is already active for your army, it has no additional effect.",null],
  ["Elixir of the Corpse Courts (Upgrade)",15,"Tools of Torment","CRONOS/TALOS unit only. This unit has 5+ InSv.",null],
  ["Gnarlskin Experimentor",20,"Tools of Torment","HAEMONCULUS model only. Attacks that target this unit with a S greater than your unit’s T have -1 to wound rolls.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Connoisseurs of Pain","Covenite Coterie","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Drukhari unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Spend 1 Pain token. Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1. At the end of the phase, if your unit is still on the battlefield and it is a Haemonculus Covens unit, you gain 1 Pain token.",""],
  ["Distillers of Fear","Covenite Coterie","Ruse Stratégique",2,"Fight phase.","One Haemonculus Covens unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit that is Battle-shocked, that attack has the [DEVASTATING WOUNDS] ability.",""],
  ["Enfolding Nightmare","Covenite Coterie","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One HAEMONCULUS COVENS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Your unit can make a surge move of up to D6\".",""],
  ["Poisoner’s Art","Covenite Coterie","Fait Épique",1,"Fight phase, just after a Haemonculus Covens unit from your army has fought.","That HAEMONCULUS COVENS unit.","Select one enemy unit (excluding VEHICLES) hit by one or more of your unit’s attacks this phase. Until the end of the battle, that enemy unit is poisoned. At the start of each Command phase, roll one D6 for each poisoned unit on the battlefield: on a 4+, that unit suffers D3 mortal wounds.",""],
  ["Postmortality","Covenite Coterie","Fait Épique",1,"Any phase.","One HAEMONCULUS model from your army that was just destroyed. You can use this Stratagem on that model even though it was just destroyed.","Spend 1-3 Pain tokens. At the end of the phase, set up the destroyed model on the battlefield, unengaged and as close as possible to where it was destroyed. That model is not part of an attached unit and its unit has a starting strength of 1. That model has a number of wounds remaining equal to the number of Pain tokens you just spent.","You cannot use this Stratagem if you have 0 Pain tokens, and you cannot target the same HAEMONCULUS model with this Stratagem more than once per battle."],
  ["Symphony of Suffering","Covenite Coterie","Fait Épique",1,"Fight phase, just after a Drukhari unit from your army destroys an enemy unit.","That DRUKHARI unit.","Each enemy unit within 9\" of and visible to your unit must take a Battle-shock test, subtracting 1 from that test if your unit is a Haemonculus Covens unit.",""],
  ["Acrobatic Display","Exhibition of Slaughter","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly WYCH CULT unit.","That WYCH CULT unit.","Your unit has 5+ InSv.",""],
  ["Planned Strikes","Exhibition of Slaughter","",1,"Fight phase, when a friendly WYCH CULT unit is selected to fight.","That WYCH CULT unit.","Your unit’s melee attacks have [LETHAL HITS].",""],
  ["Sculpting the Stage","Exhibition of Slaughter","",1,"Your Movement phase, when a friendly WYCH CULT unit is selected to make an advance/fall-back move.","That WYCH CULT unit.","That move does not prevent your unit from being eligible to start an action.",""],
  ["Killers from the Dark Spires","Kabalite Agonysts","",1,"Your Shooting phase, when a friendly KABALITE WARRIORS unit is selected to shoot.","That KABALITE WARRIORS unit.","Your unit’s ranged attacks have [IGNORES COVER].",""],
  ["Prioritised Victim","Kabalite Agonysts","",1,"Your Shooting phase or the Fight phase, when a friendly BLADES FOR HIRE/KABAL unit targets a CHARACTER unit.","That BLADES FOR HIRE/KABAL unit.","Your unit’s attacks that target a CHARACTER unit can: ▪ Re-roll hit rolls of 1. ▪ Re-roll wound rolls of 1.",""],
  ["Shadows’ Reach","Kabalite Agonysts","",1,"Your Shooting phase, when a friendly BLADES FOR HIRE/KABAL unit has shot.","That BLADES FOR HIRE/KABAL unit.","Those attacks do not prevent your unit from being hidden.",""],
  ["Deadly Deceivers","Kabalite Cartel","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Kabal or Blades for Hire unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit can only be selected as the target of a ranged attack if the attacking model is within 18\".",""],
  ["Double-Cross","Kabalite Cartel","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Kabal or Blades for Hire unit from your army that was selected as the target of one or more of the attacking unit’s attacks, and one friendly Drukhari unit (excluding Vehicles).","Until the end of the phase, each time you would allocate an attack to a model in your KABAL or BLADES FOR HIRE unit, if your DRUKHARI unit is within Engagement Range of the attacking model, no saving throw is made for that attack; instead, your DRUKHARI unit suffers a number of mortal wounds equal to the Damage characteristic of that attack.",""],
  ["Enemies Without Number","Kabalite Cartel","Fait Épique",1,"Your Command phase, just after you complete a Contract.","One Archon WARLORD from your army.","Select one new Contract (this can be one you have already completed), then select one unit from your opponent’s army that is on the battlefield and matches the ‘Contract’ description in that Contract. Until that Contract is completed, that unit is your Contract unit and the Murderous Agenda Detachment rule applies as normal.",""],
  ["Making a Point","Kabalite Cartel","Tactique de Bataille",1,"Your Shooting phase.","One Kabalite Warriors or Hand of the Archon unit from your army that has not been selected to shoot this phase.","Until the end of the phase, improve the Ballistic Skill and Armour Penetration characteristics of ranged weapons equipped by models in your unit by 1.",""],
  ["Tailored Toxins","Kabalite Cartel","Fait Épique",1,"Your Shooting phase or the Fight phase.","One Kabal or Blades for Hire unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets your Contract unit, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Taken Alive","Kabalite Cartel","Tactique de Bataille",1,"Fight phase.","One Drukhari unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, add 1 to the Hit roll. If your Contract unit is destroyed as a result of those attacks, every unit in your opponent’s army must take a Battle-shock test. You cannot gain more than 3 Pain tokens as a result of failed Battle-shock tests caused by this Stratagem.",""],
  ["Dark Harvest","Realspace Raiders","Ruse Stratégique",1,"Start of the Fight phase.","Up to two Wracks units from your army, or one other Drukhari unit from your army.","Until the end of the phase, melee weapons equipped by models in each of those units have the [LETHAL HITS] ability.",""],
  ["Eager for the Kill","Realspace Raiders","Tactique de Bataille",1,"Start of your Movement phase.","Up to two Wyches units from your army, or one other Drukhari unit from your army, that have not been selected to move this phase.","Until the end of the phase, each time one of those units Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in that unit (this is not cumulative with the Reavers’ Matchless Swiftness ability).",""],
  ["Fighting Shadows","Realspace Raiders","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Drukhari unit from your army (excluding Haemonculus Covens units) that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Insensible to Pain","Realspace Raiders","Tactique de Bataille",2,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Haemonculus Covens unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.",""],
  ["Instinctive Spite","Realspace Raiders","Tactique de Bataille",1,"Start of your Shooting phase or the start of the Fight phase.","Up to two Drukhari Battleline units from your army, or one other Drukhari unit from your army.","You can spend 1 Pain token. Until the end of the phase, each time a model in each of those units makes an attack that targets an enemy unit that is Below Half-strength, add 1 to the Hit roll. If you spent 1 Pain token, add 1 to the Wound roll as well.",""],
  ["Raid and Fade","Realspace Raiders","Ruse Stratégique",2,"End of your Shooting phase.","Up to two Kabalite Warriors units from your army, or one other Drukhari unit from your army (excluding ScouRGES and Aircraft).","Each of those units can make a Normal move of up to 6\".","You cannot select units that are within Engagement Range of one or more enemy units. Until the end of the turn, those units are not eligible to declare a charge."],
  ["Dance Macabre","Reaper’s Wager","Ruse Stratégique",2,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Drukhari Infantry or Harlequins Infantry unit from your army that is within 8\" of that enemy unit.","Your unit can make a Normal move of up to D6\". If your unit is currently losing the wager, it can make a Normal move of up to 6\" instead.",""],
  ["Fateful Role","Reaper’s Wager","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Drukhari or Harlequins unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 to the result if that unit is losing the wager: on a 4+, do not remove it from play. That destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play.",""],
  ["Malicious Frenzy","Reaper’s Wager","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Drukhari or Harlequins unit from your army that has not been selected to shoot or fight this phase.","Select [LETHAL HITS] or [SUSTAINED HITS 1]. Until the end of the phase, weapons equipped by models in your unit have the selected ability.",""],
  ["Murderer’s Circus","Reaper’s Wager","Tactique de Bataille",1,"Fight phase, just after an enemy unit has selected its targets.","One Drukhari or Harlequins unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Scintillating Tempo","Reaper’s Wager","Ruse Stratégique",1,"Your Movement phase or your Charge phase, just after a Drukhari or Harlequins unit from your army is selected to make a Normal, Advance or Fall Back move, is set up on the battlefield, or declares a charge.","That unit.","Until the end of the turn, enemy units cannot use the Fire Overwatch Stratagem to shoot at your unit.",""],
  ["Shorten the Odds","Reaper’s Wager","Ruse Stratégique",1,"Your Movement phase, just after a Drukhari or Harlequins unit from your army has Advanced.","That unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced.",""],
  ["Night Shield","Skysplinter Assault","Équipement",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Drukhari Vehicle unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a 4+ invulnerable save.",""],
  ["Pounce on the Prey","Skysplinter Assault","Ruse Stratégique",1,"Your Movement phase, just after a Drukhari Infantry unit from your army disembarks from a Transport that made a Normal move this phase.","That INFANTRY unit.","Your unit makes an assault disembark move (Core Rules, 18.06) for that disembarkation.",""],
  ["Skyborne Annihilation","Skysplinter Assault","Tactique de Bataille",1,"Your Shooting phase.","One Drukhari unit from your army that has not been selected to shoot this phase and that disembarked from a Transport this turn.","Until the end of the phase, ranged weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability, or the [SUSTAINED HITS 2] ability if your unit is a Kabalite Warriors or Hand of the Archon unit.",""],
  ["Swooping Mockery","Skysplinter Assault","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Drukhari Transport from your army that is within 8\" of that enemy unit.","Your TRANSPORT can make a Normal move of up to 6\".",""],
  ["Vicious Blades","Skysplinter Assault","Ruse Stratégique",1,"Fight phase, just after a Drukhari Transport from your army has selected its targets.","That TRANSPORT.","After your TRANSPORT has fought, select one enemy unit that was the target of one or more of those attacks and roll one D6 for each model embarked within your TRANSPORT, adding 1 to the result if that embarked model is a Wracks model: for each 5+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",""],
  ["Wraithlike Retreat","Skysplinter Assault","Ruse Stratégique",1,"End of the Fight phase.","One DRUKHARI INFANTRY unit from your army that fought this phase.","Your unit can make a Normal or Fall Back move, but unless it is a WYCHES unit, it must end that move wholly within 3\" horizontally and 5\" vertically of a friendly DRUKHARI TRANSPORT and must embark within that TRANSPORT at the end of that move (otherwise, it cannot make that move). Your unit can embark within that TRANSPORT in a turn it disembarked from that TRANSPORT.",""],
  ["A Challenge Met","Spectacle of Spite","Tactique de Bataille",2,"Your opponent’s Movement phase, when an enemy unit ends a fall-back move.","One friendly unengaged WYCH CULT unit that is within 6\" of that enemy unit.","Declare a charge with your unit. When selecting charge targets, you can only select enemy units that made a fall-back move this phase and are within the maximum distance.",""],
  ["Acrobatic Display","Spectacle of Spite","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Wych Cult unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a 5+ invulnerable save.",""],
  ["Berserk Fugue","Spectacle of Spite","Ruse Stratégique",2,"Fight phase, just after an enemy unit has selected its targets.","One Wych Cult unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Deadly Debut","Spectacle of Spite","Tactique de Bataille",1,"Fight phase.","One DRUKHARI unit from your army that made a Charge move this turn and has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [LETHAL HITS] ability. If your unit is a Wyches unit, until the end of the phase, improve the Armour Penetration characteristic of melee weapons equipped by models in your unit by 1 as well.",""],
  ["Feigned Weakness","Spectacle of Spite","Ruse Stratégique",1,"Your Movement phase, just after a Drukhari unit from your army Falls Back.","That DRUKHARI unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in turn in which it Fell Back.",""],
  ["Preternatural Agility","Spectacle of Spite","Ruse Stratégique",1,"Start of your Movement or Charge phase.","One Wych Cult unit from your army.","Until the end of the phase, each time your unit makes a Normal, Advance or Charge move, you can ignore any or all modifiers to its Move characteristic and to Advance and Charge rolls made for it and, until the end of the turn, each time a model in your unit makes such a move, it can move horizontally through models (when doing so, such a model can move within Engagement Range of such models but cannot end a Normal or Advance move within Engagement Range of them).",""],
  ["Dividends of Agony","Tools of Torment","",1,"Fight phase, when a friendly HAEMONCULUS COVENS unit destroys an enemy unit.","That HAEMONCULUS COVENS unit.","Select one visible enemy unit within 12\" of your unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll.",""],
  ["Salting the Wound","Tools of Torment","",1,"Fight phase, when a friendly CRONOS/TALOS unit is selected to fight.","That CRONOS/TALOS unit.","Your unit’s attacks that target a battle-shocked unit have [DEVASTATING WOUNDS].",""],
  ["Urgent Metamorphosis","Tools of Torment","",1,"Your Movement phase, when a friendly HAEMONCULUS COVENS unit is selected to make a fall-back move.","That HAEMONCULUS COVENS unit.","That move does not prevent your unit from being eligible to declare a charge.",""],
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
  "Raider",
  "Ravager",
  "Raven Strike Fighter",
  "Razorwing Jetfighter",
  "Reaper",
  "Tantalus",
  "Venom",
  "Voidraven Bomber"
 ],
 "monster": [
  "Cronos",
  "Talos"
 ],
 "battleline": [
  "Kabalite Warriors",
  "Wracks",
  "Wyches"
 ],
 "epic": [
  "Drazhar",
  "Lady Malys",
  "Lelith Hesperax",
  "Urien Rakarth"
 ],
 "infantry": [
  "Court of the Archon",
  "Grotesques",
  "Hand of the Archon",
  "Incubi",
  "Mandrakes",
  "Scourges with Heavy Weapons",
  "Scourges with Shardcarbines"
 ],
 "character": [
  "Archon",
  "Beastmaster",
  "Haemonculus",
  "Succubus"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Archon": "32",
 "Cronos": "120x92",
 "Drazhar": "40",
 "Haemonculus": "25",
 "Hellions": "60x35.5",
 "Incubi": "28.5",
 "Kabalite Warriors": "25",
 "Lelith Hesperax": "32",
 "Mandrakes": "28.5",
 "Raider": "120x92",
 "Ravager": "120x92",
 "Razorwing Jetfighter": "120x92",
 "Reavers": "60x35.5",
 "Scourges with Heavy Weapons": "32",
 "Succubus": "25",
 "Talos": "120x92",
 "Venom": "120x92",
 "Voidraven Bomber": "120x92",
 "Wracks": "25",
 "Wyches": "25",
 "Lady Malys": "32",
 "Hand of the Archon": "25",
 "Scourges with Shardcarbines": "32"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Ravager": 4,
 "Voidraven Bomber": 4,
 "Tantalus": 6,
 "Reaper": 4
};

const TRANSPORTS = {
 "Raider": "This model has a transport capacity of 11 ^^**Drukhari Infantry **^^ models (excluding ^^**Jump Pack**^^ models).",
 "Venom": "This model has a transport capacity of 6 **DRUKHARI INFANTRY** models (excluding **JUMP PACK** models).\n\nBefore the battle, at the start of the Declare Battle Formations step, you can select one **KABALITE WARRIORS**, **HAND OF THE ARCHON** or **WYCHES** unit from your army that has not already been split. If you do, that unit is split into two units, each containing as equal a number of models as possible (when splitting a unit in this way, make a note of which models form each of the two new units). One of these units must start the battle embarked within this model; the other can start the battle embarked within another **TRANSPORT**, or it can be deployed as a separate unit.",
 "Tantalus": "This model has a transport capacity of 16 ^^**Drukhari Infantry**^^ models. Each ^^**Grotesque**^^ model takes up the space of 3 models. This model cannot transport models that can ^^**Fly**^^."
};
const FACTION = [
 [
  "Power from Pain",
  "Pain Abilities All Drukhari units have a Pain ability, tagged with the word ‘Pain’. Pain abilities only apply to a unit while it is Empowered. If your Army Faction is DRUKHARI, you can Empower units from your army with Pain abilities by spending Pain tokens (see below). Designer’s Note: You can also spend Pain tokens to activate additional effects in certain other rules such as Enhancements and Stratagems. Gaining Pain Tokens If your Army Faction is DRUKHARI, you gain Pain tokens as follows: ▪ 1 Pain token at the start of your Command phase. ▪ 1 Pain token each time an enemy unit is destroyed. ▪ 1 Pain token each time an enemy unit fails a Battle-shock test. Each time you gain a Pain token, keep it to one side - this is your Pain token pool. Each time you spend a Pain token, reduce your Pain token pool by the same amount. Empowered Through Pain Each Pain ability will state when you can spend Pain tokens to Empower that unit. When you do, until the end of the phase, that unit is Empowered and all Pain abilities it has take effect. While an Attached unit is Empowered, the Pain abilities of all Leader and Bodyguard units in that unit take effect - you do not need to spend additional Pain tokens to activate each of those Pain abilities. Example: At the start of your Charge phase, you spend 1 Pain token to Empower a unit of Wyches. The unit becomes Empowered, and so its Acrobatic Gladiators ability takes effect until the end of the phase. A Succubus is leading the unit, and so its Lithe Agility ability also takes effect until the end of the phase (no additional Pain token is required to activate that ability as well)."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/drukhari.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_COND = {
 "Incubi": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Tourmenteurs",
   "quand": "La cible est sous le choc",
   "texte": "Each time a model in this unit makes a melee attack that targets a Battle-shocked unit, add 1 to the Hit roll."
  }
 ],
 "Drazhar": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Exécuteur Silencieux",
   "quand": "La cible est sous son Effectif de Départ",
   "texte": "Each time this model make an attack that targets a unit that is below its Starting Strength, you can re-roll the Hit roll."
  },
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Exécuteur Silencieux — sous la moitié",
   "quand": "La cible est sous la moitié de son effectif",
   "texte": "If that target is Below Half-Strength, you can re-roll the Wound roll as well."
  }
 ],
 "Hellions": [
  {
   "champ": "atkMod",
   "val": 1,
   "port": "C",
   "nom": "Boucherie du Champ de Bataille (Douleur)",
   "quand": "L'unité est Renforcée (1 jeton de Douleur)",
   "texte": "In the Fight phase, when you select this unit to fight, you can spend 1 Pain token to Empower this unit. While Empowered, add 1 to the Attacks and Strength characteristics of this unit's melee weapons."
  },
  {
   "champ": "strMod",
   "val": 1,
   "port": "C",
   "nom": "Boucherie du Champ de Bataille (Douleur)",
   "quand": "L'unité est Renforcée (1 jeton de Douleur)",
   "texte": "In the Fight phase, when you select this unit to fight, you can spend 1 Pain token to Empower this unit. While Empowered, add 1 to the Attacks and Strength characteristics of this unit's melee weapons."
  }
 ],
 "Kabalite Warriors": [
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Pillards Sadiques (Douleur)",
   "quand": "L'unité est Renforcée (1 jeton de Douleur)",
   "texte": "In your Shooting phase or the Fight phase, when you select this unit to shoot or fight, you can spend 1 Pain token to Empower this unit. While Empowered, each time a model in this unit makes an attack, re-roll a Wound roll of 1."
  },
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Pillards Sadiques (Douleur) — sur objectif",
   "quand": "L'unité est Renforcée, et la cible est à portée d'un objectif",
   "texte": "If the target is within range of an objective marker, you can re-roll the Wound roll instead."
  }
 ],
 "Ravager": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Éradiquer l'Ennemi",
   "quand": "La cible est à son Effectif de Départ",
   "texte": "Each time this model makes an attack that targets an enemy unit that is at its Starting Strength, you can re-roll the Hit roll."
  }
 ],
 "Reaper": [
  {
   "champ": "rrH",
   "val": "ones",
   "nom": "Éradiquer l'Ennemi",
   "quand": "La cible est à son Effectif de Départ",
   "texte": "Each time this model makes an attack that targets an enemy unit that is at its Starting Strength, re-roll a Hit roll of 1. If the target unit has a Starting Strength of 1, this ability only applies if that unit has its starting number of wounds."
  }
 ],
 "Scourges with Heavy Weapons": [
  {
   "champ": "rrH",
   "val": "failed",
   "port": "T",
   "nom": "Frappe Ailée (Douleur)",
   "quand": "L'unité est Renforcée (1 jeton de Douleur)",
   "texte": "In your Shooting phase, when you select this unit to shoot, you can spend 1 Pain token to Empower this unit. While Empowered, each time a model in this unit makes a range attack, you can re-roll the Hit roll."
  }
 ],
 "Raven Strike Fighter": [
  {
   "champ": "apMod",
   "val": 1,
   "port": "T",
   "nom": "Feu Déchiqueteur (Douleur)",
   "quand": "L'unité est Renforcée (1 jeton de Douleur)",
   "texte": "In your Shooting phase, when you select this unit to shoot, you can spend 1 Pain token to Empower this unit. While Empowered, the Armour Penetration characteristic of its ranged weapons is increased by 1."
  }
 ],
 "Court of the Archon": [
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Suite Mortelle (Douleur)",
   "quand": "L'unité est Renforcée, et contient un Lhamaean",
   "texte": "While this unit is Empowered: ■ If it contains one or more Lhamaean models, melee weapons equipped by models in this unit have the [LETHAL HITS] ability."
  },
  {
   "mot": "ignoresCover",
   "port": "T",
   "nom": "Suite Mortelle (Douleur)",
   "quand": "L'unité est Renforcée, et contient une Medusae",
   "texte": "■ If it contains one or more Medusae models, ranged weapons equipped by models in this unit have the [IGNORES COVER] ability."
  }
 ],
 "Grotesques": [
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Macro-stéroïdes (Douleur)",
   "quand": "L'unité est Renforcée (1 jeton de Douleur) — la Force 8 n'est pas simulée",
   "texte": "In the Fight phase, when you select this unit to fight, you can spend 1 of your Pain tokens to Empower this unit. While Empowered, melee weapons equipped by models in this unit have a Strength characteristic of 8 and the [LETHAL HITS] ability."
  }
 ],
 "Wracks": [
  {
   "arme": "Torturer's tool",
   "champ": "atkMod",
   "val": 1,
   "port": "C",
   "nom": "Améliorations Expérimentales (Douleur)",
   "quand": "L'unité est Renforcée, et choisit 3 attaques — outils de tourmenteur",
   "texte": "■ Melee weapons equipped by non-Character models in this unit have an Attacks characteristic of 3."
  },
  {
   "arme": "Twin Torturer's Tools",
   "champ": "atkMod",
   "val": 1,
   "port": "C",
   "nom": "Améliorations Expérimentales (Douleur)",
   "quand": "L'unité est Renforcée, et choisit 3 attaques — outils de tourmenteur",
   "texte": "■ Melee weapons equipped by non-Character models in this unit have an Attacks characteristic of 3."
  }
 ]
};
const APTIS_CIBLE = {
 "Razorwing Jetfighter": [
  {
   "sauf": [
    "vol"
   ],
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Appareil d'Attaque au Sol",
   "texte": "Each time a model in this unit makes a ranged attack that targets an enemy unit (excluding units that can Fly), add 1 to the Hit roll."
  }
 ],
 "Raven Strike Fighter": [
  {
   "sauf": [
    "vol"
   ],
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Appareil d'Attaque au Sol",
   "texte": "Each time a model in this unit makes a ranged attack that targets an enemy unit  (excluding unit that can Fly), add 1 to the Hit roll."
  }
 ],
 "Succubus": [
  {
   "vs": [
    "perso"
   ],
   "champ": "rrH",
   "val": "failed",
   "port": "C",
   "nom": "Spectacle Sanglant",
   "texte": "Each time this model makes a melee attack that targets a Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll."
  },
  {
   "vs": [
    "perso"
   ],
   "champ": "rrW",
   "val": "failed",
   "port": "C",
   "nom": "Spectacle Sanglant",
   "texte": "Each time this model makes a melee attack that targets a Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll."
  }
 ]
};
const AURAS_PERSO = {
 "Succubus": [
  {
   "mot": "sust:1",
   "port": "C",
   "nom": "Tempête de Lames",
   "texte": "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "source": "Archon",
  "kw": [
   "Archon",
   "Court of the Archon",
   "Hand of the Archon",
   "Incubi",
   "Kabalite Warriors"
  ],
  "champ": "rrH",
  "val": "failed",
  "nom": "Haine Éternelle (Douleur)",
  "quand": "L'unité est menée par l'Archon, et elle est Renforcée",
  "texte": "In your Shooting or the Fight phase, when you select this model's unit to shoot or fight, you can spend 1 Pain token to Empower that unit. While that unit is Empowered, each time a model in that unit makes an attack, you can re-roll the Hit roll."
 },
 {
  "source": "Drazhar",
  "kw": [
   "Drazhar",
   "Incubi"
  ],
  "champ": "wndMod",
  "val": 1,
  "port": "C",
  "nom": "Maître des Lames (Douleur)",
  "quand": "L'unité est menée par Drazhar, et elle est Renforcée",
  "texte": "In the Fight phase, when you select this model's unit to fight, you can spend 1 Pain token to Empower that unit. While that unit is Empowered, each time a model in that unit makes a melee attack, add 1 to the Wound roll."
 },
 {
  "source": "Lelith Hesperax",
  "kw": [
   "Lelith Hesperax",
   "Wyches"
  ],
  "champ": "strMod",
  "val": 1,
  "port": "C",
  "nom": "Épouses de la Mort (Douleur)",
  "quand": "L'unité est menée par Lelith, et elle est Renforcée",
  "texte": "In the Fight phase, when you select this model's unit to fight, you can spend 1 Pain token to Empower that unit. While that unit is Empowered, each time a model in that unit makes a melee attack, improve the Strength and Armour Penetration characteristics of that attack by 1."
 },
 {
  "source": "Lelith Hesperax",
  "kw": [
   "Lelith Hesperax",
   "Wyches"
  ],
  "champ": "apMod",
  "val": 1,
  "port": "C",
  "nom": "Épouses de la Mort (Douleur)",
  "quand": "L'unité est menée par Lelith, et elle est Renforcée",
  "texte": "In the Fight phase, when you select this model's unit to fight, you can spend 1 Pain token to Empower that unit. While that unit is Empowered, each time a model in that unit makes a melee attack, improve the Strength and Armour Penetration characteristics of that attack by 1."
 },
 {
  "source": "Urien Rakarth",
  "kw": [
   "Urien Rakarth",
   "Wracks"
  ],
  "champ": "wndMod",
  "val": 1,
  "port": "C",
  "nom": "Sculpteur de Tourments (Douleur)",
  "quand": "L'unité est menée par Urien, et elle est Renforcée",
  "texte": "In your Fight phase, when you select this model’s unit to fight, you can spend 1 of your Pain tokens to Empower this model’s unit. While that unit is Empowered, each time a model in that unit makes a melee attack, add 1 to the Wound roll."
 },
 {
  "source": "Scourges with Shardcarbines",
  "kw": [],
  "champ": "apMod",
  "val": 1,
  "port": "T",
  "nom": "Feux Croisés Meurtriers",
  "quand": "La cible a été touchée par les Scourges cette phase",
  "texte": "After this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly Drukhari unit makes a ranged attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per turn."
 },
 {
  "detach": "Exhibition of Slaughter",
  "kw": [
   "Hellions",
   "Lelith Hesperax",
   "Reavers",
   "Succubus",
   "Wyches"
  ],
  "mot": "lethal",
  "port": "C",
  "nom": "Cruauté Exigeante",
  "quand": "La cible n'est ni MONSTRE ni VÉHICULE",
  "texte": "Friendly WYCH CULT units’ melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
 },
 {
  "detach": "Kabalite Agonysts",
  "kw": [
   "Archon",
   "Court of the Archon",
   "Hand of the Archon",
   "Kabalite Warriors",
   "Lady Malys",
   "Ravager",
   "Reaper",
   "Drazhar",
   "Incubi",
   "Mandrakes",
   "Scourges with Heavy Weapons",
   "Scourges with Shardcarbines"
  ],
  "mot": "sust:1",
  "port": "T",
  "nom": "Moisson Contractuelle",
  "quand": "La cible n'est ni MONSTRE ni VÉHICULE",
  "texte": "Friendly BLADES FOR HIRE/KABAL units’ ranged attacks have [SUSTAINED HITS 1: non-MONSTER/VEHICLE]."
 },
 {
  "detach": "Kabalite Cartel",
  "kw": [
   "Archon",
   "Court of the Archon",
   "Hand of the Archon",
   "Kabalite Warriors",
   "Lady Malys",
   "Ravager",
   "Reaper",
   "Drazhar",
   "Incubi",
   "Mandrakes",
   "Scourges with Heavy Weapons",
   "Scourges with Shardcarbines"
  ],
  "mot": "sust:1",
  "nom": "Contrat — Semer la Peur et la Terreur",
  "quand": "Ce contrat est en cours, et la cible est INFANTERIE ou MONTÉE",
  "texte": "Sow Fear and Terror Contract — Ability: Each time a KABAL or BLADES FOR HIRE model in this unit makes an attack that targets an INFANTRY or MOUNTED unit, that attack has the [sustained hits 1] ability."
 },
 {
  "detach": "Kabalite Cartel",
  "kw": [
   "Archon",
   "Court of the Archon",
   "Hand of the Archon",
   "Kabalite Warriors",
   "Lady Malys",
   "Ravager",
   "Reaper",
   "Drazhar",
   "Incubi",
   "Mandrakes",
   "Scourges with Heavy Weapons",
   "Scourges with Shardcarbines"
  ],
  "mot": "lethal",
  "nom": "Contrat — Démonstration de Force",
  "quand": "Ce contrat est en cours, et la cible est MONSTRE ou VÉHICULE",
  "texte": "Show of Strength Contract — Ability: Each time a KABAL or BLADES FOR HIRE model in this unit makes an attack that targets a MONSTER or VEHICLE unit, that attack has the [lethal hits] ability."
 },
 {
  "detach": "Reaper’s Wager",
  "kw": [],
  "champ": "rrH",
  "val": "ones",
  "nom": "Compétition Impitoyable",
  "quand": "Ton unité gagne ou perd le pari — dans les deux cas",
  "texte": "Each time a DRUKHARI or HARLEQUINS model from your army makes an attack, if that model’s unit is winning the wager, re-roll a Hit roll of 1. If that model’s unit is losing the wager, re-roll a Hit roll of 1 and re-roll a Wound roll of 1 instead."
 },
 {
  "detach": "Reaper’s Wager",
  "kw": [],
  "champ": "rrW",
  "val": "ones",
  "nom": "Compétition Impitoyable — pari perdu",
  "quand": "Ton unité perd le pari",
  "texte": "If that model’s unit is losing the wager, re-roll a Hit roll of 1 and re-roll a Wound roll of 1 instead."
 },
 {
  "detach": "Skysplinter Assault",
  "kw": [],
  "mot": "ignoresCover",
  "port": "T",
  "nom": "Pluie de Cruauté",
  "quand": "L'unité a débarqué d'un TRANSPORT ce tour",
  "texte": "Each time a Drukhari unit from your army disembarks from a Transport, until the end of the turn: ▪ Ranged weapons equipped by models in that disembarking unit have the [ignores cover] ability."
 },
 {
  "detach": "Skysplinter Assault",
  "kw": [],
  "champ": "wndMod",
  "val": 1,
  "port": "C",
  "nom": "Pluie de Cruauté — [LANCE]",
  "quand": "L'unité a débarqué d'un TRANSPORT ce tour, et elle a chargé",
  "texte": "▪ Melee weapons equipped by models in that disembarking unit have the [lance] ability. ([LANCE] : +1 pour blesser quand l'unité a chargé.)"
 },
 {
  "detach": "Spectacle of Spite",
  "kw": [
   "Hellions",
   "Lelith Hesperax",
   "Reavers",
   "Succubus",
   "Wyches"
  ],
  "champ": "atkMod",
  "val": 1,
  "port": "C",
  "nom": "Drogue de Combat — Adrénaline",
  "quand": "L'Adrénaline est active ce round",
  "texte": "1. Adrenalight Add 1 to the Attacks characteristic of melee weapons equipped by Wych Cult models from your army."
 },
 {
  "detach": "Spectacle of Spite",
  "kw": [
   "Hellions",
   "Lelith Hesperax",
   "Reavers",
   "Succubus",
   "Wyches"
  ],
  "champ": "strMod",
  "val": 1,
  "port": "C",
  "nom": "Drogue de Combat — Lotus Funèbre",
  "quand": "Le Lotus Funèbre est actif ce round",
  "texte": "5. Grave Lotus Add 1 to the Strength characteristic of melee weapons equipped by WYCH CULT models from your army."
 },
 {
  "detach": "Spectacle of Spite",
  "kw": [
   "Hellions",
   "Lelith Hesperax",
   "Reavers",
   "Succubus",
   "Wyches"
  ],
  "champ": "hitMod",
  "val": 1,
  "port": "C",
  "nom": "Drogue de Combat — Serpentin",
  "quand": "Le Serpentin est actif ce round — la CC améliorée est comptée comme +1 au jet",
  "texte": "3. Serpentin Improve the Weapon Skill characteristic of melee weapons equipped by WYCH CULT models from your army by 1."
 },
 {
  "detach": "Spectacle of Spite",
  "kw": [
   "Hellions",
   "Lelith Hesperax",
   "Reavers",
   "Succubus",
   "Wyches"
  ],
  "champ": "hitMod",
  "val": 1,
  "port": "T",
  "nom": "Drogue de Combat — Esprit-Écharde",
  "quand": "L'Esprit-Écharde est actif ce round — la CT améliorée est comptée comme +1 au jet",
  "texte": "6. Splintermind Improve the Leadership characteristic of WYCH CULT models from your army by 1, and improve the Ballistic Skill characteristic of ranged weapons equipped by WYCH CULT models from your army by 1."
 }
];
const STRAT_SIMU = [
 {
  "nom": "Distillers of Fear",
  "detach": "Covenite Coterie",
  "pc": 2,
  "ph": "C",
  "unites": [
   "Cronos",
   "Grotesques",
   "Haemonculus",
   "Talos",
   "Urien Rakarth",
   "Wracks"
  ],
  "sauf": [],
  "aide": "[BLESSURES DÉVASTATRICES] — contre une unité sous le choc",
  "effet": {
   "dev": true
  }
 },
 {
  "nom": "Planned Strikes",
  "detach": "Exhibition of Slaughter",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Hellions",
   "Lelith Hesperax",
   "Reavers",
   "Succubus",
   "Wyches"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] au corps à corps",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Killers from the Dark Spires",
  "detach": "Kabalite Agonysts",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Kabalite Warriors"
  ],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT] sur les armes de tir",
  "effet": {
   "ignoresCover": true
  }
 },
 {
  "nom": "Making a Point",
  "detach": "Kabalite Cartel",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Kabalite Warriors",
   "Hand of the Archon"
  ],
  "sauf": [],
  "aide": "CT améliorée de 1 (comptée comme +1 au jet) et +1 en PA",
  "effet": {
   "hitMod": 1,
   "apMod": 1
  }
 },
 {
  "nom": "Tailored Toxins",
  "detach": "Kabalite Cartel",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Archon",
   "Court of the Archon",
   "Hand of the Archon",
   "Kabalite Warriors",
   "Lady Malys",
   "Ravager",
   "Reaper",
   "Drazhar",
   "Incubi",
   "Mandrakes",
   "Scourges with Heavy Weapons",
   "Scourges with Shardcarbines"
  ],
  "sauf": [],
  "aide": "touches critiques sur 5+ — contre ton unité Contrat",
  "effet": {
   "critH": 5
  }
 },
 {
  "nom": "Taken Alive",
  "detach": "Kabalite Cartel",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "+1 pour toucher",
  "effet": {
   "hitMod": 1
  }
 },
 {
  "nom": "Dark Harvest",
  "detach": "Realspace Raiders",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES FATALES] au corps à corps — deux unités de Wracks, ou une autre",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Instinctive Spite",
  "detach": "Realspace Raiders",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "+1 pour toucher — contre une cible sous la moitié de son effectif",
  "effet": {
   "hitMod": 1
  }
 },
 {
  "nom": "Instinctive Spite — 1 jeton de Douleur",
  "detach": "Realspace Raiders",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "+1 pour toucher et +1 pour blesser — cible sous la moitié, et tu as dépensé 1 jeton",
  "effet": {
   "hitMod": 1,
   "wndMod": 1
  }
 },
 {
  "nom": "Malicious Frenzy",
  "detach": "Reaper’s Wager",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES FATALES] — si tu choisis celle-ci",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Malicious Frenzy — Touches Soutenues",
  "detach": "Reaper’s Wager",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] — si tu choisis celle-ci",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Skyborne Annihilation",
  "detach": "Skysplinter Assault",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] sur les armes de tir — l'unité a débarqué ce tour",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Skyborne Annihilation — Kabalites",
  "detach": "Skysplinter Assault",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Kabalite Warriors",
   "Hand of the Archon"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 2] sur les armes de tir — Guerriers Kabalites ou Main de l'Archonte",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "2"
  }
 },
 {
  "nom": "Deadly Debut",
  "detach": "Spectacle of Spite",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES FATALES] au corps à corps — l'unité a chargé ce tour",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Deadly Debut — Wyches",
  "detach": "Spectacle of Spite",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Wyches"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] et +1 en PA au corps à corps — l'unité a chargé ce tour",
  "effet": {
   "lethal": true,
   "apMod": 1
  }
 },
 {
  "nom": "Salting the Wound",
  "detach": "Tools of Torment",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Cronos",
   "Talos"
  ],
  "sauf": [],
  "aide": "[BLESSURES DÉVASTATRICES] — contre une unité sous le choc",
  "effet": {
   "dev": true
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
const APTIS_UNITE = {};

enregistreFaction({
  cle : "drukhari",
  nom : "Drukhari",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
