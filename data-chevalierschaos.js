/* ============================================================
   Données Chevaliers du Chaos — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py chevalierschaos

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 49 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     20 fiches sur 20 en ont un. Les autres — des Legends, que le
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
  ["Chaos Acastus Knight Asterius",8,13,2,5,30,[1],[[1, {"1": 785}], [2, {"1": 860}]],0,"",0,"",10,"6+"],
  ["Chaos Acastus Knight Porphyrion",8,13,2,5,30,[1],[[1, {"1": 725}], [2, {"1": 800}]],0,"",0,"",10,"6+"],
  ["Chaos Cerastus Knight Acheron",12,11,3,5,28,[1],[[1, {"1": 370}], [2, {"1": 385}]],0,"",0,"",10,"6+"],
  ["Chaos Cerastus Knight Atrapos",12,11,3,5,28,[1],[[1, {"1": 385}], [2, {"1": 415}]],0,"",0,"",10,"6+"],
  ["Chaos Cerastus Knight Castigator",12,11,3,5,28,[1],[[1, {"1": 370}], [2, {"1": 385}]],0,"",0,"",10,"6+"],
  ["Chaos Cerastus Knight Lancer",14,11,3,4,28,[1],[[1, {"1": 385}], [2, {"1": 415}]],0,"",0,"",10,"6+"],
  ["Chaos Questoris Knight Magaera",10,11,3,5,26,[1],[[1, {"1": 375}], [2, {"1": 390}]],0,"",0,"",10,"6+"],
  ["Chaos Questoris Knight Styrix",10,11,3,5,26,[1],[[1, {"1": 365}], [2, {"1": 380}]],0,"",0,"",10,"6+"],
  ["Knight Abominant",10,11,3,5,26,[1],[[1, {"1": 350}], [3, {"1": 370}]],0,"",0,"",10,"6+"],
  ["Knight Desecrator",10,11,3,5,26,[1],[[1, {"1": 350}], [3, {"1": 370}]],0,"",0,"",10,"6+"],
  ["Knight Despoiler",10,11,3,5,26,[1],[[1, {"1": 360}], [2, {"1": 390}]],0,"",0,"",10,"6+"],
  ["Knight Rampager",12,11,3,5,26,[1],[[1, {"1": 350}], [3, {"1": 370}]],0,"",0,"",10,"6+"],
  ["Knight Ruinator",10,11,3,5,26,[1],[[1, {"1": 325}], [3, {"1": 345}]],0,"",0,"",10,"6+"],
  ["Knight Tyrant",8,12,3,5,28,[1],[[1, {"1": 390}], [2, {"1": 410}]],0,"",0,"",10,"6+"],
  ["War Dog Brigand",12,9,3,5,14,[1],{"1": 135},0,"",0,"",6,"7+"],
  ["War Dog Executioner",12,9,3,5,14,[1],{"1": 130},0,"",0,"",6,"7+"],
  ["War Dog Huntsman",12,9,3,5,14,[1],{"1": 135},0,"",0,"",6,"7+"],
  ["War Dog Karnivore",14,9,3,5,14,[1],{"1": 145},0,"",0,"",6,"7+"],
  ["War Dog Moirax",12,9,3,5,14,[1],[[1, {"1": 150}], [3, {"1": 160}]],0,"",0,"",6,"7+"],
  ["War Dog Stalker",12,9,3,5,14,[1],{"1": 135},0,"",0,"",6,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Chaos Acastus Knight Asterius","Asterius volkite culverin","T","6",3,6,0,"2","dev","24\""],
  ["Chaos Acastus Knight Asterius","Karacnos mortar battery","T","D6+3",3,6,1,"1","anti:2:inf blast ignorescover indirect","48\""],
  ["Chaos Acastus Knight Asterius","Twin conversion beam cannon","T","3",3,16,2,"6","twin sust:D3","48\""],
  ["Chaos Acastus Knight Asterius","Titanic feet","C","6",4,10,1,"2","","càc"],
  ["Chaos Acastus Knight Porphyrion","Acastus autocannon","T","2",3,9,1,"3","","48\""],
  ["Chaos Acastus Knight Porphyrion","Acastus ironstorm missile pod","T","D6+6",3,5,0,"1","blast heavy indirect","48\""],
  ["Chaos Acastus Knight Porphyrion","Helios defence missiles","T","3",3,10,2,"D6","anti:2:vol heavy","48\""],
  ["Chaos Acastus Knight Porphyrion","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Chaos Acastus Knight Porphyrion","Twin magna lascannon","T","D6",3,18,4,"D6+6","blast twin","72\""],
  ["Chaos Acastus Knight Porphyrion","Titanic feet","C","6",4,10,1,"2","","càc"],
  ["Chaos Cerastus Knight Acheron","Acheron flame cannon","T","2D6",0,8,1,"2","ignorescover torrent","18\""],
  ["Chaos Cerastus Knight Acheron","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Chaos Cerastus Knight Acheron","➤ Reaper chainfist - strike","C","4",3,14,4,"6","","càc"],
  ["Chaos Cerastus Knight Acheron","➤ Reaper chainfist - sweep","C","12",3,9,3,"2","","càc"],
  ["Chaos Cerastus Knight Atrapos","➤ Atrapos lascutter - high intensity (tir)","T","D6",3,14,3,"4","sust:1","24\""],
  ["Chaos Cerastus Knight Atrapos","➤ Atrapos lascutter - low intensity (tir)","T","2D6",3,7,1,"2","sust:1","36\""],
  ["Chaos Cerastus Knight Atrapos","➤ Graviton singularity cannon - contained","T","D3",3,16,4,"D6+1","blast","24\""],
  ["Chaos Cerastus Knight Atrapos","➤ Graviton singularity cannon - singularity","T","D3",3,16,4,"D6+1","blast dev hazardous","24\""],
  ["Chaos Cerastus Knight Atrapos","➤ Atrapos lascutter - high intensity (càc)","C","6",3,14,3,"4","sust:1","càc"],
  ["Chaos Cerastus Knight Atrapos","➤ Atrapos lascutter - low intensity (càc)","C","12",3,7,1,"2","sust:1","càc"],
  ["Chaos Cerastus Knight Castigator","Castigator bolt cannon","T","18",3,6,2,"2","twin","36\""],
  ["Chaos Cerastus Knight Castigator","➤ Tempest warblade - strike","C","4",3,14,4,"6","","càc"],
  ["Chaos Cerastus Knight Castigator","➤ Tempest warblade - sweep","C","12",3,9,3,"2","","càc"],
  ["Chaos Cerastus Knight Lancer","Cerastus shock lance","T","6",3,6,0,"2","assault sust:2","12\""],
  ["Chaos Cerastus Knight Lancer","➤ Cerastus shock lance - strike","C","5",2,20,3,"8","lance","càc"],
  ["Chaos Cerastus Knight Lancer","➤ Cerastus shock lance - sweep","C","10",2,10,2,"3","","càc"],
  ["Chaos Questoris Knight Magaera","Lightning cannon","T","12",3,9,0,"2","sust:2","48\""],
  ["Chaos Questoris Knight Magaera","Phased plasma-fusil","T","2",3,8,3,"2","rf:2","24\""],
  ["Chaos Questoris Knight Magaera","Twin rad cleanser","T","D6",0,2,0,"1","anti:2:inf ignorescover torrent twin","12\""],
  ["Chaos Questoris Knight Magaera","➤ Hekaton siege claw - strike","C","4",3,20,3,"8","","càc"],
  ["Chaos Questoris Knight Magaera","➤ Hekaton siege claw - sweep","C","8",3,10,2,"3","","càc"],
  ["Chaos Questoris Knight Magaera","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Chaos Questoris Knight Magaera","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Chaos Questoris Knight Styrix","Graviton crusher","T","3",3,6,1,"2","anti:2:veh blast","18\""],
  ["Chaos Questoris Knight Styrix","Twin rad cleanser","T","D6",0,2,0,"1","anti:2:inf ignorescover torrent twin","12\""],
  ["Chaos Questoris Knight Styrix","Volkite chierovile","T","12",3,12,0,"3","dev","30\""],
  ["Chaos Questoris Knight Styrix","➤ Hekaton siege claw - strike","C","4",3,20,3,"8","","càc"],
  ["Chaos Questoris Knight Styrix","➤ Hekaton siege claw - sweep","C","8",3,10,2,"3","","càc"],
  ["Chaos Questoris Knight Styrix","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Chaos Questoris Knight Styrix","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Knight Abominant","Diabolus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["Knight Abominant","Volkite combustor","T","12",3,12,0,"3","dev ignorescover","30\""],
  ["Knight Abominant","Balemace","C","3",3,8,1,"2","extra","càc"],
  ["Knight Abominant","Electroscourge","C","9",3,10,2,"3","sust:1","càc"],
  ["Knight Desecrator","Desecrator laser destructor","T","3",2,18,4,"D6+3","","72\""],
  ["Knight Desecrator","Diabolus heavy stubber","T","3",2,5,0,"1","rf:3","36\""],
  ["Knight Desecrator","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Knight Desecrator","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Knight Desecrator","➤ Warpstrike claw - strike","C","4",3,20,3,"8","","càc"],
  ["Knight Desecrator","➤ Warpstrike claw - sweep","C","8",3,10,2,"3","","càc"],
  ["Knight Despoiler","Daemonbreath meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Knight Despoiler","Daemonbreath thermal cannon","T","2D3",3,12,4,"D6","blast melta:6","24\""],
  ["Knight Despoiler","Despoiler battle cannon","T","D6+3",3,10,1,"3","blast rf:D6","72\""],
  ["Knight Despoiler","Despoiler gatling cannon","T","18",3,6,2,"2","","36\""],
  ["Knight Despoiler","Diabolus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["Knight Despoiler","Havoc missile pod","T","D6+1",3,5,0,"1","blast indirect","48\""],
  ["Knight Despoiler","Heavy darkflamer","T","D6",0,5,1,"1","torrent ignorescover","12\""],
  ["Knight Despoiler","Hellstorm autocannons","T","3",3,7,1,"2","anti:2:vol twin","48\""],
  ["Knight Despoiler","Ruinspear rocket pod","T","3",3,8,2,"D6","","48\""],
  ["Knight Despoiler","Titanic feet","C","4",4,8,1,"2","","càc"],
  ["Knight Despoiler","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Knight Despoiler","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Knight Despoiler","➤ Warpstrike claw - strike","C","4",3,20,3,"8","","càc"],
  ["Knight Despoiler","➤ Warpstrike claw - sweep","C","8",3,10,2,"3","","càc"],
  ["Knight Rampager","Diabolus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["Knight Rampager","➤ Reaper chainsword - strike","C","6",2,14,4,"6","sust:1","càc"],
  ["Knight Rampager","➤ Reaper chainsword - sweep","C","18",2,9,3,"2","sust:1","càc"],
  ["Knight Rampager","➤ Warpstrike claw - strike","C","6",2,20,3,"8","sust:1","càc"],
  ["Knight Rampager","➤ Warpstrike claw - sweep","C","12",2,10,2,"3","sust:1","càc"],
  ["Knight Ruinator","Darkflame lance","T","D6+6",0,8,1,"2","ignorescover torrent","18\""],
  ["Knight Ruinator","Terrorpulse missiles","T","D6+6",3,8,2,"2","blast","36\""],
  ["Knight Ruinator","➤ Fellbore - strike","C","4",3,14,3,"6","anti:2:mon anti:2:veh","càc"],
  ["Knight Ruinator","➤ Fellbore - sweep","C","10",3,9,2,"2","","càc"],
  ["Knight Tyrant","Brimstone volcano lance","T","D3",3,20,5,"D6+8","blast","60\""],
  ["Knight Tyrant","Darkflame cannon","T","3D6",0,8,1,"2","ignorescover torrent","18\""],
  ["Knight Tyrant","Gheiststrike missile launcher","T","1",3,12,6,"D6+1","anti:4 dev","72\""],
  ["Knight Tyrant","Twin daemonbreath meltagun","T","1",3,9,4,"D6","melta:2 twin","12\""],
  ["Knight Tyrant","Twin desecrator cannon","T","D6",3,6,0,"1","blast twin","36\""],
  ["Knight Tyrant","Warpshock harpoon","T","D3",3,24,6,"12","blast dev","12\""],
  ["Knight Tyrant","➤ Ectoplasma decimator - standard","T","D6+3",3,8,3,"2","blast","36\""],
  ["Knight Tyrant","➤ Ectoplasma decimator - supercharge","T","D6+3",3,9,4,"3","blast hazardous","36\""],
  ["Knight Tyrant","Titanic feet","C","4",4,8,1,"2","","càc"],
  ["War Dog Brigand","Avenger chaincannon","T","12",3,6,1,"1","","24\""],
  ["War Dog Brigand","Daemonbreath spear","T","2",3,12,4,"D6","melta:4","18\""],
  ["War Dog Brigand","Diabolus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["War Dog Brigand","Havoc multi-launcher","T","D6",3,5,0,"1","blast indirect","48\""],
  ["War Dog Brigand","Armoured feet","C","4",3,6,0,"1","","càc"],
  ["War Dog Executioner","Daemonbreath meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["War Dog Executioner","Diabolus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["War Dog Executioner","War Dog autocannon","T","4",3,9,1,"3","","48\""],
  ["War Dog Executioner","Armoured feet","C","4",3,6,0,"1","","càc"],
  ["War Dog Huntsman","Daemonbreath meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["War Dog Huntsman","Daemonbreath spear","T","2",3,12,4,"D6","melta:4","18\""],
  ["War Dog Huntsman","Diabolus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["War Dog Huntsman","➤ Reaper chaintalon - strike","C","4",3,10,3,"3","","càc"],
  ["War Dog Huntsman","➤ Reaper chaintalon - sweep","C","8",3,8,2,"1","","càc"],
  ["War Dog Karnivore","Diabolus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["War Dog Karnivore","Havoc multi-launcher","T","D6",3,5,0,"1","blast indirect","48\""],
  ["War Dog Karnivore","Reaper chaintalon","C","12",3,8,2,"1","sust:1","càc"],
  ["War Dog Karnivore","Slaughterclaw","C","6",3,12,3,"D6+2","sust:1","càc"],
  ["War Dog Moirax","Conversion beam cannon","T","1",3,10,2,"3","sust:D3","24\""],
  ["War Dog Moirax","Graviton pulsar","T","D6",3,7,1,"2","anti:2:veh blast","24\""],
  ["War Dog Moirax","Lightning lock","T","6",3,8,0,"1","sust:2","36\""],
  ["War Dog Moirax","Rad cleanser","T","D6",0,2,0,"1","anti:2:inf ignorescover torrent","12\""],
  ["War Dog Moirax","Volkite veuglaire","T","4",3,8,0,"2","dev","36\""],
  ["War Dog Moirax","Armoured feet","C","4",3,6,0,"1","","càc"],
  ["War Dog Moirax","Siege claw","C","4",3,12,3,"D6+2","","càc"],
  ["War Dog Stalker","Avenger chaincannon","T","12",3,6,1,"1","","24\""],
  ["War Dog Stalker","Daemonbreath spear","T","2",3,12,4,"D6","melta:4","18\""],
  ["War Dog Stalker","Diabolus heavy stubber","T","3",3,5,0,"1","rf:3","36\""],
  ["War Dog Stalker","Havoc multi-launcher","T","D6",3,5,0,"1","blast indirect","48\""],
  ["War Dog Stalker","Slaughterclaw","C","4",3,12,3,"D6+2","","càc"],
  ["War Dog Stalker","➤ Reaper chaintalon - strike","C","4",3,10,3,"3","","càc"],
  ["War Dog Stalker","➤ Reaper chaintalon - sweep","C","8",3,8,2,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Chaos Acastus Knight Asterius","Véhicule"],
  ["Chaos Acastus Knight Porphyrion","Véhicule"],
  ["Chaos Cerastus Knight Acheron","Personnage"],
  ["Chaos Cerastus Knight Atrapos","Personnage"],
  ["Chaos Cerastus Knight Castigator","Personnage"],
  ["Chaos Cerastus Knight Lancer","Personnage"],
  ["Chaos Questoris Knight Magaera","Personnage"],
  ["Chaos Questoris Knight Styrix","Personnage"],
  ["Knight Abominant","Personnage"],
  ["Knight Desecrator","Personnage"],
  ["Knight Despoiler","Personnage"],
  ["Knight Rampager","Personnage"],
  ["Knight Ruinator","Personnage"],
  ["Knight Tyrant","Personnage"],
  ["War Dog Brigand","Véhicule"],
  ["War Dog Executioner","Véhicule"],
  ["War Dog Huntsman","Véhicule"],
  ["War Dog Karnivore","Véhicule"],
  ["War Dog Moirax","Véhicule"],
  ["War Dog Stalker","Véhicule"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "War Dog Executioner": [
  [
   "Snarling Rivalry",
   "This unit’s ranged attacks have [IGNORES COVER]."
  ],
  [
   "Executioner",
   "Each time this model makes an attack that targets a unit Below Half-strength, add 1 to the Hit roll. Each time an enemy unit is destroyed as the result of this model's attacks, before removing the last model in that unit from the battlefield, each other unit from your opponent's army that is within 3\" of it must take a Battle-shock test."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "War Dog Stalker": [
  [
   "Stalker",
   "Each time this model makes an attack that targets an enemy unit, if there are no other units from your opponent’s army within 6\" of that target, add 1 to the Wound roll."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "War Dog Karnivore": [
  [
   "Karnivore",
   "You can re-roll Advance and Charge rolls made for this model."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "War Dog Brigand": [
  [
   "Brigand",
   "Ranged weapons equipped by this model have the [Ignores Cover] ability while targeting enemy units in range of one or more objective markers."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "War Dog Huntsman": [
  [
   "Soul-spoor Auspicator",
   "This unit’s ranged attacks have +6\" R."
  ],
  [
   "Huntsman",
   "Each time this model makes an attack that targets a Monster or Vehicle unit, you can re-roll the Wound roll."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Knight Despoiler": [
  [
   "Dread Dominion (Aura)",
   "While a friendly War Dog model is within 9\" of this model, improve that War Dog model's Leadership  and Objective Control characteristics by 1."
  ],
  [
   "Seething Hatred",
   "Each time this model is selected to shoot or fight, you can re-roll one Hit roll or you can re-roll one Wound roll when resolving those attacks."
  ],
  [
   "Damaged: 1-9 wounds remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Knight Desecrator": [
  [
   "Taskmaster (Aura)",
   "While a friendly War Dog model is within 9\" of this model, each time that War Dog model makes a ranged attack, re-roll a Hit roll of 1."
  ],
  [
   "Obsessive Ruthlessness",
   "This unit’s ranged attacks that target a MONSTER/VEHICLE unit can ignore modifiers to this unit’s: \n- BS. \n- Hit rolls and wound rolls."
  ],
  [
   "Damaged: 1-9 wounds remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Knight Rampager": [
  [
   "Frenzied Rampage (Aura)",
   "While a friendly War Dog model is within 9\" of this model, each time that War Dog model makes a melee attack, re-roll a Hit roll of 1."
  ],
  [
   "Bloodlust",
   "Each time this model makes a Charge move, until the end of the turn, its melee weapons have the [Devastating Wounds] ability."
  ],
  [
   "Damaged: 1-9 wounds remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Knight Abominant": [
  [
   "Vortex Terrors (Psychic)",
   "At the start of your Shooting phase, select one enemy unit within 24\" of and visible to this model. That enemy unit must take a Battle-shock test."
  ],
  [
   "Warp Storms (Psychic)",
   "At the end of your Movement phase, roll one D6 for each enemy unit within 9\" of one or more models with this ability: on a 3+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Damaged: 1-9 wounds remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Knight Tyrant": [
  [
   "Infernal Aegis (Aura)",
   "While a friendly War Dog model is within 6\" of this model, that War Dog model has the Benefit of Cover."
  ],
  [
   "Bastion of Corruption",
   "Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" of this model."
  ],
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Chaos Acastus Knight Asterius": [
  [
   "Sunderer of Fortresses",
   "Each time this model makes an attack that targets a Vehicle, improve the Strength and Damage characteristics of that attack by 1 (if that attack targets a Fortification, improve the Strength and Damage characteristics of that attack by 2 instead)."
  ],
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Chaos Acastus Knight Porphyrion": [
  [
   "Bastion of Firepower",
   "Each time this model Remains Stationary, until the end of the turn, ranged weapons equipped by this model have the [LETHAL HITS] ability."
  ],
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Chaos Cerastus Knight Lancer": [
  [
   "Shock Charge",
   "You can target this model with the Tank Shock Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this phase."
  ],
  [
   "Dark Fervour (Aura)",
   "While a friendly War Dog model is within 6\" of this model, ranged weapons equipped by that War Dog model have the [ASSAULT] ability."
  ],
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Chaos Cerastus Knight Castigator": [
  [
   "Storm of Bolts",
   "In your Shooting phase, after this model has shot, select one unit (excluding Monsters and Vehicles) hit by one or more of those attacks. Until the start of your next turn, while this model is on the battlefield, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Offerings for the Dark Gods (Aura)",
   "While a friendly War Dog model is within 6\" of this model, ranged weapons equipped by that War Dog model have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Chaos Cerastus Knight Acheron": [
  [
   "Searing Flames",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks made with an Acheron flame cannon. Until the end of the phase, that enemy unit cannot have the Benefit of Cover."
  ],
  [
   "Unrestrained Terror (Aura)",
   "While a friendly War Dog model is within 6\" of this model, it is affected by this ability. At the start of the Fight phase, each enemy unit within Engagement Range of one or more War Dog units affected by this ability must take a Battle-shock test."
  ],
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Chaos Cerastus Knight Atrapos": [
  [
   "Macro-extinction Protocols",
   "Each time this model makes an attack that targets a Monster or Vehicle unit, add 1 to the Hit roll. If that target is Titanic or Towering, add 1 to the Wound roll as well."
  ],
  [
   "Consumed with Hunger (Aura)",
   "While a friendly War Dog model is within 6\" of this model, each time that War Dog model makes an attack that targets a Titanic or Towering unit, you can re-roll the Hit roll."
  ],
  [
   "Damaged: 1-10 wounds remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Chaos Questoris Knight Magaera": [
  [
   "Repair Auto-simulacra",
   "At the end of your Command phase, this model regains up to D3 lost wounds."
  ],
  [
   "Damaged: 1-9 wounds remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Huntmaster (Aura)",
   "While a friendly War Dog model is within 6\" of this model, ranged weapons equipped by that War Dog model have the [ASSAULT] ability."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Chaos Questoris Knight Styrix": [
  [
   "Grav-pinned",
   "In your Shooting phase, after this model has shot, if an enemy Infantry unit was hit by one or more of those attacks made with a graviton crusher, until the end of your opponent’s next turn, that enemy unit is grav-pinned. While a unit is grav-pinned, subtract 2 from that unit’s Move characteristic and subtract 2 from Advance and Charge rolls made for that unit."
  ],
  [
   "Preysight (Aura)",
   "While a friendly War Dog model is within 6\" of this model, ranged weapons equipped by that War Dog model have the [IGNORES COVER] ability."
  ],
  [
   "Damaged: 1-9 wounds remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "War Dog Moirax": [
  [
   "Protection Protocols",
   "You can target this unit with the Heroic Intervention Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this phase."
  ],
  [
   "Damaged: 1-5 wounds remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ],
 "Knight Ruinator": [
  [
   "Methodical Destruction",
   "At the start of the first battle round, select one unit from your opponent's army to be this model's victim. Each time this model makes an attack that targets its victim, you can re-roll the Wound roll. Each time this model's victim is destroyed, select one new enemy unit to be this model's victim."
  ],
  [
   "Close-range Killers (Aura)",
   "While a friendly War Dog model is within 9\" of this model, each time that War Dog model makes an attack that targets the closest enemy unit, improve the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Damaged: 1-9 wounds remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "*Invulnerable Save",
   "This model has a 5+ invulnerable save against ranged attacks."
  ],
  [
   "Harbingers of Dread",
   "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Bastions of Tyranny",1,"","Annihilate the Unworthy","Friendly KNIGHT TYRANT units’ attacks that target a battle-shocked unit have +1 to the hit roll.","",0,"","Priority Assets"],
  ["Helhunt Lance",2,"","Masters of the Pack","If a Titanic Chaos Knights unit from your army has an Aura ability that affects friendly War Dog units, while two or more friendly WAR DOG models are within range of that TITANIC CHAOS KNIGHTS unit’s Aura ability, that TITANIC CHAOS KNIGHTS unit is affected by that Aura ability as well. Example: Two friendly WAR DOG models are within 9\" of a Knight Desecrator when it is selected to shoot. As a result, the KNIGHT DESECRATOR’s Taskmaster ability also affects itself, even though it does not have the WAR DOG keyword, so each time that KNIGHT DESECRATOR makes a ranged attack, Hit rolls of 1 are re-rolled.","",0,"","Disruption"],
  ["Houndpack Lance",2,"","Marked Prey","At the start of your Command phase, select one unit from your opponent’s army. Until the start of your next Command phase, each time a War Dog model from your army makes an attack that targets that enemy unit, if that unit is visible to the attacking model, that attack has the [SUSTAINED HITS 1] ability. KEYWORDS While using the Houndpack Lance Detachment, the following rules apply: ▪ Your army must include three or more WAR DOG units. ▪ WAR DOG units from your army have the BATTLELINE keyword. ▪ When mustering your army, select three WAR DOG units from your army. Until the end of the battle, those units have the CHARACTER keyword.* *Designer’s Note: This means that the selected units can be given Enhancements and one of them can be selected as your WARLORD.","",0,"","Reconnaissance"],
  ["Hunting Warpack",1,"","Scenting Fear","(Once per battle round, per army) In your Shooting phase, you can select one visible enemy unit within 12\" of a friendly WAR DOG unit. That enemy unit has +6\" detection range. This detachment has the WAR DOGS tag and cannot be taken with another WAR DOGS detachment.","",0,"","Reconnaissance"],
  ["Iconoclast Fiefdom",1,"","Wretched Thralls","▪ You can include DAMNED units in your army (see Codex: Chaos Space Marines). The combined points cost of such units cannot exceed 500 points. ▪ Friendly DAMNED units can re-roll leadership rolls.","",0,"","Take and Hold"],
  ["Infernal Lance",3,"","Malefic Surge","In your Command phase, one or more Chaos Knights units from your army can make a Malefic Surge. Each one that does must first take a Leadership test; if that test is failed, that unit suffers D3 mortal wounds. Then, until the start of your next Command phase, that unit is Empowered. While a unit is Empowered it can use one of the Malefic Surge abilities below. Once that unit has used a Malefic Surge ability, it is no longer Empowered. ▪ Unholy Hunger: When a model in this unit makes a Normal, Advance or Fall Back move, until the end of the phase, add 3\" to its Move characteristic. ▪ Diabolic Power: When this unit is selected to shoot or fight, select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until the end of the phase, weapons equipped by models in this unit have the selected ability. ▪ Unnatural Fortitude: When this unit is selected as the target of an attack, select one of the following to apply until the end of the phase: ▪ Models in this unit have a 5+ invulnerable save. ▪ Models in this unit have the Feel No Pain 6+ ability. Designer’s Note: We recommend placing a token next to Chaos Knights models that are Empowered, removing it once they have used a Malefic Surge ability, and removing all unused tokens at the start of your Command phase.","",0,"","Priority Assets"],
  ["Lords of Dread",2,"","Tyrannical Court","Improve the Objective Control characteristic of Chaos Knights Character models from your army by 2. In addition, once per battle round, if your WARLORD is on the battlefield, you can use the Claimed for the Dark Gods Stratagem for 0CP.","",0,"","Take and Hold"],
  ["Traitoris Lance",2,"","Paragons of Terror","At the start of the first battle round, after selecting one or more Dread abilities to be active for your army, you can select one additional Dread ability to be active for your army (this additional Dread ability cannot be randomly selected).","",0,"","Purge the Foe"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Hate-filled Dominion",20,"Bastions of Tyranny","This unit can re-roll rolls to determine the A of a weapon.",null],
  ["Pterrorshade Rookery",20,"Bastions of Tyranny","When this unit is selected to shoot, select one enemy unit within 24\" of this unit. That enemy unit has +6\" detection range until this unit has shot.",null],
  ["Aspect of the Beast",30,"Helhunt Lance","At the start of your Command phase, select one Dread ability to be active for the bearer until the start of your next Command phase, in addition to the Dread abilities active for your army.",null],
  ["Hunter’s Helm",15,"Helhunt Lance","You can re-roll Advance and Charge rolls made for the bearer’s unit.",null],
  ["Octagram of Conjuration",40,"Helhunt Lance","Knight Abominant model only. The bearer has the following ability: Octagram of Conjuration (Aura): While a friendly War Dog model is within 9\" of this model, after that WAR DOG model has shot, you can select one enemy unit hit by one or more of those attacks. That enemy unit must take a Battle-shock test.",null],
  ["Throne Tyrannicus",25,"Helhunt Lance","In your Command phase, select one other Chaos Knights Character model within 9” of the bearer. If the bearer has one or more Aura abilities that affect friendly War Dog units, until the start of your next Command phase, the selected Chaos Knights Character model is affected by those Aura abilities as well.",null],
  ["Final Howl",20,"Houndpack Lance","",null],
  ["Loping Predator",10,"Houndpack Lance","The bearer's ranged weapons have the [Assault] ability.",null],
  ["Panoply of the Cursed Knights",15,"Houndpack Lance","Each time an attack targets the bearer, worsen the Armour Penetration characteristic of that attack by 1.",null],
  ["Preyslayer’s Mantle",15,"Houndpack Lance","The bearer has the Super-Heavy Walker ability.",null],
  ["Snarling Rivalry (Upgrade)",10,"Hunting Warpack","EXECUTIONER unit only. This unit’s ranged attacks have [IGNORES COVER].",null],
  ["Soul-spoor Auspicator (Upgrade)",15,"Hunting Warpack","HUNTSMAN unit only. This unit’s ranged attacks have +6\" R.",null],
  ["Cruel Lashmaster (Aura)",25,"Iconoclast Fiefdom","While a friendly DAMNED unit is within 6\" of this model, when that unit is selected to make a normal/advance/fall-back move that unit has +2\" M until the end of the phase.",null],
  ["Iconoclast Idol (Aura)",20,"Iconoclast Fiefdom","While a friendly DAMNED unit is within 6\" of this model, when you target that unit with the Heroic Intervention stratagem, that use is -1 CP.",null],
  ["Bestial Aspect",30,"Infernal Lance","The bearer's ranged weapons have the [Assault] ability. While the bearer is using the Unholy Hunger ability, it can ignore any or all modifiers to its Move characteristic and/or to Advance rolls made for its unit.",null],
  ["Blasphemous Engine",35,"Infernal Lance","Add 2 to the bearer's Wounds characteristic. Each time the bearer's unit makes a Malefic Surge, you can re-roll the Leadership test taken to see if it suffers any mortal wounds.",null],
  ["Fleshmetal Fusion",35,"Infernal Lance","Add 1 to the bearer's Toughness characteristic. While the bearer is using the Unnatural Fortitude ability, each time an attack with a Damage characteristic of 1 is allocated to the bearer, add 1 to any armour saving throw made against that attack.",null],
  ["Knight Diabolus",25,"Infernal Lance","Improve the Weapon Skill characteristic of the bearer's melee weapons by 1. While the bearer is using the Diabolic Power ability, its melee weapons have the [Lance] ability.",null],
  ["Blade of Celerity",35,"Lords of Dread","The bearer's ranged weapons have the [Assault] ability. In addition, once per battle, in the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, models in the bearer's unit have the Fights First ability.",null],
  ["Blessing of the Dark Master",20,"Lords of Dread","The bearer has the Stealth ability. In addition, once per battle, after you make a saving throw for the bearer, you can change the Damage characteristic of that attack to 0.",null],
  ["Mirror of Fates",30,"Lords of Dread","Once per turn, when your opponent targets a unit from their army within 12” of this model with a stratagem, you can use this ability. If you do, increase the CP cost of that use of that stratagem by 1CP.",null],
  ["Putrid Carapace",30,"Lords of Dread","The bearer has a Save characteristic of 2+. In addition, once per battle, at the start of either player's Command phase, the bearer can use this Enhancement. If it does, the bearer regains up to D6 lost wounds.",null],
  ["Throne Mechanicum of Skulls",25,"Lords of Dread","You can re-roll Charge rolls made for the bearer's unit. In addition, once per battle, in your Charge phase, the bearer can use this Enhancement. If it does, until the end of the phase, the bearer's unit is eligible to declare a charge in a turn in which it Advanced.",null],
  ["Warp-borne Stalker",25,"Lords of Dread","The bearer has the Deep Strike ability. In addition, once per battle, at the end of your opponent's turn, if the bearer is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves.",null],
  ["Malevolent Heraldry",30,"Traitoris Lance","Each time you roll dice to randomly select which Dread abilities are active for your army, if the bearer is on the battlefield, you can re-roll one or both results rolled.",null],
  ["Nightmare’s Master",20,"Traitoris Lance","At the start of the Fight phase, each enemy unit within Engagement Range of the bearer must take a Battle-shock test.",null],
  ["Tyrant’s Shadow",25,"Traitoris Lance","At the end of your Command phase, select one objective marker the bearer is in range of and that you control. That objective marker remains under your control until your opponent's Level of Control over that objective marker is greater than yours at the end of a phase. In addition, until you lose control of that objective marker, it has the Deathly Terror ability as if it were a Chaos Knights model from your army.",null],
  ["Veil of Medrengard",35,"Traitoris Lance","The bearer has a 4+ invulnerable save against ranged attacks, and a 5+ invulnerable save against melee attacks.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Intimidating Reminder","Bastions of Tyranny","",1,"Your Shooting phase, when a friendly KNIGHT TYRANT unit has shot.","That KNIGHT TYRANT unit.","Select one enemy unit hit by those attacks. That enemy unit is suppressed until the start of your next Command phase: ▪ While a unit is suppressed, that unit’s attacks have -1 to hit rolls.",""],
  ["Pitiless Focus","Bastions of Tyranny","",1,"Your Movement phase, when a friendly KNIGHT TYRANT unit is selected to make a fall-back move.","That KNIGHT TYRANT unit.","That move does not prevent your unit from being eligible to shoot.",""],
  ["Rune-Cursed Stronghold","Bastions of Tyranny","",1,"Any phase, when a friendly KNIGHT TYRANT unit suffers a mortal wound.","That KNIGHT TYRANT unit.","Your unit has Feel No Pain 5+ against mortal wounds.",""],
  ["Beasthide Manifestation","Helhunt Lance","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One CHAOS KNIGHTS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Contemptuous Volleys","Helhunt Lance","Ruse Stratégique",1,"Your Movement phase, just after a CHAOS KNIGHTS unit from your army Falls Back.","That Chaos Knights unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Feral Arrogance","Helhunt Lance","Ruse Stratégique",1,"Any phase, just after a mortal wound is allocated to a Chaos Knights unit from your army.","That CHAOS KNIGHTS unit.","Until the end of the phase, models in your unit have the Feel No Pain 5+ ability against mortal wounds.",""],
  ["Flush the Quarry","Helhunt Lance","Tactique de Bataille",1,"Start of your Movement phase.","One Titanic Chaos Knights unit from your army and up to three friendly War Dog units within 6\" of that Titanic Chaos Knights unit.","Until the end of the phase, each time one of those War Dog units makes a Normal, Advance or Fall Back move, its models can move through models and terrain features. When doing so, they can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",""],
  ["Goaded Beast","Helhunt Lance","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One CHAOS KNIGHTS unit from your army that lost one or more wounds as a result of those attacks.","Your unit can make a surge move of up to D6\"",""],
  ["Merciless Fusillade","Helhunt Lance","Tactique de Bataille",1,"Start of your Shooting phase or the start of the Fight phase.","One Titanic Chaos Knights unit from your army, and up to two friendly War Dog units, that have not been selected to shoot or fight this phase.","Select one enemy unit that is an eligible target for each of those CHAOS KNIGHTS units. Until the end of the phase, each time one of those Chaos Knights units is selected to shoot or fight, if that enemy unit is an eligible target, you can only select that enemy unit as the target for all of those attacks and those attacks have the [SUSTAINED HITS 1] ability.",""],
  ["Animalistic Rage","Houndpack Lance","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after a WAR DOG unit from your army that has not been selected to attack this phase is destroyed.","That WAR DOG unit. You can use this Stratagem on that unit even though it was just destroyed.","Before resolving your unit’s Deadly Demise ability, it can either shoot or fight. When doing so, it must target only the enemy unit that just destroyed it, and can only do so if that enemy unit is an eligible target. After it has done so and after any Consolidation moves have been made, resolve your unit’s Deadly Demise ability as normal.",""],
  ["Cunning Hunter","Houndpack Lance","Ruse Stratégique",1,"Your Movement phase, just after a War Dog unit from your army Falls Back.","That WAR DOG unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Encircling Pack","Houndpack Lance","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One War Dog unit from your army that is wholly within 12\" of one or more battlefield edges and not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Harrying Hounds","Houndpack Lance","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One War Dog unit from your army that is within 8\" of that enemy unit.","Your unit can make a Normal move of up to 6\".",""],
  ["Hungry for Combat","Houndpack Lance","Tactique de Bataille",1,"Start of the Fight phase.","Two or more War Dog units from your army within Engagement Range of the same enemy unit.","Select one enemy unit within Engagement Range of those WAR DOG units. Until the end of the phase, models in those WAR DOG units can only target that enemy unit, but each time a model in one of those WAR DOG units makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Vox-Howl","Houndpack Lance","Tactique de Bataille",2,"Start of the Shooting phase or the start of the Fight phase.","One War Dog Character unit from your army.","Each enemy unit within 6\" of your unit must take a Battle-shock test. Each friendly WAR DOG unit that is within 6\" of your unit and is Battle-shocked must take a Leadership test; if that test is passed, that unit is no longer Battle-shocked.","You can only use this Stratagem once per turn."],
  ["Insensate Bloodthirst","Hunting Warpack","",1,"Fight phase, when an enemy unit targets a friendly WAR DOG unit.","That WAR DOG unit.","Your unit has Feel No Pain 5+",""],
  ["Leash of the Masters","Hunting Warpack","",1,"Your Shooting phase, when a friendly WAR DOG unit has shot.","That WAR DOG unit.","Those attacks do not prevent your unit from being eligible to start an action.",""],
  ["Stalking Focus","Hunting Warpack","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly WAR DOG unit within range of an objective.","That WAR DOG unit.","Ranged attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Avenge the Masters!","Iconoclast Fiefdom","",1,"Any phase, when a friendly CHAOS KNIGHTS unit is destroyed by an enemy unit.","That enemy unit.","That enemy unit is marked until the end of the battle. ▪ Friendly DAMNED units’ attacks that target a marked unit have [LETHAL HITS].",""],
  ["Coursing Thralls","Iconoclast Fiefdom","",1,"Start of your Shooting phase.","One friendly DAMNED unit.","Select one visible enemy unit within 12\" of your unit. That enemy unit is hunted: ▪ While a unit is hunted, that unit has +6\" detection range.",""],
  ["Dark Sacrifice","Iconoclast Fiefdom","",1,"Your Command phase.","One friendly DAMNED unit (excluding ACCURSED CULTISTS units) within 9\" of a friendly CHAOS KNIGHTS model.","Select one CHAOS KNIGHTS model within 9\" of your unit and roll D3+3: ▪ Your DAMNED unit suffers that number of mortal wounds. ▪ That CHAOS KNIGHTS model heals that number of wounds.",""],
  ["Corrupting Taint","Infernal Lance","Fait Épique",1,"Your Command phase, just after a Chaos Knights Character unit from your army makes a Malefic Surge.","That CHAOS KNIGHTS CHARACTER unit.","Select one objective marker your unit is within range of that you control. That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Diabolic Bulwark","Infernal Lance","Équipement",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Chaos Knights unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a 4+ invulnerable save.",""],
  ["Hellforged Construction","Infernal Lance","Tactique de Bataille",1,"Fight phase, just after an enemy unit has selected its targets.","One Chaos Knights unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Profane Symbiosis","Infernal Lance","Tactique de Bataille",1,"End of any phase.","One Chaos Knights unit from your army that is not Empowered.","Your unit makes a Malefic Surge.","You cannot select the same unit as the target of this Stratagem more than once per battle round."],
  ["Unleash Balefire","Infernal Lance","Équipement",1,"Your Shooting phase.","One Chaos Knights unit from your army that has not been selected to shoot this phase.","After your unit has shot, select one enemy unit hit by one or more of those attacks. That enemy unit must take a Battle-shock test; if the test is failed, until the end of your opponent’s next turn, it is aflame. While a unit is aflame, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it.",""],
  ["Warp Vision","Infernal Lance","Équipement",1,"Your Shooting phase.","One Chaos Knights unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability.",""],
  ["Claimed for the Dark Gods","Lords of Dread","Fait Épique",1,"Start of your Command phase.","One Chaos Knights Character unit from your army that is within range of one or more objective markers you control.","Select one of those objective markers. That objective marker remains under your control, with a Level of Control of 5 (unless it would otherwise be higher), until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Crushed Like Vermin","Lords of Dread","Fait Épique",1,"Your Movement phase, just after a Chaos Knights Character unit from your army ends a Normal move.","That CHAOS KNIGHTS CHARACTER unit.","Select one enemy unit (excluding MONSTERS and VEHICLES) that your unit moved over during that move and roll six D6: for each 4+, that enemy unit suffers 1 mortal wound. If one or more models are destroyed as a result of this Stratagem, that enemy unit must take a Battle-shock test.",""],
  ["Runes of Disdain","Lords of Dread","Fait Épique",2,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Chaos Knights Character unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.",""],
  ["Spiteful Demise","Lords of Dread","Fait Épique",1,"Any phase, just after a Chaos Knights Character unit from your army is destroyed.","That CHAOS KNIGHTS CHARACTER unit. You can use this Stratagem on that unit even though it was just destroyed.","When rolling to determine whether mortal wounds are inflicted by your unit’s Deadly Demise ability, that model’s Deadly Demise ability inflicts mortal wounds on a D6 roll of a 4+ instead of on a 6.",""],
  ["Titanic Duel","Lords of Dread","Fait Épique",1,"Your Shooting phase or the Fight phase.","One Chaos Knights Character unit from your army that has not been selected to shoot or fight this phase.","Select one enemy MONSTER or VEHICLE unit. Until the end of the phase, each time a model in your unit makes an attack that targets that enemy unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1. Each time a model in your unit makes an attack that targets that enemy unit, if that enemy unit is TITANIC, you can re-roll the Hit roll and you can re-roll the Wound roll instead.",""],
  ["Trophy Hunter","Lords of Dread","Fait Épique",1,"Fight phase, just before a Chaos Knights Character unit from your army consolidates.","That CHAOS KNIGHTS CHARACTER unit.","Until the end of the phase, each time your unit Consolidates, models in it can move an additional 3\" as long as your unit can end that move within Engagement Range of one or more enemy units.",""],
  ["A Long Leash","Traitoris Lance","Ruse Stratégique",1,"Your Command phase.","One Abhorrent unit from your army and up to two friendly War Dog units.","Until the start of your next Command phase, those WAR DOG units are treated as being within range of any Aura abilities your ABHORRENT unit has.",""],
  ["Conquerors Without Mercy","Traitoris Lance","Tactique de Bataille",1,"Fight phase.","One Chaos Knights model from your army that made a Charge move this turn and has not been selected to fight this phase.","Until the end of the phase, improve the Armour Penetration characteristic of melee weapons equipped by your model by 1. After your model has finished making its attacks this phase, if it destroyed one or more enemy units this phase, each enemy unit within 6\" of your model must take a Battle-shock test.",""],
  ["Disdain for the Weak","Traitoris Lance","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Chaos Knights unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 6+ ability, and the Feel No Pain 5+ ability against attacks made by Battle-shocked models.",""],
  ["Imperious Advance","Traitoris Lance","Fait Épique",1,"Your Movement phase or your Charge phase.","Up to two War Dog units from your army or one Titanic Chaos Knights unit from your army.","Until the end of the phase, each time a model in one of your units makes a Normal, Advance, Fall Back or Charge move, it can move through models and terrain features. When doing so, it can move within Engagement Range of such models but, unless it made a Charge move, cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed (the Super-heavy Walker ability does not apply while using this Stratagem).",""],
  ["Pterrorshades","Traitoris Lance","Équipement",1,"Any phase, just after an enemy unit fails a Battle-shock test.","One Chaos Knights unit from your army that is within 12\" of that enemy unit.","Roll six D6: for each 4+, that enemy unit suffers 1 mortal wound and one model in your unit regains up to 1 lost wound.","You can only use this Stratagem once per battle round."],
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
  "Chaos Acastus Knight Asterius",
  "Chaos Acastus Knight Porphyrion",
  "War Dog Brigand",
  "War Dog Executioner",
  "War Dog Huntsman",
  "War Dog Karnivore",
  "War Dog Moirax",
  "War Dog Stalker"
 ],
 "monster": [],
 "battleline": [],
 "epic": [],
 "infantry": [],
 "character": [
  "Chaos Cerastus Knight Acheron",
  "Chaos Cerastus Knight Atrapos",
  "Chaos Cerastus Knight Castigator",
  "Chaos Cerastus Knight Lancer",
  "Chaos Questoris Knight Magaera",
  "Chaos Questoris Knight Styrix",
  "Knight Abominant",
  "Knight Desecrator",
  "Knight Despoiler",
  "Knight Rampager",
  "Knight Ruinator",
  "Knight Tyrant"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "War Dog Executioner": "100",
 "War Dog Stalker": "100",
 "War Dog Karnivore": "100",
 "War Dog Brigand": "100",
 "War Dog Huntsman": "100",
 "Knight Despoiler": "170x109",
 "Knight Desecrator": "170x109",
 "Knight Rampager": "170x109",
 "Knight Abominant": "170x109",
 "Knight Tyrant": "170x109",
 "Chaos Acastus Knight Asterius": "coque",
 "Chaos Acastus Knight Porphyrion": "coque",
 "Chaos Cerastus Knight Lancer": "170x109",
 "Chaos Cerastus Knight Castigator": "170x109",
 "Chaos Cerastus Knight Acheron": "170x109",
 "Chaos Cerastus Knight Atrapos": "170x109",
 "Chaos Questoris Knight Magaera": "170x109",
 "Chaos Questoris Knight Styrix": "170x109",
 "War Dog Moirax": "100",
 "Knight Ruinator": "170x109"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "War Dog Executioner": 5,
 "War Dog Stalker": 5,
 "War Dog Karnivore": 5,
 "War Dog Brigand": 5,
 "War Dog Huntsman": 5,
 "Knight Despoiler": 9,
 "Knight Desecrator": 9,
 "Knight Rampager": 9,
 "Knight Abominant": 9,
 "Knight Tyrant": 10,
 "Chaos Acastus Knight Asterius": 10,
 "Chaos Acastus Knight Porphyrion": 10,
 "Chaos Cerastus Knight Lancer": 10,
 "Chaos Cerastus Knight Castigator": 10,
 "Chaos Cerastus Knight Acheron": 10,
 "Chaos Cerastus Knight Atrapos": 10,
 "Chaos Questoris Knight Magaera": 9,
 "Chaos Questoris Knight Styrix": 9,
 "War Dog Moirax": 5,
 "Knight Ruinator": 9
};

const TRANSPORTS = {};
const FACTION = [
 [
  "Harbingers of Dread",
  "If your Army Faction is Chaos Knights, each model from your army with this ability gains Dread abilities, depending which are active for your army. The Deathly Terror ability is active for your army from the start of the battle. In addition, at the start of the first, third and fifth battle rounds, you can either select one of the other Dread abilities or randomly select two Dread abilities to apply by rolling two D6 and applying the results rolled, from those numbered 1-6 below.\n\nAny Dread abilities that have been selected are active until the end of the battle. You cannot select the same Dread ability more than once, and any duplicated Dread abilities (as a result of randomly selecting them) have no additional effect.\n\n\nN/A - Deathly Terror (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1.\n\n1 - Despair (Aura)\nWhile an enemy unit is within 9\" of this model, worsen the Leadership characteristic of models in that unit by 1. This is cumulative with the Deathly Terror ability (see above).\n\n2 - Doom\nEach time this model makes an attack, if the target is Battle-shocked, add 1 to the Wound roll.\n\n3 - Darkness\nThis model has Stealth.\n\n4 - Dismay (Aura)\nIn the Battle-shock step of your opponent's Command phase, for each enemy unit that is below its Starting Strength and within 9\" of this model, that enemy unit must take a Battle-shock test.\n\n5 - Delirium (Aura)\nWhile an enemy unit that is Below Half-strength is within 9\" of this model, each time that model fails a Battle-shock test, it suffers D3 mortal wounds.\n\n6 - Dominion\nAdd 3\" to the range of this model's Aura abilities."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/chevalierschaos.json —
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
  cle : "chevalierschaos",
  nom : "Chevaliers du Chaos",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
