/* ============================================================
   Données Adepta Sororitas — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py sororitas

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 47 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     33 fiches sur 38 en ont un. Les autres — des Legends, que le
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
  ["Aestred Thurga and Agathae Dolan",6,3,2,4,4,[2],{"2": 80},0,"Meneur",0,"",1,"6+"],
  ["Arco-Flagellants",7,3,7,6,2,[3, 10],{"3": 50, "10": 140},0,"",0,"",1,"8+"],
  ["Battle Sanctum",0,11,3,0,20,[1],{"1": 170},0,"",1,"",0,"7+"],
  ["Battle Sisters Squad",6,3,3,6,1,[10],{"10": 100},0,"",0,"",2,"7+"],
  ["Canoness",6,3,3,4,4,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Canoness with Jump Pack",12,3,3,4,3,[1],{"1": 75},0,"Meneur",0,"",1,"7+"],
  ["Castigator",10,10,3,6,11,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",3,"7+"],
  ["Celestian Insidiants",6,3,3,5,1,[10],{"10": 115},0,"",0,"",1,"7+"],
  ["Celestian Sacresant Aveline",6,3,3,4,4,[1],{"1": 45},0,"",1,"",1,"7+"],
  ["Celestian Sacresants",6,3,3,4,1,[5, 10],[[1, {"5": 75, "10": 150}], [3, {"5": 85, "10": 160}]],0,"",0,"",1,"7+"],
  ["Crusaders",6,3,3,4,2,[2, 4],{"2": 40, "4": 80},0,"",1,"",1,"7+"],
  ["Daemonifuge",8,3,3,4,5,[2],{"2": 85},0,"",0,"",1,"7+"],
  ["Death Cult Assassins",7,3,5,5,1,[2, 4],{"2": 55, "4": 110},0,"",1,"",1,"7+"],
  ["Dialogus",6,3,3,4,3,[1],{"1": 40},0,"Appui",0,"",1,"6+"],
  ["Dogmata",6,3,3,6,3,[1],{"1": 45},0,"Appui",0,"",1,"6+"],
  ["Dominion Squad",6,3,3,6,1,[10],[[1, {"10": 90}], [3, {"10": 100}]],0,"",0,"",1,"7+"],
  ["Exorcist",10,10,3,6,11,[1],[[1, {"1": 175}], [3, {"1": 215}]],0,"",0,"",3,"7+"],
  ["Hospitaller",6,3,3,6,3,[1],[[1, {"1": 65}], [2, {"1": 75}]],0,"Appui",0,"",1,"7+"],
  ["Imagifier",6,3,3,4,3,[1],{"1": 55},0,"Appui",0,"",1,"6+"],
  ["Immolator",12,10,3,6,11,[1],[[1, {"1": 100}], [4, {"1": 115}]],0,"",0,"",2,"7+"],
  ["Intranzia Fraye",8,7,3,4,8,[1],{"1": 135},0,"",0,"",3,"6+"],
  ["Junith Eruita",8,5,2,4,8,[1],{"1": 105},0,"Meneur",0,"",2,"6+"],
  ["Ministorum Priest",6,3,6,4,3,[1],{"1": 50},0,"Meneur",0,"",1,"7+"],
  ["Mortifiers",8,6,4,6,5,[1, 2],{"1": 70, "2": 130},0,"",0,"",2,"7+"],
  ["Morvenn Vahl",8,7,2,4,8,[1],{"1": 215},0,"Meneur",0,"",3,"6+"],
  ["Palatine",6,3,3,4,4,[1],{"1": 50},0,"Meneur",0,"",1,"7+"],
  ["Paragon Warsuits",8,7,2,4,4,[3],[[1, {"3": 165}], [3, {"3": 175}]],0,"",0,"",2,"7+"],
  ["Penitent Engines",8,6,4,6,5,[1, 2],{"1": 70, "2": 140},0,"",0,"",2,"7+"],
  ["Repentia Squad",7,3,7,6,1,[5, 10],{"5": 70, "10": 140},0,"",0,"",1,"8+"],
  ["Repressor",12,10,3,6,12,[1],{"1": 130},0,"",1,"",2,"7+"],
  ["Retributor Squad",6,3,3,6,1,[5],[[1, {"5": 105}], [3, {"5": 115}]],0,"",0,"",1,"7+"],
  ["Saint Celestine",12,3,2,4,5,[3],{"3": 135},0,"Meneur",0,"",1,"6+"],
  ["Sanctifiers",6,3,6,5,1,[9],{"9": 110},0,"",0,"",1,"7+"],
  ["Seraphim Squad",12,3,3,5,1,[5, 10],[[1, {"5": 75, "10": 150}], [3, {"5": 85, "10": 160}]],0,"",0,"",1,"7+"],
  ["Sisters Novitiate Squad",6,3,3,6,1,[10],{"10": 90},0,"",0,"",2,"7+"],
  ["Sororitas Rhino",12,9,3,6,10,[1],[[1, {"1": 65}], [4, {"1": 75}]],0,"",0,"",2,"7+"],
  ["Triumph of Saint Katherine",6,3,3,4,18,[1],{"1": 245},0,"Meneur",0,"",6,"6+"],
  ["Zephyrim Squad",12,3,3,5,1,[5, 10],[[1, {"5": 75, "10": 150}], [3, {"5": 85, "10": 160}]],0,"",0,"",1,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Aestred Thurga and Agathae Dolan","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Aestred Thurga and Agathae Dolan","Blade of Vigil","C","4",2,5,2,"2","","càc"],
  ["Aestred Thurga and Agathae Dolan","Scribe's staff","C","3",4,4,0,"1","","càc"],
  ["Arco-Flagellants","Arco-flails","C","4",4,5,0,"1","sust:1","càc"],
  ["Battle Sisters Squad","Artificer-crafted storm bolter","T","2",3,4,0,"2","rf:2","24\""],
  ["Battle Sisters Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Battle Sisters Squad","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Battle Sisters Squad","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Battle Sisters Squad","Condemnor boltgun","T","1",3,4,0,"1","anti:2 dev precision rf:1","24\""],
  ["Battle Sisters Squad","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Battle Sisters Squad","Inferno pistol","T","1",3,8,4,"D3","melta:2 pistol","6\""],
  ["Battle Sisters Squad","Meltagun","T","1",3,9,4,"D6","melta:2","12\""],
  ["Battle Sisters Squad","Ministorum flamer","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Battle Sisters Squad","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Battle Sisters Squad","Ministorum heavy flamer","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Battle Sisters Squad","Multi-melta","T","2",4,9,4,"D6","heavy melta:2","18\""],
  ["Battle Sisters Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Battle Sisters Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Battle Sisters Squad","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Battle Sisters Squad","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Battle Sisters Squad","Power weapon","C","2",4,4,2,"1","","càc"],
  ["Canoness","Bolt Pistol","T","1",2,4,0,"1","pistol","12\""],
  ["Canoness","Brazier of Holy Fire","T","D6",0,6,1,"2","ignorescover oneshot torrent","12\""],
  ["Canoness","Condemnor boltgun","T","1",2,4,0,"1","anti:2 dev precision rf:1","24\""],
  ["Canoness","Inferno Pistol","T","1",2,8,4,"D3","melta:2 pistol","6\""],
  ["Canoness","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Canoness","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Canoness","Blessed blade","C","4",2,6,2,"2","lethal","càc"],
  ["Canoness","Hallowed Chainsword","C","5",2,3,1,"1","","càc"],
  ["Canoness","Power weapon","C","4",2,4,2,"2","","càc"],
  ["Canoness with Jump Pack","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Canoness with Jump Pack","Blessed Halberd","C","5",2,5,2,"2","","càc"],
  ["Canoness with Jump Pack","Holy Eviscerator","C","3",2,6,2,"2","sust:1","càc"],
  ["Canoness with Jump Pack","Power weapon","C","4",2,4,2,"2","","càc"],
  ["Castigator","Castigator autocannons","T","4",3,9,1,"3","twin rf:4","48\""],
  ["Castigator","Castigator battle cannon","T","D6+3",3,10,1,"3","blast ignorescover","48\""],
  ["Castigator","Heavy bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Castigator","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Castigator","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Castigator","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Celestian Insidiants","Condemnor bolt pistol","T","1",3,4,0,"1","anti:4 dev pistol","12\""],
  ["Celestian Insidiants","Inferno pistol","T","1",3,8,4,"D3","melta:2 pistol","6\""],
  ["Celestian Insidiants","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Celestian Insidiants","Blessed sword","C","3",3,4,2,"2","lethal","càc"],
  ["Celestian Insidiants","Null mace","C","3",3,4,1,"1","anti:4 dev","càc"],
  ["Celestian Insidiants","Virge of Admonition","C","3",4,6,2,"3","anti:4 dev","càc"],
  ["Celestian Sacresant Aveline","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Celestian Sacresant Aveline","The Thorn of the White Rose","C","4",3,5,2,"2","","càc"],
  ["Celestian Sacresants","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Celestian Sacresants","Inferno pistol","T","1",3,8,4,"D3","melta:2 pistol","6\""],
  ["Celestian Sacresants","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Celestian Sacresants","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Celestian Sacresants","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Celestian Sacresants","Anointed Halberd","C","3",3,5,2,"1","sust:1","càc"],
  ["Celestian Sacresants","Hallowed Mace","C","3",3,4,1,"2","lethal","càc"],
  ["Celestian Sacresants","Spear of the Faithful","C","3",3,5,2,"2","","càc"],
  ["Crusaders","Power Weapon","C","3",3,4,2,"2","","càc"],
  ["Daemonifuge","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Daemonifuge","Sanctity","C","4",2,6,2,"2","anti:2 precision","càc"],
  ["Daemonifuge","The Outcast's Blades","C","6",2,4,2,"1","precision","càc"],
  ["Death Cult Assassins","Death Cult power blades","C","4",2,4,2,"1","precision","càc"],
  ["Dialogus","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Dialogus","Dialogus staff","C","3",4,4,0,"1","","càc"],
  ["Dogmata","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Dogmata","Mace of the Righteous","C","4",3,5,2,"2","","càc"],
  ["Dominion Squad","Artificer-crafted storm bolter","T","2",3,4,0,"2","rf:2 assault","24\""],
  ["Dominion Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Dominion Squad","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Dominion Squad","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Dominion Squad","Condemnor boltgun","T","1",3,4,0,"1","anti:2 dev precision rf:1","24\""],
  ["Dominion Squad","Inferno pistol","T","1",3,8,4,"D3","melta:2 pistol","6\""],
  ["Dominion Squad","Meltagun","T","1",3,9,4,"D6","melta:2 assault","12\""],
  ["Dominion Squad","Ministorum flamer","T","D6",0,5,0,"1","assault ignorescover torrent","12\""],
  ["Dominion Squad","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Dominion Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Dominion Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Dominion Squad","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Dominion Squad","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Dominion Squad","Power weapon","C","2",4,4,2,"1","","càc"],
  ["Exorcist","Exorcist Conflagration Rockets","T","3D6",3,6,1,"1","blast ignorescover indirect","36\""],
  ["Exorcist","Exorcist Missile Launcher","T","D6+2",3,10,3,"D6","indirect","36\""],
  ["Exorcist","Heavy Bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Exorcist","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Exorcist","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Hospitaller","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Hospitaller","Chirugeon's tools","C","3",4,3,0,"1","","càc"],
  ["Imagifier","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Imagifier","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Imagifier","Close combat weapon","C","3",4,3,0,"1","","càc"],
  ["Immolator","Heavy Bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Immolator","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Immolator","Immolation Flamers","T","2D6",0,6,1,"1","ignorescover torrent","18\""],
  ["Immolator","Twin Heavy Bolter","T","3",3,5,1,"2","sust:2 twin","36\""],
  ["Immolator","Twin Multi-melta","T","2",3,9,4,"D6","melta:2 twin","18\""],
  ["Immolator","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Intranzia Fraye","Heavy bolter","T","3",2,5,1,"2","sust:1","36\""],
  ["Intranzia Fraye","Melta missile array","T","2",2,9,2,"D3","melta:2","24\""],
  ["Intranzia Fraye","Ministorum heavy flamer","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Intranzia Fraye","Mace of Saint Praxedes","C","4",2,6,2,"2","sust:1","càc"],
  ["Intranzia Fraye","Throne of Blame","C","4",4,6,0,"1","extra","càc"],
  ["Junith Eruita","Twin Ministorum Heavy Flamer","T","D6",0,6,1,"1","ignorescover torrent twin","12\""],
  ["Junith Eruita","Mace of Castigation","C","4",2,6,2,"2","","càc"],
  ["Ministorum Priest","Holy Pistol","T","3",4,4,0,"1","pistol","12\""],
  ["Ministorum Priest","Zealot's vindictor (tir)","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Ministorum Priest","Power weapon","C","3",3,4,2,"1","","càc"],
  ["Ministorum Priest","Zealot's vindictor (càc)","C","3",4,5,1,"2","","càc"],
  ["Mortifiers","Heavy Bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Mortifiers","Mortifier flamer","T","D6",0,5,0,"1","ignorescover torrent twin","12\""],
  ["Mortifiers","Penitent Buzz-Blade","C","4",3,10,3,"2","sust:1","càc"],
  ["Mortifiers","Penitent Flail","C","8",3,5,1,"1","sust:1","càc"],
  ["Mortifiers","Twin Penitent Buzz-Blades","C","4",3,10,3,"2","sust:1 twin","càc"],
  ["Mortifiers","Twin Penitent Flails","C","8",3,5,1,"1","sust:1 twin","càc"],
  ["Morvenn Vahl","Fidelis","T","3",2,6,1,"2","sust:1","36\""],
  ["Morvenn Vahl","➤ Paragon missile launcher - prioris","T","2",2,9,2,"D6","","36\""],
  ["Morvenn Vahl","➤ Paragon missile launcher - sanctorum","T","2D6",2,4,0,"1","blast","36\""],
  ["Morvenn Vahl","➤ Lance of Illumination - strike","C","5",2,8,2,"3","dev","càc"],
  ["Morvenn Vahl","➤ Lance of Illumination - sweep","C","10",2,5,1,"1","dev","càc"],
  ["Palatine","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Palatine","➤ Plasma pistol - standard","T","1",2,7,2,"1","pistol","12\""],
  ["Palatine","➤ Plasma pistol - supercharge","T","1",2,8,3,"2","hazardous pistol","12\""],
  ["Palatine","Palatine blade","C","4",2,4,2,"2","","càc"],
  ["Paragon Warsuits","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Paragon Warsuits","Heavy Bolter","T","3",3,5,1,"2","sust:1","36\""],
  ["Paragon Warsuits","Ministorum heavy flamer","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Paragon Warsuits","Multi-melta","T","2",3,9,4,"D6","melta:2","18\""],
  ["Paragon Warsuits","Paragon Grenade Launchers","T","1",3,9,2,"D3","twin","24\""],
  ["Paragon Warsuits","Paragon Storm Bolters","T","2",3,4,0,"1","rf:2 twin","24\""],
  ["Paragon Warsuits","Paragon War Blade","C","4",3,8,2,"2","","càc"],
  ["Paragon Warsuits","Paragon War Mace","C","3",3,12,1,"3","","càc"],
  ["Penitent Engines","Penitent Flamers","T","2D6",0,5,0,"1","assault ignorescover torrent twin","12\""],
  ["Penitent Engines","Penitent Buzz-Blade","C","4",4,10,3,"2","sust:1","càc"],
  ["Penitent Engines","Penitent Flail","C","8",4,5,1,"1","sust:1","càc"],
  ["Penitent Engines","Twin Penitent Buzz-Blades","C","4",4,10,3,"2","sust:1 twin","càc"],
  ["Penitent Engines","Twin Penitent Flails","C","8",4,5,1,"1","sust:1 twin","càc"],
  ["Repentia Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Repentia Squad","Neural Whips","C","4",3,3,1,"1","anti:4:inf","càc"],
  ["Repentia Squad","Penitent Eviscerator","C","2",4,6,2,"2","sust:1","càc"],
  ["Repressor","Heavy flamer","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Repressor","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Repressor","Repressor twin heavy flamer","T","D6",0,6,1,"1","ignorescover torrent twin","12\""],
  ["Repressor","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Repressor","Dozer Ram","C","3",4,7,0,"1","","càc"],
  ["Retributor Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Retributor Squad","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Retributor Squad","Combi-weapon","T","1",4,4,0,"1","anti:4:inf dev rf:1","24\""],
  ["Retributor Squad","Condemnor boltgun","T","1",3,4,0,"1","anti:2 dev precision rf:1","24\""],
  ["Retributor Squad","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Retributor Squad","Inferno pistol","T","1",3,8,4,"D3","melta:2 pistol","6\""],
  ["Retributor Squad","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Retributor Squad","Ministorum heavy flamer","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Retributor Squad","Multi-melta","T","2",4,9,4,"D6","heavy melta:2","18\""],
  ["Retributor Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Retributor Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Retributor Squad","Chainsword","C","3",4,3,0,"1","","càc"],
  ["Retributor Squad","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Retributor Squad","Power weapon","C","2",4,4,2,"1","","càc"],
  ["Saint Celestine","Bolt Pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Saint Celestine","The Ardent Blade (tir)","T","D6",0,6,2,"1","ignorescover torrent","12\""],
  ["Saint Celestine","Power Weapon","C","4",3,4,2,"1","","càc"],
  ["Saint Celestine","The Ardent Blade (càc)","C","5",2,6,3,"2","dev","càc"],
  ["Sanctifiers","Holy fire","T","D6",0,6,1,"2","ignorescover oneshot torrent","12\""],
  ["Sanctifiers","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Sanctifiers","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Sanctifiers","➤ Plasma gun - standard","T","1",3,7,2,"1","rf:1","24\""],
  ["Sanctifiers","➤ Plasma gun - supercharge","T","1",3,8,3,"2","hazardous rf:1","24\""],
  ["Sanctifiers","Burning hands","C","1",2,6,2,"3","dev","càc"],
  ["Sanctifiers","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Sanctifiers","Death Cult blades","C","4",2,4,2,"1","precision","càc"],
  ["Sanctifiers","Sanctifier melee weapon","C","3",3,3,0,"1","","càc"],
  ["Seraphim Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Seraphim Squad","Inferno Pistol","T","1",3,8,4,"D3","melta:2 pistol","6\""],
  ["Seraphim Squad","Ministorum hand flamer","T","D6",0,4,0,"1","ignorescover pistol torrent","12\""],
  ["Seraphim Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Seraphim Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Seraphim Squad","Chainsword","C","4",3,3,0,"1","","càc"],
  ["Seraphim Squad","Close combat weapon","C","2",3,3,0,"1","","càc"],
  ["Seraphim Squad","Power Weapon","C","3",3,4,2,"1","","càc"],
  ["Sisters Novitiate Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Sisters Novitiate Squad","Boltgun","T","1",3,4,0,"1","rf:1","24\""],
  ["Sisters Novitiate Squad","Ministorum flamer","T","D6",0,5,0,"1","ignorescover torrent","12\""],
  ["Sisters Novitiate Squad","Novitiate autogun","T","1",3,3,0,"1","rf:1","24\""],
  ["Sisters Novitiate Squad","Novitiate autopistol","T","1",3,3,0,"1","pistol","12\""],
  ["Sisters Novitiate Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Sisters Novitiate Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Sisters Novitiate Squad","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Sisters Novitiate Squad","Novitiate melee weapon","C","2",4,4,0,"1","","càc"],
  ["Sisters Novitiate Squad","Power weapon","C","2",4,4,2,"1","","càc"],
  ["Sororitas Rhino","Hunter-killer missile","T","1",2,14,3,"D6","oneshot","48\""],
  ["Sororitas Rhino","Storm bolter","T","2",3,4,0,"1","rf:2","24\""],
  ["Sororitas Rhino","Armoured tracks","C","3",4,6,0,"1","","càc"],
  ["Triumph of Saint Katherine","Bolt Pistols","T","6",2,4,0,"1","pistol","12\""],
  ["Triumph of Saint Katherine","Relic Weapons","C","18",2,5,2,"1","","càc"],
  ["Zephyrim Squad","Bolt pistol","T","1",3,4,0,"1","pistol","12\""],
  ["Zephyrim Squad","➤ Plasma pistol - standard","T","1",3,7,2,"1","pistol","12\""],
  ["Zephyrim Squad","➤ Plasma pistol - supercharge","T","1",3,8,3,"2","hazardous pistol","12\""],
  ["Zephyrim Squad","Power weapon","C","3",3,4,2,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Aestred Thurga and Agathae Dolan","Epic Hero"],
  ["Arco-Flagellants","Infanterie"],
  ["Battle Sanctum","Fortification"],
  ["Battle Sisters Squad","Battleline"],
  ["Canoness","Personnage"],
  ["Canoness with Jump Pack","Personnage"],
  ["Castigator","Véhicule"],
  ["Celestian Insidiants","Infanterie"],
  ["Celestian Sacresant Aveline","Epic Hero"],
  ["Celestian Sacresants","Infanterie"],
  ["Crusaders","Infanterie"],
  ["Daemonifuge","Epic Hero"],
  ["Death Cult Assassins","Infanterie"],
  ["Dialogus","Personnage"],
  ["Dogmata","Personnage"],
  ["Dominion Squad","Infanterie"],
  ["Exorcist","Véhicule"],
  ["Hospitaller","Personnage"],
  ["Imagifier","Personnage"],
  ["Immolator","Véhicule"],
  ["Intranzia Fraye","Epic Hero"],
  ["Junith Eruita","Epic Hero"],
  ["Ministorum Priest","Personnage"],
  ["Mortifiers","Véhicule"],
  ["Morvenn Vahl","Epic Hero"],
  ["Palatine","Personnage"],
  ["Paragon Warsuits","Véhicule"],
  ["Penitent Engines","Véhicule"],
  ["Repentia Squad","Infanterie"],
  ["Repressor","Véhicule"],
  ["Retributor Squad","Infanterie"],
  ["Saint Celestine","Epic Hero"],
  ["Sanctifiers","Infanterie"],
  ["Seraphim Squad","Infanterie"],
  ["Sisters Novitiate Squad","Infanterie"],
  ["Sororitas Rhino","Véhicule"],
  ["Triumph of Saint Katherine","Epic Hero"],
  ["Zephyrim Squad","Infanterie"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Aestred Thurga and Agathae Dolan": [
  "Battle Sisters Squad",
  "Celestian Insidiants",
  "Celestian Sacresants",
  "Crusaders",
  "Dominion Squad",
  "Retributor Squad",
  "Sisters Novitiate Squad"
 ],
 "Canoness": [
  "Battle Sisters Squad",
  "Celestian Insidiants",
  "Celestian Sacresants",
  "Crusaders",
  "Dominion Squad",
  "Retributor Squad",
  "Sisters Novitiate Squad"
 ],
 "Canoness with Jump Pack": [
  "Seraphim Squad",
  "Zephyrim Squad"
 ],
 "Junith Eruita": [
  "Battle Sisters Squad",
  "Celestian Insidiants",
  "Celestian Sacresants",
  "Crusaders",
  "Dominion Squad",
  "Retributor Squad",
  "Sisters Novitiate Squad"
 ],
 "Ministorum Priest": [
  "Arco-Flagellants",
  "Battle Sisters Squad",
  "Celestian Insidiants",
  "Crusaders",
  "Dominion Squad",
  "Sanctifiers",
  "Sisters Novitiate Squad"
 ],
 "Morvenn Vahl": [
  "Paragon Warsuits"
 ],
 "Palatine": [
  "Battle Sisters Squad",
  "Celestian Insidiants",
  "Celestian Sacresants",
  "Crusaders",
  "Dominion Squad",
  "Retributor Squad",
  "Sisters Novitiate Squad"
 ],
 "Saint Celestine": [
  "Seraphim Squad",
  "Zephyrim Squad"
 ],
 "Triumph of Saint Katherine": [
  "Battle Sisters Squad",
  "Crusaders"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Aestred Thurga and Agathae Dolan": [
  [
   "Leader",
   "This unit can be attached to the following units: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD"
  ],
  [
   "Auto-Tapestry of the Emperor's Judgement",
   "While this unit is leading a unit and contains an Aestred Thurga model, weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Recount the Deeds of the Saints",
   "While this unit is leading a unit and contains an Agathae Dolan model, each time that unit destroys an enemy unit, you gain 1 Miracle dice. When that Agathae Dolan model is destroyed, you gain D3 Miracle dice."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Arco-Flagellants": [
  [
   "Extremis Trigger Word",
   "Each time this unit is selected to fight, you can choose to invoke its extremis trigger word. If you do, then until the end of the phase, arco-flails equipped by models in this unit have an Attacks characteristic of 6 and the HAZARDOUS ability."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Battle Sisters Squad": [
  [
   "Defenders of the Faith",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn."
  ],
  [
   "Cherub",
   "Once per battle, after this unit has performed an Act of Faith, you gain 1 Miracle dice."
  ],
  [
   "Simulacrum Imperialis",
   "At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Canoness": [
  [
   "The Emperor's Grace",
   "Once per battle, at the start of any phase, this model can use this ability. If it does, until the end of the phase, this model has a 2+ invulnerable save."
  ],
  [
   "Leader",
   "This unit can be attached to the following units: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD"
  ],
  [
   "Null Rod",
   "Models in the bearer’s unit have the Feel No Pain 4+ ability against mortal wounds and Psychic Attacks."
  ],
  [
   "Rod of Office",
   "Each time a model in the bearer's unit makes an attack, re-roll a Hit roll of 1."
  ],
  [
   "Sacred Command",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Castigator": [
  [
   "Rites of Castigation",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly Adepta Sororitas unit makes a ranged attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per turn."
  ],
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Celestian Sacresants": [
  [
   "Sworn Protectors",
   "While an Adepta Sororitas Character is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll."
  ],
  [
   "Writ of Compunction",
   "This unit has +1 OC."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Daemonifuge": [
  [
   "Holy Judgement",
   "At the start of your Shooting phase, select one enemy unit within 12\" of and visible to this unit's Ephrael Stern model. That unit must take a Battle-shock test, subtracting 2 from the result if it is a Chaos unit. If the test is failed, that enemy unit suffers 3 mortal wounds."
  ],
  [
   "Mysterious Saviours",
   "You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: \n- That use is -1 CP. \n- That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Dialogus": [
  [
   "Laud Hailer",
   "Once per battle, at the start of any phase, you can select one friendly Adepta Sororitas unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked."
  ],
  [
   "Stirring Rhetoric",
   "While this model is leading a unit, each time that unit performs an Act of Faith, the value of one of the Miracle dice used in that Act of Faith is first changed to a 6."
  ],
  [
   "Support",
   "This model can be attached to the following units: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Dogmata": [
  [
   "Executioner of Heretics (Aura)",
   "While an enemy unit is within 6\" of this model, worsen the Leadership characteristic of models in that unit by 1."
  ],
  [
   "Unflinching Determination",
   "While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit."
  ],
  [
   "Support",
   "This model can be attached to the following units: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Dominion Squad": [
  [
   "Holy Vanguard",
   "If this unit has a Leader unit attached to it during the Declare Battle Formations step and this unit starts the battle embarked within a Transport, that Leader unit gains the Scouts 6\" ability."
  ],
  [
   "Righteous Awareness",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8” of this unit, if this unit is not within Engagement Range of one or more enemy units it can make a Normal move of up to D6”."
  ],
  [
   "Cherub",
   "Once per battle, after this unit has performed an Act of Faith, you gain 1 Miracle dice."
  ],
  [
   "Simulacrum Imperialis",
   "At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Exorcist": [
  [
   "Damaged: 1-4 Wounds Remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Devastating Refrain",
   "In your Shooting phase, after this model has shot, if one or more of those attacks made with an Indirect Fire weapon scored a hit against an enemy unit, that unit must take a Battle-shock test. Each time such an attack destroys an enemy model that has the Deadly Demise ability, the model's Deadly Demise ability inflicts mortal wounds on a D6 roll of 5+ instead of a 6."
  ],
  [
   "Symphonic Payload",
   "This unit can re-roll rolls to determine the A of a weapon."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Hospitaller": [
  [
   "Medicus Ministorum",
   "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability."
  ],
  [
   "Sacred Healing",
   "While this model is leading a unit, in your Command phase, you can return up to 1 destroyed model (excluding Character models) to that unit. If you wish, you first discard 1 Miracle dice; if you do, you can return up to D3+1 destroyed models (excluding Character models) to that unit instead."
  ],
  [
   "Support",
   "This model can be attached to the following units: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Imagifier": [
  [
   "Litany of Deeds",
   "Each time you gain a Miracle dice as the result of a friendly ADEPTA SORORITAS unit or model being destroyed, if that unit or model was destroyed within 12\" of this model, you can re-roll the result of that Miracle dice before adding it to your Miracle dice pool."
  ],
  [
   "Stanchion of Holy Martyrs",
   "While this model is leading a unit, models in that unit have a Save characteristic of 2+ and a 4+ invulnerable save."
  ],
  [
   "Support",
   "This model can be attached to the following units: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Immolator": [
  [
   "Transport",
   "This model has a transport capacity of 6 ADEPTA SORORITAS INFANTRY models. It cannot transport JUMP PACK models or the Triumph of Saint Katherine.\n\nAt the start of the Declare Battle Formations step, you can select one BATTLE SISTERS SQUAD, DOMINION SQUAD or SISTERS NOVITIATE SQUAD from your army. If you do, that unit is split into two units, each containing as equal a number of models as possible (when splitting a unit in this way, make a note of which models form each of the two new units. If you are splitting a unit that has the Cherub ability, only one of the new units can use that ability during the battle – make a note of which of the new units this will be). One of these units must start the battle embarked within this TRANSPORT; the other can start the battle embarked within another TRANSPORT, or it can be deployed as a separate unit."
  ],
  [
   "Purge and Cleanse",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that enemy unit cannot have the Benefit of Cover."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Junith Eruita": [
  [
   "The Pulpit of Saint Holline’s Basilica",
   "- This unit has Stealth.\n- Melee attacks that target this unit have -1 to hit rolls."
  ],
  [
   "Fiery Conviction",
   "If this model is on the battlefield at the start\nof your Command phase, you can choose one of the following:\n■ Discard 1 Miracle dice and gain 1CP.\n■ Take a Leadership test for this model, if that test is passed, gain 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following units: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Mortifiers": [
  [
   "Anguish of the Unredeemed",
   "Each time a model in this unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 2+, do not remove it from play; that destroyed model can fight after attacking unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Anchorite Sarcophagus",
   "The bearer has a Move characteristic of 7\" and a Save Characteristic of 3+."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Morvenn Vahl": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ Paragon Warsuits"
  ],
  [
   "Abbess Sanctorum",
   "While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Righteous Repugnance",
   "Each time this model's unit is selected to shoot or fight, you can discard 1 Miracle dice. If you do, until the end of the phase, add 3 to the Attacks characteristic of Fidelis and the Lance of Illumination. Each time an enemy unit is destroyed by this model, you gain 1 Miracle dice."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Palatine": [
  [
   "Fury of the Righteous",
   "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Rapturous Blows",
   "Each time this model’s unit is selected to fight, you can discard 1 Miracle dice. If you do, then until the end of the phase, each time a melee attack made by this model scores a wound, the target of that attack suffers 1 mortal wound in addition to any normal damage."
  ],
  [
   "Leader",
   "This model can be attached to the following units: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Paragon Warsuits": [
  [
   "Righteous Paragons",
   "Each time a model in this unit makes an attack that targets a MONSTER or VEHICLE unit, add 1 to the Hit roll and add 1 to the Wound roll."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Penitent Engines": [
  [
   "Endless Suffering",
   "This unit is eligible to declare a charge in a turn in which it Advanced"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Ministorum Priest": [
  [
   "Righteous Smiting",
   "While this model is leading a unit, each time a model in that unit makes a melee attack, add 1 to the Wound roll."
  ],
  [
   "Zealot",
   "Once per battle, in the Fight phase, this model can use this ability. If it does, until the end of the phase, improve the Strength and Attacks characteristics of melee weapons equipped by this model by 3."
  ],
  [
   "Holy Mission",
   "If this model is attached to a Dominion Squad during the Declare Battle Formations step, it gains the Scouts 6\" ability. If this model is attached to a Sisters Novitiate Squad during the Declare Battle Formations step, it gains the Infiltrators ability."
  ],
  [
   "Leader",
   "This model can be attached to the following units: ARCO-FLAGELLANTS, BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CRUSADERS, DOMINION SQUAD, SANCTIFIERS, SISTERS NOVITIATE SQUAD"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Repentia Squad": [
  [
   "Overseer of Redemption",
   "While this unit contains a Repentia Superior model, each time a Sisters Repentia model in this unit makes a melee attack, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Retributor Squad": [
  [
   "Cherubs",
   "Twice per battle, after this unit has performed an Act of Faith, you gain 1 Miracle dice."
  ],
  [
   "Storm of Retribution",
   "Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1. If such an attack targets an enemy unit that has destroyed one or more Adepta Sororitas units from your army during the battle, add 1 to the Hit roll and add 1 to the Wound roll as well."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Saint Celestine": [
  [
   "Healing Tears",
   "While this unit contains a Celestine model, in your Command phase, you can return 1 destroyed Geminae Superia model to this unit."
  ],
  [
   "Lifewards",
   "While this unit contains one or more Geminae Superia models, Celestine has the Feel No Pain 4+ ability."
  ],
  [
   "Miraculous Intervention",
   "The first time this unit’s Celestine model is destroyed, roll one D6 at the end of the phase. On a 2+, set that Celestine model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with its full wounds remaining."
  ],
  [
   "Leader",
   "This unit can be attached to the following units: SERAPHIM SQUAD, ZEPHYRIM SQUAD"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Seraphim Squad": [
  [
   "Angelic Ascent",
   "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of any enemy units, it can make a Normal move of up to 6\". If it does, until the end of the turn, this unit is not eligible to declare a charge."
  ],
  [
   "Condemnatory Psalms",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is condemned:\n- While a unit is condemned, that unit has +3\" detection range."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Sisters Novitiate Squad": [
  [
   "Impetuous Fervour",
   "Impetuous Fervour: Each time a model in this unit makes an attack, re-roll a Hit roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Hit roll instead."
  ],
  [
   "Sacred Banner",
   "You can re-roll Advance and Charge rolls made for the bearer’s unit."
  ],
  [
   "Simulacrum Imperialis",
   "At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Sororitas Rhino": [
  [
   "Transport",
   "This model has a transport capacity of 12 ADEPTA SORORITAS INFANTRY models. It cannot transport JUMP PACK models or the TRIUMPH OF SAINT KATHERINE."
  ],
  [
   "Self Repair",
   "At the start of your Command phase, this model regains 1 lost wound."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Triumph of Saint Katherine": [
  [
   "Damaged: 1-6 Wounds Remaining",
   "While this model has 1-6 wounds remaining, the Attacks characteristics of all of its weapons are halved, and you can only select one ability when using its Relics of the Matriarchs ability, instead of up to two."
  ],
  [
   "Relics of the Matriarchs",
   "At the start of the battle round, select up to two of the abilities in the Relics of the Matriarchs section. Until the start of the next battle round, this model has those abilities."
  ],
  [
   "Relic of the Matriarch - The Fiery Heart (Aura)",
   "While a friendly Adepta Sororitas unit is within 6\" of this model, add 2\" to that unit's Move characteristic and add 1 to the Advance and Charge rolls made for that unit."
  ],
  [
   "Relic of the Matriarch - Censer of the Sacred Rose (Aura)",
   "While a friendly Adepta Sororitas unit is within 6\" of this model, you can re-roll all Battle-shock tests taken for that unit."
  ],
  [
   "Relic of the Matriarch - Simulacrum of the Ebon Chalice (Aura)",
   "While a friendly Adepta Sororitas unit is within 6\" of this model, that unit can perform up to two Acts of Faith per phase, instead of only one."
  ],
  [
   "Relic of the Matriarch - Simulacrum of the Argent Shroud (Aura)",
   "While a friendly Adepta Sororitas unit is within 6\" of this model, each time a model in that unit makes a ranged attack, re-roll a Wound roll of 1."
  ],
  [
   "Relic of the Matriarch - Icon of the Valorous Heart (Aura)",
   "While a friendly Adepta Sororitas unit is within 6\" of this model, models in that unit have the Feel No Pain 6+ ability."
  ],
  [
   "Relic of the Matriarch - Petals of the Bloody Rose (Aura)",
   "While a friendly Adepta Sororitas unit is within 6\" of this model, improve the Armour Penetration characteristic of melee weapons equipped by model in that unit by 1."
  ],
  [
   "Solemn Procession",
   "Each time you gain 1 Miracle dice at the start of your turn, if this model is on the battlefield, do not roll one D6 to determine the value of that Miracle dice; it has a value of 6."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: BATTLE SISTERS SQUAD, CRUSADERS"
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Zephyrim Squad": [
  [
   "Embodied Prophecy",
   "Each time this unit is selected to fight, select one of the following abilities to apply to melee weapons equipped by models in this unit until the end of the phase:\n- Sustained Hits 1\n- Lethal Hits\n\nIf this unit made a Charge move this turn, until the end of the phase, select both abilities above to apply to melee weapons equipped by models in this unit instead."
  ],
  [
   "Sacred Banner",
   "You can re-roll Advance and Charge rolls made for the bearer’s unit."
  ],
  [
   "Condemnatory Psalms",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is condemned:\n- While a unit is condemned, that unit has +3\" detection range."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Repressor": [
  [
   "Transport",
   "This model has a transport capacity of 12 ADEPTA SORORITAS INFANTRY models. It cannot transport JUMP PACK models or the Triumph of Saint Katherine."
  ],
  [
   "Emergency Combat Embarkation",
   "Once per turn, in your opponent’s Charge phase, after an enemy unit has selected targets for its charge but before it makes a Charge move, you can select one ADEPTA SORORITAS unit from your army that was selected as a target of that charge. Provided that unit is not within Engagement Range of any enemy units and every model in that unit is within 3\" of this TRANSPORT, it can embark within this TRANSPORT."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Canoness with Jump Pack": [
  [
   "Divine Deliverance",
   "Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by the model and those weapons have the [DEVASTATING WOUNDS] ability"
  ],
  [
   "Leader",
   "This unit can be attached to the following units: SERAPHIM SQUAD, ZEPHYRIM SQUAD"
  ],
  [
   "Sacred Command",
   "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP."
  ],
  [
   "Condemnatory Psalms",
   "In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is condemned:\n- While a unit is condemned, that unit has +3\" detection range."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Death Cult Assassins": [
  [
   "Death Cult",
   "Each time a model in this unit makes an attack that targets a CHARACTER unit, you can re-roll the Wound roll."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Crusaders": [
  [
   "Spiritual Fortitude",
   "Models in this unit have the Feel No Pain 4+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "Attached Unit",
   "If a model from your army with the Leader ability can be attached to a BATTLE SISTERS SQUAD, it can be attached to this unit instead."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Battle Sanctum": [
  [
   "Consecrated Ground",
   "When this FORTIFICATION is set up, all parts of it must be set up within 1\" of another part. Friendly ADEPTA SORORITAS INFANTRY models can be set up or end any type of move on top of the floor sections of this FORTIFICATION. While an ADEPTA SORORITAS unit from your army is within 1\" of this FORTIFICATION, that unit can perform one additional Act of Faith per phase."
  ],
  [
   "Holy Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Celestian Sacresant Aveline": [
  [
   "Instrument of the Emperor's Wrath",
   "Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by this model and those weapons have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Daemonbreaker",
   "Each time this model makes an attack that targets a DAEMON unit, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Sanctifiers": [
  [
   "Ministorum Sermon",
   "While this unit contains a Ministorum Priest, melee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Cherub",
   "Once per battle, after this unit has performed an Act of Faith, you gain 1 Miracle dice."
  ],
  [
   "Attached Unit",
   "If a Ministorum Priest model from your army with the Leader ability can be attached to a Battle Sisters Squad, it can be attached to this unit instead. If a Ministorum Priest model from your army is attached to this unit during the Declare Battle Formations step, that model gains the Scouts 6\" ability."
  ],
  [
   "Simulacrum Imperialis",
   "At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result."
  ],
  [
   "Salvationist Medikit",
   "In your Command phase, if the bearer is on the battlefield, you can return up to D3 destroyed models (excluding Character models) to this unit."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Celestian Insidiants": [
  [
   "Rituale Nullificatus",
   "Models in this unit have the Feel No Pain 4+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "Virtue of Intolerance",
   "At the start of the battle, select one unit from your opponent’s army to be this unit’s quarry. Each time a model in this unit makes an attack that targets its quarry, that attack has the [Precision] ability and you can re-roll the Hit roll. This ability can be used even if this unit is embarked within a Transport."
  ],
  [
   "Attached Unit",
   "If a Character unit from your army can be attached to a Dominion Squad unit, it can be attached to this unit instead."
  ],
  [
   "Denuncia Oratory",
   "Each time the bearer’s unit’s quarry is destroyed, you can select a new unit from your opponent’s army to be its quarry."
  ],
  [
   "Simulacrum Imperialis",
   "At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ],
 "Intranzia Fraye": [
  [
   "Righteous Denunciation",
   "At the start of the Fight phase, each enemy unit within 6\" of this model must take a Battle-shock test, subtracting 1 from that test."
  ],
  [
   "Judged for Execution",
   "At the end of your Movement phase, you can select one enemy unit within 18\" of and visible to this model. Until the start of your next Command phase, each time a friendly Adepta Sororitas model makes an attack that targets that enemy unit, that attack has the [LETHAL HITS] ability."
  ],
  [
   "Acts of Faith",
   "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Army of Faith",2,"","Sacred Rites","Each Adepta Sororitas unit from your army can perform up to two Acts of Faith per phase, instead of just one.","",0,"","Take and Hold"],
  ["Bringers of Flame",2,"","Fervent Purgation","Ranged weapons equipped by ADEPTA SORORITAS models from your army have the [ASSAULT] ability, and each time an attack made with such a weapon targets a unit within 6\", add 1 to the Strength characteristic of that attack.","",0,"","Priority Assets"],
  ["Champions of Faith",2,"Reverend","Righteous Purpose","In your Command phase, you can select up to 3 Adepta Sororitas units from your army (including units that are embarked within Transports), until the start of your next Command phase, those units are Righteous. While a unit is Righteous:\n■ Add 1\" to the Move characteristic of models in that unit.\n■ Improve the Leadership characteristic of models in that unit by 1.\n■ Improve the Weapon Skill and Ballistic Skill characteristics of weapons equipped by Battle Sisters Squad, Celestian Insidiants, Celestian Sacresants and Paragon Warsuits models in that unit by 1.","",0,"","Disruption"],
  ["Chorus of Condemnation",1,"","Angelic Judgement","Friendly ADEPTA SORORITAS INFANTRY FLY units have the following ability: Condemnatory Psalms: In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is condemned: ▪ While a unit is condemned, that unit has +3\" detection range.","",0,"","Reconnaissance"],
  ["Hallowed Martyrs",3,"","The Blood of Martyrs","Each time an ADEPTA SORORITAS model from your army makes an attack, add 1 to the Hit roll if that model’s unit is below its Starting Strength, and add 1 to the Wound roll, as well, if that model’s unit is Below Half-strength.","",0,"","Take and Hold"],
  ["Penitent Host",2,"","Desperate for Redemption","At the start of your Command phase, you can select one of the following Vows of Atonement to be active for your army until the start of the your next Command phase. You can only select each Vow of Atonement once per battle.\n\n\nThe Path of the Penitent: Add 3\" to the Move characteristic of PENITENT model from your army.\n\n\nAbsolution in Battle: Each time a unit from your army is selected to fight, if that units made a Charge move this turn, until the end of the phase, add 1 to the Attacks and Strength characteristics of melee weapons equipped by PENITENT models in that unit.\n\n\nDeath Before Disgrace: Each time a PENITENT model from your army is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 2+, do not remove it from play; the destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.","",0,"","Purge the Foe"],
  ["Sacred Champions",1,"Reverend","Holy Quest","Friendly CELESTIAN units’ attacks have +1 BS and WS. This detachment has the REVEREND tag and cannot be taken with another REVEREND detachment.","",0,"","Take and Hold"],
  ["Sanctified Orators",1,"","Hymns of Battle","▪ Enhancements selected from this detachment do not count towards the total number of enhancements in your army. ▪ Friendly ADEPTA SORORITAS CHARACTER units have +1 Ld.","",0,"","Disruption"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Blade of Saint Ellynor",15,"Army of Faith","ADEPTA SORORITAS model only. Improve the Strength and Armour Penetration characteristics of the bearer's melee weapons by 1, and those weapons have the [Precision] ability. In addition, each time the bearer fights, if one or more enemy models is destroyed by those attacks, you gain 1 Miracle dice.",null],
  ["Divine Aspect",5,"Army of Faith","ADEPTA SORORITAS model only. In your Movement phase, you can select one enemy unit within 12\" of that bearer; that unit must take a Battle-shock test. If that test is failed, you gain 1 Miracle dice.",null],
  ["Litanies of Faith",10,"Army of Faith","CANONESS or PALATINE model only. At the start of your Command phase, if the bearer is on the battlefield, take a Leadership test for the bearer. If that test is passed, you gain 1 Miracle dice.",null],
  ["Triptych of the Macharian Crusade",20,"Army of Faith","ADEPTA SORORITAS model only. Each time the bearer uses an Act of Faith to substitute a saving throw, that saving throw is successful, irrespective of the value of the Miracle dice used.",null],
  ["Fire and Fury",30,"Bringers of Flame","Adepta Sororitas model only. While the bearer is leading a unit, add 1 to the Attacks characteristic of Torrent weapons equipped by models in that unit, and all other ranged weapons equipped by models that unit have the [SUSTAINED HITS 1] ability.",null],
  ["Iron Surplice of Saint Istalela",10,"Bringers of Flame","CANONESS or PALATINE model only. The bearer has a Save characteristic of 2+ and the Feel No Pain 5+ ability.",null],
  ["Manual of Saint Griselda",20,"Bringers of Flame","ADEPTA SORORITAS model only. At the start of your Command phase, you can discard up to 2 Miracle dice. Then, add 1 Miracle dice to your Miracle Dice pool showing a value equal to the sum of the two Miracle dice you discarded (to a maximum of 6).",null],
  ["Righteous Rage",15,"Bringers of Flame","Adepta Sororitas model only. Each time the bearer is selected to fight, you can first discard up to 3 Miracle dice. For each Miracle dice just discarded, until the end of the phase, add 1 to the Attacks and Strength characteristics of the bearer's melee weapons.",null],
  ["Eyes of the Oracle",10,"Champions of Faith","ADEPTA SORORITAS model only. The bearer’s weapons have the [PRECISION] ability. Each time the bearer’s unit destroys an enemy Character model, you gain 1CP.",null],
  ["Mark of Devotion",30,"Champions of Faith","Adepta Sororitas model only. Add 1 to the Attacks characteristic of the bearer’s melee weapons. While the bearer’s unit is Righteous, add 2 to the Attacks characteristic and add 1 to the Damage characteristic of the bearer’s melee weapons instead.",null],
  ["Sanctified Amulet",25,"Champions of Faith","ADEPTA SORORITAS model only. Enemy units that are set up on the battlefield from Reserves cannot be set up within 12\" of the bearer",null],
  ["Triptych of Judgement",15,"Champions of Faith","ADEPTA SORORITAS model only. Each time a model in the bearer’s unit makes an attack, you can ignore any or all modifiers to that attack’s Ballistic Skill or Weapon Skill characteristics and/or any or all modifiers to the Hit roll.",null],
  ["Clarion of Urgency",15,"Chorus of Condemnation","At the end of your opponent’s Fight phase, if this unit is unengaged, you can place this unit in strategic reserves.",null],
  ["Symphonic Payload (Upgrade)",10,"Chorus of Condemnation","EXORCIST unit only. This unit can re-roll rolls to determine the A of a weapon.",null],
  ["Chaplet of Sacrifice",25,"Hallowed Martyrs","ADEPTA SORORITAS model only. At the end of your Command phase, if the bearer is on the battlefield, you can re-roll one Miracle dice from your Miracle dice pool and return it to your Miracle dice pool with the new result you rolled. When doing so, if the bearer's unit is below its Starting Strength, you can re-roll up to 3 Miracle dice in this way instead.",null],
  ["Mantle of Ophelia",20,"Hallowed Martyrs","Canoness or Palatine model only. Each time an attack is allocated to the bearer, change the Damage characteristic of that attack to 1.",null],
  ["Saintly Example",10,"Hallowed Martyrs","ADEPTA SORORITAS model only. When the bearer is destroyed, you gain an additional D3 Miracle dice.",null],
  ["Through Suffering, Strength",25,"Hallowed Martyrs","Adepta Sororitas model only. Add 1 to the Attacks, Strength and Damage characteristics of the bearer’s melee weapons. If the bearer has lost one or more wounds, add 2 to the Attacks, Strength and Damage characteristics of the bearer’s melee weapons instead.",null],
  ["Catechism of Divine Penitence",15,"Penitent Host","CANONESS, PALATINE, or MINISTORUM PRIEST model only. The bearer gains the PENITENT keyword.",null],
  ["Psalm of Righteous Judgement",20,"Penitent Host","ADEPTA SORORITAS model only. While the bearer is on the battlefield, each time an enemy unit is destroyed by a PENITENT unit from your army, you can discard 1 Miracle dice to gain 1 Miracle dice showing a value of 6.",null],
  ["Refrain of Enduring Faith",15,"Penitent Host","PENITENT model only. While the bearer is leading a unit, models in that unit have a 5+ invulnerable save.",null],
  ["Verse of Holy Piety",15,"Penitent Host","PENITENT model only. Once per battle, at the start of the battle round, select one Vow of Atonement. Until the start of the next battle round, that Vow of Atonement is active for the bearer's unit in addition to any that is active for your army, even if you have already selected that Vow of Atonement this battle.",null],
  ["Perfervid Haste",10,"Sacred Champions","This unit has +1\" M.",null],
  ["Writ of Compunction (Upgrade)",20,"Sacred Champions","CELESTIAN SACRESANTS unit only. This unit has +1 OC.",null],
  ["Hagiomnifex (Upgrade)",25,"Sanctified Orators","ADEPTA SORORITAS CHARACTER model only (excluding PENITENT units). (Once per turn, per unit) At the start of a phase, you can use this ability. If you do, select one of the abilities below: ▪ Rite of Revelation: While this unit is shooting, enemy units have +6\" detection range. ▪ Sermon of Intolerance: This unit’s battle-shock rolls automatically succeed. ▪ Catechism of Raging Fervour: This unit has +1\" M. ▪ Psalm of Righteous Smiting: This unit’s attacks have +1 S. ▪ Chorus of Repudiation: Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Angelic Descent","Army of Faith","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One ADEPTA SORORITAS JUMP PACK unit from your army.","Remove your unit from the battlefield and place it into Strategic Reserves.","You cannot select a unit that is within Engagement Range of one or more enemy units."],
  ["Blinding Radiance","Army of Faith","Ruse Stratégique",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One ADEPTA SORORITAS INFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks, or one friendly ADEPTA SORORITAS JUMP PACK unit within 3\" of such a unit.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll. If you targeted an ADEPTA SORORITAS JUMP PACK unit from your army with this Stratagem, then until the end of the phase, while a friendly ADEPTA SORORITAS INFANTRY unit is unit is within 3\" of your unit, each time an attack targets that unit, subtract 1 from the Hit roll.",""],
  ["Divine Guidance","Army of Faith","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One ADEPTA SORORITAS unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, improve the Armour Penetration characteristic of that attack by 1. If one or more enemy models are destroyed as the result of any of those attacks, you gain 1 Miracle dice.",""],
  ["Faith and Fury","Army of Faith","Tactique de Bataille",1,"Fight phase.","One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [LANCE] ability. If one or more enemy models are destroyed as the result of your unit's attacks this phase, you gain 1 Miracle dice.",""],
  ["Light of the Emperor","Army of Faith","Tactique de Bataille",2,"Command phase.","One ADEPTA SORORITAS unit from your army.","Until the end of the turn, your unit is blessed. While a unit is blessed, it can ignore any or all modifiers to the following: the profile characteristics of its models; the Weapon Skill or Ballistic Skill characteristics of weapons equipped by its models; any roll or test made for it (excluding modifiers to saving throws). If your unit has the JUMP PACK keyword, until the end of the turn, while a friendly ADEPTA SORORITAS unit is within 3\" of your unit, that friendly unit is also blessed.",""],
  ["Shield of Faith","Army of Faith","Tactique de Bataille",1,"Any phase, just after an ADEPTA SORORITAS unit from your army suffers a mortal wound.","That ADEPTA SORORITAS unit, or one friendly ADEPTA SORORITAS JUMP PACK unit within 3\" of it.","Until the end of the phase, models in your unit have the Feel No Pain 5+ ability against mortal wounds. If you targeted an ADEPTA SORORITAS JUMP PACK unit from your army with this Stratagem, then until the end of the phase, while a friendly ADEPTA SORORITAS unit is unit is within 3\" of your unit, models in that unit have the Feel No Pain 5+ ability against mortal wounds.",""],
  ["Blazing Ire","Bringers of Flame","Tactique de Bataille",2,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One ADEPTA SORORITAS TRANSPORT unit from your army that was selected as the target of one or more of the attacking unit's attacks.","One unit embarked within your TRANSPORT can disembark as if it were your Movement phase, and can then shoot as if it were your Shooting phase, but must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.",""],
  ["Carry Forth the Faithful","Bringers of Flame","Ruse Stratégique",1,"Your Movement phase, just before an ADEPTA SORORITAS TRANSPORT model from your army Advances.","That ADEPTA SORORITAS TRANSPORT model.","Until the end of the turn, you can re-roll Advance rolls made for your TRANSPORT, and units can disembark from your TRANSPORT even though it Advanced. Units that do so make a shock disembark move (Core Rules, 18.07) for that disembarkation.",""],
  ["Cleansing Flames","Bringers of Flame","Tactique de Bataille",2,"Your Shooting phase.","One ADEPTA SORORITAS unit from your army that has not been selected to shoot this phase.","Until the end of the phase, Torrent weapons equipped by models in your unit have the [DEVASTATING WOUNDS] ability",""],
  ["Righteous Blows","Bringers of Flame","Tactique de Bataille",1,"Fight phase.","One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [LETHAL HITS] ability. If one or more enemy models are destroyed as the result of attacks made by those weapons this phase, select one of those destroyed models; that destroyed model’s unit must take a Battle-shock test.",""],
  ["Rites of Fire","Bringers of Flame","Tactique de Bataille",1,"Your Shooting phase.","One ADEPTA SORORITAS unit from your army that disembarked from a TRANSPORT this turn and has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes a ranged attack that targets an enemy unit within 6\" that is also within range of an objective marker, add 1 to the Wound roll. If one or more enemy models are destroyed as the result of those attacks, select one of those destroyed models; that destroyed model’s unit must take a Battle-shock test.",""],
  ["Shield of Aversion","Bringers of Flame","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One ADEPTA SORORITAS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.",""],
  ["Bastion of Faith","Champions of Faith","Tactique de Bataille",1,"Fight phase, just after an enemy unit has selected its targets.","One Celestian Sacresants unit that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll. In addition, if your unit is Righteous, you can select one other CELESTIAN SACRESANTS unit from your army that is not Battle-shocked and is within 6\" of your unit. Until the end of the phase, each time an attack targets that CELESTIAN SACRESANTS unit, subtract 1 from the Hit roll as well.",""],
  ["Indefatigable Dedication","Champions of Faith","Ruse Stratégique",1,"Your Movement phase, just after an ADEPTA SORORITAS unit from your army Falls Back.","That ADEPTA SORORITAS unit.","Until the end of the turn, your unit is eligible to shoot in a turn in which it Fell Back. If your unit is Righteous, until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back instead.",""],
  ["Path of the Righteous","Champions of Faith","Tactique de Bataille",1,"Fight phase.","One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.","Until the end of the turn, each time a model in your unit makes a Pile-in or Consolidation move, it can move up to 6\" instead of up to 3\". When doing so, if your unit is Righteous, it does not need to end that move closer to the closest enemy model, provided it ends that move as close as possible to the closest enemy unit.",""],
  ["Shield of Denial","Champions of Faith","Tactique de Bataille",1,"Any phase, just after a mortal wound is allocated to an ADEPTA SORORITAS unit from your army.","That ADEPTA SORORITAS unit.","Until the end of the phase, models in your unit have the Feel No Pain 6+ ability against mortal wounds. If your unit is Righteous, until the end of the phase, models in your unit have the Feel No Pain 5+ ability against mortal wounds instead.",""],
  ["Suffer Not the Unfaithful","Champions of Faith","Ruse Stratégique",1,"Your Shooting phase or the Fight phase.","One ADEPTA SORORITAS unit from your army that is Righteous and that has not been selected to shoot or fight this phase.","Select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until the end of the phase, weapons equipped by models in your unit have the selected ability.",""],
  ["To the Heart of Heresy","Champions of Faith","Tactique de Bataille",1,"Fight phase.","One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.","Until the end of the turn, improve the Strength characteristic of melee weapons equipped by models in your unit by 1. If your unit is Righteous, until the end of the phase, improve the Armour Penetration characteristic of melee weapons equipped by models in your unit by 1 as well.",""],
  ["Devastating Reprise","Chorus of Condemnation","",1,"Your Shooting phase, when a friendly EXORCIST unit has shot.","One friendly ADEPTA SORORITAS INFANTRY FLY unit.","Select one enemy unit (excluding MONSTER/VEHICLE units) hit by those ranged attacks. Your unit’s ranged attacks that target that unit have [DEVASTATING WOUNDS].",""],
  ["Harmonised Exorcism","Chorus of Condemnation","",1,"Your Shooting phase, when a friendly EXORCIST unit is selected to shoot.","That EXORCIST unit.","Select one unit visible to and within 9\" of a friendly ADEPTA SORORITAS INFANTRY FLY unit. Your unit’s ranged attacks that target that unit have +1 to hit rolls.",""],
  ["Inspirational Battle Canticles","Chorus of Condemnation","",1,"Start of the Command phase.","One friendly ADEPTA SORORITAS INFANTRY FLY unit or one friendly EXORCIST unit.","Select one friendly battle-shocked ADEPTA SORORITAS unit within 6\" of your unit. That unit is no longer battle-shocked.",""],
  ["Divine Intervention","Hallowed Martyrs","Fait Épique",1,"Any phase.","One ADEPTA SORORITAS CHARACTER model from your army that was just destroyed. You can use this Stratagem on that model even though it was just destroyed.","You can discard 1-3 Miracle dice. At the end of the phase, set up that model on the battlefield, unengaged and as close as possible to where it was destroyed. That model is not part of an attached unit and its unit has a starting strength of 1. Roll one D3, adding 1 to the result for each Miracle dice you discarded. That model has that number of wounds remaining (up to its starting number of wounds).","You cannot select SAINT CELESTINE as the target of this Stratagem. You cannot select the same CHARACTER as the target of this Stratagem more than once per battle."],
  ["Praise the Fallen","Hallowed Martyrs","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One ADEPTA SORORITAS unit from your army that had one or more of its models destroyed as a result of the attacking unit’s attacks.","Your unit can shoot as if it were your Shooting phase, but it must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.",""],
  ["Righteous Vengeance","Hallowed Martyrs","Tactique de Bataille",1,"Fight phase.","One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in your unit makes a melee attack, you can re-roll the Hit roll and, if your unit is Below Half-strength, you can re-roll the Wound roll as well.",""],
  ["Sanctified Immolation","Hallowed Martyrs","Ruse Stratégique",1,"Any phase.","One ADEPTA SORORITAS VEHICLE model from your army with the Deadly Demise ability that was just destroyed. You can use this Stratagem on that model even though It was just destroyed.","Do not roll one D6 to determine whether mortal wounds are inflicted by your model's Deadly Demise ability. Instead, mortal wounds are automatically inflicted.",""],
  ["Spirit of the Martyr","Hallowed Martyrs","Ruse Stratégique",2,"Fight phase, just after an enemy unit has selected its targets.","One ADEPTA SORORITAS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["Suffering and Sacrifice","Hallowed Martyrs","Ruse Stratégique",1,"Start of the Fight phase.","One Adepta Sororitas Infantry or Adepta Sororitas Walker unit from your army.","Until the end of the phase, each time an enemy model within Engagement Range of your unit selects its targets, it must select your unit as the target of its attacks.",""],
  ["Boundless Zeal","Penitent Host","Ruse Stratégique",1,"Your Movement phase, just after an ADEPTA SORORITAS unit from your army Falls Back.","That ADEPTA SORORITAS unit.","Until the end of the turn, your unit is eligible to shoot or declare a charge in a turn in which it Fell Back. If your unit has the PENITENT keyword, it is eligible to shoot and declare a charge in a turn in which it Fell Back instead.",""],
  ["Devout Fanaticism","Penitent Host","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One PENITENT unit from your army that was selected as the target as one or more of the attacking unit’s attacks.","Your unit can make a surge move of up to D6\"\".",""],
  ["Final Redemption","Penitent Host","Fait Épique",1,"Any phase.","One PENITENT unit from your army that was just destroyed while it was within range of an objective marker you controlled. You can use this Stratagem on that unit even though it was just destroyed.","That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Lash of Guilt","Penitent Host","Tactique de Bataille",1,"Your Movement phase, just before a PENITENT unit from your army Advances.","That PENITENT unit.","Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Advanced. If your unit has the PENITENT ENGINES keyword, do not make an Advance roll for it; instead, until the end of the phase, add 6\" to the Move characteristic of models in your unit.",""],
  ["Passion of the Penitent","Penitent Host","Tactique de Bataille",1,"Fight phase.","One PENITENT unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a PENITENT model in your unit makes a melee attack, a successful unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Purity of Suffering","Penitent Host","Tactique de Bataille",1,"Your opponent's Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One PENITENT unit from your army that was selected as the target of one or more of the attacking unit's attacks.","Until the end of the phase, PENITENT models in your unit have the Feel No Pain 4+ ability.",""],
  ["Faithful Fortitude","Sacred Champions","",1,"Any phase, when a friendly CELESTIAN SACRESANTS unit suffers a mortal wound.","That CELESTIAN SACRESANTS unit.","Your unit has Feel No Pain 5+ against mortal wounds until the end of the phase.",""],
  ["Sanctified Blows","Sacred Champions","",1,"Fight phase, when a friendly CELESTIAN SACRESANTS unit is selected to fight.","That CELESTIAN SACRESANTS unit.","Your unit’s melee attacks have +1 A and S.",""],
  ["Unflinching Determination","Sacred Champions","",1,"Your Movement phase, when a friendly CELESTIAN SACRESANTS unit is selected to make an advance/fall-back move.","That CELESTIAN SACRESANTS unit.","▪ Your unit’s ranged attacks have [ASSAULT] until the end of the turn. ▪ That move does not prevent your unit from being eligible to shoot/declare a charge.",""],
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
  "Castigator",
  "Exorcist",
  "Immolator",
  "Mortifiers",
  "Paragon Warsuits",
  "Penitent Engines",
  "Repressor",
  "Sororitas Rhino"
 ],
 "monster": [],
 "battleline": [
  "Battle Sisters Squad"
 ],
 "epic": [
  "Aestred Thurga and Agathae Dolan",
  "Celestian Sacresant Aveline",
  "Daemonifuge",
  "Intranzia Fraye",
  "Junith Eruita",
  "Morvenn Vahl",
  "Saint Celestine",
  "Triumph of Saint Katherine"
 ],
 "infantry": [
  "Arco-Flagellants",
  "Celestian Insidiants",
  "Celestian Sacresants",
  "Crusaders",
  "Death Cult Assassins",
  "Dominion Squad",
  "Repentia Squad",
  "Retributor Squad",
  "Sanctifiers",
  "Seraphim Squad",
  "Sisters Novitiate Squad",
  "Zephyrim Squad"
 ],
 "character": [
  "Canoness",
  "Canoness with Jump Pack",
  "Dialogus",
  "Dogmata",
  "Hospitaller",
  "Imagifier",
  "Ministorum Priest",
  "Palatine"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Aestred Thurga and Agathae Dolan": "32",
 "Arco-Flagellants": "25",
 "Battle Sisters Squad": "32",
 "Canoness": "32",
 "Castigator": "coque",
 "Celestian Sacresants": "32",
 "Daemonifuge": "32",
 "Dialogus": "40",
 "Dogmata": "32",
 "Dominion Squad": "32",
 "Exorcist": "coque",
 "Hospitaller": "50",
 "Imagifier": "32",
 "Immolator": "coque",
 "Junith Eruita": "50",
 "Mortifiers": "50",
 "Morvenn Vahl": "60",
 "Palatine": "32",
 "Paragon Warsuits": "50",
 "Penitent Engines": "50",
 "Ministorum Priest": "32",
 "Repentia Squad": "32",
 "Retributor Squad": "32",
 "Saint Celestine": "40",
 "Seraphim Squad": "32",
 "Sisters Novitiate Squad": "32",
 "Sororitas Rhino": "coque",
 "Triumph of Saint Katherine": "120x92",
 "Zephyrim Squad": "32",
 "Canoness with Jump Pack": "32",
 "Sanctifiers": "25",
 "Celestian Insidiants": "32",
 "Intranzia Fraye": "60"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Castigator": 4,
 "Exorcist": 4,
 "Triumph of Saint Katherine": 6
};

const TRANSPORTS = {};
const FACTION = [
 [
  "Acts of Faith",
  "If your Army Faction is Adepta Sororitas, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.\n\nGAINING MIRACLE DICE\nIf your Army Faction is Adepta Sororitas, you gain 1 Miracle dice:\n- At the start of each turn.\n- Each time an Adepta Sororitas unit from your army is destroyed.\n\nEach time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side – this is your Miracle dice pool.\n\nPERFORMING AN ACT OF FAITH\nBefore making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can\nbe substituted). The dice that is being substituted is not rolled; instead the value of the selected Miracle dice is used as if it had been rolled (this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:\n■ Advance roll\n■ Battle-shock test\n■ Charge roll\n■ Damage roll\n■ Hit roll\n■ Saving throw\n■ Wound roll"
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/sororitas.json —
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
  cle : "sororitas",
  nom : "Adepta Sororitas",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
