/* ============================================================
   Données Chevaliers Impériaux — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py chevaliers

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 50 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     22 fiches sur 22 en ont un. Les autres — des Legends, que le
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
  ["Acastus Knight Asterius",8,13,2,5,30,[1],[[1, {"1": 785}], [2, {"1": 860}]],0,"",0,"",10,"6+"],
  ["Acastus Knight Porphyrion",8,13,2,5,30,[1],[[1, {"1": 725}], [2, {"1": 800}]],0,"",0,"",10,"6+"],
  ["Armiger Helverin",12,9,3,5,14,[1],{"1": 140},0,"",0,"",6,"7+"],
  ["Armiger Moirax",12,9,3,5,14,[1],[[1, {"1": 150}], [3, {"1": 160}]],0,"",0,"",6,"7+"],
  ["Armiger Warglaive",12,9,3,5,14,[1],{"1": 140},0,"",0,"",6,"7+"],
  ["Canis Rex",10,11,3,5,26,[1],{"1": 415},0,"",0,"",10,"6+"],
  ["Cerastus Knight Acheron",12,11,3,5,28,[1],[[1, {"1": 380}], [2, {"1": 395}]],0,"",0,"",10,"6+"],
  ["Cerastus Knight Atrapos",12,11,3,5,28,[1],[[1, {"1": 420}], [2, {"1": 440}]],0,"",0,"",10,"6+"],
  ["Cerastus Knight Castigator",12,11,3,5,28,[1],[[1, {"1": 380}], [2, {"1": 395}]],0,"",0,"",10,"6+"],
  ["Cerastus Knight Lancer",14,11,3,4,28,[1],[[1, {"1": 415}], [2, {"1": 435}]],0,"",0,"",10,"6+"],
  ["Knight Castellan",8,12,3,5,28,[1],[[1, {"1": 425}], [2, {"1": 450}]],0,"",0,"",10,"6+"],
  ["Knight Crusader",10,11,3,5,26,[1],[[1, {"1": 395}], [2, {"1": 415}]],0,"",0,"",10,"6+"],
  ["Knight Defender",10,11,3,4,26,[1],[[1, {"1": 385}], [2, {"1": 405}]],0,"",0,"",10,"6+"],
  ["Knight Destrier",12,10,3,5,18,[1],[[1, {"1": 265}], [3, {"1": 280}]],0,"",0,"",8,"6+"],
  ["Knight Errant",10,11,3,5,26,[1],[[1, {"1": 355}], [3, {"1": 370}]],0,"",0,"",10,"6+"],
  ["Knight Gallant",12,11,3,5,26,[1],[[1, {"1": 355}], [3, {"1": 370}]],0,"",0,"",10,"6+"],
  ["Knight Paladin",10,11,3,5,26,[1],[[1, {"1": 375}], [3, {"1": 390}]],0,"",0,"",10,"6+"],
  ["Knight Preceptor",10,11,3,5,26,[1],[[1, {"1": 365}], [3, {"1": 380}]],0,"",0,"",10,"6+"],
  ["Knight Valiant",8,12,3,5,28,[1],[[1, {"1": 390}], [3, {"1": 405}]],0,"",0,"",10,"6+"],
  ["Knight Warden",10,11,3,5,26,[1],[[1, {"1": 365}], [3, {"1": 380}]],0,"",0,"",10,"6+"],
  ["Questoris Knight Magaera",10,11,3,5,26,[1],[[1, {"1": 385}], [2, {"1": 400}]],0,"",0,"",10,"6+"],
  ["Questoris Knight Styrix",10,11,3,5,26,[1],[[1, {"1": 375}], [2, {"1": 390}]],0,"",0,"",10,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Acastus Knight Asterius","Asterius volkite culverin","T","6",3,6,0,"2","dev","24\""],
  ["Acastus Knight Asterius","Karacnos mortar battery","T","D6+3",3,6,1,"1","anti:2:inf blast ignorescover indirect","48\""],
  ["Acastus Knight Asterius","Twin conversion beam cannon","T","3",3,16,2,"6","twin sust:D3","48\""],
  ["Acastus Knight Asterius","Titanic feet","C","6",4,10,1,"2","","càc"],
  ["Acastus Knight Porphyrion","Acastus autocannon","T","2",3,9,1,"3","","48\""],
  ["Acastus Knight Porphyrion","Acastus ironstorm missile pod","T","D6+6",3,5,0,"1","blast heavy indirect","48\""],
  ["Acastus Knight Porphyrion","Helios defence missiles","T","3",3,10,2,"D6","anti:2:vol heavy","48\""],
  ["Acastus Knight Porphyrion","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Acastus Knight Porphyrion","Twin magna lascannon","T","D6",3,18,4,"D6+6","blast twin","72\""],
  ["Acastus Knight Porphyrion","Titanic feet","C","6",4,10,1,"2","","càc"],
  ["Armiger Helverin","Armiger autocannon","T","4",3,9,1,"3","","48\""],
  ["Armiger Helverin","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Armiger Helverin","Questoris heavy stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Armiger Helverin","Armoured feet","C","4",3,6,0,"1","","càc"],
  ["Armiger Moirax","Conversion beam cannon","T","1",3,10,2,"3","sust:D3","24\""],
  ["Armiger Moirax","Graviton pulsar","T","D6",3,7,1,"2","anti:2:veh blast","24\""],
  ["Armiger Moirax","Lightning lock","T","6",3,8,0,"1","sust:2","36\""],
  ["Armiger Moirax","Rad cleanser","T","D6",0,2,0,"1","anti:2:inf ignorescover torrent","12\""],
  ["Armiger Moirax","Volkite veuglaire","T","4",3,8,0,"2","dev","36\""],
  ["Armiger Moirax","Armoured feet","C","4",3,6,0,"1","","càc"],
  ["Armiger Moirax","Siege claw","C","4",3,12,3,"D6+2","","càc"],
  ["Armiger Warglaive","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Armiger Warglaive","Questoris heavy stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Armiger Warglaive","Thermal spear","T","2",3,12,4,"D6","melta:4","18\""],
  ["Armiger Warglaive","➤ Reaper chain-cleaver - strike","C","4",3,10,3,"3","","càc"],
  ["Armiger Warglaive","➤ Reaper chain-cleaver - sweep","C","8",3,8,2,"1","","càc"],
  ["Canis Rex","Hekhtur's pistol","T","1",2,5,1,"2","pistol","12\""],
  ["Canis Rex","Questoris multi-laser","T","4",2,6,0,"1","sust:1","36\""],
  ["Canis Rex","➤ Las-impulsor - high intensity","T","D6",2,14,3,"4","blast sust:1","24\""],
  ["Canis Rex","➤ Las-impulsor - low intensity","T","2D6",2,7,1,"2","blast sust:1","36\""],
  ["Canis Rex","Close combat weapon","C","2",2,3,0,"1","","càc"],
  ["Canis Rex","➤ Freedom's Hand - strike","C","5",2,20,3,"9","sust:1","càc"],
  ["Canis Rex","➤ Freedom's Hand - sweep","C","10",2,10,2,"3","sust:1","càc"],
  ["Cerastus Knight Acheron","Acheron flame cannon","T","2D6",0,8,1,"2","torrent ignorescover","18\""],
  ["Cerastus Knight Acheron","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Cerastus Knight Acheron","➤ Reaper chainfist - strike","C","4",3,14,4,"6","","càc"],
  ["Cerastus Knight Acheron","➤ Reaper chainfist - sweep","C","12",3,9,3,"2","","càc"],
  ["Cerastus Knight Atrapos","➤ Atrapos lascutter - high intensity (ranged)","T","D6",3,14,3,"4","sust:1","24\""],
  ["Cerastus Knight Atrapos","➤ Atrapos lascutter - low intensity (ranged)","T","2D6",3,7,1,"2","sust:1","36\""],
  ["Cerastus Knight Atrapos","➤ Graviton singularity cannon - contained","T","D3",3,16,4,"D6+1","blast","24\""],
  ["Cerastus Knight Atrapos","➤ Graviton singularity cannon - singularity","T","D3",3,16,4,"D6+1","blast dev hazardous","24\""],
  ["Cerastus Knight Atrapos","➤ Atrapos lascutter - high intensity (melee)","C","6",3,14,3,"4","sust:1","càc"],
  ["Cerastus Knight Atrapos","➤ Atrapos lascutter - low intensity (melee)","C","12",3,7,1,"2","sust:1","càc"],
  ["Cerastus Knight Castigator","Castigator bolt cannon","T","18",3,6,2,"2","twin","36\""],
  ["Cerastus Knight Castigator","➤ Tempest warblade - strike","C","4",3,14,4,"6","","càc"],
  ["Cerastus Knight Castigator","➤ Tempest warblade - sweep","C","12",3,9,3,"2","","càc"],
  ["Cerastus Knight Lancer","Cerastus shock lance","T","6",3,6,0,"2","assault sust:2","12\""],
  ["Cerastus Knight Lancer","➤ Cerastus shock lance - strike","C","5",2,20,3,"8","lance","càc"],
  ["Cerastus Knight Lancer","➤ Cerastus shock lance - sweep","C","10",2,10,2,"3","","càc"],
  ["Knight Castellan","Shieldbreaker missile launcher","T","1",3,12,6,"D6+1","anti:4 dev","72\""],
  ["Knight Castellan","Twin meltagun","T","1",3,9,4,"D6","melta:2 twin","12\""],
  ["Knight Castellan","Twin siegebreaker cannon","T","D6",3,6,0,"1","blast twin","36\""],
  ["Knight Castellan","Volcano lance","T","D3",3,18,5,"D6+8","blast","72\""],
  ["Knight Castellan","➤ Plasma decimator - standard","T","D6+3",3,8,3,"2","blast","48\""],
  ["Knight Castellan","➤ Plasma decimator - supercharge","T","D6+3",3,9,4,"3","blast hazardous","48\""],
  ["Knight Castellan","Titanic feet","C","4",4,8,1,"2","","càc"],
  ["Knight Crusader","Avenger gatling cannon","T","18",3,6,2,"2","","36\""],
  ["Knight Crusader","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Knight Crusader","Icarus autocannons","T","3",3,7,1,"2","anti:2:vol twin","48\""],
  ["Knight Crusader","Ironstorm missile pod","T","D6+1",3,5,0,"1","blast indirect","48\""],
  ["Knight Crusader","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Knight Crusader","Questoris heavy stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Knight Crusader","Rapid-fire battle cannon","T","D6+3",3,10,1,"3","blast rf:D6","72\""],
  ["Knight Crusader","Stormspear rocket pod","T","3",3,8,2,"D6","","48\""],
  ["Knight Crusader","Thermal cannon","T","2D3",3,12,4,"D6","blast melta:6","24\""],
  ["Knight Crusader","Titanic feet","C","4",4,8,1,"2","","càc"],
  ["Knight Defender","Conversion beam obliterator","T","3",3,12,2,"4","sust:D3","36\""],
  ["Knight Defender","Phosphor blaster","T","1",3,5,0,"1","ignorescover rf:1","24\""],
  ["Knight Defender","Twin incendine combustor","T","D6",0,6,1,"1","ignorescover torrent twin","12\""],
  ["Knight Defender","➤ Plasma executor - standard","T","D6+3",3,8,2,"2","blast","36\""],
  ["Knight Defender","➤ Plasma executor - supercharge","T","D6+3",3,9,3,"3","blast hazardous","36\""],
  ["Knight Defender","Titanic feet","C","4",4,8,1,"2","","càc"],
  ["Knight Destrier","Chastiser gatling cannon","T","12",3,6,1,"2","assault","24\""],
  ["Knight Destrier","Frag bombard","T","D6+3",3,7,1,"2","assault blast rf:D6","24\""],
  ["Knight Destrier","Questoris heavy stubber","T","6",3,4,1,"1","assault rf:3","36\""],
  ["Knight Destrier","Titanic feet","C","4",4,7,1,"2","","càc"],
  ["Knight Destrier","➤ Bellatus reaper chainsword - strike","C","5",3,12,3,"D3+3","","càc"],
  ["Knight Destrier","➤ Bellatus reaper chainsword - sweep","C","10",3,8,2,"2","","càc"],
  ["Knight Destrier","➤ Thundershock spear - strike","C","4",3,12,3,"D3+3","lance","càc"],
  ["Knight Destrier","➤ Thundershock spear - sweep","C","8",3,6,3,"2","lance","càc"],
  ["Knight Errant","Icarus autocannons","T","3",3,7,1,"2","anti:2:vol twin","48\""],
  ["Knight Errant","Ironstorm missile pod","T","D6+1",3,5,0,"1","blast indirect","48\""],
  ["Knight Errant","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Knight Errant","Questoris heavy stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Knight Errant","Stormspear rocket pod","T","3",3,8,2,"D6","","48\""],
  ["Knight Errant","Thermal cannon","T","2D3",3,12,4,"D6","blast melta:6","24\""],
  ["Knight Errant","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Knight Errant","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Knight Errant","➤ Thunderstrike gauntlet - strike","C","4",3,20,3,"8","","càc"],
  ["Knight Errant","➤ Thunderstrike gauntlet - sweep","C","8",3,10,2,"3","","càc"],
  ["Knight Gallant","Icarus autocannons","T","3",3,7,1,"2","anti:2:vol twin","48\""],
  ["Knight Gallant","Ironstorm missile pod","T","D6+1",3,5,0,"1","blast indirect","48\""],
  ["Knight Gallant","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Knight Gallant","Questoris heavy stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Knight Gallant","Stormspear rocket pod","T","3",3,8,2,"D6","","48\""],
  ["Knight Gallant","➤ Reaper chainsword - strike","C","6",2,14,4,"6","dev","càc"],
  ["Knight Gallant","➤ Reaper chainsword - sweep","C","18",2,9,3,"2","lethal","càc"],
  ["Knight Gallant","➤ Thunderstrike gauntlet - strike","C","6",2,20,3,"8","dev","càc"],
  ["Knight Gallant","➤ Thunderstrike gauntlet - sweep","C","12",2,10,2,"3","lethal","càc"],
  ["Knight Paladin","Icarus autocannons","T","3",3,7,1,"2","anti:2:vol twin","48\""],
  ["Knight Paladin","Ironstorm missile pod","T","D6+1",3,5,0,"1","blast indirect","48\""],
  ["Knight Paladin","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Knight Paladin","Questoris heavy stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Knight Paladin","Rapid-fire battle cannon","T","D6+3",3,10,1,"3","blast rf:D6","72\""],
  ["Knight Paladin","Stormspear rocket pod","T","3",3,8,2,"D6","","48\""],
  ["Knight Paladin","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Knight Paladin","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Knight Paladin","➤ Thunderstrike gauntlet - strike","C","4",3,20,3,"8","","càc"],
  ["Knight Paladin","➤ Thunderstrike gauntlet - sweep","C","8",3,10,2,"3","","càc"],
  ["Knight Preceptor","Icarus autocannons","T","3",3,7,1,"2","anti:2:vol twin","48\""],
  ["Knight Preceptor","Ironstorm missile pod","T","D6+1",3,5,0,"1","blast indirect","48\""],
  ["Knight Preceptor","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Knight Preceptor","Preceptor multi-laser","T","4",3,6,0,"1","","36\""],
  ["Knight Preceptor","Questoris heavy stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Knight Preceptor","Stormspear rocket pod","T","3",3,8,2,"D6","","48\""],
  ["Knight Preceptor","➤ Las-impulsor - high intensity","T","D6",3,14,3,"4","blast","24\""],
  ["Knight Preceptor","➤ Las-impulsor - low intensity","T","2D6",3,7,1,"2","blast","36\""],
  ["Knight Preceptor","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Knight Preceptor","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Knight Preceptor","➤ Thunderstrike gauntlet - strike","C","4",3,20,3,"8","","càc"],
  ["Knight Preceptor","➤ Thunderstrike gauntlet - sweep","C","8",3,10,2,"3","","càc"],
  ["Knight Valiant","Conflagration cannon","T","3D6",0,8,1,"2","ignorescover torrent","18\""],
  ["Knight Valiant","Shieldbreaker missile launcher","T","1",3,12,6,"D6+1","anti:4 dev","72\""],
  ["Knight Valiant","Thundercoil harpoon","T","D3",3,24,6,"10","blast dev","12\""],
  ["Knight Valiant","Twin meltagun","T","1",3,9,4,"D6","melta:2 twin","12\""],
  ["Knight Valiant","Twin siegebreaker cannon","T","D6",3,6,0,"1","blast twin","36\""],
  ["Knight Valiant","Titanic feet","C","4",4,8,1,"2","","càc"],
  ["Knight Warden","Avenger gatling cannon","T","18",3,6,2,"2","","36\""],
  ["Knight Warden","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Knight Warden","Icarus autocannons","T","3",3,7,1,"2","anti:2:vol twin","48\""],
  ["Knight Warden","Ironstorm missile pod","T","D6+1",3,5,0,"1","blast indirect","48\""],
  ["Knight Warden","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Knight Warden","Questoris heavy stubber","T","3",3,4,1,"1","rf:3","36\""],
  ["Knight Warden","Stormspear rocket pod","T","3",3,8,2,"D6","","48\""],
  ["Knight Warden","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Knight Warden","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Knight Warden","➤ Thunderstrike gauntlet - strike","C","4",3,20,3,"8","","càc"],
  ["Knight Warden","➤ Thunderstrike gauntlet - sweep","C","8",3,10,2,"3","","càc"],
  ["Questoris Knight Magaera","Lightning cannon","T","12",3,9,0,"2","sust:2","48\""],
  ["Questoris Knight Magaera","Phased plasma-fusil","T","2",3,8,3,"2","rf:2","24\""],
  ["Questoris Knight Magaera","Twin rad cleanser","T","D6",0,2,0,"1","torrent ignorescover anti:2:inf twin","12\""],
  ["Questoris Knight Magaera","➤ Hekaton siege claw - strike","C","4",3,20,3,"8","","càc"],
  ["Questoris Knight Magaera","➤ Hekaton siege claw - sweep","C","8",3,10,2,"3","","càc"],
  ["Questoris Knight Magaera","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Questoris Knight Magaera","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"],
  ["Questoris Knight Styrix","Graviton crusher","T","3",3,6,1,"2","anti:2:veh blast","18\""],
  ["Questoris Knight Styrix","Twin rad cleanser","T","D6",0,2,0,"1","torrent ignorescover anti:2:inf twin","12\""],
  ["Questoris Knight Styrix","Volkite chierovile","T","12",3,12,0,"3","dev","30\""],
  ["Questoris Knight Styrix","➤ Hekaton siege claw - strike","C","4",3,20,3,"8","","càc"],
  ["Questoris Knight Styrix","➤ Hekaton siege claw - sweep","C","8",3,10,2,"3","","càc"],
  ["Questoris Knight Styrix","➤ Reaper chainsword - strike","C","4",3,14,4,"6","","càc"],
  ["Questoris Knight Styrix","➤ Reaper chainsword - sweep","C","12",3,9,3,"2","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Acastus Knight Asterius","Véhicule"],
  ["Acastus Knight Porphyrion","Véhicule"],
  ["Armiger Helverin","Véhicule"],
  ["Armiger Moirax","Véhicule"],
  ["Armiger Warglaive","Véhicule"],
  ["Canis Rex","Epic Hero"],
  ["Cerastus Knight Acheron","Personnage"],
  ["Cerastus Knight Atrapos","Personnage"],
  ["Cerastus Knight Castigator","Personnage"],
  ["Cerastus Knight Lancer","Personnage"],
  ["Knight Castellan","Personnage"],
  ["Knight Crusader","Personnage"],
  ["Knight Defender","Personnage"],
  ["Knight Destrier","Personnage"],
  ["Knight Errant","Personnage"],
  ["Knight Gallant","Personnage"],
  ["Knight Paladin","Personnage"],
  ["Knight Preceptor","Personnage"],
  ["Knight Valiant","Personnage"],
  ["Knight Warden","Personnage"],
  ["Questoris Knight Magaera","Personnage"],
  ["Questoris Knight Styrix","Personnage"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Canis Rex": [
  [
   "Chainbreaker",
   "Once per battle, at the start of any phase, you can select one friendly Imperium unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked."
  ],
  [
   "Legendary Freeblade",
   "Once per turn, when you target this model with a stratagem, you may reduce the CP cost of that use of that stratagem by 1CP."
  ],
  [
   "Using Sir Hekhtur",
   "If your Canis Rex model is destroyed, this model is treated as a model disembarking from a destroyed Transport and must perform an Emergency Disembarkation. Sir Hekhtur cannot be selected as the target of any of your Stratagems other than Core Stratagems. Your Canis Rex unit is not considered to be destroyed until Sir Hekhtur is also destroyed."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Armiger Warglaive": [
  [
   "Impetuous Glory",
   "Each time this model makes a charge move, until the end of the turn, add 1 to the Attacks characteristic of this model's reaper chain-cleaver - strike profile, and add 2 to the Attacks characteristic of this model's reaper chain-cleaver - sweep profile."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Gyro-optimised Actuators",
   "ARMIGER unit only. This unit has MOBILE."
  ],
  [
   "Ancestral Overbleed",
   "ARMIGER unit only. When you target this unit with the Fire Overwatch/Heroic Intervention stratagem, that use is -1 CP."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Armiger Helverin": [
  [
   "Suppression Protocols",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding Monsters and Vehicles) hit by one or more of those attacks made with an Armiger autocannon. Until the start of your next turn, that enemy unit is suppressed. While that unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Gyro-optimised Actuators",
   "ARMIGER unit only. This unit has MOBILE."
  ],
  [
   "Ancestral Overbleed",
   "ARMIGER unit only. When you target this unit with the Fire Overwatch/Heroic Intervention stratagem, that use is -1 CP."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Paladin": [
  [
   "Paladin’s Duty (Bondsman)",
   "While a model is affected by this ability, weapons equipped by that model have the [LETHAL HITS] ability, and melee weapons equipped by that model have the [LANCE] ability."
  ],
  [
   "Seasoned Noble",
   "Each time this model makes a ranged attack that targets the closest eligible target, improve the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Errant": [
  [
   "Errant's Duty (Bondsman)",
   "While a model is affected by this ability, you can re-roll Advance rolls made for that model and ranged weapons equipped by that model have the [ASSAULT] ability."
  ],
  [
   "Aggressive Assault",
   "Each time this model makes a ranged attack that targets the closest eligible target, add 1 to the Hit roll."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Gallant": [
  [
   "Gallant's Duty (Bondsman)",
   "While a model is affected by this ability, you can re-roll Charge rolls made for that model and each time that model makes a melee attack, you can re-roll the Hit roll."
  ],
  [
   "Martial Pride",
   "Each time this unit Consolidates, models in it can move an additional 3\" provided your unit can end that move within Engagement Range of one or more enemy units."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Warden": [
  [
   "Warden's Duty (Bondsman)",
   "While a model is affected by this ability, weapons equipped by that model have the [SUSTAINED HITS 1] ability, and ranged weapons equipped by that model have the [IGNORES COVER] ability."
  ],
  [
   "Thin Their Ranks",
   "Each time this model makes a ranged attack that targets an enemy unit (excluding Monsters and Vehicles), that attack has the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Crusader": [
  [
   "Crusader's Duty (Bondsman)",
   "While a model is affected by this ability, each time that model makes a ranged attack, add 1 to the Hit roll."
  ],
  [
   "Punishing Salvoes",
   "In your Movement phase, if this model Remains Stationary, until the end of the turn, ranged weapons equipped by this model have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Preceptor": [
  [
   "Mentor (Bondsman)",
   "Each time a model affected by this ability makes an attack that targets this model's quarry, you can re-roll the Wound roll."
  ],
  [
   "Exemplar of the Code",
   "At the start of the battle, select one unit from your opponent’s army to be this model's quarry. Each time this model makes an attack that targets its quarry, you can re-roll the Wound roll. Each time this model's quarry is destroyed, you can select a new unit from your opponent's army to be its quarry."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Castellan": [
  [
   "Titan Hunter",
   "Each time a ranged attack made by this model is allocated to a Monster or Vehicle model, you can re-roll the Damage roll."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Ion Aegis (Aura)",
   "While a friendly Armiger model is within 6\" of this model, each time a ranged attack targets that model, it has the Benefit of Cover against that attack."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Valiant": [
  [
   "Thundershock",
   "In your Shooting phase, each time you select a target for this model's thundercoil harpoon, roll one D6 for the target unit and one D6 for each other enemy unit within 6\" of the target unit. On a 4+, the unit being rolled for is struck by arcing energies; after resolving all of this model's attacks against the target unit, each unit struck by arcing energies suffers D3 mortal wounds."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Ion Aegis (Aura)",
   "While a friendly Armiger model is within 6\" of this model, each time a ranged attack targets that model, it has the Benefit of Cover against that attack."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Acastus Knight Asterius": [
  [
   "Sunderer of Fortresses",
   "Each time this model makes an attack that targets a VEHICLE, improve the Strength and Damage characteristics of that attack by 1. If that attack targets a FORTIFICATION, improve the Strength and Damage characteristics of that attack by 2 instead."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Acastus Knight Porphyrion": [
  [
   "Bastion of Firepower",
   "Each time this model Remains Stationary, until the end of the turn, ranged weapons equipped by this model have the [LETHAL HITS] ability."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Cerastus Knight Lancer": [
  [
   "Lancer’s Duty (Bondsman)",
   "While a model is affected by this ability, it is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Shock Charge",
   "You can target this model with the Tank Shock Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this phase."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Cerastus Knight Castigator": [
  [
   "Castigator’s Duty (Bondsman)",
   "While a model is affected by this ability, its ranged weapons have the [SUSTAINED HITS 1] ability and the Armour Penetration characteristic of its ranged weapons is improved by 1."
  ],
  [
   "Storm of Bolts",
   "In your Shooting phase, after this model has shot, select one unit (excluding MONSTERS and VEHICLES) hit by one or more of those attacks. Until the start of your next turn, while this model is on the battlefield, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Cerastus Knight Acheron": [
  [
   "Acheron’s Duty (Bondsman)",
   "While a model is affected by this ability, at the start of the Fight phase, each enemy unit within Engagement Range of one or more units with this ability must take a Battle-shock test, subtracting 1 from the result when they do."
  ],
  [
   "Searing Flames",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks made with an Acheron flame cannon. Until the end of the phase, that enemy unit cannot have the Benefit of Cover."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Cerastus Knight Atrapos": [
  [
   "Atrapos’ Duty (Bondsman)",
   "While a model is affected by this ability, each time that model makes an attack that targets a TITANIC or TOWERING model, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Macro-extinction Protocols",
   "Each time this model makes an attack that targets a MONSTER or VEHICLE unit, add 1 to the Hit roll. If that target is TITANIC or TOWERING, add 1 to the Wound roll as well."
  ],
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Questoris Knight Magaera": [
  [
   "Magaera’s Duty (Bondsman)",
   "While a model is affected by this ability, each time that model makes a ranged attack that targets the closest eligible target, improve the Strength and Armour Penetration characteristics of that attack by 1."
  ],
  [
   "Repair Auto-simulacra",
   "At the end of your Command phase, this model regains up to D3 lost wounds."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Questoris Knight Styrix": [
  [
   "Styrix’s Duty (Bondsman)",
   "While a model is affected by this ability, each time that model is selected to shoot or fight, after it has resolved all of its attacks, select one enemy unit hit by one or more of those attacks; that unit must take a Battle-shock test, subtracting one from the test when doing so."
  ],
  [
   "Grav-pinned",
   "In your Shooting phase, after this model has shot, if an enemy INFANTRY unit was hit by one or more of those attacks made with a graviton crusher, until the end of your opponent’s next turn, that enemy unit is grav-pinned. While a unit is grav-pinned, subtract 2 from that unit’s Move characteristic and subtract 2 from Charge rolls made for that unit."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Armiger Moirax": [
  [
   "Protection Protocols",
   "You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, subtract 3 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Gyro-optimised Actuators",
   "ARMIGER unit only. This unit has MOBILE."
  ],
  [
   "Ancestral Overbleed",
   "ARMIGER unit only. When you target this unit with the Fire Overwatch/Heroic Intervention stratagem, that use is -1 CP."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Defender": [
  [
   "Warden's Duty (Bondsman)",
   "While a model is affected by this ability, each time an attack is allocated to that model, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Selfless Protector",
   "Each time a ranged attack is allocated to an Imperial Knights model from your army, if that model is not fully visible to every model in the attacking unit because of this Knight Defender model, that model has the Benefit of Cover and a 4+ invulnerable save against that attack."
  ],
  [
   "Damaged: 1-9 Wounds Remaining",
   "While this model has 1-9 wounds remaining, subtract 5 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Bondsman",
   "Some Imperial Knights models have a Bondsman ability, tagged with the word ‘Bondsman’. In your Command phase, one or more models from your army with a Bondsman ability can use that ability. For each one that does, select one friendly Armiger model within 12\" of that model (you cannot select an Armiger model that is already being affected by a Bondsman ability). Until the start of your next Command phase, that Armiger model is affected by that Bondsman ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ],
 "Knight Destrier": [
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, subtract 4 from this model's Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Thundercharge",
   "If this model is equipped with a thundershock spear and a bellatus reaper chainsword, add 2 to the Attacks characteristic of melee weapons equipped by this model."
  ],
  [
   "Ram Jets",
   "Each time this unit is selected to make a Normal or Advance move, until the end of the phase, add D3\" to the Move characteristic of this model."
  ],
  [
   "Saturation Fire",
   "Each time this model makes a ranged attack that targets a unit within range of one or more objective markers, that attack has the [IGNORES COVER] ability."
  ],
  [
   "Code Chivalric",
   "If your Army Faction is Imperial Knights, at the end of the Read Mission Objectives step, you must determine your army's Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part.\n\nTo determine your army's Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table. The selected Deed will describe what needs to be achieved in order to complete that Deed.\n\nTo determine your army's Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability.\n\nThe first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1)."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Dominus Foebreakers",1,"","Rain of Devastation","Friendly IMPERIAL KNIGHTS DOMINUS units’ attacks that target a unit in a terrain area have +1 to hit rolls.","",0,"","Priority Assets"],
  ["Freeblade Company",3,"","Knights of Legend","Imperial Knights models from your army have the Feel No Pain 6+ ability. In addition, at the start of your Command phase, each IMPERIAL KNIGHTS model from your army regains 1 lost wound.","",0,"","Priority Assets"],
  ["Gate Warden Lance",2,"","Dauntless Defenders","At the start of the first battle round, select two objectives to be your foundations. Place a circular 40mm foundation marker in each one. When you draw a line from any part of one your foundation markers to any part of the other, if any part of a model’s base (or any part of a model’s hull, for a model without a base) crosses that line, that model’s unit is said to be on your defensive line. While an IMPERIAL KNIGHTS unit from your army is on your defensive line, that unit has the following ability: Against the Horde: Each time a model in this unit makes an attack that targets a visible enemy unit, you can ignore any or all modifiers to the Hit roll, and weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.","",0,"","Take and Hold"],
  ["Questor Forgepact",1,"","Cogbound Alliance","Friendly IMPERIAL KNIGHTS models have the following ability: Assisted Targeting (Aura): While a friendly ADEPTUS MECHANICUS unit is within 6\" of this model, that ADEPTUS MECHANICUS unit’s ranged attacks have: ▪ +1 BS. ▪ [HEAVY]. Friendly Tech-Priest models have the following ability: Sacristan Pledge: In your Command phase, you can select one friendly IMPERIAL KNIGHTS model within 3\" of this model that has not been selected by this ability this phase. If you do, that model heals D3 wounds. Mechanicus Allies: You can include Tech-Priest Dominus/Tech-Priest Manipulus/MARSHAL/RANGERS/VANGUARD units in your army. The combined points value of such units cannot exceed 500 points.","",0,"","Disruption"],
  ["Questoris Companions",3,"","Heroes of Legend / Valour’s Reward","At the start of your turn, if your current Oath is fulfilled, determine an additional Oath as described here, with the exception that you cannot select a Deed or Quality you have already selected (if you are randomly selecting the Deed and/or Quality and roll any result that you have already selected, select a Deed or Quality you have not already selected instead). If you cannot determine an additional Oath because you have already selected each Deed and each Quality, do not determine an additional Oath. The Qualities from Oaths you have fulfilled continue to apply to all models in your army with the Code Chivalric ability. When the Deed for an additional Oath is completed, you instead gain 1CP, regardless of how you selected the Deed or Quality. The Enhancements shown below can become expended. You cannot use such Enhancements while they are expended. Each time you fulfil your Oath, each expended Enhancement is no longer expended.","",0,"","Take and Hold"],
  ["Spearhead-at-Arms",2,"Armigers","Knightly Teachings","Each time a model from your army uses its Bondsman ability, if no other model from your army has used that Bondsman ability that turn, you can select up to three friendly Armiger models (instead of one) within 12\" of that model, or within 15\" of that model while your army is Honoured (you still cannot select a model that is already being affected by a Bondsman ability). Until the start of your next Command phase, those models are affected by that Bondsman ability. KEYWORDS ARMIGER models from your army gain the BATTLELINE keyword.","",0,"","Reconnaissance"],
  ["Throne-Bonded Outriders",1,"Armigers","Driven from Their Lairs","While a friendly ARMIGER unit is affected by a Bondsman ability, that unit’s ranged attacks have [IGNORES COVER]. This detachment has the ARMIGERS tag and cannot be taken with another ARMIGERS detachment.","",0,"","Reconnaissance"],
  ["Valourstrike Lance",2,"","Bold Gallantry","Each time an Imperial Knights unit from your army Advances, until the end of the turn, ranged weapons equipped by IMPERIAL KNIGHTS models from your army have the [ASSAULT] ability.","",0,"","Purge the Foe"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Archeotech Autoloaders",25,"Dominus Foebreakers","IMPERIAL KNIGHTS DOMINUS model only. This unit can re-roll rolls to determine the A of a weapon.",null],
  ["Blessed Plate",30,"Dominus Foebreakers","IMPERIAL KNIGHTS DOMINUS model only. This model has +1 T.",null],
  ["Bringer of Justice",30,"Freeblade Company","Imperial Knights model only. Improve the Attacks characteristic of melee weapons equipped by the bearer by 2, and each time the bearer makes a melee attack, add 1 to the Hit roll.",null],
  ["Hunter’s Eye",25,"Freeblade Company","Imperial Knights model only. Ranged weapons equipped by the bearer have the [IGNORES COVER] ability.",null],
  ["Mysterious Guardian",35,"Freeblade Company","Imperial Knights model only. (Once per battle, per army) At the end of your opponent’s turn, if this unit is unengaged, you can use this ability. If you do:\n- Place this unit in strategic reserves.\n- This unit has Deep Strike until the start of your next Shooting phase.\n- This unit must make an ingress move in your next Movement phase (including in your first turn).",null],
  ["Sanctuary",20,"Freeblade Company","Imperial Knights model only. The bearer has a 5+ invulnerable save.",null],
  ["Acquisitor-at-Arms",15,"Gate Warden Lance","Imperial Knights model only. While the bearer is on your defensive line and there are no enemy units on your defensive line, add the bearer's Objective Control characteristic to that of each model affected by the bearer's Bondsman ability.",null],
  ["Augury Halo",20,"Gate Warden Lance","Imperial Knights model only. Each time the bearer makes a ranged attack, while the bearer is on your defensive line, weapons equipped by the bearer have the [IGNORES COVER] ability.",null],
  ["Purgation’s Hand",20,"Gate Warden Lance","Imperial Knights model only. Each time the bearer makes a melee attack, if the bearer is on your defensive line, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",null],
  ["Vengeful Tread",15,"Gate Warden Lance","Imperial Knights model only. Once per turn, you can target the bearer with the Tank Shock Stratagem for 0CP.",null],
  ["Knight of the Opus Machina (Aura)",15,"Questor Forgepact","IMPERIAL KNIGHTS model only. While a friendly ADEPTUS MECHANICUS unit is within 6\" of this model, that ADEPTUS MECHANICUS unit’s melee attacks have +1 WS and AP.",null],
  ["Magos Questoris",20,"Questor Forgepact","TECH-PRIEST model only. When using this model’s Sacristan Pledge ability, the selected IMPERIAL KNIGHTS model heals 2 additional wounds.",null],
  ["Crushing Condemnation",10,"Questoris Companions","Imperial Knights model only. When the bearer is selected to fight, after resolving its attacks, if one or more enemy units were destroyed by those attacks, the bearer can use this Enhancement. If it does, this Enhancement is expended, then select one enemy unit that is not within Engagement Range of any units from your army and is within 12\" of and visible to the bearer. Roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",null],
  ["Herald of Triumph",15,"Questoris Companions","Imperial Knights model only. When the bearer ends a Charge move, it can use this Enhancement. If it does, this Enhancement is expended, the each enemy unit within Engagement Range of the bearer must take a Battle-shock test, subtracting 1 from the result.",null],
  ["Pennant of Silvered Fury",15,"Questoris Companions","Imperial Knights model only. When the bearer is selected to fight, it can use this Enhancement. If it does, this Enhancement is expended, then until the end of the phase, melee equipped by the bearer have the [SUSTAINED HITS 2] ability.",null],
  ["Wyrmslayer Divination",10,"Questoris Companions","Imperial Knights model only. In your Shooting phase, when the bearer is selected to shoot, it can use this Enhancement. If it does, this Enhancement is expended, then until the end of the phase, each time it makes an attack that targets a unit that can Fly, you can re-roll the Hit roll.",null],
  ["Fables of Nightmare",10,"Spearhead-at-Arms","Imperial Knights model only. While two or more Armiger models are under the effects of the bearer's Bondsman ability, melee weapons equipped by those Armiger models have the [PRECISION] ability.",null],
  ["Martial Tuition",15,"Spearhead-at-Arms","Imperial Knights model only. While two or more Armiger models are under the effects of the bearer's Bondsman ability, once per turn, you can target one of those Armiger models with the Counter-offensive Stratagem for 0CP.",null],
  ["Mentor’s Pride",20,"Spearhead-at-Arms","Imperial Knights model only. While two or more Armiger models are under the effects of the bearer's Bondsman ability, each time each of those Armiger models makes an attack, you can re-roll a Hit roll of 1.",null],
  ["Tales of Heroism",10,"Spearhead-at-Arms","Imperial Knights model only. While two or more Armiger models are under the effects of the bearer's Bondsman ability, each time one of those Armiger models makes a melee attack, you can ignore any or all modifiers to the Hit roll and/or the Wound roll.",null],
  ["Ancestral Overbleed (Upgrade)",10,"Throne-Bonded Outriders","ARMIGER unit only. When you target this unit with the Fire Overwatch/Heroic Intervention stratagem, that use is -1 CP.",null],
  ["Gyro-optimised Actuators (Upgrade)",15,"Throne-Bonded Outriders","ARMIGER unit only. This unit has MOBILE.",null],
  ["Bearer of the Evanescent Ion",15,"Valourstrike Lance","Imperial Knights model only. At the end of your Movement phase, select one other Imperial Knights model from your army that is within 12\" of and visible to the bearer. Until the start of your next Movement phase, that selected model has the Stealth ability.",null],
  ["Bearer of the Iron Chalice",20,"Valourstrike Lance","Imperial Knights model only. At the end of your Movement phase, select one other Imperial Knights model from your army that is within 12\" of and visible to the bearer. That selected model regains up to D3 lost wounds, or up to 3 lost wounds if your army is Honoured.",null],
  ["Bearer of the Judicant’s Helm",25,"Valourstrike Lance","Imperial Knights model only. At the start of your Shooting phase, select one other Imperial Knights model from your army that is within 12\" of and visible to the bearer. Until the end of the phase, ranged weapons equipped by that selected model have the [IGNORES COVER] ability.",null],
  ["Bearer of the Lancer’s Sigil",25,"Valourstrike Lance","Imperial Knights model only. At the start of your Charge phase, select one other Imperial Knights model from your army that is within 12\" of and visible to the bearer. Until the end of the phase, you can re-roll Charge rolls made for that selected model.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Fire Shocked","Dominus Foebreakers","",1,"Your Shooting phase, when a friendly IMPERIAL KNIGHTS DOMINUS unit has shot.","That IMPERIAL KNIGHTS DOMINUS unit.","Select one enemy unit hit by those attacks. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll.",""],
  ["Foebreaker Firestorm","Dominus Foebreakers","",1,"Your Shooting phase, when a friendly engaged IMPERIAL KNIGHTS DOMINUS unit is selected to shoot.","That IMPERIAL KNIGHTS DOMINUS unit.","Your unit’s [BLAST] ranged attacks: ▪ Do not have [BLAST]. ▪ Have +1 A.",""],
  ["Ground-Shaking Strides","Dominus Foebreakers","",1,"Your Movement phase, when a friendly IMPERIAL KNIGHTS DOMINUS unit is selected to move.","That IMPERIAL KNIGHTS DOMINUS unit.","Your unit has +2\" M.",""],
  ["Flanking Manoeuvres","Freeblade Company","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Armiger unit from your army that is within 9\" of one or more battlefield edges and not within Engagement Range of one or more enemy units.","Remove your unit from the battlefield and place it into Strategic Reserves.",""],
  ["Full Tilt","Freeblade Company","Équipement",1,"Your Movement phase.","One Imperial Knights unit from your army.","Until the end of the phase, if your unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in your unit, or 9\" instead if your unit is an Armiger or Destrier unit.",""],
  ["Noble Sacrifice","Freeblade Company","Fait Épique",1,"Any phase.","One Imperial Knights unit from your army that was just destroyed. You can target that unit with this Stratagem even though it was just destroyed.","Your unit’s Deadly Demise ability inflicts mortal wounds on a D6 roll of 4+, adding 1 to the result if it is an Armiger unit, instead of only a 6.",""],
  ["Point-Blank Barrage","Freeblade Company","Ruse Stratégique",1,"Your Shooting phase.","One Imperial Knights unit from your army that has not been selected to shoot this phase.","Until the end of the phase, when making ranged attacks with Blast weapons, models in your unit can target enemy units within Engagement Range of your unit (provided no other friendly units are also within Engagement Range of that enemy unit). In addition, until the end of the phase, your unit does not suffer the penalty to its Hit rolls for being within Engagement Range of one or more enemy units, but each time a model in your unit makes an attack with a Blast weapon that targets a unit within Engagement Range of your unit, on an unmodified Hit roll of 1, your unit suffers 1 mortal wound after all of its attacks have been resolved.",""],
  ["Strength from Exile","Freeblade Company","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Imperial Knights unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, if there are no other friendly units within 9\" of your unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",""],
  ["Survivor of Strife","Freeblade Company","Fait Épique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Imperial Knights unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of your unit, subtract 1 from the Wound roll.",""],
  ["Drive Them Out!","Gate Warden Lance","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Imperial Knights unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets an enemy unit on your defensive line, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Fortress of Intimidation","Gate Warden Lance","Fait Épique",1,"Start of your opponent’s Charge phase.","One Imperial Knights Titanic unit from your army that is on your defensive line.","Until the end of the phase, each time an enemy unit selects your unit as a target of a charge, that unit must take a Battle-shock test, subtracting 1 from the result.",""],
  ["Lancebreaker","Gate Warden Lance","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Imperial Knights unit from your army that was selected as the target of one or more of the attacking unit’s attacks and is on your defensive line.","Until the end of the phase, each time an attack targets your unit, if the Strength characteristic of that attack is greaterthan the Toughness characteristic of your unit, subtract 1 from the Wound roll",""],
  ["Marshal the Defence","Gate Warden Lance","Tactique de Bataille",1,"Your Movement phase.","Up to two Imperial Knights units from your army that have not been selected to move this phase.","Until the end of the phase, add 3\" to the Move characteristic of models in your units.",""],
  ["Steadfast Superiority","Gate Warden Lance","Tactique de Bataille",1,"Fight phase.","One Imperial Knights unit from your army that is within Engagement Range of one or more enemy units, that is on your defensive line and that has not already been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, you can re-roll the Hit roll.",""],
  ["Titanic Bombardment","Gate Warden Lance","Tactique de Bataille",1,"Your Shooting phase.","One Imperial Knights Titanic unit from your army that Remained Stationary this turn, that is on your defensive line and that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [SUSTAINED HITS 2] ability.",""],
  ["In the Shadow of Giants","Questor Forgepact","",1,"Your Movement phase, when a friendly ADEPTUS MECHANICUS unit is selected to make an advance/fall-back move.","That ADEPTUS MECHANICUS unit.","That move does not prevent your unit from being eligible to start an action.",""],
  ["Omnissiah’s Grace","Questor Forgepact","",1,"Any phase, when a friendly IMPERIAL KNIGHTS unit suffers a mortal wound.","That IMPERIAL KNIGHTS unit.","Your unit has Feel No Pain 5+ against mortal wounds.",""],
  ["Vengeance of the Machine Cult","Questor Forgepact","",1,"Any phase, when a friendly IMPERIAL KNIGHTS TITANIC unit is destroyed by an enemy unit.","One friendly ADEPTUS MECHANICUS unit.","That enemy unit is marked until the end of the battle: ▪ While a unit is marked, friendly ADEPTUS MECHANICUS units’ attacks that target that unit can re-roll wound rolls.",""],
  ["Courageous Stand","Questoris Companions","Fait Épique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Imperial Knights Titanic unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 6+ ability.",""],
  ["Driven by the Past","Questoris Companions","Fait Épique",1,"Your Charge phase.","One Imperial Knights Titanic unit from your army.","Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Hero’s Tread","Questoris Companions","Fait Épique",1,"End of your Command phase.","One Imperial Knights Titanic model from your army that is within range of an objective marker you control.","Your Level of Control over that objective marker is 5 (unless it would otherwise be higher), until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Moment of Glory","Questoris Companions","Fait Épique",1,"Fight phase, just before an Imperial Knights Titanic unit from your army Consolidates.","That IMPERIAL KNIGHTS TITANIC unit.","Until the end of the phase, each time your unit Consolidates, models in it can move an additional 3\" provided your unit can end that move within Engagement Range of one or more enemy units.",""],
  ["Titanic Duel","Questoris Companions","Fait Épique",1,"Your Shooting phase or the Fight phase.","One Imperial Knights Titanic model from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time your model makes an attack that targets a MONSTER, TITANIC or WALKER unit, add 1 to the Hit roll and add 1 to the Wound roll.",""],
  ["Unstoppable Warrior","Questoris Companions","Fait Épique",2,"Your Movement phase, just after an Imperial Knights Titanic unit from your army Falls Back.","That IMPERIAL KNIGHTS TITANIC unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Exemplar’s Wisdom","Spearhead-at-Arms","Tactique de Bataille",1,"Your Shooting phase, just after an Imperial Knights Titanic model from your army has shot.","That IMPERIAL KNIGHTS TITANIC model, and one or more friendly Armiger models affected by that model’s Bondsman ability.","Select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time one of your ARMIGER models makes an attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1.",""],
  ["Let Duty Be Your Shield","Spearhead-at-Arms","Fait Épique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Armiger unit from your army that was selected as the target of one or more of the attacking units attacks.","Until the end of the phase, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Mantle of the Mentor","Spearhead-at-Arms","Ruse Stratégique",1,"Start of your Shooting phase.","One Armiger model from your army, or one Imperial Knights Titanic model from your army, and one or more friendly ARMIGER models affected by that model’s Bondsman ability.","Until the end of the phase, your ARMIGER models are eligible to shoot in a turn in which they Fell Back.",""],
  ["Squires Ofthe Hunt","Spearhead-at-Arms","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Armiger model from your army, or one Imperial Knights Titanic model from your army, and one or more friendly ARMIGER models affected by that model’s Bondsman ability.","For each of your ARMIGER models that is within 9\" of one or more battlefield edges and not within Engagement Range of one or more enemy units, remove that ARMIGER model from the battlefield and place it into Strategic Reserves.",""],
  ["Thin Their Ranks","Spearhead-at-Arms","Tactique de Bataille",1,"Start of your Shooting phase.","One Armiger model from your army, or one Imperial Knights Titanic model from your army, and one or more friendly ARMIGER models affected by that model’s Bondsman ability.","Until the end of the phase, ranged weapons equipped by your ARMIGER models have the [RAPID FIRE 1] ability.",""],
  ["Virtue of Courage","Spearhead-at-Arms","Tactique de Bataille",1,"Start of the Fight phase.","One Armiger model from your army, or one Imperial Knights Titanic model from your army, and one or more friendly ARMIGER models affected by that model’s Bondsman ability.","Select one enemy unit. Until the end of the phase, each time one of your ARMIGER models makes an attack that targets that enemy unit, add 1 to the Hit roll.",""],
  ["Helm Conditioning","Throne-Bonded Outriders","",1,"Your Command phase, when a friendly IMPERIAL KNIGHTS unit uses a Bondsman ability.","That IMPERIAL KNIGHTS unit.","When selecting an ARMIGER model for that Bondsman ability, you can select one within 18\" of your unit (excluding models already affected by a Bondsman ability).",""],
  ["Honoured to Serve","Throne-Bonded Outriders","",1,"Your Shooting phase, when a friendly ARMIGER unit has shot.","That ARMIGER unit.","Those attacks do not prevent your unit from being eligible to start an action.",""],
  ["Neural Lash","Throne-Bonded Outriders","",1,"Command phase.","One friendly IMPERIAL KNIGHTS TITANIC unit.","Select one friendly battle-shocked ARMIGER unit within 12\" of your unit. That ARMIGER unit is no longer battle-shocked.",""],
  ["Full Tilt","Valourstrike Lance","Tactique de Bataille",2,"Your Movement phase.","One Imperial Knights unit from your army that has not been selected to move this phase.","Until the end of the phase, add 2\" to the Move characteristic of your models and add 2 to Advance rolls made for those model’s units.",""],
  ["Rotate Ion Shields","Valourstrike Lance","Équipement",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Imperial Knights unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a 4+ invulnerable save.",""],
  ["Run Them Through!","Valourstrike Lance","Ruse Stratégique",1,"Fight phase.","One Imperial Knights unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by your models have the [LANCE] ability.",""],
  ["Tactical Foil","Valourstrike Lance","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Imperial Knights model from your army that is within 8\" of that unit.","Your model can make a Normal move of up to D6\".",""],
  ["Thunderstomp","Valourstrike Lance","Tactique de Bataille",1,"Fight phase.","One Imperial Knights model from your army that has not been selected to fight this phase.","Until the end of the phase, the Attacks characteristic of any armoured Feet melee weapons equipped by your model is 8, the Attacks characteristic of any titanic Feet melee weapons equipped by your model is 12, and improve the Armour Penetration characteristic of those weapons by 1.",""],
  ["Vow of Retribution","Valourstrike Lance","Ruse Stratégique",1,"Your Shooting phase.","One Imperial Knights unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by your models have the [LETHAL HITS] ability.",""],
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
  "Acastus Knight Asterius",
  "Acastus Knight Porphyrion",
  "Armiger Helverin",
  "Armiger Moirax",
  "Armiger Warglaive"
 ],
 "monster": [],
 "battleline": [],
 "epic": [
  "Canis Rex"
 ],
 "infantry": [],
 "character": [
  "Cerastus Knight Acheron",
  "Cerastus Knight Atrapos",
  "Cerastus Knight Castigator",
  "Cerastus Knight Lancer",
  "Knight Castellan",
  "Knight Crusader",
  "Knight Defender",
  "Knight Destrier",
  "Knight Errant",
  "Knight Gallant",
  "Knight Paladin",
  "Knight Preceptor",
  "Knight Valiant",
  "Knight Warden",
  "Questoris Knight Magaera",
  "Questoris Knight Styrix"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Canis Rex": "170x109",
 "Armiger Warglaive": "100",
 "Armiger Helverin": "100",
 "Knight Paladin": "170x109",
 "Knight Errant": "170x109",
 "Knight Gallant": "170x109",
 "Knight Warden": "170x109",
 "Knight Crusader": "170x109",
 "Knight Preceptor": "170x109",
 "Knight Castellan": "170x109",
 "Knight Valiant": "170x109",
 "Acastus Knight Asterius": "coque",
 "Acastus Knight Porphyrion": "coque",
 "Cerastus Knight Lancer": "170x109",
 "Cerastus Knight Castigator": "170x109",
 "Cerastus Knight Acheron": "170x109",
 "Cerastus Knight Atrapos": "170x109",
 "Questoris Knight Magaera": "170x109",
 "Questoris Knight Styrix": "170x109",
 "Armiger Moirax": "100",
 "Knight Defender": "170x109",
 "Knight Destrier": "150x95"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Canis Rex": 9,
 "Armiger Warglaive": 5,
 "Armiger Helverin": 5,
 "Knight Paladin": 9,
 "Knight Errant": 9,
 "Knight Gallant": 9,
 "Knight Warden": 9,
 "Knight Crusader": 9,
 "Knight Preceptor": 9,
 "Knight Castellan": 10,
 "Knight Valiant": 10,
 "Acastus Knight Asterius": 10,
 "Acastus Knight Porphyrion": 10,
 "Cerastus Knight Lancer": 10,
 "Cerastus Knight Castigator": 10,
 "Cerastus Knight Acheron": 10,
 "Cerastus Knight Atrapos": 10,
 "Questoris Knight Magaera": 9,
 "Questoris Knight Styrix": 9,
 "Armiger Moirax": 5,
 "Knight Defender": 9,
 "Knight Destrier": 6
};

const TRANSPORTS = {};
const FACTION = [
 [
  "Code Chivalric",
  "If your Army Faction is IMPERIAL KNIGHTS, at the end of the Read Mission Objectives step, you must determine your army’s Oath for the coming battle. An Oath consists of two parts - one Deed and one Quality. There are three options for each part, shown below. To determine your army’s Deed, you can either select one Deed or you can randomly select one Deed by rolling a D6 and consulting the relevant table below. The selected Deed will describe what needs to be achieved in order to complete that Deed. To determine your army’s Quality, you can either select one Quality or you can randomly select one Quality by rolling a D6 and consulting the relevant table below. Until the end of the battle, the ability described in the Quality selected applies to all models in your army with this ability. The first time your selected Deed is completed your Oath is fulfilled and, until the end of the battle, your army becomes Honoured and you gain 2CP, or 3CP if you randomly selected your Deed and/or Quality (CP gained in this way are an exemption to the Core Rules that limit the maximum number of CP you can gain per battle round to 1). Deed D6We vow to lay low the tyrant... At the start of the battle, select one CHARACTER model in your opponent’s army. This Deed is completed at the end of a turn if that CHARACTER is destroyed. We swear to reclaim the realm... This deed is completed at the end of your opponent’s turn if you control more objective markers than your opponent. We pledge to reap a great tally... This deed is completed at the end of the battle round if the number of enemy units destroyed this battle round is greater than the battle round number even if those units are subsequently returned to the battlefield (for example, two destroyed enemy units in the first battle round). Quality D6...with our martial valour risen over all. Each time this model is selected to shoot or fight, you can re-roll one Hit roll and you can re-roll one Wound roll. ...and we are eager for the challenge. Add 2\" to this model’s Move characteristic and add 1 to Advance and Charge rolls made for this model. ...yet shall our legacy be unsullied. Improve this model’s Objective Control characteristic by 2 and its Leadership characteristic by 1."
 ],
 [
  "Super-heavy Walker",
  "Each time a model with this ability makes a Normal, Advance or Fall Back move, it can move through models (excluding TITANIC models) and sections of terrain features that are 4\" or less in height. When doing so: ▪ It can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them. ▪ It can also move through sections of terrain features that are more than 4\" in height, but if it does, after it has moved, roll one D6: on a 1, that model is Battle-shocked."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/chevaliers.json —
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
  cle : "chevaliers",
  nom : "Chevaliers Impériaux",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
