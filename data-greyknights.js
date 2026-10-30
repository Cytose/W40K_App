/* ============================================================
   Données Grey Knights — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py greyknights

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
     26 fiches sur 31 en ont un. Les autres — des Legends, que le
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
  ["Brother-Captain",5,6,2,4,6,[1],{"1": 100},0,"Meneur",0,"",1,"6+"],
  ["Brother-Captain Stern",5,5,2,4,6,[1],{"1": 90},0,"Meneur",1,"",1,"6+"],
  ["Brotherhood Champion",6,5,2,4,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Brotherhood Chaplain",5,6,2,4,5,[1],{"1": 70},0,"Meneur",0,"",1,"5+"],
  ["Brotherhood Librarian",5,6,2,4,5,[1],[[1, {"1": 95}], [2, {"1": 105}]],0,"Meneur",0,"",1,"6+"],
  ["Brotherhood Techmarine",6,5,2,0,4,[1],{"1": 75},0,"Meneur",0,"",1,"6+"],
  ["Brotherhood Terminator Squad",5,6,2,4,3,[4, 5, 8, 10],{"4": 150, "5": 185, "8": 315, "10": 380},0,"",0,"",2,"6+"],
  ["Castellan Crowe",6,5,2,4,5,[1],{"1": 105},0,"Meneur",0,"",1,"6+"],
  ["Grand Master",5,6,2,4,7,[1],{"1": 100},0,"Meneur",0,"",1,"6+"],
  ["Grand Master Voldus",5,6,2,4,7,[1],{"1": 130},0,"Meneur",0,"",1,"6+"],
  ["Grand Master in Nemesis Dreadknight",8,9,2,4,13,[1],[[1, {"1": 210}], [3, {"1": 225}]],0,"",0,"",4,"6+"],
  ["Grey Knights Dreadnought",6,9,2,0,8,[1],{"1": 160},0,"",1,"",3,"6+"],
  ["Grey Knights Relic Razorback",12,9,3,0,10,[1],{"1": 95},0,"",1,"",2,"6+"],
  ["Grey Knights Thunderhawk Gunship",20,12,2,0,30,[1],[[1, {"1": 805}], [2, {"1": 855}]],0,"",0,"",0,"6+"],
  ["Interceptor Squad",12,5,2,0,2,[5, 10],[[1, {"5": 135, "10": 270}], [3, {"5": 145, "10": 280}]],0,"",0,"",1,"6+"],
  ["Kaldor Draigo",5,5,2,4,7,[1],{"1": 125},0,"Meneur",1,"",1,"6+"],
  ["Land Raider",10,12,2,0,16,[1],[[1, {"1": 220}], [3, {"1": 240}]],0,"",0,"",5,"6+"],
  ["Land Raider Crusader",12,12,2,0,16,[1],[[1, {"1": 220}], [3, {"1": 240}]],0,"",0,"",5,"6+"],
  ["Land Raider Redeemer",12,12,2,0,16,[1],[[1, {"1": 260}], [3, {"1": 280}]],0,"",0,"",5,"6+"],
  ["Nemesis Dreadknight",8,9,2,4,13,[1],[[1, {"1": 205}], [3, {"1": 220}]],0,"",0,"",4,"6+"],
  ["Paladin Squad",5,6,2,4,3,[4, 5, 8, 10],[[1, {"4": 185, "5": 230, "8": 385, "10": 490}], [3, {"4": 225, "5": 270, "8": 425, "10": 530}]],0,"",0,"",1,"6+"],
  ["Purgation Squad",6,5,2,0,2,[5, 10],[[1, {"5": 115, "10": 230}], [3, {"5": 125, "10": 240}]],0,"",0,"",1,"6+"],
  ["Purifier Squad",6,5,2,0,2,[5, 10],[[1, {"5": 145, "10": 290}], [3, {"5": 155, "10": 300}]],0,"",0,"",1,"6+"],
  ["Razorback",12,9,3,0,10,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"6+"],
  ["Rhino",12,9,3,0,10,[1],[[1, {"1": 70}], [4, {"1": 80}]],0,"",0,"",2,"6+"],
  ["Servitors",6,4,4,6,1,[4],{"4": 60},0,"",1,"",0,"8+"],
  ["Stormhawk Interceptor",0,9,3,0,10,[1],{"1": 160},0,"",0,"",0,"6+"],
  ["Stormraven Gunship",14,10,3,0,14,[1],[[1, {"1": 280}], [2, {"1": 300}]],0,"",0,"",0,"6+"],
  ["Stormtalon Gunship",0,9,3,0,10,[1],{"1": 170},0,"",0,"",0,"6+"],
  ["Strike Squad",6,5,2,0,2,[5, 10],{"5": 125, "10": 250},0,"",0,"",2,"6+"],
  ["Venerable Dreadnought",8,9,2,0,8,[1],[[1, {"1": 130}], [3, {"1": 140}]],0,"",0,"",3,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Brother-Captain","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Brother-Captain","Psilencer","T","6",2,5,0,"1","precision psychic sust:1","24\""],
  ["Brother-Captain","Psycannon","T","3",2,8,1,"2","psychic","24\""],
  ["Brother-Captain","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Brother-Captain","Nemesis force weapon","C","4",2,6,2,"2","psychic","càc"],
  ["Brother-Captain Stern","Storm bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Brother-Captain Stern","Nemesis force sword","C","5",2,6,2,"2","psychic","càc"],
  ["Brotherhood Champion","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Brotherhood Champion","Nemesis force weapon","C","5",2,6,2,"2","precision psychic","càc"],
  ["Brotherhood Chaplain","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Brotherhood Chaplain","Crozius arcanum","C","5",2,6,1,"2","","càc"],
  ["Brotherhood Librarian","Combi-weapon","T","1",4,5,1,"1","anti:4:inf dev rf:1","24\""],
  ["Brotherhood Librarian","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Brotherhood Librarian","Vortex of Doom","T","D6+3",3,8,2,"2","blast psychic","18\""],
  ["Brotherhood Librarian","Nemesis force weapon","C","4",2,6,1,"2","psychic","càc"],
  ["Brotherhood Techmarine","Forge bolter","T","3",2,5,1,"2","","24\""],
  ["Brotherhood Techmarine","Grav-pistol","T","1",2,4,1,"2","anti:2:veh pistol","12\""],
  ["Brotherhood Techmarine","Omnissian power axe","C","4",3,6,2,"2","","càc"],
  ["Brotherhood Techmarine","Servo-arm","C","1",3,8,2,"3","extra","càc"],
  ["Brotherhood Terminator Squad","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Brotherhood Terminator Squad","Psilencer","T","6",3,5,0,"1","precision psychic sust:1","24\""],
  ["Brotherhood Terminator Squad","Psycannon","T","3",3,8,1,"2","psychic","24\""],
  ["Brotherhood Terminator Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Brotherhood Terminator Squad","Nemesis force weapon","C","4",3,6,2,"2","psychic","càc"],
  ["Castellan Crowe","Purifying Flame","T","3",2,4,2,"1","anti:2:inf ignorescover psychic","18\""],
  ["Castellan Crowe","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Castellan Crowe","Black Blade of Antwyr","C","5",2,6,2,"2","dev precision","càc"],
  ["Grand Master","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Grand Master","Psilencer","T","6",2,5,0,"1","precision psychic sust:1","24\""],
  ["Grand Master","Psycannon","T","3",2,8,1,"2","psychic","24\""],
  ["Grand Master","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Grand Master","Nemesis force weapon","C","5",2,6,2,"2","psychic","càc"],
  ["Grand Master Voldus","Searing Purity","T","D3+1",2,12,2,"2","dev psychic","12\""],
  ["Grand Master Voldus","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Grand Master Voldus","Malleus Argyrum","C","5",2,10,2,"3","psychic","càc"],
  ["Grand Master in Nemesis Dreadknight","Fragstorm grenade launcher","T","D6",3,4,0,"1","blast","18\""],
  ["Grand Master in Nemesis Dreadknight","Gatling psilencer","T","12",3,6,0,"1","psychic sust:1","24\""],
  ["Grand Master in Nemesis Dreadknight","Heavy incinerator","T","2D6",0,6,1,"1","ignorescover torrent","18\""],
  ["Grand Master in Nemesis Dreadknight","Heavy psycannon","T","6",3,10,2,"3","ignorescover psychic","24\""],
  ["Grand Master in Nemesis Dreadknight","Sublimator","T","2",3,9,4,"D6","melta:4 psychic twin","18\""],
  ["Grand Master in Nemesis Dreadknight","Dreadfists","C","6",2,6,1,"1","","càc"],
  ["Grand Master in Nemesis Dreadknight","Nemesis daemon greathammer","C","5",3,14,3,"D6+1","psychic","càc"],
  ["Grand Master in Nemesis Dreadknight","Nemesis flail","C","10",2,5,1,"2","psychic","càc"],
  ["Grand Master in Nemesis Dreadknight","Nemesis mace","C","5",2,6,3,"3","anti:2:perso precision psychic","càc"],
  ["Grand Master in Nemesis Dreadknight","➤ Nemesis greatsword - strike","C","5",2,10,2,"D6","psychic","càc"],
  ["Grand Master in Nemesis Dreadknight","➤ Nemesis greatsword - sweep","C","10",2,5,1,"1","psychic","càc"],
  ["Grey Knights Dreadnought","Assault cannon","T","6",3,6,0,"1","dev","24\""],
  ["Grey Knights Dreadnought","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Grey Knights Dreadnought","Heavy psycannon","T","6",3,10,1,"3","psychic","24\""],
  ["Grey Knights Dreadnought","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Grey Knights Dreadnought","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Grey Knights Dreadnought","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Grey Knights Dreadnought","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Grey Knights Dreadnought","➤ Heavy plasma cannon - standard","T","D3",3,7,2,"2","blast","36\""],
  ["Grey Knights Dreadnought","➤ Heavy plasma cannon - supercharge","T","D3",3,8,3,"3","blast hazardous","36\""],
  ["Grey Knights Dreadnought","➤ Missile launcher - frag","T","D6",3,4,0,"1","blast","48\""],
  ["Grey Knights Dreadnought","➤ Missile launcher - krak","T","1",3,9,2,"D6","","48\""],
  ["Grey Knights Dreadnought","Armoured feet","C","5",3,6,0,"1","","càc"],
  ["Grey Knights Dreadnought","Dreadnought combat weapon","C","5",3,12,2,"3","","càc"],
  ["Grey Knights Dreadnought","Nemesis doomglaive","C","5",3,14,3,"3","psychic","càc"],
  ["Grey Knights Relic Razorback","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Grey Knights Relic Razorback","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Grey Knights Relic Razorback","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Grey Knights Relic Razorback","Twin Psycannon","T","3",3,8,1,"2","psychic twin","24\""],
  ["Grey Knights Relic Razorback","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Grey Knights Relic Razorback","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Grey Knights Relic Razorback","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Grey Knights Relic Razorback","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Grey Knights Thunderhawk Gunship","Hellstrike missile battery","T","4",3,8,2,"3","anti:4:vol","72\""],
  ["Grey Knights Thunderhawk Gunship","Lascannon","T","1",3,12,3,"D6+1","","48\""],
  ["Grey Knights Thunderhawk Gunship","Thunderhawk heavy cannon","T","D6+6",3,10,2,"3","blast","48\""],
  ["Grey Knights Thunderhawk Gunship","Turbo-laser destructor","T","D3+1",3,20,4,"D6+6","blast","96\""],
  ["Grey Knights Thunderhawk Gunship","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Grey Knights Thunderhawk Gunship","Armored Hull","C","6",4,8,0,"1","","càc"],
  ["Interceptor Squad","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Interceptor Squad","Psilencer","T","6",3,5,0,"1","precision psychic sust:1","24\""],
  ["Interceptor Squad","Psycannon","T","3",3,8,1,"2","psychic","24\""],
  ["Interceptor Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Interceptor Squad","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Interceptor Squad","Nemesis force weapon","C","3",3,6,2,"2","psychic","càc"],
  ["Kaldor Draigo","Scourging","T","3",2,6,2,"2","anti:2 ignorescover psychic","18\""],
  ["Kaldor Draigo","Storm bolter","T","2",2,4,0,"1","rf:2","24\""],
  ["Kaldor Draigo","The Titansword","C","6",2,8,4,"3","anti:2 psychic","càc"],
  ["Land Raider","Godhammer lascannon","T","2",3,12,3,"D6+1","","48\""],
  ["Land Raider","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Land Raider","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Land Raider","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Land Raider","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Land Raider","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Land Raider Crusader","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Land Raider Crusader","Hurricane bolter","T","6",3,5,1,"1","rf:6 twin","24\""],
  ["Land Raider Crusader","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Land Raider Crusader","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Land Raider Crusader","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Land Raider Crusader","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Land Raider Redeemer","Flamestorm cannon","T","D6+3",0,6,2,"2","ignorescover torrent","12\""],
  ["Land Raider Redeemer","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Land Raider Redeemer","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Land Raider Redeemer","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Land Raider Redeemer","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Land Raider Redeemer","Armoured tracks","C","6",4,8,0,"1","","càc"],
  ["Nemesis Dreadknight","Gatling psilencer","T","12",3,6,0,"1","psychic sust:1","24\""],
  ["Nemesis Dreadknight","Heavy incinerator","T","2D6",0,6,1,"1","ignorescover torrent","18\""],
  ["Nemesis Dreadknight","Heavy psycannon","T","6",3,10,2,"3","ignorescover psychic","24\""],
  ["Nemesis Dreadknight","Dreadfists","C","6",2,6,1,"1","","càc"],
  ["Nemesis Dreadknight","Nemesis daemon greathammer","C","5",3,14,3,"D6+1","psychic","càc"],
  ["Nemesis Dreadknight","➤ Nemesis greatsword - strike","C","5",2,10,2,"D6","psychic","càc"],
  ["Nemesis Dreadknight","➤ Nemesis greatsword - sweep","C","10",2,5,1,"1","psychic","càc"],
  ["Paladin Squad","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Paladin Squad","Psilencer","T","6",2,5,0,"1","precision psychic sust:1","24\""],
  ["Paladin Squad","Psycannon","T","3",2,8,1,"2","psychic","24\""],
  ["Paladin Squad","Storm bolter","T","2",2,5,1,"1","rf:2","24\""],
  ["Paladin Squad","Nemesis force weapon","C","4",2,6,2,"2","psychic","càc"],
  ["Purgation Squad","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Purgation Squad","Psilencer","T","6",3,5,0,"1","precision psychic sust:1","24\""],
  ["Purgation Squad","Psycannon","T","3",3,8,1,"2","psychic","24\""],
  ["Purgation Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Purgation Squad","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Purgation Squad","Nemesis force weapon","C","3",3,6,2,"2","psychic","càc"],
  ["Purifier Squad","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Purifier Squad","Psilencer","T","6",3,5,0,"1","precision psychic sust:1","24\""],
  ["Purifier Squad","Psycannon","T","3",3,8,1,"2","psychic","24\""],
  ["Purifier Squad","Purifying Flame","T","1",3,4,2,"1","anti:2:inf ignorescover psychic","18\""],
  ["Purifier Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Purifier Squad","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Purifier Squad","Nemesis force weapon","C","3",3,6,2,"2","psychic","càc"],
  ["Razorback","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Razorback","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Razorback","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Razorback","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Razorback","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Rhino","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Rhino","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Rhino","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Servitors","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Servitors","Multi-melta","T","2",4,9,4,"D6","heavy melta:2","18\""],
  ["Servitors","➤ Plasma cannon - standard","T","D3",4,7,2,"1","blast heavy","36\""],
  ["Servitors","➤ Plasma cannon - supercharge","T","D3",4,8,3,"2","blast hazardous heavy","36\""],
  ["Servitors","Servitor's tools","C","1",5,3,0,"1","","càc"],
  ["Servitors","Servo-arm","C","1",5,6,2,"3","","càc"],
  ["Stormhawk Interceptor","Icarus stormcannon","T","6",3,7,1,"2","anti:2:vol","48\""],
  ["Stormhawk Interceptor","Las-talon","T","2",3,10,3,"D6+1","","36\""],
  ["Stormhawk Interceptor","Skyhammer missile launcher","T","3",3,8,1,"D3","anti:2:vol","48\""],
  ["Stormhawk Interceptor","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Stormhawk Interceptor","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Stormhawk Interceptor","➤ Typhoon missile launcher - frag","T","2D6",3,4,0,"1","blast","48\""],
  ["Stormhawk Interceptor","➤ Typhoon missile launcher - krak","T","2",3,9,2,"D6","","48\""],
  ["Stormhawk Interceptor","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Stormraven Gunship","Hurricane bolter","T","6",3,5,1,"1","rf:6 twin","24\""],
  ["Stormraven Gunship","Stormstrike missile launcher","T","1",3,10,3,"D6+2","","48\""],
  ["Stormraven Gunship","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Stormraven Gunship","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Stormraven Gunship","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Stormraven Gunship","Twin multi-melta","T","2",3,9,4,"D6","melta:2 twin","18\""],
  ["Stormraven Gunship","➤ Twin heavy plasma cannon - standard","T","3",3,7,2,"2","blast twin","36\""],
  ["Stormraven Gunship","➤ Twin heavy plasma cannon - supercharge","T","3",3,8,3,"3","blast hazardous twin","36\""],
  ["Stormraven Gunship","➤ Typhoon missile launcher - frag","T","2D6",3,4,0,"1","blast","48\""],
  ["Stormraven Gunship","➤ Typhoon missile launcher - krak","T","2",3,9,2,"D6","","48\""],
  ["Stormraven Gunship","Armoured hull","C","6",4,8,0,"1","","càc"],
  ["Stormtalon Gunship","Skyhammer missile launcher","T","3",3,8,1,"D3","anti:2:vol","48\""],
  ["Stormtalon Gunship","Twin assault cannon","T","6",3,6,0,"1","dev twin","24\""],
  ["Stormtalon Gunship","Twin heavy bolter","T","3",3,5,1,"2","sust:1 twin","36\""],
  ["Stormtalon Gunship","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Stormtalon Gunship","➤ Typhoon missile launcher - frag","T","2D6",3,4,0,"1","blast","48\""],
  ["Stormtalon Gunship","➤ Typhoon missile launcher - krak","T","2",3,9,2,"D6","","48\""],
  ["Stormtalon Gunship","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Strike Squad","Incinerator","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Strike Squad","Psilencer","T","6",3,5,0,"1","precision psychic sust:1","24\""],
  ["Strike Squad","Psycannon","T","3",3,8,1,"2","psychic","24\""],
  ["Strike Squad","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Strike Squad","Close combat weapon","C","3",3,5,0,"1","","càc"],
  ["Strike Squad","Nemesis force weapon","C","3",3,6,2,"2","psychic","càc"],
  ["Venerable Dreadnought","Assault cannon","T","6",3,6,0,"1","dev","24\""],
  ["Venerable Dreadnought","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Venerable Dreadnought","Storm bolter","T","2",3,5,1,"1","rf:2","24\""],
  ["Venerable Dreadnought","Twin lascannon","T","1",3,12,3,"D6+1","twin","48\""],
  ["Venerable Dreadnought","➤ Heavy plasma cannon - standard","T","D3",3,7,2,"2","blast","36\""],
  ["Venerable Dreadnought","➤ Heavy plasma cannon - supercharge","T","D3",3,8,3,"3","blast hazardous","36\""],
  ["Venerable Dreadnought","Dreadnought combat weapon","C","5",3,12,2,"3","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Brother-Captain","Personnage"],
  ["Brother-Captain Stern","Epic Hero"],
  ["Brotherhood Champion","Personnage"],
  ["Brotherhood Chaplain","Personnage"],
  ["Brotherhood Librarian","Personnage"],
  ["Brotherhood Techmarine","Personnage"],
  ["Brotherhood Terminator Squad","Battleline"],
  ["Castellan Crowe","Epic Hero"],
  ["Grand Master","Personnage"],
  ["Grand Master Voldus","Epic Hero"],
  ["Grand Master in Nemesis Dreadknight","Personnage"],
  ["Grey Knights Dreadnought","Véhicule"],
  ["Grey Knights Relic Razorback","Véhicule"],
  ["Grey Knights Thunderhawk Gunship","Véhicule"],
  ["Interceptor Squad","Infanterie"],
  ["Kaldor Draigo","Epic Hero"],
  ["Land Raider","Véhicule"],
  ["Land Raider Crusader","Véhicule"],
  ["Land Raider Redeemer","Véhicule"],
  ["Nemesis Dreadknight","Véhicule"],
  ["Paladin Squad","Infanterie"],
  ["Purgation Squad","Infanterie"],
  ["Purifier Squad","Infanterie"],
  ["Razorback","Véhicule"],
  ["Rhino","Véhicule"],
  ["Servitors","Infanterie"],
  ["Stormhawk Interceptor","Véhicule"],
  ["Stormraven Gunship","Véhicule"],
  ["Stormtalon Gunship","Véhicule"],
  ["Strike Squad","Battleline"],
  ["Venerable Dreadnought","Personnage"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Brother-Captain": [
  "Brotherhood Terminator Squad",
  "Paladin Squad"
 ],
 "Brother-Captain Stern": [
  "Brotherhood Terminator Squad",
  "Paladin Squad"
 ],
 "Brotherhood Champion": [
  "Purgation Squad",
  "Strike Squad"
 ],
 "Brotherhood Chaplain": [
  "Brotherhood Terminator Squad",
  "Paladin Squad"
 ],
 "Brotherhood Librarian": [
  "Brotherhood Terminator Squad",
  "Paladin Squad"
 ],
 "Brotherhood Techmarine": [
  "Purgation Squad",
  "Purifier Squad",
  "Strike Squad"
 ],
 "Castellan Crowe": [
  "Purifier Squad"
 ],
 "Grand Master": [
  "Brotherhood Terminator Squad",
  "Paladin Squad"
 ],
 "Grand Master Voldus": [
  "Brotherhood Terminator Squad",
  "Paladin Squad"
 ],
 "Kaldor Draigo": [
  "Brotherhood Terminator Squad",
  "Paladin Squad"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Brother-Captain": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ Brotherhood Terminator Squad\n■ Paladin Squad"
  ],
  [
   "Hammerhand (Psychic)",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Eye of Judgement (Psychic)",
   "Each time this model makes an attack, you can re-roll the Wound roll."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Brother-Captain Stern": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ Brotherhood Terminator Squad\n■ Paladin Squad"
  ],
  [
   "Exemplar of the Silvered Host",
   "While this model is leading a unit, each time a model in that unit makes a melee attack, on a Critical Wound, the target suffers 1 mortal wound in addition to any normal damage."
  ],
  [
   "Strands of Fate (Psychic)",
   "The first time this model is destroyed, roll one D6 at the end of the phase. On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with its full wounds remaining."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Brotherhood Champion": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ Purgation Squad\n■ Strike Squad"
  ],
  [
   "Clarion of Haste (Psychic)",
   "While this model is leading a unit, that unit is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Inspiring Exemplar",
   "Each time this model destroys a Character model in the Fight phase, you gain 1CP and, until the end of the battle, add 1 to the Attacks characteristic of its Nemesis force weapon."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Brotherhood Chaplain": [
  [
   "Zealous Path",
   "While this model is leading a unit, you can re-roll Charge rolls made for that unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n■ Brotherhood Terminator Squad\n■ Paladin Squad"
  ],
  [
   "Litanies of Sanctity",
   "Once per battle, at the start of any phase, you can select one friendly Grey Knights unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Brotherhood Librarian": [
  [
   "Haloed in Soulfire (Psychic)",
   "While this model is leading a unit, that unit can only be selected as the target of a ranged attack if the attacking model is within 18\"."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Brotherhood Terminator Squad\n- Paladin Squad"
  ],
  [
   "Sanctic Hood",
   "While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability against Psychic Attacks."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Brotherhood Techmarine": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ Strike Squad\n■ Purgation Squad\n■ Purifier Squad"
  ],
  [
   "Guardians of the Machine",
   "Each time an enemy unit ends a charge move engaged with one or more friendly GREY KNIGHTS VEHICLE units and within 6\" of this unit, you can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Blessing of the Omnissiah",
   "In your Command phase, you can select one friendly Grey Knights Vehicle model within 3\" of this model. That model regains up to D3 lost wounds and, until the start of your next Command phase, each time that Vehicle model makes an attack, add 1 to the Hit roll. Each model can only be selected for this ability once per turn."
  ],
  [
   "Techmarine",
   "While this model is within 3\" of one or more friendly Grey Knights Vehicle units, this model has the Lone Operative ability."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Brotherhood Terminator Squad": [
  [
   "Force Edge (Psychic)",
   "Each time a model in this unit makes a melee attack that targets a unit (excluding Vehicles or Monsters), improve the Armour Penetration characteristic of that attack by 1."
  ],
  [
   "Ancient's Banner",
   "Add 1 to the Objective Control characteristic of models in the bearer’s unit."
  ],
  [
   "Apothecary's narthecium",
   "In your Command phase, if the bearer is not destroyed, you can return 1 destroyed model (excluding Characters) to the bearer’s unit."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Castellan Crowe": [
  [
   "Champion of the Order of Purifiers (Psychic)",
   "While this model is leading a unit, add 1 to the Attacks characteristic of Purifying Flame weapons equipped by that unit."
  ],
  [
   "Foesight (Psychic)",
   "Each time this model makes an attack that targets a Character unit, you can re-roll the Hit roll."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Purifier Squad"
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Grand Master": [
  [
   "Might of Titan (Psychic)",
   "Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks and Strength characteristics of melee weapons equipped by this model."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- Brotherhood Terminator Squad\n- Paladin Squad"
  ],
  [
   "Warrior Strategist",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Grand Master in Nemesis Dreadknight": [
  [
   "Surge of Wrath (Psychic)",
   "Each time this model makes a melee attack that targets a Monster or Vehicle unit, you can re-roll the Hit roll, you can re-roll the Wound roll and you can re-roll the Damage roll."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Warrior Strategist",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Grand Master Voldus": [
  [
   "Sanctuary (Psychic)",
   "- This unit has Stealth.\n- Melee attacks that target this unit have -1 to hit rolls."
  ],
  [
   "Hammer Aflame (Psychic)",
   "Each time this model’s unit is selected to fight, you can select one enemy unit within Engagement Range of this model’s unit and roll one D6: on a 2-3, that enemy unit suffers 1 mortal wound; on a 4-5, that enemy unit suffers D3 mortal wounds; on a 6+, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n■ Brotherhood Terminator Squad\n■ Paladin Squad"
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Land Raider": [
  [
   "Assault Ramp",
   "Each time a unit disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Land Raider Crusader": [
  [
   "Assault Ramp",
   "Each time a unit disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Land Raider Redeemer": [
  [
   "Assault Ramp",
   "Each time a unit disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Razorback": [
  [
   "Fire Focus",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per turn."
  ]
 ],
 "Rhino": [
  [
   "Truesilver Aegis (Psychic)",
   "While a friendly Grey Knights unit is wholly within 6\" of this model, models in that unit have the Feel No Pain 6+ ability against mortal wounds."
  ]
 ],
 "Stormhawk Interceptor": [
  [
   "Interceptor",
   "Each time this model makes a ranged attack that targets a unit that can Fly, add 1 to the Hit roll."
  ]
 ],
 "Stormraven Gunship": [
  [
   "Armoured Resilience",
   "Each time an attack is allocated to this model, subtract 1 from the Damage characteristic of that attack."
  ],
  [
   "Damaged: 1-5 Wounds Remaining",
   "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ]
 ],
 "Stormtalon Gunship": [
  [
   "Strafing Run",
   "Each time this model makes a ranged attack that targets a unit that cannot Fly, add 1 to the Hit roll"
  ]
 ],
 "Venerable Dreadnought": [
  [
   "Guidance of the Ancients (Psychic)",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a Grey Knights model from your army makes an attack which targets that unit, add 1 to the Hit roll."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Interceptor Squad": [
  [
   "Personal Teleporters",
   "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\" as if it were your Movement phase. If it does, until the end of the turn, this unit is not eligible to declare a charge."
  ],
  [
   "Boons of Deimos",
   "PURGATION SQUAD unit only. This unit’s ranged attacks have +2 S."
  ],
  [
   "Precognicient Volleys",
   "PURGATION SQUAD unit only. This unit’s snap shooting attacks hit on unmodified hit rolls of 5+."
  ],
  [
   "Predestined Coordinates",
   "INTERCEPTOR SQUAD unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Astral Overlap",
   "INTERCEPTOR SQUAD unit only. This unit has Stealth."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Kaldor Draigo": [
  [
   "Untouchable Purity",
   "While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability against mortal wounds"
  ],
  [
   "One With the Warp (Psychic)",
   "Once per battle, when this model’s unit declares a charge in the same turn it was set up on the battlefield using the Deep Strike or Teleport Assault ability, add 3 to the Charge roll."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n■ Brotherhood Terminator Squad\n■ Paladin Squad"
  ],
  [
   "Supreme Commander",
   "If this model is in your army, it must be your WARLORD."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Nemesis Dreadknight": [
  [
   "Indomitable Spirit (Psychic)",
   "This model is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Paladin Squad": [
  [
   "Attuned Onslaught (Psychic)",
   "Each time this unit makes a Charge move, until the end of the turn, add 1 to the Damage characteristic of melee weapons equipped by Paladin Squad models in this unit."
  ],
  [
   "Ancient's Banner",
   "Add 1 to the Objective Control characteristic of models in the bearer’s unit."
  ],
  [
   "Apothecary's narthecium",
   "In your Command phase, if the bearer is not destroyed, you can return 1 destroyed model (excluding Characters) to the bearer’s unit."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Purgation Squad": [
  [
   "Righteous Persecution",
   "In your Shooting phase, after this unit has shot, select one enemy unit (excluding Monsters or Vehicles) hit by one or more of those attacks; until the start of your next turn, that enemy unit is pinned. While a unit is pinned, subtract 2 from that unit's Move characteristic and subtract 2 from Charge rolls made for it."
  ],
  [
   "Boons of Deimos",
   "PURGATION SQUAD unit only. This unit’s ranged attacks have +2 S."
  ],
  [
   "Precognicient Volleys",
   "PURGATION SQUAD unit only. This unit’s snap shooting attacks hit on unmodified hit rolls of 5+."
  ],
  [
   "Predestined Coordinates",
   "INTERCEPTOR SQUAD unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Astral Overlap",
   "INTERCEPTOR SQUAD unit only. This unit has Stealth."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Purifier Squad": [
  [
   "Sanctity of Purpose",
   "Each time a model in this unit makes an attack, re-roll a Wound roll of 1. If the target is within range of an objective marker, you can re-roll the Wound roll instead."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Servitors": [
  [
   "Mindlock",
   "While a Brotherhood Techmarine model is leading this unit, improve the Ballistic Skill and Weapon Skill characteristics of ranged and melee weapons equipped by Servitor models in this unit by 1."
  ],
  [
   "Servitor Retinue",
   "At the start of the Declare Battle Formations step, this unit can join one other unit from your army that is being led by a Brotherhood Techmarine (a unit cannot have more than one Servitors unit joined to it). If it does, until the end of the battle, every model in this unit counts as being part of that Bodyguard unit, and that Bodyguard unit’s Starting Strength is increased accordingly."
  ],
  [
   "Retinue",
   "While a Brotherhood Techmarine model is leading this unit, models in this unit have the Deep Strike and Teleport Assault abilities"
  ]
 ],
 "Strike Squad": [
  [
   "Sanctifying Ritual (Psychic)",
   "At the end of your Command phase, if this unit is within range of an objective marker that you control, that objective marker remains under you control until your opponent's Level of Control over that objective marker is greater than yours at the end of a phase."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Grey Knights Thunderhawk Gunship": [
  [
   "Damaged: 1-10 Wounds Remaining",
   "While this model has 1-10 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Aerial Assault",
   "Each time a unit with the Deep Strike ability disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn."
  ],
  [
   "Thunderhawk cluster bombs",
   "Each time the bearer ends a Normal move, you can select one enemy unit it moved over during that move and roll six D6: for each 3+, that unit suffers 1 mortal wound."
  ]
 ],
 "Grey Knights Dreadnought": [
  [
   "Wisdom of the Ancients (Aura)",
   "While a friendly Grey Knights Infantry unit is within 6\" of this model, each time a model in that unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1."
  ],
  [
   "Gate of Infinity",
   "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
  ]
 ],
 "Grey Knights Relic Razorback": [
  [
   "Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Argent Assault",1,"","Dauntless Champions","When a friendly PALADIN SQUAD unit is selected to fight, if the S of those attacks is lower than the T of the target, those attacks have +1 to wound rolls.","",0,"","Priority Assets"],
  ["Augurium Task Force",2,"","Prescient Redeployment","From the second battle round onwards, at the start of your Movement phase, if you did not select the maximum number of Grey Knights units from your army using the Gate of Infinity ability at the end of your opponent’s previous turn, you can select one GREY KNIGHTS unit from your army that is on the battlefield that could have been selected using the Gate of Infinity ability. Remove that unit from the battlefield and place it into Strategic Reserves. Designer’s Note: This means that your unit can retain its position on the battlefield at the end of your Command phase, and then be placed into Strategic Reserves at the start of your Movement phase, to set it up again in your Reinforcements step in another position.","",0,"","Reconnaissance"],
  ["Banishers",2,"","Channelled Force","Each time a Grey Knights unit from your army is selected to fight, that unit can take a Leadership test. If that test is passed, select one of the following rules. Until the end of the phase, that unit has that rule. ▪ Melee weapons equipped by models in this unit with the [psychic] ability also have the [sustained hits 1] ability. ▪ Melee weapons equipped by models in this unit with the [psychic] ability also have the [LETHAL HITS] ability.","",0,"","Disruption"],
  ["Brotherhood Strike",2,"","Fury of Titan","Each time a unit from your army is set up using the Deep Strike ability, until the end of the turn, each time a model in that unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.","",0,"","Purge the Foe"],
  ["Fires of Purgation",1,"","Searing Soulflame","When you select a unit to be pinned by a friendly PURGATION SQUAD unit’s Righteous Persecution ability, that enemy unit makes a battle-shock roll, with -1 to that battle-shock roll.","",0,"","Disruption"],
  ["Hallowed Conclave",2,"","Duty Before All","Grey Knights Terminator units from your army are eligible to shoot and declare a charge in a turn in which they Fell Back.","",0,"","Take and Hold"],
  ["Immaterial Interdiction",1,"","Echojump","In your Shooting phase, when a friendly INTERCEPTOR SQUAD unit has shot, you can use this ability. If you do: ▪ That unit cannot use its Personal Teleporters ability. ▪ That unit can make a surge move of up to D6+1\".","",0,"","Reconnaissance"],
  ["Sanctic Spearhead",2,"","Mailed Fist","Each time a Grey Knights Vehicle unit from your army Advances, do not make an Advance roll for it; until the end of the phase, add 6\" to the Move characteristic of models in that unit, and until the end of the turn, ranged weapons equipped by models in that unit have the [ASSAULT] ability.","",0,"","Priority Assets"],
  ["Warpbane Task Force",3,"","Hallowed Ground","Certain areas of the battlefield are within your army’s Hallowed Ground, as follows: ▪ Your deployment zone is always within your army’s Hallowed Ground. ▪ The area of the battlefield within 6\" of one or more Purifier Squad units from your army is within your army’s Hallowed Ground. ▪ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Hallowed Ground. ▪ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Hallowed Ground. Each time a model in a GREY KNIGHTS unit from your army makes a ranged attack that targets a visible target or makes a melee attack, re-roll a Hit roll of 1. If that unit is a PURIFIER SQUAD and/or is wholly within your army’s Hallowed Ground, you can re-roll the Hit roll instead.","",0,"","Take and Hold"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Psychic Celerity",15,"Argent Assault","TERMINATOR model only. This unit has +1 to charge rolls.",null],
  ["Vigilance of Titan",20,"Argent Assault","TERMINATOR model only. At the start of your Shooting phase, you can select one visible enemy unit within 12\" of this unit. That enemy unit has +6\" detection range.",null],
  ["Doomseer’s Amulet",25,"Augurium Task Force","Grey Knights model only. Each time the bearer's unit is set up in your Reinforcements step, the bearer can use this Enhancement. If it does, select one enemy unit within 12\" of and visible to the bearer. That enemy unit must take a Battle-shock test, subtracting one from that test.",null],
  ["Grimoire of Conjunctions",10,"Augurium Task Force","Grey Knights model only.  Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, add 4 to the Strength characteristic of melee weapons equipped by the bearer.",null],
  ["One Foot in the Future",15,"Augurium Task Force","GREY KNIGHTS model only. When this unit ends an ingress move, you can use this ability. If you do:\n- This unit can make a normal move of up to D6\".\n- Until the end of the turn, this unit is not eligible to declare a charge.",null],
  ["Shield of Prophecy",20,"Augurium Task Force","Grey Knights model only. Once per battle, at the start of the battle round, the bearer can use this Enhancement. If it does, until the end of the battle round, add 2 to the Toughness characteristic of models in the bearer's unit.",null],
  ["Ephemeral Tome",15,"Banishers","Grey Knights model only. At the start of your Shooting phase, if the bearer's unit is not within Engagement Range of one or more enemy units, the bearer can use this Enhancement. If it does, the bearer's unit can make a Normal Move of up to D6\" and, until the end of the turn, the bearer's unit is not eligible to declare a Charge.",null],
  ["Pyresoul",20,"Banishers","",null],
  ["Sigil of the Hunt",10,"Banishers","Grey Knights model only. In your Shooting phase, each time a model in the bearer's unit makes an attack, re-roll a Hit roll of 1.",null],
  ["Sixty-sixth Seal",25,"Banishers","Grey Knights model only.  In your Shooting phase, each time a model in the bearer's unit makes an attack, improve the Armour Penetration characteristic of that attack by 1.",null],
  ["Banishing Wave",20,"Brotherhood Strike","",null],
  ["Blinding Aura",10,"Brotherhood Strike","Grey Knights model only. Each time the bearer's unit is set up using the Deep Strike ability, until the end of the turn, enemy units cannot use the Fire Overwatch ability to shoot at the bearer's unit.",null],
  ["Purity of Purpose",15,"Brotherhood Strike","Grey Knights model only. Each time the bearer's unit is set up using the Deep Strike ability, until the end of the turn, you can re-roll Charge rolls made for the bearer's unit.",null],
  ["Tome of Forbidden Ways",25,"Brotherhood Strike","Grey Knights model only. While the bearer is on the battlefield or in Strategic Reserves, add 1 to the number of units from your army that you can select for the Gate of Infinity rule.",null],
  ["Boons of Deimos (Upgrade)",20,"Fires of Purgation","PURGATION SQUAD unit only. This unit’s ranged attacks have +2 S.",null],
  ["Precognicient Volleys (Upgrade)",10,"Fires of Purgation","PURGATION SQUAD unit only. This unit’s snap shooting attacks hit on unmodified hit rolls of 5+.",null],
  ["Eye of the Augurium",25,"Hallowed Conclave","GREY KNIGHTS model only. You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase.",null],
  ["Inescapable Judgement",20,"Hallowed Conclave","",null],
  ["Nemesis Rounds",10,"Hallowed Conclave","Grey Knights Terminator model only.  Each time you target the bearer's unit with the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+ while resolving that Stratagem.",null],
  ["Sanctic Reaper",15,"Hallowed Conclave","Grey Knights Terminator model only. Add 3 to the Attacks characteristic of the bearer's melee weapons.",null],
  ["Astral Overlap (Upgrade)",10,"Immaterial Interdiction","INTERCEPTOR SQUAD unit only. This unit has Stealth.",null],
  ["Predestined Coordinates (Upgrade)",10,"Immaterial Interdiction","INTERCEPTOR SQUAD unit only. In your first Movement phase, this unit can make an ingress move.",null],
  ["Driven by Duty",10,"Sanctic Spearhead","Grey Knights Walker model only. Each time the bearer's unit Piles In or Consolidates, the bearer can move up to 6\" instead of 3\".",null],
  ["Quickening Foci",15,"Sanctic Spearhead","Grey Knights Infantry model only.  In your Movement phase, each time the bearer's unit disembarks from a Transport, until the end of the turn, you can re-roll Charge rolls made for that unit.",null],
  ["Sigil of Exigence",30,"Sanctic Spearhead","Grey Knights model only. Once per battle, in your opponent's Shooting phase, when the bearer's unit is selected as the target of a ranged attack, you can remove the bearer's unit from the battlefield and then set it back up again anywhere on the battlefield that is more than 8\" horizontally away from all enemy units. If the bearer's unit is no longer an eligible target, your opponent can then select new targets for any attacks that had targeted the bearer's unit.",null],
  ["Spiritus Machina",25,"Sanctic Spearhead","Grey Knights Infantry model only. In your Shooting phase, each time the bearer's unit is selected to shoot, if the bearer's unit disembarked from a Transport this turn, until the end of the phase, each time a model in the bearer's unit makes an attack, you can re-roll the Wound roll.",null],
  ["Mandulian Reliquary",20,"Warpbane Task Force","Grey Knights model only. While the bearer’s unit is not Battle-shocked, add 3 to the bearer’s Objective Control characteristic.",null],
  ["Paragon of Sanctity",10,"Warpbane Task Force","Grey Knights model only. Once per battle, at the start of any phase, the bearer can select one friendly Grey Knights unit within 18\" of and visible to it. If it does, until the end of the phase, that unit is within your army’s Hallowed Ground.",null],
  ["Phial of the Abyss",15,"Warpbane Task Force","Grey Knights Infantry model only. Models in the bearer’s unit have the Stealth ability.",null],
  ["Radiant Champion",15,"Warpbane Task Force","Grey Knights Infantry model only. The bearer’s melee weapons have the [Precision] ability, and while the bearer is wholly within your army’s Hallowed Ground, each time a melee attack made by the bearer scores a wound, the target of that attack suffers 1 mortal wound in addition to any normal damage.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["A Threat Ended","Argent Assault","",1,"Fight phase, when a friendly PALADIN SQUAD unit is selected to fight.","That PALADIN SQUAD unit.","Your unit’s melee attacks have [PRECISION].",""],
  ["Aura of Vengeance","Argent Assault","",1,"Fight phase, when an enemy unit targets a friendly PALADIN SQUAD unit.","That PALADIN SQUAD unit.","That enemy unit’s melee attacks have [HAZARDOUS].",""],
  ["Truesilver Aegis","Argent Assault","",1,"Any phase, when a friendly PALADIN SQUAD unit suffers a mortal wound.","That PALADIN SQUAD unit.","Your unit has Feel No Pain 4+ against mortal wounds.",""],
  ["Aggressive Anticipation","Augurium Task Force","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One GREY KNIGHTS PSYKER unit from your army that has not been selected to shoot or fight this phase.","Your unit’s attacks can re-roll hit rolls.",""],
  ["Appointed Hour","Augurium Task Force","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Grey Knights Psyker unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Forewarned Evasion","Augurium Task Force","Fait Épique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Grey Knights Walker unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Mirage of Echoes","Augurium Task Force","Ruse Stratégique",1,"The Reinforcements step of your opponent’s Movement phase, just after an enemy unit is set up.","One Grey Knights Psyker unit from your army that is within 12\" of that enemy unit and is not within Engagement Range of one or more enemy units.","If your unit has the Deep Strike ability, it can be placed into Strategic Reserves.",""],
  ["Necessary End","Augurium Task Force","Fait Épique",1,"Fight phase, just after an enemy unit has selected its targets.","One Grey Knights Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6. If the result is greater than the current battle round number, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Redirected Strike","Augurium Task Force","Fait Épique",1,"End of your Command phase.","One Grey Knights Psyker unit from your army that is not within Engagement Range of one or more enemy units.","If your unit has the Deep Strike ability, it can be placed into Strategic Reserves. Designer’s Note: This Stratagem lets players utilise abilities that retain control of objective markers and react to their missions and objectives with this unit.",""],
  ["Celerity","Banishers","Fait Épique",1,"Your Charge phase.","One Grey Knights Psyker Infantry unit from your army.","Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Chaos Bane","Banishers","Fait Épique",1,"Your Shooting phase.","One Grey Knights Psyker unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [ANTI-CHAOS 4+] ability.",""],
  ["Circle of Sanctuary","Banishers","Fait Épique",1,"Start of your opponent’s Movement phase.","One Grey Knights Character model from your army.","Until the end of the phase, enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" horizontally of your model.",""],
  ["Hexwrought Reprisal","Banishers","Fait Épique",1,"End of any phase.","One Grey Knights Psyker unit from your army that is on the battlefield and suffered one or more mortal wounds this phase.","Select one enemy unit which inflicted one or more mortal wounds on your unit this phase, then roll a number of dice equal to the number of mortal wounds your unit suffered this phase: for each 2+, that enemy unit suffers one mortal wound (to a maximum of 6 mortal wounds). These mortal wounds are Psychic Attacks.",""],
  ["Shadow of Anarch","Banishers","Fait Épique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Grey Knights Psyker unit from your army that is within 8\" of that enemy unit and is not within Engagement Range of one or more enemy units.","Your unit can make a Normal move of up to 6\" or, if it has the Deep Strike ability, it can be placed into Strategic Reserves.",""],
  ["Warding Chant","Banishers","Fait Épique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Grey Knights Psyker unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 5+ ability against attacks with an unmodified Damage characteristic of 1.",""],
  ["Combat Manifestation","Brotherhood Strike","Fait Épique",1,"Your Movement phase.","One Grey Knights unit from your army that is arriving using the Deep Strike ability this phase.","Set your unit up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units, but until the end of the turn, it is not eligible to declare a charge.",""],
  ["Duty Unending","Brotherhood Strike","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit within Engagement Range of one or more Grey Knights units from your army Falls Back.","One of those GREY KNIGHTS units that is not within Engagement Range of one or more enemy units.","If your unit has the Deep Strike ability, it can be placed into Strategic Reserves.",""],
  ["Expeditious Exit","Brotherhood Strike","Ruse Stratégique",2,"End of your opponent’s Fight phase.","One Grey Knights Psyker Infantry unit from your army.","If every model in your unit has the Deep Strike ability, remove your unit from the battlefield and place it into Strategic Reserves. Designer’s Note: This Stratagem allows you to remove a unit in addition to those removed using the Gate of Infinity rule, and it allows you to remove a unit within Engagement Range of one or more enemy units.",""],
  ["Purgation Pattern","Brotherhood Strike","Tactique de Bataille",1,"Your Shooting phase.","One Grey Knights unit from your army that was set up using the Deep Strike ability this turn and has not been selected to shoot this phase.","Until the end of the phase, weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability.",""],
  ["Shining Veil","Brotherhood Strike","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Grey Knights unit that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit has the Stealth ability.",""],
  ["Truesilver Channelling","Brotherhood Strike","Ruse Stratégique",2,"Fight phase.","One Grey Knights Infantry unit from your army that has not been selected to fight this phase.","Until the end of the phase, Psychic weapons equipped by models in your unit have the [DEVASTATING WOUNDS] ability.",""],
  ["Focused Immolation","Fires of Purgation","",1,"Your Shooting phase, when a friendly PURGATION SQUAD unit is selected to shoot.","That PURGATION SQUAD unit.","Select one enemy unit. Your unit’s ranged attacks that target that unit have: ▪ [DEVASTATING WOUNDS]. ▪ [SUSTAINED HITS 1].",""],
  ["Soul-Locked","Fires of Purgation","",1,"Your Movement phase, when a friendly PURGATION SQUAD unit is selected to make a fall-back move.","That PURGATION SQUAD unit.","That move does not prevent your unit from being eligible to shoot.",""],
  ["Spiritsear","Fires of Purgation","",1,"Your Shooting phase, when a friendly PURGATION SQUAD unit has shot.","That PURGATION SQUAD unit.","Select one battle-shocked enemy unit hit by those attacks. That enemy unit suffers D3+1 mortal wounds.",""],
  ["Giants of the Battlefield","Hallowed Conclave","Tactique de Bataille",1,"Fight phase.","One Grey Knights Terminator unit from your army that has not been selected to fight this phase.","Until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by models in your unit.",""],
  ["Grind Them Underfoot","Hallowed Conclave","Ruse Stratégique",1,"Your Charge phase, just after a Grey Knights Terminator unit from your army ends a Charge move.","That GREY KNIGHTS unit.","Select one enemy unit within Engagement Range of your unit, then roll one D6 for each model in your unit that is within Engagement Range of that enemy unit: for each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",""],
  ["Point-Blank Purgation","Hallowed Conclave","Ruse Stratégique",1,"Your Shooting phase.","One Grey Knights Infantry unit from your army that has not been selected to shoot this phase.","Until the end of the phase, storm bolter weapons equipped by models in your unit have the [PISTOL] and [TWIN-LINKED] abilities.",""],
  ["Precognitive Strategies","Hallowed Conclave","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Grey Knights Infantry unit from your army that is within 8\" of that enemy unit and not within Engagement Range of one or more enemy units.","Your unit can make a Normal move of up to D6\".",""],
  ["Shining Resolve","Hallowed Conclave","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Grey Knights Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of your unit, subtract 1 from the Wound roll.",""],
  ["Unending Fidelity","Hallowed Conclave","Ruse Stratégique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Grey Knights Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not shot or fought this phase, roll one D6. On a 4+, do not remove the destroyed model from play; it can shoot or fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Blades from the Beyond","Immaterial Interdiction","",1,"Fight phase, when a friendly INTERCEPTOR SQUAD unit that made a charge move this turn is selected to fight.","That INTERCEPTOR SQUAD unit.","Your unit’s melee attacks have [LANCE].",""],
  ["By Thought Alone","Immaterial Interdiction","",1,"Your Shooting phase, when a friendly INTERCEPTOR SQUAD unit starts an action.","That INTERCEPTOR SQUAD unit.","That action does not prevent your unit from being eligible to shoot.",""],
  ["Responsive Displacement","Immaterial Interdiction","",1,"Your opponent’s Movement phase, when an enemy unit that was engaged with a friendly INTERCEPTOR SQUAD unit ends a fall-back move, if that INTERCEPTOR SQUAD unit is unengaged.","That INTERCEPTOR SQUAD unit.","Your unit can make a normal move of up to D3+3\".",""],
  ["Abominus-Class Targets","Sanctic Spearhead","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Grey Knights unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack that targets a MONSTER or VEHICLE unit, add 1 to the Wound roll.",""],
  ["Argent Wrath","Sanctic Spearhead","Ruse Stratégique",1,"Your Charge phase, just after a Grey Knights Vehicle unit from your army ends a Charge move.","That GREY KNIGHTS VEHICLE unit.","Each enemy unit within 3\" of your unit must take a Battle-shock test, subtracting 1 from that test.",""],
  ["Armoured Aegis","Sanctic Spearhead","Ruse Stratégique",1,"Your Command phase.","One Grey Knights Psyker Vehicle unit from your army.","One model in your unit regains up to 3 lost wounds.",""],
  ["Force Wave","Sanctic Spearhead","Ruse Stratégique",1,"Your Movement phase or your Charge phase.","One Grey Knights Vehicle unit from your army that has not been selected to move or charge this phase.","Until the end of the phase, each time your unit makes a Normal, Advance or Charge move, it can move horizontally through terrain features.",""],
  ["Redoubled Assault","Sanctic Spearhead","Ruse Stratégique",1,"Your Movement phase, just after a Grey Knights Vehicle unit from your army Falls Back.","That GREY KNIGHTS VEHICLE unit.","Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.",""],
  ["Truesilver Will","Sanctic Spearhead","Fait Épique",1,"Any phase, just after a Grey Knights Psyker Vehicle unit from your army suffers a mortal wound.","That GREY KNIGHTS PSYKER VEHICLE unit.","Until the end of the phase, models in your unit have the Feel No Pain 4+ ability against mortal wounds.",""],
  ["Aegis Eternal","Warpbane Task Force","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Grey Knights Infantry unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit that are wholly within your Hallowed Ground have a 4+ invulnerable save.",""],
  ["Fires of Covenant","Warpbane Task Force","Tactique de Bataille",1,"Start of your opponent’s Movement phase.","One Grey Knights Infantry unit from your army.","Until the end of the phase, each time an enemy unit is set up or ends a Normal, Advance or Fall Back move within 6\" of your unit, roll one D6, adding 2 to the result if your unit is wholly within your army’s Hallowed Ground: on a 4+, that enemy unit suffers D3 mortal wounds.",""],
  ["Flames of Sanctity","Warpbane Task Force","Ruse Stratégique",1,"End of the Fight phase.","One Purifier Squad unit from your army that was eligible to fight this phase.","Roll one D6 for each enemy unit within 6\" of your unit, adding 1 to the result if your unit includes Castellan Crowe: on a 4+, that enemy unit suffers D3 mortal wounds.",""],
  ["Hallowed Beacon","Warpbane Task Force","Tactique de Bataille",1,"Reinforcements step of your Movement phase.","One Grey Knights Infantry unit (excluding Terminator units) that is arriving using the Deep Strike ability this phase.","Set up your unit wholly within your army’s Hallowed Ground and more than 6\" horizontally away from all enemy units.",""],
  ["Repelling Sphere","Warpbane Task Force","Tactique de Bataille",1,"Start of your opponent’s Charge phase.","One Grey Knights Infantry unit from your army.","Until the end of the phase, each time an enemy unit declares a charge and your unit is one of the targets of that charge, subtract 1 from the Charge roll, or subtract 2 instead if your unit is wholly within your army’s Hallowed Ground.",""],
  ["Sanctified Kill Zone","Warpbane Task Force","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One GREY KNIGHTS unit from your army that has not been selected to shoot or fight this phase and that is wholly within your army’s Hallowed Ground.","Until the end of the phase, each time a model in your unit makes an attack, re-roll a Wound roll of 1, or, re-roll the Wound roll instead if your unit is a Purifier Squad.",""],
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
  "Grey Knights Dreadnought",
  "Grey Knights Relic Razorback",
  "Grey Knights Thunderhawk Gunship",
  "Land Raider",
  "Land Raider Crusader",
  "Land Raider Redeemer",
  "Nemesis Dreadknight",
  "Razorback",
  "Rhino",
  "Stormhawk Interceptor",
  "Stormraven Gunship",
  "Stormtalon Gunship"
 ],
 "monster": [],
 "battleline": [
  "Brotherhood Terminator Squad",
  "Strike Squad"
 ],
 "epic": [
  "Brother-Captain Stern",
  "Castellan Crowe",
  "Grand Master Voldus",
  "Kaldor Draigo"
 ],
 "infantry": [
  "Interceptor Squad",
  "Paladin Squad",
  "Purgation Squad",
  "Purifier Squad",
  "Servitors"
 ],
 "character": [
  "Brother-Captain",
  "Brotherhood Champion",
  "Brotherhood Chaplain",
  "Brotherhood Librarian",
  "Brotherhood Techmarine",
  "Grand Master",
  "Grand Master in Nemesis Dreadknight",
  "Venerable Dreadnought"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Brother-Captain": "40",
 "Brotherhood Champion": "32",
 "Brotherhood Chaplain": "40",
 "Brotherhood Librarian": "40",
 "Brotherhood Techmarine": "32",
 "Brotherhood Terminator Squad": "40",
 "Castellan Crowe": "40",
 "Grand Master": "40",
 "Grand Master in Nemesis Dreadknight": "120x92",
 "Grand Master Voldus": "40",
 "Land Raider": "coque",
 "Land Raider Crusader": "coque",
 "Land Raider Redeemer": "coque",
 "Razorback": "coque",
 "Rhino": "coque",
 "Stormhawk Interceptor": "120x92",
 "Stormraven Gunship": "120x92",
 "Stormtalon Gunship": "120x92",
 "Venerable Dreadnought": "60",
 "Interceptor Squad": "32",
 "Nemesis Dreadknight": "120x92",
 "Paladin Squad": "40",
 "Purgation Squad": "32",
 "Purifier Squad": "32",
 "Strike Squad": "32",
 "Grey Knights Thunderhawk Gunship": "coque"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Grand Master in Nemesis Dreadknight": 4,
 "Land Raider": 5,
 "Land Raider Crusader": 5,
 "Land Raider Redeemer": 5,
 "Stormraven Gunship": 5,
 "Nemesis Dreadknight": 4,
 "Grey Knights Thunderhawk Gunship": 10
};

const TRANSPORTS = {
 "Land Raider": "This model has a transport capacity of 12 ^^**Grey Knights Infantry^^** models. Each ^^**Terminator^^** model takes up the space of 2 models.",
 "Land Raider Crusader": "This model has a transport capacity of 16 ^^**Grey Knights Infantry^^** models. Each ^^**Terminator^^** model takes up the space of 2 models.",
 "Land Raider Redeemer": "This model has a transport capacity of 14 ^^**Grey Knights Infantry^^** models. Each ^^**Terminator^^** model takes up the space of 2 models",
 "Razorback": "This model has a transport capacity of 6 ^^**Grey Knights Infantry^^** models. It cannot transport ^^**Terminator^^** models.",
 "Rhino": "This model has a transport capacity of 12 ^^**Grey Knights Infantry^^** models. It cannot transport ^^**Terminator^^** models.",
 "Stormraven Gunship": "This model has a transport capacity of 12 ^^**Grey Knights Infantry^^** models and 1 ^^**Grey Knights Venerable Dreadnought^^** model. Each ^^**Terminator^^** model takes up the space of 2 models.",
 "Grey Knights Thunderhawk Gunship": "This model has a transport capacity of 30 ^^**Grey Knights Infantry^^** models. Each ^^**Terminator^^** model takes up the space of 2 models.",
 "Grey Knights Relic Razorback": "This model has a transport capacity of 6 **^^Grey Knights Infantry^^** models. It cannot transport ^^**Terminator^^** models."
};
const FACTION = [
 [
  "Gate of Infinity",
  "If your Army Faction is Grey Knights, at the end of your opponent’s Fight phase, you can select a number of units from your army that are on the battlefield (excluding units that are within Engagement Range of one or more enemy units), providing every model in those units has this ability. The maximum number of units you can select depends on the battle size, as follows:\n\nIncursion - Up to 2 units\nStrike Force - Up to 3 units\nOnslaught - Up to 4 units\n\n- Place those units in strategic reserves.\n- Those units can make an ingress move in your next Movement phase (including in your first turn)"
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/greyknights.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_UNITE = {
 "Brother-Captain": [
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Œil du Jugement (Psychique)",
   "texte": "Each time this model makes an attack, you can re-roll the Wound roll."
  }
 ],
 "Purifier Squad": [
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Sainteté du Dessein",
   "texte": "Each time a model in this unit makes an attack, re-roll a Wound roll of 1."
  }
 ]
};
const APTIS_COND = {
 "Purifier Squad": [
  {
   "champ": "rrW",
   "val": "failed",
   "nom": "Sainteté du Dessein — objectif",
   "quand": "La cible est à portée d'un pion d'objectif",
   "texte": "If the target is within range of an objective marker, you can re-roll the Wound roll instead."
  }
 ],
 "Grand Master": [
  {
   "champ": "atkMod",
   "val": 3,
   "port": "C",
   "nom": "Puissance de Titan (Psychique)",
   "quand": "Déclenchée ce tour — une fois par bataille",
   "texte": "Once per battle, at the start of the Fight phase: add 3 to the Attacks characteristic of melee weapons equipped by this model."
  },
  {
   "champ": "strMod",
   "val": 3,
   "port": "C",
   "nom": "Puissance de Titan — la Force",
   "quand": "Déclenchée ce tour — une fois par bataille",
   "texte": "... and add 3 to the Strength characteristic."
  }
 ],
 "Paladin Squad": [
  {
   "champ": "dmgMod",
   "val": 1,
   "port": "C",
   "nom": "Assaut Accordé (Psychique)",
   "quand": "L'unité a chargé ce tour",
   "texte": "Each time this unit makes a Charge move, until the end of the turn, add 1 to the Damage characteristic of melee weapons equipped by Paladin Squad models in this unit."
  }
 ],
 "Brotherhood Champion": [
  {
   "champ": "atkMod",
   "val": 1,
   "port": "C",
   "nom": "Exemple Inspirant",
   "quand": "Le Champion a déjà détruit un PERSONNAGE au Combat (+1 par personnage : cocher une fois)",
   "texte": "Each time this model destroys a Character model in the Fight phase, until the end of the battle, add 1 to the Attacks characteristic of its Nemesis force weapon."
  }
 ]
};
const APTIS_CIBLE = {
 "Castellan Crowe": [
  {
   "vs": [
    "perso"
   ],
   "champ": "rrH",
   "val": "failed",
   "nom": "Prescience (Psychique)",
   "texte": "Each time this model makes an attack that targets a Character unit, you can re-roll the Hit roll."
  }
 ],
 "Grand Master in Nemesis Dreadknight": [
  {
   "vs": [
    "mon",
    "veh"
   ],
   "champ": "rrH",
   "val": "failed",
   "port": "C",
   "nom": "Vague de Courroux (Psychique)",
   "texte": "Each time this model makes a melee attack that targets a Monster or Vehicle unit, you can re-roll the Hit roll."
  },
  {
   "vs": [
    "mon",
    "veh"
   ],
   "champ": "rrW",
   "val": "failed",
   "port": "C",
   "nom": "Vague de Courroux (Psychique)",
   "texte": "... you can re-roll the Wound roll (and the Damage roll, which is not simulated)."
  }
 ],
 "Stormhawk Interceptor": [
  {
   "vs": [
    "vol"
   ],
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Intercepteur",
   "texte": "Each time this model makes a ranged attack that targets a unit that can Fly, add 1 to the Hit roll."
  }
 ],
 "Stormtalon Gunship": [
  {
   "sauf": [
    "vol"
   ],
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Mitraillage",
   "texte": "Each time this model makes a ranged attack that targets a unit that cannot Fly, add 1 to the Hit roll."
  }
 ]
};
const AURAS_PERSO = {
 "Brother-Captain": [
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Main de Fer (Psychique)",
   "texte": "While this model is leading a unit, melee weapons equipped by models in that unit have the [LETHAL HITS] ability."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "detach": "Warpbane Task Force",
  "kw": [],
  "champ": "rrH",
  "val": "failed",
  "nom": "Terre Consacrée — entièrement dedans",
  "quand": "L'unité est entièrement dans ta Terre Consacrée",
  "texte": "If that unit is wholly within your army’s Hallowed Ground, you can re-roll the Hit roll instead."
 },
 {
  "detach": "Argent Assault",
  "kw": [
   "Paladin Squad"
  ],
  "champ": "wndMod",
  "val": 1,
  "port": "C",
  "nom": "Champions Intrépides",
  "quand": "La Force de l'attaque est inférieure à l'Endurance de la cible",
  "texte": "When a friendly PALADIN SQUAD unit is selected to fight, if the S of those attacks is lower than the T of the target, those attacks have +1 to wound rolls."
 },
 {
  "detach": "Banishers",
  "kw": [],
  "mot": "sust",
  "port": "C",
  "nom": "Force Canalisée — Touches Soutenues",
  "quand": "Test de Commandement réussi, ce choix retenu — armes [PSYCHIQUE] seulement",
  "texte": "If that Leadership test is passed: melee weapons with the [psychic] ability also have the [sustained hits 1] ability."
 },
 {
  "detach": "Banishers",
  "kw": [],
  "mot": "lethal",
  "port": "C",
  "nom": "Force Canalisée — Touches Fatales",
  "quand": "Test de Commandement réussi, ce choix retenu — armes [PSYCHIQUE] seulement",
  "texte": "If that Leadership test is passed: melee weapons with the [psychic] ability also have the [LETHAL HITS] ability."
 },
 {
  "detach": "Brotherhood Strike",
  "kw": [],
  "champ": "rrH",
  "val": "ones",
  "nom": "Fureur de Titan",
  "quand": "L'unité est arrivée en Frappe en Profondeur ce tour",
  "texte": "Each time a unit from your army is set up using the Deep Strike ability, until the end of the turn, each time a model in that unit makes an attack, re-roll a Hit roll of 1."
 },
 {
  "detach": "Brotherhood Strike",
  "kw": [],
  "champ": "rrW",
  "val": "ones",
  "nom": "Fureur de Titan",
  "quand": "L'unité est arrivée en Frappe en Profondeur ce tour",
  "texte": "... and re-roll a Wound roll of 1."
 },
 {
  "source": "Brotherhood Techmarine",
  "kw": [
   "Grand Master in Nemesis Dreadknight",
   "Grey Knights Thunderhawk Gunship",
   "Land Raider",
   "Land Raider Crusader",
   "Land Raider Redeemer",
   "Nemesis Dreadknight",
   "Razorback",
   "Rhino",
   "Stormhawk Interceptor",
   "Stormraven Gunship",
   "Stormtalon Gunship",
   "Venerable Dreadnought"
  ],
  "champ": "hitMod",
  "val": 1,
  "nom": "Bénédiction de l'Omnimessie",
  "quand": "Le VÉHICULE a été béni par le Techmarine à ta phase de Commandement",
  "texte": "Until the start of your next Command phase, each time that Vehicle model makes an attack, add 1 to the Hit roll."
 },
 {
  "source": "Venerable Dreadnought",
  "kw": [],
  "champ": "hitMod",
  "val": 1,
  "nom": "Guidance des Anciens (Psychique)",
  "quand": "La cible a été touchée par le Venerable Dreadnought cette phase",
  "texte": "Each time a Grey Knights model from your army makes an attack which targets that unit, add 1 to the Hit roll."
 },
 {
  "source": "Razorback",
  "kw": [],
  "champ": "apMod",
  "val": 1,
  "nom": "Concentration du Feu",
  "quand": "L'unité a débarqué du Razorback ce tour, et la cible a été touchée par lui",
  "texte": "Each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1."
 }
];
const OCTROIS_DETACH = {
 "Warpbane Task Force": [
  {
   "qui": "unite",
   "kw": [],
   "champ": "rrH",
   "val": "ones",
   "nom": "Terre Consacrée",
   "texte": "Each time a model in a GREY KNIGHTS unit from your army makes a ranged attack that targets a visible target or makes a melee attack, re-roll a Hit roll of 1."
  },
  {
   "qui": "unite",
   "kw": [
    "Purifier Squad"
   ],
   "champ": "rrH",
   "val": "failed",
   "nom": "Terre Consacrée — Purificateurs",
   "texte": "If that unit is a PURIFIER SQUAD, you can re-roll the Hit roll instead."
  }
 ]
};
const STRAT_SIMU = [
 {
  "nom": "Aggressive Anticipation",
  "detach": "Augurium Task Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Brother-Captain",
   "Brotherhood Champion",
   "Brotherhood Chaplain",
   "Brotherhood Librarian",
   "Brotherhood Techmarine",
   "Brotherhood Terminator Squad",
   "Castellan Crowe",
   "Grand Master",
   "Grand Master Voldus",
   "Grand Master in Nemesis Dreadknight",
   "Interceptor Squad",
   "Nemesis Dreadknight",
   "Paladin Squad",
   "Purgation Squad",
   "Purifier Squad",
   "Strike Squad",
   "Venerable Dreadnought"
  ],
  "sauf": [],
  "aide": "relance des touches",
  "effet": {
   "rrH": "failed"
  }
 },
 {
  "nom": "Appointed Hour",
  "detach": "Augurium Task Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Brother-Captain",
   "Brotherhood Champion",
   "Brotherhood Chaplain",
   "Brotherhood Librarian",
   "Brotherhood Techmarine",
   "Brotherhood Terminator Squad",
   "Castellan Crowe",
   "Grand Master",
   "Grand Master Voldus",
   "Grand Master in Nemesis Dreadknight",
   "Interceptor Squad",
   "Nemesis Dreadknight",
   "Paladin Squad",
   "Purgation Squad",
   "Purifier Squad",
   "Strike Squad",
   "Venerable Dreadnought"
  ],
  "sauf": [],
  "aide": "touches critiques sur 5+",
  "effet": {
   "critH": 5
  }
 },
 {
  "nom": "Chaos Bane",
  "detach": "Banishers",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Brother-Captain",
   "Brotherhood Champion",
   "Brotherhood Chaplain",
   "Brotherhood Librarian",
   "Brotherhood Techmarine",
   "Brotherhood Terminator Squad",
   "Castellan Crowe",
   "Grand Master",
   "Grand Master Voldus",
   "Grand Master in Nemesis Dreadknight",
   "Interceptor Squad",
   "Nemesis Dreadknight",
   "Paladin Squad",
   "Purgation Squad",
   "Purifier Squad",
   "Strike Squad",
   "Venerable Dreadnought"
  ],
  "sauf": [],
  "aide": "[ANTI-CHAOS 4+] : blessures critiques sur 4+ — contre une unité du CHAOS seulement",
  "effet": {
   "critW": 4
  }
 },
 {
  "nom": "Purgation Pattern",
  "detach": "Brotherhood Strike",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] — l'unité est arrivée en Frappe en Profondeur ce tour",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Truesilver Channelling",
  "detach": "Brotherhood Strike",
  "pc": 2,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[BLESSURES DÉVASTATRICES] — armes [PSYCHIQUE] seulement",
  "effet": {
   "dev": true
  }
 },
 {
  "nom": "Focused Immolation",
  "detach": "Fires of Purgation",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Purgation Squad"
  ],
  "sauf": [],
  "aide": "[BLESSURES DÉVASTATRICES] et [TOUCHES SOUTENUES 1] contre l'unité désignée",
  "effet": {
   "dev": true,
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Giants of the Battlefield",
  "detach": "Hallowed Conclave",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Brother-Captain",
   "Brotherhood Chaplain",
   "Brotherhood Librarian",
   "Brotherhood Terminator Squad",
   "Grand Master",
   "Grand Master Voldus",
   "Paladin Squad"
  ],
  "sauf": [],
  "aide": "+1 attaque en mêlée",
  "effet": {
   "atkMod": 1
  }
 },
 {
  "nom": "Blades from the Beyond",
  "detach": "Immaterial Interdiction",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Interceptor Squad"
  ],
  "sauf": [],
  "aide": "[LANCE] : +1 pour blesser, l'unité ayant chargé ce tour",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Abominus-Class Targets",
  "detach": "Sanctic Spearhead",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "+1 pour blesser — contre MONSTRE ou VÉHICULE",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Sanctified Kill Zone",
  "detach": "Warpbane Task Force",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "relance des 1 pour blesser — l'unité est entièrement dans la Terre Consacrée",
  "effet": {
   "rrW": "ones"
  }
 },
 {
  "nom": "Sanctified Kill Zone — Purificateurs",
  "detach": "Warpbane Task Force",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Purifier Squad"
  ],
  "sauf": [],
  "aide": "relance des blessures — Purificateurs entièrement dans la Terre Consacrée",
  "effet": {
   "rrW": "failed"
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
  cle : "greyknights",
  nom : "Grey Knights",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
