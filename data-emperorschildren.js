/* ============================================================
   Données Emperor's Children — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py emperorschildren

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
     23 fiches sur 23 en ont un. Les autres — des Legends, que le
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
  ["Chaos Land Raider",10,12,2,0,16,[1],[[1, {"1": 210}], [3, {"1": 230}]],0,"",0,"",5,"6+"],
  ["Chaos Rhino",12,9,3,0,10,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Chaos Spawn",10,5,4,0,4,[2],{"2": 70},0,"",0,"",1,"7+"],
  ["Chaos Terminators",6,6,2,4,3,[5],{"5": 155},0,"",0,"",1,"6+"],
  ["Daemon Prince of Slaanesh",10,10,2,4,10,[1],[[1, {"1": 165}], [2, {"1": 180}]],0,"",0,"",3,"6+"],
  ["Daemon Prince of Slaanesh with Wings",14,9,2,4,10,[1],[[1, {"1": 205}], [2, {"1": 225}]],0,"",0,"",3,"6+"],
  ["Daemonettes",9,3,7,5,1,[10],{"10": 100},0,"",0,"",1,"7+"],
  ["Defiler",12,11,3,5,18,[1],[[1, {"1": 300}], [2, {"1": 350}]],0,"",0,"",5,"6+"],
  ["Fiends",12,5,7,5,4,[3, 6],{"3": 90, "6": 190},0,"",0,"",2,"7+"],
  ["Flawless Blades",8,5,3,5,3,[3, 6],{"3": 95, "6": 190},0,"",0,"",1,"6+"],
  ["Fulgrim",16,11,2,4,16,[1],{"1": 340},0,"",0,"",6,"5+"],
  ["Heldrake",12,10,3,5,14,[1],{"1": 175},0,"",0,"",0,"7+"],
  ["Infractors",7,5,3,0,2,[5, 10],{"5": 95, "10": 175},0,"",0,"",2,"6+"],
  ["Keeper of Secrets",14,10,5,4,18,[1],[[1, {"1": 265}], [3, {"1": 280}]],0,"",0,"",5,"6+"],
  ["Lord Exultant",7,5,3,4,5,[1],[[1, {"1": 95}], [3, {"1": 105}]],0,"Meneur",0,"",1,"6+"],
  ["Lord Kakophonist",6,6,2,4,6,[1],{"1": 70},0,"Meneur",0,"",1,"6+"],
  ["Lucius the Eternal",8,6,2,4,6,[1],{"1": 130},0,"Meneur",0,"",1,"6+"],
  ["Maulerfiend",10,10,3,5,12,[1],[[1, {"1": 120}], [3, {"1": 130}]],0,"",0,"",3,"6+"],
  ["Noise Marines",6,5,3,0,3,[6],[[1, {"6": 160}], [3, {"6": 175}]],0,"",0,"",1,"6+"],
  ["Seekers",14,4,7,5,2,[5, 10],{"5": 85, "10": 155},0,"",0,"",1,"7+"],
  ["Shalaxi Helbane",14,10,3,4,20,[1],{"1": 315},0,"",0,"",5,"6+"],
  ["Sorcerer",7,5,3,0,4,[1],{"1": 55},0,"Meneur",0,"",1,"6+"],
  ["Tormentors",7,5,3,0,2,[5, 10],{"5": 85, "10": 170},0,"",0,"",2,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Chaos Land Raider","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Land Raider","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Land Raider","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Land Raider","Soulshatter lascannon","T","2",3,12,3,"D6+1","","48\""],
  ["Chaos Land Raider","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Chaos Land Raider","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Chaos Rhino","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Rhino","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Rhino","Havoc launcher","T","D6",3,5,0,"1","blast","48\""],
  ["Chaos Rhino","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Chaos Spawn","Hideous Mutations","C","D6+2",4,5,1,"2","","càc"],
  ["Chaos Terminators","Combi-bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Chaos Terminators","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Chaos Terminators","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Chaos Terminators","Reaper autocannon","T","4",3,7,1,"1","dev sust:1","36\""],
  ["Chaos Terminators","Accursed weapon","C","4",3,5,2,"1","","càc"],
  ["Chaos Terminators","Chainfist","C","3",4,8,2,"2","anti:3:veh","càc"],
  ["Chaos Terminators","Paired accursed weapons","C","5",3,5,2,"1","twin","càc"],
  ["Chaos Terminators","Power fist","C","3",3,8,2,"2","","càc"],
  ["Daemon Prince of Slaanesh","Infernal cannon","T","3",2,5,1,"2","","24\""],
  ["Daemon Prince of Slaanesh","➤ Hellforged weapons - strike","C","6",2,8,2,"3","","càc"],
  ["Daemon Prince of Slaanesh","➤ Hellforged weapons - sweep","C","14",2,6,0,"1","","càc"],
  ["Daemon Prince of Slaanesh with Wings","Infernal cannon","T","3",2,5,1,"2","","24\""],
  ["Daemon Prince of Slaanesh with Wings","➤ Hellforged weapons - strike","C","6",2,8,2,"3","","càc"],
  ["Daemon Prince of Slaanesh with Wings","➤ Hellforged weapons - sweep","C","14",2,6,0,"1","","càc"],
  ["Daemonettes","Slashing claws","C","3",3,4,1,"1","dev","càc"],
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
  ["Defiler","Shearing claws - strike","C","5",3,16,3,"D6+1","precision","càc"],
  ["Defiler","Shearing claws - sweep","C","10",3,6,2,"1","","càc"],
  ["Fiends","Barbed tail and dissecting claws","C","5",3,5,2,"2","dev","càc"],
  ["Flawless Blades","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Flawless Blades","Blissblade","C","4",2,6,3,"2","","càc"],
  ["Fulgrim","Malefic lash","T","6",2,8,2,"2","sust:1","12\""],
  ["Fulgrim","Serpentine tail","C","6",2,6,1,"1","extra","càc"],
  ["Fulgrim","➤ Daemonic blades - strike","C","6",2,14,3,"D6+1","sust:1","càc"],
  ["Fulgrim","➤ Daemonic blades - sweep","C","12",2,8,2,"2","sust:1","càc"],
  ["Heldrake","Baleflamer","T","D6+3",0,6,1,"2","ignorescover torrent","12\""],
  ["Heldrake","Hades autocannon","T","6",3,8,1,"2","","36\""],
  ["Heldrake","Heldrake claws","C","5",3,7,1,"2","anti:2:vol dev","càc"],
  ["Infractors","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Infractors","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Infractors","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Infractors","Duelling sabre","C","4",3,5,1,"1","precision","càc"],
  ["Infractors","Power sword","C","4",3,5,2,"1","","càc"],
  ["Infractors","Rapture lash","C","6",3,4,1,"1","","càc"],
  ["Keeper of Secrets","Living whip","T","6",2,6,1,"2","assault","12\""],
  ["Keeper of Secrets","➤ Phantasmagoria - focused witchfire","T","9",2,6,2,"1","dev hazardous psychic","18\""],
  ["Keeper of Secrets","➤ Phantasmagoria - witchfire","T","6",2,6,2,"1","dev psychic","18\""],
  ["Keeper of Secrets","Ritual knife","C","3",2,6,2,"2","extra","càc"],
  ["Keeper of Secrets","Snapping claws","C","4",2,6,2,"3","dev extra","càc"],
  ["Keeper of Secrets","Witstealer sword","C","6",2,8,2,"3","","càc"],
  ["Lord Exultant","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Lord Exultant","Screamer pistol","T","3",2,5,1,"2","ignorescover pistol","12\""],
  ["Lord Exultant","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Lord Exultant","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Lord Exultant","Close combat weapon","C","6",2,5,0,"1","","càc"],
  ["Lord Exultant","Master-crafted power sword","C","5",2,5,2,"2","precision","càc"],
  ["Lord Exultant","Phoenix power spear","C","5",2,7,2,"2","lance","càc"],
  ["Lord Exultant","Power fist","C","3",3,8,2,"2","","càc"],
  ["Lord Exultant","Rapture lash","C","4",2,4,1,"1","extra","càc"],
  ["Lord Kakophonist","Screamer pistol","T","3",2,5,1,"2","ignorescover pistol","12\""],
  ["Lord Kakophonist","Close combat weapon","C","6",2,5,0,"1","","càc"],
  ["Lord Kakophonist","Power sword","C","6",2,5,2,"1","","càc"],
  ["Lucius the Eternal","Blade of the Laer","C","6",2,8,3,"3","precision","càc"],
  ["Lucius the Eternal","Lash of Torment","C","10",2,4,1,"1","sust:1","càc"],
  ["Maulerfiend","Magma cutter","T","2",3,9,4,"D6","melta:2","6\""],
  ["Maulerfiend","Lasher tendrils","C","6",3,7,1,"1","extra","càc"],
  ["Maulerfiend","Maulerfiend fists","C","6",3,14,2,"D6+1","","càc"],
  ["Noise Marines","Screamer pistol","T","3",3,5,1,"2","ignorescover pistol","12\""],
  ["Noise Marines","Sonic blaster","T","3",3,5,1,"2","ignorescover","18\""],
  ["Noise Marines","➤ Blastmaster - single frequency","T","3",3,10,2,"3","ignorescover","18\""],
  ["Noise Marines","➤ Blastmaster - varied frequency","T","6",3,6,2,"1","ignorescover","18\""],
  ["Noise Marines","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Noise Marines","Power sword","C","4",3,5,2,"1","","càc"],
  ["Seekers","Lashing tongues","C","2",4,4,0,"1","extra lethal","càc"],
  ["Seekers","Slashing claws","C","3",3,4,1,"1","dev","càc"],
  ["Shalaxi Helbane","Lash of Slaanesh","T","6",2,6,1,"2","assault","12\""],
  ["Shalaxi Helbane","➤ Pavane of Slaanesh - focused witchfire","T","D6",2,9,2,"D3","hazardous dev psychic sust:3","18\""],
  ["Shalaxi Helbane","➤ Pavane of Slaanesh - witchfire","T","D6",2,9,1,"D3","dev psychic","18\""],
  ["Shalaxi Helbane","Snapping claws","C","4",2,6,2,"3","dev extra","càc"],
  ["Shalaxi Helbane","Soulpiercer","C","6",2,12,3,"D6+2","precision","càc"],
  ["Sorcerer","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Sorcerer","➤ Agonising Energies - focused witchfire","T","D6",3,6,2,"D3","dev hazardous psychic","18\""],
  ["Sorcerer","➤ Agonising Energies - witchfire","T","D6",3,5,1,"D3","psychic","18\""],
  ["Sorcerer","Force weapon","C","4",3,6,2,"D3","psychic","càc"],
  ["Tormentors","Bolt pistol","T","1",3,5,1,"1","pistol","12\""],
  ["Tormentors","Boltgun","T","2",3,5,1,"1","precision","24\""],
  ["Tormentors","Meltagun","T","1",3,9,4,"D6","melta:2 precision","12\""],
  ["Tormentors","➤ Plasma gun - standard","T","1",3,7,2,"1","precision rf:1","24\""],
  ["Tormentors","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous precision rf:1","24\""],
  ["Tormentors","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Tormentors","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Tormentors","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Tormentors","Power sword","C","4",3,5,2,"1","","càc"],
  ["Tormentors","Rapture lash","C","6",3,4,1,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Chaos Land Raider","Véhicule"],
  ["Chaos Rhino","Véhicule"],
  ["Chaos Spawn","Bête"],
  ["Chaos Terminators","Infanterie"],
  ["Daemon Prince of Slaanesh","Monstre"],
  ["Daemon Prince of Slaanesh with Wings","Monstre"],
  ["Daemonettes","Battleline"],
  ["Defiler","Véhicule"],
  ["Fiends","Bête"],
  ["Flawless Blades","Infanterie"],
  ["Fulgrim","Epic Hero"],
  ["Heldrake","Véhicule"],
  ["Infractors","Battleline"],
  ["Keeper of Secrets","Monstre"],
  ["Lord Exultant","Personnage"],
  ["Lord Kakophonist","Personnage"],
  ["Lucius the Eternal","Epic Hero"],
  ["Maulerfiend","Véhicule"],
  ["Noise Marines","Infanterie"],
  ["Seekers","Monté"],
  ["Shalaxi Helbane","Epic Hero"],
  ["Sorcerer","Personnage"],
  ["Tormentors","Battleline"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Lord Exultant": [
  "Infractors",
  "Tormentors"
 ],
 "Lord Kakophonist": [
  "Chaos Terminators",
  "Noise Marines"
 ],
 "Lucius the Eternal": [
  "Flawless Blades"
 ],
 "Sorcerer": [
  "Infractors",
  "Noise Marines",
  "Tormentors"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Lucius the Eternal": [
  [
   "Leader",
   "This model can be attached to the following units: FLAWLESS BLADES"
  ],
  [
   "Duellist’s Hubris",
   "At the start of the Fight phase, if this model is not leading a unit, until the end of the phase, it has the Fights First ability."
  ],
  [
   "A Challenge Worthy of Skill",
   "Each time this model makes an attack that targets a Character, Monster or Walker unit, you can re-roll the Hit roll and re-roll the Wound roll."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Fulgrim": [
  [
   "Beguiling Form",
   "Each time a model makes an attack that targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "Daemonic Speed",
   "This model has the Fights First ability."
  ],
  [
   "Enthralling Hypnosis (Aura)",
   "While an enemy unit is within 6\" of this model, each time that unit is selected to Fall Back, it must take a Leadership test. If that test is failed, that unit must Remain Stationary this phase instead."
  ],
  [
   "Daemonic Poisons",
   "In your Shooting phase and the Fight phase, after this model has finished making its attacks, select one enemy unit hit by one or more of those attacks. Until the end of the battle, that enemy unit is poisoned. At the start of each player's Command phase, roll one D6 for each poisoned enemy unit on the battlefield: on a 4+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Daemon Prince of Slaanesh",
   "At the start of your opponent's Command phase, select one of the abilities in the Daemon Prince of Slaanesh section. Until the start of your opponent's next Command phase, this model has that ability."
  ],
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Supreme Commander",
   "If this model is in your army, it must be your Warlord."
  ],
  [
   "Serpentine",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move over sections of terrain features that are 4\" or less in height."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Lord Exultant": [
  [
   "Perfectionists",
   "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Euphoric Strikes",
   "Once per battle, at the start of the Fight phase, this model can use this ability. If it does so, until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by this model and improve the Armour Penetration characteristic of those weapons by 1."
  ],
  [
   "Lord of the Host",
   "If this model is attached to an Emperor's Children Battleline unit during the Declare Battle Formations step, this model has the Infiltrators and Scouts 6\" ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units: INFRACTORS, TORMENTORS"
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Lord Kakophonist": [
  [
   "Leader",
   "This model can be attached to the following units: CHAOS TERMINATORS, NOISE MARINES"
  ],
  [
   "Obsessive Annunciation",
   "While this model is leading a unit, ranged weapons equipped by that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Doom Siren",
   "In your Shooting phase, after this model's unit has shot, select one enemy Infantry unit hit by one or more of those attacks and roll three D6: for each 4+, that enemy unit suffers 1 mortal wound. If an enemy suffers one or more mortal wounds as a result of this ability, it must take a Battle-shock test."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Sorcerer": [
  [
   "Leader",
   "This model can be attached to the following units: INFRACTORS, NOISE MARINES, TORMENTORS"
  ],
  [
   "Warped Interference (Psychic)",
   "While this model is leading a unit, each time a ranged attack targets that unit, models in it have the Benefit of Cover against that attack."
  ],
  [
   "Wracking Agonies (Psychic)",
   "In your Shooting phase, after this model has shot, select one INFANTRY unit hit by one or more of those attacks made with its Agonising Energies. Until the start of your next turn, that unit is wracked with agonies. While a unit is wracked with agonies, subtract 2\" from its Move characteristic and subtract 2 from charge rolls made for it."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Daemon Prince of Slaanesh": [
  [
   "Lord of Excess",
   "While this model is within 3\" of one or more friendly Slaanesh Infantry, this model has the Lone Operative ability."
  ],
  [
   "Excessive Vigour (Aura)",
   "While a friendly Slaanesh unit is within 6\" of this model, if that unit made a Charge move this turn, improve the Armour Penetration characteristic of melee weapons equipped by that unit by 1."
  ],
  [
   "Ecstatic Death",
   "If this model is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 2+, do not remove it from play. This model can fight after the attacking unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Daemon Prince of Slaanesh with Wings": [
  [
   "Daemonic Destruction",
   "Each time this model ends a Charge move, select one enemy unit within Engagement Range of this model and roll one D6 for each of this model's remaining wounds: for each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds)."
  ],
  [
   "Stimulated by Pain",
   "Each time an attack is allocated to this model, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Tormentors": [
  [
   "Objective Defiled",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent's Level of Control over that objective marker is greater than yours at the end of a phase."
  ],
  [
   "Icon of Excess",
   "At the end of your Shooting phase or the Fight phase, if the bearer's unit destroyed one or more enemy units this phase, the bearer's unit takes a Leadership test. If that test is passed, you gain 1CP."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Infractors": [
  [
   "Excessive Assault",
   "Each time a model in this unit targets an enemy unit with a melee attack, re-roll a Wound roll of 1. If that enemy unit is within range of an objective marker, you can re-roll the Wound roll instead."
  ],
  [
   "Icon of Excess",
   "At the end of your Shooting phase or the Fight phase, if the bearer's unit destroyed one or more enemy units this phase, the bearer's unit takes a Leadership test. If that test is passed, you gain 1CP."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Flawless Blades": [
  [
   "Daemonic Patrons",
   "Each time this unit is selected to fight, it can call upon daemonic patrons. If it does, until the end of the phase, each time a model in this unit makes an attack. an unmodified Wound roll of 3+ scores a Critical Wound. At the end of the Fight phase, if this unit called upon daemonic patrons this phase and no enemy models were destroyed by attacks made by models in this unit this phase, one model in this unit is destroyed."
  ],
  [
   "Eager Patrons",
   "This unit has +2\" M."
  ],
  [
   "Beguiling Grotesquerie",
   "Enemy units cannot target this unit with snap shooting attacks."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Chaos Terminators": [
  [
   "Lethal Obsession",
   "In your Shooting phase, after this unit has shot, you can use this ability. If you do, select one enemy unit hit by those ranged attacks. Until the end of the turn, when this unit declares a charge: \n- This unit can re-roll that charge roll. \n- This unit must end that charge move engaged with that enemy unit."
  ],
  [
   "Frenzied Ferocity",
   "This unit's attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Chaos Spawn": [
  [
   "Scuttling Horrors",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8” of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to 6”."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
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
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Noise Marines": [
  [
   "Terrifying Crescendo",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the start of your next Shooting phase, each time a Battle-shock or Leadership test is taken for that enemy unit, subtract 1 from that test."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Heldrake": [
  [
   "Airborne Predator",
   "Each time this model ends a Normal move, you can select one enemy unit that it moved over during that move and roll two D6, adding 1 to each result if that enemy unit can FLY: for each 4+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Maulerfiend": [
  [
   "Glutton for Punishment",
   "Each time this model makes an attack, if it is below its Starting Strength, add 1 to the Hit roll. If this model is also Below Half-Strength, add 1 to the Wound roll as well."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Chaos Rhino": [
  [
   "Assault Vehicle",
   "Units can disembark from this Vehicle after it has Advanced. Units that do so count as having made a Normal move that phase, and cannot declare a charge in the same turn, but can otherwise act normally."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ],
 "Shalaxi Helbane": [
  [
   "No Prey Can Evade",
   "You can re-roll Advance and Charge rolls made for this model."
  ],
  [
   "Monarch of the Hunt",
   "At the start of the first battle round, select one enemy unit to be this model's quarry. Each time this model makes a melee attack that targets its quarry, you can re-roll the Hit roll and you can re-roll the Wound roll. Each time this model's quarry is destroyed, select one new enemy unit to be this model's quarry."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Keeper of Secrets": [
  [
   "Daemon Lord of Slaanesh (Aura)",
   "While a friendly Legions of Excess unit is within 6\" of this model, improve the Armour Penetration of melee weapons in that unit by 1."
  ],
  [
   "Mesmerising Form",
   "Each time an attack targets this model, subtract 1 from the Hit roll."
  ],
  [
   "Shining aegis",
   "The bearer has a Save characteristic of 3+."
  ]
 ],
 "Daemonettes": [
  [
   "Horrifying Beauty",
   "At the start of the Fight phase, each enemy unit in Engagement Range of one or more units from your army with this ability must take a Battle-shock test, subtracting 1 from that test if that enemy unit is Below Half-strength."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer's unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer's unit."
  ]
 ],
 "Fiends": [
  [
   "Soporific Musk",
   "Each time an enemy unit (excluding Monsters and Vehicles) within Engagement Range of one or more units from your army with this ability Falls Back, models in that unit must take Desperate Escape tests. When doing so, if that enemy unit is also Battle-shocked, subtract 1 from each of those Desperate Escape tests."
  ]
 ],
 "Seekers": [
  [
   "Unholy Speed",
   "You can re-roll Advance and Charge rolls made for this unit."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer's unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer's unit."
  ]
 ],
 "Defiler": [
  [
   "Scuttling Walker",
   "Each time this unit makes a Normal, Advance or Fall Back move, it can move through models (excluding Titanic models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed."
  ],
  [
   "Revel in Desecration",
   "Each time this model makes an attack that targets an enemy unit that is not below Half-strength, add 1 to the Hit roll."
  ],
  [
   "Thrill Seekers",
   "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Carnival of Excess",3,"","Daemonic Empowerment","▪ While an Emperor’s Children unit from your army is within 6\" of one or more friendly Legions of Excess units, it is Empowered. ▪ While a LEGIONS OF EXCESS unit from your army is within 6\" of one or more friendly EMPEROR’S CHILDREN units, it is Empowered. While a unit from your army is Empowered, weapons equipped by models in that unit have the [sustained hits 1] ability. If such a weapon already has that ability, each time an attack is made with that weapon, an unmodified Hit roll of 5+ scores a Critical Hit. LEGIONS OF EXCESS You can include Legions of Excess units in your army, even though they do not have the EMPEROR’S CHILDREN Faction keyword. The combined points cost of such units you can include in your army is: ▪ Incursion: Up to 500 pts ▪ Strike Force: Up to 1000 pts ▪ Onslaught: Up to 1500 pts No LEGIONS OF EXCESS models from your army can be your WARLORD.","",0,"","Disruption"],
  ["Coterie of the Conceited",3,"","Pledges to the Dark Prince","At the start of the battle round, if your WARLORD is on the battlefield, you must pledge a number to Slaanesh representing how many enemy units will be destroyed this battle round. At the end of the battle round, if the number of enemy units destroyed this battle round is greater than or equal to your pledge, you gain a number of Pact points equal to your pledge. Otherwise, you do not gain any Pact points this battle round and your WARLORD model suffers D3 mortal wounds. Emperor’s Children units from your army gain a bonus depending on how many Pact points you have gained during the battle, as shown below (these are all cumulative). PACT POINTSBONUS1+Each time a model in this unit makes an attack, re-roll a Hit roll of 1.3+Each time a model in this unit makes an attack, re-roll a Wound roll of 1.5+Melee weapons equipped by models in this unit have the [LETHAL HITS] and [SUSTAINED HITS 1] abilities.7+Each time a model in this unit makes an attack, a Critical Hit is scored on an unmodified Hit roll of 5+.","",0,"","Priority Assets"],
  ["Court of the Phoenician",2,"","Sensational Performance / Master of the Pageant","Emperor’s Children units from your army have the following ability: Sensational Performance: Each time this unit is selected to fight, if this unit made a Charge move this turn, it can use this ability. If it does, until the end of the phase: ▪ This unit cannot target a unit it was within Engagement Range of at the start of the turn. ▪ This unit cannot target a unit that was the target of another unit’s attack this phase. ▪ Improve the Strength and Armour Penetration characteristics of this unit’s melee weapons by 1. Once per battle round, when you target a Fulgrim unit from your army with the Sinuous Breach or Prideful Superiority Stratagem, you can reduce the CP cost of that use of that Stratagem by 1CP.","",0,"","Purge the Foe"],
  ["Elegant Brutes",1,"","Eager to Kill","When a friendly EMPEROR’S CHILDREN TERMINATOR unit is set up, that unit has +1 to charge rolls until the end of the turn.","",0,"","Take and Hold"],
  ["Frenzied Host",1,"","Frantic Focus","When a friendly EMPEROR’S CHILDREN BATTLELINE unit is selected to make an advance/fall-back move, that unit’s BATTLELINE models’ attacks have [SUSTAINED HITS 1] until the end of the turn.","",0,"","Reconnaissance"],
  ["Mercurial Host",2,"","Quicksilver Grace","You can re-roll Advance rolls made for Emperor’s Children units from your army.","",0,"","Reconnaissance"],
  ["Peerless Bladesmen",2,"","Exquisite Swordsmanship","Each time an Emperor’s Children unit from your army is selected to fight, if it made a Charge move this turn, select one of the abilities below. While resolving those attacks, melee weapons equipped by models in that unit have that ability: ▪ [LETHAL HITS] ▪ [SUSTAINED HITS 1]","",0,"","Priority Assets"],
  ["Rapid Evisceration",2,"","Mechanised Murder","Each time an Emperor’s Children model from your army makes an attack, if it is a Transport model or disembarked from a TRANSPORT this turn, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.","",0,"","Disruption"],
  ["Slaanesh’s Chosen",1,"","Internal Rivalries","Emperor’s Children Character units from your army can ignore any or all modifiers to their Move characteristic and any or all modifiers to Advance and Charge rolls made for them. At the start of the battle, your WARLORD’s unit is your army’s Favoured Champions. The first time in each player’s turn that an EMPEROR’S CHILDREN CHARACTER unit from your army destroys an enemy unit, after resolving all of its attacks, that CHARACTER unit becomes your army’s new Favoured Champions, replacing the old one. Each time a model in your army’s Favoured Champions unit makes an attack, you can re-roll the Wound roll.","",0,"","Purge the Foe"],
  ["Spectacle of Slaughter",1,"","Entitled to Victory","Friendly FLAWLESS BLADES units have Fights First","",0,"","Disruption"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Dark Blessings",10,"Carnival of Excess","Once per battle, just after an enemy unit has selected its targets, the bearer can use this Enhancement. If it does, until the end of the phase, the bearer has a 3+ invulnerable save.",null],
  ["Empyric Suffusion",15,"Carnival of Excess","When you target this unit with the Heroic Intervention stratagem, that use is -1 CP.",null],
  ["Possessed Blade",35,"Carnival of Excess","At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, when resolving those attacks add 1 to the Damage characteristic of that weapon and that weapon has the [Devastating Wounds] and [Hazardous] abilities.",null],
  ["Warp Walker",35,"Carnival of Excess","Each time the bearer's unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 6\" to the Movement characteristic of models in that unit. Each time a model in the bearer's unit makes a Normal, Advance or Fall Back move, it can move through enemy models. When doing so, it can move within Engagement Range of such models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",null],
  ["Pledge of Dark Glory",25,"Coterie of the Conceited","While the bearer is leading a unit, improve the Leadership and Objective Control characteristics of models in that unit by 1.",null],
  ["Pledge of Eternal Servitude",25,"Coterie of the Conceited","The first time the bearer is destroyed, take a Leadership test for the bearer at the end of the phase. if that test is passed, set the bearer back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with D6 wounds remaining (up to its Wounds characteristic).",null],
  ["Pledge of Mortal Pain",15,"Coterie of the Conceited","At the start of your Shooting phase, select one enemy unit within 12\" of and visible to the bearer. That unit must take a Leadership test, subtracting 2 from the result if it is Battle-shocked: if failed, that enemy unit suffers 3 mortal wounds.",null],
  ["Pledge of Unholy Fortune",30,"Coterie of the Conceited","Once per turn, after making a Hit roll, a Wound roll or a saving throw for a model in the bearer's unit, if the bearer is not Battle-shocked, it can use this Enhancement. If it does, treat the result as an unmodified roll of 6 instead.",null],
  ["Exalted Patron",15,"Court of the Phoenician","Add 1\" to the Move characteristic of the bearer.",null],
  ["Soulstain Made Manifest",15,"Court of the Phoenician","At the start of the Fight phase, you can select one enemy unit within Engagement Range of the bearer; that unit must take a Battle-shock test, subtracting 1 from the result.",null],
  ["Spiritsliver",20,"Court of the Phoenician","Add 1 to the Strength and Attacks characteristics of the bearer’s melee weapons.",null],
  ["Tears of the Phoenix",25,"Court of the Phoenician","Each time a model in the bearer’s unit makes a melee attack, you can ignore any or all modifiers to that attack’s Weapon Skill characteristic and any or all modifiers to the Hit roll and Wound roll.",null],
  ["Cacophonic Accompaniment",20,"Elegant Brutes","- This model has Deep Strike. \n- This unit’s ranged attacks have [IGNORES COVER].",null],
  ["Frenzied Ferocity (Upgrade)",15,"Elegant Brutes","EMPEROR’S CHILDREN TERMINATOR SQUAD unit only. This unit’s attacks have [SUSTAINED HITS 1].",null],
  ["Euphoric Crown",20,"Frenzied Host","This model’s melee attacks have +1 S.",null],
  ["Howling Plate",20,"Frenzied Host","This unit’s ranged attacks have +1 AP.",null],
  ["Intoxicating Musk",20,"Mercurial Host","Each time a melee attack targets the bearer's unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of that unit, subtract 1 from the Wound roll.",null],
  ["Loathsome Dexterity",10,"Mercurial Host","Each time a model in the bearer's unit makes a Normal, Advance or Fall Back move, it can move through enemy models. When doing so, it can move within Engagement Range of such models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",null],
  ["Steeped in Suffering",20,"Mercurial Host","Each time a model in the bearer's unit makes an attack that targets an enemy unit below its Starting Strength, add 1 to the Hit roll. If that target is also Below Half-Strength, add 1 to the Wound roll as well.",null],
  ["Tactical Perfection",15,"Mercurial Host","After both players have deployed their armies, select up to two Emperor's Children units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",null],
  ["Blinding Speed",25,"Peerless Bladesmen","Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does so, until the end of the phase, models in the bearer's unit have the Fights First ability.",null],
  ["Distortion",25,"Peerless Bladesmen","Add 1 to the Attacks and Damage characteristics of melee weapons equipped by the bearer.",null],
  ["Faultless Opportunist",15,"Peerless Bladesmen","You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: \n- That use is -1 CP. \n- That use does not prevent any uses of that stratagem on other units this phase.",null],
  ["Rise to the Challenge",30,"Peerless Bladesmen","Once per battle, at the end of the Fight phase, if the bearer is within Engagement Range of three or more enemy models, it can use this Enhancement. If it does, the bearer can fight one additional time. When doing so, you can select one ability using the Exquisite Swordsmanship Detachment rule to apply to those attacks.",null],
  ["Accomplished Tactician",35,"Rapid Evisceration","Once per turn, in your opponent's Shooting phase, just after an enemy unit has shot, you can select one friendly Emperor's Children unit within 9\" of the bearer that was hit by one or more of those attacks, then select one friendly Transport that unit is wholly within 6\" of and is able to embark within. That Emperor's Children unit can embark in that Transport.",null],
  ["Heretek Adept",35,"Rapid Evisceration","Once per battle round, when a saving throw is failed for a friendly Emperor's Children Vehicle model within 6\" of the bearer, you can change the Damage characteristic of that attack to 0.",null],
  ["Spearhead Striker",20,"Rapid Evisceration","Each time the bearer disembarks from a Transport, until the end of the turn, you can re-roll Charge rolls made for the bearer's unit and enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer's unit.",null],
  ["Sublime Prescience",25,"Rapid Evisceration","Emperor’s Children Infantry model only. Once per turn, in your Movement phase, the bearer can use this Enhancement. If it does, select one friendly Emperor’s Children Transport that is in Strategic Reserves. Until the end of the phase, for the purposes of setting up that TRANSPORT on the battlefield, treat the current battle round number as being one higher than it actually is.",null],
  ["Eager to Prove",15,"Slaanesh’s Chosen","You can re-roll Charge rolls made for the bearer's unit. While the bearer's unit is your army's Favoured Champions, add 2\" to the Move characteristic of models in that unit.",null],
  ["Proud and Vainglorious",20,"Slaanesh’s Chosen","You can re-roll Battle-shock and Leadership tests taken for the bearer's unit. While the bearer's unit is your army's Favoured Champions, add 1 to the Objective Control characteristics of models in that unit.",null],
  ["Repulsed by Weakness",25,"Slaanesh’s Chosen","Each time an enemy unit (excluding Monster and Vehicle units) within Engagement Range of the bearer's unit Falls Back, models in that enemy unit must take Desperate Escape tests. When doing so, if the bearer's unit is your army's Favoured Champions, subtract 1 from each of those Desperate Escape tests.",null],
  ["Slayer of Champions",15,"Slaanesh’s Chosen","The bearer's melee weapons have the [Precision] ability, and each time the bearer makes a melee attack that targets a Character unit, improve the Strength and Armour Penetration characteristics of that attack by 1.",null],
  ["Beguiling Grotesquerie (Upgrade)",15,"Spectacle of Slaughter","FLAWLESS BLADES unit only. Enemy units cannot target this unit with snap shooting attacks.",null],
  ["Eager Patrons (Upgrade)",20,"Spectacle of Slaughter","FLAWLESS BLADES unit only. This unit has +2\" M.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Dark Apparitions","Carnival of Excess","Ruse Stratégique",2,"End of your opponent’s Fight phase.","One Daemonettes unit from your army that is not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves. If it arrives back on the battlefield in the Reinforcements step of your next Movement phase using the Deep Strike ability, it can be set up anywhere that is more than 6\" horizontally away from all enemy units (instead of more than 8\"), provided it is also set up wholly within 8\" of one or more friendly Emperor’s Children units.",""],
  ["Ecstatic Slaughter","Carnival of Excess","Ruse Stratégique",1,"Fight phase, just after a LEGIONS OF EXCESS unit from your army destroys an enemy unit.","That Legions OF Excess unit and one friendly Emperor’s Children unit within 6\" of it that is not within Engagement Range of one or more enemy units.","Your EMPEROR’S CHILDREN unit can declare a charge. If it does so and it has already been selected to fight this phase, it cannot fight again this phase.",""],
  ["Sustained by Agony","Carnival of Excess","Tactique de Bataille",1,"Fight phase, just after an Emperor’s Children unit from your army destroys an enemy unit.","That EMPEROR’S CHILDREN unit.","Select one friendly Legions of Excess unit within 6\" of your unit. One model in that LEGIONS OF EXCESS unit recovers up to 3 lost wounds or, if it is a Daemonettes unit, return upto D3+3 destroyed models to it instead.",""],
  ["Sycophantic Surge","Carnival of Excess","Tactique de Bataille",1,"Your Charge phase.","One LEGIONS OF EXCESS unit from your army.","Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced or Fell Back, provided at least one of the targets of that charge is within Engagement Range of one or more Emperor’s Children units from your army.",""],
  ["Uncanny Reactions","Carnival of Excess","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Slaanesh unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Violent Crescendo","Carnival of Excess","Ruse Stratégique",2,"Fight phase.","One Slaanesh Beasts, Slaanesh Infantry or SLAANESH Mounted unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes a Pile-in or Consolidation move, it can move up to 6\" instead of up to 3\". When doing so, it does not need to end that move closer to the closest enemy model, provided it ends that move as close as possible to the closest enemy unit.",""],
  ["Armour of Abhorrence","Coterie of the Conceited","Équipement",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Emperor’s Children unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets a model in your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Embrace the Pain","Coterie of the Conceited","Ruse Stratégique",1,"Start of the Fight phase.","One Emperor’s Children Infantry unit from your army.","Until the end of the phase, each time an enemy model within Engagement Range of your unit selects targets, it must select your unit as the target of its attacks.",""],
  ["Martial Perfection","Coterie of the Conceited","Tactique de Bataille",1,"Fight phase.","One Emperor’s Children unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, you can re-roll the Hit roll.",""],
  ["Protection of the Dark Prince","Coterie of the Conceited","Ruse Stratégique",1,"Any phase, just after a mortal wound or attack is allocated to a model in an Emperor’s Children unit from your army.","That EMPEROR’S CHILDREN unit.","Until the end of the phase, models in your unit have the Feel No Pain 6+ ability, and the Feel No Pain 4+ ability against mortal wounds.",""],
  ["Unbound Arrogance","Coterie of the Conceited","Fait Épique",1,"Your Shooting phase or the Fight phase, just after an Emperor’s Children unit from your army destroys an enemy unit.","That EMPEROR’S CHILDREN unit.","Increase your pledge to Slaanesh by 1.","You can only use this Stratagem once per battle round."],
  ["Unshakeable Opponents","Coterie of the Conceited","Fait Épique",1,"Command phase.","One Emperor’s Children unit from your army.","Until the end of the turn, each time a model in your unit makes an attack, you can ignore any or all modifiers to the following: that attack’s Ballistic Skill or Weapon Skill characteristic; the Hit roll; the Wound roll.",""],
  ["Catalytic Stimulus","Court of the Phoenician","",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One EMPEROR’S CHILDREN unit from your army that lost one or more wounds as a result of those attacks.","Your unit can make a surge move of up to D6\".",""],
  ["Close-Quarters Excruciation","Court of the Phoenician","",1,"Your Shooting phase.","One Emperor’s Children unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time an EMPEROR’S CHILDREN model in your unit makes an attack that targets an eligible unit within 12\", improve the Strength and Armour Penetration characteristics of that attack by 1.",""],
  ["Contemptuous Disregard","Court of the Phoenician","",1,"Your opponent’s Shooting phase or the Fight phase.","One Emperor’s Children unit from your army.","Until the end of the phase, each time an attack targets your unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of your unit, subtract 1 from the Wound roll.",""],
  ["Euphoric Inspiration","Court of the Phoenician","",1,"Your Charge phase.","One Emperor’s Children Daemon unit from your army.","Until the end of the phase, you can re-roll Charge rolls for friendly Emperor’s Children units within 6\" of your unit.",""],
  ["Prideful Superiority","Court of the Phoenician","",2,"Fight phase.","One Emperor’s Children unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a CHARACTER unit, you can re-roll the Hit roll and you can re-roll the Wound roll.",""],
  ["Sinuous Breach","Court of the Phoenician","",1,"Your Movement phase or your Charge phase.","One Emperor’s Children Daemon unit from your army that has not been selected to move or charge this phase.","Until the end of the phase, each time your unit makes a Normal, Advance or Charge move, it can move horizontally through terrain features.",""],
  ["Delight in Agony","Elegant Brutes","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly EMPEROR’S CHILDREN TERMINATOR unit.","That EMPEROR’S CHILDREN TERMINATOR unit.","Attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Psychedelic Soulflame","Elegant Brutes","",1,"Your Shooting phase or the Fight phase, when a friendly EMPEROR’S CHILDREN TERMINATOR unit is selected to attack.","That EMPEROR’S CHILDREN TERMINATOR unit","Your unit’s attacks have +2 S.",""],
  ["Warp Plunge","Elegant Brutes","",1,"End of your opponent’s Fight phase.","One friendly unengaged EMPEROR’S CHILDREN TERMINATOR unit.","Place your unit in strategic reserves.",""],
  ["Absolute Sensory Overload","Frenzied Host","",1,"Your Shooting phase, when a friendly EMPEROR’S CHILDREN BATTLELINE unit is selected to shoot.","That EMPEROR’S CHILDREN BATTLELINE unit.","Those ranged attacks do not prevent your unit from being hidden.",""],
  ["Agonised Cacophony","Frenzied Host","",1,"Start of your Shooting phase.","One friendly EMPEROR’S CHILDREN BATTLELINE unit.","Select one visible enemy unit within 12\" of your unit. That enemy unit has +6\" detection range.",""],
  ["Possessive Mania","Frenzied Host","",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly EMPEROR’S CHILDREN BATTLELINE unit within range of an objective.","That EMPEROR’S CHILDREN BATTLELINE unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Capricious Reactions","Mercurial Host","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Emperor’s Children unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Combat Stimms","Mercurial Host","Tactique de Bataille",2,"Fight phase, just after an enemy unit has selected its targets.","One Emperor’s Children iNFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Wound roll.",""],
  ["Cruel Raiders","Mercurial Host","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Emperor’s Children unit from your army that is wholly within 9\" of one or more battlefield edges and not within 3\" horizontally of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Dark Vigour","Mercurial Host","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Emperor’s Children unit from your army (excluding Beasts and Vehicles) that is within 8\" of the enemy unit that just ended that move.","Your unit can make a Normal move of up to 6\".",""],
  ["Honour the Prince","Mercurial Host","Tactique de Bataille",1,"Your Movement phase.","One Emperor’s Children Infantry unit from your army that has not been selected to move this phase.","Until the end of the phase, if your unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 6\" to the Move characteristic of models in your unit.",""],
  ["Violent Excess","Mercurial Host","Tactique de Bataille",1,"Fight phase.","One Emperor’s Children unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability.",""],
  ["Cruel Bladesman","Peerless Bladesmen","Tactique de Bataille",1,"Fight phase.","One Emperor’s Children unit from your army that made a Charge move this turn and has not been selected to fight this phase.","Until the end of the phase, improve the Armour Penetration characteristic of melee weapons equipped by models in your unit by 1.",""],
  ["Cut Down the Weak","Peerless Bladesmen","Ruse Stratégique",2,"Your opponent’s Movement phase, just after an enemy unit Falls Back.","One Emperor’s Children unit from your army (you can only select a Vehicle if it is a Walker) that is within 6\" of that enemy unit and would be eligible to declare a charge against that enemy unit if it were your Charge phase.","Your unit can declare a charge. When doing so, you must select that enemy unit as a target of that charge, and your unit does not receive a Charge bonus this turn.",""],
  ["Death Ecstasy","Peerless Bladesmen","Ruse Stratégique",2,"Fight phase, just after an enemy unit has selected its targets.","One Emperor’s Children unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Deft Parry","Peerless Bladesmen","Tactique de Bataille",1,"Fight phase, just after an enemy unit has selected its targets.","One Emperor’s Children unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Incessant Violence","Peerless Bladesmen","Tactique de Bataille",1,"Fight phase, just before an Emperor’s Children unit from your army Consolidates.","That EMPEROR’S CHILDREN unit.","Until the end of the phase, each time a model in your unit makes a Consolidation move, it can move up to 6\" instead of up to 3\", provided your unit ends that Consolidation move within Engagement Range of one or more enemy units.",""],
  ["Terrifying Spectacle","Peerless Bladesmen","Ruse Stratégique",1,"Your opponent’s Command phase.","One Emperor’s Children unit from your army that made a Charge move in the previous turn and destroyed one or more enemy units in the previous Fight phase.","Each enemy unit within 6\" of your unit must take a Battle-shock test, subtracting 1 from that test if they are Below Half-strength. Enemy units affected by this Stratagem do not need to take any other Battle-shock tests in the same phase.",""],
  ["Advance and Claim","Rapid Evisceration","Ruse Stratégique",1,"Your Command phase.","One Emperor’s Children Transport from your army that has one or more Tormentors units embarked within it (excluding Battle-shocked units).","Select one objective marker you control that your TRANSPORT is within range of. That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Ceaseless Onslaught","Rapid Evisceration","Ruse Stratégique",1,"Your Charge phase.","One Emperor’s Children unit from your army that disembarked from a Transport that made a Normal move this turn.","Your EMPEROR’S CHILDREN unit is treated as having made an assault disembark move (Core Rules, 18.06) for that disembarkation.",""],
  ["Dynamic Breakthrough","Rapid Evisceration","Fait Épique",1,"Your Movement phase.","One Emperor’s Children Vehicle unit from your army that has not been selected to move this phase.","Until the end of the phase, each time a model in your unit makes a move, it can move through enemy models (excluding MONSTERS and VEHICLES). When doing so, it can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",""],
  ["Onto the Next","Rapid Evisceration","Ruse Stratégique",1,"End of the Fight phase.","One EMPEROR’S CHILDREN unit from your army that destroyed an enemy unit this phase, and one friendly TRANSPORT it is able to embark within.","If your EMPEROR’S CHILDREN unit is wholly within 6\" of that TRANSPORT, it can embark within it. Your unit can embark within that TRANSPORT in a turn it disembarked from a TRANSPORT.",""],
  ["Outflanking Strike","Rapid Evisceration","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Emperor’s Children Transport from your army, or up to two Emperor’s Children Dedicated Transports from your army.","For each of those TRANSPORTS wholly within 9\" of one or more battlefield edges, remove it from the battlefield and place it into Strategic Reserves.",""],
  ["Reactive Disembarkation","Rapid Evisceration","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Emperor’s Children Transport from your army that was selected as the target of one or more of the attacking unit’s attacks.","One Emperor’s Children unit embarked within your TRANSPORT can disembark. When doing so, models in that unit can be set up anywhere on the battlefield wholly within 6\" of that TRANSPORT and not within Engagement Range of one or more enemy units.",""],
  ["Beautiful Death","Slaanesh’s Chosen","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Emperor’s Children Character unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 to the result if your unit is your army’s Favoured Champions. On a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Devoted Duellists","Slaanesh’s Chosen","Tactique de Bataille",1,"Fight phase.","One or more Emperor’s Children Character units from your army that have not been selected to fight this phase.","Select one enemy unit. Until the end of the phase, melee weapons equipped by models in those CHARACTER units have the [SUSTAINED HITS 1] ability while targeting that enemy unit.",""],
  ["Diabolic Majesty","Slaanesh’s Chosen","Fait Épique",1,"Your Shooting phase or the Fight phase, just after an Emperor’s Children Character unit becomes your army’s Favoured Champions.","That EMPEROR’S CHILDREN unit.","Each enemy unit within 6\" of your unit must take a Battle-shock test, subtracting 1 from the result.","You can only use this Stratagem once per battle round."],
  ["Heightened Jealousy","Slaanesh’s Chosen","Tactique de Bataille",1,"Your Shooting phase or the Fight phase, just after an Emperor’s Children Character unit becomes your army’s Favoured Champions, or just after your army’s Favoured Champions unit destroys an enemy unit.","Your army’s Favoured Champions unit.","Until the end of the phase, each time a model in an EMPEROR’S CHILDREN CHARACTER unit from your army that is not your army’s Favoured Champions makes an attack, add 1 to the Strength characteristic of that attack.",""],
  ["Refusal to Be Outdone","Slaanesh’s Chosen","Tactique de Bataille",1,"Your Charge phase, when a friendly EMPEROR’S CHILDREN CHARACTER unit within 12\" of an engaged enemy unit declares a charge.","That EMPEROR’S CHILDREN CHARACTER unit.","Your unit can re-roll charge rolls. Your unit must end that charge move engaged with one or more of those enemy units.",""],
  ["Vengeful Surge","Slaanesh’s Chosen","Ruse Stratégique",1,"Your opponent’s Shooting phase, when an enemy unit that targeted a friendly unengaged EMPEROR’S CHILDREN CHARACTER unit this phase has shot.","That EMPEROR’S CHILDREN CHARACTER unit.","Your unit can make a surge move of up to D6\". If your unit is not your army’s Favoured Champions, you can re-roll the dice to determine the distance of that surge move.",""],
  ["Honour Is for Fools","Spectacle of Slaughter","",1,"Fight phase, when a friendly FLAWLESS BLADES unit is selected to fight.","That FLAWLESS BLADES unit.","Your unit’s melee attacks have [PRECISION].",""],
  ["Intoxicated by Triumph","Spectacle of Slaughter","",1,"Your opponent’s Movement phase, when an enemy unit that was engaged with a friendly FLAWLESS BLADES unit ends a fall-back move, if that FLAWLESS BLADES unit is unengaged.","That FLAWLESS BLADES unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Single-Minded Strike","Spectacle of Slaughter","",1,"Your Charge phase, when a friendly FLAWLESS BLADES unit starts a charge move.","That FLAWLESS BLADES unit.","Your unit can move through models (excluding MONSTER/VEHICLE models).",""],
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
  "Chaos Rhino",
  "Defiler",
  "Heldrake",
  "Maulerfiend"
 ],
 "monster": [
  "Daemon Prince of Slaanesh",
  "Daemon Prince of Slaanesh with Wings",
  "Keeper of Secrets"
 ],
 "battleline": [
  "Daemonettes",
  "Infractors",
  "Tormentors"
 ],
 "epic": [
  "Fulgrim",
  "Lucius the Eternal",
  "Shalaxi Helbane"
 ],
 "infantry": [
  "Chaos Terminators",
  "Flawless Blades",
  "Noise Marines"
 ],
 "character": [
  "Lord Exultant",
  "Lord Kakophonist",
  "Sorcerer"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Lucius the Eternal": "50",
 "Fulgrim": "130",
 "Lord Exultant": "40",
 "Lord Kakophonist": "40",
 "Sorcerer": "40",
 "Daemon Prince of Slaanesh": "60",
 "Daemon Prince of Slaanesh with Wings": "60",
 "Tormentors": "32",
 "Infractors": "32",
 "Flawless Blades": "40",
 "Chaos Terminators": "40",
 "Chaos Spawn": "50",
 "Chaos Land Raider": "coque",
 "Noise Marines": "40",
 "Heldrake": "120x92",
 "Maulerfiend": "120x92",
 "Chaos Rhino": "coque",
 "Shalaxi Helbane": "100",
 "Keeper of Secrets": "100",
 "Daemonettes": "25",
 "Fiends": "75x42",
 "Seekers": "60x35.5",
 "Defiler": "160"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Fulgrim": 6,
 "Chaos Land Raider": 5,
 "Shalaxi Helbane": 7
};

const TRANSPORTS = {
 "Chaos Land Raider": "This model has a transport capacity of 14 **^^Emperor's Children Infantry^^** models. Each **^^Terminator^^** and ^^**Flawless Blade^^** model takes up the space of 2 models.",
 "Chaos Rhino": "This model has a transport capacity of 12 **^^Emperor's Children Infantry^^**models (excluding ^^**Terminator**^^ and ^^**Flawless Blade**^^ models)."
};
const FACTION = [
 [
  "Thrill Seekers",
  "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/emperorschildren.json —
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
  cle : "emperorschildren",
  nom : "Emperor's Children",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
