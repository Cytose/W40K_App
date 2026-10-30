/* ============================================================
   Données Adeptus Mechanicus — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py mechanicus

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
     34 fiches sur 37 en ont un. Les autres — des Legends, que le
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
  ["Archaeopter Fusilave",0,9,3,0,10,[1],{"1": 160},0,"",0,"",0,"7+"],
  ["Archaeopter Stratoraptor",0,9,3,0,10,[1],{"1": 185},0,"",0,"",0,"7+"],
  ["Archaeopter Transvector",14,9,3,0,10,[1],{"1": 145},0,"",0,"",0,"7+"],
  ["Belisarius Cawl",8,8,2,4,10,[1],{"1": 220},0,"",0,"",3,"6+"],
  ["Corpuscarii Electro-Priests",6,3,7,5,1,[5, 10],{"5": 60, "10": 120},0,"",0,"",1,"7+"],
  ["Cybernetica Datasmith",6,4,2,5,3,[1],{"1": 20},0,"Appui",0,"",1,"7+"],
  ["Fulgurite Electro-Priests",6,3,7,5,1,[5, 10],{"5": 65, "10": 130},0,"",0,"",1,"7+"],
  ["Hastarii Exterminators",5,4,3,5,2,[5],[[1, {"5": 100}], [3, {"5": 115}]],0,"",0,"",1,"7+"],
  ["Hastarii Fusiliers",5,4,3,5,2,[5],[[1, {"5": 105}], [3, {"5": 120}]],0,"",0,"",1,"7+"],
  ["Ironstrider Ballistarii",10,7,3,5,7,[1, 2, 3],[[1, {"1": 80, "2": 160, "3": 250}], [3, {"1": 95, "2": 175, "3": 265}]],0,"",0,"",2,"7+"],
  ["Kastelan Robots",6,9,2,5,7,[2, 4],[[1, {"2": 150, "4": 300}], [3, {"2": 180, "4": 330}]],0,"",0,"",2,"7+"],
  ["Kataphron Breachers",5,7,3,6,3,[3, 6],{"3": 140, "6": 290},0,"",0,"",1,"7+"],
  ["Kataphron Destroyers",5,6,3,6,3,[3, 6],{"3": 100, "6": 200},0,"",0,"",1,"7+"],
  ["Onager Dunecrawler",8,10,2,4,11,[1],{"1": 150},0,"",0,"",3,"7+"],
  ["Pteraxii Skystalkers",12,4,4,5,2,[5, 10],[[1, {"5": 75, "10": 150}], [3, {"5": 85, "10": 160}]],0,"",0,"",1,"7+"],
  ["Pteraxii Sterylizors",12,4,4,5,2,[5, 10],[[1, {"5": 75, "10": 150}], [3, {"5": 85, "10": 160}]],0,"",0,"",1,"7+"],
  ["Secutarii Hoplites",6,3,5,4,1,[5, 10],{"5": 65, "10": 130},0,"",1,"",1,"7+"],
  ["Secutarii Peltasts",6,3,5,6,1,[5, 10],{"5": 50, "10": 100},0,"",1,"",1,"7+"],
  ["Serberys Raiders",12,4,4,5,2,[3, 6],{"3": 60, "6": 105},0,"",0,"",2,"7+"],
  ["Serberys Sulphurhounds",12,4,4,5,2,[3, 6],{"3": 55, "6": 95},0,"",0,"",2,"7+"],
  ["Servitor Battleclade",6,4,4,6,1,[9],[[1, {"9": 75}], [3, {"9": 85}]],0,"",0,"",1,"8+"],
  ["Sicarian Infiltrators",8,4,4,5,2,[5, 10],[[1, {"5": 75, "10": 155}], [3, {"5": 85, "10": 165}]],0,"",0,"",1,"7+"],
  ["Sicarian Ruststalkers",8,4,4,5,2,[5, 10],[[1, {"5": 75, "10": 160}], [3, {"5": 85, "10": 170}]],0,"",0,"",1,"7+"],
  ["Skitarii Marshal",6,3,4,5,3,[1],{"1": 35},0,"Appui",0,"",1,"6+"],
  ["Skitarii Rangers",6,3,4,5,1,[10],{"10": 85},0,"",0,"",2,"7+"],
  ["Skitarii Vanguard",6,3,4,5,1,[10],{"10": 85},0,"",0,"",2,"7+"],
  ["Skorpius Disintegrator",10,10,2,0,12,[1],{"1": 160},0,"",0,"",3,"7+"],
  ["Skorpius Dunerider",12,9,3,0,11,[1],[[1, {"1": 75}], [4, {"1": 85}]],0,"",0,"",2,"7+"],
  ["Sydonian Dragoons with radium jezzails",10,7,3,5,7,[1, 2, 3],{"1": 55, "2": 95, "3": 140},0,"",0,"",2,"7+"],
  ["Sydonian Dragoons with taser lances",10,7,3,5,7,[1, 2, 3],{"1": 60, "2": 120, "3": 170},0,"",0,"",2,"7+"],
  ["Sydonian Skatros",8,4,4,5,4,[1],{"1": 45},0,"",0,"",1,"7+"],
  ["Tech-Priest Dominus",6,4,2,5,4,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Tech-Priest Enginseer",6,4,3,5,3,[1],{"1": 55},0,"Meneur",0,"",1,"7+"],
  ["Tech-Priest Manipulus",6,4,2,5,4,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Technoarcheologist",6,4,3,5,3,[1],{"1": 45},0,"Appui",0,"",1,"7+"],
  ["Terrax-Pattern Termite",8,10,3,0,14,[1],{"1": 200},0,"",1,"",2,"6+"],
  ["Thulia Ghuld",8,8,2,4,10,[1],{"1": 180},0,"",0,"",3,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Archaeopter Fusilave","Cognis heavy stubber array","T","9",4,4,0,"1","rf:9 sust:1 twin","36\""],
  ["Archaeopter Fusilave","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Archaeopter Stratoraptor","Cognis heavy stubber","T","3",4,4,0,"1","rf:3 sust:1","36\""],
  ["Archaeopter Stratoraptor","Heavy phosphor blaster","T","3",4,6,1,"2","ignorescover","36\""],
  ["Archaeopter Stratoraptor","Twin cognis lascannon","T","1",4,12,3,"D6+1","sust:1 twin","48\""],
  ["Archaeopter Stratoraptor","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Archaeopter Transvector","Cognis heavy stubber array","T","9",4,4,0,"1","rf:9 sust:1 twin","36\""],
  ["Archaeopter Transvector","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Belisarius Cawl","Solar atomiser","T","3",2,14,4,"D6","melta:3","18\""],
  ["Belisarius Cawl","Arc Scourge","C","4",2,5,1,"1","anti:4:veh dev extra","càc"],
  ["Belisarius Cawl","Cawl's Omnissian axe","C","4",2,8,2,"2","","càc"],
  ["Belisarius Cawl","Mechadendrite hive","C","2D6",3,4,0,"1","extra","càc"],
  ["Corpuscarii Electro-Priests","Electrostatic gauntlets (tir)","T","3",3,5,0,"1","pistol sust:2","12\""],
  ["Corpuscarii Electro-Priests","Electrostatic gauntlets (càc)","C","3",4,5,0,"1","sust:2","càc"],
  ["Cybernetica Datasmith","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Cybernetica Datasmith","Power fist","C","2",3,8,2,"2","","càc"],
  ["Fulgurite Electro-Priests","Electroleech stave","C","2",3,6,1,"2","dev","càc"],
  ["Hastarii Exterminators","Hastarii arc blaster","T","1",4,6,1,"2","anti:4:veh dev","18\""],
  ["Hastarii Exterminators","➤ Eradication caster - dissipated","T","2",4,5,1,"2","anti:4:inf","30\""],
  ["Hastarii Exterminators","➤ Eradication caster - focused","T","2",4,5,2,"2","anti:4:inf","15\""],
  ["Hastarii Exterminators","Close combat weapon","C","1",4,4,0,"1","","càc"],
  ["Hastarii Exterminators","Power weapon","C","2",4,5,2,"1","","càc"],
  ["Hastarii Fusiliers","Hastarii phosphor blaster","T","2",4,5,0,"1","ignorescover","18\""],
  ["Hastarii Fusiliers","Neutron fusil","T","1",4,12,3,"D6+1","","24\""],
  ["Hastarii Fusiliers","Close combat weapon","C","1",4,4,0,"1","","càc"],
  ["Hastarii Fusiliers","Power weapon","C","2",4,5,2,"1","","càc"],
  ["Ironstrider Ballistarii","Twin cognis autocannon","T","4",4,9,1,"3","sust:1 twin","48\""],
  ["Ironstrider Ballistarii","Twin cognis lascannon","T","2",4,12,3,"D6+1","sust:1 twin","48\""],
  ["Ironstrider Ballistarii","Ironstrider feet","C","3",4,5,0,"1","","càc"],
  ["Kastelan Robots","Heavy phosphor blaster","T","3",4,6,1,"2","ignorescover","36\""],
  ["Kastelan Robots","Incendine combustor","T","D6",0,6,1,"1","ignorescover torrent","12\""],
  ["Kastelan Robots","Kastelan phosphor blaster","T","3",4,6,1,"1","ignorescover","24\""],
  ["Kastelan Robots","Twin Kastelan phosphor blaster","T","3",4,6,1,"1","ignorescover twin","24\""],
  ["Kastelan Robots","Close combat weapon","C","3",4,6,0,"1","","càc"],
  ["Kastelan Robots","Kastelan fist","C","4",4,12,2,"3","","càc"],
  ["Kastelan Robots","Twin Kastelan fist","C","4",4,12,2,"3","twin","càc"],
  ["Kataphron Breachers","Heavy arc rifle","T","2",4,8,2,"3","anti:4:veh rf:2","30\""],
  ["Kataphron Breachers","Torsion cannon","T","D3",4,6,2,"2","anti:2:inf blast","36\""],
  ["Kataphron Breachers","Arc claw","C","4",4,5,1,"1","anti:4:veh","càc"],
  ["Kataphron Breachers","Hydraulic claw","C","2",4,8,2,"3","","càc"],
  ["Kataphron Destroyers","Cognis flamer","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Kataphron Destroyers","Heavy grav-cannon","T","4",4,6,1,"2","anti:2:veh","30\""],
  ["Kataphron Destroyers","Phosphor blaster","T","1",4,5,0,"1","ignorescover rf:1","24\""],
  ["Kataphron Destroyers","➤ Kataphron plasma culverin - standard","T","4",4,7,2,"1","","36\""],
  ["Kataphron Destroyers","➤ Kataphron plasma culverin - supercharge","T","4",4,8,3,"2","hazardous","36\""],
  ["Kataphron Destroyers","Close combat weapon","C","2",4,5,0,"1","","càc"],
  ["Onager Dunecrawler","Cognis heavy stubber","T","3",4,4,0,"1","rf:3 sust:1","36\""],
  ["Onager Dunecrawler","Daedalus missile launcher","T","2",4,10,2,"D6+1","anti:2:vol","48\""],
  ["Onager Dunecrawler","Icarus array","T","6",4,8,1,"2","anti:4:vol twin","48\""],
  ["Onager Dunecrawler","Neutron laser","T","3",4,16,4,"D6+2","heavy","48\""],
  ["Onager Dunecrawler","Twin Onager heavy phosphor blaster","T","12",4,6,1,"2","ignorescover twin","36\""],
  ["Onager Dunecrawler","➤ Eradication beamer - dissipated","T","3D3",4,9,2,"2","blast sust:1","36\""],
  ["Onager Dunecrawler","➤ Eradication beamer - focused","T","3D3",4,10,3,"3","blast sust:1","18\""],
  ["Onager Dunecrawler","Dunecrawler legs","C","3",4,6,0,"1","","càc"],
  ["Pteraxii Skystalkers","Flechette blaster","T","5",4,3,0,"1","pistol","12\""],
  ["Pteraxii Skystalkers","Flechette carbine","T","6",4,3,0,"1","","18\""],
  ["Pteraxii Skystalkers","Close combat weapon","C","2",4,3,0,"1","","càc"],
  ["Pteraxii Skystalkers","Taser goad","C","3",4,6,0,"1","sust:2","càc"],
  ["Pteraxii Sterylizors","Flechette blaster","T","5",4,3,0,"1","pistol","12\""],
  ["Pteraxii Sterylizors","Phosphor torch","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Pteraxii Sterylizors","Pteraxii talons","C","2",4,4,0,"1","","càc"],
  ["Pteraxii Sterylizors","Taser goad","C","3",4,6,0,"1","sust:2","càc"],
  ["Secutarii Hoplites","Arc lance (tir)","T","1",4,5,1,"1","anti:4:veh dev","12\""],
  ["Secutarii Hoplites","Archeotech pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Secutarii Hoplites","Alpha close combat weapon","C","4",0,5,1,"1","","càc"],
  ["Secutarii Hoplites","Arc lance (càc)","C","2",4,5,1,"1","anti:4:veh dev lance","càc"],
  ["Secutarii Peltasts","Archeotech pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Secutarii Peltasts","➤ Galvanic caster - flechette","T","5",4,4,0,"1","assault","18\""],
  ["Secutarii Peltasts","➤ Galvanic caster - hammershot","T","2",4,5,1,"1","heavy","24\""],
  ["Secutarii Peltasts","Alpha close combat weapon","C","2",4,5,1,"1","","càc"],
  ["Secutarii Peltasts","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Serberys Raiders","Galvanic carbine","T","3",4,4,0,"1","dev","18\""],
  ["Serberys Raiders","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Serberys Raiders","Cavalry sabre & clawed limbs","C","4",4,4,1,"1","","càc"],
  ["Serberys Sulphurhounds","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Serberys Sulphurhounds","Phosphor blast carbine","T","D6",4,6,0,"1","blast ignorescover","18\""],
  ["Serberys Sulphurhounds","Phosphor pistol","T","1",4,4,0,"1","ignorescover pistol","12\""],
  ["Serberys Sulphurhounds","Sulphur breath","T","D6",0,3,1,"1","ignorescover pistol torrent","9\""],
  ["Serberys Sulphurhounds","Cavalry arc maul","C","1",4,5,1,"1","anti:4:veh dev extra","càc"],
  ["Serberys Sulphurhounds","Clawed limbs","C","4",4,4,0,"1","","càc"],
  ["Servitor Battleclade","Heavy arc rifle","T","1",4,8,2,"3","anti:4:veh rf:1","30\""],
  ["Servitor Battleclade","Heavy bolter","T","3",4,5,1,"2","heavy sust:1","36\""],
  ["Servitor Battleclade","Incendine igniter","T","D6",0,3,0,"1","ignorescover torrent","12\""],
  ["Servitor Battleclade","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Servitor Battleclade","Meltagun","T","1",4,9,4,"D6","melta:2","12\""],
  ["Servitor Battleclade","Phosphor blaster","T","1",4,4,0,"1","ignorescover rf:1","24\""],
  ["Servitor Battleclade","Dataspikes","C","4",4,4,0,"1","","càc"],
  ["Servitor Battleclade","Servo-claw","C","2",4,4,0,"1","","càc"],
  ["Sicarian Infiltrators","Flechette blaster","T","5",4,3,0,"1","pistol","12\""],
  ["Sicarian Infiltrators","Stubcarbine","T","3",4,4,0,"1","pistol","12\""],
  ["Sicarian Infiltrators","Power weapon","C","4",4,4,2,"1","","càc"],
  ["Sicarian Infiltrators","Taser goad","C","3",4,6,1,"1","sust:2","càc"],
  ["Sicarian Ruststalkers","Transonic blades","C","5",4,5,1,"1","dev precision","càc"],
  ["Sicarian Ruststalkers","Transonic blades & chordclaw","C","5",4,5,2,"1","anti:3:inf dev precision","càc"],
  ["Sicarian Ruststalkers","Transonic razor & chordclaw","C","3",4,5,2,"2","anti:3:inf precision","càc"],
  ["Skitarii Marshal","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Skitarii Marshal","Control stave","C","4",3,6,1,"1","","càc"],
  ["Skitarii Rangers","Arc rifle","T","1",4,8,1,"D3","anti:4:veh dev rf:1","30\""],
  ["Skitarii Rangers","Galvanic rifle","T","2",4,4,0,"1","","30\""],
  ["Skitarii Rangers","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Skitarii Rangers","Transuranic arquebus","T","1",4,7,2,"D3","heavy precision","36\""],
  ["Skitarii Rangers","➤ Plasma caliver -  supercharge","T","2",4,8,3,"2","hazardous","30\""],
  ["Skitarii Rangers","➤ Plasma caliver - standard","T","2",4,7,2,"1","","30\""],
  ["Skitarii Rangers","Alpha combat weapon","C","2",4,5,1,"1","","càc"],
  ["Skitarii Rangers","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Skitarii Vanguard","Arc rifle","T","1",4,8,1,"D3","anti:4:veh dev rf:1","30\""],
  ["Skitarii Vanguard","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Skitarii Vanguard","Radium carbine","T","3",4,3,0,"1","anti:4:inf","18\""],
  ["Skitarii Vanguard","Transuranic arquebus","T","1",4,7,2,"D3","heavy precision","36\""],
  ["Skitarii Vanguard","➤ Plasma caliver -  supercharge","T","2",4,8,3,"2","hazardous","30\""],
  ["Skitarii Vanguard","➤ Plasma caliver - standard","T","2",4,7,2,"1","","30\""],
  ["Skitarii Vanguard","Alpha combat weapon","C","2",4,5,1,"1","","càc"],
  ["Skitarii Vanguard","Close combat weapon","C","1",4,3,0,"1","","càc"],
  ["Skorpius Disintegrator","Belleros energy cannon","T","2D6",4,7,2,"1","blast indirect","36\""],
  ["Skorpius Disintegrator","Cognis heavy stubber","T","3",4,4,0,"1","rf:3 sust:1","36\""],
  ["Skorpius Disintegrator","Disruptor missile launcher","T","3",4,9,2,"D6","twin","36\""],
  ["Skorpius Disintegrator","Ferrumite cannon","T","3",4,12,3,"D6+1","","48\""],
  ["Skorpius Disintegrator","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Skorpius Dunerider","Cognis heavy stubber array","T","9",4,4,0,"1","rf:9 sust:1 twin","36\""],
  ["Skorpius Dunerider","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Sydonian Dragoons with radium jezzails","Phosphor serpenta","T","1",4,5,1,"2","ignorescover pistol","18\""],
  ["Sydonian Dragoons with radium jezzails","Radium jezzail","T","1",4,5,2,"3","anti:3:inf heavy precision","36\""],
  ["Sydonian Dragoons with radium jezzails","Ironstrider feet","C","3",4,5,0,"1","","càc"],
  ["Sydonian Dragoons with taser lances","Phosphor serpenta","T","1",4,5,1,"2","ignorescover pistol","18\""],
  ["Sydonian Dragoons with taser lances","Taser lance","C","4",4,7,2,"2","anti:2 lance sust:2","càc"],
  ["Sydonian Skatros","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Sydonian Skatros","Radium Jezzail","T","1",3,5,2,"3","heavy precision anti:3:inf","36\""],
  ["Sydonian Skatros","Skatros transuranic arquebus","T","1",3,7,2,"D3","heavy precision anti:4:mon anti:4:veh","36\""],
  ["Sydonian Skatros","Sydonian Feet","C","3",4,3,0,"1","","càc"],
  ["Tech-Priest Dominus","Macrostubber","T","5",3,4,0,"1","pistol","12\""],
  ["Tech-Priest Dominus","Phosphor serpenta","T","1",3,5,1,"2","ignorescover pistol","18\""],
  ["Tech-Priest Dominus","Volkite blaster","T","3",3,5,0,"2","dev","24\""],
  ["Tech-Priest Dominus","➤ Eradication ray - dissipated","T","D3",3,6,1,"1","","24\""],
  ["Tech-Priest Dominus","➤ Eradication ray - focused","T","D3",3,6,2,"2","","12\""],
  ["Tech-Priest Dominus","Omnissian axe","C","4",3,6,2,"2","","càc"],
  ["Tech-Priest Enginseer","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Tech-Priest Enginseer","Omnissian axe","C","3",4,6,2,"2","","càc"],
  ["Tech-Priest Enginseer","Servo arm","C","1",4,6,2,"2","extra","càc"],
  ["Tech-Priest Manipulus","Magnarail lance","T","1",3,7,2,"3","heavy","36\""],
  ["Tech-Priest Manipulus","Transonic cannon","T","D6",0,4,0,"2","dev torrent","12\""],
  ["Tech-Priest Manipulus","Omnissian staff","C","4",3,6,1,"2","","càc"],
  ["Technoarcheologist","Mechanicus pistol","T","1",4,6,1,"1","dev pistol","12\""],
  ["Technoarcheologist","Servo-arc claw","C","3",4,8,2,"2","anti:4:veh dev","càc"],
  ["Terrax-Pattern Termite","Combi bolter","T","2",4,4,0,"1","rf:2","24\""],
  ["Terrax-Pattern Termite","Heavy flamer","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Terrax-Pattern Termite","Terrax melta cutter","T","5",4,9,4,"D6","melta:2","12\""],
  ["Terrax-Pattern Termite","Twin volkite charger","T","2",4,5,0,"2","dev twin","18\""],
  ["Terrax-Pattern Termite","Termite drill","C","6",4,14,2,"D3+3","anti:3:veh","càc"],
  ["Thulia Ghuld","➤ Jericho-class conversion resonator - shockwave","T","D6+2",2,6,2,"1","blast sust:1","24\""],
  ["Thulia Ghuld","➤ Jericho-class conversion resonator - titanic impact","T","2",2,12,3,"D6+2","dev","24\""],
  ["Thulia Ghuld","➤ Rod of the War Forge - strike","C","6",2,10,2,"3","","càc"],
  ["Thulia Ghuld","➤ Rod of the War Forge - sweep","C","12",2,6,1,"1","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Archaeopter Fusilave","Véhicule"],
  ["Archaeopter Stratoraptor","Véhicule"],
  ["Archaeopter Transvector","Véhicule"],
  ["Belisarius Cawl","Epic Hero"],
  ["Corpuscarii Electro-Priests","Infanterie"],
  ["Cybernetica Datasmith","Personnage"],
  ["Fulgurite Electro-Priests","Infanterie"],
  ["Hastarii Exterminators","Infanterie"],
  ["Hastarii Fusiliers","Infanterie"],
  ["Ironstrider Ballistarii","Véhicule"],
  ["Kastelan Robots","Véhicule"],
  ["Kataphron Breachers","Infanterie"],
  ["Kataphron Destroyers","Infanterie"],
  ["Onager Dunecrawler","Véhicule"],
  ["Pteraxii Skystalkers","Infanterie"],
  ["Pteraxii Sterylizors","Infanterie"],
  ["Secutarii Hoplites","Infanterie"],
  ["Secutarii Peltasts","Infanterie"],
  ["Serberys Raiders","Monté"],
  ["Serberys Sulphurhounds","Monté"],
  ["Servitor Battleclade","Infanterie"],
  ["Sicarian Infiltrators","Infanterie"],
  ["Sicarian Ruststalkers","Infanterie"],
  ["Skitarii Marshal","Personnage"],
  ["Skitarii Rangers","Battleline"],
  ["Skitarii Vanguard","Battleline"],
  ["Skorpius Disintegrator","Véhicule"],
  ["Skorpius Dunerider","Véhicule"],
  ["Sydonian Dragoons with radium jezzails","Véhicule"],
  ["Sydonian Dragoons with taser lances","Véhicule"],
  ["Sydonian Skatros","Personnage"],
  ["Tech-Priest Dominus","Personnage"],
  ["Tech-Priest Enginseer","Personnage"],
  ["Tech-Priest Manipulus","Personnage"],
  ["Technoarcheologist","Personnage"],
  ["Terrax-Pattern Termite","Véhicule"],
  ["Thulia Ghuld","Epic Hero"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Tech-Priest Dominus": [
  "Corpuscarii Electro-Priests",
  "Fulgurite Electro-Priests",
  "Hastarii Exterminators",
  "Hastarii Fusiliers",
  "Kataphron Breachers",
  "Kataphron Destroyers",
  "Secutarii Hoplites",
  "Secutarii Peltasts",
  "Servitor Battleclade",
  "Skitarii Rangers",
  "Skitarii Vanguard"
 ],
 "Tech-Priest Enginseer": [
  "Corpuscarii Electro-Priests",
  "Fulgurite Electro-Priests",
  "Kataphron Breachers",
  "Kataphron Destroyers",
  "Secutarii Hoplites",
  "Secutarii Peltasts",
  "Skitarii Rangers",
  "Skitarii Vanguard"
 ],
 "Tech-Priest Manipulus": [
  "Corpuscarii Electro-Priests",
  "Fulgurite Electro-Priests",
  "Hastarii Exterminators",
  "Hastarii Fusiliers",
  "Kataphron Breachers",
  "Kataphron Destroyers",
  "Secutarii Hoplites",
  "Secutarii Peltasts",
  "Servitor Battleclade",
  "Skitarii Rangers",
  "Skitarii Vanguard"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Archaeopter Fusilave": [
  [
   "Bomb Rack",
   "At the end of your opponent’s Fight phase, select one visible enemy unit (excluding Lone Operative units) within 24\" of this unit, and roll six D6 for that unit: for each 4+, that unit suffers 1 mortal wound."
  ],
  [
   "Chaff Launcher",
   "The bearer has the Smoke keyword."
  ],
  [
   "Command Uplink",
   "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Archaeopter Stratoraptor": [
  [
   "Strafing Run",
   "Each time this model makes a ranged attack that targets an enemy unit (excluding units that can Fly), add 1 to the Hit roll."
  ],
  [
   "Chaff Launcher",
   "The bearer has the Smoke keyword.�"
  ],
  [
   "Command Uplink",
   "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Archaeopter Transvector": [
  [
   "Aerial Deployment",
   "In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Chaff Launcher",
   "The bearer has the Smoke keyword.�"
  ],
  [
   "Command Uplink",
   "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Belisarius Cawl": [
  [
   "Canticles of the Omnissiah",
   "At the start of your Command phase, select one of the abilities in the Canticles of the Omnissiah section. Until the start of your next Command phase, this model has that ability.\n\nInvocation of Machine Vengeance (Aura): At the start of your Command phase, select one unit from your opponent’s army. Until the start of your next Command phase, that enemy unit is your Machine Vengeance target. Each time a model in a friendly Adeptus Mechanicus unit makes an attack that targets your Machine Vengeance target, you can re-roll the Hit roll.\n\nMantra of Discipline:  This model has the Battleline keyword and has the following ability:\nBinharic Courage (Aura): While a friendly Adeptus Mechanicus unit is within 6\" of this model, add 1 to the Objective Control characteristic of models in that unit and each time you take a Battle-shock or Leadership test for that unit, add 1 to that test.’\n\nShroudpsalm (Aura): While a friendly Adeptus Mechanicus unit is within 6\" of this model, that unit has the Stealth ability."
  ],
  [
   "Mechanicus Bodyguard",
   "While this model is within 3\" of one or more other friendly Adeptus Mechanicus units, this model has the Lone Operative ability."
  ],
  [
   "Self-repair Mechanisms",
   "At the start of your Command phase, this model regains up to D3 lost wounds."
  ],
  [
   "Supreme Commander",
   "If this model is in your army, it must be your Warlord."
  ],
  [
   "Baffling Data Screed",
   "In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6: \n- On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn. \n- Or: On 2+, those ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Corpuscarii Electro-Priests": [
  [
   "Electro-shock",
   "In your Shooting phase, after this unit has shot, select one enemy unit (excluding Monsters and Vehicles) hit by one or more of those attacks. Until the end of your opponent’s next turn, that enemy unit is shocked. While a unit is shocked, subtract 2\" from its Move characteristic and subtract 2 from Advance and Charge rolls made for it."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Fulgurite Electro-Priests": [
  [
   "Electro-Infusion",
   "While a Character model is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Ironstrider Ballistarii": [
  [
   "Elevated Strider",
   "This unit is eligible to shoot in a turn in which it Fell Back or Advanced, and you can re-roll Desperate Escape tests taken for models in this unit."
  ],
  [
   "Broad Spectrum Data-tether",
   "Each time you select this unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Kastelan Robots": [
  [
   "Robotic Bodyguard",
   "While a Cybernetica Datasmith model is leading this unit, that model has the Feel No Pain 4+ ability."
  ],
  [
   "Repulsor Grid",
   "When an enemy unit targets this unit with ranged attacks, until that enemy unit has shot, when this unit makes a save roll: \n- On an unmodified 6, that enemy unit suffers 1 mortal wound after that enemy unit has shot."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Kataphron Breachers": [
  [
   "Breaching Command",
   "Each time a model in this unit makes an attack, re-roll a Hit roll of 1. While this unit is within 6” of one or more friendly Adeptus Mechanicus Battleline units, you can re-roll the Hit roll instead."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Kataphron Destroyers": [
  [
   "Sentinel Directive",
   "Each time you target this unit with the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+ when resolving that Stratagem."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Onager Dunecrawler": [
  [
   "Emanatus Forcefield (Aura)",
   "While a friendly Adeptus Mechanicus Battleline model is wholly within 6\" of this model, that Battleline model has a 4+ invulnerable save against ranged attacks."
  ],
  [
   "Damaged: 1-4 wounds remaining",
   "While this mdel has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Scuttling Walker",
   "Each time this model makes a Normal, Advance or Fall Back move, it can move through friendly Monster and Vehicle models and sections of terrain features that are 4\" or less in height."
  ],
  [
   "Broad spectrum data-tether",
   "The bearer loses the SMOKE keyword, but each time you target the bearer with a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Pteraxii Skystalkers": [
  [
   "Ride the Thermals",
   "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of one or more enemy units, it can do one of the following:\n- Make a Normal move of up to 6\".\n- Make a Normal move of up to 12\", provided every model in this unit ends that move wholly within 6\" of one or more friendly Adeptus Mechanicus Battleline units.\n\nIn either case, if it does, until the end of the turn, this unit is not eligible to declare a charge."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Pteraxii Sterylizors": [
  [
   "Searing Conflagaration",
   "Each time a model in this unit makes an attack with a phosphor torch that targets an enemy unit within range of an objective marker, re-roll a Wound roll of 1. If this unit is also within 6\" of one or more friendly Adeptus Mechanicus Battleline units, each time such an attack targets such a unit, you can re-roll the Wound roll instead."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Serberys Raiders": [
  [
   "Tactica Obliqua",
   "In your opponent's Movement phase, if an enemy unit ends a move within 8” of this unit, if this unit is not within Engagement Range of one or more enemy units, it can do one of the following:\n- Make a Normal move of up to D6\".\n- Make a Normal move of up to 6\", provided every model in this unit ends that move wholly within 6\" of one or more friendly Adeptus Mechanicus Battleline units."
  ],
  [
   "Enhanced data-tether",
   "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Stealth-screened Cybercanids",
   "This unit has Lone Operative 15\"."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Serberys Sulphurhounds": [
  [
   "Line-breakers",
   "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6 for each model in this unit that is within Engagement Range of that enemy unit, adding 2 to the result if this unit started its Charge move within 6\" of one or more friendly Adeptus Mechanicus Battleline units. For each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Sicarian Infiltrators": [
  [
   "Neurostatic Interference (Aura)",
   "While an enemy unit is within 6\" of this unit, each time a Battle-shock or Leadership test is taken for that unit, subtract 1 from that test. While this unit is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 2 from that test instead."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Sicarian Ruststalkers": [
  [
   "Optimised Gait",
   "Add 1 to Advance and Charge rolls made for this unit. While this unit is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, add 2 to Advance and Charge rolls made for this unit instead."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Skitarii Marshal": [
  [
   "Support",
   "This model can be attached to the following units: HASTARII EXTERMINATORS, HASTARII FUSILIERS, SECUTARII HOPLITES, SECUTARII PELTASTS, SKITARII RANGERS, SKITARII VANGUARD"
  ],
  [
   "Control Edict",
   "While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Hit roll."
  ],
  [
   "Servo-skull Uplink",
   "Once per battle, at the start of any phase, you can select one friendly Skitarii unit that is Battle-shocked and within 6\" of this model. That unit is no longer Battle-shocked."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Skitarii Rangers": [
  [
   "Objective Scouted",
   "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn."
  ],
  [
   "Enhanced data-tether",
   "Each time you select the bearer’s unit\nas the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Omnispex",
   "Ranged weapons equipped by models in the bearer’s unit have the IGNORES COVER ability."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Skitarii Vanguard": [
  [
   "Rad-saturation (Aura)",
   "While an enemy unit (excluding Vehicle units) is within 3\" of this unit, subtract 1 from the Objective Control characteristic of models in that unit."
  ],
  [
   "Enhanced data-tether",
   "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Omnispex",
   "Ranged weapons equipped by models in the bearer’s unit have the IGNORES COVER ability."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Skorpius Disintegrator": [
  [
   "Broad spectrum data-tether",
   "Each time you select the bearer as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Blistering Salvoes",
   "Each time this model makes an attack with a belleros energy cannon that targets an Infantry unit, add 1 to the Hit roll. Each time this model makes an attack with a ferrumite cannon that targets a Monster or Vehicle unit, add 1 to the Hit roll."
  ],
  [
   "Damaged: 1-4 wounds remaining",
   "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Skorpius Dunerider": [
  [
   "Broad spectrum data-tether",
   "Each time you select the bearer as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Fire Support",
   "In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Sydonian Dragoons with taser lances": [
  [
   "Dynamic Efficiency",
   "This unit is eligible to declare a charge in a turn in which it Advanced or Fell Back, and you can re-roll Desperate Escape tests taken for models in this unit."
  ],
  [
   "Broad Spectrum Data-tether",
   "Each time you select the bearer as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Tech-Priest Dominus": [
  [
   "Leader",
   "This model can be attached to the following units: CORPUSCARII ELECTRO-PRIESTS, FULGURITE ELECTRO-PRIESTS, HASTARII EXTERMINATORS, HASTARII FUSILIERS, KATAPHRON BREACHERS, KATAPHRON DESTROYERS, SECUTARII HOPLITES, SECUTARII PELTASTS, SERVITOR BATTLECLADE, SKITARII RANGERS, SKITARII VANGUARD"
  ],
  [
   "Lord of the Machine Cult",
   "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability. If that unit has the Electro-Priests keyword, models in that unit have the Feel No Pain 4+ ability instead"
  ],
  [
   "Data-spike",
   "At the start of the Fight phase, you can select one enemy Vehicle unit within Engagement Range of this model’s unit and roll one D6: on a 4+, that enemy unit suffers D6 mortal wounds and, until the end of the phase, the Weapon Skill characteristic of melee weapons equipped by that enemy unit is worsened by 1."
  ],
  [
   "Baffling Data Screed",
   "In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6: \n- On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn. \n- Or: On 2+, those ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Tech-Priest Enginseer": [
  [
   "Enginseer",
   "While this model is within 3\" of one or more friendly Adeptus Mechanicus Vehicle units, unless it is leading a unit, this model has the Lone Operative ability."
  ],
  [
   "Omnissiah's Blessing",
   "In your Command phase, select one friendly Adeptus Mechanicus model within 3\" of this model. That model regains up to D3 lost wounds and, if it is a Vehicle model, until the start of your next Command phase, that model has the Feel No Pain 5+ ability. Each model can only be selected for this ability once per Command phase"
  ],
  [
   "Vengeance for the Omnissiah",
   "If a friendly Adeptus Mechanicus Vehicle model is destroyed within 12\" of this model, until the end of the battle, this model’s Omnissian axe has an Attacks characteristic of 6."
  ],
  [
   "Leader",
   "This model can be attached to the following units: CORPUSCARII ELECTRO-PRIESTS, FULGURITE ELECTRO-PRIESTS, KATAPHRON BREACHERS, KATAPHRON DESTROYERS, SECUTARII HOPLITES, SECUTARII PELTASTS, SKITARII RANGERS, SKITARII VANGUARD"
  ],
  [
   "Baffling Data Screed",
   "In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6: \n- On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn. \n- Or: On 2+, those ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Tech-Priest Manipulus": [
  [
   "Leader",
   "This model can be attached to the following units: CORPUSCARII ELECTRO-PRIESTS, FULGURITE ELECTRO-PRIESTS, HASTARII EXTERMINATORS, HASTARII FUSILIERS, KATAPHRON BREACHERS, KATAPHRON DESTROYERS, SECUTARII HOPLITES, SECUTARII PELTASTS, SERVITOR BATTLECLADE, SKITARII RANGERS, SKITARII VANGUARD"
  ],
  [
   "Galvanic Field",
   "While this model is leading a unit, weapons equipped by models in that unit have the [Lethal Hits] ability."
  ],
  [
   "Defend the Divine Work",
   "Once per battle, at the start of any phase, this model can use this ability. If it does, until the end of the phase, all models in this model’s unit have a 4+ invulnerable save."
  ],
  [
   "Baffling Data Screed",
   "In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6: \n- On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn. \n- Or: On 2+, those ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Technoarcheologist": [
  [
   "Seekers of Divine Arcana",
   "While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit."
  ],
  [
   "Cogitative Instincts",
   "Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" horizontally of this model."
  ],
  [
   "Support",
   "This model can be attached to the following units: CORPUSCARII ELECTRO-PRIESTS, FULGURITE ELECTRO-PRIESTS, HASTARII EXTERMINATORS, HASTARII FUSILIERS, KATAPHRON BREACHERS, KATAPHRON DESTROYERS, SECUTARII HOPLITES, SECUTARII PELTASTS, SERVITOR BATTLECLADE, SKITARII RANGERS, SKITARII VANGUARD"
  ],
  [
   "Baffling Data Screed",
   "In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6: \n- On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn. \n- Or: On 2+, those ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Cybernetica Datasmith": [
  [
   "Support",
   "This model must be attached to the following unit: KASTELAN ROBOTS"
  ],
  [
   "Battle Protocols",
   "At the start of the battle, if this model is leading a Kastelan Robots unit, that unit enters Aegis Protocols (see below). In your Command phase, if this model is leading a Kastelan Robots unit, you can select one protocol from those listed below for that unit to enter. Once a unit enters a protocol, it remains in that protocol until it enters a different one.\n- Protector Protocol: Add 2 to the Attacks characteristic of ranged weapons equipped by Kastelan Robot models in that unit.\n- Conqueror Protocol: Add 2 to the Attacks characteristic of melee weapons equipped by Kastelan Robot models in that unit.\n- Aegis Protocol: Add 1 to the Toughness characteristic of Kastelan Robot models in that unit."
  ],
  [
   "Data-severed",
   "If there are no KASTELAN ROBOT models in this unit: \n- This unit loses VEHICLE. \n- This unit has INFANTRY."
  ],
  [
   "Baffling Data Screed",
   "In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6: \n- On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn. \n- Or: On 2+, those ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Secutarii Hoplites": [
  [
   "Titan Guard",
   "You can target this unit with the Heroic Intervention Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this phase. When oing so, if there are one or more friendly Adeptus Titanicus units on the battlefield, you can re-roll the subsequent charge roll."
  ],
  [
   "Secutarii",
   "If a model from your army with the Leader ability can be attached to a Skitarii Vanguard unit, it can be attached to this unit instead."
  ],
  [
   "Enhanced data-tether",
   "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Omnispex",
   "Ranged weapons equipped by models in the bearer’s unit have the IGNORES COVER ability."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Secutarii Peltasts": [
  [
   "Blind Barrage",
   "In your Shooting phase, after this unit has shot, select one enemy Infantry unit hit by one or more of those attacks. Until the start of your next turn, while this unit is on the battlefield, that enemy unit is blinded. While a unit is blinded, each time a model in that unit makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Secutarii",
   "If a model from your army with the Leader ability can be attached to a Skitarii Vanguard unit, it can be attached to this unit instead."
  ],
  [
   "Enhanced data-tether",
   "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Omnispex",
   "Ranged weapons equipped by models in the bearer’s unit have the IGNORES COVER ability."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Terrax-Pattern Termite": [
  [
   "Damaged: 1-5 wounds remaining",
   "While this mdel has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Termite Assault",
   "This model must start the battle in Reserves, but neither it nor any units embarked within it are counted towards any limits placed on the maximum number of Reserves units you can start the battle with. This model can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules. Any units embarked within this model can disembark after it has been set up on the battlefield, and if they do they must be set up more than 9\" away from all enemy models."
  ],
  [
   "Deadly Demise",
   "D3"
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Sydonian Skatros": [
  [
   "Dread Snipers",
   "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. That unit must take a Battle-shock test."
  ],
  [
   "Sydonian Sentinel",
   "This model cannot be your Warlord."
  ],
  [
   "Achillan Eye",
   "Each time this model makes an attack with a radium jezzail that targets an Infantry unit, you can re-roll the Wound roll. Each time this model makes an attack with a Skatros transuranic arquebus that targets a Monster or Vehicle unit, you can re-roll the Wound roll."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Sydonian Dragoons with radium jezzails": [
  [
   "Focused Hunters",
   "At the start of the battle, select one unit from your opponent’s army. Until the end of the battle, each time a model in this unit makes an attack that targets that unit, you can re-roll the Hit roll."
  ],
  [
   "Broad Spectrum Data-tether",
   "Each time you select the bearer as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Servitor Battleclade": [
  [
   "Network Override",
   "While this unit contains one or more Tech-Priest models, this unit is: \n- Eligible to perform an Action in a turn in which it Advanced. \n- Eligible to shoot in a turn in which it started an Action."
  ],
  [
   "Attached Unit",
   "If a Character unit from your army with the Leader ability can be attached to a Kataphron Breachers unit, it can be attached to this unit instead."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Thulia Ghuld": [
  [
   "Icon of War",
   "Fanatical Devotion: You can select one friendly Skitarii or Thulia Ghuld unit within 6\" of this model; until the start of your next Command phase, that unit is eligible to shoot and declare a charge in a turn in which it Advanced.\n\nAdaptive Tactics: You can select one friendly Skitarii or Thulia Ghuld unit within 6\" of this model; until the start of your next Command phase, that unit is eligible to shoot and declare a charge in a turn in which it Fell Back.\n\nThe Fires of Mars: You can select one friendly Skitarii or Thulia Ghuld unit within 6\" of this model; until the start of your next Command phase, the Conqueror Imperative and Protector Imperative are both active for that unit."
  ],
  [
   "Mechanicus Bodyguard",
   "While this model is within 3\" of one or more other friendly Adeptus Mechanicus units, this model has the Lone Operative ability."
  ],
  [
   "Secutor of Olympus",
   "At the start of your Shooting phase, select one enemy Vehicle unit within 12\" of this model and roll one D6: on a 2+, that enemy unit suffers D3+1 mortal wounds."
  ],
  [
   "Supreme Commander",
   "If this model is in your army, it must be your Warlord."
  ],
  [
   "Rod of the War Forge",
   "In your Command phase, select one of the abilities in the Icon of War section. Until the start of your next Command phase, this model has that ability."
  ],
  [
   "Baffling Data Screed",
   "In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6: \n- On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn. \n- Or: On 2+, those ranged attacks do not prevent this unit from being hidden."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Hastarii Exterminators": [
  [
   "Attached Unit",
   "If a Character unit from your army can be attached to a Skitarii Rangers unit, it can be attached to this unit instead"
  ],
  [
   "Broad‑spectrum Targeting Augurs",
   "Each time a model in this unit makes an attack with an eradication caster that targets a unit (excluding Monster and Vehicle units), that attack has the [SUSTAINED HITS 1] ability."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ],
 "Hastarii Fusiliers": [
  [
   "Attached Unit",
   "If a Character unit from your army can be attached to a Skitarii Rangers unit, it can be attached to this unit instead"
  ],
  [
   "Monocular Targeting Helms",
   "Each time a model in this unit makes an attack with a neutron fusil against a Monster or Vehicle unit, that attack has the [IGNORES COVER] ability."
  ],
  [
   "Doctrina Imperatives",
   "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Cohort Acquisitus",1,"","Noospheric Recon","▪ Friendly PTERAXII/INFILTRATORS/RANGERS/SERBERYS RAIDERS/ SERBERYS SULPHURHOUNDS units have RECON AUGURY. ▪ Friendly RECON AUGURY units have the following ability: Enhanced Augurs: In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is analysed: ▪ While a unit is analysed, that unit has +3\" detection range.","",0,"","Reconnaissance"],
  ["Cohort Cybernetica",1,"","Cyber-Psalm Programming","Add 2\" to the Move characteristic of models in Legio Cybernetica units from your army. In addition, unless that unit is Battle-shocked, add 1 to the Objective Control characteristic of models in that unit.","",0,"","Take and Hold"],
  ["Data-Psalm Conclave",2,"Data-Psalm","Benedictions Of The Omnissiah","At the start of the first battle round, select one of the following Benedictions of the Omnissiah to be active for CULT MECHANICUS units from your army until the end of the battle: Panegyric Procession Each time a CULT MECHANICUS model from your army makes a ranged attack that targets a unit within half range, improve the Armour Penetration characteristic of that attack by 1. Citation in Savagery Each time a CULT MECHANICUS unit from your army is selected to fight, if that unit made a Charge move this turn, until the end of the phase, add 1 to the Strength and Attacks characteristics of melee weapons equipped by models in that unit.","",0,"","Disruption"],
  ["Eradication Cohort",2,"","Murderous Imperative","Each time a model in a Skitarii unit from your army makes an attack: ▪ If the Protector Imperative is active for that unit, re-roll a Hit roll of 1. ▪ If the Conqueror Imperative is active for that unit, re-roll a Wound roll of 1.","",0,"","Purge the Foe"],
  ["Explorator Maniple",2,"","Acquisition At Any Cost","At the start of your Command phase, select one objective marker. Until the start of your next Command phase, that objective marker is your Acquisition objective marker. Each time an ADEPTUS MECHANICUS model from your army makes an attack, if that model’s unit is within range of your Acquisition objective marker, or if the target of that attack is within range of your Acquisition objective marker, re-roll a Wound roll of 1.","",0,"","Priority Assets"],
  ["Haloscreed Battle Clade",3,"","Noospheric Transference","In your Command phase, select one or more ADEPTUS MECHANICUS units from your army (including units that are embarked within Transports). The maximum number of units you can select depends on the battle size, as follows: INCURSION:1 UNITSTRIKE FORCE2 UNITSONSLAUGHT3 UNITS Until the start of your next Command phase, those units gain the HALO OVERRIDE keyword. Then, select one of the Override abilities below. Until the start of your next Command phase, units from your army with the HALO OVERRIDE keyword have the selected Override ability: Electromotive Energisation Add 2\" to the Move characteristic of models in this unit. Microactuator Bracing Add 1 to the Toughness characteristic of models in this unit. Predation Protocols This unit is eligible to declare a charge in a turn in which it Advanced. Muted Servomotors Models in this unit have the Stealth ability.","",0,"","Priority Assets"],
  ["Lords of the Forge",2,"","War-Form Mantles","Friendly TECH-PRIEST models have: ▪ 4+ InSv. ▪ Feel No Pain 5+. Friendly TECH-PRIEST models have the following ability: Baffling Data Screed: In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6: ▪ On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn. ▪ Or: On 2+, those ranged attacks do not prevent this unit from being hidden.","",0,"","Priority Assets"],
  ["Luminen Auto-Choir",1,"Data-Psalm","Cyber-Static Canticles","▪ Friendly CORPUSCARII units’ ranged attacks have [LETHAL HITS]. ▪ When a friendly FULGURITE unit has fought, that unit heals D3 wounds. This detachment has the DATA-PSALM tag and cannot be taken with another DATA-PSALM detachment.","",0,"","Disruption"],
  ["Rad-Zone Corps",2,"","Rad-bombardment","BATTLE ROUND1 BOMBARDMENT At the start of the first battle round, for each enemy unit within your opponent’s deployment zone, your opponent must decide whether that unit will take cover or stand firm. You then roll one D6 for each of those enemy units and apply the relevant result below: ▪ Unit Standing Firm: On a 3+, that unit suffers D3 mortal wounds. ▪ Unit Taking Cover: That unit is battle-shocked. On a 5+, that unit suffers D3 mortal wounds BATTLE ROUND2 ONWARDS FALLOUT At the start of your Command phase during the second, third, fourth and fifth battle rounds, roll one D6 for each enemy unit within your opponent’s deployment zone. On a 3+, that unit suffers 1 mortal wound and must take a Battle-shock test.","",0,"","Take and Hold"],
  ["Skitarii Hunter Cohort",2,"","Stealth Optimisation","Friendly SKITARII INFANTRY, SKITARII MOUNTED and IRONSTRIDER BALLISTARII units have Stealth.","",0,"","Reconnaissance"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Explorator Dispensation",20,"Cohort Acquisitus","This unit has Infiltrators.",null],
  ["Stealth-screened Cybercanids (Upgrade)",15,"Cohort Acquisitus","SERBERYS RAIDERS unit only. This unit has Lone Operative 15\".",null],
  ["Arch-negator",5,"Cohort Cybernetica","Ranged weapons equipped by the bearer have the [ANTI-VEHICLE 4+] ability.",null],
  ["Emotionless Clarity",10,"Cohort Cybernetica","Once per turn, when a friendly LEGIO CYBERNETICA or ADEPTUS MECHANICUS VEHICLE model with the Deadly Demise ability that is within 12\" of the bearer is destroyed, the bearer can use this Enhancement. If it does, do not roll to determine whether any mortal wounds are inflicted as a result of that model’s Deadly Demise ability. Instead, mortal wounds are automatically inflicted.",null],
  ["Lord of Machines",15,"Cohort Cybernetica","Once per turn, at the start of your opponent’s Shooting phase, select one enemy Vehicle unit within 12\" of and visible to the bearer. That unit must take a Leadership test: if that test is passed, until the end of the phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll; if that test is failed, that unit is not eligible to shoot this phase.",null],
  ["Necromechanic",20,"Cohort Cybernetica","Once per battle round, when a saving throw made for a friendly Legio Cybernetica or Adeptus Mechanicus Vehicle model within 12\" of the bearer is failed, the bearer can use this Enhancement. If they do, change the Damage characteristic of that attack to 0.",null],
  ["Data-blessed Autosermon",15,"Data-Psalm Conclave","Once per battle, at the start of your Command phase, you can select the Benediction of the Omnissiah you did not select at the start of the first battle round. Until the start of your next Command phase, that Benediction of the Omnissiah is active for the bearer’s unit in addition to the one that is currently active for your army.",null],
  ["Mantle of the Gnosticarch",10,"Data-Psalm Conclave","Each time an attack is allocated to the bearer, change the Damage characteristic of that attack to 1.",null],
  ["Mechanicus Locum",5,"Data-Psalm Conclave","The bearer has a Leadership characteristic of 6+ and, once per battle, at the start of any phase, you can select one friendly CULT MECHANICUS unit that is Battle-shocked and within 12\" of the bearer. That unit is no longer Battle-shocked.",null],
  ["Temporcopia",20,"Data-Psalm Conclave","The bearer’s unit has the Fights First ability.",null],
  ["Belicosa-class Capacitor Vanes",25,"Eradication Cohort","Adeptus Mechanicus model only. Add 6\" to the Range characteristic of ranged weapons equipped by models in the bearer’s unit, and add 1 to the Strength characteristic of those weapons.",null],
  ["Martial Signatum Amplificator",15,"Eradication Cohort","Tech-Priest model only. Models in the bearer’s unit have the Skitarii keyword.",null],
  ["Omnicogitator",25,"Eradication Cohort","Skitarii Marshal model only. The Conqueror Imperative and Protector Imperative are both active for the bearer’s unit.",null],
  ["Omnissiah’s Fury",10,"Eradication Cohort","Skitarii Marshal model only. Add 2 to the Attacks characteristic of melee weapons equipped by the bearer, and improve the Armour Penetration and Damage characteristics of those weapons by 1.",null],
  ["Artisan",10,"Explorator Maniple","While the bearer is leading a unit that is within range of your Acquisition objective marker, once per phase, you can change the result of one Hit roll, one Wound roll or one saving throw made for that unit to an unmodified 6.",null],
  ["Genetor",20,"Explorator Maniple","While the bearer is leading a unit that is within range of your Acquisition objective marker, models in that unit have a 4+ invulnerable save.",null],
  ["Logis",15,"Explorator Maniple","While the bearer is leading a unit, each time a model in that unit makes an attack that targets a unit within range of your Acquisition objective marker, add 1 to the Hit roll.",null],
  ["Magos",10,"Explorator Maniple","At the end of your Command phase, if the bearer is within range of your Acquisition objective marker, roll one D6: on a 4+, you gain 1CP.",null],
  ["Cognitive Reinforcement",30,"Haloscreed Battle Clade","ADEPTUS MECHANICUS model only (excluding CYBERNETICA DATASMITH models). The Conqueror Imperative and Protector Imperative are both active for the bearer’s unit.",null],
  ["Inloaded Lethality",15,"Haloscreed Battle Clade","Tech-Priest Dominus or Tech-Priest Manipulus model only. Add 3 to the Attacks characteristic of the bearer’s melee weapons and add 1 to the Damage characteristic of the bearer’s melee weapons.",null],
  ["Sanctified Ordnance",10,"Haloscreed Battle Clade","ADEPTUS MECHANICUS model only. Add 6\" to the range characteristic of ranged weapons equipped by models in the bearer’s unit and, each time a Hazardous test is taken for that unit, you can re-roll the result.",null],
  ["Transoracular Dyad Wafers",15,"Haloscreed Battle Clade","CYBERNETICA DATASMITH model only. When the bearer is attached to a Kastelan Robots unit, until the end of the battle, models in that unit gain the Halo Override keyword. That unit cannot be selected when selecting units as part of the Noospheric Transference Detachment rule.",null],
  ["TL-4ø9",30,"Lords of the Forge","",null],
  ["Vingh’s Wafers of Dynamism",25,"Lords of the Forge","At the start of the first battle round, if this unit is an attached unit, this unit has MOBILE until the end of the battle.",null],
  ["Electromiasmic Brazier",10,"Luminen Auto-Choir","This unit has Stealth.",null],
  ["Voltagheist Reliquary",15,"Luminen Auto-Choir","Enemy units cannot target this unit with snap shooting attacks.",null],
  ["Autoclavic Denunciation",15,"Rad-Zone Corps","ADEPTUS MECHANICUS model only. Ranged weapons equipped by the bearer have the [ANTI-INFANTRY 2+] and [ANTI-MONSTER 4+] abilities.",null],
  ["Malphonic Susurrus",20,"Rad-Zone Corps","While the bearer is leading a unit, models in that unit have the Stealth ability.",null],
  ["Peerless Eradicator",20,"Rad-Zone Corps","While the bearer is leading a unit, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.",null],
  ["Radial Suffusion",25,"Rad-Zone Corps","From the second battle round onwards, when resolving the Fallout effect of the Rad-bombardment Detachment rule, if the bearer is on the battlefield, roll one D6 for each enemy unit within 6\" of your opponent’s deployment zone, in addition to those that are within your opponent’s deployment zone.",null],
  ["Battle-sphere Uplink",25,"Skitarii Hunter Cohort","In your Shooting phase, after the bearer’s unit has shot, if it is not within Engagement Range of one or more enemy units, that unit can make a Normal move of up to 6\". If it does, until the end of the turn, that unit is not eligible to declare a charge.",null],
  ["Cantic Thrallnet",25,"Skitarii Hunter Cohort","At the start of the battle round, you can select one friendly SKITARII unit within 12\" of the bearer. Until the start of the next battle round, the Protector Imperative and the Conqueror Imperative are both active for that unit.",null],
  ["Clandestine Infiltrator",15,"Skitarii Hunter Cohort","The bearer, and models in any unit they are leading, have the Infiltrators and Scouts 6\" abilities.",null],
  ["Veiled Hunter",10,"Skitarii Hunter Cohort","After both players have deployed their armies, you can select up to three SKITARII INFANTRY units from your army and redeploy all of those units. When doing so, any of those units can be placed into Strategic Reserves, regardless of how many units are already in Strategic Reserves.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Clandestine Reposition","Cohort Acquisitus","",1,"End of your opponent’s Fight phase.","One friendly unengaged INFILTRATORS/PTERAXII unit.","Place your unit in strategic reserves.",""],
  ["Defect Scrutiny","Cohort Acquisitus","",1,"Your Shooting phase, when a friendly ADEPTUS MECHANICUS unit is selected to shoot.","That ADEPTUS MECHANICUS unit.","Select one visible enemy unit within 12\" of a friendly RECON AUGURY unit. Your unit’s ranged attacks that target that enemy unit have [IGNORES COVER].",""],
  ["Repolarised Augurs","Cohort Acquisitus","",1,"Start of your opponent’s Movement phase.","One friendly unengaged RECON AUGURY unit.","Your unit has -3\" detection range until the end of the turn.",""],
  ["Auto-Divinatory Targeting","Cohort Cybernetica","Tactique de Bataille",1,"Your Command phase.","One LEGIO CYBERNETICA or ADEPTUS MECHANICUS VEHICLE unit from your army, and one objective marker.","Until the start of your next Command phase, ranged weapons equipped by models in your unit have a Ballistic Skill characteristic of 3+ and the [IGNORES COVER] ability, but they can only target units within range of the selected objective marker.",""],
  ["Benevolence of the Omnissiah","Cohort Cybernetica","Tactique de Bataille",1,"Your Command phase.","One LEGIO CYBERNETICA or ADEPTUS MECHANICUS VEHICLE unit from your army.","Until the start of your next Command phase, models in your unit have the Feel No Pain 6+ ability, which is improved to Feel No Pain 5+ against mortal wounds.",""],
  ["Machine Spirit Resurgent","Cohort Cybernetica","Fait Épique",1,"Your Command phase.","One LEGIO CYBERNETICA or ADEPTUS MECHANICUS VEHICLE unit from your army that is below its Starting Strength.","Until the start of your next Command phase, each time a model in your unit makes an attack, you can re-roll the Hit roll. If your unit is Below Half-strength, you can re-roll the Wound roll as well.",""],
  ["Machine Superiority","Cohort Cybernetica","Fait Épique",1,"Your Command phase.","One LEGIO CYBERNETICA or ADEPTUS MECHANICUS VEHICLE unit from your army.","Until the end of the turn, your unit is eligible to shoot in a turn in which it Fell Back and you can ignore any or all modifiers to its characteristics and/or to any roll or test made for it (excluding modifiers to saving throws).",""],
  ["Motive Imperative","Cohort Cybernetica","Tactique de Bataille",1,"Your Command phase.","One ADEPTUS MECHANICUS VEHICLE unit from your army.","Until the start of your next Command phase, add 3\" to the Move characteristic of models in your unit and add 1 to Advance and Charge rolls made for it.",""],
  ["Transcendent Cogitation","Cohort Cybernetica","Ruse Stratégique",1,"Your Command phase.","One LEGIO CYBERNETICA or ADEPTUS MECHANICUS VEHICLE unit from your army.","Until the start of your next Command phase, the Conqueror Imperative and Protector Imperative are both active for your unit.",""],
  ["Chant of the Remorseless Fist","Data-Psalm Conclave","Tactique de Bataille",1,"Fight phase.","One CULT MECHANICUS unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a CULT MECHANICUS model in your unit makes a melee attack, add 1 to the Wound roll.",""],
  ["Incantation of the Iron Soul","Data-Psalm Conclave","Tactique de Bataille",1,"Any phase, just after you allocate a mortal wound to a CULT MECHANICUS model from your army.","That CULT MECHANICUS model’s unit.","Until the end of the phase, CULT MECHANICUS models in your unit have the Feel No Pain 4+ ability against mortal wounds.",""],
  ["Litany of the Electromancer","Data-Psalm Conclave","Ruse Stratégique",1,"Your Shooting phase.","One CULT MECHANICUS unit from your army.","Roll one D6 for each enemy unit within 6\" of one or more CULT MECHANICUS models in your unit, adding 1 to the result if that model is an ELECTRO-PRIEST. On a 5+, that enemy unit suffers D3 mortal wounds.",""],
  ["Luminescent Blessing","Data-Psalm Conclave","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One CULT MECHANICUS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, CULT MECHANICUS models in your unit have a 4+ invulnerable save.",""],
  ["Tribute of Emphatic Veneration","Data-Psalm Conclave","Ruse Stratégique",1,"Start of your Movement phase.","One CULT MECHANICUS unit from your army and one enemy unit within 18\" of it.","That enemy unit must take a Battle-shock test. If that test is failed, until the start of your next Command phase, each time a model in that enemy unit makes an attack, subtract 1 from the Hit roll.",""],
  ["Verse of Vengeance","Data-Psalm Conclave","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One CULT MECHANICUS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a CULT MECHANICUS model in your unit is destroyed, if that model has not fought this phase, roll one D6: on a 4+, do not remove it from play. The destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play.",""],
  ["Analytic Reprisals","Eradication Cohort","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has shot.","One Skitarii Infantry unit from your army that lost one or more models as a result of the attacking unit’s attacks.","Your unit can shoot as if it were your Shooting phase, but must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.",""],
  ["Precision Onslaught","Eradication Cohort","Tactique de Bataille",1,"Your Charge phase, just after a Sicarian unit from your army declares a charge.","That SICARIAN unit.","Until the end of the phase, when your unit ends a Charge move, select one enemy unit within Engagement Range of it, then roll one D6 for each model in your unit that is within Engagement Range of that enemy unit: for each 4+, that enemy unit suffers 1 mortal wound.",""],
  ["Servo-Driven Charge","Eradication Cohort","Équipement",1,"Fight phase.","One ADEPTUS MECHANICUS unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [LANCE] ability.",""],
  ["Threat-Cogitation Targeters","Eradication Cohort","Équipement",1,"Your Shooting phase.","One Skitarii Vehicle unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a ranged attack made by a model in your unit is allocated to a MONSTER or VEHICLE model, you can re-roll the Damage roll.",""],
  ["Unrelenting Aggression","Eradication Cohort","Ruse Stratégique",1,"Your Movement phase, just after an ADEPTUS MECHANICUS unit from your army Falls Back.","That ADEPTUS MECHANICUS unit.","Until the end of the turn, your unit is eligible to shoot in a turn in which it Fell Back. If your unit has the Skitarii keyword, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back instead.",""],
  ["Unshackled Wrath","Eradication Cohort","Équipement",1,"Your Shooting phase.","One Skitarii unit from your army that has not been selected to shoot this phase.","Select the [SUSTAINED HITS 1] or [LETHAL HITS] ability. Until the end of the phase, ranged weapons equipped by models in your unit have the selected ability. You can instead select the [SUSTAINED HITS 1], [LETHAL HITS] and [HAZARDOUS] abilities to apply to those weapons until the end of the phase.",""],
  ["Auto-Oracular Retrieval","Explorator Maniple","Tactique de Bataille",2,"Your Shooting phase.","One ADEPTUS MECHANICUS unit from your army that disembarked from a TRANSPORT this turn.","Until the end of the phase, each time a model in your unit makes a ranged attack that targets an enemy unit within range of your Acquisition objective marker, add 1 to the Wound roll.",""],
  ["Cached Acquisition","Explorator Maniple","Fait Épique",1,"Any phase.","One ADEPTUS MECHANICUS unit from your army that was just destroyed while it was within range of an objective marker you controlled. You can use this Stratagem on that unit even though it was just destroyed.","That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",""],
  ["Incense Exhausts","Explorator Maniple","Équipement",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One ADEPTUS MECHANICUS INFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks, and one friendly ADEPTUS MECHANICUS SMOKE unit within 6\" of it.","Until the end of the phase, both of those units have the Stealth ability and the Benefit of Cover.",""],
  ["Infoslave Skull","Explorator Maniple","Équipement",1,"Your Command phase.","One TECH-PRIEST model from your army and one objective marker within 24\" of that model (excluding your Acquisition objective marker].","Until the start of your next Command phase, that objective marker is also considered to be one of your Acquisition objective markers for all rules purposes.",""],
  ["Priority Reclamation","Explorator Maniple","Tactique de Bataille",1,"Fight phase, just before an ADEPTUS MECHANICUS unit from your army Consolidates.","That ADEPTUS MECHANICUS unit.","Until the end of the phase, each time a model in your unit makes a Consolidation move, it can move up to 6\" instead of up to 3\", provided your unit ends that Consolidation move within range of your Acquisition objective marker.","You cannot target a unit with this Stratagem if it is within 3\" of one or more enemy units."],
  ["Reactive Safeguard","Explorator Maniple","Ruse Stratégique",1,"Your opponent’s Charge phase, just after an enemy unit has declared a charge.","One ADEPTUS MECHANICUS INFANTRY unit from your army within range of your Acquisition objective marker that was selected as a target of that charge, and one friendly ADEPTUS MECHANICUS TRANSPORT.","Your unit can embark within that TRANSPORT.","Every model in your unit must be within 3\" of that TRANSPORT and there must be sufficient transport capacity to embark the entire unit."],
  ["Aggressive Impulse","Haloscreed Battle Clade","Ruse Stratégique",1,"Your Movement phase.","One Skorpius Dunerider model from your army that has not been selected to move this phase.","Until the end of the turn, each time an ADEPTUS MECHANICUS unit disembarks from that model after it has made a Normal move, that unit makes an assault disembark move (Core Rules, 18.06) for that disembarkation.",""],
  ["Analytical Divination","Haloscreed Battle Clade","Ruse Stratégique",1,"Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move.","One Adeptus Mechanicus Infantry unit (excluding Kataphron units) from your army that is within 8\" of that enemy unit and not within Engagement Range of one or more enemy units.","Your unit can make a Normal move of up to D6\", or up to 6\" instead if it is a HALO OVERRIDE unit.",""],
  ["Eradication Protocols","Haloscreed Battle Clade","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One ADEPTUS MECHANICUS unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, re-roll a Wound roll of 1, and, if it is a HALO OVERRIDE unit, re-roll a Hit roll of 1.",""],
  ["Guided Retreat","Haloscreed Battle Clade","Ruse Stratégique",1,"Your Movement phase, when a friendly ADEPTUS MECHANICUS unit is selected to make a fall-back move.","That ADEPTUS MECHANICUS unit.","▪ If your unit is a HALO OVERRIDE unit, your unit can re-roll hazard rolls. ▪ That fall-back move does not prevent your unit from: ▪ Being eligible to shoot. ▪ Being eligible to declare a charge.",""],
  ["Neural Overload","Haloscreed Battle Clade","Ruse Stratégique",1,"Your Movement phase.","One ADEPTUS MECHANICUS unit from your army.","If your unit is a HALO OVERRIDE unit, it suffers D3 mortal wounds. Select one Override ability. Until the start of your next Command phase, that ability is active for your unit. Designer’s Note: This means that if the targeted unit already has the HALO OVERRIDE keyword, it can be affected by multiple Override abilities at the same time, but suffers mortal wounds to do so. Alternatively, if your unit does not have the HALO OVERRIDE keyword, it instead has the chosen Override ability until the start of your next Command phase, but does not benefit from any other Override abilities that are active.",""],
  ["Targeting Override","Haloscreed Battle Clade","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One ADEPTUS MECHANICUS unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Holy Avarice","Lords of the Forge","",1,"Your Shooting phase, when a friendly TECH-PRIEST unit starts an action.","That TECH-PRIEST unit.","That action does not prevent your unit from being eligible to shoot.",""],
  ["Overloaded Safeguards","Lords of the Forge","",1,"Your Movement phase, when a friendly TECH-PRIEST unit is selected to make a fall-back move.","That TECH-PRIEST unit.","That move does not prevent your unit from being eligible to shoot/declare a charge.",""],
  ["Scriptural Prognosis","Lords of the Forge","",1,"In your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly TECH-PRIEST unit that is within range of an objective.","That TECH-PRIEST unit.","Attacks that target your unit have -1 AP until that enemy unit has attacked.",""],
  ["Chant of Electrotraction","Luminen Auto-Choir","",1,"Your Movement phase, when a friendly ELECTRO-PRIESTS unit is selected to make an advance move.","That ELECTRO-PRIESTS unit.","That move does not prevent your unit from being eligible to declare a charge.",""],
  ["Echoes of the Conduit Wars","Luminen Auto-Choir","",1,"Your Shooting phase or the Fight phase, when a friendly ELECTRO-PRIESTS unit is selected to attack.","That ELECTRO-PRIESTS unit.","Your unit’s attacks that target a unit within range of an objective can: ▪ Re-roll hit rolls of 1. ▪ Re-roll wound rolls of 1.",""],
  ["Momentum Feedback","Luminen Auto-Choir","",1,"Your opponent’s Shooting phase, when an enemy unit that targeted a friendly unengaged ELECTRO-PRIESTS unit has shot.","That ELECTRO-PRIESTS unit.","Your unit can make a surge move of up to D6\".",""],
  ["Aggressor Imperative","Rad-Zone Corps","Tactique de Bataille",1,"Your Movement phase.","One SKITARII unit from your army that has not been selected to move this phase. If that unit is BATTLELINE, you can also target one friendly SKITARII unit (excluding BATTLELINE units) within 6\" of it.","Until the end of the phase, each time one of those units Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in that unit.",""],
  ["Baleful Halo","Rad-Zone Corps","Tactique de Bataille",2,"Fight phase, just after an enemy unit has selected its targets.","One ADEPTUS MECHANICUS unit from your army (excluding Vehicle units) that was selected as the target of one or more of that enemy unit’s attacks. If that unit is BATTLELINE, you can also target one friendly SKITARII unit (excluding BATTLELINE units) within 6\" of it.","Until the end of the phase, each time an attack targets one of those units from your army, subtract 1 from the Wound roll.",""],
  ["Bulwark Imperative","Rad-Zone Corps","Tactique de Bataille",2,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One SKITARII unit from your army that was selected as the target of one or more of the attacking unit’s attacks. If that unit is BATTLELINE, you can also target one friendly SKITARII unit (excluding BATTLELINE units) within 6\" of it.","Until the end of the phase, models in those units from your army have a 4+ invulnerable save.",""],
  ["Extinction Order","Rad-Zone Corps","Ruse Stratégique",1,"Your Command phase.","One Tech-Priest model from your army and one objective marker within 24\" of that model.","Roll one D6 for each enemy unit within range of that objective marker. On a 4+, that unit suffers 1 mortal wound and it must take a Battle-shock test.",""],
  ["Lethal Dosage","Rad-Zone Corps","Équipement",1,"Your Shooting phase.","One ADEPTUS MECHANICUS unit from your army that has not been selected to shoot this phase.","Until the end of the phase, ranged weapons equipped by models in your unit have the [LETHAL HITS] ability.",""],
  ["Pre-Calibrated Purge Solution","Rad-Zone Corps","Tactique de Bataille",1,"Your Shooting phase.","One ADEPTUS MECHANICUS unit from your army that has not been selected to shoot this phase. If that unit is BATTLELINE, you can also target one friendly SKITARII unit (excluding BATTLELINE units) within 6\" of it.","Until the end of the phase, each time a model in one of those units makes a ranged attack, if the target of that attack is within your opponent’s deployment zone, you can re-roll the Hit roll.",""],
  ["Binharic Offence","Skitarii Hunter Cohort","Ruse Stratégique",2,"The start of your Shooting phase or the start of the Fight phase.","Two SKITARII units from your army that have not been selected to shoot or fight this phase, and one enemy unit.","Until the end of the phase, improve the Armour Penetration characteristic of weapons equipped by models in both of your units by 1.","Until the end of the phase, each time a model in either of your units makes an attack, it can only target that enemy unit (and only if it is an eligible target]."],
  ["Bionic Endurance","Skitarii Hunter Cohort","Ruse Stratégique",1,"Your opponent’s Shooting phase orthe Fight phase, just after an enemy unit has selected its targets.","One SICARIAN, PTERAXII or SYDONIAN unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have the Feel No Pain 5+ ability.",""],
  ["Expedited Purge Protocol","Skitarii Hunter Cohort","Ruse Stratégique",1,"Your Charge phase.","One SKITARII unit from your army.","Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Isolate and Destroy","Skitarii Hunter Cohort","Ruse Stratégique",1,"Your Shooting phase.","One SICARIAN, PTERAXII, SYDONIAN, IRONSTRIDER BALLISTARII or SKITARII MOUNTED unit from your army that has not been selected to shoot this phase.","Until the end of the phase, each time a model in your unit makes an attack, if there are no other enemy units within 6\" of the unit targeted by that attack, add 1 to the Wound roll.",""],
  ["Programmed Withdrawal","Skitarii Hunter Cohort","Ruse Stratégique",1,"End of your opponent’s Fight phase.","Up to two SICARIAN units from your army, or one SKITARII INFANTRY or SKITARII MOUNTED unit from your army.","Remove those units from the battlefield and place them into Strategic Reserves.","Each unit targeted with this Stratagem must be more than 3\" away from all enemy units."],
  ["Shroud Protocols","Skitarii Hunter Cohort","Ruse Stratégique",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One SKITARII INFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, your unit can only be selected as the target of a ranged attack if the attacking model is within 18\".",""],
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
  "Archaeopter Fusilave",
  "Archaeopter Stratoraptor",
  "Archaeopter Transvector",
  "Ironstrider Ballistarii",
  "Kastelan Robots",
  "Onager Dunecrawler",
  "Skorpius Disintegrator",
  "Skorpius Dunerider",
  "Sydonian Dragoons with radium jezzails",
  "Sydonian Dragoons with taser lances",
  "Terrax-Pattern Termite"
 ],
 "monster": [],
 "battleline": [
  "Skitarii Rangers",
  "Skitarii Vanguard"
 ],
 "epic": [
  "Belisarius Cawl",
  "Thulia Ghuld"
 ],
 "infantry": [
  "Corpuscarii Electro-Priests",
  "Fulgurite Electro-Priests",
  "Hastarii Exterminators",
  "Hastarii Fusiliers",
  "Kataphron Breachers",
  "Kataphron Destroyers",
  "Pteraxii Skystalkers",
  "Pteraxii Sterylizors",
  "Secutarii Hoplites",
  "Secutarii Peltasts",
  "Servitor Battleclade",
  "Sicarian Infiltrators",
  "Sicarian Ruststalkers"
 ],
 "character": [
  "Cybernetica Datasmith",
  "Skitarii Marshal",
  "Sydonian Skatros",
  "Tech-Priest Dominus",
  "Tech-Priest Enginseer",
  "Tech-Priest Manipulus",
  "Technoarcheologist"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Archaeopter Fusilave": "170x109",
 "Archaeopter Stratoraptor": "170x109",
 "Archaeopter Transvector": "170x109",
 "Belisarius Cawl": "105x70",
 "Corpuscarii Electro-Priests": "32",
 "Fulgurite Electro-Priests": "32",
 "Ironstrider Ballistarii": "105x70",
 "Kastelan Robots": "60",
 "Kataphron Breachers": "60",
 "Kataphron Destroyers": "60",
 "Onager Dunecrawler": "130",
 "Pteraxii Skystalkers": "40",
 "Pteraxii Sterylizors": "40",
 "Serberys Raiders": "60x35.5",
 "Serberys Sulphurhounds": "60x35.5",
 "Sicarian Infiltrators": "40",
 "Sicarian Ruststalkers": "40",
 "Skitarii Marshal": "32",
 "Skitarii Rangers": "25",
 "Skitarii Vanguard": "25",
 "Skorpius Disintegrator": "coque",
 "Skorpius Dunerider": "coque",
 "Sydonian Dragoons with taser lances": "105x70",
 "Tech-Priest Dominus": "50",
 "Tech-Priest Enginseer": "32",
 "Tech-Priest Manipulus": "50",
 "Technoarcheologist": "32",
 "Cybernetica Datasmith": "32",
 "Sydonian Skatros": "40",
 "Sydonian Dragoons with radium jezzails": "105x70",
 "Servitor Battleclade": "32",
 "Thulia Ghuld": "80",
 "Hastarii Exterminators": "32",
 "Hastarii Fusiliers": "32"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Onager Dunecrawler": 4,
 "Skorpius Disintegrator": 4,
 "Terrax-Pattern Termite": 5
};

const TRANSPORTS = {
 "Archaeopter Transvector": "This model has a transport capacity of 11 ^^**Skitarii Infantry**^^ or **^^Tech-priest Infantry**^^ models. It cannot transport ^^**Jump Pack, Kataphron**^^ or ^^**Sydonian Skatros**^^ models.",
 "Skorpius Dunerider": "This model has a transport capacity of 12 ^^**Adeptus Mechanicus Infantry**^^ models. It cannot transport ^^**Jump Pack, Kataphron**^^ or ^^**Sydonian Skatros**^^ models.",
 "Terrax-Pattern Termite": "This model has a transport capacity of 12 ^^**Adeptus Mechanicus Infantry^^** models. It cannot transport ^^**Jump Pack or Kataphron^^** models"
};
const FACTION = [
 [
  "Doctrina Imperatives",
  "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below. Protector Imperative ▪ Ranged weapons equipped by models in this unit have the [HEAVY] ability. ▪ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1. ▪ Each time a melee attack targets this unit, if this unit has the BATTLELINE keyword and/or it is within 6\" of one or more friendly ADEPTUS MECHANICUS BATTLELINE units, subtract 1 from the Hit roll. Conqueror Imperative ▪ Ranged weapons equipped by models in this unit have the [ASSAULT] ability. ▪ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1. ▪ Each time a model in this unit makes an attack, if this unit has the BATTLELINE keyword and/or it is within 6\" of one or more friendly ADEPTUS MECHANICUS BATTLELINE units, improve the Armour Penetration characteristic of that attack by 1."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/mechanicus.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_UNITE = {
 "Kataphron Breachers": [
  {
   "champ": "rrH",
   "val": "ones",
   "nom": "Commandement de Brèche",
   "texte": "Each time a model in this unit makes an attack, re-roll a Hit roll of 1."
  }
 ]
};
const APTIS_COND = {
 "Kataphron Breachers": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Commandement de Brèche — Ligne",
   "quand": "L'unité est à 6\" d'une unité de LIGNE amie",
   "texte": "While this unit is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, you can re-roll the Hit roll instead."
  }
 ],
 "Pteraxii Sterylizors": [
  {
   "arme": "Phosphor torch",
   "champ": "rrW",
   "val": "ones",
   "port": "T",
   "nom": "Conflagration Brûlante",
   "quand": "La cible est à portée d'un pion d'objectif",
   "texte": "Each time a model in this unit makes an attack with a phosphor torch that targets an enemy unit within range of an objective marker, re-roll a Wound roll of 1."
  },
  {
   "arme": "Phosphor torch",
   "champ": "rrW",
   "val": "failed",
   "port": "T",
   "nom": "Conflagration Brûlante — Ligne",
   "quand": "Cible sur objectif, et l'unité à 6\" d'une unité de LIGNE amie",
   "texte": "If this unit is also within 6\" of one or more friendly Adeptus Mechanicus Battleline units, you can re-roll the Wound roll instead."
  }
 ],
 "Sydonian Dragoons with radium jezzails": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Chasseurs Concentrés",
   "quand": "La cible est l'unité désignée en début de bataille",
   "texte": "Each time a model in this unit makes an attack that targets that unit, you can re-roll the Hit roll."
  }
 ],
 "Kastelan Robots": [
  {
   "champ": "atkMod",
   "val": 2,
   "port": "T",
   "nom": "Protocole Protecteur",
   "quand": "Menés par un Cybernetica Datasmith, en Protocole Protecteur",
   "texte": "Add 2 to the Attacks characteristic of ranged weapons equipped by Kastelan Robot models in that unit."
  },
  {
   "champ": "atkMod",
   "val": 2,
   "port": "C",
   "nom": "Protocole Conquérant",
   "quand": "Menés par un Cybernetica Datasmith, en Protocole Conquérant",
   "texte": "Add 2 to the Attacks characteristic of melee weapons equipped by Kastelan Robot models in that unit."
  }
 ],
 "Tech-Priest Enginseer": [
  {
   "arme": "Omnissian axe",
   "champ": "atkMod",
   "val": 3,
   "port": "C",
   "nom": "Vengeance pour l'Omnimessie",
   "quand": "Un VÉHICULE ami a été détruit à 12\" (hache A 3 → 6)",
   "texte": "If a friendly Adeptus Mechanicus Vehicle model is destroyed within 12\" of this model, this model’s Omnissian axe has an Attacks characteristic of 6."
  }
 ]
};
const APTIS_CIBLE = {
 "Archaeopter Stratoraptor": [
  {
   "sauf": [
    "vol"
   ],
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Mitraillage",
   "texte": "Each time this model makes a ranged attack that targets an enemy unit (excluding units that can Fly), add 1 to the Hit roll."
  }
 ],
 "Skorpius Disintegrator": [
  {
   "vs": [
    "inf"
   ],
   "arme": "Belleros energy cannon",
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Salves Brûlantes",
   "texte": "Each time this model makes an attack with a belleros energy cannon that targets an Infantry unit, add 1 to the Hit roll."
  },
  {
   "vs": [
    "mon",
    "veh"
   ],
   "arme": "Ferrumite cannon",
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Salves Brûlantes",
   "texte": "Each time this model makes an attack with a ferrumite cannon that targets a Monster or Vehicle unit, add 1 to the Hit roll."
  }
 ],
 "Sydonian Skatros": [
  {
   "vs": [
    "inf"
   ],
   "arme": "Radium Jezzail",
   "champ": "rrW",
   "val": "failed",
   "port": "T",
   "nom": "Œil Achilléen",
   "texte": "Each time this model makes an attack with a radium jezzail that targets an Infantry unit, you can re-roll the Wound roll."
  },
  {
   "vs": [
    "mon",
    "veh"
   ],
   "arme": "Skatros transuranic arquebus",
   "champ": "rrW",
   "val": "failed",
   "port": "T",
   "nom": "Œil Achilléen",
   "texte": "Each time this model makes an attack with a Skatros transuranic arquebus that targets a Monster or Vehicle unit, you can re-roll the Wound roll."
  }
 ],
 "Hastarii Exterminators": [
  {
   "sauf": [
    "mon",
    "veh"
   ],
   "arme": "➤ Eradication caster - dissipated",
   "mot": "sust:1",
   "port": "T",
   "nom": "Augures de Ciblage Large Spectre",
   "texte": "Each time a model in this unit makes an attack with an eradication caster that targets a unit (excluding Monster and Vehicle units), that attack has the [SUSTAINED HITS 1] ability."
  },
  {
   "sauf": [
    "mon",
    "veh"
   ],
   "arme": "➤ Eradication caster - focused",
   "mot": "sust:1",
   "port": "T",
   "nom": "Augures de Ciblage Large Spectre",
   "texte": "Each time a model in this unit makes an attack with an eradication caster that targets a unit (excluding Monster and Vehicle units), that attack has the [SUSTAINED HITS 1] ability."
  }
 ],
 "Hastarii Fusiliers": [
  {
   "vs": [
    "mon",
    "veh"
   ],
   "arme": "Neutron fusil",
   "mot": "ignorescover",
   "port": "T",
   "nom": "Casques de Visée Monoculaires",
   "texte": "Each time a model in this unit makes an attack with a neutron fusil against a Monster or Vehicle unit, that attack has the [IGNORES COVER] ability."
  }
 ]
};
const AURAS_PERSO = {
 "Skitarii Marshal": [
  {
   "champ": "rrH",
   "val": "failed",
   "nom": "Édit de Contrôle",
   "texte": "While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Hit roll."
  }
 ],
 "Tech-Priest Manipulus": [
  {
   "mot": "lethal",
   "nom": "Champ Galvanique",
   "texte": "While this model is leading a unit, weapons equipped by models in that unit have the [Lethal Hits] ability."
  }
 ],
 "Tech-Priest Dominus": [
  {
   "champ": "fnp",
   "val": 5,
   "nom": "Seigneur du Culte des Machines",
   "texte": "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability (4+ for Electro-Priests)."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "kw": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Belisarius Cawl",
   "Corpuscarii Electro-Priests",
   "Cybernetica Datasmith",
   "Fulgurite Electro-Priests",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Kastelan Robots",
   "Kataphron Breachers",
   "Kataphron Destroyers",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Servitor Battleclade",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "champ": "hitMod",
  "val": 1,
  "port": "T",
  "nom": "Impératif Protecteur",
  "quand": "L'Impératif Protecteur est actif ce round",
  "texte": "Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1. (Rendu par +1 au jet de touche ; [LOURD] n'est pas repris.)"
 },
 {
  "kw": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Belisarius Cawl",
   "Corpuscarii Electro-Priests",
   "Cybernetica Datasmith",
   "Fulgurite Electro-Priests",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Kastelan Robots",
   "Kataphron Breachers",
   "Kataphron Destroyers",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Servitor Battleclade",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "champ": "hitMod",
  "val": 1,
  "port": "C",
  "nom": "Impératif Conquérant",
  "quand": "L'Impératif Conquérant est actif ce round",
  "texte": "Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1. (Rendu par +1 au jet de touche.)"
 },
 {
  "kw": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Belisarius Cawl",
   "Corpuscarii Electro-Priests",
   "Cybernetica Datasmith",
   "Fulgurite Electro-Priests",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Kastelan Robots",
   "Kataphron Breachers",
   "Kataphron Destroyers",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Servitor Battleclade",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "champ": "apMod",
  "val": 1,
  "nom": "Impératif Conquérant — Ligne",
  "quand": "L'Impératif Conquérant est actif, et l'unité est de LIGNE ou à 6\" d'une unité de LIGNE amie",
  "texte": "Each time a model in this unit makes an attack, if this unit has the BATTLELINE keyword and/or it is within 6\" of one or more friendly ADEPTUS MECHANICUS BATTLELINE units, improve the Armour Penetration characteristic of that attack by 1."
 },
 {
  "detach": "Data-Psalm Conclave",
  "kw": [
   "Belisarius Cawl",
   "Corpuscarii Electro-Priests",
   "Fulgurite Electro-Priests",
   "Kataphron Breachers",
   "Kataphron Destroyers",
   "Servitor Battleclade",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "champ": "apMod",
  "val": 1,
  "port": "T",
  "nom": "Procession Panégyrique",
  "quand": "Bénédiction choisie en début de bataille, et la cible est à mi-portée",
  "texte": "Each time a CULT MECHANICUS model from your army makes a ranged attack that targets a unit within half range, improve the Armour Penetration characteristic of that attack by 1."
 },
 {
  "detach": "Data-Psalm Conclave",
  "kw": [
   "Belisarius Cawl",
   "Corpuscarii Electro-Priests",
   "Fulgurite Electro-Priests",
   "Kataphron Breachers",
   "Kataphron Destroyers",
   "Servitor Battleclade",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "champ": "atkMod",
  "val": 1,
  "port": "C",
  "nom": "Citation en Sauvagerie",
  "quand": "Bénédiction choisie en début de bataille, et l'unité a chargé ce tour",
  "texte": "If that unit made a Charge move this turn, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit."
 },
 {
  "detach": "Data-Psalm Conclave",
  "kw": [
   "Belisarius Cawl",
   "Corpuscarii Electro-Priests",
   "Fulgurite Electro-Priests",
   "Kataphron Breachers",
   "Kataphron Destroyers",
   "Servitor Battleclade",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "champ": "strMod",
  "val": 1,
  "port": "C",
  "nom": "Citation en Sauvagerie — la Force",
  "quand": "Bénédiction choisie en début de bataille, et l'unité a chargé ce tour",
  "texte": "... and add 1 to the Strength characteristic."
 },
 {
  "detach": "Eradication Cohort",
  "kw": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros"
  ],
  "champ": "rrH",
  "val": "ones",
  "nom": "Impératif Meurtrier — Protecteur",
  "quand": "L'Impératif Protecteur est actif",
  "texte": "If the Protector Imperative is active for that unit, re-roll a Hit roll of 1."
 },
 {
  "detach": "Eradication Cohort",
  "kw": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros"
  ],
  "champ": "rrW",
  "val": "ones",
  "nom": "Impératif Meurtrier — Conquérant",
  "quand": "L'Impératif Conquérant est actif",
  "texte": "If the Conqueror Imperative is active for that unit, re-roll a Wound roll of 1."
 },
 {
  "detach": "Explorator Maniple",
  "kw": [],
  "champ": "rrW",
  "val": "ones",
  "nom": "L'Acquisition à Tout Prix",
  "quand": "L'unité ou la cible est à portée de l'objectif d'Acquisition",
  "texte": "If that model’s unit is within range of your Acquisition objective marker, or if the target of that attack is, re-roll a Wound roll of 1."
 },
 {
  "detach": "Lords of the Forge",
  "kw": [
   "Belisarius Cawl",
   "Cybernetica Datasmith",
   "Servitor Battleclade",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "sens": "def",
  "champ": "inv",
  "val": 4,
  "nom": "Manteaux de Guerre — invulnérable",
  "quand": "Toujours, pour les TECH-PRIESTS",
  "texte": "Friendly TECH-PRIEST models have 4+ InSv."
 },
 {
  "detach": "Lords of the Forge",
  "kw": [
   "Belisarius Cawl",
   "Cybernetica Datasmith",
   "Servitor Battleclade",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "sens": "def",
  "champ": "fnp",
  "val": 5,
  "nom": "Manteaux de Guerre — insensibilité",
  "quand": "Toujours, pour les TECH-PRIESTS",
  "texte": "Friendly TECH-PRIEST models have Feel No Pain 5+."
 },
 {
  "source": "Belisarius Cawl",
  "kw": [],
  "champ": "rrH",
  "val": "failed",
  "nom": "Invocation de la Vengeance Machinique (Aura)",
  "quand": "Cawl a choisi ce cantique, et la cible est la cible de la Vengeance Machinique",
  "texte": "Each time a model in a friendly Adeptus Mechanicus unit makes an attack that targets your Machine Vengeance target, you can re-roll the Hit roll."
 },
 {
  "source": "Skorpius Dunerider",
  "kw": [],
  "champ": "rrW",
  "val": "failed",
  "nom": "Soutien de Feu",
  "quand": "L'unité a débarqué du Skorpius Dunerider ce tour, et la cible a été touchée par lui",
  "texte": "Each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll."
 },
 {
  "source": "Onager Dunecrawler",
  "kw": [
   "battleline"
  ],
  "sens": "def",
  "champ": "inv",
  "val": 4,
  "nom": "Champ de Force Emanatus (Aura)",
  "quand": "L'unité de LIGNE est entièrement à 6\" de l'Onager, contre une attaque de tir",
  "texte": "While a friendly Adeptus Mechanicus Battleline model is wholly within 6\" of this model, that Battleline model has a 4+ invulnerable save against ranged attacks."
 }
];
const OCTROIS_DETACH = {
 "Luminen Auto-Choir": [
  {
   "qui": "unite",
   "kw": [
    "Corpuscarii Electro-Priests"
   ],
   "mot": "lethal",
   "port": "T",
   "nom": "Cantiques Cyber-Statiques",
   "texte": "Friendly CORPUSCARII units’ ranged attacks have [LETHAL HITS]."
  }
 ]
};
const STRAT_SIMU = [
 {
  "nom": "Defect Scrutiny",
  "detach": "Cohort Acquisitus",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "[IGNORE LE COUVERT] contre l'unité désignée près d'une unité RECON AUGURY",
  "effet": {
   "ignoresCover": true
  }
 },
 {
  "nom": "Machine Spirit Resurgent",
  "detach": "Cohort Cybernetica",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Cybernetica Datasmith",
   "Ironstrider Ballistarii",
   "Kastelan Robots",
   "Onager Dunecrawler",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances"
  ],
  "sauf": [],
  "aide": "relance des touches — l'unité est sous son effectif de départ",
  "effet": {
   "rrH": "failed"
  }
 },
 {
  "nom": "Machine Spirit Resurgent — sous la moitié",
  "detach": "Cohort Cybernetica",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Cybernetica Datasmith",
   "Ironstrider Ballistarii",
   "Kastelan Robots",
   "Onager Dunecrawler",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances"
  ],
  "sauf": [],
  "aide": "relance des touches et des blessures — l'unité est sous la moitié de son effectif",
  "effet": {
   "rrH": "failed",
   "rrW": "failed"
  }
 },
 {
  "nom": "Machine Superiority",
  "detach": "Cohort Cybernetica",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Cybernetica Datasmith",
   "Ironstrider Ballistarii",
   "Kastelan Robots",
   "Onager Dunecrawler",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances"
  ],
  "sauf": [],
  "aide": "ignore les modificateurs de caractéristiques et de jets",
  "effet": {
   "ignoreMalus": true
  }
 },
 {
  "nom": "Chant of the Remorseless Fist",
  "detach": "Data-Psalm Conclave",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Belisarius Cawl",
   "Corpuscarii Electro-Priests",
   "Fulgurite Electro-Priests",
   "Kataphron Breachers",
   "Kataphron Destroyers",
   "Servitor Battleclade",
   "Tech-Priest Dominus",
   "Tech-Priest Enginseer",
   "Tech-Priest Manipulus",
   "Technoarcheologist",
   "Thulia Ghuld"
  ],
  "sauf": [],
  "aide": "+1 pour blesser en mêlée",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Servo-Driven Charge",
  "detach": "Eradication Cohort",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[LANCE] : +1 pour blesser, l'unité devant avoir chargé ce tour",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Unshackled Wrath — Touches Soutenues",
  "detach": "Eradication Cohort",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] au tir",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Unshackled Wrath — Touches Fatales",
  "detach": "Eradication Cohort",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] au tir",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Unshackled Wrath — les deux",
  "detach": "Eradication Cohort",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] et [TOUCHES FATALES] — avec [DANGEREUX], non simulé",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1",
   "lethal": true
  }
 },
 {
  "nom": "Auto-Oracular Retrieval",
  "detach": "Explorator Maniple",
  "pc": 2,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "+1 pour blesser — cible sur l'objectif d'Acquisition, l'unité a débarqué ce tour",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Eradication Protocols",
  "detach": "Haloscreed Battle Clade",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "relance des 1 pour blesser",
  "effet": {
   "rrW": "ones"
  }
 },
 {
  "nom": "Eradication Protocols — HALO OVERRIDE",
  "detach": "Haloscreed Battle Clade",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "relance des 1 pour blesser et pour toucher — unité HALO OVERRIDE",
  "effet": {
   "rrW": "ones",
   "rrH": "ones"
  }
 },
 {
  "nom": "Targeting Override",
  "detach": "Haloscreed Battle Clade",
  "pc": 1,
  "ph": "TC",
  "unites": [],
  "sauf": [],
  "aide": "touches critiques sur 5+",
  "effet": {
   "critH": 5
  }
 },
 {
  "nom": "Echoes of the Conduit Wars",
  "detach": "Luminen Auto-Choir",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Corpuscarii Electro-Priests",
   "Fulgurite Electro-Priests"
  ],
  "sauf": [],
  "aide": "relance des 1 pour toucher et pour blesser — cible à portée d'un objectif",
  "effet": {
   "rrH": "ones",
   "rrW": "ones"
  }
 },
 {
  "nom": "Lethal Dosage",
  "detach": "Rad-Zone Corps",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES FATALES] au tir",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Pre-Calibrated Purge Solution",
  "detach": "Rad-Zone Corps",
  "pc": 1,
  "ph": "T",
  "unites": [],
  "sauf": [],
  "aide": "relance des touches — cible dans la zone de déploiement adverse",
  "effet": {
   "rrH": "failed"
  }
 },
 {
  "nom": "Binharic Offence",
  "detach": "Skitarii Hunter Cohort",
  "pc": 2,
  "ph": "TC",
  "unites": [
   "Archaeopter Fusilave",
   "Archaeopter Stratoraptor",
   "Archaeopter Transvector",
   "Hastarii Exterminators",
   "Hastarii Fusiliers",
   "Ironstrider Ballistarii",
   "Onager Dunecrawler",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Skitarii Marshal",
   "Skitarii Rangers",
   "Skitarii Vanguard",
   "Skorpius Disintegrator",
   "Skorpius Dunerider",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros"
  ],
  "sauf": [],
  "aide": "+1 en PA — deux unités SKITARII sur la même cible",
  "effet": {
   "apMod": 1
  }
 },
 {
  "nom": "Isolate and Destroy",
  "detach": "Skitarii Hunter Cohort",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Ironstrider Ballistarii",
   "Pteraxii Skystalkers",
   "Pteraxii Sterylizors",
   "Serberys Raiders",
   "Serberys Sulphurhounds",
   "Sicarian Infiltrators",
   "Sicarian Ruststalkers",
   "Sydonian Dragoons with radium jezzails",
   "Sydonian Dragoons with taser lances",
   "Sydonian Skatros"
  ],
  "sauf": [],
  "aide": "+1 pour blesser — aucune autre unité ennemie à 6\" de la cible",
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

enregistreFaction({
  cle : "mechanicus",
  nom : "Adeptus Mechanicus",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
