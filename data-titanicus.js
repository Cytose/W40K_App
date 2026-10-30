/* ============================================================
   Données Adeptus Titanicus — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py titanicus

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 11 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     4 fiches sur 4 en ont un. Les autres — des Legends, que le
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
  ["Reaver Titan",12,14,2,5,60,[1],{"1": 2200},0,"",0,"",20,"6+"],
  ["Warbringer Nemesis Titan",12,14,2,5,80,[1],{"1": 2600},0,"",0,"",20,"6+"],
  ["Warhound Titan",14,13,2,5,40,[1],{"1": 1100},0,"",0,"",16,"6+"],
  ["Warlord Titan",10,16,2,5,100,[1],{"1": 3500},0,"",0,"",30,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Reaver Titan","Reaver apocalypse launcher","T","3D6",3,7,1,"2","blast indirect","200\""],
  ["Reaver Titan","Reaver gatling blaster","T","12",3,8,2,"3","sust:1","72\""],
  ["Reaver Titan","Reaver laser blaster","T","8",3,20,3,"D6+2","blast","72\""],
  ["Reaver Titan","Reaver melta cannon","T","D6+2",3,13,4,"6","blast melta:4","48\""],
  ["Reaver Titan","Reaver volcano cannon","T","D3+1",3,24,5,"14","blast heavy","120\""],
  ["Reaver Titan","Reaver feet","C","8",4,12,2,"4","","càc"],
  ["Reaver Titan","➤ Reaver power fist - strike","C","6",4,20,4,"14","","càc"],
  ["Reaver Titan","➤ Reaver power fist - sweep","C","12",4,12,3,"6","","càc"],
  ["Warbringer Nemesis Titan","Anvillus defence battery","T","8",3,8,1,"2","anti:4:vol","72\""],
  ["Warbringer Nemesis Titan","Ardex-defensor mauler","T","6",3,6,2,"2","","36\""],
  ["Warbringer Nemesis Titan","Nemesis quake cannon","T","D6+6",3,16,4,"4","blast indirect","480\""],
  ["Warbringer Nemesis Titan","Nemesis volcano cannon","T","D3+3",3,24,5,"14","blast","120\""],
  ["Warbringer Nemesis Titan","Reaver gatling blaster","T","12",3,8,2,"3","sust:1","72\""],
  ["Warbringer Nemesis Titan","Reaver laser blaster","T","8",3,20,3,"D6+2","blast","72\""],
  ["Warbringer Nemesis Titan","Reaver melta cannon","T","D6+2",3,13,4,"6","blast melta:4","48\""],
  ["Warbringer Nemesis Titan","Reaver volcano cannon","T","D3+1",3,24,5,"14","blast heavy","120\""],
  ["Warbringer Nemesis Titan","Nemesis feet","C","6",4,12,2,"4","","càc"],
  ["Warhound Titan","Warhound inferno gun","T","3D6",0,7,2,"3","ignorescover torrent","24\""],
  ["Warhound Titan","Warhound turbo-laser destructor","T","D3+3",3,20,3,"2D6","blast","72\""],
  ["Warhound Titan","Warhound vulcan mega-bolter","T","20",3,6,1,"2","sust:1","48\""],
  ["Warhound Titan","➤ Warhound plasma blastgun - standard","T","2D6+3",3,9,3,"4","blast","72\""],
  ["Warhound Titan","➤ Warhound plasma blastgun - supercharge","T","2D6+3",3,10,3,"5","blast hazardous","72\""],
  ["Warhound Titan","Warhound feet","C","8",4,10,1,"2","","càc"],
  ["Warlord Titan","Apocalypse launcher","T","20",3,8,2,"2","blast indirect","200\""],
  ["Warlord Titan","Ardex-defensor lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Warlord Titan","Ardex-defensor mauler","T","6",3,6,2,"2","","36\""],
  ["Warlord Titan","Arioch power claw","T","20",3,6,1,"2","sust:1","48\""],
  ["Warlord Titan","Belicosa volcano cannon","T","D3+3",3,32,5,"18","blast","120\""],
  ["Warlord Titan","Laser blaster","T","6",3,16,4,"D6+3","blast","72\""],
  ["Warlord Titan","Macro gatling blaster","T","30",3,9,2,"3","sust:1","100\""],
  ["Warlord Titan","Mori quake cannon","T","3D6",3,16,4,"6","blast ignorescover","280\""],
  ["Warlord Titan","➤ Sunfury plasma annihilator - standard","T","2D6+6",3,10,3,"5","blast","72\""],
  ["Warlord Titan","➤ Sunfury plasma annihilator - supercharge","T","2D6+6",3,12,3,"8","blast hazardous","72\""],
  ["Warlord Titan","Warlord feet","C","6",4,12,2,"4","","càc"],
  ["Warlord Titan","➤ Arioch power claw - strike","C","6",4,20,4,"24","","càc"],
  ["Warlord Titan","➤ Arioch power claw - sweep","C","12",4,12,3,"8","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Reaver Titan","Véhicule"],
  ["Warbringer Nemesis Titan","Véhicule"],
  ["Warhound Titan","Véhicule"],
  ["Warlord Titan","Véhicule"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Warhound Titan": [
  [
   "Flank Speed",
   "Each time this model Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 8\" to the Move characteristic of this model."
  ],
  [
   "Damaged: 1-13 wounds remaining",
   "While this model has 1-13 wounds remaining, subtract 8 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Striding Colossus",
   "Each time you target this model with a Stratagem, you must spend twice that Stratagem’s stated CP cost to do so."
  ]
 ],
 "Reaver Titan": [
  [
   "Damaged: 1-20 wounds remaining",
   "While this model has 1-20 wounds remaining, subtract 10 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "God-machine",
   "This model is eligible to shoot and declare a charge in a turn in which it Fell Back."
  ],
  [
   "Striding Colossus",
   "Each time you target this model with a Stratagem, you must spend three times that Stratagem’s stated CP cost to do so."
  ]
 ],
 "Warbringer Nemesis Titan": [
  [
   "Damaged: 1-26 wounds remaining",
   "While this model has 1-26 wounds remaining, subtract 10 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Titanic Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly IMPERIUM model makes an attack that targets that enemy unit, on a Critical Wound, improve the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Striding Colossus",
   "Each time you target this model with a Stratagem, you must spend three times that Stratagem’s stated CP cost to do so."
  ]
 ],
 "Warlord Titan": [
  [
   "Damaged: 1-33 wounds remaining",
   "While this model has 1-33 wounds remaining, subtract 15 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Wrath of the Omnissiah",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. That unit must take a Battle-shock test."
  ],
  [
   "Striding Colossus",
   "Each time you target this model with a Stratagem, you must spend four times that Stratagem’s stated CP cost to do so."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [

];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [

];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
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
  "Reaver Titan",
  "Warbringer Nemesis Titan",
  "Warhound Titan",
  "Warlord Titan"
 ],
 "monster": [],
 "battleline": [],
 "epic": [],
 "infantry": [],
 "character": []
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Warhound Titan": "coque",
 "Reaver Titan": "coque",
 "Warbringer Nemesis Titan": "coque",
 "Warlord Titan": "coque"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Warhound Titan": 13,
 "Reaver Titan": 20,
 "Warbringer Nemesis Titan": 26,
 "Warlord Titan": 33
};

const TRANSPORTS = {};
const FACTION = [
 [
  "Super-heavy Walker",
  "Each time a model with this ability makes a Normal, Advance or Fall Back move, it can move over models (excluding TITANIC models) and terrain features that are 4\" or less in height as if they were not there."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/titanicus.json —
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
  cle : "titanicus",
  nom : "Adeptus Titanicus",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
